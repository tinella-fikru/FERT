<script setup lang="ts">
import type { Garment } from '~/shared/types'
import { formatEtb, CATEGORY_LABELS } from '~/shared/types'

const route = useRoute()
const slug = route.params.slug as string

const { data: garment, error } = await useFetch<Garment>(`/api/garments/${slug}`)
if (error.value || !garment.value) {
  throw createError({ statusCode: 404, statusMessage: 'Garment not found' })
}

const story = ref<HTMLElement>()
const details = ref<HTMLElement>()
useReveal(story)
useReveal(details, { children: true })

useHead({
  title: () => `${garment.value?.name} — FERT`,
  meta: [{ name: 'description', content: garment.value?.description ?? '' }],
})
</script>

<template>
  <div v-if="garment">
    <!-- Editorial split: image left, purchase panel right -->
    <section class="mx-auto grid max-w-7xl gap-0 md:grid-cols-[3fr_2fr]">
      <div class="border-line md:border-r">
        <GarmentImage
          :src="garment.image_urls[0]"
          :alt="garment.name"
          ratio="3/4"
          tone="dark"
          :label="CATEGORY_LABELS[garment.category]"
        />
      </div>

      <div class="flex flex-col justify-center px-4 py-14 sm:px-10">
        <NuxtLink
          v-if="garment.collections"
          :to="`/collections/${garment.collections.slug}`"
          class="label-caps mb-4 text-gold-deep hover:text-gold"
        >
          {{ garment.collections.name }} collection
        </NuxtLink>

        <h1 class="font-display text-display-md">{{ garment.name }}</h1>
        <p class="mt-3 font-mono text-xl tabular-nums">{{ formatEtb(garment.base_price_etb) }}</p>

        <p class="mt-6 max-w-measure leading-relaxed text-ink-soft">
          {{ garment.description }}
        </p>

        <dl class="mt-8 space-y-3 border-t border-line pt-6 text-sm">
          <div class="flex justify-between">
            <dt class="label-caps text-ink-soft">Category</dt>
            <dd>{{ CATEGORY_LABELS[garment.category] }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="label-caps text-ink-soft">Lead time</dt>
            <dd>{{ garment.lead_time_days }} days, made to order</dd>
          </div>
          <div class="flex justify-between">
            <dt class="label-caps text-ink-soft">Fabric</dt>
            <dd>Handwoven menen cotton</dd>
          </div>
        </dl>

        <div class="mt-10 flex flex-col gap-3">
          <NuxtLink :to="`/order?garment=${garment.slug}`" class="btn-primary">
            Begin your order
          </NuxtLink>
          <NuxtLink to="/appointments" class="btn-secondary">
            Fit at the atelier instead
          </NuxtLink>
        </div>
      </div>
    </section>

    <div class="rule-hard" aria-hidden="true" />

    <!-- Craft story -->
    <section v-if="garment.story" class="bg-ink text-paper">
      <div ref="story" class="gsap-reveal mx-auto max-w-4xl px-4 py-section text-center sm:px-8">
        <p class="label-caps mb-6 text-gold">The craft</p>
        <p class="font-display text-2xl leading-relaxed sm:text-3xl">
          {{ garment.story }}
        </p>
      </div>
    </section>

    <!-- Made-to-order explainer -->
    <section class="mx-auto max-w-7xl px-4 py-section sm:px-8">
      <div ref="details" class="grid gap-10 sm:grid-cols-3">
        <div class="gsap-reveal">
          <p class="font-mono text-sm text-gold-deep">01</p>
          <h2 class="mt-2 font-display text-xl">Configure</h2>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            Choose your tibeb border and provide measurements — standard sizes
            or fully custom.
          </p>
        </div>
        <div class="gsap-reveal">
          <p class="font-mono text-sm text-gold-deep">02</p>
          <h2 class="mt-2 font-display text-xl">Woven for you</h2>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            Your garment is woven and embroidered in the Addis Ababa atelier —
            about {{ garment.lead_time_days }} days.
          </p>
        </div>
        <div class="gsap-reveal">
          <p class="font-mono text-sm text-gold-deep">03</p>
          <h2 class="mt-2 font-display text-xl">Final fitting</h2>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            Collect at the atelier with a final fitting, or arrange delivery
            within Addis Ababa.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
