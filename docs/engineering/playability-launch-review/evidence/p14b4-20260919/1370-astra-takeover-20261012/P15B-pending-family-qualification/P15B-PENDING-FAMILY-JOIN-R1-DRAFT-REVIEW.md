# Pending-family terminal assertions helper r1

GPT-6.1 Sol. REFINE before test installation/compiler. Source-only, no execution/R/C writes.

Concrete compile defect: talentMarket.receipts is readonly TalentMarketReceipt[] (types.ts:2146), so forged.talentMarket.receipts.push is invalid. Replace the copied root/receipts immutably; do not cast away readonly or widen production types.

Required purity missing: no hostile mutant checks before/after bytes around either direct validator or makeSave. Add a bounded refusal assertion helper or explicit snapshots ensuring both refusals leave each mutant unchanged, while keeping exact direct error phrases. Positive roundTrip already checks original source purity.

Require nonempty positive exact1 proposalWithdrawn receipt at closure/issuer/talent before deleting/forging it; require a defined actually nonclosed other entered studio before foreign closure receipt mutation. These prevent no-op deletion/undefined spread or undefined-other exceptions from masquerading as intended RED. Preserve one retained applied proposal disposition; currently positive row presence/count is asserted but applied status relies on caller’s already measured case.

Completeness mutants remove exactly the real family row and recompute counts+digest before directvalidateStudioClosureRoot. Exact “no disposition for live subject” guards match source:859; orphan subject/refusal source:854 and foreignwithdrawal closure:877 align. These are distinguishing source-history completeness controls, not checksum-only mutations. FullmakeSave genericthrows can encounter another guard earlier, but direct exactcause separately proves intended closure seam. Roundtrip uses real currentexport/import/migration/save equality; no timing/input construction added.

Scope only player pending-adoption completeness/roundtrip and four targeted proposal mutants. Rival unfinishedbuild and original joint-family allsubjects remain unqualified until separate actual producer/terminal evidence; no new forged classes or framework needed. Default5s measured leaf budget applies to enclosing tests even if synchronousPASS; helper has no independent runtime qualification.
