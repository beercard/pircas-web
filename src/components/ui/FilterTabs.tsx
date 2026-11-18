import Link from 'next/link'

import { cn } from '@/lib/cn'

export type FilterTab = { label: string; href: string; active: boolean }

/**
 * Filtros como pestañas subrayadas. Son enlaces (no botones con JS): cada filtro tiene
 * su propia URL (?categoria=…), se puede compartir y los buscadores la indexan.
 */
export function FilterTabs({
  tabs,
  label,
  variant = 'underline',
}: {
  tabs: FilterTab[]
  label: string
  /** `chips`: botones en caja que se acomodan en varias filas (listas largas de categorías). */
  variant?: 'underline' | 'chips'
}) {
  if (variant === 'chips')
    return (
      <nav aria-label={label}>
        <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          {tabs.map((t) => (
            <li key={t.href} className="shrink-0">
              <Link
                href={t.href}
                scroll={false}
                aria-current={t.active ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 items-center border px-4 text-[0.6875rem] tracking-[0.16em] whitespace-nowrap uppercase transition-colors',
                  t.active
                    ? 'border-ink bg-ink font-medium text-white'
                    : 'border-line-strong bg-white text-ink hover:border-brand hover:text-brand',
                )}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  return (
    <nav aria-label={label} className="border-b border-line">
      <ul className="-mb-px flex flex-wrap gap-x-[26px] gap-y-1.5">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              scroll={false}
              aria-current={t.active ? 'page' : undefined}
              className={cn(
                'block border-b-2 py-3.5 text-eyebrow tracking-[0.2em] uppercase transition-colors hover:text-brand',
                t.active ? 'border-brand text-ink' : 'border-transparent text-muted',
              )}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
