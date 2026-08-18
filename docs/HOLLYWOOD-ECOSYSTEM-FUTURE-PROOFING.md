# HOLLYWOOD ECOSYSTEM — FUTURE-PROOFING SCOUT

> **STATUS: findings accepted by the Owner, 2026-08-18.** The decisions this report asked for in §6
> are now ruled in `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md`. This document is retained unchanged as
> the durable research/governance artifact behind those rulings; read the rulings for current
> authority and this report for the evidence.
>
> Read-only architecture scout, 2026-08-18. Baseline: canonical `main` @ `f294077` (C1 seal),
> save **V13**. Nothing implemented; no roadmap altered; PF1 and C2 worktrees never touched.
> Evidence from a read-only export of `main` plus the Mechanics Bible corpus. Findings were produced
> by parallel lane scouts and then adversarially refuted against one rule: **recommend a seam only
> if failing to account for it is expensively irreversible AND accommodating it now is nearly free.**
> Most proposed seams did not survive that test — which is the result we wanted.
>
> **Citation validity.** Re-verified at `main` @ `1e6b422`: the three commits between `f294077` and
> `1e6b422` are docs-only (`git diff f294077..1e6b422 -- src/ ui/ tests/` is empty), so every
> `file:line` citation below still resolves correctly at live main, and the live save format is
> still **SaveFileV13**.
>
> **Citation re-validation at `main` @ `2b75e3d`** (pre-C2 governance reconciliation, 2026-08-18).
> PF1 has since landed, so the blanket claim above no longer covers `ui/`. Split verdict:
> - **All `src/core/*` and `tests/*` citations still hold exactly.** `git diff --name-only 1e6b422 2b75e3d -- src/ tests/`
>   is empty — PF1 changed no engine or test file — and the anchors were spot-checked live
>   (`INITIAL_PROPERTY` at `lot.ts:272`, `save.ts:5083`, `save.ts:4151`). Save format is still **SaveFileV13**.
> - **The four `ui/` citations must be re-resolved.** PF1 rewrote this layer. `ui/src/engine/session.ts:35-43`
>   still lands on `saveActiveSession`; `ui/src/engine/adapter.ts:2349` and `:5289` still land in the right
>   regions; **`ui/src/App.tsx:1240` has drifted** — the autosave call site is now `App.tsx:1371`.
>
> This block is additive. Nothing in the report below has been edited: it is retained as the artifact
> that produced the rulings, drift and all.

---

## 1. EXECUTIVE VERDICT

**For the Hollywood ecosystem, we are already safe. No one-way door stands between today's
architecture and rival studios, multi-studio awards, film libraries, dynasties, or acquisitions.**
That is not luck — it is four properties the codebase already has:

1. **Every per-studio fact is a ROOT COLLECTION on `GameState`, never a field on a shared entity**
   (`contracts`, `ledger`, `founding`, `theatricalRuns`, `careerEvents`, `operations`, `placement`,
   `property`, …). D-11 made this explicit — "Talent stays the shared *industry* population"
   (`src/core/types.ts:318-322`) — and `employmentStatus()` derives everything, falling through to
   `'unavailable'` (`src/core/employment.ts:312-322`), the exact slot "contracted to a rival" takes.
2. **There is nothing to backfill.** The studio has *no id and no name* today
   (`src/core/types.ts:291`; "no per-studio name exists in D1", `ui/src/engine/adapter.ts:5289`).
   With one studio the owner of every historical record is knowable by construction — so a future
   owner discriminator is *derived*, never invented.
3. **RNG is already multi-actor safe.** Streams are derived and stateless —
   `stream(seed, purpose, key)` (`src/core/rng.ts:189-191`) — with versioned purposes. Only ~2,600
   draws touch the persisted stream over 120 years. Rivals can be added without perturbing any
   existing stream or invalidating any save. This kills the scariest candidate door.
4. **Nothing is ever pruned.** No truncation of `releasedFilms`, `ledger`, `careerEvents`,
   `theatricalRuns` or `broadcastItems` anywhere. Libraries, Hall of Fame, dynasties and awards
   history are structurally safe *today*.

Thirteen additive save versions with frozen aliases (`src/core/save.ts:4638-5086`) prove the
migration path. **That discipline is itself the future-proofing mechanism** — which is why almost
everything on the Owner's list can wait.

**Three genuine one-way doors exist; none is about rivals.** (a) The production-id format, an RNG
key and therefore unrenameable. (b) `INITIAL_PROPERTY`, which does three incompatible jobs and which
the Founding Flip is precisely the moment to break. (c) Closed *leaf* shapes frozen into the V2–V13
validator chain, where the additive-root discipline does **not** protect us.

**Separately, the 1920→2040 law is NOT met today — for content and performance reasons, not
architectural ones.** A managed campaign can greenlight **at most 30 films, ever** (≈5–8 in-game
years), and the weekly tick degrades quadratically well before 2040. See §2.4, §2.7, §6.

---

## 2. KEEP FLEXIBLE NOW

Eight items survived adversarial refutation. **Exactly one is a DO NOW. The other seven cost zero
code** — they are invariants to write down, not work to schedule. Several proposals were rejected
outright for restating rules the codebase already enforces executably; those are not listed.

### 2.1 `INITIAL_PROPERTY` is history, not a template — **DO NOW (at C2 entry)**
- **Current assumption.** One frozen constant (`src/core/lot.ts:272-301`) does three jobs at once:
  it seeds every fresh world (`src/core/worldgen.ts:682`), it is the value the V12→V13 migration
  synthesizes for *every migrated save* (`src/core/save.ts:5083`), and it is the frozen-builder
  equality target (`src/core/save.ts:4151`).
- **Future system.** The Founding Flip; later, any second studio's property.
- **Migration risk.** The Flip is exactly the moment someone edits this constant to make a bare
  starting lot. Editing it **silently changes what every existing V12 save reconstructs on load** —
  retroactively deleting founding buildings from saves already on disk. Irreversible and silent.
- **Cheapest safe seam.** Record one invariant, zero code: *`INITIAL_PROPERTY` is the V12→V13
  migration anchor and may never be edited. The Founding Flip ships its bare lot as a separate
  named constant beside it and switches `generateWorld`, not the anchor.*
- **Note.** A consequence nobody has written down: after the Flip a fresh world's property is by
  definition no longer byte-equal to `INITIAL_PROPERTY`, so the frozen-builder projection assertion
  needs C2's attention on its own terms.

### 2.2 The production id can never be re-minted — **C2 WATCH (zero code)**
- **Current assumption.** `prod-<week pad4>` plus a smallest-free `-k` suffix, allocated against
  the *player's* persisted id set (`src/core/actions.ts:161-167`, `src/core/productionIdentity.ts:8-38`).
- **Future system.** Rival films; acquisitions; any second id-minting identity.
- **Migration risk.** This id is the correlation key in `ledger.productionId`, `careerEvents.filmId`,
  the composite `TalentCareerEvent.eventId` (`${filmId}:${talentId}`, `src/core/types.ts:1231`),
  `theatricalRuns`, `broadcastItems.facts.filmId`, workflows, reservations, and script projects —
  **and it is an RNG stream key** (`forecast`, `develop`, `discovery-v1`). It cannot be reformatted
  without rewriting every history row in every save *and* changing every forecast draw.
- **What is NOT at risk.** The allocator is not blind: `persistedProductionIds(state)` walks the
  *whole* `GameState` — ledger, careerEvents, theatricalRuns, broadcastItems, workflows, script
  projects — none of which is studio-namespaced. A rival whose records land in those same roots
  already collides correctly, for free.
- **Cheapest safe seam.** Record two clauses: **(a) never retro-namespace existing ids** — the
  first studio keeps `prod-<week>` verbatim and a second identity takes a new prefix; **(b) any new
  root that carries a production id must be added to `persistedProductionIds`**, because a prefix
  convention alone does not protect the allocator.

### 2.3 Never widen a frozen LEAF shape — **C2 WATCH / C3 + C4 WATCH (zero code)**
- **Current assumption.** The additive-root discipline freezes *root keys*. It does **not** freeze
  leaf shapes, and several leaves are shared by every version back to V2 by reference.
- **Future system.** C3 awards/rank/prestige; C4 era variation and genre depth.
- **Migration risk.** Three verified traps: `EraConfig.censorship` is a closed `v8Enum`
  (`src/core/save.ts:1480-1484`) reached by every version V8–V13 by nested validation; `Standing` is
  exactly three keys (`src/core/types.ts:267-271`) reachable from `GameStateV2`, so a fourth channel
  retro-changes V1–V13 at once — and C3's rank/prestige work will want one; and `CulturalForce` /
  `SegmentId` cardinality is checked against **live module constants** (`src/core/save.ts:767-775`,
  `:1454-1459`), so **adding a force or a segment breaks every save file ever written** — which is
  squarely on C4's declared genre/taste path.
- **Cheapest safe seam.** One sentence: *era timelines, rank, prestige and award weight land on a
  NEW root (the V12→V13 `property` template) or as a derived read model. Frozen leaf shapes —
  `EraConfig`, `Standing`, `CulturalForce`, `SegmentId` — are never widened in place. C4 moves
  force and segment VALUES; it does not add members.*

### 2.4 Concept ids are permanent, and the pool must grow by APPEND — **C2 WATCH**
- **Current assumption.** `conceptCount: 30` at worldgen (`src/core/tuning.ts:880`); nothing ever
  appends to `state.concepts`; a concept is claimed permanently by any script project in any status
  including `produced` (`src/core/scriptReadModel.ts:471-474`).
- **Future system.** The 1920→2040 horizon; sequels/remakes/franchises; film libraries.
- **Migration risk.** Low as a *migration* — `concepts` is an existing validated root with no length
  assumption, ids `c-NN` extend cleanly. But `FilmResult.conceptId` is how a released film resolves
  its own title and genre, so a regenerated pool that **re-mints an existing id would silently
  rewrite the identity of already-released films**.
- **Cheapest safe seam.** Record: *a `FilmConcept.id` is a permanent identity. It may never be
  removed, reassigned, or re-minted. New concepts are appended with fresh ids.*

### 2.5 `state.talent` is a permanent census — **C2 WATCH (zero code)**
- **Current assumption.** Append-only; the validator cross-references every historical talent id
  against the live roster in nine places (e.g. `src/core/save.ts:1152, 1538`), so removal is already
  machine-blocked. Future system: multi-decade careers, retirement, churn, dynasties.
- **Migration risk.** Two things the validator does **not** catch: (a) `state.talent` *order and
  length* are load-bearing — `sampleIds` draws the freelancer, hiring and founding-applicant markets
  positionally (`src/core/employment.ts:254-263`); (b) `authoredTalentId` derives from a **count**,
  not a highwater mark (`src/core/actions.ts:242-246`), so if any milestone ever removes a person a
  live id is silently re-minted and **two careers merge irreversibly**.
- **Cheapest safe seam.** Record: *`state.talent` is the permanent industry census, not a live
  roster. Retirement, defection and death are STATES, never removal. If any milestone ever shrinks
  the census, `authoredTalentId` must first become a collide-against-taken-set allocator.*

### 2.6 The master invariant: per-studio facts stay in root collections — **C2 WATCH**
*Never write a studio-relative fact onto a shared-world entity (`Talent`, `FilmConcept`,
`MarketState`).* One violation already exists: `beginFounding` rewrites the world-level `concepts`
root via `correlateConceptCost` (`src/core/employment.ts:411-417`) — harmless with one studio, but
in a multi-studio world one studio's founding would re-price the shared script market for everyone.

### 2.7 The ledger is history — never prune it to buy performance — **C2 WATCH (zero code)**
- **Current assumption.** Two verified hot paths scale with total history. `assertStudioPlacementInvariants`
  runs every tick (`src/core/tick.ts:162`) and rebuilds `demolishedFacilityHistory` from the **whole
  ledger once per weekly opex row** (`src/core/placement.ts:1727` → `:1391`) — ~10⁸ iterations for a
  single week at week 6,240, and already ~0.1 s/tick by in-game year ~20. `allocateFixedCosts`
  recomputes the whole campaign on every recap render.
- **Future system.** Any campaign that actually runs to 2040.
- **Migration risk.** The *performance* fix is not a one-way door — hoisting a pure function out of
  a loop is behaviour-neutral and costs the same in 2029 as today, so by our own rule it does not
  earn a DO NOW. **The one-way door is the tempting wrong fix.** Whoever hits the slowdown will
  reach for pruning or windowing `state.ledger` — and the ledger is precisely what freezes historical
  costs against future era changes, and what makes operating-phase employment reconstructible.
  Pruning it destroys history irreversibly.
- **Cheapest safe seam.** One sentence: *`state.ledger` is history — never prune or window it for
  performance. The sanctioned fixes are hoisting `demolishedFacilityHistory` out of the opex loop and
  passing the `AllocationWindow` that `allocateFixedCosts` already accepts
  (`src/core/fixedCostAllocation.ts:213`).*

### 2.8 The autosave silently stops working in a long campaign — **C2 WATCH (UI-layer)**
The app autosaves the whole save JSON to **localStorage** every authoritative transition
(`ui/src/App.tsx:1240` → `ui/src/engine/session.ts:35-43`) and **swallows the quota failure in an
empty catch**. Estimated size at week 6,240 is 8–14 MB against a ~5 MB quota — so a long campaign
silently stops persisting and is lost on refresh: an effective storage game-over against the
no-hard-game-over law. Not architectural (one module; save presentation is already PF1's surface),
but it must be known before anyone measures a 120-year campaign. *(Recorded because one lane
asserted no autosave exists — that is wrong; verified at both call sites.)*

> §2.7 and §2.8 sit in `src/core` and `ui/`, which PF1 has frozen. Neither is today's work.

> **§2.8 partially superseded by PF1-M3** (noted at the pre-C2 governance reconciliation, 2026-08-18;
> the finding above is left verbatim). The **"swallows the quota failure in an empty catch"** half is
> **fixed**: `saveActiveSession` now returns a boolean documented as "non-fatal on failure — but NEVER
> SILENT," and the shell consumes it (`ui/src/App.tsx:1371`, `setPersistenceOk(...)`) to show the
> player a visible notice. The call site also moved from the cited `App.tsx:1240` to `1371`.
> **The half that still stands is the one that mattered:** the 8–14 MB-vs-~5 MB quota estimate is
> untouched, so a long campaign still stops persisting — it now fails loudly instead of silently.
> **C2 WATCH remains open on that basis.**

---

## 3. SAFE TO DEFER — zero work now

- **Rival studios as state.** A `rivals` root beside the existing ones, added when wanted. No
  existing record needs an owner field; containment already expresses ownership.
- **Rival simulation reuse.** `reception.ts` and `forecast.ts` reference `GameState` **zero times** —
  already pure `(inputs) => outputs`, able to score a non-player film unchanged. Keep it so.
- **Awards accepting multi-studio nominees.** Awards attach to a film id and a person id, both
  already stable and permanent. The declared-but-inert `BlueprintRequirement` kinds (`award`, `rank`,
  `certificate`, `src/core/types.ts:835-853`) are the house precedent and already suffice. Wait for C3.
- **Studio identity / name / emergent identity from history.** Additive whenever wanted — but as a
  new root, not a field on `Studio` (shared by reference with the frozen V1/V2 shapes).
- **Film library, IP lineage, sequels/remakes/franchises, reissues, licensing.** Films are permanent,
  never pruned, keyed by a stable id. Lineage edges and second revenue episodes are additive.
- **Acquisitions, subsidiaries/labels, co-productions.** Need only that historical records survive a
  change of owner — which they do, because no record names its owner.
- **Land ownership.** `LotParcel.ownedFromStart` is the literal `true`, validator-enforced
  (`src/core/save.ts:3594`), but read by **no business logic**. Widening it is the `Omit`-and-redeclare
  move already executed twice for `ledger`. C3's Land Acquisition handles it.
- **Era as global industry conditions.** `EraConfig` is *already* world-level — a sibling of `studio`,
  not a studio modifier. Historical money is frozen in the ledger, so a future era change cannot
  rewrite past films' costs. (A suspected history-rewrite at `studioRunRecap.ts:509` was investigated
  and **refuted** — that path is a prospective affordability quote.)
- **`competingSlate` / `competitionFactor`.** Declared, validated, persisted, read by no formula
  (ratified inert by rev4 N11). A fine placeholder for identified rival releases later.
- **Calendar years.** There is no calendar anywhere, and that is the *safe* state: every persisted
  week is an absolute integer week-since-zero, so anchoring `year = 1920 + floor(tick/52)` later is a
  pure projection that reinterprets nothing. Contract arithmetic is correct at week 62,400.
- **Aging, retirement, relationships, chemistry.** Non-goals; the identity model does not block them.
- **`SIM_CAP = 520`.** Investigated as a suspected calendar ceiling; it is a **per-invocation loop
  bound** that preserves state (`ui/src/engine/adapter.ts:2349`). It does **not** violate the law.

---

## 4. C2 ARCHITECT NOTE

Guardrails only. Every one costs C2 nothing to honour and adds no C2 feature.

1. **`INITIAL_PROPERTY` is history, not a template.** It is the V12→V13 migration anchor. Never edit
   it. Ship the Founding Flip's bare lot as a separate constant and switch `generateWorld`.
2. **Namespace the second identity, never the first.** Existing `prod-<week>` ids are RNG keys and
   are frozen. Any new id-minting identity takes a new prefix.
3. **Any new root carrying a production id must be added to `persistedProductionIds`**, and any new
   id space allocates against a taken set — never a count or an array position. (Law 20 already says
   the second half; copy the executable invariant at `src/core/placement.ts:1566` rather than
   restating it in prose.)
4. **`state.ledger` is history — never prune or window it to make the tick faster.** The sanctioned
   fixes are hoisting `demolishedFacilityHistory` out of the opex loop and passing the
   `AllocationWindow` `allocateFixedCosts` already accepts.
5. **Never widen a frozen leaf shape.** `EraConfig`, `Standing`, `CulturalForce`, `SegmentId` are
   reachable from V2. New facts land on a new root.
6. **Sets, stages, reservations and queues use the existing occupancy union** (law 22) and the
   existing `(holderId, facilityId, slot)` record. Introduce no second, parallel representation of
   who is using a resource. Reservations need no owner field — the *facility* is the ownable thing.
   (Note: a persisted queue may not even be needed — blocked productions already stall without
   advancing, `src/core/operations.ts:684`, and service order is already the ascending-id total order.)
7. **`market.tick` stays THE authoritative integer week.** If the Time Model ruling needs persisted
   intra-week position, it lands as a new root under the ordinary V-next migration — never by
   redefining an existing week field.
8. **No new consumer of the persisted sim stream.** `tests/replay.test.ts:98` is a load-bearing
   guard. New subsystems take their own versioned derived purpose via `stream(seed, purpose, key)`.
9. **`state.talent` is append-only, and its order and length are load-bearing.** Retirement and
   defection are states, never removal.
10. **Never write a studio-relative fact onto a shared-world entity** (`Talent`, `FilmConcept`,
    `MarketState`). This is the one invariant that keeps the whole ecosystem open.

---

## 5. LONG-TERM BACKLOG

Potential pillars only. No dates, no sequencing, no implementation commitment. None is authorized;
none is required for any current campaign.

- **Hollywood Ecosystem / Rival Studios** — persistent rivals, rival films, competing for talent,
  rival decline and bankruptcy.
- **Awards Season Expansion** — annual and five-year ceremonies with multi-studio nominees.
- **Studio Legacy / Film Library / IP** — libraries, sequels, remakes, franchises, reissues, licensing.
- **Creative Dynasties** — multi-decade fictional careers, partnerships, dynasties, Hall of Fame.
- **Studio Empire / Acquisitions** — acquisitions, subsidiaries and labels, co-productions.

Philosophy of record: *use real cinema history, create our own legends.* Real names and likenesses
are not required — the identity model already supports fictional people becoming the legends of an
alternate Hollywood history.

---

## 6. OWNER DECISIONS

The architecture genuinely can remain flexible without expanding current scope — so on the
*ecosystem* question the answer really is **NONE**. But the evidence does not permit a clean "NONE"
overall, because the new 1920→2040 law and a governance conflict both need Owner action.

1. **The 1920→2040 law is blocked by content supply, not architecture.** A managed campaign can
   commission at most **30 screenplays, ever**, then hits a terminal blocker whose only stated
   remedy is "continue with an existing project" (`src/core/scriptReadModel.ts:548-554`). That is a
   de facto game-over around 1928–1935. How the film-concept supply grows is a **product decision**,
   not an architectural one, and it is the single thing standing between the current build and the
   stated horizon. *(Architecture is ready: appending concepts needs no version bump.)*
2. **Governance conflict — is `CLAUDE.md` superseded?** Its "Do not build" list forbids exactly what
   the long-term direction names: *rival studios as agents, awards season, competition modelling,
   library economics, aging and career progression, the studio economy, cultural drift.* Meanwhile
   the Master Plan schedules Awards in C3, era variation in C4, and Economy Closure in C6, and the
   engine already ships declared-but-inert award/rank/certificate hooks. `CLAUDE.md` is also
   materially stale — it still instructs agents to stop before phase 5, though C1 is sealed. An
   agent reading it as binding today would refuse authorized work.
3. **Confirm the "no hard bankruptcy" ruling is about the PLAYER only.** `DECISIONS.md:49` forbids
   bankruptcy, receivership and a failure ladder. The backlog pillar "rival studio decline and
   bankruptcy" is not obviously the same thing. One sentence settles it.
4. **Not for the Owner, but blocking clean handoff:** three routing documents still state the wrong
   save version — `docs/SHIFT-OPERATIONAL-LAWS.md:99` and `DECISIONS.md:34` say V11,
   `THE-MOVIES-PARITY-MASTER-PLAN.md:124` says V12; live is **V13**. The C2 brief flags only the
   first. These are the documents an implementer reads first.

*No decision here expands current scope. Items 1 and 2 are the only ones that block anything.*
