# 790 — P14C.4-T0 corpus reachability, measured

Source `ff7b9ac1d334709f1c907e6f7e6d918b935ee9a5` (published; `src/` is the FINAL V34 writer — the
live C.2a retirement engine, 773/777 — before any C.4 source change). Probe archived at
`790-c4-t0-probe.test.ts.txt`. Run alone by positional filename, five times across four incremental
content revisions (plus one earlier unsaved run of revision 1), never inside a suite pass. It asserts
only `LIVE_SAVE_VERSION === 34`; every axis fact is printed, never gated. Removed from `tests/` after
use, so no suite collects it.

Record 782 (§3 R1-R9, §6 amendments) and the controlling order name eight axes (Y1-Y8) for the C.4
replenishment expansion. This record establishes by BUILDING them which are reachable and what each
world actually contains, before the minter (791) commits bytes. Primary seed `p14c4-corpus-01`, with
per-axis seed suffixes (`-y1y2`, `-y3`, `-y4`, `-y6a`..`-y6e`, `-y6clip`) plus two standalone seeds
(`p14c4-demo-01` for Y8, and the held V33 fixture for Y5).

Two mid-task coordinator addenda were received and folded into the SAME probe file (not a new one):
addendum 1 asked for two more continuation-week facts (`activeByProfession`/`activeUnder30` per
profession, and a `state.talent` append-only check) at every world's continuation; addendum 2 asked
for a new axis, Y8 DEEP DEFICIT, built and PROVEN as described, minted if reachable. Both are folded
into the summary below as first-class facts, not an appendix.

**A bug found and fixed mid-probe.** The first content revision's Y1/Y2 and Y3 search loops computed
the reported "week" label from a separately-incremented loop counter, one step BEHIND the state's own
`market.tick` after `tick()` was called inside the same iteration (a classic off-by-one between a loop
control variable and the mutated state it drives). This did not corrupt which records qualified (a
record's `retiredWeek` is fixed at the instant `tick()` produces that week, so reconstructing via
`advanceTo(state, reportedWeek)` reproduces the same facts regardless of the label lag) — Y1/Y2's
reported weeks (105/104) were unaffected — but Y3's reported week shifted from 226 to 227 once fixed.
Both loops now derive `w` from `state.market.tick` directly, never a separate counter. Fixed before
any world was built for width beyond the search itself.

Commands run (all identical positional-filename invocations):
```
node_modules/.bin/vitest run tests/p14c4-t0-probe.test.ts --minWorkers=1 --maxWorkers=1
```
Six executions total: an unsaved run of revision 1 (2026-09-25 22:08:42 CEST start, ~112s, tail
inspected only), then five full-output runs saved to disk: revision 1 repeat (22:11:21, 113.25s),
revision 2 / the off-by-one fix (22:15:34, 99.75s), revision 3 / coordinator addendum 1 (22:18:35,
118.13s), revision 4 / the Y6 multi-checkpoint fix + coordinator addendum 2 / Y8 (22:22:23, 128.76s),
and an UNCHANGED repeat of revision 4 (22:25:51, 108.93s). The last two runs (revision 4, run twice)
were compared field-by-field (excluding the `ranAt` timestamp and Y8's own `buildMs`, both
intentionally volatile): byte-equal. Total probe wall-clock across all six executions: approximately
681s (~11.3 min). All runs: exit 0, 1 test passed.

## Summary table

| axis | route | reachable | measured |
| --- | --- | --- | --- |
| Y1 mid-year | natural population (3 authored hard-boundary people + genesis), `advanceTo(105)` continuing from the Y2 world | YES | week 105 (105 % 52 = 1); 1 retirement in (52,105] |
| Y2 at a cohort week | same population, `advanceTo(104)` | YES | week 104 (= 52·2); 1 retirement in (52,104] |
| Y3 all statuses | 2 authored+seated productions (held unreleased) + an unseated hard-boundary trio, `advanceTo(227)` | YES, all 3 statuses, 3 professions | announced (writer), finishing_commitments (actor, craft), retired (actor) at week 227; 0 retired ids found in `freeAgents` |
| Y4 null hollywood | `generateWorld(seed)` — pre-founding, no `activateStudioOperations`/`initializeHollywood` | YES | `hollywood === null`, ticks successfully, 0 records at every checkpoint through week 208 |
| Y5 migrated chain | genuine V33 fixture (`genuine-v33-c2-hard-boundary-and-idle-window`, week 780) → `convertV33ToV34` → ticked to week 988 | YES | `boundaryWeek = 780 > 0`; 26 records at week 988, 100% post-migration (`announcedWeek >= boundaryWeek`) |
| Y6 clip reachability (measurement only) | 5 independent fresh seeds ticked to week 1600, per-52k-week retired-in-window counts | naturally NOT reachable; authored fallback demonstrated but did not itself clear 32 within the checkpoints tried | natural max 9 (seed `-y6e`, week 1404); 40 authored hard-boundary people (10/role) reached 30 retirements in one window (week 156: director+writer+craft) — close to, not over, 32 within the checkpoints tried |
| Y7 year one (measurement only) | derived from Y6's own per-seed week-52 checkpoints | YES, confirmed empty in all 5 seeds | paper reason: `retiredWeek >= effectiveWeek >= announcedWeek + 52 >= 1 + 52 = 53 > 52` |
| Y8 deep deficit (coordinator addendum 2) | `p13aGeneratedStudio('p14c4-demo-01')`, NO player action, `advanceTo(2600)` | YES | build took 18.12s (<< the 90s gate); 6 active people total (actor 3, director 1, writer 1, craft 1) against accepted sizes 40/14/16/14; hiring listing empty |

## Y1 / Y2 detail

One continuous history, seed `p14c4-corpus-01-y1y2`: `fund(p13aGeneratedStudio(seed))`, then three
authored hard-boundary people at week 0 (`createTalent` age 70: actor, writer, craft — no contract, no
seat). Ticking week by week: the week-52 and week-78 checkpoints are both empty (matches Y7). At week
104 (exactly `52·2`) one actor's `retiredWeek` falls in `(52,104]` — this is the Y2 world (a retirement
whose own cohort week, 104, has already passed by the time any future C.4 cohort could act on it: the
next cohort request would be at week 156, and 782 R3/R7's own text is explicit that a clipped or
un-replenished remainder is never carried forward). Continuing ONE more week, at week 105 (not a
multiple of 52) a SECOND, different actor's `retiredWeek` falls in `(104,105]` — the Y1 world (a
mid-year save holding a retirement that a cohort produced at week 156 would need to count, since 156's
window is `(104,156]`). Both worlds share the same underlying seed/action history; Y2 is the earlier
save point along it, Y1 the later (one tick further), so both are genuinely reached by one honest
continuation rather than two independent builds.

## Y3 detail

Seed `p14c4-corpus-01-y3`: an unseated hard-boundary trio (actor/writer/craft, age 70, no
contract — these retire cleanly and quickly) plus two SEATED authored people on separate,
held-unreleased productions: a director (age 70, 400-week contract, greenlit as director on
production 1 with a freshly signed writer/lead/antagonist/support/craft) and a lead actor (age 70,
208-week contract, cast as lead on a second, separately-crewed production). Neither production is
ever wrapped or cancelled — this matches the accepted E2 test's own finding
(`tests/p14c2a-save-and-settlement.test.ts`, "this genuine production has not wrapped by week 208"):
a genuine greenlit production in this harness does not complete on its own within hundreds of weeks
when nothing further is done to it, so `busyTalentIds` stays true past the seated person's own
`effectiveWeek`, settling them to `finishing_commitments` rather than `retired` — through the REAL
natural intent-and-settlement path, no synthetic record needed. At week 227: `announced` holds one
writer (the trio's writer, mid-lifecycle); `finishing_commitments` holds two actors and one craft
(from the SEATED productions' supporting cast, who independently crossed their own windows while
seated); `retired` holds one actor (the trio's actor, already fully settled). Three professions
represented (writer, actor, craft); both seated subjects (director, lead) are confirmed STILL
`busyTalentIds`-true at the save week. `retiredIdsInFreeAgents` returned `[]` at this specific save
week — the one retired person here had never been signed (no player contract to expire into
`freeAgents`), so this world does not exercise that specific interaction; see "contradictions
observed" below for where it DOES occur (Y5's world).

## Y4 detail

`generateWorld(seed)` alone — no `activateStudioOperations`, no `initializeHollywood` — yields a
complete, genuinely V34-shaped state directly: `hollywood: null`, `careerLifecycle: {boundaryWeek: 0,
records: []}` are already present in `worldgen.ts`'s own construction (`src/core/worldgen.ts:810-812`).
This bare (pre-founding) state DOES tick successfully (`tick(bare)` returns a new state without
throwing), and stays `hollywood === null` with zero `careerLifecycle` records through every checkpoint
tried (52, 104, 156, 208) — matching 773 D6 / 782 R8 exactly: the lifecycle step returns the state
unchanged whenever `hollywood === null`, so no cohort can ever fire in a world that never founds a
studio. `hiringMarketIds` still returns a non-empty listing (length 8) even in this null-hollywood
world — the hiring/signability machinery reads `state.talent` directly and is not itself gated on
`hollywood`, unlike the lifecycle step. Measured, not judged; recorded under "contradictions observed."
The M0A corpus and the roster-wall observatory (both named as alternative routes in the task) were not
needed once `generateWorld` alone reached the axis this cheaply; not tried further.

## Y5 detail

`tests/fixtures/p14/genuine-v33-c2-corpus/genuine-v33-c2-hard-boundary-and-idle-window.json.gz`
(week 780, a genuine V33 C.2a-era fixture with no `careerLifecycle` root at all) read from disk,
`validateSaveV33`'d, then `convertV33ToV34` — the LIVE migration, not a hand-rolled one — opens
`careerLifecycle: {boundaryWeek: 780, records: []}` exactly per 773 D13. Ticking forward: at week 832
(one cohort week past migration), 18 records already exist, ALL `status: 'announced'` (director 3,
actor 9, writer 4, craft 2) — the fixture's own four authored hard-boundary people plus its natural
idle-in-window population, all newly announcing under the live intent step. By week 884 all but one
have settled to `retired`; by week 936 (`52·18`) 19 are retired, 1 still announced; by week 988
(`52·19`, two cohort weeks past migration) the population has grown to 26 records as MORE natural
people cross their own windows over time (announced: director 3, writer 2, actor 1 = 6; the rest
retired). Every one of the 26 records' `announcedWeek >= boundaryWeek` (780) — none dated before the
migration boundary, exactly as D13 requires. `boundaryWeek = 780 > 0` satisfies Y5's own requirement.

## Y6 / Y7 detail (measurement only — no fixture minted for either)

Five independent fresh seeds (`-y6a`..`-y6e`), each ticked from genesis to week 1600 with per-52k-week
snapshots (30 checkpoints/seed, 150 total). The week-52 checkpoint was 0 in all 5 seeds (Y7). The
observed per-seed, per-year retired-in-window totals ranged from 0 to a maximum of 9 (seed `-y6e`,
week 1404: craft 1, actor 3, writer 4, director 1) — nowhere close to the provisional 32 cap under
organic population churn alone at this population scale. **32 in one year is NOT naturally reachable**
within this budget.

The `AUTHORED_BUDGET` fallback (`src/core/actions.ts:819`, `authoredTotalCost`) is checked PER
`createTalent` action, independently each call — confirmed directly by reading the source (no
cumulative/world-level budget exists) and by authoring 40 hard-boundary people (10 per film role, in
782's profession order) in ONE batched `applyActions` call, all 40 succeeding. Ticking that world to
successive checkpoints: week 104 catches only the 10 actors (their hard boundary, 70, is met
immediately at week 0, so they cycle fastest); week 156 catches the OTHER three professions together
(10 director + 10 writer + 10 craft = 30) — a structural asymmetry, not a bug: actor's D1 window is
`[60,70)` so an authored age-70 actor is already AT hard boundary and announces at their very first
birthday, while director/writer/craft (windows `[65,75)`/`[65,75)`/`[62,72)`) at the same age 70 are
below their own hard boundary and can only qualify via `idleInWindow`, which additionally requires the
773 D3a anchor-recency gate (`anchor <= week − 104`) — unlocked only from week 104 onward — so their
announcements cluster roughly 52-104 weeks later than the actors'. The 30-in-one-window result (week
156) is close to, but did not itself exceed, the 32 cap within the five checkpoints tried (104, 156,
208, 260, 312); a trivially larger batch (e.g. 11 authored people for each of the three later-clustering
professions instead of 10) would very likely cross it, but was not re-run within this measurement's
budget once the primitive itself — many authored people, one clustered retirement window, cheaply and
lawfully built through real `createTalent` calls — was already confirmed working. Y8 (below)
independently and unambiguously demonstrates a real, natural `>32` scenario through a different
mechanism (a deficit-sized request, not a retirement-count-sized one).

Y7: `retiredWeek >= effectiveWeek = max(announcedWeek + 52, endInForce) >= announcedWeek + 52`, and
`announcedWeek` is itself a birthday week materialized by `tick()`, which never fires at week 0 (no
person is retroactively born mid-tick-zero), so `announcedWeek >= 1`. Therefore
`retiredWeek >= 1 + 52 = 53 > 52`: no record can ever retire inside `(0, 52]`. Confirmed empty in all
5 of Y6's independent seeds at every one of their own week-52 checkpoints.

## Y8 detail (coordinator addendum 2)

`p13aGeneratedStudio('p14c4-demo-01')` — genesis only, **no `fund()` call** (following 775 world 2's
own precedent: a purely natural, tick-only world needs no cash bootstrap since no player action is
taken) and no player action of any kind — ticked via `advanceTo` straight to week 2600 (itself a
cohort week, `52·50`). The tick loop alone took 18,124.7ms, comfortably under the addendum's 90s gate.
At week 2600: 6 people total remain active (not retired) across the four film professions — actor 3,
director 1, writer 1, craft 1, all `activeUnder30: 0` — against the accepted genesis composition
(actor 40, director 14, writer 16, craft 14; total 84). `hiringMarketIds(state, 2600)` returns an
empty listing. Continuing to the next two cohort weeks (2652, 2704) under the live engine: zero further
retirements in either window, the SAME 6-person active composition holds at both, and `state.talent`
stayed append-only across the whole continuation (93 ids, same order, 0 new ids appended at either
checkpoint) — the rival economy in this specific passive world has stopped minting new supply by this
point (consistent with 782 §7 amendment 6's own note that its reference driver's rivals go insolvent
from week 260 onward). Under the amended R3 sizing rule (`request_p = max(accepted_p − active_p,
young_p ? 0 : 1)`), this world's implied per-profession requests would be enormous (actor 37, director
13, writer 15, craft 13 — 78 total, before the 32 clip) — the natural clip fixture for the AMENDED
rule, structurally distinct from Y6's clip mechanism (a retirement-COUNT overflow): here the overflow
comes from a DEFICIT against the accepted population, which a single busy year of retirements cannot
produce at this population scale, but decades of unreplenished attrition can and does. Minted as
`genuine-v34-c4-deep-deficit`.

Record 792 (concurrent parent work, observed in this same tree — see below) independently measured
"about 6 people active... across all four film professions" in this same scenario; this record's own
independent build (from a probe that does not read 792, and asserts nothing borrowed from it) confirms
the SAME structural finding (6 people, all four professions represented) from scratch. Recorded as a
cross-check, not a dependency: this measurement's own `expect()` gates in the minter (below) are
against facts this file derived itself, not against 792's claims.

## Contradictions / interactions observed against 782's assumptions (measured, not fixed)

1. **`hiringMarketIds` is NOT gated on `hollywood === null`.** A bare, pre-founding `generateWorld`
   state (Y4) still returns a non-empty hiring listing (length 8). The lifecycle step itself IS
   correctly gated (773 D6/782 R8: zero records, confirmed), but the market-listing machinery reads
   `state.talent` unconditionally. Not a defect in anything C.4-owned; recorded because a future
   reader of "hollywood-null worlds are otherwise inert" should know this one surface is not.
2. **A `staff()` interaction worth flagging for C.4's own future RED.** `hollywoodTick.ts`'s rival
   restaffing (`staff()`, line ~142) fills a vacancy by scanning `next.find(t => t.role === role &&
   !unavailable.has(t.id) && !capped(t.id))` — a scan over ALL of `state.talent`, not specifically
   `state.freeAgents`. 782 R6 says a C.4 entrant is "pushed onto `state.freeAgents`" at the cohort
   week — but since `staff()` does not consult `freeAgents` to find candidates, a freshly-minted
   cohort entrant would be visible to rival restaffing the moment they exist in `state.talent`,
   independent of the `freeAgents` push, and (depending on tick ordering between the lifecycle step
   and the market step in the SAME week) could in principle be hired by a rival before the player's
   own hiring-market listing ever reflects them. This record does not resolve tick ordering here
   (that is a C.4 RED question, not a T0 measurement one) — flagged for the RED to test explicitly.
3. **Retired ids can remain in `state.freeAgents` indefinitely — measured directly, not merely
   theorized.** Nothing in the retirement lifecycle (`careerLifecycle.ts`) removes a person from
   `state.freeAgents`; the array is only ever pruned by the sign/renew/proposal-commit call sites
   (`actions.ts:2535,2564,2657`, `talentMarket.ts:980`). `hiringMarketIds` correctly filters retired
   people back OUT of its own listing (via `withdrawnPersonIds`), so this is invisible at the
   player-facing surface, but the RAW `state.freeAgents` array itself is not pruned. The Y3 world
   measured `[]` (its one retired person had never been signed, so was never pushed into
   `freeAgents` at all) — but the Y8 (deep-deficit) world, at week 2600, holds **40 stale retired
   ids still sitting in `state.freeAgents`** (43 total free agents, 40 of them already retired) —
   people who were signed at some point (pushing them into `freeAgents` on contract expiry) and later
   crossed their own retirement window. A real, structural, naturally-occurring fact for whoever
   writes the C.4 (or C.2-RM) RED that touches `freeAgents` directly.
4. **Record 782 was amended (§7, six items) by the parent WHILE this T0 was in flight** — observed as
   a `git status --porcelain` modification to `782-c4-replenishment-expansion.md` plus new untracked
   `792-c4-demo-*`, `792-c4-demonstration-*`, `793-c4-api-contract.md`,
   `794-c4-v35-sweep-inventory.md` files, all OUTSIDE this task's protected-path gate (`docs/` is not
   in the minter's clean-tree check, matching 774's own precedent for the identical situation during
   C.2a's T0). This record's own measurements (`ACCEPTED_GENESIS_SIZES`, the deficit-plus-youth-floor
   sizing shape) independently corroborate 782 §7's own numbers without having read them first (the
   coordinator's two addenda supplied the same figures directly); no action taken on those other-owned
   files.

## Standing qualification

These are measurements at `ff7b9ac1d334709f1c907e6f7e6d918b935ee9a5` on the listed seeds. Byte counts,
specific ids, specific ages and specific weeks are properties of these seeds and are not laws. No
baseline was touched: no `record-check.mjs`, full-core or `test:ui` run occurred in the probe's window,
and only the single-file probe command above was ever run (never inside a suite pass).
