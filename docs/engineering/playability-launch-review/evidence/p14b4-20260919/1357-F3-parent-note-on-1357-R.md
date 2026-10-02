# 1357-F3: parent note on 1357-R (why rivals stop filming), for Owner question 1357-Q1

[1357-R](1357-R-rival-stall-diagnosis.md) is a read-only diagnosis of the stall behind
[1357-X](1357-X-p15b-wave2-probe-results.md)'s Re-tune. It names three layered causes. The parent verified the first
in code and in the decide rows.

## 1. The shelving law's cash-blocked rule freezes hopeless screenplays (verified)

- **The rule.** [1344-A](1344-A-rival-screenplay-shelving-charter.md):57 defines `cashBlocked` as "at least one
  candidate was skipped by the cash gate and no candidate was viable". 1344-F2:15 repeats it.
  `src/core/hollywoodTick.ts:236` implements exactly that, and only `economicRejection` advances the count (:267).
- **The effect.** A screenplay whose every affordable package loses money stops counting toward shelving as soon as
  the dearest package goes out of reach. It then holds its index slot for good, and a full index blocks every
  commission and retry (:286-287, :301).
- **The decide rows.** From `1344-stage/s7/out/c-diag/decide-diag.jsonl`, p13a-core-causal-01 at 469a9547, the first
  flip per rival:

| Rival | Week | Screenplay | Cash above reserve | Packages out of reach | Affordable, all unviable | Best affordable contribution |
|---|---:|---|---:|---:|---:|---:|
| r01 | 262 | script-0021 | 3,350,825 | 42 | 12 | -304,871 |
| r02 | 245 | script-0022 | 7,344,214 | 6 | 48 | -180,223 |
| r03 | 144 | script-0016 | 6,491,729 | 2 | 52 | -128,959 |

  r02's counts froze at 12 for script-0021 (one short of 13) and 8 for script-0022 (1357-R §2).
- **The code is faithful to the charter.** This is a gap in the chartered law, not an implementation defect: the
  rule never asks whether a skipped package would have been viable. 1344-K stays closed. A fix is a P14 law amendment
  with its own charter, RED and production, then a fresh §7-style measurement.

## 2. The other two causes (1357-R, MEASURED or INFERRED as labelled there)

- **No route to cut costs.**
  - Nothing removes a rival facility (`hollywood.ts:128-142`).
  - Termination never applies to a full team (`hollywoodTick.ts:183-191`).
  - Every re-hire needs cash above the reserve.
  - The zero-staff floor is 41,500-46,500 a week, for good.
- **Films lose money on low-value markets.** On p13a-core-causal-01, 47 of 53 rival greenlights forecast a negative
  margin once fixed cost is counted. seed-b's market value is about twice p13a's, and its films netted 1.46-2.04M
  each. The stall also predates shelving: on the old tree r01 and r02 froze at weeks 108 and 118 with 9-10M in hand.

## 3. What this changes in 1357-Q1

Option (a), "fix rival recovery first", now has three concrete parts, each its own chartered work:
1. Amend the shelving law so an evaluation counts as an economic rejection when no unaffordable package would be
   viable. Cash then blocks only when cash is the binding constraint.
2. Give rivals a cost-cutting route: shed facilities and release staff when income stops.
3. Decide whether rival film economics on low-value markets need tuning. This touches P14's rival policy, and P15A.1's
   market pressure lowers grosses further (1355-A :202).

The recommendation stands: (a), starting with part 1. Part 1 is a narrow law fix with a measured mechanism, and it
reopens rival filming while cash remains. The parent re-probes P15B after any of the three lands.
