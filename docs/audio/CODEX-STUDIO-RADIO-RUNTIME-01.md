# Project: Studio — Studio Radio Runtime 01

**Document status:** PROTOTYPE DESIGN AUTHORITY

**Source script bank:** 126 marathon prototype units

**Runtime scheduler evidence:** PLANNED UNTIL LINKED

**Voice status:** GENERIC LOCAL SCRATCH PROTOTYPE ONLY

**Simulation authority:** NONE

## Purpose

Studio Radio is an optional fictional Los Angeles studio service. It adds institutional continuity, studio-life flavor, and receipt-bound bulletins while leaving all mechanics and historical truth with their authoritative owners.

The radio never changes a Production, unlocks technology, advances time, creates a milestone, resolves a blocker, changes a result, or chooses which game event matters. Radio Off loses no mechanics.

## Existing source bank and cleanup boundary

The AI Music Foundry Marathon contains 126 original prototype script units: 14 for each of nine creative commissioning aliases. The bank is source material, not final copy, final casting, or an approved runtime season.

The prior audit identified spoken meta-fiction vocabulary such as `fictional`, `imaginary`, and `make-believe`. Those words may remain in metadata, rights notes, test fixtures, or safety classifications, but they must not puncture an in-world broadcast unless the actual subject requires the word. Cleanup must preserve the invented world meaning without substituting real people, brands, institutions, or false historical claims.

This document defines the audit and runtime contracts. It does not claim that all 126 units have already passed the new linter. A clean result requires an exact machine-readable audit report and hash.

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

Lab records also carry `source: LAB_FIXTURE`, fixture version, locale, created time, and deterministic test seed, but those annotations do not weaken the required identity.

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
| `PRESENTER-MARA-VENN` | Mara Venn | Measured service anchor; functional handoffs and calm daypart continuity | Clear breath groups, economical syntax, moderate pace, precise nouns, restrained warmth | Newsreader impersonation, faux-authoritative accent, melodramatic urgency |
| `PRESENTER-ELI-MERCER` | Eli Mercer | Studio-life and production-culture host | Conversational rhythm, short observational links, lightly dry energy, specific but invented detail | Stand-up density, constant jokes, decade caricature, real DJ imitation |
| `PRESENTER-NORA-SOL` | Nora Sol | Music/format host and later-network continuity | Flexible energy, concise music links, contemporary clarity with formality adjusted by programme grammar | Trend slang as era shorthand, celebrity cadence, protected-character similarity |

These identities persist while syntax, pacing, diction, vocabulary, formality, energy, and breath grouping adapt to the eligible programme grammar. They are not assigned one voice per decade.

Prototype rendering uses generic local/system voices only. No voice cloning, guide voice, celebrity likeness, broadcaster imitation, or protected-character target is permitted. Each accepted unit preserves:

1. a clean voice master;
2. a separately identified period-treated derivative;
3. exact voice-route and OS/tool provenance;
4. treatment settings and hashes;
5. a statement that the system voice is scratch-only and may not be redistributable.

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
- Partial interruption records which caption segments were shown; it never fabricates a completed bulletin.
- Player-invoked transcript/replay may bypass automatic-start quota but still uses the single speech arbiter and cannot change truth.
- No warning, blocker, milestone, task, or result exists only in voice.

## Three runtime-paced demo programmes

Each programme targets approximately 10–12 minutes so all required elements can appear while respecting the rolling budget. Exact schedules and renders are planned until linked to evidence.

| Programme ID | Eligible creative grammar | Required programme contents | Key proof |
|---|---|---|---|
| `RADIO-DEMO-EARLY-NETWORK-01` | Early network / golden studio; principally `network_sound_1933_1945` with only explicitly eligible adjacent material | Music and silence; one continuous service-ident/host/decorative opening; one fictional ad break; one typed functional fixture; a later PA priority event; captions/transcript | Formal-to-personal presenter continuity without propaganda parody or static shorthand |
| `RADIO-DEMO-POSTWAR-FORMAT-01` | Postwar personality / format transition; eligible `tape_hifi_1946_1959` and explicitly mapped adjacent transition material | Same required elements, including a format-neutral ident and PA over a radio-music bed | Performance grammar carries period change before treatment; no tape-stop or caricature |
| `RADIO-DEMO-DIGITAL-NETWORK-01` | Digital / networked hybrid; eligible `sampled_digital_1987_1999` and `networked_hybrid_2000_2014` fixture mapping | Same required elements with Streamer Safe substitution demonstration | Radio bed, score, voice, PA, silence, and substitution remain independently controlled |

A compliant 10–12 minute example may use four automatic starts while retaining at most three inside every rolling ten-minute window: a combined ident/host/decorative opening, an ad break, a functional bulletin, and a sufficiently later PA demonstration. Starts remain at least 60 seconds apart; total and elective voiced seconds remain within their caps. PA priority can also be demonstrated by evicting queued radio and ducking an active radio-music bed rather than violating the voice-start law.

Each demo includes cue sheet, source/payload IDs, DSP times, voice starts, silence windows, gains, captions, transcript, interruption decisions, cooldown state, and render hash where a mix is produced.

## Thirty-minute simulations

Create one deterministic 30-minute schedule per anchor programme:

- `RADIO-SIM-30-EARLY-01`
- `RADIO-SIM-30-POSTWAR-01`
- `RADIO-SIM-30-DIGITAL-01`

The simulations test eligibility, silence, daypart, presenter rotation, exact/category cooldowns, repeat history, expiry, coalescing, queue length, PA arbitration, captions, and deterministic replay. They do not need rendered voice to validate scheduler structure and do not establish listening comfort.

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

## Required evidence and human gate

Completion requires:

- a new script-linter report covering every existing spoken/caption unit;
- exact corrected-script hashes and an exception register;
- typed functional fixture validation and caption/spoken equivalence results;
- deterministic scheduler unit tests and three 30-minute traces;
- three 8–12 minute runtime-paced programme cue sheets and, where feasible, renders;
- clean and period-treated voice provenance;
- ducking, PA arbitration, transcript, Radio Off, Streamer Safe, mono, Night, and Speech First evidence;
- Owner ratings for copy credibility, presenter performance, repetition, ducking, fatigue, and accessibility.

No automated result can approve casting, historical treatment, comedy density, cultural credibility, or production use.
