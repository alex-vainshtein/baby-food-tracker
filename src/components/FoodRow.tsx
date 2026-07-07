import type { Product, ProductTracking } from '../types'
import { useI18n } from '../i18n/I18nContext'

interface FoodRowProps {
  product: Product
  tracking: ProductTracking
  onIncrement: () => void
  onDecrement: () => void
  onGiveToday: () => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year.slice(2)}`
}

export function FoodRow({
  product,
  tracking,
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

  return (
    <tr
      className={`food-row${tracking.count === 0 ? ' food-row--untried' : ''}`}
      title={rowTooltip}
    >
      <td className="food-row__name" data-label={t.colProduct}>
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
      <td className="food-row__count" data-label={t.colCount}>
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
      <td className="food-row__actions" data-label={t.colActions}>
        <button
          type="button"
          className={`btn-give-today${givenToday ? ' btn-give-today--active' : ''}`}
          onClick={onGiveToday}
        >
          {givenToday ? t.givenToday : t.giveToday}
        </button>
      </td>
    </tr>
  )
}
