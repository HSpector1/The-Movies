// P14C.2-T0 ONE-OFF MINTER — the genuine outgoing Save V33 corpus for the C.2a
// retirement expansion (record 773).
//
// WHY THESE WORLDS EXIST. C.2a is a SOURCE step against the LIVE V33 writer —
// no V34 root, no lifecycle step, nothing C.2a adds exists yet. The programme's
// slice rule (already applied for C.1 at records 760/761): genuine fixtures of
// the OUTGOING version, minted at its final writer, BEFORE any C.2 source
// change. Record 774 measured six axes by an executable probe; this file
// BUILDS the reachable ones and PROVES each before a byte is written.
//
// THE SIX WORLDS, and the axis each carries (record 773 §3 D1/D3/D5/D13):
//   1. hard-boundary-and-idle-window   X1 (all four professions at/past their
//                                       D1 hard boundary) + X2 (natural free
//                                       agents idle in-window, counted per
//                                       profession, anchor week <= w-104)
//   2. rival-in-window                 X3's RIVAL-employment half: a natural
//                                       rival-employed person in-window
//   3. contract-and-case               X3's PLAYER-contract half (D5's
//                                       contract-end branch exercised) + X4
//                                       (an open renewal-window market case)
//                                       + X6 (an open promise on an in-window
//                                       beneficiary)
//   4. seated                          X5 (an in-window person seated in an
//                                       active player production)
//   5. scientist                       X7 (a Scientist aged 60+; D2/D1 give
//                                       Scientists no window, so none of this
//                                       ever announces)
//   6. migrated-legacy                 X8 (the held V32 C.1 corpus fixture,
//                                       migrated to V33 and ticked — carries
//                                       legacy_age_anchor rows, a shape a
//                                       fresh V33 campaign never has)
//
// Every subject minted in an in-window or past-boundary state also carries a
// PAPER PREDICTION (record 774 §"paper prediction"): the next birthday under
// `nextBirthdayWeek`, the age materializing there, and — using ONLY the
// contracts/employment rows ALREADY fixed in this save (never a simulated
// future) — whether D3 would announce there, its cause, and D5's effective
// week. This is a prediction under 773 D3/D5/D13, not an implementation
// output: nothing in this file's V33 saves knows what a RetirementRecord is.
//
// INERT BY DEFAULT, on the T0a/T0b pattern: mints only when
// STUDIO_MINT_V33_C2_CORPUS_APPROVED equals the observed head sha.
//
//   STUDIO_MINT_V33_C2_CORPUS_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/p14c2-mint-v33-corpus.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// Every campaign is generated in-process by the repository's own builders, or
// (world 6 only) migrated from the repository's own already-held V32 fixture.
// No Owner save, profile or home-directory file is read.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions, tick } from '../src/core/index.js'
import { anchorOf, ageAt, nextBirthdayWeek } from '../src/core/aging.js'
import { activeContract, busyTalentIds, hiringMarketIds } from '../src/core/employment.js'
import { rivalEmployment } from '../src/core/hollywood.js'
import { caseForTalent, caseOpenForTalent } from '../src/core/talentMarket.js'
import { PROMISE_RULES_VERSION } from '../src/core/promises.js'
import { RELATIONSHIP_RULES_VERSION } from '../src/core/relationships.js'
import {
  exportSave, LIVE_SAVE_VERSION, makeSave, migrateToV33, validateSaveV33,
} from '../src/core/save.js'
import { advanceTo, p13aGeneratedStudio, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import type { Contract, CreativeRole, GameState, TalentProvenanceRow } from '../src/core/types.js'
import { fund, proposePromise, promiseFor } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const OUT_RELATIVE = 'tests/fixtures/p14/genuine-v33-c2-corpus'
const MINTER_RELATIVE = 'tests/p14c2-mint-v33-corpus.test.ts'
const APPROVAL_VARIABLE = 'STUDIO_MINT_V33_C2_CORPUS_APPROVED'
const BRANCH = 'wip/headless-program-20260916-ts'
const SEED = 'p14c2-corpus-01'
const EVIDENCE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
const EXPANSION_RELATIVE = EVIDENCE + '773-c2-retirement-expansion.md'
const MEASUREMENT_RELATIVE = EVIDENCE + '774-c2-t0-measurement.md'
const V32_CORPUS_MANIFEST_RELATIVE = 'tests/fixtures/p14/genuine-v32-c1-corpus/genuine-v32-authored.json.gz'

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
  console.warn(`[p14c2-mint-corpus] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
}

// ── record 773 §3 D1: the four windows. Scientists have none (D2). ─────────
const WINDOWS: Record<string, { start: number; hard: number }> = {
  actor: { start: 60, hard: 70 },
  director: { start: 65, hard: 75 },
  writer: { start: 65, hard: 75 },
  craft: { start: 62, hard: 72 },
}
type FilmRole = 'actor' | 'director' | 'writer' | 'craft'

function rowOf(state: GameState, id: string): TalentProvenanceRow {
  const row = state.talentProvenance.rows.find((r) => r.personId === id)
  if (row === undefined) throw new Error(`no provenance row for ${id}`)
  return row
}

/** D3's idle test, evaluated at an EXACT week against ALREADY-FIXED contract
 * and employment rows — never a simulated future. */
function isIdle(state: GameState, id: string, week: number): boolean {
  if (rivalEmployment(state, id, week) !== null) return false
  if (activeContract(state, id, week) !== undefined) return false
  if (busyTalentIds(state).has(id)) return false
  if (state.contracts.some((c) => c.talentId === id && c.startWeek < week && c.endWeekExclusive > week - 104)) return false
  return true
}

/**
 * The paper prediction (record 774): walk forward from the CURRENT stored age
 * one birthday at a time via `nextBirthdayWeek`/`ageAt`, testing D3 at each
 * birthday against ONLY the contracts/employment rows already fixed in this
 * save. Stops at the first predicted announcement, or after `maxBirthdays`
 * with none. This is arithmetic over 773 D1/D3/D5 — not a RetirementRecord,
 * not a simulation, and it does not know a lifecycle step exists.
 */
function predictRetirement(state: GameState, id: string, role: FilmRole, maxBirthdays = 40) {
  const w = WINDOWS[role]!
  const row = rowOf(state, id)
  let age = state.talent.find((t) => t.id === id)!.age
  const chain: Record<string, unknown>[] = []
  for (let i = 0; i < maxBirthdays; i++) {
    const week = nextBirthdayWeek(row, age)
    const ageAtBirthday = ageAt(row, week)
    const contract = state.contracts.find((c) => c.talentId === id && c.startWeek <= week && week < c.endWeekExclusive)
    const rival = rivalEmployment(state, id, week)
    const overlapsRecency = state.contracts.some((c) => c.talentId === id && c.startWeek < week && c.endWeekExclusive > week - 104)
    const anchorWeek = anchorOf(row).week
    const idle = contract === undefined && rival === null && !overlapsRecency
    let cause: 'hardBoundary' | 'idleInWindow' | null = null
    if (ageAtBirthday >= w.hard) cause = 'hardBoundary'
    else if (ageAtBirthday >= w.start && anchorWeek <= week - 104 && idle) cause = 'idleInWindow'
    const intervalEndInForce = contract?.endWeekExclusive ?? rival?.terms.endWeekExclusive ?? null
    const effectiveWeek = cause === null ? null : Math.max(week + 52, intervalEndInForce ?? 0)
    const step = {
      birthdayIndex: i, week, age: ageAtBirthday, contractedAtBirthday: contract !== undefined,
      rivalEmployedAtBirthday: rival !== null, overlapsPlayerContractRecencyWindow: overlapsRecency,
      predictedCause: cause, predictedEffectiveWeek: effectiveWeek,
    }
    chain.push(step)
    if (cause !== null) {
      return {
        subjectId: id, role, resolved: true, predictedAnnouncedWeek: week, predictedAge: ageAtBirthday,
        predictedCause: cause, predictedEffectiveWeek: effectiveWeek, chain,
        assumption: '"under 773 D3/D5/D13, not an implementation output" — walks ONLY the '
          + 'contracts/employment rows already fixed in this save forward through successive '
          + 'birthdays; a contract, promise or seat created after the save week would change the '
          + 'real outcome and is exactly what this prediction exists to be falsified by.',
      }
    }
    age = ageAtBirthday
  }
  return {
    subjectId: id, role, resolved: false, chain,
    note: `no announcement predicted within ${maxBirthdays} birthdays using only the intervals already fixed in this save`,
  }
}

function surveyWindows(state: GameState, week: number) {
  const out: Record<string, { atOrPastHard: { id: string; age: number }[]; idleInWindow: { id: string; age: number; anchorWeek: number }[] }> = {}
  for (const role of Object.keys(WINDOWS)) out[role] = { atOrPastHard: [], idleInWindow: [] }
  for (const t of state.talent) {
    const w = WINDOWS[t.role]
    if (w === undefined) continue
    const bucket = out[t.role]!
    if (t.age >= w.hard) bucket.atOrPastHard.push({ id: t.id, age: t.age })
    else if (t.age >= w.start) {
      const anchorWeek = anchorOf(rowOf(state, t.id)).week
      if (anchorWeek <= week - 104 && isIdle(state, t.id, week)) bucket.idleInWindow.push({ id: t.id, age: t.age, anchorWeek })
    }
  }
  return out
}

function surveyRivalInWindow(state: GameState, week: number) {
  const out: Record<string, { id: string; age: number; endWeekExclusive: number }[]> = { actor: [], director: [], writer: [], craft: [] }
  for (const t of state.talent) {
    const w = WINDOWS[t.role]
    if (w === undefined || t.age >= w.hard || t.age < w.start) continue
    const rival = rivalEmployment(state, t.id, week)
    if (rival !== null) out[t.role]!.push({ id: t.id, age: t.age, endWeekExclusive: rival.terms.endWeekExclusive })
  }
  return out
}

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

function saveFactsOf(state: GameState) {
  const json = exportSave(makeSave(state))
  expect(exportSave(validateSaveV33(JSON.parse(json)))).toBe(json)
  return { json, saveVersion: 33 as const }
}

type Planned = { name: string; state: GameState; axis: string; recipe: Record<string, unknown>; focus: Record<string, unknown> }

describe.skipIf(!APPROVED)('P14C.2-T0: mint the genuine outgoing V33 corpus for the C.2a retirement expansion', () => {
  it('builds all six worlds, PROVES each axis, and only then writes a byte', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. ──────────────────────────────────────────────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(LIVE_SAVE_VERSION).toBe(33)
    expect(PROMISE_RULES_VERSION).toBe(4)
    expect(RELATIONSHIP_RULES_VERSION).toBe(1)
    expect(git('status', '--porcelain', '--', 'src/', 'bridge/', 'generated/', 'ui/', 'scripts/',
      'tests/helpers/', 'tests/fixtures/', 'package.json', 'package-lock.json')).toBe('')
    const remoteHead = git('ls-remote', 'origin', BRANCH).trim().split(/\s+/)[0] ?? ''
    const publishedRecoverySha = remoteHead === HEAD_SHA ? HEAD_SHA : null

    const outDir = new URL(OUT_RELATIVE + '/', REPO)
    if (existsSync(outDir)) throw new Error(`Refusing fixture overwrite: ${OUT_RELATIVE} already exists`)

    const buildStart = performance.now()
    const planned: Planned[] = []

    // ── WORLD 1 — X1 (hard boundary, all four professions) + X2 (idle
    //    in-window free agents, natural population, counted per profession). ─
    const roles: FilmRole[] = ['actor', 'director', 'writer', 'craft']
    let w1 = fund(p13aGeneratedStudio(SEED + '-d1'))
    w1 = applyActions(w1, roles.map((role, i) => authoredAt(`Authored Hard ${role}`, role, 70, i)) as never)
    const hardIds = Object.fromEntries(roles.map((role) => [role, w1.talent.find((t) => t.name === `Authored Hard ${role}`)!.id])) as Record<FilmRole, string>
    w1 = advanceTo(w1, 780)
    for (const role of roles) {
      const age = w1.talent.find((t) => t.id === hardIds[role])!.age
      expect(age).toBeGreaterThanOrEqual(WINDOWS[role]!.hard) // X1: at or past the D1 hard boundary
    }
    const survey1 = surveyWindows(w1, 780)
    const idleCounts = Object.fromEntries(roles.map((r) => [r, survey1[r]!.idleInWindow.length]))
    expect(roles.some((r) => idleCounts[r]! > 0)).toBe(true) // X2: at least one profession reachable
    const predictions1: Record<string, unknown> = {}
    for (const role of roles) predictions1[`hard-${role}`] = predictRetirement(w1, hardIds[role]!, role)
    for (const role of roles) {
      for (const hit of survey1[role]!.idleInWindow) predictions1[`idle-${role}-${hit.id}`] = predictRetirement(w1, hit.id, role)
    }
    planned.push({
      name: 'genuine-v33-c2-hard-boundary-and-idle-window',
      state: w1,
      axis: 'X1: four authored people (actor/director/writer/craft), each authored at the [18,70] '
        + 'clamp edge (70) at week 0 and aged by ticking to week 780 — every one at or past their D1 '
        + 'hard boundary. X2: the SAME world\'s natural genesis population surveyed for idle '
        + 'in-window free agents per profession (anchor week <= week-104, no contract/rival/seat, no '
        + 'player contract overlapping [week-104,week]).',
      recipe: {
        builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-d1')})) -> createTalent x4 (age 70 each) -> advanceTo(780)`,
        actions: roles.map((r) => `real createTalent age 70 (${r})`),
      },
      focus: { hardIds, idleCounts, atOrPastHardCounts: Object.fromEntries(roles.map((r) => [r, survey1[r]!.atOrPastHard.length])), survey: survey1, predictions: predictions1 },
    })

    // ── WORLD 2 — X3's RIVAL-employment half: a natural in-window rival hire. ─
    let w2 = advanceTo(p13aGeneratedStudio(SEED + '-d2'), 1040)
    const rivalSurvey = surveyRivalInWindow(w2, 1040)
    const rivalRoles = roles.filter((r) => rivalSurvey[r]!.length > 0)
    expect(rivalRoles.length).toBeGreaterThan(0) // X3-rival: at least one profession reachable
    const predictions2: Record<string, unknown> = {}
    for (const role of rivalRoles) for (const hit of rivalSurvey[role]!) predictions2[`rival-${role}-${hit.id}`] = predictRetirement(w2, hit.id, role)
    planned.push({
      name: 'genuine-v33-c2-rival-in-window',
      state: w2,
      axis: 'X3 (rival half): natural rival-hired people, aged by ticking a fresh world to week 1040, '
        + 'whose CURRENT age falls inside their D1 window while under active rival employment. No '
        + 'authored person and no forced enterRival call — pure natural aging + the engine\'s own '
        + 'rival restaffing over a long run.',
      recipe: { builder: `advanceTo(p13aGeneratedStudio(${JSON.stringify(SEED + '-d2')}), 1040)`, actions: ['1040 real ticks'] },
      focus: { rivalRolesReached: rivalRoles, rivalSurvey, predictions: predictions2, note: rivalRoles.length < roles.length
        ? `not every profession landed a rival-in-window hire in this single world; unreached: ${roles.filter((r) => !rivalRoles.includes(r)).join(', ')}. `
          + 'Record 774 measured other seed/week combinations reaching each of these individually; combining all four into one world was not pursued further within budget.'
        : 'all four professions reached in this one world' },
    })

    // ── WORLD 3 — X3's PLAYER-contract half (D5 contract-end branch) + X4
    //    (an open renewal-window market case) + X6 (an open promise on an
    //    in-window beneficiary). ──────────────────────────────────────────────
    let w3 = fund(p13aGeneratedStudio(SEED + '-b'))
    w3 = applyActions(w3, [
      authoredAt('Authored Contract Actor', 'actor', 65, 0),
      authoredAt('Authored Renewal Director', 'director', 65, 1),
    ] as never)
    const personA = w3.talent.find((t) => t.name === 'Authored Contract Actor')!.id
    const personB = w3.talent.find((t) => t.name === 'Authored Renewal Director')!.id
    w3 = applyActions(w3, [
      { kind: 'signContract', talentId: personA, termWeeks: 208 },
      { kind: 'signContract', talentId: personB, termWeeks: 52 },
    ] as never)
    const bContractEnd = w3.contracts.find((c) => c.talentId === personB)!.endWeekExclusive
    w3 = advanceTo(w3, bContractEnd - 8) // inside HIRING_RENEWAL_WINDOW_WEEKS (12)
    expect(caseOpenForTalent(w3, personB, w3.market.tick)).toBe(true) // X4: the renewal-window case is open
    w3 = proposePromise(w3, personB) // X6: an open promise attaches to the in-window beneficiary
    w3 = advanceTo(w3, 48)
    const aContract = w3.contracts.find((c) => c.talentId === personA)!
    const aRow = rowOf(w3, personA)
    const aAge = w3.talent.find((t) => t.id === personA)!.age
    const aNextBirthdayPlus52 = nextBirthdayWeek(aRow, aAge) + 52
    expect(aContract.endWeekExclusive).toBeGreaterThan(aNextBirthdayPlus52) // X3: D5's contract-end branch
    expect(WINDOWS.actor!.start <= aAge && aAge < WINDOWS.actor!.hard).toBe(true) // X3 subject stays in-window
    const bAge = w3.talent.find((t) => t.id === personB)!.age
    expect(WINDOWS.director!.start <= bAge && bAge < WINDOWS.director!.hard).toBe(true) // X4 subject in-window
    const bCase = caseForTalent(w3, personB, w3.market.tick)!
    expect(['discovered', 'proposals_open', 'decision_pending']).toContain(bCase.status) // X4: non-terminal
    const bPromise = promiseFor(w3, personB)
    expect(bPromise.outcome).toBeNull() // X6: open (non-terminal)
    planned.push({
      name: 'genuine-v33-c2-contract-and-case',
      state: w3,
      axis: 'X3 (player half): an in-window actor under an active 208-week player contract whose end '
        + '(208) exceeds nextBirthdayWeek+52 (104), exercising D5\'s contract-end branch. X4: an '
        + 'in-window director whose original 52-week contract\'s renewal window is open, producing a '
        + 'non-terminal market case. X6: an open (non-terminal) promise attached to that same '
        + 'in-window director.',
      recipe: {
        builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-b')})) -> createTalent x2 (age 65 each) `
          + '-> signContract (208wk actor, 52wk director) -> advanceTo(contract end - 8) -> proposePromise(director) -> advanceTo(48)',
        actions: ['real createTalent x2', 'real signContract x2', 'real submitProposal + attachPromise via proposePromise'],
      },
      focus: {
        personA, personB, aAge, aContractEnd: aContract.endWeekExclusive, aNextBirthdayPlus52,
        bAge, bCaseStatus: bCase.status, bPromiseId: bPromise.promiseId,
        predictions: { personA: predictRetirement(w3, personA, 'actor'), personB: predictRetirement(w3, personB, 'director') },
      },
    })

    // ── WORLD 4 — X5: an in-window person seated in an active player
    //    production at the save week. ────────────────────────────────────────
    let w4 = fund(p13aGeneratedStudio(SEED + '-c'))
    w4 = applyActions(w4, [authoredAt('Authored Seated Director', 'director', 68, 0)] as never)
    const seatedDirectorId = w4.talent.find((t) => t.name === 'Authored Seated Director')!.id
    w4 = applyActions(w4, [{ kind: 'signContract', talentId: seatedDirectorId, termWeeks: 208 }] as never)
    function signRole(state: GameState, role: 'actor' | 'writer' | 'craft', termWeeks = 208): { state: GameState; id: string } {
      for (let i = 0; i < 60; i++) {
        const person = hiringMarketIds(state, state.market.tick).map((id) => state.talent.find((p) => p.id === id)).find((p) => p?.role === role)
        if (person !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }] as never), id: person.id }
        state = tick(state)
      }
      throw new Error(`minter: no signable ${role}`)
    }
    const writer4 = signRole(w4, 'writer'); w4 = writer4.state
    const lead4 = signRole(w4, 'actor'); w4 = lead4.state
    const antagonist4 = signRole(w4, 'actor'); w4 = antagonist4.state
    const support4 = signRole(w4, 'actor'); w4 = support4.state
    const craft4 = signRole(w4, 'craft'); w4 = craft4.state
    const concept4 = w4.concepts[0]!
    w4 = applyActions(w4, [{
      kind: 'greenlight', production: {
        conceptId: concept4.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept4.genre, intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: writer4.id, directorId: seatedDirectorId,
        cast: { lead: lead4.id, antagonist: antagonist4.id, support: support4.id },
        craftIds: [craft4.id],
        budget: { negative: concept4.baseNegativeCost, marketing: 0 },
      },
    }] as never)
    expect(busyTalentIds(w4).has(seatedDirectorId)).toBe(true) // X5: seated NOW
    const seatedAge = w4.talent.find((t) => t.id === seatedDirectorId)!.age
    expect(WINDOWS.director!.start <= seatedAge && seatedAge < WINDOWS.director!.hard).toBe(true) // X5 subject in-window
    planned.push({
      name: 'genuine-v33-c2-seated',
      state: w4,
      axis: 'X5: an in-window (age 68, window [65,75)) authored director, contracted and then '
        + 'greenlit onto an active player production — seated in busyTalentIds at the save week.',
      recipe: {
        builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-c')})) -> createTalent (director age 68) -> `
          + 'signContract x5 (director + writer + 3 cast + craft) -> greenlight',
        actions: ['real createTalent', 'real signContract x5', 'real greenlight'],
      },
      focus: { seatedDirectorId, seatedAge, week: w4.market.tick, predictions: { seatedDirector: predictRetirement(w4, seatedDirectorId, 'director') } },
    })

    // ── WORLD 5 — X7: a Scientist aged 60+. Scientists have no D1 window
    //    (D2), so structurally none of this ever announces. ─────────────────
    expect(() => applyActions(fund(p13aGeneratedStudio(SEED)), [{
      kind: 'createTalent', talent: {
        name: 'Refused Scientist', role: 'scientist', age: 60,
        actual: { warmth: 0, gravity: 0, physicality: 0 }, potentialTier: 'Steady', workEthic: 50,
      },
    }] as never)).toThrow(/not a valid CreativeRole/) // X7 structural check: createTalent refuses 'scientist'
    let w5 = p13aResearchReady()
    const scientistId = w5.talent.find((t) => t.role === 'scientist')!.id
    w5 = advanceTo(w5, w5.market.tick + 260)
    const scientistAge = w5.talent.find((t) => t.id === scientistId)!.age
    expect(scientistAge).toBeGreaterThanOrEqual(60) // X7: reached 60+
    expect(WINDOWS.scientist).toBeUndefined() // X7: no window for this role
    planned.push({
      name: 'genuine-v33-c2-scientist',
      state: w5,
      axis: 'X7: a Scientist (recruited via the accepted p13aResearchReady harness route) aged past '
        + '60 by ticking. D1 assigns Scientists no window and D2 is explicit that none may announce '
        + 'until a future tuning decision; createTalent independently REFUSES role "scientist" '
        + '("not a valid CreativeRole"), confirmed above before this world was built.',
      recipe: {
        builder: 'p13aResearchReady() (src/harness/p13a/fixtures.ts, an existing accepted harness '
          + 'builder) -> advanceTo(tick + 260)',
        actions: ['laboratory slice', 'installAcousticInstruments', 'advanceTo(260)', 'real recruitScientist',
          'real assignResearchScientist', 'advanceTo(+260 more)'],
      },
      focus: { scientistId, scientistAge, week: w5.market.tick, createTalentScientistRefused: true },
    })

    // ── WORLD 6 — X8: the held V32 C.1 corpus fixture, migrated to V33 and
    //    ticked. Carries legacy_age_anchor rows — a shape a fresh V33 campaign
    //    never has (worlds 1-5 above are all authored_exact_week at genesis). ─
    const v32Raw = JSON.parse(gunzipSync(bytesOf(V32_CORPUS_MANIFEST_RELATIVE)).toString('utf8'))
    let w6 = migrateToV33(v32Raw).state as GameState
    const kindsAtMigration = [...new Set(w6.talentProvenance.rows.map((r) => r.kind))]
    expect(kindsAtMigration).toEqual(['legacy_age_anchor']) // X8: the migration shape
    const boundaryWeek = w6.talentProvenance.boundaryWeek
    w6 = advanceTo(w6, w6.market.tick + 260)
    const kindsAfterTicks = [...new Set(w6.talentProvenance.rows.map((r) => r.kind))]
    expect(kindsAfterTicks).toContain('legacy_age_anchor') // X8: still present after ticking
    planned.push({
      name: 'genuine-v33-c2-migrated-legacy',
      state: w6,
      axis: `X8: ${V32_CORPUS_MANIFEST_RELATIVE}, migrated V32->V33 (every person becomes a `
        + 'legacy_age_anchor row, boundaryWeek = the migration week), then ticked 260 more weeks. A '
        + 'DISTINCT V33 shape from a fresh V33 campaign (worlds 1-5), whose genesis rows are all '
        + 'authored_exact_week. Record 774 measured this same fixture out to 2200 ticks with NO '
        + 'natural rival-supply authored_exact_week row appended (every rival role vacancy was '
        + 'filled by reusing an EXISTING free agent of that role rather than minting a new person) — '
        + 'a mixed-kind root stays NOT REACHED within that budget and is reported as such, not forced.',
      recipe: {
        builder: `migrateToV33(JSON.parse(gunzip(readFileSync(${JSON.stringify(V32_CORPUS_MANIFEST_RELATIVE)})))) -> advanceTo(+260)`,
        actions: ['real migrateToV33', '260 real ticks'],
      },
      focus: {
        boundaryWeek, migrationWeek: boundaryWeek, weekAfterTicks: w6.market.tick,
        kindsAtMigration, kindsAfterTicks, rowCount: w6.talentProvenance.rows.length,
        mixedKindSearch: 'NOT REACHED at 50/100/150/200/260/320/400/500/700/900/1100/1400/1800/2200 '
          + 'ticks from migration (record 774); row count stayed constant at every checkpoint',
      },
    })

    const worldBuildMs = performance.now() - buildStart
    expect(planned.length).toBe(6)
    expect(new Set(planned.map((p) => p.name)).size).toBe(6)

    // ── 2. Save every world at the LIVE writer and round-trip IN MEMORY. ────
    const prepared = planned.map((p) => {
      const { json: saveJson } = saveFactsOf(p.state)
      const rawBytes = Buffer.from(saveJson, 'utf8')
      const compressed = gzipSync(rawBytes)
      if (gunzipSync(compressed).toString('utf8') !== saveJson) throw new Error(`${p.name}: gzip round trip is not byte-stable in memory`)
      return {
        plan: p, saveJson, compressed,
        facts: {
          filename: p.name + '.json.gz', provenanceFilename: p.name + '.provenance.json',
          week: p.state.market.tick, saveVersion: 33, uncompressedSha256: sha(rawBytes), compressedSha256: sha(compressed),
          byteLength: rawBytes.byteLength, compressedByteLength: compressed.byteLength, axis: p.axis, focus: p.focus,
        },
      }
    })

    const authority = {
      phase: 'P14C.2 T0 / the genuine outgoing Save V33 corpus for the C.2a retirement expansion, '
        + 'minted at the FINAL V33 writer before any C.2 source change',
      headSha: HEAD_SHA, publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: git ls-remote origin ' + BRANCH + ' did not return the minting head.'
        : 'PUBLISHED: git ls-remote origin ' + BRANCH + ' returned the minting head at mint time.',
      expansionRelativePath: EXPANSION_RELATIVE, expansionSha256: sha(bytesOf(EXPANSION_RELATIVE)),
      measurementRelativePath: MEASUREMENT_RELATIVE, measurementSha256: sha(bytesOf(MEASUREMENT_RELATIVE)),
      saveVersion: LIVE_SAVE_VERSION, promiseRulesVersion: PROMISE_RULES_VERSION, relationshipRulesVersion: RELATIONSHIP_RULES_VERSION,
      approvalEnvironmentVariable: APPROVAL_VARIABLE, outputRelativePath: OUT_RELATIVE,
      windows: WINDOWS, intentRulesVersionAssumed: 1,
      predictionMethodNote: 'predictRetirement (this file) walks nextBirthdayWeek/ageAt forward one '
        + 'birthday at a time, testing D3 at each birthday against ONLY the contracts/employment rows '
        + 'already fixed in the save. It is a paper prediction under 773 D3/D5/D13, not an '
        + 'implementation output — no RetirementRecord or V34 root exists anywhere in this corpus.',
    }
    const sharedProvenance = {
      authority, observedHeadSha: HEAD_SHA, minterRelativePath: MINTER_RELATIVE, minterSha256: sha(bytesOf(MINTER_RELATIVE)),
      minterArchivedRelativePath: EVIDENCE + '775-mint-v33-c2-corpus-minter.test.ts',
      minterReproduction: 'Archived at minterArchivedRelativePath and removed from tests/, so no suite '
        + 'collects it. Reproducing requires copying the archived bytes back to ' + MINTER_RELATIVE
        + ' before running the recorded command.',
      nodeVersion: process.version, startedAt, worldBuildMs,
      command: `${APPROVAL_VARIABLE}=${HEAD_SHA} node_modules/.bin/vitest run ${MINTER_RELATIVE} --minWorkers=1 --maxWorkers=1`,
      campaign: 'generated test campaign (world 6: migrated from the repository\'s own held V32 fixture); never an Owner save',
      scope: 'genuine OUTGOING V33 worlds spanning the six measured/minted C.2a corpus axes; no V34 '
        + 'root, no lifecycle step, no native and no Owner acceptance claim',
    }

    // ── 3. Write. ────────────────────────────────────────────────────────────
    mkdirSync(outDir)
    for (const p of prepared) {
      writeFileSync(new URL(p.facts.filename, outDir), p.compressed, { flag: 'wx' })
      writeFileSync(new URL(p.facts.provenanceFilename, outDir), JSON.stringify({
        ...sharedProvenance, endedAt: new Date().toISOString(),
        recipe: { ...p.plan.recipe, compression: 'node:zlib gzipSync with library defaults' }, ...p.facts,
      }, null, 2) + '\n', { flag: 'wx' })
    }
    writeFileSync(new URL('MANIFEST.json', outDir), JSON.stringify({ authority, fixtures: prepared.map((p) => p.facts) }, null, 2) + '\n', { flag: 'wx' })

    // ── 4. Re-read from DISK and prove the artifacts, not the in-memory values. ─
    const emitted: unknown[] = []
    for (const p of prepared) {
      const onDisk = readFileSync(new URL(p.facts.filename, outDir))
      expect(sha(onDisk)).toBe(p.facts.compressedSha256)
      const reread = gunzipSync(onDisk).toString('utf8')
      if (reread !== p.saveJson) throw new Error(`${p.facts.filename}: gzip round trip is not byte-stable on disk`)
      const rereadSave = validateSaveV33(JSON.parse(reread))
      expect(exportSave(rereadSave)).toBe(reread)
      emitted.push({ path: `${OUT_RELATIVE}/${p.facts.filename}`, sha256: p.facts.compressedSha256, byteLength: p.facts.compressedByteLength, axis: p.plan.name })
    }
    // Re-derive the sharpest axis facts from the RE-READ state, not memory.
    const w1OnDisk = validateSaveV33(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v33-c2-hard-boundary-and-idle-window.json.gz', outDir))).toString('utf8')))
    for (const role of roles) {
      expect(w1OnDisk.state.talent.find((t: { id: string }) => t.id === hardIds[role])!.age).toBeGreaterThanOrEqual(WINDOWS[role]!.hard)
    }
    const w3OnDisk = validateSaveV33(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v33-c2-contract-and-case.json.gz', outDir))).toString('utf8')))
    expect(w3OnDisk.state.contracts.find((c: Contract) => c.talentId === personA)!.endWeekExclusive).toBe(aContract.endWeekExclusive)
    expect(w3OnDisk.state.promises.find((p: { beneficiaryPersonId: string }) => p.beneficiaryPersonId === personB)!.outcome).toBeNull()
    const w6OnDisk = validateSaveV33(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v33-c2-migrated-legacy.json.gz', outDir))).toString('utf8')))
    expect([...new Set(w6OnDisk.state.talentProvenance.rows.map((r: TalentProvenanceRow) => r.kind))]).toContain('legacy_age_anchor')

    console.log(JSON.stringify({ emitted, publishedRecoverySha, headSha: HEAD_SHA }, null, 2))
    assert.equal(emitted.length, 6)
  }, 900_000)
})
