import { randomUUID } from 'node:crypto'
import { requireAdmin } from '../../utils/auth'
import { supabaseAdmin } from '../../utils/supabase'

/**
 * POST /api/admin/upload — multipart image upload to the `designs`
 * Storage bucket. Admin only. Returns the public URL of each file.
 *
 * The bucket must exist and be public:
 *   Supabase → Storage → New bucket → name "designs", Public.
 */

const BUCKET = 'designs'
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB per file
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const form = await readMultipartFormData(event)
  const files = (form ?? []).filter((p) => p.name === 'file' && p.filename && p.data?.length)

  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No image provided' })
  }

  const db = supabaseAdmin()
  const urls: string[] = []

  for (const file of files) {
    const type = file.type ?? ''
    if (!ALLOWED.has(type)) {
      throw createError({
        statusCode: 415,
        statusMessage: `Unsupported image type: ${type || 'unknown'}. Use JPG, PNG, WebP or AVIF.`,
      })
    }
    if (file.data.length > MAX_BYTES) {
      throw createError({
        statusCode: 413,
        statusMessage: `${file.filename} is larger than 8 MB.`,
      })
    }

    const path = `garments/${randomUUID()}.${EXT[type]}`
    const { error } = await db.storage.from(BUCKET).upload(path, file.data, {
      contentType: type,
      cacheControl: '31536000',
      upsert: false,
    })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: /bucket/i.test(error.message)
          ? 'Storage bucket "designs" not found — create it in Supabase → Storage (public).'
          : `Upload failed: ${error.message}`,
      })
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return { urls }
})
