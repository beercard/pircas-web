import { CmsLinks } from '@/components/cms/CmsLinks'
import { RichText } from '@/components/cms/RichText'
import { DoorShape } from '@/components/ui/Brand'
import { CmsImage } from '@/components/ui/CmsImage'
import { Facts } from '@/components/ui/Facts'
import { Section, isDark } from '@/components/ui/Section'
import type { TextImageBlock as TextImageBlockData } from '@/payload-types'
import { cn } from '@/lib/cn'

/**
 * Texto + imagen.
 * - bleed: la foto ocupa media pantalla hasta el borde (Mamparas / Nosotros de la home).
 * - contained: dentro del contenedor.
 */
export function TextImageBlock(props: TextImageBlockData) {
  const {
    variant,
    eyebrow,
    title,
    intro,
    content,
    tags,
    bullets,
    facts,
    image,
    imagePosition,
    decoration,
    links,
    settings,
  } = props
  const dark = isDark(settings)
  const imageRight = imagePosition === 'right'
  const tone = settings?.background === 'muted' ? 'stone' : dark ? 'ink' : 'paper'

  const text = (
    <div className="flex flex-col gap-6">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && (
        <h2 className="max-w-[18ch] text-[clamp(1.875rem,1.2rem+2.8vw,3.625rem)] leading-[1.02] tracking-[-0.025em]">
          {title}
        </h2>
      )}
      {intro && (
        <p className="max-w-[46ch] text-[0.97rem] leading-[1.7] font-normal text-muted in-[.on-dark]:text-white/70">
          {intro}
        </p>
      )}
      <RichText data={content} />
      {!!tags?.length && (
        <ul className="flex flex-wrap border-y border-line-strong">
          {tags.map((t, i) => (
            <li
              key={t.id}
              className={cn(
                'py-4 text-label tracking-[0.2em] uppercase',
                i === 0 ? 'pr-6' : 'border-l border-line-strong px-6',
              )}
            >
              {t.text}
            </li>
          ))}
        </ul>
      )}
      {!!bullets?.length && (
        <ul className="dash-list flex flex-col gap-2 text-[0.84rem] leading-normal font-normal text-muted">
          {bullets.map((b) => (
            <li key={b.id}>{b.text}</li>
          ))}
        </ul>
      )}
      <Facts facts={facts} tone={tone} />
      <CmsLinks links={links} dark={dark} size="md" />
    </div>
  )

  if (variant === 'contained') {
    return (
      <Section settings={settings}>
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] items-center gap-[clamp(2rem,4vw,5rem)]">
          <div className={cn(imageRight ? 'order-1' : 'order-2')}>{text}</div>
          <div
            className={cn(
              'relative aspect-[16/10] overflow-hidden bg-stone',
              imageRight ? 'order-2' : 'order-1',
            )}
          >
            <CmsImage media={image} fill sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      settings={settings}
      defaultBackground="muted"
      defaultSpacing="none"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,26.25rem),1fr))]"
    >
      <div
        className={cn(
          'relative min-h-[27.5rem] overflow-hidden bg-stone',
          imageRight ? 'md:order-2' : 'md:order-1',
        )}
      >
        <CmsImage media={image} fill sizes="(min-width: 840px) 50vw, 100vw" />
        {decoration && (
          <DoorShape
            mirrored
            className={cn(
              '-right-px -bottom-px w-[34%]',
              settings?.background === 'dark'
                ? 'text-ink'
                : settings?.background === 'default'
                  ? 'text-paper'
                  : 'text-stone',
            )}
          />
        )}
      </div>
      <div
        className={cn(
          'flex flex-col justify-center px-gutter py-[clamp(3.25rem,7vw,7.5rem)]',
          imageRight ? 'md:order-1' : 'md:order-2',
        )}
      >
        {text}
      </div>
    </Section>
  )
}
