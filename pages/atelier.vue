<script setup lang="ts">
const intro = ref<HTMLElement>()
const craft = ref<HTMLElement>()
const visit = ref<HTMLElement>()
useReveal(intro)
useReveal(craft, { children: true })
useReveal(visit)

useHead({
  title: 'The Atelier — FERT',
  meta: [
    {
      name: 'description',
      content:
        'The FERT atelier in Bole, Addis Ababa — where traditional Ethiopian garments are woven, embroidered, and fitted.',
    },
  ],
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="texture-paper bg-ink px-4 py-section text-paper sm:px-8">
      <div class="mx-auto max-w-7xl">
        <p class="label-caps mb-4 text-gold">Bole, Addis Ababa</p>
        <h1 class="font-display text-display-xl font-bold">The Atelier</h1>
      </div>
    </section>

    <div class="rule-hard" aria-hidden="true" />

    <!-- Intro -->
    <section ref="intro" class="gsap-reveal mx-auto max-w-4xl px-4 py-section sm:px-8">
      <p class="font-display text-display-md leading-snug">
        FERT began with a single loom and a conviction: that habesha dress
        belongs to both <em class="text-gold-deep">ceremony</em> and
        <em class="text-gold-deep">every day</em>.
      </p>
      <p class="mt-8 max-w-measure leading-relaxed text-ink-soft">
        Today the atelier holds twelve looms and a workshop of weavers,
        embroiderers, and tailors. Every garment we sell is made here, to
        order, from menen cotton spun in the highlands. Nothing is stocked;
        everything is begun for a person.
      </p>
    </section>

    <!-- Craft pillars -->
    <section class="border-t border-line">
      <div ref="craft" class="mx-auto grid max-w-7xl gap-10 px-4 py-section sm:grid-cols-3 sm:px-8">
        <div class="gsap-reveal">
          <GarmentImage alt="Handweaving menen cotton on a traditional loom" ratio="1/1" tone="light" label="The Loom" />
          <h2 class="mt-5 font-display text-xl">Weaving</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">
            Menen cotton, woven at a density of 120 threads — fine enough to
            drape, strong enough to last generations.
          </p>
        </div>
        <div class="gsap-reveal">
          <GarmentImage alt="Embroidering a tibeb border by hand" ratio="1/1" tone="gold" label="The Tibeb" />
          <h2 class="mt-5 font-display text-xl">Tibeb</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">
            Each border is embroidered by a single artisan, start to finish.
            Five patterns, from the archive to the atelier signature.
          </p>
        </div>
        <div class="gsap-reveal">
          <GarmentImage alt="Final fitting in the atelier" ratio="1/1" tone="dark" label="The Fitting" />
          <h2 class="mt-5 font-display text-xl">Fitting</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">
            Made-to-order means made-to-you. Every garment ends with a fitting
            before it leaves the atelier.
          </p>
        </div>
      </div>
    </section>

    <!-- Visit -->
    <section class="border-t-[3px] border-ink bg-ink text-paper">
      <div ref="visit" class="gsap-reveal mx-auto grid max-w-7xl gap-10 px-4 py-section sm:px-8 md:grid-cols-2">
        <div>
          <p class="label-caps mb-4 text-gold">Visit us</p>
          <h2 class="font-display text-display-md">Bole, Addis Ababa</h2>
          <address class="mt-6 space-y-2 text-sm not-italic leading-relaxed text-paper/70">
            <p>Open Monday – Saturday, 9:00 – 18:00</p>
            <p>atelier@fert.et</p>
          </address>
        </div>
        <div class="flex flex-col items-start justify-center gap-4">
          <p class="max-w-measure leading-relaxed text-paper/70">
            Walk-ins are welcome for the showroom. For measurements, fittings,
            and made-to-order consultations, book a private appointment.
          </p>
          <NuxtLink to="/appointments" class="btn-gold">Book an appointment</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
