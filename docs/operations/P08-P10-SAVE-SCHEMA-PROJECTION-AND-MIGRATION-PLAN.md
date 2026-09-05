# Project: Studio — P08–P10 Save, Schema, Projection and Migration Plan

**Revision:** 03
**Status:** PROVISIONAL — CODING-AGENT VALIDATOR/PATH PREFLIGHT REQUIRED

## 1. Starting contract

| Identity | Exact accepted value |
|---|---|
| Documentation-inclusive TypeScript campaign tip | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` |
| Last TypeScript runtime/contract-affecting product commit | `da848225516fe3ced9a421548d0f5e7cbc8b5b88` |
| TypeScript player-build binding | `d0953e52d6b446137d3141a0310fd98b170e8cc1` |
| TypeScript candidate-assembly binding | `a6f4f82d35916f9f0cad205a5f478219bad6480e` |
| TypeScript technical-seal commit | `4bbf26353c9b168f551e4a18ca190eceea201cb9` |
| Unity product/campaign | `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` |
| Player executable SHA-256 | `c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813` |
| Engine bundle SHA-256 | `b92dc8e6edde05e4da86a3c75d3a1657170646045366c234f942b8b5934a2a0a` |
| Assembly-CSharp SHA-256 | `52229807aa64c9a7d1a135360c6db656a75b8e33b2c5dcdda3cfc87aac7064ac` |
| Generated-contract Git blob | `84d9c9a814ad4cc92d8a882205baa2f484ff8527` |
| Generated-contract SHA-256 | `045fccce1ae318cbd338779fd52bd805302c1b8ad5ed033cb24d08eab590047f` |
| Schema | `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99` |
| Protocol / projection / save | `4 / 15 / V16` |

## 2. Expected monotonic chain

| Boundary | Expected save | Expected projection | Purpose | Migration law |
|---|---:|---:|---|---|
| Accepted P07 | V16 | 15 | current accepted authority | none |
| P08 core | V17 | 16 | forward Standing/history provenance and recording boundary | append empty history state at current week; invent nothing |
| P09 core | V18 | 17 | explicit founding regime and generic Build/world projection | every historical save becomes `endowed` without other mutation |
| P10 core/ready | V18 expected | 18 | person/Profile/Roster data derives from existing authority | no save bump unless a genuinely missing fact is proved |

These numbers are planning expectations, not self-authorization. Every historical validator stays exact. The coding lead may select another monotonic final sequence only after proving equivalent migration and contract safety.

## 3. P08 history root

Recommended conceptual shape:

```text
StudioHistoryState
  recordingStartedWeek
  nextEventId
  rows[]
```

A row should freeze only minimal factual history: exact ID, week, kind, subject IDs, source identity when the producer supplies one, significance class/reasons, and minimal display facts required to survive later renames/removal.

Rules:

- no backfill of old Standing changes, awards, facility events, or career events;
- current Standing values do not change during migration;
- no presentation `seen` state in GameState;
- exact-once append and deterministic order;
- windowed `studioEvents` remain windowed;
- permanent event rows used by `persistedProductionIds` are never removed or repurposed by P08 retention;
- no universal external event-receipt contract is invented.

## 4. P09 founding regime

Recommended persisted root:

```text
foundingRegime: 'endowed' | 'bare-lot'
```

### Historical saves

Every V1–P08 save traverses its frozen migrations and receives `endowed`. No property, cash, roster, contracts, facilities, placements, construction, Sets, results, ledger, release authority, or P08 history row changes.

### New authored 1920 saves

Write `bare-lot` at creation. Use a separate sparse property template. Preserve the existing founding process and chosen roster; no extra person, contract, facility, Set, capacity, cash, or history row is minted for proof.

Expected activation after founding, subject to code preflight:

```text
operations          managed, no operational facilities/workflows
construction        managed, no projects
placement           managed, next ID preserved, no placed facilities
scriptDevelopment   managed, no projects
castingSessions     managed, no sessions
sets                empty
productionQueue     empty
originalScreenplays empty
studioEvents        empty at the new-history boundary except explicitly governed founding facts
property            deep copy of the sparse template
```

Never infer founding regime from empty arrays, current facilities, property appearance, or whether the player later demolishes something.

## 5. P09 minimum physical chain

The coding preflight must enumerate the exact current capabilities/blueprints required to complete an ordinary film. The planning expectation is:

```text
Development & Casting capacity
→ Scenery support
→ Soundstage
→ mounted Set
→ Post capacity
```

The exact lawful blueprint IDs, costs, durations, opex, requirements, capacity, and world bodies must come from current TypeScript authority. If an accepted current facility combines capabilities, use that truth rather than forcing the planning labels literally.

## 6. P09 solvency proof

Starting cash currently exists as `INITIAL_CASH = $20,000,000`. The P09 research also contains a prototype first-office envelope of `$1,500,000 / 14 weeks / $5,500 per week / +2 shared slots`; the current accepted Annex law separately contains `$780,000 / 13 weeks / $3,500 per week / +1`. These are not interchangeable.

Before P09 code proceeds past the economic gate, publish one ledger containing:

- starting cash;
- founding roster and all signing/contract obligations;
- exact facility and Set capex;
- construction duration and operational burn;
- payroll and overhead during the build wait;
- screenplay, casting, freelancer, production, Post, and marketing costs;
- first release and actual cash receipt timing;
- minimum cash balance and headroom;
- no subsidy/waiver/test mutation.

The WIP may use the P09 prototype envelope only when this ordinary-player path is green. Final tuning remains an Owner playtest judgment.

## 7. P10 information visibility

| Player-facing fact | Exact producer to verify | Persisted/derived | Visibility and uncertainty law |
|---|---|---|---|
| OVR | `roleOVR` / talent-summary authority | derived from persisted perceived skills | public; discipline-labeled; not Movie Quality, role fit, fame, or rank |
| Estimated Potential | `expectedPotentialRange` | deterministic derived estimate from hidden ceilings | public estimate; range/tier; exact ceiling hidden |
| Genre experience | `Talent.genreExperience` | perceived/actual persisted | expose perceived side only |
| Work ethic | `Talent.workEthic` | persisted | public; claim only its modeled development-conversion effect |
| Star Power | `Talent.fame` / StarPower authority | persisted | public commercial recognition; not OVR, award, or rank |
| Contract | contract/employment authority | persisted current terms; legal actions derived | public current relationship; no client-side legality |
| Current work/availability | workflow/assignment/employment/presence | derived current truth | public; never infer from walking/proximity |
| Career links | `TalentCareerEvent`; optional captured FilmResult participants/forecast | persisted where captured | public with completeness/`Not recorded` provenance |
| Actual skill/ceiling/actual genre experience/RNG | hidden Talent state | persisted hidden | never projected |

P10 should not add a save version unless preflight proves a missing authoritative fact rather than a missing presentation.

## 8. Generated contract / CF-09

Every projection change requires:

- canonical schema generation in TypeScript;
- generated C# output committed in both repos;
- byte-identical file hashes/blob identities;
- exact committed-consumer verification;
- dirty/stale/spoof/path/version failures closed;
- Unity compile/EditMode against the exact commit;
- candidate manifest carrying schema/protocol/projection/save identities;
- no hand editing of generated DTOs.

## 9. Profile-copy and rollback law

Create independent byte copies for:

```text
accepted P07 baseline
P08 checkpoint
P09 checkpoint
P10 checkpoint
final stack
```

Never open a newer migrated copy with an older binary. Never let automation write the Owner’s durable profile. Candidate and migration evidence must disclose source hash, copy hash, version before/after, and exact binary used.
