# 676-T — handback: the §8 :645 week-260 relationship probe (test-author, AUTHOR ONLY)

Authority: `676-T-week260-probe-brief.md` in this folder (record 675 NEXT675 (1); P14 plan B.5
expansion (9); companion §8 :645; 672-R's outstanding-measurement finding).

## What I produced

| | |
|---|---|
| File | `docs/engineering/playability-launch-review/evidence/p14b4-20260919/676-b5-week260-probe.ts` |
| Lines | 220 (19 are the provenance header; 201 below it) |
| sha256 | `4e7438d4e141769f363314431fa24ae5219f51e1a56764d3d4cf772f491c9df2` |
| Report | `docs/engineering/playability-launch-review/evidence/p14b4-20260919/676-T-report.md` (this file) |

Both files are new and untracked. I committed nothing, staged nothing, and ran nothing against the
record-check evidence runner. Nothing under `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`,
`tests/`, `package.json` or any config was opened for write. `git status --short` after my work
shows exactly three untracked paths: the parent's brief, the probe and this report.

The brief asked for under about 200 lines and the file is 220. The overage is the header block and
the inline derivations the brief itself required (the `repeatedCollaboration` derivation comment,
the stored-band note, the mint-count note). Cutting to 199 would have deleted provenance, so I kept
the comments and am naming the overage here instead.

## The exact command

```
cd /Users/zacheryspector/The-Movies-headless-program
node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/676-b5-week260-probe.ts
```

Redirect stdout to the archive path you choose. The probe writes no file itself.

Output shape: one `PROBE676_SELF` provenance line first (self sha256, week bound, cap, seeds, node
version, platform, arch), then one compact human block per seed, then `totalElapsedMs <n>`, then a
single final line beginning `JSON ` carrying the whole structured result. That JSON line measured
24,907 bytes on my run. Exit code is 0 on success; nothing is caught, so any throw exits non-zero.

## Runtime forecast

17.9 seconds wall clock for all four seeds, single process, no warm cache assumption. Per seed:
5.4 s, 4.5 s, 3.6 s, 4.3 s. Add roughly 1 s for vite-node startup. Forecast for the parent: under
one minute, one process, no parallelism, no retry expected. Measured on Node v20.20.2, darwin, x64.

## What I actually ran

I ran the probe directly twice from the worktree root, both times at the full `WEEK_BOUND = 260`.
I never lowered the week bound; no calibration edit was made or reverted.

- Run 1, against sha256 `72acebfd…` (the file before I added duplicate-mint detection): EXIT 0,
  33,116 bytes of output, full 260-week run completed on all four seeds.
- Run 2, against the handed-back sha256 `4e7438d4…`: EXIT 0, full 260-week run completed on all
  four seeds.

Determinism: I diffed the two runs with the elapsed-millisecond lines, the self sha and the new
line suppressed. Every measured quantity is byte-identical between runs. Only `totalElapsedMs`
moved (17781 then 17862), and that value is environment, never folded into a measurement.

Before writing the probe I ran one throwaway timing script from the session scratchpad (outside the
worktree, absolute imports, deleted from consideration) to size the forecast: 40 ticks of the
default seed, which reported campaign start at week 0 and 24 edges by week 20. It touched no
project file.

## The measured result (both runs, identical)

Four campaigns, `p13aGeneratedStudio(seed)`, zero player actions, `tick` called once per week from
week 0 to week 260. Every edge exists because rival studios shot first takes; `industry.firstTakes`
feeds the same seam the player's takes do.

| seed | edges@260 | firstEdgeWeek | shared P/S/F/C | max P on one edge | retained | at cap | derived | observed | folded |
|---|---|---|---|---|---|---|---|---|---|
| p13a-core-causal-01 | 27 | 8 | 300/18/84/0 | 17 | 195 | 24 | 675 | 675 | 480 |
| seed-b | 27 | 9 | 588/24/168/0 | 27 | 195 | 24 | 1341 | 1341 | 1146 |
| p13b-s8-bridge-probe-01 | 36 | 9 | 672/72/72/0 | 28 | 246 | 30 | 1452 | 1452 | 1206 |
| p13-public-commercial-adoption | 24 | 9 | 516/30/42/0 | 28 | 192 | 24 | 1080 | 1080 | 888 |

No `COUNT-MISMATCH` line printed on any seed. No edge-week reached the recent cap of 8 drivers
inside one week, so the observed count undercounts nothing. `maxRetainedPerEdge` is 8 on all four
seeds, which is the cap itself.

Tier histograms at 260, drifted read against stored read:

| seed | drifted | stored (= peakTier on all four seeds) |
|---|---|---|
| p13a-core-causal-01 | Acq 3, Friends 1, CloseFriends 12, Inseparable 11 | Acq 3, Inseparable 24 |
| seed-b | Acq 2, Colleagues 1, Inseparable 24 | identical to drifted |
| p13b-s8-bridge-probe-01 | Acq 4, Colleagues 2, Friends 1, CloseFriends 2, Inseparable 27 | identical to drifted |
| p13-public-commercial-adoption | Inseparable 24 | identical to drifted |

Every seed reads zero in Nemeses, Enemies and Strained at 260.

Ever-observed tiers, over every week from the first edge to 260 and every edge alive at that week:
all four seeds read exactly `Acquaintances, Colleagues, Friends, CloseFriends, Inseparable`. First
read weeks are near-identical across seeds (Acquaintances and Colleagues at week 8 or 9, Friends
17 or 18, CloseFriends 26 or 27, Inseparable 36 to 45).

Strained: never read, on any seed, at any week, by any edge. `minClosenessEverObserved` is 48
(p13a-core-causal-01 week 13, seed-b week 13, p13b-s8-bridge-probe-01 week 220) and 52
(p13-public-commercial-adoption week 9). The Strained ceiling the probe derives from
`RELATIONSHIP_TIER_FLOOR.Acquaintances - 1` is 44, so the closest any campaign came was 4 points
above it.

Encoded bytes (`JSON.stringify` utf8; gzip level 9):

| seed | root bytes | save bytes | save with root emptied | root marginal | save gzip9 | marginal gzip9 |
|---|---|---|---|---|---|---|
| p13a-core-causal-01 | 24,900 | 1,211,649 | 1,186,751 | 24,898 | 126,359 | 985 |
| seed-b | 25,080 | 1,869,955 | 1,844,877 | 25,078 | 185,492 | 957 |
| p13b-s8-bridge-probe-01 | 32,206 | 2,088,864 | 2,056,660 | 32,204 | 212,069 | 1,266 |
| p13-public-commercial-adoption | 23,847 | 1,715,875 | 1,692,030 | 23,845 | 173,494 | 823 |

`makeSave(state)` succeeded at week 260 on all four seeds, and `validateRelationshipsRoot(state)`
plus `requireRelationshipsRoot(state)` passed on all four final states. The measured worlds are
proven lawful, not assumed lawful.

## Four observations the parent should carry forward

1. **The paper claim is corroborated and not proved.** 672-R finding 1 and record 675 item 1 argue
   that no naturally minted edge can reach Strained under the landed constants, with a predicted
   worst-cycle bottom of 47. Four campaigns across 1,040 advanced weeks observed a minimum of 48
   and never read a negative tier. A finite run that observes no Strained does not prove
   impossibility. The measured claim ("these four campaigns never produced one") and the
   arithmetic claim ("none can") stay separate, and the probe only supports the first.
2. **Rival-team saturation is visible in the edge counts.** The default seed held 24 edges at week
   20 and 27 at week 260, while `sharedProductions` on a single edge reached 17 to 28. The industry
   re-shoots the same fixed casts rather than forming new pairs. That is the 658-W saturation
   observation, now with a number on it at the full horizon.
3. **Drift changes the reading in one of four campaigns.** Only p13a-core-causal-01 shows the
   drifted histogram diverging from the stored one at 260 (13 of 24 stored-Inseparable edges read
   down to CloseFriends or Friends). On the other three seeds every edge had an event inside the
   52-week grace window, so drift contributes nothing at this horizon. Any consumer tested only on
   the busy seeds will not exercise the drift path.
4. **Most shared takes mint no release driver.** On the default seed, 300 shared productions
   produced 18 successes and 84 failures, leaving 198 with neither. The probe does not attribute
   that gap; the candidates are the mid critic band (40 to 59, which mints nothing by design) and
   pictures whose release falls outside the window or carries no joined take. Attribution needs a
   separate measurement and I did not make one.

## Assumptions I made, stated so they can be overturned

- "Start" means the state `p13aGeneratedStudio(seed)` returns, which is week 0 on all four seeds. I
  tick to 260, which is 260 ticks per seed.
- I observe after each `tick`, so weeks 1 through 260 are observed and week 0 is not. No edge
  exists at week 0 on any seed (the first mints at week 8 or 9), so no observation is lost.
- `edgeId` is stable identity across weeks. The root appends by ordinal and never reorders or
  removes, and the validator pins `edgeId` to the array index, so keying the week-by-week counts by
  `edgeId` is sound. The probe still checks for observed ids absent from the final root and reports
  them as `orphanObservedEdgeIds` (empty on all four seeds).
- "Stored band without drift" is computed by calling the real `currentTier` with the anchor set to
  the read week, which puts the read inside the grace window and returns the stored value unchanged.
  The probe never re-implements `bandOf`.
- `driversMintedObserved` counts, at each observation week W, the drivers in `edge.recent` stamped
  `week === W`. Nothing stamped W can have been counted before W, so the brief's "not already
  counted at an earlier week" clause is satisfied by construction.
- The save with the root emptied is the same `makeSave` output with `state.relationships` replaced
  by `[]` on a shallow copy. I did not re-validate that derived object, because emptying the root is
  exactly the projection `projectRelationshipsPreV31` treats as lossless.

## One check I added beyond the brief

The brief's derived-versus-observed identity has a blind spot, and I closed it rather than leaving
it unnamed. `advanceRelationshipsWeek` documents idempotency by `(edgeId, kind, ref)` but enforces
it by scanning `edge.recent`, which holds at most 8 entries. A driver re-minted after its entry
folded out would raise the exact counter and the observed count together, so the derived and
observed totals would still agree and the mismatch check would stay silent. The probe therefore
also keeps an unbounded set of `edgeId|kind|ref` mint keys and prints a `DUPLICATE-DRIVER-MINT`
line if one repeats. Result on all four seeds: 675, 1341, 1452 and 1080 distinct keys against the
same totals, zero duplicates. Idempotency held for the whole 260-week horizon on the standard set.

## What I could not measure

- `sharedCancellations` is 0 on every seed, necessarily. `recordCancelledAfterFirstTake` is reachable
  only through the player cancel verb, and the brief forbids player action. The cancel driver is
  unmeasured by this probe, not measured-as-zero-in-general.
- Negative tiers have no natural producer in these campaigns, so the `Nemeses` and `Enemies` rows of
  every histogram are structurally zero. RULES 1 additionally collapses both bands into a `Strained`
  read, because B.5 mints no conflict record, so `Nemeses` and `Enemies` cannot be read at all today
  regardless of closeness. The probe prints all eight ladder members with zeros so this is visible.
- The endurance scenario named in P14 plan B.5 expansion (9) is not covered. The brief scoped me to
  the four standard seeds and I did not invent a fifth campaign.
- I did not attribute the 198 driver-less shared takes on the default seed (observation 4 above).

## What this probe cannot establish

It cannot establish impossibility. Four seeded campaigns advanced to week 260 with no player action
are a sample of the reachable world, not the reachable world: they exercise only the rival
production schedule those seeds generate, they never exercise the cancel driver, they never
exercise a player-owned take, and they stop at one horizon. The absence of a Strained read here is
evidence that the landed constants do not produce one on the recorded standard set, and it is not a
proof that no campaign can. It also cannot establish that the constants are correct, pleasant, or
legible to a player: it measures what the engine currently produces, and the question of whether an
eight-rung ladder whose lower four rungs are unreachable is the intended design stays an Owner
question. Finally, a green probe is not acceptance. Nothing here has been through the evidence
runner, and I ran no test suite of any kind.

---

## Follow-up of 2026-09-22 (after the 678-C review): comment fixes and the floor witness

**A. Two false comments corrected in `676-b5-week260-probe.ts`, comments only.** New sha256
`198337d70e105b0ce572ee5efcccb28ae4d5a3adbbfe4c3f416a6d0dc2051718`, 220 to 230 lines, diff 7 lines
removed / 17 added, every one of them inside a comment block. Proof no executable line moved:
reversing exactly these two blocks in a scratch copy reproduces the archived sha256
`4e7438d4e141769f363314431fa24ae5219f51e1a56764d3d4cf772f491c9df2` byte for byte. The removed text
is quoted in full because it exists nowhere else; the replacements are cited by line range because
they are in the file the reader has.

A1 removed (old 33-35), replaced at 38-45:

    /** The measured horizon. 260 is not arbitrary: it is the drift return horizon,
     * so the whole §5.5 drift window sits inside the run. Named so a calibration run
     * can lower it — the handed-back file measures RELATIONSHIP_DRIFT_RETURN_WEEKS. */

The replacement states that a completed return needs GRACE + RETURN = 312 dormant weeks, that the
first edge mints at week 8 or 9, that span = min(252 - 52, 260) = 200 is the most any edge reaches
(about 77% of one return), and that every drift figure here is PARTIAL drift.

A2 removed (old 9-12), replaced at 9-17:

    // The four campaigns are the recorded standard set (654-T-ledger.md §B), minted
    // IN-PROCESS from their seeds through the live engine, disposable, with NO player
    // action of any kind. Each is advanced ONE WEEK AT A TIME through the real `tick`
    // (never `advanceTo` in one jump) so every intermediate week is observed.

The replacement narrows the claim to "no player action DURING the 260 ticks" and names the
bootstrap: `generateWorld(seed)`, `economyEngagedEver: true`, one `activateStudioOperations`,
`initializeHollywood(..., 'fresh')` (fixtures.ts:9-12).

**Provenance consequence for the parent.** `677-*` prints `selfScriptSha256: 4e7438d4…`; the
corrected file hashes `198337d7…`. Behaviour is identical, only that printed string moves. Re-run
676 once or annotate 677 with both hashes. I did neither.

**B. `681-b5-closeness-floor-witness.ts`**, 163 lines, sha256
`1cc77f71a9886c9d37d3a5965bf0383e454c8da52333aec534ccf72599448a9c`. Command:

    node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/681-b5-closeness-floor-witness.ts

Executed once directly: EXIT 0, all assertions passed, sub-second. Steps 1-6 drive the REAL
`advanceRelationshipsWeek` (no hand-applied delta), `validateRelationshipsRoot` certifying the root
after each step: 52 mint, 50 after a completed 313-week return, 46, 49, then **45**, which equals
`RELATIONSHIP_TIER_FLOOR.Acquaintances` exactly, one point above the Strained ceiling 44. Six more
cycles show 45 is a fixed point (P3 nets 0, P4 onward +1, reaching 50 by P8), and the low pair is
the minimum of all six proximity classes at every step. The auditor's 45 is now measured. My
earlier figures (48 observed on the seeds, 672-R's predicted 47) describe natural play and still
hold; the constructed floor is 45 with a margin of 1. Steps 1-6 use a partial object cast to
`GameState` carrying only the fields the seam reads plus `talent` / `market.tick` /
`studioHistory.recordingStartedWeek`; a lawful full state needs half the world staged. The header
says so loudly.

**What step 7 cannot establish.** Failure deltas 4 (shipped), 5, 6, 7 reach minima 45, 42, 34, 26,
entering Strained at 5 and above. That is HYPOTHETICAL ARITHMETIC: no `src/` constant was changed,
`failure` is a local number, and `RELATIONSHIP_FAILURE_DELTA` is still imported and still 4. The
model is bound to the real engine at one point only, by replaying at the shipped delta and
asserting it reproduces the measured 45. Step 7 does not argue any of 5, 6 or 7 is a better
constant, does not model the other five proximity classes or the success driver, and says nothing
about whether the 313-week dormancy it assumes is reachable in play. The whole witness proves 45 is
ATTAINABLE by the write path, not that it is the global minimum of every lawful sequence.
