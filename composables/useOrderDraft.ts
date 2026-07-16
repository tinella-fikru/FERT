import type { Measurements } from '~/shared/types'

export interface OrderDraft {
  garment_slug: string | null
  tibeb_slug: string | null
  sizing_mode: 'standard' | 'custom'
  size_label: string | null
  measurements: Measurements
  notes: string
}

const emptyDraft = (): OrderDraft => ({
  garment_slug: null,
  tibeb_slug: null,
  sizing_mode: 'standard',
  size_label: null,
  measurements: {},
  notes: '',
})

/**
 * Order wizard draft — persisted to sessionStorage so a sign-in
 * redirect mid-order doesn't lose the configuration.
 */
export function useOrderDraft() {
  const draft = useState<OrderDraft>('order-draft', emptyDraft)

  if (import.meta.client) {
    const saved = sessionStorage.getItem('fert-order-draft')
    if (saved && !draft.value.garment_slug) {
      try {
        draft.value = { ...emptyDraft(), ...JSON.parse(saved) }
      } catch {
        /* corrupt draft — start fresh */
      }
    }
    watch(
      draft,
      (val) => sessionStorage.setItem('fert-order-draft', JSON.stringify(val)),
      { deep: true },
    )
  }

  function reset() {
    draft.value = emptyDraft()
    if (import.meta.client) sessionStorage.removeItem('fert-order-draft')
  }

  return { draft, reset }
}
