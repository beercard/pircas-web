/**
 * Aplica el SEO de las páginas fijas (títulos y descripciones gestionados por código).
 *   pnpm payload run scripts/apply-seo.ts
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { applySeo } from '../src/seed/seo'

const payload = await getPayload({ config })
await applySeo(payload)
process.exit(0)
