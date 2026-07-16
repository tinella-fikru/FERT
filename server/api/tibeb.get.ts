import { supabaseAnon } from '../utils/supabase'
import { isPreviewMode, MOCK_TIBEB } from '../utils/mockData'

/** GET /api/tibeb — available tibeb patterns for the order wizard */
export default defineEventHandler(async () => {
  if (isPreviewMode()) return MOCK_TIBEB

  const { data, error } = await supabaseAnon()
    .from('tibeb_patterns')
    .select('*')
    .eq('available', true)
    .order('price_delta_etb')

  if (error) {
    // Schema not applied yet — fall back to the preview patterns.
    console.warn(JSON.stringify({ event: 'catalog_fallback', table: 'tibeb_patterns', reason: error.message }))
    return MOCK_TIBEB
  }
  return data
})
