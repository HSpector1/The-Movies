// Extracted original natural-ledger classifier. No fixture reader or scenario action.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { expect } from 'vitest'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState, RelationshipEdge } from '../src/core/types.js'
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const FROZEN_REASONS: ReadonlySet<string> = new Set([
  'their compensation band ranked above the others', 'their term matched what this person prefers', 'they offered an opportunity',
  'their record with this person ranked above the others', 'their studio standing ranked higher', 'they are the current employer',
  'theirs was the only proposal on the table', 'their proposal ranked above the others overall',
])
const FROZEN_DROP_TEMPLATES: readonly RegExp[] = [
  /^.+ had not entered the industry by the decision week\.$/, /^.+'s offer lapsed — this person was already committed elsewhere by the decision week\.$/,
  /^.+'s offer named a start week that no longer matches this decision\.$/, /^.+'s offer fell below this person's reservation for that term\.$/,
  /^.+'s terms changed since submission\.$/, /^.+ could not fund the signing bonus\.$/, /^.+ had no seat open for this person's role at the decision week\.$/,
  /^.+'s attached promise no longer had a feasible path by the decision week\.$/, /^.+ holds a record this person distrusts\.$/,
]
const TIE_SENTENCE = 'this person could not separate 2 equally ranked proposals.'
const POACHING_REASONS = ['their compensation band ranked above the others', 'their term matched what this person prefers'] // p14b2-fixtures.ts :200-201
// P14C.2b (817 §2, approved_behavioral_change): the ONE seed-b extension row (above) carries
// a real new sentence outside FROZEN_REASONS. Admitted here BY NAME — this exact seed, event
// and sentence only — never added to FROZEN_REASONS and never loosened for any other row.
const KNOWN_EXTENSION_ROW = {
  seed: 'seed-b', eventId: 'talent-market-event-296', sentence: 'they accepted the one final extension before retiring',
} as const

const LEDGER_END_WEEK = 416
const CHURN_WEEKS = new Set([208, 416])
const LEDGER_SEEDS = {
  // P14C.1 (record 771, approved_behavioral_change): the `employment` digest on
  // every seed below moves because the pricing chain it hashes is
  // age-sensitive — ageFactor(offerForTalent) prices every genesis hire's
  // annualSalary/signingBonus off the now-floored-at-genesis stored age
  // (contract 762 §12 F3) rather than the pre-C.1 raw float. Measured (record
  // 771 family-12 entries): settlementDigest, receipts, rngState and takes are
  // UNMOVED for p13a-core-causal-01 (no rival casting decision changed); for
  // the other three seeds the repriced cash also moves which package
  // chooseIndustryPackage can afford, so `takes` moves too — its new value is
  // read here from the same deterministic run these `employment` values came
  // from (this file's own it.each; row counts, settlementDigest, receipts and
  // rngState below are all confirmed UNMOVED from their pre-C.1 pins).
  'p13a-core-causal-01': { role: 'default', rows: 40, settled: 16, declined: 8, expired: 16,
    settlement: '706e54c6ec9728df1664025982ebbafeb0fc36afb245b6bd0b983305f6a10a77', receipts: 'af8c4d1325ecb350dbc07fbf2f762dd8257db04075b8030bf7bd975b4cb2a766',
    employment: '4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58', takes: '8af116b1687ed210c02953b5b506456e638a64482e8042b0e549b0d57e428694',
    rng: '2598418427,508725886,1318803286,3129010527' },
  // `takes` also moves on these three seeds (unlike p13a-core-causal-01): the
  // repriced genesis cash changes which package chooseIndustryPackage can
  // afford, so rival casting moves. Value re-derived by running this same
  // it.each with the (now-fixed) `employment` pin in place, so the run first
  // reaches the `takes` assertion; every earlier pin (rows/settled/declined/
  // expired/settlementDigest/receipts/rngState) stays unmoved, confining the
  // change to exactly what contract 762 §12 F3 predicts.
  // P14C.2a (record 788, approved_behavioral_change): ONE row left this seed's chain, dropping rows
  // 48 -> 47 and settled 48 -> 47 (declined/expired unmoved at 0). The row that left is
  // `416:settled:person-studio-bc14baf6-r02-3` (event `talent-market-event-280` now falls where
  // `-281` used to; the whole `-r02-*` sequence is otherwise intact, `-0,-1,-2,-4,-5` all still
  // settle at 416). Cause (788): that rival actor crosses the actor hard-boundary at week 358 and
  // its 208-week contract's own end (E) is week 416 — the SAME week this ledger's natural chain
  // would have opened a renewal-market case for it — so under D8 no market case opens for an
  // announced (retiring) person, and the case that used to settle at 416 never opens. Intended law
  // (C.2a idle/hard-boundary retirement), measured, not a defect. `takes` and `rng` are CONFIRMED
  // UNMOVED (re-measured byte-identical to the pre-C.2a pins below) since the removed case never
  // touched casting or consumed any RNG draw; only the two digests that hash settlement/receipt/
  // employment rows move, and only because one row is now absent from each.
  // P14C.2b (record 817, approved_behavioral_change): the ONE row 788/C.2a's D8 hard
  // boundary dropped (416:settled:person-studio-bc14baf6-r02-3) returns under 806 §4/
  // §8.1: this same person's own announced record reaches its own extension window at
  // week 404 (E − 12 for its E = 416), and the incumbent studio-bc14baf6-r02 takes the
  // one final retirementExtension (case [404, retirementExtension, settled, 416]; the
  // record moves E 416 → 468, extendedFromWeek 416, extensionUsed true). rows/settled
  // move 47 → 48 (declined/expired unmoved at 0). Every week-416 event id shifts by +2
  // from the 788 pins (the extension's own discovery and proposal receipts at week 404
  // draw from the shared event counter); the other 47 rows keep kind, week, person,
  // winner, reasons and dropped, matching 788's own row-for-row account. The new row's
  // reason, "they accepted the one final extension before retiring", is a REAL sentence
  // outside FROZEN_REASONS — admitted below BY NAME as the one exempted extension row
  // (event talent-market-event-296), never added to FROZEN_REASONS itself and never
  // loosened for any other row on any seed. `takes` and `rngState` are CONFIRMED
  // measured BYTE-IDENTICAL to the pre-C.2b (788) pins — the extension settled by the
  // sole incumbent proposer, consuming no RNG draw and casting no one — so only
  // `settlement`, `receipts` and `employment` move, and only because one row is now
  // present that the 788 chain did not have.
  'seed-b': { role: 'seed-b (the seating/outcomes witness seed)', rows: 48, settled: 48, declined: 0, expired: 0,
    settlement: '417ee6240b548c753c4177338fbe336da7d50d062799af4557b0a3747ba0af1a', receipts: '21481d0f594d9bcabbd62ff475116dc0fdff55ea238c6c7c854629d6043256b7',
    employment: '52789533ee8c67c922e8566dda63e0611432582d4a076c90e64a6f3ddc178c18', takes: '1d9395b7c8408fb73d1eaff037297661e95326bd3cb9e70711effb6abba3b2a1',
    rng: '1640490702,2161102015,891615888,2071390822' },
  'p13b-s8-bridge-probe-01': { role: 'the bridge seed (plain campaign; the s8 file adds a laboratory placement it does not share)', rows: 48, settled: 48, declined: 0, expired: 0,
    settlement: 'f8b0d3a7a9d15b30ce65b3b90c291d29189aabd5f445621c7996117b4fd178c2', receipts: '4aa12d2b3e68a02ad2bdd663c668f59cd041139d8b86b3071d13858ea4d3c024',
    employment: '33623e8e79bcafd89ea08a93dbb7c8c6aef9cd27b8294370bd78c2cfb43a9cc2', takes: 'a4a704cb90dc3af612aaf2eb9cc92f13c9018734f72a25161cd4f92cfbe8debc',
    rng: '2343039306,887634093,2940629248,1402597496' },
  'p13-public-commercial-adoption': { role: 'the adoption seed (B.1 T1 ruling (v); the D3/poaching seed)', rows: 48, settled: 36, declined: 12, expired: 0,
    settlement: 'c034f2fb5a8e5f454a475020cec9de1ac764d742ce121a6cd8d2bc3b641eb544', receipts: 'be7310b6d73124dab34723644f7cf16c52a4b193e67a4b85d9c20e7f60e47850',
    employment: '94e3a1066c95b3b3dc0046b2a09ae32109b2d529297af5eb0d2f7e06bac51049', takes: '83a53d5b52dd7ffbb851c38fc508c70ac3af7da925457358c18a61bd5c04d871',
    rng: '3069080245,1730081600,660681499,2741201056' },
} as const
type LedgerSeed = keyof typeof LEDGER_SEEDS

const SLOTS = ['lead', 'antagonist', 'support'] as const
type Relationships = {
  currentTier: (edge: unknown, week: number) => string
  RELATIONSHIP_TIER_FLOOR: Record<string, number>
  RELATIONSHIP_RECENT_CAP: number
}
type Edge = { edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number; sharedProductions: number
  sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  // 1320-A S6: Save42 adds this exact counter to every edge at the live validator (era 42).
  sharedCompetitions: number
  peakTier: string; peakTierWeek: number; recent: readonly { kind: string; week: number; ref: string; delta: number }[]
  // 1358-N S6: Save44 adds the competitions log and the romance track to every edge (era 44).
  competitions: RelationshipEdge['competitions']; romance: RelationshipEdge['romance'] }
const edges = (state: GameState): readonly Edge[] => (state as unknown as { relationships?: readonly Edge[] }).relationships ?? []
/** The engine's new module, reached dynamically so the frozen pins of this file run before it exists. */
async function relationships(): Promise<Relationships | null> {
  try { return await import('../src/core/relationships.js') as unknown as Relationships } catch { return null }
}
/** The D1 predicate (plan scope (5); 647-B D1): strict at W on both ends, subject excluded. */
function rosterAt(state: GameState, issuer: string, subject: string, week: number): string[] {
  return state.hollywood!.employment
    .filter((e) => e.studioId === issuer && e.terms.talentId !== subject && e.terms.startWeek < week && (e.endedWeek === null || week < e.endedWeek))
    .map((e) => e.terms.talentId)
}
const sharesTake = (state: GameState, x: string, y: string): boolean =>
  state.firstTakes.some((t) => { const seats = [t.directorId, ...SLOTS.map((s) => t.cast[s])]; return seats.includes(x) && seats.includes(y) })
/** D5 band at W for one issuer (plan scope (5)): 2 close ties here, 0 enemies here, 1 none. */
function d5Band(rel: Relationships, state: GameState, subject: string, issuer: string, week: number): 0 | 1 | 2 {
  const roster = new Set(rosterAt(state, issuer, subject, week))
  const tiers = edges(state).filter((e) => e.a === subject || e.b === subject).filter((e) => roster.has(e.a === subject ? e.b : e.a))
    .map((e) => rel.currentTier(e, week))
  if (tiers.some((t) => t === 'CloseFriends' || t === 'Inseparable')) return 2
  if (tiers.some((t) => t === 'Enemies' || t === 'Nemeses')) return 0
  return 1
}
const settlementRows = (state: GameState) => state.talentMarket.receipts.filter((r) => r.kind === 'settled' || r.kind === 'declined' || r.kind === 'expired')
const settlementDigest = (state: GameState) => sha(JSON.stringify(settlementRows(state).map((r) => [r.eventId, r.kind, r.week, r.talentId, r.studioId, r.reasons, r.dropped])))
type Row = { week: number; eventId: string; kind: string; talentId: string; subjectStudioId: string; winner: string | null; reasons: readonly string[]; dropped: readonly string[]
  survivors: { issuer: string; roster: string[]; sharedTakeCounterparts: string[]; band: 0 | 1 | 2 | null }[]; churn: boolean; exposed: boolean; newSentences: string[] }
/** One deterministic pass; every settlement is classified AT ITS WEEK from receipts, employment and takes (receipt-derived, never assumed). */
function runLedger(seed: string, rel: Relationships | null, advance: (state: GameState) => GameState = tick): { state: GameState; rows: Row[] } {
  let state = p13aGeneratedStudio(seed)
  const rows: Row[] = []
  let seen = 0
  for (let step = 0; step < LEDGER_END_WEEK; step++) {
    state = advance(state)
    const week = state.market.tick
    const receipts = state.talentMarket.receipts
    for (let i = seen; i < receipts.length; i++) {
      const r = receipts[i]!
      if (r.kind !== 'settled' && r.kind !== 'declined' && r.kind !== 'expired') continue
      expect(r.week).toBe(week)
      const kase = state.talentMarket.cases.find((c) => c.talentId === r.talentId && c.closedWeek === r.week && c.outcome === r.kind)
      assert.ok(kase, `ledger: no case for receipt ${r.eventId}`)
      const names = new Map(state.hollywood!.identities.map((s) => [s.name, s.studioId] as const))
      const droppedIssuers = r.dropped.map((sentence) => {
        const hit = [...names.keys()].filter((n) => sentence.startsWith(n)).sort((a, b) => b.length - a.length)[0]
        assert.ok(hit, `ledger: a dropped sentence names no studio: ${sentence}`)
        expect(FROZEN_DROP_TEMPLATES.some((t) => t.test(sentence))).toBe(true) // nemesisOnRoster (or any tenth template) is never emitted
        return names.get(hit)!
      })
      const submitted = [...new Set(receipts.filter((q) => q.kind === 'proposalSubmitted' && q.talentId === r.talentId && q.week >= kase.openedWeek && q.week <= r.week).map((q) => q.studioId!))]
      const survivors = submitted.filter((s) => !droppedIssuers.includes(s)).map((issuer) => {
        const roster = rosterAt(state, issuer, r.talentId, r.week)
        return { issuer, roster, sharedTakeCounterparts: roster.filter((p) => sharesTake(state, r.talentId, p)), band: rel === null ? null : d5Band(rel, state, r.talentId, issuer, r.week) }
      })
      const newSentences = r.kind === 'settled' ? r.reasons.filter((s) => !FROZEN_REASONS.has(s)) : []
      rows.push({ week: r.week, eventId: r.eventId, kind: r.kind, talentId: r.talentId, subjectStudioId: kase.subjectStudioId, winner: r.kind === 'settled' ? r.studioId : null,
        reasons: r.reasons, dropped: r.dropped, survivors, churn: CHURN_WEEKS.has(r.week), exposed: survivors.length >= 2 && survivors.some((s) => s.sharedTakeCounterparts.length > 0), newSentences })
      // 647-B R2 — the receipt facts a lawful D5 movement must show, checked on EVERY settlement once the engine ranks on D5.
      if (rel !== null && r.kind === 'settled' && survivors.length >= 2) {
        const winner = survivors.find((s) => s.issuer === r.studioId)
        assert.ok(winner, `ledger: the winner of ${r.eventId} is not among the survivors`)
        const strictlyBest = survivors.every((s) => s === winner || winner.band! > s.band!)
        expect(newSentences.length > 0).toBe(strictlyBest)
        expect(newSentences.length).toBeLessThanOrEqual(1)
      }
    }
    seen = receipts.length
  }
  return { state, rows }
}


export { LEDGER_END_WEEK, LEDGER_SEEDS, runLedger, relationships, settlementDigest, settlementRows }

export { TIE_SENTENCE, POACHING_REASONS, KNOWN_EXTENSION_ROW }
export type { LedgerSeed }
