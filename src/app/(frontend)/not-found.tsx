import Link from 'next/link'

import { DoorShape } from '@/components/ui/Brand'
import { buttonVariants } from '@/components/ui/button-variants'
import { ROUTES } from '@/lib/routes'

export const metadata = { title: 'Página no encontrada', robots: { index: false } }

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-paper py-section">
      <DoorShape className="-right-10 -bottom-20 w-[clamp(200px,28vw,420px)] text-stone" />
      <div className="container-site relative flex flex-col items-start gap-6">
        <p className="eyebrow">Error 404</p>
        <h1 className="max-w-[16ch] text-h1">Esta página no existe (o se mudó).</h1>
        <p className="max-w-[46ch] text-lead font-normal text-muted">
          Puede que el enlace esté viejo. Probá desde el inicio o mirá nuestros productos.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ variant: 'primary' })}>
            Ir al inicio <span aria-hidden="true">→</span>
          </Link>
          <Link href={ROUTES.products} className={buttonVariants({ variant: 'outline' })}>
            Ver productos
          </Link>
        </div>
      </div>
    </section>
  )
}
