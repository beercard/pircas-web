import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TrackView } from '@/components/analytics/TrackView'
import { ProductCard } from '@/components/cards/ProductCard'
import { ProductConfigurator } from '@/components/catalog/ProductConfigurator'
import { ProductGallery } from '@/components/catalog/ProductGallery'
import { RichText } from '@/components/cms/RichText'
import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { QuoteBox } from '@/components/shop/AddToQuote'
import { ShopProductCard } from '@/components/shop/ShopProductCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { Accordion, SpecRows } from '@/components/ui/Accordion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Chips } from '@/components/ui/Chips'
import { CmsImage } from '@/components/ui/CmsImage'
import { Facts } from '@/components/ui/Facts'
import { getProductBySlug, getProducts } from '@/lib/data/catalog'
import { getSiteSettings } from '@/lib/data/globals'
import { isPopulated } from '@/lib/data/populated'
import { toGalleryImages } from '@/lib/media'
import { pathFor, ROUTES } from '@/lib/routes'
import { productJsonLd } from '@/lib/seo/jsonld'
import { productSeoDescription, productSeoTitle } from '@/lib/seo/describe'
import { buildMetadata } from '@/lib/seo/metadata'
import { getShopConfig, toShopProduct } from '@/lib/shop/config'
import { getWhatsAppConfig, productWhatsAppMessage, whatsappUrl } from '@/lib/whatsapp'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return {}
  const shopConfig = await getShopConfig()
  const shop = shopConfig.enabled ? toShopProduct(product) : null
  return buildMetadata({
    path: pathFor('products', product.slug),
    title: productSeoTitle(product, shop),
    description: productSeoDescription(product, shop),
    image: product.featuredImage,
    meta: product.meta,
  })
}

/** Agrupa las especificaciones técnicas por "grupo" → un panel desplegable por grupo. */
function specPanels(
  specs: { label: string; value: string; group?: string | null; id?: string | null }[],
) {
  const groups = new Map<string, typeof specs>()
  for (const s of specs) {
    const key = s.group?.trim() || 'Características técnicas'
    groups.set(key, [...(groups.get(key) ?? []), s])
  }
  return [...groups.entries()]
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug)
  if (!product) notFound()

  const [site, shopConfig, related] = await Promise.all([
    getSiteSettings(),
    getShopConfig(),
    getProducts({
      categoryId: isPopulated(product.category) ? product.category.id : undefined,
      excludeId: product.id,
      limit: 4,
    }),
  ])
  const category = isPopulated(product.category) ? product.category : null
  // Producto de medida estándar: se suma al presupuesto online (sin precio a la vista).
  const shopProduct = shopConfig.enabled ? toShopProduct(product, { full: true }) : null
  const waConsult = whatsappUrl(getWhatsAppConfig(site), productWhatsAppMessage(product.name))
  const line = isPopulated(product.line) ? product.line : null
  const path = pathFor('products', product.slug)

  const images = toGalleryImages([product.featuredImage, ...(product.gallery ?? [])])
  const panels = [
    ...specPanels(product.technicalSpecifications ?? []).map(([title, rows]) => ({ title, rows })),
    ...(site.productInfoPanels ?? []).map((p) => ({ title: p.title, rows: p.rows ?? [] })),
  ].filter((p) => p.rows.length)

  const quoteHref = `${ROUTES.quote}?producto=${encodeURIComponent(product.slug)}${line ? `&linea=${encodeURIComponent(line.slug)}` : ''}`
  const hasApplications = Boolean(
    product.applicationsIntro || product.applications?.length || product.applicationImage,
  )
  const crumbs = [
    { name: 'Productos', path: ROUTES.products },
    ...(category
      ? [{ name: category.name, path: pathFor('product-categories', category.slug) }]
      : []),
    { name: product.name, path },
  ]

  return (
    <>
      <TrackView
        event="product_view"
        params={{ product: product.name, category: category?.name, line: line?.name }}
      />
      <JsonLd data={productJsonLd(product, path, site.brandName)} />

      <section className="bg-paper pt-[clamp(2rem,4vw,3.5rem)] pb-[clamp(3.5rem,7vw,6.875rem)]">
        <div className="container-site flex flex-col gap-[clamp(1.75rem,3vw,2.75rem)]">
          <Breadcrumbs items={crumbs} />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,25rem),1fr))] items-start gap-[clamp(1.75rem,3.5vw,4rem)]">
            <ProductGallery images={images} name={product.name} />
            <div className="flex flex-col gap-[22px]">
              {(category || line) && (
                <p className="eyebrow tracking-[0.3em]">
                  {[category?.name, line?.name].filter(Boolean).join(' · ')}
                </p>
              )}
              <h1 className="text-[clamp(2rem,1.3rem+2.8vw,3.75rem)] leading-[1.02] tracking-[-0.03em]">
                {product.name}
              </h1>
              {product.description?.root?.children?.length ? (
                <RichText data={product.description} className="text-base" />
              ) : (
                <p className="max-w-[52ch] text-base leading-[1.7] font-normal text-muted">
                  {product.shortDescription}
                </p>
              )}
              <Facts facts={product.facts} />
              {shopProduct ? (
                <div className="flex flex-col gap-6 border-y border-line py-6">
                  <div className="flex flex-col gap-1.5">
                    {shopProduct.measure && (
                      <p className="text-sm font-normal text-muted">
                        Medida estándar:{' '}
                        <span className="font-medium text-ink">{shopProduct.measure}</span>
                      </p>
                    )}
                    {shopProduct.measureCount > 0 && (
                      <p className="text-sm font-normal text-muted">
                        Disponible en{' '}
                        <span className="font-medium text-ink">
                          {shopProduct.measureCount} medidas estándar
                        </span>
                        . Elegí la tuya:
                      </p>
                    )}
                    <p className="text-sm font-normal text-muted">
                      Agregalo al presupuesto, dejá tu WhatsApp y recibí el precio{' '}
                      <span className="font-medium text-ink">en el acto</span>, con{' '}
                      {shopConfig.rules.transferDiscount}% off por transferencia o{' '}
                      {shopConfig.rules.installments} cuotas sin interés.
                    </p>
                  </div>
                  <QuoteBox product={shopProduct} />
                  <p className="text-sm font-normal text-muted">
                    ¿Necesitás otra medida?{' '}
                    <a
                      href={quoteHref}
                      className="text-ink underline underline-offset-4 hover:text-brand"
                    >
                      Pedí un presupuesto a medida
                    </a>
                    {waConsult && (
                      <>
                        {' '}
                        o{' '}
                        <TrackedAnchor
                          href={waConsult}
                          target="_blank"
                          rel="noopener noreferrer"
                          event="whatsapp_click"
                          params={{ location: 'product_shop' }}
                          className="text-ink underline underline-offset-4 hover:text-brand"
                        >
                          consultanos por WhatsApp
                        </TrackedAnchor>
                      </>
                    )}
                    .
                  </p>
                </div>
              ) : (
                <ProductConfigurator
                  configurations={(product.configurations ?? []).map((c) => c.text)}
                  whatsappNumber={getWhatsAppConfig(site).number}
                  productName={product.name}
                  quoteHref={quoteHref}
                />
              )}
              {panels.length > 0 && (
                <Accordion
                  name="product-specs"
                  className="mt-2.5"
                  items={panels.map((p, i) => ({
                    id: `${i}-${p.title}`,
                    title: p.title,
                    content: <SpecRows rows={p.rows} />,
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {hasApplications && (
        <section className="bg-stone py-[clamp(3.25rem,6vw,6.875rem)]">
          <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-center gap-[clamp(1.875rem,4vw,4.375rem)]">
            <div className="flex flex-col gap-5">
              <h2 className="text-h3">Dónde funciona mejor</h2>
              {product.applicationsIntro && (
                <p className="max-w-[48ch] text-[0.97rem] leading-[1.7] font-normal text-muted">
                  {product.applicationsIntro}
                </p>
              )}
              <Chips
                items={(product.applications ?? []).map((a) => ({ id: a.id, label: a.text }))}
              />
            </div>
            {product.applicationImage && typeof product.applicationImage === 'object' && (
              <div className="relative aspect-[16/11] overflow-hidden">
                <CmsImage
                  media={product.applicationImage}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-paper py-[clamp(3.25rem,6vw,6.875rem)]">
          <div className="container-site flex flex-col gap-[26px]">
            <h2 className="text-h3">Productos relacionados</h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15.625rem),1fr))] gap-3">
              {related.map((p) => {
                const sp = shopConfig.enabled ? toShopProduct(p) : null
                return (
                  <li key={p.id}>
                    {sp ? (
                      <ShopProductCard product={sp} />
                    ) : (
                      <ProductCard product={p} showDescription={false} />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
