import { ProductLineCard } from '@/components/cards/ProductLineCard'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ProductLinesBlock as ProductLinesBlockData } from '@/payload-types'
import { getProductLines } from '@/lib/data/catalog'

import { orderByIds } from '../order'

export async function ProductLinesBlock({
  variant,
  eyebrow,
  title,
  intro,
  lines,
  settings,
}: ProductLinesBlockData) {
  const ids = (lines ?? []).map((l) => (typeof l === 'object' ? l.id : l))
  const docs = orderByIds(await getProductLines(ids.length ? ids : undefined), ids)
  if (!docs.length) return null
  const overlay = variant === 'overlay'

  return (
    <Section settings={settings} defaultBackground={overlay ? 'default' : 'muted'}>
      <div className="container-site flex flex-col gap-[clamp(2.25rem,4vw,4rem)]">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          size={overlay ? 'md' : 'lg'}
        />
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] gap-3">
          {docs.map((line) => (
            <li key={line.id}>
              <ProductLineCard line={line} variant={overlay ? 'overlay' : 'card'} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
