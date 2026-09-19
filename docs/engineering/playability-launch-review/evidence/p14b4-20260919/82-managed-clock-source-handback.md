# Managed clock extraction — source handback

2026-09-20. Native sim-core implementation of reviewed72/78, on parent-supplied
published RED checkpoint `0ece527bb26c55a60be6abe137708489656f1b70`.

SOURCE FROZEN for parent83/84/85/86. Only `src/core/operations.ts`,
`src/core/technologyProduction.ts` and this handback were written. Tests77 and
all existing transparent owner spies remain unchanged. No tests, runtime,
probes, typechecks, generators, Git, network or descendant agents were used.

## Implemented delta

- Added the readonly four-field `ProductionClockView` in operations, derived
  directly from Production's id/startTick/remainingTicks/directorId types.
- Parameterized `ProductionAllocationPolicy<P>` and
  `ManagedProductionAdvance<P>`, retaining Production defaults. Custom phase
  callbacks keep their full P, including additional caller fields.
- Parameterized the existing `advanceManagedProductions` and private
  `enterPhase`, with `ProductionAllocationPolicy<NoInfer<P>>`; their outputs and
  local first-take/map annotations retain P. The production array, not a broad
  policy callback, determines the inferred returned record type.
- Parameterized sweep ordering to retain its caller element type. Narrowed
  wait/add-workflow/director-assignment input types to their actual Pick fields.
- Narrowed only the PRIVATE allocator's policy parameter to its existing
  `allowsFacility` read. The full policy still reaches enterPhase and its real
  beforePhaseEntered invocation.
- Changed the stock technology factory's type-only import and declared policy
  result to `ProductionAllocationPolicy<ProductionClockView>`. Its actual
  technology selection, operational stage/Post checks and shooting lock logic
  are untouched.

No executable operation, comparison, sort, spread, default/positional argument,
callback invocation, returned value construction, error text or timing law was
changed. Strict actual Production/technology/save validators remain as before.
No partial-as-Production assertion, any escape, caller edit, kernel/trace
extension, live alias, rule/save/schema version or generated artifact was added.

## Static review and evidence boundary

Read full role,72,78 and the frozen independent77 test. Reviewed the applied
signature/type changes and the preserved local output annotations using source
reads. Confirmed unchanged strict validator signatures and the retained complete
policy call site. This is a bounded manual source review, not a compiler or
runtime result and not an automated executable-body comparison.

Parent evidence79 already showed all five paired runtime cases passing on the
pre-extraction owner;80 established the actual eleven type-level RED diagnostics
with UI unreached. The new candidate's independent marked narrow/full records,
stock-policy inference, full-P callback, existing spies and both typecheck
results remain owed. No concrete new source conflict was found in this static
pass. If actual generic diagnostics arise, preserve them and investigate without
editing tests or casting away the owner result.

The change exposes the same owner to honest narrow records; it does not prove
staffing admission, complete future calendars or cross-path compositionality.
Recommendation89 remains inert and unimplemented. Next: parent-owned83 selected
runtime regressions,84 root/UI,85 bridge and86 independent source review, then
qualified publication if those gates support it.
