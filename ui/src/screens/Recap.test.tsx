// ── D-15 Studio Run Recap screen — component tests ────────────────────────────
// Renders the read-only recap over a REAL engine state (found → release films). Asserts
// the sections render, values/testids appear, it is keyboard/accessible, callbacks fire,
// and the cash-positive-vs-normal-unaffordable warning surfaces. Mirrors the fixture
// pattern in d14-career-impact.test.tsx (UI tests build state via the core helpers).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { applyActions, beginFounding, generateWorld, tick, TUNING } from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { StudioRunRecap } from './StudioRunRecap.tsx'

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
    for (const id of ['summary', 'capital', 'films', 'talent', 'concentration', 'position', 'limitations']) {
      expect(screen.getByTestId(`recap-section-${id}`)).toBeInTheDocument()
    }
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
})
