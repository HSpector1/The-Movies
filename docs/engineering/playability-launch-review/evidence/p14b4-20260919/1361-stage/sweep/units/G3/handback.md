## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. The retained S8 patterns pass; UI has no failures. Both production-stop files pass (causal-core 8/8 and byte-parity 6/6). No lawful ticked archive was repinned as a refusal.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G3 handback (1361-N)

I edited the 36 files of the plan's G3 table and no others: 31 under `tests/` and 5 under `ui/src/`. `patch.diff` is `git diff HEAD -- tests ui` on top of H. It holds 108 lines, each replaced one for one (108 insertions, 108 deletions), uncommitted in the tree. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/G3-index git -C <repo> read-tree HEAD && ... apply --cached <H>/patch.diff && ... apply --check --cached <G3>/patch.diff; rm -f /tmp/G3-index
    exit 0, no output

`git diff --check` is clean. The added lines hold no non-ASCII character that the removed lines lack. All 36 files are regular files, so no write went through a link.

## What changed per file (108 of 108 planned lines: 96 certain, 12 measure)

- Live pin only (`toBe(44)` to `toBe(45)`): `c2a-m3-rename-and-pooling` :214 :363; `c2a-m3-screenplay-mint` :356; `d11-employment` :551; `d17-engagement-persistence` :466; `d17a-adv-reconciliation` :337; `p04a2-writer-credit-law` :773; `p14b7-promise-waiver` :651; `film-chronicle` :911, :922 and the guard :923 (`!== 45`).
- Pin and validator (`validateSaveV44` becomes `validateSaveV45`, import included): `construction-save-v11` import :50, pin :189, call :191; `p14c2a-save-and-settlement` import :28, call :346, pin :353; `p14c4-save-v35` import :33, pins :57 :63, calls :277 :278; `v14-byte-parity.contract` by-name lookup :201, pin :205; `p09a-w0-founding-regime` import :57, pin :137, call :214; `placement-save-v12` import :53, calls :412 :436; `property-state-v13` import :65, pins :533 :700, call :702.
- Validator only: `p13a-causal-core` import :4, calls :49 :91; `p13b-s2-access-identity` import :4, call :196; `p13b-s3-validation` import :2, call :159.
- S8 renames, pattern kept (12 lines): `construction-save-v11:514`; `p09a-w0-founding-regime` :145 :147 :149 :151; `placement-save-v12` :418 :430 :443 :450; `property-state-v13` :799 :868 :880. `deferred.md` section B lists the guard each must show.
- Sentinels (stamp 45 to 46, range "1 through 45"): `construction-save-v11` :553 :554; `d17a-adv-migration` :274; `d17b-save-v7` :163; `script-projects-save-v9` :415 :416 :418 :419; `property-state-v13` :943 :944. Six more files carry a title (see below) beside the sentinel: `p13b-s2-save-v22` (pin :208, sentinel :214), `p13b-s3-save-v23` (pin :121, :125 :126), `p13b-s5-save-v24` (pin :210, :214 :215), `p13b-s6-save-v26` (:224 :225, pin :254), `p14a1-save-v28` (:255 :256), `p14b1-save-v29` (pin :110, :205 :206).
- Live-version titles with their pins: `p13b-s7-announcements` (:87 :135), `p14b5-save-v31` (:196), `p14b10-save-v44` (:119 :363 :369 :370), `p14d1-rival-shelving-save-v43` (:46 :85).
- UI, `toBe(45)` only: `d17-save-migration` :131 :155; `film-chronicle-adapter` :289; `v14SetHolderBoundary` :46; `saves.test.tsx` :126; `session.test.tsx` :332 :360 :387. The trailing "SaveFileV38" comments stay.
- Kept on purpose: `p14b10-save-v44` keeps every `validateSaveV44`, `convertV44ToV43` and `saveVersion = 44` that handles a genuine V44 envelope (the plan's keep lines). G3 has no S4, S5, S7, S9 or S10 line, so no file imports `tests/helpers/p15-roots.ts` or `initialP15Roots`.

## Type sites cleared (2 of 2, root gate)

- `p14c2a-save-and-settlement.test.ts(347,35)` TS2379: `reloaded` comes from `validateSaveV45` at :346, so `tick(reloaded)` takes a `GameStateV45`.
- `p14c4-save-v35.test.ts(279,35)` TS2379: `validateSaveV45` at :277 and :278, so `advanceTo(reloaded.state, 156)` takes a `GameStateV45`.

## Title renames (12, class T, exactly the plan's list)

Identity is `file > describe > title`. The describe chain stays and only the title moves. `[em dash]` stands for U+2014 here; `rows.json` holds the exact strings.

- OLD: tests/p13b-s2-save-v22.test.ts > P13B-S2 envelope law at the live writer (test 8) > refuses an unknown saveVersion 45 with the updated range (stale number corrected post-C.2b)
  NEW: tests/p13b-s2-save-v22.test.ts > P13B-S2 envelope law at the live writer (test 8) > refuses an unknown saveVersion 46 with the updated range (stale number corrected post-C.2b)
- OLD: tests/p13b-s3-save-v23.test.ts > P13B-S3 Save V23 (test 7) > an unknown saveVersion 45 is refused, naming the handled range (stale number corrected post-C.2b)
  NEW: tests/p13b-s3-save-v23.test.ts > P13B-S3 Save V23 (test 7) > an unknown saveVersion 46 is refused, naming the handled range (stale number corrected post-C.2b)
- OLD: tests/p13b-s5-save-v24.test.ts > P13B-S5 Save V24 (test 4) > an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (stale numbers corrected post-C.2b)
  NEW: tests/p13b-s5-save-v24.test.ts > P13B-S5 Save V24 (test 4) > an unknown saveVersion 46 is refused, naming the handled range "1 through 45 only" (stale numbers corrected post-C.2b)
- OLD: tests/p13b-s6-save-v26.test.ts > P13B-S6 Save V26: genuine V25 fixtures, honest lift, chains, validator refusals (test 7) > an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (B4 additive reader boundary; stale numbers corrected post-C.2b, then post-1344-N)
  NEW: tests/p13b-s6-save-v26.test.ts > P13B-S6 Save V26: genuine V25 fixtures, honest lift, chains, validator refusals (test 7) > an unknown saveVersion 46 is refused, naming the handled range "1 through 45 only" (B4 additive reader boundary; stale numbers corrected post-C.2b, then post-1344-N)
- OLD: tests/p13b-s7-announcements.test.ts > P13B-S7 announcements persist nowhere: genuine V26 fixture, live load, advance past the announce week (test 3) > LIVE_SAVE_VERSION is 44 (stale title corrected post-C.4 and again for Save43; P13B-S8 made it 27 at the time) [em dash] S7 itself changes no save
  NEW: tests/p13b-s7-announcements.test.ts > P13B-S7 announcements persist nowhere: genuine V26 fixture, live load, advance past the announce week (test 3) > LIVE_SAVE_VERSION is 45 (stale title corrected post-C.4 and again for Save43; P13B-S8 made it 27 at the time) [em dash] S7 itself changes no save
- OLD: tests/p14a1-save-v28.test.ts > P14A.1 test 8: Save V28 (genuine V27 fixtures, honest lift, downgrade, validator refusals, sentinel 29) > an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (stale numbers corrected post-C.2b)
  NEW: tests/p14a1-save-v28.test.ts > P14A.1 test 8: Save V28 (genuine V27 fixtures, honest lift, downgrade, validator refusals, sentinel 29) > an unknown saveVersion 46 is refused, naming the handled range "1 through 45 only" (stale numbers corrected post-C.2b)
- OLD: tests/p14b1-save-v29.test.ts > P14B.1 test 8: Save V29 (genuine V28 fixture, empty new tables, same digests, round trip, downgrade) > an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (stale numbers corrected post-C.2b)
  NEW: tests/p14b1-save-v29.test.ts > P14B.1 test 8: Save V29 (genuine V28 fixture, empty new tables, same digests, round trip, downgrade) > an unknown saveVersion 46 is refused, naming the handled range "1 through 45 only" (stale numbers corrected post-C.2b)
- OLD: tests/p14b10-save-v44.test.ts > API decisions this file exercises (existence asserted first) > LIVE_SAVE_VERSION is 44; validateSaveV44 / convertV43ToV44 / convertV44ToV43 / migrateToV44 exist as functions
  NEW: tests/p14b10-save-v44.test.ts > API decisions this file exercises (existence asserted first) > LIVE_SAVE_VERSION is 45; validateSaveV44 / convertV43ToV44 / convertV44ToV43 / migrateToV44 exist as functions
- OLD: tests/p14b10-save-v44.test.ts > save-v44: the chain and the live route (1358-F4 item 3) > migrateToLive lifts the GENUINE V43 save to Save44 with competitions: [] and romance: null on every edge; makeSave stamps 44 and validateSave dispatches it
  NEW: tests/p14b10-save-v44.test.ts > save-v44: the chain and the live route (1358-F4 item 3) > migrateToLive lifts the GENUINE V43 save to Save45 with competitions: [] and romance: null on every edge; makeSave stamps 45 and validateSave dispatches it
- OLD: tests/p14b5-save-v31.test.ts > P14B.5 frozen side [em dash] the OUTGOING identities and the T0 corpus (GREEN today; moves only at the T2 values-only sweep) > LIVE_SAVE_VERSION is the literal 44 the live writer stamps (stale title corrected post-C.2b and again for Save43; body always asserted the live constant); 30 is the OUTGOING identity (R-VERSION class, re-expressed by 735-T after P14B.7 landed V32)
  NEW: tests/p14b5-save-v31.test.ts > P14B.5 frozen side [em dash] the OUTGOING identities and the T0 corpus (GREEN today; moves only at the T2 values-only sweep) > LIVE_SAVE_VERSION is the literal 45 the live writer stamps (stale title corrected post-C.2b and again for Save43; body always asserted the live constant); 30 is the OUTGOING identity (R-VERSION class, re-expressed by 735-T after P14B.7 landed V32)
- OLD: tests/p14d1-rival-shelving-save-v43.test.ts > API decisions this file exercises (existence asserted first) > validateSaveV43 / convertV42ToV43 / convertV43ToV42 exist as functions; LIVE_SAVE_VERSION is 44
  NEW: tests/p14d1-rival-shelving-save-v43.test.ts > API decisions this file exercises (existence asserted first) > validateSaveV43 / convertV42ToV43 / convertV43ToV42 exist as functions; LIVE_SAVE_VERSION is 45
- OLD: tests/p14d1-rival-shelving-save-v43.test.ts > save-v43-shelving (1344-A §4, §6.9): V42 -> V43 migration > migrateToLive carries a genuine V42 save to V44 (LIVE_SAVE_VERSION)
  NEW: tests/p14d1-rival-shelving-save-v43.test.ts > save-v43-shelving (1344-A §4, §6.9): V42 -> V43 migration > migrateToLive carries a genuine V42 save to V45 (LIVE_SAVE_VERSION)

## Where the plan is off

Nothing in G3. The 108 lines, the class counts (S1 22, S2 33, S3 21, S8 12, T 12, UI 8), the 12 titles and the 2 type sites match the source line for line. All 21 S3 lines pin a pattern, so the bare `.toThrow()` rule never applies in G3.

## What I am unsure of

- **S8.** I renamed all 12 and kept every pattern. M2 reached 4 of them (`construction-save-v11:514`, `property-state-v13` :799 :868 :880) and each stopped at "validateSaveV44: expected version 44". The other 8 sit behind an earlier failure in their tests. P5 must show each pinned guard after the rename; a different guard first is a masking record.
- **Archive on ticked saves.** `p13a-causal-core` :49 and :91 (weeks 315 and 428) and `v14-byte-parity:206` give `validateSaveV45` a save with recorded Power Ranking quarters. A refusal there points at production.
- **Identities.** The 12 renamed titles change 12 success-line identities. Map them through `rows.json` (`titleRenames`).

## Disclosures

- I read the M2 logs with `/usr/bin/grep -n -F` and `/usr/bin/sed -n` only. The rows script calls them to find frame line numbers. python3 read the classification JSON and wrote `rows.json`; `g3_rows.py` sits in the session scratchpad, not in the tree.
- Git in the tree: `diff`, `status` and `show HEAD:<path>`. Git in the repository: the temporary-index check only. I opened no fixture file and no Owner save, and I scanned no docs/ tree. I ran `ps` once to watch my own script.
