<script setup lang="ts">
import type { Garment, GarmentCategory } from '~/shared/types'
import { formatEtb, CATEGORY_LABELS } from '~/shared/types'

const { data: garments } = await useFetch<Garment[]>('/api/garments', {
  default: () => [],
})

const activeCategory = ref<GarmentCategory | 'all'>('all')
const categories = computed(() => {
  const present = new Set(garments.value.map((g) => g.category))
  return (Object.keys(CATEGORY_LABELS) as GarmentCategory[]).filter((c) => present.has(c))
})

const filtered = computed(() =>
  activeCategory.value === 'all'
    ? garments.value
    : garments.value.filter((g) => g.category === activeCategory.value),
)

const grid = ref<HTMLElement>()
useReveal(grid, { children: true })

useHead({ title: 'All Garments — FERT' })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-section sm:px-8">
    <p class="label-caps mb-4 text-gold-deep">The full atelier</p>
    <h1 class="font-display text-display-lg">Garments</h1>

    <!-- Category filter -->
    <div class="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        type="button"
        class="min-h-[44px] border px-5 label-caps transition-colors duration-200"
        :class="activeCategory === 'all' ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
        :aria-pressed="activeCategory === 'all'"
        @click="activeCategory = 'all'"
      >
        All
      </button>
      <button
        v-for="c in categories"
        :key="c"
        type="button"
        class="min-h-[44px] border px-5 label-caps transition-colors duration-200"
        :class="activeCategory === c ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
        :aria-pressed="activeCategory === c"
        @click="activeCategory = c"
      >
        {{ CATEGORY_LABELS[c] }}
      </button>
    </div>

    <!-- Grid -->
    <div ref="grid" class="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="(g, i) in filtered"
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
        <p class="label-caps mt-1 text-ink-soft">
          {{ g.collections?.name }} · {{ CATEGORY_LABELS[g.category] }}
        </p>
      </NuxtLink>
    </div>

    <p v-if="!filtered.length" class="py-20 text-center text-ink-soft">
      No garments in this category yet.
    </p>
  </div>
</template>
