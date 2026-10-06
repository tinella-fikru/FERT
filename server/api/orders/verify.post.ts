import { requireCustomer } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'
import { chapaVerify } from '../../utils/chapa'
import { settleVerifiedPayment } from '../../utils/payments'

/**
 * POST /api/orders/verify — body { ref }
 * Called by the confirmation page after Chapa redirects back.
 * Verifies server-to-server with Chapa, then (idempotently) settles the
 * payment via the shared ledger helper (same path as the webhook).
 */
export default defineEventHandler(async (event) => {
  const customer = await requireCustomer(event)
  const { ref } = await readBody<{ ref?: string }>(event)

  if (!ref || typeof ref !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing payment reference' })
  }

  const db = supabaseAdmin()
  const { data: order } = await db
    .from('orders')
    .select('*, garments(name, slug), tibeb_patterns(name)')
    .eq('chapa_tx_ref', ref)
    .eq('customer_id', customer.id)
    .maybeSingle()

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  // Already settled — idempotent success.
  if (order.status !== 'pending_payment') {
    return { status: order.status, order_number: order.order_number }
  }

  const verification = await chapaVerify(ref)
  const amountMatches =
    verification &&
    Math.abs(Number(verification.amount) - Number(order.total_etb)) < 0.01 &&
    verification.currency === 'ETB'

  if (verification?.status === 'success' && amountMatches) {
    await settleVerifiedPayment(
      db,
      order,
      {
        txRef: ref,
        amount: Number(verification.amount),
        currency: verification.currency,
        chapaStatus: verification.status,
      },
      customer,
    )

    return { status: 'paid', order_number: order.order_number }
  }

  console.warn(
    JSON.stringify({ event: 'payment_unverified', order_id: order.id, tx_ref: ref, chapa_status: verification?.status ?? 'unreachable' }),
  )
  return { status: 'pending_payment', order_number: order.order_number }
})
