import { expect, test, type Page } from '@playwright/test'

const PAGES = [
  { path: '/', h1: /Aberturas de aluminio/ },
  { path: '/productos', h1: /Todo lo que fabricamos/ },
  { path: '/productos/ventana-corrediza', h1: /Ventana corrediza/ },
  { path: '/lineas', h1: /Nuestras líneas/ },
  { path: '/lineas/herrero-economica', h1: /Herrero Económica/ },
  { path: '/lineas/herrero-reforzada', h1: /Herrero Reforzada/ },
  { path: '/lineas/modena', h1: /Modena/ },
  { path: '/mamparas', h1: /Mamparas de baño a medida/ },
  { path: '/proyectos', h1: /Trabajos hechos/ },
  { path: '/proyectos/casa-cr-ventanal-dvh', h1: /Casa CR/ },
  { path: '/nosotros', h1: /Hacemos aberturas/ },
  { path: '/contacto', h1: /Escribinos/ },
  { path: '/cotizador', h1: /Cotizá tu proyecto/ },
]

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow, 'no debe haber scroll horizontal').toBeLessThanOrEqual(1)
}

test.describe('páginas', () => {
  for (const { path, h1 } of PAGES) {
    test(`${path} renderiza, tiene un solo H1, metadatos y no desborda`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveText(h1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/)
      await noHorizontalOverflow(page)
      expect(errors).toEqual([])
    })
  }

  test('404 personalizado', async ({ page }) => {
    const res = await page.goto('/esta-pagina-no-existe')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('no existe')
  })

  test('las imágenes tienen texto alternativo', async ({ page }) => {
    await page.goto('/')
    const missingAlt = await page.locator('main img:not([alt])').count()
    expect(missingAlt).toBe(0)
  })
})

test.describe('navegación', () => {
  test('desktop: menú principal y mega menú de Productos', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'solo desktop')
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Principal' })
    await expect(nav).toBeVisible()
    await page.getByRole('button', { name: 'Submenú de Productos' }).click()
    await expect(page.getByRole('link', { name: 'Herrero Reforzada' }).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await nav.getByRole('link', { name: 'Proyectos' }).click()
    await expect(page).toHaveURL(/\/proyectos$/)
  })

  test('mobile/tablet: menú hamburguesa accesible', async ({ page }, info) => {
    test.skip(info.project.name === 'desktop', 'solo mobile/tablet')
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Principal', exact: true })).toBeHidden()
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Contacto' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.getByRole('dialog').getByRole('link', { name: 'Nosotros' }).click()
    await expect(page).toHaveURL(/\/nosotros$/)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('mobile: barra fija de WhatsApp + Presupuesto', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'solo mobile')
    await page.goto('/')
    const bar = page.locator('[data-mobile-cta-bar]')
    await expect(bar).toBeVisible()
    await expect(bar.getByRole('link', { name: 'Presupuesto' })).toHaveAttribute(
      'href',
      '/cotizador',
    )
    await expect(bar.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /wa\.me\//)
  })
})

test.describe('conversión', () => {
  test('cotizador: 5 pasos con precio estimado', async ({ page }, info) => {
    test.skip(info.project.name === 'tablet', 'flujo cubierto en desktop y mobile')
    await page.goto('/cotizador')
    await page.getByRole('button', { name: /Aberturas para mi casa/ }).click()
    await page.getByRole('button', { name: 'Ventana corrediza', exact: true }).click()
    await page.getByRole('button', { name: 'Herrero Reforzada' }).click()
    await page.getByRole('button', { name: 'Float' }).click()
    await page.getByRole('button', { name: /Continuar/ }).click()
    await expect(page.getByText('$ 429.000').first()).toBeVisible() // 260.000 × 1,65 m²
    await page.getByRole('button', { name: /Agregar al presupuesto/ }).click()
    await expect(page.getByRole('complementary', { name: 'Tu presupuesto' })).toContainText(
      'Ventana corrediza',
    )
    await page.getByRole('button', { name: /Continuar/ }).click()
    await expect(page.getByRole('heading', { name: 'Tu proyecto y tus datos' })).toBeVisible()
    // Sin datos de contacto no envía.
    await page.getByRole('button', { name: /Enviar consulta/ }).click()
    await expect(page.getByText('Ingresá tu nombre.')).toBeVisible()
  })

  test('contacto: valida campos obligatorios', async ({ page }, info) => {
    test.skip(info.project.name === 'tablet', 'cubierto en desktop y mobile')
    await page.goto('/contacto')
    await page.getByRole('button', { name: /Enviar consulta/ }).click()
    await expect(page.getByText('Ingresá tu nombre.')).toBeVisible()
    await expect(page.getByLabel('Nombre')).toHaveAttribute('aria-invalid', 'true')
  })

  test('los CTA de WhatsApp apuntan al número configurado', async ({ page }) => {
    await page.goto('/productos/ventana-corrediza')
    const cta = page.getByRole('link', { name: /Consultar este producto/ })
    await expect(cta).toHaveAttribute('href', /wa\.me\/5493425903814\?text=.*ventana%20corrediza/)
  })
})

test.describe('SEO técnico', () => {
  test('sitemap y robots', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBe(true)
    const xml = await sitemap.text()
    expect(xml).toContain('/lineas/modena')
    expect(xml).toContain('/productos/ventana-corrediza')
    expect(xml).not.toContain('/admin')
    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBe(true)
  })

  test('datos estructurados', async ({ page }) => {
    await page.goto('/productos/ventana-corrediza')
    const types = await page.$$eval('script[type="application/ld+json"]', (els) =>
      els.flatMap((e) => {
        const data = JSON.parse(e.textContent || '{}')
        return (Array.isArray(data) ? data : [data]).map((d: { '@type'?: string }) => d['@type'])
      }),
    )
    expect(types).toEqual(
      expect.arrayContaining([
        'Product',
        'BreadcrumbList',
        'HomeAndConstructionBusiness',
        'WebSite',
      ]),
    )
  })
})
