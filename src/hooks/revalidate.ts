import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { revalidateTag } from 'next/cache'

import { collectionTag, globalTag, CACHE_TAGS } from '@/lib/cache-tags'

/**
 * Invalida el caché de Next para las etiquetas dadas.
 *
 * Los hooks también se ejecutan fuera de Next (seed, migraciones, `payload run`),
 * donde `revalidateTag` lanza un error: en ese caso se ignora sin romper la operación.
 */
export function revalidate(tags: string[], req?: PayloadRequest): void {
  if (req?.context?.disableRevalidate) return
  for (const tag of tags) {
    try {
      // `expire: 0` expira de inmediato: el editor ve el cambio en la siguiente visita.
      revalidateTag(tag, { expire: 0 })
    } catch (_err) {
      // Fuera del runtime de Next.js: no hay caché que invalidar.
    }
  }
  req?.payload.logger.debug({ tags }, 'cache revalidated')
}

/**
 * Hooks de revalidación para una colección. Además de su propia etiqueta,
 * invalida las colecciones que la muestran (ej: un producto aparece en líneas y proyectos).
 */
export function revalidateCollectionHooks(
  slug: string,
  dependents: string[] = [],
): {
  afterChange: CollectionAfterChangeHook[]
  afterDelete: CollectionAfterDeleteHook[]
} {
  const tags = [collectionTag(slug), ...dependents.map(collectionTag), CACHE_TAGS.sitemap]
  return {
    afterChange: [
      ({ doc, req }) => {
        revalidate(tags, req)
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        revalidate(tags, req)
        return doc
      },
    ],
  }
}

export const revalidateGlobalHook =
  (slug: string, extraTags: string[] = []): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    revalidate([globalTag(slug), ...extraTags], req)
    return doc
  }
