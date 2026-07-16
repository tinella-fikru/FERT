<script setup lang="ts">
import type { Collection, Garment } from '~/shared/types'
import { formatEtb, CATEGORY_LABELS } from '~/shared/types'

const route = useRoute()
const slug = route.params.slug as string

const [{ data: collections }, { data: garments }] = await Promise.all([
  useFetch<Collection[]>('/api/collections', { default: () => [] }),
  useFetch<Garment[]>(`/api/garments?collection=${slug}`, { default: () => [] }),
])

const collection = computed(() => collections.value.find((c) => c.slug === slug))
if (!collection.value) {
  throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
}

const grid = ref<HTMLElement>()
useReveal(grid, { children: true })

useHead({ title: () => `${collection.value?.name ?? 'Collection'} — FERT` })
</script>

<template>
  <div v-if="collection">
    <!-- Collection hero: inverted editorial banner -->
    <section class="texture-paper bg-ink px-4 py-section text-paper sm:px-8">
      <div class="mx-auto max-w-7xl">
        <p class="label-caps mb-4 text-gold">{{ collection.season }}</p>
        <h1 class="font-display text-display-xl font-bold">{{ collection.name }}</h1>
        <p class="mt-6 max-w-measure leading-relaxed text-paper/70">
          {{ collection.description }}
        </p>
      </div>
    </section>

    <div class="rule-hard" aria-hidden="true" />

    <!-- Garments -->
    <section class="mx-auto max-w-7xl px-4 py-section sm:px-8">
      <div ref="grid" class="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="(g, i) in garments"
          :key="g.id"
          :to="`/garments/${g.slug}`"
          class="gsap-reveal group block"
        >
          <div class="overflow-hidden">
            <div class="transition-transform duration-500 ease-editorial group-hover:scale-[1.03]">
              <GarmentImage
                :src="g.image_urls[0]"
                :alt="g.name"
                :tone="(['light', 'dark', 'gold'] as const)[i % 3]"
                :label="CATEGORY_LABELS[g.category]"
              />
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between gap-3">
            <h2 class="font-display text-lg">{{ g.name }}</h2>
            <p class="shrink-0 font-mono text-sm tabular-nums">{{ formatEtb(g.base_price_etb) }}</p>
          </div>
          <p class="label-caps mt-1 text-ink-soft">Made to order · {{ g.lead_time_days }} days</p>
        </NuxtLink>
      </div>

      <p v-if="!garments.length" class="py-20 text-center text-ink-soft">
        This collection is being prepared. Visit the atelier to preview it.
      </p>
    </section>
  </div>
</template>
