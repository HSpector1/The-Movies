# Project: Studio — Audio Accessibility 01

**Document status:** PROTOTYPE ACCESSIBILITY CONTRACT

**Conformance status:** NOT CLAIMED

**Human accessibility review:** PENDING

**Production integration:** NOT EXECUTED

## Principle

Project: Studio’s mechanics must remain understandable and operable without hearing any sound. Audio can reinforce a visual, textual, or haptic presentation, but it cannot be the only carrier of a task, warning, blocker, receipt, milestone, result, setting, or error.

Accessibility is part of the isolated Audio Lab’s functional prototype. The lab must expose controls, captions, transcript history, mono and limited-dynamic-range behavior before Owner audition. Automated checks support this work but do not establish accessibility conformance or replace disabled-player review.

## Independent category controls

The Audio Lab exposes these persistent user controls:

| Control | Mixer target | Range/behavior | Mechanics when muted |
|---|---|---|---|
| Master | `MASTER` | Mute plus continuous user gain | Unchanged |
| Score | `SCORE` | Independent gain; compatible with Full/Balanced/Sparse/Off density | Unchanged; ambience remains |
| Radio music | `RADIO_MUSIC` | Independent bed gain/mute | Unchanged; radio voice can remain on |
| Radio voice | `RADIO_VOICE` | Independent voice gain/mute | Functional truth remains in captions/transcript/visual receipts |
| PA/help | `PA_HELP` | Independent gain/mute | Help/warning text and visuals remain available |
| Ambience | `AMBIENCE` | Independent gain/mute | Lot fixture and zoom controls remain visible |
| Active SFX | `ACTIVE_SFX` | Independent gain/mute | Object/activity state remains visible/textual |
| UI | `UI` | Independent gain/mute | Focus, selection, confirmation, warning, and errors remain visually accessible |

`MILESTONE_STINGS` remains a separate routing group so it can be suppressed/deferred independently by presentation logic. No milestone depends on the sting. Its lab-facing level may inherit the UI control unless a later user-research decision warrants a separate slider; that inheritance must be visible in diagnostics, not hidden.

Controls use meaningful accessible names, report their value and mute state, operate by keyboard and controller, and do not require dragging. Default/reset behavior must be explicit. A category at zero must produce actual silence on that bus and must not be worked around by rerouting its content.

## Mix presets

Presets are starting points that change presentation only. They do not encode era, lot activity, Production state, blockers, results, or any other game truth. User-adjusted category levels remain inspectable and restorable.

| Preset | Presentation behavior | Must preserve |
|---|---|---|
| `STANDARD` | Neutral calibrated balance with score, lot, UI, and radio space | Independent user controls and captions |
| `SPEECH_FIRST` | Lowers score and radio music during speech, reduces salient ambience/active SFX, suppresses optional focus/select sounds during voice, uses controlled voice/PA priority | Speech distinction, visual receipts, transcript, no clipping from raising voice |
| `NIGHT_LIMITED_DYNAMIC_RANGE` | Reduces transient and level contrast through bounded bus compression/limiting and lower concurrency; avoids simply making everything quiet | Speech clarity, important UI distinction, ambience continuity, user Master setting |
| `MUSIC_LIGHT` | Reduces score level and favours lower-density scheduling without stopping a running cue abruptly | Current cue continuity, radio/ambience independence |
| `MUSIC_OFF` | Prevents future score starts and exits a running cue safely; score bus becomes silent | A satisfying lot bed, active SFX, UI, radio/PA preferences, all mechanics |
| `FORCE_MONO` | Folds the final mix to mono through a validated route; composable with every other preset | Gain hierarchy, semantic distinction, zoom distinction, speech intelligibility, phase safety |

Force Mono is a user-facing control or evidenced platform-equivalent release route, not merely an offline test render. It does not choose mono source derivatives based on era and does not change scheduler eligibility.

## Captions before first functional voice

Captions are enabled and available before the first functional radio or PA voice by default. The initial lab state cannot begin a functional voice while caption setup is unresolved.

Requirements:

- synchronized caption for every spoken line;
- speaker label and context such as `[over radio]` or `[over PA]`;
- at least 200% text scaling without clipping, overlap, or loss of controls;
- configurable high-contrast background color and opacity;
- readable line length and authored line breaks;
- enough display time for the resolved text;
- caption preview in settings without requiring a game event;
- no reliance on color alone to distinguish speaker or urgency;
- full keyboard/controller access to caption settings;
- honoring supported platform caption preferences where available.

Functional `captionText` and `spokenText` derive from the same resolved typed payload. A factual-token or quantity mismatch rejects both projections before playback. A pronunciation-only voice transformation must retain logged equivalence.

## Transcript history

The lab transcript records:

- resolved caption text;
- speaker identity and radio/PA context;
- decorative or functional classification;
- presentation timestamp;
- authoritative `{ownerDomain,eventId,receiptId}` for a functional item;
- interruption or omission state;
- whether voice was played, suppressed by setting, unavailable, or omitted by budget.

The transcript does not expose internal debug IDs in player-facing copy. It is navigable by keyboard/controller and screen-reader semantics, retains a bounded local history, and can be cleared without changing simulation or receipts. Radio Off does not erase prior entries or withhold new mechanically necessary visual receipts.

## Important-sound captions

Important non-speech sounds receive concise captions when they represent a typed meaningful event. Examples include `[Warning]`, `[Save completed]`, `[Stage door closes]`, or `[PA chime]` only when those words accurately reflect the same owning receipt or authorized context.

Decorative ambience is not continuously captioned. Captions must not infer a person, cause, outcome, success, or failure from a generic sound. Repeated decorative sounds should not flood caption history.

Important-sound captions have independent enablement from dialogue captions only if the UI clearly explains the distinction. The safest lab default enables both.

## Radio and PA independence

- Radio voice, radio music, and PA/help are separately adjustable.
- Radio Off schedules no elective voice or bed and loses no mechanic.
- A functional bulletin omitted because radio voice is muted remains a visible receipt and transcript entry where authorized.
- PA/help may be muted without hiding help or urgent operational text.
- Only one speech owner speaks at a time.
- Assistive-technology speech can lower or mute game speech/music according to the user’s preference.
- Replaying a transcript item does not change game truth and still uses the single speech arbiter.

## Music, speed, and silence

- Full Music, Balanced, Sparse, and Off are explicit density controls.
- Silence is valid content; no density mode forces a cue restart after a natural ending.
- Workspace entry does not force a new cue.
- 1×/2×/4× changes never alter score, radio, voice, ambience, UI, or SFX pitch/tempo/playback rate.
- A speed-control sound uses fixed pitch and a visible numeric speed value.
- Music Off leaves Wide/Medium/Close ambience coherent and all functional feedback visible.

## Acoustic zoom accessibility

Wide, Medium, and Close must differ through density, direct-to-room ratio, spectral distance, and event choice—not stereo position alone. Force Mono therefore retains useful zoom distinction. The lab always shows the selected zoom and active fixture in text.

Zoom changes presentation only. A blind player receives no false assertion that changing zoom created or removed authoritative activity. Meaningful activity is available through accessible UI state independent of ambience.

## Visual and interaction rules

- No control or diagnostic depends on a waveform, pulsing meter, flashing light, spatial location, or color alone.
- Meters and waveforms, when present, are optional diagnostics with equivalent numeric/text values.
- Focus order is logical and visible.
- Every pointer action has a keyboard and controller equivalent.
- Sliders support step controls and announced values.
- Dynamic captions do not steal focus.
- No rapid flashing is introduced by beat, peak, or speech visualization.
- Pause, focus loss, and simulated device reset expose their current state and recovery result in text.
- Missing files, hash mismatches, unsupported formats, and path refusals display exact readable reasons.

## Preset stacking and user precedence

Force Mono is composable with Standard, Speech First, Night, Music Light, or Music Off. Speech First and Night may also be combined if the lab UI reports the effective routing. Explicit user category mute and level choices win over preset automation.

Ducking may reduce a category temporarily but cannot raise a user-muted bus. Restoring from ducking returns to the user’s value, not a hidden default. Preset changes affect presentation smoothly and never restart score or speech.

## Preference persistence

Audio preferences are save-independent user preferences, not campaign truth. The proposed local profile stores:

- eight category levels/mutes;
- selected density mode;
- preset/composable mono state;
- captions and important-sound captions;
- caption scale/background/opacity;
- transcript-history preference;
- Radio mode and Reduce Repetitive Voice;
- assistive-technology speech behavior;
- controller/keyboard focus preferences relevant to the lab.

Invalid or corrupt preferences fall back to accessible documented defaults, with captions enabled before functional voice and no assumed gameplay state. No preference file contains credentials, tokens, Owner profile data, authoritative saves, or telemetry.

## Implemented lab evidence and remaining human tests

The superseded v3 render manifest mixed only three sources and self-attested several non-render properties; hostile review rejected it as accessibility evidence. It remains preserved but is not canonical.

The current external signal evidence is `07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json`, SHA-256 `0cd521819de83474cd952b2a7ad2299bc5135c72933ccd60923e438421d5f46b`. It contains six 45-second demonstrations: Standard, Speech First, Night / Limited Dynamic Range, Music Light, Music Off, and Force Mono. Eight separately rendered, hash-bound bus contributions—score, radio music, ambience, active SFX, UI, radio voice, PA/help, and milestone stings—are mixed first; limiting/compression and Force Mono are then applied to the final sum. Force Mono is recorded as a composable overlay on Standard rather than a state replacement. The Force Mono result probes as one channel; the other five probe as stereo at 48 kHz. Music Off retains six nonmusic buses.

The v4 machine render verdict covers only source hashes, isolated bus contributions, final-sum routing, duration, and channel count. Caption readiness, transcript behavior, keyboard/controller reachability, Radio Off, and no-audio-only behavior are explicitly labelled `NOT_EVIDENCED_BY_OFFLINE_RENDER` and require Unity runtime/test evidence plus human review. Accessibility acceptance remains `PENDING_RUNTIME_PROOF_AND_HUMAN_REVIEW`; intelligibility, comfort, caption usability, controller usability, mono semantic distinction, and conformance are not claimed.

### Automated and noninteractive checks

### Independent buses

- Muting each category silences only its intended bus.
- Master affects every bus without modifying stored category ratios.
- Ducking returns to exact user levels.
- Radio voice and music remain independently controllable.
- PA/help remains separate from radio voice.

### Mono

- Final output is mono under Force Mono.
- No material phase cancellation makes speech or important cues disappear.
- Wide/Medium/Close remain distinguishable by non-spatial evidence.
- Management semantic pairs remain distinguishable.

### Night and Speech First

- Peak and level-range metrics meet documented lab thresholds once those thresholds are frozen.
- Speech remains intelligible without raising Master.
- Optional SFX/UI suppression does not hide state.
- PA priority does not clip or overlap radio voice.

### Captions and transcript

- Caption state is ready before first functional playback.
- Resolved functional caption and spoken facts match.
- 200% scale, background, timing, and authored line breaks pass visual inspection.
- Interrupted, omitted, muted, and missing-file items have correct transcript states.
- No critical state exists only in audio.

### Input and lifecycle

- Every lab control works by keyboard and controller.
- Pause/focus/device-reset simulations do not duplicate important sounds or voice.
- 4× retains unchanged audio pitch and tempo.
- Preference corruption falls back safely.

Final test results are linked from the Unity validation record and Audio Oracle index to the exact build, catalogue, fixture, seed, and source hashes. Human-facing checks below remain pending even when noninteractive tests are green.

## Human review gate

Required listening and usability review includes disabled players and evaluates:

- speech intelligibility in all required output profiles;
- caption readability, timing, and cognitive load;
- usefulness of transcript history;
- mono and Night comfort;
- distinction among semantic sounds without casino affect;
- ability to use Radio Off and Music Off without losing information or world coherence;
- long-session fatigue and interruption frequency;
- keyboard/controller operability without waveform or flashing dependence.

No Owner or human accessibility acceptance has occurred. The Audio Lab remains an audition and evidence surface, not the production game.
