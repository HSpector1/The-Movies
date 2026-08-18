// ── Development & Casting Annex V1 ─────────────────────────────────────────
// The complete deep-management construction surface. The Studio Lot also exposes
// the same bounded parameter-free action in-world; both surfaces read the core's
// studioConstructionView and this component continues formatting only.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameState, StudioConstructionView } from '../engine/adapter.ts'
import {
  startDevelopmentCastingAnnexAction,
  studioDevelopment,
} from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
// C2a-M2 §3.1 — the Scenery Shop's three verbs. This screen is already the deep
// "facilities & construction" surface and is already reachable from the Dashboard
// and from the lot, so the sets a studio builds belong beside the buildings it
// builds rather than behind a route of their own.
import { SceneryShopPanel } from '../components/SceneryShopPanel.tsx'

function statusLabel(view: StudioConstructionView): string {
  switch (view.status) {
    case 'legacy':
      return 'Unavailable'
    case 'vacant':
      return 'Vacant'
    case 'building':
      return 'Building'
    case 'operational':
      return 'Operational'
  }
}

function statusDetail(view: StudioConstructionView): string {
  switch (view.status) {
    case 'legacy':
      return 'This legacy studio has no managed expansion parcel. No facility or project history is inferred.'
    case 'vacant':
      return 'The fixed expansion parcel is open. Starting the Annex commits the full capital cost now.'
    case 'building':
      return `${view.completedAdvances} of ${view.durationWeeks} weekly advances complete · committed for Week ${view.dueWeek}.`
    case 'operational':
      return `Completed in Week ${view.completedWeek}. The additional shared Development & Casting slot is available now.`
  }
}

export function StudioDevelopmentPreview({
  state,
  onOpen,
}: {
  state: GameState
  onOpen?: () => void
}) {
  const view = useMemo(() => studioDevelopment(state), [state])
  return (
    <section
      className={`card development-preview development-${view.status}`}
      aria-labelledby="development-preview-heading"
      data-testid="studio-development-preview"
    >
      <div className="spread development-preview-heading">
        <div>
          <div className="eyebrow">Facilities &amp; construction · Week {view.currentWeek}</div>
          <h2 id="development-preview-heading">Studio Development</h2>
        </div>
        <span className={`tag ${view.status === 'building' ? 'warning' : 'fact'}`}>
          {statusLabel(view)}
        </span>
      </div>
      <div className="development-preview-grid">
        <div>
          <span className="hint">Expansion parcel</span>
          <strong>{view.status === 'legacy' ? 'Not managed' : statusLabel(view)}</strong>
        </div>
        <div>
          <span className="hint">Capital project</span>
          <strong>{moneyExact(view.capex)} · {view.durationWeeks} weeks</strong>
        </div>
        <div>
          <span className="hint">Development &amp; Casting capacity</span>
          <strong>
            {view.currentDevelopmentCastingCapacity}
            {view.status === 'vacant' ? ` → ${view.currentDevelopmentCastingCapacity + 1}` : ' slots'}
          </strong>
        </div>
      </div>
      <p className="hint" data-testid="development-preview-status">{statusDetail(view)}</p>
      <button
        type="button"
        className="accent"
        onClick={onOpen}
        disabled={!onOpen}
        data-testid="open-studio-development"
      >
        Open Studio Development
      </button>
    </section>
  )
}

export function StudioDevelopment({
  state,
  onChange,
  onBack,
}: {
  state: GameState
  onChange: (state: GameState) => void
  onBack: () => void
}) {
  const view = useMemo(() => studioDevelopment(state), [state])
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const statusRef = useRef<HTMLDivElement | null>(null)
  const ownerRef = useRef<HTMLElement | null>(null)
  const previousStatus = useRef(view.status)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    if (previousStatus.current === 'building' && view.status === 'operational') {
      setAnnouncement(
        `${view.name} is Operational. One shared Development and Casting slot is now available.`,
      )
    }
    previousStatus.current = view.status
  }, [view.name, view.status])

  function startConstruction() {
    const result = startDevelopmentCastingAnnexAction(state)
    if (!result.ok) {
      setAnnouncement(result.error)
      ownerRef.current?.focus()
      return
    }
    const nextView = studioDevelopment(result.next)
    onChange(result.next)
    setAnnouncement(
      `${moneyExact(nextView.capex)} committed to ${nextView.name}. Completion is due in Week ${nextView.dueWeek}.`,
    )
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  return (
    <main className="app-shell stack development-screen" data-testid="studio-development">
      <header className="spread card development-header">
        <div>
          <div className="eyebrow">Facilities &amp; construction · Week {view.currentWeek}</div>
          <h1 ref={headingRef} tabIndex={-1}>Studio Development</h1>
          <p className="hint">
            The studio&rsquo;s own plant: the fixed expansion parcel below, and the scenery its
            pictures are shot on.
          </p>
        </div>
        <button type="button" onClick={onBack} data-testid="development-back">Back to studio</button>
      </header>

      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <section
        ref={ownerRef}
        tabIndex={-1}
        className="card stack development-owner"
        aria-labelledby="development-annex-heading"
        data-testid={`development-state-${view.status}`}
      >
        <div className="spread development-title-row">
          <div>
            <div className="eyebrow">Expansion parcel · {view.parcelId ?? 'not owned'}</div>
            <h2 id="development-annex-heading">{view.name}</h2>
          </div>
          <span className={`tag ${view.status === 'building' ? 'warning' : 'fact'}`}>
            {statusLabel(view)}
          </span>
        </div>

        <div
          ref={statusRef}
          tabIndex={-1}
          className={`development-site development-site-${view.status}`}
          role="region"
          aria-label={`${view.name} ${statusLabel(view)}`}
          data-testid="development-site-status"
        >
          <div className="development-site-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>{statusLabel(view)}</strong>
            <p>{statusDetail(view)}</p>
          </div>
        </div>

        {view.status === 'vacant' && (
          <>
            <div className="development-facts" data-testid="development-vacant-facts">
              <div><span>Capital cost</span><strong>{moneyExact(view.capex)}</strong></div>
              <div><span>Construction clock</span><strong>{view.durationWeeks} weekly advances</strong></div>
              <div><span>Cash now</span><strong>{moneyExact(view.cash)}</strong></div>
              <div><span>Cash after</span><strong>{moneyExact(view.cashAfter)}</strong></div>
            </div>
            <p>{view.consequence}</p>
            <div className="development-action-row">
              <button
                type="button"
                className="primary"
                disabled={!view.canStart}
                onClick={startConstruction}
                aria-describedby="development-affordability"
                data-testid="start-development-casting-annex"
              >
                Build {view.name} · {moneyExact(view.capex)}
              </button>
              <p
                id="development-affordability"
                className={view.affordability.ok ? 'hint' : 'warn'}
                data-testid="development-affordability"
              >
                {view.affordability.ok
                  ? `Affordable now. The full ${moneyExact(view.capex)} is debited when construction starts.`
                  : view.affordability.reason}
              </p>
            </div>
          </>
        )}

        {view.status === 'building' && (
          <div className="stack" data-testid="development-building-facts">
            <div
              className="development-progress"
              role="progressbar"
              aria-label={`${view.name} construction progress: ${view.completedAdvances} of ${view.durationWeeks} weekly advances complete`}
              aria-valuemin={0}
              aria-valuemax={view.durationWeeks}
              aria-valuenow={view.completedAdvances}
            >
              <span style={{ width: `${(view.completedAdvances / view.durationWeeks) * 100}%` }} />
            </div>
            <strong data-testid="development-progress-text">
              {view.completedAdvances} of {view.durationWeeks} weekly advances complete
            </strong>
            <div className="development-facts">
              <div><span>Started</span><strong>Week {view.startedWeek}</strong></div>
              <div><span>Committed completion</span><strong>Week {view.dueWeek}</strong></div>
              <div><span>Advances remaining</span><strong>{view.remainingAdvances}</strong></div>
              <div><span>Capital committed</span><strong>{moneyExact(view.capex)}</strong></div>
            </div>
            <p className="hint">No second payment or weekly facility charge is due. There is no duplicate start action.</p>
          </div>
        )}

        {view.status === 'operational' && (
          <div className="stack" data-testid="development-operational-facts">
            <div className="development-facts">
              <div><span>Completed</span><strong>Week {view.completedWeek}</strong></div>
              <div><span>Facility</span><strong>{view.name}</strong></div>
              <div><span>Capacity gained</span><strong>+{view.completedCapacityGain} slot</strong></div>
              <div><span>Current shared capacity</span><strong>{view.currentDevelopmentCastingCapacity} slots</strong></div>
            </div>
            <p>{view.consequence}</p>
            <p className="hint">This project is complete and permanent. V1 has no upgrade, repeat, placement, or demolition action.</p>
          </div>
        )}

        {view.status === 'legacy' && (
          <p className="hint" data-testid="development-legacy-copy">{view.consequence}</p>
        )}
      </section>

      {/* C2a-M2 — the Scenery Shop. It renders itself away for a studio that runs no
          operations of its own, so a legacy studio's screen is unchanged. */}
      <SceneryShopPanel state={state} onChange={onChange} />

      <section className="card stack" aria-labelledby="development-boundary-heading">
        <h2 id="development-boundary-heading">What the Annex changes</h2>
        <p>
          It adds one shared Development &amp; Casting slot after completion. It does not raise the
          two-film production ceiling, shorten work, guarantee a release, or promise a profit.
        </p>
        <p className="hint">
          Existing payroll and studio overhead continue unchanged. Construction is a one-time
          studio capital investment and never becomes film commitment or recurring burn.
        </p>
      </section>
    </main>
  )
}
