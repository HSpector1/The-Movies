# 231 — Calculator-efficiency source review

Native Fable contract-auditor: DONE — qualified KEEP for arithmetic delta.
No concrete defect found.176 runtime usefulness gate separate/pending evidence.
No files changed or runtime executed. Parent persisted full report.

## Identity and scope

Read complete227 handback/full replay diff against779e65b6c3710e4fa530d9fbce2aa9a9e245a63a.
Rehashed replay376eb23874fb9d1a142f58c29ce2f3832c7b7a021f3d2698cf6bbbc349dcfe79;
227handback6f3be65789945ef8ada4479045a1553d8c44b774082ea802e62fe8eea39505dd.

## MET WITH SOURCE EVIDENCE

- Actual work removed: replay185–211 removes add(0,a) from multi-term sums.
  All30 binary sites call existing prepaid binary operation directly, avoiding
  sixteen optional guards/redundant zero-add. Multi-term guards still execute
  and retain20-unit payment.
- Saturation preserved: admitted nonnegative cost operands give same saturated
  value. Already-saturated a makes subtraction comparison return ceiling without
  unsafe addition. Product overflow handling unchanged.
- Payment order: every changed external arithmetic call retains paid receiver
  BEFORE argument evaluation. Direct addition pays8 before body; multiplication
  pays10. Nested calculators independently prepaid.
- Tighter receivers justified:29 product reductions only literal/local-scalar/
  shallow-property operands. Complex arithmetic/conditional/nested-product
  arguments retain larger bounds. Longer sort/task/arrival binary expressions
  retain16; unchanged token dispatch retains16. No variable traversal/callback
  body reassigned to small scalar allowance.
- Inventory matches diff:30 binary sites across Work, sorting, company/writers,
  dimensions, restricted/allocation/general bills, commands/frame wrappers;
 29simple product sites across sorting/company/geometry/order/restricted/
  allocation/general bills/commands.
- Owner bills unchanged: argument expressions/order/saturated values preserved.
 218 retention conditions, raw-claim/occupancy distinction, full facility-policy/
  sort costs, literal charges, final settled scan and owner invocations unchanged.
  No ledger/event/command/domain/limit/completeness-policy change.

Source-derived savings from removed calculator operations/tighter scalar bounds,
not discounts to unchanged owner work. Callable add in unexported Work class
creates no public API.

## Remaining qualification

No fresh test/typecheck claim.225 failures/226 post-sweep limit diagnostic remain
historical evidence until corrected candidate completes immutable25 cases,
including two-pictureH6 replay/shared kernel allowance.
Broader223 owner-accounting qualifications remain; bounded KEEP is neither
universal coefficient certificate nor replay/fullB4 acceptance.
Next complete queued typechecks/immutable controls; separately reviewed grandfather
case with unchanged limits/assertions.
