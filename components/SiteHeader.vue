<script setup lang="ts">
/**
 * Site header — ALAÏA-style minimal top bar:
 * two dots + MENU + SEARCH on the left, wordmark center, account/cart right.
 * Solid paper background over content; inverts on dark heroes via `invert` prop
 * being handled by pages that need it (default is paper).
 */
const menuOpen = ref(false)
const route = useRoute()

// Close the drawer on navigation
watch(() => route.path, () => (menuOpen.value = false))

const primaryNav = [
  { label: 'Collections', to: '/collections' },
  { label: 'Garments', to: '/garments' },
  { label: 'Made to Order', to: '/order' },
  { label: 'Atelier', to: '/atelier' },
  { label: 'Appointments', to: '/appointments' },
]
</script>

<template>
  <header class="sticky top-0 z-nav border-b border-line bg-paper/95 backdrop-blur-sm">
    <nav
      aria-label="Primary"
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8"
    >
      <!-- Left: menu trigger -->
      <div class="flex items-center gap-5">
        <button
          type="button"
          class="flex min-h-[44px] items-center gap-2.5 label-caps"
          :aria-expanded="menuOpen"
          aria-controls="site-menu"
          @click="menuOpen = !menuOpen"
        >
          <span class="flex gap-1" aria-hidden="true">
            <span class="h-1.5 w-1.5 rounded-full bg-ink" />
            <span class="h-1.5 w-1.5 rounded-full bg-ink" />
          </span>
          Menu
        </button>
        <NuxtLink to="/garments" class="hidden min-h-[44px] items-center label-caps sm:flex">
          Search
        </NuxtLink>
      </div>

      <!-- Center: wordmark -->
      <NuxtLink
        to="/"
        class="absolute left-1/2 -translate-x-1/2 font-display text-xl font-bold tracking-[0.25em]"
        aria-label="FERT home"
      >
        FERT
      </NuxtLink>

      <!-- Right: account + cart -->
      <div class="flex items-center gap-5">
        <NuxtLink to="/account" class="hidden min-h-[44px] items-center label-caps sm:flex">
          Account
        </NuxtLink>
        <NuxtLink to="/order" class="flex min-h-[44px] items-center label-caps">
          Order
        </NuxtLink>
      </div>
    </nav>

    <!-- Full-screen menu drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-editorial"
      enter-from-class="-translate-y-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="-translate-y-full"
    >
      <div
        v-if="menuOpen"
        id="site-menu"
        class="fixed inset-0 z-overlay flex flex-col bg-ink text-paper"
      >
        <div class="flex h-16 items-center justify-between px-4 sm:px-8">
          <span class="label-caps text-paper/60">FERT — Addis Ababa</span>
          <button
            type="button"
            class="flex min-h-[44px] min-w-[44px] items-center justify-center label-caps"
            @click="menuOpen = false"
          >
            Close
          </button>
        </div>
        <ul class="flex flex-1 flex-col justify-center gap-2 px-4 sm:px-8">
          <li v-for="item in primaryNav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="group flex items-baseline gap-4 py-2 font-display text-display-md transition-colors hover:text-gold"
            >
              {{ item.label }}
              <span
                class="label-caps translate-y-0 text-gold opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
                >→</span
              >
            </NuxtLink>
          </li>
        </ul>
        <div class="flex items-center justify-between border-t border-paper/20 px-4 py-5 sm:px-8">
          <NuxtLink to="/account" class="label-caps text-paper/70 hover:text-gold">Account</NuxtLink>
          <span class="label-caps text-paper/40">Est. Addis Ababa</span>
        </div>
      </div>
    </Transition>
  </header>
</template>
