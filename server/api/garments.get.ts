import { supabaseAnon } from '../utils/supabase'
import { isPreviewMode, MOCK_GARMENTS } from '../utils/mockData'

/**
 * GET /api/garments?collection=<slug>&category=<category>
 * Published garments, optionally filtered.
 */
export default defineEventHandler(async (event) => {
  const { collection, category } = getQuery(event)

  if (isPreviewMode()) {
    return MOCK_GARMENTS.filter(
      (g) =>
        (!collection || g.collections?.slug === collection) &&
        (!category || g.category === category),
    )
  }

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
    // Schema not applied yet — serve the preview catalog instead of failing.
    console.warn(JSON.stringify({ event: 'catalog_fallback', table: 'garments', reason: error.message }))
    return MOCK_GARMENTS.filter(
      (g) =>
        (!collection || g.collections?.slug === collection) &&
        (!category || g.category === category),
    )
  }

  // Collection filter applied post-join (PostgREST nested filter on aliased join)
  if (typeof collection === 'string' && collection) {
    return data.filter((g) => g.collections?.slug === collection)
  }
  return data
})
