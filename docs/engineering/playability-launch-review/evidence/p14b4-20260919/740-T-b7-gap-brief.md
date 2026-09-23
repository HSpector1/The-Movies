# 740 — test-author brief: the two B.7 coverage gaps left open at T1b

These two were named in your own T1b report and deferred until the writer's pass landed. It has
landed. This brief closes them and nothing else.

You own the tests. I am not asking you to change production code, and if closing either gap
requires a production change, say so and stop rather than making it.

## Scope

`tests/p14b7-promise-waiver.test.ts` (engine) and, only for the attention-row word,
`tests/bridge-p14b7-promise-waiver.test.ts`. No other file.

## Gap 1 — the suite proves "it refuses" and never proves WHICH refusal fired

`waivePromise` has NINE distinct refusals. The suite holds eleven `toThrow()` calls and exactly
one of them pins a reason (`:241`, the V29-roots guard). Every other refusal case would still
pass if the engine refused for a completely different reason.

That is not a hypothetical. Two of the nine overlap on reachable inputs:

- `identicalSubstitute` — "an identical substitute changes nothing this studio owes"
- THE LAW — "a substitute is a forward obligation, and this window opens no later than the week
  of the waiver"

An identical substitute copies the original's window, and an original whose window already opened
is the normal case, so the identical-substitute case at `:471` can be refused by EITHER rule.
Today nothing says which. Reorder the two checks and the suite stays green.

The nine sentences, from `src/core/promises.ts` `waiverAccepted` in source order:

1. `this promise already settled ${outcome}, and a terminal outcome is never rewritten`
2. `nobody took up this promise, so there is no commitment to waive`
3. `the employment contract this promise rode in on is no longer on the record`
4. `an identical substitute changes nothing this studio owes`
5. `a substitute is a forward obligation, and this window opens no later than the week of the waiver`
6. `the part offered is weaker than the part promised`
7. `only ${n} of the ${m} pictures still owed would be covered`
8. `this person no longer trusts this studio enough to accept a substitute for what was promised`
9. `what remains of the contract cannot reasonably carry the substitute — ${bottleneck}`

All nine reach the caller wrapped as
`promises: this person did not accept the substitute — <sentence>`.

**What to do.** Give every refusal case an assertion that pins ITS OWN sentence, not a shared
prefix. Match on the distinctive clause, so a test cannot pass on a different refusal.

**The one that matters most.** Make the identical-substitute case prove it is refused BY rule 4.
That means its substitute window must open STRICTLY AFTER the waiver week, so rule 5 cannot fire
and rule 4 is the only remaining explanation. If the fixture's promise cannot produce that
without contortion, report the obstacle rather than settling for the ambiguous case.

Add one case in the other direction too: a substitute that is NOT identical and whose window
opens AT the waiver week, refused by rule 5. Between them the two rules are separated in both
directions.

## Gap 2 — "WAIVED has no trust effect" is the slice's central law and NOTHING asserts it

The companion states `WAIVED: no trust effect; recorded and visible`
(`P14-PREPARATION-COMPANION.md:379`, ruling S11 `:568`).

Both suites use `trustDescriptor` only as a PRECONDITION — asserting an issuer is or is not
`Distrusted` BEFORE waiving. Your own comment at `:429` says so: "a LABEL test, never a
driver-purity" test. After a waiver lands, nothing checks what it did to trust.

`src/core/promises.ts:1081-1085` mints a driver for `SATISFIED` and for `BROKEN` in an explicit
`if / else if`, and for nothing else. Add an `else if (promise.outcome === 'WAIVED')` arm and both
B.7 suites stay green today. That is the defect this gap leaves open.

**What to do.**

- Take a state where a waiver legitimately lands. Capture `trustDrivers` (or the descriptor's
  drivers) for the beneficiary and the issuing studio BEFORE the waiver and AFTER it. Assert they
  are EQUAL. Equality is the right shape: it fails on an added driver, on a removed one, and on a
  reordering, and it does not have to enumerate what a driver looks like.
- Assert the label does not move across the waiver.
- Assert the substitute, which is minted OPEN with `outcome: null`, contributes no driver either.
- In the bridge suite, assert the issuer's attention row for the outcome week reads the word
  **waived** and specifically NOT **broken**. That pins `PROMISE_OUTCOME_WORD` (`bridge/trust.ts:16`)
  against the two-way ternary it replaced, which would have published an accepted settlement as a
  breach.

Do NOT write a `VOIDED` case. No verb mints `VOIDED` yet; a test that forges one would be
asserting a shape, not a behaviour, and P14C owns it.

## Not authorized

- No production change. If a gap cannot close without one, report it and stop.
- No weakening, deletion, skipping or relaxation of any existing assertion. If an existing
  assertion contradicts one of yours, report the contradiction; do not resolve it by edit.
- No renaming of existing tests. Failure identity in this programme is compared across runs by
  full test-name string.
- No new fixture mint. Use the published `genuine-v31-pre-b7` corpus.
- No timeout change, no retry, no quarantine.

## What to hand back

The exact `shasum -a 256` and line count of each file you touched, taken in the same command block
as your last edit. The full vitest output for both suites, actual not summarized, including the
counts. A statement of which of the nine refusals now have their own pinned sentence and which, if
any, you could not separate, with the reason.

If any assertion you add FAILS against the landed engine, that is a finding, not a problem to fix.
Report it and leave the test failing.
