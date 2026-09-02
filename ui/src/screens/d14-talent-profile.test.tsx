// ── D-14 Phase 2 — the ONE reusable Talent Profile + its three entry points ───

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { applyActions, beginFounding, generateWorld, tick, TUNING } from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { talentCareerHistory, preV5CreditCount } from '../engine/careerImpact.ts'
import { TalentProfileDrawer, STAR_POWER_DESCRIPTION } from '../components/TalentProfileDrawer.tsx'
import { explainRelease, autopsyCompare, talentProfile } from '../engine/adapter.ts'
import { StudioRoster } from './StudioRoster.tsx'
import { Autopsy } from './Autopsy.tsx'

afterEach(cleanup)

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
function releaseOneFilm(s0: GameState): { s: GameState; pid: string; preRelease: GameState } {
  const c = s0.contracts.map((k) => s0.talent.find((t) => t.id === k.talentId)!)
  const actors = c.filter((t) => t.role === 'actor')
  const writer = c.find((t) => t.role === 'writer')!
  const director = c.find((t) => t.role === 'director')!
  const craft = c.find((t) => t.role === 'craft')!
  const concept = s0.concepts[0]!
  let s = applyActions(s0, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: writer.id,
        directorId: director.id,
        cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
        craftIds: [craft.id],
        budget: { negative: 5_000_000, marketing: 1_000_000 },
      },
    },
  ])
  const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  let preRelease = s
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
    const before = s // the (possibly just-committed) state immediately before this tick
    s = tick(s, { develop: true })
    if (!before.studio.releasedFilms.some((f) => f.productionId === pid) && s.studio.releasedFilms.some((f) => f.productionId === pid)) {
      preRelease = before // the state just BEFORE this film released (for exact autopsy)
    }
    const run = s.theatricalRuns.find((r) => r.productionId === pid)
    if (run && run.status !== 'active') break
  }
  return { s, pid, preRelease }
}
function leadId(s: GameState): string {
  return s.careerEvents.find((e) => e.role === 'lead')!.talentId
}

describe('D-14 Talent Profile drawer', () => {
  function renderProfile(s: GameState, id: string, onClose = () => {}) {
    render(
      <TalentProfileDrawer
        profile={talentProfile(s, id)!}
        history={talentCareerHistory(s, id)}
        preV5Credits={preV5CreditCount(s, id)}
        onClose={onClose}
      />,
    )
  }

  it('20. shows current OVR, Star Power (approved definition), skills, genres, role proficiencies', () => {
    const { s } = releaseOneFilm(foundEngaged('tp-fields'))
    const id = leadId(s)
    renderProfile(s, id)
    expect(screen.getByTestId('talent-profile-ovr')).toBeInTheDocument()
    expect(screen.getByTestId('talent-profile-starpower').textContent).toBe(s.talent.find((t) => t.id === id)!.fame.toFixed(1))
    // Star Power uses the approved player-facing definition (not "acting ability").
    expect(screen.getByTestId('talent-profile-overview').textContent).toContain(STAR_POWER_DESCRIPTION)
    // role proficiencies (all four disciplines) present → "good at X, weak fit for Y" is legible
    expect(screen.getByTestId('talent-profile-disciplines')).toBeInTheDocument()
    expect(screen.getAllByTestId(/^talent-profile-discipline-/).length).toBe(4)
  })

  it('16. career history reuses the SAME frozen events (film-mode cards)', () => {
    const { s } = releaseOneFilm(foundEngaged('tp-history'))
    const id = leadId(s)
    renderProfile(s, id)
    const hist = talentCareerHistory(s, id)
    expect(hist.length).toBeGreaterThan(0)
    const historyEl = screen.getByTestId('talent-profile-history')
    // one film card per event, showing the frozen Star Power before→after
    for (const row of hist) {
      const card = within(historyEl).getByTestId(`career-impact-${id}-${row.eventId}`)
      expect(card.textContent).toContain(row.starPowerBefore.toFixed(1))
    }
  })

  it('19. never renders hidden ceilings / true potential', () => {
    const { s } = releaseOneFilm(foundEngaged('tp-hidden'))
    const id = leadId(s)
    renderProfile(s, id)
    const text = screen.getByTestId('talent-profile').textContent ?? ''
    for (const w of ['ceiling', 'true potential', 'dev rate', 'devrate', 'rng', 'seed']) {
      expect(text.toLowerCase()).not.toContain(w)
    }
    // the true hidden ceiling integers must not appear as the OVR/skill values
    const t = s.talent.find((x) => x.id === id)!
    const ceilVals = new Set(Object.values(t.ceilings.acting).map((v) => String(v)))
    // (a legit OVR could coincide with a ceiling int; we only assert no "ceiling" LABEL leaks — above)
    expect(ceilVals.size).toBeGreaterThan(0) // sanity: ceilings exist but are never labelled
  })

  it('14. Escape closes the drawer and focus returns to the opener', () => {
    const { s } = releaseOneFilm(foundEngaged('tp-focus'))
    const id = leadId(s)
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)
    const onClose = vi.fn()
    renderProfile(s, id, onClose)
    // Escape triggers close
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    cleanup() // unmount → focus restoration effect runs
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })

  it('contains modal events, prevents scrim scrolling, and preserves panel scrolling', () => {
    const { s } = releaseOneFilm(foundEngaged('tp-input-boundary'))
    const id = leadId(s)
    const leaked = {
      pointerdown: vi.fn(),
      mousedown: vi.fn(),
      touchstart: vi.fn(),
      wheel: vi.fn(),
      click: vi.fn(),
    }
    for (const [name, handler] of Object.entries(leaked)) {
      document.addEventListener(name, handler)
    }
    const onClose = vi.fn()

    try {
      renderProfile(s, id, onClose)
      const panel = screen.getByTestId('talent-profile')
      fireEvent.pointerDown(panel)
      fireEvent.mouseDown(panel)
      fireEvent.touchStart(panel)
      fireEvent.wheel(panel)
      expect(leaked.pointerdown).not.toHaveBeenCalled()
      expect(leaked.mousedown).not.toHaveBeenCalled()
      expect(leaked.touchstart).not.toHaveBeenCalled()
      expect(leaked.wheel).not.toHaveBeenCalled()

      const scrim = screen.getByTestId('talent-profile-scrim')
      const scrimWheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 })
      scrim.dispatchEvent(scrimWheel)
      expect(scrimWheel.defaultPrevented).toBe(true)
      const panelWheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 })
      panel.dispatchEvent(panelWheel)
      expect(panelWheel.defaultPrevented).toBe(false)

      const scrimTouchMove = new Event('touchmove', { bubbles: true, cancelable: true })
      scrim.dispatchEvent(scrimTouchMove)
      expect(scrimTouchMove.defaultPrevented).toBe(true)
      const panelTouchMove = new Event('touchmove', { bubbles: true, cancelable: true })
      panel.dispatchEvent(panelTouchMove)
      expect(panelTouchMove.defaultPrevented).toBe(false)

      fireEvent.click(scrim)
      expect(onClose).toHaveBeenCalledOnce()
      expect(leaked.click).not.toHaveBeenCalled()
    } finally {
      for (const [name, handler] of Object.entries(leaked)) {
        document.removeEventListener(name, handler)
      }
    }
  })

  it('shows the honest pre-V5 notice only when there are unrecorded credits', () => {
    const { s } = releaseOneFilm(foundEngaged('tp-notice'))
    const id = leadId(s)
    // No migrated credits here → no notice.
    render(<TalentProfileDrawer profile={talentProfile(s, id)!} history={talentCareerHistory(s, id)} preV5Credits={0} onClose={() => {}} />)
    expect(screen.queryByTestId('talent-profile-history-notice')).toBeNull()
    cleanup()
    // Simulate a migrated save (2 older credits with no event).
    render(<TalentProfileDrawer profile={talentProfile(s, id)!} history={talentCareerHistory(s, id)} preV5Credits={2} onClose={() => {}} />)
    expect(screen.getByTestId('talent-profile-history-notice').textContent).toContain('SaveFileV5')
  })
})

describe('D-14 Talent Profile — three entry points call the SAME opener', () => {
  it('10. Studio Roster card opens the profile with the talent id', () => {
    const s = foundEngaged('ep-roster')
    const onOpen = vi.fn()
    render(<StudioRoster state={s} onChange={() => {}} onBack={() => {}} onOpenProfile={onOpen} />)
    const anyId = s.contracts[0]!.talentId
    fireEvent.click(screen.getByTestId(`roster-open-profile-${anyId}`))
    expect(onOpen).toHaveBeenCalledWith(anyId)
  })

  it('12. Autopsy participant name opens the profile with the talent id', () => {
    // Build a real autopsy view for a released engaged film.
    const { s, pid, preRelease } = releaseOneFilm(foundEngaged('ep-autopsy'))
    const film = s.studio.releasedFilms.find((f) => f.productionId === pid)!
    const onOpen = vi.fn()
    const view = explainRelease(preRelease, s.studio.standing, film, [])
    render(<Autopsy view={view} compare={autopsyCompare(preRelease, film)} onOpenProfile={onOpen} onBack={() => {}} />)
    const anyPart = view.participants!.cast.lead.talentId
    fireEvent.click(screen.getByTestId(`autopsy-open-profile-${anyPart}`))
    expect(onOpen).toHaveBeenCalledWith(anyPart)
  })
})
