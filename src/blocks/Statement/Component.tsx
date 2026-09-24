import { CmsLink } from '@/components/cms/CmsLink'
import { RichText } from '@/components/cms/RichText'
import { Section, isDark } from '@/components/ui/Section'
import type { StatementBlock as StatementBlockData } from '@/payload-types'
import type { CmsLink as CmsLinkData } from '@/lib/links'

/**
 * Frase de marca.
 * - stacked: "Medimos. / Fabricamos. / Colocamos." (última línea en terracota) + texto y enlace.
 * - split: antetítulo + frase a la izquierda, texto a la derecha (Nosotros).
 */
export function StatementBlock({
  variant,
  eyebrow,
  text,
  accentLastLine,
  body,
  link,
  settings,
}: StatementBlockData) {
  const dark = isDark(settings)
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (variant === 'split') {
    return (
      <Section settings={settings} defaultSpacing="sm">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-[clamp(1.875rem,4vw,5rem)]">
          <div className="flex flex-col gap-5">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <p className="max-w-[34ch] text-[clamp(1.1875rem,0.9rem+1.2vw,1.875rem)] leading-[1.45] tracking-[-0.015em]">
              {text}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <RichText data={body} />
            {link?.label && (
              <CmsLink link={{ ...(link as CmsLinkData), appearance: 'link' }} dark={dark} arrow />
            )}
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section settings={settings} defaultSpacing="lg">
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-end gap-[clamp(2.25rem,5vw,5.625rem)]">
        <h2 className="text-[clamp(2.5rem,1.2rem+5.2vw,6rem)] leading-[0.98] tracking-[-0.035em]">
          {eyebrow && <span className="sr-only">{eyebrow}: </span>}
          {lines.map((line, i) => (
            <span
              key={i}
              className={
                i === lines.length - 1 && accentLastLine !== false ? 'block text-brand' : 'block'
              }
            >
              {line}
            </span>
          ))}
        </h2>
        <div className="flex flex-col gap-[26px] pb-2.5">
          <RichText data={body} className="max-w-[46ch] text-lead" />
          {link?.label && (
            <CmsLink link={{ ...(link as CmsLinkData), appearance: 'link' }} dark={dark} arrow />
          )}
        </div>
      </div>
    </Section>
  )
}
