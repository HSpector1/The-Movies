# 782 — P14C.4 DETERMINISTIC REPLENISHMENT: task expansion (DRAFT; review before RED; starts after C.2a closes)

Drafted by the parent while C.2a verifies. Authority: companion §6.5 (IMPLEMENTATION RECOMMENDATION;
every count is tuning) and §6.6; record 772's Owner ruling D1 ("retirement (§6.2) manages departures,
replenishment (§6.5) creates entrants … THE ACCEPTANCE CRITERION IS A DEMONSTRATION that mature campaigns
retain meaningful access to younger talent"); Owner direction 14 (P10 owns person/profile; `PersonId`
immutable). Measured motive (record 779): a fresh world of 84 people had 63 retired by week 1600 under
C.2a, with no entrant but rival supply.

## 1. Why C.4 runs before C.2b

C.2a makes departures real; nothing yet makes arrivals. Rival `staff()` mints its own supply, so rivals
refill, but the player's hiring market only drains. That is the more severe player-visible gap, and
record 772 names its demonstration as the acceptance criterion for mature campaigns. C.2b (the extension)
changes WHEN one person leaves; C.4 decides whether a thirty-year campaign still has actors to cast. Both
depend only on C.2a, so either order is lawful; this one is chosen by player impact.

## 2. Player behaviour

Every campaign year, a cohort of young professionals enters the industry as free agents, one person for
each person who retired from that profession during the year just ended. They age, sign, work and
retire under the same laws as everyone else. A long campaign keeps a working population and a supply of
capable-but-unproven newcomers.

## 3. Decisions

| # | item | class | rule |
| --- | --- | --- | --- |
| R1 | the primitive | companion §6.5 (P10/worldgen owns the mint) | ONE exported `mintCohortTalent(seed, id, role, age)` in `worldgen.ts` beside `generateIndustryTalent`, on its own isolated seed namespace, drawing every non-age attribute through the accepted `generateTalent` laws with the entrant's age supplied (ceilings and starting genre experience are age-scaled today, so the age must go in before them, never be patched after) |
| R2 | cadence | companion §6.5 "keyed to the P12 calendar" → DELEGATED | one request per campaign year, at the tick that produces a week with `week % 52 === 0` and `week > 0`, inside the lifecycle step after settlement |
| R3 | size | companion "sized against the population and the retirement law; counts are tuning" → DELEGATED + PROVISIONAL | per profession, the number of `retired` records whose `retiredWeek` falls in the 52 weeks ending at the request week; the request holds at most 32 people (companion hard maximum), allotted in profession order actor, director, writer, craft, and a clipped remainder is NOT carried forward (no emergency generation) and is recorded on the receipt |
| R4 | Scientists | Owner: do not invent Scientist tuning | none: no Scientist retires (C.2a D2), so none is replaced |
| R5 | entrant age | companion "era-appropriate ages" → PROVISIONAL TUNING | `truncatedNormal(24, 3, 20, 32)` on the cohort's own stream. Era dependence is NOT implemented: no selected era fact supplies one (recorded, not invented) |
| R6 | identity | direction 14; §6.5 | `uniqueIdentity('person-cohort-<week>-<role>-<n>', every id in state.talent)`; appended to `state.talent` (append-only), one `authored_exact_week` provenance row each at the request week (C.1), each id pushed onto `state.freeAgents` (the instant-sign market) |
| R7 | receipt | companion "one-to-one receipts … cohort receipt in the P14 root" | `careerLifecycle.cohorts: { week, requested: Record<role, number>, clipped: number, personIds: string[] }[]`, append-only |
| R8 | engagement | 773 D6 | hollywood-null worlds get no cohort |
| R9 | save | DELEGATED | Save V35: the `cohorts` array on the lifecycle root; validator cross-checks every person id exists, is unique across cohorts, carries an `authored_exact_week` row at the cohort week, and that `requested` equals the retirement count R3 derives from the records |

## 4. The demonstration (the acceptance criterion, measured, not asserted by construction)

A headless run of a fresh generated studio to week 6,240 (the carried endurance horizon), recording at
every tenth campaign year, per profession: population, free agents, people under 30, capable-but-unproven
people (`isProven` false), the hiring-market listing size, retirements that year and entrants that year;
and the wall-clock runtime of the run. Compared against the same run with cohorts disabled (the C.2a
baseline). Pass condition, fixed BEFORE the run: in every sampled year after year 10, every film
profession has at least one person under 30 who is unproven, and the hiring market is non-empty.
Anything short of that is reported as measured.

## 5. Tests to require (sketch)

Cohort exactly at week 52·k, never between; size equals prior-year retirements per role; the 32 clip and
its receipt; no cohort in year zero or in a null-hollywood world; ids unique, append-only, provenance
row at the cohort week, ages within [20, 32], each in `freeAgents` and signable; replay determinism and
save/load mid-year; V34 → V35 migration opens `cohorts: []`; downgrade lossless iff no cohort.

## 6. Amendments after 782-A (parent decisions)

1. **One primitive — ADOPTED, realized without a third mint.** The primitive IS the existing exported
   `generateIndustryTalent(seed, id, role, name?)`, which `staff()`'s supply and `enterRival` already call. It
   gains ONE optional argument, the entrant age, threaded into `generateTalent` so the age is fixed BEFORE the
   age-scaled ceilings and starting genre experience are drawn. Byte-identity for every existing caller: the
   `talent-age` stream is still drawn exactly once per person in the same order, and the override only
   replaces the value used; with no override the code path is unchanged. The full matched pass is the
   check (worldgen goldens, rival supply, every seeded suite). Cohorts call the same function with ids from
   `uniqueIdentity`, so their draws sit in the same per-id isolated namespace
   (`${seed}:industry-person/v1:${id}`). Provenance stays at the APPEND (C.1's governed split, record 762 §4 /
   759-C amendment 3: a mint that is discarded must not leave a row), so "writes birth provenance" is realized
   at the three append sites, not inside the mint. `uniqueIdentity` stays in `hollywood.ts` (a relocation with
   no behaviour; recorded as deferred, not dropped).
2. **Demonstration strengthened — ADOPTED.** §4 also records, per sampled year, the total population, the
   free-agent list length and the hiring-market listing length, with and without cohorts, so unbounded
   growth is visible. An added pass condition: the population at year 120 is within ±25% of the genesis-plus-
   rival-supply trajectory WITHOUT retirement (the pre-C.2a world). Outside that band is reported as measured,
   not tuned away.
