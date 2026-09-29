# 1354-P: parent disposition of the P16 research interface (1354-W0)

[1354-W0](1354-W0-p16-wave0-facts.md) read the P16 research at 084713980ef8 against the adopted P15B law (1352-A with
1352-F). The research is not Owner authority. It found 17 interface points and 9 candidate Owner questions. The
parent disposes of them as follows.

## Carried into the P15B Wave 2 charter (delegated; decided there, reviewed before code)

1. **Operating-state vocabulary.** The registry field reserves `acquired` beside `closed`. One `isOperating(studio)`
   predicate is read by the condition step, the rival tick loop (`hollywoodTick.ts:312`), the bijection
   (`hollywoodValidation.ts:427`), chart rows and technology validators. Wave 2 writes only `active` and
   `closureDue`. `closed` arrives in Wave 4 and `acquired` in P16C.
2. **Loan record shape.** The persisted loan carries its schedule and the installments paid, so any later consumer
   can price the remainder exactly. `studio-loan/v1` stays: no early repayment, no second loan. P16's transfer rule
   is set in the P16 charter. The parent's proposal is that a target with an outstanding loan is ineligible for a
   healthy acquisition.
3. **Borrowed cash and bids.** A P16 guard: a studio with an outstanding loan cannot bid (1354-Q item 4).
4. **Leverage cap.** The only cap is the contracting cap `LOAN_MAX_FIXED_COST_WEEKS × weeklyFixedCost`. The research's
   "P15 loan caps" clause is dropped.
5. **Money kinds.** The loan inflow and installment kinds (rival `RivalMoneyKind`, player `LedgerKind`) land in P15B
   Wave 2's save step. P16's consideration and transfer kinds come in its own additive steps.
6. **Book Net Worth.** It belongs to the P16A valuation read model, its first consumer. Its debt line is the
   remaining installment total. The P15A.2 band keeps using cash only.

## Carried into the P15B Wave 4 charter

Items 7-17 of 1354-W0's conflict list: retention for failed studios, estate existence, claims and priority, negative
cash at closure, surplus, facilities, the `employerClosed` end reason, the player's estate, the shared disposition
table, the stage map for P16 eligibility, and closing exits against the unified termination predicate. Items 7, 8, 10,
11, 12 and 14 depend on the Owner's answers to 1354-Q items 1 and 2. Wave 4 cannot be chartered before those answers.

## Owner questions

[1354-Q](1354-Q-proposed-owner-rulings-p16.txt) puts the genuine product choices to the Owner with recommended
options:
1. closure disclosure and estate retention;
2. the player's estate;
3. archived rights;
4. growth financing;
5. due diligence;
6. healthy sale of a struggling studio;
7. a second bidder;
8. the retention default;
9. the lower-priority research defaults.

Items 1, 2, 4 and 5 touch existing Owner rulings (1122-A D3; ruling 3's end-of-run record; ruling 3's "no new
undocumented debt product"; ruling 2's "no private rival balances"). The parent may not settle them. Delegated items
stay with the charters: the StoryProperty mint point, the valuation formula, the P16A save root and the Licence
fields.

## Order

- P16A (library and rights identity) depends on nothing in P15B. Its charter can start once 1354-Q is answered or
  explicitly deferred, because the answers shape the rights of closed studios.
- P15B Wave 2 waits for shelving's closure and the §6 measurement, as adopted.
- Nothing here changes current work: shelving production, the P15B and P15C RED staging, and the slice A queue.
