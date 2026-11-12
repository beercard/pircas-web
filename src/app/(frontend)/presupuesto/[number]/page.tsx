import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { PrintButton } from '@/components/shop/PrintButton'
import { QuoteDocument } from '@/components/shop/QuoteDocument'
import { QuoteSteps } from '@/components/shop/QuoteSteps'
import { buttonVariants } from '@/components/ui/button-variants'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { cn } from '@/lib/cn'
import { getPayloadClient } from '@/lib/data/client'
import { getShopSettings, getSiteSettings } from '@/lib/data/globals'
import { ROUTES } from '@/lib/routes'
import { toShopConfig } from '@/lib/shop/config'
import { quoteUrl } from '@/lib/shop/links'
import { customerQuoteMessage } from '@/lib/shop/notify'
import { findQuoteByToken } from '@/lib/shop/quote'
import { formatPrice } from '@/lib/shop/pricing'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

type Props = {
  params: Promise<{ number: string }>
  searchParams: Promise<{ t?: string }>
}

export const metadata: Metadata = {
  title: 'Tu presupuesto',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

const dateOf = (iso: string, days = 0) =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(new Date(iso).getTime() + days * 86_400_000))

/** El presupuesto calculado. Solo se accede con el enlace (número + token). */
export default async function QuoteResultPage({ params, searchParams }: Props) {
  const [{ number }, sp] = await Promise.all([params, searchParams])
  const payload = await getPayloadClient()
  const order = await findQuoteByToken(payload, number, sp.t ?? '')
  if (!order) notFound()

  const [site, shop] = await Promise.all([getSiteSettings(), getShopSettings()])
  const config = toShopConfig(shop)
  const url = quoteUrl(order, sp.t ?? '')
  const wa = whatsappUrl(getWhatsAppConfig(site), customerQuoteMessage(order, url))
  const total = order.total ?? 0
  const transfer = order.transferTotal ?? total
  const first = order.customerName.split(' ')[0]
  const card = 'border border-line bg-white p-5 sm:p-7'
  const label = 'text-eyebrow tracking-[0.2em] text-muted uppercase'
  const waParams = { quote_number: order.orderNumber, value: total, currency: 'ARS' }

  return (
    <>
      <QuoteDocument order={order} site={site} validityDays={config.validityDays} url={url} />
      <section
        data-no-cta-bar
        className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm print:hidden"
      >
        <div className="container-site flex max-w-[68rem] flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
          <header className="flex flex-col gap-4">
            <p className="eyebrow">Presupuesto {order.orderNumber}</p>
            <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
              ¡Listo, {first}! Este es tu presupuesto
            </h1>
            <p className="max-w-[62ch] text-[clamp(1rem,0.9rem+0.4vw,1.25rem)] leading-normal font-normal text-muted">
              {shop.thanksMessage ||
                'Te escribimos por WhatsApp para resolver tus dudas, coordinar la entrega o la colocación.'}
            </p>
            {order.whatsappSent && (
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                También te lo enviamos a tu WhatsApp ({order.customer?.phone}).
              </p>
            )}
          </header>

          <div className="print:hidden">
            <QuoteSteps current={3} title={false} />
          </div>

          <div className="grid items-start gap-[clamp(1.25rem,2.5vw,2rem)] lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div className={card}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className={label}>Detalle</h2>
                <p className="text-xs font-normal text-muted">
                  {dateOf(order.createdAt)} · válido hasta el{' '}
                  {dateOf(order.createdAt, config.validityDays)}
                </p>
              </div>
              <ul className="divide-y divide-line">
                {(order.items ?? []).map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.9375rem] font-medium">{item.name}</span>
                      {item.variant && (
                        <span className="text-xs font-normal text-muted">{item.variant}</span>
                      )}
                      <span className="text-xs font-normal text-muted">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                    <span className="shrink-0 text-[0.9375rem] font-semibold tabular-nums">
                      {formatPrice(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="flex flex-col gap-3 border-t border-line pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-base font-medium">Total</dt>
                  <dd className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">
                    {formatPrice(total)}
                  </dd>
                </div>
                {(order.installments ?? 1) > 1 && order.installmentAmount && (
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 font-normal text-muted">Con tarjeta</dt>
                    <dd className="text-right font-medium">
                      {order.installments} cuotas sin interés de{' '}
                      {formatPrice(order.installmentAmount)}
                    </dd>
                  </div>
                )}
                {transfer < total && (
                  <div className="flex items-baseline justify-between gap-4 bg-success/8 px-3.5 py-3">
                    <dt className="font-medium text-success">
                      Pagando por transferencia o efectivo
                      <span className="block text-xs font-normal">
                        Ahorrás {formatPrice(total - transfer)}
                      </span>
                    </dt>
                    <dd className="text-xl font-semibold tracking-[-0.02em] whitespace-nowrap text-success tabular-nums">
                      {formatPrice(transfer)}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-5 text-xs font-normal text-muted">
                Precios de medida estándar según catálogo
                {order.vatPercent ? ', con IVA incluido' : ''}. No incluyen flete ni colocación. Si
                necesitás otra medida, la fabricamos y te la cotizamos.
              </p>
            </div>

            <aside className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)] print:hidden">
              <div className={cn(card, 'flex flex-col gap-3.5')}>
                <h2 className="text-lg tracking-[-0.01em]">Recibilo en tu WhatsApp</h2>
                <p className="text-sm font-normal text-muted">
                  Se abre WhatsApp con tu presupuesto listo para enviarnos: te queda guardado en el
                  chat y te respondemos para avanzar.
                </p>
                {wa && (
                  <TrackedAnchor
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    event="quote_whatsapp_click"
                    params={waParams}
                    className={cn(buttonVariants({ variant: 'primary' }), 'justify-center')}
                  >
                    <WhatsAppIcon className="size-5" />
                    Enviar a WhatsApp
                  </TrackedAnchor>
                )}
                <PrintButton />
                <Link
                  href={ROUTES.shop}
                  className="py-1.5 text-center text-sm font-normal text-muted underline underline-offset-4 hover:text-brand"
                >
                  Armar otro presupuesto
                </Link>
              </div>
              <div className={cn(card, 'flex flex-col gap-2 text-sm')}>
                <h2 className={label}>Tus datos</h2>
                <p className="font-normal break-words">
                  {order.customerName}
                  <br />
                  {order.customer?.phone}
                  {order.customer?.city && (
                    <>
                      <br />
                      {order.customer.city}
                    </>
                  )}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
