import { Icon } from '@/components/ui/Icon'
import { Section, isDark } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { BenefitsBlock as BenefitsBlockData } from '@/payload-types'
import { cn } from '@/lib/cn'

/** Formas de marca que se alternan como marcador: cuadrado, puerta y círculo. */
const SHAPES = ['rounded-none', 'rounded-door', 'rounded-full'] as const

export function BenefitsBlock({
  variant,
  eyebrow,
  title,
  intro,
  marker,
  items,
  settings,
}: BenefitsBlockData) {
  const dark = isDark(settings)
  const cellBg =
    settings?.background === 'muted'
      ? 'bg-stone'
      : dark
        ? settings?.background === 'brand'
          ? 'bg-brand'
          : 'bg-ink'
        : 'bg-paper'
  const bordered = variant === 'bordered'

  return (
    <Section settings={settings} defaultSpacing="sm">
      <div className="container-site flex flex-col gap-[clamp(1.75rem,3.5vw,3.5rem)]">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        <ul
          className={cn(
            'grid grid-cols-[repeat(auto-fit,minmax(min(100%,14.375rem),1fr))] gap-px',
            dark ? 'bg-white/14' : 'bg-line',
            bordered && (dark ? 'border border-white/14' : 'border border-line'),
          )}
        >
          {(items ?? []).map((item, i) => (
            <li
              key={item.id}
              className={cn(
                'flex flex-col',
                cellBg,
                bordered
                  ? 'min-h-[11.25rem] gap-3 px-6 py-7'
                  : 'min-h-[13.125rem] gap-4 px-[26px] py-[30px]',
              )}
            >
              {!bordered &&
                marker !== 'none' &&
                (marker === 'icon' ? (
                  <Icon
                    name={item.icon}
                    className={cn('size-[26px]', dark ? 'text-white' : 'text-ink')}
                    strokeWidth={1.5}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-[26px] border-[1.5px]',
                      dark ? 'border-white' : 'border-ink',
                      SHAPES[i % SHAPES.length],
                    )}
                  />
                ))}
              <h3 className="text-[0.78rem] leading-normal tracking-[0.16em] uppercase">
                {item.title}
              </h3>
              {item.text && (
                <p
                  className={cn(
                    'text-[0.84rem] leading-relaxed font-normal',
                    dark ? 'text-white/70' : 'text-muted',
                  )}
                >
                  {item.text}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
