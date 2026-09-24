'use client'

import { useEffect } from 'react'

import { track, type AnalyticsEventName, type AnalyticsParams } from '@/lib/analytics/track'

/** Dispara un evento de vista (product_view, project_view) una vez al montar. */
export function TrackView({
  event,
  params,
}: {
  event: AnalyticsEventName
  params: AnalyticsParams
}) {
  const key = JSON.stringify(params)
  useEffect(() => {
    track(event, JSON.parse(key) as AnalyticsParams)
  }, [event, key])
  return null
}
