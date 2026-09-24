/**
 * Tests de integración: endpoint real de formularios + base de datos + reglas de acceso.
 * Requieren DATABASE_URL con el esquema migrado y el contenido inicial (`pnpm seed`).
 * Sin base disponible, se omiten.
 */
import { NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const hasDb = Boolean(process.env.DATABASE_URL)
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

let payload: Payload
let POST: (req: NextRequest, ctx: { params: Promise<{ form: string }> }) => Promise<Response>
const createdLeadIds: number[] = []
let ipCounter = 0

async function send(form: string, body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1
  const req = new NextRequest(`${SITE}/api/forms/${form}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: SITE,
      'x-forwarded-for': `10.0.0.${ipCounter}`,
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  const res = await POST(req, { params: Promise.resolve({ form }) })
  const json = (await res.json()) as Record<string, unknown>
  if (typeof json.id === 'number') createdLeadIds.push(json.id)
  return { status: res.status, json }
}

describe.skipIf(!hasDb)('formularios públicos (integración)', () => {
  let productId: number
  let lineId: number
  let productPriceSlug: string

  beforeAll(async () => {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    payload = await getPayload({ config })
    ;({ POST } = await import('@/app/api/forms/[form]/route'))

    const products = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'ventana-corrediza' } },
      depth: 0,
    })
    const lines = await payload.find({
      collection: 'product-lines',
      where: { slug: { equals: 'herrero-reforzada' } },
      depth: 0,
    })
    if (!products.docs[0] || !lines.docs[0])
      throw new Error('Falta el contenido inicial: ejecutá `pnpm seed`.')
    productId = products.docs[0].id
    lineId = lines.docs[0].id
    productPriceSlug = products.docs[0].slug
  })

  afterAll(async () => {
    if (payload && createdLeadIds.length) {
      await payload.delete({
        collection: 'leads',
        where: { id: { in: createdLeadIds } },
        overrideAccess: true,
      })
    }
  })

  it('guarda una cotización y recalcula el precio en el servidor', async () => {
    const { status, json } = await send('quote', {
      need: 'Aberturas para mi casa',
      items: [{ productId, lineId, glass: 'Laminado', width: 150, height: 110, quantity: 2 }],
      projectType: 'Vivienda nueva',
      visitRequested: true,
      name: 'Test',
      lastName: 'Integración',
      phone: '342 000 0000',
      email: 'test@example.com',
      attribution: {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
        landingPage: '/mamparas',
      },
      // Un total manipulado por el cliente se ignora:
      total: 1,
    })
    expect(status).toBe(200)
    expect(json.ok).toBe(true)

    const lead = await payload.findByID({
      collection: 'leads',
      id: json.id as number,
      depth: 1,
      overrideAccess: true,
    })
    expect(lead.type).toBe('quotation')
    expect(lead.status).toBe('new')
    expect(lead.fullName).toBe('Test Integración')
    expect(lead.quote?.visitRequested).toBe(true)
    expect(lead.quote?.estimatedTotal).toBe(1_072_000) // 536.000 × 2
    expect(lead.quote?.items?.[0]).toMatchObject({
      width: 150,
      height: 110,
      quantity: 2,
      glass: 'Laminado',
      estimate: 1_072_000,
    })
    // Relaciones con el catálogo (no texto duplicado):
    expect(typeof lead.product === 'object' && lead.product?.slug).toBe(productPriceSlug)
    expect(typeof lead.productLine === 'object' && lead.productLine?.name).toBe('Herrero Reforzada')
    // UTM asociadas a la consulta:
    expect(lead.utm).toMatchObject({ source: 'google', medium: 'cpc', campaign: 'test' })
    expect(lead.landingPage).toBe('/mamparas')
  })

  it('rechaza productos inexistentes o medidas fuera de rango', async () => {
    const bad = await send('quote', {
      items: [{ productId: 999999, lineId, width: 100, height: 100, quantity: 1 }],
      name: 'Test',
      phone: '3420000000',
    })
    expect(bad.status).toBe(422)
    const tooBig = await send('quote', {
      items: [{ productId, lineId, width: 5000, height: 100, quantity: 1 }],
      name: 'Test',
      phone: '3420000000',
    })
    expect(tooBig.status).toBe(422)
  })

  it('guarda una consulta de contacto', async () => {
    const { status, json } = await send('contact', {
      name: 'Ana',
      email: 'ana@example.com',
      city: 'Coronda',
      projectType: 'Reforma',
      message: 'Necesito cambiar dos ventanas.',
    })
    expect(status).toBe(200)
    const lead = await payload.findByID({
      collection: 'leads',
      id: json.id as number,
      overrideAccess: true,
    })
    expect(lead).toMatchObject({
      type: 'contact',
      email: 'ana@example.com',
      city: 'Coronda',
      projectType: 'Reforma',
    })
  })

  it('valida del lado del servidor y devuelve errores por campo', async () => {
    const { status, json } = await send('contact', { name: '', message: '' })
    expect(status).toBe(422)
    expect(json.fields).toHaveProperty('name')
  })

  it('bloquea otros orígenes, JSON inválido y formularios inexistentes', async () => {
    expect((await send('contact', { name: 'x' }, { origin: 'https://evil.example' })).status).toBe(
      403,
    )
    expect((await send('contact', '{no es json')).status).toBe(400)
    expect((await send('otro', {})).status).toBe(404)
  })

  it('el honeypot descarta bots sin guardar nada', async () => {
    const before = await payload.count({ collection: 'leads', overrideAccess: true })
    const { status } = await send('contact', {
      name: 'Bot',
      email: 'bot@example.com',
      message: 'Compre ya compre ya',
      website: 'http://spam',
    })
    expect(status).toBe(200)
    const after = await payload.count({ collection: 'leads', overrideAccess: true })
    expect(after.totalDocs).toBe(before.totalDocs)
  })

  it('limita la frecuencia por IP', async () => {
    const headers = { 'x-forwarded-for': '10.9.9.9' }
    const results = []
    for (let i = 0; i < 7; i++)
      results.push((await send('contact', { name: '', message: '' }, headers)).status)
    expect(results).toContain(429)
  })

  it('las consultas no se pueden crear ni leer sin sesión (API pública)', async () => {
    await expect(
      payload.create({
        collection: 'leads',
        data: { name: 'x', type: 'contact', status: 'new' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(payload.find({ collection: 'leads', overrideAccess: false })).rejects.toThrow()
  })

  it('el público solo ve contenido publicado', async () => {
    const draft = await payload.create({
      collection: 'product-categories',
      data: { name: 'Borrador de prueba', slug: 'borrador-de-prueba-int', _status: 'draft' },
      draft: true,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    const publicView = await payload.find({
      collection: 'product-categories',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    })
    expect(publicView.docs).toHaveLength(0)
    await payload.delete({
      collection: 'product-categories',
      id: draft.id,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  })
})
