import type { Order, SiteSetting } from '@/payload-types'
import { BrandLogo } from '@/components/ui/Brand'
import { formatPrice } from '@/lib/shop/pricing'

const dateOf = (iso: string, days = 0) =>
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(new Date(iso).getTime() + days * 86_400_000))

/**
 * Presupuesto en formato de documento (A4) para imprimir o guardar en PDF. Solo se ve al
 * imprimir: en pantalla se muestra la versión web.
 */
export function QuoteDocument({
  order,
  site,
  validityDays,
  url,
}: {
  order: Order
  site: SiteSetting
  validityDays: number
  url: string
}) {
  const total = order.total ?? 0
  const transfer = order.transferTotal ?? total
  const installments = order.installments ?? 1
  const address = [site.address?.street, site.address?.city, site.address?.region]
    .filter(Boolean)
    .join(', ')
  const contact = [site.phone, site.email].filter(Boolean).join(' · ')
  const web = url.replace(/^https?:\/\//, '').split('/')[0]
  const th =
    'border-b-2 border-ink py-2 text-left text-[8pt] font-semibold tracking-[0.12em] uppercase'

  return (
    <article
      data-print-doc
      className="hidden bg-white text-[9.5pt] leading-snug text-ink [print-color-adjust:exact] print:block"
    >
      {/* Membrete */}
      <header className="flex items-start justify-between gap-8 border-b-[3px] border-brand pb-5">
        <div className="flex flex-col gap-3">
          <BrandLogo brandName={(site.brandName?.split(' ')[0] || 'Pircas').toUpperCase()} />
          <div className="text-[8.5pt] text-muted">
            {site.legalName && <p className="font-medium text-ink">{site.legalName}</p>}
            {address && <p>{address}</p>}
            {contact && <p>{contact}</p>}
            <p>{web}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[20pt] leading-none font-semibold tracking-[0.08em] uppercase">
            Presupuesto
          </p>
          <table className="mt-3 ml-auto text-[8.5pt]">
            <tbody>
              {[
                ['N.º', order.orderNumber],
                ['Fecha', dateOf(order.createdAt)],
                ['Válido hasta', dateOf(order.createdAt, validityDays)],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="pr-3 text-muted">{k}</td>
                  <td className="font-semibold tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </header>

      {/* Cliente */}
      <section className="mt-5 grid grid-cols-3 gap-4 border border-line px-4 py-3">
        {[
          ['Cliente', order.customerName],
          ['WhatsApp', order.customer?.phone],
          ['Localidad', order.customer?.city],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[7.5pt] tracking-[0.14em] text-muted uppercase">{k}</p>
            <p className="font-medium">{v || '—'}</p>
          </div>
        ))}
      </section>

      {/* Detalle */}
      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr>
            <th className={`${th} w-8`}>#</th>
            <th className={th}>Producto</th>
            <th className={`${th} w-14 text-center`}>Cant.</th>
            <th className={`${th} w-28 text-right`}>Precio unit.</th>
            <th className={`${th} w-28 text-right`}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item, i) => (
            <tr key={item.id ?? i} className="break-inside-avoid border-b border-line align-top">
              <td className="py-2.5 text-muted tabular-nums">{i + 1}</td>
              <td className="py-2.5 pr-4">
                <p className="font-medium">{item.name}</p>
                {item.variant && <p className="text-[8.5pt] text-muted">{item.variant}</p>}
                {item.sku && <p className="text-[7.5pt] text-muted">Cód. {item.sku}</p>}
              </td>
              <td className="py-2.5 text-center tabular-nums">{item.quantity}</td>
              <td className="py-2.5 text-right whitespace-nowrap tabular-nums">
                {formatPrice(item.unitPrice)}
              </td>
              <td className="py-2.5 text-right font-medium whitespace-nowrap tabular-nums">
                {formatPrice(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="mt-5 flex break-inside-avoid justify-end">
        <table className="w-[25rem] border-collapse text-[9.5pt]">
          <tbody>
            <tr className="border-b border-line">
              <td className="py-2 whitespace-nowrap text-muted">
                Total{order.vatPercent ? ' con IVA' : ''} (precio de lista)
              </td>
              <td className="py-2 text-right font-semibold whitespace-nowrap tabular-nums">
                {formatPrice(total)}
              </td>
            </tr>
            {installments > 1 && order.installmentAmount && (
              <tr className="border-b border-line">
                <td className="py-2 whitespace-nowrap text-muted">Con tarjeta de crédito</td>
                <td className="py-2 text-right whitespace-nowrap tabular-nums">
                  {installments} cuotas s/interés de {formatPrice(order.installmentAmount)}
                </td>
              </tr>
            )}
            {transfer < total && (
              <tr className="bg-ink text-white">
                <td className="px-3 py-2.5 font-semibold whitespace-nowrap">
                  Transferencia o efectivo
                  <span className="block text-[8pt] font-normal opacity-80">
                    Ahorrás {formatPrice(total - transfer)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-[13pt] font-semibold whitespace-nowrap tabular-nums">
                  {formatPrice(transfer)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Condiciones */}
      <section className="mt-8 break-inside-avoid border-t border-line pt-4 text-[8pt] text-muted">
        <p className="mb-1.5 text-[7.5pt] font-semibold tracking-[0.14em] text-ink uppercase">
          Condiciones
        </p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>
            Precios en pesos argentinos para las medidas estándar indicadas
            {order.vatPercent ? `, con IVA (${order.vatPercent} %) incluido` : ''}.
          </li>
          <li>No incluyen flete ni colocación (se cotizan aparte según la obra y la localidad).</li>
          <li>Presupuesto válido por {validityDays} días. Sujeto a disponibilidad de stock.</li>
          <li>Otras medidas se fabrican a pedido y se cotizan por separado.</li>
        </ul>
      </section>

      <footer className="mt-8 flex items-end justify-between gap-6 border-t-[3px] border-brand pt-3 text-[8pt] text-muted">
        <p>
          Gracias por elegirnos. Para avanzar, respondé por WhatsApp citando el N.º{' '}
          {order.orderNumber}.
        </p>
        <p className="shrink-0">{web}</p>
      </footer>
    </article>
  )
}
