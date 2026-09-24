import type { Payload } from 'payload'
import sharp from 'sharp'

/** Utilidades del seed: texto enriquecido, imágenes de reemplazo y enlaces. */

type LexicalText = {
  type: 'text'
  text: string
  format: number
  version: 1
  detail: 0
  mode: 'normal'
  style: ''
}

const textNode = (text: string): LexicalText => ({
  type: 'text',
  text,
  format: 0,
  version: 1,
  detail: 0,
  mode: 'normal',
  style: '',
})

/** Crea un estado de Lexical con un párrafo por string. */
export function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [textNode(p)],
      })),
    },
  }
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Parte un texto en renglones de ~maxChars para el SVG. */
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      lines.push(line.trim())
      line = w
    } else line += ' ' + w
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

/**
 * Imagen de reemplazo (JPEG) con la descripción de la foto que va en ese lugar, en los
 * tonos de la marca. Deja claro al editor qué foto real subir.
 */
export async function placeholderImage(
  description: string,
  tone: 'dark' | 'light' = 'dark',
  width = 1600,
  height = 1200,
): Promise<Buffer> {
  const bg1 = tone === 'dark' ? '#2E2F34' : '#E4E1DC'
  const bg2 = tone === 'dark' ? '#1C1D20' : '#D6D2CB'
  const fg = tone === 'dark' ? '#FAF9F7' : '#26272B'
  const lines = wrap(description.replace(/^Foto:\s*/i, ''), 42)
  const fontSize = Math.round(width / 58)
  const x = width - width * 0.04
  const text = lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${height * 0.06 + fontSize * 2.4 + i * fontSize * 1.35}" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${fontSize}" fill="${fg}" fill-opacity="0.55">${escapeXml(l)}</text>`,
    )
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g stroke="${fg}" stroke-opacity="0.10" fill="none" stroke-width="2">
    <rect x="${width * 0.52}" y="${height * 0.22}" width="${width * 0.34}" height="${height * 0.64}"/>
    <line x1="${width * 0.69}" y1="${height * 0.22}" x2="${width * 0.69}" y2="${height * 0.86}"/>
    <line x1="${width * 0.52}" y1="${height * 0.54}" x2="${width * 0.86}" y2="${height * 0.54}"/>
  </g>
  <text x="${x}" y="${height * 0.06 + fontSize}" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${fontSize * 0.75}" letter-spacing="4" fill="#B8502C" fill-opacity="0.9">IMAGEN DE REEMPLAZO</text>
  ${text}
</svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 78 }).toBuffer()
}

const mediaCache = new Map<string, number>()

/** Sube (una sola vez por descripción) una imagen de reemplazo y devuelve su id. */
export async function seedMedia(
  payload: Payload,
  description: string,
  tone: 'dark' | 'light' = 'dark',
): Promise<number> {
  const cached = mediaCache.get(description)
  if (cached) return cached
  const data = await placeholderImage(description, tone)
  const name = `${description
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)}.jpg`
  const doc = await payload.create({
    collection: 'media',
    data: { alt: description.replace(/^Foto:\s*/i, '') },
    file: { data, mimetype: 'image/jpeg', name, size: data.length },
    context: { disableRevalidate: true },
  })
  mediaCache.set(description, doc.id)
  return doc.id
}

type Ref = { relationTo: 'pages' | 'products' | 'product-lines' | 'projects'; value: number }

export const urlLink = (
  label: string,
  url: string,
  appearance: 'primary' | 'secondary' | 'outline' | 'link' = 'primary',
) => ({
  type: 'custom' as const,
  label,
  url,
  appearance,
})

export const refLink = (
  label: string,
  reference: Ref,
  appearance: 'primary' | 'secondary' | 'outline' | 'link' = 'primary',
) => ({
  type: 'reference' as const,
  label,
  reference,
  appearance,
})

export const waLink = (
  label: string,
  whatsappMessage?: string,
  appearance: 'primary' | 'secondary' | 'outline' | 'link' = 'outline',
) => ({
  type: 'whatsapp' as const,
  label,
  whatsappMessage,
  appearance,
})

export const texts = (items: string[]) => items.map((text) => ({ text }))
export const facts = (items: [string, string][]) =>
  items.map(([value, label]) => ({ value, label }))
export const specs = (items: [string, string, string?][]) =>
  items.map(([label, value, group]) => ({ label, value, group }))
