import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CheckoutForm } from '@/components/shop/CheckoutForm'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { turnstileSiteKey } from '@/lib/forms/turnstile'
import { ROUTES } from '@/lib/routes'
import { getShopConfig } from '@/lib/shop/config'

export const metadata: Metadata = {
  title: 'Finalizar compra',
  robots: { index: false, follow: false },
}

export default async function CheckoutRoute() {
  const config = await getShopConfig()
  if (!config.enabled) notFound()
  return (
    <section data-no-cta-bar className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
      <div className="container-site flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)]">
        <Breadcrumbs
          items={[
            { name: 'Tienda', path: ROUTES.shop },
            { name: 'Carrito', path: ROUTES.cart },
            { name: 'Finalizar compra', path: ROUTES.checkout },
          ]}
        />
        <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
          Finalizar compra
        </h1>
        <CheckoutForm config={config} turnstileSiteKey={turnstileSiteKey()} />
      </div>
    </section>
  )
}
