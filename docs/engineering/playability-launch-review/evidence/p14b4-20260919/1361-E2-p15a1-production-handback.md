# 1361-E2: P15A.1 Wave 2 production handback (the shared market in the Save45 step)

Role: the single production writer for P15A.1 Wave 2 under 1361-F, on slice 2a. Scope: the reception seam; the
`sharedMarket` root, its validator, its entries in the Save45 step, migration, downgrade and fresh worlds; and the weekly
batch with its witness, its finalize append and the factor at both release sites. I wrote three commits in the scratch
tree on `p15a2-r2`, read them against the landed RED, and ran no node, vitest, tsc, npm, npx, tsx or vite-node. I edited
no test and no test helper. Besides shell reading tools (cat, sed, grep, awk, wc, shasum), I ran read-only git in the
real repository (rev-parse, log --oneline), git in my own tree (commit, amend, cherry-pick, tag, diff, show, and an apply
check under a temporary index), and python that printed the classification and edited two commit messages. Every type
and behavior claim below comes from reading.

**Status: complete by reading.** All 59 classified rows map to code (table below). By reading, all 59 pass at
`p15a1-c-r1`, including the four pin controls (default seam, K1, K2, M0A) and both `market-old-save` capture leaves. The
pass count by reading climbs 9, 11, 15, 59 across `p15a2-r2`, (a), (b) and (c), with no row lost at any commit. Three
things stay unmeasured: the type gates (U1), K1's confinement check, which first does real work at (c) (O2), and the
run time with the batch on (U3).

## Authority read

E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919` in the real repository.

1. 1361-F rulings 1 to 9, 11 and 13; 1361-F2 (new during the work), rulings 1 to 4; 1361-F3 and 1361-D findings F1 to
   F7 for the slice 2a r2 fixes.
2. 1361-R Part 1.2 and Part 2.4, with Parts 2.1, 2.2 and 2.5.
3. 1355-A in full, as adopted by 1355-F (Amendments 1 to 4).
4. 1355-F2, 1355-F3, 1355-F4 (landing order, R1 to R3, the `vi.mock` seam), 1355-F5 and 1355-F6.
5. 1355-C4 and 1355-D4.
6. 1361-X (slice 2a r1's dry run) and 1361-GP-D :100-135 (G-P decision (b) and finding 5).
7. The oracle, in the tree, read in full: T `tests/p15a1-market-integration.test.ts`, Ph
   `tests/p15a1-market-integration-phases.test.ts`, At `tests/p15a1-market-integration-atomicity.test.ts`, H
   `tests/helpers/p15a1-market-route.ts`, and `tests/helpers/p15-roots.ts`; the classification
   `E/1355-stage/1355-p15a1-wave2-red-r4-classification.json` (59 rows, 8 controls).
8. The guide `E/1355-stage/1355-p15a1-wave2-reference-r3.patch`, all 608 lines. I did not apply it, skipped its
   `p15Phases.ts` and `powerRankingArchive.ts` hunks, and dropped its private `validateP15Allocator`.
9. For the 1356 interaction: `tests/p15a2-power-ranking-archive.test.ts:778-803` and
   `tests/p15a2-power-ranking-archive-isolation.test.ts:72-112`. For K1's reach: `relationships.ts:462-464`,
   `releaseCareers.ts:41-73`, `talentMarket.ts:387-401` and `:823-833`, and `tick.ts:863-875`. For fact 8:
   `releaseAuthority.ts:69-101` and `operations.ts:1680-1790`.

This round I read nothing under `tests/fixtures`. The pin MANIFEST's key lists come from my slice 2a reading (1361-E).

## Base and tree

- Tree: `/Users/zacheryspector/studio-scratch/1361-prod/tree`, branch `main`, clean and checked out at `p15a1-c-r1`.
- `base` is `1045432824164e7101fb00ed89a25fafa1e40505`. `base:src` is 762d8e09, the same tree as the real repository's
  `src` at its HEAD 7d582318 when I checked. The five oracle files have the same blobs at f3fe97d0, at real HEAD and in
  the tree.
- The stack, one commit each, `src` only:

| Tag | Commit | Holds |
|---|---|---|
| `p15a2-r2` | `5eccada21b9ec413d68cbd0bd7d9f1d2e321fcc1` | slice 2a with 1361-F3's R1 to R4 (1361-E, section "r2 (1361-F3)") |
| `p15a1-a-r1` | `39d0481f0b008404855d6fa9dd698cc354a889c8` | (a) the seam |
| `p15a1-b-r1` | `1074744356022e0416282d3d86929b33d40ead51` | (b) the root |
| `p15a1-c-r1` | `c5249114ae3c5e52253625210a9512b1e5cf19ac` | (c) the batch |

- `p15a2-r1` still names `1f2495a`. My first build of (a), (b) and (c) sat on r1 as 9f4ecd5, 049f47c and 2dd41a1. I
  replayed them onto r2 and moved the three tags. The only content change from that first build is r2's own, plus
  `sharedMarket: true` in R1's literal at (b). `git diff 2dd41a1 c524911` equals `git diff p15a2-r1 p15a2-r2` file for
  file.
- Each cumulative patch applies with `git apply --check --cached` on `base` under a temporary index, since deleted.
- I wrote only under `src/` in the tree, and nothing under a link or in the real repository.

| Patch in `/Users/zacheryspector/studio-scratch/1361-prod/` | Lines | Bytes | sha256 |
|---|---:|---:|---|
| `1361-p15a1-production-a-r1.patch` (`git diff base p15a1-a-r1`) | 1,183 | 74,099 | `ef8e56d7ba8b4a7a3d634510e9cf016a2e3f465d4654ed6ac01e1f0b770b026e` |
| `1361-p15a1-production-b-r1.patch` (`git diff base p15a1-b-r1`) | 1,400 | 88,903 | `f677aeb0350fec3e913700457c8dfced1cc6b12c247ff7742f62c555e8a2c836` |
| `1361-p15a1-production-c-r1.patch` (`git diff base p15a1-c-r1`) | 1,540 | 98,300 | `3eeb2ea247695bd5838c31afa1eea4b9ccd41c67774c9830566365c60d32ea92` |
| `1361-p15a2-production-r2.patch` (`git diff base p15a2-r2`) | 1,097 | 68,526 | `0060f5ccc58a4c272830e175d58e643a9c2e24d60320ee74042e194d7cf6003c` |

Per commit, `git diff --numstat` against its parent:

| Commit | File | + | − |
|---|---|---:|---:|
| (a) | `src/core/reception.ts` | 17 | 2 |
| (a) | `src/core/hollywoodTick.ts` | 7 | 3 |
| (b) | `src/core/marketIntegration.ts` (new) | 175 | 0 |
| (b) | `src/core/save.ts` | 19 | 14 |
| (b) | `src/core/types.ts` | 14 | 2 |
| (b) | `src/core/tick.ts` | 6 | 0 |
| (b) | `src/core/worldgen.ts` | 2 | 1 |
| (b) | `src/harness/roster-wall/historical-control.ts` | 12 | 8 |
| (c) | `src/core/marketIntegration.ts` | 75 | 3 |
| (c) | `src/core/hollywoodTick.ts` | 26 | 2 |
| (c) | `src/core/tick.ts` | 15 | 7 |

Line references below are at `p15a1-c-r1` unless marked. Keys: RC `reception.ts`, HT `hollywoodTick.ts`, MI
`marketIntegration.ts`, S `save.ts`, TK `tick.ts`, all under `src/core/`.

## What the commits hold

### (a) the seam, defaulting to 1

- `ReceptionInputs.competitionFactor?: number` (RC:103-106). Only the two release sites set it.
- `computeBoxOffice` takes a trailing `competitionFactor = 1` (RC:633-638) in place of N11's constant. It multiplies
  the opening where the constant did (RC:714), so the total follows and legs hold. A factor outside
  `[1 - SHARED_MARKET_FACTOR_MAX_PENALTY, 1]` throws `reception: competitionFactor <f> is outside [<floor>, 1]`
  (RC:688-691); the negated range test catches NaN.
- `resolveReception` passes `inp.competitionFactor ?? 1` (RC:827). The result reports the factor through the existing
  `competitionFactor` field (RC:774).
- `advanceHollywoodWeek(state, factorById?)` (HT:358) applies a release's factor at the rival reception (HT:414-416).
  No caller passes a map in (a).

### (b) the root, its validation and the step

- **MI, new.** `MARKET_PHASE_ID`; `initialSharedMarket(week)`; `requireSharedMarket(state)`, which names a missing
  root; and `validateSharedMarketRoot(raw, label)` (MI:128-188), with `validateFilmBijection` (MI:192-215) and
  `reconcileLaw` (MI:220-247). The checks, in order:
  1. root exact keys, `version` 1, `recordedFromWeek` a week in `[0, market.tick]`, `assessments` an array, and no row
     when `hollywood` is null;
  2. per row: exact keys (the message lists unexpected and missing keys), field types, reason shapes, a known
     `definitionVersion` (`Object.hasOwn(LAWS, …)`), the phase triple of the row's own version through the
     `P15_PHASE_TABLES` export, `recordedFromWeek <= week < market.tick`, no duplicate `releaseId`, strict
     `(week, releaseId)` ascent, `p15DomainSequence >= 1`, and sequence ascent;
  3. the film bijection from `max(recordedFromWeek, originWeek)`: each row against its film's week, studio and genre,
     then every film against the rows;
  4. the law reconciled week by week by era, every law field and reason exactly equal.
  Each message starts `<label>: sharedMarket`.
- **types.ts.** `PersistedMarketAssessment` and `SharedMarketRoot` beside the archive's types, and `sharedMarket` in
  `P15StepRoots`, so `GameStateV45` carries it.
- **S, through slice 2a's extension points.** `sharedMarket: true` in R1's `satisfies` literal (S:10871);
  `sharedMarket: initialSharedMarket(week)` in `initialP15Roots` (S:10880-10883), which serves `generateWorld`,
  `convertV44ToV45` (S:10977) and the historical lift; the market refusal first in `P15_DOWNGRADE_REFUSALS`
  (S:10889-10890), `cannot downgrade or discard a recorded shared-market assessment (<n> recorded)`; `sharedMarket`
  first in `P15_SEQUENCED_ROOTS` (S:10909); and `validateSharedMarketRoot(raw, 'validateSaveV45')` between the archive
  validator and the one allocator check (S:10966-10968). The presence check (S:10962), every strip (S:6199,
  S:10553, S:10965, S:10988) and both refusal sites follow the lists with no further edit.
- **historical-control.ts.** The hash's early return names `sharedMarket`, the P15 guard refuses a non-empty market
  root, and the strip drops it.
- **TK, (b) only.** At finalize, a world with an industry keeps its root recording from the week the advance
  produces: `sharedMarket: { ...requireSharedMarket(admitted), recordedFromWeek: currentTick + 1 }` (TK:1123 at
  `p15a1-b-r1`). See D1.

### (c) the batch, the witness, the append and the factor at both sites

- **Step 2.5** (TK:524-529): `runMarketBatch(admitted, releasing, currentTick)` (MI:60-81), after the P06A witness and
  before the first verdict. Members are the player's `releasing` pictures with `hollywood.playerStudioId`, and every
  rival picture at `remainingTicks === 1` with its business's `studioId`. Genres come from `state.concepts` and
  `hollywood.concepts`. The law runs once, through the `sharedMarket.js` export (MI:74), against `activeExposures`, a
  backward scan of the root's rows with `week > W - 26` (MI:43-51). With no industry it returns null.
- **The player site** (TK:622-623): the inputs carry `frozenFactor(marketBatch, prod.id)` (MI:84-88), which throws for
  a release the batch did not freeze.
- **The rival site** (TK:946-947): `advanceHollywoodWeek` receives `marketBatch?.rivalFactorById`.
- **The witness** (HT:338-352, :368, :402-407): before any rival work, the frozen rival members must equal the rival
  pictures at 1, by id, or the week throws naming the missing and unknown ids. Then each studio must release exactly
  its frozen members before its first reception. Together the two checks make the studios sum to the batch.
- **The append** (TK:1129-1131; MI:93-100): the week's rows in `(week, releaseId)` order, each with `p15DomainSequence
  = next++` and the v1 triple of `p15a1.marketBatch`. It replaces (b)'s recording start. The ranking record still
  wraps the tick's last expression, so the batch takes the tick's first P15 numbers (1355-F2 item 2; 1361-F ruling
  9).
- **The seams 1355-F4 declares.** Production calls `assessBatch` through its module export from outside
  `sharedMarket.ts` (MI:74 and the era map at MI:109), and `resolveReception` from TK and HT, outside `reception.ts`.

## Economic behavior by commit

- **(a) changes nothing.** No caller supplies a factor: TK passes none and calls `advanceHollywoodWeek` with one
  argument. The default is exactly 1, and IEEE `x * 1 = x` for every finite x. The range check accepts 1. Forecast,
  package, agent and chooser calls pass no factor. K2's and M0A's digests and the seam pin hold.
- **(b) changes nothing in the economy.** No reception, forecast or decision reads `sharedMarket`; only MI and the
  save step do. The one tick write touches the root's `recordedFromWeek`, which every pin strips (`stripP15`, the K2
  and M0A key lists). The live profession proof strips `sharedMarket` through `P15_ROOT_KEYS`, so retirement-writing
  authority holds, and R1 makes a missed key a type error.
- **(c) puts pressure in the economy.** A release with P > 0 opens and grosses `f(P)` times what it would have, f in
  `[0.75, 1)`. Its run schedule, revenue, cash, ledger, Standing, `filmReleased.after`, fame and career events follow,
  and later weeks inherit them (1355-A §4). The critic draw comes before the seam, so `rngState` never moves. Every
  release with P = 0 is bit-identical: `f(0) = 1` exactly, and both sites multiply by it. A world with no industry runs
  no batch. K2 and M0A therefore hold at (c) as well. (c) changes no save shape.

## RED row map

"Starts" is the first commit at which the row passes, by reading. "r1" rows already passed at `p15a2-r1` (1361-X) and
hold at r2, (a), (b) and (c). Rows that start at (c) and touch the validator need (b)'s code and (c)'s rows: at (b) the
rival route records no row, so their premises or forgeries stop on an empty `assessments` array.

| # | File | Leaf | Starts | Code |
|---:|---|---|---|---|
| 1 | T | `market-seam-default-exact` no factor equals factor 1 [control] | r1 | RC:638 default 1; RC:827 `?? 1` |
| 2 | T | `market-seam-default-exact` pin [control] | r1 | as row 1; `ReceptionResult` keeps its shape |
| 3 | T | `market-seam-scales-opening-only` f < 1 | a | RC:638 into the opening product (RC:714), reported at RC:774 |
| 4 | T | `market-seam-scales-opening-only` out of range throws | a | RC:688-691 |
| 5 | T | `market-forecast-paths-unchanged` agent and history [control] | r1 | no agent or forecast path reads the root |
| 6 | T | `market-forecast-paths-unchanged` decision week [control] | r1 | at (c) an empty batch appends nothing (MI:95); decisions read no root |
| 7 | T | `market-due-set-equals-releases` | c | members (MI:69-73) from step 2's `releasing` (TK:529) |
| 8 | T | `market-due-set-mismatch-fails-closed` missing member | c | `frozenRivalMembers` (HT:341-352) before any work (HT:368) |
| 9 | T | `market-due-set-mismatch-fails-closed` phantom member | c | same, the `unknown` list |
| 10 | T | `market-live-one-player-one-rival` | c | batch (MI:60-81) and append (MI:93-100) |
| 11 | T | `market-live-window-stock-retire` | c | `activeExposures` (MI:43-51) |
| 12 | T | `market-live-self-exclusion-clamp` | c | the Wave 1 law through the batch (MI:74) |
| 13 | T | `market-live-no-player-flag` exact keys | c | law row plus sequence and triple (MI:98) |
| 14 | T | `market-live-no-player-flag` mirror | c | members carry studio ids only (MI:69-73) |
| 15 | T | `market-week-diff-confined (K1)` rows | c | batch and append |
| 16 | T | K1 pin [control] | r1 | identical at r2, (a) and (b); at (c) by reading, see O2 |
| 17 | T | `market-no-pressure-week-identity (K2)` rows | c | P = 0 gives f = 1 and `NO_PRESSURE` |
| 18 | T | K2 pin [control] | r1 | f(0) = 1 at both sites; the pin keys exclude the P15 roots |
| 19 | T | `market-root-append-canonical` per week | c | append at finalize, `next++` (MI:96-99) |
| 20 | T | `market-root-append-canonical` ascent and v1 triple | c | `p15PhaseTriple(MARKET_PHASE_ID)` (MI:97) |
| 21 | T | `market-inflight-save-replay` | c | the batch reads only stored rows; (b)'s validator passes the reload |
| 22 | T | `market-validator-reconciles` unforged state | c | MI:128-188 on (c)'s rows; S:10968 |
| 23 | T | forged pressure | c | `reconcileLaw`, `pressure` first in `LAW_FIELDS` (MI:110, :233-236) |
| 24 | T | forged factor | c | same |
| 25 | T | forged windowTerm | c | same |
| 26 | T | forged stockTerm | c | same |
| 27 | T | forged reason | c | `reconcileLaw` reasons (MI:237-243) |
| 28 | T | forged inputDigest | c | same as row 23 |
| 29 | T | rows out of order | c | MI:177-179 |
| 30 | T | duplicate assessment | c | MI:174 |
| 31 | T | orphan with no film | c | bijection, row side (MI:205-207) |
| 32 | T | missing assessment | c | bijection, film side (MI:212-214), before `reconcileLaw` |
| 33 | T | before `recordedFromWeek` | c | MI:172 |
| 34 | T | at the tick | c | MI:173 |
| 35 | T | unknown `definitionVersion` | c | MI:166 |
| 36 | T | unknown root version | b | MI:133 |
| 37 | T | owner field | c | MI:146-151 |
| 38 | T | duplicate `p15DomainSequence` | c | ascent (MI:181-183) |
| 39 | T | sequence at `next` | c | `validateP15Allocator` (S:10930) over `P15_SEQUENCED_ROOTS` (S:10909) |
| 40 | T | sequence below 1 | c | MI:180 |
| 41 | T | stale `next` | r1 | `validateP15Allocator` |
| 42 | T | phase ordinal off its version | c | MI:167-171 |
| 43 | T | another phase's `phaseId` | c | same |
| 44 | T | unknown `phaseOrderVersion` | c | same |
| 45 | T | across P15 roots (1355-F4 R1) | c | the one check's duplicate rule across `sharedMarket` and `powerRanking` |
| 46 | T | `market-definition-era-guard` [control] | r1 | no TUNING change |
| 47 | T | `market-old-save` capture loads to the empty root | b | `initialP15Roots` in `convertV44ToV45`; the strip in `convertV45ToV44` |
| 48 | T | `market-old-save` first batches see no pre-migration release | c | exposures come only from the root (MI:43-51) |
| 49 | T | `market-old-save` Save42 week 130 | b | as row 47 |
| 50 | T | `market-old-save` downgrade refusal | c | the refusal list, market first (S:10888-10893), through every 45 line; premise needs rows |
| 51 | T | `market-disengaged-world` root stays empty | b | no write without an industry: TK:1123 at (b), MI:62 at (c) |
| 52 | T | M0A pin [control] | r1 | no batch without an industry |
| 53 | T | `market-large-batch-persisted-linear` row bounds | c | law row plus four scalars |
| 54 | T | `market-large-batch-persisted-linear` 32 and 512 members | c | a live row supplies the triple |
| 55 | At | rival second subject refuses in the seam | c | RC:689 throws inside the rival reception after the player's returned; `tick()` returns one state or throws |
| 56 | At | player second subject refuses in the seam | c | same, inside step 3 |
| 57 | At | live-tick batch loses a due rival picture | c | `frozenRivalMembers` (HT:350) |
| 58 | At | `market-seam-both-call-sites` | c | TK:623 and TK:947 with HT:415-416 |
| 59 | Ph | `market-phase-version-immutable` | c | MI:168 reads `P15_PHASE_TABLES[row.phaseOrderVersion]` through the mocked export |

Totals by reading: r1 and r2 pass 9 (rows 1, 2, 5, 6, 16, 18, 41, 46, 52); (a) adds rows 3 and 4 for 11; (b) adds 36,
47, 49 and 51 for 15; (c) adds the other 44 for 59.

Notes on rows that need care:
- **Rows 23 to 28** stay reconcile failures because the forgeries keep every other check true. A forged law field never
  breaks a key, type, phase, range, order, sequence or bijection rule.
- **Row 32**: removing a row can move other rows' `inputDigest` only for the same genre, and the forgery picks a row no
  later or same-week row of its genre shares. The bijection runs before `reconcileLaw` either way, so the film-side
  message ("has no assessment") comes first.
- **Rows 39 and 45** depend on the shared check running after the market validator. The market validator never
  refuses those two states: the forged sequence keeps the market ascent, and no other field changes.
- **Rows 55 and 56** need the refusal inside the seam, after the first subject's reception returned. Step 2.5 never
  range-checks a factor, so the forced 0.5 reaches RC:689. At week 21 the rival order is r01, r02, r03, so the
  player's and the two comedies' receptions return `pressureFactor(1)` before r03's throws.
- **Row 59**: under Ph's mock, MI's import binding is the mocked namespace, so a v2-declared row finds v2's entry. The
  append's `p15PhaseTriple` closes over the real module's v1 table and `P15_PHASE_ORDER_VERSION` 1, so new rows stay
  v1.
- **Rows 47 and 49** pass from (b): a migrated root records from the save's own week, and no release sits at or after
  that week, so the bijection is empty.

## Type reasoning for a clean `src`

- **The new required root.** `GameStateV45 = GameStateV44 & P15StepRoots` now requires `sharedMarket`. Every `src`
  writer of a whole live state either spreads an existing `GameState` or spreads `initialP15Roots` (worldgen,
  `convertV44ToV45`, `liftV18Control`). A search of `src`, `bridge` and `ui/src` for explicit `p15Sequence:` or
  `powerRanking:` writes finds only the archive's own update and `initialP15Roots`.
- **R1's literal.** At (b) `{ p15Sequence: true, powerRanking: true, sharedMarket: true }` satisfies
  `Record<keyof P15StepRoots, true>` exactly, so the clause holds at every commit: r2 has two keys in both, (b) and (c)
  three.
- **The `finalized` literal** spreads `{} | { sharedMarket: SharedMarketRoot }` at (b) and
  `{} | Pick<GameState, 'sharedMarket' | 'p15Sequence'>` at (c). Both are assignable.
- **Optional input under `exactOptionalPropertyTypes`.** TK spreads `{}` or `{ competitionFactor: number }`, and HT
  passes `inp` or `{ ...inp, competitionFactor: factor }` with `factor: number`. Neither writes `undefined`.
  `advanceHollywoodWeek`'s new parameter is optional, and TK passes `ReadonlyMap | undefined`, which parameters accept.
- **`computeBoxOffice`.** The default parameter types `competitionFactor: number`, and the returned object's
  shorthand keeps the declared field. The removed local means no redeclaration.
- **MI narrowings.** `return fail(…)` narrows `root` (`isRecord`), `recordedFromWeek` (the `isWeek` predicate across
  `||`), `values` (`Array.isArray`) and each `value` (`isRecord`). `fail` returns `never`, and `noImplicitReturns`
  skips `void` functions. Reason fields narrow on property access of `Record<string, unknown>`, the pattern slice 2a
  used at the refusal list and 1361-X measured clean. `state.hollywood !== null` narrows for the bijection call.
  `film.provenance === 'simulation/v1'` narrows the `IndustryFilm` union to `LiveIndustryFilm`. The `const hollywood`
  keeps its narrowing inside the batch's callbacks.
- **Inference.** `new Map(xs.map((x) => [k, v]))` takes tuple entries from the `Map` constructor's contextual type, the
  form r3 used. `typeof row.definitionVersion !== 'string'` compares a literal-typed field, which TypeScript allows.
- **Unused names.** Each commit imports only what it uses. (b)'s MI has no batch imports. (c) adds `p15PhaseTriple`,
  `MarketAssessment`, `MarketBatchMember`, `MarketExposure` and `Production`, and TK drops `requireSharedMarket` once
  its only use goes.
- **Gates.** The UI gate compiles `src/core`: MI imports nothing outside it and no Node API. The Bridge gate compiles
  `src` too. No `@ts-ignore`, `@ts-expect-error` or `any`. The casts are `raw as unknown as GameState` after the V44
  chain proves the state, `value as unknown as PersistedMarketAssessment` after the key check, two `as unknown[]`
  widenings, and `(state as Partial<GameState>).sharedMarket`.
- **Module load.** `LAWS` reads `SHARED_MARKET_DEFINITION` and `assessBatch` when MI loads. MI's runtime imports
  (`p15Phases`, `sharedMarket`, `tuning`, `math`) import nothing that reaches `save.ts` or `tick.ts`, so no cycle can
  leave them uninitialized.

## Departures from r3, and why

1. **Save45 through the step's extension points.** r3 edited a Save44 step by hand: a destructuring strip, a presence
   line and a refusal push per root. Here the market is one entry in each slice 2a list, and R1's `satisfies` clause
   ties the key list to the type.
2. **No private allocator** (1361-F ruling 5). r3's `validateP15Allocator` is gone. `sharedMarket` joins
   `P15_SEQUENCED_ROOTS`, so its "at or above `next`" and duplicate rules come from the one check, which runs after the
   market validator. r3 ran its copy inside the market validator, before the bijection. Rows 39 and 45 trace why every
   forgery still meets its own refusal first.
3. **Skipped hunks.** r3's `p15Phases.ts` and `powerRankingArchive.ts` hunks belong to slice 2a, which already has
   r3's form.
4. **Types in `types.ts`,** beside the archive's, in place of r3's types in its module.
5. **The witness.** r3 checked the map against the due set before any work, a missing factor at each rival reception,
   and, after every business, that each frozen member released. Here the first check stays and one per-studio
   equality before that studio's first reception replaces the other two, the form 1355-A §3.1 item 5 states. The two
   checks cover what r3's three did.
6. **The no-industry case.** r3 threw on a non-empty map with no industry in a separate branch. Here
   `frozenRivalMembers` runs before the early return and reads a missing industry as an empty due set, so the same
   input throws through the same check.
7. **Commit (b)'s recording start** (D1). r3 had no standalone (b).
8. **Validator hardening.** `Object.hasOwn(LAWS, …)` in place of `LAWS[…] === undefined`, so a `definitionVersion` of
   `constructor` cannot pass. Reason fields are type-checked. The bijection checks every row against its film, and a
   row naming a film from before `max(recordedFromWeek, originWeek)` now fails; r3 compared only films at or after
   that week. A player film whose concept is missing surfaces as a named disagreement instead of dropping out of the
   film map. The key message lists unexpected and missing keys.
9. **A smaller surface.** `activeExposures` and the due-set scan are private, `MarketBatchResult` drops its unused
   `week`, and `requireSharedMarket` names a missing root at the tick.
10. **No em dash in any message;** r3's witness message had one.

## Decisions, open items and uncertain items

Decisions:
- **D1. Commit (b) keeps an industry world's recording start current.** While no batch runs, tick() rewrites the
  root's `recordedFromWeek` to the week each advance produces (TK:1123 at (b)). 1355-A §3.3 defines it as the "first
  week whose releases are assessed". Under (b) nothing is assessed, so the next week is the true value. The bijection
  then covers no release, every state (b) writes passes the full validator, and a (b) save loads under (c) with the
  26-week ramp a migrated world gets. (c) replaces the write with the append. This is the third option 1361-GP-D
  finding 5 did not list: keep the chartered bijection and keep the root honest. Without D1, (b) alone would refuse
  every save past its first rival release, and row 41, which passes at r1, would regress at (b) to the bijection's
  message.
- **D2. The witness form** of departure 5.
- **D3. The batch runs every industry week,** members or not. An empty week costs one backward scan and appends
  nothing (MI:95).
- **D4. Genre lookups** read `state.concepts` for the player and `hollywood.concepts` for rivals, as H's `rivalDue` and
  `releaseHistory` do.
- **D5. A missing root fails by name at the tick** (`requireSharedMarket`) instead of with a TypeError.

Open items for the parent:
- **O1. 1361-F2 ruling 3's premise does not hold for this production.** The ruling says (a) and (b) cannot land alone,
  because the bijection would refuse every save before (c). D1 removes that: every (b) state validates, and (c) needs
  no save step to follow. The parent may keep ruling 3's fallback or restore 1361-F ruling 13's original Retune path;
  the code supports both. 1361-F2 ruling 2(b) holds on (b) as written: an empty root reads as recorded from its
  latest week with no rows, which is true there.
- **O2. K1's confinement first does real work at (c).** At week 21 all four rival releases are pressured (the comedy
  pair, and horror and romance against week 12). By reading, the pressured chain reaches only paths in
  `k1AllowedPaths`: film results, runs, the first week's revenue, account cash and periods, rival Standing, the
  `filmReleased` receipts, and fame and career events through `applyReleaseCareers` (`releaseCareers.ts:41-73`).
  Relationships read only `criticScore` (`relationships.ts:462-464`), and broadcasts only the player's own records
  (TK:863-875). One same-tick reader sits outside the allowed list: the talent market reads rival cash to afford a
  signing bonus (`talentMarket.ts:387-401`) and rival Standing to rank proposals (`:823-833`). If a market case is
  open in week 21 on seed `-03`, K1 can report an employment or proposal path. That would be a gap in 1355-A §4's K1
  list, which omits the talent market, rather than a production defect. The dry run settles it.
- **O3. Expected fallout at (c),** for the 1358-M2-style run. A test that ticks an industry world through a release
  with P > 0 and pins box office, cash, Standing, fame or career events will move. (a) and (b) move none of those.
  Whole-state digests already moved at r1, and at (b) an industry world's root changes every week.
- **O4. The 1359 RED.** P15C's helpers read `sharedMarket` rows by `p15DomainSequence` and `week`
  (`tests/helpers/p15c2-legacy.ts:186-190`). Real rows appear at (c). I did not trace the 1359 leaves; a leaf-by-leaf
  comparison with 1361-X settles it.
- **O5. Separability is cheap to measure:** the three 1355 files at each tag should give 11, 15 and 59 passes.

Uncertain items:
- **U1. Type cleanliness rests on reading.** The narrowings to watch are listed above, chiefly MI:128-188 and R1's
  literal at (b).
- **U2. Fact 8 over long runs.** The witness throws if a rival picture at `remainingTicks` 1 fails to release. By
  reading it cannot: a picture reaches 1 only by entering `releaseReady` (`operations.ts:1779-1790`), which needs no
  capacity; a rival commits every such picture (HT:391; `releaseAuthority.ts:84-100`); and a committed picture's 1 to
  0 edge has no condition (`operations.ts:1751-1763`). The 1356 harness and G2 run the witness for 6,240 weeks for the
  first time.
- **U3. Run time.** Each industry week adds one backward scan of at most 26 weeks of rows and one law call. Each save
  adds one law call per assessed week in `reconcileLaw`. The 1356 harness (81.7 s of its 300 s ceiling at r1) and the
  1355 files' time are unmeasured with the batch on.
- **U4. The generator checks.** Wave 2 changes no projection, but a fixture generator that ticks an industry world past
  a pressured release would see its values move at (c).

## Evidence limits

No test or type gate ran. The row map and the type reasoning are readings of the code against T, Ph, At, H and the
classification. The commit ids, the patch hashes, the apply checks and the `src` tree comparison are git facts.

## What the parent should measure first

1. The `src` type gates (root filtered to `src/`, UI, Bridge) at `p15a2-r2` and `p15a1-c-r1`, and ideally at (a) and
   (b), for U1 and R1's literal.
2. The three 1355 files at `p15a1-c-r1`: 59 expected. At (a) and (b): 11 and 15 (O5).
3. K1, row 16, for O2.
4. The 1356 archive and isolation files and the harness at `p15a1-c-r1`: 72 expected, the harness under its ceiling.
5. The 1359 files leaf by leaf against 1361-X (O4).
6. The full core suite with no test edit, for the fallout (O3).

Scratch files: the tree; the four patches named above; this record; the slice 2a record
`/Users/zacheryspector/studio-scratch/1361-prod/1361-E-p15a2-production-handback.md` with its "r2 (1361-F3)" section.
