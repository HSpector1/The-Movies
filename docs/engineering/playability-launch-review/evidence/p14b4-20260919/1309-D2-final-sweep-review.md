# 1309-D2: independent review of the final pin sweep (r5)

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of
[1309-pin-sweep-r5.patch](1309-stage5/1309-pin-sweep-r5.patch) (sha256
cfabb301040c4cd5f2cf53f521b0eb2ff894e5d0296891966cedacb379b9bcda) and its classification (sha256
97b5a567e16c7967b388a13390c4b6e5432730dea126389346bbce7d814c892b) at HEAD b1b40c13, persisted verbatim by the parent.
Parent note on the one item the reviewer could not execute: `tests/bridge-p14p4p5-opportunities.test.ts` passed all 3
tests in the r4 full core run ([1309-X4 extract](1309-X4-fullcore-extract.txt) line 58), and r5 is byte-identical to
r4 for that file, so the digest pin `f62253f5…` has been confirmed by execution. The parent's dry run of r5 is
[1309-X5](1309-X5-sweep-r5-dry-run.md).

---

# Independent Review — Task 1309-D2: Save41/projection56 Pin-Sweep, Revision r5 (FINAL)

**Scope actually reviewed:** `E/1309-stage5/1309-pin-sweep-r5.patch` (146 files, confirmed by direct `diff -ruN` header count) + `E/1309-stage5/1309-pin-sweep-r5-classification.json` (671 rows, confirmed by direct count) + the 1308 neighbor file, against the full ruling chain (1309-A, 1309-D, 1309-F, 1309-X2/C2, 1309-X3/C3, 1309-X4/C4, 1309-C5) and current HEAD source (`src/core/save.ts`, `bridge/schema/bridge-schema.ts`, `bridge/runtime-checkpoint.ts`, `src/core/talentMarket.ts`). Read-only (Read/Glob/Grep); no vitest/tsc/node run by me — every claim below traces to a file:line I read directly or a cited measured artifact.

**Important scope note for the parent:** r1 (the original 1309-C patch) received a full independent contract-auditor review (1309-D). Revisions r2–r4 (1309-F rulings 1–10, X2 rulings 1–6, X3 rulings 1–10, X4 items 1–5) were only *dry-run measured* (tsc/vitest) by the parent, never independently reviewed for assertion-strength/live-vs-historical/classification-integrity the way r1 was. This is therefore the **first independent review of the full cumulative r2–r5 content**, not just the 5 Z-fixes. I reviewed accordingly (full-patch grep sweeps + targeted deep reads across r2/r3/r4/r5 additions), not only the Z-diff.

---

## Check-by-check verdicts

**1. Assertion strength.** **MET WITH EVIDENCE, no unjustified weakening found.**
Ran full-patch greps for matcher-relaxation patterns (`toMatchObject` additions, bare `.toThrow()` additions, `.skip(`/`.todo(`, witness-list shrinks) across all 146 files. Findings:
- Every bare `.toThrow()` addition (e.g. `tests/p14b1-t4-regressions.test.ts:83,86`, `tests/p14c2rm-writer-continuation.test.ts:73,79` in the r5 patch) is a `validateSaveV40→V41` rename of an *already-bare* `.toThrow()` in the pre-sweep original — not newly weakened.
- The one new `toMatchObject` (`tests/bridge-p14b4-cast-class.test.ts:721`) is ruling 8/Y8's correction of a previously-wrong universal `ok:true` assertion for `PREFERRED_GENRE_OPPORTUNITY`/`SPECIFIC_PROJECT`. Verified directly against `bridge/schema/bridge-schema.ts:1842–1856`: `StudioMarketProposalGenrePromiseDraftPayload`/`...ProjectPromiseDraftPayload` both require `seatClass` + `genre`/`scriptProjectId` via `opportunityDraftTerms`, which a bare `WIRE_P2` draft doesn't carry — a `WIRE_P2`-only draft for these two families genuinely is `INVALID_COMMAND`. This is a **defect fix**, not a weakening (the two legal families, `APPEARANCE_COUNT`/`DIRECTING_COUNT`, keep their unweakened `.ok).toBe(true)`).
- Two witness-list reductions found (both required by X2 ruling 6, both correctly documented): `tests/p14b1-trust-chooser.test.ts:3117–3220` (dropped `flexible`/`negativeUnproven` witnesses) and `tests/p14b4-cast-class-policy.test.ts:3460–3549` (dropped required-set from 4 to 3, added `DIRECTING_COUNT`). Both carry an **"OPEN COVERAGE FINDING"**-labeled comment block citing `E/1309-Q2-rival-authoring-census.txt` by path with the measured 72/220-week/0-unproven fact, and both explicitly state the dropped requirement is a genuine coverage gap, not silently absorbed. The per-read law checks inside the shared spy (`tests/p14b1-trust-chooser.test.ts:3080–3084`: draft-equality + not-achievable-for-all-priors) are unconditional on every read regardless of witness — not removed.
- `keep` rows: 14 total (grep-confirmed), all carrying a specific, checkable reason (e.g. `tests/p14c3-save-v38.test.ts:64` — "genuinely historical: `converted = saveApi('convertV37ToV38')(old)` produces a real V38-shaped envelope"). None re-pin a historical envelope to the live validator.

**2. Live vs historical.** **MET WITH EVIDENCE.**
Sampled 40+ distinct files across bridge-*, p06a/p08a/p12/p13*, p14* families via direct patch reads (55→56 projection, 40→41 save-version, 53→56 snapshot-version pins). Every sampled moved literal traces to a live construction (`makeSave`, `migrateToLive`, a hydrated checkpoint slot, or an explicit `LIVE_SAVE_VERSION` stamp). Every retained historical literal (the 14 `keep` rows, plus untouched frozen-fixture pins like `tests/p14r3-save-v41.test.ts` and `tests/bridge-p14r2r3-prior55.test.ts`) is left alone with a specific reason. Cross-validated `tests/bridge-p14b6-relationship-read-models.test.ts:961→962`'s `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size).toBe(44)` against a manual literal count of every entry in `bridge/runtime-checkpoint.ts:60–215`'s Map — **independently counted 44**, matching exactly.

**3. Downgrade chains and masks.** **MET WITH EVIDENCE on the sampled items.**
Verified directly against `src/core/save.ts`:
- `convertV40ToV39` (`:10453–10457`) throws exactly `'migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take subject'` — byte-identical to ruling 2's cited message used across `p06a-w1-release-authority.test.ts:447`, `p13b-s3-save-v23`, `p14b5-relationships:1071`, `p14c3-{cohort-transition,dual-extensions,offmenu-extensions}`.
- `convertV41ToV40` (`:10490–10504`) has exactly the two named guards ("cannot downgrade or discard a rival termination receipt" / "...movement"), matching the C14 comment landed at `tests/p06a-w1-release-authority.test.ts:444` (row `line:443, plan_item:6, cluster_id:C14`) verbatim.
- `migrateToV37`/`migrateToV38` (`:10329–10401`) confirmed as real composite recursors handling `saveVersion===41` by chaining `convertV41ToV40→convertV40ToV39→convertV39ToV38→convertV38ToV37`, exactly as Z3's fix (`tests/p14c3-save-v38.test.ts:11,446`) relies on.
- `tests/p14c3-save-v38.test.ts:463` (flagged by C5 as possibly-masked, explicitly left untouched, out of Z3's assigned line range): confirmed `convertV38ToV37` (`:10387–10393`) runs `assertProfessionHistoryDowngrade` **before** `validateSaveV38`, so a genuinely V41 input with dated career-lifecycle authority hits the entrant guard first regardless of version. This matches the parent's measured fact given in this task ("the entrant guard the leaf names") — the leaf is **not masked**; no action needed here, consistent with C5's own disclosure.
I did not independently re-verify every one of the ~20 downgrade-guard sites in `p13b-s3-save-v23`'s three migrators or `p14c3-cohort-transition/dual-extensions/offmenu-extensions` line-by-line against source; I relied on C4's own measured-`AssertionError`-text citations for those, which is strong but not independently-executed evidence — flagged as a sampling limit, not a defect.

**4. Save41 termination fallout.** **MET WITH EVIDENCE.**
`convertV40ToV41`'s own doc comment (`src/core/save.ts:10478`: "Adds a zero `termination` movement to every rival period; nothing else moves") matches the `withRivalTermination` helper's construction, landed independently (by design, per ruling 1) in `tests/bridge-p14c2s-scientist-runtime.test.ts:1053–1059`, `tests/p14p4p5-opportunities.test.ts:4950–4957`, `tests/p14c3-save-v38.test.ts:4441–4448` — all build the expected state from `old.state`/`previous.state`, never a literal, and all correctly typed generic (`<T extends WithRivalBusinesses>`), resolving X3's 9-error `tsc` finding (confirmed X4's dry run: "Type gates: root 1 error [unrelated dead-import]; Bridge 0; UI 0" — the 9 generic-signature errors are gone).

**5. Computed pins (43-count / sha256).** **MET WITH EVIDENCE for methodology and count; NOT VERIFIED (execution required) for the exact digest bytes.**
`tests/bridge-p14p4p5-opportunities.test.ts` (patch lines ~1299–1315): `older = [...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(id !== OLD_SCHEMA)`, `.toHaveLength(43)`, sha `f62253f540a1b498e953cfb22b9558ca70131a14ef4754352457e75d0f6c13da`. Independently recomputed the total map size by manual literal count of `bridge/runtime-checkpoint.ts:60–215` = **44 entries**; `OLD_SCHEMA` = the single `projection-v54` entry; 44−1=**43**, matching the pin exactly and independently cross-validated by the orthogonal `bridge-p14b6-relationship-read-models.test.ts:962`'s `.size).toBe(44)`. The construction is genuinely computed from the literal source map (not copied from a run) as required. I have no code-execution tool and cannot independently produce the SHA-256 digest; C4's own handback discloses the identical limitation ("the one number in this whole sweep I could not independently confirm through the extract, only through my own from-scratch recomputation"). This is a real, narrow, already-disclosed gap — not a sweep defect, since the methodology satisfies the task's requirement ("recomputed... never copied from a run output"), but the parent's own forthcoming full-core run is the only thing that will confirm the digest bytes.

**6. Classification integrity.** **MET WITH EVIDENCE.**
Sampled far beyond 30 rows across item-1 (r1), F8 (r2), item-3/C1 (r1), Y1/Y4 keep rows (r4), and all 6 Z-rows (r5). Every sampled row's `old_text` matched either current HEAD or the correct post-prior-revision baseline (confirmed directly against the patch diffs for the Z-rows and several F8/keep rows), and every `new_text` matched the patch's actual post-image byte-for-byte, including multi-line rows (e.g. `tests/p14b1-trust-chooser.test.ts:806` F8 row). Ruling-id attribution in `source` fields is specific and traceable in every sampled row. No patch hunk found without a corresponding row in my sampling (the Z-file diffs I read line-by-line against the patch account fully for their 6 rows).

**7. r4 full-core fallout not addressed by r5.** **MET WITH EVIDENCE — none found.**
X4's own dry run explicitly enumerates exactly 5 in-scope items for r5 (bridge-schema.test.ts:576, p14p4p5-opportunities Q04:350, p14c3-save-v38 A11:446, bridge-p14c2s-scientist-runtime:119, the dead import) and attributes all other 160 of its 165 failing tests to named, explicitly out-of-1309-scope 1302 clusters (C6/C7/C8/C15/C16/C16b/C17/C20/C12/UNRESOLVED/RETAINED/NEW-scratch-artifacts) — matching 1309-A's own "Out of scope" list verbatim. Confirmed C5's Z1–Z5 patch exactly and only touches those 5 named sites (byte-diffed r4-vs-r5 patch content for all 5 Z-files line by line; all non-Z-file diffs in r5 are byte-identical to r4's). The parent's given measured fact ("the 5 failures [in the 6 Z-item/neighbor files] are the p14c3-save-v38 A01/A02 rows attributed C20 (retained) in X4, unchanged") is consistent with this — A01/A02 is a different describe block from Z3's A11 target, and C20 ("migration purity") is explicitly out-of-scope per 1309-A.

---

## Notable self-correction (per instructions, naming a correction that changed an earlier recommendation)

r3's handback (1309-C3) claimed `tests/p14b4-cast-class-policy.test.ts`'s `seed-b` scan carries the `flexibleP2`/`P1fallback` witnesses, citing an archived log (`600-T4-scan-C-policy-seed-b-seed-c-bottleneck.log`). X3 ruling 10 (a real measured full-core run against the r3-patched source) **refuted this**: the actual `seed-b` scan under the current widened law produces only the same 3 witnesses as the default seed. r4/r5 correctly self-corrected (`tests/p14b4-cast-class-policy.test.ts:3524–3540`), removed the stale citation, and now record `flexibleP2`/`P1fallback` as an open coverage finding on **both** seeds. This is exactly the kind of "later correction that changes an earlier recommendation" the task asked me to surface — it is already resolved correctly in r5; no further action needed.

---

## Required changes

**None required for application.** No hunk lacks a classification row; no matcher was relaxed without a cited measured cause; no historical envelope was fed to `validateSaveV41`; every live pin sampled states the live 41/56 values.

One **non-blocking follow-up recommended, not a sweep defect**: after r5 lands, the parent's already-scheduled full core + UI rerun should specifically confirm the `sha(canonicalJson(older))` value at `tests/bridge-p14p4p5-opportunities.test.ts` (~line 474/1315 post-patch) actually equals `f62253f540a1b498e953cfb22b9558ca70131a14ef4754352457e75d0f6c13da` under real execution — this is the one number in the entire 671-row sweep neither the test-author nor I could cross-check against a "Received:" value. If it mismatches, the fix is a one-line literal correction (recompute and re-pin), not a design change.

---

## What I could not verify (read-only limits)

- The SHA-256 digest above (no code-execution tool available to me).
- Whether the r5-patched suite is actually GREEN beyond the 6 Z-item/neighbor files the parent already ran (122 passed/5 failed, both attributed) — the broad core + UI gates are explicitly scheduled *after* this review per 1309-F's own Order section, so their absence here is expected process sequencing, not a gap in this review.
- Did not independently re-derive every downgrade-guard site outside the ones I read directly against `src/core/save.ts` (see check 3).
- Did not re-open C6/C7/C8/C12/C15/C16/C16b/C17/C20/UNRESOLVED/RETAINED — explicitly out of 1309's scope per 1309-A and X3/X4's own attribution, consistent with the task's instruction not to propose new audits beyond this sweep.

---

## Verdict: **ACCEPT**

r5 is a careful, well-sourced, internally self-correcting completion of the Save41/projection56 pin sweep. Every check the task specified came back MET WITH EVIDENCE except the SHA-256 digest bytes at `tests/bridge-p14p4p5-opportunities.test.ts`, which is NOT VERIFIED only because verification requires code execution unavailable to a read-only reviewer — the computation methodology and the underlying count (43) are independently confirmed. Apply r5 + the 1308 neighbor change to `tests/` as staged; proceed to the broad core and UI gates per 1309-F's Order, and have that run specifically surface a mismatch (if any) on the one unverified digest.

**Key paths referenced:** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage5/1309-pin-sweep-r5.patch`, `.../1309-stage5/1309-pin-sweep-r5-classification.json`, `.../1309-stage4/1309-pin-sweep-r4.patch`, `.../1309-A-save41-pin-sweep-plan.md`, `.../1309-D-pin-sweep-review.md`, `.../1309-F-parent-sweep-adoption.md`, `.../1309-C2/C3/C4/C5-*-handback.md`, `.../1309-X2/X3/X4-*-dry-run.md`, `.../1309-Q2-rival-authoring-census.txt`, `.../1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts`; `src/core/save.ts:10329–10509`; `bridge/schema/bridge-schema.ts:1823–1868`; `bridge/runtime-checkpoint.ts:60–215`; `tests/bridge-schema.test.ts:576`; `tests/p14p4p5-opportunities.test.ts:31–61,297–366`; `tests/p14c3-save-v38.test.ts:8–24,443–463`; `tests/bridge-p14c2s-scientist-runtime.test.ts:9–20,92–119`; `tests/p14c2b-save-v36.test.ts:26–29`; `tests/p14b1-trust-chooser.test.ts:2954–2963,3108–3220`; `tests/p14b4-cast-class-policy.test.ts:3422–3549`; `tests/bridge-p14b4-cast-class.test.ts:702–723`; `tests/bridge-p14p4p5-opportunities.test.ts:24–26,317–320,457–465`; `tests/bridge-p14b6-relationship-read-models.test.ts:917–962` and `.../1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts:463–480`.
