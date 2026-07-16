import { z } from 'zod'
import { getAuth } from '@clerk/nuxt/server'
import { supabaseAdmin } from '../utils/supabase'
import { sendAppointmentReceived } from '../utils/email'

const appointmentSchema = z.object({
  full_name: z.string().min(2, 'Your name is required').max(120),
  email: z.string().email('A valid email is required'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{9,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  preferred_date: z.string().refine((d) => {
    const date = new Date(d + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return !Number.isNaN(date.getTime()) && date > today
  }, 'Choose a future date'),
  preferred_time: z.enum(['morning', 'afternoon']),
  purpose: z.string().max(300).optional(),
})

/** POST /api/appointments — public booking request (auth optional) */
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

  // Sundays the atelier is closed
  const day = new Date(parsed.data.preferred_date + 'T00:00:00').getDay()
  if (day === 0) {
    throw createError({ statusCode: 400, statusMessage: 'The atelier is closed on Sundays' })
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

  const { data: appointment, error } = await db
    .from('appointments')
    .insert({
      customer_id: customerId,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      preferred_date: parsed.data.preferred_date,
      preferred_time: parsed.data.preferred_time,
      purpose: parsed.data.purpose || null,
      status: 'requested',
    })
    .select()
    .single()

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
