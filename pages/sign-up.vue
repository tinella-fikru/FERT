<script setup lang="ts">
const route = useRoute()

// Where the user was headed; bare visits fall back to the account page.
const intended = computed(() => {
  const r = route.query.redirect_url
  return typeof r === 'string' && r.startsWith('/') ? r : '/account'
})

// Mirror sign-in: route through /post-login so an admin-email account lands
// on /admin and everyone else on their intended target.
const redirectTarget = computed(
  () => `/post-login?next=${encodeURIComponent(intended.value)}`,
)

useHead({ title: 'Create account — FERT' })
</script>

<template>
  <div class="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 py-16">
    <p class="label-caps mb-8 text-gold-deep">FERT — Addis Ababa</p>
    <SignUp
      :sign-in-url="`/sign-in?redirect_url=${encodeURIComponent(intended)}`"
      :fallback-redirect-url="redirectTarget"
      :appearance="{
        variables: {
          colorPrimary: '#0A0A0A',
          colorText: '#0A0A0A',
          borderRadius: '0px',
          fontFamily: '\'Source Serif 4\', Georgia, serif',
        },
      }"
    />
  </div>
</template>
