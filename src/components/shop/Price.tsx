import { cn } from '@/lib/cn'
import { formatPrice, type PriceBreakdown } from '@/lib/shop/pricing'

/**
 * Bloque de precios de la tienda: precio con transferencia destacado, precio de lista
 * (Mercado Pago) y cuotas sin interés.
 */
export function PriceBlock({
  price,
  size = 'card',
}: {
  price: PriceBreakdown
  size?: 'card' | 'detail'
}) {
  const detail = size === 'detail'
  const hasTransferOff = price.transfer < price.list
  return (
    <div className={cn('flex flex-col', detail ? 'gap-2' : 'gap-1')}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={cn(
            'font-semibold tracking-[-0.02em] text-ink',
            detail
              ? 'text-[clamp(2rem,1.5rem+2vw,2.875rem)] leading-none'
              : 'text-[1.375rem] leading-tight',
          )}
        >
          {formatPrice(price.transfer)}
        </span>
        <span className={cn('font-normal text-success', detail ? 'text-sm' : 'text-xs')}>
          {hasTransferOff ? 'con transferencia' : 'precio final'}
        </span>
      </p>
      {hasTransferOff && (
        <p
          className={cn('font-normal text-muted', detail ? 'text-[0.9375rem]' : 'text-[0.8125rem]')}
        >
          <span className={price.mpDiscount ? 'line-through' : undefined}>
            {formatPrice(price.list)}
          </span>{' '}
          {price.mpDiscount ? (
            <>
              <span className="text-ink">{formatPrice(price.mercadopago)}</span> con Mercado Pago
            </>
          ) : (
            'precio de lista con Mercado Pago'
          )}
        </p>
      )}
      {price.installments > 1 && (
        <p
          className={cn('font-normal text-muted', detail ? 'text-[0.9375rem]' : 'text-[0.8125rem]')}
        >
          <span className="font-medium text-ink">
            {price.installments} cuotas sin interés de {formatPrice(price.installmentAmount)}
          </span>
        </p>
      )}
    </div>
  )
}

/** Etiquetas de la foto: % de descuento y cuotas. */
export function PriceBadges({ price, featured }: { price: PriceBreakdown; featured?: boolean }) {
  return (
    <span className="pointer-events-none absolute top-0 left-0 flex flex-col items-start gap-1 p-2.5">
      {featured && (
        <span className="bg-ink px-2.5 py-1 text-[0.625rem] tracking-[0.16em] text-white uppercase">
          Destacado
        </span>
      )}
      {price.transferDiscount > 0 && (
        <span className="rounded-door bg-brand py-1 pr-3.5 pl-2.5 text-xs font-semibold text-white">
          {price.transferDiscount}% OFF
        </span>
      )}
      {price.installments > 1 && (
        <span className="bg-white px-2.5 py-1 text-[0.625rem] tracking-[0.12em] text-ink uppercase shadow-[0_0_0_1px_var(--color-line)]">
          {price.installments} cuotas s/interés
        </span>
      )}
    </span>
  )
}
