import * as migration_20260924_000539_initial from './20260924_000539_initial';
import * as migration_20260924_021647_vercel_blob from './20260924_021647_vercel_blob';
import * as migration_20260924_023829_remove_header_whatsapp from './20260924_023829_remove_header_whatsapp';
import * as migration_20260925_174803_audiences_projects from './20260925_174803_audiences_projects';
import * as migration_20260925_181019_separate_block_tables from './20260925_181019_separate_block_tables';

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
    name: '20260925_174803_audiences_projects'
  },
  {
    up: migration_20260925_181019_separate_block_tables.up,
    down: migration_20260925_181019_separate_block_tables.down,
    name: '20260925_181019_separate_block_tables',
  },
];
