# 985 — Attributed post-Stage-A compatibility maintenance

Parent980 root/UI types and981 all90 bounded core cases passed with fixed source.
Parent982 closed2026-09-26T20:41:38.987Z after113.809s, child1/fixedSource:true:
254PASS,4FAIL in11 affected compatibility files. Parent983 bridge types closed
2026-09-26T20:42:52.446Z after27.547s, child2/fixedSource:true: seven test-only
diagnostics in four files. Source identity for982/983 was c000479d plus patch
`1a848ad7d483d3d1c9123a207523c14bc3b758add49dc1ebcff74e248c052c93`.
Full original logs remain unchanged. No test or typecheck was run by this author.

## Four observed982 failures

| Observed case | Actual failure boundary | Attribution and repair |
| --- | --- | --- |
| C2a E1 | First tick, `advanceProfessionTransitions` reads missing transitionDue.filter | Current generated state had its actual38 root replaced by the old V36 synthetic overlay. Preserve actual current scaffold while applying the same disclosed C.2 overlay. |
| C2a E2 | Same missing transitionDue.filter, before finishing/settlement assertions | Old helper cast genuine33 as current; use actual current migration before synthetic retirement overlay. |
| C2a F1 | Same missing transitionDue.filter, before rival settlement assertions | Migrate untouched genuine33 before shortening the disclosed synthetic employment interval and applying its retirement overlay. |
| C2b S2 lossless no-extension downgrade | Existing exact JSON.stringify equality | Read-only parsing of the complete '-' and '+' JSON lines found zero parsed-value differences and exactly one insertion-order difference: careerLifecycle expected [boundaryWeek,cohorts,records], received [boundaryWeek,records,cohorts]. Parent production owner fixes old-key preservation in37→38 migration. The existing assertion and frozen35 fixture remain unchanged. |

The C2b comparison was decoded from its actual full log, not a guessed abbreviated
failure message. Both logged strings are772493 JSON characters after their two-byte
diff prefix. No test, game engine or producer ran to obtain the structural comparison.
Source explains the single difference: the old37→38 implementation spread
initialCareerLifecycle before the old root, seeding fresh key order before updating
old values. Changing the expected test to sorted JSON would hide this regression;
no such edit was made.

## Honest old/current loader split

`c2Fixture` still verifies the same immutable gzip/raw hashes and strict33 reader,
returning the unchanged raw33 state. Its return type now honestly says GameStateV33;
the cast granting current authority is removed. `nullHollywoodFixture` likewise
remains a strict frozen33 output after its old32→33 conversion.

New c2LiveFixture/nullHollywoodLiveFixture use the real migrateToLive over those
unchanged old envelopes. They do not construct six new fields or validate a modified
synthetic state as if it were old history. E2/F1 and the shared C2a core/consumer
suites select the current loader before any synthetic person/clock/contract edits.
G1–G4 remain frozen34 tests over the raw33 substrate. G5 retains its explicitly
validated historical37 construction followed by real current migration.

withSyntheticCareerLifecycle now overlays only the existing C.2 root fields onto
an already-current state's actual root. It preserves actual transition boundary,
anchors, evaluations, changes, finality and queue. It does not regenerate anchors
for old synthetic candidate mutations or assert those isolated consumer inputs are
whole-save-valid genuine history. Existing synthetic limitations remain explicit:
E2 clears its seat manually and F1 shortens its employment interval. Those facts
are inherited isolated-consumer controls, not new natural C.3 witnesses.

The old writer-migration leaf now wraps the honestly typed raw33 state explicitly
as33 before import/migration; its data and exact history assertions are unchanged.
External Scientist and old retirement fixture consumers already perform their own
actual migration; their source is unchanged.

## One statically superseded E1 expectation

After the missing-root defect is repaired, current C.3 must evaluate the retired
zero-take actor at52. The old C.2 test expected freeAgents membership after expiry;
942 now requires a deferred actor to stay outside that pool. Parent explicitly
authorized this governed replacement before rerun. It is a statically attributed
superseded expectation, not an observed fifth982 failure.

All original expiry, contract removal, retirement date, original talent prefix,
cohort append and unchanged career-event assertions remain. The replacement adds
zero actual recorded acting takes, exactly one evaluation at52 with
noEligibleTarget/deferred, no change/finality, the exact queue date
min(104,nextBirthdayWeek(provenance,74)), and exclusion from freeAgents. If actual
setup reaches a different outcome the test must fail loudly; no bare boolean swap
is credited as adequate proof.

## Seven983 bridge type diagnostics

| File/sites in original983 | Bounded current/historical correction |
| --- | --- |
| bridge-p14b2-trust:466 | Actual BridgeSession.save returns the current envelope: strict38 reader, matching current version pins, and identical old promise/outcome/DTO assertions. Same-file current makeSave controls likewise use strict38. |
| bridge-p14b4-cast-class:114,421,425,443 | Keep each genuine old fixture and its existing converter chain; append actual migrateToLive before current assignment, market/history/profile reads and existing synthetic age overlay. Current carriers validate38. Actual session save uses strict38. Frozen29 legacy-P2 reader control remains untouched. |
| bridge-p14b7-promise-waiver:110 | Append real current migration after the existing genuine31→36 chain, before live waiver/read-model calls. Frozen31 validation, hashes, promise bytes and causes remain. |
| bridge-p14c2rm-runtime:39 | This case inspects actual saved37 slots, so retain strict37 and inspect the explicit scientist record from that old root. Do not call a current-only helper or alter the historical slot just for a type. Existing old hashes, export equality and frozen producer facts remain. |

Only these four bridge files were edited. No protocol/projection pin, prior-runtime
fixture or current52→53 migration behavior was changed here. Full runtime cutover
expectations remain the already-recorded Stage D obligation; this repair claims only
the historical diagnostic's type boundary, not a full runtime requalification.

## Frozen handback and next execution

Exactly nine paths were touched in this repair. Cumulative diff over those paths
from HEAD has SHA256 `5c75831e219dcaa662a818505e909db021bd1acbca460d8dc2c3b6983e6948db`; it includes earlier Stage A maintenance
already present in the save/settlement and writer files. It is not an isolated
post982 delta. All source is frozen and `git diff --check` over these paths was
clean. Parent owns final source/patch capture, tests, types and attribution.

| Path | SHA256 |
| --- | --- |
| `tests/helpers/p14c2a-fixtures.ts` | `281477b38bd248f53dc3c530041e8e08f1b4d96e8763d5147d1578146b580de2` |
| `tests/p14c2a-core-lifecycle.test.ts` | `1e512ef7e19926a344481f0bebae81f0f11d12daa221be16e2a2e952cd1d8eff` |
| `tests/p14c2a-consumers.test.ts` | `8012909c8ef162450490a97b34960444cc0ff9edd919b22db400726bbdfd2b56` |
| `tests/p14c2a-save-and-settlement.test.ts` | `5d1ab3ad51af5da0efb6d7dd0228b2933ff25ddea58e4e4786771ce6d9afc6f0` |
| `tests/p14c2rm-writer-continuation.test.ts` | `281e3e0cd8d78b7509c8677798f4443d79a8ccd9e5b94d6bc7b381d80d376888` |
| `tests/bridge-p14b2-trust.test.ts` | `dbf933232a20dd73892eb7cf59aa6015a7cc34351f601c02ebc98bdff838d13a` |
| `tests/bridge-p14b4-cast-class.test.ts` | `fa831029eed48046aba132d194eedae9e8ca5f09cb29c66f8755cb9848a040f8` |
| `tests/bridge-p14b7-promise-waiver.test.ts` | `e6730ac27de389019d0133c791717b4ed3ba96cbf28832b7ef676db908133fa1` |
| `tests/bridge-p14c2rm-runtime.test.ts` | `754827d52a55f5e66e8f52af0b31f9a1b3e9b754e1c06bf0f8295acacfe3559d` |

Recommended bounded next checks: original C2a save/settlement plus C2a core-lifecycle
and consumers (shared helper callers), unchanged C2b save, and affected bridge
B2/B4/B7 behavioral suites alongside root/UI and bridge types. Parent decides the
exact sequential command/recorder; no additional simultaneous heavy lane is allowed.
Source fixtures, historical outputs, timeout budgets, compiler settings, existing
refusal causes and full982/983 logs remain intact.984's20-case new Stage B slice
remains unreleased until the parent publishes this checkpoint.

## Post988 import restoration — separate later freeze

986 root/UI types and987144corecases passed on the original maintenance patch.
988 bridge types closed20:49:57.522Z child2/fixedSource with three TS2304 diagnostics
at bridge-p14c2rm-runtime.test.ts89/132/133: removing the historical-row helper
import also removed an import still used by current-session assertions. After988
closure the parent released only its restoration; no historical assertion changed.
This is an attributed test-authoring failure, not production authority failure.

Restored runtime file SHA256:
3ca24832660b2ba653d5b1e8c7819232fa0d13829af68157a4883cf9467e922d.
Final nine-path cumulative diff SHA256:
a8acb01e1c6c8035be31fa640967db15a770b1419c91f5572497578abc8c99d5.
Independent reviewer confirmed the other eight file hashes remain those above,
reviewed the final maintenance as KEEP, and found no source drift during any
closed gate.989 runs bridge types on this later freeze. Original985 hashes above
remain accurate for986–988 and are not replaced or retrospectively qualified.
