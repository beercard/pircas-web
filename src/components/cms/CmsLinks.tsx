import { cn } from '@/lib/cn'
import type { CmsLink as CmsLinkData } from '@/lib/links'

import { CmsLink } from './CmsLink'

type LinkRow = { link: CmsLinkData; id?: string | null }

/**
 * Grupo de botones del CMS. `stretch` reproduce los CTAs del hero del diseño:
 * crecen para llenar la fila con la flecha al extremo (en mobile, uno por fila).
 */
export function CmsLinks({
  links,
  dark,
  brandBg,
  className,
  size = 'lg',
  stretch,
}: {
  links?: LinkRow[] | null
  dark?: boolean
  brandBg?: boolean
  className?: string
  size?: 'md' | 'lg'
  stretch?: boolean
}) {
  if (!links?.length) return null
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {links.map((row, i) => (
        <CmsLink
          key={row.id ?? i}
          link={row.link}
          dark={dark}
          brandBg={brandBg}
          size={size}
          stretch={stretch}
          arrow
        />
      ))}
    </div>
  )
}
