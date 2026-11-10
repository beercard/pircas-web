import * as migration_20260924_000539_initial from './20260924_000539_initial';
import * as migration_20260924_021647_vercel_blob from './20260924_021647_vercel_blob';
import * as migration_20260924_023829_remove_header_whatsapp from './20260924_023829_remove_header_whatsapp';
import * as migration_20260925_174803_audiences_projects from './20260925_174803_audiences_projects';
import * as migration_20260925_181019_separate_block_tables from './20260925_181019_separate_block_tables';
import * as migration_20260925_194517_admin_galleries_security from './20260925_194517_admin_galleries_security';
import * as migration_20261109_232113_shop from './20261109_232113_shop';
import * as migration_20261110_222803_presupuesto_quitar from './20261110_222803_presupuesto_quitar';
import * as migration_20261110_222904_presupuesto_agregar from './20261110_222904_presupuesto_agregar';

export const migrations = [
  {
    up: migration_20260924_000539_initial.up,
    down: migration_20260924_000539_initial.down,
    name: '20260924_000539_initial',
  },
  {
    up: migration_20260924_021647_vercel_blob.up,
    down: migration_20260924_021647_vercel_blob.down,
    name: '20260924_021647_vercel_blob',
  },
  {
    up: migration_20260924_023829_remove_header_whatsapp.up,
    down: migration_20260924_023829_remove_header_whatsapp.down,
    name: '20260924_023829_remove_header_whatsapp',
  },
  {
    up: migration_20260925_174803_audiences_projects.up,
    down: migration_20260925_174803_audiences_projects.down,
    name: '20260925_174803_audiences_projects',
  },
  {
    up: migration_20260925_181019_separate_block_tables.up,
    down: migration_20260925_181019_separate_block_tables.down,
    name: '20260925_181019_separate_block_tables',
  },
  {
    up: migration_20260925_194517_admin_galleries_security.up,
    down: migration_20260925_194517_admin_galleries_security.down,
    name: '20260925_194517_admin_galleries_security',
  },
  {
    up: migration_20261109_232113_shop.up,
    down: migration_20261109_232113_shop.down,
    name: '20261109_232113_shop',
  },
  {
    up: migration_20261110_222803_presupuesto_quitar.up,
    down: migration_20261110_222803_presupuesto_quitar.down,
    name: '20261110_222803_presupuesto_quitar',
  },
  {
    up: migration_20261110_222904_presupuesto_agregar.up,
    down: migration_20261110_222904_presupuesto_agregar.down,
    name: '20261110_222904_presupuesto_agregar'
  },
];
