/**
 * Shared domain types for FERT.
 * Mirrors supabase/schema.sql.
 */

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_workshop'
  | 'quality_check'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled'

export type GarmentCategory =
  | 'habesha_kemis'
  | 'netela'
  | 'mens_suit'
  | 'shirt'
  | 'accessory'

export interface Collection {
  id: string
  slug: string
  name: string
  description: string | null
  season: string | null
  hero_image_url: string | null
  sort_order: number
  published: boolean
}

export interface Garment {
  id: string
  collection_id: string | null
  slug: string
  name: string
  category: GarmentCategory
  description: string | null
  story: string | null
  base_price_etb: number
  lead_time_days: number
  made_to_order: boolean
  image_urls: string[]
  published: boolean
  sort_order: number
  collections?: Pick<Collection, 'slug' | 'name'> | null
}

export interface TibebPattern {
  id: string
  slug: string
  name: string
  description: string | null
  price_delta_etb: number
  image_url: string | null
  available: boolean
}

export interface Measurements {
  bust?: number
  waist?: number
  hips?: number
  shoulder?: number
  sleeve?: number
  length?: number
  [key: string]: number | undefined
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  garment_id: string
  tibeb_pattern_id: string | null
  status: OrderStatus
  size_label: string | null
  measurements: Measurements | null
  notes: string | null
  base_price_etb: number
  tibeb_delta_etb: number
  total_etb: number
  chapa_tx_ref: string | null
  paid_at: string | null
  estimated_ready_date: string | null
  created_at: string
  garments?: Pick<Garment, 'name' | 'slug' | 'category'> | null
  tibeb_patterns?: Pick<TibebPattern, 'name'> | null
}

export interface Appointment {
  id: string
  customer_id: string | null
  full_name: string
  email: string
  phone: string | null
  preferred_date: string
  preferred_time: 'morning' | 'afternoon'
  purpose: string | null
  status: AppointmentStatus
  admin_note: string | null
  created_at: string
}

/** Human-readable labels for categories */
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  habesha_kemis: 'Habesha Kemis',
  netela: 'Netela',
  mens_suit: "Men's Suit",
  shirt: 'Shirt',
  accessory: 'Accessory',
}

/** Order pipeline in display order */
export const ORDER_PIPELINE: { status: OrderStatus; label: string }[] = [
  { status: 'pending_payment', label: 'Awaiting payment' },
  { status: 'paid', label: 'Confirmed' },
  { status: 'in_workshop', label: 'In the workshop' },
  { status: 'quality_check', label: 'Quality check' },
  { status: 'ready', label: 'Ready' },
  { status: 'delivered', label: 'Delivered' },
]

/** Standard sizes offered alongside custom measurements */
export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

export function formatEtb(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(amount)
}
