# Project: Studio — Takeover and Shared Challenges Concept 01

> EXPLORATORY FUTURE PRODUCT RESEARCH
> OWNER INTEREST CONFIRMED — MECHANICS NOT YET APPROVED
> NOT SCHEDULED
> NOT AUTHORIZED FOR IMPLEMENTATION
> SUBJECT TO CURRENT OPS REVIEW AND FUTURE ACCEPTED-BASE REFRESH

**Concept code:** SCN
**Current-ops verdict:** genuinely new mode family; Sandbox-adjacent, but absent from the accepted schema and intentionally distinct from the main open-ended timeline.
**Working question:** Can a stable, provenance-honest starting package create replayable studio stories without missions invading the main game, fake history, or a universal leaderboard score?

## 1. Player fantasy and journey

Three related fantasies must remain three explicit modes:

1. **Authored takeover:** inherit a deliberately troubled or unusual studio. The premise says what is authored, what assets/liabilities/rule changes exist, what success or failure means, and how recovery is possible.
2. **Shared starting challenge:** several players begin from the same immutable ex-ante package and compare the different studios they build—not necessarily the same later luck.
3. **Actual-save handoff:** receive a real player’s studio as a copy, with genuine recorded history and explicit provenance, then continue a fork without altering the source.

The journey begins with a situation preview, not a surprise trap. Its first layer shows the predicament, mandatory goal, failure/continuation rule, major rule deltas, and recovery paths. An expandable status layer carries provenance, exact compatibility, consequential gameplay-assistance/delegation/mod configuration, migration, and other technical facts. During play, ordinary systems remain the game. The challenge adds a framing question and visible progress; it does not replace filmmaking and studio management with a checklist. At the end, the player sees independently intelligible outcomes—objective state, weeks elapsed, films actually made, finances, careers, and recovery path—rather than one synthetic score.

## 2. Existing Project: Studio plan

### Already present or substantially directed

- The Blueprint describes an open-ended single timeline and a distinct Sandbox. It does not authorize scenarios, missions, scenario progression in the main timeline, or shared starts.
- The Comparative Design Register says challenge/editor work should follow stable systems and schemas. That is a dependency warning, not a feature commitment.
- **PROVISIONAL / UNSEALED DIRECTION:** P08 supplies sparse factual history and forbids fake backfill.
- **OWNER-ACCEPTED PRODUCT DIRECTION, DOCUMENTATION ONLY:** P12 supplies rival/studio identity and conserved rival projects. It is an added dependency only when a challenge contains persistent rival, registry, or rival-project facts; it does not own engine-wide save/RNG/comparison law.
- **CURRENT CODE FACT:** accepted V16 saves are deterministic, versioned, identity-validated, and reject unknown versions. The conclusion that a seed alone is insufficient is an SCN inference supported by the technical sources in §13.

### Genuinely new

- An authored situation manifest and immutable starting snapshot.
- Challenge revision, compatibility and comparison receipts.
- Explicit provenance classes for starting history.
- Safe copy-on-import handoff and profile/reward isolation.

No current root owns these concepts. This report does not choose a root, file format, serialization, network service, or schema version.

### Mode boundary

The main timeline remains open-ended. A challenge is opt-in and visibly framed. Sandbox remains a free experimentation mode, not automatically a scored challenge. A takeover’s goals do not become mandatory campaign missions. A received actual save does not become proof of a “fair” common start.

## 3. Real-world and technical-practice findings

This feature’s highest-stakes real-world practices are provenance, reproducibility, and untrusted-file handling rather than film practice.

Deterministic simulation does not mean a seed alone reproduces a run. Factorio’s developers describe sharing starting conditions through map settings/exchange data and note that replays depend on the same version and mods. Their save/load writing also discusses deterministic state, migrations, mods, and corruption. A credible Project: Studio comparison package therefore needs the actual snapshot plus simulation/content/save versions, rule configuration, mod state, assists/delegation, and the random-stream contract—not just `seed = 42`.

Counter-based random-number research shows a possible way to create named independent streams, reducing incidental coupling when unrelated systems consume randomness. That is a technical option for future architecture review, not a selected algorithm or an implementation requirement.

An imported save is untrusted structured input. OWASP recommends allowlisting extensions/types, checking signatures in conjunction with type validation rather than trusting a declared MIME/type, generating safe server-side names, limiting upload and decompressed size, preventing path traversal and overwrite, isolating storage, and using least privilege. A handoff design also has product-privacy risks: player/profile names, machine paths, mods, notes, timestamps, or hidden progression must not leak accidentally. Local-first, curated snapshots avoid most of this before the experience is proven.

### Provenance vocabulary

Every starting fact belongs to one of four visible classes:

- **Authored premise:** deliberately established for this challenge; not claimed as simulated history.
- **Simulated prehistory:** genuinely generated by a declared compatible simulation process, with its provenance retained.
- **Imported actual history:** recorded facts from an actual source save/run, copied with explicit handoff consent.
- **Unknown / unrecorded:** no reliable record exists; nothing is backfilled for polish.

## 4. Shipped comparator findings

RollerCoaster Tycoon’s official manual presents scenarios as inherited parks with a situation preview, objective, completion/failure record, and the option to continue. It demonstrates that authored problems can frame an open management simulation without requiring every later action to be scripted.

Civilization VI’s official Monthly Challenge announcements show useful variation inside one feature: *Age of Abundance* fixes a map and unusually generous start; *Three Stars Each* keeps randomized map/other civilizations; *Ides of March* authors a crisis. The posts disclose leaders, starts, rules, victory/turn terms, difficulty, and rewards. This supports an explicit challenge sheet and multiple fairness classes, not a claim that monthly live content is appropriate here.

Anno 1800’s *Eden Burning* is a shipped authored crisis with a changed starting world, rule deltas, a visible recovery condition, tradeoffs, retry carryover, and a conclusion screen. Subsequent updates changed balance, summary behavior, and reward eligibility—including preventing rewards obtained through another player’s save. That is evidence that version/reward/import policy becomes product law and cannot be an afterthought.

Useful comparator pattern:

- preview the inherited state and rule deltas;
- state a concrete objective and deadline/failure condition;
- let systemic play solve the problem in many ways;
- preserve a completion/failure receipt and say whether continued play counts;
- version the content and separate eligibility from merely being able to load/continue.

Rejected pattern: a global scalar leaderboard. The Project: Studio design already rejects a universal quality score; collapsing a multidecade studio into one challenge number would recreate it at a higher level and encourage a solved exploit meta.

## 5. Recommended design model

### Three example briefs and their gates

| Brief | Starting predicament and interesting choice | Goals and recovery | Authority classification |
|---|---|---|---|
| **Legacy Overhang** | An established studio inherits expensive physical capacity and accepted authored liabilities/committed obligations whose scale no longer fits current demand. Protect the old operating model, sell/reconfigure only where owning systems permit, or accept a smaller slate while cash pressure continues. | Mandatory: restore an explicit predicate over authoritative cash and accepted obligation facts by a deadline. Optional: retain selected people/capacity and complete one viable film. Recovery comes from ordinary scheduling, production, staffing, facility and finance choices. | **Future-system scenario.** It must wait for accepted P09/P10/P11 authority. It may use debt only after separate debt authority exists. “Legacy” does not mean valuable Film Library revenue; library/rights economics cannot appear before P16 owns them. |
| **One Stage, A Point of View** | A small studio has one Stage, tight cash, a compact roster, and no established identity. Choose a sustainable cadence and creative promise while contention makes every commitment visible. | Mandatory: satisfy a declared predicate over authoritative cash/obligation facts and release a declared number of genuine productions in the window. Objective failure changes no base affordability rule, mints no penalty, and creates no generic bankruptcy. Optional: make the released slate share a declared, visible `Promise` dimension. Recovery includes reducing scope, changing schedule, or releasing a different viable slate. | **Closest to a universal core-law proof**, but only after the exact production/cash/creative contracts it consumes are accepted and refreshed. It needs no CRE tendency layer, library, franchise, location, delegation, or rival state. |
| **The Handoff Cut** | A friend’s completed checkpoint is copied at an explicit boundary. Continue the genuine studio along a different path while preserving what was actually recorded and leaving unknown past unknown. | No false “same start” ranking is required. Optional goals may be declared by the sender/recipient, while the result emphasizes divergent films, finances and careers. Recovery is normal continued play. | **Actual-save handoff; deferred.** Requires compatibility, privacy, security, migration, consent, profile/reward isolation and origin policy. It cannot be inferred from the authored-snapshot prototype. |

These are concept briefs, not scenario files or implementation content. The first prototype should use only one bounded first-party authored situation, most plausibly the single-Stage brief after its consumed laws are stable.

### A. Authored takeover

An immutable package contains a challenge ID/revision, authored premise label, starting snapshot hash, projected assets/liabilities, rule deltas, goal and optional milestones, failure condition, recovery routes, continue-after-failure policy, compatibility tuple, and provenance map. The challenge sheet is a read-only projection of the validated snapshot, never a second editable balance sheet. Authored setup can say “this studio begins with accepted liabilities or committed obligations and an unfinished production”; it must not fabricate a ledger claiming the player’s predecessor actually performed events that were never simulated.

Validation rejects cash/ledger mismatch, duplicate reservation keys, invalid resource references, inconsistent participant/reservation/obligation state, and an already-paid operation scheduled to pay again. An inherited unfinished production must be internally valid under owning systems. Goals, progress, and result facts query authoritative live state. The compatibility tuple pins the effective economy/rules version as well as simulation/content/save identity.

### B. Shared starting challenge

Entrants in a comparable cohort receive the same ex-ante package. “Fair” means the same starting snapshot, disclosed rules and stream contract, not identical later events regardless of choices. The result receipt independently reports objective state, elapsed weeks, applicable resource/cash facts, genuine films/careers/history, and neutral facets such as starting-package revision/migration, retry history, simulation-changing assistance, consequential mods, delegation policy, and continuation after failure.

Accessibility and presentation settings that do not change simulation are not disqualifiers and are not grouped with gameplay-changing assistance. Final facet names are unapproved. A consequential divergence changes cohort eligibility monotonically, with a reasoned transition receipt before its first affected command; a run never silently changes back. Comparison is descriptive, has no default winner sorting or highlighted “best” metric, and remains useful for non-matching runs without casting them as lesser.

### C. Actual-save handoff

Import creates a new run from a validated copy. The source remains unchanged. The fork receives a new local run identity and retains an origin reference only with explicit consent. Profile progression, rewards, achievements, cloud slots, and current-owner identity are isolated. The receiver sees what is actual recorded history, unknown, modded, or migrated.

Handoff is not part of the first prototype. When considered later, it requires a threat model, privacy inventory, canonical format/size limits, manifest/hash/signature rules, migration policy, conflict-safe import names, quarantine/validation, and explicit deletion/retention behavior.

### Completion without a score

A challenge may have a binary or semantically tiered authored objective, but the post-run view presents the actual path. A declared cash threshold, deadline, and production count can be evaluated as separate facts. They are not converted into `83/100`, a medal ladder, or a default ranking. Optional tiers require distinct authored meanings and must not become a disguised sum.

Terminal evaluation has idempotent identity derived from the run, challenge revision, and terminal transition. Re-evaluation after load returns the same immutable result receipt. Retry creates a new run identity and preserves the prior result. If achievements or rewards are ever approved, they may consume an eligible receipt at most once through their own authority.

## 6. Alternatives considered

| Alternative | Advantage | Why it is not the lead recommendation |
|---|---|---|
| Seed-only challenge code | Tiny and shareable | Not enough for reproducibility across versions, configuration, mods, stream consumption, or snapshot state |
| Arbitrary save sharing first | Immediate user creativity | Highest compatibility, security, privacy, provenance, and reward-integrity risk |
| Main-timeline missions | Strong onboarding | Contradicts open-ended timeline and risks prescriptive progression |
| Global score/leaderboard | Simple comparison | Collapses plural outcomes, invites exploits, duplicates forbidden quality logic |
| Fully simulated prehistory for every takeover | Coherent ledger | Expensive and fragile; authored premises can be honest without counterfeit simulation |
| Scenario editor at launch | High content leverage | Editor contracts freeze unstable systems and expand validation/moderation/support scope |
| Online live-service rotation | Recurring engagement | Adds account, service, moderation, availability, and preservation obligations before core value is proven |

## 7. Meaningful choices and failures

The starting state should produce a small set of strategic tensions, not a prescribed solution: sell versus recover a liability, protect cash versus retain people, finish an inherited film versus cut losses, pursue a deadline versus rebuild capability, or accept short-term reputation/career consequences for long-term stability. Goals describe the problem and permissible endpoints, not the required click path.

Legitimate failures:

- miss the authored deadline or minimum state;
- exhaust a declared recoverable resource under normal game law;
- move into a different disclosed comparison cohort through a gameplay-changing assist, retry, mod, migration, or continuation;
- import a package that fails validation or compatibility checks;
- complete the objective but choose to continue, with status clearly separated.

Failure may still produce a valuable studio story. If continued play is allowed, the UI records `failed objective; continued` rather than erasing or relabeling the outcome. Retry begins from the immutable source snapshot; it does not quietly retain advantages unless the challenge explicitly declares carryover and classifies the run.

## 8. Anti-tedium and accessibility

- One readable challenge sheet; no hidden modifiers.
- Consume the existing shared attention-aggregation authority: one causal event produces one cross-feature decision packet and at most one blocking prompt.
- Use progressive disclosure: predicament and play rules first; provenance and compatibility diagnostics remain one action away.
- Persistent objective progress from existing facts; no manual reporting chores.
- Milestones aggregate; ordinary system notifications remain configurable.
- Failure and eligibility changes warn at the decision point when predictable.
- Pause/inspect before start, retry, import, overwrite-like naming, and continuation decisions.
- Text labels accompany icons and colors; deadlines include calendar and remaining-time forms.
- Support keyboard/controller navigation, scalable text, screen-reader-friendly grouping, reduced motion, and no reaction-time requirements.
- Allow learning play and gameplay-changing assists, but describe their exact configuration without shaming or disabling the experience. Non-simulation accessibility settings are not comparison disadvantages.
- Do not require online accounts for the first proof or basic authored takeovers.
- Archive the challenge sheet with a run so later version changes do not erase what the player agreed to.

## 9. Authority, compatibility, privacy, and data boundaries

- Challenge content may set an authored starting snapshot and explicit rule deltas only through a future validated authority surface. It may not execute arbitrary code or bypass legal commands.
- Compatibility should include challenge/revision, snapshot hash, simulation/content/save and effective economy versions, rules/difficulty/config, simulation-changing assists/delegation, consequential mods, RNG algorithm/stream schema/counters, and migration status. Exact serialization remains open.
- P08’s ledger stays factual. Premise metadata is visibly separate from studio events.
- Accepted core/save determinism governs comparable runs. P12 product direction is an additional dependency only when a scenario includes persistent rivals, studio-registry facts, or conserved rival projects. Same seed alone is never an equality claim.
- The allowed configuration pins delegation policy, CRE constraints, LOC conditions, and every rule/stream that can affect time, cash, resources, goals, or outcomes. Anything outside that identity makes the run non-comparable from the outset.
- Comparison eligibility changes monotonically before the first affected command and emits a reasoned receipt; load cannot erase it.
- Import is copy-on-write from the player’s perspective. Never mutate or consume the source save.
- Strip or explicitly consent to origin names, profile IDs, device paths, cloud IDs, free text, screenshots, mods, and other identifying metadata.
- Profile achievements/rewards never transfer merely because a source save contains them.
- File names, paths, type claims, archive entries, sizes, decompressed sizes, hashes, schema, and semantic invariants require validation before state enters an active slot.
- Online discovery, accounts, moderation, telemetry, leaderboards, and cloud retention are independent approvals.

## 10. Prototype, fuller vision, and deferred scope

### Smallest decision prototype

**SCN-A: authored takeover.** One local, first-party authored takeover has one immutable validated starting snapshot; an explicitly authored premise; a compact read-only assets/liabilities/rules/objective/failure/recovery projection; a pinned compatibility stamp including economy rules; visible progress from existing facts; one idempotent local result receipt; retry as a new run from source; and continue-after-failure with separate status. No account, network, arbitrary file import, achievement, reward, editor, or scalar score.

The proof question is whether the frame creates a distinctive studio story while normal systems remain the means of play.

### Fuller vision if proven

Several curated takeover archetypes; then **SCN-B: offline shared-start comparison**, with shareable immutable start manifests, neutral configuration facets, run-summary comparison across independent facts, and a version archive. Actual-save handoff requires its own later proof and cannot inherit SCN-A/B validation. A user-facing editor or online service is a separate product decision, not an automatic sequel.

### Explicitly deferred

Actual-save import/export, legacy-save conversion, online accounts, cloud sharing, workshop/browser, discovery/recommendations, social graph, comments, moderation, reporting, live rotation, global leaderboard, anti-cheat, server authority, rewards, profile achievements, editor/scripting, arbitrary mods, cryptographic publisher trust, retention policy, and cross-platform portability.

## 11. Owner decisions

1. Is the first proof solely one authored offline takeover?
2. May players continue after failure, with that state shown as a separate neutral comparison facet?
3. Which outcomes deserve independent comparison, if any, without becoming a score?
4. Should retry always restart the immutable source, or may a challenge explicitly authorize disclosed carryover?
5. Is actual-save handoff a later core aspiration or merely a research branch that may be stopped?
6. Must challenge runs be wholly isolated from profile progression until a later reward policy is approved?
7. Does SCN continue, hold, or stop after Current Ops refresh?

Approval answers discovery questions only. It does not approve mechanics, content cadence, schema, networking, rewards, implementation, or schedule.

## 12. Proof plan and falsification

Use a paper or read-only fixture prototype after separate authorization. Give players the same authored starting state and ask them to plan and narrate their recovery. Compare its attention cost with the current unframed/manual flow. Test:

- Can they distinguish authored premise from simulated history?
- Can they explain the objective, failure, recovery, and continue policy before starting?
- Do different viable strategies emerge from normal systems?
- Is the result view meaningful without a score?
- Do neutral configuration/retry/migration/continuation facets communicate comparability without punishment or an implicit ladder?
- Does retry reliably restore the exact source state?
- Across repeated/no-event/duplicate-event cases, record setup time, repeated inputs, blocking prompts, dismissals, backtracking, missed material state changes, and retained understanding.

Falsify or redesign if the challenge is solved by one obvious opening, feels like unrelated missions, requires fabricated backstory to be legible, makes players optimize a surrogate number, or cannot survive a routine compatible-version change without ambiguity. Do not proceed to save handoff merely because authored takeover tests well; handoff needs its own privacy/security proof.

No game launch, load-test, network service, migration, editor, or production implementation is authorized by this proof plan.

## 13. Sources and confidence

All web sources accessed 2026-09-05. Source facts support patterns and risks; design translations are recommendations.

| Source | Date / locator | Retained finding | Limitation | Confidence |
|---|---|---|---|---|
| [*RollerCoaster Tycoon* official manual](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/285310/manuals/rollercoaster_tycoon.pdf?t=1733161367), Chris Sawyer/Atari | ©1999; revision header 13 Aug 2003; printed pp. 8, 14, 78 (PDF pages 4, 7, 39) | Tutorial/scenario flow previews inherited park and objective, records completion/failure, and allows continued play | Manual for a different management game; no sharing/security evidence | High |
| [Civilization VI Monthly Challenges official announcements](https://store.steampowered.com/news/posts/?appids=289070&enddate=1718732294&feed=steam_community_announcements), Firaxis/2K | 14 Nov 2023–9 Apr 2024; *Age of Abundance*, *Three Stars Each*, *Ides of March* posts | Shipped challenges disclose starts, map randomization/fixity, rule changes, goals, turns/difficulty, and rewards | Marketing/announcement posts; existence is not evidence of player fit or a recommended live cadence | High for shipped facts; medium for translation |
| [Anno Union, “Eden Burning” scenario devblog](https://www.anno-union.com/devblog-eden-burning-green-game-jam/), Ubisoft Mainz | 6 Dec 2021; premise, pollution, tracker, strategies, retry/conclusion sections | Authored altered state, visible recovery, tradeoffs, and retry behavior can frame systemic management | Developer account of one scenario; not causal fun evidence | High |
| [Anno 1800 Game Update 13 release](https://www.anno-union.com/its-game-update-13-release-day/), Ubisoft Mainz | page dated 13 Dec 2021; release section says shipped, while the prior devblog scheduled 14 Dec at 18:00 CET | Confirms the scenario moved from announced intent to release; preserves the official-source date discrepancy | Release article is not a design evaluation | High |
| [Anno 1800 Game Update 14](https://www.anno-union.com/updates/anno-1800-game-update-14/), Ubisoft Mainz | 8 Apr 2022; scenario balance, summary, reward/save fixes | Version changes affected balance, result presentation, and reward eligibility through another save | Patch-specific; later updates may further change behavior | High |
| [Factorio Friday Facts #37](https://www.factorio.com/blog/post/fff-37), Wube Software | 6 Jun 2014; replay/map exchange discussion | Shared start/replay needs map settings and compatible version/mod context, not just a seed | Early development article; Factorio architecture differs | Medium–high |
| [Factorio Friday Facts #270](https://www.factorio.com/blog/post/fff-270), Wube Software | 23 Nov 2018; save/load, deterministic state, migration/mod/corruption discussion | Deterministic simulation still needs explicit save and migration discipline | Developer blog, not a formal interoperability standard | High for Factorio facts; medium for translation |
| [Salmon et al., “Parallel Random Numbers: As Easy as 1, 2, 3”](https://www.thesalmons.org/john/random123/papers/random123sc11.pdf) | SC11, 2011; counter-based RNG design | Independent addressable random streams are technically possible | Research result does not select an engine design or ensure cross-version semantics | High technically; low as a product decision |
| [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | n.d. living guidance; extension/type/signature, filename, size/storage and archive guidance | Untrusted files need layered validation, safe naming, upload/decompression-size controls, isolated storage, and least privilege | General web-security guidance; a future desktop/cloud design needs its own threat model | High |
| [Transport Fever 2 Wiki, game file locations](https://wiki.transportfever2.com/doku.php?id=gamemanual:gamefilelocations), Urban Games community wiki | last modified 4 Jan 2025; saves/settings/mods/logs/scenarios sections | A shipped transport-management ecosystem separates saves, profile/settings, mods, logs, and scenarios | Official-hosted community documentation; taxonomy only | Medium |

Internal evidence: accepted base `2753e18ba8fb5f65b936c22cde9531646fecc6cd`; Blueprint blob `f00df1ade22bb8eb14b6595f70645f92dfa89aea`; Comparative Register SHA-256 `ccf81934949746d02f8696c51cd00d138c78220d1ca81731d650eceae03be346`; P08 `438708c5071097d8e1ddb2f97a3f7b6674b2a65e`; P12 planning `a0739055c30f80fcf756340d0e0e962865aec6a4`; P12 correction `e10c0a091460168357ebcaa12897196dd9288485`; accepted protocol/projection/save `4 / 15 / V16` and schema digest `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`.

**Overall confidence:** high that the three modes must remain distinct and that seed-only/fake-history/arbitrary-import designs are unsafe; medium–high in an authored offline snapshot as the first proof; low and intentionally open on comparison policy, content cadence, migration longevity, save handoff, networking, rewards, and moderation.
