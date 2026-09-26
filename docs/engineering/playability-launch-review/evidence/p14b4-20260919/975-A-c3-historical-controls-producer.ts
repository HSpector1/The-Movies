// NEW reproduction using immutable archived outgoing code, not an old capture.
// Parent executes after source/archive freeze. Default prepares only; --write
// creates exactly four gzip payloads + manifest, after every premise succeeds.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import type { Action, GameStateV37 } from '../../../../../src/core/types.ts'
import type { SaveFileV34, SaveFileV35, SaveFileV36, SaveFileV37 } from '../../../../../src/core/save.ts'

const OUTGOING_SOURCE = 'c000479d6e888d3a02f5c2ff534f5dfcbb32af3f'
const PRODUCER = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/975-A-c3-historical-controls-producer.ts'
const OUTPUT = 'tests/fixtures/p14/genuine-pre38-validation-controls'
const repo = fileURLToPath(new URL('../../../../../', import.meta.url))
const flag = process.argv.indexOf('--archive-root')
assert.ok(flag >= 0 && process.argv[flag + 1], 'required --archive-root points to the read-only Git-object archive root')
const archiveRoot = resolve(process.argv[flag + 1]!)
assert.notEqual(archiveRoot, resolve(repo), 'never execute the mutable working production as archived code')
assert.equal(existsSync(join(archiveRoot, 'src/core/save.ts')), true)
assert.equal(existsSync(join(repo, OUTPUT)), false, 'refuse an existing output directory; no cleanup or overwrite')
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const consumed = ['src', 'bridge', 'ui', 'scripts', 'generated', 'tests']
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(),
  patchSha256: sha(git('diff', '--no-ext-diff', '--binary', '--', ...consumed)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...consumed).trim().split('\n').filter(Boolean).sort() })
const sourceBefore = sourceIdentity(), producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
assert.equal(sourceBefore.head, OUTGOING_SOURCE)

// Check actual archive bytes against each Git blob under src before any import.
// This uses immutable object reads, not a checkout/reset/clone or production edit.
function archiveIdentity() {
  const entries = git('ls-tree', '-r', '-z', OUTGOING_SOURCE, '--', 'src').split('\0').filter(Boolean)
  assert.ok(entries.length > 0)
  const rows = entries.map(entry => {
    const match = /^(\d+) blob ([0-9a-f]{40})\t(.+)$/.exec(entry)
    assert.ok(match, `ordinary archived blob required: ${entry}`)
    assert.ok(match[1] === '100644' || match[1] === '100755', 'no symlink source')
    const path = match[3]!, bytes = readFileSync(join(archiveRoot, path))
    const blobId = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    assert.equal(blobId, match[2], `archived source differs from ${OUTGOING_SOURCE}:${path}`)
    return { path, gitBlob: blobId, sha256: sha(bytes) }
  })
  return { sourceSha: OUTGOING_SOURCE, fileCount: rows.length, filesSha256: sha(JSON.stringify(rows)), files: rows }
}
const archiveBefore = archiveIdentity()
// Installed vite-node2.1.9 routes dynamic imports through its SSR request owner.
// /@fs/ keeps these absolute out-of-root TS paths in that transform path, including
// archive paths with spaces; native Node20 must never import untransformed .ts.
const load = (name: string) => import(`/@fs/${join(archiveRoot, `src/core/${name}.ts`)}`)
type State = GameStateV37
type ArchivedSave = { LIVE_SAVE_VERSION: number; makeSave: (state: State) => SaveFileV37;
  validateSaveV34: (input: unknown) => SaveFileV34; validateSaveV35: (input: unknown) => SaveFileV35;
  validateSaveV36: (input: unknown) => SaveFileV36; validateSaveV37: (input: unknown) => SaveFileV37;
  convertV37ToV36: (input: SaveFileV37) => SaveFileV36; convertV36ToV35: (input: SaveFileV36) => SaveFileV35;
  migrateToLive: (input: SaveFileV34) => SaveFileV37; exportSave: (input: unknown) => string; importSave: (raw: string) => unknown }
const save: ArchivedSave = await load('save')
const { applyActions }: { applyActions: (state: State, actions: Action[]) => State } = await load('actions')
const { tick }: { tick: (state: State) => State } = await load('tick')
const { generateWorld }: { generateWorld: (seed: string) => State } = await load('worldgen')
const { initializeHollywood }: { initializeHollywood: (state: State, mode: 'fresh') => State } = await load('hollywood')
const { submitProposal }: { submitProposal: (state: State, draft: { talentId: string; issuerStudioId: string; termWeeks: number; premiumTier: number }) => State } = await load('talentMarket')
const { activeContract }: { activeContract: (state: State, id: string) => State['contracts'][number] | undefined } = await load('employment')
const { retirementRecordFor }: { retirementRecordFor: (state: State, id: string) => State['careerLifecycle']['records'][number] | undefined } = await load('careerLifecycle')
assert.equal(save.LIVE_SAVE_VERSION, 37)

const stages: { name: string; startWeek: number; endWeek: number; ticks: number }[] = []
let totalTicks = 0
function advance(state: State, week: number, name: string): State {
  const startWeek = state.market.tick
  assert.ok(Number.isSafeInteger(week) && week >= startWeek)
  assert.ok(week - startWeek <= 201, 'individual phase bound')
  while (state.market.tick < week) {
    state = tick(state); totalTicks++
    assert.ok(totalTicks <= 501, '52+85+52+312 exact aggregate upper bound')
  }
  stages.push({ name, startWeek, endWeek: state.market.tick, ticks: week - startWeek })
  return state
}
type Output = { filename: string; kind: 'save35' | 'writerPair37'; week: number; raw: string; facts: unknown }
const outputs: Output[] = [], inputRows: unknown[] = []
const c4Directory = 'tests/fixtures/p14/genuine-v34-c4-corpus'
const c4ManifestBytes = readFileSync(join(repo, c4Directory, 'MANIFEST.json'))
const c4Manifest = JSON.parse(c4ManifestBytes.toString('utf8')) as { authority: { headSha: string; saveVersion: number };
  fixtures: { filename: string; compressedSha256: string; uncompressedSha256: string; week: number }[] }
assert.equal(c4Manifest.authority.headSha, 'ff7b9ac1d334709f1c907e6f7e6d918b935ee9a5')
assert.equal(c4Manifest.authority.saveVersion, 34)
const c4Cases = [
  { name: 'cohort-week', from: 104, to: 156, gzip: 'b18eee654b57ae7040c6cddfb878f3e358ee735c757adf481fe88ffa97a91b02', weeks: [156] },
  { name: 'all-statuses', from: 227, to: 312, gzip: 'd042e74ab468afe8a43754378caf2301050436679ad8a394c0b5a7da055e21ca', weeks: [260, 312] },
  { name: 'deep-deficit', from: 2600, to: 2652, gzip: '314b8152c0e108f51b0abb3885b7ec06dee520f29deef3bdb0845ed514c1ab5a', weeks: [2652] },
]
for (const item of c4Cases) {
  const filename = `genuine-v34-c4-${item.name}.json.gz`, compressed = readFileSync(join(repo, c4Directory, filename))
  const row = c4Manifest.fixtures.find(candidate => candidate.filename === filename)
  assert.ok(row); assert.equal(sha(compressed), item.gzip); assert.equal(sha(compressed), row.compressedSha256)
  const raw = gunzipSync(compressed).toString('utf8')
  assert.equal(sha(raw), row.uncompressedSha256)
  const old = save.validateSaveV34(JSON.parse(raw))
  assert.equal(old.state.market.tick, item.from); assert.equal(save.exportSave(old), raw)
  const state = advance(save.migrateToLive(old).state, item.to, `C4 ${item.name}`)
  const current = save.makeSave(state), frozen = save.convertV36ToV35(save.convertV37ToV36(current))
  assert.equal(frozen.saveVersion, 35); assert.equal(save.validateSaveV35(frozen), frozen)
  assert.deepEqual(frozen.state.careerLifecycle.cohorts.map(receipt => receipt.week), item.weeks)
  const receipt = frozen.state.careerLifecycle.cohorts.at(-1)!
  if (item.name === 'deep-deficit') {
    assert.equal(receipt.personIds.length, 32)
    assert.deepEqual(receipt.requested, { actor: 32, director: 0, writer: 0, craft: 0 })
  }
  assert.equal(state.talentMarket.cases.some(kase => kase.variant === 'retirementExtension'), false)
  const saved = save.exportSave(frozen)
  assert.equal(save.exportSave(save.importSave(saved)), saved)
  assert.equal(save.exportSave(old), raw, 'original input is unchanged')
  inputRows.push({ path: `${c4Directory}/${filename}`, compressedSha256: sha(compressed), uncompressedSha256: sha(raw), week: item.from })
  outputs.push({ filename: `reproduced-v35-c4-${item.name}-week${item.to}.json.gz`, kind: 'save35', week: item.to,
    raw: saved, facts: { origin: filename, receiptWeeks: item.weeks, cohortReceipts: frozen.state.careerLifecycle.cohorts } })
}

// Reproduce the original880-B finishingWriter public scenario and disclosed cash
// bootstrap exactly. Keep both actual snapshots in one explicitly labelled bundle.
const seed = 'c2rm-writer-natural', world = generateWorld(seed)
let state = initializeHollywood(applyActions({ ...world, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
const cashBefore = state.studio.cash, delta = 30_000_000 - cashBefore
state = { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
  { week: state.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta, note: 'P14B.2 fixture disclosed cash bootstrap' }] }
const actions: { week: number; action: Action }[] = []
function act(action: Action) { actions.push({ week: state.market.tick, action }); state = applyActions(state, [action]) }
act({ kind: 'createTalent', talent: { name: 'C2RM Finishing Writer', role: 'writer', age: 70,
  actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } })
const writerId = state.talent.at(-1)!.id
act({ kind: 'signContract', talentId: writerId, termWeeks: 208 }); act({ kind: 'activateScriptDevelopment' })
state = advance(state, 201, 'writer pre-renewal')
const proposal = { talentId: writerId, issuerStudioId: state.hollywood!.playerStudioId, termWeeks: 104, premiumTier: 1.25 }
state = submitProposal(state, proposal)
state = advance(state, 208, 'writer carrying renewal')
assert.equal(activeContract(state, writerId)?.startWeek, 208)
assert.equal(activeContract(state, writerId)?.endWeekExclusive, 312)
state = advance(state, 260, 'writer hard75 announcement')
const announced = retirementRecordFor(state, writerId)
assert.ok(announced)
assert.equal(announced.announcedWeek, 260); assert.equal(announced.ageAtAnnouncement, 75)
assert.equal(announced.effectiveWeek, 312); assert.equal(announced.status, 'announced')
state = advance(state, 311, 'writer pre-E commission')
act({ kind: 'commissionOriginalScreenplay', screenplay: { writerId, genre: 'crime',
  shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
  promise: { genre: 'crime', intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } } } })
const project = state.scriptDevelopment.projects.at(-1)!, dueWeek = project.dueWeek
assert.ok(dueWeek !== null && dueWeek > 312)
assert.equal(project.commissionedWeek, 311); assert.equal(project.status, 'drafting')
const commissioned = save.makeSave(state)
assert.equal(save.validateSaveV37(commissioned), commissioned)
assert.equal(save.convertV37ToV36(commissioned).saveVersion, 36, 'actual active-contract historical control')
state = advance(state, 312, 'writer actual finishing')
const finishing = save.makeSave(state)
assert.equal(save.validateSaveV37(finishing), finishing)
assert.equal(activeContract(state, writerId), undefined)
assert.equal(retirementRecordFor(state, writerId)?.status, 'finishing_commitments')
assert.equal(retirementRecordFor(state, writerId)?.finishingFromWeek, 312)
assert.deepEqual(state.scriptDevelopment.projects.find(row => row.id === project.id), project)
assert.throws(() => save.validateSaveV36({ ...finishing, saveVersion: 36 }), /not contracted/i)
assert.throws(() => save.convertV37ToV36(finishing), /not contracted/i)
const commissionedRaw = save.exportSave(commissioned), finishingRaw = save.exportSave(finishing)
assert.equal(save.exportSave(save.importSave(commissionedRaw)), commissionedRaw)
assert.equal(save.exportSave(save.importSave(finishingRaw)), finishingRaw)
outputs.push({ filename: 'reproduced-v37-writer-commissioned311-finishing312.json.gz', kind: 'writerPair37', week: 312,
  raw: JSON.stringify({ format: 'historical-writer-pair/v1', writerId, dueWeek,
    commissionedSaveJson: commissionedRaw, finishingSaveJson: finishingRaw }) + '\n',
  facts: { writerId, dueWeek, commissionedWeek: 311, finishingWeek: 312,
    commissionedSha256: sha(commissionedRaw), finishingSha256: sha(finishingRaw), seed,
    bootstrap: { cashBefore, cashAfter: 30_000_000, delta, note: 'same disclosed P14B.2 generated-fixture funding as original880-B' },
    actions, proposal: { week: 201, ...proposal } } })

assert.equal(totalTicks, 501)
assert.equal(outputs.length, 4)
const artifacts = outputs.map(({ raw, ...rest }) => {
  const compressed = gzipSync(raw, { level: 9 })
  assert.equal(gunzipSync(compressed).toString('utf8'), raw)
  return { ...rest, compressed, uncompressedSha256: sha(raw), compressedSha256: sha(compressed),
    byteLength: Buffer.byteLength(raw), compressedByteLength: compressed.length }
})
assert.deepEqual(sourceIdentity(), sourceBefore, 'current source changed during reproduction')
assert.deepEqual(archiveIdentity(), archiveBefore, 'archived source changed during reproduction')
for (const row of c4Manifest.fixtures.filter(row => c4Cases.some(item => row.filename === `genuine-v34-c4-${item.name}.json.gz`))) {
  assert.equal(sha(readFileSync(join(repo, c4Directory, row.filename))), row.compressedSha256)
}
assert.equal(sha(readFileSync(join(repo, c4Directory, 'MANIFEST.json'))), sha(c4ManifestBytes))
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256)
const manifest = { generatedAt: new Date().toISOString(), producer: PRODUCER, producerSha256,
  sourceSha: OUTGOING_SOURCE, currentWorktree: sourceBefore, archivedSource: archiveBefore,
  description: 'Newly reproduced historical validation controls using read-only Git-object archived outgoing c000479d Save37 code. This is not an earlier capture date and not current38 gameplay.',
  boundaries: { archivedLiveSaveVersion: 37, c4PayloadSaveVersion: 35, writerPayloadSaveVersion: 37,
    writerContainer: 'historical-writer-pair/v1 with two separate canonical Save37 strings' },
  development: { develop: false, path: 'same supported default core tick as original historical test helpers' },
  inputManifest: { path: `${c4Directory}/MANIFEST.json`, sha256: sha(c4ManifestBytes) }, inputs: inputRows,
  bounds: { totalTicks, stages }, artifacts: artifacts.map(({ compressed: _compressed, ...metadata }) => metadata) }
const write = process.argv.includes('--write')
if (write) {
  assert.equal(existsSync(join(repo, OUTPUT)), false)
  mkdirSync(join(repo, OUTPUT))
  for (const artifact of artifacts) writeFileSync(join(repo, OUTPUT, artifact.filename), artifact.compressed, { flag: 'wx' })
  writeFileSync(join(repo, OUTPUT, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
  for (const artifact of artifacts) assert.equal(sha(readFileSync(join(repo, OUTPUT, artifact.filename))), artifact.compressedSha256)
}
const sourceAfter = sourceIdentity()
assert.equal(sourceAfter.head, sourceBefore.head)
assert.equal(sourceAfter.patchSha256, sourceBefore.patchSha256)
assert.deepEqual(sourceAfter.untracked, write
  ? [...sourceBefore.untracked, ...artifacts.map(row => `${OUTPUT}/${row.filename}`), `${OUTPUT}/MANIFEST.json`].sort()
  : sourceBefore.untracked)
assert.deepEqual(archiveIdentity(), archiveBefore)
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256)
console.log(JSON.stringify({ mode: write ? 'minted-new-historical-controls' : 'prepared-no-writes', manifest, sourceAfter }, null, 2))
