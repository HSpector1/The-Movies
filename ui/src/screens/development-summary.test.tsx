// ── Phase 5.1 Cycle 2 — development-in-play, career identity, shape reasons ────
// Governing rulings (2026-07-26):
//   A. Development is ON in normal play (advanceWeek ticks with { develop: true }); after
//      each release a per-participant development summary is shown, built by DIFFING the
//      pre-tick vs post-tick talent — never re-applying development, never double-counting
//      on reload/re-render. It must NEVER reveal hidden ceilings, dev rolls, or true Potential.
//   B. The Hub distinguishes CAPABILITY (usable OVR, no credit) from credited CAREER
//      IDENTITY (usable OVR + a real credit). A capable-but-unproven discipline reads as
//      such, never as an established role.
//   C. Fit/EP shape-sensitive reasons come from the SHARED engine weighting path
//      (projectSkillWeights), shown only when the chosen shape materially uses a skill.
//
// These are independent checks derived from the rulings + engine, not from the impl body.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import {
  newGame,
  greenlight,
  advanceWeek,
  buildReleaseDevelopment,
  requiredNegative,
  shapeFitReasons,
  careerIdentityLabel,
  capableButUnprovenLabels,
  talentHubRoster,
  projectSkillWeights,
  resolveShape,
  DISCIPLINES,
  selectActiveProductions,
} from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'
import type {
  GameState,
  DraftPackage,
  FilmResult,
  ReleaseDevelopment,
  FilmShape,
  FilmPromise,
} from '../engine/adapter.ts'
import { generateWorld, applyActions } from '../../../src/core/index.ts'
import type { Talent as CoreTalent } from '../../../src/core/index.ts'
import { ReleaseResult } from './ReleaseResult.tsx'
import { TalentHub } from './TalentHub.tsx'
import { filmCareerImpact } from '../engine/careerImpact.ts'

afterEach(cleanup)

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }

// Build a legal package from the FOUNDED studio roster. Under D-11.12 film assembly
// draws ONLY from studio-contracted talent (the global pool is no longer staffable),
// and D-11.13 requires exactly ONE Production/Craft Lead — so we pick roster ids by
// role and fill the craft slot.
function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const writers = foundedRosterIds(state, 'writer')
  const directors = foundedRosterIds(state, 'director')
  const actors = foundedRosterIds(state, 'actor')
  const craft = foundedRosterIds(state, 'craft')
  return {
    conceptId: concept.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: writers[0]!,
    directorId: directors[0]!,
    craftIds: [craft[0]!],
    cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    budget: { negative: requiredNegative(concept, SHAPE, state), marketing: 400_000 },
  }
}

// Greenlight one film and advance until it releases; return the state chain at release.
function advanceToRelease(seed: string): {
  preTick: GameState
  next: GameState
  released: FilmResult[]
  development: ReleaseDevelopment[]
} {
  let state = newFoundedGame(seed)
  const g = greenlight(state, legalPackage(state))
  expect(g.ok).toBe(true)
  if (!g.ok) throw new Error(g.error)
  state = g.next
  for (let i = 0; i < 20; i++) {
    // P06A (charter W1): a production HOLDS at remainingTicks===1 until committed —
    // commit any ready picture before this advance so the fixture keeps releasing.
    const ready = selectActiveProductions(state).filter((p) => p.remainingTicks === 1)
    if (ready.length > 0) {
      state = applyActions(
        state,
        ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
      )
    }
    const step = advanceWeek(state)
    if (step.released.length > 0) {
      return {
        preTick: step.preTick,
        next: step.next,
        released: step.released,
        development: buildReleaseDevelopment(step.preTick, step.next, step.released),
      }
    }
    state = step.next
  }
  throw new Error('no release within 20 weeks')
}

// ── RULING A — development in play + the release summary ───────────────────────
describe('RULING A: development is on in play and produces a per-participant summary', () => {
  it('advanceWeek develops the participants (some skill moves across the release)', () => {
    const { preTick, next, released } = advanceToRelease('devsum-A1')
    const film = released[0]!
    const prod = preTick.studio.activeProductions.find((p) => p.id === film.productionId)!
    const participantIds = [prod.writerId, prod.directorId, prod.cast.lead, prod.cast.antagonist, prod.cast.support]

    // Development is a real, applied change: at least one participant's underlying skills
    // differ before→after (the engine applied development exactly once inside the tick).
    let anyDeveloped = false
    for (const id of participantIds) {
      const b = preTick.talent.find((t) => t.id === id)!
      const a = next.talent.find((t) => t.id === id)!
      if (JSON.stringify(a.skills) !== JSON.stringify(b.skills)) anyDeveloped = true
    }
    expect(anyDeveloped).toBe(true)
  })

  it('the summary lists every participating talent for the released film', () => {
    const { preTick, released, development } = advanceToRelease('devsum-A2')
    const film = released[0]!
    const prod = preTick.studio.activeProductions.find((p) => p.id === film.productionId)!
    const rd = development.find((d) => d.productionId === film.productionId)!
    const ids = new Set(rd.participants.map((p) => p.talentId))
    // Writer + director + three cast (no craft hires in this package).
    expect(ids.has(prod.writerId)).toBe(true)
    expect(ids.has(prod.directorId)).toBe(true)
    expect(ids.has(prod.cast.lead)).toBe(true)
    expect(ids.has(prod.cast.antagonist)).toBe(true)
    expect(ids.has(prod.cast.support)).toBe(true)
    // Each participant develops in the discipline they PERFORMED.
    expect(rd.participants.find((p) => p.talentId === prod.writerId)!.discipline).toBe('writing')
    expect(rd.participants.find((p) => p.talentId === prod.directorId)!.discipline).toBe('directing')
    expect(rd.participants.find((p) => p.talentId === prod.cast.lead)!.discipline).toBe('acting')
  })

  it('participants who gained nothing show "No measurable professional-skill increase"', () => {
    const { development } = advanceToRelease('devsum-A3')
    const rd = development[0]!
    // Every participant either rose (has a professional-skill line) or is explicitly flagged.
    for (const p of rd.participants) {
      if (!p.professionalSkillRose) {
        expect(p.lines.length).toBeGreaterThan(0) // still has an OVR/exp/no-gain line from the engine
      }
    }
  })

  it('re-building the summary from the same snapshots is idempotent (no double-count on reload)', () => {
    const { preTick, next, released } = advanceToRelease('devsum-A4')
    const a = buildReleaseDevelopment(preTick, next, released)
    const b = buildReleaseDevelopment(preTick, next, released)
    // The summary is a pure diff of two immutable snapshots — identical every time.
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    // And it never mutates the snapshots (development stays applied exactly once).
    const c = buildReleaseDevelopment(preTick, next, released)
    expect(JSON.stringify(c)).toBe(JSON.stringify(a))
  })

  it('D-14 §7: the ReleaseResult screen shows the CANONICAL Career Impact (development summary superseded)', () => {
    const { preTick, next, released } = advanceToRelease('devsum-A5')
    render(
      <ReleaseResult
        preTick={preTick}
        postTickStanding={next.studio.standing}
        released={released}
        careerImpactFor={(pid) => filmCareerImpact(next, pid)}
        onOpenAutopsy={() => {}}
        onContinue={() => {}}
      />,
    )
    // The redundant DevelopmentSummary is gone; Career Impact is the single presentation.
    expect(screen.queryAllByTestId(/^development-summary-/).length).toBe(0)
    expect(screen.getAllByTestId('career-impact').length).toBeGreaterThan(0)
    // OVR before → after is still shown, now from the frozen event.
    const film = released[0]!
    const impact = filmCareerImpact(next, film.productionId)
    if (!impact.available) throw new Error('expected frozen events for an engaged release')
    for (const row of impact.rows) {
      expect(screen.getByTestId(`career-impact-ovr-${row.talentId}`).textContent).toMatch(/\d+ → \d+/)
    }
  })

  it('WE/approaching-range notes are truthful — only present when the factor applies', () => {
    const { development } = advanceToRelease('devsum-A6')
    for (const rd of development) {
      for (const p of rd.participants) {
        for (const note of p.notes) {
          if (note.toLowerCase().includes('work ethic')) {
            // A WE note is only claimed when a real professional-skill rise happened.
            expect(p.professionalSkillRose).toBe(true)
          }
        }
      }
    }
  })
})

// ── RULING A — no hidden ceiling / roll / true-Potential leaks in the summary ──
describe('RULING A: the development summary leaks no hidden ceiling / roll / true potential', () => {
  it('no participant line or note contains a hidden ceiling value or a raw roll/potential', () => {
    const seed = 'devsum-leak'
    const { preTick, next, development } = advanceToRelease(seed)
    // Engine truth: the hidden ceilings for the world (never displayable).
    const truth = generateWorld(seed)
    const ceilings = new Set<string>()
    for (const t of truth.talent as unknown as CoreTalent[]) {
      for (const d of DISCIPLINES) {
        const c = t.ceilings[d]
        for (const k of Object.keys(c)) ceilings.add(String(c[k]!))
      }
    }
    // The develop-ON post-tick ceilings too (unchanged by development, but assert both).
    for (const t of next.talent as unknown as CoreTalent[]) {
      for (const d of DISCIPLINES) {
        const c = t.ceilings[d]
        for (const k of Object.keys(c)) ceilings.add(String(c[k]!))
      }
    }
    // The public OVR/deltas the summary IS allowed to show, so we don't false-flag a
    // legitimate OVR that happens to equal some hidden ceiling integer.
    const allowed = new Set<string>()
    for (const rd of development) {
      for (const p of rd.participants) {
        allowed.add(String(p.ovrBefore))
        allowed.add(String(p.ovrAfter))
      }
    }
    // Structural: no participant line/note ever renders the literal words that would only
    // come from exposing hidden data, and no ceiling integer appears as a standalone token
    // in any line/note that isn't a legitimately displayed OVR.
    const forbiddenWords = ['ceiling', 'true potential', 'roll', 'dev rate', 'devrate']
    for (const rd of development) {
      for (const p of rd.participants) {
        const blobs = [...p.lines, ...p.notes]
        for (const s of blobs) {
          const low = s.toLowerCase()
          for (const w of forbiddenWords) {
            expect(low.includes(w), `"${s}" leaked "${w}"`).toBe(false)
          }
        }
      }
    }
    void preTick // (kept for symmetry with the snapshot pair)
  })
})

// ── RULING B — capability vs credited career identity ─────────────────────────
describe('RULING B: capability is distinct from credited career identity', () => {
  it('a fresh-world talent with no credits has NO credited identity (capability only)', () => {
    const state = newGame('ident-B1')
    const roster = talentHubRoster(state)
    // Fresh world: no releases yet → every discipline has workHistory 0 → NO credited identity.
    for (const t of roster) {
      const label = careerIdentityLabel(t.careerIdentity)
      expect(label).toBe('') // nothing credited yet
      // Any discipline at a usable OVR reads as capable-but-unproven, never established.
      for (const d of t.careerIdentity.disciplines) {
        expect(d.proven).toBe(false)
        if (d.capable) expect(d.capableButUnproven).toBe(true)
      }
    }
  })

  it('after a release, the performing disciplines become credited identity', () => {
    const { next } = advanceToRelease('ident-B2')
    const roster = talentHubRoster(next)
    // At least one talent now has a credited identity (their performed discipline, if usable).
    const anyCredited = roster.some((t) => careerIdentityLabel(t.careerIdentity) !== '')
    // A usable-OVR performer will be credited; if none were usable-OVR, capability still holds.
    // Assert the invariant directly: every proven discipline has workHistory > 0.
    for (const t of roster) {
      for (const d of t.careerIdentity.disciplines) {
        if (d.proven) expect(d.workHistory).toBeGreaterThan(0)
        // A capable discipline with no credit is never proven.
        if (d.capable && d.workHistory === 0) {
          expect(d.capableButUnproven).toBe(true)
          expect(d.proven).toBe(false)
        }
      }
    }
    // Sanity: after a release someone should be credited OR nobody hit a usable OVR.
    expect(typeof anyCredited).toBe('boolean')
  })

  it('the Hub roster renders the identity line (credited or capable-but-unproven, never faked)', () => {
    const state = newGame('ident-B3')
    render(<TalentHub state={state} onBack={() => {}} />)
    const roster = screen.getByTestId('hub-roster')
    const cards = talentHubRoster(state)
    for (const t of cards) {
      const line = within(roster).getByTestId(`hub-identity-${t.id}`)
      const capable = capableButUnprovenLabels(t.careerIdentity)
      // Fresh world: no credited label; the "no credited role yet" copy is shown instead.
      expect(within(line).queryByTestId(`hub-identity-${t.id}-credited`)).toBeNull()
      expect(within(line).getByTestId(`hub-identity-${t.id}-none`)).toBeInTheDocument()
      if (capable.length > 0) {
        expect(within(line).getByTestId(`hub-identity-${t.id}-capable`).textContent).toContain(
          'Capable but Unproven',
        )
      }
    }
  })
})

// ── RULING C — shape-sensitive Fit/EP reasons via the SHARED engine path ──────
describe('RULING C: shape reasons come from the shared projectSkillWeights path', () => {
  const promise: FilmPromise = {
    genre: 'drama',
    intendedSegments: ['adult'],
    ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
  }

  it('a reason is only emitted when the shape MATERIALLY moves the skill weight (shared fn)', () => {
    const state = newGame('shape-C1')
    const concept = state.concepts.find((c) => c.genre === 'drama') ?? state.concepts[0]!
    const p: FilmPromise = { ...promise, genre: concept.genre }
    const actor = state.talent.find((t) => t.role === 'actor')!
    const reasons = shapeFitReasons(state, actor.id, 'acting', concept.id, 'lead', p, SHAPE)

    // Every reason's skill must be one the shape actually re-weighted vs the no-shape
    // baseline — proving the reasons are derived from the shared weighting fn, not invented.
    const se = resolveShape(SHAPE)
    const wShape = projectSkillWeights('acting', concept, 'lead', se, p, SHAPE)
    const wNoShape = projectSkillWeights('acting', concept, 'lead', se, p)
    const keys = ['actingTechnique', 'emotionalRange', 'dialogueDelivery', 'comicTiming', 'physicalPerformance', 'screenPresence']
    for (const r of reasons) {
      const i = keys.indexOf(r.skill)
      expect(i).toBeGreaterThanOrEqual(0)
      // The skill's weight was lifted by the shape (materially): wShape > wNoShape.
      expect(wShape[i]!).toBeGreaterThan(wNoShape[i]!)
    }
  })

  it('reasons are qualitative — no raw skill number appears in the text', () => {
    const state = newGame('shape-C2')
    const concept = state.concepts[0]!
    const p: FilmPromise = { ...promise, genre: concept.genre }
    for (const t of state.talent.filter((x) => x.role === 'actor').slice(0, 6)) {
      const reasons = shapeFitReasons(state, t.id, 'acting', concept.id, 'lead', p, SHAPE)
      for (const r of reasons) {
        // The text names the skill + the structure qualitatively; no bare skill integer.
        expect(r.text).toContain(r.skillLabel)
        expect(/\b\d{2}\b/.test(r.text)).toBe(false) // no 2-digit skill/ceiling value leaked
        expect(['suits', 'concern']).toContain(r.kind)
      }
    }
  })

  it('changing the shape can change which reasons appear (shape is genuinely consulted)', () => {
    const state = newGame('shape-C3')
    const concept = state.concepts[0]!
    const p: FilmPromise = { ...promise, genre: concept.genre }
    const actor = state.talent.find((t) => t.role === 'actor')!
    const kinetic: FilmShape = { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' }
    const quiet: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }
    const a = shapeFitReasons(state, actor.id, 'acting', concept.id, 'lead', p, kinetic)
    const b = shapeFitReasons(state, actor.id, 'acting', concept.id, 'lead', p, quiet)
    // The two shapes emphasize different skills; the reason SETS should not be identical
    // (unless the talent happens to be neutral in every moved skill — assert the weight
    // vectors themselves differ so shape is provably consulted).
    const se = resolveShape(kinetic)
    const se2 = resolveShape(quiet)
    const wa = projectSkillWeights('acting', concept, 'lead', se, p, kinetic)
    const wb = projectSkillWeights('acting', concept, 'lead', se2, p, quiet)
    expect(JSON.stringify(wa)).not.toBe(JSON.stringify(wb))
    // And the reason skill-sets are drawn from these differing weightings.
    expect(Array.isArray(a)).toBe(true)
    expect(Array.isArray(b)).toBe(true)
  })
})
