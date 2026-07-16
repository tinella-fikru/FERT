import { supabaseAnon } from '../utils/supabase'

/** GET /api/tibeb — available tibeb patterns for the order wizard */
export default defineEventHandler(async () => {
  const { data, error } = await supabaseAnon()
    .from('tibeb_patterns')
    .select('*')
    .eq('available', true)
    .order('price_delta_etb')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load tibeb patterns' })
  }
  return data
})
