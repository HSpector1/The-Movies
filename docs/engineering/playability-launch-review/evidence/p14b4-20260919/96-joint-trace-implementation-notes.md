# Joint-trace extension — bounded source implementation notes

2026-09-20. READ-ONLY preparation against the existing741-line detached kernel,
full91/92/93 and controlling94. No author95 draft/test was inspected. Only this
document was written; no source/test/runtime/typecheck/Git/network/delegation.
Source implementation remains gated on actual independent RED and parent release.

## Smallest private extension

Keep both public signatures fixed by91, in the existing module. No public
per-trace calls, new budgets per trace, second matching algorithm or owner imports.
Private names below are an implementation map, not further public API changes.

1. Factor the common portion of `normalize` at216 into `normalizeBase`: now,
   horizon/issuer/target, canonical priors/debits, exact source identity selection,
   and canonical fixed holds. Keep the old optional validator as its existing
   alternative/coverage arm. Share picture identity/cast/staffing/event checks;
   its calendar helper accepts nullable release ONLY for the explicit trace arm.
   Do not synthesize a horizon release to fit the old PictureAlternative type.
2. Add `normalizeTraces` for91's tagged root/trace/path union, occurrence/path
   joins, consistent issuer/existing identity across variants, empty per-picture
   hold arrays and background forbidden-field checks. Fact-reference arrays,
   path/trace collections, additions and replacements canonicalize before any
   search. A fixed or additional hold occurrence belongs to its actual ledger;
   conditional IDs in exclusive traces are not globally merged.
3. Extract common demand/boundary/eligibility preparation from `prepare` at336.
   Compute demand counters ONCE, then ONE union of existing event cuts across
   every trace. Picture eligibility uses the existing person/mask/window code;
   background paths never enter that code. Every prepared trace shares these
   same demand/index arrays. Build its own suffix-potential table only for its
   candidate picture credits; no copy becomes a new set of obligations.
4. Generalize the private model into a domain with exclusive branches:

   ```ts
   type PreparedDomain<W> = {
     common: CommonPrepared // base facts, demands, target index, common cuts
     branches: readonly SearchBranch<W>[]
     upperPaths: readonly Path[] // ALL variants grouped by physical path
     coverage: CommonCoverage
   }
   type SearchBranch<W> = {
     common: CommonPrepared
     paths: readonly Path[]
     suffixPotential: readonly (readonly number[])[]
     ledger:
       | { kind: 'optional'; fixedHolds: readonly FixedHold[] }
       | { kind: 'trace'; effective: readonly EffectiveHold[];
           proof: CompleteTraceProof }
     // Internal typed proof formatter, not a caller/owner-execution callback.
     formatWitness: WitnessFormatter<W>
   }
   ```

   The optional entry creates ONE branch with exactly its old dynamic selected-
   alternative ledger. A trace branch carries the complete, already validated
   compulsory ledger and full execution metadata separately from credit choices.
   `Alternative.value` needs only an internal picture view whose release can be
   null; public optional PictureAlternative remains unchanged. No fake full
   record, placeholder date or type-erasing cast is necessary.
5. Reuse the iterative `search` at467 as generic `searchBranch<W>`: the same
   counters, slot branches, rollback, profile comparison, target ordering and
   achievement predicate. Its optional ledger path retains the current safe
   immutable-prefix prune and exact selected-continuation check. The trace path
   does not add/drop holds as credits vary; its physical ledger was validated
   in full before searching. Skipping a trace picture means NO CREDIT, not that
   the picture or its background context disappeared.
6. Add one private `searchDomain<W>` loop over canonical exclusive branches,
   sharing Budget, options and the common cut index. For optimization compare
   branch optima into one global maximum; stop early only on the proved GLOBAL
   upper profile. For protected/count/B probes search every necessary branch
   for a witness. Equivalent optimum assignments remain available because each
   new probe reruns matching under the profile, not a saved first allocation.
7. Extract the existing public prior/X/B/unoptimized orchestration at698–735
   into one private `classifyDomain<W>`. Both public entries use it and their
   appropriate proof formatter. A private generic result shape preserves the
   exact public Witness/JointTraceWitness result types; no `any` is needed.
   Coverage maps to existing-complete/all-complete booleans privately, without
   weakening91/94's global meanings or changing public labels.

## Global upper bound and search correctness

Reuse `priorUpperProfile` at408, adjusting its private input to the common
demands/cuts plus `upperPaths`. Group variants from ALL branches by physical
path first. For each prior/debit, a path contributes at most one optimistic
existing credit at its earliest eligible variant boundary. This is an upper
bound even when different earliest variants cannot coexist; only a lawful joint
assignment attaining EVERY component can saturate it. Never sum repeated path
occurrences or unrelated per-trace maxima.

Full exhaustive prior optimum is global, with the same common boundary index.
The upper-bound shortcut requires genuinely complete existing calendars,
including future choices that can affect them. Zero nonzero prior/debit demand
still gives the identically zero optimum and permits a constructive B trace
with complete claims/holds even when calendar/trace enumeration is incomplete.
Incomplete FAILED probes remain UNCERTIFIED. Protected-X failure still runs the
global unoptimized X probe before any impossibility/reallocation conclusion.

The optional arm's existing irrelevant-alternative prune remains sound and must
stay local to that arm. For trace matching, an ineligible/null picture may be
omitted from credit branches ONLY because its compulsory ledger and execution
proof remain present. Background rows and their replacements are validated and
retained even though they have no cast/event matcher node.

## Validation and shared-cost order

Keep the current Budget/WorkLimit, structural scan, merge sort, safe-integer,
boundary, hold and profile primitives. Preserve the optional entry's current
work/normalization order where unchanged. New trace work follows this order:

1. Validate limit maxima/preparation scalar; instantiate ONE Budget. Immediate
   preparation exhaustion remains normalization workLimit before other work.
   Charge the raw structural/string/array/container scan before semantic sorting
   or any lucky early certificate, just as the existing entry does.
2. Normalize common fields and explicit trace shapes/joins canonically. The
   old entry explicitly refuses the new mode/trace/path tags; do not broadly
   rewrite its previously governed optional admission rules. Trace mixed-mode
   fields and forbidden background picture properties are checked by presence,
   not made harmless by an undefined value.
3. Derive retained foreign debits, remaining X, B after safe bounds, exact H,
   and all GLOBAL size gates before large derived allocation/search work. H is
   `max(raw horizon, target due, every admitted LOCAL prior due)`; original
   foreign source due does not extend it. Domain cost is trace headers PLUS
   every picture/null/background path row, including empty traces. Claims/units
   remain shared once. No loop expands an admitted safe-integer count or week.
4. For each canonical trace, build its COMPLETE effective ledger: unchanged
   fixed identity/prefix, exactly joined lawful trace suffix replacements, then
   ALL trace additions. Charge construction and every compatibility comparison.
   Join replacement ownerPathKey to a real certified row of either kind; preserve
   unmatched/other-owner holds. Validate duplicates and exact interval authority
   before using a ledger. A conflicting claimed complete trace is an Error.
5. Perform94's nullable-release guard with no hold repair. For each affected
   picture/person, take start=max(now,greenlight), end=(H,0). Collect only effective
   person holds with that exact person AND physical ownerPathKey. Canonically
   sort by from, until and hold identity, charging sort/visits. Starting at start,
   skip segments ending at/before the cursor; a segment starting after the cursor
   exposes a gap; otherwise advance the cursor to its actual until. Adjacent
   segments compose. If start<end and the cursor cannot reach end, throw input
   Error. No per-week loop, clipping, stretching, guessed release or acceptance
   of another/null-owner path's coverage. Known first-take credit survives a
   null release once this independent occupancy requirement is met.
6. Finish trace validation before any positive/count certificate can hide a bad
   later trace. Validation is itself budgeted: exhaustion returns workLimit,
   never unbounded late validation or a gameplay proof. Then prepare common
   eligibility/cuts/bounds and enter the shared search phase; all branch visits,
   counter/profile comparisons, probes and output construction debit that SAME
   counter already containing owner preparation work.

Actual owner replay is not performed here. preparationWork is supplied under91's
upstream before-work allowance contract; no hidden replay callback is introduced.
Future use of the existing ordered event sink may help the owner producer derive
true transition intervals, but does not enlarge this detached implementation task.

## Proof formatting and concrete regression risks

Factor current credit ordering/copying and target boundary construction out of
the nested witness function at524. The old formatter still emits its ordinary
selectedAlternativeKeys. The new formatter emits the containing trace's complete
canonical references, ALL executed path keys and effective hold IDs, plus only
the actually credited picture occurrence keys and shared credit rows. Background
or null take cannot acquire a credit merely by appearing in execution proof.
Both B and count witnesses use the full trace format.

Main failure traps to check against frozen92/94 and future independent RED:
per-trace cut vectors/optima, duplicate physical upper-bound capacity, fresh
budgets, pre-credit disappearance of background holds, nullable-release coercion,
raw-horizon rather than H coverage, overlap masking a missing tail, and returning
after one bad/equivalent trace. Canonical trace/hold/credit permutations must
preserve the entire result including work/cap disposition. A trace/profile key
may stabilize serialization, never award a beneficiary or discard alternatives.

The old46-case optional kernel selection must stay intact alongside the new
trace cases. Both typechecks and an independent bounded diff review remain owed
after actual RED/source release; no implementation or execution is claimed here.

DOCUMENT FROZEN. No concrete mechanical blocker found within the authorized
detached extension; real owner enumeration/performance and live P2 remain separate.
