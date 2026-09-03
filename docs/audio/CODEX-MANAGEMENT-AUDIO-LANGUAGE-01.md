# Project: Studio — Management Audio Language 01

**Document status:** IMPLEMENTED ISOLATED LAB VOCABULARY

**Candidate status:** 45 PROCEDURAL PROTOTYPES RENDERED

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

Volume ranges below are event trims relative to the lab UI bus, not measured integrated-loudness claims. Final values require listening.

| ID | Meaning | Priority | Max concurrency | Cooldown | Repeat variation | Planned trim | Bus | Required visual/text equivalent | Optional audio | Score ducking | Prohibited casino behavior |
|---|---|---:|---:|---:|---|---|---|---|---|---|---|
| `FOCUS` | Focus moved | 10 | 1 | 70 ms | Three-item deterministic bag; no immediate repeat | −24 to −12 dB | `UI` | Visible focus state/text | Yes | No | No reward shower, pitch ladder, coin/chime cascade, jackpot accent, or unbounded repeat |
| `SELECT` | Control selected | 20 | 2 | 90 ms | Same | −24 to −12 dB | `UI` | Visible selected state/text | Yes | No | Same global prohibition |
| `OPEN` | Panel opened | 25 | 1 | 120 ms | Same | −24 to −12 dB | `UI` | Visible panel state/text | Yes | No | Same global prohibition |
| `CLOSE_BACK` | Panel closed or navigation moved back | 25 | 1 | 120 ms | Same | −24 to −12 dB | `UI` | Visible panel/navigation state | Yes | No | Same global prohibition |
| `PLACE` | Provisional placement made | 35 | 2 | 150 ms | Same | −24 to −12 dB | `UI` | Visible provisional placement state | Yes | No | Same global prohibition; no success implication |
| `COMMIT` | Explicit action committed | 55 | 1 | 350 ms | Same | −21 to −10 dB | `UI` | Visible receipt-backed commit state | No | No | Same global prohibition; no reward/fanfare |
| `CANCEL` | Operation cancelled | 40 | 1 | 250 ms | Same | −24 to −12 dB | `UI` | Visible cancellation/prior state | Yes | No | Same global prohibition; no failure implication |
| `BLOCKED_REFUSED` | Requested action was refused | 70 | 1 | 700 ms | Same | −21 to −10 dB | `UI` | Visible exact refusal reason | No | No | Same global prohibition; no punishment/alarm |
| `WARNING` | Non-urgent attention requested | 75 | 1 | 1500 ms | Same | −21 to −10 dB | `UI` | Visible warning and text | No | No | Same global prohibition; no alarm loop |
| `COMPLETION` | Bounded task completed | 50 | 1 | 1200 ms | Same | −21 to −10 dB | `UI` | Visible receipt-backed completion | Yes | No | Same global prohibition; no success magnitude |
| `SAVE` | Local save completed | 45 | 1 | 750 ms | Same | −24 to −12 dB | `UI` | Visible saved state | Yes | No | Same global prohibition; never play before receipt |
| `LOAD` | Local load completed | 45 | 1 | 750 ms | Same | −24 to −12 dB | `UI` | Visible loaded/ready state | Yes | No | Same global prohibition; no time-travel effect |
| `SPEED_UP` | Simulation presentation speed increased | 35 | 1 | 220 ms | Same | −24 to −12 dB | `UI` | Visible `1×`/`2×`/`4×` value | Yes | No | Same global prohibition; no pitch ladder |
| `SPEED_DOWN` | Simulation presentation speed decreased | 35 | 1 | 220 ms | Same | −24 to −12 dB | `UI` | Visible `1×`/`2×`/`4×` value | Yes | No | Same global prohibition; no failure scale |
| `PAUSE_RESUME` | Simulation presentation paused or resumed | 45 | 1 | 300 ms | Same | −24 to −12 dB | `UI` | Persistent pause/resume state | Yes | No | Same global prohibition; no tape stop or pitch droop |

## Candidate brief register

Each family has three rendered candidates named `ASP01-UI-{SEMANTIC}-C1`, `C2`, and `C3`: 45 unique mono, 48 kHz, PCM-24 WAVs. They use deterministic procedural synthesis with recorded seeds. They are abstract tonal/contact gestures; earlier wood, cloth, paper, switch, latch, or metal descriptions remain future commissioning direction and are not asserted as literal sources in these renders. `PAUSE_RESUME` is one shared three-candidate family, so the lab exposes 15 families rather than incorrectly counting pause and resume twice.

## Generation and synthesis route

The implemented management route is deterministic procedural synthesis. Stable Audio Small-SFX was used only for the separate living-lot detail set. The procedural implementation records:

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

All 45 candidates passed structural/signal checks. A bounded technical-restraint proxy ranks measured duration, peak/RMS headroom, and edge silence, with stable ID only as tie-break. Each family records one `provisional_pick`, one `alternate`, all ranked IDs, and all scores under disposition `MACHINE_PROVISIONAL_TECHNICAL_PROXY_PENDING_HUMAN_LISTENING`. This machine proxy cannot judge restraint in use, annoyance, meaning, aesthetic fit, accessibility, or casino-like affect.

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

The audio layer validates the semantic ID, deduplicates `receiptId`, applies user settings/cooldown/concurrency, selects from the deterministic eligible provisional variation bag, and returns `PLAYED`, `SUPPRESSED_BY_SETTING`, `SUPPRESSED_BY_COOLDOWN`, `SUPPRESSED_BY_PRIORITY`, or an exact refusal. It does not call back into gameplay to mark success.

## Accessibility and caption behavior

- UI volume is independent.
- `Music Off` and `Radio Off` do not suppress management sounds unless the UI category is also disabled.
- Force Mono must preserve semantic distinction.
- Night reduces peaks and concurrency without remapping meanings.
- Speech First suppresses optional focus/select sounds during speech and prevents management events from masking captions or voice.
- Important `BLOCKED_REFUSED`, `WARNING`, `COMMIT`, `SAVE`, `LOAD`, and `COMPLETION` events already have visible/text equivalents; optional important-sound captions may mirror them from the same receipt.
- Focus and selected state remain perceivable without sound and without flashing/waveform cues.
- Keyboard and controller activation follow the same receipt path and sound rules.

## Implemented evidence

The canonical status-language view is `/Users/bruce/Project Studio Audio Systems Pilot 01/05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json`. It supersedes and hash-binds v3, changes only 15 ambiguous “approved candidates” phrases to “eligible provisional candidates,” and leaves all audio hashes and machine-provisional selections unchanged. It contains 15 vocabulary rows, 45 hash-bound candidates, and 15 provisional/alternate selection pairs. The bounded v4 asset validation remains the audio-file proof; the complete audio register and v4 semantic view close final identity/status scope. Unity tests cover cooldown, priority, concurrency, deterministic variation, missing-file refusal, and duck requests; accessibility renders cover Mono, Night, and Speech First presentation.

Owner ratings for restraint, irritation, semantic clarity, repetition, and accessibility remain the next gate. No automated result equals Owner acceptance or production clearance.
