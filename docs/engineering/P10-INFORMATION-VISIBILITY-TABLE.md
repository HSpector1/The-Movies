# P10 Information Visibility Table (execution order §26A — written BEFORE the contract change)

**Authorization:** `OPS-P08P10-20260905-01` §26/§26A. **Status:** binding for P10 core (projection 18, `people.profiles[]` / `people.roster`). Every field that crosses the bridge is listed here with its exact producer; anything not listed does not cross.

Legend — **Producer**: the one TypeScript function or persisted root that owns the value. **Persisted/derived**: P = persisted in `GameState`/save; D = derived at projection time from persisted truth (pure selector). **Side**: PUBLIC = may cross the bridge; HIDDEN = never crosses (schema-negative tests). **Estimate**: whether the value is an estimate of hidden truth. **Wording**: the mandatory uncertainty/definition copy the wire carries with it. **Disposition**: the original P10 row.

## 1. Identity and profession

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `talentId` | `Talent.id` | P | PUBLIC | no | — (exact-ID joins only; same-name people stay distinct) | REQ-001/022 |
| `name` | `Talent.name` | P | PUBLIC | no | — | REQ-001 |
| `profession` (home) | `Talent.role` (`actor|director|writer|craft`) | P | PUBLIC | no | "Home profession" | REQ-002/003 |
| `primaryDiscipline` | `ROLE_TO_DISCIPLINE[role]` | D | PUBLIC | no | — | REQ-002 |
| `careerIdentity` (proven / capable-but-unproven disciplines) | `careerIdentity(talent)` (`src/core/talentSummary.ts:542`, perceived OVR + `workHistory`) | D | PUBLIC | no | "Proven" / "Capable but unproven" — never a fabricated credit | REQ-002/011 |
| `age` | `Talent.age` | P | PUBLIC | no | — (no aging law; static) | REQ-036 not entered |
| `authored` | `Talent.authored` | P | PUBLIC | no | "Player-created" | — |
| `population` guard | only `state.talent[]` records (Actor/Director/Writer/Craft) | P | PUBLIC | no | decorative extras/stagehands/grips/site crew have NO record and NO row | REQ-003/031 |

## 2. Craft summary (OVR family)

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `ovr` per discipline | `roleOVR(talent, discipline)` on **perceived** skills (`talentSummary.ts:124`) | D | PUBLIC | no (it is the perceived summary, by definition) | "Perceived craft summary for <discipline>; not Movie Quality, not role fit, not potential, not fame" | REQ-011 |
| `tier` per discipline | `roleTier(ovr)` (`:129`) | D | PUBLIC | no | tier label only | REQ-011 |
| `estimatedPotential {low, high}` per discipline | `expectedPotentialRange(talent, discipline, state.seed)` (`:490`, centred on `scoutedEstOVR` = hidden ceiling + seeded gaussian noise, clamped ≥ current OVR) | D | PUBLIC (the band only) | **yes** | "Scouted estimate; the true ceiling is not known and may sit outside this band" | REQ-012 |
| `estimatedPotentialTier` | `expectedPotentialTier(…)` (`:474`) | D | PUBLIC | **yes** | same as above | REQ-012 |
| `genreExperience[discipline][genre]` | `genreExperience(talent, discipline, genre, 'perceived')` (`:226`) | D (from persisted perceived cells) | PUBLIC (perceived only) | no | "Perceived experience" | REQ-013 |
| `specialties` (top two perceived genres, primary discipline) | derived from the perceived cells | D | PUBLIC | no | "Top specialty" only when the lead is meaningful; else "No clear specialty" | REQ-013 |
| `workHistory[discipline]` | `workHistoryCount(talent, discipline)` (`:241`) | P (counter) | PUBLIC | no | "credited productions" | REQ-013/025 |
| `workEthic` (1..99) | `Talent.workEthic` | P | PUBLIC | no | label from `workEthicLabel` (`:504`) + the ONE real effect: "Affects how readily credited work becomes lasting development" | REQ-014 |
| `temperament` (persona summary) | `temperamentSummary(talent.perceived)` (`:434`) | D | PUBLIC (perceived persona only) | no | "Expressive profile, not ability" | — |
| **`skills.actual`** (24) | `Talent.skills.*.actual` | P | **HIDDEN** | — | never | REQ-023 |
| **`ceilings`** | `Talent.ceilings` | P | **HIDDEN** | — | never (the band above is the only public trace) | REQ-012/023 |
| **`devRate`** | `Talent.devRate` | P | **HIDDEN** | — | never | REQ-023 |
| **`genreExperience.actual`** | `Talent.genreExperience[...].actual` | P | **HIDDEN** | — | never | REQ-013/023 |
| **`actual` persona** | `Talent.actual` | P | **HIDDEN** | — | never (reception/role-fit source) | REQ-023 |
| **`state.seed` / RNG streams** | `GameState.seed` | P | **HIDDEN** | — | never (only the derived band crosses) | REQ-023 |
| **`currentAbilityPercentile` / rank / momentum** | not produced | — | not on the wire in P10 core | — | (R2 candidate as "market context", never a rank) | REQ-024 (R2) / REQ-039 deferred |

## 3. Star Power

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `starPower` (0..100) | `Talent.fame` (updated only by `src/core/starPower.ts` at release) | P | PUBLIC | no | "Public commercial recognition. Separate from craft (OVR) and from awards. Not a rank." | REQ-015 |
| **`Star` status/threshold** | not produced | — | absent | — | no badge, no threshold | REQ-016 (Owner-blocked) |

## 4. Employment, contract, availability

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `employmentStatus` | `employmentStatus(state, id)` (`employment.ts:377`): `contracted | engagedFreelancer | availableFreelancer | freeAgent | unavailable` | D | PUBLIC | no | the five states verbatim; never "retired"/"rival" | REQ-009 |
| `contract` (`annualSalary`, `weeklySalary`, `signingBonus`, `startWeek`, `endWeekExclusive`, `termWeeks`, `remainingWeeks`) | `activeContract` (`:88`) + `weeklySalary` (`:172`) — via `employmentInfo` (`adapter.ts:3986`) | P (+D) | PUBLIC | no | "Under contract through Week N" | REQ-017 |
| `guaranteedRemaining` | `guaranteedComp(contract, week)` (`:177`) | D | PUBLIC | no | "Guaranteed obligation remaining" | REQ-017 |
| `terminationCost` | `terminationCost(contract, week)` (`:183`; current tuning = 50 % of remaining guarantee) | D | PUBLIC | no | "Early release would cost $X under current terms" (tuning, not law) | REQ-017 (action route = R1) |
| `renewal` state | `renewalWindowOpen(contract, week)` (`:206`; final 12 weeks) | D | PUBLIC | no | `Not open` / `Opens in N weeks` / `Renewal open` | REQ-017/019 |
| `marketBasis` (`Talent.salary`) | `Talent.salary` (per-production market compensation) | P | PUBLIC, LABELLED | no | "Market rate per production — not a contract salary" | REQ-017 (labelled basis) |
| `freelancerFee` | `freelancerFee(state, talent)` (`:292`) — only when `availableFreelancer` | D | PUBLIC | no | "One-film fee" | REQ-017/026 |
| `offerOptions` | `contractOfferOptions` (`:271`) — only when signable | D | PUBLIC (read-only in P10 core) | no | "Proposed terms — nothing is signed by viewing" | REQ-018 (R1) |
| `availability` | `busyTalentIds` (`:165`) + status | D | PUBLIC | no | `Available` / `Working` / `Engaged` / `Free agent` / `Unavailable` | REQ-009 |

## 5. Current work, presence, Locate

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `assignment` | `talentAssignmentContext(state, id)` (`adapter.ts:1426`): `available | assigned{production|script, assignmentId, label} | ambiguous` | D | PUBLIC | no | `ambiguous` ⇒ "Current work could not be determined" (fail closed; no guess) | REQ-008 |
| `presence` (`engagement`, `credit`, `ownerId`, `site`, `slot`, `beats`, `blockedReason`) | `studioPresence(state)` (`presence.ts:341`) — already on the wire as `StudioPresencePersonSnapshot` | D | PUBLIC | no | authored from authority, never from walking/proximity | REQ-010 |
| `canLocate` + `locateReason` | new selector over `studioPresence` (+ withheld list): true only when the person is claimed on the lot this week and not withheld | D | PUBLIC | no | exact absence reason ("Not on the lot this week", "Presence withheld: <reason>") | REQ-004/007 (design §31.1) |
| `destination` | `presence.site` → facility name (`facilityName` already published) | D | PUBLIC | no | — | REQ-008 |

## 6. Career history

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `careerEvents[]` (film, week, discipline, role, `ovrBefore/After`, `starPowerBefore/After/Delta`, `genreExpBefore/After`, `workHistoryBefore/After`, `reasonCodes`) | `GameState.careerEvents` (`types.ts:508`, frozen `TalentCareerEvent`, `types.ts:1707`) filtered by `talentId` | P | PUBLIC (frozen facts) | no | "Recorded at release Week N" — no recomputation, no prose classification | REQ-020/025 |
| `filmResultLink` | `filmId` → P07 durable result id (exact) | P | PUBLIC | no | deep link only when the result exists | REQ-020 / §31 integration |
| `provenance` | `careerEvents` absent for a credited film (legacy/M0A) ⇒ `partial`; no credits and no events ⇒ `notRecorded` | D | PUBLIC | no | "Not recorded" / "Partial attribution (pre-history save)" | REQ-021 |
| `p08HistoryLink` | `studioHistory` rows referencing the person (P08 `people[]` subject) | P | PUBLIC | no | opens P08 History by exact id | §31 integration (R4 = fact-backed records) |
| **`skillsBefore/After/skillDeltas`** inside events | frozen perceived skills | P | PUBLIC (perceived, frozen) | no | "as perceived at the time" | REQ-020 |
| **honors/awards** | none exist | — | absent | — | never invented | REQ-029 (R4 / P08-X) |

## 7. Attention (grouped; existing truth only)

| Field | Producer | P/D | Side | Estimate | Wording | Disposition |
|---|---|---|---|---|---|---|
| `attention` per person (one highest-priority reason) | derived from `renewalWindowOpen`, `remainingWeeks` (52/26/12 horizons), assignment `ambiguous`, `blockedReason` | D | PUBLIC | no | text + tier (`INFO/ATTENTION/DECISION/BLOCKING`), never colour alone | REQ-019 (R1 for the grouped cohort surface; per-person reason in core) |
| grouped contract cohorts | derived by decision window | D | PUBLIC | no | "N contracts end within 12 weeks" | REQ-019 (R1) |
| **morale / stress / relationships / training / aging** | not produced | — | absent | — | never | REQ-033..037 |

## 8. Shape law for projection 18

- One TypeScript projection (`bridge/people.ts` → `people.profiles[]`, `people.roster`) composes only the producers above; nested data is freshly built per snapshot (no shared references with `GameState`; mutation tests).
- Schema-negative tests assert that the serialized snapshot contains none of: `actual`, `ceilings`, `devRate`, `seed`, `skills.*.actual`, `genreExperience.*.actual`.
- Every estimate carries `isEstimate: true` and its wording; every OVR carries its discipline.
- Same-name people: all joins by `talentId`; a duplicate/stale/ambiguous join yields an explicit `ambiguous`/withheld marker, never a guess.
