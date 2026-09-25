# 775 — P14C.2-T0 corpus minted

Source `f2d862d7ea3755992284ab29a6f924f941ff3c85` (published; `src/` identical to `f3652852`, the
final V33 writer — before any C.2 source change). Minter archived at
`775-mint-v33-c2-corpus-minter.test.ts` and removed from `tests/` after use, so no suite collects
it. Built on the 761/C.1 minter pattern; six worlds, each built and PROVED by `expect()` before any
byte was written, round-tripped in memory, written with `wx`, then re-read from disk and
re-validated.

## Commands and outcomes

```
node_modules/.bin/vitest run tests/p14c2-mint-v33-corpus.test.ts --minWorkers=1 --maxWorkers=1
```
Run without `STUDIO_MINT_V33_C2_CORPUS_APPROVED` set: 1 test **skipped**, exit 0, 2.97s — confirms
the minter is inert by default.

```
STUDIO_MINT_V33_C2_CORPUS_APPROVED=$(git rev-parse HEAD) \
  node_modules/.bin/vitest run tests/p14c2-mint-v33-corpus.test.ts --minWorkers=1 --maxWorkers=1
```
Three attempts:
1. First attempt: FAILED — `hiringMarketIds is not a function` (imported from the wrong module;
   `tests/helpers/p14b2-fixtures.ts` uses it internally but does not re-export it). No bytes
   written (the failure was inside world 4's build, before the write phase). Exit 1, 22.7s.
2. Second attempt (import fixed): FAILED — `ENOENT` reading `774-c2-t0-measurement.md`, which had
   not been written yet at that point in the sequence. All six worlds built and every `expect()`
   proof passed; failure was in step 2's provenance-authority block, still before any fixture byte
   was written. Exit 1, 35.6s.
3. Third attempt (774 written): **PASSED**. Exit 0, 35.0s (real). `publishedRecoverySha` resolved
   to the same sha as `headSha` (`git ls-remote origin wip/headless-program-20260916-ts` returned
   the minting head), so `publicationState` reads `PUBLISHED`.

Gate checks (run immediately before each approved attempt): `git status --porcelain` over
`src/ bridge/ generated/ ui/ scripts/ tests/helpers/ tests/fixtures/ package.json package-lock.json`
was empty every time; `git rev-parse HEAD` stayed `f2d862d7ea3755992284ab29a6f924f941ff3c85`
throughout this record's whole session.

## Files written, with sha256 (verified by re-reading every file from disk after the mint and
comparing `shasum -a 256` against each fixture's own `compressedSha256`; all six matched)

| file | sha256 (compressed) | bytes |
| --- | --- | --- |
| `genuine-v33-c2-hard-boundary-and-idle-window.json.gz` | `b7c3c0a4d4f26ce6344de9cb681f3310df96338aee1f3dabec409b0e69b119ed` | 204395 |
| `genuine-v33-c2-rival-in-window.json.gz` | `5f6e1ab1602bbfba74da127dd0cf3b1df0e6df8eb1b7fe1a8c4eff3b2f27c718` | 178754 |
| `genuine-v33-c2-contract-and-case.json.gz` | `3bda857bd65b28badce1fee25192644ba5b3f16538ed1e9c9b96527fd023c97a` | 59566 |
| `genuine-v33-c2-seated.json.gz` | `493b7ecb434f4d965eddadf966c18beafe75561d81d968fd40b11ddc0d915d7e` | 51703 |
| `genuine-v33-c2-scientist.json.gz` | `81a1136a90abc6b0c8ae88684ac379e9f3a6faeafe68b12acd26f3e8b0154714` | 144930 |
| `genuine-v33-c2-migrated-legacy.json.gz` | `3b85c4b3e77d26728303b5a4ed9f15f75b22852c8a3842e036d0252387fd32d9` | 99859 |

Each has a sibling `.provenance.json` (headSha, publishedRecoverySha, saveVersion 33,
`PROMISE_RULES_VERSION` 4, `RELATIONSHIP_RULES_VERSION` 1, minter sha256, minter archived path,
node version, `startedAt`/`endedAt`, command, seed/recipe, the D1 windows, the axis facts, and the
paper predictions), plus one `MANIFEST.json` covering all six.

Minter bytes archived at `775-mint-v33-c2-corpus-minter.test.ts`; its own sha256 is recorded inside
every fixture's provenance file (`minterSha256`).

## Axes minted, by world

**1. `genuine-v33-c2-hard-boundary-and-idle-window`** (seed `p14c2-corpus-01-d1`, week 780)
- X1: four authored people (actor/director/writer/craft, each authored age 70 at week 0, the
  `[18,70]` clamp edge), aged to 85 by week 780 — all four `>=` their D1 hard boundary
  (70/75/75/72).
- X2: the same world's NATURAL genesis population, idle-in-window per profession: actor 6
  (ages 60,66,61,63,63,66), director 2 (66,65), writer 3 (66,67,72), craft 1 (63). A natural actor
  (`t-act-21`, age 70) is ALSO independently `atOrPastHard` — a second X1 witness with no authored
  person involved.

**2. `genuine-v33-c2-rival-in-window`** (seed `p14c2-corpus-01-d2`, week 1040)
- X3 (rival-employment half): THREE of four professions reached simultaneously — actor (`t-act-00`
  age 66, `t-act-02` age 61; contract end week 1196), director (`t-dir-00` age 73, end week 1196),
  writer (`t-wri-00` age 65, end week 1196). Craft did not land in-window in this specific
  snapshot (craft's own natural rival-in-window hit, measured in record 774, occurred at a
  different week for this seed and had already aged past its hard boundary by week 1040) — NOT
  REACHED for craft in this one combined world; separately confirmed reachable in record 774
  (seed `-d2` week 260, or seed `-d4`). No `enterRival` call was made anywhere in this file —
  every rival-employed row here is the engine's own `tick()`-driven restaffing over a long run.

**3. `genuine-v33-c2-contract-and-case`** (seed `p14c2-corpus-01-b`, week 48)
- X3 (player-contract half): an authored actor (age 65, `authored-0000`), 208-week player
  contract, end week 208 exceeds `nextBirthdayWeek(52) + 52 = 104` — D5's contract-end branch.
- X4: an authored director (age 65, `authored-0001`), original 52-week contract; at week 48
  (inside the renewal window) the case status is `proposals_open` (non-terminal).
- X6: an open (`outcome: null`) `APPEARANCE_COUNT` promise (`promise-0`) attached to that same
  director while the case is open.

**4. `genuine-v33-c2-seated`** (seed `p14c2-corpus-01-c`, week 0)
- X5: an authored director (age 68, window `[65,75)`), contracted then greenlit onto a real player
  production (one writer, three cast, one craft, all separately signed) — `busyTalentIds` true at
  the save week. No pre-built matching set was needed for `greenlight` to succeed.

**5. `genuine-v33-c2-scientist`** (`p13aResearchReady()`, week 520)
- X7: `createTalent` with `role: 'scientist'` refused (`"...role \"scientist\" is not a valid
  CreativeRole"`), confirmed structurally before this world was built. The recruited scientist
  (`t-sci-00`) reached age 61 (>= 60) via the accepted harness route plus further ticking —
  "a scientist aged 60+" fully reached, not merely the fallback "oldest reachable".

**6. `genuine-v33-c2-migrated-legacy`** (the held `genuine-v32-c1-corpus/genuine-v32-authored.json.gz`,
migrated + ticked 260 weeks past migration)
- X8: `talentProvenance.rows` are 100% `legacy_age_anchor` both immediately at migration and after
  260 further ticks — the shape distinct from every other world in this corpus (all fresh V33
  genesis rows are `authored_exact_week`). The "any authored_exact_week rows from rival supply"
  sub-detail is NOT REACHED: record 774 ticked this same fixture to 2200 weeks past migration with
  the row count and kind set unchanged at every checkpoint (50 through 2200). Traced cause:
  `hollywoodTick.ts`'s restaffing loop reuses an EXISTING free agent of the vacant role before
  minting a new one; this population's per-role free-agent pool did not exhaust in the tested
  range.

## Paper predictions committed (record 774's "prediction under 773 D3/D5/D13, not an
implementation output")

Every in-window or past-boundary subject minted above carries a `predictRetirement` chain in its
world's provenance: it walks `nextBirthdayWeek`/`ageAt` forward one birthday at a time, testing D3
at each birthday against ONLY the contracts/employment rows already fixed in that save (never a
simulated future), and reports the first predicted announcement (week, age, cause) and D5's
effective week — or, if none resolves within 40 birthdays, says so explicitly. Selected results:

| subject | world | predicted announce week | age | cause | predicted E |
| --- | --- | --- | --- | --- | --- |
| `authored-0000` (actor, hard-boundary world) | world 1 | 52 | 71 | `hardBoundary` | 104 |
| `authored-0001` (director, hard-boundary world) | world 1 | 104 | 72 | `idleInWindow` | 156 |
| `authored-0002` (writer, hard-boundary world) | world 1 | 104 | 72 | `idleInWindow` | 156 |
| `authored-0003` (craft, hard-boundary world) | world 1 | 104 | 72 | `hardBoundary` | 156 |
| `t-act-00` (rival actor) | world 2 | 1225 | 70 | `hardBoundary` | 1277 |
| `authored-0000` (actor, 208wk contract) | world 3 | 260 | 70 | `hardBoundary` | 312 |
| `authored-0001` (director, 52wk contract + open case/promise) | world 3 | 156 | 68 | `idleInWindow` | 208 |
| `authored-0000` (seated director) | world 4 | 312 | 74 | `idleInWindow` | 364 |

Every one of these predictions is EXPLICITLY conditional on no contract, promise or seat being
created after each world's save week (the provenance's `assumption` field on each prediction says
this in full) — a static save cannot know a future action. World 3's `personB` prediction (week
156, `idleInWindow`) is additionally conditional on the OPEN case at the save week resolving
WITHOUT a new contract for that person; if it instead settles with a renewal, the real outcome
will differ, and that is exactly the point of committing the prediction now.

## What was NOT reached, and why

- **X3-rival, all four professions in ONE world**: reached three of four in the minted world
  (actor, director, writer); craft confirmed reachable separately but not combined. Two genuinely
  different search axes were tried (five seeds; four checkpoint weeks each, out to 1040) without
  finding one combination with all four simultaneously — reported as a bounded-search limit, not
  impossibility.
- **X8, a MIXED `legacy_age_anchor` + `authored_exact_week` root**: not reached against the held
  C.1 fixture even at 2200 ticks past migration (record 774). The primary ask (a distinct,
  100%-`legacy_age_anchor` migrated shape) is fully satisfied; the mixed-root variant would need
  either many more ticks, a smaller starting population, or a more heavily player-active starting
  fixture — none tried further within this record's allowance.
- **X6 beyond the one director already covered**: only measured/minted on the one subject already
  needed for X4; not pursued as an independent axis beyond that, per the task's "report only; mint
  only if cheap and lawful" framing — it was cheap here, so it was minted, and no further search
  was made.

## Verification performed

`git status --porcelain` after this record's work shows only: the two intended new test files
(now both deleted after archiving), the new `tests/fixtures/p14/genuine-v33-c2-corpus/` directory,
and the four new evidence files this task was assigned to write
(`774-c2-t0-measurement.md`, `774-c2-t0-probe.test.ts.txt`, `775-c2-t0-corpus-minted.md`,
`775-mint-v33-c2-corpus-minter.test.ts`). No existing fixture, test, or `src/`/`bridge/`/`ui/`/
`scripts/`/`tests/helpers/` file was touched by this record. Every fixture's on-disk sha256 was
independently recomputed with `shasum -a 256` and compared against its provenance's
`compressedSha256`; all six matched (see table above).

## Next action for the parent

Commit the listed paths (this record's role is test-author/measurement only; it does not commit).
