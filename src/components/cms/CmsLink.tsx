import Link from 'next/link'

import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import {
  buttonVariants,
  variantForBackground,
  type ButtonVariantProps,
} from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import { getSiteSettings } from '@/lib/data/globals'
import { resolveLink, type CmsLink as CmsLinkData } from '@/lib/links'
import { getWhatsAppConfig } from '@/lib/whatsapp'

type Props = {
  link: CmsLinkData | null | undefined
  /** Fuerza un variante (si no, se deriva del estilo elegido en el CMS y del fondo). */
  variant?: ButtonVariantProps['variant']
  size?: ButtonVariantProps['size']
  stretch?: boolean
  className?: string
  dark?: boolean
  brandBg?: boolean
  arrow?: boolean
  /** Sin estilo de botón (menús, footer). */
  plain?: boolean
}

/** Enlace/botón configurado en el CMS: interno, URL externa, teléfono o WhatsApp (con tracking). */
export async function CmsLink({
  link,
  variant,
  size = 'md',
  stretch,
  className,
  dark = false,
  brandBg,
  arrow,
  plain,
}: Props) {
  const settings = await getSiteSettings()
  const resolved = resolveLink(link, getWhatsAppConfig(settings))
  if (!resolved?.label) return null

  const v = variant ?? variantForBackground(resolved.appearance, dark, brandBg)
  const classes = plain ? className : cn(buttonVariants({ variant: v, size, stretch }), className)
  const content = (
    <>
      {resolved.label}
      {arrow && !plain && <span aria-hidden="true">→</span>}
    </>
  )

  if (resolved.kind === 'whatsapp' || resolved.href.startsWith('tel:')) {
    const isWa = resolved.kind === 'whatsapp'
    return (
      <TrackedAnchor
        href={resolved.href}
        target={isWa ? '_blank' : undefined}
        rel={isWa ? 'noopener noreferrer' : undefined}
        className={classes}
        event={isWa ? 'whatsapp_click' : 'phone_click'}
        params={{ cta: resolved.label }}
      >
        {content}
      </TrackedAnchor>
    )
  }

  if (resolved.external) {
    return (
      <a
        href={resolved.href}
        className={classes}
        target={resolved.newTab ? '_blank' : undefined}
        rel={resolved.newTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={resolved.href} className={classes} target={resolved.newTab ? '_blank' : undefined}>
      {content}
    </Link>
  )
}
