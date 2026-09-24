import { JsonLd } from '@/components/seo/JsonLd'
import { Accordion } from '@/components/ui/Accordion'
import { Section } from '@/components/ui/Section'
import type { FaqBlock as FaqBlockData } from '@/payload-types'
import { faqJsonLd } from '@/lib/seo/jsonld'

export type FaqItem = { question: string; answer: string; id?: string | null }

/** Preguntas frecuentes: título a la izquierda, acordeón a la derecha. */
export function FaqList({
  title,
  items,
  id,
}: {
  title?: string | null
  items: FaqItem[]
  id: string
}) {
  return (
    <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] items-start gap-[clamp(2rem,4vw,5rem)]">
      {title && <h2 className="text-h3">{title}</h2>}
      <Accordion
        name={id}
        titleStyle="question"
        items={items.map((q, i) => ({
          id: q.id ?? String(i),
          title: q.question,
          content: (
            <p className="max-w-[60ch] pr-10 text-[0.906rem] leading-[1.7] font-normal text-muted">
              {q.answer}
            </p>
          ),
        }))}
      />
      <JsonLd data={faqJsonLd(items)} />
    </div>
  )
}

export function FaqBlock({ title, items, settings, id }: FaqBlockData) {
  if (!items?.length) return null
  return (
    <Section settings={settings} defaultBackground="muted" defaultSpacing="sm">
      <FaqList title={title} items={items} id={`faq-${id ?? 'block'}`} />
    </Section>
  )
}
