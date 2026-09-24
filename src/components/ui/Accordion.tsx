import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type AccordionItem = { id: string; title: string; content: ReactNode }

/**
 * Acordeón accesible sin JavaScript (<details>/<summary>): funciona con teclado,
 * lectores de pantalla y aun si el JS no cargó. El primer ítem puede abrirse por defecto.
 * `name` agrupa los ítems para que solo uno quede abierto (navegadores modernos).
 */
export function Accordion({
  items,
  name,
  openFirst = true,
  titleStyle = 'caps',
  className,
}: {
  items: AccordionItem[]
  name: string
  openFirst?: boolean
  titleStyle?: 'caps' | 'question'
  className?: string
}) {
  if (!items.length) return null
  return (
    <div className={cn('flex flex-col border-t border-line-strong', className)}>
      {items.map((item, i) => (
        <details
          key={item.id}
          name={name}
          open={openFirst && i === 0}
          className="group border-b border-line"
        >
          <summary
            className={cn(
              'flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left transition-colors group-open:text-brand hover:text-brand [&::-webkit-details-marker]:hidden',
              titleStyle === 'caps'
                ? 'text-label tracking-[0.16em] uppercase'
                : 'text-[clamp(0.9375rem,0.85rem+0.4vw,1.1875rem)]',
            )}
          >
            {item.title}
            <span aria-hidden="true" className="shrink-0 text-lg text-brand">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="pb-6">{item.content}</div>
        </details>
      ))}
    </div>
  )
}

/** Filas "dato → valor" usadas dentro de acordeones y tablas técnicas. */
export function SpecRows({
  rows,
  size = 'sm',
}: {
  rows: { label: string; value: string; id?: string | null }[]
  size?: 'sm' | 'md'
}) {
  return (
    <dl className="flex flex-col">
      {rows.map((r) => (
        <div
          key={r.id ?? r.label}
          className={cn(
            'flex justify-between gap-6',
            size === 'md' ? 'border-b border-line py-4' : 'py-2.5',
          )}
        >
          <dt
            className={cn(
              'max-w-[46%] shrink-0',
              size === 'md'
                ? 'text-eyebrow tracking-[0.18em] text-muted uppercase'
                : 'text-sm font-normal text-muted',
            )}
          >
            {r.label}
          </dt>
          <dd className="text-right text-sm leading-normal font-normal">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
