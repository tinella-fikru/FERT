import { supabaseAnon } from '../utils/supabase'

/** GET /api/collections — published collections in display order */
export default defineEventHandler(async () => {
  const { data, error } = await supabaseAnon()
    .from('collections')
    .select('*')
    .eq('published', true)
    .order('sort_order')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load collections' })
  }
  return data
})
