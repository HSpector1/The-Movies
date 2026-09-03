# Project: Studio — Studio Radio Runtime 01

**Document status:** IMPLEMENTED ISOLATED-LAB PROTOTYPE CONTRACT

**Source script bank:** 126 marathon prototype units

**Runtime scheduler evidence:** THREE 660-SECOND RENDERS; THREE 1,800-SECOND DETERMINISTIC TRACES

**Voice status:** GENERIC LOCAL SCRATCH PROTOTYPE ONLY

**Simulation authority:** EXPLICIT LAB FIXTURES ONLY; NONE OVER GAME TRUTH

## Purpose

Studio Radio is an optional fictional Los Angeles studio service. It adds institutional continuity, studio-life flavor, and receipt-bound bulletins while leaving all mechanics and historical truth with their authoritative owners.

The radio never changes a Production, unlocks technology, advances time, creates a milestone, resolves a blocker, changes a result, or chooses which game event matters. Radio Off loses no mechanics.

## Existing source bank and cleanup boundary

The AI Music Foundry Marathon contains 126 original prototype script units: 14 for each of nine creative commissioning aliases. The bank is source material, not final copy, final casting, or an approved runtime season.

The prior audit identified spoken meta-fiction vocabulary such as `fictional`, `imaginary`, and `make-believe`. Those words may remain in metadata, rights notes, test fixtures, or safety classifications, but they must not puncture an in-world broadcast unless the actual subject requires the word. Cleanup must preserve the invented world meaning without substituting real people, brands, institutions, or false historical claims.

All 126 units were processed by deterministic cleanup and the expanded v2 linter. The source pass reported 324 field findings: 284 spoken-meta-fiction hits and 40 placeholder-legal-language hits. The cleaned bank reports zero registered-pattern findings and zero caption-parity failures. The remaining “whenever our story allows” leak from v1 is removed. The immutable clean bank is `06_radio/script-bank/STUDIO-RADIO-SCRIPT-BANK-01-CLEAN.v2.json`, SHA-256 `d0c65741c6b72509292904d24f9e3716df823f12d13350a6d38482adb60245fb`; its location-bearing report is `RADIO-COPY-LINT.v2.json`, SHA-256 `58fbe531856a2561677609caf9d115af0fefd7bf25a3df4f92d217e3542dc2f2`.

The v2 content boundary admits 108 decorative units. All 18 technology/workflow units are `FUNCTIONAL_TEMPLATE_WITHHELD`, runtime-ineligible, and marked `REQUIRES_TYPED_P13_PAYLOAD_AND_EDITORIAL_SOURCE`. They were not silently relabelled as decorative chatter. This machine result proves only the registered patterns, exact finding locations, and byte parity; editorial, historical, cultural, localization, performance, naming/mark, and legal review remain pending.

## Content classes

### Decorative

Decorative material has no mechanical payload:

- service/station ident;
- daypart link;
- studio-life flavor;
- city and weather-neutral flavor that does not make factual world claims;
- fictional advertisement;
- entertainment chatter.

A decorative item may be dropped, expired, replaced with eligible decorative copy, or omitted without affecting game state.

### Functional

Functional material narrates an event that already exists in an authoritative domain:

- Production milestone;
- technology milestone;
- major talent move;
- award;
- studio distress;
- release result;
- urgent operational bulletin.

Lab examples use explicit `LAB_FIXTURE` payloads. A future runtime requires typed payloads from the owning system. Free-form radio code cannot synthesize a functional headline or infer one from presentation state.

### Other arbitration classes

- `URGENT_PA_HELP`: separate operational/help channel with the highest speech priority.
- `MILESTONE_STING`: non-speech receipt-linked presentation accent; never creates the milestone.
- `RADIO_MUSIC`: music bed/programme material on its own independently controlled bus.

## Typed functional payload

Every functional item preserves these fields exactly:

```text
FunctionalRadioPayload
  ownerDomain
  eventId
  receiptId
  headline
  body
  priority
  expiresAt
  captionText
  spokenText
```

Lab records also carry `source: EXPLICIT_AUDIO_LAB_FIXTURE`, fixture version, locale, created time, and deterministic test seed, but those annotations do not weaken the required identity. Three functional and three PA/help records are schema-validated in `06_radio/functional-fixtures.v2.json`; its hash is rebound after the final evidence rebuild.

Rules:

- `ownerDomain`, `eventId`, and `receiptId` form the immutable source identity.
- The same resolved payload produces the spoken and caption representations.
- Template resolution occurs once before enqueue. No uncaptured placeholder may reach voice or caption.
- The current prototype requires byte-identical `captionText` and `spokenText`; no pronunciation-markup exception is implemented.
- Exact-item history suppresses a previously played item ID, while same-owner/event candidates are coalesced to highest priority and then lexicographically newest receipt ID before eligibility. This is not a general authoritative receipt ledger.
- Missing identity, expired payload, unresolved field, any top-level/payload projection divergence, or caption/spoken divergence fails closed. The three fixture owner domains are exact evidence authorities; a future product owner-domain registry remains outside this lab.
- Functional priority orders already-authoritative receipts; it does not alter their game priority.

## Spoken-copy linter

The linter inspects spoken/caption fields separately from metadata and reports file, item ID, field, rule, and byte/line location. No autofix may change factual meaning.

| Rule | Spoken/caption trigger | Required disposition |
|---|---|---|
| `SPOKEN_META_FICTION` | `fictional`, `imaginary`, `make-believe` and normalized hyphen variants | Rewrite in-world or document why the actual subject requires it |
| `PLACEHOLDER_LEGAL_LANGUAGE` | placeholder/legal-copy forms, rights/clearance boilerplate, `not for broadcast`, and `PROTOTYPE_ONLY` variants | Remove from spoken copy; retain appropriate metadata |
| `INTERNAL_OR_DEBUG_ID` | script/lab/receipt/debug IDs and fixture-owner identifiers | Replace through resolved player-facing copy; never read internal identity aloud |
| `INTERNAL_PATH_OR_URI` | local filesystem, repository, or file-URI paths | Reject before enqueue |
| `SCHEMA_OR_UUID` | schema identifiers/versions and canonical UUIDs | Reject before enqueue |
| `DRAFT_PLACEHOLDER` | `TODO`, `TBD`, `FIXME`, `TK` | Reject item |
| `UNSUPPORTED_MECHANIC_OR_STATE` | claims that radio changes game state, funds, outcomes, objectives, or saves | Reject pending owning-domain evidence and copy review |
| `UNCAPTURED_VARIABLE` | `{name}`, `${name}`, `%s`, `{{name}}`, angle/bracket placeholder conventions | Reject before enqueue |
| `REAL_PERSON_IMPERSONATION_CUE` | imitation/impersonation, voice/style-of, soundalike, celebrity/broadcaster/protected-character directions | Reject voice direction and escalate for human review |
| `REAL_WORLD_CLAIM_CUE` | registered unverified real-world endorsement or breaking-news claim forms | Reject or move to sourced editorial review outside this prototype |

Caption/spoken byte divergence is enforced by the typed scheduler contract rather than represented as a linter regex.

Quoted test fixtures and metadata fields are allow-listed by schema, not by suppressing the rule globally. The audit output must report total files, units, rule hits, reviewed exceptions, corrected units, and unresolved blockers.

## Broadcaster ensemble

The prototype uses three recurring, explicitly fictional presenter identities across broad portions of the campaign. Names are working identifiers and require later naming/trademark review.

| Presenter ID | Working identity | Core role | Performance grammar | Avoid |
|---|---|---|---|---|
| `PRESENTER-MAE-CALDER` | Mae Calder | Service anchor across six eligible campaign grammars | Measured warmth, clear consonants, practical curiosity; moderate pace and precise nouns | Newsreader impersonation, faux-authoritative accent, melodramatic urgency |
| `PRESENTER-ARTHUR-VALE` | Arthur Vale | Studio-life and production-culture host across seven eligible grammars | Dry observational timing, steady breath groups, low sales pressure | Stand-up density, constant jokes, decade caricature, real DJ imitation |
| `PRESENTER-RINA-SHORE` | Rina Shore | Music/format host across seven programme grammars; explicitly eligible as the PA/help speaker for `E02`, `E03`, and `E07` | Direct, humane, lightly energetic delivery with deliberate room for silence | Trend slang as era shorthand, celebrity cadence, protected-character similarity |

These identities persist while syntax, pacing, diction, vocabulary, formality, energy, and breath grouping adapt to the eligible programme grammar. They are not assigned one voice per decade.

Prototype rendering used the generic local macOS voices `Kathy`, `Ralph`, and `Samantha` only. No voice cloning, guide voice, celebrity likeness, broadcaster imitation, or protected-character target was used. The canonical v2 demonstrations contain 12 clean voice units and 12 separately treated derivatives: four accepted voice playouts per programme. The failed v1 lane’s 24-plus-24 files remain preserved but are not current evidence. Each v2 unit preserves:

1. a clean voice master;
2. a separately identified period-treated derivative;
3. exact voice-route, OS build, executable hashes, FFmpeg version, and reproducible command template;
4. treatment settings and hashes;
5. a statement that system-voice redistribution has not been resolved and the renders must remain local scratch prototypes.

The v2 builder never accepts an existing voice, programme master, or preview merely because a file or old sidecar exists. Build mode atomically rerenders every voice stage and every programme/preview from an exact recipe binding the presenter, local voice, speaking rate, clean and period filters, tool environment, source hashes, scheduler schedule, filter graph, and commands. The read-only verifier independently reruns the scheduler and fresh-renders all 12 voice pairs and all three programme/preview pairs into temporary paths, then byte/hash/probe-compares them with the frozen outputs. Presenter, rate, filter, schedule-time, duplicate-JSON-key, and replaced-output mutations fail closed.

Treatment may add bounded mono presentation, bandwidth shaping, compression, mild saturation, and room/speaker color. Static, hiss, crackle, noise, or distortion cannot be the primary historical signal.

## Scheduler input

The deterministic scheduler consumes:

- a caller-prefiltered set for the explicit lab programme (a future P13 mapping remains outside the scheduler);
- daypart fixture;
- eligible presenter and content IDs;
- typed functional and PA receipts;
- item class, priority, receipt identity, expiry, and category;
- cooldown and repeat history;
- current speech owner;
- Radio Enabled and Streamer Safe flags;
- a presentation seed retained in evidence metadata (the TypeScript selector does not use it as a shuffle source).

It does not consume raw mutable game objects or calculate calendar/era truth.

## Scheduler output

For every TypeScript decision it emits:

- selected or refused item ID;
- content class and category;
- source payload identity where functional;
- the scheduler-eligibility presenter and separately resolved speaker identity/role in each item;
- voice, radio-music, and score gains;
- interruption/coalescing action;
- the selected item's resolved caption/spoken core for the evidence layer to record;
- the supplied history/budget state; the caller records accepted playouts;
- expiry/refusal/suppression reason;
- a stable reason and candidate-evaluation list. No decision digest is implemented.

## Eligibility and deterministic selection

1. Coalesce keyed candidates by highest priority, then lexicographically newest receipt ID.
2. Reject a typed `FUNCTIONAL` or `PA_HELP` item unless its complete payload is valid and its duplicated owner/event/receipt/headline/body/priority/expiry/caption/spoken projection is exact; reject functional fields on `DECORATIVE` and `MILESTONE_STING`.
3. Apply Radio mode, daypart, programme-presenter eligibility, expiry, exact-item and category cooldown, Streamer Safe, start spacing, rolling budgets, and the one active speech owner.
4. Sort eligible items by speech class, priority, lexicographically newest receipt ID, then stable item ID.
5. Return the first item or an exact suppression/refusal and silence.

This TypeScript scheduler is deterministic because all ordering keys and inputs are explicit. It has no seeded shuffle, presenter-repeat history, persisted queue, expiry-as-a-sort-key, or created-time tie-break. The current evidence caller appends accepted events to presentation-only history. Unity has its own lab scheduler and trace; neither implementation is represented here as a final production contract.

Radio selection does not consume game RNG and does not persist to authoritative save truth. Persistence of radio history/preferences is a future integration requirement, not an implemented claim of this lab scheduler.

## Speech budget and cooldowns

One global automatic-speech budget covers PA, functional bulletins, hosts, advertisements, and idents:

- no simultaneous voices;
- at least 60 seconds between automatic voice starts;
- no more than three automatic starts in any rolling ten minutes;
- no more than 120 voiced seconds in any rolling ten minutes;
- elective radio in `FULL` is capped at two starts and 75 voiced seconds in that window;
- `Radio Off` suppresses decorative and functional radio items in this lab decision, while PA/help and milestone presentation retain their separate arbitration; it does not change mechanics.

Exact-repeat floors:

- host item: 120 minutes;
- advertisement: 90 minutes;
- ident: 60 minutes;
- each current decorative category: 15 minutes.

These floors are authored on the current fixture items. No presenter anti-repeat or category-normalization guarantee is implemented or claimed.

## Interruption and arbitration law

Speech priority is:

1. `URGENT_PA_HELP` / `operational_pa`
2. typed `FUNCTIONAL_BULLETIN` / `receipt_bulletin`
3. decorative host link
4. fictional advertisement
5. service ident

Rules:

- There is one speech owner; voices never overlap.
- The TypeScript selector gives PA/help the highest class; in the demonstrated active-radio case it records `PA_PREEMPTS_RADIO` and the interrupted item ID. It does not own a persisted queue.
- The current offline render hard-trims the interruptible source at exactly 20.0 seconds when PA begins. The Unity lab stops the current radio source immediately for urgent PA. Neither path proves a fade, sentence/word-boundary edit, or pleasant interruption; the whole-item caption is explicitly marked interrupted and listening acceptance remains pending.
- A PA may immediately interrupt/duck radio music or an unstarted radio programme without violating the single-voice law.
- Functional items may interrupt elective radio-music beds but should not interrupt a voice merely to create drama.
- Milestone stings are non-voice and deferred while the active speech owner is busy; they never replace a visual receipt. A future Stings Enabled input remains an integration requirement.
- Save/Load queue restoration and setting-change fades are future production requirements, not mechanically proved here.

## Ducking and buses

| Owner | `RADIO_VOICE` | `RADIO_MUSIC` | `SCORE` | `AMBIENCE` | `UI` / `ACTIVE_SFX` |
|---|---:|---:|---:|---:|---:|
| Radio voice | 0 dB reference | Duck to intelligible bed | Moderate preset-dependent duck | Light preset-dependent duck | Preserve important events; suppress optional chatter |
| Functional bulletin | 0 dB reference | Stronger duck | Stronger duck | Light duck | Important receipt cues remain visible/textual |
| Urgent PA/help | Separate `PA_HELP` reference | Strong duck or mute | Strong duck or mute | Moderate duck | Suppress optional UI; retain typed warnings visually |
| No speech | Silent | User/programme level | User/density level | User level | User level |

Exact gain, attack, hold, and release values belong to lab mix metadata and must be evidenced. No snapshot encodes gameplay truth.

## Streamer Safe and disabled radio

- `Streamer Safe` admits only content with positive streaming/VOD authorization.
- The current selector suppresses a Streamer-Safe-ineligible candidate before selection. Already-playing-bed replacement/fade behavior is a future runtime requirement.
- A missing safe substitute produces silence with a visible diagnostic, never an uncleared fallback.
- `Radio Off` suppresses radio selection without changing mechanics; queue cancellation and a safe fade of already-playing material are not proved by this scheduler.
- PA/help remains a separate setting and bus.
- Radio choices never change mechanics or the source payload.

## Captions and transcript

- Captions are enabled and available before the first functional voice by default.
- Every line carries speaker label and `[over radio]` or `[over PA]` context.
- Caption text uses authored line breaks, scalable text to at least 200%, configurable high-contrast background color/opacity, readable line length, and sufficient display time.
- The transcript stores resolved text, presenter/context, source type, timestamp, and receipt identity for functional items.
- Functional caption and voice are emitted from the same resolved payload.
- Partial interruption records the whole-item caption that was shown, the incoming PA, and interruption time; it never fabricates a completed bulletin. Word-timed segment accounting is deferred and explicitly not claimed by this pilot.
- Player-invoked transcript replay is a future requirement; it is not an implemented quota bypass in this scheduler.
- No warning, blocker, milestone, task, or result exists only in voice.

## Three runtime-paced demo programmes

Each current programme is exactly 660 seconds and carries a rendered 48 kHz, 24-bit stereo WAV, AAC audition preview, scheduler decision trace, schedule, labelled WebVTT captions, transcript with delivery status, and metadata. They are machine-produced fixture demonstrations, not broadcast masters or listening acceptance.

| Programme ID | Eligible creative grammar | Required programme contents | Key proof |
|---|---|---|---|
| `EARLY-NETWORK-GOLDEN-STUDIO-V2` | `network_sound_1933_1945`; Mae Calder | Music and silence; combined station/host/ad/decorative opening; typed `P13_AUDIO_LAB_FIXTURE` bulletin; later active radio link interrupted by PA; captions/transcript | `06_radio/demos-v2/EARLY-NETWORK-GOLDEN-STUDIO-V2/` |
| `POSTWAR-PERSONALITY-TAPE-HIFI-V2` | `tape_hifi_1946_1959`; Arthur Vale | Correct postwar anchor; same required elements; typed `P05_AUDIO_LAB_FIXTURE`; PA over an active radio-music presentation | `06_radio/demos-v2/POSTWAR-PERSONALITY-TAPE-HIFI-V2/` |
| `DIGITAL-NETWORKED-HYBRID-V2` | `networked_hybrid_2000_2014`; Rina Shore | Same required elements; typed `P06_AUDIO_LAB_FIXTURE`; separately identified radio bed, voice, PA, and silence | `06_radio/demos-v2/DIGITAL-NETWORKED-HYBRID-V2/` |

Each v2 example uses accepted playouts at 10, 275, 330, 590, and 610 seconds. The 330-second event is a non-voice milestone sting. The 610-second PA is the sole start-spacing exception: it interrupts the still-active 590-second radio voice. Because the ten-minute window is half-open, the 10-second opening has aged out at 610; the PA is still only the third voiced start in that rolling window. Every programme remains below three voiced starts, 120 voiced seconds, two elective starts, and 75 elective seconds per rolling ten minutes. The PA occurs inside the 585–650-second music window and therefore exercises actual bed ducking.

Each demo includes cue sheet, source/payload IDs, DSP times, voice starts, silence windows, gains, captions, transcript, interruption decisions, cooldown state, and render hash where a mix is produced.

## Thirty-minute simulations

One deterministic 30-minute schedule exists per anchor programme:

- `RADIO-SIM-30-EARLY-01`
- `RADIO-SIM-30-POSTWAR-01`
- `RADIO-SIM-30-DIGITAL-01`

Each trace contains six accepted events at 30, 330, 630, 930, 1230, and 1530 seconds plus decision-only suppression probes. Each reports full text, presenter, speech owner, gains, typed payload identity where applicable, and candidate evaluations. The traces prove chronological ordering, exact-ID non-repeat, category cooldowns, rolling budgets, a functional fixture, PA, milestone sting, receipt coalescing, repeat suppression, and no mechanical mutation. They do not establish listening comfort.

Canonical scheduler evidence is `06_radio/scheduler-evidence/RADIO-SCHEDULER-EVIDENCE.v2.json`, SHA-256 `b404ffbda0e0db347c8f6bd6ad133739cb45b557832cd8ddad747c04ea8d6ffa`. It is emitted by the TypeScript `scheduleRadio` implementation rather than by hard-coded render metadata. Two consecutive rebuilds were byte-identical. The current runtime index is SHA-256 `600482fcfc3994a739fe3ad70470113c4534dc14366f26d63cd93a2974fa2719`.

## Failure behavior

| Failure | Result |
|---|---|
| Missing/malformed functional payload | Reject voice; preserve upstream visual truth; exact diagnostic |
| Caption/spoken divergence | Reject both audio and caption projection; retain source receipt visibility |
| Voice file missing/hash mismatch | No silent substitution; transcript/visual receipt remains; exact diagnostic |
| Budget exhausted | Omit voice; visual receipt carries truth |
| Radio disabled | No elective bed/voice; functional mechanics unchanged |
| No eligible presenter/item | Silence; no cross-era or unsafe substitution |
| Expired item | Drop and record expiry; never voice stale news |
| Duplicate receipt/item | Deduplicate and trace |
| Device reset/pause | Preserve queue/history logically; do not replay completed voice |
| Streamer-safe source unavailable | Fade to silence and report reason |

## Evidence status and human gate

The isolated prototype now provides:

- a script-linter report covering all 126 spoken/caption units;
- the exact corrected-bank hash and zero unresolved registered-pattern findings;
- three typed functional lab fixtures with caption/spoken equivalence;
- deterministic scheduler unit tests and three 30-minute traces;
- three 660-second runtime-paced programme schedules and renders;
- 12 clean and 12 period-treated current scratch-voice units with provenance; the failed v1 lane remains preserved and noncurrent;
- rendered ducking and PA demonstrations plus captions and transcript artifacts;
- separate Audio Lab controls for Radio Off, Streamer Safe presentation, mono, Night, and Speech First.

The v5 runtime register exposes all 24 current clean/period-treated voice units as exact item-level WAV entries: 18 `RADIO_VOICE` entries and six `PA_VOICE` entries. It also exposes the one independent `MILESTONE_STING` WAV. Each voice entry binds an exact programme/role path, schedule item, eligible presenter, delivered speaker, speech owner, caption context, delivery result, typed payload identity/expiry where applicable, treatment, bus, spoken-text SHA-256, source-metadata SHA-256, format, duration, path, and audio SHA-256. The sting has a fixed source hash and one important-sound caption shared verbatim by all three hash-bound caption tracks. Together with the prior 122 entries, the register contains 147 items. Unity reconstructs only the four voiced roles that these files actually support—one composite opening, functional bulletin, interruptible link, and PA per programme—and never aliases them to the older unmatched placeholder IDs or pretends that the composite opening is four separable recordings.

Caption/transcript state is created before an audio attempt. A voice becomes `AudibleScheduled` only after exact file validation, decode, bus acquisition, and successful DSP scheduling; otherwise it remains explicitly caption/transcript-only with the refusal reason and no duck. The speaker is distinct from presenter eligibility, so the shared Rina Shore PA performance is identified honestly in the early and postwar fixtures. Natural completion, suppression, and PA interruption update the same bounded transcript entry instead of treating caption time as proof of audible start.

The three 660-second renders remain baked full mixes. Their hash-bound WAV identities are retained for feedback and their M4A previews, WebVTT, transcript, and schedule remain available in the offline audition desk. Unity marks those masters `OFFLINE_AUDITION_ONLY` and refuses audible playback because timed captions and independent Radio Music/Radio Voice/PA control cannot be provided for the baked content. There is no fallback from an item-level failure to a baked master.

One limitation remains explicit: each interruptible item has exact whole-source caption text, while the demonstration PA cuts its source before the natural end. The transcript records `Interrupted`, incoming PA identity, and interruption time, but this pilot does not provide word-timed/truncated caption segments and therefore does not claim delivered-word parity after the cut.

The canonical evidence entry point is `06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json` in `/Users/bruce/Project Studio Audio Systems Pilot 01`, SHA-256 `600482fcfc3994a739fe3ad70470113c4534dc14366f26d63cd93a2974fa2719`. The index reports a limited machine `PASS`; it is not a credibility, casting, fatigue, historical, cultural, rights, or accessibility verdict. Owner ratings remain required for copy credibility, presenter performance, repetition, ducking, fatigue, and accessibility.

No automated result can approve casting, historical treatment, comedy density, cultural credibility, or production use.
