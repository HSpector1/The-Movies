# 1329-A: C8 natural-search exhaustion, measured cause, and the rival stall it exposes

Parent measurement, source unchanged from 133aca7a through 388814f7 (no `src` change in between). Probes, outputs and
the scratch-only instrumentation are archived in [1329-c8/](1329-c8/); no repository source was edited, and every
probe ran in a scratch archive.

## Scope

C8 has 42 retained rows (1325-I). This record covers the 21 that use two natural searches over
`p13aGeneratedStudio()` (seed `p13a-core-causal-01`), all new at 1302 against the 1100 baseline:

- `tests/p14b1-t4-regressions.test.ts:283` `sharedTakeOutcomes()`: a first take shared by two or more SATISFIED
  promise beneficiaries within 230 weeks (15 rows);
- `tests/helpers/p14b2-fixtures.ts:264` `rivalFixture()`: a rival-owned SATISFIED promise within 240 weeks (5 rows in
  `bridge-p14b2-trust` and `p14b2-fixture-preconditions`, plus `bridge-p14b2-trust:363`, filed under C1 with the same
  primary).

The other 22 C8 rows (`p14b4-rival-seating-preference` 13 on seed-b, `p14b4-cast-class-outcomes` 9) failed the same
way at 1100 and keep their recorded disposition (P14C.1 records 770/771: the natural witness is structurally
unreachable after materialized aging; a different seed or subject is a new fixture, not a repair).

## Measurements

1. **Natural chain** ([probe](1329-c8/probe-natural-chain.test.ts.txt)). At the 1100 baseline 6e63f4c8, rivals
   author 48 promises at week 196; the first SATISFIED outcomes arrive at week 213 (four by week 240), three of
   them evidenced by one shared take
   ([output](1329-c8/natural-chain-6e63f4c8.jsonl)). At HEAD, rivals author 26 promises (24 `APPEARANCE_COUNT`,
   2 `DIRECTING_COUNT`); none is ever SATISFIED through week 520, seven are BROKEN at 416
   ([output](1329-c8/natural-chain-head-133aca7a.jsonl)). `firstTakes` stops at 45 and industry films at 53 from
   week 140 to 520.
2. **Bisect** over the 13 `src/core` commits between 6e63f4c8 and 993e6b01 (the 1302 source), 240 weeks each
   ([table](1329-c8/bisect-240-weeks.json)): 75d70e18 and every earlier commit satisfy at week 213; **969fb459
   ("Prefer directing opportunities for credited rival candidates") is the first commit with no satisfied
   outcome**, and every later commit matches it.
3. **Rival economy** ([probe](1329-c8/probe-rival-economy.test.ts.txt)). From about week 110 no rival greenlights,
   at both sources: r01 and r02 each hold two `ready` screenplays, a full staff and $17-20M cash, and start nothing;
   cash then drains through payroll and overhead (r01 −$1.4M by week 300 at HEAD).
4. **Decide and package chooser** (scratch-only instrumentation, [diffs](1329-c8/)). From week 110 at HEAD, r01's
   `decide` (`src/core/hollywoodTick.ts:210`) has a seatable director, three actors and craft for both ready
   screenplays, with cash far above its operating reserve; `chooseIndustryPackage` evaluates all 54 packages of each
   and rejects every one at the viability gate (`src/core/hollywoodPolicy.ts:67`, `score <= holdOperatingMargin`);
   the cash gate (`:57`) never binds. Best expected incremental contribution: script-0006 −$180,586, script-0011
   −$115,976, identical every week because the inputs do not change
   ([rows](1329-c8/decide-diag-head-133aca7a.jsonl)). With two ready screenplays held,
   `activeScriptOrdinals.length >= 2` (`hollywoodTick.ts:254`) stops every new commission, so the studio can neither
   film nor write.
5. **What restarted the chain at 75d70e18** ([rows](1329-c8/decide-diag-75d70e18.jsonl)). Identical stall through
   week 207. At week 208 the new contracts give r01 a cast of three r02 people with promises (masks 6); script-0011's
   best package turns viable (+$104,759) and r01 greenlights it, the take lands at 213, and the promises are
   satisfied. At HEAD at week 208 r01's promised-cast masks are empty, its cast is its own, and both screenplays stay
   unviable (−$393,483 and −$309,225).

## Cause

- **Proximate, lawful:** the P3 candidate order in 969fb459 (the accepted credited-Actor/Director strategy, 1112-A/D
  and 1160-A) changes which rival promises are authored and which cases each rival wins at week 208. The two
  searches relied on one talent-market outcome that gave r01 a cast good enough to make a held screenplay viable.
- **Underlying, pre-existing at 6e63f4c8:** a rival that holds two ready screenplays with no viable package stalls.
  It cannot greenlight (every package fails the viability gate), cannot commission (the ready inventory is full) and
  has no rule that shelves or re-scopes an unviable screenplay, so it stalls until an external change to its staff
  happens to make one viable, or indefinitely. On this seed all four rivals stop filming by week 140.

## Why no test-only repair is proposed

- Widening the 230/240-week bounds cannot help: no rival films after week 140 through week 520 at HEAD.
- A different seed is a new fixture under the 770/771 rule and would hide the stall instead of recording it.
- Changing rival behaviour is simulation law with no charter or requirement: no rule for shelving, re-scoping or
  abandoning a rival screenplay exists in source or plans.

## Decision put to the Owner

**D-1329-1: what a rival does with a screenplay it cannot profitably make.** Options:

1. **Keep the current law.** Rivals may stall on unviable screenplays; corporate distress stays with P15B (corporate
   fate). The 21 rows stay retained until the fixtures are re-derived on a seed whose natural chain reaches its
   premise, as new fixtures, reviewed as such.
2. **Add a shelving rule by charter.** For example: a ready screenplay with no viable package for N consecutive
   decision weeks is shelved, releasing its inventory slot; the rival commissions again. This is new rival law with
   save, receipt and Bridge disclosure consequences, so it needs its own charter, RED, production and closure.

Until the Owner decides, the 21 rows stay open with this cause.
