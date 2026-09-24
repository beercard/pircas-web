import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import { CACHE_TAGS } from '@/lib/cache-tags'

export const getPayloadClient = (): Promise<Payload> => getPayload({ config: configPromise })

/** ¿Está activo el modo borrador (vista previa de un editor)? */
export const isDraftMode = cache(async (): Promise<boolean> => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false // fuera de un request (build, scripts)
  }
})

export type QueryContext = { payload: Payload; draft: boolean }

/**
 * Ejecuta una consulta al CMS con caché de datos de Next etiquetada.
 * - En modo borrador no se cachea (el editor ve los cambios al instante).
 * - Los hooks `afterChange` del CMS invalidan las etiquetas → el sitio se actualiza sin redeploy.
 */
export async function cachedQuery<T>(
  key: string[],
  tags: string[],
  fn: (ctx: QueryContext) => Promise<T>,
): Promise<T> {
  const draft = await isDraftMode()
  if (draft) return fn({ payload: await getPayloadClient(), draft: true })

  return unstable_cache(async () => fn({ payload: await getPayloadClient(), draft: false }), key, {
    tags: [...tags, CACHE_TAGS.all],
  })()
}

/**
 * Opciones de lectura según el modo:
 * - Público: aplica las reglas de acceso (solo publicado).
 * - Borrador: lee la última versión, incluidos borradores.
 */
export const readOptions = (draft: boolean) =>
  draft
    ? ({ draft: true, overrideAccess: true } as const)
    : ({ draft: false, overrideAccess: false } as const)
