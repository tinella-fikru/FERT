import { createHmac, timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '../../utils/supabase'
import { chapaVerify } from '../../utils/chapa'
import { settleVerifiedPayment } from '../../utils/payments'

/**
 * POST /api/webhooks/chapa — payment confirmation from Chapa (server-to-server).
 *
 * Security model:
 *  1. HMAC-SHA256 signature check (timing-safe) against CHAPA_WEBHOOK_SECRET.
 *     Chapa sends `Chapa-Signature` = HMAC(payload, secret) and
 *     `x-chapa-signature` = HMAC(secret, secret); either passing is accepted.
 *  2. The payload is NEVER trusted for state changes — we re-verify the
 *     transaction server-to-server with Chapa and trust only that response.
 *  3. Idempotency via the `payments` ledger (unique tx_ref).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = config.chapaWebhookSecret
  if (!secret) {
    console.error(JSON.stringify({ event: 'webhook_misconfigured', detail: 'CHAPA_WEBHOOK_SECRET missing' }))
    throw createError({ statusCode: 500, statusMessage: 'Webhook not configured' })
  }

  // --- 1. Signature verification (raw body, timing-safe) ---------------------
  const rawBody = (await readRawBody(event, 'utf8')) ?? ''
  const payloadDigest = createHmac('sha256', secret).update(rawBody).digest('hex')
  const secretDigest = createHmac('sha256', secret).update(secret).digest('hex')

  const signatureOk = ['chapa-signature', 'x-chapa-signature'].some((header) => {
    const received = getHeader(event, header)
    if (!received) return false
    return [payloadDigest, secretDigest].some((expected) => {
      const a = Buffer.from(received)
      const b = Buffer.from(expected)
      return a.length === b.length && timingSafeEqual(a, b)
    })
  })

  if (!signatureOk) {
    console.warn(JSON.stringify({ event: 'webhook_bad_signature' }))
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  // --- 2. Extract tx_ref, then verify server-to-server -----------------------
  let payload: { tx_ref?: string; trx_ref?: string } = {}
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }
  const txRef = payload.tx_ref ?? payload.trx_ref
  if (!txRef || typeof txRef !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing tx_ref' })
  }

  const db = supabaseAdmin()
  const { data: order } = await db
    .from('orders')
    .select('*, garments(name, slug), tibeb_patterns(name), customers(email, full_name)')
    .eq('chapa_tx_ref', txRef)
    .maybeSingle()

  if (!order) {
    console.warn(JSON.stringify({ event: 'webhook_unknown_tx_ref', tx_ref: txRef }))
    // Signature was valid — acknowledge so Chapa stops retrying.
    return { received: true }
  }

  const verification = await chapaVerify(txRef)
  const amountMatches =
    verification &&
    Math.abs(Number(verification.amount) - Number(order.total_etb)) < 0.01 &&
    verification.currency === 'ETB'

  if (verification?.status === 'success' && amountMatches) {
    await settleVerifiedPayment(
      db,
      order,
      {
        txRef,
        amount: Number(verification.amount),
        currency: verification.currency,
        chapaStatus: verification.status,
        rawPayload: payload,
      },
      { email: order.customers?.email ?? '', full_name: order.customers?.full_name ?? null },
    )
  } else {
    console.warn(
      JSON.stringify({
        event: 'webhook_unverified',
        order_id: order.id,
        tx_ref: txRef,
        chapa_status: verification?.status ?? 'unreachable',
        amount_matches: !!amountMatches,
      }),
    )
  }

  // Always 200 after a valid signature so Chapa does not retry forever.
  return { received: true }
})
