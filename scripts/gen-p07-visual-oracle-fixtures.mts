// ── P07A W7 — deterministic Visual Oracle fixtures for the release-result package ──
//
// Copy-adapt of scripts/gen-p06-visual-oracle-fixtures.mts (same emission
// idiom, same normalization law, same checkpoint format), one package on.
// SIX P07 scenarios — the §7 lifecycle families of the P07A charter:
//
//   1. p07-committed-not-released   — committed, NOT released: no result exists
//                                     anywhere; nothing is shown early.
//   2. p07-newly-in-theaters        — released THIS week: the result is available,
//                                     three channels, run week 1.
//   3. p07-active-run               — mid-run: current week truthful, totals speak
//                                     PROJECTED language, banked-to-date separate.
//   4. p07-divided-response         — critics / audience / business visibly
//                                     DISAGREE without contradiction (engineered
//                                     via an oversized marketing commitment: the
//                                     business channel is a projected loss no
//                                     matter how the picture is received).
//   5. p07-run-complete             — both runs complete: the active rail carries
//                                     no IN THEATERS row, results remain durably
//                                     inspectable with FINAL language.
//   6. p07-same-title-twins         — two films share a TITLE but never an id:
//                                     one in FILM HISTORY, one IN THEATERS, both
//                                     exactly routable.
//
// ONE deterministic timeline (walks share the same seed) with checkpoints cut at
// the §7 moments; scenario 6 adds the one documented data surgery (the twin's
// CONCEPT title is renamed to collide — titles are data, ids are identity).
// Every scenario runs its own machine assertions HERE (level 1 of the proof
// pyramid) on the NORMALIZED state, exactly as P05/P06 do.

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, tick } from '../src/core/index.ts'
import type { GameState } from '../src/core/index.ts'
import { exportSaveJson, importSaveJson, studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import {
  createBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { contendedStudio, freePackage } from '../tests/_m4Fixtures.ts'

const GENERATOR = 'scripts/gen-p07-visual-oracle-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/p07-visual-oracle-v1'
const SEED = 'p07-visual-oracle-v1'

// ── P07 ledger ───────────────────────────────────────────────────────────────
// The film identities the Unity oracle scenarios pin. Normalized exactly like
// P06: exact-token rewrite, longest-token-first, pre-image counts asserted,
// target collisions refused, re-imported through importSaveJson.
const LEDGER = {
  filmAlpha: 'prod-0700', // first leader: committed → released → run complete
  filmBeta: 'prod-0701', // second leader: released after Alpha, completes too
  filmDivided: 'prod-0710', // the oversized-marketing picture (scenarios 4 & 6)
  twinTitle: 'The Midnight Reel', // the deliberately-shared visible title (s6)
} as const

// ── helpers (shape copied from gen-p06-visual-oracle-fixtures.mts) ───────────

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

function fail(message: string): never {
  throw new Error(`gen-p07-visual-oracle-fixtures: ${message}`)
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) fail(`${label}: expected ${b}, got ${a}`)
}

function assertTrue(condition: boolean, label: string): void {
  if (!condition) fail(label)
}

/** Equality up to float-accumulation drift (weekly credits sum vs the locked total). */
function assertClose(actual: number, expected: number, label: string): void {
  const scale = Math.max(1, Math.abs(expected))
  if (Math.abs(actual - expected) > scale * 1e-9)
    fail(`${label}: expected ~${expected}, got ${actual}`)
}

/** Drive shooting decisions for EXACTLY the named productions this week (P05/P06 idiom). */
function driveTakes(state: GameState, productionIds: readonly string[]): GameState {
  let next = state
  for (const id of productionIds) {
    if (next.operations.mode !== 'managed') continue
    const workflow = next.operations.workflows.find((c) => c.productionId === id)
    if (workflow === undefined || workflow.phase !== 'shooting' || workflow.shootingTask === null)
      continue
    const production = next.studio.activeProductions.find((p) => p.id === id)
    if (production === undefined) continue
    if (workflow.shootingTask.status === 'unassigned') {
      next = applyActions(next, [
        { kind: 'assignShootingDirector', productionId: id, directorId: production.directorId },
      ])
    }
    const settled =
      next.operations.mode === 'managed'
        ? next.operations.workflows.find((c) => c.productionId === id)
        : undefined
    if (settled?.shootingTask?.status === 'ready') {
      next = applyActions(next, [{ kind: 'scheduleShootingTake', productionId: id }])
    }
  }
  return next
}

type Rename = readonly [from: string, to: string]

/** THE ONE NORMALIZATION — byte-exact copy of the P06 law. */
function normalize(
  state: GameState,
  renames: readonly Rename[],
): { state: GameState; record: Array<{ from: string; to: string; occurrences: number }> } {
  const fromSet = new Set(renames.map(([from]) => from))
  const toSet = new Set(renames.map(([, to]) => to))
  if (fromSet.size !== renames.length) fail('duplicate rename source')
  if (toSet.size !== renames.length) fail('duplicate rename target')
  let save = exportSaveJson(state)
  const record: Array<{ from: string; to: string; occurrences: number }> = []
  const ordered = [...renames].sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of ordered) {
    if (save.includes(to)) fail(`rename target "${to}" already present before rename`)
    const occurrences = save.split(from).length - 1
    if (occurrences === 0) fail(`rename source "${from}" not present`)
    save = save.split(from).join(to)
    record.push({ from, to, occurrences })
  }
  const outcome = importSaveJson(save)
  if (!outcome.ok) fail(`normalized save failed to import: ${outcome.error}`)
  return { state: outcome.state, record }
}

const runOf = (state: GameState, id: string) =>
  state.theatricalRuns.find((r) => r.productionId === id)

const cardOf = (state: GameState, id: string) =>
  studioLotSnapshot(state).results?.find((c) => c.id === id)

const activeCards = (state: GameState) =>
  (studioLotSnapshot(state).results ?? []).filter((c) => c.runStatus === 'active')

// ── the one timeline ─────────────────────────────────────────────────────────
//
// contendedStudio puts two leader pictures in flight. The walk commits each the
// moment it reaches Release Ready (the P06A hold law) and CUTS checkpoints at
// the §7 moments. A third picture (oversized marketing) is greenlit after the
// leaders complete, for the divided-response and twins scenes.

type Cut = { label: string; state: GameState; week: number }

function walkTimeline(): {
  cuts: Record<string, Cut>
  renames: Rename[]
} {
  const { state: start, readyProjectIds, productionIds } = contendedStudio(SEED)
  const [alphaId, betaId] = productionIds as [string, string]
  const cuts: Record<string, Cut> = {}
  let next = start

  const cut = (label: string, state: GameState) => {
    cuts[label] = { label, state, week: state.market.tick }
  }

  // Drive both leaders; commit at ready; cut the §7 moments around ALPHA.
  for (let week = 0; week < 40 && cuts['run-complete'] === undefined; week++) {
    next = driveTakes(next, productionIds)
    for (const id of productionIds) {
      const production = next.studio.activeProductions.find((p) => p.id === id)
      if (production === undefined || production.remainingTicks !== 1) continue
      if (next.releaseAuthority.commitments.some((c) => c.productionId === id)) continue
      next = applyActions(next, [{ kind: 'commitPictureToRelease', productionId: id }])
      if (id === alphaId && cuts['committed-not-released'] === undefined) {
        // 1 — COMMITTED, NOT RELEASED: the cut happens BEFORE the batch tick.
        cut('committed-not-released', next)
      }
    }
    const alphaReleasedBefore = next.studio.releasedFilms.some((f) => f.productionId === alphaId)
    next = tick(next)
    const alphaReleasedAfter = next.studio.releasedFilms.some((f) => f.productionId === alphaId)
    if (!alphaReleasedBefore && alphaReleasedAfter) {
      // 2 — NEWLY IN THEATERS: released THIS week.
      cut('newly-in-theaters', next)
    }
    if (
      cuts['newly-in-theaters'] !== undefined &&
      cuts['active-run'] === undefined &&
      runOf(next, alphaId)?.status === 'active' &&
      (runOf(next, alphaId)?.weekIndex ?? 0) >= 3
    ) {
      // 3 — ACTIVE RUN, mid-run.
      cut('active-run', next)
    }
    if (
      runOf(next, alphaId)?.status === 'completed' &&
      (runOf(next, betaId) === undefined || runOf(next, betaId)?.status === 'completed') &&
      next.studio.releasedFilms.some((f) => f.productionId === betaId) &&
      cuts['run-complete'] === undefined
    ) {
      // 5 — RUN COMPLETE: both leaders released and fully settled.
      cut('run-complete', next)
    }
  }
  for (const required of ['committed-not-released', 'newly-in-theaters', 'active-run', 'run-complete'])
    if (cuts[required] === undefined) fail(`timeline never reached the "${required}" cut`)

  // ── the DIVIDED picture: an oversized marketing commitment guarantees the
  // business channel disagrees with reception (a projected loss) no matter how
  // the picture lands with critics and audiences.
  next = cuts['run-complete']!.state
  const dividedProjectId = readyProjectIds[0]!
  const basePackage = freePackage(next, dividedProjectId)
  next = applyActions(next, [
    {
      kind: 'greenlightScriptProject',
      production: { ...basePackage, budget: { ...basePackage.budget, marketing: 40_000_000 } },
    },
  ])
  const dividedId = next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id
  for (let week = 0; week < 40; week++) {
    next = driveTakes(next, [dividedId])
    const production = next.studio.activeProductions.find((p) => p.id === dividedId)
    if (
      production?.remainingTicks === 1 &&
      !next.releaseAuthority.commitments.some((c) => c.productionId === dividedId)
    ) {
      next = applyActions(next, [{ kind: 'commitPictureToRelease', productionId: dividedId }])
    }
    next = tick(next)
    if ((runOf(next, dividedId)?.weekIndex ?? 0) >= 2) break
  }
  if (runOf(next, dividedId)?.status !== 'active') fail('divided picture never reached an active mid-run')
  // 4 — DIVIDED RESPONSE.
  cut('divided-response', next)

  // 6 — SAME-TITLE TWINS: the ONE documented data surgery. The divided film's
  // CONCEPT title is renamed to the ledger twin title, and so is film Alpha's —
  // titles are data resolved at presentation time; the ids never change. Result:
  // Alpha (FILM HISTORY) and the divided picture (IN THEATERS) share one name.
  const alphaFilm = next.studio.releasedFilms.find((f) => f.productionId === alphaId)!
  const dividedFilm = next.studio.releasedFilms.find((f) => f.productionId === dividedId)!
  const twins: GameState = {
    ...next,
    concepts: next.concepts.map((concept) =>
      concept.id === alphaFilm.conceptId || concept.id === dividedFilm.conceptId
        ? { ...concept, title: LEDGER.twinTitle }
        : concept,
    ),
  }
  cut('same-title-twins', twins)

  return {
    cuts,
    renames: [
      [alphaId, LEDGER.filmAlpha],
      [betaId, LEDGER.filmBeta],
      [dividedId, LEDGER.filmDivided],
    ],
  }
}

// ── scenario definitions: cut + per-scenario machine assertions ──────────────

type ScenarioFixture = {
  scenarioId: string
  week: number
  state: GameState
  normalization: Array<{ from: string; to: string; occurrences: number }>
  derivation: string[]
  assertions: string[]
}

function buildFixtures(): ScenarioFixture[] {
  const { cuts, renames } = walkTimeline()

  const normalized: Record<string, ScenarioFixture> = {}
  const derivationBase = [
    `contendedStudio('${SEED}') — founded, economy-engaged, two leader pictures in flight`,
    'commit each leader at Release Ready (the P06A hold law); cuts at the §7 moments',
    'third picture greenlit with an oversized 40,000,000 marketing commitment (divided-response)',
    'scenario 6 only: the twin CONCEPT titles renamed to the ledger twin title (data, not identity)',
  ]
  for (const [label, cutEntry] of Object.entries(cuts)) {
    // A cut is normalized against exactly the identities that EXIST in it —
    // early cuts predate the divided picture's greenlight (the presence law
    // inside normalize() still asserts every applied source occurs).
    const savePreview = exportSaveJson(cutEntry.state)
    const applicable = renames.filter(([from]) => savePreview.includes(from))
    const { state, record } = normalize(cutEntry.state, applicable)
    normalized[label] = {
      scenarioId: `p07-${label}`,
      week: state.market.tick,
      state,
      normalization: record,
      derivation: derivationBase,
      assertions: [],
    }
  }

  const s = (label: string) => normalized[label]!

  // 1 — committed, not released: NO result truth exists anywhere yet.
  {
    const { state, assertions } = s('committed-not-released')
    assertTrue(
      state.releaseAuthority.commitments.some((c) => c.productionId === LEDGER.filmAlpha),
      's1: Alpha commitment exists',
    )
    assertEq(
      state.studio.releasedFilms.some((f) => f.productionId === LEDGER.filmAlpha),
      false,
      's1: Alpha not released',
    )
    assertEq((studioLotSnapshot(state).results ?? []).length, 0, 's1: results projection is EMPTY')
    // §5A anchor: one more tick releases it exactly once.
    const after = tick(state)
    assertEq(
      after.studio.releasedFilms.filter((f) => f.productionId === LEDGER.filmAlpha).length,
      1,
      's1-anchor: tick releases Alpha exactly once',
    )
    assertions.push(
      'zero results on the wire; Alpha committed and unreleased; tick(fixture) releases Alpha exactly once',
    )
  }

  // 2 — newly in theaters: released THIS week, run week 1, projected.
  {
    const { state, assertions } = s('newly-in-theaters')
    const card = cardOf(state, LEDGER.filmAlpha)
    assertTrue(card !== undefined, 's2: Alpha result card on the wire')
    assertEq(card!.runStatus, 'active', 's2: run active')
    // The snapshot week is post-tick: the first moment the player can SEE the
    // release, weeksAgo is 1 (releaseTick = the batch week itself).
    assertEq(card!.weeksAgo, 1, 's2: the release is one snapshot-week old — the newest possible')
    assertEq(card!.projected, true, 's2: business figures projected')
    assertTrue(card!.resultLabel.startsWith('Projected'), 's2: projected result label')
    assertEq(card!.weeksCredited, 1, 's2: first run week credited at release')
    assertions.push(
      'Alpha card: runStatus active, weeksAgo 1 (newest visible), weeksCredited 1, projected, "Projected …" label',
    )
  }

  // 3 — active run, mid-run: truthful week, banked-to-date < totals.
  {
    const { state, assertions } = s('active-run')
    const card = cardOf(state, LEDGER.filmAlpha)!
    assertEq(card.runStatus, 'active', 's3: still active')
    assertTrue(card.weeksCredited >= 3, `s3: mid-run (weeksCredited ${card.weeksCredited})`)
    assertTrue(card.weeksCredited < card.totalWeeks, 's3: not yet complete')
    assertTrue(card.grossPaidToDate < card.boxOfficeGrossTotal, 's3: banked gross < tracking total')
    assertTrue(
      card.studioRevenuePaidToDate < card.studioRevenueTotal,
      's3: banked studio revenue < projected total',
    )
    assertions.push('Alpha mid-run: weeksCredited in [3, totalWeeks), banked-to-date strictly below totals')
  }

  // 4 — divided response: business disagrees with reception, legibly.
  {
    const { state, assertions } = s('divided-response')
    const card = cardOf(state, LEDGER.filmDivided)!
    assertEq(card.runStatus, 'active', 's4: divided picture mid-run')
    assertEq(card.resultLabel, 'Projected loss', 's4: business channel is a projected loss')
    const receptionFavorable =
      ['hit', 'smash'].includes(card.criticBand) || ['liked', 'loved'].includes(card.audienceTier)
    assertTrue(
      receptionFavorable,
      `s4: reception favorable on some channel (criticBand=${card.criticBand}, audienceTier=${card.audienceTier})`,
    )
    assertions.push(
      `divided: resultLabel "Projected loss" while criticBand=${card.criticBand} / audienceTier=${card.audienceTier} — the three channels disagree without contradiction`,
    )
  }

  // 5 — run complete: nothing IN THEATERS, results durable and FINAL.
  {
    const { state, assertions } = s('run-complete')
    assertEq(activeCards(state).length, 0, 's5: no active runs — nothing IN THEATERS')
    for (const id of [LEDGER.filmAlpha, LEDGER.filmBeta] as const) {
      const card = cardOf(state, id)!
      assertEq(card.runStatus, 'completed', `s5: ${id} completed`)
      assertEq(card.projected, false, `s5: ${id} not projected`)
      assertTrue(!card.resultLabel.startsWith('Projected'), `s5: ${id} final label`)
      assertClose(card.grossPaidToDate, card.boxOfficeGrossTotal, `s5: ${id} gross fully banked`)
    }
    assertions.push('both leaders completed: zero active cards, final labels, paid == totals')
  }

  // 6 — same-title twins: one title, two exact identities, two lifecycles.
  {
    const { state, assertions } = s('same-title-twins')
    const twins = (studioLotSnapshot(state).results ?? []).filter(
      (c) => c.title === LEDGER.twinTitle,
    )
    assertEq(twins.length, 2, 's6: exactly two films share the twin title')
    const ids = twins.map((c) => c.id).sort()
    assertEq(ids, [LEDGER.filmAlpha, LEDGER.filmDivided].sort(), 's6: the twins are Alpha + Divided')
    const statuses = twins.map((c) => c.runStatus).sort()
    assertEq(statuses, ['active', 'completed'], 's6: one IN THEATERS, one FILM HISTORY')
    assertions.push(
      'two result cards share the twin title with distinct exact ids; one active, one completed',
    )
  }

  return [
    s('committed-not-released'),
    s('newly-in-theaters'),
    s('active-run'),
    s('divided-response'),
    s('run-complete'),
    s('same-title-twins'),
  ]
}

// ── emission (the P06 idiom, byte-for-byte in shape) ─────────────────────────

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
    sessionId: `p07-oracle-${fixture.scenarioId}`,
    stateRevision: 0,
    currentSaveJson: saveJson,
    savedSaveJson: null,
    journal: [],
  })
  const checkpointJson = encodeBridgeRuntimeCheckpoint(checkpoint)
  const saveName = `s${ordinal}-${fixture.scenarioId}.save.json`
  const checkpointName = `s${ordinal}-${fixture.scenarioId}.checkpoint.json`
  writeFileSync(join(outDir, saveName), saveJson)
  writeFileSync(join(outDir, checkpointName), checkpointJson)
  return {
    ordinal,
    scenarioId: fixture.scenarioId,
    week: fixture.week,
    save: { file: saveName, byteLength: Buffer.byteLength(saveJson), sha256: sha256(saveJson) },
    checkpoint: {
      file: checkpointName,
      byteLength: Buffer.byteLength(checkpointJson),
      sha256: sha256(checkpointJson),
      sessionId: `p07-oracle-${fixture.scenarioId}`,
      schemaId: checkpoint.schemaId,
      stateDigest: checkpoint.currentStateDigest,
    },
    derivation: fixture.derivation,
    idNormalization: fixture.normalization,
    machineAssertions: fixture.assertions,
  }
})

const manifest = {
  fixtureId: 'p07-visual-oracle-v1',
  generator: GENERATOR,
  generatorSourceSha256: sha256(readFileSync(join(repoRoot, GENERATOR), 'utf8')),
  seed: SEED,
  ledger: LEDGER,
  normalizationLaw:
    'Exact-token rewrite onto the P07 fixture ledger, longest-token-first, pre-image counts asserted, target collisions refused, re-imported through importSaveJson; every machine assertion runs on the NORMALIZED state. The ledger identities are not mintable through public seams.',
  fixtures: manifestFixtures,
}
const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`
writeFileSync(join(outDir, 'manifest.json'), manifestJson)

// ── exact-file-set + re-read verification (the house idiom) ──────────────────
const EXPECTED_FILES = [
  'manifest.json',
  ...manifestFixtures.flatMap((entry) => [entry.save.file, entry.checkpoint.file]),
].sort()
const actualFiles = readdirSync(outDir).filter((name) => !name.startsWith('.')).sort()
assertEq(actualFiles, EXPECTED_FILES, 'output directory holds exactly the fixture set')
for (const entry of manifestFixtures) {
  const bytes = readFileSync(join(outDir, entry.save.file), 'utf8')
  assertEq(sha256(bytes), entry.save.sha256, `${entry.save.file} byte identity`)
}

console.log(`[gen-p07-visual-oracle-fixtures] emitted ${manifestFixtures.length} scenarios to ${OUTPUT_DIRECTORY}`)
for (const entry of manifestFixtures) {
  console.log(
    `  s${entry.ordinal} ${entry.scenarioId} week=${entry.week} save=${entry.save.sha256.slice(0, 12)} checkpoint=${entry.checkpoint.sha256.slice(0, 12)}`,
  )
}
