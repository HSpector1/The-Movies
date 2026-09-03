# Project: Studio — Responsive Music Bundles 01

**Document status:** PROTOTYPE DESIGN AUTHORITY

**Audio status:** `PROTOTYPE_ONLY` / `PROTOTYPE_READY_FOR_OWNER_AUDITION` only

**Human listening status:** PENDING

**Production integration:** NOT EXECUTED

**Last reconciled source:** AI Music Foundry Marathon 01 at `c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf`

## Purpose

This document defines three nonadjacent responsive-score prototypes for the isolated Audio Systems Pilot. It turns existing machine-preferred marathon sources into creative anchors for bounded, context-specific generation and a deterministic runtime presentation experiment.

The expected artifact is a **horizontal full-mix variant bundle**. Each context is a separately generated full mix selected at a safe musical boundary. It is not an aligned stem set, multitrack session, source-separated mix, or promise of shared melody. No candidate may be labelled `STEM`, `PRODUCTION STEM`, `FINAL`, `OWNER APPROVED`, or commercially cleared.

The commissioning aliases below are creative catalogue labels. They are not P13 runtime era IDs and do not determine calendar, technology, legality, milestones, or game results.

## Binding source anchors

| Bundle ID | Commissioning alias | Marathon creative anchor | Marathon shortlist role | Why this anchor | Status |
|---|---|---|---|---|---|
| `RMB-EARLY-01` | `acoustic_electrical_1920_1932` | `FND-03__seed-130363` | E01 provisional PICK-01 | Strongest machine-preferred source for the requested early alias; useful reference for acoustic/electrical contrast and management-compatible forward motion | Machine preference only; human disposition `PENDING` |
| `RMB-MID-01` | `format_plurality_1975_1986` | `FPL-01__seed-130363` | E05 provisional PICK-01 | Strongest machine-preferred source for the requested middle alias; useful reference for rhythmic clarity, format plurality, and controlled density | Machine preference only; human disposition `PENDING` |
| `RMB-MODERN-01` | `streaming_plural_2015_2029` | `SPL-02__seed-155921` | E08 provisional PICK-01 | Strongest machine-preferred source for the requested modern alias; useful reference for spacious contemporary production and restrained pulse | Machine preference only; human disposition `PENDING` |

The anchors are listening and brief-writing references only. Targeted generation must not use their audio as guide input. It may describe useful non-audio qualities—density, pace, palette, register, articulation, and transition affordances—without claiming melodic continuity.

## Bundle contract

Each bundle exposes the following roles:

| Role | Intended presentation | Density target | Transition posture |
|---|---|---|---|
| `NORMAL` | Sustainable general lot management; attentive without urgency | Medium-light | Default entry target; permits long dwell and silence after exit |
| `ACTIVE` | Broadly active Production fixture; momentum without outcome commentary | Medium | Enter only after activity hysteresis; never imply success |
| `BLOCKED` | Acknowledges friction while leaving blocker truth to upstream systems | Sparse, suspended, low-celebration | Enter after blocked hysteresis; avoid alarm loops or failure fanfare |
| `WORKSPACE_LOW_DENSITY` | Deep management workspace; low information competition | Low | Usually reduce at next safe boundary; workspace entry alone must not restart music |
| `ENTRY` | Optional short introduction into a bundle | Sparse-to-target | Used only when metadata and selected cue support it |
| `EXIT` | Optional authored way out of a running cue | Target-to-sparse | May lead to silence, ambience, radio, or another bundle |

`ENTRY` and `EXIT` are presentation assets, not additional simulation states. If no compatible treatment exists, the transport uses a safe equal-power crossfade or a natural ending plus ambience. It must not fabricate an authored cadence by truncating audio.

## Targeted generation matrix

The generation ceiling is 36 initial candidates: three candidates for each of four contexts across three bundles. A context that has no viable candidate after concrete failure analysis may receive one rescue pass of at most two additional candidates. There is no automatic model change and no broad catalogue expansion.

| Bundle | `NORMAL` IDs | `ACTIVE` IDs | `BLOCKED` IDs | `WORKSPACE_LOW_DENSITY` IDs |
|---|---|---|---|---|
| `RMB-EARLY-01` | `RMB-EARLY-N-01..03` | `RMB-EARLY-A-01..03` | `RMB-EARLY-B-01..03` | `RMB-EARLY-W-01..03` |
| `RMB-MID-01` | `RMB-MID-N-01..03` | `RMB-MID-A-01..03` | `RMB-MID-B-01..03` | `RMB-MID-W-01..03` |
| `RMB-MODERN-01` | `RMB-MODERN-N-01..03` | `RMB-MODERN-A-01..03` | `RMB-MODERN-B-01..03` | `RMB-MODERN-W-01..03` |

Every executed render must receive an immutable generation record containing its exact prompt text and revision, recorded seed, pinned model/code/weight identities, run timestamp, raw path and SHA-256, duration, channel layout, sample rate, measured loudness, technical disposition, machine disposition, and human disposition `PENDING`. Reserved IDs do not establish that a render exists.

### Shared prompt law

All prompts must:

- describe instrumental prototype music without named artists, composers, songs, soundtracks, games, brands, or protected characters;
- avoid copyrighted reference audio and guide input;
- ask for a complete full-mix variant rather than isolated stems;
- avoid vocals unless a later explicitly reviewed lane authorizes them;
- leave useful headroom for radio, PA/help, UI, and active SFX;
- avoid trailer escalation, victory coding, failure stingers, casino rewards, and constant foreground hooks;
- request a stable pulse and audible phrase structure only where the model can plausibly support boundary estimation;
- record the result honestly when text generation does not retain themes, harmony, or exact bar alignment.

### Context briefs

#### `RMB-EARLY-01`

- `NORMAL`: compact acoustic ensemble with bounded early electrical color, clear midrange, modest syncopation, and a calm working cadence.
- `ACTIVE`: firmer pulse and slightly more articulated ensemble motion, without big-band bombast or a success narrative.
- `BLOCKED`: reduced movement, restrained harmony, room for mechanical ambience, and no melodramatic silent-film cliché.
- `WORKSPACE_LOW_DENSITY`: small-room acoustic detail, fewer attacks, longer rests, and minimal competition with reading or speech.

The creative alias permits an acoustic/electrical tension; it does not authorize indiscriminate shellac noise, constant wow/flutter, novelty pastiche, or claims about exact historical instrumentation.

#### `RMB-MID-01`

- `NORMAL`: dry, legible rhythm section and compact instrumental color with enough space for a management loop.
- `ACTIVE`: stronger rhythmic subdivision and controlled arrangement lift, avoiding action-montage language.
- `BLOCKED`: thinned arrangement, unresolved but non-threatening pulse, and no descending failure jingle.
- `WORKSPACE_LOW_DENSITY`: sparse electric/acoustic gestures, restrained bass activity, and limited high-frequency repetition.

Format plurality should be expressed through palette and arrangement discipline, not a medley of genre caricatures or an imitation of a known recording.

#### `RMB-MODERN-01`

- `NORMAL`: spacious hybrid production, tactile acoustic/electronic detail, and low-fatigue pulse.
- `ACTIVE`: more transient definition and layered momentum while leaving speech intelligible.
- `BLOCKED`: reduced rhythmic certainty and wider space without ominous cinematic drones.
- `WORKSPACE_LOW_DENSITY`: minimal modular/chamber gestures, long air, and deliberate silence.

Streaming plurality does not mean maximal loudness, playlist trend imitation, or a generic cinematic hybrid.

## Selection and eligibility

Selection is deterministic and evidence-bound:

1. Validate exact catalogue identity and source hash.
2. Exclude technical failures and machine-excluded candidates.
3. Group candidates by bundle and context.
4. Rank only among eligible candidates using recorded machine signals.
5. Assign at most one provisional machine pick and one alternate per context.
6. Keep human disposition `PENDING` until Owner listening.
7. If no candidate passes, report `NO_ELIGIBLE_VARIANT`; do not substitute another context or era silently.

Machine evidence may check format, clipping, silence, stereo behavior, loudness, duplication, coarse prompt relevance, and transition metadata. It cannot prove musical quality, period accuracy, cultural acceptance, fatigue tolerance, melodic relationship, non-infringement, copyrightability, exclusivity, or suitability for production.

## Required catalogue fields

Each bundle-level record contains:

- `bundleId`
- `commissioningAlias`
- `creativeAnchorCandidateId`
- `classification: HORIZONTAL_VARIANT_BUNDLE`
- `variantIdsByContext`
- `entryTreatmentIds`
- `exitTreatmentIds`
- `minimumDwellSeconds`
- `hysteresisPolicyId`
- `densityEligibility`
- `rightsStatus`
- `humanDisposition: PENDING`

Each playable asset contains:

- stable prototype ID and source candidate ID;
- family, prompt revision, seed, model/code/weight identities;
- raw and derivative SHA-256 values;
- canonical relative path under the approved external root;
- duration, sample rate, channel count, encoding, integrated loudness, peak data;
- BPM estimate plus confidence and method;
- time signature estimate plus confidence, when present;
- downbeat offset, bar length, phrase length, loop start/end, and confidence;
- safe crossfade duration and fallback permission;
- technical, machine, human, and rights dispositions;
- permitted lab contexts.

Estimated musical metadata must never be presented as authored fact. Phrase scheduling is enabled only when confidence meets the lab threshold and a deterministic validation probe confirms the resulting boundary is in range.

## Pure presentation decision model

`AudioPresentationState` is a pure deterministic projection. It consumes fixture or future upstream truth and returns presentation instructions; it does not own gameplay.

### Inputs

- `musicEligibilitySet`
- `broadLotActivity`
- `workspaceDepth`
- `speechOwnership`
- `focusLifecycle`
- `pauseLifecycle`
- user volume, accessibility, and density settings
- current cue, variant, elapsed dwell, transition queue, and recent history
- deterministic presentation seed

### Outputs

- selected bundle and variant
- requested transition and boundary mode
- target bus/source gains
- ducking state
- silence/density state and next eligible time
- refusal or fallback reason
- traceable decision code

### Explicit non-ownership

The model must not calculate or persist calendar year, public era, technology availability, Production legality, blocker legality, result truth, authoritative lot activity, game RNG, or save-state authority. Until P13/P05/P06 contracts exist, all such inputs are explicit lab fixtures marked `LAB_FIXTURE`.

## Selection, dwell, and hysteresis

- A deterministic shuffle bag operates only over currently eligible variants.
- Immediate asset and family repeats are forbidden when at least two alternatives exist.
- The recent-history window is `min(2, eligibleCount - 2)` and cannot produce the same full permutation twice in succession.
- If constraints cannot all be satisfied, relaxation order and reason are emitted in the trace; identity and rights eligibility are never relaxed.
- Minimum musical dwell target is 90 seconds plus two trustworthy phrases before elective context change.
- Default entry hysteresis targets are 30 seconds for sustained `ACTIVE` and 20 seconds for sustained `BLOCKED`.
- Default release hysteresis is 20 seconds.
- A higher-priority speech or pause lifecycle event may change gains immediately but does not force a cue restart.
- Workspace entry normally adjusts density/gain and waits for the next safe boundary; it does not force a new cue.

These durations are prototype presentation constants, not simulation rules, and remain configurable in lab-only metadata.

## Music density

| Mode | Cue eligibility | Silence behavior | Radio relationship |
|---|---|---|---|
| `FULL_MUSIC` | All eligible cue windows | Short bounded gaps remain permitted; music is not continuous by force | Voice ducks score; radio music remains separately controlled |
| `BALANCED` | Default cue windows | Deterministically varied medium gaps | Voice may occur over score or ambience |
| `SPARSE` | Reduced cue starts | Longer deterministic gaps and more natural endings | Radio voice may occur over ambience with score absent |
| `OFF` | No score starts; running score exits safely | Indefinite score silence | Ambience, active SFX, UI, radio, and PA remain independently available |

After a cue ends, the scheduler computes a seeded gap inside the mode’s configured bounds. It must not immediately restart the same cue or treat activity as a command for continuous music. Four-hour deterministic simulations are required for each mode, but their results must be linked from evidence rather than asserted in this design document.

## Transport contract

The lab transport uses paired A/B `AudioSource` instances and the Unity DSP clock.

- Schedule starts with `AudioSettings.dspTime`/scheduled playback, never frame-count stitching.
- Prefer a validated phrase boundary, then a validated bar boundary.
- If metadata confidence is inadequate, use a bounded safe equal-power crossfade.
- If an authored natural ending is available, it may lead to ambience or silence.
- Loop start/end are explicit frame positions and exclude the end frame.
- Entry/exit treatments require exact compatible metadata; otherwise they are refused.
- State changes during a queued transition are coalesced deterministically; cancellation is traceable.
- A transport may reduce to one valid asset after a missing optional candidate, but it never substitutes a different era or unknown file.
- Missing file, hash mismatch, unsupported format, duplicate ID, or path escape fails closed with an exact visible reason.
- Focus loss, pause, and simulated device reset preserve logical position/history and recover through an explicit reschedule policy.
- Simulated 1×/2×/4× speed changes do not change source pitch, sample rate, or DSP playback rate.
- Only the isolated Audio Lab scene may own its dedicated listener. No second listener is introduced into production.

## Transition behavior within a bundle

| Request | Preferred boundary | Low-confidence fallback | Refusal examples |
|---|---|---|---|
| `NORMAL → ACTIVE` | Next validated phrase after hysteresis and dwell | 3–6 second equal-power A/B crossfade | Target missing/hash-invalid; no eligible target |
| `ACTIVE → BLOCKED` | Next validated bar/phrase after blocked hysteresis | Reduce score, ambience bridge, then crossfade | Upstream blocked fixture absent; request expired |
| `BLOCKED → NORMAL` | Natural phrase release after upstream state clears | Brief ambience gap then target start | Minimum dwell not met without higher-priority reason |
| `ANY → WORKSPACE_LOW_DENSITY` | Next safe boundary without restarting if current asset can simply reduce | Gain/density reduction; later optional variant change | Workspace depth alone requests a hard restart |
| `ANY → OFF` | Natural ending or short safe fade | Immediate bounded fade for user mute | Never refused; user setting wins |
| `OFF → ANY` | Seeded future eligible window | Validated entry or fade-in | No eligible asset; remain silent with reason |

No transition claims phase alignment between independently generated variants. Even a musically pleasant crossfade remains a prototype listening judgment.

## Planned evidence

The following evidence is required before this document can report implementation success:

- generation register for all attempted candidates and any bounded rescue;
- raw/derivative hash manifest;
- technical screen and machine disposition table;
- selected provisional pick and alternate per context;
- phrase/bar confidence analysis and fallback decisions;
- deterministic transition traces, including cancellation and reset;
- four-hour traces for all four density modes;
- exported mixed demonstrations where rendering is available;
- Owner feedback export.

At publication of this design document, these Audio Systems Pilot outputs are **planned unless an exact evidence path and hash is subsequently added**. Prior marathon artifacts prove only their own recorded generation and analysis.

## Acceptance boundary

Machine-green scheduling does not equal listening acceptance. A bundle advances only after:

1. Owner listening across normal, active, blocked, workspace, silence, radio-ducking, and repeated-session contexts;
2. explicit confirmation that transitions are musically acceptable and not fatiguing;
3. rights review for the intended next use;
4. P13/P05/P06 integration contracts supplied by their owners;
5. a separately authorized production integration checkpoint.

Until then, all bundle APIs, timings, prompts, candidates, and picks remain provisional lab material.
