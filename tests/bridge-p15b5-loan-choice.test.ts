// Proposed installation: tests/bridge-p15b5-loan-choice.test.ts.
// Scratch-only authored RED. Not run. No new fixture history or timing override.
// Authority: 1352-A §4.4 player chooses principal; 1357-A §7 quoted Bridge family.
import { describe, expect, it } from 'vitest'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.js'
import { parseWireValue } from '../bridge/schema/runtime.js'
import { BridgeSession, authoritativeDigest, availableIntents } from '../bridge/session.js'
import { applyTakeLoan } from '../src/core/corporateConditionLive.js'
import { studioWeeklyFixedCost } from '../src/core/powerRankingArchive.js'
import { contractLoan, loanMaxPrincipal } from '../src/core/studioLoan.js'
import { tick } from '../src/core/tick.js'
import { makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { base, canon, conditionRoot, drainPlayer, loansOf, PLAYER, recordOf, ticksTo } from './helpers/p15b-live.js'

// Reuse the exact constructed route of bridge-p15b5-notices, not a natural-recovery claim.
let cached: GameState | null = null
function warning(): GameState {
  if (cached === null) {
    const from = base()
    const prepared = drainPlayer(from, from.studio.cash + 1)
    expect(() => makeSave(prepared), 'admit the constructed input BEFORE any tick').not.toThrow()
    cached = ticksTo(prepared, 134).get(134)!
    expect(() => makeSave(cached!), 'admit the real tick-produced warning state').not.toThrow()
  }
  expect(recordOf(cached, PLAYER)?.condition).toMatchObject({ stage: 'warning', week: 134 })
  expect(loanMaxPrincipal(studioWeeklyFixedCost(cached, PLAYER))).toBe(390_000)
  return cached
}
function envelope(session: BridgeSession, commandId: string, revision = session.stateRevision) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: revision }
}
function truth(session: BridgeSession) {
  return { state: canon(session.gameState), revision: session.stateRevision }
}
function request(session: BridgeSession, principal: number, commandId: string) {
  return { ...envelope(session, commandId), type: 'quoteLoan' as const, draft: { principal } }
}
// Local prospective type, following common quote slots and accepted ok:false refusals.
// Canonical unions must be explicitly extended; this cast authorizes no wire bypass.
type LoanQuote = {
  intentId: string; kind: 'takeLoan'; commitLabel: string
  startsNow: boolean; queues: boolean; queueNote: string | null
  ok: boolean; refusalReason: string | null
  principal: number; minimumPrincipal: number; principalStep: number; maximumPrincipal: number
  total: number | null; contractedWeek: number; installments: number[]
}
function ask(session: BridgeSession, principal: number, commandId: string) {
  const wire = request(session, principal, commandId)
  const parsed = validateQuote(wire)
  expect(parsed.ok, `PREREQUISITE RED: canonical quoteLoan request absent/refused: ${JSON.stringify(parsed)}`).toBe(true)
  if (!parsed.ok) throw new Error('PREREQUISITE RED: quoteLoan request schema not admitted; later assertions NOT reached')
  const response = session.quote(parsed.quote)
  expect(response.accepted, `PREREQUISITE RED: quoteLoan dispatch absent/refused: ${JSON.stringify(response)}`).toBe(true)
  if (!response.accepted) throw new Error('PREREQUISITE RED: quoteLoan dispatch not admitted; later assertions NOT reached')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  const quote = response.quote as unknown as LoanQuote
  expect(quote.kind).toBe('takeLoan')
  return { response, quote }
}
function submit(session: BridgeSession, id: string, commandId: string, revision = session.stateRevision) {
  return session.command({ ...envelope(session, commandId, revision), type: 'submitIntent' as const, payload: { intentId: id } })
}
function refusal(state: GameState, principal: number): string {
  try { applyTakeLoan(state, principal) } catch (error) { return (error as Error).message }
  throw new Error('fixture premise: core must refuse this exact loan')
}
function legal(session: BridgeSession, principal: number, commandId: string) {
  const before = truth(session)
  const result = ask(session, principal, commandId)
  expect(result.quote).toMatchObject({ ok: true, refusalReason: null, principal,
    minimumPrincipal: 1_000, principalStep: 1_000, maximumPrincipal: 390_000,
    startsNow: true, queues: false, queueNote: null })
  const terms = contractLoan(principal, studioWeeklyFixedCost(session.gameState, PLAYER), session.gameState.market.tick)
  expect(result.quote.total).toBe(terms.total)
  expect(result.quote.contractedWeek).toBe(terms.contractedWeek)
  expect(result.quote.installments).toEqual(terms.installments)
  expect(truth(session), 'quoting changes no authoritative bytes or revision').toEqual(before)
  expect(result.response.stateDigest).toBe(authoritativeDigest(session.gameState))
  expect(result.response.stateRevision).toBe(before.revision)
  return result.quote
}

describe('Bridge C17: explicit lawful loan choice', () => {
  it.each([1_000, 2_000])('quotes and commits selected $%i once, with exact terms and journal replay', (principal) => {
    const state = warning()
    const session = new BridgeSession(state, `c17-${principal}`)
    const roots = conditionRoot(state)
    const q = legal(session, principal, 'choice')
    const first = submit(session, q.intentId, 'commit', 0)
    expect(first.accepted).toBe(true)
    if (!first.accepted) throw new Error(first.message)
    const next = session.gameState
    expect(canon(next), 'Bridge commit equals the real core action, including ledger/sequence/record').toBe(canon(applyTakeLoan(state, principal)))
    const loan = loansOf(next, PLAYER).at(-1)!
    expect(loansOf(next, PLAYER)).toHaveLength(loansOf(state, PLAYER).length + 1)
    expect(loan).toMatchObject({ principal, total: q.total, contractedWeek: q.contractedWeek, installments: q.installments })
    expect(conditionRoot(next).nextLoan).toBe(roots.nextLoan + 1)
    expect(next.p15Sequence.next).toBe(state.p15Sequence.next + 1)
    expect(next.studio.cash).toBe(state.studio.cash + principal)
    expect(next.ledger.filter(row => row.kind === 'loanPrincipal' && row.week === state.market.tick && row.amount === principal)).toHaveLength(1)
    expect(session.stateRevision).toBe(1)
    const after = truth(session)
    expect(submit(session, q.intentId, 'commit', 0)).toEqual(first)
    expect(truth(session)).toEqual(after)
    const reused = submit(session, q.intentId, 'fresh-command')
    expect(reused.accepted).toBe(false)
    if (!reused.accepted) expect(reused.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(truth(session)).toEqual(after)
  })

  it('distinct chosen principals bind distinct IDs; maximum shortcut remains exactly one option', () => {
    const session = new BridgeSession(warning(), 'c17-id')
    const before = truth(session)
    const small = legal(session, 1_000, 'small')
    const other = legal(session, 2_000, 'other')
    expect(other.intentId).not.toBe(small.intentId)
    const maximum = availableIntents(session.gameState).filter(o => o.kind === 'takeLoan')
    expect(maximum).toHaveLength(1)
    expect(maximum[0]!.label).toContain('$390,000')
    expect(truth(session)).toEqual(before)
    const committed = submit(session, other.intentId, 'select-other')
    expect(committed.accepted).toBe(true)
    expect(loansOf(session.gameState, PLAYER).at(-1)?.principal).toBe(2_000)
  })

  it('illegal finite principals are precise noncommittable core refusals, never clamped', () => {
    const session = new BridgeSession(warning(), 'c17-illegal')
    const before = truth(session)
    for (const principal of [0, -1_000, 1_500, 2_000.5, 391_000]) {
      const q = ask(session, principal, `bad-${principal}`).quote
      expect(q).toMatchObject({ ok: false, principal, refusalReason: refusal(session.gameState, principal), total: null, installments: [] })
      const commit = submit(session, q.intentId, `bad-commit-${principal}`)
      expect(commit.accepted).toBe(false)
      if (!commit.accepted) expect(commit.reasonCode).toBe('INTENT_NOT_AVAILABLE')
      expect(truth(session)).toEqual(before)
    }
  })

  it('real stable and already-borrowed states refuse eligibility BEFORE an illegal principal', () => {
    const stable = tick(base())
    expect(() => makeSave(stable), 'admit the real stable state before testing eligibility').not.toThrow()
    expect(recordOf(stable, PLAYER)?.condition.stage).toBe('stable')
    const borrowed = applyTakeLoan(warning(), 1_000)
    expect(() => makeSave(borrowed), 'admit the core-produced outstanding loan before testing eligibility').not.toThrow()
    for (const [label, state] of [['stable', stable], ['borrowed', borrowed]] as const) {
      const session = new BridgeSession(state, `c17-${label}`)
      const before = truth(session)
      const expected = refusal(state, 0)
      expect(expected).toBe(label === 'stable' ? 'Loans are available only in warning or distress.' : 'This studio is still repaying its loan; one loan at a time.')
      const q = ask(session, 0, `eligibility-${label}`).quote
      expect(q.ok).toBe(false)
      expect(q.refusalReason).toBe(expected)
      expect(submit(session, q.intentId, `blocked-${label}`).accepted).toBe(false)
      expect(truth(session)).toEqual(before)
    }
  })

  it('loan quotes use shared stale guard and clear-on-load even for digest-identical saved bytes', () => {
    const session = new BridgeSession(warning(), 'c17-load')
    expect(session.save(envelope(session, 'save')).accepted).toBe(true)
    const q = legal(session, 1_000, 'before-load')
    const digest = authoritativeDigest(session.gameState)
    expect(session.load(envelope(session, 'load')).accepted).toBe(true)
    expect(authoritativeDigest(session.gameState)).toBe(digest)
    const before = truth(session)
    const staleRequest = validateQuote({ ...request(session, 2_000, 'stale-quote'), expectedStateRevision: 0 })
    expect(staleRequest.ok).toBe(true)
    if (!staleRequest.ok) throw new Error('loan schema prerequisite no longer admitted')
    const staleQuote = session.quote(staleRequest.quote)
    expect(staleQuote.accepted).toBe(false)
    if (!staleQuote.accepted) expect(staleQuote.reasonCode).toBe('STALE_REVISION')
    const stale = submit(session, q.intentId, 'old-revision', 0)
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')
    const cleared = submit(session, q.intentId, 'current-revision')
    expect(cleared.accepted).toBe(false)
    if (!cleared.accepted) expect(cleared.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(truth(session)).toEqual(before)
  })

  it('loan family enters the existing cap16 map: first distinct draft evicted, latest usable', () => {
    const session = new BridgeSession(warning(), 'c17-cap')
    const before = truth(session)
    const ids: string[] = []
    for (let n = 1; n <= 17; n++) ids.push(legal(session, n * 1_000, `cap-${n}`).intentId)
    expect(new Set(ids).size).toBe(17)
    const evicted = submit(session, ids[0]!, 'evicted')
    expect(evicted.accepted).toBe(false)
    if (!evicted.accepted) expect(evicted.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(truth(session)).toEqual(before)
    expect(submit(session, ids[16]!, 'latest').accepted).toBe(true)
    expect(loansOf(session.gameState, PLAYER).at(-1)?.principal).toBe(17_000)
  })

  it('resolved real loan commit revalidates a core-produced outstanding loan; public digest guard is not the witness', () => {
    const initial = warning()
    const session = new BridgeSession(initial, 'c17-revalidate')
    const q = legal(session, 2_000, 'revalidate')
    // Narrow access to the actual existing resolver. No internal state or pending-map mutation.
    // The public route correctly rejects changed boards before apply; use this seam to REACH apply.
    const resolve = session as unknown as { quotedIntentFor(id: string): { apply(current: GameState): { ok: true; next: GameState } | { ok: false; error: string } } | undefined }
    const intent = resolve.quotedIntentFor(q.intentId)
    expect(intent, 'PREREQUISITE: a legal loan quote must register a real pending intent').toBeDefined()
    if (intent === undefined) throw new Error('PREREQUISITE RED: no pending loan intent; revalidation NOT reached')
    const changed = applyTakeLoan(initial, 1_000)
    expect(() => makeSave(changed), 'admit the core-produced changed input BEFORE pending apply').not.toThrow()
    const before = canon(changed)
    const outcome = intent.apply(changed)
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.error).toBe(refusal(changed, 2_000))
    expect(canon(changed)).toBe(before)
    expect(truth(session)).toEqual({ state: canon(initial), revision: 0 })
  })
})
