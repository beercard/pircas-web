import type { ReactNode } from 'react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import type { Crumb } from '@/lib/seo/jsonld'

/** Encabezado de páginas de listado: migas + H1 grande + bajada a la derecha. */
export function PageIntro({
  breadcrumbs,
  eyebrow,
  title,
  intro,
  children,
}: {
  breadcrumbs: Crumb[]
  eyebrow?: string | null
  title: string
  intro?: string | null
  children?: ReactNode
}) {
  return (
    <section className="bg-paper pt-[clamp(2.75rem,5vw,5rem)] pb-[clamp(2rem,4vw,3.5rem)]">
      <div className="container-site flex flex-col gap-[26px]">
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] items-end gap-[clamp(1.75rem,4vw,5rem)]">
          <h1 className="max-w-[15ch] text-[clamp(2.375rem,1.3rem+4.4vw,5.5rem)] leading-[0.98] tracking-[-0.03em]">
            {title}
          </h1>
          {intro && (
            <p className="max-w-[40ch] pb-2.5 text-[clamp(1rem,0.9rem+0.5vw,1.375rem)] leading-normal font-normal text-muted">
              {intro}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
