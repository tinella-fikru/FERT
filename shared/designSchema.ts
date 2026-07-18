import { z } from 'zod'

/**
 * Tibeb design validation — the embroidered-border designs the admin uploads.
 * Shared by the admin design form (UX) and POST /api/admin/tibeb
 * (authoritative). Mirrors the `tibeb_patterns` table.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Turn a name into a URL-safe slug: "Demera Gold" -> "demera-gold" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const designInputSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .max(120)
    .regex(slugPattern, 'Use lowercase letters, numbers and dashes only'),
  description: z.string().max(500).optional().nullable(),
  story: z.string().max(2000).optional().nullable(),
  price_delta_etb: z
    .number({ message: 'Price is required' })
    .min(0, 'Cannot be negative')
    .max(10_000_000),
  image_urls: z
    .array(z.string().min(1))
    .min(1, 'Add at least one photo')
    .max(8, 'Up to 8 photos'),
  available: z.boolean().default(true),
})

export type DesignInput = z.infer<typeof designInputSchema>
