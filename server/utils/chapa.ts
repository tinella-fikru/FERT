/**
 * Chapa payment helpers (server only).
 * Docs: https://developer.chapa.co
 */

interface ChapaInitResponse {
  status: string
  data?: { checkout_url: string }
  message?: string
}

interface ChapaVerifyResponse {
  status: string
  data?: {
    status: 'success' | 'failed' | 'pending'
    amount: number
    currency: string
    tx_ref: string
  }
}

const CHAPA_BASE = 'https://api.chapa.co/v1'

export async function chapaInitialize(params: {
  txRef: string
  amountEtb: number
  email: string
  fullName: string | null
  returnUrl: string
}): Promise<string> {
  const config = useRuntimeConfig()
  const [firstName, ...rest] = (params.fullName ?? 'FERT Customer').split(' ')

  const res = await $fetch<ChapaInitResponse>(`${CHAPA_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.chapaSecretKey}` },
    body: {
      amount: params.amountEtb.toFixed(2),
      currency: 'ETB',
      email: params.email,
      first_name: firstName,
      last_name: rest.join(' ') || '-',
      tx_ref: params.txRef,
      return_url: params.returnUrl,
      'customization[title]': 'FERT Atelier', // Chapa title limit: 16 chars
      'customization[description]': 'Made-to-order garment',
    },
  }).catch((e) => {
    console.error(JSON.stringify({ event: 'chapa_init_failed', tx_ref: params.txRef, error: String(e) }))
    throw createError({ statusCode: 502, statusMessage: 'Payment provider unavailable' })
  })

  if (res.status !== 'success' || !res.data?.checkout_url) {
    console.error(JSON.stringify({ event: 'chapa_init_rejected', tx_ref: params.txRef, message: res.message }))
    throw createError({ statusCode: 502, statusMessage: 'Could not start payment' })
  }
  return res.data.checkout_url
}

/**
 * Server-to-server verification — the only trusted source of payment truth.
 */
export async function chapaVerify(txRef: string) {
  const config = useRuntimeConfig()
  const res = await $fetch<ChapaVerifyResponse>(
    `${CHAPA_BASE}/transaction/verify/${encodeURIComponent(txRef)}`,
    { headers: { Authorization: `Bearer ${config.chapaSecretKey}` } },
  ).catch(() => null)

  if (!res || res.status !== 'success' || !res.data) return null
  return res.data
}
