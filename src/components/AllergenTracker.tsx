import { useMemo, useState } from 'react'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'
import {
  findActiveAllergenBlock,
  getAllergenDayIndex,
  getAllergenSchedule,
} from '../storage/knowledgeBase'
import { getEffectiveMenuDay, resolveMenuComponents } from '../storage/menuDay'

interface AllergenTrackerProps {
  onSelectProduct: (productId: string) => void
}

export function AllergenTracker({ onSelectProduct }: AllergenTrackerProps) {
  const { t } = useI18n()
  const { activeKit, getProductDisplayName } = useKitTracker()
  const [open, setOpen] = useState(false)

  const menuDay = useMemo(() => {
    if (!activeKit) return 1
    return getEffectiveMenuDay(activeKit.dateOfBirth, activeKit.menuDayOverride)
  }, [activeKit])

  const schedule = getAllergenSchedule()
  const activeBlock = findActiveAllergenBlock(menuDay)

  if (!activeKit) return null

  function blockStatus(blockDays: number[]): 'done' | 'active' | 'upcoming' {
    const maxDay = Math.max(...blockDays)
    const minDay = Math.min(...blockDays)
    if (menuDay > maxDay) return 'done'
    if (menuDay >= minDay && menuDay <= maxDay) return 'active'
    return 'upcoming'
  }

  return (
    <section className="allergen-tracker" aria-label={t.allergenTrackerTitle}>
      <button
        type="button"
        className="allergen-tracker__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{t.allergenTrackerTitle}</span>
        {activeBlock && (
          <span className="allergen-tracker__badge">{activeBlock.allergen}</span>
        )}
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="allergen-tracker__body">
          <ul className="allergen-tracker__blocks">
            {schedule.map((block) => {
              const status = blockStatus(block.days)
              const resolved = resolveMenuComponents([block.product])
              const productId = resolved[0]?.id
              const dayIndex =
                status === 'active' ? getAllergenDayIndex(menuDay, block) : null
              const dose =
                dayIndex != null && dayIndex > 0 ? block.doses[dayIndex - 1] : null

              return (
                <li
                  key={block.allergen}
                  className={`allergen-tracker__block allergen-tracker__block--${status}`}
                >
                  <div className="allergen-tracker__block-head">
                    <strong>{block.allergen}</strong>
                    <span className="allergen-tracker__status">
                      {status === 'active'
                        ? t.allergenTrackerActive
                        : status === 'done'
                          ? t.allergenTrackerDone
                          : t.allergenTrackerUpcoming}
                    </span>
                  </div>
                  <p className="allergen-tracker__days">
                    {t.allergenTrackerDays(block.days.join(', '))}
                  </p>
                  {productId && (
                    <button
                      type="button"
                      className="allergen-tracker__product"
                      onClick={() => onSelectProduct(productId)}
                    >
                      {getProductDisplayName(productId)}
                    </button>
                  )}
                  {dose && (
                    <p className="allergen-tracker__dose">
                      {t.allergenTrackerDayDose(dayIndex!, dose)}
                    </p>
                  )}
                  <ul className="allergen-tracker__doses">
                    {block.doses.map((d, i) => (
                      <li key={d}>{t.allergenTrackerDayDose(i + 1, d)}</li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
