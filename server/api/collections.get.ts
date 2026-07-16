import { supabaseAnon } from '../utils/supabase'
import { isPreviewMode, MOCK_COLLECTIONS } from '../utils/mockData'

/** GET /api/collections — published collections in display order */
export default defineEventHandler(async () => {
  if (isPreviewMode()) return MOCK_COLLECTIONS

  const { data, error } = await supabaseAnon()
    .from('collections')
    .select('*')
    .eq('published', true)
    .order('sort_order')

  if (error) {
    // Schema not applied yet — serve the preview catalog instead of failing.
    console.warn(JSON.stringify({ event: 'catalog_fallback', table: 'collections', reason: error.message }))
    return MOCK_COLLECTIONS
  }
  return data
})
