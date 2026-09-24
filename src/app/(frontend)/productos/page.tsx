import type { Metadata } from 'next'

import { RenderBlocks, type LayoutBlock } from '@/blocks/RenderBlocks'
import { ProductLineCard } from '@/components/cards/ProductLineCard'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { PageIntro } from '@/components/layout/PageIntro'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { getProductCategories, getProductLines, getProducts } from '@/lib/data/catalog'
import { getArchivePages } from '@/lib/data/globals'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { searchParams: Promise<{ categoria?: string; q?: string }> }

const LINES_TAB = 'lineas'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [{ products: archive }, { categoria }, categories] = await Promise.all([
    getArchivePages(),
    searchParams,
    getProductCategories(),
  ])
  const cat = categories.find((c) => c.slug === categoria)
  const meta = await buildMetadata({
    path: ROUTES.products,
    title: cat ? `${cat.name} de aluminio a medida` : archive?.seo?.title || archive?.title,
    description: cat?.description || archive?.seo?.description || archive?.intro,
    image: archive?.seo?.image ?? archive?.image,
  })
  // Los filtros apuntan su canonical a /productos?categoria=… solo si la categoría existe.
  if (cat) meta.alternates = { canonical: `${ROUTES.products}?categoria=${cat.slug}` }
  return meta
}

/** Catálogo: pestañas por categoría (con URL propia), líneas y grilla de productos. */
export default async function ProductsPage({ searchParams }: Props) {
  const { categoria, q } = await searchParams
  const search = q?.trim().slice(0, 80) || undefined
  const [{ products: archive }, categories, lines] = await Promise.all([
    getArchivePages(),
    getProductCategories(),
    getProductLines(),
  ])

  const activeCategory = categories.find((c) => c.slug === categoria) ?? null
  const showLines = !search && (!categoria || categoria === LINES_TAB)
  const products = await getProducts({ category: activeCategory?.slug, search })

  const tabs = [
    { label: 'Todos', href: ROUTES.products, active: !categoria && !search },
    ...(lines.length
      ? [
          {
            label: 'Líneas',
            href: `${ROUTES.products}?categoria=${LINES_TAB}`,
            active: categoria === LINES_TAB,
          },
        ]
      : []),
    ...categories.map((c) => ({
      label: c.name,
      href: `${ROUTES.products}?categoria=${c.slug}`,
      active: c.slug === categoria,
    })),
  ]

  const listTitle = search
    ? `Resultados para “${search}”`
    : activeCategory
      ? activeCategory.name
      : 'Productos y complementos'

  return (
    <>
      <PageIntro
        breadcrumbs={[{ name: archive?.title || 'Productos', path: ROUTES.products }]}
        eyebrow={archive?.eyebrow}
        title={archive?.title || 'Productos'}
        intro={archive?.intro}
      />

      <section className="bg-paper pb-section-sm">
        <div className="container-site flex flex-col gap-[clamp(1.75rem,3vw,2.75rem)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <FilterTabs tabs={tabs} label="Filtrar productos por categoría" />
            <form
              action={ROUTES.products}
              role="search"
              className="flex items-center gap-2 border-b border-line-strong lg:mb-2 lg:w-64"
            >
              <label htmlFor="product-search" className="sr-only">
                Buscar productos
              </label>
              <input
                id="product-search"
                name="q"
                type="search"
                defaultValue={search}
                placeholder="Buscar…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                className="text-eyebrow tracking-[0.18em] uppercase hover:text-brand"
              >
                Buscar
              </button>
            </form>
          </div>

          {showLines && lines.length > 0 && (
            <div className="flex flex-col gap-[22px]">
              <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.375rem)] leading-[1.05] tracking-[-0.02em]">
                Líneas de aberturas
              </h2>
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] gap-3">
                {lines.map((line, i) => (
                  <li key={line.id}>
                    <ProductLineCard line={line} variant="overlay" priority={i < 3} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {categoria !== LINES_TAB && (
            <div className="flex flex-col gap-[22px]">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.375rem)] leading-[1.05] tracking-[-0.02em]">
                  {listTitle}
                </h2>
                <span
                  className="text-eyebrow tracking-[0.2em] text-muted uppercase"
                  aria-live="polite"
                >
                  {products.length} {products.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              {products.length ? (
                <ProductGrid products={products} priorityCount={showLines ? 0 : 3} />
              ) : (
                <p className="text-sm font-normal text-muted">
                  No encontramos productos. Probá con otra categoría o consultanos directamente.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <RenderBlocks blocks={archive?.after as LayoutBlock[] | undefined} />
    </>
  )
}
