/** Trazo de la "P-puerta" de la marca (mismo que el sitio). */
const DOOR_MARK = 'M0 0 H13 A9 9 0 0 1 13 18 H7 V30 H0 Z'

/** Isotipo: la P que también es una puerta, en terracota. */
export function PircasMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 22 30"
      width={(size * 22) / 30}
      height={size}
      aria-hidden="true"
      className={className}
    >
      <path d={DOOR_MARK} fill="#B8502C" />
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
