import Image from 'next/image'

import type { Media } from '@/payload-types'
import { cn } from '@/lib/cn'
import { mediaSrc } from '@/lib/media'

type CmsImageProps = {
  media: Media | number | null | undefined
  /** `sizes` responsive para que el navegador descargue el ancho justo. */
  sizes: string
  className?: string
  /** Llena el contenedor (el padre debe tener position relative y alto). */
  fill?: boolean
  priority?: boolean
  alt?: string
}

/**
 * Imagen del CMS optimizada con next/image (AVIF/WebP, srcset, lazy loading)
 * respetando el punto focal elegido por el editor.
 */
export function CmsImage({ media, sizes, className, fill, priority, alt }: CmsImageProps) {
  if (!media || typeof media !== 'object' || !media.url) return null

  const objectPosition =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? `${media.focalX}% ${media.focalY}%`
      : undefined
  const isSvg = media.mimeType === 'image/svg+xml'
  const src = mediaSrc(media.url) ?? media.url

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt ?? media.alt ?? ''}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={isSvg}
        className={cn('object-cover', className)}
        style={objectPosition ? { objectPosition } : undefined}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt ?? media.alt ?? ''}
      width={media.width ?? 1200}
      height={media.height ?? 800}
      sizes={sizes}
      priority={priority}
      unoptimized={isSvg}
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
    />
  )
}
