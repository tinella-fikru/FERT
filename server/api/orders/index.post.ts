import { orderInputSchema } from '~/shared/orderSchema'
import { requireCustomer } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'
import { chapaInitialize } from '../../utils/chapa'

/**
 * POST /api/orders — create a made-to-order garment order and
 * return the Chapa hosted-checkout URL.
 *
 * Authoritative validation: prices and lead times come from the DB,
 * never from the client.
 */
export default defineEventHandler(async (event) => {
  const customer = await requireCustomer(event)

  const body = await readBody(event)
  const parsed = orderInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid order',
      data: { issues: parsed.error.issues },
    })
  }
  const input = parsed.data

  const db = supabaseAdmin()

  // --- Load priced entities server-side --------------------------------------
  const [{ data: garment }, { data: tibeb }] = await Promise.all([
    db.from('garments').select('*').eq('slug', input.garment_slug).eq('published', true).maybeSingle(),
    db.from('tibeb_patterns').select('*').eq('slug', input.tibeb_slug).eq('available', true).maybeSingle(),
  ])

  if (!garment) throw createError({ statusCode: 400, statusMessage: 'Garment unavailable' })
  if (!tibeb) throw createError({ statusCode: 400, statusMessage: 'Tibeb pattern unavailable' })

  const basePrice = Number(garment.base_price_etb)
  const tibebDelta = Number(tibeb.price_delta_etb)
  const total = Math.round((basePrice + tibebDelta) * 100) / 100

  // --- Create order -----------------------------------------------------------
  const { data: orderNumber } = await db.rpc('next_order_number')
  const readyDate = new Date()
  readyDate.setDate(readyDate.getDate() + (garment.lead_time_days ?? 21))

  const { data: order, error } = await db
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      garment_id: garment.id,
      tibeb_pattern_id: tibeb.id,
      status: 'pending_payment',
      size_label: input.sizing_mode === 'standard' ? input.size_label : null,
      measurements: input.sizing_mode === 'custom' ? input.measurements : null,
      notes: input.notes ?? null,
      base_price_etb: basePrice,
      tibeb_delta_etb: tibebDelta,
      total_etb: total,
      estimated_ready_date: readyDate.toISOString().slice(0, 10),
    })
    .select()
    .single()

  if (error || !order) {
    console.error(JSON.stringify({ event: 'order_insert_failed', error: error?.message }))
    throw createError({ statusCode: 500, statusMessage: 'Could not create order' })
  }

  await db.from('order_status_events').insert({
    order_id: order.id,
    status: 'pending_payment',
    note: 'Order placed',
  })

  // --- Initialize Chapa checkout ----------------------------------------------
  const txRef = `${order.order_number}-${Math.floor(Date.now() / 1000)}`
  await db.from('orders').update({ chapa_tx_ref: txRef }).eq('id', order.id)

  const config = useRuntimeConfig()
  const checkoutUrl = await chapaInitialize({
    txRef,
    amountEtb: total,
    email: customer.email,
    fullName: customer.full_name,
    returnUrl: `${config.public.siteUrl}/order/confirmation?ref=${encodeURIComponent(txRef)}`,
  })

  console.log(JSON.stringify({ event: 'order_created', order_id: order.id, tx_ref: txRef, total }))

  setResponseStatus(event, 201)
  return { id: order.id, order_number: order.order_number, checkout_url: checkoutUrl }
})
