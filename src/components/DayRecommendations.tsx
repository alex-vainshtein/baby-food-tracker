import { useMemo } from 'react'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'
import { calcAgeInMonths } from '../storage/kitAge'
import {
  getEffectiveMenuDay,
  getMenuDayEntry,
  PLAN_LENGTH_DAYS,
  resolveMenuComponents,
} from '../storage/menuDay'
import { getTextureLabel } from '../storage/productGuidance'

interface DayRecommendationsProps {
  onSelectProduct: (productId: string) => void
}

export function DayRecommendations({ onSelectProduct }: DayRecommendationsProps) {
  const { t, productName, locale } = useI18n()
  const { activeKit, getTracking, setMenuDay } = useKitTracker()

  const ageMonths = useMemo(
    () => (activeKit ? calcAgeInMonths(activeKit.dateOfBirth) : null),
    [activeKit],
  )

  const menuDay = useMemo(() => {
    if (!activeKit) return 1
    return getEffectiveMenuDay(activeKit.dateOfBirth, activeKit.menuDayOverride)
  }, [activeKit])

  const menuEntry = useMemo(() => getMenuDayEntry(menuDay), [menuDay])

  const menuFoods = useMemo(() => {
    if (!menuEntry) return []
    return resolveMenuComponents(menuEntry.components)
  }, [menuEntry])

  const untriedIds = useMemo(
    () => menuFoods.filter((f) => getTracking(f.id).count === 0).map((f) => f.id),
    [menuFoods, getTracking],
  )

  const textureTip = useMemo(() => {
    if (ageMonths === null) return t.dayRecNoDob
    return t.dayRecTexture(ageMonths, getTextureLabel(ageMonths, locale))
  }, [ageMonths, locale, t])

  if (!activeKit || !menuEntry) return null

  const allergenNote = menuEntry.allergenIntro
    ? t.dayRecAllergen(menuEntry.allergenIntro)
    : null

  function changeDay(delta: number) {
    setMenuDay(menuDay + delta)
  }

  return (
    <section className="day-rec" aria-label={t.dayRecTitle}>
      <div className="day-rec__header">
        <h2 className="day-rec__title">{t.dayRecTitle}</h2>
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
                  {productName(food.id)}
                  {!tried && <span className="day-rec__chip-badge">{t.dayRecNew}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {untriedIds.length > 0 && untriedIds.length < menuFoods.length && (
        <p className="day-rec__untried">
          {t.dayRecFocusUntried(untriedIds.map((id) => productName(id)).join(', '))}
        </p>
      )}

      {untriedIds.length === menuFoods.length && menuFoods.length > 0 && (
        <p className="day-rec__untried">{t.dayRecAllNew}</p>
      )}

      {menuDay === PLAN_LENGTH_DAYS && (
        <p className="day-rec__after">{t.dayRecPlanComplete}</p>
      )}
    </section>
  )
}
