import { CmsLinks } from '@/components/cms/CmsLinks'
import { DoorShape } from '@/components/ui/Brand'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { CmsImage } from '@/components/ui/CmsImage'
import { Section } from '@/components/ui/Section'
import type { HeroBlock as HeroBlockData } from '@/payload-types'
import type { Crumb } from '@/lib/seo/jsonld'

import type { BlockContext } from '../types'

type Props = HeroBlockData & BlockContext

/**
 * Hero en tres diseños:
 * - fullBleed: foto a pantalla completa bajo el header transparente + franja de compromisos.
 * - editorial: título grande + foto panorámica (Nosotros).
 * - intro: título + bajada en dos columnas (listados, contacto, cotizador).
 */
export function HeroBlock({
  variant,
  showBreadcrumbs,
  decoration,
  eyebrow,
  title,
  subtitle,
  image,
  links,
  highlights,
  settings,
  isFirst,
  breadcrumbs,
}: Props) {
  const Heading = isFirst ? 'h1' : 'h2'
  const crumbs: Crumb[] | null = showBreadcrumbs && breadcrumbs?.length ? breadcrumbs : null
  const hasImage = Boolean(image && typeof image === 'object')

  if (variant === 'fullBleed' && hasImage) {
    return (
      <>
        <Section
          settings={settings}
          defaultBackground="dark"
          defaultSpacing="none"
          className="-mt-header flex min-h-[min(92svh,55rem)] overflow-hidden"
        >
          <span data-over-hero hidden />
          <CmsImage media={image} fill priority={isFirst} sizes="100vw" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,rgb(24_25_28/0.82)_0%,rgb(24_25_28/0.4)_58%,rgb(24_25_28/0.06)_100%)]"
          />
          {decoration !== false && (
            <DoorShape
              hollow
              className="-right-[5%] -bottom-[10%] w-[clamp(200px,34vw,520px)] text-brand/80"
            />
          )}
          <div className="relative mx-auto flex w-full max-w-site flex-col justify-end gap-8 px-gutter pt-[11.25rem] pb-[4.5rem]">
            {crumbs && <Breadcrumbs items={crumbs} dark />}
            {eyebrow && (
              <p className="flex items-center gap-4 text-eyebrow tracking-[0.32em] uppercase">
                <span aria-hidden="true" className="h-px w-11 bg-brand" />
                {eyebrow}
              </p>
            )}
            <Heading className="max-w-[17ch] text-display whitespace-pre-line">{title}</Heading>
            {subtitle && (
              <p className="max-w-[46ch] text-lead font-normal text-white/85">{subtitle}</p>
            )}
            <CmsLinks links={links} dark stretch />
          </div>
        </Section>
        {!!highlights?.length && !settings?.hidden && (
          <div className="bg-ink px-gutter text-white">
            <ul className="mx-auto grid max-w-site grid-cols-[repeat(auto-fit,minmax(min(100%,13.75rem),1fr))]">
              {highlights.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start gap-3.5 border-t border-white/12 py-[26px] pr-5"
                >
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 bg-brand" />
                  <span className="flex flex-col gap-1">
                    <span className="text-[0.906rem]">{h.title}</span>
                    {h.text && (
                      <span className="text-[0.8125rem] leading-normal font-normal text-white/70">
                        {h.text}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    )
  }

  if (variant === 'editorial') {
    return (
      <Section
        settings={settings}
        defaultSpacing="none"
        className="pt-[clamp(2.75rem,5vw,5rem)] pb-[clamp(2.5rem,5vw,4.5rem)]"
      >
        <div className="container-site flex flex-col gap-[30px]">
          {crumbs && <Breadcrumbs items={crumbs} />}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <Heading className="max-w-[20ch] text-h1">{title}</Heading>
          {subtitle && <p className="max-w-[46ch] text-lead font-normal text-muted">{subtitle}</p>}
          <CmsLinks links={links} />
          {hasImage && (
            <div className="relative mt-2.5 aspect-[21/9] min-h-[280px] overflow-hidden bg-stone">
              <CmsImage
                media={image}
                fill
                priority={isFirst}
                sizes="(min-width: 1440px) 1296px, 100vw"
              />
              <DoorShape className="bottom-0 left-0 max-h-full w-[22%] text-paper" />
            </div>
          )}
        </div>
      </Section>
    )
  }

  // intro (y cualquier hero sin imagen)
  return (
    <Section
      settings={settings}
      defaultSpacing="none"
      className="pt-[clamp(2.5rem,5vw,5.625rem)] pb-[clamp(1.75rem,4vw,4.375rem)]"
    >
      <div className="container-site flex flex-col gap-7">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] items-end gap-[clamp(1.75rem,4vw,5rem)]">
          <Heading className="max-w-[15ch] text-[clamp(2.375rem,1.3rem+4.4vw,5.5rem)] leading-[0.98] tracking-[-0.03em]">
            {title}
          </Heading>
          {subtitle && (
            <p className="max-w-[44ch] pb-2 text-lead font-normal text-muted">{subtitle}</p>
          )}
        </div>
        <CmsLinks links={links} />
      </div>
    </Section>
  )
}
