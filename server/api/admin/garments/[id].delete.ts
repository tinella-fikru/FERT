import { requireAdmin } from '../../../utils/auth'
import { supabaseAdmin } from '../../../utils/supabase'

/**
 * DELETE /api/admin/garments/:id — remove a garment (material). Admin only.
 * Blocked if any order references it (FK), returning a friendly message.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const { error } = await supabaseAdmin().from('garments').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      throw createError({
        statusCode: 409,
        statusMessage: 'This garment is used by existing orders. Unpublish it instead of deleting.',
      })
    }
    throw createError({ statusCode: 500, statusMessage: `Could not delete garment: ${error.message}` })
  }

  return { ok: true }
})
