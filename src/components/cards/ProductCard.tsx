import Link from 'next/link'

import { CmsImage } from '@/components/ui/CmsImage'
import type { Product } from '@/payload-types'
import { isPopulated } from '@/lib/data/populated'
import { pathFor, ROUTES } from '@/lib/routes'

/** Tarjeta de producto del catálogo (fondo blanco, borde fino). */
export function ProductCard({
  product,
  priority,
  showDescription = true,
}: {
  product: Product
  priority?: boolean
  showDescription?: boolean
}) {
  const category = isPopulated(product.category) ? product.category.name : null
  return (
    <Link
      href={pathFor('products', product.slug)}
      className="group flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-ink hover:text-ink"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-stone">
        <CmsImage
          media={product.featuredImage}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 340px, (min-width: 640px) 45vw, 100vw"
        />
      </span>
      <span className="flex flex-1 flex-col gap-2.5 px-5 pt-[22px] pb-6">
        {category && (
          <span className="text-[0.656rem] tracking-[0.24em] text-muted uppercase">{category}</span>
        )}
        <h3 className="text-lg leading-tight tracking-[-0.01em]">{product.name}</h3>
        {showDescription && (
          <span className="text-[0.84rem] leading-normal font-normal text-muted">
            {product.shortDescription}
          </span>
        )}
        <span className="mt-auto flex items-center justify-between pt-[18px] text-[0.72rem] tracking-[0.18em] uppercase">
          Ver detalle{' '}
          <span aria-hidden="true" className="text-base text-brand">
            →
          </span>
        </span>
      </span>
    </Link>
  )
}

/** Tarjeta grande con ventajas (ej: "Dos soluciones" de Mamparas). */
export function ProductFeatureCard({ product, index }: { product: Product; index: number }) {
  return (
    <article className="flex flex-col bg-stone">
      <div className="relative aspect-[5/4] overflow-hidden">
        <CmsImage media={product.featuredImage} fill sizes="(min-width: 840px) 50vw, 100vw" />
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 flex h-14 w-[92px] items-center justify-center bg-ink"
        >
          {index % 2 === 0 ? (
            <span className="h-0.5 w-11 bg-white" />
          ) : (
            <span className="size-[26px] border-b-2 border-l-2 border-white" />
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 px-[clamp(1.25rem,3vw,2.375rem)] pt-[30px] pb-9">
        {product.audience && (
          <p className="text-eyebrow tracking-[0.3em] text-muted uppercase">{product.audience}</p>
        )}
        <h3 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-[1.05] tracking-[-0.02em]">
          <Link href={pathFor('products', product.slug)} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="text-[0.906rem] leading-[1.65] font-normal text-muted">
          {product.shortDescription}
        </p>
        {!!product.benefits?.length && (
          <ul className="dash-list mt-1.5 flex flex-col gap-2 text-[0.84rem] leading-normal font-normal">
            {product.benefits.map((b) => (
              <li key={b.id}>{b.text}</li>
            ))}
          </ul>
        )}
        <Link
          href={`${ROUTES.quote}?producto=${encodeURIComponent(product.slug)}`}
          className="mt-auto self-start pt-[22px] text-label tracking-[0.18em] uppercase hover:text-brand"
        >
          Cotizar {product.name.toLowerCase().replace(/^mampara\s+/, '')}{' '}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
