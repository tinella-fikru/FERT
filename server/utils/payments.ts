import type { SupabaseClient } from '@supabase/supabase-js'
import { sendOrderConfirmation } from './email'

interface VerifiedPayment {
  txRef: string
  amount: number
  currency: string
  chapaStatus: string
  rawPayload?: unknown
}

/**
 * Idempotently settle a verified Chapa payment:
 *  1. record it in the `payments` ledger (tx_ref unique = idempotency key)
 *  2. mark the order paid (guarded update — only from pending_payment)
 *  3. log the status event and send the confirmation email
 *
 * Safe to call from both the webhook and the client-driven verify endpoint;
 * whichever arrives second becomes a no-op.
 */
export async function settleVerifiedPayment(
  db: SupabaseClient,
  order: {
    id: string
    order_number: string
    status: string
    total_etb: number
    estimated_ready_date: string | null
    garments?: { name: string } | null
    tibeb_patterns?: { name: string } | null
  },
  payment: VerifiedPayment,
  customer: { email: string; full_name: string | null },
): Promise<{ settled: boolean; alreadyProcessed: boolean }> {
  // 1. Ledger insert — on conflict (tx_ref) do nothing.
  const { data: ledgerRows, error: ledgerError } = await db
    .from('payments')
    .upsert(
      {
        order_id: order.id,
        tx_ref: payment.txRef,
        amount_etb: payment.amount,
        currency: payment.currency,
        chapa_status: payment.chapaStatus,
        raw_payload: payment.rawPayload ?? null,
      },
      { onConflict: 'tx_ref', ignoreDuplicates: true },
    )
    .select('id')

  if (ledgerError) {
    console.error(
      JSON.stringify({ event: 'payment_ledger_failed', order_id: order.id, tx_ref: payment.txRef, error: ledgerError.message }),
    )
    throw createError({ statusCode: 500, statusMessage: 'Could not record payment' })
  }

  const alreadyProcessed = !ledgerRows || ledgerRows.length === 0

  // 2. Guarded order update (no-op if a concurrent settle already ran).
  const { data: updated } = await db
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', order.id)
    .eq('status', 'pending_payment')
    .select('id')

  const settled = !!updated && updated.length > 0
  if (!settled) {
    return { settled: false, alreadyProcessed }
  }

  // 3. Event log + email (email failure never fails the settlement).
  await db.from('order_status_events').insert({
    order_id: order.id,
    status: 'paid',
    note: 'Payment verified via Chapa',
  })

  console.log(JSON.stringify({ event: 'payment_settled', order_id: order.id, tx_ref: payment.txRef }))

  try {
    await sendOrderConfirmation({ order, customer })
  } catch (e) {
    console.error(JSON.stringify({ event: 'email_failed', order_id: order.id, error: String(e) }))
  }

  return { settled: true, alreadyProcessed }
}
