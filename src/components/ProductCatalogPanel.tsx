import { useMemo, useState } from 'react'
import type { FoodCategory } from '../types'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'

const CATEGORY_OPTIONS: FoodCategory[] = [
  'meat',
  'fish',
  'vegetable',
  'fruit',
  'grain',
  'legume',
  'dairy',
  'fat',
  'allergen',
]

export function ProductCatalogPanel() {
  const { t, productName } = useI18n()
  const {
    catalogProducts,
    trackedProducts,
    activeKit,
    getProductDisplayName,
    excludeProduct,
    includeProduct,
    addCustomProduct,
    removeCustomProduct,
  } = useKitTracker()

  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState<FoodCategory>('dairy')
  const [customAllergen, setCustomAllergen] = useState(true)

  const excludedIds = useMemo(
    () => new Set(activeKit?.excludedProductIds ?? []),
    [activeKit?.excludedProductIds],
  )

  const excludedProducts = useMemo(
    () => catalogProducts.filter((p) => excludedIds.has(p.id)),
    [catalogProducts, excludedIds],
  )

  const customProducts = activeKit?.customProducts ?? []

  const catalogMatches = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    return catalogProducts
      .filter((p) => !excludedIds.has(p.id))
      .filter((p) => productName(p.id).toLowerCase().includes(query))
      .slice(0, 8)
  }, [search, catalogProducts, excludedIds, productName])

  function handleAddCustom(event: React.FormEvent) {
    event.preventDefault()
    if (!customName.trim()) return
    addCustomProduct(customName, customCategory, customAllergen)
    setCustomName('')
    setSearch('')
  }

  if (!activeKit) return null

  return (
    <div className="catalog-panel catalog-panel--embedded" aria-label={t.catalogTitle}>
      <p className="catalog-panel__desc">{t.catalogDescription}</p>
      <p className="catalog-panel__meta">
        {t.catalogVisibleCount(trackedProducts.length, catalogProducts.length)}
      </p>

      <div className="catalog-panel__section">
        <h3 className="catalog-panel__heading">{t.catalogExcludeTitle}</h3>
        <input
          type="search"
          className="catalog-panel__search"
          placeholder={t.catalogSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t.catalogSearchPlaceholder}
        />
        {search.trim() && (
          <ul className="catalog-panel__matches">
            {catalogMatches.length === 0 ? (
              <li className="catalog-panel__empty">{t.catalogNoMatches}</li>
            ) : (
              catalogMatches.map((product) => (
                <li key={product.id} className="catalog-panel__row">
                  <span>{productName(product.id)}</span>
                  <button
                    type="button"
                    className="catalog-panel__btn catalog-panel__btn--muted"
                    onClick={() => {
                      excludeProduct(product.id)
                      setSearch('')
                    }}
                  >
                    {t.catalogExclude}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {excludedProducts.length > 0 && (
        <div className="catalog-panel__section">
          <h3 className="catalog-panel__heading">{t.catalogExcludedTitle}</h3>
          <ul className="catalog-panel__list">
            {excludedProducts.map((product) => (
              <li key={product.id} className="catalog-panel__row">
                <span className="catalog-panel__excluded-name">{productName(product.id)}</span>
                <button
                  type="button"
                  className="catalog-panel__btn"
                  onClick={() => includeProduct(product.id)}
                >
                  {t.catalogInclude}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="catalog-panel__section">
        <h3 className="catalog-panel__heading">{t.catalogCustomTitle}</h3>
        <p className="catalog-panel__hint">{t.catalogCustomHint}</p>
        <form className="catalog-panel__form" onSubmit={handleAddCustom}>
          <label className="catalog-panel__field">
            <span>{t.catalogCustomNameLabel}</span>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t.catalogCustomNamePlaceholder}
            />
          </label>
          <label className="catalog-panel__field">
            <span>{t.catalogCustomCategoryLabel}</span>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as FoodCategory)}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {t.categories[cat]}
                </option>
              ))}
            </select>
          </label>
          <label className="catalog-panel__checkbox">
            <input
              type="checkbox"
              checked={customAllergen}
              onChange={(e) => setCustomAllergen(e.target.checked)}
            />
            <span>{t.catalogCustomAllergen}</span>
          </label>
          <button type="submit" className="catalog-panel__btn catalog-panel__btn--primary">
            {t.catalogCustomAdd}
          </button>
        </form>

        {customProducts.length > 0 ? (
          <ul className="catalog-panel__list">
            {customProducts.map((product) => (
              <li key={product.id} className="catalog-panel__row">
                <span>
                  {getProductDisplayName(product.id)}
                  <span className={`category-chip category-chip--${product.category}`}>
                    {t.categories[product.category]}
                  </span>
                </span>
                <button
                  type="button"
                  className="catalog-panel__btn catalog-panel__btn--danger"
                  onClick={() => removeCustomProduct(product.id)}
                >
                  {t.catalogCustomRemove}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="catalog-panel__empty">{t.catalogCustomEmpty}</p>
        )}
      </div>
    </div>
  )
}
