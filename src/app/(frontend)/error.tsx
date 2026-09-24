'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/button-variants'

/** Error 500 dentro del sitio: mensaje amable, sin detalles técnicos. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // El detalle queda en los logs del servidor; en el navegador solo el identificador.
    console.error('Error de página', error.digest)
  }, [error])

  return (
    <section className="bg-paper py-section">
      <div className="container-site flex flex-col items-start gap-6">
        <p className="eyebrow">Error</p>
        <h1 className="max-w-[18ch] text-h1">Algo salió mal de nuestro lado.</h1>
        <p className="max-w-[46ch] text-lead font-normal text-muted">
          Probá de nuevo en unos segundos. Si sigue fallando, escribinos por WhatsApp y te atendemos
          igual.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset} arrow>
            Reintentar
          </Button>
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            Ir al inicio
          </Link>
        </div>
        {error.digest && <p className="text-xs font-normal text-muted">Código: {error.digest}</p>}
      </div>
    </section>
  )
}
