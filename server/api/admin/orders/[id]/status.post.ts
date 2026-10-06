import { z } from 'zod'
import { requireAdmin } from '../../../../utils/auth'
import { sendFittingInvite } from '../../../../utils/email'
import { supabaseAdmin } from '../../../../utils/supabase'
import type { OrderStatus } from '~/shared/types'

/**
 * Order pipeline state machine — legal transitions only.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['in_workshop', 'cancelled'],
  in_workshop: ['quality_check', 'cancelled'],
  quality_check: ['ready', 'in_workshop'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
}

const bodySchema = z.object({
  to: z.enum(['paid', 'in_workshop', 'quality_check', 'ready', 'delivered', 'cancelled']),
  note: z.string().max(500).optional(),
})

/** POST /api/admin/orders/:id/status — advance an order through the pipeline */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const db = supabaseAdmin()
  const { data: order } = await db
    .from('orders')
    .select('id, status, order_number, customers(email, full_name)')
    .eq('id', id!)
    .maybeSingle()
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const from = order.status as OrderStatus
  const to = parsed.data.to
  if (!TRANSITIONS[from].includes(to)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Illegal transition: ${from} → ${to}`,
    })
  }

  const { data: updatedOrder, error } = await db
    .from('orders')
    .update({ status: to, ...(to === 'paid' ? { paid_at: new Date().toISOString() } : {}) })
    .eq('id', order.id)
    .eq('status', from) // optimistic concurrency guard
    .select('id')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Update failed' })
  }
  if (!updatedOrder) {
    throw createError({ statusCode: 409, statusMessage: 'Order status changed; refresh and try again' })
  }

  await db.from('order_status_events').insert({
    order_id: order.id,
    status: to,
    note: parsed.data.note ?? `Moved by admin (${from} → ${to})`,
  })

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers
  if (to === 'ready' && customer?.email) {
    const config = useRuntimeConfig()
    const bookingUrl = `${config.public.siteUrl}/appointments?order=${encodeURIComponent(order.order_number)}`
    try {
      await sendFittingInvite({
        order,
        customer,
        bookingUrl,
      })
    }
    catch (emailError) {
      console.error(JSON.stringify({
        event: 'fitting_invite_failed',
        order_id: order.id,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      }))
    }
  }

  console.log(JSON.stringify({ event: 'order_status_changed', order_id: order.id, from, to }))
  return { status: to }
})
