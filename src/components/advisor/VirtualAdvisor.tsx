'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { recommend, type AdvisorConfig, type AdvisorSelection } from '@/lib/advisor'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'
import { pathFor, ROUTES } from '@/lib/routes'

type Labels = { resultEyebrow: string; quoteLabel: string; restartLabel: string }

/**
 * Asesor virtual: una pregunta por paso; al terminar muestra la línea recomendada.
 * Botones con aria-pressed, resultado anunciado en una región aria-live.
 */
export function VirtualAdvisor({ config, labels }: { config: AdvisorConfig; labels: Labels }) {
  const [selection, setSelection] = useState<AdvisorSelection>({})
  const [step, setStep] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)
  const total = config.questions.length
  const done = step >= total
  const question = config.questions[Math.min(step, total - 1)]
  const rec = useMemo(() => (done ? recommend(config, selection) : null), [done, config, selection])

  if (!total || !question) return null

  const pick = (answerKey: string) => {
    const next = { ...selection, [question.key]: answerKey }
    setSelection(next)
    const nextStep = step + 1
    setStep(nextStep)
    if (nextStep >= total) {
      const r = recommend(config, next)
      if (r) track('advisor_complete', { recommended_line: r.line.name, ...next })
      requestAnimationFrame(() => resultRef.current?.focus())
    }
  }

  const restart = () => {
    setSelection({})
    setStep(0)
  }

  return (
    <div className="flex flex-col border-t border-ink">
      <div className="flex items-baseline justify-between gap-4 pt-5 pb-2.5 text-label tracking-[0.2em] text-muted uppercase">
        <span id="advisor-question">{done ? 'Tus respuestas' : question.question}</span>
        {total > 1 && !done && (
          <span className="text-eyebrow">
            {step + 1} / {total}
          </span>
        )}
      </div>

      {!done ? (
        <div role="group" aria-labelledby="advisor-question">
          {question.answers.map((a, i) => {
            const selected = selection[question.key] === a.key
            return (
              <button
                key={a.key}
                type="button"
                aria-pressed={selected}
                onClick={() => pick(a.key)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 border-b border-line py-[22px] pr-4 text-left text-[clamp(1.0625rem,0.9rem+0.6vw,1.4375rem)] tracking-[-0.01em] transition-[color,padding] duration-250 hover:text-brand',
                  selected ? 'pl-3 text-brand' : 'pl-0',
                )}
              >
                <span className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-3 rounded-door border-[1.5px] border-current',
                      selected ? 'bg-brand' : 'bg-transparent',
                    )}
                  />
                  {a.label}
                </span>
                <span aria-hidden="true" className="text-eyebrow tracking-[0.22em] text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            )
          })}
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="mt-4 text-label tracking-[0.18em] text-muted uppercase hover:text-brand"
            >
              ← Volver
            </button>
          )}
        </div>
      ) : (
        <ul className="border-b border-line pb-4 text-sm font-normal text-muted">
          {config.questions.map((q) => (
            <li key={q.key} className="flex justify-between gap-4 py-1.5">
              <span>{q.question}</span>
              <span className="text-ink">
                {q.answers.find((a) => a.key === selection[q.key])?.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite">
        {rec ? (
          <div
            ref={resultRef}
            tabIndex={-1}
            className="relative mt-6 flex flex-wrap items-end justify-between gap-[22px] overflow-hidden bg-ink px-7 py-8 text-white outline-none"
          >
            <div className="flex flex-col gap-2">
              <span className="text-eyebrow tracking-[0.3em] text-brand-soft uppercase">
                {labels.resultEyebrow}
              </span>
              <span className="text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-[1.05] tracking-[-0.02em]">
                {rec.line.headline || rec.line.name}
              </span>
              <span className="max-w-[40ch] text-sm leading-relaxed font-normal text-white/70">
                {rec.line.text}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href={pathFor('product-lines', rec.line.slug)}
                className={buttonVariants({ variant: 'primary-on-dark' })}
              >
                Ver esta línea <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={`${ROUTES.quote}?linea=${encodeURIComponent(rec.line.slug)}`}
                className="text-label tracking-[0.18em] text-white/80 uppercase hover:text-brand-soft"
              >
                {labels.quoteLabel} →
              </Link>
            </div>
            <button
              type="button"
              onClick={restart}
              className="basis-full text-left text-eyebrow tracking-[0.2em] text-white/60 uppercase hover:text-white"
            >
              {labels.restartLabel}
            </button>
          </div>
        ) : (
          <p className="mt-6 flex items-center gap-3.5 text-[0.8125rem] font-normal text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-brand" />
            Elegí una opción para ver la línea recomendada.
          </p>
        )}
      </div>
    </div>
  )
}
