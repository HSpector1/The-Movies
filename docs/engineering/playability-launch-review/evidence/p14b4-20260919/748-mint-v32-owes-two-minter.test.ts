// P14B.8-T0b ONE-OFF MINTER — genuine Save V32 world with a REMAINING OBLIGATION OF TWO.
//
// WHY THIS WORLD EXISTS. The Owner's B.8 direction asks for a substitute count that
// is positive and still insufficient, to separate that protection from the zero-count
// case (which is also invalid under the basic count rule, and which the wire's
// `count: integer({minimum: 1})` makes unreachable from the player surface anyway).
// The separation needs a remaining obligation of at least 2. No published fixture has
// one: the largest in the whole pre-b7 corpus is 1.
//
// The Owner's literal numbers were 3 promised / 1 delivered / 2 owed. Record 747
// MEASURED that shape and it is blocked by a product law, not by fixture construction:
// a count-3 promise reads FRAGILE "needs a picture not yet commissioned", and the one
// lever that could lift `existingPath` is a second production seating the same person,
// which M16 exclusivity refuses. An attached FRAGILE promise then fails to BIND at the
// market freeze, so it would exercise `waiverAccepted` rule 2 rather than rule 7.
//
// Count 2 at progress 0 gives the same remaining obligation of 2 through the archived
// route's own already-proven REASONABLY_ACHIEVABLE attach. This minter runs that route
// (record 722, lines 224-260) and STOPS AT THE FREEZE instead of filming a take.
//
// INERT BY DEFAULT, on the T0a pattern: mints only when
// STUDIO_MINT_V32_OWES_TWO_APPROVED equals the observed head sha.
//
//   STUDIO_MINT_V32_OWES_TWO_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/bridge-p14b8-mint-v32-owes-two.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// The campaign is generated in-process by the repository's own builders. No Owner
// save, profile or home-directory file is read.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import {
  attachPromise, PROMISE_RULES_VERSION, waiverAccepted,
} from '../src/core/promises.js'
import type { PromiseAttachment } from '../src/core/promises.js'
import { RELATIONSHIP_RULES_VERSION } from '../src/core/relationships.js'
import { currentProposals, submitProposal } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
import { exportSave, LIVE_SAVE_VERSION, makeSave, validateSaveV32 } from '../src/core/save.js'
import type { GameState, ProfessionalPromise } from '../src/core/types.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const NAME = 'genuine-v32-owes-two-p1'
const OUT_RELATIVE = 'tests/fixtures/p14/genuine-v32-pre-b8'
const MINTER_RELATIVE = 'tests/bridge-p14b8-mint-v32-owes-two.test.ts'
const APPROVAL_VARIABLE = 'STUDIO_MINT_V32_OWES_TWO_APPROVED'
const BRANCH = 'wip/headless-program-20260916-ts'
const CLOSEOUT_RELATIVE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/742-b7-checkpoint.md'
const MEASUREMENT_RELATIVE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/747-t0b-capacity-measurement.md'
const EXPANSION_RELATIVE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/744-b8-waiver-surface-expansion.md'

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
  console.warn(`[p14b8-mint-v32] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
}

// ── The archived route's helpers, COPIED (never imported), exactly as record 722
// copied them from tests/p14b4-cast-class-outcomes.test.ts, so this file registers
// no case anywhere else.
function sign(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft', termWeeks = 208) {
  for (let steps = 0; steps < 60; steps++) {
    const person = hiringMarketIds(state, state.market.tick)
      .map((id) => state.talent.find((p) => p.id === id)).find((p) => p?.role === role)
    if (person !== undefined) {
      return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    }
    state = tick(state)
  }
  throw new Error('UNEXECUTED prerequisite: no actual hireable ' + role + ' within 60 weeks')
}
function unusedConcept(state: GameState) {
  const used = new Set([...state.studio.activeProductions.map((p) => p.conceptId),
    ...state.studio.releasedFilms.map((p) => p.conceptId), ...state.scriptDevelopment.projects.map((p) => p.conceptId)])
  const concept = state.concepts.find((c) => !used.has(c.id))
  assert.ok(concept, 'fixture prerequisite: no distinct unused existing stock concept')
  return concept
}
function readySoundstage(state: GameState): GameState {
  const stage = 'facility-soundstage-07'
  assert.ok(state.operations.facilities.some((f) => f.id === stage && f.capability === 'soundstage'))
  const mounted = state.sets.find((s) => s.mountedOn === stage && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet',
    commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
  return advanceTo(state, state.market.tick + TUNING.SET_BUILD_WEEKS_BAND_HIGH)
}
function root(state: GameState, promiseId: string): ProfessionalPromise {
  const rows = state.promises.filter((p) => p.promiseId === promiseId)
  assert.equal(rows.length, 1)
  return rows[0]!
}
function binding(state: GameState, promise: ProfessionalPromise): void {
  assert.notEqual(promise.contractId, null)
  const employment = state.hollywood!.employment.find((row) => row.contractId === promise.contractId)
  assert.ok(employment, 'the bound promise must name a real employment record')
  assert.equal(employment.studioId, promise.issuerStudioId)
  assert.equal(employment.terms.talentId, promise.beneficiaryPersonId)
  assert.equal(employment.terms.startWeek, promise.windowStartWeek)
  assert.ok(state.talentMarket.receipts.some((r) => r.kind === 'settled'
    && r.week === employment.terms.startWeek
    && r.talentId === promise.beneficiaryPersonId && r.studioId === promise.issuerStudioId))
}

describe.skipIf(!APPROVED)('P14B.8-T0b: mint a genuine V32 world whose open promise still owes TWO', () => {
  it('runs the archived part-served route and stops at the freeze, then PROVES the case it exists for', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. ──────────────────────────────────────────────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(LIVE_SAVE_VERSION).toBe(32)
    expect(PROMISE_RULES_VERSION).toBe(4)
    expect(RELATIONSHIP_RULES_VERSION).toBe(1)
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(49)
    expect(git('status', '--porcelain', '--', 'src/', 'bridge/', 'generated/', 'ui/', 'scripts/',
      'tests/helpers/', 'tests/fixtures/', 'package.json', 'package-lock.json')).toBe('')
    const remoteHead = git('ls-remote', 'origin', BRANCH).trim().split(/\s+/)[0] ?? ''
    const publishedRecoverySha = remoteHead === HEAD_SHA ? HEAD_SHA : null

    const outDir = new URL(OUT_RELATIVE + '/', REPO)
    if (existsSync(outDir)) throw new Error(`Refusing fixture overwrite: ${OUT_RELATIVE} already exists`)

    // ── 2. The archived route, verbatim, STOPPING AT THE FREEZE. ────────────
    const worldStart = performance.now()
    let ps = fund(p13aGeneratedStudio())
    const psTarget = sign(ps, 'actor', 104); ps = psTarget.state
    const psWriter = sign(ps, 'writer'); ps = psWriter.state
    const psDirector = sign(ps, 'director'); ps = psDirector.state
    const psOther1 = sign(ps, 'actor'); ps = psOther1.state
    const psOther2 = sign(ps, 'actor'); ps = psOther2.state
    const psCraft = sign(ps, 'craft'); ps = psCraft.state
    const psContract = ps.contracts.find((c) => c.talentId === psTarget.id)
    assert.ok(psContract)
    const psStart = psContract.endWeekExclusive

    // The throwaway greenlight feeds `existingPath` at BOTH the attach-time and
    // freeze-time feasibility checks (record 722's own measured comment):
    // seatedPreFirstTake(1) + stockGreenlightAvailable(1) = 2, which is exactly
    // what a count-2 promise needs and, per record 747, the ceiling M16 allows.
    const throwaway = unusedConcept(ps)
    ps = applyActions(ps, [{ kind: 'greenlight', production: {
      conceptId: throwaway.id, writerId: psWriter.id, directorId: psDirector.id,
      cast: { lead: psOther1.id, antagonist: psOther2.id, support: psTarget.id }, craftIds: [psCraft.id],
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: throwaway.genre, intendedSegments: ['adult'], ranges: {
        intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
      budget: { negative: throwaway.baseNegativeCost, marketing: 0 },
    } }])
    const throwawayId = ps.studio.activeProductions.at(-1)!.id
    assert.equal(ps.firstTakes.some((take) => take.productionId === throwawayId), false)
    ps = readySoundstage(ps)
    assert.ok(ps.market.tick <= psStart - 7)
    ps = advanceTo(ps, psStart - 7)
    const submittedWeek = ps.market.tick
    ps = submitProposal(ps, { talentId: psTarget.id, issuerStudioId: player(ps), termWeeks: 104, premiumTier: 1.25 })
    ps = attachPromise(ps, psTarget.id, player(ps), {
      family: 'APPEARANCE_COUNT', predicate: { count: 2 },
      windowStartWeek: psStart, dueWeekExclusive: psStart + 90,
    })
    const proposal = currentProposals(ps, psTarget.id).find((p) => p.issuerStudioId === player(ps))
    assert.ok(proposal)
    assert.equal(proposal.promises.length, 1)
    const promiseId = proposal.promises[0]!
    const draft = root(ps, promiseId)
    assert.equal(draft.contractId, null)
    assert.equal(draft.feasibilityReceipt.classification, 'REASONABLY_ACHIEVABLE')
    assert.equal(draft.feasibilityReceipt.rulesVersion, 4)

    // THE FREEZE. This is the stopping point: record 722 continues into a
    // greenlight and one filmed take to reach progress 1; this world does not.
    ps = advanceTo(ps, psStart)
    const bound = root(ps, promiseId)
    binding(ps, bound)
    const worldBuildMs = performance.now() - worldStart

    // ── 3. The shape this fixture exists to have. ───────────────────────────
    expect(bound.outcome).toBeNull()
    expect(bound.predicate.count).toBe(2)
    expect(bound.progress).toBe(0)
    expect(bound.evidenceRefs).toEqual([])
    expect(bound.predicate.count - bound.progress).toBe(2)
    expect(bound.supersededByPromiseId).toBeNull()
    expect(ps.market.tick).toBeLessThan(bound.dueWeekExclusive)
    expect(ps.firstTakes.filter((take) => take.week >= bound.windowStartWeek)).toEqual([])

    // ── 4. PROVE THE CASE AT MINT TIME, in the artifact's own provenance. ───
    // A fixture that claims to reach a refusal and does not is worse than no
    // fixture. Both directions are measured here, on the live engine, before a
    // single byte is written.
    const today = ps.market.tick
    const window = { windowStartWeek: today + 1, dueWeekExclusive: today + 61 } as const
    const positiveButInsufficient: PromiseAttachment = {
      family: 'APPEARANCE_COUNT', predicate: { count: 1 }, ...window,
    }
    const exactlyEnough: PromiseAttachment = {
      family: 'APPEARANCE_COUNT', predicate: { count: 2 }, ...window,
    }
    const refusal = waiverAccepted(ps, bound, positiveButInsufficient, today)
    const acceptance = waiverAccepted(ps, bound, exactlyEnough, today)
    // The Owner's protection, exercised with a count the WIRE admits (minimum 1).
    expect(refusal).toBe('only 1 of the 2 pictures still owed would be covered')
    expect(acceptance).toBeNull()
    const ownerCase = {
      question: 'a substitute count that is POSITIVE and still INSUFFICIENT, separated from the '
        + 'zero-count case which the wire refuses before any engine rule runs',
      originalCount: bound.predicate.count,
      originalProgress: bound.progress,
      remainingObligation: bound.predicate.count - bound.progress,
      substituteCountRefused: 1,
      refusalSentence: refusal,
      substituteCountAccepted: 2,
      acceptanceIsNull: acceptance === null,
      measuredAtWeek: today,
      limitation: 'At progress 0 the remaining obligation equals the original count, so this world '
        + 'alone cannot tell `count` from `count - progress`. That discrimination is pinned '
        + 'separately on genuine-v31-part-served-p1 (count 2, progress 1) by group13 of '
        + 'tests/p14b7-promise-waiver.test.ts, proven by defect injection at record 743. '
        + 'The two worlds are complementary; neither replaces the other.',
      whyNotTheOwnersLiteralNumbers: 'Record 747 measured 3/1/2 and it is blocked by M16 '
        + 'exclusivity, not by fixture construction: count 3 reads FRAGILE "needs a picture not '
        + 'yet commissioned", the only lever that lifts existingPath is a second production '
        + 'seating the same person, and an attached FRAGILE promise does not bind at the freeze.',
    }

    // ── 5. Save at the LIVE writer, round-trip, then write. ─────────────────
    const save = makeSave(ps)
    const saveJson = exportSave(save)
    expect(save.saveVersion).toBe(32)
    expect(exportSave(validateSaveV32(JSON.parse(saveJson)))).toBe(saveJson)
    const rawBytes = Buffer.from(saveJson, 'utf8')
    const compressed = gzipSync(rawBytes)
    if (gunzipSync(compressed).toString('utf8') !== saveJson) {
      throw new Error('gzip round trip is not byte-stable in memory')
    }
    const uncompressedSha256 = sha(rawBytes)
    const compressedSha256 = sha(compressed)

    const facts = {
      filename: NAME + '.json.gz',
      provenanceFilename: NAME + '.provenance.json',
      seed: 'p13a-core-causal-01',
      week: ps.market.tick,
      saveVersion: save.saveVersion,
      uncompressedSha256,
      compressedSha256,
      byteLength: rawBytes.byteLength,
      compressedByteLength: compressed.byteLength,
      rootCounts: {
        promises: ps.promises.length,
        firstTakes: ps.firstTakes.length,
        marketReceipts: ps.talentMarket.receipts.length,
        currentProposals: ps.talentMarket.proposals.length,
        relationshipEdges: ps.relationships.length,
      },
      focus: [{
        promiseId: bound.promiseId,
        family: bound.family,
        predicate: bound.predicate,
        version: bound.version,
        issuerStudioId: bound.issuerStudioId,
        beneficiaryPersonId: bound.beneficiaryPersonId,
        windowStartWeek: bound.windowStartWeek,
        dueWeekExclusive: bound.dueWeekExclusive,
        contractId: bound.contractId,
        outcome: bound.outcome,
        outcomeWeek: bound.outcomeWeek,
        outcomeEventId: bound.outcomeEventId,
        supersededByPromiseId: bound.supersededByPromiseId,
        evidenceRefs: bound.evidenceRefs,
        progress: bound.progress,
        originalFeasibilityReceipt: bound.feasibilityReceipt,
      }],
      ownerCase,
    }
    const authority = {
      phase: 'P14B.8 T0b / a genuine V32 world with a remaining obligation of TWO, '
        + 'which no published fixture had',
      headSha: HEAD_SHA,
      publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: git ls-remote origin ' + BRANCH + ' did not return the minting head.'
        : 'PUBLISHED: git ls-remote origin ' + BRANCH + ' returned the minting head at mint time.',
      closeoutRelativePath: CLOSEOUT_RELATIVE,
      closeoutSha256: sha(bytesOf(CLOSEOUT_RELATIVE)),
      expansionRelativePath: EXPANSION_RELATIVE,
      expansionSha256: sha(bytesOf(EXPANSION_RELATIVE)),
      measurementRelativePath: MEASUREMENT_RELATIVE,
      measurementSha256: sha(bytesOf(MEASUREMENT_RELATIVE)),
      schemaId: SCHEMA_ID,
      projectionVersion: PROJECTION_VERSION,
      protocolVersion: PROTOCOL_VERSION,
      saveVersion: LIVE_SAVE_VERSION,
      promiseRulesVersion: PROMISE_RULES_VERSION,
      relationshipRulesVersion: RELATIONSHIP_RULES_VERSION,
      approvalEnvironmentVariable: APPROVAL_VARIABLE,
      outputRelativePath: OUT_RELATIVE,
    }
    const provenance = {
      authority,
      observedHeadSha: HEAD_SHA,
      minterRelativePath: MINTER_RELATIVE,
      minterSha256: sha(bytesOf(MINTER_RELATIVE)),
      minterArchivedRelativePath:
        'docs/engineering/playability-launch-review/evidence/p14b4-20260919/748-mint-v32-owes-two-minter.test.ts',
      minterReproduction: 'Archived at minterArchivedRelativePath and removed from tests/, so no '
        + 'suite collects it. Reproducing requires copying the archived bytes back to '
        + MINTER_RELATIVE + ' before running the recorded command.',
      nodeVersion: process.version,
      startedAt,
      endedAt: new Date().toISOString(),
      worldBuildMs,
      command: `${APPROVAL_VARIABLE}=${HEAD_SHA} node_modules/.bin/vitest run ${MINTER_RELATIVE}`
        + ' --minWorkers=1 --maxWorkers=1',
      campaign: 'generated test campaign, never Owner save',
      recipe: {
        builder: 'record 722 part-served-p1 route (lines 224-260), COPIED, STOPPED AT THE FREEZE',
        generatedCampaignOnly: true,
        economicInput: 'explicit fund helper cash delta with matching ledger',
        divergenceFromArchivedRoute: 'record 722 continues past the freeze into a real greenlight '
          + 'and one filmed take, reaching progress 1 and remaining 1. This world STOPS at the '
          + 'freeze, so progress stays 0 and the remaining obligation is 2.',
        actions: [
          'real signContract x6',
          'real greenlight of ONE throwaway seating the target pre-first-take (feeds existingPath '
            + 'at both the attach-time and freeze-time feasibility checks)',
          'real strikeSet/commissionSet set-grand-ballroom',
          `real submitProposal at ${String(submittedWeek)}`,
          `real attachPromise APPEARANCE_COUNT count2 window [${String(psStart)},${String(psStart + 90)})`,
          `real market freeze at ${String(psStart)} binds the promise to the winning contract`,
          'NO greenlight of a focus production and NO filmed take',
        ],
        compression: 'node:zlib gzipSync with library defaults',
      },
      scope: 'a genuine bound OPEN V32 promise with remaining obligation 2; no future migration, '
        + 'no native and no Owner acceptance claim',
      ...facts,
    }
    const manifest = { authority, fixtures: [facts] }

    mkdirSync(outDir)
    writeFileSync(new URL(facts.filename, outDir), compressed, { flag: 'wx' })
    writeFileSync(new URL(facts.provenanceFilename, outDir),
      JSON.stringify(provenance, null, 2) + '\n', { flag: 'wx' })
    writeFileSync(new URL('MANIFEST.json', outDir),
      JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })

    // ── 6. Re-read from DISK and prove the artifact, not the in-memory value. ─
    const onDisk = readFileSync(new URL(facts.filename, outDir))
    expect(sha(onDisk)).toBe(compressedSha256)
    const reread = gunzipSync(onDisk).toString('utf8')
    if (reread !== saveJson) throw new Error(`${facts.filename}: gzip round trip is not byte-stable on disk`)
    const rereadSave = validateSaveV32(JSON.parse(reread))
    expect(exportSave(rereadSave)).toBe(reread)
    const rereadPromise = rereadSave.state.promises.find((p) => p.promiseId === promiseId)
    expect(rereadPromise?.predicate.count).toBe(2)
    expect(rereadPromise?.progress).toBe(0)
    expect(rereadPromise?.contractId).not.toBeNull()
    // The case survives the save/load round trip, not only the in-memory state.
    expect(waiverAccepted(rereadSave.state, rereadPromise!, positiveButInsufficient, today))
      .toBe('only 1 of the 2 pictures still owed would be covered')

    console.log(JSON.stringify({
      emitted: [
        { path: `${OUT_RELATIVE}/${facts.filename}`, sha256: compressedSha256, byteLength: compressed.byteLength },
        { path: `${OUT_RELATIVE}/${facts.provenanceFilename}`,
          sha256: sha(bytesOf(`${OUT_RELATIVE}/${facts.provenanceFilename}`)) },
        { path: `${OUT_RELATIVE}/MANIFEST.json`, sha256: sha(bytesOf(`${OUT_RELATIVE}/MANIFEST.json`)) },
      ],
      uncompressedSha256, week: facts.week, rootCounts: facts.rootCounts, ownerCase, publishedRecoverySha,
    }, null, 2))
  }, 600_000)
})
