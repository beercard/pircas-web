import Link from 'next/link'

import { CmsImage } from '@/components/ui/CmsImage'
import type { ProductCategory } from '@/payload-types'
import { pathFor, ROUTES } from '@/lib/routes'

/** Mosaico cuadrado de categoría con la etiqueta en una pestaña (esquina redondeada). */
export function CategoryCard({ category }: { category: ProductCategory }) {
  const href =
    category.slug === 'mamparas' ? ROUTES.mamparas : pathFor('product-categories', category.slug)
  return (
    <Link
      href={href}
      className="group relative block aspect-square overflow-hidden bg-stone hover:text-ink"
    >
      <CmsImage
        media={category.image}
        fill
        sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
        className="transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <span className="absolute bottom-0 left-0 rounded-tr-full bg-paper py-3.5 pr-[26px] pl-[18px] text-eyebrow tracking-[0.2em] uppercase">
        {category.name}
      </span>
    </Link>
  )
}
