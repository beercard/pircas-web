import { VirtualAdvisor } from '@/components/advisor/VirtualAdvisor'
import { Section } from '@/components/ui/Section'
import type { AdvisorBlock as AdvisorBlockData } from '@/payload-types'
import type { AdvisorConfig } from '@/lib/advisor'
import { getProductLines } from '@/lib/data/catalog'
import { getAdvisor } from '@/lib/data/globals'
import { isPopulated } from '@/lib/data/populated'

import { relId } from '../order'

/** Asesor virtual: texto a la izquierda y preguntas a la derecha. Configurable en el CMS. */
export async function AdvisorBlock({ eyebrow, title, intro, settings }: AdvisorBlockData) {
  const [advisor, lines] = await Promise.all([getAdvisor(), getProductLines()])
  if (advisor.enabled === false || !advisor.questions?.length || !lines.length) return null

  const results = new Map(
    (advisor.results ?? []).flatMap((r) => {
      const id = relId(r.line)
      return id ? [[id, r] as const] : []
    }),
  )

  const config: AdvisorConfig = {
    fallbackLineId: relId(advisor.fallbackLine) ?? null,
    lines: lines.map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      headline: results.get(l.id)?.headline || l.name,
      text: results.get(l.id)?.text || l.tagline || l.shortDescription,
    })),
    questions: advisor.questions.map((q) => ({
      key: q.key,
      question: q.question,
      answers: (q.answers ?? []).map((a) => ({
        key: a.key,
        label: a.label,
        icon: a.icon,
        weights: (a.weights ?? []).flatMap((w) => {
          const lineId = isPopulated(w.line) ? w.line.id : relId(w.line)
          return lineId ? [{ lineId, points: w.points }] : []
        }),
      })),
    })),
  }

  return (
    <Section settings={settings}>
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,22.5rem),1fr))] items-start gap-[clamp(2.25rem,5vw,5.625rem)]">
        <div className="flex flex-col gap-[22px]">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <h2 className="text-[clamp(2rem,1.3rem+2.8vw,3.875rem)] leading-[1.02] tracking-[-0.025em]">
              {title}
            </h2>
          )}
          {intro && (
            <p className="max-w-[42ch] text-[0.9375rem] leading-[1.65] font-normal text-muted">
              {intro}
            </p>
          )}
        </div>
        <VirtualAdvisor
          config={config}
          labels={{
            resultEyebrow: advisor.resultEyebrow || 'Te recomendamos',
            quoteLabel: advisor.quoteLabel || 'Cotizar esta línea',
            restartLabel: advisor.restartLabel || 'Volver a empezar',
          }}
        />
      </div>
    </Section>
  )
}
