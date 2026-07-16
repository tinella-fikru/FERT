<script setup lang="ts">
import type { Collection } from '~/shared/types'

const { data: collections } = await useFetch<Collection[]>('/api/collections', {
  default: () => [],
})

const list = ref<HTMLElement>()
useReveal(list, { children: true })

useHead({ title: 'Collections — FERT' })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-section sm:px-8">
    <p class="label-caps mb-4 text-gold-deep">FERT — Addis Ababa</p>
    <h1 class="font-display text-display-lg">Collections</h1>

    <div ref="list" class="mt-14 grid gap-10 md:grid-cols-3">
      <NuxtLink
        v-for="(c, i) in collections"
        :key="c.id"
        :to="`/collections/${c.slug}`"
        class="gsap-reveal group block"
      >
        <div class="overflow-hidden">
          <div class="transition-transform duration-500 ease-editorial group-hover:scale-[1.03]">
            <GarmentImage
              :src="c.hero_image_url"
              :alt="`${c.name} collection`"
              ratio="3/4"
              :tone="(['dark', 'gold', 'light'] as const)[i % 3]"
              :label="c.season ?? ''"
            />
          </div>
        </div>
        <div class="mt-5 flex items-baseline justify-between">
          <h2 class="font-display text-2xl transition-colors group-hover:text-gold-deep">
            {{ c.name }}
          </h2>
          <span class="label-caps text-ink-soft">{{ c.season }}</span>
        </div>
        <p class="mt-2 line-clamp-2 max-w-measure text-sm leading-relaxed text-ink-soft">
          {{ c.description }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
