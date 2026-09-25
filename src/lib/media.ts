import type { Media } from '@/payload-types'
import type { GalleryImage } from '@/components/ui/Gallery'

/**
 * Payload genera URLs absolutas (con serverURL). Para next/image se usan rutas
 * relativas del propio sitio (/api/media/file/…), así funcionan en cualquier dominio.
 */
export function mediaSrc(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/^https?:\/\/[^/]+(\/api\/media\/file\/.*)$/)
  return match ? match[1] : url
}

/** URL de descarga de un archivo del CMS (PDF, imagen) o null si no hay. */
export function fileUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' ? mediaSrc(media.url) : null
}

/**
 * Convierte fotos del CMS (galerías con varias fotos) en imágenes serializables para el
 * componente cliente. El epígrafe es el de cada foto (Fotos y archivos → Epígrafe).
 */
export function toGalleryImages(
  items: (Media | number | null | undefined)[] | null | undefined,
): GalleryImage[] {
  return (items ?? []).flatMap((m) => {
    const url = m && typeof m === 'object' ? mediaSrc(m.url) : null
    if (!m || typeof m !== 'object' || !url) return []
    return [
      {
        url,
        alt: m.alt ?? '',
        width: m.width ?? 1200,
        height: m.height ?? 900,
        caption: m.caption,
        focal:
          typeof m.focalX === 'number' && typeof m.focalY === 'number'
            ? `${m.focalX}% ${m.focalY}%`
            : undefined,
      },
    ]
  })
}
