import { garmentInputSchema } from '~/shared/garmentSchema'
import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/**
 * POST /api/admin/garments — create a new design (garment). Admin only.
 * Resolves the optional collection slug to its id, then inserts.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const parsed = garmentInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid design',
      data: { issues: parsed.error.issues },
    })
  }
  const input = parsed.data

  const db = supabaseAdmin()

  // Resolve collection slug -> id (optional)
  let collectionId: string | null = null
  if (input.collection_slug) {
    const { data: collection } = await db
      .from('collections')
      .select('id')
      .eq('slug', input.collection_slug)
      .maybeSingle()
    if (!collection) {
      throw createError({ statusCode: 400, statusMessage: 'Unknown collection' })
    }
    collectionId = collection.id
  }

  const { data, error } = await db
    .from('garments')
    .insert({
      collection_id: collectionId,
      slug: input.slug,
      name: input.name,
      category: input.category,
      description: input.description || null,
      story: input.story || null,
      base_price_etb: input.base_price_etb,
      lead_time_days: input.lead_time_days,
      made_to_order: input.made_to_order,
      image_urls: input.image_urls,
      published: input.published,
      sort_order: input.sort_order,
    })
    .select('*, collections(slug, name)')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A design with this slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: `Could not save design: ${error.message}` })
  }

  return data
})
