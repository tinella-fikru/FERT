import { z } from 'zod'

/**
 * Garment (design) validation — shared by the admin upload form (UX)
 * and POST /api/admin/garments (authoritative). Mirrors the `garments`
 * table in supabase/schema.sql.
 */

export const garmentCategories = [
  { value: 'habesha_kemis', label: 'Habesha Kemis' },
  { value: 'netela', label: 'Netela' },
  { value: 'mens_suit', label: "Men's Suit" },
  { value: 'shirt', label: 'Shirt' },
  { value: 'accessory', label: 'Accessory' },
] as const

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Turn a name into a URL-safe slug: "Demera Kemis" -> "demera-kemis" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const garmentInputSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .max(120)
    .regex(slugPattern, 'Use lowercase letters, numbers and dashes only'),
  category: z.enum(['habesha_kemis', 'netela', 'mens_suit', 'shirt', 'accessory'], {
    message: 'Choose a category',
  }),
  collection_slug: z.string().min(1).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  story: z.string().max(2000).optional().nullable(),
  base_price_etb: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0')
    .max(10_000_000),
  lead_time_days: z
    .number({ message: 'Lead time is required' })
    .int('Whole days only')
    .min(1, 'At least 1 day')
    .max(365),
  made_to_order: z.boolean().default(true),
  image_urls: z
    .array(z.string().min(1))
    .min(1, 'Add at least one photo')
    .max(8, 'Up to 8 photos'),
  published: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
})

export type GarmentInput = z.infer<typeof garmentInputSchema>
