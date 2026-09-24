import { CategoryCard } from '@/components/cards/CategoryCard'
import { CmsLink } from '@/components/cms/CmsLink'
import { Section, isDark } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ProductCategoriesBlock as ProductCategoriesBlockData } from '@/payload-types'
import { getProductCategories } from '@/lib/data/catalog'
import type { CmsLink as CmsLinkData } from '@/lib/links'

import { orderByIds } from '../order'

/** "También hacemos": mosaicos cuadrados de categorías. */
export async function ProductCategoriesBlock({
  eyebrow,
  title,
  intro,
  categories,
  cta,
  settings,
}: ProductCategoriesBlockData) {
  const ids = (categories ?? []).map((c) => (typeof c === 'object' ? c.id : c))
  const docs = orderByIds(await getProductCategories(ids.length ? ids : undefined), ids)
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
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,12.5rem),1fr))] gap-2.5">
          {docs.map((cat) => (
            <li key={cat.id}>
              <CategoryCard category={cat} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
