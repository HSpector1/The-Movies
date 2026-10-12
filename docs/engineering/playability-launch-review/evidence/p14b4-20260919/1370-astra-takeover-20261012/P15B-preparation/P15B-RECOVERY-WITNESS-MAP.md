# P15B recovery witness map — read-only preparation

Writer: GPT-6.1 Sol specialist founding_recovery_sol, 2026-10-12. No tests, compiler, simulation, source/package changes or other-package preparation performed. This is a proposed bounded verification route, not measured integrated acceptance.

## Authority and evidence identity

The latest task-specific authority is `1370-ar-integrator-tools-20261011/args/p15b-r3-verify.json`, especially 1362-O's recovery-before-live-closure requirement and 1366-O O1/O6. O1 authorizes only eligible non-core plant under the existing player demolition/refund law, protects four core filming facilities and dependencies, demands real recurring-cost and resumed-filming measurements, and explicitly forbids interpreting temporary cash as sustainable recovery. O6 books principal and ends cutting; ordinary staffing/greenlight rules resume and a subsequent cash fall may cause cutting again. Neither ruling promises survival or authorizes changing principal/reserve/package tuning merely to manufacture a witness.

Recovered P15B clone remains based on `8cecf5aa8a7073fdad8a02534fe40d67ba54558e` (founding r3), Save48 draft. Parent published its exact final delta, including late four-file amendments. Founding r7q2 integration is still in its parent-owned gate. Existing P15B balance is therefore evidence of the older stacked candidate, not future r7q2-adapted source.

## Why principal reset does not establish restarted production

`src/core/corporateConditionLive.ts:159–179` evaluates each distressed rival, takes the lawful maximum, books one `loanPrincipal` movement and returns `costCutting.since=null` atomically. `studioLoan.ts:37–42` makes principal floor(26×weeklyFixedCost/1000)×1000 under current v1; the original scheduled total is 112% over52 installments. `conditionFacts` at `:88` and `powerRankingArchive.ts:63–68` use the actual rival weekly operating cost, not capital needed for a film package.

`hollywood.ts:120–125` includes actual payroll, per-head/base overhead and capacity/instrument opex in that cost. The rescue maximum falls as cost cutting removes employees or O1 removes eligible plant. That is a real consequence of the fixed-cost sizing law, not evidence that principal has been lost or duplicated.

The next ordinary Hollywood pass (`hollywoodTick.ts:460–469`) staffs, admits/works research and decides before disposal. Ready packages receive only cash minus operating reserve (`:254–265`). A new commission also needs a writer, room in the ready index and cash beyond max(policy reserve weeks, draft+production+1) runway (`:326–364`). After that decision, `rivalCostCuttingEntry` (`hollywoodPolicy.ts:111`) may re-enter cutting when cash is below reserve, a package is truly unaffordable, or another precisely cash-bound refusal applies (`hollywoodTick.ts:377–384`). Existing cutting suppresses new commissions and staffing/renewals; real greenlight clears it (`:282`). No extra staffing/decision pass spends an O1 refund in the same tick (`:470–480`).

The principal is booked at produced boundary W by the condition phase. The next tick processes input week W. Thus balance entries `W:null`, `W+1:W` describe reset then next ordinary decision re-entry; they are not two contradictory writes inside the principal transaction.

`evidence/r3/balance-r3.txt` reports:

| Rival | Principal week / amount | Next produced state cutting since | Actual closure |
| --- | --- | --- | --- |
| r04 | 141 / 3,198,000 | 142 /141 |186 |
| r03 |283 /1,001,000 |284 /283 |328 |
| r01 |301 /3,119,000 |302 /301 |346 |
| r02 |334 /1,310,000 |335 /334 |378 |

No `filmAnnounced` after these loans is recorded in that route; each closes after44–45 weeks with outstanding loan remainder and negative cash. REPORT r3.b also reports drained diagnostic cases with post-loan cash0.7–2.3M versus cheapest package above3.4M. Those drained cases altered rival cash and are not proposed lawful acceptance inputs. The natural-route maximum values and cash/package/reserve gap suggest sizing/runway economics; actual causal measurements must separate reserve, staffing, package viability and research spending before declaring a tuning problem. The existing log does not contain those per-decision components. It does not prove a gameplay code defect, universal inability to recover, or sufficient O6 playability.

The balance probe source imports `./load.ts`; that sibling is not present in recovered r3 evidence. Its output and parent source backup remain usable historical evidence, but its starting route cannot be claimed fully reconstructed from that import alone. The new witness should use the actual generator explicitly.

## O1 plant and accounting boundary

`rivalResearch.ts:339–391` rejects the four core IDs development/stage/scenery/post. Current eligible blueprint is a paid, operational `research-laboratory` with its actual commitment/quote/refund provenance. Dependency checks at `:426–480` protect reserved work, research history, instrument commitments and other operational dependencies. `disposeRivalFacility` at `:392–407` removes the body and books one `facilityDemolitionRefund` with one receipt; `disposeEligibleRivalFacilities` at `:411` follows original commitment order and acts only while cutting. Ordinary tick adopts the atomic changed fields before opex. Validator at `:485–553` binds refund, paid plan, operational boundary, absent standing body, dependencies and period money. Core costs and any protected instruments remain unavoidable. O1 disposal is not terminal closure liquidation.

## Smallest lawful executable witness/search after adaptation

Use one scheduled serial probe on the actual adapted Save48 candidate, independently reviewed before run. No source rewrite, mocked chooser, direct rival cash edit, fabricated ledger/receipt, or deleted history. Rivals borrow through their ordinary distress policy; player `takeLoan` does not lend to a rival.

1. Start `p13aGeneratedStudio('p13a-core-causal-01')` at real week0 and advance only `tick`. Preserve input bytes at each selected boundary. First examine loans and genuine O1 receipts through600; the older balance route already establishes that a flag-only witness is insufficient. Additional seeds are bounded continuations of the same reviewed search: `seed-b` and Owner-required `p15a1-w2-market-01`, each through600. Stop per studio at actual closure or record loan+53 to cover its normal installment horizon. Stop the whole search once a qualified recovery witness is preserved; do not run an unbounded seed campaign. An absent qualifying result remains an explicit coverage gap.
2. At a genuine disposal and loan boundary, record studio/week/entity identity, operating status, pre/post cash, actual salary/head-count/base overhead, protected core facility cost, non-core body cost, instrument cost, total fixed cost, policy reserve, loan principal/installments and all real money movements. Use existing cost readers (`rivalWeeklyOperatingCost`, `rivalCapacityOpex`, `studioWeeklyFixedCost`) and receipt identities. Calculate avoided body opex from the exact eligible blueprint; do not subtract an instrument or other dependency protected by eligibility. Separate observed totals from a labelled counterfactual cost decomposition.
3. At principal commitment require one matching loan/money fact and reset. On the subsequent ordinary tick measure hire/renewal receipts, termination charges, screenplay status/slots, research expense, productions/runs and reserve. To discriminate economic rejection from cash blocking, prefer the unchanged public `searchIndustryPackages` with existing input builder/key/options, read-only, under the scheduled job. Any reconstructed input must match production's actual staffing, masks, history and reserve; an approximation cannot establish why a real decision refused. If instrumentation of private decision inputs would be required, stop at that exact evidence gap instead of changing gameplay in this witness.
4. A positive O6 witness requires a genuine new `filmAnnounced` production with `startTick>=contractedWeek`, matching production ID, real cast/director/craft and ordinary negative/marketing debits; it must follow actual cutting and loan. A pre-loan in-flight production or release is not restart. Follow the new production to first take and, if it reaches delivery within the bound, release/payment; report cash, protected costs, loan debits and any repeated cutting/closure. This measures whether restart happens, not guaranteed sustainable survival.
5. A combined O1/O6 witness additionally requires a real eligible disposal in that studio's recovery history and measured one-time refund/cost avoidance. If one witness covers O6 only and another O1 accounting only, label them separately; do not splice histories. No available eligible plant means no O1 witness, not permission to mint it.
6. Save/export/import/reload at disposal, principal and first restart. Continue original and reloaded worlds byte-identically for the selected short interval. Require no duplicate refund/principal/first-take/installment, retained protected IDs and truthful loan-stop/closure accounting if closure intervenes. Retain every refusal and unsuccessful candidate outcome.

## Unresolved facts and next action

The existing natural balance does not measure protected/non-core cost decomposition, post-loan reserve gap, affordable viable-package count or exact ordinary refusal cause. It contains no restarted borrower. No lawful generator run on the future founding-r7q2-adapted P15B source has occurred. Whether any of the three named seeds supplies eligible disposable plant plus a real borrowing restart remains unmeasured. No principal/reserve/loan-law tuning change is recommended or authorized by this preparation.

Next: finish founding qualification, adapt the preserved final P15B delta to that actual landed predecessor, resolve the known lawful research-fixture premise, then author/review this bounded read-only witness against its real interfaces. Parent alone schedules it. If restart remains absent, return exact economic cause and trace for a consequential finding/decision; never call resetting the flag completed recovery.
