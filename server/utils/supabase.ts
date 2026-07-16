import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _admin: SupabaseClient | undefined
let _anon: SupabaseClient | undefined

/**
 * Service-role client — full access, server only.
 * Used for orders, customers, appointments, admin operations.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const config = useRuntimeConfig()
    _admin = createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return _admin
}

/**
 * Anon client — published-catalog reads only (RLS enforced).
 */
export function supabaseAnon(): SupabaseClient {
  if (!_anon) {
    const config = useRuntimeConfig()
    _anon = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
      auth: { persistSession: false },
    })
  }
  return _anon
}
