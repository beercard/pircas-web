/**
 * Captura de UTM y origen de la visita. Se guarda en sessionStorage durante la
 * sesión (first-touch: la primera campaña de la sesión no se pisa) y se adjunta
 * a cada consulta o cotización.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const
export type UtmKey = (typeof UTM_KEYS)[number]

export type Attribution = Partial<Record<UtmKey, string>> & {
  landingPage?: string
  referrer?: string
}

const STORAGE_KEY = 'pircas_attribution'
const MAX_LEN = 200

export function parseUtm(search: string): Partial<Record<UtmKey, string>> {
  const params = new URLSearchParams(search)
  const out: Partial<Record<UtmKey, string>> = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim()
    if (value) out[key] = value.slice(0, MAX_LEN)
  }
  return out
}

/** Combina la atribución guardada con la de la URL actual (la guardada tiene prioridad). */
export function mergeAttribution(stored: Attribution | null, current: Attribution): Attribution {
  if (!stored) return current
  const hasStoredUtm = UTM_KEYS.some((k) => stored[k])
  const hasCurrentUtm = UTM_KEYS.some((k) => current[k])
  // Si la sesión no tenía campaña y ahora llega una, se adopta la nueva.
  if (!hasStoredUtm && hasCurrentUtm)
    return { ...stored, ...current, landingPage: stored.landingPage }
  return stored
}

function readStored(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return null
  }
}

export function captureAttribution(): Attribution {
  const current: Attribution = {
    ...parseUtm(window.location.search),
    landingPage: (window.location.pathname + window.location.search).slice(0, MAX_LEN),
    referrer: document.referrer ? document.referrer.slice(0, MAX_LEN) : undefined,
  }
  const merged = mergeAttribution(readStored(), current)
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // sessionStorage bloqueado (modo privado estricto): se usa solo la URL actual.
  }
  return merged
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  return readStored() ?? captureAttribution()
}
