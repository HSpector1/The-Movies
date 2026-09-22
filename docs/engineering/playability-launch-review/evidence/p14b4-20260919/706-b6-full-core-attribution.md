# 706 — run 703 full core: the qualified result, and every count and failure attributed

Run `703-b6-full-core` finished. This record states what it observed, what it does NOT
establish, and the attribution of all 26 failures. Read it before reading the counts.

## The qualification, stated first

`703-b6-full-core.json` records `"fixedSource": false`. The run did not hold still:

| field | at start | at end |
| --- | --- | --- |
| `sourceSha` | `68fe5985f2368992dc616e39aaa4d5fe582dc97f` | same |
| `testedDiffSha256` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty) | `828149214dbe74bae3178bb0a2926b20bb9e2a2851cfe3a7b8f21c7f89ebc0c6` |

The commit never moved. The working tree did: the D1 prose correction to
`bridge/schema/bridge-schema.ts` (record 704) landed while the run was in flight, together
with the `UNITY-INTEGRATION-BACKLOG.md` entry. `record-check` detected this by design and
labelled the run. 703 is therefore an intermediate observation, not the fixed-source
verification the Owner disposition requires. That verification is still owed and is listed
under "What this run does not establish".

Start `2026-09-22T20:13:31.293Z`, end `21:09:42.869Z`, duration 3368.92s, `exitCode` 1.

## Counts, reconciled to the last case

| | 695 (baseline) | 703 | delta |
| --- | --- | --- | --- |
| test files | 9 failed / 341 passed (350) | 11 failed / 340 passed (351) | +1 file |
| cases | 24 failed / 3944 passed / 8 todo (3976) | 26 failed / 3967 passed / 8 todo (4001) | +25 cases |
| duration | 3126.84s | 3368.92s | +7.7% |

695 ran source `63688a79` plus an UNCOMMITTED B.5-T diff (`testedDiffSha256`
`4c138264…`) and the then-untracked `tests/p14b5-t-failure-tuning.test.ts`. It is a clean
`fixedSource: true` run, and `63688a79` is an ancestor of `68fe5985`, so the comparison is
a true before/after.

FILES, 350 to 351. The tree at `63688a79` holds 349 tracked `tests/*.test.ts`; 695
collected those plus the one untracked B.5-T file, giving 350. The tree at `68fe5985`
holds 351 tracked: the same 349, plus `p14b5-t-failure-tuning.test.ts` committed at
`caa8cdb3`, plus `bridge-p14b6-relationship-read-models.test.ts` added at `d749b3ea`.

CASES, +25. Twenty-four are the authored `it(` cases of
`tests/bridge-p14b6-relationship-read-models.test.ts` (the T1 RED file, 839 lines). The
twenty-fifth is GENERATED, not written: `tests/bridge-runtime-checkpoint.test.ts:758` runs
`it.each(Array.from(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.entries()))`, and T2 added the
37th entry `sha256:00c0075b…` to that Map, which yields exactly one further runtime case.
Counting `it(`/`test(` source lines alone reports +24 and misses it; the difference is why
the reconciliation was carried to the case rather than stopped at the file.

## Failure identities: 24 persist byte-identically, none vanished, two are new

Comparing the full `FAIL` header text of both runs: 24 shared, 0 present only in 695, 2
present only in 703. No baseline failure was silently turned green.

### New failure 1: CF-09, attributed to the mid-run edit

`tests/bridge-contract-consumer-lock.test.ts:360` > CF-09 source bundle and repository
identity > matches the actual generator manifest with the verifier source dependency
bundle. Expected `122a6052…`, received `5e255789…`.

CAUSE, confirmed and not inferred. `GENERATOR_SOURCE_PATHS`
(`scripts/generate-bridge-contract.ts:21-31`) lists `bridge/schema/bridge-schema.ts`, and
`sourceBundleSha256` (:92-106) reads each listed file FROM DISK and hashes its bytes. A
comment-only edit to that module therefore moves the bundle hash while the committed
manifest still pins the old one. Record 704 registered this mechanism and its prediction
BEFORE the generator was re-run. Regeneration then produced `generatorSourceSha256`
`5e2557895e7f7e800b0c368187f47d48674db741977fb21d485b7118aa2aeec2`, the exact value CF-09
computed from disk mid-run. A targeted re-run of the file passes.

### New failure 2: a 20s timeout, not reproducible

`tests/bridge-runtime-checkpoint-prepared-reuse.test.ts` > prepared checkpoint
representation reuse preserves authority boundaries > preserves live authority on failed
Save and replays the exact successful receipt after later changes and restart.
`Error: Test timed out in 20000ms.` No assertion failed.

A targeted re-run of the file passed. The conditions during 703 support an environmental
cause: an orphaned 535 MB vitest worker, left behind when run 701 was killed by ENOSPC,
competed for the first 17 minutes before it was found and terminated; the data volume sat
at 97% full; and the run took 7.7% longer than 695. Timeouts already dominate this
baseline, with all 11 `bridge-p12-campaign-library` failures and the
`bridge-p13-campaign-isolation` failure timing out rather than asserting.

This attribution is supported, not proven. A timeout that does not reproduce once may
still be real. The final fixed-source run re-observes it, and if it returns there it is
a defect, not weather.

## Verification of the record 704 prediction

Regenerating the contract moved exactly one field. Every other pre-registered row held.

| row | predicted | observed |
| --- | --- | --- |
| `schemaId` | UNCHANGED | `sha256:60af24c5…` unchanged |
| `projectionVersion` 49, `protocolVersion` 4, `generatorVersion` 1 | UNCHANGED | unchanged |
| `typescriptGeneratedContractSha256`, `unityGeneratedContractSha256` | UNCHANGED | `c84b5f95…` unchanged |
| `generatorSourceSha256` | MOVES | `122a6052…` to `5e255789…` |
| `StudioBridgeDtos.Generated.cs` bytes | UNCHANGED | `c84b5f95…` unchanged |
| `StudioBridgeUnionFixtures.Generated.cs` bytes | UNCHANGED | `be4b1dd1…` unchanged |

The generator rewrote three files. Git reports only the manifest as modified, one line
changed. The regenerated schema JSON and C# DTOs are byte-identical to the committed ones,
which demonstrates the edit was comment-only more strongly than the line-prefix inspection
in record 704 did. `check:bridge-contract` and `check:bridge-contract:fixtures` both pass.

## What this run does not establish

1. A fixed-source full core on the B.6 candidate. 703 is qualified. The obligation stands
   and is discharged after D2 lands, so one run covers both rather than two covering one
   each.
2. That the prepared-reuse timeout is environmental. See above.
3. Anything about D2. `bridge/relationships.ts` is unchanged in this run; the false
   employment claim record 702-C demonstrated is still present in the candidate.
4. `npm run test:bridge` and the full UI suite, neither of which has run on this candidate.
