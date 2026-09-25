# 789 — P14C.2a QUALIFIED CHECKPOINT: the retirement lifecycle core

Source `c34b6674` (implementation `ad154f5b`, RED `0ee95a08`, coverage `a820f885`, test sweep `5aff0e60`),
verified by run `787-c2a-full-core` on that exact sha: **`fixedSource: true`**, the tested diff is the
empty-tree hash at both ends, and no untracked source existed at either end. Attribution: record 788.

## 1. The player behaviour this slice completed

A professional now announces retirement at a birthday: at the profession's hard boundary, or inside the
window after 104 weeks with no work. The announcement carries at least 52 weeks of notice, and a contract in
force can push the effective week later. From announcement the person accepts no contract, case or seat that
would outlast the effective week. At that week they retire, or finish the commitments they already hold and
then retire. The player and the rivals run under one law: the same predicates gate the player's
sign/renew/greenlight, the market's eligibility and settlement, rival staffing, and rival seating. Retired
people stay in `state.talent` as alumni and leave every hiring listing.

## 2. Identities

| | before | after |
| --- | --- | --- |
| save version | 33 | **34** (one new root, `careerLifecycle {boundaryWeek, records}`) |
| projection | 50 | 50, **UNMOVED** |
| schema id, promise rules, protocol | unchanged | unchanged (`git diff f3652852 c34b6674` touches only `LIVE_SAVE_VERSION` among identity constants) |
| `generated/` | | **no diff** from the recovery pin: no C# regeneration |

Live routes now call `migrateToLive` and `bridge/runtime-checkpoint.ts` gates on `LIVE_SAVE_VERSION`, so the
next save bump moves one definition. V34 → V33 is lossless while no record exists and refused otherwise.

## 3. Verification against the falsifiers published before the run (record 786)

| | predicted | measured | verdict |
| --- | --- | --- | --- |
| test files | 361 | **361** (18 failed / 343 passed) | CLEAN |
| cases | 4179 ± 2 | **4179** (62 failed / 4109 passed / 8 todo) | CLEAN |
| `p14c2a-*` | 40/40 pass | **40/40** | CLEAN |
| run 772's 55 failures | retained, same identity | **55 RETAINED_SAME_CAUSE**, 0 vanished, 0 changed cause | CLEAN |
| new failures | at least the 7 swept | **exactly 7**, both traced (788) | CLEAN |
| any other new failure | only past week 104 or a hard boundary | none | CLEAN |

FU-2 (`bridge-runtime-checkpoint-prepared-reuse`, the prepared-reuse timeout) failed again. Tally across six
full runs: failed 739, passed 737, failed 755, passed 767, failed 772, failed 787, so **four of six**. Its
threshold stays unmoved and its disposition open.

Requirement coverage, measured by case: the independent RED (778) mapped 37 cases onto all 29 rows of 773 §6
and failed on the scaffold for missing behaviour. The source review (783) traced every D1–D16 row and every
777 §5 consumer MET and returned four coverage gaps; 784 closed all four (tick wiring, G4's four remaining
validator causes, A1's exact boundary, P1's rival-authored complement). The parent's mutation controls (785)
showed the tick-wiring case catches both a removed step and a step moved after the market.

## 4. The 7 new failures are coverage debt, not verified behaviour

`p14b5-relationships` family 6 (6 cases) lost its natural premise when four idle retirements redrew the
week-207 hiring rotation. The `bridge-p14b5-relationships` seed-b ledger lost one settled row when a rival actor
retired at a hard boundary before the case could open. Both follow from approved C.2a law (788). They stay
failing until a separate, labeled test-engineering task gives family 6 a lawful premise that keeps its D5
requirement and gives the ledger control an `approved_behavioral_change` entry that cites 788. No expectation
moved in this checkpoint.

## 5. What this checkpoint does NOT claim

- **UNITY NOT VERIFIED.** No native control was run. The projection did not move and `generated/` did not
  change, so this slice leaves no C# consumer work outstanding. The UI surfaces for retirement belong to C.2-RM
  and nobody has designed them.
- **The `ui` project was not run.** FU-1 remains unreturned.
- **The market drains.** A fresh world lost 63 of its 84 people to retirement by week 1600 (779) and nothing
  yet creates entrants for the player's market. C.4 (replenishment) is the next slice for that reason, and its
  acceptance criterion is a measured demonstration, not a test count.
- **The endurance obligation is still untouched.** No 6,240-week run and no runtime measurement exist.
  783 notes two costs that grow with history: `idle()` scans all employment history per in-window birthday, and
  settlement walks every record every week.
- **Open product choices.** Retirement against an open promise (VOIDED or WAIVED) waits on the Owner (773 §7);
  only C.2c depends on it. No Scientist window exists, by Owner instruction. The intent rule v1 and the windows
  are PROVISIONAL TUNING.
- **One sanctioned deviation.** `enterRival` implements 777's cap-based skip, not 773 B5's literal "skips
  announced people": an announced free agent whose effective week lies at least 208 weeks out stays pickable.

## 6. Process errors in this slice, most of them mine

- **777 §4 overclaimed** that the idle rule matched the T0 predictions exactly, without reading the minter.
  Amendment A2 restored 773 D3 as governing and recorded the differing predictions as prediction errors.
- **I wrote guessed clock times** into five records and the resume notes. Commit `d441a18f` replaced them with
  commit-bounded times. One survived: 786 says its static gates ran "≈20:55–21:00". They finished before
  20:55:32 CEST, when commit `c34b6674` recorded them. 786 stays as published, and this line corrects it.
- **The RED author ran its suite against the writer's live changes** in the shared tree before the scaffold
  worktree existed. 778 §0 discloses it; the authoritative RED runs came from the detached scaffold worktree.
- **The test-sweep agent inherited the wrong working directory** from my shell. I directed it to the main tree
  and have kept my shell at the repository root since.
- **The first tick-wiring case injected an unlawful market case**, so mutation M2 crashed instead of failing
  the assertion. The case was rebuilt from real actions, and M2 now fails on the ordering assertion.
- **Two reviewer defects.** 773-A claimed no rival-promise path exists (`authorRivalPromise` does). The 783
  reviewer used read-only Bash outside its Read/Glob/Grep allowlist; both are recorded.
- **An unused import broke `tsc`** after the sweep. I removed it in `5aff0e60` and said so in the message.
- **Roles.** The project's sim-core, test-author and contract-auditor roles are not registered in this session.
  Each ran as a general-purpose agent carrying its role contract.

LOGIC VERIFIED · UNITY NOT VERIFIED.
