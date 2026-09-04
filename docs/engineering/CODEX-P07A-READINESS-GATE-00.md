# Project: Studio — P07A Readiness Gate 00

**P07 = RECEPTION / RELEASE OUTCOMES / BOX-OFFICE RESULT TRUTH (the new consumer of existing engine truth).**

## Disposition: **NO-GO for implementation — BLOCKED on Owner design-law decisions**

Readiness, reconnaissance, and a provisional charter are complete (`CODEX-P07A-IMPLEMENTATION-RECONNAISSANCE.md`,
`CODEX-P07A-IMPLEMENTATION-CHARTER.md`). Per the P06D.2 ruling §15, implementation may begin **only** if the
gate is clean *and* there is no unresolved Owner-law decision. Reconnaissance surfaced several **material**
design-law ambiguities of exactly the kind §15 names (player-facing score semantics; revenue timing; result
reveal timing; economy implications; audience/business persistence). **These must not be invented.** The gate
therefore stops here with the exact decisions required.

Everything upstream is GREEN:
- Technical promotion done (campaign FF: `living-lot-ts`=`72217af`, `living-lot-client`=`b0c780b`; ledger commit `bc535cf`).
- P06 boundaries intact; rollback candidates preserved.
- Base is clean and coherent; save/schema/projection confirmed (**save V16 · protocol 4 · projection 14**).

## 1. What is already TRUE (build ON — do not reinvent)

The release→result pipeline is **implemented and authoritative in the pure TS core** (verified in recon):
- `tick.ts` steps 2-3: committed-only dispatch → admission-witness gate → `resolveReception` → `buildFilmResult`
  → cash/economy credit → commitment prune. Two-tick separation (commit week *t*, result week *t+1*).
- `FilmResult` (types.ts:241) persists critic (`criticScore/Mean/Sigma/reviewVariance`), audience (`segmentScores`),
  business (`boxOffice.opening/total`), craft/cohesion/delivered — **append-only on `studio.releasedFilms`, never
  pruned, seed-deterministic, permanent**. `TheatricalRun` persists `weeklyGross[]`/studioShare.
- Three **separate** channels (critic scalar → stars; audience per-segment tier — *no invented single score*;
  business box office). Standing deltas ruled (D-6: awareness=reach, prestige=critic-only/no commercial effect, confidence=ROI).
- Exact-ID isolation via `productionId` (same-title/same-concept safe; heavily tested).
- A **browser-only** reveal chain (`ReleaseResult`/`NewspaperReveal`/`Autopsy`/Film Chronicle/`studioRunRecap`) —
  deterministic, reconstructable. **Keep; do not roll back; do not extend.**

So P07 is a **new authoritative bridge projection + a new Unity result-consumer surface over existing truth**,
plus a small set of Owner-gated semantic/economy choices. It is NOT a new results primitive.

## 2. What is MISSING (the port surface — implementable once unblocked)

- No numeric release-result DTO on the wire (`StudioReleaseResultsProjection` = `{id,title,reception 4-band(criticScore-only),weeksAgo}` only).
- No post-release results projection (`bridge/release.ts` is pre-release/decision only).
- No Unity result-reveal surface/workspace (`StudioWorkspaceHost` = casting + production only); no post-COMMITTED rail lifecycle.
- Audience score computed-then-discarded (`weightedAudienceScore` not stored); business/profit not stored (budget on `Production`, pruned at release).
- Reception verdict **forked three ways** (lot band; newspaper critic/audience tiers; broadcast) + two duplicated helpers (`filmCommittedCost`, `filmAudienceScore`) core↔adapter — should be unified into one authoritative core reception primitive before P07 layers on it.

## 3. Boundary findings (must be adjudicated)

- **B1 — legacy reception memo.** `StudioBridgeClient.OnGUI:1506-1514` renders `CRITICAL RECEPTION · FLOP/MIXED/HIT/SMASH`
  during the First-Film-Journey "Released" beat, sourced from the authoritative wire band. Is this a P06-boundary
  violation to gate/remove, or grandfathered onboarding? (Decision D9.)
- **B2 — FILM-CHRONICLE-V1 baseline.** Implemented+closed but on `operation-hollywood-autonomous-marathon` only —
  **unmerged to the P06 campaign branch.** P07 building on it must confirm the authoritative baseline. (Decision D8.)

## 4. Classification vocabulary
- **AUTHORITATIVE-EXISTING** — pure-TS truth already computed + persisted (FilmResult/TheatricalRun/reception.ts/economy.ts/standing.ts).
- **PRIMITIVE-EXISTING** — implemented but browser-only / thin (newspaper.ts read-models, studioRunRecap, coarse reception band).
- **PORT-MISSING** — no Unity/bridge equivalent (numeric results DTO, result workspace, post-COMMITTED lifecycle).
- **OWNER-LAW-OPEN** — a semantic/economy/product choice that must not be invented (§5 below).

## 5. GO/NO-GO adjudication

**NO-GO.** Blocked on the following Owner decisions (the exact decisions required; grouped; §15 triggers marked ⛔).

| # | Decision | Why it blocks | §15 trigger |
|---|---|---|---|
| **D1** | **Audience score: persist vs derive.** Store `weightedAudienceScore` (0..100) on `FilmResult` (→ save **V17**, additive-optional) OR re-derive from `segmentScores`+shares each projection (no bump)? Confirm the authoritative audience value + bounded range/unit. | Determines save version + authoritative-truth shape | ⛔ audience |
| **D2** | **Business result: persist vs derive + distributor/exhibitor split.** Store frozen business (revenue/profit/ROI) on `FilmResult` at release (V17) OR reconstruct from ledger+`theatricalRuns` (budget is on `Production`, pruned at release)? And: introduce a distributor/exhibitor split so **studio revenue < box-office gross**, or keep the disclosed "Studio Revenue = full box office"? | Save version + an economy lever | ⛔ business + economy |
| **D3** | **Player-facing result semantics on the NEW (Unity) surface.** What a released film shows — critic star band / audience tier / single verdict / box-office chip / state-chip-only — and whether to unify the 3 forked reception thresholds into ONE canonical core reception-verdict helper. | Defines the whole result UI + a core refactor | ⛔ score semantics |
| **D4** | **Reveal timing + availability trigger.** When the result becomes visible (release tick / end of opening week / run close), whether the lot/rail surfaces it or the player opens the film (the conceptual `optionalResultAvailability` trigger). | Defines the reveal contract | ⛔ reveal timing |
| **D5** | **Revenue/financial timing on the primary surface.** Box office per-week (run progressing) vs one settled total; and does money/profit render on the primary rail/lot surface at all (today §26: the rail carries no money)? | Revenue timing + §26/§29 boundary | ⛔ revenue timing |
| **D6** | **Released lifecycle + world attach / world-first cadence.** Exact `operationalState` tokens (RELEASED vs IN THEATERS), run-active/ended, when a film leaves the rail; where a result attaches (Post building via prod-id / a Theater/Box-Office body / non-spatial library); and whether the reveal is a lot-native overlay (world alive behind) or a dedicated screen. | Product-law spec + world-first contract | ⛔ (world-first) |
| **D7** | **Reveal presentation law.** Celebration restraint tier (flop→award), skip/instant control (vs launch-order #17 "make the player's movie visible"), and whether to animate the multi-week `weeklyGross` curve. | Tone/pacing that touches launch order | — (charter-defaultable w/ confirmation) |
| **D8** | **FILM-CHRONICLE-V1 baseline.** Is it the authoritative baseline P07 builds on, and should it be merged/rebased onto the P06 campaign branch first? (Currently marathon-branch only.) | Baseline/sequencing | — |
| **D9** | **Legacy reception memo (B1).** Gate/remove it before P07, or grandfather it as onboarding? | Boundary integrity | — |
| **D10** | **P07 scope + ownership.** New campaign save root (box-office/premiere/awards ledger → V17) vs reconstruct-from-existing; which campaign owns P07 vs awards (C3) vs era (C4); and the concept re-greenlight / duplicate-title-library rule. | Scope/sequencing + save-root | — (D10 economy portion ⛔) |

## 6. NO-GO criteria (any true ⇒ stop) — CURRENT STATE
- [x] A material design-law choice from §15 is unruled → **TRUE** (D1–D6).
- [ ] Base can't fast-forward / dirty tree → false (promotion clean).
- [ ] Result computation would move into Unity → not proposed (charter forbids it).
- [ ] A P06 boundary would be rolled back → not proposed.

## 7. Disposition
**Return to Owner for D1–D10.** On receipt of D1–D6 (minimum; D7–D10 may be charter-defaulted with Owner
confirmation), the charter's Wave plan is executable on `wip/p07a-reception-outcomes-01-{ts,client}` per §16.
Until then: **do not create the WIP branches, do not implement, do not touch campaign refs.** No P06 Owner
acceptance is claimed.

## 8. Hard exclusions (carried into any P07 work)
Result computation stays in TypeScript (Unity never computes a result). No runtime LLM; no editorial feedback
into simulation. Hollywood Wire is a separate consumer — no compile/runtime dependency; P07 only *emits* typed
receipts where clean. No awards ceremony / rival premieres / film charts unless an Owner decision routes them here.
The three channels (critic / audience / business) never collapse into one universal score.
