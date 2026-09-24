import * as migration_20260924_000539_initial from './20260924_000539_initial';
import * as migration_20260924_021647_vercel_blob from './20260924_021647_vercel_blob';

export const migrations = [
  {
    up: migration_20260924_000539_initial.up,
    down: migration_20260924_000539_initial.down,
    name: '20260924_000539_initial',
  },
  {
    up: migration_20260924_021647_vercel_blob.up,
    down: migration_20260924_021647_vercel_blob.down,
    name: '20260924_021647_vercel_blob'
  },
];
