'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ClipboardList, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/lib/routes'

import { quote, useQuote } from './quote-store'
import { QuoteLines } from './QuoteLines'

/** Botón "Mi presupuesto" del encabezado (reemplaza al CTA) + cajón que se abre al agregar un producto. */
export function QuoteButton() {
  const { lines, open, count } = useQuote()
  const pathname = usePathname()

  // Al navegar se cierra el cajón.
  useEffect(() => quote.close(), [pathname])

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? quote.open() : quote.close())}>
      {/* Celular: ícono con contador. Desde tablet: es el botón principal del header. */}
      <Dialog.Trigger
        className="relative flex h-11 items-center gap-2 px-1.5 transition-colors duration-250 hover:text-brand sm:h-auto sm:min-h-12 sm:gap-2.5 sm:rounded-door sm:bg-brand sm:pr-7 sm:pl-5 sm:text-white sm:hover:bg-ink sm:hover:text-white"
        aria-label={
          count
            ? `Mi presupuesto: ${count} ${count === 1 ? 'producto' : 'productos'}`
            : 'Mi presupuesto (vacío)'
        }
      >
        <span className="relative">
          <ClipboardList
            aria-hidden="true"
            className="size-[22px] sm:size-[18px]"
            strokeWidth={1.6}
          />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-2 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[0.625rem] font-semibold text-white sm:hidden"
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
        <span className="hidden text-label text-[0.6875rem] font-medium whitespace-nowrap uppercase sm:inline">
          Mi presupuesto
        </span>
        {count > 0 && (
          <span
            aria-hidden="true"
            className="hidden h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[0.6875rem] font-semibold text-brand sm:flex"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink-deep/55 data-[state=closed]:animate-[fade-out_.2s_ease] data-[state=open]:animate-[fade-in_.2s_ease]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-[81] flex w-[min(100vw,27.5rem)] flex-col bg-paper text-ink shadow-float data-[state=closed]:animate-[drawer-out_.22s_ease] data-[state=open]:animate-[drawer-in_.28s_var(--ease-soft)]"
        >
          <header className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5">
            <Dialog.Title className="text-lg tracking-[-0.01em]">
              Tu presupuesto{' '}
              {count > 0 && <span className="text-sm font-normal text-muted">({count})</span>}
            </Dialog.Title>
            <Dialog.Close
              className="-mr-2 flex size-11 items-center justify-center hover:text-brand"
              aria-label="Cerrar presupuesto"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </header>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
              <ClipboardList aria-hidden="true" className="size-10 text-muted" strokeWidth={1.2} />
              <p className="text-base font-normal text-muted">
                Agregá los productos que te interesan y recibí el presupuesto en el acto.
              </p>
              <Link
                href={ROUTES.shop}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5">
                <QuoteLines lines={lines} compact onNavigate={() => quote.close()} />
              </div>
              <footer className="shrink-0 border-t border-line bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="flex flex-col gap-2">
                  <Link
                    href={ROUTES.quoteList}
                    className={cn(buttonVariants({ variant: 'primary' }), 'justify-center')}
                  >
                    Recibir mi presupuesto
                  </Link>
                  <button
                    type="button"
                    onClick={() => quote.close()}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'justify-center',
                    )}
                  >
                    Seguir agregando
                  </button>
                </div>
                <p className="mt-3 text-center text-xs font-normal text-muted">
                  Dejás tu WhatsApp y ves el precio al instante.
                </p>
              </footer>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
