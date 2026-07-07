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
  progressGoal: (tried: number, goal: number) => string
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
  kitEditLabel: string
  kitNameLabel: string
  kitNamePlaceholder: string
  kitDobLabel: string
  kitAgeMonths: (months: number) => string
  kitSubtitle: (name: string) => string
  kitSubtitleWithAge: (name: string, months: number) => string
  productGuidanceLabel: string
  productNotesLabel: string
  productNotesPlaceholder: string
  productNotesAria: (name: string) => string
  todaySummaryTitle: string
  todayGivenLabel: string
  todayGivenEmpty: string
  todayUntriedLabel: string
  todayUntriedEmpty: string
  dayRecFollowAge: string
  dayRecManualOverride: string
  dayRecTitle: string
  dayRecDayLabel: (day: number) => string
  dayRecPrevDay: string
  dayRecNextDay: string
  dayRecAllergen: (info: string) => string
  dayRecMorningTip: string
  dayRecTexture: (age: number, texture: string) => string
  dayRecNoDob: string
  dayRecFoodsLabel: string
  dayRecNew: string
  dayRecFocusUntried: (names: string) => string
  dayRecAllNew: string
  dayRecPlanComplete: string
  catalogToggleLabel: string
  catalogTitle: string
  catalogDescription: string
  catalogVisibleCount: (visible: number, total: number) => string
  catalogExcludeTitle: string
  catalogSearchPlaceholder: string
  catalogNoMatches: string
  catalogExclude: string
  catalogInclude: string
  catalogExcludedTitle: string
  catalogCustomTitle: string
  catalogCustomHint: string
  catalogCustomNameLabel: string
  catalogCustomNamePlaceholder: string
  catalogCustomCategoryLabel: string
  catalogCustomAllergen: string
  catalogCustomAdd: string
  catalogCustomEmpty: string
  catalogCustomRemove: string
  catalogExcludedRowTooltip: string
  guidelinesTitle: string
  guidelinesWhenToStart: string
  guidelinesPortion: string
  guidelinesMilkSolids: string
  guidelinesHealthyPlate: string
  guidelinesVariety: string
  guidelinesTextureTitle: string
  guidelinesTextureMonth: (month: number, texture: string) => string
  guidelinesForbiddenTitle: string
  allergenTrackerTitle: string
  allergenTrackerActive: string
  allergenTrackerUpcoming: string
  allergenTrackerDone: string
  allergenTrackerDays: (days: string) => string
  allergenTrackerDayDose: (day: number, dose: string) => string
  exportTitle: string
  exportJson: string
  exportCsv: string
  importLabel: string
  importButton: string
  importSuccess: string
  importError: string
  kitDelete: string
  kitDeleteConfirm: string
  syncLastSynced: (when: string) => string
  syncNeverSynced: string
  categories: Record<string, string>
}
