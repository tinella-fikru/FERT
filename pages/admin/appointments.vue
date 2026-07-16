<script setup lang="ts">
import type { Appointment, AppointmentStatus } from '~/shared/types'

definePageMeta({ middleware: 'admin' })

const { data: appointments, refresh } = await useFetch<Appointment[]>(
  '/api/admin/appointments',
  { default: () => [], lazy: true },
)

const filter = ref<AppointmentStatus | 'all'>('requested')
const filtered = computed(() =>
  filter.value === 'all'
    ? appointments.value
    : appointments.value.filter((a) => a.status === filter.value),
)

const FILTERS: (AppointmentStatus | 'all')[] = ['requested', 'confirmed', 'completed', 'cancelled', 'all']

const busyId = ref<string | null>(null)
async function setStatus(a: Appointment, status: AppointmentStatus) {
  busyId.value = a.id
  const prev = a.status
  a.status = status
  try {
    await $fetch(`/api/admin/appointments/${a.id}/status`, { method: 'POST', body: { status } })
  } catch {
    a.status = prev
  } finally {
    busyId.value = null
  }
}

useHead({ title: 'Appointments — FERT Admin' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label-caps mb-2 text-gold-deep">FERT Admin</p>
        <h1 class="font-display text-display-md">Appointments</h1>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="btn-secondary">Pipeline</NuxtLink>
        <button type="button" class="btn-primary" @click="refresh()">Refresh</button>
      </div>
    </div>

    <!-- Filter -->
    <div class="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter appointments">
      <button
        v-for="f in FILTERS"
        :key="f"
        type="button"
        class="min-h-[44px] border px-4 label-caps transition-colors"
        :class="filter === f ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
        :aria-pressed="filter === f"
        @click="filter = f"
      >
        {{ f }}
      </button>
    </div>

    <!-- List -->
    <div class="mt-8 space-y-4">
      <article
        v-for="a in filtered"
        :key="a.id"
        class="flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-5"
      >
        <div>
          <h2 class="font-display text-lg">{{ a.full_name }}</h2>
          <p class="mt-1 text-sm text-ink-soft">
            {{ a.email }}<template v-if="a.phone"> · {{ a.phone }}</template>
          </p>
          <p class="label-caps mt-2 text-gold-deep">
            {{ a.preferred_date }} · {{ a.preferred_time === 'morning' ? 'Morning 9–12' : 'Afternoon 13–18' }}
          </p>
          <p v-if="a.purpose" class="mt-2 max-w-measure text-sm italic text-ink-soft">“{{ a.purpose }}”</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="label-caps border border-line px-3 py-1.5">{{ a.status }}</span>
          <template v-if="a.status === 'requested'">
            <button type="button" class="btn-primary !min-h-[40px] !px-4 !py-2 text-xs" :disabled="busyId === a.id" @click="setStatus(a, 'confirmed')">
              Confirm
            </button>
            <button type="button" class="btn-secondary !min-h-[40px] !px-4 !py-2 text-xs" :disabled="busyId === a.id" @click="setStatus(a, 'cancelled')">
              Decline
            </button>
          </template>
          <button
            v-else-if="a.status === 'confirmed'"
            type="button"
            class="btn-primary !min-h-[40px] !px-4 !py-2 text-xs"
            :disabled="busyId === a.id"
            @click="setStatus(a, 'completed')"
          >
            Mark completed
          </button>
        </div>
      </article>

      <p v-if="!filtered.length" class="border border-dashed border-line p-10 text-center text-sm text-ink-soft">
        No appointments in this view.
      </p>
    </div>
  </div>
</template>
