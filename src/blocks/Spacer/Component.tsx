import type { CSSProperties } from 'react'

import type { SpacerBlock as SpacerBlockData } from '@/payload-types'

/** Espacio vertical con alto independiente por dispositivo. */
export function SpacerBlock({ desktop, tablet, mobile, divider }: SpacerBlockData) {
  const style = {
    '--h-m': `${mobile ?? 24}px`,
    '--h-t': `${tablet ?? 48}px`,
    '--h-d': `${desktop ?? 48}px`,
  } as CSSProperties
  return (
    <div
      aria-hidden="true"
      style={style}
      className="container-site flex h-(--h-m) items-center md:h-(--h-t) lg:h-(--h-d)"
    >
      {divider && <span className="h-px w-full bg-line" />}
    </div>
  )
}
