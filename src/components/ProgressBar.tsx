import { useI18n } from '../i18n/I18nContext'
import type { Product } from '../types'
import { GOAL_COUNT } from '../types'

interface ProgressBarProps {
  products: Product[]
  triedCount: number
}

export function ProgressBar({ products, triedCount }: ProgressBarProps) {
  const { t } = useI18n()
  const total = products.length
  const goal = Math.min(GOAL_COUNT, Math.max(total, 1))
  const percent = Math.min(100, Math.round((triedCount / goal) * 100))

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__title">{t.progressTitle}</span>
        <span className="progress-bar__count">{t.progressGoal(triedCount, goal)}</span>
      </div>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-bar__meta">{t.progressCatalog(total)}</p>
    </div>
  )
}
