/**
 * Abstracción única de eventos de analítica.
 *
 * - Si hay Google Tag Manager, los eventos solo se envían al dataLayer (GTM decide
 *   a qué herramientas mandarlos) → evita contar dos veces.
 * - Sin GTM, se envían directo a GA4 (gtag) y a Meta Pixel (fbq).
 *
 * Los componentes nunca llaman a gtag/fbq directamente: usan `track()`.
 */

export type AnalyticsEventName =
  | 'page_view'
  | 'product_view'
  | 'project_view'
  | 'quote_start'
  | 'quote_step'
  | 'quote_submit'
  | 'contact_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'map_click'
  | 'advisor_complete'

export type AnalyticsParams = Record<string, string | number | boolean | undefined>

export type AnalyticsRuntimeConfig = {
  gtm: boolean
  ga4: boolean
  metaPixel: boolean
  /** "AW-123/label" para registrar conversiones de Google Ads al enviar formularios. */
  adsLeadSendTo?: string
}

type Gtag = (...args: unknown[]) => void
type Fbq = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
    fbq?: Fbq
    __pircasAnalytics?: AnalyticsRuntimeConfig
  }
}

/** Eventos que en Meta se registran como eventos estándar. */
const META_STANDARD: Partial<Record<AnalyticsEventName, string>> = {
  page_view: 'PageView',
  product_view: 'ViewContent',
  project_view: 'ViewContent',
  quote_submit: 'Lead',
  contact_submit: 'Contact',
  whatsapp_click: 'Contact',
  phone_click: 'Contact',
}

const LEAD_EVENTS: AnalyticsEventName[] = ['quote_submit', 'contact_submit']

const clean = (params: AnalyticsParams) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))

export function track(event: AnalyticsEventName, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return
  const cfg = window.__pircasAnalytics
  if (!cfg) return
  const data = clean(params)

  if (cfg.gtm) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...data })
    return
  }

  if (cfg.ga4 && window.gtag) {
    window.gtag('event', event, data)
    if (cfg.adsLeadSendTo && LEAD_EVENTS.includes(event)) {
      window.gtag('event', 'conversion', { send_to: cfg.adsLeadSendTo })
    }
  }

  if (cfg.metaPixel && window.fbq) {
    const standard = META_STANDARD[event]
    if (standard) window.fbq('track', standard, data)
    else window.fbq('trackCustom', event, data)
  }
}
