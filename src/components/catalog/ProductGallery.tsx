'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { GalleryImage } from '@/components/ui/Gallery'
import { cn } from '@/lib/cn'

/** Galería del producto: imagen principal 4:3 + miniaturas cuadradas (hasta 4 por fila). */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]
  if (!current) return <div className="aspect-[4/3] bg-stone" />
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          style={current.focal ? { objectPosition: current.focal } : undefined}
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-2.5">
          {images.map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Ver imagen ${i + 1}${img.alt ? `: ${img.alt}` : ''}`}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden border bg-stone',
                  i === active ? 'border-ink' : 'border-ink/12 hover:border-ink/50',
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 12vw, 25vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
