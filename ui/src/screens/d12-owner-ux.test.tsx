// ── D-12 owner UX closure — regression coverage for the Phase-A clarity fixes ──
// After the owner's first hands-on D-12 playtest, a set of usability/explanation defects
// were fixed WITHOUT touching any economy formula, tuning constant, or save schema. This
// suite pins each fix so it cannot silently regress: Create-Custom-Talent discoverability
// (A1), Assembly step scroll/focus (A2), Production-Budget terminology (A3), Downside/
// Expected/Upside with Profit/Loss styling (A4), no unexplained FACT badge (A6), exact
// Expected-vs-Actual autopsy labels (A7), plain-English Delivered Talent Alignment + a
// collapsed Technical Details (A8), inspectable same-week secondary releases (A9), and the
// small-independent-studio founding copy (A10).

import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { Assembly } from './Assembly.tsx'
import { Dashboard } from './Dashboard.tsx'
import { Autopsy } from './Autopsy.tsx'
import { NewspaperReveal } from './NewspaperReveal.tsx'
import { FoundingScreen } from './FoundingScreen.tsx'
import { FilmPackageSummary } from '../components/FilmPackageSummary.tsx'
import {
  newGame,
  greenlight,
  advanceToNextEvent,
  explainRelease,
  autopsyCompare,
  releaseNewspaper,
  selectActiveProductions,
  requiredNegative,
  deliveredAlignmentReport,
} from '../engine/adapter.ts'
import type {
  GameState,
  DraftPackage,
  CreativeCohesion,
  ForecastProfitRange,
  NewspaperView,
} from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)

// A legal package from the founded roster's first available slots.
function pkgOf(state: GameState, actors: [number, number, number] = [0, 1, 2], w = 0, d = 0, c = 0): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const wr = foundedRosterIds(state, 'writer')
  const dr = foundedRosterIds(state, 'director')
  const ac = foundedRosterIds(state, 'actor')
  const cr = foundedRosterIds(state, 'craft')
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: wr[w]!,
    directorId: dr[d]!,
    craftIds: [cr[c]!],
    cast: { lead: ac[actors[0]]!, antagonist: ac[actors[1]]!, support: ac[actors[2]]! },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

// Pick the first ELIGIBLE candidate in a picker (the option toggle carries aria-pressed).
function pickFirstEligible(pickerTestId: string) {
  const picker = screen.getByTestId(pickerTestId)
  const btn = within(picker)
    .getAllByRole('button')
    .find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!
  fireEvent.click(btn)
  return btn
}

// Render the real Assembly (with the create-talent seam wired) and drive to the Talent step.
function openToTalentStep(seed: string, onStateChange: (s: GameState) => void = () => {}) {
  const state = newFoundedGame(seed)
  render(<Assembly state={state} onGreenlit={() => {}} onCancel={() => {}} onStateChange={onStateChange} />)
  const grid = screen.getByTestId('concept-grid')
  fireEvent.click(within(grid).getAllByRole('button')[0]!)
  fireEvent.click(screen.getByTestId('assembly-next')) // → shape
  fireEvent.click(screen.getByTestId('assembly-next')) // → promise
  fireEvent.click(screen.getByTestId('assembly-next')) // → talent
  return state
}

function fillTalent() {
  pickFirstEligible('picker-writer')
  pickFirstEligible('picker-director')
  pickFirstEligible('picker-lead')
  pickFirstEligible('picker-antagonist')
  pickFirstEligible('picker-support')
  pickFirstEligible('picker-craft')
}

// ── A1: Create Custom Talent discoverability + draft preservation ─────────────
describe('A1: Create Custom Talent is prominent on the Talent step and preserves the draft', () => {
  it('the Create Custom Talent action appears at the TOP of the Talent step, before the cast pickers', () => {
    openToTalentStep('ux-a1-top')
    const create = screen.getByTestId('talent-step-create')
    expect(create.textContent).toMatch(/create custom talent/i)
    const writer = screen.getByTestId('picker-writer')
    // The create action precedes the first cast picker in document order (not buried below).
    expect(create.compareDocumentPosition(writer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('opening the creator and returning keeps every film-package selection intact', () => {
    openToTalentStep('ux-a1-preserve')
    fillTalent()
    // With a complete team, Next is enabled.
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(false)
    // Open the embedded creator → the wizard is replaced by the creator, Assembly stays mounted.
    fireEvent.click(screen.getByTestId('talent-step-create'))
    expect(screen.getByTestId('creator-mode-toggle')).toBeInTheDocument()
    expect(screen.queryByTestId('picker-writer')).toBeNull()
    // Back → the Talent step returns with the draft intact (Next still enabled).
    fireEvent.click(screen.getByTestId('talent-creator-back'))
    expect(screen.getByTestId('picker-writer')).toBeInTheDocument()
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(false)
  })

  it('the create action is not shown when the create seam is unavailable (no onStateChange)', () => {
    const state = newFoundedGame('ux-a1-nocreate')
    render(<Assembly state={state} onGreenlit={() => {}} onCancel={() => {}} />)
    const grid = screen.getByTestId('concept-grid')
    fireEvent.click(within(grid).getAllByRole('button')[0]!)
    fireEvent.click(screen.getByTestId('assembly-next'))
    fireEvent.click(screen.getByTestId('assembly-next'))
    fireEvent.click(screen.getByTestId('assembly-next'))
    expect(screen.queryByTestId('talent-step-create')).toBeNull()
  })
})

// ── A2: step transition resets scroll and focuses the new heading ─────────────
describe('A2: moving Talent → Budget & Forecast focuses the new step heading', () => {
  it('after Next from Talent, the Budget & Forecast heading receives focus', () => {
    openToTalentStep('ux-a2-focus')
    fillTalent()
    fireEvent.click(screen.getByTestId('assembly-next')) // talent → budget
    const active = document.activeElement
    expect(active?.tagName).toBe('H2')
    expect((active?.textContent ?? '').trim()).toBe('Budget & Forecast')
  })
})

// ── A3: Production Budget terminology (no unexplained "Negative") ─────────────
describe('A3: the budget step uses Production Budget, with the negative-cost helper', () => {
  it('shows a Production Budget control and the negative-cost helper, not a bare "Negative budget"', () => {
    openToTalentStep('ux-a3-terms')
    fillTalent()
    fireEvent.click(screen.getByTestId('assembly-next')) // → budget
    expect(screen.getAllByText('Production Budget').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/negative cost/i)).toBeInTheDocument()
    expect(screen.queryByText('Negative budget')).toBeNull()
  })

  it('groups the decision under Your spending decision / Studio impact / Commercial outlook', () => {
    openToTalentStep('ux-a3-groups')
    fillTalent()
    fireEvent.click(screen.getByTestId('assembly-next')) // → budget
    expect(screen.getByText('Your spending decision')).toBeInTheDocument()
    expect(screen.getByText('Studio impact')).toBeInTheDocument()
    expect(screen.getByText('Commercial outlook')).toBeInTheDocument()
    // Studio impact surfaces solvency, capital exposure, and runway here (C1), not only at Review.
    // (The single reassuring "Affordable ✓" tick was replaced by separate Solvency + Exposure.)
    expect(screen.getByTestId('budget-solvency')).toBeInTheDocument()
    expect(screen.getByTestId('budget-exposure')).toBeInTheDocument()
    expect(screen.getByTestId('budget-runway')).toBeInTheDocument()
    // D-17A/T2: the break-even label is now sentence case and the headline is CYCLE-INCLUSIVE
    // (the direct-cost figure survives as labelled detail beneath it) — assert the displayed truth.
    expect(screen.getByText('Break-even theatrical gross')).toBeInTheDocument()
    expect(screen.getByTestId('budget-breakeven-direct')).toBeInTheDocument()
  })
})

// ── A4: Downside / Expected / Upside with Profit/Loss styling ─────────────────
describe('A4: forecast range reads Downside / Expected / Upside with explicit Profit/Loss', () => {
  const cohesion: CreativeCohesion = {
    score: 60,
    tier: 'mixed',
    strengths: [],
    conflicts: [],
    explanation: '',
    talentIndependent: true,
  }
  // A crafted range: a negative downside (loss) and a positive upside (profit).
  const profit: ForecastProfitRange = {
    studioRevenue: { low: 1_000_000, expected: 5_000_000, high: 9_000_000 },
    profit: { low: -2_000_000, expected: 3_000_000, high: 8_000_000 },
    breakEven: 7_000_000,
    committedCost: 4_000_000,
    confidence: 'medium',
    upsideDrivers: [],
    downsideRisks: [],
    studioRevenueIsFullBoxOffice: false,
  }

  it('labels the triple Downside/Expected/Upside and renames break-even', () => {
    render(<FilmPackageSummary cohesion={cohesion} profit={profit} />)
    expect(screen.getAllByText('Downside').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Expected').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Upside').length).toBeGreaterThanOrEqual(2)
    // D-17A/T2: the package panel's break-even is explicitly the DIRECT-cost figure now, so it
    // cannot be confused with Assembly's cycle-inclusive headline.
    expect(screen.getByText('Break-even theatrical gross (direct costs only)')).toBeInTheDocument()
  })

  it('a negative downside contribution is marked as a Loss (red), never color-only', () => {
    render(<FilmPackageSummary cohesion={cohesion} profit={profit} />)
    const downside = screen.getByTestId('pkg-profit-contribution-downside')
    const fig = within(downside).getByText(/Loss/)
    expect(fig.className).toContain('money neg')
    expect(fig.textContent).toMatch(/·\s*Loss/)
  })

  it('positive contribution figures are labeled Profit (green), for expected and upside', () => {
    render(<FilmPackageSummary cohesion={cohesion} profit={profit} />)
    const contrib = screen.getByTestId('pkg-profit-profit')
    const profitFigs = within(contrib).getAllByText(/·\s*Profit/)
    expect(profitFigs.length).toBeGreaterThanOrEqual(2) // expected + upside
    for (const f of profitFigs) expect(f.className).toContain('money pos')
  })
})

// ── A6: no unexplained FACT badge on the in-production card ────────────────────
describe('A6: the in-production card shows a meaningful status, not an unexplained FACT', () => {
  it('a film in production reads "In production" and carries no bare Fact/FACT text', () => {
    let s = newFoundedGame('ux-a6-fact')
    const g = greenlight(s, pkgOf(s))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    s = g.next
    render(
      <Dashboard
        state={s}
        onAssemble={vi.fn()}
        onAdvance={vi.fn()}
        onSimToEvent={vi.fn()}
        onCreateTalent={vi.fn()}
        onSaves={vi.fn()}
        onOpenAutopsy={vi.fn()}
      />,
    )
    const active = selectActiveProductions(s)[0]!
    const card = screen.getByTestId(`active-${active.id}`)
    // The card's status pill now reads a meaningful "In production" (was a bare "Fact").
    expect(within(card).getByText('In production')).toBeInTheDocument()
    // The confusing epistemic badge is gone.
    expect(screen.queryByText('Fact')).toBeNull()
    expect(screen.queryByText('FACT')).toBeNull()
    // The forecast label is named exactly.
    expect(screen.getByText('Expected total theatrical gross')).toBeInTheDocument()
  })
})

// ── A7 / A8: autopsy labels + delivered-alignment plain English + Technical Details ─
describe('A7/A8: autopsy Expected-vs-Actual labels and plain-English alignment', () => {
  function releasedView(seed: string) {
    let s = newFoundedGame(seed)
    s = (greenlight(s, pkgOf(s)) as { ok: true; next: GameState }).next
    const rel = advanceToNextEvent(s)
    const film = rel.released[0]!
    const view = explainRelease(rel.preTick, rel.next.studio.standing, film)
    const compare = autopsyCompare(rel.preTick, film)
    return { view, compare }
  }

  it('A7: Advanced Analysis names Expected/Actual Critic Score and Total Theatrical Gross', () => {
    const { view, compare } = releasedView('ux-a7-labels')
    render(<Autopsy view={view} compare={compare} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId('autopsy-advanced-toggle'))
    expect(screen.getByText('Expected Critic Score')).toBeInTheDocument()
    expect(screen.getByText('Actual Critic Score')).toBeInTheDocument()
    expect(screen.getByText('Expected Total Theatrical Gross')).toBeInTheDocument()
    expect(screen.getByText('Actual Total Theatrical Gross')).toBeInTheDocument()
    // The old ambiguous labels are gone.
    expect(screen.queryByText('Forecast critic (estimate)')).toBeNull()
    expect(screen.queryByText('Realized total (result)')).toBeNull()
  })

  it('A8: the default view explains Delivered Talent Alignment in plain English', () => {
    const { view, compare } = releasedView('ux-a8-plain')
    render(<Autopsy view={view} compare={compare} onBack={() => {}} />)
    const card = screen.getByTestId('autopsy-alignment-summary')
    // A 0–100 score + band badge.
    expect(screen.getByTestId('autopsy-alignment-band').textContent).toMatch(/\d+\/100 · (Weak|Mixed|Strong)/)
    // A non-empty prose summary…
    expect((screen.getByTestId('autopsy-alignment-text').textContent ?? '').length).toBeGreaterThan(0)
    // …and the explicit distinction between the two concepts.
    expect(within(card).getByText(/Creative Brief Coherence/)).toBeInTheDocument()
    expect(within(card).getByText(/Delivered Talent Alignment/)).toBeInTheDocument()
  })

  it('A8: raw contributor vectors live in a Technical Details disclosure, collapsed by default', () => {
    const { view, compare } = releasedView('ux-a8-tech')
    render(<Autopsy view={view} compare={compare} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId('autopsy-advanced-toggle'))
    const details = screen.getByTestId('autopsy-technical-details') as HTMLDetailsElement
    expect(details.tagName).toBe('DETAILS')
    expect(details.hasAttribute('open')).toBe(false) // collapsed by default
    // The axis definitions (both poles) are present inside it.
    expect(within(details).getByText('Cold / distant')).toBeInTheDocument()
    expect(within(details).getByText('Warm / personal')).toBeInTheDocument()
    // Sign/magnitude are explained, not left as bare coordinates.
    expect(within(details).getByText(/sign/i)).toBeInTheDocument()
    expect(within(details).getByText(/magnitude/i)).toBeInTheDocument()
  })

  it('A8 (unit): deliveredAlignmentReport derives a band + opposed/aligned pair from the vectors', () => {
    const { view } = releasedView('ux-a8-unit')
    const rep = deliveredAlignmentReport(view)
    expect(rep.score).toBe(Math.round(view.cohesion * 100))
    expect(['Weak', 'Mixed', 'Strong']).toContain(rep.band)
    expect(rep.pairs.length).toBe(10) // C(5,2) contributor pairs
    expect(rep.mostAligned).not.toBeNull()
    expect(rep.mostOpposed).not.toBeNull()
    // agreement is a cosine in [-1, 1]; aligned ≥ opposed.
    expect(rep.mostAligned!.agreement).toBeGreaterThanOrEqual(rep.mostOpposed!.agreement)
    for (const p of rep.pairs) {
      expect(p.agreement).toBeGreaterThanOrEqual(-1)
      expect(p.agreement).toBeLessThanOrEqual(1)
    }
  })
})

// ── A9: every same-week release is fully inspectable ──────────────────────────
describe('A9: same-week secondary releases carry full reception + financials', () => {
  it('a secondary story shows title, critic, audience, opening, paid, projected totals and an autopsy link', () => {
    let s = newFoundedGame('ux-a9-secondary')
    s = (greenlight(s, pkgOf(s)) as { ok: true; next: GameState }).next
    const rel = advanceToNextEvent(s)
    const film = rel.released[0]!
    const primary = releaseNewspaper(rel.next, film)!
    // A distinct second front page with recognizable financials (pure-presentation stand-in).
    const secondary: NewspaperView = {
      ...primary,
      filmTitle: 'Second Feature',
      headline: 'SECOND FEATURE OPENS',
      financial: {
        ...primary.financial,
        openingGross: 12_345_678,
        studioRevenueThisWeek: 6_420_000,
        projectedTotalGross: 30_000_000,
        projectedTotalStudioRevenue: 15_600_000,
      },
    }
    let opened = -1
    render(
      <NewspaperReveal views={[primary, secondary]} onOpenAutopsy={(i) => (opened = i)} onContinue={() => {}} />,
    )
    const story = screen.getByTestId('newspaper-secondary-1')
    // Title, critic, audience are all present for the secondary.
    expect(screen.getByTestId('newspaper-secondary-title-1').textContent).toBe('Second Feature')
    expect(within(story).getByTestId('newspaper-secondary-critic-1').textContent).toMatch(/Critics/)
    expect(within(story).getByTestId('newspaper-secondary-audience-1').textContent).toMatch(/Audiences/)
    // Opening + paid-this-week + projected totals are all shown (recognizable figures).
    expect(story.textContent).toContain('$12.35M') // opening gross
    expect(within(story).getByTestId('newspaper-secondary-paid-1').textContent).toContain('$6.42M')
    expect(story.textContent).toContain('$30.00M') // projected total gross
    expect(within(story).getByTestId('newspaper-secondary-contribution-1')).toBeInTheDocument()
    // …and its own autopsy link routes to THIS film.
    fireEvent.click(within(story).getByTestId('newspaper-secondary-autopsy-1'))
    expect(opened).toBe(1)
  })
})

// ── A10: founding explains the small-independent studio + team capacity ───────
//
// C2a-M4 RE-BASE WITH ITS NAMED SUCCESSOR (charter §11.8 item 8). The pin was
// `/two productions/i` — the founding prose's copy of the deleted cap (owner law
// 1). Its stated successor "teaches capacity-derived throughput, not a fixed
// number", so the successor assertions are: the copy REFUSES a fixed number,
// names the ROOMS as the thing that limits the slate, and tells the player what
// happens when they ask for more than the lot can carry — it waits.
describe('A10: founding sets the small-studio expectation up front', () => {
  it('teaches capacity-derived throughput, not a production cap, before any staffing block', () => {
    const state = newGame('ux-a10-intro') // opens in the founding draft
    render(<FoundingScreen state={state} onChange={vi.fn()} onCreate={vi.fn()} onFounded={vi.fn()} />)
    const intro = screen.getByTestId('founding-intro')
    expect(within(intro).getByText(/small independent studio/i)).toBeInTheDocument()
    expect(intro.textContent).toMatch(/not a fixed number/i)
    expect(intro.textContent).toMatch(/rooms you have built/i)
    expect(intro.textContent).toMatch(/waits in the queue/i)
    expect(intro.textContent).toMatch(/complete, available team/i)
    // The retired sentence may not come back by accident.
    expect(intro.textContent).not.toMatch(/up to two productions/i)
  })
})
