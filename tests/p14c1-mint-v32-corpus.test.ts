// P14C.1-T0 ONE-OFF MINTER — the genuine outgoing Save V32 corpus for materialized aging.
//
// WHY THESE WORLDS EXIST. C.1 is a SAVE step (V32 -> V33). The programme's slice rule
// and its repeated experience: genuine fixtures of the OUTGOING version, minted at its
// final writer, BEFORE any source change. We hold exactly one V32 fixture today,
// `genuine-v32-owes-two-p1`, minted for B.8; record 759-C amendment 11 replaced the
// expansion's guessed corpus axes with five measured ones, and record 760 then BUILT
// all five and proved each reachable before any byte was committed.
//
// The five axes, and what each is here to break:
//   1. hollywood === null          a recording boundary read from `hollywood.originWeek`
//                                  CRASHES here; one read from `market.tick` does not.
//   2. hollywood === null, tick 1  separates "null hollywood" from "week zero", which a
//                                  single combined world cannot.
//   3. hollywood present, tick 0   distinguishes a correct `migrationWeek` from one
//                                  defaulted to zero. Carries 24 rival-employed rows and
//                                  4 INTEGER ages manufactured by hollywood.ts:221.
//   4. an AUTHORED person          the only route to the authored [18, 70] clamp and to
//                                  `authored: true`. Carries the Owner's own worked case.
//   5. a SCIENTIST at week 260     record 759-C amendment 10 decided Scientists age; the
//                                  held fixture contains zero of them.
// Axis 5 of the measurement (near the top of the draw) needs no new world: this seed tops
// out at 61.93 and the held `genuine-v32-owes-two-p1` already reaches 68.28.
//
// THE OWNER'S WORKED CASE, carried by world 4. A person aged 29.75 at migration turns 30
// about 13 campaign weeks later, not 39. Under the pinned derivation
// `age(w) = floor(a0 + (w - w0) / 52)` that crossing is exact, and it crosses the
// `isProven` boundary at `talentMarket.ts:690`, which `priorityOrder` branches on — so it
// is a MARKET decision, not a display change. This minter authors that person at 29.75 and
// records the predicted crossing week in the fixture's own provenance, so the RED can be
// written against a number this file committed before the implementation existed.
//
// INERT BY DEFAULT, on the T0a/T0b pattern: mints only when
// STUDIO_MINT_V32_C1_CORPUS_APPROVED equals the observed head sha.
//
//   STUDIO_MINT_V32_C1_CORPUS_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/p14c1-mint-v32-corpus.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// Every campaign is generated in-process by the repository's own builders. No Owner save,
// profile or home-directory file is read.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions, tick } from '../src/core/index.js'
import { generateWorld } from '../src/core/worldgen.js'
import { PROMISE_RULES_VERSION } from '../src/core/promises.js'
import { RELATIONSHIP_RULES_VERSION } from '../src/core/relationships.js'
import { exportSave, LIVE_SAVE_VERSION, makeSave, validateSaveV32 } from '../src/core/save.js'
import { p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import { fund, p13aGeneratedStudio } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const OUT_RELATIVE = 'tests/fixtures/p14/genuine-v32-c1-corpus'
const MINTER_RELATIVE = 'tests/p14c1-mint-v32-corpus.test.ts'
const APPROVAL_VARIABLE = 'STUDIO_MINT_V32_C1_CORPUS_APPROVED'
const BRANCH = 'wip/headless-program-20260916-ts'
const SEED = 'p14c1-corpus-01'
const EVIDENCE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
const EXPANSION_RELATIVE = EVIDENCE + '758-c1-aging-expansion.md'
const AUDIT_RELATIVE = EVIDENCE + '759-C-c1-aging-audit.md'
const MEASUREMENT_RELATIVE = EVIDENCE + '760-c1-t0-corpus-measurement.md'

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
  console.warn(`[p14c1-mint-corpus] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
}

/** Every age fact the corpus exists to carry, measured off a built world. */
function ageFacts(state: GameState) {
  const ages = state.talent.map((t) => t.age)
  const fractional = ages.filter((a) => a !== Math.floor(a))
  return {
    hollywoodIsNull: state.hollywood === null,
    marketTick: state.market.tick,
    originWeek: state.hollywood?.originWeek ?? null,
    talentCount: state.talent.length,
    fractionalAges: fractional.length,
    integerAges: ages.length - fractional.length,
    ageMin: ages.length > 0 ? Math.min(...ages) : null,
    ageMax: ages.length > 0 ? Math.max(...ages) : null,
    authoredCount: state.talent.filter((t) => t.authored === true).length,
    scientistCount: state.talent.filter((t) => t.role === 'scientist').length,
    provenAges: ages.filter((a) => a >= 30).length,
    roles: [...new Set(state.talent.map((t) => t.role))].sort(),
    rivalEmploymentRows: state.hollywood === null ? 0
      : state.hollywood.employment.filter((e) => e.studioId !== state.hollywood!.playerStudioId).length,
  }
}

type Planned = {
  name: string
  state: GameState
  axis: string
  recipe: Record<string, unknown>
  focus: Record<string, unknown>
}

describe.skipIf(!APPROVED)('P14C.1-T0: mint the genuine outgoing V32 corpus for materialized aging', () => {
  it('builds all five worlds, PROVES each axis, and only then writes a byte', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. ──────────────────────────────────────────────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(LIVE_SAVE_VERSION).toBe(32)
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

    // ── AXIS 1 — hollywood === null, tick 0. ────────────────────────────────
    const bare = generateWorld(SEED)
    const bareFacts = ageFacts(bare)
    expect(bareFacts.hollywoodIsNull).toBe(true)
    expect(bareFacts.marketTick).toBe(0)
    expect(bareFacts.talentCount).toBeGreaterThan(0)
    // Every worldgen age is the raw truncated gaussian, so the whole population is
    // fractional here. This is the world where the FLOOR decision (A5) moves every value.
    expect(bareFacts.integerAges).toBe(0)
    planned.push({
      name: 'genuine-v32-bare-world',
      state: bare,
      axis: 'hollywood === null at tick 0. A recording boundary read from hollywood.originWeek '
        + 'throws here; one read from market.tick does not. THE axis most likely to find a real defect.',
      recipe: { builder: 'generateWorld(seed)', actions: [] },
      focus: { allAgesFractional: true },
    })

    // ── AXIS 2 — hollywood === null, ticked. ────────────────────────────────
    // Separates "null hollywood" from "week zero". A single combined world cannot.
    const bareTicked = tick(bare)
    const bareTickedFacts = ageFacts(bareTicked)
    expect(bareTickedFacts.hollywoodIsNull).toBe(true)
    expect(bareTickedFacts.marketTick).toBe(1)
    planned.push({
      name: 'genuine-v32-bare-ticked',
      state: bareTicked,
      axis: 'hollywood === null at tick 1. Separates a null industry from week zero, so a '
        + 'migrationWeek defaulted to 0 and a correct one are distinguishable in a null-hollywood world.',
      recipe: { builder: 'tick(generateWorld(seed))', actions: ['one real tick'] },
      focus: { tickedFromBareWorld: true },
    })

    // ── AXIS 3 — hollywood present at tick 0. ───────────────────────────────
    const fresh = p13aGeneratedStudio(SEED)
    const freshFacts = ageFacts(fresh)
    expect(freshFacts.hollywoodIsNull).toBe(false)
    expect(freshFacts.marketTick).toBe(0)
    expect(freshFacts.originWeek).toBe(0)
    expect(freshFacts.rivalEmploymentRows).toBeGreaterThan(0)
    // Record 760's CORRECTION, pinned in the corpus rather than left in prose:
    // enterRival raises any rival hire drawn below 28 to exactly 28, so integer stored
    // ages exist with ZERO authored people and the FLOOR decision meets them here.
    expect(freshFacts.integerAges).toBeGreaterThan(0)
    planned.push({
      name: 'genuine-v32-fresh-tick0',
      state: fresh,
      axis: 'hollywood present at tick 0 with rival employment. Distinguishes a correct '
        + 'migrationWeek from one defaulted to zero, and carries INTEGER ages manufactured by '
        + 'src/core/hollywood.ts:221 (Math.max(28, person.age)) with no authored person present.',
      recipe: { builder: 'p13aGeneratedStudio(seed)', actions: [] },
      focus: {
        integerAgesWithoutAuthoring: freshFacts.integerAges,
        manufacturedBy: 'src/core/hollywood.ts:221 Math.max(28, person.age)',
      },
    })

    // ── AXIS 4 — AUTHORED people, carrying the Owner's worked case. ─────────
    // `createTalent` (actions.ts:748) stores `a.age` UNROUNDED after validating [18, 70],
    // so both of these land verbatim: the clamp edge, and the 29.75 crossing case.
    const CROSSING_AGE = 29.75
    const CLAMP_EDGE_AGE = 18
    const authored = applyActions(fund(fresh), [
      { kind: 'createTalent', talent: {
        name: 'Corpus Clamp Edge', role: 'actor', age: CLAMP_EDGE_AGE,
        actual: { warmth: 0.2, gravity: -0.3, physicality: 0.6 },
        potentialTier: 'Steady', workEthic: 60,
      } },
      { kind: 'createTalent', talent: {
        name: 'Corpus Crossing Case', role: 'actor', age: CROSSING_AGE,
        actual: { warmth: -0.1, gravity: 0.4, physicality: 0.2 },
        potentialTier: 'Steady', workEthic: 55,
      } },
    ] as never)
    const authoredFacts = ageFacts(authored)
    expect(authoredFacts.authoredCount).toBe(2)
    expect(authoredFacts.talentCount).toBe(freshFacts.talentCount + 2)
    const clampEdge = authored.talent.find((t) => t.name === 'Corpus Clamp Edge')
    const crossing = authored.talent.find((t) => t.name === 'Corpus Crossing Case')
    assert.ok(clampEdge, 'axis 4: the clamp-edge person must exist')
    assert.ok(crossing, 'axis 4: the crossing-case person must exist')
    expect(clampEdge.age).toBe(CLAMP_EDGE_AGE)
    expect(crossing.age).toBe(CROSSING_AGE)
    expect(authoredFacts.ageMin).toBe(CLAMP_EDGE_AGE)
    // The market boundary this person exists to cross, measured at V32 BEFORE aging exists.
    expect(crossing.age >= 30).toBe(false)

    // The Owner's number, recomputed here in IEEE double so the RED can be written
    // against a value this file committed rather than against prose. Both 30 and 29.75
    // are exactly representable, so (30 - 29.75) * 52 is exactly 13 with no rounding.
    const weeksToCrossing = Math.ceil((Math.floor(CROSSING_AGE) + 1 - CROSSING_AGE) * 52)
    expect(weeksToCrossing).toBe(13)
    const w0 = authored.market.tick
    const pinnedAge = (age: number, anchorWeek: number, week: number): number =>
      Math.floor(age + (week - anchorWeek) / 52)
    expect(pinnedAge(CROSSING_AGE, w0, w0 + 12)).toBe(29)
    expect(pinnedAge(CROSSING_AGE, w0, w0 + 13)).toBe(30)
    // The disproved arithmetic, recorded so the corpus carries the refutation and not
    // only the correction: frac(29.75) * 52 = 39, three quarters of a year out of phase.
    const disprovedWeeks = Math.round((CROSSING_AGE - Math.floor(CROSSING_AGE)) * 52)
    expect(disprovedWeeks).toBe(39)

    planned.push({
      name: 'genuine-v32-authored',
      state: authored,
      axis: 'two AUTHORED people: one at the authored [18, 70] clamp edge, and one at 29.75 '
        + 'carrying the Owner worked case for the 30 crossing, which talentMarket.ts:690 isProven '
        + 'branches on and priorityOrder consumes. A MARKET decision, not a display change.',
      recipe: {
        builder: 'p13aGeneratedStudio(seed) -> fund -> createTalent x2',
        actions: [
          `real createTalent age ${String(CLAMP_EDGE_AGE)} (authored clamp lower edge)`,
          `real createTalent age ${String(CROSSING_AGE)} (the 30 crossing case)`,
        ],
        economicInput: 'explicit fund helper cash delta with matching ledger',
      },
      focus: {
        clampEdgePersonId: clampEdge.id,
        clampEdgeAge: clampEdge.age,
        crossingPersonId: crossing.id,
        crossingAge: crossing.age,
        crossingIsProvenAtMint: crossing.age >= 30,
        anchorWeekAtMint: w0,
        pinnedFormula: 'age(w) = floor(a0 + (w - w0) / 52)',
        weeksToCrossing,
        predictedCrossingWeek: w0 + weeksToCrossing,
        predictedAgeAtWeekBefore: pinnedAge(CROSSING_AGE, w0, w0 + weeksToCrossing - 1),
        predictedAgeAtCrossing: pinnedAge(CROSSING_AGE, w0, w0 + weeksToCrossing),
        disprovedFracTimes52: disprovedWeeks,
        disprovedBy: 'the Owner directive of 2026-09-24; frac(age) measures progress SINCE the '
          + 'previous birthday, so the remaining time is (1 - frac(a0)) * 52',
      },
    })

    // ── AXIS 5 — a SCIENTIST, at a week none of the others occupy. ──────────
    const scientistWorld = p13aResearchReady()
    const scientistFacts = ageFacts(scientistWorld)
    expect(scientistFacts.scientistCount).toBeGreaterThan(0)
    expect(scientistFacts.hollywoodIsNull).toBe(false)
    expect(scientistFacts.marketTick).toBeGreaterThan(0)
    const scientist = scientistWorld.talent.find((t) => t.role === 'scientist')
    assert.ok(scientist, 'axis 5: the scientist must exist')
    planned.push({
      name: 'genuine-v32-scientist',
      state: scientistWorld,
      axis: 'a SCIENTIST in state.talent at a non-zero week. Record 759-C amendment 10 decided '
        + 'Scientists age, because condition 1 covers every id in state.talent and the profession '
        + 'list in the companion predates P13. The held fixture contains zero scientists. '
        + 'actions.ts:2842 recruitScientist is a PLAYER append site carrying no provenance today.',
      recipe: {
        builder: 'p13aResearchReady() (src/harness/p13a/fixtures.ts), an existing accepted harness '
          + 'builder, not a route this minter invents',
        actions: ['laboratory slice', 'installAcousticInstruments', 'advanceTo(260)',
          'real recruitScientist', 'real assignResearchScientist'],
      },
      focus: {
        scientistPersonId: scientist.id,
        scientistAge: scientist.age,
        scientistAppendSite: 'src/core/actions.ts:2842 recruitScientist',
      },
    })

    const worldBuildMs = performance.now() - buildStart
    expect(planned.length).toBe(5)
    expect(new Set(planned.map((p) => p.name)).size).toBe(5)

    // ── 2. Save every world at the LIVE writer and round-trip IN MEMORY, before
    //       the directory is created. A world that cannot round-trip is not a fixture. ─
    const prepared = planned.map((p) => {
      const save = makeSave(p.state)
      const saveJson = exportSave(save)
      expect(save.saveVersion).toBe(32)
      expect(exportSave(validateSaveV32(JSON.parse(saveJson)))).toBe(saveJson)
      const rawBytes = Buffer.from(saveJson, 'utf8')
      const compressed = gzipSync(rawBytes)
      if (gunzipSync(compressed).toString('utf8') !== saveJson) {
        throw new Error(`${p.name}: gzip round trip is not byte-stable in memory`)
      }
      return {
        plan: p,
        saveJson,
        compressed,
        facts: {
          filename: p.name + '.json.gz',
          provenanceFilename: p.name + '.provenance.json',
          seed: SEED,
          week: p.state.market.tick,
          saveVersion: save.saveVersion,
          uncompressedSha256: sha(rawBytes),
          compressedSha256: sha(compressed),
          byteLength: rawBytes.byteLength,
          compressedByteLength: compressed.byteLength,
          axis: p.axis,
          ageFacts: ageFacts(p.state),
          focus: p.focus,
        },
      }
    })

    const authority = {
      phase: 'P14C.1 T0 / the genuine outgoing Save V32 corpus for materialized aging, minted at '
        + 'the FINAL V32 writer before any C.1 source change',
      headSha: HEAD_SHA,
      publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: git ls-remote origin ' + BRANCH + ' did not return the minting head.'
        : 'PUBLISHED: git ls-remote origin ' + BRANCH + ' returned the minting head at mint time.',
      expansionRelativePath: EXPANSION_RELATIVE,
      expansionSha256: sha(bytesOf(EXPANSION_RELATIVE)),
      auditRelativePath: AUDIT_RELATIVE,
      auditSha256: sha(bytesOf(AUDIT_RELATIVE)),
      measurementRelativePath: MEASUREMENT_RELATIVE,
      measurementSha256: sha(bytesOf(MEASUREMENT_RELATIVE)),
      saveVersion: LIVE_SAVE_VERSION,
      wireIdentityNote: 'The projection and schema identities are NOT imported here: this minter '
        + 'lives in the root tsconfig project, which excludes bridge .ts imports. They are pinned '
        + 'by headSha, and the clean-tree gate covers generated/.',
      promiseRulesVersion: PROMISE_RULES_VERSION,
      relationshipRulesVersion: RELATIONSHIP_RULES_VERSION,
      approvalEnvironmentVariable: APPROVAL_VARIABLE,
      outputRelativePath: OUT_RELATIVE,
      alsoHeld: 'tests/fixtures/p14/genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz covers the '
        + 'top of the age draw (68.28) at week 104 and is NOT re-minted here.',
    }
    const sharedProvenance = {
      authority,
      observedHeadSha: HEAD_SHA,
      minterRelativePath: MINTER_RELATIVE,
      minterSha256: sha(bytesOf(MINTER_RELATIVE)),
      minterArchivedRelativePath: EVIDENCE + '761-mint-v32-c1-corpus-minter.test.ts',
      minterReproduction: 'Archived at minterArchivedRelativePath and removed from tests/, so no '
        + 'suite collects it. Reproducing requires copying the archived bytes back to '
        + MINTER_RELATIVE + ' before running the recorded command.',
      nodeVersion: process.version,
      startedAt,
      worldBuildMs,
      command: `${APPROVAL_VARIABLE}=${HEAD_SHA} node_modules/.bin/vitest run ${MINTER_RELATIVE}`
        + ' --minWorkers=1 --maxWorkers=1',
      campaign: 'generated test campaign, never Owner save',
      scope: 'genuine OUTGOING V32 worlds spanning the five measured C.1 corpus axes; no future '
        + 'migration, no native and no Owner acceptance claim',
    }

    // ── 3. Write. ───────────────────────────────────────────────────────────
    mkdirSync(outDir)
    for (const p of prepared) {
      writeFileSync(new URL(p.facts.filename, outDir), p.compressed, { flag: 'wx' })
      writeFileSync(new URL(p.facts.provenanceFilename, outDir), JSON.stringify({
        ...sharedProvenance,
        endedAt: new Date().toISOString(),
        recipe: { ...p.plan.recipe, compression: 'node:zlib gzipSync with library defaults' },
        ...p.facts,
      }, null, 2) + '\n', { flag: 'wx' })
    }
    writeFileSync(new URL('MANIFEST.json', outDir), JSON.stringify({
      authority, fixtures: prepared.map((p) => p.facts),
    }, null, 2) + '\n', { flag: 'wx' })

    // ── 4. Re-read from DISK and prove the artifacts, not the in-memory values. ─
    const emitted: unknown[] = []
    for (const p of prepared) {
      const onDisk = readFileSync(new URL(p.facts.filename, outDir))
      expect(sha(onDisk)).toBe(p.facts.compressedSha256)
      const reread = gunzipSync(onDisk).toString('utf8')
      if (reread !== p.saveJson) {
        throw new Error(`${p.facts.filename}: gzip round trip is not byte-stable on disk`)
      }
      const rereadSave = validateSaveV32(JSON.parse(reread))
      expect(exportSave(rereadSave)).toBe(reread)
      // The axis survives the save/load round trip, not only the in-memory state.
      const rereadFacts = ageFacts(rereadSave.state)
      expect(rereadFacts).toEqual(p.facts.ageFacts)
      emitted.push({
        path: `${OUT_RELATIVE}/${p.facts.filename}`,
        sha256: p.facts.compressedSha256,
        byteLength: p.facts.compressedByteLength,
        axis: p.facts.ageFacts,
      })
    }
    // The crossing case in particular, re-read rather than remembered.
    const authoredOnDisk = validateSaveV32(JSON.parse(gunzipSync(
      readFileSync(new URL('genuine-v32-authored.json.gz', outDir))).toString('utf8')))
    const crossingOnDisk = authoredOnDisk.state.talent.find((t) => t.name === 'Corpus Crossing Case')
    expect(crossingOnDisk?.age).toBe(CROSSING_AGE)
    expect(crossingOnDisk?.authored).toBe(true)

    console.log(JSON.stringify({ emitted, publishedRecoverySha, headSha: HEAD_SHA }, null, 2))
  }, 900_000)
})
