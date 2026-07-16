<script setup lang="ts">
/**
 * Hard-edged ink overlay that wipes across route changes
 * (design system: slide-in page transitions with hard edge,
 * 400ms power2.inOut each way). Skipped for reduced motion.
 */
const overlay = ref<HTMLElement>()
const router = useRouter()
const { $gsap, $prefersReducedMotion } = useNuxtApp()

let removeBefore: (() => void) | undefined
let removeAfter: (() => void) | undefined

onMounted(() => {
  if (!overlay.value || $prefersReducedMotion) return

  $gsap.set(overlay.value, { yPercent: 100 })

  removeBefore = router.beforeEach((to, from, next) => {
    if (to.path === from.path) return next()
    $gsap.to(overlay.value!, {
      yPercent: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: next,
    })
  })

  removeAfter = router.afterEach(() => {
    // Small delay lets the new page paint under the overlay first.
    $gsap.to(overlay.value!, {
      yPercent: -100,
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 0.1,
      onComplete: () => $gsap.set(overlay.value!, { yPercent: 100 }),
    })
  })
})

onUnmounted(() => {
  removeBefore?.()
  removeAfter?.()
})
</script>

<template>
  <div
    ref="overlay"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-transition translate-y-full bg-ink"
  >
    <span
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-2xl tracking-[0.3em] text-paper"
    >
      FERT
    </span>
  </div>
</template>
