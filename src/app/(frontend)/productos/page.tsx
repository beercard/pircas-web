import { Search } from 'lucide-react'
import type { Metadata } from 'next'

import { RenderBlocks, type LayoutBlock } from '@/blocks/RenderBlocks'
import { ProductLineCard } from '@/components/cards/ProductLineCard'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { PageIntro } from '@/components/layout/PageIntro'
import { FilterTabs } from '@/components/ui/FilterTabs'
import {
  getProductCategories,
  getProductLines,
  getProducts,
  parentCategoryId,
} from '@/lib/data/catalog'
import { getArchivePages } from '@/lib/data/globals'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { searchParams: Promise<{ categoria?: string; q?: string }> }

const LINES_TAB = 'lineas'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [{ products: archive }, { categoria, q }, categories] = await Promise.all([
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
  // Resultados de búsqueda: no se indexan (contenido duplicado y sin fin).
  if (q) meta.robots = { index: false, follow: true }
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

  // Pestañas: solo categorías principales; cada una incluye sus subcategorías.
  const topLevel = categories.filter((c) => parentCategoryId(c) === null)
  const activeCategory = categories.find((c) => c.slug === categoria) ?? null
  const showLines = !search && (!categoria || categoria === LINES_TAB)
  const products = await getProducts({
    categoryIds: activeCategory
      ? [
          activeCategory.id,
          ...categories.filter((c) => parentCategoryId(c) === activeCategory.id).map((c) => c.id),
        ]
      : undefined,
    search,
  })

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
    ...topLevel.map((c) => ({
      label: c.name,
      href: `${ROUTES.products}?categoria=${c.slug}`,
      active:
        c.slug === categoria ||
        (activeCategory !== null && parentCategoryId(activeCategory) === c.id),
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
          {/* Barra de filtros: título + buscador arriba, categorías debajo a todo el ancho. */}
          <div className="flex flex-col gap-5 border-y border-line py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-eyebrow tracking-[0.2em] text-muted uppercase">
                Filtrar por categoría
              </p>
              <form
                action={ROUTES.products}
                role="search"
                className="flex h-11 w-full items-center border border-line-strong bg-white focus-within:border-brand md:w-80"
              >
                <label htmlFor="product-search" className="sr-only">
                  Buscar productos
                </label>
                <Search aria-hidden="true" className="ml-3.5 size-4 shrink-0 text-muted" />
                <input
                  id="product-search"
                  name="q"
                  type="search"
                  defaultValue={search}
                  placeholder="Buscar un producto…"
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  className="h-full shrink-0 border-l border-line-strong px-4 text-[0.6875rem] tracking-[0.16em] uppercase hover:bg-ink hover:text-white"
                >
                  Buscar
                </button>
              </form>
            </div>
            <FilterTabs tabs={tabs} label="Filtrar productos por categoría" variant="chips" />
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
