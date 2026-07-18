<script setup lang="ts">
const route = useRoute()

// Where the user was headed (set by the auth/admin middleware and the order
// wizard). Bare visits fall back to the account page.
const intended = computed(() => {
  const r = route.query.redirect_url
  return typeof r === 'string' && r.startsWith('/') ? r : '/account'
})

// Route every sign-in through /post-login, which sends admins to /admin and
// everyone else to their intended target (server decides — the browser can't
// know admin status at sign-in time).
const redirectTarget = computed(
  () => `/post-login?next=${encodeURIComponent(intended.value)}`,
)

useHead({ title: 'Sign in — FERT' })
</script>

<template>
  <div class="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 py-16">
    <p class="label-caps mb-8 text-gold-deep">FERT — Addis Ababa</p>
    <SignIn
      :sign-up-url="`/sign-up?redirect_url=${encodeURIComponent(intended)}`"
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
