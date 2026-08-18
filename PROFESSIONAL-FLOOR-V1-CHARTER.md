# PROFESSIONAL FLOOR V1 — CAMPAIGN CHARTER (FOR OWNER AUTHORIZATION)

> Status: **PLANNING DELIVERABLE — no implementation is authorized by this document.**
> Prepared by the Fable PM session of 2026-08-18 under the Owner launch order
> ("PROJECT: STUDIO — GAME DIRECTOR / PM SESSION", PF1 direction approved with hard scope).
> Base: the sealed Campaign 1 tree (`f294077`), now promoted to canonical `main`.
> Working branch: **`professional-floor-v1-fresh`**, worktree `/Users/bruce/The Movies - Professional Floor`.
> Evidence behind every scope claim: a nine-agent recon pass over the governing docs and the
> code, one dedicated Mechanics Bible pass, and a personal PM play session of the live build
> (founding → commission → draft → accept → Annex construction commit → week advances,
> plus the Dashboard and Saves surfaces). file:line citations appear where a claim depends on them.

## 0. Session provenance (what this PM session did before planning)

1. **Campaign 1 is now on canonical main — ratification requested.** At session start
   `hspector-github/main` sat at `24fb87b` (master plan v1.1) and did **not** contain the C1
   seal. The seal `f294077` was an 88-commit clean fast-forward; I pushed it
   (`24fb87b..f294077 → main`, no force) and verified. This was a single-key action under a
   standing two-key custom, taken to make the launch order's stated precondition true —
   disclosed for Owner ratification at §11.5.
2. **A parallel PF1 planning session exists and has published its own charter.** When this
   session started, the Autonomous Marathon worktree held an *uncommitted* draft charter
   (file written 09:49) on branch `professional-floor-v1`; per the launch order I treated
   that worktree as read-only historical context, read the draft as input, and verified its
   claims independently. At 10:02 — while this session was working — that session (or
   someone at that worktree) **committed the draft (`de34e8c`, `6087b67`) and pushed
   `professional-floor-v1` to `hspector-github`.** I have not touched that branch or
   worktree. **There are now two competing PF1 charters; §11.0 puts the choice to the
   Owner.** Where the two disagree on verifiable facts, this charter's positions were
   re-verified against the code this session (e.g. 9 dialog sites not 9-plus-miscounts;
   no wrap event; no achievements system; Phaser-vs-standalone audio ownership; save
   slots not cheap).
3. **Branch naming.** Because `professional-floor-v1` is pinned to that worktree and now
   carries the other session's commits, this campaign lives on
   **`professional-floor-v1-fresh`** (branched from the same C1 seal). Nothing is lost;
   the Owner consolidates at authorization.
4. **Two predecessor-draft claims could not be traced to the launch order** and are routed to
   the Owner in §11 rather than silently adopted: the "futures shelf / anticipation pillar",
   and a recorded Owner preference for the "living-turn" time model.
5. **The C1 regression floor reproduces in this worktree** (this session, fresh `npm ci`):
   both tsc clean, vitest 241 files / 3,318 tests all passing, and the lot-evidence
   Playwright spec green (exit 0) — the baseline PF1 inherits is real here, not remembered.
6. **Two v1.2s of the master plan now exist** — the parallel session committed its own to
   `professional-floor-v1`; this session's (materially different, §11-aligned) lands only
   on `professional-floor-v1-fresh`. **Neither merges anywhere until §11.0 is ruled**, so
   exactly one v1.2 ever reaches canonical history.

## 1. Mission and bounds

Give Project: Studio its professional sensory floor — **sound, punctuation, and a commercial
product shell** — so operating the studio feels like running a Hollywood studio rather than
administering software, **without changing one authoritative outcome**.

This is a **short bridge campaign into C2**, not a polish program. Four milestones, then C2
planning. There is no PF2 without fresh Owner authorization.

**No new simulation subsystem.** `src/core` is untouched in PF1 — no new GameState field, no
SaveFileV14, no event ledger, no new RNG stream, no schema change of any kind. Everything PF1
builds lives in `ui/` and reads truth that already exists. (The one candidate that tempted us
— an authoritative event stream — is deliberately deferred; see §10.)

### What the play session showed (the gap, in one paragraph)

The lot itself is genuinely charming — C1's warmth pass reads as a real 1948 studio — but the
game is **absolutely silent** and no moment lands. Commissioning a screenplay, the draft
arriving, accepting it, committing $780,000 to construction, a week of the studio's life
passing: every one is a silent text flip. The front door is a seed form with a paste-JSON box;
the save surface is a raw JSON textarea (`ui/src/screens/Saves.tsx`); refusal errors speak
through `window.alert()`; the tab has no favicon. The simulation is a game; the presentation
is still an instrument panel.

## 2. Standing law established by this campaign

**PRESENTATION REACTS TO TRUTH. PRESENTATION NEVER CREATES OR PERSISTS GAME TRUTH.**

- Punctuation and audio fire from **authoritative receipts and state transitions the engine
  already emits** — `SimResult`/`SimStopReason` (`adapter.ts:2213-2246`), the greenlight
  formation receipt, construction completion receipts, action outcomes, the FirstFilmJourney
  stage projection — never from renderer motion, timers, or React-inferred state. The engine
  owns the fact; the UI owns the words (`facilityMutation.ts:1-16`); `stopMessage` is
  displayed verbatim and never paraphrased (`adapter.ts:2241-2243`).
- Presentation state (volumes, motion preference, audio unlock) lives **outside `GameState`**
  and never enters a save file. All NEW preferences persist under one versioned
  localStorage key, **`project-studio.prefs.v1`**, following the `session.ts` idiom
  (try/catch, corrupt-safe, storage-unavailable-safe). Explicitly NOT
  `project-studio.flags.*`, which is a QA surface and says so (`flags.ts:5-6`); the one
  pre-existing pref key (`project-studio.ui.picture-guidance-collapsed`) is grandfathered.
- The presentation layer makes **no RNG draws from the sim stream and no `Math.random()`
  calls** (the hygiene suite enforces the latter today; PF1 extends it — §7). Sensory
  variation, if any, derives from stable authoritative data.
- Punctuation is **exact-once and transient**: it fires when a receipt arrives live in the
  session, at the existing single-owner announcement gates, and never on load/hydration —
  so a reloaded save replays no stings without needing any persisted "seen" marker. One
  named exception: the session-restore/migration cue, which is *about* the load event
  itself, fires once per genuine first-load and never on remount.
- One bounded derivation is permitted and named: **journey "firsts"** come from comparing
  the FirstFilmJourney **stage projection** (`firstFilmJourney(state)` ordinals — a pure
  engine projection, not an emitted event) across an action/advance boundary, in one named
  detector module, session-scoped and non-persisted. Diffing two authoritative projections
  of engine state is engine truth, not React invention; anything beyond this single carve-out
  is out of bounds.
- Audio must not narrate skipped time (operational law 3): a multi-week batch is one stop and
  one punctuation, never per-week theater.
- **Proof obligation (the Owner's restraint test, made mechanical):** a scripted parity run —
  the same seeded action sequence with presentation enabled vs disabled/muted — must produce
  **byte-identical exported saves**. This gate is part of every milestone from M2 on.

On authorization this law is recorded in `docs/SHIFT-OPERATIONAL-LAWS.md` with PF1 provenance.

## 3. Editorial voice (established here, reused forever)

Target: **confident 20th-century Hollywood trade language — restrained humor, period flavor,
never sterile SaaS copy, never modern quipping.** The best existing copy is already close
("a studio you run one film at a time"; "This ground is held for the studio's Annex
contract."); the three one-shot witnesses — SCREENPLAY COMMISSIONED, CAMERA TESTS UNDERWAY,
PICTURE FORMED — and The Silver Screen Gazette are the register anchors.

Voice rules (binding for every string PF1 adds or touches):
1. The studio speaks as an institution, in the present tense, with pride: "The studio does
   not build on protected ground," never "Error: invalid tile."
2. Trade-paper cadence for events; headlines earn capitals, body copy does not.
3. Restraint is voice too: a routine week deserves a quiet line, not a bulletin.
4. Failure copy states the fact, the reason, and the way forward, in that order — the
   existing blocked-state grammar already does this; keep it.
5. Every sentence must be literally true of what the world offers at that state (the
   quote-grammar law, C1-M8: copy that promises what the action does not deliver is a defect
   even when behavior is honest).
6. The corpus-verified original register is the calibration: warm, wry, second-person,
   mechanic first and one earned clause of personality after ("Where your science monkeys
   research the latest advances…"; "It's hardly the prettiest though"), and pipeline states
   as declarative sentences about *your* picture ("Your script is complete and ready for
   casting in the Casting Office."). Adopt that ratio; never exceed it.

Named worst offenders to fix (evidence): raw engine jargon reaching the player through an
alert — "Publicity successor failed exact acceptance receipt validation." (`App.tsx:2571`);
"unattended simulation" (`Dashboard.tsx:262`); the flat aria-only "Week N. Studio Lot
updated." (`StudioLotScreen.tsx:7850`); the Saves screen's sterile "Export / Import /
New / restart" register.

Two copy authorities exist and the boundary is binding: pinned strings whose owning module
lives **under `ui/`** (e.g. the adapter's stop messages and completion toasts) are rewritten
only inside that owning module with provenance comments and deliberate re-pins (the C1-M8 F6
precedent) — never edited casually from elsewhere. Pinned strings whose owning module lives
**in `src/core`** (journey copy, effect summaries, locked reasons) are **out of PF1's reach
entirely**: a core-owned copy defect becomes a finding routed to the Owner, never a PF1
edit (§1). NEW presentation copy is free to be written in voice from day one. PF1 separates
these workstreams explicitly.

## 4. What the recon verified (the facts this scope stands on)

- **There is no audio anywhere.** Zero audio code, zero audio assets, zero audio docs
  (repo-wide grep; `ui/public` is lot art only). Audio is greenfield — the charter defines
  its architecture cleanly and extends nothing.
- **Phaser currently owns a silent AudioContext.** The game boots with no `audio` config key
  (`StudioLotView.ts:155-170`), so Phaser 3.90 instantiates its WebAudio sound manager
  unused. PF1 **disables it** (`audio: { noAudio: true }`) and builds one standalone
  AudioService instead — because punctuated events also fire on non-Lot screens (Dashboard,
  newspaper, founding), the Lot is lazy-loaded and flag-rollbackable, and the renderer's
  lifetime is shorter than the session's (lazy mount/unmount; fail-closed teardown on
  context loss) — scene-owned audio would die with it. One context, one unlock, one gain
  graph.
- **The punctuation inventory already exists as authoritative truth.** The 10-member
  `SimStopReason` union (`adapter.ts:2213-2223`), the orthogonal `constructionCompletion`
  channel (`:2236-2240`), `LotNextEventReceipt`/`WorldTarget` with world anchors
  (`nextEvent.ts:24-99`), the greenlight formation receipt
  (`productionFormation.ts:196-214`), build/move/demolish receipts, the 12-code placement
  rejection vocabulary, and the FirstFilmJourney milestone ladder. PF1 maps these; it invents
  no event.
- **Two ordered events do NOT exist authoritatively:** there is no "wrap" transition (no
  SimStopReason member; nothing detects shooting → post) and no achievements system (rank/
  certificate/award requirement kinds are declared not-yet-attainable, C3 scope). Punctuating
  them would require new engine derivations. **Reported, not silently filled** — see §10/§11.
- **Browser dialogs: exactly 9** — 8 **bare `alert()`** sites (`App.tsx:2580, 2600, 2691,
  2701, 2810, 3449, 3477, 3489` — bare global calls, not `window.`-qualified) and
  1 destructive `window.confirm()` (new studio, `App.tsx:1541-1542`). The hygiene gate
  must therefore scan for the **bare and qualified forms both** (§7). Three Playwright
  specs and two vitest suites currently stub/accept native dialogs and must move with them.
- **Several important moments are aria-live-only.** The Lot's hidden region block
  (`StudioLotScreen.tsx:7833-7883`) announces week advance, annex
  operational, casting review, production formation, and script review with no visible or
  audible counterpart for some of them; **25 aria-live regions across 12 files** exist
  product-wide. M2 starts with a precise audit; promoted announcements must not
  double-announce (one-owner law).
- **Reduced motion is OS-read-only today** (`StudioLotScreen.tsx:635-637, 4452-4470`;
  **seven** CSS `@media (prefers-reduced-motion)` blocks across **three** stylesheets —
  `styles.css` ×3, `lot.css` ×3, `LotAuditionWorkspace.css` ×1). A player override requires
  promoting **all seven** to a root-class form (`.lot-reduced-motion *` at `lot.css:826` is
  the precedent) — CSS media queries alone cannot honor an in-game setting, and a missed
  block silently ignores the setting on that surface.
- **One shipping player-preference key already exists** —
  `project-studio.ui.picture-guidance-collapsed` (`LotPictureGuidanceCard.tsx:8`). It is
  grandfathered as-is; the one-key law (§2) governs all NEW preferences.
- **Save architecture is finished; save presentation is not.** Strict versioned
  validate/migrate (SaveFileV13, V1→V13 accepted), single autosave key, corrupt quarantine —
  all engine-side and untouched. The UI is a raw JSON textarea, import is paste-only (no file
  picker), **no Lot control routes to Saves** (the route exists at `navigation.ts:24`;
  nothing emits it), and **quota/storage failure is silently swallowed**
  (`session.ts:40-42`) — the player is never told persistence is off. These are the cheap
  wins the Owner's "if cheap" clause covers. Multi-slot saves are NOT cheap (a new subsystem
  plus envelope metadata pressure toward V14) — excluded, §9.
- **UI scale has no seam.** ~159 absolute px font-size declarations across the two global
  stylesheets, a hard `width=1280` viewport meta (`index.html:5`), no rem discipline. Cut
  from PF1 per the Owner's own condition ("if clean" — it is not).
- **Structural render pins are load-bearing** (231 objects / 14 actors / 8,806,568 decoded
  bytes / 6 draws on the grid fixture, law 25). PF1 punctuation therefore lives in **DOM
  chrome over the canvas and existing world channels only** — no new Phaser display objects.
  Any tuple movement in PF1 is a defect, not a re-pin.
- **jsdom has no Web Audio**, and of the 138 UI vitest files ~80 mount components. The AudioContext is
  constructed lazily behind one module boundary, with a stub in `ui/src/test/setup.ts`
  (established precedent: the in-memory localStorage there). Playwright runs get forced-mute
  via env flag so e2e stays deterministic.
- **Known live defects PF1 inherits and will fix in passing** (all presentation-side): the
  silent quota swallow above; the stale absolute worktree path in `ui/m6b-art.config.ts:3`
  (points at the Marathon worktree — silently exercises the wrong tree); no favicon/meta at
  all (`index.html`, 12 lines). And one **defect found in my play session, to red-team**: on
  first load at an unusual viewport, the lot camera framed an empty region and the world
  appeared as a black void until the first guidance navigation reframed it.
- **Known seams PF1 must present honestly but NOT fix** (other campaigns' scope): the F4
  whole-board-idle commission eject, F2 unengageable effect buildings, F3 demolish-for-refund
  timing (C2, recorded at the C1 seal); the 480×270/DSF2 below-fold placement; the
  `FilmResult.releaseTick` off-by-one-week copy.

### What the original sounded like (dedicated Mechanics Bible / corpus pass)

The 2005 game's documented soundscape was **spoken, not chimed**. Corpus evidence
(manual p.8/p.38, GameFAQs corroboration, the credits page):

- **A PA announcer** narrating "problems and interesting developments" — tunable as
  **"PA Assistance," a help-density dial, not a volume**. Corpus-confirmed trigger classes:
  poachable rival talent, research availability, upcoming awards ceremony, facility in
  critical condition — *opportunity, unlock, calendar, degradation* — notably NOT routine
  pipeline transitions.
- **A lot radio with two switchable content streams** ("Radio Options — DJ, News, or
  both"): seven named DJ personalities plus three distinct newsreader roles (Current News,
  Future News, Tech News — the KMVS prediction-then-bulletin mechanic).
- **Music from four separately recorded era-idiomatic ensembles** (Prague Philharmonic
  orchestral / big band / jazz-rock / electronics-piano). The decade→ensemble mapping is
  ABSENT FROM CORPUS — our era registry adopts the four-bucket *architecture* as precedent
  and authors the mapping as an original decision, documented as such.
- **Exactly one documented UI sound** (the "pop" of picking up a Star). The Bible itself
  records that **no per-event alert sound-cue catalog was found documented** (its §27 note;
  open questions Q061/Q044). Its Options precedent: Sound Effects Volume, Music Volume,
  Radio Options, PA Assistance, Speaker Setup.
- **No newspaper/headline system existed** — the press layer was spoken bulletins, a critic
  screen, and a photographer who rushes off "to see his editor." Our Gazette is already a
  deliberate improvement, not parity; PF1's ambience bed and event stingers are likewise
  **logged as deliberate additions**, not recovered parity.

Consequences PF1 adopts: the punctuation budget skews restrained (the original earned its
warmth through voice and copy, not fanfares); the **PA/radio register is reserved as a
named future architecture slot** (voice acting is deferred by Owner ruling, and the PA's
trigger classes mostly belong to C3/C4 systems that don't exist yet) — PF1's audio service
and channel model must leave room for a speech/radio bus later without rework; and era
soundscape shifts have a ready-made diegetic anchor when C4 arrives (Synchronized Sound
1930 / Stereo 1945 / Digital 1985 are corpus-dated research unlocks).

## 5. Milestones (exactly four)

### PF1-M1 — THE STUDIO SOUNDS ALIVE (audio architecture + ambience + UI sound floor)

One audio service for the whole product, designed for reuse by every later campaign (C2 will
mint dozens of events needing sound):

- **`ui/src/audio/` module family** (new code as new modules — the two giant files grow by
  call sites only). `AudioService` facade over one lazily-created Web Audio context; channel
  graph **master / music / ambience / effects**, each with a prefs-backed volume; Phaser
  booted with `audio: { noAudio: true }`.
- **Autoplay policy handled once:** the service starts suspended and resumes on the first
  user gesture (the Start screen's "Open the studio" click is the natural gate; any first
  interaction unlocks). Cues emitted before unlock are dropped silently, never queued, never
  thrown. Silence, not a crash — and no nag.
- **`AudioSink` seam for tests:** the service consumes cue tokens through a sink interface;
  the real WebAudio sink is one implementation, a `RecordingSink` (ordered token log) is the
  test double. Components never touch an AudioContext — a hygiene test enforces it (§7).
- **World ambience:** a restrained 1948 studio bed — environment (wind, birds, distant town)
  plus sparse work texture keyed to real state (distant hammering only while construction is
  actually underway). **The calm-morning law: a quiet studio is allowed to sound quiet.**
  Ambience reads as a place, not a casino.
- **Music:** an era-keyed registry (data: `era → track list`, keyed off the existing
  `EraConfig` on GameState) with a 1948 bed now, so C4's decade march swaps music by data.
  No commercial soundtrack.
- **UI sound families** wired at existing interaction seams: select (sparing), commit,
  cancel, refusal, construction started, completion, positive outcome, warning. Families,
  not one-off files — later campaigns pick from the family, not the disk.
- **Asset policy (binding, new — nothing covers audio today):** compressed runtime audio
  (`.m4a`/`.mp3`, `.ogg` where it wins) committed under `ui/public/audio/`, loaded by
  `BASE_URL`-templated URL (the `TycoonScene.ts:483` form, never the hardcoded-slash form);
  masters live in the private `project-studio-art-source` repo (extending the §5A pipeline
  standard to audio, which currently disclaims it); every committed file listed in
  **`AUDIO-PROVENANCE.md`** with source and license — project-owned, properly licensed,
  CC0/public-domain, or generated-for-project only; per-file ≤ 1.5 MB, campaign total
  ≤ 15 MB. Temporary development audio is clearly marked replaceable.
- **Preferences store:** `ui/src/prefs.ts` (sibling of, not extension to, `flags.ts`), one
  versioned key `project-studio.prefs.v1`, corrupt-payload-safe, storage-unavailable-safe.

Gate: both tsc; full vitest including the new audio suites (double-backed, zero real
playback); audio hygiene gate; Playwright green under forced mute; a Fable 60-second spot
check (fresh studio, hands off — the place sounds like it exists).

### PF1-M2 — PUNCTUATION (important events get felt; the law gets codified)

- **A pure cue grammar** — `ui/src/presentation/eventGrammar.ts`, a total function from
  authoritative inputs (`SimResult`, action receipts, formation receipt, journey milestones)
  to cue descriptors `{id, tier, soundFamily, motion, worldAnchor}`. No React, no timers, no
  audio calls. An exhaustiveness test iterates the `SimStopReason` union so an 11th member
  fails the suite instead of producing silence.
- **Tier discipline** (the cue descriptor's `motion` field is a closed vocabulary —
  `none | emphasis | held-beat | count-up` — so the pinned tier table is checkable):
  - *Tier 1 — memorable (reserved, few; motion `held-beat` or `emphasis`):* movie release
    (sting + the existing NewspaperReveal, keyed on release source — archive clippings
    never sting); greenlight / PICTURE FORMED (the formation witness gets its held beat);
    facility completion (the completion notice arrives with sting + brief world emphasis).
    **"World emphasis" is defined narrowly:** reuse of the existing show-me/attention and
    signage-emphasis paths only — no new tween, no new display object, no new canvas-side
    effect (this is the fence against C2's reserved simulation theater).
  - *Tier 2 — minor (one small sound + motion `emphasis` or `count-up`):* commit receipts
    (build/commission/casting/package), construction started, contract/renewal warnings,
    cash-negative crossing (warning family), week advance (a quiet tick — the world
    acknowledging time), journey "firsts" (via the §2 carve-out; if the Owner prefers
    strictness, these defer to C2's event model — §11.4).
  - *Tier 3 — none (motion `none`):* bookkeeping stays bookkeeping. The restraint test is a
    seal gate, not a vibe.
- **Co-tick law:** the orthogonal `constructionCompletion` beside a primary stop reason
  punctuates exactly once, primary keeps priority (`adapter.ts:2236-2240` is the spec).
- **aria-only audit and promotion:** enumerate every aria-live-only moment (starting at
  `StudioLotScreen.tsx:7833-7883`); each promoted announcement carries the existing composed
  copy verbatim, attaches at the same one-owner gates, and REPLACES nothing accessible —
  polite-region lifetimes and keyed children stay intact; no double-announce (asserted in
  the existing contention suites).
- **Cash presentation:** the topbar cash readout counts briefly to its new value with
  emphasis on large deltas. The counter's duration is **fixed and independent of the
  batch's week count** (never week-paced — law 3: skipped weeks are not narrated),
  suppressed entirely under reduced motion, and the DOM/live-region value carries only the
  final authoritative figure. No floating world ticks (canvas scope belongs to C2's
  simulation theater). This cell is part of the M2 gate.
- **Motion discipline:** every punctuation animation gates on reduced-motion (OS signal now,
  player setting from M3). **Reduced motion + muted audio must equal today's game, exactly.**
- **Determinism:** same seed + same action script → identical cue-token sequence, asserted
  determinism-suite-style. The byte-parity proof harness lands here and runs from now on.
- The standing law (§2) is recorded in `docs/SHIFT-OPERATIONAL-LAWS.md` in this milestone —
  and while editing that file, the stale planning trailer asserting SaveFileV11 is corrected
  to V13 with a file:line citation at the named HEAD (law 28 discipline).

Gate: grammar exhaustiveness + tier table pinned; one-owner/no-double-announce proofs;
byte-parity proof green; structural tuples byte-identical (any movement is a defect); both
tsc; full vitest; focused Playwright.

### PF1-M3 — THE COMMERCIAL SHELL (settings, the browser never speaks, saves feel owned, a front door)

- **Settings** — explicitly **NOT a new `Screen` union member** (a Screen switch would
  unmount the Lot, tearing down the renderer). Settings is one modal preferences component
  hosted by whichever surface opens it: on the Lot inside the proven `LotRetainedWorkspace`
  dialog host (Lot stays mounted; `setInputSuspended` + inert-boundary laws observed, laws
  7/8/9/26), and on the Dashboard as the same component in a plain dialog. No route, no
  deep-return contract. Entries: Lot topbar + Dashboard. Contents: master/music/ambience/
  effects sliders + mute; **motion preference** (System / Reduced / Full) with the
  precedence law stated once — the setting only ever *strengthens* the OS reduced-motion
  signal, never weakens accessibility; when the OS itself requests reduced motion, "Full"
  is presented as unavailable-with-reason in the blocked-state grammar (fact, reason, way
  forward), never as a live control that does nothing — implemented by promoting **all
  seven** CSS `@media (prefers-reduced-motion)` blocks (styles.css ×3, lot.css ×3,
  LotAuditionWorkspace.css ×1) to a root-class form; UI scale is **not** included (§9).
  Prefs persist under `project-studio.prefs.v1`, never in saves; the grandfathered
  guidance-card key stays as-is.
- **The browser never speaks again:** all 9 native-dialog sites replaced — 8 bare `alert()`
  calls through the existing notice/ErrorBox idiom in place (each site gets its own
  behavioral test, no bulk substitution: several sit on refusal paths whose blocking
  semantics matter), the new-studio `window.confirm` through the dialog-host with focus
  trap. The five stubbing/accepting test files move with them. A **hygiene gate** then
  asserts zero `alert(` / `confirm(` / `prompt(` — bare or `window.`-qualified — in
  shipping `ui/src` forever (the `hygiene.test.tsx` comment-stripping walk, with a positive
  fixture proving the scanner catches a bare `alert(`).
- **Save presentation, the cheap set** (engine save layer untouched): a human save card
  (studio seed, week, cash, films released — derived from live state, no envelope change);
  raw JSON collapsed behind a "Show raw save data" disclosure (textarea stays mounted —
  a pinned test depends on it); **file-open import** to match the existing download, plus
  drag-and-drop onto the same handler; a **Lot entry to Saves** (the route exists;
  wire one control); **quota/storage failure surfaced in voice** (fixing `session.ts:40-42`:
  "The studio vault is full — clear a shelf before filing another print."), including the
  private-mode "this studio is not being saved" notice; export reframed as "Export a print".
  No slots (§9).
- **The front door:** StartScreen restyled as a title card in voice — **static composition
  only**, at most one stinger on the unlock gesture; no timed sequence, no camera move, no
  skippable intro (the cinematic-intro restraint, enforced at the M4 restraint check). Seed
  stays visible — determinism is product identity — but presented as "the world", not a
  form field. Favicon, page title, meta description; the recovered/migration banners
  restyled in voice and wired into the punctuation grammar (restore cue per the §2
  exception: genuine first-load only, never HMR remounts).
- **Config hygiene:** fix the stale worktree path in `ui/m6b-art.config.ts:3`.
- Editorial voice applied to every string this milestone touches (§3 discipline: new copy
  free; pinned copy only via owning module + provenance re-pins).

Gate: both tsc; full vitest; zero-browser-dialog hygiene gate; settings/save e2e spec on the
5179 origin (settings open/persist/reload, mute toggle, motion root-attribute, one real
punctuated event) using DOM telemetry attributes, not sound; byte-parity proof; accessibility
matrix on touched surfaces (960×540, 200% zoom, forced colors, reduced motion, 480×270/DSF2,
44px targets, visible focus).

### PF1-M4 — SEAL (playtest, red-team, KEEP/KILL)

- **Fable playtest against the Owner's four tests, verbatim:** the 60-second test (launch,
  touch nothing — does the studio sound like a place that exists?); the 30-minute test
  (successes acknowledged, refusals clear, commitment/completion satisfying, zero
  developer-tool UX); the commercial-product test (does it feel like a game?); the restraint
  test (authoritative outcomes unchanged — the mechanical parity proof plus judgment).
- **Independent red-team** (targets in §8).
- **Bounded fix wave** (OPUS-FIX, §6: sole writer, scope strictly the red-team findings the
  PM rules in-scope — anything larger reopens the relevant milestone instead), then seal:
  KEEP/KILL per milestone, gate figures regenerated at the named seal HEAD, campaign log
  closed, handoff written pointing directly into C2 planning (which owns Premiere Night V1,
  the simulation-theater law, the Time Model Ruling Docket — and now the event-model
  design, §10).

## 6. Opus dispatch plan (who builds what; the PM grades it)

Implementers do not grade themselves. Every milestone: Opus implements against this charter's
frozen scope; the PM personally reviews the important diffs, reruns the decisive gates, plays
the result, and rules KEEP/KILL before anything integrates.

| Role | Milestone | Owns (single production writer per surface) |
|---|---|---|
| OPUS-AUDIO | M1 | `ui/src/audio/**` (new), `ui/src/prefs.ts` (new), `AUDIO-PROVENANCE.md`, the `noAudio` change in `StudioLotView.ts`, asset commits — **and sole writer of `App.tsx` + `StudioLotScreen.tsx` during M1 (call sites only)** |
| OPUS-TESTS | M1/M2/M3 | Contract-first specs written from this charter, not the implementation, living in **`ui/src/test/contracts/**`** (a new path outside every implementer's glob): audio service, cue grammar, prefs resolver, all hygiene gates, settings resolver, save-card derivation |
| OPUS-GRAMMAR | M2 | `ui/src/presentation/**` (new), wiring call sites in `StudioLotScreen.tsx` + `App.tsx` (sole writer of both files during M2), aria audit/promotions |
| OPUS-SHELL | M3 | Settings component + Saves/StartScreen/banners + dialog replacements; sole writer of `App.tsx` and `StudioLotScreen.tsx` during M3 (M2 writer has finished) |
| OPUS-VOICE | M3-tail | Copy pass over PF1-touched `ui/`-owned strings only, **strictly serialized after OPUS-SHELL releases `App.tsx`/`StudioLotScreen.tsx`** (a named hand-off, never parallel); any pinned-string change lands as a named provenance re-pin reviewed by the PM; `src/core`-owned copy is out of reach (§3) |
| OPUS-REDTEAM | M4 | Independent adversarial pass at the named HEAD; no fix authority — findings only |
| OPUS-FIX | M4 | Sole writer of all PF1 surfaces during the bounded fix wave; scope strictly limited to red-team findings the PM rules in-scope |

Rules: `App.tsx` and `StudioLotScreen.tsx` are one-writer-at-a-time surfaces, serialized
across milestones (M1: OPUS-AUDIO, call sites only → M2: OPUS-GRAMMAR → M3: OPUS-SHELL →
M3-tail: OPUS-VOICE → M4: OPUS-FIX); all new behavior arrives as new modules called from
those files. **No force-push on any branch for the duration of PF1, by any role**; conflicts
resolve by merge or a new branch escalated to the Owner. Audio asset sourcing/generation is
OPUS-AUDIO's deliverable and every file lands with provenance. The PM reruns: full vitest,
both tsc, the parity proof, and the relevant Playwright slice at each KEEP/KILL; full
serialized Playwright on both origins at the M4 seal.

## 7. Test strategy (campaign-wide)

- **Regression floor inherited from the C1 seal:** root tsc 0 · ui tsc 0 · vitest ≥ 241
  files / 3,318 tests · full serialized Playwright ≥ 211 collected / 0 failed · FMJ specs
  unmodified · no test deleted or weakened · every cited gate figure names its HEAD.
- **New suites:** audio service via `RecordingSink` (token sequences, unlock policy,
  channel gains, prefs round-trip); cue grammar (exhaustiveness over `SimStopReason`,
  tier table pinned, co-tick once-only, world-anchor mapping); prefs resolver (round-trip,
  corrupt payload → defaults, future-version payload → defaults, storage-unavailable);
  motion precedence (System/Reduced/Full × OS matches true/false, via the established
  `vi.stubGlobal('matchMedia', …)` idiom); per-site dialog-replacement behavioral tests;
  save-card derivation; quota-failure surfacing.
- **Hygiene gates (new, permanent), all on the `hygiene.test.tsx` comment-stripping walk:**
  (1) zero `alert(` / `confirm(` / `prompt(` — bare or `window.`-qualified — in shipping
  `ui/src`, with a positive fixture proving the scanner catches the bare form; (2) zero
  `AudioContext` / `new Audio(` outside the sanctioned sink module; (3) **asset provenance
  and size**: every file under `ui/public/audio/**` has an `AUDIO-PROVENANCE.md` row with
  non-empty source + license, no row lists a missing file, per-file ≤ 1.5 MB and campaign
  total ≤ 15 MB; (4) no `@media (prefers-reduced-motion)` block remains without a matching
  root-class rule.
- **Determinism:** same seed + same actions → identical cue-token log; the byte-parity proof
  (presentation on vs off/muted → identical `exportSaveJson`) runs from M2 and at every gate.
- **e2e:** one focused new Playwright spec on the shipped-grid origin (5179), observing cues
  via DOM telemetry attributes (the `hollywood-performance` precedent) — never by listening;
  forced mute via env flag; no new ports/projects; structural tuples expected byte-identical
  all campaign. **"Both origins" means the two existing fixed Vite servers in
  `ui/playwright.config.ts`: 5178 (legacy plate) and 5179 (shipped grid).**
- **The muted+reduced equivalence proof (names DONE §13.4):** a Playwright DOM-snapshot
  baseline of the PF1-touched surfaces captured at the C1 seal HEAD, re-asserted at the PF1
  seal HEAD with prefs = muted + Reduced — the mechanical core of "exactly today's game",
  with PM judgment on top.
- **jsdom safety:** AudioContext stub in `ui/src/test/setup.ts` lands in the same commit as
  the first audio module.

## 8. Red-team targets (M4, independent)

- Autoplay edges: no-gesture-yet flows (keyboard-driven advance to a release), tab restore,
  mute/unmute races, context suspension on backgrounding.
- Determinism: parity proof re-run adversarially on unfamiliar seeds and long scripts; cue
  log divergence; any state write from presentation; any RNG touch.
- Announcement law: double-announce hunting across promoted aria regions, the completion
  notice, and new punctuation; stop-priority order preserved under punctuation.
- Reduced-motion + muted = today's game, proven by the §7 DOM-snapshot baseline plus
  adversarial judgment (no punctuation leaks through either axis); reduced-motion users
  still get the information visually; muted users still get it visually; SR users get it
  exactly once.
- The world-emphasis fence: no new tween/object/canvas effect anywhere in punctuation
  (§5-M2 definition); the StartScreen stays a static title card (no intro sequence).
- Prefs: corrupt/foreign payloads, quota exhaustion during prefs write, private mode,
  settings racing the OS media-query listener.
- Save shell: file-import of malformed/legacy/huge files; quota exhaustion surfacing; the
  mounted-textarea contract; New Studio confirm keyboard/focus behavior.
- Structural pins byte-identical; draw calls unmoved; no new display objects.
- Voice truthfulness: every new/edited sentence literally true at its state (the C1-M8
  standard); no engine jargon reaching the player anywhere.
- The first-load camera-void defect found in this session's play: reproduce, diagnose,
  fix or file with evidence.
- Dialog-replacement control flow: the 3 refusal paths that relied on `alert()`'s blocking
  semantics (`App.tsx:2691, 2701, 2810`) — prove no race with dispatch/autosave.

## 9. Explicit non-goals (deferred, with owners)

| Deferred item | Where it lands | Why |
|---|---|---|
| Premiere Night V1 | **C2 charter** (Owner-reserved) | Reserved by the launch order; release punctuation in PF1 is a sting + existing reveal, nothing staged in-world |
| Simulation theater (visible activity follows real work) | **C2** (Owner-reserved) | PF1 adds no world actors/motion |
| Time model (real-time/pause/speed) | **C2 Ruling Docket** (Owner-reserved) | Simulation-design decision, not presentation |
| Authoritative event stream / GameStateV14 | **C2 planning docket** (PM recommendation, §10) | Design it next to its real consumers |
| "Principal photography wraps" beat | **C2** | No authoritative wrap transition exists today (§4) |
| Achievements system; awards/rank/research punctuation | **C3/C4** | Systems don't exist; PF1 punctuates journey "firsts" instead |
| "First profitable picture" beat | **C3** | Needs a cumulative-profit derivation + honesty ruling |
| Ambient NPC simulation, crowds, vehicles-with-purpose | **C2+** | Owner hard scope |
| Voice acting / recorded announcer | **Later production-value decision** | Text register + stings suffice |
| UI scale | **Unowned; needs a sizing-token pass** | ~159 px font declarations, `width=1280` viewport — not "clean" per the Owner's condition |
| Multi-slot named saves | **Unowned; revisit on demand** | A new subsystem (slots, naming, metadata → V14 pressure) — not "cheap" per the Owner's condition; PF1 ships the cheap set (§5-M3) |
| Notification journal / event history UI | **Deferred, unowned** | Single-receipt retention today; release history already exists (clippings/Chronicle) |
| Structured refusal-code schema on `ActionOutcome` | **Deferred until a consumer needs categories** | One refusal sound family needs no taxonomy |
| Futures shelf / "anticipation pillar" | **Struck from PF1 → revisit at C3/C4 planning** | Requires `src/core/tuning.ts` catalog edits (breaches §1) and violates the no-decorative-blueprint law (§11.1) |
| Cloud saves, profiles, key rebinding, light theme, mobile/responsive | **Unowned** | Outside the minimal shell |
| Accessibility rearchitecture | **Not needed** | PF1 extends the proven matrix; it rebuilds nothing |
| Cinematic intro / final soundtrack | **Later** | Owner hard scope |
| Sets, Founding Flip, progression, Stars, economy closure | **C2/C3/C5/C6** | Roadmap law |
| Fixing F2/F3/F4, the DSF2 fold, releaseTick copy | **C2 (recorded owners)** | PF1 presents honestly; it does not fix other campaigns' seams |

## 10. Findings routed to C2 planning (PM recommendations, not rulings)

1. **The event-model docket.** The engine emits no events; the UI diffs state (verified §4).
   PF1 works fine on receipts — but C2 (shooting visibility, simulation theater, Premiere
   Night, many new transitions) is where an authoritative event/observation model earns its
   design. Recommendation: C2 planning decides ONE model (persisted ledger vs transient
   emission) with retention/determinism/replay rules, next to the Time Model docket, and
   migrates the diff detectors then. PF1 must not preempt it.
2. **Wrap.** Define shooting → post as an authoritative transition in C2 and give it its
   beat there (this charter's grammar reserves the tier slot).
3. **The seed of Premiere Night** exists in PF1 only as the release sting + NewspaperReveal
   handoff; C2 stages the rest.

## 11. Items requiring an explicit Owner ruling at authorization

0. **Two charters exist — pick one and retire the other session.** The parallel session's
   charter (r1 `de34e8c`, master plan `6087b67`; since iterated to **r2 `83d0c46`** with
   plan note `e8462e7` "ownership plan frozen" — the contrasts below were verified against
   r1, and that session is still actively pushing) and this one agree on the
   four-milestone shape, the presentation law, the voice direction, and most non-goals.
   They differ materially where this session's recon corrected facts or applied the
   launch order's conditionals:
   - *Audio ownership:* theirs rides Phaser's sound manager; this charter disables it and
     builds one standalone service (events fire on non-Lot screens; the Lot is lazy-loaded
     and rollback-able; renderer recreation would kill scene-owned audio).
   - *Save shell:* theirs commits to 6 named slots; this charter ships the cheap set and
     defers slots (the Owner's "if cheap" condition — slots are a new subsystem with
     V14 pressure).
   - *Futures shelf:* theirs bakes it in as Owner-approved; this charter routes it to
     ruling §11.1.
   - *This charter adds* the required Opus dispatch plan, the corpus-verified original
     soundscape (PA/radio/four-ensemble evidence and its restraint consequences), the
     wrap/achievements honesty finding (§11.4), the aria-only audit scope (five regions,
     not two), and the C2 event-model docket recommendation.
   Only one campaign may proceed; "one production writer per mutable surface" applies to
   PM sessions too.
1. **The futures shelf ("anticipation pillar") — recommend STRIKE from PF1; revisit at
   C3/C4 planning.** The parallel session's charter proposes ≤3 locked catalog rows
   (Laboratory / Star Trailer / North Annex land grant) and records them as Owner-approved;
   I cannot trace that approval to my launch order — and the red-team established the item
   **cannot land inside PF1's own bounds at any price**: the build catalog is engine data
   (`FACILITY_BLUEPRINTS` in `src/core/tuning.ts:748-755`), so adding rows breaches §1's
   "`src/core` is untouched"; and rows gated on systems that do not exist violate the
   committed no-decorative-blueprint product law (`tuning.ts:625-631`: "no dependency on
   any system that does not exist yet"; the C1-M4 scenery-annex precedent was STOPPED on
   exactly these merits). If the Owner nonetheless wants it in PF1, it requires an explicit
   written waiver of §1 plus a named `src/core` writer added to §6 — this charter
   recommends against, and carries it as a §9 non-goal routed to C3/C4, where the
   requirement kinds it depends on actually activate.
2. **The "living-turn" time-model preference.** The draft records model B as the Owner's
   current investigation preference. My launch order confirms the docket but not the
   preference. The master-plan amendment lists A/B/C neutrally; the Owner's preference gets
   recorded at C2 planning (or now, if the Owner wishes).
3. **Branch naming** (§0.3): keep `professional-floor-v1-fresh`, or direct a consolidation.
4. **"Wrap" and "achievements" in the launch order's punctuation list** cannot be punctuated
   authoritatively in PF1 (§4). This charter substitutes journey "firsts" (via the bounded
   §2 projection-diff carve-out) and defers wrap to C2 — confirm the substitution, or
   direct the strict alternative (journey firsts also wait for C2's event model).
5. **Ratify the main promotion.** This session fast-forwarded canonical `main`
   `24fb87b → f294077` (the Owner-accepted C1 seal; no force, nothing lost) to make the
   launch order's stated precondition true — a single-key action under a standing two-key
   custom. Ratify it, or direct the remedy; this charter recommends ratification (a revert
   would rewrite shared history for no content difference).

## 12. Owner playtest (requested at seal)

A fresh studio, hands off for the first minute, then ~30 minutes of natural play: found,
build, commission, advance to a release; open Settings, mute, unmute, reduce motion; save,
export, reimport. The four tests (§5-M4) are the script. PF1 ships only on your pass.

## 13. Definition of DONE

PF1 is DONE when, at a single named HEAD on the PF1 working branch fixed by the §11.3
ruling (default `professional-floor-v1-fresh`):

1. The four Owner tests pass in the Owner's own playtest (§12).
2. The parity proof holds: identical seeded action script, presentation on vs off/muted,
   byte-identical exported saves.
3. Zero `alert(` / `confirm(` / `prompt(` — bare or `window.`-qualified — in shipping
   `ui/src`, enforced by the permanent hygiene gate with its positive fixture; every
   replaced site has its own behavioral test.
4. A fresh studio, untouched for 60 seconds, is audibly a place — and a muted,
   reduced-motion session is exactly today's game, proven by the §7 DOM-snapshot baseline.
5. Settings exist (volumes, mute, motion preference with the strengthen-only precedence
   law), reachable from the Lot, persisted under `project-studio.prefs.v1`, and prefs never
   appear inside a save file.
6. The save surface leads with a human card, imports from a file, surfaces quota/storage
   failure in voice, and the engine save layer is untouched.
7. Every committed audio asset is listed in `AUDIO-PROVENANCE.md` with source and license,
   within the size budget — enforced by the permanent provenance/size hygiene gate (§7).
8. The cue grammar is exhaustive over `SimStopReason`, deterministic (cue-log assertion),
   and exact-once under co-tick; promoted announcements never double-announce.
9. Both tsc clean; full vitest green; full serialized Playwright green on both origins;
   structural pins byte-identical; every gate figure names its HEAD; no test deleted or
   weakened.
10. The presentation-never-persists law is recorded in `docs/SHIFT-OPERATIONAL-LAWS.md`,
    and the campaign log records KEEP/KILL per milestone with independent verification,
    sealing directly into C2 planning.
