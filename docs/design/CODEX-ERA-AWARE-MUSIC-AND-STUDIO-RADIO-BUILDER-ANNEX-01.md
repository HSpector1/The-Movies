# Project: Studio — Era-Aware Music and Studio Radio Builder Annex 01

**Status:** DECISION-READY RESEARCH CANDIDATE
**Scope:** DOCUMENTATION ONLY
**Authority:** NO IMPLEMENTATION AUTHORIZATION
**Accepted TypeScript evidence:** `7811377cea1c1b9ddca2c17c626879504b23ed4e`
**Accepted Unity evidence:** `29aea89a706a7f0961f5a460afc5bdb4d38d8395`
**P13 research evidence:** `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`

This annex turns the direction report into acceptance criteria and staged work packages. It is deliberately non-executable. Paths, fields, timings, and asset counts are planning candidates until the Owner authorizes a wave and P13 seals the authority needed by that wave.

## 1. Normative vocabulary

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** describe a future implementation contract; they do not authorize it.

Evidence labels are the same as the main report:

- **SOURCE-DERIVED FINDING**
- **CURRENT-CODE FINDING**
- **ARTISTIC INTERPRETATION**
- **TECHNICAL INFERENCE**
- **PROJECT: STUDIO RECOMMENDATION**

## 2. Audio truth and presentation contract

### 2.1 Provisional incoming projection

The following is a semantic envelope for field owners and contract review, not a request to edit a DTO now. No row asserts that the field exists today.

| Semantic | Owner | Closed meaning | Invalid behavior |
|---|---|---|---|
| `calendarYear` | TypeScript core calendar/scheduler; P13 may forward but does not own the clock | Global campaign year derived from authoritative time | Unity must not derive it from `gameWeek`, a local clock, a save filename, or a scene fixture. |
| global era/overlap truth | P13 `IndustryTimeline`/global-era owner | Closed presentation-neutral state such as `settled`, `approaching`, or `overlap`, or a closed eligible-era set; never an audio crossfade | Unity must not infer a phase from year, elapsed real time, or a player studio's research/adoption state. |
| audio-eligibility token/set (working example formerly called `musicEpochId`) | Future TypeScript contract owner maps sealed P13 truth; Audio Director owns the local creative catalogue | Closed key/set against which Unity validates local catalogue entries; the nine commissioning aliases are not presumed runtime values | Unity rejects an unknown value and uses approved neutral fallback/silence; audio does not rename P13 truth. |
| typed presentation event `{ownerDomain,eventId,receiptId}` | Each source package owns `eventId`; authorized projection owner issues deduplicable `receiptId` | Optional, already-authoritative event eligible for presentation; P13's exact event identity remains `timelineMilestoneId` | Music/radio cannot create, repeat, upgrade, collapse domains, or interpret the outcome. |
| `lotActivity` working semantic | **UNRESOLVED** upstream TypeScript presentation-contract owner, only after P05/P06/P14 seal | One pure closed aggregate such as `normal`, `active`, or `blocked` if separately approved | Field is unavailable until sealed. Unity must not inspect Productions, choose a winner, or infer success/blocker legality. |

The projection SHOULD be idempotent. Repeating the same envelope causes no restart. A later envelope supersedes earlier presentation intent, but an in-progress musical phrase may finish unless transport safety intervenes.

### 2.2 Unity-owned ephemeral state

Unity MAY own:

- a shuffle-bag permutation, last-two bounded cue history, and previous-bag digest;
- current cue and aligned-layer playback positions;
- next DSP boundary and pending presentation transition;
- current mutually exclusive context balance plus independent duck/menu envelopes;
- volume, density, radio mode, caption presentation, night, Force Mono/platform-equivalent, assistive-speech behavior, and streamer-safe preferences;
- presentation-only random seed and deterministic injected test seed;
- bounded presentation-profile heard-history for cue, motif, host, ad, bulletin, and ident cooldowns; this is not gameplay save truth;
- focus/suspend recovery state.

These values MUST NOT affect money, schedule, Production progress, success, legality, milestone creation, calendar, technology, or save migration. Their loss may change only subsequent presentation selection.

### 2.3 Precedence and stale input

Transport failure or suspension takes precedence over every musical request. Voice duck changes mix without replacing a cue. A milestone may schedule one sting only after receipt deduplication. Sustained context is qualified with hysteresis. Era transitions select future eligible content but do not cut a current cue without an authored boundary.

If an incoming envelope is older than the most recently accepted authority revision, ignore it and record the stale revision in diagnostic evidence. If the projection disconnects, continue the last valid presentation only for a bounded grace interval; then fall back to approved neutral ambience/silence rather than inventing changing truth.

## 3. Era catalogue specification

### 3.1 Provisional commissioning aliases

1. `acoustic_electrical_1920_1932`
2. `network_sound_1933_1945`
3. `tape_hifi_1946_1959`
4. `multitrack_fm_1960_1974`
5. `format_plurality_1975_1986`
6. `sampled_digital_1987_1999`
7. `networked_hybrid_2000_2014`
8. `streaming_plural_2015_2029`
9. `legacy_future_2030_2040`

These are temporary **PROJECT commissioning aliases**, not sealed runtime IDs. The first eight are historically informed catalogue divisions; the ninth is a declared extrapolation. Audio retains this creative taxonomy, while P13 may split or condition global temporal eligibility and the authorized contract owner may map it to a closed token/set. Audio MUST consume that result rather than make its alias table a private calendar. A flat pool is forbidden: where a palette emerged inside a broad band, closed global-era/overlap truth MUST authorize it; Unity MUST NOT derive eligibility from year or player-studio technology state.

### 3.2 Per-epoch planning manifest

Every epoch plan SHOULD record:

| Field | Purpose |
|---|---|
| Creative alias and closed upstream eligibility token/set | Authority lookup only; no client-side year rule |
| Historical-source notes | Facts and citation URLs kept separate from brief interpretation |
| At least four palette families | Prevent one-genre-per-decade reduction |
| Instrument families and performance practice | Commissioning and cultural review |
| Production perspective | Recording width, space, dynamics, edit language; no compulsory “old-record” damage |
| Harmonic/rhythmic range | Variety inside the epoch, including emerging and screen-scoring language |
| Motif permissions and absences | Identity without saturation |
| Neighbor tags | Previous/next eligibility only when P13 transition phase permits |
| Context layers | `foundation`, `periodColor`, `activityPulse`, plus approved exits/entries |
| Loop metadata | Tempo, meter, bar count, sample rate, exact frame length, loop in/out, tail policy |
| Rights/provenance IDs | Composition, master, performers, session, contract, source hashes |
| Accessibility/mix notes | Speech occupancy, mono risks, dynamic profile |
| Prohibited clichés | Era-specific rejection list from the main direction |

### 3.3 Standard asset count

Per epoch:

- four distinct cues totaling 14–18 unique minutes;
- three aligned layer groups per cue, delivered from the original music session;
- one 4–7-second ident package with full, radio-filtered, and subtitle metadata variants where applicable;
- at least one authored entry and one authored exit per cue, which MAY be tails rather than separate compositions;
- one motif arrangement study, which MAY be embedded in a cue and does not require a separate player-facing asset;
- zero required DJ lines until M6.

Across nine epochs, Standard therefore plans 36 cues, 108 aligned layer groups, 126–162 minutes of unique composition, nine ident packages, and up to 72 entry/exit deliverables. This count is a procurement model; exact export counts depend on whether entries/exits are embedded or standalone.

## 4. Adaptive behavior specification

### 4.1 Horizontal selection

1. Build an eligible set from the authorized closed P13-era-to-audio mapping and the validated local catalogue.
2. Apply streamer-safe and missing/corrupt-asset filters.
3. Put each eligible cue exactly once into a presentation-randomized bag. At bag refill, apply a history window of `min(2, eligibleCount - 2)`, never a fixed last-three exclusion; relax its oldest member only if no candidate remains. Prevent an immediate boundary repeat and reject the same complete bag permutation twice consecutively.
4. Prefer a palette family unlike the immediately prior family when two valid families remain, but cap reshuffle attempts and relax that soft preference rather than spin. Test builds MAY inject a fixed seed.
5. Never relax era eligibility, rights, corruption, or streamer-safe restrictions. For eligible counts 1–6, a seeded property test MUST prove termination, every-cue-before-repeat fairness, no boundary repeat where avoidable, no consecutive identical bag, and absence of a deterministic four-cue cycle.
6. Schedule the result at the current cue’s authored exit or phrase boundary.
7. At cue completion, `Low` inserts 35–60 seconds with 75% probability, `Standard` 20–45 seconds with 45%, and `High` 10–25 seconds with 20%. Changing density affects the next decision only; it MUST NOT restart/truncate/seek the current cue.

At provisional `approaching`, a starting audition distribution is 80–90% current / 10–20% incoming. At `overlap`, audition 35–65% incoming. At `settled`, select the published epoch except explicitly tagged archive cues. These percentages do not create the phase and are subject to P13 vocabulary review. Unity MAY execute an audio crossfade after consuming this truth; `crossfade` is not an upstream era value.

Every cue, ident, and sting declares motif exposure `none`, `fragment`, or `full`. Recognizable exposures MUST NOT overlap or occupy consecutive presentation units. A `fragment`/`full` starts a 20-minute session cooldown; a receipt-backed `full` starts 40 minutes. If a milestone would stack over motif-bearing music, delay it to a motif-free safe boundary or omit the sting while retaining the receipt. This shared law counts score, radio ident, and sting together.

### 4.2 Context qualification

| Context | Provisional qualification | Musical response | Release |
|---|---:|---|---:|
| `normal` | Default | Foundation plus selected period color | Immediate only at next safe boundary after higher context releases |
| `active` | 30 continuous seconds | Add approved `activityPulse` or a higher-motion mix at the next bar/phrase | 20-second hold, then boundary |
| `blocked` | 20 continuous seconds | Subtract motion, expose space, or choose approved low-motion voicing | 20-second hold, then boundary |
| milestone | Receipt/event ID not previously presented | One sting or motif fragment over current cue; no track restart | Once; never inferred or replayed by load |
| voice/radio | Single speech arbiter grants the item | Radio Voice ducks Radio Music, Score Music, and relevant ambience; PA preempts/delays lower speech and ducks all lower voice/music beds | Envelope release after speech ends; never overlap voices |

If active and blocked would both appear true upstream, the closed upstream aggregation MUST choose one valid value; Unity MUST NOT resolve that contradiction.

### 4.3 Scheduler rules

- Every transition is scheduled against `AudioSettings.dspTime` or an injected clock, not frame time.
- Maintain at least the platform-tested scheduling lead; begin validation at 100–200 ms.
- Layer groups MUST have identical sample rate, channel layout, frame count, start, loop, and tail policy.
- Tempo and meter metadata MUST be validated before a bar-synchronous operation is allowed.
- Same-cue layer changes use the next bar by default. New-cue changes use an authored phrase boundary.
- Crossfades SHOULD be 3–8 seconds/equal-power unless an authored entry/exit states otherwise.
- No routine UI action, screen navigation, camera movement, or ordinary one-week advance changes a track.
- A 1×/2×/4× change MUST NOT change pitch, tempo, sample position, or selection. It may only lead to a later upstream `lotActivity` change.

### 4.4 Pause, focus, and load transition table

| Event | Required behavior | Forbidden behavior |
|---|---|---|
| System menu while simulation continues | Apply independent menu attenuation if approved; music/DSP transport continues | Calling attenuation a held transport, restarting cue, or changing era |
| Explicit hard pause | Pause transport with `AudioListener.pause` or a tested equivalent; explicitly reviewed UI sources may ignore listener pause | Using a snapshot as transport pause or silently advancing the cue |
| Focus loss / platform suspension with frozen DSP clock | Stop adding unsafe deadlines; preserve sources and already scheduled DSP deadlines | Blind rebase, scheduling two copies, skipping a playlist, or replaying cue one |
| Resume after frozen clock | Confirm source validity and clock behavior; resume preserved requests without deadline rebase | Catch-up playback, double delay, or tempo compression |
| Audio device/configuration reset or invalid sources | Cancel pending starts, reconstruct one logical transport, and schedule once at a future safe boundary | Reusing invalid deadlines/sources or starting before authority/catalogue validation |
| Save | No audio sample position or gameplay-affecting selection added to save | Adding an audio outcome or hidden era field |
| Load same era | Begin/continue a valid cue according to lifecycle policy and presentation history | Replaying milestone receipts or always choosing cue one |
| Load different era | Cancel invalid pending starts; choose a valid new-era intro/boundary after authority arrives | Crossfading through an era guessed from the filename or old scene state |
| Unknown/missing epoch foundation | Neutral motif-free ambient bed or silence, user-safe diagnostic | Wrong-era music, crash, random browser-era fallback |
| Missing optional layer | Continue the validated remaining mix if sum/headroom metadata permits | Substitute an unrelated stem |

## 5. Mix and accessibility acceptance

### 5.1 Provisional bus tree

```text
Master
├── ScoreMusic
├── RadioMusic
├── Ambience
├── SFX
├── UI
├── MilestoneStings
└── Voice
    ├── PAHelp
    └── RadioVoice
```

The diagram is architecture vocabulary, not an existing Unity asset. `Normal`, `Active`, and `Blocked` form one mutually exclusive context-balance layer and contain no era, outcome, or legality logic. Voice ducking is an independent side-chain or gain envelope; user preference gain is another independent layer; menu attenuation is independent if approved; transport pause is not a snapshot. Combination tests MUST prove that context, duck, menu, and user gain compose without one overwriting another.

### 5.2 Player controls

Required future presentation preferences:

- Master, Score Music, Radio Music, Radio Voice, PA/Help, Ambience, SFX, and UI volume;
- Milestone Stings volume/category control;
- Music Density: `Low`, `Standard`, `High`;
- Radio: `Off`, `Reduced`, `Full`;
- subtitles and complete radio transcript access;
- streamer-safe routing;
- mono fold-down compatibility, night/limited-dynamic-range profile, and a player-facing Force Mono control or evidenced platform-equivalent route as a release gate;
- captions enabled and configurable before first speech, at least 200% scaling, platform-preference support, background color/opacity, authored line length/break/timing, speaker/context labels, transcript, and settings preview;
- automatic lowering/muting of game speech/music while assistive-technology speech is active, according to player preference;
- a Reduce Repetitive Voice option that lengthens content cooldowns without suppressing text truth.

Each slider and mode MUST be keyboard/gamepad operable, labeled for assistive technology, and testable without relying on color or sound alone. A global mute MUST NOT stop captions or visual receipts.

### 5.3 Ducking audition

Start listening tests at score −6 dB and ambience −3 dB while Radio Voice or PA/Help speaks, with 80–150 ms attack and 500–900 ms release. Radio Voice also ducks Radio Music. PA has priority, delays or ends Radio Voice at an edited sentence-safe boundary, and ducks every lower music/voice bed. Stings yield to operational PA. Two voices MUST NOT overlap. Side-chain behavior must not audibly pump on every consonant; longer-term gain riding MAY be preferable for mastered voice. Final settings require at least 80% word accuracy for the approved sentence set without changing Master in Force Mono/platform equivalent, night, laptop-speaker, representative headphone, and assistive-speech conditions.

## 6. Studio Radio content plan

### 6.1 Separation of responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| Score music | Era/tone presentation from valid catalogue | Calendar, milestone, Production result |
| Radio music/bed | Fictional service continuity | Score rotation or era truth |
| Host/DJ | Flavor, ident, noncritical commentary | Alerts, legal blockers, authored outcomes |
| Industry bulletin | Text-parity narration of an approved milestone | Genre demand, technology availability, world event creation |
| Fictional advert | Character and pacing | Real products, endorsements, unapproved tech forecasts |
| PA/Help | Concise operational assistance already visible in UI | Entertainment chatter, hidden instruction, outcome inference |

### 6.2 Standard M6 estimate

The first shippable radio budget is capped at:

| Unit | English-master count | Typical duration | Estimated finished minutes before alternates |
|---|---:|---:|---:|
| Epoch/service idents | 9 families × 3 = 27 | 4–7 s | 2–3 |
| Host links | 90 | 8–20 s | 18–22 |
| Industry/milestone bulletins | 54 | 12–25 s | 15–19 |
| Fictional advertisements | 27 | 15–30 s | 9–13 |
| PA/help additions | 27 maximum, only from accepted UI truth | 5–15 s | 4–7 |
| **Total** | **225 maximum** | — | **48–64** |

The arithmetic is **171 spoken links/bulletins/ads + 27 short ident variants = 198 radio units; 225 including the separately gated 27 PA/help maximum**. Every unit is written, reviewed, voiced/produced as applicable, edited, captioned, transcripted, localized, provenance-tracked, mixed, and repetition-tested as a discrete asset. Localization multiplies text/voice/edit/QA cost and therefore requires language-by-language authorization. Text-only localized subtitles with English voice MAY be considered, but never silently assumed.

### 6.3 Representative script forms

These are structure samples, not final scripts and not licensed station copy.

**Ident — 1920s service form (approximately 6 seconds)**

> `[over studio service]` “From the studio service desk—music while the lot keeps moving.”

**Host link — postwar form (approximately 12 seconds)**

> `[over radio]` “A quiet set is still a working set. We’ll leave some room between records and let the stages do the talking.”

**Industry bulletin — milestone-bound form (approximately 18 seconds)**

> `[over radio]` “The industry bulletin records a change already entered on your studio timeline. Open the written notice for its exact effect and date.”

**Fictional advert — 1990s form (approximately 16 seconds)**

> `[over radio]` “Marquee Cup Coffee keeps the late shift warm. Fictional beans, fictional claim, real break encouraged.”

The production script replaces generic phrases with a fully authored line whose factual slots come only from an allow-list for an accepted typed event reference. It never synthesizes arbitrary gameplay prose at runtime. Station/service names, host identities, fictional advertisers, product names, and slogans require trademark/name/endorsement clearance before recording or shipment.

### 6.4 Rotation law

- One arbiter permits one voice only, with priority `operational_pa > receipt_bulletin > host > advert > ident`. PA may delay/preempt at an edited sentence-safe boundary. Queue at most one item; coalesce compatible receipts; expire elective speech after 30 seconds, loss of eligibility, or Save/Load. Text/receipt is the fallback.
- All automatic speech: at least 60 seconds between starts; at most three starts and 120 voiced seconds per rolling ten minutes. Elective radio: at most two starts and 75 voiced seconds in the same window. Player-invoked replay may bypass the start count, but not the one-voice arbiter.
- `Off`: zero elective starts/beds. `Reduced`: one elective start/45 voiced seconds per ten minutes and 2× cooldowns. `Full`: two starts/75 seconds. `Reduce Repetitive Voice` doubles exact/category cooldowns again. A setting change cancels ineligible queued speech and fades an in-progress newly disabled item at an edited boundary within two seconds; score never restarts.
- Exact host line: 120-minute cooldown. Exact advertisement: 90 minutes. Exact ident: 60 minutes and no more than two idents/hour. Idents count toward all speech budgets.
- Category taxonomy is exactly `operational_pa`, `receipt_bulletin`, `host_lot`, `host_industry`, `advert_break`, `service_ident`; same category has a 15-minute cooldown except higher-priority operational PA. Same speaker is never back-to-back when another valid voice exists.
- Receipt-backed milestone: once per typed receipt identity, with subtitle/text receipt regardless of radio mode. Concurrent receipts coalesce or the lower priority becomes text-only; they never form a burst.
- Persist bounded presentation-profile history across relaunch: last two cues, previous bag digest, motif timestamp, the latest 128 spoken item IDs/timestamps, category timestamps, and receipt-dedup tokens if the authorized receipt contract permits. If absent/corrupt, apply a 15-minute cold-start elective-radio quiet period. Voice a receipt only when upstream explicitly marks that typed receipt presentable now; a loaded historical receipt is never inferred as new. Authoritative visual receipts remain upstream truth.
- Four-hour epoch run: zero cooldown/budget/overlap violations, no perceived catchphrase saturation, and at least 80% of reviewers rate speech fatigue no worse than `acceptable`.

### 6.5 Voice/localization/provenance gate

Each unit needs script ID, revision, fact owner, eligible epochs, speaker/performer, recording session, raw/edit/master hashes, caption and transcript text, pronunciation note, language/locale, contract/release ID, streamer-safe status, loudness/peak measurement, and cooldown category. Synthetic or cloned voices are prohibited unless separately proposed, consented, licensed, culturally reviewed, and approved; none is recommended here.

## 7. Audio Oracle V1

### 7.1 Manifest

Each canonical run records:

- TypeScript SHA exactly `7811377cea1c1b9ddca2c17c626879504b23ed4e` or the later explicitly authorized implementation SHA;
- Unity SHA exactly `29aea89a706a7f0961f5a460afc5bdb4d38d8395` or later authorized implementation SHA;
- packaged binary SHA-256, build ID, platform/OS, audio device, channel mode, sample rate, and DSP buffer;
- protocol/snapshot/catalogue manifest versions;
- Audio Oracle V1 reserves the required evidence keys `calendarYear`, `musicEpochId`, `eraTransitionPhase`, `majorMilestoneId`, and `lotActivity`. `calendarYear` records core truth; `musicEpochId` records the exact mapped audio-eligibility token/set; `eraTransitionPhase` records the exact presentation-neutral P13 era/overlap value; `majorMilestoneId` records the raw source-domain event ID for compatibility but is invalid alone and MUST be accompanied by `ownerDomain`, canonical `eventId`, and `receiptId`; `lotActivity` records only a separately sealed aggregate. If a future contract renames a key, the manifest retains these V1 keys plus the actual field name/value and explicit mapping rather than losing required evidence;
- selected `trackId`, palette family, active layer IDs, AudioMixer snapshot, gain values, presentation seed, and anti-repeat history digest;
- observed DSP time, requested DSP deadline, scheduler acceptance time, first detected marker/sample in engine PCM capture, drift, pause/suspend clock behavior, reset/rebuild action, and crossfade interval;
- clip/session source IDs and SHA-256 hashes;
- captured PCM output path/hash and the full machine-readable manifest path/hash.

Oracle evidence MUST distinguish requested authority, accepted authority, requested DSP deadline, scheduler/API acceptance, first rendered marker detected by correlation in engine PCM capture, and captured result. “Actual start” means the detected engine-capture sample, not a frame callback. Physical device/output latency may be claimed only with calibrated loopback hardware and a recorded calibration; otherwise it remains out of scope. A screenshot or listening note alone cannot prove sample timing; a log alone cannot prove musical quality.

### 7.2 Ten canonical scenarios

| # | Scenario | Machine proof | Human proof |
|---:|---|---|---|
| 1 | 1920 normal lot | Correct epoch, valid cue, normal layers/snapshot, hashes | Era recognized quickly without crackle caricature |
| 2 | 1940 normal lot | Correct provisional `network_sound_1933_1945` catalogue (or sealed P13 replacement) and no stale 1920 cue after boundary | Period distinction without march/cartoon monopoly |
| 3 | Era transition | P13 neutral era/overlap truth and contract-owner eligibility mapping received; eligible-set weights and scheduled phrase boundary logged | Musical continuity; neither abrupt lie nor mushy loss of identity |
| 4 | Active Production | Qualified closed activity, layer joins sample/bar-aligned | More motion, no panic and no UI-trigger thrash |
| 5 | Blocked Production | Qualified state, subtraction/mix change at boundary | Legible restraint without shame/failure cliché |
| 6 | Voice/radio ducking | Voice event, attack/release/gains and no cue restart logged | Intelligibility without audible pumping; captions exact |
| 7 | Pause/resume | Test mix-only menu and hard pause separately; frozen-clock deadlines are preserved without rebase; one logical transport/listener and expected source cardinality remain | No duplicate, pop, jump, delayed-twice start, or repeated ident |
| 8 | Save/Load into another era | Old pending starts canceled; new authoritative epoch selected; milestone not replayed | New era feels intentional after load |
| 9 | 4× simulation | Pitch/tempo/sample clock unchanged; no speed-driven restart | Same musical calm and pitch at every speed |
| 10 | Anti-repeat endurance | Four-hour selection log obeys bag/history/family/silence rules | No perceptually repetitive motif, host, ident, mix, or frequency band |

**Supplemental lifecycle scenario:** force an authorized test audio-configuration reset while current and next three-layer cue groups exist. Prove pending starts are canceled, invalid sources are discarded, authority is re-read, and exactly one logical transport rebuilds at a future safe boundary without stale audio.

### 7.3 Automated checks

- Exact scheduled-start delta and permitted tolerance at the chosen sample rate.
- Equal frame count, rate, channels, loop points, tempo/bar metadata, and summed headroom for aligned layers.
- Ten-consecutive-loop capture with seam click/discontinuity metrics and waveform/spectrogram artifact output.
- No cue restart for routine UI actions or speed changes.
- One logical transport and one listener through focus, pause, scene, and load transitions. A normal three-layer cue expects three playing sources; pre-scheduling can add three queued sources; a three-layer A/B crossfade can briefly play six. Reject unintended extras, not the designed cardinality.
- Valid catalogue/provenance/hash for every played clip.
- Deterministic test injection reproduces selection/scheduling evidence without making production selection deterministic gameplay truth.
- Four-hour per-epoch and a twelve-hour route through all eight adjacent transitions validate rotation, silence distributions, motif/speech budgets, cold-start behavior, setting changes, and memory bounds against the pre-registered thresholds.

### 7.4 Human listening questions

Machine proof cannot replace listening review. Reviewers answer the ten questions in the main direction plus:

- Is the loop seam inaudible on speakers and headphones at ordinary and raised monitoring levels?
- Do summed layers preserve dynamics and avoid masking PA/voice?
- Does the transition land musically even when the new cue has a different meter, tempo, or recording perspective?
- Does silence feel deliberate rather than broken?
- Can a listener blinded to scenario metadata identify whether a captured change was era, activity, blocked, voice duck, or milestone—and is that distinction as subtle as intended? A separate accessibility review includes blind/low-vision listeners; test blinding and disability are not conflated.
- In the pre-registered five-second nine-epoch-plus-`unsure` confusion test, do at least 12 metadata-blinded listeners meet ≥70% exact-family overall, ≥55% per family, and <10% nonadjacent false-era, without relabeling adjacent/`unsure` answers as correct?

## 8. Implementation waves — planning only

Every wave has one accountable owner. Supporting researchers, composers, engineers, counsel, performers, and QA do not dilute that accountability.

### M0 — Research and musical bible

- **One owner:** Audio Director.
- **Dependencies:** Owner decisions in the main report; P13 terminology review; procurement/legal review.
- **Likely files:** only the four documents in this package plus a future approved musical-bible document.
- **Boundary:** research may describe both packages; neither package changes.
- **Permitted:** citation correction, brief refinement, budget quotes gathered without commitment, listening-test design.
- **Forbidden:** code, Unity launch, asset generation/import, schema/DTO/save, dependency, P05/P06 edits, paid procurement.
- **Tests/evidence:** citation audit, famous-theme risk review, cultural review plan, budget reconciliation.
- **Assets:** none.
- **Runtime requirement:** none.
- **Stop condition:** Owner rejects aliases/budget/rights route, or P13 says the proposed semantics conflict with global timeline ownership.
- **Rollback:** revert documentation commit only; no runtime state exists.

### M1 — Audio foundation

- **One owner:** Unity Technical Audio Engineer.
- **Dependencies:** explicit implementation authorization; sealed target Unity base; M0 decisions; no collision with active P05/P06.
- **Likely files:** future `Assets/Studio/Audio/` catalogue/config assets, runtime audio coordinator/scheduler, AudioMixer asset, EditMode/PlayMode tests, settings presentation; exact names selected in the authorized implementation plan.
- **Boundary:** Unity presentation only; TypeScript and live bridge untouched.
- **Permitted:** native Unity buses, one persistent coordinator **without adding a listener**, injected DSP clock, local presentation preferences, silence/test clips with approved provenance. Keep the enabled scene’s existing listener; any later migration to one persistent listener is a separately sealed change that first removes/disables scene listeners.
- **Forbidden:** era inference, gameplay effects, TS/schema/save change, middleware, production music import before rights clearance.
- **Tests/evidence:** coordinator/listener lifecycle including additive/co-load and camera transitions, expected source cardinality, scheduled loop seam, the three pause/reset cases, preference/mix-layer isolation, deterministic test injection, captions before first speech/default/200%-scale/background/timing/preview, assistive-speech attenuation, and a target-platform Force Mono or evidenced platform-equivalent release route.
- **Assets:** approved test tones/silence only; hashes and manifests.
- **Runtime requirement:** authorized Unity test/runtime execution is required in that future wave.
- **Stop condition:** duplicate listener/source, scheduling tolerance failure, non-isolated preference affecting saves, or P05/P06 collision.
- **Rollback:** remove the newly isolated audio root/mixer and restore prior presentation wiring; no save migration.

### M2 — Era registry

- **One owner:** Audio Integration Lead, accountable only for coordinating sealed handoffs; this role does not acquire edit authority over every package.
- **Dependencies:** separate authorization for core/P13 era projection; sealed P13 global era/technology catalogue; P05/P06 acceptance before contract work; authorized bridge-version process; M1 stable.
- **Likely files:** (gate A) P13/core-owned timeline projection and tests; (gate B) contract-owner schema/generation surfaces only after the active bridge work seals; (gate C) Unity-audio-owner local catalogue/adapter and validation tests. Exact paths are selected by each authorized owner in a later implementation plan.
- **Boundary:** gate A publishes presentation-neutral era truth; gate B maps/version-seals it; only then gate C validates/presents it. This audio report authorizes none of those edits.
- **Permitted:** only separately approved, sequential, versioned projection and local catalogue mappings by the authorized editor for each repository/path.
- **Forbidden:** one editor crossing all gates; Unity calculating year/era; repurposing inert `EraConfig`; audio deciding technology; P13 implementation authorized by this package; bridge work before P05/P06 seal; unsealed forward evidence.
- **Tests/evidence:** core-week/P13-era fixtures, typed owner/event/receipt identity, DTO rejection/backward compatibility, unknown-token fallback, neighbor transitions, and closed internal palette eligibility without Unity year inference.
- **Assets:** metadata and temporary approved audition clips only.
- **Runtime requirement:** separately authorized TS/contract tests followed by Unity projection tests; no wave proceeds merely because the prior document exists.
- **Stop condition:** ownership ambiguity, P05/P06 collision, incompatible schema/save implication, no sealed neutral transition/eligibility vocabulary, or missing handoff seal.
- **Rollback:** before merge, abandon the candidate gate. After an upstream version seals, never remove it from this audio wave: preserve its owner-defined backward compatibility and disable the Unity audio consumer under that contract owner’s migration policy.

### M3 — Composer pilot

- **One owner:** Audio Director.
- **Dependencies:** approved procurement policy; M1/M2 audition path; counsel clearance; approved composers/cultural reviewers.
- **Likely files:** music briefs, contract/provenance register, source sessions outside runtime repo, approved pilot metadata/catalogue entries after clearance.
- **Boundary:** TS supplies only era/context; Unity auditions presentation.
- **Permitted:** commission and audition two or three deliberately nonadjacent epochs; compose the final motif; export aligned stems; similarity review.
- **Forbidden:** copying original soundtrack, named-theme imitation, unreviewed AI output as a shipping master, full-library commitment before pilot acceptance.
- **Tests/evidence:** five-second test with at least 12 listeners blinded to metadata plus separate blind/low-vision accessibility reviewers; frozen ≥70% overall/≥55% per-family/<10% nonadjacent false-era thresholds; 90-minute fatigue with at least 80% `acceptable`-or-better; loop/stem/oracle pilot; rights packet complete.
- **Assets:** candidate sessions, six or more approved human-composed cue candidates, stems, mixes, entries/exits; only cleared finalists enter production.
- **Runtime requirement:** authorized audition build and listening capture.
- **Stop condition:** era recognition weak, motif resembles protected work, cultural review rejects treatment, rights packet incomplete, or adaptive layers fail.
- **Rollback:** withdraw candidates/catalogue rows; retain rejected-source archive outside production with disposition record.

### M4 — Adaptive context

- **One owner:** Unity Technical Audio Engineer.
- **Dependencies:** M2 sealed era/event presentation handoff; a **separately sealed** closed `lotActivity` from its future authorized upstream aggregator after P05/P06/P14; M3 aligned pilot assets; Owner-approved timing.
- **Likely files:** scheduler/context resolver, mutually exclusive context balances, independent duck/menu/preference gains, projection adapter, EditMode/PlayMode/oracle tests.
- **Boundary:** TS aggregates truth; Unity applies qualified presentation.
- **Permitted:** hysteresis, priority, bar/phrase changes, ducking, anti-repeat, lifecycle recovery.
- **Forbidden:** inspecting Productions, changing music per UI action, pitch/time-scale coupling, saving outcomes, inventing milestone IDs.
- **Tests/evidence:** canonical scenarios 3–9, state-thrash test, simultaneous-Production fixture supplied by the sealed aggregate owner, focus/load recovery, motif exposure law, global speech arbiter, and streamer-safe mid-item fade.
- **Assets:** M3 approved stems/stings and test fixtures.
- **Runtime requirement:** authorized Unity runtime capture.
- **Stop condition:** rapid thrash, audible desync, duplicate playback, speech failure, or authority leakage.
- **Rollback:** disable context layering/stings and retain stable horizontal normal-lot playback.

### M5 — Full historical library

- **One owner:** Audio Director.
- **Dependencies:** accepted M3/M4 pilot, funded Standard/Premium tier, executed contracts/releases, cultural and similarity review.
- **Likely files:** approved audio catalogue/manifests and imported production assets under a future dedicated Unity audio root; external archival sessions.
- **Boundary:** catalogue describes valid presentation; no TS gameplay changes.
- **Permitted:** commission, edit, master, loop, import, validate approved assets after authorization.
- **Forbidden:** unproven stock/AI/source material, rights gaps, fake future facts, expanding runtime logic outside M4.
- **Tests/evidence:** four hours per epoch, twelve-hour cross-era route, hash/provenance completeness, mono-fold/night/speech tests.
- **Assets:** 36 Standard or 54 Premium cues and aligned deliverables.
- **Runtime requirement:** authorized full-catalogue build and capture.
- **Stop condition:** any epoch misses diversity/recognition/fatigue/rights thresholds or budget gate.
- **Rollback:** remove failing epoch assets/catalogue references and use a cue in the same closed upstream eligibility set or approved motif-free neutral ambience/silence; never fall across era eligibility and never migrate game state.

### M6 — Studio Radio

- **One owner:** Narrative Audio Director.
- **Dependencies:** typed P13/P14/P15 owner-domain/event/receipt allow-list; localization/accessibility plan; performer/union/legal clearance; repetition budget; M4 mix buses.
- **Likely files:** radio content catalogue, localized text/transcripts, voice assets, rotation/ducking presentation, tests and provenance manifests.
- **Boundary:** upstream supplies authorized fact IDs/text slots; Unity rotates/render voices; UI always presents text truth.
- **Permitted:** bounded fictional host/ident/advert/bulletin production and settings.
- **Forbidden:** runtime arbitrary factual prose, cloned voice without separate approval, real brands, critical audio-only information, unchecked script expansion.
- **Tests/evidence:** four-hour epoch/voice runs; arbiter/queue/rolling-budget and cold-start tests; localization parity; XAG-informed caption/Force Mono/assistive-speech acceptance; streamer-safe mid-item fade; cooldown/dedup; mono/night mix; trademark/name/endorsement clearance.
- **Assets:** capped Standard radio set or separately approved tier.
- **Runtime requirement:** authorized voice-content build and accessibility review.
- **Stop condition:** no transcript parity, unbounded localization cost, repetition failure, performer rights gap, or milestone ownership ambiguity.
- **Rollback:** disable radio voice/music as a presentation feature; PA/text truth remains.

### M7 — Final proof and seal

- **One owner:** Audio QA Lead.
- **Dependencies:** sealed candidate from M1–M6, reproducible build, complete rights archive.
- **Likely files:** Audio Oracle manifests/captures outside production assets as policy dictates, test reports, final catalogue hashes, seal documentation.
- **Boundary:** proof observes; it does not change TS truth or Unity presentation logic.
- **Permitted:** canonical scenarios, endurance, listening panels, platform/accessibility/streaming validation.
- **Forbidden:** accepting machine proof without listening, waiving missing provenance, last-minute architecture expansion.
- **Tests/evidence:** all ten canonical scenarios, four-hour epochs, twelve-hour route covering all eight adjacent transitions, frozen fatigue/intelligibility/motif/interruption thresholds, platform/accessibility matrix, metadata-blinded human scorecards and blind/low-vision accessibility review.
- **Assets:** final approved library/radio plus immutable evidence captures.
- **Runtime requirement:** packaged-player capture is required only in this future authorized wave.
- **Stop condition:** binary/clip hash mismatch, scheduling/loop failure, rights gap, P13 contradiction, accessibility failure, or fatigue rejection.
- **Rollback:** return to the last sealed content/catalogue/build; never migrate gameplay saves for an audio-only rollback.

## 9. Fresh independent review disposition

Six read-only reviewers received the post-draft package independently. Every material finding was treated as **REJECT pending fixes**; none edited files, launched Unity/player, generated audio, or touched P05/P06. The lead acted on every finding, and final rights, fatigue/accessibility, and cross-package rechecks returned PASS:

| Required reviewer | Material challenge preserved | Disposition in final candidate |
|---|---|---|
| Original-game audio | DJ persona order, complete genre chronology, transition behavior, KMVS scope, soundtrack completeness, ambience/sting catalogue, and licensing could not be inferred from community memory. | Exact seven English credit identities/role boundaries, Gibson/Prima/manual findings, sampler inference, and every unknown/low-confidence contradiction are now explicit; unsupported parity claims are rejected/deferred. |
| Historical music | Broad decade pools and thin genre labels would allow anachronism and tokenized cultural shorthand; 2030–40 cannot be history. | Institutional source matrix, boundary challenge, specific creator/tradition/geography gate, internal closed eligibility, multiple palettes, overlap, stereotypes, and future-as-extrapolation replace the prompt’s flat hypothesis. |
| Technical audio | Pause/DSP cases, actual-start proof, mix-layer composition, listener/source counts, streaming memory, browser paths, and middleware version/license evidence were underspecified. | Three lifecycle cases, requested/accepted/rendered timing, independent gain layers, bounded current/next memory/voices, exact paths/source locks, target-platform gates, and conditional native recommendation are specified. |
| Rights/provenance | Community threshold/term acceptance, model deletion, confidential registers, commission Content ID, toolchain licenses, and fictional-name clearance were incomplete. | Conservative USD 1 million stop, authorized-representative evidence, exact policy snapshots, custodian/deletion law, redacted repository record, Content ID clause, complete package-license inventory, and name/mark clearance are binding gates. |
| Long-session fatigue/accessibility | Four-cue/last-three rotation became deterministic; voice bursts/overlap, motif stacking, density/radio modes, captions, Force Mono, and pass thresholds were not bounded. | Dynamic two-choice-preserving history, property tests, global speech budget/arbiter, motif exposure law, executable mode cadences, XAG-informed release gates, cold-start memory, all-eight transition route, and frozen listening thresholds replace those defects. |
| Cross-package/P13 | Calendar, audio alias, milestone, activity, and `crossfade` ownership were conflated; M2 crossed editors and could remove a sealed projection. | Field-specific owners, typed owner/event/receipt identity, neutral era phases, unresolved activity owner, sequential M2 handoffs, collision stop, and backward-compatible rollback preserve P13 and P05/P06 boundaries. |

This disposition log is evidence of review and correction, not proof that future implementation or legal clearance exists.

## 10. Package validation gate

This research package passes only when:

- exactly the four authorized documentation files are changed;
- the accepted SHAs and P13 ownership are stated exactly;
- no production code, Unity asset, audio file, dependency, schema/DTO/save, or P05/P06 surface changes;
- external claims have citations and current-code claims have exact repository references;
- historical fact, current code, interpretation, inference, and recommendation are distinguishable;
- original-game unknowns stay unknown;
- all nine epochs contain multiple palette families and prohibited stereotypes;
- 2030–2040 remains explicit extrapolation;
- music never owns game truth, changes on routine UI, or follows simulation pitch;
- radio has bounded voice cost, captions/transcripts, repetition controls, and streamer-safe routing;
- native Unity is a revisable conclusion rather than an inherited premise;
- Audio Oracle includes sample scheduling/loop and long-session human review;
- the procurement plan records both composition and master rights;
- the Phase 2 handoff generates no music in this phase and cannot silently cross a legal, download, install, privacy, or commercial-use gate;
- fresh post-draft reviewers’ real findings are dispositioned before commit.

Implementation remains unauthorized after this gate passes.
