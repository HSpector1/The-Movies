// ── D-14 Phase 2 — the ONE reusable Talent Profile (drawer) ───────────────────
//
// A single canonical profile opened identically from the Studio Roster, Assemble a
// Film, and Film Autopsy. It reads visible values only (never hidden ceilings /
// potential / seeds) + the frozen career events (talentCareerHistory). It NEVER
// recomputes a delta. Focus is trapped, Escape closes, and focus is restored to the
// control that opened it — preserving the player's prior workflow context.

import { useEffect, useRef } from 'react'
import type { TalentProfile } from '../engine/adapter.ts'
import type { CareerImpactRow } from '../engine/careerImpact.ts'
import { CareerImpactCard } from './CareerImpact.tsx'
import { money } from '../format.ts'

export const STAR_POWER_DESCRIPTION = 'Commercial recognition and demonstrated audience drawing power.'

export function TalentProfileDrawer({
  profile,
  history,
  preV5Credits,
  onClose,
}: {
  profile: TalentProfile
  history: CareerImpactRow[]
  preV5Credits: number
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<Element | null>(null)

  useEffect(() => {
    openerRef.current = document.activeElement // remember the control that opened us
    const el = panelRef.current
    el?.querySelector<HTMLElement>('[data-testid="talent-profile-close"]')?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key === 'Tab' && el) {
        // simple focus trap
        const f = el.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex]:not([tabindex="-1"])')
        if (f.length === 0) return
        const first = f[0]!
        const last = f[f.length - 1]!
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      // restore focus to the originating control (workflow context preserved)
      ;(openerRef.current as HTMLElement | null)?.focus?.()
    }
  }, [onClose])

  const primary = profile.disciplines.find((d) => d.isPrimary) ?? profile.disciplines[0]
  const primaryGenres = profile.genreExperience[profile.primaryDiscipline] ?? []

  return (
    <div className="drawer-scrim" data-testid="talent-profile-scrim" onClick={onClose}>
      <div
        ref={panelRef}
        className="drawer talent-profile"
        role="dialog"
        aria-modal="true"
        aria-labelledby="talent-profile-name"
        data-testid="talent-profile"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-head">
          <div>
            <strong id="talent-profile-name" data-testid="talent-profile-name">
              {profile.name}
            </strong>
            <div className="hint" data-testid="talent-profile-identity">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} · {primary?.label ?? ''}
            </div>
          </div>
          <button type="button" className="ghost" data-testid="talent-profile-close" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Overview — the distinct axes a player must be able to tell apart. */}
        <div className="card">
          <table className="data" data-testid="talent-profile-overview">
            <tbody>
              <tr>
                <td>Overall craft (OVR)</td>
                <td data-testid="talent-profile-ovr">{primary?.ovr ?? 0}</td>
                <td className="hint">{primary?.tier ?? ''}</td>
              </tr>
              <tr>
                <td>Star Power</td>
                <td data-testid="talent-profile-starpower">{profile.fame.toFixed(1)}</td>
                <td className="hint">{STAR_POWER_DESCRIPTION}</td>
              </tr>
              <tr>
                <td>Work ethic</td>
                <td colSpan={2}>{profile.workEthicLabel}</td>
              </tr>
              <tr>
                <td>Salary</td>
                <td colSpan={2}>{money(profile.salary)} / film</td>
              </tr>
              <tr>
                <td>Status</td>
                <td colSpan={2} data-testid="talent-profile-status">
                  {profile.available
                    ? 'Available'
                    : profile.engagedIn
                      ? profile.assignmentKind === 'script'
                        ? profile.engagedIn
                        : `Engaged on ${profile.engagedIn}`
                      : 'Under contract'}
                </td>
              </tr>
              <tr>
                <td>Temperament</td>
                <td colSpan={2} className="hint">
                  {profile.temperament}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Role proficiencies — OVR per discipline (why "good at X, weak fit for Y" is possible). */}
        <div className="card">
          <div className="ci-label">Role proficiencies</div>
          <table className="data" data-testid="talent-profile-disciplines">
            <tbody>
              {profile.disciplines.map((d) => (
                <tr key={d.discipline} data-testid={`talent-profile-discipline-${d.discipline}`}>
                  <td>
                    {d.label}
                    {d.isPrimary ? ' (primary)' : ''}
                  </td>
                  <td>{d.ovr}</td>
                  <td className="hint">{d.unproven ? 'Unproven in this role' : d.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Genre strengths (primary discipline). */}
        {primaryGenres.length > 0 && (
          <div className="card">
            <div className="ci-label">Genre strengths</div>
            <table className="data" data-testid="talent-profile-genres">
              <tbody>
                {primaryGenres.map((g) => (
                  <tr key={g.genre}>
                    <td>{g.genre.charAt(0).toUpperCase() + g.genre.slice(1)}</td>
                    <td>{g.perceived}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Career history — reuses the SAME CareerImpactCard the Autopsy uses (film mode). */}
        <div className="career-history" data-testid="talent-profile-history">
          <h3>Career history</h3>
          {history.length === 0 ? (
            <div className="card" data-testid="talent-profile-history-empty">
              <p>No recorded career events yet.</p>
            </div>
          ) : (
            history.map((row) => <CareerImpactCard key={row.eventId} row={row} heading="film" />)
          )}
          {preV5Credits > 0 && (
            <div className="card" data-testid="talent-profile-history-notice">
              <p>
                Detailed progression history begins with SaveFileV5. {preV5Credits} earlier film credit
                {preV5Credits === 1 ? ' is' : 's are'} shown where available, but their career-impact deltas
                were not recorded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
