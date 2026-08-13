# Facilities & Construction Research Contract

Status: autonomous-marathon research contract; no production behavior authorized

Date: 2026-08-13

Authority base: accepted D-17B Owner rulings; closed Production Operations V1, Script Projects V1,
Casting Sessions V1, and Studio Calendar & Capacity Board V1; D-16 Owner rulings; canonical Lessons
Learned; and the Operation Hollywood engine bridge

## Purpose

Determine the smallest facility/construction investment that follows from the studio the player can
actually operate now. This study must answer, before production behavior changes:

1. Which current facility capability becomes scarce under credible player workflows?
2. What additional capacity changes a real decision, hold, or throughput outcome?
3. What persistent construction lifecycle would make that capacity legible and saveable?
4. Which capital and operating costs arise naturally from that lifecycle, rather than from a target
   cash drain?

This is the required research boundary after Studio Calendar V1. It authorizes measurement,
counterfactual analysis, and a later implementation proposal. It does not authorize a construction
action, facility price, build time, recurring charge, save version, balance retune, or new lot art.

## Governing economic boundary

D-17B remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the Week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12
timing remain open. This study may measure those residuals but may not claim to close, conceal, or
reclassify them.

No financing, loan, bailout, restructuring, acquisition, forced bankruptcy, hard game-over, failure
ladder, tax, arbitrary upkeep tax, or reverse-engineered cash sink may enter a candidate. A price is
not acceptable merely because it reduces a long-run cash percentile. A facility must first provide
named capacity or workflow value; its costs must then be attributable to building and operating that
asset.

## Source research and retained design lessons

The official *The Movies* manual establishes the relevant reference pattern without supplying a
portable modern price model:

- a studio can begin with a ready-built lot or an empty lot;
- ordinary buildings take construction time unless the player explicitly enables an instant-build
  sandbox option;
- construction is a visible lot command, and negative cash blocks new sets and some facilities;
- an unowned, occupied, or unusable set visibly blocks filming; and
- builders, decay, paving distance, attractiveness, prestige, and repairs form additional management
  layers.

Primary source: [*The Movies* PC manual, pp. 2–3 and 9–11](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/7900/manuals/manual_english.pdf?t=1447351040).

This project retains the durable-capital, visible-build-time, physical-lot, and capacity-consequence
principles. It does not automatically copy builder dragging, decay, repairs, janitors, paving,
distance simulation, prestige, research unlocks, or historical prices. Those mechanics depend on
systems Project: Studio does not yet own and would turn a bounded capacity investment into an
unsupported maintenance game.

The repository's earlier D-12 source study is supporting historical context only. Its order-of-
magnitude facility figures are not production-price authority, use a different currency scale, and
may not be imported as if they were calibrated Project: Studio dollars.

## Current authoritative resource truth

Managed operations currently own this no-cost initial estate:

| Facility | Capability | Capacity | Current demand owners |
| --- | --- | ---: | --- |
| Development & Casting | `development-casting` | 2 | productions, screenplay work, casting sessions |
| Soundstage 7 | `soundstage` | 1 | productions |
| Soundstage 12 | `soundstage` | 1 | productions |
| Scenery Shop | `set-scenery` | 2 | productions |
| Post Building | `post` | 2 | productions |

The global production ceiling is two. Therefore soundstage, scenery, and post capacity each already
match the maximum current production slate. Development & Casting is structurally different: its
two slots are shared by production development/pre-production, screenplay drafting/rewriting, and
camera tests. It is the only current capability that can receive organic demand from more owners
than the production ceiling.

That structural observation is a hypothesis selector, not a result. The observatory must still
measure whether credible play creates material contention, whether a third slot changes outcomes,
and whether the benefit is understandable enough to sell as a professional tycoon decision.

## Frozen research hypotheses

The study tests these hypotheses separately:

- **H1 — organic bottleneck:** Development & Casting is the only current capability with material
  unmet demand under scaled managed play.
- **H2 — bounded marginal capacity:** a third Development & Casting slot reduces real rejected work
  and/or facility holds; a fourth slot must be measured independently and is not presumed useful.
- **H3 — no decorative expansion:** adding soundstage, scenery, or post capacity under the current
  two-production ceiling has no meaningful marginal operating value unless another authoritative
  mechanic creates demand.
- **H4 — capacity before economics:** the result can justify a facility lifecycle even if no tested
  capex/opex tuple is yet supportable. Lack of a price ruling must not be converted into a free
  production building or an arbitrary charge.
- **H5 — investment, not rescue:** any later candidate must be optional growth capital. It may not
  grant cash, bypass affordability, guarantee recovery, or become mandatory weekly maintenance.
- **H6 — honest physical identity:** if an annex is eventually proposed, its parcel, construction
  state, completed facility ID, reservations, Calendar rows, and Studio Lot depiction must remain
  the same identity end to end.

## Behavior-neutral observatory

The study adds a generated, ignored-output harness only. Production constants, live save schemas,
actions, ticks, UI, and authored assets remain unchanged.

### Paired capacity arms

For every seed and policy, run the same controller and horizon against:

1. the production initial estate;
2. a research-only configured estate with exactly one additional `development-casting` slot.

The hypothetical facilities exist only in harness state. They may use the already-supported
`configured` invariant policy, but they may not pass through a current SaveFileV10 writer, appear in
the player UI, or be mistaken for shipped construction. Every artifact row must encode the exact
facility configuration, policy ID, seed, horizon, and source commit.

At every rejected capacity-bound action or capacity-held transition in the initial arm, the harness
also performs a one-boundary shadow replay on a clone with that capability's one extra slot. This
isolates whether capacity admits the exact unmet intent before long-run policy choices or derived
film-stream identities diverge. The shadow result is evidence about that boundary only and is not
continued as a campaign.

Optional structural controls may add one slot to soundstage, scenery, or post. Those arms exist
solely to test H3; they do not authorize a menu. A fourth Development & Casting slot may be explored
only as a clearly labelled sensitivity after the primary paired corpus closes; it is not part of the
implementation recommendation gate.

### Credible policy families

At minimum, the corpus contains:

- a one-team direct-package studio that does not use optional camera tests;
- a one-team development studio that uses camera tests and keeps another screenplay moving; and
- a scaled two-team studio that uses the available script/casting loop while respecting the current
  two-production ceiling and real talent availability.

The controller must use public core actions and the real weekly tick. It must resolve exact current
decisions through owning legality, never edit a project, reservation, production, cash balance, or
ledger to manufacture progress. Research-only facility configuration is the sole permitted
counterfactual state change.

If a policy cannot perform desired work, the attempted legal intent is recorded with its exact
reason. The controller may not silently choose a different action and then report zero contention.

The primary horizon must reach at least the visible arrival at Week 260. Week-208 contract-expiry
clusters, renewal attempts and rejections, payroll release, and pipeline effects are reported as a
separate staffing stratum. Their correlation with facility pressure may be observed; the study may
not imply that extra facility capacity repairs the roster wall.

### Required raw measures

Each run records at least:

- slot-weeks available and occupied by capability, facility, and owner kind;
- weeks at full capacity and longest full-capacity streak;
- attempted screenplay commissions, rewrites, camera tests, and production transitions rejected or
  held for facility capacity;
- production hold-weeks by target phase and capability;
- screenplay, casting-session, greenlight, and release counts;
- time from commission to ready screenplay, greenlight, and release where the IDs correlate;
- current weekly payroll, base overhead, active-run receipts, and exact ledger-reconciled cash;
- delay exposure using the existing truthful consequence: payroll and base overhead continue during
  a hold; and
- paired deltas between the initial estate and each hypothetical capacity arm.

Utilization alone is not value. A full facility with no rejected intent or downstream consequence is
reported as saturation, not automatically as a bottleneck. Cash difference is an outcome, not proof
that a construction price should equal that difference.

### Reconciliation and determinism

- `studio.cash` must reconcile to `TUNING.INITIAL_CASH + sum(ledger.amount)` in every row, subject
  only to the already-documented founding recruitment-fund exception.
- Provenance must record observer schema version, source commit and tree/dirty state, runtime,
  current save version, initial-save hash, seed set, horizon, policy identity, operations mode,
  exact facility manifest/delta, `MAX_CONCURRENT_PRODUCTIONS`, and phase-duration identity.
- Every row is explicitly `current`, `counterfactual`, or `one-boundary-shadow`; no wall-clock value
  may enter a deterministic artifact.
- Occupancy must reconcile to the exact Studio Calendar slot union for the sampled state.
- For every capability and arm, occupied slot-weeks plus idle slot-weeks must equal configured
  capacity multiplied by observed weeks.
- The same seed, policy, facility configuration, and horizon must serialize byte-identical raw rows
  on rerun.
- Applying a research facility configuration and observing a state consume no RNG. Long-running
  arms may legitimately diverge in `rngState` after extra admitted work changes the number or order
  of ordinary release-time reception draws; that downstream divergence must be reported and is why
  one-boundary shadows, not paired cash deltas, carry the clean marginal-capacity claim.
- Enabling observation must leave the ordinary engine run byte-identical to the same run with the
  observer disabled.
- Aggregate claims must be reproducible from committed harness code and ignored raw rows; hand-edited
  summaries are not evidence.

## Lifecycle questions the study must settle

The later implementation contract may be frozen only after the evidence answers each question:

1. **Asset:** is the smallest useful investment a named Development & Casting annex, an expansion
   of the existing building, or no current facility at all?
2. **Parcel:** does it occupy the existing authored `expansion` pad, and is that one parcel enough
   for V1 without pretending the whole lot is placeable?
3. **Capacity:** exactly which capability and how many slots become operational?
4. **Clock:** on which visible week does construction complete, and does completion happen before or
   after that advance's script, casting, and production allocation?
5. **Accounting:** when is capex debited, when does any marginal operating charge begin, and which
   distinct ledger kinds and finance/recap buckets own them?
6. **Affordability:** does the existing `canAfford` law reject the full committed price atomically,
   with no debt or installments?
7. **Persistence:** what append-only project/parcel identity prevents reload, duplication, ID reuse,
   or completion-time ambiguity, and what exact SaveFileV11 migration preserves V1–V10 history?
8. **Presentation:** how do vacant, building, and operational states render from the authoritative
   lifecycle, including reduced-motion and non-lot access?
9. **Legacy:** how do migrated legacy-operation studios remain truthful without being granted a
   fictional managed estate or construction history?
10. **Economy claim:** what is measured decision evidence, what is only a candidate sensitivity,
    and which D-17B residuals remain open afterward?

## Candidate cost evaluation boundary

The observatory may evaluate candidate capex, duration, and marginal operating-cost grids after H1–H3
are measured. Every candidate value must be shown against existing named scales:

- current cash and `TUNING.INITIAL_CASH`;
- actual affordable film commitments from the same run;
- current weekly payroll and base overhead;
- annualized existing burn; and
- measured avoided hold cost or incremental throughput, without assuming either is guaranteed.

The study must publish the full candidate grid, including dominated and rejected tuples. It may use
break-even time as one descriptor, but may not select a tuple solely to hit a desired late-game cash
percentile. Any final exact number requires a separate implementation contract and an explicit
statement of its provenance and uncertainty.

## Explicit non-goals

- production behavior, save migration, new actions, ledger kinds, tuning constants, or UI controls;
- free placement, rotation, road/path simulation, land purchase, demolition, relocation, queues, or
  concurrent construction projects;
- facility quality, upgrades, decay, repair, maintenance condition, utilities, staffing, builders,
  janitors, morale, prestige, attractiveness, or research trees;
- sets, scene construction, locations, rehearsal systems, edit suites, reshoots, distribution, and
  exhibition;
- raising `MAX_CONCURRENT_PRODUCTIONS` or changing phase durations/allocation order;
- retuning film revenue, marketing, publicity, payroll, base overhead, talent contracts, or any
  accepted D-17B constant; and
- claiming complete economy balance.

## Exit gate

This research milestone closes only when:

1. the harness and its tests are committed;
2. generated artifacts are ignored and reproducible;
3. raw rows reconcile to ledger and Calendar truth;
4. paired results answer H1–H3 without hiding null or adverse findings;
5. independent core, harness/statistical, and player-experience reviews report no unresolved P1–P3;
6. the worktree is clean and protected branches are unchanged; and
7. a research closure either recommends one bounded implementation contract or records that no
   current construction mechanic is justified.

Until that gate closes, the Studio Lot expansion pad remains an informational placeholder and no
source behavior changes.
