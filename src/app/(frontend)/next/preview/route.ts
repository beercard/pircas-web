import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload, type PayloadRequest } from 'payload'
import { getSafeRedirect } from 'payload/shared'

/**
 * Activa el modo borrador para un editor logueado y redirige a la página a previsualizar.
 * Requiere el PREVIEW_SECRET y una sesión válida del panel.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('No autorizado', { status: 403 })
  }
  const safePath = path ? getSafeRedirect({ fallbackTo: '', redirectTo: path }) : ''
  if (!safePath) return new Response('Ruta inválida', { status: 400 })

  const payload = await getPayload({ config: configPromise })
  let user = null
  try {
    ;({ user } = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    }))
  } catch (err) {
    payload.logger.error({ err }, 'preview: error verifying session')
  }

  const draft = await draftMode()
  if (!user) {
    draft.disable()
    return new Response('Iniciá sesión en el panel para usar la vista previa', { status: 403 })
  }

  draft.enable()
  redirect(safePath)
}
