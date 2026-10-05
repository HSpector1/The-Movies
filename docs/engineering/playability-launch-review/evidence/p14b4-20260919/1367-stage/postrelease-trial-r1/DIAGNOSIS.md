# Post-release trial r1: static diagnosis

**The 520-week trial did not qualify because its recent-release predicate failed. Every other predicate in the qualification expression passed.** The recorded child exit 1 is the deliberate qualification refusal after result emission, not a timeout or a save-validation exception. This result does not authorize the 6344-week route or satisfy the post-2040 release cost obligation.

This diagnosis read only the completed run's three result files, archived probe/wrapper and narrowly relevant archived source. No rerun, fixture access, source/policy change or state repair was performed. Paths below are relative to `/Users/zacheryspector/studio-scratch/1361-postrelease-runs/trial-r1`; source line references are under its `tree/`.

## Qualification, evaluated exactly

`probe/postrelease.ts:133–142` validates the final save, calculates recent releases in **[312, 520)** and then evaluates:

| Predicate | Recorded evidence | Result |
|---|---|---|
| `horizon === 520` | `run.json` and `result.json`: 520 | Pass |
| `state.market.tick === 520` | `result.json.finalWeek`: 520 | Pass |
| `recentReleases > 0` | `result.json.recentReleases`: 0 | **Fail** |
| `replacementHires.length > 0` | 14 genuine accepted hires recorded, seven at input week 208 and seven at 416 | Pass |
| `state.studio.cash > 0` | Week-520 checkpoint: 276,002.93465645984 | Pass |
| Each required role meets `desiredRoster` | Week 520: actors 3, directors 1, writers 2, craft 1; exact target in `src/harness/roster-wall/campaign.ts:94–101` | Pass |

`validateSaveV45(makeSave(state))` precedes result emission at probe line 133. The complete emitted result and subsequent qualification error establish that this validation completed. This is a valid final state with failed continuing-production qualification, not an invalid-state witness.

`run.json`: mode `trial`, child exit 1, `timedOut: false`, external elapsed 47,225.584 ms, resource cap 600,000 ms. `result.json` reports 43,796.639 ms inside the probe. `stderr.txt` ends with the exact deliberate “staffing/production trial did not qualify” exception. The difference between those timers is not a game or Bridge performance finding. The final state hash is `3629164c1ff825f876c14ab4908f07247b55d864cd1d64047a6f936d2eddef74`.

## Proven observations and source causes

**Release stagnation is proven; its underlying production refusal is not recorded.** Checkpoints show 5 released films at week 52, 11 at 104, and 16 at 156. All seven subsequent checkpoints through 520 remain at 16. One active production is present at every checkpoint. The output does not contain production IDs, workflows, remaining work, release authority, pending decisions, or film-controller intent/refusal rows. It therefore establishes “16 by week 156, no later releases through 520,” not the exact last-release week or the identity/reason of a particular stalled production.

The relevant structural consequence is source-grounded: the direct-package policy targets one active production (`campaign.ts:96`), and `attemptGreenlights` returns when active production count reaches that target (`:1028–1032`). At each observed checkpoint the full active slot would prevent another greenlight under that policy. Identifying why the existing work did not complete still requires its actual decision/refusal evidence. It is not established that cash, staffing, concept exhaustion, set condition, capacity, a release refusal, or retirement caused the stall.

**All 168 recorded renewal refusals have a proven market-case cause.** `result.json.refusals` contains only `applyActions: renewContract rejected … underMarketCase; submit a proposal for the decision week instead (P14A §2.1.3)`. Six people have 24 refusals each; directors `t-dir-07` and `t-dir-01` have 12 each. No renewal succeeded; 14 subsequent `signContract` actions succeeded.

That message comes from the real `caseOpenForTalent` guard in `src/core/actions.ts:2624–2635`, before renewal offer/charge admission. The probe calls direct renewal whenever the current contract's renewal window opens (`postrelease.ts:74–79`) and has no market proposal action. Its catch preserves the input on that named refusal (`:57–62`). It then lawfully hires into genuinely missing role coverage (`:81–94`). The output proves this policy repeatedly used a refused renewal front door and later restored its roster by accepted hires. It does not prove that a market proposal would have won or preserved every incumbent.

The initial contracts are all required to end at 208 (`postrelease.ts:34–38`). The 12-week renewal window (`employment.ts:255–258`, `tuning.ts:409`) first opens at 196; the retained refusal samples begin at 196. **Initial renewal refusal cannot be the explanation for production already having stopped increasing by week 156.** Later expiry and different replacement staff could be additional obstacles, but their effect on the unreleased production is not observed here. Roster recovery by checkpoints 260 and 468 did not restore releases by 520.

**The missing film evidence is an instrumentation limitation, not proof of no refusal.** The probe passes `captureIntents: false` to `runRosterWallOperatingWeek` (`postrelease.ts:115`). In the actual helper, `attemptAction` catches film-action errors and retains a reason, but appends the intent only when `captureObserver` is true (`campaign.ts:573–639`). `resolveDecisions` returns after a refused script, casting, release or production operation (`:651–704`). `recordUnavailableIntent` also emits nothing with observation disabled. The top-level `result.json.refusals` covers only the probe's staffing `attempt`, not these film-controller decisions. Consequently “only renewal refusals are printed” must not be read as “the film controller encountered no refusals.”

The helper still computes its ordinary tick; the probe deliberately discards that result and continues with `tick(driven.stateAfterActions, {develop:true})` (`postrelease.ts:114–116`; `campaign.ts:1629–1635`). That is the declared Wave R route, not two weeks of advancement. It is not evidence of a stall cause and should remain unchanged in a diagnostic comparison.

## One bounded next route, for parent consideration

The grounded next step is an **observation-only replay of this same seed-b, full-genesis, 520-week trial**, not an economic or staffing policy revision and not a longer run. Parent may author it as a new probe/hash and exclusive output after review. Enable the existing `captureIntents: true` seam, retain `driven.intents`, and record the exact active production ID/workflow/remaining work and actual `nextStudioDecision` at the first unresolved production or refused operation, plus its actual command/reason. Retain a bounded first-occurrence record per production and refusal reason with recurrence counts, and the original 52-week checkpoints. Observe enough of the actual refusal's named dependencies to explain it; do not infer a cause from generic state-field searches.

Preserve the existing staffing decisions, action order, discarded-helper-tick convention, `{develop:true}` continuation, horizon and qualification predicates. The diagnostic must reproduce this run's final state hash and all non-observation results; a mismatch is an observer-parity finding to resolve, not permission to substitute another route. This uses an existing observation API and supplies the missing evidence without changing contracts, cash, film state, product rules or route length. Its output can support one later concrete controller correction if a lawful remedy is actually identified. No market-bidding policy change is recommended as the initial stall fix on the evidence currently available.

`postRelease` remains null and `postReleaseMeasured` false. No official week-6240 freeze or post-2040 release was reached. The parent retains implementation/execution authority; the failed trial must not be supplied as a qualifying certificate to the full wrapper.

## Evidence binding

Recorded source HEAD: `d5e2dad1e23183f1a94fe7b7d30e65ed88617f34`; source tree: `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`. The inspected archived `campaign.ts`, `actions.ts`, `tick.ts` and `employment.ts` byte-match that HEAD. Probe and executed wrapper hashes match `run.json`. This bounded source comparison is not a fresh comprehensive source/postflight audit.

| File | SHA-256 |
|---|---|
| `out/run.json` | `c4d1f1b7e8e83b4bc8a2ff1dbe50e9573bf7839966c8f19fda102bc9b128a414` |
| `out/result.json` | `4aec19502c0da86a9de96ac160526371d4d7041abb35f9f92b55edb9d34296dc` |
| `out/stderr.txt` | `e841d233a70bd8ecc6a9ce0f6b0e01cf92391376cb46bd6c749777590b832736` |
| `out/executed-wrapper.sh` | `3e58c19c16ac7e086d4d7c39881b681431cc675bea979ed6983c3b67b7f56909` |
| `probe/postrelease.ts` | `87e45c65f8972da3106c2e4d9e3382db90962377f1686fb67069a181507b505d` |
