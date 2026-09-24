import Link from 'next/link'

import { CmsImage } from '@/components/ui/CmsImage'
import type { Project } from '@/payload-types'
import { cn } from '@/lib/cn'
import { isPopulated, populatedList } from '@/lib/data/populated'
import { pathFor } from '@/lib/routes'

/** Etiqueta corta del proyecto: línea principal o primera categoría. */
export function projectLabel(project: Project): string | null {
  if (isPopulated(project.line)) return project.line.name
  return populatedList(project.category)[0]?.name ?? null
}

/** Tarjeta de proyecto: foto vertical + nombre, categoría · lugar y flecha terracota. */
export function ProjectCard({
  project,
  priority,
  ratio = 'portrait',
  showPlace = false,
}: {
  project: Project
  priority?: boolean
  ratio?: 'portrait' | 'landscape'
  showPlace?: boolean
}) {
  const label = projectLabel(project)
  const meta = [label, showPlace ? project.location : null].filter(Boolean).join(' · ')
  return (
    <Link
      href={pathFor('projects', project.slug)}
      className="block transition-transform duration-350 hover:-translate-y-1 hover:text-ink"
    >
      <span
        className={cn(
          'relative block overflow-hidden bg-stone',
          ratio === 'portrait' ? 'aspect-[4/5]' : 'aspect-[4/3]',
        )}
      >
        <CmsImage
          media={project.coverImage}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 340px, (min-width: 640px) 45vw, 100vw"
        />
      </span>
      <span className="flex items-center justify-between gap-3 border-b border-line pt-3.5 pb-2.5">
        <span className="flex flex-col gap-1">
          <h3 className="text-[0.9375rem] tracking-[-0.01em]">{project.title}</h3>
          {meta && (
            <span className="text-[0.656rem] tracking-[0.2em] text-muted uppercase">{meta}</span>
          )}
        </span>
        <span aria-hidden="true" className="text-lg text-brand">
          →
        </span>
      </span>
    </Link>
  )
}
