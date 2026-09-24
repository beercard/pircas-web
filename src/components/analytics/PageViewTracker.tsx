'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { track } from '@/lib/analytics/track'
import { captureAttribution } from '@/lib/utm'

function Tracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    // Guarda UTM / página de llegada durante la sesión.
    captureAttribution()
  }, [])

  useEffect(() => {
    const path = pathname + (search ? `?${search}` : '')
    track('page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, search])

  return null
}

/** Registra page_view en cada navegación (también las del lado del cliente) y captura UTM. */
export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  )
}
