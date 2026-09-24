import { RichText } from '@/components/cms/RichText'
import { Section } from '@/components/ui/Section'
import type { RichTextBlock as RichTextBlockData } from '@/payload-types'

/** Texto largo (políticas, contenido editorial): título a la izquierda, texto a la derecha. */
export function RichTextBlock({ title, content, settings }: RichTextBlockData) {
  return (
    <Section settings={settings} defaultSpacing="sm">
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-[clamp(2rem,4vw,5rem)]">
        {title ? <h2 className="text-h3">{title}</h2> : <span aria-hidden="true" />}
        <RichText data={content} className="max-w-[62ch]" />
      </div>
    </Section>
  )
}
