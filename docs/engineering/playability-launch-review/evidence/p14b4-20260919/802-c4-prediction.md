# 802 — C.4 matched-pass prediction, published BEFORE run 803

Source: `cda94b0a` (implementation `476046da` + §9 `ccb8ab17`, RED `8f8c9ab0` + coverage `e19cfd4d`, sweep
`cda94b0a`), clean tree. Static gates at this source were run by the parent after the sweep landed and before
this record: `npm run typecheck` exit 0, `npm run typecheck:bridge` exit 0, `git status --porcelain generated/`
empty. Run 803 will be `node_modules/.bin/vitest run --project core` under `run-fixed-source-c2.mjs`, the same
command as runs 772 and 787. The logs therefore compare by full test identity with `compare-failures-c2.mjs 787 803`.

**Title renames (checked now, so they cannot masquerade as results):** the sweep changed 32 test titles in 25
files, mostly "V34" becoming "V35" in a name. None of those 25 files has a failure in run 787, so no failing
identity is renamed. A renamed PASSING test shows up as nothing in the comparison.

## Falsifiers, fixed now

1. **Files 363** (361 plus `p14c4-cohorts`, `p14c4-save-v35`; `find tests -name '*.test.ts'` counts 363).
2. **Cases 4236 ± 2** (4179 + 29 + 28; the sweep adds and removes 32 `it(` lines each, all title edits).
   **Todo 9** (8 + the G2 `it.todo`).
3. **The C.4 suites: 56 pass, 1 todo.**
4. **Run 787's 62 failures:** each is retained with the same identity, OR it VANISHES and is traced. Vanishing is
   plausible for the first time in this programme. C.4 adds capable-but-unproven entrants, and 25 of the
   inherited failures (C.1's isolated-population loss: `p14b4-rival-seating-preference`,
   `p14b4-cast-class-outcomes`, `p14b1-trust-chooser`, `p14b4-cast-class-policy`) fail because natural searches
   find no such subject. A vanished failure is NOT banked as a fix until its passing search is traced to a real
   subject. FU-2 may pass or fail (4 of 6 so far).
5. **New failures: at least 1**, `p14c2a-save-and-settlement` E1 (a week-52 youth-floor entrant; 796 forecast,
   797 class (b)).
6. **Structural falsifier (794 §4):** any OTHER new failure sits in a test whose hollywood world reaches week 52
   or later AND reads talent, free agents, listings, rival staffing or a digest of them after that week. A new
   failure in a world that never reaches week 52, or that has `hollywood === null`, is a C.4 defect until
   shown otherwise. Changed CAUSES on retained failures are expected in the same population and each is traced.

No number above is an acceptance target. Every change is attributed before any expectation moves.
