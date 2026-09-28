# 1319-R: Save42 casting-driver production and GREEN

Production 1b675f75 lands the reviewed scratch draft
([1315-X-production-draft.patch](1315-X-production-draft.patch)); the six files equal the dry-run tree byte for byte
before commit. Two adopted RED files that import `bridge/*.ts` were renamed to `tests/bridge-p14b9-casting-expiry.test.ts`
and `tests/bridge-p14b9-casting-readers.test.ts` (10790fa6, content unchanged): `tsconfig.json` excludes only
`tests/bridge*.test.ts` from the root project, so under their old names the root type gate compiled Bridge without
`allowImportingTsExtensions` (TS5097). The 1315 dry runs used Vitest only and could not see it.

- GREEN [1319-casting-green](1319-casting-green.json): the same five files, source and HEAD 1b675f75, guards exact,
  **34 passed, 1 skipped, exit 0**, as 1315-F predicts. The skip is the `state.hollywood === null` clause.
- Contract drift [1319b-contract-check](1319b-contract-check.json): `generate-bridge-contract.ts --check` exit 0 on
  1b675f75; projection 56 and the schema identity are unchanged.
- Types ([1319-T](1319-T-type-errors-after-production.txt)): root 18, Bridge 2, UI 2 errors, all test-side (live
  `makeSave` output passed to V41 functions); no production file errs. These belong to the Save42 pin sweep.

Status: IN PROGRESS. Next: independent implementation review, a full core measurement of the Save42 fallout, the
Save42 pin sweep, then recorded broad gates.
