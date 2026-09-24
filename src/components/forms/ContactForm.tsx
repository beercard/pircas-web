'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics/track'
import { contactSchema, type ContactData, type ContactInput } from '@/lib/forms/schemas'

import { Honeypot, SelectField, TextAreaField, TextField } from './fields'
import { submitForm } from './submit'
import { Turnstile } from './Turnstile'

type Props = {
  projectTypes: string[]
  turnstileSiteKey: string | null
  success: { title: string; message: string }
  privacyNote?: string | null
  /** Producto/línea desde el que se consulta (opcional). */
  context?: { productId?: number; lineId?: number }
}

/** Formulario de contacto (campos con línea inferior, como el diseño). */
export function ContactForm({
  projectTypes,
  turnstileSiteKey,
  success,
  privacyNote,
  context,
}: Props) {
  const [token, setToken] = useState<string | undefined>()
  const [resetSignal, setResetSignal] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)
  const onToken = useCallback((t: string | undefined) => setToken(t), [])

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      projectType: '',
      message: '',
      website: '',
    },
  })

  const onSubmit = async (data: ContactData) => {
    setServerError(null)
    const result = await submitForm('contact', { ...data, ...context, turnstileToken: token })
    if (result.ok) {
      track('contact_submit', { project_type: data.projectType || undefined })
      setStatus('sent')
      reset()
    } else {
      setStatus('error')
      setServerError(result.error)
      for (const [field, message] of Object.entries(result.fields ?? {})) {
        setError(field as keyof ContactInput, { message })
      }
    }
    setResetSignal((n) => n + 1)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative flex flex-col gap-[18px] border-t border-line-strong pt-[26px]"
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,11.875rem),1fr))] gap-[18px]">
        <TextField
          label="Nombre"
          autoComplete="given-name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Apellido"
          autoComplete="family-name"
          optional
          error={errors.lastName?.message}
          {...register('lastName')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <TextField
        label="Ciudad"
        autoComplete="address-level2"
        optional
        error={errors.city?.message}
        {...register('city')}
      />
      {projectTypes.length > 0 && (
        <SelectField
          label="Tipo de proyecto"
          options={projectTypes}
          placeholder="Elegí una opción"
          optional
          {...register('projectType')}
        />
      )}
      <TextAreaField
        label="Mensaje"
        rows={4}
        error={errors.message?.message}
        {...register('message')}
      />
      <Honeypot {...register('website')} />
      <Turnstile siteKey={turnstileSiteKey} onToken={onToken} resetSignal={resetSignal} />

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
        <div aria-live="polite" className="text-[0.8125rem] font-normal">
          {status === 'sent' ? (
            <span className="text-brand">
              <strong className="font-semibold">{success.title}</strong> {success.message}
            </span>
          ) : serverError ? (
            <span className="text-danger">{serverError}</span>
          ) : (
            <span className="text-muted">{privacyNote || 'Sin compromiso.'}</span>
          )}
        </div>
        <Button type="submit" variant="dark" arrow disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar consulta'}
        </Button>
      </div>
    </form>
  )
}
