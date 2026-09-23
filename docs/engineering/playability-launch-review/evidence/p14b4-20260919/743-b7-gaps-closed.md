# 743 — the two B.7 coverage gaps closed, and both guards PROVEN by injection

Brief 740 assigned two gaps. Both are closed. A third hole was found while verifying the first
pass, and it mattered more than either: the Owner's own approved rule had no test.

Source `ca5b6c1f` plus the test-only changes recorded here. Suites: **38 passed (38)**,
32 engine + 6 bridge. Typecheck root 0.

## What a passing new test proves, and how that was established

A regression guard that has never failed is a claim, not evidence. Each guard below was verified
by INJECTING the exact defect it exists to catch into `src/core/promises.ts`, observing the guard
go red, and reverting. Production was clean before and after every injection, confirmed by
`git status` and by re-reading the restored line.

## Gap 2 — the slice's central law is now pinned

`WAIVED: no trust effect` (`P14-PREPARATION-COMPANION.md:379`, ruling S11 `:568`) was asserted
nowhere. Both suites used `trustDescriptor` only as a precondition BEFORE waiving.

Closed by `group12`: `trustDrivers` for the (beneficiary, issuing studio) pair captured before and
after an accepted waiver and asserted equal, the label asserted unchanged, the minted substitute
asserted `outcome: null`, and the studio-level aggregate asserted unchanged. Equality is the right
shape because it fails on an added driver, a removed one and a reordering, without enumerating
what a driver looks like.

**PROVEN.** Injected `else if (promise.outcome === 'WAIVED')` pushing a driver into `trustDrivers`
between the SATISFIED and BROKEN arms. BOTH `group12` tests went red. Reverted.

## Gap 1 — which refusal fired, not merely that one did

Eight bare `.toThrow()` calls became `.toThrow(/exact sentence/)`. Every removed line was read: all
eight are strictly-stronger upgrades and the ninth removed line is an import. Nothing was weakened,
deleted, renamed or skipped.

Seven of the nine `waiverAccepted` refusals now pin their own sentence. THE LAW is pinned harder
than the brief asked, by exact `toBe` equality on the returned string (`:569`) rather than a regex.

**Not separated, and disclosed rather than forced.** Rule 4 (identical substitute) could not be
isolated from rule 5 (THE LAW). `identicalSubstitute` requires the substitute's window to equal the
original's, and every player-issued promise in the published corpus already has its window OPEN at
its own fixture's pinned tick (bound-open-p1 52 <= 52; both p2 variants 52 <= 52; part-served-p1
104 <= 113; distrusted-issuer 52 <= 70), so an identical draft is structurally `<= week` for
everything the corpus can produce and both rules are simultaneously satisfiable. Isolating them
needs a new fixture, which was not authorized, or a synthetic tick override divorced from the
fixture's genuine saved tick, which is the contortion the brief told the author to report instead
of forcing. What is pinned is the engine's CURRENT returned sentence, which still has real
regression value: source order puts `identicalSubstitute` (`:937`) before the window check
(`:940`), so reordering those two flips the text and turns the assertion red.

## The third hole — the Owner's approved rule was unproven

Found by the parent while verifying the first pass, not reported as a gap by anyone.

The author correctly reported rules 3 and 7 as untested and correctly stayed inside the brief's
scope. Checking what rule 7 IS changed the job: it is the Owner's decision for this slice, approved
verbatim on 2026-09-23 — "a substitute must cover at least the original's unfulfilled qualifying
count, without erasing completed work or counting it again toward the substitute."

That decision has two halves and only one was covered. Preservation was well tested (`:524`
original keeps `progress`, `:525` keeps `evidenceRefs`, `:581` substitute minted at `progress: 0`,
`:584` the exploit guard). The refusal when a substitute covers too few had NO case anywhere. The
headline rule of P14B.7 was unproven, and the suite would have stayed green under an implementation
that read the original's raw count instead of the remainder.

Closed by `group13`, on `part-served-p1` (count 2, progress 1, remaining 1) in both directions:

- **REFUSAL** — a substitute of count 0 is refused with the exact sentence
  `only 0 of the 1 pictures still owed would be covered`. The **1** is the discriminating number:
  an implementation built from the original's raw count reads "of the 2".
- **ACCEPTANCE at the boundary** — a substitute of count 1, which EQUALS the remaining obligation
  and is strictly less than the original's count of 2, is accepted. This pins "at least" rather
  than "more than" and is the direction where a naive law diverges in VERDICT rather than in wording.

Both cases are isolated from the neighbouring rules by construction: same cast mask as the original
(no rule 6 confound, asserted via `promiseCastSlots`), count differing from the original (no rule 4
confound), and a window opening strictly after the waiver week (no rule 5 confound).

**PROVEN.** Injected the naive law by dropping the subtraction, `const remaining =
promise.predicate.count`. Both `group13` tests went red, and in the two distinct ways the
construction predicts: the refusal case failed on the NUMBER (`of the 2` against `of the 1`) and
the boundary case failed on the VERDICT (a refusal string where `null` was required). Reverted, and
`:947` re-reads `const remaining = promise.predicate.count - promise.progress`.

## Still untested, recorded rather than closed

**Rule 3**, "the employment contract this promise rode in on is no longer on the record", has no
case. The author cross-referenced all nine corpus fixtures: every promise with a non-null
`contractId` resolves to a real `state.hollywood.employment` record, with zero orphans anywhere
(bound-open-p1 2/2, both p2 variants 1/1, distrusted-issuer 1/1, part-served-p1 1/1,
kept-and-broken 2/2, with-edges 12/12 rival-issued, and two fixtures with no bound promises). The
parent spot-checked `part-served-p1` independently: 1 bound promise, 0 orphans. Reaching rule 3
needs a new fixture or a forged state, so it stays untested and named.

That leaves **eight of the nine refusals covered**, with rule 3 the only one no case reaches.

## Scope held

Two test files only. No production file changed by this work; the three injections were
verification experiments, each reverted in the same command block under a shell trap, with the
clean tree confirmed afterwards. No fixture minted, no existing assertion weakened, no test
renamed, no timeout, retry or quarantine touched.
