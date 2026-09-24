import type { Metadata } from 'next'
import Link from 'next/link'

import { DoorMark } from '@/components/ui/Brand'
import { buttonVariants } from '@/components/ui/button-variants'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = { title: 'Gracias', robots: { index: false, follow: false } }

/** Página de agradecimiento (útil como URL de conversión en campañas). */
export default function ThanksPage() {
  return (
    <section className="bg-paper py-section">
      <span data-hide-footer-cta hidden />
      <div className="container-site flex flex-col items-start gap-6">
        <DoorMark className="h-[60px] w-[44px] text-brand" />
        <h1 className="max-w-[18ch] text-h1">Gracias por escribirnos.</h1>
        <p className="max-w-[46ch] text-lead font-normal text-muted">
          Recibimos tu consulta y te vamos a responder a la brevedad.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.projects} className={buttonVariants({ variant: 'primary' })}>
            Ver proyectos <span aria-hidden="true">→</span>
          </Link>
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  )
}
