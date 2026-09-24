'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { BrandLogo } from '@/components/ui/Brand'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'

import { isActivePath, type NavItem, type SimpleLink } from './nav-types'

type Props = {
  nav: NavItem[]
  cta: SimpleLink
  whatsappHref: string | null
  brandName: string
  pathname: string
}

/** Menú mobile/tablet a pantalla completa (grafito). Accesible: foco atrapado, Escape, aria-modal. */
export function MobileMenu({ nav, cta, whatsappHref, brandName, pathname }: Props) {
  const [open, setOpen] = useState(false)
  // Cierra el menú al navegar (ajuste de estado durante el render, patrón recomendado por React).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="flex size-12 flex-col justify-center gap-1.5 p-2.5 xl:hidden"
        aria-label="Abrir menú"
      >
        <span className="block h-[1.5px] w-full bg-current" />
        <span className="block h-[1.5px] w-[70%] bg-current" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          className="fixed inset-0 z-[70] flex flex-col overflow-auto bg-ink text-white outline-none data-[state=open]:animate-[fade-in_200ms_ease-out]"
          aria-describedby={undefined}
        >
          <div className="flex h-header shrink-0 items-center justify-between border-b border-white/12 px-5">
            <BrandLogo brandName={brandName.split(' ')[0]?.toUpperCase()} />
            <Dialog.Title className="sr-only">Menú</Dialog.Title>
            <Dialog.Close
              className="flex size-12 items-center justify-center text-[1.375rem]"
              aria-label="Cerrar menú"
            >
              ×
            </Dialog.Close>
          </div>

          <nav aria-label="Principal (mobile)" className="flex flex-col px-5 pt-4 pb-6">
            <ul>
              {nav.map((item, i) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                    className={cn(
                      'block py-[18px] text-[1.625rem] tracking-[-0.01em] text-white',
                      i < nav.length - 1 && 'border-b border-white/10',
                      isActivePath(pathname, item.href) && 'text-brand-soft',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-3 px-5 pb-10">
            <Link
              href={cta.href}
              className={cn(
                buttonVariants({ variant: 'primary-on-dark' }),
                'h-[60px] justify-center',
              )}
            >
              {cta.label}
            </Link>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline-light' }),
                  'h-[60px] justify-center',
                )}
                onClick={() => track('whatsapp_click', { location: 'mobile_menu' })}
              >
                WhatsApp
              </a>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
