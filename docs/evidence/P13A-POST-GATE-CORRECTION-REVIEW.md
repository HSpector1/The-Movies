# P13A post-gate correction review

The bounded source review found no blocking issue in the two Unity presentation corrections or the subsequent TS copy correction. This is a source review, not final candidate acceptance. The measured performance identity remains `2ac73da2cd4c7a71ea54407c76a20e0a4c75cf60`; the reviewed TS identity is `11ca8a4649d90b2da10536d6d9bcf842df7f35f5`. The latter has not received another performance run. No tests, Editor, HID, runtime changes or benchmark runs were performed for this review.

## Unity first-snapshot and memo review

The review compares the working corrections with Unity `a0eba46f9d4c1a6a73d883cf6ffcff0f103097c0`, whose runtime ancestor is `608f719381938cc60126d31c7fc172c2b4d1dfb3`. The current reviewed source pins below include the subsequent relocation of the identical memo eligibility predicate into its existing partial class. Compilation and test results are recorded separately below; final commit, build and native replay remain root-owned verification.

| Reviewed file | SHA-256 |
| --- | --- |
| `Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs` | `70d285ca291d988714d09036193354d116a2ce5a6fc107a87de1a02a295ef998` |
| `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` | `04b5dffa91c17fd972229dca9cfa63d4aff2ed0b441992f259818b95be753f63` |
| `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.ResearchMemo.cs` | `edbffd08b116867ac02621e26101759b4d1e65a808eefe1049117e6750c7534e` |

The earlier reviewed `StudioBridgeClient.cs` hash was `d448260a0e123368f4526e506ed18439894d3b93d7b62576bb25c287e8ff59a9`; it identifies the historical inline-predicate version, not the current file. Bootstrap's hash is unchanged.

Bootstrap now configures/subscribes the existing lot-growth presenter before adding/configuring person presentation. On the first `SnapshotApplied`, the exact physical Laboratory therefore exists before the existing person reconciliation searches for it. No additional polling, event replay or duplicate `Apply` was added. The actual scene dynamically creates these presenters; this review does not infer corrected subscription order for arbitrary pre-authored hosts outside that bootstrap path.

The existing Scientist checks remain intact: one exact roster person, research engagement, slot 0, owner and facility identity, one matching operational Laboratory placement, the exact `placed-N` property identity, and one operational physical body with the required collider. The added person visual remains separate from the building and from film/casting slots. Session replacement still clears/deactivates the prior person seat before rebinding. Unchanged snapshots still emit no second `SnapshotApplied`; outages do not manufacture a new snapshot or a new person claim.

The memo change omits the transient header notice only while an unceded research intent remains eligible under the same `CanSubmitDisplayedIntent` predicate used by its actual button. It changes no action dispatch, visible-intent check, command identity, authority tuple, deadline, single-flight lifecycle, session/runtime replacement check or transport-failure handler. Existing failed-refresh cleanup still discards the reservation and deferred click; genuinely unavailable actions retain their blocker notice.

Root subsequently moved that identical predicate from a local `OnGUI` variable into private `ResearchMemoRemainsActionable` in `StudioBridgeClient.ResearchMemo.cs`. The `OnGUI` condition calls the property at the same point. The eligibility expression and its ceding/action guards are unchanged. This keeps the existing P12 static renderer `.kind` discriminator check unchanged; no new discriminator allowance or rendering-authority exception was added.

Root's current native verification records are:

- [Full EditMode r2](../../artifacts/p13a/final-verification-02/p13a-final-native-editmode-r2.xml): **1,138 / 1,138 passed**, zero failures/skips, 16.614 seconds.
- [Accepted headless Laboratory/Finance PlayMode configuration](../../artifacts/p13a/final-verification-02/p13a-final-native-gamepad-headless.xml): **7 / 7 passed**, zero failures/skips.
- [Rendered first-snapshot/body and memo-geometry regressions](../../artifacts/p13a/final-verification-02/p13a-native-causal-corrections-rendered-playmode-r2.xml): **2 / 2 passed**, including actual IMGUI geometry across a healthy refresh and refusal after transport failure. Both also passed in the later combined rendered run.
- [Combined rendered PlayMode attempt](../../artifacts/p13a/final-verification-02/p13a-final-native-rendered-playmode.xml): **8 / 9 passed, one Finance chart navigation failure**. Root is checking that failure with a bounded fixed-viewport probe because this attempt used an uncontrolled GameView. **This is not a nine-test pass**, and the pending probe is not reported as passed here.

Earlier failed setup/geometry attempts remain retained in [native-correction-attempts.json](../../artifacts/p13a/final-verification-02/native-correction-attempts.json) and the adjacent XML/log evidence. Passing results above do not erase or relabel them.

The bootstrap author performed this review, so that portion is a self-review. The Scientist reviewer independently checked the bootstrap/first-snapshot test and found no blocking compile, lifecycle, exact-identity or cleanup issue. The memo source review was independent of its author. Neither static review substitutes for compilation or the actual native journey.

## Exact TS delta after the measured gate

The performance runtime correction is `50460f3aa14f77cfe38be15ed9d991cf983cfa92`. Comparing it through `11ca8a4` against the retained 113-input sampler binding finds **109 byte-identical inputs and four changed inputs**:

| Runtime input | Change | UTF-8 source-byte increase |
| --- | --- | ---: |
| `src/core/technology.ts` | One refusal string | 62 |
| `src/core/technologyProduction.ts` | The same refusal string | 62 |
| `src/core/operations.ts` | The same refusal string in the P13 retarget helper | 62 |
| `bridge/laboratory.ts` | Four adoption, choice and readiness strings | 152 |

The seven replacements explain that technology locks when the film enters the filming phase, before the first take. The companion's §1.10 witness at line 364 selects `phaseEntered`, explicitly earlier than the first authoritative take. The correction does not move that boundary or claim that a camera/take has already run. Two existing test assertion strings changed with the refusal text.

The retained [copy proof](../../artifacts/p13a/final-verification-02/p13a-technology-phase-copy-proof.json) records full before/after hashes and parsed TypeScript syntax-tree equality after replacing only string/template literal contents. Every node kind, operator, identifier, number and template substitution is retained in that comparison. The proof's before hashes equal both the measured graph and `50460f3`; its after hashes equal committed `11ca8a4`. This is semantic evidence for a copy-only delta, **not source or executable byte equivalence**.

All validation and persistence algorithms remain unchanged after the gate, including the local membership index, complete original validation boundaries, save schema/migration, permanent history, physical receipts, first-filming locks, finance, digests, compression, durable writing and campaign isolation. All other changes in the commit range are documentation, verification scripts or tests outside the emitted runtime graph. In particular, adding `bridge/schema/intent-schema.ts` to the contract verification dependency list is a verification correction, not a schema or runtime change. The current build metafile confirms only the four files above are changed emitted-source inputs.

The final copy-focused run passed **3 files / 19 tests**. Core/UI and bridge typechecks passed sequentially, and `git diff --check` passed. Logs and hashes are retained by [post-gate-correction-logs.json](../../artifacts/p13a/final-verification-02/post-gate-correction-logs.json). A temporary test import crossed the existing core/bridge compiler boundary; it was removed without changing compiler options or product logic, and the final checks passed.

Root subsequently verified the full core suite at exact `11ca8a4649d90b2da10536d6d9bcf842df7f35f5`: **214 files / 2,584 tests passed in 138.80 seconds**, no failures or skips, process 8197 exited zero. Log: `/tmp/p13a-final-core-11ca8a4.log`. The increase from the measured-source regression's 2,582 tests is two contract-verifier regression cases; it does not alter the measured runtime graph. The final full UI run then passed **201 files / 2,684 tests**, with five existing skips, no failures, in **34.25 seconds**; process 63169 exited zero. Exact logs, checksums and counts are retained in [final-ts-suite-11ca8a4.json](../../artifacts/p13a/final-verification-02/final-ts-suite-11ca8a4.json).

## Performance and build qualification

The [fresh matched gate](P13A-PERFORMANCE-CORRECTION-02-ACCEPTANCE.md) measured clean `2ac73da`, including runtime fix `50460f3`, with three warmups and 20 observations per phase against exact accepted `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`. Save median/p95 regressions were +3.2076%/+0.4185%; load-ready median/p95 were +2.9998%/+0.5747%. All four required gates passed. Those are observations of that frozen sampler graph and its stated boundaries, not measurements of final `11ca8a4` executable bytes or native responsiveness.

Longer copy can change response bytes and layout. The unchanged algorithms and reviewed limited delta support retaining the measured evidence with this explicit qualification; they do not establish zero timing effect. The Unity corrections are outside the standalone Save/load sampler. No additional benchmark or invented performance margin is claimed. All original P12 qualifications, misses, prior controls, failed attempts and stopped-run evidence remain as recorded in [P13A-PERFORMANCE-EVIDENCE.md](P13A-PERFORMANCE-EVIDENCE.md).

During review, `dist/studio` changed while root's full tests were active; generator regressions can emit these files. The last read at **2026-09-11 21:04:26.742 UTC** found all 111 worker-source hashes matching `11ca8a4`, worker **1,654,654 bytes** / SHA `a60c02b1b275e8d945d45fc4fadd2d9bc0dccce50c9d1e891d3d762ae6dc70e1`, and engine **131,067 bytes** / SHA `ba43fda7f6cd5a639d2116224e9dc316b3877abc7b342670b7966e2aad96ebcf`. The worker was 338 bytes larger than the earlier observed payload. Supervisor remained **199,043 bytes** / SHA `230f49d1c4c0f76f47d7b1a0df7f197d83606742e93b5efa2f693f04811a8b5c`. Metafile sizes matched at that read.

These are **provisional observations, not root's final build, audit, manifest or package seal**. Root will explicitly run `build:studio` and the packaged audit after the full suite, then bind the final clean TS/Unity pair. This document neither replaces older/failed test evidence nor reports unfinished full-suite, geometry, native causal or packaging checks as passed.

Root explicitly rebuilt the runtime after both suites and ran `audit:studio-packaged`; both exited zero at approximately21:07 UTC. Their exact logs and hashes are in the same final-suite manifest. This closes the TS build/audit checks; the new Unity build and paired native manifest remain pending.

The subsequent unchanged Finance rendered class passed **5/5** (21:15:33–34 UTC,0.714s, process82393 exit0), after an explicit request for a1440×900 GameView. The setup log confirms that request, but its one startup PlayMode observation is228×391; it does not prove Finance's dimensions throughout its assertions or establish the cause of the earlier failure. That viewport qualification and the original8/9 run remain. The P13 memo geometry test separately asserts its actual1440×900 rendered dimensions. No Finance code, assertion or navigation algorithm changed. Raw results are linked by [native-finance-and-rival-preparation.json](../../artifacts/p13a/final-verification-02/native-finance-and-rival-preparation.json).
