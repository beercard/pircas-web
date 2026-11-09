'use client'

import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import type { ShopConfig } from '@/lib/shop/config'
import { formatPrice, orderTotals } from '@/lib/shop/pricing'
import { ROUTES } from '@/lib/routes'

import { cart, toCartItems, useCart, type CartLine } from './cart-store'
import { CartLines } from './CartLines'
import { TotalsList } from './OrderSummary'

/** Vuelve a leer precios y stock del servidor (el carrito guarda una copia local). */
export function useCartSync(lines: CartLine[], ready: boolean) {
  const signature = lines.map((l) => `${l.key}x${l.quantity}`).join('|')
  useEffect(() => {
    if (!ready || !signature) return
    const ctrl = new AbortController()
    fetch('/api/shop/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toCartItems(lines)),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.lines && cart.sync(data.lines, data.missing ?? []))
      .catch(() => {})
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depende del contenido, no de la identidad
  }, [signature, ready])
}

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-5 border border-line bg-white px-6 py-16 text-center">
      <ShoppingBag aria-hidden="true" className="size-11 text-muted" strokeWidth={1.2} />
      <p className="text-lg">Tu carrito está vacío</p>
      <p className="max-w-[40ch] text-sm font-normal text-muted">
        Sumá productos desde la tienda y volvé acá para terminar tu compra.
      </p>
      <Link href={ROUTES.shop} className={buttonVariants({ variant: 'primary' })}>
        Ir a la tienda
      </Link>
    </div>
  )
}

export function CartPage({ config }: { config: ShopConfig }) {
  const { lines, ready, count } = useCart()
  useCartSync(lines, ready)

  if (!ready) return <div className="h-64 animate-pulse bg-stone" aria-hidden="true" />
  if (!lines.length) return <EmptyCart />

  const priced = lines.map((l) => ({ breakdown: l.product.price, quantity: l.quantity }))
  const none = { cost: 0, quoteLater: false }
  const transfer = orderTotals(priced, 'transfer', none)
  const list = orderTotals(priced, 'mercadopago', none)
  const blocked = lines.some((l) => l.issue)

  return (
    <div className="grid items-start gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="border border-line bg-white px-4 sm:px-6">
        <CartLines lines={lines} />
      </div>
      <aside className="sticky top-[calc(var(--spacing-header)+1.5rem)] flex flex-col gap-5 border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg">Resumen</h2>
        <TotalsList totals={transfer} method="transfer" shippingLabel={null} />
        {list.total > transfer.total && (
          <p className="text-sm font-normal text-muted">
            Con Mercado Pago: <span className="text-ink">{formatPrice(list.total)}</span>
            {config.rules.installments > 1 &&
              ` en hasta ${config.rules.installments} cuotas sin interés de ${formatPrice(list.total / config.rules.installments)}`}
            .
          </p>
        )}
        {blocked && (
          <p role="alert" className="text-sm font-normal text-danger">
            Revisá los productos marcados antes de continuar.
          </p>
        )}
        <Link
          href={ROUTES.checkout}
          aria-disabled={blocked || undefined}
          className={cn(
            buttonVariants({ variant: 'primary' }),
            'justify-center',
            blocked && 'pointer-events-none opacity-40',
          )}
        >
          Finalizar compra ({count})
        </Link>
        <Link
          href={ROUTES.shop}
          className="text-center text-sm font-normal text-muted underline underline-offset-4 hover:text-brand"
        >
          Seguir comprando
        </Link>
      </aside>
    </div>
  )
}
