/**
 * Las relaciones de Payload llegan como objeto (populadas) o como ID (no populadas
 * o sin acceso, ej: un producto en borrador). Estos helpers filtran de forma segura.
 */

export function isPopulated<T extends { id: number | string }>(
  value: T | number | string | null | undefined,
): value is T {
  return typeof value === 'object' && value !== null && 'id' in value
}

export function populatedList<T extends { id: number | string }>(
  values: (T | number | string)[] | null | undefined,
): T[] {
  return (values ?? []).filter(isPopulated)
}
