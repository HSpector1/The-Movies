# 1364-A — bounded late-founding correction (draft for independent review)

Prepared 2026-10-04 by the founding-charter specialist. This is a proposed executable charter, not adoption or executed proof. Production remains with the parent. No source, fixtures, Owner saves, tests, or running trees were changed or executed.

## 1. Authority and source identity

Owner authority is 1362-O, **third response**, adopting the supported browser import exposure found in 1364-R. Both invariant failures must be corrected after Save45 and in the parent's ordered 1363 → 1364 → 1365 sequence. No new approval is needed for routine implementation. Preserve 1356-X F-2 and the corrections in 1356-F4/F5 as historical evidence.

Source inspected: the frozen reviewed Save45 candidate `/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree`, commit `ee289de67e453ce269c98d840a48799265c62993`. Repo authority records were read at the handed-off `266c172c` checkpoint. All line references below name this frozen candidate, not the future 1363 landing.

Success means a supported accepted import can perform the actions its founding screen offers, then save and reload. Unsupported/malformed imports refuse before replacing the existing campaign. No historical signing payment is invented, no cash is backdated, no bonus is charged twice, no obligation is erased, and no frozen validator learns a new historical exception.

## 2. Verified causes and bounded decisions

### A. Signing during a late imported draft

`employment.ts:568` opens the draft and initializes a migration-origin industry at a nonzero week. `actions.ts:2560–2579` pays a founding signing bonus from `founding.budget`, incrementing `spentBonus`, without a cash-ledger row. `actions.ts:3080` then calls `recordPlayerEmployment`; `industryEmployment.ts:29` emits the truthful `player-contract` reason and exact contemporaneous employment receipt. `hollywoodValidation.ts:568–569` demands an operating-cash signing row except for observed migration contracts and fresh week-zero contracts. Closing founding discards the only recruitment-fund balance. Consequently, a legal late founding signature has no durable proof of its real payment source.

**Correction:** persist a small dedicated recruitment-fund authority and validate its forward allocations as an alternative to a cash signing payment for the exact covered player contract. Keep employment reason, terms, start week, and industry receipt unchanged. Do not relabel a new signature `existing-player-contract`; that reason means observation at migration and has different chronology.

### B. Advancing an open draft

`tick.ts:197` has no draft guard. Once `economyEngaged` is true, rival production can enter shooting and `technologyProduction.ts:85–93` records its actual method lock. `technology.ts:897` rejects all technology authority while the player draft is open. `tick.ts:1025` already documents that ticks run post-founding. Supported browser and bridge controls withhold advance during founding (1364-R); the exception is the core API/harness boundary.

**Correction:** at the very start of `tick`, before `prepareLiveWritingContext`, RNG deserialization, phase allocation or any producer, reject `state.founding !== null` with a stable named error: `tick: complete studio founding before advancing the campaign`. Apply this equally at week zero and later weeks. Preserve the technology validator and method-lock writer unchanged. This prevents the invalid transition and does not erase genuine rival activity or add a new late-start mode. `advanceWeek` naturally propagates this engine refusal; no advance button or bridge intent is added.

## 3. Funding authority and migration contract

The following proposed representation is intentionally independent of the P15 allocator. Name it `foundingFunding` and add it only in this correction's new live save era:

```ts
type FoundingFunding = {
  version: 1
  recordedFromWeek: number
  fund: null | {
    provenance: 'opened' | 'observed-open-draft'
    budget: number
    spentAtRecording: number
    spentBonus: number
    openingEmploymentCount: number
    closedWeek: number | null
    closingEmploymentCount: number | null
    allocations: Array<{ contractId: string; week: number; amount: number }>
  }
}
```

- `fund: null` states that this root has recorded no open fund. It makes no claim about historical founding or historical payments. Generated headless worlds and migrations of already-closed campaigns start here. Their existing historical employment exceptions remain intact.
- A fresh public `beginFounding` opening records `provenance: 'opened'`, the actual current week, the actual recruitment budget, zero `spentAtRecording`/`spentBonus`, and no allocations. Re-entering an already-open draft is idempotent and never resets its fund. A campaign with a recorded closed fund cannot reopen or refill it; refuse clearly rather than mint a second grant.
- Migrating a valid older open draft records `provenance: 'observed-open-draft'`, the input's current week and budget, and its `spentBonus` in both spending fields, with no allocation rows. This records a present balance only. It does not infer which historical signature spent that balance or fabricate payment dates. Valid old migration-observed contracts stay exactly as they were.
- Require finite nonnegative budget/spending/amount values, `spentAtRecording <= budget`, canonical safe weeks, and `recordedFromWeek <= currentWeek`. The validator, not only the opening writer, requires `spentAtRecording === 0` for `provenance: 'opened'`. Do not replace the input's valid budget with today's tuning constant. Money follows the engine's existing monetary precision; do not add a new rounding rule.
- Every **new** founding signature appends exactly one allocation for the exact player industry `contractId`, at its actual start week, for its actual signing bonus. Use the employment recorder's assigned identity, not a duplicated contract-ID generator. Atomically attach the funding allocation after the same action has recorded employment. Sign failure returns no allocation, no contract, no cash movement, and no modified caller state.
- Allocation contract IDs are unique, map to player employment with reason `player-contract`, and have exact amount/week agreement with contract terms and the existing start receipt. Rows remain in signing order; all are at or after `recordedFromWeek` and no later than closure/current week. Zero-cost signatures still receive one zero allocation.
- Record `openingEmploymentCount` as the industry's exact employment-array length when this fund begins recording. At closure, persist the then-current length in `closingEmploymentCount`; both closure fields are null while open and both are present while closed. Counts are safe integers, bounded by the permanent employment register, and closing count is at least opening count. The covered interval is `[openingEmploymentCount, closingEmploymentCount)` when closed and `[openingEmploymentCount, employment.length)` when open. Every player `player-contract` row in that interval requires exactly one allocation, and every allocation names a row in that interval. Rival and renewal rows remain outside this payment rule. This gives a bidirectional completeness check and distinguishes old and new signatures at the same week. Apply the old fresh-week-zero payment exemption only to pre-boundary rows when this fund exists; operating signatures after the closing frontier require ordinary cash even if founding and signing happen in the same week.
- The sum of forward allocations plus `spentAtRecording` must equal the persisted `spentBonus` and may not exceed budget. Advance this spending balance atomically with each new allocation and preserve it at closure; deleting an allocation must not silently lower historical spending. While the draft is open, both its budget and spentBonus must exactly reconcile with this authority. While closed, `closedWeek` is a real week at or after recording; allocations remain permanent. `foundStudio` closes this fund in the same pure transition that closes the draft. Refused minimum coverage leaves everything unchanged.
- A funding-backed signature receives no cash debit. Do **not** enforce this as blanket absence of a `signingBonus` ledger row for its talent/week: that person can lawfully terminate and sign an operating contract later in the same week. Reconcile the whole talent/week signing group against its exact employment intervals: recruitment-covered intervals consume their allocation; ordinary charged intervals consume distinct matching cash rows (amount and existing signing/renewal note), and no single row can discharge two obligations. Recognize actual pre-boundary historical cash rows under their unchanged prior-era law, without creating a new requirement for exempt observed contracts. A surplus cash row attributable only to a funded interval is a double-payment refusal, whereas a row consumed by the later ordinary interval is lawful. No ledger `contractId` schema expansion is authorized solely to simplify this join. The live Hollywood validator accepts recruitment allocations only after full funding validation and exact joining; all other signatures retain their cash-payment requirements. The old fresh-week-zero and existing-migration exemptions remain for genuine pre-boundary historical rows.
- Never compact or delete funding allocations on expiry, renewal, termination or closure. A later ordinary renewal/signature still uses its existing cash law; founding receipts do not exempt another interval for the same person.
- Pair state and authority in both directions: a live industry with an open founding draft requires a nonnull open fund; an open fund requires that draft. A closed fund requires `founding === null`. Nonnull closed authority can never revert to null. A null fund is allowed for headless or already-closed historical states and makes no claims about their past.

### Explicit historical-control compatibility

`beginFoundingHistoricalControl` deliberately signs and closes before an industry exists (the accepted `foundMidGame` helper at `tests/p15a2-power-ranking-archive.test.ts:235`). Keep that analysis path: while `hollywood === null`, no industry contract ID or funding allocation can be minted. Leave the new root empty through those intermediate historical-control actions; their preexisting recruitment accounting remains unchanged. After the draft closes, `initializeHollywood(..., 'migration')` continues to observe the existing contracts with `existing-player-contract` and the new root remains empty. This is not the supported late-import regression route and cannot be substituted for it. Opening/recording of the new authority belongs to the public live `beginFounding` after industry initialization, or to the explicit save converter observing an older open draft—not blindly to the shared private `beginFoundingDraft`. If any historical control initializes industry while still open, give that explicit caller the observational opening helper before it becomes a current valid state; never infer historical allocation IDs. Frozen V18→V19 conversion must not acquire this newer root.

### Save-era discipline

Allocate the next unused version from the actual accepted 1363 predecessor; do not assume Save46. Freeze that predecessor's state/types/reader. Add a detached forward converter and validate its output; migration is idempotent and does not modify the input object or text. Validate the original envelope with its original reader first. An older state already missing a required player cash signing payment is invalid and must **not** be rescued by synthesizing a recruitment allocation.

Thread a typed, already-validated funding context through the live validator chain to `validateHollywood`, using the repository's explicit era/context pattern. Frozen public readers default to no funding context and continue to reject the historical bad signatures. Do not forge a temporary cash ledger to get through a predecessor validator, swallow its error, change `origin`, or strip offending employment.

Downgrade refuses every nonnull recorded fund, even an empty `opened` fund: stripping it could discard the payment boundary or one-shot opening provenance. Only a null fund with no recorded authority may strip, and only if the destination's own validator accepts the remainder. This deliberately avoids assuming a downward/upward roundtrip can recreate the observed boundary. The already-existing P15 refusal order remains owned by its contract; append this era's own precise refusal consistently without masking unrelated fixture purposes.

Update all current writer/reader/builder/lift paths and generated schema declarations required by the new live type. Keep historical fixture bytes and historical reader semantics unchanged. This root adds no UI or bridge command and no projection-version bump is justified merely by persistence; regenerate/check actual impacted generated artifacts. Do not fold it into `P15_ROOT_KEYS` or `p15Sequence`.

## 4. Import boundary and malformed input

`ui/src/engine/adapter.ts:3790` already returns a typed failure from `importSaveJson` and preserves its input. StartScreen and Saves replace the campaign only on success. Keep that behavior and test both entry surfaces. A new state accepted by the live importer must have a valid funding root; a legacy draft receives only the explicit observation described above.

Reject malformed root shape, inconsistent balances, missing contract joins, duplicate allocations, false cash/recruitment double payment, future allocation/closure dates, and allocations for rivals, renewals or historical observed employment. Such failure cannot clear a draft, rewrite money/history or replace the existing campaign. No generalized repair of arbitrary edited saves is in scope.

Use a generated, clearly labeled input: headless `generateWorld(seed)` advanced to week 26, then public `beginFounding`, no signings and no further ticks, serialized with the genuine predecessor writer. Prove its predecessor validation succeeds before import. This is a generated engine input exercising a supported import surface, **not** proof an old browser build wrote it. No historical-build search is needed.

## 5. Independent RED cases and acceptance

The test author is independent of production. Preserve original 1356-X evidence; add separately named cases and record RED at the accepted predecessor before implementation. Do not inspect or alter Owner saves or original fixture payloads.

1. **Supported import through visible founding:** import the generated week-26 draft through `importSaveJson`; mount the real founding screen through the supported load path; sign the deterministic minimum lawful roster using offered choices; invoke `foundManagedStudioAction` via the screen. Assert same week, all offered transitions successful, save/reload valid at each signature and after founding. Before correction, capture the actual payment guard as the attributed RED. Do not use `beginFoundingHistoricalControl` for this case.
2. **Accounting and provenance:** recruitment spending equals exact bonuses, operating cash and cash signing ledger do not change, contracts and industry start receipts are exact, allocation IDs are unique, founding closes once, and replay/save/reload does not charge or allocate twice. Cover a zero-bonus signature if naturally constructible with lawful offers, otherwise directly test the pure allocation validator with an independently valid zero-bonus contract.
3. **Engine-only open draft:** a valid week-zero draft and the accepted generated late draft both fail `tick` immediately with the named refusal and unchanged deep input/RNG/receipts/cash/technology. `advanceWeek` fails on the same premise. A historical control without a draft still advances; a properly founded player still advances into real rival method locks and saves validly. State explicitly that this case is not UI-reachable.
4. **Week-zero compatibility:** endowment and bare-lot new games sign/found through their ordinary real wrappers, keep preexisting cash/recruitment outcomes, and save/reload. No old expected cash ledger row is invented. Include managed activation's atomic failure control.
5. **Legacy observation:** valid older open drafts with zero and nonzero spent balances migrate into observational opening balances with zero invented allocation rows. Already-closed valid games preserve all existing facts. Existing migration-observed employment remains unchanged; migration runs twice identically.
6. **Unsupported historical input:** exact old missing-cash-payment failure remains a refusal before migration. Technology-invalid open-draft input remains refused; do not delete rival locks. Malformed spending bounds and forged allocations fail before UI replacement. Assert original imported text and current campaign identity remain unchanged on both StartScreen/Saves paths.
7. **Mutant isolation:** start each negative from a fully valid corrected save; mutate one funding invariant at a time (duplicate/missing/wrong contract, amount, week, cash duplication, chronology, root shape). Pin the intended precise refusal. Restore the single mutation and prove validity.
   Include a closed week-zero fund with one deleted allocation, even if its spending balance is also adjusted, to exercise interval completeness rather than only arithmetic. Include old and new signatures in the same observed week; ordinary same-week signing after closure; and both mismatches of draft/closure pairing.
   Include the same person's lawful founding signature → founding closure → paid termination → ordinary re-signing in one week if the existing hiring/termination laws permit the setup. The ordinary cash payment must not be mistaken for double payment of the funded signature; insert a genuinely extra cash row as its paired negative. If that public sequence is unavailable, prove the group reconciliation against independently lawful same-week employment facts and disclose the reachability limit.
8. **Persistence boundaries:** downgrade empty root when lawful; refuse loss of allocations/closed authority; preserve genuine predecessor fixtures and frozen reader refusals. New artifacts use new paths and explicit generating-source provenance.
9. **No new access:** browser founding has no Advance/Sim controls; bridge founding snapshots emit no advanceWeek. Sign/found remains available for the valid imported case. The bridge does not gain external-byte import.
10. **Historical analysis control:** retain the public historical helper's headless sign → close → migration-initialize route, with exact existing-player employment observations, no invented allocations, unchanged cash/fund behavior, and valid save after initialization. It remains visibly separate from the real import-path proof.

Run focused core/UI/bridge tests, root/UI/bridge type checks and affected generator checks; then the repository's recorded focused GREEN and coherent broad gates through the single heavy lane. Attribute baseline failures exactly. Existing tests/harnesses that advanced open drafts may need a separately reviewed lawful founding setup; do not loosen the new guard or change their intended gameplay assertion merely to recover green counts. Search only relevant source/test files to census these calls before production.

## 6. Production seams and handback

Primary edits: `employment.ts` (record opening), `actions.ts` (atomic allocation/closure), `industryEmployment.ts` (expose actual recorded interval identity without changing its chronology), `tick.ts` (early guard), a small pure funding module/types, `hollywoodValidation.ts` (live typed funding context), `save.ts`/state definitions/world generation and necessary historical lifts (new era). Import/UI changes should be limited to demonstrated boundary defects; existing error plumbing appears adequate. `technology.ts` and `technologyProduction.ts` are controls, not intended correction sites.

Parent sequence: independent charter review/adoption → independent RED and observed refusal attribution → single-writer production → independent implementation review → recorded GREEN/broad attribution → source/receipt milestone and HANDOFF update. Refresh references on the actual 1363 source before writing code, and preserve all captures whose source remains valid.

### Exact remaining unknowns

- The actual accepted 1363 predecessor/version and its overlap with the validator chain are not yet known. Allocate the next version and refresh the narrow seam map from that commit, not from the Save45 snapshot.
- No tests were run for this charter. The generated seed's exact affordable roster and managed-activation result must be measured by the independent RED author; fix lawful setup rather than alter economics if a seed lacks the required premise.
- The count of existing test/harness callers relying on open-draft tick remains unmeasured. A targeted caller census is required before landing. It is a compatibility workload, not permission for a new public advance path.
- The proposed durable-funding representation and tick-refusal interpretation require ordinary independent technical review and parent adoption. They introduce no outstanding Owner product question under 1362-O's explicit routine-implementation delegation.
