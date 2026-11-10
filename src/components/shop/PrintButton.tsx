'use client'

import { Printer } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'

/** Imprime o guarda en PDF el presupuesto (el navegador ofrece "Guardar como PDF"). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'justify-center print:hidden',
      )}
    >
      <Printer aria-hidden="true" className="size-4" />
      Descargar PDF / imprimir
    </button>
  )
}
