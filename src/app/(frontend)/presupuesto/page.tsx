import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { QuotePage } from '@/components/shop/QuotePage'
import { QuoteSteps } from '@/components/shop/QuoteSteps'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { turnstileSiteKey } from '@/lib/forms/turnstile'
import { ROUTES } from '@/lib/routes'
import { getShopConfig } from '@/lib/shop/config'

export const metadata: Metadata = {
  title: 'Tu presupuesto',
  robots: { index: false, follow: false },
}

export default async function QuoteListRoute() {
  const config = await getShopConfig()
  if (!config.enabled) notFound()
  return (
    <section data-no-cta-bar className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
      <div className="container-site flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)]">
        <Breadcrumbs
          items={[
            { name: 'Tienda', path: ROUTES.shop },
            { name: 'Presupuesto', path: ROUTES.quoteList },
          ]}
        />
        <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
          Tu presupuesto
        </h1>
        <QuoteSteps current={2} title={false} />
        <QuotePage turnstileSiteKey={turnstileSiteKey()} />
      </div>
    </section>
  )
}
