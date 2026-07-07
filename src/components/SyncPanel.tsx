import { useState } from 'react'
import type { SyncStatus } from '../hooks/useFoodTracker'
import { useI18n } from '../i18n/I18nContext'
import { SYNC_PANEL_COLLAPSED_KEY } from '../types'

interface SyncPanelProps {
  syncId: string | null
  syncStatus: SyncStatus
  syncError: string | null
  onCreateSync: () => Promise<string>
  onConnectSync: (code: string) => Promise<boolean>
  onDisconnectSync: () => void
  onSyncNow: () => Promise<void>
}

function loadCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(SYNC_PANEL_COLLAPSED_KEY)
    if (stored === null) return true
    return stored === 'true'
  } catch {
    return true
  }
}

function saveCollapsed(collapsed: boolean) {
  localStorage.setItem(SYNC_PANEL_COLLAPSED_KEY, String(collapsed))
}

export function SyncPanel({
  syncId,
  syncStatus,
  syncError,
  onCreateSync,
  onConnectSync,
  onDisconnectSync,
  onSyncNow,
}: SyncPanelProps) {
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(loadCollapsed)
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

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

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      saveCollapsed(next)
      return next
    })
  }

  async function handleCreate() {
    setIsBusy(true)
    try {
      await onCreateSync()
      setCollapsed(false)
      saveCollapsed(false)
    } finally {
      setIsBusy(false)
    }
  }

  async function handleConnect(event: React.FormEvent) {
    event.preventDefault()
    if (!inputCode.trim()) return
    setIsBusy(true)
    try {
      const ok = await onConnectSync(inputCode)
      if (ok) {
        setInputCode('')
        setCollapsed(false)
        saveCollapsed(false)
      }
    } finally {
      setIsBusy(false)
    }
  }

  async function handleCopy() {
    if (!syncId) return
    try {
      await navigator.clipboard.writeText(syncId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable on some mobile browsers.
    }
  }

  const summary = syncId
    ? `${syncId}${statusLabel ? ` · ${statusLabel}` : ''}`
    : t.syncDescription

  return (
    <section className={`sync-panel${collapsed ? ' sync-panel--collapsed' : ''}`}>
      <button
        type="button"
        className="sync-panel__toggle"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls="sync-panel-body"
      >
        <span className="sync-panel__toggle-text">
          <strong>{t.syncToggleLabel}</strong>
          {collapsed && <span className="sync-panel__summary">{summary}</span>}
        </span>
        <span className="sync-panel__chevron" aria-hidden="true">
          {collapsed ? '▸' : '▾'}
        </span>
      </button>

      <div id="sync-panel-body" className="sync-panel__body" hidden={collapsed}>
        {syncId ? (
          <div className="sync-panel__active">
            <div className="sync-panel__code-row">
              <span className="sync-panel__label">{t.syncCodeLabel}</span>
              <code className="sync-panel__code">{syncId}</code>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => void handleCopy()}
                disabled={isBusy}
              >
                {copied ? t.syncCopied : t.syncCopy}
              </button>
            </div>

            {statusLabel && (
              <p
                className={`sync-panel__status sync-panel__status--${syncStatus}`}
                role="status"
              >
                {statusLabel}
              </p>
            )}

            <div className="sync-panel__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setIsBusy(true)
                  void onSyncNow().finally(() => setIsBusy(false))
                }}
                disabled={isBusy}
              >
                {t.syncNow}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--danger"
                onClick={onDisconnectSync}
                disabled={isBusy}
              >
                {t.syncDisconnect}
              </button>
            </div>
          </div>
        ) : (
          <div className="sync-panel__setup">
            <p className="sync-panel__description">{t.syncDescription}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void handleCreate()}
              disabled={isBusy}
            >
              {t.syncCreate}
            </button>

            <form className="sync-panel__connect" onSubmit={(e) => void handleConnect(e)}>
              <label className="sync-panel__label" htmlFor="sync-code">
                {t.syncConnectLabel}
              </label>
              <div className="sync-panel__connect-row">
                <input
                  id="sync-code"
                  className="sync-panel__input"
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
            </form>
          </div>
        )}

        {syncError && (
          <p className="sync-panel__error" role="alert">
            {syncError === 'invalid-code' ? t.syncErrorInvalid : t.syncErrorFailed}
          </p>
        )}

        <p className="sync-panel__hint">{t.syncHint}</p>
      </div>
    </section>
  )
}
