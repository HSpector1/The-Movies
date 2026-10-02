# 1358-N F2 handback: S9, S8 and S5 follow-up on sweep r1, with 1358-F11

- **Base:** `sweep-x6` 8144c0c.
- **Branch:** `sweep-f2` in `/Users/zacheryspector/studio-scratch/1358-sweep/f2`, two commits:
  - 37a1108, the F2 edits;
  - 9f30f47, the 1358-F11 receipt fix.
- **patch.diff:** `git diff sweep-x6 sweep-f2 -- tests`, 8 files, +130/-55, sha256 `79be0202ac34499be3586ea932c78d2ba583075b44020d4054d5c0e01bbcab29`. A temporary index at `sweep-x6` takes it with `git apply --check --cached`.
- **classification.json:** 47 rows, 39 measured and 8 read. 43 rows edit a line; 4 record a no-edit (N-0474, G5-new-7, H-new-1, C20 N-0042).
- **probe.patch:** 6 logging lines in 5 files, relative to 37a1108. 1358-X7t ran it and answered every question it asked, so no probe question is open.
- I ran no node, vitest, tsc, tsx, vite-node or npm. I used Python only to check each new regex against the measured messages and to read one fixture (below).
- **Fixture read (rule 6):** `tests/fixtures/p14/genuine-pre38-validation-controls/reproduced-v37-writer-commissioned311-finishing312.json.gz`, read by its exact repo path. Its compressed sha256 `db162c4a…` equals the pin in `tests/helpers/p14c2rm-fixtures.ts`. The commissioned311 save holds 26 market cases, exactly one `retirementExtension` case (index 25, authored-0000, opened at week 300, still open) and no record with `extensionUsed: true`.

## The guard lines cited

| Guard | Source | Message |
|---|---|---|
| Save44 romance refusal | `src/core/save.ts:10790` | `migrateToV43: cannot downgrade or discard the romance of <edgeId>` |
| Save43 receipt guard | `save.ts:10739-10740` | `migrateToV42: cannot downgrade or discard a screenplayShelved receipt` |
| V39 subject guard | `save.ts:10600-10602` | `migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take subject` |
| Scientist guard | `save.ts:10449-10454` | `migrateToV36: cannot downgrade SaveFileV37 or discard Scientist retirement … ` |
| V36 extension guard | `save.ts:10382-10388` | `migrateToV35: cannot downgrade SaveFileV36 or discard the retirement extension … ` |

## S9 sites (1358-F10 rulings 3 and 4)

Each site now pins the probe's exact message, and its comment records what the romance refusal masks and which test still covers each masked guard. Line numbers are sweep-f2 post-image lines; r1 lines are in parentheses.

| Site | Pin (first guard measured) | Masked guards | Covering test named |
|---|---|---|---|
| J7, `p14c3-cohort-transition:288` (r1 :287), N-0490 | romance of relationship-edge-48 | receipt guard (r1's pin); V39 subject guard (the line's original target) | Receipt guard: `p14d1-rival-shelving-save-v43:256` (F11). V39: `p14p4p5-opportunities` Q03 :331 and `p13b-s3-save-v23:115-117` |
| X5, `p14c3-dual-extensions:180` (r1 :178), N-0493, both targets | romance of relationship-edge-0 | the same two | the same |
| O3, `p14c3-offmenu-extensions:237` (r1 :235), N-0496, both targets | romance of relationship-edge-0 | the same two | the same |
| `p14c2b-save-v36:83` (r1 :74), G4-new-3 | romance of relationship-edge-0 | V39 guard (first under Save43, 1344-X12 §2); V36 extension guard (title) | V36: `p14c2rm-writer-continuation:278` (new, case branch). V39: Q03 :331 and `p13b-s3-save-v23:115-117` |
| `p14c2b-save-v36:98` (r1 :82), G4-new-4 | romance of relationship-edge-0 | the same two | the same; :278 is exactly this title's case branch |
| `p14c2s-scientist-retirement:287-288` (r1 :279-280), G1-new-1 | romance of relationship-edge-27 (both lines) | V39 guard (first under Save43, 1344-X12 §4); Scientist guard (title) | Scientist: `p14c2s-scientist-retirement:291` (new). V39: as above |
| `p14c2rm-writer-continuation:287` (r1 :254), N-0476 | romance of relationship-edge-0 | V39 guard (first under Save43, 1344-X12 §4); the frozen V36 refusal (title) | V36 refusal: :279 in the same leaf, `convertV37ToV36(old.finishing)` on the genuine V37 pair. V39: as above |

How I checked each covering test:

- **`p14p4p5-screenplay-status:324`**, the V39 cover the 1344 comments named, is masked now. Probe N-0560 logged the romance of relationship-edge-18, and probe-failures.json lists Q11 at :401. The comments drop it.
- **`p14p4p5-opportunities` Q03 :331** calls `convertV40ToV39` directly on a V40 envelope. That envelope comes from the genuine V39 week-45 capture with a real attached genre opportunity. Q03 passes in X6, and probe F2-Q03 in X7t logged the V39 message.
- **`p13b-s3-save-v23:115-117`** carries the exact V39 pin. Probes N-0367 to N-0369 logged the V39 message. It reaches the guard through a live chain.
- **`p14d1-rival-shelving-save-v43:256`** is the receipt guard's cover after F11 (below). Probe F2-RECEIPT43[real-concept] logged the pinned message on its input.
- **`p14c3-transitions:207`**, the V37 cover F10 ruling 4 names, still reaches the V37 guard (probe N-0524). No site of mine needs it.

**New own-era assertions (rule 1, "add one assertion"):** X7t confirmed both.

- `p14c2s-scientist-retirement:291` runs `convertV37ToV36` on the genuine V37 week-670 capture, read through `scientistRaw()` from `tests/helpers/p14c3-fixtures.ts`. Probe F2-SCI37 logged exactly the pinned message.
- `p14c2rm-writer-continuation:278` runs `convertV36ToV35` on the real `convertV37ToV36` of the genuine pair's commissioned311 save. The pin's counts come from the fixture read, and probe F2-EXT36 logged exactly the pinned message.

## 1358-F11: the receipt guard's own-era cover

`tests/p14d1-rival-shelving-save-v43.test.ts`, the leaf "refuses a real shelved entry (with its receipt) by name". The file belongs to group G1; I edited it with the parent's leave.

- **:249:** the hand-built `screenplayShelved` receipt names `b.projects[6]!.conceptId`, the business's own costed concept, in place of `'x'`.
  - Probe F2-RECEIPT43[as-written] showed the old receipt refused inside the validateSaveV37 chain with "Hollywood save: screenplayShelved receipt names no costed screenplay of its rival" (`hollywoodValidation.ts:539`).
  - `/shelv/i` accepted that refusal.
- **:241:** the local cast type gains `projects: { conceptId: string }[]`.
- **:256:** the assertion pins `/^migrateToV42: cannot downgrade or discard a screenplayShelved receipt$/` (`save.ts:10739-10740`). This is the message F2-RECEIPT43[real-concept] logged.
- **:251-255:** a comment records why and names J7, X5 and O3.
- **J7, X5 and O3:** the last two lines of each S9 comment now name `p14d1-rival-shelving-save-v43:256` as the receipt guard's cover. They replace the rejection-count note and the sentence "no other test pins its receipt guard", which F11 made false. Rows F11-4 to F11-6.

## S8 sites (1358-F10 ruling 2)

- **N-0468** (`p14c2rm-writer-continuation`, it.each at :234, assertion :236, r1 :218): the cases gain an expected-message column `refusal`. Each of the 18 regexes anchors with `$` on the innermost guard text the probe logged, and a trailing comment gives the source line:
  - `save.ts:10295` (V36 case join): cases 1 and 3;
  - `professionHistory.ts:270` (V38 finality): case 2;
  - `scriptDevelopment.ts:1118`: cases 4 to 7 and 12;
  - `scriptDevelopment.ts` :996, :1020 (two cases), :1113, :919, :932, :984 and :980;
  - `save.ts` :3532 and :3526.
- **N-0470** (:252, r1 :232): `scriptDevelopment.ts:1118`, writer not contracted.
- **N-0472** (:263, r1 :241): `save.ts:3371`, unknown project field `retirementBypass`.
- **N-0474** (:264, r1 :242): G5's read pin stands, so I made no edit.

## Measured, no pin (rule 3)

- **H-new-1** (`p14c3-save-v38:121`, r1 :116): the probe logged 102 cases across the 11 `rejectMutations` tests. Each case refuses at a `validateSaveV38` guard that names the mutated field, and none is a version check.
- **G5-new-7** (`p14c2rm-writer-continuation:378`, r1 :345): the probe logged 32 cases, 4 callers times 8 rows. Each case reaches the tampered record's own V34, V36 or V38 guard.

## S5 (1358-F10 ruling 1) and C20

- **N-0041** (`p14c3-save-v38:92`, r1 :87): the expected side now passes through `withEmptyCompetitionsAndRomance`, defined at :49-54. The helper maps the old state's own edges and strips nothing.
  - **Probe F2-N-0041 in X7t:** `normalizedEqual=true` and `asWrittenEqual=true` in all four cases. created-week0 has 0 edges; the three other files have 30 edges each. No file has a log row or a romance track.
  - **Result:** the S5 stop rule does not fire, and the edit stands.
- **N-0042, C20** (`p14c3-save-v38:105`): no edit (1358-F9 ruling 7).

## Open questions for the parent

1. **V39 cover.**
   - **What I named:** Q03 :331 (a direct call on V40 input, loose regex, first refusal measured by F2-Q03) and `p13b-s3-save-v23:115-117` (exact, live chain).
   - **What may change:** F1 owns `p14p4p5-screenplay-status` and Q03. If F1 adds direct V39 cover under F10 ruling 4, or tightens Q03 to the exact message, the comments may name that test instead. F1's edits may also move :331, and stale citations stay as written (F10 ruling 7).
2. **The extensionUsed branch.** No V36-era input holds a used extension, so the extensionUsed branch in `p14c2b-save-v36:83`'s title has no own-era cover; :278 covers the case branch only. This branch is the remainder of the 1344-K open item.
3. **N-0468 observations.** Cases 1 to 3 and 18 refuse at a record-level or project-level guard before the rule their names describe (writing authority, writer or slot borrowing). I pinned what the probe measured, as rule 2 directs. The parent may want separate cover for the rules those names describe.
