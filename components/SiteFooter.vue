<script setup lang="ts">
import { BRAND } from '~/shared/brand'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t-[3px] border-ink bg-ink text-paper">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <div class="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <!-- Brand -->
        <div>
          <NuxtLink to="/" class="inline-block">
            <img
              src="/images/fert-logo.jpg"
              alt="FERT Design — home"
              class="h-24 w-24 object-cover"
              width="96"
              height="96"
              loading="lazy"
            />
          </NuxtLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
            Traditional Ethiopian clothing, handwoven and made to order in our
            Addis Ababa atelier.
          </p>
          <!-- Social -->
          <div class="mt-6 flex items-center gap-3">
            <a
              :href="BRAND.instagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FERT Design on Instagram"
              class="flex h-11 w-11 items-center justify-center border border-paper/25 text-paper/70 transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              <BrandIcon name="instagram" />
            </a>
            <a
              :href="BRAND.facebook"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FERT Design on Facebook"
              class="flex h-11 w-11 items-center justify-center border border-paper/25 text-paper/70 transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              <BrandIcon name="facebook" />
            </a>
            <a
              :href="BRAND.phoneHref"
              :aria-label="`Call FERT Design on ${BRAND.phone}`"
              class="flex h-11 w-11 items-center justify-center border border-paper/25 text-paper/70 transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              <BrandIcon name="phone" />
            </a>
          </div>
        </div>

        <!-- Shop -->
        <nav aria-label="Shop">
          <p class="label-caps mb-4 text-gold">Shop</p>
          <ul class="space-y-3 text-sm">
            <li><NuxtLink to="/collections" class="text-paper/70 hover:text-paper">Collections</NuxtLink></li>
            <li><NuxtLink to="/garments" class="text-paper/70 hover:text-paper">All garments</NuxtLink></li>
            <li><NuxtLink to="/order" class="text-paper/70 hover:text-paper">Made to order</NuxtLink></li>
          </ul>
        </nav>

        <!-- Maison -->
        <nav aria-label="Maison">
          <p class="label-caps mb-4 text-gold">Maison</p>
          <ul class="space-y-3 text-sm">
            <li><NuxtLink to="/atelier" class="text-paper/70 hover:text-paper">The atelier</NuxtLink></li>
            <li><NuxtLink to="/appointments" class="text-paper/70 hover:text-paper">Private appointments</NuxtLink></li>
            <li><NuxtLink to="/account" class="text-paper/70 hover:text-paper">Your account</NuxtLink></li>
          </ul>
        </nav>

        <!-- Visit -->
        <div>
          <p class="label-caps mb-4 text-gold">Visit</p>
          <ul class="space-y-3 text-sm">
            <li v-for="branch in BRAND.branches" :key="branch.name">
              <a
                :href="branch.mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-start gap-2 text-paper/70 transition-colors hover:text-gold"
              >
                <BrandIcon name="location" size="h-4 w-4 mt-0.5 shrink-0" />
                <span>{{ branch.name }}<span class="block text-xs text-paper/40 group-hover:text-gold/60">Addis Ababa · View on map</span></span>
              </a>
            </li>
            <li>
              <a :href="BRAND.phoneHref" class="flex items-center gap-2 text-paper/70 hover:text-gold">
                <BrandIcon name="phone" size="h-4 w-4 shrink-0" />
                {{ BRAND.phone }}
              </a>
            </li>
            <li>
              <a :href="`mailto:${BRAND.email}`" class="text-paper/70 hover:text-paper">{{ BRAND.email }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-3 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="label-caps text-paper/40">© {{ year }} FERT Design — Addis Ababa</p>
        <p class="label-caps text-paper/40">Woven with tibeb</p>
      </div>
    </div>
  </footer>
</template>
