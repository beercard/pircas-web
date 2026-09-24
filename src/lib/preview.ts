import { pathFor, type RoutableCollection } from './routes'

/**
 * URL de vista previa (modo borrador) para un documento del CMS.
 * La ruta /next/preview valida el secreto y la sesión del editor antes de
 * activar el draft mode y redirigir a la página.
 */
export function previewPathFor(
  collection: RoutableCollection | 'home',
  slug?: string | null,
): string | null {
  let path: string
  if (collection === 'home') path = '/'
  else {
    if (!slug) return null
    path = pathFor(collection, slug)
  }
  const params = new URLSearchParams({ path, previewSecret: process.env.PREVIEW_SECRET || '' })
  return `/next/preview?${params.toString()}`
}
