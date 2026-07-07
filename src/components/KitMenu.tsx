import { useEffect, useMemo, useRef, useState } from 'react'
import { LOCALES, LOCALE_SHORT, type Locale } from '../i18n/types'
import { calcAgeInMonths } from '../storage/kitAge'
import { buildInviteLink } from '../storage/syncApi'
import {
  downloadTextFile,
  kitExportToCsv,
  kitExportToJson,
  parseKitImport,
} from '../storage/kitExport'
import { useKitTracker } from '../hooks/KitTrackerContext'
import { useI18n } from '../i18n/I18nContext'
import { ProductCatalogPanel } from './ProductCatalogPanel'

function formatSyncAgo(ts: number, locale: string): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'minute')
  }
  if (mins < 60) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-mins, 'minute')
  }
  const hours = Math.floor(mins / 60)
  if (hours < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-hours, 'hour')
  }
  const days = Math.floor(hours / 24)
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-days, 'day')
}

export function KitMenu() {
  const { t, locale, setLocale, productName } = useI18n()
  const {
    kits,
    activeKitId,
    activeKit,
    syncStatus,
    syncError,
    switchKit,
    addKit,
    updateActiveKit,
    joinKitBySyncCode,
    syncNow,
    lastSyncedAt,
    deleteKit,
    importKitData,
  } = useKitTracker()

  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDob, setNewDob] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [importMessage, setImportMessage] = useState<'success' | 'error' | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const syncId = activeKit?.syncId ?? null
  const inviteLink = syncId ? buildInviteLink(syncId) : null

  const ageLabel = useMemo(() => {
    if (!activeKit?.dateOfBirth) return null
    const months = calcAgeInMonths(activeKit.dateOfBirth)
    if (months === null) return null
    return t.kitAgeMonths(months)
  }, [activeKit?.dateOfBirth, t])

  const statusLabel = (() => {
    switch (syncStatus) {
      case 'syncing':
        return t.syncStatusSyncing
      case 'synced':
        return t.syncStatusSynced
      case 'error':
        return t.syncStatusError
      default:
        return syncId ? t.syncStatusIdle : ''
    }
  })()

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

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

  async function handleConnect(event: React.FormEvent) {
    event.preventDefault()
    if (!inputCode.trim()) return
    setIsBusy(true)
    try {
      const ok = await joinKitBySyncCode(inputCode)
      if (ok) setInputCode('')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleCopyCode() {
    if (!syncId) return
    try {
      await navigator.clipboard.writeText(syncId)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Clipboard may be unavailable on some mobile browsers.
    }
  }

  async function handleCopyLink() {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Clipboard may be unavailable on some mobile browsers.
    }
  }

  function selectKit(kitId: string) {
    switchKit(kitId)
    setShowAddForm(false)
    setShowCatalog(false)
    setImportMessage(null)
  }

  function handleExportJson() {
    if (!activeKit) return
    const safeName = activeKit.name.replace(/[^\w.-]+/g, '_') || 'kit'
    downloadTextFile(
      `${safeName}-baby-food.json`,
      kitExportToJson(activeKit),
      'application/json',
    )
  }

  function handleExportCsv() {
    if (!activeKit) return
    const safeName = activeKit.name.replace(/[^\w.-]+/g, '_') || 'kit'
    downloadTextFile(
      `${safeName}-baby-food.csv`,
      kitExportToCsv(activeKit, (id) => productName(id)),
      'text/csv',
    )
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const data = parseKitImport(text)
      if (!data) {
        setImportMessage('error')
        return
      }
      const ok = importKitData(data)
      setImportMessage(ok ? 'success' : 'error')
    }
    reader.readAsText(file)
  }

  function handleDeleteKit() {
    if (!activeKit) return
    if (!window.confirm(t.kitDeleteConfirm)) return
    deleteKit(activeKit.id)
    setOpen(false)
  }

  const lastSyncedLabel = lastSyncedAt
    ? t.syncLastSynced(formatSyncAgo(lastSyncedAt, locale))
    : t.syncNeverSynced

  return (
    <div className="header-controls" ref={menuRef}>
      <div className={`kit-menu${open ? ' kit-menu--open' : ''}`}>
        <button
          type="button"
          className="kit-menu__trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className="kit-menu__trigger-name">{activeKit?.name ?? t.kitSelectLabel}</span>
          {ageLabel && <span className="kit-menu__trigger-age">{ageLabel}</span>}
          <span className="kit-menu__chevron" aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </button>

        {open && (
          <div className="kit-menu__panel" role="dialog" aria-label={t.kitSwitcherLabel}>
            <div className="kit-menu__kits">
              <p className="kit-menu__section-title">{t.kitSelectLabel}</p>
              <ul className="kit-menu__kit-list">
                {kits.map((kit) => (
                  <li key={kit.id}>
                    <button
                      type="button"
                      className={`kit-menu__kit-item${kit.id === activeKitId ? ' kit-menu__kit-item--active' : ''}`}
                      onClick={() => selectKit(kit.id)}
                    >
                      {kit.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="kit-menu__add-link"
                onClick={() => setShowAddForm((v) => !v)}
              >
                {showAddForm ? t.kitCancelAdd : t.kitAdd}
              </button>
            </div>

            {showAddForm ? (
              <form className="kit-menu__form" onSubmit={(e) => void handleAdd(e)}>
                <p className="kit-menu__section-title">{t.kitCreate}</p>
                <label className="kit-menu__field">
                  <span>{t.kitNameLabel}</span>
                  <input
                    className="kit-menu__input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.kitNamePlaceholder}
                    required
                    disabled={isBusy}
                  />
                </label>
                <label className="kit-menu__field">
                  <span>{t.kitDobLabel}</span>
                  <input
                    className="kit-menu__input"
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
            ) : (
              activeKit && (
                <div className="kit-menu__edit">
                  <p className="kit-menu__section-title">{t.kitEditLabel}</p>
                  <label className="kit-menu__field">
                    <span>{t.kitNameLabel}</span>
                    <input
                      className="kit-menu__input"
                      value={activeKit.name}
                      onChange={(e) => updateActiveKit({ name: e.target.value })}
                      placeholder={t.kitNamePlaceholder}
                    />
                  </label>
                  <label className="kit-menu__field">
                    <span>{t.kitDobLabel}</span>
                    <input
                      className="kit-menu__input"
                      type="date"
                      value={activeKit.dateOfBirth}
                      onChange={(e) => updateActiveKit({ dateOfBirth: e.target.value })}
                      lang={locale}
                    />
                  </label>
                  {ageLabel && <p className="kit-menu__age">{ageLabel}</p>}

                  <div className="kit-menu__catalog">
                    <button
                      type="button"
                      className="kit-menu__catalog-toggle"
                      onClick={() => setShowCatalog((v) => !v)}
                      aria-expanded={showCatalog}
                    >
                      <span>{t.catalogToggleLabel}</span>
                      <span aria-hidden="true">{showCatalog ? '▴' : '▾'}</span>
                    </button>
                    {showCatalog && <ProductCatalogPanel />}
                  </div>

                  <div className="kit-menu__export">
                    <p className="kit-menu__section-title">{t.exportTitle}</p>
                    <div className="kit-menu__export-row">
                      <button type="button" className="btn btn--ghost" onClick={handleExportJson}>
                        {t.exportJson}
                      </button>
                      <button type="button" className="btn btn--ghost" onClick={handleExportCsv}>
                        {t.exportCsv}
                      </button>
                    </div>
                    <label className="kit-menu__field">
                      <span>{t.importLabel}</span>
                      <div className="kit-menu__export-row">
                        <input
                          ref={importInputRef}
                          type="file"
                          accept="application/json,.json"
                          className="kit-menu__file"
                          onChange={handleImportFile}
                        />
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => importInputRef.current?.click()}
                        >
                          {t.importButton}
                        </button>
                      </div>
                    </label>
                    {importMessage === 'success' && (
                      <p className="kit-menu__import-ok">{t.importSuccess}</p>
                    )}
                    {importMessage === 'error' && (
                      <p className="kit-menu__error">{t.importError}</p>
                    )}
                  </div>

                  {kits.length > 1 && (
                    <button type="button" className="kit-menu__delete" onClick={handleDeleteKit}>
                      {t.kitDelete}
                    </button>
                  )}
                </div>
              )
            )}

            <div className="kit-menu__sync">
              <p className="kit-menu__section-title">{t.syncToggleLabel}</p>
              <p className="kit-menu__sync-desc">{t.syncDescription}</p>

              {syncId && (
                <>
                  <div className="kit-menu__sync-row">
                    <span className="kit-menu__sync-label">{t.syncCodeLabel}</span>
                    <code className="kit-menu__code">{syncId}</code>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => void handleCopyCode()}
                      disabled={isBusy}
                    >
                      {copiedCode ? t.syncCopied : t.syncCopy}
                    </button>
                  </div>

                  {inviteLink && (
                    <div className="kit-menu__invite">
                      <span className="kit-menu__sync-label">{t.syncInviteLabel}</span>
                      <div className="kit-menu__invite-row">
                        <input
                          className="kit-menu__invite-input"
                          value={inviteLink}
                          readOnly
                          onFocus={(e) => e.target.select()}
                        />
                        <button
                          type="button"
                          className="btn btn--primary"
                          onClick={() => void handleCopyLink()}
                          disabled={isBusy}
                        >
                          {copiedLink ? t.syncInviteCopied : t.syncInviteCopy}
                        </button>
                      </div>
                    </div>
                  )}

                  {statusLabel && (
                    <p className={`kit-menu__status kit-menu__status--${syncStatus}`} role="status">
                      {statusLabel}
                    </p>
                  )}

                  <p className="kit-menu__sync-time">{lastSyncedLabel}</p>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setIsBusy(true)
                      void syncNow().finally(() => setIsBusy(false))
                    }}
                    disabled={isBusy}
                  >
                    {t.syncNow}
                  </button>
                </>
              )}

              <form className="kit-menu__connect" onSubmit={(e) => void handleConnect(e)}>
                <label className="kit-menu__field" htmlFor="sync-code">
                  <span>{t.syncConnectLabel}</span>
                  <div className="kit-menu__connect-row">
                    <input
                      id="sync-code"
                      className="kit-menu__input kit-menu__input--code"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder={t.syncConnectPlaceholder}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={isBusy}
                    />
                    <button
                      type="submit"
                      className="btn btn--ghost"
                      disabled={isBusy || !inputCode.trim()}
                    >
                      {t.syncConnect}
                    </button>
                  </div>
                </label>
              </form>

              {syncError && (
                <p className="kit-menu__error" role="alert">
                  {syncError === 'invalid-code' ? t.syncErrorInvalid : t.syncErrorFailed}
                </p>
              )}

              <p className="kit-menu__hint">{t.syncHint}</p>
            </div>
          </div>
        )}
      </div>

      <label className="header-controls__lang">
        <span className="header-controls__lang-label">{t.languageAria}</span>
        <select
          className="header-controls__lang-select"
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
      </label>
    </div>
  )
}
