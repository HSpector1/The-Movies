# 1344-X3: parent dry run of the shelving RED r2 (1344-C2)

Scratch tree from HEAD e8caeb90 (the 1327-C method; `tests/fixtures` linked read-only). The patch
[1344-shelving-red-r2.patch](1344-stage/1344-shelving-red-r2.patch), sha256 3575ee67…, applies cleanly. It changes four
test files: the three suites and `tests/p14d1-rival-shelving-fixtures.ts`.

## Result ([output](1344-X3-red-run.txt))

51 leaves: 46 fail and 5 pass, in 74.0 s (77 s wall). This matches the handback's classification.

Every failure reason traces to missing production:
- no `screenplayShelving` root: "Cannot read properties of undefined (reading 'rejections')" ×7;
- `LIVE_SAVE_VERSION` 42 ≠ 43 ×3;
- missing exports: `convertV42ToV43`, `convertV43ToV42`, `validateSaveV43`, `searchIndustryPackages`,
  `rivalPromiseProjectCandidates`;
- the natural-route premises, with no shelving receipt yet;
- the feasibility digest premise the handback derived.

One failure needs a note. The retry leaf stops at `productionIdentity.ts:111`, the exhaustive switch's
"Unhandled Industry identity", because at RED the receipt kind `screenplayShelved` does not exist. That is the right
RED reason. Production has to add the kind to that switch.

## Durations

The natural-route and determinism leaves carry explicit budgets of 60 s and 120 s. The measured leaves reached 18.1 s
at most (`at least one screenplayShelved receipt occurs`), within their budgets. Every other leaf stays under the core
default of 5 s.

## Next

Independent re-review 1344-D2 of r2 against 1344-D's two blocking defects, 1344-F2's three notes, and this run. After
an ACCEPT, the shelving production goes to the single writer ahead of the queued Power Ranking revision, because the
Owner put shelving first.
