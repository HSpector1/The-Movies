# LANE 3 — ORIGINAL-GAME SETS / STAGES DATASET ANALYSIS

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> Read-only lane. This file is the only file this agent writes.
> Corpus root: `/Users/bruce/Desktop/Big Swing Art/` (read-only evidence).

**Tag key (used on every load-bearing claim):**
`[CORPUS]` = observed in the 2005 evidence corpus · `[CODE]` = observed in this repo's
source · `[DOC]` = observed in a governing doc (brief / master plan / operational laws) ·
`[PROPOSAL]` = this agent's recommendation, not an observation.

**Confidence tier key (per the lane brief's requested taxonomy):**

| Tier | Meaning |
|---|---|
| **DEV-SCHEMA-PROVEN** | The field/behaviour is visible in real engine `.ini` data (`set_definition_schema.csv`, `facility_candidates.csv`, `schema_fields.csv`). Schema is proven; the *values* in those files are custom/modded and are never treated as vanilla. |
| **GUIDE-CORROBORATED** | Two or more independent 2005-era sources agree (Prima developer-reviewed guide + manual / GameSpot / IGN / GameFAQs), or Prima + a directly-observed screenshot. |
| **SINGLE-SOURCE** | One source only, uncorroborated. |
| **INFERRED** | Not stated by any source; this agent's reading of the assembled data. Always flagged inline. |

---

## 0. Headline for the architect (read this if you read nothing else)

1. **[CORPUS] The original had no Stage building.** There is no "soundstage" facility
   type in the 2005 game. "Stage" is a **Set** — `Stage (generic)`, pre-built at game
   start, hidden Quality **5 out of 100**, i.e. deliberately the worst object in the
   catalog. Every other Set is a peer object in the same catalog. Owner law #4
   ("Stages are player-built production capacity") is therefore a **deliberate C2
   divergence from the original, not parity** — and it is the right one, but the
   charter must say so out loud rather than cite the original as precedent.
2. **[CORPUS] Sets carry four independent per-object numbers**, and only one of them is
   the "quality" number people remember: hidden **Quality** (1–100), **Boredom Factor**
   (~20–38 observed), **Attractiveness** (always negative, −25…−60 observed), and a
   maintenance/decay block (`decaytime`/`repairwork`) shared with facilities.
3. **[CORPUS] Cost does not buy quality — cost buys era-tier.** Across the 11 fully
   statted rows, cost↔quality Spearman ρ ≈ **+0.76** but with real inversions
   (Suburban: Diner, Quality 25, costs $58,804; War: Bombed Street, Quality 95, costs
   $74,000; War: Battlefield, Quality **0**, costs $5,000).
4. **[CORPUS] Boredom Factor is inversely correlated with cost** (ρ ≈ **−0.66**): cheap
   early sets get stale fastest. What the field *does* is **undocumented by every
   source in the corpus and is not even carried as an open question** — see §7. This is
   the single largest unclaimed hole in the Sets dataset.
5. **[CORPUS] The scene→set binding table does not exist in the corpus.** The rule
   ("a script names the sets it requires; the set flags red if unowned / unrepaired /
   occupied") is manual-confirmed, but `scene_catalog.csv` carries **no set column** and
   no source recovered the mapping. C2 must **author** its own scene→set demand model;
   there is nothing to port.
6. **[CORPUS] The original's *hard block* on a busy set is exactly Owner law #2's
   failure mode.** "Another film is already shooting on it" was a hard block with no
   queue. C2's QUEUE-DON'T-FORBID law is a divergence from the original — again the
   right one, again worth naming.

---

## 1. Scope and sources actually read

**Read in full** [CORPUS]:
`THE-MOVIES-2005-ORIGINAL-DATA/set_catalog.csv` (39 data rows), `scene_catalog.csv`
(40 data rows), `facility_catalog.csv` (28 data rows), `movie_rating_pipeline.json`,
`original_formulas.json` (key scan);
`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/set_definition_schema.csv` (8 rows),
`prop_blueprint_schema.csv` (3 rows), `schema_fields.csv` (11 rows),
`dormant_or_unconfirmed_fields.csv` (7 rows), `facility_candidates.csv` (29 rows),
`technical_artifact_conflicts.csv`, `candidate_vanilla_values.csv`,
`vanilla_diff_backlog.csv`, `known_or_likely_modified_values.csv`,
`social_relationship_schema.csv`.

**Read by section** [CORPUS] — `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`:
§3 Building Catalog (lines 589–680), §4 Sets and Film Locations (681–797),
§5.7 Script scoring (902–945), §7 Production Pipeline (1030–1104),
§8.1/8.2/8.5 Quality factors (1124–1181), §9 Sets/rehearsal (1236–1263),
§16 Training/rehearsal-vs-practice (1817–1868), §25 Construction (2519–2579),
§26 Lot Prestige/decay (2580–2609), §38 parity matrix Sets row (3360),
§39/§41 building-as-UI table (3620–3637).
Plus `THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md` §12, §18, §20.

**Sweeps** [CORPUS]: `ACTIVE-UNRESOLVED-QUESTIONS.csv` (70 rows, two passes),
`source_conflicts.csv` (57 rows, 20 matched the set/stage/scenery/rehearsal filter).

**Code anchors touched (read-only)** [CODE]: `src/core/operations.ts`,
`src/core/tuning.ts`, `src/core/actions.ts`, `src/core/types.ts`, `src/core/lot.ts`.

**Not read:** Prima eGuide PDF/EPUB and GameFAQs PDFs were not opened directly. Every
Prima/GameFAQs/IGN/GameSpot claim below is cited **as the corpus reports it**, with the
corpus's own source tag preserved. Where the Bible says it cross-checked Prima against
GameFAQs/GameSpot, that cross-check is reported, not independently re-performed. This
is a stated limit of this lane, not a silent one.

---

## 2. What a "Set" is — the object model

### 2.1 The engine-level schema (DEV-SCHEMA-PROVEN)

[CORPUS] Recovered from two independent custom-set mod packages (`big_blue.zip`, 1 set;
`wintersets.zip`, 5 sets by a different author "Zapster"), cross-validated against each
other — `set_definition_schema.csv` rows TECH-SET-001…008:

| Artifact row | Field | Example value | What it proves |
|---|---|---|---|
| TECH-SET-001 | `dated` | `date_1937` / `date_1955` | Calendar year the set becomes available |
| TECH-SET-002 | `boredom` | `0.25` / `0.27` | Boredom Factor is a **real 0–1 float on the set definition itself** |
| TECH-SET-003 | `quality` | `0.8` / `0.85` | Hidden Quality is a **0–1 float**; Prima's "1–100" is very likely this ×100 |
| TECH-SET-004 | `backdrop` | `bd_can_blue` / `bd_winterstrasse_04` | Named backdrop-texture linkage per set |
| TECH-SET-005 | `[scene] setid` | `41` / `15` | Sets carry a **numeric catalog/scene ID** distinct from display name |
| TECH-SET-006 | `[weather] rain/snow/fog` | `0/0/0` in both samples | Per-set weather-support flags exist |
| TECH-SET-007 | `[blueprint] path` / `[blueprint/requires]` | `path=group_city`; `requires 0=date_1909` | Sets use the **same category-path + date-gated unlock mechanism as facilities** |
| TECH-SET-008 | `[genre] genre_action=0.7 … priority1=genre_action` | — | Genre association is a **per-genre float weight plus an explicit priority genre**, not a binary flag |

[CORPUS] `schema_fields.csv` TECH-SCHEMA-001/003/004 add three more blocks that the
schema explicitly marks **shared between facility and set**:

- `[finance] purchasecost / annualcost / dailyrate` — **three independent cost
  channels**. `annualcost` and `dailyrate` are **0 in every example found**, so upkeep
  either shipped unused or was never exercised by the mods examined (TECH-SCHEMA-001).
- `[maintenance] decaytime / repairwork / buildingwork / rebuildingwork` — per-object
  decay rate and construction/repair labour cost. `rebuildingwork` is 0 everywhere
  (TECH-SCHEMA-003).
- `[blueprint] maxinstances / trickiness / given / researchable / ETA / menutype /
  path / grouporder / availableindebt` — the unified catalog schema shared by
  **facilities, sets AND props** (TECH-SCHEMA-004). `maxinstances=-1` means unlimited
  copies; `=1` means singleton.

[CORPUS] `prop_blueprint_schema.csv` TECH-PROP-001/002/003: the engine splits every
placeable object into **three independent files** — physical asset (`data/props/`, mesh
only) / placement definition (`data/setdressing/`: `size`, `mesh`,
`[finance] annualcost`) / catalog registration (`data/propblueprint/`: purchasability,
menu placement, unlock eligibility). Confidence: DEV-SCHEMA-PROVEN, described in the
technical register as "the cleanest, most unambiguous schema finding in the whole pass"
(`THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md` §13).

**Standing caveat the corpus itself imposes** [CORPUS]: `vanilla_diff_backlog.csv`
TECH-DIFF-001 states that **no clean vanilla data of any kind was found anywhere in the
collection** — every `.ini` examined comes from a mod. Therefore all schema above is
proven; **none of the numeric values in those files is vanilla content.** The vanilla
numbers come from Prima, and only from Prima.

### 2.2 The guide-level object model (GUIDE-CORROBORATED)

[CORPUS] Bible §4 line 691: *"each Set in The Movies is its own placeable, fully modeled
lot structure/environment — there is no separate 'Soundstage' building type distinct
from Sets"* [OFFICIAL manual p.20 + PLAYER DOCUMENTED Codex Gamicus].

[CORPUS] Bible §4 line 695 draws the load-bearing functional line:
**Sets** (Build > Sets) are functional — required by scripts, occupiable by an active
shoot, usable off-shoot for rehearsal. **Landscape and Ornaments** are purely
decorative/Prestige. A Set decays and needs repair *exactly like a building*, tracked by
the same "Lot Prestige – Repair Level" indicator [OFFICIAL manual p.20 + DIRECTLY
OBSERVED `Screenshot 2026-08-17 at 11.34.52 AM.png`].

**Per-set fields Prima publishes** (Bible §4 lines 746–756, mirrored into
`set_catalog.csv` columns): `set_name`, `hidden_quality_1_100`, `cost`,
`attractiveness_effect`, `practice_genre`, `unlock_condition`, `boredom_factor`.

---

## 3. The catalog — how many sets, what families, what the numbers say

### 3.1 Counts and families

[CORPUS] `set_catalog.csv` — **39 rows**, all sourced `PRIMA_2005`, source tier
`DEVELOPER-REVIEWED (Prima)`, locator *"Buildings and Ornaments / Set Quality tables
(pp.14-27, 55-61)"*. Claim status: **12 SETTLED / 27 INCOMPLETE**.

| Family | Rows | Notes |
|---|---|---|
| Urban | 10 | Alleyway, Bar, City Block Corridor, City Street, Modern Bank, Municipal Building, Office, Plush Hotel Bedroom, Rooftop, Wall Section |
| Suburban | 8 | Bathroom, Diner, Living Room 1/2, Modern Jail, School Corridor, School Library, Street |
| Rural | 6 | Field, Forest, Graveyard, Musty Cellar, Shack Exterior, Shack Interior |
| Sci-Fi | 5 | Alien World, Corridor 1/2/3, Starship Bridge 1/2/3 |
| Wild West | 5 | Bank, Desert, Jail, Saloon, Street |
| War | 2 | Battlefield, Bombed Street |
| Tropical | 1 | Beach |
| Traveling Vehicle | 1 | Automobile |
| **Stage (generic)** | 1 | pre-built at game start |

**Nine families.** Note that **five family names are physical/geographic**
(Urban/Suburban/Rural/Tropical/Traveling Vehicle) and **three are thematic-genre-ish**
(Sci-Fi/Wild West/War) — the taxonomy is not internally consistent, which matters for §14.

[CORPUS] The engine corroborates family-as-catalog-path: `set_definition_schema.csv`
TECH-SET-007 shows `path=group_city`, i.e. a category path per set, the same mechanism
facilities use. Confidence: DEV-SCHEMA-PROVEN (mechanism), GUIDE-CORROBORATED (the nine
specific family names, Prima-only).

**Completeness is explicitly not claimed** [CORPUS]: `ACTIVE-UNRESOLVED-QUESTIONS.csv`
Q040 — *"Full roster of base-game Sets beyond the 39 now catalogued"*, status ACTIVE,
priority MEDIUM: *"Not confirmed complete; costs, Attractiveness, Practice Genre,
unlock, and Boredom values remain unconfirmed for many rows (Prima's Buildings/Ornaments
pp.14-27 not fully mined)."* Plus Q041: the Stunts & Effects expansion added
**~15 more sets**, of which only 3 are multi-source corroborated (blue-screen,
green-screen, miniature city), 4 single-sourced, ~8–11 entirely unenumerated.

### 3.2 Field coverage — the honest completeness picture

[CORPUS] Computed directly over `set_catalog.csv`:

| Column | Rows with a real value | Rows blank/`n/a`/`$?` |
|---|---|---|
| `hidden_quality_1_100` | **39 / 39** | 0 |
| `cost` | **11 / 39** | 27 `$?` + 1 pre-built |
| `boredom_factor` | **11 / 39** | 28 |
| `attractiveness_effect` | **8 / 39** | 30 `n/a` + 1 `-?` |
| `practice_genre` | **17 / 39** (2 of them hedged) | 22 |
| `unlock_condition` | **13 / 39** | 26 |

**Hidden Quality is the only column that is complete.** Every other column is a minority
sample. Any C2 numeric model derived from these columns is being fitted to 8–17 points.

### 3.3 Quality distribution

[CORPUS] Across all 39: min **0**, max **95**, mean **43.1**.

- Quality **0**: `Urban: Wall Section`, `War: Battlefield`
- Quality **5**: `Stage (generic)` — the pre-built starting set
- Quality **≥80**: `Rural: Shack Exterior` 80, `Wild West: Street` 80,
  `Urban: City Street` 85, `War: Bombed Street` 95

**Design signal [INFERRED from the above]:** the free starting Stage sits at 5/100 and
two purchasable sets sit at 0/100. The scale is not a "how nice is this" score — it is
an explicit *ladder with a deliberately miserable bottom rung*, so that "buy a better
set" is always a legible upgrade, and so that two of the reward sets
(`Urban: Wall Section` = 0) are rewards for reasons other than quality.

### 3.4 The 11 fully statted rows (the only rows that support numeric analysis)

[CORPUS] `set_catalog.csv`, rows where cost + boredom + practice genre + unlock are all
present (these are exactly the 11 non-`Stage` SETTLED rows):

| Set | Quality | Cost | Boredom | Practice genre | Unlock |
|---|---|---|---|---|---|
| War: Battlefield | 0 | $5,000 | 32 | Action | 1923 |
| Wild West: Desert | 15 | $7,000 | 38 | Action | 1920 |
| Suburban: Diner | 25 | $58,804 | 24 | Romance | Platinum Lifetime Honor |
| Wild West: Saloon | 35 | $8,000 | 34 | **Romance** | 1920 |
| Wild West: Jail | 38 | $23,000 | 35 | Action | 1928–1931 (Intermediate Wild West) |
| Rural: Forest | 50 | $22,222 | 38 | Horror | Junior Studio Manager Achievement Award |
| Wild West: Bank | 53 | $16,000 | 30 | **Comedy** | 1925 (Basic Wild West) |
| Sci-Fi: Starship Bridge 3 | 53 | $56,618 | 20 | Sci-Fi | Gold Lifetime Achievement Honor |
| Suburban: School Library | 55 | $99,999 | 24 | Comedy | Movie-Making Legend Achievement Award |
| Wild West: Street | 80 | $80,000 | 25 | Action | 1928–1950 (Advanced Wild West) |
| War: Bombed Street | 95 | $74,000 | 24 | Action | 1928–1939 (Intermediate War) |

**Rank correlations over these 11** [INFERRED — descriptive statistics computed by this
agent over `set_catalog.csv`; n=11, no significance testing, and the 11 are a biased
subsample (they are precisely the rows Prima printed full stat lines for)]:

- cost ↔ quality: **ρ ≈ +0.76** — strong but not clean; the inversions are real.
- cost ↔ boredom: **ρ ≈ −0.66** — expensive sets go stale slower.
- quality ↔ boredom: **ρ ≈ −0.44** — weaker; boredom is *not* just inverse quality.

**Reading [INFERRED]:** cost tracks **unlock tier / era**, not quality. Quality tracks
tier loosely with deliberate exceptions. Boredom is a **third, semi-independent axis** —
which is why it deserves its own section (§7).

Note also the two **genre inversions** in the table: `Wild West: Saloon` trains
**Romance**, `Wild West: Bank` trains **Comedy**. Practice genre is *not* derived from
the set's visual family. That is design intent, not noise, and it is exactly what the
weighted `[genre]` block (TECH-SET-008) exists to express.

### 3.5 Practice-genre coverage across all 39

[CORPUS] Action 5 · Sci-Fi 5 · Comedy 2 (+1 hedged `Urban: Wall Section`, GameSpot-only)
· Romance 2 (+1 hedged `Stage (generic)` = "Romance (typical default)") · **Horror 1**
(`Rural: Forest`) · `n/a` 22.

**Horror is represented by exactly one known practice set.** Given 22 unknowns this is
almost certainly an extraction artefact rather than the shipped balance — but it is what
the dataset actually says, and C2 must not read "Horror was under-served" out of it.

---

## 4. Hidden Quality — mechanic, confidence, and where it lands

[CORPUS] **What it is:** every set carries an invisible 1–100 quality rating. It feeds
the **"Average Set Quality"** factor of Prima's 8-factor *script*-quality model, worth
**up to 3/4 star / 12%** of script quality, averaged across all sets used
(`movie_rating_pipeline.json` stage 1 `custom_script_scoring_factors`; Bible §5.7 line
916–925). Adjacent factor: **"Set Variety" up to 1 star / 20%, requiring 10 set changes
to max** (`movie_rating_pipeline.json`; Bible §5.7 line 912).

[CORPUS] `movie_rating_pipeline.json` stage 1 note: *"Set quality and scene quality are
explicitly stated as NOT visible to the player in the shipped game."*

**Confidence: GUIDE-CORROBORATED.** Prima is the primary; `source_conflicts.csv`
CONFLICT_012 records that **IGN independently corroborates the same concept and the same
two example values** (Rural Field = 10, Urban City Street = 85) — while noting both
guides likely drew on the same underlying table. Independently, the engine schema
(TECH-SET-003, `quality = 0.8`) proves a per-set quality float exists at all, upgrading
the *existence* of the field to DEV-SCHEMA-PROVEN even though the *values* are Prima-only.

**Two set-quality channels, not one** [CORPUS] — this is easy to conflate and C2 must not:

1. **Hidden Quality** → **Script Quality** (stage 1), via *Average Set Quality*.
   Set identity chosen at authoring time.
2. **Repair of Sets** → **Production Quality** (stage 2). `movie_rating_pipeline.json`
   stage 2 components: *"Repair of Sets — Set Maintenance level below full repair
   decreases production quality."* Set **condition** at shoot time.

Plus a third, downstream:

3. **Novelty Value** → **Success** (stage 4). `movie_rating_pipeline.json` stage 4:
   *"Novelty Value (audience boredom with repeated sets AND repeated actor appearances;
   both degrade novelty)."*

So a Set touches **three of the five rating stages** with three different numbers. That
is the strongest single argument in the corpus for Sets being a first-class simulation
entity rather than a reservation token.

---

## 5. Novelty decay across films

[CORPUS] **Across movies:** *"New sets start at 100% and degrade with use"* as they are
reused for multiple shoots; players are advised to diversify set locations to keep this
input high (Bible §8.2 line 1144) [PLAYER DOCUMENTED — gamepressure.com "Releasing a
Movie"].

[CORPUS] **Within one movie: locked.** The novelty value used in a given film's rating is
fixed to the set's novelty **at the moment production began**, not decremented
scene-by-scene. The worked example given: *a 250-scene movie shot entirely on one
perfect-novelty set still scores perfect novelty for that movie*, even though the set's
novelty for **future** movies depletes normally after release (Bible §4 line 732, §5.7
line 933, §8.2 line 1144) [PLAYER DOCUMENTED — GameFAQs synthesis, confidence medium,
**no direct Prima corroboration found**].

[CORPUS] **Novelty is confirmed as a Success-stage factor, driven by both sets and
actors:** `movie_rating_pipeline.json` stage 4, and `ACTIVE-UNRESOLVED-QUESTIONS.csv`
Q051 (*"Novelty Value ... is confirmed to exist and to be driven by repeated sets AND
repeated actor appearances"*).

**Confidence split — this matters:**
- Novelty *exists as a Success-stage factor driven by set repetition*: **GUIDE-CORROBORATED**
  (Prima via `movie_rating_pipeline.json` + community sources).
- The *within-movie lock* refinement: **SINGLE-SOURCE** (GameFAQs synthesis; the Bible
  itself flags "confidence medium, no direct Prima corroboration").
- The *decay rate*, the *recovery rule* (does novelty regenerate over time?), and
  *whether novelty is per-set-instance or per-set-type*: **NOT DOCUMENTED AT ALL**.
  `ACTIVE-UNRESOLVED-QUESTIONS.csv` Q013 asks exactly this and is ACTIVE at priority LOW:
  *"Whether a second physical copy of the same set type resets its novelty independently,
  and whether novelty tracks per-instance or studio-wide ... Cross-movie and
  cross-instance behavior for a duplicated set type is unaddressed."*

**[PROPOSAL] Q013 is mis-prioritised for C2's purposes.** For the original's own history
it is LOW. For C2 it is a **design fork with different downstream architectures**
(per-instance novelty makes duplicate sets a real capacity+freshness purchase; per-type
novelty makes duplicates purely a concurrency purchase). C2 must *choose*, not inherit.
See §15.

---

## 6. Physical decay and repair

[CORPUS] **Sets decay exactly like buildings, and unrepaired sets are unusable.**

- *"buildings and sets decay over time and 'will eventually become unusable if they do
  not receive maintenance or repair by your staff'"* — Bible §3 line 665 [OFFICIAL:
  manual p.4, p.20]; toggleable off via a **"Buildings Don't Decay"** New Game/Sandbox
  setting.
- *"a building cannot be used again until it's fully repaired"* — Bible §25 line 2578
  [OFFICIAL: manual p.18].
- **Repair is a Builder-labour cost, not a cash cost.** `schema_fields.csv`
  TECH-SCHEMA-003: `[maintenance] decaytime=2.5, repairwork=13, buildingwork=40,
  rebuildingwork=0` — per-object decay rate + construction/repair labour, shared field
  block between facility and set. `rebuildingwork` is 0 in every observed example.
- **No numeric builder-count↔speed relationship exists in any source.**
  `ACTIVE-UNRESOLVED-QUESTIONS.csv` Q028: *"Exact numeric relationship between builder
  count and construction/repair time — Qualitative 'more builders = faster' statement
  only. No formula or rate found in any source."*

[CORPUS] **Decay is surfaced physically, not in a panel.** A red/yellow floating
**"Lot Prestige – Repair Level"** label with a directional arrow hovers directly over the
damaged structure; the set is wrapped in wood scaffolding with hazard striping; the label
flips green/up-arrow once repaired (Bible §3 line 665, §26 line 2588) [DIRECTLY OBSERVED:
`Screenshot 2026-08-17 at 11.34.52 AM.png` (damaged) vs `11.38.00 AM.png` (repaired)].

[CORPUS] **Two distinct consequences of disrepair, and the corpus is careful to
distinguish them:**
1. **Hard block on use** — a set "in need of repair" is flagged red and cannot host a
   shoot (Bible §7.1 "Set allocation" row, line 1052) [OFFICIAL: manual p.12/13].
2. **Quality penalty** — *"Repair of Sets: Set Maintenance level below full repair
   decreases production quality"* (`movie_rating_pipeline.json` stage 2).

   ⚠️ **Internal corpus tension:** Bible §7.1 line 1052 says set repair level *"affects
   usability, not documented to affect quality score directly"*, while
   `movie_rating_pipeline.json` stage 2 lists "Repair of Sets" as an explicit Production
   Quality component. These are the same corpus disagreeing with itself. Logged in §16.

**Confidence:** decay+repair exists and blocks use: **GUIDE-CORROBORATED** (manual +
direct screenshots + engine `[maintenance]` block = DEV-SCHEMA-PROVEN for the fields).
Decay *rate* and repair *speed*: **not documented** (only mod-file example values).

[CORPUS] **Upkeep money channel exists but appears unused.** `schema_fields.csv`
TECH-SCHEMA-001: `[finance] purchasecost / annualcost / dailyrate` — *"annualcost/dailyrate
are 0 in every example found this pass ... either unused in the base game or not exercised
by any mod examined."* So in the original, **a set costs capital once and labour forever,
but no visible recurring cash.**

---

## 7. Boredom Factor — the biggest undocumented field, and an analysis

[CORPUS] Prima publishes a per-set **"Boredom Factor"** as a named stat-line field
alongside Cost, Practice Genre and Unlock (Bible §4 line 756; `set_catalog.csv` column
`boredom_factor`). Observed values across the 11 statted rows: **20, 24, 24, 24, 25, 30,
32, 34, 35, 38, 38.**

[CORPUS] The Bible's own verdict on what it does: *"'Boredom Factor' is genuinely new;
its interaction with a Star's Boredom bar is not detailed by Prima beyond the name and
value — flagged, not resolved."* (Bible §4 line 756).

[CORPUS] The engine confirms the field is real and 0–1: `set_definition_schema.csv`
TECH-SET-002, `boredom = 0.25 / 0.27` — *"Confirms the Bible's documented 'Boredom
Factor' is a real 0-1 scale engine field on the set definition itself."*

### 7.1 Two live hypotheses (this agent does NOT resolve them)

**H1 — Boredom is the per-set novelty decay rate (audience-side).**
Supporting [CORPUS]: `movie_rating_pipeline.json` stage 4 literally names the novelty
mechanic *"audience **boredom** with repeated sets"*. The novelty mechanic is documented
as existing but has **no rate parameter anywhere else in the corpus**; `boredom` is the
only per-set candidate field. Supporting [INFERRED]: cost↔boredom ρ ≈ −0.66 — cheap
early sets go stale fastest, which is a coherent economic pressure to keep buying sets.

**H2 — Boredom is the set's contribution to an occupant Star's Boredom need.**
Supporting [CORPUS]: Stars carry an explicit **Boredom threshold** in the StarMaker stat
block (Bible §8.3 line 1155 [OFFICIAL: manual pp.34-35]), and Stars physically occupy
sets during rehearsal and shooting. The Bible's own framing of the open question assumes
this reading ("its interaction with a Star's Boredom bar").

**Both are consistent with a 0–1 float on the set definition. Neither is proven.**

### 7.2 The gap this exposes

[CORPUS] **`ACTIVE-UNRESOLVED-QUESTIONS.csv` contains no question about what Boredom
Factor does.** Verified: the only three rows mentioning "boredom" are Q024 (crew mood
exemption), Q040 (set roster completeness) and Q053 (addiction consequences). The Bible
flags it as unresolved in prose (§4 line 756) but it was **never promoted into the
unresolved-questions ledger.**

**[PROPOSAL] Register this as a new corpus question** (suggested `Q071 — What does a set's
Boredom Factor drive: audience novelty decay rate, occupant-Star boredom, or both?`,
priority MEDIUM for C2). Do **not** silently pick H1 because it is convenient for a
throughput design. See §15 for the C2 ruling this forces.

---

## 8. Rehearsal, practice, and what a set does when nobody is filming on it

[CORPUS] The corpus is emphatic that **two similarly-named systems must be kept apart**
(Bible §16 lines 1858–1863):

**(a) "Practice" / "Rehearse on a set" — discretionary, between productions.**
*"Even when not being used for filming, sets can be used by your Stars to improve their
experience in the genre associated with the set. To get your actor or director to
rehearse on a set, simply pick them up and drop them on the Rehearse icon on the set"*
[OFFICIAL: manual p.20] (Bible §9 line 1242, §4 line 712). The manual's worked example:
*"an actor practising on the set of a spaceship will increase his/her science fiction
proficiency."* Prima names the governing field **"Practice Genre"** (Bible §4 line 756).
Outcome distribution is fuzzier: one guide reports practice *"improves randomly either
acting, direction or writing skill plus a random genre, with the highest probability going
to whatever role you have assigned to the creative"* (Bible §16 line 1828)
[PLAYER DOCUMENTED — search synthesis, SINGLE-SOURCE].
**Confidence: GUIDE-CORROBORATED** for the mechanic (manual + Prima + Codex Gamicus);
**SINGLE-SOURCE** for the random-distribution detail.

**(b) "Rehearsing Script" — automatic, non-optional pipeline stage.**
Every film passes through it after casting, before shooting; the movie card banner reads
"Rehearsing Script" with a progress bar and per-Star bubbles read *"Rehearsing the
script."* [DIRECTLY OBSERVED: `Screenshot 2026-08-17 at 11.40.24 AM.png`,
`11.38.00 AM.png`]. Bible §16 line 1863: *"This rehearsal stage does not appear to raise
a star's persistent genre-experience stat the way discretionary set-practice does — it
reads as a production-timeline gate, not a skill-training action."*
**Confidence: GUIDE-CORROBORATED** for existence (in-game tutorial text + two independent
guides + owner screenshots); **the manual is silent on it**, which Bible §7.5 line 1083
logs as a documentation gap, not a contradiction.

**(c) Does rehearsal occupy the set?** [CORPUS] The corpus does **not** say cleanly. Bible
§7.1 line 1051 places Rehearsal at *"Same Casting Office / soundstage building"* — an
ambiguous location. §7.1's *Set allocation* row runs in parallel and its stage-ending
condition is "Set becomes available (built, repaired, and free)". So the original's
rehearsal appears to happen **near/at the production building, not necessarily on the
target Set**, and the Set is not confirmed to be reserved during it. **UNRESOLVED in the
corpus; nobody has asked.**

**(d) Rehearsal builds relationships — a genuinely new schema finding** [CORPUS]:
`social_relationship_schema.csv` TECH-SOC-004 — beyond the six social venues (LOT,
BARNORMAL, BARVIP, CANTEENNORMAL, CANTEENVIP, TRAILER), the engine carries **three
additional relationship-building contexts: `REHEARSE`, `FILM`, `CASTING`.** Each context
key has six tunables: `minscenerange, maxscenerange, mineffect, maxeffect, requiredlevel,
degrade` (TECH-SOC-002, format documented by an in-file comment, not inferred).
**Confidence: DEV-SCHEMA-PROVEN** (schema); values in that file are cheat-modified
(`known_or_likely_modified_values.csv` TECH-MODIFIED-004) and are **not** vanilla.
The technical register (§20) calls this out as *"chemistry building during the work
itself, not only during off-hours socializing ... a materially different and arguably
more elegant pattern than the original's venue-dragging loop."*

**This is the single most C2-relevant social finding: the set is where chemistry is
built, mechanically, in the shipped engine's own schema.**

---

## 9. How scripts and scenes demanded sets

### 9.1 What is confirmed

[CORPUS] Bible §4 lines 707–711 [OFFICIAL: manual p.12], the full documented rule:

1. **A script specifies which set(s) it requires.** Before filming, an information bubble
   on the movie card shows this and **flags the set red** if there is a problem:
   *"either it's in need of repair, you don't own it yet or another film is already
   shooting on it."*
2. If the required set isn't owned, **the player must build it** from the Sets sub-menu
   before the script can proceed.
3. The production radial menu walks **Director → Lead Roles → Begin Casting → Crew (n/m)
   → Extras (n/m) → Shoot It** [DIRECTLY OBSERVED twice, `11.37.40 AM.png` and
   `11.38.00 AM.png`, with different fill states].

[CORPUS] Bible §7.3 line 1069 lists **set unavailability as a HARD BLOCK**: *"required set
not owned, in disrepair ('in red'), or already occupied by a concurrent shoot"* — the
production cannot start or continue. **There is no queue.** The player's documented
remedies are: build the missing set, repair it, or *"wait for the other shoot to vacate"*
(Bible §7.1 line 1052).

[CORPUS] Script-side, sets feed quality through **Set Variety** (10 set changes to max the
1-star/20% factor) and **Average Set Quality** (3/4 star / 12%)
(`movie_rating_pipeline.json` stage 1). A "set change" is defined there as *"scene
followed by a different-set scene."*

**Confidence: GUIDE-CORROBORATED** (manual is explicit; screenshots corroborate the menu;
Prima corroborates the scoring factors).

### 9.2 What does NOT exist — the load-bearing gap

[CORPUS] **`scene_catalog.csv` has no set column.** Its schema is:
`scene_name, hidden_quality_1_100, record_id, source_id, source_locator, source_tier,
confidence, claim_status, base_or_expansion, game_version_context`. **40 rows**, quality
range **75–85**, all `SETTLED`, all Prima-sourced from the *Scene Quality table
(pp.53-61)*.

There is **no scene→set binding anywhere in the corpus**: not in `scene_catalog.csv`, not
in `set_catalog.csv`, not in `set_definition_schema.csv` (which shows a `[scene] setid`
field pointing set→id, but no scene→set requirement list), not in the Bible.

Nor is there a **script→scene composition** table: the 7-beat Hollywood Scriptwriting
Templates per genre are documented (Bible §9 lines 1246–1256 [OFFICIAL manual pp.28-31] —
e.g. Horror: Intro → Shock → Pursuit → Encounter → Preparation → Big Fight → Resolution),
but **no beat→scene and no scene→set mapping was ever recovered.**

**Consequence for C2 [PROPOSAL]:** the "a script demands these sets" mechanic must be
**authored from scratch**. The recoverable shape is: *scripts name a small set of required
sets; unavailability is visible per-set with a specific reason; more distinct sets = higher
script quality up to a cap.* The recoverable numbers are: **none.**

### 9.3 A live corpus inconsistency in the scene data

[CORPUS] ⚠️ Bible §5.7 line 925 cites Prima scene-quality examples *"'Ain't Over Yet' = 90,
'Screen Kiss' = 75"*. `scene_catalog.csv` contains **`Screen Kiss` = 78** (not 75) and
contains **no row named "Ain't Over Yet"** at all, with a catalog maximum of 85. Verified
by direct read of all 40 rows. Logged in §16.

---

## 10. Stage vs outdoor set — the distinction, and what it actually was

**[CORPUS] Finding: in the original there is no stage/set distinction. There is one
catalog.**

Evidence, four independent strands:

1. **The Bible states it directly** (§4 line 691): *"Unlike a generic 'soundstage' that
   hosts interchangeable dressing, each Set in The Movies is its own placeable, fully
   modeled lot structure/environment — **there is no separate 'Soundstage' building type
   distinct from Sets**"* [OFFICIAL: manual p.20 + PLAYER DOCUMENTED: Codex Gamicus].
2. **`Stage (generic)` is a row in `set_catalog.csv`, not in `facility_catalog.csv`** —
   hidden Quality **5**, cost `n/a (pre-built)`, practice genre *"Romance (typical
   default)"*, unlock *"Pre-built at game start"*, claim status SETTLED.
   Bible §4 line 725 adds [PLAYER DOCUMENTED, fandom, single-source] that the
   **Basic Stage** is the first available set and is *"primarily associated with Comedy
   productions"* — note this **contradicts** the catalog's own "Romance (typical default)"
   (logged in §16).
3. **`facility_catalog.csv` (28 rows) contains zero stage/soundstage rows.** Verified by
   grep: 0 hits for "soundstage".
4. **`facility_candidates.csv` — 29 real engine facility `.ini` files — contains zero
   soundstage definitions.** `facility_stage.ini` is the **Stage School** ($5,000,
   `wannabe=30`, hiring/training), not a shooting stage. The collection is described as
   *"a near-complete base-game facility set"* whose only noted gap is Stunts & Effects
   facilities (`vanilla_diff_backlog.csv` TECH-DIFF-006).

**Confidence: GUIDE-CORROBORATED for the positive claim** (manual + Codex Gamicus +
catalog structure). **The engine-level absence (strand 4) is an argument from absence** —
the 29-file collection is not proven complete, so it corroborates rather than proves.

[CORPUS] ⚠️ **The corpus's own terminology is internally inconsistent about this.** §4
line 691 denies the type exists, yet §7.1 (lines 1051–1053), §6.1 (line 962), §11 (line
1474), §32 (line 2880) and the §41 building table (line 3630) all use *"the soundstage"*
as if it were a distinct building — e.g. *"the allocated set/soundstage on the lot"*, *"a
soundstage-style building mid-'Rehearsing Script'"*. Reading the screenshots' own captions
(§39 manifest lines 3679–3688), "soundstage" there is the **researcher's descriptive word
for a large enclosed set structure**, not a confirmed distinct building type. Logged in §16
as a terminology hazard for anyone mining §7 in isolation.

**What the original actually had, restated cleanly [INFERRED from the four strands]:**
one Sets catalog containing both *enclosed/interior* sets (Stage generic, Suburban:
Living Room, Sci-Fi: Starship Bridge) and *open/exterior* sets (Wild West: Street, Urban:
City Street, War: Battlefield, Tropical: Beach). Both classes are placeable lot
structures, both decay, both are reserved by one shoot at a time, both can host rehearsal.
The distinction is **art-and-family, not mechanics.**

---

## 11. Costs and economics of a Set

[CORPUS] **Capital cost:** 11 known values spanning **$5,000 → $99,999**
(`War: Battlefield` → `Suburban: School Library`). For comparison, the entire
core-production facility ladder from `facility_catalog.csv` runs $3,000 (Snack Van,
Restroom Small, Star & Script Selling) to $77,777 (Palatial Trailer), with the
production pipeline core at $4,000–$6,000 (Crew Facility, Casting Office, Production
Office, Script Office Basic) and the expensive tier at $24,000–$60,000 (Laboratory,
Cosmetic Surgery).

**[INFERRED] Sets were the expensive half of the lot.** The most expensive *set* known
($99,999) costs more than the most expensive *facility* known ($77,777), and four sets
exceed the Laboratory's $24,000. Combined with the lot-space claim below, sets were the
dominant capital sink in the original's mid-game.

[CORPUS] **Attractiveness:** always **negative** where known — `−25` (Rural: Forest),
`−40` (Wild West Bank/Desert/Street), `−55` (Wild West: Saloon, War: Bombed Street),
`−60` (Wild West: Jail, War: Battlefield); `Rural: Field` is recorded as `-?` (known
negative, value unrecovered). This is the same pattern `schema_fields.csv`
TECH-SCHEMA-002 proves for facilities: *"Nearly every facility has a small NEGATIVE base
attractiveness (Lot Prestige cost of merely existing), confirming buildings impose an
aesthetic cost the player must offset with landscaping."*
**Sets' negative attractiveness is roughly an order of magnitude worse than facilities'**
(sets −25…−60 vs facilities −0.2…−2.0 in raw engine floats, −10/−20 in Prima's
guide-scale figures for Snack Van/Stage School/Restaurant). Units differ between the two
sources, so the magnitude comparison is directional only.
**Confidence: GUIDE-CORROBORATED** for the sign and pattern; **8/39 coverage** for values.

[CORPUS] **Recurring cost:** none observed. `[finance] annualcost`/`dailyrate` are 0 in
every example (`schema_fields.csv` TECH-SCHEMA-001). The ongoing cost of a set is
**Builder labour** (`[maintenance] repairwork`) plus **Lot Prestige drag**
(attractiveness) plus **land**.

[CORPUS] **Land is the real constraint** (Bible §4 lines 780–788):
- *"Sets can easily take up a third or a half of your total available land if you insist
  on building one of each kind of set"* [PLAYER DOCUMENTED — Neoseeker].
- *"if you've placed two sets on opposite ends of the lot, and use them both in one movie,
  your Stars and crew will have to run back and forth between them, which will extend the
  production time of your movie, delaying its completion and adding to the movie's cost"*
  [OFFICIAL: manual p.39, Hints & Tips] — echoed at §7.3 line 1070 and §25 line 2574.
- Paving speeds travel at a per-tile cost; four surfaces with cost/attractiveness/speed
  tradeoffs (Tarmac $5/tile, −1 attractiveness, 1.2× speed; Path $20/tile, 1.4×; Grass
  $10/tile, +3, 1.0×; Sand $5/tile, +1, 0.6×) — Bible §25 lines 2565–2573
  [PLAYER DOCUMENTED table, cross-checked against the DIRECTLY OBSERVED Tarmac tooltip in
  `Screenshot 2026-08-17 at 11.40.03 AM.png`].

The Bible's own summary (§4 line 788): *"a set is not just a shooting location but a
throughput constraint on the whole studio."* **This is the sentence C2 is built on.**

---

## 12. Unlock paths — four distinct mechanisms

[CORPUS] The catalog and Bible together evidence **four** unlock routes for sets, plus
pre-built:

| # | Mechanism | Evidence | Examples |
|---|---|---|---|
| 1 | **Calendar year / era band** | `set_catalog.csv` `unlock_condition`; engine `[blueprint/requires] 0=date_1909` (TECH-SET-007) + `dated` field (TECH-SET-001) | 1920 (WW Desert, WW Saloon, Rural Field), 1923 (War Battlefield), 1925 "Basic Wild West", 1928–1931 "Intermediate Wild West", 1928–1939 "Intermediate War", 1928–1950 "Advanced Wild West" |
| 2 | **Laboratory research packs** | Bible §4 lines 716–723 [OFFICIAL manual p.23] | Mainstream Packs → new sets/props/costumes; Cult-Packs → new sets/props/costumes |
| 3 | **Achievement Awards** (nine numbered certificates) | Bible §4 lines 760–766; `source_conflicts.csv` CONFLICT_024 | Rural: Forest (Junior Studio Manager), Urban: Wall Section (Celebrated Studio Head), Urban: Municipal Building (Movie Mogul), Suburban: School Library (Movie-Making Legend) |
| 4 | **Lifetime Honors** (Gold / Platinum — a separate tier system) | Bible §4 line 758; `source_conflicts.csv` CONFLICT_036 | Sci-Fi: Starship Bridge 3 (Gold), Suburban: Diner (Platinum) |
| — | **Pre-built** | `set_catalog.csv` | Stage (generic) |

[CORPUS] **Era bands are ranges, not points** — "1928–1950 (Advanced Wild West)" implies a
window, matching the documented research pattern where *"packs become researchable several
years before the pack is unlocked"* and a never-researched pack *"will eventually become
unlocked for use on its own ... usually not until roughly 15+ years"* (Bible §3 lines
621–622). `technical_artifact_conflicts.csv` TECH-CONFLICT-002 generalises this into a
**dual-route unlock pattern** (achievement/investment grants early access; a calendar date
is the chronological fallback) — reframed 18 Aug 2026 from what had been recorded as a
contradiction.

**Confidence:** mechanisms 1 and 3: **GUIDE-CORROBORATED** (Prima + GameSpot exact match
on Movie Mogul → Urban: Municipal Building). Mechanism 2: **GUIDE-CORROBORATED** for
existence, but see CONFLICT_025 in §16 for the genre-mapping dispute. Mechanism 4:
**SINGLE-SOURCE** (Prima only; `source_conflicts.csv` CONFLICT_036 notes GameSpot never
mentions Gold/Platinum Lifetime Honors at all).

---

## 13. Sets as the throughput constraint — the complete original picture

Assembled from the above, all [CORPUS]:

| Constraint | Mechanism | Failure mode in the original |
|---|---|---|
| **Ownership** | Script names a set you don't own | HARD BLOCK; build it |
| **Condition** | Set below full repair | HARD BLOCK (unusable) + Production Quality penalty |
| **Occupancy** | *"another film is already shooting on it"* | HARD BLOCK; wait or build a second copy |
| **Land** | Sets consume ⅓–½ of the lot | Soft: you cannot own one of everything |
| **Layout / travel** | Sets far apart in one movie | Soft: longer schedule, higher cost |
| **Freshness** | Novelty depletes across movies | Soft: Success-stage rating decay |
| **Aesthetics** | Negative attractiveness | Soft: Lot Prestige drag, offset by landscaping |
| **Labour** | Builders repair; Crew quota gates "Shoot It" | HARD BLOCK on crew quota; soft on repair speed |

**Three of the eight are HARD BLOCKS with no queue.** The original's answer to "the stage
is busy" was *"wait, or build another."* That is precisely the behaviour Owner law #2
forbids.

---

## 14. Confidence tier summary, per mechanic (as the lane brief requires)

| Mechanic | Tier | Basis |
|---|---|---|
| Sets are placeable, buildable lot structures with their own catalog | **GUIDE-CORROBORATED** | manual p.20 + Codex Gamicus + engine `[blueprint]` schema |
| Set definition carries per-genre float weights + `priority1` | **DEV-SCHEMA-PROVEN** | `set_definition_schema.csv` TECH-SET-008 (schema only; vanilla weights unknown) |
| Hidden per-set Quality exists | **DEV-SCHEMA-PROVEN** (field) / **GUIDE-CORROBORATED** (values) | TECH-SET-003 `quality=0.8`; Prima 39 values, IGN corroborates 2 |
| Quality feeds *Script* Quality via Average Set Quality (3/4 star / 12%) | **GUIDE-CORROBORATED** | Prima 8-factor table; IGN offers a competing per-scene model (CONFLICT_057) |
| Set Variety factor (1 star / 20%, 10 set changes to max) | **SINGLE-SOURCE (Prima)** | `movie_rating_pipeline.json`; the base-vs-S&E cap is contested (10 vs 15) |
| Repair level feeds *Production* Quality | **SINGLE-SOURCE (Prima)** + internal corpus tension | `movie_rating_pipeline.json` stage 2 vs Bible §7.1 line 1052 |
| Sets decay and become unusable until repaired | **GUIDE-CORROBORATED** | manual p.4/p.18/p.20 + 2 screenshots + `[maintenance]` block |
| Decay rate / repair speed numbers | **NOT DOCUMENTED** | Q028 ACTIVE; only mod example values |
| Novelty depletes across movies | **GUIDE-CORROBORATED** | Prima Success stage + gamepressure |
| Novelty locked within one movie | **SINGLE-SOURCE** | GameFAQs synthesis, Bible flags "confidence medium" |
| Novelty per-instance vs per-type | **NOT DOCUMENTED** | Q013 ACTIVE |
| Boredom Factor is a real per-set 0–1 field | **DEV-SCHEMA-PROVEN** | TECH-SET-002 |
| What Boredom Factor *does* | **NOT DOCUMENTED** — and not even asked | Bible §4 line 756; absent from the questions ledger |
| Rehearse-on-set trains the set's Practice Genre | **GUIDE-CORROBORATED** | manual p.20 + Prima + Codex Gamicus |
| "Rehearsing Script" is a separate automatic pipeline stage | **GUIDE-CORROBORATED** | in-game tutorial + 2 guides + 2 screenshots; manual silent |
| Whether rehearsal reserves the target Set | **NOT DOCUMENTED** | no source; not in the ledger |
| Relationships build during REHEARSE / FILM / CASTING | **DEV-SCHEMA-PROVEN** (schema) | `social_relationship_schema.csv` TECH-SOC-004; values cheat-modified |
| Script names required sets; red flag with 3 reasons | **GUIDE-CORROBORATED** | manual p.12/p.13 + screenshots |
| Which scenes require which sets | **NOT DOCUMENTED — no data exists** | `scene_catalog.csv` has no set column |
| No separate soundstage building type | **GUIDE-CORROBORATED** + engine absence argument | manual p.20; 0 stage rows in 2 facility catalogs |
| Sets consume ⅓–½ of lot; layout drives schedule and cost | **GUIDE-CORROBORATED** | manual p.39 + Neoseeker + §25 |
| Set capital costs ($5,000–$99,999) | **SINGLE-SOURCE (Prima)**, 11/39 coverage | `set_catalog.csv` |
| Sets have no recurring cash upkeep | **DEV-SCHEMA-PROVEN (weak)** | `annualcost/dailyrate = 0` in every sample; absence argument |
| Four unlock routes (date / research / achievement / lifetime honor) | **GUIDE-CORROBORATED** (1,3) / **SINGLE-SOURCE** (4) | see §12 |
| Stunts & Effects added ~15 sets | **SINGLE-SOURCE**, mostly unenumerated | Q041 |

---

## 15. Unresolved-questions and conflicts sweep — BLOCKING vs DESIGN-AROUND

Per master plan §11 ("original numeric values are evidence, not spec"), a question only
**BLOCKS** if C2 cannot make a defensible design decision without it. A question is
**SAFE TO DESIGN AROUND** if C2 can pick its own value/shape and the original's answer
would not change the architecture.

### 15.1 `ACTIVE-UNRESOLVED-QUESTIONS.csv` — all set/stage/scenery/rehearsal rows

| ID | Question (abridged) | Corpus priority | **C2 verdict** | Why |
|---|---|---|---|---|
| **Q013** | Does a second copy of the same set type reset novelty independently; is novelty per-instance or studio-wide? | LOW | **⚠️ DESIGN FORK — decide explicitly, do not inherit** | Not blocking (we can choose), but the two answers produce **different economies**: per-instance makes duplicate sets a freshness+capacity purchase; per-type makes them purely capacity. C2 must rule, in the charter, with a stated reason. |
| **Q040** | Full base-game set roster beyond the 39 | MEDIUM | **SAFE** | C2 authors its own catalog. 39 rows is already far more shape than we need. |
| **Q041** | Full ~15-set S&E roster | LOW | **SAFE** | Expansion content, explicitly out of scope. |
| **Q031** | Do screenshot-visible sets map to named catalog entries? | LOW | **SAFE** | Art-identification question; no mechanical consequence. |
| **Q051** | Does Novelty fully account for "script originality", or is there a separate scene/genre-reuse penalty? | LOW | **SAFE** | C2 will have one novelty concept; a second hidden penalty is not something we must reproduce. |
| **Q015** | Max crew/extras headcount per set/shoot | LOW | **SAFE** | C2 sets its own quotas from its own roster scale. |
| **Q039** | Per-genre critic-review weighting formula (includes set novelty as an input) | LOW | **SAFE** | C2 already has its own `FORCE_VECTORS`/`expectedCriticScore` model [CODE `src/core/tuning.ts`]. |
| **Q028** | Builder-count ↔ construction/repair time formula | LOW | **SAFE** | C1 already ships build-weeks quoting; C2 tunes its own. |
| **Q027** | Can a building/set footprint be rotated before placement? | LOW | **SAFE-ish** — but note it is a **UX** question C2 will face the moment sets have non-square footprints. Recommend an explicit V1 answer ("no rotation") rather than discovering it in implementation. |
| **Q058** | Are floating status labels clickable? | LOW | **SAFE** | PF1/C2 presentation choice. |
| **Q007 / Q008** | Restaurant / Restroom capacity units (9 vs 180; 1/5/2 vs 10/50/20) | MEDIUM | **SAFE for sets** — but read the **lesson**: the corpus's own diagnosis is a **units mismatch** (simultaneous-occupancy slots vs service-population-equivalent). C2's Sets/Stages capacity field **must name its unit in the type**, or we will reproduce this exact ambiguity in our own data. |
| **Q012** | Is Post Production structurally mandatory? | MEDIUM | **SAFE** — but relevant to C2's authoritative **wrap** transition (PF1 charter §9/§10 routes wrap to C2 [DOC brief line 66]). Prima is controlling: zero rating effect. |

**Nothing in the unresolved-questions ledger BLOCKS a C2 sets/stages design decision.**
One row (Q013) is a fork C2 must consciously rule on rather than inherit.

**Plus one question the ledger is missing entirely** [CORPUS gap, §7.2]: *what does a
set's Boredom Factor drive?* **C2 verdict: DESIGN FORK, same class as Q013.** C2 will
almost certainly want a per-set novelty-decay rate; it should adopt one **as its own
design decision**, explicitly *not* citing `boredom` as precedent, because the corpus
does not support that reading.

### 15.2 `source_conflicts.csv` — set/stage-relevant rows

| Record | Conflict | **C2 verdict** |
|---|---|---|
| **CONFLICT_012** — hidden per-set quality 1–100 | Prima vs IGN: they **agree**; recorded CONTESTED only because it is new material relative to the older Bible | **SAFE.** Not a real disagreement. Adopt the shape. |
| **CONFLICT_057** — hidden set/scene quality + short-script/repeat penalties | Prima's 1–100 hidden-value model vs a GameFAQs "fifths of a star per scene" quantization; *"not reconciled ... by any source"* | **SAFE.** Two descriptions of a scoring curve. C2 has its own scoring model. |
| **CONFLICT_011** — Prima's 8-factor script model | Percentages sum to ~117%; "Average Set Quality: 3/4 star or 12%" is internally inconsistent (3/4 of a star ≈ 15%) | **SAFE — but a warning.** These are **defects in the source**, not in the game. Do not port Prima's weights. Port the *factor list*. |
| **CONFLICT_035** — content caps 15 scenes / 10 set changes (base) vs 20+ / 15 (S&E-assuming guide) | Unresolved; may be an expansion delta | **SAFE.** Treat as a plausible-range window per master plan §11, exactly as Bible §5.7 line 950 already advises. |
| **CONFLICT_025** — Laboratory research→genre mapping | Manual: Mainstream = Action/Comedy/Romance, Cult = Sci-Fi/Horror. Prima: Mainstream = Action/**Household**/**Wild West**, Cult = Horror/Sci-Fi. Unconfirmed reconciliation: "Household"/"Wild West" may be **set-style catalog categories**, not movie genres | **⚠️ THE ONE WORTH ADVANCING.** New evidence this lane can add: `set_catalog.csv`'s own family names **do include "Wild West"** (5 rows) — supporting the set-style reading — but **do NOT include "Household"** (the nearest analogues are "Suburban" (8) and "Rural" (6)). So the reconciliation is **half-corroborated, and this lane does not close it.** **Verdict: SAFE to design around** (C2 will define its own unlock tracks) but the half-corroboration should be written back into the corpus, not lost. |
| **CONFLICT_024** — Achievement-Award set rewards, genre-orientation | Prima names the reward sets; only GameSpot attaches genre orientation (Forest→Horror, Wall Section→Comedy) | **SAFE.** C2 picks its own reward content. |
| **CONFLICT_036** — Gold/Platinum Lifetime Honors reward sets | Prima-only; GameSpot silent | **SAFE.** Single-source; do not build a two-tier honor system on it. |
| **CONFLICT_015** — Achievement-Award ordering (3 competing orderings, all claiming Prima) | Unresolved | **SAFE for sets.** Affects *which* set unlocks *when*, i.e. pure content sequencing. |
| **CONFLICT_040 / 041** — five-stage rating architecture; PR/Marketing in Success not Movie Quality | Prima's staged model uncorroborated by other tiers | **SAFE, but architecturally interesting:** it is the reason Sets touch three rating stages (§4). C2 may adopt the *separation* without the *weights*. |
| **CONFLICT_028** — do extras' genre experience affect quality? | 2-vs-2 split (Prima+IGN: no; Bible-prior+GameSpot: yes) | **SAFE.** Extras are a §11-nongoal-adjacent detail, not a sets question. |
| **CONFLICT_052** — Lot Prestige attractiveness measured only inside the bounding rectangle of built structures | Prima; GameSpot silent, not contradicting | **SAFE — but note it.** If C2 gives sets negative attractiveness, a bounding-rectangle rule would mean *placing a set expands the scored area*, a real and non-obvious coupling. |
| **CONFLICT_020** — Sandbox toggles incl. "buildings never decay" and "instant shoot" | Corroborated qualitatively, no canonical names | **SAFE.** Sandbox is out of C2 scope. |
| **TECH-CONFLICT-002** (technical artifacts) — dual-route unlock | Reframed as achievement-early-access + date-fallback | **SAFE and USEFUL.** This is a clean pattern C2's declarative unlock schema (delivered in C1 [DOC brief line 53]) could express directly. |

**Net: zero BLOCKING conflicts for a C2 sets/stages design decision.** Two items need an
explicit C2 ruling rather than inheritance (Q013 novelty scope; Boredom Factor semantics),
and one (CONFLICT_025) has been materially advanced by this lane without being closed.

---

## 16. RISKS AND GAPS — contradictions found, stated loudly

**These are reported, not resolved, per planning-agent rule 5.**

1. **⚠️ CORPUS-INTERNAL CONTRADICTION — does set repair level affect the rating?**
   Bible §7.1 line 1052: set repair level *"affects usability, **not documented to affect
   quality score directly**"*. `movie_rating_pipeline.json` stage 2 (same corpus, same
   pass, Prima-sourced): *"**Repair of Sets** — Set Maintenance level below full repair
   **decreases production quality**."* The same corpus asserts both. The JSON is
   Prima-direct and more specific; the Bible line reads like a stale hedge. **Not
   resolved here.** Impact on C2: whether disrepair is a *gate only* or a *gate plus
   quality penalty* is a real design choice, and the corpus cannot arbitrate it.

2. **⚠️ CORPUS-INTERNAL CONTRADICTION — the Stage's default genre.**
   `set_catalog.csv` row `Stage (generic)`: practice genre *"Romance (typical default)"*.
   Bible §4 line 725: the Basic Stage *"is primarily associated with **Comedy**
   productions"* [PLAYER DOCUMENTED, fandom, single-source, direct fetch blocked HTTP
   402]. Both describe the same starting object. **Not resolved here.**

3. **⚠️ CORPUS-INTERNAL CONTRADICTION — scene-quality example values.**
   Bible §5.7 line 925 cites Prima examples *"'Ain't Over Yet' = 90, 'Screen Kiss' = 75"*.
   `scene_catalog.csv` has **`Screen Kiss` = 78** and **no "Ain't Over Yet" row**, max
   quality 85 across 40 rows. Either the Bible's prose or the CSV extraction is wrong.
   **Impact: low for C2** (we author our own scenes) **but it undermines confidence in
   the numeric fidelity of the Prima extractions generally** — which is the reason this
   lane refuses to port Prima numbers as spec.

4. **⚠️ CORPUS TERMINOLOGY HAZARD — "soundstage".**
   Bible §4 line 691 states no soundstage building type exists; Bible §6.1/§7.1/§11/§32/§41
   then use "the soundstage" as a building noun throughout. Anyone mining §7 in isolation
   will conclude the original had stages-as-containers. **It did not** (§10). Any C2
   document quoting §7 must carry this caveat.

5. **⚠️ EVIDENCE-BASE FRAGILITY — no clean vanilla data exists.**
   `vanilla_diff_backlog.csv` TECH-DIFF-001, priority **HIGHEST**: *"No clean vanilla data
   of any kind was found anywhere in this collection — every `.ini` file examined comes
   from a mod, even when the mod's stated purpose doesn't target that specific field."*
   Every schema claim in §2.1 is safe. **Every numeric value in those files is not
   vanilla and must never be treated as one.** The only vanilla numbers we have for sets
   are Prima's, and point 3 above shows Prima's extractions are not error-free.

6. **⚠️ DATASET INCOMPLETENESS — the set catalog is 28% complete on cost.**
   11/39 costs, 11/39 boredom, 8/39 attractiveness, 17/39 practice genre, 13/39 unlock.
   All 39 have Quality. Any C2 balance argument that cites "the original charged X for a
   set" is standing on 11 data points, of which 5 are Wild West.

7. **⚠️ MISSING DATA — no scene→set binding exists anywhere** (§9.2). This is not a
   conflict; it is an absence. C2 must author it.

8. **⚠️ MISSING QUESTION — Boredom Factor has no ledger entry** (§7.2). The corpus
   documents a field, publishes 11 values for it, and never asks what it does.

9. **⚠️ BRIEF-vs-CODE DISCREPANCY (minor, reported not resolved).**
   [DOC] The shared brief (line 106) and Bible §38 line 3359/§41 line 3632 both describe
   `FACILITY_BLUEPRINTS` as holding **one entry**. [CODE] `src/core/tuning.ts:748-754`
   now holds **five**: `DEVELOPMENT_CASTING_ANNEX`, `DEVELOPMENT_CASTING_HALL`,
   `DEVELOPMENT_OFFICE_2`, `DEVELOPMENT_OFFICE_3`, `CRAFT_ANNEX`. The Bible statement is
   stale (it was written against an M1A-era checkout, as its own §38 header at line 3353
   admits); C1 delivered catalog families. **The brief's own baseline paragraph (line 51)
   is correct** — "facility catalog families on the placement engine". Only the older
   quoted evidence is stale. No action needed beyond not quoting §38's blueprint count.

10. **⚠️ OWNER LAW vs ORIGINAL — two deliberate divergences that must be named in the
    charter, not quietly assumed as parity.**
    - Owner law #4 [DOC brief line 30]: *"Stages are player-built production capacity."*
      The original had **no stage building at all** (§10). This is a divergence.
    - Owner law #2 [DOC brief lines 25–27]: *"QUEUE, DON'T MAGICALLY FORBID."* The
      original **hard-blocked** on an occupied set with no queue (§13). This is a
      divergence.
    Both divergences are, in this agent's judgement, correct. But a charter that cites
    "the original" as authority for either will be citing something that never existed.

---

## 17. [PROPOSAL] The SHAPE C2 should adopt — and where to diverge deliberately

Everything in this section is **[PROPOSAL]**, offered to the architect as recommendation,
not observation. Original numeric values are evidence, not spec (master plan §11
[DOC brief line 96]).

### 17.1 ADOPT — the recoverable shapes

**A1. One catalog, two form factors — not two entity types.**
Model a **Set** as one entity with a `form: 'stage' | 'exterior'` (or `enclosed`/`open`)
discriminator, in **one** catalog with one blueprint schema, exactly as the original's
`[blueprint] path` grouping did (TECH-SET-007). Do **not** build Stages and Sets as two
unrelated subsystems. Rationale: the original proved one catalog is sufficient; C1 already
proved catalog-families-on-the-placement-engine works [DOC brief line 51].

**A2. The four-number per-set stat block.**
`quality` (contributes to script/pre-production quality), `noveltyDecayRate`, `condition`
(0–1, decays, gates use), `attractiveness` (negative). Plus `practiceGenre`/genre weights
and `capitalCost`. This is directly the original's shape and it is *four numbers*, which
is small enough to be legible in a tooltip — the DEEPEN ruling's stated goal (Bible §38
line 3360: *"a genuine content layer on the already-proven placement engine"*).

**A3. Weighted genre affinity with an explicit priority genre — never a binary tag.**
DEV-SCHEMA-PROVEN (TECH-SET-008) and independently recommended by the technical register
(§20: *"Weighted, prioritized genre tagging for sets (not binary) is a concrete,
evidence-backed pattern worth carrying into Project: Studio's own Sets data model"*).
It also lets C2 reproduce the good inversions (`Wild West: Saloon` trains Romance).

**A4. Sets touch multiple stages of the quality pipeline, not one.**
Set **identity** → screenplay/development quality. Set **condition** → production quality.
Set **freshness** → post-release reception. This is the original's genuine structural
insight (§4) and it is what makes a set worth *maintaining*, not just *owning*.

**A5. Condition gates use, and repair is labour, not cash.**
`[maintenance] decaytime/repairwork` (TECH-SCHEMA-003) with `annualcost=0`
(TECH-SCHEMA-001) is a clean model: sets cost capital once, then consume **crew/builder
time** forever. This gives C2 a second, non-cash pressure on throughput — one that
naturally competes with production work for the same people, which is exactly the
"throughput emerges from real resources" law (#1).

**A6. Physical, per-object legibility over panels.**
The floating **"Repair Level"** label with a directional arrow, over the specific damaged
object, is the original's single best UX idea in this system (Bible §26 line 2588, two
screenshots). It satisfies both the standing world-first grammar and Owner law #8
(simulation theater must correspond to authoritative work).

**A7. The red-flag-with-a-reason pattern.**
*"either it's in need of repair, you don't own it yet or another film is already shooting
on it"* — **three distinct reasons, named** (manual p.12). C2's queue UI should inherit
the *specificity*, not the *blocking*: **"waiting on Stage 3 — occupied by *Ravine* until
week 14"** is the C2-native form of the same sentence and directly serves Owner law #2's
requirement that the player know *what is waiting, what it needs, what occupies it.*

**A8. Layout and travel as a real soft cost.**
The original's *"run back and forth ... extend[ing] the production time ... and adding to
the movie's cost"* (manual p.39) is the mechanic that made lot layout matter. C2 already
has a real 28×26 grid with parcels [CODE `src/core/lot.ts`] and presence/relocation
[CODE `src/core/presence.ts`]. This is the cheapest high-value adoption on the list.

**A9. Dual-route unlocks.**
Achievement/investment grants early access; a calendar date is the chronological fallback
(TECH-CONFLICT-002 as reframed). C1 shipped a declarative unlock schema with cash-only
active [DOC brief line 53] — this is a natural second condition kind, not new
architecture.

**A10. Rehearsal on a set is where chemistry is built.**
`REHEARSE / FILM / CASTING` as first-class relationship contexts (TECH-SOC-004) is a
better pattern than the original's shipped venue-dragging loop (which the corpus's own
"Do Not Clone The Tedium" section condemns). If C2 ever wants chemistry, **build it into
the work, on the set** — this is schema-proven precedent for exactly that.

### 17.2 DIVERGE — deliberately, and say so in the charter

**D1. Stages ARE a building type in C2. The original had none.**
[CORPUS §10] There was no soundstage facility. C2's Owner law #4 makes stages
player-built production capacity — the right call for a game whose feeling target is
*"I built this studio and can watch it manufacture multiple movies"* — but it is a
**divergence**, and C2 must therefore decide something the original never had to:
**what is the relationship between a Stage and a Set?** Three coherent options:

  - **(i) Peer objects** (closest to the original): a Stage is just a Set with
    `form: 'stage'` and generic dressing. Simplest; but then "build a stage" and "build a
    Wild West street" are the same verb, and the Founding Flip's "first movie needs a
    stage" story gets muddy.
  - **(ii) Stage = container, Set = dressing installed into it** (closest to real
    filmmaking, farthest from the original): a Stage is capacity; a Set is a
    genre-weighted dressing package loaded into a stage by the Scenery Shop. **This is
    the option C1's existing code already leans toward** — [CODE `src/core/operations.ts:87`]
    the `shooting` phase already requires **both** `'soundstage'` **and** `'set-scenery'`
    capabilities, and [CODE `src/core/operations.ts:29`] a `facility-scenery-shop` with
    `capability: 'set-scenery'` already exists. Adopting (ii) is the smallest step from
    the delivered engine.
  - **(iii) Hybrid**: enclosed work happens in Stages (which hold swappable Sets);
    exterior/backlot Sets are standalone placed structures that are their own venue. This
    is the closest to both real studios *and* the original's actual catalog
    (`Sci-Fi: Starship Bridge` is stage work; `Wild West: Street` is backlot).

  **[PROPOSAL] Recommend (iii), implemented as (ii)+standalone-exteriors.** It preserves
  the original's one-catalog economy (A1), matches the existing capability split in code,
  and gives the Founding Flip a legible first build ("you need a stage before you can
  shoot indoors"). **This is an architect decision, not this lane's to make.**

**D2. Queue, don't hard-block.** [CORPUS §13] Three of the original's eight set
constraints were hard blocks. C2 law #2 converts occupancy to a queue. **Divergence, and
the right one.** Note the corollary: a queue needs a **release event**, and the corpus
notes [DOC brief line 66] that the authoritative **wrap** transition (shooting → post)
does not exist today. Sets cannot be released without wrap. **Wrap is a prerequisite for
the Sets queue, not a parallel workstream.**

**D3. Do not port Prima's numbers.** [CORPUS §16 points 3, 5, 6] Prima's script-quality
percentages sum to 117%, one of its own factor figures is internally inconsistent, its
scene examples don't match the extracted catalog, only 11/39 set costs exist, and no clean
vanilla data was ever recovered. **Port the factor list and the shapes. Rebalance every
number in our own economy**, exactly as master plan §11 requires.

**D4. Name the unit on every capacity field.** [CORPUS §15.1 Q007/Q008] The single most
persistent conflict in the entire original dataset is a **units ambiguity** (9 vs 180;
1/5/2 vs 10/50/20) that two decades of guides never resolved. C2's `Stage`/`Set` capacity
must be a named unit in the type system (`simultaneousProductions`, not `capacity`), or we
will manufacture our own version of the same twenty-year confusion.

**D5. Rule on novelty scope explicitly.** [CORPUS §5, Q013] Per-instance vs per-type
novelty is undocumented. **[PROPOSAL] Recommend per-instance**, because it is the only
version in which "build a second Stage 3" is simultaneously a *concurrency* purchase and a
*freshness* purchase — which is exactly the "throughput emerges from physical capacity"
law making itself felt twice with one building. But **rule it, with a reason, in the
charter.**

**D6. Do not adopt `boredom` as a novelty-decay rate on the strength of the original.**
[CORPUS §7] Adopt a per-set novelty-decay rate because C2 wants one (and because
cost↔boredom ρ ≈ −0.66 makes it a *plausible* reading of the original), but cite it as a
**C2 design decision**, not as recovered parity. The corpus does not support the claim.

**D7. Do not build the original's set-quality *invisibility*.**
[CORPUS §4] Prima states explicitly that set and scene quality are *"NOT visible to the
player in the shipped game"*, and the Bible's own "Do Not Clone The Tedium" section (line
429) names exactly this as a core complaint: *"an obtuse system of management ... confusion
regarding why some things work the way they do."* The §38 DEEPEN ruling for movie quality
demands legibility. **C2 should show the number.** Hidden set quality is the one part of
this system that was actively bad.

### 17.3 One-line summary for the charter

> **[PROPOSAL]** C2 should adopt the original's *shape* — one blueprint-backed catalog of
> genre-weighted, condition-decaying, novelty-depleting, negatively-attractive, land-
> hungry Sets that gate and grade production at three separate stages — and deliberately
> diverge on three points the original got wrong or never had: **stages as real
> player-built capacity** (it had none), **queues instead of hard blocks** (it hard-
> blocked), and **visible set quality** (it hid it). Every number is ours.

---

## 18. Appendix — complete `set_catalog.csv` transcription (39 rows)

[CORPUS] Ordered by family, then by the file's own order. `?` = `$?` in source;
`n/a` = absent in source. All rows: source `PRIMA_2005`, tier
`DEVELOPER-REVIEWED (Prima)`, confidence `HIGH`, `base` game, PC 2005 release.

| Set | Quality | Cost | Attract. | Practice genre | Unlock | Boredom | Status |
|---|---|---|---|---|---|---|---|
| Rural: Field | 10 | ? | −? | n/a | 1920 | n/a | INCOMPLETE |
| Rural: Forest | 50 | $22,222 | −25 | Horror | Junior Studio Manager AA | 38 | SETTLED |
| Rural: Graveyard | 55 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Rural: Musty Cellar | 15 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Rural: Shack Exterior | 80 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Rural: Shack Interior | 30 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Sci-Fi: Alien World | 25 | ? | n/a | Sci-Fi | n/a | n/a | INCOMPLETE |
| Sci-Fi: Corridor 1/2/3 | 35 | ? | n/a | Sci-Fi | n/a | n/a | INCOMPLETE |
| Sci-Fi: Starship Bridge 1 | 70 | ? | n/a | Sci-Fi | n/a | n/a | INCOMPLETE |
| Sci-Fi: Starship Bridge 2 | 53 | ? | n/a | Sci-Fi | n/a | n/a | INCOMPLETE |
| Sci-Fi: Starship Bridge 3 | 53 | $56,618 | n/a | Sci-Fi | Gold Lifetime Achievement Honor | 20 | SETTLED |
| **Stage (generic)** | **5** | pre-built | n/a | Romance (typical default) | Pre-built at game start | n/a | SETTLED |
| Suburban: Bathroom | 25 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Suburban: Diner | 25 | $58,804 | n/a | Romance | Platinum Lifetime Honor | 24 | SETTLED |
| Suburban: Living Room 1 | 53 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Suburban: Living Room 2 | 63 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Suburban: Modern Jail | 30 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Suburban: School Corridor | 35 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Suburban: School Library | 55 | $99,999 | n/a | Comedy | Movie-Making Legend AA | 24 | SETTLED |
| Suburban: Street | 60 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Traveling Vehicle: Automobile | 30 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Tropical: Beach | 63 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Alleyway | 50 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Bar | 55 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: City Block Corridor | 33 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: City Street | 85 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Modern Bank | 50 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Municipal Building | 65 | ? | n/a | n/a | Movie Mogul AA | n/a | INCOMPLETE |
| Urban: Office | 23 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Plush Hotel Bedroom | 30 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Rooftop | 55 | ? | n/a | n/a | n/a | n/a | INCOMPLETE |
| Urban: Wall Section | 0 | ? | n/a | Comedy (GameSpot only) | Celebrated Studio Head AA | n/a | INCOMPLETE |
| War: Battlefield | 0 | $5,000 | −60 | Action | 1923 | 32 | SETTLED |
| War: Bombed Street | 95 | $74,000 | −55 | Action | 1928–1939 (Intermediate War) | 24 | SETTLED |
| Wild West: Bank | 53 | $16,000 | −40 | Comedy | 1925 (Basic Wild West) | 30 | SETTLED |
| Wild West: Desert | 15 | $7,000 | −40 | Action | 1920 | 38 | SETTLED |
| Wild West: Jail | 38 | $23,000 | −60 | Action | 1928–1931 (Intermediate Wild West) | 35 | SETTLED |
| Wild West: Saloon | 35 | $8,000 | −55 | Romance | 1920 | 34 | SETTLED |
| Wild West: Street | 80 | $80,000 | −40 | Action | 1928–1950 (Advanced Wild West) | 25 | SETTLED |

---

*End of Lane 3 report. No file outside this one was created or modified.*
