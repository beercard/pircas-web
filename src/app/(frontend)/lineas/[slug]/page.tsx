import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FaqList } from '@/blocks/Faq/Component'
import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { TrackView } from '@/components/analytics/TrackView'
import { ProductLineCard } from '@/components/cards/ProductLineCard'
import { RichText } from '@/components/cms/RichText'
import { SpecRows } from '@/components/ui/Accordion'
import { DoorShape } from '@/components/ui/Brand'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { buttonVariants } from '@/components/ui/button-variants'
import { Chips } from '@/components/ui/Chips'
import { CmsImage } from '@/components/ui/CmsImage'
import { Facts } from '@/components/ui/Facts'
import { Gallery } from '@/components/ui/Gallery'
import { getProductLineBySlug, getProductLines } from '@/lib/data/catalog'
import { getSiteSettings } from '@/lib/data/globals'
import { toGalleryImages } from '@/lib/media'
import { pathFor, ROUTES } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/metadata'
import { getWhatsAppConfig, productWhatsAppMessage, whatsappUrl } from '@/lib/whatsapp'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const line = await getProductLineBySlug((await params).slug)
  if (!line) return {}
  return buildMetadata({
    path: pathFor('product-lines', line.slug),
    title: `Línea ${line.name}`,
    description: line.shortDescription,
    image: line.heroImage,
    meta: line.meta,
  })
}

const SHAPES = ['rounded-none', 'rounded-door', 'rounded-full', 'rounded-none'] as const

/** Plantilla de línea: hero, intro + datos, beneficios, técnica + aplicaciones, galería, FAQ y otras líneas. */
export default async function ProductLinePage({ params }: Props) {
  const line = await getProductLineBySlug((await params).slug)
  if (!line) notFound()
  const [site, allLines] = await Promise.all([getSiteSettings(), getProductLines()])
  const others = allLines.filter((l) => l.id !== line.id)
  const wa = whatsappUrl(getWhatsAppConfig(site), productWhatsAppMessage(`la línea ${line.name}`))
  const gallery = toGalleryImages(line.gallery)
  const path = pathFor('product-lines', line.slug)

  return (
    <>
      <TrackView event="product_view" params={{ line: line.name, content_type: 'product_line' }} />

      {/* Hero */}
      <section className="on-dark relative -mt-header flex min-h-[min(78svh,45rem)] overflow-hidden bg-ink text-white">
        <span data-over-hero hidden />
        <CmsImage media={line.heroImage} fill priority sizes="100vw" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(24_25_28/0.85)_0%,rgb(24_25_28/0.45)_60%,rgb(24_25_28/0.1)_100%)]"
        />
        <DoorShape className="-top-[14%] -right-[4%] w-[clamp(180px,26vw,400px)] text-brand/75" />
        <div className="relative mx-auto flex w-full max-w-site flex-col justify-end gap-[26px] px-gutter pt-40 pb-16">
          <Breadcrumbs
            dark
            items={[
              { name: 'Productos', path: ROUTES.products },
              { name: line.name, path },
            ]}
          />
          {line.positioning && <p className="eyebrow">{line.positioning}</p>}
          <h1 className="max-w-[16ch] text-[clamp(2.25rem,1.2rem+4.4vw,5.25rem)] leading-none tracking-[-0.03em]">
            {line.name}
          </h1>
          <p className="max-w-[34ch] text-[clamp(1.0625rem,0.9rem+0.7vw,1.5rem)] leading-[1.4]">
            {line.tagline}
          </p>
          <div className="flex flex-wrap gap-3 pt-1.5">
            <Link
              href={`${ROUTES.quote}?linea=${encodeURIComponent(line.slug)}`}
              className={buttonVariants({ variant: 'primary-on-dark' })}
            >
              Solicitar presupuesto <span aria-hidden="true">→</span>
            </Link>
            {wa && (
              <TrackedAnchor
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                event="whatsapp_click"
                params={{ location: 'line_hero', line: line.name }}
                className={buttonVariants({ variant: 'outline-light' })}
              >
                WhatsApp
              </TrackedAnchor>
            )}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-paper py-section-sm">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-[clamp(2rem,4vw,5rem)]">
          <h2 className="max-w-[22ch] text-[clamp(1.625rem,1.1rem+2vw,3rem)] leading-[1.08] tracking-[-0.025em]">
            {line.introHeadline || line.shortDescription}
          </h2>
          <div className="flex flex-col gap-[18px]">
            <RichText data={line.description} />
            <Facts facts={line.facts} className="mt-2" />
          </div>
        </div>
      </section>

      {/* Beneficios */}
      {!!line.features?.length && (
        <section className="bg-stone py-section-sm">
          <div className="container-site flex flex-col gap-[clamp(1.875rem,4vw,3.5rem)]">
            <h2 className="text-[clamp(1.75rem,1.2rem+2.2vw,3.375rem)] leading-[1.02] tracking-[-0.025em]">
              Beneficios clave
            </h2>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14.375rem),1fr))] gap-px bg-ink/16">
              {line.features.map((f, i) => (
                <li
                  key={f.id}
                  className="flex min-h-[13.125rem] flex-col gap-4 bg-stone px-[26px] py-[30px]"
                >
                  <span
                    aria-hidden="true"
                    className={`size-[26px] border-[1.5px] border-ink ${SHAPES[i % SHAPES.length]}`}
                  />
                  <h3 className="text-[0.78rem] tracking-[0.16em] uppercase">{f.title}</h3>
                  {f.text && (
                    <p className="text-[0.84rem] leading-relaxed font-normal text-muted">
                      {f.text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Técnico + aplicaciones */}
      <section className="bg-paper py-section-sm">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] items-start gap-[clamp(2rem,4vw,5rem)]">
          {!!line.technicalSpecs?.length && (
            <div className="flex flex-col gap-[22px]">
              <h2 className="text-h3">Información técnica</h2>
              <div className="border-t border-ink/16">
                <SpecRows rows={line.technicalSpecs} size="md" />
              </div>
            </div>
          )}
          {(!!line.applications?.length || line.applicationImage) && (
            <div className="flex flex-col gap-[22px]">
              <h2 className="text-h3">Aplicaciones</h2>
              <Chips items={(line.applications ?? []).map((a) => ({ id: a.id, label: a.text }))} />
              {line.applicationImage && typeof line.applicationImage === 'object' && (
                <div className="relative mt-3 aspect-[16/10] overflow-hidden bg-stone">
                  <CmsImage
                    media={line.applicationImage}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Galería */}
      {gallery.length > 0 && (
        <section className="bg-paper pb-section-sm">
          <div className="container-site flex flex-col gap-[22px]">
            <h2 className="text-h3">Galería</h2>
            <Gallery images={gallery} />
          </div>
        </section>
      )}

      {/* FAQ */}
      {!!line.faqs?.length && (
        <section className="bg-stone py-section-sm">
          <FaqList id={`faq-${line.slug}`} title="Preguntas frecuentes" items={line.faqs} />
        </section>
      )}

      {/* Otras líneas */}
      {others.length > 0 && (
        <section className="bg-paper py-section-sm">
          <div className="container-site flex flex-col gap-[26px]">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-h3">Otras líneas</h2>
              <Link href={ROUTES.products} className="link-underline">
                Ver todos los productos <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,17.5rem),1fr))] gap-3">
              {others.map((o) => (
                <li key={o.id}>
                  <ProductLineCard line={o} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
