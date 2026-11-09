'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ShoppingBag, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import { formatPrice, orderTotals } from '@/lib/shop/pricing'
import { ROUTES } from '@/lib/routes'

import { cart, useCart } from './cart-store'
import { CartLines } from './CartLines'

/** Botón del carrito del encabezado + cajón lateral que se abre al agregar un producto. */
export function CartButton() {
  const { lines, open, count } = useCart()
  const pathname = usePathname()

  // Al navegar se cierra el cajón.
  useEffect(() => cart.close(), [pathname])

  const priced = lines.map((l) => ({ breakdown: l.product.price, quantity: l.quantity }))
  const none = { cost: 0, quoteLater: false }
  const transfer = orderTotals(priced, 'transfer', none)
  const list = orderTotals(priced, 'mercadopago', none)

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? cart.open() : cart.close())}>
      <Dialog.Trigger
        className="relative flex size-11 items-center justify-center hover:text-brand"
        aria-label={
          count ? `Carrito: ${count} ${count === 1 ? 'producto' : 'productos'}` : 'Carrito vacío'
        }
      >
        <ShoppingBag aria-hidden="true" className="size-[22px]" strokeWidth={1.6} />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[0.625rem] font-semibold text-white"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink-deep/55 data-[state=closed]:animate-[fade-out_.2s_ease] data-[state=open]:animate-[fade-in_.2s_ease]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-[81] flex w-[min(100vw,27.5rem)] flex-col bg-paper text-ink shadow-float data-[state=closed]:animate-[drawer-out_.22s_ease] data-[state=open]:animate-[drawer-in_.28s_var(--ease-soft)]"
        >
          <header className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5">
            <Dialog.Title className="text-lg tracking-[-0.01em]">
              Tu carrito{' '}
              {count > 0 && <span className="text-sm font-normal text-muted">({count})</span>}
            </Dialog.Title>
            <Dialog.Close
              className="-mr-2 flex size-11 items-center justify-center hover:text-brand"
              aria-label="Cerrar carrito"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </header>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
              <ShoppingBag aria-hidden="true" className="size-10 text-muted" strokeWidth={1.2} />
              <p className="text-base font-normal text-muted">Todavía no agregaste productos.</p>
              <Link
                href={ROUTES.shop}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Ver la tienda
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5">
                <CartLines lines={lines} compact onNavigate={() => cart.close()} />
              </div>
              <footer className="shrink-0 border-t border-line bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <dl className="mb-4 flex flex-col gap-1.5 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="font-medium">Total con transferencia</dt>
                    <dd className="text-xl font-semibold tabular-nums">
                      {formatPrice(transfer.total)}
                    </dd>
                  </div>
                  {list.total > transfer.total && (
                    <div className="flex items-baseline justify-between gap-4 font-normal text-muted">
                      <dt>Con Mercado Pago</dt>
                      <dd className="tabular-nums">{formatPrice(list.total)}</dd>
                    </div>
                  )}
                </dl>
                <div className="flex flex-col gap-2">
                  <Link
                    href={ROUTES.checkout}
                    className={cn(buttonVariants({ variant: 'primary' }), 'justify-center')}
                  >
                    Finalizar compra
                  </Link>
                  <Link
                    href={ROUTES.cart}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'justify-center',
                    )}
                  >
                    Ver carrito
                  </Link>
                </div>
                <p className="mt-3 text-center text-xs font-normal text-muted">
                  El envío se calcula al finalizar la compra.
                </p>
              </footer>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
