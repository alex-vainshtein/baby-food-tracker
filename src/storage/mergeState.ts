import type { ProductTracking, TrackerState } from '../types'

const emptyTracking = (): ProductTracking => ({ count: 0, lastGivenAt: null })

function pickTracking(ta: ProductTracking, tb: ProductTracking): ProductTracking {
  if (ta.count > tb.count) return ta
  if (tb.count > ta.count) return tb
  const dateA = ta.lastGivenAt ?? ''
  const dateB = tb.lastGivenAt ?? ''
  const primary = dateA >= dateB ? ta : tb
  const secondary = dateA >= dateB ? tb : ta
  return {
    ...primary,
    notes: primary.notes || secondary.notes,
  }
}

export function mergeTrackerState(a: TrackerState, b: TrackerState): TrackerState {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const result: TrackerState = {}

  for (const id of keys) {
    const ta = a[id] ?? emptyTracking()
    const tb = b[id] ?? emptyTracking()
    result[id] = pickTracking(ta, tb)
  }

  return result
}
