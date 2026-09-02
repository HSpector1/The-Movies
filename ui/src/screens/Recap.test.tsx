// ── D-15 Studio Run Recap screen — component tests ────────────────────────────
// Renders the read-only recap over a REAL engine state (found → release films). Asserts
// the sections render, values/testids appear, it is keyboard/accessible, callbacks fire,
// and the cash-positive-vs-normal-unaffordable warning surfaces. Mirrors the fixture
// pattern in d14-career-impact.test.tsx (UI tests build state via the core helpers).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { applyActions, beginFounding, generateWorld, studioRunRecap, tick, TUNING } from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { StudioRunRecap } from './StudioRunRecap.tsx'
import { money, moneyExact } from '../format.ts'

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

function releaseFilms(seed: string, n: number): GameState {
  let s = foundEngaged(seed)
  const contracted = s.contracts.map((k) => s.talent.find((t) => t.id === k.talentId)!)
  const actors = contracted.filter((t) => t.role === 'actor').sort((a, b) => a.fame - b.fame)
  const writer = contracted.find((t) => t.role === 'writer')!
  const director = contracted.find((t) => t.role === 'director')!
  const craft = contracted.find((t) => t.role === 'craft')!
  const lead = actors[0]!
  for (let i = 0; i < n; i++) {
    const concept = s.concepts[0]!
    s = applyActions(s, [
      {
        kind: 'greenlight',
        production: {
          conceptId: concept.id,
          shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
          promise: {
            genre: concept.genre,
            intendedSegments: ['adult'],
            ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
          },
          writerId: writer.id,
          directorId: director.id,
          cast: { lead: lead.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
          craftIds: [craft.id],
          budget: { negative: 5_000_000, marketing: 1_000_000 },
        },
      },
    ])
    const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
    for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 8; k++) {
      // P06A (W1): a ready picture HOLDS at remainingTicks===1 until committed —
      // commit every ready active production before advancing, or the run never opens.
      const committed = new Set(s.releaseAuthority.commitments.map((r) => r.productionId))
      const ready = s.studio.activeProductions.filter(
        (p) => p.remainingTicks === 1 && !committed.has(p.id),
      )
      if (ready.length > 0) {
        s = applyActions(
          s,
          ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
        )
      }
      s = tick(s, { develop: true })
      const run = s.theatricalRuns.find((r) => r.productionId === pid)
      if (run && run.status !== 'active') break
    }
  }
  return s
}

afterEach(cleanup)

describe('StudioRunRecap screen', () => {
  it('renders all six sections with a released slate', () => {
    const s = releaseFilms('recap-ui', 2)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    expect(screen.getByTestId('studio-run-recap')).toBeInTheDocument()
    for (const id of ['summary', 'capital', 'films', 'talent', 'concentration', 'position']) {
      expect(screen.getByTestId(`recap-section-${id}`)).toBeInTheDocument()
    }
    // methodology notes moved into a collapsed control (not a default section)
    expect(screen.getByTestId('recap-methodology')).toBeInTheDocument()
    // level-2 headings for each section (accessible structure)
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(6)
    // film slate lists each released film
    const slate = screen.getByTestId('recap-film-slate')
    expect(within(slate).getAllByRole('row').length).toBe(s.studio.releasedFilms.length + 1) // + header
  })

  it('shows the run through-week and a recovery classification', () => {
    const s = releaseFilms('recap-ui-2', 2)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    expect(screen.getByTestId('recap-through-week')).toHaveTextContent(`Week ${s.market.tick}`)
    expect(screen.getByTestId('recap-recovery')).toBeInTheDocument()
    expect(screen.getByTestId('recap-current-cash')).toBeInTheDocument()
  })

  it('Back button is keyboard-focusable and fires onBack', () => {
    const s = releaseFilms('recap-ui-3', 1)
    const onBack = vi.fn()
    render(<StudioRunRecap state={s} onBack={onBack} />)
    const back = screen.getByTestId('recap-back')
    back.focus()
    expect(back).toHaveFocus()
    fireEvent.click(back)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('opens a talent profile from the talent table', () => {
    const s = releaseFilms('recap-ui-4', 2)
    const onOpenProfile = vi.fn()
    const { container } = render(<StudioRunRecap state={s} onBack={() => {}} onOpenProfile={onOpenProfile} />)
    const link = container.querySelector('[data-testid^="recap-open-profile-"]') as HTMLButtonElement | null
    expect(link).not.toBeNull()
    fireEvent.click(link!)
    expect(onOpenProfile).toHaveBeenCalledTimes(1)
  })

  it('surfaces the cash-positive-but-normal-unaffordable warning when cash is tight', () => {
    const s = releaseFilms('recap-ui-warn', 3)
    // set cash between the cheapest and typical commitment (positive, but normal film out of reach)
    const tight: GameState = { ...s, studio: { ...s.studio, cash: 2_000_000 } }
    render(<StudioRunRecap state={tight} onBack={() => {}} />)
    const warnings = screen.getByTestId('recap-warnings')
    expect(within(warnings).getByTestId('recap-warning-cashPositiveButNormalUnaffordable')).toBeInTheDocument()
  })

  it('handles a founded studio with no releases without crashing', () => {
    const s = foundEngaged('recap-ui-empty')
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    expect(screen.getByTestId('recap-recovery')).toHaveTextContent('State incomplete')
  })

  it('renders a cash chart with an accessible text equivalent (not the 86-row table by default)', () => {
    const s = releaseFilms('recap-ui-chart', 2)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    const chart = screen.getByTestId('recap-cash-chart')
    expect(chart).toBeInTheDocument()
    // the SVG is an accessible image with a descriptive label + a visible caption
    expect(within(chart).getByRole('img')).toHaveAttribute('aria-label')
    expect(screen.getByTestId('recap-cash-chart-summary')).toBeInTheDocument()
    // the full weekly table is present but its <details> is collapsed by default
    const details = screen.getByTestId('recap-cash-timeline').closest('details') as HTMLDetailsElement
    expect(details.open).toBe(false)
  })

  it('caps default warnings at three and collapses the rest', () => {
    const s = releaseFilms('recap-ui-warncap', 3)
    const tight: GameState = { ...s, studio: { ...s.studio, cash: 1_000_000 } }
    render(<StudioRunRecap state={tight} onBack={() => {}} />)
    const primary = screen.getByTestId('recap-warnings')
    expect(within(primary).getAllByRole('listitem').length).toBeLessThanOrEqual(3)
    // remaining observations sit behind a collapsed control (when there are >3 warnings)
    const more = screen.queryByTestId('recap-more-observations')
    if (more) expect(more.closest('details')!.open).toBe(false)
  })

  it('film result pills read Profit / Break-even / Loss and money is formatted (no raw integers)', () => {
    const s = releaseFilms('recap-ui-fmt', 3)
    const { container } = render(<StudioRunRecap state={s} onBack={() => {}} />)
    const slate = screen.getByTestId('recap-film-slate')
    const pills = within(slate).getAllByText(/Profit|Break-even|Loss/)
    expect(pills.length).toBeGreaterThan(0)
    // no raw 7+ digit run of digits in the visible text — money is always $x.xxM or $x,xxx,xxx
    expect(container.textContent || '').not.toMatch(/\d{7,}/)
  })

  it('methodology notes are collapsed by default', () => {
    const s = releaseFilms('recap-ui-method', 2)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    const methodology = screen.getByTestId('recap-methodology') as HTMLDetailsElement
    expect(methodology.open).toBe(false)
  })

  it('chart annotations stay inside the SVG viewBox (right-aligned, no clipping)', () => {
    const s = releaseFilms('recap-ui-chartbounds', 3)
    const { container } = render(<StudioRunRecap state={s} onBack={() => {}} />)
    const svg = container.querySelector('[data-testid="recap-cash-chart"] svg')!
    const texts = Array.from(svg.querySelectorAll('text'))
    expect(texts.length).toBeGreaterThan(0)
    for (const t of texts) {
      const x = parseFloat(t.getAttribute('x') || '0')
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(720) // CHART_W — annotations never exceed the viewBox width
    }
    // opening + current labels are right-aligned so their text can't spill past the right edge
    const rightLabels = texts.filter((t) => /Opening|Now/.test(t.textContent || ''))
    expect(rightLabels.length).toBe(2)
    for (const t of rightLabels) expect(t.getAttribute('text-anchor')).toBe('end')
  })

  it('uses consistent timeline-count wording (closing balances, not elapsed weeks)', () => {
    const s = releaseFilms('recap-ui-timeline', 3)
    const { container } = render(<StudioRunRecap state={s} onBack={() => {}} />)
    const cap = screen.getByTestId('recap-cash-chart-summary').textContent || ''
    expect(cap).toMatch(/recorded weekly closing balances/)
    expect(cap).toMatch(/end of Week 0/)
    expect(screen.getByTestId('recap-weekly-toggle').textContent || '').toMatch(/weekly closing balances/)
    // axis label uses the "End Wk" convention
    expect(container.querySelector('[data-testid="recap-cash-chart"] svg')!.textContent || '').toMatch(/End Wk 0/)
    // no contradictory "N weeks" elapsed-count phrasing in the cash section
    expect(cap).not.toMatch(/\bover \d+ weeks\b/)
  })

  it('keeps the BREAK-EVEN (and every) result pill on one line', () => {
    const s = releaseFilms('recap-ui-be', 3)
    const { container } = render(<StudioRunRecap state={s} onBack={() => {}} />)
    const pills = Array.from(container.querySelectorAll('[data-testid="recap-film-slate"] .tag')) as HTMLElement[]
    expect(pills.length).toBeGreaterThan(0)
    for (const p of pills) expect(p.style.whiteSpace).toBe('nowrap')
  })

  it('does not expose repository paths, filenames, or dev references in the player UI', () => {
    const s = releaseFilms('recap-ui-nopath', 2)
    const { container } = render(<StudioRunRecap state={s} onBack={() => {}} />)
    const text = container.textContent || ''
    expect(text).not.toMatch(/docs\//)
    expect(text).not.toMatch(/\.md\b/)
    expect(text).not.toMatch(/studioRunRecap/)
  })

  it('methodology still explains the figures in plain language', () => {
    const s = releaseFilms('recap-ui-method2', 2)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    const m = screen.getByTestId('recap-methodology').textContent || ''
    expect(m).toMatch(/lowest-cost production we can estimate/)
    expect(m).toMatch(/contracted team/)
    expect(m).toMatch(/Recent typical commitment/)
    expect(m).toMatch(/Fixed-cost runway/)
  })
})

// ── D-17A/T13 — the recap's labelled studio-economic layer ────────────────────
// Phase E added the additive read-model fields; this pins the SCREEN: the three-line
// per-film block, the studio-level reconciliation identity, and the glossary that names
// the allocation as a managerial convention rather than a charge.
describe('D-17A/T13 — studio-economic layer on the recap screen', () => {
  it('renders three labelled lines per film, from the recap read-model', () => {
    const s = releaseFilms('d17a-recap-1', 2)
    const r = studioRunRecap(s)
    render(<StudioRunRecap state={s} onBack={() => {}} />)

    expect(r.films.length).toBeGreaterThan(0)
    for (const f of r.films) {
      const block = screen.getByTestId(`recap-studio-economic-${f.productionId}`)
      expect(block.textContent).toContain(f.title)
      // 1. the DIRECT figure, named as such
      expect(block.textContent).toMatch(/Film contribution \(direct costs only\)/)
      // 2. the allocation, with the weeks it covers
      const alloc = within(block).getByTestId(`recap-studio-economic-${f.productionId}-allocated`)
      expect(alloc.textContent).toContain(moneyExact(f.allocatedFixedCost))
      expect(alloc.textContent).toContain(`${f.allocatedWeeks} wk`)
      // 3. the studio-economic result === contribution − allocation, exactly
      const result = within(block).getByTestId(`recap-studio-economic-${f.productionId}-result`)
      expect(f.studioEconomicResult).toBeCloseTo(f.contribution! - f.allocatedFixedCost, 2)
      expect(result.textContent).toContain(money(Math.abs(f.studioEconomicResult!)))
    }
    // The even-split convention is disclosed, in words, beside the numbers.
    expect(screen.getByTestId('recap-studio-economic-basis').textContent).toMatch(
      /split evenly between the films occupying it that week/i,
    )
    expect(screen.getByTestId('recap-studio-economic-basis').textContent).toMatch(
      /a convention, not a measurement/i,
    )
  })

  it('shows the reconciliation identity: allocated + idle === payroll+overhead paid', () => {
    const s = releaseFilms('d17a-recap-2', 2)
    const c = studioRunRecap(s).capital
    render(<StudioRunRecap state={s} onBack={() => {}} />)

    // The invariant itself, on the read-model…
    expect(c.totalAllocatedFixedCost + c.idleFixedCost).toBe(c.totalLedgerFixedCost)
    // …and it is exactly the run's payroll + overhead (both reported positive = spent).
    expect(c.totalLedgerFixedCost).toBeCloseTo(c.totalPayroll + c.totalOverhead, 2)

    // …and on the screen, as three lines plus the written identity.
    const block = screen.getByTestId('recap-fixedcost-reconciliation')
    expect(within(block).getByTestId('recap-fixedcost-total').textContent).toBe(moneyExact(c.totalLedgerFixedCost))
    expect(within(block).getByTestId('recap-fixedcost-allocated').textContent).toBe(moneyExact(c.totalAllocatedFixedCost))
    expect(within(block).getByTestId('recap-fixedcost-idle').textContent).toBe(moneyExact(c.idleFixedCost))
    const identity = within(block).getByTestId('recap-fixedcost-identity').textContent ?? ''
    expect(identity).toContain(moneyExact(c.totalAllocatedFixedCost))
    expect(identity).toContain(moneyExact(c.idleFixedCost))
    expect(identity).toContain(moneyExact(c.totalLedgerFixedCost))
    // It must NOT be presented as a films-only sum (in-flight productions are included).
    expect(identity).toMatch(/includes films still in production/i)
  })

  it('the existing Contribution and ROI columns are untouched, on the direct basis', () => {
    const s = releaseFilms('d17a-recap-3', 2)
    const r = studioRunRecap(s)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    const head = within(screen.getByTestId('recap-film-slate')).getAllByRole('columnheader').map((h) => h.textContent)
    expect(head).toContain('Contribution')
    expect(head).toContain('ROI')
    for (const f of r.films) {
      const cell = screen.getByTestId(`recap-film-${f.productionId}-contribution`)
      expect(cell.textContent).toContain(money(Math.abs(f.contribution!)))
    }
  })

  it('the glossary names the allocation a labelled convention, not a charge', () => {
    const s = releaseFilms('d17a-recap-4', 1)
    render(<StudioRunRecap state={s} onBack={() => {}} />)
    const glossary = screen.getByTestId('recap-methodology').textContent ?? ''
    expect(glossary).toMatch(/Payroll and overhead are studio costs, not charged to any film/i)
    expect(glossary).toMatch(/labelled managerial convention/i)
    expect(glossary).toMatch(/not.*a charge against the film/i)
    expect(glossary).toMatch(/Studio-economic result/)
    expect(glossary).toMatch(/Idle studio weeks/)
  })
})
