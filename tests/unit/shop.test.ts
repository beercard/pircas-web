import { describe, expect, it } from 'vitest'

import { variantText } from '@/lib/shop/options'
import { DEFAULT_PRICE_RULES, quoteTotals, resolveRules } from '@/lib/shop/pricing'
import { quoteRequestSchema } from '@/lib/shop/schema'
import { toWhatsAppNumber } from '@/lib/shop/whatsapp-cloud'

describe('precios del presupuesto', () => {
  it('suma lista, transferencia y cuotas', () => {
    const t = quoteTotals([
      { unitList: 37375, rules: DEFAULT_PRICE_RULES, quantity: 1 },
      { unitList: 10000, rules: DEFAULT_PRICE_RULES, quantity: 2 },
    ])
    expect(t.list).toBe(57375)
    expect(t.transfer).toBe(29900 + 16000)
    expect(t.saving).toBe(57375 - 45900)
    expect(t.installments).toBe(3)
    expect(t.installmentAmount).toBe(19125)
    expect(t.itemsCount).toBe(3)
  })

  it('usa la promo del producto y las cuotas menores del presupuesto', () => {
    const promo = resolveRules({ transferDiscount: 35, installments: 6 }, DEFAULT_PRICE_RULES)
    const t = quoteTotals([
      { unitList: 100000, rules: promo, quantity: 1 },
      { unitList: 100000, rules: DEFAULT_PRICE_RULES, quantity: 1 },
    ])
    expect(t.transfer).toBe(65000 + 80000)
    expect(t.installments).toBe(3)
  })

  it('ignora descuentos inválidos y usa los generales', () => {
    expect(resolveRules({ transferDiscount: 120, installments: 0 }, DEFAULT_PRICE_RULES)).toEqual(
      DEFAULT_PRICE_RULES,
    )
  })
})

describe('textos del presupuesto', () => {
  it('describe color, medida y accesorios', () => {
    expect(variantText('negro', ['mosquitero', 'reja'], '1,50 × 1,10 m')).toBe(
      'Negro · 1,50 × 1,10 m · Con mosquitero y reja',
    )
    expect(variantText('blanco', [], null)).toBe('Blanco')
  })

  it('normaliza celulares argentinos para WhatsApp', () => {
    expect(toWhatsAppNumber('342 15 5112233')).toBe('5493425112233')
    expect(toWhatsAppNumber('+54 9 342 511-2233')).toBe('5493425112233')
    expect(toWhatsAppNumber('0342 5112233')).toBe('5493425112233')
    expect(toWhatsAppNumber('123')).toBeNull()
  })
})

describe('pedido de presupuesto', () => {
  const base = {
    items: [{ productId: 1, color: 'blanco', accessories: ['reja', 'mosquitero'], quantity: 2 }],
    fullName: 'Ana Pérez',
    phone: '342 555 0100',
    city: 'Coronda',
  }

  it('acepta un pedido válido y ordena los accesorios', () => {
    const r = quoteRequestSchema.safeParse(base)
    expect(r.success).toBe(true)
    expect(r.data?.items[0].accessories).toEqual(['mosquitero', 'reja'])
  })

  it('no acepta precios ni campos extra enviados por el navegador', () => {
    expect(quoteRequestSchema.safeParse({ ...base, total: 1 }).success).toBe(false)
  })

  it('exige WhatsApp y localidad, y valida cantidades y accesorios', () => {
    expect(quoteRequestSchema.safeParse({ ...base, phone: '' }).success).toBe(false)
    expect(quoteRequestSchema.safeParse({ ...base, city: '' }).success).toBe(false)
    expect(
      quoteRequestSchema.safeParse({ ...base, items: [{ productId: 1, quantity: 0 }] }).success,
    ).toBe(false)
    expect(
      quoteRequestSchema.safeParse({
        ...base,
        items: [{ productId: 1, accessories: ['persiana'], quantity: 1 }],
      }).success,
    ).toBe(false)
    expect(quoteRequestSchema.safeParse({ ...base, items: [] }).success).toBe(false)
  })
})
