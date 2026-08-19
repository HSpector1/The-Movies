# M3 RECORDS — the things C2a-M3 wrote down that nobody had written down

> C2a-M3 (Renewable Screenplay Generation V1), implementation worktree
> `/Users/bruce/The Movies - C2 Implementation`, branch `c2a-implementation`.
> Charter §3.5 / §12-M3; owner rulings `00C`.3, `00D`, `00E`.9/.10, `00F`.
>
> **Why this file exists.** Lane 14 found two facts that governed the whole
> campaign and appeared in **no document in this repository**: a hard thirty-film
> lifetime ceiling, and a shipped mechanic that inverted a developer-reviewed
> corpus law. The charter requires both to be recorded rather than merely fixed —
> because a gap somebody silently fills is a gap nobody can find later. Three
> further consequences of the M3 implementation are recorded here for the same
> reason: they were CHOSEN, they are visible in play, and a future reader is
> entitled to know they were chosen rather than overlooked.

---

## 1. THE THIRTY-FILM CEILING — recorded, and removed

**What was true before M3.** A world was seeded with exactly thirty film concepts
(`WORLD_CONFIG.conceptCount: 30`, generated per seed, never authored). A managed
studio claimed one permanently at commission — one concept, at most one screenplay
project, **ever**, with no abandonment, deletion, replacement or reuse path. When
the last one was claimed, the commission board raised a TERMINAL blocker:

> **No uncommissioned concepts remain.** Every available concept already owns a
> managed screenplay project. *Remedy: continue with an existing project.*

That is not a remedy. No action in the game produced a thirty-first premise. A
managed campaign therefore had a **hard lifetime ceiling of thirty films**,
against an Owner-ratified campaign horizon of 1920 to beyond 2040 with no
calendar end.

**Where it was recorded before lane 14:** nowhere. An exhaustive sweep of `docs/`
found two near-mentions, both describing the headless M0A corpus ("all 30 concepts
are always available") rather than the player's ceiling.

**What M3 changed.** The ceiling is gone. `commissionOriginalScreenplay` mints a
new `FilmConcept` and its `MovieBlueprint` at commission-commit; the counter is
unbounded by contract (`00C`.3: a lifetime cap is FORBIDDEN). The thirty founding
premises remain — as a **finite founding premium** the player can exhaust, which
is what makes the market path meaningful — and the blocker's remedy now names an
action that exists: *"Commission an original screenplay — put one of your writers
on a new picture."*

---

## 2. THE WRITER-EXPERIENCE DIVERGENCE — recorded, and reversed

**The corpus law**, from the Prima Official Game Guide (developer-reviewed, the
highest source tier; Bible §5.4 and §12), verbatim:

> "Scriptwriters gain individual experience (visible in their Staff cards) over
> time with every job they perform. **The more experience a scriptwriter has, the
> faster scripts will be completed. Scriptwriter experience has no bearing on the
> quality of the script.** To speed the writing of scripts, put multiple writers
> on the project."

> "**The level of the Script Office dictates the quality of scripts it can
> produce.**"

The Bible preserves a contradicting secondary account (GameSpot: "the more they
work, the better they'll get at writing scripts, resulting in higher quality
productions") rather than deleting it, and adopts Prima on precedence.

**What C1 shipped:** the exact inverse. Draft strength was
`0.6·baselineStrength + 0.4·writerSkill` — the writer supplying 40% of a
screenplay's quality — and the draft clock was a hard-coded constant of one week,
so the writer supplied **0%** of the speed.

**Where the divergence was recorded before lane 14:** nowhere. The module's own
docstring stated the office half of the law correctly ("SPEED IS UNTOUCHED …
tiers change what a script can become, never how fast. That is the original
law") and said nothing about the writer. The silence is where the inversion
lived.

**The ruling.** `00E`.9 CHANGED the charter's own keep-shipped recommendation and
required the successor behaviour in C2 rather than deferring it to C4:

> *Writer experience affects WRITING SPEED, not script quality; Script Office tier
> owns the achievable quality ceiling; additional writers may accelerate
> completion via the bounded pooling system. No compensating writer-quality bonus
> is invented.*

**What M3 implemented.**

* The writer term is removed from `assessFirstDraft`. The remaining weight is
  **renormalised to 1.0**, not left at 0.6 — the two were halves of one convex
  blend, and dropping a term from a weighted average without renormalising would
  not remove the writer, it would silently rescale every screenplay in the game
  to 60% of the number the whole economy was measured against.
* Draft duration becomes `clamp(BASE + richness(officeTier) − experience −
  pooling, MIN, MAX)`, every term named in `TUNING` and every range asserted.
* `ScriptProject.writerIds` (≤5, the corpus cap) becomes live through
  `assignScreenplayWriter`.
* **A POOL concept's draft stays one week, unconditionally.** This is a design
  constraint chosen to bound the blast radius: every C1 path keeps the clock it
  was measured with, and the variable clock applies only to the thing M3
  invented.

**What is still divergent, deliberately and on the record.** The office remains an
additive **uplift** (+4 / +9 EST) rather than the original's hard **ceiling**.
That was a recorded, deliberate C1-M4 choice, `00E`.9 item 9b explicitly STANDS
it, and with the writer term removed the uplift is the only quality lever in the
game — which is "office tier owns the achievable ceiling" in our economy's own
vocabulary.

---

## 3. THE FIRST-DRAFT EST NOW EQUALS THE HIDDEN TRUTH

**A consequence of ruling `00E`.9, not a separate decision, and stated because it
is visible in play.**

`ScriptAssessment` carries `actualStrength` (hidden) and `perceivedStrength` (the
EST the player reads). Before M3 those diverged for exactly one reason: the
writer term was evaluated twice, once over the writer's *actual* skills and once
over their *perceived* ones. `baselineStrength` has no perceived/actual split and
the office uplift is a single number, so **removing the writer term removes the
only source of first-draft divergence** — a first draft's EST is now exactly its
truth.

Three things about that:

* It is the ruling's own arithmetic. Inventing a premise-uncertainty term to
  restore the gap would be precisely the "compensating bonus" `00E`.9 forbids.
* **A REWRITE still diverges them.** `rewriteAssessment` reads the writer's
  `rewriting` skill, which has its own perceived/actual split, and the ruling
  names the DRAFT term specifically (`scriptDevelopment.ts:352-362`). So the
  player's uncertainty about a screenplay is now bought with a rewrite rather
  than given away at the first draft.
* **The legacy no-project path is untouched.** `forecast.ts` and `reception.ts`
  fall back to `0.6·baseline + 0.4·writing` when no managed assessment overrides
  them — the direct-greenlight path the headless M0A corpus runs on. The ruling
  names the DRAFT assessment; the fallback is a different site, the corpus
  depends on it byte-for-byte, and it was deliberately not touched.

**Routing:** if the Owner wants first-draft uncertainty back as a PRODUCT
feature, it is a premise-uncertainty design question for M7's economy remeasure
or C4, and it needs its own ruling. It is not something M3 may invent.

---

## 4. AN ORIGINAL SCREENPLAY'S PRICE TRACKS ITS POTENTIAL EXACTLY

**Chosen, and recorded because it is an asymmetry between the two supply paths.**

At founding, `correlateConceptCost` rank-blends the whole pool at weight 0.4 so a
stronger premise TENDS to cost more (D-12's capital frontier). It is a whole-pool
permutation and it may **never** run again — re-running it after an append would
re-price films already greenlit against a locked forecast.

A minted concept therefore has to arrive with the correlation already correct,
and the charter is explicit that its cost is **derived from strength, never an
independent draw**. The derivation is the population limit of the pool's own
rule: the concept's position in the strength distribution, in standard
deviations, mapped onto the same position in the cost distribution.

Two consequences:

* **A generated screenplay's price is a perfect signal of its potential, where a
  market premise's is only a correlated one.** There is no second draw left to
  carry the noise: "derived, never drawn" and "noisy" cannot both be true. It is
  masked in play (the player sees `requiredNegative`, which is the base cost times
  the shape's budget multiplier times the era cost scale, and they choose the
  shape), and the concept is commissioned before its price is ever seen — but a
  player who learns the mapping can read a hidden latent off a price.
* The bottom of the strength range maps below the cost floor, so the weakest
  originals all price at exactly `baseNegativeCost.min` ($2M). That floor is the
  world's own floor.

If the Owner wants the two paths to be indistinguishable on price, the fix is a
purpose-keyed noise draw blended at `SCRIPT_COST_POTENTIAL_CORRELATION` — the
pool's own weight — which is a one-function change and a new ruling, because it
reads against the charter's "never an independent draw".

---

## 5. THE CORPUS QUESTION ROW — recorded here, because the corpus is read-only

`00C`.3 and lane 14 §9.2 require the evidence distinction to be preserved: the
genre-influenced random title is **directly confirmed for the Advanced
Movie-Maker only** (Prima, verbatim); the standard-pipeline generated-and-
renamable title is an **Owner ruling with the AMM control as precedent, not
recovered fact**. Lane 14 swept all 70 rows of `ACTIVE-UNRESOLVED-QUESTIONS.csv`
and found **no row** on title generation or renaming — the corpus never asked the
question.

The corpus at `/Users/bruce/Desktop/Big Swing Art/` is READ-ONLY to this lane, so
the row is recorded here for whoever next has write access to it:

| Field | Value |
|---|---|
| Question | Can an auto-generated script's title be renamed on the standard (non-AMM) pipeline? |
| Why it matters | The successor design (C2a-M3) ships generated + renamable titles for the standard pipeline as an Owner ruling. If a source ever confirms or refutes the original's behaviour, the ruling should be re-read against it. |
| Evidence for | Standard-pipeline films demonstrably have titles (four directly observed); the standard path offers the player no naming step (OFFICIAL manual p.12); AMM offers "Enter your own title or press the dice button" (Prima, verbatim); character names are "randomly generated … but can be overridden" (Prima, verbatim). |
| Evidence against | None. The word "rename" appears nowhere in the corpus except one unrelated line about screenshot filenames. |
| Status | UNASKED — no source states that the game names standard-pipeline scripts, and none describes renaming them. |
| Priority | LOW (the successor design does not depend on the answer) |

---

## 6. WHAT M3 DELIBERATELY DID NOT BUILD

Recorded so a future reader does not mistake absence for oversight. Each is
fenced by the charter, a ruling, or the evidence.

| Not built | Why |
|---|---|
| The simplified FOUR-stage beat templates | Their beats are unrecovered and an ACTIVE open question (Q036). Inventing them is the fabrication the evidence discipline forbids. |
| The original's Action / Sci-Fi templates mapped onto drama / crime / adventure | The corpus does not license the mapping, and 6-vs-5 genres is C4's question. The shapes are recorded as unused reference data. |
| Prima's 8-factor script-quality model | Its own percentages sum to ~117% and one row is internally self-inconsistent. Cloning is forbidden; re-deriving it is a quality-model project. |
| Per-genre title VOCABULARIES | Authored content, fenced to C4. M3 ships genre-keyed SUBSETS of the shipped 48 leads: genre flavour, no new words. |
| Renaming a market premise | V1 scope is generated screenplays only (charter §3.5). A one-line predicate relaxes it when the Owner wants it. |
| Variable SHOOTING length | The eight-week production clock is load-bearing in four modules and explicitly out of V1. Richer scripts land as beat/role/set-demand richness, never as clock changes. |
| A hard block on an unbuilt required set | V1 grain is one bound set per production. Required sets are published as advisory demand; turning them into a reservation is M4's queue work. |
| Abandoning or shelving a screenplay | Needs an eighth `ScriptProjectStatus` — a frozen V9 enum widening. |
| Script selling / a script market | Not in the ruling; needs a new ledger kind. |

---

## 7. PERFORMANCE POSTURE, STATED (ruling `00C`.11)

`state.concepts` now grows without bound, and eleven concept lookups in the
engine are linear scans over it. That is fine at thirty and it is recorded rather
than optimised, per the Owner's "aware, not derailed" posture: no new
whole-history scans were added, nothing is cached, and history is never deleted
for speed. The natural time to act is evidence — a measured long-campaign
profile — not a guess made at M3.

---

## 8. THE UI LANE'S OWN RECORD — what the surfaces chose, and what they could not reach

> Added by the C2a-M3 **UI lane** (sole writer of `ui/src/**` + `ui/e2e/`). The
> engine lane's §§1–7 above stand unchanged.

### 8.1 `canStart` IS ONE ANSWER TO TWO QUESTIONS, and the surface had to scope it

`scriptReadModel.commissionAvailability` publishes ONE `canStart`, defined as
"no blockers". The `no-concepts` blocker is one of them — so the moment the
market ran dry, `canStart` went false and **every commission door in the game
shut**, including the door to the path whose whole purpose is to open when the
market is empty. The successor blocker's remedy ("Commission an original
screenplay") would have pointed at a greyed button.

The UI therefore reads the same blocker list with the market-exhaustion arm
scoped out of it, in **one predicate** (`ui/src/engine/screenplay.ts →
originalCommissionOpen`), shared by the Writers Room button, the Lot's
Development verb (`buildingInspector.ts`) and the App's retained-workspace
interception, so a verb can never open a surface that then refuses it. Nothing
else is relaxed: an unfounded studio, legacy mode, a full Development & Casting
floor and "no writer available" all still close both paths. A board that refuses
commissioning while publishing **no** blocker falls CLOSED — absence of a stated
reason never becomes an invented permission.

**The cleaner fix is an engine one and is NOT in this lane's reach:** publish
`canStartOriginal` beside `canStart` in `ScriptCommissionAvailabilityView`, and
scope the `no-concepts` blocker to the market path in the read model itself.
Recorded as an M4/M7 item rather than done across a lane boundary.

### 8.2 AN ORIGINAL COMMISSION HAS NO LOT WITNESS — named, not hidden

A POOL commission publishes a proved receipt
(`acceptedScreenplayCommissionReceipt`) and the Lot shows the
`lot-screenplay-commission-witness` card: title, writer, commissioned week, due
week. That witness is keyed to a **market** payload — it proves a `conceptId`
that an original does not have, because the concept is minted by the action
itself. An original commission therefore closes the workspace with no witness.

What lands instead is honest and immediate: the committed panel names the
picture using a closed witness of its own (`mintedScreenplayTitle` — exactly one
concept appended, exactly one blueprint appended, the two agreeing, an ordinal
burned), the Development inspector then says the writers are working on it BY
NAME, and the Writers Room card carries "‹Writer› is writing ‘TITLE’" from the
same moment. **The delivery beat — "‹Writer› delivers ‘TITLE’" — is the one the
§12-M3 gate names, and it is landed** at the Lot review panel and on the board.

An `acceptedOriginalScreenplayCommissionReceipt` in
`ui/src/lot/snapshot/scriptCommission.ts`, plus its arm in the Lot witness, is a
named follow-up. It is additive and needs no engine work.

### 8.3 THE SCRIPT BOARD CARD CARRIES PROVENANCE WITHOUT WIDENING THE CORE VIEW

The engine lane's handoff named this a blocker: `ScriptProjectCardView` is
exact-key checked by `scriptReview.ts:CARD_KEYS`, and widening the core view was
out of that lane's reach. The UI lane did not need it. Provenance is resolved at
the **adapter layer** (`ui/src/engine/screenplay.ts →
screenplayIdentitiesByProject`) from the blueprint root and the talent census,
which is where it belongs anyway: *who wrote a screenplay is a studio-relative
fact*, and the shared-world `FilmConcept` must never carry one (guardrail 8).
`CARD_KEYS` is untouched and `ScriptProjectCardView` is unchanged.

`LotScriptReviewContext` **was** widened — with a nullable `provenance` — because
that context is the Lot's own snapshot type and is this lane's to own. It is
nullable on purpose: a credit that cannot be resolved is withheld, and the
Accept/Rewrite decision is never withheld for want of a sentence.

### 8.4 SET DEMAND IS JOINED TO M2's PANEL, INSIDE ITS G12 GUARD

`requiredSetDemand` is published to the package through the M2 set surface
(`SetStagePanel`), not beside it, so **G12 still holds**: a studio whose pictures
are not bound to sets is told nothing about sets, because every sentence would be
false of it. Demand renders as rows of "The script calls for ‹Location›" with the
beats that ask and whether one is standing — and never as a blocker. The browser
floor asserts the greenlight is **enabled** with locations unbuilt, because a
player sent to build a set to unblock a greenlight that was never blocked has
been lied to.

### 8.5 A FLAKE FOUND AND NOT FIXED, because it is not M3's

`ui/src/lot/WorldFirstAnnexConstruction.test.tsx:583` ("keeps the semantic Annex
context when the live renderer cannot paint its outline") asserts
`annexHostSelections === 1`. It failed ONCE, with 2, on the first run after a
module-graph change, and has passed on every run since — including a full
cold-transform-cache run. The count is the number of times a `useEffect` calls
the fake renderer's `selectHollywoodAnnexPlace`, and the fixture's `onReady`
fires from a `queueMicrotask`, so the assertion is sensitive to first-run
transform timing rather than to product behaviour. Recorded so the next person
who sees it knows it has been seen.

---

*End of M3 records.*
