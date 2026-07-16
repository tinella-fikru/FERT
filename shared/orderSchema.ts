import { z } from 'zod'

/**
 * Order wizard validation — shared by the client wizard (UX)
 * and POST /api/orders (authoritative).
 */

export const measurementFields = [
  { key: 'bust', label: 'Bust / Chest', min: 40, max: 200 },
  { key: 'waist', label: 'Waist', min: 40, max: 200 },
  { key: 'hips', label: 'Hips', min: 40, max: 200 },
  { key: 'shoulder', label: 'Shoulder width', min: 25, max: 80 },
  { key: 'sleeve', label: 'Sleeve length', min: 20, max: 90 },
  { key: 'length', label: 'Garment length', min: 50, max: 200 },
] as const

const measurementsSchema = z.object(
  Object.fromEntries(
    measurementFields.map((f) => [
      f.key,
      z
        .number({ message: `${f.label} is required` })
        .min(f.min, `${f.label} must be at least ${f.min} cm`)
        .max(f.max, `${f.label} must be at most ${f.max} cm`),
    ]),
  ) as Record<string, z.ZodNumber>,
)

export const orderInputSchema = z
  .object({
    garment_slug: z.string().min(1, 'Choose a garment'),
    tibeb_slug: z.string().min(1, 'Choose a tibeb pattern'),
    sizing_mode: z.enum(['standard', 'custom']),
    size_label: z.string().optional(),
    measurements: measurementsSchema.optional(),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.sizing_mode === 'standard' && !val.size_label) {
      ctx.addIssue({
        code: 'custom',
        path: ['size_label'],
        message: 'Select a size',
      })
    }
    if (val.sizing_mode === 'custom' && !val.measurements) {
      ctx.addIssue({
        code: 'custom',
        path: ['measurements'],
        message: 'Measurements are required for custom sizing',
      })
    }
  })

export type OrderInput = z.infer<typeof orderInputSchema>
