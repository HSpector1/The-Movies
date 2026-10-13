# P15B full-gate R1: NEW Bridge failures

Source-only triage; no tests, source/index changes or hashscans. Exact selection: candidate failed, Save47 previousStatus != failed or absent, filename starts bridge; from A/p15b-full-gate-r1-core-analysis/failures.json, cross-checked with complete-core-comparison.json. **45 NEW Bridge identities across36files, all45 previously passed.** No added/absent-old identity in this subset. Parent handles non-Bridge, reviewer handles oldchanged/missing/skipped identities. Original fullcore child1/7814s,5800=5607pass/162fail/20skip/11todo stays preserved; this report does not waive NEWs.

## Common causes and lawful minimal repair

**42 current wire literal failures:** actualprojection/snapshot58 versus asserted57. Current manifest declares protocol4/projection58/schemaIdsha256:13b7933fdd1e3dc9851dd08630e46efd43e70227f5e0c6f6cf130d885752ab74. Canonicaltests/bridge-schema.test.ts:340 already independently requires58; bridge/protocol.ts:34 makes snapshotversion follow projection. Actualversionbump is the adopted C17 quoteLoan plus Ranking wire extension, not a random save-era change. Recommendation: narrow test-only amendment of current projection/snapshot literals to58 in these exact36files, including adjacent CURRENT $id projection-57 strings, metadata projectionVersion57, INCOMING_PROJECTION57 in B6(:105). Keep independent literal expectations (not toBe(PROJECTION_VERSION) as the only versionlaw). Do not globalreplace57 or alter historical frozen outgoingprojection/hash/checkpointbytes/operationalweeks/budgets. Stable historical leafnames used by selectors can remain, with clear current-boundary comments.

**3 exact prior-registry failures:** actual46 versus expected45 entries. Source bridge/runtime-checkpoint.ts:45–62 explicitly requires every distinct SHIPPED protocol4hash and now adds actualoutgoing57 sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253 → projection-v57. Add exactlythat independently specified literal to expectedcompleteprior lists in bridge-p14b5-relationships(:453 and its earlier blocked list:405) and bridge-p14b6-relationship-read-models(:797). Update B6:size45(:800) and bridge-p14b8-waiver-surface:size45(:788) to46 with explicit outgoing57 explanation; retain allpreviousentries, labels, runninghash exclusion and exactlist equality. Do NOT weaken to contains/size>=, derive expectedlist from productionmap or remove outgoing57 registration to satisfyoldtests. Newschema outgoing748 membership/twoSave47slots controls are separate already-authored proof, not replacement for everyold migration control.

**Known follow-on stalehash:** bridge-p14b5-relationships:401 still pins candidate projection57hash7e2af680a2093f94e2d956f4e004034c409b5fde64e2e6aae1630fc3c783da75, blocked by earlier57assertion. Currentexpectedhash must become independently literal actual58hash13b7933f… above. 7e2 drafthash is NOT a substitute for shipped748 outgoing57 and must not be spuriously registered as shipped to fixthiscurrentassertion. Preserve existinghistorical fixturepins. Update only current-boundary expectations with exactgenerator/sourceidentity cross-check; do not change finance/schema implementation to return oldversion.

## What actually reached versus blocked

There are NO NEW Bridge timeout/ENOENT/invalidsave/loanterms/quote-state-mutation diagnostics in this selected45. This does NOT clear inherited Bridge timing or latersemantic assertions. The first failing assertion is reached; many named semantic controls abort immediately afterward. Capital-contributors:24 fails before loading genuineoutgoing24/payments; prior-runtime/migration leaves often fail before independent slots/journal reset/purity; Ownerprofile wire test:18 fails before requiredfield checks. Correctingliteral alone cannot qualify those later assertions until execution.

Some actual read work precedes the failure: operations-events:322–333 buildsstate, checks projectionpurity and canonicalservedresponse before versionpin; later served-section equality/finalpurity remain blocked. Fresh seats:101–102 obtains realpage before versionassertion; emptyseats/receipts/zeroquote follow and are unexecuted in that leaf. B6generatorleaf:808 loads artifacts and checks schema$id before stale metadataexpectation; remainingmanifest/C#seven-order/fixture clauses are blocked. Preserve originalfailedrawmessages; source classification is a repair recommendation, not an executedrepair or blanket era-number waiver.

Smallest honest next verification after parent-safe restoration/soleauthor test-only amendment: rootappropriatecheck if needed, then COMPLETE36namedtestfiles below, fresh rawJSON/log and originalbudgets, no -t filtering. Existing fullfile assertions determine any further lawful adjustment. Independentreview exactdiff must confirm only currentwire literals/currenthash/exactprior-set additions; everyhistoricalfixture/readermodel/control stays. Then parent decides integrationregate basedactualscope/results; no automaticfullcore reclassification. R currently frozen for gatepostflight: do not apply repair now.

## Complete file selection

- tests/bridge-operations-events.test.ts
- tests/bridge-owner-ux-projection21-schema.test.ts
- tests/bridge-p10a-w0-people-projection.test.ts
- tests/bridge-p11-capital-contributors.test.ts
- tests/bridge-p11-ready.test.ts
- tests/bridge-p13b-r07-setup.test.ts
- tests/bridge-p13b-s1b-seats.test.ts
- tests/bridge-p13b-s2-labs.test.ts
- tests/bridge-p13b-s3-plans.test.ts
- tests/bridge-p13b-s4-office.test.ts
- tests/bridge-p13b-s5-adoption.test.ts
- tests/bridge-p13b-s6-cancellation.test.ts
- tests/bridge-p13b-s7-disclosure.test.ts
- tests/bridge-p13b-s8-rivals.test.ts
- tests/bridge-p14a1-market.test.ts
- tests/bridge-p14a1-release-busy-set.test.ts
- tests/bridge-p14a2-market.test.ts
- tests/bridge-p14a3-world.test.ts
- tests/bridge-p14b1-promises.test.ts
- tests/bridge-p14b10-relationship-labels.test.ts
- tests/bridge-p14b2-trust.test.ts
- tests/bridge-p14b3-promise-command.test.ts
- tests/bridge-p14b4-runtime47-compatibility.test.ts
- tests/bridge-p14b5-relationships.test.ts
- tests/bridge-p14b6-relationship-read-models.test.ts
- tests/bridge-p14b7-promise-waiver.test.ts
- tests/bridge-p14b8-waiver-surface.test.ts
- tests/bridge-p14c2rm-runtime.test.ts
- tests/bridge-p14c2s-scientist-runtime.test.ts
- tests/bridge-p14c3-promise-digest-continuity.test.ts
- tests/bridge-p14c3-runtime.test.ts
- tests/bridge-p14p3-directing-promises.test.ts
- tests/bridge-p14p4p5-opportunities.test.ts
- tests/bridge-p14r2r3-prior55.test.ts
- tests/bridge-r3n4-read-model-deltas.test.ts
- tests/bridge.test.ts

## Exact occurrence-qualified identities and first diagnostics

Each item below retains the exact fullName and occurrence from parent comparison, Save47status passed, exact first diagnostic and first source stack location. Complete original message arrays/stacks remain in failures.json under the exact JSON id; no message normalization or identity-only inheritance claim.

1. `bridge-operations-events.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: R3-N7-SIM-01 — operationsEventsProjection (projection 32) L6 is pure, mutates nothing, and validates inside the served projection-50 envelope

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-operations-events.test.ts:333:32
   ```

2. `bridge-owner-ux-projection21-schema.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: Owner UX projection21 public field wire boundary pins the intended version and required envelope/profile fields independently

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-owner-ux-projection21-schema.test.ts:18:32
   ```

3. `bridge-p10a-w0-people-projection.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P10A W0 — people projection R9 the served section is projection 32 and the projection-17/18 identities stay accepted

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p10a-w0-people-projection.test.ts:321:32
   ```

4. `bridge-p11-capital-contributors.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P11 recorded facility capital contributors over the real bridge hydrates genuine outgoing projection24 and joins four original payments to exact construction events

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p11-capital-contributors.test.ts:24:32
   ```

5. `bridge-p11-ready.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P11 ready Upcoming and discarded financial successors migrates authentic core25 without relabeling its bytes; strict26 includes a nullable Week0 history

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p11-ready.test.ts:52:32
   ```

6. `bridge-p13b-r07-setup.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S5-R07-T3 bridge projection bump (37 -> 38; 46 after the P14B.2 bump) PROJECTION_VERSION is 40; schema $id and x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-r07-setup.test.ts:321:32
   ```

7. `bridge-p13b-s1b-seats.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S1b Laboratory seats read model (projection 46 after P14B.2) bumps PROJECTION_VERSION to the S1b wire contract (33; 46 after the P14B.2 bump)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s1b-seats.test.ts:76:32
   ```

8. `bridge-p13b-s1b-seats.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S1b Laboratory seats read model (projection 46 after P14B.2) a. fresh Laboratory with no project publishes empty seats/receipts, zero weekly and snapshotVersion 38

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s1b-seats.test.ts:102:34
   ```

9. `bridge-p13b-s2-labs.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S2 T6 Laboratory bridge page: projection bump bumps PROJECTION_VERSION to the S2 wire contract (34; 38 after the S5-R07-T3 bump)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s2-labs.test.ts:115:32
   ```

10. `bridge-p13b-s2-labs.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: case 1: a fresh Laboratory publishes snapshotVersion 38 and an empty projects array a Laboratory with no research project at all reports laboratory.projects === []

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s2-labs.test.ts:126:38
   ```

11. `bridge-p13b-s3-plans.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S3-T4 plans bridge page: projection bump bumps PROJECTION_VERSION to the S3-T4 wire contract (35; 38 after the S5-R07-T3 bump)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s3-plans.test.ts:202:32
   ```

12. `bridge-p13b-s3-plans.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: case 1: a fresh studio publishes an empty plans page; plans is null off the plans view snapshotVersion 36; rows and actions are both empty arrays on a fresh studio; laboratory view carries plans: null

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s3-plans.test.ts:214:35
   ```

13. `bridge-p13b-s4-office.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S4-T3 office bridge page: projection bump bumps PROJECTION_VERSION to the S4-T3 wire contract (36)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s4-office.test.ts:224:32
   ```

14. `bridge-p13b-s4-office.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: case 1: the founding office at week 12 — full quote parity on the wire; office null off the laboratory view standard I, highest I, offline false, capacity 2, baselineWeeklyOperatingCost 0 (endowed); both conversion rows match the authoritative quote

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s4-office.test.ts:235:38
   ```

15. `bridge-p13b-s5-adoption.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S5-T4 bridge adoption wire: projection bump (36 -> 37) bumps PROJECTION_VERSION to 37 and its schema $id / x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s5-adoption.test.ts:250:32
   ```

16. `bridge-p13b-s6-cancellation.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S6-T3 item 1: projection version bump (38 -> 39; 46 after the P14B.2 bump) and the cancellationAction intent kind bumps PROJECTION_VERSION to 41 and its schema $id / x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s6-cancellation.test.ts:270:32
   ```

17. `bridge-p13b-s7-disclosure.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S7-T3 item 1: projection version bump 39 -> 40; 46 after the P14B.2 bump bumps PROJECTION_VERSION to 41 and its schema $id / x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s7-disclosure.test.ts:280:32
   ```

18. `bridge-p13b-s8-rivals.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P13B-S8-T3 item 1: projection version bump 40 -> 41; converted flag bumps PROJECTION_VERSION to 41 and its schema $id / x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p13b-s8-rivals.test.ts:224:32
   ```

19. `bridge-p14a1-market.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: group 1: PROJECTION_VERSION PROJECTION_VERSION is 46; the schema $id and x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14a1-market.test.ts:152:32
   ```

20. `bridge-p14a1-release-busy-set.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14 1304-C RED (Bridge): R2 seated/founding refusal, schema leaf, release-copy correction schema leaf: PROJECTION_VERSION is 57, the schema $id and x-project-studio.projectionVersion move with it, and both new refusal codes reach the generated CONTRACT_REFUSAL_KINDS enum (mirrors the underMarketCase/projection-42 precedent, tests/bridge-p14a1-market.test.ts group 1)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14a1-release-busy-set.test.ts:215:32
   ```

21. `bridge-p14a2-market.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: group 1: PROJECTION_VERSION 46 / schema / view market / converted law PROJECTION_VERSION is 46; the schema $id and x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14a2-market.test.ts:218:32
   ```

22. `bridge-p14a3-world.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: group 1: PROJECTION_VERSION 46 / schema / converted law PROJECTION_VERSION is 46; the schema $id and x-project-studio.projectionVersion move with it

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14a3-world.test.ts:230:32
   ```

23. `bridge-p14b1-promises.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: group 1: PROJECTION_VERSION / LIVE_SAVE_VERSION LIVE_SAVE_VERSION is 35 (stale title corrected post-C.4) and the live promise surface carries projection 47 after the P14B.4 cutover (record 600 / 616)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b1-promises.test.ts:209:32
   ```

24. `bridge-p14b10-relationship-labels.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B10 T1 — the projection version moves once for slice B (1347-F Addendum) PROJECTION_VERSION is 57

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b10-relationship-labels.test.ts:149:32
   ```

25. `bridge-p14b2-trust.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B.2 group1 — projection46, unchanged Save29/intents, closed wire shapes pins the exact version, old-five-plus-two attention enum and unchanged intent vocabulary

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b2-trust.test.ts:141:32
   ```

26. `bridge-p14b3-promise-command.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B.3: real settlement/outcome, V29 and B2 public/private carriers quote→commit→real winning expiry binds; due-week BROKEN survives validated reload and exact public receipt join

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b3-promise-command.test.ts:511:32
   ```

27. `bridge-p14b4-runtime47-compatibility.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B4 genuine outgoing46 runtime compatibility — current Save39/projection54 requires literal projection54/Save39 and exact 42 prior IDs, excluding the running identity

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b4-runtime47-compatibility.test.ts:219:32
   ```

28. `bridge-p14b5-relationships.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B.5 frozen side — the OUTGOING wire identities (R-VERSION class, re-expressed by 700-T2 after P14B.8 landed projection 50 / Save V32 unchanged) live projection52/Save37 and literal current hash retain all40 independent prior identities (875)

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b5-relationships.test.ts:396:32
   ```

29. `bridge-p14b5-relationships.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: family 11 — projection 48 THIN (RED by value): the enum, the registry, the seven-member order, the D5 sentence on the wire the running identity moves off the outgoing 47 and 47 is registered as projection-v47 beside the 35 accepted priors and the outgoing 48 (37)

   ```text
   AssertionError: expected [ …(46) ] to deeply equal [ …(45) ]
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b5-relationships.test.ts:453:70
   ```

30. `bridge-p14b6-relationship-read-models.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: family 8 — the WIRE (RED BY VALUE: version literals and a registry count; no absent module is imported here) projection 52, schema $id projection-52, LIVE_SAVE_VERSION now 37 (Scientist live boundary; B.6 itself has no save step), and the outgoing 48 identity is retired

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b6-relationship-read-models.test.ts:783:32
   ```

31. `bridge-p14b6-relationship-read-models.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: family 8 — the WIRE (RED BY VALUE: version literals and a registry count; no absent module is imported here) the outgoing 00c0075b… stays registered as projection-v48 and the prior roster contains40 identities through projection51

   ```text
   AssertionError: expected [ …(46) ] to deeply equal [ …(45) ]
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b6-relationship-read-models.test.ts:797:70
   ```

32. `bridge-p14b6-relationship-read-models.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: family 8 — the WIRE (RED BY VALUE: version literals and a registry count; no absent module is imported here) the checked-in generator artifacts equal the running identity (`--check` clean), and priorityOrder keeps its seven members and its line

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b6-relationship-read-models.test.ts:808:62
   ```

33. `bridge-p14b7-promise-waiver.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B.7 group9b — PROJECTION_VERSION is the frozen value this slice must not move (bridge half of group9; relocated by 730-T finding 3) PROJECTION_VERSION is still 49

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b7-promise-waiver.test.ts:137:32
   ```

34. `bridge-p14b8-waiver-surface.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B.8 group12 — the projection moves 49 -> 50 and the outgoing identity is registered as a prior PROJECTION_VERSION is 54 and the schema document agrees

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b8-waiver-surface.test.ts:776:32
   ```

35. `bridge-p14b8-waiver-surface.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14B.8 group12 — the projection moves 49 -> 50 and the outgoing identity is registered as a prior the running identity moves OFF sha256:60af24c5… and that identity is registered as projection-v49 in the SAME commit

   ```text
   AssertionError: P3 adds the genuine outgoing53 identity: 41 -> 42: expected 46 to be 45 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b8-waiver-surface.test.ts:788:109
   ```

36. `bridge-p14c2rm-runtime.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: C.2-RM genuine projection51 recovery steps projection once to52 while retaining Save37/protocol4 and enumerating actual outgoing51 exactly once

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14c2rm-runtime.test.ts:122:32
   ```

37. `bridge-p14c2s-scientist-runtime.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: C.2 Scientist S11: genuine outgoing50 runtime compatibility requires literal projection52/Save37, registers actual outgoing50, and excludes the running identity from prior schemas

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14c2s-scientist-runtime.test.ts:135:32
   ```

38. `bridge-p14c3-promise-digest-continuity.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: 955 historical preservation and interim projection52 journal authority preserves the current52 historical command journal and exact duplicate response without replaying gameplay

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14c3-promise-digest-continuity.test.ts:147:32
   ```

39. `bridge-p14c3-runtime.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: C.3 projection53 current/save/journal and durable campaign authority R2 opens53/Save38 once, registers exact52 and independently migrates208/207 while resetting prior session authority

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14c3-runtime.test.ts:161:32
   ```

40. `bridge-p14p3-directing-promises.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P3 public Bridge authority, truthful terms and durable runtime D17 migrates outgoing53 independently and isolates current55 campaigns

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at qualifyPrior53 (/Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14p3-directing-promises.test.ts:385:32)
   ```

41. `bridge-p14p4p5-opportunities.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P4/P5 closed Bridge material and outgoing runtime authority B55-3 independently migrates genuine54 slots and resets only prior runtime authority

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14p4p5-opportunities.test.ts:515:66
   ```

42. `bridge-p14r2r3-prior55.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: P14 1308-C: the outgoing projection55 runtime checkpoint migrates to current56, and each Save40 slot migrates to Save41 independently loadBridgeRuntimeCheckpoint migrates the prior-schema checkpoint, resets runtime authority, and migrates both save slots to V41 with only the new key added

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14r2r3-prior55.test.ts:184:32
   ```

43. `bridge-r3n4-read-model-deltas.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: R3-N4-SIM-20 — batched N4/N5/N6 read-model deltas (projection 31) keeps the outgoing projection-30 identity registered after a later bump

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-r3n4-read-model-deltas.test.ts:144:32
   ```

44. `bridge-r3n4-read-model-deltas.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: R3-N4-SIM-20 — batched N4/N5/N6 read-model deltas (projection 31) serves the whole bundle under the regenerated schema with the new fields present

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge-r3n4-read-model-deltas.test.ts:351:38
   ```

45. `bridge.test.ts` — occurrence `1`, Save47 `passed`, candidate `failed`.

   Full identity: Current-game Unity adoption bridge pins protocol v4/projection v32 and fingerprints named projections and exact intent fields

   ```text
   AssertionError: expected 58 to be 57 // Object.is equality
   at /Users/zacheryspector/The-Movies-headless-program/tests/bridge.test.ts:167:30
   ```

Reusable lesson: a legitimate wire extension can leave dozens of independently valuable historical controls stranded behind a stale current-version assertion. Repair that current boundary explicitly, retain exact outgoing identities, then execute the original controls to learn what was previously hidden.
