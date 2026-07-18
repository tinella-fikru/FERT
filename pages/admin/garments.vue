<script setup lang="ts">
import type { TibebPattern } from '~/shared/types'
import { formatEtb } from '~/shared/types'
import { designInputSchema, slugify, type DesignInput } from '~/shared/designSchema'

definePageMeta({ middleware: 'admin' })
useHead({ title: 'Garments — FERT Admin' })

// --- Data ------------------------------------------------------------------
// Garments = the material the clothes are made of. Stored as the selectable
// option customers pick during an order (tibeb_patterns table).
const { data: garments, refresh } = await useFetch<TibebPattern[]>('/api/admin/tibeb', {
  default: () => [],
  lazy: true,
})

// --- Form state ------------------------------------------------------------
const blank = () => ({
  name: '',
  slug: '',
  description: '',
  story: '',
  price_delta_etb: 0 as number | null,
  image_urls: [] as string[],
  available: true,
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
    uploadError.value = 'Up to 8 photos per garment.'
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
function startEdit(g: TibebPattern) {
  editingId.value = g.id
  slugTouched.value = true
  Object.assign(form, {
    name: g.name,
    slug: g.slug,
    description: g.description ?? '',
    story: g.story ?? '',
    price_delta_etb: Number(g.price_delta_etb),
    image_urls: [...(g.image_urls?.length ? g.image_urls : g.image_url ? [g.image_url] : [])],
    available: g.available,
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

function validate(): DesignInput | null {
  const candidate = {
    name: form.name,
    slug: form.slug,
    description: form.description || null,
    story: form.story || null,
    price_delta_etb: form.price_delta_etb ?? undefined,
    image_urls: form.image_urls,
    available: form.available,
  }
  const parsed = designInputSchema.safeParse(candidate)
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
      const updated = await $fetch<TibebPattern>(`/api/admin/tibeb/${editingId.value}`, {
        method: 'PATCH',
        body: payload,
      })
      savedName.value = `${updated.name} (updated)`
    } else {
      const created = await $fetch<TibebPattern>('/api/admin/tibeb', {
        method: 'POST',
        body: payload,
      })
      savedName.value = created.name
    }
    cancelEdit()
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    saveError.value = e.data?.statusMessage ?? e.statusMessage ?? 'Could not save the garment.'
  } finally {
    saving.value = false
  }
}

// --- Delete ----------------------------------------------------------------
const deletingId = ref<string | null>(null)
async function remove(g: TibebPattern) {
  if (!confirm(`Delete “${g.name}”? This cannot be undone.`)) return
  deletingId.value = g.id
  saveError.value = ''
  try {
    await $fetch(`/api/admin/tibeb/${g.id}`, { method: 'DELETE' })
    if (editingId.value === g.id) cancelEdit()
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    saveError.value = e.data?.statusMessage ?? e.statusMessage ?? 'Could not delete the garment.'
  } finally {
    deletingId.value = null
  }
}

function primaryImage(g: TibebPattern) {
  return g.image_urls?.[0] ?? g.image_url ?? null
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label-caps mb-2 text-gold-deep">FERT Admin</p>
        <h1 class="font-display text-display-md">Garments</h1>
        <p class="mt-2 max-w-measure text-sm text-ink-soft">
          The material a piece is made of — wool, cotton, menen. Customers pick
          one while ordering.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="btn-secondary">Pipeline</NuxtLink>
        <NuxtLink to="/admin/designs" class="btn-secondary">Designs</NuxtLink>
      </div>
    </div>

    <div class="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <!-- ============ Form ============ -->
      <form class="space-y-8" novalidate @submit.prevent="submit">
        <div class="flex items-center justify-between border-b border-line pb-3">
          <h2 class="font-display text-2xl">{{ isEditing ? 'Edit garment' : 'New garment' }}</h2>
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
          <p class="field-label">Photos (optional)</p>
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
          <p class="mt-2 text-xs text-ink-soft">A swatch photo of the material · up to 8 MB each.</p>
        </section>

        <!-- Name + slug -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="name" class="field-label">Name</label>
            <input id="name" v-model="form.name" class="input-field" placeholder="Menen Cotton" :aria-invalid="!!errors.name" />
            <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
          </div>
          <div>
            <label for="slug" class="field-label">Slug (URL)</label>
            <input id="slug" v-model="form.slug" class="input-field" placeholder="menen-cotton" :aria-invalid="!!errors.slug" @input="slugTouched = true" />
            <p v-if="errors.slug" class="field-error">{{ errors.slug }}</p>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="field-label">Short description</label>
          <textarea id="description" v-model="form.description" rows="2" class="input-field" placeholder="Handwoven first-pass cotton, light and breathable." />
          <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        </div>

        <!-- Story -->
        <div>
          <label for="story" class="field-label">Notes (optional)</label>
          <textarea id="story" v-model="form.story" rows="3" class="input-field" placeholder="Anything customers should know about this material…" />
          <p v-if="errors.story" class="field-error">{{ errors.story }}</p>
        </div>

        <!-- Price + availability -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="price" class="field-label">Price add-on (ETB)</label>
            <input id="price" v-model.number="form.price_delta_etb" type="number" min="0" step="1" class="input-field" placeholder="0" :aria-invalid="!!errors.price_delta_etb" />
            <p v-if="errors.price_delta_etb" class="field-error">{{ errors.price_delta_etb }}</p>
            <p class="mt-1.5 text-xs text-ink-soft">Added on top of the design price. 0 = included.</p>
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-3 pb-3">
              <input v-model="form.available" type="checkbox" class="h-5 w-5 accent-gold" />
              <span class="label-caps text-ink">Available to customers</span>
            </label>
          </div>
        </div>

        <div class="border-t border-line pt-6">
          <button type="submit" class="btn-primary" :disabled="saving || uploading">
            {{ saving ? 'Saving…' : isEditing ? 'Update garment' : 'Save garment' }}
          </button>
        </div>
      </form>

      <!-- ============ Existing garments ============ -->
      <aside class="lg:border-l lg:border-line lg:pl-8">
        <p class="label-caps mb-4 text-ink-soft">Existing garments ({{ garments.length }})</p>
        <div class="space-y-4">
          <article
            v-for="g in garments"
            :key="g.id"
            class="flex gap-3 border p-3"
            :class="editingId === g.id ? 'border-ink bg-paper-muted' : 'border-line bg-white'"
          >
            <img v-if="primaryImage(g)" :src="primaryImage(g)!" alt="" class="h-20 w-16 shrink-0 object-cover" />
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-center gap-2">
                <h3 class="truncate font-display text-base">{{ g.name }}</h3>
                <span class="label-caps shrink-0" :class="g.available ? 'text-gold-deep' : 'text-ink-soft'">
                  {{ g.available ? 'Live' : 'Hidden' }}
                </span>
              </div>
              <p class="mt-0.5 font-mono text-xs tabular-nums">
                {{ g.price_delta_etb > 0 ? `+ ${formatEtb(g.price_delta_etb)}` : 'Included' }}
              </p>
              <div class="mt-auto flex gap-3 pt-2">
                <button type="button" class="label-caps underline underline-offset-4 hover:text-gold-deep" @click="startEdit(g)">Edit</button>
                <button
                  type="button"
                  class="label-caps text-danger underline underline-offset-4 hover:opacity-70 disabled:opacity-40"
                  :disabled="deletingId === g.id"
                  @click="remove(g)"
                >
                  {{ deletingId === g.id ? 'Deleting…' : 'Delete' }}
                </button>
              </div>
            </div>
          </article>

          <p v-if="!garments.length" class="border border-dashed border-line p-6 text-center text-xs text-ink-soft">
            No garments yet. Add your first one.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
