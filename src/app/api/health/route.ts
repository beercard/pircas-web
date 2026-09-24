import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/** GET /api/health — estado de la app y la base (para healthchecks de Docker / monitoreo). */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.count({ collection: 'users', overrideAccess: true })
    return Response.json({ ok: true, db: 'up' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json(
      { ok: false, db: 'down' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
