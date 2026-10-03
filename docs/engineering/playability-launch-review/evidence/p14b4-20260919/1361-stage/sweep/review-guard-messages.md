# Independent guard-message attribution — preliminary

Reviewer: Codex independent sweep reviewer. No final r2 approval: x3 and final delta review remain pending.

Read `x2-guards/messages.json`, the diagnostic raw `observer.txt`, and the named test sources under `x2-guards/tree`, without fixtures. Also inspected the exact relevant implementation guards in `src/core/professionHistory.ts` and `src/core/save.ts`. All 343 JSON observations exactly match the observations parsed from the raw log in sequence. The raw summary is 17 failed / 219 passed / 236 total. No observed message names a P15 refusal or a missing Save45 root.

## Required precise pins

Four case-specific pins are recommended under F7.9 because the observed first guard masks the intended direct predicate. Preserve inputs, existing positive controls, other assertions and the bare form of unaffected cases; do not rewrite cases to manufacture later coverage.

| File and case (observer-tree lines) | Actual first guard | Required pin and attribution |
|---|---|---|
| `tests/p14c2rm-writer-continuation.test.ts:345`, full-save control at `:385`: `announcement lies in the future` | All four caller variants reach V36 `talentMarket.cases[25]` coherence, before the lifecycle record's future-announcement validation. `save.ts:10350` checks announcement against the retirement-extension case's opened week. | Pin the exact observed message: `validateSaveV37: state is invalid — validateSaveV36: talentMarket.cases[25] opened at week 300, when authored-0000's retirement was not announced (announced week 313, effective week 312)`. An anchored regex must escape the brackets and parentheses. Disclose that this is the market case/retirement join, not direct lifecycle future-date proof. Keep the separate live-caller assertion. |
| `tests/p14c3-save-v38.test.ts:295`: `missing chosen change` | Removing the director row leaves another change's original ordinal/id inconsistent with its new array index. `professionHistory.ts:207–208` refuses before missing chosen-change linkage or role-history validation. | `/^validateSaveV38: invalid profession change catalogue\/ordinal\/id$/`. Disclose continuity masking; this mutant does not isolate the missing chosen-change guard. |
| `tests/p14c3-save-v38.test.ts:296`: `missing predecessor evaluation` | Removing the director evaluation leaves another evaluation's ordinal/id inconsistent with its new index. `professionHistory.ts:179` fires before the profession-change/evaluation join at `:210–211`. | `/^validateSaveV38: evaluation ordinal\/id\/rulesVersion mismatch$/`. Disclose continuity masking; this mutant does not isolate the missing predecessor join. |
| `tests/p14c3-save-v38.test.ts:324`: `declinedAll requires its actual evaluation` | The control is a Scientist finality. `declinedAll` is a recognized cause, but `professionHistory.ts:228` rejects it when the unchanged profession is not actor. Evaluation lookup at `:229–230` is never reached. | `/^validateSaveV38: unknown industry finality cause$/`. Disclose that the first guard is actor/cause eligibility, not the evaluation reference claimed by the case name. |

These are test-evidence attribution corrections, not production defects. Source mutation and first guard remain causally related in each case; the purpose of the pins is to prevent a bare throw from overstating which predicate is exercised.

## Why other observed bare cases need no new pin

- The 15 observed P14B.1 cases reach proposal-promise shape/ownership, contract identity/beneficiary/issuer coherence, or contract-window/outcome chronology. These are the intended relationships deliberately invalidated. A `contractId` message after changing beneficiary or issuer remains that same relationship's guard; an `outcomeWeek` message after changing the contract pointer remains the explicitly tested contract/outcome ordering. No unrelated root masks them.
- Seven of the writer's eight corruption variants (28 observations) reach the intended effective-week, finishing/status/retired-week, episode-uniqueness or intent-version authority. The duplicate-record case uses the later V38 person/profession episode check, but it is still the directly duplicated lifecycle authority, not a different field's incidental failure.
- The other 99 C3 mutants reach their changed root/field/identity or their deliberately invalidated evidence/chronology relation. Structural duplicate evaluation/change entries reach their own ordinal/id identity guard; the two *removal* cases above instead fail an untouched surviving row's shifted index and need disclosure. `uncompleted source` directly targets the completed-retirement predecessor relationship and receives exactly that refusal. It is not an incidental unrelated guard.
- All 24 studio-event observations identify the exact forbidden `seen` or `consumed` key. The `releaseCommitted` variant traverses the long frozen chain to V12, but still names the deliberately injected studio-event key. No pin required.

Some names are narrower than their own-field validation actually proves: `anchor after current clock` reaches existing-anchor/boundary equality; `change date disagrees with evaluation` reaches the changed week's campaign bounds; `change person disagrees with evaluation` uses an unknown person and reaches person membership. These are the same fields deliberately changed, so F7.9 does not require broadening this sweep into new inputs or new semantic test coverage. They must not be cited as isolated proof of the later relationships.

## Loose S9 observations

| Site | Count | Attribution | Disposition |
|---|---:|---|---|
| `v14-boundary:215` | 55 | All target/version pairs refuse at the named historical migrator (targets V4–V13, higher inputs through V14). | No P15 masking; keep existing pattern. |
| `v14-boundary:254` | 1 | `migrateToV13: cannot downgrade SaveFileV14 or discard set, queue, screenplay, and studio-history state`. | Intended V14→V13 boundary; no new pin. |
| `v14-boundary:279` | 104 | 13 frozen builders × 8 carriers. Six carrier families reach their corresponding sets, history, queue, screenplay or set-capital authority. Two workflow carriers reach existing V14 studio history. | No P15 masking. Plan S9 specifically keeps loose patterns unless the new P15 guard masks them, so no sweep edit required. Record workflow limitation below. |
| `v14-boundary:304` | 1 | `makeSaveV13: cannot downgrade or discard authoritative V14 studio history`. | Allowed historical refusal; no new pin. |
| `v14-migration:244` | 9 | Every observed builder call returns; the surrounding exact byte/round-trip checks continue. | No refusal was swallowed. No new pin. |

The workflow-bound-to-set and set-unavailable-blocker carriers account for 26 of the 104 builder observations. Both are refused for studio history already present in `inFlight`, so these observations do **not** isolate workflow-binding/blocker downgrade guards. This is historical V14 masking, not newly introduced P15 masking; it does not authorize changing the sweep's settled S9 policy.

## Coverage limits

- Fifteen existing P14B.1 terminal-reference leaves still fail in `sharedTakeOutcomes()` before these mutants: one positive round-trip, six outcome-receipt variants, and eight evidence variants. None of those terminal mutations was observed, and this review makes no claim about their first guards. The raw failure identities and source `:267–283`, `:286–345` confirm the boundary. Do not edit retained identities merely to reach them.
- The diagnostic measured the original x2 candidate with observer wrappers, not final r2/x3. Its other two failures and retained failure attribution remain the parent's recorded-run responsibility.
- The writer observer covers the full-save control only. The four separate live entrypoints still have their original assertions, but their messages were not observed by this instrumentation.
- No tests, Node/tsc processes or source edits were performed by this reviewer. Only this explicitly authorized report was written.

## Complete observed bare-case ledger

The tables below retain every observed case. Messages are exact, except P14B.1's repetitive wrapper chain is omitted before its final `validateSaveV40:` segment. Cases marked `pin` refer to the four requirements above; `own guard` means no additional F7.9 pin required, not a claim that every later guard executes.

Evidence SHA-256 (`messages.json`): `857c65e167841ed1e90c2ae74c70c092298479702e27abce5eaf7b084c099255`.

### P14B.1 — 15 observations

| Case | First guard | Disposition |
|---|---|---|
| rejects a missing proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises must be an array of at most one promise ID | own guard |
| rejects a null proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises must be an array of at most one promise ID | own guard |
| rejects a string proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises must be an array of at most one promise ID | own guard |
| rejects a object proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises must be an array of at most one promise ID | own guard |
| rejects a non-string member proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises must be a non-empty string | own guard |
| rejects a unknown reference proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises does not name this proposal's own promise | own guard |
| rejects a duplicate reference proposal promises leaf before it is stripped for frozen V28 validation | validateSaveV40: state.talentMarket.proposals[0].promises must be an array of at most one promise ID | own guard |
| rejects attaching another issuer's real promise ID to a proposal | validateSaveV40: state.talentMarket.proposals[1].promises does not name this proposal's own promise | own guard |
| rejects a bound promise whose contract ID is absent | validateSaveV40: state.promises[0].contractId does not name this person's employment at the issuing studio | own guard |
| rejects a real contract ID belonging to a different beneficiary or issuer | validateSaveV40: state.promises[0].contractId does not name this person's employment at the issuing studio | own guard |
| rejects a bound promise with missing contract field independently of the other pair field | validateSaveV40: state.promises[0].contractId is missing | own guard |
| rejects a bound promise with wrong beneficiary independently of the other pair field | validateSaveV40: state.promises[0].contractId does not name this person's employment at the issuing studio | own guard |
| rejects a bound promise with wrong issuer independently of the other pair field | validateSaveV40: state.promises[0].contractId does not name this person's employment at the issuing studio | own guard |
| rejects the same pair's previous contract, whose interval cannot carry this window | validateSaveV40: state.promises[0].contractId ends before the promised window | own guard |
| rejects a terminal promise rebound to the same pair's later actual contract starting after its outcome | validateSaveV40: state.promises[0].outcomeWeek precedes the contract that carried this promise | own guard |

### Writer authority — 8 variants × 4 callers

| Case | Observations | First guard | Disposition |
|---|---:|---|---|
| 'non-finite effective week' | 4 | validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV34: careerLifecycle.records[1].effectiveWeek must be a whole week | own guard |
| 'fractional effective/finishing week' | 4 | validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV34: careerLifecycle.records[1].effectiveWeek must be a whole week | own guard |
| 'announced status at the effective week' | 4 | validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV35: frozen V34 state is invalid — validateSaveV34: retirement record for authored-0000 is still announced at week 312, at or after its effective week 312 | own guard |
| 'finishing date differs from the effec…' | 4 | validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV35: frozen V34 state is invalid — validateSaveV34: retirement record for authored-0000 is finishing commitments from week 311, which is not its effective week 312 at or before week 312 | own guard |
| 'announcement lies in the future' | 4 | validateSaveV37: state is invalid — validateSaveV36: talentMarket.cases[25] opened at week 300, when authored-0000's retirement was not announced (announced week 313, effective week 312) | pin |
| 'finishing status carries a retired da…' | 4 | validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV35: frozen V34 state is invalid — validateSaveV34: retirement record for authored-0000 is finishing commitments but carries a retirement week | own guard |
| 'duplicate lifecycle person authority' | 4 | validateSaveV38: duplicate person/profession retirement episode | own guard |
| 'unsupported lifecycle intent version' | 4 | validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV34: careerLifecycle.records[1].intentRulesVersion must be 1 | own guard |

### C3 — all 102 mutant observations

| Case | First guard | Disposition |
|---|---|---|
| missing transitionBoundaryWeek | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| missing professionAnchors | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| missing transitionEvaluations | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| missing professionChanges | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| missing industryRetirements | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| missing transitionDue | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| unknown root key | validateSaveV38: careerLifecycle must carry exactly boundaryWeek, records, cohorts, transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges, industryRetirements, transitionDue | own guard |
| events cannot be null | validateSaveV38: transitionEvaluations must be an array | own guard |
| queue cannot be an object | validateSaveV38: transitionDue must be an array | own guard |
| invalid boundary -1 | validateSaveV38: careerLifecycle.transitionBoundaryWeek must be a safe nonnegative integer | own guard |
| invalid boundary 0.5 | validateSaveV38: careerLifecycle.transitionBoundaryWeek must be a safe nonnegative integer | own guard |
| invalid boundary NaN | validateSaveV38: careerLifecycle.transitionBoundaryWeek must be a safe nonnegative integer | own guard |
| invalid boundary Infinity | validateSaveV38: careerLifecycle.transitionBoundaryWeek must be a safe nonnegative integer | own guard |
| invalid boundary 9007199254740992 | validateSaveV38: careerLifecycle.transitionBoundaryWeek must be a safe nonnegative integer | own guard |
| invalid boundary 208 | validateSaveV38: transition boundary is outside recorded campaign history | own guard |
| missing person anchor | validateSaveV38: professionAnchors must name every person once in talent order | own guard |
| duplicate person anchor | validateSaveV38: professionAnchors must name every person once in talent order | own guard |
| wrong anchor order | validateSaveV38: professionAnchors identity or order mismatch | own guard |
| unknown person | validateSaveV38: professionAnchors identity or order mismatch | own guard |
| invalid kind | validateSaveV38: unknown profession anchor kind | own guard |
| unknown profession | validateSaveV38: anchor profession is not a profession | own guard |
| existing anchor before boundary | validateSaveV38: existing profession anchor must equal transition boundary | own guard |
| anchor after current clock | validateSaveV38: existing profession anchor must equal transition boundary | own guard |
| unknown anchor field | validateSaveV38: professionAnchors[0] must carry exactly personId, profession, recordedWeek, kind | own guard |
| missing anchor field | validateSaveV38: professionAnchors[0] must carry exactly personId, profession, recordedWeek, kind | own guard |
| role rewrite without a change | validateSaveV38: current profession changed without its anchored change history | own guard |
| existing anchor cannot grant presence before genuine creation | validateSaveV38: existing profession anchor predates the person’s observed presence | own guard |
| missing due person | validateSaveV38: transitionDue differs from exact prospective reconciliation or deferred schedule | own guard |
| duplicate due person | validateSaveV38: transitionDue differs from exact prospective reconciliation or deferred schedule | own guard |
| wrong queue order | validateSaveV38: transitionDue differs from exact prospective reconciliation or deferred schedule | own guard |
| due today is stale | validateSaveV38: transitionDue must be strictly after the current week | own guard |
| arbitrary future week is not the exact next due | validateSaveV38: transitionDue differs from exact prospective reconciliation or deferred schedule | own guard |
| fractional week | validateSaveV38: transitionDue.week must be a safe nonnegative integer | own guard |
| unknown due person | validateSaveV38: profession history names unknown person missing-person | own guard |
| extra due property | validateSaveV38: transitionDue[0] must carry exactly personId, week | own guard |
| missing due date | validateSaveV38: transitionDue[0] must carry exactly personId, week | own guard |
| extra evaluation key | validateSaveV38: transitionEvaluations[0] must carry exactly id, ordinal, week, personId, source, rulesVersion, inputs, inputsDigest, outcome, selected, reason | own guard |
| missing rules version | validateSaveV38: transitionEvaluations[0] must carry exactly id, ordinal, week, personId, source, rulesVersion, inputs, inputsDigest, outcome, selected, reason | own guard |
| extra inputs key | validateSaveV38: transition inputs must carry exactly age, actingFirstTakes, leadFirstTakes, actingWitnesses, targets | own guard |
| extra target key | validateSaveV38: transition targets[0] must carry exactly profession, capability, roleTier, workHistory, proven, potentialTier, contextCount, contextBand, contextWitness | own guard |
| extra context key | validateSaveV38: contextWitness must carry exactly counterpartId, pictures | own guard |
| extra picture key | validateSaveV38: context picture must carry exactly studioId, pictureId | own guard |
| extra source key | validateSaveV38: retirement source must carry exactly personId, profession | own guard |
| rules version2 | validateSaveV38: evaluation ordinal/id/rulesVersion mismatch | own guard |
| negative ordinal | validateSaveV38: evaluation ordinal/id/rulesVersion mismatch | own guard |
| noncontiguous ordinal | validateSaveV38: evaluation ordinal/id/rulesVersion mismatch | own guard |
| id not derived from ordinal | validateSaveV38: evaluation ordinal/id/rulesVersion mismatch | own guard |
| duplicate evaluation | validateSaveV38: evaluation ordinal/id/rulesVersion mismatch | own guard |
| unknown person | validateSaveV38: profession history names unknown person missing-person | own guard |
| source names another person | validateSaveV38: retirement source person must match its subject | own guard |
| source is not an actor retirement | validateSaveV38: transition catalogue requires original actor retirement | own guard |
| evaluation before actual retirement | validateSaveV38: evaluation week must be after the transition boundary and at/before the campaign week | own guard |
| evaluation after current week | validateSaveV38: evaluation week must be after the transition boundary and at/before the campaign week | own guard |
| nonfinite event week | validateSaveV38: evaluation week must be a safe nonnegative integer | own guard |
| uncompleted source | validateSaveV38: evaluation lacks completed acting retirement predecessor | own guard |
| age disagrees with immutable provenance | validateSaveV38: evaluation age differs from immutable provenance | own guard |
| unsafe total | validateSaveV38: actingFirstTakes must be a safe nonnegative integer | own guard |
| negative lead count | validateSaveV38: leadFirstTakes must be a safe nonnegative integer | own guard |
| capability zero | validateSaveV38: target capability must be within1..99 | own guard |
| capability100 | validateSaveV38: target capability must be within1..99 | own guard |
| fractional capability | validateSaveV38: target capability must be a safe nonnegative integer | own guard |
| invalid potential enum | validateSaveV38: unknown public potential tier | own guard |
| tier disagrees with capability | validateSaveV38: target roleTier disagrees with its public capability | own guard |
| proven disagrees with zero work | validateSaveV38: target proven disagrees with capability/workHistory snapshot | own guard |
| context band outside closed enum | validateSaveV38: target contextBand disagrees with exact count | own guard |
| wrong target order | validateSaveV38: transition target order must be director, writer | own guard |
| missing target | validateSaveV38: transition inputs need exactly director and writer targets | own guard |
| missing acting witness | validateSaveV38: acting witness count differs from bounded evidence | own guard |
| unknown acting witness | validateSaveV38: acting counts or bounded witness differ from retained evidence | own guard |
| wrong context witness | validateSaveV38: target context count or bounded witness differs from retained evidence | own guard |
| malformed digest | validateSaveV38: transition inputsDigest differs from the canonical recorded question | own guard |
| different well-shaped digest | validateSaveV38: transition inputsDigest differs from the canonical recorded question | own guard |
| valid digest cannot authorize wrong selected target | validateSaveV38: transition outcome/selection/reason differs from deterministic public choice | own guard |
| valid digest cannot authorize wrong outcome | validateSaveV38: transition outcome/selection/reason differs from deterministic public choice | own guard |
| valid digest cannot authorize wrong reason | validateSaveV38: transition outcome/selection/reason differs from deterministic public choice | own guard |
| unknown outcome | validateSaveV38: transition outcome/selection/reason differs from deterministic public choice | own guard |
| noncatalogue selection | validateSaveV38: transition outcome/selection/reason differs from deterministic public choice | own guard |
| missing chosen change | validateSaveV38: invalid profession change catalogue/ordinal/id | pin |
| missing predecessor evaluation | validateSaveV38: evaluation ordinal/id/rulesVersion mismatch | pin |
| duplicate profession change | validateSaveV38: invalid profession change catalogue/ordinal/id | own guard |
| unknown evaluation reference | validateSaveV38: profession change has no matching chosen evaluation | own guard |
| change person disagrees with evaluation | validateSaveV38: profession history names unknown person missing-person | own guard |
| change date disagrees with evaluation | validateSaveV38: profession change week must be after the transition boundary and at/before the campaign week | own guard |
| change ordinal not contiguous | validateSaveV38: invalid profession change catalogue/ordinal/id | own guard |
| change id not derived from ordinal | validateSaveV38: invalid profession change catalogue/ordinal/id | own guard |
| change cannot originate in a writer | validateSaveV38: invalid profession change catalogue/ordinal/id | own guard |
| extra change field | validateSaveV38: professionChanges[0] must carry exactly id, ordinal, week, personId, from, to, evaluationId | own guard |
| current role omits actual change | validateSaveV38: current profession changed without its anchored change history | own guard |
| chosen person still queued | validateSaveV38: transitionDue differs from exact prospective reconciliation or deferred schedule | own guard |
| missing finality | validateSaveV38: non-catalogue retirement is missing its exact finality | own guard |
| duplicate finality | validateSaveV38: industry retirement episode/identity mismatch | own guard |
| retroactive finality at migration | validateSaveV38: industry retirement week must be after the transition boundary and at/before the campaign week | own guard |
| future finality | validateSaveV38: industry retirement week must be after the transition boundary and at/before the campaign week | own guard |
| wrong final profession | validateSaveV38: industry retirement episode/identity mismatch | own guard |
| wrong source person | validateSaveV38: retirement source person must match its subject | own guard |
| wrong source profession | validateSaveV38: industry retirement episode/identity mismatch | own guard |
| noCatalogue cannot reference an evaluation | validateSaveV38: noCatalogue finality requires a non-actor and no evaluation | own guard |
| declinedAll requires its actual evaluation | validateSaveV38: unknown industry finality cause | pin |
| unknown finality cause | validateSaveV38: unknown industry finality cause | own guard |
| extra finality field | validateSaveV38: industry retirement must carry exactly personId, week, profession, source, cause, evaluationId | own guard |
| missing finality key | validateSaveV38: industry retirement must carry exactly personId, week, profession, source, cause, evaluationId | own guard |
| final person cannot remain queued | validateSaveV38: transitionDue differs from exact prospective reconciliation or deferred schedule | own guard |

### Studio events — all 24 observations

| Kind / forbidden key | First guard attribution |
|---|---|
| premiere/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| premiere/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| wrapped/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| wrapped/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| releaseCommitted/seen | validateSaveV12: state.studioEvents releaseCommitted row 0 has unknown field "seen" |
| releaseCommitted/consumed | validateSaveV12: state.studioEvents releaseCommitted row 0 has unknown field "consumed" |
| constructionCompleted/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| constructionCompleted/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| setBuilt/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| setBuilt/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| setRetired/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| setRetired/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| reservationGranted/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| reservationGranted/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| reservationReleased/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| reservationReleased/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| queueAdmitted/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| queueAdmitted/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| queueIntentExpired/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| queueIntentExpired/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| phaseEntered/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| phaseEntered/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
| sceneryArrived/seen | validateSaveV14: state.studioEvents.rows[0] has unknown field "seen" |
| sceneryArrived/consumed | validateSaveV14: state.studioEvents.rows[0] has unknown field "consumed" |
