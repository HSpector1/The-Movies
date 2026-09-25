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

## 7. Amendments after the measured baseline (record 792), parent decisions before any C.4 source

Authority for every item: companion §6.5, "the cohort schedule is sized against the accepted population and
the retirement law, and its counts are tuning", and record 772's Owner ruling that the acceptance criterion
is the demonstration. Every item is DELEGATED + PROVISIONAL TUNING unless marked otherwise.

1. **R3 REPLACED: deficit plus youth floor.** The measured motive is 792 §4: under the old 1:1 rule, the paper
   model passed the fixed criterion in 3 of 200 seeds. At a request week `w`, for each film profession `p` in
   the order actor, director, writer, craft:
   - `accepted_p` = `TUNING.COHORT_ACCEPTED_POPULATION` = actor 40, director 14, writer 16, craft 14. This is
     the measured fresh-founding composition (60 genesis people per `ROLE_BLOCKS` plus 24 founding-rival
     supply, 792). It applies to every world, including migrated legacy worlds.
   - `active_p` = people of `p` in `state.talent` BEFORE this request's entrants with no `retired` record whose
     `retiredWeek <= w`. Announced and finishing people count as active. Rival-minted supply counts.
   - `young_p` = at least one of those active people has materialized age `< 30` at `w`.
   - `request_p = max(accepted_p − active_p, young_p ? 0 : 1)`.
   - The total is clipped at 32, allotted in profession order; the clipped remainder is not carried forward
     and is recorded on the receipt.
   Consequences, stated now so the RED can pin them: the week-52 request can be non-empty through the floor
   (seed `p14c4-demo-03` has no writer under 30 at week 0). A migrated world's earlier retirements are
   restored by the deficit, so the at-a-cohort-week boundary loss named in the T0 brief disappears. A deep
   deficit reaches the clip naturally (T0 axis Y8).
2. **R5 unchanged:** entrant age TN(24, 3, 20, 32) on the cohort's own stream. A floor entrant can therefore be
   drawn at 30 or older (about 2%), and the floor fires again the following year. Recorded, not tuned away.
3. **R7 receipt:** `{ week, talentCountBefore, requested: Record<film role, number>, clipped, personIds }`, with
   exactly one receipt at EVERY request week, including an empty request. `talentCountBefore` is
   `state.talent.length` when the request is computed; entrants occupy the following indices in `personIds`
   order.
4. **R9 validator re-derives each receipt; it never trusts it.** It rebuilds `active_p` and `young_p` from
   `state.talent.slice(0, talentCountBefore)`, the records and `ageAt(row, w)`, recomputes the request and the
   clip, and checks that `personIds` equals the ids at `talentCountBefore …`, that each entrant has the right
   profession, an `authored_exact_week` row at `w` and an age in [20, 32], and that receipts sit at strictly
   increasing `w % 52 === 0`, `0 < w <= tick`. Completeness (one receipt at every request week since the
   boundary) is NOT validated. That is a deliberate limit, recorded here: it would need a V35 boundary week
   plus hollywood origin-week arithmetic, and the RED covers cadence directly. Every re-derivation rests on
   `state.talent` being append-only and order-preserving; T0 measures that on real continuations.
5. **Demonstration pass condition STRENGTHENED, fixed now, before any C.4 run.** Run
   `792-c4-demonstration-harness.mts` (it samples every 26 weeks) at the C.4 candidate on seeds
   `p14c4-demo-01/02/03`. PASS requires, on EACH seed, at every tenth campaign year after year 10 (weeks
   1040 … 6240) AND at the mid-year week 26 weeks before each of them: every film profession has at least one
   active unproven person under 30, the hiring listing is non-empty, and the active population at week 6,240
   lies in [63, 105] (±25% of the reference arm's constant 84). The floor makes the cohort-week youth check
   close to true by construction, so the mid-year samples carry the evidence. The listing clause is close to true by construction for the same reason (782-A2 item 2):
   `hiringMarketIds` lists every free agent first (`employment.ts:404-409`), so one unsigned entrant keeps the
   listing non-empty without any working market. It is kept as a gate, since it failed in the C.2a arm, but it
   proves supply, not a functioning market. The listing-level count of unproven people under 30 is REPORTED,
   not gated. Paper-model expectation per seed: 0.935 for both youth
   checks together (measured joint, 792 §4, after 782-A2), so about 0.82 that all three seeds pass. A miss is reported as measured, never tuned after
   the run.
6. **Scope of what the demonstration can show (F-792-1).** The driver is a passive player in an industry whose
   rivals are insolvent from week 260. It demonstrates SUPPLY. It cannot show access in a live economy, where
   entrants gain credits and become proven early; the C.4 checkpoint says so in those words.

## 8. Amendments after 782-A2 (bounded review of §7, contract-auditor, REFINE), parent decisions

1. **Joint pass rate:** the paper model now prints the joint of both youth checks; §7.5's union bound is
   replaced by the measured joint in record 792 §4 (item 1).
2. **Listing clause disclosed** as close to true by construction, in §7.5 (item 2).
3. **F-792-1 wording** corrected in 792 §2 (item 3).
4. **`accepted_p` stays the constant (item 4 considered and declined, with the reason).** A per-world
   "founding population" is not reconstructible for migrated worlds: their people carry
   `legacy_age_anchor` rows dated at the V33 boundary, which erase who existed at the hollywood origin. The
   only per-world alternative is the population at the V35 boundary, and that would lock a late C.2a world
   (6 active people at week 2600, 792) into replacing nobody. The constant is the accepted P10 + founding
   composition, verified exact by 782-A2 (`worldgen.ts` ROLE_BLOCKS + 4 founding rivals ×
   `RIVAL_TEAM_ROLES`). A world with extra people, for example authored ones, simply requests nothing until
   its population falls below the constant.
5. **Tests added to §5 (item 5):** a solvent rival's `staff()` may take a cohort entrant on the next tick
   (it scans `state.talent`, `hollywoodTick.ts:142`). That is lawful, and a test pins that the entrant is
   hireable, not that it stays free. `state.freeAgents` is never pruned (retired ids since C.2a, unsigned
   entrants now); the demonstration REPORTS its length per sample, and no pruning is invented here. The
   cohort's entrants form one contiguous block in `state.talent` (the receipt's re-derivation depends on it).
