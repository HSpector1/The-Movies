// ── D-17A/T10 (UI half) — the adapter's ECONOMIC regime is the persisted fact ───
// Phase E made `economyEngaged(state)` a persisted, monotonic gameplay fact and repointed the
// core's own regime reads to it. This test pins the UI half: after the engagement cliff (the
// last contract expires / everyone is released) every ECONOMIC read-model in the adapter must
// still report the engaged regime.
//
// Regression guard for the R2 defect: the pre-D-17A adapter read `employmentEngaged` for both,
// so an empty roster silently re-scaled the forecast, the marketing capacity, and the autopsy.
//
// D-17A FIX-PASS: the STAFFING/PRICING surfaces are on the persisted fact too. The earlier
// version of this file blessed the open-pool fallback post-cliff as "deliberately unchanged";
// that was the D-1 basis the engine had already stopped using, so the wizard offered packages
// `applyGreenlight` then refused (D-11.12). `employmentEngaged` survives only as the
// roster-informational selector, and the third test below pins ACTION PARITY: either the gate
// says no with named missing roles, or every package the UI can build actually greenlights.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  economyEngaged,
  employmentEngaged,
  freelancerFee,
  generateWorld,
  isContracted,
} from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState, Talent } from '../../../src/core/index.ts'
import {
  assemblyAvailability,
  assignmentProjectCost,
  freelancerPool,
  greenlight,
  marketingEfficiency,
  previewForecast,
  studioPool,
  totalCommittedCost,
  isEconomyEngaged,
  isEmploymentEngaged,
} from './adapter.ts'
import type { DraftPackage } from './adapter.ts'

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

function packageFor(state: GameState): DraftPackage {
  const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[0]!
  const byRole = (r: CreativeRole) => state.talent.filter((t) => t.role === r)
  const actors = byRole('actor')
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
    writerId: byRole('writer')[0]!.id,
    directorId: byRole('director')[0]!.id,
    craftIds: [byRole('craft')[0]!.id],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 400_000 },
  }
}

describe('D-17A/T10 — adapter economic regime survives the engagement cliff', () => {
  it('the persisted fact stays true when every contract is gone, and employment-right-now does not', () => {
    const s = foundEngaged('regime-1')
    const postCliff: GameState = { ...s, contracts: [] }
    expect(economyEngaged(s)).toBe(true)
    expect(economyEngaged(postCliff)).toBe(true) // persisted, monotonic
    expect(employmentEngaged(postCliff)).toBe(false) // nobody employed right now
    expect(isEmploymentEngaged(postCliff)).toBe(false) // the roster-surface selector agrees
  })

  it('marketingEfficiency + previewForecast stay on the ENGAGED path after the cliff', () => {
    const s = foundEngaged('regime-2')
    const pkg = packageFor(s)
    const postCliff: GameState = { ...s, contracts: [] }

    expect(marketingEfficiency(s, pkg).engaged).toBe(true)
    expect(marketingEfficiency(postCliff, pkg).engaged).toBe(true)
    // The engaged economy path applies the P2 gross scale; an accidental disengage reads
    // materially HIGHER, so equality here is the real proof the regime did not flip.
    expect(previewForecast(postCliff, pkg).expectedTotal).toBeCloseTo(
      previewForecast(s, pkg).expectedTotal,
      6,
    )
  })

  it('the staffing/pricing surfaces read the PERSISTED regime, not employment-right-now', () => {
    const s = foundEngaged('regime-3')
    const postCliff: GameState = { ...s, contracts: [] }
    // With a contracted roster the writer pool is the studio's own signed writers.
    expect(studioPool(s, 'writer').length).toBe(1)
    // D-17A FIX-PASS: after the cliff the studio is still ENGAGED, so the pool does NOT fall
    // back to the open global pool. The roster is empty, so the roster pool is empty and the
    // only legal picks are the rotating freelancer market — exactly what the engine accepts.
    expect(isEmploymentEngaged(postCliff)).toBe(false)
    expect(isEconomyEngaged(postCliff)).toBe(true)
    expect(studioPool(postCliff, 'writer').length).toBe(0)
    const marketWriters = freelancerPool(postCliff, 'writer')
    for (const f of marketWriters) {
      // ...and they are priced at the freelancer fee the engine debits, not the D-1 salary.
      expect(assignmentProjectCost(postCliff, f.talent.id)).toBe(f.fee)
    }
  })

  it('post-cliff ACTION PARITY: the gate says no, or every package the UI can build greenlights', () => {
    // The T10 "fire everyone / natural expiry" state: engaged economy, zero contracts.
    for (const seed of ['parity-1', 'parity-2', 'parity-3']) {
      const s = foundEngaged(seed)
      const postCliff: GameState = { ...s, contracts: [] }
      const avail = assemblyAvailability(postCliff)

      if (!avail.canAssemble) {
        // Honest refusal: it must name which roles are missing (the screen renders them).
        expect(avail.missingRoles.length).toBeGreaterThan(0)
        expect(avail.reason).toBeTruthy()
        continue
      }

      // The gate said yes — then a package built ONLY from what the wizard offers must be
      // accepted by the engine. This is the D-11.12 surprise the fix-pass exists to close.
      const pick = (role: CreativeRole, n: number): string[] =>
        [...studioPool(postCliff, role), ...freelancerPool(postCliff, role).map((f) => f.talent)]
          .slice(0, n)
          .map((t) => t.id)
      const actors = pick('actor', 3)
      const concept = [...postCliff.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[0]!
      const pkg: DraftPackage = {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: pick('writer', 1)[0]!,
        directorId: pick('director', 1)[0]!,
        craftIds: pick('craft', 1),
        cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>,
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      }
      const out = greenlight(postCliff, pkg)
      expect(out.ok, `seed ${seed}: ${out.ok ? '' : out.error}`).toBe(true)
    }
  })

  it('partial cliff: the gate ALLOWS, the engine ACCEPTS, and the quote is what it debits', () => {
    // Release the writer only: the roster can no longer field one, so the wizard's only legal
    // writer is a freelancer from the rotating market — the exact case the old open-pool
    // fallback got wrong in both directions (offered illegal talent, priced it as D-1 salary).
    let allowed = 0
    for (const seed of ['parity-w1', 'parity-w2', 'parity-w3']) {
      let s = foundEngaged(seed)
      for (const c of [...s.contracts]) {
        const t = s.talent.find((x) => x.id === c.talentId)!
        if (t.role === 'writer') s = applyActions(s, [{ kind: 'releaseTalent', talentId: t.id }])
      }
      const avail = assemblyAvailability(s)
      if (!avail.canAssemble) {
        expect(avail.missingRoles.length).toBeGreaterThan(0)
        continue
      }
      allowed++
      const pick = (role: CreativeRole, n: number): string[] =>
        [...studioPool(s, role), ...freelancerPool(s, role).map((f) => f.talent)]
          .slice(0, n)
          .map((t) => t.id)
      const actors = pick('actor', 3)
      const concept = [...s.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[0]!
      const pkg: DraftPackage = {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: pick('writer', 1)[0]!,
        directorId: pick('director', 1)[0]!,
        craftIds: pick('craft', 1),
        cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>,
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      }
      const quoted = totalCommittedCost(s, pkg)
      const out = greenlight(s, pkg)
      expect(out.ok, `seed ${seed}: ${out.ok ? '' : out.error}`).toBe(true)
      if (out.ok) {
        // T4: the "cash required now" the screen showed is exactly what the engine took.
        expect(Math.round(s.studio.cash - out.next.studio.cash)).toBe(Math.round(quoted))
      }
    }
    expect(allowed).toBeGreaterThan(0)
  })

  it('post-cliff assignment cost equals what the engine actually debits', () => {
    const s = foundEngaged('regime-price')
    const postCliff: GameState = { ...s, contracts: [] }
    const anyTalent: Talent[] = postCliff.talent
    let checked = 0
    for (const role of ['writer', 'director', 'actor', 'craft'] as CreativeRole[]) {
      for (const f of freelancerPool(postCliff, role)) {
        const t = anyTalent.find((x) => x.id === f.talent.id)!
        expect(isContracted(postCliff, t.id)).toBe(false)
        expect(assignmentProjectCost(postCliff, t.id)).toBe(freelancerFee(postCliff, t))
        checked++
      }
    }
    expect(checked).toBeGreaterThan(0)
  })
})
