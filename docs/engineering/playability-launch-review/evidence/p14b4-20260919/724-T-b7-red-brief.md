# 724-T — parent brief: the P14B.7 waiver requirement suite, RED before the writer

Authority: the amended P14B.7 expansion, record `720-b7-waiver-expansion.md`, at source `cc3a68d5`.
Read 720 in full first. It was audited before the slice began (record 723-C, verdict REFINE) and
amended on five HIGH findings, so **read the current bytes, not any earlier summary of it.**

You author and RUN this suite BEFORE the writer starts. It must be RED, and RED for the reasons
you state, not for accidents.

## What you are pinning

720 §1 is the behaviour and §2 is the completion condition, fifteen items. Your suite is the
requirement, so it pins §2, not an implementation. Priority order, because these are the items a
writer can satisfy literally while shipping something wrong:

1. **The substitute's window is judged against the REAL contract** (§2 item 4, §3's named trap).
   `promiseFeasibility` refuses a window overrunning its contract at `promises.ts:406-409`, and
   both refusals read `startWeek`/`termWeeks`, documented at `:203` as the CONTRACT interval.
   `reclassifyPromise` passes the promise's own window instead, which makes both refusals
   tautological. Pin a substitute whose window overruns the real employment contract and require a
   PUBLISHED REFUSAL, not a later save-validator crash. If the writer copies `reclassifyPromise`,
   this case is what catches it.
2. **Strength is a SUBSET test** (§4). `substituteMask ⊆ originalMask`. Pin a legal upgrade, an
   illegal downgrade AND the equality case, in both directions, so an inverted implementation
   cannot pass. An inversion is silent: it accepts every downgrade and refuses every upgrade.
3. **Refusal when the original is not `evaluable()`** (§2 item 3), both halves and separately: an
   ALREADY-TERMINAL promise (waiving it would let `settle()` overwrite a terminal outcome and break
   the "TERMINAL and emitted ONCE" law at `:705-706`) and an UNBOUND promise (`:588-593`, "B.1
   mints no outcome for an offer nobody took").
4. **The substitute carries its own `feasibilityReceipt`** (§2 item 5), computed at today's week.
   Exact-key mandatory field (`:1012`), validated member by member (`:1047-1061`).
5. **`Distrusted` refuses the waiver** (§1, §2 item 2). See the trap below.
6. **Identical-substitute refusal** (§2 item 6), and **`progress`/`evidenceRefs` PRESERVED** on the
   waived original (§2 item 8), and **`outcomeCause` non-empty** (§2 item 9).
7. **ONE `promiseOutcome` receipt** through the existing `settle()` (§2 item 7). Not two, not a new
   kind.
8. **The substitute is BOUND, not proposed** (§2 item 10): `contractId` equals the original's,
   `outcome` null, `evaluable()` admits it, and NO proposal or market case was created.
9. **Save V31 → V32** (§2 item 11): the field opens `null` on every existing record, recomputes
   nothing, and the DOWNGRADE REFUSES a non-null value rather than dropping it.
10. **`bridge/trust.ts` mints an attention row for a waived promise** (§2 item 12, §6). Today it is
    gated on `SATISFIED || BROKEN` at `:68`, so a waiver mints nothing and the player who
    negotiates gets less feedback than the one who breaks.

## Three traps, each already measured. Do not re-derive them

**The missing-export trap, which has bitten this repo before.** `waivePromise`, `waiverAccepted`
and `supersededByPromiseId` do not exist yet. Vite binds a missing named export to `undefined`
rather than throwing, so `expect(() => waivePromise(...)).toThrow()` PASSES today for the wrong
reason and would keep passing after a broken implementation. Every RED case must first assert the
symbol exists (`expect(typeof waivePromise).toBe('function')`) so absence is a real failure. State
in your report that you checked each RED fails for its stated reason and not for import resolution.

**`Distrusted` tolerates a positive driver.** `label()` (`promises.ts:879-884`) tests
`negative >= TRUST_DISTRUST_MIN_NEGATIVES && negative > positive`, NOT "two negatives and no
positives". T0 measured this: the minted `genuine-v31-distrusted-issuer` carries two negative
`cancelledAfterFirstTake` drivers and one positive `ranToEnd` that arrives naturally, and still
reads Distrusted. Assert the LABEL. A case asserting driver purity pins a stronger premise than
the engine holds and will break on an incidental positive.

**A count of 2 or more needs a second pipeline opening.** T0 measured that too.
`activateScriptDevelopment` looks like the door and is not: it changes `greenlight`'s own admission
rule, since a managed studio must target a `Ready` script project. A fixture built by naively
doubling the count-1 case will not reach the state it means to. Record 722 has the route that
worked.

## The fixtures exist. Use them

`tests/fixtures/p14/genuine-v31-pre-b7/` holds nine genuine outgoing V31 saves minted at T0 through
real action paths: `empty`, `bound-open-p1`, `bound-open-p2-lead`,
`bound-open-p2-lead-or-antagonist`, `part-served-p1`, `kept-and-broken`,
`rival-current-p1-and-p2`, `with-edges`, `distrusted-issuer`. `MANIFEST.json` describes each one's
week, root counts and focus. `part-served-p1` is the one §5 (c) turns on. Every non-empty fixture
carries relationship edges, so the V31 root is exercised more broadly than the roster promised.

## Boundaries

- Change NO production file, NO schema, NO version constant, NO existing test, NO existing helper
  and NO existing fixture. `LIVE_SAVE_VERSION` must still read 31 and `PROJECTION_VERSION` 49 when
  you finish. Verify both and say so.
- Write no implementation, not even a stub. You own the requirement; the writer owns the fix.
- Leave nothing under `tests/` you did not intend to keep. The core project globs
  `tests/**/*.test.ts`, so a stray probe joins the suite and moves a baseline this program compares
  case by case.
- Commit nothing. Do not run the evidence runner or the full suite. The parent owns both.

## Report

Write `725-T-b7-red.md`: the file and its sha256, the case list with what each pins and the §2 item
it serves, the exact RED output, your confirmation that each case fails for its stated reason
rather than import resolution, and the two version constants re-read from disk.

**720 is a draft that has already been wrong once.** If authoring against the engine shows another
of its claims to be false, say so plainly. That finding outranks the suite.
