# P09 TECHNICAL CHECKPOINT — Studio Growth & Construction (core, sparse bare lot to first released film)

**Authorization:** `OPS-P08P10-20260905-01` (Current Ops execution order; corrections delta `docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md`).
**Status:** **TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — OWNER ACCEPTANCE PENDING — CAMPAIGN BRANCHES UNCHANGED.** No P09 Owner acceptance is claimed. Both campaign branches, TS `main`, and the Owner's durable profile are verified unchanged (§1, §5).
**Scope of this seal:** P09 core (sparse founding regime, placement authority on the wire, Build mode, lot growth, the Set commissioning route the bare-lot first film requires) plus the READY items that were pulled forward because the REQUIRED FULL FOUNDATION rows depend on them (§3, §8). READY items not built are named as not built.

## 1. Pair

| Item | Value |
|---|---|
| Accepted base (frozen) | TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` — `campaign/living-lot-ts` and `campaign/living-lot-client` re-read on the remotes at this seal: unchanged; TS `main` = `c902a704…` (ancestor of the base, unchanged); Unity `origin` has no `main` |
| `FINAL_DOCS_SHA` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` |
| **P09 core TS product commit** (`wip/p08-p10-autonomous-stack-01-ts`, remote `hspector-github`) | `fee206fa039fa96e29c98108c206f56df1b1bb4c` (last product/source change; the documentation tip is the commit carrying this document — recorded in the handoff CURRENT STATE) |
| **P09 core Unity product commit** (`wip/p08-p10-autonomous-stack-01-client`, remote `origin`) | `a8f4c1aaa35da483a1fd8463718a3c33fa0b4535` (the sealed player is built from this commit, `dirty:false`). Ladder in §2 |
| Save / protocol / projection | **V18** / 4 / **17** |
| Canonical schema id | `sha256:18de162d1a9da3034378f71cec3d3b3f109ea91df8c1a8d40469924108b36e78` (`$id urn:project-studio:bridge:protocol-4:projection-17`); prior ids `85a6d125…` (projection 16), `c9dad9f3…` (projection-17 W1), `eb95add0…` (projection-17 W1b) appended to `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` under the schema-bump law |
| Generated contract | `generated/unity/StudioBridgeDtos.Generated.cs` output identity `ae177bb5f6c62dc8430007dee13a74a4b954f35327c2c77b7305956f08232ca2` — byte-identical in Unity `Assets/Studio/Runtime/Data/Generated/` |
| CF-09 `verify:bridge-contract-consumer --verify-only` | PASS at TS `fee206fa` × Unity `d3a22868` (`cf09-p09-w5.json`); re-run PASS at TS `fee206fa` × Unity `a8f4c1aa` (`cf09-p09-w5b.json`; the W5b change is oracle-runner only, contract untouched) |
| Player | exe sha256 `3a40670f3f9cba4888ca1e64563747f144f2dae563043bd91a3efb4f9ebf5c16` · Assembly-CSharp `693f85f9d5b386acb870f7fe93d8872e74df336bd96673ebe688833a3347ecaf` · Unity 6000.3.22f1 · built `2026-09-05T12:27:46Z` from Unity `a8f4c1aa` clean |
| Engine bundle | `dist/studio/engine.mjs` sha256 `5185e3a2d7a6e432e362a9c6659acf041fda368dd1166cf46dbd9f968b014b08` (built from TS `fee206fa`) |
| Owner durable profile | `/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json` sha256 `d949003e18744061…` — unchanged; every P09 proof ran on fixture checkpoints or on a read-only copy |
| Candidate package | `~/Desktop/P09-Core-Technical-Candidate-fee206f-a8f4c1a/` (player, launcher + engine + fixtures, docs, evidence, proof) |

## 2. Commit ladder (both WIP branches; nothing on `main` or the campaign branches; no rebase, squash, force push, or merge commit)

| Wave | Commit | What |
|---|---|---|
| W0/W1 (TS) | `71a879be7359b6d446b5c68406144f22f6a9ad8f` | `foundingRegime` root (GameState/Save V18, written once, never inferred; V17 downgrade of a bare-lot save refused); `BARE_LOT_PROPERTY`; property-driven founding-facility law; `quotePlacement` → `StudioPlacementQuoteSnapshot` on projection 17; §26.1 rejection copy; founding-phase catalogue law (`foundingPhaseOf`, `foundingOffice`, allowance 1 while the office rises, `neededNow`); `tests/p09a-w0-founding-regime.test.ts` (13, incl. the HARD-STOP first-film gate), `tests/bridge-p09a-w1-placement-quote.test.ts` (7, full-grid sweep) |
| handoff | `07158be` | C4 |
| W1b (TS) | `33a362d` | roads on the wire (`lot.property.roads`), property-driven lot bodies, bare-lot `no-capacity` journey beat (next kind `build`) |
| W1c (TS) | `364079f` | bare lot authored to the accepted world: 42×27 grid measured from the Unity scene (Gate (21,26) 3×1, Administration (8,18) 3×3, three road rectangles, four owned parcels) |
| W2 (Unity) | `2e7cea6` | projection 17 contract sync (placement quote family, property regime, catalogue unmet facts) |
| W2b (Unity) | `4afd6e8` | contract sync to TS `33a362d` (roads, journey vocabulary) |
| W3a (Unity) | `5357301` | lot growth: gate-anchored `StudioLotGridMap`, N generic sites/bodies (`StudioLotGrowthPresentation`), bare-lot art law, engine ground map |
| W3b (Unity) | `e5da469` | Build mode: parcel chooser → catalogue → preview → commit (`StudioBuildWorkspace` dock, `StudioBuildPlacementDriver` world ghost + arrow nudges, `StudioBuildCommandHud` BUILD chip + `B`, Administration card `OPEN BUILD` + capacity blocker) |
| W4 (TS) | `bfe79dc` → `71ef492` | eleven P09 oracle fixtures (`scripts/gen-p09-visual-oracle-fixtures.mts`, `ui/e2e/p09-visual-oracle-v1`); session ids carry the scenario prefix |
| W4 (Unity) | `a909d97` → `437210d` → `ac60ca0` | oracle runner P09 scenarios + Build-workspace step + `Tools/p09-*` harnesses; oracle-driven corrections (§6.6–6.9) |
| W3c (Unity) | `d936830` | a completed facility's body opens its real workflow (`StudioDepartmentBodies`, alias resolution at `StudioLocateAction.Locate`); the authored Annex art is the Annex's only |
| W1b test (TS) | `81ee766` | the bare lot on the wire: capacity beat, `advanceWeek` while the office rises, property-driven bodies, roads per regime |
| W5 (TS) | `fee206fa039fa96e29c98108c206f56df1b1bb4c` | `quoteSetCommission` → `StudioSetCommissionQuoteSnapshot` (`bridge/setCommission.ts`), `lot.setCatalog` on the wire, fixtures s11/s12, `tests/bridge-p09a-w5-set-commission.test.ts` (5), `tests/bridge-p09a-w5-bare-lot-first-film.test.ts` (the whole bare-lot first film driven through the bridge alone) |
| W5 (Unity) | `d3a22868` | Sets route on the Build dock (stage picker → Set catalogue → live quote strip → COMMISSION; Esc ladder), `RequestSetCommissionQuote` single-flight client, protocol parse, oracle `p09-stage-ready-no-set` (ordinal 11; `endowed-build` → 12), `StudioP09AW5SetsRouteTests` |
| W5b (Unity) | `a8f4c1aaa35da483a1fd8463718a3c33fa0b4535` | the Sets oracle waits for the authority's answer and asserts the legal House Set quote (§6.13) |

## 3. Requirement accounting (P09, 42 rows in `docs/operations/P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md`)

| Class | Count | Rows |
|---|---|---|
| IMPLEMENT IN CORE — done in this checkpoint | 28 | 001, 002, 003, 004, 006, 007, 008, 009, 011, 012, 013, 014, 015 (shape + reason text; no icon glyph — §7), 016, 017, 018, 019, 021 (anonymous presentation-only crew markers — NOT the real-Builder law), 022, 023, 024, 025, 026, 028, 031, 033, 041 (technical proof complete; the Owner candidate is the combined package, acceptance pending), 042 |
| IMPLEMENT AS READY EXTENSION — evaluated in §8 | 6 | 010 (R1 — PARTIAL: "Build here" from the parcel chooser; world-native parcel selection not built), 020 (R2 — generic N-site core built and proven; the active-build portfolio/attention surface not built), 027 (R3 — PARTIAL: Set commission pulled into core because 025/041 depend on it; repair and strike routes not built), 029 (R4 — not built), 030 (R4 — not built), 040 (R2/P08-X — facility milestones NOT emitted) |
| CONDITIONAL — in force as provisional WIP tuning only | 1 | 005 (prototype envelope after the §15A solvency gate: VERDICT SOLVENT, §5) |
| REJECTED BY OWNER — enforced negatively (never built) | 1 | 032 (no facility decay, no maintenance chores; Set repair untouched) |
| DEFERRED TO NAMED PACKAGE — not implemented | 4 | 034 (roads/paths), 035 (land acquisition), 036 (rotation/renovation/replacement), 038 (landscaping/prestige) |
| DEPENDENCY-BLOCKED — not implemented | 2 | 037 (utilities), 039 (real Builder identity/capacity) |
| UNMAPPED | 0 | — (42 rows total, matching the matrix) |

Negative requirements stay active: no free buildings, no hidden cash, no waived payroll, no proof-only staff (`tests/bridge-p09a-w5-bare-lot-first-film.test.ts` asserts the ledger reconciles to `INITIAL_CASH` and that constructionCapex, facilityOpex, payroll, overhead and production all appear; no journey row is a fixture adjustment); no decorative worker is ever called a Builder (§7); Gate and Administration are property structures, not facilities, so the generic `demolishFacility` cannot address them (031).

### 3.1 Current Ops corrections recorded here (originals preserved; nothing rewritten)

1. **Design §29.3 vs the frozen V12 construction invariant.** The design lists `construction.parcels: []` for a bare lot; the accepted V12 invariants require exactly one registry row `{ id:'expansion', projectId:null }`. The bare lot keeps that frozen bookkeeping row while its PROPERTY carries no `expansion` parcel and no Annex ground; the legacy Annex shortcut is not offered (`legacyAnnexOffered`). Recorded at C4; still true.
2. **Reservation evidence.** The placed-facility reservation-evidence invariant compared a stage's completion week to the greenlight week; a picture greenlit while its stage rose is legitimate and holds from `bindings.heldSinceWeek`. The post capability persists no acquisition week and is NOT judged — deferred-not-dropped **P09-DEF-01** (persist `acquiredWeek` on `FacilityReservation` in a future save version).
3. **Set commission pulled forward from R3.** The matrix classifies Set commission/repair/strike as P09-R3. The REQUIRED FULL FOUNDATION rows (025, 041) cannot be met on a bare lot without commissioning a Set, and no bridge intent existed for it; the commission route (and only that) was built in core (W5). Repair and strike remain R3 and are NOT built.
4. **Bare-lot dimensions.** C4 recorded `BARE_LOT_PROPERTY` as 28×26; W1c re-authored it to the accepted world's 42×27 grid measured from the Unity scene so the engine footprint of the Gate and Administration coincide with the authored art. The 28×26 figure in C4 is superseded (kept there as written).
5. **HARD-STOP week.** The §15A model released at week 25; the engine's own gate releases at week 37 because the plant is legal only after the office is operational and the real pipeline is longer than the model. Solvent on the studio's own money in both the core gate and the bridge-only journey (§5).

## 4. What was built (exact production paths)

**TypeScript (`wip/p08-p10-autonomous-stack-01-ts`)**
- `src/core/lot.ts` — `BARE_LOT_PROPERTY` (42×27; `BARE_LOT_WIDTH/DEPTH/ROADS/PARCELS/STRUCTURES`), regime-aware property construction.
- `src/core/blueprintRequirements.ts` — founding-phase law: `foundingPhaseOf` (none | office-needed | office-building | satisfied), `foundingOffice` requirement kind (reason "Complete the founding Development & Casting Office"), `effectiveBlueprintMaxInstances`, `blueprintNeededNow`.
- `src/core/placement.ts` — `legacyAnnexOffered`, property-driven `studioConstructionView`, capability-aware `placedReservationEvidenceWeek`, catalogue `neededNow`.
- `src/core/firstFilmJourney.ts` — `no-capacity` stage/beat (next kind `build`, site `build`).
- `bridge/placement.ts` — draft→engine conversion, quote snapshot, `PLACEMENT_REJECTION_COPY` (§26.1 headlines), per-cell verdicts.
- `bridge/setCommission.ts` — `setCommissionDraftToEngine`, `setCommissionQuoteSnapshot` (refusal copy with stage/blueprint context).
- `bridge/session.ts` — `quotePlacement` / `quoteSetCommission` dispatch; PendingQuote families `placement` / `setCommission`; digest-bound intents `placeFacility` / `commissionSet`; commit revalidation; `pendingQuotes` cleared on any accepted command.
- `bridge/schema/*`, `bridge/runtime-checkpoint.ts` — projection 17, quote unions, `lot.property.roads`, `lot.property.regime`, `lot.setCatalog`, prior-id acceptance list.
- `ui/src/engine/adapter.ts`, `ui/src/lot/snapshot/*` — `lotPropertyProjection` (roads/regime), `lotSetCatalog`, property-driven buildings, journey vocabulary.
- `scripts/p09-solvency-preflight.mts` (§15A gate), `scripts/gen-p09-visual-oracle-fixtures.mts` + `ui/e2e/p09-visual-oracle-v1/*` (12 fixtures s1–s12).
- Tests: `tests/p09a-w0-founding-regime.test.ts` (13), `tests/bridge-p09a-w1-placement-quote.test.ts` (7), `tests/bridge-p09a-w1b-bare-lot-projection.test.ts` (5), `tests/bridge-p09a-w5-set-commission.test.ts` (5), `tests/bridge-p09a-w5-bare-lot-first-film.test.ts` (1 end-to-end); cutovers in `tests/blueprint-requirements.test.ts`, `tests/placement-*.test.ts`, `tests/bridge-schema.test.ts`, `tests/bridge-runtime-checkpoint.test.ts`.

**Unity (`wip/p08-p10-autonomous-stack-01-client`)**
- `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` (byte-identical), `Data/StudioBridgeProtocol.cs` (placement + Set quote `NormalizeAndValidate`, `QuotePlacement`, `QuoteSetCommission`), `Data/StudioLotSnapshot.cs` (regime validation, `IsBareLot`, roads, `unmet`, `setCatalog`).
- `Infrastructure/StudioBridgeClient.cs` — `RequestPlacementQuote`, `RequestSetCommissionQuote` (single-flight, accepted/rejected/unresolved).
- `Infrastructure/StudioLotGridMap.cs` — gate-anchored grid (cell 12.5/3 u), engine cell ↔ world.
- `Infrastructure/StudioBuildWorkspaceContracts.cs` — pure Build/Sets state machine, Escape ladder, status precedence (RequirementUnmet > Building > InstanceLimit > Owned N > Available), `CommitEnabled` / `CommitSetEnabled`, copy helpers.
- `Presentation/StudioLotGrowthPresentation.cs` (+`StudioLotPlacedBody`) — N generic sites/bodies on exact footprints, progress bands 0.18/0.35/0.62/0.86, wire-owned status text, authored `placed-1` art only for `development-casting-annex`, bare-lot art law, engine ground map.
- `Presentation/StudioDepartmentBodies.cs` — the operational placed office owns Development & Casting; alias resolution at `StudioLocateAction.Locate`.
- `Presentation/StudioBuildPlacementDriver.cs`, `Presentation/StudioBuildCommandHud.cs`, `Presentation/UI/StudioBuildWorkspace.cs`, `Presentation/UI/StudioWorkspaceHost.cs` — Build mode and the Sets route (§2).
- `Presentation/StudioPostReleaseOracleRunner.cs` — 12 `p09-*` scenarios, `BuildWorkspace` / `BuildSetsWorkspace` steps, cameras `CAM-MGMT-BARE-V1`, `CAM-MEDIUM-BARE-V1`.
- `Tools/p09-run-visual-oracle.sh`, `Tools/p09-run-hid-build.sh`, `Tools/p09-proof-build.mjs`.
- Tests: `StudioP09AW2PlacementContractTests`, `StudioP09AGridMapTests`, `StudioP09AGrowthPresentationTests`, `StudioP09ABuildContractsTests`, `StudioP09ABuildHostTests`, `StudioP09ADepartmentBodiesTests`, `StudioP09AW5SetsRouteTests`.

## 5. Gates (all at the pair in §1 unless noted)

| Gate | Result |
|---|---|
| §15A solvency preflight (before any prototype-envelope tuning) | `scripts/p09-solvency-preflight.mts`: VERDICT SOLVENT — modelled floor $6,713,185; payroll $24,440/wk; overhead $24,000/wk; cheapest legal minimum roster, no subsidy. The envelope ($20M start; office $1.5M / 14 w / $5.5K/wk / +2) is therefore PROVISIONAL WIP tuning, not tuning authority |
| Full TS floor | at `fee206fa`: **370 files / 4979 passed / 5 skipped**; `typecheck`, `typecheck:bridge`, `check:bridge-contract`, `check:bridge-contract:fixtures` clean |
| Save lineage / downgrade guards | V17→V18 (`foundingRegime` written once, endowed for every migrated save); V18→V17 downgrade of a bare-lot save REFUSED; endowed V18 round-trips (`tests/p09a-w0-founding-regime.test.ts`, `tests/placement-save-v12.test.ts` cutover) |
| Bridge / exact consumer | CF-09 PASS (§1) |
| Unity EditMode | 844/844 at `d936830`; **847/847 at `d3a22868`**; **847/847 at the sealed product commit `a8f4c1aa`** (results XML `p09-w5-editmode-3.xml` in the candidate `evidence/unity-editmode/`) |
| Bounded packaged build | macOS player from `a8f4c1aa` clean, `2026-09-05T12:27:46Z`, manifest binds exe/Assembly-CSharp/Unity SHA/TS SHA/engine bundle |
| Visual Oracle, 12 scenarios, 1440×900 | Run 6 on exe `0f7ea64c…` (Unity `d3a22868`): 12/12 complete, **130 machine assertions, 0 failed, 0 mutations, 26 captures**. **Canonical = run 7 on the sealed exe `3a40670f…` (Unity `a8f4c1aa` `dirty:false`, TS `fee206fa` `dirty:false`, engine `5185e3a2…`): 12/12 complete, 137 machine assertions, 0 failed, 0 mutations, 26 captures** (`Evidence/P09-Oracle/*-20260905T1227..1229Z`). One harness exit code deviated: `p09-office-rising` returned player exit 255 AFTER its sidecar was complete with 14/14 assertions passed (shutdown-time exit; no assertion, capture or mutation affected); re-run on the same exe at 12:33:14Z: exit 0, 14/14, 0 mutations — both directories kept |
| Visual Oracle, viewports | 1280×800, 1720×1046, and 1440×900 native fullscreen × {sparse-start, valid-placement, multi-site, stage-ready-no-set}: **12/12** on exe `0f7ea64c…`; **12/12 on the sealed exe `3a40670f…`: 222 machine assertions, 0 failed, 36 captures** (`Evidence/P09-Oracle-Viewports/*-20260905T1229..1233Z`). 1720×1045 is not addressable on this display (the harness lands on 1046, as the order allows); 1440×900 is this display's native size, so the fullscreen run is the native-fullscreen gate |
| Automated full first-film journey (bare lot) | Core HARD-STOP gate (`tests/p09a-w0-founding-regime.test.ts`): release week 37, cash floor $7,888,869, final cash $9,778,380 at week 42. Bridge-only journey (`tests/bridge-p09a-w5-bare-lot-first-film.test.ts`, every step a wire command, the journey's own next intent each week): **released week 37; 46 commands; cash floor $8,864,638; final cash $9,374,658**; 4 operational facilities (office, scenery shop, standard stage, post building) + 1 House Set; ledger reconciles to `INITIAL_CASH`; `filmReleased` row in Studio History; `foundingRegime` `bare-lot` throughout |
| Real HID Build flow (`Tools/p09-run-hid-build.sh` + `Tools/p09-proof-build.mjs`, real CGEvent input, owner-idle gated) | ⟨HID_RESULT⟩ |
| Hostile review | ⟨HOSTILE_RESULT⟩ |
| Campaign branches / `main` / Owner profile | `campaign/living-lot-ts` = `2753e18b…`, `campaign/living-lot-client` = `c4c65db4…`, TS `main` = `c902a704…` re-read on the remotes at the seal; Owner profile `d949003e…` unchanged |

## 6. Defects found on the way (kept)

1. **Generator promoted-props mismatch (W1):** the quote union's promoted base fields diverged when the placement quote joined; fixed by keeping the union base (`commitLabel/intentId/queueNote/queues/startsNow`) on every family.
2. **Bare-lot snapshot threw "legacy expansion parcel is missing" (W1b):** the accepted read model assumed the Annex ground; `legacyAnnexOffered` + a property-driven `studioConstructionView` (§3.1.1).
3. **Reservation invariant rejected a legitimate bare-lot journey (W1b):** §3.1.2; P09-DEF-01.
4. **Founding-phase law forced W0 test resequencing:** office first; second office origin (2,2); opex first charge on the completion week — the tests now follow the law rather than the other way round.
5. **Unity test assembly cannot reference Presentation:** pure helpers moved to Infrastructure; presentation reached by reflection in tests.
6. **Oracle run 1: session ids lacked the `p09-` prefix** the runner gates on (TS `71ef492`, Unity `437210d`).
7. **Oracle run 2: transparent-material shader absent from the packaged player** (`Shader.Find("Universal Render Pipeline/Unlit")` null → exceptions left the ground root active and the ghost empty). Fix: shader fallback chain (`ac60ca0`).
8. **Oracle run 2: status text had two owners** (presentation bands vs wire `attentionReason`); the wire now owns it.
9. **Oracle run 3: BUILDING vs instance-limit precedence** on the catalogue row while the office rose; `Status` precedence fixed and pinned in `StudioP09ABuildContractsTests`.
10. **Oracle run 3: authored `placed-1` Annex art was used for ANY first placement** — gated on `development-casting-annex` (`d936830`); a bare-lot office is a generic body.
11. **Films-tab summary element absent** in the first-film-released scenario assertion — assertion corrected to the element the pane really carries.
12. **`StudioBridgePlayerWorkflowTests` family count** pinned three quote families; updated to four with the Set family (W5, same mechanical cutover W2 made for placement).
13. **Oracle run 6, `sets-house-set-preview` capture showed "Asking the studio…"**: the Sets step selected the stage inside `AfterOpen`, so the wait loop for the quote never ran and the capture pre-dated the answer. W5b resolves the stage from the wire in the step itself and adds eight assertions on the answered quote (§2).
14. **zsh `set -- $vp` does not word-split** in the viewport loop — `read -r W H F <<< "$vp"`.

## 7. Known limitations (honest, not deferred scope in disguise)

- **Invalid-placement verdict = shape + reason text**, not shape + icon + text: the world ghost colours and per-cell blocks the footprint, the ghost's reason label and the dock's reason line carry the §26.1 headline; there is no dedicated icon glyph (REQ-015 partial in that one respect).
- **Endowed lot: engine grid vs authored art.** On an endowed (migrated) save the generic bodies for new placements stand on the engine's 42×27 grid; the accepted authored art was never modelled on that grid, so a new site can sit visually close to authored bodies. The engine ground map is shown only in Build mode there (always on a bare lot). The migrated-endowed scenario proves the accepted lot itself is unchanged.
- **No people presence at a placed office**: the operational placed office opens Development & Casting (W3c), but the accepted world's authored zone points do not exist for generic bodies, so no staff body walks to it.
- **Anonymous crew markers** on rising sites are presentation only (REQ-021); they are never Builders, carry no identity, and no capacity law reads them (REQ-039 dependency-blocked).
- **Nameplates are single-sided** (facing south, like the authored labels); from the management camera on the north side they read mirrored — visible in the oracle captures, same as the accepted art's labels from that angle.
- **Soundstage card**: shows footprint, road access, clearance ring, cost, weeks, opex and capability from the wire; the "needs a Set" fact is stated by the Sets route's stage line ("Standing · no Set yet"), not as a card field.
- **Construction registry row**: §3.1.1.
- **P09-DEF-01**: §3.1.2.
- **Not built (READY, §8):** world-native parcel selection ("Build here" from a selected parcel body), active-build portfolio/attention, grouped same-week completion cue, Set repair/strike routes, Move, Demolish consequence sheet, P08 facility milestones.
- The oracle's `BuildWorkspace` steps open Build through the host seam (no pointer); the packaged HID drive is where real clicks and arrow keys live (§5).

## 8. READY-extension evaluation (execution order §24A)

| Extension | Activation gate | Disposition at this checkpoint |
|---|---|---|
| P09-R1 Build Here + all current authoritative facility blueprints | generic quote/commit/revalidation green; each blueprint real | GATE MET. PARTIAL: the catalogue is the complete TS blueprint list (every entry has effect, requirements, cost, duration, generic art body, tests); "Build here" exists from the parcel chooser and the Administration route; the world-native parcel body → Build here entry is NOT built |
| P09-R2 N-site management + grouped completion | multiple sites identity-correct and performant | GATE MET (multi-site, same-week-completion, reconnect-same-ids scenarios; indexed presenters). Portfolio/attention surface and grouped completion cue NOT built; P08 milestones NOT emitted (REQ-040) |
| P09-R3 selected Stage/Set lifecycle | P05/P06 Set authority intact | GATE MET (Set authority untouched; `commissionSet` reused verbatim). Commission route BUILT (pulled into core, §3.1.3); repair and strike NOT built |
| P09-R4 move and demolish | existing actions/guards valid under the new regime | Actions exist in core (`moveFacility`, `demolishFacility`, engagement guards); NO Unity route, consequence sheet or preview built |

## 9. Hostile-review disposition

⟨HOSTILE_SECTION⟩
