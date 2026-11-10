/** Opciones del presupuesto online compartidas por el panel, el servidor y el sitio. */

export const QUOTE_STATUSES = [
  { value: 'pending', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'won', label: 'Vendido' },
  { value: 'lost', label: 'No avanzó' },
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]['value']

export const COLORS = [
  { value: 'blanco', label: 'Blanco', hex: '#ffffff' },
  { value: 'negro', label: 'Negro', hex: '#1d1d1f' },
] as const

export type ColorValue = (typeof COLORS)[number]['value']

/** Accesorios opcionales de las ventanas (cada producto define cuáles ofrece y su precio). */
export const ACCESSORIES = [
  { value: 'celosia', label: 'Celosía' },
  { value: 'mosquitero', label: 'Mosquitero' },
  { value: 'reja', label: 'Reja' },
] as const

export type AccessoryValue = (typeof ACCESSORIES)[number]['value']

const labelOf = <T extends readonly { value: string; label: string }[]>(list: T, value: unknown) =>
  list.find((o) => o.value === value)?.label ?? String(value ?? '')

export const quoteStatusLabel = (v: unknown) => labelOf(QUOTE_STATUSES, v)
export const colorLabel = (v: unknown) => labelOf(COLORS, v)
export const accessoryLabel = (v: unknown) => labelOf(ACCESSORIES, v)

/** "Blanco · Con mosquitero y reja" */
export function variantText(
  color: string | null | undefined,
  accessories: readonly string[] | null | undefined,
  measure?: string | null,
): string {
  const acc = (accessories ?? []).map((a) => accessoryLabel(a).toLowerCase())
  const withAcc = acc.length
    ? `Con ${acc.length > 1 ? `${acc.slice(0, -1).join(', ')} y ${acc.at(-1)}` : acc[0]}`
    : null
  return [color ? colorLabel(color) : null, measure || null, withAcc].filter(Boolean).join(' · ')
}
