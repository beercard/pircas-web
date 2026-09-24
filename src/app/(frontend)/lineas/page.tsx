import type { Metadata } from 'next'

import { RenderBlocks, type LayoutBlock } from '@/blocks/RenderBlocks'
import { ProductLineCard } from '@/components/cards/ProductLineCard'
import { PageIntro } from '@/components/layout/PageIntro'
import { getProductLines } from '@/lib/data/catalog'
import { getArchivePages } from '@/lib/data/globals'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const { lines } = await getArchivePages()
  return buildMetadata({
    path: ROUTES.lines,
    title: lines?.seo?.title || lines?.title,
    description: lines?.seo?.description || lines?.intro,
    image: lines?.seo?.image ?? lines?.image,
  })
}

export default async function LinesPage() {
  const [{ lines: archive }, lines] = await Promise.all([getArchivePages(), getProductLines()])
  const title = archive?.title || 'Nuestras líneas'
  return (
    <>
      <PageIntro
        breadcrumbs={[{ name: title, path: ROUTES.lines }]}
        eyebrow={archive?.eyebrow}
        title={title}
        intro={archive?.intro}
      />
      <section className="bg-paper pb-section-sm">
        <ul className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] gap-3">
          {lines.map((line, i) => (
            <li key={line.id}>
              <ProductLineCard line={line} variant="overlay" priority={i < 3} />
            </li>
          ))}
        </ul>
      </section>
      <RenderBlocks blocks={archive?.after as LayoutBlock[] | undefined} />
    </>
  )
}
