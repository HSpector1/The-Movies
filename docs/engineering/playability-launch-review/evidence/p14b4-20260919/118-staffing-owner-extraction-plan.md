# 118 — minimal shared staffing/admission extraction

2026-09-20. READ-ONLY implementation design; no source release or implementation
claim. Read B-F2 owner13/14, next-owner-extraction-notes,113 and the bounded actual
action/employment/script/casting/queue owners. Kernel/source/tests remain frozen.
The native sim-core role is applied; only this document is written.

## Recommendation and exact boundary

Add one lower pure module, `src/core/productionAdmission.ts`, and replace the
corresponding checks in `actions.ts` with calls at their PRESENT stages. It owns
validation and resolved staffing, not a second action pipeline. Its only runtime
dependency need be the existing `screenplayFactsMatch` from scriptDevelopment;
remaining imports are types. No actions/tick/queueAdmission import, employment
market implementation, forecast, RNG, allocation, receipts or mutable cache.

Use separate exported stages rather than one eager all-purpose validator:

```ts
export type AssignmentPerson = Pick<Talent, 'id' | 'skills'>
export type GreenlightStaffingChoice = Readonly<{
  writerId: string
  directorId: string
  craftIds: readonly string[]
  cast: Readonly<Record<CastSlot, string>>
}>
export type GreenlightScreenplayChoice =
  Readonly<Pick<Production, 'conceptId' | 'writerId' | 'shape' | 'promise'>>
export type GreenlightHeaderFacts = Readonly<{
  foundingOpen: boolean
  concepts: readonly FilmConcept[]
  development: Readonly<{
    mode: ScriptDevelopment['mode']; projects: readonly ScriptProject[]
  }>
  casting: Readonly<{
    mode: CastingSessions['mode']; sessions: readonly CastingSession[]
  }>
}>
export type GreenlightHeader = Readonly<{
  concept: FilmConcept
  scriptProject: ScriptProject | undefined
}>
export type GreenlightStaffing<T extends AssignmentPerson> = Readonly<{
  writer: T
  director: T
  cast: Readonly<Record<CastSlot, T>>
  craftHires: readonly T[]
  // Director, lead, antagonist, support, then craft array order. Never writer.
  engaged: readonly T[]
  engagedIds: readonly string[]
}>
export type GreenlightEmploymentFacts = Readonly<{
  contractedIds: ReadonlySet<string>
  freelancerIds: ReadonlySet<string>
}>

export function requireGreenlightHeader(
  facts: GreenlightHeaderFacts, choice: GreenlightScreenplayChoice,
  scriptProjectId?: string,
): GreenlightHeader
export function resolveGreenlightStaffing<T extends AssignmentPerson>(
  talent: readonly T[], choice: GreenlightStaffingChoice,
): GreenlightStaffing<T>
export function assertGreenlightStaffingIdle(
  engagedIds: readonly string[], busyIds: ReadonlySet<string>,
): void
export function assertGreenlightCraftLead(craftCount: number): void
export function greenlightFreelancers<T extends AssignmentPerson>(
  engaged: readonly T[], facts: GreenlightEmploymentFacts,
): readonly T[]
```

Generic person results preserve the complete actual caller type: actual actions
receive Talent, including salary/skills/history, without casts or a fabricated
Talent/Production. The future trace owner may pass genuine narrow person views.
Header facts retain actual project/session records and the exact existing facts
matcher; no unassessed Ready, made-up screenplay or audition result is admitted.
These read-only views are not new save validators or authority to manufacture facts.

`requireGreenlightHeader` moves actions332–390 in their current order: managed
assessed Ready/project facts, existing-session acknowledgement, legacy-project-ID
refusal, founding, concept existence, genre agreement. It returns the actual
concept/project used later by commit. Operations mode does not enter this gate:
legacy DEVELOPMENT plus managed OPERATIONS remains lawful direct-stock admission.
Managed development cannot use that shortcut. Existing incomplete auditions block;
an absent session does not make audition mandatory. Do NOT import the primary-Actor
audition gate (`castingSessions.ts144`) into assignment eligibility.

`resolveGreenlightStaffing` moves actions393–447: person existence and the exact
ROLE_DISCIPLINE has-profile check, cast uniqueness, then all-role uniqueness in
the current writer/director/craft/cast diagnostic order. Its engaged order is the
separate existing director/cast/craft order. Writer credit remains in the resolved
result and same-film uniqueness, but never enters engaged occupancy or labour.

`assertGreenlightStaffingIdle` replaces only473–478. The caller still builds the
busy set at470–471, AFTER role/uniqueness checks, using the actual production-company
plus active-writing owners. Do not eagerly build every fact at function entry:
`activeScriptWriterAssignments` (scriptDevelopment689) itself throws when an
active project's concept is absent; moving that read earlier changes refusal
precedence on malformed input.

Keep the actual forecast/production-ID calculation where it is. ONLY inside the
existing `economyEngaged(state)` branch at540 call `assertGreenlightCraftLead`
before computing market facts, then call `greenlightFreelancers` with the actual
current contracted IDs and exact `freelancerMarketIds(state)` result. This second
helper validates every engaged seat and returns only the freelancers, in the
original engaged order. Existing `freelancerFee`, ledger entries, fee rounding,
solvency and cash arithmetic stay in actions; iterate that ordered return without
charging the credited writer. Legacy open-pool salary semantics remain unchanged.
No post-forecast refusal is moved ahead of forecast in this extraction.

## Commission law: share the small guard, not greenlight's busy set

The existing private `requireCommissionableWriter` at2069 is also a small reusable
validation owner. Move its guard sequence into the same lower module using lazy
read-only fact access solely to preserve current read/refusal ordering:

```ts
export type CommissionWriterFacts<T extends AssignmentPerson> = Readonly<{
  foundingOpen: boolean
  talent: readonly T[]
  isCurrentlyContracted: (personId: string) => boolean
  busyIds: () => ReadonlySet<string>
}>
export function requireCommissionableWriter<T extends AssignmentPerson>(
  facts: CommissionWriterFacts<T>, writerId: string, verb: string,
): T
```

Body order stays founding → exact person → writing profile → current contract →
broad busy set. The callbacks expose immutable facts, not arbitrary owner execution
or action/replay callbacks. The actual action wrapper binds `isContracted(state,id)`
and `busyTalentIds(state)`; the future trace owner binds certified admission-week
facts. Do not compute broad busy before the contract guard. Existing pool commission,
original commission and writer-pooling call sites2127/2210/2309 keep their order,
verb labels and exact errors. Move common requireTalent/requireRole internals once;
the action's remaining raw lookup uses at2250/2634 can import the same lookup.
Do not replace `requestScriptRewrite`'s separate2400 checks with commission law:
that would add new founding/person/role checks to a different verb.

Commission uses the broader `busyTalentIds`: production + all active pooled writing
+ rival-industry + active contracted research seats (employment125–169). Greenlight
explicitly uses only production + active writing. Preserve this factual difference.
There is a second layer: freelancerMarketIds383 → signableUniverse356 uses broader
busy and rival employment. Thus a contracted researcher follows greenlight's narrow
busy gate, whereas an uncontracted person still needs the actual broader-filtered
current freelancer market. One merged availability set would alter existing law.

Contract IDs must come from actual half-open current contracts (`activeContract`,
employment91), not all historical contract rows. Freelancers are actual current
market membership, not every idle/free agent or a guessed future rotation. This
extraction creates no renewal, poach, rival release or future employment entitlement.

## Call sites and unchanged commit owners

- `applyGreenlight`: header → resolved staffing → current narrow busy check;
  existing forecast; engaged craft and labour eligibility; unchanged fee/solvency,
  participants, production append, exact workflow allocation and project link.
- `applyGreenlightScriptProjectNow`2499 still copies screenplay facts into the
  command and invokes this same `applyGreenlight`; no separate planning/queue
  admission algorithm. Its outer2442 door keeps unknown-project and duplicate-
  queued-project checks before the ordinary pipeline.
- `commitQueuedIntent`1859 and `queueAdmission.ts52` stay unchanged. Actual dequeue
  revalidates using the same action at the arrived week; head-of-line priority and
  capacity-only `QueueableCapacityRefusal` remain their owners. A staffing failure
  is never converted into waiting. Queued intents hold no people, cash or identity.
- Writing completion/Review/Ready, pooled persisted due dates, script-to-production
  linking, casting completion/acknowledgement and all strict validators remain in
  their existing modules. A helper return is not a committed production or a new
  opportunity; current inProduction screenplay and film remain one path.

Proposed initial production scope: new productionAdmission.ts plus actions.ts only.
No employment/queue/schema/version/validator refactor is needed. Inspect the narrow
runtime import graph before authorizing: scriptDevelopment already reaches the
pure productionQueue module, but not queueAdmission/actions; do not introduce a
back-edge via the new helper. Avoid migrating projections or rival policy merely
because they have similar-looking availability displays.

## Independent discriminants and bounded regression selection

Author tests before implementation; literal owner-law expectations, not outputs
computed by the new helper. Preserve exact errors/ordering where existing callers
publish them. Core cases:

1. Genuine non-primary actor with acting profile may fill a cast slot; missing
   acting profile/unknown ID refuses. Writer/director/craft use their own profile
   presence. Duplicate cast and writer-as-cast/director/craft refuse in current
   order. Generic marker/full-Talent output survives without any partial-as cast.
2. Ready writer currently drafts a second real screenplay: credit remains allowed
   and uncharged; engaged actor/director/craft with an actual writing or production
   hold refuses. Every pooled active writer is busy, Review/Ready credit is not.
3. The same caller-supplied research/industry fact is NOT added to the narrow
   greenlight busy set, but commission remains blocked by broad busy. Separately
   distinguish current contracted person from an uncontracted non-market person;
   do not infer freelancer eligibility from the narrow greenlight set.
4. Engaged exactly-one-craft and actual contracted-or-freelancer checks; writer
   exempt only from labour, never identity/discipline/same-picture uniqueness.
   Exact contract end boundary refuses unless real current freelancer membership
   permits that seat. Legacy mode retains its preexisting craft/salary behavior.
5. Managed assessed Ready and matching writer/concept/shape/promise are mandatory;
   existing audition review is not complete until acknowledged; no session is a
   lawful direct package route. Legacy-development/managed-operations stays legal.
6. Refusal precedence: header before people; identity/discipline/uniqueness before
   busy-owner read; commission contract before broad busy read; greenlight craft/
   labour after forecast. Independent transparent call-through observations can
   prove staging without replacing actual eligibility or forecast results.
7. Pure guards on deeply frozen inputs: no ID/RNG/root/queue/receipt/cash mutation.
   Actual capacity-only action still queues with zero production/labour/ledger
   commitment, then genuine dequeue uses the same guard and revalidates changed
   eligibility rather than trusting the earlier queue payload.

Reuse113's explicitly classified routes: `_p04a2WriterCreditFixtures.buildScenario`
for real Ready/next-draft credit; script-actions-lifecycle for due/status/link;
m3-pool-busy for every pooled writer; `_m4Fixtures.contendedGreenlightStudio` for
real Ready/audition/free crew. Keep controlled capacity/contract modifications
labelled; they are not new genuine campaign histories. Research/industry conjunctions
still need honest independent construction or detached fact-level guard tests.

Initial regressions: actions.test.ts; p04a3-greenlight-law.test.ts;
script-projects-actions.test.ts; c2a-m3-rename-and-pooling.test.ts; applicable
casting session and queue-admission tests; both strict typechecks. Add only the
specific fixture-neighbour files needed by the independent author, serialize
runtime, and preserve historical goldens. No new eligibility or cash policy is
proposed. Actual owner-trace enumeration/coverage, admission-week employment proof,
before-replay charging and natural performance remain separate work after extraction.

DOCUMENT FROZEN. No runtime, probe, typecheck, Git/network or descendant was used.
