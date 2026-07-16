import { supabaseAnon } from '../../utils/supabase'

/** GET /api/garments/:slug — single published garment with collection */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const { data, error } = await supabaseAnon()
    .from('garments')
    .select('*, collections(slug, name)')
    .eq('slug', slug!)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load garment' })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Garment not found' })
  }
  return data
})
