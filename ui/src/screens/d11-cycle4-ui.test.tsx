// ── Phase 5.2A cycle-4 UI suite (D-11.D) ─────────────────────────────────────
// Three owner-ruled Cycle 4A UX corrections, asserted on RENDERED output + the pure
// adapter read-models (no mocked engine):
//   1. Founding — profession-based discovery: sorting uses the selected REAL field,
//      filters never cross professions or present ineligible rows, and ONE writer founds.
//   2. Accessible autopsy — a concise result/worked/hurt/surprise/lesson/grade synthesized
//      from stored factors, with the technical report preserved (collapsed) under Advanced
//      Analysis; the default view exposes no raw sigma/vectors.
//   3. Creator terminology — Starting Skill Profile / Career Potential / Work Ethic clearly
//      separated; the "High-Upside" duplication removed from the profile dropdown.

import { useState } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { TalentCreator } from './TalentCreator.tsx'
import { FoundingScreen } from './FoundingScreen.tsx'
import { Autopsy } from './Autopsy.tsx'
import {
  newGame,
  foundingApplicantRows,
  sortFoundingRows,
  filterFoundingRows,
  FOUNDING_FILTERS_NONE,
  accessibleAutopsy,
  greenlight,
  advanceWeek,
  explainRelease,
  autopsyCompare,
  requiredNegative,
  selectActiveProductions,
} from '../engine/adapter.ts'
import type {
  GameState,
  DraftPackage,
  FilmResult,
  AutopsyView,
  AutopsyCompareView,
} from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'
import { applyActions } from '../../../src/core/index.ts'

afterEach(cleanup)

// ── PART 1 — Founding discovery (sort / filter / one-writer) ─────────────────

describe('D-11.D founding: sorting uses the SELECTED real field', () => {
  it('sorts by OVR / fame (descending) and age / salary (ascending)', () => {
    const rows = foundingApplicantRows(newGame('c4-sort'), 'actor')
    expect(rows.length).toBeGreaterThan(2)
    const mono = (arr: number[], asc: boolean) =>
      arr.every((v, i) => i === 0 || (asc ? arr[i - 1]! <= v : arr[i - 1]! >= v))
    expect(mono(sortFoundingRows(rows, 'ovr').map((r) => r.ovr), false)).toBe(true)
    expect(mono(sortFoundingRows(rows, 'fame').map((r) => r.fame), false)).toBe(true)
    expect(mono(sortFoundingRows(rows, 'workEthic').map((r) => r.workEthic), false)).toBe(true)
    expect(mono(sortFoundingRows(rows, 'age').map((r) => r.age), true)).toBe(true)
    expect(mono(sortFoundingRows(rows, 'salary').map((r) => r.annualSalary), true)).toBe(true)
    expect(mono(sortFoundingRows(rows, 'signingBonus').map((r) => r.signingBonus), true)).toBe(true)
  })
})

describe('D-11.D founding: filters are truthful and never cross professions', () => {
  it('foundingApplicantRows(role) returns ONLY that profession', () => {
    const state = newGame('c4-prof')
    for (const role of ['actor', 'writer', 'director', 'craft'] as const) {
      const rows = foundingApplicantRows(state, role)
      expect(rows.length).toBeGreaterThan(0)
      expect(rows.every((r) => r.role === role)).toBe(true)
    }
  })

  it('each filter only removes rows that fail it (no filter = every row)', () => {
    const rows = foundingApplicantRows(newGame('c4-filt'), 'actor')
    expect(filterFoundingRows(rows, FOUNDING_FILTERS_NONE).length).toBe(rows.length)
    expect(
      filterFoundingRows(rows, { ...FOUNDING_FILTERS_NONE, minOVR: 55 }).every((r) => r.ovr >= 55),
    ).toBe(true)
    expect(
      filterFoundingRows(rows, { ...FOUNDING_FILTERS_NONE, createdOnly: true }).every((r) => r.authored),
    ).toBe(true)
    expect(
      filterFoundingRows(rows, { ...FOUNDING_FILTERS_NONE, profile: 'multiHyphenate' }).every(
        (r) => r.multiHyphenate,
      ),
    ).toBe(true)
    expect(
      filterFoundingRows(rows, { ...FOUNDING_FILTERS_NONE, profile: 'specialist' }).every(
        (r) => !r.multiHyphenate,
      ),
    ).toBe(true)
    expect(
      filterFoundingRows(rows, { ...FOUNDING_FILTERS_NONE, affordableOnly: true }).every((r) => r.affordable),
    ).toBe(true)
  })
})

function FoundingHarness({ seed, onFounded }: { seed: string; onFounded: (s: GameState) => void }) {
  const [s, setS] = useState<GameState>(() => newGame(seed))
  return <FoundingScreen state={s} onChange={setS} onCreate={() => {}} onFounded={onFounded} />
}

describe('D-11.D founding: ONE writer suffices to found (tabbed flow)', () => {
  it('signing 3 actors / 1 director / 1 writer / 1 craft founds the studio', () => {
    let founded: GameState | null = null
    render(<FoundingHarness seed="c4-found" onFounded={(s) => (founded = s)} />)
    const foundBtn = () => screen.getByTestId('found-studio') as HTMLButtonElement
    const signN = (role: string, n: number) => {
      fireEvent.click(screen.getByTestId(`founding-tab-${role}`))
      for (let i = 0; i < n; i++) {
        const group = screen.getByTestId(`founding-group-${role}`)
        const btn = within(group)
          .getAllByRole('button')
          .find((b) => (b.getAttribute('data-testid') ?? '').startsWith('founding-sign-'))!
        fireEvent.click(btn)
      }
    }
    expect(foundBtn().disabled).toBe(true) // no roster yet
    signN('actor', 3)
    signN('director', 1)
    signN('writer', 1) // ONE writer — the D-11.D minimum
    signN('craft', 1)
    // The writer requirement reads met at 1 of 1.
    expect(screen.getByTestId('founding-coverage-writer').textContent ?? '').toContain('1/1')
    expect(foundBtn().disabled).toBe(false) // minimums met with a single writer
    fireEvent.click(foundBtn())
    expect(founded).not.toBeNull()
    expect(founded!.founding).toBeNull() // studio founded
    expect(founded!.contracts.length).toBe(6) // 3 + 1 + 1 + 1 — exactly one writer
  })
})

// ── PART 2 — Accessible autopsy ──────────────────────────────────────────────

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: foundedRosterIds(state, 'writer')[0]!,
    directorId: foundedRosterIds(state, 'director')[0]!,
    craftIds: [foundedRosterIds(state, 'craft')[0]!],
    cast: {
      lead: foundedRosterIds(state, 'actor')[0]!,
      antagonist: foundedRosterIds(state, 'actor')[1]!,
      support: foundedRosterIds(state, 'actor')[2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}
function playToRelease(seed: string): { view: AutopsyView; compare: AutopsyCompareView | null } {
  let state = newFoundedGame(seed)
  const g = greenlight(state, legalPackage(state))
  if (!g.ok) throw new Error('setup: greenlight failed: ' + g.error)
  state = g.next
  let released: FilmResult[] = []
  let preTick = state
  let postStanding = state.studio.standing
  for (let i = 0; i < 20 && released.length === 0; i++) {
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
    preTick = step.preTick
    state = step.next
    postStanding = state.studio.standing
    released = step.released
  }
  if (released.length === 0) throw new Error('setup: nothing released')
  const film = released[0]!
  return { view: explainRelease(preTick, postStanding, film), compare: autopsyCompare(preTick, film) }
}

// A minimal AutopsyView carrying only the fields accessibleAutopsy reads.
function mkView(o: {
  cohesion: number
  criticScore: number
  total: number
  profit: number
  was?: number
  mismatch?: number
  expCritic?: number
  expTotal?: number
}): AutopsyView {
  return {
    conceptTitle: 'Test Film',
    criticScore: o.criticScore,
    cohesion: o.cohesion,
    weightedAudienceScore: o.was ?? 55,
    promiseMismatch: o.mismatch ?? 0.2,
    profit: o.profit,
    boxOffice: { opening: o.total / 2, total: o.total },
    forecast: { expectedCriticScore: o.expCritic ?? o.criticScore, expectedTotal: o.expTotal ?? o.total },
  } as unknown as AutopsyView
}

describe('D-11.D accessible autopsy: concise, truthful, decision-graded', () => {
  it('maps result / worked / hurt / surprise / lesson from a REAL released film', () => {
    const { view, compare } = playToRelease('c4-autopsy')
    const a = accessibleAutopsy(view, compare)
    // The result mirrors the stored numbers exactly.
    expect(a.criticScore).toBe(view.criticScore)
    expect(a.revenue).toBe(view.boxOffice.total)
    expect(a.profit).toBe(view.profit)
    expect(a.profitable).toBe(view.profit >= 0)
    // Bounded, populated narrative.
    expect(a.whatWorked.length).toBeLessThanOrEqual(3)
    expect(a.whatHurt.length).toBeLessThanOrEqual(3)
    expect(a.lessons.length).toBeGreaterThanOrEqual(1)
    expect(a.biggestSurprise.length).toBeGreaterThan(0)
    // The grade is one of the four real-threshold labels.
    expect([
      'Good film, good investment',
      'Creative success, commercial failure',
      'Commercial hit, critical disappointment',
      'Weak film, poor investment',
    ]).toContain(a.grade)
  })

  it('the decision grade uses real film-quality × investment thresholds (all four quadrants)', () => {
    const grade = (cohesion: number, critic: number, profit: number) =>
      accessibleAutopsy(mkView({ cohesion, criticScore: critic, total: 10_000_000, profit }), null).grade
    expect(grade(0.6, 60, 5_000_000)).toBe('Good film, good investment')
    expect(grade(0.6, 60, -5_000_000)).toBe('Creative success, commercial failure')
    expect(grade(0.2, 40, 5_000_000)).toBe('Commercial hit, critical disappointment')
    expect(grade(0.2, 40, -5_000_000)).toBe('Weak film, poor investment')
  })
})

describe('D-11.D autopsy: accessible default + Advanced Analysis (collapsed, preserved)', () => {
  it('shows the concise summary and hides the technical report until expanded', () => {
    const { view, compare } = playToRelease('c4-autopsy-render')
    render(<Autopsy view={view} compare={compare} onBack={() => {}} />)
    // The accessible sections render by default.
    for (const id of ['autopsy-summary', 'autopsy-grade', 'autopsy-worked', 'autopsy-hurt', 'autopsy-surprise', 'autopsy-lessons']) {
      expect(screen.getByTestId(id)).toBeInTheDocument()
    }
    // The default summary exposes NO raw sigma/vectors.
    expect(screen.getByTestId('autopsy-summary').textContent ?? '').not.toMatch(/sigma|σ/i)
    // The technical report is MOUNTED but collapsed (hidden) by default — nothing is lost.
    const advanced = screen.getByTestId('autopsy-advanced')
    expect(advanced).toBeInTheDocument()
    expect(advanced.hasAttribute('hidden')).toBe(true)
    // Expanding reveals the preserved detail (criticmean + reviewvariance still present).
    fireEvent.click(screen.getByTestId('autopsy-advanced-toggle'))
    expect(screen.getByTestId('autopsy-advanced').hasAttribute('hidden')).toBe(false)
    expect(screen.getByTestId('autopsy-criticmean')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-reviewvariance')).toBeInTheDocument()
  })
})

// ── PART 3 — Creator terminology ─────────────────────────────────────────────

describe('D-11.D creator: clear terminology, no High-Upside duplication', () => {
  it('renames the confusing labels and shows the concept legend', () => {
    render(<TalentCreator state={newGame('c4-creator')} onCreated={() => {}} onBack={() => {}} />)
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Term Test' } })
    fireEvent.click(screen.getByTestId('balanced-next')) // → profession stage
    expect(screen.getAllByText('Starting Skill Profile').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Career Potential').length).toBeGreaterThan(0)
    // The confusing old labels are gone.
    expect(screen.queryByText('Career archetype')).toBeNull()
    expect(screen.queryByText('Potential tier')).toBeNull()
    // The three-concept legend is shown.
    expect(screen.getByTestId('creator-concept-legend')).toBeInTheDocument()
  })

  it('the "High-Upside" duplication is removed from the Starting Skill Profile dropdown', () => {
    render(<TalentCreator state={newGame('c4-creator2')} onCreated={() => {}} onBack={() => {}} />)
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Dup Test' } })
    fireEvent.click(screen.getByTestId('balanced-next'))
    const preset = screen.getByTestId('balanced-preset') as HTMLSelectElement
    const labels = Array.from(preset.options).map((o) => o.textContent)
    expect(labels).not.toContain('High-Upside Prospect') // no longer a skill-profile label
    expect(labels).toContain('Raw Prospect') // relabelled to describe current ability
  })
})
