import path from 'node:path'
import { readFile } from 'node:fs/promises'

import type { Payload } from 'payload'
import sharp from 'sharp'

import { ISO_BODY, ISO_LEAF, WORD_NAME, WORD_TAGLINE } from '@/components/ui/brand-paths'

/**
 * Marca de agua de las fotos de productos: el logo de Pircas abajo a la derecha.
 * Se aplica una sola vez por foto (campo `watermarked` de Fotos y archivos):
 *   - al publicar un producto, a sus fotos (principal, galería y aplicación);
 *   - en la carga masiva (scripts/import-catalog.ts).
 * El resto de las fotos del sitio (portadas, trabajos, páginas) no lleva marca.
 */

/** Logo horizontal de la identidad: isotipo + logotipo (unidades del manual de marca). */
const LOGO = { width: 273.84, height: 89.36, wordX: 92.73, wordY: 16.51 }

function logoSvg(tone: 'light' | 'dark', width: number): Buffer {
  const c =
    tone === 'light'
      ? { body: '#fff', bodyOpacity: 0.62, leaf: '#fff', name: '#fff', tagline: '#fff', all: 0.72 }
      : { body: '#c46128', bodyOpacity: 1, leaf: '#6c6e70', name: '#6c6e70', tagline: '#221f1f', all: 0.6 }
  const height = Math.round((width * LOGO.height) / LOGO.width)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${LOGO.width} ${LOGO.height}"><g opacity="${c.all}"><path d="${ISO_BODY}" fill="${c.body}" fill-opacity="${c.bodyOpacity}"/><path d="${ISO_LEAF}" fill="${c.leaf}"/><g transform="translate(${LOGO.wordX} ${LOGO.wordY})"><path d="${WORD_NAME}" fill="${c.name}"/><path d="${WORD_TAGLINE}" fill="${c.tagline}"/></g></g></svg>`,
  )
}

/**
 * Devuelve la imagen con el logo abajo a la derecha (mismo formato que la original).
 * Elige el logo blanco o el de color según qué tan clara es esa zona de la foto.
 */
export async function applyWatermark(input: Buffer): Promise<Buffer> {
  // Respeta la orientación EXIF antes de medir.
  const base = await sharp(input).rotate().toBuffer()
  const meta = await sharp(base).metadata()
  const W = meta.width ?? 0
  const H = meta.height ?? 0
  if (W < 160 || H < 120) return input

  const width = Math.round(Math.max(96, Math.min(W * 0.24, 520)))
  const height = Math.round((width * LOGO.height) / LOGO.width)
  const margin = Math.round(Math.min(W, H) * 0.035)
  const left = Math.max(0, W - width - margin)
  const top = Math.max(0, H - height - margin)

  // Zona donde va el logo: si es mayormente oscura, logo blanco; si no, el de color.
  const zone = await sharp(base)
    .extract({ left, top, width: Math.min(width, W - left), height: Math.min(height, H - top) })
    .greyscale()
    .raw()
    .toBuffer()
  let dark = 0
  for (const v of zone) if (v < 115) dark++
  const tone = dark / zone.length > 0.45 ? 'light' : 'dark'

  return sharp(base)
    .composite([{ input: logoSvg(tone, width), left, top }])
    .toBuffer()
}

type MediaDoc = {
  id: number
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  watermarked?: boolean | null
}

const RASTER = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

async function originalBytes(media: MediaDoc): Promise<Buffer | null> {
  if (media.url && /^https?:\/\//.test(media.url)) {
    const res = await fetch(media.url)
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null
  }
  if (!media.filename) return null
  const dir = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'public/media')
  return readFile(path.join(dir, media.filename)).catch(() => null)
}

/**
 * Pone la marca de agua a las fotos indicadas que todavía no la tienen (reemplaza el
 * archivo y regenera sus tamaños). Nunca interrumpe el guardado: los errores se registran.
 */
export async function watermarkMedia(payload: Payload, ids: number[]): Promise<number> {
  let done = 0
  for (const id of [...new Set(ids)]) {
    try {
      const media = (await payload.findByID({
        collection: 'media',
        id,
        depth: 0,
        overrideAccess: true,
      })) as MediaDoc
      if (media.watermarked || !media.mimeType || !RASTER.includes(media.mimeType)) continue
      const original = await originalBytes(media)
      if (!original) continue
      const data = await applyWatermark(original)
      await payload.update({
        collection: 'media',
        id,
        data: { watermarked: true },
        file: {
          data,
          mimetype: media.mimeType,
          name: media.filename ?? `foto-${id}`,
          size: data.length,
        },
        overrideAccess: true,
        overwriteExistingFiles: true,
        context: { disableRevalidate: true },
      })
      done++
    } catch (err) {
      payload.logger.error({ err, media: id }, 'watermark failed')
    }
  }
  return done
}
