import { LOCALES, LOCALE_SHORT, type Locale } from '../i18n/types'
import { useI18n } from '../i18n/I18nContext'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="language-switcher">
      <label className="language-switcher__label" htmlFor="lang-select">
        {t.languageAria}
      </label>
      <select
        id="lang-select"
        className="language-switcher__select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t.languageAria}
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_SHORT[loc]}
          </option>
        ))}
      </select>
    </div>
  )
}
