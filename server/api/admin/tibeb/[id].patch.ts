import { designInputSchema } from '~/shared/designSchema'
import { requireAdmin } from '../../../utils/auth'
import { supabaseAdmin } from '../../../utils/supabase'

/** PATCH /api/admin/tibeb/:id — edit an existing tibeb design. Admin only. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

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
    .update({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      story: input.story || null,
      price_delta_etb: input.price_delta_etb,
      image_urls: input.image_urls,
      image_url: input.image_urls[0] ?? null,
      available: input.available,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A design with this slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: `Could not update design: ${error.message}` })
  }

  return data
})
