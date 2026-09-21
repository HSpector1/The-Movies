// 654-T (record 653 NEXT653; plan T1 "independent test-author RED against accepted predecessor").
// P14B.5 First Shared-Work Bond Core — the BRIDGE RED: family 11 (projection 48, THIN — forced by the closed
// six-member `priorityOrder` enum, plan "Scope — bridge") and family 12 (the R-D5 natural-chain LEDGER, measured
// on unchanged source and pinned as the frozen control; scratchpad/654-T-ledger.md is the record). Authored at
// HEAD 74bd325b on a clean tree; no production, helper, fixture, generated artifact or timeout is touched.
//
// RED-BY-VALUE (the thin surface needs no bridge module, so nothing here imports an absent bridge file):
//   (a) the `priorityOrder` wire enum gains `relationships` (bridge-schema.ts :2320-2324);
//   (b) `DESCRIPTOR_LABEL` gains a phrase for it (people.ts :866-875) — observable only as the `line` staying
//       total and unchanged, since `relationships` sits at index 2/3 and the line reads [0]/[1];
//   (c) the OUTGOING 47 identity is registered as `projection-v47` (runtime-checkpoint.ts :59-63) and the
//       registry holds the 35 accepted prior ids PLUS it;
//   (d) the generator artifacts stay in sync with the running identity (law, stable across the bump);
//   (e) `preferences.priorityOrder` publishes SEVEN members on a genuine open case and the D5 settlement sentence
//       reaches `settlementReasons` VERBATIM (people.ts :998, free text, no enum);
//   (f) the leak law extends to the new facts: no `closeness`, no edge, no `recent` delta on any serialized DTO.
// The FROZEN SIDE (GREEN today; R-VERSION class, re-expressed by the test-author's sweep after T2): projection 47,
// `SCHEMA_ID` = sha256:6f6b4880…, exactly 35 prior ids, `LIVE_SAVE_VERSION` 30, the checkpoint loading as CURRENT.
//
// Anything that needs the engine's new module is reached through a DYNAMIC import inside the case, so this file
// loads and its frozen pins and ledger controls run today; those cases reject (RED) until T2 creates the module,
// and the first assertion in each of them is that the import resolved (memory rule: never a spurious pass).
//
// FAMILY 12 — THE LEDGER (R-D5 pre-declaration, 647-B D1/R2/A2; measured 2026-09-22 on HEAD 74bd325b, four seeds,
// 416 ticks each): settlement receipts fall at the SYNCHRONIZED CHURNS 208 and 416 only (the plan's "404" is the
// week the second-cycle cases OPEN; they settle at 416). At 208 EVERY survivor's roster under the D1 predicate is
// EMPTY on every seed (D1 CONFIRMED: churn receipts are NOT exposed). At 416 the only rows active under the predicate
// are r01's four `replacement` rows 265→473 (`*-supply-265-6..9`, research supply staff), and NONE of them shares a
// first take with any subject. Hence ZERO receipts on the four seeds are exposed to D5 through 416, and the four
// chain digests below MUST NOT MOVE at T2. After T2 the same routine recomputes the D5 bands at W for every
// settlement (647-B R2) from the engine's own tiers and rosters, so a lawful movement anywhere is attributed on
// the spot: the D5 sentence is REQUIRED iff the winner's band strictly exceeds every other survivor's.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { canonicalJson, schemaIdentity } from '../bridge/schema/canonical.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import * as marketModule from '../src/core/talentMarket.js'
import { submitProposal } from '../src/core/talentMarket.js'
import { attachPromise } from '../src/core/promises.js'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToV31, validateSaveV30 } from '../src/core/save.js'
import { advanceTo, fund, p13aGeneratedStudio, player, poachingFixture } from './helpers/p14b2-fixtures.js'
import type { GameState, TalentMarketCase, TalentMarketReceipt } from '../src/core/types.js'

const OUTGOING_46 = 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c'
const OUTGOING_47 = 'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538' // T0 MANIFEST authority.schemaId
const OUTGOING_PROJECTION = 47
// The 35 accepted prior literals (tests/bridge-p14b4-runtime47-compatibility.test.ts :39-75); never derived from the registry.
const EXPECTED_35_PRIOR_IDS = [
  'sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e', 'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5',
  'sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f', 'sha256:15033cf9ca43be65abcb25fc6f910f9487ac23056090126ec7d3e2353f6ce587',
  'sha256:18de162d1a9da3034378f71cec3d3b3f109ea91df8c1a8d40469924108b36e78', 'sha256:1bad05a95c284e64ceaef54c276f2dd0ccad8ca3ef1b12198068bb61b85198c9',
  'sha256:204a71924bd8c2e8ae9af47591226894b3e42f62457da3cc20ed6b106ede611a', 'sha256:2b339a6a8b3e5add0726b7eaac9ce8746e235d8b6111a6816f890ff56afdffd1',
  'sha256:510f08e4a551827a30e0f3d93bbe09fa5ddadbd39366b4dcfa93530500c7979c', 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',
  'sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d', 'sha256:625377a2804a681da3be209da02850e221ae33ac5f58b727f6395736ad607ad1',
  'sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9', 'sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b',
  'sha256:7e3af4db0d3d18cdeaab00082e0034f304a9141f46ea87e9e64e5a99d985483c', 'sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47',
  'sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236', 'sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85',
  'sha256:92317ec179456cdc5bd5cc7c4ca47dd066b768a9e2e45519f1263ef921a211a4', 'sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211',
  'sha256:a481d14f3810ffbafcba2bbf509db7340263f3f0fd665a059507a1567d98923d', 'sha256:a6f374596e956800f9547ad538fdd859c01bda3460aac8b877279c67686c6f4b',
  'sha256:b779faa92227bd1f2e623ad04d0899c87e7ddc60ce43f9ae9c39a7626c20a83d', 'sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f',
  'sha256:be7ed660d04ed9b1056f48e946f86f26c10cab42b950a273d57ad9cba372f5bb', 'sha256:c6ab1b2f181b7cbbd1b873a276f0be0516a505f258c3c9ad996042e43e096712',
  'sha256:c9c07d6febe4afee7f7c27c991acdfa1c86b6c3a7f5dff8528d7fa5ad72e43a1', 'sha256:c9dad9f3d8bb94445db1a5425d90db3f9894da9354f47a07992ff96261cfc399',
  'sha256:d3338cb713385cc23414e6a17293a5900871764f0eeaed19698e17634e74740b', 'sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99',
  'sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48', 'sha256:ea5d645f34a472f4710b9273b225d6f15433d6d17ae8ed1af3c03686a225c8c4',
  'sha256:eb95add0fc06a54d19998c4707dd0b0ba861a22cfee6d8e6631499beeea18e25', 'sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61',
  'sha256:fe9bf4558dc12abc5f258ba8b8f581242e06361cfbae8ae31d8c676f6c7a6460',
] as const
const CHECKPOINT = {
  gz: '38275e91d083651f232a2845b1bd8b738ac996c63523c65203c4ca8f72703d11', raw: 'c7e3cd2a56ef0871b8a8754ce1a75b06d095916f9aeb71e57229fc2aeee6496b',
  current: '6788225135a0c7a2eca94faaf6d0d068b8dac1ba00e7b6b8ad29c7d4338c7388', saved: 'b7a32680df6f002c10829e7edd644a394b9b0cdac1427a7af0aef5395501aebe',
  journal: '5cad726588c2caf2514c13bf75de5eaa66747b345441a20c83ad9e620b3f7d99', sessionId: 'p14b5-genuine-outgoing47', week: 45, talentId: 't-act-09',
} as const
const CURRENT_P1 = { gz: 'a13704632d58909b9edc330f2f6d946f3e3fe7bfc1d9d2adb3ab2a430fd540fd', raw: CHECKPOINT.saved, week: 45 } as const
// Companion §2.1.7 :120 — the seven-member public orders.
const UNPROVEN_ORDER = ['opportunity', 'compensation', 'relationships', 'term', 'trust', 'standing', 'incumbency'] as const
const WIRE_ENUM_7 = ['opportunity', 'compensation', 'term', 'trust', 'standing', 'incumbency', 'relationships'] as const
// Measured on unchanged source (bridge/people.ts :991 reads [0]/[1] only): the line does NOT move with the bump.
const CURRENT_P1_LINE = 'Prefers terms of 1 year · Weighs the opportunity offered first, then compensation'
// The eight FROZEN settlement sentences (talentMarket.ts :671-678, :877, :885) and the nine FROZEN drop templates (:1022-1032).
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

// ── the ledger seeds and their frozen controls (654-T ledger §B; 416 ticks from p13aGeneratedStudio(seed)) ──
const LEDGER_END_WEEK = 416
const CHURN_WEEKS = new Set([208, 416])
const LEDGER_SEEDS = {
  'p13a-core-causal-01': { role: 'default', rows: 40, settled: 16, declined: 8, expired: 16,
    settlement: '706e54c6ec9728df1664025982ebbafeb0fc36afb245b6bd0b983305f6a10a77', receipts: 'af8c4d1325ecb350dbc07fbf2f762dd8257db04075b8030bf7bd975b4cb2a766',
    employment: '09bcc35ba327579ac63dd1ed63535b23cbc8ff55b25fd9597a2872a819f08750', takes: '8af116b1687ed210c02953b5b506456e638a64482e8042b0e549b0d57e428694',
    rng: '2598418427,508725886,1318803286,3129010527' },
  'seed-b': { role: 'seed-b (the seating/outcomes witness seed)', rows: 48, settled: 48, declined: 0, expired: 0,
    settlement: 'f9622a876a73673591f4016b5fe80ab708bbec30e330a423d3d82729b0ec678c', receipts: '8e791d65d1a54ee73a8c7a2debbfed272a0f144f240040d074118a337edeb871',
    employment: 'ba5ab89e481264e8d6a57d32f07ac49902bcc36b65a1df14722f85c573f0b13a', takes: 'c81d90211a2b917681e8c816c85df567a2139dda9372d3cd608615f9e23c805d',
    rng: '1640490702,2161102015,891615888,2071390822' },
  'p13b-s8-bridge-probe-01': { role: 'the bridge seed (plain campaign; the s8 file adds a laboratory placement it does not share)', rows: 48, settled: 48, declined: 0, expired: 0,
    settlement: 'f8b0d3a7a9d15b30ce65b3b90c291d29189aabd5f445621c7996117b4fd178c2', receipts: 'b729a1f33fac085228697a52bb474400b26ca04dab8114f2cd3fa893861186c4',
    employment: '6e39a55cbf70e669ac5b27e1d845a6279057ead6b2922c526d25a45f605043ae', takes: 'df029e65f83f015c0efe36258b36444c9c0f30e61e9d732b791d13a4d8d6da75',
    rng: '2343039306,887634093,2940629248,1402597496' },
  'p13-public-commercial-adoption': { role: 'the adoption seed (B.1 T1 ruling (v); the D3/poaching seed)', rows: 48, settled: 36, declined: 12, expired: 0,
    settlement: 'c034f2fb5a8e5f454a475020cec9de1ac764d742ce121a6cd8d2bc3b641eb544', receipts: 'be7310b6d73124dab34723644f7cf16c52a4b193e67a4b85d9c20e7f60e47850',
    employment: 'bb775d62c37d48e48af30811a69c86e117d89c63166bd1af4d73df1b3c16fc97', takes: '3867855dd105c2fff8389e9dc76b56d7ecc43f9722419de3e85423a84b087094',
    rng: '3069080245,1730081600,660681499,2741201056' },
} as const
type LedgerSeed = keyof typeof LEDGER_SEEDS

const artifact = (path: string) => new URL('./fixtures/p14/' + path, import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const clone = <T>(value: T): T => structuredClone(value)
const SLOTS = ['lead', 'antagonist', 'support'] as const
type Relationships = {
  currentTier: (edge: unknown, week: number) => string
  RELATIONSHIP_TIER_FLOOR: Record<string, number>
}
type Edge = { edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number; sharedProductions: number
  sharedSuccesses: number; sharedFailures: number; sharedCancellations: number; peakTier: string; peakTierWeek: number; recent: readonly { kind: string; week: number; ref: string; delta: number }[] }
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
function runLedger(seed: string, rel: Relationships | null): { state: GameState; rows: Row[] } {
  let state = p13aGeneratedStudio(seed)
  const rows: Row[] = []
  let seen = 0
  for (let step = 0; step < LEDGER_END_WEEK; step++) {
    state = tick(state)
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

// ── the family-6 world for the wire (the engine RED's construction, duplicated here because helpers are frozen) ──
const F6 = { seed: 'p13-public-commercial-adoption', subject: 'person-studio-5a47d054-r04-3', incumbent: 'studio-5a47d054-r04', W: 208 } as const
function signActor(state: GameState, termWeeks: number, exclude: readonly string[] = []) {
  const id = hiringMarketIds(state, state.market.tick).map((i) => state.talent.find((t) => t.id === i)).find((t) => t?.role === 'actor' && !exclude.includes(t.id))?.id
  if (id === undefined) throw new Error('fixture premise failed: no signable actor')
  return { state: applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks }]), id }
}
function f6Base(): { at207: GameState; playerId: string; r01: string; offCycle: string } {
  let state = fund(p13aGeneratedStudio(F6.seed))
  const reliable = signActor(state, 52); state = reliable.state
  const closedAtW = signActor(state, 208, [reliable.id]); state = closedAtW.state
  state = advanceTo(state, 60)
  const offCycle = signActor(state, 156, [reliable.id, closedAtW.id]); state = offCycle.state
  state = advanceTo(state, 195)
  let preMarket196: GameState | undefined
  const real = marketModule.advanceTalentMarketWeek
  const capture = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation((input) => {
    if (input.market.tick === 196) preMarket196 = clone(input)
    return real(input)
  })
  try { tick(state) } finally { capture.mockRestore() }
  if (preMarket196 === undefined) throw new Error('F6 premise: no real week-196 market input captured')
  state = preMarket196
  const playerId = player(state)
  const row = state.hollywood!.employment.find((e) => e.studioId === F6.incumbent && e.terms.talentId === F6.subject && e.endedWeek === null)!
  expect(row.terms.endWeekExclusive).toBe(F6.W)
  const counter = state.talentMarket.receipts.length
  const kase: TalentMarketCase = { talentId: F6.subject, subjectStudioId: F6.incumbent, contractId: row.contractId, openedWeek: 196, outcome: null, closedWeek: null, reason: null }
  const discovery: TalentMarketReceipt = { eventId: `talent-market-event-${String(counter)}`, kind: 'discovered', week: 196, talentId: F6.subject, studioId: F6.incumbent, reasons: [], dropped: [] }
  state = { ...state, talentMarket: { ...state.talentMarket, cases: [...state.talentMarket.cases, kase], receipts: [...state.talentMarket.receipts, discovery] } }
  const entered = state.hollywood!.identities.filter((s) => s.enteredWeek !== null)
  for (const issuer of entered) state = submitProposal(state, { talentId: F6.subject, issuerStudioId: issuer.studioId, termWeeks: 208, premiumTier: 1 })
  state = advanceTo(marketModule.advanceTalentMarketWeek(state), 207)
  const r01 = entered.find((s) => s.studioId.endsWith('-r01'))!.studioId
  for (const issuer of entered.filter((s) => ![playerId, r01].includes(s.studioId))) {
    state = attachPromise(state, F6.subject, issuer.studioId, { family: 'APPEARANCE_COUNT', predicate: { count: 999 }, windowStartWeek: 415, dueWeekExclusive: 416 })
  }
  const standing = state.hollywood!.businesses.find((b) => b.studioId === r01)!.standing
  state = { ...state, studio: { ...state.studio, standing: { ...standing } } }
  return { at207: state, playerId, r01, offCycle: offCycle.id }
}
const settlementAt208 = (state: GameState) => {
  const receipt = state.talentMarket.receipts.find((r) => r.talentId === F6.subject && r.week === F6.W && (r.kind === 'settled' || r.kind === 'declined'))
  assert.ok(receipt, 'F6: no settlement receipt at 208')
  return receipt
}
function currentP1(): GameState {
  const compressed = readFileSync(artifact('genuine-v30-pre-b5/genuine-v30-current-p1.json.gz'))
  expect(sha(compressed)).toBe(CURRENT_P1.gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(raw)).toBe(CURRENT_P1.raw)
  return validateSaveV30(JSON.parse(raw)).state as GameState
}
type HistoricalCheckpoint = { format: string; protocolVersion: number; schemaId: string; sessionId: string; currentSaveJson: string; savedSaveJson: string; journalDigest: string }
function checkpoint(): { raw: string; prior: HistoricalCheckpoint } {
  const compressed = readFileSync(artifact('genuine-projection47-runtime/genuine-projection47-runtime.checkpoint.json.gz'))
  expect(sha(compressed)).toBe(CHECKPOINT.gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(raw)).toBe(CHECKPOINT.raw)
  const prior = JSON.parse(raw) as HistoricalCheckpoint
  expect(canonicalJson(prior) + '\n').toBe(raw)
  expect(prior).toMatchObject({ format: 'project-studio-bridge-runtime-checkpoint', protocolVersion: 4, schemaId: OUTGOING_47, sessionId: CHECKPOINT.sessionId, journalDigest: CHECKPOINT.journal })
  expect(sha(prior.currentSaveJson)).toBe(CHECKPOINT.current)
  expect(sha(prior.savedSaveJson)).toBe(CHECKPOINT.saved)
  return { raw, prior }
}
const wireEnum = (): string[] => {
  const schema = BRIDGE_SCHEMA as unknown as { $defs: Record<string, { properties: Record<string, { items: { enum: string[] } }> }> }
  return schema.$defs['StudioMarketPreferencesSnapshot']!.properties['priorityOrder']!.items.enum
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('P14B.5 frozen side — the OUTGOING wire identities (GREEN today; R-VERSION class, re-expressed after T2 by the test-author\'s sweep)', () => {
  it('projection 47, SCHEMA_ID sha256:6f6b4880…, LIVE_SAVE_VERSION 30, exactly the 35 accepted prior ids with projection-v46 at the head', () => {
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(OUTGOING_PROJECTION)
    expect(SCHEMA_ID).toBe(OUTGOING_47)
    expect(LIVE_SAVE_VERSION).toBe(30)
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_35_PRIOR_IDS])
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_46)).toBe('projection-v46')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(OUTGOING_47)).toBe(false)
  })

  it('the genuine projection-47 checkpoint loads as the CURRENT identity today (no migration)', () => {
    const { raw } = checkpoint()
    const neverMigrate = vi.fn(() => { throw new Error('current schema must not migrate') })
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, neverMigrate)
    expect(loaded.migratedFromProtocolVersion).toBeNull()
    expect(neverMigrate).not.toHaveBeenCalled()
  })

  it('the checked-in generator artifacts equal the running identity (law: stable across the bump once the generator runs)', () => {
    const schemaJson = JSON.parse(readFileSync(new URL('../bridge/schema/project-studio-bridge.schema.json', import.meta.url), 'utf8')) as { $id: string; 'x-project-studio': { projectionVersion: number } }
    const manifest = JSON.parse(readFileSync(new URL('../generated/unity/project-studio-bridge.contract-manifest.json', import.meta.url), 'utf8')) as { schemaId: string; projectionVersion: number }
    const csharp = readFileSync(new URL('../generated/unity/StudioBridgeDtos.Generated.cs', import.meta.url), 'utf8')
    expect(schemaIdentity(BRIDGE_SCHEMA)).toBe(SCHEMA_ID)
    expect(schemaJson.$id).toBe(`urn:project-studio:bridge:protocol-4:projection-${String(PROJECTION_VERSION)}`)
    expect(schemaJson['x-project-studio'].projectionVersion).toBe(PROJECTION_VERSION)
    expect(BRIDGE_SCHEMA.$id).toBe(schemaJson.$id)
    expect(manifest).toMatchObject({ schemaId: SCHEMA_ID, projectionVersion: PROJECTION_VERSION })
    expect(csharp).toContain(`// Schema identity: ${SCHEMA_ID}`)
    expect(csharp).toContain('string[] priorityOrder') // a JSON-schema enum widening, never a C# enum (647-B 14(b))
  })

  it('the `line` on a genuine open case reads [0]/[1] only and the six landed members parse against the wire enum today', () => {
    const state = currentP1()
    const block = marketCaseProjection(state, CHECKPOINT.talentId, player(state))
    assert.ok(block, 'T0 premise: no market case for t-act-09 on current-p1')
    expect(block.status).toBe('proposals_open')
    expect(block.preferences.line).toBe(CURRENT_P1_LINE)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPreferencesSnapshot, block.preferences)).toEqual(block.preferences)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 11 — projection 48 THIN (RED by value): the enum, the registry, the seven-member order, the D5 sentence on the wire', () => {
  it('the priorityOrder wire enum gains `relationships` (seven members, closed)', () => {
    expect([...wireEnum()].sort()).toEqual([...WIRE_ENUM_7].sort())
  })

  it('the running identity moves off the outgoing 47 and 47 is registered as projection-v47 beside the 35 accepted priors (36)', () => {
    expect(PROJECTION_VERSION).toBeGreaterThan(OUTGOING_PROJECTION)
    expect(SCHEMA_ID).not.toBe(OUTGOING_47)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_47)).toBe('projection-v47')
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_35_PRIOR_IDS, OUTGOING_47].sort())
    expect(LIVE_SAVE_VERSION).toBeGreaterThan(30) // the governed inner-save step rides the same wave (R22 :610)
  })

  it.each(['currentSaveJson', 'savedSaveJson'] as const)('the genuine projection-47 checkpoint takes the governed prior path and %s lands on the live save through migrateToV31', (slot) => {
    expect(typeof migrateToV31).toBe('function')
    const { raw, prior } = checkpoint()
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => 'p14b5-new48-' + slot)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const actualBytes = loaded.hydrated.checkpoint[slot]
    assert.ok(typeof actualBytes === 'string')
    const expected = migrateToV31(importSave(prior[slot]))
    expect(expected.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(actualBytes).toBe(exportSave(expected))
    const actual = importSave(actualBytes)
    expect(actual.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(actual.state.market.tick).toBe(CHECKPOINT.week)
    expect((actual.state as unknown as { relationships: unknown }).relationships).toEqual([])
    const old = validateSaveV30(JSON.parse(prior[slot]))
    expect(actual.state.promises).toEqual(old.state.promises)
    expect(actual.state.firstTakes).toEqual(old.state.firstTakes)
    expect(actual.state.talentMarket).toEqual(old.state.talentMarket)
    expect(actual.state.hollywood).toEqual(old.state.hollywood)
    expect(sha(raw)).toBe(CHECKPOINT.raw)
  })

  it('preferences.priorityOrder publishes SEVEN members on a genuine open case with the `line` unchanged, and the value parses against the widened enum', () => {
    const state = currentP1()
    const block = marketCaseProjection(state, CHECKPOINT.talentId, player(state))!
    expect(block.preferences.priorityOrder).toEqual([...UNPROVEN_ORDER])
    expect(block.preferences.line).toBe(CURRENT_P1_LINE)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPreferencesSnapshot, block.preferences)).toEqual(block.preferences)
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === CHECKPOINT.talentId)!
    expect(profile.marketCase!.preferences).toEqual(block.preferences)
    expect(marketPage(state, { view: 'market', targetId: CHECKPOINT.talentId }).selected!.rail.preferences).toEqual(block.preferences)
  })

  it('the D5 settlement sentence reaches settlementReasons VERBATIM on the family-6 world, and no closeness, edge or driver leaks onto any serialized DTO', async () => {
    const rel = await relationships()
    assert.ok(rel, 'RED: src/core/relationships.ts does not exist yet')
    expect(typeof rel.currentTier).toBe('function')
    const base = f6Base()
    const [a, b] = F6.subject < base.offCycle ? [F6.subject, base.offCycle] : [base.offCycle, F6.subject]
    const closeness = rel.RELATIONSHIP_TIER_FLOOR['CloseFriends']!
    const edge: Edge = { edgeId: `relationship-edge-${String(edges(base.at207).length)}`, a, b, closeness, firstSharedWeek: 207, lastEventWeek: 207,
      sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, peakTier: 'CloseFriends', peakTierWeek: 207,
      recent: [{ kind: 'sharedProduction', week: 207, ref: 'staged-production', delta: 1 }] }
    const staged = makeSave({ ...base.at207, relationships: [...edges(base.at207), edge] } as unknown as GameState) // validator-admitted staging
    expect(staged.saveVersion).toBe(LIVE_SAVE_VERSION)
    const after = tick(staged.state as GameState)
    const receipt = settlementAt208(after)
    expect(receipt.kind).toBe('settled')
    expect(receipt.studioId).toBe(base.playerId)
    const sentence = receipt.reasons.filter((s) => !FROZEN_REASONS.has(s))
    expect(sentence).toHaveLength(1)
    expect(sentence[0]).not.toMatch(/\d/)
    for (const viewer of [base.playerId, base.r01, F6.incumbent]) {
      const block = marketCaseProjection(after, F6.subject, viewer)
      assert.ok(block)
      expect(block.status).toBe('settled')
      expect(block.settlementReasons).toEqual([...receipt.reasons]) // people.ts :998 — verbatim, free text, no enum
      const dto = JSON.stringify({ block, people: peopleProjection(after), market: marketPage(after, { view: 'market', targetId: F6.subject }) })
      for (const leak of ['"closeness"', '"edgeId"', 'relationship-edge-', '"recent"', '"relationships"', '"lastEventWeek"', '"peakTier"']) expect(dto).not.toContain(leak)
      expect(dto).not.toContain(String(closeness) + '"') // no number of the record on the wire
    }
    // the control (no edge) shows the same wire with the tie sentence and no D5 sentence
    const control = settlementAt208(tick(base.at207))
    expect(control.kind).toBe('declined')
    expect(control.reasons).toEqual([TIE_SENTENCE])
    expect(marketCaseProjection(tick(base.at207), F6.subject, base.playerId)!.settlementReasons).toEqual([TIE_SENTENCE])
  }, 180_000)
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 12 — the R-D5 natural-chain LEDGER (measured; the frozen controls MUST NOT move at T2; after T2 every settlement is checked against the D5 receipt facts)', () => {
  it.each(Object.keys(LEDGER_SEEDS) as LedgerSeed[])('%s: chain digests, row counts, churn rosters empty under D1, zero exposed rows through 416; the nine frozen drop templates only', async (seed) => {
    const rel = await relationships()
    const control = LEDGER_SEEDS[seed]
    const { state, rows } = runLedger(seed, rel)
    expect(state.market.tick).toBe(LEDGER_END_WEEK)
    expect(rows).toHaveLength(control.rows)
    expect(rows.filter((r) => r.kind === 'settled')).toHaveLength(control.settled)
    expect(rows.filter((r) => r.kind === 'declined')).toHaveLength(control.declined)
    expect(rows.filter((r) => r.kind === 'expired')).toHaveLength(control.expired)
    expect(rows.every((r) => r.churn)).toBe(true) // every settlement on these seeds sits at a synchronized churn (208 / 416)
    // 647-B D1 measured: at 208 every survivor's roster under the predicate is EMPTY; at 416 only r01's supply-265 replacement rows survive, sharing no take.
    for (const r of rows.filter((x) => x.week === 208)) expect(r.survivors.every((s) => s.roster.length === 0)).toBe(true)
    for (const r of rows.filter((x) => x.week === 416)) {
      for (const s of r.survivors) {
        expect(s.roster.every((p) => /-supply-265-\d$/.test(p))).toBe(true)
        expect(s.sharedTakeCounterparts).toEqual([])
      }
    }
    expect(rows.filter((r) => r.exposed)).toEqual([]) // NOT EXPOSED: no survivor holds a roster member who shares a take with the subject
    expect(rows.flatMap((r) => r.newSentences)).toEqual([]) // no D5 sentence can lawfully appear where no close tie can exist
    if (rel !== null) expect(rows.every((r) => r.survivors.every((s) => s.band === 1))).toBe(true)
    // the frozen controls (CANNOT-MOVE class until a first moved settlement, of which this window has none)
    expect(settlementDigest(state)).toBe(control.settlement)
    expect(sha(JSON.stringify(state.talentMarket.receipts))).toBe(control.receipts)
    expect(sha(JSON.stringify(state.hollywood!.employment))).toBe(control.employment)
    expect(sha(JSON.stringify(state.firstTakes))).toBe(control.takes)
    expect(state.rngState).toBe(control.rng)
    if (rel !== null) expect(edges(state).every((e) => e.recent.length <= 8 && e.sharedSuccesses + e.sharedFailures <= e.sharedProductions)).toBe(true)
  }, 300_000)

  it('the MOST EXPOSED shared fixture, poachingFixture (p14b2-fixtures.ts :145-211; consumers bridge-p14b2-trust, p14b2-fixture-preconditions): the week-208 reasons pin and endedWeek 208 hold, and under D1 no survivor holds a shared-take counterpart', async () => {
    const rel = await relationships()
    const { bound, talentId, incumbentId } = poachingFixture()
    const receipt = bound.talentMarket.receipts.find((r) => r.kind === 'settled' && r.talentId === talentId && r.week === 208)
    assert.ok(receipt)
    expect(receipt.reasons).toEqual(POACHING_REASONS) // :200-201, byte-for-byte
    expect(receipt.studioId).toBe(player(bound))
    expect(bound.hollywood!.employment.some((e) => e.studioId === incumbentId && e.terms.talentId === talentId && e.endedWeek === 208)).toBe(true) // :204
    expect(rosterAt(bound, incumbentId, talentId, 208)).toEqual([]) // the churned incumbent: closed AT W
    const playerRoster = rosterAt(bound, player(bound), talentId, 208)
    expect(playerRoster).toHaveLength(1) // the writer signed at 196 (:171), the one off-cycle row
    expect(bound.talent.find((t) => t.id === playerRoster[0])!.role).toBe('writer')
    expect(playerRoster.filter((p) => sharesTake(bound, talentId, p))).toEqual([]) // no take shared with the subject: D5 `none` for every bidder
    if (rel !== null) {
      for (const issuer of new Set(bound.talentMarket.receipts.filter((r) => r.kind === 'proposalSubmitted' && r.talentId === talentId).map((r) => r.studioId!))) {
        expect(d5Band(rel, bound, talentId, issuer, 208)).toBe(1)
      }
    }
  }, 180_000)
})
