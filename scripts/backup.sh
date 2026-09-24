#!/usr/bin/env sh
# Backup de PIRCAS: base de datos (pg_dump) + imágenes subidas.
# Uso: ./scripts/backup.sh            → crea backups/AAAA-MM-DD_HHMM/{db.dump,media.tar.gz}
# Programalo con cron, ej. todos los días a las 3:00:
#   0 3 * * * cd /opt/pircas && ./scripts/backup.sh >> backups/backup.log 2>&1
set -eu
cd "$(dirname "$0")/.."
[ -f .env ] && . ./.env

STAMP=$(date +%Y-%m-%d_%H%M)
DEST="backups/$STAMP"
KEEP_DAYS=${BACKUP_KEEP_DAYS:-30}
mkdir -p "$DEST"

echo "→ Base de datos"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-pircas}" -d "${POSTGRES_DB:-pircas}" -Fc > "$DEST/db.dump"

echo "→ Imágenes"
docker compose run --rm --no-deps -v "$(pwd)/$DEST:/backup" --entrypoint sh app \
  -c "tar czf /backup/media.tar.gz -C /app/public media"

echo "→ Limpiando backups de más de $KEEP_DAYS días"
find backups -mindepth 1 -maxdepth 1 -type d -mtime +"$KEEP_DAYS" -exec rm -rf {} +

echo "✔ Backup listo en $DEST"
ls -lh "$DEST"
