# 946-A — independent current-validation and anchor inventory

2026-09-26. Read-only c2rm_contract_review on1f44aa50. No commands, tests, edits or
nested agents. Parent persists the returned review and dispositions here.
Verdict: KEEP revised evidence/scheduling design with the precise seams below;
final bounded Calendar/Industry/Market follow-up also KEEP, recorded at the end.

## Actual current validation route

| Symbol in src/core/save.ts | Source line | Action |
| --- | --- | --- |
| validateSaveV37 |10080|Public strict wrapper; explicit private current-authority entry for38|
| validateSaveV36WithPolicy |10006|Extensions and onward|
| validateSaveV35WithPolicy |9799|Cohorts and onward|
| validateSaveV34WithPolicy |9606|Retirements and onward|
| validateSaveV33WithWriting |9325|Carry past stripping age provenance|
| validateSaveV32WithWriting |9108|Carry onward|
| validateSaveV31WithWriting |9013|Carry onward|
| validateSaveV30WithWriting |8946|Carry directly to28|
| validateSaveV28WithWriting |8754|Carry; market needs no role exemption|
| validateSaveV27WithLaw |8662|Carry onward|
| validateSaveV26WithPolicy |8510|Carry onward|
| validateSaveV25WithPolicy |8305|Carry onward|
| validateSaveV24WithPolicy |8134|Carry directly to19|
| validateSaveV19WithPolicy |7853|Pass to validateHollywood; profession context ends here|

The actual route skips29 and20–23. Never create a consecutive-version route by
calling their public frozen readers. The separate RetirementWritingAuthority must
continue on its established18→9/construction/placement route. No new profession
context is needed below19: v8Talent validates current role shape, v8CareerEvent its
own recorded role without equating it with today's primary profession.

Four semantic consumers:

1. Retirement records:save9501,9544–47,9588–94. Structured person/profession uniqueness,
   profession at announcement, bindings capped within that profession episode.
2. Extension cases:save9943,9959–69,9981,9990. Profession at case opening, one case
   per episode, exact episode record and genuine employment evidence.
3. Cohort receipts:save9725,9765–80 and careerLifecycle282. Original talent prefix,
   original entrant positions, dated profession and matching-profession retirement.
4. Authored rival credits:save7875–90→hollywoodValidation65,144–45. Canonical starting
   credit role compared with original observed profession, all other checks retained.

Interval caps keep effective end `endedWeek ?? terms.endWeekExclusive`; never replace
an early-terminated contract's guaranteed end or financial history. An interval
starting at change week belongs to the new profession under inclusive semantics.
An older interval cannot remain active across completed retirement/change. Historical
validation uses dated intervals, never today's busy set against a prior change.

Cohorts first select exactly talentCountBefore. Reject a prefix that contains an
entrant created after receipt.week, then resolve dated professions/status. An old
acting retirement cannot exclude a currently active director from a later request.

## Narrow private authority

Construct one immutable invocation-local object from provedV38 evidence before
stripping fields. It supplies original observed profession, profession at week,
and actual C.3 entrant week. Validators retain their own shape, chronology,
identity, record and financial checks. No allowRoleMismatch flag or row-approval
callback; publicV1–37 and public validateCareerLifecycleRoot9495 omit authority.
Raw extra fields on an old envelope cannot activate current law. Shared exported
validateHollywood may take explicit context, absent on every frozen public path.

RetirementWritingAuthority stays separate. Its factory retirementWriting22 resolves
the proved current episode and distinguishes actor+destination from duplicate keys.
All880-B temporal/project/studio/person/expiry guards survive. Current construction
points:actions1884–87 assertCurrentScriptState;placement1814–15
assertLiveStudioPlacementInvariants;current save boundary. Existing consumption at
construction397–400 and hollywoodValidation353–55 needs no broad profession exemption.

## Actual anchor commits and boundaries

| Commit | Source seam | Required handling |
| --- | --- | --- |
| Fresh population |worldgen697,730–31,824|Initialize anchors over actual final talent|
| Three public creators |actions837–43 withCreatedTalent;829,966,1180|One entrant anchor with actual append|
| Scientist recruitment |actions2880–83|Only branch actually appending a person|
| Rival initial/scheduled entry |hollywood188,229–42,269–70|Only newly minted people; reused free agents keep one anchor|
| Rival supply including Scientist |hollywoodTick145–63,357;tick1055–56|After affordability/append at pre-increment staffing week|
| Annual cohort |careerLifecycle335,351,358–65|Actual batch/order/creation week|
| V37→38 |new converter|Validate public37, detach, open existing anchors over final migrated people|

Tick propagation trap:tick1063–76 spreads admitted, copying only materialized talent
and age provenance. Carry the changed lifecycle root into finalized explicitly;
otherwise anchors appended to provenanced disappear.

Frozen convertV18ToV19 invokes initializeHollywood atsave7897. Gate current append
and scheduling on an actualV38 root, not any lifecycle root. Preserve old conversion
literals, including33→34 at9628. Actual initializeHollywood persists originWeek at
hollywood172–79; hollywoodValidation81–82 bounds it. Schedule dormant reconciliation
there after entry work using max(transitionBoundaryWeek,originWeek); preserve its
nonnull early return. beginFounding calls this atemployment559–60;
recordPlayerEmployment does not create Hollywood and is no extra activation seam.

Boundary switches:types2289;save589;dispatch5347;LIVE_SAVE_VERSION/makeSave6502–07;
migrateToLive9856. The common guard atsave6126 reaches every makeSaveV1–18: use it
to prevent silently discarding current semantic authority, including malformed
null-Hollywood inputs. Semantic downgrade refusal precedes field stripping.

## API refinements and parent disposition

All accepted into946: safe-integer capability1..99; exact public tier unions;
exactly one *eligible* target for onlyEligibleTarget; chronology-based evaluation
bound (earliest normal retirement61 permits61…75, not five events); literal actor
to director/writer DTO; current-week-only mutable snapshot API; original cohort
presence guard; dormant null-Hollywood reconciliation using actual originWeek.
No frozen37 refusal was added. Public snapshot honesty and exact retained-evidence
reconstruction remain distinct. No Owner decision was identified.

950 attribution independently supported and its version/replay caution is recorded
in952. Canonical digest identity is a determinism correction, with old stored
receipts retained. Outgoing52→53 replay reset needs actual verification; same-schema
interim compatibility is not assumed. The detached capacity kernel is not implicated.

Final bounded follow-up: KEEP. Calendar's separate careerEvents preserves commitment
counts/scheduling (studioCalendar190,871,889); existing profile route supports
navigation (StudioCalendar.tsx24,98). Industry careerKind explicitly fixes the
null-studio permanent-retention trap for new career news while preserving technology,
sort and pagination (industry359). Market retention/order/public text fits current
attention assembly (market283–307,lifecycle53–66). No remaining correction in this
bounded review; no edits or tests performed.
