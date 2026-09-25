/**
 * Texto alternativo a partir del nombre del archivo, para cuando se sube una foto sin
 * completarlo: "ventana-corrediza_2.jpg" → "Ventana corrediza". Nombres genéricos de
 * cámaras o celulares ("IMG_2034.jpg") caen en un texto neutro.
 */
export function altFromFilename(filename: string | null | undefined): string {
  const words = (filename ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b(img|dsc|pxl|foto|photo|image|imagen|screenshot|whatsapp)\b/gi, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (words.replace(/[^\p{L}]/gu, '').length < 3) return 'Foto de Pircas Aberturas'
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()
}
