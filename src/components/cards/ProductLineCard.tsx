import Link from 'next/link'

import { CmsImage } from '@/components/ui/CmsImage'
import type { ProductLine } from '@/payload-types'
import { cn } from '@/lib/cn'
import { pathFor } from '@/lib/routes'

type Variant = 'card' | 'overlay' | 'compact'

/**
 * Tarjeta de línea en tres diseños:
 * - card: foto + etiqueta + frase terracota + 3 puntos (home).
 * - overlay: foto alta con texto superpuesto (Productos).
 * - compact: foto 16:10 + nombre y frase ("Otras líneas").
 */
export function ProductLineCard({
  line,
  variant = 'card',
  priority,
}: {
  line: ProductLine
  variant?: Variant
  priority?: boolean
}) {
  const href = pathFor('product-lines', line.slug)

  if (variant === 'overlay') {
    return (
      <Link
        href={href}
        className="group relative flex min-h-[25rem] flex-col justify-end overflow-hidden bg-ink text-white"
      >
        <CmsImage
          media={line.heroImage}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 ease-[var(--ease-soft)] group-hover:scale-[1.03]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(0deg,rgb(24_25_28/0.88)_0%,rgb(24_25_28/0.25)_55%,transparent_100%)]"
        />
        <span className="relative flex flex-col gap-3 px-[26px] pt-7 pb-[30px]">
          {line.positioning && (
            <span className="text-[0.656rem] tracking-[0.28em] text-brand-soft uppercase">
              {line.positioning}
            </span>
          )}
          <span className="text-[clamp(1.375rem,1.1rem+1vw,1.875rem)] leading-[1.05] tracking-[-0.02em]">
            {line.name}
          </span>
          <span className="max-w-[32ch] text-sm leading-normal font-normal text-white/80">
            {line.tagline}
          </span>
          <span className="mt-2 text-[0.72rem] tracking-[0.18em] uppercase">Ver línea →</span>
        </span>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="flex flex-col overflow-hidden bg-stone transition-transform duration-300 hover:-translate-y-1"
      >
        <span className="relative block aspect-[16/10] overflow-hidden">
          <CmsImage media={line.heroImage} fill sizes="(min-width: 768px) 45vw, 100vw" />
        </span>
        <span className="flex flex-col gap-2 px-[22px] py-6">
          <span className="text-xl tracking-[-0.01em]">{line.name}</span>
          <span className="text-[0.84rem] font-normal text-muted">{line.tagline}</span>
          <span className="mt-2.5 text-[0.72rem] tracking-[0.18em] uppercase">Ver línea →</span>
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="flex h-full flex-col overflow-hidden bg-paper transition-transform duration-350 hover:-translate-y-1.5 hover:text-ink"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-stone">
        <CmsImage
          media={line.heroImage}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {line.positioning && (
          <span
            className={cn(
              'absolute top-0 left-0 px-5 py-3.5 text-[0.656rem] tracking-[0.28em] text-white uppercase',
              line.badge ? 'bg-brand' : 'bg-ink',
            )}
          >
            {line.positioning}
          </span>
        )}
      </span>
      <span className="flex flex-1 flex-col gap-3.5 px-7 pt-[30px] pb-[34px]">
        <h3 className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-[1.05] tracking-[-0.02em]">
          {line.name}
        </h3>
        <span className="text-base leading-snug text-brand">{line.tagline}</span>
        {!!line.cardHighlights?.length && (
          <ul className="dash-list mt-1.5 flex flex-col gap-2 text-[0.84rem] leading-normal font-normal text-muted">
            {line.cardHighlights.map((h) => (
              <li key={h.id}>{h.text}</li>
            ))}
          </ul>
        )}
        <span className="mt-auto pt-[22px] text-label tracking-[0.18em] uppercase">
          Ver línea <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  )
}
