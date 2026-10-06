/**
 * Appointment slot rules — single source of truth (server-side).
 *
 * Store: Bole, Addis Ababa — Africa/Addis_Ababa is UTC+3 year-round (no DST),
 * so a fixed offset is safe. Hourly slots, Monday–Saturday; first start 09:00,
 * last start 17:00 (atelier closes at 18:00).
 */

const TZ_OFFSET_MS = 3 * 60 * 60 * 1000 // UTC+3
export const FIRST_SLOT_HOUR = 9
export const LAST_SLOT_HOUR = 17
export const MAX_BOOKING_DAYS = 30

/** Shift a UTC instant to "Addis wall clock" expressed as a UTC Date. */
function toAddis(date: Date): Date {
  return new Date(date.getTime() + TZ_OFFSET_MS)
}

/** Is this instant a bookable slot start? (hourly, store hours, Mon–Sat, future, within window) */
export function isValidSlotStart(iso: string, now = new Date()): boolean {
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return false

  const addis = toAddis(t)
  if (addis.getUTCMinutes() !== 0 || addis.getUTCSeconds() !== 0 || addis.getUTCMilliseconds() !== 0) return false
  const hour = addis.getUTCHours()
  if (hour < FIRST_SLOT_HOUR || hour > LAST_SLOT_HOUR) return false
  if (addis.getUTCDay() === 0) return false // Sunday closed

  if (t.getTime() <= now.getTime()) return false
  if (t.getTime() > now.getTime() + MAX_BOOKING_DAYS * 24 * 60 * 60 * 1000) return false
  return true
}

/** All candidate slot starts (ISO) for the next `days` days, excluding past/closed. */
export function generateSlotCandidates(days: number, now = new Date()): string[] {
  const slots: string[] = []
  const addisNow = toAddis(now)
  // Midnight (Addis) of today, expressed back in UTC.
  const dayStartUtc = Date.UTC(
    addisNow.getUTCFullYear(), addisNow.getUTCMonth(), addisNow.getUTCDate(),
  ) - TZ_OFFSET_MS

  for (let d = 0; d <= days; d++) {
    for (let h = FIRST_SLOT_HOUR; h <= LAST_SLOT_HOUR; h++) {
      const t = new Date(dayStartUtc + d * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000)
      const iso = t.toISOString()
      if (isValidSlotStart(iso, now)) slots.push(iso)
    }
  }
  return slots
}

/** Addis-local date (YYYY-MM-DD) and morning/afternoon bucket for a slot. */
export function slotToPreference(iso: string): { date: string; time: 'morning' | 'afternoon' } {
  const addis = toAddis(new Date(iso))
  return {
    date: addis.toISOString().slice(0, 10),
    time: addis.getUTCHours() < 12 ? 'morning' : 'afternoon',
  }
}
