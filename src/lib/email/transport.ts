import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter } from 'payload'

/**
 * Capa SMTP independiente del proveedor (Zimbra, Brevo, Resend, Gmail, etc.).
 * Toda la configuración viene de variables de entorno; si SMTP_HOST no está
 * definido, Payload escribe los emails en el log (útil en desarrollo).
 */

export function parseFrom(from: string | undefined): { name: string; address: string } {
  const fallback = { name: 'PIRCAS Aberturas', address: 'no-reply@pircas.com.ar' }
  if (!from) return fallback
  const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1].trim() || fallback.name, address: match[2].trim() }
  return { name: fallback.name, address: from.trim() }
}

export function buildEmailAdapter(): Promise<EmailAdapter> | undefined {
  const host = process.env.SMTP_HOST
  if (!host) return undefined

  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
  const from = parseFrom(process.env.SMTP_FROM)

  return nodemailerAdapter({
    defaultFromAddress: from.address,
    defaultFromName: from.name,
    skipVerify: process.env.NODE_ENV !== 'production',
    transportOptions: {
      host,
      port,
      secure,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    },
  })
}

export const isEmailConfigured = (): boolean => Boolean(process.env.SMTP_HOST)
