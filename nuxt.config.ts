// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-16',
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@clerk/nuxt'],

  css: ['~/assets/css/main.css'],

  googleFonts: {
    families: {
      'Playfair Display': { wght: [400, 500, 700, 900], ital: [400] },
      'Source Serif 4': { wght: [300, 400, 600], ital: [300] },
      'JetBrains Mono': { wght: [400, 500] },
    },
    display: 'swap',
    preload: true,
  },

  runtimeConfig: {
    // Server-only
    supabaseServiceRoleKey: '',
    chapaSecretKey: '',
    resendApiKey: '',
    adminEmails: '',
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      siteUrl: 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'FERT — Traditional Ethiopian Clothing, Addis Ababa',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'FERT is an Addis Ababa atelier crafting traditional Ethiopian clothing — habesha kemis, netela, and made-to-order garments woven with tibeb.',
        },
        { property: 'og:title', content: 'FERT — Traditional Ethiopian Clothing' },
        {
          property: 'og:description',
          content: 'Handwoven habesha garments, made to order in Addis Ababa.',
        },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#0A0A0A' },
      ],
    },
    pageTransition: false, // handled manually via GSAP overlay
  },
})
