import Link from 'next/link'

import { cn } from '@/lib/cn'

export type FilterTab = { label: string; href: string; active: boolean }

/**
 * Filtros como pestañas subrayadas. Son enlaces (no botones con JS): cada filtro tiene
 * su propia URL (?categoria=…), se puede compartir y los buscadores la indexan.
 */
export function FilterTabs({ tabs, label }: { tabs: FilterTab[]; label: string }) {
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
