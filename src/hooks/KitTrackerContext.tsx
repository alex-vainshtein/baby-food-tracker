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
import type { Kit, KitMeta, KitsData, ProductTracking, TrackerState } from '../types'
import { useI18n } from '../i18n/I18nContext'
import { mergeTrackerState } from '../storage/mergeState'
import { createKit, loadKits, saveKits } from '../storage/kitsStorage'
import {
  clearJoinParamFromUrl,
  isValidSyncId,
  normalizeSyncId,
  parseJoinCodeFromUrl,
  pullRemote,
  pushMergedState,
} from '../storage/syncApi'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const SYNC_DEBOUNCE_MS = 1200
const SYNC_POLL_MS = 30_000

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function mergeMeta(local: KitMeta, remote?: KitMeta): KitMeta {
  if (!remote) return local
  return {
    name: local.name || remote.name,
    dateOfBirth: local.dateOfBirth || remote.dateOfBirth,
  }
}

interface KitTrackerContextValue {
  kits: Kit[]
  activeKit: Kit | null
  activeKitId: string | null
  syncStatus: SyncStatus
  syncError: string | null
  getTracking: (productId: string) => ProductTracking
  increment: (productId: string) => void
  decrement: (productId: string) => void
  giveToday: (productId: string) => void
  switchKit: (kitId: string) => void
  addKit: (name: string, dateOfBirth: string) => Promise<void>
  updateActiveKit: (patch: Partial<Pick<Kit, 'name' | 'dateOfBirth'>>) => void
  joinKitBySyncCode: (rawCode: string) => Promise<boolean>
  syncNow: () => Promise<void>
}

const KitTrackerContext = createContext<KitTrackerContextValue | null>(null)

export function KitTrackerProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [kitsData, setKitsData] = useState<KitsData>(() => loadKits(t.defaultKitName))
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)

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
        const meta: KitMeta = { name: kit.name, dateOfBirth: kit.dateOfBirth }
        const result = await pushMergedState(kit.syncId, kit.state, meta)
        updateKitById(kit.id, (current) => ({
          ...current,
          state: mergeTrackerState(current.state, result.state),
          name: mergeMeta(
            { name: current.name, dateOfBirth: current.dateOfBirth },
            result.meta,
          ).name,
          dateOfBirth: mergeMeta(
            { name: current.name, dateOfBirth: current.dateOfBirth },
            result.meta,
          ).dateOfBirth,
        }))
        setSyncStatus('synced')
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
    async (kit: Kit) => {
      if (!kit.syncId) return
      setSyncStatus('syncing')
      setSyncError(null)
      try {
        const remote = await pullRemote(kit.syncId)
        updateKitById(kit.id, (current) => ({
          ...current,
          state: mergeTrackerState(current.state, remote.state),
          name: mergeMeta(
            { name: current.name, dateOfBirth: current.dateOfBirth },
            remote.meta,
          ).name,
          dateOfBirth: mergeMeta(
            { name: current.name, dateOfBirth: current.dateOfBirth },
            remote.meta,
          ).dateOfBirth,
        }))
        setSyncStatus('synced')
      } catch {
        setSyncStatus('error')
        setSyncError('sync-failed')
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
      if (latest) void pullAndMerge(latest)
    }, SYNC_POLL_MS)
    return () => clearInterval(interval)
  }, [activeKit?.id, activeKit?.syncId, pullAndMerge])

  useEffect(() => {
    if (!activeKit?.syncId) return
    scheduleSync(activeKit)
  }, [activeKit?.state, activeKit?.syncId, activeKit?.name, activeKit?.dateOfBirth, scheduleSync])

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
      increment(productId)
    },
    [increment],
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
      updateKitById(kitId, (kit) => ({ ...kit, ...patch }))
    },
    [updateKitById],
  )

  const syncNow = useCallback(async () => {
    const kit = kitsDataRef.current.kits.find(
      (k) => k.id === kitsDataRef.current.activeKitId,
    )
    if (kit) await runSync(kit)
  }, [runSync])

  const value: KitTrackerContextValue = {
    kits: kitsData.kits,
    activeKit,
    activeKitId: kitsData.activeKitId,
    syncStatus,
    syncError,
    getTracking,
    increment,
    decrement,
    giveToday,
    switchKit,
    addKit,
    updateActiveKit,
    joinKitBySyncCode,
    syncNow,
  }

  return <KitTrackerContext.Provider value={value}>{children}</KitTrackerContext.Provider>
}

export function useKitTracker() {
  const ctx = useContext(KitTrackerContext)
  if (!ctx) throw new Error('useKitTracker must be used within KitTrackerProvider')
  return ctx
}
