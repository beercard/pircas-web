# PIRCAS Aberturas — sitio web + CMS

Sitio multi-página, autogestionable, para **Pircas Aberturas** (aberturas de aluminio a medida, Coronda, Santa Fe).

**Una aplicación · un código · un CMS · una base de datos:** Next.js 16 (App Router) + Payload CMS 3 + PostgreSQL.

|                         |                                                                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sitio público           | `/` · `/productos` · `/productos/[slug]` · `/lineas` · `/lineas/[slug]` · `/mamparas` · `/proyectos` · `/proyectos/[slug]` · `/nosotros` · `/cotizador` · `/contacto` · `/gracias` |
| Panel de administración | `/admin`                                                                                                                                                                           |
| API del CMS             | `/api/*` (REST de Payload) · `/api/forms/{contact,quote}` · `/api/health`                                                                                                          |
| Diseño                  | fuente aprobada en [`/design`](design/) (Claude Design exportado)                                                                                                                  |

Documentación detallada:

- [Arquitectura](docs/architecture.md) — cómo está armado y por qué
- [Uso del CMS](docs/cms.md) — guía para el equipo de Pircas
- [Deploy](docs/deployment.md) — VPS con Docker, Vercel, Node
- [Backups](docs/backup.md) — copia y restauración
- [Analítica](docs/analytics.md) — GTM, GA4, Meta Pixel, eventos y UTM
- [Migración desde el sitio actual](docs/migration.md) — mapa de URLs viejas → nuevas

---

## Requisitos

- Node.js ≥ 20.9 (recomendado 22 LTS)
- pnpm ≥ 10 (`npm i -g pnpm` o `corepack enable`)
- PostgreSQL ≥ 15 con codificación **UTF-8** (o Docker)
- Para producción: Docker + Docker Compose (o cualquier hosting Node)

## Instalación y desarrollo

```bash
pnpm install
cp .env.example .env            # completar PAYLOAD_SECRET y PREVIEW_SECRET (cadenas largas al azar)
docker compose -f docker-compose.dev.yml up -d   # PostgreSQL local en :5432 (o usá tu propia base)
pnpm migrate                    # crea las tablas
pnpm seed                       # carga el contenido inicial (catálogo, páginas, home, configuración)
pnpm dev                        # http://localhost:3000  ·  panel: http://localhost:3000/admin
```

La primera vez que entrás a `/admin` se crea el **primer usuario**, que queda como super administrador.
(Alternativa: definir `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` antes de `pnpm seed`.)

> Las imágenes del seed son **de reemplazo**: cada una indica qué foto real subir (ej. "Foto: ventanal de aluminio recién colocado…").
> Los 9 proyectos del seed son los del diseño aprobado: reemplazalos por obras reales antes de publicar.

### Scripts

| Script                                                                  | Qué hace                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm dev`                                                              | Servidor de desarrollo (Turbopack)                                        |
| `pnpm build` / `pnpm start`                                             | Build y servidor de producción                                            |
| `pnpm lint` · `pnpm typecheck` · `pnpm format`                          | Calidad de código (ESLint, TypeScript strict, Prettier)                   |
| `pnpm test:unit`                                                        | Tests unitarios + integración (Vitest; la integración usa `DATABASE_URL`) |
| `pnpm test:e2e`                                                         | Tests end-to-end en desktop, tablet y mobile (Playwright)                 |
| `pnpm migrate` · `pnpm migrate:create <nombre>` · `pnpm migrate:status` | Migraciones de base de datos                                              |
| `pnpm generate:types` · `pnpm generate:importmap`                       | Regenerar tipos y mapa de componentes del panel tras cambiar el esquema   |
| `pnpm seed`                                                             | Contenido inicial (solo si la base está vacía)                            |

### Cambios en el esquema del CMS (developers)

Nunca modificar la base a mano. Después de cambiar colecciones/globals/bloques:

```bash
pnpm generate:types          # actualiza src/payload-types.ts
pnpm migrate:create <nombre> # genera src/migrations/<fecha>_<nombre>.ts
pnpm migrate                 # aplica en local
```

En producción las migraciones pendientes se aplican **solas al iniciar** la app (`prodMigrations`).

## Variables de entorno

Todas están documentadas en [`.env.example`](.env.example). Las principales:

| Variable                                                                      | Uso                                                                                                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                                                                | Conexión a PostgreSQL                                                                                                          |
| `PAYLOAD_SECRET`                                                              | Firma sesiones del panel (obligatoria en producción)                                                                           |
| `PREVIEW_SECRET`                                                              | Protege la vista previa de borradores                                                                                          |
| `NEXT_PUBLIC_SITE_URL`                                                        | URL pública (canonical, sitemap, OpenGraph, CSRF). Se lee en tiempo de ejecución: la misma imagen sirve para cualquier dominio |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASSWORD` `SMTP_FROM` | Envío de emails (cualquier proveedor SMTP: Zimbra, Brevo, Resend…)                                                             |
| `LEADS_NOTIFICATION_EMAIL`                                                    | Destinatarios de avisos de consultas (se suman a los del panel)                                                                |
| `TURNSTILE_SITE_KEY` `TURNSTILE_SECRET_KEY`                                   | Antispam Cloudflare Turnstile (obligatorio en producción)                                                                      |
| `GOOGLE_TAG_MANAGER_ID` `GA4_MEASUREMENT_ID` `META_PIXEL_ID`                  | Valores por defecto de analítica (el panel puede sobrescribirlos)                                                              |
| `WHATSAPP_NUMBER`                                                             | Número por defecto (el panel lo sobrescribe)                                                                                   |

Nunca se suben secretos a git (`.env` está ignorado). Ningún secreto se envía al navegador.

## Docker (producción)

```bash
cp .env.example .env    # completar con valores de producción (contraseñas fuertes)
docker compose up -d --build                     # app + postgres
docker compose --profile tools run --rm tools pnpm seed   # contenido inicial (una sola vez)
docker compose --profile proxy up -d             # opcional: nginx con HTTPS
```

| Acción     | Comando                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| Iniciar    | `docker compose up -d`                                                    |
| Detener    | `docker compose down` (los datos quedan en los volúmenes)                 |
| Ver logs   | `docker compose logs -f app`                                              |
| Actualizar | `git pull && docker compose up -d --build` (las migraciones corren solas) |
| Backup     | `./scripts/backup.sh`                                                     |
| Restaurar  | `./scripts/restore.sh backups/<fecha>`                                    |
| Estado     | `curl http://127.0.0.1:3000/api/health`                                   |

Más detalles (Vercel, Node sin Docker, HTTPS, Cloudflare): [docs/deployment.md](docs/deployment.md).

## Uso del CMS (resumen)

Todo el contenido comercial se edita en `/admin` — no hay textos de negocio fijos en el código.

- **Catálogo → Productos / Líneas / Categorías**: nombre, textos, imágenes (arrastrar para ordenar), datos destacados, configuraciones, especificaciones técnicas, FAQ, precios de referencia del cotizador. SEO en la pestaña SEO.
- **Proyectos**: portfolio con galería, productos utilizados y datos técnicos.
- **Contenido → Home**: secciones con bloques reutilizables (arrastrar para reordenar, ocultar sin borrar, ocultar por dispositivo).
- **Contenido → Páginas**: Nosotros, Contacto, Cotizador, Mamparas y páginas nuevas, armadas con bloques.
- **Configuración**: datos del negocio, WhatsApp, menú (con mega menú), footer, asesor virtual, formularios/cotizador, analítica.
- **Consultas**: bandeja de contactos y cotizaciones con estado (nueva → contactada → calificada → presupuestada → ganada/perdida), notas internas, filtros, búsqueda y **Exportar CSV**.
- **SEO**: valores por defecto y **Redirecciones** 301/302.
- **Vista previa**: botón "Vista previa" / live preview en productos, líneas, proyectos, páginas y home — se ve el borrador antes de publicar. Historial de versiones con restauración.

Guía completa, paso a paso: [docs/cms.md](docs/cms.md).

## Calidad y verificación

- TypeScript strict, ESLint (reglas de Next + React Compiler) y Prettier.
- 66 tests unitarios/integración (validación, cotización, Turnstile, rate limit, CSRF, leads, relaciones, acceso, slugs, CSV, redirecciones, UTM…).
- 62 tests e2e en 3 tamaños de pantalla (páginas, navegación, menú mobile, cotizador, contacto, SEO técnico, sin scroll horizontal).

## Licencia

Código propiedad de Pircas Aberturas. Todos los derechos reservados.
