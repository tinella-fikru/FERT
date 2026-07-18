import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/** GET /api/admin/garments — all designs (published or not), newest first */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { data, error } = await supabaseAdmin()
    .from('garments')
    .select('*, collections(slug, name)')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load designs' })
  }
  return data
})
