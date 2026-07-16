<script setup lang="ts">
/**
 * Art-directed placeholder for product/editorial photography.
 * Renders a reserved-aspect block (no CLS) with a tibeb-inspired
 * woven band and the garment name — reads as intentional design
 * until real photography drops in via the `src` prop.
 */
const props = withDefaults(
  defineProps<{
    src?: string | null
    alt: string
    /** e.g. '3/4' portrait (default), '4/3', '1/1', '16/9' */
    ratio?: string
    /** dark = ink block w/ paper text; light = muted paper block */
    tone?: 'dark' | 'light' | 'gold'
    label?: string
  }>(),
  { ratio: '3/4', tone: 'light', src: null, label: '' },
)

const toneClasses = computed(
  () =>
    ({
      dark: 'bg-ink text-paper/70',
      light: 'bg-paper-muted text-ink-soft',
      gold: 'bg-gold-faint text-gold-deep',
    })[props.tone],
)

// Deterministic per-instance offset so grids of placeholders don't look cloned
const bandOffset = computed(() => {
  let hash = 0
  for (const ch of props.alt) hash = (hash * 31 + ch.charCodeAt(0)) % 97
  return hash % 3
})
</script>

<template>
  <div
    class="relative w-full overflow-hidden"
    :style="{ aspectRatio: ratio }"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <div
      v-else
      role="img"
      :aria-label="alt"
      class="absolute inset-0 flex flex-col items-center justify-center gap-4"
      :class="toneClasses"
    >
      <!-- Tibeb woven band -->
      <svg
        class="w-3/5"
        viewBox="0 0 200 24"
        fill="none"
        aria-hidden="true"
        :style="{ transform: `translateY(${bandOffset * 2}px)` }"
      >
        <g fill="currentColor" opacity="0.85">
          <template v-for="i in 12" :key="i">
            <path
              :d="`M${(i - 1) * 17} 12 l6 -8 l6 8 l-6 8 Z`"
              :opacity="i % 2 === 0 ? 0.45 : 1"
            />
          </template>
        </g>
        <rect x="0" y="0" width="200" height="1.5" fill="currentColor" opacity="0.5" />
        <rect x="0" y="22.5" width="200" height="1.5" fill="currentColor" opacity="0.5" />
      </svg>
      <span v-if="label" class="label-caps opacity-70">{{ label }}</span>
    </div>
  </div>
</template>
