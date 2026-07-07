import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProductTracking, TrackerState } from '../types'
import { STORAGE_KEY, SYNC_ID_STORAGE_KEY } from '../types'
import { mergeTrackerState } from '../storage/mergeState'
import {
  generateSyncId,
  isValidSyncId,
  normalizeSyncId,
  pullRemoteState,
  pushMergedState,
} from '../storage/syncApi'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

function loadState(): TrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as TrackerState
  } catch {
    return {}
  }
}

function saveState(state: TrackerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function loadSyncId(): string | null {
  const raw = localStorage.getItem(SYNC_ID_STORAGE_KEY)
  if (!raw) return null
  const normalized = normalizeSyncId(raw)
  return isValidSyncId(normalized) ? normalized : null
}

function saveSyncId(syncId: string | null) {
  if (syncId) {
    localStorage.setItem(SYNC_ID_STORAGE_KEY, syncId)
  } else {
    localStorage.removeItem(SYNC_ID_STORAGE_KEY)
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

const SYNC_DEBOUNCE_MS = 1200
const SYNC_POLL_MS = 30_000

export function useFoodTracker() {
  const [state, setState] = useState<TrackerState>(loadState)
  const [syncId, setSyncId] = useState<string | null>(loadSyncId)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)

  const stateRef = useRef(state)
  const syncIdRef = useRef(syncId)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPushingRef = useRef(false)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    syncIdRef.current = syncId
  }, [syncId])

  useEffect(() => {
    saveState(state)
  }, [state])

  const runSync = useCallback(async (id: string, localState: TrackerState) => {
    if (isPushingRef.current) return
    isPushingRef.current = true
    setSyncStatus('syncing')
    setSyncError(null)

    try {
      const merged = await pushMergedState(id, localState)
      setState((prev) => {
        const next = mergeTrackerState(prev, merged)
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      })
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
      setSyncError('sync-failed')
    } finally {
      isPushingRef.current = false
    }
  }, [])

  const scheduleSync = useCallback(
    (id: string) => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
      pushTimerRef.current = setTimeout(() => {
        void runSync(id, stateRef.current)
      }, SYNC_DEBOUNCE_MS)
    },
    [runSync],
  )

  const pullAndMerge = useCallback(async (id: string) => {
    setSyncStatus('syncing')
    setSyncError(null)
    try {
      const remote = await pullRemoteState(id)
      setState((prev) => mergeTrackerState(prev, remote))
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
      setSyncError('sync-failed')
    }
  }, [])

  useEffect(() => {
    if (!syncId) return
    void pullAndMerge(syncId)
  }, [syncId, pullAndMerge])

  useEffect(() => {
    if (!syncId) return
    const interval = setInterval(() => {
      void pullAndMerge(syncId)
    }, SYNC_POLL_MS)
    return () => clearInterval(interval)
  }, [syncId, pullAndMerge])

  useEffect(() => {
    if (!syncId) return
    scheduleSync(syncId)
  }, [state, syncId, scheduleSync])

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    }
  }, [])

  const getTracking = useCallback(
    (productId: string): ProductTracking => {
      return state[productId] ?? { count: 0, lastGivenAt: null }
    },
    [state],
  )

  const increment = useCallback((productId: string) => {
    setState((prev) => {
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
  }, [])

  const decrement = useCallback((productId: string) => {
    setState((prev) => {
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
  }, [])

  const giveToday = useCallback(
    (productId: string) => {
      increment(productId)
    },
    [increment],
  )

  const createSync = useCallback(async () => {
    const id = generateSyncId()
    saveSyncId(id)
    setSyncId(id)
    await runSync(id, stateRef.current)
    return id
  }, [runSync])

  const connectSync = useCallback(
    async (rawId: string) => {
      const id = normalizeSyncId(rawId)
      if (!isValidSyncId(id)) {
        setSyncError('invalid-code')
        return false
      }

      saveSyncId(id)
      setSyncId(id)
      await pullAndMerge(id)
      await runSync(id, stateRef.current)
      return true
    },
    [pullAndMerge, runSync],
  )

  const disconnectSync = useCallback(() => {
    saveSyncId(null)
    setSyncId(null)
    setSyncStatus('idle')
    setSyncError(null)
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
  }, [])

  const syncNow = useCallback(async () => {
    if (!syncIdRef.current) return
    await runSync(syncIdRef.current, stateRef.current)
  }, [runSync])

  return {
    state,
    getTracking,
    increment,
    decrement,
    giveToday,
    syncId,
    syncStatus,
    syncError,
    createSync,
    connectSync,
    disconnectSync,
    syncNow,
  }
}
