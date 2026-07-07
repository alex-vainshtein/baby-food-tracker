import { useMemo, useState } from 'react'
import productsData from '../../data/products.json'
import type { FoodCategory, Product, SortDirection, SortField } from '../types'
import { useFoodTracker } from '../hooks/useFoodTracker'
import { useI18n } from '../i18n/I18nContext'
import { Filters } from './Filters'
import { FoodRow } from './FoodRow'
import { ProgressBar } from './ProgressBar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SyncPanel } from './SyncPanel'

const products = productsData as Product[]

const LOCALE_MAP: Record<string, string> = {
  uk: 'uk',
  en: 'en',
  es: 'es',
  de: 'de',
}

export function FoodTable() {
  const {
    getTracking,
    increment,
    decrement,
    giveToday,
    syncId,
    syncStatus,
    syncError,
    createSync,
    connectSync,
    disconnectSync,
    syncNow,
  } = useFoodTracker()
  const { t, productName, locale } = useI18n()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<FoodCategory | 'all'>('all')
  const [untriedOnly, setUntriedOnly] = useState(false)
  const [allergensOnly, setAllergensOnly] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const triedCount = useMemo(
    () => products.filter((p) => getTracking(p.id).count >= 1).length,
    [getTracking],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    let result = products.filter((p) => {
      const name = productName(p.id).toLowerCase()
      if (query && !name.includes(query)) return false
      if (category !== 'all' && p.category !== category) return false
      if (untriedOnly && getTracking(p.id).count > 0) return false
      if (allergensOnly && !p.isAllergen) return false
      return true
    })

    const collatorLocale = LOCALE_MAP[locale] ?? 'uk'

    result = [...result].sort((a, b) => {
      const trackA = getTracking(a.id)
      const trackB = getTracking(b.id)
      let cmp = 0

      switch (sortField) {
        case 'name':
          cmp = productName(a.id).localeCompare(productName(b.id), collatorLocale)
          break
        case 'count':
          cmp = trackA.count - trackB.count
          break
        case 'lastGiven': {
          const dateA = trackA.lastGivenAt ?? ''
          const dateB = trackB.lastGivenAt ?? ''
          cmp = dateA.localeCompare(dateB)
          break
        }
      }

      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [
    search,
    category,
    untriedOnly,
    allergensOnly,
    sortField,
    sortDirection,
    getTracking,
    productName,
    locale,
  ])

  return (
    <div className="food-table-page">
      <header className="page-header">
        <div className="page-header__top">
          <div>
            <h1>{t.pageTitle}</h1>
            <p className="page-header__subtitle">{t.pageSubtitle}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <ProgressBar products={products} triedCount={triedCount} />

      <SyncPanel
        syncId={syncId}
        syncStatus={syncStatus}
        syncError={syncError}
        onCreateSync={createSync}
        onConnectSync={connectSync}
        onDisconnectSync={disconnectSync}
        onSyncNow={syncNow}
      />

      <Filters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        untriedOnly={untriedOnly}
        onUntriedOnlyChange={setUntriedOnly}
        allergensOnly={allergensOnly}
        onAllergensOnlyChange={setAllergensOnly}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      <div className="table-wrap">
        <table className="food-table">
          <thead>
            <tr>
              <th>{t.colProduct}</th>
              <th>{t.colCategory}</th>
              <th>{t.colCount}</th>
              <th>{t.colLast}</th>
              <th>{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="food-table__empty">
                  {t.emptyResults}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <FoodRow
                  key={product.id}
                  product={product}
                  tracking={getTracking(product.id)}
                  onIncrement={() => increment(product.id)}
                  onDecrement={() => decrement(product.id)}
                  onGiveToday={() => giveToday(product.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="page-footer">
        <p>{t.footerCount(filteredProducts.length, products.length)}</p>
      </footer>
    </div>
  )
}
