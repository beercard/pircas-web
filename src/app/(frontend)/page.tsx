import type { Metadata } from 'next'

import { RenderBlocks, type LayoutBlock } from '@/blocks/RenderBlocks'
import { getHomepage, getSeoDefaults } from '@/lib/data/globals'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const [home, seo] = await Promise.all([getHomepage(), getSeoDefaults()])
  return buildMetadata({ path: '/', title: seo.defaultTitle, meta: home.meta, absoluteTitle: true })
}

/** Home: secciones 100 % editables en Contenido → Home. */
export default async function HomePage() {
  const home = await getHomepage()
  return <RenderBlocks blocks={home.sections as LayoutBlock[]} />
}
