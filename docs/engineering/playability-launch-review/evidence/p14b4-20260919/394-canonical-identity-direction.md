# 394 — Canonical replay identities: bounded direction

2026-09-20. Published base51cfcc6ea3fb8908623f999b5644510c08d6deda.
ADOPTED after native contract-auditor's bounded design KEEP and parent full read.
396 sole sim production writer may implement ONLY this boundary after release.
This is not actual-source/payment acceptance or a numerical fit claim.
393 preserves all prior actuals and remaining budget failures.

## Purpose and private representation

Remove repeated token generation and serialized ledger comparisons, not actual
owner work or public validation. Keep original scans and occurrence semantics.

Private readonly Identity {domain, id, key}; numeric closed domain tags distinguish
person, facility, Set, mount, production, screenplay, castingSession, setMount.
Private SubjectFact {value: fresh HoldSubject, atom: Identity, slot:number};
person slot0. Private fixed sidecar {path: Identity, subject:SubjectFact}.
Public holds, subjects, paths, provenance and API shapes remain exactly unchanged.

One paid invocation-local identity table; issuer is fixed for that invocation.
A paid linear lookup compares domain first, then exact Work.equal source ID.
On miss generate the SAME existing Work.token namespace/issuer/ID string (person
keeps raw ID), pay the complete immutable entry and append before publication.
No parsing, arbitrary concatenation, hash-cost assumption, cross-invocation cache,
gameplay ordinal, native map or per-frame index rebuilding.

JSON string tuple encoding is injective over admitted string fields; issuer is
constant locally. Equal atom iff previous public identity strings equal within
their subject/path kind; resource slots remain independent numeric comparisons.
Facility/Set/mount and path namespaces cannot collapse. Same person ID is not a
resource. Handles are not ownership, occupancy or membership facts.

## Complete call-site boundary

- Prepare pictures/backgrounds/mounts retain pathKey and add private path handle.
- Fixed factory retains fresh public subjects/holds, original order and appends a
  fully paid aligned private sidecar. Public hold reference sharing stays as before.
- Reservation factory keeps EVERY facility lookup/capability/natural-slot/capacity
  validation before obtaining atom and constructing fresh public resource subject.
- Person/Set/mount factories keep existing public literal values and namespaces.
- Branch initialization retains original fixed Hold references, copies private
  sidecars into each LedgerRow; does not rebuild identity table or share live rows.
- Ready admission interns screenplay path in the same invocation-local table;
  branch-specific admitted picture/person/resource occurrences remain separate.
- drainEvents retains exact BEFORE/CURRENT reservation joins, bareKey checks,
  duplicate-join detection, capability/slot checks and wrapped-Set witness. Only
  pass validated private handles to ledger helpers after those checks.
- closeHold retains all ledger visits, closed/null guards, exactly-one matching
  diagnostic and original order. addHold checks ALL live subjects across paths.
- reconcile preserves separate expected occurrences and354's per-ledger and
  per-expected counters/diagnostic sequence. Picture membership is checked against
  CURRENT Prepared.pictures, never cached on a handle. No deduplication of facts.
- closePath may remain string-based for minimum scope; closure writes cannot
  invalidate immutable identity sidecars. All unrelated joins stay unchanged.

Ready screenplay/background identity overlap does not authorize picture membership.
Auditor source check: prepare includes drafting/rewriting backgrounds only, while
actual productionAdmission requires Ready. One source project cannot have both
roles; original started pictures retain production-domain paths. Sibling atoms
may coincide, but no ledger/completion state does.
Shared atoms contain no membership flag, mutable hold, closed bit, company, branch,
workflow or output subject. Fresh SubjectFact.value prevents new public aliasing.
Fixed/public sidecar order and cardinality must agree by construction, not asserted
with an uncharged new bulk scan.

## Prepayment obligations

Complete source-level inventory required in396 handback and397 independent review:

| Work | Required payment |
| --- | --- |
| Empty table / fixed sidecar array | before construction, including setup/control |
| Canonical lookup | invocation/setup, each visited row/domain/reference/control and each actual ID equality span |
| First key | unchanged Work.token full payment before serialization; person raw reference separately accounted |
| Entry | literal(domain,id,key)=15 plus references/control/append; publish only complete paid entry |
| SubjectFact | literal(value,atom,slot)=17 plus public person/resource literal and accesses/control |
| Fixed sidecar | literal(path,subject)=14 plus original public hold costs and both appends |
| Private fact/ledger fields | exact new literal keys, branch callback/index reads and array capacity/references |
| Handle and slot comparison | each fixed scalar invocation/access/operator/control, not assumed free |
| Current picture membership | every visited picture/reference/handle comparison and traversal setup |
| Closure/new grants | preserve copied public Hold costs, boundary/replacement costs, new hold token and appends |

All comparisons are paid on cold lookup, which may be quadratic over distinct
introductions. No claim of universally lower work. Work.add/times/plus/primitives,
actual owner tariffs,200000 cap, span/alternatives, tests/timeouts unchanged.
Partial workLimit never exposes a newly unpaid proof or complete trace.

## Evidence and verification

Existing independent tests exercise distinct same-facility slots, mount/facility/
Set namespaces, due-background closure before sweep, genuine one/two-picture
take/wrap parity and stage-release Set closure, Ready sibling isolation/order,
and A/B/A/B same-ID independent invocation purity. Long Ready firsttake/stale
complete assertions are currently UNREACHED, not coverage already credited.

After adoption:396 sole sim production writer ONLY replay source +396 handback,
then yield; parent full diff/handback/immutable pins;397 bounded source reviewer.
Independent author reviews public identity coverage without private helpers or
source-derived oracles, may add a genuinely justified test under separate scope.
Author's bounded review found one gap: sibling public subject reference freshness.
Explicit additive exception to old-test byte preservation: author may add ONLY
an assertion block to the existing genuine Ready sibling case, pinning five real
company-person subjects plus the actual development facility/slot, one-to-one
holds and equal-valued but distinct public Hold/subject references across siblings.
All original lines/assertions/fixtures/caps/timeouts remain. No extra replay or
synthetic source; intentional fixedHold sharing is not prohibited. Record baseline
and new hashes in396-sibling-subject-test-brief.md. This retained-property control
is not a demonstrated RED regression; parent runtime remains pending.
Parent serial398–405 fixed-source types/lookup/callers/Ready/started/adjacent/
bridge/record-facts controls after all writers yield; preserve failures.

The separate one-slot wrap candidate from393 remains NOT adopted here. No other
calculator/tariff/sort/owner/kernel/API/schema changes. No fit/Ready/B4 acceptance.
Continue full B4/P14/P15/P16/specifiedP17/P18. Unity/native/Owner acceptance deferred.
