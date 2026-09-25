# 801 — P14C.4 T1: post-implementation coverage additions (test-author)

Task: close the coverage gaps source review 798 found in this suite (KEEP verdict, no undisclosed
defect), the same way 784 did for C.2a. Role: test-author, running as a general-purpose agent
carrying that contract (`.claude/agents/test-author.md`) — the project's roles are not registered
in this session.

WHERE: main worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `7ac410c8` at
start, `9fa5297a` at close (a concurrent commit landed mid-task; `git diff --stat HEAD` confirms
only this task's own two files differ from it — see §5). Touched ONLY `tests/p14c4-cohorts.test.ts`,
`tests/p14c4-save-v35.test.ts`, and this record (`tests/helpers/p14c4-fixtures.ts` needed no
change). Never read `src/` diffs or record 796; read `798-c4-source-review.md` itself (not a diff)
and read current, non-diff `src/core/save.ts` text directly to align each new/tightened regex with
the ACTUAL thrown wording — never to retune an expected VALUE. Git: read-only (`status`, `log`,
`diff --stat`, `worktree add/remove`) throughout. Times below are from `date` (host clock, CEST),
2026-09-26 00:15–00:31.

**Status: DONE.** G1, G3, G4, G5 closed with new or tightened cases, each shown to discriminate
(passes against the implementation, fails on the scaffold for missing behaviour). G2 could not be
built through the natural route without forcing an unlawful state; left as `it.todo` with the
measured reason (§2).

## 1. Changes, one per gap

**G1 — the original B6 ("an empty request still appends a receipt") had no case.** The repair
(795 §8) turned B6 into the §9 discriminator; that case is renamed (`§9 discriminator (formerly
labeled B6...)`, now updated to say §9 landed at `ccb8ab17` rather than "expected to fail" — it now
legitimately passes). A NEW case takes the `B6:` title back: a fresh genesis seed (`p14c4-g1-a`),
proven — from the state at week 51, strictly BEFORE the cohort week — to have every profession's
active population at or above its accepted size AND a look-ahead-young person (`ageAt(row, 104) <
30`) in each, using `expectedActiveAndYoung` for the population proof and a direct provenance scan
for the look-ahead proof (both independent of whatever the real engine computes at week 52 itself).
Then the real `tick()` to week 52 is asserted to append exactly one receipt: all-zero `requested`,
`clipped: 0`, empty `personIds`. Found by direct measurement (a throwaway diagnostic, run and
deleted, never committed): genesis composition equals the accepted sizes exactly (782 §8 item 4),
so nearly any fresh seed at week 52 qualifies — `p14c4-g1-a` was the first checked and confirmed.

**G2 — 782 §8.5 (a solvent rival may hire a cohort entrant on a later tick) had no case.** Attempted
via the natural route first: a throwaway diagnostic ticked two independent fresh seeds (each with a
real week-52 entrant, a director and a writer) forward to week 260 (the world's own solvent window,
confirmed directly — rival cash stayed positive and rising throughout, never approaching the ~week
260 insolvency record 792 describes). Zero rival hires of either entrant were observed at any of
four checkpoints. Read directly from source (not a diff): `staff()` fills a vacancy by scanning ALL
of `state.talent` in array order via `find()`, and a cohort entrant is always appended LAST — every
earlier same-role person (dozens, at genesis scale) would need to be simultaneously
unavailable/capped for `find()` to ever reach the entrant, a state only reachable by removing or
entangling most of a role's genesis population. 778's own precedent for an analogous "reach the
fallback candidate" case (B4b) needed to remove exactly ONE specific person; this would need an
entire role's population — a materially larger, forcing construction the task's own brief warned
against. Left as `it.todo` in the C-series, with this reasoning recorded in-line and the measured
diagnostic result cited; the entrant's own hireability (freeAgents/hiringMarketIds membership) is
already pinned by the existing C4 case, which is as far as the natural route reaches.

**G3 — D4 missing four tamperings.** Added, each on the RAW JSON shape of a genuine, real
`liveEnvelope` (since an extra/missing key cannot be expressed on the strictly-typed
`CohortReceipt`/`CareerLifecycleRootV35` types themselves — `validateSaveV35` itself takes
`unknown`, exactly for this): an extra key on `careerLifecycle` (`bogusExtraKey`), a deleted
`cohorts` key, an extra key on one receipt (`bogusExtra`), and a receipt whose `week` is
`receipt.week + 52` (still a valid cohort week, but after `market.tick`). Regexes read from the
ACTUAL current source text (`save.ts`, read directly, not a diff): `/must carry exactly
boundaryWeek, cohorts and records/i` (shared by the first two — both trip the SAME exact-keys
check, confirmed by reading it; the gap did not ask these two to discriminate from each other, only
G4's pair), `/must carry exactly clipped,personIds,requested,talentCountBefore,week/i`, and
`/after the campaign week/i`.

**G4 — the two provenance tamperings both matched only `/provenance/i`.** Read directly: the SUT's
own check (`row?.kind !== 'authored_exact_week' || row.entryWeek !== receipt.week`) throws a SINGLE,
BYTE-IDENTICAL message for "no row at all" and "row present but wrong week" — confirmed by reading
the check, not assumed. Since the SUT's prose does not itself distinguish the two causes, the two
cases now tamper TWO DIFFERENT entrants (`personIds[0]` for missing, `personIds[1]` for wrong-week)
and each regex anchors on its OWN entrant's id (`new RegExp(`${id} has no authored_exact_week`)`) —
each assertion is satisfied only by its own construction's actual thrown text, not the other's
(disclosed in-code, not papered over as a semantic distinction the source doesn't make).

**G5 — D3's refusal only matched `/downgrade/i`, never the named week.** The existing case now
anchors on the receipt's own real week (`new RegExp('downgrade.*week ' + firstWeek, 'is')`, checked
against the actual thrown text: `... it holds N cohort receipt(s) (first: week W) ...`). A SECOND,
new case ticks the SAME world one cohort week further (two real receipts, weeks 156 and 208) and
asserts the message names 156 (the FIRST), never 208 (the second) — proving "first" is a real claim,
not vacuously true with only one receipt ever tried.

## 2. Proof each addition discriminates

**Against the implementation** (`9fa5297a` at write time; §9 landed at `ccb8ab17`, an ancestor):

| file | result |
| --- | --- |
| `tests/p14c4-cohorts.test.ts` | **28 passed, 1 todo (29)** — the G2 `it.todo`; everything else, including all G1 assertions, passes |
| `tests/p14c4-save-v35.test.ts` | **28 passed (28)** — every G3/G4/G5 case passes |

**Against the scaffold** (disposable detached worktree `/Users/zacheryspector/The-Movies-c4-red-recheck-801`,
created via `git worktree add --detach ... bd27de93`, `node_modules` symlinked, files copied in,
removed with `git worktree remove --force` immediately after):

| file | result |
| --- | --- |
| `tests/p14c4-cohorts.test.ts` | **27 failed, 1 passed (C5, the same justified byte-identity pin), 1 todo (29)** |
| `tests/p14c4-save-v35.test.ts` | **28 failed (28)** |

Every new/tightened case (G1's `B6:`, G3's four tamperings, G4's two provenance cases, G5's two D3
cases) appears in BOTH scaffold failure lists, each for a clean cause: either `not implemented
(P14C.4)` from `convertV34ToV35`/`validateSaveV35` (G3, G4, G5 — every path there needs a migrated
V35 state or the validator itself), or a clean assertion mismatch (`state.careerLifecycle.cohorts`
absent — G1's `B6:`, since the scaffold's `GameState` is still V34 and the cohort step is unwired).
None crashed for an unrelated reason; each was individually greped and inspected (not merely counted).

**"Fails if the tampered field is left unchanged" (G3-G5):** every D4 case (old and new) shares the
SAME lawful, untampered baseline, and `'the unmutated baseline must validate'` (line ~121) already
asserts that baseline throws NOTHING — so no D4 regex, G3's four included, could ever match against
an untampered state; there is nothing to match. Symmetrically for G5, D3's OWN first case (`'lossless
iff cohorts is empty'`) asserts that a state with no receipt at all does not throw — so the
week-naming regexes have nothing to spuriously match there either. Both are pre-existing, passing
checks (part of the 28/28 and 28/29 totals above), cited here rather than duplicated.

## 3. Gap not closed

G2 (782 §8.5, a rival hiring a cohort entrant) is `it.todo`, not a passing case — see §1 for the
measured reason (natural construction would require displacing an entire role's genesis population
from `state.talent`, which the task's own brief warned against forcing). This is a disclosed,
bounded limitation, not an oversight.

## 4. Files, sha256, line counts

| file | sha256 | lines |
| --- | --- | --- |
| `tests/p14c4-cohorts.test.ts` | `5587f0e43eb3a99f42c20652b8f6fa4cdc18791885e7976334ac25e8cc39f68b` | 370 |
| `tests/p14c4-save-v35.test.ts` | `43d1268455f046f29338f0d39663c6e2c6500ff86bb056b233c8748360c6b8b1` | 273 |
| `tests/helpers/p14c4-fixtures.ts` | `34f89d125e95be4e4840e293d1aa0f93cc283326f61918c0a6618045fcf0d48b` | 226 (unchanged this task) |

## 5. Verification that no other file was touched

`git diff --stat HEAD -- tests/p14c4-cohorts.test.ts tests/p14c4-save-v35.test.ts
tests/helpers/p14c4-fixtures.ts` at close shows only the two test files changed (153 lines
inserted/changed across both, 0 elsewhere); `git status --short` at close lists dozens of `M` files
under `tests/` owned by the concurrent sweep author, none read beyond their filenames, none touched.
