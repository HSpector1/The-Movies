// ── D-11.A cycle-2 UI tests ───────────────────────────────────────────────────
// Integer formatting, restored creator entry points, Full Custom mode, and the
// film-specific autopsy/record participants — all through the real adapter.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { useState } from 'react'
import { FoundingScreen } from './FoundingScreen.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { HiringMarket } from './HiringMarket.tsx'
import { TalentCreator } from './TalentCreator.tsx'
import { Autopsy } from './Autopsy.tsx'
import { FilmRecord } from './FilmRecord.tsx'
import {
  newGame,
  rosterCards,
  greenlight,
  advanceWeek,
  explainRelease,
  requiredNegative,
  selectActiveProductions,
} from '../engine/adapter.ts'
import { applyActions } from '../../../src/core/index.ts'
import type {
  GameState,
  AutopsyView,
  FilmRecordView,
  FilmParticipants,
  DraftPackage,
  CastSlot,
} from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)

// ── 1–4. Integer formatting ───────────────────────────────────────────────────
describe('D-11.A — Star Power and age display as whole numbers', () => {
  it('StudioRoster shows the ROUNDED Star Power and no raw fractional value', () => {
    const s = newFoundedGame('c2ui-fmt-1')
    const t = s.talent.find((x) => s.contracts.some((c) => c.talentId === x.id) && x.fame % 1 !== 0)!
    expect(t).toBeDefined()
    const { container } = render(<StudioRoster state={s} onChange={() => {}} onBack={() => {}} />)
    const text = container.textContent ?? ''
    expect(text).not.toContain(String(t.fame)) // no long fractional Star Power
    expect(text).toContain(`Star power: ${Math.round(t.fame)}`)
  })

  it('no player-facing screen emits a long floating-point value (4+ decimals)', () => {
    const s = newFoundedGame('c2ui-fmt-2')
    const r = render(<StudioRoster state={s} onChange={() => {}} onBack={() => {}} />)
    expect(r.container.textContent ?? '').not.toMatch(/\d\.\d{4,}/)
    cleanup()
    const h = render(<HiringMarket state={s} onChange={() => {}} onCreate={() => {}} onBack={() => {}} />)
    expect(h.container.textContent ?? '').not.toMatch(/\d\.\d{4,}/)
  })

  it('sorting still exposes the authoritative Star Power as a key (HiringMarket)', () => {
    const s = newFoundedGame('c2ui-fmt-3')
    render(<HiringMarket state={s} onChange={() => {}} onCreate={() => {}} onBack={() => {}} />)
    const sort = screen.getByTestId('hiring-sort') as HTMLSelectElement
    expect([...sort.options].some((o) => o.value === 'starPower')).toBe(true)
  })
})

// ── 10–11. Restored creator entry points ──────────────────────────────────────
describe('D-11.A — the Talent Creator is reachable during and after founding', () => {
  it('the founding screen has a Create Custom Applicant entry', () => {
    const s: GameState = newGame('c2ui-entry-1') // fresh founding state
    render(<FoundingScreen state={s} onChange={() => {}} onCreate={() => {}} onFounded={() => {}} />)
    expect(screen.getByTestId('founding-create-applicant')).toBeInTheDocument()
  })

  it('the Hiring Market has a Create Custom Talent entry', () => {
    const s = newFoundedGame('c2ui-entry-2')
    render(<HiringMarket state={s} onChange={() => {}} onCreate={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('hiring-create-talent')).toBeInTheDocument()
  })
})

// ── 18–24. Full Custom mode ───────────────────────────────────────────────────
describe('D-11.A — Full Custom creator mode', () => {
  function CreatorHarness({ seed, onCreated }: { seed: string; onCreated: (s: GameState) => void }) {
    const [s] = useState<GameState>(() => newFoundedGame(seed))
    return <TalentCreator state={s} onCreated={onCreated} onBack={() => {}} />
  }

  // Navigate the staged Full-Custom editor to the create button and click it.
  function fullCustomCreate(name: string) {
    fireEvent.click(screen.getByTestId('creator-mode-full'))
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: name } })
    for (let i = 0; i < 8 && !screen.queryByTestId('create-talent'); i++) {
      const next = screen.queryByTestId('custom-next')
      if (!next || (next as HTMLButtonElement).disabled) break
      fireEvent.click(next)
    }
  }

  it('offers both modes; Balanced is default, Full Custom is selectable', () => {
    render(<CreatorHarness seed="c2ui-fc-1" onCreated={() => {}} />)
    expect(screen.getByTestId('creator-mode-balanced')).toBeInTheDocument()
    expect(screen.getByTestId('creator-mode-full')).toBeInTheDocument()
  })

  it('OVR is a derived preview, never an editable <input>', () => {
    render(<CreatorHarness seed="c2ui-fc-2" onCreated={() => {}} />)
    fireEvent.click(screen.getByTestId('creator-mode-full'))
    for (let i = 0; i < 8; i++) {
      const ovr = screen.queryAllByTestId(/^custom-ovr-/)
      for (const el of ovr) expect(el.tagName).not.toBe('INPUT')
      const next = screen.queryByTestId('custom-next')
      if (!next || (next as HTMLButtonElement).disabled) break
      fireEvent.click(next)
    }
  })

  it('creating a Full Custom talent adds them but does NOT auto-employ them', () => {
    let created: GameState | null = null
    const seed = 'c2ui-fc-3'
    const before = rosterCards(newFoundedGame(seed)).length
    render(<CreatorHarness seed={seed} onCreated={(s) => (created = s)} />)
    fullCustomCreate('Custom Powerhouse')
    fireEvent.click(screen.getByTestId('create-talent'))
    expect(created).not.toBeNull()
    const found = created!.talent.find((t) => t.name === 'Custom Powerhouse')!
    expect(found).toBeDefined()
    expect(created!.contracts.some((c) => c.talentId === found.id)).toBe(false) // not employed
    expect(created!.freeAgents).toContain(found.id) // free agent, must be signed
    expect(rosterCards(created!).length).toBe(before) // roster unchanged by creation
  })

  it('a double-click on create does not create two talents (idempotent submit)', () => {
    let created: GameState | null = null
    render(<CreatorHarness seed="c2ui-fc-4" onCreated={(s) => (created = s)} />)
    fullCustomCreate('Once Only')
    const create = screen.getByTestId('create-talent')
    fireEvent.click(create)
    fireEvent.click(create) // stale second click
    expect(created).not.toBeNull()
    expect(created!.talent.filter((t) => t.name === 'Once Only').length).toBe(1)
  })
})

// ── 29–36. Film-specific participants in the autopsy + the post-reload record ──
describe('D-11.A — autopsy / record render the film\'s OWN participants', () => {
  // Release one real film and build its real AutopsyView via the engine.
  function releaseOneFilm(seed: string): { view: AutopsyView; writerName: string } {
    const s0 = newFoundedGame(seed)
    const w = foundedRosterIds(s0, 'writer')
    const d = foundedRosterIds(s0, 'director')
    const a = foundedRosterIds(s0, 'actor')
    const cr = foundedRosterIds(s0, 'craft')
    const concept = s0.concepts[0]!
    const pkg: DraftPackage = {
      conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: {
          intimacy: [-0.4, 0.4],
          tonalWeight: [-0.4, 0.4],
          kineticEnergy: [-0.4, 0.4],
        },
      },
      writerId: w[0]!,
      directorId: d[0]!,
      cast: { lead: a[0]!, antagonist: a[1]!, support: a[2]! } as Record<CastSlot, string>,
      craftIds: [cr[0]!],
      budget: { negative: requiredNegative(concept, { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }, s0), marketing: 100_000 },
    }
    const g = greenlight(s0, pkg)
    if (!g.ok) throw new Error(g.error)
    let cur = g.next
    let preTick = cur
    let film = null as GameState['studio']['releasedFilms'][number] | null
    for (let i = 0; i < 20 && !film; i++) {
      // P06A (charter W1): a production HOLDS at remainingTicks===1 until committed —
      // commit any ready picture before this advance so the fixture keeps releasing.
      const ready = selectActiveProductions(cur).filter((p) => p.remainingTicks === 1)
      if (ready.length > 0) {
        cur = applyActions(
          cur,
          ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
        )
      }
      preTick = cur
      const step = advanceWeek(cur)
      cur = step.next
      if (step.released.length > 0) film = step.released[0]!
    }
    if (!film) throw new Error('nothing released')
    const view = explainRelease(preTick, cur.studio.standing, film)
    const writerName = s0.talent.find((t) => t.id === w[0]!)!.name
    return { view, writerName }
  }

  it('the autopsy shows a film-specific participants table with the film\'s writer', () => {
    const { view, writerName } = releaseOneFilm('c2ui-autopsy-1')
    render(<Autopsy view={view} compare={null} onBack={() => {}} />)
    expect(screen.getByTestId('autopsy-participants')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-participants').textContent).toContain(writerName)
  })

  // The post-reload FilmRecord: two DIFFERENT records render distinct participants.
  function mkRecord(prefix: string): FilmRecordView {
    const person = (id: string, name: string, role: FilmParticipants['writer']['role'], disc: FilmParticipants['writer']['discipline']) => ({
      talentId: id,
      name,
      role,
      discipline: disc,
      greenlightOVR: 70,
      greenlightFit: 65,
      greenlightEP: { low: 60, high: 75, expected: 68 },
      freelancer: false,
    })
    const participants: FilmParticipants = {
      writer: person(`${prefix}-w`, `${prefix} Writer`, 'writer', 'writing'),
      director: person(`${prefix}-d`, `${prefix} Director`, 'director', 'directing'),
      cast: {
        lead: person(`${prefix}-l`, `${prefix} Lead`, 'lead', 'acting'),
        antagonist: person(`${prefix}-a`, `${prefix} Antagonist`, 'antagonist', 'acting'),
        support: person(`${prefix}-s`, `${prefix} Support`, 'support', 'acting'),
      },
      craft: [person(`${prefix}-c`, `${prefix} Craft`, 'craft', 'craft')],
    }
    return {
      productionId: `prod-${prefix}`,
      conceptTitle: `${prefix} Film`,
      // C2a-M3 — the Chronicle now carries WHO WROTE IT; these two films were
      // bought from the market, as every C1 picture was.
      screenplay: {
        origin: 'pool' as const,
        label: 'Acquired from the open script market',
        writerId: null,
        writerName: null,
        generatedTitle: null,
        renamedWeek: null,
        renamed: false,
      },
      chronicle: {
        productionId: `prod-${prefix}`,
        title: `${prefix} Film`,
        genre: 'drama',
        reception: {
          critic: { stars: 3, score: 60 },
          audience: { tier: 'liked', label: 'Audiences liked it', score: 64 },
        },
        creativeRecord: { available: false, message: 'Creative brief not recorded for this older film' },
        credits: { available: true, participants },
        productionRecord: {
          available: false,
          message: 'Detailed production chronology not recorded for this film',
        },
        packageRecord: { available: false, message: 'Frozen package fit record unavailable' },
      },
      participants,
      criticScore: 60,
      boxOffice: { opening: 1_000_000, total: 5_000_000 },
      committedCost: 2_000_000,
      studioRevenue: 5_000_000,
      profit: 3_000_000,
      // D-17A/T2: FilmRecordView now carries whether the run is still paying out. This
      // fixture is an ARCHIVED record, so its run is finished — the figure is realized.
      projected: false,
    }
  }

  it('film A and film B records show only their own participants (post-reload identity)', () => {
    const a = render(<FilmRecord view={mkRecord('A')} onBack={() => {}} />)
    expect(within(a.container).getByTestId('record-participants').textContent).toContain('A Lead')
    expect(a.container.textContent).not.toContain('B Lead')
    cleanup()
    const b = render(<FilmRecord view={mkRecord('B')} onBack={() => {}} />)
    expect(b.container.textContent).toContain('B Lead')
    expect(b.container.textContent).not.toContain('A Lead')
  })
})
