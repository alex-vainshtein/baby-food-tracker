import type { FoodCategory, SortDirection, SortField } from '../types'
import { useI18n } from '../i18n/I18nContext'

interface FiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: FoodCategory | 'all'
  onCategoryChange: (value: FoodCategory | 'all') => void
  untriedOnly: boolean
  onUntriedOnlyChange: (value: boolean) => void
  allergensOnly: boolean
  onAllergensOnlyChange: (value: boolean) => void
  sortField: SortField
  onSortFieldChange: (value: SortField) => void
  sortDirection: SortDirection
  onSortDirectionChange: (value: SortDirection) => void
}

export function Filters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  untriedOnly,
  onUntriedOnlyChange,
  allergensOnly,
  onAllergensOnlyChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
}: FiltersProps) {
  const { t } = useI18n()
  const categories = Object.entries(t.categories) as [FoodCategory, string][]

  return (
    <div className="filters">
      <input
        type="search"
        className="filters__search"
        placeholder={t.searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={t.searchAria}
      />

      <div className="filters__row">
        <select
          className="filters__select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as FoodCategory | 'all')}
          aria-label={t.categoryAria}
        >
          <option value="all">{t.allCategories}</option>
          {categories.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          className="filters__select"
          value={`${sortField}-${sortDirection}`}
          onChange={(e) => {
            const [field, dir] = e.target.value.split('-') as [SortField, SortDirection]
            onSortFieldChange(field)
            onSortDirectionChange(dir)
          }}
          aria-label={t.sortAria}
        >
          <option value="name-asc">{t.sortNameAsc}</option>
          <option value="name-desc">{t.sortNameDesc}</option>
          <option value="count-desc">{t.sortCountDesc}</option>
          <option value="count-asc">{t.sortCountAsc}</option>
          <option value="lastGiven-desc">{t.sortLastGivenDesc}</option>
          <option value="lastGiven-asc">{t.sortLastGivenAsc}</option>
        </select>
      </div>

      <div className="filters__toggles">
        <label className="filters__toggle">
          <input
            type="checkbox"
            checked={untriedOnly}
            onChange={(e) => onUntriedOnlyChange(e.target.checked)}
          />
          {t.untriedOnly}
        </label>
        <label className="filters__toggle">
          <input
            type="checkbox"
            checked={allergensOnly}
            onChange={(e) => onAllergensOnlyChange(e.target.checked)}
          />
          {t.allergensOnly}
        </label>
      </div>
    </div>
  )
}
