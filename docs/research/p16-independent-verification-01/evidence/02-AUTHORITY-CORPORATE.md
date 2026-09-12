# Dossier A — Project Authority: corporate / identity / registry / P15↔P16 boundary

**Program:** Project: Studio P16 targeted independent research (READ-ONLY)
**Dossier:** 02-authority-corporate (assignment §1 and §2.E, F, I, M, T)
**Date:** 2026-09-11
**Mode:** documentation and read-only reconnaissance only; no repository edits, no runtime

---

## 1. Scope

This dossier reconstructs, from the project's own authorities, exactly what P16 planning already
exists and what P16 must inherit. It covers:

1. the CURRENT state of P16/P17/P18 planning (boundary language verbatim, additive-root list,
   immutable-ID law, the P15B corporate-fate lifecycle and participant-manifest law, the P12
   registry facts as accepted code);
2. what is SETTLED Owner law vs PRELIMINARY recommendation vs OPEN decision for acquisitions,
   closure, auctions, player terminal ending and rival-failure asymmetry;
3. every constraint P16 inherits;
4. what P15 currently says it hands to P16 at bankruptcy/closure (and whether "auction" exists);
5. every place prior prose says acquisition/merger/labels are NOT original parity;
6. contradictions between documents.

It does not evaluate comparators, real-world M&A, or the original game beyond what prior project
prose claims about them (those belong to sibling dossiers).

**Authority classes used throughout:**

- **CURRENT/ACCEPTED CODE** — `p12-accepted/` = full tree of commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` (P12 R05 Owner-accepted closeout; `src/` identical to accepted runtime TS `592e926b...`).
- **APPROVED DOCUMENTATION** — `p13-docs/docs/` = docs of `4734e4092d117ef89b7349389ef03bd95fc298c3` (docs-only branch `docs/p13-post-p12-launch-preparation-01`, 2026-09-11). Within it, the Owner-approved roadmap and Owner Rulings carry product-direction authority; the P13/P14/P15 packages are DECISION-READY RESEARCH CANDIDATES.
- **OWNER-SELECTED NEW DIRECTION** — the assignment §2 (not yet recorded in any repository document I inspected).
- **FUTURE RECOMMENDATION** — labelled "PRELIMINARY RECOMMENDATION" in the source, or my inference (§4 below).

---

## 2. Method and sources consulted

**Read in full (cat / sed ranges):**

- `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` (890 lines)
- `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md` (306 lines)
- `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` (1040 lines)
- `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` (keyword-located sections A, B, C.3–C.4, D.5–D.7, M.5, hostile review)
- `p12-accepted/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md` (39 lines)
- `p12-accepted/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` §§1–2, 6–19
- `p12-accepted/docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` (keyword rows HIS-013/014, INT-010–013, SAF-009, SIM-009)
- `p12-accepted/docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md` (209 lines)
- `p12-accepted/docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` §§3, 5, 6
- `p12-accepted/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` (111 lines)
- `pkg-docs/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` §§1, 10, 17, 22, 30–33, 37, 38 and Builder Annex §§C, J, N, O.15–16, R, T
- `pkg-docs/docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` §§32–33, Owner decisions
- Accepted code: `p12-accepted/src/core/hollywoodTypes.ts` (full), `hollywood.ts:96–138`, `calendar.ts:3`, `hollywoodValidation.ts:86,213–229`, `screenplay.ts:300–345`, `types.ts:241–264`

**Grepped** all of `p13-docs/docs` and `p12-accepted/docs` (and `pkg-docs/docs`) for: P16, P17, P18, StoryProperty, "Story Property", "chain of title", library, rights, licen, acquisition, merger, subsidiar, label, valuation, "net worth", auction, bankrupt, liquidat, closure, dormant, ownershipEvents, co-production, sabotage. Additional hits read: `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md`, `PROJECT-STUDIO-FUTURE-PACKAGE-DEPENDENCY-MAP.md`, `PROJECT-STUDIO-FUTURE-IMPLEMENTATION-SEQUENCE.md`, `P10-FUTURE-CONSUMER-CONTRACT.md`, `P12A-PRE-READINESS-AND-DEPENDENCY-GATE.md`, `P11A-DECISION-AND-REQUIREMENT-REGISTER.md` (REQ-023/038/041/042), `P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md` §3, `STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md` (CAT-050–056), `CODEX-TALENT-MARKET...PACKAGE-14.md` (§ deferrals), `CODEX-ERAS-TECHNOLOGY...PACKAGE-13.md` §16a and annex line 1009, `c2-planning/00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md` item 13, `CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md` row 105.

**Provenance verification (read-only `git show` in the local clone):** SHA-256 of the exported `P12-TO-P13-PRODUCER-HANDOFF.md` and `P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` equal `git show 13370d42...:<path>`; `CODEX-P13-P15-OWNER-RULINGS.md` equals `git show 4734e409:<path>`. Commit dates: both 2026-09-11.

**Web (failed):**
- `https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/` → HTTP 403 (publisher anti-bot). Alternate via web.archive.org → tool cannot fetch that host. A WebSearch confirmed the article exists and is an E3 2002 pre-release "first look" but the snippet did not contain the "acquiring competitors" sentence. The P15 package itself records that this URL returned an anti-bot response during its own validation (roadmap §24.1). **Result:** the P15 "REFUTED as shipped parity" finding is carried at the P15 document's confidence; independent re-verification of the original-game side is the original-game dossier's task, not this one.

---

## 3. Findings

Each finding: **Source / Locator / Proves / Confidence / Prior-prose status.**
Status vocabulary: CONFIRMED · QUALIFIED · CORRECTED · SUPERSEDED BY OWNER DIRECTION · NEW · N/A.

### 3.1 The CURRENT state of P16 planning (what exists today)

**F1. P16 is named and its candidate contents are enumerated in the Owner-approved roadmap.**
- Source: APPROVED DOCUMENTATION — `CODEX-P13-P15-LONG-RANGE-ROADMAP.md` §20, lines 689–704.
- Verbatim: "### P16 candidate — Studio Empire & Ownership Transactions — acquisition; merger; labels and subsidiaries; ownership stakes; studio valuation; library/IP ownership transfer; contract assumption and consent; debt/investor/equity integration if separately approved; antitrust or regulatory policy only if explicitly designed; ownership-aware legacy presentation." and line 725: "Every parked item needs a new Owner decision and research boundary. None is approved merely because its identity seam is future-proofed now."
- Proves: the P16 candidate list already covers acquisition, merger, labels, valuation, library/IP transfer, contract assumption; it is a parking list, not scope.
- Confidence: HIGH. Status: CONFIRMED (assignment §2.T "P16 StoryProperty, rights, ownership and acquisition transaction" fits inside this list).

**F2. The Owner-approved roadmap's final boundary line puts co-productions inside "P16+".**
- Source: roadmap §25 line 849: "P16+: ownership transactions, co-productions, acquisitions, mergers, library/IP transfer"; §26 (Owner approval 2026-08-31) lines 879–881: "Licensing, patents, royalties, technology-rights transfers, advanced mobility/buyouts, corporate ownership transactions, co-productions, library/IP transfers, and every other item in the approved P16+ parking lot remain deferred."; lines 886–887: "The **Corporate Hollywood** title grants no acquisition, merger, stake, subsidiary, co-production, or library/IP-transfer authority."
- Proves: "P16+" is a *parking designation* that includes co-productions; nothing in it is approved.
- Confidence: HIGH. Status: see F39 (contradiction analysis).

**F3. Owner Rulings make the P16+ parking lot and the corporate-title clarification durable Owner law.**
- Source: `CODEX-P13-P15-OWNER-RULINGS.md` §4.2 lines 232–234: "The words **Corporate Hollywood** do not authorize acquisitions, mergers, ownership stakes, subsidiaries, co-productions, or library/IP transfers. Those systems remain P16+ successor-design possibilities. They are not original-game parity and are not implicit in P15's title."; §5 lines 247–263: "acquisitions, mergers, subsidiaries, ownership stakes, valuation, library/IP transfer, and co-productions; advanced mobility and buyouts; patents; technology licensing and royalties ... franchise/IP strategy ... P16+ is a parking designation, not implementation approval and not a promise that every parked system will ship. Sabotage remains rejected as the default form of competition."; §8 line 304–306: "If later exploratory prose conflicts with this record, the approved boundaries, deferrals, open decisions, and implementation prohibition here govern unless the Owner issues a newer explicit ruling."
- Proves: settled Owner law places the whole ownership family outside P13–P15 and forbids parity labelling; any P16 charter is a *new* Owner decision (which the assignment now supplies as direction).
- Confidence: HIGH. Status: CONFIRMED / the assignment §2 is the "newer explicit ruling" for P16 direction (SUPERSEDED BY OWNER DIRECTION only as to what P16 will contain, not as to the P13–P15 prohibitions).

**F4. The accepted engineering contract defines the exact P16 → P17 → P18 documentation boundary (Revision 02).**
- Source: CURRENT/ACCEPTED CODE tree — `P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` §15 lines 348–375.
- Verbatim (lines 350–353): "The durable Owner ruling parks these future systems collectively in **P16+**. This Revision 02 clarification makes their documentation ownership boundary exact: `P16 Library/Rights → P17 Franchises/Continuations → P18 Television/Cross-Media`. The allocation is not implementation approval or a promise that any system ships; every package remains separately gated."
- Verbatim (lines 364–370): "P16 establishes the durable `StoryProperty` and Film Library identities behind one or more exact works. P16 owns origin-work relationships, chain of title, rights ownership, rights licensing, restoration and reissue authority, dated ownership history, and ownership transactions and acquisitions where later authorized. It may also later own mergers, valuation, stakes, labels/subsidiaries, co-productions, contract assumption/consent, and multi-party rights/finance shares under a separate Owner charter. P12A creates none of those identities, relationships, rights, or behaviors."
- Verbatim (lines 372–375): "A P12 concept, project, film, title, studio association, credit, or archive entry is not itself a `StoryProperty`, Film Library, origin-work relationship, or rights fact. Under later separate authority, P16 must create each property/library identity and origin-work relationship explicitly by exact ID; it may not infer or bulk-mint them from resemblance or presentation data."
- Proves: `StoryProperty` and "Film Library" are already named as P16-owned identities; P16 must mint them explicitly by exact ID; the P16 charter may also own transactions.
- Confidence: HIGH (hash-verified against commit 13370d4). Status: CONFIRMED by assignment §2.A (Story Property distinct from the film) and §2.T.

**F5. P17 boundary: consumes P16 truth; cannot create a StoryProperty or a right.**
- Source: same contract §15 lines 377–392. Verbatim: "P17 consumes exact P16 `StoryProperty`, Film Library, chain-of-title, rights, and licensing authority plus P12's exact work history. P17 owns continuation proposals; direct sequels, prequels, remakes, reboots, legacy sequels, and spinoffs; explicit parent/child continuation-work lineage; ... Any P17 franchise identity is an operational aggregate keyed to an exact P16 `StoryProperty` ID, never a second property or rights identity. P17 may not create or infer a `StoryProperty` from title, genre, cast, release order, current studio, similar concepts, presentation copy, or array position. It may not create a right or licensing authority merely because a franchise behavior wants to use one. Rights licensing remains P16 authority; P17 governs only authorized franchise use of owned or licensed rights."
- Proves: the assignment's "P17 should consume P16 StoryProperty/rights truth rather than invent sequel or franchise ownership" is already accepted documentation.
- Confidence: HIGH. Status: CONFIRMED.

**F6. P18 boundary: P16 is the sole author of the underlying legal right/license including its dimensions.**
- Source: contract §15 lines 394–405. Verbatim: "P16 remains the sole author of the underlying legal right/license, parties, scope/media, territory, term, exclusivity, and consideration. P18 may not infer availability from an old credit, duplicate P16's rights authority, or invent television/streaming facts before its own charter."
- Proves: the accepted contract already anticipates a rights object with parties / scope-media / territory / term / exclusivity / consideration dimensions, all owned by P16. (This is a *ceiling* of what P16's rights object may carry, not a mandate to model territories now; see §4.)
- Confidence: HIGH. Status: QUALIFIED — the assignment §2.B asks for the *smallest* bundle; the contract lists dimensions P16 *owns* if they ever exist, not dimensions P16 must ship.

**F7. The accepted producer handoff restates the P16→P17→P18 chain and the non-implication rule.**
- Source: `P12-TO-P13-PRODUCER-HANDOFF.md` line 28: "**P16 → P17 → P18:** Library/Rights/ownership → Franchises/Continuations → Television/Cross-Media. P12 films/projects/credits do not imply StoryProperty, rights/license or continuation authority; P17/P18 cannot mint or duplicate P16 rights."
- Proves: the accepted closeout carries the chain forward as "preserved downstream ownership ... adds no feature authorization" (line 22).
- Confidence: HIGH (hash-verified). Status: CONFIRMED.

**F8. The P12A register makes P16/P17/P18 ownership and the P12A prohibition explicit requirement rows.**
- Source: `P12A-DECISION-AND-REQUIREMENT-REGISTER.md` rows INT-011 (line 200), INT-012 (201), INT-013 (202), SAF-009 (235), HIS-013 (168), HIS-014 (169).
- Verbatim SAF-009: "Do not implement P16 acquisitions, mergers, labels/subsidiaries, StoryProperty/Film Library identity, chain of title, rights/licensing, library valuation/trading, co-production negotiation/shares, stocks, restoration/reissue, or ownership finance in P12A. ... P17 may never infer or mint P16 property authority from film or presentation similarities; P17/P18 may never duplicate a P16 legal right/license."
- Verbatim INT-011 proof column: "StoryProperty and origin-work IDs resolve exactly; ownership change never remints a work or erases creator/history; dated chain of title resolves; rights licensing has one P16 authority; inference/bulk-mint fixtures fail."
- Verbatim HIS-013: "When a studio closes later, settle projects/contracts and compact operations deterministically while retaining immutable identity, films, credits, material employment moves/events, awards, milestones, Standing/annual summaries, and ownership links; **acquired remains distinct from closed**."
- Proves: the acceptance-tested register already binds the future P16 to: exact-ID StoryProperty, no reminting on ownership change, dated chain of title, single rights authority, and "acquired ≠ closed".
- Confidence: HIGH. Status: CONFIRMED (assignment §2.I status model).

**F9. Additive-root list: `ownershipEvents` is reserved to P16+ and can never enter a P15 root.**
- Source: roadmap §8 table line 260: "| `ownershipEvents` / ownership relations | P16+ only | Acquisition, merger, library/IP transfer, co-production rights, and ownership transactions never enter a P15 root. |" and line 263: "Names are interface-level sketches, not authorized TypeScript identifiers." Also §10.1 step 8 line 302: "P16+, if authorized, adds ownership transactions separately." and line 289: "no P15 root may be pre-created as a misleading 'empty future slot.'"
- Proves: P16 will add its own root(s) and its own save-version step; nothing is pre-created by P15.
- Confidence: HIGH. Status: CONFIRMED.

**F10. Immutable-ID law (roadmap §9) explicitly names acquisition and ownership as non-reminting events.**
- Source: roadmap §9 lines 267–281. Verbatim: "`StudioId` — Mint once. Rename, distress, closure, acquisition, or re-entry appends events; none remints the studio." "`PersonId` — Reuse the P10 identity. Employer transfer, retirement, alumni status, or later staff role cannot copy/remint/delete it." "`FilmId` / `productionId` — Preserve P07/P10 identity from concept/production/release through every market, award, ownership, and legacy view." Also listed: `ContractId`, `CorporateEventId`. "Display names are labels. Every name change is a dated event. UI routes and histories carry exact IDs, never infer identity from title, name, array position, or current employer." "Cross-studio uniqueness is checked at load, mutation, replay, and endurance gates. Duplicate IDs fail visibly; repair must be versioned and deterministic."
- Proves: the assignment §2.F "PersonId does not change; historical StudioId does not disappear or get rewritten" is pre-existing approved law.
- Confidence: HIGH. Status: CONFIRMED.

**F11. P15 identity law: ownership is a dated relation; acquisition cannot rewrite creator facts.**
- Source: P15 §13.2 lines 531–539: "IDs are never recycled after closure, cancellation, retirement, migration, or deletion of a view. Display-name changes are dated events; names are not keys. Ownership, employer, and participation are dated relations; never mutate identity to express them. Future acquisition cannot rewrite historical creator/owner facts; this is a P16 requirement, not P15 implementation."
- Proves: "Ownership transfer NEVER rewrites who originally created/released the film" (assignment §2.D) is already stated as a P16 requirement.
- Confidence: HIGH. Status: CONFIRMED.

**F12. P15B corporate-fate lifecycle (the state graph any acquisition/closure transaction must attach to).**
- Source: P15 §12.3 lines 460–475. Verbatim: "active → warning → distress → recovery → active / ↘ dormant → recovery" ... "A single negative-cash week cannot skip directly to dormancy." ... "**PROJECT AUTHORITY VERIFIED:** P12 permits rival failure while protecting the player campaign from mandatory hard-bankruptcy game-over. A separately approved rival path may therefore add `dormant → closure-settlement → archived`, while the player graph remains recoverable dormancy unless the Owner separately authorizes a player terminal ending. Settlement invariants remain strict for every applicable path: projects, obligations, contracts, people, films, immutable identity, and public history resolve or persist explicitly."
- Builder Annex C.3 (lines 122–129): transitions `active/distress → dormant/distress` and `dormant/distress → active/recovery` each require "complete participant manifest ... then one P12 registry receipt"; "A future rival extension may request `dormant → closed` only after exact Owner-approved trigger, settlement, archive, and entrant-floor law; a player terminal ending is a separate decision. **Acquisition is never implied.**"
- Proves: P15's graph has no "for sale / in auction / acquired" state; acquisition would be a P16 edge that must attach to one of these P12-committed states.
- Confidence: HIGH. Status: CONFIRMED; the assignment §2.M "assets enter auction" is NEW relative to this graph (see F34).

**F13. Participant-manifest law (atomic all-owner transactions) — the transaction shape P16 must obey.**
- Sources: P15 §11 law 16 (line 404): "**Studio transitions are all-owner transactions.** A later entrant, dormancy, re-entry, or closure request cannot change P12 operating state until P13, P10, P11, P12, and P14 each supply an idempotent initialization/settlement receipt and the complete participant manifest commits atomically. No package's partial receipt becomes authoritative alone." P15 §12.3 lines 477–495: "Every future operating-state edge uses one participant manifest frozen at a source `GameState` revision. ... For dormancy/closure, P13 resolves every active research/adoption order and P14 resolves every open case/proposal/promise/commitment through typed dispositions; P10 settles contracts/person references, P11 settles finance, and P12 settles projects/capacity/roster/employer/exclusivity/intervals. P12 commits the registry transition only inside the same validated candidate. Duplicate requests return the existing manifest/receipt, and one failed participant leaves every root unchanged." "Every variable-size participant owner must prove completeness, not merely return one opaque receipt ID. ... Otherwise P13/P10/P11/P12/P14 supplies a request/source/rules-bound root manifest, affected-set count/root digest, ordered chunk-chain digest, and immutable typed chunks of at most 100 rows with each affected subject exactly once." Roadmap §10.1 step 7 (line 301) and §24 (lines 793–795) repeat the ≤100-chunk and atomic-failure requirement; Annex D.5 (lines 268–283) gives the `StudioOperatingTransitionParticipantManifest` sketch with `p13…Receipt`, `p10…ManifestRef`, `p11…Receipt`, `p12…CandidateReceipt`, `p14…Receipt`, `validationDigest`, `state: candidate | committed`, `p12RegistryTransitionReceipt`.
- Proves: any P16 acquisition (which changes employer, contracts, finance, projects, technology entitlement and registry role at once) is structurally a sixth participant on the same manifest pattern, not a new transaction framework.
- Confidence: HIGH. Status: CONFIRMED (assignment §3 "atomic all-owner manifests, receipts, bounded chunks ≤100").

**F14. P12 registry facts at accepted code: `StudioIdentity` has NO status/dormant/closed/owner field.**
- Source: CURRENT/ACCEPTED CODE `src/core/hollywoodTypes.ts:6–17`:
  `export type StudioIdentity = { studioId: string; role: 'player' | 'rival'; row: number; name: string; mark: string; color: string; founding: HistoricalDate | { kind: 'campaign'; week: number } | null; eligibleWeek: number; enteredWeek: number | null; recordedFromWeek: number | null }`
- `IndustryReceipt` kinds (lines 96–103): `studioEntered | employment | filmAnnounced | filmReleased | filmSettled` — no closure, dormancy, or acquisition receipt kind. `IndustryFilm` (lines 20–46) carries exactly one `studioId` (creating studio); there is no separate owner field. `RivalBusiness` (79–95) has `account`, `operations`, `productions`, `runs`, `projects`, `policy`.
- Proves: the registry currently expresses only role and entry; operating state and ownership are absent; "creating studio" is the only studio↔film relation.
- Confidence: HIGH. Status: CONFIRMED (handoff line 27: "Current `StudioIdentity` has no dormant/closed status field; the older contract's vocabulary is a future seam, not implemented corporate transitions.").

**F15. Nine reserved rival IDs and fixed entry weeks (accepted code and handoff).**
- Source: `src/core/calendar.ts:3` `export const RIVAL_ARRIVAL_WEEKS = [0, 0, 0, 0, 520, 988, 1560, 1872, 2548] as const`; `src/core/hollywood.ts:117–125` mints `studio-${key}-player` plus `studio-${key}-r01`…`r09` via `uniqueIdentity(..., taken)` against the talent/concept taken set; `hollywoodValidation.ts:86` enforces "fixed arrival policy mismatch". Handoff line 11: "One player plus nine reserved rival IDs; a reserved future ID is not an active employer. P13 must reference these IDs rather than create another registry." Line 12: "four opening rivals and later arrival weeks 520/988/1560/1872/2548 are fixed per campaign."
- Proves: the registry is a fixed ten-identity set (one player + nine rivals); there is no allocator for an *additional* studio and no "reserved future ID" is an employer before entry.
- Confidence: HIGH. Status: CONFIRMED.

**F16. Accepted code contains no ownership, bankruptcy, dormancy, valuation or acquisition concept.**
- Source: grep of `p12-accepted/src/core/*.ts` for `gameOver|bankrupt|insolven|dormant|studioStatus|acqui|ownerStudio|ownership|storyProperty|rightsHolder` returns only unrelated matches (capacity "acquisition not paid exactly once", production-phase "acquisition rank", `ACQUIRED_SCREENPLAY_LABEL`, `forecastHistoryForOwner(ownerStudioId)` which is the creating studio). `types.ts:241–264` `FilmResult` = `{productionId, releaseTick, delivered, cohesion, craft, critic…, segmentScores, boxOffice, conceptId, directorId, participants?, forecast?}` — no owner. `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` line 25–26 (at an earlier base): "there is no `gameOver`, `bankrupt`, `maxWeek` or terminal state anywhere in `src/`."
- Proves: P16 starts from zero on ownership; any ownership relation is a new versioned root.
- Confidence: HIGH. Status: CONFIRMED (P15 §9 line 351: "current `FilmResult` and production records identify works and outcomes but are not a library, IP-rights, chain-of-title, or ownership model — DO NOT TOUCH / P16+ ADDITIVE ROOT NEEDED").

**F17. Existing seam relevant to StoryProperty origin: screenplay provenance already distinguishes studio-original from market-acquired.**
- Source: `src/core/screenplay.ts:305–345`: `isOriginalScreenplay(blueprint) = blueprint.ordinal !== null`; `ScreenplayProvenanceView.origin: 'original' | 'pool'`; `writerId` (original) or null (pool); `export const ACQUIRED_SCREENPLAY_LABEL = 'Acquired from the open script market'`.
- Proves: the accepted product already records whether a work's source material was written in-house or came from the open script market. This is a *source-origin* fact, not a rights fact (contract §15: a P12 "concept ... is not itself a StoryProperty"), but it is the natural exact-ID anchor for the assignment §2.A distinction "studio-created original material ... normally owns the Story Property; externally sourced material may require purchase or license".
- Confidence: HIGH (code). Status: NEW (no prior prose connects this seam to P16).

### 3.2 SETTLED Owner law vs PRELIMINARY recommendation vs OPEN decision

**F18. SETTLED — the player has no mandatory hard bankruptcy; rivals may fail, be sold, merged or acquired.**
- Source: `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3 lines 56–65 (Owner order 2026-08-18, "current authority"): "The existing **no-hard-bankruptcy / no-receivership ruling applies to the player's studio.** It does **NOT** permanently prohibit future **rival** studios from experiencing distress, bankruptcy, receivership, sale, merger or acquisition, when and if the Hollywood Ecosystem is authorized. This ruling adds no rival mechanics now. The prior prohibition (no financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder or arbitrary cash sink) remains in force **for the player's studio** and is unchanged." §4 line 69–72: "Rival studios, rival films, multi-studio awards, film-library / IP economics, creative dynasties, acquisitions / subsidiaries and related competition are **legitimate long-term product directions**. They are **NOT currently authorized implementation scope.**"
- Proves: (a) the origin of player/rival terminal asymmetry is Owner law; (b) rival "sale, merger or acquisition" is explicitly permitted as a future direction; (c) the player-side prohibition also covers "financing, loans, bailouts, restructuring" — which constrains any P16 "asset sale as recovery mechanism" design (see §4).
- Confidence: HIGH. Status: CONFIRMED (assignment §2.J rival M&A; §2.K asset sales — QUALIFIED by the player-side "no restructuring / no failure ladder" clause).

**F19. SETTLED (design authority) — "acquired" and "closed" are distinct outcomes.**
- Source: P12 §30 line 881: "Closure releases or resolves talent under contract law, cancels/settles projects, ends future eligibility, and freezes the studio profile as historical. Filmography, people credits, awards, Standing peaks, and ownership history remain. Acquired is a later distinct outcome, never an alias for closed." Register HIS-013 (F8). P12 §17 table line 486: "player/rival role — durable relationship — role may change only if future ownership gameplay explicitly allows it."
- Proves: the assignment §2.I three-way status (BANKRUPTCY-Closed / ACQUISITION-Acquired by / MERGER-ABSORPTION-Independent operations ended, Successor owner) is consistent with prior prose provided all three are *distinct dated events* on a never-deleted identity.
- Confidence: HIGH. Status: CONFIRMED.

**F20. OPEN — player/rival closure asymmetry, exact rival-closure policy, later-entry policy, optional player terminal ending.**
- Source: Owner Rulings §4.3 lines 238–239: "**OWNER DECISION OPEN:** the exact shared-market formula; Power Ranking cadence and formula; player/rival closure asymmetry; exact later-entry policy; finale presentation; and post-2040 mode." P15 §23 rows "rival closure" (line 798) and "player closure / bankruptcy asymmetry" (line 799): "retain P12's no-mandatory-hard-bankruptcy law; any player terminal ending is a separately approved experience and settlement policy — pre-terminal guards/remedy capabilities remain equivalent, but terminal eligibility is explicitly asymmetric and never mislabeled as parity". P15 §17 lines 651–655: "Documents and tests must call this terminal law asymmetric rather than demanding terminal parity."
- Proves: P16 cannot assume a rival closure trigger exists (it is an unapproved P15B terminal slice), and cannot assume any player exit. The assignment §2.J "different legality is not [allowed]" applies to *transaction law*; terminal *eligibility* asymmetry is settled and is not a legality difference.
- Confidence: HIGH. Status: QUALIFIED (assignment §2.J "symmetric player/rival law" must be read as symmetric *transaction* law; terminal asymmetry is settled Owner law and must not be relabelled).

**F21. PRELIMINARY → made effective by roadmap approval — acquisition deferred to P16+ because it "requires valuation, ownership, contracts, IP/library transfer, immutable history; not original parity".**
- Source: roadmap §19.3 line 676: "| Acquisition | disallow; P15; P16+ | defer to P16+ | Requires valuation, ownership, contracts, IP/library transfer, immutable history; not original parity | No |"; line 680 co-production same; §22 line 759: "| P16 ownership transactions | Very large / very high risk | identity, valuation, rights, contracts, finance, migration | Separate package is mandatory if authorized |"; §23 reason 9 line 773: "Acquisition is successor invention and would expand scope across finance, contracts, IP, and identity."
- Proves: the project already lists the dependency set P16 must resolve (valuation, ownership, contracts, IP/library, immutable history, finance, migration).
- Confidence: HIGH. Status: CONFIRMED.

**F22. SETTLED (P11 law) — there is no debt instrument, loan, investor, equity or public-market authority; bankruptcy and financing are OWNER-BLOCKED gates.**
- Source: `CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` §33 lines 1297–1305: "No current authority exists for loans, credit facilities, interest-bearing debt instruments, investors, equity, bonds, interest, tax, acquisition, or public markets. P11 therefore: ... makes external financing a separate future product/Owner decision, not an implementation seam to fill opportunistically." §32.1 line 1275: "There is no authoritative bankruptcy, receivership, loan, bailout, forced sale, or game-over state." `P11A-DECISION-AND-REQUIREMENT-REGISTER.md` rows: P11-REQ-041 "Loans/investors/external financing require separate Owner gate — OWNER-BLOCKED"; P11-REQ-042 "Bankruptcy/failure or structured recovery requires separate Owner gate — OWNER-BLOCKED — P15 corporate fate / future finance law". R05 §2 line 49: "No unapproved loans or debt system." Roadmap §20 P16 bullet: "debt/investor/equity integration if separately approved".
- Proves: in the accepted product "liabilities" are typed *obligations* (contract guarantees, scheduled commitments, payroll/Opex, project commitments — contract §6.1), not debt. The assignment §2.F question "Does debt transfer?" and §2.S lever "debt needed to finance deals" presuppose a debt concept that does not exist and is Owner-gated.
- Confidence: HIGH. Status: QUALIFIED (assignment §2.F/§2.N/§2.S) — "DEBT/LIABILITIES" must be split into (i) existing typed obligations (transferable in principle) and (ii) debt instruments (require a separate Owner financing gate before P16 can assume or create them).

**F23. SETTLED — "Negative cash alone is not bankruptcy; runway is not a distress threshold."**
- Sources: producer handoff line 15: "Negative Cash alone is not bankruptcy and runway is not an invented distress threshold."; contract §14 line 346: "Negative cash alone is not bankruptcy, and current-pace runway is not a new P15B distress threshold."; P15 §11 law 5: "**Negative cash is not bankruptcy.** P11 cash and obligations inform distress only through approved staged law."; roadmap §5.3 line 165–167: "Negative cash is currently recoverable and does not mean bankruptcy. P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger."; P11-REQ-023 PROVEN.
- Proves: P16 cannot use cash < 0 or runway as a "distressed target" or "forced sale" trigger; distress/dormancy eligibility must come from an approved P15B staged law.
- Confidence: HIGH. Status: CONFIRMED.

**F24. SETTLED — symmetric law with no `isPlayer` branch; no hidden subsidy or secret rescue.**
- Sources: P15 §11 laws 1, 8, 9 (lines 389, 396–397): "One market, one law." "No player-only penalty." "No hidden difficulty subsidy. Rivals cannot receive secret cash, free talent, instant films, technology grants, or outcome multipliers."; §17 line 643 "no `isPlayer` multiplier or exemption"; P12 §33 lines 935–955 (fair-AI law; rejected knobs "infinite cash, free talent ... hidden rescue top-ups"); P15 §16 line 619: "Loans, bailouts, investors, forced sales, or acquisition are not implied."; roadmap §14 Level 2 lines 493–496.
- Proves: any P16 rival-bidding/valuation policy must be the same legal set for player and rivals; rivals may differ only in deterministic selection policy and bounded, disclosed difficulty knobs.
- Confidence: HIGH. Status: CONFIRMED (assignment §2.J).

### 3.3 Constraints P16 inherits (in addition to F9–F13, F22–F24)

**F25. No second registry; P12 alone mints `StudioId` and commits operating state.**
- Sources: roadmap §5.4 line 171: "P12 establishes ... immutable `StudioId`, and the sole durable active/dormant/closed registry ... None creates another studio registry."; §4.1 P15 "MUST NOT DUPLICATE" cell line 147: "P12 registry, `StudioId` minting, active/dormant/closed state, roster/employer/exclusivity/interval truth, entrant initialization and canonical entry/closure events; ... ownership transactions"; P15 §13.1 line 519: "no parallel active/dormant/closed registry"; handoff line 11.
- Proves: a P16 "label" or "subsidiary" cannot be a second registry or a second `StudioId` minting path; a surviving brand must be an ownership relation over the *existing* immutable `StudioId`.
- Confidence: HIGH. Status: CONFIRMED (assignment §2.E "Labels should not become a second separately managed studio").

**F26. No hidden data; ownership claims are NOT YET AUTHORIZED for display before P16; ownership change is PUBLIC AFTER EVENT.**
- Source: contract §9 lines 268–278: "**PUBLIC AFTER EVENT** — Release/result, completed employment move, cancellation, milestone, closure, or ownership change only after the authoritative event occurs and its visibility permits publication." "**HIDDEN** — Exact cash, ledger, reserve target, private salary/contract terms, internal policy weights, private forecasts ..." "**NOT YET AUTHORIZED** — ... `StoryProperty`, library, ownership, or rights claims before P16 authority." Contract §6.4 table: exact rival cash, obligations, budget/forecast/runway are HIDDEN by default. P15 §13.3 lines 541–546.
- Proves: a P16 valuation/offer surface must be built from lawful public facts (released films, public results, public credits, disclosed events) plus whatever a P16 *disclosure law* explicitly opens (e.g., due-diligence at offer time); it cannot read a rival's hidden cash to price it without an explicit disclosure transition. This directly constrains assignment §2.L/§2.N/§2.O "what should be visible to the player".
- Confidence: HIGH. Status: QUALIFIED (assignment §2.N valuation inputs "cash; debt" are HIDDEN rival facts by default).

**F27. Old-save honesty: histories are "Not recorded", never backfilled.**
- Sources: roadmap §5.1 line 157; §10.2 lines 311–316; P15 §18.2 lines 677–681 ("no pre-migration pressure, ranking, rival entry, distress, closure, recovery, or Legacy claim is invented"); contract §2 law 7 line 21.
- Proves: P16 migration may not invent StoryProperty ownership history, prior transactions, or valuations for pre-P16 saves; at most it may record a *baseline* (e.g., creator = owner as of migration week) where an accepted current fact proves it (P12 §17 line 502: "Existing player film ownership is derivable because only the player existed; adding that known association during migration is not fictional backfill.").
- Confidence: HIGH. Status: CONFIRMED.

**F28. Sabotage rejected as default competition; corporate transactions may not re-enter P15 as "small" UI options.**
- Sources: Owner Rulings §5 line 263; P15 §25 lines 860–861: "Sabotage/crime remains rejected as default competition. Corporate transactions are not allowed to re-enter P15 as 'small' UI options."; P12 do-not-do line 1165.
- Confidence: HIGH. Status: CONFIRMED.

**F29. Bounded projections: page default 25 / hard max 100; manifests ≤16 domains; chunks ≤100; no O(history) weekly work; no unbounded DTO arrays.**
- Sources: roadmap §12.2 lines 397–413, §13.3 lines 459–470, §24 lines 791–795; P15 §19 lines 701–720.
- Proves: a P16 "library" projection (potentially thousands of works over 6,240 weeks) must page by append-stable cursor and never enumerate all works to price a deal.
- Confidence: HIGH. Status: CONFIRMED.

**F30. Frozen leaves may not be widened; ownership must be additive versioned roots with dated relations.**
- Sources: P12 §17 lines 470–475 (frozen list: `Studio`, `Standing`, `Production`, `TheatricalRun`, `FilmResult`, `Talent`, `Contract`, `FilmConcept`, `FilmParticipants`, `MarketState`/`CompetingRelease`, `FoundingState`, `TalentCareerEvent`, `EraConfig`); §32 lines 909–929 ("Preserve now: ... current owner and original creator as distinguishable relationships when ownership is later introduced; dated ownership history rather than destructive reassignment; ... room for one film to have multiple future ownership/finance shares without changing its identity. ... Do not add speculative nullable fields to frozen leaves"); P15 §13.1 lines 527–529; roadmap §8 line 241.
- Proves: `IndustryFilm.studioId` (creating studio) must remain what it is; "current owner" is a separate P16 relation keyed by exact film/property ID.
- Confidence: HIGH. Status: CONFIRMED.

**F31. Contract "sale/assignment" is already a named lawful contract terminator in P12 design authority (not implemented).**
- Source: P12 §22 "Legal movement" line 665: "Active guaranteed contracts remain exclusive until expiry, lawful release, sale/assignment, or a future explicitly authored break clause."
- Proves: employee contracts transferring intact to a buyer (assignment §2.F Q3) has a pre-existing legal-category seam ("assignment") without changing `PersonId`/`ContractId`; ordinary termination afterwards (Q4) would use the existing P10/P11 release law (accepted code: `releaseTalent` may take cash negative — P11-REQ-023).
- Confidence: MEDIUM (design authority, not code). Status: CONFIRMED (assignment §2.F "employee contracts transfer intact").

**F32. P14 explicitly parks acquisition/merger workforce or library transfer and labels/subsidiaries in P16+, and forbids smuggling acquisition in as "talent transfer".**
- Source: `CODEX-TALENT-MARKET...PACKAGE-14.md` lines 697–705: "### Deferred to P16+ — acquisition/merger transfer of workforce or libraries; co-production labor sharing; labels, subsidiaries, guilds/unions ...; estate/rights/succession law ... Acquisition is not verified original-game parity and cannot be smuggled into a 'talent transfer' implementation." Lines 68–72: P14D (in-term approaches, negotiated release, buyout/compensation, contract break, tampering) parked in P16+ by default.
- Proves: a P16 acquisition that moves a whole roster is a *P14D-class* mobility event by prior placement; if P16 does it, P16 must own the whole-roster employer transition receipt through P12's existing employer/interval commit, not through P14A's chooser.
- Confidence: HIGH. Status: CONFIRMED.

**F33. P13 technology: ownership transfer must not change technology/adoption identity; "transfer, co-development and inherited entitlement are later cases"; supplier commercialization is Owner-desired with P16+ default placement.**
- Sources: P13 Builder Annex line 1009: "An employer change in P14 and ownership transfer in P16+ must not change a person, studio, technology, film, facility-history, or adoption identity."; P13 §16a.2 (lines 844–857): `InventionProvenance` record with "entitlement class (`ownDevelopment`)" and "Transfer, co-development and inherited entitlement are later cases."; §16a.4 (869–878): "outright rights sale (one payment, commercialization rights leave, own use retained) and supplier licensing remain distinguishable; discovering a capability confers no monopoly over it."; Owner Rulings §2.4.3 LATER COMMERCIALIZATION SCOPE includes "transfer and co-development entitlement, final package placement"; §5: "patents; technology licensing and royalties remain here by default".
- Proves: (a) "acquired research" in P16 has a named seam — the target's `InventionProvenance`/entitlement records and per-studio adoption state (`studioTechnology` keyed by `StudioId` + `TechnologyId`, roadmap §8) — but *what an acquirer inherits* is explicitly an undecided later case; (b) P13's own direction already separates knowledge/eligibility from physical installation ("Cash accelerates qualified research; it does not bypass ... facility capability or necessary work", rulings §2.4.1 item 2), which supports the assignment's "KNOWLEDGE TRANSFERS, PHYSICAL INSTALLATIONS DO NOT MAGICALLY APPEAR" as consistent with existing law.
- Confidence: HIGH. Status: CONFIRMED (assignment §2.F Q7/Q8 principle) / OPEN as to the exact entitlement class an acquirer receives.

### 3.4 What P15 hands to P16 at bankruptcy/closure

**F34. There is NO "auction" and NO "liquidation" language anywhere in the P13-docs, P12-accepted, or package-design trees.**
- Source: `grep -rni auction` → 0 hits in `p13-docs/docs`; 1 hit each in `p12-accepted/docs` and `pkg-docs/docs`, both the same P12 sentence (line 225) about *talent* "auctions or poaching". `grep -rni liquidat` → 0 hits in all three trees.
- Proves: the assignment §2.M premise "P15 may decide that a rival becomes bankrupt and its assets enter auction" describes a step that no P15 document defines. The P15B rival terminal path is `dormant → closure-settlement → archived` (F12) in which settlement *resolves or cancels* projects/contracts/obligations and *archives* identity; no asset-disposal, sale, or transfer step exists, and P15 §16 explicitly says "forced sales, or acquisition are not implied."
- Confidence: HIGH. Status: CORRECTED (assignment §2.M premise) — an auction is a *new P16 transaction* that must be inserted *before* P15's closure-settlement consumes the estate, or P15's settlement must be redefined to leave a transferable estate; today it does neither.

**F35. What P15 closure settlement currently guarantees (the "estate" P16 would inherit if nothing changes).**
- Source: P15 §12.3 line 474–475: "projects, obligations, contracts, people, films, immutable identity, and public history resolve or persist explicitly."; P12 §30 line 881 (F19); P12 annex N line 625: "rival closure — settle projects/contracts, archive identity, remove from active cohort — historical profile; talent lawfully released — references remain valid"; annex O.16 line 702: "A rival unable to recover settles/cancels projects, releases talent legally, exits active charts, and remains inspectable as a historical studio with films/credits intact."; annex J event matrix line 449: "closure | ... | studio/week/settlement refs".
- Proves: after P15 closure as written, the only durable "assets" are *films/credits/history* (immutable, non-transferable in P15 terms) — projects are cancelled, people released, obligations settled. Films remain attributed to the creating studio; no owner relation is minted. Hence the film library of a closed studio is *orphaned-but-attributed*, not "available for purchase", unless P16 defines the property/ownership relation first.
- Confidence: HIGH. Status: NEW (no prior prose analyses the closure estate from an acquirer's perspective).

**F36. The only sketched acquisition receipt shape in prior prose.**
- Source: P12 Builder Annex J industry-event matrix line 450: "| acquisition later | Yes | Yes | INFO/DECISION if player involved | Yes | parties/effective week/ownership refs |"; contract §8 receipt envelope (lines 220–243) lists `counterpartyStudioId` as an available field.
- Proves: prior prose anticipates an acquisition receipt with parties, effective week and ownership references, and a DECISION tier only when the player has a live legal response window — consistent with the assignment's "target may reject an offer" model (§2.L).
- Confidence: MEDIUM (annex sketch, not law). Status: CONFIRMED.

### 3.5 Where prior prose says acquisition/merger/labels are NOT original parity

**F37. Multiple independent statements; the strongest is the P15 REFUTED pair.**
- P15 §5.5 lines 254–262: "**REFUTED:** acquisition was a verified shipped mechanic. It appears in no inspected retail official manual, Prima section, retail walkthrough, or expansion manual. Any successor acquisition belongs to P16+ and must never be labeled parity." and "**REFUTED:** co-production, merger, library/IP ownership transfer, subsidiaries, and labels were verified shipped mechanics."
- P15 §5.5 lines 246–252: rival bankruptcy/closure/merger/ownership change is an **OPEN QUESTION**; the GameSpot 2004 "studio goes bust" and E3 2002 "acquiring competitors" items are "SOURCE VERIFIED AS PRE-RELEASE REPORT ONLY".
- P15 §5.7 line 279; §6 table line 293 ("acquisition shipped — REFUTED — P16+ successor design only"); §29 Q10 "Is acquisition presented as original parity?"; Annex hostile Q15.
- P12 §10 lines 296–304: "**REFUTED — Acquisitions were a verified shipped *The Movies* mechanic.** ... **PROJECT AUTHORITY VERIFIED — Successor acquisitions are independently legitimate future direction.** That authority comes from the Owner ruling, not historical parity."; P12 do-not-do line 1164: "do not describe acquisitions as shipped historical parity".
- Owner Rulings §4.2: "They are not original-game parity". Roadmap §19.3 line 676 "not original parity"; §24.1 line 819: "acquisition explicitly refuted as shipped parity".
- P13 §(line 1150): "acquisition/merger/library transactions, which are P16+ candidates and not original parity"; P14 line 705 (F32).
- Proves: every P16 document must carry acquisition/merger/labels/library-transfer as SUCCESSOR DESIGN under Owner direction, never as parity. (The E3 2002 URL could not be independently re-fetched — see §2.)
- Confidence: HIGH that prior prose says so; the underlying original-game claim is carried at the P15/P12 documents' confidence. Status: CONFIRMED (assignment §2.Q "prior research believes acquisition was discussed pre-release but NOT verified as shipped").

**F38. The only original-game ownership-transfer mechanics that prior prose calls SOURCE VERIFIED are selling Stars and scripts to rivals.**
- Sources: P15 §5.3 line 230–233: "official manual and Prima evidence establish rival Stars entering the player's Stage School, unhappy or fired player Stars joining other studios, and Stars/scripts being sold to rivals. These prove connected competition, not a modern contract market or acquisition system."; P12 §3 line 120: "deliberate sale of player Stars/scripts to rivals"; P10 row 105: "an existing Star or script could be sold to a rival through the selling facility ... **High for rejection/sale**".
- Proves: for assignment §2.D/§2.K (individual asset sales), the only parity-adjacent evidence is *script sale* and *Star sale*; film-library sale, property licensing and corporate sale have no parity claim.
- Confidence: MEDIUM (prior prose; not re-verified here). Status: CONFIRMED-by-prior-prose; flag for the original-game dossier to re-verify against the manual/Prima text.

### 3.6 Contradictions and inconsistencies between documents

**F39. Co-productions: inside or outside P16?**
- Roadmap §20 lists co-productions under "Other deferred candidates" (line 713), *not* in the "P16 candidate" bullet list (695–704); but roadmap §25 line 849 and Owner approval §26 place "co-productions" in "P16+"; P15 §25 lines 839–848 lists "co-production finance, credit, rights, control, and settlement" *inside* the "P16+ — Studio Empire & Ownership Transactions" heading; contract §15 says P16 "may also later own ... co-productions ... under a separate Owner charter"; roadmap §19.3 line 680 defers co-production "to P16+"; P14 defers "co-production labor sharing" to P16+.
- Analysis: all sources agree co-production is *parked* and *unapproved*; they disagree only on whether the parking shelf is labelled "P16" or "P16+ other". Since Owner Rulings §5 defines "P16+" as "a parking designation, not implementation approval", none of these placements is scope. The assignment states co-productions are NOT selected for P16. **No law conflict; a prose-labelling inconsistency.**
- Smallest correction: a future P16 charter should state that co-production remains in the P16+ parking lot as a *separate later candidate (P16D or later)* and is not in P16A/B/C, with the reserved contract-§15 interface ("multi-party rights/finance shares") left un-minted.
- Confidence: HIGH. Status: SUPERSEDED BY OWNER DIRECTION (for P16 content); CONFIRMED that nothing was ever approved.

**F40. "P18 does not exist" vs the accepted P16→P17→P18 allocation.**
- `STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md` CAT-056 (line 323): "**Correction:** the proposal cites a 'P18 series/platform workflow'. No P18 exists in the approved roadmap, which runs P13, P14, P15 and then a P16+ parking lot. The rulings park **television and streaming in P16+**, so this entry is re-pointed there."
- Versus: contract §15 Revision 02 (accepted 2026-09-11 at `13370d4`): "`P16 Library/Rights → P17 Franchises/Continuations → P18 Television/Cross-Media`"; producer handoff line 28; `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md` §"P16–P18" line 102–104; `PROJECT-STUDIO-FUTURE-PACKAGE-DEPENDENCY-MAP.md` §9 lines 115–117; `P12A-PRE-READINESS-AND-DEPENDENCY-GATE.md` line 49; register INT-013; P10 future-consumer contract §"P16/P17/P18".
- Analysis: both are "true in frame". The Owner-approved *roadmap* (product-direction authority) names only "P16+"; the accepted *engineering* documents allocate P16/P17/P18 as "documentation ownership boundaries ... not implementation approval". The catalogue's "No P18 exists" is over-strong and, as a Current Ops document, cannot override an accepted engineering contract; but neither document makes P18 approved scope. The assignment's use of P16/P17/P18 matches the accepted engineering allocation.
- Smallest correction: treat P16/P17/P18 as the accepted *documentation allocation inside* the Owner's P16+ parking designation; a P16 charter should say so in one sentence to stop the drift.
- Confidence: HIGH (documents quoted); MEDIUM on which authority "wins" (the rulings §8 governance clause favours the Owner record, which is silent on numbering).
- Status: NEW (contradiction not previously recorded).

**F41. P16 naming drift.**
- Roadmap §20 / P15 §2, §25: "Studio Empire & Ownership Transactions"; contract §15 / handoff / control board / dependency map: "P16 Library/Rights"; `HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` §5 lists two separate backlog pillars "Studio Legacy / Film Library / IP" and "Studio Empire / Acquisitions"; implementation sequence §8: "P16 Library/Rights publication package". Assignment: "Studio Empire, Library & Ownership".
- Analysis: no substantive conflict — contract §15's P16 scope (StoryProperty + Library + rights + transactions + acquisitions) is the superset and the assignment's P16A/B/C split maps onto it exactly (A = Library/StoryProperty/rights identity; B = rights & asset transactions; C = studio acquisition & integration). The two-pillar backlog in the future-proofing scout foreshadows that split.
- Confidence: HIGH. Status: CONFIRMED (assignment §2.T "P16A/B/C — Current Future Ops recommendation is YES" is consistent with every prior document).

**F42. Rival M&A permitted vs never designed.**
- Owner Horizon §3 (F18) permits rival "sale, merger or acquisition"; P12 register HIS-014 requires "dated studio arcs/ownership" and "P16 StoryProperty/library/rights/ownership history" as Legacy inputs; P12 §17 "role may change only if future ownership gameplay explicitly allows it"; but no document designs rival-initiated acquisition, bidding, affordability or anti-snowball.
- Confidence: HIGH. Status: CONFIRMED as legitimate direction (assignment §2.J); NEW as design.

**F43. A player-initiated *sale of the player's own studio* would be a new player-exit path with no prior prose.**
- Player terminal ending is OPEN (F20); Horizon §3 keeps "no restructuring / failure ladder" for the player. Nothing in any document contemplates the player selling their studio or being acquired.
- Confidence: HIGH (absence verified by grep). Status: NEW — requires an Owner decision if P16 wants symmetric "any studio can be a target" law (see §4).

**F44. Physical property: rivals own NO buildings or lot in the accepted model — only abstract capacity paid once.**
- Source: handoff line 14: "Rival physical operations are abstract, not fabricated room/lot occupancy."; `hollywood.ts:98–104` `rivalStartingFacilities` returns four abstract facilities (`development-casting` cap 2, `soundstage` cap 1, `set-scenery` cap 2, `post` cap 2) keyed `${studioId}:development` etc.; `hollywoodValidation.ts:228–229` "capacity acquisition not paid exactly once"; P12 Annex E line 243: "Production stages — No, studio-local — player lot authority — abstract rival-local capacity — acquisitions later — never compete for player's stage"; P15 §1.2 P09 row: "never treats corporate ownership as land placement"; roadmap §5.4: "The physical-rival-lot temptation remains rejected until player value is proven."
- Proves: assignment §2.G's alternatives concern an asset class that, for rival targets, currently exists only as *abstract capacity with a recorded capex*. "Buildings cannot teleport" is trivially satisfied; the real question is what an acquirer gets for the target's abstract capacity (see §4).
- Confidence: HIGH. Status: QUALIFIED (assignment §2.F "EQUIPMENT; LAND; BUILDINGS/FACILITIES" and §2.G).

**F45. Later-entrant/replacement floor law interacts with acquisition.**
- Source: P12 §30 line 885–887: "6–10 active AI rivals, ... deterministic entrants maintaining a minimum of 3 active AI rivals"; P15 §23 line 800 "P12's minimum three active AI rivals"; but accepted code has a fixed nine-rival registry with no allocator for additional entrants (F15); "Replacement/wider entrant eligibility/request — P15B PRODUCER — Not P12A" (contract §8.1).
- Proves: every acquisition of a rival permanently reduces the active-rival count under the current fixed-nine registry; the replacement-entrant mechanism that would restore the floor is itself an unapproved P15B slice. This is a structural coupling P16 cannot ignore (see §4 anti-snowball).
- Confidence: HIGH. Status: NEW.

---

## 4. Design implications for P16 (my inference — not project law)

Labelled **INFERENCE** unless stated. Nothing here reopens a settled Owner decision.

1. **INFERENCE — P16 is a sixth participant on the existing all-owner manifest, not a new framework.** A whole-company acquisition changes registry role/status (P12), employer intervals and contracts (P12/P10), finance (P11), projects/capacity (P12), technology entitlement/adoption (P13), open cases/promises (P14) and ownership relations (P16). F13's `StudioOperatingTransitionParticipantManifest` pattern (frozen source revision; per-owner count/root/chain-digest receipts; chunks ≤100; candidate→committed; duplicate returns receipt; one failure = no change) is the only transaction shape prior law permits. The P16 charter should define an `AcquisitionTransaction` (or `OwnershipTransaction`) request whose commit *is* one such manifest with a P16 ownership-relation receipt added and with P12 still committing the registry edge.

2. **INFERENCE — the P15↔P16 seam at distress must be designed as a new P12-committed operating state, e.g. `dormant → (P16) acquired → archived-as-acquired`, inserted before P15's `closure-settlement`.** As written (F34/F35), closure-settlement cancels projects, releases people and settles obligations, leaving nothing transferable. The smallest correction to prior prose: P15B's terminal slice, when authorized, must expose a *pre-settlement estate window* (a bounded, deterministic number of weeks) during which a P16 transaction may claim the estate; if none commits, settlement proceeds unchanged. That keeps P15 sole owner of distress/dormancy eligibility (its settled boundary) and P16 sole owner of the transfer. An "auction" is then a P16 transaction *type* that runs inside that window, not a P15 event.

3. **INFERENCE — "assets enter auction" cannot be an automatic consequence of negative cash or runway (F23).** The only lawful trigger is a P15B distress/dormancy state reached through approved staged law. P16 should treat "distressed target" as a *P12 operating state fact plus a P15 condition fact*, never as a P16-computed financial test.

4. **INFERENCE — split the assignment's "DEBT/LIABILITIES" into two things (F22).** (i) *Typed obligations* (contract guarantees, scheduled commitments, project commitments, facility/capacity Opex) exist today and can transfer as-is through P11/P12 receipts. (ii) *Debt instruments* do not exist and are OWNER-BLOCKED (P11-REQ-041); an "assumption purchase" that assumes *debt* needs the financing gate opened first; an assumption purchase that assumes *obligations* does not. Recommend the P16 charter use the word "obligations" and reserve "debt" for a later financing decision.

5. **INFERENCE — Model D (absorb, optionally retain brand as label) fits the registry law only if a "label" is an ownership relation, not an identity.** Under F25/F14, the acquired `StudioId` stays in the registry forever with a new operating state (e.g., `absorbed`) and a dated `ownedBy` relation; "retain brand as label" = the acquirer may attribute *future* releases to that label via a P16 relation on the new film, while historical films keep their original `studioId` untouched (F30). No second `RivalBusiness`, no second roster, no second cash account. Model B (autonomous subsidiary) would require a second operating business under the same law and directly conflicts with "one studio remains operationally managed" and with the fixed-nine registry's assumption that every active rival is autonomous.

6. **INFERENCE — history model for assignment §2.I should be three distinct P12 operating-state terminal edges plus P16 relations:** `closed` (P15 closure-settlement; successor owner = none), `acquired` (P16 whole-company transaction; successor owner = buyer StudioId; brand retained flag), `absorbed/merged` (same transaction with brand not retained). All three keep the identity queryable (F10, F19). The exact enum names belong to implementation recon, but the *count* (three) and the "acquired ≠ closed" law are already fixed by HIS-013.

7. **INFERENCE — the StoryProperty minting rule already exists and constrains P16A:** each property must be created explicitly by exact ID, never bulk-inferred from titles/concepts (F4, F8). A migration baseline "creator owns its own works as of `recordedFromWeek`" is permitted by P12 §17's "derivable ... not fictional backfill" reasoning only where the fact is *certain*; for rivals with authored back-catalogues (R05 §2) the authored manifest is the exact source. The `origin: 'original' | 'pool'` screenplay seam (F17) is the natural exact-ID anchor for "studio-originated vs externally sourced" without inventing a new source-of-material taxonomy.

8. **INFERENCE — valuation/offer visibility must be a P16 disclosure law layered on contract §9 (F26).** Book-net-worth and enterprise-valuation inputs that are HIDDEN rival facts (cash, obligations, budgets) cannot be shown to the player merely because P16 needs a price; P16 must either (a) price from PUBLIC facts only, or (b) define an explicit PUBLIC AFTER EVENT disclosure at offer/due-diligence time. This is the cleanest way to satisfy assignment §2.L "avoid an opaque bargaining simulator" and §2.N "transparent structure" without breaking the visibility doctrine.

9. **INFERENCE — symmetric transaction law + settled terminal asymmetry means: any *rival* can be a target under P16 law; the *player* studio can be a target only if the Owner separately decides a player exit exists (F20, F43).** Recommend P16 charter state explicitly: "player studio is not an acquisition target in P16A–C; a player-sale ending is a separate Owner decision" — this is the smallest rule that preserves both settled laws and avoids a hidden asymmetry.

10. **INFERENCE — anti-snowball has a structural lever prior prose already supplies: the fixed-nine registry and the ≥3-active-rival floor (F45).** Every absorption permanently removes an active rival unless a P15B replacement-entrant slice exists; therefore the P16 charter should either (a) depend on P15B entrant law, or (b) make the active-rival floor a hard eligibility predicate on acquisitions (a transaction that would breach the floor is refused with a typed reason). Option (b) is the minimum protection, is symmetric, and needs no artificial M&A cap.

11. **INFERENCE — technology transfer (assignment §2.F Q7/Q8) has an exact seam and an exact gap.** Seam: per-studio adoption rows (`studioTechnology` keyed `StudioId`+`TechnologyId`) and `InventionProvenance` entitlement records. Gap: "inherited entitlement" is explicitly a later case (F33). The Owner's principle (knowledge/eligibility transfers; installations do not) maps to: buyer gains the target's *eligibility/knowledge* rows and any *own-development* entitlement for still-in-force provenance; buyer's *installation* and *operational* facts are unchanged; rival abstract capacity (F44) has no physical installation to transfer, so for rival targets Q8 is moot and only the entitlement question remains.

12. **INFERENCE — physical property for rival targets reduces to one question: is the target's once-paid abstract capacity a cash-convertible asset?** Since it is not a building on a lot (F44), option 3 ("remote corporate property exists only as a financial asset") or option 1 ("automatic liquidation at closing" at a defined recovery fraction) are the only alternatives that do not invent a second lot; option 4 (transferable equipment) has no current substrate for rivals.

13. **INFERENCE — package split.** P16A (StoryProperty/Library/rights identity, F4/F17) has no dependency on P15B and could be chartered first; P16B (rights & asset transactions between *active* studios) depends on P16A, P11 and P12 receipts only; P16C (whole-studio acquisition & integration) depends on P16A/B *and* on the P15B distress/terminal slice for distressed targets, and on the P14D placement decision for contract assumption. Co-production, debt/equity, antitrust, and supplier-commercialization transfer entitlement should stay parked (P16D+ or later) exactly as prior prose already lists them. This is consistent with the assignment's "YES" on A/B/C.

---

## 5. Open questions (genuine, not resolved by any inspected document)

1. Does the Owner authorize a P15B *rival terminal* slice at all, and if so does it include a pre-settlement estate window for P16 (the only place an "auction" can live)? (F12, F34, §4.2)
2. What is the P12 operating-state vocabulary after acquisition — one new state (`absorbed`) or reuse `closed` with a P16 successor relation? HIS-013 requires "acquired ≠ closed"; the enum is undecided. (F19)
3. Is the player studio ever an acquisition target (player-sale ending)? Prior law: no mandatory failure; optional player terminal ending OPEN. (F20, F43)
4. Which of the target's HIDDEN finance facts (contract §6.4) become disclosable to a bidder, and at which transaction phase? (F26)
5. Is "debt" ever introduced (P11-REQ-041)? Without it, "assumption purchase" can only assume typed obligations. (F22)
6. What entitlement class does an acquirer inherit from the target's `InventionProvenance` ("inherited entitlement" is an explicitly later case)? (F33)
7. Does the ≥3-active-AI-rival floor become an acquisition eligibility predicate, or does P16 depend on a P15B replacement-entrant slice? (F45)
8. P14D placement (buyout/compensation/contract break): does contract *assignment* at acquisition count as P14D scope or as an ordinary P12 employer transition under "sale/assignment"? (F31, F32)
9. Numbering authority: does the Owner ratify the accepted engineering P16/P17/P18 allocation, resolving the catalogue's "No P18 exists" statement? (F40)
10. For a migrated save, may P16 record "creator = owner as of migration week" as a baseline, or must ownership begin as "not recorded"? (F27, §4.7)

---

## 6. Source table

| # | Source | Class | Exact locator | Verification |
|---|---|---|---|---|
| S1 | `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` | APPROVED DOCUMENTATION (Owner-approved 2026-08-31, §26) | §4.1 L147; §5.3 L165–167; §5.4 L171; §6.3 L212–215; §8 L259–263; §9 L267–281; §10.1 L289–302; §12.2 L397–413; §13.3 L459–470; §14 L493–496; §18 L620–623; §19.3 L676–680; §20 L689–725; §22 L757–759; §23 L772–773; §24 L791–795, §24.1 L819; §25 L849; §26 L879–887 | commit 4734e409 (docs branch) |
| S2 | `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md` | Durable Owner ruling (APPROVED 2026-08-31; amended 2026-09-10/11) | §2.2 L60–69; §2.4.1 L91–104; §2.4.3 L127–135; §3.2 L193–196; §4.1 L213–225; §4.2 L232–234; §4.3 L238–241; §5 L247–263; §6 L269–279; §8 L304–306 | SHA-256 matches `git show 4734e409:<path>` |
| S3 | `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` | Decision-ready research candidate | §1.2 L42; §2 L92–102; §3.2 L123–137; §3.3.1 L155–163; §5.3 L227–233; §5.5 L244–262; §5.7 L273–280; §6 L286–300; §9 L349–369; §11 L389–404; §12.3 L460–495; §13.1 L510–529; §13.2 L531–539; §13.3 L541–546; §15.4 L590–596; §16 L606–627; §17 L631–655; §18.2 L677–681; §19 L699–731; §22 L767–779; §23 L794–807; §25 L837–861; §26 L883–884; §29 L984–1005 | commit 4734e409 |
| S4 | `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` | Decision-ready research candidate | §A L25–45; §B L57–69; §C.3 L110–129; §C.4 L131–144; §D.5 L255–316; §D.6 L318–336; §J L705–718; §M.5 L942–948; hostile Q11–Q15 L1092–1096 | commit 4734e409 |
| S5 | `p12-accepted/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md` | ACCEPTED (P12 R05 Owner closeout) | L3, L7, L11–16, L18, L22–28 | SHA-256 matches `git show 13370d42…:<path>` |
| S6 | `p12-accepted/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` | ACCEPTED engineering contract (Revision 02) | §2 L15–24; §6.1 L131–147; §6.2 L157–176; §6.4 L184–197; §7 L199–216; §8 L218–243; §8.1 L246–266; §9 L268–278; §11 L294–305; §14 L332–346; §15 L348–405; §16 L407–419; §19 L445–449 | SHA-256 matches `git show 13370d42…:<path>` |
| S7 | `p12-accepted/docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` | ACCEPTED requirement register | rows SIM-009 L110; HIS-013 L168; HIS-014 L169; INT-010 L199; INT-011 L200; INT-012 L201; INT-013 L202; SAF-009 L235; L278 | commit 13370d42 |
| S8 | `p12-accepted/docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md` | Owner decisions (R05, 2026-09-10) | §1 L11, L28–39; §2 L43–53 (L49 "No unapproved loans or debt system"); §3 L65–76; §6 L118 | commit 13370d42 |
| S9 | `p12-accepted/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` | Owner rulings 2026-08-18 (current authority) | §1 L18–29; §3 L56–65; §4 L67–80 | commit 13370d42 |
| S10 | `p12-accepted/docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` | Accepted scout (findings accepted 2026-08-18) | §3 L199–228 (L210–213); §5 L266–280; §6 L284–311 (item 3 L303–305) | commit 13370d42 |
| S11 | `pkg-docs/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` | Accepted P12 design (a0739055) | §1 L34–66; §10 L296–304; §17 L464–504; §22 L663–670; §30 L865–887; §31 L889–905; §32 L907–929; §33 L933–955; §37 L1081–1096; §38 L1141–1193 | export at a0739055 |
| S12 | `pkg-docs/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md` | Accepted P12 annex | §C L135–157; §E L243; §J L440–452; §N L618–636; §O.15–16 L696–702; §R L906–921; §T L961–972 | export at a0739055 |
| S13 | `pkg-docs/docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` | Accepted P11 design (d6c38546) | §32 L1267–1287; §33 L1297–1305; Owner decisions L1464–1475 | export at d6c38546 |
| S14 | `p12-accepted/docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md` | ACCEPTED | P11-REQ-023 L122; P11-REQ-038 L137; P11-REQ-041 L140; P11-REQ-042 L141; L190–191 | commit 13370d42 |
| S15 | `p12-accepted/docs/engineering/P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md` | ACCEPTED | §3 L134 | commit 13370d42 |
| S16 | `p12-accepted/docs/operations/PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md`; `PROJECT-STUDIO-FUTURE-PACKAGE-DEPENDENCY-MAP.md`; `PROJECT-STUDIO-FUTURE-IMPLEMENTATION-SEQUENCE.md` | Advisory operations docs (Rev 03) | Board §"P16–P18" L102–104; Map §9 L110–120; Sequence §8 L130 | commit 13370d42 |
| S17 | `p12-accepted/docs/engineering/P10-FUTURE-CONSUMER-CONTRACT.md`; `P12A-PRE-READINESS-AND-DEPENDENCY-GATE.md`; `P08-TO-P09-AUTHORITY-HANDOFF-CONTRACT.md`; `P09-TO-P10-AUTHORITY-HANDOFF-CONTRACT.md` | ACCEPTED | P10 §"P16/P17/P18" L62–65; Pre-readiness L49; P08→P09 L82; P09→P10 L71 | commit 13370d42 |
| S18 | `p13-docs/docs/design/CODEX-TALENT-MARKET-RELATIONSHIPS-CAREER-LIFECYCLE-PACKAGE-14.md` | Research candidate | L68–72; L266; L649–661; L683–705; L873 | commit 4734e409 |
| S19 | `p13-docs/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md` (+ annex) | Research candidate (amended 2026-09-10 Owner direction) | §16a.2 L844–857; §16a.4 L869–878; L822–826; L1145–1150; annex L1009 | commit 4734e409 |
| S20 | `p13-docs/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md` | Current Ops catalogue (implementation recommendation) | CAT-050 L317; CAT-051 L318; CAT-052 L319; CAT-056 L323; OWN-9 L719; LATER-1 L770 | commit 4734e409 |
| S21 | `pkg-docs/docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md` | Accepted P10 design | row L105 (sale to rival) | export at 6a5d41ec |
| S22 | `p12-accepted/docs/c2-planning/00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md` | Historical Owner ruling (r3 non-goals) | item 13 L80–84 | commit 13370d42 |
| S23 | `p12-accepted/src/core/hollywoodTypes.ts` | CURRENT/ACCEPTED CODE | L6–17 (`StudioIdentity`); L20–46 (`IndustryFilm`); L79–95 (`RivalBusiness`); L96–103 (`IndustryReceipt`); L105–124 (`HollywoodState`) | commit 13370d42 (src == 592e926b) |
| S24 | `p12-accepted/src/core/hollywood.ts`; `calendar.ts`; `hollywoodValidation.ts` | CURRENT/ACCEPTED CODE | hollywood.ts L98–104, L111–137; calendar.ts L3; hollywoodValidation.ts L86, L213, L228–229 | commit 13370d42 |
| S25 | `p12-accepted/src/core/screenplay.ts`; `types.ts` | CURRENT/ACCEPTED CODE | screenplay.ts L305–345; types.ts L241–264 | commit 13370d42 |
| S26 | GameSpot E3 2002 First Look (`https://www.gamespot.com/articles/e3-2002-first-look-the-movies/1100-2866856/`) | Pre-release professional report (cited by S3/S11) | — | **FAILED** direct fetch (HTTP 403) and archive fetch (host blocked); existence confirmed by WebSearch; wording not re-verified here |

---

*End of dossier. No repository file was created, edited, checked out, branched, built, tested or run. The only file written is this dossier.*
