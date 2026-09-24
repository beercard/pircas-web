import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

/**
 * Tests end-to-end en tres tamaños (desktop 1440, tablet 834, mobile 390).
 * Requieren la base con el contenido inicial (`pnpm seed`).
 * Usa el servidor que ya esté corriendo en BASE_URL o levanta `pnpm dev`.
 */
const baseURL = process.env.BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: { baseURL, trace: 'on-first-retry', locale: 'es-AR' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1112 }, hasTouch: true },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
