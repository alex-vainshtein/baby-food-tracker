import type { Kit, KitsData, TrackerState } from '../types'
import {
  KITS_STORAGE_KEY,
  STORAGE_KEY,
  SYNC_ID_STORAGE_KEY,
} from '../types'
import { generateSyncId, isValidSyncId, normalizeSyncId } from './syncApi'

function createKitId(): string {
  return crypto.randomUUID()
}

function emptyKit(name: string, syncId?: string): Kit {
  return {
    id: createKitId(),
    name,
    dateOfBirth: '',
    syncId: syncId ?? generateSyncId(),
    state: {},
  }
}

function migrateLegacy(defaultName: string): KitsData | null {
  let legacyState: TrackerState = {}
  let legacySync: string | null = null

  try {
    const rawState = localStorage.getItem(STORAGE_KEY)
    if (rawState) legacyState = JSON.parse(rawState) as TrackerState
  } catch {
    // ignore
  }

  const rawSync = localStorage.getItem(SYNC_ID_STORAGE_KEY)
  if (rawSync) {
    const normalized = normalizeSyncId(rawSync)
    legacySync = isValidSyncId(normalized) ? normalized : null
  }

  if (Object.keys(legacyState).length === 0 && !legacySync) return null

  const kit = emptyKit(defaultName, legacySync ?? undefined)
  kit.state = legacyState

  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SYNC_ID_STORAGE_KEY)

  return { kits: [kit], activeKitId: kit.id }
}

export function loadKits(defaultName: string): KitsData {
  try {
    const raw = localStorage.getItem(KITS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as KitsData
      if (parsed.kits?.length) {
        return {
          kits: parsed.kits,
          activeKitId: parsed.activeKitId ?? parsed.kits[0].id,
        }
      }
    }
  } catch {
    // fall through to migration / default
  }

  const migrated = migrateLegacy(defaultName)
  if (migrated) {
    saveKits(migrated)
    return migrated
  }

  const kit = emptyKit(defaultName)
  const data: KitsData = { kits: [kit], activeKitId: kit.id }
  saveKits(data)
  return data
}

export function saveKits(data: KitsData) {
  localStorage.setItem(KITS_STORAGE_KEY, JSON.stringify(data))
}

export function createKit(name: string, dateOfBirth: string): Kit {
  return {
    id: createKitId(),
    name: name.trim(),
    dateOfBirth,
    syncId: generateSyncId(),
    state: {},
  }
}
