import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import productNamesData from '../../data/product-names.json'
import type { Locale, UiStrings } from './types'
import { LANGUAGE_STORAGE_KEY } from './types'
import { uk } from './locales/uk'
import { en } from './locales/en'
import { es } from './locales/es'
import { de } from './locales/de'

const UI: Record<Locale, UiStrings> = { uk, en, es, de }

const productNames = productNamesData as Record<string, Record<Locale, string>>

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'uk' || stored === 'en' || stored === 'es' || stored === 'de') {
      return stored
    }
  } catch {
    // ignore
  }
  return 'uk'
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: UiStrings
  productName: (id: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale)

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const productName = useCallback(
    (id: string) => productNames[id]?.[locale] ?? productNames[id]?.uk ?? id,
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: UI[locale],
      productName,
    }),
    [locale, setLocale, productName],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
