// Proposed ui/src/engine/p15b-browser-wave5.test.ts; scratch-only unexecuted RED.
// Old p15b-lot-closure-gate.test.ts remains historical deferral evidence, not silently rewritten.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { budgeted, FIXTURE_MS } from '../../../tests/helpers/p15c2-legacy'
import { expect, it } from 'vitest'
import * as adapter from './adapter'
import * as saves from '../../../src/core/save'
import { tick } from '../../../src/core/tick'
import { corporateNotices, type CorporateNotice } from '../../../src/core/corporateNotices'
import { studioRemedies } from '../../../src/core/corporateConditionLive'
import { loanMaxPrincipal, contractLoan } from '../../../src/core/studioLoan'
import { TUNING } from '../../../src/core/tuning'
import { studioWeeklyFixedCost } from '../../../src/core/powerRankingArchive'
import type { GameState } from '../../../src/core/types'
import { livingTurnStopClass } from '../lot/livingTurn'

type Outcome = { ok: true; next: GameState } | { ok: false; error: string }
// Narrow proposed adapter read/action seams. Missing export is prerequisite RED, not semantic proof.
type CorporateView = { mode: 'operating' | 'terminal'; notices: CorporateNotice[]; remedies: string[];
  loan: ReturnType<typeof contractLoan> | null; loanPrincipals: number[]; terminal: { closureId: string; closureWeek: number; endedId: string } | null }
function seam<T>(name: string): T {
  const value = (adapter as unknown as Record<string, unknown>)[name]
  if (typeof value !== 'function') throw new Error(`PREREQUISITE RED: adapter.${name} missing (Wave5)`)
  return value as T
}
const corporateView = (s: GameState) => seam<(s: GameState) => CorporateView>('studioCorporateView')(s)
const takeLoan = (s: GameState, principal: number) => seam<(s: GameState, principal: number) => Outcome>('takeStudioLoanAction')(s, principal)
const canon = (v: unknown) => saves.stableStringify(v)
function base(): GameState {
  const gz = readFileSync(resolve(process.cwd(), 'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz'))
  expect(createHash('sha256').update(gz).digest('hex')).toBe('af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6')
  return saves.migrateToLive(saves.importSave(gunzipSync(gz).toString('utf8'))).state as GameState
}
function drained(): GameState {
  const s = base(); const amount = Math.floor(s.studio.cash) + 1
  // Exact existing labelled transaction constructor, not natural gameplay evidence.
  return { ...s, studio: { ...s.studio, cash: s.studio.cash - amount }, ledger: [...s.ledger,
    { week: s.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
}
const at = (week: number): GameState => { let s = drained(); while (s.market.tick < week) s = tick(s); return s }
const playerClosure = (s: GameState) => s.studioClosure.closures.find(c => c.studioId === s.hollywood!.playerStudioId)

it('browser-warning-distress-displays-authoritative-remedies-and-lawful-loan-terms', budgeted(FIXTURE_MS, () => {
  for (const week of [134, 138]) {
    const s = at(week); expect(() => saves.makeSave(s)).not.toThrow(); const bytes = canon(s)
    const view = corporateView(s)
    expect(view.mode).toBe('operating'); expect(view.notices).toEqual(corporateNotices(s))
    expect(view.remedies).toEqual(studioRemedies(s, s.hollywood!.playerStudioId)); expect(view.remedies).toContain('LOAN')
    const fixed = studioWeeklyFixedCost(s, s.hollywood!.playerStudioId)
    const terms = contractLoan(loanMaxPrincipal(fixed), fixed, week)
    expect(view.loan).toEqual(terms); expect(view.terminal).toBeNull()
    expect(view.loanPrincipals).toEqual(Array.from({ length: terms.principal / TUNING.LOAN_AMOUNT_STEP }, (_, i) => (i + 1) * TUNING.LOAN_AMOUNT_STEP))
    if (week === 138) expect(view.notices.find(n => n.id === 'corporate-distress')!.closureWeek).toBe(163)
    expect(canon(s)).toBe(bytes)
  }
}), FIXTURE_MS)
it('browser-loan-commit-revalidates-and-stale-offer-never-duplicates-money', budgeted(FIXTURE_MS, () => {
  const s = at(134); const bytes = canon(s); const terms = corporateView(s).loan!
  const principal = TUNING.LOAN_AMOUNT_STEP; expect(terms.principal).toBeGreaterThan(principal)
  const first = takeLoan(s, principal); expect(first.ok).toBe(true)
  if (!first.ok) throw new Error(first.error)
  expect(first.next.studio.cash).toBe(s.studio.cash + principal)
  expect(() => saves.makeSave(first.next)).not.toThrow(); expect(canon(s)).toBe(bytes)
  const held = canon(first.next); const duplicate = takeLoan(first.next, principal)
  expect(duplicate.ok).toBe(false); expect(canon(first.next)).toBe(held)
  expect(corporateView(first.next).loan).toBeNull(); expect(corporateView(first.next).loanPrincipals).toEqual([])
}), FIXTURE_MS)
it('browser-actual-closure-commits-once-imports-and-reloads-as-read-only-history', budgeted(FIXTURE_MS, () => {
  const before = at(162); const bytes = canon(before); const result = adapter.advanceWeek(before)
  const c = playerClosure(result.next)
  expect(c?.closureWeek, 'SEMANTIC RED: browser removes deferral only with completed Wave5').toBe(163)
  expect(result.next.campaignLegacy.endOfRun!.closureId).toBe(c!.closureId)
  expect(canon(before)).toBe(bytes); expect(() => saves.makeSave(result.next)).not.toThrow()
  const view = corporateView(result.next)
  expect(view.mode).toBe('terminal'); expect(view.remedies).toEqual([]); expect(view.loan).toBeNull(); expect(view.loanPrincipals).toEqual([])
  expect(view.notices).toEqual(corporateNotices(result.next))
  expect(view.terminal).toEqual({ closureId: c!.closureId, closureWeek: 163, endedId: c!.endOfRun })
  const exported = adapter.exportSaveJson(result.next); const imported = adapter.importSaveJson(exported)
  expect(imported.ok).toBe(true)
  if (!imported.ok) throw new Error(imported.error)
  expect(adapter.exportSaveJson(imported.state)).toBe(exported)
  const terminalBytes = canon(imported.state)
  expect(() => adapter.advanceWeek(imported.state)).toThrow(/read.only/i)
  expect(takeLoan(imported.state, 10_000).ok).toBe(false)
  expect(canon(imported.state)).toBe(terminalBytes)
}), FIXTURE_MS)
it('browser-batch-stops-at-actual-closure-and-living-turn-classifies-terminal-as-pause', budgeted(FIXTURE_MS, () => {
  const before = at(162); const bytes = canon(before); const batch = adapter.advanceToNextEvent(before)
  expect(batch.next.market.tick).toBe(163); expect(playerClosure(batch.next)).toBeDefined()
  expect(batch.stopReason).toBe('studioClosure') // Narrow new stop reason; existing decisions/notices remain their own law.
  const classify = livingTurnStopClass as (reason: string) => string
  expect(classify(batch.stopReason)).toBe('pause')
  expect(adapter.exportSaveJson(batch.next)).toBe(adapter.exportSaveJson(adapter.advanceWeek(before).next))
  expect(canon(before)).toBe(bytes)
}), FIXTURE_MS)
it('browser-supported47-migrates-prospectively-and-unsupported-due-only-draft-refuses', budgeted(FIXTURE_MS, () => {
  const source = base(); const old = saves.migrateToV47(saves.makeSave(source)); const oldText = saves.exportSave(old)
  expect(() => saves.validateSaveV47(old)).not.toThrow()
  const normal = adapter.importSaveJson(oldText); expect(normal.ok).toBe(true)
  if (!normal.ok) throw new Error(normal.error)
  expect(normal.state.corporateCondition.studios).toEqual([]); expect(corporateView(normal.state).notices).toEqual([])
  expect(canon(old)).toBe(canon(saves.importSave(oldText)))
  // Exact historical deferred draft form, created by old named policy, no backdated event/notices.
  const due = tick(at(162), { deferPlayerClosure: true }); expect(playerClosure(due)).toBeUndefined()
  expect(due.corporateCondition.studios.find(r => r.studioId === due.hollywood!.playerStudioId)!.condition.stage).toBe('closed')
  const text = saves.exportSave(saves.makeSave(due)); const before = canon(due)
  const unsupported = adapter.importSaveJson(text); expect(unsupported.ok).toBe(false)
  if (!unsupported.ok) expect(unsupported.error).toMatch(/closure.due.*unsupported|unsupported.*closure.due/i)
  expect(canon(due)).toBe(before)
}), FIXTURE_MS)
