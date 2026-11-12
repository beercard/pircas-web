'use client'

import { useSyncExternalStore } from 'react'

import { track } from '@/lib/analytics/track'
import type { ShopProduct } from '@/lib/shop/config'
import type { AccessoryValue } from '@/lib/shop/options'
import { MAX_QTY } from '@/lib/shop/schema'

/**
 * Lista del presupuesto (localStorage). Guarda una copia del producto —sin precios— para
 * mostrarla al instante; los precios se calculan en el servidor al pedir el presupuesto.
 */

export type QuoteLine = {
  key: string
  product: ShopProduct
  color: string | null
  accessories: AccessoryValue[]
  /** Medida elegida (productos con varias medidas). */
  measure: string | null
  /** Opción con precio propio (ej. "Reja 3/8"). */
  option: string | null
  /** Elecciones sin cambio de precio (giro, vidrio…). */
  choices: string[]
  quantity: number
}

/** Lo que distingue una línea de otra del mismo producto. */
type Selection = Pick<QuoteLine, 'color' | 'accessories' | 'measure' | 'option' | 'choices'>

type State = { lines: QuoteLine[]; open: boolean }

const STORAGE_KEY = 'pircas-presupuesto-v1'
const EMPTY: State = { lines: [], open: false }

let state: State = EMPTY
let loaded = false
const listeners = new Set<() => void>()

const keyOf = (productId: number, s: Selection) =>
  [
    productId,
    s.color ?? '',
    [...s.accessories].sort().join('+'),
    s.measure ?? '',
    s.option ?? '',
    s.choices.join('+'),
  ].join(':')

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const lines = raw ? (JSON.parse(raw) as QuoteLine[]) : []
    if (Array.isArray(lines))
      state = {
        ...state,
        lines: lines
          .filter((l) => l?.product?.id && l.quantity > 0)
          .map((l) => ({
            ...l,
            accessories: Array.isArray(l.accessories) ? l.accessories : [],
            measure: l.measure ?? null,
            option: l.option ?? null,
            choices: Array.isArray(l.choices) ? l.choices : [],
          })),
      }
  } catch {
    // Almacenamiento bloqueado o dato inválido: se empieza con la lista vacía.
  }
}

function set(next: State, persist = true) {
  state = next
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.lines))
    } catch {
      // Sin almacenamiento la lista vive solo en esta pestaña.
    }
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    loaded = false
    load()
    listeners.forEach((l) => l())
  }
  window.addEventListener('storage', onStorage)
  queueMicrotask(listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const clamp = (qty: number) => Math.max(1, Math.min(qty, MAX_QTY))

/** Une líneas iguales (mismo producto y misma selección) sumando cantidades. */
function merge(lines: QuoteLine[]): QuoteLine[] {
  const out: QuoteLine[] = []
  for (const l of lines) {
    const same = out.find((o) => o.key === l.key)
    if (same) same.quantity = clamp(same.quantity + l.quantity)
    else out.push({ ...l })
  }
  return out
}

const trackParams = (
  l: Pick<QuoteLine, 'product' | 'color' | 'accessories' | 'measure' | 'quantity'>,
) => ({
  item_id: l.product.id,
  item_name: l.product.name,
  item_category: l.product.category ?? undefined,
  color: l.color ?? undefined,
  measure: l.measure ?? undefined,
  accessories: l.accessories.join(',') || undefined,
  quantity: l.quantity,
})

export const quote = {
  add(
    product: ShopProduct,
    opts: Partial<Selection> & { quantity?: number } = {},
    { open = true }: { open?: boolean } = {},
  ) {
    load()
    const color = opts.color ?? product.colors[0]?.value ?? null
    const selection: Selection = {
      color,
      accessories: [...(opts.accessories ?? [])].sort(),
      measure: opts.measure ?? null,
      option: opts.option ?? null,
      choices: opts.choices ?? [],
    }
    const quantity = clamp(opts.quantity ?? 1)
    // La lista guarda una copia liviana del producto (sin la tabla de medidas).
    const { variants: _variants, ...light } = product
    const line = { key: keyOf(product.id, selection), product: light, ...selection, quantity }
    set({ lines: merge([...state.lines, line]), open })
    track('add_to_quote', trackParams(line))
  },
  setQuantity(key: string, quantity: number) {
    set({
      ...state,
      lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: clamp(quantity) } : l)),
    })
  },
  /** Cambia color o accesorios de una línea (si queda igual a otra, se unen). */
  update(key: string, patch: { color?: string | null; accessories?: AccessoryValue[] }) {
    const lines = state.lines.map((l) => {
      if (l.key !== key) return l
      const color = patch.color !== undefined ? patch.color : l.color
      const accessories = [...(patch.accessories ?? l.accessories)].sort()
      return { ...l, color, accessories, key: keyOf(l.product.id, { ...l, color, accessories }) }
    })
    set({ ...state, lines: merge(lines) })
  },
  remove(key: string) {
    const line = state.lines.find((l) => l.key === key)
    set({ ...state, lines: state.lines.filter((l) => l.key !== key) })
    if (line) track('remove_from_quote', trackParams(line))
  },
  clear() {
    set({ lines: [], open: false })
  },
  open: () => set({ ...state, open: true }, false),
  close: () => set({ ...state, open: false }, false),
  /** Actualiza las líneas con los datos actuales del servidor y quita lo que ya no existe. */
  sync(fresh: (Selection & { product: ShopProduct; quantity: number })[]) {
    const lines = fresh.map((f) => ({ ...f, key: keyOf(f.product.id, f) }))
    set({ ...state, lines: merge(lines) })
  },
}

export function useQuote(): State & { count: number; ready: boolean } {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  )
  return {
    ...snapshot,
    count: snapshot.lines.reduce((n, l) => n + l.quantity, 0),
    ready: loaded,
  }
}

export const toQuoteItems = (lines: QuoteLine[]) =>
  lines.map((l) => ({
    productId: l.product.id,
    color: l.color,
    accessories: l.accessories,
    measure: l.measure,
    option: l.option,
    choices: l.choices,
    quantity: l.quantity,
  }))
