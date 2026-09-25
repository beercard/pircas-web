'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Primer texto útil de una sección para reconocerla en la lista ("Hero · Aberturas de…"). */
function pickLabel(data: Record<string, unknown> | undefined): string {
  for (const key of ['title', 'eyebrow', 'text', 'intro', 'body']) {
    const value = data?.[key]
    if (typeof value === 'string' && value.trim()) {
      const clean = value.replace(/\s+/g, ' ').trim()
      return clean.length > 70 ? `${clean.slice(0, 70)}…` : clean
    }
  }
  return ''
}

/** Etiqueta de cada sección en el editor de páginas (en lugar de "Sin título"). */
export function BlockLabel() {
  const { data } = useRowLabel<Record<string, unknown>>()
  const label = pickLabel(data)
  const hidden = (data?.settings as { hidden?: boolean } | undefined)?.hidden
  return (
    <span className="pircas-block-label">
      {label || <span className="pircas-block-label__empty">Sin texto</span>}
      {hidden && <span className="pircas-block-label__hidden">Oculta</span>}
    </span>
  )
}
