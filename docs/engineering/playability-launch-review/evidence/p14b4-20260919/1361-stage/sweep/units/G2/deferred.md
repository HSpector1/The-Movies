# Unit G2 deferred lines (1361-N)

Line numbers are HEAD's. `rows.json` gives each edited line's new number. P4 and P6 are probes from the plan's S10 section. x1 is H's acceptance run, so G2's lines first meet a run in x2.

## A. Plan lines I did not edit (0)

None. All 92 planned lines are edited. The 9 lines the plan flags "measure" are the S5 compares, and section B lists them. M2 measured one of them. The other 8 have a form fixed by ruling 3 and a value fixed by `convertV44ToV45`, so I edited them as H edited `p14c3-save-v38:92`.

## B. Lines I edited whose outcome only a run settles

Each edit wraps the expected side as `withEmptyP15Roots(<existing chain>, <week>)`. Each compared state is migrated and never ticked, so the four roots must sit at `recordedFromWeek` equal to the input week, `p15Sequence.next` must read 1, and no other key may differ. Probe P6 prints any remaining difference.

| Line | Week argument | Slots the run covers | M2 evidence |
|---|---|---|---|
| `bridge-p14b2-checkpoint:93` (stamp 45 on the same line) | `source.state.market.tick as number`, applied to the input spread | current 12, saved 11 | none: the test stops first at :61 |
| `bridge-p14c2rm-runtime:61` | `week` | 670 and 669 | none: `currentSlot` stops first at :58 |
| `bridge-p14c2s-scientist-runtime:141` | `week` | 521 and 520 (842 Scientist), 53 and 52 (824 retained retirement) | none: the loop stops first at :129 |
| `bridge-p14c3-promise-digest-continuity:164` | `week` | 208 and 207 | `m2-core.txt:6581`: the first differing key is `campaignLegacy` |
| `bridge-p14p3-directing-promises:140` | `save.state.market.tick` | 45 (D15 and D16 through `current45()`) | none: stops first at :138 |
| `bridge-p14p3-directing-promises:376` | `previous.state.market.tick` | 208 and 207 (natural), 104 and 104 (waiver) | none: stops first at :374 |
| `bridge-p14p4p5-opportunities:99` | `old.state.market.tick` | 45 (`input45()`) | none: stops first at :98 |
| `bridge-p14p4p5-opportunities:519` | `previous.state.market.tick` | both slots of the prior54 checkpoint | none: stops first at :518 |
| `bridge-p14r2r3-prior55:201` | `previous.state.market.tick` | 111 and 110 | none: stops first at :196 |

Other edits that depend on production behavior, with the check each needs:

| Line | Edit made | What the run must show | Probe |
|---|---|---|---|
| `bridge-p14c3-runtime:168` and its use at :178 | `validateSaveV45` | `migrateToV38(saved)` hands the V45 `saved` to `convertV45ToV44` (`save.ts:10588`). Both slots come from a checkpoint load at weeks 208 and 207 with no tick, so every P15 root is empty and the chain succeeds. A recorded quarter would refuse with the P15 reason. | P4 |
| `bridge-p14b4-cast-class:127` and :456 | `validateSaveV45({ ...live, state, ... })` | The clone of `live.state` keeps the four roots that `migrateToLive` wrote, so the live validator admits it. | x2 |
| `bridge-p14b6-d2:86`, `bridge-p14b6-e714:95` and `bridge-p14b6-relationship-read-models:232` | `validateSaveV45` in `admitted()` | The staged relationships root round-trips through `makeSave`, so the live validator admits it. | x2 |

## C. Rows and lines with no edit, by ruling or by plan

- Retained identity `bridge-p14b2-trust` > "ignores real withdrawn unbound drafts near due and never interrupts for rival-issued promises" (H row 28, masked at `helpers/p14b2-fixtures.ts:122`): no edit (ruling 8). After H it must fail with its 1358-I primary, "P14B.2 fixture: no natural rival-only promise outcome by 240".
- R8, `bridge-p14c3-runtime` "R8 durable coordinator Save As branches208, saves B209, then clean-loads A207 ..." (H row 161, masked at `helpers/p14c3-genuine-evidence-fixtures.ts:17`): no edit (ruling 8). If it passes after H, it reads GONE with its cause recorded.
- `bridge-p14b2-trust:424`: the edit is in place, but its test calls `rivalFixture`, which fails with the same 1358-I primary at `helpers/p14b2-fixtures.ts:264` (`m2-core.txt:5118`). The line cannot run until that standing row passes.
- Kept by the plan: the `.hollywood`-only compares at `bridge-p14b4-runtime47-compatibility:258` and `bridge-p14b5-relationships:474`. `bridge-p14b4-cast-class:77` compares a V31 state from `migrateToV31`, which never carries the roots, so it needs nothing.
- Stale titles that earlier sweeps left alone stay (for example `bridge-p14a2-market:737`, "LIVE_SAVE_VERSION === 28"). The plan's T list holds no G2 file.
