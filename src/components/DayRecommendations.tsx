import { useMemo, useState } from 'react'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'
import { calcAgeInMonths } from '../storage/kitAge'
import {
  getEffectiveMenuDay,
  getMenuDayEntry,
  getMenuDayFromDob,
  PLAN_LENGTH_DAYS,
  resolveMenuComponents,
} from '../storage/menuDay'
import { getTextureLabel } from '../storage/productGuidance'

interface DayRecommendationsProps {
  onSelectProduct: (productId: string) => void
}

export function DayRecommendations({ onSelectProduct }: DayRecommendationsProps) {
  const { t, locale } = useI18n()
  const { activeKit, trackedProducts, getTracking, getProductDisplayName, setMenuDay, resetMenuDayToAge } =
    useKitTracker()
  const [open, setOpen] = useState(false)

  const ageMonths = useMemo(
    () => (activeKit ? calcAgeInMonths(activeKit.dateOfBirth) : null),
    [activeKit],
  )

  const menuDay = useMemo(() => {
    if (!activeKit) return 1
    return getEffectiveMenuDay(activeKit.dateOfBirth, activeKit.menuDayOverride)
  }, [activeKit])

  const menuEntry = useMemo(() => getMenuDayEntry(menuDay), [menuDay])

  const trackedIds = useMemo(
    () => new Set(trackedProducts.map((p) => p.id)),
    [trackedProducts],
  )

  const menuFoods = useMemo(() => {
    if (!menuEntry) return []
    return resolveMenuComponents(menuEntry.components).filter((f) => trackedIds.has(f.id))
  }, [menuEntry, trackedIds])

  const untriedIds = useMemo(
    () => menuFoods.filter((f) => getTracking(f.id).count === 0).map((f) => f.id),
    [menuFoods, getTracking],
  )

  const textureTip = useMemo(() => {
    if (ageMonths === null) return t.dayRecNoDob
    return t.dayRecTexture(ageMonths, getTextureLabel(ageMonths, locale))
  }, [ageMonths, locale, t])

  const isManualDay =
    activeKit?.menuDayOverride != null &&
    activeKit.menuDayOverride !== getMenuDayFromDob(activeKit.dateOfBirth)

  if (!activeKit || !menuEntry) return null

  const allergenNote = menuEntry.allergenIntro
    ? t.dayRecAllergen(menuEntry.allergenIntro)
    : null

  function changeDay(delta: number) {
    setMenuDay(menuDay + delta)
  }

  return (
    <section className="day-rec" aria-label={t.dayRecTitle}>
      <button
        type="button"
        className="day-rec__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="day-rec__toggle-label">
          <span className="day-rec__title">{t.dayRecTitle}</span>
          <span className="day-rec__toggle-meta">{t.dayRecDayLabel(menuDay)}</span>
        </span>
        <span className="day-rec__toggle-icon" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="day-rec__body">
          <div className="day-rec__header">
            <div className="day-rec__day-nav">
              <button
                type="button"
                className="day-rec__day-btn"
                onClick={() => changeDay(-1)}
                disabled={menuDay <= 1}
                aria-label={t.dayRecPrevDay}
              >
                ‹
              </button>
              <span className="day-rec__day-label">{t.dayRecDayLabel(menuDay)}</span>
              <button
                type="button"
                className="day-rec__day-btn"
                onClick={() => changeDay(1)}
                disabled={menuDay >= PLAN_LENGTH_DAYS}
                aria-label={t.dayRecNextDay}
              >
                ›
              </button>
            </div>
          </div>

          {isManualDay && (
            <p className="day-rec__override">
              {t.dayRecManualOverride}
              <button type="button" className="day-rec__follow-age" onClick={resetMenuDayToAge}>
                {t.dayRecFollowAge}
              </button>
            </p>
          )}

          {allergenNote && <p className="day-rec__allergen">{allergenNote}</p>}

          <p className="day-rec__tip">{t.dayRecMorningTip}</p>
          <p className="day-rec__tip day-rec__tip--muted">{textureTip}</p>

          <div className="day-rec__foods">
            <p className="day-rec__foods-label">{t.dayRecFoodsLabel}</p>
            <ul className="day-rec__chips">
              {menuFoods.map((food) => {
                const tried = getTracking(food.id).count > 0
                return (
                  <li key={food.id}>
                    <button
                      type="button"
                      className={`day-rec__chip${tried ? ' day-rec__chip--tried' : ' day-rec__chip--new'}`}
                      onClick={() => onSelectProduct(food.id)}
                    >
                      {getProductDisplayName(food.id)}
                      {!tried && <span className="day-rec__chip-badge">{t.dayRecNew}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {untriedIds.length > 0 && untriedIds.length < menuFoods.length && (
            <p className="day-rec__untried">
              {t.dayRecFocusUntried(untriedIds.map((id) => getProductDisplayName(id)).join(', '))}
            </p>
          )}

          {untriedIds.length === menuFoods.length && menuFoods.length > 0 && (
            <p className="day-rec__untried">{t.dayRecAllNew}</p>
          )}

          {menuDay === PLAN_LENGTH_DAYS && (
            <p className="day-rec__after">{t.dayRecPlanComplete}</p>
          )}
        </div>
      )}
    </section>
  )
}
