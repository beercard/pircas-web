/**
 * Convierte un texto en un slug apto para URL, manejando acentos y ñ del español.
 *   "Herrero Económica"      → "herrero-economica"
 *   "Mampara  Angular 90°"   → "mampara-angular-90"
 *   "Año 2024 / Coronda"     → "ano-2024-coronda"
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // quita tildes y diéresis
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const isValidSlug = (value: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
