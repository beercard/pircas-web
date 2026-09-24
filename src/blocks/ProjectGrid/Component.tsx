import { ProjectGrid } from '@/components/catalog/ProjectGrid'
import { CmsLink } from '@/components/cms/CmsLink'
import { Section, isDark } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ProjectGridBlock as ProjectGridBlockData } from '@/payload-types'
import { getProjects, type ProjectFilters } from '@/lib/data/projects'
import type { CmsLink as CmsLinkData } from '@/lib/links'

import { orderByIds, relId } from '../order'

export async function ProjectGridBlock({
  eyebrow,
  title,
  intro,
  source,
  projects,
  limit,
  cta,
  settings,
}: ProjectGridBlockData) {
  const filters: ProjectFilters = { limit: limit ?? 4 }
  const manualIds =
    source === 'manual'
      ? (projects ?? []).map(relId).filter((id): id is number => id !== undefined)
      : []
  if (source === 'featured') filters.featured = true
  if (source === 'latest') filters.sort = '-createdAt'
  if (source === 'manual') {
    if (!manualIds.length) return null
    filters.ids = manualIds
  }
  const docs = orderByIds(await getProjects(filters), manualIds)
  if (!docs.length) return null

  return (
    <Section settings={settings} defaultSpacing="none" className="pb-section">
      <div className="container-site flex flex-col gap-[clamp(2rem,4vw,3.25rem)] border-t border-line pt-[clamp(3.25rem,6vw,5.625rem)] in-[.on-dark]:border-white/14">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          action={
            cta?.label ? (
              <CmsLink
                link={{ ...(cta as CmsLinkData), appearance: 'link' }}
                dark={isDark(settings)}
                arrow
              />
            ) : undefined
          }
        />
        <ProjectGrid projects={docs} fit />
      </div>
    </Section>
  )
}
