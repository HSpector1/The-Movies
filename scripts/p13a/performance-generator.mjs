import * as core from '../../src/core/index.ts'
import { initializeHollywood } from '../../src/core/hollywood.ts'
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { cpus, totalmem, platform, release, arch } from 'node:os'
import { performance } from 'node:perf_hooks'
import { setImmediate as yieldNow } from 'node:timers/promises'

const [directory, mode] = process.argv.slice(2)
mkdirSync(directory, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (value, message) => { if (!value) throw new Error(message) }
const report = { mode, startedAt: new Date().toISOString(), seed: 'p13a-generated-endurance-6240-01', horizon: 6240,
  method: 'Generated engaged endowed studio; ordinary authoritative weekly ticks. One matching player film at315; P13 additionally uses actual Laboratory/research/adoption actions. No user campaign or fabricated completed history.',
  runtime: { node: process.version, executable: process.execPath, execArgv: process.execArgv },
  hardware: { platform: platform(), release: release(), arch: arch(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem() },
  actions: [], checkpoints: [], ticks: [], errors: [], completed: false }
const persist = () => writeFileSync(directory + '/generation-progress.json', JSON.stringify(report, null, 2))
let state = initializeHollywood(core.applyActions({ ...core.generateWorld(report.seed), economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
const act = action => { state = core.applyActions(state, [action]); report.actions.push({ week: state.market.tick, action }) }
const counts = () => ({ week: state.market.tick, identities: state.hollywood.identities.length, businesses: state.hollywood.businesses.length,
  people: state.talent.length, films: state.hollywood.films.length, simulatedFilms: state.hollywood.films.filter(f => f.provenance === 'simulation/v1').length,
  playerFilms: state.studio.releasedFilms.length, technologyProjects: state.technology?.projects.length ?? 0,
  technologyAdoptions: state.technology?.adoptions.length ?? 0, technologyProductionRecords: state.technology?.productions.length ?? 0 })
function checkpoint() {
  const start = performance.now(), save = core.makeSave(state), json = core.exportSave(save)
  report.checkpoints.push({ ...counts(), bytes: Buffer.byteLength(json), sha256: sha(json), validateAndExportMs: performance.now() - start })
  writeFileSync(directory + '/week-' + state.market.tick + '.save.json', json)
  persist()
  console.log(JSON.stringify({ mode, checkpoint: counts() }))
  return json
}
const roles = { writer: 1, director: 1, actor: 3, craft: 1 }
function recruitPicture() {
  for (const [role, count] of Object.entries(roles)) {
    const signed = core.rosterTalent(state).filter(p => p.role === role).length
    const candidates = state.talent.filter(p => p.role === role && core.hiringMarketIds(state).includes(p.id)).sort((a, b) => a.salary - b.salary || a.id.localeCompare(b.id)).slice(0, Math.max(0, count - signed))
    for (const person of candidates) act({ kind: 'signContract', talentId: person.id, termWeeks: 104 })
  }
}
function startPicture() {
  const people = {}
  for (const [role, count] of Object.entries(roles)) {
    people[role] = core.rosterTalent(state).filter(p => p.role === role).slice(0, count)
    assert(people[role].length === count, 'Insufficient free personnel for actual player film')
  }
  const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost || a.id.localeCompare(b.id))[0]
  act({ kind: 'greenlight', production: { conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-.5, .5], tonalWeight: [-.5, .5], kineticEnergy: [-.5, .5] } },
    writerId: people.writer[0].id, directorId: people.director[0].id,
    cast: { lead: people.actor[0].id, antagonist: people.actor[1].id, support: people.actor[2].id }, craftIds: [people.craft[0].id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 } } })
  if (mode === 'p13') act({ kind: 'setProductionTechnology', productionId: state.studio.activeProductions[0].id,
    method: 'synchronized-dialogue', adoptionId: state.technology.adoptions.find(a => a.studioId === state.hollywood.playerStudioId).id })
}
function drivePicture() {
  for (const workflow of state.operations.workflows) {
    const picture = state.studio.activeProductions.find(p => p.id === workflow.productionId)
    if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
      act({ kind: 'assignShootingDirector', productionId: picture.id, directorId: picture.directorId })
      const assigned = state.operations.workflows.find(w => w.productionId === picture.id)
      assert(assigned.shootingTask?.status === 'ready', 'Actual shooting assignment must have lawful cleared load-in')
      act({ kind: 'scheduleShootingTake', productionId: picture.id })
    }
    if (picture?.remainingTicks === 1) act({ kind: 'commitPictureToRelease', productionId: picture.id })
  }
}
try {
  if (mode === 'p13') state = core.commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
  while (state.market.tick < report.horizon) {
    const week = state.market.tick
    if (mode === 'p13') {
      const lab = state.operations.facilities.find(f => f.capability === 'laboratory')
      if (week === 12) act({ kind: 'installAcousticInstruments', laboratoryFacilityId: lab.id })
      if (week === 260) {
        act({ kind: 'recruitScientist', laboratoryFacilityId: lab.id })
        act({ kind: 'assignResearchScientist', laboratoryFacilityId: lab.id, scientistId: state.talent.find(p => p.role === 'scientist').id })
        act({ kind: 'beginResearch', projectId: state.technology.projects[0].id, budgetPerWeek: 10_000 })
      }
      if (week === 303) {
        assert(state.technology.projects[0].completedWeek === 303, 'Research must actually complete at303')
        act({ kind: 'adoptSynchronizedSound', stageFacilityId: state.operations.facilities.find(f => f.capability === 'soundstage').id,
          postFacilityId: state.operations.facilities.find(f => f.capability === 'post').id })
      }
      if (week === 315) assert(state.technology.adoptions.find(a => a.studioId === state.hollywood.playerStudioId).operationalWeek === 315, 'Physical chain must actually complete at315')
    }
    if (week >= 260 && week <= 315) recruitPicture()
    if (week === 315) startPicture()
    drivePicture()
    const started = performance.now()
    state = core.tick(state, { develop: true })
    report.ticks.push({ week: state.market.tick, elapsedMs: performance.now() - started })
    assert(state.market.tick === week + 1, 'Every tick advances exactly one week')
    if ([316, 520, 2600, 6240].includes(state.market.tick)) checkpoint()
    if (state.market.tick % 52 === 0) { persist(); await yieldNow() }
    if (state.market.tick % 520 === 0) console.log(JSON.stringify({ mode, progress: counts() }))
  }
  assert(state.studio.releasedFilms.length === 1, 'The actual player film must survive at the horizon')
  const json = checkpoint(), restored = core.importSave(json).state
  assert(core.exportSave(core.makeSave(restored)) === json, 'Exact current save roundtrip failed')
  assert(core.exportSave(core.makeSave(core.tick(restored, { develop: true }))) === core.exportSave(core.makeSave(core.tick(state, { develop: true }))), 'Next tick diverged after roundtrip')
  report.final = { ...counts(), cash: state.studio.cash, saveSha256: sha(json), saveBytes: Buffer.byteLength(json), exactRoundtrip: true, exactNextTick: true }
  report.completed = true
} catch (error) {
  report.errors.push({ week: state.market.tick, message: error.message, stack: error.stack }); process.exitCode = 1
} finally {
  report.finishedAt = new Date().toISOString(); report.memory = { ...process.memoryUsage(), highWaterRssKiB: process.resourceUsage().maxRSS }
  persist(); writeFileSync(directory + '/generation-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ mode, completed: report.completed, errors: report.errors, final: report.final }))
}
