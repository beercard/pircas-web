import { formatPrice, type OrderTotals, type PaymentMethod } from '@/lib/shop/pricing'

/** Resumen de totales (carrito y checkout). */
export function TotalsList({
  totals,
  method,
  shippingLabel,
  quoteLater,
}: {
  totals: OrderTotals
  method: PaymentMethod
  /** null = todavía no se eligió la entrega. */
  shippingLabel: string | null
  quoteLater?: boolean
}) {
  const row = 'flex items-baseline justify-between gap-4'
  return (
    <dl className="flex flex-col gap-2.5 text-sm">
      <div className={row}>
        <dt className="font-normal text-muted">Productos ({totals.itemsCount})</dt>
        <dd className="tabular-nums">{formatPrice(totals.subtotalList)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className={`${row} text-success`}>
          <dt className="font-normal">
            Descuento{' '}
            {method === 'mercadopago'
              ? 'Mercado Pago'
              : method === 'cash'
                ? 'efectivo'
                : 'transferencia'}
          </dt>
          <dd className="tabular-nums">− {formatPrice(totals.discount)}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="font-normal text-muted">{shippingLabel ?? 'Entrega'}</dt>
        <dd className="tabular-nums">
          {shippingLabel === null
            ? 'Se calcula al finalizar'
            : quoteLater
              ? 'A coordinar'
              : totals.shipping
                ? formatPrice(totals.shipping)
                : 'Sin costo'}
        </dd>
      </div>
      <div className={`${row} mt-1.5 border-t border-line pt-4`}>
        <dt className="text-base font-medium">Total</dt>
        <dd className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">
          {formatPrice(totals.total)}
        </dd>
      </div>
    </dl>
  )
}
