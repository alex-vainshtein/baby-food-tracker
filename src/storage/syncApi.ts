import type { KitMeta, TrackerState } from '../types'
import { mergeTrackerState } from './mergeState'

export interface SyncPayload {
  state: TrackerState
  updatedAt: number
  meta?: KitMeta
}

const SYNC_ID_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/

export function isValidSyncId(syncId: string): boolean {
  return SYNC_ID_PATTERN.test(syncId.trim().toUpperCase())
}

export function normalizeSyncId(syncId: string): string {
  return syncId.trim().toUpperCase()
}

export function generateSyncId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

export function buildInviteLink(syncId: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('join', syncId)
  return url.toString()
}

export function parseJoinCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const join = params.get('join')
  if (!join) return null
  const normalized = normalizeSyncId(join)
  return isValidSyncId(normalized) ? normalized : null
}

export function clearJoinParamFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('join')) return
  url.searchParams.delete('join')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next)
}

async function fetchPayload(syncId: string): Promise<SyncPayload> {
  const response = await fetch(`/api/sync/${encodeURIComponent(syncId)}`)
  if (!response.ok) {
    throw new Error(`Sync fetch failed (${response.status})`)
  }
  return (await response.json()) as SyncPayload
}

async function putPayload(syncId: string, payload: SyncPayload): Promise<void> {
  const response = await fetch(`/api/sync/${encodeURIComponent(syncId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Sync save failed (${response.status})`)
  }
}

export async function pullRemote(syncId: string): Promise<SyncPayload> {
  const payload = await fetchPayload(syncId)
  return {
    state: payload.state ?? {},
    updatedAt: payload.updatedAt ?? 0,
    meta: payload.meta,
  }
}

export async function pullRemoteState(syncId: string): Promise<TrackerState> {
  const payload = await pullRemote(syncId)
  return payload.state
}

export async function pushMergedState(
  syncId: string,
  localState: TrackerState,
  meta?: KitMeta,
): Promise<SyncPayload> {
  const remote = await fetchPayload(syncId)
  const merged = mergeTrackerState(localState, remote.state ?? {})
  const payload: SyncPayload = {
    state: merged,
    updatedAt: Date.now(),
    meta: meta ?? remote.meta,
  }
  await putPayload(syncId, payload)
  return payload
}
