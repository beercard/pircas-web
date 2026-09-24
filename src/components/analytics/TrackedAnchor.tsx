'use client'

import type { ComponentProps } from 'react'

import { track, type AnalyticsEventName, type AnalyticsParams } from '@/lib/analytics/track'

type TrackedAnchorProps = ComponentProps<'a'> & {
  event: AnalyticsEventName
  params?: AnalyticsParams
}

/** Enlace externo (WhatsApp, teléfono) que registra un evento de analítica al hacer clic. */
export function TrackedAnchor({ event, params, onClick, ...props }: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, {
          location: typeof window !== 'undefined' ? window.location.pathname : undefined,
          ...params,
        })
        onClick?.(e)
      }}
    />
  )
}
