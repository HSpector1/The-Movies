// ── P15B Wave 5 (Bridge leaf; split from tests/p15b5-notices.test.ts so the core tsconfig never imports bridge/*) RED: notices, the loan intent and the public stage (1352-A §3 row 5, §7; 1357-A §7) ────
// The player's notices come at warning, at distress with the closure week shown as a countdown, and in
// the closure week; each names the recovery routes that remain (1352-A §4.3) or says that none does. A
// rival's stage alone is public; its since-week, cash and countdown stay private (1122-A; 1362-O 5.1; r3 review C4). The
// Bridge carries the one loan intent (1357-A §7: no playable Wave 2 without it) and the attention rows;
// the Industry projection carries the public stage. Burn and runway include the next installment.
// Nothing is manufactured for a migrated predecessor: no notice exists before the first evaluation.
import { describe, expect, it } from 'vitest'
import { financeProjection } from '../bridge/finance.js'
import { industryPage } from '../bridge/industry.js'
import { peopleProjection } from '../bridge/people.js'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.js'
import type { IndustryQuery } from '../bridge/schema/industry-schema.js'
import { AVAILABLE_INTENT_KINDS } from '../bridge/schema/intent-schema.js'
import { applyAvailableIntent, availableIntents } from '../bridge/session.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { base, closureOf, drainPlayer, loansOf, PLAYER, playerClosure, R04, R04_CLOSURE_WEEK, rivalClosure, ticksTo } from './helpers/p15b-live.js'

const PLAYER_LOAN_MAX = 390_000

let negativeRoute: Map<number, GameState> | null = null
function negativePlayer(toWeek: number): Map<number, GameState> {
  if (negativeRoute === null || Math.max(...negativeRoute.keys()) < toWeek) {
    const from = negativeRoute === null ? drainPlayer(base(), base().studio.cash + 1) : negativeRoute.get(Math.max(...negativeRoute.keys()))!
    const more = ticksTo(from, toWeek)
    negativeRoute = negativeRoute === null ? more : new Map([...negativeRoute, ...more])
  }
  return negativeRoute
}

const query = (view: IndustryQuery['view'], extra: Partial<IndustryQuery> = {}): IndustryQuery => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'p15b5', requestId: 'read-1',
  expectedStateRevision: 0, type: 'industryQuery', view, targetId: null, page: 0, pageSize: 10, lane: 'industryPrestige', period: 'all', ...extra })

describe('p15b5 notices: the Bridge (1357-A §7; 1352-A §3 row 5)', () => {
  it('bridge-take-loan-intent', () => {
    expect(AVAILABLE_INTENT_KINDS).toContain('takeLoan')
    const s134 = negativePlayer(134).get(134)!
    const offers = availableIntents(s134).filter((o) => o.kind === 'takeLoan')
    expect(offers.length).toBe(1)
    expect(offers[0]!.label).toMatch(/\$390,000/)
    expect(offers[0]!.detail).toMatch(/52 weeks/)
    expect(offers[0]!.detail).toMatch(/\$8,400/)
    const outcome = applyAvailableIntent(s134, offers[0]!.intentId)
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(loansOf(outcome.next, PLAYER).length).toBe(1)
      expect(outcome.next.studio.cash).toBe(s134.studio.cash + PLAYER_LOAN_MAX)
      // While repaying there is no second offer.
      expect(availableIntents(outcome.next).some((o) => o.kind === 'takeLoan')).toBe(false)
    }
    // Stable: no offer. Founding or no condition: no offer.
    expect(availableIntents(tick(base())).some((o) => o.kind === 'takeLoan')).toBe(false)
    expect(availableIntents(base()).some((o) => o.kind === 'takeLoan')).toBe(false)
    // A closed player studio offers nothing: read-only history.
    const closed = playerClosure().get(R04_CLOSURE_WEEK)!
    expect(closureOf(closed, PLAYER)).toBeDefined()
    expect(availableIntents(closed)).toEqual([])
  })

  it('bridge-finance-attention-and-industry-label', () => {
    const route = negativePlayer(138)
    const s138 = route.get(138)!
    const attention = financeProjection(s138, peopleProjection(s138)).attention
    const distress = attention.find((row) => row.id === 'corporate-distress')
    expect(distress).toBeDefined()
    expect(distress!.message).toMatch(/Week 163/)
    expect(distress!.route).toBeNull()
    expect(attention.map((row) => row.id)).toContain('cash-in-red')
    expect(financeProjection(tick(base()), peopleProjection(tick(base()))).attention.some((row) => row.id.startsWith('corporate-'))).toBe(false)
    // The Industry studios view carries the public stage of every studio, the closed one included.
    const closedRoute = rivalClosure(R04_CLOSURE_WEEK)
    const page = industryPage(closedRoute.get(R04_CLOSURE_WEEK)!, 'p15b5', 0, query('studios'))
    const rows = page.studios as unknown as { studioId: string; conditionLabel?: string }[]
    const r04 = rows.find((row) => row.studioId === R04)
    expect(r04?.conditionLabel).toBe('Closed')
    const player = rows.find((row) => row.studioId === PLAYER)
    expect(player?.conditionLabel).toBe('Stable')
    // The stage alone at every week of the route, for every studio row: no since-week, figure or countdown.
    for (const week of [134, 138, 150, R04_CLOSURE_WEEK]) {
      const page = industryPage(closedRoute.get(week)!, 'p15b5', 0, query('studios'))
      for (const row of page.studios as unknown as { studioId: string; conditionLabel?: string }[]) expect(row.conditionLabel, `${row.studioId} at ${week}`).not.toMatch(/\d/)
    }
    const warningPage = industryPage(closedRoute.get(134)!, 'p15b5', 0, query('studios'))
    expect((warningPage.studios as unknown as { studioId: string; conditionLabel?: string }[]).find((row) => row.studioId === R04)?.conditionLabel).toBe('Warning')
    // The rival's actual closure is announced on the player's attention rows in its closure week.
    const closedWeek = closedRoute.get(R04_CLOSURE_WEEK)!
    expect(financeProjection(closedWeek, peopleProjection(closedWeek)).attention.filter((row) => row.id === 'rival-closed').length).toBe(1)
  })
})
