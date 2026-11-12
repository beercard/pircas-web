/**
 * Regenera favicon, íconos, logo e imagen para redes a partir de los vectores de la
 * identidad (public/brand/identidad). Uso: node scripts/brand-assets.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const ORANGE = '#c46128'
const GRAY = '#57585a'
const dir = 'public/brand/identidad'
const svg = (name) => readFileSync(`${dir}/${name}.svg`)

/** Renderiza un SVG a un ancho/alto máximo, con fondo transparente. */
const render = (name, width, height) =>
  sharp(svg(name), { density: 1200 }).resize({ width, height, fit: 'inside' }).png().toBuffer()

/** Cuadrado de color con el isotipo blanco centrado (como en el manual de marca). */
async function tile(size, radius = 0) {
  const mark = await render('isotipo-blanco', Math.round(size * 0.5), Math.round(size * 0.62))
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${ORANGE}"/></svg>`,
  )
  return sharp(bg)
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toBuffer()
}

writeFileSync('src/app/icon.png', await tile(64, 12))
writeFileSync('src/app/apple-icon.png', await tile(180))
writeFileSync('public/brand/favicon.png', await tile(512, 96))

// Logo horizontal sobre blanco (datos estructurados de Google: necesita fondo opaco).
const logo = await render('logo-horizontal', 1000, 300)
const canvas = (w, h, color) =>
  sharp({ create: { width: w, height: h, channels: 4, background: color } })
await canvas(1200, 480, '#ffffff')
  .composite([{ input: logo, gravity: 'centre' }])
  .png()
  .toFile('public/brand/logo-pircas.png')
await sharp('public/brand/logo-pircas.png')
  .webp({ quality: 90 })
  .toFile('public/brand/logo-pircas.webp')

// Imagen por defecto para redes (1200 × 630): gris de marca, logo blanco y franja naranja.
const white = await render('logo-horizontal-blanco', 640, 260)
const bar = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="30"><rect width="1200" height="30" fill="${ORANGE}"/></svg>`,
)
await canvas(1200, 630, GRAY)
  .composite([
    { input: white, gravity: 'centre' },
    { input: bar, gravity: 'south' },
  ])
  .jpeg({ quality: 90 })
  .toFile('public/brand/og-default.jpg')

// Isotipo cuadrado en SVG.
const iso = svg('isotipo-blanco').toString()
const inner = iso.slice(iso.indexOf('>') + 1, iso.lastIndexOf('</svg>'))
writeFileSync(
  'public/brand/mark.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${ORANGE}"/><g transform="translate(19.5 13.5) scale(0.42) translate(-110 -266)">${inner}</g></svg>\n`,
)
console.log('Listo: íconos, logo e imagen para redes regenerados.')
