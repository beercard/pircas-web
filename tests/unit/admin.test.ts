import { describe, expect, it } from 'vitest'

import { passwordProblem } from '@/lib/auth/password-policy'
import { altFromFilename } from '@/lib/media-alt'

describe('política de contraseñas del panel', () => {
  it('acepta contraseñas largas con letras y números', () => {
    expect(passwordProblem('Ventanas-de-Coronda-2027', 'yamile@example.com')).toBeNull()
    expect(passwordProblem('marco9alto7hoja', null)).toBeNull()
  })

  it('exige 10 caracteres', () => {
    expect(passwordProblem('abc123', null)).toMatch(/10 caracteres/)
  })

  it('exige letras y números', () => {
    expect(passwordProblem('soloLetrasAqui', null)).toMatch(/letras y números/)
    expect(passwordProblem('1234567890123', null)).toMatch(/letras y números/)
  })

  it('rechaza contraseñas fáciles de adivinar', () => {
    expect(passwordProblem('Pircas20262026', null)).toMatch(/fácil de adivinar/)
    expect(passwordProblem('password12345', null)).toMatch(/fácil de adivinar/)
    expect(passwordProblem('123456789abc', null)).toMatch(/fácil de adivinar/)
  })

  it('no permite usar el email', () => {
    expect(passwordProblem('yamile.costa1234', 'yamile.costa@gmail.com')).toMatch(/email/)
  })
})

describe('texto alternativo automático de fotos', () => {
  it('usa el nombre del archivo', () => {
    expect(altFromFilename('ventana-corrediza_living.jpg')).toBe('Ventana corrediza living')
    expect(altFromFilename('Mampara ANGULAR 2.webp')).toBe('Mampara angular')
  })

  it('usa un texto neutro con nombres genéricos de cámara', () => {
    expect(altFromFilename('IMG_20260102_1034.jpg')).toBe('Foto de Pircas Aberturas')
    expect(altFromFilename('WhatsApp Image 2026-09-25.jpeg')).toBe('Foto de Pircas Aberturas')
    expect(altFromFilename(undefined)).toBe('Foto de Pircas Aberturas')
  })
})
