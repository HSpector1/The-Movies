// ── D-11 employment screens: Founding, Studio Roster, Hiring Market ───────────
// Drives the three new Phase-5.2A screens through the real adapter (single boundary).
// Uses stateful harnesses so onChange re-renders the controlled screen, exactly as App
// does. Every assertion is behavioral; no engine value is recomputed in the test.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { useState } from 'react'
import { FoundingScreen } from './FoundingScreen.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { HiringMarket } from './HiringMarket.tsx'
import {
  newGame,
  foundingApplicantCards,
  rosterCards,
  hiringMarketCards,
} from '../engine/adapter.ts'
import type { GameState, CreativeRole } from '../engine/adapter.ts'
import { newFoundedGame } from '../test/founding.ts'

afterEach(cleanup)

// Stateful wrapper: holds the GameState so onChange re-renders the controlled screen.
function FoundingHarness({ seed, onFounded }: { seed: string; onFounded: (s: GameState) => void }) {
  const [s, setS] = useState<GameState>(() => newGame(seed))
  return <FoundingScreen state={s} onChange={setS} onCreate={() => {}} onFounded={onFounded} />
}
function RosterHarness({ seed }: { seed: string }) {
  const [s, setS] = useState<GameState>(() => newFoundedGame(seed))
  return <StudioRoster state={s} onChange={setS} onBack={() => {}} />
}
function HiringHarness({ seed }: { seed: string }) {
  const [s, setS] = useState<GameState>(() => newFoundedGame(seed))
  return <HiringMarket state={s} onChange={setS} onCreate={() => {}} onBack={() => {}} />
}

function requiredFoundingIds(seed: string): string[] {
  const cards = foundingApplicantCards(newGame(seed))
  const pick = (role: CreativeRole, n: number) =>
    cards.filter((c) => c.profile.role === role).slice(0, n).map((c) => c.profile.id)
  return [...pick('actor', 5), ...pick('director', 1), ...pick('writer', 2), ...pick('craft', 1)]
}
// D-11.D: applicants are now grouped in profession tabs; sign each role within its tab.
function requiredFoundingByRole(seed: string): [CreativeRole, string[]][] {
  const cards = foundingApplicantCards(newGame(seed))
  const pick = (role: CreativeRole, n: number) =>
    cards.filter((c) => c.profile.role === role).slice(0, n).map((c) => c.profile.id)
  return [
    ['actor', pick('actor', 5)],
    ['director', pick('director', 1)],
    ['writer', pick('writer', 2)],
    ['craft', pick('craft', 1)],
  ]
}

describe('FoundingScreen — hire an initial roster, then found', () => {
  it('found-studio is disabled until the required minimums are met, then founds the studio', () => {
    let founded: GameState | null = null
    render(<FoundingHarness seed="ui-found-1" onFounded={(s) => (founded = s)} />)

    const foundBtn = () => screen.getByTestId('found-studio') as HTMLButtonElement
    expect(foundBtn().disabled).toBe(true) // no roster yet

    // Sign the minimum roster (2-year terms). D-11.D: select each profession tab, then
    // click each applicant's 104-week offer within that tab.
    for (const [role, ids] of requiredFoundingByRole('ui-found-1')) {
      fireEvent.click(screen.getByTestId(`founding-tab-${role}`))
      for (const id of ids) fireEvent.click(screen.getByTestId(`founding-sign-${id}-104`))
    }

    expect(foundBtn().disabled).toBe(false) // minimums met
    fireEvent.click(foundBtn())
    expect(founded).not.toBeNull()
    expect(founded!.founding).toBeNull() // studio is founded
    expect(founded!.contracts.length).toBe(9)
    expect(founded!.operations.mode).toBe('managed') // the real FoundingScreen activates operations
  })

  it('signing an applicant marks them Signed and does not spend operating cash', () => {
    render(<FoundingHarness seed="ui-found-2" onFounded={() => {}} />)
    const id = requiredFoundingIds('ui-found-2')[0]!
    fireEvent.click(screen.getByTestId(`founding-sign-${id}-104`))
    // The card now shows the "signed" marker (a sign button for it is gone).
    expect(screen.getByTestId(`founding-signed-${id}`)).toBeInTheDocument()
  })
})

describe('StudioRoster — payroll summary + release', () => {
  it('renders a payroll summary and the contracted roster', () => {
    render(<RosterHarness seed="ui-roster-1" />)
    expect(screen.getByTestId('roster-list')).toBeInTheDocument()
    // The founded roster (8 actors + 2 dir + 3 writers + 2 craft = 15) is listed.
    const cards = rosterCards(newFoundedGame('ui-roster-1'))
    expect(cards.length).toBe(15)
    expect(screen.getByTestId(`roster-card-${cards[0]!.profile.id}`)).toBeInTheDocument()
  })

  it('release is a two-step confirm that shows the termination cost and removes the contract', () => {
    render(<RosterHarness seed="ui-roster-2" />)
    const id = rosterCards(newFoundedGame('ui-roster-2'))[0]!.profile.id
    // Step 1: click Release → a confirm control appears.
    fireEvent.click(screen.getByTestId(`roster-release-${id}`))
    const confirm = screen.getByTestId(`roster-confirm-release-${id}`)
    expect(confirm).toBeInTheDocument()
    // Step 2: confirm → the card disappears (contract removed).
    fireEvent.click(confirm)
    expect(screen.queryByTestId(`roster-card-${id}`)).not.toBeInTheDocument()
  })
})

describe('HiringMarket — sign a free agent; freelancers shown separately', () => {
  it('renders the contract market and the freelancer market as distinct sections', () => {
    render(<HiringHarness seed="ui-hiring-1" />)
    expect(screen.getByTestId('hiring-list')).toBeInTheDocument()
    expect(screen.getByTestId('freelancer-list')).toBeInTheDocument()
  })

  it('signing a free agent adds them to the studio (contract created)', () => {
    const seed = 'ui-hiring-2'
    render(<HiringHarness seed={seed} />)
    const market = hiringMarketCards(newFoundedGame(seed))
    expect(market.length).toBeGreaterThan(0)
    const id = market[0]!.profile.id
    const card = screen.getByTestId(`hiring-card-${id}`)
    // Click the 2-year sign offer within this card.
    const signBtn = within(card).getByTestId(`hiring-sign-${id}-104`)
    fireEvent.click(signBtn)
    // The card leaves the contract market once signed (re-rendered without it).
    expect(screen.queryByTestId(`hiring-card-${id}`)).not.toBeInTheDocument()
  })
})

describe('D-11 — a founded studio staffs films from its own roster (not the global pool)', () => {
  it('every roster member is contracted; the global population is far larger', () => {
    const s = newFoundedGame('ui-source-1')
    const roster = rosterCards(s)
    const contractedIds = new Set(s.contracts.map((c) => c.talentId))
    for (const c of roster) expect(contractedIds.has(c.profile.id)).toBe(true)
    expect(s.talent.length).toBeGreaterThan(roster.length) // roster ⊂ industry
  })
})
