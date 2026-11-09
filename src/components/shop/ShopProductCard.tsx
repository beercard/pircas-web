import Image from 'next/image'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import type { MadeToMeasureItem } from '@/lib/shop/catalog'
import type { ShopProduct } from '@/lib/shop/config'
import { formatPrice } from '@/lib/shop/pricing'
import { pathFor } from '@/lib/routes'

import { QuickAddButton } from './AddToCart'
import { PriceBadges, PriceBlock } from './Price'

/** Tarjeta de la tienda: foto, descuento, precios por medio de pago y botón Agregar. */
export function ShopProductCard({
  product,
  priority,
}: {
  product: ShopProduct
  priority?: boolean
}) {
  const href = pathFor('products', product.slug)
  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-white transition-[border-color,box-shadow] duration-300 hover:border-ink/40 hover:shadow-float">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-stone"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.image && (
          <Image
            src={product.image.url}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <PriceBadges price={product.price} featured={product.featured} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-4 sm:px-5">
        {product.category && (
          <p className="text-[0.656rem] tracking-[0.24em] text-muted uppercase">
            {product.category}
          </p>
        )}
        <h3 className="text-[1.0625rem] leading-snug tracking-[-0.01em]">
          <Link href={href} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        {(product.measure || product.colors.length > 0) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-normal text-muted">
            {product.measure && <span>{product.measure}</span>}
            {product.colors.length > 0 && (
              <span
                className="flex items-center gap-1.5"
                aria-label={`Colores: ${product.colors.map((c) => c.label).join(', ')}`}
              >
                {product.colors.map((c) => (
                  <span
                    key={c.value}
                    aria-hidden="true"
                    className="size-3.5 rounded-full border border-ink/25"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </span>
            )}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-4 pt-1">
          <PriceBlock price={product.price} />
          <QuickAddButton product={product} />
        </div>
      </div>
    </article>
  )
}

/** Tarjeta de un producto a medida: precio estimado "desde" y acceso al cotizador. */
export function MadeToMeasureCard({
  product,
  priority,
}: {
  product: MadeToMeasureItem
  priority?: boolean
}) {
  const href = pathFor('products', product.slug)
  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-white transition-[border-color,box-shadow] duration-300 hover:border-ink/40 hover:shadow-float">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-stone"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.image && (
          <Image
            src={product.image.url}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span className="pointer-events-none absolute top-0 left-0 p-2.5">
          <span className="bg-ink px-2.5 py-1 text-[0.625rem] tracking-[0.16em] text-white uppercase">
            A medida
          </span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-4 sm:px-5">
        {product.category && (
          <p className="text-[0.656rem] tracking-[0.24em] text-muted uppercase">
            {product.category}
          </p>
        )}
        <h3 className="text-[1.0625rem] leading-snug tracking-[-0.01em]">
          <Link href={href} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs font-normal text-muted">Fabricado a la medida de tu vano</p>
        <div className="mt-auto flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1">
            {product.fromPrice ? (
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-xs font-normal text-muted">desde</span>
                <span className="text-[1.375rem] leading-tight font-semibold tracking-[-0.02em]">
                  {formatPrice(product.fromPrice)}
                </span>
              </p>
            ) : (
              <p className="text-[1.0625rem] font-medium">Precio según medida</p>
            )}
            <p className="text-[0.8125rem] font-normal text-muted">
              {product.quotable ? 'Cotizá online al instante' : 'Te lo cotizamos sin cargo'}
            </p>
          </div>
          <Link
            href={product.quotable ? product.quoteHref : href}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'w-full justify-center',
            )}
          >
            {product.quotable ? 'Cotizar a medida' : 'Consultar'}
          </Link>
        </div>
      </div>
    </article>
  )
}
