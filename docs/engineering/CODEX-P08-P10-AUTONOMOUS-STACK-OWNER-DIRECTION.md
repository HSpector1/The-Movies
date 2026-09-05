# Project: Studio — Owner Direction for the P08–P10 Autonomous Stack Launch

**Revision:** 03 — Current Ops targeted correction incorporated
**Status:** OWNER DIRECTION RECORDED — READY FOR CURRENT OPS PM REVIEW
**Mode:** documentation and execution-planning authority only
**Implementation authorization:** NOT GRANTED BY THIS DOCUMENT
**Canonical documentation branch:** `docs/p08-p10-autonomous-stack-launch-01`
**Accepted base:** `2753e18ba8fb5f65b936c22cde9531646fecc6cd` / `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`

> P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The next human test decides only P08–P10 acceptance while also checking the accepted P06/P07 behaviors for regression.

## 1. Owner direction

The Owner wants the next implementation order to permit one large autonomous technical program through P08, P09, and P10 before another human gameplay test.

This changes only the test cadence:

- P08, P09, and P10 each retain a separate technical checkpoint and rollback candidate.
- Core checkpoints are floors, not automatic stop ceilings.
- After a core checkpoint reaches technical KEEP, the coding lead continues through every mapped **READY EXTENSION** whose activation gate passes.
- Conditional, Owner-blocked, dependency-blocked, deferred, superseded, and rejected requirements remain unavailable unless their recorded gate changes.
- P06/P07 acceptance remains closed. A newly discovered failure is a regression, not a request to repeat or re-earn prior acceptance.
- The final human test is **P08–P10 Owner acceptance plus focused P06/P07 regression checks**.

Current Ops retains authority over the final execution order, package scope, branch movement, integration, and any material product-law escalation.

## 2. Recommended technical order

```text
P08A core — Standing & Studio History Spine
  → P08 ready extensions whose gates pass
    → P09 core — Founding Flip + complete bare-lot-to-first-film construction spine
      → P09 ready extensions whose gates pass
        → P10A core — Person Profile & Roster Spine
          → P10 ready extensions whose gates pass
            → cross-stack P08 facility/person adapters
              → one final P08–P10 Owner candidate
```

The order is recommended because P08 creates the history consumer, P09 creates physical facilities and workplace anchors, and P10 can then connect people to both factual history and truthful world owners. `P08 → P10 → P09` remains technically possible, but it would make P10’s world/facility integrations provisional and create avoidable rework.

## 3. P08 full vision and executable scope

### Core required checkpoint

- three separate Standing channels;
- current meaning and driver explanations;
- forward Standing-change provenance from an explicit recording boundary;
- sparse durable Studio History;
- exact-ID film routes into accepted P07 result truth;
- old-save `Not recorded` states;
- non-blocking world-first Administration/History route;
- retained, accessible Standing/History workspace.

### Ready extensions

- large-history search, filters, scroll/focus preservation, and local read state;
- fact-backed records whose comparison universe is complete;
- captured person/career links where provenance is explicit;
- facility-history adapter after P09 supplies exact milestones;
- person-history adapter after P10 supplies exact public profile routes.

### Not ready

- P08B awards authority, nominee field, winners, ceremony, and consequences;
- P08C Studio Progression/rank/unlock law;
- universal Studio Rating or five-star composite;
- 2040 Legacy interpretation;
- Hollywood Wire implementation.

These remain mapped and visible. They are not deleted.

## 4. P09 full vision and executable scope

### Core required checkpoint

- preserve every existing save as `endowed` without changing property, cash, people, contracts, facilities, Sets, IDs, or history;
- create a distinct persisted `bare-lot` founding regime for new authored 1920 campaigns;
- preserve `INITIAL_PROPERTY` as historical migration authority;
- provide authoritative Build catalogue, quote, preview, commit, refusal, time, completion, and capability effects;
- render N construction sites from authoritative identity and clock truth;
- prove the entire ordinary-player **bare lot → minimum plant → screenplay → casting → production → Post → release → P07 result → P08 history** journey;
- perform a deterministic solvency proof with no free building, hidden subsidy, waived payroll, artificial revenue, proof-only hire, or out-of-band state mutation.

### Ready extensions

- `Build here` from legal parcels;
- all current blueprints that possess real effects, requirements, costs, duration, and art;
- N-site management and grouped completion;
- existing Stage/Set commission, repair, and strike routes after changed-path reconciliation;
- explicit move and demolish using existing authoritative blockers and consequence previews;
- P08 facility-history integration.

### Not ready

- land acquisition;
- editable roads/paths;
- utilities;
- renovation/in-place upgrades;
- landscaping, ornaments, and lot-prestige simulation;
- routine facility decay/maintenance;
- real Builder profession, assignments, or speed law;
- decorative facilities with no modeled effect.

The existing `$20M / $1.5M / 14 weeks / $5.5K per week / +2 slots` first-office envelope remains **prototype tuning**, not silently promoted final balance. The coding lead may use it for the WIP candidate only when the full normal-player solvency path passes. Otherwise P09 stops at the preserved P08 checkpoint with one exact decision request.

## 5. P10 full vision and executable scope

### Core required checkpoint

- one public/perceived-only person projection;
- exact stable identity across world body, assignment, contract, career events, film credits, Profile, and Roster;
- compact world inspector;
- retained portrait-led Profile;
- readable Roster with search, filters, sorts, Profile, Locate, and exact Back;
- current contract, availability, assignment, and workplace truth;
- career links using captured P07/P08 facts only;
- grouped attention where current authority already supplies a material decision;
- same-name isolation and decorative-person exclusion.

### Ready extensions

- current contract consequence surfaces and grouped decision cohorts;
- exact shortage → existing Hiring/Roster routes;
- facility-native recruitment entrances over the same existing market after P09 creates truthful owners;
- fact-backed career records and P08 person-history adapters.

### Not ready

- a new `Star` status law;
- training;
- relationships/chemistry;
- morale, stress, burnout, needs, addiction, or wellbeing simulation;
- aging, retirement, alumni transition, or death;
- ordinary Crew/Extra/Builder identities;
- renewable or rival talent market;
- comparative Power Rankings.

P10 must preserve the public information boundary: OVR is a discipline-specific perceived craft summary; Estimated Potential remains a qualified estimate; exact ceilings, actual skills, actual genre experience, and RNG state never cross the bridge.

## 6. Accepted P07 consumer limits

The stack must carry these facts without strengthening them:

- `StudioFilmResultSnapshot.id` equals immutable `productionId`.
- Titles are display data and are not separately frozen on `FilmResult`.
- Participants and frozen forecasts exist only where captured.
- A missing requested result cannot fall back to a different result and count as proof.
- Durable result records do not imply every historical navigation route already exists.
- Windowed `studioEvents` rows are not permanent history.
- Existing permanent event IDs participate in production-ID reservation; P08 retention cannot break that safety law.
- P07 did not create a universal external event-receipt contract.
- Locked active-run totals remain projected to the player; no consumer may expose them as settled final truth.

## 7. Branch, checkpoint, and acceptance law

Recommended implementation pair:

```text
wip/p08-p10-autonomous-stack-01-ts
wip/p08-p10-autonomous-stack-01-client
```

Campaign branches remain frozen at the accepted P07 pair during implementation. Preserve immutable P08, P09, P10, and final-stack candidate pairs. Never launch an older binary against a profile migrated by a newer checkpoint. The Owner’s durable profile remains read-only to automation; every migration and bisect uses a private compatible copy.

The final Owner test is described in `CODEX-P08-P10-OWNER-ACCEPTANCE-AND-P06-P07-REGRESSION-PLAN.md` and `P08-P10-COMBINED-OWNER-PLAYTEST.md`.

## 8. Status

This document records Owner intent for Current Ops review. It does not command a coding agent, create an implementation branch, move a campaign ref, or authorize P08–P10 execution.

**CURRENT OPS PM FINAL AUTHORIZATION REQUIRED.**
