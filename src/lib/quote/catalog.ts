import type { Payload } from 'payload'
import { cache } from 'react'

import type { FormsSetting } from '@/payload-types'
import { collectionTag, globalTag } from '@/lib/cache-tags'
import { cachedQuery } from '@/lib/data/client'

import { DEFAULT_PRICING, type PricingSettings, type QuoteLine, type QuoteProduct } from './pricing'

const relId = (v: unknown): number | null =>
  typeof v === 'number'
    ? v
    : v && typeof v === 'object' && 'id' in v
      ? Number((v as { id: number }).id)
      : null

export type QuoteNeed = {
  label: string
  description: string
  categoryIds: number[]
  presetProductId: number | null
}

/** Todo lo que el cotizador necesita, serializable (se pasa al componente cliente). */
export type QuoteCatalog = {
  needs: QuoteNeed[]
  products: QuoteProduct[]
  lines: QuoteLine[]
  projectTypes: string[]
  pricing: PricingSettings & { showPrices: boolean; disclaimer: string }
  visitLabel: string
  maxItems: number
  privacyNote: string
  success: { title: string; message: string }
}

export function pricingFrom(settings: FormsSetting | null): QuoteCatalog['pricing'] {
  const p = settings?.pricing
  return {
    showPrices: p?.showPrices !== false,
    minArea: p?.minArea ?? DEFAULT_PRICING.minArea,
    rounding: p?.rounding ?? DEFAULT_PRICING.rounding,
    minDimension: p?.minDimension ?? DEFAULT_PRICING.minDimension,
    maxDimension: p?.maxDimension ?? DEFAULT_PRICING.maxDimension,
    disclaimer: p?.disclaimer ?? '',
  }
}

/**
 * Lee productos cotizables y líneas publicadas. `payload` se recibe por parámetro para
 * poder usarse tanto en la página (cacheado) como en el endpoint de envío (sin caché).
 */
export async function loadQuoteCatalog(payload: Payload): Promise<QuoteCatalog> {
  const [settings, productsRes, linesRes] = await Promise.all([
    payload.findGlobal({ slug: 'forms-settings', depth: 0, overrideAccess: true }),
    payload.find({
      collection: 'products',
      where: { and: [{ 'quote.enabled': { equals: true } }, { _status: { equals: 'published' } }] },
      depth: 0,
      limit: 200,
      sort: 'order',
      overrideAccess: true,
      draft: false,
    }),
    payload.find({
      collection: 'product-lines',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 50,
      sort: 'order',
      overrideAccess: true,
      draft: false,
    }),
  ])

  const products: QuoteProduct[] = productsRes.docs.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: relId(p.category),
    pricing: p.quote?.pricing === 'fixed' ? 'fixed' : 'line',
    pricePerM2: p.quote?.pricePerM2 ?? null,
    multiplier: p.quote?.multiplier ?? 1,
    secondSide: Boolean(p.quote?.secondSide),
    fixedDescription: p.quote?.fixedDescription ?? null,
  }))

  const lines: QuoteLine[] = linesRes.docs
    .filter((l) => (l.quote?.pricePerM2 ?? 0) > 0)
    .map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      pricePerM2: l.quote?.pricePerM2 ?? null,
      glass: (l.quote?.glassOptions ?? []).map((g) => ({ name: g.name, multiplier: g.multiplier })),
    }))

  return {
    needs: (settings.needs ?? []).map((n) => ({
      label: n.label,
      description: n.description ?? '',
      categoryIds: (n.categories ?? []).map(relId).filter((id): id is number => id !== null),
      presetProductId: relId(n.presetProduct),
    })),
    products,
    lines,
    projectTypes: (settings.projectTypes ?? []).map((t) => t.label),
    pricing: pricingFrom(settings),
    visitLabel: settings.visitLabel ?? 'Quiero medición en obra',
    maxItems: settings.maxItems ?? 20,
    privacyNote: settings.privacyNote ?? '',
    success: {
      title: settings.quoteSuccess?.title ?? 'Recibimos tu consulta.',
      message: settings.quoteSuccess?.message ?? '',
    },
  }
}

export const getQuoteCatalog = cache(async (): Promise<QuoteCatalog> =>
  cachedQuery(
    ['quote-catalog'],
    [collectionTag('products'), collectionTag('product-lines'), globalTag('forms-settings')],
    async ({ payload }) => loadQuoteCatalog(payload),
  ),
)
