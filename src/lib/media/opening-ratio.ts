import sharp from 'sharp'

/**
 * Proporción (ancho / alto) de la abertura que muestra una foto de estudio.
 *
 * Busca los bordes marcados de la foto (el marco de la abertura contra el fondo liso) y mide
 * el rectángulo que los contiene. Sirve para elegir, entre las fotos de un producto, la que
 * más se parece a la medida que eligió el cliente. Devuelve null si no encuentra la abertura.
 */
export async function openingRatio(input: Buffer): Promise<number | null> {
  const { data, info } = await sharp(input)
    .rotate()
    .greyscale()
    .resize(320, 320, { fit: 'inside' })
    .blur(0.8)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const cols = new Uint16Array(w)
  const rows = new Uint16Array(h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx = Math.abs(data[i + 1] - data[i - 1])
      const gy = Math.abs(data[i + w] - data[i - w])
      if (gx + gy > 38) {
        cols[x]++
        rows[y]++
      }
    }
  }
  // Una columna o fila cuenta si tiene bordes en al menos el 4 % de su largo.
  const span = (counts: Uint16Array, min: number): [number, number] | null => {
    let a = -1
    let b = -1
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] >= min) {
        if (a < 0) a = i
        b = i
      }
    }
    return a < 0 ? null : [a, b]
  }
  const xs = span(cols, Math.max(3, h * 0.04))
  const ys = span(rows, Math.max(3, w * 0.04))
  if (!xs || !ys) return null
  const bw = xs[1] - xs[0] + 1
  const bh = ys[1] - ys[0] + 1
  if (bw < w * 0.15 || bh < h * 0.15) return null
  return Math.round((bw / bh) * 100) / 100
}
