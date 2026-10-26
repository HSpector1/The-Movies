# S8 projection 64 consumer scope — static inspection

Inspection only, 2026-10-26. X is `/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt`, HEAD `9c91232dd980cbe05399b6fd77ed55454e671f86` plus coordinator-installed S8 changes. No runtime, generation, test execution, or checkout writes were performed. V is `/Users/zacheryspector/studio-scratch/p16-sprint7-verification-20261026`. This report does not qualify the combined consumer milestone or Unity counterpart.

## Changed contract and actual consumers

| Source | Consequential change | Existing complete-file selectors |
|---|---|---|
| `bridge/rights.ts:33–46`; `bridge/schema/bridge-schema.ts:2306–2312` | `absorbStudio` quote terms gain required `promiseObligations` (original promise ID, disposition, nullable source contract) and `marketObligations` (proposal/case counts). No new request/action. Full recipient-bound disclosure still precedes private terms; quote success executes the real public close on a discarded successor. | `tests/bridge-p16-rights-parity.test.ts` owns real quote dispatch, strict wire parsing, disclosure refusal, atomic commit/replay and purity. |
| `bridge/promises.ts:101–135`; `bridge/people.ts:553,1062`; `bridge/trust.ts:41–48` | A proved acquired obligation becomes visible to its operating buyer as well as its original issuer. History keeps original promise/contract/window/outcome; operational project mapping supplies disclosed terms. Profile and market-case history share this owner. | `tests/bridge-p14b1-promises.test.ts`, `tests/bridge-p14b2-trust.test.ts`, `tests/bridge-p14p3-directing-promises.test.ts`, `tests/bridge-p14p4p5-opportunities.test.ts`. These exercise actual carriers, role/project meaning and unrelated-viewer privacy, but no v7 acquired history. |
| `bridge/promises.ts:250–256`; session waiver conversion | A proved buyer may request its acquired promise waiver; unrelated rival/unknown promises still fail the existing ownership gate. Acceptance remains the native waiver decision. | `tests/bridge-p14b7-promise-waiver.test.ts`, `tests/bridge-p14b8-waiver-surface.test.ts` (especially groups 7–10 and unrelated-rival controls at 617 onward). |
| Schema projection 63→64; protocol 4 and Save49 unchanged | Canonical JSON/C# manifest and F10/F11 full-current-contract render identities change; the separate checked-in union fixture must be measured independently. Authentic outgoing63 becomes prior; exact prior rosters must retain every older pair. | `tests/bridge-schema.test.ts`, `tests/bridge-contract-generator.test.ts`, `tests/bridge-runtime-checkpoint.test.ts`, plus the existing literal/roster files below. |

`ui/src/components/ProfessionalPromiseTerms.tsx` consumes the unchanged history-row type. Its complete test is `ui/src/components/ProfessionalPromiseTerms.test.tsx`: two existing presentation controls already cover UNKNOWN non-disclosure, all current disclosed roles/opportunity material, and caller purity. A bounded search of `ui` finds no production import of that component, no absorption-quote UI, and no waiver/history flow consuming these new fields. Do not describe this component as a mounted acquisition journey. No new UI source or new UI test is required by these DTO additions alone; the component file is an optional existing presentation regression, not proof of acquired authority.

The prior UI parser `ui/src/lot/snapshot/scriptReview.test.ts` and three script-review UI files consume their own board/adapter shape, not the changed absorption terms/history owner. No parser whitelist change follows from S8's DTO delta. Full current root/Bridge/UI typechecks remain coordinator work after current contract changes; no old type result proves the edited build.

## Smallest complete-file contract selection

Use all **35 existing exact selectors** in `V/consumer-draft/CURRENT-LITERAL-FILES.json`, listed below. Every one still contains a current63 assertion at inspection; historical projection literals must remain historical. Add only:

- `tests/bridge-contract-generator.test.ts` — F10/F11 and pinned current schema/output identities, not just unchanged generator algorithm.
- `tests/bridge-runtime-checkpoint.test.ts` — outgoing registration, exact prior set and current/prior runtime authority.
- `tests/bridge-p16-rights-parity.test.ts` — actual newly enlarged quote response.

That is 38 existing complete files for the direct S8 contract/Bridge scope, not 38 new tests. Select whole files with their original budgets. The seven semantic files above are already in that union. Do not run an artificial new empty-only leaf to raise the count.

The prior pending35 list additionally includes `tests/bridge-development.test.ts` and `tests/bridge-p16-absorption-finance.test.ts`; retain those as unresolved existing milestone work, not as newly discovered DTO dependencies. Union with the direct S8 scope is the prior39 complete Bridge selection plus `bridge-p16-rights-parity` (40 files). This report does not erase the older milestone or require its unrelated whole-project expansion. `bridge-contract-consumer-lock.test.ts` tests the unmodified paired-repository verification machinery; it is not an additional direct DTO selector and does not replace actual paired-current native qualification.

```text
tests/bridge-operations-events.test.ts
tests/bridge-owner-ux-projection21-schema.test.ts
tests/bridge-p10a-w0-people-projection.test.ts
tests/bridge-p11-capital-contributors.test.ts
tests/bridge-p11-ready.test.ts
tests/bridge-p13b-r07-setup.test.ts
tests/bridge-p13b-s1b-seats.test.ts
tests/bridge-p13b-s2-labs.test.ts
tests/bridge-p13b-s3-plans.test.ts
tests/bridge-p13b-s4-office.test.ts
tests/bridge-p13b-s5-adoption.test.ts
tests/bridge-p13b-s6-cancellation.test.ts
tests/bridge-p13b-s7-disclosure.test.ts
tests/bridge-p13b-s8-rivals.test.ts
tests/bridge-p14a1-market.test.ts
tests/bridge-p14a1-release-busy-set.test.ts
tests/bridge-p14a2-market.test.ts
tests/bridge-p14a3-world.test.ts
tests/bridge-p14b1-promises.test.ts
tests/bridge-p14b10-relationship-labels.test.ts
tests/bridge-p14b2-trust.test.ts
tests/bridge-p14b3-promise-command.test.ts
tests/bridge-p14b4-runtime47-compatibility.test.ts
tests/bridge-p14b5-relationships.test.ts
tests/bridge-p14b7-promise-waiver.test.ts
tests/bridge-p14b8-waiver-surface.test.ts
tests/bridge-p14c2rm-runtime.test.ts
tests/bridge-p14c2s-scientist-runtime.test.ts
tests/bridge-p14c3-promise-digest-continuity.test.ts
tests/bridge-p14c3-runtime.test.ts
tests/bridge-p14p3-directing-promises.test.ts
tests/bridge-p14p4p5-opportunities.test.ts
tests/bridge-p14r2r3-prior55.test.ts
tests/bridge-r3n4-read-model-deltas.test.ts
tests/bridge-schema.test.ts
```

## Consequential assertions currently missing

1. No existing test source references `promiseObligations` or `marketObligations`. Rights parity's `legalA` (109–114) checks only the older subset, although `askA` (99–106) will reject missing/malformed required fields through the real closed schema. Thus its clean R03 route proves structural compatibility, not nonempty disposition/count parity. Reuse the already-admitted S8 R02 leaf for all 22 actual quote obligations (19 unbound, one retained, two exit), and the existing Save33 proposal-only leaf for actual `{proposalCount:1,caseCount:0}`. Preserve zero target-case scope; it cannot prove nonempty case projection.
2. Reuse the R02 leaf's genuine post-close state to assert buyer history includes the retained promise with original ID/contract/terms/progress, and excludes unrelated/unbound histories. The original issuer's history and unrelated-viewer privacy must retain their existing meanings. Compare actual Bridge carriers where available, without fabricating a market case merely to force a carrier into existence. After its genuine releaseTalent continuation, the same row should expose the actual settled outcome with original attribution.
3. At that same admitted state, check the waiver converter passes the *ownership* gate for the acquired promise and retains its native consent/feasibility verdict. Do not presume waiver acceptance or invent a substitute. Existing unrelated-rival/unknown controls remain essential. A proved-buyer lookup must not become a blanket rival exception.
4. Acquired SPECIFIC_PROJECT title/ID mapping remains unproved by R02's actual APPEARANCE_COUNT obligation. Existing opportunities tests preserve normal-owner semantics; no source-constructed project fixture can claim the acquired mapping. `promiseAttentionRows` remains original-issuer scoped (`bridge/trust.ts:65`), and waiver substitute disclosure still uses the original issuer/state (`bridge/promises.ts:268`); neither is covered by a genuine acquired-specific-project case. Record this scope instead of inferring a new reminder/attribution policy or claiming an observed bug.

## Prior results: what can be reused

- `V/consumer-generation/AUDIT.md`: complete parser19/19 and generation/check/fixture commands0 were projection63 evidence. Preserve the parser's tested script-review meaning. Schema/C#/manifest/F10/F11 full-contract output checks are invalidated for current64; outgoing63 identity remains authentic historical evidence. `S8/contract64/INPUTS.json` already records the exact measurement/output route.
- `V/consumer-resume/PARTIAL-RESULT.json`: completed generator31/31, market16/16, waiver32/32, relationships10/15 remain historical observations. Current-version/hash/roster assertions change, so none of those complete files is qualified for64 by reuse. Keep the five exact inherited D5 relationship first failures and downstream-unreached limits; no expectation weakening.
- `V/native-consumers-final/AUDIT.md` and `ui-consumers.json`: three UI files completed20/20 at e0d4c239, with recorded per-body budget evidence. They test script-review presentation, not S8 obligations; retain that scope. They are not fresh S8 engine or combined-gate results.
- `V/native-queue-consumers/AUDIT.md`: the latest actual9c pending35 run produced only the RUN banner, exit143, no completed results. Selection membership is not execution evidence. Those files remain open where no other completed evidence exists.
- Outgoing registry/roster work belongs to the canonical owner. At initial inspection, schema source was64 while registry/generated outputs/literal expectations had not advanced. The coordinator subsequently installed actual generated64 outputs and the authentic outgoing63 registry/roster patch; current literal updates and executed consumer qualification remain separate. Do not replace old fixtures with edited version labels, or use newly self-generated values as independent historical pins.

Inspected SHA256 pins: rights `88081804cb7f67a2313c1f7585143d0311e03b5ae627b4fda50b4b627a43b82e`; promises `7dad063136a879f7dffcdca54ef0f1422e1faad5249c61ffb4bc139c2ec20723`; schema source `6f032b3a6800408dfb3109e166353c9013db3e1890ff10313c725debc75863b3`; runtime-checkpoint `fde85439016f639e3b20f4949fe4194bfd1ddcc510b432561d6ca592bc90dc41`; rights-parity test `ee78ae74f6448ed8d1a3eb74c06cd6bde54edf3d0373c080625d7339a39d4644`. These bind inspection, not executed qualification.

Coordinator evidence received after initial inspection: `GENERATED-OUTPUTS.json` records actual scratch64 schema `sha256:57f12ee28d21aa47c7514afa1c058105a10f10a9e76d400d664e97c23dc90272`. The separate generated union fixture is **unchanged**, SHA256 `be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6`, 44,592 bytes; do not equate this with the full-contract F10/F11 render pin. `outgoing63/OUTGOING63-RECEIPT.json` binds the actual source9c public save capture (raw SHA256 `e699c9b066da20ca4c46498215bca841afa5ddc9e9e571d6c3586520d0e0df65`). `test-draft/MANIFEST.json` now binds an unrun minimal extension of the two existing S8 leaves and existing prior-identity loop; it addresses items1–3 above without a new leaf. Item4 remains unproved. No generated/native/consumer test result is inferred from preparing the extension.
