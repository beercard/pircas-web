import { ProductCard, ProductFeatureCard } from '@/components/cards/ProductCard'
import type { Product } from '@/payload-types'

export function ProductGrid({
  products,
  variant = 'cards',
  priorityCount = 0,
}: {
  products: Product[]
  variant?: 'cards' | 'feature'
  priorityCount?: number
}) {
  if (variant === 'feature') {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,25rem),1fr))] gap-3">
        {products.map((p, i) => (
          <ProductFeatureCard key={p.id} product={p} index={i} />
        ))}
      </div>
    )
  }
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16.25rem),1fr))] gap-3">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  )
}
