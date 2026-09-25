/** Formatos del panel, siempre en español y en hora de Argentina. */

export const TIME_ZONE = 'America/Argentina/Buenos_Aires'

/** "hace 5 min", "hace 3 h", "ayer", "hace 4 días" o la fecha. */
export function timeAgo(value: string | Date, now = new Date()): string {
  const date = new Date(value)
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000)
  if (minutes < 1) return 'recién'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: TIME_ZONE })
}

/** Clave de día (AAAA-MM-DD) en hora de Argentina. */
export const dayKey = (value: string | Date) =>
  new Date(value).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })

/** "viernes 25 de septiembre" */
export const longDate = (value: Date) =>
  value.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TIME_ZONE,
  })

/** Saludo según la hora en Argentina. */
export function greeting(now = new Date()): string {
  const hour = Number(
    now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: TIME_ZONE }),
  )
  if (hour < 6 || hour >= 20) return 'Buenas noches'
  if (hour < 13) return 'Buen día'
  return 'Buenas tardes'
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
