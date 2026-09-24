import { postgresAdapter } from '@payloadcms/db-postgres'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { ProductCategories } from './collections/ProductCategories'
import { ProductLines } from './collections/ProductLines'
import { Products } from './collections/Products'
import { ProjectCategories } from './collections/ProjectCategories'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { defaultEditor } from './fields/richText'
import { Advisor } from './globals/Advisor'
import { Analytics } from './globals/Analytics'
import { ArchivePages } from './globals/ArchivePages'
import { Footer } from './globals/Footer'
import { FormsSettings } from './globals/FormsSettings'
import { Header } from './globals/Header'
import { Homepage } from './globals/Homepage'
import { SeoDefaults } from './globals/SeoDefaults'
import { SiteSettings } from './globals/SiteSettings'
import { buildEmailAdapter } from './lib/email/transport'
import { getSiteUrl } from './lib/routes'
import { migrations } from './migrations'
import { plugins } from './plugins'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// En producción (salvo durante `next build`, que no necesita secretos) el secreto es obligatorio.
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build' &&
  !process.env.PAYLOAD_SECRET
) {
  throw new Error('PAYLOAD_SECRET es obligatorio en producción.')
}

const siteUrl = getSiteUrl()
// En Vercel cada deploy además responde en su propia URL (*.vercel.app): el panel debe funcionar ahí también.
const allowedOrigins = [
  siteUrl,
  ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`),
]

export default buildConfig({
  serverURL: siteUrl,
  secret: process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — PIRCAS Admin',
      icons: [{ rel: 'icon', url: '/brand/favicon.png' }],
      robots: 'noindex, nofollow',
    },
    components: {
      graphics: {
        Logo: '@/components/admin/AdminLogo#AdminLogo',
        Icon: '@/components/admin/AdminIcon#AdminIcon',
      },
      beforeDashboard: ['@/components/admin/Dashboard#Dashboard'],
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 834, height: 1112 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    dateFormat: 'dd/MM/yyyy HH:mm',
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  // Idioma: el sitio es solo en español. Los campos de texto ya están marcados como
  // `localized`, así que agregar idiomas es habilitar `localization` (ver docs/cms.md).
  collections: [
    Products,
    ProductLines,
    ProductCategories,
    Projects,
    ProjectCategories,
    Pages,
    Media,
    Leads,
    Users,
  ],
  globals: [
    Homepage,
    ArchivePages,
    SiteSettings,
    Header,
    Footer,
    Advisor,
    FormsSettings,
    Analytics,
    SeoDefaults,
  ],
  editor: defaultEditor,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // En Vercel hay muchas instancias chicas: pocas conexiones por instancia (Neon usa pooler).
      ...(process.env.VERCEL ? { max: 5, idleTimeoutMillis: 10_000 } : {}),
    },
    // El esquema se cambia SIEMPRE con migraciones versionadas (src/migrations).
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    // En producción las migraciones pendientes se aplican solas al iniciar (imagen Docker sin CLI).
    prodMigrations: migrations,
  }),
  email: buildEmailAdapter(),
  sharp,
  plugins,
  graphQL: { disable: true },
  cors: allowedOrigins,
  csrf: allowedOrigins,
  upload: {
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB por archivo
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  logger: {
    options: { level: process.env.LOG_LEVEL || 'info' },
  },
  telemetry: false,
})
