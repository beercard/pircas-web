import { ISO_BODY, ISO_LEAF, ISO_VIEWBOX } from '@/components/ui/brand-paths'

/** Isotipo de la identidad: la P-puerta, naranja con la hoja gris. */
export function PircasMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox={ISO_VIEWBOX}
      width={(size * 3) / 4}
      height={size}
      aria-hidden="true"
      className={className}
    >
      <path d={ISO_BODY} fill="#C46128" />
      <path d={ISO_LEAF} fill="#8a8c8e" />
    </svg>
  )
}

/** Logotipo PIRCAS / ABERTURAS para el panel. `tone="light"` para fondos oscuros. */
export function PircasWordmark({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={`pircas-wordmark pircas-wordmark--${tone}`}>
      <PircasMark className="pircas-wordmark__mark" />
      <span className="pircas-wordmark__text">
        <span className="pircas-wordmark__name">PIRCAS</span>
        <span className="pircas-wordmark__tagline">ABERTURAS</span>
      </span>
    </span>
  )
}
