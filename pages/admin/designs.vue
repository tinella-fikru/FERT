<script setup lang="ts">
import type { Collection, Garment } from '~/shared/types'
import { formatEtb } from '~/shared/types'
import {
  garmentCategories,
  garmentInputSchema,
  slugify,
  type GarmentInput,
} from '~/shared/garmentSchema'

definePageMeta({ middleware: 'admin' })
useHead({ title: 'Designs — FERT Admin' })

// --- Data ------------------------------------------------------------------
// Designs = the look of the cloth. Stored as the main catalog product.
const { data: collections } = await useFetch<Collection[]>('/api/admin/collections', {
  default: () => [],
})
const { data: designs, refresh } = await useFetch<Garment[]>('/api/admin/garments', {
  default: () => [],
  lazy: true,
})

// --- Form state ------------------------------------------------------------
const blank = () => ({
  name: '',
  slug: '',
  category: '' as GarmentInput['category'] | '',
  collection_slug: '' as string,
  description: '',
  story: '',
  base_price_etb: null as number | null,
  lead_time_days: 21 as number | null,
  made_to_order: true,
  image_urls: [] as string[],
  published: false,
})
const form = reactive(blank())
const editingId = ref<string | null>(null)
const isEditing = computed(() => editingId.value !== null)

const slugTouched = ref(false)
watch(
  () => form.name,
  (name) => {
    if (!slugTouched.value && !isEditing.value) form.slug = slugify(name)
  },
)

// --- Image upload ----------------------------------------------------------
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement>()

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  if (form.image_urls.length + files.length > 8) {
    uploadError.value = 'Up to 8 photos per design.'
    return
  }
  uploadError.value = ''
  uploading.value = true
  try {
    const body = new FormData()
    for (const f of files) body.append('file', f)
    const res = await $fetch<{ urls: string[] }>('/api/admin/upload', { method: 'POST', body })
    form.image_urls.push(...res.urls)
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    uploadError.value = e.data?.statusMessage ?? e.statusMessage ?? 'Upload failed.'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeImage(url: string) {
  form.image_urls = form.image_urls.filter((u) => u !== url)
}

// --- Edit / reset ----------------------------------------------------------
function startEdit(d: Garment) {
  editingId.value = d.id
  slugTouched.value = true
  Object.assign(form, {
    name: d.name,
    slug: d.slug,
    category: d.category,
    collection_slug: d.collections?.slug ?? '',
    description: d.description ?? '',
    story: d.story ?? '',
    base_price_etb: Number(d.base_price_etb),
    lead_time_days: d.lead_time_days,
    made_to_order: d.made_to_order,
    image_urls: [...(d.image_urls ?? [])],
    published: d.published,
  })
  errors.value = {}
  saveError.value = ''
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingId.value = null
  slugTouched.value = false
  Object.assign(form, blank())
  errors.value = {}
}

// --- Submit ----------------------------------------------------------------
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const saveError = ref('')
const savedName = ref('')

function validate(): GarmentInput | null {
  const candidate = {
    name: form.name,
    slug: form.slug,
    category: form.category || undefined,
    collection_slug: form.collection_slug || null,
    description: form.description || null,
    story: form.story || null,
    base_price_etb: form.base_price_etb ?? undefined,
    lead_time_days: form.lead_time_days ?? undefined,
    made_to_order: form.made_to_order,
    image_urls: form.image_urls,
    published: form.published,
    sort_order: 0,
  }
  const parsed = garmentInputSchema.safeParse(candidate)
  if (parsed.success) {
    errors.value = {}
    return parsed.data
  }
  const next: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!next[key]) next[key] = issue.message
  }
  errors.value = next
  return null
}

async function submit() {
  saveError.value = ''
  savedName.value = ''
  const payload = validate()
  if (!payload) return

  saving.value = true
  try {
    if (isEditing.value) {
      const updated = await $fetch<Garment>(`/api/admin/garments/${editingId.value}`, {
        method: 'PATCH',
        body: payload,
      })
      savedName.value = `${updated.name} (updated)`
    } else {
      const created = await $fetch<Garment>('/api/admin/garments', { method: 'POST', body: payload })
      savedName.value = created.name
    }
    cancelEdit()
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    saveError.value = e.data?.statusMessage ?? e.statusMessage ?? 'Could not save the design.'
  } finally {
    saving.value = false
  }
}

// --- Delete ----------------------------------------------------------------
const deletingId = ref<string | null>(null)
async function remove(d: Garment) {
  if (!confirm(`Delete “${d.name}”? This cannot be undone.`)) return
  deletingId.value = d.id
  saveError.value = ''
  try {
    await $fetch(`/api/admin/garments/${d.id}`, { method: 'DELETE' })
    if (editingId.value === d.id) cancelEdit()
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    saveError.value = e.data?.statusMessage ?? e.statusMessage ?? 'Could not delete the design.'
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label-caps mb-2 text-gold-deep">FERT Admin</p>
        <h1 class="font-display text-display-md">Designs</h1>
        <p class="mt-2 max-w-measure text-sm text-ink-soft">
          The look of the cloth — style, photos, price and story. These are the
          pieces customers browse and choose.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="btn-secondary">Pipeline</NuxtLink>
        <NuxtLink to="/admin/garments" class="btn-secondary">Garments</NuxtLink>
      </div>
    </div>

    <div class="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <!-- ============ Form ============ -->
      <form class="space-y-8" novalidate @submit.prevent="submit">
        <div class="flex items-center justify-between border-b border-line pb-3">
          <h2 class="font-display text-2xl">{{ isEditing ? 'Edit design' : 'New design' }}</h2>
          <button
            v-if="isEditing"
            type="button"
            class="label-caps text-ink-soft underline underline-offset-4 hover:text-ink"
            @click="cancelEdit"
          >
            Cancel edit
          </button>
        </div>

        <p v-if="savedName" class="border border-gold bg-gold-faint p-4 text-sm text-gold-deep" role="status">
          “{{ savedName }}” saved.
        </p>
        <p v-if="saveError" class="border border-danger bg-danger/5 p-4 text-sm text-danger" role="alert">
          {{ saveError }}
        </p>

        <!-- Photos -->
        <section>
          <p class="field-label">Photos</p>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <div
              v-for="url in form.image_urls"
              :key="url"
              class="group relative aspect-[3/4] overflow-hidden border border-line"
            >
              <img :src="url" alt="" class="h-full w-full object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
                @click="removeImage(url)"
              >
                ✕
              </button>
            </div>

            <label
              v-if="form.image_urls.length < 8"
              class="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line text-center text-ink-soft transition-colors hover:border-ink hover:text-ink"
              :class="{ 'pointer-events-none opacity-50': uploading }"
            >
              <span class="text-2xl">{{ uploading ? '…' : '+' }}</span>
              <span class="label-caps">{{ uploading ? 'Uploading' : 'Add photo' }}</span>
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                class="sr-only"
                @change="onFiles"
              />
            </label>
          </div>
          <p v-if="uploadError" class="field-error">{{ uploadError }}</p>
          <p v-else-if="errors.image_urls" class="field-error">{{ errors.image_urls }}</p>
          <p class="mt-2 text-xs text-ink-soft">First photo is the main image · up to 8 MB each.</p>
        </section>

        <!-- Name + slug -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="name" class="field-label">Name</label>
            <input id="name" v-model="form.name" class="input-field" placeholder="Demera Kemis" :aria-invalid="!!errors.name" />
            <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
          </div>
          <div>
            <label for="slug" class="field-label">Slug (URL)</label>
            <input id="slug" v-model="form.slug" class="input-field" placeholder="demera-kemis" :aria-invalid="!!errors.slug" @input="slugTouched = true" />
            <p v-if="errors.slug" class="field-error">{{ errors.slug }}</p>
          </div>
        </div>

        <!-- Category + collection -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="category" class="field-label">Category</label>
            <select id="category" v-model="form.category" class="input-field" :aria-invalid="!!errors.category">
              <option value="" disabled>Choose…</option>
              <option v-for="c in garmentCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
            <p v-if="errors.category" class="field-error">{{ errors.category }}</p>
          </div>
          <div>
            <label for="collection" class="field-label">Collection (optional)</label>
            <select id="collection" v-model="form.collection_slug" class="input-field">
              <option value="">None</option>
              <option v-for="c in collections" :key="c.id" :value="c.slug">{{ c.name }}</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="field-label">Short description</label>
          <textarea id="description" v-model="form.description" rows="2" class="input-field" placeholder="Full-length habesha kemis with a broad Meskel-gold tibeb at hem and cuff…" />
          <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        </div>

        <!-- Story -->
        <div>
          <label for="story" class="field-label">Story (heritage copy, optional)</label>
          <textarea id="story" v-model="form.story" rows="4" class="input-field" placeholder="The demera motif — ascending diamonds — recalls the bonfire around which Meskel turns…" />
          <p v-if="errors.story" class="field-error">{{ errors.story }}</p>
        </div>

        <!-- Price + lead time -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="price" class="field-label">Base price (ETB)</label>
            <input id="price" v-model.number="form.base_price_etb" type="number" min="0" step="1" class="input-field" placeholder="18500" :aria-invalid="!!errors.base_price_etb" />
            <p v-if="errors.base_price_etb" class="field-error">{{ errors.base_price_etb }}</p>
          </div>
          <div>
            <label for="lead" class="field-label">Lead time (days)</label>
            <input id="lead" v-model.number="form.lead_time_days" type="number" min="1" step="1" class="input-field" :aria-invalid="!!errors.lead_time_days" />
            <p v-if="errors.lead_time_days" class="field-error">{{ errors.lead_time_days }}</p>
          </div>
        </div>

        <!-- Toggles -->
        <div class="flex flex-wrap gap-8">
          <label class="flex items-center gap-3">
            <input v-model="form.made_to_order" type="checkbox" class="h-5 w-5 accent-ink" />
            <span class="label-caps text-ink">Made to order</span>
          </label>
          <label class="flex items-center gap-3">
            <input v-model="form.published" type="checkbox" class="h-5 w-5 accent-gold" />
            <span class="label-caps text-ink">Publish to storefront</span>
          </label>
        </div>

        <div class="border-t border-line pt-6">
          <button type="submit" class="btn-primary" :disabled="saving || uploading">
            {{ saving ? 'Saving…' : isEditing ? 'Update design' : 'Save design' }}
          </button>
          <span v-if="!form.published" class="ml-4 text-xs text-ink-soft">
            Saved as a draft — tick “Publish” to show it on the site.
          </span>
        </div>
      </form>

      <!-- ============ Existing designs ============ -->
      <aside class="lg:border-l lg:border-line lg:pl-8">
        <p class="label-caps mb-4 text-ink-soft">Existing designs ({{ designs.length }})</p>
        <div class="space-y-4">
          <article
            v-for="d in designs"
            :key="d.id"
            class="flex gap-3 border p-3"
            :class="editingId === d.id ? 'border-ink bg-paper-muted' : 'border-line bg-white'"
          >
            <img v-if="d.image_urls?.[0]" :src="d.image_urls[0]" alt="" class="h-20 w-16 shrink-0 object-cover" />
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-center gap-2">
                <h3 class="truncate font-display text-base">{{ d.name }}</h3>
                <span class="label-caps shrink-0" :class="d.published ? 'text-gold-deep' : 'text-ink-soft'">
                  {{ d.published ? 'Live' : 'Draft' }}
                </span>
              </div>
              <p class="mt-0.5 truncate text-xs text-ink-soft">{{ d.collections?.name ?? 'No collection' }}</p>
              <p class="mt-0.5 font-mono text-xs tabular-nums">{{ formatEtb(d.base_price_etb) }}</p>
              <div class="mt-auto flex gap-3 pt-2">
                <button type="button" class="label-caps underline underline-offset-4 hover:text-gold-deep" @click="startEdit(d)">Edit</button>
                <button
                  type="button"
                  class="label-caps text-danger underline underline-offset-4 hover:opacity-70 disabled:opacity-40"
                  :disabled="deletingId === d.id"
                  @click="remove(d)"
                >
                  {{ deletingId === d.id ? 'Deleting…' : 'Delete' }}
                </button>
              </div>
            </div>
          </article>

          <p v-if="!designs.length" class="border border-dashed border-line p-6 text-center text-xs text-ink-soft">
            No designs yet. Add your first one.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
