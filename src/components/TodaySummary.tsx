import { useMemo } from 'react'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'
import {
  getEffectiveMenuDay,
  getMenuDayEntry,
  resolveMenuComponents,
} from '../storage/menuDay'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface TodaySummaryProps {
  onSelectProduct: (productId: string) => void
}

export function TodaySummary({ onSelectProduct }: TodaySummaryProps) {
  const { t } = useI18n()
  const { activeKit, trackedProducts, getTracking, getProductDisplayName } = useKitTracker()

  const today = todayIso()

  const givenToday = useMemo(() => {
    return trackedProducts.filter((p) => getTracking(p.id).lastGivenAt === today)
  }, [trackedProducts, getTracking, today])

  const menuDay = useMemo(() => {
    if (!activeKit) return 1
    return getEffectiveMenuDay(activeKit.dateOfBirth, activeKit.menuDayOverride)
  }, [activeKit])

  const untriedToday = useMemo(() => {
    const entry = getMenuDayEntry(menuDay)
    if (!entry) return []
    const trackedIds = new Set(trackedProducts.map((p) => p.id))
    return resolveMenuComponents(entry.components)
      .filter((f) => trackedIds.has(f.id))
      .filter((f) => getTracking(f.id).count === 0)
  }, [menuDay, trackedProducts, getTracking])

  if (!activeKit) return null

  return (
    <section className="today-summary" aria-label={t.todaySummaryTitle}>
      <h2 className="today-summary__title">{t.todaySummaryTitle}</h2>
      <div className="today-summary__grid">
        <div className="today-summary__block">
          <p className="today-summary__label">{t.todayGivenLabel}</p>
          {givenToday.length === 0 ? (
            <p className="today-summary__empty">{t.todayGivenEmpty}</p>
          ) : (
            <ul className="today-summary__chips">
              {givenToday.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="today-summary__chip today-summary__chip--given"
                    onClick={() => onSelectProduct(p.id)}
                  >
                    {getProductDisplayName(p.id)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="today-summary__block">
          <p className="today-summary__label">{t.todayUntriedLabel}</p>
          {untriedToday.length === 0 ? (
            <p className="today-summary__empty">{t.todayUntriedEmpty}</p>
          ) : (
            <ul className="today-summary__chips">
              {untriedToday.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="today-summary__chip today-summary__chip--new"
                    onClick={() => onSelectProduct(f.id)}
                  >
                    {getProductDisplayName(f.id)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
