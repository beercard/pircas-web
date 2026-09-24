'use client'

import { Button, useListQuery } from '@payloadcms/ui'

/** Serializa un objeto anidado a query string con notación de corchetes (formato `qs`). */
function toQueryString(value: unknown, prefix: string, out: string[] = []): string[] {
  if (value === null || value === undefined) return out
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      toQueryString(v, `${prefix}[${k}]`, out)
    }
  } else {
    out.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`)
  }
  return out
}

/** Botón en la lista de Consultas: descarga CSV respetando los filtros aplicados. */
export function ExportLeadsButton() {
  const { query } = useListQuery()
  const params = query?.where ? toQueryString(query.where, 'where').join('&') : ''
  const href = `/api/leads/export${params ? `?${params}` : ''}`

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      <Button el="anchor" url={href} buttonStyle="secondary" size="small" newTab={false}>
        Exportar CSV
      </Button>
    </div>
  )
}
