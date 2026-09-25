# 780-A — bounded contract review of the C.2b draft (contract-auditor, read-only), summarized by the parent

Reviewer: contract-auditor role contract via a general-purpose agent (roles not registered), model Sonnet,
Read-only, during matched run 787 (nothing executed). Returned inside run 787 (20:55:40–21:46:31 CEST, the run's recorded bounds).

VERDICT: REFINE.
- Q1: the gap is REAL (`careerLifecycle.ts:200` computes E once as a floor; `contractEndRefusal`
  `:74-79` only caps, never lands a contract on E). R19 labels "start at the effective week" an
  IMPLEMENTATION RECOMMENDATION, so the delegated reading (a) is licensed and is the most faithful: it keeps
  every Owner-selected invariant (one opportunity, sole current employer, E moves by exactly 52, no chain).
- Q2: X9's split is necessary (today lifecycle settlement at `tick.ts:1154` would retire the person before
  the market evaluates the extension) and does not break C.2a's same-week invalidation (keyed on intent).
  GAP: no owner or position is named for writing `effectiveWeek += 52`, `extensionUsed = true` back into
  `careerLifecycle` from the market's settlement (`talentMarket.ts:958-1213` never touches it today).
- Q3: GAP: `submitProposal` (`talentMarket.ts:415-416`) and `marketEligibility` (`:84-87`) hard-block any
  announced person; `bridge/contract.ts:405` repeats the check; `bridge/market.ts` `caseRow` (`:89-106`),
  `bridge/people.ts` `marketAttentionRows` (`:919-954`) and the chooser's single-survivor sentence
  (`talentMarket.ts:922-923`) all frame a case as competitive. None is named in 780.
- Q4: the 1.10 factor and the rival policy are correctly PROVISIONAL; nothing invented.
- Q5 (defects, priority): the single-exception carve-out; the write-back owner; a test that every issuer
  except the live extension issuer is refused (and that issuer outside the window); bridge treatment;
  validator cross-checks for extension cases.
