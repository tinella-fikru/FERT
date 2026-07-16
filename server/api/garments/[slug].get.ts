import { supabaseAnon } from '../../utils/supabase'
import { isPreviewMode, MOCK_GARMENTS } from '../../utils/mockData'

/** GET /api/garments/:slug — single published garment with collection */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (isPreviewMode()) {
    const garment = MOCK_GARMENTS.find((g) => g.slug === slug)
    if (!garment) {
      throw createError({ statusCode: 404, statusMessage: 'Garment not found' })
    }
    return garment
  }

  const { data, error } = await supabaseAnon()
    .from('garments')
    .select('*, collections(slug, name)')
    .eq('slug', slug!)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    // Schema not applied yet — fall back to the preview catalog.
    console.warn(JSON.stringify({ event: 'catalog_fallback', table: 'garments', reason: error.message }))
    const garment = MOCK_GARMENTS.find((g) => g.slug === slug)
    if (!garment) {
      throw createError({ statusCode: 404, statusMessage: 'Garment not found' })
    }
    return garment
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Garment not found' })
  }
  return data
})
