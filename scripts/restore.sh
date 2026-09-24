#!/usr/bin/env sh
# Restaura un backup creado con scripts/backup.sh.
# Uso: ./scripts/restore.sh backups/AAAA-MM-DD_HHMM
# ATENCIÓN: reemplaza la base y las imágenes actuales.
set -eu
cd "$(dirname "$0")/.."
[ -f .env ] && . ./.env
SRC=${1:?Indicá la carpeta del backup, ej: backups/2026-09-24_0300}
[ -f "$SRC/db.dump" ] || { echo "No existe $SRC/db.dump"; exit 1; }

printf "Esto reemplaza la base y las imágenes actuales con %s. ¿Continuar? [s/N] " "$SRC"
read -r ok
[ "$ok" = "s" ] || { echo "Cancelado."; exit 1; }

echo "→ Deteniendo la app"
docker compose stop app

echo "→ Restaurando base de datos"
docker compose exec -T postgres pg_restore -U "${POSTGRES_USER:-pircas}" -d "${POSTGRES_DB:-pircas}" --clean --if-exists --no-owner < "$SRC/db.dump"

if [ -f "$SRC/media.tar.gz" ]; then
  echo "→ Restaurando imágenes"
  docker compose run --rm --no-deps -v "$(pwd)/$SRC:/backup" --entrypoint sh app \
    -c "rm -rf /app/public/media/* && tar xzf /backup/media.tar.gz -C /app/public"
fi

echo "→ Iniciando la app"
docker compose start app
echo "✔ Restauración completa"
