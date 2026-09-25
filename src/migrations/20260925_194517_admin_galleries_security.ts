import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Panel simplificado:
 * - Galerías (productos, líneas, trabajos y bloque Galería): de "filas con una foto cada una"
 *   a un campo de fotos múltiples (se eligen/suben varias a la vez y se ordenan arrastrando).
 *   Se copian las fotos en el mismo orden y los epígrafes pasan a cada foto (Medios → Epígrafe)
 *   si la foto no tenía uno. Se verifica que no falte ninguna antes de borrar las tablas viejas.
 * - Medios: el texto alternativo pasa a ser opcional (se completa solo si queda vacío).
 * - Usuarios: último acceso.
 */

type Db = MigrateUpArgs['db']

/** Galerías de colecciones (array → relaciones). */
const COLLECTION_GALLERIES = [
  { rows: 'products_gallery', rels: 'products_rels', path: 'gallery' },
  { rows: '_products_v_version_gallery', rels: '_products_v_rels', path: 'version.gallery' },
  { rows: 'product_lines_gallery', rels: 'product_lines_rels', path: 'gallery' },
  {
    rows: '_product_lines_v_version_gallery',
    rels: '_product_lines_v_rels',
    path: 'version.gallery',
  },
  { rows: 'projects_gallery', rels: 'projects_rels', path: 'gallery' },
  { rows: '_projects_v_version_gallery', rels: '_projects_v_rels', path: 'version.gallery' },
]

/** Bloque Galería (fotos dentro de un bloque: la ruta incluye la posición del bloque). */
const BLOCK_GALLERIES = [
  { rows: 'pages_blocks_gallery_images', block: 'pages_blocks_gallery', rels: 'pages_rels' },
  {
    rows: '_pages_v_blocks_gallery_images',
    block: '_pages_v_blocks_gallery',
    rels: '_pages_v_rels',
  },
  {
    rows: 'homepage_blocks_gallery_images',
    block: 'homepage_blocks_gallery',
    rels: 'homepage_rels',
  },
  {
    rows: '_homepage_v_blocks_gallery_images',
    block: '_homepage_v_blocks_gallery',
    rels: '_homepage_v_rels',
  },
  {
    rows: 'archives_blocks_gallery_images',
    block: 'archives_blocks_gallery',
    rels: 'archives_rels',
  },
]

async function count(db: Db, query: string): Promise<number> {
  const res = await db.execute(sql.raw(query))
  return Number((res.rows[0] as { n: number | string }).n)
}

async function tableExists(db: Db, table: string): Promise<boolean> {
  return (
    (await count(
      db,
      `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}'`,
    )) > 0
  )
}

/** Epígrafes de las filas viejas → la propia foto (sin pisar uno existente). */
async function keepCaptions(db: Db, rows: string) {
  await db.execute(
    sql.raw(`UPDATE "media" m SET "caption" = g."caption"
      FROM (SELECT DISTINCT ON ("image_id") "image_id", "caption" FROM "${rows}"
            WHERE "image_id" IS NOT NULL AND coalesce("caption", '') <> '' ORDER BY "image_id") g
      WHERE m."id" = g."image_id" AND coalesce(m."caption", '') = ''`),
  )
}

async function copyGalleriesUp(db: Db, log: (msg: string) => void) {
  for (const g of COLLECTION_GALLERIES) {
    if (!(await tableExists(db, g.rows))) continue
    const source = await count(db, `SELECT count(*)::int AS n FROM "${g.rows}" WHERE "image_id" IS NOT NULL`)
    await keepCaptions(db, g.rows)
    await db.execute(
      sql.raw(`INSERT INTO "${g.rels}" ("order", "parent_id", "path", "media_id")
        SELECT "_order", "_parent_id", '${g.path}', "image_id" FROM "${g.rows}" WHERE "image_id" IS NOT NULL`),
    )
    const copied = await count(
      db,
      `SELECT count(*)::int AS n FROM "${g.rels}" WHERE "path" = '${g.path}' AND "media_id" IS NOT NULL`,
    )
    if (copied !== source) throw new Error(`${g.rows}: se copiaron ${copied} de ${source} fotos.`)
    if (source) log(`${g.rows}: ${source} fotos pasadas a galería múltiple`)
  }
  for (const g of BLOCK_GALLERIES) {
    if (!(await tableExists(db, g.rows))) continue
    const source = await count(db, `SELECT count(*)::int AS n FROM "${g.rows}" WHERE "image_id" IS NOT NULL`)
    if (!source) continue
    await keepCaptions(db, g.rows)
    await db.execute(
      sql.raw(`INSERT INTO "${g.rels}" ("order", "parent_id", "path", "media_id")
        SELECT i."_order", b."_parent_id", b."_path" || '.' || (b."_order" - 1) || '.images', i."image_id"
        FROM "${g.rows}" i JOIN "${g.block}" b ON i."_parent_id" = b."id"
        WHERE i."image_id" IS NOT NULL`),
    )
    const copied = await count(
      db,
      `SELECT count(*)::int AS n FROM "${g.rels}" WHERE "path" LIKE '%.images' AND "media_id" IS NOT NULL`,
    )
    if (copied !== source) throw new Error(`${g.rows}: se copiaron ${copied} de ${source} fotos.`)
    log(`${g.rows}: ${source} fotos pasadas a galería múltiple`)
  }
}

/** Vuelta atrás: relaciones → filas (ids nuevos para las filas). */
async function idColumns(db: Db, table: string): Promise<{ cols: string; values: (ref: string) => string }> {
  const res = await db.execute(
    sql.raw(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = '${table}' AND column_name IN ('id', '_uuid')`,
    ),
  )
  const cols = res.rows as { column_name: string; data_type: string }[]
  const random = (ref: string) => `substr(md5(random()::text || ${ref}::text), 1, 24)`
  const textId = cols.some((c) => c.column_name === 'id' && c.data_type !== 'integer')
  const uuid = cols.some((c) => c.column_name === '_uuid')
  // Tablas de versiones: id numérico automático + _uuid; tablas normales: id de texto.
  return {
    cols: [textId && '"id"', uuid && '"_uuid"'].filter(Boolean).join(', '),
    values: (ref) => [textId && random(ref), uuid && random(ref)].filter(Boolean).join(', '),
  }
}

async function copyGalleriesDown(db: Db) {
  for (const g of COLLECTION_GALLERIES) {
    if (!(await tableExists(db, g.rows))) continue
    const ids = await idColumns(db, g.rows)
    await db.execute(
      sql.raw(`INSERT INTO "${g.rows}" ("_order", "_parent_id", ${ids.cols}, "image_id")
        SELECT "order", "parent_id", ${ids.values('"id"')}, "media_id" FROM "${g.rels}"
        WHERE "path" = '${g.path}' AND "media_id" IS NOT NULL`),
    )
  }
  for (const g of BLOCK_GALLERIES) {
    if (!(await tableExists(db, g.rows))) continue
    const ids = await idColumns(db, g.rows)
    await db.execute(
      sql.raw(`INSERT INTO "${g.rows}" ("_order", "_parent_id", ${ids.cols}, "image_id")
        SELECT r."order", b."id", ${ids.values('r."id"')}, r."media_id"
        FROM "${g.rels}" r JOIN "${g.block}" b
          ON b."_parent_id" = r."parent_id" AND r."path" = b."_path" || '.' || (b."_order" - 1) || '.images'
        WHERE r."media_id" IS NOT NULL`),
    )
  }
}

const isDrop = (s: string) => /^DROP (TABLE|TYPE)/.test(s) || / DROP COLUMN /.test(s)
const statements = (text: string) =>
  text
    .split(/;\r?\n/)
    .map((s) => s.trim().replace(/;$/, ''))
    .filter(Boolean)

async function run(db: Db, list: string[]) {
  for (const s of list) await db.execute(sql.raw(s))
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const all = statements(UP_SQL)
  await run(db, all.filter((s) => !isDrop(s)))
  await copyGalleriesUp(db, (msg) => payload.logger.info(msg))
  await run(db, all.filter(isDrop))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const all = statements(DOWN_SQL)
  await run(db, all.filter((s) => !isDrop(s)))
  await copyGalleriesDown(db)
  await run(db, all.filter(isDrop))
}

// SQL generado por drizzle-kit.
const UP_SQL = String.raw`
CREATE TABLE "products_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

CREATE TABLE "_products_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

CREATE TABLE "product_lines_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

CREATE TABLE "_product_lines_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

ALTER TABLE "products_gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_products_v_version_gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "product_lines_gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_product_lines_v_version_gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "projects_gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_projects_v_version_gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
DROP TABLE "products_gallery" CASCADE;
DROP TABLE "_products_v_version_gallery" CASCADE;
DROP TABLE "product_lines_gallery" CASCADE;
DROP TABLE "_product_lines_v_version_gallery" CASCADE;
DROP TABLE "projects_gallery" CASCADE;
DROP TABLE "_projects_v_version_gallery" CASCADE;
DROP TABLE "pages_blocks_gallery_images" CASCADE;
DROP TABLE "_pages_v_blocks_gallery_images" CASCADE;
DROP TABLE "homepage_blocks_gallery_images" CASCADE;
DROP TABLE "_homepage_v_blocks_gallery_images" CASCADE;
DROP TABLE "archives_blocks_gallery_images" CASCADE;
ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
ALTER TABLE "projects_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "_projects_v_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "pages_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "_pages_v_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp(3) with time zone;
ALTER TABLE "homepage_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "_homepage_v_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "archives_rels" ADD COLUMN "media_id" integer;
ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_lines_rels" ADD CONSTRAINT "product_lines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_lines_rels" ADD CONSTRAINT "product_lines_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_product_lines_v_rels" ADD CONSTRAINT "_product_lines_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_product_lines_v_rels" ADD CONSTRAINT "_product_lines_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
CREATE INDEX "product_lines_rels_order_idx" ON "product_lines_rels" USING btree ("order");
CREATE INDEX "product_lines_rels_parent_idx" ON "product_lines_rels" USING btree ("parent_id");
CREATE INDEX "product_lines_rels_path_idx" ON "product_lines_rels" USING btree ("path");
CREATE INDEX "product_lines_rels_media_id_idx" ON "product_lines_rels" USING btree ("media_id");
CREATE INDEX "_product_lines_v_rels_order_idx" ON "_product_lines_v_rels" USING btree ("order");
CREATE INDEX "_product_lines_v_rels_parent_idx" ON "_product_lines_v_rels" USING btree ("parent_id");
CREATE INDEX "_product_lines_v_rels_path_idx" ON "_product_lines_v_rels" USING btree ("path");
CREATE INDEX "_product_lines_v_rels_media_id_idx" ON "_product_lines_v_rels" USING btree ("media_id");
ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
CREATE INDEX "homepage_rels_media_id_idx" ON "homepage_rels" USING btree ("media_id");
CREATE INDEX "_homepage_v_rels_media_id_idx" ON "_homepage_v_rels" USING btree ("media_id");
CREATE INDEX "archives_rels_media_id_idx" ON "archives_rels" USING btree ("media_id");
`

const DOWN_SQL = String.raw`
CREATE TABLE "products_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar
);

CREATE TABLE "_products_v_version_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar,
	"_uuid" varchar
);

CREATE TABLE "product_lines_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar
);

CREATE TABLE "_product_lines_v_version_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar,
	"_uuid" varchar
);

CREATE TABLE "projects_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar
);

CREATE TABLE "_projects_v_version_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar,
	"_uuid" varchar
);

CREATE TABLE "pages_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar
);

CREATE TABLE "_pages_v_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar,
	"_uuid" varchar
);

CREATE TABLE "homepage_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar
);

CREATE TABLE "_homepage_v_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer,
	"caption" varchar,
	"_uuid" varchar
);

CREATE TABLE "archives_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" integer NOT NULL,
	"caption" varchar
);

ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "product_lines_rels" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_product_lines_v_rels" DISABLE ROW LEVEL SECURITY;
DROP TABLE "products_rels" CASCADE;
DROP TABLE "_products_v_rels" CASCADE;
DROP TABLE "product_lines_rels" CASCADE;
DROP TABLE "_product_lines_v_rels" CASCADE;
ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_media_fk";

ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_media_fk";

ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_media_fk";

ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_media_fk";

ALTER TABLE "homepage_rels" DROP CONSTRAINT "homepage_rels_media_fk";

ALTER TABLE "_homepage_v_rels" DROP CONSTRAINT "_homepage_v_rels_media_fk";

ALTER TABLE "archives_rels" DROP CONSTRAINT "archives_rels_media_fk";

DROP INDEX "projects_rels_media_id_idx";
DROP INDEX "_projects_v_rels_media_id_idx";
DROP INDEX "pages_rels_media_id_idx";
DROP INDEX "_pages_v_rels_media_id_idx";
DROP INDEX "homepage_rels_media_id_idx";
DROP INDEX "_homepage_v_rels_media_id_idx";
DROP INDEX "archives_rels_media_id_idx";
ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_lines_gallery" ADD CONSTRAINT "product_lines_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "product_lines_gallery" ADD CONSTRAINT "product_lines_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_lines"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_product_lines_v_version_gallery" ADD CONSTRAINT "_product_lines_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_product_lines_v_version_gallery" ADD CONSTRAINT "_product_lines_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_lines_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_blocks_gallery_images" ADD CONSTRAINT "homepage_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "homepage_blocks_gallery_images" ADD CONSTRAINT "homepage_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_v_blocks_gallery_images" ADD CONSTRAINT "_homepage_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_homepage_v_blocks_gallery_images" ADD CONSTRAINT "_homepage_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_blocks_gallery_images" ADD CONSTRAINT "archives_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "archives_blocks_gallery_images" ADD CONSTRAINT "archives_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
CREATE INDEX "product_lines_gallery_order_idx" ON "product_lines_gallery" USING btree ("_order");
CREATE INDEX "product_lines_gallery_parent_id_idx" ON "product_lines_gallery" USING btree ("_parent_id");
CREATE INDEX "product_lines_gallery_image_idx" ON "product_lines_gallery" USING btree ("image_id");
CREATE INDEX "_product_lines_v_version_gallery_order_idx" ON "_product_lines_v_version_gallery" USING btree ("_order");
CREATE INDEX "_product_lines_v_version_gallery_parent_id_idx" ON "_product_lines_v_version_gallery" USING btree ("_parent_id");
CREATE INDEX "_product_lines_v_version_gallery_image_idx" ON "_product_lines_v_version_gallery" USING btree ("image_id");
CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
CREATE INDEX "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
CREATE INDEX "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_gallery_images_image_idx" ON "pages_blocks_gallery_images" USING btree ("image_id");
CREATE INDEX "_pages_v_blocks_gallery_images_order_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_gallery_images_parent_id_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_gallery_images_image_idx" ON "_pages_v_blocks_gallery_images" USING btree ("image_id");
CREATE INDEX "homepage_blocks_gallery_images_order_idx" ON "homepage_blocks_gallery_images" USING btree ("_order");
CREATE INDEX "homepage_blocks_gallery_images_parent_id_idx" ON "homepage_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX "homepage_blocks_gallery_images_image_idx" ON "homepage_blocks_gallery_images" USING btree ("image_id");
CREATE INDEX "_homepage_v_blocks_gallery_images_order_idx" ON "_homepage_v_blocks_gallery_images" USING btree ("_order");
CREATE INDEX "_homepage_v_blocks_gallery_images_parent_id_idx" ON "_homepage_v_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX "_homepage_v_blocks_gallery_images_image_idx" ON "_homepage_v_blocks_gallery_images" USING btree ("image_id");
CREATE INDEX "archives_blocks_gallery_images_order_idx" ON "archives_blocks_gallery_images" USING btree ("_order");
CREATE INDEX "archives_blocks_gallery_images_parent_id_idx" ON "archives_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX "archives_blocks_gallery_images_image_idx" ON "archives_blocks_gallery_images" USING btree ("image_id");
ALTER TABLE "projects_rels" DROP COLUMN "media_id";
ALTER TABLE "_projects_v_rels" DROP COLUMN "media_id";
ALTER TABLE "pages_rels" DROP COLUMN "media_id";
ALTER TABLE "_pages_v_rels" DROP COLUMN "media_id";
ALTER TABLE "users" DROP COLUMN "last_login_at";
ALTER TABLE "homepage_rels" DROP COLUMN "media_id";
ALTER TABLE "_homepage_v_rels" DROP COLUMN "media_id";
ALTER TABLE "archives_rels" DROP COLUMN "media_id";
`
