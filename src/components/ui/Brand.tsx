import { cn } from '@/lib/cn'

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

/** Pequeña P-puerta usada como isotipo y como marcador en tarjetas. */
export function DoorMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 22 30"
      className={cn('h-[30px] w-[22px] shrink-0', className)}
    >
      <path d="M0 0 H13 A9 9 0 0 1 13 18 H7 V30 H0 Z" fill="currentColor" />
    </svg>
  )
}

/** Logotipo PIRCAS / ABERTURAS (isotipo + wordmark). Hereda el color de texto. */
export function BrandLogo({
  className,
  brandName = 'PIRCAS',
  tagline = 'ABERTURAS',
}: {
  className?: string
  brandName?: string
  tagline?: string
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <DoorMark className="text-brand" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.0625rem] font-semibold tracking-[0.22em]">{brandName}</span>
        <span className="mt-1 text-[0.53rem] tracking-[0.32em] opacity-85">{tagline}</span>
      </span>
    </span>
  )
}
