import { requireCustomer } from '../utils/auth'
import { supabaseAdmin } from '../utils/supabase'

/** GET /api/my-orders — the signed-in customer's orders, newest first */
export default defineEventHandler(async (event) => {
  const customer = await requireCustomer(event)

  const { data, error } = await supabaseAdmin()
    .from('orders')
    .select('*, garments(name, slug, category), tibeb_patterns(name)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load orders' })
  }
  return data
})
