<script setup lang="ts">
// Adds .js class so gsap-reveal elements only start hidden when JS runs
// (no-JS fallback keeps content visible for SEO and accessibility).
useHead({
  htmlAttrs: { class: 'js' },
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <PageTransitionOverlay />
  </div>
</template>
