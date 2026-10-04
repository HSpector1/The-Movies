# Independent review: Save46 original-authority integration

Disposition: PROCEED as a bounded, unexecuted integration draft. No blocking defect found in this delta by static inspection. This is not approval to claim complete Save46 admission, type correctness, historical compatibility, or measured RED/GREEN.

## Exact artifacts

- Patch: `5e2c150f2ff6d0e00a551f4f6c7296a9a99730234522bc21a80f2fffd09fc699`
- HANDBACK.md: `964559934029ccf5f3637cd201c292fd1b272205c266f3ae09b19db1ea937eb9`
- Candidate rivalResearch.ts: `82f438dc533052295daa1d58df17a6da11ee0f7c20f84d86dd87a164ebb982dc`
- Candidate save.ts: `df9a70a0ce2128492bea2719193cda93acff2e6f355890ece580e71e8fd8775d`
- Candidate hollywoodValidation.ts: `ec8cf7290a63389087750967fcbe456159eaf2840770341ce3c9cf7d9f75c214`

All six base/candidate hashes match SHA256.json. Bases are the separately prepared Save46 envelope, previously reviewed C owner proof, and live Save45 Hollywood validator. The scope of this review is the supplied delta and its consequential call flow, not a fresh approval of every predecessor change.

## Checked behavior

The raw boundary in rivalResearch.ts:553 admits the objects and arrays traversed by the existing typed owner proof: receipt/business rows, operations facilities/workflows/reservations/bindings, optional shooting task, optional setup and priorWork rows, development projects/reservations, accounts/periods/movements, plan work/origin/target/dependencies/quotes/commitment, and technology projects/seats/weeks/lab rows/adoptions. It rejects null and non-record rows before nested property traversal. Optional paths correspond to optional chaining in the proof. Scalar enums, bounded dates/IDs and exact keys remain for the full chain, as documented; this pass does not repair input or authorize it by casting alone.

Public Save46 calls this boundary on original raw state before descending into the V45-era chain (save.ts:11092). Direct live profession proof does the same before stripping cutting, P15 roots and relationship fields (:10610). This resolves the previous V25 setup/priorWork loss: the dependency helper sees original workflow authority before historical projection. Research project, seat, per-week laboratory, physical plan and adoption dependencies likewise remain available. The subsequent chain is mandatory, so successful early owner proof is not a save-admission bypass.

The eleven C7 mutants retain their static first-refusal routes: the structural pass does not reject their deliberately altered scalar values or absent referenced plan/body before the named proof. Wrong refund, blueprint, future week, missing plan, wrong owner/body, duplicate disposal, standing-and-disposed and missing tombstone are handled before aggregate finance; negative and changed refund movements remain owner-proof diagnostics. No new measured execution is claimed.

Hollywood explicitly gates business costCutting, positive facilityDemolitionRefund, disposal receipt keys, operating-cost cutoff and body-or-tombstone recognition. Old calls retain false defaults, the old positive-money whitelist, unknown new receipt rejection, and the literal old missing-laboratory error. The new body alternative relies on prior original-state proof at the two enabled save/profession entrypoints; it must never become an independent raw admission shortcut.

Opex uses [operational week, min(current week, disposal week)) and the retained commitment cost is still reconciled by existing capital/account owners. Instrument opex/body law remains unchanged. Same-owner body matching is explicit. The prior proof enforces a unique valid tombstone, so the downstream first matching disposal receipt does not introduce ambiguity for admitted state.

Cutting shape and since bounds match the adopted contract. Empty production/run requirements, later film/laboratory/employment receipts and adoption committedWeek checks preserve the strictly-later-week rule of 1363-F amendment 2. Operational completion is not mistaken for a new commitment. The current market proposal check runs only after full admission on original state, where V28 stripping cannot hide it. It checks submittedWeek > since, not same-week staff history. Direct profession proof intentionally strips cutting under the adopted rule, while retaining disposal authority; it is not a substitute for public46 validation of cutting or P15 roots.

## Required verification and integration limits

- Assemble all predecessor schema, money-kind, envelope, migration, B/C implementation and sweep changes before type checking. New IndustryReceipt and movement types are prerequisites; this isolated patch is not compilable evidence.
- Run valid original-state disposal through public46 and direct profession proof, including cutting exit and full refund preservation. Verify all eleven C7 exact public messages, not only direct helper messages.
- Add malformed-input checks for nested workflow bindings, reservations, setup/priorWork, script reservations, plan target/origin, technology rows and account periods. The structural prepass deliberately does not establish arbitrary scalar or exotic-object safety; complete public admission must refuse malformed data without treating a preproof success as sufficient.
- Include a labeled dependency mutant proving original setup/priorWork is actually inspected before V25 lowering. Existing lawful-premise gaps and natural disposal integration requirements remain.
- Measure historical reader/error preservation and old-period migration compatibility. The unchanged technology and physical-plan laws must continue protecting historical research dependencies; no tombstone exception is added to those owners.
- Keep explicit disposal-era authorization confined to call paths that perform original-state proof. Future direct calls to validateHollywood with the disposal flag would otherwise rely on an unestablished precondition.

No tests, Node, type checks, fixture payload reads/scans, production source edits, repository/index changes or runtime execution were performed. Only this authorized scratch report was written.
