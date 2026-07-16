import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Registers GSAP + ScrollTrigger once, client-side only.
 * Exposes $gsap and a `prefersReducedMotion` flag so every animation
 * site-wide can respect the user's motion preference.
 */
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (prefersReducedMotion) {
    // Collapse all GSAP durations — content appears instantly.
    gsap.globalTimeline.timeScale(100)
  }

  return {
    provide: {
      gsap,
      ScrollTrigger,
      prefersReducedMotion,
    },
  }
})
