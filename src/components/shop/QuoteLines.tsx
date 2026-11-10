'use client'

import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import { variantText } from '@/lib/shop/options'
import { pathFor } from '@/lib/routes'

import { AccessoryPicker, ColorPicker, QuantityStepper } from './AddToQuote'
import { quote, type QuoteLine } from './quote-store'

/** Líneas del presupuesto (cajón lateral y página del presupuesto). Sin precios. */
export function QuoteLines({
  lines,
  compact,
  onNavigate,
}: {
  lines: QuoteLine[]
  compact?: boolean
  onNavigate?: () => void
}) {
  return (
    <ul className="flex flex-col divide-y divide-line">
      {lines.map((line) => {
        const href = pathFor('products', line.product.slug)
        const summary = variantText(
          compact ? line.color : null,
          compact ? line.accessories : [],
          line.product.measure,
        )
        return (
          <li key={line.key} className={cn('flex gap-3.5', compact ? 'py-3.5' : 'py-5')}>
            <Link
              href={href}
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
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="text-[0.9375rem] leading-snug font-medium hover:text-brand"
                  >
                    {line.product.name}
                  </Link>
                  {summary && <p className="text-xs font-normal text-muted">{summary}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => quote.remove(line.key)}
                  className="-mt-1.5 -mr-2 flex size-9 shrink-0 items-center justify-center text-muted hover:text-danger"
                  aria-label={`Quitar ${line.product.name} del presupuesto`}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
              {!compact && (
                <div className="flex flex-col gap-3">
                  <ColorPicker
                    small
                    name={`color-${line.key}`}
                    product={line.product}
                    value={line.color}
                    onChange={(color) => quote.update(line.key, { color })}
                  />
                  <AccessoryPicker
                    small
                    product={line.product}
                    value={line.accessories}
                    onChange={(accessories) => quote.update(line.key, { accessories })}
                  />
                </div>
              )}
              <div className="mt-auto pt-1">
                <QuantityStepper
                  small
                  value={line.quantity}
                  onChange={(n) => quote.setQuantity(line.key, n)}
                  label={`Cantidad de ${line.product.name}`}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
