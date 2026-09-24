import type { Metadata } from 'next'
import Link from 'next/link'

import { RenderBlocks, type LayoutBlock } from '@/blocks/RenderBlocks'
import { ProjectGrid } from '@/components/catalog/ProjectGrid'
import { PageIntro } from '@/components/layout/PageIntro'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { cn } from '@/lib/cn'
import { getArchivePages, getSiteSettings } from '@/lib/data/globals'
import { getProjectCategories, getProjectsPage } from '@/lib/data/projects'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { searchParams: Promise<{ categoria?: string; pagina?: string }> }

const PER_PAGE = 9

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [{ projects }, { pagina }] = await Promise.all([getArchivePages(), searchParams])
  const meta = await buildMetadata({
    path: ROUTES.projects,
    title: projects?.seo?.title || projects?.title,
    description: projects?.seo?.description || projects?.intro,
    image: projects?.seo?.image ?? projects?.image,
  })
  // Las páginas 2+ no se indexan como duplicadas de la primera.
  if (pagina && pagina !== '1') meta.robots = { index: false, follow: true }
  return meta
}

function pageHref(category: string | undefined, page: number) {
  const params = new URLSearchParams()
  if (category) params.set('categoria', category)
  if (page > 1) params.set('pagina', String(page))
  const qs = params.toString()
  return `${ROUTES.projects}${qs ? `?${qs}` : ''}`
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { categoria, pagina } = await searchParams
  const [{ projects: archive }, categories, site] = await Promise.all([
    getArchivePages(),
    getProjectCategories(),
    getSiteSettings(),
  ])
  const category = categories.find((c) => c.slug === categoria)?.slug
  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1)
  const result = await getProjectsPage({ category, page, limit: PER_PAGE })
  const title = archive?.title || 'Proyectos'
  const instagramHandle = site.instagram?.match(/instagram\.com\/([^/?#]+)/)?.[1]

  const tabs = [
    { label: 'Todos', href: ROUTES.projects, active: !category },
    ...categories.map((c) => ({
      label: c.name,
      href: pageHref(c.slug, 1),
      active: c.slug === category,
    })),
  ]

  return (
    <>
      <PageIntro
        breadcrumbs={[{ name: title, path: ROUTES.projects }]}
        eyebrow={archive?.eyebrow}
        title={title}
        intro={archive?.intro}
      />
      <section className="bg-paper pb-section-sm">
        <div className="container-site flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)]">
          <FilterTabs tabs={tabs} label="Filtrar proyectos" />
          {result.docs.length ? (
            <ProjectGrid projects={result.docs} showPlace priorityCount={3} min="16.875rem" />
          ) : (
            <p className="text-sm font-normal text-muted">
              Todavía no hay proyectos en esta categoría.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-[18px] pt-3">
            <span className="text-[0.8125rem] font-normal text-muted">
              Mostrando {result.docs.length} de {result.totalDocs} proyectos
            </span>
            {result.totalPages > 1 && (
              <nav aria-label="Paginación" className="flex gap-2">
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={pageHref(category, n)}
                    aria-current={n === result.page ? 'page' : undefined}
                    className={cn(
                      'flex size-11 items-center justify-center border text-[0.8125rem]',
                      n === result.page
                        ? 'border-ink bg-ink text-white'
                        : 'border-ink/22 hover:border-ink',
                    )}
                  >
                    {n}
                  </Link>
                ))}
                {result.page < result.totalPages && (
                  <Link
                    href={pageHref(category, result.page + 1)}
                    className="flex size-11 items-center justify-center border border-ink/22 text-base hover:border-ink"
                    aria-label="Página siguiente"
                  >
                    →
                  </Link>
                )}
              </nav>
            )}
          </div>

          {site.instagram && (
            <p className="flex items-center gap-4 text-[0.8125rem] font-normal text-muted">
              <span aria-hidden="true" className="h-px w-7 bg-brand" />
              Más trabajos en{' '}
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline-offset-4 hover:underline"
              >
                {instagramHandle ? `@${instagramHandle}` : 'Instagram'}
              </a>
            </p>
          )}
        </div>
      </section>
      <RenderBlocks blocks={archive?.after as LayoutBlock[] | undefined} />
    </>
  )
}
