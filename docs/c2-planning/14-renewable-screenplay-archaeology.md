# LANE 14 — FILMCONCEPT & COMMISSION ARCHAEOLOGY FOR RENEWABLE SCREENPLAY GENERATION V1

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **Read-only research. No implementation. No file outside this one was touched.**
>
> Subject: Owner ruling `00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md` §3 —
> *Renewable Screenplay Generation V1* (RSG V1).
>
> **Tagging discipline (brief rule 4).** Every claim carries exactly one of:
> `[CODE]` observed in this repo at the cited `file:line`;
> `[CORPUS]` evidence from `/Users/bruce/Desktop/Big Swing Art/` at the cited file+locus;
> `[DOC]` a governing document in this repo or `docs/c2-planning/`;
> `[PROPOSAL]` my recommendation — never an observation.

---

## 0. HEADLINE

The 30-concept pool is **per-world seeded, not an authored catalog**, and it is
**consumed permanently and irreversibly**: one concept → at most one screenplay
project, ever, with no abandonment, deletion or reuse path
`[CODE src/core/scriptDevelopment.ts:248-252, :873-874]` `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:60-62]`.
A managed campaign therefore has a **hard lifetime ceiling of 30 films**, after
which the commission board shows a terminal blocker whose stated remedy is
"Continue with an existing project" — i.e. there is no remedy
`[CODE src/core/scriptReadModel.ts:548-555]`.

The good news for RSG V1 is unusually good: `FilmConcept` is **never length-pinned
in save validation** `[CODE src/core/save.ts:2000-2006]`, **no code anywhere
hard-codes the `c-NN` id format** (verified by exhaustive grep), the **title is read
LIVE from the concept at every display surface** rather than copied forward, and the
Owner's "writer and office remain occupied while writing" requirement is **already
true and already published as player-facing copy**
`[CODE src/core/scriptReadModel.ts:213]`. The minimum V1 is genuinely small.

Three things are **not** true and must be decided, not assumed:

1. **Draft length is a hard-coded constant of one week**, independent of the writer
   `[CODE src/core/scriptDevelopment.ts:284, :506]`, and the invariant *asserts*
   `dueWeek === commissionedWeek + 1` `[CODE src/core/scriptDevelopment.ts:900-904]`.
2. **Writer skill currently drives script QUALITY, not speed**
   `[CODE src/core/scriptDevelopment.ts:352-362]` — the exact inverse of the
   corpus law `[CORPUS Bible §5.4; Prima verbatim]` and of the Bible's own successor
   ruling `[CORPUS Bible §5 "B. PROJECT: STUDIO SUCCESSOR RULING"]`. This
   contradiction is **not recorded anywhere in `docs/`** (grep: no hits).
3. **A minted concept must not be run through `correlateConceptCost`.** That
   function is a whole-pool rank permutation that rewrites *every* concept's
   `baseNegativeCost` `[CODE src/core/employment.ts:385-401, called :415]`. Calling
   it after appending would silently re-price in-flight productions' `requiredNegative`.

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
with `v8ExactKeys(..., [], label)` — an empty optional-key list
`[CODE src/core/save.ts:1379-1395]`. **Adding a ninth field (e.g. `origin`,
`mintedWeek`, `generatedTitle`) is a frozen-leaf widening** and violates Owner
guardrail 4 `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:19-21]`. This is the single
hardest constraint on RSG V1's schema.

`concepts: FilmConcept[]` sits on the **frozen** `GameStateV2` surface
`[CODE src/core/types.ts:451-461]`, which every later save version inherits
recursively; V13 validation strips `property`, delegates to V12, which chains down
to the V8 exact-key check `[CODE src/core/save.ts:3648-3688, :745-764]`.

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

`requiredSlots` is always `[...SLOT_ORDER]` — every concept needs all three cast
slots `[CODE src/core/worldgen.ts:577]`.

**Exactly 30.** `WORLD_CONFIG.conceptCount: 30` `[CODE src/core/tuning.ts:880]`,
looped at `[CODE src/core/worldgen.ts:547]`, pinned by test
`[CODE tests/worldgen.test.ts:87-90]` (`expect(WORLD.concepts.length).toBe(30)`).
That test asserts on `generateWorld()` output, **not** on live `GameState`, so
appending concepts at runtime does not break it.

The **only** authored data is the vocabulary, in a version-controlled TS module
(never filesystem I/O, so replay stays byte-stable) `[CODE src/core/data/wordlists.ts:1-11]`:

- `TITLE_LEAD` — **48** entries `[CODE src/core/data/wordlists.ts:39-48]`
- `TITLE_NOUN` — **60** entries `[CODE src/core/data/wordlists.ts:51-62]`
- → **2,880** distinct two-word titles, formed as `` `${lead} ${noun}` ``
  `[CODE src/core/worldgen.ts:567-568, :572]`

The word lists are **genre-agnostic**: nothing keys a title draw to the concept's
genre `[CODE src/core/worldgen.ts:567-568]`. (The original did key them — see §7.3.)

### 1.3 Latent quality / strength fields

- **`baselineStrength` (0..100)** — the hidden latent. It is the dominant term of a
  script's assessed strength (`0.60 ×`) and is **never shown to the player**; only
  the derived `perceivedStrength` crosses the read boundary
  `[CODE src/core/scriptDevelopment.ts:352-362]` `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:127-131]`.
  It also drives a commercial appeal delta at release
  `[CODE src/core/reception.ts:430-437]`.
- **`originalityRaw` (0..100)** — feeds an originality bonus / derivativeness penalty
  after shape modification, in both forecast and reception
  `[CODE src/core/forecast.ts:231-237]` `[CODE src/core/reception.ts:386-394]`.
- **`baseNegativeCost`** — the funding demand anchor:
  `requiredNegative = baseNegativeCost × shapeEffects.budgetDemandMultiplier × era.costScale`,
  computed identically in four places
  `[CODE src/core/candidates.ts:273-275]` `[CODE src/core/forecast.ts:144]`
  `[CODE src/core/reception.ts:246]` `[CODE src/core/filmPackage.ts:738]`.
- **`roleRequirements`** — per-slot persona target + tolerance, consumed by `roleFit`
  `[CODE src/core/forecast.ts:116]`.

At **founding only**, `beginFounding` re-pairs the pool's costs to correlate with
strength: a rank-blend at weight `SCRIPT_COST_POTENTIAL_CORRELATION = 0.4`
`[CODE src/core/tuning.ts:512]` that preserves the cost multiset but shifts the
pairing toward the strength order `[CODE src/core/employment.ts:385-401, called :415]`.
This is a **whole-pool operation executed exactly once**. See §8.7 for why it must
never be re-run.

### 1.4 How genre and shape attach

- **Genre** is a field on the concept `[CODE src/core/types.ts:157]`. The promise's
  genre **must equal** the concept's genre — enforced at greenlight
  `[CODE src/core/actions.ts:345-349]` and as a script invariant
  `[CODE src/core/scriptDevelopment.ts:752-755]`. Genre also selects the writer's
  genre-experience row inside `effectiveSkill` `[CODE src/core/development.ts:64]`
  and is the key of the director-genre track record predicate
  `[CODE src/core/forecast.ts:301-305]`.
- **Shape** does **not** attach to the concept at all. `FilmShape` is chosen by the
  player at commission and stored on the `ScriptProject`
  `[CODE src/core/types.ts:623]`, then copied onto the `Production` at greenlight
  `[CODE src/core/actions.ts:1628-1637]`. A concept is shape-agnostic; the same
  concept could in principle carry any shape (though only one project may claim it).

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
             → PERSISTED on the project; concept.baselineStrength is never read again
               for this film's strength.

FORECAST     forecast.ts:86-99   scriptStrength = override.perceived ?? (0.6·baseline + 0.4·writing)
             forecast.ts:116     roleFit(t, concept.roleRequirements[slot])
             forecast.ts:144     requiredNegative from concept.baseNegativeCost
             forecast.ts:231-237 originality from concept.originalityRaw
             forecast.ts:303     genre from concept.genre

RECEPTION    reception.ts:190-203  scriptStrength = override.actual ?? (0.6·baseline + 0.4·writing)
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
therefore *not* a title with a genre attached: it must carry all eight fields with
mechanically valid values or forecast/reception will produce garbage.

---

## 2. POOL CONSUMPTION SEMANTICS

### 2.1 What happens to a concept when commissioned

It is **claimed permanently**. Nothing is removed and nothing is marked on the
concept — the claim is expressed as *the existence of a `ScriptProject` bearing that
`conceptId`*, and a second commission on the same concept is rejected:

```ts
// src/core/scriptDevelopment.ts:248-252
if (development.projects.some((project) => project.conceptId === payload.conceptId)) {
  throw new Error(
    `script development: commission rejected — concept "${payload.conceptId}" already owns a screenplay project`,
  )
}
```

Re-asserted as a save/state invariant `[CODE src/core/scriptDevelopment.ts:873-874]`:
`invariant(!conceptIds.has(project.conceptId), 'duplicate concept link …')`.

The claim is **irreversible** because projects are append-only with array-index-derived
canonical ids:

- `canonicalScriptProjectId(index) = 'script-' + pad4(index)` `[CODE src/core/scriptDevelopment.ts:40-49]`
- `invariant(project.id === canonicalScriptProjectId(index), …)` `[CODE src/core/scriptDevelopment.ts:869-872]`
- **No deletion path exists.** Verified: the only `projects.filter` in the module is a
  read-only selector `[CODE src/core/scriptDevelopment.ts:641]`.
- Cancelling a *production* returns the project to `'ready'` and clears
  `productionId` — the concept stays claimed `[CODE src/core/scriptDevelopment.ts:554-572]`.

Stated as contract law `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:60-62]`:

> "Projects are append-only and stored in canonical ascending ID order. One source
> concept may seed at most one managed script project; V1 does not support remakes,
> abandonment, deletion, or replacement. Legacy concepts retain their existing
> reusable behavior."

**Legacy (unmanaged) mode is different and infinitely reusable**: the legacy
`greenlight` action checks only that the conceptId exists
`[CODE src/core/actions.ts:339-343]`. Only *managed* studios — i.e. every real player
studio — exhaust.

### 2.2 Where exhaustion bites, and the current guard

The dry-pool guard exists and is **terminal**:

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

Note the remedy is not a remedy: there is no action a player can take to obtain a
31st concept. `'no-concepts'` is a member of the blocker enum
`[CODE src/core/scriptReadModel.ts:37-48]` and is mirrored into two lot-snapshot
allow-lists `[CODE ui/src/lot/snapshot/scriptReview.ts:179]`
`[CODE ui/src/lot/snapshot/castingReview.ts:194]`.

**Bite point.** With a 30-concept ceiling and the shipped 1-week draft + 1-week
optional rewrite + production + theatrical run, a determined player exhausts the
supply well inside a normal campaign. Against the Owner's ratified horizon —
1920 start, ≥2040, no calendar end `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:31-32]` —
the pool is 30 films for a 120-year campaign. **This limitation is recorded nowhere in
`docs/`** (grep for `no-concepts` / `concept exhaust` / `runs dry` over `docs/*.md`:
the only hits are two stale "all 30 concepts are available at every tick" notes
`[DOC docs/rev4-open-questions.md:297]` `[DOC docs/HANDOFF.md:1476]`, both describing
the headless M0A corpus, not the managed player game).

### 2.3 Every site that iterates or indexes the concept collection

These are the **closed-world surfaces a new concept source must join**. Split into
*iteration* (must accept growth) and *lookup* (must resolve the new ids).

**A. Iteration / whole-pool scans — these define behaviour when the array grows**

| # | Site | What it does | Effect of appending |
|---|---|---|---|
| A1 | `[CODE src/core/scriptReadModel.ts:471-482]` | Commission menu: filters out claimed concepts, sorts by `compareId`, projects `{id,title,genre}` | **Opens for free.** New concepts appear in the commission list. |
| A2 | `[CODE src/core/scriptReadModel.ts:548-555]` | The `no-concepts` terminal blocker | Stops firing once ≥1 unclaimed concept exists. Copy should change. |
| A3 | `[CODE ui/src/engine/adapter.ts:548-550]` | `selectConcepts(state) => state.concepts` — bare pass-through | **Opens for free.** |
| A4 | `[CODE ui/src/screens/Assembly.tsx:350]` | Legacy direct-greenlight concept picker | Opens for free (legacy path only). |
| A5 | `[CODE ui/src/screens/TalentHub.tsx:457]` | Concept list for Fit / EP previews | Opens for free. |
| A6 | `[CODE ui/src/screens/WritersRoom.tsx:157, :253-259]` | The commission `<select>`; default = `concepts[0]` | Opens for free; default shifts to lowest id (a pool concept — stable). |
| A7 | `[CODE ui/src/lot/snapshot/scriptCommission.ts:323, :537-545]` | Lot workspace re-validates `state.concepts` (`uniqueById`) and `board.commission.concepts` (exact-key check on `{id,title,genre}`) | Opens for free **provided** ids stay unique and the view shape is unchanged. |
| A8 | `[CODE src/core/studioRunRecap.ts:376-380, used :499]` | `minConcept` — globally cheapest by `baseNegativeCost`, whole-pool sort | **Behaviour change.** The recap's affordability quote will start quoting generated concepts. Not a bug; must be named. |
| A9 | `[CODE src/core/studioRunRecap.ts:592]` | `conceptById` map for recap film titles | Opens for free. |
| A10 | `[CODE src/core/forecast.ts:302]` | `conceptGenre` map over concepts (director-genre track record) | Opens for free. |
| A11 | `[CODE src/core/employment.ts:385-401, called :415]` | `correlateConceptCost` — **whole-pool rank permutation of every `baseNegativeCost`** | **DANGER.** See §8.7. Must never be re-run after founding. |
| A12 | `[CODE src/core/candidates.ts:201, :236]` | Headless agent candidates: `Math.floor(rng.next() * concepts.length)` — draws from the **persisted sim stream** | Growing the array changes RandomAgent/Oracle behaviour for a given seed. Safe **only** because M0A never engages founding and therefore never mints. Must be stated as a determinism boundary. |
| A13 | `[CODE src/core/save.ts:2000-2006]` | Save validation: per-element exact-key check + duplicate-id check. **No count assertion.** | **Opens for free.** This is the single most important enabling fact. |
| A14 | `[CODE src/core/scriptDevelopment.ts:653-654]` | `titleByConcept` map for writer assignment labels ("Drafting *Title*") | Opens for free. |
| A15 | `[CODE src/core/scriptDevelopment.ts:853]` | `conceptById` map inside the invariant assertion | Opens for free. |

**B. Lookup-by-id — every one of these throws on an unresolvable conceptId**

`[CODE src/core/actions.ts:340]` · `[CODE src/core/tick.ts:269-272]` ·
`[CODE src/core/studioCalendar.ts:216-221]` (`requireConceptTitle`, called from
`:297, :331, :360, :418, :439, :472, :612`) · `[CODE src/core/scriptReadModel.ts:245-249]`
(`requireConcept`) · `[CODE src/core/castingReadModel.ts:117-121]` ·
`[CODE src/core/castingSessions.ts:361-364]` · `[CODE src/core/filmPackage.ts:898-902]` ·
`[CODE src/core/firstFilmJourney.ts:181-183]` · `[CODE src/core/scriptDevelopment.ts:423-427]` ·
`[CODE ui/src/engine/adapter.ts:1249-1251]` (`findConcept`).

Every one of these resolves against `state.concepts`. **If generated concepts live in
a separate root, all eleven must be rewritten to union.** If they append to
`state.concepts`, zero change.

---

## 3. IDENTITY

### 3.1 Current conceptId format

`` `c-${pad2(j)}` `` → `c-00` … `c-29` `[CODE src/core/worldgen.ts:571]`, where
`pad2(n) = n < 10 ? '0'+n : String(n)` `[CODE src/core/worldgen.ts:163-165]`.
Note `pad2` only pads to two digits — a 100th pool concept would be `c-100`. Not
relevant under a namespaced scheme, but relevant if anyone ever raises `conceptCount`.

**No code anywhere hard-codes the `c-NN` pattern.** Exhaustive grep across
`src/`, `ui/src/`, `tests/` for `'c-0`, `"c-0`, `c-[0-9]`, `/^c-` returned **zero
matches**. Ids are opaque strings everywhere. A namespaced scheme is free.

Ordering is lexicographic via three identical `compareId` helpers
`[CODE src/core/scriptReadModel.ts:225]` `[CODE src/core/studioCalendar.ts:212]`
`[CODE src/core/castingReadModel.ts:105]`. Under ASCII, `'c-29' < 'concept-orig-0000'`
(`'-'` 0x2D < `'o'` 0x6F), so **pool concepts sort before generated ones, and
generated ones sort in mint order** if zero-padded. Clean, no tie-breaking needed.

### 3.2 Is there an id-collision authority for concepts?

**No.** `persistedProductionIds` `[CODE src/core/productionIdentity.ts:8-38]` covers
*production* ids only, sweeping nine roots. There is **no `persistedConceptIds`
analog**. The only concept-id guard in the codebase is the duplicate-within-array
check in save validation `[CODE src/core/save.ts:2001-2006]`.

Owner guardrail 3 requires that "any new persisted root containing production IDs
must participate in the existing taken-ID/persistence invariant"
`[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:16-17]`. RSG V1's root holds **concept**
ids, not production ids — so guardrail 3 does not literally bind it, but the same
discipline plainly should, and the architect should say so explicitly rather than
leave a reader to infer it.

### 3.3 What a fresh namespaced scheme must reserve against

Persisted roots that carry a `conceptId` — **exactly four**:

| Root | Field | Type line |
|---|---|---|
| `state.studio.activeProductions[]` | `Production.conceptId` | `[CODE src/core/types.ts:227]` |
| `state.studio.releasedFilms[]` | `FilmResult.conceptId` | `[CODE src/core/types.ts:255]` |
| `state.theatricalRuns[]` | `TheatricalRun.conceptId` | `[CODE src/core/types.ts:306]` |
| `state.scriptDevelopment.projects[]` | `ScriptProject.conceptId` | `[CODE src/core/types.ts:621]` |

Plus the source of truth itself, `state.concepts[].id` `[CODE src/core/types.ts:155]`.

**Roots that carry NO conceptId — verified, do not over-reserve:**

- `state.ledger` — `LedgerEntry` correlates only by `talentId` / `productionId` /
  `constructionProjectId` `[CODE src/core/types.ts:368-439]`.
- `state.careerEvents` — `TalentCareerEvent.filmId` is a **productionId**, and
  `filmTitle` is a frozen **string**, explicitly commented "concept title,
  snapshotted at release" `[CODE src/core/types.ts:1230-1234]`.
- `state.broadcastItems` / `state.coverageContexts` — subject/`facts.filmId` are
  productionIds `[CODE src/core/productionIdentity.ts:19-29]`. The **rendered
  `template` string** contains the title text, but not the id (see §4.3).
- `state.operations` workflows — productionIds only `[CODE src/core/productionIdentity.ts:30-34]`.

**Transient / derived (never persisted, but they will surface generated ids):**
`CommissionScriptPayload.conceptId` `[CODE src/core/types.ts:642]`;
`[CODE src/core/economyView.ts:376, :395]`;
`[CODE src/core/studioRunRecap.ts:188, :545]`;
`[CODE src/core/candidates.ts:75, :335]`.

### 3.4 Monotonic counter — where it must live

`ScriptProject` ids derive from array position (`canonicalScriptProjectId(index)`
`[CODE src/core/scriptDevelopment.ts:40-49]`), which is legal there because projects
are append-only and never deleted. **Concept ids cannot use that trick**, because
`state.concepts` starts with 30 pool concepts and index 30 would collide conceptually
with a re-seeded world. A **persisted explicit counter** is required, and it must live
in the new V14 root — not derived from `state.concepts.length`, which would break the
moment anyone changes `WORLD_CONFIG.conceptCount`.

---

## 4. TITLES

### 4.1 Where a film's display title lives at each pipeline stage

**There is exactly one storage location: `FilmConcept.title`.** Every other stage
*resolves* it live; none of them copies it forward — with two frozen-history
exceptions (§4.3).

| Stage | Where the title comes from |
|---|---|
| Concept | `FilmConcept.title` — the only stored copy `[CODE src/core/types.ts:156]` |
| Script project | **Not stored.** Resolved: `titleByConcept.get(project.conceptId)` `[CODE src/core/scriptDevelopment.ts:653-658]`; `requireConcept(state, project.conceptId).title` `[CODE src/core/scriptReadModel.ts:399, :436, :1060]` |
| Casting session | **Not stored.** `requireConcept(...).title` `[CODE src/core/castingReadModel.ts:160, :302, :352]` |
| Production | **Not stored.** `productionTitle(state, production) = findConcept(state, production.conceptId)?.title ?? production.conceptId` `[CODE ui/src/engine/adapter.ts:688]` |
| `FilmResult` | **No title field at all** `[CODE src/core/types.ts:241-264]`. Resolved from `film.conceptId` at render `[CODE ui/src/engine/adapter.ts:5213, :5244]` |
| Theatrical run | **Not stored.** `requireConceptTitle(state, run.conceptId, …)` `[CODE src/core/studioCalendar.ts:472]` |
| Newspaper / Chronicle | `conceptTitle` passed **in** as an input to the builder `[CODE src/core/newspaper.ts:355, :614]`, supplied live by the adapter `[CODE ui/src/engine/adapter.ts:5213, :5244]` |
| Broadcast item | **FROZEN.** Title is baked into the rendered `template` string at release `[CODE src/core/broadcast.ts:272-274, :288-300]`, fed by `conceptTitle: concept.title` `[CODE src/core/tick.ts:415]` |
| Career event | **FROZEN.** `filmTitle: concept.title` snapshotted at release `[CODE src/core/tick.ts:610]` `[CODE src/core/types.ts:1234]` |

**Answer to the direct question:** the title is **read at release time from the
concept** `[CODE src/core/tick.ts:269-272, :415]` and then, for the two history
records only, copied forward. Every *display* surface reads live.

### 4.2 Does any rename path exist today?

**No.** The `Action` union `[CODE src/core/types.ts:1260-1297]` contains no rename
verb of any kind — not for concepts, not for talent, not for facilities. Nothing
anywhere writes `concept.title` after `generateConcepts` returns.

### 4.3 Exactly which surfaces print the title — the rename proof set

A rename that writes `FilmConcept.title` propagates automatically to **all of A**
and to **none of B**.

**A. LIVE — resolve from `state.concepts` at render, will reflect a rename**

*Core read models (the authorities the UI reads):*
1. `[CODE src/core/studioCalendar.ts:216-221]` `requireConceptTitle` — feeding
   production outlook `:297`, screenplay rows `:331, :418`, casting rows `:360, :439`,
   theatrical receipts `:472`, decisions `:612`.
2. `[CODE src/core/scriptReadModel.ts:318]` — "Working on *Title*" (production occupant).
3. `[CODE src/core/scriptReadModel.ts:399, :415, :436]` — Development & Casting slot occupants.
4. `[CODE src/core/scriptReadModel.ts:480]` — commission menu entries.
5. `[CODE src/core/scriptReadModel.ts:786, :838]` — project cards / Ready package concept view.
6. `[CODE src/core/scriptReadModel.ts:863, :880, :889, :912-913, :949]` — lot attention copy.
7. `[CODE src/core/scriptReadModel.ts:1060]` — script review decision title.
8. `[CODE src/core/castingReadModel.ts:352, :465]` — casting views.
9. `[CODE src/core/scriptDevelopment.ts:663-670]` — roster labels "Drafting *Title*" / "Rewriting *Title*".
10. `[CODE src/core/firstFilmJourney.ts:181-183, :351, :358, :788, :799]` — journey narration.
11. `[CODE src/core/studioRunRecap.ts:621]` — recap film rows (`concept?.title ?? f.conceptId`),
    flowing to `:683, :686, :1055-1062`.
12. `[CODE src/core/newspaper.ts:355, :470, :614]` — the newspaper headline/subheadline
    (`upper('“'+d.title+'”')`), via the adapter's live `conceptTitle`.

*Adapter / UI:*
13. `[CODE ui/src/engine/adapter.ts:688]` `productionTitle` → `:709, :825, :5767, :6396`.
14. `[CODE ui/src/engine/adapter.ts:1173-1177, :1204-1205, :1353-1355]` — talent assignment labels.
15. `[CODE ui/src/engine/adapter.ts:2411, :2499, :2505, :2511, :2514-2515]` — next-event / stop-reason copy.
16. `[CODE ui/src/engine/adapter.ts:2681, :2899, :4210, :5213, :5244]` — `conceptTitle` into newspaper/autopsy/chronicle.
17. `[CODE ui/src/engine/adapter.ts:6244, :6282]` — production cards.
18. `[CODE ui/src/engine/adapter.ts:6374, :6402]` — presence/occupancy joins.
19. `[CODE ui/src/App.tsx:3500]`, `[CODE ui/src/screens/Dashboard.tsx:500, :559]`,
    `[CODE ui/src/screens/ReleaseResult.tsx:73, :75]`,
    `[CODE ui/src/lot/snapshot/nextEvent.ts:537]` — screen-level `findConcept(...).title`.
20. `[CODE ui/src/screens/WritersRoom.tsx:255-257]` — the commission `<option>` label.
21. `[CODE ui/src/lot/snapshot/scriptCommission.ts:329-331, :345, :365, :378]` —
    lot workspace `titleForConcept`.

**B. FROZEN — snapshotted at release, will NOT reflect a later rename**

22. `[CODE src/core/types.ts:1234]` + `[CODE src/core/tick.ts:610]` —
    `TalentCareerEvent.filmTitle`, an append-only career record.
23. `[CODE src/core/broadcast.ts:272-274, :288-300]` + `[CODE src/core/tick.ts:415]` —
    the `BroadcastItem.template` rendered string.

`[PROPOSAL]` B is **correct behaviour, not a defect**: a career record and a press
clipping name the film as it was called when the event happened. But the architect
must state this out loud, because a playtester who renames a released film and then
opens a talent profile will otherwise file it as a bug. It also means renaming should
be *scoped to before release* or the divergence should be deliberate and explained.

---

## 5. WRITER OCCUPANCY — ALREADY TRUE, WITH ONE GAP

### 5.1 Is the writer exclusively occupied during draft weeks?

**Yes, on four independent enforcement layers.**

1. **One active script task per writer** — rejected at commission
   `[CODE src/core/scriptDevelopment.ts:253-261]` and at rewrite
   `[CODE src/core/scriptDevelopment.ts:479-490]`.
2. **The unified busy set** — `busyTalentIds(state)` unions active-production
   participants with active script-writer assignments
   `[CODE src/core/employment.ts:102-121]`; commission and rewrite both check it
   `[CODE src/core/actions.ts:1539-1543, :1573-1577]`.
3. **Invariants** — an active project's writer must be contracted, must not hold a
   second script task, and must not also be on an active production
   `[CODE src/core/scriptDevelopment.ts:970-984]`.
4. **Contract law** — early contract release rejects while a writer is drafting or
   rewriting `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:94-98]`.

The writer is also **physically projected at the office** during the draft — presence
claims are keyed `('script', writerId, reservation.facilityId, slot)` with precedence
`production > script > casting` `[CODE src/core/presence.ts:262, :277-279, :501-527]`.

### 5.2 Does the office slot stay reserved for the whole draft?

**Yes.** `ScriptReservation{projectId, facilityId, capability:'development-casting', slot}`
is allocated at commission `[CODE src/core/scriptDevelopment.ts:264-274]`, held for the
entire `drafting`/`rewriting` window, and cleared **atomically** with the status
transition to `review` `[CODE src/core/scriptDevelopment.ts:446-452]`. Holding a
reservation in any other status is an invariant violation
`[CODE src/core/scriptDevelopment.ts:135-139, :922-923]`.

Allocation is deterministic (ascending facilityId, then ascending slot) and collides
against production and casting reservations in one shared occupancy union
`[CODE src/core/scriptDevelopment.ts:173-200, :100-156]` — satisfying Owner guardrail 9
"C2 continues using the existing authoritative occupancy/reservation representation"
`[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:29-30]`.

Slots are released **before** productions allocate, within the same tick
`[CODE src/core/tick.ts:169-185, :206-214]`.

### 5.3 The player-facing sentence already exists

```ts
// src/core/scriptReadModel.ts:213
export const SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE =
  'One week passes while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.'
```

**Verdict: the Owner's occupancy requirement is ALREADY TRUE.** RSG V1 does not need
to build it.

### 5.4 The gap

**Draft length is a hard-coded constant of exactly one week, independent of the
writer, the office, or anything else:**

- `dueWeek: commissionedWeek + 1` at commission `[CODE src/core/scriptDevelopment.ts:284]`
- `dueWeek: currentWeek + 1` at rewrite `[CODE src/core/scriptDevelopment.ts:506]`
- and the invariant **asserts the constant**:
  `invariant(project.dueWeek === project.commissionedWeek + 1 && project.dueWeek > context.currentWeek, …)`
  `[CODE src/core/scriptDevelopment.ts:900-904]`; rewriting asserts
  `dueWeek === currentWeek + 1` `[CODE src/core/scriptDevelopment.ts:911-916]`.

The **persisted shape already supports variable length** — `dueWeek: number | null`
`[CODE src/core/types.ts:630]`, validated only as a nullable integer at the save
boundary `[CODE src/core/save.ts:2758]`. Only the core invariant pins it.

`[PROPOSAL]` The Owner's ruling ("writing consumes sim time and occupies writer +
office; more writers/offices = more throughput") is **satisfied today without
variable draft length**: more writers → more parallel projects (one active task each);
more Development Offices → more slots → more parallel projects. Variable draft weeks
are a *separate* feature. Keeping the 1-week law is the smallest V1 and touches no
shipped invariant. See §6 for why doing otherwise entangles a corpus-law contradiction.

---

## 6. THE WRITER-EXPERIENCE LAW — A LIVE CONTRADICTION

### 6.1 The corpus law (confirmed, verbatim, developer-reviewed)

Extracted directly from the Prima Official Game Guide OCR
(`/Users/bruce/Desktop/Big Swing Art/The_Movies_Prima_Official_eGuide_abbyy 2`),
Scriptwriters section `[CORPUS]`:

> "Scriptwriters gain individual experience (visible in their Staff cards) over time
> with every job they perform. **The more experience a scriptwriter has, the faster
> scripts will be completed. Scriptwriter experience has no bearing on the quality of
> the script.** To speed the writing of scripts, put multiple writers on the project."

Same source, adjacent `[CORPUS]`:

> "Although Script Offices can produce scripts of any genre, they can only produce one
> script at a time, regardless of how many scribes are assigned to it. To write multiple
> scripts simultaneously, you'll need … more than one Script Office."
>
> "The level of the Script Office dictates the quality of scripts it can produce."

Recorded in the Bible with the contradiction preserved
`[CORPUS THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md §5.4, bullet "Writer experience
affects speed only — CORRECTING a prior ambiguity, and preserving a direct cross-source
contradiction"]` — Prima (developer-reviewed) says speed-only; **GameSpot says the
opposite** ("the more they work, the better they'll get… resulting in higher quality
productions"). The Bible adopts Prima on source precedence but explicitly refuses to
silently resolve it.

And the Bible's own successor ruling `[CORPUS Bible §5 "B. PROJECT: STUDIO SUCCESSOR
RULING — Script system: DEEPEN"]`:

> "…while treating **writer count/experience strictly as a speed lever** (5.4) and
> keeping the Custom-Office-inherits-conventional-ceiling rule (5.5) as a real
> constraint, not an escape hatch."

### 6.2 What C1 actually shipped

```ts
// src/core/scriptDevelopment.ts:352-362  (assessFirstDraft)
actualStrength:    clamp(0.6 * concept.baselineStrength + 0.4 * actualWriting    + estUplift, 0, 100),
perceivedStrength: clamp(0.6 * concept.baselineStrength + 0.4 * perceivedWriting + estUplift, 0, 100),
```

Writer skill contributes **40% of script quality**. And draft length is a constant
(§5.4), so writer skill contributes **0% of speed**.

**The shipped engine implements the exact inverse of the corpus law.**

The module docstring is aware of *half* the law and states it correctly for the
**office**, while saying nothing about the writer
`[CODE src/core/scriptDevelopment.ts:314-317]`:

> "SPEED IS UNTOUCHED. Drafting is one week with or without an office; tiers change
> what a script can become, never how fast. That is the original law."

That sentence is corpus-accurate about offices `[CORPUS Bible §5.2 tier→star-ceiling
table]`. It is silent about writers, and that silence is where the inversion lives.

**This contradiction is recorded nowhere in `docs/`.** Grep over `docs/*.md` for
"writer experience", "writer skill", "experience affects speed", "speed only":
zero hits. Per brief rule 5, it is reported here loudly and **not resolved**.

### 6.3 How the shipped office machinery would interact with generated-concept latents

The C1 facility machinery is clean and corpus-faithful:

- `developmentOfficeEstUplift(state)` — highest operational tier wins, nothing stacks:
  `+9` for `development-office-3`, `+4` for `development-office-2`, else `0`
  `[CODE src/core/facilityEffects.ts:94-102]` `[CODE src/core/tuning.ts:808-809]`.
- Read from **operational placements at evaluation time**; nothing cached, nothing
  persisted, zero RNG `[CODE src/core/facilityEffects.ts:1-27]`.
- Applied **first-draft only**, inside the existing `[0,100]` clamp, to **both** hidden
  and visible strength — so an office changes what the studio made, not merely what the
  player is told `[CODE src/core/scriptDevelopment.ts:292-317, :348-362]`
  `[CODE src/core/tuning.ts:789-807]`.
- Wired at exactly one point in the tick, reading the estate as it stands *before*
  construction completes in the same advance `[CODE src/core/tick.ts:179-184]`.

**Interaction with generated-concept latents.** Because a generated concept still
carries a `baselineStrength`, the existing blend applies unchanged:
`0.6·baselineStrength + 0.4·writing + officeUplift`. So:

- The **office tier lifts** the ceiling — corpus-faithful `[CORPUS Bible §5.2]`.
- The **writer still moves quality** through the `0.4·writing` term —
  corpus-**contradicting** `[CORPUS Bible §5.4]`.
- The **concept's own `baselineStrength`** becomes, for generated concepts, a value
  RSG V1 must *choose*. `[PROPOSAL]` This is where the design decision hides: if RSG
  derives `baselineStrength` from writer skill it double-counts the writer; if it
  derives it from office tier it double-counts the office (the uplift already applies);
  the honest choice is to draw it from a **purpose-keyed deterministic stream** keyed
  on the mint ordinal, so a generated concept is a *premise of unknown quality* exactly
  like a pool concept, and the office + writer act on it through the existing blend.

`[PROPOSAL]` **Recommended fence:** RSG V1 changes neither the blend nor the draft
length. The corpus inversion (§6.2) is filed as an Owner decision (§9) and, if ruled,
becomes a separate bounded milestone — because inverting it means (a) removing the
`0.4·writing` term, which re-tunes every existing script EST and every acceptance
test that depends on it, and (b) relaxing a shipped save invariant. Neither belongs
inside "the smallest deterministic V1".

---

## 7. DETERMINISTIC TITLE GENERATION

### 7.1 The RNG utilities that exist

`src/core/rng.ts` provides two things `[CODE src/core/rng.ts:1-21]`:

- **`RngStream`** — sfc32, serializable to/from a string, living on
  `GameState.rngState` `[CODE src/core/rng.ts:107-185]`. This is **the persisted sim
  stream**; consuming it advances save state.
- **`stream(seed, purpose, key)`** — a **stateless derived stream**:
  `RngStream.fromSeed(`${seed}::${purpose}::${key}`)` `[CODE src/core/rng.ts:187-191]`.
  Never threaded through save, so replays are exact without storing it.

`RngPurpose` is a closed union — a new purpose is a one-line additive widening
`[CODE src/core/rng.ts:34-52]`:

```
'candidates' | 'agent' | 'forecast' | 'worldgen' | 'migrate' | 'develop' | 'hiring'
| 'discovery-v1'   // engaged-only, keyed productionId
| 'casting-v1'     // keyed sessionId:talentId:slot
| 'presence-v1'    // cosmetic per-person departure stagger, keyed talentId:week
```

### 7.2 The purpose-keyed precedent Owner guardrail G names

Owner guardrail G — "new systems never consume the existing persisted sim stream
merely because it is available; purpose-keyed **versioned** deterministic streams
(the `presence-v1` precedent)" `[DOC 00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md:66-71]`.

`presence-v1` is exactly that `[CODE src/core/rng.ts:49-52]`: isolated, versioned
(`-v1` so a recalibration can re-key cleanly), derived-only, "read by a projection
that writes nothing, so presentation consumes zero simulation RNG and replay stays
exact". `casting-v1` and `discovery-v1` follow the same pattern
`[CODE src/core/rng.ts:42-48]`.

### 7.3 Existing name/title generation — the pattern to follow

`generateConcepts` is the exact precedent `[CODE src/core/worldgen.ts:538-582]`:

- A **dedicated substream per field**, so adding or removing one field never shifts
  another field's draws — `stream(seed,'worldgen','concept-title')` is separate from
  `'concept-genre'` etc. `[CODE src/core/worldgen.ts:539-544]`.
- Word lists are **static TS modules consumed in declared array order**, never
  filesystem reads, so replay is byte-stable `[CODE src/core/data/wordlists.ts:1-11]`.
- Content is explicitly flavor: *"the `id` is the key, not the name, so collisions are
  harmless"* `[CODE src/core/data/wordlists.ts:7-11]`. **This sentence is the licence
  for both duplicate generated titles and player rename.**
- Talent names follow the identical two-draw pattern
  `[CODE src/core/worldgen.ts:503-504]`, `FIRST_NAMES` (64) × `LAST_NAMES` (64).

Current title space: `TITLE_LEAD` (48) × `TITLE_NOUN` (60) = **2,880 combinations**,
**not genre-keyed** `[CODE src/core/worldgen.ts:567-568]`
`[CODE src/core/data/wordlists.ts:39-62]`.

`[CORPUS]` The original **did** key titles to genre. Prima, Advanced Movie-Maker
intro screen, verbatim:

> "**Movie Title** — Enter your own title or press the dice button for a randomly
> generated title. **The title you get is based partially on the genre you've chosen**,
> so set that before generating a random title."

and, in the Genre section:

> "The genre you choose impacts several factors: **randomly generated titles**, the
> film's structure if 'Detailed' structure is chosen…"

and a direct precedent for *generated-then-overridable* names:

> "**Character names are randomly generated based on gender and genre but can be
> overridden.**"

### 7.4 Era-cleanliness constraints

**There is no calendar year anywhere in the engine.** Exhaustive grep of `src/` and
`ui/src/` for `1920` / `2040`: **zero matches**. `market.tick` is a bare integer week
from 0 `[CODE src/core/types.ts:277]`, `TICKS_PER_YEAR: 52` `[CODE src/core/tuning.ts:48]`,
and `EraConfig`'s only live field is `costScale` — the other three are explicitly
"inert data here" `[CODE src/core/worldgen.ts:613-620]`, consumed nowhere except save
validation `[CODE src/core/save.ts:1478-1485]`.

`[PROPOSAL]` Therefore a title generator **must not** key on a year, a decade, or an
era label — no such authority exists, and inventing one would be exactly the
"blocking architecture" the timeline law forbids
`[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:31-32]`. The only era-clean keys available
are **genre** and the **mint ordinal**. C4 owns era-sensitive premises
`[DOC 00C §3]`; C2 must not build toward it.

---

## 8. `[PROPOSAL]` MINIMAL RSG V1 ENGINE DESIGN

> Everything in §8 is proposal. Nothing here is observed behaviour.

### 8.1 The new root (V14) — shape

```ts
// NEW root. Frozen leaves untouched; FilmConcept gains no field.
export type OriginalScreenplayOrigin = {
  conceptId: string        // 'concept-orig-0000' — the minted, permanent identity
  ordinal: number          // 0-based mint order; the id's numeric part
  mintedWeek: number       // market.tick at mint
  projectId: string        // the ScriptProject that produced it ('script-NNNN')
  writerId: string         // who wrote it (provenance, never a mechanic in V1)
  generatedTitle: string   // the immutable working title as generated
  renamedWeek: number | null // null until the player renames
}

export type OriginalScreenplays = {
  mode: 'legacy' | 'managed'
  nextOrdinal: number      // explicit monotonic counter — NEVER derived from array length
  records: OriginalScreenplayOrigin[]
}

// GameStateV14 = GameStateV13 & { originalScreenplays: OriginalScreenplays }
```

**Why a `mode` field:** it mirrors `ScriptDevelopment`/`CastingSessions`/`StudioOperations`
`[CODE src/core/types.ts:636-639, :719-722, :581-585]` and lets V13→V14 migration land
`{ mode:'legacy', nextOrdinal: 0, records: [] }` — empty, byte-identical, satisfying the
V14-complete-at-M1 rule.

**Why `nextOrdinal` is explicit and not `records.length`:** records are append-only in
V1, so they would agree — but an explicit counter survives any future filtering,
archival, or windowing without silently re-minting an id. This is the same reasoning
that gave productions a collision-safe allocator `[CODE src/core/actions.ts:155-167]`.

**Difficulty: EASY.**

### 8.2 Where the generated concept itself lives — the pivotal recommendation

**Append it to `state.concepts` with a namespaced id.** Do **not** keep a parallel
concept store.

Justification, all observed:
- Save validation permits it: exact-key check per element, unique-id check, **no count
  assertion** `[CODE src/core/save.ts:2000-2006]`.
- No code hard-codes the id format (§3.1, exhaustive grep, zero matches).
- All 15 iteration surfaces and all 11 lookup surfaces (§2.3) open **for free**.
- The alternative — a union read model — means rewriting eleven `state.concepts.find(...)`
  call sites in core plus the adapter, and every one of them currently *throws* on an
  unresolved id, so a missed site is a crash, not a cosmetic bug.

**Guardrail 8 check** — "never write studio-relative facts onto shared-world entities
(Talent, FilmConcept, MarketState)" `[DOC 00B-OWNER-GUARDRAILS-2026-08-18.md:26-27]`.
Satisfied: the appended `FilmConcept` carries **only world-shaped facts** (the same
eight fields a worldgen concept carries). Every studio-relative fact — who wrote it,
when, which project, whether the player renamed it — lives in `originalScreenplays`.
This is precisely why the origin record must exist rather than widening `FilmConcept`.

**Difficulty: EASY** (the append) **/ MEDIUM** (writing the invariant that keeps the two
in lockstep).

### 8.3 Id scheme

`` `concept-orig-${String(ordinal).padStart(4,'0')}` `` → `concept-orig-0000`, …

- Namespaces cleanly against `c-NN`; guardrail 2's "any future second identity scheme
  namespaces itself; existing IDs remain unchanged" `[DOC 00B:14-15]`.
- Lexicographic order puts pool concepts first, then mint order (§3.1).
- Minting **must reserve against** the five roots in §3.3 via a new
  `persistedConceptIds(state)` helper modelled on `persistedProductionIds`
  `[CODE src/core/productionIdentity.ts:8-38]` — cheap, and it makes the reservation
  auditable rather than implicit.

**Difficulty: EASY.**

### 8.4 The mint action flow — and WHEN identity is minted

**Recommendation: mint at COMMISSION, not at accept.** This is not a preference; the
alternative is architecturally blocked.

`ScriptProject.conceptId` is a **required non-null string in the FROZEN V9 save shape**
`[CODE src/core/types.ts:621]` `[CODE src/core/save.ts:2730-2749]` (`v9ExactKeys` with
`conceptId` present; `v9String(project.conceptId, …)`). Deferring the concept to accept
would require making it nullable — a frozen-leaf widening, violating guardrail 4
`[DOC 00B:19-21]` — **and** would break every surface that names in-flight work:
`activeScriptWriterAssignments` throws on an unknown concept
`[CODE src/core/scriptDevelopment.ts:657-661]`, `requireConceptTitle` throws
`[CODE src/core/studioCalendar.ts:216-221]`, the invariant requires a resolvable concept
`[CODE src/core/scriptDevelopment.ts:876-877]`, and the lot workspace requires a title
`[CODE ui/src/lot/snapshot/scriptCommission.ts:329-331]`.

**On cancellation risk:** there is none to design around. There is **no abandon or
delete verb for a script project** `[CODE src/core/scriptDevelopment.ts:641 is the only
filter; no deletion path]` `[DOC docs/SCRIPT-PROJECTS-V1-CONTRACT.md:60-62]`. A
commissioned project persists forever regardless of outcome, so a concept minted at
commission can never be orphaned. If C2 later adds an abandon verb, the concept simply
returns to the unclaimed pool — the same state a never-commissioned concept is in.

Proposed action:

```ts
| { kind: 'commissionOriginalScreenplay'
    ; writerId: string
    ; genre: Genre                 // the player's creative direction
    ; shape: FilmShape             // same choices the existing form already collects
    ; promise: Promise }
```

Flow (all inside one `applyActions` case, reusing existing machinery):
1. Reuse every gate `applyCommissionScript` already enforces — founding closed, writer
   contracted, writer not busy `[CODE src/core/actions.ts:1527-1543]`.
2. Mint `conceptId` from `originalScreenplays.nextOrdinal`, reserved against
   `persistedConceptIds(state)`.
3. Build the `FilmConcept` from **six purpose-keyed derived substreams** (§8.9), the
   `generateConcepts` pattern exactly, keyed `` `${conceptId}` `` — never the persisted
   sim stream (guardrail G).
4. Append to `state.concepts`; append the origin record; increment `nextOrdinal`.
5. Call the **existing** `commissionScriptProject(...)` unchanged
   `[CODE src/core/scriptDevelopment.ts:232-290]` — it allocates the slot, sets
   `dueWeek = week + 1`, marks the writer busy. **No new draft machinery.**
6. Run the existing `assertCurrentScriptState` `[CODE src/core/actions.ts:1469-1486]`
   plus one new `assertOriginalScreenplayInvariants`.

From step 5 onward, **the entire pipeline is untouched**: draft, review, rewrite,
accept, package, casting, greenlight, production, release, newspaper, autopsy.

**Difficulty: MEDIUM** (one action, one minter, careful gate reuse).

### 8.5 Rename action

```ts
| { kind: 'renameScreenplay'; conceptId: string; title: string }
```

**Recommendation: rename WRITES `FilmConcept.title` in place**, and the origin record
retains `generatedTitle` immutably plus `renamedWeek`.

Why: `FilmConcept.title` is the **single stored display authority**, read live by all
21 surfaces in §4.3-A. Writing it is one write site and **zero read-site changes**. The
alternative (an override in the new root plus a resolver) means touching all 21.

Constraints the action must enforce:
- Only concepts present in `originalScreenplays.records` may be renamed (pool concepts
  are authored world data in V1). One-line predicate to relax later.
- Trimmed, non-empty, bounded length, no control characters — `v8String(..., true)`
  already rejects empty at the save boundary `[CODE src/core/save.ts:1397]`.
- Uniqueness is **not** required — worldgen already permits duplicate titles by design
  `[CODE src/core/data/wordlists.ts:7-11]`.
- Invariant: for every origin record, `concepts[conceptId]` exists, and
  `renamedWeek === null ⇒ concept.title === generatedTitle`.
- The two frozen-history surfaces (§4.3-B) will keep the old title. State this in the
  contract; do not "fix" it.

**Difficulty: EASY** (action) **/ MEDIUM** (proving it against all 21 live surfaces —
that proof is the real work, and §4.3 is the checklist).

### 8.6 Read-model union of pool + generated concepts

**Under §8.2 there is no union to build** — one array, everything reads it. The only
read-model work is copy and affordance:

- `no-concepts` blocker copy: today it is terminal
  `[CODE src/core/scriptReadModel.ts:548-555]`. It should become a *route*, not a dead
  end — "commission an original screenplay instead" — or stop firing entirely once the
  original path is available. **The four-facts-plus-remedy legibility law applies**
  `[DOC 00C §4]`.
- The commission view may want a provenance flag (`origin: 'pool' | 'original'`) on
  `CommissionConceptView` so the player can tell a studio-written screenplay from a
  pool premise. That widens a **read-model** type `[CODE src/core/scriptReadModel.ts:126-130]`,
  not a save leaf — legal. But note the lot workspace re-validates that view with an
  **exact-key** check `[CODE ui/src/lot/snapshot/scriptCommission.ts:537-545]`, so the
  key list there must be updated in the same change or the workspace silently rejects
  the board.

**Difficulty: EASY** (copy) **/ MEDIUM** (the provenance flag, because of the lot
workspace's exact-key mirror).

### 8.7 Save / migration implications

- **V13 → V14**: add exactly one root, `originalScreenplays: { mode:'legacy',
  nextOrdinal: 0, records: [] }`. Lands **empty** → byte-identical for every existing
  save, satisfying the V14-complete-at-M1 rule. Follow the V12→V13 pattern exactly:
  strip the new key, delegate the remainder to the frozen prior validator, then
  validate the new root `[CODE src/core/save.ts:3648-3688]` `[CODE src/core/save.ts:5076-5086]`.
- **`V14_STATE_KEYS = [...V13_STATE_KEYS, 'originalScreenplays']`**, mirroring
  `[CODE src/core/save.ts:3530]`.
- **`FilmConcept` gains no field.** The V8 exact-key validator stays untouched
  `[CODE src/core/save.ts:1379-1395]`.
- **New save invariants** (the important ones):
  1. Every `records[i].conceptId` resolves in `state.concepts`.
  2. Every `records[i].ordinal === i` and `nextOrdinal === records.length` (V1 only).
  3. No `records[i].conceptId` collides with a worldgen `c-NN` id.
  4. `renamedWeek === null ⇒ concept.title === generatedTitle`.
  5. Every `records[i].projectId` resolves in `state.scriptDevelopment.projects`
     and that project's `conceptId` matches.
- **`state.concepts` remains append-only.** Nothing may ever remove a concept — a
  released `FilmResult`, an open `TheatricalRun` and a `Produced` project all hold a
  `conceptId` forever (§3.3), and the save validator hard-fails on an unresolvable
  production/film conceptId `[CODE src/core/save.ts:1213-1215, :1534-1536]`.

**⚠ THE ONE TRAP — `correlateConceptCost`.** `[CODE src/core/employment.ts:385-401]`
is a whole-pool rank permutation of **every** concept's `baseNegativeCost`, executed
once at `beginFounding` `[CODE src/core/employment.ts:415]`. If an implementer
"helpfully" re-runs it after appending a concept:
- every existing concept's `baseNegativeCost` changes,
- therefore every in-flight production's `requiredNegative` changes
  `[CODE src/core/forecast.ts:144]` `[CODE src/core/reception.ts:246]`,
- therefore `budgetAdequacy` and realized reception change **for films already greenlit
  against a locked forecast**.

RSG V1 **must** set a generated concept's `baseNegativeCost` directly at mint, derived
deterministically from its own `baselineStrength` so the cost↔potential correlation is
correct **by construction**, and must never touch the existing pool.
`[PROPOSAL]` Write this as an explicit contract prohibition and back it with a test.

**Difficulty: MEDIUM** (routine V-next, but the invariant set and the
`correlateConceptCost` prohibition are where a careless implementation breaks history).

### 8.8 What the 30 pool concepts become

**Seed data — and they stay fully commissionable, unchanged, forever.**

- Generation is untouched `[CODE src/core/worldgen.ts:538-582]`; `conceptCount: 30`
  stays `[CODE src/core/tuning.ts:880]`; the test still passes
  `[CODE tests/worldgen.test.ts:87-90]`.
- Existing `c-NN` ids are permanent and never re-minted or reformatted — guardrail 2
  `[DOC 00B:14-15]`, Owner ruling §3 `[DOC 00C:32-33]`.
- Historical saves keep reconstructing exactly as before: their `originalScreenplays`
  root migrates in empty.
- `[PROPOSAL]` The Owner's framing "templates" is best honoured **without** building a
  template system in C2: the pool's *statistical shape* (the six substream
  distributions at `[CODE src/core/worldgen.ts:549-563]`) is what a minted concept
  reuses. That is a shared function, not a new content layer. Genre-keyed word lists
  and era-sensitive premises belong to C4 `[DOC 00C §3]`.

**Difficulty: EASY** (it is a decision to change nothing).

### 8.9 Deterministic title + latent generation

Follow `generateConcepts` exactly, but from a **new purpose-keyed versioned stream**
per guardrail G `[DOC 00C:66-71]`:

```
RngPurpose += 'screenplay-v1'

key = conceptId                    // 'concept-orig-0000' — stable, mint-ordinal derived
stream(seed,'screenplay-v1', `${conceptId}:title`)        → 2 draws: lead idx, noun idx
stream(seed,'screenplay-v1', `${conceptId}:strength`)     → truncatedNormal(60,15,20,95)
stream(seed,'screenplay-v1', `${conceptId}:originality`)  → truncatedNormal(55,20,5,100)
stream(seed,'screenplay-v1', `${conceptId}:roles`)        → per SLOT_ORDER: target axes uniform(-1,1), tolerance uniform(0.8,1.8)
// baseNegativeCost derived from strength (see §8.7) — NOT an independent draw
```

Properties, all matching shipped precedent:
- **Derived-only** → never advances `state.rngState` → §15.7 replay-exactness and M0A
  byte-identity preserved `[CODE src/core/rng.ts:16-19, :187-191]`.
- **One substream per field** so a future field addition shifts nothing
  `[CODE src/core/worldgen.ts:539-544]`.
- **Versioned `-v1`** so a recalibration re-keys cleanly `[CODE src/core/rng.ts:42-52]`.
- **Keyed on the mint ordinal, never on a week or a year** → era-clean (§7.4).
- **Reuses `TITLE_LEAD`/`TITLE_NOUN` unchanged** — no new authored content in C2
  `[CODE src/core/data/wordlists.ts:39-62]`.
- Genre is the **player's choice**, not a draw — that is the Owner's "player chooses
  creative direction" `[DOC 00C §3]`.

`[PROPOSAL]` **Genre-keyed titles are corpus-correct but are NOT V1.** The original
keyed generated titles to genre `[CORPUS Prima, Advanced Movie-Maker intro + Genre
section, quoted §7.3]`. Honouring it requires five genre-keyed word lists — authored
content, i.e. exactly the kind of scope the ruling fences to C4. Record it as a
deliberate, sourced deferral, not an oversight.

**Difficulty: EASY.**

### 8.10 The exact list of closed surfaces that must OPEN

Under §8.2, **most open for free**. These are the ones requiring a deliberate change:

| # | Surface | Required change | Difficulty |
|---|---|---|---|
| O1 | `[CODE src/core/scriptReadModel.ts:548-555]` `no-concepts` blocker | Stop being terminal; route to the original-screenplay commission, or stop firing | EASY |
| O2 | `[CODE src/core/scriptReadModel.ts:37-48]` blocker-kind enum | Possibly a new kind if original commission has its own gate | EASY |
| O3 | `[CODE ui/src/lot/snapshot/scriptReview.ts:179]` / `[CODE ui/src/lot/snapshot/castingReview.ts:194]` blocker allow-lists | Mirror any new blocker kind | EASY |
| O4 | `[CODE src/core/scriptReadModel.ts:126-130]` `CommissionConceptView` | Optional `origin` flag | EASY |
| O5 | `[CODE ui/src/lot/snapshot/scriptCommission.ts:537-545]` exact-key mirror of O4 | Must be updated in lockstep or the workspace silently rejects | **MEDIUM — easy to miss** |
| O6 | `[CODE ui/src/screens/WritersRoom.tsx:253-259]` commission `<select>` | New "commission an original" affordance; genre picker | MEDIUM |
| O7 | `[CODE src/core/types.ts:1260-1297]` `Action` union | Two new verbs | EASY |
| O8 | `[CODE src/core/save.ts:3530]` state-key list + validator chain | V14 | MEDIUM |
| O9 | `[CODE src/core/productionIdentity.ts]` | New sibling `persistedConceptIds` | EASY |
| O10 | `[CODE src/core/rng.ts:34-52]` `RngPurpose` | `+ 'screenplay-v1'` | EASY |
| O11 | `[CODE src/core/studioRunRecap.ts:376-380]` `minConcept` | **No code change**, but the affordability quote will start naming generated concepts — name it in the contract | EASY |
| O12 | `[CODE src/core/candidates.ts:201, :236]` | **No code change**, but assert in a test that the headless corpus never mints, so the sim-stream draw count is unchanged | EASY |
| O13 | `[CODE src/core/employment.ts:415]` `correlateConceptCost` | **No code change — an explicit prohibition + a regression test** (§8.7) | MEDIUM |

### 8.11 Scope flags — what would push past "smallest deterministic V1"

Fence these to C4 (or to a separate ruled milestone):

| Item | Why it exceeds V1 |
|---|---|
| **Variable draft weeks by writer experience** | Relaxes a shipped save invariant `[CODE src/core/scriptDevelopment.ts:900-916]` and re-tunes every EST-timing test. §5.4/§6. |
| **Removing the `0.4·writing` quality term** | Re-tunes every script EST and every downstream acceptance test `[CODE src/core/scriptDevelopment.ts:352-362]`. Owner decision, §9. |
| **Genre-keyed title word lists** | Authored content ×5 genres. Corpus-correct `[CORPUS Prima]` but content, not mechanism. §8.9. |
| **Multi-writer pooling ("more writers = faster")** | `[CORPUS Bible §5.4, Prima 5-writer cap]`. Requires `ScriptProject.writerId` → a writer *set* — a frozen V9 leaf widening. Hard NO for V1. |
| **Era-sensitive premises / evolving genre interest / research** | Explicitly C4 `[DOC 00C §3]`. Also impossible today: no calendar year exists (§7.4). |
| **Script selling / acquisition / a script market** | `[CORPUS Bible §5.4 "Star and Script Selling Facility"]`. Not in the ruling. Would need a ledger kind. |
| **Renaming pool concepts** | Mutates authored world data. One-line predicate; defer until the Owner asks. |
| **Abandon / shelve a screenplay** | Not in the ruling; would need an eighth `ScriptProjectStatus` — a frozen V9 enum widening `[CODE src/core/save.ts:2753-2755]`. |
| **A lifetime cap of any kind** | Explicitly forbidden by the ruling `[DOC 00C:26]`. Note the counter must be an unbounded integer, and §11's performance awareness applies: `state.concepts` grows without bound, and eleven `.find()` lookups are O(n) linear scans. At a few hundred concepts this is nothing; the architect should still record it rather than discover it `[DOC 00C §11]`. |

---

## 9. CORPUS SWEEP — WHAT IS CONFIRMED vs OWNER-RECOLLECTION-ONLY

The Owner explicitly required this distinction be preserved `[DOC 00C:34-37]`.

### 9.1 CONFIRMED by the corpus (independent of the Owner)

| Claim | Evidence |
|---|---|
| Writers assigned to Script Offices **auto-generate scripts** | `[CORPUS Bible line 1038: "Scripts are auto-generated by hired writers"; OFFICIAL manual pp.11-13]` |
| A writer is dropped into a **genre room**; genre is the player's creative direction | `[CORPUS Bible §5.1, §5.4; OFFICIAL manual p.12; Prima: "Five Genre Rooms: To begin a script in a specific genre, drop a scriptwriter into the corresponding room"]` |
| Writing **consumes time** and the writer is occupied in the pool | `[CORPUS Bible §5.4, §5.6 step 6; OFFICIAL manual pp.12, 17]` |
| **One script at a time per Script Office building**; more offices = more parallel scripts | `[CORPUS Prima verbatim, quoted §6.1; Bible §5.4]` |
| **Office tier is a hard quality ceiling** (Basic 1★ / Intermediate 2★ / Proficient 3★ / First Class 4★) | `[CORPUS Bible §5.2 table; Prima "The level of the Script Office dictates the quality of scripts it can produce"]` |
| **Writer experience affects speed ONLY, never quality** | `[CORPUS Prima verbatim, quoted §6.1; Bible §5.4]` — **with a preserved GameSpot contradiction** |
| More writers on one script = **faster**, not better | `[CORPUS Prima; OFFICIAL manual p.12; Bible §5.4]` |
| Completed scripts have **titles** shown on movie cards | `[CORPUS Bible: DIRECTLY OBSERVED — "Atomic Ray Versus The Spidrons Of Doom", "The Baggage Boy", "Wake Up And Die Again"]` |
| A **randomly generated title** exists, is **genre-keyed**, and the player may **enter their own instead** | `[CORPUS Prima, Advanced Movie-Maker intro screen, verbatim §7.3]` |
| Generated names being **overridable** is an established pattern | `[CORPUS Prima: "Character names are randomly generated based on gender and genre but can be overridden"]` |
| A completed script is a **persistent studio asset**, sellable | `[CORPUS OFFICIAL manual p.17 "Star and Script Selling"; Bible §5.4]` |
| Script quality has a **published 8-factor model** with two flagged internal inconsistencies | `[CORPUS Bible §5.7; OFFICIAL Prima]` |

### 9.2 OWNER-RECOLLECTION-ONLY (preserved as such, per instruction)

| Claim | Status |
|---|---|
| **The player can RENAME a script after it is written** | **NOT CONFIRMED.** Exhaustive grep for `rename` / `renaming` / `re-name` across the Bible, the Comparative Design Register, the Source Register, all `THE-MOVIES-2005-ORIGINAL-DATA/*.csv`, and the extracted Prima OCR: the **only** hit in the entire corpus is an unrelated line about screenshot filenames `[CORPUS Bible line 3674]`. The **closest** support is (a) Prima's Advanced-Movie-Maker "Enter your own title", which is *naming at authoring time on the CUSTOM path*, not renaming an already-written script on the STANDARD path, and (b) the "can be overridden" precedent for generated character names. |
| **Titles on the STANDARD (auto) path are auto-generated** | **STRONGLY IMPLIED, NOT STATED.** Titles demonstrably exist on standard-path films `[CORPUS DIRECTLY OBSERVED screenshots]`, and the standard path gives the player no naming step `[CORPUS OFFICIAL manual p.12 — drop a writer into a genre room; that is the whole input]`. But no source says "the game names the script for you". |
| **ACTIVE-UNRESOLVED-QUESTIONS.csv coverage** | **THERE IS NO ROW** on title generation or renaming. All 70 rows swept; the script-system rows are Q004 (Intermediate office cost), Q005 (its unlock), Q014 (Lead Roles wedge sub-slots), Q015 (crew/extras cap), Q036 (4-stage templates), Q051 (novelty vs originality), Q068 (tutorial wording). **Neither titling nor renaming has ever been logged as an open question** — meaning the gap was not merely unresolved, it was never noticed. |

`[PROPOSAL]` Because the ruling is made regardless `[DOC 00C:36-37]`, the honest record
is: **RSG V1's rename is a successor design decision with a partial corpus analogue
(custom-path naming + overridable generated character names), not a reconstruction of
an observed standard-path mechanic.** The architect should say that in the charter so a
future reader does not mistake it for recovered truth. `[PROPOSAL]` Also worth adding
a row to `ACTIVE-UNRESOLVED-QUESTIONS.csv` — *"Can an auto-generated script's title be
renamed on the standard path?"* — since the corpus never asked it.

---

## 10. RISKS, GAPS, AND CONTRADICTIONS

1. **⚠ CONTRADICTION — writer experience.** Corpus law and the Bible's own successor
   ruling say *speed only, never quality* `[CORPUS Prima verbatim; Bible §5.4, §5-B]`.
   Shipped C1 does the exact inverse: writer skill is 40% of quality
   `[CODE src/core/scriptDevelopment.ts:352-362]`, and speed is a constant
   `[CODE src/core/scriptDevelopment.ts:284, :506]`. **Recorded in no repo doc**
   (grep: zero hits). Not resolved here. Owner decision, §11.1.

2. **⚠ TRAP — `correlateConceptCost`.** Re-running it after appending would silently
   re-price every concept and change realized reception for already-greenlit films
   `[CODE src/core/employment.ts:385-401, :415]` `[CODE src/core/reception.ts:246]`.
   Needs an explicit contract prohibition **and** a regression test.

3. **⚠ SILENT-FAILURE SURFACE — the lot workspace's exact-key mirror.** Adding a field
   to `CommissionConceptView` without updating
   `[CODE ui/src/lot/snapshot/scriptCommission.ts:537-545]` makes the workspace reject
   the board with no obvious error. Enumerated as O5.

4. **UNDOCUMENTED CEILING.** The 30-film campaign ceiling and the terminal
   `no-concepts` blocker appear in **no** `docs/` file. The only near-mentions are two
   stale notes describing the headless corpus `[DOC docs/rev4-open-questions.md:297]`
   `[DOC docs/HANDOFF.md:1476]`. Anyone reading the docs alone would not know the
   supply is finite.

5. **FROZEN-LEAF PRESSURE.** `FilmConcept` has zero optional fields and an empty
   optional-key list in the V8 validator `[CODE src/core/save.ts:1379-1395]`. The first
   instinct of any implementer — "add `origin: 'pool'|'original'` to `FilmConcept`" —
   is a guardrail-4 violation. Say so in the contract before someone tries it.

6. **RENAME vs FROZEN HISTORY.** A rename will not update
   `TalentCareerEvent.filmTitle` `[CODE src/core/types.ts:1234]` or a
   `BroadcastItem.template` `[CODE src/core/broadcast.ts:288-300]`. Defensible, but it
   *will* be reported as a bug in playtest unless it is stated.

7. **HEADLESS DETERMINISM.** `candidates.ts` draws a concept index from the **persisted
   sim stream** `[CODE src/core/candidates.ts:236]`. Growing `state.concepts` changes
   RandomAgent/Oracle behaviour for a given seed. Safe only because M0A never founds
   and therefore never mints — but that is a *consequence*, not a guarantee. Needs a
   test that asserts it.

8. **LINEAR SCANS.** Eleven concept lookups are `Array.prototype.find` over
   `state.concepts` (§2.3-B). Fine at 30; worth noting against ruling §11's
   performance-awareness posture `[DOC 00C:72-74]` for an unbounded 120-year campaign.
   Not a reason to optimize now; a reason to record now.

9. **`pad2` is 2-wide** `[CODE src/core/worldgen.ts:163-165]`. Harmless under the
   proposed 4-wide namespaced scheme, but a latent trap if anyone raises
   `conceptCount` past 99.

10. **`minConcept` behaviour drift** `[CODE src/core/studioRunRecap.ts:376-380]` — the
    recap's affordability quote starts naming generated concepts. Cosmetic; name it.

---

## 11. OWNER DECISIONS NEEDED

1. **The writer-experience inversion (§6).** The corpus law is *speed only, never
   quality*; C1 ships the inverse. Options: (a) accept the divergence and record it as
   a deliberate successor choice — cheapest, zero risk to RSG V1; (b) invert it inside
   RSG V1 — re-tunes every script EST and relaxes a shipped invariant; (c) fence it to
   a separate ruled milestone. **Recommended: (a) or (c). Not (b).**

2. **Rename scope.** Generated concepts only (V1 recommendation), or pool concepts too?
   And: may a film be renamed **after release**, accepting that career records and
   press clippings keep the old title (§4.3-B)?

3. **Is genre-keyed title generation in or out?** Corpus-correct
   `[CORPUS Prima, §7.3]` but requires five authored word lists. **Recommended: out of
   V1, recorded as a sourced deferral to C4.**

4. **What replaces the terminal `no-concepts` blocker?** Once originals exist, does the
   30-concept pool remain a *finite premium* the player can exhaust (recommended — it
   makes the original path meaningful), or should exhaustion become invisible?

5. **Provenance visibility.** Should the player *see* which screenplays their studio
   wrote vs which came from the world pool? This is the difference between "a writer
   goes to work and hands me a new movie" landing as a felt achievement or as an
   invisible plumbing change. **Recommended: yes — a provenance flag on the commission
   view (O4/O5).**

6. **Corpus record-keeping.** Should a row be added to
   `ACTIVE-UNRESOLVED-QUESTIONS.csv` for the never-asked question *"can an
   auto-generated script's title be renamed on the standard path?"* (§9.2)?

---

*End of Lane 14 report.*
