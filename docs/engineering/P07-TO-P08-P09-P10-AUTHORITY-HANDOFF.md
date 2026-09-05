# Project: Studio — P07 to P08/P09/P10 Authority Handoff

> **REVISION 05 — CURRENT OPS TARGETED CORRECTION APPLIED.** This document preserves the useful detail of the earlier `foundation-marathon` draft but is now governed by the accepted closeout base and the full-scope traceability/ready-extension laws. P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The only pending Owner acceptance is for new P08–P10 work. The former name is a draft alias; `docs/p08-p10-autonomous-stack-launch-01` is canonical.
>
> **Private Unity boundary:** the accepted Unity identity is known (`c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`), but the connected Future Ops environment could not inspect that private source tree. **SOURCE INSPECTION NOT AVAILABLE TO FUTURE OPS — REQUIRES CODING-AGENT READ-ONLY PREFLIGHT.**


**Status:** PROVISIONAL PRODUCER / CONSUMER CONTRACT
**Implementation authorization:** NONE

## 1. Purpose

This document prevents the P08–P10 program from recomputing, renaming, or fabricating facts already owned by another package.

## 2. P07 authoritative inputs

P07 owns and publishes:

- immutable film/result identity by exact `productionId`;
- title as display data only;
- release week;
- active/completed/legacy theatrical state;
- critics as an independent channel;
- audience aggregate and per-segment truth as an independent channel;
- business result as an independent channel;
- gross versus studio revenue distinction;
- paid-to-date versus projected/final distinction;
- committed cost, contribution, ROI, and authority-decided labels;
- frozen greenlight forecast where recorded;
- exact same-title disambiguation by ID.

P07 does **not** own:

- awards;
- rival results;
- named critics/publications;
- Hollywood Wire stories;
- P08 significance;
- P09 construction/founding;
- P10 person profile semantics;
- an authoritative release-event receipt ID in V1.

## 3. P08A consumes and produces

### Consumes

- P07 exact film/result facts;
- current three-channel Standing;
- existing film participants/career events where recorded;
- existing facility/property/placement IDs;
- current calendar week.

### Owns

- Standing-change history from an explicit recording boundary;
- sparse Studio History event identity;
- historical significance class;
- factual historical deep-link metadata;
- old-save `Not recorded` behavior.

### Produces for P09/P10

- a typed way to append material founding/construction/person/career milestones without changing those source domains;
- exact history event IDs and source references;
- a retained History workspace capable of linking to facility and person owners.

### Must not do

- recompute P07 results;
- create awards;
- invent missing pre-recording events;
- mutate Standing from presentation;
- make historical subjects appear physically current.

## 4. P09 consumes and produces

### Consumes

- P08 history append/receipt seam;
- existing property, placement, facility, Set, operations, finance, and clock authority;
- P07/P05/P06 full movie pipeline;
- current world-first lot shell.

### Owns

- founding regime and sparse fresh property;
- facility catalogue/quote/preview/commit/completion within approved scope;
- authoritative construction identity and timing;
- physical capability creation;
- complete minimum first-film infrastructure chain.

### Produces for P08

Material receipts such as:

- studio founded;
- first facility committed;
- first facility completed;
- first Development & Casting capability became operational;
- first Soundstage/Post/Scenery capability became operational;
- first movie completed from a bare-lot start.

P08 decides historical significance and presentation; P09 supplies the facts.

### Produces for P10

- current physical facility/body context;
- world routes in which authoritative people may work;
- no new person identity for presentation-only builders.

### Must not do

- create Standing or career formulas;
- infer construction legality in Unity;
- edit `INITIAL_PROPERTY`;
- treat Stage, Set, and Production as one identity;
- create fake Builder employees.

## 5. P10A consumes and produces

### Consumes

- existing immutable `Talent` identity;
- contracts and employment state;
- assignments and presence;
- perceived ability, estimated potential, genre experience, work ethic, and Star Power;
- P07 frozen participants/results and existing career events;
- P08 History and future honors seam;
- P09 current physical work locations.

### Owns

- player-safe person projection;
- person Profile and Roster presentation contract;
- exact world/Profile/Roster navigation;
- grouped human attention presentation over existing authority.

### Produces for P08

- exact person deep-link presentation;
- no new simulation history unless a genuinely missing source event is separately authorized;
- future compatible person-history summaries with explicit provenance.

### Must not do

- expose hidden actual skills or ceilings;
- calculate OVR, potential, Star Power, availability, or contract legality in Unity;
- invent a `Star` status;
- create retirement, relationships, training, needs, or rival employment.

## 6. Shared identity law

Every join uses exact stable IDs.

Never join through:

- film title;
- person name;
- facility label;
- visible row order;
- current world location;
- collection index.

Historical records freeze the source identity. Current presentation may resolve the present label/body separately and may return `No current location`.

## 7. History versus source domain

The History spine is an index and interpretation layer over exact source facts. It is not a universal event bus and not a second simulation.

A history row may say:

```text
Development & Casting Office completed in Week 18
```

only because P09 supplied the exact completion receipt.

It may say:

```text
The Midnight Reel released in Week 42
```

only because P07 supplied the exact film result.

It may link Ramon Ashley only through the exact frozen participant/career identity supplied by P07/P10.

## 8. Hollywood Wire and Radio boundary

The P08–P10 program may prepare future factual receipt contracts. It may not implement Hollywood Wire or Studio Radio.

Future order:

```text
P07/P08/P09/P10 typed facts
  → Hollywood Wire editorial story/thread authority
    → Studio Radio scheduling and voice presentation
```

No runtime LLM creates facts, rights, awards, careers, or construction history.

## 9. Version law

- P08 may add the next additive save root if history requires persistence.
- P09 may add the next additive founding-regime/root changes after P08.
- P10 should avoid a save bump unless authority is genuinely missing.
- Every projection change regenerates and verifies the exact Unity consumer.
- Old versions remain recursively frozen.
- No package may widen a frozen leaf casually to avoid a new version/root.

## 10. Final handoff status

This conceptual contract becomes executable only after Current Ops reconciles exact symbols, final SHAs, save aliases, and changed paths.

**CODING-AGENT ACCEPTED-BASE CHANGED-PATH AND PRIVATE-UNITY PREFLIGHT REQUIRED**

## Revision 02 full-scope control

This document is subordinate to and completed by:

- `docs/operations/P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md` — 115 mapped requirements, zero unmapped;
- `docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md` — every lawful deferral with owner/dependency/refresh trigger;
- `docs/operations/P08-P10-MAXIMAL-AUTONOMOUS-WAVE-PLAN.md` — core floors plus dependency-ready extension ladders;
- `docs/operations/P08-P10-SAVE-SCHEMA-PROJECTION-AND-MIGRATION-PLAN.md` — accepted V16/15 baseline and provisional package chain;
- `docs/operations/P08-P10-AUTONOMOUS-STACK-OWNER-DECISION-DOCKET.md` — decisions separated into Owner, Current Ops, engineering, private-source, and later categories.

A core checkpoint does not terminate the package automatically. The coding lead continues only through rows classified `IMPLEMENT AS READY EXTENSION` whose exact activation gate passes. Conditional, Owner-blocked, dependency-blocked, deferred, and rejected rows are not implementation authority.
