import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MadeToMeasureCard, ShopProductCard } from '@/components/shop/ShopProductCard'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import { getProductCategories, getProducts } from '@/lib/data/catalog'
import { ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'
import { getQuoteCatalog } from '@/lib/quote/catalog'
import { itemPrice, toStoreItem, type StoreItem } from '@/lib/shop/catalog'
import { getShopConfig } from '@/lib/shop/config'
import { COLORS } from '@/lib/shop/options'

type Search = {
  categoria?: string
  color?: string
  min?: string
  max?: string
  orden?: string
  q?: string
  tipo?: string
}

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'online', label: 'Comprar online' },
  { value: 'medida', label: 'A medida' },
] as const
type Props = { searchParams: Promise<Search> }

const SORTS = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'nombre', label: 'Nombre A-Z' },
  { value: 'menor', label: 'Menor precio' },
  { value: 'mayor', label: 'Mayor precio' },
] as const

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: ROUTES.shop,
    title: 'Tienda online de aberturas',
    description:
      'Comprá online puertas, ventanas y accesorios de aluminio. Descuento por transferencia, cuotas sin interés con Mercado Pago, retiro en Coronda o envío.',
  })
}

const num = (v: string | undefined) => {
  const n = Number((v ?? '').replace(/\D/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Sin precio (a medida sin tarifa) va al final al ordenar por precio. */
const priceOr = (i: StoreItem, fallback: number) => itemPrice(i) ?? fallback

function sortItems(list: StoreItem[], order: string): StoreItem[] {
  const by = [...list]
  if (order === 'nombre')
    return by.sort((a, b) => a.product.name.localeCompare(b.product.name, 'es'))
  if (order === 'menor') return by.sort((a, b) => priceOr(a, Infinity) - priceOr(b, Infinity))
  if (order === 'mayor') return by.sort((a, b) => priceOr(b, -1) - priceOr(a, -1))
  // Destacados: primero lo que se compra online, después lo destacado.
  return by.sort(
    (a, b) =>
      Number(b.kind === 'buy') - Number(a.kind === 'buy') ||
      Number(b.product.featured) - Number(a.product.featured),
  )
}

/**
 * Tienda: todo el catálogo. Los productos con precio se compran online; los fabricados a
 * medida muestran su precio "desde" y llevan al cotizador. Filtros: tipo, categoría, color,
 * precio, búsqueda y orden.
 */
export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams
  const search = sp.q?.trim().slice(0, 80) || undefined
  const [config, categories, docs, quote] = await Promise.all([
    getShopConfig(),
    getProductCategories(),
    getProducts({ search, limit: 300 }),
    getQuoteCatalog(),
  ])
  if (!config.enabled) notFound()

  const all = docs.flatMap((d) => toStoreItem(d, config.rules, quote) ?? [])
  const usedCategories = categories.filter((c) =>
    all.some((i) => i.product.categorySlug === c.slug),
  )
  const usedColors = COLORS.filter((c) =>
    all.some((i) => i.kind === 'buy' && i.product.colors.some((x) => x.value === c.value)),
  )
  const type = TYPES.some((t) => t.value === sp.tipo) ? (sp.tipo ?? '') : ''

  const category = usedCategories.find((c) => c.slug === sp.categoria) ?? null
  const color = usedColors.find((c) => c.value === sp.color) ?? null
  const min = num(sp.min)
  const max = num(sp.max)
  const order = SORTS.some((s) => s.value === sp.orden) ? sp.orden! : 'destacados'

  const products = sortItems(
    all.filter((i) => {
      const price = itemPrice(i)
      return (
        (!type || (type === 'online') === (i.kind === 'buy')) &&
        (!category || i.product.categorySlug === category.slug) &&
        (!color || (i.kind === 'buy' && i.product.colors.some((c) => c.value === color.value))) &&
        (!min || (price !== null && price >= min)) &&
        (!max || (price !== null && price <= max))
      )
    }),
    order,
  )
  const onlineCount = all.filter((i) => i.kind === 'buy').length

  const hasFilters = Boolean(type || category || color || min || max || search)
  const hrefWith = (patch: Partial<Search>) => {
    const next: Search = { ...sp, ...patch }
    const qs = new URLSearchParams(
      Object.entries(next).filter(([, v]) => v) as [string, string][],
    ).toString()
    return qs ? `${ROUTES.shop}?${qs}` : ROUTES.shop
  }

  const title = search
    ? `Resultados para “${search}”`
    : category
      ? category.name
      : 'Todos los productos'
  const label = 'text-eyebrow tracking-[0.2em] text-muted uppercase'
  const input =
    'h-11 w-full border border-line-strong bg-white px-3 text-sm outline-none focus:border-brand'

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
          placeholder="Puerta, ventana…"
          className={input}
        />
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className={cn(label, 'mb-2.5')}>Tipo de compra</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <label
              key={t.value || 'all'}
              className="flex min-h-10 cursor-pointer items-center border border-line-strong bg-white px-3 text-sm font-normal has-checked:border-ink has-checked:font-medium has-focus-visible:outline-2 has-focus-visible:outline-brand"
            >
              <input
                type="radio"
                name="tipo"
                value={t.value}
                defaultChecked={type === t.value}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2.5">
        <span className={label}>Categoría</span>
        <ul className="flex flex-col text-sm">
          {[
            { slug: undefined as string | undefined, name: 'Todas las categorías', id: 0 },
            ...usedCategories,
          ].map((c) => {
            const active = (c.slug ?? null) === (category?.slug ?? null)
            return (
              <li key={c.id}>
                <Link
                  href={hrefWith({ categoria: c.slug ?? undefined })}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex min-h-10 items-center justify-between border-l-2 pl-3 hover:text-brand',
                    active
                      ? 'border-brand font-medium text-brand'
                      : 'border-transparent font-normal',
                  )}
                >
                  {c.name}
                  {c.slug && (
                    <span className="text-xs text-muted">
                      {all.filter((i) => i.product.categorySlug === c.slug).length}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
        {category && <input type="hidden" name="categoria" value={category.slug ?? ''} />}
      </div>

      {usedColors.length > 0 && (
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

      <fieldset className="flex flex-col gap-2.5">
        <legend className={cn(label, 'mb-2.5')}>Rango de precio</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="shop-min">
            Precio mínimo
          </label>
          <input
            id="shop-min"
            name="min"
            inputMode="numeric"
            defaultValue={min ?? ''}
            placeholder="Mínimo"
            className={input}
          />
          <label className="sr-only" htmlFor="shop-max">
            Precio máximo
          </label>
          <input
            id="shop-max"
            name="max"
            inputMode="numeric"
            defaultValue={max ?? ''}
            placeholder="Máximo"
            className={input}
          />
        </div>
      </fieldset>

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
      {config.announcement && (
        <p className="bg-brand px-4 py-2.5 text-center text-eyebrow tracking-[0.2em] text-white uppercase">
          {config.announcement}
        </p>
      )}
      <section className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-section-sm">
        <div className="container-site flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)]">
          <Breadcrumbs items={[{ name: 'Tienda', path: ROUTES.shop }]} />
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Tienda online</p>
              <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
                {title}
              </h1>
            </div>
            <p className="text-eyebrow tracking-[0.2em] text-muted uppercase" aria-live="polite">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
              {!type && onlineCount > 0 && ` · ${onlineCount} para comprar online`}
            </p>
          </div>

          <div className="grid items-start gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[16.5rem_minmax(0,1fr)]">
            {/* Celular y tablet: filtros plegables. Desktop: columna fija. */}
            <details className="group border border-line-strong bg-white lg:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-label uppercase [&::-webkit-details-marker]:hidden">
                Filtros y orden{hasFilters ? ' · activos' : ''}
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
                {products.map((item, i) => (
                  <li key={item.product.id}>
                    {item.kind === 'buy' ? (
                      <ShopProductCard product={item.product} priority={i < 4} />
                    ) : (
                      <MadeToMeasureCard product={item.product} priority={i < 4} />
                    )}
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

          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-px border border-line bg-line text-sm">
            {[
              [
                `${config.rules.transferDiscount}% off por transferencia`,
                'Pagás menos transfiriendo o en efectivo.',
              ],
              [
                `${config.rules.installments} cuotas sin interés`,
                'Con tarjeta a través de Mercado Pago.',
              ],
              ['Retiro o envío', 'Retirás en Coronda o coordinamos la entrega.'],
              ['¿A medida?', 'Si necesitás otra medida, la cotizamos.'],
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
