# P06B — Living Studio UI/UX & Visual Convergence — FINAL REPORT (§34)

## P06B STATUS
**KEEP CANDIDATE — OWNER ACCEPTANCE PENDING.** A materially-improved Living Studio UI/UX pass:
the movie rail (primary goal), the executive HUD (incl. a real narrow-viewport P1 fix), and a shared
visual language — presentation-only, fully proven, fresh-hostile-reviewer **ACCEPT** (0 blocking).

## CAMPAIGN WINDOW
- Start (local): 2026-09-03 09:04:28 CEST · (UTC) 07:04:28 · Hard deadline: 2026-09-03 21:04:28 CEST.
- Machine: Bruces-MacBook-Pro.local · macOS 26.6.2 arm64 · Unity 6000.3.22f1 · Node v24.16.0 · session unlocked/on-console.

## P06A BASELINE (preserved, exact)
- TS product/WIP tip `493ca8091c9df669a6363555a68419731625449e`; engine bundle commit `501859d` (`a74ed0dd…`).
- Unity WIP tip `7d6d974850054f67f44ec038e1288d1deffb2e10`.
- Original candidate exe sha256 `aabc41f80295c2c6…a00cf` (Assembly-C# `43188ee0…`). Preserved at
  `~/Desktop/P06A-Owner-Candidate-465ab45-7d6d974/` — **verified intact, NOT overwritten**.
- **P06A HID baseline (§4): COMPLETED — PASS** on this session's unlocked GUI (the P06A F4 blocker
  was purely environmental). Real CGEventPost commit click flipped prod-0000 release-ready →
  release-committed (machine + visual verified); byte-identical worktree build, binary untouched.
  Evidence: `docs/campaigns/evidence/p06a-hid-baseline/`.

## P06B FINAL SHAs
- TypeScript product/impl branch `wip/p06b-living-studio-ux-convergence-01-ts` (hspector-github).
- Unity product/impl branch `wip/p06b-living-studio-ux-convergence-01-client` (origin) tip `18a2887`.
- Sealed P06B player: exe sha256 `130a13a0f19e688fc2bb4b8ba4bd9282430b3d62ecd105f3ff7ad4651d534d49`,
  Assembly-C# `765dfc00…`, engine bundle `a74ed0dd…` (engine unchanged from P06A), Unity `18a2887`.
- Campaign fast-forward tips: **[FINALIZED AT §30 SEAL]**.

## REFERENCE DELTA (§6/§8)
`docs/research/P06B-LIVING-STUDIO-UX-REFERENCE-DELTA.md` (+ full synthesis). Lead decision: adopt the
Visual Direction Package 01 STRUCTURE (type ladder, spacing, greyscale-safe semantic palette, lifecycle
iconography, focus, min targets, forward-outranks) on the TOUCHED surfaces only — **no broad dark
reskin** (the package is a pending candidate; §21/#30). Original *The Movies* used only as an
information-architecture reference, never pixels/trade dress.

## VISUAL SYSTEM (W0)
`Assets/Studio/Runtime/Infrastructure/StudioUiTokens.cs` — one shared language: type ladder
(meta/body/card-title/numeric), spacing rhythm, semantic states where **colour always rides a word +
shape** (action=oxblood ▸, blocked=amber "· WAITING", committed=green, brass selection accent), light
surface family. Consumed by the rail + HUD so they read as one set (fixes audit "no shared tokens").

## TOP HUD (W1) — `StudioLivingTimeHud.cs`
- **P1 FIX:** the executive heartbeat no longer vanishes at 1280×800. Root cause: the chip was
  height-suppressed by a threshold derived to clear a *founding* confirm sheet that cannot render
  post-founding. Added `ChipShownForPlay` (post-founding band; a distinct method, not an overload, so
  reflection guards stay exact) + founding-aware `ChipShownNow`; the Development card reserves via the
  same gate. The founding-time reserve + `ChipMinimumHeight` derivation are UNCHANGED.
- Active speed/pause is now an unmistakable **filled brass chip**; transport min-height 22→30.

## MOVIE PROGRESS RAIL (W2 — PRIMARY) — `StudioProductionRailHud.cs`
- **Unified container** behind the rows (was detached floating boxes); widened 264→304 so titles stop
  clipping; **graceful ellipsis** (`FitTitle`) for the longest titles (no more mid-glyph clip).
- **Six-segment discrete lifecycle track** per row (Development→Committed, indexed by the exact
  operationalState→lifecycle enum) — **never a fabricated percentage**.
- Semantic left-accent + coloured time-line; committed=green "Releases next week".
- **Behaviour preserved:** rail selects/Locates only (commits nothing), exact-productionId keying, all
  guarded source markers intact. Rail never gameplay authority; physical world works without priming.

## TALENT / PEOPLE ACCESS (W3)
Preserved: the Casting/Talent world building is the persistent talent entry; the casting-shortage
→ Find-an-Actor route is untouched and works. A dedicated persistent People roster rail is documented
future scope (reference delta: "reserved for a later package"); not scaffolded.

## BUILDING CARDS (W4)
The world building/entry card + selection surfaces are unchanged and work (world-click without rail
priming proven via HID). The dark selection overlay + the light command surfaces form a coherent
two-tier system. Deeper building-card convergence is documented future scope.

## WORKSPACE CONVERGENCE / LOT LIFE / GUIDANCE / ECONOMY / A11Y (W5–W9)
Not in this focused pass (documented future scope). The lot life is already strong (unchanged); the
economy HUD shows authoritative cash + weekly direction (no retune — TUNING untouched); no a11y
regression (D-16/D-17 suite unaffected — presentation-only Unity delta).

## OWNER-PROFILE COPY JOURNEY (§24)
`scripts/p06-real-profile-journey.mts`: **25/25** on a copy of the real campaign profile — V15→V16
migrate (3 productions + week survive), hold law (nothing auto-releases), commit advances no time and
the next tick dispatches exactly the committed picture, full journey reaches a release, Save/Load
round-trips, and the **durable original is provably untouched** (sha `d949003e…` unchanged, still read-only).

## P06 VISUAL ORACLE (§23) — six scenarios
idle-post · wrapped-waiting-for-post · active-finishing · release-ready · committed-to-release ·
multi-picture-contention. All **playerExit=0** (machine assertions pass), **all image bytes inspected**:
unified rail + lifecycle track + no truncation, commit affordance at Release Ready, committed=green
"releases next week" (no P07 leak), all active movies shown with exact-ID isolation, world dominant.
Bound to the sealed exe. **[RE-RUN ON exe 130a13a0 — RESULT AT §30 SEAL]**

## UX CAPTURE SET (§22) — before/after
`docs/campaigns/evidence/p06b-implementation/ux/` — BEFORE(P06A) vs AFTER(P06B) at 1440 + 1280.
The 1280 pair shows the executive HUD absent (before) → present (after); the 1440 pair shows ragged
floating boxes with clipped titles (before) → one unified portfolio with full titles + phase tracks (after).

## TEST FLOOR (§26)
- TypeScript: **4903 passed / 0 failed** (5 skipped, 359 files) — P06B TS is docs-only over P06A.
- Bridge/contract: **CF-09 unaffected** — no DTO/Generated/projection change (presentation-only delta).
- Unity EditMode: **731/731** (added a post-founding heartbeat coverage test; updated one source pin to
  the corrected call — strengthened, not weakened). **[RE-CONFIRMED ON 18a2887 — AT §30 SEAL]**
- Machine (profile 25/25) · Visual (oracle 6/6) · HID (§25 PASS) — each a separate layer.

## HOSTILE REVIEW (§28)
One fresh independent reviewer, 30 criteria, opened 9 PNG byte files, verified diff integrity + finance
traces to snapshot. **VERDICT: ACCEPT — 0 blocking, 0 regressions.** Non-blockers: N1 longest-title
clip (**FIXED** — graceful ellipsis, this build) ; N2 the unchanged P06A *workspace* copy lags the
correct rail on wrapped-waiting (F2 family, out of presentation-rail scope) ; N3 one capture caught a
transient bridge-refresh (re-captured clean). **[ROUND-2 CONFIRMATION OF N1 FIX — AT §30 SEAL]**

## FINAL CANDIDATE
`~/Desktop/P06B-Owner-Candidate-<ts>-<unity>/` — sealed app, launcher, manifest, exe/engine/Assembly-C#
hashes, contract identity, evidence index, six Oracle images, key before/after UX images, Owner
playtest. **P06A candidate NOT overwritten.** **[CREATED AT §30]**

## KNOWN NON-BLOCKERS
- N2 (F2 family): the P06A Production *workspace* card can say "SHOOTING" for a wrapped-waiting picture
  while the rail correctly says "POST · WAITING"; the rail reads engine `operationalState` truth. Fixing
  the workspace copy is out of P06B presentation-rail scope + touches C1-adjacent code — an Owner ruling.
- Focus-visible keyboard ring not verifiable from static frames (not a regression).
- W3–W9 deeper waves are documented future scope; the primary goal (rail) + P1 HUD fix + shared tokens
  are delivered and proven.

## REMOTE / WORKTREE / PROCESS STATUS · OWNER PLAYTEST · LAUNCH · NEXT ACTION
**[FINALIZED AT §30 SEAL]** — Owner playtest script: `docs/campaigns/P06B-OWNER-PLAYTEST-SCRIPT.md`.
