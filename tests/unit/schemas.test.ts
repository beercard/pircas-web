import { describe, expect, it } from 'vitest'

import { contactSchema, fieldErrors, quoteSchema } from '@/lib/forms/schemas'

const validContact = {
  name: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  phone: '',
  city: 'Coronda',
  message: 'Quiero consultar por una ventana.',
}

const validQuote = {
  need: 'Aberturas para mi casa',
  items: [{ productId: 1, lineId: 2, glass: 'Float', width: 150, height: 110, quantity: 1 }],
  projectType: 'Vivienda nueva',
  visitRequested: true,
  name: 'Ana',
  phone: '342 555 1234',
}

describe('formulario de contacto', () => {
  it('acepta datos válidos y limpia espacios', () => {
    const r = contactSchema.safeParse({ ...validContact, name: '  Ana  ' })
    expect(r.success).toBe(true)
    expect(r.success && r.data.name).toBe('Ana')
  })

  it('exige nombre y mensaje', () => {
    const r = contactSchema.safeParse({ ...validContact, name: '', message: 'hi' })
    expect(r.success).toBe(false)
    const errors = fieldErrors(r.error!)
    expect(errors.name).toBeDefined()
    expect(errors.message).toBeDefined()
  })

  it('exige al menos email o teléfono', () => {
    const r = contactSchema.safeParse({ ...validContact, email: '', phone: '' })
    expect(r.success).toBe(false)
    expect(fieldErrors(r.error!).email).toMatch(/email o teléfono/)
    expect(
      contactSchema.safeParse({ ...validContact, email: '', phone: '+54 9 342 590 3814' }).success,
    ).toBe(true)
  })

  it('valida formato de email y teléfono', () => {
    expect(contactSchema.safeParse({ ...validContact, email: 'no-es-email' }).success).toBe(false)
    expect(contactSchema.safeParse({ ...validContact, email: '', phone: 'abc' }).success).toBe(
      false,
    )
  })

  it('limita longitudes y quita caracteres de control', () => {
    expect(contactSchema.safeParse({ ...validContact, message: 'x'.repeat(3001) }).success).toBe(
      false,
    )
    const r = contactSchema.safeParse({ ...validContact, city: 'Coro\u0000nda\u0007' })
    expect(r.success && r.data.city).toBe('Coronda')
  })
})

describe('formulario de obras y profesionales', () => {
  const pro = {
    ...validContact,
    audience: 'professional' as const,
    project: { location: 'Edificio 12 unidades, Santa Fe', plansUrl: 'https://example.com/planos' },
  }

  it('acepta una consulta de obra completa', () => {
    expect(contactSchema.safeParse(pro).success).toBe(true)
  })

  it('exige la obra y su ubicación', () => {
    const r = contactSchema.safeParse({ ...pro, project: { location: '' } })
    expect(r.success).toBe(false)
    expect(fieldErrors(r.error!)['project.location']).toMatch(/obra/)
  })

  it('valida el enlace a los planos', () => {
    const r = contactSchema.safeParse({ ...pro, project: { ...pro.project, plansUrl: 'planos' } })
    expect(r.success).toBe(false)
    expect(fieldErrors(r.error!)['project.plansUrl']).toBeDefined()
  })

  it('no cambia el formulario general', () => {
    expect(contactSchema.safeParse({ ...validContact, project: { location: '' } }).success).toBe(
      true,
    )
  })
})

describe('cotización', () => {
  it('acepta un pedido válido', () => {
    expect(quoteSchema.safeParse(validQuote).success).toBe(true)
  })

  it('exige al menos una abertura', () => {
    const r = quoteSchema.safeParse({ ...validQuote, items: [] })
    expect(r.success).toBe(false)
    expect(fieldErrors(r.error!).items).toBeDefined()
  })

  it('valida cada ítem (cantidad entera y positiva)', () => {
    expect(
      quoteSchema.safeParse({ ...validQuote, items: [{ ...validQuote.items[0], quantity: 0 }] })
        .success,
    ).toBe(false)
    expect(
      quoteSchema.safeParse({ ...validQuote, items: [{ ...validQuote.items[0], quantity: 1.5 }] })
        .success,
    ).toBe(false)
    expect(
      quoteSchema.safeParse({ ...validQuote, items: [{ ...validQuote.items[0], width: -10 }] })
        .success,
    ).toBe(false)
  })

  it('convierte números que llegan como texto', () => {
    const r = quoteSchema.safeParse({
      ...validQuote,
      items: [{ ...validQuote.items[0], width: '150', height: '110', quantity: '2' }],
    })
    expect(r.success && r.data.items[0]).toMatchObject({ width: 150, height: 110, quantity: 2 })
  })

  it('exige datos de contacto', () => {
    expect(quoteSchema.safeParse({ ...validQuote, phone: '', email: '' }).success).toBe(false)
  })
})
