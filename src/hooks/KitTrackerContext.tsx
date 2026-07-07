import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CustomProduct, FoodCategory, Kit, KitMeta, KitsData, Product, ProductTracking, TrackerState } from '../types'
import { useI18n } from '../i18n/I18nContext'
import { mergeTrackerState } from '../storage/mergeState'
import { createKit, loadKits, saveKits } from '../storage/kitsStorage'
import { PLAN_LENGTH_DAYS } from '../storage/menuDay'
import {
  buildKitProducts,
  buildTrackedProducts,
  createCustomProductId,
  isProductExcluded,
  resolveProductName,
} from '../storage/productCatalog'
import productsData from '../../data/products.json'
import {
  clearJoinParamFromUrl,
  isValidSyncId,
  normalizeSyncId,
  parseJoinCodeFromUrl,
  pullRemote,
  pushMergedState,
} from '../storage/syncApi'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const SYNC_DEBOUNCE_MS = 5000
const SYNC_POLL_MS = 60_000
const catalogProducts = productsData as Product[]

function mergeIdLists(a?: string[], b?: string[]): string[] {
  return [...new Set([...(a ?? []), ...(b ?? [])])]
}

function mergeCustomProducts(a?: CustomProduct[], b?: CustomProduct[]): CustomProduct[] {
  const map = new Map<string, CustomProduct>()
  for (const p of [...(b ?? []), ...(a ?? [])]) {
    map.set(p.id, p)
  }
  return [...map.values()]
}

function kitToMeta(kit: Kit): KitMeta {
  return {
    name: kit.name,
    dateOfBirth: kit.dateOfBirth,
    excludedProductIds: kit.excludedProductIds ?? [],
    customProducts: kit.customProducts ?? [],
    menuDayOverride: kit.menuDayOverride ?? null,
  }
}

function applyRemoteMeta(kit: Kit, remote?: KitMeta): Kit {
  if (!remote) return kit
  return {
    ...kit,
    name: kit.name || remote.name,
    dateOfBirth: kit.dateOfBirth || remote.dateOfBirth,
    excludedProductIds: mergeIdLists(kit.excludedProductIds, remote.excludedProductIds),
    customProducts: mergeCustomProducts(kit.customProducts, remote.customProducts),
    menuDayOverride:
      remote.menuDayOverride !== undefined
        ? remote.menuDayOverride
        : kit.menuDayOverride,
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function mergeMeta(local: KitMeta, remote?: KitMeta): KitMeta {
  if (!remote) return local
  return {
    name: local.name || remote.name,
    dateOfBirth: local.dateOfBirth || remote.dateOfBirth,
    excludedProductIds: mergeIdLists(local.excludedProductIds, remote.excludedProductIds),
    customProducts: mergeCustomProducts(local.customProducts, remote.customProducts),
    menuDayOverride: local.menuDayOverride ?? remote.menuDayOverride ?? null,
  }
}

interface KitTrackerContextValue {
  catalogProducts: Product[]
  kitProducts: Product[]
  trackedProducts: Product[]
  kits: Kit[]
  activeKit: Kit | null
  activeKitId: string | null
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: number | null
  getTracking: (productId: string) => ProductTracking
  getProductDisplayName: (productId: string) => string
  isProductExcluded: (productId: string) => boolean
  increment: (productId: string) => void
  decrement: (productId: string) => void
  giveToday: (productId: string) => void
  switchKit: (kitId: string) => void
  addKit: (name: string, dateOfBirth: string) => Promise<void>
  updateActiveKit: (patch: Partial<Pick<Kit, 'name' | 'dateOfBirth'>>) => void
  setMenuDay: (day: number) => void
  resetMenuDayToAge: () => void
  setProductNotes: (productId: string, notes: string) => void
  excludeProduct: (productId: string) => void
  includeProduct: (productId: string) => void
  addCustomProduct: (name: string, category: FoodCategory, isAllergen: boolean) => void
  removeCustomProduct: (productId: string) => void
  joinKitBySyncCode: (rawCode: string) => Promise<boolean>
  syncNow: () => Promise<void>
  deleteKit: (kitId: string) => void
  importKitData: (data: { meta?: KitMeta; state?: TrackerState }) => boolean
}

const KitTrackerContext = createContext<KitTrackerContextValue | null>(null)

export function KitTrackerProvider({ children }: { children: ReactNode }) {
  const { t, productName } = useI18n()
  const [kitsData, setKitsData] = useState<KitsData>(() => loadKits(t.defaultKitName))
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

  const kitsDataRef = useRef(kitsData)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPushingRef = useRef(false)
  const joinHandledRef = useRef(false)

  useEffect(() => {
    kitsDataRef.current = kitsData
    saveKits(kitsData)
  }, [kitsData])

  const activeKit = useMemo(
    () => kitsData.kits.find((k) => k.id === kitsData.activeKitId) ?? null,
    [kitsData],
  )

  const kitProducts = useMemo(
    () => buildKitProducts(catalogProducts, activeKit),
    [activeKit],
  )

  const trackedProducts = useMemo(
    () => buildTrackedProducts(catalogProducts, activeKit),
    [activeKit],
  )

  const checkProductExcluded = useCallback(
    (productId: string) => isProductExcluded(activeKit, productId),
    [activeKit],
  )

  const updateKitById = useCallback((kitId: string, updater: (kit: Kit) => Kit) => {
    setKitsData((prev) => ({
      ...prev,
      kits: prev.kits.map((k) => (k.id === kitId ? updater(k) : k)),
    }))
  }, [])

  const updateActiveKitState = useCallback(
    (updater: (state: TrackerState) => TrackerState) => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      updateKitById(kitId, (kit) => ({ ...kit, state: updater(kit.state) }))
    },
    [updateKitById],
  )

  const runSync = useCallback(
    async (kit: Kit) => {
      if (isPushingRef.current || !kit.syncId) return
      isPushingRef.current = true
      setSyncStatus('syncing')
      setSyncError(null)

      try {
        const meta = kitToMeta(kit)
        const result = await pushMergedState(kit.syncId, kit.state, meta)
        updateKitById(kit.id, (current) => {
          const mergedMeta = mergeMeta(meta, result.meta)
          const withMeta = applyRemoteMeta(current, mergedMeta)
          return {
            ...withMeta,
            state: mergeTrackerState(current.state, result.state),
          }
        })
        setSyncStatus('synced')
        setLastSyncedAt(Date.now())
      } catch {
        setSyncStatus('error')
        setSyncError('sync-failed')
      } finally {
        isPushingRef.current = false
      }
    },
    [updateKitById],
  )

  const pullAndMerge = useCallback(
    async (kit: Kit, options?: { silent?: boolean }) => {
      if (!kit.syncId) return
      if (!options?.silent) {
        setSyncStatus('syncing')
        setSyncError(null)
      }
      try {
        const remote = await pullRemote(kit.syncId)
        updateKitById(kit.id, (current) => {
          const withMeta = applyRemoteMeta(current, remote.meta)
          return {
            ...withMeta,
            state: mergeTrackerState(current.state, remote.state),
          }
        })
        if (!options?.silent) {
          setSyncStatus('synced')
        }
        setLastSyncedAt(Date.now())
      } catch {
        if (!options?.silent) {
          setSyncStatus('error')
          setSyncError('sync-failed')
        }
      }
    },
    [updateKitById],
  )

  const scheduleSync = useCallback(
    (kit: Kit) => {
      if (!kit.syncId) return
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
      pushTimerRef.current = setTimeout(() => {
        const latest = kitsDataRef.current.kits.find((k) => k.id === kit.id)
        if (latest) void runSync(latest)
      }, SYNC_DEBOUNCE_MS)
    },
    [runSync],
  )

  useEffect(() => {
    if (!activeKit?.syncId) return
    void pullAndMerge(activeKit)
  }, [activeKit?.id, activeKit?.syncId, pullAndMerge])

  useEffect(() => {
    if (!activeKit?.syncId) return
    const interval = setInterval(() => {
      const latest = kitsDataRef.current.kits.find((k) => k.id === activeKit.id)
      if (latest) void pullAndMerge(latest, { silent: true })
    }, SYNC_POLL_MS)
    return () => clearInterval(interval)
  }, [activeKit?.id, activeKit?.syncId, pullAndMerge])

  useEffect(() => {
    if (!activeKit?.syncId) return
    scheduleSync(activeKit)
  }, [
    activeKit?.state,
    activeKit?.syncId,
    activeKit?.name,
    activeKit?.dateOfBirth,
    activeKit?.excludedProductIds,
    activeKit?.customProducts,
    activeKit?.menuDayOverride,
    scheduleSync,
  ])

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    }
  }, [])

  const joinKitBySyncCode = useCallback(
    async (rawCode: string) => {
      const syncId = normalizeSyncId(rawCode)
      if (!isValidSyncId(syncId)) {
        setSyncError('invalid-code')
        return false
      }

      const existing = kitsDataRef.current.kits.find((k) => k.syncId === syncId)
      if (existing) {
        setKitsData((prev) => ({ ...prev, activeKitId: existing.id }))
        await pullAndMerge(existing)
        return true
      }

      try {
        const remote = await pullRemote(syncId)
        const kit = createKit(remote.meta?.name || t.defaultKitName, remote.meta?.dateOfBirth ?? '')
        kit.syncId = syncId
        kit.state = remote.state ?? {}
        if (remote.meta) {
          kit.excludedProductIds = remote.meta.excludedProductIds ?? []
          kit.customProducts = remote.meta.customProducts ?? []
          kit.menuDayOverride = remote.meta.menuDayOverride ?? null
          kit.name = remote.meta.name || kit.name
          kit.dateOfBirth = remote.meta.dateOfBirth ?? kit.dateOfBirth
        }

        setKitsData((prev) => ({
          kits: [...prev.kits, kit],
          activeKitId: kit.id,
        }))
        setSyncStatus('synced')
        setSyncError(null)
        return true
      } catch {
        setSyncError('sync-failed')
        return false
      }
    },
    [pullAndMerge, t.defaultKitName],
  )

  useEffect(() => {
    if (joinHandledRef.current) return
    const joinCode = parseJoinCodeFromUrl()
    if (!joinCode) return
    joinHandledRef.current = true
    clearJoinParamFromUrl()
    void joinKitBySyncCode(joinCode)
  }, [joinKitBySyncCode])

  const getTracking = useCallback(
    (productId: string): ProductTracking => {
      return activeKit?.state[productId] ?? { count: 0, lastGivenAt: null }
    },
    [activeKit],
  )

  const increment = useCallback(
    (productId: string) => {
      const kit = kitsDataRef.current.kits.find(
        (k) => k.id === kitsDataRef.current.activeKitId,
      )
      if (isProductExcluded(kit ?? null, productId)) return
      updateActiveKitState((prev) => {
        const current = prev[productId] ?? { count: 0, lastGivenAt: null }
        return {
          ...prev,
          [productId]: {
            ...current,
            count: current.count + 1,
            lastGivenAt: todayIso(),
          },
        }
      })
    },
    [updateActiveKitState],
  )

  const decrement = useCallback(
    (productId: string) => {
      const kit = kitsDataRef.current.kits.find(
        (k) => k.id === kitsDataRef.current.activeKitId,
      )
      if (isProductExcluded(kit ?? null, productId)) return
      updateActiveKitState((prev) => {
        const current = prev[productId] ?? { count: 0, lastGivenAt: null }
        const nextCount = Math.max(0, current.count - 1)
        return {
          ...prev,
          [productId]: {
            ...current,
            count: nextCount,
            lastGivenAt: nextCount === 0 ? null : current.lastGivenAt,
          },
        }
      })
    },
    [updateActiveKitState],
  )

  const giveToday = useCallback(
    (productId: string) => {
      const kit = kitsDataRef.current.kits.find(
        (k) => k.id === kitsDataRef.current.activeKitId,
      )
      if (isProductExcluded(kit ?? null, productId)) return
      const today = todayIso()
      updateActiveKitState((prev) => {
        const current = prev[productId] ?? { count: 0, lastGivenAt: null }
        if (current.lastGivenAt === today) {
          return {
            ...prev,
            [productId]: { ...current, lastGivenAt: null },
          }
        }
        return {
          ...prev,
          [productId]: {
            ...current,
            lastGivenAt: today,
            count: current.count === 0 ? 1 : current.count,
          },
        }
      })
    },
    [updateActiveKitState],
  )

  const setProductNotes = useCallback(
    (productId: string, notes: string) => {
      const kit = kitsDataRef.current.kits.find(
        (k) => k.id === kitsDataRef.current.activeKitId,
      )
      if (isProductExcluded(kit ?? null, productId)) return
      updateActiveKitState((prev) => {
        const current = prev[productId] ?? { count: 0, lastGivenAt: null }
        const trimmed = notes.trim()
        return {
          ...prev,
          [productId]: {
            ...current,
            notes: trimmed || undefined,
          },
        }
      })
    },
    [updateActiveKitState],
  )

  const switchKit = useCallback((kitId: string) => {
    setKitsData((prev) => ({ ...prev, activeKitId: kitId }))
    setSyncStatus('idle')
    setSyncError(null)
  }, [])

  const addKit = useCallback(
    async (name: string, dateOfBirth: string) => {
      const kit = createKit(name.trim() || t.defaultKitName, dateOfBirth)
      setKitsData((prev) => ({
        kits: [...prev.kits, kit],
        activeKitId: kit.id,
      }))
      await runSync(kit)
    },
    [runSync, t.defaultKitName],
  )

  const updateActiveKit = useCallback(
    (patch: Partial<Pick<Kit, 'name' | 'dateOfBirth'>>) => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      updateKitById(kitId, (kit) => ({
        ...kit,
        ...patch,
        ...(patch.dateOfBirth !== undefined ? { menuDayOverride: null } : {}),
      }))
    },
    [updateKitById],
  )

  const setMenuDay = useCallback(
    (day: number) => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      const clamped = Math.min(PLAN_LENGTH_DAYS, Math.max(1, day))
      updateKitById(kitId, (kit) => ({ ...kit, menuDayOverride: clamped }))
    },
    [updateKitById],
  )

  const resetMenuDayToAge = useCallback(() => {
    const kitId = kitsDataRef.current.activeKitId
    if (!kitId) return
    updateKitById(kitId, (kit) => ({ ...kit, menuDayOverride: null }))
  }, [updateKitById])

  const syncNow = useCallback(async () => {
    const kit = kitsDataRef.current.kits.find(
      (k) => k.id === kitsDataRef.current.activeKitId,
    )
    if (kit) await runSync(kit)
  }, [runSync])

  const getProductDisplayName = useCallback(
    (productId: string) => resolveProductName(productId, activeKit, productName),
    [activeKit, productName],
  )

  const excludeProduct = useCallback(
    (productId: string) => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      updateKitById(kitId, (kit) => {
        const excluded = new Set(kit.excludedProductIds ?? [])
        excluded.add(productId)
        return { ...kit, excludedProductIds: [...excluded] }
      })
    },
    [updateKitById],
  )

  const includeProduct = useCallback(
    (productId: string) => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      updateKitById(kitId, (kit) => ({
        ...kit,
        excludedProductIds: (kit.excludedProductIds ?? []).filter((id) => id !== productId),
      }))
    },
    [updateKitById],
  )

  const addCustomProduct = useCallback(
    (name: string, category: FoodCategory, isAllergen: boolean) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      const custom: CustomProduct = {
        id: createCustomProductId(),
        name: trimmed,
        category,
        isAllergen,
      }
      updateKitById(kitId, (kit) => ({
        ...kit,
        customProducts: [...(kit.customProducts ?? []), custom],
      }))
    },
    [updateKitById],
  )

  const removeCustomProduct = useCallback(
    (productId: string) => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return
      updateKitById(kitId, (kit) => ({
        ...kit,
        customProducts: (kit.customProducts ?? []).filter((p) => p.id !== productId),
        state: Object.fromEntries(
          Object.entries(kit.state).filter(([id]) => id !== productId),
        ),
      }))
    },
    [updateKitById],
  )

  const deleteKit = useCallback((kitId: string) => {
    setKitsData((prev) => {
      if (prev.kits.length <= 1) return prev
      const kits = prev.kits.filter((k) => k.id !== kitId)
      const activeKitId = prev.activeKitId === kitId ? kits[0]?.id ?? null : prev.activeKitId
      return { kits, activeKitId }
    })
    setSyncStatus('idle')
    setSyncError(null)
  }, [])

  const importKitData = useCallback(
    (data: { meta?: KitMeta; state?: TrackerState }): boolean => {
      const kitId = kitsDataRef.current.activeKitId
      if (!kitId) return false
      updateKitById(kitId, (kit) => ({
        ...applyRemoteMeta(kit, data.meta),
        state: data.state ? mergeTrackerState(kit.state, data.state) : kit.state,
      }))
      return true
    },
    [updateKitById],
  )

  const value: KitTrackerContextValue = {
    catalogProducts,
    kitProducts,
    trackedProducts,
    kits: kitsData.kits,
    activeKit,
    activeKitId: kitsData.activeKitId,
    syncStatus,
    syncError,
    lastSyncedAt,
    getTracking,
    getProductDisplayName,
    isProductExcluded: checkProductExcluded,
    increment,
    decrement,
    giveToday,
    setProductNotes,
    switchKit,
    addKit,
    updateActiveKit,
    setMenuDay,
    resetMenuDayToAge,
    excludeProduct,
    includeProduct,
    addCustomProduct,
    removeCustomProduct,
    joinKitBySyncCode,
    syncNow,
    deleteKit,
    importKitData,
  }

  return <KitTrackerContext.Provider value={value}>{children}</KitTrackerContext.Provider>
}

export function useKitTracker() {
  const ctx = useContext(KitTrackerContext)
  if (!ctx) throw new Error('useKitTracker must be used within KitTrackerProvider')
  return ctx
}
