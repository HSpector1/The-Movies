<!-- 1356-D3: confirmation review (contract-auditor, read-only) of 1356-C3 r3, written by the reviewer -->

# 1356-D3: confirmation of the slice 2a RED r3

**Verdict: NOT CONFIRMED.** One defect, D-1: the harness ceiling cannot fire. Checks 1 and 3 to 6 hold.

I read repo HEAD 2eaacb29 (`src` tree db80ca31, unchanged since ff05430d) and scratch `main` at a5bd03c. I ran no vitest, tsc, node, tsx or npm. A and H mean the archive and harness test files at a5bd03c; E is the evidence folder.

## 1. Case (a) and `foundMidGame` (F3 item 1 as amended by F4): HOLDS

- Case (a) founds at 26 (A:1152), asserts origin week 26 (A:1153) and a closed draft at 26 (A:1155) and at every week to 66 (A:1156-1159), then checks records 39, 52 and 65 (A:1160), `lowerEndRefuses` (A:1161) and `firstRequired` (A:1162). `agrees` checks the literal weeks against `quartersIn(max(recordedFromWeek, originWeek), tick)` (A:1121, :1124), so a moved field fails the leaf instead of passing on a guess.
- `foundMidGame` (A:232-242) opens a draft with no industry (employment.ts:573-576, the repo's "historical analysis control", which refuses a living industry at :574), signs `FOUNDING_MINIMUMS` per role on 208-week terms (A:236-240; tuning.ts:394), applies `foundStudio` (actions.ts:1201-1223, which throws below the minimums) and lets the industry in with origin `migration` (hollywood.ts:158-186). It catches no refusal.
- Lawful: yes. The frozen `convertV18ToV19` builds the same shape, a pre-industry state given a `migration` industry (save.ts:8048-8053). The contracts become `existing-player-contract` rows (hollywood.ts:185; industryEmployment.ts:29), which the payment rule exempts (hollywoodValidation.ts:568).
- F4's H8 citation supports the late `migration` origin only. H8 (tests/p14c3-profession-history.test.ts:216-218) takes its world from `lateIndustryBoundary`, which calls the public `beginFounding` at 209 and signs no one (tests/helpers/p14c3-history-boundary-fixtures.ts:107-112). save.ts:8050 is the precedent for founding before the industry arrives. The gap sits in F4's citation; r3's construction stands on save.ts:8050.
- The leaf's claim does not move. r2's `beginFounding` at 26 also gave origin `migration` at 26 (employment.ts:569; hollywood.ts:174). The reference seeds `recordedFromWeek: 0` (61f13b2 worldgen.ts:821), and `initializeHollywood` never touches it. The interval stays (26, tick]. The construction adds what F3 asked for: a closed draft and six signed contracts.

## 2. Harness ceiling (F3 item 2): FAILS, see D-1

- `CEILING_MS = 300_000` (H:38) is the leaf's timeout (H:83) and cites 1356-X `campaignMs` 61,020 (H:15-17, :38). "Run it alone" stays (H:8, :18-19). PROVISIONAL is gone.
- The ceiling cannot fire. The leaf is synchronous (H:57) and runs the campaign in its body (H:58, :42-54). Vitest 2.1.9 calls the test function before it arms the timer (node_modules/@vitest/runner/dist/index.js:37-48), and a fixture-free handler runs synchronously inside that call (:138-147, :425-431, :531-533). The repo already records the effect: B55-2, synchronous with `TIMEOUT = 60_000` (tests/bridge-p14p4p5-opportunities.test.ts:23, :407, :450 at 4d1fdec8), passed in 228,867 ms under v2.1.9 (E/1250-bridge55-material-runtime.txt:1, :4, :25). 1356-X2's 65,404 ms pass (1356-X2:13) never reaches the ceiling.

## 3. Open-draft ticks (F3 item 3): HOLDS, none missed

- Only `beginFoundingDraft` turns a null draft into an open one (employment.ts:557), and src/core reaches it only through `beginFounding` and `beginFoundingHistoricalControl` (employment.ts:569, :575). r2 had six founding sites (adeee94 A:225, :488, :623, :698, :1121, :1151). r3 changes all six: `foundedAt` (A:249, used by `rank-adapter-pre-origin` at A:512), the zero-while-founding leaf (A:649-651), the founded-27 leaf (A:726), case (a) (A:1152) and case (d) (A:1188).
- `beginFounding(` remains once (A:651), with no tick after it, and that leaf keeps its open-draft premise (A:653). `beginFoundingHistoricalControl` runs only inside `foundMidGame` (A:233), which closes the draft before it returns (A:241). The isolation, harness and helper files call neither.
- The other world sources open no draft: `p13aGeneratedStudio` (src/harness/p13a/fixtures.ts:9-12), the Save42 captures that follow it (tests/p14d1-rival-shelving-fixtures.ts:8-9) and `generateWorld` (worldgen.ts:744). Case (c)'s `founding` is UNVERIFIED, since I did not open the save. Its save holds a week-0 contract and three released player films (tests/helpers/p14c3-dual-extension-fixtures.ts:40, :51-53), and an open draft refuses a greenlight (tests/d11-employment.test.ts:217-230).
- Case (d) asserts the closed draft at week 27 only (A:1190), and the other two founded leaves assert none. No tick opens a draft, so the draft `foundStudio` closes stays closed. Not a defect.

## 4. Nothing else changed: HOLDS

- `git diff adeee94..a5bd03c` touches two files: H:1, :15-19, :38, :83 and A:1, :53-54, :220-249, :647-651, :726, :1146-1159, :1185-1190. Each hunk is F3 item 1, 2 or 3 or a disclosed "r3 1356-C3" tag, in commits aee6a72, 5275150 and a5bd03c as C3 states.
- The staged r3 patch is byte-identical to `git diff 45b2782..main` (sha256 95ac4605…), and the r2 patch to `45b2782..adeee94`. `git apply --check --cached` passes at HEAD 2eaacb29 on a temporary index, since deleted.
- Types by reading: the new imports exist (employment.ts:46, :573; hollywood.ts:158), and `signContract` takes `termWeeks: number` (types.ts:2597). Compilation is UNVERIFIED.

## 5. RED reasons: HOLDS

- The boundary, pre-origin and zero-while-founding leaves await `archiveFn` first (A:1120, :511, :646) and fail on the missing module before any founding runs. C3:50-53 shows that failure for the boundary leaf.
- The founded-27 leaf runs `foundMidGame` at RED. On that path the reference adds only the step wrap and two seeded roots (61f13b2 tick.ts:1163, worldgen.ts:821-822), and the leaf passes there (1356-X2:17-19). By reading, it reaches `archiveOf` at week 28 at RED (A:732, message at A:128).
- The harness still fails at week 13 (H:48). 1356-X2:11 records 69 failed and 2 passed, as 1356-X:18 did at r2.

## 6. Classification: HOLDS

The r3 classification (sha256 a662712a…) keeps r2's 72 rows in order, with the two C2 controls. Five rows changed. Each cites 1356-F3 :8-13, :14-15 or :17-18 and matches the code (A:512, :649-651, :726, :1152, :1188; H:38). The founded-27 row names the week-28 `archiveOf` failure after the founding and the chart contrast.

## Defect

**D-1.** tests/p15a2-power-ranking-archive-harness.test.ts:38, :57, :83. The 300,000 ms ceiling bounds nothing: a slow run passes and a runaway run hangs (check 2). r1 and r2 had the same gap; F3 item 2 made it matter. Fix: enforce the ceiling inside the leaf. In `campaign()`, after each `tick` (H:47), throw a named error once `performance.now() - started` exceeds `CEILING_MS`. After `validate(save)` (H:75), assert that campaign, save and validator milliseconds sum to at most `CEILING_MS`. Keep `CEILING_MS` as the `it` timeout. The RED stays the week-13 `archiveOf` failure.

Outside r3: by the same reading, `HEAVY` and `MEDIUM` (A:179-180) cannot stop the synchronous campaigns they cover.
