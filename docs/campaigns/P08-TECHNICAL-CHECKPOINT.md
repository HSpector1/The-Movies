# P08 TECHNICAL CHECKPOINT — Standing & Studio History Spine V1 (core)

**Status:** `P08 CORE TECHNICAL KEEP — OWNER ACCEPTANCE PENDING — CAMPAIGN BRANCHES UNCHANGED`
**Authorization:** `OPS-P08P10-20260905-01` · **Campaign policy:** `CAMPAIGNS_FROZEN_UNTIL_P08_P10_OWNER_ACCEPTANCE`
**Written:** 2026-09-05 (this document is a seal record; failures on the way are kept, not rewritten)

> This checkpoint claims a TECHNICAL result only. No Owner playtest was requested or performed. Nothing here is P08 Owner acceptance.

## 1. Pair

| Item | Value |
|---|---|
| Accepted base (frozen) | TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` |
| `FINAL_DOCS_SHA` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` |
| **P08 core TS product commit** (`wip/p08-p10-autonomous-stack-01-ts`, remote `hspector-github`) | `8a23cb3b3c8e9d4780417ca44c60312b1bfd12bc` (last product/source change; the documentation tip is the commit carrying this document — recorded in the handoff CURRENT STATE) |
| **P08 core Unity product commit** (`wip/p08-p10-autonomous-stack-01-client`, remote `origin`) | `64dab80e4dfd80fc4c0a559bc1a4034c44b5cc9e` (the sealed player is built from this commit, `dirty:false`). Ladder: `9f64006` (W4) → `fded233` (harness only) → `64dab80` (W4b: HID-caught People-pane wording fix, §6.6) |
| Save / protocol / projection | **V17** / 4 / **16** |
| Canonical schema id | `sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236` (`$id urn:project-studio:bridge:protocol-4:projection-16`) |
| Generated contract | `generated/unity/StudioBridgeDtos.Generated.cs` sha256 `8aad2079d94516394e910b4c009136ad90b4fb72b14067452357c1a961bb1984`, git blob `223564d188974e8eb6ce74fdfdca8e59d99bfe1c` — byte-identical in Unity `Assets/Studio/Runtime/Data/Generated/` |
| CF-09 `verify:bridge-contract-consumer --verify-only` | PASS (seal mode) at TS `90a3635e` × Unity `685f113e`; contract untouched since |
| Player | exe sha256 `043ae03e3abbb11388d66c06a34b59a9468196fb95f0f689c8f75ad17b149647` · Assembly-CSharp `1c074d80616deb17ac2fc54c5a9a1d4793481f522a1f60e6675157eeb02aa138` · Unity 6000.3.22f1 · built 2026-09-05T09:17:14Z from Unity `64dab80` clean (the previous sealed exe `32262dbf…` from `9f64006` is superseded by the §6.6 fix; its evidence is preserved as run 4 / HID run 2) |
| Engine bundle | `dist/studio/engine.mjs` sha256 `67fc8a9f82cba1d308c510d044c0f82c1c8c0ad268ba0b742fac7f36838edcc0` |
| Candidate package | `~/Desktop/P08-Core-Technical-Candidate-8a23cb3-64dab80/` (player, launcher + engine + 5 demo profiles, docs, evidence, proof) |

## 2. Commit ladder (both WIP branches; nothing on `main` or the campaign branches)

| Wave | Commit | What |
|---|---|---|
| W0/W1 (TS) | `15113a026213fdcb575d5905fa6a8d312d37fe74` | `studioHistory` root, receipts at all three Standing mutation sites, significance classes, exact-once append, 52-week routine fold, V17 save + migration + downgrade guards, invariants, `tests/p08a-w0-studio-history.test.ts` (13) |
| W2 (TS) | `90a3635e175013d2b3833c389bdebe985e1babf2` | `bridge/history.ts` projection, projection 16, schema-bump law, generated contract |
| W2 (Unity) | `685f113e480ee18ea242ad8a341e7710523f840f` | DTO sync (byte-identical), normalize partials, `StudioHistoryTestFixtures` |
| handoff | `908879a9c5fa73d2015985834e951db84c69ab8a` | C1/C2 |
| W3 (Unity) | `04267dd89a042e1d88abd0edd87347493f9f2e66` | `StudioHistoryWorkspace` (+contracts, +context, +USS), host route (`OpenStudioHistory`, detour peel, Esc grammar), Administration card world route, 22 EditMode tests |
| W4 (TS) | `8a23cb3b3c8e9d4780417ca44c60312b1bfd12bc` | 8 oracle fixtures + generator, real-profile journey |
| W4 (Unity) | `9f64006559558ebb04e2b4948ad6b5d5ee956f55` | oracle runner P08 scenarios + history steps, `Tools/p08-*` harnesses, two oracle-caught visual fixes (§6) |
| W4 tools (Unity) | `fded233be86c1a0b40e0c56c9ff4190f75a85aaf` | HID driver pans Administration into frame (harness only; no Assets change) |
| W4b (Unity) | `64dab80e4dfd80fc4c0a559bc1a4034c44b5cc9e` | HID-caught: the People pane tells the week's presence fact and the frame's body fact apart (§6.6); driver framing tolerates the camera clamp |

## 3. Requirement accounting (P08, 33 rows in the traceability matrix)

| Class | Count | Rows |
|---|---|---|
| IMPLEMENT IN CORE — done in this checkpoint | 15 | 001, 002, 004, 005, 006, 007, 008, 009, 010, 011, 014, 015, 016, 017, 020 |
| IMPLEMENT AS READY EXTENSION — evaluated after core (§8), none built here | 7 | 012 (R3, after P10), 013 (R2, after P09), 018 (R1), 019 (R1), 021 (R4 records), 032, 033 (handoff contracts) |
| OWNER-BLOCKED — not implemented | 3 | 022, 023, 027 |
| DEPENDENCY-BLOCKED — not implemented | 4 | 024, 025, 026, 029 |
| DEFERRED TO NAMED PACKAGE (P08C progression) — not implemented | 2 | 030, 031 |
| REJECTED BY OWNER — enforced negatively (never built; tests refuse composites/bonuses) | 2 | 003, 028 |
| UNMAPPED | 0 | — (33 rows total, matching the matrix §3 summary) |

Negative requirements stay active in this checkpoint: no composite Studio Rating / overall score anywhere (source-pinned in `StudioP08AHistoryWorkspaceTests.Controller_IsNetworkAndCameraFree_BySource` and the oracle's tree scan), no awards/ceremony/records placeholder tab (`RecordsTab_AppearsOnlyWhenTheWireSaysRecordsAreAvailable`), no bonus import.

## 4. What was built (exact production paths)

**TypeScript (`src/core`):** `studioHistory.ts` (new), `types.ts` (history types, `GameStateV17`), `standing.ts` (`STANDING_FORMULA_VERSION`, `releaseStandingDrivers` — no formula change), `tick.ts` (release + drift receipts, `filmReleased`, `theatricalRunCompleted`, fold + invariants), `actions.ts` (`publicity` receipt, `studioFounded` landmark), `worldgen.ts`, `save.ts` (V17), `releaseAuthority.ts` (type widening), `index.ts`.
**Bridge:** `bridge/history.ts` (new), `bridge/schema/bridge-schema.ts` (projection 16, StudioHistory* DTOs), `bridge/schema/runtime.ts`, `bridge/snapshot-build-context.ts`, `bridge/session.ts`, `bridge/runtime-checkpoint.ts` (CurrentEnvelopeSave V17, prior schema id appended), `scripts/bridge-contract-consumer-lock.ts` (`CURRENT_ACCEPTED_SAVE_VERSION = 17`), `generated/unity/*`, `ui/src/engine/adapter.ts` (migration chain).
**Unity:** `Assets/Studio/Runtime/Presentation/UI/StudioHistoryWorkspace.cs`, `StudioHistoryWorkspaceContracts.cs`, `StudioHistoryWorkspaceContext.cs` (new); `StudioWorkspaceHost.cs` (history route); `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs` (Administration world route; yields while a workspace is open); `Assets/Studio/UI/Resources/StudioHistoryWorkspace.uss` (new); `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs` (normalize partials); generated DTOs; `StudioPostReleaseOracleRunner.cs` (P08 scenarios, history/selection steps); `Tools/p08-run-visual-oracle.sh`, `Tools/p08-proof-journey.mjs`, `Tools/p08-run-hid-journey.sh`.
**Tests:** TS `tests/p08a-w0-studio-history.test.ts`, `tests/bridge-p08a-w2-history-projection.test.ts`, `tests/_p08HistoryTwins.ts`, save-version pin cutover across the suite; Unity `StudioP08AHistoryWorkspaceTests.cs` (15), `StudioP08AHistoryHostTests.cs` (9), `StudioHistoryTestFixtures.cs`, one updated pin in `StudioFoundingPresentationTests.cs` (the Administration card's ONE navigation control, still no engine intent).

## 5. Gates (all at the pair in §1 unless noted)

| Gate | Result |
|---|---|
| Focused TS | `p08a-w0-studio-history` 13/13; `bridge-p08a-w2-history-projection` 4/4 (17/17 re-run by the hostile reviewer) |
| Full TS floor | at `8a23cb3b` (product tip): 365 files / 4944 passed / 5 skipped; `typecheck` + `typecheck:bridge` + `check:bridge-contract` + `check:bridge-contract:fixtures` all clean (logs in the candidate `evidence/ts-floor/`; the hostile reviewer re-ran the floor independently: 365 / 4944 / 5) |
| Save / migration / round-trip | V16→V17 twins (`tests/_p08HistoryTwins.ts`), downgrade guards, real-profile round trip (§5 below) |
| 120-year growth / performance | `scripts/measure-p08-history-growth.mts` re-measured from the product tip `8a23cb3b` (6,240 weeks; disclosed $50B solvency-floor fixture, managed operations, whisper publicity whenever legal — NOT a product claim; the fixture stops releasing after 16 films ≈ week 520, so most late rows are publicity/settling): save 2,039,441 B; history 624,990 B; 999 rows; 52 unfolded routine rows at EVERY checkpoint (52 / 520 / 2,080 / 6,240); 118 folded summaries; timeline 829 (806 standard publicity rows); avg tick 0.281 ms (the reviewer's independent run: identical counts). The figures previously written in handoff C1 (1,928,459 / 573,279 / 952 / 119 / 781) came from an uncommitted W1 state before the founding landmark and publicity receipts landed — corrected here, not rewritten there |
| Generated contract / exact consumer | CF-09 PASS (§1) |
| Unity EditMode | 806/806 at W3 (`04267dd8`); 808/808 at `9f64006`; **808/808 at the sealed product commit `64dab80`** (results XML: candidate `evidence/unity-editmode/editmode-64dab80e.xml`; batchmode run from the worktree) |
| Visual Oracle (8 scenarios, 1440×900) | **Canonical = run 5** (`evidence/visual-oracle-run5-sealed/`, 09:18Z): exe `043ae03e…`, Assembly-CSharp `1c074d80…`, Unity `64dab80` `dirty:false` — 8/8 complete, **120 machine assertions, 0 failed, 0 mutations, 19 captures**, wrap evidence passing. Run 4 (08:55Z, exe `32262dbf…`, Unity `9f64006` clean) had the identical result set (120 / 0 / 0) on the exe that HID run 2 then exercised; it is preserved as `evidence/visual-oracle-run4-prior-sealed-exe/`. Index of the earlier runs (all preserved, none canonical): run 1 (08:42Z, exe `2e72cf9d…`, Unity `04267dd`+uncommitted W4): 7/8 + one authoring error in s8 (expected "no milestones" where a post-boundary run-complete milestone is lawfully recorded), 118 assertions, 0 mutations — caught defects §6.1 and §6.2; run 2 (08:49Z, exe `fb350cac…`, Unity `04267dd`+uncommitted, manifest `dirty:true`): 8/8, 119 assertions, 0 mutations — §6.1 fixed, §6.2 STILL clipping (the ScrollView box model alone was not the root cause; those PNGs show the defect); run 3 (08:53Z, exe `6d499128…`): s1-only smoke proving the §6.2 root-cause fix (wrap assertion added and passing). Runs 4 and 5's evidence copies of the build manifest record `typescript.dirty: true` — the only untracked files at those moments were this document's draft and the hostile-review transcript (`git status` showed nothing else); the engine bundle sha `67fc8a9f…` is identical to the committed product tip's. The manifest re-emitted after the documentation commit (candidate `evidence/build-manifest.json`) reads `dirty:false` on both repositories for the same exe |
| Real HID (building → Standing → History → exact subject → Back → Save/Load) | **Run 2 (09:12Z, exe `32262dbf…` = Unity `9f64006`, driver `fded233`, 1440×900, real CGEvent input via `Tools/ownerinput`): 43/44 steps green** — lot → Administration body click → card → [OPEN STUDIO HISTORY] → STANDING channel drivers → TIMELINE MAJOR filter → exact milestone → FILMS exact row → OPEN FILM RESULT (detour) → Esc back to the same film → PEOPLE exact person → Locate disabled with reason → BACK → Save ("Saved.", durable V17 checkpoint) → Load → Administration framed by real arrow-key pan → route reopens from the world with the same exact film row. The one failed step was the driver's framing report (harness false negative, §6.6), not the product. The only Unity source difference between that exe and the sealed `043ae03e…` is the §6.6 wording fix, itself pinned by EditMode (808/808) and exercised by oracle run 5. **Run 3 (09:28Z, the sealed exe `043ae03e…` = Unity `64dab80`, TS docs tip `e20be25d`): 43/44 — every product step green, including the §6.6 wording ("No body to locate right now." read back from the live pane); the one failed step is again the driver's own framing report (the pan loop runs before the boot camera sweep settles and gives up; the settle wait that follows it and the click both land — harness ordering, fixed for future runs in the driver, no product change).** Runs were performed only inside ≥10-minute idle windows of the machine (the harness seizes the pointer/keyboard). Run 1 (FAILED, session locked) preserved. Evidence: candidate `proof/hid/run1-*`, `run2-*`, `run3-*` |
| Real Owner-profile copy (read-only source, baseline sha `d949003e…`) | `scripts/p08-real-profile-journey.mts`: 35 passed / 0 failed; baseline bytes unchanged |
| Hostile review | Independent fresh reviewer (read-only, 106 tool uses, ~15 min) on TS `8a23cb3b` × Unity `9f64006`/`fded233`: first verdict **REJECT of the checkpoint AS CLAIMED** — the code passed every law tested; the three blocking items were (1) the HID gate stood as a FAILED run, not "pending"; (2) the seal draft cited run 2 as the fixed run while run 2's captures still clip and run 4 is the clean run; (3) the growth figures in handoff C1 did not reproduce at HEAD. All three are resolved in this document (§5 rows above, §9 disposition); the code was not changed for the review. Full report preserved in the candidate `docs/HOSTILE-REVIEW-P08-CORE.md` |

## 6. Defects found on the way (kept)

1. **Oracle run 1, `overview` / `timeline-all` captures:** the legacy IMGUI Administration card kept drawing ABOVE the open UI Toolkit History workspace (IMGUI draws over the runtime panel; the card only checked the world selection). Fix: `StudioFoundingCardHud.Layer` returns `None` for the Administration branch while `StudioWorkspaceHost.Instance.WorkspaceOpen` — the same "two surfaces never compete for the same pixels" law the UI Toolkit inspector cards obey. Pinned by `AdministrationCard_YieldsWhileAWorkspaceIsOpen_BySource`.
2. **Oracle run 1, `standing-awareness` capture:** the channel's "WHAT IT MEANS" line ran off the pane instead of wrapping. First attempt (run 2): restoring the themeless-runtime ScrollView box model for `#history-list` / `#history-detail` plus the code pin `PinScrollContent` — necessary, but run 2 still clipped. Actual root cause (run 3/4): the Casting sheet's bare `VisualElement { flex-shrink: 0 }` guard, loaded on the shared root, pinned the DETAIL PANE to shrink 0 inside the body ROW with `flex-basis: auto` = the intrinsic width of its longest line, so the pane itself grew wider than the panel and every descendant was stretched to it. Fix: `.ps-history-workspace .ps-production-detail-pane { flex-basis: 0; flex-grow: 1; flex-shrink: 1; min-width: 0 }` (scoped to History so the accepted Production / Film Result panes stay as reviewed — the same latent condition exists there but their lines are short; recorded in §7). Pinned by `HistoryScrollViews_PinContentWidthAndShrink_ForTheThemelessRuntime` and by the oracle's resolved-layout assertion "long lines wrap inside the detail pane".
3. **Fixture generator, three refusals before green:** off-by-one week on tick-minted receipts; the settling bound is two 52-week buckets (≤ 104 unfolded), not one; the old-save scenario must seed from the last state with no commitment because both leaders reach Release Ready the same week on this seed. All three are recorded in the generator's comments.
4. **Build 2 crashed** in the Burst compiler server (native mono crash, exit 138) leaving `ProjectSettings.asset` and `Assets/Resources/PerformanceTest*` leftovers; reverted, rebuilt.
5. **HID run 1 (09:56Z) is a recorded FAILURE, not a pending gate:** the session was at the login window when the player launched, so the unfocused player paused at "Connecting to your studio…" (`001-timeout-lot-ready.png`); 36 of 51 steps failed for that reason; the session was unlocked mid-run and the Save → Load half then passed (`036-saved.png`: "Saved.", durable checkpoint carries a V17 save). After Load the world click missed because the home camera does not frame Administration (`043/044-*.png`) — the driver did not pan. Fixed in `fded233` (real arrow-key pan to frame the target). The run is preserved in the candidate `proof/hid/run1-FAILED-session-locked/`.
6. **HID run 2 (09:12Z, sealed exe `32262dbf…`, driver `fded233`) — 43/44 steps green, and it caught a product contradiction the machine oracles could not:** for a contracted actor the PRESENCE section read "On the lot now." while LOCATE stood disabled with "No current location." (`025-person-detail.png`). The wire's `onLot` is the WEEK's presence fact; a Locate target is a live authoritative body THIS FRAME (the world presents a bounded set). Fix: `StudioHistoryWorkspaceContracts.PersonLocationLine(person, bodyResolved)` + `NoBodyRightNowReason` — "On the lot this week; no body to locate right now." beside a disabled Locate whose reason says the same — pinned by `People_OnLotButUnresolvedBody_IsDisabledNotGuessed`. The one failed step was a harness false negative (the framing loop reported "not framed" after the camera clamp stalled the pan while the target was already inside the window — the very next click landed and the card appeared); the driver now treats a stalled pan with the target in-window as framed.

## 7. Known limitations (honest, not deferred scope in disguise)

- Person timeline rows (`careerMilestone`) are typed and validated but NOT emitted by the core in P08 core — the People tab is built from captured film credits only. Exact career/contract milestone emission is P08-R3 after P10 (P08-REQ-012), as the matrix classifies it.
- Facility milestones (`facilityCommitted/Completed/Demolished/Moved`) are typed and validated but NOT emitted until P09 supplies exact durable facts (P08-R2 after P09, P08-REQ-013). The timeline/subject-location machinery for them is in place and tested with fixtures.
- Records tab: never rendered (no complete comparison universe exists); the Overview states this in one sentence. P08-R4 / P08-REQ-021.
- Channel detail shows the newest 25 receipts with an honest "N earlier receipts not shown." line; search/filters/long-save navigation are P08-R1 (P08-REQ-018/019).
- Same-title films released in the SAME week are distinguished only by exact id and list position (both P08 rows and the P07 Film Result rows say "Released Week 10"); the P07 twins fixture used different weeks. Recorded for the Owner playtest script.
- Timeline headlines for `filmReleased` rows carry the title FROZEN at the event (P08-REQ-009), while `standingChanged` / `theatricalRunCompleted` rows resolve the film's CURRENT title at projection time — after a rename the same film can read under two names in one pane (visible in the twins fixture: "Fires of Archipelago released" beside "Standing changed after The Long Exposure"). Cosmetic; a frozen-title lookup for every film-subject row is queued for the next TS window.
- A person "On the lot this week" is not always a body the world can Locate this frame (the world presents a bounded authoritative set); the pane says so in words (§6.6) rather than merging the two facts.
- The shared `ps-production-detail-pane` (Production / Film Result workspaces) carries the same latent flex-basis condition fixed for History in §6.2; their lines are short today, so it is recorded here rather than changed under an accepted seal.
- The oracle's `WorldSelection` step selects Administration through the sanctioned selection seam (no focus, no camera move); the packaged HID journey is where real clicks live.

## 8. READY-extension evaluation (charter §14A)

| Extension | Gate | Disposition at this checkpoint |
|---|---|---|
| P08-R1 long-save navigation + non-blocking attention | core IDs/persistence/Back/focus green; no duplicate attention authority | GATE MET on the core side. NOT built in this checkpoint: the stack order runs P09 core and P10 core next; R1 is re-evaluated at the cross-stack convergence with the reviewer's non-blocking items (§9: sub-precision settling rows hidden with an honest count, keyboard-path EditMode test, 25-receipt cap → navigation) as its concrete backlog |
| P08-R2 facility-history adapter | P09 emits exact durable facility facts | NOT YET — after P09 core |
| P08-R3 person-history adapter | P10 exposes exact career/profile routes | NOT YET — after P10 core |
| P08-R4 records | complete comparison universe | NOT MET — no universe exists; not built |

## 9. Hostile-review disposition (non-blocking findings, verbatim numbering)

| # | Finding | Disposition |
|---|---|---|
| NB1 | The Administration card (its geometry unchanged by P08; content grew by one Standing row + one button) overlaps the SCRIPTS rail and, at 1440×900 s1, the top roster-strip row | Pre-existing card-vs-rail geometry (`StudioFoundingCardContracts.CardRect`, unchanged); the P08 additions make the overlap taller. Recorded as a known limitation; candidate for the P08-R1 attention/layout pass. Not a P08 law violation |
| NB2 | Release receipt line 3 says "Box office returned N%" while the run may still be active (tense) | Accepted: the receipt freezes the release-week ROI; wording to become "projected … at release" in the next TS change window (kept out of the sealed bundle deliberately) |
| NB3 | Weekly settling records sub-display deltas forever (rows reading "0.0 (35.0 → 35.0)"); fold summaries are appended after newer rows so "weeks non-decreasing" is false after a fold and the `lastWeek` guard weakens | Accepted, bounded by the 52-week fold (52 unfolded rows at every checkpoint). Backlog for the next TS window: (a) presentation-side hiding of below-precision settling rows with an honest count, (b) `appendStudioHistory` guard computed as max(week) over rows, (c) the `types.ts` comment corrected to "fold summaries carry their bucket's end week". The Standing formula itself is not touched (D-6) |
| NB4 | `assertStudioHistoryInvariants` does not check `recordingStartedWeek ≤ market.tick`; a forged root fails inside `tick` instead of at load | Accepted; add to `validateSaveV17` in the next TS window (fail at load) |
| NB5 | `buildingId: placed-${placementId}` minted for facility rows that P08 core never emits; one dead conditional; `uncapturedFilms` is a global count repeated per person | Accepted; dormant until P08-R2 (after P09) where the facility adapter is built and the field becomes live |
| NB6 | The 120-year measurement is mostly publicity/settling rows because the fixture stops releasing at 16 films | Disclosed in §5 (measurement fixture, not a product claim) |
| NB7 | Non-engaged legacy saves show "Recording since Week 0." while nothing records | Accepted; next TS window: the notice states that recording begins when the economy is engaged |
| NB8 | Generator comment mis-describes the old-save strip sequence | Accepted; comment-only, next TS window |
| NB9 | `contendedStudio` $200M seed is pre-existing; only affordability of the $1.2M campaign and the D-11.9 termination depend on it | Confirmed by the reviewer: no hidden cash introduced by P08 |
| NB10 | Unity `origin` has no `main`; local Unity `main` is an ancestor of the accepted base | Recorded in §1 / final report ("campaign branches unchanged"; Unity has no remote `main` to move) |
| NB11 | No EditMode test drives the keyboard path; oracle sidecars `visualReviewStatus: pending` | Accepted; keyboard EditMode test in the next Unity window; visual review is the Current Ops PM's step, not the builder's |
| NB12 | `RenderList` `TabRecords` branch unreachable while `recordsAvailable` is hard-coded false | By design (gated, never fake); becomes reachable only with P08-R4 |

Why nothing above was changed before sealing: every item is non-blocking by the reviewer's own classification, and touching `src/core` or Unity `Assets` would invalidate the sealed pair's evidence chain (engine bundle / player hashes). They are carried as the first items of the next TS/Unity change windows and re-verified there.

