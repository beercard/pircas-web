# Arquitectura

## Visión general

```
                 ┌────────────────────── una app Next.js 16 ──────────────────────┐
 navegador ──►   │ proxy.ts (redirecciones CMS 301/302)                            │
                 │                                                                 │
                 │ (frontend)  Server Components ──► lib/data (caché etiquetada) ──┼──► Payload Local API ──► PostgreSQL
                 │   └─ islas cliente: menú, galerías, asesor, cotizador, forms    │         ▲
                 │ (payload)   /admin (panel) · /api/* (REST)                      │         │ hooks afterChange
                 │ api/forms   validación → Turnstile → lead → emails (SMTP)       │         └──► revalidateTag()
                 └─────────────────────────────────────────────────────────────────┘
```

- **Next.js 16 (App Router)** sirve el sitio y el panel. **Payload CMS 3** vive dentro de la misma app (`src/app/(payload)`), usa **PostgreSQL** vía Drizzle.
- No hay backend separado: los formularios públicos son un route handler (`src/app/api/forms/[form]`) que usa la Local API de Payload.

## Estructura

```
src/
  app/
    (frontend)/        sitio público (layout, páginas, preview, 404/500)
    (payload)/         panel /admin y API REST de Payload (generado)
    api/forms/[form]/  endpoint público de contacto y cotización
    api/health/        healthcheck
    sitemap.ts robots.ts
  blocks/              bloques reutilizables: configs.ts (esquema) + <Bloque>/Component.tsx + RenderBlocks.tsx
  collections/         Users, Media, Products, ProductLines, ProductCategories, Projects, ProjectCategories, Pages, Leads
  globals/             SiteSettings, Header, Footer, Homepage, ArchivePages, Advisor, FormsSettings, Analytics, SeoDefaults
  fields/              campos reutilizables (link, slug, galería, specs, datos destacados, ajustes de bloque)
  components/          ui/ (primitivas del diseño), layout/, cards/, catalog/, forms/, quote/, advisor/, analytics/, seo/, admin/
  lib/                 lógica pura y testeable: data/, forms/, quote/, leads/, email/, seo/, analytics/, routes, whatsapp, advisor, redirects, utm
  hooks/revalidate.ts  invalidación de caché desde el CMS
  seed/                contenido inicial
  migrations/          migraciones versionadas
  styles/globals.css   tokens de diseño (Tailwind v4 @theme)
  payload.config.ts    configuración del CMS
  proxy.ts             redirecciones administrables
```

## Renderizado y caché

- **Server Components por defecto.** Componentes cliente solo donde hay interacción: header (scroll/mega menú), menú mobile, galerías, asesor, cotizador, formularios, tracking.
- Las páginas se renderizan **en el servidor en cada request** (`dynamic = 'force-dynamic'` en el layout del sitio), leyendo el CMS a través de la **caché de datos de Next** (`unstable_cache`) con **etiquetas** (`lib/cache-tags.ts`).
  - Las lecturas al CMS quedan en caché → TTFB bajo (≈100 ms en producción local).
  - Al publicar en el panel, los hooks `afterChange/afterDelete` llaman `revalidateTag(tag, { expire: 0 })` → el cambio se ve en la siguiente visita, **sin rebuild ni deploy**.
  - Cambios transversales (una imagen, datos del negocio, SEO) invalidan la etiqueta `cms`.
  - Por qué no SSG/ISR puro: el build no necesita base de datos (imagen Docker portable), la vista previa de borradores es trivial y las redirecciones del CMS aplican a cualquier URL. Si se quisiera más caché, se puede poner nginx/Cloudflare con microcaché delante.
- **Modo borrador**: `/next/preview` (valida `PREVIEW_SECRET` + sesión del panel) activa `draftMode`; la capa de datos omite la caché y lee borradores. Live preview del panel con `RefreshRouteOnSave`.

## Modelo de datos (resumen)

| Colección | Claves | Relaciones |
|---|---|---|
| `products` | slug (único, indexado), `_status`, featured, order | `category → product-categories`, `line → product-lines` |
| `product-lines` | slug, `_status`, order, precios del cotizador | — |
| `product-categories` | slug, `_status`, order | — |
| `projects` | slug, `_status`, featured, order | `category → project-categories[]`, `line`, `productsUsed → products[]` |
| `pages` | slug (reservados y protegidos), bloques | enlaces a cualquier contenido |
| `leads` | type (contact/quotation), status, createdAt, email, projectType (indexados) | `product`, `productLine`, ítems con `product` y `line` |
| `media` | alt obligatorio, punto focal, tamaños WebP | — |
| `redirects` | from, to (URL o referencia), 301/302 | plugin oficial |

Índices en `slug`, `_status`, `category`, `line`, `featured`, `order`, `createdAt` (ver `src/migrations`).
Versiones y borradores en productos, líneas, categorías, proyectos, páginas y home (historial con restauración).

**Localización**: los campos de texto ya están marcados `localized: true`. Para sumar un idioma, configurar `localization` en `payload.config.ts` y generar una migración (ver docs/cms.md).

## Bloques

`src/blocks/configs.ts` define todos los bloques; cada uno tiene su componente y se registra en `RenderBlocks.tsx`. Todos comparten `settings` (ocultar, fondo, espaciado, ancla, ocultar en mobile/tablet/desktop). La home, las páginas y los listados (`archive-pages.after`) usan los mismos bloques.

Hero · Frase de marca · Texto + imagen · Beneficios · Líneas · Categorías · Grilla de productos · Pasos/pilares · Asesor virtual · Llamado a la acción · Grilla de proyectos · Galería · FAQ · Contacto · Cotizador · Texto enriquecido · Video · Espaciador.

## Formularios y leads

`POST /api/forms/{contact|quote}`:

1. Origen (CSRF): `Origin/Referer` debe ser el sitio; solo `application/json`.
2. Límite por IP (`FORM_RATE_LIMIT` cada 10 min; en memoria — ver nota multi-instancia).
3. Validación con **zod** (mismos esquemas que el navegador, `lib/forms/schemas.ts`), limpieza de caracteres de control y longitudes.
4. Honeypot (bots: respuesta "ok" sin guardar).
5. **Turnstile** verificado en el servidor (falla cerrado en producción sin clave).
6. Cotización: productos/líneas se validan contra el catálogo publicado y **el precio se recalcula en el servidor** (`lib/quote/pricing.ts`).
7. Se crea el lead (la API REST de leads no permite crear) y se envían emails (aviso al equipo + confirmación al cliente). Un fallo de SMTP no pierde la consulta.

> Multi-instancia: el rate limit es en memoria. Detrás de un balanceador con varias réplicas, implementar `RateLimitStore` con Redis.

## Seguridad

RBAC (super-admin / editor, `src/access`), cookies seguras, bloqueo tras 5 intentos de login, CSRF de Payload + verificación de origen, Turnstile, rate limiting, validación server-side, emails con HTML escapado, CSV protegido contra fórmulas, cabeceras de seguridad (`next.config.ts`), SVG subidos servidos con CSP `sandbox`, panel `noindex`, GraphQL deshabilitado, secretos solo en variables de entorno.

## Rendimiento

next/image (AVIF/WebP, `sizes` por bloque, lazy loading, prioridad solo en el hero), originales limitados a 2560 px y tamaños WebP generados al subir, fuentes con `next/font` (auto-hospedadas, `display: swap`), scripts de analítica `afterInteractive`, video "facade" (el iframe carga al hacer clic), CSS de Tailwind v4 sin runtime, sin librerías de animación.
