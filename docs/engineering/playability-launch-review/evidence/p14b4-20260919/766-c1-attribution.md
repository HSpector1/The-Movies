# 766 — the C.1 full-core run, attributed

Run `766-c1-full-core`, source `c3260d57` (candidate `a04fa398` plus the pre-run prediction
correction, docs-only). **`fixedSource: true`**, `testedDiffSha256` the empty-tree hash at BOTH ends,
`untrackedSource` empty at both ends. 45 minutes. Exit 1, failures present as predicted.

## The counts

| | baseline (755) | predicted (764) | **measured (766)** |
| --- | --- | --- | --- |
| test files | 10 failed / 347 passed (357) | 358 | **45 failed / 313 passed (358)** |
| cases | 25 failed / 4060 passed / 8 todo (4093) | 4138 | **159 failed / 3955 passed / 8 todo (4122)** |

**File count CORRECT. Case count FALSIFIED: 4122 against 4138, short by 16.** Attributed exactly,
not waved at:

| source | cases |
| --- | --- |
| baseline | 4093 |
| the RED | +45 |
| `tests/c2a-m4-g101-throughput.test.ts` 4 → **0** | −4 |
| `tests/roster-wall-player-policy.test.ts` 12 → **0** | −12 |
| **total** | **4122** |

Two files now register ZERO cases because they throw during COLLECTION, so their cases never exist to
be counted. That is a failure mode 764 did not consider: I reasoned only about cases being added, and
a file that dies at module scope subtracts all of its own.

**Falsifier 3 is CLEAN: zero of run 755's 25 failure lines vanished.** Every inherited failure is
still there, which is what a slice that moves values rather than laws should produce.

## The 134 new failure lines, by CAUSE rather than by filename

Per the adopted standard (765 §3), these are grouped by the cause traced to them, and no expected
value has been changed anywhere.

**1. 31 failures + both collection deaths: `Historical hash cannot discard talent provenance
authority`. THIS IS MY DEFECT, in an instruction, not the writer's implementation.**

Contract §12 F4 told the writer that `historicalHashState` should verify the provenance root equals
the canonical rebuild and then strip it, on the `technology`/`physicalPlans` precedent. The writer
implemented exactly that. It is wrong by construction: `buildTalentProvenance(people, boundaryWeek,
kind)` reproduces a root in which every person entered at the boundary and no week has passed, and
the call sites — `src/harness/facilities/index.ts:681` and
`src/harness/roster-wall/player-policy.ts:439` — hash **ticked** states with people appended later
and a `due` bucket that has advanced. The equality can never hold there.

I made the §5 mistake again in a different place: I specified a check that is true only at one
privileged moment and used it where the state has moved on.

**The corrected rule.** The provenance root fits neither existing guard pattern. It is not "must be
empty" (`firstTakes`/`promises`/`relationships`) and not "must equal the initial value"
(`technology`/`physicalPlans`/`talentMarket`), because it is legitimately non-empty AND legitimately
evolves. The lawful check is INTERNAL CONSISTENCY with the state it travels with — one row per
person, `age === ageAt(row, market.tick)`, `due === recomputeDue(…)` — and then the strip.

**2. 25 failures in `tests/v14-migration.contract.test.ts`: a GENUINE PRODUCTION DEFECT, and the most
important finding of this run.** The refusal is

> `validateSaveV12: state has unknown field "talentProvenance"`

on a save the contract test builds as a genuine V13 file, which by construction has no such root. The
new root is LEAKING into the frozen validator chain. That is precisely the failure the `stripVnRoot`
device exists to prevent, and it means some projection path down to the frozen boundaries does not
strip V33's root. The test's own message states the stake plainly: "a V13 file that HAS none must
still load, or every save on disk is unreadable and there is nothing left for the migrator to
migrate." This is not a moved expectation and must not be treated as one.

**3. 4 moved historical hashes.** The F4 falsifier fired. These are the real thing I said would be
reported and never re-pinned, and they are reported here. **My F4 goal was unachievable as stated**:
`talent[].age` is inside the hashed state and every age floored, so these hashes were always going to
move. F4 conflated the frozen `liftV18Control` (never ticked, hash genuinely stable) with
`historicalHashState` (used by other harnesses on live ticked worlds, where it cannot be). Their
disposition waits on cause 1's fix, because a guard that throws first hides what the hash would say.

**4. 13 `UNEXECUTED natural premise` / `natural rival prerequisites absent` failures** in
`p14b4-rival-seating-preference` (18 lines total) and `p14b4-cast-class-outcomes` (9). These are
natural-chain tests that walk the sim until a premise holds and now do not reach it within their tick
budget. This is the repricing consequence 764 predicted, arriving in the shape the standing memory
rule names: derived pins break when a later law moves the chain. **Re-deriving them from receipts is
test authoring**, done from evidence, and no budget is widened to make a premise reappear.

**5. 8 `validateSaveV33: stored age N for <person> disagrees with its provenance` failures.** The A13
cause. The audit named one file, the writer found a second, and the subject ids here (`t-wri-…` as
well as `t-act-…`) show at least a third. Condition 2 forbids a hand-written `age` in a live state,
and that is a LAW rather than a per-test note. Test authoring, from provenance-consistent synthetics.

**6. Not yet attributed, deliberately: 7 timeouts and 6 `ENOENT … evidence/Playability-Interaction…`.**
Both are plausibly cascades of cause 1 — a harness that throws produces no evidence directory for a
later reader, and a suite under a thrown guard retries. **I am not claiming that.** They are
re-measured after causes 1 and 2 are fixed, and attributed then.

## What this run does NOT establish

- **No economic expectation has been re-pinned, anywhere.** The writer changed none and neither have I.
- **Cause 2 is a defect and cause 1 is mine.** Neither is covered by 764's repricing prediction, and
  neither may be waved through as "expected repricing". That is exactly the confusion 765 §3 was
  written to prevent, and it would have been easy to fall into here, because both live in files whose
  names look aging-adjacent.
- The `ui` project was not run. FU-1 is still unreturned.
- Unity/native unchanged and still deferred.

---

## CORRECTION — cause 2 is NOT a production defect, and I called it one without checking

Record 766 above says the `v14-migration.contract` cluster is "a GENUINE PRODUCTION DEFECT, and the
most important finding of this run". **The first half is wrong.** I inferred "production" from the
error text — `validateSaveV12: state has unknown field "talentProvenance"` — and published that
inference as a finding without tracing where the offending state was built.

**Where it actually is.** `tests/contracts/_v14Contract.ts:377`, `projectToV13State`: a hand
projection owned by the contract test, which strips each post-V13 root by an explicit
`delete raw.<root>` line — `releaseAuthority`, `studioHistory`, `hollywood`, `foundingRegime`,
`technology`, `physicalPlans`, `talentMarket`, `firstTakes`, `promises`, `relationships` — and has no
line for `talentProvenance`. `V14_STATE_ROOTS` at `:43` is declared in that same test file and names
only the five V14 additions, so it never covered any of them. Every prior save bump added a line
here; C.1's is the one that was missed.

**Production is clean, and I verified it independently rather than on the writer's probe.**
`projectStateV13` / `V14` / `V18` (`src/core/save.ts:5674`, `:5704`, `:6385`) are ALLOWLIST
projections, so a new root cannot leak through them by construction. The only multi-root destructures
in `src/` are `save.ts:8685`, `:8694`, `:8832` — each a single chained strip — and
`historical-control.ts:76`, which already carries `talentProvenance`.

**The class my sweep inventory missed, stated so the next save step has it.** 763 enumerated version
LITERALS and `migrateToVn` call sites. It has no class for **enumerated root-strip lists**, which is
a different shape: a list that must GROW by one line at every save bump, in which the failure mode is
an omission rather than a stale value, and which therefore matches no value grep at all. Measured
sites: `src/core/save.ts` (chained, one root each, correct by construction),
`src/harness/roster-wall/historical-control.ts:76` (correct), `tests/contracts/_v14Contract.ts:377`
(**the gap**). `tests/d17a-adv-migration.test.ts:189-192` matched the same grep and is NOT this class:
it deletes pre-V13-era fields to forge an old state, and it did not fail.

**What the mischaracterisation nearly cost.** Calling it production would have sent a writer hunting
a leak in `save.ts` that does not exist, while the actual one-line fix sat in a file the writer is
forbidden to author. The failure text named a production validator, which is exactly why it read as a
production defect; the validator was the reporter, not the culprit.

## Cause 1's fix, and what it showed about the four moved hashes

`src/harness/roster-wall/historical-control.ts`, +17/−10, the only production file changed. The guard
now calls `validateTalentProvenanceRoot` and rethrows with context, so the observatory and the save
boundary cannot drift apart by carrying two copies of the same conditions.

| file | before | after |
| --- | --- | --- |
| `facilities-observatory` | died at collection | **12 / 12** |
| `roster-wall-player-policy` + `roster-wall-campaign` | died at collection / failing | **21 / 21** |
| `c2a-m4-g101-throughput` | died at collection | **4 / 4** |
| `roster-wall-continuation` + `roster-wall-artifacts` | failing | **22 / 22** |

Those six are every file that can reach `historicalHashState` or `liftV18Control`. **No historical
hash pin failed in any of them and nothing was re-pinned.** So the four "moved hashes" in run 766
look like the guard throwing rather than a hash actually moving — which, if the full re-run confirms
it, means my F4 falsifier fired on my own broken guard rather than on a real consequence. Recorded as
provisional: one targeted pass is not the full suite, and the re-measure is mine to make.

## An orchestration defect of mine, recorded because it cost a verification

I told the writer their acceptance check was "the RED must stay at 44 of 45", and at the same time
dispatched a test author to rewrite exactly those assertions in exactly that file, in the same
worktree. The writer correctly refused to touch it and reported the conflict instead of running
against a file someone else was mid-write on.

**Two specialists on disjoint FILES is not enough. A verification target is an ownership claim too.**
The next brief names the file a specialist may READ for acceptance as explicitly as the files it may
write.
