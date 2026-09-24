import { CmsLinks } from '@/components/cms/CmsLinks'
import { DoorShape } from '@/components/ui/Brand'
import { CmsImage } from '@/components/ui/CmsImage'
import { Section, isDark } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ProcessBlock as ProcessBlockData } from '@/payload-types'
import { cn } from '@/lib/cn'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Pasos / pilares:
 * - timeline: línea horizontal con punto terracota y número (Así trabajamos).
 * - pillars: igual pero sin números y con títulos más grandes (Lo que prometemos).
 * - split: texto (+ imagen) a la izquierda y lista numerada a la derecha (Cotizador, Medición).
 */
export function ProcessBlock({
  variant,
  eyebrow,
  title,
  intro,
  body,
  image,
  steps,
  links,
  decoration,
  settings,
}: ProcessBlockData) {
  const dark = isDark(settings)
  const list = steps ?? []

  if (variant === 'split') {
    return (
      <Section settings={settings}>
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-[clamp(2.25rem,5vw,5.625rem)]">
          <div className="flex flex-col gap-[22px]">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="max-w-[20ch] text-h2">{title}</h2>}
            {(body || intro) && (
              <p className="max-w-[44ch] text-[0.97rem] leading-[1.65] font-normal text-muted in-[.on-dark]:text-white/70">
                {body || intro}
              </p>
            )}
            <CmsLinks links={links} dark={dark} size="lg" />
            {image && typeof image === 'object' && (
              <div className="relative mt-1.5 aspect-[16/10] overflow-hidden bg-stone">
                <CmsImage media={image} fill sizes="(min-width: 1024px) 45vw, 100vw" />
              </div>
            )}
          </div>
          <ol className={cn('flex flex-col border-t', dark ? 'border-white/20' : 'border-line')}>
            {list.map((step, i) => (
              <li
                key={step.id}
                className={cn(
                  'flex items-baseline gap-5 py-[18px]',
                  i < list.length - 1 &&
                    (dark ? 'border-b border-white/16' : 'border-b border-line'),
                )}
              >
                <span className="shrink-0 text-eyebrow tracking-[0.3em] text-brand in-[.bg-stone]:text-brand-ink">
                  {pad(i + 1)}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span
                    className={
                      step.text
                        ? 'text-[clamp(1rem,0.9rem+0.4vw,1.25rem)] tracking-[-0.01em]'
                        : 'text-[0.94rem]'
                    }
                  >
                    {step.title}
                  </span>
                  {step.text && (
                    <span className="max-w-[46ch] text-sm leading-relaxed font-normal text-muted in-[.on-dark]:text-white/65">
                      {step.text}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    )
  }

  const pillars = variant === 'pillars'
  return (
    <Section settings={settings} defaultBackground="dark" className="overflow-hidden">
      {decoration !== false && (
        <DoorShape
          className={cn(
            '-top-12 -right-[110px] w-[400px]',
            dark ? 'text-white/[0.03]' : 'text-ink/[0.04]',
          )}
        />
      )}
      <div className="container-site relative flex flex-col gap-[clamp(2.5rem,5vw,5rem)]">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,11.875rem),1fr))] gap-y-10">
          {list.map((step, i) => (
            <li
              key={step.id}
              className={cn(
                'relative flex flex-col gap-3.5 border-t pt-[26px] pr-[22px]',
                dark ? 'border-white/20' : 'border-line-strong',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute -top-1 left-0 size-[7px] rounded-full bg-brand"
              />
              {!pillars && (
                <span className="text-eyebrow tracking-[0.3em] text-brand-soft in-[.bg-paper]:text-brand in-[.bg-stone]:text-brand-ink">
                  {pad(i + 1)}
                </span>
              )}
              <h3
                className={
                  pillars
                    ? 'text-[clamp(1.0625rem,0.9rem+0.6vw,1.4375rem)] tracking-[-0.01em]'
                    : 'text-[0.84rem] leading-normal tracking-[0.14em] uppercase'
                }
              >
                {!pillars && <span className="sr-only">Paso {i + 1}: </span>}
                {step.title}
              </h3>
              {step.text && (
                <p
                  className={cn(
                    'text-[0.84rem] leading-relaxed font-normal',
                    dark ? 'text-white/65' : 'text-muted',
                  )}
                >
                  {step.text}
                </p>
              )}
            </li>
          ))}
        </ol>
        <CmsLinks links={links} dark={dark} size="md" />
      </div>
    </Section>
  )
}
