// P14C.4-T0 ONE-OFF MINTER — the genuine outgoing Save V34 corpus for the C.4
// deterministic-replenishment expansion (record 782, amended §6, plus the two
// mid-task coordinator addenda: activeByProfession/activeUnder30/append-only
// continuation facts, and axis Y8 DEEP DEFICIT).
//
// WHY THESE WORLDS EXIST. C.4 is a SOURCE step against the LIVE V34 writer — no
// cohort primitive, no `cohorts` receipt array, nothing C.4 adds exists yet. The
// programme's slice rule (already applied for C.1 at 760/761, for C.2a at
// 774/775): genuine fixtures of the OUTGOING version, minted at its final writer,
// BEFORE any C.4 source change. Record 790 measured eight axes (Y1-Y8) by an
// executable probe; this file BUILDS the reachable, mintable ones and PROVES
// each before a byte is written. (Y6/Y7 are MEASUREMENT ONLY, per the task — no
// fixture corresponds to them.)
//
// C.4's engine identity requirement (782): every `careerLifecycle` fact below is
// produced ENTIRELY by the LIVE, unmodified C.2a engine (773/777) — no cohort
// code exists anywhere in this file or in src/. That is exactly what makes the
// "V34-engine continuation facts" real predictions: C.4 must be byte-identical
// to this engine until the first cohort week's own lifecycle settlement.
//
// THE SIX WORLDS, and the axis each carries (782 R1-R9, 773 D1/D3/D5/D13, plus
// the coordinator's mid-task amendments):
//   1. mid-year               Y1: saved at w % 52 !== 0, holding a retirement in
//                              the CURRENT (incomplete) year window.
//   2. cohort-week             Y2: saved at w = 52k, holding a retirement whose
//                              own cohort week has already passed (no future C.4
//                              cohort could ever replace it).
//   3. all-statuses            Y3: one record in each of announced/finishing_
//                              commitments/retired, >=2 professions; whether any
//                              retired id remains in state.freeAgents.
//   4. null-hollywood          Y4: hollywood === null, ticked past a cohort week
//                              with zero records the whole way (782 R8/D6).
//   5. migrated-chain          Y5: a genuine V33 fixture migrated to V34 (live
//                              migration), ticked past a 52k week, boundaryWeek
//                              > 0, every record post-migration.
//   6. deep-deficit            Y8 (coordinator addendum #2): a purely passive
//                              genesis world ticked to week 2600 with a small
//                              active population across all four film
//                              professions and an empty hiring listing — the
//                              natural clip fixture under the amended sizing
//                              rule (a large deficit-driven request, not a
//                              large retirement-count request).
//
// Every world's provenance carries the PAPER PREDICTIONS this record calls
// "V34-engine continuation facts": continuing the SAVED state under the real,
// unmodified engine to the next TWO 52k weeks, recording (per profession, and
// split into retirements already in the save vs. discovered by continuing) the
// exact retirement-count request 782 R3 would make there, the R3-style 32-clip
// applied to it, PLUS (coordinator addendum #1) each profession's activeCount /
// activeUnder30 at that week (the inputs the AMENDED sizing rule would consume),
// and whether `state.talent` stayed append-only across the whole continuation.
//
// INERT BY DEFAULT, on the 774/775 T0a/T0b pattern: mints only when
// STUDIO_MINT_V34_C4_CORPUS_APPROVED equals the observed head sha.
//
//   STUDIO_MINT_V34_C4_CORPUS_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/p14c4-mint-v34-corpus.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// Every campaign is generated in-process by the repository's own builders, or
// (world 5 only) migrated from the repository's own already-held V33 fixture.
// No Owner save, profile or home-directory file is read.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  applyActions, tick, hiringMarketIds, busyTalentIds, generateWorld,
  LIVE_SAVE_VERSION, exportSave, makeSave, validateSaveV33, validateSaveV34, convertV33ToV34,
} from '../src/core/index.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { CreativeRole, GameState } from '../src/core/index.js'
import { fund } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const OUT_RELATIVE = 'tests/fixtures/p14/genuine-v34-c4-corpus'
const MINTER_RELATIVE = 'tests/p14c4-mint-v34-corpus.test.ts'
const APPROVAL_VARIABLE = 'STUDIO_MINT_V34_C4_CORPUS_APPROVED'
const BRANCH = 'wip/headless-program-20260916-ts'
const SEED = 'p14c4-corpus-01'
const EVIDENCE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
const EXPANSION_RELATIVE = EVIDENCE + '782-c4-replenishment-expansion.md'
const MEASUREMENT_RELATIVE = EVIDENCE + '790-c4-t0-measurement.md'
const V33_MIGRATION_FIXTURE_RELATIVE = 'tests/fixtures/p14/genuine-v33-c2-corpus/genuine-v33-c2-hard-boundary-and-idle-window.json.gz'

const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: REPO_DIR, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytesOf = (relative: string): Buffer => readFileSync(new URL(relative, REPO))

function observedHead(): string {
  try { return git('rev-parse', 'HEAD').trim() } catch { return '' }
}
const HEAD_SHA = observedHead()
const APPROVAL = process.env[APPROVAL_VARIABLE]
const APPROVED = HEAD_SHA !== '' && APPROVAL === HEAD_SHA
if (APPROVAL !== undefined && !APPROVED) {
  console.warn(`[p14c4-mint-corpus] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
}

// ── 782 R3/R4: profession order, no Scientists; the provisional 32 cap. ────────
const FILM_ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']
const COHORT_CAP = 32
// Coordinator addendum: the parent is amending R3's sizing rule towards
// max(0, accepted_p - active_p(W)), raised to >=1 when p has no active person
// under 30, where accepted_p is the genesis worldgen size below. Recorded for
// LABELING only — this file mints no such rule, it only measures its inputs.
const ACCEPTED_GENESIS_SIZES: Record<string, number> = { actor: 40, director: 14, writer: 16, craft: 14 }

function authoredAt(name: string, role: CreativeRole, age: number, i: number) {
  return {
    kind: 'createTalent' as const,
    talent: {
      name, role, age,
      actual: { warmth: 0.1 * i, gravity: -0.1 * i, physicality: 0.2 },
      potentialTier: 'Steady' as const, workEthic: 55,
    },
  }
}

function sign(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft', termWeeks = 208) {
  for (let i = 0; i < 60; i++) {
    const person = hiringMarketIds(state, state.market.tick).map((id) => state.talent.find((p) => p.id === id)).find((p) => p?.role === role)
    if (person !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }] as never), id: person.id }
    state = tick(state)
  }
  throw new Error(`minter: no signable ${role}`)
}

function statusSnapshot(state: GameState) {
  const out: Record<string, Record<string, number>> = { announced: {}, finishing_commitments: {}, retired: {} }
  for (const r of state.careerLifecycle.records) out[r.status]![r.profession] = (out[r.status]![r.profession] ?? 0) + 1
  return out
}

/** 782 R3: retired-in-window per profession + total, for the year ending at `w`. */
function retiredInWindow(state: GameState, w: number) {
  const perRole: Record<string, number> = {}
  let total = 0
  for (const r of state.careerLifecycle.records) {
    if (r.status !== 'retired' || r.retiredWeek === null) continue
    if (r.retiredWeek > w - 52 && r.retiredWeek <= w) { perRole[r.profession] = (perRole[r.profession] ?? 0) + 1; total++ }
  }
  return { perRole, total }
}

/** R3's clip: allotted in profession order, remainder dropped (not carried). */
function clipRequest(perRole: Record<string, number>) {
  let remaining = COHORT_CAP
  const clipped: Record<string, number> = {}
  for (const role of FILM_ROLES) {
    const want = perRole[role] ?? 0
    const take = Math.min(want, remaining)
    clipped[role] = take
    remaining -= take
  }
  const requestedTotal = FILM_ROLES.reduce((s, r) => s + (perRole[r] ?? 0), 0)
  const clippedTotal = FILM_ROLES.reduce((s, r) => s + clipped[r]!, 0)
  return { clipped, requestedTotal, clippedTotal, clippedAway: requestedTotal - clippedTotal }
}

function retiredIdsInFreeAgents(state: GameState): string[] {
  const retiredIds = new Set(state.careerLifecycle.records.filter((r) => r.status === 'retired').map((r) => r.personId))
  return state.freeAgents.filter((id) => retiredIds.has(id))
}

const nextMultipleOf52After = (week: number): number => (Math.floor(week / 52) + 1) * 52

/** Coordinator addendum: per profession, "active" = a talent of that profession
 * with NO `retired` record (announced/finishing/no-record all count as active),
 * counted on the state the tick producing W returns; activeUnder30 is the same
 * set filtered on the materialized `Talent.age` at W. */
function activeByProfession(state: GameState) {
  const retiredIds = new Set(state.careerLifecycle.records.filter((r) => r.status === 'retired').map((r) => r.personId))
  const out: Record<string, { activeCount: number; activeUnder30: number }> = {}
  for (const role of FILM_ROLES) out[role] = { activeCount: 0, activeUnder30: 0 }
  for (const t of state.talent) {
    const bucket = out[t.role]
    if (bucket === undefined || retiredIds.has(t.id)) continue
    bucket.activeCount++
    if (t.age < 30) bucket.activeUnder30++
  }
  return out
}

/** Coordinator addendum: state.talent must stay append-only across the
 * continuation — the SAME ids in the SAME order, with any new ids only at the end. */
function appendOnlyCheck(beforeIds: readonly string[], afterIds: readonly string[]) {
  const prefixMatches = beforeIds.every((id, i) => afterIds[i] === id)
  return { prefixMatches, appendOnly: prefixMatches && afterIds.length >= beforeIds.length, beforeCount: beforeIds.length, afterCount: afterIds.length, newIdsAppended: afterIds.length - beforeIds.length }
}

function windowSplit(state: GameState, w: number, saveWeek: number) {
  const perRole: Record<string, number> = {}
  const perRoleBeforeSave: Record<string, number> = {}
  const perRoleAfterSave: Record<string, number> = {}
  let total = 0, beforeSave = 0, afterSave = 0
  for (const r of state.careerLifecycle.records) {
    if (r.status !== 'retired' || r.retiredWeek === null) continue
    if (r.retiredWeek > w - 52 && r.retiredWeek <= w) {
      perRole[r.profession] = (perRole[r.profession] ?? 0) + 1
      total++
      if (r.retiredWeek <= saveWeek) { beforeSave++; perRoleBeforeSave[r.profession] = (perRoleBeforeSave[r.profession] ?? 0) + 1 }
      else { afterSave++; perRoleAfterSave[r.profession] = (perRoleAfterSave[r.profession] ?? 0) + 1 }
    }
  }
  return { week: w, perRole, total, ...clipRequest(perRole), beforeSave, perRoleBeforeSave, afterSave, perRoleAfterSave, talentLength: state.talent.length }
}

/** "V34-engine continuation facts" (record 790; coordinator addendum #1):
 * continue the SAVED state under the real, unmodified V34 engine (no C.4
 * exists) to the next TWO 52k weeks. */
function continuationFacts(saved: GameState, saveWeek: number) {
  const savedIds = saved.talent.map((t) => t.id)
  const w1 = nextMultipleOf52After(saveWeek)
  const w2 = w1 + 52
  let cont = saved
  cont = advanceTo(cont, w1)
  const at1 = { ...windowSplit(cont, w1, saveWeek), activeByProfession: activeByProfession(cont), appendOnlyFromSave: appendOnlyCheck(savedIds, cont.talent.map((t) => t.id)) }
  cont = advanceTo(cont, w2)
  const at2 = { ...windowSplit(cont, w2, saveWeek), activeByProfession: activeByProfession(cont), appendOnlyFromSave: appendOnlyCheck(savedIds, cont.talent.map((t) => t.id)) }
  return { w1: at1, w2: at2, acceptedGenesisSizes: ACCEPTED_GENESIS_SIZES }
}

/** Every provenance-required fact at the SAVE week itself (tick; hollywood
 * non-null; records by status x profession; talent/freeAgents lengths;
 * hiringMarketIds length; careerLifecycle.boundaryWeek), plus the continuation. */
function coreFacts(state: GameState) {
  const week = state.market.tick
  return {
    tick: week,
    hollywoodNonNull: state.hollywood !== null,
    recordsByStatusAndProfession: statusSnapshot(state),
    talentLength: state.talent.length,
    freeAgentsLength: state.freeAgents.length,
    retiredIdsInFreeAgents: retiredIdsInFreeAgents(state),
    hiringMarketIdsLength: hiringMarketIds(state, week).length,
    careerLifecycleBoundaryWeek: state.careerLifecycle.boundaryWeek,
    continuation: continuationFacts(state, week),
  }
}

function saveFactsOf(state: GameState) {
  const json = exportSave(makeSave(state))
  expect(exportSave(validateSaveV34(JSON.parse(json)))).toBe(json)
  return { json, saveVersion: 34 as const }
}

type Planned = { name: string; state: GameState; axis: string; recipe: Record<string, unknown>; focus: Record<string, unknown> }

describe.skipIf(!APPROVED)('P14C.4-T0: mint the genuine outgoing V34 corpus for the C.4 replenishment expansion', () => {
  it('builds all six worlds, PROVES each axis, and only then writes a byte', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. ──────────────────────────────────────────────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(LIVE_SAVE_VERSION).toBe(34)
    expect(git('status', '--porcelain', '--', 'src/', 'bridge/', 'generated/', 'ui/', 'scripts/',
      'tests/helpers/', 'tests/fixtures/', 'package.json', 'package-lock.json')).toBe('')
    const remoteHead = git('ls-remote', 'origin', BRANCH).trim().split(/\s+/)[0] ?? ''
    const publishedRecoverySha = remoteHead === HEAD_SHA ? HEAD_SHA : null

    const outDir = new URL(OUT_RELATIVE + '/', REPO)
    if (existsSync(outDir)) throw new Error(`Refusing fixture overwrite: ${OUT_RELATIVE} already exists`)

    const buildStart = performance.now()
    const planned: Planned[] = []

    // ── WORLDS 1+2 — Y2 (cohort-week, w=104) then Y1 (mid-year, w=105): ONE
    //    continuous natural-ish history, two save points along it. ───────────
    let base = fund(p13aGeneratedStudio(SEED + '-y1y2'))
    base = applyActions(base, [
      authoredAt('Authored Quick Actor', 'actor', 70, 0),
      authoredAt('Authored Quick Writer', 'writer', 70, 1),
      authoredAt('Authored Quick Craft', 'craft', 70, 2),
    ] as never)
    const world2 = advanceTo(base, 104)
    expect(104 % 52).toBe(0) // Y2: exactly a cohort week
    const world2Window = retiredInWindow(world2, 104)
    expect(world2Window.total).toBeGreaterThan(0) // Y2: a retirement whose own cohort week has passed
    planned.push({
      name: 'genuine-v34-c4-cohort-week', state: world2,
      axis: 'Y2: saved at EXACTLY w = 52*2 = 104, holding a retirement in (52,104] — its own cohort '
        + 'week has already passed, so no future C.4 cohort could ever replace it (measured, not judged).',
      recipe: { builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-y1y2')})) -> createTalent x3 (age 70: actor/writer/craft) -> advanceTo(104)`, actions: ['real createTalent x3', '104 real ticks'] },
      focus: { window: world2Window },
    })
    const world1 = advanceTo(world2, 105)
    expect(105 % 52).not.toBe(0) // Y1: NOT a cohort week
    const world1Window = retiredInWindow(world1, 105)
    expect(world1Window.total).toBeGreaterThan(0) // Y1: a retirement in the CURRENT (incomplete) year
    planned.push({
      name: 'genuine-v34-c4-mid-year', state: world1,
      axis: 'Y1: saved at w = 105 (w % 52 !== 0), holding a retirement in the CURRENT incomplete-year '
        + 'window (52,105] — the exact "first post-migration cohort counts pre-save retirements" shape.',
      recipe: { builder: 'continues world 2 one more real tick, to week 105', actions: ['1 real tick'] },
      focus: { window: world1Window },
    })

    // ── WORLD 3 — Y3: all three statuses simultaneously, >=2 professions;
    //    retired-ids-in-freeAgents measured. ────────────────────────────────
    let w3 = fund(p13aGeneratedStudio(SEED + '-y3'))
    w3 = applyActions(w3, [
      authoredAt('Authored Y3 Actor', 'actor', 70, 0),
      authoredAt('Authored Y3 Writer', 'writer', 70, 1),
      authoredAt('Authored Y3 Craft', 'craft', 70, 2),
    ] as never)
    w3 = applyActions(w3, [authoredAt('Authored Y3 Director', 'director', 70, 3)] as never)
    const directorId = w3.talent.find((t) => t.name === 'Authored Y3 Director')!.id
    w3 = applyActions(w3, [{ kind: 'signContract', talentId: directorId, termWeeks: 400 }] as never)
    const w3w1 = sign(w3, 'writer'); w3 = w3w1.state
    const w3l1 = sign(w3, 'actor'); w3 = w3l1.state
    const w3a1 = sign(w3, 'actor'); w3 = w3a1.state
    const w3s1 = sign(w3, 'actor'); w3 = w3s1.state
    const w3c1 = sign(w3, 'craft'); w3 = w3c1.state
    const concept1 = w3.concepts[0]!
    w3 = applyActions(w3, [{
      kind: 'greenlight', production: {
        conceptId: concept1.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: concept1.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: w3w1.id, directorId, cast: { lead: w3l1.id, antagonist: w3a1.id, support: w3s1.id }, craftIds: [w3c1.id],
        budget: { negative: concept1.baseNegativeCost, marketing: 0 },
      },
    }] as never)
    w3 = applyActions(w3, [authoredAt('Authored Y3 Lead', 'actor', 70, 4)] as never)
    const leadId = w3.talent.find((t) => t.name === 'Authored Y3 Lead')!.id
    w3 = applyActions(w3, [{ kind: 'signContract', talentId: leadId, termWeeks: 208 }] as never)
    const w3d2 = sign(w3, 'director'); w3 = w3d2.state
    const w3w2 = sign(w3, 'writer'); w3 = w3w2.state
    const w3a2 = sign(w3, 'actor'); w3 = w3a2.state
    const w3s2 = sign(w3, 'actor'); w3 = w3s2.state
    const w3c2 = sign(w3, 'craft'); w3 = w3c2.state
    const concept2 = w3.concepts.find((c) => c.id !== concept1.id) ?? w3.concepts[1]
    if (concept2 === undefined) throw new Error('minter: only one concept available for the second Y3 production')
    w3 = applyActions(w3, [{
      kind: 'greenlight', production: {
        conceptId: concept2.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: concept2.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: w3w2.id, directorId: w3d2.id, cast: { lead: leadId, antagonist: w3a2.id, support: w3s2.id }, craftIds: [w3c2.id],
        budget: { negative: concept2.baseNegativeCost, marketing: 0 },
      },
    }] as never)
    w3 = advanceTo(w3, 227)
    const snap3 = statusSnapshot(w3)
    expect(Object.keys(snap3.announced!).length).toBeGreaterThan(0) // Y3: announced present
    expect(Object.keys(snap3.finishing_commitments!).length).toBeGreaterThan(0) // Y3: finishing_commitments present
    expect(Object.keys(snap3.retired!).length).toBeGreaterThan(0) // Y3: retired present
    const professions3 = new Set<string>()
    for (const status of Object.keys(snap3)) for (const role of Object.keys(snap3[status]!)) professions3.add(role)
    expect(professions3.size).toBeGreaterThanOrEqual(2) // Y3: across >=2 professions
    expect(busyTalentIds(w3).has(directorId)).toBe(true) // Y3: the finishing_commitments director is STILL seated
    planned.push({
      name: 'genuine-v34-c4-all-statuses', state: w3,
      axis: 'Y3: saved at week 227 with one record in each of announced / finishing_commitments / '
        + 'retired, across >=2 professions — two authored people seated on separate held-unreleased '
        + 'productions (400wk and 208wk contracts) plus an unseated hard-boundary trio (actor/writer/craft).',
      recipe: {
        builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-y3')})) -> createTalent x5 (age 70 each) `
          + '-> signContract + sign supporting cast x2 -> greenlight x2 (both left unreleased) -> advanceTo(227)',
        actions: ['real createTalent x5', 'real signContract (2 authored + supporting cast via the hiring market)', 'real greenlight x2'],
      },
      focus: { statuses: snap3, professionsRepresented: [...professions3], retiredIdsInFreeAgents: retiredIdsInFreeAgents(w3), seatedNow: { directorId: busyTalentIds(w3).has(directorId), leadId: busyTalentIds(w3).has(leadId) } },
    })

    // ── WORLD 4 — Y4: hollywood === null, ticked past a cohort week, zero
    //    records the whole way (782 R8 / 773 D6). ──────────────────────────
    const bare = generateWorld(SEED + '-y4')
    expect(bare.hollywood).toBeNull() // Y4: the lawful null-hollywood constructor
    expect(bare.careerLifecycle).toEqual({ boundaryWeek: 0, records: [] })
    let w4 = tick(bare) // Y4: a bare (pre-founding) V34 state DOES tick
    w4 = advanceTo(w4, 208)
    expect(w4.hollywood).toBeNull() // still null after 208 real ticks
    expect(w4.careerLifecycle.records.length).toBe(0) // 773 D6: the lifecycle never engages while null
    planned.push({
      name: 'genuine-v34-c4-null-hollywood', state: w4,
      axis: 'Y4: generateWorld(seed) directly (pre-founding — no activateStudioOperations/'
        + 'initializeHollywood), ticked 208 real weeks (past cohort week 52*4=208) with hollywood === '
        + 'null and zero careerLifecycle records the entire way — 782 R8/773 D6 predicts NO cohort will '
        + 'ever fire here.',
      recipe: { builder: `generateWorld(${JSON.stringify(SEED + '-y4')}) -> tick() once -> advanceTo(208)`, actions: ['1 real tick (bare pre-founding state)', '207 more real ticks'] },
      focus: { recordCountAtEveryCheckpoint: 0 },
    })

    // ── WORLD 5 — Y5: a genuine V33 fixture migrated to V34 (live migration),
    //    ticked past a 52k week, boundaryWeek > 0, every record post-migration. ─
    const v33Raw = JSON.parse(gunzipSync(bytesOf(V33_MIGRATION_FIXTURE_RELATIVE)).toString('utf8'))
    const v33 = validateSaveV33(v33Raw)
    const migrationWeek = v33.state.market.tick
    const v34 = convertV33ToV34(v33)
    const boundaryWeek = v34.state.careerLifecycle.boundaryWeek
    expect(boundaryWeek).toBe(migrationWeek) // 773 D13: the root opens at boundaryWeek = migration tick
    expect(boundaryWeek).toBeGreaterThan(0) // Y5's own requirement
    let w5 = v34.state as unknown as GameState
    w5 = advanceTo(w5, migrationWeek + 208)
    expect(w5.careerLifecycle.records.length).toBeGreaterThan(0) // Y5: post-migration records exist
    const postMigrationRecords5 = w5.careerLifecycle.records.filter((r) => r.announcedWeek >= boundaryWeek)
    expect(postMigrationRecords5.length).toBe(w5.careerLifecycle.records.length) // every record is post-migration (773 D13: none dated before the boundary)
    planned.push({
      name: 'genuine-v34-c4-migrated-chain', state: w5,
      axis: `Y5: ${V33_MIGRATION_FIXTURE_RELATIVE} (a genuine V33 C.2a fixture, week ${migrationWeek}), `
        + `migrated V33->V34 via the LIVE migration (convertV33ToV34; boundaryWeek = ${boundaryWeek}), then `
        + `ticked 208 more real weeks (past two 52k weeks) — every careerLifecycle record dated at or `
        + 'after the boundary, none invented at migration (773 D13).',
      recipe: { builder: `validateSaveV33(gunzip(readFileSync(${JSON.stringify(V33_MIGRATION_FIXTURE_RELATIVE)}))) -> convertV33ToV34 -> advanceTo(migrationWeek + 208)`, actions: ['real convertV33ToV34 (the live migration)', '208 real ticks'] },
      focus: { migrationWeek, boundaryWeek, postMigrationRecordCount: postMigrationRecords5.length },
    })

    // ── WORLD 6 — Y8 (coordinator addendum #2): DEEP DEFICIT. A purely passive
    //    genesis world (NO player action; fund() NOT called, following 775 world
    //    2's precedent) ticked to week 2600 (itself 52*50). ────────────────────
    const y8BuildStart = performance.now()
    let w6 = advanceTo(p13aGeneratedStudio('p14c4-demo-01'), 2600)
    const y8BuildMs = performance.now() - y8BuildStart
    expect(y8BuildMs).toBeLessThanOrEqual(90_000) // the addendum's own time gate
    const active6 = activeByProfession(w6)
    for (const role of FILM_ROLES) expect(active6[role]!.activeCount).toBeGreaterThan(0) // active in every film profession
    const totalActive6 = FILM_ROLES.reduce((s, r) => s + active6[r]!.activeCount, 0)
    expect(totalActive6).toBeLessThan(20) // a genuine DEEP deficit against the accepted genesis sizes (total 84)
    expect(hiringMarketIds(w6, 2600).length).toBe(0) // the hiring listing is empty
    planned.push({
      name: 'genuine-v34-c4-deep-deficit', state: w6,
      axis: `Y8 (coordinator addendum #2): p13aGeneratedStudio('p14c4-demo-01') with NO player action `
        + `(fund() NOT called — no cash/ledger bootstrap was needed, matching 775 world 2's precedent `
        + `for a passive tick-only world), ticked to week 2600 (itself a cohort week, 52*50). Active `
        + `population (not-retired) is ${totalActive6} across all four film professions against the `
        + `accepted genesis sizes (actor 40/director 14/writer 16/craft 14 = 84 total) — the natural `
        + 'clip fixture for the AMENDED sizing rule (a large deficit-driven request), distinct from a '
        + 'large retirement-COUNT request.',
      recipe: { builder: "advanceTo(p13aGeneratedStudio('p14c4-demo-01'), 2600)", actions: ['2600 real ticks, no player action, fund() not called'] },
      focus: { buildMs: y8BuildMs, activeByProfession: active6, totalActive: totalActive6, hiringMarketIdsLength: 0 },
    })

    const worldBuildMs = performance.now() - buildStart
    expect(planned.length).toBe(6)
    expect(new Set(planned.map((p) => p.name)).size).toBe(6)

    // ── 2. Save every world at the LIVE V34 writer, round-trip IN MEMORY, and
    //    compute every provenance-required fact (including the continuation). ──
    const prepared = planned.map((p) => {
      const { json: saveJson } = saveFactsOf(p.state)
      const rawBytes = Buffer.from(saveJson, 'utf8')
      const compressed = gzipSync(rawBytes)
      if (gunzipSync(compressed).toString('utf8') !== saveJson) throw new Error(`${p.name}: gzip round trip is not byte-stable in memory`)
      const core = coreFacts(p.state)
      return {
        plan: p, saveJson, compressed, core,
        facts: {
          filename: p.name + '.json.gz', provenanceFilename: p.name + '.provenance.json',
          week: p.state.market.tick, saveVersion: 34, uncompressedSha256: sha(rawBytes), compressedSha256: sha(compressed),
          byteLength: rawBytes.byteLength, compressedByteLength: compressed.byteLength, axis: p.axis, focus: p.focus,
        },
      }
    })

    const authority = {
      phase: 'P14C.4 T0 / the genuine outgoing Save V34 corpus for the C.4 deterministic-replenishment '
        + 'expansion, minted at the FINAL V34 writer before any C.4 source change',
      headSha: HEAD_SHA, publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: git ls-remote origin ' + BRANCH + ' did not return the minting head.'
        : 'PUBLISHED: git ls-remote origin ' + BRANCH + ' returned the minting head at mint time.',
      expansionRelativePath: EXPANSION_RELATIVE, expansionSha256: sha(bytesOf(EXPANSION_RELATIVE)),
      measurementRelativePath: MEASUREMENT_RELATIVE, measurementSha256: sha(bytesOf(MEASUREMENT_RELATIVE)),
      saveVersion: LIVE_SAVE_VERSION, approvalEnvironmentVariable: APPROVAL_VARIABLE, outputRelativePath: OUT_RELATIVE,
      cohortCapAssumed: COHORT_CAP, acceptedGenesisSizes: ACCEPTED_GENESIS_SIZES, filmRoles: FILM_ROLES,
      predictionMethodNote: '"V34-engine continuation facts": continuationFacts (this file) continues the '
        + 'SAVED state under the real, unmodified V34/C.2a engine (no C.4 code anywhere in this repository) '
        + 'to the next TWO 52k weeks via real advanceTo()/tick() calls — never a hand-rolled formula. It is a '
        + 'measured prediction under 782 R3 (as amended) and 773 D3/D5/D13, not an implementation output: no '
        + '`cohorts` receipt or cohort primitive exists anywhere in this corpus. C.4 must be byte-identical to '
        + 'this same engine until the first cohort week\'s own lifecycle settlement — that identity is what '
        + 'makes these continuation facts real predictions rather than post-hoc narration.',
    }
    const sharedProvenance = {
      authority, observedHeadSha: HEAD_SHA, minterRelativePath: MINTER_RELATIVE, minterSha256: sha(bytesOf(MINTER_RELATIVE)),
      minterArchivedRelativePath: EVIDENCE + '791-mint-v34-c4-corpus-minter.test.ts',
      minterReproduction: 'Archived at minterArchivedRelativePath and removed from tests/, so no suite '
        + 'collects it. Reproducing requires copying the archived bytes back to ' + MINTER_RELATIVE
        + ' before running the recorded command.',
      nodeVersion: process.version, startedAt, worldBuildMs,
      command: `${APPROVAL_VARIABLE}=${HEAD_SHA} node_modules/.bin/vitest run ${MINTER_RELATIVE} --minWorkers=1 --maxWorkers=1`,
      campaign: 'generated test campaign (world 5: migrated from the repository\'s own held V33 fixture); never an Owner save',
      scope: 'genuine OUTGOING V34 worlds spanning the six measured/minted C.4 corpus axes (Y1-Y5, Y8); no '
        + 'cohort primitive, no `cohorts` receipt, no native and no Owner acceptance claim',
    }

    // ── 3. Write. ────────────────────────────────────────────────────────────
    mkdirSync(outDir)
    for (const p of prepared) {
      writeFileSync(new URL(p.facts.filename, outDir), p.compressed, { flag: 'wx' })
      writeFileSync(new URL(p.facts.provenanceFilename, outDir), JSON.stringify({
        ...sharedProvenance, endedAt: new Date().toISOString(),
        recipe: { ...p.plan.recipe, compression: 'node:zlib gzipSync with library defaults' }, ...p.facts, core: p.core,
      }, null, 2) + '\n', { flag: 'wx' })
    }
    writeFileSync(new URL('MANIFEST.json', outDir), JSON.stringify({ authority, fixtures: prepared.map((p) => ({ ...p.facts, core: p.core })) }, null, 2) + '\n', { flag: 'wx' })

    // ── 4. Re-read from DISK and prove the artifacts, not the in-memory values. ─
    const emitted: unknown[] = []
    for (const p of prepared) {
      const onDisk = readFileSync(new URL(p.facts.filename, outDir))
      expect(sha(onDisk)).toBe(p.facts.compressedSha256)
      const reread = gunzipSync(onDisk).toString('utf8')
      if (reread !== p.saveJson) throw new Error(`${p.facts.filename}: gzip round trip is not byte-stable on disk`)
      const rereadSave = validateSaveV34(JSON.parse(reread))
      expect(exportSave(rereadSave)).toBe(reread)
      emitted.push({ path: `${OUT_RELATIVE}/${p.facts.filename}`, sha256: p.facts.compressedSha256, byteLength: p.facts.compressedByteLength, axis: p.plan.name })
    }
    // Re-derive the sharpest axis facts from the RE-READ state, not memory.
    const world4OnDisk = validateSaveV34(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v34-c4-null-hollywood.json.gz', outDir))).toString('utf8')))
    expect(world4OnDisk.state.hollywood).toBeNull()
    expect((world4OnDisk.state as unknown as GameState).careerLifecycle.records.length).toBe(0)
    const world5OnDisk = validateSaveV34(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v34-c4-migrated-chain.json.gz', outDir))).toString('utf8')))
    expect((world5OnDisk.state as unknown as GameState).careerLifecycle.boundaryWeek).toBe(boundaryWeek)
    const world6OnDisk = validateSaveV34(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v34-c4-deep-deficit.json.gz', outDir))).toString('utf8')))
    expect(hiringMarketIds(world6OnDisk.state as unknown as GameState, 2600).length).toBe(0)

    console.log(JSON.stringify({ emitted, publishedRecoverySha, headSha: HEAD_SHA }, null, 2))
    assert.equal(emitted.length, 6)
  }, 900_000)
})
