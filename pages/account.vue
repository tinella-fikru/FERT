<script setup lang="ts">
import type { Order, OrderStatus } from '~/shared/types'
import { formatEtb, ORDER_PIPELINE, CATEGORY_LABELS } from '~/shared/types'

definePageMeta({ middleware: 'auth' })

const { user } = useUser()
const { data: orders, status } = await useFetch<Order[]>('/api/my-orders', {
  default: () => [],
  lazy: true,
})

function pipelineIndex(s: OrderStatus) {
  return ORDER_PIPELINE.findIndex((p) => p.status === s)
}

function statusLabel(s: OrderStatus) {
  if (s === 'cancelled') return 'Cancelled'
  return ORDER_PIPELINE.find((p) => p.status === s)?.label ?? s
}

useHead({ title: 'Your account — FERT' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-14 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label-caps mb-3 text-gold-deep">Your account</p>
        <h1 class="font-display text-display-md">
          {{ user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome' }}
        </h1>
      </div>
      <SignOutButton>
        <button type="button" class="btn-secondary">Sign out</button>
      </SignOutButton>
    </div>

    <!-- Orders -->
    <section class="mt-14">
      <h2 class="label-caps mb-6 border-b border-line pb-3 text-ink-soft">Your orders</h2>

      <!-- Loading skeleton -->
      <div v-if="status === 'pending'" class="space-y-4" aria-hidden="true">
        <div v-for="i in 2" :key="i" class="h-32 animate-pulse bg-paper-muted" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!orders.length" class="py-16 text-center">
        <p class="font-display text-2xl">Nothing on the loom yet.</p>
        <p class="mt-3 text-ink-soft">Your made-to-order garments will appear here.</p>
        <NuxtLink to="/order" class="btn-primary mt-8">Begin an order</NuxtLink>
      </div>

      <!-- Orders list -->
      <div v-else class="space-y-6">
        <article
          v-for="o in orders"
          :key="o.id"
          class="border border-line p-6 transition-colors hover:border-ink"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p class="font-mono text-xs text-ink-soft">{{ o.order_number }}</p>
              <h3 class="mt-1 font-display text-xl">{{ o.garments?.name }}</h3>
              <p class="label-caps mt-1 text-ink-soft">
                {{ o.garments ? CATEGORY_LABELS[o.garments.category] : '' }}
                <template v-if="o.tibeb_patterns"> · {{ o.tibeb_patterns.name }} tibeb</template>
              </p>
            </div>
            <p class="font-mono text-lg tabular-nums">{{ formatEtb(o.total_etb) }}</p>
          </div>

          <!-- Status timeline -->
          <div v-if="o.status !== 'cancelled'" class="mt-6">
            <ol class="flex items-center gap-0" :aria-label="`Order status: ${statusLabel(o.status)}`">
              <li
                v-for="(p, i) in ORDER_PIPELINE"
                :key="p.status"
                class="flex flex-1 items-center"
              >
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :class="i <= pipelineIndex(o.status) ? 'bg-gold' : 'bg-line'"
                  :title="p.label"
                />
                <span
                  v-if="i < ORDER_PIPELINE.length - 1"
                  class="h-px flex-1"
                  :class="i < pipelineIndex(o.status) ? 'bg-gold' : 'bg-line'"
                  aria-hidden="true"
                />
              </li>
            </ol>
            <div class="mt-2 flex items-baseline justify-between">
              <p class="label-caps text-gold-deep">{{ statusLabel(o.status) }}</p>
              <p v-if="o.estimated_ready_date && pipelineIndex(o.status) < 4" class="text-xs text-ink-soft">
                Est. ready {{ o.estimated_ready_date }}
              </p>
            </div>
          </div>
          <p v-else class="label-caps mt-4 text-danger">Cancelled</p>
        </article>
      </div>
    </section>

    <!-- Appointment shortcut -->
    <section class="mt-14 border-t-[3px] border-ink bg-ink p-8 text-paper">
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 class="font-display text-2xl">Need a fitting?</h2>
          <p class="mt-2 text-sm text-paper/70">Book a private appointment at the Bole atelier.</p>
        </div>
        <NuxtLink to="/appointments" class="btn-gold">Book appointment</NuxtLink>
      </div>
    </section>
  </div>
</template>
