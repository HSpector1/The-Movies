# 774 — P14C.2-T0 corpus reachability, measured

Source `f2d862d7ea3755992284ab29a6f924f941ff3c85` (published; `src/` identical to `f3652852`, the
final V33 writer — before any C.2 source change). Probe archived at
`774-c2-t0-probe.test.ts.txt`. Run alone by positional filename (twice, for determinism), never
inside a suite pass. It asserts nothing about the product and writes no artifact; it prints.
Removed from `tests/` after use, so no suite collects it.

Record 773 §3/§6 named eight axes (X1-X8) for the C.2a retirement expansion (windows: actor
60/70, director 65/75, writer 65/75, craft 62/72; scientist none). This record establishes by
BUILDING them which are reachable and what each world actually contains, before the minter (775)
commits bytes. Primary seed `p14c2-corpus-01`, with seed suffixes (`-d1` .. `-d5`, `-b`, `-c`) for
independent worlds.

Commands run:
```
node_modules/.bin/vitest run tests/p14c2-t0-probe.test.ts --minWorkers=1 --maxWorkers=1
```
Run four times total across incremental refinements of the same probe file (each pass added a
supplemental search, never removed a prior measurement). All four runs: exit 0, 1 test passed.
Runtimes: 14.89s, 42.53s, 45.44s, 89.7s (real 1m30.8s) as checkpoints were extended from 500 to
2200 ticks for the X8 search. Determinism: the first two axes (X1, X7-refusal, X3/X4/X6, X5, X8
kinds-at-migration) reproduced identically byte-for-byte across all four runs; only the
*supplemental* search sections grew as more seeds/weeks were added.

## Summary table

| axis | route | reachable | measured |
| --- | --- | --- | --- |
| X1 hard boundary | `createTalent` at the `[18,70]` clamp edge (age 70) for all four film roles, then `advanceTo(260)` (or 780, see below) | YES, all 4 professions | age 75 for all four at week 260; actor/craft PAST (70/72), director/writer AT (75/75, D1's window is `[start,hard)` so `age===hard` is "at") |
| X2 idle in-window free agent | natural genesis population, ticked long enough for the drawn age to enter a window | YES for actor+craft at week 260 (one each, seed base); YES for all four professions simultaneously at seed `-d1`, week 780 | see per-seed detail below |
| X3 player-contract half (D5 contract-end branch) | `createTalent` age 65 actor + `signContract(termWeeks:208)` | YES | contract end 208 > nextBirthdayWeek(52)+52=104 |
| X3 rival-employment half | natural rival hire aged, by ticking, into a window (no forced `enterRival` call — the exclusion is deliberate, see below) | YES for actor+director+writer+craft, each individually across seeds `-d1`..`-d5` at weeks 520/780/1040; no single seed/week combo found with all four simultaneously within budget | see rival table below |
| X4 open market case (renewal window) | `createTalent` age 65 director + `signContract(termWeeks:52)`, advance to `end-8` | YES | case status `proposals_open`, `openedWeek 40`, `decisionWeek 52` |
| X5 seated in production | `createTalent` age 68 director + `signContract` + 4 more signed roles + `greenlight` | YES, on the FIRST attempt — no matching-set precondition needed | seated (`busyTalentIds` true) at week 0, no set-build step required |
| X6 open promise, in-window beneficiary | `proposePromise` on the X4 director while their case is open | YES | promise `outcome: null`, `family: APPEARANCE_COUNT`, beneficiary age 65 (director window) |
| X7 scientist, no window | (a) `createTalent` role `scientist` — expect structural refusal; (b) `p13aResearchReady()` aged further | (a) REFUSED as predicted; (b) YES, reached age 61 at week 520 (>= 60) | `createTalent` throws `"...role \"scientist\" is not a valid CreativeRole"` — `CREATIVE_ROLES` in `actions.ts` is `['writer','director','actor','craft']`, structurally excluding `scientist` even though `CreativeRole = FilmCreativeRole \| 'scientist'` in `types.ts` |
| X8 migrated V33 shape | `migrateToV33` on the held `genuine-v32-c1-corpus/genuine-v32-authored.json.gz`, then tick | YES for the primary ask (legacy_age_anchor rows, distinct from a fresh V33 campaign); NOT REACHED for the "any authored_exact_week rows from rival supply" sub-detail, tried to 2200 ticks | see X8 detail below |

## X1 detail

`fund(p13aGeneratedStudio(seed))` then four `createTalent` calls (`actor`/`director`/`writer`/
`craft`, each age 70, `potentialTier: 'Steady'`, `workEthic: 55` — within `AUTHORED_BUDGET` (100)
individually, same recipe as the accepted C.1 minter's axis 4). `advanceTo(260)` ages all four to
75 (`floor(70 + 260/52) = 75`). All four report `atOrPastHard: true` against their D1 hard
boundary (70/75/75/72).

## X2 detail (idle in-window free agents, per profession)

Idle, for this probe, is operationalized as: `rivalEmployment(state,id,week) === null`,
`activeContract(state,id,week) === undefined`, `!busyTalentIds(state).has(id)`, and no
`state.contracts` row for that person overlapping `[week-104, week)`. This is a measurement
approximation of D3/D3a's "no P12 employment interval (player or rival)... no player contract
overlapping [w-104,w]... no seat at w", not a claim about the eventual implementation's exact
predicate shape.

Primary seed (`p14c2-corpus-01`), week 260, natural population (excluding the four authored
hard-boundary people, which are additionally present and already counted under X1):

| role | idle-in-window count | example |
| --- | --- | --- |
| actor | 1 | `t-act-19`, age 62, anchor week 0 |
| director | 0 | — |
| writer | 0 | — |
| craft | 1 | `t-cra-03`, age 62, anchor week 0 |

Director and writer did not clear their (higher, 65-start) window within this seed by week 260.
Supplemental search across seeds `-d1`/`-d2`/`-d3` at weeks 260/520/780 found BOTH reachable at
later weeks — e.g. seed `-d1` at week 780: director 2 hits (ages 66, 65), writer 3 hits (ages 71,
67, 72). A dedicated check of seed `-d1` at week 780 alone found ALL FOUR professions
simultaneously idle-in-window: actor 6, director 2, writer 3, craft 1 (one natural actor,
`t-act-21`, was ALSO already `atOrPastHard` at age 70 in that same world — a second, independent
X1 witness with no authored person involved).

This is the world minted for axis X1+X2 combined (`genuine-v33-c2-hard-boundary-and-idle-window`,
seed `-d1`, week 780): the four authored hard-boundary people plus this natural population.

## X3 rival-employment-half detail (rival-in-window, per profession)

No `enterRival` call was made directly — record 773 trap 1 and the stop-rule both treat that as an
internal mutator that would force the scenario rather than exercise it lawfully; the whole route
here is natural `tick()`-driven rival restaffing (`hollywoodTick.ts` fresh-hire/renewal loops)
acting on a long-run world. Searched seeds `-d1`..`-d5` at weeks 260/520/780/1040:

| role | first hit | seed/week |
| --- | --- | --- |
| actor | age 61, contract end week 624 | `-d1`, week 520 |
| director | age 68, contract end week 936 | `-d2`, week 780 |
| writer | age 65, contract end week 1196 | `-d2`, week 1040 |
| craft | age 68, contract end week 416 | `-d2`, week 260 |

Seed `-d2` at week 1040 alone carries THREE simultaneously (actor, director, writer); craft was not
present in that same snapshot (craft's own hit at `-d2` was earlier, week 260, and had aged past
its hard boundary by 1040). No single seed/week combination across the five tried carries all four
simultaneously. This is reported as the honest limit of a bounded search, not as impossibility: two
genuinely different axes were tried (varying seed; varying week per seed) and the combination
narrowed but did not close within the allowance. The minted world (`genuine-v33-c2-rival-in-window`,
seed `-d2`, week 1040) carries three of four (actor, director, writer); craft is separately
confirmed reachable (seed `-d2`, week 260, or seed `-d4`) but not combined into one save.

## X4 / X6 detail

One combined world: an authored actor (age 65, 208-week player contract — the X3 player-contract
half) alongside an authored director (age 65, 52-week player contract). Advancing to
`endWeekExclusive - 8` (inside the 12-week `HIRING_RENEWAL_WINDOW_WEEKS`) shows
`caseOpenForTalent` true and a discovered case (`openedWeek 40`, since discovery fires the week the
window opens: `52 - 12 = 40`). `proposePromise` on the director at that point attaches a real,
non-terminal promise (`APPEARANCE_COUNT`, `outcome: null`) via the accepted `submitProposal` +
`attachPromise` pattern already used by `retentionFixture`/`historyFixture` in
`tests/helpers/p14b2-fixtures.ts`. Advancing further to week 48 (still inside the actor's long
contract, still before the director's case decision at week 52) is the snapshot minted.

## X5 detail

Contrary to the `retentionFixture` precedent (which builds and matches a physical set before its
own later shooting-phase steps), `greenlight` itself required NO pre-built set in this probe: an
authored age-68 director (window `[65,75)`), a signed writer, three signed actors and one signed
craft were sufficient for `greenlight` to succeed on the first attempt, at week 0, with the
director immediately `busyTalentIds`-seated. The set-matching machinery in `retentionFixture`
appears to serve ITS OWN later steps (a specific shooting recipe / stage match), not a `greenlight`
precondition.

## X7 detail

`createTalent` with `role: 'scientist'` throws immediately: `applyActions: createTalent role
"scientist" is not a valid CreativeRole`. Traced to `src/core/actions.ts:249`:
`CREATIVE_ROLES = ['writer', 'director', 'actor', 'craft'] as const` — a narrower list than the
type `CreativeRole = FilmCreativeRole | 'scientist'` (`src/core/employment.ts:19`) allows. This
matches D2's ruling exactly: Scientists are a structural participant with NO window, and no
authored route exists to create one directly. `p13aResearchReady()` (accepted harness route,
recruits via the real `recruitScientist`/`assignResearchScientist` actions after the lab slice,
reaching week 260 with the scientist at age 56) advanced a further 260 weeks reaches age 61 —
"a scientist aged 60+" is fully reachable, not merely "the oldest reachable" as the fallback the
task allowed for.

## X8 detail

`migrateToV33` on `tests/fixtures/p14/genuine-v32-c1-corpus/genuine-v32-authored.json.gz` (86
talent rows) immediately produces a `talentProvenance` root with `boundaryWeek` equal to the
migration week and EVERY row `kind: 'legacy_age_anchor'` — the shape D13 anticipates for a
pre-C.2 V33 save, and structurally distinct from every other world in this corpus (all of which
are fresh V33 campaigns whose genesis rows are `authored_exact_week`).

Ticking forward was checked at 50, 100, 150, 200, 260, 320, 400, 500, 700, 900, 1100, 1400, 1800
and 2200 weeks past migration (~42 years). At every checkpoint: `rowCount` stayed 86 and `kinds`
stayed `['legacy_age_anchor']` — no `authored_exact_week` row was ever appended. Reading
`hollywoodTick.ts`'s restaffing loop explains why: a role vacancy is filled by reusing an EXISTING
free agent of that role (`next.find(t => t.role === role && !unavailable.has(t.id))`) BEFORE
falling back to `generateIndustryTalent` (the only route that appends a NEW provenance row); with
86 people spread over 4 film roles, a role's free-agent pool did not exhaust within 2200 ticks in
this specific world. This is reported as NOT REACHED within the tested budget, not as
impossibility — a different (smaller-population, or more heavily player-active) starting fixture
might exhaust a role's pool sooner, but was not tried further within this record's allowance. The
PRIMARY ask — confirming the migrated shape is legacy_age_anchor and distinct from a fresh V33
campaign — is fully satisfied regardless.

## Standing qualification

These are measurements at `f2d862d7ea3755992284ab29a6f924f941ff3c85` on the listed seeds. Byte
counts, specific ids and specific ages are properties of these seeds and are not laws. No baseline
was touched: no `record-check.mjs`, full-core or `test:ui` run occurred in the probe's window, and
only the single-file probe command above was ever run (never inside a suite pass).

## An unrelated observation, not acted on

Between the second and third probe runs, `git status` began showing modifications/untracked files
under `docs/engineering/playability-launch-review/evidence/p14b4-20260919/` outside this task's
allowed write paths (a modified `773-c2-retirement-expansion.md` and new `773-A-c2-contract-audit.md`,
`776-c2-v34-sweep-inventory.md`, `777-c2a-api-contract.md`, `run-fixed-source-c2.mjs`) — consistent
with another session already working later-phase C.2 material concurrently in this same tree. The
minter's own clean-tree gate covers `src/ bridge/ generated/ ui/ scripts/ tests/helpers/
tests/fixtures/ package.json package-lock.json`, not `docs/`, and that gate passed at every mint
attempt (verified immediately before each run); this record touches none of those other-owned
files and takes no action on them.
