'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef } from 'react'

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

/**
 * Widget de Cloudflare Turnstile (modo "managed": casi siempre invisible para humanos).
 * Si no hay site key (desarrollo), no renderiza nada y el servidor omite la verificación.
 */
export function Turnstile({
  siteKey,
  onToken,
  resetSignal,
}: {
  siteKey: string | null
  onToken: (token: string | undefined) => void
  resetSignal?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  const render = useCallback(() => {
    if (!siteKey || !ref.current || !window.turnstile || widgetId.current) return
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      language: 'es',
      appearance: 'interaction-only',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(undefined),
      'error-callback': () => onToken(undefined),
    })
  }, [siteKey, onToken])

  useEffect(() => {
    render()
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [render])

  useEffect(() => {
    if (resetSignal && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current)
      onToken(undefined)
    }
  }, [resetSignal, onToken])

  if (!siteKey) return null
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={render}
      />
      <div ref={ref} />
    </>
  )
}
