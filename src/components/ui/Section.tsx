import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type SectionSettings =
  | {
      hidden?: boolean | null
      background?: 'default' | 'muted' | 'dark' | 'brand' | null
      spacing?: 'none' | 'sm' | 'md' | 'lg' | null
      anchor?: string | null
      hideOn?: ('mobile' | 'tablet' | 'desktop')[] | null
    }
  | null
  | undefined

export const BACKGROUND_CLASSES: Record<string, string> = {
  default: 'bg-paper text-ink',
  muted: 'bg-stone text-ink',
  dark: 'on-dark bg-ink text-white',
  brand: 'on-dark bg-brand text-white',
}

const SPACING: Record<string, string> = {
  none: 'py-0',
  sm: 'py-section-sm',
  md: 'py-section',
  lg: 'py-[clamp(4.5rem,9vw,9.375rem)]',
}

const HIDE: Record<string, string> = {
  mobile: 'max-md:hidden',
  tablet: 'md:max-lg:hidden',
  desktop: 'lg:hidden',
}

export const isDark = (settings: SectionSettings) =>
  settings?.background === 'dark' || settings?.background === 'brand'

/** Envoltorio de todos los bloques: fondo, espaciado, ancla y visibilidad por dispositivo. */
export function Section({
  settings,
  children,
  className,
  defaultBackground = 'default',
  defaultSpacing = 'md',
  label,
}: {
  settings?: SectionSettings
  children: ReactNode
  className?: string
  defaultBackground?: 'default' | 'muted' | 'dark' | 'brand'
  defaultSpacing?: 'none' | 'sm' | 'md' | 'lg'
  /** Nombre accesible de la sección (si no tiene un título visible). */
  label?: string
}) {
  if (settings?.hidden) return null
  const bg =
    settings?.background && settings.background !== 'default'
      ? settings.background
      : defaultBackground
  return (
    <section
      id={settings?.anchor || undefined}
      aria-label={label}
      className={cn(
        'relative',
        BACKGROUND_CLASSES[bg],
        SPACING[settings?.spacing ?? defaultSpacing],
        settings?.hideOn?.map((d) => HIDE[d]),
        className,
      )}
    >
      {children}
    </section>
  )
}
