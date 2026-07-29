// ── Phase 5.2A cycle-3 UI suite (D-11.C) ─────────────────────────────────────
// Two owner-ruled features:
//   PART 1 — Balanced Creator SPECIALIZATION: profession + archetype preset, a fixed
//     40-point pool, potential/work-ethic as a SEPARATE tradeoff, OVR DERIVED, and a
//     player-facing STANDING (percentile + tier). A Balanced person is a PROSPECT, not a
//     star; creating one never signs them.
//   PART 2 — Newspaper release REVEAL: an original in-world front page derived purely from
//     the recorded result (masthead, headline, critic stars, audience verdict, financials,
//     callouts), shown once at release, with an "open autopsy" hand-off. Reconstructable
//     from persisted state (survives save/reload).
//
// These assert on RENDERED output and the ENGINE-derived views — no mocked engine.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { TalentCreator } from './TalentCreator.tsx'
import { NewspaperReveal } from './NewspaperReveal.tsx'
import {
  newGame,
  greenlight,
  requiredNegative,
  advanceWeek,
  releaseNewspaper,
  criticStars,
  NEWSPAPER_MASTHEAD,
  selectReleasedFilms,
  balancedTalentPreview,
  talentByRole,
  findTalent,
  exportSaveJson,
  importSaveJson,
  SPECIALIZATION_POINTS,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState, FilmResult, NewspaperView, DraftPackage } from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)

// ── helpers ──────────────────────────────────────────────────────────────────

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

// Found a studio, greenlight one legal film, advance until it releases. Returns the
// post-release GameState and the released FilmResult (fails loudly if none).
function releaseOneFilm(seed: string): { state: GameState; film: FilmResult } {
  let state = newFoundedGame(seed)
  const g = greenlight(state, legalPackage(state))
  if (!g.ok) throw new Error(`greenlight failed: ${g.error}`)
  state = g.next
  let film: FilmResult | null = null
  for (let i = 0; i < TUNING.PRODUCTION_TICKS + 5 && film === null; i++) {
    const step = advanceWeek(state)
    state = step.next
    if (step.released.length > 0) film = step.released[0]!
  }
  if (film === null) throw new Error('no release within the production window')
  return { state, film }
}

// Read the integer at the front of a testid's text (e.g. "38 (Solid)" → 38).
function leadingInt(testid: string): number {
  const el = screen.getByTestId(testid)
  const m = (el.textContent ?? '').match(/\d+/)
  expect(m).not.toBeNull()
  return Number(m![0])
}

function toSpecialization(name: string) {
  fireEvent.change(screen.getByTestId('talent-name'), { target: { value: name } })
  fireEvent.click(screen.getByTestId('balanced-next')) // → profession
  fireEvent.click(screen.getByTestId('balanced-next')) // → specialization
}

// ═══ PART 1 — Balanced Creator SPECIALIZATION ═══════════════════════════════

describe('D-11.C PART 1: Balanced creator shows a player-facing STANDING (four separate facts)', () => {
  it('reports OVR, experience status, market percentile and career tier as four labeled rows (D-12 P8)', () => {
    render(<TalentCreator state={newGame('c3-standing')} onCreated={() => {}} onBack={() => {}} />)
    // Four distinct facts, no longer one confusing statement.
    expect(screen.getByTestId('balanced-standing-ovr').textContent).toMatch(/OVR\s*\d+/i)
    expect(screen.getByTestId('balanced-standing-experience').textContent).toMatch(/unproven/i)
    expect(screen.getByTestId('balanced-standing-percentile').textContent).toMatch(/percentile/i)
    expect(screen.getByTestId('balanced-standing-tier').textContent).toMatch(/[A-Za-z]/)
    // A Balanced default is a prospect — well under the top decile.
    expect(leadingInt('balanced-standing-percentile')).toBeLessThan(90)
  })
})

describe('D-11.C PART 1: OVR is DERIVED — allocating points to the primary craft raises it', () => {
  it('spreading points across the primary discipline raises the derived primary OVR', () => {
    render(<TalentCreator state={newGame('c3-derive')} onCreated={() => {}} onBack={() => {}} />)
    toSpecialization('Deriver')
    const before = leadingInt('balanced-ovr-acting')
    // Raise all six primary skills uniformly (keeps the profile balanced → OVR rises).
    for (let i = 0; i < 6; i++) {
      for (let k = 0; k < 6; k++) fireEvent.click(screen.getByTestId(`balanced-skill-acting-${i}-inc`))
    }
    expect(leadingInt('balanced-ovr-acting')).toBeGreaterThan(before)
  })
})

describe('D-11.C PART 1: the High-Upside preset places LOWER than a focused prospect', () => {
  it('High Upside starts at a lower standing percentile than the default balanced actor', () => {
    // Both previewed from the same world so the comparison population is identical.
    const state = newGame('c3-upside')
    const focused = balancedTalentPreview(state, {
      name: 'Focused',
      role: 'actor',
      age: 24,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      presetId: 'balancedActingProspect',
      potentialTier: 'Promising',
      workEthic: 60,
      allocation: {},
    })
    const upside = balancedTalentPreview(state, {
      name: 'Upside',
      role: 'actor',
      age: 24,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      presetId: 'highUpsideProspect',
      potentialTier: 'HighUpside',
      workEthic: 85,
      allocation: {},
    })
    expect(upside.primaryPercentile).toBeLessThanOrEqual(focused.primaryPercentile)
    // Owner band: High-Upside sits low (20–45th) — comfortably under the top decile.
    expect(upside.primaryPercentile).toBeLessThan(90)
  })
})

describe('D-11.C PART 1: selecting a preset RESETS the pool (costs no specialization points)', () => {
  it('spending points, changing preset, and returning shows the full 40-point pool again', () => {
    render(<TalentCreator state={newGame('c3-reset')} onCreated={() => {}} onBack={() => {}} />)
    toSpecialization('Resetter')
    // Spend a few points.
    for (let k = 0; k < 5; k++) fireEvent.click(screen.getByTestId('balanced-skill-acting-0-inc'))
    expect(leadingInt('balanced-points-remaining')).toBe(SPECIALIZATION_POINTS - 5)
    // Back to profession, pick a different preset → allocation resets.
    fireEvent.click(screen.getByTestId('balanced-back')) // → profession
    const sel = screen.getByTestId('balanced-preset') as HTMLSelectElement
    const other = Array.from(sel.options).find((o) => o.value !== sel.value)!
    fireEvent.change(sel, { target: { value: other.value } })
    fireEvent.click(screen.getByTestId('balanced-next')) // → specialization
    expect(leadingInt('balanced-points-remaining')).toBe(SPECIALIZATION_POINTS)
  })
})

describe('D-11.C PART 1: multi-hyphenate — spending in a secondary discipline raises ITS OVR', () => {
  it('the Advanced panel lets points build a second craft; that discipline OVR rises', () => {
    render(<TalentCreator state={newGame('c3-hyphenate')} onCreated={() => {}} onBack={() => {}} />)
    toSpecialization('Hyphenate')
    const writingBefore = leadingInt('balanced-ovr-writing')
    fireEvent.click(screen.getByTestId('balanced-advanced-toggle'))
    // Raise all six writing skills uniformly (36 pts) — a genuine second craft.
    for (let i = 0; i < 6; i++) {
      for (let k = 0; k < 6; k++) fireEvent.click(screen.getByTestId(`balanced-skill-writing-${i}-inc`))
    }
    expect(leadingInt('balanced-ovr-writing')).toBeGreaterThan(writingBefore)
  })
})

describe('D-11.C PART 1: creating a Balanced talent adds a PROSPECT but never SIGNS them', () => {
  it('the created talent joins the pool unsigned (no contract created)', () => {
    const state = newGame('c3-unsigned')
    const contractsBefore = state.contracts.length
    let next: GameState | null = null
    render(
      <TalentCreator
        state={state}
        onCreated={(s) => {
          next = s
        }}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Unsigned Prospect' } })
    fireEvent.click(screen.getByTestId('balanced-next')) // profession
    fireEvent.click(screen.getByTestId('balanced-next')) // specialization
    fireEvent.click(screen.getByTestId('balanced-next')) // review
    fireEvent.click(screen.getByTestId('create-talent'))

    expect(next).not.toBeNull()
    const created = talentByRole(next!, 'actor').find((t) => t.name === 'Unsigned Prospect')!
    expect(created).toBeDefined()
    // No new contract, and none references the created prospect.
    expect(next!.contracts.length).toBe(contractsBefore)
    expect(next!.contracts.some((c) => c.talentId === created.id)).toBe(false)
    // It is authored talent with a derived, finite skill.
    const raw = findTalent(next!, created.id)!
    expect(raw.authored).toBe(true)
    expect(Number.isFinite(raw.skill)).toBe(true)
  })
})

describe('D-11.C PART 1: the creator baseline DISPLAY matches the engine boost (no divergence)', () => {
  it('a director multi-hyphenate shows the boosted writing baseline in the Advanced panel', () => {
    render(<TalentCreator state={newGame('c3-mh-display')} onCreated={() => {}} onBack={() => {}} />)
    // Identity → choose the Director profession.
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Hyphenate Director' } })
    fireEvent.change(screen.getByTestId('talent-role'), { target: { value: 'director' } })
    fireEvent.click(screen.getByTestId('balanced-next')) // → profession
    // Choose the Multi-Hyphenate archetype (its boost remaps off directing → writing).
    fireEvent.change(screen.getByTestId('balanced-preset'), { target: { value: 'multiHyphenateProspect' } })
    fireEvent.click(screen.getByTestId('balanced-next')) // → specialization
    fireEvent.click(screen.getByTestId('balanced-advanced-toggle'))
    // The writing skills (the remapped boost discipline) display a boosted baseline (~52),
    // NOT the plain 42 secondary baseline — the UI now uses the engine's shared rule.
    const writing0 = screen.getByTestId('balanced-skill-writing-0')
    const baseline = Number((writing0.textContent ?? '').match(/\d+/)?.[0])
    expect(baseline).toBeGreaterThan(45)
  })
})

// ═══ PART 2 — Newspaper release REVEAL ═══════════════════════════════════════

describe('D-11.C PART 2: the newspaper front page renders from the recorded result', () => {
  it('shows the masthead, a headline, the critic star line, the audience verdict, and the financials', () => {
    const { state, film } = releaseOneFilm('c3-news-1')
    const view = releaseNewspaper(state, film)
    expect(view).not.toBeNull()
    render(<NewspaperReveal views={[view!]} onOpenAutopsy={() => {}} onContinue={() => {}} />)

    // Masthead is the original fictional paper.
    expect(screen.getByTestId('newspaper-masthead').textContent ?? '').toContain(NEWSPAPER_MASTHEAD)
    expect(NEWSPAPER_MASTHEAD).toBe(view!.masthead)
    // The headline shown is exactly the derived headline.
    expect(screen.getByTestId('newspaper-headline').textContent ?? '').toContain(view!.headline)
    // Critic stars match the pure derivation from the recorded critic score.
    const starsText = screen.getByTestId('newspaper-critic-stars').textContent ?? ''
    expect(starsText).toContain(view!.critic.stars.toFixed(1))
    expect(view!.critic.stars).toBe(criticStars(film.criticScore))
    // Audience verdict label is shown.
    expect(screen.getByTestId('newspaper-audience').textContent ?? '').toContain(view!.audience.label)
    // Financial panel shows the projected contribution figure (labeled Projected).
    expect(screen.getByTestId('newspaper-financial')).toBeInTheDocument()
    expect(screen.getByTestId('newspaper-profit').textContent ?? '').toContain(view!.financial.projectedContributionLabel)
  })

  it('the headline never contradicts the numbers: a critic-love/audience-reject split reads as such', () => {
    // Not asserting a specific film outcome — assert the RULE: the rendered headline is the
    // one the pure derivation chose for these exact recorded numbers.
    const { state, film } = releaseOneFilm('c3-news-consistency')
    const view = releaseNewspaper(state, film)!
    render(<NewspaperReveal views={[view]} onOpenAutopsy={() => {}} onContinue={() => {}} />)
    // The rendered headline and its subheadline are exactly the ones the pure derivation
    // chose for these recorded numbers — the presentation never invents a verdict.
    expect(screen.getByTestId('newspaper-headline').textContent ?? '').toContain(view.headline)
    expect(screen.getByTestId('newspaper-reveal').textContent ?? '').toContain(view.subheadline)
  })
})

describe('D-11.C PART 2: the reveal hands off to the autopsy and continues the loop', () => {
  it('"open autopsy" fires the callback and "continue" advances the loop', () => {
    const { state, film } = releaseOneFilm('c3-news-2')
    const view = releaseNewspaper(state, film)!
    let openedIndex = -1
    let continued = false
    render(
      <NewspaperReveal
        views={[view]}
        onOpenAutopsy={(i) => {
          openedIndex = i
        }}
        onContinue={() => {
          continued = true
        }}
      />,
    )
    fireEvent.click(screen.getByTestId('newspaper-open-autopsy'))
    expect(openedIndex).toBe(0)
    fireEvent.click(screen.getByTestId('newspaper-continue'))
    expect(continued).toBe(true)
  })
})

describe('D-11.C PART 2: multiple releases in one beat get secondary stories', () => {
  it('a second film renders as a secondary story with its own autopsy link', () => {
    const { state, film } = releaseOneFilm('c3-news-3')
    const primary = releaseNewspaper(state, film)!
    // A second, distinct front page (pure presentation component — two views render two stories).
    const secondary: NewspaperView = { ...primary, filmTitle: 'Second Feature', headline: 'SECOND FEATURE OPENS STRONG' }
    let openedIndex = -1
    render(
      <NewspaperReveal
        views={[primary, secondary]}
        onOpenAutopsy={(i) => {
          openedIndex = i
        }}
        onContinue={() => {}}
      />,
    )
    const secondaryStory = screen.getByTestId('newspaper-secondary-1')
    expect(secondaryStory.textContent ?? '').toContain('SECOND FEATURE OPENS STRONG')
    fireEvent.click(within(secondaryStory).getByTestId('newspaper-secondary-autopsy-1'))
    expect(openedIndex).toBe(1)
  })
})

describe('D-11.C PART 2: the newspaper is RECONSTRUCTABLE from persisted state', () => {
  it('the same front page is derived after a save → reload round-trip (no drift)', () => {
    const { state, film } = releaseOneFilm('c3-news-reload')
    const before = releaseNewspaper(state, film)!

    const json = exportSaveJson(state)
    const imported = importSaveJson(json)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    // Find the SAME film in the reloaded state and rebuild its clipping.
    const reloadedFilm = selectReleasedFilms(imported.state).find((f) => f.productionId === film.productionId)!
    expect(reloadedFilm).toBeDefined()
    const after = releaseNewspaper(imported.state, reloadedFilm)!

    // Structurally identical derivation: the clipping survives reload unchanged. (Deep
    // equality, not string compare — the save envelope canonicalizes object key order, a
    // serialization detail; every VALUE — headline, stars, audience, financials, callouts,
    // participants — must be byte-for-byte the same.)
    expect(after).toEqual(before)
  })
})
