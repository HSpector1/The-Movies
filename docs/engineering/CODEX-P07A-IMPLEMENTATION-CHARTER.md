# Project: Studio — P07A Implementation Charter (PROVISIONAL — gated on Owner decisions D1–D6)

**P07A = Reception / Release Outcomes / Box-Office Result Truth — first complete normal-person route.**
This charter is executable **only after** the Owner rules D1–D6 (`CODEX-P07A-READINESS-GATE-00.md §5`).
D7–D10 may be charter-defaulted with Owner confirmation. Until then: **do not create WIP branches, do not
implement, do not touch campaign refs.** No P06 Owner acceptance is claimed by this document.

## 1. Exact base SHAs
- TypeScript: base from `campaign/living-lot-ts` = **`bc535cf`** (product `050b98e`; contains `72217af`) — WIP `wip/p07a-reception-outcomes-01-ts`.
- Unity: base from `campaign/living-lot-client` = **`b0c780b`** — WIP `wip/p07a-reception-outcomes-01-client`.
- Push empty branches before any edit. Do not move campaign refs until technical seal.

## 2. Authority map
- **Result truth = TypeScript pure core, authoritative and already computed** (`reception.ts`/`economy.ts`/`FilmResult`/`TheatricalRun`). Unity **never** computes a result.
- Three separate channels: **critic** (scalar `criticScore` 0-100 → star projection), **audience** (per-segment `segmentScores` → tier; no invented single score unless D1 rules otherwise), **business** (box office opening/total + weekly run). Never one universal score.
- Standing deltas ruled (D-6). Result **permanent**, seed-deterministic, never re-rolled.
- Hollywood Wire is a **downstream consumer**: P07 may *emit* typed authoritative receipts where clean; no compile/runtime dependency; no runtime LLM; no editorial feedback into simulation.

## 3. Save / schema / projection expectations
- **Projection 14→15** (additive results DTO; regenerate `generated/unity/*` + manifest; Unity mirror byte-identical via the consumer lock).
- **Save V16→V17 IFF** D1/D2 rule audience/business as *stored* facts → add as **optional** fields on `FilmResult` (precedent `forecast?`/`participants?`); V17 envelope + `convertV16ToV17`; legacy/M0A films degrade gracefully. If D1/D2 rule *derive-at-projection*, **no save bump**.
- Every bounded new term gets a stated range + unit test (CLAUDE.md law).

## 4. File-owner & collision doctrine (FINAL — one owner per collision-prone file)
Per `CODEX-P07A-IMPLEMENTATION-RECONNAISSANCE.md §9`. Single-file lock points (exactly one owner each): `tick.ts`
step-3 reception block; the `FilmResult` type; the `Action`/projection unions; the one canonical reception-verdict
helper; `bridge-schema.ts` version bump; the Unity `StudioMovieRailContracts.ProductionLifecycle` seam.

## 5. Implementation waves (executable once unblocked; spine = the §11 first player journey)

- **W0 — Core reception unification (Core Result owner).** Collapse the three forked reception verdicts + two
  duplicated helpers into ONE authoritative pure core reception-verdict/finance primitive (no behavior change;
  characterization tests first). *Gated by D3 (canonical thresholds).*
- **W1 — Authoritative result completeness (Core Result owner).** Per D1/D2: either persist optional
  audience/business fields on `FilmResult` (V17) or expose a pure derive. Capture business at release if persisted
  (budget is pruned). Save round-trip + determinism tests. *Gated by D1, D2.*
- **W2 — Post-release projection + DTO (Contract owner).** New `bridge/releaseResults.ts` (or extend `release.ts`)
  emitting numeric critic/audience/business + weekly run + release history; projection 14→15; regenerate DTOs +
  manifest; contract + CF-09 tests. *Gated by D3, D5 (what's exposed).*
- **W3 — Released lifecycle + world cue (Unity Rail/World owner).** Per D6: add post-COMMITTED `operationalState`
  tokens (RELEASED/IN THEATERS) via the single `ProductionLifecycle`→`ProductionGroup` seam; a `PostWorldCue`
  Released/NowShowing with dominance rank; world attach point. *Gated by D6.*
- **W4 — Result reveal consumer (Unity Result owner).** A read-only, compute-free `StudioReleaseResultContracts`
  + reveal surface (workspace or lot overlay per D6): staged, skippable, deterministic playback of the frozen
  result; critic stars → audience tier → opening box → profit/loss → forecast delta; accessibility minima carried
  from P05A. *Gated by D3, D4, D6, D7.*
- **W5 — Boundary hygiene (Lead).** Adjudicate B1 (legacy IMGUI reception memo) per D9; confirm FILM-CHRONICLE-V1
  baseline per D8.
- **W6 — Continuity/proof (Proof owner).** New deterministic post-release oracle scenario (a released film with a
  result), real-profile-copy journey extension, save/reload determinism, batch-order/no-duplicate-release proof.
- **W7 — Visual oracle + HID (Proof owner).** Result-reveal visual oracle capture + sidecars; real owner-input HID
  over the reveal (focus/selection, no accidental activation, no camera hijack).
- **W8 — Integration, hostile review, seal (Lead).** Fresh hostile review; campaign refs move only at technical seal.

## 6. First player journey (§11) — the acceptance spine
1. Film Committed to Release → 2. advance one authoritative week → 3. film actually releases → 4. durable result
identity → 5. player understands critic / audience / business as **distinct** things → 6. result explains
important drivers where authoritative → 7. save/load preserves it → 8. same-title films exact-ID isolated →
9. no duplicate release → 10. no click-order RNG leak → 11. world/rail/result surfaces agree → 12. historical
result inspectable. (Each becomes a proof assertion in W6/W7.)

## 7. Proof pyramid
TS full floor + new determinism/round-trip tests · Unity full EditMode + new result-contract tests ·
projection/CF-09 contract verification · post-release visual oracle (new scenario) playerExit 0 ·
real-profile-copy journey (durable original untouched) · real owner-input HID PASS · responsive · fresh hostile review.

## 8. Runtime / visual / HID proof
Runtime: engine produces the result deterministically; Unity renders pure playback (mutationsSubmitted==0).
Visual: oracle capture of the reveal + durable sidecars (product/unity commit, exe hash, schema/protocol/projection/save,
fixture id/hash, viewport, image sha256+dims, machine assertions). HID: real input over the reveal surface.

## 9. Owner journey (acceptance)
A short journey mirroring §6 the Owner can run post-seal: commit → advance → see the three channels distinctly →
inspect drivers → save/load → confirm exact-ID isolation + no duplicate release + world/rail/result agreement.

## 10. Hostile-review axes
Result computed in Unity (must be 0) · any channel collapsed into one score · non-deterministic reveal / re-roll ·
save-migration data loss / legacy-film crash · duplicate release / click-order RNG leak · money on the rail without
authorization (D5) · browser reveal chain extended · Hollywood Wire runtime dependency · world-first cadence broken
(unauthorized full-screen modal) · reception thresholds still forked · boundary memo (B1) unresolved.

## 11. Integration rules
Fast-forward only at technical seal; no squash/rewrite/merge-to-main/Golden tag; preserve rollback candidates;
one owner per collision-prone file; empty WIP branches pushed before editing; Unity generated-contract mirror kept
byte-identical; do not claim Owner acceptance.

## 12. Charter validation / status
**PROVISIONAL — NOT executable.** Blocked on D1–D6. On receipt, this charter's waves are executable from the
repository alone. No implementation, no WIP branches, no campaign movement until then.
