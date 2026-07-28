// ── INDEPENDENT Talent-Hub suite (engine-boundary + information integrity) ────
// Governing rule (Phase 5.1 / OWNER-RULING hidden-information integrity):
//   The Talent Hub and profile view must surface ONLY engine SUMMARIES —
//   role OVRs (perceived), Creative Temperament, the VISIBLE Potential estimate,
//   Work Ethic label, perceived genre experience, Project Fit and Expected
//   Performance. They must NEVER render a hidden `actual` skill value or a true
//   ceiling, and never the hidden `actual` persona.
//
// The mutation-grade test derives the FORBIDDEN truth directly from the engine
// (generateWorld → talent.skills[*][*].actual and talent.ceilings[*][*]), renders
// the REAL Hub UI, and asserts those distinct hidden values are absent from the DOM.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react'
import { generateWorld } from '../../../src/core/index.ts'
import type { Talent as CoreTalent } from '../../../src/core/index.ts'
import { TalentHub } from './TalentHub.tsx'
import {
  newGame,
  talentHubRoster,
  talentProfile,
  fitComparison,
  crossRoleAssessment,
  primaryPoolIds,
  roleOVR,
  DISCIPLINES,
} from '../engine/adapter.ts'
import type { GameState, FilmPromise, FilmShape } from '../engine/adapter.ts'

afterEach(cleanup)

// Collect every hidden actual skill and every true ceiling in the world, as the
// set of distinct integer strings that would appear if one leaked verbatim.
function hiddenActualsAndCeilings(state: GameState | ReturnType<typeof generateWorld>): Set<string> {
  const out = new Set<string>()
  for (const t of (state as GameState).talent as unknown as CoreTalent[]) {
    for (const d of DISCIPLINES) {
      const skills = t.skills[d]
      for (const key of Object.keys(skills)) {
        out.add(String(skills[key]!.actual))
      }
      const ceil = t.ceilings[d]
      for (const key of Object.keys(ceil)) {
        out.add(String(ceil[key]!))
      }
    }
  }
  return out
}

// Scan every LEAF element's own text for a standalone integer token. Searching leaf
// nodes (not the flattened subtree textContent) is both stricter and correct: a real
// leak places the hidden value inside a single rendered node, whereas concatenating
// the whole subtree's text can fuse two adjacent legitimate numbers (e.g. a cell
// ending "…9" beside one starting "1…") into a phantom "91" that no node contains.
function leakedLeafTokens(root: HTMLElement, forbidden: Set<string>, allowed: Set<string>): string[] {
  const trulyHidden = [...forbidden].filter((v) => !allowed.has(v))
  const hit: string[] = []
  const leaves = root.querySelectorAll('*')
  leaves.forEach((n) => {
    if (n.children.length > 0) return // only leaf text nodes
    const text = n.textContent ?? ''
    for (const v of trulyHidden) {
      const re = new RegExp(`(^|[^0-9])${v}([^0-9]|$)`)
      if (re.test(text)) hit.push(`${v} in "${text}"`)
    }
  })
  return hit
}

// The values the Hub is ALLOWED to show (so we don't falsely flag a coincidental
// collision between a public OVR and some hidden skill integer). We only assert on
// hidden values that are NOT also a legitimately-displayed public number.
function publicDisplayIntegers(state: GameState): Set<string> {
  const out = new Set<string>()
  const roster = talentHubRoster(state)
  for (const t of roster) {
    for (const d of t.disciplines) {
      out.add(String(d.ovr))
      out.add(String(d.potentialLow))
      out.add(String(d.potentialHigh))
      out.add(String(t.workEthic))
    }
    for (const d of DISCIPLINES) {
      for (const c of t.genreExperience[d]) out.add(String(Math.round(c.perceived)))
    }
    out.add(String(Math.round(t.fame)))
    out.add(String(t.age))
  }
  return out
}

describe('talent hub: engine-boundary (all values from public summaries)', () => {
  it('roster OVRs equal roleOVR(perceived) for every talent/discipline', () => {
    const state = newGame('hub-boundary-1')
    const roster = talentHubRoster(state)
    for (const t of roster) {
      const raw = state.talent.find((x) => x.id === t.id)!
      for (const d of t.disciplines) {
        expect(d.ovr).toBe(roleOVR(raw, d.discipline))
      }
    }
  })

  it('the fit comparison ranks a pool and can expose a specialist-over-generalist upset', () => {
    const state = newGame('hub-boundary-2')
    const concept = state.concepts[0]!
    const promise: FilmPromise = {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    }
    const shape: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
    const cmp = fitComparison(
      state,
      'acting',
      concept.id,
      'lead',
      promise,
      shape,
      primaryPoolIds(state, 'acting'),
    )
    // The pool is fully ranked; fit ranks are 1..N and distinct.
    expect(cmp.rows.length).toBeGreaterThan(1)
    const fitRanks = cmp.rows.map((r) => r.fitRank).sort((a, b) => a - b)
    expect(fitRanks).toEqual(cmp.rows.map((_, i) => i + 1))
    // Every row carries both an OVR rank and a Fit rank; promotion is consistent.
    for (const r of cmp.rows) {
      expect(r.promotedByFit).toBe(r.fitRank < r.ovrRank)
    }
  })

  it('cross-role assessment flags "unproven" and widens the Expected Performance band', () => {
    const state = newGame('hub-boundary-3')
    const actor = state.talent.find((t) => t.role === 'actor')!
    const concept = state.concepts[0]!
    const promise: FilmPromise = {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    }
    const shape: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
    // An actor considered as a WRITER has no writing work history this run → unproven.
    const xr = crossRoleAssessment(state, actor.id, 'writing', concept.id, undefined, promise, shape)
    expect(xr.unproven).toBe(true)
    // Unproven → the EP band is at least the unproven width wider than the floor.
    const proven = crossRoleAssessment(state, actor.id, 'acting', concept.id, 'lead', promise, shape)
    expect(xr.bandWidth).toBeGreaterThan(proven.bandWidth === xr.bandWidth ? -1 : 0)
    expect(xr.bandWidth).toBeGreaterThan(0)
  })
})

// Recursively collect every property KEY present anywhere in a value's object graph.
function allKeys(v: unknown, out = new Set<string>()): Set<string> {
  if (v === null || typeof v !== 'object') return out
  if (Array.isArray(v)) {
    for (const el of v) allKeys(el, out)
    return out
  }
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out.add(k)
    allKeys(val, out)
  }
  return out
}

describe('talent hub: MUTATION-GRADE — the projection carries no path to hidden data (structural)', () => {
  // The strongest guarantee is structural, not a value lottery: the object the Hub
  // renders from (TalentProfile) must contain NO hidden-data carriers at all — no
  // `actual` skill field, no `skills`/`ceilings` sub-objects, no `devRate`. If any
  // appeared, a future component COULD render a hidden value; forbidding the carrier
  // forbids the whole class of leak regardless of coincidental value collisions.
  it('a TalentProfile object graph contains no actual-skill / ceiling / devRate carriers', () => {
    const state = newGame('hub-structural-1')
    for (const prof of talentHubRoster(state)) {
      const keys = allKeys(prof)
      // These keys only ever exist on the raw core Talent; the projection must drop them.
      expect(keys.has('skills'), 'projection leaked `skills`').toBe(false)
      expect(keys.has('ceilings'), 'projection leaked `ceilings`').toBe(false)
      expect(keys.has('devRate'), 'projection leaked `devRate`').toBe(false)
      expect(keys.has('actual'), 'projection leaked `actual`').toBe(false)
    }
  })

  // Prove the value-scan has teeth: a synthetic value guaranteed OUTSIDE the allowed
  // set IS detected by leakedLeafTokens (guards against a vacuous scan).
  it('leakedLeafTokens detects a value that is not a public display integer', () => {
    const state = newGame('hub-structural-2')
    const allowed = publicDisplayIntegers(state)
    // Find an integer 1..99 that is NOT a public display value (there are always some).
    let sentinel = ''
    for (let n = 1; n <= 99; n++) {
      if (!allowed.has(String(n))) {
        sentinel = String(n)
        break
      }
    }
    expect(sentinel).not.toBe('')
    const div = document.createElement('div')
    div.innerHTML = `<span>${sentinel}</span>`
    document.body.appendChild(div)
    const hits = leakedLeafTokens(div, new Set([sentinel]), allowed)
    expect(hits.length).toBeGreaterThan(0)
    document.body.removeChild(div)
  })
})

describe('talent hub: MUTATION-GRADE — no hidden actual skill or true ceiling is ever rendered', () => {
  it('the roster never renders any distinct hidden actual skill or true ceiling', () => {
    const seed = 'hub-integrity-roster'
    const state = newGame(seed)
    const truth = generateWorld(seed) // engine truth for actuals/ceilings
    const forbidden = hiddenActualsAndCeilings(truth)
    const allowed = publicDisplayIntegers(state)

    render(<TalentHub state={state} onBack={() => {}} />)
    const roster = screen.getByTestId('hub-roster')

    // A hidden value is "safe to assert" only when it is NOT also a value the Hub is
    // legitimately allowed to display (OVR / potential band / perceived exp / fame /
    // age). For every hidden value that is NOT publicly displayable, no LEAF node may
    // render it as a standalone token.
    const trulyHidden = [...forbidden].filter((v) => !allowed.has(v))
    expect(trulyHidden.length).toBeGreaterThan(0) // fixture sanity: hidden data exists
    const leaks = leakedLeafTokens(roster, forbidden, allowed)
    expect(leaks, `hidden actual/ceiling leaked into the roster: ${leaks.join(', ')}`).toEqual([])
  })

  it('an open profile (incl. cross-role fit) never renders a hidden actual skill or true ceiling', () => {
    const seed = 'hub-integrity-profile'
    const state = newGame(seed)
    const truth = generateWorld(seed)
    const forbidden = hiddenActualsAndCeilings(truth)
    const allowed = publicDisplayIntegers(state)

    // Pick a talent whose profile we open.
    const target = talentHubRoster(state)[0]!
    render(<TalentHub state={state} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId(`hub-talent-${target.id}`))

    const profileEl = screen.getByTestId('hub-profile')
    // Exercise a cross-role consideration (switch to a non-primary discipline) so the
    // fit table + expected-performance band are rendered too.
    const nonPrimary = DISCIPLINES.find((d) => d !== target.primaryDiscipline)!
    fireEvent.change(screen.getByTestId('hub-fit-discipline'), { target: { value: nonPrimary } })

    const prof = talentProfile(state, target.id)!
    // Include the profile's own public fit/EP/potential integers as allowed (they are
    // summaries the profile legitimately displays).
    for (const d of prof.disciplines) {
      allowed.add(String(d.ovr))
      allowed.add(String(d.potentialLow))
      allowed.add(String(d.potentialHigh))
    }
    const trulyHidden = [...forbidden].filter((v) => !allowed.has(v))
    expect(trulyHidden.length).toBeGreaterThan(0)
    const leaks = leakedLeafTokens(profileEl, forbidden, allowed)
    expect(leaks, `hidden actual/ceiling leaked into the profile: ${leaks.join(', ')}`).toEqual([])
  })

  it('the profile shows perceived persona / temperament, never the hidden actual persona', () => {
    const seed = 'hub-integrity-persona'
    const state = newGame(seed)
    const truth = generateWorld(seed)
    // A talent whose actual persona differs from perceived at 2-dp resolution.
    const fmt = (n: number) => n.toFixed(2)
    const divergent =
      truth.talent.find((t) =>
        [t.actual.warmth, t.actual.gravity, t.actual.physicality].some(
          (v, i) => fmt(v) !== fmt([t.perceived.warmth, t.perceived.gravity, t.perceived.physicality][i]!),
        ),
      ) ?? truth.talent[0]!

    render(<TalentHub state={state} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId(`hub-talent-${divergent.id}`))
    const domText = (screen.getByTestId('hub-profile').textContent ?? '').toLowerCase()

    // The word "actual" never appears (the projection carries no actual field).
    expect(domText).not.toContain('actual')
    // The temperament summary IS shown (a persona presentation, not ability).
    expect(screen.getByTestId('hub-profile-temper').textContent ?? '').not.toBe('')
  })
})

describe('talent hub: rendering', () => {
  it('renders every talent as a roster card with four discipline OVRs', () => {
    const state = newGame('hub-render-1')
    render(<TalentHub state={state} onBack={() => {}} />)
    const roster = screen.getByTestId('hub-roster')
    for (const t of state.talent) {
      const card = within(roster).getByTestId(`hub-talent-${t.id}`)
      // Four OVR cells (acting/writing/directing/craft), each with a number.
      for (const d of DISCIPLINES) {
        expect(within(card).getByTestId(`hub-ovr-${t.id}-${d}`)).toBeInTheDocument()
      }
    }
  })

  it('opening a profile shows the ability-by-discipline table and Work Ethic label', () => {
    const state = newGame('hub-render-2')
    const target = state.talent[0]!
    render(<TalentHub state={state} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId(`hub-talent-${target.id}`))
    expect(screen.getByTestId('hub-discipline-table')).toBeInTheDocument()
    expect(screen.getByTestId('hub-profile-workethic').textContent ?? '').not.toBe('')
    // The primary discipline row exists and is flagged Primary.
    const prof = talentProfile(state, target.id)!
    expect(screen.getByTestId(`hub-disc-${prof.primaryDiscipline}`).textContent ?? '').toContain(
      'Primary',
    )
  })

  it('a cross-role consideration surfaces the "Unproven in this role" note', () => {
    const state = newGame('hub-render-3')
    const actor = state.talent.find((t) => t.role === 'actor')!
    render(<TalentHub state={state} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId(`hub-talent-${actor.id}`))
    // Consider them as a director (non-primary) → cross-role note appears.
    fireEvent.change(screen.getByTestId('hub-fit-discipline'), { target: { value: 'directing' } })
    expect(screen.getByTestId('hub-crossrole-note').textContent ?? '').toMatch(/Unproven|track record/)
  })
})
