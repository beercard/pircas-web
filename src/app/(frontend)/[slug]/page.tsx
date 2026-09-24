import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getPageBySlug } from '@/lib/data/pages'
import { pathFor } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(decodeURIComponent(slug))
  if (!page) return {}
  return buildMetadata({ path: pathFor('pages', page.slug), title: page.title, meta: page.meta })
}

/** Páginas del CMS armadas con bloques: /nosotros, /contacto, /cotizador, /mamparas y nuevas. */
export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(decodeURIComponent(slug))
  if (!page) notFound()

  return (
    <>
      {page.hideFooterCta && <span data-hide-footer-cta hidden />}
      <RenderBlocks
        blocks={page.layout}
        breadcrumbs={[{ name: page.title, path: pathFor('pages', page.slug) }]}
      />
    </>
  )
}
