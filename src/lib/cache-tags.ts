/** Etiquetas de caché compartidas entre los hooks del CMS y la capa de datos. */

export const CACHE_TAGS = {
  sitemap: 'sitemap',
  redirects: 'redirects',
  /** Todo el contenido: se usa cuando cambia algo transversal (ej: una imagen). */
  all: 'cms',
} as const

export const collectionTag = (slug: string): string => `collection:${slug}`
export const globalTag = (slug: string): string => `global:${slug}`
