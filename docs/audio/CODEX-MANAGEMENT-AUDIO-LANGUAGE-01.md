# Project: Studio — Management Audio Language 01

**Document status:** PROTOTYPE DESIGN AUTHORITY

**Candidate status:** 45 CANDIDATE BRIEFS PLANNED; RENDERS REQUIRE EVIDENCE

**Selection status:** PROVISIONAL MACHINE PICKS PENDING

**Human listening status:** PENDING

## Purpose

This vocabulary gives repeated management interactions distinct, restrained meanings without turning Project: Studio into a reward machine. The sound confirms presentation events that already occurred; it does not decide whether an action is legal, successful, affordable, blocked, saved, loaded, or complete.

Every important meaning has a simultaneous visual or text equivalent. Audio may be turned off without losing mechanics.

## Global sound language

- Short, dry, modestly pitched material with controlled tails.
- Tactile studio-adjacent materials—wood, cloth, paper, switch, latch, small metal, subdued electrical tone—used abstractly rather than as false literal evidence.
- Limited spectral brightness and sub-bass; speech and active-lot transients retain priority.
- No coin cascades, slot-machine rolls, loot sparkle, jackpot chords, escalating reward ladders, crowd cheers, cash-register shorthand, alarm spam, or frequency-of-action pitch ladders.
- No semantic event changes tempo or pitch with 1×/2×/4× game-speed simulation.
- Repetition variation comes from a small deterministic bag of approved recordings/recipes, not uncontrolled random pitch shifting.
- A semantic sound plays only after the owning UI or typed operation publishes its presentation receipt.
- Failure to load an optional UI sound is visible in lab diagnostics and otherwise silent; it never substitutes a semantically different event.

## Priority and concurrency

Priority is local audio-presentation priority on a 0–100 scale, not game importance. PA/help and typed functional radio remain outside this table and outrank management UI audio.

- Maximum global management voices: 4 in Standard, 3 in Speech First, 2 in Night.
- Maximum voices from the same semantic family: the table value, normally 1.
- When the cap is reached, retain the highest-priority eligible event, then the oldest receipt. Dropped optional sounds remain represented visually.
- `BLOCKED_REFUSED` and `WARNING` may suppress lower-priority focus/select sounds in the same 250 ms window.
- `COMMIT`, `SAVE`, `LOAD`, and `COMPLETION` require distinct upstream receipts and are never inferred from a click.
- Cooldowns suppress sound only; they do not suppress visuals, captions, or operations.

## Fifteen semantic events

Volume ranges below are planned event trims relative to the calibrated UI bus, not measured loudness claims. Final values require rendered-asset measurement and listening.

| ID | Meaning | Priority | Max concurrency | Cooldown | Repeat variation | Planned trim | Bus | Required visual/text equivalent | Optional audio | Score ducking | Prohibited casino behavior |
|---|---|---:|---:|---:|---|---|---|---|---|---|---|
| `MGT-FOCUS` | Keyboard/controller focus moved to a new actionable control | 10 | 1 | 80 ms | Three-item deterministic bag; suppress on rapid traversal | −30 to −25 dB | `UI` | Visible focus ring and accessible control name | Yes | None | No pitch ladder, sparkle trail, or sound on disabled/non-actionable focus |
| `MGT-SELECT` | A control or list item became the current selection; no operation is implied | 20 | 1 | 120 ms | Three-item bag; no immediate repeat | −28 to −23 dB | `UI` | Selected state, highlight, and accessible state text | Yes | None | No coin, reward ping, or rising “correct answer” interval |
| `MGT-OPEN` | A panel, drawer, inspector, or modal opened | 25 | 1 | 250 ms | Three restrained material/tone variants | −26 to −21 dB | `UI` | Panel visibly opens; heading receives focus where appropriate | Yes | None | No treasure-chest flourish or long reveal swell |
| `MGT-CLOSE_BACK` | Current panel closes or navigation returns one level | 25 | 1 | 250 ms | Three reverse-direction gestures, independently authored | −27 to −22 dB | `UI` | Panel closes or breadcrumb/back state changes | Yes | None | No punitive downward buzzer or exact reversed `OPEN` if it creates an artificial effect |
| `MGT-PLACE` | A provisional object/slot placement gesture was accepted by the presentation surface | 35 | 1 | 300 ms | Three tactile contact variants matched by material class where known | −24 to −19 dB | `ACTIVE_SFX` | Object/ghost position changes and placement state text updates | Yes | None | No cash-register sound, scoring tick, or implication that authoritative commit succeeded |
| `MGT-COMMIT` | An owning system’s typed receipt confirms a requested management change | 55 | 1 | 500 ms | Three short two-part closures; no cumulative pitch | −22 to −17 dB | `UI` | Confirmed state and receipt-linked text/visual update | Yes | Optional 1 dB for ≤400 ms | No jackpot cadence, currency burst, applause, or escalating streak sound |
| `MGT-CANCEL` | A pending action or modal was cancelled without implying error | 40 | 1 | 300 ms | Three soft release variants | −25 to −20 dB | `UI` | Pending state clears; prior state remains visible | Yes | None | No failure buzzer, red-alert sound, or shaming gesture |
| `MGT-BLOCKED_REFUSED` | An authoritative owner refused the requested action; audio receives the refusal receipt and reason category | 75 | 1 | 750 ms | Three compact low-brightness variants; bag keyed by receipt, not spam clicks | −21 to −16 dB | `UI` | Persistent visible refusal state and exact user-facing reason | Yes; visual reason mandatory | Optional 1.5 dB for ≤500 ms | No harsh buzzer, siren, losing jingle, repeated punishment, or invented blocker cause |
| `MGT-WARNING` | A typed condition needs attention but is not necessarily a refusal or emergency | 80 | 1 | 1500 ms | Three clearly related pulses; no repetition acceleration | −20 to −15 dB | `UI` | Visible warning icon, text, severity, and dismissal/next action | Yes; visual warning mandatory | Optional 2 dB for ≤700 ms; suppressed under speech | No alarm loop, countdown tension, flashing dependency, or casino near-miss sound |
| `MGT-COMPLETION` | A typed operation reports completion; not a Production result unless that owner says so | 65 | 1 | 2000 ms | Three restrained resolved gestures | −22 to −16 dB | `UI` | Completion state, task identity, and receipt-linked text | Yes | Optional 1 dB for ≤600 ms | No fanfare, confetti sound, applause, reward shower, or success magnitude inference |
| `MGT-SAVE` | Save coordinator reports a successful save receipt | 70 | 1 | 2000 ms | Three quiet archival/tactile variants | −23 to −18 dB | `UI` | Visible saved state, timestamp or slot identity as authorized | Yes | None | No camera shutter as universal save cliché, reward chord, or playback before receipt |
| `MGT-LOAD` | Load coordinator reports a successful load receipt and UI is ready | 70 | 1 | 2000 ms | Three quiet retrieval/opening variants | −23 to −18 dB | `UI` | Loaded state/slot identity and readiness indication | Yes | None | No rewind/time-travel effect, victory sound, or playback during unresolved load |
| `MGT-SPEED_UP` | User increased simulation-speed setting | 45 | 1 | 250 ms | Three same-register articulation variants | −25 to −20 dB | `UI` | New `1×`, `2×`, or `4×` value visible and announced accessibly | Yes | None | No rising pitch ladder tied to speed level and no change to score/radio pitch or tempo |
| `MGT-SPEED_DOWN` | User decreased simulation-speed setting | 45 | 1 | 250 ms | Three same-register articulation variants distinct from speed-up | −25 to −20 dB | `UI` | New speed value visible and announced accessibly | Yes | None | No descending failure scale and no slowdown applied to music, voice, ambience, or UI assets |
| `MGT-PAUSE_RESUME` | User toggled pause or resumed from pause; paired gestures share one semantic family | 60 | 1 | 500 ms | Three paired pause/resume sets; deterministic pair identity | −23 to −18 dB | `UI` | Persistent pause state and resume control; focus lifecycle remains visible | Yes | None | No tape-stop, global pitch droop, countdown, or triumphant resume sting |

## Candidate brief register

Each family receives three candidates. These are sonic briefs and reserved IDs, not claims that files have been synthesized.

| Family | Candidate A | Candidate B | Candidate C |
|---|---|---|---|
| `MGT-FOCUS` | `MGT-FOCUS-A`: muted wood tick | `MGT-FOCUS-B`: soft electrical key closure | `MGT-FOCUS-C`: short paper-tab touch |
| `MGT-SELECT` | `MGT-SELECT-A`: paired dry switch/contact | `MGT-SELECT-B`: soft wood-and-felt tap | `MGT-SELECT-C`: low-brightness tonal click |
| `MGT-OPEN` | `MGT-OPEN-A`: cloth/wood two-part lift | `MGT-OPEN-B`: quiet latch plus air | `MGT-OPEN-C`: short neutral tonal aperture |
| `MGT-CLOSE_BACK` | `MGT-CLOSE-BACK-A`: felted closure | `MGT-CLOSE-BACK-B`: paper/wood settle | `MGT-CLOSE-BACK-C`: short neutral tonal release |
| `MGT-PLACE` | `MGT-PLACE-A`: wood placement | `MGT-PLACE-B`: case/cloth placement | `MGT-PLACE-C`: muted metal-and-felt contact |
| `MGT-COMMIT` | `MGT-COMMIT-A`: two-part switch resolution | `MGT-COMMIT-B`: wood contact plus subdued tone | `MGT-COMMIT-C`: compact electrical/mechanical closure |
| `MGT-CANCEL` | `MGT-CANCEL-A`: soft cloth release | `MGT-CANCEL-B`: single muted back-contact | `MGT-CANCEL-C`: descending-energy noise-free release without pitch fall |
| `MGT-BLOCKED_REFUSED` | `MGT-BLOCKED-A`: compact dry double contact | `MGT-BLOCKED-B`: low neutral tone plus stop | `MGT-BLOCKED-C`: muted mechanical refusal gesture |
| `MGT-WARNING` | `MGT-WARNING-A`: two separated neutral pulses | `MGT-WARNING-B`: tactile contact plus sustained low-level tone | `MGT-WARNING-C`: three-part non-accelerating alert pattern |
| `MGT-COMPLETION` | `MGT-COMPLETION-A`: restrained two-part resolution | `MGT-COMPLETION-B`: material contact plus air release | `MGT-COMPLETION-C`: compact neutral consonant interval without reward brightness |
| `MGT-SAVE` | `MGT-SAVE-A`: paper/archive closure | `MGT-SAVE-B`: subdued relay plus settle | `MGT-SAVE-C`: quiet stamp-like contact without literal institutional implication |
| `MGT-LOAD` | `MGT-LOAD-A`: latch-open plus settle | `MGT-LOAD-B`: muted relay retrieval | `MGT-LOAD-C`: paper/tab arrival gesture |
| `MGT-SPEED_UP` | `MGT-SPEED-UP-A`: articulated double tick | `MGT-SPEED-UP-B`: short forward mechanical gesture | `MGT-SPEED-UP-C`: two equal-pitch contacts with shorter spacing |
| `MGT-SPEED_DOWN` | `MGT-SPEED-DOWN-A`: articulated tick plus settle | `MGT-SPEED-DOWN-B`: short returning mechanical gesture | `MGT-SPEED-DOWN-C`: two equal-pitch contacts with longer spacing |
| `MGT-PAUSE_RESUME` | `MGT-PAUSE-RESUME-A`: felt stop/release pair | `MGT-PAUSE-RESUME-B`: switch off/on pair | `MGT-PAUSE-RESUME-C`: quiet gate close/open pair |

Planned total: **45 candidates**, three per semantic family. Candidate pairs for pause/resume are treated as one candidate set and must preserve a recognizably related language without using playback reversal or pitch/tempo manipulation.

## Generation and synthesis route

The preferred UI route is deterministic procedural synthesis or bounded eligible SFX generation. The Stable Audio Small-SFX MLX route may be used only if its official revision, model/weight hashes, terms posture, and ≤1.5 GB additional-download gate pass without payment, cloud access, credentials, new terms acceptance, or system installation.

If that gate fails, procedural synthesis remains the complete pilot route. Procedural recipes must record:

- oscillator/noise/envelope/filter parameters;
- sample rate, bit depth, channel layout, and duration;
- deterministic seed where noise is used;
- exact tool/code SHA;
- raw and derivative hashes;
- peak/loudness measurements;
- source recipe ID and rights status.

No audio binary is committed to Git.

## Provisional machine selection

For every family, machine selection must choose one `PROVISIONAL_MACHINE_PICK` and one `ALTERNATE` only after all three candidates exist and clear:

1. exact identity and hash validation;
2. format/duration/peak checks;
3. absence of unintended silence, clipping, DC, or channel defect;
4. semantic-family duration and spectral limits;
5. similarity/duplicate checks within the pack;
6. concurrency and cooldown simulation;
7. loudness hierarchy checks;
8. prohibited-pattern lints where mechanically detectable.

The remaining candidate is `ELIGIBLE_NOT_SELECTED` or receives an exact rejection. Machine ranking cannot judge restraint, annoyance, meaning, aesthetic fit, accessibility, or casino-like affect. Therefore the current selection field is `PENDING_MACHINE_JURY` until an exact evidence table is linked; this document does not invent picks.

## Event receipt and playback contract

Suggested lab-only request:

```text
ManagementAudioRequest
  eventId
  semanticEventId
  ownerDomain
  receiptId
  occurredAt
  priorityOverride?        // presentation-only, bounded
  materialClass?           // optional visual context, never inferred
  captionText?
```

The audio layer validates the semantic ID, deduplicates `receiptId`, applies user settings/cooldown/concurrency, selects from the deterministic approved variation bag, and returns `PLAYED`, `SUPPRESSED_BY_SETTING`, `SUPPRESSED_BY_COOLDOWN`, `SUPPRESSED_BY_PRIORITY`, or an exact refusal. It does not call back into gameplay to mark success.

## Accessibility and caption behavior

- UI volume is independent.
- `Music Off` and `Radio Off` do not suppress management sounds unless the UI category is also disabled.
- Force Mono must preserve semantic distinction.
- Night reduces peaks and concurrency without remapping meanings.
- Speech First suppresses optional focus/select sounds during speech and prevents management events from masking captions or voice.
- Important `BLOCKED_REFUSED`, `WARNING`, `COMMIT`, `SAVE`, `LOAD`, and `COMPLETION` events already have visible/text equivalents; optional important-sound captions may mirror them from the same receipt.
- Focus and selected state remain perceivable without sound and without flashing/waveform cues.
- Keyboard and controller activation follow the same receipt path and sound rules.

## Required evidence

Completion requires an external register with exactly 45 unique candidates, hashes and recipes; one provisional pick and alternate per family; deterministic concurrency/cooldown traces; mono/night/speech-first renders or traces; missing-file behavior; and Owner ratings for restraint, irritation, semantic clarity, repetition, and accessibility.

Until those evidence paths are linked, candidate creation and selection are planned. No automated result equals Owner acceptance or production clearance.
