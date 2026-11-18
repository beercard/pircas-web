import type { SiteSetting } from '@/payload-types'

export type SiteLocation = {
  key: string
  street: string
  /** "Coronda, Santa Fe" */
  cityLine: string
  city: string | null
  /** Enlace de "Cómo llegar": el cargado en el panel o la ruta de Google Maps a la dirección. */
  directionsUrl: string
}

const directions = (parts: (string | null | undefined)[]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    [...parts, 'Argentina'].filter(Boolean).join(', '),
  )}`

/** Local principal + otros locales cargados en "Datos del negocio". */
export function siteLocations(site: Pick<SiteSetting, 'address' | 'branches'>): SiteLocation[] {
  const out: SiteLocation[] = []
  const a = site.address
  if (a?.street)
    out.push({
      key: 'principal',
      street: a.street,
      city: a.city ?? null,
      cityLine: [a.city, a.region].filter(Boolean).join(', '),
      directionsUrl: a.mapsUrl || directions([a.street, a.city, a.region]),
    })
  for (const b of site.branches ?? []) {
    if (!b.street) continue
    out.push({
      key: b.id ?? b.street,
      street: b.street,
      city: b.city ?? null,
      cityLine: [b.city, b.region].filter(Boolean).join(', '),
      directionsUrl: b.mapsUrl || directions([b.street, b.city, b.region]),
    })
  }
  return out
}
