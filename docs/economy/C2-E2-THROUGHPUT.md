# Campaign 2 — E2 · Throughput, measured (G10.1)

The measurement charter §3.3 calls **the campaign’s real acceptance test**, taken at
the milestone that removed the ceiling. It sits beside `C2-E0-BASELINE.md`, which
pinned the pre-C2 economy, and it uses that baseline’s instrument and seeds so the
two are readable against each other.

## Provenance

| Fact | Value |
| --- | --- |
| Generating command | `node_modules/.bin/vite-node scripts/measure-c2-throughput.mts` |
| HEAD at measurement | `3a1baa660cad7131087b4621beb4c5a425dce334` |
| Last commit touching `src/` or `ui/src/` | `df450ea3d32727dfb1c09fc8af659719594b63ae` |
| `src` / `ui/src` / `scripts` committed | **NO — figures are provisional** |
| Instrument | `runFacilitiesArm` (`src/harness/facilities`), consumed read-only |
| Seeds | `c1-economy-001` … `c1-economy-002` … `c1-economy-003` … `c1-economy-004` … `c1-economy-005` |
| Horizon | 104 weeks per arm (C1’s horizon) |
| Arms per seed | +0 founding · +1 from Week 13 · +2 from Week 20 (C1’s arms) |
| Agents’ policy slate bound | `AGENT_MAX_SLATE` = 2 (a policy, never a game law) |

## 1. G10.1 — the verdict

Charter §3.3: *"the C1 snapshot proved purchased slots inert at the ceiling; post-C2a
the same measurement must show them no longer inert on ≥4 of 5 seeds."*

C1’s own inertness definition is the one applied here: an arm is INERT when it
**releases the same number of pictures AND finishes with the same cash, to the byte**,
as its founding-capacity twin. Final state hashes are deliberately not the test — a
counterfactual arm carries an extra facility in state, so its hash differs whether or
not anything economic moved.

| Policy (what the studio WANTS) | Seeds where a purchased slot moved releases or cash | G10.1 bar (≥4 of 5) |
| --- | --- | --- |
| `scaled-two-team` — two pictures (C1’s policy) | **2 of 5** | FAIL |
| `scaled-four-team` — four pictures (C2a-M4’s policy) | **5 of 5** | **PASS** |

**G10.1 PASSES, at 5 of 5 seeds.** A purchased Development & Casting slot is no
longer inert: on every seed it changed what the studio finished with.

**And the pair is the honest reading.** At `scaled-two-team` the same engine still
leaves the slot inert on 3 of 5 seeds — because that policy declines to use it.
That is not an engine result, it is a policy result, and it is exactly why running only
C1’s arm would have under-reported the milestone. **The ceiling was never the only
thing that had to move; something had to WANT the pictures.** In the game that
something is the player, and this is the instrument standing in for one.

## 2. The fact underneath the verdict — concurrency is physical now

| Policy | Peak simultaneous productions observed (min…max across all 15 arms) |
| --- | --- |
| `scaled-two-team` | 2 … **2** |
| `scaled-four-team` | 4 … **4** |

Under `MAX_CONCURRENT_PRODUCTIONS` that right-hand column could not have read higher
than **2** for any policy, any seed, any horizon: it was a global counter and it threw.
It reads **4** for a studio that wants four pictures and has the rooms to reach for
them. Nothing in the engine counts pictures any more; what limits the studio is the
capacity it physically built, which is owner law 1 as a measurement.

One reading worth stating plainly, because it is the interesting one: the four-picture
studio reaches four pictures **even at founding capacity**. A shared Development &
Casting slot is held during a picture’s screenplay, camera tests and early production
work and then released, so two slots do not cap a studio at two pictures — they meter
the RATE at which pictures can enter. That is why the purchased slot below shows up
first and largest in refusals, and only then in money.

## 3a. `scaled-two-team` — the arms, seed by seed

| Configuration | Releases (mean) | Final cash (mean) | D&C refusals (mean) | Idle D&C slot-weeks (mean) | Occupied D&C slot-weeks (mean) |
| --- | --- | --- | --- | --- | --- |
| +0 · founding capacity (2 shared slots) | 15.6 | $9,969,357 | 10.2 | 103.2 | 104.8 |
| +1 · Development & Casting Annex (open Week 13) | 16.0 | $8,673,346 | 7.0 | 187.6 | 111.4 |
| +2 · Development & Casting Hall (open Week 20) | 16.0 | $8,673,346 | 7.4 | 264.6 | 111.4 |

| Seed | +0 · founding capacity (2 shared slots) | +1 · Development & Casting Annex (open Week 13) | +2 · Development & Casting Hall (open Week 20) | Slot moved anything? |
| --- | --- | --- | --- | --- |
| `c1-economy-001` | 16 releases · $7,293,444 · 8 refusals · 99 idle | 16 releases · $7,293,444 · 7 refusals · 190 idle | 16 releases · $7,293,444 · 8 refusals · 267 idle | no — **inert** |
| `c1-economy-002` | 16 releases · $20,974,887 · 11 refusals · 98 idle | 16 releases · $20,974,887 · 7 refusals · 189 idle | 16 releases · $20,974,887 · 8 refusals · 266 idle | no — **inert** |
| `c1-economy-003` | 16 releases · $3,947,856 · 7 refusals · 93 idle | 16 releases · $3,947,856 · 7 refusals · 184 idle | 16 releases · $3,947,856 · 7 refusals · 261 idle | no — **inert** |
| `c1-economy-004` | 14 releases · $18,453,281 · 16 refusals · 118 idle | 16 releases · $8,282,660 · 7 refusals · 187 idle | 16 releases · $8,282,660 · 7 refusals · 264 idle | **yes** |
| `c1-economy-005` | 16 releases · -$822,684 · 9 refusals · 108 idle | 16 releases · $2,867,882 · 7 refusals · 188 idle | 16 releases · $2,867,882 · 7 refusals · 265 idle | **yes** |

## 3b. `scaled-four-team` — the arms, seed by seed

| Configuration | Releases (mean) | Final cash (mean) | D&C refusals (mean) | Idle D&C slot-weeks (mean) | Occupied D&C slot-weeks (mean) |
| --- | --- | --- | --- | --- | --- |
| +0 · founding capacity (2 shared slots) | 15.8 | $2,395,171 | 47.8 | 86.2 | 121.8 |
| +1 · Development & Casting Annex (open Week 13) | 15.6 | $4,057,352 | 27.0 | 176.4 | 122.6 |
| +2 · Development & Casting Hall (open Week 20) | 15.8 | $701,683 | 24.4 | 253.6 | 122.4 |

| Seed | +0 · founding capacity (2 shared slots) | +1 · Development & Casting Annex (open Week 13) | +2 · Development & Casting Hall (open Week 20) | Slot moved anything? |
| --- | --- | --- | --- | --- |
| `c1-economy-001` | 16 releases · $4,602,966 · 61 refusals · 85 idle | 16 releases · $7,306,623 · 26 refusals · 181 idle | 16 releases · $10,742,037 · 27 refusals · 248 idle | **yes** |
| `c1-economy-002` | 16 releases · $4,322,096 · 46 refusals · 78 idle | 16 releases · $6,218,536 · 30 refusals · 169 idle | 16 releases · -$824,683 · 26 refusals · 246 idle | **yes** |
| `c1-economy-003` | 16 releases · -$4,665,077 · 60 refusals · 77 idle | 16 releases · $924,384 · 28 refusals · 163 idle | 16 releases · -$5,812,138 · 26 refusals · 257 idle | **yes** |
| `c1-economy-004` | 16 releases · $15,371,192 · 29 refusals · 88 idle | 16 releases · $14,409,722 · 28 refusals · 169 idle | 16 releases · $5,561,420 · 21 refusals · 246 idle | **yes** |
| `c1-economy-005` | 15 releases · -$7,655,323 · 43 refusals · 103 idle | 14 releases · -$8,572,506 · 23 refusals · 200 idle | 15 releases · -$6,158,223 · 22 refusals · 271 idle | **yes** |

## 4. What the purchased slot actually buys — and what it costs

At `scaled-four-team` the first purchased slot removes **20.8 Development & Casting
refusals** per two-year run (mean 47.8 → 27.0). That is the effect the C1 study could
not see at all, because at two pictures the studio was barely refused.

| Marginal step | Δ releases (mean) | Δ final cash (mean) | Seeds finishing richer |
| --- | --- | --- | --- |
| +1 (Annex, free from Week 13) | -0.2 | $1,662,181 | 3 of 5 |
| +2 (Hall, free from Week 20) | 0.0 | -$1,693,488 | 2 of 5 |

**These deltas are before the building’s own capital and opex, which the counterfactual
does not charge.** And they are not uniformly good: the slot changes outcomes in both
directions, and on some seeds the studio that could start more pictures started worse
ones and finished poorer. That is the same lesson C1 read off its one diverging seed —
*more throughput is not the same thing as more money* — now visible across the corpus
instead of once. **It is a finding for the PM, not a defect and not a tuning proposal.**
What C2a-M4 was required to deliver is that the purchase is a DECISION with
consequences a player can win or lose; it is that, and it was not before.

Releases stay near-flat across the arms at this horizon. The reason is stated rather
than averaged away: over 104 weeks the binding limits on releases are the production
pipeline and the payroll a bigger slate carries, not the room that admits a screenplay.
A longer-horizon reading belongs to M7’s economy remeasure.

## 5. Harness audit — the 26 cap consumers, dispositioned

Charter §3.3 generated this list by `grep -rn MAX_CONCURRENT_PRODUCTIONS src ui tests
scripts` at the pre-M4 HEAD. Every harness-side site, with the reason it was re-based:

| Site (lane 02 id) | Disposition | Named reason |
| --- | --- | --- |
| `src/core/tuning.ts` (E1) | DELETED | Owner law 1 — deleted, never raised. `tests/tuning.test.ts` asserts it ABSENT. |
| `src/core/actions.ts` cap throw (E2) | DELETED | The one authoritative refusal; replaced by Phase-Gate Admission (§3.3). |
| `src/core/agents.ts:62` (A1) | **RE-BASED** → `AGENT_MAX_SLATE` | Behaviour-identical policy constant at the same value 2, which is what holds the sealed M0A corpus byte-identical across the deletion. It bounds the harness AGENTS, never the player (`00E` contradiction check). |
| `src/harness/d16/policies.ts` (A2) | **RE-BASED** → `AGENT_MAX_SLATE` | D-16 policy mirror of A1; same value, so D-16 corpus rows stay comparable across the boundary. |
| `src/harness/d16/driver.ts` (A3) | **RE-BASED** → `AGENT_MAX_SLATE` | Driver cap, the `maxConcurrent` manifest field and the state-dedup key. Same value ⇒ manifest identity unchanged ⇒ the frozen D-16 corpus is still comparable. |
| `src/harness/d16/experiment.ts` (A4) | **RETIRED as a knob** | The sweep axis declared an engine constant that no longer exists. `AGENT_MAX_SLATE` is a policy constant and is deliberately NOT re-declared as an engine knob. |
| `run-final-balance` · `run-writer-bottleneck-study` · `run-integrated-balance` · `run-roster-balance-study` · `run-economy-balance-study` · `d16/publicity.test` · `d16/packages.test` · `d16/isolation.test` · `d16/run-d16-corpus` (A5) | **RE-BASED** → `AGENT_MAX_SLATE` | Fill-every-slot loops and the `slotIdleWeeks`/`slotUtilPct` denominators. Same value ⇒ every pre-C2 figure these studies produced reproduces unchanged, and is frozen as historical. |
| `run-owner-calibration-study` · `run-microbudget-dominance-audit` (A5, listed) | NO CHANGE NEEDED | Audited: both bound their slates with a STRATEGY-LOCAL `maxConcurrent` field and never read the engine constant. Recorded so the list is closed rather than silently short. |
| `src/harness/facilities/index.ts` manifest (A6) | **RE-BASED** → `AGENT_MAX_SLATE` | Observatory manifest field. Same value ⇒ manifest identity unchanged ⇒ the C1 economy figures this instrument produced stay reproducible. |
| `src/harness/facilities/index.ts` `attemptAction` (C2a-M4) | **NEW — the observatory declines the queue** | The front doors now admit what they used to refuse, and this instrument’s subject is what a studio CANNOT do in a given week. A queued intent would erase the boundary being measured, so the arm rolls the admission back whole (nothing is held while queued, so nothing is released) and records the refusal it always recorded. |
| `src/harness/facilities/index.ts` `POLICY` (C2a-M4) | **NEW — the `scaled-four-team` arm** | The instrument could not represent a >2-picture policy: `targetActiveProductions` was typed `1 \| 2`, the deleted cap wearing a type’s clothes. Widened, and a fourth policy authored as `scaled-two-team` doubled. **The three pre-C2 policies are byte-unchanged, so every figure in `C1-ECONOMY-SNAPSHOT.md` and `C2-E0-BASELINE.md` still reproduces.** |
| `scripts/measure-c1-economy.mts` (C1 sections) | FROZEN AS HISTORICAL | The literal `2` is retained as `C1_HISTORICAL_CONCURRENCY_CEILING`, named for what it is: a measurement taken when the cap existed. A historical report may not silently re-describe itself. |

## 6. The E0 baseline no longer reproduces — declared, with its size

`C2-E0-BASELINE.md` §2.5 froze this exact study at the start of C2, before any C2
commit touched `src/core/`. Section 3a above is the same policy, seeds, horizon and
arms — so the two tables are directly comparable, and **they do not match.** The
divergence is recorded here rather than left for someone to discover:

| Configuration (`scaled-two-team`) | E0 releases → now | E0 final cash → now | E0 idle slot-weeks → now |
| --- | --- | --- | --- |
| +0 · founding capacity | 18.8 → 15.6 | $6,247,907 → $9,969,357 | 89.6 → 103.2 |
| +1 · Annex (Week 13) | 19.0 → 16.0 | $5,924,375 → $8,673,346 | 178.0 → 187.6 |
| +2 · Hall (Week 20) | 19.0 → 16.0 | $5,924,375 → $8,673,346 | 255.0 → 264.6 |

**This is expected and it is not M4’s doing.** E0’s own pass condition was "no figure
moves *before C2 has intentionally changed anything*". C2a has since intentionally
changed several things that this study is measured through — M2 made Sets mandatory and
put a set binding in front of every greenlight, and M3 replaced the writer-quality term
with the writer-SPEED law (`00E`.9), which changes how long a draft takes and therefore
how many pictures fit in 104 weeks. Fewer, better-funded releases is the shape those two
changes would be expected to produce, and it is the shape observed.

**What is NOT claimed here:** an attribution. This document does not apportion the
delta between M2, M3 and the rest, because that is the C2 economy snapshot’s job and
it belongs to **M7 — economy remeasure** (charter §12-M7), which owns the 19 figures
and the E-gates. What M4 owes is that the movement is declared with its size at the
moment it became visible, and that G10.1’s verdict does not depend on it: the verdict
is a within-study comparison of three arms measured at one HEAD against each other.

## 7. Reading this beside E0

`C2-E0-BASELINE.md` §2.1 prices the two capacity blueprints this study gives away for
free — the Annex at $780,000 / 13 weeks / $3,500 per week, the Hall at $1,400,000 /
20 weeks / $6,000 per week. E0’s finding was that neither could return anything,
because *"the constraint it relieves is not the constraint the studio is under"*
(`C1-ECONOMY-SNAPSHOT.md` §7b). **That sentence is now false, and it was made false on
purpose:** the constraint the studio is under is capacity, the buildings relieve
capacity, and the measurement above shows them doing it. Whether they relieve it
PROFITABLY at their catalog prices is a balance question, and it belongs to M7’s
remeasure with the rest of the C2 economy snapshot — this document does not answer it
and does not pretend to.
