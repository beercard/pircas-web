'use client'

import { useSyncExternalStore } from 'react'

import type { ShopProduct } from '@/lib/shop/config'
import { MAX_QTY } from '@/lib/shop/schema'

/**
 * Carrito del lado del navegador (localStorage). Guarda una copia del producto para mostrarlo
 * al instante; los precios y el stock se vuelven a leer del servidor en el carrito y al
 * confirmar el pedido.
 */

export type CartLine = {
  key: string
  product: ShopProduct
  color: string | null
  quantity: number
  issue?: string | null
}

type State = { lines: CartLine[]; open: boolean }

const STORAGE_KEY = 'pircas-cart-v1'
const EMPTY: State = { lines: [], open: false }

let state: State = EMPTY
let loaded = false
const listeners = new Set<() => void>()

const keyOf = (productId: number, color: string | null) => `${productId}:${color ?? ''}`

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const lines = raw ? (JSON.parse(raw) as CartLine[]) : []
    if (Array.isArray(lines))
      state = { ...state, lines: lines.filter((l) => l?.product?.id && l.quantity > 0) }
  } catch {
    // Almacenamiento bloqueado o dato inválido: se empieza con el carrito vacío.
  }
}

function set(next: State, persist = true) {
  state = next
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.lines))
    } catch {
      // Sin almacenamiento el carrito vive solo en esta pestaña.
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
  // Primera lectura después de hidratar.
  queueMicrotask(listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const limit = (product: ShopProduct, qty: number) =>
  Math.max(1, Math.min(qty, MAX_QTY, product.stock ?? MAX_QTY))

export const cart = {
  add(product: ShopProduct, color: string | null, quantity = 1) {
    load()
    const key = keyOf(product.id, color)
    const existing = state.lines.find((l) => l.key === key)
    const lines = existing
      ? state.lines.map((l) =>
          l.key === key ? { ...l, product, quantity: limit(product, l.quantity + quantity) } : l,
        )
      : [...state.lines, { key, product, color, quantity: limit(product, quantity) }]
    set({ lines, open: true })
  },
  setQuantity(key: string, quantity: number) {
    set({
      ...state,
      lines: state.lines.map((l) =>
        l.key === key ? { ...l, quantity: limit(l.product, quantity) } : l,
      ),
    })
  },
  remove(key: string) {
    set({ ...state, lines: state.lines.filter((l) => l.key !== key) })
  },
  clear() {
    set({ lines: [], open: false })
  },
  open: () => set({ ...state, open: true }, false),
  close: () => set({ ...state, open: false }, false),
  /** Reemplaza las líneas con los datos actuales del servidor (precios, stock). */
  sync(
    fresh: { product: ShopProduct; color: string | null; issue: string | null }[],
    missing: number[],
  ) {
    const lines = state.lines
      .filter((l) => !missing.includes(l.product.id))
      .map((l) => {
        const f = fresh.find((x) => x.product.id === l.product.id && (x.color ?? null) === l.color)
        return f ? { ...l, product: f.product, issue: f.issue } : l
      })
    set({ ...state, lines })
  },
}

export function useCart(): State & { count: number; ready: boolean } {
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

export const toCartItems = (lines: CartLine[]) =>
  lines.map((l) => ({ productId: l.product.id, color: l.color, quantity: l.quantity }))
