<script setup lang="ts">
import { formatEtb } from '~/shared/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const ref_ = typeof route.query.ref === 'string' ? route.query.ref : ''

const state = ref<'verifying' | 'paid' | 'pending' | 'error'>('verifying')
const orderNumber = ref('')
const { reset } = useOrderDraft()

async function verify(attempt = 0) {
  if (!ref_) {
    state.value = 'error'
    return
  }
  try {
    const res = await $fetch<{ status: string; order_number: string }>(
      '/api/orders/verify',
      { method: 'POST', body: { ref: ref_ } },
    )
    orderNumber.value = res.order_number
    if (res.status !== 'pending_payment') {
      state.value = 'paid'
      reset() // clear the wizard draft — order complete
    } else if (attempt < 5) {
      // Chapa settlement can lag the redirect by a few seconds
      setTimeout(() => verify(attempt + 1), 2500)
    } else {
      state.value = 'pending'
    }
  } catch {
    state.value = 'error'
  }
}

onMounted(() => verify())

useHead({ title: 'Order confirmation — FERT' })
</script>

<template>
  <div class="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-8">
    <!-- Verifying -->
    <template v-if="state === 'verifying'">
      <span class="inline-block h-8 w-8 animate-spin border-2 border-ink border-t-transparent" aria-hidden="true" />
      <p class="label-caps mt-6 text-ink-soft" role="status">Confirming your payment…</p>
    </template>

    <!-- Paid -->
    <template v-else-if="state === 'paid'">
      <p class="label-caps text-gold-deep">Order {{ orderNumber }}</p>
      <h1 class="mt-4 font-display text-display-md">The loom is yours.</h1>
      <p class="mt-6 max-w-measure leading-relaxed text-ink-soft">
        Your payment is confirmed and your garment has been entered into the
        atelier's order book. A confirmation email is on its way, and we will
        write again when it's time for your fitting.
      </p>
      <div class="mt-10 flex flex-col gap-3 sm:flex-row">
        <NuxtLink to="/account" class="btn-primary">View your orders</NuxtLink>
        <NuxtLink to="/collections" class="btn-secondary">Continue browsing</NuxtLink>
      </div>
    </template>

    <!-- Pending -->
    <template v-else-if="state === 'pending'">
      <p class="label-caps text-gold-deep">Order {{ orderNumber }}</p>
      <h1 class="mt-4 font-display text-display-md">Payment pending</h1>
      <p class="mt-6 max-w-measure leading-relaxed text-ink-soft">
        We haven't received confirmation from Chapa yet. If you completed the
        payment, it will settle shortly — check your orders in a few minutes.
        If you cancelled, you can restart the order at any time.
      </p>
      <div class="mt-10 flex flex-col gap-3 sm:flex-row">
        <NuxtLink to="/account" class="btn-primary">Check my orders</NuxtLink>
        <NuxtLink to="/order" class="btn-secondary">Restart order</NuxtLink>
      </div>
    </template>

    <!-- Error -->
    <template v-else>
      <h1 class="font-display text-display-md">Something went wrong</h1>
      <p class="mt-6 max-w-measure leading-relaxed text-ink-soft">
        We couldn't verify this payment reference. If you were charged, contact
        us at atelier@fert.et with your order details and we'll resolve it.
      </p>
      <NuxtLink to="/account" class="btn-primary mt-10">Go to my account</NuxtLink>
    </template>
  </div>
</template>
