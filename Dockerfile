# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# PIRCAS Aberturas — imagen de producción (Next.js standalone + Payload CMS)
#
# El build NO necesita base de datos ni secretos: las páginas se renderizan en el
# servidor al pedirlas y las migraciones se aplican solas al iniciar el contenedor.
# -----------------------------------------------------------------------------

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# --- Dependencias ---------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- Build ------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Herramientas (seed, migraciones manuales) — no se usa para servir el sitio ------
# docker compose --profile tools run --rm tools pnpm seed
FROM builder AS tools
ENV NODE_ENV=production
CMD ["pnpm", "migrate:status"]

# --- Runtime ------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache libc6-compat wget
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Carpeta de imágenes subidas desde el panel (montar como volumen).
RUN mkdir -p /app/public/media /app/.next/cache && chown -R nextjs:nodejs /app/public/media /app/.next/cache
VOLUME ["/app/public/media"]

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
