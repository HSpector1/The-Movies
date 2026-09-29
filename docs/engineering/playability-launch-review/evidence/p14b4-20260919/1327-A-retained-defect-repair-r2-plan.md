# 1327-A: retained-defect repair R2 — clusters C15, C3 and C12

Repair R1 (1324) removed 58 failing identities (C6, C7, C20 except its Rule 4 leaf; [1325-I](1325-I-broad-core-attribution.md)).
This plan takes three more retained clusters whose causes are pin or boundary maintenance: 15 rows, all test-side (rows
and primaries in [1325-I-failures.json](1325-I-failures.json)). C8 is not among them: its measured cause is a rival
stall that needs an Owner decision ([1329-A](1329-A-c8-natural-chain-finding.md)).

| Cluster | Rows | Where | Recorded cause |
| --- | --- | --- | --- |
| C15 frozen-validator chain | 7 | `p13b-r07-save-v25` (2), `facility-move-demolish:870`, `p14c2s-scientist-retirement` S10, `bridge-runtime-checkpoint:431`, `bridge-p14c2rm-retirement` (2) | a historical reconstruction or forged envelope built from a live state keeps a root added later, so a frozen validator refuses it before the leaf's own assertion (`validateSaveV12: state has unknown field "firstTakeSubjects"` in `p13b-r07`, measured at 1321); the other leaves stop at an earlier refusal whose field the author measures |
| C3 initial-state digest | 6 | `p14c3-canonical-rival-history` K1-K4, L1, L2 via `tests/helpers/p14c3-canonical-rival-fixtures.ts:187` | `CANONICAL_INITIAL_SHA` pins `sha(exportSave(makeSave(state)))` of the week-0 world written under Save38 (b71d4599); the live format is now Save42, so the digest of unchanged content moves |
| C12 generator identity | 2 | `bridge-contract-generator:565-569` and `:716-717` | the whole-schema identity and the two current-fixture declaration hashes were measured at projection 54 (1193/1196); projection 56 (f3f8c209) moved both |

The seventh C3 row (`bridge-p14c3-runtime` R8, a 5 s timeout) belongs to the C1 time-budget family and is out of scope.

Rules (R1's five, plus two):

1. Tests only; no production, fixture payload or config change.
2. Each repair restores the leaf's own premise to current law, with the cause measured and cited (source line or the
   received value). Roots removed from a reconstruction are removed by the same guard-and-strip shape the file or
   `_v14Contract.ts` already uses: throw if the root carries real authority, delete it otherwise.
3. No assertion is weakened, removed or skipped. If a leaf's stated premise cannot be reached lawfully, the author
   stops on that leaf and reports the measured facts.
4. C3: the constant `CANONICAL_INITIAL_SHA` stays. The parent measured
   ([probe](1327-measure/c3-down-projection-probe.test.ts.txt), [output](1327-measure/c3-down-projection.json)) that
   the week-0 live save of `p14c3-canonical-stage-c-098`, down-projected through `convertV42ToV41`,
   `convertV41ToV40`, `convertV40ToV39` and `convertV39ToV38`, exports to exactly `2f9ec0fa…`; the live export is
   `a7d0034f…` (the 1321/1325 received value) and the Save41 projection `53d1afb4…` (the 1316 received value). The
   assertion therefore compares the Save38 down-projection with the unchanged constant, and a second assertion pins
   the live envelope's version to `LIVE_SAVE_VERSION`. The author re-measures in its own tree before writing.
5. C12: pins come from an independent recorded producer, never from a failure message or a value the test computes
   (the 1193/1196 method). The parent stages [1328-p56-declaration-measurement.ts](1328-p56-declaration-measurement.ts)
   (1193 with the projection-56 identities of the checked-in manifest, generated C# and schema file, and 1196's F10/F11
   outputs as the prior pins) and its [source manifest](1328-p56-declaration-source-manifest.json); after review the
   parent runs it as a recorded run on the published HEAD, and the author writes the two F10/F11 pins from that
   recorded output. The schema identity literal is the `schemaId` of the checked-in manifest,
   `sha256:349b2d3e…`, read independently, and the generator call names projection 56.
6. `bridge-p14c2rm-retirement`'s two leaves depend on a natural chain ("counterpart stays lawfully disclosed"). If
   the measured cause is a moved natural premise rather than a validator boundary, the author reports it with the
   receipt facts and leaves the leaves untouched.
7. A leaf that passes after the repair must pass for its stated reason; the author names the assertion that now runs.

Order: independent review of this plan and the 1328 producer (1327-B), the recorded producer run (1328), then
test-author staging. Deliverables: `1327-stage/1327-retained-r2.patch` (cumulative against HEAD), a classification
JSON (one row per edit: file, line, old, new, cluster, cause) and a handback; checked with a temporary index. Then the
parent's scratch dry run (type gates, touched files, full core), independent review, application and the recorded
gates.
