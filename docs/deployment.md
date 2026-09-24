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

## Opción B — Vercel (en uso: https://pircas-web.vercel.app)

Proyecto `pircas-web` conectado a GitHub (`main` → producción; cada push despliega).

- **Base**: Neon (Marketplace de Vercel, región São Paulo). Inyecta `DATABASE_URL`.
- **Imágenes**: Vercel Blob público `pircas-media` (São Paulo). Inyecta `BLOB_READ_WRITE_TOKEN`; con esa variable `src/plugins.ts` guarda los medios en Blob y el panel sube directo desde el navegador (sin el límite de 4,5 MB por request). Sin la variable (local, Docker) se usa el disco.
- **Variables propias**: `PAYLOAD_SECRET` y `PREVIEW_SECRET` (secretas). `NEXT_PUBLIC_SITE_URL` no hace falta mientras se use `*.vercel.app` (se toma de Vercel); cargarla al conectar el dominio propio. SMTP, Turnstile, etc.: ver `.env.example`.
- **Build** (`vercel.json`): `pnpm run build:vercel` = `payload migrate && next build`. Las migraciones se aplican en cada deploy (producción y previews usan la misma base).
- **Funciones** en `gru1` (São Paulo), junto a la base.
- `robots.txt` bloquea previews y `*.vercel.app`: solo se indexa el dominio propio.
- Rate limiting: en serverless cada instancia tiene su propia memoria → para un límite global implementar `RateLimitStore` con Upstash Redis (`src/lib/forms/rate-limit.ts`). Turnstile + honeypot siguen protegiendo.

Comandos útiles (con la CLI `vercel` vinculada):

```bash
vercel env pull .env.production.local --environment production   # credenciales de producción (NO usar .env.local: pnpm dev escribiría en la base real)
vercel logs pircas-web.vercel.app
vercel cache purge --type data --yes   # si se cargan datos por fuera del panel (p. ej. el seed) y el sitio muestra datos viejos
```

Contenido inicial en una base nueva: exportar las variables de producción en la terminal y correr `pnpm migrate && pnpm seed`, luego purgar la caché de datos.

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
