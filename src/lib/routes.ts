/**
 * Fuente única de verdad para las URLs públicas del sitio.
 * Es un módulo puro (sin dependencias de Payload/Next) para poder usarse en
 * el proxy, en hooks del CMS, en el sitemap y en componentes.
 */

export const ROUTES = {
  home: '/',
  products: '/productos',
  lines: '/lineas',
  mamparas: '/mamparas',
  projects: '/proyectos',
  about: '/nosotros',
  quote: '/cotizador',
  contact: '/contacto',
  thanks: '/gracias',
} as const

export type RoutableCollection =
  'pages' | 'products' | 'product-lines' | 'product-categories' | 'projects' | 'project-categories'

/** Páginas del CMS con ruta propia que no pueden eliminarse (enlazadas desde CTAs). */
export const PROTECTED_PAGE_SLUGS = ['nosotros', 'contacto', 'cotizador', 'mamparas'] as const

/** Slugs de páginas del CMS que chocarían con rutas fijas del sitio. */
export const RESERVED_PAGE_SLUGS = [
  'admin',
  'api',
  'next',
  'productos',
  'lineas',
  'proyectos',
  'gracias',
  'sitemap.xml',
  'robots.txt',
] as const

export function pathFor(collection: RoutableCollection, slug?: string | null): string {
  if (!slug) return ROUTES.home
  const s = encodeURIComponent(slug)
  switch (collection) {
    case 'pages':
      return slug === 'home' ? ROUTES.home : `/${s}`
    case 'products':
      return `${ROUTES.products}/${s}`
    case 'product-lines':
      return `${ROUTES.lines}/${s}`
    case 'product-categories':
      return `${ROUTES.products}?categoria=${s}`
    case 'projects':
      return `${ROUTES.projects}/${s}`
    case 'project-categories':
      return `${ROUTES.projects}?categoria=${s}`
  }
}

export function absoluteUrl(path: string, base = getSiteUrl()): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

// Clave dinámica a propósito: Next reemplaza `process.env.NEXT_PUBLIC_*` en tiempo de build;
// leyéndola así, el servidor toma el valor en tiempo de ejecución y la misma imagen Docker
// sirve para cualquier dominio sin recompilar.
const SITE_URL_KEY = 'NEXT_PUBLIC_SITE_URL'

export function getSiteUrl(): string {
  const url = process.env[SITE_URL_KEY] || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}
