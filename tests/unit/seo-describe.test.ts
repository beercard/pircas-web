import { describe, expect, it } from 'vitest'

import type { Product, Project } from '@/payload-types'
import type { ShopProduct } from '@/lib/shop/config'
import {
  clip,
  productSeoDescription,
  productSeoTitle,
  projectSeoDescription,
} from '@/lib/seo/describe'

const product = (over: Partial<Product> = {}) =>
  ({
    id: 1,
    name: 'Ventana corrediza',
    shortDescription: 'Dos, tres o cuatro hojas. Con o sin mosquitero',
    category: { id: 1, name: 'Ventanas', slug: 'ventanas' },
    ...over,
  }) as Product

const shop = {
  measure: '0,80 × 2,00 m',
  colors: [
    { value: 'blanco', label: 'Blanco', hex: '#fff' },
    { value: 'negro', label: 'Negro', hex: '#000' },
  ],
} as ShopProduct

describe('SEO automático', () => {
  it('corta descripciones en una palabra completa', () => {
    const out = clip('palabra '.repeat(40), 60)
    expect(out.length).toBeLessThanOrEqual(60)
    expect(out.endsWith('…')).toBe(true)
  })

  it('producto a medida: material y "a medida" en el título', () => {
    expect(productSeoTitle(product(), null)).toBe('Ventana corrediza de aluminio a medida')
    expect(productSeoTitle(product({ name: 'Vidrio DVH' }), null)).toBe('Vidrio DVH a medida')
    expect(productSeoDescription(product(), null)).toMatch(/Coronda, Santa Fe/)
  })

  it('producto del presupuesto online: sin precios, con medida, colores y WhatsApp', () => {
    const d = productSeoDescription(product({ name: 'Puerta placa' }), shop)
    expect(d).not.toMatch(/\$/)
    expect(d).toContain('blanco o negro')
    expect(d.length).toBeLessThanOrEqual(158)
    expect(productSeoTitle(product({ name: 'Puerta placa' }), shop)).toBe(
      'Puerta placa: presupuesto online',
    )
  })

  it('trabajo: no repite el nombre si el resumen ya lo dice', () => {
    const d = projectSeoDescription({
      title: 'Puerta de acceso',
      summary: 'Puerta de acceso en Coronda',
      location: 'Coronda',
    } as Project)
    expect(d.match(/Puerta de acceso/g)).toHaveLength(1)
  })
})
