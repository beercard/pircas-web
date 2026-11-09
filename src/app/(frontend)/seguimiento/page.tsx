import type { Metadata } from 'next'

import { OrderLookupForm } from '@/components/shop/OrderLookupForm'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: ROUTES.tracking,
    title: 'Seguí tu pedido',
    description: 'Consultá el estado de tu compra en la tienda de PIRCAS Aberturas.',
  })
}

export default function TrackingPage() {
  return (
    <section className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
      <div className="container-site grid max-w-[64rem] items-start gap-[clamp(1.5rem,4vw,4rem)] md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Breadcrumbs
            items={[
              { name: 'Tienda', path: ROUTES.shop },
              { name: 'Seguimiento', path: ROUTES.tracking },
            ]}
          />
          <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
            Seguí tu pedido
          </h1>
          <p className="max-w-[44ch] text-base leading-[1.7] font-normal text-muted">
            Ingresá el número de pedido y el email con el que compraste para ver el estado, el pago
            y la entrega.
          </p>
        </div>
        <OrderLookupForm />
      </div>
    </section>
  )
}
