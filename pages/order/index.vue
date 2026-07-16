<script setup lang="ts">
import type { Garment, TibebPattern } from '~/shared/types'
import { formatEtb, CATEGORY_LABELS, STANDARD_SIZES } from '~/shared/types'
import { orderInputSchema, measurementFields } from '~/shared/orderSchema'

definePageMeta({ middleware: undefined }) // wizard is public; auth gate is at checkout

const route = useRoute()
const router = useRouter()
const { draft } = useOrderDraft()

const [{ data: garments }, { data: patterns }] = await Promise.all([
  useFetch<Garment[]>('/api/garments', { default: () => [] }),
  useFetch<TibebPattern[]>('/api/tibeb', { default: () => [] }),
])

// Pre-select garment from ?garment= query
onMounted(() => {
  const q = route.query.garment
  if (typeof q === 'string' && garments.value.some((g) => g.slug === q)) {
    draft.value.garment_slug = q
    if (step.value === 1) step.value = 2
  }
})

// --- Wizard state ------------------------------------------------------------
const step = ref(1)
const STEPS = ['Garment', 'Tibeb', 'Sizing', 'Review'] as const
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const submitError = ref('')

const garment = computed(() => garments.value.find((g) => g.slug === draft.value.garment_slug))
const tibeb = computed(() => patterns.value.find((p) => p.slug === draft.value.tibeb_slug))
const total = computed(
  () => (garment.value?.base_price_etb ?? 0) + (tibeb.value?.price_delta_etb ?? 0),
)

function goTo(n: number) {
  // Only allow moving to steps whose prerequisites are met
  if (n >= 2 && !draft.value.garment_slug) return
  if (n >= 3 && !draft.value.tibeb_slug) return
  errors.value = {}
  step.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function validateSizing(): boolean {
  errors.value = {}
  if (draft.value.sizing_mode === 'standard') {
    if (!draft.value.size_label) {
      errors.value.size_label = 'Select a size'
      return false
    }
    return true
  }
  let ok = true
  for (const f of measurementFields) {
    const v = draft.value.measurements[f.key]
    if (v == null || Number.isNaN(v)) {
      errors.value[f.key] = `${f.label} is required`
      ok = false
    } else if (v < f.min || v > f.max) {
      errors.value[f.key] = `${f.label} must be ${f.min}–${f.max} cm`
      ok = false
    }
  }
  return ok
}

async function submitOrder() {
  submitError.value = ''

  const payload = {
    garment_slug: draft.value.garment_slug!,
    tibeb_slug: draft.value.tibeb_slug!,
    sizing_mode: draft.value.sizing_mode,
    size_label: draft.value.size_label ?? undefined,
    measurements:
      draft.value.sizing_mode === 'custom' ? draft.value.measurements : undefined,
    notes: draft.value.notes || undefined,
  }

  const parsed = orderInputSchema.safeParse(payload)
  if (!parsed.success) {
    submitError.value = 'Please review your configuration — some details are incomplete.'
    return
  }

  submitting.value = true
  try {
    const order = await $fetch<{ id: string; checkout_url: string }>('/api/orders', {
      method: 'POST',
      body: parsed.data,
    })
    // Chapa hosted checkout
    window.location.href = order.checkout_url
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { statusMessage?: string } }
    if (err.statusCode === 401) {
      // Preserve draft (sessionStorage) and send to sign-in
      router.push(`/sign-in?redirect_url=${encodeURIComponent('/order')}`)
    } else {
      submitError.value =
        err.data?.statusMessage ?? 'Something went wrong placing your order. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

useHead({ title: 'Made to Order — FERT' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-14 sm:px-8">
    <p class="label-caps mb-3 text-gold-deep">Made to order</p>
    <h1 class="font-display text-display-md">Your garment, begun for you</h1>

    <!-- Stepper -->
    <nav aria-label="Order progress" class="mt-10">
      <ol class="flex flex-wrap gap-y-2">
        <li v-for="(s, i) in STEPS" :key="s" class="flex items-center">
          <button
            type="button"
            class="flex min-h-[44px] items-center gap-2 pr-3 label-caps transition-colors"
            :class="step === i + 1 ? 'text-ink' : 'text-ink-soft/60 hover:text-ink-soft'"
            :aria-current="step === i + 1 ? 'step' : undefined"
            @click="goTo(i + 1)"
          >
            <span
              class="flex h-6 w-6 items-center justify-center border font-mono text-xs"
              :class="step > i + 1 ? 'border-gold bg-gold text-ink' : step === i + 1 ? 'border-ink' : 'border-line'"
            >
              {{ i + 1 }}
            </span>
            {{ s }}
          </button>
          <span v-if="i < STEPS.length - 1" class="mr-3 h-px w-6 bg-line sm:w-10" aria-hidden="true" />
        </li>
      </ol>
    </nav>

    <!-- ============ STEP 1: Garment ============ -->
    <section v-if="step === 1" class="mt-12">
      <h2 class="sr-only">Choose a garment</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="(g, i) in garments"
          :key="g.id"
          type="button"
          class="group border text-left transition-colors duration-200"
          :class="draft.garment_slug === g.slug ? 'border-ink' : 'border-line hover:border-ink-soft'"
          :aria-pressed="draft.garment_slug === g.slug"
          @click="draft.garment_slug = g.slug"
        >
          <GarmentImage
            :src="g.image_urls[0]"
            :alt="g.name"
            ratio="4/3"
            :tone="(['light', 'gold', 'dark'] as const)[i % 3]"
            :label="CATEGORY_LABELS[g.category]"
          />
          <div class="flex items-baseline justify-between p-4">
            <span class="font-display">{{ g.name }}</span>
            <span class="font-mono text-sm tabular-nums">{{ formatEtb(g.base_price_etb) }}</span>
          </div>
          <div
            class="mx-4 mb-4 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300"
            :class="{ 'scale-x-100': draft.garment_slug === g.slug }"
            aria-hidden="true"
          />
        </button>
      </div>
      <div class="mt-10 flex justify-end">
        <button type="button" class="btn-primary" :disabled="!draft.garment_slug" @click="goTo(2)">
          Continue — Tibeb
        </button>
      </div>
    </section>

    <!-- ============ STEP 2: Tibeb ============ -->
    <section v-else-if="step === 2" class="mt-12">
      <h2 class="font-display text-2xl">Choose your tibeb</h2>
      <p class="mt-2 max-w-measure text-sm leading-relaxed text-ink-soft">
        The tibeb is the embroidered border that gives the garment its voice.
        Each is worked by a single artisan, start to finish.
      </p>

      <div class="mt-8 space-y-3" role="radiogroup" aria-label="Tibeb pattern">
        <button
          v-for="p in patterns"
          :key="p.id"
          type="button"
          role="radio"
          :aria-checked="draft.tibeb_slug === p.slug"
          class="flex w-full items-center justify-between gap-4 border p-5 text-left transition-colors duration-200"
          :class="draft.tibeb_slug === p.slug ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink-soft'"
          @click="draft.tibeb_slug = p.slug"
        >
          <span>
            <span class="font-display text-lg">{{ p.name }}</span>
            <span class="mt-1 block text-sm" :class="draft.tibeb_slug === p.slug ? 'text-paper/70' : 'text-ink-soft'">
              {{ p.description }}
            </span>
          </span>
          <span class="shrink-0 font-mono text-sm tabular-nums" :class="draft.tibeb_slug === p.slug ? 'text-gold' : 'text-gold-deep'">
            {{ p.price_delta_etb > 0 ? `+ ${formatEtb(p.price_delta_etb)}` : 'Included' }}
          </span>
        </button>
      </div>

      <div class="mt-10 flex justify-between">
        <button type="button" class="btn-secondary" @click="goTo(1)">Back</button>
        <button type="button" class="btn-primary" :disabled="!draft.tibeb_slug" @click="goTo(3)">
          Continue — Sizing
        </button>
      </div>
    </section>

    <!-- ============ STEP 3: Sizing ============ -->
    <section v-else-if="step === 3" class="mt-12">
      <h2 class="font-display text-2xl">Sizing</h2>

      <div class="mt-6 flex gap-2" role="radiogroup" aria-label="Sizing mode">
        <button
          type="button"
          role="radio"
          :aria-checked="draft.sizing_mode === 'standard'"
          class="min-h-[44px] border px-6 label-caps transition-colors"
          :class="draft.sizing_mode === 'standard' ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
          @click="draft.sizing_mode = 'standard'"
        >
          Standard size
        </button>
        <button
          type="button"
          role="radio"
          :aria-checked="draft.sizing_mode === 'custom'"
          class="min-h-[44px] border px-6 label-caps transition-colors"
          :class="draft.sizing_mode === 'custom' ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
          @click="draft.sizing_mode = 'custom'"
        >
          Custom measurements
        </button>
      </div>

      <!-- Standard sizes -->
      <div v-if="draft.sizing_mode === 'standard'" class="mt-8">
        <p class="field-label">Select a size</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in STANDARD_SIZES"
            :key="s"
            type="button"
            class="min-h-[44px] min-w-[56px] border px-4 font-mono text-sm transition-colors"
            :class="draft.size_label === s ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
            :aria-pressed="draft.size_label === s"
            @click="draft.size_label = s"
          >
            {{ s }}
          </button>
        </div>
        <p v-if="errors.size_label" class="field-error" role="alert">{{ errors.size_label }}</p>
        <p class="mt-4 max-w-measure text-sm text-ink-soft">
          Standard sizes are adjusted at your final fitting. For ceremonial
          garments we recommend custom measurements.
        </p>
      </div>

      <!-- Custom measurements -->
      <div v-else class="mt-8">
        <p class="mb-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          All measurements in centimetres. Measure over light clothing; if in
          doubt, book an appointment and we'll measure you at the atelier.
        </p>
        <div class="grid gap-5 sm:grid-cols-2">
          <div v-for="f in measurementFields" :key="f.key">
            <label :for="`m-${f.key}`" class="field-label">{{ f.label }} (cm)</label>
            <input
              :id="`m-${f.key}`"
              v-model.number="draft.measurements[f.key]"
              type="number"
              inputmode="decimal"
              :min="f.min"
              :max="f.max"
              class="input-field"
              :aria-invalid="!!errors[f.key]"
              :aria-describedby="errors[f.key] ? `err-${f.key}` : undefined"
            />
            <p v-if="errors[f.key]" :id="`err-${f.key}`" class="field-error" role="alert">
              {{ errors[f.key] }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <label for="notes" class="field-label">Notes for the atelier (optional)</label>
        <textarea
          id="notes"
          v-model="draft.notes"
          rows="3"
          maxlength="1000"
          class="input-field"
          placeholder="Occasion, preferred fit, anything we should know…"
        />
      </div>

      <div class="mt-10 flex justify-between">
        <button type="button" class="btn-secondary" @click="goTo(2)">Back</button>
        <button type="button" class="btn-primary" @click="validateSizing() && goTo(4)">
          Continue — Review
        </button>
      </div>
    </section>

    <!-- ============ STEP 4: Review ============ -->
    <section v-else-if="step === 4" class="mt-12">
      <h2 class="font-display text-2xl">Review your order</h2>

      <div class="mt-8 border border-ink">
        <div class="grid sm:grid-cols-[1fr_2fr]">
          <GarmentImage
            v-if="garment"
            :src="garment.image_urls[0]"
            :alt="garment.name"
            ratio="1/1"
            tone="dark"
            :label="CATEGORY_LABELS[garment.category]"
          />
          <dl class="space-y-4 p-6 sm:p-8">
            <div class="flex justify-between gap-4">
              <dt class="label-caps text-ink-soft">Garment</dt>
              <dd class="text-right font-display">{{ garment?.name }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="label-caps text-ink-soft">Tibeb</dt>
              <dd class="text-right">{{ tibeb?.name }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="label-caps text-ink-soft">Sizing</dt>
              <dd class="text-right">
                {{ draft.sizing_mode === 'standard' ? `Standard — ${draft.size_label}` : 'Custom measurements' }}
              </dd>
            </div>
            <div v-if="draft.notes" class="flex justify-between gap-4">
              <dt class="label-caps text-ink-soft">Notes</dt>
              <dd class="max-w-[24ch] text-right text-sm text-ink-soft">{{ draft.notes }}</dd>
            </div>
            <div class="flex justify-between gap-4 border-t border-line pt-4">
              <dt class="label-caps text-ink-soft">Lead time</dt>
              <dd class="text-right">≈ {{ garment?.lead_time_days }} days</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-4">
              <dt class="label-caps">Total</dt>
              <dd class="font-mono text-2xl tabular-nums">{{ formatEtb(total) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p v-if="submitError" class="mt-6 border border-danger bg-danger/5 p-4 text-sm text-danger" role="alert">
        {{ submitError }}
      </p>

      <div class="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" class="btn-secondary" :disabled="submitting" @click="goTo(3)">
          Back
        </button>
        <button type="button" class="btn-gold" :disabled="submitting" @click="submitOrder">
          <span v-if="submitting" class="inline-block h-4 w-4 animate-spin border-2 border-ink border-t-transparent" aria-hidden="true" />
          {{ submitting ? 'Preparing checkout…' : `Pay ${formatEtb(total)} with Chapa` }}
        </button>
      </div>
      <p class="mt-4 text-right text-xs text-ink-soft">
        Secure payment via Chapa — telebirr, CBE Birr, and cards accepted.
      </p>
    </section>
  </div>
</template>
