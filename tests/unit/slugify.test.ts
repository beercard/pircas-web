import { describe, expect, it } from 'vitest'

import { isValidSlug, slugify } from '@/lib/slugify'

describe('slugify', () => {
  it.each([
    ['Herrero Económica', 'herrero-economica'],
    ['Mampara  Angular 90°', 'mampara-angular-90'],
    ['Año 2024 / Coronda', 'ano-2024-coronda'],
    ['  Ventana corrediza  ', 'ventana-corrediza'],
    ['Casa CR · Ventanal DVH', 'casa-cr-ventanal-dvh'],
    ['Rejas de hierro 3/8" y 1/2"', 'rejas-de-hierro-3-8-y-1-2'],
    ['---', ''],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })

  it('genera slugs siempre válidos', () => {
    for (const s of ['Modena Premium', 'Puerta placa (MDF)', 'Ñandú & Cía.']) {
      expect(isValidSlug(slugify(s))).toBe(true)
    }
  })

  it('rechaza slugs inválidos', () => {
    expect(isValidSlug('Ventana')).toBe(false)
    expect(isValidSlug('ventana--doble')).toBe(false)
    expect(isValidSlug('-ventana')).toBe(false)
    expect(isValidSlug('ventana corrediza')).toBe(false)
  })
})
