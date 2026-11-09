'use client'

import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import { colorLabel } from '@/lib/shop/options'
import { formatPrice, unitPriceFor, type PaymentMethod } from '@/lib/shop/pricing'
import { MAX_QTY } from '@/lib/shop/schema'
import { pathFor } from '@/lib/routes'

import { QuantityStepper } from './AddToCart'
import { cart, type CartLine } from './cart-store'

/** Líneas del carrito (cajón lateral, página del carrito y resumen del checkout). */
export function CartLines({
  lines,
  method = 'transfer',
  editable = true,
  compact,
  onNavigate,
}: {
  lines: CartLine[]
  method?: PaymentMethod
  editable?: boolean
  compact?: boolean
  onNavigate?: () => void
}) {
  return (
    <ul className="flex flex-col divide-y divide-line">
      {lines.map((line) => {
        const unit = unitPriceFor(line.product.price, method)
        const variant = [line.color ? colorLabel(line.color) : null, line.product.measure]
          .filter(Boolean)
          .join(' · ')
        return (
          <li key={line.key} className={cn('flex gap-3.5', compact ? 'py-3.5' : 'py-5')}>
            <Link
              href={pathFor('products', line.product.slug)}
              onClick={onNavigate}
              className={cn(
                'relative shrink-0 overflow-hidden bg-stone',
                compact ? 'size-16' : 'size-20 sm:size-24',
              )}
              tabIndex={-1}
              aria-hidden="true"
            >
              {line.product.image && (
                <Image
                  src={line.product.image.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={pathFor('products', line.product.slug)}
                  onClick={onNavigate}
                  className="text-[0.9375rem] leading-snug font-medium hover:text-brand"
                >
                  {line.product.name}
                </Link>
                {editable && (
                  <button
                    type="button"
                    onClick={() => cart.remove(line.key)}
                    className="-mt-1.5 -mr-2 flex size-9 shrink-0 items-center justify-center text-muted hover:text-danger"
                    aria-label={`Quitar ${line.product.name} del carrito`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                )}
              </div>
              {variant && <p className="text-xs font-normal text-muted">{variant}</p>}
              {line.issue && (
                <p role="alert" className="text-xs font-normal text-danger">
                  {line.issue}
                </p>
              )}
              <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                {editable ? (
                  <QuantityStepper
                    small
                    value={line.quantity}
                    max={Math.min(MAX_QTY, line.product.stock ?? MAX_QTY)}
                    onChange={(n) => cart.setQuantity(line.key, n)}
                    label={`Cantidad de ${line.product.name}`}
                  />
                ) : (
                  <span className="text-sm font-normal text-muted">× {line.quantity}</span>
                )}
                <span className="text-right text-[0.9375rem] font-semibold tabular-nums">
                  {formatPrice(unit * line.quantity)}
                  {line.quantity > 1 && (
                    <span className="block text-xs font-normal text-muted">
                      {formatPrice(unit)} c/u
                    </span>
                  )}
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
