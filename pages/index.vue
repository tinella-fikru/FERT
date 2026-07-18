<script setup lang="ts">
import type { Collection, Garment } from '~/shared/types'
import { formatEtb, CATEGORY_LABELS } from '~/shared/types'
import { BRAND } from '~/shared/brand'

const { data: collections } = await useFetch<Collection[]>('/api/collections', {
  default: () => [],
})
const { data: garments } = await useFetch<Garment[]>('/api/garments', {
  default: () => [],
})

const featured = computed(() => garments.value.slice(0, 3))

// --- Animations -------------------------------------------------------------
const hero = ref<HTMLElement>()
const manifesto = ref<HTMLElement>()
const featuredSection = ref<HTMLElement>()
const collectionsSection = ref<HTMLElement>()
const appointmentSection = ref<HTMLElement>()

const { $gsap, $prefersReducedMotion } = useNuxtApp()

onMounted(() => {
  if (!hero.value || $prefersReducedMotion) return
  // Hero load choreography: wordmark chars rise, then eyebrow + CTA fade in.
  const ctx = $gsap.context(() => {
    $gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(
        '.hero-char',
        { opacity: 0, y: 60, rotateX: -40 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.06 },
      )
      .fromTo(
        '.hero-meta',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.3',
      )
  }, hero.value)
  onUnmounted(() => ctx.revert())
})

useReveal(manifesto)
useReveal(featuredSection, { children: true })
useReveal(collectionsSection, { children: true })
useReveal(appointmentSection)

useHead({
  title: 'FERT — Traditional Ethiopian Clothing, Addis Ababa',
})
</script>

<template>
  <div>
    <!-- ================= HERO ================= -->
    <section
      ref="hero"
      class="texture-paper relative flex min-h-[92dvh] flex-col justify-between overflow-hidden bg-ink text-paper"
    >
      <div class="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <img
          src="/images/fert-logo.jpg"
          alt=""
          aria-hidden="true"
          class="hero-meta h-28 w-28 object-cover sm:h-36 sm:w-36"
          width="144"
          height="144"
        />
        <h1
          class="font-display text-display-xl font-black text-gold"
          aria-label="FERT"
        >
          <span
            v-for="(ch, i) in 'FERT'"
            :key="i"
            class="hero-char inline-block"
            aria-hidden="true"
            >{{ ch }}</span
          >
        </h1>
      </div>

      <div
        class="flex flex-col gap-6 px-4 pb-10 sm:flex-row sm:items-end sm:justify-between sm:px-8"
      >
        <p class="hero-meta max-w-sm text-sm leading-relaxed text-paper/70">
          Traditional Ethiopian clothing, handwoven and made to order in our
          Addis Ababa atelier.
        </p>

        <!-- Social + contact -->
        <div class="hero-meta flex items-center gap-4">
          <a
            :href="BRAND.instagram"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FERT Design on Instagram"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper/60 transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            <BrandIcon name="instagram" />
          </a>
          <a
            :href="BRAND.facebook"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FERT Design on Facebook"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper/60 transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            <BrandIcon name="facebook" />
          </a>
          <a
            :href="BRAND.branches[0].mapUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FERT Design on Google Maps"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper/60 transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            <BrandIcon name="location" />
          </a>
          <span class="h-6 w-px bg-paper/20" aria-hidden="true" />
          <NuxtLink to="/collections" class="group flex items-center gap-3 label-caps text-paper">
            <span class="h-px w-10 bg-gold transition-all duration-300 group-hover:w-16" aria-hidden="true" />
            Discover the collections
          </NuxtLink>
        </div>
      </div>
    </section>

    <div class="rule-hard" aria-hidden="true" />

    <!-- ================= MANIFESTO ================= -->
    <section ref="manifesto" class="gsap-reveal mx-auto max-w-4xl px-4 py-section text-center sm:px-8">
      <p class="label-caps mb-6 text-gold-deep">The Maison</p>
      <p class="font-display text-display-md leading-snug">
        Every garment begins on the loom.<br class="hidden sm:block" />
        Menen cotton, tibeb borders, and the hands of
        <em class="text-gold-deep">Addis Ababa's</em> finest weavers.
      </p>
    </section>

    <!-- ================= FEATURED GARMENTS ================= -->
    <section class="border-t border-line">
      <div class="mx-auto max-w-7xl px-4 py-section sm:px-8">
        <div class="mb-12 flex items-end justify-between">
          <h2 class="font-display text-display-lg">Featured</h2>
          <NuxtLink to="/garments" class="link-editorial label-caps">View all</NuxtLink>
        </div>

        <div ref="featuredSection" class="grid gap-8 sm:grid-cols-3">
          <NuxtLink
            v-for="g in featured"
            :key="g.id"
            :to="`/garments/${g.slug}`"
            class="gsap-reveal group block"
          >
            <div class="overflow-hidden">
              <div class="transition-transform duration-500 ease-editorial group-hover:scale-[1.03]">
                <GarmentImage
                  :src="g.image_urls[0]"
                  :alt="g.name"
                  :label="CATEGORY_LABELS[g.category]"
                  :tone="['dark', 'light', 'gold'][featured.indexOf(g) % 3] as 'dark' | 'light' | 'gold'"
                />
              </div>
            </div>
            <div class="mt-4 flex items-baseline justify-between">
              <h3 class="font-display text-lg">{{ g.name }}</h3>
              <p class="font-mono text-sm tabular-nums">{{ formatEtb(g.base_price_etb) }}</p>
            </div>
            <p class="label-caps mt-1 text-ink-soft">{{ CATEGORY_LABELS[g.category] }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ================= COLLECTIONS STRIP ================= -->
    <section class="border-t-[3px] border-ink bg-ink text-paper">
      <div class="mx-auto max-w-7xl px-4 py-section sm:px-8">
        <p class="label-caps mb-10 text-gold">Collections</p>
        <div ref="collectionsSection" class="divide-y divide-paper/15">
          <NuxtLink
            v-for="c in collections"
            :key="c.id"
            :to="`/collections/${c.slug}`"
            class="gsap-reveal group flex items-baseline justify-between gap-4 py-6"
          >
            <span class="font-display text-display-md transition-colors group-hover:text-gold">
              {{ c.name }}
            </span>
            <span class="label-caps shrink-0 text-paper/50">{{ c.season }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ================= APPOINTMENT CTA ================= -->
    <section ref="appointmentSection" class="gsap-reveal">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-section sm:px-8 md:grid-cols-2 md:items-center">
        <GarmentImage
          alt="The FERT atelier in Bole, Addis Ababa"
          ratio="4/3"
          tone="gold"
          label="The Atelier — Bole"
        />
        <div>
          <p class="label-caps mb-4 text-gold-deep">Private appointment</p>
          <h2 class="font-display text-display-lg">A fitting, with a stylist</h2>
          <p class="mt-5 max-w-measure leading-relaxed text-ink-soft">
            Visit the atelier for measurements, fabric selection, and a
            conversation about the garment you have in mind. Appointments are
            one hour, unhurried.
          </p>
          <NuxtLink to="/appointments" class="btn-primary mt-8">
            Book an appointment
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
