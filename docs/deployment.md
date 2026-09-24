# Deploy

La app es un único servicio Node (Next.js standalone) + PostgreSQL. No depende de ningún proveedor.

## Opción A — VPS con Docker (recomendada)

Requisitos: VPS Linux (2 GB RAM mínimo, 4 GB recomendado para compilar), Docker y Docker Compose, dominio apuntando al servidor.

```bash
git clone <repo> /opt/pircas && cd /opt/pircas
cp .env.example .env
```

Completar en `.env` (valores de producción):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://pircas.com.ar` |
| `POSTGRES_PASSWORD` | contraseña larga al azar |
| `PAYLOAD_SECRET`, `PREVIEW_SECRET` | `openssl rand -hex 32` |
| `SMTP_*`, `LEADS_NOTIFICATION_EMAIL` | datos del proveedor de email |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | de Cloudflare → Turnstile (dominio `pircas.com.ar`) |

```bash
docker compose up -d --build                             # app + base (migraciones automáticas)
docker compose --profile tools run --rm tools pnpm seed  # contenido inicial (solo la primera vez)
curl http://127.0.0.1:3000/api/health                    # {"ok":true,"db":"up"}
```

La app escucha en `127.0.0.1:3000`. Para exponerla:

- **nginx incluido**: poner `fullchain.pem` y `privkey.pem` en `deploy/certs/` (ej. con certbot) y `docker compose --profile proxy up -d`. Config en `deploy/nginx.conf` (HTTPS, www → raíz, gzip, caché de assets, límite de subida 20 MB).
- **Cloudflare** delante (recomendado: CDN + protección): registro A proxificado, modo SSL "Full (strict)", certificado de origen en `deploy/certs`.
- **Otro proxy** (Caddy, Traefik, panel del hosting): apuntar a `127.0.0.1:3000` y enviar `X-Forwarded-For` / `X-Forwarded-Proto`.

Primer acceso: `https://pircas.com.ar/admin` → crear el primer usuario (queda super-admin).

### Actualizar

```bash
cd /opt/pircas
./scripts/backup.sh          # siempre antes de actualizar
git pull
docker compose up -d --build # reconstruye y aplica migraciones al iniciar
docker compose logs -f app
```

### Operación

| | |
|---|---|
| Logs | `docker compose logs -f app` (JSON estructurado de Payload/pino) |
| Reiniciar | `docker compose restart app` |
| Detener todo | `docker compose down` (datos persisten en volúmenes `pgdata` y `media`) |
| Consola SQL | `docker compose exec postgres psql -U pircas pircas` |
| Estado de migraciones | `docker compose --profile tools run --rm tools pnpm migrate:status` |

## Opción B — Vercel (u otra plataforma serverless)

- Base PostgreSQL gestionada (Neon, Supabase, RDS…) en `DATABASE_URL`.
- **Imágenes**: el sistema de archivos de Vercel es efímero → usar almacenamiento de objetos. Instalar `@payloadcms/storage-s3` (S3/R2/Spaces) o `@payloadcms/storage-vercel-blob` y agregarlo a `plugins` en `src/plugins.ts` para la colección `media`.
- Rate limiting: en serverless cada instancia tiene su propia memoria → implementar `RateLimitStore` con Redis/Upstash (`src/lib/forms/rate-limit.ts`).
- Las migraciones se aplican al iniciar (o en el build con `pnpm migrate && pnpm build`).

## Opción C — Node sin Docker

```bash
pnpm install --frozen-lockfile
pnpm build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
cd .next/standalone && NODE_ENV=production PORT=3000 node server.js   # con las variables de .env cargadas
```

Usar PM2 o systemd para mantenerlo vivo, y un proxy con HTTPS delante. `MEDIA_DIR` define la carpeta de imágenes (por defecto `./public/media` del directorio de trabajo).

## Checklist de salida a producción

- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio final (https)
- [ ] Secretos generados al azar; `.env` fuera de git
- [ ] SMTP probado (enviar una consulta de prueba y verificar aviso + confirmación)
- [ ] Turnstile con claves de producción
- [ ] Destinatarios de avisos cargados (panel o `LEADS_NOTIFICATION_EMAIL`)
- [ ] IDs de analítica cargados (Configuración → Analítica) y verificados con GTM/Pixel Helper
- [ ] Fotos reales reemplazando las imágenes de reemplazo; proyectos del seed reemplazados por obras reales
- [ ] Redirecciones de URLs viejas (ver [migration.md](migration.md))
- [ ] Backups programados (cron) y una restauración probada
- [ ] Google Search Console: verificar dominio y enviar `/sitemap.xml`
- [ ] SEO general: "Ocultar todo el sitio" desactivado
