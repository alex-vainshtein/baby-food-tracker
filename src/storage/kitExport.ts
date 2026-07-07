import type { Kit, KitMeta, TrackerState } from '../types'
import { mergeTrackerState } from './mergeState'

export interface KitExportPayload {
  version: 1
  exportedAt: string
  meta: KitMeta
  state: TrackerState
}

export function buildKitExport(kit: Kit): KitExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    meta: {
      name: kit.name,
      dateOfBirth: kit.dateOfBirth,
      excludedProductIds: kit.excludedProductIds ?? [],
      customProducts: kit.customProducts ?? [],
      menuDayOverride: kit.menuDayOverride ?? null,
    },
    state: kit.state,
  }
}

export function kitExportToJson(kit: Kit): string {
  return JSON.stringify(buildKitExport(kit), null, 2)
}

export function kitExportToCsv(
  kit: Kit,
  productName: (id: string) => string,
): string {
  const rows = [['product_id', 'name', 'count', 'last_given', 'notes']]
  const ids = new Set([
    ...Object.keys(kit.state),
    ...(kit.customProducts ?? []).map((p) => p.id),
  ])

  for (const id of [...ids].sort()) {
    const tracking = kit.state[id] ?? { count: 0, lastGivenAt: null }
    const name = productName(id)
    const notes = (tracking.notes ?? '').replace(/"/g, '""')
    rows.push([
      id,
      `"${name.replace(/"/g, '""')}"`,
      String(tracking.count),
      tracking.lastGivenAt ?? '',
      notes ? `"${notes}"` : '',
    ])
  }

  return rows.map((row) => row.join(',')).join('\n')
}

export function parseKitImport(raw: string): { meta?: KitMeta; state?: TrackerState } | null {
  try {
    const parsed = JSON.parse(raw) as KitExportPayload
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.version !== 1) return null
    if (parsed.meta && typeof parsed.meta !== 'object') return null
    if (parsed.state && typeof parsed.state !== 'object') return null
    return { meta: parsed.meta, state: parsed.state ?? {} }
  } catch {
    return null
  }
}

export function mergeImportedKit(kit: Kit, data: { meta?: KitMeta; state?: TrackerState }): Kit {
  return {
    ...kit,
    name: data.meta?.name || kit.name,
    dateOfBirth: data.meta?.dateOfBirth ?? kit.dateOfBirth,
    excludedProductIds: data.meta?.excludedProductIds ?? kit.excludedProductIds,
    customProducts: data.meta?.customProducts ?? kit.customProducts,
    menuDayOverride: data.meta?.menuDayOverride ?? kit.menuDayOverride,
    state: data.state ? mergeTrackerState(kit.state, data.state) : kit.state,
  }
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
