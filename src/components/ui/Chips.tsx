import Link from 'next/link'

import { cn } from '@/lib/cn'

type Chip = { label: string; href?: string; id?: string | number | null }

/** Etiquetas rectangulares con borde fino (aplicaciones, productos utilizados). */
export function Chips({ items, className }: { items: Chip[]; className?: string }) {
  if (!items.length) return null
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {items.map((c) => (
        <li key={c.id ?? c.label}>
          {c.href ? (
            <Link
              href={c.href}
              className="block border border-line-strong px-[18px] py-3 text-label tracking-[0.06em] normal-case hover:border-ink"
            >
              {c.label}
            </Link>
          ) : (
            <span className="block border border-line-strong px-[18px] py-3 text-label tracking-[0.1em]">
              {c.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
