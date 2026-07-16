import type { Config } from 'tailwindcss'

/**
 * FERT design tokens — Minimalist Monochrome + tilet gold accent.
 * Derived from design-system/fert/MASTER.md (hybrid direction:
 * ALAÏA-style editorial monochrome, gold instead of red/blue accent).
 */
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A0A0A', // primary / foreground
          soft: '#3F3F46', // secondary text
        },
        paper: {
          DEFAULT: '#FAFAF8', // background
          muted: '#F0EFEA', // muted surfaces
        },
        gold: {
          DEFAULT: '#B98A2F', // tilet gold accent / CTA
          deep: '#8F6820', // hover / pressed
          faint: '#F4EAD5', // tint backgrounds
        },
        line: '#E4E4E7', // borders
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // editorial scale
        'display-xl': ['clamp(3rem, 10vw, 8.5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.1' }],
      },
      spacing: {
        // spacious rhythm (density 3/10): 24–96px tiers
        section: 'clamp(4rem, 10vw, 8rem)',
      },
      letterSpacing: {
        caps: '0.14em',
      },
      maxWidth: {
        measure: '68ch',
      },
      zIndex: {
        nav: '100',
        overlay: '900',
        transition: '1000',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)', // power2/expo-out feel
      },
    },
  },
}
