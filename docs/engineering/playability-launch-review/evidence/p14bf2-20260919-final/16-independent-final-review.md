# B-F2 T4 — independent final bridge attribution and source seal

Date: 2026-09-19. Native `contract-auditor`.

**KEEP — qualified final verification evidence.** The completed bridge stage has
12 exact historical failure signatures and no new, changed or absent baseline
failure. The whole-run fixed-source seal is consistent with the raw logs and
independent current protected-path checks. The previous completed-core KEEP in
`14-independent-core-review.md` stands unchanged. Neither full suite is green;
this disposition does not establish that assertions behind timeouts passed.

## Exact evidence

Tested source: `89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde`.

| Artifact | SHA256 |
| --- | --- |
| `00-run.json` | `a007a6ce7c07bc749f8508cbc2729b7d4946252c57a91808fd142cf69df1fa5c` |
| `12-test-bridge-89b5ad2.txt` | `e5d2e132239c753c252b4190109a0313cf910272592f93ff45b041d4fe185e39` |
| `15-bridge-comparison.json` | `7a805806f4a4d953dd4de419ac229d85934bfc04c33fc13c7013286fb0aa20da` |
| Canonical `../p14a3-20260918/12-test-bridge-f32d56c.txt` | `07b9f9558d544afbfa26e81473c7944554b28d6de2875e40b033d910e9ba8602` |
| Existing `14-independent-core-review.md` | `43d9357cca066422443108667acdac65538f0c191688327602ca100db9166639` |
| `11-test-core-89b5ad2.txt` | `215c7729d4ea3f304d5aa85a285232b413faed903e65cd221aa62fe61dc84cc1` |
| `13-core-comparison.json` | `fa4c886eaa51d3b3989a7d8e12b7ac20c65acf442897728a76a9b6edfaaf434a` |

Independently read and parsed both COMPLETE bridge raw logs using an inline
read-only filesystem parser, not the parent's comparison utility and not an
engine/test import. Expanded grouped FAIL headings into individual full test
identifiers. Retained complete diagnostics/traces; stripped only ANSI styling
and normalized the generated six-character exporter temporary-directory suffix.
The bridge diagnostics contain no exporter path requiring that normalization.
Reporter decoration is not part of the test identifier. No test names, diagnostic
messages, timeouts or trace locations were shortened for comparison.

All 12 candidate identifiers and diagnostics match all 12 baseline entries, with
0 new, 0 changed, 0 absent and 0 duplicate identifiers. Every comparison JSON
row's identifier, both diagnostics and both diagnostic hashes matches the
independent raw extraction. The ENTIRE normalized failure section also matches
byte-for-byte, SHA256:
`849e7f5d0f7c0d0e98414e032f487c4fbd8f4248264abd8459fe234f7cce7dab`.

The failure set is the same 11 named R05 campaign-library tests (9 timeouts at
5000ms and 2 at 20000ms) and the named P13A campaign-isolation test (60000ms).
Their complete identifiers and exact diagnostics remain in the checked raw log
and comparison, not merely in this count summary. Whole-log scanning found no
`Failed Suites`, unhandled error/rejection or uncaught-exception diagnostics.

## Actual completed results

Bridge command:
`vitest run tests/bridge*.test.ts --minWorkers=1 --maxWorkers=2 --reporter=dot`.
Start `2026-09-19T20:27:45.932Z`; end `2026-09-19T21:00:23.361Z`; exit 1,
signal/error null. Process wall time 1957.429s; Vitest duration 1956.21s.

- Bridge: 72 files, 70 passed / 2 failed; 775 tests, 761 passed / 12 failed /
  2 todo. The todos remain unexecuted coverage.
- Actual B3 command file: 19 tests passed, raw line 232, no skipped count.
- Actual runtime-checkpoint file: 61 tests passed, raw line 26, no skipped count.
  Its exact prior-schema registry, current exclusion and unknown-schema controls
  were already inspected in the core review; no new corrective edit intervened.
- Core, retained from the independent review: 309 files, 302 passed / 7 failed;
  3379 tests, 3351 passed / 22 failed / 6 todo. All 22 signatures exactly match
  the canonical baseline. Its raw log, comparison and review hashes remain the
  same. This final review does not repeat or replace that completed-core audit.

Both root/UI and bridge typechecks and both contract checks completed exit 0.
Read all four short raw logs: the contract checks explicitly verified the schema,
C# DTOs, manifest and union-fixture artifact. Independently checked all six
command logs' source, command, start/end, exit and signal against metadata,
null execution errors, and non-overlapping serialized stage order.

## Whole-run source seal

Whole run: `2026-09-19T19:19:14.237Z` through
`2026-09-19T21:00:23.363Z`, 6069.126s (101.1521 minutes).

Read the recorder source without executing it. Its protected paths are:
`src bridge tests ui generated scripts package.json package-lock.json
vitest.config.ts vitest.workspace.ts tsconfig.json tsconfig.bridge.json`.

Metadata records the same exact source89b5ad2 at both endpoints, clean start
status, empty protected diff at both endpoints (SHA256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`),
no untracked protected source at the end and `fixedSource:true`. End-of-run
worktree changes are documentation/evidence preparation, not protected code.
Independent read-only checks during this review still find exact HEAD89b5ad2,
empty `git diff HEAD --binary` over the protected paths and no untracked file
in those paths. No source/test/config amendment or corrective rerun is needed
to reconcile this seal with the reported evidence.

The current contract manifest remains protocol4 / projection46, schema
`sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`,
with generated C# digest
`1b5c7e889ffe3454858afa8960b4a4c099d88cfe25a9553212ba67f11a4c3268`.
Reading the manifest and successful artifact checks is not Unity execution.

## Qualifications and handoff

The evidence supports a qualified B-F2 logic-verification closeout, not an
all-green project claim. Exact historical timeout signatures establish their
attribution, not their cause, assertion reachability or correctness beyond the
timeout. Core's missing fixtures/PIL and inherited digest failures remain the
specific incomplete/failing checks documented in review14. Nothing here repairs,
suppresses or waives them. No new failure signature was identified; that is not
a proof that timeouts conceal no regression.

Core Vitest duration rose from B3's 3536.71s to 3960.79s: 424.08s, approximately
12.0% (58.95 to 66.01 minutes), with 13 additional tests. Bridge duration is
1956.21s versus B3's 1979.63s. These are observations, not a controlled benchmark;
no profiling, causal attribution or performance-equivalence conclusion follows.
Retain the core timing qualification in the closeout.

Parent may now reconcile the qualified closeout and continuation records and
publish/verify the recoverable checkpoint. Actual outgoing V29/projection46
preservation and B4 work retain their separate publication, provenance and T0
gates. This review neither mints those artifacts nor certifies inert drafts.
Unity code, rendering, native UI/UX verification and Owner acceptance remain
deferred under the existing integration backlog.

Reviewer activity: read-only evidence/source inspection, hashing, lightweight
parsing and read-only git checks, plus this sole authorized documentation
addition. No tests, probes, engine execution, typechecks, installs, network,
source/test/config changes, commits or delegation.
