<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t-[3px] border-ink bg-ink text-paper">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <div class="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <!-- Brand -->
        <div>
          <p class="font-display text-4xl font-bold tracking-[0.2em]">FERT</p>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
            Traditional Ethiopian clothing, handwoven and made to order in our
            Addis Ababa atelier.
          </p>
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

        <!-- Contact -->
        <div>
          <p class="label-caps mb-4 text-gold">Visit</p>
          <address class="space-y-3 text-sm not-italic text-paper/70">
            <p>Bole, Addis Ababa<br />Ethiopia</p>
            <p><a href="mailto:atelier@fert.et" class="hover:text-paper">atelier@fert.et</a></p>
          </address>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-3 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="label-caps text-paper/40">© {{ year }} FERT — Addis Ababa</p>
        <p class="label-caps text-paper/40">Woven with tibeb</p>
      </div>
    </div>
  </footer>
</template>
