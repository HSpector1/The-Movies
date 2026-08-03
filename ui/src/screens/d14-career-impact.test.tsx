// ── D-14 Phase 2 — Career Impact UI (frozen-event presentation) ───────────────
// The UI renders ONLY frozen TalentCareerEvent records; it never recomputes a delta.

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import {
  applyActions,
  beginFounding,
  generateWorld,
  tick,
  TUNING,
} from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { filmCareerImpact, talentCareerHistory, translateReasons, deltaText } from '../engine/careerImpact.ts'
import { CareerImpact } from '../components/CareerImpact.tsx'

afterEach(cleanup)

function foundEngaged(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, actor: 3, craft: 1 }
  for (const role of ['actor', 'director', 'writer', 'craft'] as CreativeRole[]) {
    for (const t of pool.filter((x) => x.role === role).slice(0, need[role])) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
    }
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function releaseOneFilm(s0: GameState): { s: GameState; pid: string } {
  const c = s0.contracts.map((k) => s0.talent.find((t) => t.id === k.talentId)!)
  const actors = c.filter((t) => t.role === 'actor')
  const writer = c.find((t) => t.role === 'writer')!
  const director = c.find((t) => t.role === 'director')!
  const craft = c.find((t) => t.role === 'craft')!
  const concept = s0.concepts[0]!
  let s = applyActions(s0, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: writer.id,
        directorId: director.id,
        cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
        craftIds: [craft.id],
        budget: { negative: 5_000_000, marketing: 1_000_000 },
      },
    },
  ])
  const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 8; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === pid)
    if (run && run.status !== 'active') break
  }
  return { s, pid }
}

describe('D-14 Career Impact — data layer (frozen events)', () => {
  it('translateReasons never leaks raw machine reason codes', () => {
    const { s, pid } = releaseOneFilm(foundEngaged('ci-reasons'))
    const impact = filmCareerImpact(s, pid)
    expect(impact.available).toBe(true)
    if (!impact.available) return
    const RAW = ['substantialLeadExposure', 'supportingRoleVisibility', 'establishedStarSaturation', 'limitedAudienceReach']
    for (const row of impact.rows) {
      expect(row.reasons.length).toBeGreaterThan(0)
      for (const r of row.reasons) for (const raw of RAW) expect(r).not.toContain(raw)
    }
    // the underlying event carries machine codes (kept internal)
    const ev = s.careerEvents.find((e) => e.filmId === pid)!
    expect(translateReasons(ev).join(' ')).not.toContain('_')
  })

  it('a pre-V5 / no-event film is reported as unavailable (no invented history)', () => {
    const { s } = releaseOneFilm(foundEngaged('ci-unavail'))
    const impact = filmCareerImpact(s, 'does-not-exist')
    expect(impact.available).toBe(false)
  })

  it('deltaText is accessible (signed words, never colour-only)', () => {
    expect(deltaText(1.8, 1)).toBe('+1.8 increase')
    expect(deltaText(-2.0, 1)).toBe('−2.0 decrease')
    expect(deltaText(0.0, 1)).toBe('No change')
  })
})

describe('D-14 Career Impact — component', () => {
  it('1+2+3+4. renders every participant with frozen OVR + Star Power before→after', () => {
    const { s, pid } = releaseOneFilm(foundEngaged('ci-render'))
    const impact = filmCareerImpact(s, pid)
    if (!impact.available) throw new Error('expected events')
    render(<CareerImpact impact={impact} />)
    expect(screen.getByTestId('career-impact')).toBeInTheDocument()
    // every participant (writer, director, 3 cast, craft = 6) shown
    for (const row of impact.rows) {
      const card = screen.getByTestId(`career-impact-${row.talentId}`)
      const sp = within(card).getByTestId(`career-impact-starpower-${row.talentId}`)
      // frozen before + after both present, INDEPENDENTLY (not recomputed from a rounded delta)
      expect(sp.textContent).toContain(row.starPowerBefore.toFixed(1))
      expect(sp.textContent).toContain(row.starPowerAfter.toFixed(1))
      const ovr = within(card).getByTestId(`career-impact-ovr-${row.talentId}`)
      expect(ovr.textContent).toContain(String(row.ovrBefore))
      expect(ovr.textContent).toContain(String(row.ovrAfter))
    }
  })

  it('zero-delta participants remain visible with an explicit "No change"', () => {
    // A craft/writer with a tiny film reach often has ~0 Star Power delta — still shown.
    const { s, pid } = releaseOneFilm(foundEngaged('ci-zero'))
    const impact = filmCareerImpact(s, pid)
    if (!impact.available) throw new Error('expected events')
    render(<CareerImpact impact={impact} />)
    const zero = impact.rows.find((r) => !r.starPowerChanged)
    if (zero) {
      const sp = within(screen.getByTestId(`career-impact-${zero.talentId}`)).getByTestId(`career-impact-starpower-${zero.talentId}-delta`)
      expect(sp.textContent).toBe('No change')
    }
    // never fewer cards than participants (nobody hidden) — one name element per card
    expect(screen.getAllByTestId(/^career-impact-name-/).length).toBe(impact.rows.length)
  })

  it('a migrated film with no event shows the honest unavailable message', () => {
    render(<CareerImpact impact={{ available: false, filmId: 'old-film' }} />)
    expect(screen.getByTestId('career-impact-unavailable')).toBeInTheDocument()
    expect(screen.getByTestId('career-impact-unavailable').textContent).toContain('SaveFileV5')
  })

  it('talentCareerHistory returns the frozen events for one talent (most recent first)', () => {
    let { s } = releaseOneFilm(foundEngaged('ci-history'))
    const leadId = s.careerEvents.find((e) => e.role === 'lead')!.talentId
    const hist = talentCareerHistory(s, leadId)
    expect(hist.length).toBeGreaterThan(0)
    expect(hist.every((r) => r.talentId === leadId)).toBe(true)
  })
})
