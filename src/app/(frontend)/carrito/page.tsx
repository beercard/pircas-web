import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CartPage } from '@/components/shop/CartPage'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ROUTES } from '@/lib/routes'
import { getShopConfig } from '@/lib/shop/config'

export const metadata: Metadata = { title: 'Tu carrito', robots: { index: false, follow: false } }

export default async function CartRoute() {
  const config = await getShopConfig()
  if (!config.enabled) notFound()
  return (
    <section data-no-cta-bar className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
      <div className="container-site flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)]">
        <Breadcrumbs
          items={[
            { name: 'Tienda', path: ROUTES.shop },
            { name: 'Carrito', path: ROUTES.cart },
          ]}
        />
        <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
          Tu carrito
        </h1>
        <CartPage config={config} />
      </div>
    </section>
  )
}
