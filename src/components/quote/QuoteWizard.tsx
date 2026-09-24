'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { Honeypot, TextAreaField, TextField } from '@/components/forms/fields'
import { submitForm } from '@/components/forms/submit'
import { Turnstile } from '@/components/forms/Turnstile'
import { DoorMark } from '@/components/ui/Brand'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/button-variants'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'
import {
  quoteContactSchema,
  type QuoteContactData,
  type QuoteContactInput,
} from '@/lib/forms/schemas'
import type { QuoteCatalog } from '@/lib/quote/catalog'
import {
  describeItem,
  formatARS,
  unitEstimate,
  validDimensions,
  type QuoteItemInput,
} from '@/lib/quote/pricing'
import { ROUTES } from '@/lib/routes'

type Props = {
  catalog: QuoteCatalog
  turnstileSiteKey: string | null
  whatsappNumber: string | null
  addressLine: string | null
}

type Draft = {
  productId: number | null
  lineId: number | null
  glass: string | null
  width: string
  height: string
  quantity: string
  side2: string
}

const STEP_LABELS = [
  '¿Qué necesitás?',
  'Producto y línea',
  'Medidas',
  'Proyecto y datos',
  'Confirmación',
]

/** Botón-chip de selección (grafito cuando está elegido). */
function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'min-h-12 border px-4 py-3.5 text-left text-[0.78rem] transition-colors',
        selected
          ? 'border-ink bg-ink text-white'
          : 'border-ink/20 bg-transparent text-ink hover:border-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}

const GroupLabel = ({ id, children }: { id: string; children: ReactNode }) => (
  <span id={id} className="text-eyebrow tracking-[0.2em] text-muted uppercase">
    {children}
  </span>
)

/**
 * Cotizador en 5 pasos con "carrito": el cliente arma su lista de aberturas y ve el
 * precio estimado al instante. Los precios y opciones vienen del CMS; el servidor
 * los recalcula al recibir el pedido.
 */
export function QuoteWizard({ catalog, turnstileSiteKey, whatsappNumber, addressLine }: Props) {
  // Preselección desde la URL (?producto=slug&linea=slug), ej. desde una página de producto o línea.
  const searchParams = useSearchParams()
  const [initial] = useState(() => {
    const product = catalog.products.find((p) => p.slug === searchParams.get('producto'))
    const line = catalog.lines.find((l) => l.slug === searchParams.get('linea'))
    return { product, line }
  })
  const preselected = Boolean(initial.product || initial.line)
  const [step, setStep] = useState(initial.product ? 3 : initial.line ? 2 : 1)
  const [needIndex, setNeedIndex] = useState<number | null>(preselected ? 0 : null)
  const [draft, setDraft] = useState<Draft>({
    productId: initial.product?.id ?? null,
    lineId: initial.line?.id ?? catalog.lines[0]?.id ?? null,
    glass: null,
    width: '150',
    height: '110',
    quantity: '1',
    side2: '90',
  })
  const [cart, setCart] = useState<QuoteItemInput[]>([])
  const [projectType, setProjectType] = useState<string>('')
  const [visit, setVisit] = useState(false)
  const [token, setToken] = useState<string | undefined>()
  const [resetSignal, setResetSignal] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<{
    name: string
    phone?: string
    email?: string
  } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const started = useRef(false)
  const onToken = useCallback((t: string | undefined) => setToken(t), [])
  const { pricing } = catalog

  const form = useForm<QuoteContactInput, unknown, QuoteContactData>({
    resolver: zodResolver(quoteContactSchema),
    defaultValues: {
      name: '',
      lastName: '',
      phone: '',
      email: '',
      city: '',
      message: '',
      visitRequested: false,
      projectType: '',
    },
  })

  const goTo = (n: number) => {
    setStep(n)
    track('quote_step', { step: n, step_name: STEP_LABELS[n - 1] })
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: false }))
  }

  const need = needIndex !== null ? catalog.needs[needIndex] : null
  const availableProducts = useMemo(() => {
    if (!need?.categoryIds.length) return catalog.products
    const filtered = catalog.products.filter(
      (p) => p.categoryId !== null && need.categoryIds.includes(p.categoryId),
    )
    return filtered.length ? filtered : catalog.products
  }, [catalog.products, need])

  const product = catalog.products.find((p) => p.id === draft.productId) ?? null
  const usesLine = product?.pricing !== 'fixed'
  const line = usesLine ? (catalog.lines.find((l) => l.id === draft.lineId) ?? null) : null
  const glass =
    line?.glass.find((g) => g.name === draft.glass)?.name ?? line?.glass[0]?.name ?? null

  const item: QuoteItemInput | null = product
    ? {
        productId: product.id,
        lineId: line?.id ?? null,
        glass,
        width: Number(draft.width),
        height: Number(draft.height),
        quantity: Number(draft.quantity),
        side2: product.secondSide ? Number(draft.side2) || null : null,
      }
    : null
  const dimsOk = item ? validDimensions(item, pricing) && (!usesLine || Boolean(line)) : false
  const unit = item && dimsOk && product ? unitEstimate(item, product, line, pricing) : null

  const lookup = (it: QuoteItemInput) => {
    const p = catalog.products.find((x) => x.id === it.productId)!
    const l = catalog.lines.find((x) => x.id === it.lineId) ?? null
    const u = unitEstimate(it, p, p.pricing === 'line' ? l : null, pricing)
    return { p, l: p.pricing === 'line' ? l : null, total: u !== null ? u * it.quantity : null }
  }
  const cartRows = cart.map((it) => ({ it, ...lookup(it) }))
  const cartTotal = cartRows.every((r) => r.total !== null)
    ? cartRows.reduce((a, r) => a + (r.total ?? 0), 0)
    : null
  const show = pricing.showPrices
  const cartCount = `${cart.length} ${cart.length === 1 ? 'ítem' : 'ítems'}`

  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        [
          'Hola Pircas, armé este presupuesto en la web:',
          ...cartRows.map(
            (r) =>
              `- ${r.p.name} (${describeItem(r.it, r.p, r.l)})${show && r.total !== null ? `: ${formatARS(r.total)}` : ''}`,
          ),
          cart.length && show && cartTotal !== null
            ? `Total estimado: ${formatARS(cartTotal)}`
            : '',
          '¿Lo ajustamos?',
        ]
          .filter(Boolean)
          .join('\n'),
      )}`
    : null

  const pickNeed = (i: number) => {
    setNeedIndex(i)
    if (!started.current) {
      started.current = true
      track('quote_start', { need: catalog.needs[i]?.label })
    }
    const preset = catalog.needs[i]?.presetProductId
    if (preset) setDraft((d) => ({ ...d, productId: preset }))
    goTo(2)
  }

  const addItem = () => {
    if (!item || !dimsOk || cart.length >= catalog.maxItems) return
    setCart((c) => [...c, item])
  }

  async function sendQuote(contact: QuoteContactData) {
    setServerError(null)
    const result = await submitForm('quote', {
      ...contact,
      projectType,
      visitRequested: visit,
      need: need?.label,
      items: cart,
      website: honeypotRef.current?.value ?? '',
      turnstileToken: token,
    })
    setResetSignal((n) => n + 1)
    if (!result.ok) {
      setServerError(result.error)
      for (const [field, message] of Object.entries(result.fields ?? {})) {
        if (field in form.getValues()) form.setError(field as keyof QuoteContactInput, { message })
      }
      return
    }
    track('quote_submit', { items: cart.length, value: cartTotal ?? undefined, currency: 'ARS' })
    setSubmitted({ name: contact.name, phone: contact.phone, email: contact.email })
    goTo(5)
  }
  const submit = (e: FormEvent<HTMLFormElement>) => form.handleSubmit(sendQuote)(e)

  const restart = () => {
    setCart([])
    setNeedIndex(null)
    setSubmitted(null)
    form.reset()
    goTo(1)
  }

  const canNext =
    step === 1
      ? needIndex !== null
      : step === 2
        ? Boolean(product) && (!usesLine || Boolean(line))
        : step === 3
          ? cart.length > 0
          : true
  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.125rem),1fr))] items-start gap-3">
      {/* Pasos */}
      <aside
        className="flex flex-col gap-[18px] bg-stone p-[clamp(1.5rem,2.6vw,2.25rem)]"
        aria-label="Progreso"
      >
        <span className="text-eyebrow tracking-[0.24em] text-muted uppercase">
          Paso {step} de 5
        </span>
        <div className="flex gap-[5px]" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={cn(
                'h-[3px] flex-1 transition-colors duration-300',
                i <= step ? 'bg-brand' : 'bg-ink/16',
              )}
            />
          ))}
        </div>
        <ol className="mt-2 flex flex-col border-t border-ink/16">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            return (
              <li
                key={label}
                aria-current={n === step ? 'step' : undefined}
                className={cn(
                  'flex items-baseline gap-3.5 border-b border-line py-3.5 text-label tracking-[0.14em] uppercase',
                  n === step ? 'text-ink' : n < step ? 'text-muted' : 'text-ink/42',
                )}
              >
                <span
                  className={cn(
                    'text-[0.656rem] tracking-[0.28em]',
                    n <= step ? 'text-brand-ink' : 'text-ink/35',
                  )}
                >
                  0{n}
                </span>
                {label}
              </li>
            )
          })}
        </ol>
        {show && pricing.disclaimer && (
          <p className="mt-1.5 text-[0.78rem] leading-relaxed font-normal text-muted">
            {pricing.disclaimer}
          </p>
        )}
      </aside>

      {/* Panel del paso actual */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="flex min-h-[35rem] min-w-0 flex-col gap-[26px] border border-ink/12 bg-white p-[clamp(1.5rem,3vw,3rem)] outline-none"
      >
        {step === 1 && (
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-6 text-[clamp(1.4375rem,1.1rem+1.2vw,2.125rem)] leading-[1.1] tracking-[-0.025em]">
              ¿Qué necesitás?
            </legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,11.25rem),1fr))] gap-2.5">
              {catalog.needs.map((n, i) => {
                const selected = needIndex === i
                return (
                  <button
                    key={n.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => pickNeed(i)}
                    className={cn(
                      'flex min-h-[136px] flex-col items-start gap-3.5 border px-[18px] py-[22px] text-left transition-colors',
                      selected
                        ? 'border-ink bg-ink text-white'
                        : 'border-ink/16 bg-paper hover:border-ink',
                    )}
                  >
                    <DoorMark
                      className={cn('h-6 w-[18px]', selected ? 'text-brand-soft' : 'text-brand')}
                    />
                    <span className="text-[0.97rem] leading-tight tracking-[-0.01em]">
                      {n.label}
                    </span>
                    {n.description && (
                      <span className="text-[0.78rem] leading-normal font-normal opacity-72">
                        {n.description}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-[clamp(1.4375rem,1.1rem+1.2vw,2.125rem)] leading-[1.1] tracking-[-0.025em]">
              Producto y línea
            </h2>
            <div className="flex flex-col gap-3" role="group" aria-labelledby="q-product">
              <GroupLabel id="q-product">Producto</GroupLabel>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.6875rem),1fr))] gap-2">
                {availableProducts.map((p) => (
                  <Chip
                    key={p.id}
                    selected={draft.productId === p.id}
                    onClick={() => setDraft((d) => ({ ...d, productId: p.id }))}
                  >
                    {p.name}
                  </Chip>
                ))}
              </div>
            </div>
            {product && usesLine && (
              <>
                <div className="flex flex-col gap-3" role="group" aria-labelledby="q-line">
                  <GroupLabel id="q-line">Línea</GroupLabel>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,10.625rem),1fr))] gap-2">
                    {catalog.lines.map((l) => (
                      <Chip
                        key={l.id}
                        selected={draft.lineId === l.id}
                        onClick={() => setDraft((d) => ({ ...d, lineId: l.id, glass: null }))}
                      >
                        {l.name}
                      </Chip>
                    ))}
                  </div>
                </div>
                {!!line?.glass.length && (
                  <div className="flex flex-col gap-3" role="group" aria-labelledby="q-glass">
                    <GroupLabel id="q-glass">Vidrio</GroupLabel>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.0625rem),1fr))] gap-2">
                      {line.glass.map((g) => (
                        <Chip
                          key={g.name}
                          selected={glass === g.name}
                          onClick={() => setDraft((d) => ({ ...d, glass: g.name }))}
                        >
                          {g.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-[clamp(1.4375rem,1.1rem+1.2vw,2.125rem)] leading-[1.1] tracking-[-0.025em]">
              Medidas y cantidad
            </h2>
            <p className="max-w-[52ch] text-sm leading-relaxed font-normal text-muted">
              {product ? `${product.name}${line ? ` · ${line.name}` : ''}. ` : ''}En centímetros.
              Podés sumar tantas aberturas como necesites al presupuesto.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3">
              <TextField
                variant="boxed"
                label="Ancho (cm)"
                type="number"
                inputMode="numeric"
                min={pricing.minDimension}
                max={pricing.maxDimension}
                value={draft.width}
                onChange={(e) => setDraft((d) => ({ ...d, width: e.target.value }))}
              />
              <TextField
                variant="boxed"
                label="Alto (cm)"
                type="number"
                inputMode="numeric"
                min={pricing.minDimension}
                max={pricing.maxDimension}
                value={draft.height}
                onChange={(e) => setDraft((d) => ({ ...d, height: e.target.value }))}
              />
              <TextField
                variant="boxed"
                label="Cantidad"
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={draft.quantity}
                onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
              />
              {product?.secondSide && (
                <TextField
                  variant="boxed"
                  label="Lado 2 (cm)"
                  type="number"
                  inputMode="numeric"
                  min={pricing.minDimension}
                  value={draft.side2}
                  onChange={(e) => setDraft((d) => ({ ...d, side2: e.target.value }))}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-5">
              <div className="flex flex-col gap-1" aria-live="polite">
                <span className="text-eyebrow tracking-[0.2em] text-muted uppercase">
                  {show ? 'Estimado por unidad' : 'Abertura'}
                </span>
                {show && (
                  <span className="text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] tracking-[-0.02em]">
                    {unit !== null ? formatARS(unit) : '—'}
                  </span>
                )}
                <span className="text-[0.78rem] font-normal text-muted">
                  {!product
                    ? 'Elegí un producto en el paso anterior.'
                    : dimsOk && item
                      ? describeItem(item, product, line)
                      : `Ingresá ancho y alto (entre ${pricing.minDimension} y ${pricing.maxDimension} cm).`}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={addItem}
                disabled={!dimsOk || cart.length >= catalog.maxItems}
                arrow="+"
              >
                Agregar al presupuesto
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form id="quote-contact" onSubmit={submit} noValidate className="flex flex-col gap-6">
            <h2 className="text-[clamp(1.4375rem,1.1rem+1.2vw,2.125rem)] leading-[1.1] tracking-[-0.025em]">
              Tu proyecto y tus datos
            </h2>
            {catalog.projectTypes.length > 0 && (
              <div className="flex flex-col gap-3" role="group" aria-labelledby="q-type">
                <GroupLabel id="q-type">Tipo de proyecto</GroupLabel>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,10.3125rem),1fr))] gap-2">
                  {catalog.projectTypes.map((t) => (
                    <Chip
                      key={t}
                      selected={projectType === t}
                      onClick={() => setProjectType(projectType === t ? '' : t)}
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 text-sm font-normal">
              <input
                type="checkbox"
                checked={visit}
                onChange={(e) => setVisit(e.target.checked)}
                className="size-[18px] accent-brand"
              />
              {catalog.visitLabel}
            </label>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,11.875rem),1fr))] gap-3.5">
              <TextField
                variant="boxed"
                label="Nombre"
                autoComplete="given-name"
                error={form.formState.errors.name?.message}
                {...form.register('name')}
              />
              <TextField
                variant="boxed"
                label="Apellido"
                autoComplete="family-name"
                optional
                {...form.register('lastName')}
              />
              <TextField
                variant="boxed"
                label="Teléfono / WhatsApp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                error={form.formState.errors.phone?.message}
                {...form.register('phone')}
              />
              <TextField
                variant="boxed"
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                error={form.formState.errors.email?.message}
                {...form.register('email')}
              />
              <TextField
                variant="boxed"
                label="Ciudad"
                autoComplete="address-level2"
                optional
                {...form.register('city')}
              />
            </div>
            <TextAreaField
              variant="boxed"
              label="Mensaje"
              rows={3}
              optional
              {...form.register('message')}
            />
            <Honeypot name="website" ref={honeypotRef} />
            <Turnstile siteKey={turnstileSiteKey} onToken={onToken} resetSignal={resetSignal} />
            {catalog.privacyNote && (
              <p className="text-xs font-normal text-muted">{catalog.privacyNote}</p>
            )}
            {serverError && (
              <p role="alert" className="text-[0.8125rem] font-normal text-danger">
                {serverError}
              </p>
            )}
          </form>
        )}

        {step === 5 && submitted && (
          <div className="flex flex-col gap-6" role="status">
            <DoorMark className="h-[60px] w-[44px] text-brand" />
            <h2 className="text-[clamp(1.4375rem,1.1rem+1.2vw,2.125rem)] leading-[1.1] tracking-[-0.025em]">
              {catalog.success.title}
            </h2>
            {catalog.success.message && (
              <p className="max-w-[52ch] text-[0.9375rem] leading-[1.7] font-normal text-muted">
                {catalog.success.message}
              </p>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 border-y border-line py-5 text-sm font-normal">
              <dt className="text-eyebrow font-medium tracking-[0.2em] text-muted uppercase">
                Ítems
              </dt>
              <dd>{cartCount}</dd>
              {show && cartTotal !== null && (
                <>
                  <dt className="text-eyebrow font-medium tracking-[0.2em] text-muted uppercase">
                    Total estimado
                  </dt>
                  <dd>{formatARS(cartTotal)}</dd>
                </>
              )}
              <dt className="text-eyebrow font-medium tracking-[0.2em] text-muted uppercase">
                Contacto
              </dt>
              <dd>
                {[submitted.name, submitted.phone, submitted.email].filter(Boolean).join(' · ')}
              </dd>
            </dl>
            <div className="flex flex-wrap gap-3">
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'primary' })}
                  onClick={() => track('whatsapp_click', { location: 'quote_success' })}
                >
                  Seguir por WhatsApp <span aria-hidden="true">→</span>
                </a>
              )}
              <Link href={ROUTES.projects} className={buttonVariants({ variant: 'outline' })}>
                Ver proyectos
              </Link>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-ink/12 pt-6">
          <button
            type="button"
            onClick={() => goTo(Math.max(1, step - 1))}
            disabled={step === 1 || step === 5}
            className={cn(
              'py-4 text-label tracking-[0.18em] uppercase',
              step === 1 || step === 5 ? 'text-ink/35' : 'text-muted hover:text-brand',
            )}
          >
            ← Volver
          </button>
          {step < 4 && (
            <Button
              variant="primary"
              arrow
              onClick={() => canNext && goTo(step + 1)}
              disabled={!canNext}
            >
              Continuar
            </Button>
          )}
          {step === 4 && (
            <Button
              type="submit"
              form="quote-contact"
              variant="primary"
              arrow
              disabled={isSubmitting || !cart.length}
            >
              {isSubmitting ? 'Enviando…' : 'Enviar consulta'}
            </Button>
          )}
          {step === 5 && (
            <button
              type="button"
              onClick={restart}
              className="py-4 text-label tracking-[0.18em] text-muted uppercase hover:text-brand"
            >
              Hacer otra cotización
            </button>
          )}
        </div>
      </div>

      {/* Presupuesto (carrito) */}
      <aside
        className="on-dark flex min-h-[25rem] min-w-0 flex-col gap-[22px] bg-ink p-[clamp(1.5rem,2.8vw,2.5rem)] text-white"
        aria-label="Tu presupuesto"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[clamp(1.25rem,1rem+0.8vw,1.6875rem)] tracking-[-0.02em]">
            Tu presupuesto
          </h2>
          <span className="text-eyebrow tracking-[0.22em] text-white/60 uppercase">
            {cartCount}
          </span>
        </div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-3.5 border-y border-white/12 py-7">
            <DoorMark className="h-[38px] w-[28px] text-white/14" />
            <p className="max-w-[32ch] text-[0.84rem] leading-relaxed font-normal text-white/65">
              Todavía no agregaste aberturas. Configurá la primera y sumala a la lista.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col border-t border-white/12" aria-live="polite">
              {cartRows.map((r, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-3.5 border-b border-white/12 py-[15px]"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm">{r.p.name}</span>
                    <span className="text-xs leading-normal font-normal text-white/60">
                      {describeItem(r.it, r.p, r.l)}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {show && (
                      <span className="text-sm">
                        {r.total !== null ? formatARS(r.total) : 'A cotizar'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCart((c) => c.filter((_, j) => j !== i))}
                      className="py-1 text-[0.656rem] tracking-[0.16em] text-white/55 uppercase hover:text-brand-soft"
                      aria-label={`Quitar ${r.p.name}`}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {show && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-eyebrow tracking-[0.22em] text-white/60 uppercase">
                  Total estimado
                </span>
                <span className="text-[clamp(1.5rem,1.1rem+1.2vw,2.125rem)] tracking-[-0.02em]">
                  {cartTotal !== null ? formatARS(cartTotal) : 'A cotizar'}
                </span>
              </div>
            )}
          </>
        )}
        {show && pricing.disclaimer && (
          <p className="text-[0.78rem] leading-relaxed font-normal text-white/55">
            {pricing.disclaimer}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2.5">
          <span className="text-eyebrow tracking-[0.22em] text-brand-soft uppercase">
            Ajustá con un vendedor
          </span>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'primary-on-dark', size: 'sm' }),
                'justify-between',
              )}
              onClick={() => track('whatsapp_click', { location: 'quote_cart' })}
            >
              Enviar por WhatsApp <span aria-hidden="true">→</span>
            </a>
          )}
          <Link
            href={ROUTES.contact}
            className={cn(
              buttonVariants({ variant: 'outline-light', size: 'sm' }),
              'justify-between border-white/35',
            )}
          >
            Visitar el local <span aria-hidden="true">→</span>
          </Link>
          {addressLine && <span className="text-xs font-normal text-white/55">{addressLine}</span>}
        </div>
      </aside>
    </div>
  )
}
