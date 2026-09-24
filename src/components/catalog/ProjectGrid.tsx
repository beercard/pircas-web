import { ProjectCard } from '@/components/cards/ProjectCard'
import type { Project } from '@/payload-types'

export function ProjectGrid({
  projects,
  priorityCount = 0,
  showPlace,
  ratio = 'portrait',
  min = '15rem',
  fit = false,
}: {
  projects: Project[]
  priorityCount?: number
  showPlace?: boolean
  ratio?: 'portrait' | 'landscape'
  min?: string
  /** auto-fit: pocas tarjetas llenan la fila (bloques); auto-fill: grilla fija (listados). */
  fit?: boolean
}) {
  return (
    <ul
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${fit ? 'auto-fit' : 'auto-fill'}, minmax(min(100%, ${min}), 1fr))`,
      }}
    >
      {projects.map((p, i) => (
        <li key={p.id}>
          <ProjectCard
            project={p}
            priority={i < priorityCount}
            showPlace={showPlace}
            ratio={ratio}
          />
        </li>
      ))}
    </ul>
  )
}
