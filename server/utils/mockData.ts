import type { Collection, Garment, TibebPattern } from '~/shared/types'

/**
 * Preview-mode catalog — served when NUXT_PUBLIC_SUPABASE_URL is not set,
 * so the storefront can be reviewed before any services are configured.
 * Mirrors supabase/seed.sql.
 */

export const isPreviewMode = () => !useRuntimeConfig().public.supabaseUrl

const c = (id: string, slug: string, name: string, description: string, season: string, sort: number): Collection => ({
  id, slug, name, description, season, hero_image_url: null, sort_order: sort, published: true,
})

export const MOCK_COLLECTIONS: Collection[] = [
  c('col-1', 'meskel', 'Meskel', 'A celebration collection for the Finding of the True Cross — luminous whites, bonfire golds, garments made for procession and gathering.', 'Meskerem 2019', 1),
  c('col-2', 'timket', 'Timket', 'Ceremonial dress for Epiphany — flowing netela, layered kemis, and the discipline of white cotton against highland light.', 'Tir 2019', 2),
  c('col-3', 'atelier-line', 'Atelier Line', 'Everyday habesha dressing — simplified silhouettes, refined menen cotton, tibeb reduced to a single quiet line.', 'Permanent', 3),
]

const g = (
  id: string, colIdx: number, slug: string, name: string, category: Garment['category'],
  description: string, story: string, price: number, lead: number, sort: number,
): Garment => ({
  id, collection_id: MOCK_COLLECTIONS[colIdx].id, slug, name, category, description, story,
  base_price_etb: price, lead_time_days: lead, made_to_order: true, image_urls: [],
  published: true, sort_order: sort,
  collections: { slug: MOCK_COLLECTIONS[colIdx].slug, name: MOCK_COLLECTIONS[colIdx].name },
})

export const MOCK_GARMENTS: Garment[] = [
  g('gar-1', 0, 'meskel-kemis-demera', 'Demera Kemis', 'habesha_kemis',
    'Full-length habesha kemis in handwoven menen cotton with a broad Meskel-gold tibeb at hem and cuff.',
    'Woven on traditional looms in Addis Ababa over fourteen days. The demera motif — ascending diamonds — recalls the bonfire around which Meskel turns. Each border is embroidered by a single artisan, start to finish.',
    18500, 21, 1),
  g('gar-2', 0, 'meskel-netela-ember', 'Ember Netela', 'netela',
    'Featherweight netela shawl, double-woven edge, ember-gold tibeb band.',
    'The netela is the most intimate of Ethiopian garments — worn to church, to mourning, to celebration. Ours is woven from the finest first-pass cotton, light enough to pass through a ring.',
    6800, 14, 2),
  g('gar-3', 0, 'meskel-suit-kaba', 'Kaba Suit', 'mens_suit',
    "Men's two-piece in heavyweight menen — mandarin-collar tunic and tapered trouser with matched tibeb.",
    'Cut for ceremony and comfort in equal measure. The collar band carries a narrowed version of the demera tibeb, mirrored at the trouser hem.',
    16200, 21, 3),
  g('gar-4', 1, 'timket-kemis-tabot', 'Tabot Kemis', 'habesha_kemis',
    'Ceremonial kemis with cathedral-length sleeves and layered white-on-white tibeb.',
    'Made for Timket processions: the white-on-white border only reveals itself in movement, when highland light passes across the weave.',
    21400, 28, 1),
  g('gar-5', 1, 'timket-netela-baptism', 'Baptism Netela', 'netela',
    'Classic ceremonial netela with fine silver-thread tibeb.',
    'The silver thread is twisted with cotton in the traditional manner so it drapes rather than stiffens — a technique held by few remaining weavers.',
    7900, 14, 2),
  g('gar-6', 2, 'atelier-shirt-menen', 'Menen Shirt', 'shirt',
    'Everyday shirt in soft-washed menen cotton, single tibeb line at the placket.',
    'The atelier line strips habesha dressing to its essentials. One line of tibeb, hand-embroidered, on a shirt made for every day.',
    5400, 10, 1),
  g('gar-7', 2, 'atelier-kemis-city', 'City Kemis', 'habesha_kemis',
    'Knee-length modern kemis, unlined menen, minimal gold tibeb at the neckline.',
    'A kemis for Addis — shortened, simplified, moving easily between office and evening.',
    12800, 18, 2),
  g('gar-8', 2, 'atelier-scarf-tilet', 'Tilet Scarf', 'accessory',
    'Narrow-loom scarf carrying a full-width tilet pattern.',
    "The whole scarf is border: tilet edge-to-edge, a concentrated piece of the weaver's art.",
    3600, 7, 3),
]

const t = (id: string, slug: string, name: string, description: string, delta: number): TibebPattern => ({
  id, slug, name, description, price_delta_etb: delta, image_url: null, available: true,
})

export const MOCK_TIBEB: TibebPattern[] = [
  t('tib-4', 'single-line', 'Single Line', 'One unbroken line of gold — the atelier signature. No supplement.', 0),
  t('tib-3', 'telsem', 'Telsem', 'Protective geometric band, the oldest pattern in our archive.', 900),
  t('tib-1', 'demera', 'Demera', 'Ascending diamond motif — the Meskel bonfire. Bold and celebratory.', 1200),
  t('tib-2', 'meskel-cross', 'Meskel Cross', 'Interlocking cross forms in the Axumite tradition.', 1500),
  t('tib-5', 'silver-thread', 'Silver Thread', 'White-and-silver ceremonial border, twisted-thread technique.', 2100),
]
