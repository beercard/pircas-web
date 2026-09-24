'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

export type GalleryImage = {
  url: string
  alt: string
  width: number
  height: number
  caption?: string | null
  focal?: string
}

/**
 * Galería en grilla (fotos 3:4) con visor a pantalla completa.
 * Visor accesible: foco atrapado, Escape para cerrar, flechas ← → para navegar.
 */
export function Gallery({
  images,
  className,
  ratio = '3/4',
  min = '15rem',
}: {
  images: GalleryImage[]
  className?: string
  ratio?: string
  min?: string
}) {
  const [index, setIndex] = useState<number | null>(null)
  const open = index !== null
  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, go])

  if (!images.length) return null
  const current = index !== null ? images[index] : null

  return (
    <>
      <ul
        className={cn('grid gap-2.5', className)}
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}), 1fr))` }}
      >
        {images.map((img, i) => (
          <li key={img.url + i}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden bg-stone"
              style={{ aspectRatio: ratio }}
              aria-label={`Ampliar imagen ${i + 1} de ${images.length}${img.alt ? `: ${img.alt}` : ''}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes={`(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw`}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                style={img.focal ? { objectPosition: img.focal } : undefined}
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink-deep/95 data-[state=open]:animate-[fade-in_200ms_ease-out]" />
          <Dialog.Content
            className="fixed inset-0 z-[90] flex flex-col text-white outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Galería de imágenes</Dialog.Title>
            <div className="flex h-16 shrink-0 items-center justify-between px-5 text-eyebrow tracking-[0.2em] uppercase">
              <span>
                {index !== null ? index + 1 : 0} / {images.length}
              </span>
              <Dialog.Close
                className="flex size-12 items-center justify-center text-2xl"
                aria-label="Cerrar galería"
              >
                ×
              </Dialog.Close>
            </div>
            {current && (
              <figure className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-6">
                <div className="relative flex-1">
                  <Image
                    src={current.url}
                    alt={current.alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
                {current.caption && (
                  <figcaption className="pt-4 text-center text-sm font-normal text-white/75">
                    {current.caption}
                  </figcaption>
                )}
              </figure>
            )}
            {images.length > 1 && (
              <div className="flex shrink-0 justify-center gap-3 pb-6">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="flex size-12 items-center justify-center border border-white/40 hover:border-white"
                  aria-label="Imagen anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="flex size-12 items-center justify-center border border-white/40 hover:border-white"
                  aria-label="Imagen siguiente"
                >
                  →
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
