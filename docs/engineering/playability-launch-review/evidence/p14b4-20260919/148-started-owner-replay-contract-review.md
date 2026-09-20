# 148 — Independent started-owner replay contract review

Parent-persisted native contract-auditor handback,2026-09-20.
DONE. REFINE before executable replay authorization. Architecture and chronology
are supported; numerical work contract does not yet satisfy125/126’s required
source-accounted upper bound. Independent section2 type-only extraction unaffected.

Reviewer read all515 lines of137, governing125/126/132 and91/94/96, and relevant
owner bodies at fixed source6afe629a6519ff64a42e89064b6fe2d1576a2ceb.
No mutable147 implementation inspected; no file changes, runtime or descendants.
137 SHA independently verified:
5c237c43758eaa0b75757eb3674246e663b19cc64a39d7cf7e02fb0b3e5845c9.

## Required refinement: bounded work

PARTIAL —137:362–455. Before-call reservation, shared expenditure, saturation,
failed-plan charging and callback footprints are correct structure. However,
137:370–379 expressly assigns Q(n) without establishing a bound on actual
comparator invocations. Accurately labelling the weaker tariff does not
discharge125/126.

Concrete repeated-work omission under137’s own character-accounting rule:

- operations.ts:1482 invokes productionOrdinalKey for both operands on every
  tied-wait comparison.
- The helper repeatedly performs regex matching, numeric parsing and possible
  lexical fallback (operations.ts:1456 onward).
-137:423–426 charges ID characters during preparation, while9Q(N) treats repeated
  parses/comparisons as fixed-size work. One initial character debit does not
  account for repeated variable-length operations.
- Facility and commitment sorting likewise repeatedly compare IDs. Facility-slot
  key construction, reservation-key comparisons, technology/setup identity scans
  and geometry includes searches also need consumed string work, not merely rows.

Minimal correction, in a separately authorized prerequisite:

1. Give actual shared owner sorting paths an explicit bounded implementation or
   equivalent source-proven comparator/copy bound. No second replay-only ordering.
2. Preserve existing comparison semantics/order with independent parity/cost tests.
3. Precompute production ordinal keys once within the shared owner OR charge their
   repeated parse/character work per comparison. Charge lexical fallback separately.
4. Define consumed identifier/property-copy footprints and propagate through
   callbacks/repeated visits. Preparation cannot pay once for later repeated scans.
5. Recalculate numerical example and prove useful real one/two-picture fixtures
   within200000. Current67904 is arithmetic under proposed tariff, not required bound.

This asks for bounded source-level accounting, NOT a JavaScript instruction-count
or wall-clock theorem.

### Exact reachable sorting scope

Nonempty existing-owner sorts:

- operations.ts:295 facility ordering, compareId at169.
- operations.ts:1482 production sweep ordering.
- releaseAuthority.ts:121 commitment ordering.

Adopted narrow resourceClaims research sort387 receives[]. Scenery-shop sort531
unreachable without supplied under-work Sets. Operations invariant sorts1014/1015/
1026 are not invoked by this replay execution path. Exclusions must stay explicit
if supplied roots/call graph changes. Producer plan/command/released-ID/ledger
canonicalization also requires bounded sorting. bindableSetsOn retains state-order
filter; do not introduce a Set sort.

## Supported contract

- MET AS DESIGN — Whole context/cuts.137:218–266 uses genuine roots, whole current
  player slate, pooled writing/auditions, named cuts for unmodelled queue/physical/
  installation/research/relevant foreign work. Rival unsupported. Explicit plans
  completing do not prove choice-domain completeness.
- MET AS DESIGN — Chronology.137:268–324 resolves126 with132 lawful fixture:
  background closes at pre-sweep logical step with original due week; arrival
  makes Ready, not scheduled; first takes(w+1,0). No mid-sweep command or fictional
  same-slot Development waiter.
- MET AS DESIGN — Ledger. Initial fixed claims, ordered owner transitions, exact
  namespaces/background paths/owner-certified suffix replacement conform91/94.
  Historical post-wrap setId is not occupancy. Company holds survive wrap until
  actual release admission; unknown release stays null throughH.
- MET AS DESIGN — Release aftermath. Pre-sweep retained-Set lookup and ID-ordered
  depleteSetNoveltyForRelease match inspected owner. Sweep applies wear once.
- MET AS DESIGN — Historical events. Current first-take identity retained;
  already-filmed continuations supply no new event. Future execution, not receipt
  fabrication or whole-world tick equality.

## Two executable conventions

1. H==now: retain canonical zero-length initial holds[now,now) and current paths,
   return unchanged projection with no owner invocation/take/completion/release,
   subject ordinary input/context/budget checks. Kernel permits empty holds and
   skips unknown-release coverage when start>=end. Do not invent release atH.
2. Command after earlier release: initially validate original-production identity,
   then resolve each command against current branch slate. Originally valid but
   now released picture yields commandRefused, not stale execution/resurrection/
   source contradiction. Preserve expenditure/prefix provenance; no complete trace.

These are implementation precisions, not new product choices.

NOT VERIFIED: producer implementation, prepaid-call observations, complete
trace/kernel roundtrips, useful corrected-budget witnesses or runtime performance.
No producer source release until accounting refinement and independent tests settled.

## Parent disposition

Adopted REFINE and both executable conventions without a product-permission pause.
137 remains frozen; section2 proceeds independently under146/147. Native sim-core157
owns ONLY an inert precise bounded-owner-work addendum, not runtime changes.
Follow with independent parity/cost and replay tests. No weaker tariff, enlarged
work cap or unearned certification substitutes for the missing source proof.
