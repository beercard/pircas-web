import { forwardRef, useId, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Campos de formulario del diseño.
 * - `underline`: solo línea inferior (Contacto).
 * - `boxed`: recuadro con fondo off-white (Cotizador).
 * Etiqueta siempre visible, error asociado con aria-describedby.
 */

type Variant = 'underline' | 'boxed'

const inputClasses = (variant: Variant, invalid: boolean) =>
  cn(
    'w-full text-base font-medium text-ink outline-none transition-colors placeholder:text-muted/60',
    variant === 'underline'
      ? 'h-[54px] border-0 border-b bg-transparent pl-0.5 focus:border-brand'
      : 'h-14 border bg-paper px-4 focus:border-brand',
    invalid ? 'border-danger' : variant === 'underline' ? 'border-ink/30' : 'border-line-strong',
  )

type FieldShellProps = {
  label: string
  error?: string
  hint?: string
  children: (ids: { id: string; describedBy?: string }) => ReactNode
  className?: string
  optional?: boolean
}

export function FieldShell({ label, error, hint, children, className, optional }: FieldShellProps) {
  const id = useId()
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-eyebrow tracking-[0.2em] text-muted uppercase">
        {label}
        {optional && (
          <span className="ml-1 tracking-normal normal-case opacity-70">(opcional)</span>
        )}
      </label>
      {children({ id, describedBy })}
      {hint && !error && (
        <span id={hintId} className="text-xs font-normal text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={errId} role="alert" className="text-[0.8125rem] font-normal text-danger">
          {error}
        </span>
      )}
    </div>
  )
}

type InputProps = ComponentProps<'input'> & {
  label: string
  error?: string
  hint?: string
  variant?: Variant
  optional?: boolean
  wrapperClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, error, hint, variant = 'underline', optional, wrapperClassName, className, ...props },
  ref,
) {
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      optional={optional}
      className={wrapperClassName}
    >
      {({ id, describedBy }) => (
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            inputClasses(variant, Boolean(error)),
            variant === 'boxed' && props.type === 'number' && 'text-lg',
            className,
          )}
          {...props}
        />
      )}
    </FieldShell>
  )
})

type TextAreaProps = ComponentProps<'textarea'> & {
  label: string
  error?: string
  variant?: Variant
  optional?: boolean
  wrapperClassName?: string
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextAreaField(
  { label, error, variant = 'underline', optional, wrapperClassName, className, ...props },
  ref,
) {
  return (
    <FieldShell label={label} error={error} optional={optional} className={wrapperClassName}>
      {({ id, describedBy }) => (
        <textarea
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            inputClasses(variant, Boolean(error)),
            'h-auto resize-y py-3.5 leading-normal font-normal',
            className,
          )}
          {...props}
        />
      )}
    </FieldShell>
  )
})

type SelectProps = ComponentProps<'select'> & {
  label: string
  error?: string
  variant?: Variant
  optional?: boolean
  options: string[]
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
  { label, error, variant = 'underline', optional, options, placeholder, className, ...props },
  ref,
) {
  return (
    <FieldShell label={label} error={error} optional={optional}>
      {({ id, describedBy }) => (
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(inputClasses(variant, Boolean(error)), 'cursor-pointer', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
})

/** Campo trampa para bots (invisible y fuera del orden de tabulación). */
export function Honeypot(props: ComponentProps<'input'>) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        No completar
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  )
}
