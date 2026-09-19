# P14B4 additive V30 data foundation — independent source review

2026-09-19 UTC. **KEEP for the explicitly additive data boundary.** No concrete
blocking defect was found in the four-file candidate. This is not live B4
cutover, all-green verification, capacity/outcome acceptance, or native/Owner
acceptance. Source and completed evidence were read; no tests or engine probes
were run by the reviewer.

## Exact candidate and scope

Base published RED: `d39a9a04e4eae7767d5a15225de36e86f0440c14`.
The actual four-file diff independently hashes to
`bb0858bc0968dff124f157b47de42095f5aa85e889a180238bdb720e2b03594b`,
matching `18-additive-data-target.patch` and the recorded 18/19/20 metadata.
Inspected the complete diff and relevant surrounding owner/consumer code:

| File | SHA256 |
| --- | --- |
| `src/core/types.ts` | `0ce496ffdbdec3d6c7268b2e9f42c2a9ea2fd00d79c8e00c04e4893b29c40b9f` |
| `src/core/promises.ts` | `2d9249b572aff537ead4b78e8712d529c3d8e22b7bc1efb7c2e3eb03e344db1a` |
| `src/core/save.ts` | `b89f55e450038acffcdd2e5bf7d2f11d04146638e3f04b8b5e566bf90099a09c` |
| `src/core/index.ts` | `bd058ee24061d2136560de8573eb79a5af5665da849b528d1e3ce15a945cb1c2` |

The protected diff at review time contains exactly these four files, 149
insertions/11 deletions. No test, fixture, bridge, UI, schema, generated artifact,
configuration or harness edit is part of this candidate. Governing scope is
the reviewed B4 plan `382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4`
and the parent's additive-only release; full handback16 was read. This review
file is the only authorized reviewer edit. No network, Git writes or delegation.

## Source requirements

- **MET, source:** `types.ts:2179–2234` gives the frozen count-only root an
  explicit V29 name, preserves all catalogue families, and replaces only the
  promises root in V30. The tagged alternative is P2-only with the two exact
  selected classes. Live `ProfessionalPromise` and `GameState` aliases remain
  V29; no new runtime authoring is implied by a data type.
- **MET, source and bounded existing tests:** `promises.ts:787–1008` shares the
  structural/reference validator without changing the V29 branch's admitted
  predicate keys, catalogue, positive safe-integer root/receipt versions,
  generic-cast evidence, or `validateSaveV29:` error prefix. No version threshold
  fabricates a class, repairs a receipt, or restricts old count-only records to
  P1. Historical early-window/submission-receipt compatibility remains intact.
- **MET, source; broader class-outcome runtime still owed:** the V30 branch
  requires exact `{kind,count,seatClass}` keys, literal `castRoleCount`, P2
  family, and `lead` or `leadOrAntagonist`. Evidence resolves to actual stored
  takes and the selected slots, same issuer and half-open window, with existing
  date, contract-party/start, distinct-production, progress, terminal and own
  outcome-receipt checks retained. Count-only records of every catalogue family
  still use the old generic-cast evidence semantics. No fake class is inserted
  into legacy rows. Existing validation tolerances are not silently tightened.
- **MET, source:** `save.ts:8679–8692` checks the actual V30 roots before passing
  the unchanged lower state through the genuine V28 boundary. `stripV29Roots`
  removes the roots/attached-reference leaf V28 does not own; it does not replace
  a tagged promise with a synthetic count-only proxy and then claim V29 admitted
  that proxy. Frozen lower-state validators and errors remain unchanged.
- **MET, source; execution limitations below:** `save.ts:8697–8716` validates
  frozen V29 before deterministic detached cloning. The only upgrade envelope
  change is saveVersion30. It neither recomputes material/feasibility/proposal
  digests nor changes roots, bindings, first takes, receipts, or versions.
  Downgrade validates V30 and refuses every tagged predicate before conversion;
  it never strips class authority. Legacy-only downgrade validates the resulting
  V29 envelope. Older migrations either explicitly refuse V30 or, for V26–V29,
  route through this strict lossless conversion and their existing no-history-
  loss checks. V4–V7 already refuse versions above their numeric ceiling.
- **MET, source:** dispatcher/types/public exports expose the additive V30
  contract. `makeSave` and `LIVE_SAVE_VERSION` remain29, evaluator remains3, and
  old material digest, authoring, feasibility, outcome and chooser code are
  unchanged. No mutable cache or additional dependency cycle was introduced.
- **MET for inspected load-to-play paths:** bridge session and UI adapter still
  call `migrateToV29(importSave(...))`; campaign-library and prior-runtime slots
  use the same strict migration. Current projection46 slots explicitly require
  V29. Therefore a tagged V30 envelope cannot enter those live paths as generic
  cast history. Generic import/export can preserve V30 as data, intentionally.
  This is runtime boundary reasoning, not a claim that TypeScript structural
  types nominally prevent every possible direct misuse of an engine API.

## Completed evidence inspected, with reached-assertion limits

Check18: 2026-09-19T21:53:33.330Z–21:55:24.387Z, fixedSource:true, exit1,
five files /95 cases: **72 PASS, 23 FAIL**. All 34 B1 T4, six B3 revision,
13 B-F2 and five of six old V29 cases passed. The new 36-case file has 14
completed passes and 22 failures. No failed-suite/unhandled diagnostic was found.

The complete 8,689,541-byte raw log was independently scanned, SHA256
`71c742773f91d5286a391fdedab40662c0063c63d80b329bd9f1babb8233d56a`.
Apart from the old unknown-version throw assertion, all actual changed diff
values are literal30 versus29 or the envelope saveVersion30 versus29. This
supports the narrow attribution to deliberate deferred live writing; it does
not turn those tests green or establish their unexecuted assertions.

In particular, all nine genuine-corpus cases reached their prior assertions
for frozen admission, exact migration/root/receipt/history preservation,
independent legacy digest formulas, dispatcher load and export/import. They
then failed at `preservesExactly` line156, which asks live `makeSave` to emit30.
Their following downgrade-byte-equality assertions were **not reached**.
The synthetic variant loops likewise stop at that helper on their first
iteration; arbitrary-version and OPEN/SATISFIED/BROKEN iteration coverage is
not complete. Source support for those paths is not substituted for execution.
The 14 passes include completed tagged admission/refusal/strict-old-boundary
checks; they are not a full tagged-terminal evidence matrix.

The remaining old V29 test at line197 treats30 as unknown. That dispatcher
premise has genuinely moved; reconcile it to an actually unsupported version
and exact updated handled range without weakening frozen `validateSaveV29`
refusal, the genuine old fixtures, or any new B4 literal30 obligation.

Check19: fixedSource:true, exit2. Its only reported diagnostic is
`tests/p14b4-cast-class-outcomes.test.ts(341,64)` TS2339 on a broad SaveFile union.
The command uses `tsc --noEmit && tsc -p ui/tsconfig.json --noEmit`; the UI stage
was therefore **not run**. A narrow independently authored test narrowing and
a fresh full root/UI check are still owed. No production diagnostic is present
in this recorded output; that is not a passing root/UI result.

Check20: fixedSource:true, bridge typecheck exit0 at21:57:37.403Z. This verifies
the unchanged bridge's present type boundary, not planned projection47.

## Disposition / next checks

KEEP the additive source. Preserve the failed checks and exact candidate identity.
Complete the narrowly justified test-only reconciliation, rerun affected checks
and both typecheck paths, and continue the separately controlled class-aware
behavior/live writer/wire work. Do not erase the 22 future live-writer failures,
claim lossless downgrade tests reached beyond line156, or label B4 complete.
