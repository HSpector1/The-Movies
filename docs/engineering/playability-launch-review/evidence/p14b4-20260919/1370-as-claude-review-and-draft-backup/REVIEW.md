# Claude draft review, 2026-10-10

Verdict: useful implementation progress, with several substantive integration and contract defects. Preserve the drafts and continue from them. They are not an integrated P16/P17/P18 completion or a candidate ready for main.

## What actually changed

The live repository and fetched branch were both `f7d0dc0fd4f31ff1a3bff47abb4db07bd3ce298c` at this review. Claude published two handoff commits after `9b67d768`; the production `src` tree remains `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`. Remote main remains `c902a704eb948cc576083d0973c8c23e59937dc1`.

Gameplay work resides in uncommitted isolated clones under `/Users/zacheryspector/studio-specialists/{r8,founding,p15b,p16,p17,p18}`. The source patches and manifests in `drafts/` preserve those drafts, including new untracked modules. They are backups, not patches approved for blind sequential application.

Claude recorded the Owner's approval of a fresh, separately identified verification baseline and later full autonomy. That resolves the earlier permission question. It does not retroactively pass historical failures or complete the source/causal/runtime gates. No further Owner answer is required to perform the authorized remaining engineering work.

## Useful work and verified retained results

| Draft | Useful work | Recorded evidence and limits |
| --- | --- | --- |
| R8 recovery | Authentic transplant of the reviewed kit and broad recovery/save sweep | All 184 nonfixture postimages matched the inventory. Root/bridge types, UI retry and generators passed. Docs repair rerun passed 189/189. Latest per-file union remains 2,450 PASS / 113 FAIL / 3 SKIP / 8 TODO across 167 files. |
| 1364/1365 | Late-founding funding root, held market activation and versioned retune | Recovered 59/59 activation, 101/101 retune and 171/171 later founding/affected tests from Claude's named scratchpad. These are separate retained runs, not a new same-candidate acceptance. |
| P15B | Persisted condition/loan roots, principal/installment logic, shared release predicate | Retained Wave 2 20/20 and Wave 3 6/6. Wave 4 closure phase remains a no-op; nonempty closure records are refused. Wave 5 remains missing. |
| P16 | Rights identity, valuation, sales, diligence, estate scaffolding and acquisition preview | Retained focused selection 85/85. Recorded compiler run failed. Real licence producer and executable healthy absorption remain missing; adapter-only estate input is not integrated closure. |
| P17/P18 | Continuation/cameo and finite TV lifecycle/settlement source drafts | No complete integrated acceptance was found. P18 remains new files without its final save/action/tick integration. |

The recovered founding r2 selection contains 171 tests versus r1's 178: the seven omitted tests all belonged to the separately green retune file and had already passed r1; all eight paired r1 failures passed r2. `reviews/root/FOUNDING-RESULTS-RECOVERY.json` preserves the exact identities and input hashes. This does not establish source identity between those older runs.

R8's broad b4/b5/b6 results could be paired against Claude's retained `core-6510c971.json` and HEAD/start/end/exit records. Of 72 failed occurrences, 68 have the same primary diagnostic, four have changed diagnostics, and none are new or unpaired in those three selections. The changed cases are the seating-preference control, the two 40→18 and 48→42 relationship-ledger boundaries, and the Save38 opening's serialized current-era comparison. They remain failures; message attribution does not prove their cause. The 28 original docs-ENOENT failures were resolved by the paired b7 rerun. See `reviews/r8-results/REPORT.md` and its machine-readable comparison.

## Findings that block integration

1. **Incompatible save schemas reuse version 46.** R8, founding, P15B and P16 each independently extend Save45 with a different V46 shape; P17/P18 likewise planned that number. This was acknowledged as provisional, which is reasonable for isolated drafts. It is still a real integration job: establish each actual predecessor, preserve prior roots and gates, add genuine ordered migrations and test downgrade refusal. Renaming the number or taking the last whole `save.ts` would lose earlier laws.
2. **P16 cannot consume the new P15B root.** P16 `src/core/rightsFinance.ts:33` throws when `corporateCondition` exists, while P15B makes it mandatory. Integrate the actual P15B `conditionRecord` and `outstandingLoan` readers and the completed operating/closure authority. Removing the guard and defaulting to stable/no loan would be wrong.
3. **Acquisition preview omits usable capacity.** P16 `src/core/acquisition.ts:116` retains contracts by term legality and affordability, then allows work to continue if required participants are retained. It does not prove buyer capacity under the adopted P16 contract. Use the real operations/commitment allocator; do not invent a headcount cap. `closeAbsorption` explicitly throws pending prerequisites, so this is an incomplete draft, not a shipped acquisition path.
4. **P17/P18 do not recheck live rights at required consumption boundaries.** P17 release has no live P16 grant dependency; P18 work and distribution check stored grant expiry only. Revocation and authority changes cannot be enforced by those functions. Integrate real subject/right/scope/week resolution at admission and the contracted ongoing work/release/delivery/distribution boundaries. Stored provenance is not present permission.
5. **Two cameo rules conflict with the adopted contract.** Every reserved cameo makes the guest globally busy, so a different-week booking is refused. Separately, factual work-history credit is delayed until release, losing completed work if the film is cancelled. Respect actual obligation intervals; record completed work once at shooting and release credit/fame separately once at release.
6. **P18 changes allocation priority.** The draft consumes remaining capacity after the film sweep, making TV categorically last. The adopted contract requires one shared order of admitted work, using typed IDs only to break ties. Combine allocation requests while retaining existing claims and keeping mandatory charge accounting separate.
7. **Compiler completion and missing producers remain.** Beyond the narrow repair below, P16's retained compiler output contains rights narrowing, current/historical save assumptions and bridge import diagnostics. The four-right licence producer, real P15B closure/claims and P12 operating/linked-employment authority remain implementation work, not missing Owner permission. The founding draft also explicitly retains its week-zero scope interpretation and a storage-budget gap; a 700-byte row regression test does not prove the separate percentage budget.

The P17/P18 findings are source/contract review findings, not newly observed runtime failures. Their exact source hashes, contract clauses, repair order and verification cases are in `reviews/p17-p18/REVIEW.md`.

## Bounded repair performed

Only the isolated P16 draft was edited. Two exhaustive ledger consumer tables now include the three P16 money kinds. Five test literals now use existing typed transaction/estate/manual provenance instead of an unsupported `test` discriminant. No production union, frozen validator or test assertion was broadened. Originals, complete inverse and patches are retained in `reviews/p16-repair-r1/`.

Independent review rejected the first repair: its three `true` engagement entries changed behavior on additive-tolerant V5 envelopes. Founded/entered studio checks do not directly prove `economyEngagedEver`, and the initial follow-up hypothesis that V5 rejects these kinds was also wrong. The actual V5 validator checks the envelope and selected later signatures; it does not reject these ledger kinds. The correction uses `false`, preserving the original missing-key/falsy result in historical V5→V6 reconstruction, and explains that these entries provide exhaustive enum coverage, not current transaction authorization. Rejected r1 and its STOP review are preserved; `reviews/p16-repair-r2/` records the corrected source and rationale.

R2 independent review accepted the bounded source repair with no remaining repair findings (`reviews/p16-review-r2/REVIEW.md`, SHA256 `20976c26043e088d1abd967eef88f25d0d4be5fc4d90374c73107d105957f07d`). The final complete P16 draft is backed up separately in `drafts/p16-r2/`; `CURRENT-DRAFTS.json` selects it.

This is a reviewed source repair of eight named prior diagnostic headings, not a passing whole compiler run. No new game test or compiler was launched in this review. Available disk was about 2.57 GiB, below the recorded heavy-route reserve/floor. The retained original compiler failure and all other failures remain visible. Code-only source backup patches were reverse-checked against their actual drafts without applying them.

## Next engineering work

Preserve the approved dependency order: finish the corrected current-HEAD verification route and causal 1363 admission; land and qualify R8; satisfy conditional main promotion; integrate 1364/1365, P15B/P15C, P16, P17 and bounded P18 against each actual predecessor. The previously named `1370-ar-recovery-route-build-plan-20261010-r1/AR-BUILD-PLAN.md` is absent and must be completed, not treated as a finished deliverable.

Independent draft preparation is useful while that route is blocked. Start downstream integration with a single save-era owner and actual P15B closure/P12 operating producers, then P16 finance/licences/estate/absorption. Fix the P17/P18 contract defects before claiming their focused tests establish the agreed behavior. Keep one recorded heavy lane; retained logs show multiple heavy test processes overlapped during Claude's session, which makes timing evidence unsuitable for isolated performance claims.

## Lessons

- Parallel drafts need a planned integration owner for shared save, money, phase and employment schemas. Green tests in separate clones cannot prove their composition.
- Check consumers against the real producer immediately. A fail-closed adapter is useful scaffolding, not finished integration.
- Test revocation, nonoverlapping appointments, cancellation after completed work and competing film/TV capacity. These distinguish the contract from plausible but incorrect implementations.
- Archive untracked code and temporary test outputs before quota/session loss. A progress note and a docs-only push do not back up the implementation.
- Reconcile reruns by exact identity and occurrence. Keep new, changed, inherited and environment failures distinguishable; never turn diagnostic similarity into causal acceptance.
- A type-only repair can change migration behavior. Read the actual historical validator: this review rejected `true` values and an incorrect unreachability assumption, then preserved the prior falsy behavior without weakening or broadening the validator.
