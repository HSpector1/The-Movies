// 1314-P: measured route facts on the UNCHANGED engine (Save41 writer) for the 1313 casting-driver slice.
// Public actions and natural ticks only, on p13aGeneratedStudio: sign a writer, a director, one craft and three
// actors from the week-0 hiring market; build the grand ballroom set on facility-soundstage-07 (the p14b2/p14c2c fixture
// step); activate script development and casting sessions; commission, accept, audition, acknowledge, greenlight
// seating one slate candidate per slot; shoot through the managed workflow; advance to release. Prints facts only.
import { applyActions } from '/Users/zacheryspector/The-Movies-headless-program/src/core/actions.ts'
import { hiringMarketIds } from '/Users/zacheryspector/The-Movies-headless-program/src/core/employment.ts'
import { makeSave, validateSaveV41 } from '/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts'
import { TUNING } from '/Users/zacheryspector/The-Movies-headless-program/src/core/tuning.ts'
import { tick } from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import { p13aGeneratedStudio } from '/Users/zacheryspector/The-Movies-headless-program/src/harness/p13a/fixtures.ts'
import type { GameState } from '/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts'

const seed = process.argv[2] ?? 'r1314-casting-01'
let s: GameState = p13aGeneratedStudio(seed)
const log = (label: string, v: unknown) => console.log(label, JSON.stringify(v))
const market = hiringMarketIds(s, 0)
const byRole = (role: string) => market.filter(id => s.talent.find(t => t.id === id)?.role === role)
const [writer] = byRole('writer'), [director] = byRole('director'), [craft] = byRole('craft')
const actors = byRole('actor')
log('market', { writer, director, craft, actors })
for (const id of [writer!, director!, craft!, ...actors.slice(0, 3)])
  s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
const STAGE = 'facility-soundstage-07'
const mounted = s.sets.find(x => x.mountedOn === STAGE && x.status !== 'retired')
if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
while (s.market.tick < TUNING.SET_BUILD_WEEKS_BAND_HIGH) s = tick(s)
s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
const concept = s.concepts[0]!
s = applyActions(s, [{ kind: 'commissionScript', project: { conceptId: concept.id, writerId: writer!,
  shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
  promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } } } }])
const projectId = s.scriptDevelopment.projects.at(-1)!.id
while (s.scriptDevelopment.projects.find(p => p.id === projectId)!.status !== 'review') s = tick(s)
log('scriptReview', { week: s.market.tick, projectId })
s = applyActions(s, [{ kind: 'acceptScript', projectId }])
const [a, b, c] = actors as [string, string, string]
s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate: { lead: [a, b], antagonist: [b, c], support: [c, a] } } }])
const sessionId = s.castingSessions.sessions.find(x => x.projectId === projectId)!.id
while (s.castingSessions.sessions.find(x => x.id === sessionId)!.status !== 'review') s = tick(s)
log('castingReview', { week: s.market.tick, sessionId })
s = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
s = applyActions(s, [{ kind: 'greenlightScriptProject', production: { projectId, directorId: director!, craftIds: [craft!],
  cast: { lead: a, antagonist: b, support: c }, budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
const productionId = s.studio.activeProductions.at(-1)!.id
log('greenlit', { week: s.market.tick, productionId, session: s.castingSessions.sessions.find(x => x.id === sessionId)!.status,
  relationships: s.relationships.length })
const prod = () => s.studio.activeProductions.find(p => p.id === productionId)
const flow = () => s.operations.workflows.find(w => w.productionId === productionId)
for (let n = 0; prod() !== undefined && n < 80; n++) {
  const w = flow()
  if (prod()!.remainingTicks <= 5 && w?.phase !== undefined && w.shootingTask?.status !== 'scheduled' && !s.firstTakes.some(t => t.productionId === productionId))
    s = applyActions(s, [{ kind: 'assignShootingDirector', productionId, directorId: director! }, { kind: 'scheduleShootingTake', productionId }])
  if (w?.phase === 'releaseReady') s = applyActions(s, [{ kind: 'commitPictureToRelease', productionId }])
  if (n % 5 === 0 || w?.phase === 'releaseReady') console.log(s.market.tick, JSON.stringify({ rem: prod()!.remainingTicks, phase: w?.phase, blocker: w?.blocker, shoot: w?.shootingTask?.status, takes: s.firstTakes.filter(t => t.productionId === productionId).length }).slice(0, 300))
  s = tick(s)
}
const released = s.studio.releasedFilms.find(f => f.productionId === productionId)
const people = [a, b, c, director!, craft!, writer!]
log('released', { week: s.market.tick, releasedTick: released?.releaseTick, relationships: s.relationships.length,
  edges: s.relationships.filter(e => people.includes(e.a) && people.includes(e.b))
    .map(e => ({ a: e.a, b: e.b, shared: e.sharedProductions, first: e.firstSharedWeek, kinds: e.recent.map(r => r.kind) })) })
const save = makeSave(s)
validateSaveV41(save)
log('save', { saveVersion: save.saveVersion, week: s.market.tick, rivals: s.hollywood?.businesses.length, allEdges: s.relationships.length })
