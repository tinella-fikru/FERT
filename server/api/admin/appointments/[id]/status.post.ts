import { z } from 'zod'
import { requireAdmin } from '../../../../utils/auth'
import { supabaseAdmin } from '../../../../utils/supabase'

const bodySchema = z.object({
  status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']),
  admin_note: z.string().max(500).optional(),
})

/** POST /api/admin/appointments/:id/status */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const { error } = await supabaseAdmin()
    .from('appointments')
    .update({ status: parsed.data.status, ...(parsed.data.admin_note ? { admin_note: parsed.data.admin_note } : {}) })
    .eq('id', id!)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Update failed' })
  }
  return { status: parsed.data.status }
})
