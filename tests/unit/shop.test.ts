import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PRICE_RULES,
  orderTotals,
  priceBreakdown,
  resolveRules,
  shippingQuote,
} from '@/lib/shop/pricing'
import { checkoutSchema } from '@/lib/shop/schema'

describe('precios de la tienda', () => {
  it('calcula transferencia, Mercado Pago y cuotas como la competencia', () => {
    const b = priceBreakdown(37375, { transferDiscount: 20, mpDiscount: 0, installments: 3 })
    expect(b.transfer).toBe(29900)
    expect(b.mercadopago).toBe(37375)
    expect(b.installmentAmount).toBe(12458)
  })

  it('aplica la promo del producto (35% transferencia, 18% Mercado Pago)', () => {
    const rules = resolveRules({ transferDiscount: 35, mpDiscount: 18 }, DEFAULT_PRICE_RULES)
    const b = priceBreakdown(361538, rules)
    expect(b.transfer).toBe(235000)
    expect(b.mercadopago).toBe(296461)
    expect(rules.installments).toBe(3)
  })

  it('ignora descuentos inválidos y usa los generales', () => {
    expect(resolveRules({ transferDiscount: 120, installments: 0 }, DEFAULT_PRICE_RULES)).toEqual(
      DEFAULT_PRICE_RULES,
    )
  })

  it('suma el pedido según el medio de pago y el envío', () => {
    const lines = [
      { breakdown: priceBreakdown(10000, DEFAULT_PRICE_RULES), quantity: 2 },
      { breakdown: priceBreakdown(5000, DEFAULT_PRICE_RULES), quantity: 1 },
    ]
    const transfer = orderTotals(lines, 'transfer', { cost: 3000, quoteLater: false })
    expect(transfer).toMatchObject({
      subtotalList: 25000,
      subtotal: 20000,
      discount: 5000,
      shipping: 3000,
      total: 23000,
      itemsCount: 3,
    })
    const mp = orderTotals(lines, 'mercadopago', { cost: 0, quoteLater: true })
    expect(mp).toMatchObject({ subtotal: 25000, discount: 0, shipping: 0, total: 25000 })
  })

  it('envío gratis desde un monto y envío a coordinar', () => {
    const m = {
      code: 'e',
      label: 'Envío',
      type: 'delivery' as const,
      price: 5000,
      freeFrom: 100000,
    }
    expect(shippingQuote(m, 50000)).toEqual({ cost: 5000, quoteLater: false })
    expect(shippingQuote(m, 150000)).toEqual({ cost: 0, quoteLater: false })
    expect(shippingQuote({ ...m, quoteLater: true }, 1)).toEqual({ cost: 0, quoteLater: true })
  })
})

describe('checkout', () => {
  const base = {
    items: [{ productId: 1, color: 'blanco', quantity: 2 }],
    fullName: 'Ana Pérez',
    email: 'ana@example.com',
    phone: '342 555 0100',
    shippingCode: 'retiro',
    paymentMethod: 'transfer',
  }

  it('acepta un pedido válido', () => {
    expect(checkoutSchema.safeParse(base).success).toBe(true)
  })

  it('no acepta precios ni campos extra enviados por el navegador', () => {
    expect(checkoutSchema.safeParse({ ...base, total: 1 }).success).toBe(false)
  })

  it('exige contacto y valida cantidades', () => {
    expect(checkoutSchema.safeParse({ ...base, email: '' }).success).toBe(false)
    expect(
      checkoutSchema.safeParse({ ...base, items: [{ productId: 1, quantity: 0 }] }).success,
    ).toBe(false)
    expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false)
  })
})
