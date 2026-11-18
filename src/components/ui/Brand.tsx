import { cn } from '@/lib/cn'

import {
  ISO_BODY,
  ISO_LEAF,
  ISO_VIEWBOX,
  WORD_NAME,
  WORD_TAGLINE,
  WORD_VIEWBOX,
} from './brand-paths'

/**
 * Forma decorativa de marca: el isotipo de la identidad (la "P" que también es una puerta).
 * Por defecto es una silueta de un solo color (toma el color del texto). Con `brand` va en
 * los colores de la marca: cuerpo en el color del texto (naranja) y hoja gris.
 * Siempre decorativa: aria-hidden y sin eventos de puntero.
 */
export function DoorShape({
  className,
  brand,
  mirrored,
}: {
  className?: string
  brand?: boolean
  mirrored?: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={ISO_VIEWBOX}
      className={cn(
        'pointer-events-none absolute aspect-[67/89]',
        mirrored && '-scale-x-100',
        className,
      )}
    >
      {brand ? (
        <>
          <path d={ISO_BODY} fill="currentColor" />
          <path d={ISO_LEAF} fill="#6d6e71" />
        </>
      ) : (
        // Un solo trazo: la superposición de cuerpo y hoja no se oscurece con colores translúcidos.
        <path d={`${ISO_BODY} ${ISO_LEAF}`} fill="currentColor" />
      )}
    </svg>
  )
}

/**
 * Isotipo de la marca (la P-puerta de la identidad). Por defecto va en sus colores
 * (naranja + hoja gris; blanco sobre fondos oscuros, ver `.brand-logo` en globals.css).
 * Con `mono` toma el color del texto (marcadores, estados vacíos).
 */
export function DoorMark({ className, mono }: { className?: string; mono?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={ISO_VIEWBOX}
      className={cn('h-[30px] w-[22px] shrink-0', !mono && 'brand-logo', className)}
    >
      <path
        d={ISO_BODY}
        fill={mono ? 'currentColor' : 'var(--brand-body)'}
        fillOpacity={mono ? 0.62 : 'var(--brand-body-opacity)'}
      />
      <path d={ISO_LEAF} fill={mono ? 'currentColor' : 'var(--brand-leaf)'} />
    </svg>
  )
}

/**
 * Logotipo PIRCAS / ABERTURAS de la identidad (isotipo + logotipo vectorial).
 * `tone="light"` lo pasa a blanco para fondos oscuros que no usan `.on-dark`.
 * Si el nombre del negocio se cambia en el panel, se escribe con la tipografía del sitio.
 */
export function BrandLogo({
  className,
  brandName = 'PIRCAS',
  tagline = 'ABERTURAS',
  tone,
  size,
}: {
  className?: string
  brandName?: string
  tagline?: string
  tone?: 'light'
  /** `lg`: versión más grande (encabezado del sitio). */
  size?: 'lg'
}) {
  const official = brandName.toUpperCase() === 'PIRCAS' && tagline.toUpperCase() === 'ABERTURAS'
  return (
    <span className={cn('brand-logo flex items-center gap-3', className)} data-tone={tone}>
      <DoorMark className={size === 'lg' ? 'h-11 w-[33px]' : 'h-9 w-[27px]'} />
      {official ? (
        <svg
          role="img"
          aria-label={`${brandName} ${tagline}`}
          viewBox={WORD_VIEWBOX}
          className={cn('w-auto shrink-0', size === 'lg' ? 'h-7' : 'h-[23px]')}
        >
          <path d={WORD_NAME} fill="var(--brand-name)" />
          <path d={WORD_TAGLINE} fill="var(--brand-tagline)" />
        </svg>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="text-[1.0625rem] font-semibold tracking-[0.22em]">{brandName}</span>
          <span className="mt-1 text-[0.53rem] tracking-[0.32em] opacity-85">{tagline}</span>
        </span>
      )}
    </span>
  )
}
