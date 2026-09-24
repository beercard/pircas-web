import { getAttribution } from '@/lib/utm'

export type SubmitResult =
  | { ok: true; id?: number; total?: number | null }
  | { ok: false; error: string; fields?: Record<string, string> }

/** Envía un formulario público al endpoint del servidor, adjuntando UTM y página de origen. */
export async function submitForm(
  form: 'contact' | 'quote',
  data: Record<string, unknown>,
): Promise<SubmitResult> {
  try {
    const res = await fetch(`/api/forms/${form}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        attribution: getAttribution(),
        pageUrl: window.location.pathname,
      }),
    })
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (res.ok && body.ok)
      return {
        ok: true,
        id: body.id as number | undefined,
        total: body.total as number | null | undefined,
      }
    return {
      ok: false,
      error: (body.error as string) || 'No pudimos enviar tu consulta. Intentá de nuevo.',
      fields: body.fields as Record<string, string> | undefined,
    }
  } catch {
    return { ok: false, error: 'Sin conexión. Revisá tu internet e intentá de nuevo.' }
  }
}
