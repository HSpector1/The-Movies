// 698-T1 (record 697 NEXT / brief 698-T1-b6-red-brief.md; plan T1 "independent test-author RED
// against the accepted predecessor"). P14B.6 RELATIONSHIP READ MODELS — the bridge RED, nine families.
// Authored at HEAD 43817117 on a clean tree. NO production, helper, fixture, generated artifact,
// timeout or existing test is touched by this file. It writes tests only.
//
// ── RED TECHNIQUE ────────────────────────────────────────────────────────────────────────────────
// The B.1/B.5 precedent and the standing memory rule: a MISSING NAMED EXPORT binds `undefined` and
// can pass by accident, so the whole module must be ABSENT and every binding must be CALLED. The
// projector this slice owes lives in a NEW bridge module `bridge/relationships.ts` — the exact
// analogue of the landed `bridge/trust.ts` (687 §(2): "on the BridgeTrustBlock pattern exactly").
// Families 1-7 reach it through `bridgeRelationships()`, a dynamic import whose FIRST assertion in
// every case is that the import resolved. Families 8 and 9 are RED BY VALUE (a version literal, a
// registry count, a fixture identity) and say so in their own titles; nothing there imports an
// absent file, so those cases run today and report a real value.
//
// ── THE MODULE CONTRACT THIS RED PINS (the writer implements exactly this, or returns a change list)
//   bridge/relationships.ts
//     type BridgeRelationshipRow  = { counterpartId, counterpartName, tierLabel, sign, drivers, sharedPictures }
//     type BridgeRelationshipBlock= { line: string; rows: BridgeRelationshipRow[] }
//     type ChemistrySeats         = { directorId, lead, antagonist, support }
//     type BridgeChemistryRow     = { seatA, seatB, talentIdA, talentIdB, tierLabel, sign, drivers, line }
//     relationshipBlockFor(state, talentId, viewerStudioId, week = state.market.tick): BridgeRelationshipBlock
//     castingChemistryRows(state, seats, week = state.market.tick): readonly BridgeChemistryRow[]
//     castingChemistryWarning(state, seats, week = state.market.tick): string | null
//     sharedPictureCount(state, a, b): number
//   DTO carriers (projection 49)
//     BridgePersonProfileSnapshot.collaborators  : BridgeRelationshipBlock   (beside `trust`, people.ts :216)
//     BridgeCastingQuoteSnapshot.chemistry       : BridgeChemistryRow[]      (the confirmation's six seat pairs)
//     BridgeCastingQuoteSnapshot.chemistryWarning: string | null
//   Schema $defs: StudioRelationshipBlock, StudioRelationshipRow, StudioCastingChemistryRow.
//   The board project snapshot is NOT a carrier: a Ready screenplay has `activeSlate: null`, so the
//   six pairs are undefined there. Reported as a scope finding; an in-flight production's slate is a
//   second lawful carrier and is deliberately NOT pinned by this RED.
//
// ── A DERIVED, LOAD-BEARING CONSTRAINT THE BRIEF DOES NOT STATE (finding, delivered as a test) ───
// The landed leak law `tests/bridge-p14b5-relationships.test.ts:404-408` forbids the KEY FORM
// `"relationships":` on every serialized DTO, and it must stay GREEN UNAMENDED. A profile block
// literally keyed `relationships` would therefore turn that landed test RED. The block is keyed
// `collaborators` here for exactly that reason (the schema $def keeps 687's `StudioRelationshipBlock`
// name, which never appears as a DTO key). `BLOCK_KEY` below is the single constant to change if the
// writer prefers another lawful name; every other assertion in this file survives that rename.
//
// ── STAGED INPUTS (every one is named, loud, and validator-admitted through makeSave/validateSaveV31)
//   S1 FORWARD-CONSTRAINT ROOT (family 3). No artifact minted under RELATIONSHIP_FAILURE_DELTA = 4
//      exists anywhere in this repo, and the constant is 5 today, so a `-4` row CANNOT be produced by
//      the real write path at this source. The `-4` row is STAGED onto an edge the real write path
//      minted — which is precisely the resumed-campaign shape 694-C Q2 describes. The `-5` value is
//      the live constant.
//   S2 HOSTILE CASTING EDGE (family 5). Reaching sign −1 on a PLAYER-castable pair needs three shared
//      productions each releasing below the flop threshold (measured below). No fixture in this repo
//      releases a player picture at all: `retentionFixture().outcomes` still holds `prod-0052` active
//      60 ticks later (measured 2026-09-22 at HEAD 43817117). The −1 edge is therefore STAGED and the
//      NATURAL ROUTE IS UNTESTED — reported to the parent as a limit of this RED.
//   S3 Q3 RESUMED-CAMPAIGN SHAPE (family 6). A live world holding player credits with an EMPTY V31
//      root: exactly what `migrateToV31` produces and what `projectRelationshipsPreV31` refuses to
//      flatten. Constructed, not minted; the GENUINE migrated artifact is pinned separately.
// Everything else is built through the engine: `retentionFixture`/`historyFixture` (real signings,
// a real greenlight, a real first take, a real market re-settlement) and the founding-roster
// `managedStudio` casting path. The rival-internal edges of family 2 are ENGINE-BUILT on the
// standard seed, never staged.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'

import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { schemaIdentity } from '../bridge/schema/canonical.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { castingDraftToEngine, castingProjection, castingQuoteSnapshot } from '../bridge/casting.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToV32, validateSaveV30, validateSaveV32 } from '../src/core/save.js'
import { pairChemistry, RELATIONSHIP_TIERS } from '../src/core/relationships.js'
import type { GameState, RelationshipDriver, RelationshipTier } from '../src/core/types.js'
import { historyFixture, player, retentionFixture } from './helpers/p14b2-fixtures.js'
import {
  availableConceptId, availableWriterId, commissionPayload, managedStudio, withCash,
} from './contracts/_contractFixtures.ts'

// ── the block's DTO key (see the derived constraint above) ───────────────────────────────────────
const BLOCK_KEY = 'collaborators'

// ── family 8 frozen literals (R-VERSION class; never derived from the registry) ──────────────────
const OUTGOING_48 = 'sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec'
const OUTGOING_47 = 'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538'
const OUTGOING_46 = 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c'
// P14B.8: the outgoing projection-49 identity, retired by the B.8 bump.
const OUTGOING_49 = 'sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b'
const OUTGOING_PROJECTION = 48
const INCOMING_PROJECTION = 50
// The 36 accepted prior literals as they stand today (tests/bridge-p14b4-runtime47-compatibility.test.ts
// :40-80, exact-count pin at :162). B.6 took this roster to 37 by adding OUTGOING_48;
// B.8 takes it to 38 by adding OUTGOING_49.
const EXPECTED_36_PRIOR_IDS = [
  'sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e', 'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5',
  'sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f', 'sha256:15033cf9ca43be65abcb25fc6f910f9487ac23056090126ec7d3e2353f6ce587',
  'sha256:18de162d1a9da3034378f71cec3d3b3f109ea91df8c1a8d40469924108b36e78', 'sha256:1bad05a95c284e64ceaef54c276f2dd0ccad8ca3ef1b12198068bb61b85198c9',
  'sha256:204a71924bd8c2e8ae9af47591226894b3e42f62457da3cc20ed6b106ede611a', 'sha256:2b339a6a8b3e5add0726b7eaac9ce8746e235d8b6111a6816f890ff56afdffd1',
  'sha256:510f08e4a551827a30e0f3d93bbe09fa5ddadbd39366b4dcfa93530500c7979c', 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',
  'sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d', 'sha256:625377a2804a681da3be209da02850e221ae33ac5f58b727f6395736ad607ad1',
  'sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9', 'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538',
  'sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b', 'sha256:7e3af4db0d3d18cdeaab00082e0034f304a9141f46ea87e9e64e5a99d985483c',
  'sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47', 'sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236',
  'sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85', 'sha256:92317ec179456cdc5bd5cc7c4ca47dd066b768a9e2e45519f1263ef921a211a4',
  'sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211', 'sha256:a481d14f3810ffbafcba2bbf509db7340263f3f0fd665a059507a1567d98923d',
  'sha256:a6f374596e956800f9547ad538fdd859c01bda3460aac8b877279c67686c6f4b', 'sha256:b779faa92227bd1f2e623ad04d0899c87e7ddc60ce43f9ae9c39a7626c20a83d',
  'sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f', 'sha256:be7ed660d04ed9b1056f48e946f86f26c10cab42b950a273d57ad9cba372f5bb',
  'sha256:c6ab1b2f181b7cbbd1b873a276f0be0516a505f258c3c9ad996042e43e096712', 'sha256:c9c07d6febe4afee7f7c27c991acdfa1c86b6c3a7f5dff8528d7fa5ad72e43a1',
  'sha256:c9dad9f3d8bb94445db1a5425d90db3f9894da9354f47a07992ff96261cfc399', 'sha256:d3338cb713385cc23414e6a17293a5900871764f0eeaed19698e17634e74740b',
  'sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99', 'sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48',
  'sha256:ea5d645f34a472f4710b9273b225d6f15433d6d17ae8ed1af3c03686a225c8c4', 'sha256:eb95add0fc06a54d19998c4707dd0b0ba861a22cfee6d8e6631499beeea18e25',
  'sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61', 'sha256:fe9bf4558dc12abc5f258ba8b8f581242e06361cfbae8ae31d8c676f6c7a6460',
] as const
// Companion §2.1.7 :120 — the seven-member public order, and the `line` that reads [0]/[1] only.
const UNPROVEN_ORDER = ['opportunity', 'compensation', 'relationships', 'term', 'trust', 'standing', 'incumbency'] as const
const CURRENT_P1_LINE = 'Prefers terms of 1 year · Weighs the opportunity offered first, then compensation'
const CURRENT_P1 = { gz: 'a13704632d58909b9edc330f2f6d946f3e3fe7bfc1d9d2adb3ab2a430fd540fd', talentId: 't-act-09' } as const
// tests/fixtures/p14/genuine-projection48-runtime/MANIFEST.json (T0, record 697), read independently.
const T0_48 = {
  gz: '7412ec78c1d3265b5e1fa89bc59b0187937121dbd132f0dbd9f923272f156152',
  raw: 'b04c82747dddc4dec3454fc659e4da409b9022320ae00245847237b1746523c8',
  current: '9f26dca8dd9e1b242f2a3e8285f72a17eb100f1fa41a737fc334b6d3e5f6dc8b',
  saved: 'b8e78b47408b2740a01312dff2d98f1a20a756a405bcf530222ddeea3aa77586',
  journal: 'c7e22f654987464a079f898548903a13fe7e2f462395c88a7977719db33659b6',
  sessionId: 'p14b6-genuine-outgoing48', week: 45,
} as const
const PRIOR_47 = { gz: '38275e91d083651f232a2845b1bd8b738ac996c63523c65203c4ca8f72703d11' } as const
const PRIOR_46 = { gz: '3db0599c6e183140b79c83880eb967dde37aecc0d178a85d192283893ea0cc34' } as const
const PRIOR_45 = { gz: '00805fa390cc085a0300984ba094e02e7b1e9e53b0d23e286306d0c82820f9a9' } as const

// ── local instruments (no helper is modified; nothing here is imported by another file) ──────────
const artifact = (path: string) => new URL('./fixtures/p14/' + path, import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const DIGIT = /\d/
type Edge = {
  edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number
  sharedProductions: number; sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  peakTier: RelationshipTier; peakTierWeek: number; recent: RelationshipDriver[]
}
const edges = (state: GameState): readonly Edge[] => (state as unknown as { relationships?: readonly Edge[] }).relationships ?? []
const withRoot = (state: GameState, rows: readonly Edge[]): GameState =>
  ({ ...state, relationships: rows } as unknown as GameState)

/** The ABSENT module, reached dynamically so the RED is module RESOLUTION (B.1/B.5 precedent). */
type Seats = { directorId: string; lead: string; antagonist: string; support: string }
type BlockRow = { counterpartId: string; counterpartName: string; tierLabel: RelationshipTier | null; sign: -1 | 0 | 1; drivers: string[]; sharedPictures: number }
type Block = { line: string; rows: BlockRow[] }
type ChemRow = { seatA: string; seatB: string; talentIdA: string; talentIdB: string; tierLabel: RelationshipTier | null; sign: -1 | 0 | 1; drivers: string[]; line: string }
type BridgeRelationships = {
  relationshipBlockFor: (state: GameState, talentId: string, viewerStudioId: string, week?: number) => Block
  castingChemistryRows: (state: GameState, seats: Seats, week?: number) => readonly ChemRow[]
  castingChemistryWarning: (state: GameState, seats: Seats, week?: number) => string | null
  sharedPictureCount: (state: GameState, a: string, b: string) => number
}
async function bridgeRelationships(): Promise<BridgeRelationships | null> {
  try { return await import('../bridge/relationships.js') as unknown as BridgeRelationships } catch { return null }
}
/** Every family that needs the module states the resolution first; never a spurious pass. */
async function requireModule(): Promise<BridgeRelationships> {
  const mod = await bridgeRelationships()
  assert.ok(mod, 'RED BY RESOLUTION: bridge/relationships.ts does not exist yet')
  for (const name of ['relationshipBlockFor', 'castingChemistryRows', 'castingChemistryWarning', 'sharedPictureCount'] as const) {
    expect(typeof mod[name]).toBe('function')
  }
  return mod
}

const blockOn = (profile: unknown): Block => (profile as Record<string, Block>)[BLOCK_KEY]!
/** The landed roster-at-W predicate, re-expressed from talentMarket.ts :794-801 (subject excluded). */
function rosterAt(state: GameState, studioId: string, subject: string, week: number): Set<string> {
  const roster = new Set<string>()
  for (const row of state.hollywood?.employment ?? []) {
    if (row.studioId !== studioId || row.terms.talentId === subject) continue
    if (row.terms.startWeek < week && (row.endedWeek === null || week < row.endedWeek)) roster.add(row.terms.talentId)
  }
  return roster
}
const SEATS = ['director', 'lead', 'antagonist', 'support'] as const
/** The six pairs in `seatPairs`' OWN SEAT ORDER (relationships.ts :390-403), re-derived here. */
const SEAT_PAIRS: readonly (readonly [(typeof SEATS)[number], (typeof SEATS)[number]])[] = [
  ['director', 'lead'], ['director', 'antagonist'], ['director', 'support'],
  ['lead', 'antagonist'], ['lead', 'support'], ['antagonist', 'support'],
]
/** Shared pictures for a pair, derived from the engine's own facts — never copied from a DTO. */
function sharedPicturesOf(state: GameState, x: string, y: string): number {
  const refs = new Set<string>()
  for (const take of state.firstTakes) {
    const seats = [take.directorId, take.cast.lead, take.cast.antagonist, take.cast.support]
    if (seats.includes(x) && seats.includes(y)) refs.add(take.productionId)
  }
  for (const film of state.studio.releasedFilms) {
    const p = film.participants
    if (p === undefined) continue
    const seats = [p.writer.talentId, p.director.talentId, p.cast.lead.talentId, p.cast.antagonist.talentId, p.cast.support.talentId,
      ...p.craft.map((c) => c.talentId)]
    if (seats.includes(x) && seats.includes(y)) refs.add(film.productionId)
  }
  return refs.size
}
/** The landed leak probes (bridge-p14b5-relationships.test.ts :404-408), extended over the NEW DTOs. */
const LEAK_PROBES = ['"closeness":', '"edgeId":', 'relationship-edge-', '"recent":', '"relationships":', '"lastEventWeek":', '"peakTier":'] as const
function assertNoLeak(label: string, dto: string): void {
  for (const leak of LEAK_PROBES) {
    if (dto.includes(leak)) throw new Error(`${label}: the landed leak law is broken by ${leak}`)
  }
}
function everyBlock(state: GameState): { talentId: string; block: Block }[] {
  return peopleProjection(state).profiles.map((profile) => ({ talentId: profile.talentId, block: blockOn(profile) }))
}
/** A validator-admitted world (the makeSave / validateSaveV31 device of p14b2-fixtures.ts :121). */
function admitted(state: GameState, label: string): GameState {
  const save = makeSave(state)
  expect(save.saveVersion).toBe(LIVE_SAVE_VERSION)
  validateSaveV32(JSON.parse(JSON.stringify(save)))
  expect(label.length).toBeGreaterThan(0)
  return save.state as GameState
}

// ── the engine-built worlds (each built once; nothing is cached across files) ────────────────────
/** W1 — the real player take. Measured at HEAD 43817117: week 61, 30 edges, 24 of them RIVAL-INTERNAL
 *  (`person-studio-aca408ec-r0*`), 6 among the player seats t-dir-01 / t-act-09 / t-act-12 / t-act-13
 *  of `prod-0052`. Every seat is on the player roster at 61 under the predicate. */
const W1_SEATS: Seats = { directorId: 't-dir-01', lead: 't-act-09', antagonist: 't-act-12', support: 't-act-13' }
let w1Cache: GameState | undefined
function w1(): GameState {
  if (w1Cache === undefined) w1Cache = retentionFixture().outcomes as unknown as GameState
  return w1Cache
}
/** W6 — a MANAGED casting board with a Ready screenplay and a legal greenlight draft. `managedStudio`
 *  carries `relationships: []` and `hollywood: null` (measured), so every seat pair is edgeless here
 *  until an edge is staged; that is what makes the "no shared work yet" row provable. */
type CastingWorld = { state: GameState; projectId: string; draft: BridgeCastingDraftPayload; seats: Seats }
let w6Cache: CastingWorld | undefined
function w6(): CastingWorld {
  if (w6Cache !== undefined) return w6Cache
  let state = withCash(managedStudio('p14b6-casting-chemistry'), 50_000_000)
  const conceptId = availableConceptId(state)
  const writerId = availableWriterId(state)
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(state, conceptId, writerId) }])
  const projectId = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  const view = castingProjection(state).board!.projects.find((p) => p.projectId === projectId)!
  const actors = view.leadCandidates.filter((c) => c.available)
  if (actors.length < 3) throw new Error('W6 premise failed: fewer than three available acting candidates')
  const draft: BridgeCastingDraftPayload = {
    kind: 'greenlightPackage', projectId, slateLead: null, slateAntagonist: null, slateSupport: null,
    directorId: view.directorCandidates.find((c) => c.available)!.talentId,
    castLead: actors[0]!.talentId, castAntagonist: actors[1]!.talentId, castSupport: actors[2]!.talentId,
    craftLeadId: view.craftCandidates.find((c) => c.available)!.talentId,
    budgetNegative: view.negativeOptions[0]!.amount, budgetMarketing: view.marketingOptions[0]!.amount,
    signTalentId: null, signTermWeeks: null,
  }
  const seats: Seats = { directorId: draft.directorId!, lead: draft.castLead!, antagonist: draft.castAntagonist!, support: draft.castSupport! }
  expect(edges(state)).toEqual([])
  return w6Cache = { state, projectId, draft, seats }
}
/** One quote for one world, with a FIXED intentId so two worlds are byte-comparable. */
function quoteFor(state: GameState, draft: BridgeCastingDraftPayload) {
  const conversion = castingDraftToEngine(state, draft)
  assert.ok(conversion.ok, `casting draft refused: ${conversion.ok ? '' : conversion.error}`)
  const preflight = conversion.apply(state)
  assert.ok(preflight.ok, `casting preflight refused: ${preflight.ok ? '' : preflight.error}`)
  return castingQuoteSnapshot(state, draft, conversion, preflight.next, 'p14b6-fixed-intent')
}
/** S2 — a STAGED edge between two seats of W6 at a chosen closeness. LOUDLY STAGED (see header). */
function stageEdge(world: CastingWorld, x: string, y: string, closeness: number, tier: RelationshipTier): GameState {
  const week = world.state.market.tick
  const [a, b] = x < y ? [x, y] : [y, x]
  const edge: Edge = {
    edgeId: `relationship-edge-${String(edges(world.state).length)}`, a, b, closeness,
    firstSharedWeek: week, lastEventWeek: week, sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0,
    sharedCancellations: 0, peakTier: tier, peakTierWeek: week,
    recent: [{ kind: 'sharedProduction', week, ref: 'staged-s2-production', delta: 2 }],
  }
  return admitted(withRoot(world.state, [...edges(world.state), edge]), 'S2')
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// FAMILY 0 — THE PREMISES. GREEN TODAY, by construction: nothing here touches the absent module, the
// new DTO key or a projection literal. Its whole job is ATTRIBUTION — every RED below asserts module
// resolution first, so without this family a broken world builder would hide behind the same
// "does not exist yet" message. Each fact is measured on unchanged source at HEAD 43817117.
// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 0 — PREMISES of the engine-built worlds (GREEN control; measured 2026-09-22 at HEAD 43817117)', () => {
  it('W1: the real player take at week 61 mints six player edges beside 24 RIVAL-INTERNAL ones on the standard seed', () => {
    const state = w1()
    expect(state.market.tick).toBe(61)
    const viewer = player(state)
    expect(viewer).toBe('studio-aca408ec-player')
    const roster = rosterAt(state, viewer, '', 61)
    for (const id of Object.values(W1_SEATS)) expect(roster.has(id)).toBe(true)
    expect(edges(state)).toHaveLength(30)
    const rivalInternal = edges(state).filter((e) => !roster.has(e.a) && !roster.has(e.b))
    expect(rivalInternal).toHaveLength(24) // records 679/682: nearly every edge on a standard seed
    const playerEdges = edges(state).filter((e) => roster.has(e.a) && roster.has(e.b))
    expect(playerEdges).toHaveLength(6)    // the six seatPairs of prod-0052
    expect(state.firstTakes.some((t) => t.productionId === 'prod-0052' && t.directorId === W1_SEATS.directorId)).toBe(true)
    expect(sharedPicturesOf(state, W1_SEATS.directorId, W1_SEATS.lead)).toBe(1)
    // the disclosure premise: all six player pairs are visible, all 24 rival pairs are not
    expect(playerEdges.map((e) => pairChemistry(state, e.a, e.b, 61).sign).sort()).toEqual([0, 0, 0, 0, 1, 1])
    // the carrier this slice hangs the block beside (people.ts :216) exists and is populated; the
    // block key itself is deliberately NOT asserted absent here, so this premise stays true after
    // the writer lands (measured absent at HEAD 43817117; `Object.keys` held 30 members, no `collaborators`)
    expect(Object.keys(peopleProjection(state).profiles[0]!)).toContain('trust')
  }, 300_000)

  it('W2: the market re-settlement puts BOTH predicate boundaries on week 104 with the week-61 edge standing', () => {
    const h = historyFixture()
    const at104 = h.second as unknown as GameState
    expect((h.open as unknown as GameState).market.tick).toBe(96)
    expect(at104.market.tick).toBe(104)
    const rows = at104.hollywood!.employment.filter((e) => e.studioId === player(at104) && e.terms.talentId === W1_SEATS.lead)
    expect(rows.map((e) => [e.terms.startWeek, e.endedWeek])).toEqual([[0, 52], [52, 104], [104, null]])
    expect(rosterAt(at104, player(at104), W1_SEATS.directorId, 96).has(W1_SEATS.lead)).toBe(true)
    expect(rosterAt(at104, player(at104), W1_SEATS.directorId, 104).has(W1_SEATS.lead)).toBe(false)
    expect(rosterAt(at104, player(at104), W1_SEATS.directorId, 105).has(W1_SEATS.lead)).toBe(true)
    expect(edges(at104).some((e) => e.a === W1_SEATS.lead && e.b === W1_SEATS.directorId && e.firstSharedWeek === 61)).toBe(true)
  }, 300_000)

  it('W6: the managed casting board offers a legal greenlight draft whose six seat pairs are all EDGELESS', () => {
    const world = w6()
    expect(world.state.castingSessions.mode).toBe('managed')
    expect(edges(world.state)).toEqual([])
    expect(new Set(Object.values(world.seats)).size).toBe(4)
    for (const [a, b] of SEAT_PAIRS) {
      const x = world.seats[a === 'director' ? 'directorId' : a]
      const y = world.seats[b === 'director' ? 'directorId' : b]
      expect(pairChemistry(world.state, x, y, world.state.market.tick)).toEqual({ tier: null, sign: 0, reasons: [] })
    }
    // the quote seam answers a legal greenlight draft (measured at HEAD 43817117: 31 keys, no
    // `chemistry` and no `chemistryWarning` among them — the carrier this slice adds)
    const quote = quoteFor(world.state, world.draft)
    expect(quote.kind).toBe('greenlightPicture')
    expect(quote.affordable).toBe(true)
  }, 300_000)

  it('S1/S2/S3 staged roots are VALIDATOR-ADMITTED, and Strained really is sign −1 under the live constants', () => {
    const world = w6()
    const hostile = stageEdge(world, world.seats.lead, world.seats.antagonist, 42, 'Strained')
    expect(pairChemistry(hostile, world.seats.lead, world.seats.antagonist, hostile.market.tick).sign).toBe(-1)
    const neutral = stageEdge(world, world.seats.lead, world.seats.antagonist, 50, 'Acquaintances')
    expect(pairChemistry(neutral, world.seats.lead, world.seats.antagonist, neutral.market.tick).sign).toBe(0)
    const resumed = admitted(withRoot(w1(), []), 'S3')
    expect(edges(resumed)).toEqual([])
    expect(sharedPicturesOf(resumed, W1_SEATS.directorId, W1_SEATS.lead)).toBe(1)
    // S1: the resumed-campaign root really does carry BOTH magnitudes for one event class
    const base = w1()
    const week = base.market.tick
    const target = edges(base).find((e) => [e.a, e.b].includes(W1_SEATS.lead) && [e.a, e.b].includes(W1_SEATS.directorId))!
    const staged = admitted(withRoot(base, edges(base).map((e) => e.edgeId === target.edgeId
      ? { ...e, closeness: 47, sharedProductions: 3, sharedFailures: 2, recent: [...e.recent,
        { kind: 'sharedFailure' as const, week, ref: 'staged-s1-4', delta: -4 },
        { kind: 'sharedFailure' as const, week, ref: 'staged-s1-5', delta: -5 }] }
      : e)), 'S1')
    expect(edges(staged).find((e) => e.edgeId === target.edgeId)!.recent.filter((d) => d.kind === 'sharedFailure').map((d) => d.delta)).toEqual([-4, -5])
    expect(pairChemistry(staged, W1_SEATS.lead, W1_SEATS.directorId, week).reasons.every((r) => !DIGIT.test(r))).toBe(true)
  }, 300_000)

  it('the landed leak law at bridge-p14b5-relationships.test.ts:404-408 is GREEN on unchanged source, so every RED below is attributable to B.6', () => {
    for (const state of [w1(), w6().state]) {
      assertNoLeak('family 0 people', JSON.stringify(peopleProjection(state)))
      assertNoLeak('family 0 casting', JSON.stringify(castingProjection(state)))
    }
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 1 — the PROFILE BLOCK (RED BY RESOLUTION: bridge/relationships.ts is absent)', () => {
  it('a block hangs beside `trust` on EVERY profile, with deterministic rows, ladder labels and a sign that agrees with pairChemistry', async () => {
    const mod = await requireModule()
    const state = w1()
    const week = state.market.tick
    const viewer = player(state)
    const projection = peopleProjection(state)
    expect(projection.profiles.length).toBeGreaterThan(0)
    for (const profile of projection.profiles) {
      const block = blockOn(profile)
      assert.ok(block, `no ${BLOCK_KEY} block on ${profile.talentId}`)
      // PRESENT on every profile — empty rows, never an absent block.
      expect(Array.isArray(block.rows)).toBe(true)
      expect(typeof block.line).toBe('string')
      expect(block.line.length).toBeGreaterThan(0)
      // Deterministic, not Map/insertion dependent.
      expect(block.rows.map((r) => r.counterpartId)).toEqual([...block.rows.map((r) => r.counterpartId)].sort())
      for (const row of block.rows) {
        expect(Object.keys(row).sort()).toEqual(['counterpartId', 'counterpartName', 'drivers', 'sharedPictures', 'sign', 'tierLabel'])
        // `tierLabel` is the ladder label, NEVER a number; null only where no edge exists.
        expect(typeof row.tierLabel === 'string' || row.tierLabel === null).toBe(true)
        if (row.tierLabel !== null) expect(RELATIONSHIP_TIERS).toContain(row.tierLabel)
        expect([-1, 0, 1]).toContain(row.sign)
        expect(row.sign).toBe(pairChemistry(state, profile.talentId, row.counterpartId, week).sign)
        expect(row.counterpartName).toBe(state.talent.find((t) => t.id === row.counterpartId)!.name)
        expect(Number.isSafeInteger(row.sharedPictures)).toBe(true)
      }
      // The projector answers the same block the DTO carries (the trust.ts seam, people.ts :216).
      expect(mod.relationshipBlockFor(state, profile.talentId, viewer, week)).toEqual(block)
    }
    // Purity: a second projection is deep-equal.
    expect(peopleProjection(state).profiles.map((p) => blockOn(p))).toEqual(projection.profiles.map((p) => blockOn(p)))
  }, 180_000)

  it('the block parses against its own schema $def, and the profile still parses whole', async () => {
    await requireModule()
    const state = w1()
    const defs = BRIDGE_SCHEMA.$defs as unknown as Record<string, unknown>
    assert.ok(defs['StudioRelationshipBlock'], 'RED BY VALUE: $defs.StudioRelationshipBlock is absent')
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === W1_SEATS.lead)!
    const block = blockOn(profile)
    expect(parseWireValue(defs['StudioRelationshipBlock'] as never, block)).toEqual(block)
    expect(parseWireValue(defs['StudioPersonProfileSnapshot'] as never, profile)).toEqual(profile)
  }, 180_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 2 — DISCLOSURE, the family that matters most (RED BY RESOLUTION)', () => {
  it('every boundary the roster-at-W predicate has, on ONE engine-built world: committed AT W is OFF, closed AT W is OFF, spanning W is ON', async () => {
    const mod = await requireModule()
    // The engine's own re-settlement gives the exact boundary: t-act-09's first player row ends at 104
    // and the row the market settles starts at 104, while the t-dir-01 edge (firstSharedWeek 61) stands.
    const h = historyFixture()
    const at96 = h.open as unknown as GameState
    const at104 = h.second as unknown as GameState
    const at105 = tick(at104)
    const subject = W1_SEATS.directorId
    const counterpart = W1_SEATS.lead
    expect(at96.market.tick).toBe(96)
    expect(at104.market.tick).toBe(104)
    expect(at105.market.tick).toBe(105)
    // PREMISES, read from the engine's own rows (never assumed).
    const rows = (at104.hollywood!.employment).filter((e) => e.terms.talentId === counterpart && e.studioId === player(at104))
    expect(rows.some((e) => e.endedWeek === 104)).toBe(true)      // closed AT W
    expect(rows.some((e) => e.terms.startWeek === 104)).toBe(true) // committed AT W
    expect(edges(at104).some((e) => (e.a === subject || e.b === subject) && (e.a === counterpart || e.b === counterpart))).toBe(true)
    const disclosed = (state: GameState, week: number): string[] =>
      mod.relationshipBlockFor(state, subject, player(state), week).rows.map((r) => r.counterpartId)
    // spanning W -> ON; both boundaries coincide at 104 and each is independently strict:
    // `startWeek <= W` would keep the new row live, `W <= endedWeek` would keep the old one live, and
    // either mistake turns 104 back ON while 96/105 are unchanged.
    expect(disclosed(at96, 96)).toContain(counterpart)
    expect(disclosed(at104, 104)).not.toContain(counterpart)
    expect(disclosed(at105, 105)).toContain(counterpart)
    // the same three answers on the DTO the client actually reads
    expect(blockOn(peopleProjection(at96).profiles.find((p) => p.talentId === subject)!).rows.map((r) => r.counterpartId)).toContain(counterpart)
    expect(blockOn(peopleProjection(at104).profiles.find((p) => p.talentId === subject)!).rows.map((r) => r.counterpartId)).not.toContain(counterpart)
    expect(blockOn(peopleProjection(at105).profiles.find((p) => p.talentId === subject)!).rows.map((r) => r.counterpartId)).toContain(counterpart)
  }, 300_000)

  it('a second, independent closed-AT-W case: releasing a seated person removes the tie in the SAME week', async () => {
    await requireModule()
    const before = w1()
    const week = before.market.tick
    const subject = W1_SEATS.directorId
    const dropped = W1_SEATS.support
    expect(blockOn(peopleProjection(before).profiles.find((p) => p.talentId === subject)!).rows.map((r) => r.counterpartId)).toContain(dropped)
    const after = applyActions(before, [{ kind: 'releaseTalent', talentId: dropped }])
    expect(after.market.tick).toBe(week)
    expect(after.hollywood!.employment.some((e) => e.terms.talentId === dropped && e.endedWeek === week)).toBe(true)
    expect(edges(after).some((e) => (e.a === dropped || e.b === dropped) && (e.a === subject || e.b === subject))).toBe(true)
    expect(blockOn(peopleProjection(after).profiles.find((p) => p.talentId === subject)!).rows.map((r) => r.counterpartId)).not.toContain(dropped)
  }, 300_000)

  it('a RIVAL-INTERNAL pair appears on NO DTO anywhere, on a world the ENGINE built from a standard seed where such edges demonstrably exist', async () => {
    await requireModule()
    const state = w1()
    const week = state.market.tick
    const viewer = player(state)
    const roster = rosterAt(state, viewer, '', week)
    // PREMISE (records 679/682): the standard seed really does hold rival-internal edges here.
    const rivalInternal = edges(state).filter((e) => !roster.has(e.a) && !roster.has(e.b))
    expect(rivalInternal.length).toBeGreaterThan(0)
    const forbidden = new Set(rivalInternal.map((e) => `${e.a}\u0000${e.b}`))
    // Every disclosed row, on every profile, names a counterpart the player can see in their own right.
    let published = 0
    for (const { talentId, block } of everyBlock(state)) {
      for (const row of block.rows) {
        published += 1
        const pair = talentId < row.counterpartId ? `${talentId}\u0000${row.counterpartId}` : `${row.counterpartId}\u0000${talentId}`
        expect(forbidden.has(pair)).toBe(false)
        expect(rosterAt(state, viewer, talentId, week).has(row.counterpartId)).toBe(true)
      }
    }
    // COMPLETENESS and NARROWNESS together: a row exists exactly for a disclosed counterpart that has
    // an edge OR a shared picture — nothing less (no silent drop) and nothing more (no roster noise).
    const expected: string[] = []
    for (const person of state.talent) {
      for (const other of rosterAt(state, viewer, person.id, week)) {
        const hasEdge = edges(state).some((e) => (e.a === person.id && e.b === other) || (e.b === person.id && e.a === other))
        if (hasEdge || sharedPicturesOf(state, person.id, other) > 0) expected.push(`${person.id}\u0000${other}`)
      }
    }
    const actual: string[] = []
    for (const { talentId, block } of everyBlock(state)) for (const row of block.rows) actual.push(`${talentId}\u0000${row.counterpartId}`)
    expect(actual.slice().sort()).toEqual(expected.slice().sort())
    expect(published).toBe(expected.length)
    // and the whole people DTO still passes the landed leak probes with the new block on it
    assertNoLeak('family 2 people DTO', JSON.stringify(peopleProjection(state)))
  }, 300_000)

  it('when undisclosed ties exist the block carries an HONEST line with no count and no identity (the presence.withheld precedent, people.ts :351-356)', async () => {
    await requireModule()
    const state = w1()
    const week = state.market.tick
    const roster = rosterAt(state, player(state), '', week)
    // A person whose every tie is rival-internal: nothing is disclosable on their own profile either.
    const hidden = edges(state).find((e) => !roster.has(e.a) && !roster.has(e.b))!.a
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === hidden)!
    const block = blockOn(profile)
    expect(block.rows).toEqual([])
    expect(block.line.length).toBeGreaterThan(0)
    expect(block.line).not.toMatch(DIGIT)                       // NO count
    for (const person of state.talent) {
      expect(block.line).not.toContain(person.id)               // NO identity
      if (person.id !== hidden) expect(block.line).not.toContain(person.name)
    }
    // and the honest line is NOT the same sentence a person with genuinely nothing to show gets,
    // or "withheld" would be indistinguishable from "nothing happened".
    const quiet = peopleProjection(state).profiles.find((p) => blockOn(p).rows.length === 0
      && !edges(state).some((e) => e.a === p.talentId || e.b === p.talentId))
    assert.ok(quiet, 'premise: a person with no edge at all exists on this world')
    expect(block.line).not.toBe(blockOn(quiet).line)
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 3 — DRIVERS TEXT and the 694-C Q2 FORWARD CONSTRAINT (RED BY RESOLUTION)', () => {
  it('no driver string on any published block carries a digit, on every world this file builds', async () => {
    await requireModule()
    for (const [label, state] of [['W1 player take', w1()], ['W2 boundary', historyFixture().second as unknown as GameState]] as const) {
      let seen = 0
      for (const { block } of everyBlock(state)) {
        for (const row of block.rows) {
          for (const driver of row.drivers) {
            seen += 1
            expect(driver, `${label}: driver copy carries a digit`).not.toMatch(DIGIT)
          }
        }
      }
      expect(seen, `${label}: no driver copy was published at all`).toBeGreaterThan(0)
    }
  }, 300_000)

  it('S1 STAGED: one edge holding BOTH a -4 and a -5 sharedFailure renders text IDENTICAL to an edge holding only the -5', async () => {
    await requireModule()
    const base = w1()
    const week = base.market.tick
    // The two real player edges the write path minted, both re-stamped with failure history.
    const pick = (x: string, y: string): Edge => {
      const [a, b] = x < y ? [x, y] : [y, x]
      const edge = edges(base).find((e) => e.a === a && e.b === b)
      assert.ok(edge, `premise: the real write path minted no edge for ${a}/${b}`)
      return edge
    }
    const both = pick(W1_SEATS.lead, W1_SEATS.directorId)
    const only = pick(W1_SEATS.lead, W1_SEATS.antagonist)
    const fail = (delta: number): RelationshipDriver => ({ kind: 'sharedFailure', week, ref: `staged-s1-${String(-delta)}`, delta })
    // A RESUMED campaign: the -4 row was written by a binary whose RELATIONSHIP_FAILURE_DELTA was 4.
    // Both edges land in the SAME band, so only the era of the stored delta differs.
    const staged = admitted(withRoot(base, edges(base).map((e) => {
      if (e.edgeId === both.edgeId) return { ...e, closeness: 47, sharedProductions: 3, sharedFailures: 2, recent: [...e.recent, fail(-4), fail(-5)] }
      if (e.edgeId === only.edgeId) return { ...e, closeness: 51, sharedProductions: 2, sharedFailures: 1, recent: [...e.recent, fail(-5)] }
      return e
    })), 'S1')
    const rowsFor = (subject: string, counterpart: string): BlockRow => {
      const row = blockOn(peopleProjection(staged).profiles.find((p) => p.talentId === subject)!).rows.find((r) => r.counterpartId === counterpart)
      assert.ok(row, `S1: no published row for ${subject}/${counterpart}`)
      return row
    }
    const bothRow = rowsFor(W1_SEATS.lead, W1_SEATS.directorId)
    const onlyRow = rowsFor(W1_SEATS.lead, W1_SEATS.antagonist)
    // The premise the constraint is about: two DIFFERENT stored magnitudes for ONE event class.
    expect(edges(staged).find((e) => e.edgeId === both.edgeId)!.recent.filter((d) => d.kind === 'sharedFailure').map((d) => d.delta)).toEqual([-4, -5])
    // Nothing renders a delta as a magnitude: the copy is identical, and so is the tier.
    expect(bothRow.drivers).toEqual(onlyRow.drivers)
    expect(bothRow.tierLabel).toBe(onlyRow.tierLabel)
    expect(bothRow.sign).toBe(onlyRow.sign)
    for (const driver of [...bothRow.drivers, ...onlyRow.drivers]) expect(driver).not.toMatch(DIGIT)
    // and no magnitude reaches any DTO in any form
    const dto = JSON.stringify({ people: peopleProjection(staged), market: marketPage(staged, { view: 'market', targetId: W1_SEATS.lead }) })
    assertNoLeak('family 3 staged DTO', dto)
    expect(dto).not.toContain('"delta"')
    expect(dto).not.toContain('sharedFailure')
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 4 — CASTING CHEMISTRY ROWS (RED BY RESOLUTION)', () => {
  it('the six seatPairs, in seat order, on a real greenlight draft — a pair with no edge reads as no-shared-work, never as a neutral score', async () => {
    const mod = await requireModule()
    const world = w6()
    const rows = mod.castingChemistryRows(world.state, world.seats)
    expect(rows.map((r) => [r.seatA, r.seatB])).toEqual(SEAT_PAIRS.map(([a, b]) => [a, b]))
    for (const row of rows) {
      expect(row.talentIdA).toBe(world.seats[row.seatA === 'director' ? 'directorId' : row.seatA as 'lead' | 'antagonist' | 'support'])
      expect(row.talentIdB).toBe(world.seats[row.seatB === 'director' ? 'directorId' : row.seatB as 'lead' | 'antagonist' | 'support'])
      // NO EDGE on this world (premise asserted in w6): no tier, no neutral score, an honest line.
      expect(row.tierLabel).toBeNull()
      expect(row.drivers).toEqual([])
      expect(row.line.length).toBeGreaterThan(0)
      expect(row.line).not.toMatch(DIGIT)
      for (const tier of RELATIONSHIP_TIERS) expect(row.line).not.toContain(tier)
    }
    // S2 STAGED — a genuinely NEUTRAL edge (Acquaintances) must not read like the no-edge row.
    const neutral = stageEdge(world, world.seats.lead, world.seats.antagonist, 50, 'Acquaintances')
    const neutralRows = mod.castingChemistryRows(neutral, world.seats)
    const pair = neutralRows.find((r) => r.seatA === 'lead' && r.seatB === 'antagonist')!
    expect(pair.tierLabel).toBe('Acquaintances')
    expect(pair.sign).toBe(0)
    expect(pair.line).not.toBe(rows.find((r) => r.seatA === 'lead' && r.seatB === 'antagonist')!.line)
    expect(pair.line).not.toMatch(DIGIT)
    // The rows reach the CONFIRMATION DTO — the quote, which is the only casting surface that holds
    // the proposed seating. (SCOPE FINDING: `castingProjection`'s board project carries NO seating
    // until a session exists — `activeSlate` is null for a Ready screenplay — so the six pairs are
    // undefined there. The quote is the carrier; an in-flight production's `activeSlate` is the
    // second carrier and is NOT exercised by this RED.)
    const quote = quoteFor(neutral, world.draft) as unknown as { chemistry?: ChemRow[] }
    assert.ok(quote.chemistry, 'RED BY VALUE: the casting quote carries no `chemistry` rows')
    expect(quote.chemistry.map((r) => [r.seatA, r.seatB])).toEqual(SEAT_PAIRS.map(([a, b]) => [a, b]))
    expect(quote.chemistry).toEqual(neutralRows)
    assertNoLeak('family 4 casting DTO', JSON.stringify({ board: castingProjection(neutral), quote }))
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 5 — the CASTING WARNING, Owner ruling 3 (iii) (RED BY RESOLUTION; the −1 edge is S2 STAGED)', () => {
  it('exactly one sentence when a seated pair reads −1, none otherwise, and the quote bytes are otherwise identical', async () => {
    const mod = await requireModule()
    const world = w6()
    // S2 — LOUDLY STAGED. Strained (closeness 42, band floor 31) is the reachable negative band under
    // RELATIONSHIP_FAILURE_DELTA = 5; no player-castable pair reaches it through the real write path on
    // any fixture in this repo (see the header). The natural route is UNTESTED.
    const hostile = stageEdge(world, world.seats.lead, world.seats.antagonist, 42, 'Strained')
    expect(pairChemistry(hostile, world.seats.lead, world.seats.antagonist, hostile.market.tick).sign).toBe(-1)
    const quiet = world.state
    expect(pairChemistry(quiet, world.seats.lead, world.seats.antagonist, quiet.market.tick).sign).toBe(0)

    expect(mod.castingChemistryWarning(quiet, world.seats)).toBeNull()
    const warning = mod.castingChemistryWarning(hostile, world.seats)
    assert.ok(warning, 'the warning did not fire on a seating holding a −1 pair')
    // ONE sentence, no digit, no person id or name, no tier name.
    expect(warning.trim().split(/(?<=\.)\s+/).filter((s) => s.length > 0)).toHaveLength(1)
    expect(warning.trim().endsWith('.')).toBe(true)
    expect(warning).not.toMatch(DIGIT)
    for (const id of Object.values(world.seats)) {
      expect(warning).not.toContain(id)
      expect(warning).not.toContain(hostile.talent.find((t) => t.id === id)!.name)
    }
    for (const tier of RELATIONSHIP_TIERS) expect(warning).not.toContain(tier)

    // It NEVER refuses, blocks, or changes a quote, a cost or a forecast.
    const quietQuote = quoteFor(quiet, world.draft) as unknown as Record<string, unknown>
    const hostileQuote = quoteFor(hostile, world.draft) as unknown as Record<string, unknown>
    expect(hostileQuote['chemistryWarning']).toBe(warning)
    expect(quietQuote['chemistryWarning']).toBeNull()
    // Byte-identical apart from the two NEW chemistry fields: same cost, same forecast, same intent.
    const strip = (q: Record<string, unknown>) => { const { chemistryWarning: _w, chemistry: _c, ...rest } = q; return rest }
    expect(strip(hostileQuote)).toEqual(strip(quietQuote))
    expect(JSON.stringify(strip(hostileQuote))).toBe(JSON.stringify(strip(quietQuote)))
    for (const money of ['negative', 'marketing', 'freelancerFees', 'totalImmediate', 'cashBefore', 'cashAfter', 'affordable', 'forecastLine']) {
      expect(hostileQuote[money], `the warning moved ${money}`).toEqual(quietQuote[money])
    }
    assertNoLeak('family 5 quote DTO', JSON.stringify(hostileQuote))
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 6 — FACTUAL SHARED-CREDIT COUNTS, Owner ruling 3 (ii) (RED BY RESOLUTION)', () => {
  it('`sharedPictures` equals the count derived from firstTakes and released credits, and is never presented as friendship', async () => {
    const mod = await requireModule()
    const state = w1()
    let checked = 0
    for (const { talentId, block } of everyBlock(state)) {
      for (const row of block.rows) {
        const expected = sharedPicturesOf(state, talentId, row.counterpartId)
        expect(row.sharedPictures).toBe(expected)
        expect(mod.sharedPictureCount(state, talentId, row.counterpartId)).toBe(expected)
        checked += 1
      }
    }
    expect(checked).toBeGreaterThan(0)
    // FACTS, never friendship: the count is its own field, not a driver sentence and not the tier.
    for (const { block } of everyBlock(state)) {
      for (const row of block.rows) for (const driver of row.drivers) expect(driver).not.toMatch(DIGIT)
    }
  }, 300_000)

  it('S3 the Q3 resumed-campaign shape: a world holding player credits with an EMPTY V31 root shows COUNTS and NO tiers', async () => {
    await requireModule()
    const base = w1()
    const resumed = admitted(withRoot(base, []), 'S3')
    expect(edges(resumed)).toEqual([])
    expect(resumed.firstTakes.some((t) => t.directorId === W1_SEATS.directorId)).toBe(true) // credits survive
    const row = blockOn(peopleProjection(resumed).profiles.find((p) => p.talentId === W1_SEATS.directorId)!)
      .rows.find((r) => r.counterpartId === W1_SEATS.lead)
    assert.ok(row, 'a pair with a shared credit and NO edge must still publish its count')
    expect(row.sharedPictures).toBe(sharedPicturesOf(resumed, W1_SEATS.directorId, W1_SEATS.lead))
    expect(row.sharedPictures).toBeGreaterThan(0)
    expect(row.tierLabel).toBeNull()   // nothing is backfilled from an old credit
    expect(row.sign).toBe(0)
    expect(row.drivers).toEqual([])
    // and no tier is published anywhere on this world
    for (const { block } of everyBlock(resumed)) for (const r of block.rows) expect(r.tierLabel).toBeNull()
  }, 300_000)

  it('the GENUINE pre-V31 artifact (projection-47 savedSaveJson through migrateToV32) publishes no tier at all', async () => {
    await requireModule()
    const compressed = readFileSync(artifact('genuine-projection47-runtime/genuine-projection47-runtime.checkpoint.json.gz'))
    expect(sha(compressed)).toBe(PRIOR_47.gz)
    const prior = JSON.parse(gunzipSync(compressed).toString('utf8')) as { savedSaveJson: string }
    const migrated = migrateToV32(importSave(prior.savedSaveJson))
    expect(migrated.saveVersion).toBe(LIVE_SAVE_VERSION)
    const state = migrated.state as unknown as GameState
    expect(edges(state)).toEqual([])
    expect(state.firstTakes.length).toBeGreaterThan(0) // a backfill WOULD have had material here
    for (const { block } of everyBlock(state)) for (const row of block.rows) expect(row.tierLabel).toBeNull()
    assertNoLeak('family 6 migrated DTO', JSON.stringify(peopleProjection(state)))
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 7 — the LEAK LAW over the NEW DTOs (RED BY RESOLUTION; the landed :404-408 test stays GREEN UNAMENDED)', () => {
  it('no root, record, edge id or rendered delta reaches people, casting or market on any world this file builds', async () => {
    await requireModule()
    const worlds: { label: string; dto: string }[] = []
    const w = w1()
    worlds.push({ label: 'W1 people', dto: JSON.stringify(peopleProjection(w)) })
    worlds.push({ label: 'W1 market', dto: JSON.stringify(marketPage(w, { view: 'market', targetId: W1_SEATS.lead })) })
    worlds.push({ label: 'W1 case', dto: JSON.stringify(marketCaseProjection(w, W1_SEATS.lead, player(w))) })
    worlds.push({ label: 'W1 casting', dto: JSON.stringify(castingProjection(w)) })
    const casting = w6()
    worlds.push({ label: 'W6 casting', dto: JSON.stringify(castingProjection(casting.state)) })
    worlds.push({ label: 'W6 people', dto: JSON.stringify(peopleProjection(casting.state)) })
    worlds.push({ label: 'W6 quote', dto: JSON.stringify(quoteFor(casting.state, casting.draft)) })
    for (const { label, dto } of worlds) {
      assertNoLeak(label, dto)
      expect(dto, `${label}: a stored driver delta reached the wire`).not.toContain('"delta"')
      for (const kind of ['sharedProduction', 'repeatedCollaboration', 'sharedSuccess', 'sharedFailure', 'cancelledAfterFirstTake']) {
        expect(dto, `${label}: a stored driver KIND reached the wire`).not.toContain(kind)
      }
    }
  }, 300_000)
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 8 — the WIRE (RED BY VALUE: version literals and a registry count; no absent module is imported here)', () => {
  it('projection 50, schema $id projection-50, LIVE_SAVE_VERSION still 32, and the outgoing 48 identity is retired', () => {
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(INCOMING_PROJECTION)
    expect(OUTGOING_PROJECTION).toBe(48)
    expect(LIVE_SAVE_VERSION).toBe(32) // B.6 has NO save step
    expect(SCHEMA_ID).not.toBe(OUTGOING_48)
    expect(schemaIdentity(BRIDGE_SCHEMA)).toBe(SCHEMA_ID)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-4:projection-${String(INCOMING_PROJECTION)}`)
  })

  it('the outgoing 00c0075b… registers as projection-v48 and the prior roster goes 37 -> 38 in sorted position', () => {
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_48)).toBe('projection-v48')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_47)).toBe('projection-v47')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_46)).toBe('projection-v46')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    expect(EXPECTED_36_PRIOR_IDS).toHaveLength(36)
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_36_PRIOR_IDS, OUTGOING_48, OUTGOING_49].sort())
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size).toBe(38)
  })

  it('the checked-in generator artifacts equal the running identity (`--check` clean), and priorityOrder keeps its seven members and its line', () => {
    const schemaJson = JSON.parse(readFileSync(new URL('../bridge/schema/project-studio-bridge.schema.json', import.meta.url), 'utf8')) as { $id: string; 'x-project-studio': { projectionVersion: number } }
    const manifest = JSON.parse(readFileSync(new URL('../generated/unity/project-studio-bridge.contract-manifest.json', import.meta.url), 'utf8')) as { schemaId: string; projectionVersion: number }
    const csharp = readFileSync(new URL('../generated/unity/StudioBridgeDtos.Generated.cs', import.meta.url), 'utf8')
    expect(schemaJson.$id).toBe(BRIDGE_SCHEMA.$id)
    expect(schemaJson['x-project-studio'].projectionVersion).toBe(INCOMING_PROJECTION)
    expect(manifest).toMatchObject({ schemaId: SCHEMA_ID, projectionVersion: INCOMING_PROJECTION })
    expect(csharp).toContain(`// Schema identity: ${SCHEMA_ID}`)
    // the seven-member public order and its `line` are NOT touched by this slice
    const enumMembers = (BRIDGE_SCHEMA as unknown as { $defs: Record<string, { properties: Record<string, { items: { enum: string[] } }> }> })
      .$defs['StudioMarketPreferencesSnapshot']!.properties['priorityOrder']!.items.enum
    expect([...enumMembers].sort()).toEqual([...UNPROVEN_ORDER].sort())
    const compressed = readFileSync(artifact('genuine-v30-pre-b5/genuine-v30-current-p1.json.gz'))
    expect(sha(compressed)).toBe(CURRENT_P1.gz)
    const state = validateSaveV30(JSON.parse(gunzipSync(compressed).toString('utf8'))).state as GameState
    const block = marketCaseProjection(state, CURRENT_P1.talentId, player(state))
    assert.ok(block, 'premise: no market case for t-act-09 on current-p1')
    expect(block.preferences.priorityOrder).toEqual([...UNPROVEN_ORDER])
    expect(block.preferences.line).toBe(CURRENT_P1_LINE)
  })
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
describe('family 9 — COMPATIBILITY (RED BY VALUE: the T0 fixture identity is the RUNNING identity today)', () => {
  it('the genuine projection-48 checkpoint takes the governed PRIOR path exactly once and both slots land on the live Save (V32, via the governed V31->V32 lift)', () => {
    const compressed = readFileSync(artifact('genuine-projection48-runtime/genuine-projection48-runtime.checkpoint.json.gz'))
    expect(sha(compressed)).toBe(T0_48.gz)
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha(raw)).toBe(T0_48.raw)
    const prior = JSON.parse(raw) as { schemaId: string; protocolVersion: number; sessionId: string; journalDigest: string; currentSaveJson: string; savedSaveJson: string }
    expect(prior).toMatchObject({ protocolVersion: 4, schemaId: OUTGOING_48, sessionId: T0_48.sessionId, journalDigest: T0_48.journal })
    expect(sha(prior.currentSaveJson)).toBe(T0_48.current)
    expect(sha(prior.savedSaveJson)).toBe(T0_48.saved)
    const createSession = vi.fn(() => 'p14b6-prior48-path')
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, createSession)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(createSession).toHaveBeenCalledTimes(1)
    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      const bytes = loaded.hydrated.checkpoint[slot]
      assert.ok(typeof bytes === 'string')
      // 735-T (P14B.7): the 48 slots are genuinely V31, and LIVE_SAVE_VERSION has
      // moved past that to 32, so the runtime checkpoint loader's own live route
      // now takes a REAL governed V31->V32 step here (no longer an identity
      // no-op, the P14B.5-era claim this test made when V31 was still live).
      // The byte-parity claim itself is unweakened: the checkpoint loader's
      // output must still equal the SAME governed migration run directly.
      expect(bytes).toBe(exportSave(migrateToV32(importSave(prior[slot]))))
      const actual = importSave(bytes)
      expect(actual.saveVersion).toBe(LIVE_SAVE_VERSION)
      expect(actual.state.market.tick).toBe(T0_48.week)
    }
    expect(sha(raw)).toBe(T0_48.raw)
  }, 120_000)

  it('the 45 / 46 / 47 fixtures keep migrating exactly as they do today', () => {
    const pins: [string, string][] = [
      ['genuine-projection45-runtime.checkpoint.json.gz', PRIOR_45.gz],
      ['genuine-projection46-runtime/genuine-projection46-runtime.checkpoint.json.gz', PRIOR_46.gz],
      ['genuine-projection47-runtime/genuine-projection47-runtime.checkpoint.json.gz', PRIOR_47.gz],
    ]
    for (const [path, gz] of pins) {
      const compressed = readFileSync(artifact(path))
      expect(sha(compressed), `${path} bytes moved`).toBe(gz)
      const raw = gunzipSync(compressed).toString('utf8')
      const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => `p14b6-prior-${path}`)
      expect(loaded.migratedFromProtocolVersion, `${path} left the governed prior path`).toBe(4)
      for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
        const bytes = loaded.hydrated.checkpoint[slot]
        assert.ok(typeof bytes === 'string')
        expect(importSave(bytes).saveVersion).toBe(LIVE_SAVE_VERSION)
      }
      expect(sha(compressed)).toBe(gz)
    }
  }, 120_000)
})
