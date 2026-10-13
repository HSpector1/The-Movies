// ── 1364: the owner's late-founding route through the mounted browser surfaces ──────────
//
// 1370-AR r5 item C (r3 review F06/F12, upheld again at r4): 1364-A §4 (test both the StartScreen and
// the Saves entry surfaces), §5 case 1 (mount the real founding screen through the supported load path
// and found through it) and the browser half of case 9 (no Advance or Sim control renders while the
// founding draft is open). Everything here goes through <App />: the paste box, the founding screen's
// own sign and found buttons, the autosaved session and the Saves screen. The adapter is called only
// to plan which offered signatures to click and to build the malformed input.
//
// Input: the generated V45 late draft (tests/fixtures/p1364/generated-v45-late-draft/, MANIFEST.json),
// a migration-origin draft open at week 26 with nothing signed.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { App } from './App.tsx'
import { setStudioLotOverviewOverride } from './flags.ts'
import { ACTIVE_SESSION_KEY } from './engine/session.ts'
import { exportSaveJson, foundingApplicantRows, importSaveJson, signContractAction } from './engine/adapter.ts'
import type { CreativeRole, GameState } from './engine/adapter.ts'
import { FOUNDING_MINIMUMS, LIVE_SAVE_VERSION } from '../../src/core/index.ts'
import { newFoundedGame } from './test/founding.ts'

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), '../../tests/fixtures/p1364/generated-v45-late-draft')
const MANIFEST = JSON.parse(readFileSync(`${FIXTURES}/MANIFEST.json`, 'utf8')) as { inputs: { name: string; sha256: string; saveVersion: number; week: number }[] }
const LATE_DRAFT = readFileSync(`${FIXTURES}/late-draft-week26-unsigned.json`, 'utf8')
const ROLES: readonly CreativeRole[] = ['actor', 'director', 'writer', 'craft']
const UI_LEAF_TIMEOUT = 240_000

beforeEach(() => setStudioLotOverviewOverride(false))
afterEach(cleanup)

type Persisted = {
  saveVersion: number
  state: {
    founding: unknown
    market: { tick: number }
    studioHistory: { rows: { kind: string; week: number }[] }
    foundingFunding: { recordedFromWeek: number; fund: { provenance: string; closedWeek: number | null; allocations: unknown[] } | null }
  }
}
const persisted = (): Persisted | null => {
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY)
  return raw === null ? null : (JSON.parse(raw) as Persisted)
}

/** The offered signatures to click: for each role minimum, the first unsigned applicant with an
 * affordable offer, signed on a shadow copy so each pick sees the fund the screen will show. */
function signingPlan(draftText: string): { role: CreativeRole; id: string; termWeeks: number }[] {
  const imported = importSaveJson(draftText)
  if (!imported.ok) throw new Error(`premise: the late draft imports: ${imported.error}`)
  let shadow: GameState = imported.state
  const plan: { role: CreativeRole; id: string; termWeeks: number }[] = []
  for (const role of ROLES) {
    for (let n = 0; n < FOUNDING_MINIMUMS[role]; n++) {
      const remaining = shadow.founding!.budget - shadow.founding!.spentBonus
      const pick = foundingApplicantRows(shadow, role)
        .filter((row) => !row.signed)
        .flatMap((row) => row.card.employment.offerOptions.map((offer) => ({ id: row.id, offer })))
        .find((choice) => choice.offer.signingBonus <= remaining)
      if (pick === undefined) throw new Error(`premise: the draft offers no affordable ${role}`)
      const out = signContractAction(shadow, pick.id, pick.offer.termWeeks)
      if (!out.ok) throw new Error(`premise: the offered ${role} signs: ${out.error}`)
      shadow = out.next
      plan.push({ role, id: pick.id, termWeeks: pick.offer.termWeeks })
    }
  }
  return plan
}

/** 1364-A §5 case 9, browser half: the open draft renders no way to advance or simulate. */
function expectNoAdvanceControl(): void {
  for (const id of ['advance-week', 'sim-to-event', 'lot-advance-week', 'lot-sim-to-next-event']) {
    expect(screen.queryByTestId(id), id).not.toBeInTheDocument()
  }
  expect(document.querySelector('[data-testid^="lot-transport-speed-"]')).toBeNull()
  expect(screen.queryAllByRole('button', { name: /advance|sim to/i })).toHaveLength(0)
}

/** Sign the plan with the founding screen's own buttons, then found with its own button. */
function signAndFoundThroughScreen(plan: { role: CreativeRole; id: string; termWeeks: number }[]): void {
  expect(screen.getByTestId('founding-intro')).toBeInTheDocument()
  expectNoAdvanceControl()
  expect(screen.getByTestId('found-studio')).toBeDisabled()
  for (const step of plan) {
    fireEvent.click(screen.getByTestId(`founding-tab-${step.role}`))
    fireEvent.click(screen.getByTestId(`founding-sign-${step.id}-${step.termWeeks}`))
    expect(screen.queryByTestId('error-box')).not.toBeInTheDocument()
    expect(screen.getByTestId(`founding-signed-${step.id}`)).toBeInTheDocument()
  }
  expectNoAdvanceControl()
  expect(screen.getByTestId('found-studio')).toBeEnabled()
  fireEvent.click(screen.getByTestId('found-studio'))
  expect(screen.queryByTestId('founding-intro')).not.toBeInTheDocument()
  expect(screen.getByTestId('dash-week')).toBeInTheDocument()
  expect(screen.getByTestId('advance-week')).toBeInTheDocument()
}

/** The autosaved campaign is the late founding: live era, week 26, draft closed, its observed fund
 * closed in the founding week with one allocation per clicked signature, one landmark at week 26. */
function expectFoundedSession(planLength: number): string {
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY)
  expect(raw).not.toBeNull()
  const save = persisted()!
  expect(save.saveVersion).toBe(LIVE_SAVE_VERSION)
  expect([save.state.market.tick, save.state.founding]).toEqual([26, null])
  expect(save.state.studioHistory.rows.filter((row) => row.kind === 'studioFounded').map((row) => row.week)).toEqual([26])
  const fund = save.state.foundingFunding.fund!
  expect([save.state.foundingFunding.recordedFromWeek, fund.provenance, fund.closedWeek, fund.allocations.length]).toEqual([26, 'observed-open-draft', 26, planLength])
  return raw!
}

/** Reload: a fresh <App /> restores the autosaved session through the same validated import path. */
function reloadFounded(raw: string): void {
  cleanup()
  render(<App />)
  expect(screen.queryByTestId('founding-intro')).not.toBeInTheDocument()
  expect(screen.getByTestId('dash-week')).toBeInTheDocument()
  expect(screen.getByTestId('advance-week')).toBeInTheDocument()
  expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(raw)
}

/** A live save of the imported draft whose fund disagrees with its draft: the reader refuses it. */
function malformedFundingSave(): { text: string; refusal: string } {
  const imported = importSaveJson(LATE_DRAFT)
  if (!imported.ok) throw new Error(`premise: the late draft imports: ${imported.error}`)
  const save = JSON.parse(exportSaveJson(imported.state)) as Persisted
  expect(save.state.foundingFunding.fund).not.toBeNull()
  ;(save.state.foundingFunding.fund as unknown as { spentBonus: number }).spentBonus = 1
  return {
    text: JSON.stringify(save),
    // Founding's frozen47 reader owns this refusal inside live48 validation.
    refusal: 'validateSaveV47: foundingFunding fund.spentBonus 1 differs from founding.spentBonus 0',
  }
}

function openFoundedCampaignThroughStart(seed: string): void {
  render(<App />)
  fireEvent.change(screen.getByTestId('import-text'), { target: { value: exportSaveJson(newFoundedGame(seed)) } })
  fireEvent.click(screen.getByTestId('import-save'))
  expect(screen.getByTestId('dash-week')).toBeInTheDocument()
}

describe('1364 late founding through the mounted browser surfaces (1364-A §4, §5 cases 1 and 9)', () => {
  it('fixture premise: the generated V45 late draft is the manifest input, and the adapter imports it as an open week-26 draft with an observed fund', () => {
    const entry = MANIFEST.inputs.find((input) => input.name === 'late-draft-week26-unsigned')!
    expect([entry.saveVersion, entry.week]).toEqual([45, 26])
    expect(createHash('sha256').update(LATE_DRAFT).digest('hex')).toBe(entry.sha256)
    const imported = importSaveJson(LATE_DRAFT)
    if (!imported.ok) throw new Error(imported.error)
    expect([imported.converted, imported.state.market.tick, imported.state.founding !== null]).toEqual([true, 26, true])
    expect(imported.state.foundingFunding.fund?.provenance).toBe('observed-open-draft')
  })

  it('StartScreen route: the pasted late draft opens the founding screen with no Advance or Sim control; the minimum roster signs and the studio founds through the screen; the autosaved campaign reloads founded and its Saves export carries the closed fund', () => {
    const plan = signingPlan(LATE_DRAFT)
    render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), { target: { value: LATE_DRAFT } })
    fireEvent.click(screen.getByTestId('import-save'))
    expect(screen.queryByTestId('error-box')).not.toBeInTheDocument()
    expect(screen.getByTestId('save-migration-notice')).toBeInTheDocument()
    signAndFoundThroughScreen(plan)
    const raw = expectFoundedSession(plan.length)
    reloadFounded(raw)
    // Save: the Saves screen exports the same founded campaign, and importing that export restores it.
    fireEvent.click(screen.getByTestId('open-saves'))
    const exported = (screen.getByTestId('export-text') as HTMLTextAreaElement).value
    expect(exported).toBe(raw)
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: exported } })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(screen.queryByTestId('error-box')).not.toBeInTheDocument()
    expect(screen.getByTestId('dash-week')).toBeInTheDocument()
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(raw)
  }, UI_LEAF_TIMEOUT)

  it('Saves route: the late draft imported over a founded campaign routes to the founding screen with no Advance or Sim control; signing and founding through the screen; the autosaved campaign reloads founded', () => {
    const plan = signingPlan(LATE_DRAFT)
    openFoundedCampaignThroughStart('p1364-ui-saves-route')
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: LATE_DRAFT } })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(screen.queryByTestId('saves-import')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dash-week')).not.toBeInTheDocument()
    expect(persisted()!.state.founding, 'the open draft replaced the founded campaign').not.toBeNull()
    signAndFoundThroughScreen(plan)
    reloadFounded(expectFoundedSession(plan.length))
  }, UI_LEAF_TIMEOUT)

  it('malformed funding: a live save whose fund disagrees with its draft is refused by name on the StartScreen and on Saves, and the current campaign is kept', () => {
    const { text, refusal } = malformedFundingSave()
    // StartScreen: nothing is loaded, so nothing is written and the start screen stays.
    render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), { target: { value: text } })
    fireEvent.click(screen.getByTestId('import-save'))
    expect(screen.getByRole('alert')).toHaveTextContent(`Could not load that save: ${refusal}`)
    expect(screen.getByTestId('title-card')).toBeInTheDocument()
    expect(screen.queryByTestId('founding-intro')).not.toBeInTheDocument()
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBeNull()
    cleanup()
    // Saves: the founded campaign keeps its session, its export and its dashboard week.
    openFoundedCampaignThroughStart('p1364-ui-malformed-current')
    const weekBefore = screen.getByTestId('dash-week').textContent
    const sessionBefore = localStorage.getItem(ACTIVE_SESSION_KEY)
    fireEvent.click(screen.getByTestId('open-saves'))
    const exportBefore = (screen.getByTestId('export-text') as HTMLTextAreaElement).value
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: text } })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(screen.getByRole('alert')).toHaveTextContent(`This save was rejected: ${refusal}`)
    expect(screen.getByTestId('saves-import')).toBeInTheDocument()
    expect((screen.getByTestId('export-text') as HTMLTextAreaElement).value).toBe(exportBefore)
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(sessionBefore)
    fireEvent.click(screen.getByTestId('saves-back'))
    expect(screen.getByTestId('dash-week')).toHaveTextContent(weekBefore ?? '')
    expect(screen.queryByTestId('founding-intro')).not.toBeInTheDocument()
  }, UI_LEAF_TIMEOUT)
})
