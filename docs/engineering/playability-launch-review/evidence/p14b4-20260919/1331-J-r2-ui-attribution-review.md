<!-- 1331-J: independent review (contract-auditor, read-only) of the 1331-I draft, saved verbatim by the parent at HEAD 089431d8 from the agent's final text; the parent applied item 1 and the section 4 caveat to 1331-I before commit -->

# Independent review 1331-J

**Subject (part 2 of 2):** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1331-I-broad-ui-attribution.md` (untracked draft) and its data `1331-I-failures.json` (committed at 089431d8).

**Scope/method:** Read-only, Read/Grep only, no commands executed. I read all four full attribution JSONs in this chain (1317, 1322, 1326, 1331 — none truncated, each fully loaded) and cross-verified every one of 1331's 34 failing identities against 1317's 33, 1322's 25, and 1326's 32 by direct string comparison, not by trusting the prose summaries.

## Verdict: **REFINE**

One precise, citable numeric defect (correctable in one sentence); everything else checked — run identity, set arithmetic, cluster tallies, the outsider's identification and solo-run facts — is exactly supported by independently re-derived evidence.

## Blocking defect

**1. "Stacked with six C1 rows" undercounts by one — should be seven.**
`1331-I-broad-ui-attribution.md:28`: "`WorldFirstLotNativeCastingReviewApp` ... 5000 ms timeout, stacked with six C1 rows under one error."

Raw log `1331-r2-broad-ui.txt:3959-3967` shows 8 consecutive `FAIL |ui|` headers sharing one trailing `Error: Test timed out in 5000ms.` at line 3967:
```
3959: FAIL ... reviews all six event-owned observations...      ← the outsider
3960: FAIL ... greenlights the canonical Package...              C1
3961: FAIL ... never lets stale Casting review closures...       C1
3962: FAIL ... orients a cash stop to Administration...           C1
3963: FAIL ... clears every next-event transient...               C1
3964: FAIL ... reaches the canonical deep screen ONLY...          C1
3965: FAIL ... never lets any place print its blocks...           C1
3966: FAIL ... auto-pauses on the FIRST PAUSE-class stop...       C1
3967: Error: Test timed out in 5000ms.
```
`1331-I-failures.json` independently confirms this: all 8 rows carry `"marker_no": 2, "shared_group_size": 8`, and I verified the other 7 (lines 3960-3966) are each `"status_vs_1303": "RETAINED-SAME", "cluster_1303": "C1-timeout-5000ms"`. The outsider is stacked with **seven** C1 rows, not six. **Correction:** change "six C1 rows" to "seven C1 rows."

## Checklist results

**1. Run identity — MET WITH EVIDENCE.** `1331-r2-broad-ui-preflight.json:583/2140` head==remote `58c89932...`; postflight `:2155-2157` `fixedSource: true`, `exitCode: 1`, `allGuardsExact: true`; `1331-r2-broad-ui.json:1172-1180` `start/end` match "10:22:52Z to 10:39:26Z" exactly, `testedDiffSha256AtEnd` = the SHA-256 of the empty string (empty tested diff), `fixedSource: true`. Postflight `record`/`raw`/`patch` block (`:2140-2158`): raw bytes 432,809, sha256 `69b3d82c...` — matches the doc exactly; patch 0 bytes, same empty-string hash. Raw log `1331-r2-broad-ui.txt:6540-6541`: `Test Files 9 failed | 195 passed (204)` / `Tests 34 failed | 2658 passed | 5 skipped (2697)` — matches the stated tally digit-for-digit. `grep -i unhandled` on the raw returns zero matches.

**2. "Nothing it runs changed" — NOT VERIFIED by me (read-only), and I confirmed *why* it isn't checkable from what's available.** I checked the `sourceInventory` digest in both `1326-r1-broad-ui-preflight.json:600-603` (sha256 `b3e36fb2...`) and `1331-r2-broad-ui-preflight.json:600-603` (sha256 `aeb5b61a...`) — they differ. But this digest is a single aggregate hash over the *entire* guard scope (`sourcePaths` at both `:584-598`: `src, bridge, tests, ui, generated, scripts, package.json, package-lock.json, vitest configs, tsconfig files`), which **includes `tests/`** — the one directory both 1326-I and 1331-I explicitly say did change (the R2 core test files). So the digest mismatch is expected and uninformative; it cannot isolate whether the narrower claim (`src, bridge, ui, generated, scripts, package files, configs, AUDIO-PROVENANCE.md` alone are byte-identical) holds. No per-file manifest scoped to just those paths exists in either preflight/postflight JSON I found. This is the identical claim-type 1325-J flagged for 1326-I ("I have no shell/git access and cannot independently verify this... NOT VERIFIED by me directly — flagged as an evidence limit, not a defect," `1325-J:23`); I apply the same disposition here, not a defect in 1331-I.

**3. Set comparisons — MET WITH EVIDENCE, exhaustively.**
- vs 1303: `1331-I-failures.json:14-16` `byStatus`: `NEW:7, RETAINED-SAME:26, RETAINED-CHANGED:1` — matches "26/1/7."
- vs 1326: I compared 1331's 34 identities against all 32 of 1326's row identities (`1326-I-failures.json:44-491`) one by one. All 31 of 1326's rows except `WorldFirstLotNativeNextEventApp` "keeps an exact non-release stop on one mounted world..." (`1326-I-failures.json:142-154`) reappear verbatim in 1331's rows; that one row is absent from 1331 entirely. Confirms "31 retained, 1 gone." The "3 beyond" are: two rows present in 1326's own `"vanished"` array (`1326-I-failures.json:494-501`, both tagged there as having stopped failing by 1326) that reappear as failures in 1331 (`WorldInspectorDefault` "reaches the canonical deep screen ONLY..." and "routes canvas intent..."), plus the CastingReviewApp outsider, which is absent from 1326's rows *and* its vanished list (never before recorded failing). Confirmed exactly.
- vs 1317 ∪ 1322: I built the union of 1317's 33 identities (`1317-I-failures.json:43-504`) and 1322's 25 (`1322-I-failures.json:43-392`) and checked all 33 non-outsider rows of 1331 against it, individually. Every one is present (24 shared between 1317/1322, `StudioLotScreen` focus unique to 1322, `WorldInspectorDefault` "reaches the canonical deep screen ONLY..." and `livingTurn.scheduler` "auto-pauses..." unique to 1317). The CastingReviewApp "reviews all six..." row is absent from both. Confirms "33 of 34 inside; the only outsider is the CastingReviewApp leaf" exactly.

**4. The outsider's attribution — MET WITH EVIDENCE on the facts; one non-blocking overreach caveat on the classification.**
- First leaf of its file: confirmed directly — `ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx:298` is the first `it(...)` immediately after the file's `describe(...)` at `:297`.
- Passed in 1317/1322/1326: confirmed by its total absence from all three JSONs' `rows` and `vanished` arrays.
- Solo-run facts: `1331-I-solo-castingreview-run1.txt:5` "2457ms", run2 `:5` "2202ms"; both `:6` "Unable to find an element by: [data-testid=\"studio-lot-screen\"]"; DOM dump both files `:8-46` shows `data-testid="recovery-notice"` and `data-testid="studio-lot-lazy-loading"` "Opening the Studio Lot…"; both headers show "10 tests | 1 failed", 9 passing lines each (`:87-95`). All exactly as stated.
- **Non-blocking overreach caveat:** every prior C1 member cited by 1317-I/1322-I was validated as C1 specifically because it *passed* when run alone (1317-I: "the files pass alone, 74 of 74"; 1322-I: "passed run alone... 74 of 74") — proving the failure was purely a full-suite-load artifact. This outsider *fails* both solo runs. 1331-I discloses this honestly (it does not claim the leaf passes alone) and its underlying reasoning (a cold-mount vs. `findBy`'s fixed 1000 ms default, the same physical mechanism 1317-I measured) is coherent, but the record folds this into "the C1 time-budget family" without flagging that its isolation evidence is the opposite shape from every previous C1 member's. Recommend one added sentence distinguishing "fails alone at its own cold mount" from the established "passes alone, fails only under full-suite load" pattern, so a future reader doesn't assume this leaf was isolation-tested the same way as the others.

**5. Overclaim check — MET WITH EVIDENCE, none found.** No GREEN/closure language; "the 34 failures stay open with their causes" is the strongest closing claim, which is accurate given the confirmed 0-new-against-1325-equivalent, all-retained-cluster result.

## Non-blocking notes
1. The blocking defect above (six→seven).
2. The C1-attribution caveat above (§4).
3. `WorldInspectorDefault` "routes canvas intent and semantic companion activation to the same owner" (C6) has now shown three distinct primary error texts across 1303→1317→1331 (`TypeError: Cannot read properties of undefined (reading 'options')` → `Found multiple elements by: [data-testid="lot-nav-theater"]` at 1317 → `AssertionError: expected [ { kind: 'dashboard' } ] to deeply equal []` at 1331, `1331-I-failures.json:174-182`). 1331-I's claim ("C6 RETAINED-CHANGED... in the 1317 set") is accurate but doesn't name this further drift; worth an explicit note in a future revision, not required now.
4. Evidence limit (§2): "nothing it runs changed" is not independently checkable by me read-only; flagged, not treated as a defect, per the 1325-J precedent for the identical claim class.

## Paths referenced
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/{1331-I-broad-ui-attribution.md,1331-I-failures.json,1331-r2-broad-ui.json,1331-r2-broad-ui.txt,1331-r2-broad-ui-preflight.json,1331-r2-broad-ui-postflight.json,1331-I-solo-castingreview-run1.txt,1331-I-solo-castingreview-run2.txt,1317-I-broad-ui-attribution.md,1317-I-failures.json,1322-I-broad-ui-attribution.md,1322-I-failures.json,1326-I-broad-ui-attribution.md,1326-I-failures.json,1326-r1-broad-ui-preflight.json,1325-J-r1-gates-attribution-review.md}`; `ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx:297-298` (checked in the live repo tree).
