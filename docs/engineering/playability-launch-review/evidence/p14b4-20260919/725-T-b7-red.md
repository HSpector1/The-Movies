# 725-T — P14B.7 T1: the promise waiver requirement suite, authored and RUN RED

Role: independent test engineer. Authority: `724-T-b7-red-brief.md`, and the amended
`720-b7-waiver-expansion.md` (CURRENT bytes — read in full, twice: once before the mid-task
coordinator correction landed, once after, since 720 §6 changed under me; see "Mid-task course
correction" below). Mode: RED-first, before any writer touches production. Source at authoring:
`cc3a68d5` (HEAD unchanged for the whole task). No production file, schema, version constant,
existing test, existing helper or existing fixture was changed. Nothing was committed, nothing
pushed. The evidence runner (`record-check.mjs`) was not run. The full suite was not run — only
this file, and one disposable probe (`tests/_zz-b7-probe.test.ts`), deleted before hand-back.

**Verdict: RED, for the stated reason, in every case that reads on `waivePromise`,
`waiverAccepted`, `convertV31ToV32` or `convertV32ToV31`.** 26 of 28 cases fail; the two that pass
are premise-proving cases that call only functions that already exist today (`promiseFeasibility`,
and a version-constant read) and are not part of the waiver requirement itself.

## The file and its hash

- `tests/p14b7-promise-waiver.test.ts` — 573 lines.
  sha256 `bf5fb83a12f2666615c13010d4420f3d9a50670e586ade8aa8320da64f35ad59`
- Full raw run transcript (the exact command's stdout+stderr, unedited), archived alongside this
  report: `725-T-b7-red-run.txt` — 507 lines, sha256
  `c332f67eb08ffefd35908b51650db14460e796722e59003b7867637d8ded59e2`

Command run (twice, byte-identical result both times — once before deleting the probe file, once
after, to confirm the probe's removal changed nothing):

```
node_modules/.bin/vitest run tests/p14b7-promise-waiver.test.ts --reporter=verbose
```

Result both times: `Test Files 1 failed (1)` / `Tests 26 failed | 2 passed (28)`.

## Mid-task course correction, addressed before completion

While this suite was being authored, the parent sent an explicit correction: 720 §6 was amended a
second time (the "do not announce a waiver publicly" recommendation survived, but its BASIS
changed — promise terms are private, but the fold publishes an OUTCOME, and outcomes are already
public for every studio with no per-viewer filter; suppressing a waiver is a product choice, not a
privacy inference), and an 11th pin was assigned: a waived promise's `promiseOutcome` receipt must
be shown to EXIST while carrying NO row in the public industry activity fold, asserted positively
(receipt exists, then no activity carries its `eventId`) rather than vacuously ("no waived activity
appears," which would pass before the feature exists for the wrong reason). I re-read 720's current
bytes in full (confirmed via `git status`/`shasum` that the file had changed since my first read)
before writing group11. Nothing else in the assigned case list changed.

## The case list: what each pins, and the §2 item it serves

`group0` — foundational (§2 items 1–2, not in the brief's numbered priority list but load-bearing
for every later case):
1. `waivePromise` and `waiverAccepted` are functions — **the RED-mechanism guard.**
2. `waivePromise` opens with `requirePromiseRoots(state)`, throwing the file's own exact message
   on a state with the V29 roots stripped — item 1.
3. `waivePromise` is reachable from `applyActions` and agrees exactly with the direct call —
   item 1's "reachable from the action dispatch" clause. **Interpretation I2/I3** (see file header):
   action kind `waivePromise`, substitute shape = the existing `PromiseAttachment` fields.
4. No RNG: `rngState` byte-identical before/after an accepted waiver — the file's own stated law
   ("no RNG AT ALL").

`group1` — **brief priority 1** (§2 item 4, §3's named trap):
5. A substitute whose window overruns the REAL contract (`[60,110)` against contract `[52,104)`,
   promise window `[52,92)`) must be a PUBLISHED REFUSAL. Independent oracle: `promiseFeasibility`
   fed the REAL interval reads `IMPOSSIBLE — the due week falls outside the proposed contract`.
6. (Not a RED case — uses only `promiseFeasibility`, which exists today.) The SAME window judged
   the `reclassifyPromise`-buggy way (its own window as the "interval") reads
   `REASONABLY_ACHIEVABLE` — proves the trap is real, not hypothetical, and that group1's refusal
   case actually exercises it. **This case PASSES today**, by design — it is the premise, not the
   pin.
7. The same substitute's window shrunk to fit inside the real contract (`[60,100)`) must be
   ACCEPTED — isolates the window check from blanket infeasibility.

`group2` — **brief priority 2** (§4, the SUBSET test, both directions plus equality):
8. P1 (all-cast) substitute for a P2-lead original → REFUSE (illegal downgrade, independently
   feasible).
9. leadOrAntagonist substitute for a P2-lead original → REFUSE (middle rung, still a downgrade).
10. Same-class (`lead`) substitute for a P2-lead original, different window → ACCEPT (equality
    case).
11. P2-lead substitute for a P1 (all-cast) original → ACCEPT (legal upgrade direction).

`group3` — **brief priority 3** (§2 item 3, both halves of `evaluable()`):
12. REFUSE waiving an already-`SATISFIED` promise.
13. REFUSE waiving an already-`BROKEN` promise (same terminal law, the other outcome).
14. REFUSE waiving an UNBOUND promise (`contractId === null`), built via `historyFixture()`'s real
    `withdrawProposal` route — a genuinely player-issued, live-action-path unbound promise, not
    the rival-issued one in the T0 corpus (rival scope is excluded by 720 §7 and would have left
    the refusal's attribution ambiguous between "unbound" and "not this studio's promise").

`group4` — **brief priority 4** (§2 item 5, exact-key `feasibilityReceipt`):
15. The minted substitute's `feasibilityReceipt` equals the independent oracle exactly (same
    engine call, real contract interval, self-excluded), `week` = today, and the field set is
    exactly `{classification, bottleneck, inputsDigest, rulesVersion, week}`.

`group5` — **brief priority 5** (§1, §2 item 2, the Distrusted trap):
16. A genuinely Distrusted issuer (measured: 2 negative + 1 positive driver, still Distrusted —
    720's own "tolerates a positive driver" fact) refuses even a substitute independently proven
    feasible, legal-strength and non-identical — isolating the trust condition as the only thing
    left that can refuse it.

`group6` — **brief priority 6** (§2 items 6, 8, 9):
17. Identical-substitute (same family/class/count/window) → REFUSE, though independently feasible
    — isolates the identical-check from feasibility.
18. `progress`/`evidenceRefs` PRESERVED on the waived original (`part-served-p1`, count 2,
    progress 1) — the substitute uses the §5(c) recommended remaining-count (1).
19. `outcomeCause` non-empty on the waived original.

`group7` — **brief priority 7** (§2 item 7, ONE receipt through the existing `settle()`):
20. Exactly one new `talentMarket.receipts` entry, `kind: 'promiseOutcome'`, named by the
    original's `outcomeEventId`; every OTHER receipt kind's count is unchanged (no second kind
    invented).

`group8` — **brief priority 8** (§2 item 10, BOUND not proposed):
21. `contractId` on the substitute equals the original's; `outcome: null`; `evaluable()`'s own
    two-field test admits it; `talentMarket.proposals` and `talentMarket.cases` are BOTH
    unchanged (no proposal, no case).

`group9` — **brief priority 9** (§2 item 11, Save V31 → V32):
22. (Passes today.) `LIVE_SAVE_VERSION` still 31, `PROJECTION_VERSION` still 49 — the boundary
    this suite must not move, confirmed by the suite itself.
23. `convertV31ToV32`/`convertV32ToV31` exist — the RED-mechanism guard for this group.
    **Interpretation I3**: these names, following the identical convention used for V30→V31 and
    V28→V29.
24. Up-migration opens `supersededByPromiseId: null` on EVERY existing promise record (tested on
    `kept-and-broken`, 2 real terminal promise records of different outcomes), recomputing every
    other field byte-identically.
25. Down-migration REFUSES a staged state where one promise carries a non-null
    `supersededByPromiseId`, rather than silently dropping it.
26. A lossless down-migration (every record null) round-trips to the ORIGINAL V31 bytes exactly.

`group10` — **brief priority 10** (§2 item 12, §6, the trust attention-row defect B.7 creates):
27. After waiving, `promiseAttentionRows` mints exactly one `promiseOutcome`-cause row for the
    beneficiary, in the waived week, with a non-empty reason. Wording is NOT pinned (720 §6: "the
    reason is free text").

`group11` — **the coordinator's 11th pin, added mid-task** (§2 item 12, §6, the SECOND product
choice, mid-task-corrected basis):
28. Positive-then-absence: the `promiseOutcome` receipt EXISTS in `talentMarket.receipts` after a
    waiver, AND no row in the Industry Pulse fold (`industryPage(..., view:'pulse')`, paginated to
    exhaustion) carries its `eventId`. The SATISFIED/BROKEN-outcome row count is unchanged before
    vs after (no row gained or lost on the existing two kinds).

## Confirmation: every failure is for the stated reason, not import resolution

`src/core/promises.ts` and `src/core/save.ts` already exist (unlike a brand-new module), so
`import { waivePromise } from '../src/core/promises.js'` binds `waivePromise` to `undefined`
**without throwing** — vite/esbuild's documented behavior for a missing named export on an
existing module. This means `expect(() => waivePromise(...)).toThrow()` would PASS today for the
wrong reason (`waivePromise is not a function` still throws) if written naively. Every case in
this suite that touches `waivePromise`, `waiverAccepted`, `convertV31ToV32` or `convertV32ToV31`
opens with `assertWaiverFns()` / `assertMigrationFns()`, which asserts
`expect(typeof x, 'RED premise: ...').toBe('function')` BEFORE any call. I inspected every one of
the 26 failing stack traces in `725-T-b7-red-run.txt`: **all 26 fail at exactly that guard line**
(`tests/p14b7-promise-waiver.test.ts:93` or `:97`), with the message
`RED premise: waivePromise must exist as a named export of src/core/promises.ts: expected
'undefined' to be 'function'` (22 cases) or the same sentence for `convertV31ToV32` (4 cases in
group9). I grepped the full transcript for any `Error`/`AssertionError` NOT containing the string
`RED premise` — none exists. No case fails from a TypeError inside a `toThrow()` wrapper, a
mismatched fixture assertion, or module resolution. The two passing cases (the
`reclassifyPromise`-buggy premise demonstration in group1, and the version-constant read in
group9) call only functions that exist today and are explicitly NOT part of the waiver pin set —
they are load-bearing premises for other cases, not RED cases themselves, and their passing is
correct, not a leak.

Compact run summary (× = fail, ✓ = pass; full stacks in `725-T-b7-red-run.txt`):

```
 × group0 > waivePromise and waiverAccepted are functions (the RED-mechanism guard every later case relies on)
 × group0 > opens with requirePromiseRoots exactly like every other state-mutating export in this file
 × group0 > is reachable from applyActions and agrees exactly with the direct call (I2 substitute shape)
 × group0 > consumes no RNG: rngState is byte-identical before and after an accepted waiver
 × group1 > PUBLISHES A REFUSAL for a substitute whose window overruns the real contract, not a later save-validator crash
 ✓ group1 > the SAME window judged the reclassifyPromise-buggy way (its own window as the interval) would wrongly accept it — the trap is real
 × group1 > ACCEPTS a substitute whose window fits inside the real contract (isolating the window check from blanket infeasibility)
 × group2 > REFUSES a P1 (all-cast) substitute for a P2-lead original — an illegal downgrade, though independently feasible
 × group2 > REFUSES a leadOrAntagonist substitute for a P2-lead original — the middle rung is still a downgrade
 × group2 > ACCEPTS a same-class (lead) substitute for a P2-lead original — the equality case
 × group2 > ACCEPTS a P2-lead substitute for a P1 (all-cast) original — the legal upgrade direction
 × group3 > REFUSES waiving an ALREADY-SATISFIED promise (settle() must not overwrite a terminal outcome)
 × group3 > REFUSES waiving an ALREADY-BROKEN promise (the same terminal law, the other outcome)
 × group3 > REFUSES waiving an UNBOUND promise (B.1: "mints no outcome for an offer nobody took")
 × group4 > mints a feasibilityReceipt on the substitute matching the independent oracle exactly
 × group5 > REFUSES for a genuinely Distrusted issuer (measured: 2 negative + 1 positive driver, still Distrusted)
 × group6 > REFUSES a substitute identical to the original in family, class, count and window — though independently feasible
 × group6 > PRESERVES progress and evidenceRefs on the waived original (does not recompute them like the BROKEN branch)
 × group6 > stamps a non-empty outcomeCause on the waived original, as every other terminal branch does
 × group7 > appends exactly one new talentMarket receipt, kind promiseOutcome, named by the original's outcomeEventId
 × group8 > binds contractId to the original's own contract, outcome null, and creates NO proposal or case
 ✓ group9 > LIVE_SAVE_VERSION and PROJECTION_VERSION are still the frozen values this suite must not move
 × group9 > convertV31ToV32 and convertV32ToV31 exist (the RED-mechanism guard for this group)
 × group9 > opens supersededByPromiseId: null on EVERY existing promise record, recomputing nothing else
 × group9 > the DOWNGRADE REFUSES a non-null supersededByPromiseId rather than silently dropping it
 × group9 > a lossless downgrade (every record null) round-trips to the ORIGINAL V31 bytes
 × group10 > mints exactly one promiseOutcome attention row for the waived promise, in the waived week
 × group11 > the promiseOutcome receipt exists after a waiver, and no industry Pulse activity carries its eventId

Test Files  1 failed (1)
     Tests  26 failed | 2 passed (28)
```

## Engine facts measured live before writing a single assertion (not read off 720, not guessed)

A disposable probe (`tests/_zz-b7-probe.test.ts`, deleted before hand-back, confirmed removed —
`ls` exit 1 after deletion, `git status --porcelain` shows only the one deliverable file
untracked) called the EXISTING `promiseFeasibility`, `promiseCastSlots` and `trustDescriptor`
directly against the T0 corpus, to verify every candidate substitute used in the suite is
correctly isolated (feasible-but-wrong-for-a-different-reason, never feasible-and-would-pass, for
every REFUSE case; feasible-and-legal for every ACCEPT case) before encoding a single `expect()`.
Full transcript was captured and is summarized in the file's own header comment. Key results:

| candidate | fixture | classification | note |
| --- | --- | --- | --- |
| window `[60,110)` vs REAL contract `[52,104)` | bound-open-p1 | `IMPOSSIBLE` — "the due week falls outside the proposed contract" | the group1 refusal case |
| the SAME window vs its OWN window as "interval" (reclassifyPromise's bug) | bound-open-p1 | `REASONABLY_ACHIEVABLE` | proves the trap is real |
| window `[60,100)` (fits the real contract) | bound-open-p1 | `REASONABLY_ACHIEVABLE` | the group1 accept case |
| exact copy of promise-0's own family/count/window | bound-open-p1 | `REASONABLY_ACHIEVABLE` | the group6 identical-substitute case — feasibility is NOT what refuses it |
| P1 substitute (mask=all 3) for a P2-lead original | bound-open-p2-lead | `REASONABLY_ACHIEVABLE` | the group2 illegal-downgrade case |
| leadOrAntagonist substitute for a P2-lead original | bound-open-p2-lead | `REASONABLY_ACHIEVABLE` | the group2 illegal-middle case |
| P2-lead substitute, different window, for a P2-lead original | bound-open-p2-lead | `REASONABLY_ACHIEVABLE` | the group2 equality case |
| P2-lead substitute for a P1 (all-cast) original | bound-open-p1 | `REASONABLY_ACHIEVABLE` | the group2 legal-upgrade case |
| count-1 substitute (remaining obligation) | part-served-p1 (count 2, progress 1) | `REASONABLY_ACHIEVABLE` | the group6 progress-preserve case |
| P2-lead substitute, different window, for the Distrusted issuer's own P2-lead original | distrusted-issuer | `REASONABLY_ACHIEVABLE` | the group5 case — isolates trust as the sole refusal cause |

Trust labels measured: `distrusted-issuer` reads `Distrusted` (2 negative `cancelledAfterFirstTake`
+ 1 positive `ranToEnd`, confirming 720's own "tolerates a positive driver" claim); `bound-open-p1`
and `part-served-p1` both read `Reliable` at their own week, confirmed safe as acceptance worlds.

## A finding beyond the suite: 720 does not name a real trap I found authoring against the engine

**This is a gap, not a false claim — 720 does not say anything wrong about it, it says nothing
about it at all, and it will silently break most realistic waivers if the writer misses it.**

`promiseFeasibility`'s `reservedByActivePromises` counts every OTHER active promise for the same
beneficiary as reserved capacity — **including the promise CURRENTLY BEING WAIVED**, unless the
draft handed to `promiseFeasibility` sets `promiseId: promise.promiseId` to exclude it (exactly
the documented purpose of `PromiseDraft.promiseId`, promises.ts :206–208: "so the service does not
count the promise against itself as an active seat reservation" — written for `reclassifyPromise`,
but the SAME field, same exclusion). I measured this directly: computing feasibility for the
`bound-open-p1` fits-in-contract substitute WITHOUT setting `promiseId` reads `FRAGILE — needs a
picture not yet commissioned` (the original's own 1-count reservation double-counts against its
replacement); the IDENTICAL draft WITH `promiseId: promise.promiseId` set reads
`REASONABLY_ACHIEVABLE`. I reproduced the same flip on `bound-open-p2-lead`, `part-served-p1` and
`distrusted-issuer` — every "happy path" acceptance candidate in this suite reads `FRAGILE` instead
of `REASONABLY_ACHIEVABLE` unless the original is excluded from its own reservation count.

720 §2 item 4 and §3's trap section discuss the substitute's window interval at length but never
mention this SEPARATE self-reservation exclusion, which is a different bug with the same shape:
silent, and it would make `waiverAccepted` refuse almost every otherwise-legal waiver as FRAGILE
for a pipeline reason that is really "the thing I'm replacing is still charged against itself." A
writer who reads `promises.ts` in full (as 720 asks) has a real chance of independently spotting
`PromiseDraft.promiseId`'s own docstring and getting this right without being told — but the
`reclassifyPromise` trap is comparably documented and 720 still needed the 723-C audit to catch it.
I am reporting this as a fact worth adding to 720 §3 alongside its other two "measured, not read"
facts, not asserting it as a NEW pin in the RED suite itself (§2 does not state a requirement about
which promise a substitute's feasibility excludes, only that feasibility must be judged against the
real contract — item 4's own text). My `realFeasibility()` oracle helper in the suite applies this
exclusion (matching `reclassifyPromise`'s own documented convention) so every REFUSE/ACCEPT
classification in the suite is correctly isolated; if the writer's actual implementation omits the
exclusion, the group1/2/4/5/6/7/8/10/11 acceptance cases will fail — correctly — with a `FRAGILE`
reason, distinguishable in the writer's own run from every other failure mode in this suite.

## Boundaries confirmed

- `src/core/save.ts:6409` — `export const LIVE_SAVE_VERSION = 31 as const;` — unchanged, re-read
  from disk after this suite was written.
- `bridge/schema/bridge-schema.ts:258` — `export const PROJECTION_VERSION = 49 as const` —
  unchanged, re-read from disk after this suite was written.
- `git diff -- src/core/save.ts bridge/schema/bridge-schema.ts` — empty (0 lines).
- No production file, schema, existing test, existing helper or existing fixture was touched.
  `git status --porcelain` at the end of this task shows exactly one new file:
  `tests/p14b7-promise-waiver.test.ts` (plus this report and its companion run-transcript, both
  under `docs/`).
- `tests/_zz-b7-probe.test.ts` (disposable) was deleted before hand-back; confirmed absent.
- Nothing was committed. Nothing was pushed. The evidence runner was not invoked. The full test
  suite was not run — only `tests/p14b7-promise-waiver.test.ts` and, earlier, the deleted probe.

## Not exercised / evidence limits

- Native/Unity: not touched, not claimed.
- The full core suite and the 24-inherited-failure baseline: not run, not claimed changed.
- `waiverAccepted`'s literal return TYPE (`string | null`) and the exact action-kind name
  (`'waivePromise'`) and substitute-draft field names are INTERPRETATIONS (I1/I2/I3 in the file
  header), not requirements 720 pins verbatim. If the writer's actual shape differs, the guard
  assertions (`typeof x === 'function'`) will still correctly report absence until the writer
  lands SOMETHING under these names; if the writer deliberately chooses different names, that
  divergence needs a ruling recorded the same way 654-T's interpretations were, not a silent
  rename that leaves this suite red for the wrong reason.
- The `promiseAttentionRows` wording pin (group10) and industry fold pin (group11) assert
  EXISTENCE/ABSENCE and identity, never exact reason text, per 720 §6's own "the reason is free
  text."

## Next concrete action

None required of me under T1. The suite is RED for the stated reason in every case, the two
non-RED cases are premise-proving and correctly pass today, and the boundaries are confirmed
untouched. The writer (W, per 720 §8 step 4) lands `waivePromise`, `waiverAccepted`, the V32 save
step and the migrations against this suite next; the self-reservation-exclusion finding above is
worth carrying into that work explicitly, since it is the kind of fact that reads as an unrelated
FRAGILE failure rather than an obviously-missing feature if it is not anticipated.
