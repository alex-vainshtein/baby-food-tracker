import type { ProductTracking, TrackerState } from '../types'

const emptyTracking = (): ProductTracking => ({ count: 0, lastGivenAt: null })

export function mergeTrackerState(a: TrackerState, b: TrackerState): TrackerState {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const result: TrackerState = {}

  for (const id of keys) {
    const ta = a[id] ?? emptyTracking()
    const tb = b[id] ?? emptyTracking()

    if (ta.count > tb.count) {
      result[id] = ta
    } else if (tb.count > ta.count) {
      result[id] = tb
    } else {
      const dateA = ta.lastGivenAt ?? ''
      const dateB = tb.lastGivenAt ?? ''
      result[id] = dateA >= dateB ? ta : tb
    }
  }

  return result
}
