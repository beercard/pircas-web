/**
 * Carga el contenido inicial del sitio (catálogo, páginas, home y configuración).
 *
 *   pnpm seed                 # solo si la base está vacía
 *   SEED_FORCE=true pnpm seed # agrega igual (puede duplicar contenido)
 *
 * Opcional: SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD crean el primer super-admin.
 * Las imágenes son de reemplazo (con la descripción de la foto a subir).
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { seedCatalog } from './catalog'
import { seedContent } from './content'

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'products', overrideAccess: true })
if (existing.totalDocs > 0 && process.env.SEED_FORCE !== 'true') {
  payload.logger.info(
    'La base ya tiene contenido: no se ejecuta el seed (usá SEED_FORCE=true para forzarlo).',
  )
  process.exit(0)
}

payload.logger.info('Cargando contenido inicial…')
const catalog = await seedCatalog(payload)
await seedContent(payload, catalog)

const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env
if (email && password) {
  const users = await payload.count({ collection: 'users', overrideAccess: true })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'Administrador', email, password, role: 'super-admin' },
      overrideAccess: true,
    })
    payload.logger.info(`Super-admin creado: ${email}`)
  }
}

payload.logger.info('Contenido inicial cargado ✔')
process.exit(0)
