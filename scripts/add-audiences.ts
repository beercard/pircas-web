/**
 * Agrega las secciones "Para tu casa" y "Obras y profesionales" (páginas, home, menú y footer)
 * a una base que ya tiene contenido. Idempotente.
 *   pnpm payload run scripts/add-audiences.ts
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seedAudiences } from '../src/seed/audiences'

const payload = await getPayload({ config })
await seedAudiences(payload)
process.exit(0)
