Static review found **no new sweep defect or assertion weakening in the sampled edits**. This is a preliminary review of `838dce0218d5c940cdcfd57e01232fbcd1082bf0`, **not sweep readiness**: x2, guard observations, deferred pins, follow-up patches and confirmation remain pending.

I read HANDOFF, the handoff skill, 1361-N including Units step 5, F7/F8, unit metadata/patches, and the named candidate code. All seven scratch patches match their staged copies byte-for-byte. Their 137 distinct edited files are restricted to tests/UI; no unit patch changes production, fixtures or P15 test files. All 18 added `withEmptyP15Roots` helpers independently spell the four expected literal roots.

The following 58 samples cover H/G1/G2/G3/G4a/G4b/G5 and S1–S10/T. Paths are relative to `/Users/zacheryspector/studio-scratch/1361-sweep/x2/tree`; lines identify the candidate code, occasionally the start of a multiline edit. “Sound” means source review, not a measured pass.

| # | Unit/class | Candidate path:line | Review |
|---|---|---|---|
| 1 | H/S1 | `tests/helpers/p14b2-fixtures.ts:122` | V45 validator receives `makeSave`; natural outcome premises retained. |
| 2 | H/S4 | `tests/helpers/p14c2b-fixtures.ts:69` | Adds innermost V45→44; remaining historical chain unchanged. |
| 3 | H/S1 | `tests/helpers/p14c2c-fixtures.ts:29` | Validates a serialized live writer result, not historical bytes. |
| 4 | H/S4 | `tests/helpers/p14c3-canonical-rival-fixtures.ts:198` | Governed downgrade precedes V38 chain; original SHA assertion and week-zero premise retained. |
| 5 | H/S2 | `tests/helpers/p14c3-fixtures.ts:138` | Literal 45 on `makeSave`; historical helper name/label deliberately retained. |
| 6 | H/S1 | `tests/helpers/p14c3-genuine-evidence-fixtures.ts:18` | Identity assertion retained; state immutability assertion retained. |
| 7 | H/S1 | `tests/helpers/p14p3-fixtures.ts:117` | Existing live API adapter now calls V45; adjacent downgrade adapter adds governed step. |
| 8 | H/S5 | `tests/p14c3-save-v38.test.ts:102` | Exact whole-state comparison retained; literal roots use input week. Input immutability and byte checks retained. |
| 9 | H/S8 | `tests/p14c3-save-v38.test.ts:385` | Validator changes only; production-obligation refusal regex unchanged. |
| 10 | H/S7 | `tests/contracts/_v14Contract.ts:384` | Refuses P15 rows or spent allocator before stripping clone; absent historical roots allowed. |
| 11 | G1/S7 | `tests/facility-move-demolish.test.ts:879` | Empty-row assertion plus `next===1` precede strip; V11 demolition assertion remains downstream. |
| 12 | G1/S7 | `tests/p13b-r07-save-v25.test.ts:215` | Same two guards precede V25 projection; historical version stays 25. |
| 13 | G1/S3 | `tests/p13b-r07-save-v25.test.ts:286` | Sentinel 46 and supported range 45 move together. |
| 14 | G1/S5 | `tests/p14b4-save-v30-compatibility.test.ts:229` | Full equality preserved; expected roots take historical input tick. |
| 15 | G1/S10 | `tests/p14b5-relationships.test.ts:322` | Explicit refusal prevents digest normalization from hiding P15 authority. |
| 16 | G1/S10 | `tests/p14b5-relationships.test.ts:331` | Strips only after guard; original frozen digest remains unchanged. |
| 17 | G1/S5 | `tests/p14b9-save-v42.test.ts:198` | Hand lift uses `convertV44ToV45`; no fabricated live roots. |
| 18 | G1/S3 | `tests/p14b9-save-v42.test.ts:244` | Sentinel 999 stays; only supported ceiling changes. |
| 19 | G1/S5 | `tests/p14c1-materialized-aging.test.ts:183` | Ticked hand lift now reaches Save45 through genuine conversion. |
| 20 | G1/S7 | `tests/p14c2s-scientist-retirement.test.ts:333` | Unconditional reader-only strip explicitly cites F8.1; authorized exception. |
| 21 | G1/S5 | `tests/p14d1-rival-shelving.test.ts:630` | Empty market/unfrozen Legacy and archive/allocator checks precede four explicitly named root removals; F7.5/F8.2 satisfied. |
| 22 | G1/S5 | `tests/p14p4p5-casting-reservation.test.ts:220` | Whole-state equality retained with literal roots at `old.state.market.tick`. |
| 23 | G2/S5 | `tests/bridge-p14b2-checkpoint.test.ts:104` | Expected stamp 45 plus roots at each source slot’s tick; full export comparison retained. |
| 24 | G2/S1 | `tests/bridge-p14b2-trust.test.ts:468` | Validates successful Bridge live save; promise outcome assertions retained. |
| 25 | G2/S5 | `tests/bridge-p14c2rm-runtime.test.ts:71` | Historical V37 validator unchanged; live expectation gains roots at historical week. |
| 26 | G2/S5 | `tests/bridge-p14c2s-scientist-runtime.test.ts:151` | Exact canonical comparison retained; first-take and lifecycle assertions still separate. |
| 27 | G2/S5 | `tests/bridge-p14p3-directing-promises.test.ts:386` | Historical slot uses V38; live slot V45; per-slot week and byte equality retained. |
| 28 | G2/S5 | `tests/bridge-p14p4p5-opportunities.test.ts:529` | Historical V39/live V45 distinction retained for both slots. |
| 29 | G2/S5 | `tests/bridge-p14r2r3-prior55.test.ts:211` | Full state comparison gains only governed roots at previous slot tick. |
| 30 | G2/S2 | `tests/bridge-runtime-checkpoint.test.ts:439` | Canonical-byte refusal keeps specific wording, changes V44→V45 only. |
| 31 | G3/S3 | `tests/construction-save-v11.test.ts:554` | Specific unknown-46/range-45 regex retained. |
| 32 | G3/S1 | `tests/contracts/v14-byte-parity.contract.test.ts:201` | By-name validator now V45 for `makeSave` of scripted live state. A refusal is a production stop, not a repin. |
| 33 | G3/S2 | `tests/film-chronicle.test.ts:923` | Narrowing branch follows preceding literal-45 assertion; cannot silently skip on wrong version. |
| 34 | G3/S1 | `tests/p13a-causal-core.test.ts:49` | Ticked week-315 state must validate; no weakening to accommodate recorded archive failures. |
| 35 | G3/T | `tests/p14b10-save-v44.test.ts:361` | Live migration title changes to 45; genuine V44 controls remain unchanged. |
| 36 | G3/S2/UI | `ui/src/engine/d17-save-migration.test.ts:131` | Current export is pinned to 45; adapter success/conversion behavior retained. |
| 37 | G3/S2/UI | `ui/src/session.test.tsx:332` | Re-saved session stamp changes; reload and `converted===false` remain. |
| 38 | G4a/S4 | `tests/contracts/v14-boundary-guards.contract.test.ts:67` | Governed step inserted; no-industry rationale documented; must-succeed chain still must succeed. |
| 39 | G4a/S4 | `tests/p06a-w1-release-authority.test.ts:410` | Governed step inserted before historical release-authority projection. |
| 40 | G4a/S9 | `tests/p13b-s8-save-v27.test.ts:198` | Exact Power Ranking refusal replaces exact romance refusal; masking and own-era coverage documented. Own-leaf x2 confirmation still needed. |
| 41 | G4a/S9 | `tests/p13b-s8-save-v27.test.ts:212` | Exact first guard, M2 attribution, retained own-era receipt assertion and V44 romance coverage documented. |
| 42 | G4a/S8 | `tests/p14b1-t4-regressions.test.ts:86` | Bare refusal preserved under F7.9; passing does not settle guard attribution. |
| 43 | G4a/S8 | `tests/p14c2rm-writer-continuation.test.ts:252` | Specific historical V9 invariant message retained through V45 validation. |
| 44 | G4a/S4 | `tests/p14c3-cohort-transition.test.ts:294` | Governed chain complete; old romance pin explicitly deferred, not an accidental finished assertion. |
| 45 | G4b/S4 | `tests/p14c3-promise-digest-continuity.test.ts:279` | Extra downgrade step; exact genuine raw-byte equality preserved. |
| 46 | G4b/S6 | `tests/p14p3-directing-promises.test.ts:440` | Type changes to actual frozen `bound40`; runtime object and refusal remain unchanged. |
| 47 | G4b/S4 | `tests/p14p4p5-opportunities.test.ts:349` | Must-succeed projection precedes independently asserted V40→39 opportunity refusal. |
| 48 | G4b/S4 | `tests/p14p4p5-opportunities.test.ts:421` | Mutated input traverses new first converter; first-take refusal pattern unchanged. |
| 49 | G4b/S4 | `tests/p14p4p5-screenplay-status.test.ts:323` | Governed chain plus unchanged caught-message assertion; documented weeks 45–48 avoid quarter 52. |
| 50 | G4b/S3 | `tests/save.test.ts:289` | Strengthens bare throw to unknown-version-46 message. |
| 51 | G4b/T | `tests/save.test.ts:453` | Title follows sentinel 46; genuine V15→14 portion retained. |
| 52 | G5/S8 | `tests/cash-ledger-checkpoint-v11.test.ts:287` | Specific genuine reconciliation-boundary regex unchanged. |
| 53 | G5/S8 | `tests/construction-core.test.ts:497` | Live save tamper; specific Annex-before-week-13 guard unchanged. |
| 54 | G5/S8 | `tests/contracts/cross-owner-refusal.contract.test.ts:100` | Caught error still must be an Error and retain slot/overbooking evidence. |
| 55 | G5/S8 | `tests/contracts/phase-table-agreement.contract.test.ts:224` | Exact required-multiset substring retained, avoiding regex interpretation of `+`. |
| 56 | G5/S1 | `tests/contracts/studio-events.contract.test.ts:129` | Live by-name validator updated; owning-boundary behavior retained. Observe bare forbidden-key refusals separately. |
| 57 | G5/S1 | `tests/p14b4-material-evidence-core.test.ts:40` | Live carrier return type moves to V45; frozen V31 carrier remains separate. |
| 58 | G5/S1 | `tests/p14p4p5-receipt-freeze.test.ts:361` | Live validator updated; object identity, committed-root equality and export-byte equality retained. |

Additional historical/control checks: `tests/p14b10-save-v44.test.ts:109`, `:129`, `:139–140`, `:356` retain genuine V44 stamps/readers and own-era romance refusal. `tests/p14b5-relationships.test.ts:162` still pins `9702aa6869cf80f82d5133f68137427a0ed44c07ce987e8fe2be66bbb60f3d78`, with its assertion at `:641`; the sweep does not replace that digest.

Actionable evidence gaps, **not newly discovered code defects**:

1. **Observe bare refusals even if x2 passes.** Candidate sites are `tests/p14b1-t4-regressions.test.ts:86`, `tests/p14c2rm-writer-continuation.test.ts:385`, and `tests/p14c3-save-v38.test.ts:131`. Record each case’s message; the last needs `row.name`. F7.9 governs whether subsequent pins are needed. Also observe `tests/contracts/studio-events.contract.test.ts:221`, identifying event kind and forbidden key, as G5’s handback requests.
2. **Observe loose S9 refusals.** `tests/contracts/v14-boundary-guards.contract.test.ts:215`, `:254`, `:279`, `:304` and `tests/v14-migration.contract.test.ts:244` accept `/cannot downgrade/`, which also accepts an unintended P15 refusal. Record target/version, carrier label, or cell key. A passing test alone cannot close these.
3. **Finish declared S9 follow-ups using measurements.** Preserve precise anchors and write final masking/own-era coverage comments. Existing deferred pins, such as `p14c3-cohort-transition:294` and `p14p3-directing-promises:431`, are transparently unfinished, not findings against the authors.
4. **Apply the production-stop rule before repinning.** Any V45 refusal of lawful ticked Power Ranking states, especially causal-core `:49/:91` or byte-parity `:206`, must be attributed as production fallout rather than relaxed test expectations.
5. **Review the final delta after follow-up patches.** This sample establishes the static baseline; Units step 5’s final conclusion must concern the measured final candidate, not this pre-follow-up tree.

No writes, tests, Node/tsc processes, heavy-lane work, fixture access, Owner-save access or recursive docs scans were performed.

## Observer-script review addendum

After the preceding read-only review was delivered, the parent authorized this one evidence-file write. The preceding review text is preserved above; its no-writes disclosure describes the initial review, before this archival write.

Read only, without executing:
- `/Users/zacheryspector/studio-scratch/1361-sweep/observe-guards.py`
- `/Users/zacheryspector/studio-scratch/1361-sweep/run-guard-observers.sh`

The wrappers execute each original callback exactly once, return the same value or rethrow the same error, and retain all existing assertion matchers. They cover the three required bare sites, the studio-events kind/key case, and all five loose S9 sites with appropriate case labels. Python preflights every replacement before writing and rejects resolved paths outside `x2-guards/tree`. The runner checks that x2 ended and builds a separate scratch tree. It requires the parent's external heavy-lane wrapper as documented; it does not acquire the lane itself.

Two limits to address or record before relying on observations:

1. The runner rebuilds from mutable current repository and patch paths. Capture or verify production and unit identities against x2 before attributing its observations to that candidate.
2. Resolved-path containment allows symlinks whose targets stay inside the scratch tree. Add explicit no-symlink checks if enforcing the literal never-write-under-a-link rule at the observer boundary.

No execution or script modification was performed. This addendum does not change the preliminary status: x2 measurements, deferred follow-ups, and review of the final delta remain required.
