# P10 TECHNICAL CHECKPOINT — People: the person inspector, retained Profile, governed Roster, and the P08 person↔history adapters

**Status:** P10A W1a/W0 + W1b + W2 + W3 + cross-stack person↔history **TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — OWNER ACCEPTANCE PENDING.** Projection 18. Proven in the packaged player by the Visual Oracle. Ready extension R4 (career/history) built; R1 contract actions dependency-blocked (no producer); R1 grouped attention served by the Roster; R2/R3 reuse existing authorities. Not built: material contract mutation (renew/release), Star badge (Owner-blocked). Campaign branches and `main` unchanged; no P10 Owner acceptance claimed.

## 1. Pair (the projection-18 person-route candidate)
- TypeScript `396d08c` (WIP `wip/p08-p10-autonomous-stack-01-ts`, remote `hspector-github`) — W0 people projection at `e8d178d`; oracle fixtures.
- Unity `6494cef` (WIP `wip/p08-p10-autonomous-stack-01-client`, remote `origin`).
- Sealed projection-18 engine bundle `3b9e343209706589c33d9d5aac5882e5be3dde263c5988e69515f67af0cca592` (built from committed TS, schema `sha256:ea5d645f…`).
- Save V18 / protocol 4 / projection 18. CF-09 PASS (generated contract `6c26f13e…`) at TS `9bc01ea` × Unity `26a543a1` (W1a).
- The P09 core control remains a SEPARATE projection-17 candidate (`~/Desktop/P09-Core-Technical-Candidate-fee206f-8f30d0e/`, player `d41c0d4b`, engine `5185e3a2`); it is not rebuilt.

## 2. Commit ladder (both WIP branches; nothing on `main` or the campaign branches; no rebase, squash, force push, or merge commit)
**TypeScript** (since P09 `fee206f`): `63e57b3` visibility table → `e8d178d` W0 people projection (projection 18) → `fcdf6c9` W1b oracle fixture → `1f30486` handoff C7 → `396d08c` person-history fixture.
**Unity** (since P09 W7 `8f30d0ef`): `959af7b`+`26a543a1` W1a projection-18 sync + pure inspector contracts → `a78fa40` W1b inspector card + retained Profile + host route → `87ba641`+`ce739e2` W1b Visual Oracle person route + proof → `b87b1fa` W2 full Profile → `043870e`+`9a1c23e` W3 governed Roster → `0e85001` person↔history adapters → `6494cef` convergence (Locate honesty + wording).

## 3. What was built (exact production paths)
- **W0 (TS `bridge/people.ts`, projection 18):** `peopleProjection(state)` → `talent.profiles[]` (one per Talent record), `talent.roster` (rows + counts), `talent.attention`. Producers exactly as `docs/engineering/P10-INFORMATION-VISIBILITY-TABLE.md`. Fresh clones per snapshot.
- **W1a (Unity):** projection-18 Talent DTOs synced byte-identical (CF-09 PASS). `StudioPersonInspectorContracts` — pure phrasing of identity / profession / employment / current task (ambiguous ⇒ fail closed) / presence / one status / Locate gating.
- **W1b (Unity):** `StudioBridgePresentation.TryGetPersonTalentId` (reverse of the Locate join; `personSlots` only ⇒ decorative/ambient crew get no profile). `StudioPersonInspectorCard` (compact world-entry card; OPEN PROFILE + canLocate-gated Locate; selection is inert). `StudioProfileWorkspace` + context (read-only retained Profile; all-active rebind; dropped person empties honestly; Back restores origin). Host person route end to end. People-strip COMPANY header is the discoverable entry.
- **W2 (Unity):** `StudioPersonProfileContracts` + the full Profile — CRAFT (perceived discipline OVR, proven/capable-but-unproven, potential BAND always a scouted estimate, credited counts, the OVR definition), SPECIALTIES, COMMERCIAL (Star Power distinct + work ethic + its one effect), CONTRACT (terms/guarantee/termination/renewal, or labelled market rate for freelancers), CAREER (filmography; each available result deep-links via `OpenReleaseResultFromProfile`; honest empty/partial lines).
- **W3 (Unity):** `StudioRosterContracts` (pure filter/search/sort; one search over name+specialty; deterministic sorts breaking ties by name then exact id) + `StudioRosterWorkspace` + context (two-line readable rows, filter chips, sort/horizon/attention cycles, single-scroll, compact card mode, selection footer with OPEN PROFILE + honest Locate, retained filter/sort/search/selection; a filtered-out or dropped selection reported truthfully, never substituted). OPEN PROFILE from a row opens the exact person with origin Roster; Back peels back to the list.
- **Cross-stack:** Profile ⇄ P08 person history — the Profile's STUDIO HISTORY opens P08 History focused on the exact person (Back peels back to the Profile); a P08 history person subject's OPEN PROFILE reaches their exact Profile (Back peels back to the history). One layer per act; routes stay mutually exclusive.

## 4. Gates (all at the pair in §1 unless noted)
- **Unity EditMode 872/872** (W1a 5 + W1b 7 + W2 6 + W3 5 + the rest of the suite), 0 failed.
- **CF-09** generated-contract seal PASS (projection 18, `6c26f13e`).
- **Visual Oracle (packaged player, projection-18 pair):**
  - `p10-person-inspector` **22/22** — inspector card over a selected authoritative person (no camera move on select, P02), OPEN PROFILE → the exact on-lot Profile (Locate offered), an off-lot Profile (Locate disabled with reason), and the Roster (60 people, selection footer, OPEN PROFILE offered). Captured at 1440×900, 1920×1080, 1200×700.
  - `p10-person-history` **9/9** — the Profile's STUDIO HISTORY and the P08 history person subject's OPEN PROFILE both render, on the first-film-released fixture (P08 history + P09 lot + P10 people coexisting on one player).
  - Evidence: `Evidence/P10-Oracle*/p10-person-*` (sidecar assertions + the actual open panels).

## 5. Findings on the way (kept)
- **F1 (fixed):** the Profile now offers LOCATE only when the wire claims a current body AND one actually resolves on view (the same honesty the P08 History detail keeps); a person "on the lot" per the authority but with no rendered body (scene capacity) reads "On the lot this week; no body to locate right now" instead of offering a dead Locate. EditMode-pinned.
- **F2 (minor, open):** at short viewport heights (≈700px) the Profile heading + LOCATE chrome underlap the top time-control bar (UITK vs IMGUI scale independently). BACK stays visible; content readable. Cosmetic; not fixed to avoid a fragile cross-scaling hack.
- **F6 (fixed):** the partial-provenance career line now reads "N credited production(s) on released films, captured without a detailed career record".
- **Presence seating vs canLocate:** on the endowed lot at week 2 the scene seats a selectable body only for the person whose facility zone has an available authored body (e.g. the scenery-zone craft person); casting/writers-zone roster people report `canLocate` on the wire but seat no body. This is PRE-EXISTING presence-seating behaviour (P03A living lot), not introduced by P10. P10 now degrades honestly everywhere (F1). The wire's `canLocate` semantics (claimed-on-lot, not seated) is recorded for a future ruling.

## 6. READY-extension evaluation (execution order §6 / R1–R4)
- **R4 (career/filmography → P07 result + P08 person-history): IMPLEMENTED.** Career rows deep-link to the exact result; Profile ⇄ P08 person-history both ways. The full career-row→result link is EditMode-proven; the visible partial-provenance path is oracle-proven (the accepted fixtures release films without frozen `careerEvents`, so a fully-linkable career row needs a `careerEvents`-populated save — see §7).
- **R1 grouped attention: IMPLEMENTED** via the Roster (attention filter, attention-first sort, contract-horizon cycle, the "N need attention" count).
- **R1 material contract actions (renew/release): DEPENDENCY-BLOCKED — no producer.** The bridge intent vocabulary has `signActor`/`signContract` (casting hire) but NO `renewContract`/`releaseContract`/`terminateContract` command. The Profile surfaces the contract read-only (terms, guarantee, termination cost, renewal window) exactly as the visibility table specifies for P10 core.
- **R2 profession shortage → prefiltered route: PARTIAL / existing authority.** The Roster's profession filter provides the prefiltered view; the only shortage signal is a per-production casting-package staffing blocker (`src/core/castingPackageReadModel.ts`), not a standalone profession-shortage signal. The Casting building is the recruitment authority.
- **R3 facility-native recruitment: reuses the EXISTING Casting `signActor` workflow.** P09's built Development & Casting office is the lawful owner; no new P10 work.

## 7. Known limitations (honest, not deferred scope in disguise)
- A fully-linkable CAREER row (row → exact P07 result) is EditMode-proven but not yet oracle-captured, because the accepted P09 fixtures release films without recording `careerEvents` (the projection then correctly shows the partial-provenance "captured without a detailed career record" state, which IS oracle-captured). A `careerEvents`-populated save (ordinary gameplay, or the accepted Owner profile copy) is needed for the visible full-link capture.
- The presence seating limits how many on-lot people carry a selectable body (a pre-existing living-lot behaviour); the world inspector card therefore appears only for a seated person, while the Profile and Roster (opened by exact id) work for everyone.
- Star badge / Star threshold: NOT produced (Owner-blocked). Star Power is shown as a value with its definition, never a rank or badge.

## 8. Hostile-review disposition
_(the fresh cross-stack hostile review and its remedies are appended here on completion)_
