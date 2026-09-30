// 1358-P: one genuine outgoing Save43 input for the P14B relationship slice B (romance/Rivals/
// Save44) migration leaves, minted at the last Save43 writer before the writer moves. Modeled on
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-P2-save42-week93-producer.ts
// (same safety scaffold: HEAD pin, output-exists guard, gzip+sha256, MANIFEST/provenance JSON), with
// two differences the brief names explicitly: (1) this producer ALSO runs one minimal, real
// player casting-competition cycle before the natural-tick loop, so at least one relationship edge
// carries `sharedCompetitions >= 1` (the r1314-casting-01 seed and route already measured and used
// throughout tests/p14b9-casting-competition.test.ts and tests/p14b10-conflict-evidence.test.ts —
// reused here for the SAME reason those files reuse it: a known-good market for a writer, director,
// craft and three-plus actors at week 0); (2) it then continues NATURAL ticks only (no further
// player intervention) until at least one rival business shows non-empty `screenplayShelving`
// (`rejections.length > 0 || shelved.length > 0`), bounded at a generous ceiling — this is the SAME
// shelving law 1344-P2's own producer measured reaching around week 94 on 1344-P2's seed
// ('p13a-core-causal-01'); this producer uses r1314-casting-01 instead (for the casting-route
// premise) and does NOT assume in advance which week shelving is first reached on THIS seed, so it
// ticks up to the bound rather than a fixed, pre-measured week.
//
// Parent executes once under the bounded recorder and guards; no rehearsal, seed search, state
// surgery or retry (the house rule, 1344-P2's own header, verbatim). If the bounded natural-tick
// loop below never finds a business with non-empty screenplayShelving within CEILING_WEEKS, this
// producer throws loudly (a genuine finding for the parent — a different seed or a higher ceiling,
// never a silently incomplete fixture) rather than degrading the requirement silently. The brief's
// own hedge ("holding at least one edge with sharedCompetitions >= 1 IF ANY natural or scripted
// route reaches one") is honored literally: the casting-competition route below is the SAME
// deterministic, no-RNG, real action route this repo already runs elsewhere on this exact seed, so
// it is expected to succeed, but this producer does not retry or search for an alternative if it
// does not — it reports the market-premise assertion's own thrown message and stops, per the "no
// rehearsal" rule.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { PROJECTION_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { applyActions } from '../../../../../src/core/actions.ts'
import { hiringMarketIds } from '../../../../../src/core/employment.ts'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { TUNING } from '../../../../../src/core/tuning.ts'
import type { CastingSlate, CastSlot, GameState } from '../../../../../src/core/types.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV43 } from '../../../../../src/core/save.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const OUTPUT = 'tests/fixtures/p14/genuine-v43-pre-romance'
const SEED = 'r1314-casting-01' // the known-good casting-route market (1313/1314-era route, reused verbatim)
const CEILING_WEEKS = 400 // generous bound; 1344-P2 measured shelving activity well inside a comparable range on a different seed

const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })

assert.equal(LIVE_SAVE_VERSION, 43, 'this producer is only valid while the live writer is Save43 (before slice B lands)')
const head = process.env.P14_SAVE43_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P14_SAVE43_PRODUCER_HEAD must name the published execution HEAD')
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head, 'HEAD differs from P14_SAVE43_PRODUCER_HEAD')
assert.ok(!existsSync(resolve(ROOT, OUTPUT)), `refusing to overwrite ${OUTPUT}`)

// ── the minimal real casting-competition route (1313-A/F; the SAME route tests/p14b9-casting-
// competition.test.ts and tests/p14b10-conflict-evidence.test.ts already run on this seed) ────────
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }
type Market = { writer: string; director: string; craft: string; actors: readonly string[] }

function deriveMarket(s: GameState): Market {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((tid) => s.talent.find((t) => t.id === tid)?.role === role)
  const writer = byRole('writer')[0], director = byRole('director')[0], craft = byRole('craft')[0], actors = byRole('actor')
  assert.ok(writer && director && craft && actors.length >= 3,
    `route premise failed: seed "${SEED}" week-0 market lacks a writer/director/craft/3 actors — got ${JSON.stringify({ writer, director, craft, actors })}`)
  return { writer, director, craft, actors }
}
function foundStudio(s0: GameState, market: Market): GameState {
  let s = s0
  for (const tid of [market.writer, market.director, market.craft, ...market.actors.slice(0, 3)]) {
    s = applyActions(s, [{ kind: 'signContract', talentId: tid, termWeeks: 208 }])
  }
  const mounted = s.sets.find((x) => x.mountedOn === STAGE && x.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  for (let n = 0; n < TUNING.SET_BUILD_WEEKS_BAND_HIGH; n++) s = tick(s)
  s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  return s
}
function greenlightCycle(input: GameState, market: Market, conceptIndex: number, slate: CastingSlate | null,
  cast: Record<CastSlot, string>, reuseProjectId?: string): { state: GameState; productionId: string; projectId: string } {
  let s = input, projectId = reuseProjectId
  if (projectId === undefined) {
    const concept = s.concepts[conceptIndex]!
    s = applyActions(s, [{ kind: 'commissionScript', project: { conceptId: concept.id, writerId: market.writer, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES } } }])
    projectId = s.scriptDevelopment.projects.at(-1)!.id
    for (let n = 0; s.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error(`route premise failed: project "${projectId}" did not reach review within 30 ticks`)
      s = tick(s)
    }
    s = applyActions(s, [{ kind: 'acceptScript', projectId }])
    if (slate !== null) {
      s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
      const sessionId = s.castingSessions.sessions.find((x) => x.projectId === projectId)!.id
      for (let n = 0; s.castingSessions.sessions.find((x) => x.id === sessionId)!.status !== 'review'; n++) {
        if (n >= 30) throw new Error(`route premise failed: session "${sessionId}" did not reach review within 30 ticks`)
        s = tick(s)
      }
      s = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
    }
  }
  const concept = s.concepts[conceptIndex]!
  s = applyActions(s, [{ kind: 'greenlightScriptProject', production: { projectId, directorId: market.director, craftIds: [market.craft], cast, budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  return { state: s, productionId, projectId }
}
function fundIfNeeded(s: GameState): GameState {
  // The disclosed-cash bootstrap (tests/helpers/p14b2-fixtures.ts `fund()`, re-derived: an equal,
  // disclosed ledger entry — never a silent balance change).
  const target = 30_000_000
  const delta = target - s.studio.cash
  if (delta === 0) return s
  return { ...s, studio: { ...s.studio, cash: target }, ledger: [...s.ledger,
    { week: s.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta, note: '1358-P producer disclosed cash bootstrap' }] }
}
/** One competition (cancel + re-greenlight once, so `sharedCompetitions` reaches 2 for the pair
 * this slate names on its first two contested slots — no RNG anywhere in this route). */
function runCastingCompetitionRoute(s0: GameState, market: Market): GameState {
  const [a, b, c] = market.actors as [string, string, string]
  const slate: CastingSlate = { lead: [a, b], antagonist: [b, c], support: [c, a] }
  let s = fundIfNeeded(s0)
  const g1 = greenlightCycle(s, market, 0, slate, { lead: a, antagonist: b, support: c })
  s = fundIfNeeded(applyActions(g1.state, [{ kind: 'cancel', productionId: g1.productionId }]))
  const g2 = greenlightCycle(s, market, 0, null, { lead: a, antagonist: b, support: c }, g1.projectId)
  s = fundIfNeeded(g2.state)
  const edge = s.relationships.find((e) => [e.a, e.b].includes(a) && [e.a, e.b].includes(b))
  assert.ok(edge && edge.sharedCompetitions >= 1, 'route premise failed: pair (a,b) did not reach sharedCompetitions >= 1')
  return s
}

function rivalHasShelving(state: GameState): boolean {
  return (state.hollywood?.businesses ?? []).some((b) => b.screenplayShelving.rejections.length > 0 || b.screenplayShelving.shelved.length > 0)
}

const started = Date.now()
let state = runCastingCompetitionRoute(p13aGeneratedStudio(SEED), deriveMarket(p13aGeneratedStudio(SEED)))
let foundWeek = -1
for (let week = state.market.tick; week <= CEILING_WEEKS; week++) {
  if (rivalHasShelving(state)) { foundWeek = state.market.tick; break }
  state = tick(state)
}
assert.ok(foundWeek >= 0, `route premise failed: no rival business reached non-empty screenplayShelving by week ${String(CEILING_WEEKS)} on seed "${SEED}"`)

mkdirSync(resolve(ROOT, OUTPUT), { recursive: false })
const name = `genuine-v43-pre-romance-week-${foundWeek}`
const raw = exportSave(validateSaveV43(makeSave(state)))
assert.equal(exportSave(importSave(raw)), raw, 'current writer round trip')
const gz = gzipSync(Buffer.from(raw, 'utf8'), { level: 9 })
assert.equal(gunzipSync(gz).toString('utf8'), raw)

const competitionEdges = state.relationships.filter((e) => e.sharedCompetitions >= 1)
  .map((e) => ({ a: e.a, b: e.b, sharedCompetitions: e.sharedCompetitions }))
const shelvingBusinesses = (state.hollywood?.businesses ?? [])
  .filter((b) => b.screenplayShelving.rejections.length > 0 || b.screenplayShelving.shelved.length > 0)
  .map((b) => ({ studioId: b.studioId, rejections: b.screenplayShelving.rejections.length, shelved: b.screenplayShelving.shelved.length }))
const facts = { week: foundWeek, competitionEdges, shelvingBusinesses, firstTakes: state.firstTakes.length, industryFilms: state.hollywood?.films.length ?? 0 }

out(`${OUTPUT}/${name}.json.gz`, gz)
const provenance = {
  purpose: 'generated test campaigns only; never Owner saves', record: '1358-P', plan: ['1347-A', '1347-F', '1358-C'],
  producer: 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-stage/1358-P-save43-producer.ts',
  executionHead: head, saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
  route: `p13aGeneratedStudio('${SEED}'); one real casting-competition cycle (cancel + re-greenlight once); natural ticks to week ${String(foundWeek)}`,
  gzip: id(gz), decoded: id(raw), facts,
}
out(`${OUTPUT}/${name}.provenance.json`, json(provenance))
out(`${OUTPUT}/MANIFEST.json`, json({ purpose: 'generated test campaigns only; never Owner saves', record: '1358-P',
  executionHead: head, saveVersion: 43, elapsedMs: Date.now() - started, inputs: [{ name, gzip: provenance.gzip, decoded: provenance.decoded, facts }] }))
console.log(JSON.stringify({ output: OUTPUT, name, facts }))
