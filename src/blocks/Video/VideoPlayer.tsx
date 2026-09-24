'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Video "liviano": muestra la portada y recién al hacer clic carga el iframe
 * (YouTube sin cookies / Vimeo). Evita cargar cientos de KB de JS de terceros.
 */
export function VideoPlayer({
  embedUrl,
  title,
  poster,
  aspect,
}: {
  embedUrl: string
  title: string
  poster: string | null
  aspect: string
}) {
  const [playing, setPlaying] = useState(false)
  return (
    <div
      className="relative mx-auto w-full overflow-hidden bg-ink"
      style={{ aspectRatio: aspect, maxWidth: aspect === '9/16' ? '24rem' : undefined }}
    >
      {playing ? (
        <iframe
          src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label={`Reproducir video: ${title}`}
        >
          {poster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover opacity-80"
            />
          )}
          <span className="relative flex h-16 items-center gap-3.5 rounded-door bg-brand px-7 text-label tracking-[0.18em] text-white uppercase group-hover:bg-white group-hover:text-ink">
            <span aria-hidden="true">▶</span> Ver video
          </span>
        </button>
      )}
    </div>
  )
}
