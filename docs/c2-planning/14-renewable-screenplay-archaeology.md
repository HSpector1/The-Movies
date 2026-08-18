# LANE 14 — FILMCONCEPT & COMMISSION ARCHAEOLOGY FOR RENEWABLE SCREENPLAY GENERATION V1

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **Read-only research. No implementation. No file outside this one was touched.**
>
> Subject: Owner rulings `00C-…-RULINGS-2026-08-18.md` §3 (*Renewable Screenplay
> Generation V1*) and `00D-OWNER-RSG-RESEARCH-NOTE-2026-08-18.md` (directed corpus
> reading + the **Movie Blueprint** design target + beat→set coupling).
>
> **Tagging discipline (brief rule 4).** Every claim carries exactly one of:
> `[CODE]` observed in this repo at the cited `file:line`;
> `[CORPUS]` evidence from `/Users/bruce/Desktop/Big Swing Art/` at the cited file+locus,
> with the corpus's own source tier and confidence carried through;
> `[DOC]` a governing document in this repo or `docs/c2-planning/`;
> `[PROPOSAL]` my recommendation — never an observation.

---

## 0. HEADLINE

The 30-concept pool is **per-world seeded, not an authored catalog**, and it is
**consumed permanently and irreversibly**: one concept → at most one screenplay
project, ever, with no abandonment, deletion or reuse path
`[CODE src/core/scriptDevelopment.ts:248-252, :873-874]` `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:60-62]`.
A managed campaign therefore has a **hard lifetime ceiling of 30 films**, after which
the commission board shows a terminal blocker whose stated remedy is "Continue with an
existing project" — i.e. there is no remedy `[CODE src/core/scriptReadModel.ts:548-555]`.

Three enabling facts make RSG V1 genuinely small: `state.concepts` is **never
length-pinned in save validation** `[CODE src/core/save.ts:2000-2006]`; **no code
anywhere hard-codes the `c-NN` id format** (exhaustive grep, zero matches); and the
title is **read live from the concept at every display surface**, never copied forward
except into two frozen history records.

Two facts make the Owner's *Movie Blueprint* target smaller than it looks:

- **The engine already ships a beat structure.** `FilmShape` is
  `opening → midpoint → ending` with an authored option table per slot value
  `[CODE src/core/types.ts:165-169]` `[CODE src/core/shape.ts:16-19]`. That is a
  three-beat template, orthogonal to genre. The Owner's hypothesis *"genre supplies the
  narrative skeleton; FilmShape bends its expression"* maps onto shipped machinery
  almost exactly — genre would supply the beat list, `FilmShape` already supplies the
  bend.
- **The set-demand seam is already cut and currently empty.** Today's
  `scenery-load-in` blocker carries **no set identity, no set type, no requirement** —
  it is an abstract player-cleared gate `[CODE src/core/types.ts:568-571]`
  `[CODE src/core/operations.ts:274-279, :281-300]`. The blueprint's required
  set/location types drop straight into that hole.

And the Owner's "writer and office remain occupied while writing" requirement is
**already true and already published as player-facing copy**
`[CODE src/core/scriptReadModel.ts:213]`.

Three things are **not** true and must be decided, not assumed:

1. **Draft length is a hard-coded constant of one week**, independent of the writer
   `[CODE src/core/scriptDevelopment.ts:284, :506]`, and the invariant *asserts*
   `dueWeek === commissionedWeek + 1` `[CODE src/core/scriptDevelopment.ts:900-904]`.
2. **Writer skill currently drives script QUALITY, not speed**
   `[CODE src/core/scriptDevelopment.ts:352-362]` — the exact inverse of the
   Prima-controlled corpus law `[CORPUS Bible §5.4, §12; Prima verbatim, §6.1 below]`
   and of the Bible's own successor ruling. **This contradiction is recorded nowhere in
   `docs/`** (grep: zero hits).
3. **A minted concept must not be run through `correlateConceptCost`.** That function is
   a whole-pool rank permutation that rewrites *every* concept's `baseNegativeCost`
   `[CODE src/core/employment.ts:385-401, called :415]`. Re-running it after appending
   would silently re-price in-flight productions' `requiredNegative`.

---

## 1. FILMCONCEPT ANATOMY

### 1.1 The exact type

`[CODE src/core/types.ts:154-163]`

```ts
export type FilmConcept = {
  id: string
  title: string
  genre: Genre
  baselineStrength: number   // 0..100
  originalityRaw: number     // 0..100
  baseNegativeCost: number   // currency
  requiredSlots: CastSlot[]
  roleRequirements: Record<CastSlot, RoleRequirement>
}
```

`RoleRequirement = { target: Persona; tolerance: number }` (tolerance 0.5..3.0)
`[CODE src/core/types.ts:152]`.

Eight fields, **no optional fields**, and the save validator enforces that exact set
with `v8ExactKeys(..., [], label)` — an **empty optional-key list**
`[CODE src/core/save.ts:1379-1395]`. **Adding a ninth field (`origin`, `beats`,
`requiredSets`, `mintedWeek`, `generatedTitle`) is a frozen-leaf widening** and violates
Owner guardrail 4 `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:19-21]`. This is the single
hardest constraint on the Movie Blueprint's schema and it decides the whole shape of §8.

`concepts: FilmConcept[]` sits on the **frozen** `GameStateV2` surface
`[CODE src/core/types.ts:451-461]`, which every later save version inherits recursively;
V13 validation strips `property`, delegates to V12, which chains down to the V8
exact-key check `[CODE src/core/save.ts:3648-3688, :745-764]`.

### 1.2 Where the ~30 concepts are authored — and the exact count

They are **not** authored. They are **generated per world from the seed**
`[CODE src/core/worldgen.ts:538-582]`, via six independent derived substreams:

| Substream | Field produced | Line |
|---|---|---|
| `stream(seed,'worldgen','concept-genre')` | `genre` (uniform over `GENRE_ORDER`) | `:539, :548` |
| `stream(seed,'worldgen','concept-strength')` | `baselineStrength` = `truncatedNormal(60, 15, 20, 95)` | `:540, :549` |
| `stream(seed,'worldgen','concept-originality')` | `originalityRaw` = `truncatedNormal(55, 20, 5, 100)` | `:541, :550` |
| `stream(seed,'worldgen','concept-cost')` | `baseNegativeCost` = `truncatedNormal(4.5M, 1.5M, 2M, 9M)` | `:542, :552` |
| `stream(seed,'worldgen','concept-roles')` | `roleRequirements` — per slot, `target` axes `uniform(-1,1)`, `tolerance uniform(0.8,1.8)` | `:543, :556-565` |
| `stream(seed,'worldgen','concept-title')` | `title` — two draws (lead idx, noun idx) | `:544, :567-568` |

`requiredSlots` is always `[...SLOT_ORDER]` `[CODE src/core/worldgen.ts:577]`, pinned by
test `[CODE tests/worldgen.test.ts:163-164]`.

**Exactly 30.** `WORLD_CONFIG.conceptCount: 30` `[CODE src/core/tuning.ts:880]`, looped
at `[CODE src/core/worldgen.ts:547]`, pinned by test `[CODE tests/worldgen.test.ts:87-90]`.
That test asserts on `generateWorld()` output, **not** on live `GameState`, so appending
concepts at runtime does not break it.

The **only** authored data is the vocabulary, in a version-controlled TS module (never
filesystem I/O, so replay stays byte-stable) `[CODE src/core/data/wordlists.ts:1-11]`:

- `TITLE_LEAD` — **48** entries `[CODE src/core/data/wordlists.ts:39-48]`
- `TITLE_NOUN` — **60** entries `[CODE src/core/data/wordlists.ts:51-62]`
- → **2,880** distinct two-word titles, formed as `` `${lead} ${noun}` ``
  `[CODE src/core/worldgen.ts:567-568, :572]`

The word lists are **genre-agnostic**: nothing keys a title draw to the concept's genre
`[CODE src/core/worldgen.ts:567-568]`. The original *did* key them (§7.3).

### 1.3 Latent quality / strength fields

- **`baselineStrength` (0..100)** — the hidden latent, 60% of assessed script strength,
  never shown to the player `[CODE src/core/scriptDevelopment.ts:352-362]`
  `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:127-131]`. Also drives a commercial appeal
  delta at release `[CODE src/core/reception.ts:430-437]`.
- **`originalityRaw` (0..100)** — originality bonus / derivativeness penalty after shape
  modification, in both forecast and reception `[CODE src/core/forecast.ts:231-237]`
  `[CODE src/core/reception.ts:386-394]`.
- **`baseNegativeCost`** — funding-demand anchor:
  `requiredNegative = baseNegativeCost × shapeEffects.budgetDemandMultiplier × era.costScale`,
  computed identically in four places `[CODE src/core/candidates.ts:273-275]`
  `[CODE src/core/forecast.ts:144]` `[CODE src/core/reception.ts:246]`
  `[CODE src/core/filmPackage.ts:738]`.
- **`roleRequirements`** — per-slot persona target + tolerance, consumed by `roleFit`
  `[CODE src/core/forecast.ts:116]`.
- **`requiredSlots`** — genuinely consumed: the unfilled-role check in package assembly
  `[CODE src/core/filmPackage.ts:269]` and the concept card
  `[CODE ui/src/components/ConceptCard.tsx:64]`. **It is a real per-concept role-demand
  lever that already exists** — but `CastSlot` has only three members
  `[CODE src/core/types.ts:18]`, so it can only ever *shrink* the requirement, never
  express "this script needs five roles". Important for §8.4.

At **founding only**, `beginFounding` re-pairs the pool's costs to correlate with
strength: a rank-blend at `SCRIPT_COST_POTENTIAL_CORRELATION = 0.4`
`[CODE src/core/tuning.ts:512]` preserving the cost multiset while shifting the pairing
toward strength order `[CODE src/core/employment.ts:385-401, called :415]`. A
**whole-pool operation executed exactly once**. See §8.9.

### 1.4 How genre and shape attach

- **Genre** is a field on the concept `[CODE src/core/types.ts:157]`. The promise's genre
  **must equal** the concept's genre — enforced at greenlight
  `[CODE src/core/actions.ts:345-349]` and as a script invariant
  `[CODE src/core/scriptDevelopment.ts:752-755]`. Genre selects the writer's
  genre-experience row inside `effectiveSkill` `[CODE src/core/development.ts:64]` and
  keys the director-genre track-record predicate `[CODE src/core/forecast.ts:301-305]`.
- **Shape does NOT attach to the concept.** `FilmShape` is chosen by the player at
  commission, stored on the `ScriptProject` `[CODE src/core/types.ts:623]`, then copied
  onto the `Production` at greenlight `[CODE src/core/actions.ts:1628-1637]`.
- **`SHAPE_OPTIONS` is keyed by slot value only — never by genre**
  `[CODE src/core/shape.ts:16-19]`. Genre and shape are fully orthogonal today. 3
  openings × 3 midpoints × 4 endings = **36 shape combinations**
  `[CODE src/core/types.ts:165-169]`.
- Each option carries `{expression, openingReachMod, craftMod, budgetDemandMod,
  originalityMod, segmentAffinity}` `[CODE src/core/types.ts:171-178]`, aggregated by
  `resolveShape` into clamped `ShapeEffects` `[CODE src/core/types.ts:180-187]`
  `[CODE src/core/shape.ts:149]`, and additionally reweights talent skills through
  `SHAPE_SKILL_MODS` in forecast, reception and development
  `[CODE src/core/forecast.ts:82]` `[CODE src/core/reception.ts:186]`
  `[CODE src/core/development.ts:69]`.

**This is the load-bearing structural finding for the Movie Blueprint:** *"FilmShape
bends the creative expression"* is not a thing to build — it is a description of
`resolveShape` `[CODE src/core/shape.ts:149]`. What is missing is the **genre-supplied
skeleton** that the bend applies to.

### 1.5 Field flow: commission → draft EST → reception

```
COMMISSION   actions.ts:1523-1554 → scriptDevelopment.ts:232-290
             reads concept.id only (existence + not-already-claimed)
             writes ScriptProject{conceptId, writerId, shape, promise,
                                  status:'drafting', dueWeek: week+1, reservation}

DRAFT (tick 0.5)  tick.ts:173-185 → scriptDevelopment.ts:408-455 → :318-364
             actualStrength    = clamp(0.6·concept.baselineStrength
                                     + 0.4·effectiveSkill(writer,'writing',concept,…,'actual')
                                     + estUplift, 0, 100)
             perceivedStrength = same with 'perceived'
             estUplift = developmentOfficeEstUplift(state)   facilityEffects.ts:94-102
             → PERSISTED on the project.

FORECAST     forecast.ts:86-99   scriptStrength = override.perceived ?? (0.6·baseline + 0.4·writing)
             forecast.ts:116     roleFit(t, concept.roleRequirements[slot])
             forecast.ts:144     requiredNegative from concept.baseNegativeCost
             forecast.ts:231-237 originality from concept.originalityRaw
             forecast.ts:303     genre from concept.genre

RECEPTION    reception.ts:190-203  scriptStrength = override.actual ?? (…)
             reception.ts:246      requiredNegative
             reception.ts:386-394  originality
             reception.ts:430-437  scriptPotentialAppealDelta(baselineStrength, …)

RELEASE      tick.ts:268-272  concept lookup (throws on unknown)
             tick.ts:415      concept.title → BroadcastItem template (FROZEN string)
             tick.ts:610-612  concept.title + concept.genre → TalentCareerEvent (FROZEN)
```

**The load-bearing consequence:** once a managed screenplay is assessed, its
`baselineStrength` contribution is frozen into the stored assessment — but
`originalityRaw`, `baseNegativeCost`, `roleRequirements` and `genre` are **still read
live from the concept record at greenlight and at release**. A generated concept is
therefore not a title with a genre attached: it must carry all eight fields with
mechanically valid values, or forecast and reception produce garbage.

---

## 2. POOL CONSUMPTION SEMANTICS

### 2.1 What happens to a concept when commissioned

It is **claimed permanently**. Nothing is removed and nothing is marked on the concept —
the claim is expressed as *the existence of a `ScriptProject` bearing that `conceptId`*:

```ts
// src/core/scriptDevelopment.ts:248-252
if (development.projects.some((project) => project.conceptId === payload.conceptId)) {
  throw new Error(
    `script development: commission rejected — concept "${payload.conceptId}" already owns a screenplay project`,
  )
}
```

Re-asserted as a state invariant `[CODE src/core/scriptDevelopment.ts:873-874]`.

The claim is **irreversible**:

- Project ids derive from array index: `canonicalScriptProjectId(index) = 'script-' + pad4(index)`
  `[CODE src/core/scriptDevelopment.ts:40-49]`, invariant-checked
  `[CODE src/core/scriptDevelopment.ts:869-872]`.
- **No deletion path exists.** The only `projects.filter` in the module is a read-only
  selector `[CODE src/core/scriptDevelopment.ts:641]`.
- Cancelling a *production* returns the project to `'ready'` and clears `productionId` —
  the concept stays claimed `[CODE src/core/scriptDevelopment.ts:554-572]`.

Stated as contract law `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:60-62]`:

> "Projects are append-only and stored in canonical ascending ID order. One source
> concept may seed at most one managed script project; V1 does not support remakes,
> abandonment, deletion, or replacement. Legacy concepts retain their existing reusable
> behavior."

**Legacy (unmanaged) mode is infinitely reusable** — the legacy `greenlight` checks only
that the conceptId exists `[CODE src/core/actions.ts:339-343]`. Only *managed* studios —
every real player studio — exhaust.

### 2.2 Where exhaustion bites, and the current guard

```ts
// src/core/scriptReadModel.ts:548-555
if (concepts.length === 0) {
  blockers.push({
    kind: 'no-concepts',
    headline: 'No uncommissioned concepts remain',
    detail: 'Every available concept already owns a managed screenplay project.',
    remedy: 'Continue with an existing project.',
  })
}
```

The remedy is not a remedy: no action yields a 31st concept. `'no-concepts'` is in the
blocker enum `[CODE src/core/scriptReadModel.ts:37-48]` and mirrored into two lot-snapshot
allow-lists `[CODE ui/src/lot/snapshot/scriptReview.ts:179]`
`[CODE ui/src/lot/snapshot/castingReview.ts:194]`.

**Bite point.** 30 films against the Owner's ratified 1920→≥2040 horizon with no calendar
end `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:31-32]`. **This limitation is recorded
nowhere in `docs/`** — the only near-mentions are two stale "all 30 concepts are always
available" notes describing the headless M0A corpus
`[DOC docs/rev4-open-questions.md:297]` `[DOC docs/HANDOFF.md:1476]`.

### 2.3 Every site that iterates or indexes the concept collection

**A. Iteration / whole-pool scans — these define behaviour when the array grows**

| # | Site | What it does | Effect of appending |
|---|---|---|---|
| A1 | `[CODE src/core/scriptReadModel.ts:471-482]` | Commission menu: filters out claimed concepts, sorts by `compareId`, projects `{id,title,genre}` | **Opens for free.** |
| A2 | `[CODE src/core/scriptReadModel.ts:548-555]` | The `no-concepts` terminal blocker | Stops firing. Copy must change. |
| A3 | `[CODE ui/src/engine/adapter.ts:548-550]` | `selectConcepts(state) => state.concepts` | **Opens for free.** |
| A4 | `[CODE ui/src/screens/Assembly.tsx:350]` | Legacy direct-greenlight picker | Opens for free (legacy only). |
| A5 | `[CODE ui/src/screens/TalentHub.tsx:457]` | Concept list for Fit / EP previews | Opens for free. |
| A6 | `[CODE ui/src/screens/WritersRoom.tsx:157, :253-259]` | Commission `<select>`; default = `concepts[0]` | Opens for free; default stays a pool concept (lexicographic order, §3.1). |
| A7 | `[CODE ui/src/lot/snapshot/scriptCommission.ts:323, :537-545]` | Lot workspace re-validates `state.concepts` (`uniqueById`) and `board.commission.concepts` (**exact-key** check) | Opens for free **only if** the view shape is unchanged. See O5. |
| A8 | `[CODE src/core/studioRunRecap.ts:376-380, used :499]` | `minConcept` — globally cheapest, whole-pool sort | **Behaviour change**: the affordability quote will start naming generated concepts. |
| A9 | `[CODE src/core/studioRunRecap.ts:592]` | `conceptById` map for recap titles | Opens for free. |
| A10 | `[CODE src/core/forecast.ts:302]` | `conceptGenre` map (director-genre record) | Opens for free. |
| A11 | `[CODE src/core/employment.ts:385-401, called :415]` | `correlateConceptCost` — **whole-pool rank permutation of every `baseNegativeCost`** | **DANGER.** §8.9. |
| A12 | `[CODE src/core/candidates.ts:201, :236]` | Headless agents: `Math.floor(rng.next() * concepts.length)` from the **persisted sim stream** | Growth changes agent behaviour per seed. Safe only because M0A never founds → never mints. Needs a test. |
| A13 | `[CODE src/core/save.ts:2000-2006]` | Save validation: per-element exact keys + duplicate ids. **No count assertion.** | **Opens for free.** The key enabling fact. |
| A14 | `[CODE src/core/scriptDevelopment.ts:653-654]` | `titleByConcept` for writer labels | Opens for free. |
| A15 | `[CODE src/core/scriptDevelopment.ts:853]` | `conceptById` in the invariant | Opens for free. |

**B. Lookup-by-id — every one throws on an unresolvable conceptId**

`[CODE src/core/actions.ts:340]` · `[CODE src/core/tick.ts:269-272]` ·
`[CODE src/core/studioCalendar.ts:216-221]` (called from `:297, :331, :360, :418, :439,
:472, :612`) · `[CODE src/core/scriptReadModel.ts:245-249]` ·
`[CODE src/core/castingReadModel.ts:117-121]` · `[CODE src/core/castingSessions.ts:361-364]` ·
`[CODE src/core/filmPackage.ts:898-902]` · `[CODE src/core/firstFilmJourney.ts:181-183]` ·
`[CODE src/core/scriptDevelopment.ts:423-427]` · `[CODE ui/src/engine/adapter.ts:1249-1251]`.

All eleven resolve against `state.concepts`. **If generated concepts live in a separate
root, all eleven must be rewritten to union — and each one currently throws, so a missed
site is a crash, not a cosmetic bug.**

---

## 3. IDENTITY

### 3.1 Current conceptId format

`` `c-${pad2(j)}` `` → `c-00` … `c-29` `[CODE src/core/worldgen.ts:571]`, `pad2` at
`[CODE src/core/worldgen.ts:163-165]` (2-wide only — a latent trap if `conceptCount` ever
exceeds 99).

**No code anywhere hard-codes the `c-NN` pattern.** Exhaustive grep across `src/`,
`ui/src/`, `tests/` for `'c-0`, `"c-0`, `c-[0-9]`, `/^c-`: **zero matches**.

Ordering is lexicographic via three identical `compareId` helpers
`[CODE src/core/scriptReadModel.ts:225]` `[CODE src/core/studioCalendar.ts:212]`
`[CODE src/core/castingReadModel.ts:105]`. Under ASCII `'c-29' < 'concept-orig-0000'`
(`'-'` 0x2D < `'o'` 0x6F), so **pool concepts sort first, generated ones after in mint
order** if zero-padded. No tie-breaking needed.

### 3.2 Is there an id-collision authority for concepts?

**No.** `persistedProductionIds` `[CODE src/core/productionIdentity.ts:8-38]` covers
*production* ids only, sweeping nine roots. There is **no `persistedConceptIds` analog**.
The only concept-id guard is the duplicate-within-array check at
`[CODE src/core/save.ts:2001-2006]`.

Owner guardrail 3 binds only roots containing *production* ids
`[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:16-17]`, so it does not literally cover a
concept-id root — but the same discipline plainly should, and the architect should say so
explicitly rather than leave a reader to infer it.

### 3.3 What a fresh namespaced scheme must reserve against

Persisted roots carrying a `conceptId` — **exactly four**:

| Root | Field | Type line |
|---|---|---|
| `state.studio.activeProductions[]` | `Production.conceptId` | `[CODE src/core/types.ts:227]` |
| `state.studio.releasedFilms[]` | `FilmResult.conceptId` | `[CODE src/core/types.ts:255]` |
| `state.theatricalRuns[]` | `TheatricalRun.conceptId` | `[CODE src/core/types.ts:306]` |
| `state.scriptDevelopment.projects[]` | `ScriptProject.conceptId` | `[CODE src/core/types.ts:621]` |

Plus the source of truth, `state.concepts[].id` `[CODE src/core/types.ts:155]`.

**Roots that carry NO conceptId — verified, do not over-reserve:**
`state.ledger` (`talentId`/`productionId`/`constructionProjectId` only
`[CODE src/core/types.ts:368-439]`); `state.careerEvents` (`filmId` is a **productionId**;
`filmTitle` is a frozen **string** `[CODE src/core/types.ts:1230-1234]`);
`state.broadcastItems`/`state.coverageContexts` (productionIds
`[CODE src/core/productionIdentity.ts:19-29]`); `state.operations` workflows
`[CODE src/core/productionIdentity.ts:30-34]`.

**Transient / derived:** `CommissionScriptPayload.conceptId` `[CODE src/core/types.ts:642]`;
`[CODE src/core/economyView.ts:376, :395]`; `[CODE src/core/studioRunRecap.ts:188, :545]`;
`[CODE src/core/candidates.ts:75, :335]`.

### 3.4 Monotonic counter — where it must live

`ScriptProject` ids derive from array position `[CODE src/core/scriptDevelopment.ts:40-49]`,
legal there because projects are append-only. **Concept ids cannot use that trick**:
`state.concepts` starts with 30 pool concepts, so index-derived ids would tangle with
`WORLD_CONFIG.conceptCount`. A **persisted explicit counter** in the new root is required.

---

## 4. TITLES

### 4.1 Where a film's display title lives at each pipeline stage

**There is exactly one storage location: `FilmConcept.title`.** Every other stage
*resolves* it live; none copies it forward — with two frozen-history exceptions.

| Stage | Where the title comes from |
|---|---|
| Concept | `FilmConcept.title` — the only stored copy `[CODE src/core/types.ts:156]` |
| Script project | **Not stored.** `titleByConcept.get(project.conceptId)` `[CODE src/core/scriptDevelopment.ts:653-658]`; `requireConcept(state, project.conceptId).title` `[CODE src/core/scriptReadModel.ts:399, :436, :1060]` |
| Casting session | **Not stored.** `[CODE src/core/castingReadModel.ts:160, :302, :352]` |
| Production | **Not stored.** `productionTitle(state, p) = findConcept(state, p.conceptId)?.title ?? p.conceptId` `[CODE ui/src/engine/adapter.ts:688]` |
| `FilmResult` | **No title field at all** `[CODE src/core/types.ts:241-264]`. Resolved from `conceptId` at render `[CODE ui/src/engine/adapter.ts:5213, :5244]` |
| Theatrical run | **Not stored.** `[CODE src/core/studioCalendar.ts:472]` |
| Newspaper / Chronicle | `conceptTitle` passed **in** `[CODE src/core/newspaper.ts:355, :614]`, supplied live by the adapter `[CODE ui/src/engine/adapter.ts:5213, :5244]` |
| Broadcast item | **FROZEN** into the rendered `template` string at release `[CODE src/core/broadcast.ts:272-274, :288-300]` ← `[CODE src/core/tick.ts:415]` |
| Career event | **FROZEN** `filmTitle: concept.title` at release `[CODE src/core/tick.ts:610]` `[CODE src/core/types.ts:1234]` |

**Direct answer:** the title is **read at release time from the concept**
`[CODE src/core/tick.ts:269-272, :415]`; only the two history records copy it forward.

### 4.2 Does any rename path exist today?

**No.** The `Action` union `[CODE src/core/types.ts:1260-1297]` contains no rename verb of
any kind. Nothing writes `concept.title` after `generateConcepts` returns.

### 4.3 Exactly which surfaces print the title — the rename proof set

A rename writing `FilmConcept.title` propagates to **all of A** and **none of B**.

**A. LIVE — will reflect a rename**

*Core read models:*
1. `[CODE src/core/studioCalendar.ts:216-221]` `requireConceptTitle` → production outlook
   `:297`, screenplay rows `:331, :418`, casting rows `:360, :439`, theatrical receipts
   `:472`, decisions `:612`.
2. `[CODE src/core/scriptReadModel.ts:318]` "Working on *Title*".
3. `[CODE src/core/scriptReadModel.ts:399, :415, :436]` D&C slot occupants.
4. `[CODE src/core/scriptReadModel.ts:480]` commission menu entries.
5. `[CODE src/core/scriptReadModel.ts:786, :838]` project cards / Ready package view.
6. `[CODE src/core/scriptReadModel.ts:863, :880, :889, :912-913, :949]` lot attention copy.
7. `[CODE src/core/scriptReadModel.ts:1060]` script review decision title.
8. `[CODE src/core/castingReadModel.ts:352, :465]` casting views.
9. `[CODE src/core/scriptDevelopment.ts:663-670]` roster labels "Drafting *Title*".
10. `[CODE src/core/firstFilmJourney.ts:181-183, :351, :358, :788, :799]` journey narration.
11. `[CODE src/core/studioRunRecap.ts:621]` recap rows → `:683, :686, :1055-1062`.
12. `[CODE src/core/newspaper.ts:355, :470, :614]` headline/subheadline.

*Adapter / UI:*
13. `[CODE ui/src/engine/adapter.ts:688]` `productionTitle` → `:709, :825, :5767, :6396`.
14. `[CODE ui/src/engine/adapter.ts:1173-1177, :1204-1205, :1353-1355]` assignment labels.
15. `[CODE ui/src/engine/adapter.ts:2411, :2499, :2505, :2511, :2514-2515]` next-event copy.
16. `[CODE ui/src/engine/adapter.ts:2681, :2899, :4210, :5213, :5244]` newspaper/autopsy/chronicle.
17. `[CODE ui/src/engine/adapter.ts:6244, :6282]` production cards.
18. `[CODE ui/src/engine/adapter.ts:6374, :6402]` presence/occupancy joins.
19. `[CODE ui/src/App.tsx:3500]`, `[CODE ui/src/screens/Dashboard.tsx:500, :559]`,
    `[CODE ui/src/screens/ReleaseResult.tsx:73, :75]`,
    `[CODE ui/src/lot/snapshot/nextEvent.ts:537]`.
20. `[CODE ui/src/screens/WritersRoom.tsx:255-257]` commission `<option>` label.
21. `[CODE ui/src/lot/snapshot/scriptCommission.ts:329-331, :345, :365, :378]` lot workspace.

**B. FROZEN — will NOT reflect a later rename**

22. `[CODE src/core/types.ts:1234]` + `[CODE src/core/tick.ts:610]` — `TalentCareerEvent.filmTitle`.
23. `[CODE src/core/broadcast.ts:272-274, :288-300]` + `[CODE src/core/tick.ts:415]` —
    `BroadcastItem.template`.

`[PROPOSAL]` B is **correct behaviour, not a defect** — a career record and a press
clipping name the film as it was called at the time. But it must be stated in the
contract, because a playtester who renames a released film and opens a talent profile will
otherwise file it as a bug.

---

## 5. WRITER OCCUPANCY — ALREADY TRUE, WITH ONE GAP

### 5.1 Is the writer exclusively occupied during draft weeks?

**Yes, on four independent layers.**

1. **One active script task per writer** — rejected at commission
   `[CODE src/core/scriptDevelopment.ts:253-261]` and rewrite
   `[CODE src/core/scriptDevelopment.ts:479-490]`.
2. **The unified busy set** — `busyTalentIds` unions active-production participants with
   active script writers `[CODE src/core/employment.ts:102-121]`; both actions check it
   `[CODE src/core/actions.ts:1539-1543, :1573-1577]`.
3. **Invariants** — writer must be contracted, must not hold a second script task, must
   not also be on an active production `[CODE src/core/scriptDevelopment.ts:970-984]`.
4. **Contract law** — early release rejects while drafting/rewriting
   `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:94-98]`.

The writer is also **physically projected at the office** during the draft — presence
claims keyed `('script', writerId, facilityId, slot)` with precedence
`production > script > casting` `[CODE src/core/presence.ts:262, :277-279, :501-527]`.

### 5.2 Does the office slot stay reserved for the whole draft?

**Yes.** `ScriptReservation` allocated at commission
`[CODE src/core/scriptDevelopment.ts:264-274]`, held for the whole `drafting`/`rewriting`
window, cleared **atomically** with the transition to `review`
`[CODE src/core/scriptDevelopment.ts:446-452]`; holding one in any other status is an
invariant violation `[CODE src/core/scriptDevelopment.ts:135-139, :922-923]`.

Allocation is deterministic (ascending facilityId, then slot) and collides against
production and casting reservations in **one shared occupancy union**
`[CODE src/core/scriptDevelopment.ts:173-200, :100-156]` — satisfying Owner guardrail 9
`[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:29-30]`. Slots release **before** productions
allocate, same tick `[CODE src/core/tick.ts:169-185, :206-214]`.

### 5.3 The player-facing sentence already exists

```ts
// src/core/scriptReadModel.ts:213
export const SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE =
  'One week passes while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.'
```

**Verdict: the Owner's occupancy requirement is ALREADY TRUE.** RSG V1 need not build it.

### 5.4 The gap

Draft length is a **hard-coded constant of one week**:
`dueWeek: commissionedWeek + 1` `[CODE src/core/scriptDevelopment.ts:284]`;
`dueWeek: currentWeek + 1` at rewrite `[CODE src/core/scriptDevelopment.ts:506]`; and the
invariant **asserts the constant** `[CODE src/core/scriptDevelopment.ts:900-904, :911-916]`.

The persisted shape already supports variable length (`dueWeek: number | null`
`[CODE src/core/types.ts:630]`, validated only as a nullable integer
`[CODE src/core/save.ts:2758]`). Only the core invariant pins it.

`[PROPOSAL]` The Owner's throughput requirement is **already satisfied without variable
draft length**: more writers → more parallel projects (one active task each); more
Development Offices → more slots → more parallel projects — exactly the corpus's
"one script at a time per Script Office **building**; more buildings = parallel scripts"
`[CORPUS Prima verbatim, §6.1]`. Variable draft weeks are a separate feature (§8.11).

---

## 6. THE WRITER-EXPERIENCE LAW — A LIVE CONTRADICTION

### 6.1 The corpus law (Prima, developer-reviewed, verbatim)

Extracted directly from the Prima Official Game Guide OCR
(`/Users/bruce/Desktop/Big Swing Art/The_Movies_Prima_Official_eGuide_abbyy 2`),
Scriptwriters section `[CORPUS — OFFICIAL Prima, developer-reviewed, confidence high]`:

> "Scriptwriters gain individual experience (visible in their Staff cards) over time with
> every job they perform. **The more experience a scriptwriter has, the faster scripts
> will be completed. Scriptwriter experience has no bearing on the quality of the
> script.** To speed the writing of scripts, put multiple writers on the project."

> "Although Script Offices can produce scripts of any genre, they can only produce
> **one script at a time**, regardless of how many scribes are assigned to it. To write
> multiple scripts simultaneously, you'll need not only enough writers to make it
> worthwhile but also **more than one Script Office**."

> "**The level of the Script Office dictates the quality of scripts it can produce.**"

Recorded and cross-checked in the Bible twice — `[CORPUS Bible §5.4]` and
`[CORPUS Bible §12 "Quality and Experience — a genuine, stated cross-source
contradiction"]`, which additionally records the **manual's own** speed-only framing
`[CORPUS OFFICIAL manual p.16-17: "As writers get more experienced, the time to write a
script will be shorter"]` and **preserves the GameSpot contradiction** ("the more they
work, the better they'll get at writing scripts, resulting in higher quality
productions") rather than deleting it. Per the Owner's source-precedence instruction and
the Bible's own, **Prima controls**.

Bible successor ruling `[CORPUS Bible §5-B "Script system: DEEPEN"]`:

> "…while treating **writer count/experience strictly as a speed lever** (5.4) and keeping
> the Custom-Office-inherits-conventional-ceiling rule (5.5) as a real constraint, not an
> escape hatch."

### 6.2 What C1 actually shipped

```ts
// src/core/scriptDevelopment.ts:352-362  (assessFirstDraft)
actualStrength:    clamp(0.6 * concept.baselineStrength + 0.4 * actualWriting    + estUplift, 0, 100),
perceivedStrength: clamp(0.6 * concept.baselineStrength + 0.4 * perceivedWriting + estUplift, 0, 100),
```

Writer skill contributes **40% of script quality**. Draft length is a constant (§5.4), so
writer skill contributes **0% of speed**.

**The shipped engine implements the exact inverse of the Prima-controlled law.**

The module docstring is aware of *half* the law and states it correctly for the **office**,
while saying nothing about the writer `[CODE src/core/scriptDevelopment.ts:314-317]`:

> "SPEED IS UNTOUCHED. Drafting is one week with or without an office; tiers change what a
> script can become, never how fast. That is the original law."

Corpus-accurate about offices `[CORPUS Bible §5.2, §12 tier tables]`. Silent about writers
— and that silence is where the inversion lives. **Recorded in no repo doc** (grep over
`docs/*.md` for "writer experience" / "writer skill" / "speed only": zero hits). Per brief
rule 5, reported here and **not resolved**.

### 6.3 How the shipped office machinery maps onto "office tier = ceiling"

The C1 facility machinery is clean and corpus-shaped:

- `developmentOfficeEstUplift(state)` — **highest tier wins, nothing stacks**: `+9` for
  `development-office-3`, `+4` for `development-office-2`, else `0`
  `[CODE src/core/facilityEffects.ts:94-102]` `[CODE src/core/tuning.ts:808-809]`.
- Read from **operational placements at evaluation time**; nothing cached, nothing
  persisted, zero RNG `[CODE src/core/facilityEffects.ts:1-27]`.
- Applied **first-draft only**, inside the existing `[0,100]` clamp, to **both** hidden and
  visible strength `[CODE src/core/scriptDevelopment.ts:292-317, :348-362]`
  `[CODE src/core/tuning.ts:789-807]`.
- Wired at exactly one point in the tick, reading the estate *before* construction
  completes in the same advance `[CODE src/core/tick.ts:179-184]`.

**One honest divergence to name:** ours is an **uplift** (additive, inside a clamp); the
original's is a **hard ceiling** (a script cannot exceed the tier's star cap regardless of
staffing) `[CORPUS Prima; Bible §5.2, §12]`. Our tuning comment says so explicitly —
*"The original's office tier capped what a script could become; ours raises it, in the same
currency the player already reads"* `[CODE src/core/tuning.ts:790-792]`. That is a
**recorded, deliberate** divergence, unlike the writer inversion which is unrecorded.

**Interaction with generated-concept latents.** A generated concept still carries a
`baselineStrength`, so the existing blend applies unchanged. That means:
- office tier lifts the outcome — corpus-shaped;
- the writer still moves quality — corpus-contradicting;
- and `baselineStrength` for a generated concept becomes a value RSG V1 must **choose**.

`[PROPOSAL]` Deriving it from writer skill double-counts the writer; deriving it from
office tier double-counts the office (the uplift already applies). The honest choice is a
**purpose-keyed deterministic draw keyed on the mint ordinal**, so a generated concept is a
premise of unknown quality exactly like a pool concept, and office + writer act on it
through the existing blend. RSG V1 changes neither the blend nor the draft length; the
inversion is filed as an Owner decision (§11.1).

---

## 6A. DIRECTED CORPUS VERIFICATION (Owner note `00D`)

Every mechanic the Owner named, verified against the directed sections —
Bible **§5** (Script/Screenplay System), **§7** (Film Production Pipeline), **§12**
(Writers), **§32** (Player-Created Movies/Machinima) — plus the Prima OCR where the Bible
flagged conflicting secondary accounts.

| # | Claimed mechanic | Verdict + confidence | Evidence |
|---|---|---|---|
| C1 | Standard Script Office writers **auto-generate** scripts | **CONFIRMED, high** | `[CORPUS Bible §7.0: "Scripts are auto-generated by hired writers; scene composition and shot-by-shot direction are handled by the game engine, not the player" — OFFICIAL manual pp.11-13]`; `[CORPUS Bible §32 Mode A]` |
| C2 | Scripts belong to **one of five genres** | **CONFIRMED, high** | `[CORPUS Bible §5.3 table (Action/Comedy/Horror/Romance/Sci-Fi); OFFICIAL manual p.7 "Genre Icons"]`; two genres directly observed on movie cards `[CORPUS DIRECTLY OBSERVED: Screenshots 11.38.00 AM (Sci-Fi), 11.40.24 AM (Comedy)]` |
| C3 | **Five explicit genre beat templates**, 7 beats each | **CONFIRMED, high** | `[CORPUS Bible §5.5 "The Hollywood Scriptwriting Templates" table — OFFICIAL manual pp.28-30]`. Verbatim: Horror Intro→Shock→Pursuit→Encounter→Preparation→Big Fight→Resolution; Action Intro→Skirmish→Investigate→Fight→Prepare→Battle→Resolution; Romance Intro→Meeting→Problem→Time Apart→Reunion→Argument→Resolution; Sci-Fi Intro→Encounter→Survey→Fight→Pursuit→Showdown→Resolution; Comedy Intro→Problem→Pursuit→Challenge→Preparation→Conflict→Resolution. Matches the Owner's note exactly. |
| C4 | A **simplified four-stage** structure also existed | **CONFIRMED THAT IT EXISTS; ITS BEATS ARE UNRECOVERED** | `[CORPUS Bible §5.5: "The manual also notes a simplified four-stage version of each template exists" — OFFICIAL manual pp.28-31]`. Logged as an **ACTIVE open question**: `[CORPUS ACTIVE-UNRESOLVED-QUESTIONS.csv Q036: "Exact beats of the 'simplified four-stage version' … the retrieved pages don't enumerate its beats", priority LOW]`. **Do not invent them.** |
| C5 | Also recovered: **generic Hero and Villain roles** across genres/templates | **CONFIRMED, high** | `[CORPUS Bible §5.5 — OFFICIAL manual pp.30-31]` |
| C6 | **AI writers generate only enough scenes to reach the achievable ceiling** | **CONFIRMED at MODERATE confidence, two corroborating contemporary sources; NOT developer-reviewed** | `[CORPUS Bible §12 "AI writer behavior — stops at the minimum viable scene count" — GameSpot: "For efficiency's sake, your scriptwriters will do the bare minimum to achieve script potential", single source, moderate]`; independently echoed by IGN Wiki `[CORPUS Bible §5.5]`. Consistent with the separate observation that First-Class AI scripts land ~3.4-3.6★ against a nominal 4★ cap `[CORPUS Bible §5.2, §12 — PLAYER DOCUMENTED; and a competing GameSpot band of 3.75-4.25★ preserved as an unresolved disagreement]`. |
| C7 | **Office tier = quality ceiling**; writer experience & multiple writers = **speed** | **CONFIRMED, high (Prima, developer-reviewed) — with an explicit preserved contradiction** | `[CORPUS Prima verbatim, quoted §6.1]`; `[CORPUS OFFICIAL manual p.16-17]`; `[CORPUS Bible §5.4, §12]`. **GameSpot states the opposite**; the Bible preserves both and adopts Prima on precedence. §6 records that C1 ships the inverse. |
| C8 | **Four office tiers** Basic → Intermediate → Proficient → First-Class | **CONFIRMED, high on the ladder; costs partly UNRESOLVED** | `[CORPUS Bible §5.2 table]`. Basic $6,000/1★ — three-source agreement (Prima + GameSpot + DIRECTLY OBSERVED tooltip), high. Proficient $33,333/3★ — three-source, high. First Class $66,666/4★ nominal — two-source. **Intermediate cost is a live ~3-vs-3 split, $33,000 (Prima + 2 GameFAQs) vs $29,000 (fandom + IGN + GameSpot)** `[CORPUS ACTIVE-UNRESOLVED-QUESTIONS.csv Q004, priority HIGH]`. **Bible-internal inconsistency flagged:** §12's own tier table lists Intermediate at **$29,000** as if settled, while §5.2 correctly presents it as unresolved — §5.2 is the reconciled table and should control. |
| C9 | Tier unlock mechanism | **PARTLY RESOLVED** | Proficient = "Promising Studio Manager" award; First Class = "Highflying Moviemaker" award `[CORPUS Bible §5.2 — OFFICIAL Prima]`. **Intermediate's unlock is UNRESOLVED** `[CORPUS Q005, priority MEDIUM]`. |
| C10 | **One script at a time per Script Office building**; **up to five writers** per script | **CONFIRMED, high (Prima)** | `[CORPUS Prima verbatim, quoted §6.1]`; `[CORPUS Bible §12 "Capacity limits (new)"]`; `[CORPUS Bible §5.4]`. GameSpot's "at the outset… two scriptwriters" is corroborating-but-not-independently-confirming `[CORPUS Bible §12, moderate]`. |
| C11 | Writers assigned to a **genre room**, then a **script pool** | **CONFIRMED, high** | `[CORPUS OFFICIAL manual p.12 "Write a Script"]`; `[CORPUS Prima: "Five Genre Rooms: To begin a script in a specific genre, drop a scriptwriter into the corresponding room… Script Pool: Where writers go to write"]`; `[CORPUS DIRECTLY OBSERVED: Screenshot 12.01.45 PM tooltip "You can assign multiple writers to work on each script"]`. A single office serves all five genres. |
| C12 | **Richer scripts = more scenes/roles, more Stars/staff, cost more, take longer to shoot** | **CONFIRMED, high (Prima)** | `[CORPUS Prima, per-tier descriptions: Basic "one lead role, no more than one extra, and about three crew… take the shortest time to write and cost the least"; Intermediate "…take longer to write and more money to produce"; Proficient "two lead roles, two to three extras, and three crew and take longer to write and more money"; First Class "two or three lead roles, three to five extras, and three crew and take longer to write and more money"]`; `[CORPUS Bible §5.2]`. Note this is stated as **write** time and **produce** cost; a separate *shoot*-length claim is not independently quoted. See §8.11 flag (b). |
| C13 | Prima's **8-factor Script Quality model**, with internally inconsistent percentages | **CONFIRMED that the model is published; its percentages are internally inconsistent — reported, never cloned** | `[CORPUS Bible §5.7 — OFFICIAL Prima]`. Factors and stated caps: Total Scenes ≤2★/40% (caps at 15 scenes); Total Running Time ≤1/8★/3% (caps ~3 min); Set Variety ≤1★/20% (needs 10 set changes); Number of Lead Roles ≤1/2★/10% (caps at 3); Non-Lead Roles in Any Scene ≤1/2★/10% (caps at 5 distinct uses); Costume Changes ≤1/2★/10%; Average Set Quality ≤3/4★/12%; Average Scene Quality ≤3/5★/12%. **Two internal inconsistencies the Bible flags on the source itself:** (1) the percentages sum to **~117%**, not 100%; (2) "Average Set Quality: 3/4 star **or 12%**" is self-inconsistent — 3/4★ on a fifth-scale should be ~15%; 12% is what 3/5★ yields. Both are logged as data-quality flags on Prima, not resolved by guesswork. Caps independently re-confirmed in `[CORPUS Bible §32]`. |
| C14 | Competing simpler model | **UNRECONCILED — two competing accounts preserved** | Flat per-scene increments: generic scene +1/5★; structurally *appropriate* scene +2/5★ until overused; **Freeform removes the appropriateness bonus** `[CORPUS Bible §5.5, §5.7, §32 — GameSpot + IGN Wiki, moderate]`. The Bible explicitly refuses to merge this with Prima's weighted-caps model. |
| C15 | Short-script / repeat-scene penalties | **CONFIRMED, high (Prima)** | 1-scene scripts: scene-quality component halved (−50%); 2-scene: −25%; a scene reused within a script has each repetition's contribution halved `[CORPUS Bible §5.7]` |
| C16 | Hidden **1-100 per-set and per-scene Quality** values | **CONFIRMED, high (Prima), partly corroborated by IGN** | Sets: Rural Field 10, Rural Graveyard 55, Urban City Street 85, Wild West Bank 53, Stage 5. Scenes: "Ain't Over Yet" 90, "Screen Kiss" 75 `[CORPUS Bible §5.7]` |
| C17 | **Extras headcount** adds up to +0.5★, capped at 5 | **CONFIRMED, high (Prima)**; the *genre-experience* question is a live 2-vs-2 split | `[CORPUS Bible §5.7 — Prima + IGN say experience does NOT feed quality; GameSpot says it does, minorly. Not force-resolved.]` |
| C18 | Base-vs-expansion cap divergence | **UNRESOLVED candidate** | Prima base caps (15 scenes / 10 set changes) vs a Stunts&Effects-context GameFAQs guide (20+ / 15) `[CORPUS Bible §5.7, §32 — moderate]` |
| C19 | **AMM: genre-influenced random title OR player-written title** | **CONFIRMED, high (Prima), AMM-SCOPED ONLY** | Prima verbatim, AMM intro screen: *"**Movie Title** — Enter your own title or press the dice button for a randomly generated title. **The title you get is based partially on the genre you've chosen**, so set that before generating a random title."* And in the Genre section: *"The genre you choose impacts several factors: **randomly generated titles**, the film's structure if 'Detailed' structure is chosen…"* |
| C20 | **AMM: Simple / Detailed / Freeform** structures | **CONFIRMED, high (Prima)** | `[CORPUS Bible §32 — Prima verbatim: "You have three options of story structure: Simple … Detailed … Freeform"]` |
| C21 | Generated-then-**overridable** names is an established original pattern | **CONFIRMED, high (Prima)** — but for *character* names | `[CORPUS Prima verbatim: "Character names are randomly generated based on gender and genre but can be overridden."]` |
| C22 | Standard-pipeline scripts receive **generated, renamable** titles | **NOT CONFIRMED — Owner-recollection-only (see §9.2)** | Standard-pipeline films demonstrably *have* titles `[CORPUS DIRECTLY OBSERVED: "Atomic Ray Versus The Spidrons Of Doom", "The Baggage Boy", "Wake Up And Die Again", "Invaders From Communion 5"]`, and the standard path offers no naming step `[CORPUS OFFICIAL manual p.12 — drop a writer into a genre room; that is the whole input]`. **But no source states the game names them, and no source describes renaming.** Exhaustive grep for `rename`/`renaming`/`re-name` across the Bible, both Registers, the Comparative Design Register, all `THE-MOVIES-2005-ORIGINAL-DATA/*.csv` and the Prima OCR: **the only hit in the entire corpus is an unrelated line about screenshot filenames** `[CORPUS Bible line 3674]`. |
| C23 | **The script determines which SETS are required, and unbuilt/blocked sets HARD-BLOCK the shoot** | **CONFIRMED, high (Prima verbatim + manual + observed)** | `[CORPUS Prima verbatim: "**If you design a scene on a set that your studio doesn't own, you won't be able to shoot the movie until the set is constructed.**"]`; `[CORPUS Bible §32, Prima Stage 3: "requires a Director, Crew, and Extras all assigned, and **every Set the script calls for physically constructed on the lot**"]`; `[CORPUS Bible §7.1 "Set allocation" row: "The set(s) **the script calls for** must exist, be owned, and not be 'in red' … **Info bubble lists which sets the script requires** … Blocked by: set not yet built/owned, set in disrepair, another film already shooting on it" — OFFICIAL manual p.13]`; `[CORPUS Bible §7.3 hard blocks]`. **This is the corpus proof of the Owner's beat→set coupling hypothesis and it is at the highest source tier.** |
| C24 | Role model: **3 colour-coded lead mannequins + white extras + wood-grain OPTIONAL roles** | **CONFIRMED, high (Prima)** | `[CORPUS Bible §32 — Prima verbatim: "red, green, blue, white (extra), and wood grain (optional role)… Parts represented by wood mannequins will only appear in your finished film if Stars or extras are assigned to them."]`. Our engine has exactly three required cast slots and **no optional tier** `[CODE src/core/types.ts:18]` `[CODE src/core/worldgen.ts:577]`. |
| C25 | Travel distance is a **soft delay** on production | **CONFIRMED, high** | `[CORPUS Bible §7.3 — OFFICIAL manual pp.15, 21, 37: long travel "extend[s] the production time of your movie, delaying its completion and adding to the movie's cost"]`. Relevant to C2 theater/queues; **not** RSG V1 scope. |
| C26 | Writer salary | **RESOLVED, high (Prima)** | Flat **$1,000/year**, all staff except extras, unaffected by experience `[CORPUS Bible §12 "Salary — now resolved"]`. Consistent with speed-only: no pay premium for a veteran. |
| C27 | Surplus scripts are **sellable inventory** | **CONFIRMED, high** | `[CORPUS OFFICIAL manual p.17 "Star and Script Selling"; Bible §5.4, §12]`. Community strategy: keep writing constantly, ~90% unused. **Explicitly out of RSG V1 scope (§8.11).** |

**Bible-internal inconsistency to report (not resolve):** §12's Buildings-and-Tiers table
presents Intermediate at $29,000 and Proficient/First-Class ceilings as if settled, sourced
"PLAYER DOCUMENTED search synthesis, not independently corroborated"; §5.2 presents the
same rows with full three-source reconciliation and an explicit unresolved conflict on
Intermediate. **§5.2 controls.** Per the Owner's precedence instruction, Prima controls
where the Bible flags conflicting secondary accounts.

---

## 7. DETERMINISTIC TITLE GENERATION

### 7.1 The RNG utilities that exist

`src/core/rng.ts` provides `[CODE src/core/rng.ts:1-21]`:

- **`RngStream`** — sfc32, serializable, living on `GameState.rngState`
  `[CODE src/core/rng.ts:107-185]`. **The persisted sim stream**; consuming it advances
  save state.
- **`stream(seed, purpose, key)`** — a **stateless derived stream**:
  `RngStream.fromSeed(`${seed}::${purpose}::${key}`)` `[CODE src/core/rng.ts:187-191]`.
  Never threaded through save, so replays are exact without storing it.

`RngPurpose` is a closed union — a new purpose is a one-line additive widening
`[CODE src/core/rng.ts:34-52]`.

### 7.2 The purpose-keyed precedent Owner guardrail G names

Guardrail G — "purpose-keyed **versioned** deterministic streams (the `presence-v1`
precedent)" `[DOC 00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md:66-71]`. `presence-v1`
`[CODE src/core/rng.ts:49-52]` is isolated, versioned, derived-only, "read by a projection
that writes nothing, so presentation consumes zero simulation RNG and replay stays exact".
`casting-v1` and `discovery-v1` follow the same pattern `[CODE src/core/rng.ts:42-48]`.

### 7.3 Existing name/title generation — the pattern to follow

`generateConcepts` is the exact precedent `[CODE src/core/worldgen.ts:538-582]`:

- **One dedicated substream per field**, so adding or removing a field never shifts another
  field's draws `[CODE src/core/worldgen.ts:539-544]`.
- Word lists are **static TS modules consumed in declared array order**, never filesystem
  reads `[CODE src/core/data/wordlists.ts:1-11]`.
- Content is explicitly flavor: *"the `id` is the key, not the name, so collisions are
  harmless"* `[CODE src/core/data/wordlists.ts:7-11]`. **This sentence is the licence for
  both duplicate generated titles and player rename.**
- Talent names use the identical two-draw pattern `[CODE src/core/worldgen.ts:503-504]`.

Current title space: 48 × 60 = **2,880** combinations, **not genre-keyed**
`[CODE src/core/worldgen.ts:567-568]`.

`[CORPUS]` The original **did** key titles to genre — but **only the Advanced Movie-Maker
control is directly confirmed** (C19). See §9.2 for the Owner-mandated evidence
distinction.

### 7.4 Era-cleanliness constraints

**There is no calendar year anywhere in the engine.** Exhaustive grep of `src/` and
`ui/src/` for `1920` / `2040`: **zero matches**. `market.tick` is a bare integer week from
0 `[CODE src/core/types.ts:277]`, `TICKS_PER_YEAR: 52` `[CODE src/core/tuning.ts:48]`, and
`EraConfig`'s only live field is `costScale` — the other three are explicitly "inert data
here" `[CODE src/core/worldgen.ts:613-620]`, consumed nowhere but save validation
`[CODE src/core/save.ts:1478-1485]`.

`[PROPOSAL]` A title generator **must not** key on a year, decade or era label — no such
authority exists, and inventing one is exactly the blocking architecture the timeline law
forbids `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:31-32]`. The only era-clean keys are
**genre** and the **mint ordinal**. C4 owns era-sensitive premises `[DOC 00C §3]`.

---

## 8. `[PROPOSAL]` MINIMAL RSG V1 — THE MOVIE BLUEPRINT

> Everything in §8 is proposal. Nothing here is observed behaviour.
> Target shape per `[DOC 00D-OWNER-RSG-RESEARCH-NOTE-2026-08-18.md:33-46]`.

### 8.0 The blueprint field-by-field, against the code

The Owner's minimum blueprint contents, each mapped to what already exists:

| Blueprint field | Exists today? | Where it must live |
|---|---|---|
| Stable screenplay/concept ID | Yes — `FilmConcept.id` `[CODE src/core/types.ts:155]` | Reuse; new namespaced ids (§8.3) |
| Generated working title, player-renamable, identity unchanged | Title yes `[CODE src/core/types.ts:156]`; **rename no** (§4.2) | Rename writes `concept.title`; `generatedTitle` frozen in the new root (§8.6) |
| Genre | Yes — `FilmConcept.genre` `[CODE src/core/types.ts:157]` | Reuse. Player-chosen at mint. |
| **Story-beat structure** | **NO for genre skeleton; YES for the bend** — `FilmShape` is a 3-beat structure `[CODE src/core/types.ts:165-169]` with an authored per-slot option table `[CODE src/core/shape.ts:16-19]`, genre-agnostic | New: an authored genre→beat template table (§8.5) + a per-blueprint resolved beat list in the new root |
| Generated scene/beat requirements | **NO** | New root (§8.5) |
| **Required Set/location types** | **NO** — `scenery-load-in` is a contentless blocker `[CODE src/core/types.ts:568-571]` `[CODE src/core/operations.ts:274-279]` | New root, derived from beats (§8.7) |
| Role requirements | Yes — `roleRequirements` + `requiredSlots` `[CODE src/core/types.ts:161-162]`, consumed at `[CODE src/core/filmPackage.ts:269]`. Capped at 3 slots by the `CastSlot` union `[CODE src/core/types.ts:18]` | Reuse; per-beat role emphasis is a **C4 stretch**, not V1 |
| FilmShape / creative direction | Yes — chosen at commission, stored on the project `[CODE src/core/types.ts:623]`, resolved by `resolveShape` `[CODE src/core/shape.ts:149]` | Reuse **unchanged** |
| Script Quality / office ceiling | Partly — `developmentOfficeEstUplift` is an **uplift**, not a ceiling `[CODE src/core/facilityEffects.ts:94-102]` `[CODE src/core/tuning.ts:790-792]` | Reuse as-is in V1; ceiling-vs-uplift is an Owner decision (§11.2) |
| Writer attribution | Partly — `ScriptProject.writerId` `[CODE src/core/types.ts:622]` and the frozen `FilmParticipants.writer` `[CODE src/core/types.ts:217-222]` | Add `writerId` to the origin record so attribution survives the project's own lifecycle |

**Net: five of ten already exist; three more are cheap; two are genuinely new (beats,
required sets) and are exactly the C2 coupling the Owner wants.**

### 8.1 The new root (V14) — shape

```ts
// NEW root. Frozen leaves untouched; FilmConcept gains no field.
export type BeatId = string           // e.g. 'intro' | 'shock' | 'pursuit' | …
export type SetTypeId = string        // authored location vocabulary, C2-owned

export type BlueprintBeat = {
  index: number                       // 0-based position in the genre template
  beatId: BeatId                      // which template beat this is
  setTypeId: SetTypeId                // the location this beat needs  ← the set-demand source
}

export type MovieBlueprint = {
  conceptId: string                   // 'concept-orig-0000' — the permanent identity
  ordinal: number
  mintedWeek: number
  projectId: string                   // the ScriptProject that produced it
  writerId: string                    // writer attribution
  generatedTitle: string              // immutable provenance
  renamedWeek: number | null
  beats: BlueprintBeat[]              // the resolved story-beat structure
  officeTierAtMint: number            // the EST uplift in force when written (audit trail)
}

export type OriginalScreenplays = {
  mode: 'legacy' | 'managed'
  nextOrdinal: number                 // explicit monotonic counter — NEVER derived from length
  blueprints: MovieBlueprint[]
}

// GameStateV14 = GameStateV13 & { originalScreenplays: OriginalScreenplays }
```

**Why `mode`:** mirrors `ScriptDevelopment` / `CastingSessions` / `StudioOperations`
`[CODE src/core/types.ts:636-639, :719-722, :581-585]`, letting V13→V14 land
`{ mode:'legacy', nextOrdinal: 0, blueprints: [] }` — empty, byte-identical.

**Why `nextOrdinal` is explicit:** an explicit counter survives any future filtering or
archival without re-minting an id — the same reasoning behind the collision-safe production
allocator `[CODE src/core/actions.ts:155-167]`.

**Why `beats[]` lives here and not on `FilmConcept`:** `FilmConcept` is a frozen leaf with
an empty optional-key list `[CODE src/core/save.ts:1379-1395]`. This is not a preference.

**Difficulty: EASY** (root) **/ MEDIUM** (invariants).

### 8.2 Where the generated concept itself lives — the pivotal recommendation

**Append it to `state.concepts` with a namespaced id.** Do **not** build a parallel concept
store.

Justification, all observed:
- Save validation permits it: exact keys per element, unique ids, **no count assertion**
  `[CODE src/core/save.ts:2000-2006]`.
- No code hard-codes the id format (§3.1, exhaustive grep, zero matches).
- All 15 iteration surfaces and all 11 lookup surfaces (§2.3) open **for free**.
- The alternative means rewriting eleven `state.concepts.find(...)` sites in core plus the
  adapter, each of which currently **throws** on an unresolved id.

**Guardrail 8 check** — "never write studio-relative facts onto shared-world entities
(Talent, FilmConcept, MarketState)" `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:26-27]`.
Satisfied: the appended `FilmConcept` carries **only world-shaped facts** — the same eight
fields a worldgen concept carries. Every studio-relative fact (writer, project, mint week,
rename) lives in `MovieBlueprint`. This is precisely why the blueprint record must exist
rather than widening `FilmConcept`.

**Difficulty: EASY** (append) **/ MEDIUM** (lockstep invariant).

### 8.3 Id scheme

`` `concept-orig-${String(ordinal).padStart(4,'0')}` `` → `concept-orig-0000`, …

- Namespaces cleanly against `c-NN` — guardrail 2 `[DOC 00B:14-15]`, Owner ruling §3
  `[DOC 00C:32-33]`.
- Lexicographic order: pool concepts first, then mint order (§3.1).
- Minting **must reserve against** the five roots in §3.3 via a new
  `persistedConceptIds(state)` modelled on `persistedProductionIds`
  `[CODE src/core/productionIdentity.ts:8-38]`.

**Difficulty: EASY.**

### 8.4 The mint action flow — and WHEN identity is minted

**Recommendation: mint at COMMISSION, not at accept.** The alternative is architecturally
blocked.

`ScriptProject.conceptId` is a **required non-null string in the FROZEN V9 save shape**
`[CODE src/core/types.ts:621]` `[CODE src/core/save.ts:2730-2749]`. Deferring the concept
to accept would require making it nullable — a frozen-leaf widening
`[DOC 00B:19-21]` — **and** would break every surface that names in-flight work:
`activeScriptWriterAssignments` throws on an unknown concept
`[CODE src/core/scriptDevelopment.ts:657-661]`, `requireConceptTitle` throws
`[CODE src/core/studioCalendar.ts:216-221]`, the invariant requires a resolvable concept
`[CODE src/core/scriptDevelopment.ts:876-877]`, and the lot workspace requires a title
`[CODE ui/src/lot/snapshot/scriptCommission.ts:329-331]`.

**On cancellation risk: there is none to design around.** No abandon or delete verb exists
for a script project (§2.1). A concept minted at commission can never be orphaned. If C2
later adds an abandon verb, the concept simply returns to the unclaimed pool.

Proposed action:

```ts
| { kind: 'commissionOriginalScreenplay'
    ; writerId: string
    ; genre: Genre                 // the player's creative direction
    ; shape: FilmShape             // the existing form already collects this
    ; promise: Promise }
```

Flow — one `applyActions` case, reusing existing machinery:
1. Reuse every gate `applyCommissionScript` already enforces
   `[CODE src/core/actions.ts:1527-1543]`.
2. Mint `conceptId` from `nextOrdinal`, reserved against `persistedConceptIds(state)`.
3. Build the `FilmConcept` from purpose-keyed derived substreams (§8.8).
4. Resolve the genre beat template into `beats[]`, assigning each beat its `setTypeId`
   (§8.5, §8.7).
5. Append the concept; append the blueprint; increment `nextOrdinal`.
6. Call the **existing** `commissionScriptProject(...)` unchanged
   `[CODE src/core/scriptDevelopment.ts:232-290]` — it allocates the slot, sets
   `dueWeek = week + 1`, marks the writer busy. **No new draft machinery.**
7. Run existing `assertCurrentScriptState` `[CODE src/core/actions.ts:1469-1486]` plus a new
   `assertMovieBlueprintInvariants`.

From step 6 onward the entire pipeline is untouched.

**Difficulty: MEDIUM.**

### 8.5 Story-beat structure — genre supplies the skeleton

`[PROPOSAL]` Author a static, version-controlled beat-template table beside
`src/core/data/wordlists.ts`, following the same "TS module, declared order, never
filesystem" discipline `[CODE src/core/data/wordlists.ts:1-11]`:

```
BEAT_TEMPLATES: Record<Genre, readonly BeatId[]>
```

**Corpus floor, then modernize** `[DOC 00D:48-50]`. The five original 7-beat templates are
recovered verbatim (C3). Our engine ships **six** genres `[CODE src/core/types.ts:9]`:

| Our genre | Original template available? | V1 authoring basis |
|---|---|---|
| `comedy` | **YES** — Intro→Problem→Pursuit→Challenge→Preparation→Conflict→Resolution `[CORPUS Bible §5.5]` | Direct transcription |
| `romance` | **YES** — Intro→Meeting→Problem→Time Apart→Reunion→Argument→Resolution | Direct transcription |
| `horror` | **YES** — Intro→Shock→Pursuit→Encounter→Preparation→Big Fight→Resolution | Direct transcription |
| `drama` | **NO original template** | Must be **authored**. Nearest structural relative is Romance (relationship/reversal spine), but the corpus does not license the mapping. |
| `crime` | **NO original template** | Must be **authored**. Nearest relatives: Action (Skirmish→Investigate→Fight→Prepare→Battle) supplies an investigate/confront spine; the corpus does not license the mapping. |
| `adventure` | **NO original template** | Must be **authored**. Nearest relatives: Action and Sci-Fi (Encounter→Survey→Pursuit→Showdown). Not licensed. |

**Genre vocabulary constraint honoured** `[DOC 00D:54-59]`
`[DOC THE-MOVIES-PARITY-MASTER-PLAN.md:98, :580-581]`: **do not change the vocabulary.**
The original's five are the *shape floor*; the three genres with no original template
(`drama`, `crime`, `adventure`) get **newly authored** 7-beat templates in the same
grammar, explicitly marked in the data file as authored-not-recovered so no future reader
mistakes them for corpus. **The original's Action and Sci-Fi templates have no home in our
six-genre vocabulary and are recorded as unused reference shapes, not imported.**

`[PROPOSAL]` **Use 7 beats, not the simplified 4.** The 7-beat templates are fully
recovered at OFFICIAL tier (C3); the 4-beat variant's beats are **unrecovered and an ACTIVE
open question** `[CORPUS Q036]`. Inventing them would be exactly the fabrication the
Owner's evidence discipline forbids.

**Deliberately NOT in V1:** scene counts, the appropriateness bonus (C14), Simple/Detailed/
Freeform structure choice (C20 — that is Advanced Movie-Maker, explicitly out of bounds
`[DOC 00D:48-50]`), and Prima's 8-factor scoring model (C13 — its own percentages are
internally inconsistent; cloning it is forbidden and re-deriving it is a quality-model
project, not a supply project).

**Difficulty: MEDIUM** (authoring six templates + the three-genre gap is a design call, not
a transcription).

### 8.6 Rename action

```ts
| { kind: 'renameScreenplay'; conceptId: string; title: string }
```

**Recommendation: rename WRITES `FilmConcept.title` in place**; the blueprint retains
`generatedTitle` immutably plus `renamedWeek`.

Why: `FilmConcept.title` is the **single stored display authority**, read live by all 21
surfaces in §4.3-A. Writing it is one write site and **zero read-site changes**. The
alternative (an override plus a resolver) means touching all 21.

Constraints:
- Only concepts with a `MovieBlueprint` may be renamed in V1 (pool concepts are authored
  world data). One-line predicate to relax later.
- Trimmed, non-empty, bounded, no control characters — `v8String(..., true)` already
  rejects empty at the save boundary `[CODE src/core/save.ts:1397]`.
- Uniqueness is **not** required — worldgen already permits duplicate titles by design
  `[CODE src/core/data/wordlists.ts:7-11]`.
- Invariant: `renamedWeek === null ⇒ concept.title === generatedTitle`.
- The two frozen-history surfaces (§4.3-B) keep the old title. State it; do not "fix" it.

**Difficulty: EASY** (action) **/ MEDIUM** (proving it against all 21 surfaces — §4.3 is
the checklist).

### 8.7 Beat → Set coupling (the C2 payoff)

**Corpus authority is at the highest tier (C23):** the script determines which sets are
required; an unowned, in-disrepair, or occupied set **hard-blocks** the shoot; and the game
**shows the player which sets the script requires**.

**Code seam is already cut and empty:** `ProductionBlocker` has a `scenery-load-in` variant
carrying only a `taskId` `[CODE src/core/types.ts:568-571]`; `assignShootingDirector` sets
it unconditionally `[CODE src/core/operations.ts:274-279]`; `clearSceneryLoadIn` is a
player button with no resource behind it `[CODE src/core/operations.ts:281-300]`. There is
a `set-scenery` capability and a Scenery Shop facility with capacity 2
`[CODE src/core/operations.ts:29]` `[CODE src/core/types.ts:527]`, but nothing names *what*
scenery.

`[PROPOSAL]` **The blueprint's beats are the source of set demand.** Concretely:

1. Each `BlueprintBeat` carries a `setTypeId` from an authored C2 location vocabulary,
   assigned deterministically at mint from `(genre, beatId)` plus a purpose-keyed draw.
2. **Set demand is a DERIVED READ MODEL** — `requiredSetTypes(blueprint)` = the distinct
   `setTypeId`s across beats. **It is never written onto `FilmConcept`**, satisfying the
   charter's own binding `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:42]`.
3. The package/greenlight surfaces publish that list with owned/unowned status — the
   engine equivalent of the original's "info bubble lists which sets the script requires"
   `[CORPUS Bible §7.1]`.
4. The reservation queue consumes it: an unbuilt or occupied required set becomes a
   **named, actionable blocker** with the four-facts-plus-remedy shape
   `[DOC 00C §4]` — replacing today's contentless `scenery-load-in`.
5. **Set variety follows for free**: distinct `setTypeId` count is the natural, already-
   corpus-shaped analogue of Prima's "Set Variety" factor (C13) — without cloning its
   inconsistent percentages.

**Interface boundary:** the *reservation and occupancy* half of this belongs to the Sets/
Stages lanes (01/02/06) and their `docs/c2-planning/` reports; **lane 14 owns only the
production of the demand list.** The architect must join them so the vocabulary
(`SetTypeId`) is authored once. `[CORPUS]` note: no original source recovered a
scene→set mapping table `[DOC docs/c2-planning/03-original-sets-dataset.md:48]` — the
mapping is ours to author, and the beat structure is the honest place to hang it.

**Difficulty: MEDIUM** (demand derivation) **/ HARD** (the queue/reservation consumption —
but that is lanes 01/02/06's work, not lane 14's).

### 8.8 Deterministic generation

New purpose per guardrail G `[DOC 00C:66-71]`:

```
RngPurpose += 'screenplay-v1'

key = conceptId                       // 'concept-orig-0000' — stable, ordinal-derived
stream(seed,'screenplay-v1', `${conceptId}:title`)        → 2 draws: lead idx, noun idx
stream(seed,'screenplay-v1', `${conceptId}:strength`)     → truncatedNormal(60,15,20,95)
stream(seed,'screenplay-v1', `${conceptId}:originality`)  → truncatedNormal(55,20,5,100)
stream(seed,'screenplay-v1', `${conceptId}:roles`)        → per SLOT_ORDER (target axes, tolerance)
stream(seed,'screenplay-v1', `${conceptId}:beats`)        → per-beat setTypeId selection
// baseNegativeCost derived from strength (§8.9) — NOT an independent draw
```

Properties, all matching shipped precedent:
- **Derived-only** → never advances `state.rngState` → §15.7 replay-exactness and M0A
  byte-identity preserved `[CODE src/core/rng.ts:16-19, :187-191]`.
- **One substream per field** `[CODE src/core/worldgen.ts:539-544]`.
- **Versioned `-v1`** `[CODE src/core/rng.ts:42-52]`.
- **Keyed on the mint ordinal, never a week or year** → era-clean (§7.4).
- **Reuses `TITLE_LEAD`/`TITLE_NOUN` unchanged** `[CODE src/core/data/wordlists.ts:39-62]`.
- Genre is the **player's choice**, not a draw.

`[PROPOSAL]` **Genre-keyed titles are corpus-correct (C19) but should NOT be V1**: five
genre-keyed word lists is authored content, the class of scope the ruling fences to C4.
Record it as a sourced deferral, not an oversight. **If the Owner wants it in V1**, the
cheapest honest version is a genre-keyed *lead-word subset* over the existing 48 leads —
no new vocabulary, one extra table.

**Difficulty: EASY.**

### 8.9 Save / migration implications

- **V13 → V14**: add exactly one root, landing **empty** → byte-identical for every
  existing save (V14-complete-at-M1 rule). Follow the V12→V13 pattern exactly: strip the
  new key, delegate the remainder to the frozen prior validator, then validate the new root
  `[CODE src/core/save.ts:3648-3688]` `[CODE src/core/save.ts:5076-5086]`.
- **`V14_STATE_KEYS = [...V13_STATE_KEYS, 'originalScreenplays']`**, mirroring
  `[CODE src/core/save.ts:3530]`.
- **`FilmConcept` gains no field** `[CODE src/core/save.ts:1379-1395]`.
- **New invariants:** every blueprint's `conceptId` resolves in `state.concepts`;
  `ordinal === index` and `nextOrdinal === blueprints.length`; no minted id collides with a
  `c-NN`; `renamedWeek === null ⇒ title === generatedTitle`; every `projectId` resolves and
  that project's `conceptId` matches; `beats` non-empty, `index` contiguous from 0, each
  `beatId` a member of `BEAT_TEMPLATES[concept.genre]` in order, each `setTypeId` in the
  authored vocabulary.
- **`state.concepts` remains append-only.** Nothing may ever remove a concept — released
  films, open theatrical runs and produced projects hold `conceptId` forever (§3.3), and
  save validation hard-fails on an unresolvable production/film conceptId
  `[CODE src/core/save.ts:1213-1215, :1534-1536]`.

**⚠ THE ONE TRAP — `correlateConceptCost`.** `[CODE src/core/employment.ts:385-401]` is a
whole-pool rank permutation of **every** concept's `baseNegativeCost`, run once at
`beginFounding` `[CODE src/core/employment.ts:415]`. Re-running it after appending would
change every existing concept's cost → every in-flight production's `requiredNegative`
`[CODE src/core/forecast.ts:144]` `[CODE src/core/reception.ts:246]` → `budgetAdequacy` and
realized reception **for films already greenlit against a locked forecast**. RSG V1 **must**
set a minted concept's `baseNegativeCost` directly, derived deterministically from its own
`baselineStrength` so the cost↔potential correlation is correct **by construction**, and
must never touch the pool. Write this as an explicit contract prohibition, backed by a test.

**Difficulty: MEDIUM.**

### 8.10 What the 30 pool concepts become

**Seed data — fully commissionable, unchanged, forever.**

- Generation untouched `[CODE src/core/worldgen.ts:538-582]`; `conceptCount: 30` stays
  `[CODE src/core/tuning.ts:880]`; the test still passes
  `[CODE tests/worldgen.test.ts:87-90]`.
- Existing `c-NN` ids permanent — guardrail 2 `[DOC 00B:14-15]`, ruling §3 `[DOC 00C:32-33]`.
- Historical saves keep reconstructing: `originalScreenplays` migrates in empty.
- `[PROPOSAL]` **A pool concept has no blueprint** — no beats, no required sets. That is a
  real asymmetry the architect must rule on. Two options: (a) pool concepts stay
  beat-less and take today's contentless `scenery-load-in` path (simplest, but two
  production behaviours coexist); (b) a **derivation-on-commission** step gives a pool
  concept a blueprint from its genre when it is first commissioned, so every managed
  production has beats. **Recommended: (b)** — one production path, and it makes the pool
  concepts genuinely "templates" as the Owner's framing says `[DOC 00C:29-30]`, at the cost
  of one extra mint path. Rate: **MEDIUM.**
- Genre-keyed premises and era sensitivity remain C4 `[DOC 00C §3]`.

**Difficulty: EASY** (a) **/ MEDIUM** (b, recommended).

### 8.11 Scope flags — what must fence to C4 or a separate milestone

| Item | Verdict | Why |
|---|---|---|
| **(a) Multi-writer-per-script acceleration** (up to five writers, C10) | **OUT of V1** | The corpus fact is confirmed at high tier, but our throughput story is already told by **offices**: one active task per writer + one slot per office = "more writers/offices = more throughput", which is the Owner's actual requirement `[DOC 00C:26]`. Implementing pooling means `ScriptProject.writerId` → a writer **set** — a **frozen V9 leaf widening** `[CODE src/core/types.ts:622]` `[CODE src/core/save.ts:2730-2749]` — plus variable draft length (§5.4), plus a rewrite of the one-writer-one-task invariant `[CODE src/core/scriptDevelopment.ts:970-984]` and the busy-set `[CODE src/core/employment.ts:102-121]`. Three frozen-shape changes for a refinement. **Recommend: record as a named C3/C4 candidate.** |
| **(b) "Richer scripts take longer to shoot"** (C12) | **OUT of V1 — collides with a shipped clock** | `TUNING.PRODUCTION_TICKS = 8` `[CODE src/core/tuning.ts:49]` is the audited, fixed production window: set at greenlight `[CODE src/core/actions.ts:443]`, read by the fixed-cost allocator's production window `[CODE src/core/fixedCostAllocation.ts:34, :160]`, by the runway model `[CODE src/core/economyView.ts:219]`, and by construction-progress reasoning `[CODE src/core/construction.ts:269, :290]`. Variable shoot length would move all four. **Richer-script demand must land as beat/role/set-demand richness and COST, never as clock changes**, unless the Owner separately reopens the clock. |
| **Prima's 8-factor quality model** (C13) | **OUT of V1** | Its own percentages sum to ~117% and one row is internally self-inconsistent. Cloning is forbidden; re-deriving is a quality-model project. |
| **Scene counts / appropriateness bonus** (C14) | **OUT of V1** | Competing unreconciled accounts (Prima weighted-caps vs GameSpot per-scene increments), and it drags in Advanced Movie-Maker semantics. |
| **Simplified 4-beat templates** (C4) | **OUT — cannot be built honestly** | The beats are unrecovered `[CORPUS Q036]`. |
| **Simple/Detailed/Freeform structure choice** (C20) | **OUT** | Advanced Movie-Maker; explicitly out of bounds `[DOC 00D:48-50]`. |
| **Office tier as a hard CEILING** rather than an uplift | **OWNER DECISION, not V1 by default** | Ours is an uplift by a recorded, deliberate choice `[CODE src/core/tuning.ts:790-792]`. Converting to a ceiling re-tunes every existing script EST. |
| **The writer-experience inversion** (§6) | **OWNER DECISION** | Removing the `0.4·writing` term re-tunes every EST and every downstream acceptance test. |
| **Optional ("wood-grain") role tier** (C24) | **OUT of V1** | `CastSlot` is a frozen three-member union `[CODE src/core/types.ts:18]`; `requiredSlots` can only shrink. |
| **Script selling / a script market** (C27) | **OUT** | Not in the ruling; needs a new ledger kind. |
| **Era-sensitive premises, evolving genre interest, research** | **C4** | `[DOC 00C §3]`; also impossible today — no calendar year exists (§7.4). |
| **Renaming pool concepts** | **DEFER** | One-line predicate; wait for the Owner. |
| **Abandon / shelve a screenplay** | **OUT** | Needs an eighth `ScriptProjectStatus` — a frozen V9 enum widening `[CODE src/core/save.ts:2753-2755]`. |
| **A lifetime cap** | **FORBIDDEN** `[DOC 00C:26]` | The counter must be unbounded. `state.concepts` grows without bound and eleven lookups are O(n) linear scans — record it against ruling §11's performance-awareness posture `[DOC 00C:72-74]`; do not optimize now. |

### 8.12 The exact list of closed surfaces that must OPEN

| # | Surface | Required change | Difficulty |
|---|---|---|---|
| O1 | `[CODE src/core/scriptReadModel.ts:548-555]` `no-concepts` blocker | Stop being terminal; route to original commission | EASY |
| O2 | `[CODE src/core/scriptReadModel.ts:37-48]` blocker-kind enum | New kinds (original-commission gate; **unbuilt-required-set**) | EASY |
| O3 | `[CODE ui/src/lot/snapshot/scriptReview.ts:179]` / `[CODE ui/src/lot/snapshot/castingReview.ts:194]` | Mirror any new blocker kind | EASY |
| O4 | `[CODE src/core/scriptReadModel.ts:126-130]` `CommissionConceptView` | `origin` flag + required-set summary | EASY |
| O5 | `[CODE ui/src/lot/snapshot/scriptCommission.ts:537-545]` exact-key mirror of O4 | Lockstep or the workspace **silently rejects the board** | **MEDIUM — easy to miss** |
| O6 | `[CODE ui/src/screens/WritersRoom.tsx:253-259]` | "Commission an original" affordance + genre picker | MEDIUM |
| O7 | `[CODE src/core/types.ts:1260-1297]` `Action` union | Two new verbs | EASY |
| O8 | `[CODE src/core/save.ts:3530]` + validator chain | V14 | MEDIUM |
| O9 | `[CODE src/core/productionIdentity.ts]` | New sibling `persistedConceptIds` | EASY |
| O10 | `[CODE src/core/rng.ts:34-52]` `RngPurpose` | `+ 'screenplay-v1'` | EASY |
| O11 | `[CODE src/core/types.ts:568-571]` `ProductionBlocker` + `[CODE src/core/operations.ts:274-300]` | `scenery-load-in` gains set identity, or a new required-set blocker joins it | **MEDIUM/HARD — shared with lanes 01/02/06** |
| O12 | `[CODE src/core/filmPackage.ts:269]` package readiness | Required-set readiness alongside unfilled roles | MEDIUM |
| O13 | `[CODE src/core/studioRunRecap.ts:376-380]` `minConcept` | **No code change**; name the behaviour drift in the contract | EASY |
| O14 | `[CODE src/core/candidates.ts:201, :236]` | **No code change**; assert in a test that the headless corpus never mints | EASY |
| O15 | `[CODE src/core/employment.ts:415]` `correlateConceptCost` | **No code change — explicit prohibition + regression test** (§8.9) | MEDIUM |

---

## 9. CORPUS SWEEP — CONFIRMED vs OWNER-RECOLLECTION-ONLY

The Owner explicitly required this distinction be preserved `[DOC 00C:34-37]`
`[DOC 00D:94-99]`.

### 9.1 CONFIRMED by the corpus, independent of the Owner

See the full verification table in **§6A** (C1-C27). In summary, confirmed at OFFICIAL /
Prima-controlled tier: auto-generated scripts from Script Office writers; five genres; the
five 7-beat templates verbatim; genre rooms + script pool; one script per office building;
five writers per script; four office tiers with tier = quality ceiling; writer
experience/count = speed only; richer scripts = more scenes/roles/cost; the 8-factor model's
existence and its two internal inconsistencies; AMM genre-influenced random titles OR
player-typed titles; Simple/Detailed/Freeform; generated-and-overridable character names;
**and the script→required-set hard-block** (C23) at the highest tier.

Confirmed at contemporary/moderate tier only: AI writers stopping at the minimum viable
scene count (C6); the per-scene appropriateness bonus (C14).

### 9.2 OWNER-RECOLLECTION-ONLY — recorded exactly as the Owner instructed

**The genre-sensitive random-title control is directly confirmed for the ADVANCED
MOVIE-MAKER ONLY** `[CORPUS Prima verbatim, C19]`.

**The Owner's firsthand memory that normal writer-generated scripts ALSO received
renamable generated titles is NOT upgraded to documentary fact here.** Evidence status:

| Sub-claim | Status |
|---|---|
| Standard-pipeline films have titles | **CONFIRMED** `[CORPUS DIRECTLY OBSERVED: four distinct film titles across screenshots]` |
| The standard path offers the player no naming step | **CONFIRMED by omission** `[CORPUS OFFICIAL manual p.12 — drop a writer into a genre room is the entire input]` |
| Therefore the game generated those titles | **STRONGLY IMPLIED, NEVER STATED.** No source says so. |
| The player could rename a written script | **NO EVIDENCE AT ALL.** Exhaustive grep for `rename`/`renaming`/`re-name` across the Bible, both Registers, the Comparative Design Register, every `THE-MOVIES-2005-ORIGINAL-DATA/*.csv`, and the extracted Prima OCR: the only hit in the entire corpus is an unrelated line about screenshot filenames `[CORPUS Bible line 3674]`. |
| Nearest licensed precedents | AMM "Enter your own title or press the dice button" (C19); "Character names are randomly generated based on gender and genre but **can be overridden**" (C21); AMM Stage 5 export "name the project" `[CORPUS Bible §7.0, §32]`. |

**Recorded status, per Owner instruction:** *the successor design adopts generated +
renamable titles for the standard pipeline as an **Owner ruling**, with the Advanced
Movie-Maker title control as the documented precedent.* Not a reconstruction of an observed
standard-path mechanic.

**Corpus gap worth logging:** `ACTIVE-UNRESOLVED-QUESTIONS.csv` (70 rows, all swept) has
**no row** on title generation or renaming. Its script-system rows are Q004 (Intermediate
office cost, HIGH), Q005 (its unlock), Q014 (Lead Roles wedge sub-slots), Q015 (crew/extras
cap), Q036 (4-stage template beats), Q051 (novelty vs originality), Q068 (tutorial wording).
`[PROPOSAL]` Add a row: *"Can an auto-generated script's title be renamed on the standard
path?"* — the corpus never asked it.

---

## 10. RISKS, GAPS, AND CONTRADICTIONS

1. **⚠ CONTRADICTION — writer experience.** Prima-controlled corpus law and the Bible's own
   successor ruling say *speed only, never quality* `[CORPUS §6.1]`. Shipped C1 does the
   exact inverse `[CODE src/core/scriptDevelopment.ts:352-362, :284]`. **Recorded in no repo
   doc.** Not resolved here. Owner decision §11.1.

2. **⚠ TRAP — `correlateConceptCost`.** Re-running after appending silently re-prices every
   concept and changes realized reception for already-greenlit films
   `[CODE src/core/employment.ts:385-401, :415]` `[CODE src/core/reception.ts:246]`. Needs
   an explicit prohibition and a regression test.

3. **⚠ SILENT-FAILURE SURFACE.** Adding a field to `CommissionConceptView` without updating
   `[CODE ui/src/lot/snapshot/scriptCommission.ts:537-545]` makes the lot workspace reject
   the board with no obvious error (O5).

4. **⚠ CLOCK COLLISION.** The corpus's "richer scripts take longer to shoot" (C12) collides
   with `PRODUCTION_TICKS = 8` `[CODE src/core/tuning.ts:49]`, load-bearing in four modules
   `[CODE src/core/actions.ts:443]` `[CODE src/core/fixedCostAllocation.ts:34, :160]`
   `[CODE src/core/economyView.ts:219]` `[CODE src/core/construction.ts:269, :290]`.
   Fenced out of V1 (§8.11b).

5. **⚠ CORPUS GAP — three genres have no original beat template.** `drama`, `crime`,
   `adventure` `[CODE src/core/types.ts:9]` have no recovered template (§8.5). Their beats
   must be **authored and labelled as authored**. The original's Action and Sci-Fi templates
   have no home in our vocabulary. `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md:580-581]` fences
   the 6-vs-5 question to C4 — RSG V1 must not "fix" it.

6. **UNDOCUMENTED CEILING.** The 30-film campaign ceiling and the terminal `no-concepts`
   blocker appear in **no** `docs/` file; the only near-mentions describe the headless corpus
   `[DOC docs/rev4-open-questions.md:297]` `[DOC docs/HANDOFF.md:1476]`.

7. **FROZEN-LEAF PRESSURE.** `FilmConcept` has zero optional fields and an empty optional-key
   list `[CODE src/core/save.ts:1379-1395]`. The first instinct — "add `beats`/`origin` to
   `FilmConcept`" — is a guardrail-4 violation. Say so before someone tries it.

8. **BIBLE-INTERNAL INCONSISTENCY.** §12's tier table presents Intermediate at $29,000 as
   settled; §5.2 correctly presents it as an unresolved ~3-vs-3 split `[CORPUS Q004, HIGH]`.
   §5.2 controls. Reported, not resolved.

9. **RENAME vs FROZEN HISTORY.** A rename will not update `TalentCareerEvent.filmTitle`
   `[CODE src/core/types.ts:1234]` or a `BroadcastItem.template`
   `[CODE src/core/broadcast.ts:288-300]`. Defensible; will be reported as a bug unless
   stated.

10. **HEADLESS DETERMINISM.** `candidates.ts` draws a concept index from the **persisted sim
    stream** `[CODE src/core/candidates.ts:236]`. Growing `state.concepts` changes agent
    behaviour per seed. Safe only because M0A never founds — a consequence, not a guarantee.
    Needs a test.

11. **LINEAR SCANS.** Eleven concept lookups are `Array.prototype.find` over
    `state.concepts` (§2.3-B). Fine at 30; record it against ruling §11
    `[DOC 00C:72-74]` for an unbounded campaign. Do not optimize now.

12. **INTERFACE DEPENDENCY.** §8.7's set-demand consumption belongs to lanes 01/02/06. If
    those lanes land a different `SetTypeId` vocabulary, RSG V1's beats point at nothing.
    **The architect must join the vocabularies before either milestone starts.**

13. **`pad2` is 2-wide** `[CODE src/core/worldgen.ts:163-165]` — harmless under the proposed
    4-wide namespaced scheme; a latent trap if `conceptCount` ever exceeds 99.

---

## 11. OWNER DECISIONS NEEDED

1. **The writer-experience inversion (§6).** Corpus (Prima-controlled) says *speed only,
   never quality*; C1 ships the inverse. Options: (a) accept the divergence and record it as
   a deliberate successor choice — cheapest, zero risk to RSG V1; (b) invert it inside RSG V1
   — re-tunes every script EST and relaxes a shipped invariant; (c) fence to a separate ruled
   milestone. **Recommended: (a) or (c). Not (b).**

2. **Office tier: uplift or hard ceiling?** Ours is an additive uplift by a recorded,
   deliberate choice `[CODE src/core/tuning.ts:790-792]`; the original's is a hard ceiling
   (C7/C8). Converting re-tunes every EST. **Recommended: keep the uplift in V1.**

3. **Beat templates for `drama`, `crime`, `adventure`.** No corpus template exists (§8.5).
   Authored by the architect, or deferred with those three genres temporarily using a neutral
   7-beat spine? **Recommended: author all six now, label the three as authored-not-recovered.**

4. **Do pool concepts get blueprints?** (§8.10) Option (a) beat-less pool concepts + two
   production paths, or (b) derive a blueprint on first commission so there is one path.
   **Recommended: (b).**

5. **Rename scope.** Generated concepts only (V1 recommendation), or pool concepts too? And
   may a film be renamed **after release**, accepting that career records and press clippings
   keep the old title (§4.3-B)?

6. **Genre-keyed titles in V1?** Corpus-correct for AMM (C19) but requires authored per-genre
   vocabulary. **Recommended: out of V1**; a genre-keyed lead-word *subset* over the existing
   48 leads is the cheap compromise if the Owner wants it.

7. **Multi-writer pooling** (§8.11a) — confirm OUT of V1. Three frozen-shape changes for a
   refinement; "more offices = parallel scripts" already delivers the Owner's throughput
   sentence.

8. **What replaces the terminal `no-concepts` blocker?** Does the 30-concept pool remain a
   *finite premium* the player can exhaust (recommended — it makes the original path
   meaningful), or should exhaustion become invisible?

9. **Provenance visibility.** Should the player see which screenplays their studio wrote vs
   which came from the world pool? This is the difference between "a writer goes to work and
   hands me a new movie" landing as a felt achievement or as invisible plumbing.
   **Recommended: yes (O4/O5).**

10. **Corpus record-keeping.** Add a row to `ACTIVE-UNRESOLVED-QUESTIONS.csv` for the
    never-asked question *"can an auto-generated script's title be renamed on the standard
    path?"* (§9.2)?

---

*End of Lane 14 report.*
