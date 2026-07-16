import type { H3Event } from 'h3'
import { clerkClient, getAuth } from '@clerk/nuxt/server'
import { supabaseAdmin } from './supabase'

/**
 * Requires a signed-in Clerk user; returns (creating if needed)
 * the matching row in `customers`.
 */
export async function requireCustomer(event: H3Event) {
  const { userId } = getAuth(event)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const db = supabaseAdmin()
  const { data: existing } = await db
    .from('customers')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (existing) return existing

  // First contact — mirror the Clerk user into customers.
  const user = await clerkClient(event).users.getUser(userId)
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null

  const { data: created, error } = await db
    .from('customers')
    .insert({ clerk_user_id: userId, email, full_name: fullName })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create customer record' })
  }
  return created
}

/**
 * Requires the signed-in user's email to be in NUXT_ADMIN_EMAILS.
 */
export async function requireAdmin(event: H3Event) {
  const { userId } = getAuth(event)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const user = await clerkClient(event).users.getUser(userId)
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ''
  const admins = (useRuntimeConfig().adminEmails as string)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!admins.includes(email)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return { userId, email }
}
