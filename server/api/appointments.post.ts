import { z } from 'zod'
import { getAuth } from '@clerk/nuxt/server'
import { supabaseAdmin } from '../utils/supabase'
import { sendAppointmentReceived } from '../utils/email'
import { isValidSlotStart, slotToPreference } from '../utils/slots'

const appointmentSchema = z.object({
  full_name: z.string().min(2, 'Your name is required').max(120),
  email: z.string().email('A valid email is required'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{9,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  scheduled_at: z.string().refine((iso) => isValidSlotStart(iso), 'Choose an available time slot'),
  purpose: z.string().max(300).optional(),
})

/** POST /api/appointments — book an exact hourly slot (auth optional) */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = appointmentSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid request',
      data: { issues: parsed.error.issues },
    })
  }

  const db = supabaseAdmin()

  // Link to customer record if signed in
  let customerId: string | null = null
  const { userId } = getAuth(event)
  if (userId) {
    const { data } = await db
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle()
    customerId = data?.id ?? null
  }

  const scheduledAt = new Date(parsed.data.scheduled_at).toISOString()
  const preference = slotToPreference(scheduledAt)

  const { data: appointment, error } = await db
    .from('appointments')
    .insert({
      customer_id: customerId,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      preferred_date: preference.date,
      preferred_time: preference.time,
      scheduled_at: scheduledAt,
      purpose: parsed.data.purpose || null,
      status: 'requested',
    })
    .select()
    .single()

  if (error?.code === '23505') {
    // Unique slot index — someone booked this slot first.
    throw createError({ statusCode: 409, statusMessage: 'slot_taken' })
  }
  if (error || !appointment) {
    console.error(JSON.stringify({ event: 'appointment_insert_failed', error: error?.message }))
    throw createError({ statusCode: 500, statusMessage: 'Could not book appointment' })
  }

  try {
    await sendAppointmentReceived({ appointment })
  } catch (e) {
    console.error(JSON.stringify({ event: 'email_failed', appointment_id: appointment.id, error: String(e) }))
  }

  setResponseStatus(event, 201)
  return { id: appointment.id }
})
