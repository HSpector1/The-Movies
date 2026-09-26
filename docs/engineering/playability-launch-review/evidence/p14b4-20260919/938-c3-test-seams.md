# 938 — C.3 independent test and persistence source reconciliation

2026-09-26. Source `9afae8874486fbb20dc5d373526698aacbec2114`, observed clean at
entry. C.2-RM qualification is936: Save37, projection52, protocol4, lifecycle
intent1, promise4. This is a source-based test plan, not an executed probe or a
C.3 implementation contract. Parent owns final expansion937, production and every
execution; the other specialist owns review939. Only this document was written.

## Authority and classification

Read companion §6.3 (lines519–532), adjacent §6.1–6.6 and register R20; Owner
rulings §3.4.1 directions9–11/14;773 with its amendments;782's adopted cohort
amendments;823 promise disposition;875 read models;880-B/894 live writer
validation;936 qualification. The companion and Owner rulings live under
`docs/engineering/p14-preparation-8ef5246a/`.

**Settled:** profession retirement differs from final industry retirement;
Actor→Director and Actor→Writer are the narrow initial catalogue; meaningful
recorded career context and P10 aptitude matter; transition is not guaranteed at
a birthday; identity/history survive; retirement completes obligations first;
retirement from the old profession is final; player/rival law is symmetric;
state and derived caches stay campaign-local. Nothing authorizes cloning a
person, arbitrary profession hopping, an automatic studio contract or a payment
for changing profession. No new honors or mentorship history may be invented.

**Companion recommendations requiring concrete selection in937:** evaluate after
actual profession retirement and at bounded later due weeks; version the rule and
record its actual inputs; use P10's capability/identity and public potential band;
choose or decline autonomously; rewrite `Talent.role` through its P10 owner and
enter the existing free-agent path. Industry retirement is terminal with no more
transition evaluations. The hard-plus-five-years example, thresholds, cadence,
tie policy and other numbers are delegated tuning, not automatically new Owner
questions. R20 explicitly classifies the eligibility and boundary recommendation.

**Reconciliation required before exact RED expectations:** §6.3 allows later
evaluation but also names declining every transition/exhausting the catalogue as
final industry retirement. The expansion must distinguish temporary ineligibility,
an actual decline, and permanent exhaustion, and define the last due boundary.
The reference to §2.1.7 reservation is not a callable transition chooser today:
that code compares studio offers with terms/issuers. Select how its deterministic
choice principles apply when profession change itself has no employer or salary;
do not fabricate a proposal to invoke it. Relationship tier display after a
return to work also needs an explicit amendment of875's retired-person premise.
These are first delegated reconciliation tasks. Escalate only if the parent finds
materially different unresolved product experiences after applying the existing
directions; this report does not turn every missing constant into an approval gate.

## Source seams that a role rewrite must actually satisfy

| Current source fact | Required C.3 discriminator |
| --- | --- |
| `careerLifecycle.ts:53` `retirementRecordFor` returns the first record by person. `lifecycleStatus`, `contractEndRefusal`, `assignmentRefusal`, `withdrawnPersonIds`, and intent's recorded-id set inherit this identity. | Historical acting retirement must not suppress current directing/writing employment; the second profession can announce/finish/retire without replacing the first record. Duplicate same-profession records remain invalid. |
| `save.ts:9543–9599` requires one record per person, every record's profession equal to current `Talent.role`, and caps every later person binding against that record's E. | A validated chronology must distinguish the old profession episode from a real new-profession contract after old E. A forged role change, overlapping career episodes, or old-profession overrun must still fail.773 §9.2 already names `(personId, profession)` as C.3's amendment. |
| `validateRetirementExtensions` at9946 onward uses a person-keyed map and permits one extension case per person ever; `careerLifecycle.ts` and `talentMarket.ts` find the same single retirement record. | The selected per-profession extension law needs an unambiguous historical join to the correct retirement episode. A second case in the same episode remains refused; an old settled extension must not bind a new episode or supply its reasons. Do not silently infer whether the one-use limit is lifetime or per profession. |
| `deriveCohortRequest` counts current `Talent.role` and excludes every person having a retired record. `validateCohortReceipts` (`save.ts:9733–9794`) checks an entrant's original role against current role, then re-derives historical requests using current role. | Count the active new profession today while reconstructing profession at each past cohort week. Existing receipts and their contiguous person-id blocks remain byte-identical. A cohort-born actor is essential: a genesis-only transition misses the entrant-role check. |
| `hollywoodValidation.ts:144–145` checks authored-start credits against current talent role and canonical `RIVAL_TEAM_ROLES`. | A real starting rival actor's later role change must not invalidate old authored credits. Wrong canonical credit role/name/person/entry interval and a forged historical role must still fail. The historical validator stays strict. |
| `retirementWritingAuthority` treats a second record for one person as ambiguous and removes that person's grant. Current live save/tick/Calendar/construction/action entry points deliberately thread invocation-local authority; public historical readers omit it. | An actor who later becomes a writer may eventually have a second retirement record and genuine retained drafting across E. Admit only that current episode's real pre-E task and natural-expiry evidence; old acting retirement must neither revoke nor grant writing authority. Retain the temporal, duplicate, issuer/project/date and early-termination negatives from880-B. |
| `productionAdmission.ts:70–95` admits by discipline presence, not primary profession. Current lifecycle assignment refusal is person-only. | New directing/writing work must become possible without reopening acting seats after final acting retirement. Test direct greenlight/core actions, not only the role-filtered candidate lists. Permanent credit on an existing screenplay is distinct from a new writing task. Preserve M16's one-person/one-role-per-picture law. |
| `talentSummary.ts:475–565` exports `expectedPotentialTier`, `expectedPotentialRange`, and `careerIdentity`; capability uses perceived OVR and P10's minimum, proven additionally requires real work-history count. | Test capable-but-unproven separately from proven; use these authorities by reference. A role rewrite must not fabricate a first directing/writing credit or alter skills, ceilings, experience, age/provenance or Star Power. A public-band rule must not quietly depend on hidden ceiling values. |
| Real first takes live in `state.firstTakes`; released participants and Hollywood credits are distinct facts. C2c's helpers can produce takes and cancellation without releases. | Count the input the selected rule actually names: deduplicated person/role participation in real take receipts, lead identity, and lawful collaboration evidence. Do not present cancelled first takes as released-film credits or invent mentorship labels. |
| `promises.ts` reads a person-only retirement record in feasibility/digests and uses `assignmentRefusal`.823 preserves terminal outcomes and existing qualifying seats. | The old actor record cannot impose old E on new-profession contracts or reopen/overwrite a terminal promise. On ordinary natural paths old bound promises are due no later than carrying contract end≤E≤retiredWeek; test this premise before inventing a transition-triggered VOIDED case. Any new policy must have an actually reachable open obligation. |
| `bridge/lifecycle.ts` derives one lifecycle/alumni block; roster and Industry alumni use that status. `bridge/relationships.ts:191` freezes displayed tier at that record's retired week and cannot reconstruct a tier after a later retained event. | Show current profession/activity plus truthful old-profession retirement history under one identity. New work creates real later relationship events; retaining the old global freeze would yield stale/unknown current tiers. The chosen presentation must specify live current ties versus historical alumni facts, current disclosure and final-industry as-of behavior. |

The cohort and authored-start checks are historical authority checks, not cosmetic
list repairs. A new validator must prove historical profession at the relevant
week from genuine transition history; rewriting old receipts, substituting today's
role everywhere, or simply removing checks would weaken the persistence contract.
Bindings likewise need the correct profession episode; excluding all historical
retired records from validation would admit illegal past employment.

## Existing and proposed genuine outgoing Save37 T0 worlds

No artifact was minted or inspected by execution for this report. “Existing” below
means bytes/manifest and source tests already exist; “candidate” means the parent
must produce and validate the world with the unchanged Save37 writer before the
C.3 save step. Never relabel a V35 file as V37 or edit its historical ledger.

| World / seam | Genuine facts available and intended discrimination | Limit or prerequisite |
| --- | --- | --- |
| Existing `tests/fixtures/p14/genuine-projection51-runtime-c2rm/` | Manifest records genuine Save37 at617/618/669/670 from producer872 and source48a76a87; real Scientist announcement618/E670. Runtime has actual saved669/current670, one journal entry and distinct slot bytes. Covers old Save37 law, non-catalogue Scientist, two-slot migration and prior journal reset. | This is projection51 runtime, not a new outgoing52 runtime and not an actor-transition witness. Reuse its immutable bytes; do not mint replacements. |
| Candidate current projection52 runtime | Under source9afae887, create an actual Save37 saved slot and a later current slot with a real command/journal; capture before any projection/save bump. | Parent must mint through the public session/runtime path and record exact producer/source/raw/gzip/digests. Required separately from the old51 corpus if C.3 changes the current runtime contract. |
| Candidate real player actor career | `c2cFixture()` has authored actor68 at0, actual renewal52, announcement104/E156. `frozenTies()` obtains two real acting first takes, cancellation receipts and a retained actor/director edge before retirement156. Save37 candidate points immediately before and after actual retirement. | Existing helper default aptitude is not a proven transition-positive witness. Before choosing a positive test, measure P10 directing/writing capability and the selected937 inputs. Real takes are not released credits; add actual releases if the selected gate requires them. |
| Candidate public multi-discipline actor | The accepted `createTalent`/balanced-person authoring route supports public presets; `tests/d11-cycle3.test.ts` covers `multiHyphenateProspect`. Build actual contracts, acting work and collaborations through public actions, preserving all source receipts. | No threshold, target discipline or guaranteed success asserted here. A creator preset is input authorship, not license to overwrite workHistory, skills or first takes to manufacture the positive branch. |
| Candidate cohort-born actor plus old cohort history | Start from immutable `genuine-v35-c2b-rival-incumbent-cohorts`, lift using its strict V35 reader and current writer, then save a genuine V37 continuation. Existing axis identifies `person-cohort-208-actor-1` under rival `studio-25969b11-r01`, A2566/E2704. | Target aptitude/career context is unproved. This person's entry receipt and pre-/post-transition annual requests distinguish historical role reconstruction from current-role counting. Preserve raw V35 separately. |
| Candidate starting-rival actor | The same long campaign retains authored-start film credits and natural retirement history; genesis rival actor identity must be selected from its immutable source and public continuation. | Must independently prove an eligible actor still has time below the target hard boundary and meaningful recorded context. Some recorded alumni are already too old; do not roll their age/clock backward. A no-transition history-preservation control is still useful. |
| Candidate final-extension branches | `extensionWorld('gap')`/`('exact')`/`('rival')` provide genuine announced worlds with D<E or D=E; existing proposals tests drive accepted, expired and declined outcomes. Save under37 before/after actual extension settlement. | Select real accepted outcome and exact old E/new E/contract identity; do not set `extensionUsed` by hand. Shows the old extension remains attached to acting when the profession changes. |
| Candidate finishing-obligation controls | `finishingWriter()` has real writer hard75 at260, E312, commission311 and due>312; `announcedGapWriter()` has natural expiry D260<E312; `pooledFinishingWriter()` covers real pooled work. Existing source validates their current Save37 continuations. A separate player actor held at take/release can supply a transition-relevant finishing seat. | The existing writer is a non-catalogue control, not Actor→Writer history. A natural rival expired-draft witness remains unproved in936; do not claim source threading as execution evidence. |
| Candidate old migrated/null-Hollywood worlds | Existing V32/V33/V34 corpora and strict converters supply anchored legacy people, no invented retirement at migration, and a null-Hollywood world. Capture a genuine Save37 lift before C.3. | Keep original frozen envelopes and immutable source bytes. New C.3 state must not create historical choices/final-industry retirement during load. |

For each new T0 artifact record source, producer, original input and actual command
route, seed, week, focus ids, save/runtime versions, original compressed/raw
digests, and achieved premises. Inputs may reuse the established disclosed funding
bootstrap, but that does not fabricate credits or receipts. Capture an actor near
retirement **before** implementing C.3: capturing only after transition code lands
would lose a genuine outgoing Save37 discriminator. A synthetic malformed-copy
test may mutate a validated detached state; it must be labeled and must never
stand in for historical proof or overwrite fixture files.

## Requirement-derived future acceptance matrix

Names are planning identifiers, not runnable tests. Exact wire shapes, receipt
fields, counts, thresholds and dates wait for937; no expected hash is predicted.

| ID | Observable acceptance / negative control | Independent seam and premise |
| --- | --- | --- |
| C3-A | Actor→Director chosen after real acting retirement; one unchanged person id/index and one role change; current directing availability succeeds. | Real player take/collaboration career; assert P10 capability/public potential independently before advancing. Prove a real directing commission/seat path, not merely a changed label. |
| C3-B | Actor→Writer chosen under the same authority, with actual subsequent signing and a real screenplay task. | Separate target-specific premise. Role truth changes for profile/rival staffing even though cross-discipline writing existed already. The transition itself supplies no credit. |
| C3-C | Capability alone, age alone, no recorded depth, insufficient target aptitude, or irrelevant collaboration does not masquerade as the selected full eligibility condition. | Individually valid control worlds; changing one input must not accidentally invalidate their whole save. Distinguish deferred eligibility from permanent refusal per937. |
| C3-D | The autonomous rule has a real decline path; eligible options and selected/declined reasons follow the fixed rule, no hidden issuer or array/id-order preference. | Freeze target tie policy first. Paired deterministic states reach choose/decline through real due processing; no forced receipt or direct write of outcome. |
| C3-E | Final industry retirement preserves every held profession's alumni facts, disallows all work/signing, and stops future evaluation/duplicate receipts. | Actual exhaustion/decline/boundary branches under937. Test the week before, at and after finality and through another due week. |
| C3-F | No transition while announced or finishing; first transition evaluation occurs only after the final binding seat/task clears. | Hold actor production across E, release/cancel naturally. Include the existing writer continuation as a non-catalogue regression; compare contract expiry and real completion order. |
| C3-G | An old profession remains retired after new-profession activation: direct acting greenlight fails while lawful directing/writing succeeds. | Exercise `applyActions`/production admission and public selection paths. Do not rely on primary-role filtering alone. Preserve existing screenplay credit reuse and M16 collisions. |
| C3-H | At later target-profession retirement the old acting record survives, the new record is unambiguous, and later contracts are checked against their own episode. | Continuous two-profession history with before/after save points. Mutation: duplicate same-profession row, unordered/overlapping episode, missing predecessor, forged current role or unsupported transition. |
| C3-I | Exact new-career extension policy is upheld without a repeat extension in one episode or receipt/reason leakage across episodes. | Old accepted/declined/expired acting extension retained. Positive later extension only if937 explicitly permits it; don't accidentally choose a lifetime/per-profession policy in a helper. |
| C3-J | Cohort-born transition leaves original entrant block and all past cohort receipts unchanged and valid; current active counts use the new profession exactly once. | Genuine cohort entrant plus at least one later request. Negative: forged original entrant role, swapped ids, wrong historical requested distribution/clip or transition date crossing a cohort boundary. |
| C3-K | Authored-start actor may later change profession without rewriting starting credits; canonical historical checks still reject corruption. | Real starting-rival identity. Named negatives: wrong authored credit role/name/id, broken entry interval, forged profession-at-entry and a role rewrite with no lawful transition history. |
| C3-L | Rival and player subjects follow the same capability, age, obligation, choice and industry-finality rules; new free agency grants no incumbent exclusivity. | Natural rival retirement/transition and ordinary rival staffing/`enterRival` hire when lawfully reached. Report a missing witness rather than promoting a synthetic business/receipt overlay to proof. |
| C3-M | Transition writes no salary, severance, bonus, employment or debt by itself; ordinary subsequent signing has its existing exact price, bonus and exclusive employer. | Isolate the transition step's write set from unrelated weekly charges. Assert player/P11 and rival/P12 ledgers, old actual expiry receipts, free-agent id uniqueness and a genuine later hire. |
| C3-N | `talent` length/order/id, provenance anchor/due bucket, skills, ceilings, genre experience, Star Power, work history and prior credits retain their meaning. | Compare the transition's own before/after state, allowing only its specified write set. Across full ticks account for actual age/development/work effects instead of demanding all unrelated state remain frozen. |
| C3-O | Relationships and promises are the same career history: no deleted edges, fabricated mentorship, rewritten terminal outcomes, duplicate promise outcome or new trust penalty. | Actual ties and terminal promise facts. New work may add legitimate relationship events; new-career disclosure follows937's explicit amendment of875. |
| C3-P | Old actor E does not poison new-profession promise feasibility/digests, and a later profession's actual retirement still enforces823. | First prove a reachable bound promise and selected profession/seat predicate. Preserve SATISFIED precedence, actual committed seats and original half-open window. Never create an impossible open promise after its due week as a “transition” premise. |
| C3-Q | Repeated read/evaluation and duplicate advance-command replay are idempotent; continuous and save/reload continuations agree at every chosen boundary. | Before retirement, after transition, before later evaluation and before finality. Compare canonical serialized state, exact receipt multiplicity, RNG and saved/current slot independence. JSON has one zero; do not use raw -0 equality as persistence law. |
| C3-R | Genuine Save37 migrates with an empty new event history/recording boundary as designed; no prior transition/decline/final-industry event is invented. | Existing37 Scientist plus new parent-minted player/rival/finishing/cohort worlds. Raw inputs stay unchanged. Assert old records remain profession-retirement facts rather than being reclassified as past industry retirement. |
| C3-S | Frozen public readers keep historical law; genuine V1–V37 imports retain their own strictness. Downgrade either loses nothing under an explicit criterion or refuses with a typed explanation. | Freeze a new current reader/policy path. A V37 shape-only cast must not validate new profession history by smuggling live authority into the old public reader; never strip transitions or rewrite historical role to force a downgrade. |
| C3-T | Exact-key, enum/version, chronological, identity, evidence and current-role validation rejects malformed new state. | Start from an actual accepted transition; mutate one fact each: unknown id, wrong target, before-boundary/future date, duplicate event, invalid rule version, mismatched evidence or missing linked predecessor. Confirm accepted control before each negative family. |
| C3-U | Old runtime recovers both actual Save37 slots, discards incompatible replay authority where required, and current runtime reopens without reapplying a transition. | New outgoing52 checkpoint plus immutable51 control. Old command identity, corrupted digest, foreign session and duplicate new command remain distinct cases. |
| C3-V | Identical PersonIds, seed/world id and counters in two campaigns do not share choices, pending due work, validator authority or caches. | Two detached imports with one lawful branch difference. Actual campaign-library Save As and restart need their public verb/store path; copying recovered snapshots alone does not prove that verb. |
| C3-W | Subsequent writer retirement with historical actor record preserves a genuine pre-E draft through current save, tick, Calendar, construction and unrelated actions. | Real Actor→Writer career followed to its second retirement. Reuse880-B's existing malformed authority controls; no permit inferred merely because any old record is retired. |
| C3-X | Profile/roster/Market/Calendar/Finance/Industry routes keep one identity, truthful current profession and accessible historical alumni/credits/employment. | Read pure snapshots before/after transition and finality; old contract ends and public retirement dates remain facts. Financial windows/overflow limits and rival disclosure stay bounded. Wire expectations derive from937, not a current output dump. |

## Persistence and test ownership checklist for the expansion

- A governed save-law amendment is required; `GameStateV37 = GameStateV36` and
  current exact lifecycle keys cannot represent the necessary chronology alone.
  Keep public historical envelopes/validators frozen. Select new save shape and
  current-only validation context explicitly; update generic import/export/load,
  dispatchers and versioned builders without leaking new roots to old readers.
- Preserve the existing explicit root-strip/historical-builder seams noted in773:
  `src/core/save.ts`, `src/harness/roster-wall/historical-control.ts`,
  `tests/contracts/_v14Contract.ts`, the R07 save tests and
  `tests/facility-move-demolish.test.ts`. Inventory by source before maintenance;
  do not bulk-replace every literal37 or projection52.
- Relevant adjacent suites include `p14c2a-save-and-settlement`,
  `p14c2b-save-v36`, `p14c4-save-v35`, `p14c1-materialized-aging`,
  `p14c2c-retirement-promises`, `p14c2s-scientist-retirement`,
  `p14c2rm-writer-continuation`, `d11-cycle2/3`, `p14b5-relationships`,
  `bridge-p14b6-relationship-read-models`, `bridge-p14c2rm-runtime`,
  `bridge-p12-campaign-library`, and `bridge-p13b-s3-save-as`.
  Existing test names/premises are not C.3 authority; re-attribute conflicts to937
  before maintaining an old expectation. Preserve frozen tests and artifacts.
- Separate new core/persistence tests from parent production writes. First RED
  must fail on absent specified behavior, not unavailable imports, fabricated
  ledgers or an invalid candidate. Use public boundary assertions with typed
  future-field access until exports are fixed. Parent retains the sole execution
  lane and source freeze while recording each gate.
- Save/projection/intent/promise version choices are independent. Do not invent
  a new protocol or hash. Mint outgoing bytes first; register the actual outgoing
  schema only if projection changes; derive generated declarations independently
  after source exists. A receipt-version bump is not evidence of a correct rule.

## Handback

Source inspection only; no Vitest, typecheck, generator, gameplay probe, new
fixture, raw corpus rewrite, commit or push. No positive C.3 choice, fresh T0
candidate, finality policy, timing budget or performance claim has been measured.
The next useful step is937's concrete rule/shape/timing contract, then parent-owned
T0 production under the unchanged current writer and independently authored RED.
