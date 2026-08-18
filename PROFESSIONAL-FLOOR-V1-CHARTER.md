# PROFESSIONAL FLOOR V1 — CAMPAIGN CHARTER (DRAFT FOR OWNER AUTHORIZATION)

> Status: **DRAFT — planning only. No implementation is authorized by this document.**
> Prepared by Fable (Game Director/PM) under the Owner order of 2026-08-18
> ("PROFESSIONAL FLOOR DIRECTION APPROVED, WITH HARD SCOPE").
> Base: the sealed Campaign 1 tree (`f294077`). Branch: `professional-floor-v1`.
> Every scope claim below was verified against the live build by a three-scout
> recon pass; file:line evidence is cited where a claim depends on it.

## 1. Mission and bounds

Give Project: Studio its professional sensory floor — **sound, punctuation, and a
commercial product shell** — so that operating the studio feels like running
Hollywood rather than administering software, without changing one authoritative
outcome.

**This is a bridge into C2, not a polish program.** One short implementation
campaign; four milestones; then directly into Campaign 2 (Sets, Stages &
Production Throughput + Founding Flip). There is no PF2. Anything that does not
fit is deferred and named in §8.

**No new simulation subsystem.** The engine (`src/core`) is untouched except for
data-only TUNING entries for the futures shelf (§5, PF1-M3) and their test pins.
All implementation lives in `ui/`.

## 2. Standing law established by this campaign

**PRESENTATION NEVER CREATES OR PERSISTS GAME TRUTH.**

- Presentation *reacts to* authoritative simulation events; it never composes new
  copy for them (the single-composer law is already sealed: adapter stop messages
  are "built here, never inferred by React" — `adapter.ts:2474-2476`; the
  requirement vocabulary permits "no other module [to] hold a second copy" —
  `blueprintRequirements.ts:3-6`). Punctuation is a **fourth, purely sensory
  layer** over the sealed three-way grammar (decision context / toast / receipt);
  it is never a fourth copy composer.
- Presentation state (volumes, motion preference, beat cooldowns, audio unlock)
  lives outside `GameState` and never enters a save file. Player preferences
  persist under a new **`project-studio.prefs.*`** localStorage namespace —
  explicitly NOT `project-studio.flags.*`, which is a QA surface and says so
  (`flags.ts:5-6`).
- The presentation layer makes **no RNG draws from the sim stream and no
  `Math.random()` calls** (banned by standing law). If sensory variation needs
  pseudo-randomness, it derives from stable data via the existing seeded-hash
  idiom (`gridHash` pattern).
- Proof obligation (the Owner's restraint test, made mechanical): a scripted
  parity run — the same action sequence with the presentation layer enabled and
  disabled — must produce **byte-identical GameState saves**. This gate is part of
  the M4 seal.

On authorization this law is recorded in `docs/SHIFT-OPERATIONAL-LAWS.md` with a
PF1 provenance note.

## 3. Editorial voice (established here, reused forever)

Target: **confident 20th-century Hollywood trade language — restrained humor,
period flavor, never sterile SaaS copy, never modern quipping.** The world has
opinions about itself. The existing copy is already close ("This ground is
protected — the studio does not build on it."); PF1 formalizes the register and
applies it to every line the campaign touches.

Voice rules (binding for PF1 surfaces; recommended thereafter):
1. The studio speaks as an institution, in the present tense, with pride:
   "The studio does not build on protected ground," never "Error: invalid tile."
2. Trade-paper cadence for events: "PICTURE FORMED", "NOW OPERATIONAL",
   "FIRST WEEK'S RECEIPTS ARE IN." Headlines earn capitals; body copy does not.
3. Restraint is voice too: a routine week deserves a quiet line, not a bulletin.
4. Failure copy states the fact, the reason, and the way forward, in that order —
   the existing blocked-state grammar already does this; keep it.
5. The PA/radio register (§5.2) may be wry; it is never sarcastic about the
   player's studio.

Every sentence PF1 adds or edits passes a voice review at the M4 gate. Voice is a
charter section, not a new document — later campaigns cite this section.

## 4. What the recon verified (the facts this scope stands on)

- **The sound engine is already shipped.** Phaser 3.90 full build is the pinned
  dependency; the game config sets no `audio` key, so the WebAudio sound manager
  boots today and `this.sound` sits live and unused in every scene
  (`StudioLotView.ts:155-170`). Enabling audio is asset-and-wiring work, not a
  dependency or architecture decision.
- **Binary assets have an existing pattern.** `ui/public/lot/` already ships 9
  PNGs + 2 JSON manifests loaded by URL through Phaser's loader
  (`TycoonScene.ts:486-492`). Audio files follow the same path.
- **Audio cannot move the structural pins.** The frozen decoded-byte tuples sum
  texture-manager keys only (`TycoonScene.ts:3757-3767`); audio enters a different
  cache. Pin-neutrality is asserted, not hoped for.
- **The punctuation inventory is closed.** Between any two weeks the authoritative
  events are: the 9 governed stop reasons (`adapter.ts:2213-2223` — release,
  scriptReview, castingReview, productionDecision, constructionCompleted,
  runCompleted, contractExpired, renewalWindow, cashNegative; plus the `limit`
  harness guard, excluded from punctuation), `released[]`,
  `constructionCompletion`, the greenlight formation receipt, the build/move/
  demolish commit receipts, and the FirstFilmJourney milestone ladder
  (`src/core/firstFilmJourney.ts:73-85`). Each has exactly one sealed copy
  composer.
- **Two event channels are invisible today.** Of the five aria-live regions
  (`StudioLotScreen.tsx:7834-7885`), "annex operational (in-lot path)" and "plain
  week advance" have **zero visible surface**; the other three decorate existing
  visible receipts. The single-owner cadence gate is sealed law
  (`completionAnnouncementOwnedRef`, `StudioLotScreen.tsx:1570` and `2760-2775`;
  "The next-event rail owns this cadence moment", `StudioLotScreen.tsx:7821`);
  punctuation attaches to the same gates.
- **Browser dialogs: exactly 9, all in `App.tsx`** (8 alerts, 1 confirm), and the
  lot already codified the replacement law: "a destructive verb must be answered
  where the thing being destroyed is standing … never a browser dialog"
  (`StudioLotScreen.tsx:6218-6220`). Reusable idioms exist: the in-world confirm,
  the `LotRetainedWorkspace` dialog host, and `ErrorBox`.
- **Save slots are cheap at 6, risky above.** Saves run 220–270KB and grow;
  under worst-case UTF-16 accounting, 6 named slots + autosave + quarantine
  stays inside a 5MB origin quota (8+ slots would not at upper save sizes);
  `session.ts:40-42` currently **swallows quota failures silently** — a live
  defect PF1 fixes.
- **UI scale has no seam.** ~1,200 hard px declarations, no root font-size rule.
  Cut from PF1 (§8) per the Owner's own condition ("if current architecture
  supports it cleanly" — it does not).
- **The journal is not a cheap view.** The rail retains exactly one receipt
  (`LotNextEventRail.tsx:37`, `App.tsx:1039`); a real journal needs new retention
  plumbing touching the save envelope. Deferred (§8) per the Owner's escape
  hatch. Release history already exists (archived front pages + Film Chronicle).
- **The futures shelf is zero-new-machinery.** A blueprint carrying a non-live
  requirement kind renders today as a locked row with distinct "distant future"
  styling (`data-not-yet-attainable="true"`, `StudioLotScreen.tsx:6514-6519`) and
  the sealed honest sentence ("… is not part of the game yet."). **Four** test
  pins hold the catalog at 5 entries (`tests/placement-core.test.ts:92`,
  `tests/facility-effects.test.ts:528`, `tests/blueprint-requirements.test.ts:625`,
  `ui/src/lot/buildCatalog.test.ts:38-44/129/364`), and `buildCatalog.test.ts:
  289-290` additionally pins one distinct texKey per catalog id — so each futures
  row also carries its own minimal presentation entry (a distinct texKey; no
  world body ever composes while locked). Moving these pins carries provenance
  per law 25, and implementation begins with a fresh sweep for any further
  catalog-count assumptions.

## 5. Milestones (exactly four)

### PF1-M1 — THE STUDIO SOUNDS ALIVE (audio architecture + ambience + UI floor)

One audio service for the whole product, designed for reuse by every later
campaign (C2 will create dozens of world events needing sound):

- **Channel model:** master / music / ambience / effects, each with a prefs-backed
  volume, all behind one facade. Autoplay policy handled once: audio unlocks on
  the first user gesture, silently, with no nag.
- **World ambience:** a restrained 1948 studio bed — environment (wind, birds,
  distant town), sparse work texture (distant hammering when construction is
  underway — reading real state; a calm lot when nothing is), camera-scale aware
  where cheap (the continuous update loop and LOD state already exist,
  `TycoonScene.ts:3581-3647`). **The calm-morning law: a quiet studio is allowed
  to sound quiet.** Ambience must read as a place, not a casino.
- **Music:** an era-keyed registry (`era → track list`) with a 1948 bed now, so
  C4's decade march swaps music by data. No commercial soundtrack; see asset
  policy below.
- **UI sound families**, wired at existing interaction seams: select (sparing),
  commit, cancel, refusal/error, construction started, construction completed,
  positive outcome, important warning. Families, not one-off files — later
  campaigns pick from the family, not the disk.
- **Asset policy (binding, exactly the Owner's categories):** project-owned,
  public-domain/CC0, generated-for-project, or clearly-temporary development
  audio only; every file listed in a committed `AUDIO-PROVENANCE.md` with source
  and license; temporary audio explicitly marked replaceable. No copyrighted
  film/music assets, ever.
- **Determinism:** the service reads state and plays sound; it never writes
  state, never draws from the sim RNG, never calls `Math.random()`.
- **Testability:** the service ships with a faithful test double (house pattern —
  the doubles say what they hold); vitest covers the classifier/registry logic;
  e2e asserts wiring through the double's event log, never through actual sound.

Gate: both tsc; full vitest; audio-service suite; the 60-second test passes a
Fable spot-check (fresh studio, hands off, the place sounds like it exists).

### PF1-M2 — PUNCTUATION (important events get felt; the law gets codified)

A pure **beat classifier** module maps the closed event inventory (§4) to tiered
punctuation, then thin presentation hooks fire sound + subtle motion + world
emphasis at the existing single-owner gates:

- **Tier 1 — memorable (reserved, few):** movie release (sting + screen
  transition into the existing NewspaperReveal, keyed on `source === 'release'` —
  archive clippings never sting); picture greenlit (the formation witness gets
  its held beat); facility becomes operational (completion toast arrives with
  sting + a brief world highlight on the building via the existing
  world-target/orientation channel).
- **Tier 2 — minor (one small sound + one small motion):** build committed,
  construction started, positive review outcomes, contract/renewal warnings,
  cash-negative crossing (warning family), week advance (a quiet tick — the
  world acknowledging time, not a fanfare).
- **Tier 3 — none:** bookkeeping stays bookkeeping. The restraint test is a seal
  gate, not a vibe.
- **The two invisible channels become visible:** the aria-only "annex
  operational (in-lot path)" and "week advance" moments get modest visible
  presentation carrying the **existing composed copy verbatim** — no new
  composer, same ownership gates, aria regions preserved untouched (standing
  accessibility law).
- **Cash presentation:** the topbar cash readout counts to its new value with a
  brief emphasis on large deltas. No floating world ticks in PF1 (canvas work
  belongs with C2's simulation theater).
- **Motion discipline:** every animation gates on the existing reduced-motion
  path (`StudioLotScreen.tsx:637, 4453-4460`) — and on the new in-game motion
  preference (M3). Reduced motion + muted audio must equal today's game,
  exactly.
- The **presentation-never-persists law** (§2) is recorded in the operational
  laws with the parity-proof harness landing in this milestone.

Gate: classifier vitest (every event type classified, tier table pinned);
announcement-law compliance proof (no double-announce — the one-owner gates hold
under punctuation, asserted in the existing contention suites); pin-neutrality
(Week-0 tuples byte-identical — beats are transient, rest state untouched);
parity proof green.

### PF1-M3 — THE COMMERCIAL SHELL (settings, saves, no browser voice, a glimpse of the future)

- **Settings screen** (one new screen variant in the existing union — mechanical
  per recon): master/music/ambience/effects volume sliders (the Owner named
  master/music/effects; the fourth **ambience** slider follows from the ambience
  mandate — Owner ratifies or strikes it at authorization); **motion preference**
  (System / Reduced / Full) implemented by promoting the 7 CSS
  `@media (prefers-reduced-motion)` blocks to a root class driven by OS-query-OR-
  stored-pref (the two JS `matchMedia` sites join the same resolver); UI scale is
  **not** included (§8). Settings persist under `project-studio.prefs.*` and
  never enter saves. Existing accessibility laws preserved verbatim; the OS
  reduced-motion signal can only ever be *strengthened* by the in-game pref,
  never overridden to less motion-safe.
- **Save shell** on the existing architecture (no rewrite): 6 named slots +
  the always-on autosave, clearly labeled as autosave; each slot shows name,
  week, seed, and saved-at timestamp; save/load/delete through the proven
  export/import/validation path (`Saves.tsx`, `session.ts`) with the legacy-V1
  import and the corrupt-quarantine behavior preserved; **quota failures
  surfaced** (fixing the silent swallow at `session.ts:40-42`) in voice
  ("The studio vault is full — clear a shelf before filing another print.").
  JSON export/import remains, reframed as "Export a print" for backup/sharing.
- **The browser never speaks again:** all 9 `window.alert`/`confirm` sites
  replaced — 8 error notices through the existing `ErrorBox`/notice idiom in
  place, the new-studio confirm through the proven dialog-host pattern. A static
  source gate (unit test) asserts zero browser-dialog calls in `ui/src`
  thereafter.
- **The futures shelf (anticipation, truthfully):** at most **three** authored
  catalog rows using only the existing not-yet-attainable machinery — proposed:
  **The Laboratory** (research kind — C4's unlock engine), **a Star Trailer**
  (rank kind — C5 amenity behind C3 progression), **the North Annex land grant**
  (landZone kind — C3 land acquisition). Each row: real name, honest effect
  sentence in future tense, the sealed "not part of the game yet" reason, the
  existing distant-future styling. No new requirement kinds, no invented unlock
  logic, no world bodies. The four catalog-count pins and the texKey-uniqueness
  pin (§4) move 5→8 with provenance, each row carrying a minimal distinct
  presentation entry. **The Owner strikes or approves each row at
  authorization.**
- Editorial voice applied to every line this milestone touches.

Gate: both tsc; full vitest; settings/save-shell e2e specs; zero-browser-dialog
static gate; futures rows render locked-distant with verbatim sealed copy.

### PF1-M4 — SEAL (playtest, red-team, KEEP/KILL)

- **Fable playtest against the Owner's four tests**, verbatim: the 60-second
  test (does the place sound like it exists?); the 30-minute test (successes
  acknowledged, refusals clear, commitment/completion satisfying, zero
  developer-tool UX); the commercial-product test (five minutes of UI/sound —
  "this is a game"); the restraint test (authoritative outcomes unchanged —
  the mechanical parity proof plus judgment).
- **Independent red-team**, targets: autoplay-policy edges (no gesture yet, tab
  restore, mute/unmute races); prefs/save quota exhaustion and the surfaced
  failure path; determinism (parity proof adversarially re-run on unfamiliar
  seeds; no RNG divergence, no state writes from presentation); announcement-law
  compliance (punctuation never double-announces, never re-orders the ruled
  stop-priority); pin neutrality; reduced-motion + muted = today's game
  byte-for-byte; voice-register consistency.
- **KEEP/KILL per milestone**, seal only if the four tests pass. Gates named at
  their HEAD per standing law. Then **directly into C2 planning** — no PF2.

## 6. Test strategy (campaign-wide)

- Engine untouched → the entire existing suite must pass **unmodified** except
  the four named catalog-count pins and the texKey-uniqueness pin (§4; futures
  shelf, provenance comments), after a fresh implementation-time sweep for any
  further catalog-count assumptions.
- New suites: audio service (double-backed), beat classifier (tier table
  pinned), settings resolver (OS/pref precedence), save shell (slots, quota
  surfacing, legacy import preserved), browser-dialog static gate, parity proof.
- Full serialized Playwright on both origins at the seal HEAD, per standing law
  (gate figures name their HEAD; no pipes; `$?` after redirection).
- Structural tuple pins expected byte-identical all campaign; any movement is a
  defect, not a re-pin.

## 7. Owner playtest (requested at seal)

A fresh studio, hands off for the first minute, then ~30 minutes of natural play:
found, build, commission, advance to a release. The four tests above are the
script. PF1 ships only on your pass.

## 8. Explicit non-goals (deferred, with owners)

| Deferred item | Where it lands | Why |
|---|---|---|
| Real-time / pause / speed controls | **C2 Time Model Ruling Docket** (plan §8a) | Simulation-design decision, not presentation (Owner ruling) |
| Ambient NPC motion, vehicles, crowds | **C2 simulation-theater law** | Motion must communicate real state; C2 creates that state |
| Premiere Night V1 | **C2 charter** (Owner-approved addition) | Needs the theater moment staged in-world with C2's presentation budget |
| "Principal photography wraps" beat | **C2** | Needs a new phase-transition derivation; C2 owns shooting visibility |
| "First profitable picture" beat | **C3** | Needs a new cumulative-profit derivation + projected-vs-final honesty ruling |
| Notification journal | **Deferred, unowned** | Not a cheap view (single-receipt retention today); revisit when a campaign needs persisted events. Release history already exists (clippings/Chronicle) |
| Voice acting / recorded PA | **Later production-value decision** | Text/radio register + stings suffice (Owner ruling) |
| UI scale | **Unowned; requires a sizing-token pass** | ~1,200 hard px declarations, no seam — not "cheap and clean" per the Owner's condition |
| Key rebinding, cloud saves, profiles | **Unowned** | Outside the minimal shell |
| New engine subsystems of any kind | **Never in PF1** | Owner hard scope |
| The reserved-parcel projection seam (C1 accepted debt) | **C2** (first campaign to touch the parcel surface) | PF1 touches catalog pins only, not the parcel projection |

## 9. Definition of DONE

PF1 is DONE when, at a single named HEAD on `professional-floor-v1`:

1. The four Owner tests pass in the Owner's own playtest (§7).
2. The parity proof holds: identical action script, presentation on vs off,
   byte-identical saves.
3. Zero `window.alert`/`window.confirm` in `ui/src`, enforced by a gate test.
4. A fresh studio, untouched for 60 seconds, is audibly a place — and a muted,
   reduced-motion session is exactly today's game.
5. Settings and named saves exist, in voice, with quota failure surfaced;
   prefs never appear inside a save file.
6. Every audio asset is listed in `AUDIO-PROVENANCE.md` with license.
7. The futures shelf shows only Owner-approved rows with sealed honest copy.
8. Both tsc clean; full vitest green; full serialized Playwright green on both
   origins; structural pins byte-identical; every gate figure names its HEAD.
9. The presentation-never-persists law is recorded in the operational laws.
10. The campaign log records KEEP/KILL per milestone with independent
    verification, and the seal entry hands off directly into C2 planning.
