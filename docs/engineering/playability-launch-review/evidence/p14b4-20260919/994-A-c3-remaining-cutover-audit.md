# 994-A — Remaining Save38 test-boundary survey

Independent reviewer, 2026-09-26. This is a **static inventory, not a test result or
permission to edit the listed tests**. The parent requested this doc-only survey
while preparing the Stage A partial checkpoint. It does not block that checkpoint
or release Stage B/C/D/E work. No tests, gameplay, producers or compiler processes
were executed by the reviewer; no production/test file was changed.

Inspected source was HEAD `c000479d6e888d3a02f5c2ff534f5dfcbb32af3f` plus the
current Stage A candidate. During the survey, parent record992 closed successfully
with fixed source patch
`61ba8544dc0053a2d18e4d8c6e3afa44a6e526ca5a64bcf9b316afa07138efac`.
Line references below belong to that candidate. Search coverage: test/harness
references to validateSaveV37, literal current37 pins, unsupported38 sentinels,
explicit V35→36/V36→37 lifts and initialCareerLifecycle calls; followed relevant
builders and frozen-reader controls. This is not an exhaustive audit of all
synthetic inputs, projection53 metadata, historical builder calls or future
behavioral differences.

## Disposition and boundary rules

**KEEP the partial-checkpoint scope. REFINE the remaining maintenance inventory
before Stage E qualification.** The findings are concrete source mismatches, but
their future first failing leaves and multiplicities have not been measured.
Several can be masked by a shared helper failing first. Do not report these as
new observed regressions or replace the inherited failure ledger with this list.

Current makeSave writes38 (`src/core/save.ts:6522`); its current strict reader is
validateSaveV38 (`:10203`). A positive or domain-specific negative made from that
writer must reach that reader. Public37 and older readers stay frozen. Unknown38
is no longer an unsupported-version probe (`save.ts:5402`).

Save38 requires one ordered profession anchor for every person
(`src/core/professionHistory.ts:136–154`). initialCareerLifecycle has a default
empty population (`src/core/careerLifecycle.ts:44–49`); calling it with only W
produces no anchors. A current builder with real people must supply its actual
population. Existing-state migration must use the governed lift; a typed cast
does not open current authority. Any historical regression must retain its
historical data, strict API, positive control and intended refusal cause.

## 1. Shared or stamped-current helpers requiring more than a version edit

| Location | Static issue and bounded preservation requirement |
| --- | --- |
| `tests/_historicalCurrent.ts:10–27` | For pre19 input, migrateToCurrentControl stamps LIVE_SAVE_VERSION over liftHistoricalState. That builder uses initialCareerLifecycle(W) without its derived people. It deliberately retains a pre-P12 player-law/null-Hollywood control, so do not replace it blindly with native industry engagement. Supply the actual current anchor scaffold for the already selected people while retaining its historical-player scenario and old immutable facts. Inputs19+ already take actual migrateToLive. |
| `tests/p14c1-materialized-aging.test.ts:142–157,627–640,730–733` | liftForTick stops at V36; migrateForTick then hands that state to current tick, while later envelopes are stamped LIVE_SAVE_VERSION and sent to public37. Append actual current migration on the tick branch, then use current validation. Keep migrateV33 and genuine32 admission intact for frozen aging/conversion tests. Missing transitionDue/anchors can precede the apparent validator mismatch. |
| `tests/bridge-p14b8-waiver-surface.test.ts:166–198` | owesTwoState, withEdgesState and keptAndBrokenState stop at V36 and cast to GameState. Strict31/32 fixture admission and compressed/raw pins are correct and must stay; append actual current lift before live session/action/read-model use. |
| `tests/save.test.ts:235` | The hand-built current wellFormedState has a person but calls initialCareerLifecycle(8) without that person. Many unrelated save assertions share this premise. Repair the explicit current scaffold, not their seed/history/negative expectations. |
| `tests/c2a-m2-sets-save.test.ts:266,336` | Two explicit current null-Hollywood builders synthesize a root without their actual migrated population. Preserve their legacy player-law scenario and original set/history assertions. |
| `tests/cash-ledger-checkpoint-v11.test.ts:401` | A malformed-old-cash control constructs a current-shaped carrier with an empty-population root before a frozen builder. The new full-current proof can reject missing anchors before the intended cash-checkpoint refusal. Preserve a lawful current scaffold around the one deliberate old defect; verify the exact cash cause and its positive control. |

The shared `_historicalCurrent` helper is imported by d12-economy,
p04a2-writer-credit-law, placement-lifecycle, ruling-a-development-in-play,
v14-migration.contract, d17a-adv-reconciliation, production-operations-save-v8,
c1-m6-identity-not-coordinates, d17b-publicity, d17b-save-v7, p11-finance-report,
cash-ledger-checkpoint-v11, d11-cycle2, property-state-v13, c1-m6-no-property-cap,
c1-m6-second-zone-by-data, construction-save-v11, facility-move-demolish,
c2a-m2-sets-save, facility-effects, placement-save-v12, film-chronicle,
studio-calendar, p09a-w0-founding-regime, replay, p08a-w0-studio-history and
p05a-w1-scenery-truth. This is a dependency list, not a prediction that every leaf
in those files fails.

## 2. Current payloads still sent to frozen37

The following call sites use current makeSave output, its clones/imported export,
an actual current session save, or an explicitly current envelope. Change the
current validation boundary only after attribution/release. Retain every existing
positive, exact domain refusal, immutability assertion and fixture route. Some
negatives may throw inside makeSave before reaching the named reader; their
apparent pass must not be credited as proof of the frozen37 call.

| Test path (under tests/) | Current-boundary sites |
| --- | --- |
| `p14b2-setup-wrap-regressions.test.ts` | 27, through its saved current roundtrip helper |
| `p13a-causal-core.test.ts` | 49,91 |
| `construction-core.test.ts` | 497,505,566,664 |
| `construction-save-v11.test.ts` | 191,514; keep its genuine V11 readers/builders distinct |
| `placement-save-v12.test.ts` | 411,417,429,435,442,449; keep V12 probes intact |
| `legacy-parcel-ground.test.ts` | 365,376,404 |
| `cash-ledger-checkpoint-v11.test.ts` | 233,243,295,494,500,506,512 |
| `property-state-v13.test.ts` | 702,799,868,880 |
| `facility-move-demolish.test.ts` | 781 |
| `c2a-m2-sets-save.test.ts` | 174,184,193,202,304 |
| `p06a-w1-release-authority.test.ts` | 453,459 |
| `p08a-w0-studio-history.test.ts` | 441,450,459,465,477 |
| `p09a-w0-founding-regime.test.ts` | 145,147,149,151,214 |
| `p13a-technology-milestones.test.ts` | 74,79,82 |
| `p13b-s2-access-identity.test.ts` | 196; its forgedImport helper at258 uses dispatch and is not itself a hardcoded-reader defect |
| `p13b-s3-validation.test.ts` | 159 |
| `p14b1-promises.test.ts` | 503, namespace-qualified validator |
| `p14b3-rule-revision.test.ts` | 204,246 |
| `p14bf2-acting-discipline.test.ts` | 71,111,243,390 |
| `p14b4-cast-class-outcomes.test.ts` | 355; current helper also pins37 at79 |
| `p14b5-relationships.test.ts` | 997,1008,1014,1054,1106; local name v31 actually wraps current makeSave |
| `p14b5-t-failure-tuning.test.ts` | 388,413; historical driver deltas in a current envelope do not make it a V37 envelope |
| `p14c1-materialized-aging.test.ts` | 630,733, after correcting its tick lift described above |
| `contracts/cross-owner-refusal.contract.test.ts` | 72,100,118 |
| `contracts/phase-table-agreement.contract.test.ts` | 104,224,230,246,266 |
| `contracts/studio-events.contract.test.ts` | 129 dynamically resolves validateSaveV37 for current releaseCommitted; the other-kind V14 branch at138 is deliberately frozen |
| `contracts/v14-byte-parity.contract.test.ts` | 201 dynamically resolves validateSaveV37 for current output; preserve the unrelated frozen V14 proof |
| `bridge-p14b3-promise-command.test.ts` | 35,83,133,355,500 |
| `bridge-p14b6-relationship-read-models.test.ts` | admitted at223 |
| `bridge-p14b6-e714-false-empty-absence-lines.test.ts` | admitted at95 |
| `bridge-p14b6-d2-withheld-employment-claim.test.ts` | admitted at82 |

The already repaired `helpers/p14b2-fixtures.ts:122,244,259` is not remaining
maintenance. Record990 observed13 retention plus4 rival version failures; the
poaching call244 remained unreachable behind its inherited preferred-term
failure198. Parent991 records19PASS/3same inherited failures. Preserve those
three exact first causes and the original52 expectation; no downstream poaching
qualification follows from updating an unreachable validator.

## 3. Literal current-version pins and unsupported-version sentinels

These are **current outputs/constants**, not immutable artifact metadata. In
addition to the validator table, current37 pins occur at the following sites:

- `d11-employment.test.ts:551`; `d17-engagement-persistence.test.ts:462`;
  `d17a-adv-reconciliation.test.ts:337`; `p04a2-writer-credit-law.test.ts:773`.
- `p13b-s2-save-v22.test.ts:208`; `p13b-s3-save-v23.test.ts:118`;
  `p13b-s5-save-v24.test.ts:210`; `p13b-s6-save-v26.test.ts:254`;
  `p13b-s7-announcements.test.ts:87,135`; `p13b-s8-save-v27.test.ts:187`.
- `p14b1-save-v29.test.ts:110`; `p14b4-save-v30-compatibility.test.ts:219`;
  `p14b4-rival-seating-preference.test.ts:102`;
  `p14b4-cancel-causal-proof.test.ts:271`; `p14b7-promise-waiver.test.ts:651`;
  `p14b8-waiver-surface-oracle.test.ts:177`; `p14c1-materialized-aging.test.ts:1005`.
- `p14c2s-scientist-retirement.test.ts:255,260,269,309` (also see the more
  substantive frozen-control issue below).
- `c2a-m3-rename-and-pooling.test.ts:214,363`;
  `c2a-m3-screenplay-mint.test.ts:356`; `film-chronicle.test.ts:911,922,923`.
  The film-chronicle narrowing/early-return condition at923 also needs the actual
  current version; changing only the expectation must not skip later assertions.
- `bridge-p13b-s8-rivals.test.ts:233,404`;
  `bridge-owner-ux-projection20-migration.test.ts:120`;
  `bridge-p14a1-market.test.ts:408`;
  `bridge-p14a2-market.test.ts:232,739,772,784,794,809`;
  `bridge-p14a3-world.test.ts:245,575,600,622`;
  `bridge-p14b1-promises.test.ts:207,499,515`;
  `bridge-p14b2-checkpoint.test.ts:54,66`;
  `bridge-p14b4-runtime47-compatibility.test.ts:181`;
  `bridge-p14b5-relationships.test.ts:352`;
  `bridge-p14b6-relationship-read-models.test.ts:759`;
  `bridge-p14b8-waiver-surface.test.ts:820,821`;
  `bridge-p14c2s-scientist-runtime.test.ts:83,100`;
  `bridge-p14c2rm-runtime.test.ts:49`.
- `bridge-runtime-checkpoint.test.ts:232,233,269,270,331,332,721,749,777`;
  `bridge-process-restart.test.ts:797,799`.

Unsupported-version probes currently stamp38, now a supported version. Preserve
the unsupported-version behavior with the next deliberately unsupported literal
and the matching exact handled range, rather than accepting a malformed-known38
refusal. Inventory: `save.test.ts:285,442`;
`d17a-adv-migration.test.ts:274`; `d17b-save-v7.test.ts:163`;
`script-projects-save-v9.test.ts:415,418`; `construction-save-v11.test.ts:553`;
`property-state-v13.test.ts:943`; `contracts/v14-boundary-guards.contract.test.ts:324`;
`p13b-s2-save-v22.test.ts:214`; `p13b-s3-save-v23.test.ts:122`;
`p13b-s5-save-v24.test.ts:214`; `p13b-r07-save-v25.test.ts:267`;
`p13b-s6-save-v26.test.ts:224`; `p13b-s8-save-v27.test.ts:214`;
`p14a1-save-v28.test.ts:255`; `p14b1-save-v29.test.ts:205`.
The first save.test probe uses only toThrow; that can otherwise pass for the
wrong reason on a known38 payload. Preserve the genuine unknown-version cause.

## 4. Migration oracles, byte claims and old-reader causes

Current expected roots also call initialCareerLifecycle(W) without the population:
`bridge-p06-checkpoint-recovery.test.ts:98`,
`bridge-owner-ux-projection20-migration.test.ts:138`,
`bridge-p14b2-checkpoint.test.ts:70`,
`p14b4-save-v30-compatibility.test.ts:181`,
`p14bf2-acting-discipline.test.ts:344,352`, and
`p14b3-rule-revision.test.ts:149,157`. Some are pure expected-value oracles; others
feed the synthesized state back into current makeSave. Their old no-backfill
claim must now explicitly include prospective existing-person anchors at the
actual cutover week and the other six-field scaffold. Derive expected identity,
profession and date from the genuine input; do not read back the actual output
to erase an independent migration assertion. Preserve every pre38 fact/byte
comparison outside the authorized additive shape.

`p14c2s-scientist-retirement.test.ts:251–263` compares old36 state bytes directly
to current state after a no-Scientist downgrade. Current38 has a new scaffold,
so an exact old-state comparison must explicitly retain the old-shape invariant
and prove the permitted lossless38 projection, with both directions/no mutation.
The same suite at278–300 restamps a current payload to34/35/36 and removes only
pre38 extension/cohort fields. Its supposedly positive old whole-envelope control
still carries six forbidden current fields. Do not call its early exact-key
failure proof of the old Scientist refusal. Retain the strict historical
positive-without-Scientist and exact negative-with-Scientist control under an
honestly old admissible substrate. Do not silently strip semantic C.3 events or
entrant authority from a played current world to invent one. Current Scientist
downgrade negatives at272–273 can also meet an earlier C.3 guard: qualify the old
Scientist-specific boundary directly with historical evidence if that is the
claim, separately from the actual current downgrade refusal.

`p14b5-relationships.test.ts:1043–1119` already distinguishes historical
relationship law from later first downgrade guards. After changing its current
reader, re-check each **observed** first cause; do not assume an old exact33/36
message still wins after current history/entrant authority exists. This is a
static cause-order risk, not a finding that these particular inputs have already
acquired such authority.

The known Stage D runtime work remains necessary. For example,
`bridge-p14c2rm-runtime.test.ts:54–68,91` expects a freshly hydrated/exported
current state to equal archived37 slot bytes. Keep those archived bytes/hashes
unchanged; current38 must be compared to each slot's own governed migration, not
the raw37 envelope. Actual outgoing52/Save37 C.3 artifacts and its declared
digest-continuity limitation remain historical facts. Do not relabel archived
52 data as53 or turn the pending Stage D bridge955 boundary into a Stage A pass.

## 5. Genuine frozen controls to KEEP

These matching37 references are intentional and should not be swept to38:

- `helpers/p14c2rm-fixtures.ts:61`: immutable Scientist37 admission, followed by
  real migrateToLive; `:68–89`: the newly reproduced archived37 writer pair,
  including exact export/hash checks.
- `helpers/p14c3-fixtures.ts:90–94`: actual953 manifest/save37 authority and its
  strict reader; `p14c3-promise-digest-continuity.test.ts:35,73,209`: the same
  immutable source metadata and historical receipts. Actual current comparisons
  already use the separately guarded38→37 path where lawful.
- `bridge-p14c3-promise-digest-continuity.test.ts:34`: actual source52/save37
  manifest metadata. Its current runtime continuation is a separate pending
  Stage D obligation, not grounds to alter this source pin.
- `bridge-p14c2rm-runtime.test.ts:27,37–42`: genuine outgoing51/save37 manifest,
  strict old reader, explicit old Scientist row and old export/hash equality.
  Its current pins/slot equality elsewhere are separately listed above.
- `helpers/p14c4-fixtures.ts:79–104`: archived35 controls lifted only through the
  strict36/37 historical shape, then validated37 and governed back to35. These
  are deliberately not current simulation inputs.
- `p14c2a-save-and-settlement.test.ts:332–344`: disclosed historical37 construction
  validated37 before real current migration; G1–G4 remain genuinely frozen34.
- `p14c3-save-v38.test.ts:284–295,434`: genuine public37 admission, explicit
  current-authority/stripped-history refusal controls and lawful37 downgrade
  output. The changed version in its negative is deliberate, not a stale live pin.
- Unchanged raw31/32 readers in the B8 helpers, raw29 readers in acting/promise
  corpora, raw33 C.2 fixtures, and frozen V1–V36 validator/builder probes elsewhere
  remain at their own boundaries. A file title or historical comment alone is
  not authority to update them.

## 6. Bounded later execution and attribution

Follow963 Stage E and971's staged ownership. Before any maintenance, freeze the
exact path/case selection and record the unmodified observation. Keep source and
test ownership separate. Repair current scaffolding/lifts first where it is the
actual prerequisite, then current-reader/version metadata, with the original
behavioral assertions retained. Treat old-reader cause preservation as its own
review item whenever a current semantic guard can mask it. Do not edit old
artifacts, widen frozen public readers, relax regexes to blanket toThrow, skip
cases, raise timeouts, or redesign the three inherited poaching premises as part
of this cutover maintenance.

This inventory supplies candidate locations for that work. Only recorded runs
may establish final failing identities, repaired causes, unchanged inherited
causes or full-program qualification. No new product decision is identified here.
