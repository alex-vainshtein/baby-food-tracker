export type FoodCategory =
  | 'meat'
  | 'fish'
  | 'vegetable'
  | 'fruit'
  | 'grain'
  | 'legume'
  | 'dairy'
  | 'fat'
  | 'allergen'

export interface CustomProduct {
  id: string
  name: string
  category: FoodCategory
  isAllergen: boolean
}

export interface Product {
  id: string
  category: FoodCategory
  inMenu: boolean
  menuDays?: number[]
  isAllergen: boolean
  allergenGroup?: string
}

export interface ProductTracking {
  count: number
  lastGivenAt: string | null
  notes?: string
}

export type TrackerState = Record<string, ProductTracking>

export type SortField = 'name' | 'count' | 'lastGiven'
export type SortDirection = 'asc' | 'desc'

export interface Kit {
  id: string
  name: string
  dateOfBirth: string
  syncId: string
  state: TrackerState
  menuDayOverride?: number | null
  excludedProductIds?: string[]
  customProducts?: CustomProduct[]
}

export interface KitsData {
  kits: Kit[]
  activeKitId: string | null
}

export interface KitMeta {
  name: string
  dateOfBirth: string
  excludedProductIds?: string[]
  customProducts?: CustomProduct[]
  menuDayOverride?: number | null
}

export const KITS_STORAGE_KEY = 'baby-food-tracker-kits'
export const STORAGE_KEY = 'baby-food-tracker'
export const SYNC_ID_STORAGE_KEY = 'baby-food-tracker-sync-id'
export const SYNC_PANEL_COLLAPSED_KEY = 'baby-food-tracker-sync-collapsed'
export const GOAL_COUNT = 100
