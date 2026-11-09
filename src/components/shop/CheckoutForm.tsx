'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'

import { TextAreaField, TextField } from '@/components/forms/fields'
import { Turnstile } from '@/components/forms/Turnstile'
import { buttonVariants } from '@/components/ui/button-variants'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'
import { fieldErrors } from '@/lib/forms/schemas'
import type { ShopConfig } from '@/lib/shop/config'
import { formatPrice, orderTotals, shippingQuote, type PaymentMethod } from '@/lib/shop/pricing'
import { checkoutSchema } from '@/lib/shop/schema'
import { ROUTES } from '@/lib/routes'
import { getAttribution } from '@/lib/utm'

import { cart, toCartItems, useCart } from './cart-store'
import { CartLines } from './CartLines'
import { EmptyCart, useCartSync } from './CartPage'
import { TotalsList } from './OrderSummary'

type Values = {
  fullName: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  province: string
  zip: string
  notes: string
  website: string
}

const EMPTY: Values = {
  fullName: '',
  email: '',
  phone: '',
  document: '',
  address: '',
  city: '',
  province: 'Santa Fe',
  zip: '',
  notes: '',
  website: '',
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border border-line bg-white p-5 sm:p-7">
      <h2 className="flex items-center gap-3.5 text-xl tracking-[-0.01em]">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-door bg-ink pr-1 text-sm font-medium text-white"
        >
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  hint,
  aside,
  disabled,
}: {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  title: string
  hint?: string | null
  aside?: string
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3.5 border p-4 has-focus-visible:outline-2 has-focus-visible:outline-brand',
        checked ? 'border-ink bg-paper' : 'border-line-strong hover:border-ink/50',
        disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 size-4 accent-brand"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[0.9375rem] font-medium">{title}</span>
        {hint && <span className="text-[0.8125rem] font-normal text-muted">{hint}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm font-medium tabular-nums">{aside}</span>}
    </label>
  )
}

/** Checkout en una sola página: datos, entrega, pago y resumen siempre a la vista. */
export function CheckoutForm({
  config,
  turnstileSiteKey,
}: {
  config: ShopConfig
  turnstileSiteKey: string | null
}) {
  const { lines, ready } = useCart()
  useCartSync(lines, ready)

  const [values, setValues] = useState<Values>(EMPTY)
  const [shippingCode, setShippingCode] = useState(config.shipping[0]?.code ?? '')
  const [method, setMethod] = useState<PaymentMethod>(config.payments[0]?.method ?? 'transfer')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [token, setToken] = useState<string | undefined>()
  const [resetSignal, setResetSignal] = useState(0)
  const started = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!ready || done)
    return (
      <div
        className="flex h-64 items-center justify-center bg-stone text-sm font-normal text-muted"
        role="status"
      >
        {done ? 'Registrando tu pedido…' : ''}
      </div>
    )
  if (!lines.length) return <EmptyCart />

  const shipping = config.shipping.find((m) => m.code === shippingCode) ?? config.shipping[0]
  const delivery = shipping?.type === 'delivery'
  // El efectivo es solo para retiro: si se elige envío, se pasa al primer medio disponible.
  const payMethod: PaymentMethod =
    method === 'cash' && delivery
      ? (config.payments.find((p) => p.method !== 'cash')?.method ?? 'transfer')
      : method

  const priced = lines.map((l) => ({ breakdown: l.product.price, quantity: l.quantity }))
  const goods = orderTotals(priced, payMethod, { cost: 0, quoteLater: false })
  const quote = shipping ? shippingQuote(shipping, goods.subtotal) : { cost: 0, quoteLater: false }
  const totals = orderTotals(priced, payMethod, quote)
  const blocked = lines.some((l) => l.issue)

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    if (!started.current) {
      started.current = true
      track('begin_checkout', { value: totals.total, currency: 'ARS', items: totals.itemsCount })
    }
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }

  const focusFirstError = (fields: Record<string, string>) => {
    const first = Object.keys(fields)[0]
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (sending) return
    setFormError(null)
    const data = {
      items: toCartItems(lines),
      ...values,
      shippingCode: shipping?.code ?? '',
      paymentMethod: payMethod,
      turnstileToken: token,
      attribution: getAttribution(),
    }
    const parsed = checkoutSchema.safeParse(data)
    const local: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error)
    if (delivery) {
      if (!values.address.trim()) local.address = 'Ingresá la dirección de entrega.'
      if (!values.city.trim()) local.city = 'Ingresá la localidad.'
    }
    if (Object.keys(local).length) {
      setErrors(local)
      setFormError('Revisá los datos marcados.')
      focusFirstError(local)
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        url?: string
        paymentUrl?: string | null
        orderNumber?: string
        total?: number
        error?: string
        fields?: Record<string, string>
      }
      if (res.ok && body.ok && body.url) {
        track('purchase', {
          transaction_id: body.orderNumber,
          value: body.total,
          currency: 'ARS',
          payment_type: payMethod,
        })
        setDone(true)
        cart.clear()
        // Mercado Pago online: se paga ahora y vuelve a la página del pedido.
        window.location.assign(body.paymentUrl || body.url)
        return
      }
      setErrors(body.fields ?? {})
      setFormError(body.error || 'No pudimos registrar tu pedido. Intentá de nuevo.')
      if (body.fields) focusFirstError(body.fields)
      setResetSignal((n) => n + 1)
    } catch {
      setFormError('Sin conexión. Revisá tu internet e intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const field = (key: keyof Values) => ({
    name: key,
    value: values[key],
    onChange: set(key),
    error: errors[key] || undefined,
    variant: 'boxed' as const,
  })

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="grid items-start gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[minmax(0,1fr)_25rem]"
    >
      <div className="flex flex-col gap-4">
        <Step n={1} title="Tus datos">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Nombre y apellido"
              autoComplete="name"
              required
              wrapperClassName="sm:col-span-2"
              {...field('fullName')}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              hint="Te enviamos el pedido y el seguimiento."
              {...field('email')}
            />
            <TextField
              label="Teléfono / WhatsApp"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              hint="Para coordinar la entrega."
              {...field('phone')}
            />
            <TextField
              label="DNI o CUIT"
              inputMode="numeric"
              optional
              hint="Para la factura."
              {...field('document')}
            />
          </div>
          {/* Honeypot: invisible para personas. */}
          <div className="hidden" aria-hidden="true">
            <label>
              Sitio web
              <input
                tabIndex={-1}
                autoComplete="off"
                name="website"
                value={values.website}
                onChange={set('website')}
              />
            </label>
          </div>
        </Step>

        <Step n={2} title="Entrega">
          <fieldset className="flex flex-col gap-2.5">
            <legend className="sr-only">Forma de entrega</legend>
            {config.shipping.map((m) => {
              const q = shippingQuote(m, goods.subtotal)
              return (
                <Choice
                  key={m.code}
                  name="shippingCode"
                  value={m.code}
                  checked={shipping?.code === m.code}
                  onChange={() => setShippingCode(m.code)}
                  title={m.label}
                  hint={m.description}
                  aside={q.quoteLater ? 'A coordinar' : q.cost ? formatPrice(q.cost) : 'Sin costo'}
                />
              )
            })}
          </fieldset>
          {delivery && (
            <div className="grid gap-5 sm:grid-cols-6">
              <TextField
                label="Dirección"
                autoComplete="street-address"
                required
                wrapperClassName="sm:col-span-6"
                placeholder="Calle, número, piso"
                {...field('address')}
              />
              <TextField
                label="Localidad"
                autoComplete="address-level2"
                required
                wrapperClassName="sm:col-span-3"
                {...field('city')}
              />
              <TextField
                label="Provincia"
                autoComplete="address-level1"
                wrapperClassName="sm:col-span-2"
                {...field('province')}
              />
              <TextField
                label="CP"
                autoComplete="postal-code"
                inputMode="numeric"
                optional
                wrapperClassName="sm:col-span-1"
                {...field('zip')}
              />
            </div>
          )}
        </Step>

        <Step n={3} title="Pago">
          <fieldset className="flex flex-col gap-2.5">
            <legend className="sr-only">Medio de pago</legend>
            {config.payments.map((p) => {
              const t = orderTotals(priced, p.method, quote)
              const disabled = p.method === 'cash' && delivery
              return (
                <Choice
                  key={p.method}
                  name="paymentMethod"
                  value={p.method}
                  checked={payMethod === p.method}
                  onChange={() => setMethod(p.method)}
                  title={p.label}
                  hint={disabled ? 'Disponible solo para retiro en el taller.' : p.hint}
                  aside={formatPrice(t.total)}
                  disabled={disabled}
                />
              )
            })}
          </fieldset>
          {errors.paymentMethod && (
            <p role="alert" className="text-[0.8125rem] font-normal text-danger">
              {errors.paymentMethod}
            </p>
          )}
          <TextAreaField
            label="Comentarios"
            optional
            rows={3}
            placeholder="Horarios de entrega, aclaraciones…"
            {...field('notes')}
          />
        </Step>
      </div>

      <aside className="sticky top-[calc(var(--spacing-header)+1.5rem)] flex flex-col gap-5 border border-line bg-white p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg">Tu pedido</h2>
          <Link
            href={ROUTES.cart}
            className="text-sm font-normal text-muted underline underline-offset-4 hover:text-brand"
          >
            Editar
          </Link>
        </div>
        <div className="-my-2 max-h-[19rem] overflow-y-auto overscroll-contain">
          <CartLines lines={lines} method={payMethod} editable={false} compact />
        </div>
        <TotalsList
          totals={totals}
          method={payMethod}
          shippingLabel={shipping?.label ?? 'Entrega'}
          quoteLater={quote.quoteLater}
        />
        {payMethod === 'mercadopago' && config.rules.installments > 1 && (
          <p className="text-sm font-normal text-muted">
            Hasta {config.rules.installments} cuotas sin interés de{' '}
            <span className="text-ink">
              {formatPrice(totals.total / config.rules.installments)}
            </span>
            .
          </p>
        )}
        <Turnstile siteKey={turnstileSiteKey} onToken={setToken} resetSignal={resetSignal} />
        {(formError || blocked) && (
          <p
            role="alert"
            className="border-l-2 border-danger bg-danger/5 px-3.5 py-3 text-sm font-normal text-danger"
          >
            {formError || 'Hay productos sin stock suficiente. Editá tu carrito para continuar.'}
          </p>
        )}
        <button
          type="submit"
          disabled={sending || blocked}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'justify-center')}
        >
          {sending
            ? 'Enviando…'
            : payMethod === 'mercadopago' && config.mercadopagoOnline
              ? 'Confirmar y pagar'
              : 'Confirmar pedido'}
        </button>
        <p className="flex items-start gap-2 text-xs leading-relaxed font-normal text-muted">
          <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {payMethod === 'transfer'
            ? 'Al confirmar te mostramos los datos para transferir. Tu pedido queda reservado.'
            : payMethod === 'mercadopago'
              ? config.mercadopagoOnline
                ? 'Te llevamos a Mercado Pago para pagar de forma segura.'
                : 'Al confirmar te enviamos el link de pago de Mercado Pago.'
              : 'Pagás al retirar. Te avisamos cuando esté listo.'}
        </p>
      </aside>
    </form>
  )
}
