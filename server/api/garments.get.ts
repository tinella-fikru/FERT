import { supabaseAnon } from '../utils/supabase'

/**
 * GET /api/garments?collection=<slug>&category=<category>
 * Published garments, optionally filtered.
 */
export default defineEventHandler(async (event) => {
  const { collection, category } = getQuery(event)

  let query = supabaseAnon()
    .from('garments')
    .select('*, collections(slug, name)')
    .eq('published', true)
    .order('sort_order')

  if (typeof category === 'string' && category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load garments' })
  }

  // Collection filter applied post-join (PostgREST nested filter on aliased join)
  if (typeof collection === 'string' && collection) {
    return data.filter((g) => g.collections?.slug === collection)
  }
  return data
})
