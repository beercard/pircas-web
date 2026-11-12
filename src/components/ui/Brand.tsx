import { cn } from '@/lib/cn'

import {
  ISO_BODY,
  ISO_LEAF,
  ISO_VIEWBOX,
  WORD_NAME,
  WORD_TAGLINE,
  WORD_VIEWBOX,
} from './brand-paths'

/** Trazo de la "P-puerta" de la marca, en unidades de 480×680. */
const DOOR_PATH = 'M0 0 H280 A200 200 0 0 1 280 400 H160 V680 H0 Z'
/** Misma forma con el vano interior calado (hero de la home). */
const DOOR_PATH_HOLLOW = `${DOOR_PATH} M160 130 H270 A70 70 0 0 1 270 270 H160 Z`

/**
 * Forma decorativa de marca (la "P" que también es una puerta).
 * Siempre decorativa: aria-hidden y sin eventos de puntero.
 */
export function DoorShape({
  className,
  hollow,
  mirrored,
}: {
  className?: string
  hollow?: boolean
  mirrored?: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 480 680"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute aspect-[480/680]',
        mirrored && '-scale-x-100',
        className,
      )}
    >
      <path d={hollow ? DOOR_PATH_HOLLOW : DOOR_PATH} fill="currentColor" fillRule="evenodd" />
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
}: {
  className?: string
  brandName?: string
  tagline?: string
  tone?: 'light'
}) {
  const official = brandName.toUpperCase() === 'PIRCAS' && tagline.toUpperCase() === 'ABERTURAS'
  return (
    <span className={cn('brand-logo flex items-center gap-3', className)} data-tone={tone}>
      <DoorMark className="h-9 w-[27px]" />
      {official ? (
        <svg
          role="img"
          aria-label={`${brandName} ${tagline}`}
          viewBox={WORD_VIEWBOX}
          className="h-[23px] w-auto shrink-0"
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
