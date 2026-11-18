/** Textos de los botones de la tienda (se editan en Configuración → Presupuesto online). */
export type ShopLabels = { card: string; choose: string; add: string; now: string }

export const DEFAULT_SHOP_LABELS: ShopLabels = {
  card: 'Pedir presupuesto',
  choose: 'Elegir medida',
  add: 'Agregar al presupuesto',
  now: 'Pedir presupuesto ahora',
}

type Raw = Partial<Record<keyof ShopLabels, string | null>> | null | undefined

/** Los del panel, o los originales donde estén vacíos. */
export function resolveShopLabels(raw: Raw): ShopLabels {
  const pick = (k: keyof ShopLabels) => raw?.[k]?.trim() || DEFAULT_SHOP_LABELS[k]
  return { card: pick('card'), choose: pick('choose'), add: pick('add'), now: pick('now') }
}
