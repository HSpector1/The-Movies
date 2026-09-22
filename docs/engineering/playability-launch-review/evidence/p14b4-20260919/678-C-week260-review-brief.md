# 678-C — parent brief: independent review of the week-260 measurement (contract-auditor)

Authority: record 675 NEXT675 (1); the Owner packet of 2026-09-22, step 4 ("Have contract-auditor
independently review the fixed probe and its findings: lawful fixtures, source identities, counts,
drift, reachability interpretation, privacy and any exaggerated performance/completion claim. Use
one bounded review").

Role: READ-ONLY. You do not edit, run commands or commit. One bounded pass — this is not a restart
of B.5's regression or audit cycle.

## What you are reviewing

1. `676-b5-week260-probe.ts` — the measurement harness (authored by test-author under
   `676-T-week260-probe-brief.md`; handback `676-T-report.md`).
2. `677-week260-measurement.txt` / `.json` / `.patch` — the parent's serialized record-check run of
   that harness, including its `fixedSource` field and exit status.
3. `676-P-reachability-analysis.md` — the PARENT's arithmetic note on why negative tiers cannot
   occur and why the positive half saturates. This one is mine, not a specialist's; audit it as
   adversarially as the rest.
4. The draft Owner packet and record (`679-*`), for overclaim only.

## The questions, in order

Q1 **Is the harness lawful?** Does it touch anything under `src/`, `bridge/`, `generated/`, `ui/`,
`scripts/`, `tests/`, `package.json` or any config? (`677-*.patch` is the authority: it captures
the exact tested diff over those paths. `fixedSource` must be true.) Does it import `vitest`, read
anything outside the worktree, or write any file? Does it re-implement band or drift arithmetic
instead of calling the real `currentTier` / `currentCloseness`? Any of these is a DEFECT.

Q2 **Are the campaigns the recorded standard set, minted by real engine transitions?** The four
seeds of `654-T-ledger.md` §B through `p13aGeneratedStudio`, week by week with `tick`, no player
action, no staged edge, no fixture load. Name any bootstrap or staged input the probe uses and say
whether the report discloses it. If any measured world is not one the engine could produce, say so.

Q3 **Do the numbers reconcile?** `driversMintedDerived` vs `driversMintedObserved` vs
`driversRetained + driversFolded`; the counter identity
`sharedSuccesses + sharedFailures <= sharedProductions`; the derivation
`#repeatedCollaboration = sharedProductions − 1`; the encoded-byte figures (relationships root
alone, full save, full save with the root emptied, and the gzip pair). Recompute at least two of
them yourself from the raw output. Flag any figure the report states that the raw output does not
support.

Q4 **Is the drift read honest?** Every tier in the histogram must come from `currentTier(edge, W)`,
not from the stored `closeness`. The final-week histogram and the ever-observed set must be
separate and must be labelled as such. Does the report distinguish "no Strained was observed in
this finite run" from "Strained cannot occur"? Conflating them is a DEFECT.

Q5 **Is `676-P`'s reachability proof sound?** It rests on five cited source facts —
`relationships.ts:114-120` (drift never passes the baseline), `:169-181` (drift materialized before
every delta), `:233-245` (a negative driver only lands on an edge that production already
credited), `actions.ts:339` with `employment.ts:125-127` (greenlight refuses busy talent) and
`releaseAuthority.ts:5-6` with `tick.ts:158` (a shelved ready picture stays in `activeProductions`,
so its quartet stays busy) — plus `hollywoodTick.ts:160` for the rival side. Read each one. Then
try to BREAK the bound: find any lawful sequence that puts two pending negative outcomes on one
edge across a drift window, or any other route to a value ≤ 44 on a B.5-MINTED edge. If you find
one, the floor of 46 is wrong and the Owner conclusion changes. Check the rival-saturation argument
the same way against `RIVAL_TEAM_ROLES` and `decide()`.

Q6 **Overclaim sweep.** Does anything in the record, the probe report or the Owner packet claim a
century-scale result, a native or Unity result, a performance result matched to the real bounds, an
all-green application, a balanced relationship model, Owner acceptance, or that a recommendation is
law? 260 weeks is not 6,240. Four generated seeds are not the endurance scenario. Strike every such
sentence by quoting it.

Q7 **Privacy and safety.** Does any published artifact carry a path under the Owner's home
directory outside this worktree, a personal save, a credential, or anything that is not this
project's own engineering evidence?

Q8 **Correction to record 675.** `676-P` says record 675 item 1 and 672-R finding 1 reached the
right conclusion by an incomplete route (they omit drift; the true floor is 46, not 47, and the
margin to the Strained band is two points, not three). Is that correction itself correct, and is it
recorded plainly rather than buried?

## Verdict

One of QUALIFIED / QUALIFIED WITH RECORD-ONLY ITEMS / NOT QUALIFIED, then DEMONSTRATED defects
(each with the file, line and the exact fact that contradicts the claim), then REFINE items, then
anything you could not check and why. Write it to `678-C-week260-review.md` in this folder. If a
finding requires a rerun, name the SMALLEST rerun that settles it — do not ask for the B.5 cycle
to be repeated.

## Appendix — the measured claims, added after the run (677, exit 0, fixedSource true)

The run stands. These are the claims the parent will publish from it; check each against
`677-week260-measurement.txt` rather than against this list.

| seed | edges@260 | drivers derived/observed | retained | counters P/S/F/C | Strained ever | min closeness ever | root bytes | root gzip-9 bytes |
|---|---|---|---|---|---|---|---|---|
| p13a-core-causal-01 | 27 | 675 / 675 | 195 | 300/18/84/0 | no | 48 @ w13 | 24,900 | 985 |
| seed-b | 27 | 1341 / 1341 | 195 | 588/24/168/0 | no | 48 @ w13 | 25,080 | 957 |
| p13b-s8-bridge-probe-01 | 36 | 1452 / 1452 | 246 | 672/72/72/0 | no | 48 @ w220 | 32,206 | 1,266 |
| p13-public-commercial-adoption | 24 | 1080 / 1080 | 192 | 516/30/42/0 | no | 52 @ w9 | 23,847 | 823 |

Additional parent claims to audit:

A. **The 198 gap on the default seed reconciles arithmetically.** `seatPairs` always returns six
   pairs and every pair of a take receives the `sharedProduction` credit, so each counter total is
   six times a production count. Default seed: 300/6 = 50 shared takes, 18/6 = 3 hits, 84/6 = 14
   flops, leaving 33 pictures that minted no release driver. Every counter on every seed is
   divisible by six — check that. The parent claims the 33 are overwhelmingly mid-critic-band
   releases (40–59 mints nothing by design) plus at most one in-flight picture per producing rival
   (`hollywoodTick.ts:160` returns early while `b.productions.length !== 0`). Is that bound right,
   and is it stated as arithmetic rather than as an attributed measurement?

B. **The measured minimum 48 is consistent with `676-P`'s proven floor of 46 and with record 675's
   47.** 48 is exactly the first-flop value of a low-proximity edge (52 − 4) with no drift. The
   drift path that reaches 46 needs a shelved release and rivals cannot shelve. Does the record say
   this, or does it present 48 as if it confirmed the 47 figure?

C. **Root cost.** ~900 uncompressed bytes per edge on every seed; the root is 1.4–2.1% of the
   uncompressed save and 0.5–0.7% of the gzip-9 save at week 260. The parent claims per-edge size
   is bounded (fixed fields plus at most `RELATIONSHIP_RECENT_CAP` drivers) so growth is in edge
   COUNT only. Check that claim and check that no century-scale or bounds-cleared conclusion is
   drawn from a 260-week number.

D. **Cross-studio edges exist.** e.g. `…-r03-4` with `…-r04-1` on seed-b. The parent reads this as
   talent-market churn moving people between rival rosters, which is why edge counts exceed the
   6-per-fixed-quartet base of 24. Verify the reading or correct it.
