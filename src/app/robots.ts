import type { MetadataRoute } from 'next'

import { absoluteUrl, getSiteUrl } from '@/lib/routes'

// Se calcula en cada request (no en el build) para no publicar un robots.txt equivocado.
export const dynamic = 'force-dynamic'

/** robots.txt: excluye panel, API, vista previa y rutas internas. */
export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production') &&
    // *.vercel.app es la dirección técnica: solo se indexa el dominio propio.
    !/localhost|127\.0\.0\.1|staging|test|vercel\.app/.test(getSiteUrl())
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
