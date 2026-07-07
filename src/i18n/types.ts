export type Locale = 'uk' | 'en' | 'es' | 'de'

export const LOCALES: Locale[] = ['uk', 'en', 'es', 'de']

export const LOCALE_LABELS: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
}

export const LOCALE_SHORT: Record<Locale, string> = {
  uk: 'UA',
  en: 'EN',
  es: 'ES',
  de: 'DE',
}

export const LANGUAGE_STORAGE_KEY = 'baby-food-tracker-lang'

export interface UiStrings {
  pageTitle: string
  pageSubtitle: string
  progressTitle: string
  progressCatalog: (total: number) => string
  searchPlaceholder: string
  searchAria: string
  categoryAria: string
  sortAria: string
  allCategories: string
  sortNameAsc: string
  sortNameDesc: string
  sortCountDesc: string
  sortCountAsc: string
  sortLastGivenDesc: string
  sortLastGivenAsc: string
  untriedOnly: string
  allergensOnly: string
  colProduct: string
  colCategory: string
  colCount: string
  colLast: string
  colActions: string
  emptyResults: string
  footerCount: (shown: number, total: number) => string
  allergenBadge: string
  giveToday: string
  givenToday: string
  decrementAria: (name: string) => string
  incrementAria: (name: string) => string
  languageAria: string
  syncTitle: string
  syncDescription: string
  syncCreate: string
  syncConnectLabel: string
  syncConnectPlaceholder: string
  syncConnect: string
  syncCodeLabel: string
  syncCopy: string
  syncCopied: string
  syncNow: string
  syncDisconnect: string
  syncHint: string
  syncStatusIdle: string
  syncStatusSyncing: string
  syncStatusSynced: string
  syncStatusError: string
  syncErrorInvalid: string
  syncErrorFailed: string
  lastGivenTooltip: (date: string, count: number) => string
  neverGivenTooltip: string
  syncToggleLabel: string
  syncInviteLabel: string
  syncInviteCopy: string
  syncInviteCopied: string
  defaultKitName: string
  kitSwitcherLabel: string
  kitSelectLabel: string
  kitAdd: string
  kitCancelAdd: string
  kitCreate: string
  kitNameLabel: string
  kitNamePlaceholder: string
  kitDobLabel: string
  kitAgeMonths: (months: number) => string
  kitSubtitle: (name: string) => string
  kitSubtitleWithAge: (name: string, months: number) => string
  categories: Record<string, string>
}
