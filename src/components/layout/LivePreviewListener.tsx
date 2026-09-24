'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** Refresca la página cuando el editor guarda en el panel (live preview). */
export function LivePreviewListener() {
  const router = useRouter()
  const serverURL =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ''
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
