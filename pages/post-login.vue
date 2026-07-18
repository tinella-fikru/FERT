<script setup lang="ts">
/**
 * Post-login router. Clerk sends users here after sign-in; we then decide
 * the destination based on server-verified admin status (their email in
 * NUXT_ADMIN_EMAILS), which the browser can't know at sign-in time.
 *
 *   - Admins            → /admin  (or the intended /admin/* target)
 *   - Everyone else     → the intended ?next=… target, else /account
 *
 * ?next= preserves the order flow: a normal user sent here from checkout
 * still lands back on /order.
 */
const route = useRoute()

const next = computed(() => {
  const n = route.query.next
  return typeof n === 'string' && n.startsWith('/') ? n : '/account'
})

useHead({ title: 'Signing in… — FERT' })

onMounted(async () => {
  let isAdmin = false
  try {
    await $fetch('/api/admin/ping')
    isAdmin = true
  } catch {
    isAdmin = false
  }

  if (isAdmin) {
    // Admins go to the admin area (honor a specific /admin/* target if given).
    await navigateTo(next.value.startsWith('/admin') ? next.value : '/admin')
  } else {
    // Non-admins can't reach /admin/* — fall back to their account.
    await navigateTo(next.value.startsWith('/admin') ? '/account' : next.value)
  }
})
</script>

<template>
  <div class="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
    <p class="label-caps mb-4 text-gold-deep">FERT — Addis Ababa</p>
    <p class="font-display text-2xl">Signing you in…</p>
    <div class="mt-8 h-[3px] w-24 animate-pulse bg-ink" aria-hidden="true" />
  </div>
</template>
