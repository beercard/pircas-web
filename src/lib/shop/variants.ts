/**
 * Medidas y opciones de un producto del presupuesto (módulo puro: navegador, servidor y tests).
 *
 * Cada fila es una combinación con precio propio: medida + color (si el precio cambia por
 * color) + opción (ej. "Reja 3/8"). El navegador recibe las filas SIN precio, solo para
 * saber qué combinaciones existen.
 */

export type VariantKey = {
  measure: string
  /** null = el precio no depende del color. */
  color: string | null
  /** null = sin opciones. */
  option: string | null
}

export type VariantRow = VariantKey & { price: number }

export type ChoiceGroup = { label: string; values: string[] }

const unique = <T>(list: T[]) => [...new Set(list)]

/** Medidas disponibles, en el orden en que se cargaron. */
export const measuresOf = (rows: readonly VariantKey[]) => unique(rows.map((r) => r.measure))

/** Colores con precio propio para una medida (vacío = el color no cambia el precio). */
export const colorsFor = (rows: readonly VariantKey[], measure: string) =>
  unique(rows.filter((r) => r.measure === measure && r.color).map((r) => r.color as string))

/** Opciones disponibles para una medida y color. */
export const optionsFor = (rows: readonly VariantKey[], measure: string, color: string | null) =>
  unique(
    rows
      .filter((r) => r.measure === measure && (!r.color || r.color === color) && r.option)
      .map((r) => r.option as string),
  )

/**
 * Lleva una selección a una combinación que existe: conserva lo elegido cuando es válido y,
 * si no, toma la primera alternativa. Devuelve null si la medida no existe.
 */
export function resolveVariant<T extends VariantKey>(
  rows: readonly T[],
  wanted: { measure?: string | null; color?: string | null; option?: string | null },
): T | null {
  const measure = rows.find((r) => r.measure === wanted.measure)?.measure
  if (!measure) return null
  const colors = colorsFor(rows, measure)
  const color = colors.length
    ? (colors.find((c) => c === wanted.color) ?? colors[0])
    : (wanted.color ?? null)
  const options = optionsFor(rows, measure, color)
  const option = options.length ? (options.find((o) => o === wanted.option) ?? options[0]) : null
  return (
    rows.find(
      (r) =>
        r.measure === measure && (!r.color || r.color === color) && (r.option ?? null) === option,
    ) ?? null
  )
}

/** Una elección válida por grupo (la pedida, o la primera). */
export const resolveChoices = (
  groups: readonly ChoiceGroup[],
  wanted: readonly string[] | null | undefined,
) => groups.map((g, i) => (wanted?.[i] && g.values.includes(wanted[i]) ? wanted[i] : g.values[0]))
