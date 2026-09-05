// ── P09A W4 — deterministic Visual Oracle fixtures for the Founding Flip / Build ──
//
// Copy-adapt of scripts/gen-p08-visual-oracle-fixtures.mts (same emission idiom,
// same checkpoint format). ELEVEN P09 scenarios — the charter P09 §23 fixture
// families, each an ordinary-player state reached with the shipped actions
// (no hidden cash, no free facility, no waived payroll; every build paid at the
// engine's own price on the studio's own cash):
//
//   1. p09-migrated-endowed-unchanged — an endowed founded studio migrated
//                                       through the shipped V17→V18 path: regime
//                                       `endowed`, every founding structure, no
//                                       NEEDED NOW row, the legacy Annex offered.
//   2. p09-sparse-start               — the bare lot the moment it is founded:
//                                       Gate + Administration only, no capacity,
//                                       journey `no-capacity` → Open Build, the
//                                       office the ONE available row (NEEDED NOW).
//   3. p09-valid-placement            — the same sparse start; the oracle previews
//                                       the office at Gate Court West (12,14) and
//                                       must read `ok:true` from the authority.
//   4. p09-invalid-placement          — the same sparse start; the oracle previews
//                                       ON the Administration footprint (8,18) →
//                                       `notOwned`, on the Crossroad → `notOwned`,
//                                       and off the lot → `offLot`.
//   5. p09-office-rising              — the office committed at week 0, five weeks
//                                       in: one site, progress 5/14, journey waits
//                                       for week 14, a second office refused.
//   6. p09-multi-site                 — the office operational (week 14); Scenery,
//                                       Soundstage and Post committed the same
//                                       week, two weeks in: THREE active sites with
//                                       independent identities and progress.
//   7. p09-reconnect-same-ids         — scenario 6's state under a second session
//                                       id: identities are the persisted
//                                       placement ids, never scene order.
//   8. p09-same-week-completion       — a second office and the Post Building
//                                       committed together after the founding
//                                       office opened; both complete on week 28.
//   9. p09-save-load-mid-construction — scenario 5's state exported and re-imported
//                                       through the shipped save path at week 7:
//                                       construction resumes from its persisted weeks.
//  10. p09-first-film-released        — the whole ordinary bare-lot journey: four
//                                       facilities, one Set, one picture released
//                                       on the studio's own money; P08 history
//                                       carries founding + release.
//  11. p09-endowed-build              — an endowed studio that built a Craft
//                                       Services Annex: the 1948 art untouched, one
//                                       generic body, the ground map off.
//
// RUN: node_modules/.bin/vite-node scripts/gen-p09-visual-oracle-fixtures.mts
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyActions,
  beginFounding,
  contractOffer,
  FOUNDING_MINIMUMS,
  foundingPhaseOf,
  generateWorld,
  makeSaveV17,
  migrateToV18,
  nextStudioDecision,
  queryPlacement,
  tick,
} from '../src/core/index.ts'
import type { CreativeRole, GameState, LotCell } from '../src/core/index.ts'
import { exportSaveJson, importSaveJson, studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { freePackage, commissionFor } from '../tests/_m4Fixtures.ts'

const GENERATOR = 'scripts/gen-p09-visual-oracle-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/p09-visual-oracle-v1'
const SEED = 'p09-visual-oracle-v1'

// The ordinary bare-lot origins (the same ground tests/p09a-w0-founding-regime.test.ts proves).
const ORIGINS: Record<string, LotCell> = {
  'development-casting-office': { gx: 12, gy: 14 }, // Gate Court West, fronting the Crossroad
  'scenery-shop': { gx: 16, gy: 14 }, // same court, one clear cell east of the office
  'stage-standard': { gx: 26, gy: 4 }, // North Yard
  'post-building': { gx: 30, gy: 14 }, // Gate Court East, fronting the Crossroad
}
const SECOND_OFFICE_ORIGIN: LotCell = { gx: 2, gy: 2 } // North Yard
const ENDOWED_CRAFT_ORIGIN: LotCell = { gx: 0, gy: 9 } // west-lawn (endowed lot)

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes).digest('hex')
}
function fail(message: string): never {
  throw new Error(`gen-p09-visual-oracle-fixtures: ${message}`)
}
function assertEq<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) fail(`${label}: expected ${String(expected)}, got ${String(actual)}`)
}
function assertTrue(condition: boolean, label: string): void {
  if (!condition) fail(label)
}

/** The exact ordinary founding: cheapest legal applicant per role at the player minimum. */
function foundMinimum(state: GameState): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function commit(state: GameState, blueprintId: string, origin: LotCell = ORIGINS[blueprintId]!): GameState {
  const quote = queryPlacement(state, { blueprintId, origin })
  if (!quote.ok) fail(`${blueprintId} at ${JSON.stringify(origin)} is not legal: ${quote.primary} ${JSON.stringify(quote.rejections)}`)
  return applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId, origin } }])
}

function ticks(state: GameState, weeks: number): GameState {
  let next = state
  for (let week = 0; week < weeks; week++) next = tick(next)
  return next
}

function driveOps(state: GameState): GameState {
  let next = state
  let decision = nextStudioDecision(next)
  let guard = 0
  while (decision !== null && decision.kind === 'productionOperation' && guard++ < 60) {
    next = applyActions(next, [decision.command])
    decision = nextStudioDecision(next)
  }
  return next
}

/** The ordinary bare-lot first film, exactly as the P09 HARD-STOP gate plays it. */
function firstFilm(start: GameState): { state: GameState; releaseWeek: number; cashFloor: number } {
  let state = commit(start, 'development-casting-office')
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, 0, 0) }])
  let minCash = state.studio.cash
  let productionId: string | null = null
  let setCommissioned = false
  let plantCommitted = false
  let releaseWeek = -1
  for (let week = 0; week < 120; week++) {
    if (!plantCommitted && foundingPhaseOf(state) === 'satisfied') {
      for (const id of Object.keys(ORIGINS)) if (id !== 'development-casting-office') state = commit(state, id)
      plantCommitted = true
    }
    state = driveOps(state)
    for (const project of state.scriptDevelopment.projects) {
      if (project.status === 'review') state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
    }
    for (const project of state.scriptDevelopment.projects) {
      if (project.status === 'ready' && productionId === null) {
        state = applyActions(state, [{ kind: 'greenlightScriptProject', production: freePackage(state, project.id) }])
        productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
      }
    }
    const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')
    const scenery = state.operations.facilities.find((f) => f.capability === 'set-scenery')
    if (!setCommissioned && stage !== undefined && scenery !== undefined) {
      state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-house-generic', stageFacilityId: stage.id } }])
      setCommissioned = true
    }
    if (productionId !== null) {
      const production = state.studio.activeProductions.find((p) => p.id === productionId)
      if (production !== undefined && production.remainingTicks === 1 &&
          !state.releaseAuthority.commitments.some((c) => c.productionId === productionId)) {
        state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
      }
    }
    state = tick(state)
    minCash = Math.min(minCash, state.studio.cash)
    if (productionId !== null && releaseWeek < 0 && state.studio.releasedFilms.some((f) => f.productionId === productionId)) releaseWeek = state.market.tick
    if (releaseWeek >= 0 && state.theatricalRuns.find((r) => r.productionId === productionId)?.status === 'completed') break
  }
  assertTrue(releaseWeek > 0, 'the ordinary bare-lot studio released its picture')
  assertTrue(minCash > 0, 'cash never went below zero')
  return { state, releaseWeek, cashFloor: minCash }
}

type ScenarioFixture = {
  scenarioId: string
  week: number
  state: GameState
  sessionId: string
  derivation: string[]
  assertions: string[]
}

function buildFixtures(): ScenarioFixture[] {
  const fixtures: ScenarioFixture[] = []
  // The runner gates on `SessionPrefix + scenarioId` exactly ("p09-oracle-" + "p09-…").
  const add = (scenarioId: string, state: GameState, derivation: string[], assertions: string[], sessionId = `p09-oracle-p09-${scenarioId}`) =>
    fixtures.push({ scenarioId, week: state.market.tick, state, sessionId, derivation, assertions })

  // s1 — endowed, migrated through the shipped path.
  {
    const endowedLive = ticks(foundMinimum(generateWorld(SEED)), 2)
    const v17 = makeSaveV17(endowedLive)
    const migrated = migrateToV18(v17).state
    assertEq(migrated.foundingRegime, 'endowed', 's1: migrated regime')
    assertEq(migrated.property.structures.length, endowedLive.property.structures.length, 's1: structures preserved')
    const lot = studioLotSnapshot(migrated)
    assertTrue(!lot.placement!.catalog.some((row) => row.neededNow), 's1: no NEEDED NOW on an endowed lot')
    assertTrue(lot.buildings.some((b) => b.id === 'expansion'), 's1: legacy Annex parcel offered')
    add('migrated-endowed-unchanged', migrated,
      ['foundMinimum(generateWorld(SEED)) on the endowed lot, two weeks, makeSaveV17 → migrateToV18 (the shipped path)'],
      ['regime endowed', `${migrated.property.structures.length} founding structures`, 'no NEEDED NOW row', 'legacy Annex parcel offered'])
  }

  // s2/s3/s4 — the sparse start.
  const sparse = foundMinimum(generateWorld(SEED, { regime: 'bare-lot' }))
  {
    assertEq(sparse.foundingRegime, 'bare-lot', 's2: regime')
    assertEq(sparse.placement.facilities.length, 0, 's2: no placements')
    assertEq(foundingPhaseOf(sparse), 'office-needed', 's2: office needed')
    const lot = studioLotSnapshot(sparse)
    assertEq(lot.firstFilmJourney.stage, 'no-capacity', 's2: journey stage')
    assertEq(lot.firstFilmJourney.next?.kind, 'build', 's2: journey routes to Build')
    assertEq(lot.placement!.catalog.filter((row) => row.available).map((row) => row.blueprintId).join(','), 'development-casting-office', 's2: the office is the one available row')
    assertTrue(lot.placement!.catalog.find((row) => row.blueprintId === 'development-casting-office')!.neededNow, 's2: NEEDED NOW')
    assertEq(lot.buildings.map((b) => b.id).sort().join(','), 'admin,gate', 's2: the world lists Gate + Administration only')
    const derivation = ['foundMinimum(generateWorld(SEED, { regime: "bare-lot" })) — the exact ordinary founding on the sparse lot']
    const facts = ['regime bare-lot', 'no placements', 'journey no-capacity → Open Build', 'office NEEDED NOW, every other row locked by "Complete the founding Development & Casting Office"']
    add('sparse-start', sparse, derivation, facts)
    const valid = queryPlacement(sparse, { blueprintId: 'development-casting-office', origin: ORIGINS['development-casting-office']! })
    assertTrue(valid.ok, 's3: the office is legal at (12,14)')
    add('valid-placement', sparse, derivation, [...facts, 'office at (12,14): ok'])
    // The landmarks stand on unparcelled ground, so the ordered legality answers
    // `notOwned` first there (geometry/ownership before reservation) — the engine's
    // own answer, recorded as such.
    const landmark = queryPlacement(sparse, { blueprintId: 'development-casting-office', origin: { gx: 8, gy: 18 } })
    assertEq(landmark.primary, 'notOwned', 's4: the Administration footprint is not owned ground')
    const off = queryPlacement(sparse, { blueprintId: 'development-casting-office', origin: { gx: 44, gy: 3 } })
    assertEq(off.primary, 'offLot', 's4: off the lot')
    const road = queryPlacement(sparse, { blueprintId: 'development-casting-office', origin: { gx: 21, gy: 12 } })
    assertEq(road.primary, 'notOwned', 's4: the Crossroad is circulation, never owned ground')
    add('invalid-placement', sparse, derivation, [...facts, 'office at (8,18): notOwned', 'office at (44,3): offLot', 'office at (21,12): notOwned'])
  }

  // s5 — the office rising.
  const committed = commit(sparse, 'development-casting-office')
  {
    const rising = ticks(committed, 5)
    const placed = rising.placement.facilities[0]!
    assertEq(placed.status, 'underConstruction', 's5: rising')
    assertEq(placed.completesWeek, 14, 's5: completes on week 14')
    assertEq(foundingPhaseOf(rising), 'office-building', 's5: office building')
    const lot = studioLotSnapshot(rising)
    assertEq(lot.firstFilmJourney.waiting?.untilWeek, 14, 's5: journey waits for week 14')
    assertEq(lot.firstFilmJourney.next?.kind, 'advance-week', 's5: journey routes to time')
    const second = queryPlacement(rising, { blueprintId: 'development-casting-office', origin: SECOND_OFFICE_ORIGIN })
    assertTrue(second.rejections.includes('instanceLimit'), 's5: a second founding office is refused while the first rises')
    const overlap = queryPlacement(rising, { blueprintId: 'scenery-shop', origin: ORIGINS['development-casting-office']! })
    assertTrue(overlap.rejections.includes('occupied'), 's5: the rising site occupies its cells')
    add('office-rising', rising, ['sparse start; placeFacility development-casting-office at (12,14) on week 0 ($1,500,000 from the studio\'s own cash); five weekly advances'],
      ['one site placed-1 under construction, progress 5/14, opens week 14', 'journey no-capacity waiting until week 14', 'second office refused: instanceLimit'])
  }

  // s6/s10 — the operational office, three sites rising.
  const officeOpen = ticks(committed, 14)
  assertEq(foundingPhaseOf(officeOpen), 'satisfied', 's6: office operational on week 14')
  {
    let multi = officeOpen
    for (const id of ['scenery-shop', 'stage-standard', 'post-building']) multi = commit(multi, id)
    multi = ticks(multi, 2)
    const active = multi.placement.facilities.filter((f) => f.status === 'underConstruction')
    assertEq(active.length, 3, 's6: three active sites')
    assertEq(multi.placement.facilities.map((f) => f.id).join(','), '1,2,3,4', 's6: placement ids 1..4')
    const derivation = ['office committed week 0, operational week 14; scenery-shop (16,14), stage-standard (26,4), post-building (30,14) committed on week 14 at the engine\'s prices; two weekly advances']
    const facts = ['placed-1 operational', 'placed-2 scenery 2/11', 'placed-3 soundstage 2/16', 'placed-4 post 2/14', 'chip BUILD · 3 ACTIVE']
    add('multi-site', multi, derivation, facts)
    // The same state under a SECOND session id (its own scenario id ⇒ its own session).
    add('reconnect-same-ids', multi, [...derivation, 'the same state served under a second session id'], [...facts, 'identities are the persisted placement ids'])
  }

  // s7 — same-week completion.
  {
    let twin = commit(officeOpen, 'development-casting-office', SECOND_OFFICE_ORIGIN)
    twin = commit(twin, 'post-building')
    twin = ticks(twin, 14)
    const completed = twin.placement.facilities.filter((f) => f.status === 'operational')
    assertEq(completed.length, 3, 's7: all three operational')
    assertEq(twin.placement.facilities.slice(1).map((f) => f.completesWeek).join(','), '28,28', 's7: both completed on week 28')
    add('same-week-completion', twin, ['office operational week 14; a second office (2,2) and post-building (30,14) committed together on week 14 (both 14 weeks); fourteen advances'],
      ['placed-2 and placed-3 both operational since week 28', 'operations: development-casting ×2 + post'])
  }

  // s8 — save/load mid-construction.
  {
    const midway = ticks(committed, 7)
    const json = exportSaveJson(midway)
    const reloaded = importSaveJson(json)
    if (!reloaded.ok) fail('s8: re-import failed')
    assertEq(exportSaveJson(reloaded.state), json, 's8: byte-identical after re-import')
    assertEq(reloaded.state.placement.facilities[0]!.completesWeek, 14, 's8: the persisted completion week survives the round trip')
    add('save-load-mid-construction', reloaded.state, ['scenario 5 continued to week 7, exportSaveJson → importSaveJson (the shipped save path)'],
      ['one site placed-1, progress 7/14, opens week 14, byte-identical after load'])
  }

  // s9 — the first film.
  {
    const { state, releaseWeek, cashFloor } = firstFilm(sparse)
    assertEq(state.placement.facilities.filter((f) => f.status === 'operational').length, 4, 's9: four operational facilities')
    assertTrue(state.studioHistory.rows.some((row) => row.kind === 'filmReleased'), 's9: history carries the release')
    assertTrue(state.studioHistory.rows.some((row) => row.kind === 'studioFounded'), 's9: history carries the founding')
    add('first-film-released', state, [`the P09 HARD-STOP journey on the sparse lot: office → screenplay (queued) → scenery/stage/post → set → greenlight → release; release week ${String(releaseWeek)}; cash floor $${String(Math.round(cashFloor))}`],
      ['four operational bodies', `released week ${String(releaseWeek)}`, `cash floor $${String(Math.round(cashFloor))} (never below zero)`, 'P08 history: studioFounded + filmReleased'])
  }

  // s11 — an endowed studio that built.
  {
    let endowed = ticks(foundMinimum(generateWorld(SEED)), 1)
    endowed = commit(endowed, 'craft-annex', ENDOWED_CRAFT_ORIGIN)
    endowed = ticks(endowed, 2)
    assertEq(endowed.foundingRegime, 'endowed', 's11: regime')
    assertEq(endowed.placement.facilities.length, 1, 's11: one placement')
    add('endowed-build', endowed, ['endowed founded studio; craft-annex committed at (0,9) on week 1; two advances'],
      ['regime endowed, founding art untouched', 'one generic body placed-1 (craft) rising 2/6', 'ground map off outside Build mode'])
  }

  return fixtures
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(repoRoot, OUTPUT_DIRECTORY)
mkdirSync(outDir, { recursive: true })
const fixtures = buildFixtures()
const manifestFixtures = fixtures.map((fixture, index) => {
  const ordinal = index + 1
  const saveJson = exportSaveJson(fixture.state)
  const reimport = importSaveJson(saveJson)
  if (!reimport.ok) fail(`${fixture.scenarioId}: emitted save failed re-import`)
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: fixture.sessionId,
    stateRevision: 0,
    currentSaveJson: saveJson,
    savedSaveJson: null,
    journal: [],
  })
  const checkpointJson = encodeBridgeRuntimeCheckpoint(checkpoint)
  const saveName = `s${ordinal}-p09-${fixture.scenarioId}.save.json`
  const checkpointName = `s${ordinal}-p09-${fixture.scenarioId}.checkpoint.json`
  writeFileSync(join(outDir, saveName), saveJson)
  writeFileSync(join(outDir, checkpointName), checkpointJson)
  const lot = studioLotSnapshot(fixture.state)
  return {
    ordinal,
    scenarioId: `p09-${fixture.scenarioId}`,
    week: fixture.week,
    save: { file: saveName, byteLength: Buffer.byteLength(saveJson), sha256: sha256(saveJson) },
    checkpoint: {
      file: checkpointName,
      byteLength: Buffer.byteLength(checkpointJson),
      sha256: sha256(checkpointJson),
      sessionId: fixture.sessionId,
      schemaId: checkpoint.schemaId,
      stateDigest: checkpoint.currentStateDigest,
    },
    lot: {
      regime: fixture.state.foundingRegime,
      foundingPhase: foundingPhaseOf(fixture.state),
      journey: { stage: lot.firstFilmJourney.stage, headline: lot.firstFilmJourney.headline, next: lot.firstFilmJourney.next?.kind ?? null, waitingUntilWeek: lot.firstFilmJourney.waiting?.untilWeek ?? null },
      bodies: lot.buildings.map((b) => b.id),
      placements: fixture.state.placement.facilities.map((f) => ({ id: f.id, blueprintId: f.blueprintId, status: f.status, placedWeek: f.placedWeek, completesWeek: f.completesWeek, origin: f.origin })),
      catalogue: lot.placement!.catalog.map((row) => ({ blueprintId: row.blueprintId, available: row.available, neededNow: row.neededNow, atInstanceLimit: row.atInstanceLimit, unmet: row.unmet.map((u) => u.reason) })),
      cash: Math.round(fixture.state.studio.cash),
    },
    derivation: fixture.derivation,
    machineAssertions: fixture.assertions,
  }
})
const manifest = {
  fixtureId: 'p09-visual-oracle-v1',
  generator: GENERATOR,
  generatorSourceSha256: sha256(readFileSync(join(repoRoot, GENERATOR), 'utf8')),
  seed: SEED,
  origins: ORIGINS,
  law: 'Every fixture is an ordinary-player state reached with the shipped actions on the studio\'s own cash: no hidden cash, no free facility, no waived payroll, no proof-only staff. Machine assertions run on the emitted state through the shipped studioLotSnapshot / queryPlacement.',
  fixtures: manifestFixtures,
}
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
for (const fixture of manifestFixtures) {
  console.log(`s${String(fixture.ordinal)} ${fixture.scenarioId} week ${String(fixture.week)} regime ${fixture.lot.regime} phase ${fixture.lot.foundingPhase} journey ${fixture.lot.journey.stage}/${String(fixture.lot.journey.next)} bodies [${fixture.lot.bodies.join(',')}] placements ${String(fixture.lot.placements.length)} cash $${fixture.lot.cash.toLocaleString('en-US')}`)
}
console.log(`wrote ${String(manifestFixtures.length)} fixtures to ${OUTPUT_DIRECTORY}`)
