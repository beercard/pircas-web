import type { MetadataRoute } from 'next'

import { absoluteUrl, getSiteUrl } from '@/lib/routes'

// Se calcula en cada request (no en el build) para no publicar un robots.txt equivocado.
export const dynamic = 'force-dynamic'

/** robots.txt: excluye panel, API, vista previa y rutas internas. */
export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    !/localhost|127\.0\.0\.1|staging|test/.test(getSiteUrl())
  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/next/', '/gracias', '/*?*q='],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
