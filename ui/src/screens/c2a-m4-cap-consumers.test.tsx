// ── C2a-M4 — what the deleted cap used to say, and what says it now ──────────
//
// Owner law 1 deletes `MAX_CONCURRENT_PRODUCTIONS`. Five surfaces had built a
// sentence on it (charter §3.3's consumer dispositions). Three landed with the
// engine half — `canGreenlightMore`, the Dashboard's "At the production cap"
// sentence, and the FoundingScreen's "up to two productions at once" prose. The
// fourth is here: Assembly's break-even second line, §10's "Assembly break-even
// literal 2" seam, whose acceptance is *G12 extended to pre-existing falsified
// sentences*.
//
// The sentence "if a SECOND film shares those weeks" was a statement about the
// cap wearing the clothes of an accounting assumption. With three pictures in
// flight it is simply false, and a false number on the one screen where the
// player commits money is the exact G12 offence.

import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Assembly } from './Assembly.tsx'
import { Dashboard } from './Dashboard.tsx'
import {
  cycleInclusiveBreakEvenGross,
  greenlight,
  requiredNegative,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { money } from '../format.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)

const noop = () => {}

function packageForLane(state: GameState, lane: number): DraftPackage {
  const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[lane]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const actors = foundedRosterIds(state, 'actor')
  const castStart = lane * 3
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
    },
    writerId: foundedRosterIds(state, 'writer')[lane]!,
    directorId: foundedRosterIds(state, 'director')[lane]!,
    craftIds: [foundedRosterIds(state, 'craft')[lane]!],
    cast: {
      lead: actors[castStart]!,
      antagonist: actors[castStart + 1]!,
      support: actors[castStart + 2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 100_000 },
  }
}

function pickFirstEligible(pickerTestId: string) {
  const picker = screen.getByTestId(pickerTestId)
  const button = within(picker)
    .getAllByRole('button')
    .find((candidate) => candidate.hasAttribute('aria-pressed') && !(candidate as HTMLButtonElement).disabled)!
  fireEvent.click(button)
}

/** Drive the real wizard to Budget & Forecast — the same clicks a player makes. */
function openBudgetStep(state: GameState) {
  render(<Assembly state={state} onGreenlit={noop} onCancel={noop} />)
  const grid = screen.getByTestId('concept-grid')
  fireEvent.click(within(grid).getAllByRole('button')[0]!)
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  for (const role of ['writer', 'director', 'lead', 'antagonist', 'support', 'craft']) {
    pickFirstEligible(`picker-${role}`)
  }
  fireEvent.click(screen.getByTestId('assembly-next'))
}

function committedOnScreen(): number {
  const raw = screen.getByTestId('committed-cost').textContent ?? ''
  return Number(raw.replace(/[^0-9]/g, ''))
}

describe('C2a-M4 — the break-even second line counts the films that actually share the cycle', () => {
  it('still says "a second film" on an empty lot — the counterfactual it always was', () => {
    const state = newFoundedGame('c2a-m4-shared-empty')
    expect(state.studio.activeProductions.length).toBe(0)
    openBudgetStep(state)
    const shared = cycleInclusiveBreakEvenGross(state, committedOnScreen(), { concurrency: 2 })
    const line = screen.getByTestId('budget-breakeven-shared')
    expect(line.textContent).toContain(money(shared.cycleInclusive))
    expect(line.textContent).toMatch(/if a second film shares those 14 weeks/i)
  })

  it('says THREE when three films would share the cycle — the cap’s literal is gone', () => {
    // Two pictures in flight. Under the cap this state was unreachable at all for
    // a third assembly; the sentence "if a second film shares those weeks" would
    // have priced a studio the player does not have.
    let state = newFoundedGame('c2a-m4-shared-busy')
    for (const lane of [0, 1]) {
      const outcome = greenlight(state, packageForLane(state, lane))
      if (!outcome.ok) throw new Error(outcome.error)
      state = outcome.next
    }
    expect(state.studio.activeProductions.length).toBe(2)

    openBudgetStep(state)
    const committed = committedOnScreen()
    const shared = cycleInclusiveBreakEvenGross(state, committed, { concurrency: 3 })
    const two = cycleInclusiveBreakEvenGross(state, committed, { concurrency: 2 })
    const line = screen.getByTestId('budget-breakeven-shared')

    expect(line.textContent).toContain(money(shared.cycleInclusive))
    expect(line.textContent).toMatch(/all 3 of the studio's films/)
    expect(line.textContent).not.toMatch(/a second film/)
    // Non-vacuous: the retired literal would have printed a DIFFERENT figure.
    expect(money(two.cycleInclusive)).not.toBe(money(shared.cycleInclusive))

    // The two-value law retires; a BLEND never replaces it.
    const block = screen.getByTestId('budget-breakeven-block').textContent ?? ''
    expect(block).not.toMatch(/concurrency/i)
    expect(block).not.toMatch(/\d\.\d+ films?/i)
  })
})

describe('C2a-M4 — no surface still teaches a production cap (G12)', () => {
  it('the Dashboard names the room that is taken, never a cap', () => {
    // Two pictures hold both founding Development & Casting slots on a LEGACY
    // studio's dashboard — the surface that used to say "At the production cap (2)".
    let state = newFoundedGame('c2a-m4-dashboard-cap')
    for (const lane of [0, 1]) {
      const outcome = greenlight(state, packageForLane(state, lane))
      if (!outcome.ok) throw new Error(outcome.error)
      state = outcome.next
    }
    render(
      <Dashboard
        state={state}
        onAssemble={noop}
        onAdvance={noop}
        onSimToEvent={noop}
        onCreateTalent={noop}
        onSaves={noop}
        onOpenAutopsy={noop}
      />,
    )
    const copy = document.body.textContent ?? ''
    expect(copy).not.toMatch(/production cap/i)
    expect(copy).not.toMatch(/up to two productions/i)
  })
})
