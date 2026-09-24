import { ProductGrid } from '@/components/catalog/ProductGrid'
import { CmsLink } from '@/components/cms/CmsLink'
import { Section, isDark } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ProductGridBlock as ProductGridBlockData } from '@/payload-types'
import { getProducts, type ProductFilters } from '@/lib/data/catalog'
import type { CmsLink as CmsLinkData } from '@/lib/links'

import { orderByIds, relId } from '../order'

export async function ProductGridBlock({
  variant,
  eyebrow,
  title,
  intro,
  source,
  category,
  line,
  products,
  limit,
  cta,
  settings,
}: ProductGridBlockData) {
  const filters: ProductFilters = { limit: limit ?? 6 }
  if (source === 'featured') filters.featured = true
  if (source === 'category') filters.categoryId = relId(category)
  if (source === 'line') filters.lineId = relId(line)
  const manualIds =
    source === 'manual'
      ? (products ?? []).map(relId).filter((id): id is number => id !== undefined)
      : []
  if (source === 'manual') {
    if (!manualIds.length) return null
    filters.ids = manualIds
  }

  const docs = orderByIds(await getProducts(filters), manualIds)
  if (!docs.length) return null

  return (
    <Section settings={settings}>
      <div className="container-site flex flex-col gap-[clamp(2rem,4vw,3.5rem)]">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          action={
            cta?.label ? (
              <CmsLink
                link={{ ...(cta as CmsLinkData), appearance: 'link' }}
                dark={isDark(settings)}
                arrow
              />
            ) : undefined
          }
        />
        <ProductGrid products={docs} variant={variant === 'feature' ? 'feature' : 'cards'} />
      </div>
    </Section>
  )
}
