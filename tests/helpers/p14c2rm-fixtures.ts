// Independent C.2-RM inputs (875). Original corpus bytes are never rewritten.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { exportSave, importSave, makeSave, migrateToLive, validateSaveV37 } from '../../src/core/save.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { applyActions } from '../../src/core/actions.js'
import { tick } from '../../src/core/tick.js'
import { currentTier } from '../../src/core/relationships.js'
import { submitProposal } from '../../src/core/talentMarket.js'
import { activeContract } from '../../src/core/employment.js'
import type { CreativeRole, GameState } from '../../src/core/types.js'
import { advanceTo } from '../../src/harness/p13a/fixtures.js'
import { c2bFixture } from './p14c2b-fixtures.js'
import { fund, p13aGeneratedStudio } from './p14b2-fixtures.js'
import { c2cFixture, greenlightAction, toScheduledTake } from './p14c2c-fixtures.js'
export { advanceTo }
export const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export const bytes = (state: GameState) => exportSave(makeSave(state))
export const owner = (state: GameState) => state.hollywood!.playerStudioId
export function admitted(state: GameState): GameState {
  return validateSaveV37(JSON.parse(bytes(state))).state
}
export const OUTGOING_51 = 'sha256:a690e6f9e6f93f3a78f8eed8eaa20a1532a9ebd82812b0bc9414a04fdcb5968f'
export const SCI = 't-sci-00'
export const RUNTIME_51 = {
  filename: 'runtime51-current670-saved669.json.gz',
  gzip: '6a5b2566d061464fd3c352266535e491b5bcbe90a5e6f48e52548029178b403c',
  raw: 'acd644d005b4c0077a53e07257b965e3b4ebb1bd04e6d720e9e8d4b3ac261acf',
  source: '48a76a87bca624d6dff81118d5ecb6df56ca00d2',
  producer: '701d48863eb7682d470d6c1c5691cdd2a675751c9fbdd757ef80c77f31ac4814',
  current: 'c119e1aac5b1dda794bf6c6967dceade05eeace2626002eebdae68628d31db72',
  saved: '4482ac4eaedae72245fc36ef58242e412cba7fdaeee80322b4fa364845667d1e',
  journal: 'cb804269140603f3d426e027053304a593f453aa8ec8fd104cd607dcac423206',
} as const
export function runtime51Artifact(filename: string = RUNTIME_51.filename): string {
  // Same repository-relative convention as the older corpus helpers. jsdom's
  // Vite import.meta URL is an HTTP URL and must not become a filesystem root.
  return `tests/fixtures/p14/genuine-projection51-runtime-c2rm/${filename}`
}
export function readRuntime51(): string {
  const gz = readFileSync(runtime51Artifact())
  expect(sha(gz), 'original outgoing51 compressed bytes').toBe(RUNTIME_51.gzip)
  const raw = gunzipSync(gz).toString('utf8')
  expect(sha(raw), 'original outgoing51 canonical bytes').toBe(RUNTIME_51.raw)
  return raw
}
const SCIENTIST_SAVES = {
  617: ['ce1ff03c6c23516fc356ae9f5ad595c49f2ff095b905e860ec3096e44177c3fe', 'f549047f4b99cae8b0a085aac043235d9ea2070f833a69a034da4b99416c4393'],
  618: ['d166d42cd47d36fdeec62e093bc008402e40f49ffe41b2bfc91c184c088d44d2', '6b144ae7ae1543a721773c14294a78e73dcb8468b842ca83487ffc8ad3a2b664'],
  669: ['a957c4a6d7d3c549a3e4e65c2a3268ec484deffc53592d17f82aa98cd10e0fb1', RUNTIME_51.saved],
  670: ['34f0ac18280f8e5fef2482e6e1dcc5c48f30a1ef10d3ca9eaece8699ece99861', RUNTIME_51.current],
} as const
export function scientistSnapshot(week: keyof typeof SCIENTIST_SAVES): GameState {
  const gz = readFileSync(runtime51Artifact(`genuine-v37-scientist-week${week}.json.gz`))
  expect(sha(gz)).toBe(SCIENTIST_SAVES[week][0])
  const raw = gunzipSync(gz).toString('utf8')
  expect(sha(raw)).toBe(SCIENTIST_SAVES[week][1])
  const state = validateSaveV37(JSON.parse(raw)).state
  expect(state.market.tick).toBe(week)
  return state
}
export const AXES = {
  gap: { fixture: 'genuine-v35-c2b-contract-gap-freeagent-expiry', personId: 'authored-0000',
    issuer: 'studio-d7df6c8e-player', announcement: 52, effective: 104, window: 92, decision: 98, term: 58 },
  exact: { fixture: 'genuine-v35-c2b-contract-at-effective-week', personId: 'authored-0000',
    issuer: 'studio-d2e9db93-player', announcement: 52, effective: 150, window: 138, decision: 150, term: 52 },
  rival: { fixture: 'genuine-v35-c2b-rival-incumbent-cohorts', personId: 'person-cohort-208-actor-1',
    issuer: 'studio-25969b11-r01', announcement: 2566, effective: 2704, window: 2692, decision: 2704, term: 52 },
} as const
const extensionCache = new Map<string, GameState>()
export function extensionWorld(axis: keyof typeof AXES = 'gap', atWeek: number = AXES[axis].window): GameState {
  const key = `${axis}:${atWeek}`
  if (!extensionCache.has(key)) {
    const facts = AXES[axis]
    const old = c2bFixture(facts.fixture)
    const live = migrateToLive(importSave(JSON.stringify({ saveVersion: 35, seed: old.seed,
      state: old, broadcastCache: old.broadcastItems }))).state
    expect(retirementRecordFor(live, facts.personId), 'genuine axis premise').toMatchObject({
      announcedWeek: facts.announcement, effectiveWeek: facts.effective, extensionUsed: false,
    })
    extensionCache.set(key, admitted(advanceTo(live, atWeek)))
  }
  return structuredClone(extensionCache.get(key)!)
}

/** Public creator, named to distinguish input authorship from a synthetic ledger. */
export function addPerson(state: GameState, name: string, role: CreativeRole, age: number) {
  const next = applyActions(state, [{ kind: 'createTalent', talent: { name, role, age,
    actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
  return { state: next, id: next.talent.at(-1)!.id }
}
export const freshWorld = (seed = 'c2rm-independent-read-models') => fund(p13aGeneratedStudio(seed))

type WriterFixture = { commissioned: GameState; finishing: GameState; retired: GameState; writerId: string; dueWeek: number }
let writerCache: WriterFixture | undefined
/** Entirely natural: a70-year-old writer reaches hard75 at260; no age/clock edits. */
export function finishingWriter(): WriterFixture {
  if (writerCache === undefined) {
    const made = addPerson(freshWorld('c2rm-writer-natural'), 'C2RM Finishing Writer', 'writer', 70)
    const writerId = made.id
    let state = applyActions(made.state, [{ kind: 'signContract', talentId: writerId, termWeeks: 208 },
      { kind: 'activateScriptDevelopment' }])
    state = advanceTo(state, 201)
    state = submitProposal(state, { talentId: writerId, issuerStudioId: owner(state), termWeeks: 104, premiumTier: 1.25 })
    state = advanceTo(state, 208)
    expect(activeContract(state, writerId), 'writer premise: actual carrying renewal').toMatchObject({ startWeek: 208, endWeekExclusive: 312 })
    state = advanceTo(state, 260)
    expect(retirementRecordFor(state, writerId), 'writer premise: real hard75 birthday').toMatchObject({
      announcedWeek: 260, ageAtAnnouncement: 75, effectiveWeek: 312, status: 'announced' })
    state = advanceTo(state, 311)
    state = applyActions(state, [{ kind: 'commissionOriginalScreenplay', screenplay: {
      writerId, genre: 'crime', shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
      promise: { genre: 'crime', intendedSegments: ['adult'], ranges: {
        intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } },
    } }])
    const dueWeek = state.scriptDevelopment.projects.at(-1)!.dueWeek!
    expect(dueWeek, 'original screenplay must genuinely outlast E, unlike a one-week pool script').toBeGreaterThan(312)
    const commissioned = admitted(state), finishing = advanceTo(state, 312)
    //878 exposed a real live persistence contradiction: the legitimate tick
    //reaches finishing, but the frozen script validator still requires a current
    //contract. Keep this real state and test persistence separately; do not label
    //it a validated save or repair/drop its retained task to make a fixture pass.
    expect(retirementRecordFor(finishing, writerId)).toMatchObject({ status: 'finishing_commitments', finishingFromWeek: 312 })
    const retired = admitted(advanceTo(finishing, dueWeek))
    expect(retirementRecordFor(retired, writerId)).toMatchObject({ status: 'retired', retiredWeek: dueWeek })
    writerCache = { commissioned, finishing, retired, writerId, dueWeek }
  }
  return structuredClone(writerCache)
}

type Crowd = { ids: string[]; announced: GameState; near: GameState; retired: GameState }
let crowdCache: Crowd | undefined
/**65 actual creator/signing/birthday records; cash bootstrap is the existing disclosed fixture law. */
export function retirementCrowd(): Crowd {
  if (crowdCache === undefined) {
    let state = freshWorld('c2rm-calendar-crowd')
    const ids: string[] = []
    for (let i = 0; i < 65; i++) {
      const made = addPerson(state, i < 2 ? 'C2RM Same Name' : `C2RM Actor ${i}`, 'actor', 70)
      ids.push(made.id)
      state = applyActions(made.state, [{ kind: 'signContract', talentId: made.id, termWeeks: 104 }])
    }
    state = fund(state)
    const announced = admitted(advanceTo(state, 52))
    for (const id of ids) expect(retirementRecordFor(announced, id)).toMatchObject({ announcedWeek: 52, effectiveWeek: 104, status: 'announced' })
    const near = admitted(advanceTo(announced, 103))
    const retired = admitted(advanceTo(near, 104))
    for (const id of ids) expect(retirementRecordFor(retired, id)).toMatchObject({ retiredWeek: 104, status: 'retired' })
    crowdCache = { ids, announced, near, retired }
  }
  return structuredClone(crowdCache)
}

type MultiRole = { state: GameState; multiRole: GameState; personId: string; filmId: string; promiseId: string }
let multiRoleCache: MultiRole | undefined
/** One real release, plus an explicitly SYNTHETIC imported credit-only variant.
 * M16 refuses two roles for one person at greenlight; this is NOT a natural
 * multirole producer. The player-film persisted participant validator can admit
 * the adversarial historical role-credit shape; prove that whole-save premise. */
export function multiRoleAlumnus(): MultiRole {
  if (multiRoleCache === undefined) {
    const f = c2cFixture(), action = greenlightAction(f, f.beforeAnnouncement)
    if (action.kind !== 'greenlight') throw new Error('Expected actual greenlight action')
    let state = applyActions(f.beforeAnnouncement, [action])
    const filmId = state.studio.activeProductions.at(-1)!.id
    let released = false
    for (let step = 0; step < 40; step++) {
      const workflow = state.operations.workflows.find(row => row.productionId === filmId)
      if (workflow?.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
        state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: filmId, directorId: f.directorId }])
      }
      const task = state.operations.workflows.find(row => row.productionId === filmId)?.shootingTask
      if (task?.status === 'ready') state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: filmId }])
      if (state.studio.activeProductions.find(row => row.id === filmId)?.remainingTicks === 1) {
        state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: filmId }])
      }
      state = tick(state)
      if (state.studio.releasedFilms.some(row => row.productionId === filmId)) { released = true; break }
    }
    expect(released, 'multi-role premise: real picture must release within bounded drive').toBe(true)
    const film = state.studio.releasedFilms.find(row => row.productionId === filmId)!
    expect(film.participants?.writer.talentId).toBe(f.writerId)
    expect(film.participants?.cast.lead.talentId).toBe(f.actorId)
    state = admitted(advanceTo(state, 156))
    expect(retirementRecordFor(state, f.actorId)).toMatchObject({ status: 'retired', retiredWeek: 156 })
    const person = state.talent.find(row => row.id === f.actorId)!
    const multiRole = admitted({ ...state, studio: { ...state.studio,
      releasedFilms: state.studio.releasedFilms.map(row => row.productionId !== filmId ? row : {
        ...row, participants: { ...row.participants!, writer: { ...row.participants!.writer,
          talentId: person.id, name: person.name } },
      }),
    } })
    // Only two fields of one captured role-credit row differ. No new film,
    //release, employment, career event, promise or relationship is invented.
    expect(multiRole.careerEvents).toEqual(state.careerEvents)
    expect(multiRole.firstTakes).toEqual(state.firstTakes)
    expect(multiRole.promises).toEqual(state.promises)
    multiRoleCache = { state, multiRole, personId: f.actorId, filmId, promiseId: f.promiseId }
  }
  return structuredClone(multiRoleCache)
}

type FrozenTies = { retired: GameState; later: GameState; hidden: GameState; rehired: GameState;
  personId: string; counterpartId: string; retiredTier: ReturnType<typeof currentTier> }
let tiesCache: FrozenTies | undefined
/** Natural work twice, cancellation twice, birthday retirement, real renewal and drift. */
export function frozenTies(): FrozenTies {
  if (tiesCache === undefined) {
    const f = c2cFixture()
    let state = f.announced
    for (let picture = 0; picture < 2; picture++) {
      const scheduled = toScheduledTake(f, state)
      state = tick(scheduled.state)
      expect(state.firstTakes.some(row => row.productionId === scheduled.productionId), 'freeze premise: real take').toBe(true)
      state = applyActions(state, [{ kind: 'cancel', productionId: scheduled.productionId }])
    }
    const retired = admitted(advanceTo(state, 156))
    expect(retirementRecordFor(retired, f.actorId)).toMatchObject({ status: 'retired', retiredWeek: 156 })
    const incident = retired.relationships.filter(row => row.a === f.actorId || row.b === f.actorId)
    const edge = incident.find(row => row.a === f.directorId || row.b === f.directorId)
    expect(edge, 'freeze premise: retained actual actor/director edge').toBeDefined()
    const retiredTier = currentTier(edge!, 156)
    expect(retiredTier, 'two real takes must discriminate freezing from baseline drift').not.toBe('Acquaintances')
    state = advanceTo(retired, 196)
    state = submitProposal(state, { talentId: f.directorId, issuerStudioId: owner(state), termWeeks: 208, premiumTier: 1.25 })
    state = advanceTo(state, 208)
    expect(activeContract(state, f.directorId), 'freeze premise: counterpart stays lawfully disclosed').toMatchObject({ endWeekExclusive: 416 })
    const later = admitted(advanceTo(state, 400))
    expect(later.relationships.filter(row => row.a === f.actorId || row.b === f.actorId)).toEqual(incident)
    expect(currentTier(edge!, 400), 'freeze control MUST cross a real tier boundary').not.toBe(retiredTier)
    const hidden = admitted(applyActions(later, [{ kind: 'releaseTalent', talentId: f.directorId }]))
    let rehired = applyActions(hidden, [{ kind: 'signContract', talentId: f.directorId, termWeeks: 52 }])
    rehired = admitted(tick(rehired)) // strict disclosure starts AFTER startWeek.
    expect(rehired.relationships.filter(row => row.a === f.actorId || row.b === f.actorId)).toEqual(incident)
    tiesCache = { retired, later, hidden, rehired, personId: f.actorId, counterpartId: f.directorId, retiredTier }
  }
  return structuredClone(tiesCache)
}
