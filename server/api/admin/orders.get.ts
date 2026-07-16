import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/** GET /api/admin/orders — all orders with customer + garment info */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { data, error } = await supabaseAdmin()
    .from('orders')
    .select('*, customers(full_name, email, phone), garments(name, slug, category), tibeb_patterns(name)')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load orders' })
  }
  return data
})
