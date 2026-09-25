'use client'

/* eslint-disable @next/next/no-img-element -- miniatura del panel (no usa next/image) */

import { useListRelationships } from '@payloadcms/ui'
import { useEffect } from 'react'

type MediaLike = {
  url?: string | null
  thumbnailURL?: string | null
  sizes?: { thumbnail?: { url?: string | null } | null } | null
}

/**
 * Miniatura de la foto en los listados del panel (como en Shopify / Tiendanube).
 * El listado trae solo el id de la foto: se carga con el mismo cargador por lotes que usa
 * Payload en sus columnas de relaciones (una sola consulta para toda la página).
 */
export function ThumbnailCell({ cellData }: { cellData?: MediaLike | number | string | null }) {
  const { documents, getRelationships } = useListRelationships()
  const id = typeof cellData === 'number' || typeof cellData === 'string' ? cellData : null

  useEffect(() => {
    if (id !== null) getRelationships([{ relationTo: 'media', value: id }])
  }, [id, getRelationships])

  const loaded = id !== null ? documents?.media?.[id] : null
  const media = (
    cellData && typeof cellData === 'object' ? cellData : loaded || null
  ) as MediaLike | null
  const src = media?.sizes?.thumbnail?.url || media?.thumbnailURL || media?.url

  if (!src) return <span className="pircas-thumb pircas-thumb--empty" aria-hidden="true" />
  return <img className="pircas-thumb" src={src} alt="" width={56} height={42} loading="lazy" />
}
