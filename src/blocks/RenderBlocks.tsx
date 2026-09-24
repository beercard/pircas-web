import type { ComponentType } from 'react'

import type { Page } from '@/payload-types'

import { AdvisorBlock } from './Advisor/Component'
import { BenefitsBlock } from './Benefits/Component'
import { ContactBlock } from './Contact/Component'
import { FaqBlock } from './Faq/Component'
import { GalleryBlock } from './Gallery/Component'
import { HeroBlock } from './Hero/Component'
import { ProcessBlock } from './Process/Component'
import { ProductCategoriesBlock } from './ProductCategories/Component'
import { ProductGridBlock } from './ProductGrid/Component'
import { ProductLinesBlock } from './ProductLines/Component'
import { ProjectGridBlock } from './ProjectGrid/Component'
import { QuoteCtaBlock } from './QuoteCta/Component'
import { QuoteWizardBlock } from './QuoteWizard/Component'
import { RichTextBlock } from './RichText/Component'
import { SpacerBlock } from './Spacer/Component'
import { StatementBlock } from './Statement/Component'
import { TextImageBlock } from './TextImage/Component'
import type { BlockContext } from './types'
import { VideoBlock } from './Video/Component'

export type LayoutBlock = Page['layout'][number]

/** Mapa tipo de bloque → componente. Para agregar un bloque: config en configs.ts + componente + esta línea. */
const COMPONENTS: {
  [K in LayoutBlock['blockType']]: ComponentType<
    Extract<LayoutBlock, { blockType: K }> & BlockContext
  >
} = {
  hero: HeroBlock,
  statement: StatementBlock,
  textImage: TextImageBlock,
  benefits: BenefitsBlock,
  productLines: ProductLinesBlock,
  productCategories: ProductCategoriesBlock,
  productGrid: ProductGridBlock,
  process: ProcessBlock,
  advisor: AdvisorBlock,
  quoteCta: QuoteCtaBlock,
  projectGrid: ProjectGridBlock,
  gallery: GalleryBlock,
  faq: FaqBlock,
  contact: ContactBlock,
  quoteWizard: QuoteWizardBlock,
  richText: RichTextBlock,
  video: VideoBlock,
  spacer: SpacerBlock,
}

/** Renderiza la lista de bloques de una página/home. Los bloques ocultos se omiten. */
export function RenderBlocks({
  blocks,
  breadcrumbs,
}: { blocks: LayoutBlock[] | null | undefined } & Pick<BlockContext, 'breadcrumbs'>) {
  const visible = (blocks ?? []).filter((b) => !('settings' in b && b.settings?.hidden))
  return (
    <>
      {visible.map((block, index) => {
        const Component = COMPONENTS[block.blockType] as ComponentType<LayoutBlock & BlockContext>
        if (!Component) return null
        return (
          <Component
            key={block.id ?? index}
            {...block}
            isFirst={index === 0}
            breadcrumbs={breadcrumbs}
          />
        )
      })}
    </>
  )
}
