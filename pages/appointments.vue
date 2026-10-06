<script setup lang="ts">
const route = useRoute()

const form = reactive({
  full_name: '',
  email: '',
  phone: '',
  scheduled_at: '',
  purpose: '',
})

// Fitting invite deep-link: /appointments?order=FERT-2026-0001
if (typeof route.query.order === 'string' && route.query.order) {
  form.purpose = `Final fitting for order ${route.query.order}`
}

const slotPicker = ref<{ refresh: () => Promise<void> }>()
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const done = ref(false)
const serverError = ref('')

function validate(): boolean {
  errors.value = {}
  if (form.full_name.trim().length < 2) errors.value.full_name = 'Your name is required'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.value.email = 'A valid email is required'
  if (form.phone && !/^\+?[0-9\s-]{9,15}$/.test(form.phone)) errors.value.phone = 'Enter a valid phone number'
  if (!form.scheduled_at) errors.value.scheduled_at = 'Choose an available time slot'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  serverError.value = ''
  if (!validate()) {
    // focus first invalid field
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  submitting.value = true
  try {
    await $fetch('/api/appointments', { method: 'POST', body: { ...form } })
    done.value = true
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { statusMessage?: string } }
    if (err.statusCode === 409 || err.data?.statusMessage === 'slot_taken') {
      serverError.value = 'That time was just booked by someone else — please pick another slot.'
      form.scheduled_at = ''
      await slotPicker.value?.refresh()
    } else {
      serverError.value = err.data?.statusMessage ?? 'Could not book the appointment. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

const intro = ref<HTMLElement>()
useReveal(intro)

useHead({
  title: 'Private Appointments — FERT',
  meta: [
    { name: 'description', content: 'Book a private appointment at the FERT atelier in Bole, Addis Ababa — fittings, measurements, and made-to-order consultations.' },
  ],
})
</script>

<template>
  <div>
    <!-- Header -->
    <section class="texture-paper bg-ink px-4 py-section text-paper sm:px-8">
      <div class="mx-auto max-w-7xl">
        <p class="label-caps mb-4 text-gold">Private appointment with a stylist</p>
        <h1 class="font-display text-display-lg font-bold">Visit the atelier</h1>
        <p class="mt-6 max-w-measure leading-relaxed text-paper/70">
          One hour, unhurried — measurements, fabric selection, and a
          conversation about the garment you have in mind. Monday to Saturday
          in Bole, Addis Ababa.
        </p>
      </div>
    </section>

    <div class="rule-hard" aria-hidden="true" />

    <div ref="intro" class="gsap-reveal mx-auto grid max-w-7xl gap-14 px-4 py-section sm:px-8 md:grid-cols-[3fr_2fr]">
      <!-- Booking form -->
      <div v-if="!done">
        <h2 class="font-display text-2xl">Request an appointment</h2>

        <form class="mt-8 space-y-6" novalidate @submit.prevent="submit">
          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="ap-name" class="field-label">Full name *</label>
              <input
                id="ap-name"
                v-model="form.full_name"
                type="text"
                autocomplete="name"
                class="input-field"
                :aria-invalid="!!errors.full_name"
                :aria-describedby="errors.full_name ? 'err-name' : undefined"
              />
              <p v-if="errors.full_name" id="err-name" class="field-error" role="alert">{{ errors.full_name }}</p>
            </div>
            <div>
              <label for="ap-email" class="field-label">Email *</label>
              <input
                id="ap-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="input-field"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'err-email' : undefined"
              />
              <p v-if="errors.email" id="err-email" class="field-error" role="alert">{{ errors.email }}</p>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="ap-phone" class="field-label">Phone (optional)</label>
              <input
                id="ap-phone"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                placeholder="+251 …"
                class="input-field"
                :aria-invalid="!!errors.phone"
                :aria-describedby="errors.phone ? 'err-phone' : undefined"
              />
              <p v-if="errors.phone" id="err-phone" class="field-error" role="alert">{{ errors.phone }}</p>
            </div>
          </div>

          <fieldset>
            <legend class="field-label">Pick a time *</legend>
            <SlotPicker ref="slotPicker" v-model="form.scheduled_at" />
            <p v-if="errors.scheduled_at" class="field-error" role="alert">{{ errors.scheduled_at }}</p>
          </fieldset>

          <div>
            <label for="ap-purpose" class="field-label">What brings you in? (optional)</label>
            <textarea
              id="ap-purpose"
              v-model="form.purpose"
              rows="3"
              maxlength="300"
              class="input-field"
              placeholder="A fitting, measurements for an order, a wedding consultation…"
            />
          </div>

          <p v-if="serverError" class="border border-danger bg-danger/5 p-4 text-sm text-danger" role="alert">
            {{ serverError }}
          </p>

          <button type="submit" class="btn-primary w-full sm:w-auto" :disabled="submitting">
            <span v-if="submitting" class="inline-block h-4 w-4 animate-spin border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ submitting ? 'Sending…' : 'Request appointment' }}
          </button>
        </form>
      </div>

      <!-- Success state -->
      <div v-else class="flex flex-col justify-center py-10">
        <p class="label-caps text-gold-deep">Request received</p>
        <h2 class="mt-4 font-display text-display-md">We'll see you soon.</h2>
        <p class="mt-6 max-w-measure leading-relaxed text-ink-soft">
          Your request is with the atelier. We'll confirm the exact time by
          email within one working day.
        </p>
        <NuxtLink to="/collections" class="btn-secondary mt-10 self-start">
          Browse the collections
        </NuxtLink>
      </div>

      <!-- Sidebar: practical info -->
      <aside class="space-y-8 md:border-l md:border-line md:pl-10">
        <div>
          <h2 class="label-caps mb-3 text-gold-deep">The atelier</h2>
          <address class="text-sm not-italic leading-relaxed text-ink-soft">
            Bole, Addis Ababa, Ethiopia<br />
            Monday – Saturday, 9:00 – 18:00<br />
            atelier@fert.et
          </address>
        </div>
        <div>
          <h2 class="label-caps mb-3 text-gold-deep">What to expect</h2>
          <ul class="space-y-2 text-sm leading-relaxed text-ink-soft">
            <li>— A one-hour private session</li>
            <li>— Full measurements taken by our tailors</li>
            <li>— Fabric and tibeb selection in person</li>
            <li>— No obligation to order</li>
          </ul>
        </div>
        <GarmentImage alt="Inside the FERT atelier" ratio="4/3" tone="gold" label="Bole Atelier" />
      </aside>
    </div>
  </div>
</template>
