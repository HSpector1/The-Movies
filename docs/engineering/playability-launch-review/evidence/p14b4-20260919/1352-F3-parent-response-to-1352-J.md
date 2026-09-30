# 1352-F3: parent response to 1352-J (P15B Wave 1 implementation review)

Review: [1352-J](1352-J-p15b1-implementation-review.md), **KEEP**, no blocking defect.
Candidate: [1352-stage/1352-p15b1-production.patch](1352-stage/1352-p15b1-production.patch) over the final RED
[1352-stage/1352-p15b1-red-r3.patch](1352-stage/1352-p15b1-red-r3.patch). Parent dry run:
[1352-X3](1352-X3-production-dry-run.md), 52 of 52.

## Decisions

1. **Adopt the candidate unchanged.** The reviewer traced both modules line by line against 1352-A §4 as amended by
   1352-F and 1352-F2 and confirmed the four checkpoints that earlier reviews had failed or flagged: first evaluation
   counts its own week, the `distressWeeks` override, `remedies` forwarding the real stage and `founding` to
   `loanEligible`, and money-free error messages.
2. **Writer findings 1 and 2 stand as written.** `remedies` refuses a closed condition, matching `stepCondition`.
   `contractLoan` checks only the principal law; its pinned signature carries no stage, so eligibility belongs to the
   Wave 2 caller.
3. **Archive the reference check.** [1352-E-refcheck.ts](1352-E-refcheck.ts) is committed with this record as
   evidence. It imports from the writer's scratch tree and does not run in the suite.
4. **Carried into the P15B Wave 2 RED** (1352-X3 items 1 to 3 plus the reviewer's item 4):
   - no closed studio reaches `stepCondition` or `remedies`;
   - `takeLoan` and rival policy call `loanEligible` before `contractLoan`;
   - an integer-cash leaf pins the exact threshold week;
   - one committed leaf runs the Lemma B property (distress entry timing does not depend on
     `CORPORATE_WARN_COVER_WEEKS`) over at least three values of that constant.

## Landing

Commits stay frozen until the recorded 1344-save43-broad-core measurement and its postflight finish. Then, in order:

1. Commit this record, 1352-J, the production handback, patch, refcheck and 1352-X3 files; push; verify the remote.
2. Apply the r3 tests with `git apply --index`; commit; push; recorded RED run over the two files (expect 52 failed).
3. Apply the production patch with `git apply --index`; commit; push; recorded GREEN run over the same two files
   (expect 52 passed); `cmp` each landed file against the reviewed scratch tree.
4. The three type gates. The modules have no importer in `src/`, so the broad gates that follow the Save43 sweep
   serve as P15B Wave 1's broad gates.

P15B Wave 1 stays **IN PROGRESS** until those broad gates are attributed.
