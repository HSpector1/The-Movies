# P13A launch review index

**LAUNCH-REVIEW PACKAGE · DOCUMENTATION AND READ-ONLY RECONNAISSANCE ONLY · P13 IMPLEMENTATION NOT AUTHORIZED.** Prepared under Current Ops' existing P13 preparation authorization. Nothing in this package is an execution order, and no number in it is approved tuning; the scale recommended in companion §4.2 is *candidate tuning*, provisional and subject to implementation review and playtest. P13 coding requires a separate Current Ops execution order.

Prepared 2026-09-11. Branch `docs/p13-post-p12-launch-preparation-01`, planning parent [`e48541b`](https://github.com/HSpector1/The-Movies/tree/e48541b55d8c0825968c4f148996593bdd9f22b6). The planning parent is a documentation ancestor, not a runtime baseline. No prior P13 launch-preparation branch or index existed when this was cut.

**Revision 2, 2026-09-11.** Current Ops reviewed `d96a2de` and returned REVISE NARROWLY with four bounded corrections, all applied here and confined to these three files:

| | Correction | Where it landed |
|---|---|---|
| 1 | State how the rival lawfully obtains synchronized sound in P13A, and preserve symmetric rival research as Ready work | companion **§4.1**, with §2.3, §2.4, §3.1 and §5 (L2, L4) aligned |
| 2 | Return one actual candidate economic scale with its alternative, instead of a menu of rates | companion **§4.2** |
| 3 | Name the execution boundary as P13A Core, not the Ready tier, and preserve Ready by name, owner, acceptance condition and next bounded placement | companion **§2** intro and **§2.4**; the draft's review points |
| 4 | State the budget denominator and apply the gate split to the non-reserve hours | companion **§7** |

The accepted source refresh, the five closed verification items, the persistence starting point, the charge-onset finding, the migration proof plan, the native-entry resequencing, the OPEN-2 sequence and decisions D2, D4 and D5 are unchanged. No reconnaissance was rerun.

## 1. The package: three files, all on this branch

| File | What it is | Retrieval |
|---|---|---|
| **This index** | every required file and where to get it | `docs/engineering/P13A-LAUNCH-REVIEW-INDEX.md` |
| [**Launch draft**](./DRAFT-P13A-LAUNCH-PROMPT.md) | the 600–900-word draft Current Ops would issue | `docs/engineering/DRAFT-P13A-LAUNCH-PROMPT.md` |
| [**Decisions and acceptance companion**](./P13A-DECISIONS-AND-ACCEPTANCE-COMPANION.md) | §1 source-refresh matrix, §2 selected scope and the P13A Core execution boundary, §3 preserved requirements, §4 genuine decisions with the rival's route at §4.1 and the candidate economic scale at §4.2, §5 ownership and acceptance tasks, §6 migration and persistence proof plan, §7 budget arithmetic and reserve, §8 performance limits, §9 status | `docs/engineering/P13A-DECISIONS-AND-ACCEPTANCE-COMPANION.md` |

Nothing in this package requires a scratchpad file, a local-only path, an unpublished artifact or a private profile. Every reference below resolves from published history.

## 2. Controlling upstream inputs, commit-pinned

### 2.1 Accepted P12 closeout — `13370d4`

| Document | Location |
|---|---|
| P12 → P13 producer handoff | [`13370d4`:docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md](https://github.com/HSpector1/The-Movies/blob/13370d428f0693f3279732f6f4cc360a7fcaa4df/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md) |
| P12 R05 Owner acceptance receipt | [`13370d4`:docs/campaigns/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md](https://github.com/HSpector1/The-Movies/blob/13370d428f0693f3279732f6f4cc360a7fcaa4df/docs/campaigns/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md) |
| P12A decision and requirement register | [`13370d4`:docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md](https://github.com/HSpector1/The-Movies/blob/13370d428f0693f3279732f6f4cc360a7fcaa4df/docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md) |
| P12A execution log | [`13370d4`:docs/campaigns/P12A-EXECUTION-LOG.md](https://github.com/HSpector1/The-Movies/blob/13370d428f0693f3279732f6f4cc360a7fcaa4df/docs/campaigns/P12A-EXECUTION-LOG.md) |

### 2.2 Accepted identities — keep these distinct

| Identity | Value | Repository |
|---|---|---|
| TypeScript runtime | `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` | HSpector1/The-Movies |
| Unity observed / source-manifest HEAD, including later Tools changes | `2bc8d304b79a72bf20fda1d462ec3d96df253992` | HSpector1/project-studio-unity-visual-spike (private) |
| Actual Unity player-build source | `deca39521da1baeca61898d156a43f4ae6a7e035` | HSpector1/project-studio-unity-visual-spike (private) |
| Published technical evidence | `d4e1915ba075b4e4c1c9a6c880c8b0d4257659c0` | HSpector1/The-Movies |
| P12 documentation closeout | `13370d428f0693f3279732f6f4cc360a7fcaa4df` | HSpector1/The-Movies |

A documentation or tools identity is never a runtime or player build. The companion cites the runtime sha for every TypeScript fact and the player-build sha for every native fact.

Delivered persistence contract carried forward: **protocol 4 / projection 29 / inner Save V19 / outer checkpoint 1**, with a separate lossless campaign-library **storage format 2**. Verification against the actual constants is in companion §1.10.

### 2.3 Planning inputs

| Input | Commit | Location |
|---|---|---|
| Retained catalogue and amendments | `e48541b` | [docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md) |
| P13 design package | `e48541b` | [docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md) |
| Builder Annex | `e48541b` | [docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md) |
| Owner rulings §§2.1, 2.4, 2.5, 2.6 | `e48541b` | [docs/design/CODEX-P13-P15-OWNER-RULINGS.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/CODEX-P13-P15-OWNER-RULINGS.md) |
| Facility addendum, FUP-001–023 | `e48541b` | [docs/design/FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md) |
| Current Ops review hub | `e48541b` | [docs/design/FACILITY-MODERNIZATION-CURRENT-OPS-REVIEW.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/FACILITY-MODERNIZATION-CURRENT-OPS-REVIEW.md) |
| Long-range roadmap, P13 boundary §6.1 | `e48541b` | [docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md) |
| Roadmap definition (approved research) | `2a7ff0d` | [`2a7ff0d`:docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md](https://github.com/HSpector1/The-Movies/blob/2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md) |
| Roadmap boundary approval (original rulings) | `137ab60` | [`137ab60`:docs/design/CODEX-P13-P15-OWNER-RULINGS.md](https://github.com/HSpector1/The-Movies/blob/137ab603e37620ce647cd728b3a57154b8e3c3fb/docs/design/CODEX-P13-P15-OWNER-RULINGS.md) |

### 2.4 Requirement identifiers preserved by this package

| Set | Count | Where defined |
|---|---|---|
| `P13-OD-01` … `P13-OD-14` | 14 | design §11a obligation register, `e48541b` |
| `FUP-001` … `FUP-023` | 23 | facility addendum, `e48541b` |
| `CAT-001` … `CAT-058` | 58 source IDs / 59 entries | catalogue §6, `e48541b` |
| `R01` … `R16` briefs (15 after R08 folds into R02) | 15 | catalogue §7, `e48541b` |
| `OWN-1..9` · `ENG-1..9` · `PREQ-1..10` · `OPEN-2/4/5` · `LATER-1..5` | register | catalogue §11, `e48541b` |

Companion §3 maps each into core, ready, or named follow-on scope. None is dropped.

## 3. How to review this package

1. Read the **launch draft**. It is what Current Ops would issue, and it is the only file that reads as an instruction.
2. Read companion **§1**, the source-refresh matrix, to see what P13 reuses versus builds. Every REUSED row carries a path, symbol, line range and commit you can open, and **§1.10** records what the refresh settled, the five closed verification items and the seven supporting-detail defects an adversarial pass corrected.
3. Read companion **§4**, the genuine decisions. That list is deliberately short. **§4.1** states how a rival lawfully reaches synchronized sound in P13A, and what the slice may not claim from it. **§4.2** gives the recommended candidate economic scale with every value P13A needs, one meaningful alternative, and the consequential difference between them. Everything settled sits in §2 and §3 instead, and is not re-asked.
4. Read companion **§2**'s intro and **§2.4** for the execution boundary: this is P13A Core, and Ready is preserved by name, owner, acceptance condition and next bounded placement.
5. Read companion **§7**, the budget arithmetic, the protected verification reserve and its escalation criteria.

## 4. What this package does not contain

No implementation, build, test run, runtime launch, native input, profile access, P12 reopening, hook work, merge, PR or protected-ref promotion occurred in producing it. No game was launched. The Unity spike repository was read through the API at its pinned shas only. Howard's campaigns and named copies were not opened, hashed, replaced or inspected.

Prices, the five-times money scale, illustrative office durations and recommendations ENG-2 and ENG-3 remain provisional and unapproved, exactly as `e48541b` left them. The scale recommended in companion §4.2 is candidate tuning: it reaches playable cash, duration and decisions, and it is provisional and subject to implementation review and playtest. It is not approved tuning, it approves no scale, and this package reopens none of the closed catalogue correction.
