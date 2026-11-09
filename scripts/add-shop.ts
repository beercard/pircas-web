/**
 * Configura la tienda online y carga productos de ejemplo con precio en una base que ya
 * tiene contenido. Idempotente.
 *   pnpm payload run scripts/add-shop.ts
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seedShop } from '../src/seed/shop'

const payload = await getPayload({ config })
await seedShop(payload)
process.exit(0)
