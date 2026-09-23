// P14B.8-T0a ONE-OFF MINTER — genuine OUTGOING projection-49 runtime checkpoint.
//
// ORDER-CRITICAL. Run BEFORE any file touches PROJECTION_VERSION. Once B.8 bumps
// 49 -> 50 this file can no longer mint a genuine 49 artifact, and its own live
// guards below refuse to try.
//
// INERT BY DEFAULT. Every ordinary suite run collects this file and SKIPS it. It
// mints only when STUDIO_MINT_PROJECTION49_APPROVED equals the observed head sha,
// so the mint cannot fire by accident, on CI, or on a moved tree.
//
//   STUDIO_MINT_PROJECTION49_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/bridge-p14b8-mint-projection49.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// Series precedent: genuine-projection46-runtime (P14B.4), 47 (P14B.5) and 48
// (P14B.6, archived minter at evidence/p14b4-20260919/697-mint-projection48-minter.test.ts).
// This file reproduces that recipe at the CURRENT identities: projection 49,
// protocol 4, Save V32, promise rules 4, relationship rules 1. The recipe itself
// is unchanged — real save, real quote, real committed withdrawal, two same-week
// slots with different digests — so the artifact is comparable to its siblings.
//
// The ONE substantive difference from 697 is section 6: the version comparison
// measures V31 -> V32, whose entire delta is `supersededByPromiseId: null` on
// every promise, instead of 697's V30 -> V31 relationship-root comparison.
//
// The campaign is generated in-process by the repository's own fixture builder.
// No Owner save, profile or home-directory file is read.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import {
  encodeBridgeRuntimeCheckpoint,
  loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
} from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'
import { PROMISE_RULES_VERSION } from '../src/core/promises.js'
import { RELATIONSHIP_RULES_VERSION } from '../src/core/relationships.js'
import {
  exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToV32, validateSaveV32,
} from '../src/core/save.js'
import type { BridgeMarketProposalDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { retentionFixture } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const NAME = 'genuine-projection49-runtime'
const OUT_RELATIVE = 'tests/fixtures/p14/' + NAME
const MINTER_RELATIVE = 'tests/bridge-p14b8-mint-projection49.test.ts'
const SESSION_ID = 'p14b8-genuine-outgoing49'
const TALENT_ID = 't-act-09'
const FOCUS_PROMISE_ID = 'promise-0'
const APPROVAL_VARIABLE = 'STUDIO_MINT_PROJECTION49_APPROVED'
const BRANCH = 'wip/headless-program-20260916-ts'

// P14B.7 (records 742 closeout, 743 gap closure) is the authority for the source
// these bytes come from. `d5293b1f` carries the bytes run 739 tested on a fixed
// source; HEAD adds test and docs commits only, and the producer diff below is
// asserted EMPTY rather than assumed.
const CLOSEOUT_RELATIVE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/742-b7-checkpoint.md'
const GAP_CLOSURE_RELATIVE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/743-b7-gaps-closed.md'
const TESTED_SOURCE_SHA = 'd5293b1f8f2acd1771067a4dacd138c9bea7ae99'
// The V31 corpus world minted at the last behavioural V31 writer (record 722).
// Read only to MEASURE what the save bump adds; never copied into the emitted bytes.
const CORPUS_V31_RELATIVE = 'tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-bound-open-p1.json.gz'

// The producing surface: the projection-48 list plus the three files B.7 changed
// that were not already on it (the trust word table and the industry fold whose
// exclusion B.7 proved, and the two B.7 suites that qualified the slice).
const SOURCE_FILES = [
  'src/core/save.ts', 'src/core/promises.ts', 'src/core/relationships.ts', 'src/core/talentMarket.ts',
  'src/core/tick.ts', 'src/core/actions.ts', 'src/core/types.ts', 'src/core/index.ts',
  'src/core/tuning.ts', 'src/core/worldgen.ts', 'src/core/hollywood.ts', 'src/core/operations.ts',
  'src/core/technologyProduction.ts', 'src/core/hollywoodPolicy.ts', 'src/core/hollywoodTick.ts',
  'src/core/promiseCapacityOwners.ts', 'src/core/promiseCapacityEnumerator.ts',
  'src/core/promiseCapacityOwnerReplay.ts', 'src/harness/p13a/fixtures.ts',
  'bridge/contract.ts', 'bridge/session.ts', 'bridge/protocol.ts', 'bridge/runtime-checkpoint.ts',
  'bridge/promises.ts', 'bridge/people.ts', 'bridge/trust.ts', 'bridge/industry.ts',
  'bridge/schema/bridge-schema.ts',
  'generated/unity/StudioBridgeDtos.Generated.cs', 'ui/src/engine/adapter.ts', 'ui/vite.config.ts',
  'ui/tsconfig.json', 'tsconfig.json', 'tsconfig.src.json', 'tsconfig.bridge.json',
  'vitest.config.ts', 'vitest.workspace.ts', 'package.json', 'package-lock.json',
  'tests/helpers/p14b2-fixtures.ts', 'tests/p14b1-t4-regressions.test.ts',
  'tests/p14b4-cast-class-outcomes.test.ts', 'tests/p14b5-t-failure-tuning.test.ts',
  'tests/p14b7-promise-waiver.test.ts', 'tests/bridge-p14b7-promise-waiver.test.ts',
  'tests/fixtures/p14/genuine-v31-pre-b7/MANIFEST.json',
  CORPUS_V31_RELATIVE,
] as const

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
  // Disclosed, never silent: a set-but-wrong variable is the most likely way a
  // real mint attempt turns into a no-op, so say why instead of skipping mutely.
  console.warn(`[p14b8-mint] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
}

describe.skipIf(!APPROVED)('P14B.8-T0a: mint the genuine OUTGOING projection-49 runtime checkpoint', () => {
  it('emits checkpoint, provenance and MANIFEST on the 48 series shape at the CURRENT identities', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. 49 must still be the RUNNING projection. ──────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(49)
    expect(LIVE_SAVE_VERSION).toBe(32)
    expect(PROMISE_RULES_VERSION).toBe(4)
    expect(RELATIONSHIP_RULES_VERSION).toBe(1)
    // A genuine OUTGOING artifact is minted while its identity is still the
    // running one, i.e. before it is ever registered as a prior schema.
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)

    // ── 2. Producing tree must be exactly the tested bytes, and clean. ───────
    expect(git('status', '--porcelain', '--', 'src/', 'bridge/', 'generated/', 'ui/', 'scripts/',
      'tests/helpers/', 'tests/fixtures/', 'package.json', 'package-lock.json',
      'tsconfig.json', 'tsconfig.src.json', 'tsconfig.bridge.json',
      'vitest.config.ts', 'vitest.workspace.ts')).toBe('')
    const producerPaths = ['src/', 'bridge/', 'generated/', 'ui/', 'scripts/']
    const textOnlyProducerDiffSha256 = sha(git('diff', TESTED_SOURCE_SHA, HEAD_SHA, '--', ...producerPaths))
    // HEAD is the tested source plus text only: zero producing bytes moved.
    expect(git('diff', '--stat', TESTED_SOURCE_SHA, HEAD_SHA, '--', ...producerPaths)).toBe('')
    const closeoutSha256 = sha(bytesOf(CLOSEOUT_RELATIVE))
    const gapClosureSha256 = sha(bytesOf(GAP_CLOSURE_RELATIVE))
    // PUBLICATION, by the instrument that actually works in a worktree. This tree
    // holds no refs/remotes/<branch>, so `for-each-ref --contains` is not a
    // publication test here (the 48 MANIFEST records that exact bookkeeping error).
    // `ls-remote` asks the remote itself.
    const remoteHead = git('ls-remote', 'origin', BRANCH).trim().split(/\s+/)[0] ?? ''
    const publishedRecoverySha = remoteHead === HEAD_SHA ? HEAD_SHA : null

    // ── 3. Refuse any overwrite BEFORE a single byte is produced. ────────────
    const outDir = new URL(OUT_RELATIVE + '/', REPO)
    if (existsSync(outDir)) throw new Error(`Refusing fixture overwrite: ${OUT_RELATIVE} already exists`)

    // ── 4. The recipe (projection-48 provenance, reproduced under V32). ──────
    const worldStart = performance.now()
    const submitted = retentionFixture().submitted
    const worldBuildMs = performance.now() - worldStart
    expect(submitted.market.tick).toBe(45)
    const corpusSaveJson = exportSave(makeSave(submitted))
    const session = new BridgeSession(submitted, SESSION_ID)
    const control = (commandId: string) => ({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId, expectedStateRevision: session.stateRevision,
    })
    const saved = session.save(control('save-current-p1'))
    if (!saved.accepted) throw new Error(`save-current-p1 refused: ${saved.message}`)
    expect(saved.saveJson).toBe(corpusSaveJson)

    const withdrawal: BridgeMarketProposalDraftPayload =
      { verb: 'withdraw', talentId: TALENT_ID, termWeeks: null, premiumTier: null }
    const quoted = session.quote({ ...control('quote-withdraw'), type: 'quoteMarketProposal', draft: withdrawal })
    if (!quoted.accepted) throw new Error(`quote-withdraw refused: ${quoted.message}`)
    expect(quoted.quote.kind).toBe('marketProposalAction')
    expect(quoted.quote.ok).toBe(true)
    const quoteIntentId = quoted.quote.intentId
    const committed = session.command({
      ...control('commit-withdraw'), type: 'submitIntent', payload: { intentId: quoteIntentId },
    })
    if (!committed.accepted) throw new Error(`commit-withdraw refused: ${committed.message}`)
    expect(session.stateRevision).toBe(1)

    // ── 5. Two SAME-week DIFFERENT slots; the promise history survives. ──────
    const checkpoint = session.exportRuntimeCheckpoint()
    const savedSaveJson = checkpoint.savedSaveJson
    if (savedSaveJson === null) throw new Error('Fixture requires a real saved slot')
    expect(checkpoint.currentSaveJson).not.toBe(savedSaveJson)
    expect(savedSaveJson).toBe(corpusSaveJson)
    const current = validateSaveV32(JSON.parse(checkpoint.currentSaveJson))
    const savedSlot = validateSaveV32(JSON.parse(savedSaveJson))
    expect(current.saveVersion).toBe(32)
    expect(savedSlot.saveVersion).toBe(32)
    expect(current.state.market.tick).toBe(45)
    expect(savedSlot.state.market.tick).toBe(45)
    expect(exportSave(current)).toBe(checkpoint.currentSaveJson)
    expect(exportSave(savedSlot)).toBe(savedSaveJson)
    // The withdrawal clears the CURRENT proposal, never the promise root.
    expect(current.state.promises).toEqual(savedSlot.state.promises)
    expect(current.state.promises.some((p) => p.promiseId === FOCUS_PROMISE_ID)).toBe(true)
    expect(savedSlot.state.talentMarket.proposals
      .filter((p) => p.promises.includes(FOCUS_PROMISE_ID))).toHaveLength(1)
    expect(current.state.talentMarket.proposals
      .filter((p) => p.promises.includes(FOCUS_PROMISE_ID))).toEqual([])
    expect(checkpoint.journal.map(({ route, commandId }) => ({ route, commandId }))).toEqual([
      { route: 'save', commandId: 'save-current-p1' },
      { route: 'command', commandId: 'commit-withdraw' },
    ])
    // B.7's own law, asserted on the minted world rather than assumed: this is a
    // pre-waiver world, so every promise carries the V32 field at its null root.
    expect(current.state.promises.every((p) => p.supersededByPromiseId === null)).toBe(true)
    expect(current.state.promises.every((p) => p.outcome !== 'WAIVED')).toBe(true)

    // ── 6. What V32 adds, MEASURED against the archived V31 corpus world. ────
    // The ENTIRE V31 -> V32 delta is one field per promise. Measured by stripping
    // it back off the migrated promises and requiring the V31 rows exactly.
    const corpusV31Json = gunzipSync(bytesOf(CORPUS_V31_RELATIVE)).toString('utf8')
    const migratedCorpus = migrateToV32(importSave(corpusV31Json))
    const migratedCorpusJson = exportSave(migratedCorpus)
    const v31Promises = (JSON.parse(corpusV31Json) as { state: { promises: readonly Record<string, unknown>[] } })
      .state.promises
    const strippedForward = migratedCorpus.state.promises.map((promise) => {
      const { supersededByPromiseId: _dropped, ...rest } = promise
      return rest
    })
    const v32Comparison = {
      corpusV31RelativePath: CORPUS_V31_RELATIVE,
      corpusV31Sha256: sha(corpusV31Json),
      corpusV31SaveVersion: (JSON.parse(corpusV31Json) as { saveVersion: number }).saveVersion,
      migratedCorpusSha256: sha(migratedCorpusJson),
      migratedCorpusSaveVersion: migratedCorpus.saveVersion,
      promiseRows: migratedCorpus.state.promises.length,
      everyMigratedPromiseLinkIsNull:
        migratedCorpus.state.promises.every((p) => p.supersededByPromiseId === null),
      strippingTheNewFieldReproducesV31Exactly:
        JSON.stringify(strippedForward) === JSON.stringify(v31Promises),
      savedSlotEqualsMigratedCorpus: migratedCorpusJson === savedSaveJson,
      note: 'The whole V31 -> V32 delta is `supersededByPromiseId` on ProfessionalPromise. '
        + 'The archived V31 corpus world migrates forward with that field null on every row, and '
        + 'removing it again reproduces the V31 promise rows byte for byte. This minted world is '
        + 'NOT the corpus world: it is built from live shared work at the V32 writer, so the two '
        + 'are not byte-equal, exactly as the 48 artifact was not byte-equal to its V30 corpus.',
    }
    expect(v32Comparison.corpusV31SaveVersion).toBe(31)
    expect(v32Comparison.migratedCorpusSaveVersion).toBe(32)
    expect(v32Comparison.everyMigratedPromiseLinkIsNull).toBe(true)
    expect(v32Comparison.strippingTheNewFieldReproducesV31Exactly).toBe(true)
    expect(current.state.relationships).toEqual(savedSlot.state.relationships)

    // ── 7. Encode, compress, and prove the round trip IN MEMORY first. ───────
    const encoded = encodeBridgeRuntimeCheckpoint(checkpoint)
    expect(canonicalJson(checkpoint) + '\n').toBe(encoded)
    const rawBytes = Buffer.from(encoded, 'utf8')
    const compressed = gzipSync(rawBytes)
    if (gunzipSync(compressed).toString('utf8') !== encoded) {
      throw new Error('gzip round trip is not byte-stable in memory')
    }
    // Reopening the CURRENT identity must not migrate and must re-encode identically.
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => {
      throw new Error('the running schema must not create a migration session')
    })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(encodeBridgeRuntimeCheckpoint(
      BridgeSession.fromRuntimeCheckpoint(reopened.hydrated).exportRuntimeCheckpoint())).toBe(encoded)

    const uncompressedSha256 = sha(rawBytes)
    const compressedSha256 = sha(compressed)
    const currentSaveSha256 = sha(checkpoint.currentSaveJson)
    const savedSaveSha256 = sha(savedSaveJson)
    expect(checkpoint.currentStateDigest).toBe(currentSaveSha256)
    expect(checkpoint.savedStateDigest).toBe(savedSaveSha256)
    // The Owner's stated requirement for this artifact, asserted rather than implied.
    expect(currentSaveSha256).not.toBe(savedSaveSha256)

    // ── 8. Provenance, then write. MANIFEST last, every write exclusive. ─────
    const sourceFiles: Record<string, string> = {}
    for (const relative of SOURCE_FILES) sourceFiles[relative] = sha(bytesOf(relative))
    const facts = {
      filename: NAME + '.checkpoint.json.gz',
      provenanceFilename: NAME + '.provenance.json',
      uncompressedSha256,
      compressedSha256,
      byteLength: rawBytes.byteLength,
      compressedByteLength: compressed.byteLength,
      schemaId: SCHEMA_ID,
      protocolVersion: PROTOCOL_VERSION,
      projectionVersion: PROJECTION_VERSION,
      currentSaveVersion: current.saveVersion,
      savedSaveVersion: savedSlot.saveVersion,
      currentSaveSha256,
      savedSaveSha256,
      currentWeek: current.state.market.tick,
      savedWeek: savedSlot.state.market.tick,
      stateRevision: checkpoint.stateRevision,
      journalEntries: checkpoint.journal.length,
      journalDigest: checkpoint.journalDigest,
      sessionId: SESSION_ID,
      focusPromiseId: FOCUS_PROMISE_ID,
      talentId: TALENT_ID,
    }
    const authority = {
      phase: 'qualified P14B.7 promise-waiver checkpoint (742, gaps closed 743) / '
        + 'exact last-projection-49 upstream before B.8',
      testedSourceSha: TESTED_SOURCE_SHA,
      testedRunLabel: '739-b7-full-core-confirm, fixedSource: true, 3151.67s',
      textOnlySourceSha: HEAD_SHA,
      textOnlyProducerDiffSha256,
      publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: git ls-remote origin ' + BRANCH + ' did not return the minting head. '
          + 'This artifact carries no publication receipt.'
        : 'PUBLISHED: git ls-remote origin ' + BRANCH + ' returned the minting head at mint time. '
          + 'ls-remote is the instrument because this worktree holds no refs/remotes/' + BRANCH + ', '
          + 'so for-each-ref --contains is not a publication test here (the 48 MANIFEST records that '
          + 'exact bookkeeping error and its correction).',
      closeoutRelativePath: CLOSEOUT_RELATIVE,
      closeoutSha256,
      gapClosureRelativePath: GAP_CLOSURE_RELATIVE,
      gapClosureSha256,
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
      sourceFiles,
      minterRelativePath: MINTER_RELATIVE,
      minterSha256: sha(bytesOf(MINTER_RELATIVE)),
      minterArchivedRelativePath:
        'docs/engineering/playability-launch-review/evidence/p14b4-20260919/746-mint-projection49-minter.test.ts',
      minterReproduction: 'The minter is archived at minterArchivedRelativePath and removed from '
        + 'tests/, so no suite collects it: the core project include is tests/**/*.test.ts and the '
        + 'ui project include is ui/**/*.test.{ts,tsx}. Reproducing the mint requires copying the '
        + 'archived bytes back to ' + MINTER_RELATIVE + ', the path the recorded command names, '
        + 'before running that command.',
      closeoutSha256,
      nodeVersion: process.version,
      startedAt,
      endedAt: new Date().toISOString(),
      worldBuildMs,
      command: `${APPROVAL_VARIABLE}=${HEAD_SHA} node_modules/.bin/vitest run ${MINTER_RELATIVE}`
        + ' --minWorkers=1 --maxWorkers=1',
      campaign: 'generated test campaign, never Owner save',
      recipe: {
        builder: 'tests/helpers/p14b2-fixtures.ts:retentionFixture().submitted (the corpus current-p1 world)',
        economicInput: 'explicit fund helper cash delta with matching ledger',
        actions: [
          'real save with CURRENT P1',
          'real quote and commit withdrawal; retained unbound promise history',
        ],
        quoteIntentId,
        commandId: 'commit-withdraw',
        savedSlotIsCorpusWorld: 'savedSaveJson equals exportSave(makeSave(current-p1 state)) at the '
          + 'LIVE V32 writer; it is NOT byte-comparable with the V31 pre-b7 corpus files',
        compression: 'node:zlib gzipSync with library defaults',
        reproducibility: 'NOT byte-reproducible: journaled response bytes carry real processingMs.',
        waiverContent: 'NONE. This is a pre-waiver world: every promise carries '
          + 'supersededByPromiseId null and no promise is WAIVED. The artifact exists to carry the '
          + 'OUTGOING projection-49 identity across the B.8 bump, not to exercise B.8 behaviour; '
          + "B.8's own integration coverage builds waived worlds live and saves them.",
      },
      v32Comparison,
      scope: 'genuine outgoing runtime49 authority and V32 gameplay slots; no future migration, '
        + 'no native and no Owner acceptance claim',
      ...facts,
    }
    const manifest = { authority, fixtures: [facts] }

    mkdirSync(outDir) // non-recursive: an existing directory is a hard failure
    writeFileSync(new URL(facts.filename, outDir), compressed, { flag: 'wx' })
    writeFileSync(new URL(facts.provenanceFilename, outDir),
      JSON.stringify(provenance, null, 2) + '\n', { flag: 'wx' })
    writeFileSync(new URL('MANIFEST.json', outDir),
      JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })

    // ── 9. Re-read from DISK and prove the artifact, not the in-memory value. ─
    const onDisk = readFileSync(new URL(facts.filename, outDir))
    expect(sha(onDisk)).toBe(compressedSha256)
    const reread = gunzipSync(onDisk).toString('utf8')
    if (reread !== encoded) throw new Error(`${facts.filename}: gzip round trip is not byte-stable on disk`)
    expect(sha(reread)).toBe(uncompressedSha256)
    const rereadCheckpoint = JSON.parse(reread) as { currentSaveJson: string; savedSaveJson: string }
    expect(canonicalJson(rereadCheckpoint) + '\n').toBe(reread)
    expect(exportSave(validateSaveV32(JSON.parse(rereadCheckpoint.currentSaveJson))))
      .toBe(rereadCheckpoint.currentSaveJson)
    expect(exportSave(validateSaveV32(JSON.parse(rereadCheckpoint.savedSaveJson))))
      .toBe(rereadCheckpoint.savedSaveJson)

    console.log(JSON.stringify({
      emitted: [
        { path: `${OUT_RELATIVE}/${facts.filename}`, sha256: compressedSha256, byteLength: compressed.byteLength },
        { path: `${OUT_RELATIVE}/${facts.provenanceFilename}`,
          sha256: sha(bytesOf(`${OUT_RELATIVE}/${facts.provenanceFilename}`)),
          byteLength: bytesOf(`${OUT_RELATIVE}/${facts.provenanceFilename}`).byteLength },
        { path: `${OUT_RELATIVE}/MANIFEST.json`,
          sha256: sha(bytesOf(`${OUT_RELATIVE}/MANIFEST.json`)),
          byteLength: bytesOf(`${OUT_RELATIVE}/MANIFEST.json`).byteLength },
      ],
      uncompressedSha256, byteLength: rawBytes.byteLength,
      schemaId: SCHEMA_ID, projectionVersion: PROJECTION_VERSION, saveVersion: LIVE_SAVE_VERSION,
      publishedRecoverySha, v32Comparison,
    }, null, 2))
  }, 600_000)
})
