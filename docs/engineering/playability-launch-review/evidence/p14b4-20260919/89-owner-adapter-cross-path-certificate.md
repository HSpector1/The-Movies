# Owner adapter: same-execution certificate across picture paths

2026-09-20. Bounded read-only design finding after published kernel checkpoint
`a8d277d91ccc323fe976d7cbb74940046ab0f22c`. No source, tests,49 contract or
runtime was changed. This is an engineering representation recommendation,
not adopted gameplay policy or owner-adapter acceptance.

## Finding and minimal counterexample

Compatible person/resource intervals are necessary but NOT sufficient evidence
that separately enumerated calendars are the SAME managed owner execution.
Interface49 already requires the adapter to certify relevant cross-path
interactions. The detached kernel correctly trusts that precondition; this is
an unsolved construction obligation at the adapter, not a kernel regression.

Take one available stage, older waiter A and younger waiter B at countdown7,
and W at countdown4 finishing shooting on that stage. People are disjoint;
other required capacity and legal prerequisites are available. In the current
sweep, A first waits, W wraps/releases the stage, and the scan MUST restart.
A then gets the stage; B remains waiting. The actual body is
`operations.ts:1615–1806`; the exact three-workflow regression at
`tests/c2a-m4-release-law.test.ts:330–343` pins A rehearsal/B preProduction.

A collection with W releasing, B holding the stage next, and A holding it after
B has no physical overlap. Nevertheless it cannot be the joint execution from
that state: it reverses mandatory priority. A delayed-A projection from a
different contention context and an early-B projection from a solo context
cannot be joined merely because their intervals fit. This example does NOT
claim the delayed-A projection was legal with the same complete initial state.
That missing common context is precisely the flaw.

Conversely, two solo earliest calendars can overlap even though the joint sweep
lawfully queues one behind the other. Rejecting their union does not prove no
joint calendar exists. Mandatory fixed-point allocation must generate the dates;
the adapter cannot arbitrarily slide an existing take or choose a lower-priority
winner. The same issue applies to shared Set wear/binding, setup admission and
selected technology chains.

## Recommended refinement: explicit certified joint traces

Prefer a declared logical trace domain to late opaque callback/retry. The smallest
sound refinement needs a trace's COMPLETE occupancy context as well as its key:
adding `jointTraceKey` to alternatives alone does not stop unselected mandatory
workflows from disappearing.

Illustrative internal representation, requiring its own reviewed interface before
implementation (not a change to49 here):

```ts
type JointOwnerTrace = Readonly<{
  traceKey: string
  ownerFactRefs: readonly string[]
  fixedHoldReplacements: readonly HoldReplacement[]
  additionalHolds: readonly Hold[]
  alternatives: readonly TracePictureAlternative[]
}>
type TracePictureAlternative = PictureAlternative & Readonly<{
  jointTraceKey: string
}>
```

Each trace is one whole legal command/staffing choice sequence, replayed through
the SAME allocator/sweep on all affected genuine clock records/workflows. It
includes every committed/background workflow and any selected lawful future
work, not only beneficiaries earning credits. At most one realized trajectory
of a physical `pathKey` appears within one trace; that path identity survives
across trace variants. The trace key is an ephemeral logical compatibility fact,
never a facility, person hold, new physical resource or persisted production ID.

In this trace-scoped mode, all trace holds and exact fixed-hold suffix replacements
are compulsory once the trace is chosen, independent of credit selection. Preserve
the49 immutable-prefix/ownership checks and other-owner holds. Store interval
facts once in the trace ledger; picture alternatives in this mode have empty
`additionalHolds`/`holdReplacements` so selecting an event cannot double-charge or
erase its occupancy. The owner fact references link each picture/calendar to
the complete trace. This is an explicit representation distinction, not a silent
reinterpretation of49's existing optional-alternative mode.

Subset selection then has a clear meaning: select which real events pay planning
demands, NOT which committed pictures happened. An already-filmed continuation
is still represented with a null event; its actual certified release occurs in
the compulsory trace ledger and earns no credit. The returned positive wrapper
must name the trace key/fact references as well as its ordinary credit witness,
so required background execution cannot vanish from the certificate.

## Operational construction and global proof/search

1. Enumerate only actual caller-controllable, finite legal choices; automatic
   allocation/order is not a choice. For each branch, retain all relevant
   mandatory activity and replay the authoritative joint owner step. Preserve
   player versus rival command order, actual external occupancy, setup resolver,
   release authority, bindings and future holds. A finite fixed-choice ordinary
   pipeline has a constructible trace now; it is not structurally condemned to
   permanent UNCERTIFIED.
2. Create fresh event/technology collectors for EACH branch and owner sweep.
   All productions of that studio in the sweep share that branch's collector;
   sibling branches never do. Carry its returned technology root only within
   the branch. `createProductionTechnologyPolicy` reads operational adoption and
   installations at its supplied state's week (`technologyProduction.ts:13–25,
   54–92`), restricts stage AND Post, then locks at actual shooting entry. Do
   not independently compute per-picture locks against one stale live snapshot
   or omit the policy. Set wear and setup provenance also evolve jointly.
3. Extract complete trace intervals and first-take facts from returned owner
   transitions. Preserve pre-increment sweep/lock timing versus arrived-week
   durable take timing (`tick.ts:1102–1110`), and the source actor/cast/window
   predicate. The trace remains detached planning evidence, not persisted
   Production, forecast, film, event or promise outcome history.
4. Search across traces as EXCLUSIVE logical branches. Within each trace, use
   the existing class/window/person-path counter matching on its actual events,
   checking the compulsory ledger once. Do not concatenate alternatives from
   different traces into a physically-compatible free mix.
5. Optimize priors GLOBALLY: use the union of distinct existing-event boundaries
   across the relevant trace domain as the COMMON cumulative-profile index.
   First solve all prior/debit demands across every trace and every equivalent
   seat-credit assignment, maximizing the same aggregate tuple. Then probe X
   and B across every trace under THAT optimum. A per-trace optimum is not the
   protected optimum; two calls to the current public kernel cannot simply have
   their classifications combined. Factor/reuse its internal profile/matching
   probes behind this explicit domain extension rather than copy the algorithm.
6. Keep all equivalent maximizing traces and assignments searchable. Failed
   protected X still needs an UNOPTIMIZED joint search across the entire domain.
   B, first-X-existing and eight-week slack must belong to ONE certified trace
   and ONE credit witness. Prior-profile protection remains the existing bounded
   implementation hypothesis, not a beneficiary selection policy.
7. Exhausting a COMPLETE owner trace domain plus complete finite matching can
   prove failure/optimum. A lawful B trace can prove a positive with incomplete
   future choices only if the FULL prior optimum is independently proved, e.g.
   a sound saturated bound over a complete relevant existing domain. A best
   observed trace profile is not that proof. Missing legal choices/interactions
   or unfinished enumeration is explicit UNCERTIFIED, never a fabricated maximum.

This extends the search's declared logical domain; it does not require importing
GameState/actions/tick into the detached kernel. The future owner producer owns
the real replay and provenance, and the lower matcher receives immutable facts.
The pending two-file clock extraction remains valid and independently releasable.

## Budget, alternative approach and discriminating tests

The existing32/64/1024/200000/220 limits remain GLOBAL, not per trace. Count all
trace alternative occurrences/variants against the alternative budget (including
repeated physical paths in different traces), bound empty/context-only trace
rows too, and charge trace/hold normalization. Charge owner enumeration/replay
work canonically before it can exceed the shared budget; a conservative safe
owner-step bound or explicit accounting is required, not unmetered replay inside
a callback. Canonical legal-choice order controls cap disposition. No per-week
loop on unbounded saved windows; validate/clip the finite analysis span first.
This is finite bounded work, not a claim that all legal trace domains are small.
Ordinary fixture measurements must establish useful coverage, not hide a missing
producer forever behind the uncertainty label.

A leaf-level joint-admissibility oracle could also be sound, but it must run
inside EVERY prior-optimization and target search, share canonical work charging,
distinguish certified/refuted/unknown, and continue after rejecting a leaf.
Validating only the first returned witness then returning IMPOSSIBLE is wrong.
Removing a rejected alternative globally is also wrong: it may work with another
combination. Moreover owner admissibility is not monotone under adding background
activity, so current physical-search pruning of uncredited/no-replacement
alternatives would need re-review. A retry wrapper without an explicit domain,
global-profile proof and safe pruning cannot repair these issues. Certified
trace branches make the dependencies and completeness obligation inspectable.

Independent discriminants for the eventual refinement: the A/W/B priority
counterexample; two solo-conflicting paths with a legal jointly queued trace;
an uncredited mandatory workflow whose future stage hold survives credit subset
selection; opposite per-trace versus global prior optima/equivalent optima; null
take release context; branch-local sound locks/Set wear; trace/input permutation
and shared-cap exhaustion. These are new authoring obligations, not tests run by
this task or reasons to delay the separate mechanical clock extraction.

DOCUMENT FROZEN. No implementation or acceptance claim.
