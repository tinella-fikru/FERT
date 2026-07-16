import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/** GET /api/admin/appointments — upcoming first */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { data, error } = await supabaseAdmin()
    .from('appointments')
    .select('*')
    .order('preferred_date', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load appointments' })
  }
  return data
})
