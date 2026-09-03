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

Lab records also carry `source: EXPLICIT_AUDIO_LAB_FIXTURE`, fixture version, locale, created time, and deterministic test seed, but those annotations do not weaken the required identity. The three schema-validated records are in `06_radio/functional-fixtures.v2.json`, SHA-256 `43a6076bc0fba38f5820ce2e6c60b37b8df72f10a6bfcfe9dad963a4994c0eb3`.

Rules:

- `ownerDomain`, `eventId`, and `receiptId` form the immutable source identity.
- The same resolved payload produces the spoken and caption representations.
- Template resolution occurs once before enqueue. No uncaptured placeholder may reach voice or caption.
- `captionText` may include accessibility punctuation/line breaks and `spokenText` may contain pronunciation markup only through an explicitly traced resolver; their factual tokens and quantities must remain equivalent.
- A duplicate `receiptId` is never voiced twice.
- Missing identity, expired payload, unresolved field, caption/spoken divergence, unsupported owner domain, or absent visual receipt fails closed.
- Functional priority orders already-authoritative receipts; it does not alter their game priority.

## Spoken-copy linter

The linter inspects spoken/caption fields separately from metadata and reports file, item ID, field, rule, and byte/line location. No autofix may change factual meaning.

| Rule | Spoken/caption trigger | Required disposition |
|---|---|---|
| `RADIO_META_FICTION` | `fictional`, `imaginary`, `make-believe` and normalized hyphen variants | Rewrite in-world or document why the actual subject requires it |
| `RADIO_PLACEHOLDER_LEGAL` | `placeholder`, `legal copy`, `rights pending`, `not for broadcast`, `prototype only`, disclaimer boilerplate | Remove from spoken copy; retain appropriate metadata |
| `RADIO_INTERNAL_ID` | prototype IDs, receipt/debug labels, UUID-like tokens, paths, schema names | Replace through resolved player-facing copy; never read internal identity aloud |
| `RADIO_TODO` | `TODO`, `TBD`, `FIXME`, `TK`, bracketed drafting notes | Reject item |
| `RADIO_UNSUPPORTED_MECHANIC` | claims that radio changes ratings, legality, funds, unlocks, outcomes, blockers, time, or player obligations | Reject pending owning-domain evidence and copy review |
| `RADIO_UNCAPTURED_VARIABLE` | `{name}`, `${name}`, `%s`, `{{name}}`, angle/bracket placeholder conventions | Reject before enqueue |
| `RADIO_REAL_PERSON_IMITATION` | `in the voice/style of`, `sounds like`, `impersonate`, celebrity/broadcaster target tags, protected-character directions | Reject voice direction and escalate for human review |
| `RADIO_REAL_WORLD_CLAIM` | unverified real brand, person, event, station, date, award, or technology claim in an invented item | Reject or move to sourced editorial review outside this prototype |
| `RADIO_CAPTION_DIVERGENCE` | normalized factual tokens/quantities differ between resolved caption and spoken forms | Reject both outputs |

Quoted test fixtures and metadata fields are allow-listed by schema, not by suppressing the rule globally. The audit output must report total files, units, rule hits, reviewed exceptions, corrected units, and unresolved blockers.

## Broadcaster ensemble

The prototype uses three recurring, explicitly fictional presenter identities across broad portions of the campaign. Names are working identifiers and require later naming/trademark review.

| Presenter ID | Working identity | Core role | Performance grammar | Avoid |
|---|---|---|---|---|
| `PRESENTER-MAE-CALDER` | Mae Calder | Service anchor across six eligible campaign grammars | Measured warmth, clear consonants, practical curiosity; moderate pace and precise nouns | Newsreader impersonation, faux-authoritative accent, melodramatic urgency |
| `PRESENTER-ARTHUR-VALE` | Arthur Vale | Studio-life and production-culture host across seven eligible grammars | Dry observational timing, steady breath groups, low sales pressure | Stand-up density, constant jokes, decade caricature, real DJ imitation |
| `PRESENTER-RINA-SHORE` | Rina Shore | Music/format host and network continuity across seven eligible grammars | Direct, humane, lightly energetic delivery with deliberate room for silence | Trend slang as era shorthand, celebrity cadence, protected-character similarity |

These identities persist while syntax, pacing, diction, vocabulary, formality, energy, and breath grouping adapt to the eligible programme grammar. They are not assigned one voice per decade.

Prototype rendering used the generic local macOS voices `Kathy`, `Ralph`, and `Samantha` only. No voice cloning, guide voice, celebrity likeness, broadcaster imitation, or protected-character target was used. The canonical v2 demonstrations contain 12 clean voice units and 12 separately treated derivatives: four accepted voice playouts per programme. The failed v1 lane’s 24-plus-24 files remain preserved but are not current evidence. Each v2 unit preserves:

1. a clean voice master;
2. a separately identified period-treated derivative;
3. exact voice-route, OS build, executable hashes, FFmpeg version, and reproducible command template;
4. treatment settings and hashes;
5. a statement that system-voice redistribution has not been resolved and the renders must remain local scratch prototypes.

Treatment may add bounded mono presentation, bandwidth shaping, compression, mild saturation, and room/speaker color. Static, hiss, crackle, noise, or distortion cannot be the primary historical signal.

## Scheduler input

The deterministic scheduler consumes:

- current allowed creative alias/programme grammar from a future P13-owned mapping or explicit lab fixture;
- daypart fixture;
- eligible presenter and content IDs;
- typed functional and PA receipts;
- item priority, created time, expiry, and category;
- cooldown and repeat history;
- current speech owner and radio-music state;
- Radio mode, Streamer Safe, caption, accessibility, and bus settings;
- presentation-only deterministic seed.

It does not consume raw mutable game objects or calculate calendar/era truth.

## Scheduler output

For every decision it emits:

- selected or refused item ID;
- content class and category;
- source payload identity where functional;
- presenter;
- planned DSP start/end;
- voice, radio-music, and score gains;
- interruption/coalescing action;
- caption event and transcript record;
- cooldown/history mutation in presentation state;
- expiry/refusal/suppression reason;
- deterministic decision digest.

## Eligibility and deterministic selection

1. Reject malformed, expired, duplicate, unresolved, or ineligible content.
2. Resolve highest speech-arbitration class.
3. Coalesce compatible simultaneous functional receipts only through an approved template that retains every source receipt ID.
4. Apply daypart and presenter eligibility.
5. Apply global speech budget, Radio mode, category, exact-item, and speaker cooldowns.
6. Use a deterministic priority queue: priority descending, expiry ascending, created time ascending, stable item ID ascending.
7. Retain at most one unstarted spoken item.
8. Select decorative alternatives through a seeded shuffle bag with no immediate item or presenter repeat where alternatives exist.
9. Resolve caption and transcript entry before scheduling audio.
10. Schedule or return an exact suppression/refusal.

Radio selection does not consume game RNG and does not persist to authoritative save truth. Presentation preferences/history may persist separately as save-independent user data.

## Speech budget and cooldowns

One global automatic-speech budget covers PA, functional bulletins, hosts, advertisements, and idents:

- no simultaneous voices;
- at least 60 seconds between automatic voice starts;
- no more than three automatic starts in any rolling ten minutes;
- no more than 120 voiced seconds in any rolling ten minutes;
- elective radio in `FULL` is capped at two starts and 75 voiced seconds in that window;
- `REDUCED` doubles elective cooldowns and permits at most one elective start and 45 voiced seconds per rolling ten minutes;
- `OFF` schedules no elective radio voice or radio bed;
- `Reduce Repetitive Voice` doubles exact-item and category cooldowns again.

Exact-repeat floors:

- host item: 120 minutes;
- advertisement: 90 minutes;
- ident: 60 minutes and at most two per real-time hour;
- same category: 15 minutes, except a higher-priority operational PA;
- never the same presenter back-to-back when another eligible presenter exists.

Categories remain exactly `operational_pa`, `receipt_bulletin`, `host_lot`, `host_industry`, `advert_break`, and `service_ident` for the authority-compatible scheduler. Decorative subtypes are tags, not new cooldown categories.

## Interruption and arbitration law

Speech priority is:

1. `URGENT_PA_HELP` / `operational_pa`
2. typed `FUNCTIONAL_BULLETIN` / `receipt_bulletin`
3. decorative host link
4. fictional advertisement
5. service ident

Rules:

- There is one speech owner; voices never overlap.
- A new PA or higher-priority receipt evicts a lower-priority queued item.
- An already playing lower-priority voice is not cut casually. If immediate PA presentation is authorized, fade it at an edited word/sentence boundary within two seconds, preserve its partial transcript state, then obey the global start budget. If the budget prevents new voice, the visual receipt carries truth and the trace records `VOICE_OMITTED_BUDGET`.
- A PA may immediately interrupt/duck radio music or an unstarted radio programme without violating the single-voice law.
- Functional items may interrupt elective radio-music beds but should not interrupt a voice merely to create drama.
- Milestone stings are deferred during PA or functional voice, suppressed when Music/Stings are disabled, and never replace the visual receipt.
- A setting change cancels newly ineligible queued speech and fades an already playing elective item at an edited boundary within two seconds.
- Save/Load expires unstarted elective material; receipt-bound material must be revalidated rather than replayed stale.

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
- If an ineligible bed is already playing, apply a short safe fade/mute and use an eligible owned bed or silence; do not wait for cue end.
- A missing safe substitute produces silence with a visible diagnostic, never an uncleared fallback.
- `Radio Off` cancels elective queued voice and bed, safely fades an elective item, and leaves functional truth in visual receipts/transcript where authorized.
- PA/help remains a separate setting and bus.
- Radio choices never change mechanics or the source payload.

## Captions and transcript

- Captions are enabled and available before the first functional voice by default.
- Every line carries speaker label and `[over radio]` or `[over PA]` context.
- Caption text uses authored line breaks, scalable text to at least 200%, configurable high-contrast background color/opacity, readable line length, and sufficient display time.
- The transcript stores resolved text, presenter/context, source type, timestamp, and receipt identity for functional items.
- Functional caption and voice are emitted from the same resolved payload.
- Partial interruption records the whole-item caption that was shown, the incoming PA, and interruption time; it never fabricates a completed bulletin. Word-timed segment accounting is deferred and explicitly not claimed by this pilot.
- Player-invoked transcript/replay may bypass automatic-start quota but still uses the single speech arbiter and cannot change truth.
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

Canonical scheduler evidence is `06_radio/scheduler-evidence/RADIO-SCHEDULER-EVIDENCE.v2.json`, SHA-256 `206988fc110ac97307d7aa067a9bf6f3a14e9325ddf180c45f11b19f803bcb51`. It is emitted by the TypeScript `scheduleRadio` implementation rather than by hard-coded render metadata. Two consecutive rebuilds were byte-identical. The current runtime index is SHA-256 `85ba975ab9acd1cda46c57d2e8dd645f8e25c0a0551fd54ab7eaad6a1d9c9abc`.

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

The canonical evidence entry point is `06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json` in `/Users/bruce/Project Studio Audio Systems Pilot 01`, SHA-256 `85ba975ab9acd1cda46c57d2e8dd645f8e25c0a0551fd54ab7eaad6a1d9c9abc`. The index reports a limited machine `PASS`; it is not a credibility, casting, fatigue, historical, cultural, rights, or accessibility verdict. Owner ratings remain required for copy credibility, presenter performance, repetition, ducking, fatigue, and accessibility.

No automated result can approve casting, historical treatment, comedy density, cultural credibility, or production use.
