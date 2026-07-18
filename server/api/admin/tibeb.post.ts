import { designInputSchema } from '~/shared/designSchema'
import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/**
 * POST /api/admin/tibeb — create a new tibeb design. Admin only.
 * The first image also fills the legacy `image_url` column for any
 * surface that still reads a single image.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const parsed = designInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid design',
      data: { issues: parsed.error.issues },
    })
  }
  const input = parsed.data

  const { data, error } = await supabaseAdmin()
    .from('tibeb_patterns')
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      story: input.story || null,
      price_delta_etb: input.price_delta_etb,
      image_urls: input.image_urls,
      image_url: input.image_urls[0] ?? null,
      available: input.available,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A design with this slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: `Could not save design: ${error.message}` })
  }

  return data
})
