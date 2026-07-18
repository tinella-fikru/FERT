import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/** GET /api/admin/tibeb — all tibeb designs (available or not), newest first */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { data, error } = await supabaseAdmin()
    .from('tibeb_patterns')
    .select('*')
    .order('price_delta_etb')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load designs' })
  }
  return data
})
