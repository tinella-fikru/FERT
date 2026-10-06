import { supabaseAdmin } from '../../utils/supabase'
import { generateSlotCandidates, MAX_BOOKING_DAYS } from '../../utils/slots'

/**
 * GET /api/appointments/slots?days=14 — open hourly slots for the next N days.
 * Returns ISO slot starts grouped by Addis-local date, excluding booked slots.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = Math.min(Math.max(Number(query.days) || 14, 1), MAX_BOOKING_DAYS)

  const candidates = generateSlotCandidates(days)
  if (candidates.length === 0) return { slots: {} }

  const db = supabaseAdmin()
  const { data: booked, error } = await db
    .from('appointments')
    .select('scheduled_at')
    .in('status', ['requested', 'confirmed'])
    .gte('scheduled_at', candidates[0])
    .lte('scheduled_at', candidates[candidates.length - 1])

  if (error) {
    console.error(JSON.stringify({ event: 'slots_query_failed', error: error.message }))
    throw createError({ statusCode: 500, statusMessage: 'Could not load slots' })
  }

  const taken = new Set((booked ?? []).map((b) => new Date(b.scheduled_at).toISOString()))
  const open = candidates.filter((iso) => !taken.has(iso))

  // Group by Addis-local date for easy rendering.
  const slots: Record<string, string[]> = {}
  for (const iso of open) {
    const addisDate = new Date(new Date(iso).getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
    ;(slots[addisDate] ??= []).push(iso)
  }
  return { slots }
})
