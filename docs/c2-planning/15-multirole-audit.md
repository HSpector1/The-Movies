# 15 — MULTI-ROLE AUDIT (C2a-M0, lane AUDIT-MULTIROLE)

**Commission:** Owner GO order `00F` — *"Multi-role audit (immediate): verify whether
one performer can actually be committed to multiple principal roles on one picture. If
yes, FIX it unless explicitly modeled as a future special mechanic."*

**Audited at:** worktree `/Users/bruce/The Movies - C2 Implementation`, branch
`c2a-implementation`, HEAD `8580546`. Read-only lane: nothing in `src/`, `ui/` or
`tests/` was modified. The execution proof below ran from a scratch file OUTSIDE the
repository against the repository's own engine.

---

## 1. VERDICT

**NO. One performer CANNOT be committed to two principal roles on one picture at this
HEAD. The invariant exists, is enforced at the single production-creation site, covers
all six principal roles, and is pinned by tests. No fix is required.**

Status: **PROVEN-BY-EXECUTION** (all fifteen role pairings exercised against the real
`applyActions`; see §4).

The governing check is `src/core/actions.ts:381-406` — **M16.7, within-production
single-role uniqueness** — landed in `f267cd9` ("Phase 5.1: talent skills, OVR, fit…")
and citing the settled ruling *"a talent fills exactly one role in one production."*
It is not a UI convention and not an accident of pool partitioning: it is an engine
refusal.

Both layers hold. Engine truth is the guard; the UI additionally prevents the player
from ever composing the illegal package (§5), so the refusal is unreachable through
normal play rather than reachable-and-ugly.

---

## 2. THE COMPLETE ROLE-ASSIGNMENT LEGALITY CHAIN AT THIS HEAD

### 2.1 The shape of a picture's principal roles

`src/core/types.ts:19` — `CastSlot = 'lead' | 'antagonist' | 'support'`.
`src/core/types.ts:225-239` — `Production` carries `writerId`, `directorId`,
`craftIds: string[]`, `cast: Record<CastSlot, string>`. Six principal seats on a normal
engaged picture (writer, director, one Production/Craft Lead, three cast slots).
`src/core/types.ts:217-222` — `FilmParticipants` mirrors that shape
(`writer`, `director`, `cast: Record<CastSlot, FilmParticipant>`, `craft: FilmParticipant[]`).

Neither type is *structurally* incapable of holding the same `talentId` twice — a
`Record<CastSlot, string>` cannot express "distinct" in the type system. Uniqueness is
therefore a **validation** invariant, not a type invariant, and it must be (and is)
asserted at the write site.

### 2.2 There is exactly ONE write site for a Production

```
src/core/worldgen.ts:626      activeProductions: []            (genesis, empty)
src/core/actions.ts:595       activeProductions: [...state.studio.activeProductions, production]
```

Those are the only two. Every picture in the game comes into existence through
`applyGreenlight` (`src/core/actions.ts:286`). This matters more than any individual
check: there is no second door.

### 2.3 Both greenlight actions pass through that one door

- `greenlight` → `applyGreenlight` (`actions.ts:2002`).
- `greenlightScriptProject` → `applyGreenlightScriptProject`
  (`actions.ts:1603-1648`), which copies the screenplay's `conceptId/shape/promise/
  writerId` out of the authoritative `ScriptProject` and then **delegates to
  `applyGreenlight`** at `actions.ts:1620`, passing the caller's `directorId`,
  `craftIds` and `cast`.

The consequence is the one an integrator most needs: on the managed/screenplay path the
caller does **not** supply the writer, so a caller could name the screenplay's own writer
as director or as a cast slot without noticing. `applyGreenlight` validates the
*assembled* payload, so that collision is caught anyway (proven: `writerId`+`lead`,
`writerId`+`directorId` both rejected, §4).

### 2.4 Every uniqueness check PRESENT in `applyGreenlight`

| # | Anchor | Rule |
|---|---|---|
| 1 | `actions.ts:352-371` | **M16.2 existence + role.** Every id resolves to a real `Talent` (`requireTalent`) and passes `requireRole`. |
| 2 | `actions.ts:265-280` | **D-9/OQ-1 relaxation.** `requireRole` is a HAS-DISCIPLINE check, not a role-TYPE check — every talent carries all four skill sets, so *this check always passes*. Cross-discipline assignment is deliberately legal. **This is precisely why an explicit uniqueness check is required**: nothing about "being a writer" stops the engine from seating that person as the lead. |
| 3 | `actions.ts:373-379` | **M16.3 cast-slot distinctness.** The three cast ids must be distinct. Narrow (cast only) and now strictly subsumed by #4, but it fires first and owns the cast-specific message. |
| 4 | `actions.ts:381-406` | **M16.7 within-production single-role uniqueness — THE ANSWER.** Collects every assigned id in a fixed order (`writerId`, `directorId`, each `craftIds[i]` in array order, then `cast.lead → cast.antagonist → cast.support`) into a `Map<id, role>` and throws on the first repeat, naming both roles. Covers all six seats and duplicate ids *within* `craftIds`. |
| 5 | `actions.ts:408-436` | **M16.5 across-film exclusivity.** None of the engaged ids may already be busy in any active production (writer/director/any cast/any craft) or hold an active script-writer assignment. This is the ACROSS-films check named in the commission; it is orthogonal to #4 and does not substitute for it. |
| 6 | `actions.ts:499-505` | **D-11.13** — exactly one Production/Craft Lead once employment is engaged. |
| 7 | `actions.ts:506-530` | **D-11.12** — each assigned talent is studio-contracted or an available freelancer. |

Order matters for message quality: #3 fires before #4, so a lead↔support collision
reports *"assigns the same actor to more than one cast slot"* while a writer↔lead
collision reports the fuller M16.7 message. Both refuse.

### 2.5 Every uniqueness check ABSENT (enumerated honestly)

1. **No type-level or constructor-level guard.** `Production.cast` /
   `FilmParticipants.cast` are plain `Record<CastSlot, …>`. `buildFilmParticipants`
   (`actions.ts:209-234`) copies whatever it is handed. It is only ever handed a payload
   that already survived #4, so this is safe *by call-site discipline*, not by
   construction.
2. **No load-time uniqueness assert.** `v8Production` (`src/core/save.ts:1186-1244`)
   validates exact keys, that every `writerId`/`directorId`/`craftIds[]`/`cast[slot]`
   references a known talent, and that active-production **ids** are unique
   (`save.ts:2267-2278`) — but it never asserts that a production's own six seats are
   distinct. A hand-edited or externally-authored save could therefore carry a duplicate
   past load. Not reachable by play; see §6 for why I do **not** recommend closing it at
   M0.
3. **No `assertStudio…Invariants` counterpart for productions.** `castingSessions`,
   `operations`, `construction`, `placement` and `scriptDevelopment` each export an
   invariant asserter; `state.studio.activeProductions` has none.
4. **Casting slates deliberately permit the same person in two role pairs** —
   `castingSessions.ts:113-137`. This is a *stated* design decision, not a gap; see §3.

### 2.6 Nothing mutates a picture's participants after greenlight

The only post-greenlight action that touches a director is `assignShootingDirector`
(`src/core/operations.ts:253-280`), and it accepts **only the already-locked director**
(`operations.ts:264-268`). There is no recast, no replace, no swap action in the `Action`
union (`types.ts:1266-1302`). So a legal package cannot drift into an illegal one.

---

## 3. CASTING SESSIONS — where the same person legitimately appears twice

`src/core/castingSessions.ts:113-115` states it outright:

> *"Same-person reads in different role pairs remain legal; each pair itself must be
> distinct and the full slate needs three distinct people so some legal three-person
> assignment exists."*

`assertCastingSlateLaw` (`castingSessions.ts:116-137`) enforces exactly two candidates
per slot, distinct within the pair, and `CASTING_MIN_UNIQUE_CANDIDATES = 3`
(`src/core/tuning.ts:836`) across the whole slate. `assertCastingSlateEligibility`
(`castingSessions.ts:139-164`) additionally bars non-actors, the screenplay's locked
writer, busy talent, and anyone outside the contracted/freelancer pools.

`CastingSession` (`types.ts:708-717`) stores `slate` and `results` and **no chosen cast**.
Auditions therefore commit nothing: there is no pre-greenlight "committed package" state
in which a duplicate could be persisted at all. The word *committed* in the Owner's
question resolves to exactly one moment — greenlight — and that moment is guarded.

The ≥3-unique-people floor is what makes the design safe: whatever the player auditions,
at least one legal three-person cast always exists, so the M16.7 refusal can never trap a
picture.

---

## 4. EXECUTION PROOF

Scratch spec (outside the repo, at
`…/scratchpad/multirole-proof.test.ts`) run against the repository's own
`src/core/index.js` surface via `npx vitest run --config …/vitest.proof.config.mjs`
with `root` = this worktree. Seed `audit-multirole-dup`; a fully-staffed six-seat payload
(writer, director, one craft lead, three actors), then for each of the **15** unordered
pairings the id of role *a* is copied into role *b* as the ONLY collision.

```
Test Files  1 passed (1)
     Tests  16 passed (16)
```

- Baseline (all six distinct) — **accepted**, no over-rejection.
- All 15 pairings — **rejected**. Representative messages:

```
directorId/writerId    → applyActions: greenlight assigns talent "t-dir-00" to more than one role in the
                           same production (writerId and directorId) — a talent fills exactly one role in
                           one production (M16)
lead/writerId          → …assigns talent "t-act-00" … (writerId and cast.lead) …
directorId/lead        → …assigns talent "t-dir-00" … (directorId and cast.lead) …
antagonist/craft0      → …assigns talent "t-act-01" … (craftIds[0] and cast.antagonist) …
craft0/lead            → …assigns talent "t-cra-00" … (craftIds[0] and cast.lead) …
lead/support           → …assigns the same actor to more than one cast slot (t-act-00, t-act-01, t-act-00)
antagonist/support     → …assigns the same actor to more than one cast slot (t-act-00, t-act-01, t-act-01)
```

Pairings covered: writer↔director, writer↔craft, writer↔lead, writer↔antagonist,
writer↔support, director↔craft, director↔lead, director↔antagonist, director↔support,
craft↔lead, craft↔antagonist, craft↔support, lead↔antagonist, lead↔support,
antagonist↔support.

### Replay sequence for an integrator (no scratch file needed)

```
state = generateWorld('audit-multirole-dup')
prod  = { conceptId: state.concepts[0].id,
          shape: { opening:'mysteryHook', midpoint:'reversal', ending:'bittersweet' },
          promise: { genre: <that concept's genre>, intendedSegments:['adult'],
                     ranges:{ intimacy:[-0.5,0.5], tonalWeight:[-0.5,0.5], kineticEnergy:[-0.5,0.5] } },
          writerId: <first role==='writer'>, directorId: <first role==='director'>,
          craftIds: [<first role==='craft'>],
          cast: { lead:<actor0>, antagonist:<actor1>, support:<actor2> },
          budget: { negative: 5_000_000, marketing: 800_000 } }
applyActions(state, [{ kind:'greenlight', production: { ...prod, cast:{ ...prod.cast, lead: prod.writerId } } }])
  → throws (M16.7)
```

*(Note for anyone reproducing: `shape` is the three-beat `FilmShape`
`{opening, midpoint, ending}`. A malformed shape crashes later in the forecast with a
bare `TypeError: Cannot read properties of undefined (reading 'expression')` — a
separate, minor robustness observation, not a legality finding.)*

### Existing tests that already pin this (do not weaken)

| Anchor | Pins |
|---|---|
| `tests/actions.test.ts:357-362` | same actor in two cast slots throws (M16.3) |
| `tests/actions.test.ts:364-378` | **writerId === cast.lead throws** (M16.7), with the ruling quoted in the comment |
| `tests/actions.test.ts:380-398` | an actor-role talent used ONLY as writerId still succeeds (no over-rejection of cross-discipline) |
| `tests/actions.test.ts:400-409` | all-distinct greenlight still succeeds |
| `tests/ruling-b-multihyphenate.test.ts:317-342` | cross-discipline careers do not weaken M16.3 |
| `ui/src/screens/assembly-legality.test.tsx:99-…` | UI: choosing an actor disables that person in the other cast slots |
| `ui/src/screens/script-projects-edge-ui.test.tsx:284` | UI refusal copy *"Already assigned to another slot on this film"* |

Verified green at HEAD: `npx vitest run tests/actions.test.ts -t "single-role"` →
2 passed, 30 skipped.

---

## 5. THE UI LAYER (reported alongside engine truth, as commissioned)

`ui/src/lot/LotPackageWorkspace.tsx` is a **modal host only** (71 lines) — it owns
containment and the "GREENLIGHT ACCEPTED" state and makes no legality decision. The real
decision surface is `<Assembly>` (`ui/src/screens/Assembly.tsx`), mounted both standalone
(`ui/src/App.tsx:4329`) and inside the Lot workspace (`ui/src/App.tsx:4665`). One
component, one rule set, both routes.

Assembly prevents duplication three ways:

1. **Pools are role-partitioned.** Each `TalentPicker` gets `talentByRole(…)`, and
   `talentEligibility` (`ui/src/engine/adapter.ts:1279-1300`) hard-rejects
   `talent.role !== wantRole`.
2. **`chosenElsewhere` cross-excludes every other seat.** `Assembly.tsx:1128-1135`
   builds `castIds`/`otherCredits`, and each picker passes every *other* credit:
   writer `:1220-1224`, director `:1237-1241`, each cast slot `:1258-1263`, craft
   `:1282-1286`. The comment at `:1129-1133` names the reason exactly — cross-discipline
   eligibility means primary-role pools cannot be relied on to be disjoint.
3. **The control is genuinely disabled**, not merely annotated:
   `ui/src/components/TalentPicker.tsx:380` computes eligibility and `:405` sets
   `disabled={!elig.eligible}`, with the reason rendered: *"Already assigned to another
   slot on this film."* (`adapter.ts:1297`).

The locked-screenplay path is consistent: when a Ready script owns the writer credit the
writer picker is replaced by a locked panel (`Assembly.tsx:1207-1212`) and
`draft.writerId` is seeded from the locked writer in the `useState` initializer
(`Assembly.tsx:146`, `:296`) — synchronously, so the exclusion is in force on first
render, with no window in which the locked writer is selectable as an actor.

`CastingSlatePlanner` (`ui/src/screens/CastingSlatePlanner.tsx:92-103`) mirrors the engine
slate law (exactly 2 per slot, ≥3 unique) and states the multi-read allowance in player
language at `:146-150`: *"A person may read more than one role, but the complete slate
needs at least three different people."*

**Conclusion:** engine refuses, UI never lets you ask. No fix at either layer.

---

## 6. RECOMMENDATION — NO FIX; ONE OPTIONAL HARDENING, NOT AT M0

Because the answer to the Owner's question is *no*, §3 of my commission (specify the
bounded fix) is **moot for the invariant itself**. What follows is the only residual, and
I recommend **deferring** it.

**Residual:** no load-time uniqueness assert (§2.5 item 2), `src/core/save.ts:1186-1244`.

**Where it would belong:** `v8Production`, immediately after the existing per-field
talent-existence checks — the same `Map<id, role>` sweep as `actions.ts:390-406`,
producing a `v8Error(…)`. **~10-14 lines**, no TUNING constant, no new type.

**Why NOT at M0:**
- It is unreachable by play. Every in-game production passes M16.7 first; only an
  externally-edited save could carry a duplicate.
- M0's binding gate is **M0A corpus byte-identity + save/replay behaviour-identity on
  every legal state** (charter §12-M0, `:1240`, `:308`). A new load-time throw changes
  the accept/reject boundary of `load()`. That is exactly the class of change M0
  discipline exists to keep out, for a defect with no play-reachable trigger.
- It duplicates an invariant already asserted at the only write site, and the project
  convention is one authority per rule.

**If the Owner wants it anyway:** name it for **M2**, owned by **OPUS-ENGINE-CORE**
(which already owns `src/core` and `save.ts` V14 per charter `:1348`), landed with the
save-migration work so the corpus re-baseline happens once rather than twice. Refusal
copy stays engine-internal (`load()` failures are not a player-facing grammar surface);
the player-facing grammar is `adapter.ts:1297`, which already reads correctly.

**Additionally recommended, zero-risk, any milestone:** the M16.7 test at
`tests/actions.test.ts:371` covers exactly one pairing (writer↔lead). My scratch spec
covers all fifteen. Folding the fifteen-pairing loop into `tests/actions.test.ts` is a
**test-only, ~25-line** addition that touches no engine byte and would make a future
refactor that deletes `actions.ts:381-406` fail loudly instead of silently. The scratch
spec is reproducible from §4 verbatim. I did not land it — `tests/` is outside this
lane's ownership set. **Suggested owner: OPUS-ENGINE-CORE at M0-integration.**

---

## 6A. INTEGRATOR DISPOSITION (lane INTEGRATE-M0)

Recorded by the M0 integration lane, which holds the whole worktree as sole writer.
Each of §6's residuals is either landed or routed to a named milestone and owner — none
is left as an unowned note.

| # | Residual | Disposition | Owner / milestone |
|---|---|---|---|
| R1 | No load-time uniqueness assert in `v8Production` (`src/core/save.ts`) | **DEFERRED, as recommended.** Not landed at M0. | **OPUS-ENGINE-CORE, C2a-M2**, with the V14 save/migration work |
| R2 | M16.7 pinned by one pairing only (`tests/actions.test.ts`) | **LANDED at M0-integration** — commit `ee0cb24`, `test(c2a-m0): pin all fifteen single-role seat pairings, not one`. `tests/actions.test.ts` 32 → 48 tests. | INTEGRATE-M0 (test-only) |
| R3 | Movie #2 legibility: the casting → package seam drops the audition payoff | **ROUTED, not landed.** Presentational only; belongs with the package/greenlight legibility gate. | **OPUS-SCREENS, C2a-M2** (the §12-M2 LEGIBILITY gate already owns the package/greenlight surface) |
| R4 | Tycoon-floor defect: raw engine refusal strings rendered verbatim at the greenlight button | **ROUTED, not landed.** Needs a translation seam between `ActionOutcome.error` and the player; the blocked-state grammar surface is charter §12-M4's **G16** gate. | **OPUS-SCREENS, C2a-M4** (adapter edits, if any, to OPUS-ENGINE-CORE per charter `:1348`) |
| R5 | Minor robustness: a malformed `FilmShape` at greenlight crashes downstream with a bare `TypeError` instead of a validated refusal | **ROUTED, not landed.** Same class as R1 (payload validation), same file family. | **OPUS-ENGINE-CORE, C2a-M2** |

**On R2 specifically.** The integration lane's standing instruction was to land the
audit's bounded fix *only if duplication is possible*. It is not — §1's verdict stands
after re-verification at this HEAD (the M16.7 sweep is present and unmodified in
`applyGreenlight`, and `greenlightScriptProject` still delegates through it). So no
*invariant* was added. R2 was landed anyway because it is strictly a **pin on existing
behaviour**: it changes no engine byte, so it cannot disturb the M0A corpus
byte-identity gate, and it converts a silent-deletion risk into a loud one. Its
non-vacuity was proven by temporarily short-circuiting the M16.7 guard — 13 tests fail
under that mutation (the 12 new non-cast-only pairings plus the pre-existing
writer↔lead pin), and the 3 cast-only pairings correctly stay green because M16.3 owns
them. The guard was restored before the commit.

**Anchor re-verification at the integration HEAD.** The audit's file:line anchors were
written against `8580546` and were spot-checked here against `ee0cb24`'s parent: M16.7
still occupies `src/core/actions.ts:381-406`; `requireRole`'s relaxed has-discipline
form is still at `:265-280` (which is why the explicit sweep is load-bearing); the
`economyEngaged`-gated D-11.13/D-11.12 checks are still at `:499-530`. No drift.

---

## 7. MOVIE #2 LEGIBILITY (00F gate) — one paragraph, as commissioned

One thing on the casting→package seam is worth naming now, and it is the Owner's own
"why do auditions matter" question. The engine is right that auditions are evidence, not
a commitment — `CastingSession` stores no chosen cast (`types.ts:708-717`), and the
Assembly hand-off says so plainly: *"Auditions did not preselect anyone. Choose a
currently legal Lead, Antagonist, and Support below."* (`Assembly.tsx:1201-1203`),
reinforced by *"Results are imperfect evidence, not a forecast guarantee or an automatic
cast choice"* (`CastingSlatePlanner.tsx:176-178`). But the cast pickers that follow are
drawn from the **entire assignable roster**, not from the people who actually read, and
nothing in the picker marks who auditioned or how they read. So the surface answers WHAT
HAPPENED (the evidence card renders) and WHAT DO I DO NEXT (pick three actors), while
WHY IT MATTERS quietly evaporates at the exact moment it should pay off: the player walks
from a screen that says "these two read for Lead" into a list of thirty names where the
two who read are indistinguishable from everyone else. That is the Movie #2 gate's
failure mode in miniature — not a missing mechanic, a missing *carry-through*. The
bounded remedy is presentational and belongs to the screens lane: badge audition
participation and the observed read on the candidate card in the cast pickers, and sort
or group auditioned candidates first for the slots they read. Separately and much
smaller: every engine refusal at the greenlight button is rendered verbatim
(`Assembly.tsx:712` → `ui/src/components/common.tsx:63-69`), so a blocked greenlight
currently shows the player a string beginning *"applyActions: greenlight rejected — …
(M16)"*. That is textbook debug/engine language and violates the 00F professional tycoon
floor directly; it needs a translation seam between `ActionOutcome.error`
(`adapter.ts:1666-1691`) and the player, owned by whichever lane holds the blocked-state
grammar.

---

## 8. FILES INSPECTED

`src/core/actions.ts` · `src/core/types.ts` · `src/core/castingSessions.ts` ·
`src/core/filmPackage.ts` · `src/core/operations.ts` · `src/core/save.ts` ·
`src/core/worldgen.ts` · `src/core/tuning.ts` · `tests/actions.test.ts` ·
`tests/ruling-b-multihyphenate.test.ts` · `ui/src/screens/Assembly.tsx` ·
`ui/src/screens/CastingSlatePlanner.tsx` · `ui/src/screens/assembly-legality.test.tsx` ·
`ui/src/components/TalentPicker.tsx` · `ui/src/components/common.tsx` ·
`ui/src/engine/adapter.ts` · `ui/src/lot/LotPackageWorkspace.tsx` · `ui/src/App.tsx`

No repository file was modified by this lane other than this report.
