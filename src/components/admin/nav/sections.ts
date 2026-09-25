/**
 * Estructura del menú del panel, pensada por tareas (como Shopify / Tiendanube) y no por el
 * modelo de datos: 7 entradas principales; lo técnico queda dentro de "Configuración".
 * Cada ítem se muestra solo si el usuario puede ver esa sección.
 * SEO, redirecciones, menú y footer no están: se gestionan por código.
 */

export type NavIconName =
  'home' | 'inbox' | 'package' | 'briefcase' | 'layout' | 'images' | 'settings'

export type NavEntity = { type: 'collections' | 'globals'; slug: string }

export type NavLeaf = { label: string; entity: NavEntity }

export type NavSectionConfig = {
  key: string
  label: string
  icon: NavIconName
  /** Sin ítems: enlace directo (Inicio). */
  href?: string
  items?: NavLeaf[]
  badge?: 'newLeads'
}

const c = (slug: string): NavEntity => ({ type: 'collections', slug })
const g = (slug: string): NavEntity => ({ type: 'globals', slug })

export const NAV_SECTIONS: NavSectionConfig[] = [
  { key: 'home', label: 'Inicio', icon: 'home', href: '' },
  {
    key: 'leads',
    label: 'Consultas',
    icon: 'inbox',
    badge: 'newLeads',
    items: [{ label: 'Consultas', entity: c('leads') }],
  },
  {
    key: 'catalog',
    label: 'Productos',
    icon: 'package',
    items: [
      { label: 'Productos', entity: c('products') },
      { label: 'Líneas', entity: c('product-lines') },
      { label: 'Categorías', entity: c('product-categories') },
    ],
  },
  {
    key: 'projects',
    label: 'Trabajos',
    icon: 'briefcase',
    items: [
      { label: 'Trabajos realizados', entity: c('projects') },
      { label: 'Categorías', entity: c('project-categories') },
    ],
  },
  {
    key: 'site',
    label: 'Páginas del sitio',
    icon: 'layout',
    items: [
      { label: 'Página de inicio', entity: g('homepage') },
      { label: 'Otras páginas', entity: c('pages') },
      { label: 'Listados', entity: g('archive-pages') },
    ],
  },
  {
    key: 'media',
    label: 'Fotos y archivos',
    icon: 'images',
    items: [{ label: 'Fotos y archivos', entity: c('media') }],
  },
  {
    key: 'settings',
    label: 'Configuración',
    icon: 'settings',
    items: [
      { label: 'Datos del negocio', entity: g('site-settings') },
      { label: 'Formularios y cotizador', entity: g('forms-settings') },
      { label: 'Asesor virtual', entity: g('advisor') },
      { label: 'Analítica', entity: g('analytics') },
      { label: 'Usuarios', entity: c('users') },
    ],
  },
]

export const entityPath = ({ type, slug }: NavEntity) => `/${type}/${slug}`
