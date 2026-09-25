import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Separa las tablas de bloques que compartían páginas, home y listados (text_img, proj_grid,
 * prod_lines, quote_wiz…) en tablas por dueño: pages_*, homepage_*, archives_* y las de
 * versiones (_pages_*_v, _homepage_*_v).
 *
 * Por qué: con un nombre de tabla fijo, las tres entidades escribían en la misma tabla y, como
 * todas tienen id 1, guardar la home borraba los bloques de la página 1 (y viceversa).
 *
 * Pasos (en una sola transacción): 1) crea las tablas nuevas, 2) copia cada fila a la tabla de
 * su dueño según `_path` ("layout" = páginas, "sections" = home, el resto = listados) y verifica
 * que no quede ninguna sin copiar, 3) recién entonces borra las tablas viejas.
 */

type Db = MigrateUpArgs['db']

const BLOCKS = [
  'text_img',
  'prod_lines',
  'prod_cats',
  'prod_grid',
  'quote_cta',
  'proj_grid',
  'docs',
  'quote_wiz',
  'rich_text',
]

type Owner = { name: string; version: boolean; path: string; parentTable: string }

const OWNERS: Owner[] = [
  { name: 'pages', version: false, path: `= 'layout'`, parentTable: 'pages' },
  { name: 'homepage', version: false, path: `= 'sections'`, parentTable: 'homepage' },
  { name: 'archives', version: false, path: `NOT IN ('layout', 'sections')`, parentTable: 'archives' },
  { name: 'pages', version: true, path: `= 'version.layout'`, parentTable: '_pages_v' },
  { name: 'homepage', version: true, path: `= 'version.sections'`, parentTable: '_homepage_v' },
]

const shared = (block: string, version: boolean) => (version ? `_${block}_v` : block)
const owned = (owner: string, block: string, version: boolean) =>
  version ? `_${owner}_${block}_v` : `${owner}_${block}`

type Column = { name: string; cast: string; serial: boolean }

async function query<T>(db: Db, text: string): Promise<T[]> {
  const res = await db.execute(sql.raw(text))
  return res.rows as T[]
}

async function tableNames(db: Db): Promise<string[]> {
  const rows = await query<{ t: string }>(
    db,
    `SELECT table_name AS t FROM information_schema.tables WHERE table_schema = 'public'`,
  )
  return rows.map((r) => r.t)
}

async function columnsOf(db: Db, table: string): Promise<Column[]> {
  const rows = await query<{
    column_name: string
    data_type: string
    udt_name: string
    column_default: string | null
  }>(
    db,
    `SELECT column_name, data_type, udt_name, column_default FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = '${table}' ORDER BY ordinal_position`,
  )
  return rows.map((c) => ({
    name: c.column_name,
    cast: c.data_type === 'USER-DEFINED' ? `"public"."${c.udt_name}"` : c.data_type,
    serial: Boolean(c.column_default?.startsWith('nextval(')),
  }))
}

async function count(db: Db, table: string, where = 'TRUE'): Promise<number> {
  const [row] = await query<{ n: number }>(db, `SELECT count(*)::int AS n FROM "${table}" WHERE ${where}`)
  return row.n
}

/**
 * Copia filas entre tablas con las mismas columnas (castea al tipo destino: enums distintos).
 * `offset` suma un valor a las columnas enteras indicadas (ids que chocarían al unir tablas).
 */
async function copyRows(
  db: Db,
  from: string,
  to: string,
  where: string,
  offset: { columns: string[]; by: number } = { columns: [], by: 0 },
): Promise<number> {
  const [src, dst] = await Promise.all([columnsOf(db, from), columnsOf(db, to)])
  const dstByName = new Map(dst.map((c) => [c.name, c]))
  const missing = src.filter((c) => !dstByName.has(c.name)).map((c) => c.name)
  if (missing.length) throw new Error(`${to} no tiene las columnas ${missing.join(', ')} de ${from}`)
  const cols = src.map((c) => `"${c.name}"`).join(', ')
  const values = src
    .map((c) => {
      const shift = offset.by && c.cast === 'integer' && offset.columns.includes(c.name)
      const value = shift ? `("${c.name}" + ${offset.by})` : `"${c.name}"`
      return `${value}::text::${dstByName.get(c.name)!.cast} AS "${c.name}"`
    })
    .join(', ')
  const n = await count(db, from, where)
  if (n > 0) await db.execute(sql.raw(`INSERT INTO "${to}" (${cols}) SELECT ${values} FROM "${from}" WHERE ${where}`))
  for (const c of dst.filter((col) => col.serial)) {
    await db.execute(
      sql.raw(
        `SELECT setval(pg_get_serial_sequence('"${to}"', '${c.name}'), COALESCE((SELECT MAX("${c.name}") FROM "${to}"), 0) + 1, false)`,
      ),
    )
  }
  return n
}

/** Tablas hijas (arrays y selects múltiples) de una tabla de bloque. */
function childrenOf(all: string[], table: string): string[] {
  return all.filter((t) => t.startsWith(`${table}_`))
}

async function linkColumn(db: Db, child: string): Promise<string> {
  const cols = await columnsOf(db, child)
  if (cols.some((c) => c.name === '_parent_id')) return '_parent_id'
  if (cols.some((c) => c.name === 'parent_id')) return 'parent_id'
  throw new Error(`No sé cómo se vincula ${child} con su bloque`)
}

/** Copia un bloque (fila + hijas) de `from` a `to` para las filas que cumplen `where`. */
async function copyBlock(
  db: Db,
  all: string[],
  from: string,
  to: string,
  where: string,
  offsetBy = 0,
): Promise<number> {
  const n = await copyRows(db, from, to, where, { columns: ['id'], by: offsetBy })
  for (const child of childrenOf(all, from)) {
    if (childrenOf(all, child).length) throw new Error(`${child} tiene tablas anidadas no previstas`)
    const link = await linkColumn(db, child)
    const target = `${to}${child.slice(from.length)}`
    if (!all.includes(target)) throw new Error(`Falta la tabla ${target}`)
    await copyRows(db, child, target, `"${link}" IN (SELECT "id" FROM "${from}" WHERE ${where})`, {
      columns: ['id', link],
      by: offsetBy,
    })
  }
  return n
}

/** Tablas compartidas → tablas por dueño (up). Falla si alguna fila quedara sin copiar. */
async function splitSharedTables(db: Db, log: (msg: string) => void) {
  const all = await tableNames(db)
  for (const block of BLOCKS) {
    for (const version of [false, true]) {
      const from = shared(block, version)
      if (!all.includes(from)) continue
      const total = await count(db, from)
      let copied = 0
      for (const owner of OWNERS.filter((o) => o.version === version)) {
        const to = owned(owner.name, block, version)
        if (!all.includes(to)) continue
        copied += await copyBlock(
          db,
          all,
          from,
          to,
          `"_path" ${owner.path} AND "_parent_id" IN (SELECT "id" FROM "${owner.parentTable}")`,
        )
      }
      if (copied !== total)
        throw new Error(`${from}: se copiaron ${copied} de ${total} filas. No se borra nada.`)
      if (total) log(`${from}: ${total} filas repartidas por dueño`)
    }
  }
}

/**
 * Tablas por dueño → tablas compartidas (down). Los ids numéricos de cada dueño se desplazan
 * para no chocar, y se omiten las filas que el esquema viejo no puede guardar (su clave foránea
 * solo apunta a pages / _pages_v).
 */
async function mergeOwnedTables(db: Db) {
  const all = await tableNames(db)
  for (const block of BLOCKS) {
    for (const version of [false, true]) {
      const to = shared(block, version)
      if (!all.includes(to)) continue
      const oldParent = version ? '_pages_v' : 'pages'
      const owners = OWNERS.filter((o) => o.version === version)
      for (const [i, owner] of owners.entries()) {
        const from = owned(owner.name, block, version)
        if (!all.includes(from)) continue
        const where = `"_parent_id" IN (SELECT "id" FROM "${oldParent}")`
        await copyBlock(db, all, from, to, where, i * 100_000_000)
      }
    }
  }
}

const isDrop = (s: string) => /^DROP (TABLE|TYPE)/.test(s)
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
  await splitSharedTables(db, (msg) => payload.logger.info(msg))
  await run(db, all.filter(isDrop))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const all = statements(DOWN_SQL)
  await run(db, all.filter((s) => !isDrop(s)))
  await mergeOwnedTables(db)
  await run(db, all.filter(isDrop))
}

// SQL generado por drizzle-kit (tablas nuevas por dueño; las viejas se borran al final).
const UP_SQL = String.raw`
CREATE TYPE "public"."enum_pages_text_img_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_pages_text_img_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_pages_text_img_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_text_img_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum_pages_text_img_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum_pages_text_img_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_text_img_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_prod_lines_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_prod_lines_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum_pages_prod_lines_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_prod_lines_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_prod_cats_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_prod_cats_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_pages_prod_cats_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_prod_cats_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_prod_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_prod_grid_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum_pages_prod_grid_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum_pages_prod_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_pages_prod_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_prod_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_quote_cta_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_pages_quote_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_pages_quote_cta_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_quote_cta_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum_pages_quote_cta_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_quote_cta_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_proj_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_proj_grid_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum_pages_proj_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_pages_proj_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_proj_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_docs_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_docs_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_pages_docs_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_docs_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_quote_wiz_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_quote_wiz_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_quote_wiz_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_pages_rich_text_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_pages_rich_text_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_pages_rich_text_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_text_img_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__pages_text_img_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum__pages_text_img_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_text_img_v_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum__pages_text_img_v_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum__pages_text_img_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_text_img_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_prod_lines_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_prod_lines_v_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum__pages_prod_lines_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_prod_lines_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_prod_cats_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_prod_cats_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__pages_prod_cats_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_prod_cats_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_prod_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_prod_grid_v_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum__pages_prod_grid_v_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum__pages_prod_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__pages_prod_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_prod_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_quote_cta_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__pages_quote_cta_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum__pages_quote_cta_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_quote_cta_v_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum__pages_quote_cta_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_quote_cta_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_proj_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_proj_grid_v_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum__pages_proj_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__pages_proj_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_proj_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_docs_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_docs_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__pages_docs_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_docs_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_quote_wiz_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_quote_wiz_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_quote_wiz_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__pages_rich_text_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__pages_rich_text_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__pages_rich_text_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_text_img_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_homepage_text_img_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_homepage_text_img_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_text_img_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum_homepage_text_img_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum_homepage_text_img_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_text_img_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_prod_lines_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_prod_lines_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum_homepage_prod_lines_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_prod_lines_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_prod_cats_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_prod_cats_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_homepage_prod_cats_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_prod_cats_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_prod_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_prod_grid_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum_homepage_prod_grid_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum_homepage_prod_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_homepage_prod_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_prod_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_quote_cta_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_homepage_quote_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_homepage_quote_cta_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_quote_cta_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum_homepage_quote_cta_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_quote_cta_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_proj_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_proj_grid_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum_homepage_proj_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_homepage_proj_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_proj_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_docs_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_docs_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_homepage_docs_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_docs_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_quote_wiz_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_quote_wiz_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_quote_wiz_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_homepage_rich_text_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_homepage_rich_text_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_homepage_rich_text_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_text_img_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__homepage_text_img_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum__homepage_text_img_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_text_img_v_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum__homepage_text_img_v_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum__homepage_text_img_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_text_img_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_prod_lines_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_prod_lines_v_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum__homepage_prod_lines_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_prod_lines_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_prod_cats_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_prod_cats_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__homepage_prod_cats_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_prod_cats_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_prod_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_prod_grid_v_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum__homepage_prod_grid_v_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum__homepage_prod_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__homepage_prod_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_prod_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_quote_cta_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__homepage_quote_cta_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum__homepage_quote_cta_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_quote_cta_v_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum__homepage_quote_cta_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_quote_cta_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_proj_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_proj_grid_v_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum__homepage_proj_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__homepage_proj_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_proj_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_docs_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_docs_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__homepage_docs_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_docs_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_quote_wiz_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_quote_wiz_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_quote_wiz_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__homepage_rich_text_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__homepage_rich_text_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__homepage_rich_text_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_text_img_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_archives_text_img_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_archives_text_img_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_text_img_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum_archives_text_img_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum_archives_text_img_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_text_img_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_prod_lines_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_prod_lines_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum_archives_prod_lines_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_prod_lines_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_prod_cats_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_prod_cats_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_archives_prod_cats_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_prod_cats_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_prod_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_prod_grid_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum_archives_prod_grid_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum_archives_prod_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_archives_prod_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_prod_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_quote_cta_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_archives_quote_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_archives_quote_cta_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_quote_cta_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum_archives_quote_cta_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_quote_cta_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_proj_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_proj_grid_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum_archives_proj_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_archives_proj_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_proj_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_docs_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_docs_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_archives_docs_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_docs_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_quote_wiz_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_quote_wiz_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_quote_wiz_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_archives_rich_text_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_archives_rich_text_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_archives_rich_text_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TABLE "pages_text_img_tags" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

CREATE TABLE "pages_text_img_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

CREATE TABLE "pages_text_img_facts" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar
);

CREATE TABLE "pages_text_img_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_pages_text_img_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_pages_text_img_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "pages_text_img_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_text_img_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_text_img" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_pages_text_img_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer,
	"image_position" "enum_pages_text_img_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_text_img_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_text_img_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_prod_lines_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_prod_lines_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_prod_lines" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_pages_prod_lines_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_prod_lines_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_prod_lines_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_prod_cats_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_prod_cats_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_prod_cats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum_pages_prod_cats_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_prod_cats_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_prod_cats_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_prod_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_prod_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_prod_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_pages_prod_grid_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_pages_prod_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum_pages_prod_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_prod_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_prod_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_quote_cta_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_pages_quote_cta_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_pages_quote_cta_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "pages_quote_cta_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_quote_cta_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_quote_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_pages_quote_cta_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_quote_cta_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_quote_cta_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_proj_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_proj_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_proj_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_pages_proj_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum_pages_proj_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_proj_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_proj_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_docs_files" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar,
	"file_id" integer
);

CREATE TABLE "pages_docs_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_docs_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_docs" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum_pages_docs_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_docs_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_docs_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_quote_wiz_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_quote_wiz_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_quote_wiz" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_quote_wiz_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_quote_wiz_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "pages_rich_text_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_pages_rich_text_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "pages_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_pages_rich_text_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_pages_rich_text_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_text_img_v_tags" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

CREATE TABLE "_pages_text_img_v_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

CREATE TABLE "_pages_text_img_v_facts" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar,
	"_uuid" varchar
);

CREATE TABLE "_pages_text_img_v_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"link_type" "enum__pages_text_img_v_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum__pages_text_img_v_links_link_appearance" DEFAULT 'primary',
	"_uuid" varchar
);

CREATE TABLE "_pages_text_img_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_text_img_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_text_img_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__pages_text_img_v_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer,
	"image_position" "enum__pages_text_img_v_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_text_img_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_text_img_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_prod_lines_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_prod_lines_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_prod_lines_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__pages_prod_lines_v_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_prod_lines_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_prod_lines_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_prod_cats_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_prod_cats_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_prod_cats_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum__pages_prod_cats_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_prod_cats_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_prod_cats_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_prod_grid_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_prod_grid_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_prod_grid_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__pages_prod_grid_v_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum__pages_prod_grid_v_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum__pages_prod_grid_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_prod_grid_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_prod_grid_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_quote_cta_v_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"link_type" "enum__pages_quote_cta_v_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum__pages_quote_cta_v_links_link_appearance" DEFAULT 'primary',
	"_uuid" varchar
);

CREATE TABLE "_pages_quote_cta_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_quote_cta_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_quote_cta_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__pages_quote_cta_v_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_quote_cta_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_quote_cta_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_proj_grid_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_proj_grid_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_proj_grid_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum__pages_proj_grid_v_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum__pages_proj_grid_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_proj_grid_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_proj_grid_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_docs_v_files" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar,
	"file_id" integer,
	"_uuid" varchar
);

CREATE TABLE "_pages_docs_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_docs_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_docs_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum__pages_docs_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_docs_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_docs_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_quote_wiz_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_quote_wiz_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_quote_wiz_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_quote_wiz_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_quote_wiz_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_pages_rich_text_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__pages_rich_text_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_pages_rich_text_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__pages_rich_text_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__pages_rich_text_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_text_img_tags" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

CREATE TABLE "homepage_text_img_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

CREATE TABLE "homepage_text_img_facts" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar
);

CREATE TABLE "homepage_text_img_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_homepage_text_img_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_homepage_text_img_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "homepage_text_img_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_text_img_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_text_img" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_homepage_text_img_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer,
	"image_position" "enum_homepage_text_img_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_text_img_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_text_img_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_prod_lines_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_prod_lines_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_prod_lines" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_homepage_prod_lines_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_prod_lines_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_prod_lines_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_prod_cats_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_prod_cats_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_prod_cats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum_homepage_prod_cats_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_prod_cats_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_prod_cats_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_prod_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_prod_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_prod_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_homepage_prod_grid_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_homepage_prod_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum_homepage_prod_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_prod_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_prod_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_quote_cta_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_homepage_quote_cta_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_homepage_quote_cta_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "homepage_quote_cta_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_quote_cta_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_quote_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_homepage_quote_cta_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_quote_cta_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_quote_cta_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_proj_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_proj_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_proj_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_homepage_proj_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum_homepage_proj_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_proj_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_proj_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_docs_files" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar,
	"file_id" integer
);

CREATE TABLE "homepage_docs_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_docs_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_docs" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum_homepage_docs_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_docs_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_docs_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_quote_wiz_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_quote_wiz_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_quote_wiz" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_quote_wiz_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_quote_wiz_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "homepage_rich_text_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_homepage_rich_text_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "homepage_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_homepage_rich_text_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_homepage_rich_text_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_text_img_v_tags" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

CREATE TABLE "_homepage_text_img_v_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

CREATE TABLE "_homepage_text_img_v_facts" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar,
	"_uuid" varchar
);

CREATE TABLE "_homepage_text_img_v_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"link_type" "enum__homepage_text_img_v_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum__homepage_text_img_v_links_link_appearance" DEFAULT 'primary',
	"_uuid" varchar
);

CREATE TABLE "_homepage_text_img_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_text_img_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_text_img_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__homepage_text_img_v_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer,
	"image_position" "enum__homepage_text_img_v_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_text_img_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_text_img_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_prod_lines_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_prod_lines_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_prod_lines_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__homepage_prod_lines_v_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_prod_lines_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_prod_lines_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_prod_cats_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_prod_cats_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_prod_cats_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum__homepage_prod_cats_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_prod_cats_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_prod_cats_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_prod_grid_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_prod_grid_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_prod_grid_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__homepage_prod_grid_v_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum__homepage_prod_grid_v_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum__homepage_prod_grid_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_prod_grid_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_prod_grid_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_quote_cta_v_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"link_type" "enum__homepage_quote_cta_v_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum__homepage_quote_cta_v_links_link_appearance" DEFAULT 'primary',
	"_uuid" varchar
);

CREATE TABLE "_homepage_quote_cta_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_quote_cta_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_quote_cta_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__homepage_quote_cta_v_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_quote_cta_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_quote_cta_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_proj_grid_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_proj_grid_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_proj_grid_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum__homepage_proj_grid_v_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum__homepage_proj_grid_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_proj_grid_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_proj_grid_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_docs_v_files" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar,
	"file_id" integer,
	"_uuid" varchar
);

CREATE TABLE "_homepage_docs_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_docs_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_docs_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum__homepage_docs_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_docs_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_docs_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_quote_wiz_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_quote_wiz_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_quote_wiz_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_quote_wiz_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_quote_wiz_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_homepage_rich_text_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__homepage_rich_text_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_homepage_rich_text_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__homepage_rich_text_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__homepage_rich_text_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_text_img_tags" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL
);

CREATE TABLE "archives_text_img_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL
);

CREATE TABLE "archives_text_img_facts" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar NOT NULL,
	"label" varchar NOT NULL
);

CREATE TABLE "archives_text_img_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_archives_text_img_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar NOT NULL,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_archives_text_img_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "archives_text_img_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_text_img_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_text_img" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_archives_text_img_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer NOT NULL,
	"image_position" "enum_archives_text_img_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_text_img_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_text_img_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_prod_lines_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_prod_lines_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_prod_lines" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_archives_prod_lines_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_prod_lines_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_prod_lines_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_prod_cats_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_prod_cats_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_prod_cats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum_archives_prod_cats_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_prod_cats_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_prod_cats_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_prod_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_prod_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_prod_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_archives_prod_grid_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_archives_prod_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum_archives_prod_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_prod_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_prod_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_quote_cta_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_archives_quote_cta_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar NOT NULL,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_archives_quote_cta_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "archives_quote_cta_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_quote_cta_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_quote_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_archives_quote_cta_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar NOT NULL,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_quote_cta_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_quote_cta_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_proj_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_proj_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_proj_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_archives_proj_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum_archives_proj_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_proj_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_proj_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_docs_files" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar,
	"file_id" integer NOT NULL
);

CREATE TABLE "archives_docs_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_docs_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_docs" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum_archives_docs_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_docs_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_docs_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_quote_wiz_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_quote_wiz_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_quote_wiz" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_quote_wiz_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_quote_wiz_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "archives_rich_text_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_archives_rich_text_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "archives_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_archives_rich_text_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_archives_rich_text_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

ALTER TABLE "text_img_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "text_img_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "text_img_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "text_img_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "text_img_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "text_img" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "prod_lines_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "prod_lines" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "prod_cats_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "prod_cats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "prod_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "prod_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_cta_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_cta_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_cta" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "proj_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "proj_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "docs_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "docs_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "docs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_wiz_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_wiz" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "rich_text_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "rich_text" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_text_img_v_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_text_img_v_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_text_img_v_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_text_img_v_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_text_img_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_text_img_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_prod_lines_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_prod_lines_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_prod_cats_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_prod_cats_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_prod_grid_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_prod_grid_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_quote_cta_v_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_quote_cta_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_quote_cta_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_proj_grid_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_proj_grid_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_docs_v_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_docs_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_docs_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_quote_wiz_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_quote_wiz_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_rich_text_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_rich_text_v" DISABLE ROW LEVEL SECURITY;
DROP TABLE "text_img_tags" CASCADE;
DROP TABLE "text_img_bullets" CASCADE;
DROP TABLE "text_img_facts" CASCADE;
DROP TABLE "text_img_links" CASCADE;
DROP TABLE "text_img_settings_hide_on" CASCADE;
DROP TABLE "text_img" CASCADE;
DROP TABLE "prod_lines_settings_hide_on" CASCADE;
DROP TABLE "prod_lines" CASCADE;
DROP TABLE "prod_cats_settings_hide_on" CASCADE;
DROP TABLE "prod_cats" CASCADE;
DROP TABLE "prod_grid_settings_hide_on" CASCADE;
DROP TABLE "prod_grid" CASCADE;
DROP TABLE "quote_cta_links" CASCADE;
DROP TABLE "quote_cta_settings_hide_on" CASCADE;
DROP TABLE "quote_cta" CASCADE;
DROP TABLE "proj_grid_settings_hide_on" CASCADE;
DROP TABLE "proj_grid" CASCADE;
DROP TABLE "docs_files" CASCADE;
DROP TABLE "docs_settings_hide_on" CASCADE;
DROP TABLE "docs" CASCADE;
DROP TABLE "quote_wiz_settings_hide_on" CASCADE;
DROP TABLE "quote_wiz" CASCADE;
DROP TABLE "rich_text_settings_hide_on" CASCADE;
DROP TABLE "rich_text" CASCADE;
DROP TABLE "_text_img_v_tags" CASCADE;
DROP TABLE "_text_img_v_bullets" CASCADE;
DROP TABLE "_text_img_v_facts" CASCADE;
DROP TABLE "_text_img_v_links" CASCADE;
DROP TABLE "_text_img_v_settings_hide_on" CASCADE;
DROP TABLE "_text_img_v" CASCADE;
DROP TABLE "_prod_lines_v_settings_hide_on" CASCADE;
DROP TABLE "_prod_lines_v" CASCADE;
DROP TABLE "_prod_cats_v_settings_hide_on" CASCADE;
DROP TABLE "_prod_cats_v" CASCADE;
DROP TABLE "_prod_grid_v_settings_hide_on" CASCADE;
DROP TABLE "_prod_grid_v" CASCADE;
DROP TABLE "_quote_cta_v_links" CASCADE;
DROP TABLE "_quote_cta_v_settings_hide_on" CASCADE;
DROP TABLE "_quote_cta_v" CASCADE;
DROP TABLE "_proj_grid_v_settings_hide_on" CASCADE;
DROP TABLE "_proj_grid_v" CASCADE;
DROP TABLE "_docs_v_files" CASCADE;
DROP TABLE "_docs_v_settings_hide_on" CASCADE;
DROP TABLE "_docs_v" CASCADE;
DROP TABLE "_quote_wiz_v_settings_hide_on" CASCADE;
DROP TABLE "_quote_wiz_v" CASCADE;
DROP TABLE "_rich_text_v_settings_hide_on" CASCADE;
DROP TABLE "_rich_text_v" CASCADE;
ALTER TABLE "homepage_rels" ADD COLUMN "product_categories_id" integer;
ALTER TABLE "_homepage_v_rels" ADD COLUMN "product_categories_id" integer;
ALTER TABLE "archives_rels" ADD COLUMN "product_categories_id" integer;
ALTER TABLE "pages_text_img_tags" ADD CONSTRAINT "pages_text_img_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_text_img_bullets" ADD CONSTRAINT "pages_text_img_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_text_img_facts" ADD CONSTRAINT "pages_text_img_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_text_img_links" ADD CONSTRAINT "pages_text_img_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_text_img_settings_hide_on" ADD CONSTRAINT "pages_text_img_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_text_img" ADD CONSTRAINT "pages_text_img_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pages_text_img" ADD CONSTRAINT "pages_text_img_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_prod_lines_settings_hide_on" ADD CONSTRAINT "pages_prod_lines_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_prod_lines"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_prod_lines" ADD CONSTRAINT "pages_prod_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_prod_cats_settings_hide_on" ADD CONSTRAINT "pages_prod_cats_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_prod_cats"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_prod_cats" ADD CONSTRAINT "pages_prod_cats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_prod_grid_settings_hide_on" ADD CONSTRAINT "pages_prod_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_prod_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_prod_grid" ADD CONSTRAINT "pages_prod_grid_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pages_prod_grid" ADD CONSTRAINT "pages_prod_grid_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pages_prod_grid" ADD CONSTRAINT "pages_prod_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_quote_cta_links" ADD CONSTRAINT "pages_quote_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_quote_cta_settings_hide_on" ADD CONSTRAINT "pages_quote_cta_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_quote_cta" ADD CONSTRAINT "pages_quote_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_proj_grid_settings_hide_on" ADD CONSTRAINT "pages_proj_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_proj_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_proj_grid" ADD CONSTRAINT "pages_proj_grid_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pages_proj_grid" ADD CONSTRAINT "pages_proj_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_docs_files" ADD CONSTRAINT "pages_docs_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "pages_docs_files" ADD CONSTRAINT "pages_docs_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_docs_settings_hide_on" ADD CONSTRAINT "pages_docs_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_docs" ADD CONSTRAINT "pages_docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_quote_wiz_settings_hide_on" ADD CONSTRAINT "pages_quote_wiz_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_quote_wiz"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_quote_wiz" ADD CONSTRAINT "pages_quote_wiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_rich_text_settings_hide_on" ADD CONSTRAINT "pages_rich_text_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_rich_text"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages_rich_text" ADD CONSTRAINT "pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_text_img_v_tags" ADD CONSTRAINT "_pages_text_img_v_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_text_img_v_bullets" ADD CONSTRAINT "_pages_text_img_v_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_text_img_v_facts" ADD CONSTRAINT "_pages_text_img_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_text_img_v_links" ADD CONSTRAINT "_pages_text_img_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_text_img_v_settings_hide_on" ADD CONSTRAINT "_pages_text_img_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_text_img_v" ADD CONSTRAINT "_pages_text_img_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_text_img_v" ADD CONSTRAINT "_pages_text_img_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_prod_lines_v_settings_hide_on" ADD CONSTRAINT "_pages_prod_lines_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_prod_lines_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_prod_lines_v" ADD CONSTRAINT "_pages_prod_lines_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_prod_cats_v_settings_hide_on" ADD CONSTRAINT "_pages_prod_cats_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_prod_cats_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_prod_cats_v" ADD CONSTRAINT "_pages_prod_cats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_prod_grid_v_settings_hide_on" ADD CONSTRAINT "_pages_prod_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_prod_grid_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_prod_grid_v" ADD CONSTRAINT "_pages_prod_grid_v_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_prod_grid_v" ADD CONSTRAINT "_pages_prod_grid_v_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_prod_grid_v" ADD CONSTRAINT "_pages_prod_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_quote_cta_v_links" ADD CONSTRAINT "_pages_quote_cta_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_quote_cta_v_settings_hide_on" ADD CONSTRAINT "_pages_quote_cta_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_quote_cta_v" ADD CONSTRAINT "_pages_quote_cta_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_proj_grid_v_settings_hide_on" ADD CONSTRAINT "_pages_proj_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_proj_grid_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_proj_grid_v" ADD CONSTRAINT "_pages_proj_grid_v_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_proj_grid_v" ADD CONSTRAINT "_pages_proj_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_docs_v_files" ADD CONSTRAINT "_pages_docs_v_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_pages_docs_v_files" ADD CONSTRAINT "_pages_docs_v_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_docs_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_docs_v_settings_hide_on" ADD CONSTRAINT "_pages_docs_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_docs_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_docs_v" ADD CONSTRAINT "_pages_docs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_quote_wiz_v_settings_hide_on" ADD CONSTRAINT "_pages_quote_wiz_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_quote_wiz_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_quote_wiz_v" ADD CONSTRAINT "_pages_quote_wiz_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_rich_text_v_settings_hide_on" ADD CONSTRAINT "_pages_rich_text_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_rich_text_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_rich_text_v" ADD CONSTRAINT "_pages_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_text_img_tags" ADD CONSTRAINT "homepage_text_img_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_text_img_bullets" ADD CONSTRAINT "homepage_text_img_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_text_img_facts" ADD CONSTRAINT "homepage_text_img_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_text_img_links" ADD CONSTRAINT "homepage_text_img_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_text_img_settings_hide_on" ADD CONSTRAINT "homepage_text_img_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_text_img" ADD CONSTRAINT "homepage_text_img_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "homepage_text_img" ADD CONSTRAINT "homepage_text_img_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_prod_lines_settings_hide_on" ADD CONSTRAINT "homepage_prod_lines_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_prod_lines"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_prod_lines" ADD CONSTRAINT "homepage_prod_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_prod_cats_settings_hide_on" ADD CONSTRAINT "homepage_prod_cats_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_prod_cats"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_prod_cats" ADD CONSTRAINT "homepage_prod_cats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_prod_grid_settings_hide_on" ADD CONSTRAINT "homepage_prod_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_prod_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_prod_grid" ADD CONSTRAINT "homepage_prod_grid_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "homepage_prod_grid" ADD CONSTRAINT "homepage_prod_grid_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "homepage_prod_grid" ADD CONSTRAINT "homepage_prod_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_quote_cta_links" ADD CONSTRAINT "homepage_quote_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_quote_cta_settings_hide_on" ADD CONSTRAINT "homepage_quote_cta_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_quote_cta" ADD CONSTRAINT "homepage_quote_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_proj_grid_settings_hide_on" ADD CONSTRAINT "homepage_proj_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_proj_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_proj_grid" ADD CONSTRAINT "homepage_proj_grid_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "homepage_proj_grid" ADD CONSTRAINT "homepage_proj_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_docs_files" ADD CONSTRAINT "homepage_docs_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "homepage_docs_files" ADD CONSTRAINT "homepage_docs_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_docs_settings_hide_on" ADD CONSTRAINT "homepage_docs_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_docs" ADD CONSTRAINT "homepage_docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_quote_wiz_settings_hide_on" ADD CONSTRAINT "homepage_quote_wiz_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_quote_wiz"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_quote_wiz" ADD CONSTRAINT "homepage_quote_wiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_rich_text_settings_hide_on" ADD CONSTRAINT "homepage_rich_text_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage_rich_text"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "homepage_rich_text" ADD CONSTRAINT "homepage_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v_tags" ADD CONSTRAINT "_homepage_text_img_v_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v_bullets" ADD CONSTRAINT "_homepage_text_img_v_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v_facts" ADD CONSTRAINT "_homepage_text_img_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v_links" ADD CONSTRAINT "_homepage_text_img_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v_settings_hide_on" ADD CONSTRAINT "_homepage_text_img_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v" ADD CONSTRAINT "_homepage_text_img_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_homepage_text_img_v" ADD CONSTRAINT "_homepage_text_img_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_prod_lines_v_settings_hide_on" ADD CONSTRAINT "_homepage_prod_lines_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_prod_lines_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_prod_lines_v" ADD CONSTRAINT "_homepage_prod_lines_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_prod_cats_v_settings_hide_on" ADD CONSTRAINT "_homepage_prod_cats_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_prod_cats_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_prod_cats_v" ADD CONSTRAINT "_homepage_prod_cats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_prod_grid_v_settings_hide_on" ADD CONSTRAINT "_homepage_prod_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_prod_grid_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_prod_grid_v" ADD CONSTRAINT "_homepage_prod_grid_v_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_homepage_prod_grid_v" ADD CONSTRAINT "_homepage_prod_grid_v_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_homepage_prod_grid_v" ADD CONSTRAINT "_homepage_prod_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_quote_cta_v_links" ADD CONSTRAINT "_homepage_quote_cta_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_quote_cta_v_settings_hide_on" ADD CONSTRAINT "_homepage_quote_cta_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_quote_cta_v" ADD CONSTRAINT "_homepage_quote_cta_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_proj_grid_v_settings_hide_on" ADD CONSTRAINT "_homepage_proj_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_proj_grid_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_proj_grid_v" ADD CONSTRAINT "_homepage_proj_grid_v_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_homepage_proj_grid_v" ADD CONSTRAINT "_homepage_proj_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_docs_v_files" ADD CONSTRAINT "_homepage_docs_v_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_homepage_docs_v_files" ADD CONSTRAINT "_homepage_docs_v_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_docs_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_docs_v_settings_hide_on" ADD CONSTRAINT "_homepage_docs_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_docs_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_docs_v" ADD CONSTRAINT "_homepage_docs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_quote_wiz_v_settings_hide_on" ADD CONSTRAINT "_homepage_quote_wiz_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_quote_wiz_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_quote_wiz_v" ADD CONSTRAINT "_homepage_quote_wiz_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_rich_text_v_settings_hide_on" ADD CONSTRAINT "_homepage_rich_text_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_rich_text_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_rich_text_v" ADD CONSTRAINT "_homepage_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_text_img_tags" ADD CONSTRAINT "archives_text_img_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_text_img_bullets" ADD CONSTRAINT "archives_text_img_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_text_img_facts" ADD CONSTRAINT "archives_text_img_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_text_img_links" ADD CONSTRAINT "archives_text_img_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_text_img_settings_hide_on" ADD CONSTRAINT "archives_text_img_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_text_img" ADD CONSTRAINT "archives_text_img_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "archives_text_img" ADD CONSTRAINT "archives_text_img_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_prod_lines_settings_hide_on" ADD CONSTRAINT "archives_prod_lines_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_prod_lines"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_prod_lines" ADD CONSTRAINT "archives_prod_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_prod_cats_settings_hide_on" ADD CONSTRAINT "archives_prod_cats_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_prod_cats"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_prod_cats" ADD CONSTRAINT "archives_prod_cats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_prod_grid_settings_hide_on" ADD CONSTRAINT "archives_prod_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_prod_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_prod_grid" ADD CONSTRAINT "archives_prod_grid_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "archives_prod_grid" ADD CONSTRAINT "archives_prod_grid_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "archives_prod_grid" ADD CONSTRAINT "archives_prod_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_quote_cta_links" ADD CONSTRAINT "archives_quote_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_quote_cta_settings_hide_on" ADD CONSTRAINT "archives_quote_cta_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_quote_cta" ADD CONSTRAINT "archives_quote_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_proj_grid_settings_hide_on" ADD CONSTRAINT "archives_proj_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_proj_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_proj_grid" ADD CONSTRAINT "archives_proj_grid_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "archives_proj_grid" ADD CONSTRAINT "archives_proj_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_docs_files" ADD CONSTRAINT "archives_docs_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "archives_docs_files" ADD CONSTRAINT "archives_docs_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives_docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_docs_settings_hide_on" ADD CONSTRAINT "archives_docs_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_docs" ADD CONSTRAINT "archives_docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_quote_wiz_settings_hide_on" ADD CONSTRAINT "archives_quote_wiz_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_quote_wiz"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_quote_wiz" ADD CONSTRAINT "archives_quote_wiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_rich_text_settings_hide_on" ADD CONSTRAINT "archives_rich_text_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."archives_rich_text"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_rich_text" ADD CONSTRAINT "archives_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "pages_text_img_tags_order_idx" ON "pages_text_img_tags" USING btree ("_order");
CREATE INDEX "pages_text_img_tags_parent_id_idx" ON "pages_text_img_tags" USING btree ("_parent_id");
CREATE INDEX "pages_text_img_bullets_order_idx" ON "pages_text_img_bullets" USING btree ("_order");
CREATE INDEX "pages_text_img_bullets_parent_id_idx" ON "pages_text_img_bullets" USING btree ("_parent_id");
CREATE INDEX "pages_text_img_facts_order_idx" ON "pages_text_img_facts" USING btree ("_order");
CREATE INDEX "pages_text_img_facts_parent_id_idx" ON "pages_text_img_facts" USING btree ("_parent_id");
CREATE INDEX "pages_text_img_links_order_idx" ON "pages_text_img_links" USING btree ("_order");
CREATE INDEX "pages_text_img_links_parent_id_idx" ON "pages_text_img_links" USING btree ("_parent_id");
CREATE INDEX "pages_text_img_settings_hide_on_order_idx" ON "pages_text_img_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_text_img_settings_hide_on_parent_idx" ON "pages_text_img_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_text_img_order_idx" ON "pages_text_img" USING btree ("_order");
CREATE INDEX "pages_text_img_parent_id_idx" ON "pages_text_img" USING btree ("_parent_id");
CREATE INDEX "pages_text_img_path_idx" ON "pages_text_img" USING btree ("_path");
CREATE INDEX "pages_text_img_image_idx" ON "pages_text_img" USING btree ("image_id");
CREATE INDEX "pages_prod_lines_settings_hide_on_order_idx" ON "pages_prod_lines_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_prod_lines_settings_hide_on_parent_idx" ON "pages_prod_lines_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_prod_lines_order_idx" ON "pages_prod_lines" USING btree ("_order");
CREATE INDEX "pages_prod_lines_parent_id_idx" ON "pages_prod_lines" USING btree ("_parent_id");
CREATE INDEX "pages_prod_lines_path_idx" ON "pages_prod_lines" USING btree ("_path");
CREATE INDEX "pages_prod_cats_settings_hide_on_order_idx" ON "pages_prod_cats_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_prod_cats_settings_hide_on_parent_idx" ON "pages_prod_cats_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_prod_cats_order_idx" ON "pages_prod_cats" USING btree ("_order");
CREATE INDEX "pages_prod_cats_parent_id_idx" ON "pages_prod_cats" USING btree ("_parent_id");
CREATE INDEX "pages_prod_cats_path_idx" ON "pages_prod_cats" USING btree ("_path");
CREATE INDEX "pages_prod_grid_settings_hide_on_order_idx" ON "pages_prod_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_prod_grid_settings_hide_on_parent_idx" ON "pages_prod_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_prod_grid_order_idx" ON "pages_prod_grid" USING btree ("_order");
CREATE INDEX "pages_prod_grid_parent_id_idx" ON "pages_prod_grid" USING btree ("_parent_id");
CREATE INDEX "pages_prod_grid_path_idx" ON "pages_prod_grid" USING btree ("_path");
CREATE INDEX "pages_prod_grid_category_idx" ON "pages_prod_grid" USING btree ("category_id");
CREATE INDEX "pages_prod_grid_line_idx" ON "pages_prod_grid" USING btree ("line_id");
CREATE INDEX "pages_quote_cta_links_order_idx" ON "pages_quote_cta_links" USING btree ("_order");
CREATE INDEX "pages_quote_cta_links_parent_id_idx" ON "pages_quote_cta_links" USING btree ("_parent_id");
CREATE INDEX "pages_quote_cta_settings_hide_on_order_idx" ON "pages_quote_cta_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_quote_cta_settings_hide_on_parent_idx" ON "pages_quote_cta_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_quote_cta_order_idx" ON "pages_quote_cta" USING btree ("_order");
CREATE INDEX "pages_quote_cta_parent_id_idx" ON "pages_quote_cta" USING btree ("_parent_id");
CREATE INDEX "pages_quote_cta_path_idx" ON "pages_quote_cta" USING btree ("_path");
CREATE INDEX "pages_proj_grid_settings_hide_on_order_idx" ON "pages_proj_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_proj_grid_settings_hide_on_parent_idx" ON "pages_proj_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_proj_grid_order_idx" ON "pages_proj_grid" USING btree ("_order");
CREATE INDEX "pages_proj_grid_parent_id_idx" ON "pages_proj_grid" USING btree ("_parent_id");
CREATE INDEX "pages_proj_grid_path_idx" ON "pages_proj_grid" USING btree ("_path");
CREATE INDEX "pages_proj_grid_category_idx" ON "pages_proj_grid" USING btree ("category_id");
CREATE INDEX "pages_docs_files_order_idx" ON "pages_docs_files" USING btree ("_order");
CREATE INDEX "pages_docs_files_parent_id_idx" ON "pages_docs_files" USING btree ("_parent_id");
CREATE INDEX "pages_docs_files_file_idx" ON "pages_docs_files" USING btree ("file_id");
CREATE INDEX "pages_docs_settings_hide_on_order_idx" ON "pages_docs_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_docs_settings_hide_on_parent_idx" ON "pages_docs_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_docs_order_idx" ON "pages_docs" USING btree ("_order");
CREATE INDEX "pages_docs_parent_id_idx" ON "pages_docs" USING btree ("_parent_id");
CREATE INDEX "pages_docs_path_idx" ON "pages_docs" USING btree ("_path");
CREATE INDEX "pages_quote_wiz_settings_hide_on_order_idx" ON "pages_quote_wiz_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_quote_wiz_settings_hide_on_parent_idx" ON "pages_quote_wiz_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_quote_wiz_order_idx" ON "pages_quote_wiz" USING btree ("_order");
CREATE INDEX "pages_quote_wiz_parent_id_idx" ON "pages_quote_wiz" USING btree ("_parent_id");
CREATE INDEX "pages_quote_wiz_path_idx" ON "pages_quote_wiz" USING btree ("_path");
CREATE INDEX "pages_rich_text_settings_hide_on_order_idx" ON "pages_rich_text_settings_hide_on" USING btree ("order");
CREATE INDEX "pages_rich_text_settings_hide_on_parent_idx" ON "pages_rich_text_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "pages_rich_text_order_idx" ON "pages_rich_text" USING btree ("_order");
CREATE INDEX "pages_rich_text_parent_id_idx" ON "pages_rich_text" USING btree ("_parent_id");
CREATE INDEX "pages_rich_text_path_idx" ON "pages_rich_text" USING btree ("_path");
CREATE INDEX "_pages_text_img_v_tags_order_idx" ON "_pages_text_img_v_tags" USING btree ("_order");
CREATE INDEX "_pages_text_img_v_tags_parent_id_idx" ON "_pages_text_img_v_tags" USING btree ("_parent_id");
CREATE INDEX "_pages_text_img_v_bullets_order_idx" ON "_pages_text_img_v_bullets" USING btree ("_order");
CREATE INDEX "_pages_text_img_v_bullets_parent_id_idx" ON "_pages_text_img_v_bullets" USING btree ("_parent_id");
CREATE INDEX "_pages_text_img_v_facts_order_idx" ON "_pages_text_img_v_facts" USING btree ("_order");
CREATE INDEX "_pages_text_img_v_facts_parent_id_idx" ON "_pages_text_img_v_facts" USING btree ("_parent_id");
CREATE INDEX "_pages_text_img_v_links_order_idx" ON "_pages_text_img_v_links" USING btree ("_order");
CREATE INDEX "_pages_text_img_v_links_parent_id_idx" ON "_pages_text_img_v_links" USING btree ("_parent_id");
CREATE INDEX "_pages_text_img_v_settings_hide_on_order_idx" ON "_pages_text_img_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_text_img_v_settings_hide_on_parent_idx" ON "_pages_text_img_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_text_img_v_order_idx" ON "_pages_text_img_v" USING btree ("_order");
CREATE INDEX "_pages_text_img_v_parent_id_idx" ON "_pages_text_img_v" USING btree ("_parent_id");
CREATE INDEX "_pages_text_img_v_path_idx" ON "_pages_text_img_v" USING btree ("_path");
CREATE INDEX "_pages_text_img_v_image_idx" ON "_pages_text_img_v" USING btree ("image_id");
CREATE INDEX "_pages_prod_lines_v_settings_hide_on_order_idx" ON "_pages_prod_lines_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_prod_lines_v_settings_hide_on_parent_idx" ON "_pages_prod_lines_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_prod_lines_v_order_idx" ON "_pages_prod_lines_v" USING btree ("_order");
CREATE INDEX "_pages_prod_lines_v_parent_id_idx" ON "_pages_prod_lines_v" USING btree ("_parent_id");
CREATE INDEX "_pages_prod_lines_v_path_idx" ON "_pages_prod_lines_v" USING btree ("_path");
CREATE INDEX "_pages_prod_cats_v_settings_hide_on_order_idx" ON "_pages_prod_cats_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_prod_cats_v_settings_hide_on_parent_idx" ON "_pages_prod_cats_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_prod_cats_v_order_idx" ON "_pages_prod_cats_v" USING btree ("_order");
CREATE INDEX "_pages_prod_cats_v_parent_id_idx" ON "_pages_prod_cats_v" USING btree ("_parent_id");
CREATE INDEX "_pages_prod_cats_v_path_idx" ON "_pages_prod_cats_v" USING btree ("_path");
CREATE INDEX "_pages_prod_grid_v_settings_hide_on_order_idx" ON "_pages_prod_grid_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_prod_grid_v_settings_hide_on_parent_idx" ON "_pages_prod_grid_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_prod_grid_v_order_idx" ON "_pages_prod_grid_v" USING btree ("_order");
CREATE INDEX "_pages_prod_grid_v_parent_id_idx" ON "_pages_prod_grid_v" USING btree ("_parent_id");
CREATE INDEX "_pages_prod_grid_v_path_idx" ON "_pages_prod_grid_v" USING btree ("_path");
CREATE INDEX "_pages_prod_grid_v_category_idx" ON "_pages_prod_grid_v" USING btree ("category_id");
CREATE INDEX "_pages_prod_grid_v_line_idx" ON "_pages_prod_grid_v" USING btree ("line_id");
CREATE INDEX "_pages_quote_cta_v_links_order_idx" ON "_pages_quote_cta_v_links" USING btree ("_order");
CREATE INDEX "_pages_quote_cta_v_links_parent_id_idx" ON "_pages_quote_cta_v_links" USING btree ("_parent_id");
CREATE INDEX "_pages_quote_cta_v_settings_hide_on_order_idx" ON "_pages_quote_cta_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_quote_cta_v_settings_hide_on_parent_idx" ON "_pages_quote_cta_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_quote_cta_v_order_idx" ON "_pages_quote_cta_v" USING btree ("_order");
CREATE INDEX "_pages_quote_cta_v_parent_id_idx" ON "_pages_quote_cta_v" USING btree ("_parent_id");
CREATE INDEX "_pages_quote_cta_v_path_idx" ON "_pages_quote_cta_v" USING btree ("_path");
CREATE INDEX "_pages_proj_grid_v_settings_hide_on_order_idx" ON "_pages_proj_grid_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_proj_grid_v_settings_hide_on_parent_idx" ON "_pages_proj_grid_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_proj_grid_v_order_idx" ON "_pages_proj_grid_v" USING btree ("_order");
CREATE INDEX "_pages_proj_grid_v_parent_id_idx" ON "_pages_proj_grid_v" USING btree ("_parent_id");
CREATE INDEX "_pages_proj_grid_v_path_idx" ON "_pages_proj_grid_v" USING btree ("_path");
CREATE INDEX "_pages_proj_grid_v_category_idx" ON "_pages_proj_grid_v" USING btree ("category_id");
CREATE INDEX "_pages_docs_v_files_order_idx" ON "_pages_docs_v_files" USING btree ("_order");
CREATE INDEX "_pages_docs_v_files_parent_id_idx" ON "_pages_docs_v_files" USING btree ("_parent_id");
CREATE INDEX "_pages_docs_v_files_file_idx" ON "_pages_docs_v_files" USING btree ("file_id");
CREATE INDEX "_pages_docs_v_settings_hide_on_order_idx" ON "_pages_docs_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_docs_v_settings_hide_on_parent_idx" ON "_pages_docs_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_docs_v_order_idx" ON "_pages_docs_v" USING btree ("_order");
CREATE INDEX "_pages_docs_v_parent_id_idx" ON "_pages_docs_v" USING btree ("_parent_id");
CREATE INDEX "_pages_docs_v_path_idx" ON "_pages_docs_v" USING btree ("_path");
CREATE INDEX "_pages_quote_wiz_v_settings_hide_on_order_idx" ON "_pages_quote_wiz_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_quote_wiz_v_settings_hide_on_parent_idx" ON "_pages_quote_wiz_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_quote_wiz_v_order_idx" ON "_pages_quote_wiz_v" USING btree ("_order");
CREATE INDEX "_pages_quote_wiz_v_parent_id_idx" ON "_pages_quote_wiz_v" USING btree ("_parent_id");
CREATE INDEX "_pages_quote_wiz_v_path_idx" ON "_pages_quote_wiz_v" USING btree ("_path");
CREATE INDEX "_pages_rich_text_v_settings_hide_on_order_idx" ON "_pages_rich_text_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_pages_rich_text_v_settings_hide_on_parent_idx" ON "_pages_rich_text_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_pages_rich_text_v_order_idx" ON "_pages_rich_text_v" USING btree ("_order");
CREATE INDEX "_pages_rich_text_v_parent_id_idx" ON "_pages_rich_text_v" USING btree ("_parent_id");
CREATE INDEX "_pages_rich_text_v_path_idx" ON "_pages_rich_text_v" USING btree ("_path");
CREATE INDEX "homepage_text_img_tags_order_idx" ON "homepage_text_img_tags" USING btree ("_order");
CREATE INDEX "homepage_text_img_tags_parent_id_idx" ON "homepage_text_img_tags" USING btree ("_parent_id");
CREATE INDEX "homepage_text_img_bullets_order_idx" ON "homepage_text_img_bullets" USING btree ("_order");
CREATE INDEX "homepage_text_img_bullets_parent_id_idx" ON "homepage_text_img_bullets" USING btree ("_parent_id");
CREATE INDEX "homepage_text_img_facts_order_idx" ON "homepage_text_img_facts" USING btree ("_order");
CREATE INDEX "homepage_text_img_facts_parent_id_idx" ON "homepage_text_img_facts" USING btree ("_parent_id");
CREATE INDEX "homepage_text_img_links_order_idx" ON "homepage_text_img_links" USING btree ("_order");
CREATE INDEX "homepage_text_img_links_parent_id_idx" ON "homepage_text_img_links" USING btree ("_parent_id");
CREATE INDEX "homepage_text_img_settings_hide_on_order_idx" ON "homepage_text_img_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_text_img_settings_hide_on_parent_idx" ON "homepage_text_img_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_text_img_order_idx" ON "homepage_text_img" USING btree ("_order");
CREATE INDEX "homepage_text_img_parent_id_idx" ON "homepage_text_img" USING btree ("_parent_id");
CREATE INDEX "homepage_text_img_path_idx" ON "homepage_text_img" USING btree ("_path");
CREATE INDEX "homepage_text_img_image_idx" ON "homepage_text_img" USING btree ("image_id");
CREATE INDEX "homepage_prod_lines_settings_hide_on_order_idx" ON "homepage_prod_lines_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_prod_lines_settings_hide_on_parent_idx" ON "homepage_prod_lines_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_prod_lines_order_idx" ON "homepage_prod_lines" USING btree ("_order");
CREATE INDEX "homepage_prod_lines_parent_id_idx" ON "homepage_prod_lines" USING btree ("_parent_id");
CREATE INDEX "homepage_prod_lines_path_idx" ON "homepage_prod_lines" USING btree ("_path");
CREATE INDEX "homepage_prod_cats_settings_hide_on_order_idx" ON "homepage_prod_cats_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_prod_cats_settings_hide_on_parent_idx" ON "homepage_prod_cats_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_prod_cats_order_idx" ON "homepage_prod_cats" USING btree ("_order");
CREATE INDEX "homepage_prod_cats_parent_id_idx" ON "homepage_prod_cats" USING btree ("_parent_id");
CREATE INDEX "homepage_prod_cats_path_idx" ON "homepage_prod_cats" USING btree ("_path");
CREATE INDEX "homepage_prod_grid_settings_hide_on_order_idx" ON "homepage_prod_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_prod_grid_settings_hide_on_parent_idx" ON "homepage_prod_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_prod_grid_order_idx" ON "homepage_prod_grid" USING btree ("_order");
CREATE INDEX "homepage_prod_grid_parent_id_idx" ON "homepage_prod_grid" USING btree ("_parent_id");
CREATE INDEX "homepage_prod_grid_path_idx" ON "homepage_prod_grid" USING btree ("_path");
CREATE INDEX "homepage_prod_grid_category_idx" ON "homepage_prod_grid" USING btree ("category_id");
CREATE INDEX "homepage_prod_grid_line_idx" ON "homepage_prod_grid" USING btree ("line_id");
CREATE INDEX "homepage_quote_cta_links_order_idx" ON "homepage_quote_cta_links" USING btree ("_order");
CREATE INDEX "homepage_quote_cta_links_parent_id_idx" ON "homepage_quote_cta_links" USING btree ("_parent_id");
CREATE INDEX "homepage_quote_cta_settings_hide_on_order_idx" ON "homepage_quote_cta_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_quote_cta_settings_hide_on_parent_idx" ON "homepage_quote_cta_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_quote_cta_order_idx" ON "homepage_quote_cta" USING btree ("_order");
CREATE INDEX "homepage_quote_cta_parent_id_idx" ON "homepage_quote_cta" USING btree ("_parent_id");
CREATE INDEX "homepage_quote_cta_path_idx" ON "homepage_quote_cta" USING btree ("_path");
CREATE INDEX "homepage_proj_grid_settings_hide_on_order_idx" ON "homepage_proj_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_proj_grid_settings_hide_on_parent_idx" ON "homepage_proj_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_proj_grid_order_idx" ON "homepage_proj_grid" USING btree ("_order");
CREATE INDEX "homepage_proj_grid_parent_id_idx" ON "homepage_proj_grid" USING btree ("_parent_id");
CREATE INDEX "homepage_proj_grid_path_idx" ON "homepage_proj_grid" USING btree ("_path");
CREATE INDEX "homepage_proj_grid_category_idx" ON "homepage_proj_grid" USING btree ("category_id");
CREATE INDEX "homepage_docs_files_order_idx" ON "homepage_docs_files" USING btree ("_order");
CREATE INDEX "homepage_docs_files_parent_id_idx" ON "homepage_docs_files" USING btree ("_parent_id");
CREATE INDEX "homepage_docs_files_file_idx" ON "homepage_docs_files" USING btree ("file_id");
CREATE INDEX "homepage_docs_settings_hide_on_order_idx" ON "homepage_docs_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_docs_settings_hide_on_parent_idx" ON "homepage_docs_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_docs_order_idx" ON "homepage_docs" USING btree ("_order");
CREATE INDEX "homepage_docs_parent_id_idx" ON "homepage_docs" USING btree ("_parent_id");
CREATE INDEX "homepage_docs_path_idx" ON "homepage_docs" USING btree ("_path");
CREATE INDEX "homepage_quote_wiz_settings_hide_on_order_idx" ON "homepage_quote_wiz_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_quote_wiz_settings_hide_on_parent_idx" ON "homepage_quote_wiz_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_quote_wiz_order_idx" ON "homepage_quote_wiz" USING btree ("_order");
CREATE INDEX "homepage_quote_wiz_parent_id_idx" ON "homepage_quote_wiz" USING btree ("_parent_id");
CREATE INDEX "homepage_quote_wiz_path_idx" ON "homepage_quote_wiz" USING btree ("_path");
CREATE INDEX "homepage_rich_text_settings_hide_on_order_idx" ON "homepage_rich_text_settings_hide_on" USING btree ("order");
CREATE INDEX "homepage_rich_text_settings_hide_on_parent_idx" ON "homepage_rich_text_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "homepage_rich_text_order_idx" ON "homepage_rich_text" USING btree ("_order");
CREATE INDEX "homepage_rich_text_parent_id_idx" ON "homepage_rich_text" USING btree ("_parent_id");
CREATE INDEX "homepage_rich_text_path_idx" ON "homepage_rich_text" USING btree ("_path");
CREATE INDEX "_homepage_text_img_v_tags_order_idx" ON "_homepage_text_img_v_tags" USING btree ("_order");
CREATE INDEX "_homepage_text_img_v_tags_parent_id_idx" ON "_homepage_text_img_v_tags" USING btree ("_parent_id");
CREATE INDEX "_homepage_text_img_v_bullets_order_idx" ON "_homepage_text_img_v_bullets" USING btree ("_order");
CREATE INDEX "_homepage_text_img_v_bullets_parent_id_idx" ON "_homepage_text_img_v_bullets" USING btree ("_parent_id");
CREATE INDEX "_homepage_text_img_v_facts_order_idx" ON "_homepage_text_img_v_facts" USING btree ("_order");
CREATE INDEX "_homepage_text_img_v_facts_parent_id_idx" ON "_homepage_text_img_v_facts" USING btree ("_parent_id");
CREATE INDEX "_homepage_text_img_v_links_order_idx" ON "_homepage_text_img_v_links" USING btree ("_order");
CREATE INDEX "_homepage_text_img_v_links_parent_id_idx" ON "_homepage_text_img_v_links" USING btree ("_parent_id");
CREATE INDEX "_homepage_text_img_v_settings_hide_on_order_idx" ON "_homepage_text_img_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_text_img_v_settings_hide_on_parent_idx" ON "_homepage_text_img_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_text_img_v_order_idx" ON "_homepage_text_img_v" USING btree ("_order");
CREATE INDEX "_homepage_text_img_v_parent_id_idx" ON "_homepage_text_img_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_text_img_v_path_idx" ON "_homepage_text_img_v" USING btree ("_path");
CREATE INDEX "_homepage_text_img_v_image_idx" ON "_homepage_text_img_v" USING btree ("image_id");
CREATE INDEX "_homepage_prod_lines_v_settings_hide_on_order_idx" ON "_homepage_prod_lines_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_prod_lines_v_settings_hide_on_parent_idx" ON "_homepage_prod_lines_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_prod_lines_v_order_idx" ON "_homepage_prod_lines_v" USING btree ("_order");
CREATE INDEX "_homepage_prod_lines_v_parent_id_idx" ON "_homepage_prod_lines_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_prod_lines_v_path_idx" ON "_homepage_prod_lines_v" USING btree ("_path");
CREATE INDEX "_homepage_prod_cats_v_settings_hide_on_order_idx" ON "_homepage_prod_cats_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_prod_cats_v_settings_hide_on_parent_idx" ON "_homepage_prod_cats_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_prod_cats_v_order_idx" ON "_homepage_prod_cats_v" USING btree ("_order");
CREATE INDEX "_homepage_prod_cats_v_parent_id_idx" ON "_homepage_prod_cats_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_prod_cats_v_path_idx" ON "_homepage_prod_cats_v" USING btree ("_path");
CREATE INDEX "_homepage_prod_grid_v_settings_hide_on_order_idx" ON "_homepage_prod_grid_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_prod_grid_v_settings_hide_on_parent_idx" ON "_homepage_prod_grid_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_prod_grid_v_order_idx" ON "_homepage_prod_grid_v" USING btree ("_order");
CREATE INDEX "_homepage_prod_grid_v_parent_id_idx" ON "_homepage_prod_grid_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_prod_grid_v_path_idx" ON "_homepage_prod_grid_v" USING btree ("_path");
CREATE INDEX "_homepage_prod_grid_v_category_idx" ON "_homepage_prod_grid_v" USING btree ("category_id");
CREATE INDEX "_homepage_prod_grid_v_line_idx" ON "_homepage_prod_grid_v" USING btree ("line_id");
CREATE INDEX "_homepage_quote_cta_v_links_order_idx" ON "_homepage_quote_cta_v_links" USING btree ("_order");
CREATE INDEX "_homepage_quote_cta_v_links_parent_id_idx" ON "_homepage_quote_cta_v_links" USING btree ("_parent_id");
CREATE INDEX "_homepage_quote_cta_v_settings_hide_on_order_idx" ON "_homepage_quote_cta_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_quote_cta_v_settings_hide_on_parent_idx" ON "_homepage_quote_cta_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_quote_cta_v_order_idx" ON "_homepage_quote_cta_v" USING btree ("_order");
CREATE INDEX "_homepage_quote_cta_v_parent_id_idx" ON "_homepage_quote_cta_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_quote_cta_v_path_idx" ON "_homepage_quote_cta_v" USING btree ("_path");
CREATE INDEX "_homepage_proj_grid_v_settings_hide_on_order_idx" ON "_homepage_proj_grid_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_proj_grid_v_settings_hide_on_parent_idx" ON "_homepage_proj_grid_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_proj_grid_v_order_idx" ON "_homepage_proj_grid_v" USING btree ("_order");
CREATE INDEX "_homepage_proj_grid_v_parent_id_idx" ON "_homepage_proj_grid_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_proj_grid_v_path_idx" ON "_homepage_proj_grid_v" USING btree ("_path");
CREATE INDEX "_homepage_proj_grid_v_category_idx" ON "_homepage_proj_grid_v" USING btree ("category_id");
CREATE INDEX "_homepage_docs_v_files_order_idx" ON "_homepage_docs_v_files" USING btree ("_order");
CREATE INDEX "_homepage_docs_v_files_parent_id_idx" ON "_homepage_docs_v_files" USING btree ("_parent_id");
CREATE INDEX "_homepage_docs_v_files_file_idx" ON "_homepage_docs_v_files" USING btree ("file_id");
CREATE INDEX "_homepage_docs_v_settings_hide_on_order_idx" ON "_homepage_docs_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_docs_v_settings_hide_on_parent_idx" ON "_homepage_docs_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_docs_v_order_idx" ON "_homepage_docs_v" USING btree ("_order");
CREATE INDEX "_homepage_docs_v_parent_id_idx" ON "_homepage_docs_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_docs_v_path_idx" ON "_homepage_docs_v" USING btree ("_path");
CREATE INDEX "_homepage_quote_wiz_v_settings_hide_on_order_idx" ON "_homepage_quote_wiz_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_quote_wiz_v_settings_hide_on_parent_idx" ON "_homepage_quote_wiz_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_quote_wiz_v_order_idx" ON "_homepage_quote_wiz_v" USING btree ("_order");
CREATE INDEX "_homepage_quote_wiz_v_parent_id_idx" ON "_homepage_quote_wiz_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_quote_wiz_v_path_idx" ON "_homepage_quote_wiz_v" USING btree ("_path");
CREATE INDEX "_homepage_rich_text_v_settings_hide_on_order_idx" ON "_homepage_rich_text_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_homepage_rich_text_v_settings_hide_on_parent_idx" ON "_homepage_rich_text_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_homepage_rich_text_v_order_idx" ON "_homepage_rich_text_v" USING btree ("_order");
CREATE INDEX "_homepage_rich_text_v_parent_id_idx" ON "_homepage_rich_text_v" USING btree ("_parent_id");
CREATE INDEX "_homepage_rich_text_v_path_idx" ON "_homepage_rich_text_v" USING btree ("_path");
CREATE INDEX "archives_text_img_tags_order_idx" ON "archives_text_img_tags" USING btree ("_order");
CREATE INDEX "archives_text_img_tags_parent_id_idx" ON "archives_text_img_tags" USING btree ("_parent_id");
CREATE INDEX "archives_text_img_bullets_order_idx" ON "archives_text_img_bullets" USING btree ("_order");
CREATE INDEX "archives_text_img_bullets_parent_id_idx" ON "archives_text_img_bullets" USING btree ("_parent_id");
CREATE INDEX "archives_text_img_facts_order_idx" ON "archives_text_img_facts" USING btree ("_order");
CREATE INDEX "archives_text_img_facts_parent_id_idx" ON "archives_text_img_facts" USING btree ("_parent_id");
CREATE INDEX "archives_text_img_links_order_idx" ON "archives_text_img_links" USING btree ("_order");
CREATE INDEX "archives_text_img_links_parent_id_idx" ON "archives_text_img_links" USING btree ("_parent_id");
CREATE INDEX "archives_text_img_settings_hide_on_order_idx" ON "archives_text_img_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_text_img_settings_hide_on_parent_idx" ON "archives_text_img_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_text_img_order_idx" ON "archives_text_img" USING btree ("_order");
CREATE INDEX "archives_text_img_parent_id_idx" ON "archives_text_img" USING btree ("_parent_id");
CREATE INDEX "archives_text_img_path_idx" ON "archives_text_img" USING btree ("_path");
CREATE INDEX "archives_text_img_image_idx" ON "archives_text_img" USING btree ("image_id");
CREATE INDEX "archives_prod_lines_settings_hide_on_order_idx" ON "archives_prod_lines_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_prod_lines_settings_hide_on_parent_idx" ON "archives_prod_lines_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_prod_lines_order_idx" ON "archives_prod_lines" USING btree ("_order");
CREATE INDEX "archives_prod_lines_parent_id_idx" ON "archives_prod_lines" USING btree ("_parent_id");
CREATE INDEX "archives_prod_lines_path_idx" ON "archives_prod_lines" USING btree ("_path");
CREATE INDEX "archives_prod_cats_settings_hide_on_order_idx" ON "archives_prod_cats_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_prod_cats_settings_hide_on_parent_idx" ON "archives_prod_cats_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_prod_cats_order_idx" ON "archives_prod_cats" USING btree ("_order");
CREATE INDEX "archives_prod_cats_parent_id_idx" ON "archives_prod_cats" USING btree ("_parent_id");
CREATE INDEX "archives_prod_cats_path_idx" ON "archives_prod_cats" USING btree ("_path");
CREATE INDEX "archives_prod_grid_settings_hide_on_order_idx" ON "archives_prod_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_prod_grid_settings_hide_on_parent_idx" ON "archives_prod_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_prod_grid_order_idx" ON "archives_prod_grid" USING btree ("_order");
CREATE INDEX "archives_prod_grid_parent_id_idx" ON "archives_prod_grid" USING btree ("_parent_id");
CREATE INDEX "archives_prod_grid_path_idx" ON "archives_prod_grid" USING btree ("_path");
CREATE INDEX "archives_prod_grid_category_idx" ON "archives_prod_grid" USING btree ("category_id");
CREATE INDEX "archives_prod_grid_line_idx" ON "archives_prod_grid" USING btree ("line_id");
CREATE INDEX "archives_quote_cta_links_order_idx" ON "archives_quote_cta_links" USING btree ("_order");
CREATE INDEX "archives_quote_cta_links_parent_id_idx" ON "archives_quote_cta_links" USING btree ("_parent_id");
CREATE INDEX "archives_quote_cta_settings_hide_on_order_idx" ON "archives_quote_cta_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_quote_cta_settings_hide_on_parent_idx" ON "archives_quote_cta_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_quote_cta_order_idx" ON "archives_quote_cta" USING btree ("_order");
CREATE INDEX "archives_quote_cta_parent_id_idx" ON "archives_quote_cta" USING btree ("_parent_id");
CREATE INDEX "archives_quote_cta_path_idx" ON "archives_quote_cta" USING btree ("_path");
CREATE INDEX "archives_proj_grid_settings_hide_on_order_idx" ON "archives_proj_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_proj_grid_settings_hide_on_parent_idx" ON "archives_proj_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_proj_grid_order_idx" ON "archives_proj_grid" USING btree ("_order");
CREATE INDEX "archives_proj_grid_parent_id_idx" ON "archives_proj_grid" USING btree ("_parent_id");
CREATE INDEX "archives_proj_grid_path_idx" ON "archives_proj_grid" USING btree ("_path");
CREATE INDEX "archives_proj_grid_category_idx" ON "archives_proj_grid" USING btree ("category_id");
CREATE INDEX "archives_docs_files_order_idx" ON "archives_docs_files" USING btree ("_order");
CREATE INDEX "archives_docs_files_parent_id_idx" ON "archives_docs_files" USING btree ("_parent_id");
CREATE INDEX "archives_docs_files_file_idx" ON "archives_docs_files" USING btree ("file_id");
CREATE INDEX "archives_docs_settings_hide_on_order_idx" ON "archives_docs_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_docs_settings_hide_on_parent_idx" ON "archives_docs_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_docs_order_idx" ON "archives_docs" USING btree ("_order");
CREATE INDEX "archives_docs_parent_id_idx" ON "archives_docs" USING btree ("_parent_id");
CREATE INDEX "archives_docs_path_idx" ON "archives_docs" USING btree ("_path");
CREATE INDEX "archives_quote_wiz_settings_hide_on_order_idx" ON "archives_quote_wiz_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_quote_wiz_settings_hide_on_parent_idx" ON "archives_quote_wiz_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_quote_wiz_order_idx" ON "archives_quote_wiz" USING btree ("_order");
CREATE INDEX "archives_quote_wiz_parent_id_idx" ON "archives_quote_wiz" USING btree ("_parent_id");
CREATE INDEX "archives_quote_wiz_path_idx" ON "archives_quote_wiz" USING btree ("_path");
CREATE INDEX "archives_rich_text_settings_hide_on_order_idx" ON "archives_rich_text_settings_hide_on" USING btree ("order");
CREATE INDEX "archives_rich_text_settings_hide_on_parent_idx" ON "archives_rich_text_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "archives_rich_text_order_idx" ON "archives_rich_text" USING btree ("_order");
CREATE INDEX "archives_rich_text_parent_id_idx" ON "archives_rich_text" USING btree ("_parent_id");
CREATE INDEX "archives_rich_text_path_idx" ON "archives_rich_text" USING btree ("_path");
ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "archives_rels" ADD CONSTRAINT "archives_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "homepage_rels_product_categories_id_idx" ON "homepage_rels" USING btree ("product_categories_id");
CREATE INDEX "_homepage_v_rels_product_categories_id_idx" ON "_homepage_v_rels" USING btree ("product_categories_id");
CREATE INDEX "archives_rels_product_categories_id_idx" ON "archives_rels" USING btree ("product_categories_id");
DROP TYPE "public"."enum_text_img_links_link_type";
DROP TYPE "public"."enum_text_img_links_link_appearance";
DROP TYPE "public"."enum_text_img_settings_hide_on";
DROP TYPE "public"."enum_text_img_variant";
DROP TYPE "public"."enum_text_img_image_position";
DROP TYPE "public"."enum_text_img_settings_background";
DROP TYPE "public"."enum_text_img_settings_spacing";
DROP TYPE "public"."enum_prod_lines_settings_hide_on";
DROP TYPE "public"."enum_prod_lines_variant";
DROP TYPE "public"."enum_prod_lines_settings_background";
DROP TYPE "public"."enum_prod_lines_settings_spacing";
DROP TYPE "public"."enum_prod_cats_settings_hide_on";
DROP TYPE "public"."enum_prod_cats_cta_type";
DROP TYPE "public"."enum_prod_cats_settings_background";
DROP TYPE "public"."enum_prod_cats_settings_spacing";
DROP TYPE "public"."enum_prod_grid_settings_hide_on";
DROP TYPE "public"."enum_prod_grid_variant";
DROP TYPE "public"."enum_prod_grid_source";
DROP TYPE "public"."enum_prod_grid_cta_type";
DROP TYPE "public"."enum_prod_grid_settings_background";
DROP TYPE "public"."enum_prod_grid_settings_spacing";
DROP TYPE "public"."enum_quote_cta_links_link_type";
DROP TYPE "public"."enum_quote_cta_links_link_appearance";
DROP TYPE "public"."enum_quote_cta_settings_hide_on";
DROP TYPE "public"."enum_quote_cta_variant";
DROP TYPE "public"."enum_quote_cta_settings_background";
DROP TYPE "public"."enum_quote_cta_settings_spacing";
DROP TYPE "public"."enum_proj_grid_settings_hide_on";
DROP TYPE "public"."enum_proj_grid_source";
DROP TYPE "public"."enum_proj_grid_cta_type";
DROP TYPE "public"."enum_proj_grid_settings_background";
DROP TYPE "public"."enum_proj_grid_settings_spacing";
DROP TYPE "public"."enum_docs_settings_hide_on";
DROP TYPE "public"."enum_docs_cta_type";
DROP TYPE "public"."enum_docs_settings_background";
DROP TYPE "public"."enum_docs_settings_spacing";
DROP TYPE "public"."enum_quote_wiz_settings_hide_on";
DROP TYPE "public"."enum_quote_wiz_settings_background";
DROP TYPE "public"."enum_quote_wiz_settings_spacing";
DROP TYPE "public"."enum_rich_text_settings_hide_on";
DROP TYPE "public"."enum_rich_text_settings_background";
DROP TYPE "public"."enum_rich_text_settings_spacing";
DROP TYPE "public"."enum__text_img_v_links_link_type";
DROP TYPE "public"."enum__text_img_v_links_link_appearance";
DROP TYPE "public"."enum__text_img_v_settings_hide_on";
DROP TYPE "public"."enum__text_img_v_variant";
DROP TYPE "public"."enum__text_img_v_image_position";
DROP TYPE "public"."enum__text_img_v_settings_background";
DROP TYPE "public"."enum__text_img_v_settings_spacing";
DROP TYPE "public"."enum__prod_lines_v_settings_hide_on";
DROP TYPE "public"."enum__prod_lines_v_variant";
DROP TYPE "public"."enum__prod_lines_v_settings_background";
DROP TYPE "public"."enum__prod_lines_v_settings_spacing";
DROP TYPE "public"."enum__prod_cats_v_settings_hide_on";
DROP TYPE "public"."enum__prod_cats_v_cta_type";
DROP TYPE "public"."enum__prod_cats_v_settings_background";
DROP TYPE "public"."enum__prod_cats_v_settings_spacing";
DROP TYPE "public"."enum__prod_grid_v_settings_hide_on";
DROP TYPE "public"."enum__prod_grid_v_variant";
DROP TYPE "public"."enum__prod_grid_v_source";
DROP TYPE "public"."enum__prod_grid_v_cta_type";
DROP TYPE "public"."enum__prod_grid_v_settings_background";
DROP TYPE "public"."enum__prod_grid_v_settings_spacing";
DROP TYPE "public"."enum__quote_cta_v_links_link_type";
DROP TYPE "public"."enum__quote_cta_v_links_link_appearance";
DROP TYPE "public"."enum__quote_cta_v_settings_hide_on";
DROP TYPE "public"."enum__quote_cta_v_variant";
DROP TYPE "public"."enum__quote_cta_v_settings_background";
DROP TYPE "public"."enum__quote_cta_v_settings_spacing";
DROP TYPE "public"."enum__proj_grid_v_settings_hide_on";
DROP TYPE "public"."enum__proj_grid_v_source";
DROP TYPE "public"."enum__proj_grid_v_cta_type";
DROP TYPE "public"."enum__proj_grid_v_settings_background";
DROP TYPE "public"."enum__proj_grid_v_settings_spacing";
DROP TYPE "public"."enum__docs_v_settings_hide_on";
DROP TYPE "public"."enum__docs_v_cta_type";
DROP TYPE "public"."enum__docs_v_settings_background";
DROP TYPE "public"."enum__docs_v_settings_spacing";
DROP TYPE "public"."enum__quote_wiz_v_settings_hide_on";
DROP TYPE "public"."enum__quote_wiz_v_settings_background";
DROP TYPE "public"."enum__quote_wiz_v_settings_spacing";
DROP TYPE "public"."enum__rich_text_v_settings_hide_on";
DROP TYPE "public"."enum__rich_text_v_settings_background";
DROP TYPE "public"."enum__rich_text_v_settings_spacing";
`

const DOWN_SQL = String.raw`
CREATE TYPE "public"."enum_text_img_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_text_img_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_text_img_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_text_img_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum_text_img_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum_text_img_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_text_img_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_prod_lines_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_prod_lines_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum_prod_lines_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_prod_lines_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_prod_cats_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_prod_cats_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_prod_cats_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_prod_cats_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_prod_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_prod_grid_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum_prod_grid_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum_prod_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_prod_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_prod_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_quote_cta_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_quote_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum_quote_cta_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_quote_cta_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum_quote_cta_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_quote_cta_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_proj_grid_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_proj_grid_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum_proj_grid_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_proj_grid_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_proj_grid_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_docs_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_docs_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum_docs_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_docs_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_quote_wiz_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_quote_wiz_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_quote_wiz_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum_rich_text_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum_rich_text_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum_rich_text_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__text_img_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__text_img_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum__text_img_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__text_img_v_variant" AS ENUM('bleed', 'contained');
CREATE TYPE "public"."enum__text_img_v_image_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum__text_img_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__text_img_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__prod_lines_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__prod_lines_v_variant" AS ENUM('cards', 'overlay');
CREATE TYPE "public"."enum__prod_lines_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__prod_lines_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__prod_cats_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__prod_cats_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__prod_cats_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__prod_cats_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__prod_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__prod_grid_v_variant" AS ENUM('cards', 'feature');
CREATE TYPE "public"."enum__prod_grid_v_source" AS ENUM('featured', 'category', 'line', 'manual');
CREATE TYPE "public"."enum__prod_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__prod_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__prod_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__quote_cta_v_links_link_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__quote_cta_v_links_link_appearance" AS ENUM('primary', 'secondary', 'outline', 'link');
CREATE TYPE "public"."enum__quote_cta_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__quote_cta_v_variant" AS ENUM('band', 'box');
CREATE TYPE "public"."enum__quote_cta_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__quote_cta_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__proj_grid_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__proj_grid_v_source" AS ENUM('featured', 'latest', 'category', 'manual');
CREATE TYPE "public"."enum__proj_grid_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__proj_grid_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__proj_grid_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__docs_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__docs_v_cta_type" AS ENUM('reference', 'custom', 'whatsapp');
CREATE TYPE "public"."enum__docs_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__docs_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__quote_wiz_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__quote_wiz_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__quote_wiz_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TYPE "public"."enum__rich_text_v_settings_hide_on" AS ENUM('mobile', 'tablet', 'desktop');
CREATE TYPE "public"."enum__rich_text_v_settings_background" AS ENUM('default', 'muted', 'dark', 'brand');
CREATE TYPE "public"."enum__rich_text_v_settings_spacing" AS ENUM('none', 'sm', 'md', 'lg');
CREATE TABLE "text_img_tags" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

CREATE TABLE "text_img_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

CREATE TABLE "text_img_facts" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar
);

CREATE TABLE "text_img_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_text_img_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_text_img_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "text_img_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_text_img_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "text_img" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_text_img_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer,
	"image_position" "enum_text_img_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_text_img_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_text_img_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "prod_lines_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_prod_lines_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "prod_lines" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_prod_lines_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_prod_lines_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_prod_lines_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "prod_cats_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_prod_cats_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "prod_cats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum_prod_cats_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_prod_cats_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_prod_cats_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "prod_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_prod_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "prod_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_prod_grid_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_prod_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum_prod_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_prod_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_prod_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "quote_cta_links" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"link_type" "enum_quote_cta_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum_quote_cta_links_link_appearance" DEFAULT 'primary'
);

CREATE TABLE "quote_cta_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_quote_cta_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "quote_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"variant" "enum_quote_cta_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_quote_cta_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_quote_cta_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "proj_grid_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_proj_grid_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "proj_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum_proj_grid_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum_proj_grid_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_proj_grid_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_proj_grid_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "docs_files" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar,
	"file_id" integer
);

CREATE TABLE "docs_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_docs_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "docs" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum_docs_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_docs_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_docs_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "quote_wiz_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_quote_wiz_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "quote_wiz" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_quote_wiz_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_quote_wiz_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "rich_text_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "enum_rich_text_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum_rich_text_settings_background" DEFAULT 'default',
	"settings_spacing" "enum_rich_text_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"block_name" varchar
);

CREATE TABLE "_text_img_v_tags" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

CREATE TABLE "_text_img_v_bullets" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

CREATE TABLE "_text_img_v_facts" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar,
	"_uuid" varchar
);

CREATE TABLE "_text_img_v_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"link_type" "enum__text_img_v_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum__text_img_v_links_link_appearance" DEFAULT 'primary',
	"_uuid" varchar
);

CREATE TABLE "_text_img_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__text_img_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_text_img_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__text_img_v_variant" DEFAULT 'bleed',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"content" jsonb,
	"image_id" integer,
	"image_position" "enum__text_img_v_image_position" DEFAULT 'left',
	"decoration" boolean DEFAULT false,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__text_img_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__text_img_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_prod_lines_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__prod_lines_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_prod_lines_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__prod_lines_v_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__prod_lines_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__prod_lines_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_prod_cats_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__prod_cats_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_prod_cats_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"cta_type" "enum__prod_cats_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__prod_cats_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__prod_cats_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_prod_grid_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__prod_grid_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_prod_grid_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__prod_grid_v_variant" DEFAULT 'cards',
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum__prod_grid_v_source" DEFAULT 'featured',
	"category_id" integer,
	"line_id" integer,
	"limit" numeric DEFAULT 6,
	"cta_type" "enum__prod_grid_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__prod_grid_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__prod_grid_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_quote_cta_v_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"link_type" "enum__quote_cta_v_links_link_type" DEFAULT 'custom',
	"link_new_tab" boolean,
	"link_label" varchar,
	"link_url" varchar,
	"link_whatsapp_message" varchar,
	"link_appearance" "enum__quote_cta_v_links_link_appearance" DEFAULT 'primary',
	"_uuid" varchar
);

CREATE TABLE "_quote_cta_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__quote_cta_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_quote_cta_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"variant" "enum__quote_cta_v_variant" DEFAULT 'band',
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"show_whatsapp" boolean DEFAULT true,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__quote_cta_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__quote_cta_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_proj_grid_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__proj_grid_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_proj_grid_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"source" "enum__proj_grid_v_source" DEFAULT 'featured',
	"category_id" integer,
	"limit" numeric DEFAULT 4,
	"cta_type" "enum__proj_grid_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__proj_grid_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__proj_grid_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_docs_v_files" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar,
	"file_id" integer,
	"_uuid" varchar
);

CREATE TABLE "_docs_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__docs_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_docs_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"intro" varchar,
	"show_lines" boolean DEFAULT true,
	"note" varchar,
	"cta_type" "enum__docs_v_cta_type" DEFAULT 'custom',
	"cta_new_tab" boolean,
	"cta_label" varchar,
	"cta_url" varchar,
	"cta_whatsapp_message" varchar,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__docs_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__docs_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_quote_wiz_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__quote_wiz_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_quote_wiz_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__quote_wiz_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__quote_wiz_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

CREATE TABLE "_rich_text_v_settings_hide_on" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum__rich_text_v_settings_hide_on",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE "_rich_text_v" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" jsonb,
	"settings_hidden" boolean DEFAULT false,
	"settings_background" "enum__rich_text_v_settings_background" DEFAULT 'default',
	"settings_spacing" "enum__rich_text_v_settings_spacing" DEFAULT 'md',
	"settings_anchor" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

ALTER TABLE "pages_text_img_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_text_img_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_text_img_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_text_img_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_text_img_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_text_img" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_prod_lines_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_prod_lines" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_prod_cats_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_prod_cats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_prod_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_prod_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_quote_cta_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_quote_cta_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_quote_cta" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_proj_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_proj_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_docs_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_docs_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_docs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_quote_wiz_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_quote_wiz" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_rich_text_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "pages_rich_text" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_text_img_v_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_text_img_v_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_text_img_v_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_text_img_v_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_text_img_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_text_img_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_prod_lines_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_prod_lines_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_prod_cats_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_prod_cats_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_prod_grid_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_prod_grid_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_quote_cta_v_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_quote_cta_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_quote_cta_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_proj_grid_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_proj_grid_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_docs_v_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_docs_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_docs_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_quote_wiz_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_quote_wiz_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_rich_text_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_pages_rich_text_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_text_img_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_text_img_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_text_img_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_text_img_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_text_img_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_text_img" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_prod_lines_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_prod_lines" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_prod_cats_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_prod_cats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_prod_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_prod_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_quote_cta_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_quote_cta_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_quote_cta" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_proj_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_proj_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_docs_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_docs_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_docs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_quote_wiz_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_quote_wiz" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_rich_text_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_rich_text" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_text_img_v_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_text_img_v_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_text_img_v_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_text_img_v_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_text_img_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_text_img_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_prod_lines_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_prod_lines_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_prod_cats_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_prod_cats_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_prod_grid_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_prod_grid_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_quote_cta_v_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_quote_cta_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_quote_cta_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_proj_grid_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_proj_grid_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_docs_v_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_docs_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_docs_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_quote_wiz_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_quote_wiz_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_rich_text_v_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_homepage_rich_text_v" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_text_img_tags" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_text_img_bullets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_text_img_facts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_text_img_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_text_img_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_text_img" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_prod_lines_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_prod_lines" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_prod_cats_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_prod_cats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_prod_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_prod_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_quote_cta_links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_quote_cta_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_quote_cta" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_proj_grid_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_proj_grid" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_docs_files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_docs_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_docs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_quote_wiz_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_quote_wiz" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_rich_text_settings_hide_on" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "archives_rich_text" DISABLE ROW LEVEL SECURITY;
DROP TABLE "pages_text_img_tags" CASCADE;
DROP TABLE "pages_text_img_bullets" CASCADE;
DROP TABLE "pages_text_img_facts" CASCADE;
DROP TABLE "pages_text_img_links" CASCADE;
DROP TABLE "pages_text_img_settings_hide_on" CASCADE;
DROP TABLE "pages_text_img" CASCADE;
DROP TABLE "pages_prod_lines_settings_hide_on" CASCADE;
DROP TABLE "pages_prod_lines" CASCADE;
DROP TABLE "pages_prod_cats_settings_hide_on" CASCADE;
DROP TABLE "pages_prod_cats" CASCADE;
DROP TABLE "pages_prod_grid_settings_hide_on" CASCADE;
DROP TABLE "pages_prod_grid" CASCADE;
DROP TABLE "pages_quote_cta_links" CASCADE;
DROP TABLE "pages_quote_cta_settings_hide_on" CASCADE;
DROP TABLE "pages_quote_cta" CASCADE;
DROP TABLE "pages_proj_grid_settings_hide_on" CASCADE;
DROP TABLE "pages_proj_grid" CASCADE;
DROP TABLE "pages_docs_files" CASCADE;
DROP TABLE "pages_docs_settings_hide_on" CASCADE;
DROP TABLE "pages_docs" CASCADE;
DROP TABLE "pages_quote_wiz_settings_hide_on" CASCADE;
DROP TABLE "pages_quote_wiz" CASCADE;
DROP TABLE "pages_rich_text_settings_hide_on" CASCADE;
DROP TABLE "pages_rich_text" CASCADE;
DROP TABLE "_pages_text_img_v_tags" CASCADE;
DROP TABLE "_pages_text_img_v_bullets" CASCADE;
DROP TABLE "_pages_text_img_v_facts" CASCADE;
DROP TABLE "_pages_text_img_v_links" CASCADE;
DROP TABLE "_pages_text_img_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_text_img_v" CASCADE;
DROP TABLE "_pages_prod_lines_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_prod_lines_v" CASCADE;
DROP TABLE "_pages_prod_cats_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_prod_cats_v" CASCADE;
DROP TABLE "_pages_prod_grid_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_prod_grid_v" CASCADE;
DROP TABLE "_pages_quote_cta_v_links" CASCADE;
DROP TABLE "_pages_quote_cta_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_quote_cta_v" CASCADE;
DROP TABLE "_pages_proj_grid_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_proj_grid_v" CASCADE;
DROP TABLE "_pages_docs_v_files" CASCADE;
DROP TABLE "_pages_docs_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_docs_v" CASCADE;
DROP TABLE "_pages_quote_wiz_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_quote_wiz_v" CASCADE;
DROP TABLE "_pages_rich_text_v_settings_hide_on" CASCADE;
DROP TABLE "_pages_rich_text_v" CASCADE;
DROP TABLE "homepage_text_img_tags" CASCADE;
DROP TABLE "homepage_text_img_bullets" CASCADE;
DROP TABLE "homepage_text_img_facts" CASCADE;
DROP TABLE "homepage_text_img_links" CASCADE;
DROP TABLE "homepage_text_img_settings_hide_on" CASCADE;
DROP TABLE "homepage_text_img" CASCADE;
DROP TABLE "homepage_prod_lines_settings_hide_on" CASCADE;
DROP TABLE "homepage_prod_lines" CASCADE;
DROP TABLE "homepage_prod_cats_settings_hide_on" CASCADE;
DROP TABLE "homepage_prod_cats" CASCADE;
DROP TABLE "homepage_prod_grid_settings_hide_on" CASCADE;
DROP TABLE "homepage_prod_grid" CASCADE;
DROP TABLE "homepage_quote_cta_links" CASCADE;
DROP TABLE "homepage_quote_cta_settings_hide_on" CASCADE;
DROP TABLE "homepage_quote_cta" CASCADE;
DROP TABLE "homepage_proj_grid_settings_hide_on" CASCADE;
DROP TABLE "homepage_proj_grid" CASCADE;
DROP TABLE "homepage_docs_files" CASCADE;
DROP TABLE "homepage_docs_settings_hide_on" CASCADE;
DROP TABLE "homepage_docs" CASCADE;
DROP TABLE "homepage_quote_wiz_settings_hide_on" CASCADE;
DROP TABLE "homepage_quote_wiz" CASCADE;
DROP TABLE "homepage_rich_text_settings_hide_on" CASCADE;
DROP TABLE "homepage_rich_text" CASCADE;
DROP TABLE "_homepage_text_img_v_tags" CASCADE;
DROP TABLE "_homepage_text_img_v_bullets" CASCADE;
DROP TABLE "_homepage_text_img_v_facts" CASCADE;
DROP TABLE "_homepage_text_img_v_links" CASCADE;
DROP TABLE "_homepage_text_img_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_text_img_v" CASCADE;
DROP TABLE "_homepage_prod_lines_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_prod_lines_v" CASCADE;
DROP TABLE "_homepage_prod_cats_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_prod_cats_v" CASCADE;
DROP TABLE "_homepage_prod_grid_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_prod_grid_v" CASCADE;
DROP TABLE "_homepage_quote_cta_v_links" CASCADE;
DROP TABLE "_homepage_quote_cta_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_quote_cta_v" CASCADE;
DROP TABLE "_homepage_proj_grid_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_proj_grid_v" CASCADE;
DROP TABLE "_homepage_docs_v_files" CASCADE;
DROP TABLE "_homepage_docs_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_docs_v" CASCADE;
DROP TABLE "_homepage_quote_wiz_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_quote_wiz_v" CASCADE;
DROP TABLE "_homepage_rich_text_v_settings_hide_on" CASCADE;
DROP TABLE "_homepage_rich_text_v" CASCADE;
DROP TABLE "archives_text_img_tags" CASCADE;
DROP TABLE "archives_text_img_bullets" CASCADE;
DROP TABLE "archives_text_img_facts" CASCADE;
DROP TABLE "archives_text_img_links" CASCADE;
DROP TABLE "archives_text_img_settings_hide_on" CASCADE;
DROP TABLE "archives_text_img" CASCADE;
DROP TABLE "archives_prod_lines_settings_hide_on" CASCADE;
DROP TABLE "archives_prod_lines" CASCADE;
DROP TABLE "archives_prod_cats_settings_hide_on" CASCADE;
DROP TABLE "archives_prod_cats" CASCADE;
DROP TABLE "archives_prod_grid_settings_hide_on" CASCADE;
DROP TABLE "archives_prod_grid" CASCADE;
DROP TABLE "archives_quote_cta_links" CASCADE;
DROP TABLE "archives_quote_cta_settings_hide_on" CASCADE;
DROP TABLE "archives_quote_cta" CASCADE;
DROP TABLE "archives_proj_grid_settings_hide_on" CASCADE;
DROP TABLE "archives_proj_grid" CASCADE;
DROP TABLE "archives_docs_files" CASCADE;
DROP TABLE "archives_docs_settings_hide_on" CASCADE;
DROP TABLE "archives_docs" CASCADE;
DROP TABLE "archives_quote_wiz_settings_hide_on" CASCADE;
DROP TABLE "archives_quote_wiz" CASCADE;
DROP TABLE "archives_rich_text_settings_hide_on" CASCADE;
DROP TABLE "archives_rich_text" CASCADE;
ALTER TABLE "homepage_rels" DROP CONSTRAINT "homepage_rels_product_categories_fk";

ALTER TABLE "_homepage_v_rels" DROP CONSTRAINT "_homepage_v_rels_product_categories_fk";

ALTER TABLE "archives_rels" DROP CONSTRAINT "archives_rels_product_categories_fk";

DROP INDEX "homepage_rels_product_categories_id_idx";
DROP INDEX "_homepage_v_rels_product_categories_id_idx";
DROP INDEX "archives_rels_product_categories_id_idx";
ALTER TABLE "text_img_tags" ADD CONSTRAINT "text_img_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "text_img_bullets" ADD CONSTRAINT "text_img_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "text_img_facts" ADD CONSTRAINT "text_img_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "text_img_links" ADD CONSTRAINT "text_img_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "text_img_settings_hide_on" ADD CONSTRAINT "text_img_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."text_img"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "text_img" ADD CONSTRAINT "text_img_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "text_img" ADD CONSTRAINT "text_img_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prod_lines_settings_hide_on" ADD CONSTRAINT "prod_lines_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_lines"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prod_lines" ADD CONSTRAINT "prod_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prod_cats_settings_hide_on" ADD CONSTRAINT "prod_cats_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_cats"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prod_cats" ADD CONSTRAINT "prod_cats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prod_grid_settings_hide_on" ADD CONSTRAINT "prod_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "prod_grid" ADD CONSTRAINT "prod_grid_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "prod_grid" ADD CONSTRAINT "prod_grid_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "prod_grid" ADD CONSTRAINT "prod_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quote_cta_links" ADD CONSTRAINT "quote_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quote_cta_settings_hide_on" ADD CONSTRAINT "quote_cta_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quote_cta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quote_cta" ADD CONSTRAINT "quote_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "proj_grid_settings_hide_on" ADD CONSTRAINT "proj_grid_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proj_grid"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "proj_grid" ADD CONSTRAINT "proj_grid_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "proj_grid" ADD CONSTRAINT "proj_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "docs_files" ADD CONSTRAINT "docs_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "docs_files" ADD CONSTRAINT "docs_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "docs_settings_hide_on" ADD CONSTRAINT "docs_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "docs" ADD CONSTRAINT "docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quote_wiz_settings_hide_on" ADD CONSTRAINT "quote_wiz_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quote_wiz"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quote_wiz" ADD CONSTRAINT "quote_wiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "rich_text_settings_hide_on" ADD CONSTRAINT "rich_text_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rich_text"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "rich_text" ADD CONSTRAINT "rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_text_img_v_tags" ADD CONSTRAINT "_text_img_v_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_text_img_v_bullets" ADD CONSTRAINT "_text_img_v_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_text_img_v_facts" ADD CONSTRAINT "_text_img_v_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_text_img_v_links" ADD CONSTRAINT "_text_img_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_text_img_v_settings_hide_on" ADD CONSTRAINT "_text_img_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_text_img_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_text_img_v" ADD CONSTRAINT "_text_img_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_text_img_v" ADD CONSTRAINT "_text_img_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_prod_lines_v_settings_hide_on" ADD CONSTRAINT "_prod_lines_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_prod_lines_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_prod_lines_v" ADD CONSTRAINT "_prod_lines_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_prod_cats_v_settings_hide_on" ADD CONSTRAINT "_prod_cats_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_prod_cats_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_prod_cats_v" ADD CONSTRAINT "_prod_cats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_prod_grid_v_settings_hide_on" ADD CONSTRAINT "_prod_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_prod_grid_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_prod_grid_v" ADD CONSTRAINT "_prod_grid_v_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_prod_grid_v" ADD CONSTRAINT "_prod_grid_v_line_id_product_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_prod_grid_v" ADD CONSTRAINT "_prod_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_quote_cta_v_links" ADD CONSTRAINT "_quote_cta_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_quote_cta_v_settings_hide_on" ADD CONSTRAINT "_quote_cta_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_quote_cta_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_quote_cta_v" ADD CONSTRAINT "_quote_cta_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_proj_grid_v_settings_hide_on" ADD CONSTRAINT "_proj_grid_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_proj_grid_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_proj_grid_v" ADD CONSTRAINT "_proj_grid_v_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_proj_grid_v" ADD CONSTRAINT "_proj_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_docs_v_files" ADD CONSTRAINT "_docs_v_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_docs_v_files" ADD CONSTRAINT "_docs_v_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_docs_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_docs_v_settings_hide_on" ADD CONSTRAINT "_docs_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_docs_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_docs_v" ADD CONSTRAINT "_docs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_quote_wiz_v_settings_hide_on" ADD CONSTRAINT "_quote_wiz_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_quote_wiz_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_quote_wiz_v" ADD CONSTRAINT "_quote_wiz_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_rich_text_v_settings_hide_on" ADD CONSTRAINT "_rich_text_v_settings_hide_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_rich_text_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_rich_text_v" ADD CONSTRAINT "_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "text_img_tags_order_idx" ON "text_img_tags" USING btree ("_order");
CREATE INDEX "text_img_tags_parent_id_idx" ON "text_img_tags" USING btree ("_parent_id");
CREATE INDEX "text_img_bullets_order_idx" ON "text_img_bullets" USING btree ("_order");
CREATE INDEX "text_img_bullets_parent_id_idx" ON "text_img_bullets" USING btree ("_parent_id");
CREATE INDEX "text_img_facts_order_idx" ON "text_img_facts" USING btree ("_order");
CREATE INDEX "text_img_facts_parent_id_idx" ON "text_img_facts" USING btree ("_parent_id");
CREATE INDEX "text_img_links_order_idx" ON "text_img_links" USING btree ("_order");
CREATE INDEX "text_img_links_parent_id_idx" ON "text_img_links" USING btree ("_parent_id");
CREATE INDEX "text_img_settings_hide_on_order_idx" ON "text_img_settings_hide_on" USING btree ("order");
CREATE INDEX "text_img_settings_hide_on_parent_idx" ON "text_img_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "text_img_order_idx" ON "text_img" USING btree ("_order");
CREATE INDEX "text_img_parent_id_idx" ON "text_img" USING btree ("_parent_id");
CREATE INDEX "text_img_path_idx" ON "text_img" USING btree ("_path");
CREATE INDEX "text_img_image_idx" ON "text_img" USING btree ("image_id");
CREATE INDEX "prod_lines_settings_hide_on_order_idx" ON "prod_lines_settings_hide_on" USING btree ("order");
CREATE INDEX "prod_lines_settings_hide_on_parent_idx" ON "prod_lines_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "prod_lines_order_idx" ON "prod_lines" USING btree ("_order");
CREATE INDEX "prod_lines_parent_id_idx" ON "prod_lines" USING btree ("_parent_id");
CREATE INDEX "prod_lines_path_idx" ON "prod_lines" USING btree ("_path");
CREATE INDEX "prod_cats_settings_hide_on_order_idx" ON "prod_cats_settings_hide_on" USING btree ("order");
CREATE INDEX "prod_cats_settings_hide_on_parent_idx" ON "prod_cats_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "prod_cats_order_idx" ON "prod_cats" USING btree ("_order");
CREATE INDEX "prod_cats_parent_id_idx" ON "prod_cats" USING btree ("_parent_id");
CREATE INDEX "prod_cats_path_idx" ON "prod_cats" USING btree ("_path");
CREATE INDEX "prod_grid_settings_hide_on_order_idx" ON "prod_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "prod_grid_settings_hide_on_parent_idx" ON "prod_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "prod_grid_order_idx" ON "prod_grid" USING btree ("_order");
CREATE INDEX "prod_grid_parent_id_idx" ON "prod_grid" USING btree ("_parent_id");
CREATE INDEX "prod_grid_path_idx" ON "prod_grid" USING btree ("_path");
CREATE INDEX "prod_grid_category_idx" ON "prod_grid" USING btree ("category_id");
CREATE INDEX "prod_grid_line_idx" ON "prod_grid" USING btree ("line_id");
CREATE INDEX "quote_cta_links_order_idx" ON "quote_cta_links" USING btree ("_order");
CREATE INDEX "quote_cta_links_parent_id_idx" ON "quote_cta_links" USING btree ("_parent_id");
CREATE INDEX "quote_cta_settings_hide_on_order_idx" ON "quote_cta_settings_hide_on" USING btree ("order");
CREATE INDEX "quote_cta_settings_hide_on_parent_idx" ON "quote_cta_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "quote_cta_order_idx" ON "quote_cta" USING btree ("_order");
CREATE INDEX "quote_cta_parent_id_idx" ON "quote_cta" USING btree ("_parent_id");
CREATE INDEX "quote_cta_path_idx" ON "quote_cta" USING btree ("_path");
CREATE INDEX "proj_grid_settings_hide_on_order_idx" ON "proj_grid_settings_hide_on" USING btree ("order");
CREATE INDEX "proj_grid_settings_hide_on_parent_idx" ON "proj_grid_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "proj_grid_order_idx" ON "proj_grid" USING btree ("_order");
CREATE INDEX "proj_grid_parent_id_idx" ON "proj_grid" USING btree ("_parent_id");
CREATE INDEX "proj_grid_path_idx" ON "proj_grid" USING btree ("_path");
CREATE INDEX "proj_grid_category_idx" ON "proj_grid" USING btree ("category_id");
CREATE INDEX "docs_files_order_idx" ON "docs_files" USING btree ("_order");
CREATE INDEX "docs_files_parent_id_idx" ON "docs_files" USING btree ("_parent_id");
CREATE INDEX "docs_files_file_idx" ON "docs_files" USING btree ("file_id");
CREATE INDEX "docs_settings_hide_on_order_idx" ON "docs_settings_hide_on" USING btree ("order");
CREATE INDEX "docs_settings_hide_on_parent_idx" ON "docs_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "docs_order_idx" ON "docs" USING btree ("_order");
CREATE INDEX "docs_parent_id_idx" ON "docs" USING btree ("_parent_id");
CREATE INDEX "docs_path_idx" ON "docs" USING btree ("_path");
CREATE INDEX "quote_wiz_settings_hide_on_order_idx" ON "quote_wiz_settings_hide_on" USING btree ("order");
CREATE INDEX "quote_wiz_settings_hide_on_parent_idx" ON "quote_wiz_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "quote_wiz_order_idx" ON "quote_wiz" USING btree ("_order");
CREATE INDEX "quote_wiz_parent_id_idx" ON "quote_wiz" USING btree ("_parent_id");
CREATE INDEX "quote_wiz_path_idx" ON "quote_wiz" USING btree ("_path");
CREATE INDEX "rich_text_settings_hide_on_order_idx" ON "rich_text_settings_hide_on" USING btree ("order");
CREATE INDEX "rich_text_settings_hide_on_parent_idx" ON "rich_text_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "rich_text_order_idx" ON "rich_text" USING btree ("_order");
CREATE INDEX "rich_text_parent_id_idx" ON "rich_text" USING btree ("_parent_id");
CREATE INDEX "rich_text_path_idx" ON "rich_text" USING btree ("_path");
CREATE INDEX "_text_img_v_tags_order_idx" ON "_text_img_v_tags" USING btree ("_order");
CREATE INDEX "_text_img_v_tags_parent_id_idx" ON "_text_img_v_tags" USING btree ("_parent_id");
CREATE INDEX "_text_img_v_bullets_order_idx" ON "_text_img_v_bullets" USING btree ("_order");
CREATE INDEX "_text_img_v_bullets_parent_id_idx" ON "_text_img_v_bullets" USING btree ("_parent_id");
CREATE INDEX "_text_img_v_facts_order_idx" ON "_text_img_v_facts" USING btree ("_order");
CREATE INDEX "_text_img_v_facts_parent_id_idx" ON "_text_img_v_facts" USING btree ("_parent_id");
CREATE INDEX "_text_img_v_links_order_idx" ON "_text_img_v_links" USING btree ("_order");
CREATE INDEX "_text_img_v_links_parent_id_idx" ON "_text_img_v_links" USING btree ("_parent_id");
CREATE INDEX "_text_img_v_settings_hide_on_order_idx" ON "_text_img_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_text_img_v_settings_hide_on_parent_idx" ON "_text_img_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_text_img_v_order_idx" ON "_text_img_v" USING btree ("_order");
CREATE INDEX "_text_img_v_parent_id_idx" ON "_text_img_v" USING btree ("_parent_id");
CREATE INDEX "_text_img_v_path_idx" ON "_text_img_v" USING btree ("_path");
CREATE INDEX "_text_img_v_image_idx" ON "_text_img_v" USING btree ("image_id");
CREATE INDEX "_prod_lines_v_settings_hide_on_order_idx" ON "_prod_lines_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_prod_lines_v_settings_hide_on_parent_idx" ON "_prod_lines_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_prod_lines_v_order_idx" ON "_prod_lines_v" USING btree ("_order");
CREATE INDEX "_prod_lines_v_parent_id_idx" ON "_prod_lines_v" USING btree ("_parent_id");
CREATE INDEX "_prod_lines_v_path_idx" ON "_prod_lines_v" USING btree ("_path");
CREATE INDEX "_prod_cats_v_settings_hide_on_order_idx" ON "_prod_cats_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_prod_cats_v_settings_hide_on_parent_idx" ON "_prod_cats_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_prod_cats_v_order_idx" ON "_prod_cats_v" USING btree ("_order");
CREATE INDEX "_prod_cats_v_parent_id_idx" ON "_prod_cats_v" USING btree ("_parent_id");
CREATE INDEX "_prod_cats_v_path_idx" ON "_prod_cats_v" USING btree ("_path");
CREATE INDEX "_prod_grid_v_settings_hide_on_order_idx" ON "_prod_grid_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_prod_grid_v_settings_hide_on_parent_idx" ON "_prod_grid_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_prod_grid_v_order_idx" ON "_prod_grid_v" USING btree ("_order");
CREATE INDEX "_prod_grid_v_parent_id_idx" ON "_prod_grid_v" USING btree ("_parent_id");
CREATE INDEX "_prod_grid_v_path_idx" ON "_prod_grid_v" USING btree ("_path");
CREATE INDEX "_prod_grid_v_category_idx" ON "_prod_grid_v" USING btree ("category_id");
CREATE INDEX "_prod_grid_v_line_idx" ON "_prod_grid_v" USING btree ("line_id");
CREATE INDEX "_quote_cta_v_links_order_idx" ON "_quote_cta_v_links" USING btree ("_order");
CREATE INDEX "_quote_cta_v_links_parent_id_idx" ON "_quote_cta_v_links" USING btree ("_parent_id");
CREATE INDEX "_quote_cta_v_settings_hide_on_order_idx" ON "_quote_cta_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_quote_cta_v_settings_hide_on_parent_idx" ON "_quote_cta_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_quote_cta_v_order_idx" ON "_quote_cta_v" USING btree ("_order");
CREATE INDEX "_quote_cta_v_parent_id_idx" ON "_quote_cta_v" USING btree ("_parent_id");
CREATE INDEX "_quote_cta_v_path_idx" ON "_quote_cta_v" USING btree ("_path");
CREATE INDEX "_proj_grid_v_settings_hide_on_order_idx" ON "_proj_grid_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_proj_grid_v_settings_hide_on_parent_idx" ON "_proj_grid_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_proj_grid_v_order_idx" ON "_proj_grid_v" USING btree ("_order");
CREATE INDEX "_proj_grid_v_parent_id_idx" ON "_proj_grid_v" USING btree ("_parent_id");
CREATE INDEX "_proj_grid_v_path_idx" ON "_proj_grid_v" USING btree ("_path");
CREATE INDEX "_proj_grid_v_category_idx" ON "_proj_grid_v" USING btree ("category_id");
CREATE INDEX "_docs_v_files_order_idx" ON "_docs_v_files" USING btree ("_order");
CREATE INDEX "_docs_v_files_parent_id_idx" ON "_docs_v_files" USING btree ("_parent_id");
CREATE INDEX "_docs_v_files_file_idx" ON "_docs_v_files" USING btree ("file_id");
CREATE INDEX "_docs_v_settings_hide_on_order_idx" ON "_docs_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_docs_v_settings_hide_on_parent_idx" ON "_docs_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_docs_v_order_idx" ON "_docs_v" USING btree ("_order");
CREATE INDEX "_docs_v_parent_id_idx" ON "_docs_v" USING btree ("_parent_id");
CREATE INDEX "_docs_v_path_idx" ON "_docs_v" USING btree ("_path");
CREATE INDEX "_quote_wiz_v_settings_hide_on_order_idx" ON "_quote_wiz_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_quote_wiz_v_settings_hide_on_parent_idx" ON "_quote_wiz_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_quote_wiz_v_order_idx" ON "_quote_wiz_v" USING btree ("_order");
CREATE INDEX "_quote_wiz_v_parent_id_idx" ON "_quote_wiz_v" USING btree ("_parent_id");
CREATE INDEX "_quote_wiz_v_path_idx" ON "_quote_wiz_v" USING btree ("_path");
CREATE INDEX "_rich_text_v_settings_hide_on_order_idx" ON "_rich_text_v_settings_hide_on" USING btree ("order");
CREATE INDEX "_rich_text_v_settings_hide_on_parent_idx" ON "_rich_text_v_settings_hide_on" USING btree ("parent_id");
CREATE INDEX "_rich_text_v_order_idx" ON "_rich_text_v" USING btree ("_order");
CREATE INDEX "_rich_text_v_parent_id_idx" ON "_rich_text_v" USING btree ("_parent_id");
CREATE INDEX "_rich_text_v_path_idx" ON "_rich_text_v" USING btree ("_path");
ALTER TABLE "homepage_rels" DROP COLUMN "product_categories_id";
ALTER TABLE "_homepage_v_rels" DROP COLUMN "product_categories_id";
ALTER TABLE "archives_rels" DROP COLUMN "product_categories_id";
DROP TYPE "public"."enum_pages_text_img_links_link_type";
DROP TYPE "public"."enum_pages_text_img_links_link_appearance";
DROP TYPE "public"."enum_pages_text_img_settings_hide_on";
DROP TYPE "public"."enum_pages_text_img_variant";
DROP TYPE "public"."enum_pages_text_img_image_position";
DROP TYPE "public"."enum_pages_text_img_settings_background";
DROP TYPE "public"."enum_pages_text_img_settings_spacing";
DROP TYPE "public"."enum_pages_prod_lines_settings_hide_on";
DROP TYPE "public"."enum_pages_prod_lines_variant";
DROP TYPE "public"."enum_pages_prod_lines_settings_background";
DROP TYPE "public"."enum_pages_prod_lines_settings_spacing";
DROP TYPE "public"."enum_pages_prod_cats_settings_hide_on";
DROP TYPE "public"."enum_pages_prod_cats_cta_type";
DROP TYPE "public"."enum_pages_prod_cats_settings_background";
DROP TYPE "public"."enum_pages_prod_cats_settings_spacing";
DROP TYPE "public"."enum_pages_prod_grid_settings_hide_on";
DROP TYPE "public"."enum_pages_prod_grid_variant";
DROP TYPE "public"."enum_pages_prod_grid_source";
DROP TYPE "public"."enum_pages_prod_grid_cta_type";
DROP TYPE "public"."enum_pages_prod_grid_settings_background";
DROP TYPE "public"."enum_pages_prod_grid_settings_spacing";
DROP TYPE "public"."enum_pages_quote_cta_links_link_type";
DROP TYPE "public"."enum_pages_quote_cta_links_link_appearance";
DROP TYPE "public"."enum_pages_quote_cta_settings_hide_on";
DROP TYPE "public"."enum_pages_quote_cta_variant";
DROP TYPE "public"."enum_pages_quote_cta_settings_background";
DROP TYPE "public"."enum_pages_quote_cta_settings_spacing";
DROP TYPE "public"."enum_pages_proj_grid_settings_hide_on";
DROP TYPE "public"."enum_pages_proj_grid_source";
DROP TYPE "public"."enum_pages_proj_grid_cta_type";
DROP TYPE "public"."enum_pages_proj_grid_settings_background";
DROP TYPE "public"."enum_pages_proj_grid_settings_spacing";
DROP TYPE "public"."enum_pages_docs_settings_hide_on";
DROP TYPE "public"."enum_pages_docs_cta_type";
DROP TYPE "public"."enum_pages_docs_settings_background";
DROP TYPE "public"."enum_pages_docs_settings_spacing";
DROP TYPE "public"."enum_pages_quote_wiz_settings_hide_on";
DROP TYPE "public"."enum_pages_quote_wiz_settings_background";
DROP TYPE "public"."enum_pages_quote_wiz_settings_spacing";
DROP TYPE "public"."enum_pages_rich_text_settings_hide_on";
DROP TYPE "public"."enum_pages_rich_text_settings_background";
DROP TYPE "public"."enum_pages_rich_text_settings_spacing";
DROP TYPE "public"."enum__pages_text_img_v_links_link_type";
DROP TYPE "public"."enum__pages_text_img_v_links_link_appearance";
DROP TYPE "public"."enum__pages_text_img_v_settings_hide_on";
DROP TYPE "public"."enum__pages_text_img_v_variant";
DROP TYPE "public"."enum__pages_text_img_v_image_position";
DROP TYPE "public"."enum__pages_text_img_v_settings_background";
DROP TYPE "public"."enum__pages_text_img_v_settings_spacing";
DROP TYPE "public"."enum__pages_prod_lines_v_settings_hide_on";
DROP TYPE "public"."enum__pages_prod_lines_v_variant";
DROP TYPE "public"."enum__pages_prod_lines_v_settings_background";
DROP TYPE "public"."enum__pages_prod_lines_v_settings_spacing";
DROP TYPE "public"."enum__pages_prod_cats_v_settings_hide_on";
DROP TYPE "public"."enum__pages_prod_cats_v_cta_type";
DROP TYPE "public"."enum__pages_prod_cats_v_settings_background";
DROP TYPE "public"."enum__pages_prod_cats_v_settings_spacing";
DROP TYPE "public"."enum__pages_prod_grid_v_settings_hide_on";
DROP TYPE "public"."enum__pages_prod_grid_v_variant";
DROP TYPE "public"."enum__pages_prod_grid_v_source";
DROP TYPE "public"."enum__pages_prod_grid_v_cta_type";
DROP TYPE "public"."enum__pages_prod_grid_v_settings_background";
DROP TYPE "public"."enum__pages_prod_grid_v_settings_spacing";
DROP TYPE "public"."enum__pages_quote_cta_v_links_link_type";
DROP TYPE "public"."enum__pages_quote_cta_v_links_link_appearance";
DROP TYPE "public"."enum__pages_quote_cta_v_settings_hide_on";
DROP TYPE "public"."enum__pages_quote_cta_v_variant";
DROP TYPE "public"."enum__pages_quote_cta_v_settings_background";
DROP TYPE "public"."enum__pages_quote_cta_v_settings_spacing";
DROP TYPE "public"."enum__pages_proj_grid_v_settings_hide_on";
DROP TYPE "public"."enum__pages_proj_grid_v_source";
DROP TYPE "public"."enum__pages_proj_grid_v_cta_type";
DROP TYPE "public"."enum__pages_proj_grid_v_settings_background";
DROP TYPE "public"."enum__pages_proj_grid_v_settings_spacing";
DROP TYPE "public"."enum__pages_docs_v_settings_hide_on";
DROP TYPE "public"."enum__pages_docs_v_cta_type";
DROP TYPE "public"."enum__pages_docs_v_settings_background";
DROP TYPE "public"."enum__pages_docs_v_settings_spacing";
DROP TYPE "public"."enum__pages_quote_wiz_v_settings_hide_on";
DROP TYPE "public"."enum__pages_quote_wiz_v_settings_background";
DROP TYPE "public"."enum__pages_quote_wiz_v_settings_spacing";
DROP TYPE "public"."enum__pages_rich_text_v_settings_hide_on";
DROP TYPE "public"."enum__pages_rich_text_v_settings_background";
DROP TYPE "public"."enum__pages_rich_text_v_settings_spacing";
DROP TYPE "public"."enum_homepage_text_img_links_link_type";
DROP TYPE "public"."enum_homepage_text_img_links_link_appearance";
DROP TYPE "public"."enum_homepage_text_img_settings_hide_on";
DROP TYPE "public"."enum_homepage_text_img_variant";
DROP TYPE "public"."enum_homepage_text_img_image_position";
DROP TYPE "public"."enum_homepage_text_img_settings_background";
DROP TYPE "public"."enum_homepage_text_img_settings_spacing";
DROP TYPE "public"."enum_homepage_prod_lines_settings_hide_on";
DROP TYPE "public"."enum_homepage_prod_lines_variant";
DROP TYPE "public"."enum_homepage_prod_lines_settings_background";
DROP TYPE "public"."enum_homepage_prod_lines_settings_spacing";
DROP TYPE "public"."enum_homepage_prod_cats_settings_hide_on";
DROP TYPE "public"."enum_homepage_prod_cats_cta_type";
DROP TYPE "public"."enum_homepage_prod_cats_settings_background";
DROP TYPE "public"."enum_homepage_prod_cats_settings_spacing";
DROP TYPE "public"."enum_homepage_prod_grid_settings_hide_on";
DROP TYPE "public"."enum_homepage_prod_grid_variant";
DROP TYPE "public"."enum_homepage_prod_grid_source";
DROP TYPE "public"."enum_homepage_prod_grid_cta_type";
DROP TYPE "public"."enum_homepage_prod_grid_settings_background";
DROP TYPE "public"."enum_homepage_prod_grid_settings_spacing";
DROP TYPE "public"."enum_homepage_quote_cta_links_link_type";
DROP TYPE "public"."enum_homepage_quote_cta_links_link_appearance";
DROP TYPE "public"."enum_homepage_quote_cta_settings_hide_on";
DROP TYPE "public"."enum_homepage_quote_cta_variant";
DROP TYPE "public"."enum_homepage_quote_cta_settings_background";
DROP TYPE "public"."enum_homepage_quote_cta_settings_spacing";
DROP TYPE "public"."enum_homepage_proj_grid_settings_hide_on";
DROP TYPE "public"."enum_homepage_proj_grid_source";
DROP TYPE "public"."enum_homepage_proj_grid_cta_type";
DROP TYPE "public"."enum_homepage_proj_grid_settings_background";
DROP TYPE "public"."enum_homepage_proj_grid_settings_spacing";
DROP TYPE "public"."enum_homepage_docs_settings_hide_on";
DROP TYPE "public"."enum_homepage_docs_cta_type";
DROP TYPE "public"."enum_homepage_docs_settings_background";
DROP TYPE "public"."enum_homepage_docs_settings_spacing";
DROP TYPE "public"."enum_homepage_quote_wiz_settings_hide_on";
DROP TYPE "public"."enum_homepage_quote_wiz_settings_background";
DROP TYPE "public"."enum_homepage_quote_wiz_settings_spacing";
DROP TYPE "public"."enum_homepage_rich_text_settings_hide_on";
DROP TYPE "public"."enum_homepage_rich_text_settings_background";
DROP TYPE "public"."enum_homepage_rich_text_settings_spacing";
DROP TYPE "public"."enum__homepage_text_img_v_links_link_type";
DROP TYPE "public"."enum__homepage_text_img_v_links_link_appearance";
DROP TYPE "public"."enum__homepage_text_img_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_text_img_v_variant";
DROP TYPE "public"."enum__homepage_text_img_v_image_position";
DROP TYPE "public"."enum__homepage_text_img_v_settings_background";
DROP TYPE "public"."enum__homepage_text_img_v_settings_spacing";
DROP TYPE "public"."enum__homepage_prod_lines_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_prod_lines_v_variant";
DROP TYPE "public"."enum__homepage_prod_lines_v_settings_background";
DROP TYPE "public"."enum__homepage_prod_lines_v_settings_spacing";
DROP TYPE "public"."enum__homepage_prod_cats_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_prod_cats_v_cta_type";
DROP TYPE "public"."enum__homepage_prod_cats_v_settings_background";
DROP TYPE "public"."enum__homepage_prod_cats_v_settings_spacing";
DROP TYPE "public"."enum__homepage_prod_grid_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_prod_grid_v_variant";
DROP TYPE "public"."enum__homepage_prod_grid_v_source";
DROP TYPE "public"."enum__homepage_prod_grid_v_cta_type";
DROP TYPE "public"."enum__homepage_prod_grid_v_settings_background";
DROP TYPE "public"."enum__homepage_prod_grid_v_settings_spacing";
DROP TYPE "public"."enum__homepage_quote_cta_v_links_link_type";
DROP TYPE "public"."enum__homepage_quote_cta_v_links_link_appearance";
DROP TYPE "public"."enum__homepage_quote_cta_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_quote_cta_v_variant";
DROP TYPE "public"."enum__homepage_quote_cta_v_settings_background";
DROP TYPE "public"."enum__homepage_quote_cta_v_settings_spacing";
DROP TYPE "public"."enum__homepage_proj_grid_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_proj_grid_v_source";
DROP TYPE "public"."enum__homepage_proj_grid_v_cta_type";
DROP TYPE "public"."enum__homepage_proj_grid_v_settings_background";
DROP TYPE "public"."enum__homepage_proj_grid_v_settings_spacing";
DROP TYPE "public"."enum__homepage_docs_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_docs_v_cta_type";
DROP TYPE "public"."enum__homepage_docs_v_settings_background";
DROP TYPE "public"."enum__homepage_docs_v_settings_spacing";
DROP TYPE "public"."enum__homepage_quote_wiz_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_quote_wiz_v_settings_background";
DROP TYPE "public"."enum__homepage_quote_wiz_v_settings_spacing";
DROP TYPE "public"."enum__homepage_rich_text_v_settings_hide_on";
DROP TYPE "public"."enum__homepage_rich_text_v_settings_background";
DROP TYPE "public"."enum__homepage_rich_text_v_settings_spacing";
DROP TYPE "public"."enum_archives_text_img_links_link_type";
DROP TYPE "public"."enum_archives_text_img_links_link_appearance";
DROP TYPE "public"."enum_archives_text_img_settings_hide_on";
DROP TYPE "public"."enum_archives_text_img_variant";
DROP TYPE "public"."enum_archives_text_img_image_position";
DROP TYPE "public"."enum_archives_text_img_settings_background";
DROP TYPE "public"."enum_archives_text_img_settings_spacing";
DROP TYPE "public"."enum_archives_prod_lines_settings_hide_on";
DROP TYPE "public"."enum_archives_prod_lines_variant";
DROP TYPE "public"."enum_archives_prod_lines_settings_background";
DROP TYPE "public"."enum_archives_prod_lines_settings_spacing";
DROP TYPE "public"."enum_archives_prod_cats_settings_hide_on";
DROP TYPE "public"."enum_archives_prod_cats_cta_type";
DROP TYPE "public"."enum_archives_prod_cats_settings_background";
DROP TYPE "public"."enum_archives_prod_cats_settings_spacing";
DROP TYPE "public"."enum_archives_prod_grid_settings_hide_on";
DROP TYPE "public"."enum_archives_prod_grid_variant";
DROP TYPE "public"."enum_archives_prod_grid_source";
DROP TYPE "public"."enum_archives_prod_grid_cta_type";
DROP TYPE "public"."enum_archives_prod_grid_settings_background";
DROP TYPE "public"."enum_archives_prod_grid_settings_spacing";
DROP TYPE "public"."enum_archives_quote_cta_links_link_type";
DROP TYPE "public"."enum_archives_quote_cta_links_link_appearance";
DROP TYPE "public"."enum_archives_quote_cta_settings_hide_on";
DROP TYPE "public"."enum_archives_quote_cta_variant";
DROP TYPE "public"."enum_archives_quote_cta_settings_background";
DROP TYPE "public"."enum_archives_quote_cta_settings_spacing";
DROP TYPE "public"."enum_archives_proj_grid_settings_hide_on";
DROP TYPE "public"."enum_archives_proj_grid_source";
DROP TYPE "public"."enum_archives_proj_grid_cta_type";
DROP TYPE "public"."enum_archives_proj_grid_settings_background";
DROP TYPE "public"."enum_archives_proj_grid_settings_spacing";
DROP TYPE "public"."enum_archives_docs_settings_hide_on";
DROP TYPE "public"."enum_archives_docs_cta_type";
DROP TYPE "public"."enum_archives_docs_settings_background";
DROP TYPE "public"."enum_archives_docs_settings_spacing";
DROP TYPE "public"."enum_archives_quote_wiz_settings_hide_on";
DROP TYPE "public"."enum_archives_quote_wiz_settings_background";
DROP TYPE "public"."enum_archives_quote_wiz_settings_spacing";
DROP TYPE "public"."enum_archives_rich_text_settings_hide_on";
DROP TYPE "public"."enum_archives_rich_text_settings_background";
DROP TYPE "public"."enum_archives_rich_text_settings_spacing";
`
