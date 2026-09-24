'use client'

import Link from 'next/link'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'

/**
 * Configuraciones disponibles (chips) + CTAs contextuales del producto.
 * La configuración elegida viaja en el mensaje de WhatsApp.
 */
export function ProductConfigurator({
  configurations,
  whatsappNumber,
  productName,
  quoteHref,
}: {
  configurations: string[]
  whatsappNumber: string | null
  productName: string
  quoteHref: string
}) {
  const [selected, setSelected] = useState<string | null>(configurations[0] ?? null)
  const message = `Hola Pircas, quiero consultar por ${productName.toLowerCase()}${selected ? ` (${selected.toLowerCase()})` : ''}.`
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : null

  return (
    <>
      {configurations.length > 0 && (
        <div className="flex flex-col gap-3" role="group" aria-labelledby="product-configs">
          <span id="product-configs" className="text-eyebrow tracking-[0.2em] text-muted uppercase">
            Configuraciones disponibles
          </span>
          <div className="flex flex-wrap gap-2">
            {configurations.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={selected === c}
                onClick={() => setSelected(c)}
                className={cn(
                  'min-h-[46px] border px-[18px] py-3 text-label tracking-[0.08em] transition-colors',
                  selected === c
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink/22 hover:border-ink',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 pt-1.5">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'dark', size: 'md', stretch: true })}
            onClick={() =>
              track('whatsapp_click', {
                location: 'product',
                product: productName,
                configuration: selected ?? undefined,
              })
            }
          >
            Consultar este producto <span aria-hidden="true">→</span>
          </a>
        )}
        <Link
          href={quoteHref}
          className={buttonVariants({ variant: 'outline', size: 'md', stretch: true })}
        >
          Solicitar presupuesto <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )
}
