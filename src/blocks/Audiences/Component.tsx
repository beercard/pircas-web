import { CmsLink } from '@/components/cms/CmsLink'
import { DoorShape } from '@/components/ui/Brand'
import { CmsImage } from '@/components/ui/CmsImage'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { AudiencesBlock as AudiencesBlockData } from '@/payload-types'
import { cn } from '@/lib/cn'
import type { CmsLink as CmsLinkData } from '@/lib/links'

/**
 * "Para quién": los dos ambientes del sitio (casas / obras y profesionales), lado a lado.
 * Cada tarjeta lleva a su página; el estilo oscuro diferencia al público profesional.
 */
export function AudiencesBlock({ eyebrow, title, intro, items, settings }: AudiencesBlockData) {
  if (!items?.length) return null

  return (
    <Section settings={settings}>
      <div className="container-site flex flex-col gap-[clamp(2rem,4vw,3.25rem)]">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,26rem),1fr))] gap-[clamp(1rem,2vw,1.75rem)]">
          {items.map((item) => {
            const dark = item.tone === 'dark'
            return (
              <article
                key={item.id}
                className={cn(
                  'relative flex flex-col overflow-hidden',
                  dark ? 'on-dark bg-ink text-white' : 'bg-stone text-ink',
                )}
              >
                {item.image && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <CmsImage media={item.image} fill sizes="(min-width: 900px) 45vw, 100vw" />
                  </div>
                )}
                <div className="relative flex flex-1 flex-col gap-5 p-[clamp(1.5rem,3vw,2.75rem)]">
                  <DoorShape
                    className={cn(
                      '-right-10 -bottom-16 w-[clamp(120px,14vw,190px)]',
                      dark ? 'text-white/6' : 'text-ink/5',
                    )}
                  />
                  {item.audience && <p className="eyebrow relative">{item.audience}</p>}
                  <h3 className="relative max-w-[16ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.05] tracking-[-0.025em]">
                    {item.title}
                  </h3>
                  {item.text && (
                    <p
                      className={cn(
                        'relative max-w-[44ch] text-[0.97rem] leading-[1.7] font-normal',
                        dark ? 'text-white/72' : 'text-muted',
                      )}
                    >
                      {item.text}
                    </p>
                  )}
                  {!!item.bullets?.length && (
                    <ul
                      className={cn(
                        'dash-list relative flex flex-col gap-2 text-[0.875rem] leading-normal font-normal',
                        dark ? 'text-white/80' : 'text-ink/80',
                      )}
                    >
                      {item.bullets.map((b) => (
                        <li key={b.id}>{b.text}</li>
                      ))}
                    </ul>
                  )}
                  {item.link?.label && (
                    <div className="relative mt-auto pt-3">
                      <CmsLink
                        link={item.link as CmsLinkData}
                        variant={dark ? 'primary-on-dark' : 'dark'}
                        dark={dark}
                        arrow
                      />
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
