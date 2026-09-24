import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  eyebrow?: string | null
  title?: string | null
  intro?: string | null
  /** Acción a la derecha (ej: "Ver todos los productos →"). */
  action?: ReactNode
  as?: 'h1' | 'h2'
  /** `lg` para títulos de sección principales, `md` para subsecciones. */
  size?: 'lg' | 'md'
  className?: string
  id?: string
}

/**
 * Encabezado de sección del diseño: antetítulo + título a la izquierda,
 * bajada corta (o acción) a la derecha, alineados por la base.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  as: Tag = 'h2',
  size = 'lg',
  className,
  id,
}: Props) {
  if (!eyebrow && !title && !intro && !action) return null
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-6', className)}>
      {(eyebrow || title) && (
        <div className="flex flex-col gap-[18px]">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <Tag id={id} className={cn(size === 'lg' ? 'text-h2' : 'text-h3', 'max-w-[24ch]')}>
              {title}
            </Tag>
          )}
        </div>
      )}
      {intro && (
        <p className="max-w-[36ch] text-[0.9375rem] leading-relaxed font-normal text-muted in-[.on-dark]:text-white/70">
          {intro}
        </p>
      )}
      {action}
    </div>
  )
}
