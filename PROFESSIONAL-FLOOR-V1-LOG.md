# PROFESSIONAL FLOOR V1 — CAMPAIGN LOG

Campaign: PF1 — Audio, Feedback & Product Shell (charter: `PROFESSIONAL-FLOOR-V1-CHARTER.md`,
canonical at `1e6b422`, Owner-selected 2026-08-18 with rulings applied).
Branch: `professional-floor-v1-fresh`. Base: the C1 seal `f294077` (= canonical `main` at
campaign start; charter promoted onto `main` at `1e6b422` before implementation began).
PM/Game Director: Fable. Builders: Opus, per the frozen §6 dispatch plan.
One production writer per overlapping mutable surface throughout; `App.tsx` and
`StudioLotScreen.tsx` serialized M1→M2→M3→M3-tail; no force-push anywhere.

## Standing verification law for this log

Every gate figure below names its HEAD and was **rerun personally by the PM** after the
implementer reported it (implementers do not grade themselves). The inherited regression
floor at campaign start (both tsc clean; vitest 241 files / 3,318; FMJ golden-path
Playwright proof green) was reproduced in this worktree before M1 was dispatched.

## PF1-M1 — THE STUDIO SOUNDS ALIVE · **KEEP**

Commits: `a6e7029` (implementation + assets), `e3e4940` (contract suites), `d951dca`
(artifact hygiene).

- One standalone `AudioService` above the renderer (sink seam; `WebAudioSink` lazy and
  inert-on-failure; `RecordingSink` test double); master/music/ambience/effects buses;
  gesture unlock with drop-before-unlock; prefs under `project-studio.prefs.v1`
  (corrupt/unavailable-safe); era-keyed music registry ('1948'); Phaser's sound manager
  disabled (`noAudio: true` — the boot banner still prints "Web Audio"; verified cosmetic,
  `SoundManagerCreator.js:31` honors the flag).
- 14 generated, provenance-listed assets (975,085 B total = 6% of budget; largest 0.39 MB);
  committed generator `scripts/audio/generate_pf1_audio.py`; `AUDIO-PROVENANCE.md` gated by
  a permanent contract test. Decoded-waveform QA: zero clipped samples, ambience RMS
  −28.9 dBFS (a bed, not a casino), loop seams inaudible.
- Audio sleeps/wakes on the existing hidden-tab renderer seam; ambience work-texture keys
  off the painted snapshot (`constructionActive`); M1 wired only unlock, beds, select and
  cancel — the event families shipped as tokens for M2.
- Contract suites (written blind from the frozen interface by a separate agent): 119 tests
  including two permanent hygiene gates (no AudioContext outside the sink; asset
  provenance/size).
- **PM review findings, ruled and applied:** per-voice gain was double-applied for cues
  (channel gain × voice gain = squared volume curve) — ruled: the voice carries a trim of
  1; loudness lives once in the channel node (`a6e7029` carries the fix + re-pins).
  Accepted deviations: `qaForcedMute` reads `process.env` too (testability; browser-safe);
  `LotScene.selectFromHost` re-emission guarded (`withoutSelectCue`, mutation-proven);
  `LOT_ERA_KEY` names the presented era once.
- Gates at `e3e4940` (PM rerun): root+ui tsc clean · vitest 248 files / 3,451 passed
  | 5 env-gated skips · inherited 241/3,318 floor intact and untouched.
- PM live spot check (60-second lens): fresh founding → music + ambience streaming on
  first Lot entry, construction loop correctly absent, no console errors.

## PF1-M2 — PUNCTUATION · **KEEP**

Commits: `8d09784` (implementation), `c70b25d` (contract suites).

- Pure cue grammar (`ui/src/presentation/eventGrammar.ts`) with the frozen tier table over
  `SimStopReason` AND `AdvanceResult` (the additive `cuesForAdvanceWeek` exports were
  PM-approved into the frozen contract: a plain Advance can be the tick a picture releases
  on); co-tick dedupe is structural (identical ids); stateless dispatcher fired only at the
  existing single-owner receipt gates, after every staleness guard — a rejected claim makes
  no sound.
- Transient notice lifecycle (Owner-approved): the receipt strip expires on the next
  authoritative replacement; no journal. Two aria-only moments promoted to visible notices
  in the SAME region (week landing; facility operational) — zero double-announce; three
  regions left hidden with documented visible twins.
- Cash count-up: fixed 500 ms, week-count-independent, suppressed under reduced motion,
  authoritative figure in the DOM at every instant (aria-hidden overlay carries the motion).
- Law 29 recorded in `docs/SHIFT-OPERATIONAL-LAWS.md` (presentation reacts to truth; never
  creates or persists it) + the stale V11 trailer corrected to V13.
- Contract suites: 93 pins — SimStopReason exhaustiveness via `satisfies` (an 11th member
  breaks the compile), tier table literal, AdvanceResult laws (batch-of-3 releases = one
  cue; cross-surface id agreement, PM-accepted as contract text), cue-log determinism, and
  the **byte-parity proof**: the real engine driven twice (seed `pf1-parity-001`, 15
  receipts, 245,542-byte save) — byte-identical `exportSaveJson` and `rngState` with
  punctuation on vs audio never initialized. Anti-vacuity canaries proven then removed.
- PM rulings recorded: deep-screen generic `onChange` seams stay unpunctuated in PF1 (the
  App seam cannot name a CommitKind honestly there); `worldAnchor` deliberately absent —
  world emphasis rides existing channels only; refusal scope held to the named list.
- Gates at `c70b25d` (PM rerun): tsc clean · vitest 253 files / 3,523 | 5 · focused
  Playwright 26/26 (structural tuples byte-identical under the new layer; receipt-rail
  specs intact).
- PM live check: commit cue at the commission receipt; strip expired on the next action;
  promoted week notice visible with the composed copy; cash settled at the authoritative
  figure.

## PF1-M3 — THE COMMERCIAL SHELL · **KEEP**

Commits: `633e7a0` (implementation), `689685f` (contract suites), `9c1756e` (voice pass).

- Settings as a retained overlay over the live Lot (plain dialog on the Dashboard): four
  sliders + mute in voice; motion preference with the strengthen-only resolver
  (`data-motion` root attribute; ALL EIGHT `prefers-reduced-motion` media blocks promoted
  to root-class twins — M2 had added an eighth beyond the charter's recon count of seven).
- **The browser never speaks again:** 8 bare `alert()` sites replaced by the notice idiom
  in place; the destructive new-studio confirm is a real focus-trapped dialog; each of the
  9 has its own behavioral test; the three blocking sites proven race-free (no dispatch/
  autosave reorder). Permanent dialog-hygiene gate (bare + qualified forms, positive
  fixtures) green.
- Saves: human card (Export a print; derived from live state), raw JSON behind a disclosure
  (textarea stays mounted — pinned), file-open + drag-and-drop import, a Lot entry to
  Saves. **Owner addendum honored (verified defect):** `saveActiveSession` returns its
  status; a persistent `role="alert"` notice says the studio is NOT being written down
  while autosave fails, clears on the next success; no false "saved" claims anywhere.
- Honest continuation: routine restore says "Continuing your studio — Week N."
  (`data-recovery="continuing"`); alarm copy reserved for quarantine; migration card
  untouched. Intentional `:focus-visible` brass ring; static title-card front door;
  generated favicon + meta description; `m6b-art.config.ts` path made portable.
- Voice pass (`9c1756e`, serialized after SHELL): publicity/Standing prose rewritten in
  register with every fact preserved; the named worst offender now states fact, reason,
  way forward; `(D-11.A)` citation removed; "unattended simulation" retired on the named
  branch; week notice reads "Week N on the lot."; copy-literal re-pins with provenance
  (one strictly stronger); a supersession note added to the frozen live-week-advance
  contract doc. Core-owned copy offenders recorded as C2 findings, untouched per §3.
- Pinned-test updates were intent-preserving re-pins only, each with provenance (4 vitest
  + 6 e2e files — wider than the recon's count; all enumerated in the M3 reports).
- PM rulings: clipped-not-hidden raw save accepted; the prefs two-writer workaround
  accepted with the real fix queued for the M4 wave; `deriveSaveCard().studioName` = brand
  constant until the engine owns a studio name.
- Gates at `9c1756e` (PM rerun): tsc clean · vitest 262 files / 3,672 | 5 · the six
  edited e2e specs rerun green (12/12).
- PM live checks: settings round-trip (`data-motion`, prefs.v1, lot-reduced-motion);
  simulated quota failure → the persistence notice in voice → cleared on the next
  successful autosave; new front door; save card.

## PF1-M4 — SEAL → STOP FOR OWNER REVIEW · *(in progress)*

### Fable personal playtest (virgin context, seed studio-001) — the four Owner tests

1. **60-second test: PASS.** First legitimate Lot entry: the world paints, the 1948 music
   bed and lot ambience stream immediately, a quiet studio sounds quiet; the construction
   texture arrives only when ground is actually broken.
2. **30-minute test: PASS.** Full loop played personally: commission (commit cue + receipt
   strip) → draft → review → auditions planned (CAMERA TESTS UNDERWAY) → casting review →
   package (team direction, budget solvency, forecast) → **PICTURE FORMED with
   `sting-greenlight` at the formation witness** → the three-beat shooting loop (director
   call → scenery load-in → take scheduled), each refusing Sim with the reason and
   resolving world-natively → post → **release at Week 10 with `sting-release` at the
   receipt**, period poster + The Silver Screen Gazette. The Annex built in parallel
   (construction-started cue, site signage advancing weekly, construction ambience keyed
   to it). Successes acknowledged, refusals explained, commitment felt.
3. **Commercial-product test: PASS.** Title-card front door, favicon, settings in voice,
   honest persistence, human saves — it reads as a game, not an instrument panel.
4. **Restraint test: PASS.** Mechanically (byte-parity contracts; structural tuples
   byte-identical; zero canvas additions) and by observation.

Playtest ear-notes (fix-wave candidates, not KEEP-blockers): the founding commit fires the
`draft-accepted` CommitKind (right sound family, mislabeled kind/id); `package-step` cues
fire on each accepted package edit (potentially chatty during assembly — Owner's ear
requested at the Owner playtest).

### Independent red-team (OPUS-REDTEAM, at named HEAD `9c1756e`)

Seven adversarial vitest suites written and run (`ui/src/test/redteam/**`, 123 assertions,
all green — each defect pinned as a labelled FINDING so it flips red when fixed), plus the
authored muted+reduced e2e proof (`ui/e2e/pf1-muted-reduced.spec.ts`). The reviewer was
terminated once mid-run by an environment session limit and resumed to deliver its report;
its on-disk work was complete and the PM re-ran every suite independently (123/123).

**Verdict: 0 BLOCKER · 3 MAJOR · 7 MINOR**, with strong CLEAN results after genuine attack
on: determinism/parity (three-run adversarial proof on an unfamiliar seed with refusals,
move/demolish, publicity, both advance paths — byte-identical exports including every
intermediate save and the replayed cue log), StrictMode double-mount, dropped-not-queued,
the hidden-tab seam, co-tick/stop priority, the notice epoch and the three blocking dialog
sites, 22 hostile prefs payloads, the save shell and ConfirmDialog keyboard attacks, the
structural/world-emphasis fence (renderer diff is exactly one hunk: `noAudio`), independent
re-proof of both hygiene gates, and voice truthfulness.

**MAJOR findings (all ruled IN-SCOPE for the fix wave):**
- **M1** — a refused first audio grant (e.g. an Escape keydown the browser does not count
  as activation) latched permanent, unrecoverable silence across three layers (sink latch
  on attempt, service one-shot, App gate retiring listeners on the first event).
- **M2** — "unattended simulation", a charter-named worst offender, survived at four
  player-visible sites beyond the one branch the voice pass rewrote.
- **M3** — the promoted operational notice re-announced its identical sentence to screen
  readers on any committed action (aria-live child keyed on the punctuation serial;
  proven by MutationObserver).

**MINOR findings and PM rulings:** m1 muted sessions still fetched the ambience/music beds
(fix: no fetch while muted; beds start on unmute — this also unlocks the e2e's full
zero-audio-requests assertion) · m2 the prefs two-writer invariant lived in a call-site
workaround (fix: read-modify-write in the store; workaround deleted) · m3 `savePrefs`
failure silent (fix: returns a boolean; **no UI notice — PM ruling:** a lost preference is
non-destructive; recorded as deliberate) · m4 no size guard on save-file import (fix:
reject before reading, in voice) · m5 a comment overclaimed the storage probe (fix:
correct it) · m6 the continuation banner shows on every routine reload — **PM ruling:
KEEP.** The charter clause's intent was the false "Recovered" alarm, which is fixed; a
quiet, dismissible, honest "Continuing your studio" line on return is good product ·
m7 a control character made one contract file opaque-binary to git (fix: escape it).
Plus two playtest ear-notes folded in: the founding commit's mislabeled CommitKind
(fix: a proper 'founding' member, additive contract row) and the package-step cue
chattiness (**left for the Owner's ear at the Owner playtest**).

The authored e2e spec's second test failed at first PM execution — spec-side (it waited
on the renderer telemetry node from a UI-founded fixture; the proven structural specs use
the injected-fixture idiom) — repair assigned to the fix wave with no assertion relaxed.

### Fix wave (OPUS-FIX, sole writer, strictly the eleven ruled items)

All eleven landed; every red-team FINDING pin was flipped to assert the corrected behavior
(none deleted, none weakened):

1. **M1 fixed** — the sink latches `resumed` only when the resume promise RESOLVES; a
   `running` getter (`ctx.state === 'running'`) is the grant truth; the service retries
   unlock until running; the App gate retires its listeners only once running. A refused
   gesture now leaves every later gesture a fresh chance to ask.
2. **M2 fixed** — "unattended simulation" retired at all four remaining player-visible
   sites, in the established register, facts intact.
3. **M3 fixed** — the aria-live child keys on the sentence alone; the punctuation serial
   moved to a non-announced `data-punctuation` wrapper attribute driving the animation
   restart via a custom-property keyframe twin (low-specificity, so every reduced-motion
   `animation: none` rule still wins). MutationObserver proof: no identical-text node is
   ever re-inserted; a genuinely new sentence still announces.
4. **m1 fixed** — a muted session issues no sink work and fetches nothing; the service
   remembers the desired scene/era and starts the beds on unmute. The e2e's full
   `expect(audioRequests).toEqual([])` charter assertion is now live.
5. **m2 fixed** — the prefs store is read-modify-write on every audio write;
   `reassertMotionPref` deleted; neither writer can erase the other.
6. **m3 fixed** — `savePrefs` reports a boolean; no UI notice (deliberate, recorded).
7. **m4 fixed** — save-file import refuses files over 8 MB before reading, in voice.
8. **m5 fixed** — the storage-probe comment states exactly what it answers.
9. **m7 fixed** — the control characters escaped; the contract file is reviewable text.
10. **Ear-note fixed** — `founding` is a first-class CommitKind (commit family, tier 2);
    the founding call site relabelled; contract rows extended additively.
11. **e2e repaired** — the telemetry wait was gated on the `studio-lot-identity-proof`
    flag the spec never seeded (not the founding path); fixed with the proven seed idiom
    plus a settle-wait. No assertion relaxed.

**Accepted residuals (PM-ruled, recorded):** `playCue` gates on `unlocked` rather than
`running` — on a browser that refuses the grant a cue may fetch its asset into a suspended
context (silent, bounded; charter wording preserved) · `ui/e2e` is typechecked by neither
tsconfig (pre-existing) · "unattended simulation" survives only in one code comment and
four test titles (never player-visible) · the `.hollywood-activity` region re-keys on its
own serial (separate one-owner region, out of ruled scope — flagged to C2's presentation
backlog with the M3 pattern as the template).

OPUS-FIX gates (PM rerun follows at seal): typecheck clean; full vitest 269 files /
3,800 passed | 5 env-gated skips; zero FINDING labels remain anywhere.

**Twelfth item (seal-gate catch):** the first FULL serialized Playwright run (at
`f311f27`) failed 2 of 213 — two governed-viewport reachability contracts
(`lot.spec.ts:500` context top −80.5 at 960×540; `publicity-campaign-v1.spec.ts:296`
bottom 805.5 past a 769 ceiling at 200% zoom). Root cause: the M2-promoted notice strips
were flex children of the `min-height: 100vh` lot column — a living notice added its own
height and displaced the anchored panels (the layout footprint OPUS-GRAMMAR had flagged
at M2). Fixed at `8ea17e7`: the strips are zero-footprint overlays on the stage wrap —
same elements, aria contract, verbatim copy, lifecycle, sentence-only keys, data-driven
motion; `pointer-events: none`; stage-clipped; a both-speaking tick steps the second
strip down. Co-occurrence with the event notice and next-event rail proven impossible in
source. One intent-only pin added (3,800 → 3,801). App-level banners' own pre-existing
column footprint recorded as a flagged, untouched residual (the affected spec already
dismisses the recovery banner before its sweep).

**Thirteenth item (topbar wrap, `3fb3986` with `8ea17e7`'s strip fix preceding):** the two
governed reachability specs kept failing after the strips fix with identical numbers —
PM browser measurement proved the second displacer: the topbar (63px one-row) wraps to
119.5px at 960px because M3 added the Saves and Settings entries. OPUS-FIX compacted the
two entries to glyph+clipped-label buttons below 1120px (aria-labels, titles, 44px floors,
testids/handlers unchanged), tightened gaps/padding, took the decision-state Sim explainer
out of flow (a third displacer), and calibrated the arithmetic against the PM's browser
numbers exactly. That fixed `lot.spec`; `publicity-campaign` then failed one step DEEPER —
a step no earlier run had ever reached: at the governed 200% zoom stress, CSS zoom halves
LAYOUT width while media queries keep reading the raw viewport, so the 900–1120
"actions-never-shrink" guarantee was active at 480px of layout and 665px of unwrappable
controls became page-level horizontal overflow. PM-diagnosed with in-page width probes
(offenders enumerated to the element), PM-fixed surgically: the guarantee is now a shrink
BIAS on the brand (`flex-shrink: 4` + ellipsized subtitle), never a shrink ban on the
actions row — an ordinary shortage lands on the subtitle; a genuinely half-size layout
wraps as it always could. Both specs green (25 passed / 1 env-skip). Also caught by this
chase and recorded: `lot.spec`'s own fixture keeps the recovery banner mounted through its
sweep (pre-existing, tolerated at C1, unchanged).

### SEAL — PF1 KEEP · STOPPED FOR OWNER REVIEW

**Seal HEAD: `3fb3986`** on `professional-floor-v1-fresh` (pushed). All figures below were
regenerated by the PM at this exact HEAD:

- Root tsc: clean · UI tsc: clean.
- Full vitest workspace: **269 files / 3,802 passed / 5 env-gated skips / 0 failed**
  (inherited C1 floor of 241 files / 3,318 intact and unmodified inside it; PF1 added 484
  tests: 298 contract pins, 123 red-team pins, 63 implementation suites/intent pins).
- Full serialized Playwright, both origins (5178 plate + 5179 grid): **213 collected /
  209 passed / 4 env-gated GPU skips / 0 failed** (16.4m) — including the new
  `pf1-muted-reduced.spec.ts` proof (muted + reduced motion: zero audio requests, no
  count-up overlay, `animation: none` at every punctuated moment, structural tuples
  byte-identical, reload replays nothing).
- Byte-parity proofs green (contract + adversarial: presentation on vs off/muted →
  byte-identical exported saves and `rngState`, including every intermediate save).
- Structural render tuples byte-identical to the C1 seal all campaign (zero canvas
  additions by construction — verified in source and by the pinned specs).
- Permanent hygiene gates green: no browser dialogs (bare or qualified, positive
  fixtures); no AudioContext outside the sink; audio asset provenance/size (14 files,
  0.93 MB of the 15 MB budget, every file licensed "generated for project" with the
  committed generator); no un-promoted reduced-motion CSS block; no `Math.random`.
- `AUDIO-PROVENANCE.md`: complete, contract-gated, all assets replaceable development
  audio, generated by `scripts/audio/generate_pf1_audio.py` (committed).

**KEEP/KILL: M1 KEEP · M2 KEEP · M3 KEEP · M4 KEEP — PF1 SEALED KEEP.**

Per the Owner ruling and charter §5-M4: **PF1 ends here — STOPPED FOR OWNER REVIEW.**
C2 (Sets, Stages & Production Throughput + the Founding Flip) is the intended next
campaign and requires its own authorization. C2 planning inputs recorded for that day:
the three Owner-reserved items (Premiere Night V1, the simulation-theater law, the Time
Model Ruling Docket with Model B as the investigation hypothesis), the event-model docket
(PM recommendation), the wrap beat, the deep-screen commit punctuation seam, the
`.hollywood-activity` re-key pattern alignment, the core-owned copy offenders (engine
exception strings with internal citations reaching the notice box — the highest-value
voice finding), and the app-level banners' pre-existing column footprint.

**Owner playtest requested** (charter §12): a fresh studio, hands off for the first
minute, then ~30 minutes of natural play — found, build, commission, advance to a
release; open Settings, mute, unmute, reduce motion; save, export, reimport. The
`package-step` cue cadence during assembly is specifically submitted to the Owner's ear.

## OWNER REVIEW — PF1 ACCEPTED KEEP AT `3fb3986` · PROMOTED TO CANONICAL MAIN

The Owner played the sealed build and ruled **KEEP + PROMOTE** (2026-08-18).

### Owner playtest findings — POST-PF1 INHERITED RESIDUALS (not PF1 blockers)

Recorded here as the durable register; every one is planning input for the next
authorized campaign and none reopens PF1:

1. **Movie #2's core loop is not understandable.** The second-picture path does not
   explain itself the way the first-picture journey does.
2. **Auditions do not clearly show what information/value they provide** — the player
   cannot see what the camera tests bought them.
3. **Casting appears to allow the same performer in multiple principal roles** — verify,
   and fix in C2 if true. (PF1-M4 note: the package workspace showed "Already assigned to
   another slot on this film" on at least one path, so the legality guard exists somewhere;
   the Owner observed an apparent counterexample — treat as unverified until reproduced.)
4. **Production blockers speak engine/debug language instead of filmmaking language** —
   the register of the blocker vocabulary itself, beyond the copy PF1's voice pass
   reached (aligns with the recorded core-owned copy findings).
5. **The standing legibility law, restated by the Owner:** at every stage the player must
   understand what happened, why it matters, and what to do next.
6. **A fresh 1920 start should require real Builders** who physically construct the
   studio and affect build speed — construction as labor, not only as a countdown.
7. **Presentation remains far below the professional Movies / Zoo Tycoon / RCT / Sims
   standard.** PF1 laid the floor; it is not the ceiling.
8. **C2's acceptance bar, ruled now: C2 may not seal until the Owner can make Movie #2
   without guessing.**

These residuals bind the NEXT campaign's planning (C2 remains unauthorized and untouched
by this record). No new PF1 implementation follows from them.
