'use client'

/* eslint-disable @next/next/no-img-element -- miniatura del panel (no usa next/image) */

import { useConfig, useListRelationships } from '@payloadcms/ui'
import Link from 'next/link'
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
 * La miniatura es un enlace al documento: sin esto, al ir primera en el listado, la fila
 * quedaba sin ningún enlace para entrar a editar.
 */
type RowProps = {
  collectionSlug?: string
  linkURL?: string
  rowData?: { id?: number | string }
}

/** Dirección de edición del documento de la fila. */
function useRowHref({ collectionSlug, linkURL, rowData }: RowProps): string | null {
  const { config } = useConfig()
  if (linkURL) return linkURL
  if (!collectionSlug || rowData?.id === undefined) return null
  return `${config.routes.admin}/collections/${collectionSlug}/${encodeURIComponent(rowData.id)}`
}

/** Nombre del documento como enlace para entrar a editarlo (columna del listado). */
export function TitleCell({ cellData, ...row }: RowProps & { cellData?: string | null }) {
  const href = useRowHref(row)
  const text = cellData || 'Sin nombre'
  if (!href) return <span>{text}</span>
  return (
    <Link href={href} prefetch={false} className="pircas-title-link">
      {text}
    </Link>
  )
}

export function ThumbnailCell({
  cellData,
  ...row
}: RowProps & { cellData?: MediaLike | number | string | null }) {
  const href = useRowHref(row)
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

  const thumb = src ? (
    <img className="pircas-thumb" src={src} alt="" width={56} height={42} loading="lazy" />
  ) : (
    <span className="pircas-thumb pircas-thumb--empty" aria-hidden="true" />
  )
  if (!href) return thumb
  return (
    <Link href={href} prefetch={false} aria-label="Editar" title="Editar">
      {thumb}
    </Link>
  )
}
