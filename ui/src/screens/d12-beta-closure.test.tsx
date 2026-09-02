// ── D-12 beta closure — regression coverage for the independent beta findings ──
// The headline finding: a film's Review/Commercial-Outlook forecast diverged from the
// forecast persisted at greenlight (≈$56M shown vs ≈$17M stored) when a SECOND film was
// greenlit the same week the first was still active. Root cause: predictedProductionId()
// returned the bare `prod-<tick>` id, but the engine allocator appends a collision-safe
// `-<k>` suffix for a same-week second greenlight — so Review previewed on forecast stream
// `prod-0014` while the engine persisted a forecast drawn from stream `prod-0014-1`.
// Invariant proven here: for identical package + state, Review forecast == persisted
// snapshot == Dashboard reading, for BOTH concurrent films incl. same-week greenlights.

import { describe, it, expect } from 'vitest'
import {
  greenlight,
  previewForecast,
  assessProfitRange,
  selectActiveProductions,
  predictedProductionId,
  requiredNegative,
  exportSaveJson,
  importSaveJson,
  advanceToNextEvent,
  releaseNewspaper,
  explainRelease,
  autopsyCompare,
  accessibleAutopsy,
  theatricalRuns,
  runProjection,
  releaseScorecard,
  selectReleasedFilms,
  filmCommittedCost,
  assemblyAvailability,
  advanceWeek,
  newGame,
  foundingApplicantCards,
  signContractAction,
  foundStudioAction,
  studioDecision,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState, CreativeRole } from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'
import { FOUNDING_MINIMUMS, applyActions } from '../../../src/core/index.ts'

// P06A (charter W1): a production HOLDS at remainingTicks===1 until the player commits
// it to release; commit any ready picture before an advancing tick so release-driving
// fixtures keep releasing under the truthful hold law. Commit advances no time.
function commitReady(s: GameState): GameState {
  const ready = selectActiveProductions(s).filter((p) => p.remainingTicks === 1)
  if (ready.length === 0) return s
  return applyActions(
    s,
    ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
  )
}
// For `advanceToNextEvent` walks: resolve every intervening 'releaseReview' stop by
// committing the named picture, then re-invoke to reach the stop the caller actually
// wants. Bounded — a failure to converge throws instead of spinning forever.
function advanceToNextEventCommitting(s: GameState) {
  let cur = s
  for (let i = 0; i < 60; i++) {
    const result = advanceToNextEvent(cur)
    cur = result.next
    const decision = studioDecision(cur)
    if (decision?.kind === 'releaseReview') {
      cur = applyActions(cur, [
        { kind: 'commitPictureToRelease' as const, productionId: decision.decision.productionId },
      ])
      continue
    }
    return result
  }
  throw new Error('advanceToNextEventCommitting: did not converge after 60 iterations')
}

// A studio founded with EXACTLY the legal minimum roster (enough for ONE film) — so greenlighting
// one film exhausts the team and a second cannot be staffed unless a freelancer is available.
function minimalFoundedGame(seed: string): GameState {
  let s = newGame(seed)
  const cards = foundingApplicantCards(s)
  const pick = (role: CreativeRole, n: number) =>
    cards.filter((c) => c.profile.role === role).slice(0, n).map((c) => c.profile.id)
  const toSign = [
    ...pick('actor', FOUNDING_MINIMUMS.actor),
    ...pick('director', FOUNDING_MINIMUMS.director),
    ...pick('writer', FOUNDING_MINIMUMS.writer),
    ...pick('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const id of toSign) {
    const r = signContractAction(s, id, 156)
    if (!r.ok) throw new Error(r.error)
    s = r.next
  }
  const f = foundStudioAction(s)
  if (!f.ok) throw new Error(f.error)
  return f.next
}

// A legal package from EXPLICIT roster slots so two concurrent films use disjoint talent.
function pkgFrom(
  state: GameState,
  slots: { writer: number; director: number; actors: [number, number, number]; craft: number; marketing?: number; vague?: boolean },
): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const w = foundedRosterIds(state, 'writer')
  const d = foundedRosterIds(state, 'director')
  const a = foundedRosterIds(state, 'actor')
  const c = foundedRosterIds(state, 'craft')
  // A WIDE promise → low specificity → the greenlight stores a `vaguePromise` uncertainty factor
  // (the exact case that produced the autopsy prose leak/contradiction the adversarial pass found).
  const r: [number, number] = slots.vague ? [-1, 1] : [-0.4, 0.4]
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: r, tonalWeight: r, kineticEnergy: r },
    },
    writerId: w[slots.writer]!,
    directorId: d[slots.director]!,
    craftIds: [c[slots.craft]!],
    cast: { lead: a[slots.actors[0]]!, antagonist: a[slots.actors[1]]!, support: a[slots.actors[2]]! },
    budget: { negative: requiredNegative(concept, shape, state), marketing: slots.marketing ?? 400_000 },
  }
}

describe('D-12 beta P1: Review forecast == persisted greenlight snapshot (same-week 2nd film)', () => {
  it('predictedProductionId matches the engine allocator, incl. the collision suffix', () => {
    const s0 = newFoundedGame('beta-fc-ids')
    // First film this week → base id.
    const g1 = greenlight(s0, pkgFrom(s0, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 }))
    expect(g1.ok).toBe(true)
    const s1 = (g1 as { ok: true; next: GameState }).next
    const [a] = selectActiveProductions(s1)
    // The SECOND film THIS SAME WEEK must be predicted with the collision-safe suffix — i.e.
    // exactly the id the engine will allocate. (Bug: predicted bare `prod-<tick>`.)
    const predictedB = predictedProductionId(s1)
    expect(predictedB).not.toBe(a!.id) // must not collide with the active film's id
    const g2 = greenlight(s1, pkgFrom(s1, { writer: 1, director: 1, actors: [3, 4, 5], craft: 1 }))
    expect(g2.ok).toBe(true)
    const s2 = (g2 as { ok: true; next: GameState }).next
    const b = selectActiveProductions(s2).find((p) => p.id !== a!.id)!
    expect(b.id).toBe(predictedB) // predicted id === actual allocated id
    // ids unique
    expect(new Set(selectActiveProductions(s2).map((p) => p.id)).size).toBe(2)
  })

  it('the second film’s Review forecast equals its persisted forecastSnapshot exactly', () => {
    const s0 = newFoundedGame('beta-fc-eq')
    const g1 = greenlight(s0, pkgFrom(s0, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 }))
    const s1 = (g1 as { ok: true; next: GameState }).next
    const pkgB = pkgFrom(s1, { writer: 1, director: 1, actors: [3, 4, 5], craft: 1, marketing: 1_200_000 })

    // What the player sees at Budget & Forecast / Review / Commercial Outlook for film B:
    const reviewForecast = previewForecast(s1, pkgB)
    const reviewProfit = assessProfitRange(s1, pkgB)

    // Greenlight B (same week the first is still active) → the engine persists B's snapshot.
    const g2 = greenlight(s1, pkgB)
    expect(g2.ok).toBe(true)
    const s2 = (g2 as { ok: true; next: GameState }).next
    const persistedB = selectActiveProductions(s2).find(
      (p) => p.id === predictedProductionId(s1),
    )!.forecastSnapshot

    // The forecast the player approved MUST equal the forecast that was persisted.
    expect(reviewForecast.expectedTotal).toBe(persistedB.expectedTotal)
    expect(reviewForecast.expectedOpening).toBe(persistedB.expectedOpening)
    expect(reviewForecast.expectedCriticScore).toBe(persistedB.expectedCriticScore)
    // Commercial-Outlook studio revenue is the SAME forecast's gross × share (no divergence).
    expect(reviewProfit.studioRevenue.expected).toBeCloseTo(
      persistedB.expectedTotal * (reviewProfit.studioRevenue.expected / reviewForecast.expectedTotal),
      6,
    )
    // And the two concurrent films carry DISTINCT forecasts (no cross-wiring).
    const a = selectActiveProductions(s2).find((p) => p.id !== predictedProductionId(s1))!
    expect(a.forecastSnapshot.expectedTotal).not.toBe(persistedB.expectedTotal)
  })

  // D-12 Phase 1 (owner directive): Sim to Next Event MUST stop when a theatrical run ends — the prior
  // "beta P2" behavior (treat run completion as routine, keep simming) was the overshoot bug (Week 22→131).
  it('P1: Sim to Next Event STOPS when a single theatrical run ends, applying the final payment once', () => {
    let s = newFoundedGame('beta-sim-runcomplete')
    s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
    const toRelease = advanceToNextEventCommitting(s)
    expect(toRelease.stopReason).toBe('release')
    s = toRelease.next
    expect(selectActiveProductions(s).length).toBe(0) // nothing in production
    const run = s.theatricalRuns.find((r) => r.status === 'active')!
    expect(run).toBeTruthy()

    // Sim again: the run finishes its remaining weeks — the sim now STOPS at the completion tick.
    const seg = advanceToNextEvent(s)
    expect(seg.stopReason).toBe('runCompleted')
    expect(seg.completedRuns.map((r) => r.productionId)).toContain(run.productionId)
    expect(seg.stopMessage).toMatch(/completed its theatrical run/)
    // Stopped PROMPTLY at the completion — did NOT overshoot into empty weeks (the Week 22→131 bug). The
    // run is detected even though it now sits in the collection with status 'completed' (not removed).
    expect(seg.weeks).toBeLessThanOrEqual(run.totalWeeks) // at most the run's remaining weeks, never ~100
    expect(seg.toWeek).toBeLessThan(run.releaseTick + run.totalWeeks + 2)
    expect(seg.guardHit).toBe(false)

    // Conservation: final payment applied exactly once; one Studio-Revenue ledger entry per run week.
    const finalRun = seg.next.theatricalRuns.find((r) => r.productionId === run.productionId)!
    expect(finalRun.status).toBe('completed')
    const totalGross = finalRun.weeklyGross.reduce((a, b) => a + b, 0)
    expect(finalRun.cumulativeStudioRevenuePaid).toBeCloseTo(totalGross * finalRun.studioShare, 4)
    const srEntries = seg.next.ledger.filter((e) => e.kind === 'studioRevenue' && e.productionId === run.productionId)
    expect(srEntries.length).toBe(finalRun.totalWeeks) // exactly one payment per week — none skipped/duplicated
  })

  it('P3: opening newspaper separates PAID-this-week from PROJECTED full-run totals', () => {
    let s = newFoundedGame('beta-news-open')
    s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0, marketing: 1_000_000 })) as { ok: true; next: GameState }).next
    const rel = advanceToNextEventCommitting(s)
    expect(rel.stopReason).toBe('release')
    const film = rel.released[0]!
    const f = releaseNewspaper(rel.next, film)!.financial
    // Only the opening week is banked; the rest is explicitly still to come.
    expect(f.studioRevenueThisWeek).toBeGreaterThan(0)
    expect(f.studioRevenueThisWeek).toBeLessThan(f.projectedTotalStudioRevenue)
    expect(f.studioRevenueStillToCome).toBeGreaterThan(0)
    expect(f.studioRevenueThisWeek + f.studioRevenueStillToCome).toBeCloseTo(f.projectedTotalStudioRevenue, 4)
    // Studio Revenue is the blended SHARE of gross, not the full gross.
    expect(f.projectedTotalStudioRevenue).toBeLessThan(f.projectedTotalGross)
    // The full-run contribution is explicitly PROJECTED, never presented as realized/banked.
    expect(f.projectedContributionLabel).toMatch(/^Projected/)
    expect(f.projectedContribution).toBeCloseTo(f.projectedTotalStudioRevenue - f.totalCommitment, 4)
  })

  it('P4: autopsy vocabulary — gross not called Revenue, brief coherence ≠ delivered alignment, no contradiction', () => {
    let s = newFoundedGame('beta-autopsy')
    s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
    const rel = advanceToNextEventCommitting(s)
    const film = rel.released[0]!
    const view = explainRelease(rel.preTick, rel.next.studio.standing, film)
    const simple = accessibleAutopsy(view, autopsyCompare(rel.preTick, film))

    // Financial terms: Total Theatrical Gross (revenue field) vs Studio Revenue (share) vs Contribution.
    expect(simple.studioRevenue).toBeGreaterThan(0)
    expect(simple.studioRevenue).toBeLessThan(simple.revenue) // studio share < full gross
    expect(simple.profit).toBeCloseTo(view.studioRevenue - view.committedCost, 4) // contribution = studioRev − cost

    const worked = simple.whatWorked.join(' ').toLowerCase()
    const hurt = simple.whatHurt.join(' ').toLowerCase()
    const allProse = [...simple.whatWorked, ...simple.whatHurt, ...simple.lessons, simple.biggestSurprise].join(' ').toLowerCase()
    // Delivered alignment must NOT be described as "creative cohesion" / blame the brief/shape/promise.
    expect(allProse).not.toContain('low creative cohesion')
    expect(allProse).not.toContain('muddled')
    // What Worked and What Hurt cannot BOTH claim a delivered-alignment verdict (mutually exclusive).
    const workedAlign = worked.includes('same direction')
    const hurtAlign = hurt.includes('different directions')
    expect(workedAlign && hurtAlign).toBe(false)
  })

  it('P4 (adversarial): a VAGUE-promise film never leaks raw factor detail or contradicts the brief', () => {
    // Scan several seeds so a `vaguePromise` factor actually materializes — the case that produced
    // "The promise is vague: vague promise: realized cohesion 0.45" in What Hurt (leak + contradiction).
    let checked = 0
    for (let i = 0; i < 30; i++) {
      let s = newFoundedGame(`beta-autopsy-vague-${i}`)
      s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0, vague: true })) as { ok: true; next: GameState }).next
      const rel = advanceToNextEventCommitting(s)
      const film = rel.released[0]
      if (!film) continue
      const view = explainRelease(rel.preTick, rel.next.studio.standing, film)
      const simple = accessibleAutopsy(view, autopsyCompare(rel.preTick, film))
      const worked = simple.whatWorked.join(' ').toLowerCase()
      const allProse = [...simple.whatWorked, ...simple.whatHurt, ...simple.lessons, simple.biggestSurprise].join(' ').toLowerCase()
      // No RAW internal detail leaks into player-facing prose.
      expect(allProse).not.toMatch(/realized cohesion|cohesion 0\.|vague promise:/)
      // No contradiction: never praise a coherent brief AND blame a vague promise in the same autopsy.
      const praisesBrief = worked.includes('coherent') && worked.includes('brief')
      const blamesPromiseVague = allProse.includes('promise is vague')
      expect(praisesBrief && blamesPromiseVague).toBe(false)
      checked++
    }
    expect(checked, 'at least one vague-promise film should have released and been inspected').toBeGreaterThan(0)
  })

  it('P5: an unstaffable second production blocks Assemble early with a film-named reason (no raw id)', () => {
    // A full roster can always assemble.
    expect(assemblyAvailability(newFoundedGame('beta-p5-full')).canAssemble).toBe(true)

    // A MINIMAL studio whose whole team is busy on its first film cannot staff a second — find a
    // seed where no substitute freelancer is available (the beta observed this dead end).
    let blocked: { state: GameState; reason: string; missing: CreativeRole[] } | null = null
    for (let i = 0; i < 80 && blocked === null; i++) {
      const s0 = minimalFoundedGame(`beta-p5-min-${i}`)
      const g = greenlight(s0, pkgFrom(s0, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 }))
      if (!g.ok) continue
      const s1 = g.next
      const avail = assemblyAvailability(s1)
      if (!avail.canAssemble) blocked = { state: s1, reason: avail.reason!, missing: avail.missingRoles }
    }
    expect(blocked, 'a minimal studio with its team busy should be unstaffable for a 2nd film').not.toBeNull()
    // Blocked EARLY with a specific, plain-English reason…
    expect(blocked!.reason).toBeTruthy()
    expect(blocked!.missing.length).toBeGreaterThan(0)
    // …that names the busy FILM, never a raw production id.
    expect(blocked!.reason).not.toMatch(/prod-\d/)
    expect(blocked!.reason).toMatch(/until it releases|under contract/)

    // Availability RESTORES once the film releases and frees the team.
    let s = blocked!.state
    for (let k = 0; k < 40 && !assemblyAvailability(s).canAssemble; k++) s = advanceWeek(commitReady(s)).next
    expect(assemblyAvailability(s).canAssemble).toBe(true)
  })

  it('save/reload preserves BOTH distinct concurrent forecasts', () => {
    const s0 = newFoundedGame('beta-fc-save')
    const s1 = (greenlight(s0, pkgFrom(s0, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
    const s2 = (greenlight(s1, pkgFrom(s1, { writer: 1, director: 1, actors: [3, 4, 5], craft: 1 })) as { ok: true; next: GameState }).next
    const before = selectActiveProductions(s2).map((p) => [p.id, p.forecastSnapshot.expectedTotal] as const).sort()
    const round = importSaveJson(exportSaveJson(s2))
    expect(round.ok).toBe(true)
    const reloaded = (round as { ok: true; state: GameState }).state
    const after = selectActiveProductions(reloaded).map((p) => [p.id, p.forecastSnapshot.expectedTotal] as const).sort()
    expect(after).toEqual(before)
  })
})

// ── D-12 Phase 7 — commercial strengths in "What worked" ──────────────────────────────────────────
// A profitable film must never show "Nothing stood out as a clear strength." — when it earned a positive
// Contribution for a COMMERCIAL reason (low break-even, audience positioning, cost discipline), the autopsy
// must name that reason, without inventing creative merit.
// ── D-12 Phase 5 — same-week standing attribution honesty ──────────────────────────────────────────
describe('D-12 P5: the studio-wide standing delta is labeled honestly when films share a release week', () => {
  it('a single-release week is not shared; a co-release is flagged and listed without changing the delta', () => {
    let s = newFoundedGame('p5-attr')
    s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
    const rel = advanceToNextEventCommitting(s)
    const film = rel.released[0]!
    // Single release → the delta is attributable to this film's week alone.
    const solo = explainRelease(rel.preTick, rel.next.studio.standing, film)
    expect(solo.standingSharedWeek).toBe(false)
    expect(solo.sameWeekReleases).toEqual([])
    expect(solo.releaseWeek).toBe(film.releaseTick)
    // The SAME week with a co-release → flagged as shared and the co-release is listed, but the studio-wide
    // delta itself is unchanged (it was always the week's studio-wide movement — we only label it honestly).
    const shared = explainRelease(rel.preTick, rel.next.studio.standing, film, [{ productionId: 'other-1', title: 'Another Film' }])
    expect(shared.standingSharedWeek).toBe(true)
    expect(shared.sameWeekReleases.map((r) => r.title)).toContain('Another Film')
    expect(shared.standingDeltas).toEqual(solo.standingDeltas) // same studio-wide number, honestly framed
  })
})

// ── D-12 Phase 6 — commercial result visibility (in-theaters projection + release scorecard) ────────
describe('D-12 P6: active-run projection and released-film scorecard are engine-derived and consistent', () => {
  it('an active run projects Contribution = full-run Studio Revenue − direct commitment, with a signed label', () => {
    let s = newFoundedGame('p6-run')
    s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
    s = advanceToNextEventCommitting(s).next // to the release → a run opens
    const runs = theatricalRuns(s)
    expect(runs.length).toBeGreaterThan(0)
    const run = runs[0]!
    const proj = runProjection(s, run)
    expect(proj.commitment).toBeCloseTo(filmCommittedCost(s, run.productionId), 4)
    expect(proj.projectedContribution).toBeCloseTo(run.totalStudioRevenue - proj.commitment, 4)
    expect(proj.label).toBe(proj.projectedContribution > 0 ? 'Projected profit' : proj.projectedContribution < 0 ? 'Projected loss' : 'Projected break-even')
  })

  it('a released film scorecard keeps profit, critics and audiences as separate, consistent truths', () => {
    let s = newFoundedGame('p6-card')
    s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
    for (let k = 0; k < 40 && selectReleasedFilms(s).length === 0; k++) s = advanceWeek(commitReady(s)).next
    const film = selectReleasedFilms(s)[0]!
    const card = releaseScorecard(s, film)
    expect(card.critic).toBe(film.criticScore) // critics unchanged
    expect(card.gross).toBe(film.boxOffice.total)
    expect(card.studioRevenue).toBeCloseTo(card.gross * 0.52, 2) // studio share applied once
    expect(card.contribution).toBeCloseTo(card.studioRevenue - filmCommittedCost(s, film.productionId), 2)
    expect(card.audience).toBeGreaterThanOrEqual(0)
    expect(card.audience).toBeLessThanOrEqual(100)
    // D-17A/T2: the scorecard now says whether the full-run figure has actually been banked.
    // The film released moments ago, so its run is still ACTIVE and the label carries
    // "Projected" — the sign logic is unchanged.
    expect(card.projected).toBe(true)
    expect(card.resultLabel).toBe(
      card.contribution > 0 ? 'Projected profit' : card.contribution < 0 ? 'Projected loss' : 'Projected break-even',
    )
    // Once the run finishes paying, the same figure is realized and drops the qualifier.
    let done = s
    for (let k = 0; k < 20 && releaseScorecard(done, film).projected; k++) done = advanceWeek(done).next
    const finished = releaseScorecard(done, film)
    expect(finished.projected).toBe(false)
    expect(finished.contribution).toBeCloseTo(card.contribution, 2)
    expect(finished.resultLabel).toBe(
      finished.contribution > 0 ? 'Profit' : finished.contribution < 0 ? 'Loss' : 'Break-even',
    )
  })
})

describe('D-12 P7: profitable films always get an engine-derived commercial strength', () => {
  it('a profitable release lists at least one commercial strength (never "Nothing stood out")', () => {
    let found = 0
    for (let i = 0; i < 30 && found < 3; i++) {
      let s = newFoundedGame(`p7-commercial-${i}`)
      s = (greenlight(s, pkgFrom(s, { writer: 0, director: 0, actors: [0, 1, 2], craft: 0 })) as { ok: true; next: GameState }).next
      const rel = advanceToNextEventCommitting(s)
      const film = rel.released[0]
      if (!film) continue
      const view = explainRelease(rel.preTick, rel.next.studio.standing, film)
      const simple = accessibleAutopsy(view, autopsyCompare(rel.preTick, film))
      if (view.profit >= 0) {
        found++
        expect(simple.whatWorked.length).toBeGreaterThan(0) // never empty for a profitable film
        const prose = simple.whatWorked.join(' ').toLowerCase()
        // At least one COMMERCIAL reason (break-even / audience positioning / spending discipline / profit).
        expect(prose).toMatch(/break-even|audience|positioning|spending|profit|opening/)
      }
    }
    expect(found).toBeGreaterThan(0) // the scan actually exercised profitable films
  })
})
