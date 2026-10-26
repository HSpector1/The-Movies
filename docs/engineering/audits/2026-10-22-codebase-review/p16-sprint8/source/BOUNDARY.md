# Sprint8 obligation producer boundary — review before source implementation

Base X9c91232dd980cbe05399b6fd77ed55454e671f86. This is an implementation interface for existing adopted P16 §5:77–87 and Owner assignment84–88, not new gameplay policy. No source/test/runtime/generator changes are represented. The current named refusal remains the required original-source RED.

## Record and version

Add the next explicit rights-union member `producerVersion:'absorption-obligations/v7'`. Do not allocate Save50, rewrite old records, or change old v1/v2/v3/v4/v5/v6 exact layouts/admission. V7 carries the existing base fields plus the full existing `stoppedScripts`, `continuedScripts`, `scriptCompletions`, `scriptDecisions` arrays (empty where no such work exists) and the following `obligations` object. Its script decisions use the same actual earned/native transition replay; v7 does not require an invented Accept/Rewrite/greenlight when it merely records a new close. Later real script decisions preserve outer v7 instead of discarding its obligation record by relabelling it v4/v5/v6. Old version-specific event restrictions remain unchanged. Empty v7 script arrays confer no carried-writing authority.

Proposed exact types (imports name existing current types; snapshots contain only these affected subjects, never a whole campaign):

```ts
type AbsorptionPromiseDisposition =
 | {kind:'unboundHistory'; original:ProfessionalPromise}
 | {kind:'continued'; original:ProfessionalPromise;
    sourceContractId:string; buyerContractId:string}
 | {kind:'exit'; original:ProfessionalPromise;
    sourceContractId:string; outcomeEventId:string};
type AbsorptionObligations = {
 promiseCountBeforeClose:number;
 firstTakeCountBeforeClose:number;
 marketReceiptCountBeforeClose:number;
 promises:AbsorptionPromiseDisposition[];
 withdrawals:{original:TalentMarketProposal;eventId:string}[];
 cases:{original:TalentMarketCaseV36;
        droppedProposals:TalentMarketProposal[];eventId:string}[];
};
```

The three cutovers are the actual pre-mutation root lengths. They bind same-week order, completeness and original open state, rather than relying on dates alone. Promise IDs are existing root ordinals. Native market receipt IDs resolve withdrawal/invalidation/outcome writes. Each assignment is identified by (absorptionId, original.promiseId) and the existing exact source/buyer contract links; no second allocator or arbitrary invented receipt number is needed. V7 must record at least one actual affected obligation/market subject. Ordinary previously supported clean closes may retain their existing producer versions.

Core quote gains `promiseObligations:{promiseId:string; disposition:'unboundHistory'|'continued'|'exit'; sourceContractId:string|null}[]` and `marketObligations:{proposalCount:number;caseCount:number}` after the existing permission/disclosure predicates. These are factual previews derived from actual retention links. Detailed affected windows/terms remain available through the permitted disclosure, not unrelated rival views. The existing `absorbStudio` payload and retention choice are unchanged; the buyer does not get to erase an existing commitment. Actual close records resolvable subjects, never just the preview counts. Bridge/canonical shape impact must be checked against its actual emitted surface after implementation; no projection identity is allocated by this note.

## Atomic C boundary and all four classes

C is the actual input state.market.tick accepted by closeAbsorption. Capture all cutovers/snapshots before closing mutations. Recheck the same complete quote, terms, consent, capacity and money; refusal changes nothing.

1. Unbound unattached history remains byte-identical in state.promises, including null contract/outcome. No fabricated terminal state, outcome receipt or trust. This follows promises.ts818–833/1782.
2. Attached unbound offers are withdrawn through the market's native removal/receipt owner; their promise records remain the same immutable unbound history. No automatic commitment to the buyer.
3. Bound nonretained employment actually ends through existing absorptionExit/capped exit charge. Call the existing promise termination producer only for those real exits. It settles once as ordinary BROKEN with the existing cause, preserves progress/evidence and appends its own native outcome receipt. No cancellation refund or acquisition amnesty.
4. Bound retained commitments remain the original promise ID/issuer/contract/window/predicate/feasibility and already earned work. The new disposition links that exact original source contract to its actual continued buyer contract. The original promise row is unchanged at close; future ordinary evaluation may change only its normal progress/evidence/outcome/successor fields. No reset/reissue/duplicate signing cost. A detached source snapshot preserves the prior values for replay.

Withdraw target-issued current proposals in their actual array order using an absorption-specific reason and native `proposalWithdrawn` receipt. Then invalidate each still-open target-subject case using native closeCase, preserving its original case and any remaining dropped proposals. Retained people have real new buyer contracts; nonretained people become actual free agents. Do not reuse closure's false all-free-agent wording or imply an actual distress closure. Keep current queue/other issuer order, dropped promise history and all unrelated proposals unchanged. No new proposal is accepted by the absorption.

Money, retained work binding, source terminal state and all these dispositions publish as one immutable close result validated before return. Nonretained promise outcomes are not conflated with unbound rows or retained commitments. The existing source guard/clean validator is replaced only for the new fully proved v7 producer; unsupported earlier-version obligations still refuse.

## Original identity versus operational buyer

Promise issuer/contract provenance and outcome/trust attribution stay original under the existing `settle` and `trustDrivers` law; no trust/Standing is transferred or minted at acquisition. Future qualifying work uses the proved operational employer assignment: original source takes in the pre-close prefix, then real buyer-operated takes after close, within the unchanged half-open promise window. A source take stamped produced week C already exists before input-C close and must keep its credit. Buyer first takes after that action arrive at C+1 or later. The root cutovers bind this order explicitly. Evidence remains the actual existing first-take IDs; one production is counted once.

The same assignment must feed existing feasibility/reservations, selected seating masks, retirement-cutoff, cancellation/termination and waiver evaluation. It is not a second promise engine. Exact source screenplay IDs in project predicates resolve through existing carried sourceProject→buyerProject links, never a namespace-wide match. Waiver keeps its existing consent/pricing law, original contract and source attribution; a genuine typed successor inherits assignment only through the proven supersededBy chain, not because it names the same person or studio. Public Bridge ownership/history recognizes that proved buyer while continuing to reject arbitrary rival waivers. Old original-issuer outcome/announcement history is retained.

## Historical proof and caller boundary

Introduce an optional current49 obligation authority in the existing private P15BEra propagation. Derive it afresh only for actual v7 records; absent-v7 returns before any new traversal. Before granting operational visibility, shape-check consumed fields and independently prove actual absorption/source/buyer identity/order, immutable pre-close promise snapshots and cutovers, source interval ending, the exact linked buyer bargain, and the market/outcome receipt references. Do not call the whole current save validator recursively. The final existing complete absorption/current49 proof remains mandatory after frozen descent.

Frozen V40 promise validation must receive this explicit current-era authority for buyer first-take evidence and retained successor joins. Historical public readers without context retain exactly their old law. Live promise consumers use the same independently checked assignment owner, not raw rights rows or a retained mutable cache. No authority may originate from an arbitrary original-promise payload, person match, unvalidated contract ID or stale cross-week grant. Full replay validates original prefix and all later progress/outcomes against actual evidence; it must not compare later mutable progress to the old snapshot as if time never advanced.

Actual R02 retirement candidate needs the whole producer: 19 genuine unattached unbound histories and bound promise13 (retained writer),15 and23 (nonretained exits), contracts208→416 at real312; script0035 is due313 beside the own retired draft due314. Its condition/disclosure/affordability/consent and public close remain runtime-unproved. Reusing the original real-E leaf/capture does not permit root transplantation. Source implementation and independent test author will preserve original-source refusal evidence before integration.

No new Owner product choice is established here. The representation/version/receipt reason choices are producer authoring under existing scope. Any discovered conflict with a specific adopted law must be surfaced rather than solved by automatic forgiveness, promise rewriting or a new outcome kind.
