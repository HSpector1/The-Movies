# Project: Studio — Responsive Music Bundles 01

**Document status:** IMPLEMENTED ISOLATED LAB PROTOTYPE

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

`ENTRY` and `EXIT` are presentation assets, not additional simulation states. If no compatible treatment exists, the current transport uses its bounded two-second linear-gain paired A/B DSP crossfade or a natural ending plus ambience. Whether that crossfade sounds acceptable remains pending Owner listening. The transport must not fabricate an authored cadence by truncating audio.

## Targeted generation matrix

The generation ceiling is 36 initial candidates: three candidates for each of four contexts across three bundles. A context that has no viable candidate after concrete failure analysis may receive one rescue pass of at most two additional candidates. There is no automatic model change and no broad catalogue expansion.

| Bundle | `NORMAL` IDs | `ACTIVE` IDs | `BLOCKED` IDs | `WORKSPACE_LOW_DENSITY` IDs |
|---|---|---|---|---|
| `RMB-EARLY-01` | `ASP01-RMV-EARLY-NORMAL-C1..C3` | `ASP01-RMV-EARLY-ACTIVE-C1..C3` | `ASP01-RMV-EARLY-BLOCKED-C1..C3` | `ASP01-RMV-EARLY-WORKSPACE-C1..C3` |
| `RMB-MID-01` | `ASP01-RMV-MID-NORMAL-C1..C3` | `ASP01-RMV-MID-ACTIVE-C1..C3` | `ASP01-RMV-MID-BLOCKED-C1..C3` | `ASP01-RMV-MID-WORKSPACE-C1..C3` |
| `RMB-MODERN-01` | `ASP01-RMV-MODERN-NORMAL-C1..C3` | `ASP01-RMV-MODERN-ACTIVE-C1..C3` | `ASP01-RMV-MODERN-BLOCKED-C1..C3` | `ASP01-RMV-MODERN-WORKSPACE-C1..C3` |

All 36 initial renders were executed with seeds `271003`, `271019`, and `271043`. The generation register records the exact prompt, negative prompt, pinned model/code/weight identities, raw path and SHA-256, format, measured signal evidence, and disposition. Thirty-two passed the technical screen. Four modern candidates were excluded for trailing silence; none was selected. Every context retained an eligible candidate, so no rescue generation was used.

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
5. Assign one provisional file-fitness selection per context; contextual musical differentiation remains unproven.
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

- Runtime responsive selection first filters the currently eligible bundles against recent bundle IDs, then avoids the most recent family when an alternative remains, and makes the remaining choice deterministically from presentation seed, context, and history.
- The lab controller retains the four most recent bundle IDs and four most recent families. If those filters exhaust the eligible set, selection falls back only within that already identity- and rights-eligible set.
- The current lab exposes one selected responsive anchor for each epoch/context. That sole eligible anchor may recur only when the density scheduler opens a new entry after an authored silence gap; the decision records `ENTRY_REQUESTED_SINGLE_ANCHOR_REUSE_AFTER_AUTHORED_GAP`. It is not presented as a multi-item shuffle bag.
- Separately, the native four-hour `PlaylistSimulator` uses a deterministic shuffle bag over supplied eligible candidates. It prevents an immediate cue repeat and, when another family is available, an immediate family repeat. It does not guarantee that two complete shuffled permutations differ.
- The external Python fixed-epoch traces use their own deterministic shuffle cycles and repair only a cycle-boundary immediate cue repeat. Their three source families also make the asserted immediate family anti-repeat true; they do not prove a no-repeated-permutation rule.
- Minimum musical dwell is 45 seconds before an elective context change.
- Entry hysteresis is 8 seconds for sustained `ACTIVE` and 5 seconds for sustained `BLOCKED`.
- `NORMAL` release has no extra context timer after minimum dwell; transport still waits for the chosen safe boundary.
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

After a cue ends, the scheduler computes a seeded gap inside one shared policy: Full Music 8–20 seconds with a 1.0 start probability; Balanced 35–95 seconds with 0.82 probability; Sparse 120–300 seconds with 0.58 probability; Off never starts score. A declined Balanced/Sparse start advances to another deterministic gap. It must not immediately restart the same cue or treat activity as a command for continuous music.

The external v2 suite supplies 12 four-hour fixed-epoch traces—three epochs by four density modes—with exact cue IDs, families, gaps, source hashes, pitch/tempo scale, shuffle cycles, and any relaxation reason. All 12 pass the asserted immediate-repeat and timing checks. The suite is `02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json`, SHA-256 `05dff9a82a7c600d6e22462af0733a1699ed7f64e68d1d84725ac9551c7d1219`. It uses three current provisional era picks with distinct families in each fixed epoch. It proves a long-session era-pick shuffle policy with cycle-boundary immediate-repeat repair; complete permutations may recur. It does not prove melodic continuity among responsive variants or four-hour comfort. Unity runtime capture remains a separate evidence lane.

## Transport contract

The lab transport uses paired A/B `AudioSource` instances and the Unity DSP clock.

- Schedule starts with `AudioSettings.dspTime`/scheduled playback, never frame-count stitching.
- Prefer a validated phrase boundary, then a validated bar boundary.
- If metadata confidence is inadequate, use the implemented bounded two-second linear-gain paired A/B DSP crossfade. Its listening quality remains pending Owner review.
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
| `NORMAL → ACTIVE` | Next validated phrase after hysteresis and dwell | Two-second linear-gain paired A/B DSP crossfade | Target missing/hash-invalid; no eligible target |
| `ACTIVE → BLOCKED` | Next validated bar/phrase after blocked hysteresis | Reduce score, ambience bridge, then crossfade | Upstream blocked fixture absent; request expired |
| `BLOCKED → NORMAL` | Natural phrase release after upstream state clears | Brief ambience gap then target start | Minimum dwell not met without higher-priority reason |
| `ANY → WORKSPACE_LOW_DENSITY` | Next safe boundary without restarting if current asset can simply reduce | Gain/density reduction; later optional variant change | Workspace depth alone requests a hard restart |
| `ANY → OFF` | Natural ending or short safe fade | Immediate bounded fade for user mute | Never refused; user setting wins |
| `OFF → ANY` | Seeded future eligible window | Validated entry or fade-in | No eligible asset; remain silent with reason |

No transition claims phase alignment between independently generated variants. Even a musically pleasant crossfade remains a prototype listening judgment.

## Implemented evidence

The implementation is bound to:

- generation register: `/Users/bruce/Project Studio Audio Systems Pilot 01/02_music-bundles/responsive/responsive-generation-register.v2.json`, SHA-256 `a21a0a09f123833b8fac3795fe0cb96810a63bbb72e1e967827af415542a536e`;
- bundle catalogue: `/Users/bruce/Project Studio Audio Systems Pilot 01/02_music-bundles/responsive/responsive-bundle-catalogue.v2.json`, SHA-256 `c32d4bd5006750eea3d24eb59e6a4b3d4a32c1b982827330e72750b9bcbe1460`;
- anchor authority: `/Users/bruce/Project Studio Audio Systems Pilot 01/02_music-bundles/responsive/responsive-anchor-authority.v2.json`, SHA-256 `90ff6232dbae0e23fce6afabf8fba38b21b1e224fc6334b03a43c5b36e36d723`;
- generated-audio index: `/Users/bruce/Project Studio Audio Systems Pilot 01/10_provenance/audio-assets-index.v4.json`, SHA-256 `8a62dd08bbce692b597f6eb33974fd7c1af66e0d7d9d935832c3f7dd3d799693`;
- generated-audio validation: `/Users/bruce/Project Studio Audio Systems Pilot 01/10_provenance/audio-assets-validation.v4.json`, SHA-256 `7839cea3a427f0cbf3966740ac1ff99e538766e147e263d21005b3d62a757b47`;
- current cross-system audition register: `/Users/bruce/Project Studio Audio Systems Pilot 01/10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json`, SHA-256 `d26df18eddfb299d9332ad82402c836c6234342b51ed4fb44b5294d0a78b334e`.

Each selected context supplies a 60-second normalized full mix, 54-second derived loop, 8-second entry, 8-second exit, and AAC preview. Generated timing confidence remains low, so real cue transitions use the bounded two-second linear-gain paired A/B DSP fallback; its musical quality remains pending Owner listening. Audio Oracle’s phrase-alignment case uses a declared synthetic trustworthy-grid fixture; it is transport proof, not a claim about these generated files.

## Acceptance boundary

Machine-green scheduling does not equal listening acceptance. A bundle advances only after:

1. Owner listening across normal, active, blocked, workspace, silence, radio-ducking, and repeated-session contexts;
2. explicit confirmation that transitions are musically acceptable and not fatiguing;
3. rights review for the intended next use;
4. P13/P05/P06 integration contracts supplied by their owners;
5. a separately authorized production integration checkpoint.

Until then, all bundle APIs, timings, prompts, candidates, and picks remain provisional lab material.
