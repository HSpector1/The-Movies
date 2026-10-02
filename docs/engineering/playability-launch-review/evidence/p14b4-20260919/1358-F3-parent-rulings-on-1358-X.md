# 1358-F3: parent rulings on 1358-X, for slice B RED r4

[1358-X](1358-X-rel-sliceB-red-r3-dry-run.md) ran RED r3 over the landed slice A candidate. Every count matched 1358-C3,
and the type gates gave exactly the 17 declared errors. The producer failed before writing anything. The test author
makes r4 with the items below, all test-side or producer-side.

## 1. The producer founds the studio first

`runCastingCompetitionRoute` must call `foundStudio(s0, market)` before its first `greenlightCycle`. Today it
commissions a screenplay from the unsigned writer "t-wri-05", and the run stops at
`requireCommissionableWriter`.
- **Ordering.** The author confirms the order against the route that `tests/p14b9-casting-competition.test.ts` and
  `tests/p14b10-conflict-evidence.test.ts` run on seed `r1314-casting-01`, so the producer reproduces that route.
- **Funding.** The author says whether `fundIfNeeded` still belongs before founding, or only after it.
- **Second dry run.** The parent runs the producer again (1358-X2) before any recorded mint.

## 2. Budgets that can fire (1348-F4 item 3; 1358-F2 §4 and §7)

Each build is memoized and self-timed, and a named error fires once it passes its budget. The rule is the one
1359-F4 set: about six times the slowest single-file time, rounded up. That allows about four times for full-suite
load and about 1.4 times for the pinned Node v20.20.2, since 1358-X ran v22.23.2.

| Build | 1358-X | Budget |
|---|---:|---:|
| `baseWorld()` | 14,082 ms | 90,000 ms |
| `rosterWorld()` | 5,704 ms | 45,000 ms |
| `cohortThreeFilms()` (the Mentor leaves) | 40,219 ms | 240,000 ms |

- `PROVISIONAL_BASEWORLD_BUDGET_MS` becomes this final number, and "PROVISIONAL" leaves its name and message.
- The Bridge file's Vitest timeouts keep the 1356-F5 note that they are not budgets.

## 3. The third-party leaf (1358-F2 §7)

It gets the guard the other leaves carry, so it fails at RED by name. It passes at GREEN only if a third party's open
bond blocks growth.

## 4. Unchanged

Everything else in r3. The 17 type-level RED errors stay; they are by design (1348-C5).

## Next

1. r4 from the author.
2. Parent dry run 1358-X2: the romance and Bridge files, and the producer.
3. Review 1358-D.
4. The recorded mint 1358-P at the last Save43 writer, which is HEAD before slice B's production. Slice A has landed
   and changes no save version.
