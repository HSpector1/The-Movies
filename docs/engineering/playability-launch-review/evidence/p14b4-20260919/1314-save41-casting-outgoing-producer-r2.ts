// 1314: genuine outgoing Save41 inputs for the casting-driver Save42 increment (1313-A/F), minted at the last Save41
// writer before the writer moves. Route measured by 1314-P. Parent executes once under the bounded recorder and
// guards; no rehearsal, seed search, state surgery or retry. Reads no fixture payload; writes only its own new
// output directory. r2 (1314-B): the shooting guard matches 1314-P exactly; the acknowledged input also asserts no
// edge among the slate actors.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { PROJECTION_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { advanceTo, p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { applyActions } from '../../../../../src/core/actions.ts'
import { hiringMarketIds } from '../../../../../src/core/employment.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { TUNING } from '../../../../../src/core/tuning.ts'
import type { CastingSlate, CastSlot, GameState } from '../../../../../src/core/types.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV41 } from '../../../../../src/core/save.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const OUTPUT = 'tests/fixtures/p14/genuine-v41-pre-casting-drivers'
const SEED = 'r1314-casting-01'
const STAGE = 'facility-soundstage-07'

type Route = { acknowledged: GameState; released: GameState; slate: CastingSlate; cast: Record<CastSlot, string>;
  sessionId: string; projectId: string; productionId: string }

// The 1314-P route: public actions and natural ticks only.
function route(): Route {
  let s = p13aGeneratedStudio(SEED)
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter(id => s.talent.find(t => t.id === id)?.role === role)
  const [writer] = byRole('writer'), [director] = byRole('director'), [craft] = byRole('craft')
  const actors = byRole('actor')
  assert.ok(writer && director && craft && actors.length >= 3, 'route premise: the week-0 market holds a writer, director, craft and three actors')
  for (const id of [writer, director, craft, ...actors.slice(0, 3)]) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  const mounted = s.sets.find(x => x.mountedOn === STAGE && x.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  s = advanceTo(s, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  const concept = s.concepts[0]!
  s = applyActions(s, [{ kind: 'commissionScript', project: { conceptId: concept.id, writerId: writer,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } } } }])
  const projectId = s.scriptDevelopment.projects.at(-1)!.id
  for (let n = 0; s.scriptDevelopment.projects.find(p => p.id === projectId)!.status !== 'review'; n++) {
    assert.ok(n < 20, 'route premise: the screenplay reaches review'); s = tick(s)
  }
  s = applyActions(s, [{ kind: 'acceptScript', projectId }])
  const [a, b, c] = actors as [string, string, string]
  const slate: CastingSlate = { lead: [a, b], antagonist: [b, c], support: [c, a] }
  s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
  const sessionId = s.castingSessions.sessions.find(x => x.projectId === projectId)!.id
  for (let n = 0; s.castingSessions.sessions.find(x => x.id === sessionId)!.status !== 'review'; n++) {
    assert.ok(n < 20, 'route premise: the auditions reach review'); s = tick(s)
  }
  s = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
  const acknowledged = s
  const cast: Record<CastSlot, string> = { lead: a, antagonist: b, support: c }
  s = applyActions(s, [{ kind: 'greenlightScriptProject', production: { projectId, directorId: director, craftIds: [craft], cast,
    budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  const flow = () => s.operations.workflows.find(w => w.productionId === productionId)
  for (let n = 0; s.studio.activeProductions.some(p => p.id === productionId); n++) {
    assert.ok(n < 40, 'route premise: the picture releases within 40 weeks of greenlight')
    const remaining = s.studio.activeProductions.find(p => p.id === productionId)!.remainingTicks
    if (remaining <= 5 && flow()?.phase !== undefined && flow()?.shootingTask?.status !== 'scheduled' && !s.firstTakes.some(t => t.productionId === productionId))
      s = applyActions(s, [{ kind: 'assignShootingDirector', productionId, directorId: director }, { kind: 'scheduleShootingTake', productionId }])
    if (flow()?.phase === 'releaseReady') s = applyActions(s, [{ kind: 'commitPictureToRelease', productionId }])
    s = tick(s)
  }
  return { acknowledged, released: s, slate, cast, sessionId, projectId, productionId }
}

const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })

assert.equal(LIVE_SAVE_VERSION, 41, 'this producer is only valid while the live writer is Save41')
const head = process.env.P14_SAVE41_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P14_SAVE41_PRODUCER_HEAD must name the published execution HEAD')
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head, 'HEAD differs from P14_SAVE41_PRODUCER_HEAD')
assert.ok(!existsSync(resolve(ROOT, OUTPUT)), `refusing to overwrite ${OUTPUT}`)

const started = Date.now()
const r = route()
const routeText = `p13aGeneratedStudio('${SEED}'); sign week-0 market writer, director, craft, first three actors (208 weeks); ` +
  `strike any set on ${STAGE}, commission set-grand-ballroom there, advanceTo(SET_BUILD_WEEKS_BAND_HIGH); activateScriptDevelopment, ` +
  'activateCastingSessions; commissionScript concept 0; tick to review; acceptScript; startCastingSession lead[a,b] antagonist[b,c] ' +
  'support[c,a]; tick to review; acknowledgeCastingSession'
const INPUTS = [
  { name: 'genuine-v41-casting-acknowledged', state: r.acknowledged, route: `${routeText} (saved here, before greenlight)` },
  { name: 'genuine-v41-casting-released', state: r.released, route: `${routeText}; greenlightScriptProject cast lead a, antagonist b, ` +
    'support c; assignShootingDirector + scheduleShootingTake at remainingTicks 5; commitPictureToRelease at releaseReady; tick until released' },
] as const
mkdirSync(resolve(ROOT, OUTPUT), { recursive: false })
const rows = []
for (const input of INPUTS) {
  const state = input.state
  const raw = exportSave(validateSaveV41(makeSave(state)))
  assert.equal(exportSave(importSave(raw)), raw, 'current writer round trip')
  const gz = gzipSync(Buffer.from(raw, 'utf8'), { level: 9 })
  assert.equal(gunzipSync(gz).toString('utf8'), raw)
  const session = state.castingSessions.sessions.find(x => x.id === r.sessionId)
  const people = [...new Set(Object.values(r.slate).flat())]
  const facts = {
    week: state.market.tick, rivals: state.hollywood?.businesses.length ?? 0, edges: state.relationships.length,
    session: session === undefined ? null : { id: session.id, projectId: session.projectId, status: session.status, slate: session.slate },
    project: state.scriptDevelopment.projects.find(p => p.id === r.projectId)?.status ?? null,
    production: state.studio.releasedFilms.some(f => f.productionId === r.productionId) ? 'released'
      : state.studio.activeProductions.some(p => p.id === r.productionId) ? 'active' : 'none',
    slateEdges: state.relationships.filter(e => people.includes(e.a) && people.includes(e.b))
      .map(e => ({ a: e.a, b: e.b, sharedProductions: e.sharedProductions, kinds: e.recent.map(d => d.kind) })),
  }
  assert.equal(facts.session?.status, 'complete', 'route premise: the casting session is complete')
  assert.ok(facts.edges > 0, 'a Save41 casting input needs real relationship edges')
  if (input.name.endsWith('acknowledged')) assert.ok(facts.project === 'ready' && facts.production === 'none' && facts.slateEdges.length === 0, 'route premise: acknowledged, not greenlit, no slate edge')
  if (input.name.endsWith('released')) assert.ok(facts.production === 'released' && facts.slateEdges.length === 3, 'route premise: released with the three slate pairs sharing work')
  out(`${OUTPUT}/${input.name}.json.gz`, gz)
  const provenance = {
    purpose: 'generated test campaigns only; never Owner saves', record: '1314', plan: ['1313-A', '1313-F'], probe: '1314-P',
    producer: 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1314-save41-casting-outgoing-producer-r2.ts',
    executionHead: head, saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
    route: input.route, cast: r.cast, gzip: id(gz), decoded: id(raw), facts,
  }
  out(`${OUTPUT}/${input.name}.provenance.json`, json(provenance))
  rows.push({ name: input.name, gzip: provenance.gzip, decoded: provenance.decoded, facts })
}
out(`${OUTPUT}/MANIFEST.json`, json({ purpose: 'generated test campaigns only; never Owner saves', record: '1314',
  executionHead: head, saveVersion: 41, elapsedMs: Date.now() - started, inputs: rows }))
console.log(JSON.stringify({ output: OUTPUT, inputs: rows.map(x => ({ name: x.name, gzip: x.gzip, facts: x.facts })) }))
