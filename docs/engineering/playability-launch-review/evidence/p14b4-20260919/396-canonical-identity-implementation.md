# 396 — Private canonical replay identities

2026-09-20. Native sim-core. SOURCE FROZEN; production write ownership yielded.
Implemented the adopted394 boundary against published/exact-remote base
`51cfcc6ea3fb8908623f999b5644510c08d6deda`.

Writer changed ONLY `src/core/promiseCapacityOwnerReplay.ts` and this handback.
No runtime, tests, probes, typechecks, Git, network or delegation was run.
The independently authorized sibling-public-reference assertions belong to the
test-author, not this production writer.

Source SHA-256 before:
`8941e0d2ecd68fd3914891f662d11a37e10bb72103d6d22ef92ced9f2f9817a8`.
Source SHA-256 frozen:
`6eb19801534c950e91620b4167be07e4285817981d0263e24d660c7d43b4dd9e`.

## Complete source delta

- Added fixed literal schemas and private readonly Identity/SubjectFact/
  FixedIdentity types. Numeric domains0–7 are respectively person, facility,
  Set, mount, production, screenplay, castingSession and setMount. The fixed
  namespace array is module source, not input discovery or a gameplay ordinal.
- Added `canonicalIdentity` at414 and `subjectFact` at429. A single paid linear
  table is created per invocation. Each subject factory ALWAYS creates a fresh
  public HoldSubject; atoms contain no public subject reference.
- `reservationSubject` at488 retains every actual facility/capability/slot
  validation before canonicalization. Its return is now the private fact whose
  value has the unchanged public shape.
- Preparation creates production, screenplay, casting-session and mount path
  atoms; the existing public pathKey is retained. The fixed factory at712
  creates its original public FixedHold and an aligned private sidecar together.
  Original hold ordering, IDs, subjects, spans and replaceable boundary remain.
- LedgerRow privately gains path/subject sidecars. `samePath`, `sameSubject`
  and `pictureForPath` at1356–1374 replace serialized identity work only.
  `closeHold`/`addHold` preserve all occurrence scans and checks. `closePath`
  at1411 is UNCHANGED, including its string path comparison.
- `drainEvents` at1425 retains raw event/workflow/reservation/bare-key joins,
  BEFORE/CURRENT snapshots and the exact wrapped Set witness. Only after those
  checks do validated private facts reach closure/grant helpers.
- `reconcile` at1481 keeps separate expected occurrences and354's two-way
  counters. Membership is looked up in CURRENT Prepared.pictures by path atom,
  never stored on an atom. Both diagnostic stages/order remain.
- Ready admission at2366 interns screenplay identity, retains the current
  branch picture list and original fixed sidecars, and constructs fresh company
  subjects. It shares the invocation table, not branch state or output subjects.
- Branch initialization at2470 copies aligned private sidecars into NEW ledger
  rows while intentionally retaining original public fixed Hold references.

No public API/shape, owner invocation, owner tariff, other calculator, dimension
memo, plan ordering, source guard, cap, validator, version or kernel was changed.
No new source module, global cache, index rebuild, hash assumption or parsed ID
was introduced. The separate one-slot wrap proposal is NOT implemented.

## Before-execution payment inventory

All figures below are176 source-model units, not CPU/allocation measurements.
Existing Work/token/string/copy/append mechanics remain. Fixed scalar blocks
cover named finite controls/accesses; variable comparisons pay their real spans.
Actual owner reserves are untouched.

### Literal and factory construction

| Site | Payment before operation |
| --- | --- |
| Empty identity table | `4 + literal(issuer,entries) + 1`: setup/binding, exact16-unit table literal, empty entries array. |
| New immutable atom | `literal(domain,id,key)=15`; added only after all key work and publication payment. |
| Fresh SubjectFact | `literal(value,atom,slot)=17`, in addition to the public person15/resource23 literal. |
| Fixed sidecar | `literal(path,subject)=14`, additional to original FixedHold65 and both append charges. |
| Prepared picture/background/mount | Each existing schema gains the9-unit `identity` key. |
| Prepared aggregate | Schema gains11 for `identities` and16 for `fixedIdentities`; no copied table/list. |
| LedgerRow | Original19 plus path5 and subject8 =32 per NEW row. |
| Expected fact | Existing22-unit path/subject/matches literal unchanged; values are now private facts. |

`canonicalIdentity` prepays8 for table access/traversal setup/result controls.
EVERY visited row prepays8 for visit/reference, domain/id reads, domain comparison,
short circuit and branch/return controls. Only equal domains execute the existing
`Work.equal(entry.id,id)`, which separately prepays1+both actual ID lengths.
Cold misses then pay10 for dispatch, namespace/issuer access, key binding and
token call. Non-person keys call the unchanged fully paid `Work.token`; people
retain the raw string ID. Finally `8 + 15 + APPEND` pays entry construction,
references/binding/table access, append and return before publishing the entry.
There is no early unpaid token creation, output-subject storage or free hit.

Thus lookup cost is8 +8 per actual visited row + each actually reached ID
comparison. A cold miss additionally pays36 plus its original token work.
The cold nonmatching-domain rows still pay their visit/control cost.

`subjectFact` first prepays10 for canonical-call arguments/binding and mode
dispatch, then invokes the above paid lookup. It pays `8 + 17` before payload
references, local value binding, return/control and the private fact. It separately
pays the person15 or resource23 literal before constructing that public object.
Those objects are fresh on cold AND warm calls. Their local factory subtotal is
50/person or58/resource, additional to canonical lookup/token work.

`reservationSubject` retains its previous6-unit entry block and all original
validation joins/guards. The final new10-unit block pays subject-factory argument
and field access, invocation and return before that helper is evaluated.

### Every factory caller / occurrence

| Caller | Explicit scalar/literal reserve, additional to called helpers |
| --- | --- |
| Prepared production path |8 before canonical arguments/id access/binding; `2 + expanded pictureFacts + APPEND` before key/reference reads and fact append. |
| Prepared screenplay path |8, then `2 + expanded backgroundFacts + APPEND`. |
| Prepared casting path |8, then `2 + expanded backgroundFacts + APPEND + 1` including its existing empty people array. |
| Standing mount path |8, then `2 + expanded mount + APPEND`; original Set order retained. |
| Fixed arrays |2 before the two empty aligned arrays. |
| Fixed factory |`18 + 15 + fixedHold65 + fixedIdentity14 + 2*APPEND` before BOTH records/appends.18 covers finite subject extraction/bindings, conditional selection, token/path/length accesses, sidecar references and call/return controls.15 is specifically the closed-kind comparison bound `1 + max(6,8) + 6`, not an unexplained residual. Native kind narrowing is retained. Original fixed token and final subject text each pay separately. |
| Fixed picture/background people |8 per occurrence before path/factory/call arguments; helper pays the fresh public person. |
| Fixed production reservation |Original paid owner-ID equality retained;6 before path/factory arguments. |
| Fixed bound Set |Original actual stage/binding/mount checks retained;8 before private Set subject/fixed calls. |
| Fixed background reservation |Original nonnull guard retained;7 before nested row/path access and calls. |
| Fixed mount resource |9 before mountedOn/path access and calls. |
| Prepared return |Expanded Prepared literal + unchanged DimensionCell literal +5, including new references and existing empty records array. Original source token pays itself. |
| Event reservation |5 before arguments and subject-result binding; reservation factory still validates raw authority. |
| Wrapped Set close |9 before path/Set/factory/closure arguments; fresh resource and SubjectFact are paid inside helper. |
| Bound Set grant |11 before nested bindings/path/end/factory/grant arguments. |
| Reconcile reservation |`7 + expected22 + APPEND` per occurrence; actual reservation factory/validation additionally pays itself. |
| Reconcile Set |`11 + expected22 + APPEND`; public resource/private fact separately paid by helper. |
| Ready path |9 before canonical args/access/binding; `14 + expanded pictureFacts + 11` before fact construction (11 retains the existing greenlight key). |
| Ready Prepared |Original paid calc32 receiver; scalar26→30 for the two extra nested references. Expanded Prepared literal, original picture-array copy formula and all other references retained. |
| Ready company occurrence |11 before path/source/end/factory/grant arguments; fresh subject factory plus addHold separately paid. |
| Branch fixed-row map |Per row original3→10 plus expanded ledger32.10 covers callback visit and hold/index binding, sidecar array/index access/local binding, its two field reads, return and output reference/capacity. Existing map/array aggregate and paid saturating calculator remain. |

The fixed factory computes the complete public record and complete sidecar after
their payments, then appends each. No variable/helper call occurs between the
two prepaid appends. The possibly cutting final text charge cannot leave them
misaligned. A source preparation cut exposes no completed fixed proof.

### Ledger comparisons and preserved checks

`samePath` pays4 before two reference reads, exact comparison and return.
`sameSubject` pays8 before four atom/slot reads, two exact comparisons, short
circuit and return. Subject slot remains a distinct numeric comparison; no
different path can bypass addHold's global subject occupancy check.

`pictureForPath` pays4 for traversal/result setup and6 for EACH visited picture,
its reference/identity access and call/branch/return controls; each samePath
comparison pays itself. It searches only the current Prepared.pictures.

closeHold retains the original ledger visit4 and closed/null guards, duplicate
and missing diagnostics, then original14+copyCost for actual public Hold closure.
Replacement literal/append payments are unchanged. Only the identity-comparison
callees change. addHold retains its visit3/global check; new construction reserve
is12 (previous8) + expanded ledger32 + unchanged public Hold literal + APPEND,
covering private references and public `path.key`/`subject.value` accesses. Grant
token and original nextHold sequence are unchanged and separately paid.

Reconciliation retains visit4, resource-kind/null/closed filtering, then CURRENT
picture membership. Each original expected-pair visit3 remains, followed by paid
path and (when reached) subject identity comparisons. Its successful-pair16 pays
both counters exactly as354; each final expected occurrence still pays12 before
the second diagnostic. No expected fact is deduplicated or rejected early.

No public Hold spread copies a LedgerRow or SubjectFact: closures copy only
`row.hold`; trace output appends only public `row.hold`. closePath remains the
old string implementation and updates only Hold endpoint/closed state.

## Equivalence, isolation and atomicity

Within one fixed issuer, original JSON tuple tokens are injective over admitted
strings and namespaces. Numeric domain plus exact source ID therefore identifies
exactly the old serialized key class. Resource slot is compared separately;
person domain cannot collide with any resource domain. Public tokens use the
EXACT original namespace strings and arguments. No ordinal or normalization is
involved. Prepared production paths keep production namespace even if linked to
a screenplay; only newly admitted Ready paths use screenplay namespace.

The table has no membership/completion/closed flags. Ready sibling branches may
reuse an immutable atom but build separate PictureFacts, public subjects and
LedgerRows. Background and Ready source eligibility is unchanged. A shared
screenplay atom cannot make a background into a current picture: membership is
still explicitly searched in that branch's picture list.

Expected occurrences, ledger occurrences and original traversal/diagnostic order
are unchanged. Per-row exactly-one and per-expected exactly-one remain independent
checks; same-path duplicates still fail rather than being collapsed. Closed rows
cannot occupy a subject. Stage/Set closure still occurs at the matching actual
stage reservationReleased event after the exact wrapped witness; chronology is
not inferred from handles.

Atoms publish only after full key/entry/append payment; a later subject/payment
cut can leave only a completely paid private atom, never a half-valid entry or
successful proof. Fixed sidecars align by construction. Branches reuse original
fixed public Hold references intentionally, but their mutable ledger rows and
closure state are never shared. No private metadata escapes in public output.

## Static review and remaining limits

Read full394 and relevant176/model/382, all changed factory sites, preparation,
Ready admission, initialization, event/ledger/reconcile and public trace output.
Checked all `reservationSubject`, `addHold`, `closeHold`, `sameSubject` call sites
and every new Prepared/PictureFacts construction; inspected public HoldSubject
and mountedOn types. There is no known remaining signature/narrowing blocker.
Hashing completed, with the existing host locale warning. No executable compiler
or behavioral claim follows from this static pass.

Canonical lookup remains a paid linear scan, potentially quadratic over many
distinct introductions. New sidecars/factories cost work, and cuts may move; this
is not a claim that every input becomes cheaper. The source-model accounting
inventory is submitted for independent397 review, not self-certified acceptance
of all inherited owner coefficients or prior whole-replay proof gaps.

Actual392 still required12273 more units just for the wrap prepayment at its
observed boundary, before later drain/output/kernel work. This change has no
measured aggregate saving yet. Parent398–405 must preserve and attribute all
remaining failures, including the two known Ready work-limit gates. No cap,
metric, timeout, assertion or validator relief is authorized.

SOURCE FROZEN; production write ownership yielded. Next: parent full fixed diff/
pins and397 source review, then serialized compiler/behavior/regression checks.
This is not Ready/B4 completeness, live activation, Unity or Owner acceptance.
