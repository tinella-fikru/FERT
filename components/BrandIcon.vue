<script setup lang="ts">
/**
 * Inline SVG brand/utility icons — single source so stroke weight
 * and sizing stay consistent (design system: one icon language).
 */
defineProps<{
  name: 'instagram' | 'facebook' | 'location' | 'phone'
  /** Tailwind size classes applied to the svg, default h-5 w-5 */
  size?: string
}>()
</script>

<template>
  <svg
    :class="size ?? 'h-5 w-5'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Instagram -->
    <template v-if="name === 'instagram'">
      <rect x="3" y="3" width="18" height="18" rx="0" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.4" fill="currentColor" />
    </template>

    <!-- Facebook -->
    <template v-else-if="name === 'facebook'">
      <path d="M15.5 3h-2.9a4 4 0 0 0-4 4v3H5.9v3.6h2.7V21h3.7v-7.4h2.8l.6-3.6h-3.4V7.4c0-.6.4-1 1-1h2.2Z" />
    </template>

    <!-- Location pin -->
    <template v-else-if="name === 'location'">
      <path d="M12 21s-6.5-5.5-6.5-10.3A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.7C18.5 15.5 12 21 12 21Z" />
      <circle cx="12" cy="10.6" r="2.2" />
    </template>

    <!-- Phone -->
    <template v-else-if="name === 'phone'">
      <path d="M5 4h4l1.5 4L8 10a12 12 0 0 0 6 6l2-2.5L20 15v4a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
    </template>
  </svg>
</template>
