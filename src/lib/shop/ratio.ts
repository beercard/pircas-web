/** Proporciones ancho ÷ alto: medida elegida vs. fotos del producto (módulo puro). */

/** "1,20 × 1,10 m" → 1.09. Devuelve null si el texto no tiene dos medidas. */
export function measureRatio(measure: string | null | undefined): number | null {
  const m = measure?.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i)
  if (!m) return null
  const width = Number(m[1].replace(',', '.'))
  const height = Number(m[2].replace(',', '.'))
  return width > 0 && height > 0 ? width / height : null
}

/** Índice de la proporción más parecida a la buscada (comparación relativa). */
export function closestRatio(ratios: (number | null | undefined)[], wanted: number): number {
  let best = -1
  let bestDiff = Infinity
  ratios.forEach((r, i) => {
    if (!r) return
    const diff = Math.abs(Math.log(r / wanted))
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}
