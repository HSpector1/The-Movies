# D-14 — Talent Career Impact and Star Power V1 (Phase 1: engine + persistence)

Owner-authorized bounded milestone. This document governs Phase 1 (engine, persistence,
calibration, tests). The two UI screens (Autopsy Career Impact, Talent Profile) are
Phase 2 and are **not** built until the owner signs off on this calibration.

- Branch: `phase-5.2-talent-career-impact-v1` (cut from main `e8c5696`)
- Audit that motivated this: `audit-talent-progression-star-power` (read-only, preserved)

## Governance note (scope)

The original M0A-era `CLAUDE.md` non-goals list includes "aging and career progression."
This milestone deliberately moves **Star Power commercial-recognition progression** into
scope per the explicit owner directive, while **aging / age-driven decline / retirement**
remain excluded (§11 below). This is a recorded owner decision, not a silent gap-fill.

## 1. Audit finding

Craft progression is real and persistent (skills/genreExperience/workHistory via
`developTalent`, live in normal play). But `Talent.fame` (Star Power) was
**initialization-only — no post-creation write anywhere**. Repeated Lead roles, theatrical
reach, audience/critic reception, and beating forecast all failed to build Star Power. This
Phase-1 milestone adds the missing lifecycle hook.

## 2. Approved Star Power semantics

Star Power (stored field `Talent.fame`, 0..100, player label "Star Power") = commercial
recognition / audience familiarity / current drawing power / demonstrated draw. It is NOT
acting skill, genre skill, prestige, critical respect, profit, salary, wellbeing, or
guaranteed film quality. A talent may have high skill + low Star Power, or vice-versa.

## 3. Approved causal inputs (`src/core/starPower.ts`)

Only already-authoritative realized outcomes: (1) realized reach (total theatrical gross,
not marketing $ directly); (2) role visibility (from the frozen participant assignment);
(3) audience response (weightedAudienceScore); (4) performance vs the locked forecast
(SECONDARY); (5) current Star Power (diminishing returns).

## 4. Prohibited inputs (verified absent from the resolver surface)

Studio profit, film Contribution, studio cash, payroll, direct marketing $, salary,
contract cost, creator/authored flag, Commercial Confidence, Industry Prestige, Creative
Cohesion alone, arbitrary random awards. Critic result is **not** a primary Star Power
input in v1 (recorded on the event for context only). No new RNG draw is introduced.

## 5. Lifecycle hook + exactly-once protection (`src/core/tick.ts` step 6)

Applied once per participant **at FilmResult creation** (release), inside the existing
`develop`-gated block, **engaged-only** (requires the frozen `prod.participants`) so the
governed M0A / non-engaged path takes no fame update (see the serialization clarification
below). It is applied to the POST-development talent, so it affects
**future films only** — the just-resolved film's opening/legs/total (computed in step 3
from pre-tick fame) are never retroactively changed. Not applied during assignment,
greenlight, production ticks, weekly theatrical payments, Autopsy rendering, save loading,
or UI navigation. Exactly-once: one `TalentCareerEvent` per (film, participant), keyed by a
stable `eventId = filmId:talentId`; the realized result is stored, and a reload never
re-ticks, so no double application.

## 6. Role visibility (`TUNING.STAR_POWER_ROLE_WEIGHTS`)

`lead 1.00 > antagonist 0.70 > director 0.55 > support 0.45 > writer 0.35 > craft 0.20`.
Taken from the participant's actual frozen assignment — never from OVR or current fame.

## 7. Star Power equation + tuning constants (deterministic)

```
reach01 = total / (total + REACH_HALF)
audGain = clamp((aud − AUD_FLOOR)/(AUD_GOOD − AUD_FLOOR), 0, AUD_MAX)
fcMult  = clamp(1 + FC_WEIGHT·(total/expectedTotal − 1), FC_MIN, FC_MAX)
room    = ((100 − fame)/100) ^ SAT_EXP
gain    = BASE_GAIN · roleWeight · reach01 · audGain · fcMult · room
poor    = clamp((AUD_POOR − aud)/AUD_POOR, 0, 1)
estab   = (fame/100) ^ ESTAB_EXP
loss    = ESTAB_LOSS · roleWeight · reach01 · poor · estab
delta   = clamp(gain − loss, −MAX_LOSS, +MAX_GAIN);  newFame = clamp(fame + delta, 0, 100)
```
Constants (all in `TUNING`): `REACH_HALF $10M, AUD_FLOOR 40, AUD_GOOD 65, AUD_MAX 1.2,
FC_WEIGHT 0.3, FC_MIN 0.85, FC_MAX 1.15, SAT_EXP 1.6, BASE_GAIN 9, AUD_POOR 45,
ESTAB_EXP 1.5, ESTAB_LOSS 16, MAX_GAIN 10.0, MAX_LOSS 4.0`.

## Calibration targets (§6 — achieved, see harness)

| Scenario (Lead) | Target | Achieved |
|---|---|---|
| A obscure weak | 0.0..+0.5 | −0.02 (≈0, "No change") |
| B modest ordinary | +0.8..+2.0 | +1.37 |
| C visible success | +2.5..+5.0 | +4.58 |
| D true breakout | +5.0..+9.0 | +7.13 |
| E established visible failure (fame 70) | −1.0..−3.0 | −2.01 |

Unknown obscure failure: ≈0 (not punished). Saturation: fame 5→+4.99 … 90→+0.14. Repeated
mediocre Lead films (×10): fame 5→12.1 (no auto-superstar). Support gains < Lead.

## 8. Frozen career record — `TalentCareerEvent` (`src/core/types.ts`)

One canonical persisted record per (film, participant): eventId, talentId, filmId,
filmTitle, releaseWeek, genre, role, billingWeight, discipline, OVR before/after, visible
skills before/after + deltas, genreExperience before/after, workHistory before/after, Star
Power before/after/delta, realized opening + total, audienceScore, criticScore,
forecastComparator, and machine reason codes (`substantialLeadExposure`,
`supportingRoleVisibility`, `limitedAudienceReach`, `strongAudienceResponse`,
`weakAudienceResponse`, `exceededCommercialExpectations`, `missedCommercialExpectations`,
`establishedStarSaturation`, `noMeaningfulCareerChange`). Stored on
`GameState.careerEvents` (append-only; empty on M0A/legacy). Autopsy + Talent Profile
(Phase 2) render from this — never recompute from present state.

## 9. Save version + migration (`src/core/save.ts`)

New `SaveFileV5` (state = live GameState + careerEvents). V4 stays frozen + readable
(anchored to `GameStateV4`). `convertV4ToV5` preserves fame + all talent state exactly,
seeds an EMPTY ledger, invents no history, is deterministic + idempotent. New games save
V5; `migrateToV5` is the load-to-play entry. Existing (e.g. Zach) saves begin D-14 with
current craft + current frozen Star Power preserved and history available from this point
forward.

### 9a. Byte-identity — precise acceptance definition (owner clarification)

The accurate distinction (do NOT read "byte-identical" as "the entire serialized SaveFile
is unchanged from pre-D-14"):

- **Governed M0A simulation behavior and the legacy outcome corpus remain byte-identical** —
  the two-same-seed determinism comparison (`replay.test.ts`) holds, and no existing film,
  reception, economy, or standing result changes.
- **SaveFile serialization intentionally changes** through `SaveFileV5`: it adds an empty
  career-event ledger and advances the version number (4 → 5). This is the same additive
  kind of change D-12 made when it added `theatricalRuns` and bumped V3 → V4.
- **No Star Power progression occurs in the governed M0A configuration** (non-engaged / no
  participants ⇒ zero career events, fame unchanged).
- We do NOT manufacture literal cross-version save-byte identity by altering mechanics; the
  version bump + empty ledger are the intended, accepted serialization delta.

## 10. Autopsy behavior — Phase 2 (NOT built)

A default-visible "Career Impact" section reading the frozen events (name, role, OVR
before→after, Star Power before→after, changed skills, concise reason). Zero-delta
participants are shown explicitly as "No change." Deferred to Phase 2.

## 11. Talent Profile behavior — Phase 2 (NOT built)

A reusable profile (roster / assemble / autopsy) showing current visible values +
career-event history, never exposing hidden ceilings/potential/seeds. Deferred to Phase 2.

## 12. Non-goals (explicitly excluded)

Aging / age decline / retirement / inactivity decay; awards; critical Prestige as a
separate field; Momentum as a separate field; rival careers; outside offers; contract
renegotiation from fame; billing negotiation; refusal; relationships; mentorship;
typecasting; wellbeing; autonomous behavior; named-character lot presence; D1-A art;
Asset Lab 05H; loans/debt; new facilities. Visible-failure loss is part of the release
outcome only — not a general weekly decay.

## 13. Test + harness gates (Phase 1)

Harness: `src/harness/run-star-power-calibration.ts` (pure-resolver §6 scenarios + iterated
trajectories + a real-engine found→cast→release validation). Tests:
`tests/d14-star-power.test.ts` (15) + updated save/version/replay/economy tests. Verified:
fame changes only at the release hook; exactly once; released film economics unchanged;
future films read updated fame; Lead>Support; more reach ⇒ more; high fame ⇒ smaller; an
unknown's obscure failure ≈0; an established visible failure < 0; profit/cash/authored not
inputs; creator == generated resolver; the event matches the state transition; V4→V5
preserves fame + empty ledger; reload no double-apply; round-trip preserves events;
determinism; M0A SIMULATION byte-identity (two-same-seed determinism; save serialization intentionally advances to V5, see §9a); D-13 single-film distributions unchanged; D1 unchanged.

## 14. Forecast/casting flow-through (§12)

The updated fame flows through EXISTING consumers only (knownLeadTrackRecord, starDraw,
opening reach, salary/contract reads) — no second fame bonus is added. Multi-film campaigns
now reflect this intended progression; single-film D-13 box-office distributions are byte-identical
(fame updates post-film).

## 15. Retained future career watch items

- Whether to add aging/decline, Momentum, or critical-Prestige as separate channels later.
- Whether repeated-role fame pace stays balanced once talent-development farming interacts
  with cheap-film production (the retained D-13 watch item).
- Calibration is owner-tunable via `TUNING.STAR_POWER_*`; targets are guides, not forced.
