# P08–P10 to P11 Handoff Contract


**Status:** PROVISIONAL — ACTIVE P08–P10 DEPENDENCIES
**Review state:** READY FOR CURRENT OPS PM REVIEW — LOCAL RECON INCORPORATED
**Implementation:** NOT AUTHORIZED FOR IMPLEMENTATION
**Accepted TypeScript base:** `2753e18ba8fb5f65b936c22cde9531646fecc6cd`
**Accepted Unity base:** `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`
**Starting protocol / projection / save:** `4 / 15 / V16`
**Starting schema:** `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Active stack:** `OPS-P08P10-20260905-01`; all active work is **UNSEALED FORWARD EVIDENCE**


## 1. Purpose

This contract prevents P11 from duplicating P08 History, P09 Construction or P10 People/Contracts. It records what P11 expects, what has actually been observed, and what must be refreshed after Owner acceptance.

## 2. Accepted P07 foundation

P11 inherits these accepted facts directly from P07:

- `FilmResult.productionId` is the immutable result/wire identity;
- title is currently resolved through `conceptId`, not separately frozen on FilmResult;
- participants and forecast are optional where captured;
- Critics, Audience and Business remain separate;
- Gross, Studio Revenue, direct film commitment and Contribution keep their accepted bases;
- active totals remain projected until the theatrical run settles;
- released films may have no physical Locate target;
- unknown exact-ID selection cannot be treated as proof merely because a workspace falls back to another row;
- existing studio events do not constitute a universal external event-receipt contract;
- permanent production-ID reservation through existing events must not be broken by retention/compaction.

## 3. P08 → P11

### P08 produces

- forward-recorded Studio History with an explicit recording boundary;
- Standing-change provenance and significance;
- sparse film/person/facility/studio historical links where producers exist;
- Administration/History routes and old-save absence language;
- exact event/subject identities under final accepted law.

### P11 consumes

- history coverage/provenance;
- exact routes to significant financial milestones and related film/person/facility records;
- Administration owner and retained-navigation grammar.

### P11 must not duplicate

- the signed accounting ledger or its reconciliation inside Studio History;
- Studio History root or significance;
- Standing change receipts;
- seen/unread simulation state;
- a second timeline;
- pre-recording history.

### Current evidence

At the coding-agent local recon snapshot, TS `908879a9c5fa73d2015985834e951db84c69ab8a` × Unity `685f113e480ee18ea242ad8a341e7710523f840f`, P08 Wave 2 had committed Save V17 `studioHistory`, exact Standing receipts, Projection 16, schema `sha256:85a6…` and a synchronized generated consumer. Unity Wave 3 was actively owned and dirty, so it was not tested or launched by the recon agent. The package is not technically sealed or Owner-accepted.

## 4. P09 → P11

### P09 produces

- endowed versus bare-lot regime;
- authoritative blueprint catalogue;
- exact placement/set quote with legality, cost, time, Opex onset, capacity and reasons;
- revision-bound commit intent and duplicate/stale safety;
- placement/project/facility/set identities;
- construction lifecycle, move, demolition, refunds and operational state;
- world bodies, site/facility route and optional Locate;
- normal-player first-film solvency evidence.

### P11 consumes

- exact current quote/receipt and route capability;
- immediate capex/cash consequence;
- future operational Opex and effective week;
- capacity/capability consequence;
- exact facility/site/project identity;
- capital and Opex ledger rows.

### P11 must not duplicate

- placement legality;
- footprint/collision rules;
- construction clock;
- facility registration;
- move/demolition action;
- set construction/repair/strike law;
- bare-lot tuning.

### Required final check

Verify that P09's solvency proof uses complete recurring facility Opex. Current accepted `weeklyBurn` is incomplete.

## 5. P10 → P11

### P10 produces

- stable person identity and public Profile/Roster route;
- current employment, active contract, salary, end week and current work;
- availability and exact workplace where authoritative;
- public/perceived information only;
- grouped contract attention and quote routes where actually implemented;
- career/history links.

### P11 consumes

- exact person/contract route;
- current active salary/payroll basis;
- remaining guarantee and legal current quote where exposed;
- current work/availability for neutral context;
- no-current-location/historical profile behavior.

### P11 must not duplicate

- person identity;
- hidden actual skills/ceilings/RNG;
- contract pricing or legality;
- hiring/renewal/release actions;
- career events;
- world presence.

## 6. Status matrix

| Producer seam | Planned | Observed on WIP | Technically proven | Owner accepted | P11 status |
|---|---|---|---|---|---|
| P08 history root/recording boundary | Yes | Yes at recon snapshot `908879a9…`; Projection 16 consumer at Unity `685f113e…` | Wave 2 committed; unsealed | No | Reconcile after final P08–P10 acceptance |
| P08 Administration/History workspace | Yes | Dirty active Unity Wave 3 snapshot only; not inspected as completed | No | No | Placeholder; final route required |
| P09 bare-lot/endowed regime | Yes | Preflight design only | No | No | Placeholder |
| P09 `quotePlacement`/`quoteSet` | Yes | Preflight design only | No | No | Placeholder; critical consequence dependency |
| P09 facility Opex onset and exact body routes | Yes | Existing engine law + planned new presentation | New stack not sealed | Existing P07 engine law accepted; stack no | Refresh final symbols |
| P10 Profile/Roster | Yes | Preflight design only | No | No | Placeholder |
| P10 contract quote/attention | Conditional/ready extension | Not observed | No | No | Do not assume |
| P07 result/run/film economics | Yes | Accepted | Yes | Yes | Binding authority |

## 6.1 Reconciled terminology and absent-workforce law

- Accepted P07 `Profit` / `Loss` / `Break-even` labels remain on the P07 result surface. P11 Finance may separately show Film Contribution with explicit scope/exclusions.
- `Banked to date` and `received to date` may differ in copy only when both map to the same accepted paid-to-date field.
- P08 history provides event context and recording completeness, not accounting rows.
- Builder payroll/capacity is absent authority, not a zero-valued cost.
- At the recon snapshot, P09/P10 production had not begun, so no inference about their final routes is permitted.

## 7. Cross-package identity contract

| Subject | Identity P11 must use | Forbidden join |
|---|---|---|
| Film/result/run | exact production/result ID | title, row index, release ordering |
| Person/contract | exact person/talent ID and final contract/quote identity | display name, role label, list position |
| Facility/site | exact placement/project/facility/set ID | blueprint display name, world proximity |
| History | exact P08 event ID + source IDs | rendered summary text |
| Quote/intent | exact opaque quote/intent + expected revision | button label or cached visual state |

## 8. Persistence and projection handoff

- P11 does not copy P08/P09/P10 records into a new Finance root.
- Finance derives bounded views and persists nothing new by default.
- A raw unbounded ledger must not be appended to every lot snapshot.
- Deep history should use a bounded query/page or measured equivalent.
- Every schema/DTO field carries only public player-safe facts.
- Final projection and schema version are monotonic and attested.

## 9. Final refresh placeholders

```text
FINAL_P08_P10_TS_SHA
FINAL_P08_P10_UNITY_SHA
FINAL_P08_HISTORY_SEAM
FINAL_P09_PLACEMENT_QUOTE_SEAM
FINAL_P09_SET_QUOTE_SEAM
FINAL_P09_FACILITY_OPEX_SEAM
FINAL_P09_WORLD_ROUTE
FINAL_P10_PERSON_PROFILE_SEAM
FINAL_P10_CONTRACT_QUOTE_SEAM
FINAL_P10_ATTENTION_SEAM
FINAL_P08_P10_SCHEMA_ID
FINAL_P08_P10_PROTOCOL_VERSION
FINAL_P08_P10_PROJECTION_VERSION
FINAL_P08_P10_SAVE_VERSION
FINAL_P08_P10_OWNER_ACCEPTANCE
```

## 10. Consumer handoff from P11

A later accepted P11 may provide:

- exact current cash and recurring pace;
- typed obligations;
- action consequence envelopes;
- bounded finance history/period facts;
- film/facility/person financial links;
- explicit provenance and missing-history status.

P12/P13/P14/P15/P16+ may consume these facts. They may not create money, infer private forecasts or reinterpret Contribution as total profit.

POST-P08–P10 OWNER-ACCEPTED CHANGED-PATH REFRESH REQUIRED
