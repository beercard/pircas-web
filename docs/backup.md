# Backups

Hay dos cosas que respaldar:

1. **Base de datos** (todo el contenido, consultas, usuarios, configuración) → `pg_dump`.
2. **Imágenes subidas** (volumen `media`, `/app/public/media`) → archivo `tar.gz`.

El código está en git; `.env` (secretos) debe guardarse aparte en un lugar seguro (gestor de contraseñas).

## Backup manual

```bash
./scripts/backup.sh
# → backups/AAAA-MM-DD_HHMM/db.dump   (formato custom de pg_dump, comprimido)
# → backups/AAAA-MM-DD_HHMM/media.tar.gz
```

Borra automáticamente los backups de más de `BACKUP_KEEP_DAYS` días (30 por defecto).

## Backup automático (cron)

```bash
crontab -e
# todos los días a las 3:00
0 3 * * * cd /opt/pircas && ./scripts/backup.sh >> backups/backup.log 2>&1
```

## Copia fuera del servidor (muy recomendado)

Un backup en el mismo VPS no protege ante la pérdida del servidor. Sincronizar `backups/` a otro lugar, por ejemplo con [rclone](https://rclone.org/) a Google Drive, S3, Backblaze B2 o Cloudflare R2:

```bash
# después del backup diario
30 3 * * * rclone sync /opt/pircas/backups remoto:pircas-backups --max-age 35d
```

## Restaurar

```bash
./scripts/restore.sh backups/2026-09-24_0300
```

Detiene la app, restaura la base (`pg_restore --clean`) y las imágenes, y vuelve a iniciar. Pide confirmación.

### Restaurar en un servidor nuevo

1. Instalar Docker, clonar el repo, copiar el `.env` guardado.
2. `docker compose up -d postgres` y esperar que esté sano.
3. Copiar la carpeta del backup a `backups/`.
4. `docker compose up -d --build app` (crea el esquema) y luego `./scripts/restore.sh backups/<fecha>`.

### Probar los backups

Al menos una vez por trimestre restaurar el último backup en un entorno de prueba y verificar que el sitio y el panel funcionen.

## Almacenamiento externo de imágenes

Si en el futuro las imágenes pasan a S3/R2 (ver docs/deployment.md), el backup de imágenes lo cubre el proveedor (versionado del bucket) y `backup.sh` solo necesita la base.
