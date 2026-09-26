# 806-A — bounded contract review of the C.2b API contract 806, summarized by the parent

Reviewer: the contract-auditor role contract run through a general-purpose agent (roles not registered), model
Sonnet, strictly read-only while run 805 was recording. It reported Read as its only tool (no Glob/Grep/Bash).
Returned 2026-09-26 during run 805 (started 02:12:05 CEST).

**VERDICT: REFINE.**
- Q1: every 780 X-decision and every §5/§6 amendment appears in 806 faithfully; nothing dropped.
- Q2 (VERIFIED at source): (a) intent/settlement reordering is equivalent, because the record sets are disjoint
  (`careerLifecycle.ts:160-223`); (b) extension discovery must be a separate pass, because the existing loop
  skips anyone with a record (`talentMarket.ts:1268`); (c) the freeze cap (`:1117`) is the ONLY cap gate, since
  the commit functions never re-read the lifecycle; (d) moving the record before the commit is safe, and a throw
  aborts the tick (no try/catch in step 4); (e) terms 52–63 pass `offerForTalent`'s clamp but hit
  `CONTRACT_LENGTH_FACTOR`'s `?? 1.0` fallback, a pricing cliff; (f) the rival-trigger loop (`:1298-1312`) hard-codes
  208 weeks and always authors a promise; (g) `case.contractId` names the pre-extension row, so the validator
  cannot find the extension contract through it.
- Q3: no C.4 or C.2a interaction broken.
- Q5 defects: rival site unnamed (HIGH); validator contract lookup (HIGH); `submitProposal` refusal must be
  narrowed (MED); `attachPromise` guard and its data source (LOW); the pricing cliff (LOW).

Disposition: all five adopted in 806 §8. The parent verified defects (e) and (f) at source before adopting them
(`tuning.ts:384`, `employment.ts:279`, `talentMarket.ts:1302`).
