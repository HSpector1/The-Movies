# 1344-N: Save43 test pin sweep plan

Save43 (shelving production 1993fc4d, review 1344-J KEEP) makes the live save version 43. It gives every rival
business `screenplayShelving: {version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0}` and adds the
`screenplayShelved` receipt. The test suite still states Save42 as live. This plan scopes the test-side sweep that
returns the broad core and UI gates to their 1338/1343 retained sets. It follows the 1320-A method and changes tests
only: no production file, fixture payload or tsconfig.

## Measured fallout ([1344-M](1344-M-save43-core-measurement.md))

- **Broad core** over the 429-file allowlist at c614b7e9: 146 failed files, 848 failed tests, 1 unhandled error.
- **Against 1338:** 771 new, 11 changed, 67 same, 1 gone.
- **Types:** 19 root, 2 UI and 2 Bridge errors, every one a `SaveFileV43` passed where a `SaveFileV42` is typed, all
  in test files ([1352-L-type-gates.txt](1352-L-type-gates.txt)).
- **UI:** measured as `1344-save43-broad-ui`, next; the plan gains a UI section from it before dispatch.

## Classes (each edit gets one classification row)

- **S1 live validator selection.** `validateSaveV42(` on a live envelope becomes `validateSaveV43(`. A live envelope is
  one from `makeSave`, `migrateToLive`, a hydrated checkpoint slot, an explicit `LIVE_SAVE_VERSION` stamp, or a helper
  that returns one. A genuine V42 capture keeps `validateSaveV42`: `tests/fixtures/p14/genuine-v42-pre-shelving*`,
  and any other capture named by its manifest. This covers 281 rows plus 26 not-throw leaves.
- **S2 live literals.** A `toBe(42)` or equivalent that states the live writer's version becomes 43. This includes
  helpers: `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17` (1338 cluster C3, and 1358-C F2, which blocks the
  Mentor leaves of slice A and B), `tests/helpers/p14c3-fixtures.ts` and their siblings, and the 93 "existing live
  writer moves coherently to 42" rows. A literal that names a genuine historical capture keeps its number.
- **S3 future-version sentinels.** A save stamped 43 to prove an unknown version is refused now carries a valid
  version. The sentinel becomes 44, "unknown saveVersion 43" becomes 44, and "versions 1 through 42 only" becomes 43.
- **S4 live-to-V41 chains and typed helpers.** `convertV42ToV41(live)` becomes
  `convertV42ToV41(convertV43ToV42(live))`. Frozen builders fed a live envelope go through `convertV43ToV42` first.
  The 19 + 2 + 2 type sites pass the projected envelope, or are retyped `SaveFileV43` where the value is live.
- **S5 migration comparisons.** A migrated V42-or-older genuine input is compared with the old state plus the known new
  roots. The expectation gains, on every rival business, the empty `screenplayShelving` that `convertV42ToV43` writes
  (`save.ts:10678-10686`). One generic helper beside `withRivalTermination` builds it from the old state, never as
  literals. This covers 21 + 15 deep-equal rows and the four "actual migration must change the current envelope" rows.
- **S6 hand-built businesses.** A rival business built in a test and fed to the live validator or the rival tick
  carries `screenplayShelving`. This covers the 13 `Cannot read properties of undefined (reading 'shelved')` rows.
- **S7 shape pins.** A pin on the live business key set, the receipt-kind catalogue or a size bound that the new field
  or receipt widens includes them. This follows the live-version sweep checklist: exact id rosters and size bounds of
  widened tables.
- **S8 refusal messages.** A tamper or refusal leaf that now reaches `validateSaveV43` first expects the message that
  validator gives for the tampered field, measured and cited by source line. This covers about 25 rows whose own guard
  is now masked by the version check.
- **S9 the first downgrade guard.** A live save whose history includes a shelving meets `convertV43ToV42` first
  ("cannot downgrade or discard a screenplayShelved receipt", or a rejection count, shelved screenplay or commission
  hold). An expected message names the measured first guard. Where the leaf's title names an older guard, its comment
  records the masking and names the test that still covers the older guard on its own era's genuine input (the 1320-A
  S9 form).
- **S10 natural-chain values.** A pinned value that moves because shelving changed rival behaviour from week 93
  (1344-X6) is re-derived from receipts on the chain, never copied from a run output. Known rows:
  `bridge-p14b5-relationships` family 12 (three rows: two digests and a ledger length of 48 against 41) and the
  `p14b4-rival-seating-preference` digest. Before writing, the author pre-declares for each pin the one assertion that
  may move and the receipt facts a lawful movement must show. The reviewer checks the declarations before the author
  runs.

**Out of scope.** The 79 retained 1338 rows keep their causes. That includes the 42 C8 natural-search rows, which are
SAME after shelving and belong to the §7 verification, not the sweep. A retained leaf that a Save43 pin now masks moves
past the pin, so it fails again with its 1338 primary. That covers seven changed rows (by 1338 cluster: C1, C15 ×2,
C20, C3 ×3; the other four changed rows are the S10 rows) and nothing else in them changes. **Environment rows** (1344-M: hygiene `ELOOP`, two 30 s timeouts, the
supervisor replacement) get no edit. The recorded gates re-measure them on a quiet machine.

## Interaction with staged work

- **Slice A RED r5** (`tests/p14b5-relationships.test.ts`, `tests/p14b5-t-failure-tuning.test.ts`) and **slice B**
  touch files in this fallout. The sweep lands first, as the Owner's order puts shelving's verification first. The
  test author then rebases r5 onto the swept HEAD. Slice B's RED is regenerated there too.
- **P15B Wave 1** landed (1352-L); its files are not in the fallout.

## Deliverables and process

1. The test author stages `1344-stage/1344-save43-sweep.patch` (cumulative against HEAD), a classification JSON (file,
   line, old text, new text, class, measured cause or frame) and a handback.
   - Checked with a temporary index (`git apply --check --cached`).
   - Scratch trees link `docs`, `node_modules`, `art`, `tools` and `tests/fixtures` with `ln -sfn` and never copy them.
   - The author's broad runs happen only when the parent says the machine is quiet.
2. The parent dry-runs each revision in scratch: three type gates, full core, UI.
3. Independent review (1344-D4) of the final revision, parent application, recorded broad core and UI gates on a
   quiet machine, attribution against 1338/1343, review, then the §7 verification and closure 1344-K.

**Success:** type gates clean; the broad core gate's failing identities equal 1338's 79 minus the gone exporter row
(same primaries, the seven masked rows restored, the four S10 rows attributed), plus any environment row that reproduces on a quiet machine,
attributed separately; the UI gate's equal 1343's 10; no new identity.
