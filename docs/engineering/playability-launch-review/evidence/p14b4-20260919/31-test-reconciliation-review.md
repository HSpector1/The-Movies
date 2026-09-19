# B4 additive reader — independent test-reconciliation review

2026-09-19 UTC / 2026-09-20 Europe/Berlin. **KEEP.** Read the full actual
thirteen-file test diff and `30-test-reconciliation.md`; independently rehashed
all thirteen current files against its table, with thirteen exact matches.
The authored report SHA256 is
`c524567982db189f752143d1cda2665655581f9f7a626e169b1c13c096fa272c`.

## Bounded disposition

- Twelve historical test files change only their current-dispatch unknown
  version probes from30 to31, range assertions from1–29 to1–30, and corresponding
  stale labels/comments. These are twelve files, not twelve individual assertion
  calls: `save.test.ts` retains two sentinel cases and the V9 case retains its
  separate unknown-version and handled-range assertions.
- Existing live29 expectations, frozen version admission, genuine fixtures,
  migration/history/digest checks, and older-version downgrade refusals remain
  untouched. No `toThrow` assertion is removed or broadened. Explicit refusal
  message patterns remain explicit. Recognition of additive reader30 is not
  substituted for the still-deferred live-writer30 obligation.
- `p14b4-cast-class-outcomes.test.ts` adds the real `validateSaveV30` import and
  validates/narrows the actual export/import envelope into `reloaded` before
  comparing its entire promises root to the actual outcome state's root.
  This preserves the equality assertion while adding strict V30 admission;
  there is no type cast, fake envelope restamp, tolerance, alternate fixture,
  omitted assertion or relaxed production validator.
- No timeout, skip/todo, production, configuration, fixture, generated artifact,
  or harness change is part of this reconciliation. The independently reviewed
  additive production candidate is not re-audited here. The separately installed
  capacity test is also not one of these thirteen amendments.

## Execution evidence and limits

Read completed `24-corrected-root-ui-typecheck.json` and raw output: command
`npm run typecheck` executed `tsc --noEmit && tsc -p ui/tsconfig.json --noEmit`,
2026-09-19T22:11:21.781Z–22:13:13.660Z, exit0, fixedSource:true. Both root and UI
typechecks therefore passed this recorded candidate. Its source identity is
`d39a9a04e4eae7767d5a15225de36e86f0440c14`, complete protected-patch SHA256
`bc25e15d9aeac9d5f2a26c372d156ebf759e374b755cab2818bd2a66a3e1ec98`;
the recorder names `tests/p14b4-cast-class-capacity.test.ts` as the same untracked
protected input at both endpoints. Do not substitute the earlier four-file
production-only patch identity for this larger checked candidate.

Check25 was running under the parent's sole runtime ownership during this
review. No result from it is claimed. This source/test-diff KEEP neither makes
the deferred B4 live assertions green nor establishes outcome/solver/bridge47
completion. Retain earlier diagnostic evidence18/19 and the policy-v1 REFINE.

Native read-only diff/file/hash access only; no test, probe, typecheck, network,
Git write or delegation. This review file is the sole edit. Next: parent records
the completed serialized affected-test and remaining verification results under
their actual fixed candidate identities before publishing the checkpoint.
