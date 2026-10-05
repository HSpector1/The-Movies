# Save46 fallout preparation (static; no sweep edits)

This package prepares 1363-A §8 step 8 and §8.2 using the 1358-M2 measurement and 1361-N attribution method. It is not a runtime result, sweep approval, landing authority, or checkpoint closure. Parent owns the full snapshot, lane, actual fallout, classification, and eventual 1363-N plan. No game, tests, types, generators, or fixture payloads were run/read by this author.

## Exact baseline and selection

Fixed published baseline: `6c60c26a1e4cd8a49b83e4798754e146416852a1`. The static census reads Git blobs at that commit, not current mutable test bytes. Candidate: `S/1367-recovery-integrated-candidate/candidate`, with all 188 source files matched before and after against `S/1367-recovery-witness-diagnostic-prep/abc-pins.json`, SHA256 `d8920b5c747237e76b96f7e90cf0a4cf2fb305f22109e59fbfe198456c716ec2`.

Exactly 13 production files differ: `hollywood.ts`, `productionIdentity.ts`, `employment.ts`, `types.ts`, `hollywoodTypes.ts`, `hollywoodValidation.ts`, `hollywoodPolicy.ts`, `technologyRival.ts`, `index.ts`, `hollywoodTick.ts`, `rivalResearch.ts`, `talentMarket.ts`, and `save.ts`, all under `src/core/`. `campaignLegacy.ts` already includes the same F6 quality guard in the baseline and candidate. `census-6c60/SOURCE-INVENTORY.json` binds every old/new source hash and original Git blob.

| Selection | Exact file count | Disposition |
|---|---:|---|
| Published `tests/**/*.test.ts` | 460 | Preserve all authoritative files |
| Existing Owner/native-input exclusions | 6 | Same six as the accepted 1361 broad selection; separately listed, not new exclusions |
| Headless core baseline | 454 | Explicit `core-headless-454.txt` |
| Original new B, adapter, C, migration, old-period suites | 5 | `focused-new-5.txt`; final reviewed test/helper bytes must be bound by parent |
| Proposed baseline plus those five | 459 | `candidate-core-with-focused-459.txt`, before any separately accepted additive tests |
| UI | 204 | Exact named list; workspace project `ui` |
| d16 | 10 | Dedicated config, separate run; 176 cases are the prior baseline, not an unmeasured current case-count assertion |

The prior accepted broad baseline was 448 headless core files. The six new published files are A8, binding-cash, Legacy lens shape, Legacy replay inputs, own-era masked downgrades, and genuine extension downgrades. No old file was removed. Reusing `core-list-448.txt` would miss all six. Every file under the six native exclusions remains in the repository; this package does not read their external inputs or expand authorization.

## Build the candidate without contaminating the test inventory

1. Parent pins actual published HEAD and verifies what changed after this fixed 6c60 census. Preserve full current HEAD source/config/test/helper/generated/Bridge/UI content in the snapshot. Apply only the exact reviewed 13 production replacements and the reviewed original recovery test integration plus accepted witness wiring. Preserve a complete per-file inventory and source patch against the actual assembly base. Do not overwrite newer live tests with stale 1367 bundle versions.
2. Preserve unswept authoritative assertions. Existing reviewed current-entrypoint/historical-caller adaptations required by recovery are distinct from the future broad pin sweep; list their provenance explicitly. Do not apply any new broad version replacement based on the static census. Existing A8 keeps real V45 admission first; old staged `admitRivalPlans` uses the explicit `pre-recovery` era. Full ABC equality only removes recovery authority via a real admitted empty downgrade, never by discarding nonempty cutting/refund/tombstone data.
3. Add the five original suites named above with their reviewed helper closure, including accepted original26 period52 and renewal, original45 witnesses, original adoption/operational builders, and current original B research controls. Parent's current final unified test inventory is the authority for these changing test bytes; the old 1367 bundle alone is insufficient.
4. Do not copy the whole scratch `tests` directory or its dedicated configs. `p14d2-b-research-witnesses-1368.test.ts` (failed 265/266 hypotheses) and `p14d2-b-public-research-1368.test.ts` (public277 hypothesis) are separate diagnostic evidence, not added ordinary gate files. Do not remove the original B file or any original leaf. The standalone adoption, C operational and low-market research files may be retained as additional ordinary tests only if parent records their final accepted test contract, exact hashes and actual GREEN evidence; update the explicit count/list accordingly. No count above assumes their adoption.
5. Keep capture producers, measurement drivers, isolated observation suites and their temporary Vitest configs outside ordinary selection. They are separately measured tools. Excluding a diagnostic tool from automatic discovery does not erase its retained failed result or waive a missing original behavior.

## Concrete gate order and configuration

Use the existing single heavy lane and five-output source recorder (`.json`, `.patch`, `.txt`, `-preflight.json`, `-postflight.json`) with fresh exclusive stems. Bind actual child exit separately from wrapper success, live publication HEAD/index/diff and exact consumed scratch source/config/test/helper inputs. Freeze them through postflight. Keep current deadlines and budgets; no retry or timeout increase is authorized here. Record Node 20.20.2, dependency identity, Python/venv and disk headroom. Parent may use the already reviewed recorder adapter; this preparation introduces no runtime wrapper.

Run, in order:

- Root strict types: `node node_modules/typescript/bin/tsc --noEmit`.
- UI strict types: `node node_modules/typescript/bin/tsc -p ui/tsconfig.json --noEmit`.
- Bridge strict types: `node node_modules/typescript/bin/tsc -p tsconfig.bridge.json`.
- Both existing generator checks: `npm run check:bridge-contract` and `npm run check:bridge-contract:fixtures`, with the pinned Node 20 first on PATH. They check outputs; do not regenerate them to hide a mismatch.
- Explicit headless core list through `vitest run --project core`, with machine-readable report and full text. Check emitted file/case identities against the prepared inventory; command line path filters alone do not establish exact selection.
- `vitest run --project ui`, separately.
- `vitest run --config src/harness/d16/vitest.d16.config.ts`, separately, with full JSON `failureMessages` arrays and text.

`CONFIG-PINS.json` binds the exact configs, package/lock and UI setup. `vitest.workspace.ts` owns core (`tests/**/*.test.ts`, node) and UI (`ui/**/*.test.{ts,tsx}`, jsdom/React/setup, existing 30-second UI limit). Root `vitest.config.ts` alone includes `src/**/*.test.ts` too; do not substitute an unqualified `vitest run` for the intended project. d16 sets its own directory as root to avoid workspace auto-discovery. Root types include `src` and `tests`, with existing Bridge/r3n1 exclusions; Bridge has its own include surface. `tsconfig.src.json` is not a replacement for the three full type gates. No tsconfig/timeout edit belongs to the eventual tests-only sweep without separately justified authority.

Keep dedicated 1356 ranking-harness execution alone under its existing budget, and preserve required P15A/P15C integration selections and natural-route gates. The broad selection does not replace their distinct recorded requirements. Historical154 and current520/G-L/re-probes remain separately governed measurements, not inferred from unit-suite success.

## Scratch environment controls

Prior M2 linked `docs`, dependencies, `art`, `tools` and `tests/fixtures`. A link is a read dependency, never a write target. Parent chooses exact copies versus read-only links and records their paths; no capture producer may write through a fixture link. Current accepted loaders enforce realpath containment: in scratch only, use their reviewed paired fixture-root plus exact-manifest overrides, or real copies satisfying the normal defaults. Never weaken containment or alter a pin to accommodate a scratch root. This census enumerates names and reads test/config code only; it does not inspect fixture bytes or private Owner saves.

Use the approved `.venv/bin` on PATH for core/UI and image-related generators; the prior numpy failure is not license to ignore a new failure. Include tracked generated/schema/consumer assets and named Bridge/FakeUnity scripts; omitting them from an undersized source snapshot can produce unrelated ENOENT/health failures. Do not preclassify any timeout as environmental. The accepted broad 1361-M3 still retains one disclosure and two supervisor failures; later full-file 22/14 passes prove only isolated non-reproduction, not timing cause. Preserve exact primary/stack differences.

## Fallout attribution and subsequent sweep decisions

`STATIC-SITES.json` lists candidate code sites, with line and category; `CODE-INVENTORY.json` binds their Git bytes. It is intentionally overinclusive. A historical V45 reader is often correct. A shared helper can create failures in files without direct sites (1358-M2 measured 114 such rows), so the runtime failure inventory remains authoritative.

For every actual failure record full identity, suite/file, primary and stack/failureMessages, innermost test/helper frame, current actual child/guard status and comparison with 1361-M3. Classify SAME, CHANGED, NEW and GONE against the exact retained baseline; compare entire d16 failureMessages, not only prefixes. Normalize only named exact checkout roots, preserving `node_modules` provenance. A prior failure now masked by a version guard is CHANGED and still unresolved, not an accepted new primary. New files have no old whole-suite observation; use their focused recorded evidence explicitly, not a fabricated broad baseline.

The baseline is 133 core failures (84 SAME / 1 CHANGED / 48 NEW versus1358-I, including the 45 held-market rows and three retained timings), UI 2692 PASS / 5 SKIP, and d16 164 PASS / 12 FAIL. These are comparison evidence, not an allowed arbitrary count of current failures. No overall GREEN or no-new-regression claim follows from matching totals.

Use 1361-N categories after measurement: live-reader calls; live version literals; unknown-version sentinels; migration chains/types; canonical comparisons; hand-built envelopes; strict shape checks; refusal diagnostics; first-guard masking; and rival values/retained rows. Distinguish product defect, required current-reader adaptation, lawful moved current-route outcome, retained historical behavior, and proven environment issue. Frozen owner diagnostics can remain `validateSaveV45:` when the public entrypoint is V46; never blindly rename them.

Apply 1363-A §8.2 literally:

- Historical payloads/manifests remain byte-identical. Only actual current-route outcome assertions may move with measured law. Public old reader control must stay valid before its target mutant/refusal.
- Current-route live-writer pins require a new named directory only after actual measured movement. K1/K2 hold unless observed otherwise; the charter names `tests/fixtures/p15/p15a1-market-pins-1363/` for a needed mint, not an automatic mint.
- M0A40 with Hollywood null must not change. A natural shelving-invariant failure is a finding, not a repin. Preserve genuine Save44 market/Legacy and older Save42 inputs. The accepted measured week77 replacement and retained week93 history already have distinct provenance.
- Re-attribute the seven exception premises and 45 held rows; no waiver, synthetic state repair, root stripping or weakened validator. Capture gaps and impossible independent valid refund/tombstone premises remain explicitly classified.

Only actual fallout supports the bounded 1363-N edit plan. Parent obtains independent review before a sweep and preserves all original results. Focused acceptance, broad gates, landing and post-landing 1363-V are separate ordered obligations.

## Reproducing this static census

`census.py --repo R --candidate S/1367-recovery-integrated-candidate/candidate --pins S/1367-recovery-witness-diagnostic-prep/abc-pins.json --output NEW_EXCLUSIVE_PATH` performs only Git blob and narrowly admitted source/code reads. It asserts source pins before/after and emits exact lists, inventories and source-site suggestions. It refuses existing or dangling-symlink output. The fixed 6c60 baseline is intentional; a newer assembly requires an explicit baseline-delta reconciliation, not silently rewriting this result. No fixture contents, runtime outputs or moving test results are accessed.
