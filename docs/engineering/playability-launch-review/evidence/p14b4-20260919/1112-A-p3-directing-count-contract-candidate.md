# 1112-A — P3 directing-count contract candidate

Docs-only preparation while corrected C runs. No feature, producer, fixture or
test is released by this candidate. C.3 qualification and publication still come
first. Records 1102 and 1104 remain the scope/source reconciliation; this note
supplies concrete proposed choices rather than repeating that audit.

Authority is the P14 preparation companion §§4.1–4.4, Example D and R12/R14,
Owner rulings §3.4.1 items 5–7 and the later logic-first delegation. Has-discipline
P3 eligibility, objective first-take evidence, conservative offerability and
player/rival symmetry are already selected. The implementation hypotheses below
can be resolved through the existing engineering review; they require no routine
Owner approval. P4/P5, writing promises and the reserved evaluator-5 campaign
remain outside this slice.

## Fresh material and historical interpretation

Propose the exact fresh core predicate:

```text
family: 'DIRECTING_COUNT'
predicate: { kind: 'directorCount', count: positiveInteger }
```

`kind` and `count` are the only predicate keys. `directorCount` is legal only
with P3; a selected cast class belongs only to P2. Fresh P3 without the explicit
director tag is refused, including direct core calls. Root version or receipt
version never selects a predicate's meaning.

A qualifying fact is one existing `FirstTakeReceipt` with the issuer's studio,
the beneficiary as `directorId`, a distinct production ID and a week in
`[windowStartWeek, dueWeekExclusive)`. Cast membership, screenplay credit,
greenlight, shooting entry, queued intent and release do not satisfy P3. Use the
existing real first-take owner for both player and rivals. Keep progress bounded,
evidence in receipt order and terminal outcomes idempotent. A later cancellation
does not undo a completed qualifying take; its separate conduct consequences
remain.

Every older count-only predicate, including an enumerated P3, keeps its existing
generic-cast interpretation. Existing tagged P2 retains its selected cast class.
Neither migration nor display may silently reinterpret old P3 as directing.
Historical count-only P3 was reader-supported but not freshly offerable: a
detached old-reader discriminator must be labelled as such, never presented as a
genuine previously accepted P3 offer.

P3 uses the actual directing skill-profile/assignment law, with no primary-role,
capability-score, fame or proof threshold added to eligibility. A capable Actor
is a required positive, not an exception. Both the current profession's global
retirement boundary and the requested Director episode apply under C.3's existing
rule. Actual committed Director work retains its completion clock. No new acting
opportunity is restored after completed acting retirement.

## Scoped receipt revision and conservative reservations

Keep `PROMISE_RULES_VERSION = 4` for the existing scalar domain. Reserve numeric
revision 5 and its designated test for the still-deferred joint certificate.
Propose a separately named `DIRECTING_PROMISE_RULES_VERSION = 6`: this means
director-domain support, **not evaluator 5 under another number**.

The exact proposed selector for every fresh or explicit re-evaluation call is:

1. Set `from = max(draft.windowStartWeek, evaluationWeek)`. A relevant reservation
   is open, bound or currently attached to a live proposal, not the draft's own
   promise ID, and overlaps `[from, draft.dueWeekExclusive)`. Exclude abandoned
   unbound and terminal roots. These are the existing membership conditions.
2. The directing scope is active if the draft has `kind: 'directorCount'`, or a
   relevant explicitly tagged P3 shares **either** its beneficiary **or** issuer.
   A legacy count-only P3 does not trigger this scope.
3. Use receipt revision 6 exactly in that scope; otherwise retain revision 4 and
   the exact existing P1/P2 input tuple, arithmetic, classifications and text.
   This also keeps the evaluator-5 designated case on its actual revision-4
   classification failure, rather than moving it to a version assertion.

For revision 6, reserve the union of relevant commitments sharing the beneficiary
across issuers **or** sharing the issuer across beneficiaries. Deduplicate by
promise ID and charge each positive `count - progress` as a separate sequential
opportunity. Do not assume two obligations can share a picture, even when actual
fulfillment could legally do so for distinct people. This is an explicitly
conservative delegated hypothesis: it may reject feasible combinations, but it
does not claim a joint or optimal schedule. Reuse the existing spare-event buffer,
slack, contract window and existing-pipeline rules; no numeric retuning is proposed.

Only an actual qualifying pre-first-take Director seat contributes a committed
P3 path. An already-recorded take or a held production past its take cannot be
counted again. Known occupancy, fixed-seat, screenplay-work, facility and
retirement conflicts remain constraints, never optimistic substitutes for missing
proof. An uncertified path stays nonofferable; do not add a global scheduling
kernel to turn it into an offer. The new conservative subtraction must apply to
P1/P2 when their selected revision-6 scope contains P3 too, so changing the queried
family cannot evade the reservation.

Digest revision-6 inputs include the explicit requested domain, actual directing
profile presence, relevant owner facts, the full selected reservation tuples
(including person, issuer and predicate domain) and both distinct retirement
facts. Preserve array order and the qualified key-order-invariant object
serialization. No RNG, money multiplier or whole-world/private-history digest
is introduced. P1/P2 calls outside the selector stay byte-exact revision 4.

A newly authored root records the revision actually used at attachment; a fresh
director-tagged root and its receipt require revision 6. Actual settlement may
replace a draft's feasibility receipt through the existing freeze step, using
the selector against the then-current state; it does not restamp the root's
original version. Explicit reclassification returns a new result without
rewriting stored history. Load/migration never recalculates or rewrites any old
root, receipt, material digest, progress, evidence, outcome or version.

## Delegated preference, rival policy and waiver choices

These are declared implementation hypotheses for review, not new Owner selections:

| Area | Concrete candidate rule |
| --- | --- |
| Public preference | A current primary Director exposes `directingOpportunity`; everyone else retains the existing proven/unproven cast preference unchanged. The label changes preference, never assignment eligibility. It does not invent an Actor's hidden desire to direct from their skill values. |
| D3 matching | A Director's directing preference matches only the explicit fresh director predicate. Non-Director cast matching remains the existing P1/P2 rule. Historical classless P3 is not evidence of a directing preference match. This intentionally changes the opportunity descriptor for future Director choices; it does not promise identical old Director-choice outcomes. No-promise choices and unaffected cast reads remain controls. |
| Rival candidate order | At the existing one-promise proposal site, count 1/full proposed term: current Directors try P3 first, then the unchanged existing cast candidate list; other people try that unchanged list first, then P3. Every candidate reads the same unchanged state and common feasibility service. Attach only the first reasonably achievable candidate; no RNG, count escalation, partial staged mutation or promise on retirement-extension proposals. |
| Rival fulfillment | Before ordinary Director fallback, prefer actual eligible employees with bound, open, unmet explicit P3 whose window contains the predicted take. Use existing employment order as the deterministic tie-break. Require the directing profile, idle status and actual current-plus-Director assignment admission; exclude people conflicting with the same film's writer/cast/craft uniqueness rules. Ignore unaccepted offers and terminal promises. Keep ordinary unpromised staffing and the qualified same-week production/draft busy-set update intact. |
| Same-domain waiver | A fresh P3 may replace a fresh P3 only, under the existing same-contract, forward-window, remaining-count, feasible-receipt and trust rules. Reject an identical substitute. Preserve delivered progress/evidence on the original and mint exactly one bound successor. |
| Cross-domain waiver | Explicit Director and cast domains cannot substitute for one another in either direction: no inspected rule orders their strength. Determine the domain from predicate shape, so old count-only P3 remains on the existing cast-substitution path. Fresh classless P3 remains refused. Existing P1/P2 subset-strength law stays unchanged. |

Actual outcomes use the same domain authority in first-take qualification,
cancellation's target-specific impossibility proof and retirement dispatch.
SATISFIED precedes later due/retirement consideration as today; immediate
studio-caused failure remains BROKEN. A studio's dormancy/closure is not an
external excuse. Do not invent an open post-transition promise: old bound windows
normally end by contract expiry and retirement. Natural reachability must be
shown; any isolated dispatch discriminator is a separately labelled test.

No genuine product decision blocks this candidate's bounded path. A requested
cross-discipline barter rule, a persistent personal directing ambition, a new
aptitude eligibility threshold or a writing promise would be materially different
product scope and should be isolated then. None is implicitly created here.

## Persistence and wire plan

The current source is Save 38 / projection 53 / protocol 4. Propose **Save 39,
projection 54, protocol 4**, with no other lifecycle/root authority introduced.
Define a new live promise union that retains `ProfessionalPromiseV32` and adds
the P3 director-tagged branch, including the existing waiver link. Do not widen
the frozen V29/V30/V32 types or public readers to accept the new predicate.

Save 38 →39 changes the envelope version and admits the new live union; all old
state roots and ordered contents remain exact. The new reader needs explicit,
invocation-local current validation plumbing through shared promise checks;
public V1–38 readers remain strict by default. New predicate/family/version,
first-take evidence, contract, progress, chronology and successor-link checks are
required. A malformed V39 must not escape through old builders or null Hollywood.

39 →38 is allowed only after whole V39 admission and when no explicit director
predicate exists anywhere in the retained promise authority, including unbound,
terminal and waived history. Refuse rather than strip, recast or retag such facts.
When no new authority exists, the genuine reverse preserves old state bytes and
delegates existing C.3/older downgrade guards unchanged. Old numeric receipts
remain historical data; version alone cannot turn a cast predicate into Director.

On projection 54, give P3 its own disjoint wire-union member with the existing
count/window payload and `family: 'DIRECTING_COUNT'`; remove that family from the
generic count-only member. No client-supplied core predicate kind or issuer is
needed. The single wire-to-core converter maps this fresh P3 member explicitly
to `directorCount`, including the waiver route. Public JSON remains closed and
forged issuer, extra keys, seat class, stale intent and invalid values refuse.

Add `qualifyingRole: 'cast' | 'director'` to own-promise, bound-history and waiver
substitute disclosures. It derives from the stored predicate, not the family
enum; `seatClass` remains null for Director and old generic cast. This lets old
P3 display its recorded filming terms truthfully while new P3 says “begin
directing.” Add the one public preference enum value above. Keep competing
promise terms UNKNOWN, private feasibility inputs/digests absent and all other
privacy rules. Update actual engine/Bridge/UI consumers and generated declarations;
generation does not qualify native behavior. No schema or output hash is guessed.

## Outgoing preservation before any writer

After C.3 closes, preserve genuine outgoing Save 38 and projection-53 runtime
bytes at the actual final pre-P3 source. Reuse immutable inputs with their stated
origin, then serialize actual admitted current states; never relabel an old
Save 37 capture as an original Save 38 capture. Include existing P1/P2 history,
waiver links and C.3 authority where reachable. Do not mint a fictitious old
accepted P3. Preserve synthetic reader discriminators separately.

Capture an actual runtime with distinct saved/current states and a real journal
through normal BridgeSession/coordinator operations. A migrated genuine 207
input, actual SAVE at 207 and advance to 208 is a bounded candidate; require the
whole outgoing-38 and codec premises before writing any output. Pin raw/gzip,
manifest, producer, source, slots and actual command/replay facts. Existing
captures remain immutable; no old fixture is overwritten or regenerated.

Register the measured outgoing projection-53 schema as one additional prior,
preserving all older registry members. On prior 53, saved/current slots migrate
independently and the old journal resets under existing compatibility law;
invalid individual slots must refuse. Current 54 must preserve duplicate replay,
restart, real Save As and clean-load campaign isolation. No old-runtime journal
is carried across changed P3 command semantics. Keep genuine prior-byte controls
separate from the current roundtrip.

## Finite independent acceptance matrix

Exactly 18 requirement rows remain. These are future assertions, not test results
or source authorization. Every negative uses an admitted positive first and
asserts its actual cause. All setup/branch/replay ticks count, with failure caches
and no seed search or mid-route funding rescue.

| ID | Required evidence and positive premise |
| --- | --- |
| D01 | Genuine Actor and Director each receive achievable tagged P3 through a real ordinary proposal; profile/role/contract facts precede quote assertions. A detached missing-profile negative is labelled. |
| D02 | Actual held pre-take Director seat, cast-only control, already-recorded take and real 5→4 advance prove the event boundary. |
| D03 | Separate lawful count/window/buffer/slack/pipeline/occupancy/reservation controls reach their own exact classification/refusal, including fragile and impossible. |
| D04 | Pure quote under key permutations/reload is exact; meaningful Director/retirement/reservation changes alter identity. P1/P2 outside the revision-6 selector remain byte-exact at revision 4. |
| D05 | Real revise/attach/settlement proves material identity, accepted winner binding and fresh receipt; losing, withdrawn and newly infeasible proposals bind nothing. |
| D06 | Actual player Director take satisfies once; cast-only, wrong issuer, window edges and duplicate production cannot substitute. Re-evaluation/reload is idempotent. |
| D07 | Fixed public-created ordinary renewal lets a rival actually author, win/pay and seat a tagged P3 beneficiary through normal ticks. Require each premise; no injected promise/roster or alternate seed substitutes if it fails. |
| D08 | Genuine before/after-take cancellation, due failure and early termination distinguish kept work, target-specific failure and one correctly attributed outcome. |
| D09 | Real P1/P2/P3 overlapping commitments exercise conservative union membership, one-person exclusivity, same-studio competing beneficiaries, terminal exclusions and clean refusal without claiming a joint certificate. |
| D10 | Lawful Actor directing and transitioned Director positives coexist with completed-acting refusal and current-primary retirement cap; real committed work uses its own clock. |
| D11 | Natural retirement/contract chronology reaches an actual outcome boundary; preserve the existing C.2c controls. Report an unavailable natural VOIDED premise honestly rather than forging an open obligation. |
| D12 | Partly served real P3 accepts a forward same-domain substitute; earned evidence/same contract/one successor persist. Precise terminal, unbound, distrust, identical, weaker-count, retroactive and cross-domain refusals remain pure. |
| D13 | Whole Save 39 positive then exact predicate/family/version/evidence/date/link negatives; frozen public V38 refuses tagged P3. |
| D14 | Genuine outgoing38 lifts losslessly; old P1/P2 and labelled count-only P3 preserve interpretation. Guarded39→38 roundtrip succeeds without new authority and refuses every retained director-tagged authority state. |
| D15 | Actual public JSON quote/prepare/commit, issuer/privacy/stale-material refusals, replay and reload; P3 UI availability alone is insufficient. |
| D16 | Own/history/waiver displays disclose the correct qualifying role and window; legacy P3 stays filming semantics; competing terms/private inputs remain hidden. |
| D17 | Genuine outgoing53 independent-slot migration/reset/refusal plus current54 duplicate/restart/Save As/clean-load isolation. Count every actual advance. |
| D18 | Exact declared preference, rival candidate order/failure purity and fulfillment tie-break, with unchanged non-Director cast controls. Attribute changed events before any unrelated pin maintenance. |

Proposed finite authoring ceiling for the first complete matrix is 828 test tick
calls: 208 for the cached player/settlement route, 260 for the one fixed rival
route, three 64-call cancellation/waiver branches, 156 for the lifecycle route
and 12 for Bridge/runtime branches. Shared routes serve multiple rows; zero-tick
reader/quote negatives do not rebuild them. The outgoing preservation producer
has a separate proposed ceiling of two calls, so the combined candidate ceiling
is 830. These are preparation limits, not an execution release. Before source is
authorized, the independent author must freeze exact fixtures, actions, per-file
counters and any reused immutable starting states within those ceilings; a failed
positive is attributed rather than silently extending a route or searching seeds.

Use the core-only promise/outcome/save files and Bridge-prefixed path proposed
in 1104; UI cases stay in the UI project. Keep independent semantic RED before
the matching single writer, followed by review, bounded GREEN/neighbors and the
required type/generated/fixture/full gates. Current-only pin maintenance remains
separate from frozen historical controls. No completed C.3 qualification or its
declared limitations are reopened by this later P3 feature.
