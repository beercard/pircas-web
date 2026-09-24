import type { GlobalConfig } from 'payload'

import { authenticated, superAdmin } from '@/access'
import { revalidateGlobalHook } from '@/hooks/revalidate'

const idField = (name: string, label: string, pattern: RegExp, example: string) => ({
  name,
  label,
  type: 'text' as const,
  admin: { description: `Ej: ${example}. Vacío = se usa la variable de entorno (si existe).` },
  validate: (v: string | null | undefined) =>
    !v || pattern.test(v) || `Formato inválido (ej: ${example}).`,
})

export const Analytics: GlobalConfig = {
  slug: 'analytics',
  label: 'Analítica y píxeles',
  admin: {
    group: 'Configuración',
    description: 'IDs públicos de medición. Solo un super administrador puede modificarlos.',
  },
  access: { read: authenticated, update: superAdmin },
  fields: [
    { name: 'enabled', label: 'Activar analítica', type: 'checkbox', defaultValue: true },
    idField('googleTagManagerId', 'Google Tag Manager', /^GTM-[A-Z0-9]+$/, 'GTM-ABC1234'),
    idField('ga4MeasurementId', 'Google Analytics 4', /^G-[A-Z0-9]+$/, 'G-ABCDEF1234'),
    idField('googleAdsId', 'Google Ads (conversiones)', /^AW-\d+$/, 'AW-123456789'),
    {
      name: 'googleAdsLeadLabel',
      label: 'Etiqueta de conversión de Google Ads para consultas',
      type: 'text',
      admin: { description: 'La parte después de la barra en "AW-123/abcDEF". Opcional.' },
    },
    idField('metaPixelId', 'Meta Pixel (Facebook/Instagram)', /^\d{10,20}$/, '1320462883175772'),
  ],
  hooks: { afterChange: [revalidateGlobalHook('analytics')] },
}
