import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobalHook } from '@/hooks/revalidate'
import { CACHE_TAGS } from '@/lib/cache-tags'

export const SeoDefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: 'SEO general',
  admin: {
    group: 'SEO',
    description:
      'Valores por defecto para buscadores y redes sociales. Cada producto, línea, proyecto o página puede sobrescribirlos en su pestaña SEO.',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'siteName',
      label: 'Nombre del sitio',
      type: 'text',
      required: true,
      defaultValue: 'PIRCAS Aberturas',
    },
    {
      name: 'titleTemplate',
      label: 'Formato de títulos',
      type: 'text',
      defaultValue: '%s | PIRCAS Aberturas',
      admin: { description: '%s se reemplaza por el título de cada página.' },
    },
    {
      name: 'defaultTitle',
      label: 'Título por defecto (home)',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'PIRCAS Aberturas | Aberturas de aluminio a medida en Coronda, Santa Fe',
      maxLength: 70,
    },
    {
      name: 'defaultDescription',
      label: 'Descripción por defecto',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 170,
      defaultValue:
        'Fabricamos e instalamos aberturas de aluminio a medida: ventanas, puertas y mamparas. Líneas Herrero y Modena. Coronda, Santa Fe. Pedí tu presupuesto.',
    },
    {
      name: 'defaultImage',
      label: 'Imagen para compartir (1200×630)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'twitterHandle',
      label: 'Usuario de X/Twitter (opcional)',
      type: 'text',
    },
    {
      name: 'organizationType',
      label: 'Tipo de negocio (schema.org)',
      type: 'select',
      defaultValue: 'HomeAndConstructionBusiness',
      options: [
        { label: 'Negocio de construcción / hogar', value: 'HomeAndConstructionBusiness' },
        { label: 'Contratista general', value: 'GeneralContractor' },
        { label: 'Negocio local', value: 'LocalBusiness' },
      ],
    },
    {
      name: 'noindexSite',
      label: 'Ocultar todo el sitio de los buscadores',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Solo para entornos de prueba. ¡No activar en producción!' },
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('seo-defaults', [CACHE_TAGS.all])] },
}
