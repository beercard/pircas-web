'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { DEFAULT_SHOP_LABELS, type ShopLabels } from '@/lib/shop/labels'

const Ctx = createContext<ShopLabels>(DEFAULT_SHOP_LABELS)

export function ShopLabelsProvider({
  labels,
  children,
}: {
  labels: ShopLabels
  children: ReactNode
}) {
  return <Ctx.Provider value={labels}>{children}</Ctx.Provider>
}

export const useShopLabels = () => useContext(Ctx)

/** Un texto de botón, para usar dentro de componentes de servidor. */
export function ShopLabel({ name }: { name: keyof ShopLabels }) {
  return <>{useShopLabels()[name]}</>
}
