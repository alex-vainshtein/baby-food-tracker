import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { getGuidelines } from '../storage/knowledgeBase'

export function FeedingGuidelines() {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const guidelines = getGuidelines(locale)

  return (
    <section className="guidelines" aria-label={t.guidelinesTitle}>
      <button
        type="button"
        className="guidelines__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{t.guidelinesTitle}</span>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="guidelines__body">
          <dl className="guidelines__list">
            <div>
              <dt>{t.guidelinesWhenToStart}</dt>
              <dd>{guidelines.whenToStart}</dd>
            </div>
            <div>
              <dt>{t.guidelinesPortion}</dt>
              <dd>{guidelines.portionSize}</dd>
            </div>
            <div>
              <dt>{t.guidelinesMilkSolids}</dt>
              <dd>{guidelines.milkAndSolids}</dd>
            </div>
            <div>
              <dt>{t.guidelinesHealthyPlate}</dt>
              <dd>{guidelines.healthyPlate}</dd>
            </div>
            <div>
              <dt>{t.guidelinesVariety}</dt>
              <dd>{guidelines.varietyGoal}</dd>
            </div>
          </dl>

          <h3 className="guidelines__subtitle">{t.guidelinesTextureTitle}</h3>
          <ul className="guidelines__texture">
            {Object.entries(guidelines.textureTimeline).map(([month, texture]) => (
              <li key={month}>{t.guidelinesTextureMonth(Number(month), texture)}</li>
            ))}
          </ul>

          <h3 className="guidelines__subtitle">{t.guidelinesForbiddenTitle}</h3>
          <ul className="guidelines__forbidden">
            {guidelines.forbidden.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
