import Link from 'next/link'

import { CmsLink } from '@/components/cms/CmsLink'
import { Section, isDark } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { DocumentsBlock as DocumentsBlockData } from '@/payload-types'
import { cn } from '@/lib/cn'
import { getProductLines } from '@/lib/data/catalog'
import type { CmsLink as CmsLinkData } from '@/lib/links'
import { fileUrl } from '@/lib/media'
import { pathFor } from '@/lib/routes'

type Row = {
  key: string
  title: string
  description?: string | null
  href?: string | null
  download?: string | null
}

/** Documentación técnica para profesionales: líneas (ficha + PDF) y archivos sueltos. */
export async function DocumentsBlock({
  eyebrow,
  title,
  intro,
  showLines,
  files,
  note,
  cta,
  settings,
}: DocumentsBlockData) {
  const lines = showLines !== false ? await getProductLines() : []
  const rows: Row[] = [
    ...lines.map((l) => ({
      key: `line-${l.id}`,
      title: `Línea ${l.name}`,
      description: l.positioning || l.tagline,
      href: `${pathFor('product-lines', l.slug)}#ficha-tecnica`,
      download: fileUrl(l.datasheetFile),
    })),
    ...(files ?? []).map((f) => ({
      key: `file-${f.id}`,
      title: f.title,
      description: f.description,
      download: fileUrl(f.file),
    })),
  ]
  const dark = isDark(settings)

  return (
    <Section settings={settings}>
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] items-start gap-[clamp(2rem,5vw,6rem)]">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
          {note && (
            <p
              className={cn(
                'max-w-[42ch] text-[0.9rem] leading-relaxed font-normal',
                dark ? 'text-white/70' : 'text-muted',
              )}
            >
              {note}
            </p>
          )}
          {cta?.label && (
            <CmsLink link={cta as CmsLinkData} dark={dark} arrow className="self-start" />
          )}
        </div>

        {rows.length > 0 && (
          <ul className={cn('border-t', dark ? 'border-white/16' : 'border-line-strong')}>
            {rows.map((r) => (
              <li
                key={r.key}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b py-5',
                  dark ? 'border-white/16' : 'border-line-strong',
                )}
              >
                <div className="flex min-w-[14rem] flex-1 flex-col gap-1">
                  <span className="text-[1.05rem] leading-snug">{r.title}</span>
                  {r.description && (
                    <span
                      className={cn(
                        'text-[0.84rem] font-normal',
                        dark ? 'text-white/60' : 'text-muted',
                      )}
                    >
                      {r.description}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-eyebrow font-medium tracking-[0.18em] uppercase">
                  {r.href && (
                    <Link
                      href={r.href}
                      className={dark ? 'hover:text-brand-soft' : 'text-brand-ink hover:underline'}
                    >
                      Ver ficha →
                    </Link>
                  )}
                  {r.download && (
                    <a
                      href={r.download}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={dark ? 'hover:text-brand-soft' : 'text-brand-ink hover:underline'}
                    >
                      Descargar PDF ↓
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}
