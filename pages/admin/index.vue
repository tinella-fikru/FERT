<script setup lang="ts">
import type { Order, OrderStatus } from '~/shared/types'
import { formatEtb } from '~/shared/types'

definePageMeta({ middleware: 'admin' })

interface AdminOrder extends Order {
  customers?: { full_name: string | null; email: string; phone: string | null } | null
}

const { data: orders, refresh } = await useFetch<AdminOrder[]>('/api/admin/orders', {
  default: () => [],
  lazy: true,
})

const COLUMNS: { status: OrderStatus; label: string; next: OrderStatus | null; nextLabel: string }[] = [
  { status: 'paid', label: 'Confirmed', next: 'in_workshop', nextLabel: 'Start weaving' },
  { status: 'in_workshop', label: 'In the workshop', next: 'quality_check', nextLabel: 'To quality check' },
  { status: 'quality_check', label: 'Quality check', next: 'ready', nextLabel: 'Mark ready' },
  { status: 'ready', label: 'Ready for fitting', next: 'delivered', nextLabel: 'Mark delivered' },
]

const byStatus = (s: OrderStatus) => orders.value.filter((o) => o.status === s)
const pendingCount = computed(() => byStatus('pending_payment').length)

const movingId = ref<string | null>(null)
const actionError = ref('')

async function advance(order: AdminOrder, to: OrderStatus) {
  actionError.value = ''
  movingId.value = order.id
  const prev = order.status
  order.status = to // optimistic
  try {
    await $fetch(`/api/admin/orders/${order.id}/status`, { method: 'POST', body: { to } })
  } catch (e: unknown) {
    order.status = prev // rollback
    const err = e as { data?: { statusMessage?: string } }
    actionError.value = err.data?.statusMessage ?? 'Could not update the order.'
  } finally {
    movingId.value = null
  }
}

useHead({ title: 'Pipeline — FERT Admin' })
</script>

<template>
  <div class="mx-auto max-w-[100rem] px-4 py-10 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label-caps mb-2 text-gold-deep">FERT Admin</p>
        <h1 class="font-display text-display-md">Order pipeline</h1>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/appointments" class="btn-secondary">Appointments</NuxtLink>
        <button type="button" class="btn-primary" @click="refresh()">Refresh</button>
      </div>
    </div>

    <p v-if="pendingCount" class="label-caps mt-6 text-ink-soft">
      {{ pendingCount }} order(s) awaiting payment (not shown on the board)
    </p>

    <p v-if="actionError" class="mt-6 border border-danger bg-danger/5 p-4 text-sm text-danger" role="alert">
      {{ actionError }}
    </p>

    <!-- Board: horizontal scroll on mobile, 4-up on desktop -->
    <div class="mt-10 grid gap-6 overflow-x-auto lg:grid-cols-4">
      <section
        v-for="col in COLUMNS"
        :key="col.status"
        class="min-w-[280px] border-t-[3px] border-ink"
        :aria-label="col.label"
      >
        <header class="flex items-baseline justify-between py-4">
          <h2 class="label-caps">{{ col.label }}</h2>
          <span class="font-mono text-sm tabular-nums text-ink-soft">{{ byStatus(col.status).length }}</span>
        </header>

        <div class="space-y-4">
          <article
            v-for="o in byStatus(col.status)"
            :key="o.id"
            class="border border-line bg-white p-5"
          >
            <p class="font-mono text-xs text-ink-soft">{{ o.order_number }}</p>
            <h3 class="mt-1 font-display text-lg">{{ o.garments?.name }}</h3>
            <p class="mt-1 text-sm text-ink-soft">
              {{ o.customers?.full_name ?? o.customers?.email }}
            </p>
            <dl class="mt-3 space-y-1 text-xs text-ink-soft">
              <div class="flex justify-between">
                <dt>Tibeb</dt>
                <dd>{{ o.tibeb_patterns?.name ?? '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>Sizing</dt>
                <dd>{{ o.size_label ?? 'Custom' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>Est. ready</dt>
                <dd>{{ o.estimated_ready_date ?? '—' }}</dd>
              </div>
              <div class="flex justify-between font-mono tabular-nums">
                <dt>Total</dt>
                <dd>{{ formatEtb(o.total_etb) }}</dd>
              </div>
            </dl>
            <p v-if="o.notes" class="mt-3 border-l-2 border-gold pl-3 text-xs italic text-ink-soft">
              “{{ o.notes }}”
            </p>
            <button
              v-if="col.next"
              type="button"
              class="btn-primary mt-4 w-full !min-h-[40px] !px-4 !py-2 text-xs"
              :disabled="movingId === o.id"
              @click="advance(o, col.next)"
            >
              {{ movingId === o.id ? 'Moving…' : col.nextLabel }}
            </button>
          </article>

          <p v-if="!byStatus(col.status).length" class="border border-dashed border-line p-6 text-center text-xs text-ink-soft">
            Empty
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
