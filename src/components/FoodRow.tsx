import type { Product, ProductTracking } from '../types'
import { useI18n } from '../i18n/I18nContext'
import { getProductGuidance } from '../storage/productGuidance'

interface FoodRowProps {
  product: Product
  tracking: ProductTracking
  ageMonths: number | null
  expanded: boolean
  onToggle: () => void
  onIncrement: () => void
  onDecrement: () => void
  onGiveToday: () => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year.slice(2)}`
}

function stopPropagation(event: React.MouseEvent) {
  event.stopPropagation()
}

export function FoodRow({
  product,
  tracking,
  ageMonths,
  expanded,
  onToggle,
  onIncrement,
  onDecrement,
  onGiveToday,
}: FoodRowProps) {
  const { t, productName, locale } = useI18n()
  const name = productName(product.id)
  const givenToday = tracking.lastGivenAt === new Date().toISOString().slice(0, 10)
  const lastDate = formatDate(tracking.lastGivenAt)
  const rowTooltip =
    tracking.count > 0
      ? t.lastGivenTooltip(lastDate, tracking.count)
      : t.neverGivenTooltip

  const guidance = getProductGuidance(
    product.category,
    product.isAllergen,
    ageMonths,
    locale,
  )

  return (
    <>
      <tr
        id={`food-row-${product.id}`}
        className={`food-row${tracking.count === 0 ? ' food-row--untried' : ''}${expanded ? ' food-row--expanded' : ''}`}
        title={rowTooltip}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <td className="food-row__name" data-label={t.colProduct}>
          <span className="food-row__expand-icon" aria-hidden="true">
            {expanded ? '▾' : '▸'}
          </span>
          <span className="food-row__title">{name}</span>
          {product.isAllergen && (
            <span className="food-row__badge food-row__badge--allergen" title={t.allergenBadge}>
              ⚠
            </span>
          )}
        </td>
        <td className="food-row__category" data-label={t.colCategory}>
          <span className={`category-chip category-chip--${product.category}`}>
            {t.categories[product.category]}
          </span>
        </td>
        <td className="food-row__count" data-label={t.colCount} onClick={stopPropagation}>
          <div className="counter">
            <button
              type="button"
              className="counter__btn"
              onClick={onDecrement}
              disabled={tracking.count === 0}
              aria-label={t.decrementAria(name)}
            >
              −
            </button>
            <span className="counter__value" aria-label={`${tracking.count}`}>
              {tracking.count}
            </span>
            <button
              type="button"
              className="counter__btn"
              onClick={onIncrement}
              aria-label={t.incrementAria(name)}
            >
              +
            </button>
          </div>
        </td>
        <td
          className="food-row__date"
          data-label={t.colLast}
          lang={locale}
          title={tracking.lastGivenAt ? rowTooltip : undefined}
        >
          {lastDate}
        </td>
        <td className="food-row__actions" data-label={t.colActions} onClick={stopPropagation}>
          <button
            type="button"
            className={`btn-give-today${givenToday ? ' btn-give-today--active' : ''}`}
            onClick={onGiveToday}
          >
            {givenToday ? t.givenToday : t.giveToday}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="food-row__detail">
          <td colSpan={5}>
            <div className="food-row__guidance">
              <p className="food-row__guidance-desc">{guidance.description}</p>
              <p className="food-row__guidance-tip">
                <strong>{t.productGuidanceLabel}</strong> {guidance.recommendation}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
