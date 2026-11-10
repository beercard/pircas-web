'use client'

import { Check, ClipboardList, Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'
import type { ShopProduct } from '@/lib/shop/config'
import type { AccessoryValue } from '@/lib/shop/options'
import { MAX_QTY } from '@/lib/shop/schema'
import { ROUTES } from '@/lib/routes'

import { quote } from './quote-store'

/** Botón de las tarjetas: suma 1 unidad (primer color, sin accesorios) y abre el presupuesto. */
export function QuickAddButton({ product }: { product: ShopProduct }) {
  const [added, setAdded] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        quote.add(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 1600)
      }}
      className={cn(
        buttonVariants({ variant: added ? 'dark' : 'primary', size: 'sm' }),
        'w-full justify-center',
      )}
    >
      {added ? (
        <>
          <Check aria-hidden="true" className="size-4" /> Agregado
        </>
      ) : (
        <>
          <ClipboardList aria-hidden="true" className="size-4" /> Agregar al presupuesto
        </>
      )}
    </button>
  )
}

export function QuantityStepper({
  value,
  onChange,
  max = MAX_QTY,
  label = 'Cantidad',
  small,
}: {
  value: number
  onChange: (n: number) => void
  max?: number
  label?: string
  small?: boolean
}) {
  const size = small ? 'size-9' : 'size-12'
  return (
    <div
      className="inline-flex items-center border border-line-strong bg-white"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn(
          size,
          'flex items-center justify-center hover:text-brand disabled:opacity-30',
        )}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Restar una unidad"
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn('text-center text-sm font-medium tabular-nums', small ? 'w-8' : 'w-10')}
      >
        {value}
      </span>
      <button
        type="button"
        className={cn(
          size,
          'flex items-center justify-center hover:text-brand disabled:opacity-30',
        )}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Sumar una unidad"
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

/** Selector de color (chips). */
export function ColorPicker({
  product,
  value,
  onChange,
  small,
  name,
}: {
  product: ShopProduct
  value: string | null
  onChange: (v: string) => void
  small?: boolean
  name: string
}) {
  if (product.colors.length < 2) return null
  return (
    <fieldset className="flex flex-col gap-2">
      <legend
        className={cn(
          'text-muted uppercase',
          small
            ? 'mb-1.5 text-[0.625rem] tracking-[0.18em]'
            : 'mb-2.5 text-eyebrow tracking-[0.2em]',
        )}
      >
        Color
        {!small && (
          <>
            :{' '}
            <span className="tracking-normal text-ink normal-case">
              {product.colors.find((c) => c.value === value)?.label}
            </span>
          </>
        )}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {product.colors.map((c) => (
          <label
            key={c.value}
            className={cn(
              'flex cursor-pointer items-center gap-2 border font-medium has-focus-visible:outline-2 has-focus-visible:outline-brand',
              small ? 'min-h-9 px-2.5 text-xs' : 'min-h-12 px-3.5 text-sm',
              value === c.value ? 'border-ink bg-white' : 'border-line-strong hover:border-ink/50',
            )}
          >
            <input
              type="radio"
              name={name}
              value={c.value}
              checked={value === c.value}
              onChange={() => onChange(c.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cn('rounded-full border border-ink/25', small ? 'size-3.5' : 'size-5')}
              style={{ backgroundColor: c.hex }}
            />
            {c.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Accesorios opcionales (celosía, mosquitero, reja). */
export function AccessoryPicker({
  product,
  value,
  onChange,
  small,
}: {
  product: ShopProduct
  value: AccessoryValue[]
  onChange: (v: AccessoryValue[]) => void
  small?: boolean
}) {
  if (!product.accessories.length) return null
  return (
    <fieldset className="flex flex-col gap-2">
      <legend
        className={cn(
          'text-muted uppercase',
          small
            ? 'mb-1.5 text-[0.625rem] tracking-[0.18em]'
            : 'mb-2.5 text-eyebrow tracking-[0.2em]',
        )}
      >
        Accesorios opcionales
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {product.accessories.map((a) => {
          const on = value.includes(a.value)
          return (
            <label
              key={a.value}
              className={cn(
                'flex cursor-pointer items-center gap-2 border font-medium has-focus-visible:outline-2 has-focus-visible:outline-brand',
                small ? 'min-h-9 px-2.5 text-xs' : 'min-h-12 px-3.5 text-sm',
                on ? 'border-ink bg-white' : 'border-line-strong hover:border-ink/50',
              )}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() =>
                  onChange(on ? value.filter((v) => v !== a.value) : [...value, a.value])
                }
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'flex items-center justify-center border',
                  small ? 'size-3.5' : 'size-4',
                  on ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white',
                )}
              >
                {on && <Check className="size-3" strokeWidth={3} />}
              </span>
              {a.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Caja de la ficha: color, accesorios, cantidad y "Agregar al presupuesto". */
export function QuoteBox({ product }: { product: ShopProduct }) {
  const router = useRouter()
  const [color, setColor] = useState<string | null>(product.colors[0]?.value ?? null)
  const [accessories, setAccessories] = useState<AccessoryValue[]>([])
  const [quantity, setQuantity] = useState(1)
  const add = (open = true) => quote.add(product, { color, accessories, quantity }, { open })

  return (
    <div className="flex flex-col gap-5">
      {/* Celular: barra fija (reemplaza a la de WhatsApp / Cotizar). */}
      <div
        data-buy-bar
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-white px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm leading-tight font-medium">{product.name}</span>
          <span className="truncate text-[0.6875rem] font-normal text-muted">
            Precio en tu presupuesto, al instante
          </span>
        </div>
        <button
          type="button"
          onClick={() => add()}
          className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'shrink-0')}
        >
          <ClipboardList aria-hidden="true" className="size-4" />
          Agregar
        </button>
      </div>

      <ColorPicker product={product} value={color} onChange={setColor} name="color" />
      <AccessoryPicker product={product} value={accessories} onChange={setAccessories} />

      <div className="flex flex-col gap-2">
        <span className="text-eyebrow tracking-[0.2em] text-muted uppercase">Cantidad</span>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => add()}
          className={cn(buttonVariants({ variant: 'primary' }), 'flex-1 justify-center')}
        >
          <ClipboardList aria-hidden="true" className="size-4" />
          Agregar al presupuesto
        </button>
        <button
          type="button"
          onClick={() => {
            add(false)
            router.push(ROUTES.quoteList)
          }}
          className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-center')}
        >
          Pedir presupuesto ahora
        </button>
      </div>
    </div>
  )
}
