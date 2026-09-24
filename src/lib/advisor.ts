/**
 * Motor de recomendación del asesor virtual.
 *
 * Todo se configura en el CMS (Configuración → Asesor virtual): cada respuesta suma
 * puntos a una o más líneas; gana la línea con más puntos. Empates: primero la "línea
 * en caso de empate" configurada, después el orden de las líneas en el catálogo.
 * Es una función pura (sin React ni Payload) para poder testearla.
 */

export type AdvisorAnswer = {
  key: string
  label: string
  icon?: string | null
  weights: { lineId: number; points: number }[]
}

export type AdvisorQuestion = { key: string; question: string; answers: AdvisorAnswer[] }

export type AdvisorLine = {
  id: number
  name: string
  slug: string
  headline: string
  text: string
}

export type AdvisorConfig = {
  questions: AdvisorQuestion[]
  lines: AdvisorLine[] // en el orden del catálogo
  fallbackLineId?: number | null
}

export type Recommendation = {
  line: AdvisorLine
  scores: Record<number, number>
  /** Resto de líneas ordenadas de mayor a menor puntaje. */
  alternatives: AdvisorLine[]
}

/** Respuestas elegidas: clave de pregunta → clave de respuesta. */
export type AdvisorSelection = Record<string, string>

export function scoreLines(
  config: AdvisorConfig,
  selection: AdvisorSelection,
): Record<number, number> {
  const scores: Record<number, number> = Object.fromEntries(config.lines.map((l) => [l.id, 0]))
  for (const q of config.questions) {
    const answer = q.answers.find((a) => a.key === selection[q.key])
    if (!answer) continue
    for (const w of answer.weights) {
      if (w.lineId in scores) scores[w.lineId] += Math.max(0, w.points)
    }
  }
  return scores
}

export function recommend(
  config: AdvisorConfig,
  selection: AdvisorSelection,
): Recommendation | null {
  if (!config.lines.length) return null
  const scores = scoreLines(config, selection)
  const orderIndex = new Map(config.lines.map((l, i) => [l.id, i]))
  const ranked = [...config.lines].sort((a, b) => {
    const diff = scores[b.id] - scores[a.id]
    if (diff !== 0) return diff
    if (a.id === config.fallbackLineId) return -1
    if (b.id === config.fallbackLineId) return 1
    return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0)
  })
  const [line, ...alternatives] = ranked
  return { line, scores, alternatives }
}

/** ¿Ya se respondieron todas las preguntas? */
export const isComplete = (config: AdvisorConfig, selection: AdvisorSelection) =>
  config.questions.every((q) => Boolean(selection[q.key]))
