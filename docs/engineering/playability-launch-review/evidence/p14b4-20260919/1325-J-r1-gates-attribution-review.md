<!-- 1325-J: independent review by the contract-auditor specialist (read-only), final text saved verbatim by the parent at HEAD 6458955e. -->

# Review 1325-J — Independent review of the recorded broad gates after retained-defect repair R1

## Scope
Read-only (Read/Grep only), no commands executed. All claims below are either independently re-derived from the raw JSON/log artifacts I read directly, or explicitly marked as trusted-from-the-record where I have no tool to reproduce them (I have no shell/git; I cannot run `vitest` or `git diff` myself).

## Verdict: **KEEP**

No demonstrated regression, false attribution, or arithmetic error in either gate. One non-blocking wording ambiguity in 1326-I; no required changes.

## 1. Run identity — MET WITH EVIDENCE
- Core: `1325-r1-broad-core-preflight.json:583` `"head": "57b7bee9…"`, `:2140` `"remote": "57b7bee9…"` (equal); postflight `:2155` `"fixedSource": true`, `:2157` `"allGuardsExact": true`. Collection postflight (`1325-r1-broad-core-collection-postflight.json:1-8`) shows `"reportedFiles": 422, "equalsAllowlist": true, "missing": [], "unexpected": []` against the 422-entry allowlist in `1325-r1-broad-core-collection-preflight.json:11-434`. No excluded path present. All confirmed by direct read, not by trusting the prose.
- UI: `1326-r1-broad-ui-preflight.json:583`/`:2140` head==remote `11bd3f89…`; postflight `:2155/:2157` `fixedSource: true`, `allGuardsExact: true`.
- Gap: I did not find an explicit `"testedDiff"` key in either JSON (grep for the literal string returned nothing in `1325-r1-broad-core.json`); "empty tested diff" is asserted in the prose and not independently located by me as a named field. Minor, non-blocking — everything else in the identity block checks out exactly.

## 2. Core claims — MET WITH EVIDENCE
- `93 = 85 RETAINED-SAME + 8 RETAINED-CHANGED, 0 new`: independently recounted `status_vs_1316` across all 93 rows in `1325-I-failures.json` (lines 29–1317) — 85 RETAINED-SAME, 8 RETAINED-CHANGED, matching exactly.
- The two `c2a-m2-sets-save` leaves: grepped `1321-save42-broad-core.txt:52892-52914` directly. Both FAIL headers show the identical refusal, `validateSaveV12: state has unknown field "firstTakeSubjects"`, thrown at `Module.v13TwinOf tests/contracts/_v14Contract.ts:520:11`. This is exactly the C6 cause the plan targets, confirming their disappearance is attributable to the R1 `_v14Contract.ts` edit, not chance.
- 8 changed primaries keep recorded causes: verified directly — 6 `p14c3-canonical-rival-history` rows (`1325-I-failures.json:1097-1164`) carry the same received hash `a7d0034f…` as 1321's changed primary (`1321-I-broad-core-attribution.md:27-28`); the Rule‑4 leaf (`1325-I-failures.json:1307-1319`… actually 1181-1191 range) now at `:93` (shifted from `:85` by the 8 inserted lines, as 1324-X predicted); the benign exporter row (`1325-I-failures.json:1307-1319`) still fails on the temp-path export, cluster `RETAINED-benign-tmp-suffix`.

## 3. UI claims
- Byte-identical source claim: 1326-I asserts `git diff` over `src/bridge/ui/generated/scripts/package/config` between 29273d7f and 11bd3f89 is empty (`1326-I-broad-ui-attribution.md:13-15`). I have no shell/git access and **cannot independently verify this**. It is corroborated by: 1324-D's independently-confirmed patch scope of exactly 7 `tests/`-only files (`1324-D-retained-r1-review.md:38-39`), and the git-status commit list showing no commit between `57b7bee9` and `11bd3f89` other than the core-gate record commit itself. **NOT VERIFIED by me directly** — flagged as an evidence limit, not a defect.
- 32 = 25 RETAINED-SAME + 7 NEW: confirmed directly from `1326-I-failures.json:13-24` (`byStatus`, `byCluster1303`).
- "Every one of 32 is in 1317 or 1322": logically reconciles — 25 C1–C5 rows trace to 1303/1317; the 6-row timing cascade is 1317-I's own directly-measured "six rows new against 1303" set (`1317-I-broad-ui-attribution.md:39-49`); `StudioLotScreen:930` is 1322-I's own recorded "1 NEW" row (`1322-I-broad-ui-attribution.md:16-19`). 25+6+1=32.
- C1-timing attribution for the 7 rows is **supported by real measurement, not assumption**: 1317-I ran an A/B scratch archive of the old source and reproduced the same six identities, measured boot timings (1161ms vs 1275ms), and ran the files alone (74/74 pass) (`1317-I-broad-ui-attribution.md:50-69`). Non-blocking: 1326-I reuses this mechanism by failure-signature match rather than re-running the isolation test at HEAD `11bd3f89` itself.
- **Non-blocking wording issue**: `1326-I-broad-ui-attribution.md:35` states `StudioLotScreen :930 (focus)… is among the 25`. Read against `1326-I-failures.json:44-56`, this row's own `"status_vs_1303": "NEW", "cluster_1303": null` — it is *not* part of the JSON's `byStatus.RETAINED-SAME: 25` (the C1–C5 cluster total). The prose's "the 25" instead refers to "the 25 rows 1322 recorded" (1322's total failure count, stated two sentences earlier, `:14-16`), a different set that coincidentally also totals 25. The arithmetic is correct under close reading, but the reused numeral is ambiguous and cost me a re-check. Recommend rewording to "the 25 failures 1322 recorded" in a future revision — not required, does not change any conclusion.

## 4. Retained cluster counts — MET WITH EVIDENCE, exact
Independently retallied `cluster_1302` across all 93 rows in `1325-I-failures.json` (lines 30–1318): C8 42, UNRESOLVED 10, RETAINED-INHERITED-FROM-1100 9, C15 7, C3 7, C17 6, C16 5, C12 2, C16b 2, C1 1, C20 1, benign 1 — sums to 93, matching `1325-I-broad-core-attribution.md:38-39` digit for digit.

## 5. Closure framing
"LOGIC VERIFIED · UNITY NOT VERIFIED, not GREEN" is supported: every run cited across 1324/1325/1326 is `vitest run --project core|ui` (headless TS); no Unity Editor/player evidence appears anywhere in this record set. R1 is test-only by its own Rule 1 (`1324-A-retained-defect-repair-r1-plan.md:16`), confirmed 7-files-under-tests/ by 1324-D — so "logic verified" means test assertions were repaired to match pre-existing production behavior, not new production logic exercised in Unity. Not GREEN: 125 failures remain open (93+32), 0 new in either gate.

Required for the closure record (currently present in the source docs but must carry forward, not be compressed away):
- Exact remaining counts (93 core / 32 UI) and that all are pre-existing, attributed clusters, not R1 regressions.
- Explicit "headless TS/Vitest only, no Unity run" disclosure.
- The Rule‑4 leaf (`p14c3-save-v38.test.ts:93`, C20-1) is permanently retained by design (cannot be closed without changing its assertion) — must not be conflated with the other, fixable, retained clusters.
- The two `c2a-m2-sets-save` leaves were an authorized incidental fix of a shared C6 root cause (per 1324-D), additional to R1's declared 56-row target — name it explicitly, not scope creep.

## Paths
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1324-A-retained-defect-repair-r1-plan.md`, `1324-X-retained-r1-dry-run.md`, `1324-D-retained-r1-review.md`, `1325-I-broad-core-attribution.md`, `1325-I-failures.json`, `1325-r1-broad-core.json`, `1325-r1-broad-core-{preflight,postflight,collection-preflight,collection-postflight}.json`, `1321-save42-broad-core.txt` (lines 52892-52914), `1321-I-broad-core-attribution.md`, `1326-I-broad-ui-attribution.md`, `1326-I-failures.json`, `1326-r1-broad-ui-{preflight,postflight}.json`, `1317-I-broad-ui-attribution.md`, `1322-I-broad-ui-attribution.md`.
