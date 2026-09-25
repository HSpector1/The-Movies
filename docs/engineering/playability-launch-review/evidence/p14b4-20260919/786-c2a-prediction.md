# 786 — C.2a matched-pass prediction, published BEFORE run 787

Source: `5aff0e60` (implementation `ad154f5b`, RED `0ee95a08`, coverage `a820f885`, sweep `5aff0e60`), clean tree.
Static gates at this source (parent, 2026-09-25 ≈20:55–21:00 CEST by the session clock): `npm run typecheck`
exit 0 (80 s); `npm run typecheck:bridge` exit 0 (32 s); `check:bridge-contract` exit 0;
`check:bridge-contract:fixtures` exit 0; `git status --porcelain generated/` empty (projection 50 unmoved).

Run 787 will be `node_modules/.bin/vitest run --project core` under `run-fixed-source-c2.mjs`, the same command
as run 772, so the two logs compare by full test identity with `compare-failures-c2.mjs`.

## Falsifiers, fixed now

1. **Files 361** (358 + the three `p14c2a-*` files). A different count means a file was added, lost or failed
   to collect — each explained before anything else is read.
2. **Cases 4179 ± 2** (4139 + 40 new C.2a cases; the sweep reports no case added or removed, ±2 covers a
   miscount of mine). A count is a completeness check, not an acceptance target.
3. **All 40 `p14c2a-*` cases pass.**
4. **Every one of run 772's 55 failures is retained with the same identity**, except FU-2
   (`bridge-runtime-checkpoint-prepared-reuse`, intermittent 3 of 5), which may pass or fail. A VANISHED baseline
   failure is investigated, not banked. The 25 isolated-population failures may keep their identity with a
   CHANGED cause (retirement moves the same natural searches); each such change is traced.
5. **New failures: at least the 7 the sweep measured** (`p14b5-relationships` family 6 ×6, traced in record 788:
   four idle-in-window people retired by week 206 left the sampling pool under D11, so the week-207 hiring
   rotation redrew and the test's natural "listed at both 207 and 208" premise lost `t-act-00`; and the
   `bridge-p14b5-relationships` seed-b ledger 48 → 47, not yet traced).
6. **Structural falsifier:** any OTHER new failure must sit in a test whose world reaches week 104 of its own
   provenance record (the idle clause's floor) or holds a person at or past a hard boundary. A new failure in a
   world that never reaches either is a defect in C.2a until shown otherwise.
