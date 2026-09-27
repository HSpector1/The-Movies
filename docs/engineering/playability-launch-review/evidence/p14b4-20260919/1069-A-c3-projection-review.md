# 1069-A — Independent projection53 source review

**KEEP for candidate verification.** Independently reviewed the parent's nine
source-file diff against published `b71d4599b071bbe7258e992141acdb6056831cd1`,
946's exact Projection53 appendix and1022's implementation map. No concrete
correctness/privacy blocker or new product decision was found. This is source
review, not behavioral, generated/native or endurance qualification. Parent owns
all production and execution; this reviewer changed only review documents and
ran no gameplay, compiler, tests or generator.

## Frozen source identity

Independently measured SHA-256 values after the parent reported generation and
while its current type gate froze consumed source:

| Path | SHA-256 |
| --- | --- |
|`bridge/industry.ts`|`3a224f31a441530e519f5537f7e2442a378ff72d05856c833a0d4401cb0cb090`|
|`bridge/lifecycle.ts`|`9a717590bccbf32a37b46eed8fa3c358fdb4549c66efd8285c5dc38d37634ff5`|
|`bridge/people.ts`|`e2b0f511d904c4af6a52b30d321b7b8f6664def2fa2b670d0a21c996c0008b7b`|
|`bridge/relationships.ts`|`16a86b1dbecd19f869d844a991c012e99850a7750887773cd2b101b0ecf0de54`|
|`bridge/runtime-checkpoint.ts`|`462c2a9d54f0dbd708ce81459f2a8e197390cab5ff1a6bfc475afc0f0185a3b5`|
|`bridge/schema/bridge-schema.ts`|`db0944c3597550517d21e99f9efbbee7ac55fe21295d722b0439612018e022be`|
|`bridge/schema/industry-schema.ts`|`794ef431e62a5f44674f874f9144ed0a667965781e587d23fc0e71eb65c58453`|
|`src/core/studioCalendar.ts`|`67ebbbe36e8c136bb7806543b9bba39b37681bafb8e51d927c35f293eb0042c2`|
|`ui/src/screens/StudioCalendar.tsx`|`05d3ef37bf50e4e5e3b950e0b7281e0c338323a18febc5980ba4823da6339f9c`|

## Contract and implementation findings

The schema changes advance projection52→53 while retaining protocol4 and
Save38. They add the exact closed retirement/change/career definitions,
required additive `professionCareer`, five required Industry person fields,
optional activity `careerKind`, and the two attention causes. Existing
`career: StudioPersonCareerSnapshot` development history remains intact.
The schema definitions are registered with inferred public types; actual
completion dates are nonnegative integers and the public nullable fields stay
nullable. At most two completed episodes and one change follow the already
validated current-state law; this diff does not create another transition.

`bridge/lifecycle.ts:10` derives status from current-profession retirement,
actual finality, real prospective/deferred due and Hollywood engagement.
Working includes active/announced/finishing; a changed working professional is
not made inactive by their old Actor record. A dormant retired Actor has no
invented active review. Final retirement requires its actual industry record;
the prospective boundary notice applies to existing anchors without inventing
past choices. Ordered profession retirements come from completed actual
records; last-change copy selects safe prose from the linked typed reason.
No raw inputs, private digest, witness, ceiling, salary or magnitude is exposed.

The alumni selector uses the existing latest-completed-retirement helper.
Industry includes each former professional once, orders by that actual date/id,
and preserves present role/employer/current-lifecycle fields separately.
Complete role-credit and historical employment/filmography meanings are
unchanged. Relationships remain current while the current profession works;
waiting/pending/final cases use the latest actual profession retirement. A
later reconciliation date does not move the historical asOf boundary or bypass
the existing counterpart-disclosure/unavailable-tier guards.

`studioCalendar.ts:218` builds recent career facts without invoking the whole
Calendar, placement validator or a game transition. It uses the exact change
and JSON-encoded finality IDs, actual identity/profession/week, nonfuture
13-week filter and week-descending/id order. Maps and filtered/sorted arrays
are newly built; no persistent array is sorted or mutated. The Calendar return
adds a separate array after existing commitment/capacity decisions, leaving
committed-event counts, reservations, next boundary and automatic stops intact.
The React section displays actual campaign dates and uses the existing profile
callback; it introduces no state, autosave, unread flag or financial promise.

Industry activities reuse the small recent-event reader, with people group,
null studio/film and actual person/date. Per-studio history remains an exact
studio-ID filter, so these events invent no employer. Pulse retains career
events only13 weeks while the explicit technology-announcement exception stays
permanent. The implementation preserves group/week/id order and existing
paging bounds. Source catalogue inspection already established why884, rather
than degenerate416 sound, is the genuine permanent-milestone test witness.

Market adds one row per actual career fact after existing finishing and
announcement priorities, changes before finality, then ascending week/person.
Its payload remains only cause/talentId/reason. Actual profile history is not
bounded by news retention. No Finance ledger, extension quote, employment
settlement, promise law or core lifecycle writer is changed by these files.

Runtime adds the exact preserved outgoing52 identity
`sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2`
once to the existing prior-protocol4 registry. The full canonical save import
and separate current/saved-slot handling remain unchanged. This is the matching
identity boundary needed by1033's R2/R3/R5/R7 failures; source review does not
claim those downstream paths have executed after the bump. No historical51/52
bytes or prior journal are restamped.

## Verification boundary

1066 preserves the original1033/1034 causes, including the honest M1 premise
correction, R8 default-timeout failure and actual212 strict-save rejection.
1068 test maintenance received independent KEEP without a performance claim.
The212 Hollywood occupancy issue remains outside this presentation diff;
its actual conflicting work IDs are pending the separately authorized bounded
diagnostic. The strict assignment validator remains unchanged.

Parent reports actual generation1035 and fixed generated/fixture checks1036/1037;
this review does not substitute for those records or independently claim their
execution. Required candidate behavior, whole DTO acceptance, UI route/focus,
runtime migration/replay/Save As, type gates, affected regression attribution
and later endurance remain the parent's verification work. No generated C#
artifact is represented as Unity/native qualification.
