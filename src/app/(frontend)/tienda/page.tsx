import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { QuoteSteps } from '@/components/shop/QuoteSteps'
import { MadeToMeasureCard, ShopProductCard } from '@/components/shop/ShopProductCard'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import { getProductCategories, getProducts } from '@/lib/data/catalog'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'
import { getQuoteCatalog } from '@/lib/quote/catalog'
import { categoryIds, storeCategoryTree, toStoreItem, type CategoryNode } from '@/lib/shop/catalog'
import type { ShopProduct } from '@/lib/shop/config'
import { getShopConfig } from '@/lib/shop/config'
import type { MadeToMeasureItem } from '@/lib/shop/catalog'
import { COLORS } from '@/lib/shop/options'

type Search = { categoria?: string; color?: string; orden?: string; q?: string }
type Props = { searchParams: Promise<Search> }

const SORTS = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'nombre', label: 'Nombre A-Z' },
] as const

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [sp, categories] = await Promise.all([searchParams, getProductCategories()])
  const category = categories.find((c) => c.slug === sp.categoria) ?? null
  // Solo la tienda y sus categorías se indexan; búsqueda, color y orden son variantes.
  const filtered = Boolean(sp.q || sp.color || (sp.orden && sp.orden !== 'destacados'))
  const canonicalPath = category ? `${ROUTES.shop}?categoria=${category.slug}` : ROUTES.shop
  return buildMetadata({
    path: ROUTES.shop,
    canonicalPath,
    noIndex: filtered,
    title: category
      ? `${category.name} de aluminio: presupuesto online`
      : 'Presupuesto online de aberturas de aluminio',
    description: category
      ? `${category.name} de aluminio en medidas estándar, blanco o negro. Agregalas al presupuesto, dejá tu WhatsApp y recibí el precio en el acto. ${category.description ?? ''}`
          .trim()
          .slice(0, 158)
      : 'Ventanas, puertas, puertas placa, mamparas y rejas de aluminio. Agregá los productos, dejá tu WhatsApp y recibí el presupuesto automático en el acto.',
  })
}

/**
 * Tienda = presupuesto automático: productos de medida estándar (sin precio a la vista) que
 * se suman al presupuesto. Filtros: categoría y subcategoría, color, búsqueda y orden.
 * Abajo, lo que se fabrica a medida (lleva al cotizador).
 */
export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams
  const search = sp.q?.trim().slice(0, 80) || undefined
  const [config, categories, docs, quoteCatalog] = await Promise.all([
    getShopConfig(),
    getProductCategories(),
    getProducts({ search, limit: 300 }),
    getQuoteCatalog(),
  ])
  if (!config.enabled) notFound()

  const items = docs.flatMap((d) => toStoreItem(d, quoteCatalog) ?? [])
  const all: ShopProduct[] = items.flatMap((i) => (i.kind === 'buy' ? [i.product] : []))
  const madeToMeasure: MadeToMeasureItem[] = items.flatMap((i) =>
    i.kind === 'measure' ? [i.product] : [],
  )
  const tree = storeCategoryTree(categories, all)

  // Categoría activa: principal o subcategoría.
  const activeTop =
    tree.find((c) => c.slug === sp.categoria || c.children.some((s) => s.slug === sp.categoria)) ??
    null
  const activeSub = activeTop?.children.find((s) => s.slug === sp.categoria) ?? null
  const scope = activeSub ? [activeSub.id] : activeTop ? categoryIds(activeTop) : null

  const usedColors = COLORS.filter((c) =>
    all.some((p) => p.colors.some((x) => x.value === c.value)),
  )
  const color = usedColors.find((c) => c.value === sp.color) ?? null
  const order = SORTS.some((s) => s.value === sp.orden) ? sp.orden! : 'destacados'

  const products = all
    .filter(
      (p) =>
        (!scope || (p.categoryId !== null && scope.includes(p.categoryId))) &&
        (!color || p.colors.some((c) => c.value === color.value)),
    )
    .sort((a, b) =>
      order === 'nombre'
        ? a.name.localeCompare(b.name, 'es')
        : Number(b.featured) - Number(a.featured),
    )
  const countIn = (node: CategoryNode | { id: number }) => {
    const ids = categoryIds(node)
    return all.filter((p) => p.categoryId !== null && ids.includes(p.categoryId)).length
  }

  const hasFilters = Boolean(activeTop || color || search || order !== 'destacados')
  const hrefWith = (patch: Partial<Search>) => {
    const next: Search = { ...sp, ...patch }
    const qs = new URLSearchParams(
      Object.entries(next).filter(([, v]) => v) as [string, string][],
    ).toString()
    return qs ? `${ROUTES.shop}?${qs}` : ROUTES.shop
  }

  const title = search
    ? `Resultados para “${search}”`
    : (activeSub?.name ?? activeTop?.name ?? 'Todos los productos')
  const label = 'text-eyebrow tracking-[0.2em] text-muted uppercase'
  const input =
    'h-11 w-full border border-line-strong bg-white px-3 text-sm outline-none focus:border-brand'
  const catLink = (active: boolean, sub = false) =>
    cn(
      'flex min-h-10 items-center justify-between border-l-2 hover:text-brand',
      sub ? 'pl-6 text-[0.8125rem]' : 'pl-3',
      active ? 'border-brand font-medium text-brand' : 'border-transparent font-normal',
    )

  const filters = (
    <form action={ROUTES.shop} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <label htmlFor="shop-q" className={label}>
          Buscar
        </label>
        <input
          id="shop-q"
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Ventana, puerta…"
          className={input}
        />
      </div>

      <nav aria-label="Categorías" className="flex flex-col gap-2.5">
        <span className={label}>Categorías</span>
        <ul className="flex flex-col text-sm">
          <li>
            <Link
              href={hrefWith({ categoria: undefined })}
              aria-current={!activeTop ? 'true' : undefined}
              className={catLink(!activeTop)}
            >
              Todas
              <span className="text-xs text-muted">{all.length}</span>
            </Link>
          </li>
          {tree.map((c) => {
            const open = activeTop?.id === c.id
            return (
              <li key={c.id}>
                <Link
                  href={hrefWith({ categoria: c.slug })}
                  aria-current={open && !activeSub ? 'true' : undefined}
                  className={catLink(open && !activeSub)}
                >
                  {c.name}
                  <span className="text-xs text-muted">{countIn(c)}</span>
                </Link>
                {open && c.children.length > 0 && (
                  <ul className="flex flex-col">
                    {c.children.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={hrefWith({ categoria: s.slug })}
                          aria-current={activeSub?.id === s.id ? 'true' : undefined}
                          className={catLink(activeSub?.id === s.id, true)}
                        >
                          {s.name}
                          <span className="text-xs text-muted">{countIn(s)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        {sp.categoria && activeTop && <input type="hidden" name="categoria" value={sp.categoria} />}
      </nav>

      {usedColors.length > 1 && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className={cn(label, 'mb-2.5')}>Color</legend>
          <div className="flex flex-wrap gap-2">
            {[{ value: '', label: 'Todos', hex: '' }, ...usedColors].map((c) => (
              <label
                key={c.value || 'all'}
                className="flex min-h-10 cursor-pointer items-center gap-2 border border-line-strong bg-white px-3 text-sm font-normal has-checked:border-ink has-checked:font-medium has-focus-visible:outline-2 has-focus-visible:outline-brand"
              >
                <input
                  type="radio"
                  name="color"
                  value={c.value}
                  defaultChecked={(color?.value ?? '') === c.value}
                  className="sr-only"
                />
                {c.hex && (
                  <span
                    aria-hidden="true"
                    className="size-4 rounded-full border border-ink/25"
                    style={{ backgroundColor: c.hex }}
                  />
                )}
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2.5">
        <label htmlFor="shop-order" className={label}>
          Ordenar por
        </label>
        <select id="shop-order" name="orden" defaultValue={order} className={input}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className={cn(buttonVariants({ variant: 'dark', size: 'sm' }), 'justify-center')}
        >
          Aplicar filtros
        </button>
        {hasFilters && (
          <Link
            href={ROUTES.shop}
            className="py-2 text-center text-sm font-normal text-muted underline underline-offset-4 hover:text-brand"
          >
            Limpiar filtros
          </Link>
        )}
      </div>
    </form>
  )

  return (
    <>
      <section className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
        <div className="container-site flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)]">
          <Breadcrumbs
            items={[
              { name: 'Tienda', path: ROUTES.shop },
              ...(activeTop
                ? [{ name: activeTop.name, path: hrefWith({ categoria: activeTop.slug }) }]
                : []),
              ...(activeSub
                ? [{ name: activeSub.name, path: hrefWith({ categoria: activeSub.slug }) }]
                : []),
            ]}
          />
          {!hasFilters && <QuoteSteps current={1} />}

          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Presupuesto online</p>
              <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
                {title}
              </h1>
            </div>
            <p className="text-eyebrow tracking-[0.2em] text-muted uppercase" aria-live="polite">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          {/* Subcategorías de la categoría elegida, a mano también en el celular. */}
          {activeTop && activeTop.children.length > 0 && (
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
              {[{ id: 0, name: 'Todas', slug: activeTop.slug }, ...activeTop.children].map((s) => {
                const active = s.id === 0 ? !activeSub : activeSub?.id === s.id
                return (
                  <li key={s.id} className="shrink-0">
                    <Link
                      href={hrefWith({ categoria: s.slug })}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'flex min-h-10 items-center border px-3.5 text-sm whitespace-nowrap',
                        active
                          ? 'border-ink bg-ink font-medium text-white'
                          : 'border-line-strong bg-white font-normal',
                      )}
                    >
                      {s.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="grid items-start gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[16.5rem_minmax(0,1fr)]">
            {/* Celular y tablet: filtros plegables. Desktop: columna fija. */}
            <details className="group border border-line-strong bg-white lg:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-label uppercase [&::-webkit-details-marker]:hidden">
                Categorías y filtros{hasFilters ? ' · activos' : ''}
                <span
                  aria-hidden="true"
                  className="text-brand transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-line p-4">{filters}</div>
            </details>
            <aside
              aria-label="Filtros"
              className="sticky top-[calc(var(--spacing-header)+1.5rem)] hidden lg:block"
            >
              {filters}
            </aside>

            {products.length ? (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15.5rem),1fr))] gap-3">
                {products.map((product, i) => (
                  <li key={product.id}>
                    <ShopProductCard product={product} priority={i < 4} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-4 border border-line bg-white p-8">
                <p className="text-base font-normal text-muted">
                  No encontramos productos con esos filtros.
                </p>
                <Link
                  href={ROUTES.shop}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Ver todos
                </Link>
              </div>
            )}
          </div>

          {!activeTop && !color && madeToMeasure.length > 0 && (
            <div className="flex flex-col gap-5 border-t border-line pt-[clamp(1.5rem,3vw,2.5rem)]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <p className="eyebrow">¿Otra medida?</p>
                  <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-tight tracking-[-0.02em]">
                    Fabricamos a la medida de tu vano
                  </h2>
                </div>
                <Link
                  href={ROUTES.quote}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Ir al cotizador a medida
                </Link>
              </div>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15.5rem),1fr))] gap-3">
                {madeToMeasure.map((product) => (
                  <li key={product.id}>
                    <MadeToMeasureCard product={product} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-px border border-line bg-line text-sm">
            {[
              ['Presupuesto en el acto', 'Ves el precio apenas dejás tu WhatsApp.'],
              [
                `${config.rules.transferDiscount}% off por transferencia`,
                'Pagando por transferencia o en efectivo.',
              ],
              [`${config.rules.installments} cuotas sin interés`, 'Con tarjeta de crédito.'],
              ['Blanco o negro', 'Medidas estándar según catálogo.'],
            ].map(([t, d]) => (
              <li key={t} className="flex flex-col gap-1 bg-paper p-5">
                <span className="font-medium">{t}</span>
                <span className="font-normal text-muted">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
