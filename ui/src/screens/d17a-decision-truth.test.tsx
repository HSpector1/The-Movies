// ── D-17A decision-truth UI proofs ────────────────────────────────────────────
// One file per D-17A player-facing truth claim. Every assertion drives the REAL adapter
// read-models on a REAL engine state — nothing is fabricated, and no expected value is
// hardcoded that the engine could disagree with.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react'
import { Dashboard } from './Dashboard.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { Assembly } from './Assembly.tsx'
import { FilmPackageSummary } from '../components/FilmPackageSummary.tsx'
import { FilmReadiness } from '../components/FilmReadiness.tsx'
import { DiscoveryExposureLine } from '../components/DiscoveryExposure.tsx'
import {
  affordabilityScopes,
  assessDiscoveryExposure,
  cycleInclusiveBreakEvenGross,
  marketingEfficiency,
  prospectiveCycleFixedCost,
  requiredNegative,
  MARKETING_BUDGET_LEVELS,
  financeCard,
  payrollSummary,
  TUNING,
} from '../engine/adapter.ts'
import type {
  DraftPackage,
  CreativeCohesion,
  CycleFixedCost,
  ExecutionConfidence,
  ForecastProfitRange,
  GameState,
  PackageFit,
} from '../engine/adapter.ts'
import { money, moneyExact, pct } from '../format.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

// The cheapest legal package from the contracted roster — used to build a deliberately
// UNSUPPORTED film (unknown cast, minimum marketing) for the exposed branch.
function cheapestVisiblePackage(state: GameState): DraftPackage {
  const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const actors = foundedRosterIds(state, 'actor')
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
    },
    writerId: foundedRosterIds(state, 'writer')[0]!,
    directorId: foundedRosterIds(state, 'director')[0]!,
    craftIds: [foundedRosterIds(state, 'craft')[0]!],
    cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 100_000 },
  }
}

afterEach(cleanup)

const noop = () => {}

// Pick the first ELIGIBLE candidate in a picker (its option toggle carries aria-pressed).
function pickFirstEligible(pickerTestId: string) {
  const picker = screen.getByTestId(pickerTestId)
  const btn = within(picker)
    .getAllByRole('button')
    .find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!
  fireEvent.click(btn)
}

// Drive the real wizard to a step (the same clicks a player makes), returning the state.
function openWizard(seed: string, to: 'budget' | 'review'): GameState {
  const state = newFoundedGame(seed)
  render(<Assembly state={state} onGreenlit={noop} onCancel={noop} />)
  const grid = screen.getByTestId('concept-grid')
  fireEvent.click(within(grid).getAllByRole('button')[0]!)
  fireEvent.click(screen.getByTestId('assembly-next')) // → shape
  fireEvent.click(screen.getByTestId('assembly-next')) // → promise
  fireEvent.click(screen.getByTestId('assembly-next')) // → talent
  for (const p of ['writer', 'director', 'lead', 'antagonist', 'support', 'craft']) {
    pickFirstEligible(`picker-${p}`)
  }
  fireEvent.click(screen.getByTestId('assembly-next')) // → budget
  if (to === 'review') fireEvent.click(screen.getByTestId('assembly-next')) // → review
  return state
}

// The EXACT immediate commitment the screen itself is pricing, read off the screen's own
// `committed-cost` / `release-commitment` figure (moneyExact). Re-deriving the package in the
// test would be a second implementation of the wizard's talent choice — and the first eligible
// candidate in a picker may be a freelancer, whose fee the test would have to guess.
function committedOnScreen(testid: 'committed-cost' | 'release-commitment'): number {
  const text = screen.getByTestId(testid).textContent ?? ''
  return Number(text.replace(/[^0-9.-]/g, ''))
}

function renderDashboard(state: GameState) {
  return render(
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
}

function renderRoster(state: GameState) {
  return render(<StudioRoster state={state} onChange={noop} onBack={noop} />)
}

// ═══════════════════════════════════════════════════════════════════════════════
// T1 — ONE RUNWAY. The 186-wk-vs-72-wk contradiction's regression guard.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T1 — the Roster and the Dashboard show ONE runway', () => {
  it('roster-runway is character-for-character the Dashboard runway on the same state', () => {
    const state = newFoundedGame('d17a-runway-1')

    renderDashboard(state)
    const dash = screen.getByTestId('fin-runway').textContent
    cleanup()

    renderRoster(state)
    const roster = screen.getByTestId('roster-runway').textContent

    expect(roster).toBe(dash)
  })

  it('the roster runway equals the authoritative runway read-model, and the retired payroll-only figure was strictly longer', () => {
    const state = newFoundedGame('d17a-runway-2')
    const fin = financeCard(state)
    const pay = payrollSummary(state)

    // Same object, same rule: payrollSummary now delegates to economyView.runway.
    expect(pay.runway).toEqual(fin.runway)
    expect(pay.runway.infinite).toBe(false)

    renderRoster(state)
    expect(screen.getByTestId('roster-runway').textContent).toContain(`${pay.runway.weeks!} wk`)

    // TEETH: the retired basis (cash ÷ weekly PAYROLL, ignoring overhead and run revenue)
    // reported a materially LONGER runway on this very state — that was the contradiction.
    const retiredPayrollOnly = Math.floor(state.studio.cash / pay.weeklyPayroll)
    expect(retiredPayrollOnly).toBeGreaterThan(pay.runway.weeks!)
  })

  it('uses the same unit string as the Dashboard ("wk", never "wks")', () => {
    const state = newFoundedGame('d17a-runway-3')
    renderRoster(state)
    const text = screen.getByTestId('roster-runway').textContent ?? ''
    expect(text).not.toMatch(/wks/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T2 / R7 — ONE break-even headline, and it is the STUDIO-ECONOMIC one.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T2 — the break-even headline is cycle-inclusive', () => {
  it('Budget & Forecast headlines the cycle-inclusive figure and keeps the direct figure labelled', () => {
    const state = openWizard('d17a-be-1', 'budget')
    const be = cycleInclusiveBreakEvenGross(state, committedOnScreen('committed-cost'))

    // The headline IS the studio-economic figure, and it is strictly larger than direct.
    expect(screen.getByTestId('budget-breakeven').textContent).toContain(money(be.cycleInclusive))
    expect(be.cycleInclusive).toBeGreaterThan(be.direct)

    // The direct figure survives, explicitly labelled as direct-costs-only.
    const direct = screen.getByTestId('budget-breakeven-direct')
    expect(direct.textContent).toContain(money(be.direct))
    expect(direct.textContent).toMatch(/direct costs only/i)
  })

  it('shared occupancy is a NAMED second line at concurrency 2 — never blended, never a fraction', () => {
    const state = openWizard('d17a-be-2', 'budget')
    const committed = committedOnScreen('committed-cost')
    const shared = cycleInclusiveBreakEvenGross(state, committed, { concurrency: 2 })
    const sole = cycleInclusiveBreakEvenGross(state, committed)

    const line = screen.getByTestId('budget-breakeven-shared')
    expect(line.textContent).toContain(money(shared.cycleInclusive))
    expect(line.textContent).toMatch(/if a second film shares those 14 weeks/i)
    // Sharing the cycle LOWERS the bar, but never below the direct-cost figure.
    expect(shared.cycleInclusive).toBeLessThan(sole.cycleInclusive)
    expect(shared.cycleInclusive).toBeGreaterThan(sole.direct)
    // No blended-occupancy scalar anywhere in the block.
    const block = screen.getByTestId('budget-breakeven-block').textContent ?? ''
    expect(block).not.toMatch(/concurrency/i)
    expect(block).not.toMatch(/1\.\d+ films?/i)
  })

  it('names its assumption: 8 + 6 weeks at today’s weekly burn, with no decimal on the week count', () => {
    const state = openWizard('d17a-be-3', 'budget')
    const fc = cycleInclusiveBreakEvenGross(state, committedOnScreen('committed-cost')).fixedCost

    const note = screen.getByTestId('budget-breakeven-assumption').textContent ?? ''
    expect(fc.weeks).toBe(TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS)
    expect(fc.concurrency).toBe(1) // the conservative default the copy claims
    expect(note).toContain(`${TUNING.PRODUCTION_TICKS} weeks in production`)
    expect(note).toContain(`${TUNING.THEATRICAL_WEEKS} weeks in release`)
    expect(note).toContain(money(fc.weeklyBurn))
    expect(note).toContain(money(fc.amount))
    // The 14-week extrapolation is never rendered with a decimal.
    expect(note).not.toMatch(/\b14\.\d/)
    expect(note).toMatch(/all 14 weeks/)
  })

  it('the Review step headlines the same cycle-inclusive figure as Budget & Forecast', () => {
    const state = openWizard('d17a-be-4', 'review')
    const be = cycleInclusiveBreakEvenGross(state, committedOnScreen('release-commitment'))
    expect(screen.getByTestId('release-breakeven').textContent).toContain(money(be.cycleInclusive))
    expect(screen.getByTestId('release-breakeven-direct').textContent).toContain(money(be.direct))
    expect(screen.getByTestId('release-breakeven-shared')).toBeInTheDocument()
    expect(screen.getByTestId('release-breakeven-assumption')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T2 — the WRONG-SIGN defect: a green "Profit" whose studio-economic branch is negative.
// ═══════════════════════════════════════════════════════════════════════════════
const COHESION: CreativeCohesion = {
  score: 60,
  tier: 'mixed',
  strengths: [],
  conflicts: [],
  explanation: '',
  talentIndependent: true,
}
const FIT: PackageFit = {
  overall: 70,
  perAssignment: [],
  strongest: {
    role: 'writer',
    talentId: 'w',
    talentName: 'W',
    discipline: 'writing',
    fit: 80,
    expected: { low: 60, high: 80, expected: 70 },
    unproven: false,
  },
  weakest: {
    role: 'lead',
    slot: 'lead',
    talentId: 'l',
    talentName: 'L',
    discipline: 'acting',
    fit: 60,
    expected: { low: 50, high: 70, expected: 60 },
    unproven: false,
  },
  unfilled: [],
}
const EXECUTION: ExecutionConfidence = {
  score: 60,
  tier: 'mixed',
  explanation: '',
  confidenceSources: [],
  uncertaintySources: [],
}
// A package that CLEARS its direct costs at every band, but not the studio's 14 weeks.
const CLEARS_DIRECT_ONLY: ForecastProfitRange = {
  studioRevenue: { low: 5_000_000, expected: 6_000_000, high: 7_000_000 },
  profit: { low: 1_000_000, expected: 2_000_000, high: 3_000_000 },
  breakEven: 7_000_000,
  committedCost: 4_000_000,
  confidence: 'medium',
  upsideDrivers: [],
  downsideRisks: [],
  studioRevenueIsFullBoxOffice: false,
}
const FIXED_4M: CycleFixedCost = { weeks: 14, weeklyBurn: 285_714, concurrency: 1, amount: 4_000_000 }

describe('D-17A/T2 — no green Profit while the studio-economic branch is negative', () => {
  it('a contribution that covers direct costs but not the studio weeks is neutral and says so', () => {
    render(<FilmPackageSummary cohesion={COHESION} profit={CLEARS_DIRECT_ONLY} cycleFixedCost={FIXED_4M} />)
    for (const band of ['downside', 'expected', 'upside']) {
      const fig = screen.getByTestId(`pkg-profit-contribution-${band}`)
      expect(fig.textContent).toMatch(/Covers direct costs/)
      expect(fig.textContent).not.toMatch(/·\s*Profit/)
      expect(within(fig).getByText(/Covers direct costs/).className).not.toContain('money pos')
      // …and the negative studio-economic figure is shown right beside it.
      expect(fig.textContent).toMatch(/after studio fixed costs/)
    }
  })

  it('renders the studio-economic triple as contribution minus the cycle fixed cost', () => {
    render(<FilmPackageSummary cohesion={COHESION} profit={CLEARS_DIRECT_ONLY} cycleFixedCost={FIXED_4M} />)
    const bands = [
      ['downside', CLEARS_DIRECT_ONLY.profit.low],
      ['expected', CLEARS_DIRECT_ONLY.profit.expected],
      ['upside', CLEARS_DIRECT_ONLY.profit.high],
    ] as const
    for (const [band, value] of bands) {
      const fig = screen.getByTestId(`pkg-studio-economic-${band}`)
      expect(fig.textContent).toContain(money(value - FIXED_4M.amount))
      expect(fig.textContent).toMatch(/·\s*Loss/)
    }
    expect(screen.getByTestId('pkg-studio-economic-disclosure').textContent).toMatch(
      /labelled managerial measure, not a charge against the film/i,
    )
  })

  it('a genuinely studio-positive package still reads Profit, in green', () => {
    const clearsBoth: ForecastProfitRange = {
      ...CLEARS_DIRECT_ONLY,
      profit: { low: 5_000_000, expected: 6_000_000, high: 7_000_000 },
    }
    render(<FilmPackageSummary cohesion={COHESION} profit={clearsBoth} cycleFixedCost={FIXED_4M} />)
    const fig = screen.getByTestId('pkg-profit-contribution-expected')
    expect(within(fig).getByText(/·\s*Profit/).className).toContain('money pos')
    expect(fig.textContent).not.toMatch(/after studio fixed costs/)
  })

  it('the section is still Film Contribution on the DIRECT basis (D-12 §3/§8 preserved)', () => {
    render(<FilmPackageSummary cohesion={COHESION} profit={CLEARS_DIRECT_ONLY} cycleFixedCost={FIXED_4M} />)
    expect(screen.getByText('Film Contribution')).toBeInTheDocument()
    // The DIRECT number itself is untouched — only the WORD beside it is now gated.
    expect(screen.getByTestId('pkg-profit-contribution-expected').textContent).toContain(
      money(CLEARS_DIRECT_ONLY.profit.expected),
    )
  })
})

describe('D-17A/T2 — Readiness reads the studio-economic basis', () => {
  it('does not call a direct-costs-only package "Expected to profit"', () => {
    render(
      <FilmReadiness
        cohesion={COHESION}
        fit={FIT}
        execution={EXECUTION}
        profit={CLEARS_DIRECT_ONLY}
        cycleFixedCost={FIXED_4M}
      />,
    )
    const strong = screen.getByTestId('readiness-strong').textContent ?? ''
    const risky = screen.getByTestId('readiness-risky').textContent ?? ''
    expect(strong).not.toMatch(/Expected to profit/)
    expect(risky).toMatch(/covers direct costs but not the studio weeks it occupies/i)
    expect(screen.getByTestId('readiness-judgment').textContent).toMatch(/commercially risky/)
  })

  it('a studio-positive package IS called expected to profit, naming the basis', () => {
    const clearsBoth: ForecastProfitRange = {
      ...CLEARS_DIRECT_ONLY,
      profit: { low: 5_000_000, expected: 6_000_000, high: 7_000_000 },
    }
    render(
      <FilmReadiness
        cohesion={COHESION}
        fit={FIT}
        execution={EXECUTION}
        profit={clearsBoth}
        cycleFixedCost={FIXED_4M}
      />,
    )
    expect(screen.getByTestId('readiness-strong').textContent).toMatch(
      /Expected to profit after studio fixed costs/,
    )
    expect(screen.getByTestId('readiness-judgment').textContent).toMatch(/commercially promising/)
  })

  it('“Could lose money” is still driven by the DIRECT low band, with the basis named', () => {
    const negLow: ForecastProfitRange = {
      ...CLEARS_DIRECT_ONLY,
      profit: { low: -2_000_000, expected: 6_000_000, high: 9_000_000 },
    }
    render(
      <FilmReadiness
        cohesion={COHESION}
        fit={FIT}
        execution={EXECUTION}
        profit={negLow}
        cycleFixedCost={FIXED_4M}
      />,
    )
    expect(screen.getByTestId('readiness-risky').textContent).toMatch(
      /Could lose money before studio fixed costs/,
    )
  })
})

describe('D-17A/T2 — Assembly wires the real cycle fixed cost into both panels', () => {
  it('the Review step shows a studio-economic triple built from prospectiveCycleFixedCost', () => {
    const state = openWizard('d17a-sign-1', 'review')
    const fc = prospectiveCycleFixedCost(state)
    expect(fc.amount).toBeGreaterThan(0)
    expect(screen.getByTestId('pkg-studio-economic')).toBeInTheDocument()
    expect(screen.getByTestId('pkg-studio-economic-disclosure').textContent).toContain(money(fc.amount))
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T9 — greenlight discipline: named, prominent, and NOT a recommendation engine.
// ═══════════════════════════════════════════════════════════════════════════════
// Parse a `money()` string back to dollars ($1.63M / $250K / $900). money() rounds millions
// to two decimals, so comparisons against it carry a rounding tolerance.
function parseMoney(text: string): number {
  const m = /(-?)\$([0-9.]+)([MK]?)/.exec(text)
  if (!m) throw new Error(`no money figure in "${text}"`)
  const scale = m[3] === 'M' ? 1_000_000 : m[3] === 'K' ? 1_000 : 1
  return (m[1] === '-' ? -1 : 1) * Number(m[2]) * scale
}
const MONEY_TOL = 30_000 // two money() figures can each round by up to $5K

describe('D-17A/T9 — the forecast-positive discipline is named at the decision', () => {
  for (const step of ['budget', 'review'] as const) {
    it(`the ${step} step computes expected studio revenue − (commitment + cycle fixed cost)`, () => {
      const state = openWizard(`d17a-disc-${step}`, step)
      const committed = committedOnScreen(step === 'budget' ? 'committed-cost' : 'release-commitment')
      const fc = prospectiveCycleFixedCost(state)

      const working = screen.getByTestId('greenlight-discipline-working').textContent ?? ''
      // The working names the two costs it subtracts, in the adapter's own figures.
      expect(working).toContain(money(fc.amount))
      expect(working).toContain(money(committed))
      expect(working).toContain(pct(TUNING.STUDIO_RENTAL_BLENDED))

      // …and the displayed arithmetic actually holds:
      //   revenue = gross × share ;  result = revenue − commitment − cycle fixed cost.
      const figures = working.match(/-?\$[0-9.]+[MK]?/g) ?? []
      const [grossTxt, revenueTxt] = figures
      const gross = parseMoney(grossTxt!)
      const revenue = parseMoney(revenueTxt!)
      expect(revenue).toBeCloseTo(gross * TUNING.STUDIO_RENTAL_BLENDED, -Math.log10(MONEY_TOL))

      const value = screen.getByTestId('greenlight-discipline-value')
      const shown = parseMoney(value.textContent ?? '')
      expect(Math.abs(shown - (revenue - committed - fc.amount))).toBeLessThan(MONEY_TOL)

      // Signed and coloured, and the verdict word agrees with the sign.
      const negative = shown < 0
      expect(value.className).toContain(negative ? 'money neg' : 'money pos')
      const verdict = screen.getByTestId('greenlight-discipline-verdict').textContent ?? ''
      expect(verdict).toMatch(negative ? /does not cover/ : /covers/)
      expect(verdict).toContain(`${fc.weeks} weeks of studio fixed costs`)
      expect(screen.getByTestId('greenlight-discipline').textContent).toMatch(
        /Forecast-positive discipline/,
      )
    })
  }

  it('is information, not auto-play: no ranking, no best-package marker, no recommendation', () => {
    openWizard('d17a-disc-info', 'review')
    const text = screen.getByTestId('greenlight-discipline').textContent ?? ''
    expect(text).toMatch(/does not rank your packages or choose one for you/i)
    expect(text).toMatch(/centre of a forecast is not a promise/i)
    expect(text).not.toMatch(/best package|optimal|you should|we recommend|recommended/i)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T4 — affordability scopes at Assembly, beside the budget picker.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T4 — Assembly shows the same three scopes as the Dashboard', () => {
  it('renders the promoted read-model beside the budget picker, in D-15’s vocabulary', () => {
    const state = openWizard('d17a-scopes-1', 'budget')
    const scopes = affordabilityScopes(state)

    const panel = screen.getByTestId('budget-affordability')
    expect(panel).toBeInTheDocument()
    expect(screen.getByTestId('budget-affordability-cheapest').textContent).toContain(
      moneyExact(scopes.cheapest!.commitment),
    )
    expect(screen.getByTestId('budget-affordability-standard').textContent).toContain(
      moneyExact(scopes.standard!.commitment),
    )
    // No releases yet on a fresh studio ⇒ no recent-typical figure, stated as "—", not invented.
    expect(scopes.recentTypical).toBeNull()
    expect(screen.getByTestId('budget-affordability-typical').textContent).toBe('—')

    expect(screen.getByText('Lowest estimated production commitment')).toBeInTheDocument()
    expect(screen.getByText('Recent typical commitment')).toBeInTheDocument()
    expect(screen.getByTestId('budget-affordability-disclosure').textContent).toMatch(
      /not a guaranteed quote/i,
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T6 — discoverability exposure, with the numbers the engine actually enforces.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T6 — the discoverability band is quantified, never hardcoded', () => {
  it('states support vs threshold and the engine’s own clip bounds beside the forecast', () => {
    openWizard('d17a-disc-band', 'budget')
    const line = screen.getByTestId('budget-discovery-exposure')
    const text = line.textContent ?? ''

    // The bounds shown are the TUNING constants the engine clips with — if D-17B
    // recalibrates DISC_FLOOR/DISC_CEIL this copy moves with them.
    if (text.includes('Discoverability exposure')) {
      expect(text).toContain(`${TUNING.DISC_FLOOR}×`)
      expect(text).toContain(`${TUNING.DISC_CEIL}×`)
      expect(text).toContain(pct(TUNING.DISC_SUPPORT_THRESHOLD))
      expect(text).toMatch(/worst case .*best case/)
    } else {
      // Not exposed ⇒ a quiet, positive statement — still with the threshold named.
      expect(text).toMatch(/Reach-supported/)
      expect(text).toContain(pct(TUNING.DISC_SUPPORT_THRESHOLD))
    }
  })

  it('renders the exposed branch with real dollars, from the selector’s own floor/ceil', () => {
    // A deliberately unsupported package: unknown cast, minimum marketing, low awareness.
    const base = newFoundedGame('d17a-disc-exposed')
    const dim: GameState = {
      ...base,
      studio: { ...base.studio, standing: { ...base.studio.standing, audienceAwareness: 5 } },
    }
    const pkg = cheapestVisiblePackage(dim)
    const exposure = assessDiscoveryExposure(dim, pkg)
    expect(exposure.exposed).toBe(true)

    const opening = 4_000_000
    render(
      <DiscoveryExposureLine exposure={exposure} expectedOpening={opening} testid="disc-unit" />,
    )
    const text = screen.getByTestId('disc-unit').textContent ?? ''
    expect(text).toContain(money(opening * exposure.floor))
    expect(text).toContain(money(opening * exposure.ceil))
    expect(text).toContain(pct(exposure.reachSupport))
    expect(text).toContain(pct(exposure.threshold))
    // No probability language beyond the clip band the engine enforces.
    expect(text).not.toMatch(/likely|probably|chance of|odds/i)
  })

  it('a reach-supported package gets a quiet line, not a warning', () => {
    const exposure = {
      reachSupport: 0.9,
      shortfall: 0,
      exposed: false,
      floor: TUNING.DISC_FLOOR,
      ceil: TUNING.DISC_CEIL,
      threshold: TUNING.DISC_SUPPORT_THRESHOLD,
    }
    render(<DiscoveryExposureLine exposure={exposure} testid="disc-ok" />)
    const el = screen.getByTestId('disc-ok')
    expect(el.textContent).toMatch(/Reach-supported/)
    expect(el.textContent).toMatch(/no discoverability variance/)
    expect(el.className).toContain('hint') // quiet, not the 'reason' warning styling
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T7 / R6-A — marketing copy reports what is measured, and steers nowhere.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T7 — marketing truth', () => {
  it('reports spend against measured capacity, and the reach the campaign converts to', () => {
    openWizard('d17a-mkt-1', 'budget')
    expect(screen.getByTestId('marketing-efficiency').textContent).toBeTruthy()
    expect(screen.getByTestId('marketing-capacity').textContent).toMatch(
      /measured efficient capacity/,
    )
    const reachLine = screen.getByTestId('marketing-reach').textContent ?? ''
    expect(reachLine).toMatch(/current visibility/)
    expect(reachLine).toMatch(/total opening reach/)
  })

  it('DELETES the "most of this campaign is wasted" assertion and all steering language', () => {
    openWizard('d17a-mkt-2', 'budget')
    const text = screen.getByTestId('marketing-efficiency').textContent ?? ''
    expect(text).not.toMatch(/wasted/i)
    expect(text).not.toMatch(/not yet visible enough to spend this efficiently/i)
    expect(text).not.toMatch(/consider spending less|spend less|too much marketing/i)
    // …and it states the honest direction of the marginal return instead of denying it.
    expect(text).toMatch(/Spending more always adds some reach/)
    // The honest disclosure line survives.
    expect(text).toMatch(/Marketing widens who shows up; it does not change how good the film is/)
  })

  it("mentions overexposure only when the ENGINE's own overexposure value is above zero", () => {
    const state = newFoundedGame('d17a-mkt-3')
    const at = (m: number) =>
      marketingEfficiency(state, { ...cheapestVisiblePackage(state), budget: { ...cheapestVisiblePackage(state).budget, marketing: m } })
    const small = at(MARKETING_BUDGET_LEVELS[0]!)
    const huge = at(4_000_000)
    // The magnitude is the engine's, and it is exactly zero below the threshold.
    expect(small.ratio).toBeLessThan(small.overexposureThreshold)
    expect(small.overexposure).toBe(0)
    expect(huge.ratio).toBeGreaterThan(huge.overexposureThreshold)
    expect(huge.overexposure).toBeGreaterThan(0)
  })

  it('on screen the overexposure line appears only above the threshold ratio it names', () => {
    openWizard('d17a-mkt-4', 'budget')
    const rungs = within(screen.getByTestId('marketing-levels')).getAllByRole('button')
    let seen = false
    for (const rung of rungs) {
      fireEvent.click(rung)
      const line = screen.queryByTestId('marketing-overexposure')
      if (line !== null) {
        seen = true
        // Self-consistent: the panel's own capacity line must show a ratio past the threshold.
        const ratioPct = Number(
          /(\d+)% of capacity/.exec(screen.getByTestId('marketing-capacity').textContent ?? '')![1],
        )
        const threshold = Number(/Past ([0-9.]+)× capacity/.exec(line.textContent ?? '')![1])
        expect(ratioPct / 100).toBeGreaterThan(threshold)
      } else {
        // Monotone: once shown, a LARGER campaign may not silently drop the disclosure.
        expect(seen).toBe(false)
      }
    }
  })

  it('keeps the rung grid exactly as the engine defines it (NO constant change)', () => {
    openWizard('d17a-mkt-5', 'budget')
    const rungs = within(screen.getByTestId('marketing-levels')).getAllByRole('button')
    expect(rungs.length).toBe(MARKETING_BUDGET_LEVELS.length)
    MARKETING_BUDGET_LEVELS.forEach((level, i) => {
      expect(rungs[i]!.textContent).toContain(money(level))
    })
  })
})
