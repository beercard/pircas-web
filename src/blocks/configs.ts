import type { Block, Field } from 'payload'

import { blockSettingsField, sectionHeadingFields } from '@/fields/blockSettings'
import { factsField, faqsField } from '@/fields/facts'
import { bulletListField, galleryField } from '@/fields/gallery'
import { iconField } from '@/fields/icon'
import { linkArrayField, linkField } from '@/fields/link'
import { defaultEditor } from '@/fields/richText'

/**
 * Esquema (CMS) de los bloques reutilizables. Cada bloque tiene su componente en
 * `src/blocks/<Nombre>/Component.tsx` y se registra en `RenderBlocks.tsx`.
 * Todos incluyen `settings`: ocultar, fondo, espaciado, ancla y visibilidad por dispositivo.
 */

const withSettings = (block: Block): Block => ({
  ...block,
  fields: [...block.fields, blockSettingsField],
})

const variantField = (
  options: { label: string; value: string }[],
  defaultValue: string,
  description?: string,
): Field => ({
  name: 'variant',
  label: 'Diseño',
  type: 'select',
  defaultValue,
  options,
  admin: { description },
})

const markerField: Field = {
  name: 'marker',
  label: 'Marcador',
  type: 'select',
  defaultValue: 'shapes',
  options: [
    { label: 'Formas de marca (cuadrado, puerta, círculo)', value: 'shapes' },
    { label: 'Ícono', value: 'icon' },
    { label: 'Ninguno', value: 'none' },
  ],
}

export const HeroBlock = withSettings({
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero (portada)', plural: 'Heros' },
  fields: [
    variantField(
      [
        { label: 'Foto a pantalla completa (header transparente)', value: 'fullBleed' },
        { label: 'Título + foto panorámica (editorial)', value: 'editorial' },
        { label: 'Título + bajada (sin foto)', value: 'intro' },
      ],
      'fullBleed',
    ),
    {
      type: 'row',
      fields: [
        {
          name: 'showBreadcrumbs',
          label: 'Mostrar migas de pan',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'decoration',
          label: 'Mostrar forma de marca (P-puerta)',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%', condition: (_, s) => s?.variant === 'fullBleed' },
        },
      ],
    },
    { name: 'eyebrow', label: 'Antetítulo', type: 'text', localized: true },
    { name: 'title', label: 'Título', type: 'textarea', required: true, localized: true },
    { name: 'subtitle', label: 'Bajada', type: 'textarea', localized: true },
    {
      name: 'image',
      label: 'Imagen',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, s) => s?.variant !== 'intro' },
    },
    linkArrayField(),
    {
      name: 'highlights',
      label: 'Compromisos (franja debajo del hero)',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Compromiso', plural: 'Compromisos' },
      admin: {
        description: 'Ej: "Taller propio en Coronda" · "No revendemos: lo fabricamos acá."',
        condition: (_, s) => s?.variant === 'fullBleed',
      },
      fields: [
        { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
        { name: 'text', label: 'Texto', type: 'text', localized: true },
      ],
    },
  ],
})

export const StatementBlock = withSettings({
  slug: 'statement',
  interfaceName: 'StatementBlock',
  labels: { singular: 'Frase de marca', plural: 'Frases de marca' },
  fields: [
    variantField(
      [
        { label: 'Frase grande (cada línea en un renglón)', value: 'stacked' },
        { label: 'Antetítulo + frase | texto', value: 'split' },
      ],
      'stacked',
    ),
    { name: 'eyebrow', label: 'Antetítulo', type: 'text', localized: true },
    {
      name: 'text',
      label: 'Frase',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'En el diseño grande, cada línea va en un renglón.' },
    },
    {
      name: 'accentLastLine',
      label: 'Última línea en terracota',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: (_, s) => s?.variant === 'stacked' },
    },
    { name: 'body', label: 'Texto', type: 'richText', editor: defaultEditor, localized: true },
    linkField({ name: 'link', label: 'Enlace (opcional)', requireLabel: false }),
  ],
})

export const TextImageBlock = withSettings({
  slug: 'textImage',
  dbName: 'text_img',
  interfaceName: 'TextImageBlock',
  labels: { singular: 'Texto + imagen', plural: 'Texto + imagen' },
  fields: [
    variantField(
      [
        { label: 'Imagen al borde (mitad de pantalla)', value: 'bleed' },
        { label: 'Imagen dentro del contenedor', value: 'contained' },
      ],
      'bleed',
    ),
    ...sectionHeadingFields,
    { name: 'content', label: 'Texto', type: 'richText', editor: defaultEditor, localized: true },
    {
      name: 'tags',
      label: 'Etiquetas en línea',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Etiqueta', plural: 'Etiquetas' },
      admin: { description: 'Ej: "Mampara frontal" | "Mampara angular".' },
      fields: [{ name: 'text', label: 'Texto', type: 'text', required: true, localized: true }],
    },
    bulletListField('bullets', 'Puntos destacados', 'Punto'),
    factsField(),
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'imagePosition',
          label: 'Posición de la imagen',
          type: 'radio',
          defaultValue: 'left',
          options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Derecha', value: 'right' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'decoration',
          label: 'Calado de marca en la foto',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '50%' },
        },
      ],
    },
    linkArrayField(),
  ],
})

export const BenefitsBlock = withSettings({
  slug: 'benefits',
  interfaceName: 'BenefitsBlock',
  labels: { singular: 'Beneficios / características', plural: 'Beneficios' },
  fields: [
    variantField(
      [
        { label: 'Grilla con marcadores', value: 'grid' },
        { label: 'Grilla simple con borde (sin marcador)', value: 'bordered' },
      ],
      'grid',
    ),
    ...sectionHeadingFields,
    markerField,
    {
      name: 'items',
      label: 'Ítems',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Ítem', plural: 'Ítems' },
      fields: [
        iconField(),
        { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
        { name: 'text', label: 'Texto', type: 'textarea', localized: true },
      ],
    },
  ],
})

export const ProductLinesBlock = withSettings({
  slug: 'productLines',
  dbName: 'prod_lines',
  interfaceName: 'ProductLinesBlock',
  labels: { singular: 'Líneas de producto', plural: 'Líneas de producto' },
  fields: [
    variantField(
      [
        { label: 'Tarjetas con specs', value: 'cards' },
        { label: 'Fotos con texto superpuesto', value: 'overlay' },
      ],
      'cards',
    ),
    ...sectionHeadingFields,
    {
      name: 'lines',
      label: 'Líneas a mostrar',
      type: 'relationship',
      relationTo: 'product-lines',
      hasMany: true,
      admin: { description: 'Vacío = todas las líneas publicadas, en su orden.' },
    },
  ],
})

export const ProductCategoriesBlock = withSettings({
  slug: 'productCategories',
  dbName: 'prod_cats',
  interfaceName: 'ProductCategoriesBlock',
  labels: { singular: 'Categorías / soluciones', plural: 'Categorías / soluciones' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'categories',
      label: 'Categorías a mostrar',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
      admin: { description: 'Vacío = todas las categorías publicadas.' },
    },
    linkField({
      name: 'cta',
      label: 'Enlace a la derecha del título (opcional)',
      requireLabel: false,
    }),
  ],
})

export const ProductGridBlock = withSettings({
  slug: 'productGrid',
  dbName: 'prod_grid',
  interfaceName: 'ProductGridBlock',
  labels: { singular: 'Grilla de productos', plural: 'Grillas de productos' },
  fields: [
    variantField(
      [
        { label: 'Tarjetas', value: 'cards' },
        { label: 'Tarjetas grandes con ventajas (ej: mamparas)', value: 'feature' },
      ],
      'cards',
    ),
    ...sectionHeadingFields,
    {
      name: 'source',
      label: 'Qué productos mostrar',
      type: 'radio',
      defaultValue: 'featured',
      options: [
        { label: 'Destacados', value: 'featured' },
        { label: 'De una categoría', value: 'category' },
        { label: 'De una línea', value: 'line' },
        { label: 'Elegidos a mano', value: 'manual' },
      ],
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { condition: (_, s) => s?.source === 'category' },
    },
    {
      name: 'line',
      label: 'Línea',
      type: 'relationship',
      relationTo: 'product-lines',
      admin: { condition: (_, s) => s?.source === 'line' },
    },
    {
      name: 'products',
      label: 'Productos',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { condition: (_, s) => s?.source === 'manual' },
    },
    { name: 'limit', label: 'Cantidad máxima', type: 'number', defaultValue: 6, min: 1, max: 24 },
    linkField({
      name: 'cta',
      label: 'Enlace a la derecha del título (opcional)',
      requireLabel: false,
    }),
  ],
})

export const ProcessBlock = withSettings({
  slug: 'process',
  interfaceName: 'ProcessBlock',
  labels: { singular: 'Pasos / pilares', plural: 'Pasos / pilares' },
  fields: [
    variantField(
      [
        { label: 'Línea de tiempo horizontal (numerada)', value: 'timeline' },
        { label: 'Pilares (sin números)', value: 'pillars' },
        { label: 'Texto + lista numerada al costado', value: 'split' },
      ],
      'timeline',
    ),
    ...sectionHeadingFields,
    {
      name: 'body',
      label: 'Texto (diseño con lista al costado)',
      type: 'textarea',
      localized: true,
      admin: { condition: (_, s) => s?.variant === 'split' },
    },
    {
      name: 'image',
      label: 'Imagen (diseño con lista al costado)',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, s) => s?.variant === 'split' },
    },
    {
      name: 'steps',
      label: 'Pasos',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Paso', plural: 'Pasos' },
      fields: [
        { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
        { name: 'text', label: 'Texto', type: 'textarea', localized: true },
      ],
    },
    linkArrayField({ maxRows: 2 }),
    {
      name: 'decoration',
      label: 'Forma de marca de fondo',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
})

export const AdvisorBlock = withSettings({
  slug: 'advisor',
  interfaceName: 'AdvisorBlock',
  labels: { singular: 'Asesor virtual', plural: 'Asesor virtual' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'note',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/AdvisorBlockNote#AdvisorBlockNote' } },
    },
  ],
})

export const QuoteCtaBlock = withSettings({
  slug: 'quoteCta',
  dbName: 'quote_cta',
  interfaceName: 'QuoteCtaBlock',
  labels: { singular: 'Llamado a la acción', plural: 'Llamados a la acción' },
  fields: [
    variantField(
      [
        { label: 'Franja terracota grande', value: 'band' },
        { label: 'Recuadro destacado', value: 'box' },
      ],
      'band',
    ),
    { name: 'eyebrow', label: 'Antetítulo', type: 'text', localized: true },
    { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
    { name: 'text', label: 'Texto', type: 'textarea', localized: true },
    linkArrayField(),
    {
      name: 'showWhatsapp',
      label: 'Agregar botón de WhatsApp',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
})

export const ProjectGridBlock = withSettings({
  slug: 'projectGrid',
  dbName: 'proj_grid',
  interfaceName: 'ProjectGridBlock',
  labels: { singular: 'Grilla de proyectos', plural: 'Grillas de proyectos' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'source',
      label: 'Qué proyectos mostrar',
      type: 'radio',
      defaultValue: 'featured',
      options: [
        { label: 'Destacados', value: 'featured' },
        { label: 'Más recientes', value: 'latest' },
        { label: 'Elegidos a mano', value: 'manual' },
      ],
    },
    {
      name: 'projects',
      label: 'Proyectos',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { condition: (_, s) => s?.source === 'manual' },
    },
    { name: 'limit', label: 'Cantidad máxima', type: 'number', defaultValue: 4, min: 1, max: 24 },
    linkField({
      name: 'cta',
      label: 'Enlace a la derecha del título (opcional)',
      requireLabel: false,
    }),
  ],
})

export const GalleryBlock = withSettings({
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Galería', plural: 'Galerías' },
  fields: [...sectionHeadingFields, galleryField({ name: 'images', minRows: 1 })],
})

export const FaqBlock = withSettings({
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'Preguntas frecuentes', plural: 'Preguntas frecuentes' },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'Preguntas frecuentes',
    },
    faqsField('items', 'Preguntas'),
  ],
})

export const ContactBlock = withSettings({
  slug: 'contact',
  interfaceName: 'ContactBlock',
  labels: { singular: 'Contacto (datos + formulario)', plural: 'Contacto' },
  fields: [
    { name: 'title', label: 'Título', type: 'text', localized: true },
    {
      name: 'promo',
      label: 'Recuadro destacado',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          label: 'Antetítulo',
          type: 'text',
          localized: true,
          defaultValue: 'Más rápido',
        },
        {
          name: 'text',
          label: 'Texto',
          type: 'text',
          localized: true,
          defaultValue: 'Armá tu presupuesto online y lo ajustamos juntos.',
        },
        linkField({ name: 'link', label: 'Botón', requireLabel: false }),
      ],
    },
    { name: 'showMap', label: 'Mostrar mapa', type: 'checkbox', defaultValue: false },
  ],
})

export const QuoteWizardBlock = withSettings({
  slug: 'quoteWizard',
  dbName: 'quote_wiz',
  interfaceName: 'QuoteWizardBlock',
  labels: { singular: 'Cotizador (5 pasos + presupuesto)', plural: 'Cotizadores' },
  fields: [
    {
      name: 'note',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/QuoteWizardNote#QuoteWizardNote' } },
    },
  ],
})

export const RichTextBlock = withSettings({
  slug: 'richText',
  dbName: 'rich_text',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Texto enriquecido', plural: 'Textos enriquecidos' },
  fields: [
    { name: 'title', label: 'Título (opcional)', type: 'text', localized: true },
    {
      name: 'content',
      label: 'Contenido',
      type: 'richText',
      editor: defaultEditor,
      required: true,
      localized: true,
    },
  ],
})

export const VideoBlock = withSettings({
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'url',
      label: 'URL de YouTube o Vimeo',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) =>
        !value ||
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i.test(value) ||
        'Ingresá un enlace de YouTube o Vimeo.',
    },
    {
      name: 'poster',
      label: 'Imagen de portada',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Se muestra hasta que el visitante reproduce el video (mejora la velocidad).',
      },
    },
    {
      name: 'aspect',
      label: 'Formato',
      type: 'select',
      defaultValue: '16/9',
      options: [
        { label: 'Horizontal 16:9', value: '16/9' },
        { label: 'Vertical 9:16 (Shorts / Reels)', value: '9/16' },
      ],
    },
  ],
})

export const SpacerBlock: Block = {
  slug: 'spacer',
  interfaceName: 'SpacerBlock',
  labels: { singular: 'Espaciador', plural: 'Espaciadores' },
  fields: [
    {
      type: 'row',
      fields: (['desktop', 'tablet', 'mobile'] as const).map((device) => ({
        name: device,
        label: `Alto en ${device} (px)`,
        type: 'number' as const,
        defaultValue: device === 'mobile' ? 24 : 48,
        min: 0,
        max: 400,
        admin: { width: '33%' },
      })),
    },
    { name: 'divider', label: 'Mostrar línea divisoria', type: 'checkbox', defaultValue: false },
  ],
}

/** Bloques disponibles en páginas, la home y los listados. */
export const ALL_BLOCKS: Block[] = [
  HeroBlock,
  StatementBlock,
  TextImageBlock,
  BenefitsBlock,
  ProductLinesBlock,
  ProductCategoriesBlock,
  ProductGridBlock,
  ProcessBlock,
  AdvisorBlock,
  QuoteCtaBlock,
  ProjectGridBlock,
  GalleryBlock,
  FaqBlock,
  ContactBlock,
  QuoteWizardBlock,
  RichTextBlock,
  VideoBlock,
  SpacerBlock,
]
