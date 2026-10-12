# P15B C10/T19 operating-authority disposition

GPT-6.1 Sol, Codex-native read-only reviewer `founding_review_sol`, 2026-10-12. Reviewed `/Users/zacheryspector/studio-specialists/p15b` at base `8cecf5aa8a7073fdad8a02534fe40d67ba54558e` plus the preserved recovered draft; authority documents read in production. No tests/compiler/source/production/package edits. Only this assigned scratch note was written. Preparatory source/contract assessment, not an integrated test pass. Park after this note.

**Disposition: the actual-closure operating predicate is already required by the adopted Wave4 contract. Integrating the shared map is a representation of that rule, not a new gameplay choice or permission to reinterpret advisory condition stages. Parent can record this bounded integration disposition under existing authorization; no additional Owner gameplay decision is necessary merely to choose a derived map instead of a duplicated state discriminator.**

## Governing authority and temporal distinction

1. `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:176` says P12A does not implement closure/recovery; it preserves causal finances/receipts for later P15 behavior. Its ownership table at `:209` reserves canonical active/dormant/closed vocabulary/state commit; `:256-257,303,341,415` separates P15 assessment/orchestration from P12 canonical state/identity/commit authority. Thus an advisory P15 condition alone never grants a consumer permission to delete a business, end employment or stop operations. The existing representation must be extended at actual closure without inventing entry, money, people or capacity (`:18,66-95`).
2. `1357-A-p15b-wave2-charter.md:240-243` explicitly records "closure due" while the studio keeps trading, paying and releasing; rival loop/chart/technology validators remain unchanged. `:235-238` keeps outstanding installment obligations while due. This is the old advisory participation rule, not a permanent exemption from later actual closure.
3. Parent-adopted `1367-stage/p15b-prep/P15B-WAVE4-CLOSURE-CONTRACT.md:22` retains P12 operating-state ownership, then `:26` explicitly makes C the first nonoperating boundary: ordinary input C−1 work/costs settle, final phases run, actual closure commits, and from input C onward no operation/borrowing/hiring/greenlighting/research or operating charges remain. `:30` preserves due-only operation and prospective migrated closure, forbidding automatic/backdated closure on deserialization. `:60` requires loops to consume actual operating state rather than condition stage. `1367-G-downstream-contract-adoption.md` adopts this exact boundary, typed atomic transaction and complete inventory coverage; its wording is later authority than the Wave2-only statement.

The map must therefore be driven by a successfully validated actual closure transaction. Neither `corporateCondition.stage==='closed'`, a warning/distress date, insufficient cash, a forecast nor a Lot-deferred due record may enter it. It is not an independent P15 "fate" guess masquerading as P12 state.

## Reviewed representation and consumers

`src/core/operatingState.ts:10-15` derives `{studioId → closureWeek}` from `studioClosure.closures`. `closeStudio` updates the actual Hollywood employment owner and canonical employment receipts (`studioClosure.ts:264-274`) and publishes the closure root only with the validated result (`:396-400`). This gives one actual transition and one terminal fact, preserving P12 identities/business history. A separate persisted discriminator is not required by the cited contracts and would require reconciliation if added; this note does not forbid a later representation change supported by its own evidence.

Reviewed current consumers:

| Consumer | Actual-state use |
|---|---|
| `hollywoodTick.ts:441-459` | Uses actual closure map; skips ordinary business activity while retaining only the mandated estate run payment loop. |
| `marketIntegration.ts:73-76` / frozen rival due-set loop | Excludes terminal retained productions from NEW releases/batches; preserves already recorded exposures/history. |
| `talentMarket.ts:1424-1428` | Closed businesses cannot submit proposals; existing cost-cutting/decision/extension eligibility remains. |
| `hollywood.ts:105-115` | Retained terminal scripts/productions no longer reserve people. Both core call sites found pass the map: `employment.ts:176`, `hollywoodTick.ts:194`. The default empty map remains historical/no-closure compatibility, not a current consumer shortcut. |
| `technology.ts:597-607` | Stops in-flight deployment for an actually closed studio, retaining pending work without fabricating cancellation or completion. |
| `rivalResearch.ts:289-295` | Stops completing retained physical plans for actually closed businesses. Main per-business dispatcher already excludes their research/admission/disposal work. |
| `corporateConditionLive.ts:63-74` | Stops outstanding schedule/due queries at actual C; the stopped debt stays recorded in closure rather than forgiven. |
| `studioClosure.ts:107-113` / player action and tick entry | Refuses terminal player mutation/time. Deferred due-only player remains outside actual map. |

This resolves C10's specified missed-loop source defects. T19's statement in old `REPORT.md:254` that adopting the map is still an Owner choice can be superseded by the parent's explicit bounded disposition: adopt the already-mandated actual-state semantics through this shared P12-consumer predicate. It is NOT a waiver of implementation tests, linked-employment validation or downstream acceptance.

## Preserve these rules during adaptation

- **Existence/entry:** the map is a terminal exclusion, not proof an ID exists, has entered, or may produce. `isOperatingStudio` returns true when no closure entry exists; therefore preserve original registry, actual `enteredWeek`, business creation, arrival and eligibility checks. Never treat reserved future identities as active merely because absent from the map. Do not add dormancy, re-entry, replacements or population floors (Wave4 `:22`).
- **Creation week/capacity:** ordinary contract start/end, project owner, committed people, exact capacity, construction/deployment dates and admission guards remain authoritative. Closing frees/reconciles actual employment and seats in the transaction; retained terminal work cannot reserve people or produce free output. Do not remove history, reassign creator ownership or mint replacement capacity. O1 recovery disposal remains separate from zero-refund terminal estate dispositions.
- **Cohorts:** operating membership at current input week and historical Ranking membership are different queries. At Ranking W, C=W remains included, C<W excluded, due-only remains; preserve the v1 historical definition and exact creator films (Wave4 `:36-38`; current `powerRankingArchive.ts:27-39` uses strict `C<W`). Do not substitute `closed.has(id)` for this historical boundary test or transfer film credit to an estate buyer.
- **Costs/time:** input C−1 payroll/opex/installment settles once; input C does not incur ordinary charges. Keep canonical estate run due-week payments, debt remainder and claims distribution as settlement exceptions, not restarted operation. Do not use `outstandingLoan===undefined` to claim stopped debt was paid.
- **Compatibility:** old saves with no actual closure stay operating under their existing era rules. Historical public readers remain frozen. Migrated due-only saves do not close during reading. Wave5/Legacy compatibility requirements still gate playable actual closure; this note does not authorize ungating the Lot or immediate closure of a predecessor deprived of recovery opportunities.

## Concise parent integration record proposed

> C10/T19: adopt the shared `operatingState` query over validated actual closure records as the canonical terminal-state consumer interface for this integration. P15 produces the atomic closure/dispositions; P12 Hollywood commits linked employment/identity state and receipts in that transaction. Condition `closed` remains closure due and never independently ends operation. Preserve original entry/creation/capacity/people laws, C−1 settlement, strict historical Ranking C<W cohort and frozen readers. No new gameplay rule, discriminator requirement, dormancy/re-entry or acceptance waiver is introduced.

Required verification after adaptation: lawful due-only versus actually closed save/reload; C−1/C cost/loan boundary; each listed operating-loop distinction beside a valid operating control; linked employment/free-agency and retained-work/capacity conservation; same-W and later Ranking cohorts; predecessor compatibility/refusal purity. Existing r3 control tests use deliberately forged contrast worlds in places (`p15b4-studio-closure.test.ts:700-725`); they establish function distinctions but cannot alone replace a lawful integrated closure witness. Full gate and recovery evidence remain pending.
