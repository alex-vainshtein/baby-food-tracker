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
  const percent = Math.min(100, Math.round((triedCount / GOAL_COUNT) * 100))

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__title">{t.progressTitle}</span>
        <span className="progress-bar__count">
          {triedCount} / ~{GOAL_COUNT}
        </span>
      </div>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-bar__meta">{t.progressCatalog(total)}</p>
    </div>
  )
}
