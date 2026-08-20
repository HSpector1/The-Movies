// ── INDEPENDENT assembly-legality suite ──────────────────────────────────────
// Governing rule (Phase-5 authorization / contract §3 legality):
//   • A complete legal film can be greenlit; missing required choices block it.
//   • Duplicate cast is prevented; unavailable (engaged) talent cannot be selected
//     and the reason is explained; role mismatches are prevented.
//   • The cash/cost arithmetic SHOWN in review equals what the adapter sends to the
//     engine: totalCommittedCost == negative + marketing + Σsalaries.
//
// Behavioral: render the real Assembly wizard and interact via testids/roles.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { Assembly } from './Assembly.tsx'
import { TalentPicker } from '../components/TalentPicker.tsx'
import {
  newGame,
  talentByRole,
  greenlight,
  salarySum,
  totalCommittedCost,
  requiredNegative,
  NEGATIVE_BUDGET_MULTIPLIERS,
  PROMISE_CENTERS,
  PROMISE_WIDTHS,
  rangeFrom,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)

// Drive the wizard from the concept step to the talent step, choosing defaults.
// D-11.2/D-11.12: the Assembly wizard staffs from the studio roster, so a FOUNDED
// studio (signed roster) is required for the talent pickers to be non-empty.
function openToTalentStep(seed: string) {
  const state = newFoundedGame(seed)
  const onGreenlit = vi.fn()
  render(<Assembly state={state} onGreenlit={onGreenlit} onCancel={() => {}} />)
  // Concept: pick the first concept card.
  const grid = screen.getByTestId('concept-grid')
  fireEvent.click(within(grid).getAllByRole('button')[0]!)
  fireEvent.click(screen.getByTestId('assembly-next')) // → shape
  fireEvent.click(screen.getByTestId('assembly-next')) // → promise
  fireEvent.click(screen.getByTestId('assembly-next')) // → talent
  return { state, onGreenlit }
}

// Pick the first ELIGIBLE candidate in a picker. The redesigned cards add auxiliary
// buttons (a "Details" expand toggle) per row; the SELECTABLE candidate button is the
// one carrying aria-pressed (the option toggle). We pick the first enabled such button —
// i.e. the first eligible candidate in the picker's (Fit-sorted) order.
function pickFirstEligible(pickerTestId: string) {
  const picker = screen.getByTestId(pickerTestId)
  const btn = within(picker)
    .getAllByRole('button')
    .find(
      (b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled,
    )!
  fireEvent.click(btn)
  return btn
}

describe('assembly legality: greenlight is blocked until every required choice is made', () => {
  it('the Next button is disabled at the talent step until writer, director and 3 cast are chosen', () => {
    openToTalentStep('legal-block-1')
    const next = screen.getByTestId('assembly-next') as HTMLButtonElement
    // Nothing chosen yet — cannot advance out of talent.
    expect(next.disabled).toBe(true)

    pickFirstEligible('picker-writer')
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(true)
    pickFirstEligible('picker-director')
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(true)
    pickFirstEligible('picker-lead')
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(true)
    pickFirstEligible('picker-antagonist')
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(true)
    pickFirstEligible('picker-support')
    // D-11.13: with the studio founded (employment engaged), a Production/Craft Lead is
    // now ALSO required to leave the talent step — so writer+director+3 cast is no longer
    // sufficient; Next stays disabled until the craft lead is chosen too.
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(true)
    pickFirstEligible('picker-craft')
    // Now complete (writer + director + 3 cast + craft lead) — Next enables.
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(false)
  })

  it('concept step blocks Next until a concept is chosen', () => {
    const state = newGame('legal-block-2')
    render(<Assembly state={state} onGreenlit={() => {}} onCancel={() => {}} />)
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(true)
    const grid = screen.getByTestId('concept-grid')
    fireEvent.click(within(grid).getAllByRole('button')[0]!)
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('assembly legality: choosing one performer disables it in the other principal roles', () => {
  it('the picked lead actor is disabled/unselectable in the antagonist and support pickers', () => {
    openToTalentStep('legal-dup-1')
    pickFirstEligible('picker-writer')
    pickFirstEligible('picker-director')
    const leadBtn = pickFirstEligible('picker-lead')
    const leadTestId = leadBtn.getAttribute('data-testid')!

    // The same actor button in the antagonist and support pickers is disabled,
    // with the final-cast rule stated in player language.
    for (const other of ['picker-antagonist', 'picker-support']) {
      const picker = screen.getByTestId(other)
      const sameActor = within(picker).getByTestId(leadTestId) as HTMLButtonElement
      expect(sameActor.disabled).toBe(true)
      expect(sameActor.textContent ?? '').toMatch(/one person can hold only one role per production/i)
    }
  })
})

describe('assembly legality: a wrong-role talent is not offered for a slot', () => {
  it('the writer pool contains only writers — no actors/directors appear', () => {
    const state = newGame('legal-role-1')
    const writers = talentByRole(state, 'writer')
    render(
      <TalentPicker
        title="Writer"
        pool={writers}
        role="writer"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-writer"
      />,
    )
    const picker = screen.getByTestId('picker-writer')
    const buttons = within(picker).getAllByRole('button')
    // Every offered option corresponds to a writer id in the writer pool.
    const writerIds = new Set(writers.map((w) => w.id))
    for (const b of buttons) {
      const id = (b.getAttribute('data-testid') ?? '').replace(/^talent-/, '')
      expect(writerIds.has(id)).toBe(true)
    }
    // And an actor from the actor pool is not present in the writer picker.
    const anActor = talentByRole(state, 'actor')[0]!
    expect(within(picker).queryByTestId(`talent-${anActor.id}`)).toBeNull()
  })

  it('if an actor is (defensively) passed to a writer picker, it is disabled with a wrong-role reason', () => {
    const state = newGame('legal-role-2')
    const anActor = talentByRole(state, 'actor')[0]!
    // Feed a wrong-role talent to a writer picker → the eligibility rule disables it.
    render(
      <TalentPicker
        title="Writer"
        pool={[anActor]}
        role="writer"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-writer"
      />,
    )
    const btn = screen.getByTestId(`talent-${anActor.id}`) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.textContent ?? '').toMatch(/wrong role/i)
  })
})

describe('assembly legality: an engaged actor cannot be selected and the conflict is explained', () => {
  it('after greenlight, the engaged talent shows as busy-until-release in the picker', () => {
    // D-11.2/D-11.12: staff from the FOUNDED studio roster; D-11.13 requires exactly
    // one Production/Craft Lead per film.
    let state: GameState = newFoundedGame('legal-engaged-1')
    // Greenlight a legal film so its talent become engaged.
    const concept = state.concepts[0]!
    const writers = foundedRosterIds(state, 'writer')
    const directors = foundedRosterIds(state, 'director')
    const actors = foundedRosterIds(state, 'actor')
    const craft = foundedRosterIds(state, 'craft')
    const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
    const pkg: DraftPackage = {
      conceptId: concept.id,
      shape,
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: {
          intimacy: rangeFrom(PROMISE_CENTERS[1], PROMISE_WIDTHS[1]),
          tonalWeight: rangeFrom(PROMISE_CENTERS[1], PROMISE_WIDTHS[1]),
          kineticEnergy: rangeFrom(PROMISE_CENTERS[1], PROMISE_WIDTHS[1]),
        },
      },
      writerId: writers[0]!,
      directorId: directors[0]!,
      craftIds: [craft[0]!],
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
    }
    const g = greenlight(state, pkg)
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next

    // Now render a fresh actor picker: the engaged lead is disabled with a reason.
    const pool = talentByRole(state, 'actor')
    render(
      <TalentPicker
        title="Lead"
        pool={pool}
        role="actor"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-lead"
      />,
    )
    const engaged = screen.getByTestId(`talent-${actors[0]!}`) as HTMLButtonElement
    expect(engaged.disabled).toBe(true)
    // D-12 beta: the busy reason names the FILM (a title), never a raw production id.
    expect(engaged.textContent ?? '').toMatch(/already working on .+ — busy until it releases/i)
    expect(engaged.textContent ?? '').not.toMatch(/prod-\d/)
  })

  it('the engine itself rejects a greenlight that reuses engaged talent (adapter surfaces it as data)', () => {
    // D-11.2/D-11.12: staff from the FOUNDED studio roster (generous enough for two
    // concurrent films); D-11.13 requires exactly one Production/Craft Lead per film.
    let state: GameState = newFoundedGame('legal-engaged-2')
    const concept = state.concepts[0]!
    const writers = foundedRosterIds(state, 'writer')
    const directors = foundedRosterIds(state, 'director')
    const actors = foundedRosterIds(state, 'actor')
    const craft = foundedRosterIds(state, 'craft')
    const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
    const first: DraftPackage = {
      conceptId: concept.id,
      shape,
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
      },
      writerId: writers[0]!,
      directorId: directors[0]!,
      craftIds: [craft[0]!],
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
    }
    const g1 = greenlight(state, first)
    expect(g1.ok).toBe(true)
    if (!g1.ok) return
    state = g1.next

    // Second film reuses the engaged writer (writers[0], now busy) but is otherwise legal
    // (distinct still-available roster actors, a second director and the second craft lead)
    // → the engine rejects it on the reused writer; the adapter surfaces that as data.
    const concept2 = state.concepts[1]!
    const second: DraftPackage = {
      ...first,
      conceptId: concept2.id,
      promise: { ...first.promise, genre: concept2.genre },
      directorId: directors[1]!,
      craftIds: [craft[1]!],
      cast: { lead: actors[3]!, antagonist: actors[4]!, support: actors[5]! },
      budget: { negative: requiredNegative(concept2, shape, state), marketing: 400_000 },
    }
    const g2 = greenlight(state, second)
    expect(g2.ok).toBe(false)
    if (g2.ok) return
    expect(g2.error.length).toBeGreaterThan(0)
  })
})

describe('assembly legality: promise.genre must equal the concept genre', () => {
  it('the wizard builds the promise with the concept genre; a mismatched promise is engine-rejected', () => {
    // D-11.2/D-11.12: staff from the FOUNDED studio roster; D-11.13 requires a craft
    // lead. Everything here is legal EXCEPT the genre, so the genre mismatch is the
    // rejection cause the assertion checks for.
    const state = newFoundedGame('legal-genre-1')
    const concept = state.concepts.find((c) => c.genre === 'comedy') ?? state.concepts[0]!
    const wrongGenre = concept.genre === 'drama' ? 'comedy' : 'drama'
    const writers = foundedRosterIds(state, 'writer')
    const directors = foundedRosterIds(state, 'director')
    const actors = foundedRosterIds(state, 'actor')
    const craft = foundedRosterIds(state, 'craft')
    const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
    const bad: DraftPackage = {
      conceptId: concept.id,
      shape,
      promise: {
        genre: wrongGenre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
      },
      writerId: writers[0]!,
      directorId: directors[0]!,
      craftIds: [craft[0]!],
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
    }
    const g = greenlight(state, bad)
    expect(g.ok).toBe(false)
    if (g.ok) return
    expect(g.error).toMatch(/genre/i)
  })
})

describe('assembly legality: review cost arithmetic equals what the adapter sends the engine', () => {
  it('the budget-step Total committed cost equals negative + marketing + Σsalaries and equals totalCommittedCost()', () => {
    const seed = 'legal-cost-1'
    const { state } = openToTalentStep(seed)
    // Complete the cast so a package can be built. Candidates are Fit-sorted, so we do
    // NOT assume which talent gets picked — we READ the chosen ids back from the DOM.
    const writerBtn = pickFirstEligible('picker-writer')
    const directorBtn = pickFirstEligible('picker-director')
    const leadBtn = pickFirstEligible('picker-lead')
    const antagBtn = pickFirstEligible('picker-antagonist')
    const supportBtn = pickFirstEligible('picker-support')
    // D-11.13: a Production/Craft Lead is now required to leave the talent step, so the
    // craft assignment is part of the package and its committed project cost is part of
    // the shown Total. We read the chosen craft id back from the DOM (like the others)
    // and include it in the reconstruction so the arithmetic covers the full package.
    const craftBtn = pickFirstEligible('picker-craft')
    const idOf = (b: HTMLElement): string =>
      (b.getAttribute('data-testid') ?? '').replace(/^talent-/, '')
    fireEvent.click(screen.getByTestId('assembly-next')) // → budget

    // Read the shown component figures.
    const committedShown = (screen.getByTestId('committed-cost').textContent ?? '').trim()
    const salariesShown = (screen.getByTestId('salaries').textContent ?? '').trim()

    // Reconstruct the exact package the wizard has (defaults: 1.0× negative, middle
    // package-specific marketing rung),
    // using the ACTUAL talent the Fit-sorted pickers selected (read from the DOM). The UI
    // must show engine arithmetic over the real chosen talent, not invented numbers.
    const concept = state.concepts[0]!
    const req = requiredNegative(concept, { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }, state)
    const negative = NEGATIVE_BUDGET_MULTIPLIERS[1]! * req // default negative level idx 1
    const idsGuess = {
      writerId: idOf(writerBtn),
      directorId: idOf(directorBtn),
      cast: { lead: idOf(leadBtn), antagonist: idOf(antagBtn), support: idOf(supportBtn) },
      craftIds: [idOf(craftBtn)], // D-11.13 craft lead — its cost is part of the Total
    }
    const salaries = salarySum(state, idsGuess)
    const menuBasis: DraftPackage = {
      conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const,
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
      },
      ...idsGuess,
      budget: { negative, marketing: 0 },
    }
    const marketing = Number(
      screen.getByTestId('marketing-1').getAttribute('data-marketing-amount'),
    )
    const committed = negative + marketing + salaries
    const committedViaHelper = totalCommittedCost(state, {
      ...menuBasis,
      budget: { negative, marketing },
    })

    // The adapter's two cost paths agree (arithmetic identity).
    expect(committedViaHelper).toBeCloseTo(committed, 6)
    // And the SHOWN figures equal the engine arithmetic.
    expect(salariesShown).toBe(moneyExact(salaries))
    expect(committedShown).toBe(moneyExact(committed))
    // Explicit decomposition: committed === negative + marketing + salaries.
    expect(committed).toBeCloseTo(negative + marketing + salaries, 6)
  })
})
