<!-- 1359-D: independent RED review of 1359-C (contract-auditor, read-only) -->

# 1359-D: review of the P15C Wave 2 RED (1359-C)

**Verdict: REFINE.** Coverage is complete and the RED reasons hold. Seven changes and two rulings.

Read at HEAD c9405c3e. I ran no test, node, tsc or script. Both patches equal the scratch diffs and staged copies (sha256 9214f8c3…, 4a1d0453…) and pass `git apply --check` at HEAD. I = `tests/p15c2-campaign-legacy-integration.test.ts` at a06c0ae; L = landed `src/core/campaignLegacy.ts`.

## Required changes

1. **The era guard accepts a live alias.** C11 (I:1305-1330) compares v1 with live exports and TUNING; the old-law leaf (I:1394-1421) mutates TUNING after import. A table that copies TUNING at load passes both, and a later retune without a bump passes C11 too (the retune edits the Wave 1 pin, p15c1:1894): stored v1 manifests then fail replay and no leaf fails. Pin v1 as literals in C11 (the fifteen 1353-A §5.5 values, 6240, the mode, the id lists, the bounds), as I:1316-1321 does for count keys. That proves 1353-J note 2.

2. **No budget can fire.** Every leaf in I is synchronous (`memo`, I:123-138), and vitest 2.1.9 runs the body before arming its timer (`node_modules/@vitest/runner/dist/index.js:37-48`). The 180 s is Wave R's (1359-A:253-255), not route L's. Mark I:84-86 PROVISIONAL and assert the times I:574 and I:1012 already log; the parent sets them from the first single-file run (1356-F2 item 5). Wave R's guard shares the flaw (p15c-wave-r-retention.test.ts:95-109).

3. **One P15 list (1356-F2 R3).** I:88 and I:206-210 keep a private list; the handback never cites 1356-F2. Read `P15_ROOTS`/`stripP15` from `tests/helpers/p15-roots.ts`, adding `campaignLegacy` at landing as 1355-C does. Declare the re-pin set: `p15Rows`' guessed sibling paths (I:271-285) behind B1's `next` checks (I:879, :883, :898), A7/A8's forged roots (I:779-853), C5's key list (I:1143). A7/A8 pass only if production reads unlanded roots; 1359-A:275-276 gives that branch to the sibling if P15C lands first. State the assumed order.

4. **Vacuous paths.** C2 (I:1070) passes on an empty `inputs`; assert one. B4b's outside half (I:976-978) passes when no condition event carries 6240; add a premise or drop it (B4 covers it, I:941-963).

5. **Captures.** C3, C3b and C4 need route L captures at 6239 and 6240; no producer exists (1355-C shipped one). Ship a mint recipe sharing route L's code. I:451 assumes a shared step; a separate one (1359-A:277-278) needs new captures.

6. **B3's forged input.** I:924 ticks an official at 6239, which the marker rule refuses. List it with A9 and B5.

7. **F1's edge.** No Wave 1 leaf pins L:351. Add one: an authored settled film with a null week passes; a campaign one refuses. An over-relaxed rule reads `null < B` as true at L:416 and counts that gross.

## Rulings

**F1: change the law.** No earlier text sets an authored settled week (1353-A:115; 1353-C's bare `number | null`; 1353-F..F5). L:351 caught authored films by accident, while L:363 already requires their release week null. 1359-A:53 alone decides the value, and null is the honest one: week 0 is 1920·W1, and a pre-1920 settlement has no campaign week (ruling 5). Accept null for authored films only (reference :358). Wave 1's 78 leaves stay green: none pins L:351, and authored fixtures carry week 10 (p15c1:237-239), which the rule still accepts. `CAMPAIGN_LEGACY_DEFINITION` stays v1: authored films never become a `Release` (L:407-417), so every fact set v1 accepted yields the same manifest, and no v1 manifest exists yet (1353-L:44). Production commit (b) carries it with change 7.

**SIBLING PENDING: split before the recorded RED.** A RED leaf must pass when its own wave lands. Fixture-pending leaves can, since the parent mints captures before the recorded run; sibling-pending ones cannot if P15C lands first, when 1359-A:275-276 gives the joint case to the sibling. Keep B2, B4b, C3b, C8b and C10c only where the parent rules that the named sibling shares P15C's step; move the rest to that sibling's landing patch. Move B7 now: it needs P15B's root and a closure route only P15B's RED can supply.

Also open: 1359-F:24-26's week-8,791 timing has no leaf; assign it to G-L or add it.

## Checklist

1. **Coverage.** §8 A1-A9, B1-B9 and C1-C12 each have a leaf. The replay matrix (I:1347-1392) covers outcome, count, ref order, 1359-B's case, a lens value, and Standing inside and outside range. Amendment 2: Wave R :342-358, byte-equal as worded. Amendment 3: D1-D3 sit in Wave 1 (p15c1:2086, :2107, :2130).
2. **RED reasons.** Each RED leaf resolves a Wave 2 name, the root or a STEP function (I:160-188, :471-478) before any assertion fails; static imports exist in L. Pending leaves throw by name (I:288-297, :446-449, :466, :1025). Controls pass by reading. Expected GREEN: 34 of 43 pass, 9 fail by name.
3. **Siblings.** B3 holds: the finale allocates last (1355-F2:26-30), so the bypass moves no sibling sequence.
4. **Ordering claim: unfounded and unneeded.** No charter orders refusals (1359-A:193-195; 1355-F2:51-53; 1357-A:158-160), and `p15Sequence` refuses nothing. No tick has run on G6240F, so its sibling roots are empty (1357-A:159); only the Legacy check can refuse it, in any order. Drop the claim.
5. **Determinism.** Fixed seeds, no RNG, serialized comparisons, K1 `rngState` (I:933), K2 (I:1045-1053). Version literals are base facts (43 at I:82, 38 at I:421).
6. **Reference.** Minimal: six files; `p15Phases.ts` byte-equals 1356-C's. By reading, every non-pending leaf passes, B5 included: the profession proof swallows the missing concept (`liveRetirementWriting.ts:21-26`) and legacy-mode scripts skip concept checks (`scriptDevelopment.ts:949-952`). Nothing ran; the parent's reference run is the 1353-F4 check.
