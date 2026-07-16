/**
 * Scroll-reveal composable — the standard FERT entrance.
 * Fades + lifts children of a section as it enters the viewport
 * (400–600ms, power2.out, ≤8 staggered children per design system).
 *
 * Usage:
 *   const section = ref<HTMLElement>()
 *   useReveal(section)                      // reveal the element itself
 *   useReveal(section, { children: true })  // stagger its children
 */
export function useReveal(
  target: Ref<HTMLElement | undefined | null>,
  options: { children?: boolean; y?: number; delay?: number } = {},
) {
  const { $gsap, $prefersReducedMotion } = useNuxtApp()

  let ctx: gsap.Context | undefined

  onMounted(() => {
    if (!target.value || !$gsap) return

    ctx = $gsap.context(() => {
      const el = target.value!
      const targets = options.children ? Array.from(el.children) : el

      if ($prefersReducedMotion) {
        $gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      $gsap.fromTo(
        targets,
        { opacity: 0, y: options.y ?? 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: options.delay ?? 0,
          stagger: options.children ? 0.08 : 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    }, target.value)
  })

  onUnmounted(() => ctx?.revert())
}
