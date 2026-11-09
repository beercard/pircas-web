import { Check } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { buttonVariants } from '@/components/ui/button-variants'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { cn } from '@/lib/cn'
import { getPayloadClient } from '@/lib/data/client'
import { getShopSettings, getSiteSettings } from '@/lib/data/globals'
import { ROUTES } from '@/lib/routes'
import { customerWhatsAppMessage } from '@/lib/shop/notify'
import {
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  STATUS_MESSAGES,
  trackingSteps,
  type OrderStatus,
} from '@/lib/shop/options'
import { findOrderByToken } from '@/lib/shop/order'
import { formatPrice } from '@/lib/shop/pricing'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

type Props = {
  params: Promise<{ number: string }>
  searchParams: Promise<{ t?: string; status?: string; collection_status?: string }>
}

export const metadata: Metadata = {
  title: 'Tu pedido',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(iso))

/** Pedido hecho hace menos de 2 horas: se muestra como página de "gracias". */
const isRecent = (iso: string) => Date.now() - new Date(iso).getTime() < 2 * 3600_000

/** Página de gracias + seguimiento del pedido. Solo se accede con el enlace (número + token). */
export default async function OrderPage({ params, searchParams }: Props) {
  const [{ number }, sp] = await Promise.all([params, searchParams])
  const payload = await getPayloadClient()
  const order = await findOrderByToken(payload, number, sp.t ?? '')
  if (!order) notFound()

  const [site, shop] = await Promise.all([getSiteSettings(), getShopSettings()])
  const status = order.status as OrderStatus
  const pickup = order.shipping?.type === 'pickup'
  const steps = trackingSteps(pickup)
  const current = steps.indexOf(status)
  const cancelled = status === 'cancelled'
  const paid = order.paymentStatus === 'paid'
  const isNew = status === 'pending' && isRecent(order.createdAt)
  const mpReturn = sp.status || sp.collection_status
  const wa = whatsappUrl(getWhatsAppConfig(site), customerWhatsAppMessage(order))
  const bank = shop.transfer
  const bankRows = [
    ['Titular', bank?.holder],
    ['Banco', bank?.bank],
    ['CBU / CVU', bank?.cbu],
    ['Alias', bank?.alias],
    ['CUIT', bank?.cuit],
  ].filter(([, v]) => v) as [string, string][]
  const card = 'border border-line bg-white p-5 sm:p-7'
  const label = 'text-eyebrow tracking-[0.2em] text-muted uppercase'

  return (
    <section className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
      <div className="container-site flex max-w-[68rem] flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
        <header className="flex flex-col gap-4">
          <p className="eyebrow">Pedido {order.orderNumber}</p>
          <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
            {cancelled
              ? 'Pedido cancelado'
              : isNew
                ? `¡Gracias por tu compra, ${order.customerName.split(' ')[0]}!`
                : orderStatusLabel(status)}
          </h1>
          <p className="max-w-[60ch] text-[clamp(1rem,0.9rem+0.4vw,1.25rem)] leading-normal font-normal text-muted">
            {isNew ? shop.thanksMessage || STATUS_MESSAGES.pending : STATUS_MESSAGES[status]}
          </p>
          {order.customer?.email && isNew && (
            <p className="text-sm font-normal text-muted">
              Te enviamos el detalle a <span className="text-ink">{order.customer.email}</span>.
              Guardá este enlace para seguir tu pedido.
            </p>
          )}
        </header>

        {mpReturn && !paid && (
          <p
            role="status"
            className="border-l-2 border-brand bg-brand-tint px-4 py-3.5 text-sm font-normal"
          >
            {mpReturn === 'approved'
              ? 'Mercado Pago aprobó tu pago. Lo estamos registrando: en unos minutos vas a verlo acá.'
              : mpReturn === 'pending' || mpReturn === 'in_process'
                ? 'Tu pago está en proceso. Te avisamos por email cuando se acredite.'
                : 'El pago no se completó. Tu pedido quedó registrado: escribinos y te enviamos un nuevo link de pago.'}
          </p>
        )}

        {/* Seguimiento */}
        {!cancelled && (
          <div className={card}>
            <h2 className={cn(label, 'mb-6')}>Seguimiento</h2>
            <ol className="grid gap-y-5 sm:grid-cols-5">
              {steps.map((s, i) => {
                const done = i <= current
                const active = i === current
                return (
                  <li
                    key={s}
                    aria-current={active ? 'step' : undefined}
                    className="relative flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-3"
                  >
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute max-sm:top-[-1.25rem] max-sm:left-[0.9375rem] max-sm:h-5 max-sm:w-px sm:top-[0.9375rem] sm:right-full sm:left-[calc(-100%+2rem)] sm:h-px',
                          done ? 'bg-brand' : 'bg-line-strong',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                        done
                          ? 'border-brand bg-brand text-white'
                          : 'border-line-strong bg-white text-muted',
                      )}
                    >
                      {done ? <Check aria-hidden="true" className="size-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-sm',
                        active ? 'font-semibold' : done ? 'font-medium' : 'font-normal text-muted',
                      )}
                    >
                      {orderStatusLabel(s)}
                    </span>
                  </li>
                )
              })}
            </ol>
            {(order.shipping?.carrier || order.shipping?.trackingCode) && (
              <p className="mt-6 border-t border-line pt-5 text-sm font-normal">
                {order.shipping.carrier && (
                  <>
                    Transporte: <span className="font-medium">{order.shipping.carrier}</span>.{' '}
                  </>
                )}
                {order.shipping.trackingCode && (
                  <>
                    Código de seguimiento:{' '}
                    <span className="font-medium">{order.shipping.trackingCode}</span>.{' '}
                  </>
                )}
                {order.shipping.trackingUrl && /^https?:\/\//.test(order.shipping.trackingUrl) && (
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline underline-offset-4"
                  >
                    Seguir el envío
                  </a>
                )}
              </p>
            )}
          </div>
        )}

        <div className="grid items-start gap-[clamp(1.25rem,2.5vw,2rem)] lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
            {/* Pago */}
            <div className={card}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className={label}>Pago · {paymentMethodLabel(order.paymentMethod)}</h2>
                <span
                  className={cn(
                    'px-3 py-1 text-xs font-semibold',
                    paid ? 'bg-success/10 text-success' : 'bg-brand-tint text-brand-ink',
                  )}
                >
                  {paymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
              {paid ? (
                <p className="text-sm font-normal text-muted">Recibimos tu pago. ¡Gracias!</p>
              ) : order.paymentMethod === 'transfer' ? (
                <>
                  <p className="mb-4 text-sm font-normal text-muted">
                    Transferí{' '}
                    <span className="font-semibold text-ink">{formatPrice(order.total ?? 0)}</span>{' '}
                    {order.shipping?.quoteLater && !order.shippingCost
                      ? '(sin el envío, que coordinamos aparte) '
                      : ''}
                    y envianos el comprobante con tu número de pedido.
                  </p>
                  {bankRows.length ? (
                    <dl className="grid gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                      {bankRows.map(([k, v]) => (
                        <div key={k} className="flex flex-col gap-0.5">
                          <dt className="text-xs font-normal text-muted">{k}</dt>
                          <dd className="font-medium break-all select-all">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm font-normal text-muted">
                      Te enviamos los datos bancarios por WhatsApp o email.
                    </p>
                  )}
                  {bank?.instructions && (
                    <p className="mt-4 text-sm font-normal text-muted">{bank.instructions}</p>
                  )}
                </>
              ) : order.paymentMethod === 'mercadopago' ? (
                <p className="text-sm font-normal text-muted">
                  Si todavía no pagaste, te enviamos el link de Mercado Pago por WhatsApp o email.
                </p>
              ) : (
                <p className="text-sm font-normal text-muted">
                  Pagás en efectivo al retirar tu pedido en el taller.
                </p>
              )}
            </div>

            {/* Productos */}
            <div className={card}>
              <h2 className={cn(label, 'mb-2')}>Productos</h2>
              <ul className="divide-y divide-line">
                {(order.items ?? []).map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.9375rem] font-medium">{item.name}</span>
                      <span className="text-xs font-normal text-muted">
                        {[item.variant, `${item.quantity} × ${formatPrice(item.unitPrice)}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </div>
                    <span className="shrink-0 text-[0.9375rem] font-semibold tabular-nums">
                      {formatPrice(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-normal text-muted">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(order.subtotal ?? 0)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-normal text-muted">Entrega</dt>
                  <dd className="tabular-nums">
                    {order.shipping?.quoteLater && !order.shippingCost
                      ? 'A coordinar'
                      : order.shippingCost
                        ? formatPrice(order.shippingCost)
                        : 'Sin costo'}
                  </dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
                  <dt className="text-base font-medium">Total</dt>
                  <dd className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">
                    {formatPrice(order.total ?? 0)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
            <div className={cn(card, 'flex flex-col gap-4')}>
              <h2 className={label}>Entrega</h2>
              <p className="text-sm font-normal">
                <span className="font-medium">{order.shipping?.label}</span>
                {!pickup && (
                  <>
                    <br />
                    {[
                      order.shipping?.address,
                      order.shipping?.city,
                      order.shipping?.province,
                      order.shipping?.zip,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </>
                )}
              </p>
              <h2 className={cn(label, 'mt-2')}>Datos de contacto</h2>
              <p className="text-sm font-normal break-words">
                {order.customerName}
                <br />
                {order.customer?.email}
                <br />
                {order.customer?.phone}
              </p>
            </div>

            <div className={cn(card, 'flex flex-col gap-3.5')}>
              <h2 className={label}>¿Dudas con tu pedido?</h2>
              {wa && (
                <TrackedAnchor
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="whatsapp_click"
                  params={{ location: 'order' }}
                  className={cn(buttonVariants({ variant: 'dark', size: 'sm' }), 'justify-center')}
                >
                  <WhatsAppIcon className="size-5 text-whatsapp" />
                  {paid || order.paymentMethod !== 'transfer'
                    ? 'Escribinos por WhatsApp'
                    : 'Enviar comprobante'}
                </TrackedAnchor>
              )}
              <Link
                href={ROUTES.shop}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'justify-center')}
              >
                Seguir comprando
              </Link>
            </div>

            {(order.timeline ?? []).length > 1 && (
              <div className={card}>
                <h2 className={cn(label, 'mb-4')}>Novedades</h2>
                <ol className="flex flex-col gap-4">
                  {[...(order.timeline ?? [])].reverse().map((t) => (
                    <li key={t.id} className="border-l-2 border-line-strong pl-3.5 text-sm">
                      <span className="block font-medium">{t.label}</span>
                      {t.note && <span className="block font-normal text-muted">{t.note}</span>}
                      {t.date && (
                        <time dateTime={t.date} className="text-xs font-normal text-muted">
                          {dateTime(t.date)}
                        </time>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
