# Week-208 Roster Wall Research Contract

Status: autonomous-marathon research contract; behavior-neutral instrumentation only

Date: 2026-08-14

Clean code authority: `8b7e95eb92f6f809522a595b4b458d4f19e26852`
(`fix(save): preserve historical cash migration`)

Authority base: accepted D-17B Owner rulings; D-16 Owner rulings; D-11 employment law; closed
Development & Casting Annex V1; canonical Lessons Learned; and the Operation Hollywood engine
bridge

## Purpose and governing boundary

Determine what the synchronized founding-roster renewal event actually is, which part is ordinary
cash pressure, which part is deterministic controller ordering or player planning, whether a legal
choice can distribute that pressure, and whether the result recurs rather than disappears. The
study begins from exact validated Week-196 SaveFileV11 entries and observes the existing contract,
payroll, expiry, production, and cash law without changing it.

The Owner has authorized investigation of the Week-208 roster wall. The investigation must precede
any repair. This contract authorizes a generated observatory, exact-save harvests, deterministic
continuations, one-boundary reference shadows, and synthetic mechanics fixtures. It authorizes no
production behavior, UI, save-schema, tuning, or asset change.

D-17B remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

The Week-208 synchronized roster wall, cash runaway, top-studio economic immortality, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal
G12 timing remain open. This study may classify evidence about those residuals; it may not conceal,
reclassify, or claim to close them.

No financing, loan, bailout, restructuring, acquisition, bankruptcy ladder, grace grant, free
extension, arbitrary cash injection, or reverse-engineered cash sink may be proposed. The closed
Annex is a separately proven capital choice, not a roster-wall cure or calibration dial.

## Current authoritative law

- Founding offers permit exactly `52 / 104 / 156 / 208` weeks. A contract is active over the
  half-open interval `startWeek <= week < endWeekExclusive`.
- The renewal window is the final 12 legal weeks: `0 < endWeekExclusive - week <= 12`.
- Renewal is an explicit player action. It replaces the active contract at the current week, uses a
  fresh deterministic quote, commits the selected term, and immediately charges one signing bonus.
- The ordinary-player solvency gate rejects a voluntary renewal when the bonus is not affordable.
  Negative cash may continue; it is not bankruptcy, but it blocks further voluntary commitments.
- Every still-active contract receives its final payroll before the advance into expiry. Expiry then
  removes the contract and returns the talent to the free-agent set in deterministic state order.
- Weekly overhead is the existing base amount plus the existing per-employee amount. Expiry can
  therefore sharply reduce both payroll and employee overhead; the base overhead remains.
- `economyEngagedEver` is monotonic. An expired roster may not revert the studio to legacy economy
  law.
- A player may renew, decline, wait, or release early. Voluntary decline or release is not an
  involuntary wall.
- SaveFileV11 may carry the narrow historical cash/ledger checkpoint authorized at clean repaired
  commit `8b7e95e`. Reconciliation must use either native full history or that exact checkpoint plus
  the ordered suffix. The observer must never synthesize or move the checkpoint.

## Frozen questions and hypotheses

- **H1 — synchronized obligation:** a 208-week founding cohort creates a concentrated renewal quote
  obligation whose affordability differs materially from smooth weekly burn.
- **H2 — insolvency substrate:** if no legal week in the 12-week window can afford a renewal, order
  and better reminders cannot repair that owner; the primary substrate is pre-existing liquidity.
- **H3 — ordering boundary:** when some but not all renewals are affordable, the deterministic order
  can decide role coverage and downstream staffability. Retry totals alone must not be called a
  wall.
- **H4 — planning boundary:** legal earlier action can help only when a quote was affordable at an
  earlier legal boundary and later became unaffordable. Moving an impossible action earlier is not
  a repair.
- **H5 — displacement and recurrence:** staggering work inside the current 12-week window or using
  mixed legal terms may distribute one boundary, but shifted obligation, retry load, later expiry,
  and Week-428 recurrence must remain visible.
- **H6 — facility separation:** vacant versus real Annex estates may have descriptively different
  cash and pipeline histories, but no Annex pair establishes a roster-wall causal repair.

## Experiment design

### Canonical maximum-term cohort

The primary entry corpus is the Cartesian product:

`25 canonical facility seeds x 3 operating policies x 2 estates = 150 Week-196 entries`

The operating policies are the reviewed `direct-package`, `development-casting`, and
`scaled-two-team` controllers. Every founding contract uses the existing 208-week option. The
estates are:

1. `vacant` — the real expansion parcel remains vacant; and
2. `annex-start-week-0` — the real Annex is committed at Week 0 through its public action, advances
   through its authoritative construction lifecycle, and thereafter operates normally.

Both are real production states. There is no research-only facility mutation. Estate results are
separate descriptive strata because the Annex capex and admitted workflow can cause ordinary policy
and RNG divergence. No same-seed estate delta may be labelled causal roster-wall evidence.

Each campaign runs its existing film policy through Week 196 without renewal action. At the visible
Week-196 arrival, the harness must export, reload, validate, and re-export the exact SaveFileV11.
That immutable save—not an in-memory reconstruction—is the common entry for every continuation arm
for the same seed, operating policy, and estate.

### Founding-term player-policy arm

A separate descriptive corpus uses the same 25 seeds and three operating policies with the vacant
estate only. Founding applicants are sorted by canonical talent ID and assigned terms round-robin
from `52 / 104 / 156 / 208`. The current retry-all maintenance policy applies at every legal
renewal window throughout prehistory and continuation, always choosing a 208-week renewal term.

This arm asks whether legal founding choices plus current maintenance produce durable
desynchronization after policy feedback. It is not exact-entry paired to the maximum-term cohort,
must be labelled `descriptive-after-policy-feedback`, and runs through at least Week 428. Report its
renewal cadence, total signing-bonus obligation, unique owners, retry work, retained role coverage,
and every moved recurrence. It may not claim that changed founding terms alone caused a downstream
cash or production result.

### Continuation policies

Every maximum-term continuation starts from a fresh byte-identical load of its Week-196 entry. Its
film controller is unchanged. Only the renewal decision layer varies:

| ID | Exact existing-law policy |
| --- | --- |
| `C0-no-renewal` | Attempt no renewal. Labelled control for expiry mechanics only, never a recommendation or affordability failure. |
| `C1-current-retry-all` | Each week, attempt every renewal-open contract in `endWeekExclusive`, then talent-ID order; use 208 weeks; retry each rejection on every later legal week. This reproduces current observatory policy. |
| `C2-cheapest-bonus-first` | Each week, sort renewal-open contracts by current quoted 208-week signing bonus, then talent ID; renew/retry all in that order. |
| `C3-role-coverage-first` | Each week, choose only from player-visible role and quote facts. Optimize lexicographically: satisfy the complete founding minimums; then maximize roles covered; then headcount; then minimize total signing bonus; then talent IDs. Attempt the chosen deterministic order with 208-week terms and retry legal rejections. |
| `C4-last-legal-role-first` | Use the C3 order, but act only in each contract's last legal week. |
| `C5-spread-role-first` | Compute C3 role priority for the cohort of `n`; assign target week `196 + floor(i * 12 / n)` in priority order; attempt no earlier than the target and retry every rejection through expiry. Use 208-week terms. |
| `C6-mixed-term-role-first` | Use C3 role priority, but assign renewal terms round-robin `52 / 104 / 156 / 208` in canonical selected order; retry legal rejections. |

All seven policies continue Week 196 through Week 260. `C1`, `C5`, and `C6` also continue through
Week 428. The long horizon must capture C1's renewed-cohort expiry boundaries at Weeks 404–415 and
at least 12 weeks after the latest arrival. C5 and C6 must expose whether their apparent relief is
merely displaced or creates repeated renewal churn.

The observer may compute an optimal C3 subset because it uses the exact bounded cohort and only
facts already available to the player: primary role, minimum coverage, current quote, and cash. It
may not use hidden ability, future reception, future market composition, or future cash.

### Read-only timing shadows

At Weeks 156, 182, and 196—respectively 52, 26, and 12 weeks before the founding cohort's Week-208
expiry—capture a read-only reference shadow. The Week-196 shadow is the existing legal-window
boundary; Weeks 156 and 182 are deliberately outside it.

For each contract, record the quote available from the existing pure offer function, aggregate
cohort obligation, cash, runway/burn facts, active commitments, and the earliest later legal week
at which the unchanged campaign could actually afford the same intended renewal. A shadow never
calls an action, edits the window, moves a contract, charges cash, consumes RNG, or continues as a
counterfactual campaign. The 52/26/12 labels are warning horizons, not proposed renewal windows.

### Synthetic mechanics fixtures

Deterministic fixtures isolate engine mechanics from 260-week policy feedback. Cohort sizes are
exactly `1`, `7`, and `13`, with explicit role compositions and stable talent IDs. For each cohort,
test cash at these named boundaries:

- `-1` and `0`;
- `minimum single quote - 1` and exact `minimum single quote`;
- `minimum full role-coverage subset - 1` and exact role-coverage cost; and
- `all cohort bonuses - 1` and exact all-cohort cost.

Every threshold is derived from the fixture's current quotes, not hard-coded dollars. When a named
threshold is undefined—for example a one-person cohort cannot satisfy all founding roles—the row is
retained as `not-applicable` with the missing roles. Fixtures cover all C0–C6 order/term semantics,
half-open expiry, final payroll, exact signing-bonus count, free-agent transfer, and no-RNG renewal.
They are `mechanics-fixture` evidence only and may not be pooled with campaign prevalence.

## Required taxonomy

Every result must use these terms exactly:

- **renewal pressure:** at least one active contract is renewal-open or at least one renewal quote
  is due under the measured policy;
- **unique rejected owner:** one talent/expiring-contract identity with one or more rejected renewal
  attempts; distinct from retry attempts;
- **retry attempt:** one rejected public action on one legal week;
- **partial cohort wall:** at least one intended cohort renewal is rejected or expires while at
  least one intended cohort member is retained;
- **full involuntary cohort wall:** zero intended cohort members are retained at expiry, at least
  one public renewal was attempted in a legal week, and no voluntary release or no-renewal policy
  caused the result;
- **contract-role-coverage loss:** post-expiry active contracts fail one or more authoritative
  founding role minimums; report the missing roles and counts;
- **package staffability blocker:** an intended legal package lacks required contracted/freelance
  talent under the existing availability law;
- **package affordability blocker:** a staffable intended package fails the existing film
  affordability gate; never combine this with staffability;
- **absorbing no-decision state:** `cash < 0`, no active contracts, no active theatrical receipts,
  and no currently affordable voluntary action under the exhaustive existing action set.

The C0 control can show attrition, expiry, and pipeline consequences, but by definition cannot count
an involuntary wall. A studio with zero contracts is not automatically absorbing. A rejected owner
with 12 weekly retries counts once as an owner and 12 times as attempts; no pooled retry headline
may replace the owner denominator.

## Evidence artifacts

The generated ignored directory is `out/week-208-roster-wall/`. A complete artifact contains:

- `manifest.json` — experiment matrix, source identity, constants, hashes, and row counts;
- `entries.jsonl` — one immutable entry manifest row per harvested Week-196 save;
- `entries/<entryId>.save.json` — the exact canonical SaveFileV11 payload;
- `rows.jsonl` — all entry, weekly, intent, boundary, shadow, fixture, and paired rows;
- `summary.json` — machine-readable aggregates and all denominators;
- `summary.md` — generated human-readable tables and bounded interpretation; and
- `sha256.json` — relative path, byte length, and SHA-256 for every other artifact file.

`out/` remains ignored. No generated row or save enters Git. Committed harness code is the only
artifact generator; hand-edited summaries are not evidence.

### Common row envelope

Every row includes:

```text
schemaVersion: "roster-wall-observer-v1"
recordType
mode: "current" | "player-policy" | "reference-shadow" | "mechanics-fixture"
experimentId
seedSetId
seed
operatingPolicyId
estatePolicyId
foundingTermPolicyId
continuationPolicyId
horizonWeeks
source: { branch, commit, tree, worktreeDirty: false, runtime, saveVersion: 11 }
initialSaveHash
entryId
entryWeek
entrySaveHash
entryStateHash
week
```

Non-applicable dimensions are explicit `null`, never omitted or filled with a misleading default.
Every ID is deterministic from canonical dimensions. The source commit must be `8b7e95e` or a later
clean harness-only descendant whose production source tree is proven behavior-identical to it.

### Record schemas

The TypeScript schema may group fields, but every serialized record must contain the following
truth:

- **`entry`:** full ordered contract cohort with talent ID, primary role, start, end-exclusive,
  term, annual salary, weekly salary, signing bonus and current 208-week renewal quote; studio cash;
  RNG state; `economyEngagedEver`; complete ledger/checkpoint reconciliation; all active receipts
  and commitments; exact construction parcel/project/facility state; role coverage; state/save
  hashes; and the immutable entry file hash.
- **`weekly`:** state/RNG hash; cash; full reconciliation components and delta; active contract IDs
  and role coverage; renewal-open owners; quoted obligation; scheduled and ledger payroll/overhead;
  signing-bonus rows; theatrical receipts; production/script/casting/package counts; exact staffing
  and affordability blockers; free agents; construction state; and exhaustive ledger rows appended
  during the observed transition.
- **`renewalIntent`:** deterministic intent ID; talent/contract ID; target and actual week; order
  rank; selected term; pre-action cash; exact offer fields; affordability result; accepted flag;
  exact rejection reason; post-action cash; matching signing-bonus ledger index/row or `null`; and
  RNG before/after.
- **`boundary`:** relation (`warning-52`, `warning-26`, `window-eve`, `window-arrival`,
  `expiry-eve`, `expiry-arrival`, `post-expiry-12`, `recurrence-window`, or
  `recurrence-post-expiry`); cohort retained/released IDs and role counts; payroll and employee/base
  overhead deltas; active receipts; package staffability/affordability; and exact transition ledger.
- **`windowShadow`:** warning week; weeks to expiry; action legality; per-owner quotes; aggregate
  all-renewal and minimum-role-coverage obligations; cash/burn/runway; affordability now; earliest
  later legal feasible week or `null`; no-action state/RNG hashes; and an explicit
  `observationConsumedRng: false`.
- **`mechanicsFixture`:** fixture ID; cohort/role composition; derived threshold identity and value;
  selected policy; every intent and expiry outcome; final role coverage; payroll/overhead ledger;
  and expected/actual invariant fields.
- **`pair`:** one exact `entrySaveHash` shared by the compared C0–C6 arms; policy IDs; common entry
  facts; unique accepted/rejected owners; retry attempts; retained/released IDs; role coverage;
  obligation and signing-bonus totals; payroll/overhead/receipt/pipeline deltas; blocker deltas;
  final cash/state/RNG deltas; recurrence facts; and a causal-boundary label restricting the delta to
  renewal policy after the shared entry.

`summary.json` and `summary.md` report every numerator with its denominator, by seed, operating
policy, estate, continuation policy, cash-at-window stratum, and taxonomy outcome. They include
per-pair signs and distributions, not pooled means alone. Unique owners, action attempts, cohorts,
and runs occupy separate columns. Estate and mixed-founding-term results remain descriptive and
cannot enter the exact-entry paired table.

## Invariants and provenance gates

1. The implementation base is the clean repaired Annex authority `8b7e95e`. A later harness/docs
   commit records both its own commit/tree and the exact production authority. `worktreeDirty` is
   false in every accepted row.
2. `makeSaveV11 -> load/import -> makeSaveV11` is byte-identical at every entry. Entries are written
   once, hashed, then treated as immutable. Every continuation loads a fresh independent copy.
3. The initial save hash, entry save hash, entry state hash, contract cohort, cash, ledger,
   checkpoint, construction state, and RNG reconcile before any arm begins. Every exact paired arm
   shares the same `entrySaveHash`.
4. The observer and policies use only whitelisted player-visible reads and public `applyActions` /
   `tick`. They may not edit cash, contracts, quote inputs, free agents, facilities, construction,
   ledger, clocks, pipeline, or RNG. Synthetic fixture construction is isolated, labelled, and
   tested; fixture state never enters a campaign row.
5. Contracts, intents, ledger entries, summaries, and JSON object keys use specified canonical
   ordering. Running cash follows ledger array order; no sorting may rewrite ledger chronology.
6. Quote, observation, sort, optimization, and renewal consume no RNG. An accepted or rejected
   renewal leaves RNG unchanged. Later film-policy RNG divergence is reported, not normalized.
7. Half-open activity and final payroll are exact: a contract active in Week `E-1` is charged once
   on the advance to `E`, then expires. Every accepted renewal emits exactly one matching
   `signingBonus`; every rejected renewal emits none.
8. Cash reconciles at every row to either `INITIAL_CASH + sum(all ledger)` or the authoritative
   SaveFileV11 checkpoint cash plus the ordered post-checkpoint suffix. Checkpoint fields and prefix
   are immutable. Scheduled payroll/overhead/receipts reconcile exactly to transition ledger rows.
9. Payroll and overhead remain separate. Base overhead, per-employee overhead, payroll, renewal
   bonuses, production commitments, receipts, and Annex capex each retain their existing kinds and
   accounting homes. Annex capex and estate effects are reported separately from renewal cost.
10. Voluntary C0 non-renewal, explicit decline, and early release cannot count as a wall. Renewals
    rejected by solvency, attempts skipped by a policy, staffability blockers, and film
    affordability blockers remain separate.
11. `economyEngagedEver` remains true across zero-roster continuations. The observatory must reject
    any row that silently falls back to disengaged/legacy economics.
12. Every claimed absorbing no-decision state is proven by an exhaustive public-action probe and
    the absence of active receipts; negative cash or empty roster alone is insufficient.
13. The ordinary engine run with observation enabled must serialize byte-identically to the same
    policy run with observation disabled.
14. All generated evidence stays under ignored `out/week-208-roster-wall/`; no wall-clock time,
    absolute local path, or unordered filesystem traversal enters an artifact.

## Player-view acceptance

This research remains behavior-neutral, but its conclusions must be understandable in ordinary
player language. The generated summary must provide, per representative run:

- what the player could see at the 52-, 26-, and 12-week warning horizons;
- the exact renewal obligation and currently affordable subset;
- whether acting earlier inside the legal window was feasible;
- who was retained or lost, by role, and what package decisions changed afterward;
- the distinction between one rejected person and repeated weekly clicks;
- the payroll/overhead relief produced by attrition alongside the creative capacity lost; and
- whether any staggered strategy merely moved the next collision to a later named week.

No copy may call C3 optimal play in general, promise that staggering saves the studio, describe the
Annex as protection, or present a no-renewal control as recommended management.

## Replay and review acceptance

- Generate the complete artifact twice from the same clean authority. `manifest.json`,
  `entries.jsonl`, every entry save, `rows.jsonl`, `summary.json`, `summary.md`, and `sha256.json`
  must compare byte-identical.
- Provenance, entry identity, pair identity, cash, checkpoint, ledger, payroll, overhead, receipt,
  role-coverage, half-open expiry, signing-bonus, no-RNG, and observer-neutrality checks must have
  zero failures.
- Focused observer/fixture tests, the full repository suite, the D-16/D-17 harness suite, both
  TypeScript projects, production build, and `git diff --check` must pass.
- Independent reviews must cover core mechanics, harness/determinism/statistics, and
  player/economic interpretation. No unresolved P1–P3 may remain.
- Null, adverse, and noncausal results remain in the generated summary. A favorable retry reduction
  cannot override role loss, shifted obligations, recurrence, or an infeasible cash substrate.

## Decision gates

- **D1 — no feasible legal-week renewal:** if a rejected owner could not afford the intended quote
  on any legal week, classify insolvency substrate. Kill ordering/window/UI claims for that owner;
  do not invent credit, cash, or grace.
- **D2 — role order only:** if C2/C3 improve role coverage only within a fixed affordable subset,
  the maximum candidate is bounded planning/decision support. No salary, quote, or economy retune is
  authorized.
- **D3 — wider-warning evidence:** a warning/window proposal survives only when the exact same owner
  is affordable at a demonstrated earlier boundary and infeasible later, and the aggregate evidence
  does not merely displace equally material obligation. Read-only Week-156/182 shadows do not by
  themselves authorize earlier action.
- **D4 — recurrence:** if C1/C5/C6 reproduce a material wall or equivalent obligation at the moved
  Week-404–428 boundary, reject any claim that the strategy solves the wall. Report postponement or
  cadence change precisely.
- **D5 — mixed terms:** C6 survives as a research candidate only if it retains operational role
  coverage through measured production demand while disclosing added renewal frequency, retries,
  total signing bonuses, and guaranteed obligation. Reduced synchronization alone is insufficient.
- **D6 — Annex:** vacant/Annex differences are descriptive after capex, workflow, policy, and RNG
  feedback. They may motivate later stratified research but cannot authorize Annex tuning or claim
  facility causality.
- **D7 — behavior boundary:** any core, UI, save, or tuning candidate requires a separate exact
  implementation contract and explicit Owner authorization after reviewed evidence. This research
  can close with “no bounded repair justified.”

## Explicit non-authorizations

This contract does not authorize:

- changes to core behavior, UI, SaveFileV11, migration, replay, tuning constants, controller law,
  authored/procedural art, or Operation Hollywood;
- changes to contract terms/options, the 12-week window, offer/salary curves, signing-bonus
  fraction, payroll timing/amount, overhead, termination cost, solvency/affordability, founding
  budget, hiring/freelancer market, free-agent law, or expiry ordering;
- auto-renewal, grace periods, free extensions, discounts, escrow, installment plans, cash grants,
  refunds, insurance, loans, financing, bailouts, restructuring, acquisitions, bankruptcy, a
  failure ladder, or a hard game-over;
- a new cash sink, Annex price/duration/opex/capacity retune, a second Annex, a raised production
  ceiling, rival offers, morale, agents, buyouts, loan-outs, or distribution economics;
- treating retry attempts as unique owners, voluntary attrition as an involuntary wall, negative
  cash as bankruptcy, a shifted recurrence as closure, or descriptive estate/policy feedback as
  paired causality; or
- complete economy-balance, roster-wall, cash-runaway, or top-studio-immortality certification.

## Ignored output path

All generated material must live only at:

`out/week-208-roster-wall/`

The existing repository ignore rule for `out/` is authoritative. The harness must fail if asked to
write outside that descendant. It must refuse a dirty or wrong-branch accepted run, reject an entry
whose provenance/hash does not match the manifest, and never overwrite an immutable entry with
different bytes under the same ID.

## Implementation and verification gates

The behavior-neutral observatory implementation may checkpoint only when:

1. schemas, policy IDs, canonical ordering, player-view whitelist, fixture matrix, entry harvest,
   and path guard are committed and tested;
2. a smoke corpus proves fresh-load arm isolation, exact Week-196 SaveFileV11 replay, half-open
   expiry, one-bonus renewal, cash/checkpoint reconciliation, and observer neutrality;
3. independent core and harness reviews report no unresolved P1–P3; and
4. production-source diff against `8b7e95e` is behavior-neutral.

The research milestone may close only when:

1. all maximum-term, player-policy, recurrence, shadow, and synthetic-fixture arms complete from a
   clean committed observatory authority;
2. the complete artifact replays byte-identically and all invariant counters are zero;
3. summaries answer H1–H6 and D1–D7 with exact denominators and preserve null/adverse results;
4. independent core, statistical, and player/economic reviews report no unresolved P1–P3;
5. focused, full, D-16/D-17, TypeScript, build, and diff verification pass;
6. protected branches and accepted D-17B/Hollywood history remain untouched, generated output stays
   ignored, and the working tree is clean; and
7. closure either recommends one separately authorized bounded implementation contract or records
   that no current repair is justified.

Until those gates pass, the Week-208 roster wall remains an open measured residual and production
behavior remains exactly the clean repaired Annex authority at `8b7e95e`.
