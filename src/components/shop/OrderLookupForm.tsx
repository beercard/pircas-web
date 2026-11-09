'use client'

import { useActionState } from 'react'

import { lookupOrder, type LookupState } from '@/app/(frontend)/seguimiento/actions'
import { TextField } from '@/components/forms/fields'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'

const INITIAL: LookupState = { error: null }

export function OrderLookupForm() {
  const [state, action, pending] = useActionState(lookupOrder, INITIAL)
  return (
    <form action={action} className="flex flex-col gap-5 border border-line bg-white p-5 sm:p-7">
      <TextField
        name="number"
        label="Número de pedido"
        placeholder="P261109-1234"
        variant="boxed"
        autoCapitalize="characters"
        required
        hint="Está en el email de confirmación."
      />
      <TextField
        name="email"
        type="email"
        label="Email de la compra"
        variant="boxed"
        autoComplete="email"
        required
      />
      {state.error && (
        <p role="alert" className="text-sm font-normal text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ variant: 'primary' }), 'justify-center')}
      >
        {pending ? 'Buscando…' : 'Ver mi pedido'}
      </button>
    </form>
  )
}
