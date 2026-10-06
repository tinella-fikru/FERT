<script setup lang="ts">
/**
 * SlotPicker — pick an exact hourly appointment slot.
 * Fetches open slots from /api/appointments/slots (grouped by Addis-local
 * date) and emits the selected slot's ISO start via v-model.
 */
const model = defineModel<string>({ default: '' })

const { data, pending, error, refresh } = await useFetch<{ slots: Record<string, string[]> }>(
  '/api/appointments/slots',
  { query: { days: 14 }, lazy: true },
)

const dates = computed(() => Object.keys(data.value?.slots ?? {}).sort())
const activeDate = ref('')

watch(dates, (d) => {
  if (d.length && !d.includes(activeDate.value)) activeDate.value = d[0]
}, { immediate: true })

// If the selected slot disappears after a refresh (taken by someone else), clear it.
watch(data, () => {
  if (model.value && !Object.values(data.value?.slots ?? {}).flat().includes(model.value)) {
    model.value = ''
  }
})

const timesForActive = computed(() => data.value?.slots?.[activeDate.value] ?? [])

const dayFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Addis_Ababa',
})
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Addis_Ababa',
})

function dateLabel(d: string): string {
  return dayFmt.format(new Date(d + 'T12:00:00Z'))
}

defineExpose({ refresh })
</script>

<template>
  <div>
    <p v-if="pending" class="text-sm text-ink-soft" role="status">Loading available times…</p>
    <p v-else-if="error" class="text-sm text-danger" role="alert">
      Could not load available times.
      <button type="button" class="underline" @click="refresh()">Try again</button>
    </p>
    <p v-else-if="!dates.length" class="text-sm text-ink-soft">
      No slots are open in the next two weeks — please email atelier@fert.et.
    </p>

    <template v-else>
      <!-- Date strip -->
      <div class="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Choose a date">
        <button
          v-for="d in dates"
          :key="d"
          type="button"
          role="tab"
          :aria-selected="activeDate === d"
          class="min-h-[44px] shrink-0 border px-4 text-xs tracking-wide transition-colors"
          :class="activeDate === d ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
          @click="activeDate = d"
        >
          {{ dateLabel(d) }}
        </button>
      </div>

      <!-- Time grid -->
      <div class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5" role="listbox" aria-label="Choose a time">
        <button
          v-for="iso in timesForActive"
          :key="iso"
          type="button"
          role="option"
          :aria-selected="model === iso"
          class="min-h-[44px] border px-2 text-sm transition-colors"
          :class="model === iso ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
          @click="model = iso"
        >
          {{ timeFmt.format(new Date(iso)) }}
        </button>
      </div>
      <p class="mt-2 text-xs text-ink-soft">Times shown for Addis Ababa. Each visit lasts one hour.</p>
    </template>
  </div>
</template>
