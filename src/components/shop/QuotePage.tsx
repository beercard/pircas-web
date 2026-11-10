'use client'

import { ClipboardList, Lock } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { TextAreaField, TextField } from '@/components/forms/fields'
import { Turnstile } from '@/components/forms/Turnstile'
import { buttonVariants } from '@/components/ui/button-variants'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'
import { fieldErrors } from '@/lib/forms/schemas'
import { quoteRequestSchema } from '@/lib/shop/schema'
import { ROUTES } from '@/lib/routes'
import { getAttribution } from '@/lib/utm'

import { quote, toQuoteItems, useQuote, type QuoteLine } from './quote-store'
import { QuoteLines } from './QuoteLines'

/** Vuelve a leer los productos del servidor (la lista guarda una copia local). */
function useQuoteSync(lines: QuoteLine[], ready: boolean) {
  const signature = lines.map((l) => `${l.key}x${l.quantity}`).join('|')
  useEffect(() => {
    if (!ready || !signature) return
    const ctrl = new AbortController()
    fetch('/api/shop/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toQuoteItems(lines)),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data?.lines) && quote.sync(data.lines))
      .catch(() => {})
    return () => ctrl.abort()
    // Solo al entrar a la página: los cambios posteriores los hace el propio cliente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
}

function EmptyQuote() {
  return (
    <div className="flex flex-col items-center gap-5 border border-line bg-white px-6 py-16 text-center">
      <ClipboardList aria-hidden="true" className="size-11 text-muted" strokeWidth={1.2} />
      <p className="text-lg">Tu presupuesto está vacío</p>
      <p className="max-w-[42ch] text-sm font-normal text-muted">
        Agregá desde la tienda todos los productos que te interesan y volvé acá para recibir el
        presupuesto en el acto.
      </p>
      <Link href={ROUTES.shop} className={buttonVariants({ variant: 'primary' })}>
        Ver productos
      </Link>
    </div>
  )
}

type Values = { fullName: string; phone: string; city: string; notes: string; website: string }
const EMPTY: Values = { fullName: '', phone: '', city: '', notes: '', website: '' }

/** Página del presupuesto: la lista (editable) + el formulario corto con WhatsApp. */
export function QuotePage({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const { lines, ready, count } = useQuote()
  useQuoteSync(lines, ready)

  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [token, setToken] = useState<string | undefined>()
  const [resetSignal, setResetSignal] = useState(0)
  const started = useRef(false)
  const viewed = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!ready || viewed.current || !lines.length) return
    viewed.current = true
    track('view_quote', { items: count, products: lines.length })
  }, [ready, lines.length, count])

  if (!ready || done)
    return (
      <div
        className="flex h-64 items-center justify-center bg-stone text-sm font-normal text-muted"
        role="status"
      >
        {done ? 'Calculando tu presupuesto…' : ''}
      </div>
    )
  if (!lines.length) return <EmptyQuote />

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    if (!started.current) {
      started.current = true
      track('begin_quote', { items: count, products: lines.length })
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
      items: toQuoteItems(lines),
      ...values,
      turnstileToken: token,
      attribution: getAttribution(),
    }
    const parsed = quoteRequestSchema.safeParse(data)
    if (!parsed.success) {
      const local = fieldErrors(parsed.error)
      setErrors(local)
      setFormError('Revisá los datos marcados.')
      track('quote_error', { error_reason: `validacion_${Object.keys(local)[0] ?? 'datos'}` })
      focusFirstError(local)
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/shop/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        url?: string
        orderNumber?: string
        total?: number
        error?: string
        fields?: Record<string, string>
      }
      if (res.ok && body.ok && body.url) {
        track('generate_lead', {
          lead_type: 'presupuesto_online',
          quote_number: body.orderNumber,
          value: body.total,
          currency: 'ARS',
          items: count,
          city: values.city.trim() || undefined,
        })
        setDone(true)
        quote.clear()
        window.location.assign(body.url)
        return
      }
      setErrors(body.fields ?? {})
      setFormError(body.error || 'No pudimos calcular tu presupuesto. Intentá de nuevo.')
      track('quote_error', { error_reason: res.status >= 500 ? 'servidor' : `http_${res.status}` })
      if (body.fields) focusFirstError(body.fields)
      setResetSignal((n) => n + 1)
    } catch {
      setFormError('Sin conexión. Revisá tu internet e intentá de nuevo.')
      track('quote_error', { error_reason: 'red' })
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
    <div className="grid items-start gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[minmax(0,1fr)_26rem]">
      <section className="flex flex-col border border-line bg-white px-5 sm:px-7">
        <header className="flex items-center justify-between gap-4 border-b border-line py-4">
          <h2 className="text-lg tracking-[-0.01em]">
            1. Tus productos{' '}
            <span className="text-sm font-normal text-muted">
              ({count} {count === 1 ? 'unidad' : 'unidades'})
            </span>
          </h2>
          <Link
            href={ROUTES.shop}
            className="text-sm font-normal text-muted underline underline-offset-4 hover:text-brand"
          >
            Agregar más
          </Link>
        </header>
        <QuoteLines lines={lines} />
      </section>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-5 border border-line bg-white p-5 sm:p-7 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl tracking-[-0.01em]">2. Completá tu WhatsApp</h2>
          <p className="text-sm font-normal text-muted">
            Te mostramos el presupuesto con precios al instante y te queda en tu WhatsApp.
          </p>
        </div>
        <TextField label="Nombre" autoComplete="name" required {...field('fullName')} />
        <TextField
          label="WhatsApp"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          placeholder="Ej: 342 5112233"
          hint="Con código de área, sin 0 ni 15."
          {...field('phone')}
        />
        <TextField
          label="Localidad"
          autoComplete="address-level2"
          required
          placeholder="Ej: Coronda"
          {...field('city')}
        />
        <TextAreaField
          label="Comentarios"
          optional
          rows={2}
          placeholder="Ej: necesito colocación"
          {...field('notes')}
        />
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
        <Turnstile siteKey={turnstileSiteKey} onToken={setToken} resetSignal={resetSignal} />
        {formError && (
          <p
            role="alert"
            className="border-l-2 border-danger bg-danger/5 px-3.5 py-3 text-sm font-normal text-danger"
          >
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className={cn(buttonVariants({ variant: 'primary' }), 'w-full justify-center')}
        >
          <WhatsAppIcon className="size-[18px]" />
          {sending ? 'Calculando…' : '3. Recibir mi presupuesto'}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-normal text-muted">
          <Lock aria-hidden="true" className="size-3.5" />
          Sin compromiso. Usamos tu WhatsApp solo para este presupuesto.
        </p>
      </form>
    </div>
  )
}
