# P17/P18 draft source review — 2026-10-10

Four consequential blockers remain in the reviewed drafts. They are source/contract findings, not observed runtime failures. The lifecycle, signal and settlement modules are useful scaffolding; neither slice is qualified for landing by this review.

Scope: read-only named public draft source, authored tests, progress records and adopted contracts. No candidate imports, test runs, Git actions, production edits, dependency/fixture traversal or private state reads. This report captures whole-file identities at report preparation; the specialist directories may still be active drafts. Source findings refer to the actual named implementations below. Progress records are author claims, not independent execution evidence. Owner authorization already permits ordinary corrective work; no Owner approval is reopened.

## 1. Live rights authority does not reach release/work/availability

P17 `continuationGreenlight.ts:209` calls `continuationInputsAtRelease`; `continuation.ts:369` has no rights dependency and derives awareness solely from the franchise root and public film facts. Its greenlight adapter at `continuation.ts:54–58` exposes only generic `mayContinue(studioId, propertyId, week)`, not the subject/right/scope read required by the adopted charter at line11. Changing or revoking a grant after greenlight cannot be observed by this release helper. This is a missing required consumption seam; it is not a claim that the unfinished tick wiring has executed an unauthorized release.

P18 `tvTypes.ts:32–46` explicitly stores payload-supplied grant facts pending P16. `tvSeason.ts:73–75` tests only a saved end date, and line325 invokes that date check before work. `tvDistribution.ts:12–17` similarly cannot observe a current revocation or title/permission change. The adopted first-season contract lines25,35 and95 requires authentic P16 authority and distribution covered by the actual grant; progress line15's persisted-term rechecks do not satisfy that requirement.

Repair: bind the actual P16 producer after it is available. Resolve exact subject, right, scope, party and week at quote/accepted greenlight or commission, rights-sensitive resume/work, release/delivery and distribution use. Keep old grant terms as historical provenance. Refusal must leave money/RNG/IDs/commits unchanged; rights loss must use the actual cancellation/claims owner. Do not treat a payload ID or cached end as current authority. Add actual transfer/revocation cases at consumption boundaries; current draft quote-only rights cases cannot prove release/work behavior.

## 2. A reserved cameo blocks unrelated weeks

`cameo.ts:204–210` intentionally returns every reserved guest as busy, without a week; `employment.ts:178` unions that set into common availability. `continuationGreenlight.ts:119` checks exact-week duplicate bookings, but line120 then rejects the globally busy person even when the new request is for another week. Thus the earlier precise check cannot enable a nonoverlapping second booking.

The adopted cameo contract line62 expressly permits nonoverlapping bookings and requires an explicit one-week obligation rather than the full company-seat duration; line104 requires unrelated weeks remain usable.

Repair: expose shared obligation intervals and evaluate the actual requested work/assignment interval. Preserve conflicts when a long assignment crosses a reserved week, while allowing independent nonoverlapping guest weeks. Do not place guests in the whole-film production company. Add a specific two-different-weeks positive and overlapping-week refusal through the actual public booking path; include later employment preserving a freelance booking and own-employee exit cancellation.

## 3. Cameo work is intentionally delayed until release

P17 progress line14 explicitly chooses `workHistory.acting += 1` at release and no current cameo participant/career event. `tests/p17-integration.test.ts:208–224` observes completion, reads the acting counter afterward, and expects its increment only on release; lines226–228 also intentionally exclude the guest from film participant history. `cameo.ts:169–171` persists completed-week/execution facts, which is useful, but does not by itself reconcile the authoritative work/career consumers.

The adopted cameo contract line52 requires factual completed work before release, retention when the film is cancelled after work, and one permanent cameo release credit through the existing career-event pipeline. Lines91–93 call for additive current authority/participant representation without widening frozen historical readers. Frozen old validators do not justify omitting the new current consumer.

Repair: record/reconcile actual work once at shooting completion; preserve it and the earned fee after film cancellation. Separately award release credit/fame once when the picture releases, using an additive current schema and the actual career pipeline. Do not double-increment the counter. Add completed-then-cancelled-film coverage, release idempotence, and save/load across completion/release. The draft's release-only counter expectation needs correction alongside the implementation.

## 4. TV is a second, always-last allocator

`tvSeason.ts:287` expects the operations root after the film sweep, lines293–294 take occupancy after other allocations, and lines301–304 explicitly make TV the last capacity requester. P18 progress line12 declares film-first/TV-last as the chosen interpretation. `allocateTvBlock` at line111 is a separate allocator over that remaining capacity.

The adopted first-season contract line59 requires combined film/TV requests under the existing admitted-work order with a typed-ID tie-break and priority for existing claims. A blanket type priority before admitted-work ordering is not that tie-break. Earlier TV work can lose newly needed capacity to a later film under the draft design, even without double-booking.

Repair: integrate typed TV requests into the common allocation owner's total order, retain already-held claims, and use type only at the declared tie. Keep mandatory-charge accounting distinct from capacity order; placing money settlement after payroll does not require allocating TV last. Add competing film/TV cases in both admission orders, preserved existing claims, blocked-unit/no-milestone behavior and cash accounting.

## Repair and verification order

1. Reconcile accepted P16 live rights/party interfaces and P15 operating/claims interfaces before landing consumers. Keep unavailable upstream dependencies explicit; no fabricated grant or independent estate ledger.
2. Correct shared interval availability and shared typed resource ordering, then bind cameo and TV consumers to those owners.
3. Correct cameo completion/release separation and current history schemas, retaining frozen historical readers and completed-work facts.
4. Land migrations in actual dependency order after choosing unique successor versions. Both drafts independently chose Save46 on Save45; that number is provisional, not accepted predecessor evidence. Reconcile P15/P16/P17/P18 roots and generated consumers rather than renumbering only a constant if the predecessor shape changes.
5. Have root run focused affected RED/GREEN and required type/generated/broad checks under the authorized recorded lane. This review ran none. P17 progress records a prior six-file RED run; that author record is not new independent qualification. No P17/P18 integrated pass is asserted here.

No code/progress changes were made. No runtime or execution authorization is granted by this review.

## Exact source and contract identities

Each hash covers the complete named file, not a line fragment. Line references above are review evidence, not claims about deployed code.

| Role | Path | Bytes | SHA256 |
| --- | --- | ---: | --- |
| P17 release inputs | /Users/zacheryspector/studio-specialists/p17/src/core/continuationGreenlight.ts | 11992 | `95caf17ba90ae35a98997ac0663ea10c65b7233c05280982eaaf2896566a3583` |
| P17 continuation authority | /Users/zacheryspector/studio-specialists/p17/src/core/continuation.ts | 31173 | `42f28a48e1b967840b739b226373261edc3e810dee00b246d331b2bdd0fce39f` |
| P17 availability | /Users/zacheryspector/studio-specialists/p17/src/core/employment.ts | 28543 | `3ea90788eb9a68f7274a8b48e7653cee26ecb926068833c87165e3b7a7e6b903` |
| P17 cameo lifecycle | /Users/zacheryspector/studio-specialists/p17/src/core/cameo.ts | 11043 | `59a5327a2f114d6148a37b21fc5146fa3cef1528f659f0d2101f276da5dfb740` |
| P17 integration expectations | /Users/zacheryspector/studio-specialists/p17/tests/p17-integration.test.ts | 17592 | `18ccd895a6d7e884be246d8b03440d2cf87f41440e5b66d602e9f2e23ed301a3` |
| P17 progress | /Users/zacheryspector/studio-scratch/1370-ar-p17-continuation-cameo-implementation-20261010-r1/PROGRESS.md | 5658 | `70b19a45d261522aea25a376850dc8cbd49770c986853610b4dcf1d106279115` |
| P18 work/allocation | /Users/zacheryspector/studio-specialists/p18/src/core/tvSeason.ts | 23875 | `1533dd350e7b8b520c0b948a0e3d5f2720ee30780a45c695eac7f63a2f364301` |
| P18 availability | /Users/zacheryspector/studio-specialists/p18/src/core/tvDistribution.ts | 3829 | `647f27cc3bbd3dec2909dd717449e4bdfcb4674d9539da0f8887d490cc8de814` |
| P18 grant shape | /Users/zacheryspector/studio-specialists/p18/src/core/tvTypes.ts | 8668 | `5bc065859270b39880810a4c4a09cea63deb5aaa23b5312467ded3109dd7cd37` |
| P18 progress | /Users/zacheryspector/studio-scratch/1370-ar-p18-first-season-implementation-20261010-r1/PROGRESS.md | 5464 | `af009d73da5df16450bed93d66ed387829eba7c1e8f98b6ab714c4a1392e2aaa` |
| Adopted continuation charter | /Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ae-restart-checkpoint/p17-continuation-prep-r2-5020e56e-20261008/P17-CONTINUATION-CONSUMER-CHARTER-AND-RED.md | 13988 | `d67628169c9d54a48bc2c52f4d22dc1f693fd3ab38612a5b49697306c991999e` |
| Adopted cameo contract | /Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1367-stage/p17-prep/P17-CAMEO-CONTRACT.md | 23452 | `b2faaeda86ac6db37a6331d00df881233b861ed40a2bec742989d8503663ddef` |
| Adopted first-season contract | /Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1367-stage/p18-prep/P18-FIRST-SEASON-CONTRACT.md | 31597 | `28f4d7a912432bc6134bcb84d03870f35dd1dddfe2ec6c96851114b01d589610` |
