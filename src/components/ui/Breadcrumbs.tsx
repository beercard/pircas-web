import Link from 'next/link'

import { JsonLd } from '@/components/seo/JsonLd'
import { cn } from '@/lib/cn'
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo/jsonld'

/** Migas de pan (INICIO / PRODUCTOS / …) + BreadcrumbList en JSON-LD. */
export function Breadcrumbs({
  items,
  className,
  dark,
}: {
  items: Crumb[]
  className?: string
  dark?: boolean
}) {
  const all: Crumb[] = [{ name: 'Inicio', path: '/' }, ...items]
  return (
    <>
      <nav
        aria-label="Migas de pan"
        className={cn('text-eyebrow tracking-[0.18em] uppercase', className)}
      >
        <ol className={cn('flex flex-wrap gap-2.5', dark ? 'text-white/65' : 'text-muted')}>
          {all.map((c, i) => {
            const last = i === all.length - 1
            return (
              <li key={`${c.path}-${i}`} className="flex gap-2.5">
                {last ? (
                  <span aria-current="page" className={dark ? 'text-white' : 'text-ink'}>
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={c.path} className={dark ? 'hover:text-white' : 'hover:text-brand'}>
                      {c.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  )
}
