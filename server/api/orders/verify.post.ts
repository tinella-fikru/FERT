import { requireCustomer } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'
import { chapaVerify } from '../../utils/chapa'
import { sendOrderConfirmation } from '../../utils/email'

/**
 * POST /api/orders/verify — body { ref }
 * Called by the confirmation page after Chapa redirects back.
 * Verifies server-to-server with Chapa, then (idempotently) marks the
 * order paid, logs the event, and sends the confirmation email.
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
    await db
      .from('orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending_payment') // guard against concurrent verify

    await db.from('order_status_events').insert({
      order_id: order.id,
      status: 'paid',
      note: 'Payment verified via Chapa',
    })

    console.log(JSON.stringify({ event: 'payment_verified', order_id: order.id, tx_ref: ref }))

    // Email failure must never fail the verification response.
    try {
      await sendOrderConfirmation({ order, customer })
    } catch (e) {
      console.error(JSON.stringify({ event: 'email_failed', order_id: order.id, error: String(e) }))
    }

    return { status: 'paid', order_number: order.order_number }
  }

  console.warn(
    JSON.stringify({ event: 'payment_unverified', order_id: order.id, tx_ref: ref, chapa_status: verification?.status ?? 'unreachable' }),
  )
  return { status: 'pending_payment', order_number: order.order_number }
})
