/**
 * Configuración central de WhatsApp. El número se edita en el CMS
 * (Datos del negocio → WhatsApp); WHATSAPP_NUMBER es el valor de respaldo.
 */

export type WhatsAppConfig = { number: string | null; defaultMessage: string }

type SettingsLike = {
  whatsapp?: { number?: string | null; defaultMessage?: string | null } | null
} | null

export const DEFAULT_WHATSAPP_MESSAGE = 'Hola PIRCAS, quiero pedir un presupuesto'

export function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  return digits.length >= 8 ? digits : null
}

export function getWhatsAppConfig(settings: SettingsLike): WhatsAppConfig {
  return {
    number:
      normalizePhone(settings?.whatsapp?.number) ?? normalizePhone(process.env.WHATSAPP_NUMBER),
    defaultMessage: settings?.whatsapp?.defaultMessage || DEFAULT_WHATSAPP_MESSAGE,
  }
}

export function whatsappUrl(config: WhatsAppConfig, message?: string | null): string | null {
  if (!config.number) return null
  const text = (message || config.defaultMessage).trim()
  return `https://wa.me/${config.number}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** Mensaje contextual para un producto o línea. */
export const productWhatsAppMessage = (name: string) =>
  `Hola PIRCAS, quiero consultar por ${name}. ¿Me pueden pasar un presupuesto?`
