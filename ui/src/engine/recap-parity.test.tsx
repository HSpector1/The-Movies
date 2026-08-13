// ── D-15 affordability ACTION-PARITY invariant ────────────────────────────────
// The recap must never classify a film as affordable unless the same GameState can
// legally complete the real greenlight action. This test builds the exact package the
// recap's `cheapest` represents and drives the authoritative greenlight() action, asserting
// the recap's all-in cost and affordability match the action (and its cash deduction).
// States are built by the real engine; the owner save is never touched.

import { describe, expect, it } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { applyActions, beginFounding, cheapestPackageQuote, generateWorld, studioRunRecap } from '../../../src/core/index.ts'
import { affordabilityScopes, greenlight, totalCommittedCost } from './adapter.ts'
import { Dashboard } from '../screens/Dashboard.tsx'
import { moneyExact } from '../format.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'

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

// The exact concrete package behind the recap's `cheapest` quote.
function cheapestPkg(state: GameState) {
  return cheapestPackageQuote(state)!.production
}

describe('recap affordability — action parity', () => {
  it('recap cheapest cost + affordability match the greenlight action, and the greenlight completes', () => {
    const s = foundEngaged('parity-1')
    const r = studioRunRecap(s)
    const pkg = cheapestPkg(s)
    const allIn = totalCommittedCost(s, pkg)
    expect(Math.round(allIn)).toBe(r.position.cheapest!.commitment) // recap value == real package cost
    const gl = greenlight(s, pkg)
    expect(gl.ok).toBe(r.position.cheapest!.affordable) // recap affordability == action
    // a fresh founded studio has plenty of cash → affordable + greenlight applies (cash deducted)
    expect(r.position.cheapest!.affordable).toBe(true)
    expect(gl.ok).toBe(true)
    if (gl.ok) expect(gl.next.studio.cash).toBe(s.studio.cash - allIn)
  })

  it('exact-boundary, $1-short, and marketing-shortfall cases all match the action', () => {
    const s = foundEngaged('parity-2')
    const pkg = cheapestPkg(s)
    const allIn = totalCommittedCost(s, pkg)
    // cash exactly == all-in → affordable (cash-after 0), greenlight succeeds
    const atExact: GameState = { ...s, studio: { ...s.studio, cash: allIn } }
    expect(studioRunRecap(atExact).position.cheapest!.affordable).toBe(greenlight(atExact, pkg).ok)
    expect(greenlight(atExact, pkg).ok).toBe(true)
    // cash == all-in − $1 → unaffordable, greenlight blocked
    const under: GameState = { ...s, studio: { ...s.studio, cash: allIn - 1 } }
    expect(studioRunRecap(under).position.cheapest!.affordable).toBe(false)
    expect(greenlight(under, pkg).ok).toBe(false)
    // negative alone affordable, but minimum marketing pushes it over
    const midMkt: GameState = { ...s, studio: { ...s.studio, cash: pkg.budget.negative + 50_000 } }
    expect(studioRunRecap(midMkt).position.cheapest!.affordable).toBe(false)
    expect(greenlight(midMkt, pkg).ok).toBe(false)
  })

  it('a standard-budget film costs more than the bare-minimum package', () => {
    const s = foundEngaged('parity-3')
    const r = studioRunRecap(s)
    expect(r.position.standard!.commitment).toBeGreaterThan(r.position.cheapest!.commitment)
  })

  it('no available concepts → no cheapest package', () => {
    const s = foundEngaged('parity-4')
    const empty: GameState = { ...s, concepts: [] }
    expect(studioRunRecap(empty).position.cheapest).toBeNull()
  })
})

// ── D-17A/T4 — the SAME affordability answer on every surface ──────────────────
// The three scopes were promoted out of the recap to the Dashboard and to Assembly. The
// promotion is only safe if it did not fork the number: this extends the parity invariant
// above from "recap == action" to "Dashboard card == recap == action", on one state, through
// the REAL rendered screen.
describe('D-17A/T4 — Dashboard affordability card == recap == greenlight action', () => {
  it('the rendered cheapest figure is the recap’s own, and its verdict is the action’s verdict', () => {
    const s = foundEngaged('scopes-1')
    const recap = studioRunRecap(s)
    const scopes = affordabilityScopes(s)

    // 1. The promoted read-model IS the recap's value (same builders, same gate).
    expect(scopes.cheapest).toEqual(recap.position.cheapest)
    expect(scopes.standard).toEqual(recap.position.standard)
    expect(scopes.recentTypical).toEqual(recap.position.typicalRecent)

    // 2. The Dashboard renders exactly that, from the first week — no recap gating.
    render(
      <Dashboard
        state={s}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    const cheapestCell = screen.getByTestId('dash-affordability-cheapest')
    expect(cheapestCell.textContent).toContain(moneyExact(recap.position.cheapest!.commitment))
    expect(cheapestCell.textContent).toContain(
      recap.position.cheapest!.affordable ? 'affordable' : 'short',
    )

    // 3. ACTION PARITY: the same package the figure represents really is greenlightable.
    const pkg = cheapestPkg(s)
    expect(Math.round(totalCommittedCost(s, pkg))).toBe(scopes.cheapest!.commitment)
    expect(greenlight(s, pkg).ok).toBe(scopes.cheapest!.affordable)
    cleanup()
  })

  it('when cash cannot cover the cheapest package, the card says short and the action refuses', () => {
    const s = foundEngaged('scopes-2')
    const pkg = cheapestPkg(s)
    const allIn = totalCommittedCost(s, pkg)
    const broke: GameState = { ...s, studio: { ...s.studio, cash: allIn - 1 } }

    const scopes = affordabilityScopes(broke)
    expect(scopes.cheapest!.affordable).toBe(false)
    expect(greenlight(broke, pkg).ok).toBe(false)

    render(
      <Dashboard
        state={broke}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    const cell = screen.getByTestId('dash-affordability-cheapest')
    expect(cell.textContent).toMatch(/short/)
    expect(cell.textContent).toContain(moneyExact(scopes.cheapest!.shortfall))
    cleanup()
  })

  it('uses D-15’s own vocabulary, so one number is never described two ways', () => {
    const s = foundEngaged('scopes-3')
    render(
      <Dashboard
        state={s}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    expect(screen.getByText('Lowest estimated production commitment')).toBeInTheDocument()
    expect(screen.getByText('Recent typical commitment')).toBeInTheDocument()
    cleanup()
  })
})
