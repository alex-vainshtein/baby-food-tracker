import type { TrackerState } from '../types'
import { mergeTrackerState } from './mergeState'

export interface SyncPayload {
  state: TrackerState
  updatedAt: number
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

export async function pullRemoteState(syncId: string): Promise<TrackerState> {
  const payload = await fetchPayload(syncId)
  return payload.state ?? {}
}

export async function pushMergedState(
  syncId: string,
  localState: TrackerState,
): Promise<TrackerState> {
  const remote = await fetchPayload(syncId)
  const merged = mergeTrackerState(localState, remote.state ?? {})
  await putPayload(syncId, { state: merged, updatedAt: Date.now() })
  return merged
}
