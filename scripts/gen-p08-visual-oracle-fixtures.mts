// ── P08A W4 — deterministic Visual Oracle fixtures for Standing & Studio History ──
//
// Copy-adapt of scripts/gen-p07-visual-oracle-fixtures.mts (same emission
// idiom, same normalization law, same checkpoint format), one package on.
// EIGHT P08 scenarios — charter P08 §13's fixture families:
//
//   1. p08-recording-just-begun   — a founded, engaged studio with recording
//                                   begun at week 0: three channels, no
//                                   material receipts yet, no absence notice.
//   2. p08-release-divergent      — the first release moved the three channels
//                                   in DIFFERENT directions (release receipt with
//                                   non-uniform delta signs).
//   3. p08-publicity              — a Whisper campaign: one publicity receipt with
//                                   its cost/lift reason line.
//   4. p08-weekly-settling        — 110+ weeks: routine settling receipts, at least
//                                   one FOLDED summary, unfolded routine detail
//                                   bounded by the 52-week window.
//   5. p08-sparse-timeline        — landmark / major / standard rows side by side;
//                                   routine settling absent from the timeline.
//   6. p08-same-title-twins       — two released films share a TITLE, never an id.
//   7. p08-no-current-location    — a credited lead released from contract: still
//                                   in the People index, no current lot body.
//   8. p08-old-save-not-recorded  — a V16 save migrated mid-campaign: the absence
//                                   notice, a film released BEFORE the boundary
//                                   shows "Not recorded", one released after is
//                                   recorded.
//
// ONE deterministic timeline (all cuts share the seed); scenario 6 adds the
// documented title surgery (titles are data, ids are identity); scenario 8 adds
// the documented V16 strip-and-migrate (the exact law an old save takes).
// Every scenario runs its own machine assertions HERE on the NORMALIZED state,
// through the SHIPPED projection (bridge/history.ts) — never a re-derivation.

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, makeSaveV16, tick } from '../src/core/index.ts'
import type { GameState } from '../src/core/index.ts'
import { exportSaveJson, importSaveJson } from '../ui/src/engine/adapter.ts'
import { historyProjection } from '../bridge/history.ts'
import {
  createBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { contendedStudio } from '../tests/_m4Fixtures.ts'

const GENERATOR = 'scripts/gen-p08-visual-oracle-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/p08-visual-oracle-v1'
const SEED = 'p08-visual-oracle-v1'

// ── P08 ledger ───────────────────────────────────────────────────────────────
const LEDGER = {
  filmAlpha: 'prod-0800', // first leader: released first, the divergent release receipt
  filmBeta: 'prod-0801', // second leader
  departedLead: 't-act-0800', // Alpha's captured lead, released from contract (scenario 7)
  twinTitle: 'The Long Exposure', // the deliberately-shared visible title (scenario 6)
} as const

// ── helpers (shape copied from gen-p07-visual-oracle-fixtures.mts) ───────────

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

function fail(message: string): never {
  throw new Error(`gen-p08-visual-oracle-fixtures: ${message}`)
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) fail(`${label}: expected ${b}, got ${a}`)
}

function assertTrue(condition: boolean, label: string): void {
  if (!condition) fail(label)
}

/** Drive shooting decisions for EXACTLY the named productions this week (P05/P06/P07 idiom). */
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

/** THE ONE NORMALIZATION — byte-exact copy of the P06/P07 law. */
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

const sign = (value: number): -1 | 0 | 1 => (value > 1e-9 ? 1 : value < -1e-9 ? -1 : 0)

/** The three delta signs of a receipt are NOT all identical (divergent channels). */
function divergent(deltas: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }): boolean {
  const signs = new Set([sign(deltas.audienceAwareness), sign(deltas.industryPrestige), sign(deltas.commercialConfidence)])
  return signs.size >= 2
}

// ── the one timeline ─────────────────────────────────────────────────────────

type Cut = { label: string; state: GameState; week: number }

function walkTimeline(): { cuts: Record<string, Cut>; renames: Rename[]; notes: string[] } {
  const { state: start, productionIds } = contendedStudio(SEED)
  const [alphaId, betaId] = productionIds as [string, string]
  const cuts: Record<string, Cut> = {}
  const notes: string[] = []
  let next = start

  const cut = (label: string, state: GameState) => {
    cuts[label] = { label, state, week: state.market.tick }
  }

  // 1 — RECORDING JUST BEGUN: the engaged studio at the walk's start.
  cut('recording-just-begun', start)
  // The old-save scenario needs a pre-release state (both leaders release in
  // the same week on this timeline): remember the last state with NO release.
  let lastUnreleased: GameState = start

  // Drive both leaders to release; commit at Release Ready (the P06A hold law).
  let publicityDone = false
  const seenReleaseReceipts = new Set<number>()
  for (let week = 0; week < 60 && cuts['sparse-timeline'] === undefined; week++) {
    // The old-save seed is the last state with NO release and NO commitment
    // (both leaders reach Release Ready the same week on this seed; the old
    // era below commits Alpha alone and leaves Beta held, per the P06A law).
    if (next.studio.releasedFilms.length === 0 && next.releaseAuthority.commitments.length === 0)
      lastUnreleased = next
    next = driveTakes(next, productionIds)
    for (const id of productionIds) {
      const production = next.studio.activeProductions.find((p) => p.id === id)
      if (production === undefined || production.remainingTicks !== 1) continue
      if (next.releaseAuthority.commitments.some((c) => c.productionId === id)) continue
      next = applyActions(next, [{ kind: 'commitPictureToRelease', productionId: id }])
    }
    next = tick(next)

    // 2 — RELEASE-DRIVEN DIVERGENT CHANNELS: the first NEW release receipt
    //     (a receipt minted inside tick() carries the week it happened in,
    //     one less than the post-tick clock) whose three deltas do not share
    //     one sign.
    if (cuts['release-divergent'] === undefined) {
      const projection = historyProjection(next)
      const release = projection.standing.receipts.find(
        (r) => r.sourceKind === 'releaseResult' && !seenReleaseReceipts.has(r.eventId) && divergent(r.deltas),
      )
      for (const r of projection.standing.receipts)
        if (r.sourceKind === 'releaseResult') seenReleaseReceipts.add(r.eventId)
      if (release !== undefined) {
        cut('release-divergent', next)
        notes.push(
          `release-divergent: ${release.sourceId} deltas A ${release.deltas.audienceAwareness.toFixed(2)} / P ${release.deltas.industryPrestige.toFixed(2)} / C ${release.deltas.commercialConfidence.toFixed(2)}`,
        )
      }
    }

    // 3 — PUBLICITY: one Whisper campaign the week after the first release.
    if (!publicityDone && cuts['release-divergent'] !== undefined && next.studio.releasedFilms.length >= 1) {
      next = applyActions(next, [{ kind: 'publicity', tier: 'whisper' }])
      publicityDone = true
      cut('publicity', next)
    }

    // 5 — SPARSE TIMELINE: both leaders released and settled, publicity recorded.
    if (
      publicityDone &&
      runOf(next, alphaId)?.status === 'completed' &&
      runOf(next, betaId)?.status === 'completed'
    ) {
      cut('sparse-timeline', next)
    }
  }
  for (const required of ['release-divergent', 'publicity', 'sparse-timeline'])
    if (cuts[required] === undefined) fail(`timeline never reached the "${required}" cut`)

  // 6 — SAME-TITLE TWINS: the ONE documented data surgery on the settled state.
  {
    const settled = cuts['sparse-timeline']!.state
    const alphaFilm = settled.studio.releasedFilms.find((f) => f.productionId === alphaId)!
    const betaFilm = settled.studio.releasedFilms.find((f) => f.productionId === betaId)!
    const twins: GameState = {
      ...settled,
      concepts: settled.concepts.map((concept) =>
        concept.id === alphaFilm.conceptId || concept.id === betaFilm.conceptId
          ? { ...concept, title: LEDGER.twinTitle }
          : concept,
      ),
    }
    cut('same-title-twins', twins)
  }

  // 7 — NO CURRENT LOCATION: Alpha's captured lead is released from contract
  //     (D-11.9, the accepted early-release action; termination cost paid from
  //     real cash). The person stays in the People index with credits intact
  //     and no lot body to Locate.
  const settledState = cuts['sparse-timeline']!.state
  const alphaFilm = settledState.studio.releasedFilms.find((f) => f.productionId === alphaId)!
  if (alphaFilm.participants === undefined) fail('Alpha has no captured participants')
  const leadId = alphaFilm.participants.cast.lead.talentId
  {
    let departed = settledState
    try {
      departed = applyActions(departed, [{ kind: 'releaseTalent', talentId: leadId }])
      notes.push(`no-current-location: releaseTalent(${leadId}) at week ${String(departed.market.tick)}`)
    } catch (error) {
      // The accepted action refuses with a named reason when no active contract exists.
      notes.push(`no-current-location: releaseTalent(${leadId}) refused — ${error instanceof Error ? error.message : String(error)}`)
    }
    // One week passes so presence reflects the departure.
    departed = tick(departed)
    cut('no-current-location', departed)
  }

  // 4 — WEEKLY SETTLING: keep the settled studio ticking (no new pictures) until
  //     the first routine fold exists (bucket 0 = weeks 0–51 folds once the
  //     week passes 103) and a bounded unfolded window remains.
  {
    let settling = settledState
    for (let guard = 0; guard < 200 && settling.market.tick < 112; guard++) settling = tick(settling)
    cut('weekly-settling', settling)
  }

  // 8 — OLD SAVE, NOT RECORDED: an old campaign that already released ONE
  //     picture before P08 existed. Built honestly from the timeline: the last
  //     pre-release state is stripped to a V16 save (exactly what an old save
  //     is) and, in the SAME V16 world, driven until Alpha has released — then
  //     imported through the shipped migration (recording begins at the
  //     migration week; nothing reconstructed) and driven forward so Beta
  //     releases AFTER the boundary. Because both leaders reach Release Ready
  //     the same week on this seed, Beta's commitment is withheld until after
  //     the migration so its release lands inside the recorded era.
  {
    // Rebuild the pre-P08 era: strip to V16 FIRST so no history root exists
    // while Alpha releases (the V16 twin has no studioHistory to record into).
    const v16Seed = JSON.stringify(makeSaveV16(lastUnreleased))
    const seeded = importSaveJson(v16Seed)
    if (!seeded.ok) fail(`V16 strip failed: ${seeded.error}`)
    // importSaveJson migrates to V17 immediately; to model the OLD era we run
    // the V16 projection forward through makeSaveV16 at every step, which is
    // exactly what an old build's saves contain (no studioHistory at all).
    let old: GameState = seeded.state
    for (let week = 0; week < 40 && !old.studio.releasedFilms.some((f) => f.productionId === alphaId); week++) {
      old = driveTakes(old, productionIds)
      const production = old.studio.activeProductions.find((p) => p.id === alphaId)
      if (production !== undefined && production.remainingTicks === 1 &&
          !old.releaseAuthority.commitments.some((c) => c.productionId === alphaId))
        old = applyActions(old, [{ kind: 'commitPictureToRelease', productionId: alphaId }])
      old = tick(old)
    }
    if (!old.studio.releasedFilms.some((f) => f.productionId === alphaId)) fail('old era never released Alpha')
    const v16 = JSON.stringify(makeSaveV16(old))
    const migrated = importSaveJson(v16)
    if (!migrated.ok) fail(`V16 strip-and-migrate failed: ${migrated.error}`)
    let forward = migrated.state
    for (let week = 0; week < 60 && runOf(forward, betaId)?.status !== 'completed'; week++) {
      forward = driveTakes(forward, productionIds)
      const production = forward.studio.activeProductions.find((p) => p.id === betaId)
      if (production !== undefined && production.remainingTicks === 1 &&
          !forward.releaseAuthority.commitments.some((c) => c.productionId === betaId))
        forward = applyActions(forward, [{ kind: 'commitPictureToRelease', productionId: betaId }])
      forward = tick(forward)
    }
    cut('old-save-not-recorded', forward)
  }

  return {
    cuts,
    renames: [
      [alphaId, LEDGER.filmAlpha],
      [betaId, LEDGER.filmBeta],
      [leadId, LEDGER.departedLead],
    ],
    notes,
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

function buildFixtures(): { fixtures: ScenarioFixture[]; notes: string[] } {
  const { cuts, renames, notes } = walkTimeline()

  const normalized: Record<string, ScenarioFixture> = {}
  const derivationBase = [
    `contendedStudio('${SEED}') — founded, economy-engaged, two leader pictures in flight`,
    'commit each leader at Release Ready (the P06A hold law); cuts at the P08 §13 moments',
    'one Whisper publicity campaign the week after the first divergent release',
    'scenario 6 only: the two leader CONCEPT titles renamed to the ledger twin title (data, not identity)',
    "scenario 7 only: releaseTalent on Alpha's captured lead (D-11.9; termination cost paid from real cash)",
    'scenario 8 only: the last pre-release state stripped to a V16 save (makeSaveV16), Alpha released in that stripped world, stripped again and re-imported through the shipped migration; Beta committed only after the boundary',
  ]
  for (const [label, cutEntry] of Object.entries(cuts)) {
    const savePreview = exportSaveJson(cutEntry.state)
    const applicable = renames.filter(([from]) => savePreview.includes(from))
    const { state, record } = normalize(cutEntry.state, applicable)
    normalized[label] = {
      scenarioId: `p08-${label}`,
      week: state.market.tick,
      state,
      normalization: record,
      derivation: derivationBase,
      assertions: [],
    }
  }

  const s = (label: string) => normalized[label]!
  const H = (state: GameState) => historyProjection(state)

  // 1 — recording just begun.
  {
    const { state, assertions } = s('recording-just-begun')
    const h = H(state)
    assertEq(h.recordingStartedWeek, 0, 's1: recording began at week 0')
    assertEq(h.notRecordedNotice, null, 's1: no absence notice')
    assertEq(h.standing.channels.length, 3, 's1: three channels')
    assertEq(
      h.standing.receipts.filter((r) => r.sourceKind !== 'awarenessDrift' && r.sourceKind !== 'settled').length,
      0,
      's1: no material Standing receipt yet',
    )
    assertEq(h.films.length, 0, 's1: no released film')
    assertions.push(
      `three channels, recording since week 0, ${String(h.standing.receipts.length)} routine receipt(s), ${String(h.timeline.length)} timeline row(s), no absence notice`,
    )
  }

  // 2 — release-driven divergent channels.
  {
    const { state, assertions } = s('release-divergent')
    const h = H(state)
    const release = [...h.standing.receipts].reverse().find((r) => r.sourceKind === 'releaseResult' && r.filmId === LEDGER.filmAlpha)
    assertTrue(release !== undefined, 's2: a release receipt exists for Alpha')
    assertEq(release!.week, state.market.tick - 1, 's2: the release happened in the week just ticked')
    assertTrue(divergent(release!.deltas), 's2: the release moved the channels in different directions')
    assertEq(release!.filmId, LEDGER.filmAlpha, 's2: the receipt links the exact film')
    assertEq(release!.reasonLines.length, 3, 's2: three driver lines (awareness / prestige / confidence)')
    assertTrue(h.timeline.some((row) => row.kind === 'filmReleased' && row.filmId === LEDGER.filmAlpha), 's2: release milestone')
    assertions.push(
      `release receipt for ${LEDGER.filmAlpha}: deltas A ${release!.deltas.audienceAwareness.toFixed(2)} / P ${release!.deltas.industryPrestige.toFixed(2)} / C ${release!.deltas.commercialConfidence.toFixed(2)} (non-uniform signs), three reason lines`,
    )
  }

  // 3 — publicity.
  {
    const { state, assertions } = s('publicity')
    const h = H(state)
    const publicity = h.standing.receipts.find((r) => r.sourceKind === 'publicity')
    assertTrue(publicity !== undefined, 's3: a publicity receipt exists')
    assertEq(publicity!.week, state.market.tick, 's3: the campaign is this week')
    assertTrue(publicity!.deltas.audienceAwareness > 0, 's3: awareness lifted')
    assertEq(publicity!.deltas.industryPrestige, 0, 's3: prestige untouched by publicity')
    assertEq(publicity!.deltas.commercialConfidence, 0, 's3: confidence untouched by publicity')
    assertTrue(publicity!.reasonLines[0]!.includes('Whisper campaign cost'), 's3: cost/lift reason line')
    assertions.push(`publicity receipt week ${String(publicity!.week)}: awareness ${publicity!.deltas.audienceAwareness.toFixed(2)}, prestige/confidence 0, reason "${publicity!.reasonLines[0]}"`)
  }

  // 4 — weekly settling with a fold.
  {
    const { state, assertions } = s('weekly-settling')
    const h = H(state)
    const folded = h.standing.receipts.filter((r) => r.sourceKind === 'settled')
    const routine = h.standing.receipts.filter((r) => r.sourceKind === 'awarenessDrift')
    assertTrue(state.market.tick >= 104, `s4: past the first fold boundary (week ${String(state.market.tick)})`)
    assertTrue(folded.length >= 1, 's4: at least one folded settling summary')
    // The fold law keeps at most TWO 52-week buckets unfolded (the closed
    // bucket folds only once it is a full window behind the clock), so the
    // unfolded routine detail is bounded by 2 × 52 rows — never unbounded.
    assertTrue(routine.length <= 2 * 52, `s4: unfolded routine detail bounded by two windows (${String(routine.length)})`)
    assertTrue(!h.timeline.some((row) => row.significance === 'routine'), 's4: routine rows never enter the timeline')
    assertions.push(`week ${String(state.market.tick)}: ${String(folded.length)} folded summary(ies) (${folded.map((f) => `${String(f.weekStart)}–${String(f.weekEnd)}×${String(f.count)}`).join(', ')}), ${String(routine.length)} unfolded routine receipts`)
  }

  // 5 — sparse timeline with unequal significance.
  {
    const { state, assertions } = s('sparse-timeline')
    const h = H(state)
    const significances = new Set(h.timeline.map((row) => row.significance))
    assertTrue(significances.has('major'), 's5: a major row (first release)')
    assertTrue(significances.has('standard'), 's5: a standard row')
    assertTrue(!significances.has('routine'), 's5: no routine row in the timeline')
    assertEq(h.films.length, 2, 's5: two released films')
    assertTrue(h.timeline.some((row) => row.kind === 'theatricalRunCompleted'), 's5: a run-complete milestone')
    assertTrue(h.timeline.length < h.standing.receipts.length + h.films.length * 2 + 2, 's5: sparse (bounded by the material sources)')
    assertions.push(`timeline ${String(h.timeline.length)} rows over significances {${[...significances].sort().join(', ')}}; ${String(h.standing.receipts.length)} receipts; 2 films`)
  }

  // 6 — same-title twins.
  {
    const { state, assertions } = s('same-title-twins')
    const h = H(state)
    const twins = h.films.filter((f) => f.title === LEDGER.twinTitle)
    assertEq(twins.length, 2, 's6: exactly two films share the twin title')
    assertEq(twins.map((f) => f.productionId).sort(), [LEDGER.filmAlpha, LEDGER.filmBeta].sort(), 's6: the twins are Alpha + Beta')
    assertTrue(twins.every((f) => f.resultAvailable && f.historyRecorded), 's6: both durable and recorded')
    assertions.push('two film rows share the twin title with distinct exact ids; both durable results, both recorded')
  }

  // 7 — person with no current location.
  {
    const { state, assertions } = s('no-current-location')
    const h = H(state)
    const person = h.people.find((p) => p.talentId === LEDGER.departedLead)
    assertTrue(person !== undefined, 's7: the departed lead is still in the People index')
    assertEq(person!.onLot, false, 's7: no current lot body')
    assertTrue(person!.credits.some((c) => c.productionId === LEDGER.filmAlpha), 's7: credits intact')
    assertTrue(h.people.some((p) => p.onLot), 's7: at least one credited person still on the lot (contrast)')
    assertions.push(`${LEDGER.departedLead} (${person!.roleLabel}): onLot=false, present=${String(person!.present)}, ${String(person!.credits.length)} credit(s); contrast person on the lot exists`)
  }

  // 8 — old save: Not recorded before the boundary.
  {
    const { state, assertions } = s('old-save-not-recorded')
    const h = H(state)
    assertTrue(h.recordingStartedWeek > 0, 's8: recording began after founding')
    assertTrue(h.notRecordedNotice !== null && h.notRecordedNotice.includes(`Week ${String(h.recordingStartedWeek)}`), 's8: the absence sentence names the boundary week')
    const alpha = h.films.find((f) => f.productionId === LEDGER.filmAlpha)
    const beta = h.films.find((f) => f.productionId === LEDGER.filmBeta)
    assertTrue(alpha !== undefined && beta !== undefined, 's8: both films durable')
    assertEq(alpha!.historyRecorded, false, 's8: Alpha (released before the boundary) is Not recorded')
    assertEq(beta!.historyRecorded, true, 's8: Beta (released after the boundary) is recorded')
    assertTrue(!h.standing.receipts.some((r) => r.week < h.recordingStartedWeek), 's8: no receipt before the boundary (nothing backfilled)')
    assertTrue(!h.timeline.some((row) => row.kind === 'studioFounded'), 's8: no reconstructed founding landmark')
    assertions.push(`recording since week ${String(h.recordingStartedWeek)}; notice "${h.notRecordedNotice}"; Alpha historyRecorded=false, Beta historyRecorded=true; zero pre-boundary receipts`)
  }

  return {
    fixtures: [
      s('recording-just-begun'),
      s('release-divergent'),
      s('publicity'),
      s('weekly-settling'),
      s('sparse-timeline'),
      s('same-title-twins'),
      s('no-current-location'),
      s('old-save-not-recorded'),
    ],
    notes,
  }
}

// ── emission (the P06/P07 idiom, byte-for-byte in shape) ─────────────────────

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(repoRoot, OUTPUT_DIRECTORY)
mkdirSync(outDir, { recursive: true })

const { fixtures, notes } = buildFixtures()

const manifestFixtures = fixtures.map((fixture, index) => {
  const ordinal = index + 1
  const saveJson = exportSaveJson(fixture.state)
  const reimport = importSaveJson(saveJson)
  if (!reimport.ok) fail(`${fixture.scenarioId}: emitted save failed re-import`)
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: `p08-oracle-${fixture.scenarioId}`,
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
  const projection = historyProjection(fixture.state)
  return {
    ordinal,
    scenarioId: fixture.scenarioId,
    week: fixture.week,
    save: { file: saveName, byteLength: Buffer.byteLength(saveJson), sha256: sha256(saveJson) },
    checkpoint: {
      file: checkpointName,
      byteLength: Buffer.byteLength(checkpointJson),
      sha256: sha256(checkpointJson),
      sessionId: `p08-oracle-${fixture.scenarioId}`,
      schemaId: checkpoint.schemaId,
      stateDigest: checkpoint.currentStateDigest,
    },
    history: {
      recordingStartedWeek: projection.recordingStartedWeek,
      notRecordedNotice: projection.notRecordedNotice,
      channels: projection.standing.channels.map((c) => ({ key: c.key, value: c.value, recordedChange: c.recordedChange })),
      receipts: projection.standing.receipts.length,
      timeline: projection.timeline.length,
      films: projection.films.map((f) => ({ id: f.productionId, title: f.title, releaseWeek: f.releaseWeek, historyRecorded: f.historyRecorded })),
      people: projection.people.map((p) => ({ id: p.talentId, onLot: p.onLot, present: p.present, credits: p.credits.length })),
    },
    derivation: fixture.derivation,
    idNormalization: fixture.normalization,
    machineAssertions: fixture.assertions,
  }
})

const manifest = {
  fixtureId: 'p08-visual-oracle-v1',
  generator: GENERATOR,
  generatorSourceSha256: sha256(readFileSync(join(repoRoot, GENERATOR), 'utf8')),
  seed: SEED,
  ledger: LEDGER,
  walkNotes: notes,
  normalizationLaw:
    'Exact-token rewrite onto the P08 fixture ledger, longest-token-first, pre-image counts asserted, target collisions refused, re-imported through importSaveJson; every machine assertion runs on the NORMALIZED state through the shipped historyProjection. The ledger identities are not mintable through public seams.',
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

console.log(`[gen-p08-visual-oracle-fixtures] emitted ${manifestFixtures.length} scenarios to ${OUTPUT_DIRECTORY}`)
for (const note of notes) console.log(`  note: ${note}`)
for (const entry of manifestFixtures) {
  console.log(
    `  s${entry.ordinal} ${entry.scenarioId} week=${entry.week} save=${entry.save.sha256.slice(0, 12)} checkpoint=${entry.checkpoint.sha256.slice(0, 12)} receipts=${entry.history.receipts} timeline=${entry.history.timeline}`,
  )
  for (const line of entry.machineAssertions) console.log(`      ${line}`)
}
