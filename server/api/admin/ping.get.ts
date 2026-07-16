import { requireAdmin } from '../../utils/auth'

/** GET /api/admin/ping — 200 iff the caller is an admin */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { ok: true }
})
