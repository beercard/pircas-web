import { Check } from 'lucide-react'

import { cn } from '@/lib/cn'

const STEPS = [
  { title: 'Agregá todos los productos', text: 'que te interesan al presupuesto.' },
  { title: 'Completá tu WhatsApp', text: 'nombre, número y localidad.' },
  { title: 'Recibí el presupuesto', text: 'en el acto, con precios y cuotas.' },
] as const

/**
 * "Presupuesto automático en 3 simples pasos". `current` marca el paso en curso
 * (1, 2 o 3); los anteriores se muestran como hechos.
 */
export function QuoteSteps({
  current,
  title = true,
  tone = 'light',
}: {
  current?: 1 | 2 | 3
  title?: boolean
  tone?: 'light' | 'dark'
}) {
  const dark = tone === 'dark'
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <p
          className={cn(
            'text-eyebrow tracking-[0.2em] uppercase',
            dark ? 'text-white/70' : 'text-muted',
          )}
        >
          Presupuesto automático en 3 simples pasos
        </p>
      )}
      <ol
        className={cn(
          'grid grid-cols-3 gap-px',
          dark ? 'bg-white/15' : 'border border-line bg-line',
        )}
      >
        {STEPS.map((s, i) => {
          const n = i + 1
          const done = current !== undefined && n < current
          const active = n === current
          return (
            <li
              key={s.title}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex flex-col items-start gap-2 p-3 sm:flex-row sm:gap-3.5 sm:p-5',
                dark ? 'bg-ink' : active ? 'bg-white' : 'bg-paper',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-door pr-1 text-sm font-semibold sm:size-8',
                  done || active
                    ? 'bg-brand text-white'
                    : dark
                      ? 'bg-white text-ink'
                      : 'bg-ink text-white',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : n}
              </span>
              <span className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    'text-[0.75rem] leading-tight font-medium sm:text-[0.9375rem] sm:leading-normal',
                    dark && 'text-white',
                  )}
                >
                  {s.title}
                </span>
                <span
                  className={cn(
                    'hidden text-[0.8125rem] font-normal sm:block',
                    dark ? 'text-white/70' : 'text-muted',
                  )}
                >
                  {s.text}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
