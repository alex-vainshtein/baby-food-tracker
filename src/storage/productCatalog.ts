import type { CustomProduct, Kit, Product } from '../types'

const CUSTOM_ID_PREFIX = 'custom-'

export function createCustomProductId(): string {
  return `${CUSTOM_ID_PREFIX}${crypto.randomUUID()}`
}

export function isCustomProductId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX)
}

export function customProductToCatalogItem(custom: CustomProduct): Product {
  return {
    id: custom.id,
    category: custom.category,
    inMenu: false,
    isAllergen: custom.isAllergen,
  }
}

export function getExcludedProductIds(kit: Kit | null): Set<string> {
  return new Set(kit?.excludedProductIds ?? [])
}

export function isProductExcluded(kit: Kit | null, productId: string): boolean {
  return getExcludedProductIds(kit).has(productId)
}

/** Full list for the table: catalog + custom (excluded items stay in the list). */
export function buildKitProducts(catalog: Product[], kit: Kit | null): Product[] {
  const custom = (kit?.customProducts ?? []).map(customProductToCatalogItem)
  return [...catalog, ...custom]
}

/** Products that count toward progress and daily recommendations. */
export function buildTrackedProducts(catalog: Product[], kit: Kit | null): Product[] {
  const excluded = getExcludedProductIds(kit)
  const active = catalog.filter((p) => !excluded.has(p.id))
  const custom = (kit?.customProducts ?? []).map(customProductToCatalogItem)
  return [...active, ...custom]
}

export function resolveProductName(
  id: string,
  kit: Kit | null,
  catalogName: (id: string) => string,
): string {
  const custom = kit?.customProducts?.find((p) => p.id === id)
  if (custom) return custom.name
  return catalogName(id)
}
