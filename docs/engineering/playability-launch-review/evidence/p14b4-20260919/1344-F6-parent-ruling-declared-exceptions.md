# 1344-F6: parent ruling on the sweep's declared exceptions (row 6 and promise rows 8-11)

[1344-X11](1344-X11-row6-and-promise-probe-results.md) ran both probes, and each matched its reviewed declaration:
every gate true, and no lawful re-witness. This ruling settles the seven NEW identities of x3 that those probes cover
([1344-X9](1344-X9-save43-sweep-dry-run-x3.md)).

## 1. Row 6: 1344-F5 A3 applies

The three leaves stay failing with their X10 attribution, and the test does not change. The closure carries them in
the words of [row6-r3/declaration.md](1344-stage/s10/row6-r3/declaration.md) part f:

> **Declared exception (1344-F5 A3): three NEW identities in `tests/p14b5-relationships.test.ts` that passed at
> 1338.** The leaves are :651 and :661 (family 2) and :859 (family 5). Each fails inside `rivalWorld()` at :397:53
> (recorded :372:53 at a318722): `expected [] to deeply equal [ 'studio-aca408ec-r01:film:6' ]`.
> - Attribution (1344-X10 row 6, R1-R5 true): r01 shelves `script-0006` at week 208 on its 13th rejection, with retry
>   week 234, so `film:6` no longer takes at post-tick 222.
> - Re-witness (1344-F5 A1, rule r3-row6): NONE, reason P3. The first take after 213 lands at post-tick 229, where
>   r01's `film:12` and r02's `film:14` both take. The leaf needs the repeat take alone in its week (:397) and allows
>   no take in any earlier week (:400), so no rival's take qualifies.
> - The fixture and the guard are unchanged. The shelving law removed the natural premise these leaves were written
>   against.

The hygiene commit (62f14e7) does not touch this file, so the line numbers hold at the sweep's final HEAD.

## 2. Promise rows 8-11: 1344-F5 Part A extends to them

**Ruling.** Part A governs R1-R3 in `tests/p14c2c-rival-promises.test.ts` and N10 in
`tests/p14c3-admission-boundaries.test.ts`, as it governs row 6. The cases match on every point Part A relies on:
- all four leaves passed at 1338;
- the shelving law moved their natural premise, and the probe attributes the move with every gate true (X11);
- the re-witness rule was declared per test file, reviewed ([1344-D7](1344-D7-promise-rows-and-row6-declarations-review.md),
  [1344-D8](1344-D8-promise-rows-r2-confirmation.md), [1344-D9](1344-D9-promise-rows-r3-confirmation.md)) and run
  before anything could be pinned;
- both searches returned NONE with 0 candidates and 0 errors, so no fixture change or widened horizon is in question.

A3 therefore applies: no test edit, and the four leaves stay failing as a declared exception. Entry text:

> **Declared exception (1344-F6, extending 1344-F5 A3): four NEW identities that passed at 1338.**
> - `tests/p14c2c-rival-promises.test.ts` R1 (:34), R2 (:49) and R3 (:60) fail at the shared premise :25,
>   `expect(promiseById(at2695, PROMISE)).toMatchObject({ outcome: null, progress: 0 })`. At 1338 promise-148 was still
>   open at week 2695. Under the shelving law, r01 shelves `script-0229` and `script-0230` at week 2612 on their 13th
>   rejection. The take then arrives through a commission after the hold, so promise-148 settles SATISFIED with
>   progress 1 (X11 predictions; [declarations-promises-r3.md](1344-stage/s10/promises-r2d/declarations-promises-r3.md)
>   rows 8-10).
> - `tests/p14c3-admission-boundaries.test.ts` N10 (:230) fails at :141 on the same promise for the same cause
>   (row 11).
> - Re-witness: NONE in each file (rows 8-10 and row 11), 0 candidates, 0 errors. The fixture
>   (`genuine-v35-c2b-rival-incumbent-cohorts`) and the leaves' horizons are unchanged.

## 3. How the closure reads the 1344-N success line

- **"No new identity"** holds when the recorded core gate's NEW set is exactly these seven declared exceptions plus
  any environment row that reproduces on a quiet machine, attributed separately (1344-N:80-82).
- **Environment rows.** The seven `bridge-supervisor` "Fake Unity" rows fail only in scratch trees (1320-X:12). The
  recorded gate runs in the repo. If they fail there, they are attributed as environment rows on their own evidence.
- **The hygiene row** must pass at the recorded gate, since the HYGIENE commit removes both offenders (X9).
- Any other NEW identity at the recorded gate is a finding. Nothing in this ruling covers it.

## 4. For the Owner

1344-K lists the seven exceptions with this ruling, X10 and X11 as evidence. They do not block the closure, as
1344-F5 A3 provides. A repair is a separate decision for the Owner: for example a new natural fixture whose chain
still holds each premise under the shelving law, or retiring the leaves. Either one needs its own charter and review.
