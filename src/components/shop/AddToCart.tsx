'use client'

import { Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'
import type { ShopProduct } from '@/lib/shop/config'
import { formatPrice } from '@/lib/shop/pricing'
import { MAX_QTY } from '@/lib/shop/schema'
import { ROUTES } from '@/lib/routes'

import { cart } from './cart-store'

function addToCart(product: ShopProduct, color: string | null, quantity: number) {
  cart.add(product, color, quantity)
  track('add_to_cart', {
    product: product.name,
    product_id: product.id,
    value: product.price.transfer * quantity,
    currency: 'ARS',
    quantity,
  })
}

/** Botón rápido de las tarjetas: agrega 1 unidad (con el primer color) y abre el carrito. */
export function QuickAddButton({ product }: { product: ShopProduct }) {
  const [added, setAdded] = useState(false)
  const soldOut = product.stock === 0
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => {
        addToCart(product, product.colors[0]?.value ?? null, 1)
        setAdded(true)
        setTimeout(() => setAdded(false), 1600)
      }}
      className={cn(
        buttonVariants({ variant: added ? 'dark' : 'primary', size: 'sm' }),
        'w-full justify-center',
      )}
    >
      {soldOut ? (
        'Sin stock'
      ) : added ? (
        <>
          <Check aria-hidden="true" className="size-4" /> Agregado
        </>
      ) : (
        <>
          <ShoppingBag aria-hidden="true" className="size-4" /> Agregar
        </>
      )}
    </button>
  )
}

export function QuantityStepper({
  value,
  onChange,
  max = MAX_QTY,
  label = 'Cantidad',
  small,
}: {
  value: number
  onChange: (n: number) => void
  max?: number
  label?: string
  small?: boolean
}) {
  const size = small ? 'size-9' : 'size-12'
  return (
    <div
      className="inline-flex items-center border border-line-strong bg-white"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn(
          size,
          'flex items-center justify-center hover:text-brand disabled:opacity-30',
        )}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Restar una unidad"
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn('text-center text-sm font-medium tabular-nums', small ? 'w-8' : 'w-10')}
      >
        {value}
      </span>
      <button
        type="button"
        className={cn(
          size,
          'flex items-center justify-center hover:text-brand disabled:opacity-30',
        )}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Sumar una unidad"
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

/** Caja de compra de la ficha: color, cantidad, agregar al carrito y comprar ahora. */
export function BuyBox({ product }: { product: ShopProduct }) {
  const router = useRouter()
  const [color, setColor] = useState<string | null>(product.colors[0]?.value ?? null)
  const [quantity, setQuantity] = useState(1)
  const soldOut = product.stock === 0
  const max = Math.min(MAX_QTY, product.stock ?? MAX_QTY)

  return (
    <div className="flex flex-col gap-5">
      {/* Celular: barra fija de compra (reemplaza a la de WhatsApp / Presupuesto). */}
      <div
        data-buy-bar
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-white px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-lg leading-tight font-semibold tabular-nums">
            {formatPrice(product.price.transfer * quantity)}
          </span>
          <span className="truncate text-[0.6875rem] font-normal text-muted">
            {product.price.transfer < product.price.list ? 'con transferencia' : 'precio final'}
            {quantity > 1 ? ` · ${quantity} unidades` : ''}
          </span>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => addToCart(product, color, quantity)}
          className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'shrink-0')}
        >
          <ShoppingBag aria-hidden="true" className="size-4" />
          {soldOut ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
      {product.colors.length > 0 && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-eyebrow tracking-[0.2em] text-muted uppercase">
            Color:{' '}
            <span className="tracking-normal text-ink normal-case">
              {product.colors.find((c) => c.value === color)?.label}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <label
                key={c.value}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center gap-2.5 border px-3.5 text-sm font-medium has-focus-visible:outline-2 has-focus-visible:outline-brand',
                  color === c.value
                    ? 'border-ink bg-white'
                    : 'border-line-strong hover:border-ink/50',
                )}
              >
                <input
                  type="radio"
                  name="color"
                  value={c.value}
                  checked={color === c.value}
                  onChange={() => setColor(c.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full border border-ink/25"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-eyebrow tracking-[0.2em] text-muted uppercase">Cantidad</span>
          <QuantityStepper value={quantity} onChange={setQuantity} max={max} />
        </div>
        {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
          <p className="pb-3.5 text-sm font-normal text-brand-ink">
            {product.stock === 1 ? 'Queda 1 unidad' : `Quedan ${product.stock} unidades`}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={soldOut}
          onClick={() => addToCart(product, color, quantity)}
          className={cn(buttonVariants({ variant: 'primary' }), 'flex-1 justify-center')}
        >
          <ShoppingBag aria-hidden="true" className="size-4" />
          {soldOut ? 'Sin stock' : 'Agregar al carrito'}
        </button>
        {!soldOut && (
          <button
            type="button"
            onClick={() => {
              addToCart(product, color, quantity)
              cart.close()
              router.push(ROUTES.checkout)
            }}
            className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-center')}
          >
            Comprar ahora
          </button>
        )}
      </div>
    </div>
  )
}
