import feedingData from '../../data/knowledge-base.json'
import productNamesData from '../../data/product-names.json'
import { calcAgeInMonths } from './kitAge'

export const PLAN_LENGTH_DAYS = 30

const dailyPlan = feedingData.dailyPlan
const productNames = productNamesData as Record<string, Record<string, string>>

const MENU_NAME_TO_ID: Record<string, string> = {}
for (const [id, names] of Object.entries(productNames)) {
  if (names.uk) {
    MENU_NAME_TO_ID[names.uk.trim().toLowerCase()] = id
  }
}

export interface MenuDayEntry {
  day: number
  components: string[]
  allergenIntro: string | null
}

export interface ResolvedMenuFood {
  id: string
  menuLabel: string
}

export function getMenuDayFromDob(dateOfBirth: string, today = new Date()): number {
  if (!dateOfBirth) return 1
  const months = calcAgeInMonths(dateOfBirth, today)
  if (months === null || months < 6) return 1

  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const startAt6 = new Date(year, month - 1 + 6, day)
  startAt6.setHours(0, 0, 0, 0)
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((todayStart.getTime() - startAt6.getTime()) / 86_400_000) + 1
  return Math.min(PLAN_LENGTH_DAYS, Math.max(1, diffDays))
}

export function getEffectiveMenuDay(
  dateOfBirth: string,
  override: number | null | undefined,
  today = new Date(),
): number {
  if (override != null) return Math.min(PLAN_LENGTH_DAYS, Math.max(1, override))
  return getMenuDayFromDob(dateOfBirth, today)
}

export function getMenuDayEntry(day: number): MenuDayEntry | null {
  const entry = dailyPlan.find((m) => m.day === day)
  if (!entry) return null
  return {
    day: entry.day,
    components: entry.components,
    allergenIntro: entry.allergenIntro,
  }
}

export function resolveMenuComponents(components: string[]): ResolvedMenuFood[] {
  const resolved: ResolvedMenuFood[] = []
  for (const label of components) {
    const id = MENU_NAME_TO_ID[label.trim().toLowerCase()]
    if (id) resolved.push({ id, menuLabel: label })
  }
  return resolved
}

export function resolveMenuLabelToId(label: string): string | null {
  return MENU_NAME_TO_ID[label.trim().toLowerCase()] ?? null
}
