# 942 — C.3 execution contract (draft for independent review)

2026-09-26. Controlling scope937, independent reviews938/939, measured inventory941
and attribution943. Production remains the qualified9afae887 tree, now published
with docs at1f44aa505c0d677430451ab5fcacaf5e0ce205d6. **DRAFT: no production release.**
The sole producer944 is preparing genuine outgoing37/52 evidence, not C.3 behavior.
No selected constant below was lowered in response to941's absent positive witness.

## 1. Bounded law

Only primary Actor→Director and Actor→Writer exist. Current-role retirement must
be completed, all bindings/obligations cleared, and no industry-finality fact may
exist. Announced/finishing people never evaluate a transition. No user profession
switch command, employer offer, fee or contract is created. PersonId/order remains.

Target suitability requires current P10 perceived capability (minimum60) and age
strictly below the target hard age75. Career reservation additionally requires
at least3 distinct recorded acting first takes, and either proven work in the target
discipline or at least2 distinct qualifying pictures with one same counterpart.
The context count is the maximum distinct-picture count for any one counterpart;
bands are0,1,>=2. Threshold2 means two total shared pictures, not two repeat drivers
after an initial meeting. Deduplicate canonical picture identities across source
representations. Two different one-off counterparts do not satisfy repetition;
counterpart ordering cannot affect target selection.
For directing, count first takes where subject is lead and counterpart is director.
For writing, count distinct released pictures with an acting credit for subject
and a writer credit for counterpart. Authored starting films remain separately
labeled actual credits; they are never invented first takes. No mentorship driver
or hidden development focus is inferred. Cancelled actual takes remain takes;
unreleased pictures never count as released writer collaboration.

Evaluate both fixed catalogue targets before selecting. Each target's public
comparison tuple is: proven (false/true), existing P10 roleTier rank, collaboration
band (none/one/repeated), existing expected-potential-tier rank. Compare tuples in
that order, descending; exactly tied eligible targets produce declinedAll. One
eligible target is accepted. No eligible target produces deferred while time remains.
This is the explicit non-monetary adaptation of deterministic reservation/choice;
it never invokes issuer salary/trust/roster rules with invented values. Comparison
uses bands, not raw OVR differences, history count differences within a band, IDs,
target array order, seed draws or studio priority. Proven competence outranks upside;
Limited upside is never a suitability refusal. Reuse P10 public summaries; update
their old display-only comments to name this explicit authorized consumer.

P10 roleTier order is the existing Highly unproven, Raw prospect,
Limited-or-developing, Strong, Major-studio, Elite, Generational order; capability
already excludes the first two. Potential order is Limited, Steady, Promising,
High Upside, Exceptional Upside, Generational Upside. C.3 introduces no new OVR
or public-potential calculation. Tuning constants3,2,52 and the waiting-age margin5
live in TUNING and are identified as delegated numerical hypotheses.

## 2. Time, finality and write set

Within the existing weekly transition: finish existing work/employment and other
existing phases→lifecycle intent/promises/market in their accepted order→profession
retirement completion→C.3 due/newly-retired evaluation→C.4 cohort request. Do not
run another staffing or proposal pass. Same-week post-settlement cohort queries
see a committed new profession; old cohort receipts retain their old dated meaning.

Newly completed actor retirement evaluates that week. No eligible target schedules
next evaluation at min(W+52, first actual week age75 is reached). Derive the
cutoff with nextBirthdayWeek(provenance,74), whose ageAt correction handles
fractional anchors; naive ceiling arithmetic is insufficient. A real decline-all
is terminal and never retried. Age75 or older at completion/evaluation is final
with ageBoundary cause. This cutoff never cancels/shortens notice, extensions or
unfinished obligations. A Director/Writer/Craft/Scientist retirement has no onward
catalogue and becomes industry-final only at actual completion. An accepted actor
transition removes pending evaluation; there is at most one transition per person.

Unchanged evidence never receives an urgency/probability bonus. Due work is explicit
and bounded; no weekly scan of all alumni or career events. Later existing screenplay
credit can legitimately develop writing on release: that is an input change, not
new labor or invented odds. Research/other future paths remain excluded.

The P10 commit updates Talent.role and refreshes its existing primary-role proxies
Talent.skill and Talent.salary using roleOVR/salaryCurve after changing role.
This proxy refresh is not a payment, skill gain or existing-contract repricing.
Underlying discipline
skills, ceilings, development rates, genre experience, workHistory, fame, name,
age/provenance, person count/order and all old facts remain unchanged by this commit.
Preservation assertions isolate this commit; an entire weekly tick can independently
change development, fame or money under existing phases.
Add the person to freeAgents once. No contract, employment receipt, money, ledger,
trust, relationship driver or film credit is written by changing profession.
The ordinary subsequent player/rival signing law remains the only employer writer.

An actor's retired profession remains closed permanently. Admission checks the
requested profession in addition to global current eligibility. Preserve existing
has-discipline assignments to any other unretired profession; do not require direct
core requestedRole==primaryRole. Permanent screenplay credit is not an assignment.
The new profession may announce, extend once, finish and retire by ordinary C.2 law.
The final-extension limit is once per profession episode, never again in one episode;
join each historical case to profession-at-case-open, not today's role/latest receipt.

## 3. Persistent authority and migration

One governed Save38 step; protocol4, lifecycle intent1 and promise4 remain. A separate
TRANSITION_RULES_VERSION=1 stamps new choices. Extend the current lifecycle root
while retaining every existing retirement and cohort field byte-for-byte:

| New field | Authority |
| --- | --- |
| transitionBoundaryWeek | Current week at migration/fresh opening, no earlier C.3 fact |
| professionAnchors | Exactly one per person: personId, profession, recordedWeek, kind existing/entrant; existing anchors say the profession observed at the new boundary, not a fabricated historic change |
| transitionEvaluations | Append-only ordinal/id, week, personId, source retirement key, rule1, immutable public input snapshot and digest, outcome deferred/chosen/declinedAll/ageBoundary, selected target or null, typed reason |
| professionChanges | P10 append-only ordinal/id, week, personId, from actor, to director/writer, linked chosen evaluation id |
| industryRetirements | One per person: week, last profession, linked completed retirement key, cause noCatalogue/declinedAll/ageBoundary, linked evaluation id when one exists |
| transitionDue | Sorted bounded future queue: personId, week; exactly the next required actor evaluation or prospective migration reconciliation |

Retirement key is `(personId, profession)`; a person holds at most acting plus its
one destination retirement. Each person has at most one profession change. Keys use
structured equality, not delimiter concatenation. Event ids are deterministic
in-state ordinals; iteration order cannot decide a target. Sort independent due
subjects for stable receipt order only. No campaign/session/storage UUID or cache
key enters core. All writes are copy-on-write with invocation-local indexes.

Profession anchors solve a missing-receipt role rewrite: current Talent.role must
equal anchor profession followed by the lawful change. Future mint sites append
their actual entrant profession at creation; frozen older converters do not invent
C.3 anchors internally. For pre-boundary historical queries, the observed original
role is valid under the previously accepted no-transition law; label the boundary
honestly. Existing anchors are dated exactly at the transition boundary; entrant
anchors are dated at actual creation and never grant earlier presence. Historical
cohorts first select the original talentCountBefore prefix, then resolve dated
profession/status; later entrants cannot fill earlier shortages. After a transition
atW, professionAtWeek returns the new role for W and
later. Validate anchored role against canonical authored/cohort entry facts where
those facts exist. Never rewrite those facts to agree with a current role.

Migration from genuine37 opens anchors at the actual boundary and empty event/change/
finality arrays. Existing already-retired people receive prospective reconciliation
at boundary+1; no choice, change or industry retirement is dated in the past or
committed merely by loading. Existing unfinished people wait for actual completion.
Future-created people receive actual entrant anchors. No new evaluation occurs in
null-Hollywood worlds, consistent with current lifecycle engagement.

Downgrade to37 is lossless only before any C.3 evaluation/change/finality fact or
new per-profession semantic state exists; strip only empty scaffolding/anchors and
prospective due entries then validate with the unchanged public37 reader. Otherwise
refuse before attempting historical validation. Never erase an event, role change,
retirement record, case or cohort receipt to manufacture a valid older save.

## 4. Strict validation and evidence semantics

Validate new exact shapes, known people/professions/enums, safe finite integer weeks,
boundary/order/ordinal rules, unique anchors, current-role consistency, catalogue,
actual completed retirement predecessor, age derivation, no live obligations at a
change, no multiple change/industry-finality, and exact due schedule. Commit-time
obligation checks use current bindings/busy work. Later-save validation uses retained
dated intervals and retirement/task evidence; later lawful new-role employment or
work must not invalidate an earlier change. Do not claim complete reconstruction
of past cancellation/tasks when no retained evidence supports it. A chosen
evaluation must satisfy version1's rule and match exactly one change in the same
week. A decline/finality cannot later gain due work or a change.

Each input snapshot records the public perceived target OVR/tier, actual target
work-history/proven flag, public potential tier, acting count/lead count and repeated
target-context counts, with bounded real supporting references. Recompute deterministic
choice and a canonical ordered-input digest; cross-check referenced first takes,
credits and dates against retained source facts. Historical displayed skill/potential
and historical workHistory snapshots are commit-time evidence unless a complete
immutable ledger reconstructs them; do not claim current mutable values reconstruct
their past values. Check the proven flag against the stored workHistory/capability.
Re-derive exact acting/context counts from all qualifying retained facts dated at
or before evaluation. Bounded witness references establish threshold support only,
not an exact larger total or absence of a stronger omitted counterpart. The exact
appendix distinguishes total counts from bounded reference counts.
Digest consistency is not cryptographic proof against coordinated
save tampering. Exact field/range/reference/choice mutation tests must name the
invariant they actually prove rather than implying complete historical re-simulation.

Current38 validation derives immutable, invocation-local profession authority only
after this proof, without first requiring incompatible public37 current-role checks
to pass. Private historical delegates may consume that context for dated
role checks, retirement-episode caps, cohort original/request roles and canonical
authored credits. Every public V1–37 reader retains its original strict default;
adding raw new fields cannot opt an old public reader into current law. No mutable
global flag, synthetic employment or in-place role/record rewrite is permitted.
Thread the proof through every actually used delegate; do not weaken whole validators.

An employment interval after acting retirement belongs to the new profession only
when an actual earlier/same-week change proves it. Intervals that began in the old
episode remain capped by its actual E. Cohort requests use profession/status at
their recorded post-settlement week; later roles/retirements cannot change old counts.
The actual entrant role remains as recorded at its creation. Current episode lookup
must also amend retirementWritingAuthority's old duplicate-person disqualification
while keeping all880-B project/studio/person/date/expiry/malformed-authority guards.

## 5. Promises and projections

Current offerable P1/P2 promises concern acting. Retired acting stays ineligible even
after a directing/writing transition. C.3 activates no P3/P4/P5 or writing promise.
Use the requested profession's retirement in acting feasibility/caps/digests, not
only the current role. Existing ordinary bound promises are due by contract end<=E;
no blanket transition VOIDED policy is added without a real reachable open case.
Preserve terminal outcomes, committed-seat precedence, trust and half-open windows.

Projection53 adds truthful current-career and prior-profession facts. Exact DTO
names/field shapes are to be frozen in the reviewed API appendix before tests and
generation: profile current lifecycle plus former-profession retirements, last
transition/week/reasons, industry status (working/awaitingTransition/retired),
industry-retired week and recording notice. Migrated retired non-actors awaiting
prospective reconciliation must not be labeled awaiting an unavailable transition.
Distinguish profession-retirement, prospective industry-finality and relationship
as-of dates. Reuse existing alumni/filmography/
employment routes. Historical profession alumni may still be working in a new role;
the paged Industry query must disclose both facts under one person id and retain
bounded sorting/page limits. No raw input snapshot, hidden ceiling, private rival
terms, edge magnitude or undisclosed counterpart escapes into DTOs.

Working new-profession people show current relationships; final industry alumni use
the final actual retirement boundary. Waiting alumni retain the latest profession-
retirement as-of presentation until work resumes; existing unavailable-history and
current counterpart-disclosure guards remain. Never freeze/delete raw relationship
growth or reconstruct an old tier from a later driver.

Calendar/Market use actual dated decisions and existing profile routes; no invented
future choice, automatic stop or new unread system. Finance records no cash event for
a profession change. Roster/hiring pools use current eligibility; direct-core old-role
refusal remains separately tested. Save/projection migrations must preserve genuine
old current/saved runtime bytes, reset incompatible old replay authority according
to the existing contract, and register the actual outgoing52 schema id.

## 6. Execution gates and ownership

Before production: independent contract/API review, exact field/API freeze, genuine
outgoing T0 preservation on the unchanged writer, independent behavior RED. Parent
owns src/bridge/ui/generated/scripts, one writer; test specialist owns only assigned
new/attributed tests and fixtures; reviewer is read-only. Parent alone executes the
one heavy lane. No source/HEAD mutation while any recorded run is active.

Implement the full source dependency set before claiming live transitions. Run the
new source-relevant suites, frozen historical readers/genuine migrations, generated
checks/types, actual runtime restart/branch paths, independent stable-diff review,
matched full regression and the C-track endurance scenario with measured cost. Reuse
established controls; attribute every new/changed failure before test maintenance.
Keep full-suite failures and isolated results distinct. Unity/native stays NOT
VERIFIED. Budget remains937's10–15h planning checkpoint with3–4h verification reserve;
reconcile measured scope/cost rather than cutting obligations or repeating passed gates.

Open before release: exact API/persistent field type declarations, input witness
encoding/digest tuple, current-context propagation inventory, due-queue validation
and historical-builder sweep. These are delegated implementation refinements, not
routine permission questions. This draft alone does not authorize the writer.
