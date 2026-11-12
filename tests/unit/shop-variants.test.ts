import { describe, expect, it } from 'vitest'

import { withVat } from '@/lib/shop/pricing'
import { variantText } from '@/lib/shop/options'
import {
  colorsFor,
  measuresOf,
  optionsFor,
  resolveChoices,
  resolveVariant,
  type VariantRow,
} from '@/lib/shop/variants'

const rows: VariantRow[] = [
  { measure: '0,60 × 0,40 m', color: 'blanco', option: 'Reja 3/8"', price: 71890 },
  { measure: '0,60 × 0,40 m', color: 'blanco', option: 'Reja 1/2"', price: 82542 },
  { measure: '0,60 × 0,40 m', color: 'negro', option: 'Reja 3/8"', price: 78510 },
  { measure: '0,60 × 0,40 m', color: 'negro', option: 'Reja 1/2"', price: 89162 },
  { measure: '1,00 × 0,40 m', color: 'blanco', option: 'Reja 3/8"', price: 98686 },
]

describe('medidas y opciones del presupuesto', () => {
  it('lista medidas, colores y opciones disponibles', () => {
    expect(measuresOf(rows)).toEqual(['0,60 × 0,40 m', '1,00 × 0,40 m'])
    expect(colorsFor(rows, '0,60 × 0,40 m')).toEqual(['blanco', 'negro'])
    expect(colorsFor(rows, '1,00 × 0,40 m')).toEqual(['blanco'])
    expect(optionsFor(rows, '0,60 × 0,40 m', 'negro')).toEqual(['Reja 3/8"', 'Reja 1/2"'])
  })

  it('encuentra el precio de la combinación elegida', () => {
    expect(
      resolveVariant(rows, { measure: '0,60 × 0,40 m', color: 'negro', option: 'Reja 1/2"' })
        ?.price,
    ).toBe(89162)
  })

  it('ajusta color y opción a los que existen para esa medida', () => {
    const row = resolveVariant(rows, {
      measure: '1,00 × 0,40 m',
      color: 'negro',
      option: 'Reja 1/2"',
    })
    expect(row).toMatchObject({ color: 'blanco', option: 'Reja 3/8"', price: 98686 })
  })

  it('rechaza una medida que no existe', () => {
    expect(resolveVariant(rows, { measure: '9,00 × 9,00 m', color: 'blanco' })).toBeNull()
  })

  it('el color no cambia el precio cuando las filas no lo indican', () => {
    const plain: VariantRow[] = [
      { measure: '0,80 × 2,05 m', color: null, option: null, price: 100 },
    ]
    expect(resolveVariant(plain, { measure: '0,80 × 2,05 m', color: 'negro' })?.price).toBe(100)
  })

  it('completa las elecciones sin precio con la primera opción', () => {
    const groups = [
      { label: 'Vidrio', values: ['Repartido', 'Entero'] },
      { label: 'Giro', values: ['Derecha', 'Izquierda'] },
    ]
    expect(resolveChoices(groups, ['Entero', 'Arriba'])).toEqual(['Entero', 'Derecha'])
    expect(resolveChoices(groups, undefined)).toEqual(['Repartido', 'Derecha'])
  })

  it('suma el IVA al precio cargado', () => {
    expect(withVat(234090, 21)).toBe(283249)
    expect(withVat(1000, 0)).toBe(1000)
  })

  it('describe la variante elegida', () => {
    expect(variantText('negro', [], '1,20 × 1,10 m', 'Reja 1/2"', ['Derecha'])).toBe(
      'Negro · 1,20 × 1,10 m · Reja 1/2" · Derecha',
    )
  })
})
