import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TrackView } from '@/components/analytics/TrackView'
import { projectLabel } from '@/components/cards/ProjectCard'
import { ProjectGrid } from '@/components/catalog/ProjectGrid'
import { RichText } from '@/components/cms/RichText'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Chips } from '@/components/ui/Chips'
import { CmsImage } from '@/components/ui/CmsImage'
import { Facts } from '@/components/ui/Facts'
import { Gallery } from '@/components/ui/Gallery'
import { isPopulated, populatedList } from '@/lib/data/populated'
import { getProjectBySlug, getProjects } from '@/lib/data/projects'
import { toGalleryImages } from '@/lib/media'
import { pathFor, ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug)
  if (!project) return {}
  return buildMetadata({
    path: pathFor('projects', project.slug),
    title: project.title,
    description: project.summary,
    image: project.coverImage,
    meta: project.meta,
    type: 'article',
  })
}

/** Caso de estudio: hero con datos, texto, productos, galería, "Qué llevó" y otros proyectos. */
export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug((await params).slug)
  if (!project) notFound()
  const others = await getProjects({ excludeId: project.id, limit: 3 })

  const line = isPopulated(project.line) ? project.line : null
  const meta = [
    { label: 'Categoría', value: line ? `Línea ${line.name}` : projectLabel(project) },
    { label: 'Ubicación', value: project.location },
    { label: 'Año', value: project.year ? String(project.year) : null },
    {
      label: 'Aberturas',
      value: project.openingsCount
        ? `${project.openingsCount} ${project.openingsCount === 1 ? 'unidad' : 'unidades'}`
        : null,
    },
  ].filter((m): m is { label: string; value: string } => Boolean(m.value))

  const chips = [
    ...(line
      ? [
          {
            id: `l${line.id}`,
            label: `Línea ${line.name}`,
            href: pathFor('product-lines', line.slug),
          },
        ]
      : []),
    ...populatedList(project.productsUsed).map((p) => ({
      id: p.id,
      label: p.name,
      href: pathFor('products', p.slug),
    })),
  ]
  const gallery = toGalleryImages(project.gallery)

  return (
    <>
      <TrackView
        event="project_view"
        params={{ project: project.title, location: project.location ?? undefined }}
      />

      <section className="on-dark relative -mt-header flex min-h-[min(82svh,47.5rem)] overflow-hidden bg-ink text-white">
        <span data-over-hero hidden />
        <CmsImage media={project.coverImage} fill priority sizes="100vw" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(0deg,rgb(24_25_28/0.88)_0%,rgb(24_25_28/0.25)_55%,rgb(24_25_28/0.15)_100%)]"
        />
        <div className="relative mx-auto flex w-full max-w-site flex-col justify-end gap-[22px] px-gutter pt-40 pb-14">
          <Breadcrumbs
            dark
            items={[
              { name: 'Proyectos', path: ROUTES.projects },
              { name: project.title, path: pathFor('projects', project.slug) },
            ]}
          />
          <h1 className="max-w-[16ch] text-[clamp(2.125rem,1.2rem+4.2vw,5rem)] leading-none tracking-[-0.03em]">
            {project.title}
          </h1>
          {meta.length > 0 && (
            <dl className="mt-1.5 flex flex-wrap gap-y-4 border-t border-white/28 pt-[18px]">
              {meta.map((m, i) => (
                <div
                  key={m.label}
                  className={
                    i === 0
                      ? 'flex flex-col-reverse gap-1.5 pr-8'
                      : 'flex flex-col-reverse gap-1.5 border-l border-white/20 px-8'
                  }
                >
                  <dd className="text-sm">{m.value}</dd>
                  <dt className="text-[0.656rem] tracking-[0.24em] text-white/60 uppercase">
                    {m.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="bg-paper py-[clamp(3.25rem,6vw,6.875rem)]">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-[clamp(1.875rem,4vw,5rem)]">
          <h2 className="max-w-[22ch] text-[clamp(1.5rem,1.1rem+1.8vw,2.75rem)] leading-[1.1] tracking-[-0.025em]">
            {project.introHeadline || project.summary}
          </h2>
          <div className="flex flex-col gap-5">
            <RichText data={project.description} />
            {chips.length > 0 && (
              <div className="flex flex-col gap-3 pt-3">
                <span className="text-eyebrow tracking-[0.2em] text-muted uppercase">
                  Productos utilizados
                </span>
                <Chips items={chips} />
              </div>
            )}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-paper pb-[clamp(3.25rem,6vw,6.875rem)]">
          <div className="container-site">
            <Gallery images={gallery} min="18.75rem" />
          </div>
        </section>
      )}

      {!!project.facts?.length && (
        <section className="on-dark bg-ink py-[clamp(3.25rem,6vw,6.875rem)] text-white">
          <div className="container-site flex flex-col gap-[clamp(1.75rem,3vw,3rem)]">
            <h2 className="text-h3">Qué llevó</h2>
            <Facts facts={project.facts} tone="ink" size="lg" />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="bg-paper py-[clamp(3.25rem,6vw,6.875rem)]">
          <div className="container-site flex flex-col gap-[26px]">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-h3">Otros proyectos</h2>
              <Link href={ROUTES.projects} className="link-underline">
                Ver todos <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ProjectGrid projects={others} ratio="landscape" min="16.25rem" />
          </div>
        </section>
      )}
    </>
  )
}
