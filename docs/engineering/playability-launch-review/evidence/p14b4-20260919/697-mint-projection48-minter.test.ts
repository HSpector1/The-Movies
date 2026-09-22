// P14B.6-T0 ONE-OFF MINTER — genuine OUTGOING projection-48 runtime checkpoint.
//
// ORDER-CRITICAL. Run BEFORE any file touches PROJECTION_VERSION. Once B.6 bumps
// 48 -> 49 this file can no longer mint a genuine 48 artifact, and its own live
// guards below refuse to try.
//
// INERT BY DEFAULT. Every ordinary suite run collects this file and SKIPS it. It
// mints only when STUDIO_MINT_PROJECTION48_APPROVED equals the observed head sha,
// so the mint cannot fire by accident, on CI, or on a moved tree.
//
//   STUDIO_MINT_PROJECTION48_APPROVED=$(git rev-parse HEAD) \
//     node_modules/.bin/vitest run tests/bridge-p14b6-mint-projection48.test.ts \
//     --minWorkers=1 --maxWorkers=1
//
// Series precedent: tests/fixtures/p14/genuine-projection46-runtime (P14B.4) and
// genuine-projection47-runtime (P14B.5). Their provenance files record the recipe
// this file reproduces; the minters themselves were removed after use and are in
// no commit, so this is a reconstruction FROM the recorded provenance, not a copy.
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
  exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToV31, validateSaveV31,
} from '../src/core/save.js'
import type { BridgeMarketProposalDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { retentionFixture } from './helpers/p14b2-fixtures.js'

const REPO = new URL('../', import.meta.url)
const REPO_DIR = fileURLToPath(REPO)
const NAME = 'genuine-projection48-runtime'
const OUT_RELATIVE = 'tests/fixtures/p14/' + NAME
const MINTER_RELATIVE = 'tests/bridge-p14b6-mint-projection48.test.ts'
const SESSION_ID = 'p14b6-genuine-outgoing48'
const TALENT_ID = 't-act-09'
const FOCUS_PROMISE_ID = 'promise-0'
const APPROVAL_VARIABLE = 'STUDIO_MINT_PROJECTION48_APPROVED'

// P14B.5-T (record 693) is the closeout authority for the source these bytes come
// from. `caa8cdb3` carries the bytes run 695 tested (base `63688a79` plus tested
// diff `4c138264…`); `ab405dbe` is that commit plus a docs-only header commit.
const CLOSEOUT_RELATIVE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/693-p14b5t-tuning-checkpoint.md'
const TESTED_SOURCE_SHA = 'caa8cdb39c4f92598777b7b54f84b23cde03cc40'
const TESTED_RUN_BASE_SHA = '63688a796ea930213bc53dafa8d11b416a74d13e'
const TESTED_RUN_DIFF_SHA256 = '4c138264597d383bed1984112c889d88ab0c92a37729727381df14f35a34891c'
// The V30 corpus world this world is the V31 successor of. Read only to MEASURE
// the difference the save bump makes; never copied into the emitted bytes.
const CORPUS_V30_RELATIVE = 'tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-current-p1.json.gz'

// The producing surface, exactly the projection-47 list plus the two files the
// P14B.5/B.5-T work added to it: the relationship writer whose tuning constant
// defines this world's relationship root, and the test that qualified it.
const SOURCE_FILES = [
  'src/core/save.ts', 'src/core/promises.ts', 'src/core/relationships.ts', 'src/core/talentMarket.ts',
  'src/core/tick.ts', 'src/core/actions.ts', 'src/core/types.ts', 'src/core/index.ts',
  'src/core/tuning.ts', 'src/core/worldgen.ts', 'src/core/hollywood.ts', 'src/core/operations.ts',
  'src/core/technologyProduction.ts', 'src/core/hollywoodPolicy.ts', 'src/core/hollywoodTick.ts',
  'src/core/promiseCapacityOwners.ts', 'src/core/promiseCapacityEnumerator.ts',
  'src/core/promiseCapacityOwnerReplay.ts', 'src/harness/p13a/fixtures.ts',
  'bridge/contract.ts', 'bridge/session.ts', 'bridge/protocol.ts', 'bridge/runtime-checkpoint.ts',
  'bridge/promises.ts', 'bridge/people.ts', 'bridge/schema/bridge-schema.ts',
  'generated/unity/StudioBridgeDtos.Generated.cs', 'ui/src/engine/adapter.ts', 'ui/vite.config.ts',
  'ui/tsconfig.json', 'tsconfig.json', 'tsconfig.src.json', 'tsconfig.bridge.json',
  'vitest.config.ts', 'vitest.workspace.ts', 'package.json', 'package-lock.json',
  'tests/helpers/p14b2-fixtures.ts', 'tests/p14b1-t4-regressions.test.ts',
  'tests/p14b4-cast-class-outcomes.test.ts', 'tests/p14b5-t-failure-tuning.test.ts',
  'tests/fixtures/p14/genuine-v29-pre-p2/MANIFEST.json',
  'tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-refused-p2-count-only-current-draft.json.gz',
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
  console.warn(`[p14b6-mint] ${APPROVAL_VARIABLE} is set but does not equal the observed head `
    + `(${JSON.stringify(APPROVAL)} vs ${JSON.stringify(HEAD_SHA)}); the minter stays INERT.`)
}

describe.skipIf(!APPROVED)('P14B.6-T0: mint the genuine OUTGOING projection-48 runtime checkpoint', () => {
  it('emits checkpoint, provenance and MANIFEST on the 47 series shape at the CURRENT identities', () => {
    const startedAt = new Date().toISOString()

    // ── 1. Live-identity gate. 48 must still be the RUNNING projection. ───────
    expect(HEAD_SHA).toBe(git('rev-parse', 'HEAD').trim())
    expect(APPROVAL).toBe(HEAD_SHA)
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(48)
    expect(LIVE_SAVE_VERSION).toBe(31)
    expect(PROMISE_RULES_VERSION).toBe(4)
    expect(RELATIONSHIP_RULES_VERSION).toBe(1)
    // A genuine OUTGOING artifact is minted while its identity is still the
    // running one, i.e. before it is ever registered as a prior schema.
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)

    // ── 2. Producing tree must be exactly the tested bytes, and clean. ────────
    expect(git('status', '--porcelain', '--', 'src/', 'bridge/', 'generated/', 'ui/', 'scripts/',
      'tests/helpers/', 'tests/fixtures/', 'package.json', 'package-lock.json',
      'tsconfig.json', 'tsconfig.src.json', 'tsconfig.bridge.json',
      'vitest.config.ts', 'vitest.workspace.ts')).toBe('')
    const producerPaths = ['src/', 'bridge/', 'generated/', 'ui/', 'scripts/']
    const textOnlyProducerDiffSha256 = sha(git('diff', TESTED_SOURCE_SHA, HEAD_SHA, '--', ...producerPaths))
    // HEAD is the tested source plus text only: zero producing bytes moved.
    expect(git('diff', '--stat', TESTED_SOURCE_SHA, HEAD_SHA, '--', ...producerPaths)).toBe('')
    const closeoutSha256 = sha(bytesOf(CLOSEOUT_RELATIVE))
    // Not on any remote ref => no publication receipt exists. Recorded as null.
    const publishedRecoverySha = git('for-each-ref', '--contains', HEAD_SHA, 'refs/remotes').trim() === ''
      ? null : HEAD_SHA

    // ── 3. Refuse any overwrite BEFORE a single byte is produced. ─────────────
    const outDir = new URL(OUT_RELATIVE + '/', REPO)
    if (existsSync(outDir)) throw new Error(`Refusing fixture overwrite: ${OUT_RELATIVE} already exists`)

    // ── 4. The recipe (projection-47 provenance, reproduced under V31). ───────
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

    // ── 5. Two SAME-week DIFFERENT slots; the promise history survives. ───────
    const checkpoint = session.exportRuntimeCheckpoint()
    const savedSaveJson = checkpoint.savedSaveJson
    if (savedSaveJson === null) throw new Error('Fixture requires a real saved slot')
    expect(checkpoint.currentSaveJson).not.toBe(savedSaveJson)
    expect(savedSaveJson).toBe(corpusSaveJson)
    const current = validateSaveV31(JSON.parse(checkpoint.currentSaveJson))
    const savedSlot = validateSaveV31(JSON.parse(savedSaveJson))
    expect(current.saveVersion).toBe(31)
    expect(savedSlot.saveVersion).toBe(31)
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

    // ── 6. What V31 adds, MEASURED against the archived V30 corpus world. ─────
    // The V30 fixture migrates to an EMPTY relationships root (convertV30ToV31);
    // this world MINTED its root from live shared work. Recorded, not hidden.
    const corpusV30Json = gunzipSync(bytesOf(CORPUS_V30_RELATIVE)).toString('utf8')
    const migratedCorpusJson = exportSave(migrateToV31(importSave(corpusV30Json)))
    const v31Comparison = {
      corpusV30RelativePath: CORPUS_V30_RELATIVE,
      corpusV30Sha256: sha(corpusV30Json),
      corpusV30SaveVersion: JSON.parse(corpusV30Json).saveVersion as number,
      migratedCorpusSha256: sha(migratedCorpusJson),
      migratedCorpusRelationshipEdges: migrateToV31(importSave(corpusV30Json)).state.relationships.length,
      savedSlotEqualsMigratedCorpus: migratedCorpusJson === savedSaveJson,
      savedSlotRelationshipEdges: savedSlot.state.relationships.length,
      currentSlotRelationshipEdges: current.state.relationships.length,
      note: 'The V30 corpus world migrates forward with relationships: []. This V31 world minted '
        + 'its own root from live shared work, so the two are NOT byte-equal; that difference is '
        + 'the save bump plus P14B.5-T RELATIONSHIP_FAILURE_DELTA 4 -> 5, not a moved recipe.',
    }
    expect(v31Comparison.migratedCorpusRelationshipEdges).toBe(0)
    expect(current.state.relationships).toEqual(savedSlot.state.relationships)

    // ── 7. Encode, compress, and prove the round trip IN MEMORY first. ────────
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

    // ── 8. Provenance, then write. MANIFEST last, every write exclusive. ──────
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
      phase: 'qualified P14B.5-T tuning checkpoint / exact last-projection-48 upstream before B.6',
      testedSourceSha: TESTED_SOURCE_SHA,
      testedRunBaseSha: TESTED_RUN_BASE_SHA,
      testedRunDiffSha256: TESTED_RUN_DIFF_SHA256,
      textOnlySourceSha: HEAD_SHA,
      textOnlyProducerDiffSha256,
      publishedRecoverySha,
      publicationState: publishedRecoverySha === null
        ? 'LOCAL ONLY: the minting head is on no remote ref. The 46/47 precedent minted at a '
          + 'published recovery sha; this artifact carries no publication receipt.'
        : 'on a remote ref at mint time',
      closeoutRelativePath: CLOSEOUT_RELATIVE,
      closeoutSha256,
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
        savedSlotIsCorpusWorld: 'savedSaveJson equals exportSave(makeSave(current-p1 state)) at the LIVE '
          + 'V31 writer; it is NOT byte-comparable with the V30 genuine-v30-current-p1 uncompressedSha256',
        compression: 'node:zlib gzipSync with library defaults',
        reproducibility: 'NOT byte-reproducible: journaled response bytes carry real processingMs.',
      },
      v31Comparison,
      scope: 'genuine outgoing runtime48 authority and V31 gameplay slots; no future migration, '
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
    const rereadCheckpoint = JSON.parse(reread)
    expect(canonicalJson(rereadCheckpoint) + '\n').toBe(reread)
    expect(exportSave(validateSaveV31(JSON.parse(rereadCheckpoint.currentSaveJson))))
      .toBe(rereadCheckpoint.currentSaveJson)
    expect(exportSave(validateSaveV31(JSON.parse(rereadCheckpoint.savedSaveJson))))
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
      uncompressedSha256, byteLength: rawBytes.byteLength, v31Comparison,
    }, null, 2))
  }, 600_000)
})
