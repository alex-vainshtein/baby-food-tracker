import { useMemo, useState } from 'react'
import { calcAgeInMonths } from '../storage/kitAge'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'

export function KitSwitcher() {
  const { t, locale } = useI18n()
  const { kits, activeKitId, activeKit, switchKit, addKit, updateActiveKit } = useKitTracker()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDob, setNewDob] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  const ageLabel = useMemo(() => {
    if (!activeKit?.dateOfBirth) return null
    const months = calcAgeInMonths(activeKit.dateOfBirth)
    if (months === null) return null
    return t.kitAgeMonths(months)
  }, [activeKit?.dateOfBirth, t])

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    setIsBusy(true)
    try {
      await addKit(newName, newDob)
      setNewName('')
      setNewDob('')
      setShowAddForm(false)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <section className="kit-switcher" aria-label={t.kitSwitcherLabel}>
      <div className="kit-switcher__row">
        <label className="kit-switcher__field">
          <span className="kit-switcher__label">{t.kitSelectLabel}</span>
          <select
            className="kit-switcher__select"
            value={activeKitId ?? ''}
            onChange={(e) => switchKit(e.target.value)}
          >
            {kits.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--ghost kit-switcher__add-btn"
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? t.kitCancelAdd : t.kitAdd}
        </button>
      </div>

      {activeKit && (
        <div className="kit-switcher__details">
          <label className="kit-switcher__field kit-switcher__field--grow">
            <span className="kit-switcher__label">{t.kitNameLabel}</span>
            <input
              className="kit-switcher__input"
              value={activeKit.name}
              onChange={(e) => updateActiveKit({ name: e.target.value })}
              placeholder={t.kitNamePlaceholder}
            />
          </label>
          <label className="kit-switcher__field">
            <span className="kit-switcher__label">{t.kitDobLabel}</span>
            <input
              className="kit-switcher__input kit-switcher__input--date"
              type="date"
              value={activeKit.dateOfBirth}
              onChange={(e) => updateActiveKit({ dateOfBirth: e.target.value })}
              lang={locale}
            />
          </label>
          {ageLabel && <span className="kit-switcher__age">{ageLabel}</span>}
        </div>
      )}

      {showAddForm && (
        <form className="kit-switcher__add-form" onSubmit={(e) => void handleAdd(e)}>
          <label className="kit-switcher__field kit-switcher__field--grow">
            <span className="kit-switcher__label">{t.kitNameLabel}</span>
            <input
              className="kit-switcher__input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.kitNamePlaceholder}
              required
              disabled={isBusy}
            />
          </label>
          <label className="kit-switcher__field">
            <span className="kit-switcher__label">{t.kitDobLabel}</span>
            <input
              className="kit-switcher__input kit-switcher__input--date"
              type="date"
              value={newDob}
              onChange={(e) => setNewDob(e.target.value)}
              disabled={isBusy}
              lang={locale}
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={isBusy || !newName.trim()}>
            {t.kitCreate}
          </button>
        </form>
      )}
    </section>
  )
}
