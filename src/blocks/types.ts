import type { Crumb } from '@/lib/seo/jsonld'

/** Contexto que la página pasa a sus bloques. */
export type BlockContext = {
  /** Es la primera sección de la página (el hero usa <h1> y carga la imagen con prioridad). */
  isFirst?: boolean
  /** Migas de pan de la página actual (sin "Inicio"). */
  breadcrumbs?: Crumb[]
}
