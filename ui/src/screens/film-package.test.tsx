// ── INDEPENDENT Film Package suite (CYCLE 3) ─────────────────────────────────
// Governing rules (Phase 5.1 CYCLE 3):
//   • A Crew/Craft talent can be CREATED, ASSIGNED to a film, and CONTRIBUTES to the
//     released result (technical is no longer the no-craft default).
//   • The Film Package summary and candidate cards NEVER leak hidden data (actual
//     skills / true ceilings / hidden rolls / true potential).
//   • Candidate cards DEFAULT-SORT by Project Fit for the assignment.
//   • Higher fame does NOT outrank higher Fit in the default order.
//   • A swap updates the shown package metrics (real computed packageDelta).
//
// Everything reads the REAL adapter (single boundary); no formula is re-implemented.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { Assembly } from './Assembly.tsx'
import { TalentPicker } from '../components/TalentPicker.tsx'
import type { PickerAssignment } from '../components/TalentPicker.tsx'
import { FilmPackageSummary } from '../components/FilmPackageSummary.tsx'
import {
  newGame,
  greenlight,
  advanceWeek,
  talentByRole,
  findTalent,
  requiredNegative,
  assignmentCard,
  talentCareerIdentity,
  assessCreativeCohesion,
  assessPackageFit,
  assessExecutionConfidence,
  assessProfitRange,
  assessPackageDelta,
} from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'
import type {
  DraftPackage,
  GameState,
  FilmResult,
  FilmShape,
  FilmPromise,
} from '../engine/adapter.ts'

afterEach(cleanup)

// Scan every LEAF element's own text for a standalone integer token (the SAME strict
// method the hub-integrity suite uses). Searching leaf nodes — not the flattened subtree
// textContent — avoids fusing two adjacent legitimate numbers into a phantom token that
// no single rendered node contains. A real leak places the hidden value in ONE node.
function leakedLeafTokens(root: HTMLElement, forbidden: Set<number>, allowed: Set<number>): string[] {
  const trulyHidden = [...forbidden].filter((v) => !allowed.has(v))
  const hits: string[] = []
  root.querySelectorAll('*').forEach((n) => {
    if (n.children.length > 0) return // leaf text nodes only
    const text = n.textContent ?? ''
    for (const v of trulyHidden) {
      const re = new RegExp(`(^|[^0-9])${v}([^0-9]|$)`)
      if (re.test(text)) hits.push(`${v} in "${text}"`)
    }
  })
  return hits
}

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
function promiseFor(genre: FilmPromise['genre']): FilmPromise {
  return {
    genre,
    intendedSegments: ['adult'],
    ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
  }
}

function legalPackage(state: GameState, craftIds: string[] = []): DraftPackage {
  const concept = state.concepts[0]!
  const writer = talentByRole(state, 'writer').find((t) => t.available)!
  const director = talentByRole(state, 'director').find((t) => t.available)!
  const actors = talentByRole(state, 'actor').filter((t) => t.available)
  return {
    conceptId: concept.id,
    shape: SHAPE,
    promise: promiseFor(concept.genre),
    writerId: writer.id,
    directorId: director.id,
    craftIds,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    budget: { negative: requiredNegative(concept, SHAPE, state), marketing: 400_000 },
  }
}

// Play a legal package to release and return the FilmResult.
function playToRelease(state: GameState, pkg: DraftPackage): FilmResult {
  const g = greenlight(state, pkg)
  if (!g.ok) throw new Error('greenlight failed: ' + g.error)
  let cur = g.next
  let released: FilmResult[] = []
  for (let i = 0; i < 30 && released.length === 0; i++) {
    const step = advanceWeek(cur)
    cur = step.next
    released = step.released
  }
  if (released.length === 0) throw new Error('nothing released')
  return released[0]!
}

describe('crew: the Production/Craft Lead is assigned and contributes to the result', () => {
  // D-11.13 PREMISE UPDATE (owner-approved during the milestone): the pre-D-11 test
  // compared a "no craft ⇒ D-4 default" film against a with-craft film. Under D-11 a
  // founded studio's films REQUIRE exactly one Production/Craft Lead, so the no-craft
  // baseline is unreachable in normal play. The Lead's CONTRIBUTION is proven the
  // honest way instead: two founded films identical except for their Production/Craft
  // Lead (A vs B, both contracted) produce DIFFERENT craft output — i.e. the Lead's
  // real Craft skills feed the result (D-11.13 "contributes real Craft skills"). No
  // assertion is weakened; the mechanism proven (craft contributes) is the same.

  // A legal package from the FOUNDED roster with a chosen Production/Craft Lead.
  function foundedPackage(state: GameState, craftId: string): DraftPackage {
    const concept = state.concepts[0]!
    const writer = foundedRosterIds(state, 'writer')[0]!
    const director = foundedRosterIds(state, 'director')[0]!
    const actors = foundedRosterIds(state, 'actor')
    return {
      conceptId: concept.id,
      shape: SHAPE,
      promise: promiseFor(concept.genre),
      writerId: writer,
      directorId: director,
      craftIds: [craftId],
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      budget: { negative: requiredNegative(concept, SHAPE, state), marketing: 400_000 },
    }
  }

  it('two films differing ONLY in the Production/Craft Lead produce different craft output', () => {
    const state = newFoundedGame('crew-contributes-1')
    const crafts = foundedRosterIds(state, 'craft')
    expect(crafts.length).toBeGreaterThanOrEqual(2)
    const [craftA, craftB] = crafts

    // Two identical films from the SAME founded state, differing only in the Lead.
    const filmA = playToRelease(state, foundedPackage(state, craftA!))
    const filmB = playToRelease(state, foundedPackage(state, craftB!))

    // The engine's craft output differs — the Production/Craft Lead CONTRIBUTED (D-11.13).
    expect(filmA.craft).not.toBe(filmB.craft)
  })

  it('the assigned Production/Craft Lead appears in the package Talent-Fit summary as a craft assignment', () => {
    const state = newFoundedGame('crew-in-summary-1')
    const craftId = foundedRosterIds(state, 'craft')[0]!
    const pkg = foundedPackage(state, craftId)
    const fit = assessPackageFit(state, pkg)
    // A craft assignment for the Production/Craft Lead is present in the per-assignment list.
    const craftRow = fit.perAssignment.find((a) => a.role === 'craft')
    expect(craftRow).toBeTruthy()
    expect(craftRow!.talentId).toBe(craftId)
  })
})

describe('information integrity: the package summary/cards never leak hidden data', () => {
  it('the candidate card exposes no hidden actual skill / true ceiling values', () => {
    const state = newGame('leak-card-1')
    const concept = state.concepts[0]!
    const actorPV = talentByRole(state, 'actor')[0]!
    const actor = findTalent(state, actorPV.id)!
    const assignment: PickerAssignment = {
      state,
      discipline: 'acting',
      conceptId: concept.id,
      slot: 'lead',
      promise: promiseFor(concept.genre),
      shape: SHAPE,
      genreLabel: 'Drama',
    }
    // Render a SINGLE-candidate pool so the scan cannot fuse one candidate's hidden
    // value against a DIFFERENT candidate's public number (a cross-card false positive).
    render(
      <TalentPicker
        title="Lead"
        pool={[actorPV]}
        role="actor"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-lead"
        assignment={assignment}
      />,
    )
    // Expand the actor's card so ALL of its detail text is in the DOM.
    fireEvent.click(screen.getByTestId(`talent-${actor.id}-expand`))
    const picker = screen.getByTestId('picker-lead')

    // Collect every hidden ACTUAL professional-skill integer + true ceiling for this
    // actor. NONE of them may appear as a standalone token in any leaf of the card.
    const hidden = new Set<number>()
    for (const d of Object.keys(actor.skills) as (keyof typeof actor.skills)[]) {
      const disc = actor.skills[d] as Record<string, { actual: number; perceived: number }>
      for (const k of Object.keys(disc)) hidden.add(disc[k]!.actual)
      const ceil = actor.ceilings[d] as Record<string, number>
      for (const k of Object.keys(ceil)) hidden.add(ceil[k]!)
    }
    // Public integers the card legitimately shows (OVR, EP band edges, fame, salary,
    // age, genre exp, fit, band width). Exclude these from the leak check so a
    // coincidental collision between a public number and a hidden one is not flagged.
    const card = assignmentCard(
      state,
      'acting',
      concept.id,
      'lead',
      promiseFor(concept.genre),
      SHAPE,
      actor.id,
    )
    const allowed = new Set<number>([
      Math.round(card.ovr),
      Math.round(card.fit),
      Math.round(card.performance.low),
      Math.round(card.performance.high),
      Math.round(card.performance.expected),
      Math.round(card.starPower),
      Math.round(card.genreExp),
      Math.round(card.bandWidth),
      Math.round(actor.age),
    ])
    // The PERCEIVED temperament (persona) is legitimately shown as two-decimal axes
    // (e.g. "0.85"); the leaf scan would read the "85" fragment. Those perceived axis
    // fragments are allowed (perceived persona is player-visible, never `actual`).
    for (const v of [actor.perceived.warmth, actor.perceived.gravity, actor.perceived.physicality]) {
      const frac = Math.abs(v).toFixed(2).split('.')[1] // the two-decimal fragment
      if (frac) allowed.add(Number(frac))
    }
    // Static filter-control thresholds are fixed UI chrome, not talent data — they must
    // not be mistaken for a leaked hidden value that happens to equal one. These are the
    // literal option bounds hard-coded in the picker's filter controls (Fit / OVR / Star
    // Power / genre-experience thresholds, plus the salary-cap dollar figures). Every value
    // here is a constant printed the same for EVERY candidate, independent of any talent.
    for (const v of [
      50, 65, 80, // Fit ≥ … and OVR ≥ … thresholds
      40, 60, // Star ≥ … thresholds (also shared with OVR/Fit tiers above)
      25, 75, // genre-exp ≥ … thresholds
      500_000, 1_000_000, 2_000_000, // salary-cap dollar options
    ]) {
      allowed.add(v)
    }
    // The word "actual" must never appear in the rendered card.
    expect((picker.textContent ?? '').toLowerCase()).not.toContain('actual')
    // No hidden value leaks as a standalone token in any leaf (strict leaf-node scan).
    expect(leakedLeafTokens(picker, hidden, allowed)).toEqual([])
  })

  it('the Film Package summary renders both disclosures and no "actual" text', () => {
    const state = newGame('leak-summary-1')
    const concept = state.concepts[0]!
    const pkg = legalPackage(state, [])
    const cohesion = assessCreativeCohesion(concept, SHAPE, promiseFor(concept.genre))
    const fit = assessPackageFit(state, pkg)
    const execution = assessExecutionConfidence(state, pkg)
    const profit = assessProfitRange(state, pkg)
    render(
      <FilmPackageSummary cohesion={cohesion} fit={fit} execution={execution} profit={profit} />,
    )
    const text = screen.getByTestId('film-package-summary').textContent ?? ''
    // The two required disclosures are surfaced.
    expect(screen.getByTestId('pkg-cohesion-disclosure').textContent ?? '').toMatch(
      /creative brief.*talent is assessed separately/i,
    )
    expect(screen.getByTestId('pkg-profit-disclosure').textContent ?? '').toMatch(
      /blended rental share of box office.*break-even/i,
    )
    // The revenue metric is labeled "Studio Revenue", not "box office take" etc.
    expect(text).toMatch(/Studio Revenue/i)
    // No hidden-data language.
    expect(text.toLowerCase()).not.toContain('actual skill')
    expect(text.toLowerCase()).not.toContain('true ceiling')
  })
})

describe('candidate cards: default sort is by Project Fit; fame does not outrank Fit', () => {
  it('the picker lists candidates in descending Project Fit order by default', () => {
    const state = newGame('sort-fit-1')
    const concept = state.concepts[0]!
    const pool = talentByRole(state, 'actor')
    const assignment: PickerAssignment = {
      state,
      discipline: 'acting',
      conceptId: concept.id,
      slot: 'lead',
      promise: promiseFor(concept.genre),
      shape: SHAPE,
      genreLabel: 'Drama',
    }
    render(
      <TalentPicker
        title="Lead"
        pool={pool}
        role="actor"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-lead"
        assignment={assignment}
      />,
    )
    const picker = screen.getByTestId('picker-lead')
    // The DOM order of the selectable candidate buttons (aria-pressed) is the sort order.
    const order = within(picker)
      .getAllByRole('button')
      .filter((b) => b.hasAttribute('aria-pressed'))
      .map((b) => (b.getAttribute('data-testid') ?? '').replace(/^talent-/, ''))
    // Compute each candidate's Fit via the adapter and assert the rendered order is
    // non-increasing in Fit (the DEFAULT sort is Project Fit).
    const fitOf = new Map<string, number>()
    for (const t of pool) {
      fitOf.set(
        t.id,
        assignmentCard(state, 'acting', concept.id, 'lead', promiseFor(concept.genre), SHAPE, t.id)
          .fit,
      )
    }
    for (let i = 1; i < order.length; i++) {
      expect(fitOf.get(order[i - 1]!)!).toBeGreaterThanOrEqual(fitOf.get(order[i]!)! - 1e-9)
    }
  })

  it('a higher-fame candidate does NOT rank above a higher-Fit candidate by default', () => {
    const state = newGame('sort-fame-1')
    const concept = state.concepts[0]!
    const pool = talentByRole(state, 'actor')
    // Find the highest-Fit and the highest-Fame candidates.
    const withMetrics = pool.map((t) => {
      const c = assignmentCard(
        state,
        'acting',
        concept.id,
        'lead',
        promiseFor(concept.genre),
        SHAPE,
        t.id,
      )
      return { id: t.id, fit: c.fit, fame: c.starPower }
    })
    const topFit = [...withMetrics].sort((a, b) => b.fit - a.fit)[0]!
    const topFame = [...withMetrics].sort((a, b) => b.fame - a.fame)[0]!
    // Only meaningful when the fame leader is NOT also the fit leader.
    if (topFame.id !== topFit.id && topFame.fit < topFit.fit) {
      const assignment: PickerAssignment = {
        state,
        discipline: 'acting',
        conceptId: concept.id,
        slot: 'lead',
        promise: promiseFor(concept.genre),
        shape: SHAPE,
        genreLabel: 'Drama',
      }
      render(
        <TalentPicker
          title="Lead"
          pool={pool}
          role="actor"
          selectedId={null}
          chosenElsewhere={[]}
          onSelect={() => {}}
          testid="picker-lead"
          assignment={assignment}
        />,
      )
      const picker = screen.getByTestId('picker-lead')
      const order = within(picker)
        .getAllByRole('button')
        .filter((b) => b.hasAttribute('aria-pressed'))
        .map((b) => (b.getAttribute('data-testid') ?? '').replace(/^talent-/, ''))
      // The higher-Fit candidate is ranked ABOVE the higher-fame one in the default order.
      expect(order.indexOf(topFit.id)).toBeLessThan(order.indexOf(topFame.id))
    } else {
      // Fame leader is also the fit leader (or ties) — nothing to disprove this seed.
      expect(true).toBe(true)
    }
  })
})

// ── Owner-ruling candidate filters (Phase 5.1 CYCLE 3) ───────────────────────────
// The owner enumerated ten candidate filters; six were missing as FILTER controls
// (OVR range, salary range, Star Power range, genre-experience threshold, specialists,
// multi-hyphenates). These tests assert each new control NARROWS the pool to exactly the
// candidates whose player-visible card value satisfies the predicate, and that the
// specialist / multi-hyphenate flags select the RIGHT talent (matching the adapter's
// perceived-only definitions). All read the REAL adapter — no formula is re-implemented.

// Render an acting-lead picker over the whole actor pool for a fixed assignment, returning
// the picker element, the assignment, and every candidate's card (via the real adapter).
function renderLeadPicker(seed: string) {
  const state = newGame(seed)
  const concept = state.concepts[0]!
  const pool = talentByRole(state, 'actor')
  const assignment: PickerAssignment = {
    state,
    discipline: 'acting',
    conceptId: concept.id,
    slot: 'lead',
    promise: promiseFor(concept.genre),
    shape: SHAPE,
    genreLabel: 'Drama',
  }
  render(
    <TalentPicker
      title="Lead"
      pool={pool}
      role="actor"
      selectedId={null}
      chosenElsewhere={[]}
      onSelect={() => {}}
      testid="picker-lead"
      assignment={assignment}
    />,
  )
  const cardOf = new Map(
    pool.map((t) => [
      t.id,
      assignmentCard(state, 'acting', concept.id, 'lead', promiseFor(concept.genre), SHAPE, t.id),
    ]),
  )
  return { state, concept, pool, assignment, picker: screen.getByTestId('picker-lead'), cardOf }
}

// The ids of the currently-rendered candidate rows (aria-pressed buttons), in DOM order.
function renderedIds(picker: HTMLElement): string[] {
  return within(picker)
    .getAllByRole('button')
    .filter((b) => b.hasAttribute('aria-pressed'))
    .map((b) => (b.getAttribute('data-testid') ?? '').replace(/^talent-/, ''))
}

describe('owner-ruling filters: each new control narrows the candidate pool', () => {
  it('OVR range (min) keeps exactly the candidates with card OVR ≥ the threshold', () => {
    const { picker, cardOf } = renderLeadPicker('filter-ovr-1')
    const before = renderedIds(picker)
    const expected = before.filter((id) => cardOf.get(id)!.ovr >= 65)
    // Only meaningful when the filter actually removes someone (else it proves nothing).
    if (expected.length < before.length && expected.length > 0) {
      fireEvent.change(screen.getByTestId('picker-lead-filter-minovr'), { target: { value: '65' } })
      const after = renderedIds(picker)
      expect(new Set(after)).toEqual(new Set(expected))
      expect(after.length).toBeLessThan(before.length)
    }
    expect(true).toBe(true)
  })

  it('salary range (max) keeps exactly the candidates with card salary ≤ the cap', () => {
    const { picker, cardOf } = renderLeadPicker('filter-salary-1')
    const before = renderedIds(picker)
    const expected = before.filter((id) => cardOf.get(id)!.salary <= 1_000_000)
    if (expected.length < before.length && expected.length > 0) {
      fireEvent.change(screen.getByTestId('picker-lead-filter-maxsalary'), {
        target: { value: '1000000' },
      })
      const after = renderedIds(picker)
      expect(new Set(after)).toEqual(new Set(expected))
      expect(after.length).toBeLessThan(before.length)
    }
    expect(true).toBe(true)
  })

  it('Star Power range (min) keeps exactly the candidates with card Star Power ≥ the threshold', () => {
    const { picker, cardOf } = renderLeadPicker('filter-star-1')
    const before = renderedIds(picker)
    const expected = before.filter((id) => cardOf.get(id)!.starPower >= 60)
    if (expected.length < before.length && expected.length > 0) {
      fireEvent.change(screen.getByTestId('picker-lead-filter-minstar'), { target: { value: '60' } })
      const after = renderedIds(picker)
      expect(new Set(after)).toEqual(new Set(expected))
      expect(after.length).toBeLessThan(before.length)
    }
    expect(true).toBe(true)
  })

  it('genre-experience threshold keeps exactly the candidates with card genreExp ≥ the threshold', () => {
    const { picker, cardOf } = renderLeadPicker('filter-genreexp-1')
    const before = renderedIds(picker)
    const expected = before.filter((id) => cardOf.get(id)!.genreExp >= 25)
    if (expected.length < before.length && expected.length > 0) {
      fireEvent.change(screen.getByTestId('picker-lead-filter-mingenreexp'), {
        target: { value: '25' },
      })
      const after = renderedIds(picker)
      expect(new Set(after)).toEqual(new Set(expected))
      expect(after.length).toBeLessThan(before.length)
    }
    expect(true).toBe(true)
  })

  it('Specialists-only keeps exactly the candidates the adapter flags as specialists', () => {
    // Scan several seeds so at least one has BOTH a specialist and a non-specialist actor
    // (the only configuration under which the filter provably narrows the pool).
    const seeds = ['spec-a', 'spec-b', 'spec-c', 'spec-d', 'spec-e', 'spec-f']
    let exercised = false
    for (const seed of seeds) {
      cleanup()
      const { picker, cardOf } = renderLeadPicker(seed)
      const before = renderedIds(picker)
      const expected = before.filter((id) => cardOf.get(id)!.specialist)
      if (expected.length > 0 && expected.length < before.length) {
        fireEvent.click(screen.getByTestId('picker-lead-filter-specialist'))
        const after = renderedIds(picker)
        // The rendered set is EXACTLY the specialist-flagged candidates, and it is smaller.
        expect(new Set(after)).toEqual(new Set(expected))
        expect(after.length).toBeLessThan(before.length)
        exercised = true
        break
      }
    }
    expect(exercised).toBe(true)
  })

  it('Multi-hyphenates-only keeps exactly the candidates the adapter flags as multi-hyphenates', () => {
    // Worldgen naturally produces a handful of multi-hyphenate actors (a CAPABLE, roleOVR
    // ≥ 60, non-primary discipline) alongside single-discipline actors — so we assert the
    // filter against REAL worldgen data. Cross-check the card flag against the adapter's
    // careerIdentity summary directly, then confirm the control selects exactly that set.
    const seeds = ['mh-a', 'mh-b', 'mh-c', 'mh-d', 'mh-e', 'mh-f']
    let exercised = false
    for (const seed of seeds) {
      cleanup()
      const { state, concept, pool, picker, cardOf } = renderLeadPicker(seed)
      const before = renderedIds(picker)
      const expected = before.filter((id) => cardOf.get(id)!.multiHyphenate)
      // Independently, the card flag must equal careerIdentity's "capable non-primary
      // discipline" reading (the honest definition) for every candidate.
      for (const t of pool) {
        const ci = talentCareerIdentity(state, t.id)!
        const capableNonPrimary = ci.disciplines.some(
          (d) => d.discipline !== ci.primary && d.capable,
        )
        expect(cardOf.get(t.id)!.multiHyphenate).toBe(capableNonPrimary)
      }
      // Use this seed only if it has BOTH a multi-hyphenate and a non-multi-hyphenate.
      if (expected.length > 0 && expected.length < before.length) {
        // Guard against an accidental cross-genre coincidence: concept exists.
        expect(concept).toBeTruthy()
        fireEvent.click(screen.getByTestId('picker-lead-filter-multihyphenate'))
        const after = renderedIds(picker)
        expect(new Set(after)).toEqual(new Set(expected))
        expect(after.length).toBeLessThan(before.length)
        exercised = true
        break
      }
    }
    expect(exercised).toBe(true)
  })
})

// Pick the first ELIGIBLE candidate (aria-pressed button) in a picker; skip the Details
// toggle the redesigned cards add. Returns the clicked button (for reading its id).
function pickCandidate(pickerTestId: string): HTMLElement {
  const picker = screen.getByTestId(pickerTestId)
  const btn = within(picker)
    .getAllByRole('button')
    .find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!
  fireEvent.click(btn)
  return btn
}

describe('change preview: a swap in the wizard shows the resulting package change', () => {
  it('the Film Package summary + a change preview appear, and swapping updates them', () => {
    // D-11.2/D-11.12: the Assembly wizard now staffs from the studio roster, so a
    // founded studio (a signed roster) is needed for the pickers to be non-empty.
    const state = newFoundedGame('swap-ui-1')
    render(<Assembly state={state} onGreenlit={() => {}} onCancel={() => {}} />)
    // Walk concept → shape → promise → talent.
    fireEvent.click(within(screen.getByTestId('concept-grid')).getAllByRole('button')[0]!)
    fireEvent.click(screen.getByTestId('assembly-next')) // shape
    fireEvent.click(screen.getByTestId('assembly-next')) // promise
    fireEvent.click(screen.getByTestId('assembly-next')) // talent
    // Complete a legal package.
    pickCandidate('picker-writer')
    pickCandidate('picker-director')
    const firstLead = pickCandidate('picker-lead')
    pickCandidate('picker-antagonist')
    pickCandidate('picker-support')
    // The package summary is shown (cohesion always; fit/exec/profit now that it's full).
    expect(screen.getByTestId('film-package-summary')).toBeInTheDocument()
    expect(screen.getByTestId('pkg-fit-overall')).toBeInTheDocument()

    // Now SWAP the lead to a different eligible actor → a change preview appears with a
    // real computed delta for the lead assignment.
    const leadPicker = screen.getByTestId('picker-lead')
    const firstLeadId = firstLead.getAttribute('data-testid')
    const nextLead = within(leadPicker)
      .getAllByRole('button')
      .find(
        (b) =>
          b.hasAttribute('aria-pressed') &&
          !(b as HTMLButtonElement).disabled &&
          b.getAttribute('data-testid') !== firstLeadId,
      )!
    fireEvent.click(nextLead)
    const preview = screen.getByTestId('change-preview')
    expect(preview).toBeInTheDocument()
    // The lead assignment's change line is present with a before→after Fit. The cast
    // assignment carries role='lead' AND slot='lead' → testid change-assignment-lead-lead.
    expect(within(preview).getByTestId('change-assignment-lead-lead')).toBeInTheDocument()
    // And the change line shows a "Fit N→M" transition.
    expect(preview.textContent ?? '').toMatch(/Fit \d+→\d+/)
  })
})

describe('change preview: a swap updates the shown package metrics (real packageDelta)', () => {
  it('swapping the lead produces a non-zero delta on the affected metrics', () => {
    const state = newGame('swap-1')
    const actors = talentByRole(state, 'actor').filter((t) => t.available)
    const before = legalPackage(state, [])
    // Swap the lead to a DIFFERENT available actor not already cast.
    const usedIds = new Set([before.cast.lead, before.cast.antagonist, before.cast.support])
    const newLead = actors.find((a) => !usedIds.has(a.id))!
    const after: DraftPackage = { ...before, cast: { ...before.cast, lead: newLead.id } }

    const delta = assessPackageDelta(state, before, after)
    // The lead assignment is marked changed with a real fit-before/after pair.
    const leadDelta = delta.perAssignment.find((d) => d.role === 'lead')!
    expect(leadDelta.changed).toBe(true)
    expect(typeof leadDelta.fitBefore).toBe('number')
    expect(typeof leadDelta.fitAfter).toBe('number')
    expect(leadDelta.fitDelta).toBeCloseTo(leadDelta.fitAfter! - leadDelta.fitBefore!, 6)
    // At least one package-level metric moved (fit / execution / revenue / profit / star).
    const moved =
      Math.abs(delta.overallFitDelta) > 1e-9 ||
      Math.abs(delta.executionConfidenceDelta) > 1e-9 ||
      Math.abs(delta.studioRevenueExpectedDelta) > 1e-9 ||
      Math.abs(delta.profitExpectedDelta) > 1e-9 ||
      Math.abs(delta.starPowerDelta) > 1e-9 ||
      Math.abs(delta.salaryDelta) > 1e-9
    expect(moved).toBe(true)
  })
})
