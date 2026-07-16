<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-paper">
    <div class="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p class="font-mono text-sm text-gold-deep">{{ error.statusCode }}</p>
      <h1 class="mt-4 font-display text-display-lg">
        {{ is404 ? 'This thread ends here.' : 'The loom has jammed.' }}
      </h1>
      <p class="mt-6 max-w-measure leading-relaxed text-ink-soft">
        {{
          is404
            ? "The page you're looking for doesn't exist — perhaps it was rewoven elsewhere."
            : 'Something went wrong on our side. Please try again in a moment.'
        }}
      </p>
      <button type="button" class="btn-primary mt-10" @click="clearError({ redirect: '/' })">
        Return to FERT
      </button>
    </div>
  </div>
</template>
