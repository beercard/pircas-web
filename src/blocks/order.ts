/** Ordena documentos según el orden elegido a mano por el editor (si eligió alguno). */
export function orderByIds<T extends { id: number }>(docs: T[], ids: number[]): T[] {
  if (!ids.length) return docs
  return ids.map((id) => docs.find((d) => d.id === id)).filter((d): d is T => d !== undefined)
}

export const relId = (v: unknown): number | undefined =>
  typeof v === 'number'
    ? v
    : v && typeof v === 'object' && 'id' in v
      ? Number((v as { id: number }).id)
      : undefined
