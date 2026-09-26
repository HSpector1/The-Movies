// P14C2B-T0 ONE-OFF MINTER — the genuine outgoing Save V35 corpus for the single
// final retirement extension (record 780, esp. §2/§5/§6.3; record 806 §4).
//
// WHY THESE WORLDS EXIST. C.2b is a SOURCE step against the LIVE V35 writer — no
// `extensionIssuer`, no `retirementExtension` case variant, no V36 root, nothing
// C.2b adds exists yet (C.4 closed at record 805). The programme's slice rule
// (already applied for C.1/C.2a/C.4 at 760/761, 774/775, 782/790/791): genuine
// fixtures of the OUTGOING version, minted at its final writer, BEFORE any C.2b
// source change. Record 807 measured six axes (a-f, 780 §6.3) by an executable
// probe; this file BUILDS them and PROVES each before a byte is written.
//
// THE THREE WORLDS, and the axis each carries (780 §6.3, 806 §4):
//   1. contract-gap-freeagent-expiry   a: an announced player-contracted actor
//                                      whose contract ends INSIDE (E-12,E). d: a
//                                      SECOND announced actor, NEVER contracted
//                                      (a free agent forever — no employer can
//                                      ever be the sole extension issuer). e: an
//                                      unrelated, ordinary open renewal-window
//                                      case (age 40 director), to pin the future
//                                      V36 `variant: 'expiry'` migration.
//   2. contract-at-effective-week      b: an announced player-contracted actor
//                                      whose contract ends EXACTLY at E (the
//                                      companion's own literal "no gap, no
//                                      overlap" case). The SAME week-52 save is
//                                      also a cohort week (a weak axis f fact).
//   3. rival-incumbent-cohorts         c: an announced actor under an ACTIVE
//                                      RIVAL contract in force at E-12 (the
//                                      rival incumbent) — reached NATURALLY, no
//                                      forced `enterRival`, no authored rival
//                                      hire. f: the SAME world's 2600 weeks of
//                                      natural C.4 replenishment carry many
//                                      non-empty cohort receipts (this axis's
//                                      own subject was itself minted by one).
//
// Every axis-a/b/c subject's provenance carries the "V35-engine continuation
// facts" (790's method, applied here): continuing the SAVED state under the
// real, unmodified V35 engine (no C.2b code anywhere in this file or in src/)
// to `effectiveWeek + 1` — the DECLINE baseline (no offer, no acceptance,
// nothing C.2b adds exists to make one) a future C.2b RED must reproduce
// exactly when nothing extends the person.
//
// INERT BY DEFAULT, on the 774/775/790/791 T0 pattern: mints only when
// STUDIO_MINT_V35_C2B_CORPUS_APPROVED equals the observed head sha.
//
//   STUDIO_MINT_V35_C2B_CORPUS_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/p14c2b-mint-v35-corpus.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// Every campaign is generated in-process by the repository's own builders. No
// Owner save, profile or home-directory file is read.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  applyActions, retirementRecordFor, activeContract, busyTalentIds,
  LIVE_SAVE_VERSION, exportSave, makeSave, validateSaveV35,
} from '../src/core/index.js'
import { rivalEmployment } from '../src/core/hollywood.js'
import { caseForTalent, caseOpenForTalent } from '../src/core/talentMarket.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { CreativeRole, GameState, RetirementRecord } from '../src/core/types.js'
import { fund } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const OUT_RELATIVE = 'tests/fixtures/p14/genuine-v35-c2b-corpus'
const MINTER_RELATIVE = 'tests/p14c2b-mint-v35-corpus.test.ts'
const APPROVAL_VARIABLE = 'STUDIO_MINT_V35_C2B_CORPUS_APPROVED'
const BRANCH = 'wip/headless-program-20260916-ts'
const SEED = 'p14c2b-corpus-01'
const EVIDENCE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
const EXPANSION_RELATIVE = EVIDENCE + '780-c2b-extension-expansion.md'
const CONTRACT_RELATIVE = EVIDENCE + '806-c2b-api-contract.md'
const MEASUREMENT_RELATIVE = EVIDENCE + '807-c2b-t0-measurement.md'

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
  console.warn(`[p14c2b-mint-corpus] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
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

/** The player-contract mirror row in `state.hollywood.employment` in force for this
 * person at `week` (806 §4/§8.2: "the P12 mirror carries player contracts too"). */
function playerEmploymentRowAt(state: GameState, personId: string, week: number) {
  const owner = state.hollywood?.playerStudioId
  return (state.hollywood?.employment ?? []).find((row) =>
    row.studioId === owner && row.terms.talentId === personId &&
    row.terms.startWeek <= week && week < row.terms.endWeekExclusive &&
    (row.endedWeek === null || week < row.endedWeek))
}

/** 806 §4's own extension-term formula, recorded as a paper fact — nothing here
 * implements it: no `extensionIssuer`, no case variant, no draft anywhere in this file. */
function impliedExtensionTerm(effectiveWeek: number, decisionWeek: number): number {
  return effectiveWeek + 52 - decisionWeek
}

/** Axis a/b/c facts (780 §6.3 / 806 §4): the record, E, E-12, the employer/contract
 * row in force at E-12, its endWeekExclusive (the decision week per 806 §5), and the
 * implied extension term. Throws (never silently omits) if any expectation fails —
 * the caller's own `expect()` calls are the PROOF; this just assembles the facts. */
function axisFacts(state: GameState, personId: string, employer: 'player' | 'rival') {
  const record = retirementRecordFor(state, personId) as RetirementRecord
  const effectiveWeek = record.effectiveWeek
  const eMinus12 = effectiveWeek - 12
  const row = employer === 'player' ? playerEmploymentRowAt(state, personId, eMinus12) : rivalEmployment(state, personId, eMinus12)
  if (row === undefined || row === null) throw new Error(`axisFacts: no ${employer} employment row in force at E-12=${eMinus12} for ${personId}`)
  const decisionWeek = row.terms.endWeekExclusive
  return {
    personId, announcedWeek: record.announcedWeek, ageAtAnnouncement: record.ageAtAnnouncement,
    cause: record.cause, effectiveWeek, eMinus12,
    employerStudioId: row.studioId, contractId: row.contractId ?? null,
    contractRowStartWeek: row.terms.startWeek, decisionWeek,
    endWeekExclusiveInWindow: decisionWeek > eMinus12 && decisionWeek < effectiveWeek,
    endsExactlyAtE: decisionWeek === effectiveWeek,
    impliedExtensionTermWeeks: impliedExtensionTerm(effectiveWeek, decisionWeek),
  }
}

/** "V35-engine continuation facts to E+1" (790's method, applied to C.2b): the
 * DECLINE baseline under the real, unmodified V35 engine. */
function declineBaseline(saved: GameState, personId: string, effectiveWeek: number) {
  const cont = advanceTo(saved, effectiveWeek + 1)
  const record = retirementRecordFor(cont, personId) as RetirementRecord | undefined
  return {
    atWeek: effectiveWeek + 1,
    status: record?.status ?? null, retiredWeek: record?.retiredWeek ?? null,
    finishingFromWeek: record?.finishingFromWeek ?? null,
    stillHasActivePlayerContract: activeContract(cont, personId, effectiveWeek + 1) !== undefined,
    stillHasActiveRivalRow: rivalEmployment(cont, personId, effectiveWeek + 1) !== null,
  }
}

function saveFactsOf(state: GameState) {
  const json = exportSave(makeSave(state))
  expect(exportSave(validateSaveV35(JSON.parse(json)))).toBe(json)
  return { json, saveVersion: 35 as const }
}

type Planned = { name: string; state: GameState; axis: string; recipe: Record<string, unknown>; focus: Record<string, unknown> }

describe.skipIf(!APPROVED)('P14C2B-T0: mint the genuine outgoing V35 corpus for the single final retirement extension', () => {
  it('builds all three worlds, PROVES each axis, and only then writes a byte', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. ──────────────────────────────────────────────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(LIVE_SAVE_VERSION).toBe(35)
    expect(git('status', '--porcelain', '--', 'src/', 'bridge/', 'generated/', 'ui/', 'scripts/',
      'tests/helpers/', 'tests/fixtures/', 'package.json', 'package-lock.json')).toBe('')
    const remoteHead = git('ls-remote', 'origin', BRANCH).trim().split(/\s+/)[0] ?? ''
    const publishedRecoverySha = remoteHead === HEAD_SHA ? HEAD_SHA : null

    const outDir = new URL(OUT_RELATIVE + '/', REPO)
    if (existsSync(outDir)) throw new Error(`Refusing fixture overwrite: ${OUT_RELATIVE} already exists`)

    const buildStart = performance.now()
    const planned: Planned[] = []

    // ── WORLD 1 — axes a + d + e. ────────────────────────────────────────────
    let w1 = fund(p13aGeneratedStudio(SEED + '-ade'))
    w1 = applyActions(w1, [
      authoredAt('C2b Axis A Actor', 'actor', 70, 0),
      authoredAt('C2b Axis D Actor', 'actor', 70, 1),
      authoredAt('C2b Axis E Director', 'director', 40, 2),
    ] as never)
    const aId = w1.talent.find((t) => t.name === 'C2b Axis A Actor')!.id
    const dId = w1.talent.find((t) => t.name === 'C2b Axis D Actor')!.id
    const eId = w1.talent.find((t) => t.name === 'C2b Axis E Director')!.id
    w1 = applyActions(w1, [
      { kind: 'signContract', talentId: aId, termWeeks: 98 },
      { kind: 'signContract', talentId: eId, termWeeks: 60 },
    ] as never) // dId is NEVER signed — axis d's whole point
    w1 = advanceTo(w1, 52) // the birthday due-bucket week for a week-0 authored age-70 person
    const saveWeek1 = w1.market.tick
    expect(saveWeek1).toBe(52)

    const aFacts = axisFacts(w1, aId, 'player')
    expect(aFacts.cause).toBe('hardBoundary')
    expect(aFacts.effectiveWeek).toBe(104) // E = A + 52 (contract 98 < 104 does not dominate)
    expect(aFacts.endWeekExclusiveInWindow).toBe(true) // axis a: decisionWeek 98 ∈ (92,104)
    expect(aFacts.endsExactlyAtE).toBe(false)
    expect(saveWeek1).toBeLessThan(aFacts.eMinus12) // "saved BEFORE E-12" (780 §6.3 axis a)
    const aDecline = declineBaseline(w1, aId, aFacts.effectiveWeek)
    expect(aDecline.status).toBe('retired') // the decline baseline: no offer, no acceptance exists yet

    const dRecord = retirementRecordFor(w1, dId) as RetirementRecord
    expect(dRecord.cause).toBe('hardBoundary')
    expect(dRecord.effectiveWeek).toBe(104)
    const dEMinus12 = dRecord.effectiveWeek - 12
    expect(playerEmploymentRowAt(w1, dId, dEMinus12)).toBeUndefined() // axis d: no player employer ever
    expect(rivalEmployment(w1, dId, dEMinus12)).toBeNull() // axis d: no rival employer ever
    const dDecline = declineBaseline(w1, dId, dRecord.effectiveWeek)
    expect(dDecline.status).toBe('retired')

    const eCase = caseForTalent(w1, eId, saveWeek1)
    expect(eCase).not.toBeNull()
    expect(caseOpenForTalent(w1, eId, saveWeek1)).toBe(true) // axis e: an ordinary open case
    expect(retirementRecordFor(w1, eId)).toBeUndefined() // axis e's subject is unrelated to retirement

    planned.push({
      name: 'genuine-v35-c2b-contract-gap-freeagent-expiry', state: w1,
      axis: 'a: an authored hard-boundary actor (age 70, week 0) under a 98-week PLAYER contract '
        + 'signed at week 0 — announced hardBoundary at week 52 (E=104), contract endWeekExclusive '
        + '98 falls in (E-12,E)=(92,104), saved at week 52 (before E-12). d: a SECOND authored '
        + 'hard-boundary actor, NEVER given any contract — announced at the same week 52, confirmed '
        + 'to hold no player and no rival employment row in force at its own E-12=92, so no employer '
        + 'can ever be the sole extension issuer. e: an unrelated authored director (age 40) under a '
        + '60-week contract, whose renewal-window case is OPEN (non-terminal) at week 52 — the '
        + 'ordinary case shape the future V36 migration must stamp variant: "expiry" onto.',
      recipe: {
        builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-ade')})) -> createTalent x3 `
          + '(actor age 70 x2, director age 40) -> signContract (98wk actor, 60wk director; the second '
          + 'actor is never signed) -> advanceTo(52)',
        actions: ['real createTalent x3', 'real signContract x2', '52 real ticks'],
      },
      focus: {
        axisA: aFacts, axisA_declineBaseline: aDecline,
        axisD: { personId: dId, record: dRecord, eMinus12: dEMinus12, declineBaseline: dDecline },
        axisE: { personId: eId, case: eCase },
      },
    })

    // ── WORLD 2 — axis b (+ a weak axis-f fact). ────────────────────────────
    let w2 = fund(p13aGeneratedStudio(SEED + '-bf'))
    w2 = applyActions(w2, [authoredAt('C2b Axis B Actor', 'actor', 70, 0)] as never)
    const bId = w2.talent.find((t) => t.name === 'C2b Axis B Actor')!.id
    w2 = applyActions(w2, [{ kind: 'signContract', talentId: bId, termWeeks: 150 }] as never)
    w2 = advanceTo(w2, 52)
    const saveWeek2 = w2.market.tick
    expect(saveWeek2).toBe(52)

    const bFacts = axisFacts(w2, bId, 'player')
    expect(bFacts.cause).toBe('hardBoundary')
    expect(bFacts.effectiveWeek).toBe(150) // E = max(104,150) = 150 — the contract IS the E-determiner
    expect(bFacts.endsExactlyAtE).toBe(true) // axis b: the companion's own "no gap, no overlap" case
    expect(bFacts.impliedExtensionTermWeeks).toBe(52) // the literal minimal term
    expect(saveWeek2).toBeLessThan(bFacts.eMinus12)
    const bDecline = declineBaseline(w2, bId, bFacts.effectiveWeek)
    expect(bDecline.status).toBe('retired')

    expect(w2.careerLifecycle.cohorts.length).toBeGreaterThan(0) // weak axis f: week 52 IS a cohort week
    const cohortWeek52 = w2.careerLifecycle.cohorts.find((c) => c.week === 52)
    expect(cohortWeek52).toBeDefined()

    planned.push({
      name: 'genuine-v35-c2b-contract-at-effective-week', state: w2,
      axis: 'b: an authored hard-boundary actor (age 70, week 0) under a 150-week PLAYER contract '
        + 'signed at week 0 — announced hardBoundary at week 52; because the contract (endWeekExclusive '
        + '150) is still in force at announcement and outlives A+52=104, IT determines E=150 exactly — '
        + 'the companion draft\'s own literal "the contract in force ends there and the extension '
        + 'begins there, with no gap and no overlap" case (780 §2). Saved at week 52 (before E-12=138). '
        + 'Weak axis f: the SAME save week (52) is a cohort week, so careerLifecycle.cohorts already '
        + 'holds one receipt (all-zero request in THIS seed — see world 3 for a richer one).',
      recipe: {
        builder: `fund(p13aGeneratedStudio(${JSON.stringify(SEED + '-bf')})) -> createTalent (actor age `
          + '70) -> signContract (150wk) -> advanceTo(52)',
        actions: ['real createTalent', 'real signContract', '52 real ticks'],
      },
      focus: { axisB: bFacts, axisB_declineBaseline: bDecline, axisF_week52Cohort: cohortWeek52 },
    })

    // ── WORLD 3 — axes c + f. NATURAL search reproduced deterministically: the
    //    SAME seed, ticked to the SAME week, with NO player action and NO forced
    //    enterRival call, reproduces record 807's own finding exactly (a fresh
    //    seed + advanceTo is fully deterministic; no RNG is ever consumed by
    //    anything a player or this file does). ─────────────────────────────────
    const w3 = advanceTo(p13aGeneratedStudio(SEED + '-c1'), 2600)
    const saveWeek3 = w3.market.tick
    expect(saveWeek3).toBe(2600)
    const hardBoundaryRecords = w3.careerLifecycle.records.filter((r) => r.cause === 'hardBoundary')
    expect(hardBoundaryRecords.length).toBeGreaterThan(0)
    const rivalIncumbentHits = hardBoundaryRecords
      .map((r) => {
        const eMinus12 = r.effectiveWeek - 12
        const row = rivalEmployment(w3, r.personId, eMinus12)
        return row !== null && row.endedWeek === null ? { record: r, row } : null
      })
      .filter((hit): hit is NonNullable<typeof hit> => hit !== null)
    expect(rivalIncumbentHits.length).toBeGreaterThan(0) // axis c: at least one rival incumbent found
    const cHit = rivalIncumbentHits[0]!
    const cId = cHit.record.personId
    const cFacts = axisFacts(w3, cId, 'rival')
    expect(cFacts.employerStudioId).not.toBe(w3.hollywood!.playerStudioId) // genuinely a RIVAL
    expect(cFacts.eMinus12).toBeLessThan(saveWeek3 + 1000) // sanity: E-12 is a real, bounded future week
    expect(saveWeek3).toBeLessThan(cFacts.eMinus12) // saved before E-12, consistent with a/b
    const cDecline = declineBaseline(w3, cId, cFacts.effectiveWeek)
    expect(cDecline.status).toBe('retired')
    expect(busyTalentIds(w3).has(cId)).toBe(false) // confirms the decline settles straight to retired, never finishing

    const cohortsWithEntrants = w3.careerLifecycle.cohorts.filter((c) => c.personIds.length > 0)
    expect(cohortsWithEntrants.length).toBeGreaterThan(0) // axis f, richly: real entrants over 2600 weeks
    const originatingCohort = w3.careerLifecycle.cohorts.find((c) => c.personIds.includes(cId))
    expect(originatingCohort).toBeDefined() // axis c's OWN subject was itself minted by one of these

    planned.push({
      name: 'genuine-v35-c2b-rival-incumbent-cohorts', state: w3,
      axis: `c: a NATURAL rival incumbent, found with no authored rival hire and no forced enterRival `
        + `call — subject "${cId}" was itself minted by a C.4 cohort receipt (week `
        + `${originatingCohort!.week}), later hired by rival "${cFacts.employerStudioId}" on a `
        + `208-week contract (starts ${cFacts.contractRowStartWeek}), announced hardBoundary at week `
        + `${cFacts.announcedWeek}; the SAME rival contract, still in force, determines E=`
        + `${cFacts.effectiveWeek} (ends exactly there) and remains in force at E-12=${cFacts.eMinus12}. `
        + `Saved at week ${saveWeek3} (before E-12). f, richly: this world's 2600 weeks of natural C.4 `
        + `replenishment already carry ${cohortsWithEntrants.length} cohort receipt(s) with real `
        + 'entrants (not merely an all-zero request) — the natural, byte-for-byte V36 migration target.',
      recipe: {
        builder: `advanceTo(p13aGeneratedStudio(${JSON.stringify(SEED + '-c1')}), 2600)`,
        actions: ['2600 real ticks, no player action, fund() not called (matching 775/791 precedent for a passive natural world)'],
      },
      focus: {
        axisC: cFacts, axisC_declineBaseline: cDecline, originatingCohortWeek: originatingCohort!.week,
        totalHardBoundaryRecords: hardBoundaryRecords.length, rivalIncumbentHitCount: rivalIncumbentHits.length,
        axisF_cohortsWithEntrants: cohortsWithEntrants.length, axisF_totalCohorts: w3.careerLifecycle.cohorts.length,
      },
    })

    const worldBuildMs = performance.now() - buildStart
    expect(planned.length).toBe(3)
    expect(new Set(planned.map((p) => p.name)).size).toBe(3)

    // ── 2. Save every world at the LIVE V35 writer, round-trip IN MEMORY. ───
    const prepared = planned.map((p) => {
      const { json: saveJson } = saveFactsOf(p.state)
      const rawBytes = Buffer.from(saveJson, 'utf8')
      const compressed = gzipSync(rawBytes)
      if (gunzipSync(compressed).toString('utf8') !== saveJson) throw new Error(`${p.name}: gzip round trip is not byte-stable in memory`)
      return {
        plan: p, saveJson, compressed,
        facts: {
          filename: p.name + '.json.gz', provenanceFilename: p.name + '.provenance.json',
          week: p.state.market.tick, saveVersion: 35, uncompressedSha256: sha(rawBytes), compressedSha256: sha(compressed),
          byteLength: rawBytes.byteLength, compressedByteLength: compressed.byteLength, axis: p.axis, focus: p.focus,
        },
      }
    })

    const authority = {
      phase: 'P14C.2b T0 / the genuine outgoing Save V35 corpus for the single final retirement '
        + 'extension, minted at the FINAL V35 writer before any C.2b source change',
      headSha: HEAD_SHA, publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: git ls-remote origin ' + BRANCH + ' did not return the minting head.'
        : 'PUBLISHED: git ls-remote origin ' + BRANCH + ' returned the minting head at mint time.',
      expansionRelativePath: EXPANSION_RELATIVE, expansionSha256: sha(bytesOf(EXPANSION_RELATIVE)),
      contractRelativePath: CONTRACT_RELATIVE, contractSha256: sha(bytesOf(CONTRACT_RELATIVE)),
      measurementRelativePath: MEASUREMENT_RELATIVE, measurementSha256: sha(bytesOf(MEASUREMENT_RELATIVE)),
      saveVersion: LIVE_SAVE_VERSION, approvalEnvironmentVariable: APPROVAL_VARIABLE, outputRelativePath: OUT_RELATIVE,
      predictionMethodNote: '"V35-engine continuation facts": declineBaseline (this file) continues the '
        + 'SAVED state under the real, unmodified V35 engine (no extensionIssuer, no retirementExtension '
        + 'case variant, nothing C.2b adds exists anywhere in this file or in src/) to effectiveWeek + 1 '
        + 'via real advanceTo()/tick() calls — never a hand-rolled formula. It is a measured prediction '
        + 'under 780/806, not an implementation output.',
    }
    const sharedProvenance = {
      authority, observedHeadSha: HEAD_SHA, minterRelativePath: MINTER_RELATIVE, minterSha256: sha(bytesOf(MINTER_RELATIVE)),
      minterArchivedRelativePath: EVIDENCE + '808-mint-v35-c2b-corpus-minter.test.ts',
      minterReproduction: 'Archived at minterArchivedRelativePath and removed from tests/, so no suite '
        + 'collects it. Reproducing requires copying the archived bytes back to ' + MINTER_RELATIVE
        + ' before running the recorded command.',
      nodeVersion: process.version, startedAt, worldBuildMs,
      command: `${APPROVAL_VARIABLE}=${HEAD_SHA} node_modules/.bin/vitest run ${MINTER_RELATIVE} --minWorkers=1 --maxWorkers=1`,
      campaign: 'generated test campaign only; never an Owner save',
      scope: 'genuine OUTGOING V35 worlds spanning the six measured/minted C.2b corpus axes (a-f, 780 '
        + '§6.3); no extensionIssuer, no retirementExtension case variant, no V36 root, no native and no '
        + 'Owner acceptance claim',
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
      const rereadSave = validateSaveV35(JSON.parse(reread))
      expect(exportSave(rereadSave)).toBe(reread)
      emitted.push({ path: `${OUT_RELATIVE}/${p.facts.filename}`, sha256: p.facts.compressedSha256, byteLength: p.facts.compressedByteLength, axis: p.plan.name })
    }
    // Re-derive the sharpest axis facts from the RE-READ state, not memory.
    const world1OnDisk = validateSaveV35(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v35-c2b-contract-gap-freeagent-expiry.json.gz', outDir))).toString('utf8')))
    expect((world1OnDisk.state as unknown as GameState).careerLifecycle.records.find((r) => r.personId === dId)!.cause).toBe('hardBoundary')
    const world2OnDisk = validateSaveV35(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v35-c2b-contract-at-effective-week.json.gz', outDir))).toString('utf8')))
    expect((world2OnDisk.state as unknown as GameState).careerLifecycle.records.find((r) => r.personId === bId)!.effectiveWeek).toBe(150)
    const world3OnDisk = validateSaveV35(JSON.parse(gunzipSync(readFileSync(new URL('genuine-v35-c2b-rival-incumbent-cohorts.json.gz', outDir))).toString('utf8')))
    expect((world3OnDisk.state as unknown as GameState).careerLifecycle.cohorts.some((c) => c.personIds.includes(cId))).toBe(true)

    console.log(JSON.stringify({ emitted, publishedRecoverySha, headSha: HEAD_SHA }, null, 2))
    assert.equal(emitted.length, 3)
  }, 900_000)
})
