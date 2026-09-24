import { describe, expect, it } from 'vitest'

import {
  areaM2,
  DEFAULT_PRICING,
  describeItem,
  formatARS,
  unitEstimate,
  validDimensions,
  type QuoteLine,
  type QuoteProduct,
} from '@/lib/quote/pricing'

const reforzada: QuoteLine = {
  id: 2,
  name: 'Herrero Reforzada',
  slug: 'herrero-reforzada',
  pricePerM2: 260_000,
  glass: [
    { name: 'Float', multiplier: 1 },
    { name: 'Laminado', multiplier: 1.25 },
  ],
}

const corrediza: QuoteProduct = {
  id: 1,
  name: 'Ventana corrediza',
  slug: 'ventana-corrediza',
  categoryId: 1,
  pricing: 'line',
  pricePerM2: null,
  multiplier: 1,
  secondSide: false,
  fixedDescription: null,
}

const puerta: QuoteProduct = { ...corrediza, id: 3, name: 'Puerta de aluminio', multiplier: 1.3 }

const angular: QuoteProduct = {
  ...corrediza,
  id: 9,
  name: 'Mampara angular',
  pricing: 'fixed',
  pricePerM2: 390_000,
  secondSide: true,
  fixedDescription: 'Modena · Paneles Klara',
}

describe('cotizador: precio estimado', () => {
  it('calcula precio por línea, vidrio y superficie (caso del diseño)', () => {
    // 260.000 × 1,25 (laminado) × 1,65 m² = 536.250 → redondeo a 1.000
    const price = unitEstimate(
      { productId: 1, lineId: 2, glass: 'Laminado', width: 150, height: 110, quantity: 1 },
      corrediza,
      reforzada,
    )
    expect(price).toBe(536_000)
  })

  it('aplica el multiplicador del producto', () => {
    const base = unitEstimate(
      { productId: 1, lineId: 2, glass: 'Float', width: 100, height: 200, quantity: 1 },
      corrediza,
      reforzada,
    )!
    const door = unitEstimate(
      { productId: 3, lineId: 2, glass: 'Float', width: 100, height: 200, quantity: 1 },
      puerta,
      reforzada,
    )!
    expect(door).toBe(Math.round((base * 1.3) / 1000) * 1000)
  })

  it('cobra una superficie mínima', () => {
    expect(areaM2({ width: 30, height: 30 }, false, 0.5)).toBe(0.5)
    const tiny = unitEstimate(
      { productId: 1, lineId: 2, glass: 'Float', width: 30, height: 30, quantity: 1 },
      corrediza,
      reforzada,
    )
    expect(tiny).toBe(130_000) // 260.000 × 0,5 m²
  })

  it('usa el precio propio y el segundo lado en mamparas angulares', () => {
    // (90 + 80) × 200 / 10.000 = 3,4 m² × 390.000 = 1.326.000
    const price = unitEstimate(
      { productId: 9, width: 90, height: 200, side2: 80, quantity: 1 },
      angular,
      null,
    )
    expect(price).toBe(1_326_000)
  })

  it('ignora el vidrio en productos de precio propio', () => {
    const a = unitEstimate(
      { productId: 9, width: 90, height: 200, quantity: 1, glass: 'DVH' },
      angular,
      null,
    )
    const b = unitEstimate({ productId: 9, width: 90, height: 200, quantity: 1 }, angular, null)
    expect(a).toBe(b)
  })

  it('devuelve null si la línea no tiene precio cargado', () => {
    expect(
      unitEstimate({ productId: 1, lineId: 2, width: 100, height: 100, quantity: 1 }, corrediza, {
        ...reforzada,
        pricePerM2: null,
      }),
    ).toBeNull()
    expect(
      unitEstimate({ productId: 1, width: 100, height: 100, quantity: 1 }, corrediza, null),
    ).toBeNull()
  })

  it('valida medidas y cantidad', () => {
    expect(validDimensions({ width: 150, height: 110, quantity: 1 }, DEFAULT_PRICING)).toBe(true)
    expect(validDimensions({ width: 20, height: 110, quantity: 1 }, DEFAULT_PRICING)).toBe(false)
    expect(validDimensions({ width: 150, height: 900, quantity: 1 }, DEFAULT_PRICING)).toBe(false)
    expect(validDimensions({ width: 150, height: 110, quantity: 0 }, DEFAULT_PRICING)).toBe(false)
    expect(validDimensions({ width: 150, height: 110, quantity: 1.5 }, DEFAULT_PRICING)).toBe(false)
    expect(validDimensions({ width: Number.NaN, height: 110, quantity: 1 }, DEFAULT_PRICING)).toBe(
      false,
    )
  })

  it('describe y formatea como el diseño', () => {
    expect(
      describeItem(
        { productId: 1, lineId: 2, glass: 'Float', width: 150, height: 110, quantity: 2 },
        corrediza,
        reforzada,
      ),
    ).toBe('Herrero Reforzada · Vidrio Float · 150×110 cm · ×2')
    expect(
      describeItem({ productId: 9, width: 90, height: 200, side2: 80, quantity: 1 }, angular, null),
    ).toBe('Modena · Paneles Klara · 90×200×80 cm · ×1')
    expect(formatARS(536000)).toMatch(/^\$ 536\.000$/)
  })
})
