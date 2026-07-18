import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/** GET /api/admin/collections — all collections (for the design form dropdown) */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { data, error } = await supabaseAdmin()
    .from('collections')
    .select('*')
    .order('sort_order')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load collections' })
  }
  return data
})
