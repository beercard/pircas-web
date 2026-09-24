import { describe, expect, it } from 'vitest'

import { escapeHtml, leadNotificationEmail } from '@/lib/email/templates'
import { parseFrom } from '@/lib/email/transport'
import { escapeCsvCell, toCsv } from '@/lib/leads/csv'
import { resolveLink } from '@/lib/links'
import { mediaSrc } from '@/lib/media'
import { buildRedirectMap, normalizePath } from '@/lib/redirects'
import { pathFor } from '@/lib/routes'
import { mergeAttribution, parseUtm } from '@/lib/utm'
import { toEmbedUrl } from '@/lib/video'
import { getWhatsAppConfig, normalizePhone, whatsappUrl } from '@/lib/whatsapp'

describe('rutas', () => {
  it('construye URLs públicas por colección', () => {
    expect(pathFor('products', 'ventana-corrediza')).toBe('/productos/ventana-corrediza')
    expect(pathFor('product-lines', 'modena')).toBe('/lineas/modena')
    expect(pathFor('projects', 'casa-cr')).toBe('/proyectos/casa-cr')
    expect(pathFor('pages', 'nosotros')).toBe('/nosotros')
    expect(pathFor('pages', 'home')).toBe('/')
    expect(pathFor('product-categories', 'ventanas')).toBe('/productos?categoria=ventanas')
  })
})

describe('WhatsApp', () => {
  it('usa el número del CMS y si falta el de respaldo', () => {
    expect(getWhatsAppConfig({ whatsapp: { number: '54 9 342 590-3814' } }).number).toBe(
      '5493425903814',
    )
    expect(normalizePhone('123')).toBeNull()
  })

  it('arma el enlace con el mensaje codificado', () => {
    const cfg = { number: '5493425903814', defaultMessage: 'Hola Pircas' }
    expect(whatsappUrl(cfg)).toBe('https://wa.me/5493425903814?text=Hola%20Pircas')
    expect(whatsappUrl(cfg, '¿Precio?')).toBe('https://wa.me/5493425903814?text=%C2%BFPrecio%3F')
    expect(whatsappUrl({ number: null, defaultMessage: '' })).toBeNull()
  })
})

describe('enlaces del CMS', () => {
  const wa = { number: '5493425903814', defaultMessage: 'Hola' }
  it('resuelve referencias, URLs y WhatsApp', () => {
    expect(
      resolveLink({
        type: 'reference',
        label: 'Modena',
        reference: { relationTo: 'product-lines', value: { slug: 'modena' } },
      })?.href,
    ).toBe('/lineas/modena')
    expect(
      resolveLink({ type: 'custom', label: 'IG', url: 'https://instagram.com/x' }),
    ).toMatchObject({ external: true, kind: 'external' })
    expect(resolveLink({ type: 'custom', label: 'Cotizar', url: '/cotizador' })).toMatchObject({
      external: false,
      kind: 'internal',
    })
    expect(
      resolveLink({ type: 'whatsapp', label: 'WA', whatsappMessage: 'Hola!' }, wa)?.href,
    ).toContain('wa.me/5493425903814')
  })

  it('descarta enlaces incompletos', () => {
    expect(
      resolveLink({ type: 'reference', label: 'x', reference: { relationTo: 'pages', value: 5 } }),
    ).toBeNull()
    expect(resolveLink({ type: 'custom', label: 'x', url: '' })).toBeNull()
    expect(resolveLink(null)).toBeNull()
  })
})

describe('UTM', () => {
  it('lee los parámetros de campaña', () => {
    expect(parseUtm('?utm_source=google&utm_medium=cpc&utm_campaign=mamparas&x=1')).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'mamparas',
    })
  })

  it('conserva la primera campaña de la sesión', () => {
    const stored = { utm_source: 'facebook', landingPage: '/mamparas' }
    expect(mergeAttribution(stored, { utm_source: 'google', landingPage: '/x' })).toEqual(stored)
    // Si la sesión no tenía campaña y llega una, se adopta (manteniendo la página de llegada).
    expect(
      mergeAttribution({ landingPage: '/' }, { utm_source: 'google', landingPage: '/x' }),
    ).toEqual({ utm_source: 'google', landingPage: '/' })
  })
})

describe('redirecciones', () => {
  it('normaliza rutas', () => {
    expect(normalizePath('/Ventanas/')).toBe('/ventanas')
    expect(normalizePath('https://pircas.com.ar/viejo?x=1')).toBe('/viejo?x=1')
    expect(normalizePath('sin-barra')).toBe('/sin-barra')
  })

  it('arma el mapa con destino por URL o por referencia, 301/302', () => {
    const map = buildRedirectMap([
      {
        from: '/ventanas-modena',
        type: '301',
        to: {
          type: 'reference',
          reference: { relationTo: 'product-lines', value: { slug: 'modena' } },
        },
      },
      { from: '/promo', type: '302', to: { type: 'custom', url: '/cotizador' } },
      { from: '/loop', to: { type: 'custom', url: '/loop' } },
      {
        from: '/incompleta',
        to: { type: 'reference', reference: { relationTo: 'pages', value: 3 } },
      },
    ])
    expect(map.get('/ventanas-modena')).toEqual({ destination: '/lineas/modena', status: 301 })
    expect(map.get('/promo')).toEqual({ destination: '/cotizador', status: 302 })
    expect(map.has('/loop')).toBe(false)
    expect(map.has('/incompleta')).toBe(false)
  })
})

describe('CSV de consultas', () => {
  it('escapa separadores, comillas y fórmulas (CSV injection)', () => {
    expect(escapeCsvCell('a;b')).toBe('"a;b"')
    expect(escapeCsvCell('dijo "hola"')).toBe('"dijo ""hola"""')
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(escapeCsvCell(null)).toBe('')
  })

  it('genera CSV con BOM para Excel', () => {
    const csv = toCsv(
      [{ n: 'Ana', e: 'ana@x.com' }],
      [
        { header: 'Nombre', value: (r) => r.n },
        { header: 'Email', value: (r) => r.e },
      ],
    )
    expect(csv.startsWith('﻿Nombre;Email\r\nAna;ana@x.com')).toBe(true)
  })
})

describe('emails', () => {
  it('escapa HTML ingresado por el usuario', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    const mail = leadNotificationEmail({
      kind: 'contact',
      fullName: '<b>Ana</b>',
      message: '<img onerror=x>',
      adminUrl: 'https://x/admin',
    })
    expect(mail.html).not.toContain('<img onerror')
    expect(mail.subject).toContain('Nueva consulta')
  })

  it('interpreta el remitente SMTP_FROM', () => {
    expect(parseFrom('Pircas <no-reply@pircas.com.ar>')).toEqual({
      name: 'Pircas',
      address: 'no-reply@pircas.com.ar',
    })
    expect(parseFrom('ventas@pircas.com.ar').address).toBe('ventas@pircas.com.ar')
  })
})

describe('medios y video', () => {
  it('convierte URLs absolutas de medios propios en relativas', () => {
    expect(mediaSrc('http://localhost:3000/api/media/file/a.webp')).toBe('/api/media/file/a.webp')
    expect(mediaSrc('https://cdn.otro.com/a.webp')).toBe('https://cdn.otro.com/a.webp')
  })

  it('arma URLs de embed de YouTube (incl. Shorts) y Vimeo', () => {
    expect(toEmbedUrl('https://youtube.com/shorts/gNb7XOw-h8k')).toBe(
      'https://www.youtube-nocookie.com/embed/gNb7XOw-h8k',
    )
    expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123',
    )
    expect(toEmbedUrl('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345')
    expect(toEmbedUrl('https://example.com/video')).toBeNull()
  })
})
