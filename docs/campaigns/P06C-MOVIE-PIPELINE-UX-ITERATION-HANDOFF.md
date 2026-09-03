# P06C — Movie Pipeline Rail + Living Lot Iteration Lab — HANDOFF

> Durable campaign memory (§3). Updated + pushed after every coherent iteration.
> Nothing meaningful may live only in scratch, /private/tmp, a process, chat, or an unpushed tree.
> **Isolated successor candidate — NO campaign integration** (§24). P06B is the byte-preserved control.

## Status: PRIORITY ZERO FIXED + PROVEN — iterating (movie rail next)

## 1. Campaign clock & environment (§3)

- **Start (local):** 2026-09-03 12:00:43 CEST
- **Start (UTC):** 2026-09-03 10:00:43 UTC
- **Hard deadline (local):** 2026-09-03 20:00:43 CEST (+8h)
- **Machine:** Bruces-MacBook-Pro.local · macOS 26.6.2 (25G83) · Darwin 25.6.0 · arm64 · 614 GiB free
- **Unity:** 6000.3.22f1 (1c726e1fb402) · **Node:** v24.16.0
- **P06C caffeinate pid:** recorded in scratch `p06c-caffeinate.pid` (stop at deadline; the Owner's own
  `~/Desktop/project-studio-caffeinate.pid` is separate and must NOT be touched).

## 2. Exact P06B CONTROL (resolved in full, verified intact — §1)

The comparison control. **Do not overwrite; do not move its campaign refs.**

| Item | Exact value |
|---|---|
| Preserved candidate dir | `~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/` (README + player + launcher + oracle-evidence + proof + docs) |
| TS campaign tip (docs) | `04b67eccb50ac59484372a2c78b9455cee0ef9f3` (`campaign/living-lot-ts`, hspector-github; == `wip/p06b-...-ts`) |
| TS engine/product commit (build binding) | `493ca8091c9df669a6363555a68419731625449e` (P06A TS; engine bundle unchanged in P06B) |
| Unity product/campaign tip | `18a288715bb88281dcc51f4252858f2fbabff404` (`campaign/living-lot-client`, origin; == `wip/p06b-...-client`) |
| Player exe sha256 | `130a13a0f19e688fc2bb4b8ba4bd9282430b3d62ecd105f3ff7ad4651d534d49` ✅ verified on disk |
| Assembly-CSharp sha256 | `3ba5ba105bd2c4d757b0dbdb8695bb98f278c5a24cbc8ed5c92ed22d502ff623` (per sealed manifest) |
| Engine bundle sha256 | `a74ed0dde22a365eac0b14b8cae168f28dac13b87856e584301a1e15546b9aab` |
| schema / protocol / save | `sha256:71529afd…` · protocol 4 · save **V16** (latest migration `saveVersion !== 16`) |
| projection | no separate `projectionVersion` constant in the bridge — protocol 4 governs the `productionOperations[]` DTO projection |
| P06A candidate (also preserved) | `~/Desktop/P06A-Owner-Candidate-465ab45-7d6d974/` exe `aabc41f8…` ✅ verified intact |

**Control integrity check (this session):** P06B exe on disk = `130a13a0…` (matches manifest);
P06A exe on disk = `aabc41f8…` (matches record). Neither candidate dir was written.

## 3. Campaign refs baseline (must remain UNCHANGED through P06C — §24)

- `campaign/living-lot-ts` = `04b67ec` (local == remote confirmed at setup)
- `campaign/living-lot-client` = `18a2887` (local == remote confirmed at setup)

These are recorded so the final report can prove they never moved. P06C never touches them.

## 4. P06C isolated branches + worktrees (§2)

| Repo | Branch | Base | Worktree | Pushed |
|---|---|---|---|---|
| TypeScript | `wip/p06c-movie-pipeline-ux-01-ts` | `04b67ec` | `/Users/bruce/The Movies - P06C Impl TS` | hspector-github ✅ |
| Unity | `wip/p06c-movie-pipeline-ux-01-client` | `18a2887` | `/Users/bruce/The Movies - P06C Impl Unity` | origin ✅ |

One editing owner per checkout / collision-prone file. Campaign branches are not edited. No end merge.

## 5. Priority Zero (§5) — rail/workspace state-truth contradiction

**Symptom (from the P06B report):** the movie rail can correctly show `POST · WAITING` while an
unchanged Production *workspace* card still shows `SHOOTING` for the **same** wrapped/waiting movie.
**FIXED + PROVEN (commit 2240df8).** Reproduced visually on the control (P06B build, Oracle scenario 2):
left guidance card said **SHOOTING** while the rail correctly said **POST · WAITING** for the same
`prod-0002`. Seam map + a Unity grep proved the live *workspace/stage/post* surfaces already read
`operationalState` (correct); the real live stale reader was the **left guidance card**, composed by
`src/core/firstFilmJourney.ts` from the **raw `workflow.phase`** (which stays `'shooting'` for a wrapped
picture until a Post reservation frees). Root cause was the state owner, not a string.

- **Fix:** `inProductionView()` now detects `wrapped-waiting-for-post` from the same core facts
  `closedOperationalState()` uses (phase + facility-capacity blocker → postProduction), ahead of the
  phase-keyed branches, and emits agreeing copy (`WAITING FOR POST` / beat `post-production` /
  "Principal photography wrapped."). Raw `phase` (oracle-pinned engine truth) untouched.
- **Regression test:** `ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts` loads the
  canonical scenario-2 fixture and asserts the rail projection AND `firstFilmJourney` agree (never
  SHOOTING). 11/11 pass; 117/117 journey/guidance suites green.
- **Visual proof:** `docs/campaigns/evidence/p06c/priority-zero/` — before(P06B)/after(P06C) at 1440×900
  (left card flips SHOOTING → WAITING FOR POST), Oracle playerExit=0 (machine truth unchanged), DTO
  snapshot, README.
- **Latent (documented, no live reader):** the DTO still ships legacy phase-family display fields
  (`phaseLabel`/`statusLabel`/`taskStatus`) + a dead `StudioStageProductionPresentation.Resolve()` that
  reads `operation.phase`; grep confirms **no live Unity surface reads them**. Defense-in-depth hardening
  is a tracked follow-up, not the live bug.

## 6. Wave ledger

- [x] §1 Control preserved + identities resolved + integrity verified
- [x] §2 P06C branches created + pushed; isolated worktrees
- [x] §3 Clock + this handoff + caffeinate
- [x] §5 PRIORITY ZERO — truth contradiction reproduced + fixed + regression-tested + visually proven (2240df8)
- [x] §6 Original The Movies IA comparison matrix (`docs/research/P06C-ORIGINAL-THE-MOVIES-IA-MATRIX.md`, 68b045a)
- [ ] §7–§13,§17–§18 Movie rail IA / row anatomy / lifecycle / attention / interaction / responsive / perf
- [ ] §14 People/Talent awareness (bounded)
- [ ] §15 Building-card convergence (bounded)
- [ ] §16 Workspace/guidance convergence (smallest shared)
- [ ] §17,§19 Accessibility/responsive stress + before/after capture matrix
- [ ] §22 Test/proof pyramid
- [ ] §23 Fresh hostile review → ACCEPT
- [ ] §24–§25 Preserve P06C comparison candidate + final report

## 7. Owned processes

- `caffeinate -dimsu` (P06C keep-awake) — pid in scratch `p06c-caffeinate.pid`. **Stop at deadline/seal.**

## 8. Exact next action

Reproduce Priority Zero (§5): stand up the bridge on a wrapped-waiting fixture, read `/snapshot`, and
diff what the rail projection vs the Production/Post workspace presentation each derive their state from.
