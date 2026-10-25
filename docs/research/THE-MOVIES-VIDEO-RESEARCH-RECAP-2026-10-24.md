# The Movies — complete video-research recap and continuation record

**Recorded 24 October 2026. Scope: all 43 supplied videos, including every listed episode of both playlists.** This file preserves the research findings, the detailed episode notes, corrections made during review, source identities, and the questions that remain unanswered. It is intended to let a future research or implementation agent continue without repeating this large evidence pass.

**Coverage means chronological sampled visual review plus available automatic captions. It does not mean every frame was watched continuously. No original audio was listened to.** Forty available automatic-caption tracks were read. The sources total 25 hours, 21 minutes, 27 seconds of playlist-listed runtime; that is source inventory, not continuous viewing time. Some transitions were examined at one-second intervals, but most footage was sampled much more sparsely.

This is original research documentation, not a game implementation, a test pass, a complete native specification, or proof of full-game parity. It transfers findings from the separate research repository into `HSpector1/The-Movies` at the owner's request. Checkpoints and implementation claims from that other repository must not be applied to this repository. Gameplay, HANDOFF, configuration, prepared assets, workers and runtime lanes are outside this document's scope.

## How to use this record

1. Read the synthesis and corrections below before converting an observation into a requirement.
2. Use the detailed retained reports later in this same file for episode timestamps, UI labels, context and limitations. They are included here so the recap remains useful even without opening the other repository.
3. Follow the commit-pinned source register for frame hashes and machine-readable coverage. A hash identifies a retained image; it does not itself prove what the image shows or make the image redistributable.
4. Before implementing, reconcile against the actual current code and native/manual evidence in the active repository. Do not repeat closed native work or assume a proposed acceptance sequence has already passed.
5. Investigate only the smallest remaining gap needed for the next implementation. The unanswered-question table supplies stopping conditions.

### Reading map

- **Consolidated findings:** what the footage teaches about the whole game.
- **Corrections and edition boundaries:** interpretations that would otherwise cause incorrect implementation.
- **Acceptance routes and open evidence gates:** useful next steps, with explicit limits.
- **Research-method lessons:** acquisition, timing, captions, disk and ownership lessons.
- **43-video inventory:** every assigned source and its caption status.
- **Retained reports A–G:** the detailed original episode findings and coordinator answers, embedded in full with links rewritten to immutable sources.
- **Source register:** identities and SHA-256 hashes for all original published research files.

## Evidence standard and edition boundaries

Use four separate labels: **observed** means readable pixels or a visible state/action in inspected frames; **commentary** means a creator's words as represented by automatic captions; **inference** means an interpretation of either; **unknown** means the requested behavior was not established. Confidence in a visible label does not imply confidence in the hidden algorithm behind it. Automatic captions can corrupt names and numbers. A narrator's confident explanation is not native-code proof.

| Source segment | Edition/settings established | Consequence |
|---|---|---|
| Flabaliki episodes 1–6 | Creator reports no expansion and refers to Premier Edition, with uncertainty; installation/build unverified. Episode 2 discloses a widescreen modification. | Useful reported-base witnesses, not a certified pristine retail installation. |
| Flabaliki episode 7 onward | Episode 7 at 00:15–00:30 explicitly announces receiving Stunts & Effects; later Stunt Doubles and Stunt Rating are visible. | Expansion-enabled from episode 7, even when an individual action resembles the base game. |
| Geekism episode 1 | Reported base game, modern-OS/resolution fixes; nondefault sandbox starts in 1930 with $1m, Stars Don't Misbehave and Buildings Don't Decay enabled. | Do not derive ordinary starting cash, aging/needs/maintenance rules or award behavior from this session. |
| Geekism episodes 2–19 | Episode 2 restarts normal play; temporary awards subsequently change rules. Exact installation/build remains unverified. | Stronger ordinary-game route, but track award modifiers and off-camera gaps. |
| Geekism episodes 20–24 | Applicant/staffing mod attempted in episode 20; episode 21 questions whether it took effect or needs a new save. | Do not treat later staff counts as untouched retail behavior. Do not assert the mod worked or did nothing. |
| Foredoomer longplay | Opening menu explicitly reads Stunts & Effects Expansion Pack. No build/mod qualification. | Expansion corroboration only; not a base-game authority for added controls or requirements. |
| Call Me Kevin | Edition and mods unknown; heavily edited comedic recording. | Useful readable UI examples with installation and continuity caveats. |

The footage is not authenticated demo evidence. Equally, a reported base-game playthrough is not enough to erase demo-versus-retail qualifications from earlier native research. Preserve each source's own version identity.

## Consolidated findings: the game the builder must preserve

### 1. A physical studio simulation, not just a production menu

The observed player route combines a persistent lot, building placement and construction, paths, individual people, physical assignment destinations, work travel, amenities and production scheduling. Catalogs expose prices and owned counts; buildings show placement previews and scaffolding; sets have their own footprints and repair/novelty context. These are distinct states, not an instantaneous purchase followed by an abstract production counter.

Flabaliki episode 1 supplies the clearest introductory sequence: studio creation around 1:30–2:00, construction and recruitment around 2:55–5:00, writing around 8:00–12:00, casting by 12:20, and production-office/release results around 21:25–23:00. Its exact gesture coverage is incomplete. Kevin supplies readable catalog and placement examples; the longplay corroborates construction in an expansion installation. See reports B, F and G.

Receiving zones matter. The gate exposes builder/janitor hiring; Stage School exposes actor/director/extra creation; script offices expose genres; casting exposes project roles and Rehearse/Shoot It; Production Office exposes release, reviews, archive and playback/postproduction routes. A future UX should preserve the meaning of these destinations and feedback when an object is held over them. The footage does not establish every permissible cross-profession reassignment or every invalid-drop rule.

Paths, doors, footprint size, placement, décor and maintenance affect how the lot is used. Narrated complaints about blocked access or beauty are useful investigation cues, not a measured pathfinding rule or numerical attractiveness formula. Replacement facilities and larger offices can require substantial rearrangement. Later operations cannot be tested only on an empty introductory lot.

### 2. Staff are persistent people with competing demands

Visible staff interfaces expose stress, satisfaction, status, skill/genre experience, relationships, salary, image, entourage and trailer considerations. Stars have rankings and several contributing factors. These are separate concepts: a person's genre fit is not public interest in that genre; wages are not the same as personal status; apparent age is not necessarily actual age.

The salary screen includes annual salaries, salary satisfaction, current/future influence and a total. Kevin at 16:10 supplies an independent arithmetic check: $6,500 plus five salaries of $6,000 equals $36,500 annually. This verifies that displayed example, not the payroll debit schedule, universal defaults or any influence coefficient.

Practice, interpersonal contact, recreation, makeover and trailers recur throughout the series. Caption accounts describe preferences and adverse reactions; avoid converting those into exact thresholds without a stronger source. Entourage uses actual people and therefore competes with the studio's available workforce. Shared actors, directors, extras and crew create contention between projects.

Long-term play introduces retirement warnings, aging, replacement hires, cast substitution and trailer reuse. Geekism episode 19 contains a retirement sequence around 34:01–35:25; later claims about finishing a current film before retirement remain qualified commentary. Selling a star, firing a person and retirement should not be conflated merely because each can remove someone from a roster. See reports B–D and F for the exact observations.

### 3. Writing is broader than one authored comedy recipe

Five genre receiving zones are visible: Action, Comedy, Horror, Romance and Sci-Fi. The game distinguishes staff genre experience from public genre interest. Script offices and their progression are part of ordinary production, while Advanced Movie-Making provides a separate authoring route. Generated scripts can also be opened for editing; Kevin's romance example at 21:37–22:00 is a useful witness, with edition and editing caveats.

The authoring interface exposes title, genre, structure and leading/supporting role configuration. Scene libraries are tied to sets, with scene previews, adjustable parameters, costumes and a scene strip. Optional role slots can be disabled. Mannequins and supporting/background characters must not be indiscriminately converted into principal casting requirements.

A film's declared genre is not simply the theme of every set it uses. Geekism episode 16 provides a mixed-set example; films can move through unrelated visual settings while retaining their declared genre. Do not derive a script-generation distribution, exact scene eligibility rule, all role requirements or a complete scene catalog from a few authored examples.

Basic, Intermediate and Proficient writing-office references appear across the record, together with custom authoring facilities. Milestones/research and available space constrain access. The footage is an index of encountered tiers and unlocks, not proof that the complete retail catalog has been enumerated. See reports B–D and F.

### 4. Casting, rehearsal, travel and filming are distinct stages

Casting exposes director, leading roles, extras and crew counters, along with Rehearse and Shoot It. Requirements differ between films. Flabaliki's first-film narration describes two crew and one extra plus the lead and director; Kevin has a visible Crew 1/3 and Extras 0/0 example; expansion footage shows other counts. None establishes a universal staffing recipe or the native identity of a role kind.

Rehearsal, readiness, arrival and actual filming must remain separate. A person assigned to a film is not necessarily already on set. Missing crew and shared/occupied resources can leave work waiting. Later footage describes adding missing staff and resuming production, but precise admission predicates and every waiting message are not all visually pinned.

The most important missing witness remains the **complete equipment lifecycle**. Flabaliki episode 1 at 13:48–13:49 shows the film token over Shoot It, then the camera leaves the production to decorate. Geekism episode 6 at 18:00–19:15 was separately examined in 75 one-second frames and still does not show the requested uninterrupted lifecycle. Do not repeat those windows expecting them to answer camera spawn or teardown.

Foredoomer at 2:32:00–2:32:06 shows a boom-carrying crew member changing posture/location in an expansion installation. This establishes a visible prop/person relationship, not a bone attachment, matrix interpretation, equipment spawn trigger, stationary-camera setup or teardown rule. The coordinator's native rig investigation remains independent. See report A and the crew manifest.

### 5. Authoring, postproduction, preview, saved playback and export are different operations

The strongest early postproduction witness is Flabaliki episode 4 at 23:10–23:45, a separately acquired focused clip with 35 inspected one-second frames. It shows preview and shot strip at 23:12, Sound Effects/Ambience/Mumbling switches around 23:21–23:22, Title Style at 23:25, Online Thumbnail at 23:30, Advanced Features at 23:34, expanded tracks at 23:35, Save at 23:38, Export Movie at 23:39–23:40, and return to the lot/Post Production floor at 23:42.

Those are control and navigation witnesses. They do not establish a successful save, an exported playable file, exporter settings/codecs, an audible switch effect or recovery after closing without saving. A mostly black preview in a sample is not by itself a rendering defect.

Flabaliki episodes 12–13 show return from costume selection to the same working draft, followed later by release of that film. This supports working-context continuity, not disk persistence, and is expansion-qualified. Duplicate/delete gestures are caption-supported where the actual input is not densely sampled. A failed or uncertain costume-load attempt must not become a successful persistence claim.

Finished-film playback contains sequential scenes, changing sets/costumes and credits. Creator-added jokes/dialogue over playback are not evidence of native speech generation. The game offers visible voice/sound controls, but this research did not listen to them. See reports A–D, F and G.

### 6. Release quality and commercial performance have multiple dimensions

Kevin at 4:54 shows separate script, performance, relationships, set repair, crew experience, movie quality, star power, genre interest, novelty and technology factors. The displayed performance relationship names mood, experience and genre fit; it does not disclose numerical weights or prove that literal arithmetic addition implements the score. Reviews explain several dimensions rather than a single opaque rating.

Release also feeds back into staff: stress, wages earned, experience, star rating and crew experience appear in the effects table. Flabaliki episode 1 at 23:00 shows total production cost $13,493 and duration eight months, with visible director/lead/extra wages $4,389/$3,780/$1,109. Those three wages total $9,278, leaving $4,215 relative to the displayed total; **the remaining amount is not allocated to invented cost categories**. This is an independent consistency example, not a full accounting formula.

Keep current cash, annual payroll, script/editor cost estimates, total production cost, revenue and profit separate. A newly released film can be described as unprofitable while it has begun earning; that is not contradictory. Relative chart position also depends on competing films. Sparse outcomes do not identify revenue decay, review weights, rounding, bankruptcy or debt policy.

Archive is a distinct destination and process. Flabaliki episode 8 at 15:12–15:22 has a dense archive gesture: held film, green Archive zone, Archive Progress, then camera movement. Because episode 7 installed the expansion, this is an expansion-qualified witness and does not silently complete a pristine-base cold-start acceptance route. See reports A–D and F.

### 7. Publicity and paid marketing are separate routes

The clearest new UX finding is Geekism episode 15 at 21:52–21:58: readable in-game guidance sends a film **or one of its stars** to the Publicity Office, whereas paid marketing is allocated at the Production Office. This corrected an earlier caption interpretation that the film should be dropped onto a star. Match the receiving destination to the actual tooltip.

Geekism episode 23 at 13:39–13:45 supplies a visible maximum-PR refusal: the film remains held instead of being consumed into a new task. This is after the attempted staffing mod. It supports that visible refusal, not a pristine retail numerical cap, an affordability policy or an invisible ledger invariant.

PR progress/cap, public awareness, marketing budget and review feedback should remain distinct. Creator accounts of idle-star publicity, rejected extras, busy offices and multiple offices are useful eligibility/capacity leads, but not universal predicates. Flabaliki episode 14 supplies expansion-qualified budgeting/release examples and caption amounts, not readable before/after balance oracles.

The coordinator had already native-qualified marketing selection storage and release-time debit in the research project. Do not reopen those investigations solely because this video pass lacks them. **Insufficient funds/debt, cancellation/back behavior, exact PR timing and complete facility eligibility remain unanswered here.** See report A's exact pins and reports C–D.

### 8. Progression changes the operating problem over decades

Milestone achievements and periodic competitive awards are different systems. Milestones can unlock facilities/content or gate further research. Competitive awards compare studios/people/films and can confer modifiers. A trophy ceremony is not automatically the same as completing a threshold certificate.

Award effects are not permanent default rules. Geekism's no-addiction benefit is later lost; other narrated awards affect novelty, genre interest, research, quality or pay. Any comparison must record the current award state. The episode-1 sandbox settings also stop applying after episode 2's normal-game restart.

Research categories, historical technology, cameras/film stock/color, sets, wardrobe and office progression appear in the record. Dates, research progress and milestone requirements must not be collapsed into one unlock mechanism. Kevin's April 1962 “Pack Unlocked” notification concerns technology and is not evidence of Stunts & Effects.

Later play introduces aging casts, longer/custom productions, staffing shortages, simultaneous projects, larger facility footprints, increased expectations, marketing and cash runway. These are concrete reasons that a two-film introductory fixture cannot establish full-game playability. Exact late-game unlock tables and formulas still need retail/native corroboration. See reports B–D and F.

### 9. What this pass did not establish about presentation and audio

Visible historical film appearance, playback, scene transitions and audio-option labels are useful presentation references. Original radio announcements, station/music selection, audible era transitions, interruptions, pause behavior, lot-to-film mix changes and voice recording were **not listened to**. Automatic captions primarily capture creator speech and are not a substitute for listening to game audio.

Likewise, the presence of Save/Export labels does not establish save/load correctness, crash recovery, exported media validity or long-running determinism. These remain separate acceptance obligations in the implementation.

## Corrections a future agent must preserve

| Tempting but incorrect conclusion | Correct record |
|---|---|
| All supplied footage is base game. | Foredoomer is visibly expansion; Flabaliki installs expansion at episode 7; Kevin is unqualified. |
| All Geekism episodes use the initial easy sandbox. | Episode 2 restarts normal play; later awards and an attempted staffing mod add different qualifications. |
| No addiction is a permanent ordinary rule. | It is an award modifier that the series later loses. |
| Drop the movie onto a star to obtain publicity. | Readable tooltip specifies movie or one of its stars into the Publicity Office. |
| Maximum PR means maximum awareness or any budget is appropriate. | The footage distinguishes these concepts; no equivalence or formula was established. |
| A technology “Pack Unlocked” popup proves expansion installation. | Kevin's example is a historical technology unlock. |
| Moving boom equipment proves a particular native bone/matrix field. | Pixels establish visible movement only. |
| A return to the same draft proves disk save/load. | It proves working-context continuity. |
| Hovering Save/Export proves successful persistence/export. | Only the controls were witnessed. |
| Creator voiceover is native generated movie dialogue. | Creator audio must be kept separate. |
| Curved roads, vehicles and studio tours are verified features. | Flabaliki episode 17 around 16:32–17:10 discusses wishes for a sequel. |
| A downloader exit code or sampled frame proves a complete, exact source timeline. | Fragment loss and keyframe offsets require separate validation. |
| Every requested episode reviewed means every requested question answered. | Coverage and behavioral completeness are different. |

## Reconstructable acceptance routes and remaining gates

These are proposed tests for a future authorized implementation lane, **not tests executed by this research**.

| Capability | Evidence-backed route to reuse | Missing check and stopping condition |
|---|---|---|
| Ordinary studio-to-release | Flabaliki 1: create studio → construct/hire → genre writing → casting → Shoot It → Production Office → results/playback. | Add readable transfers, uninterrupted production and actual revenue/archive in a qualified base installation. Stop when one same-film route has all transitions and identities pinned. |
| Crew/equipment lifecycle | Casting counters, Shoot It gesture, travel/wait examples; expansion boom close-up. | One uninterrupted, edition-qualified recording following the same film through assembly, equipment placement/use, next-set movement and teardown. Include one missing-crew or occupied-set refusal and resumption. Stop at the complete sequence; no guesses about rig fields. |
| Publicity versus budgeting | Geekism 15 tooltip and Production Office Release Budget; Geekism 23 capped-PR refusal. | Qualify eligible film/star/building states separately. One accepted and one refused contrasting case per unresolved predicate, using retained native/manual evidence first. |
| Paid funds/cancellation | Existing native selection/debit findings stay closed; videos add route distinction. | One readable before/after balance around selection, cancel/back and release; a below-cost case or authoritative funds predicate to distinguish refusal from debt. Stop once each transaction boundary is identified. |
| Editor continuity | Flabaliki 4 navigation/controls; episodes 12–13 working draft; Kevin generated-script editing. | One actual save → leave → reopen/reload comparison, one unsaved-exit contrast, one playable export. Stop with the resulting artifacts and unchanged/changed draft state pinned. |
| Long-term progression | Milestone/award/research/aging indices in Geekism and Flabaliki. | Select the next dependency's exact threshold from authoritative retail/native material; do not reconstruct every formula from narrator arithmetic. |
| Audio | Visible switches and playback entry points only. | Directly listen to short, qualified source intervals covering radio interruption, pause, lot/movie transition and an actual switch action. Stop once audible before/after behavior is recorded; separate narration from game audio. |

Preserve normal save/load, duplicate/stale input, cancellation, identity, recovery and long-running simulation requirements when implementing these routes. The videos do not independently specify every such edge case. Existing engine checks, budgets and graphical/cold-start/audio obligations remain in force. The research project's unresolved CP389 combined-test timeout was not resolved by this documentary work.

## Research-method lessons worth keeping

### Evidence acquisition and tool choice

The local video-skill experiment used `bradautomates/claude-video` pinned at `03ceb42f7fa2c4439aca01752118044baabffb8f`, with yt-dlp 2026.10.21 and FFmpeg 9.0.2. Repository popularity was a selection aid, not a correctness guarantee. Inspect the actual scripts before relying on behavior.

A key discovery: the tested watch script's `--start`/`--end` constrained extraction, **not the full remote download**. Fetch a bounded clip first when disk or time matters, then process the local clip. Avoid assuming command-line names imply download boundaries. No external AI provider, Whisper model, global install or game provider was required for this pass.

The local watch report could say no captions because a local media file had no embedded subtitles even when YouTube had a separate automatic-caption track. Check the actual track inventory and retained files. An initial late-series caption-availability mistake was corrected after inspecting the files; final missing tracks are Flabaliki 3 and 9 plus Foredoomer. Caption parsing success is not runtime readiness or factual verification.

### Timeline validation is part of evidence quality

Early Flabaliki acquisition revealed that a successful download can omit HLS fragments. Episodes 4 and 5 retain isolated acquisition-gap uncertainty. Episode 6 omitted source 309.333314–351.999978 seconds, a 42.666664-second interval. Its local timeline after the omission needed that offset restored. The missing interval and tail were separately sampled; the manifest preserves the correction and uncertainty.

Use original-source caption timestamps, validated frame mappings and independent focused progressive clips where available. Do not cite a nominal clip offset as a frame-exact mouse commit. Keyframe preroll, coarse buckets and missing fragments can all shift apparent timestamps. Progressive retrieval avoided the observed HLS failure mechanism, but deleted source media limits retrospective duration checks; do not claim validation that was never retained.

Low-resolution full-timeline samples are an efficient index, not a numerical oracle. Use a short higher-resolution check for small labels, balances or refusal text. Upscaling does not recover unreadable evidence. Dense sampling can still miss a gesture between frames and cannot establish uninterrupted motion or audio.

### Negative findings save future work

Record a checked candidate that did not answer the question. The Flabaliki first-shoot and Geekism 6 crew windows now have explicit stopping results; another agent should not spend the same effort expecting an equipment lifecycle hidden there. Preserve cuts, off-camera work, uncertainty and unsuccessful actions instead of filling gaps with a plausible story.

Keep acquired media outside Git. Only original prose, source URLs, metadata and hashes were published. Owned source videos were deleted after extraction; evidence notes and frame pins were retained. The shared 2 GiB reserve and other workers' ownership constrained acquisition. No retail binaries, unauthorized copies, native-handle reconnection or engine run occurred. A future pass must recheck current free space rather than reuse an old free-space reading.

### Continuation and source ownership

The prior research was published as draft PR13 in the separate research repository. The retained packet was verified against remote blob identities. This recap pins that final evidence commit rather than relying on a moving branch. The original reports sometimes contain interim phrases such as “not yet visually read” followed by a later focused verification; those are chronological research history. **Use the corrections in this synthesis and the final focused/audit sections when an earlier provisional note differs.** Do not erase the original limitation or silently upgrade every related claim.

No code acceptance can be imported through a document. Before future implementation, identify current ownership, current HEAD, existing accepted evidence and genuinely open questions. Work on a disjoint documentation scope; do not take over another coordinator's checkout, locks, engine or HANDOFF. This recap creates no new runtime authorization.

## Lawful next sources already identified

These are owner-supplied acquisition leads, **not sources newly read or authenticated by this recap**:

- [Steam-hosted English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040): inspect edition, page numbers and exact language before using it to close a rule.
- [Internet Archive listing for The Movies Prima Official eGuide](https://archive.org/details/The_Movies_Prima_Official_eGuide): verify access rights and edition; a listing does not authorize redistribution or bypassing access restrictions.
- [GameFAQs guide 40166](https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/40166): useful corroboration and mechanic leads, not automatic proof of native formulas.
- The original video URLs below: revisit only the relevant bounded interval, or ask a lawful owner/creator for a missing uninterrupted demonstration. No retail-copy acquisition is needed merely to inventory evidence.

Do not redistribute manual pages, full transcripts, screenshots, game assets or source videos as reconstruction assets. The retained reports are original observations with short UI labels and source pointers.

## Complete source inventory

All entries below received sampled visual review. Caption availability is separate. Durations come from the retained inventory; Geekism's flat-playlist total differs from per-video metadata by 12 seconds of aggregate rounding. Neither total measures time actually watched continuously.

| Series | Episode | Video | Listed duration | Captions |
|---|---:|---|---:|---|
| flabaliki | 1 | [Flabaliki Plays: The Movies - Part 1](https://www.youtube.com/watch?v=EALqGBsuoQ8) | 30:12 | full en-orig automatic track read |
| flabaliki | 2 | [Flabaliki Plays: The Movies - Part 2](https://www.youtube.com/watch?v=st675uzmbDU) | 33:09 | full en-orig automatic track read |
| flabaliki | 3 | [Flabaliki Plays: The Movies - Part 3](https://www.youtube.com/watch?v=apu4o5MEluI) | 31:37 | en-orig and en unavailable; no ASR fallback |
| flabaliki | 4 | [Flabaliki Plays: The Movies - Part 4](https://www.youtube.com/watch?v=tOEsrY44--c) | 32:00 | full en-orig automatic track read |
| flabaliki | 5 | [Flabaliki Plays: The Movies - Part 5](https://www.youtube.com/watch?v=ISF8wILUxDI) | 38:39 | full en-orig automatic track read |
| flabaliki | 6 | [Flabaliki Plays: The Movies - Part 6](https://www.youtube.com/watch?v=1A9G7KEIzsI) | 35:13 | full en-orig automatic track read |
| flabaliki | 7 | [Flabaliki Plays: The Movies - Part 7](https://www.youtube.com/watch?v=8fZbtnWZJtA) | 30:25 | full en-orig automatic track read |
| flabaliki | 8 | [Flabaliki Plays: The Movies - Part 8](https://www.youtube.com/watch?v=AqHp2NExbSo) | 20:29 | full en-orig automatic track read |
| flabaliki | 9 | [Flabaliki Plays: The Movies - Part 9](https://www.youtube.com/watch?v=yS03MnLxyv4) | 21:03 | unavailable |
| flabaliki | 10 | [Flabaliki Plays: The Movies - Part 10](https://www.youtube.com/watch?v=GcdYLee-nhY) | 21:26 | full available automatic English track read |
| flabaliki | 11 | [Flabaliki Plays: The Movies - Part 11](https://www.youtube.com/watch?v=Qyv9PNfxoNk) | 21:07 | full available automatic English track read |
| flabaliki | 12 | [Flabaliki Plays: The Movies - Part 12](https://www.youtube.com/watch?v=O7P2VjYc_q4) | 38:15 | full available automatic English track read |
| flabaliki | 13 | [Flabaliki Plays: The Movies - Part 13](https://www.youtube.com/watch?v=a-WJQMs9LQs) | 30:21 | full available automatic English track read |
| flabaliki | 14 | [Flabaliki Plays: The Movies - Part 14](https://www.youtube.com/watch?v=YUfNTKEubdw) | 30:36 | full available automatic English track read |
| flabaliki | 15 | [Flabaliki Plays: The Movies - Part 15](https://www.youtube.com/watch?v=_tJU8vafkfg) | 36:27 | full available automatic English track read |
| flabaliki | 16 | [Flabaliki Plays: The Movies - Part 16](https://www.youtube.com/watch?v=rAnRWPL14ms) | 32:29 | full available automatic English track read |
| flabaliki | 17 | [Flabaliki Plays: The Movies - Part 17](https://www.youtube.com/watch?v=0pTI5jtv71I) | 32:50 | full available automatic English track read |
| geekism | 1 | [🎥 Neville's Devils \| Let's Play The Movies #01](https://www.youtube.com/watch?v=DgUQHt1AgAY) | 36:21 | full available automatic English track read |
| geekism | 2 | [🎥 Tidgy Gets A Biscuit \| Let's Play The Movies #02](https://www.youtube.com/watch?v=u-Tq_b5KTI8) | 24:55 | full available automatic English track read |
| geekism | 3 | [🎥 Tinymen \| Let's Play The Movies #03](https://www.youtube.com/watch?v=12jqKxiFPIQ) | 18:51 | full available automatic English track read |
| geekism | 4 | [🎥 Bang Bang We're Dead \| Let's Play The Movies #04](https://www.youtube.com/watch?v=yqRncTT7CX0) | 25:44 | full available automatic English track read |
| geekism | 5 | [🎥 The Brain Readers \| Let's Play The Movies #05](https://www.youtube.com/watch?v=dL2avF7d4h8) | 29:32 | full available automatic English track read |
| geekism | 6 | [🎥 This Is A Muck Up! \| Let's Play The Movies #06](https://www.youtube.com/watch?v=KKMXXE9nosY) | 27:21 | full available automatic English track read |
| geekism | 7 | [🎥 Killer Fembots From Mars \| Let's Play The Movies #07](https://www.youtube.com/watch?v=dun_VB5idoc) | 31:22 | full available automatic English track read |
| geekism | 8 | [🎥 Stinky! \| Let's Play The Movies #08](https://www.youtube.com/watch?v=e5D8qT77W8o) | 23:17 | full available automatic English track read |
| geekism | 9 | [🎥 The Kid Rode Away \| Let's Play The Movies #09](https://www.youtube.com/watch?v=xQdWGCp8tNA) | 28:16 | full available automatic English track read |
| geekism | 10 | [🎥 Alpha Male \| Let's Play The Movies #10](https://www.youtube.com/watch?v=3puqhVgbEgI) | 28:43 | full available automatic English track read |
| geekism | 11 | [🎥 Blazing Stallions (1/2) \| Let's Play The Movies #11](https://www.youtube.com/watch?v=WenRGpJhoqA) | 33:17 | full available automatic English track read |
| geekism | 12 | [🎥 Blazing Stallions (2/2) \| Let's Play The Movies #12](https://www.youtube.com/watch?v=XxIPKG6nv10) | 29:15 | full available automatic English track read |
| geekism | 13 | [🎥 Toby's Car \| Let's Play The Movies #13](https://www.youtube.com/watch?v=jr6TMizSHYA) | 28:57 | full available automatic English track read |
| geekism | 14 | [🎥 The Mole (Part 1) \| Let's Play The Movies #14](https://www.youtube.com/watch?v=UUpassJG-kw) | 29:41 | full available automatic English track read |
| geekism | 15 | [🎥 The Mole (Part 2) \| Let's Play The Movies #15](https://www.youtube.com/watch?v=0LkaktPW3qg) | 22:39 | full available automatic English track read |
| geekism | 16 | [🎥 All Together Now \| Let's Play The Movies #16](https://www.youtube.com/watch?v=QvV61W2MfQ4) | 38:13 | full available automatic English track read |
| geekism | 17 | [🎥 Space Fighty Guys \| Let's Play The Movies #17](https://www.youtube.com/watch?v=_FAtFmUPGwE) | 35:23 | full available automatic English track read |
| geekism | 18 | [🎥 The Biggest Day In The World \| Let's Play The Movies #18](https://www.youtube.com/watch?v=2I3o1HxAo_c) | 36:55 | full available automatic English track read |
| geekism | 19 | [🎥 The Grave Digger \| Let's Play The Movies #19](https://www.youtube.com/watch?v=gm56uYTSypo) | 46:07 | full available automatic English track read |
| geekism | 20 | [🎥 Love The Sinner \| Let's Play The Movies #20](https://www.youtube.com/watch?v=GK-HG5mMRKA) | 38:53 | full available automatic English track read |
| geekism | 21 | [🎥 Detroit Crime City \| Let's Play The Movies #21](https://www.youtube.com/watch?v=pKg080DMt3k) | 32:03 | full available automatic English track read |
| geekism | 22 | [🎥 The Search For Cagney Malone (Part 1) \| Let's Play The Movies #22](https://www.youtube.com/watch?v=yUt4VGT-9AI) | 33:38 | full available automatic English track read |
| geekism | 23 | [🎥 Double Feature! \| Let's Play The Movies #23](https://www.youtube.com/watch?v=Fgjy7fivzCw) | 29:35 | full available automatic English track read |
| geekism | 24 | [🎥 Love On Horseback \| Let's Play The Movies #24](https://www.youtube.com/watch?v=bp4-4lOKgA4) | 38:10 | full available automatic English track read |
| standalone | — | [Foredoomer — The Movies longplay](https://www.youtube.com/watch?v=_BRrABJXZCA) | 3:52:10 | unavailable; no audio listening |
| standalone | — | [Call Me Kevin — The Movies](https://www.youtube.com/watch?v=GNA4MAzei4s) | 25:51 | full available automatic English track read |

## Retained detailed reports — self-contained evidence archive

The following are the original final research narratives, reproduced to preserve the expensive episode-level work. Their source-relative Markdown links now point to the immutable research commit. Heading levels are adjusted for this single-file edition; substantive wording is retained. Local screenshot paths are historical evidence locators, not files added to this repository. Follow the source register for downloadable manifests and hashes.

The reports distinguish commentary, visual observations, inferences and unknowns at the individual finding level. Earlier provisional wording is retained where a later checkpoint corrects it; the consolidated corrections above and final focused checks govern. Suggested implementation consequences remain proposals. None is proof that the current reconstruction already behaves that way.


## Retained report A: Coordinator questions and proposed acceptance sequences

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/COORDINATOR-ANSWERS.md).

### Coordinator answers — live evidence packet

Responds to [PR13 request](https://github.com/HSpector1/the-movies-rea-research-20261014/pull/13#issuecomment-6388163786). **All requested episodes have sampled visual coverage; some requested behaviors remain unobserved.** The request was made at CP593/CP594. Latest remote main observed during final preparation is CP597, 786701a2c62fcaa7351237b39003914f3f77987d (source documentation); no new gameplay acceptance is inferred from that advance. This packet supplies independent player-visible evidence, not current-code acceptance or native matrix interpretation. Existing selection storage and release-time marketing debit are coordinator-qualified; do not repeat those investigations.

#### 1. Crew and equipment lifecycle — not yet established end to end

[LONGPLAY.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/LONGPLAY.md) has readable expansion-only witnesses at1:00:00 (casting counters),2:00:00 (travel/wait statuses, shooting schedule, Extras2/Crew4) and3:00:00 (rehearsal). These isolated samples **do not establish** equipment appearance timing, carry versus stationary operation, teardown, bone attachment, or arrival-triggered behavior. Focused Flabaliki episode 1 footage at [13:40–15:40](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=820s), 120 inspected one-second frames, resolves the gesture: at 13:48–13:49 the held film token is over Shoot It, then the player pans away to decorate. Assembly and teardown remain off camera. The early edition was reported base game but installation is unverified; episode 7 narrator explicitly says he has just acquired Stunts & Effects; episode 16 visually confirms a Stunt Doubles zone. Do not invent missing transitions from still endpoints.

Expansion-only close-up: [Foredoomer2:32:00–2:32:06](https://www.youtube.com/watch?v=_BRrABJXZCA&t=9120s), six inspected 720p frames, shows a crew member holding a boom pole while changing posture/location. [LONGPLAY-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/LONGPLAY-coverage.json) pins the frames. This is not a camera spawn/teardown witness or proof of native bone attachment.

A second bounded check reused [Geekism episode 6,18:00–19:15](https://www.youtube.com/watch?v=KKMXXE9nosY&t=1080s): all 75 one-second 360p stills inspected, [pins](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/CREW-FOCUS-coverage.json). Reported base game, normal play before attempted staffing mod. The camera moves from casting to desert, rotates/zooms, then visits western-set maintenance. It does **not** supply a legible uninterrupted same-production equipment lifecycle. Nominal offsets are clip-relative, not frame-exact synchronized. This candidate is now checked; do not repeat it expecting to resolve spawn/teardown timing.

Proposed acceptance after source qualification: assign the required film personnel, invoke Shoot It, follow their travel and individual waiting states, observe equipment through filming and next-scene travel, then verify completion clears production occupancy. Missing crew and occupied sets require separate refusal/resumption witnesses. This is a requested route, not a verified complete oracle yet.

#### 2. New studio to commercial release — usable route with gaps

[Flabaliki episode 1](https://www.youtube.com/watch?v=EALqGBsuoQ8) is reported base game; narrator identifies Premier Edition but is uncertain about package contents. A widescreen modification is disclosed in episode 2. Full episode 1 automatic captions and38 sampled frames inspected; no audio listening. Evidence and SHA256 pins: [FLABALIKI.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI.md).

| Step / source time | What is established | Acceptance use and remaining gap |
|---|---|---|
|1:30–2:00|Create Your Studio form, Skip Tutorial checkbox, paused January1920 empty lot.|Create studio and reach paused lot; starting150k is commentary, not a separately pinned balance oracle.|
|2:55–5:00|Scaffolds; gate Create Builder/Janitor and Stage School Create Actor/Extra/Director receiving zones.|Recruit through physical assignment destinations. Drag gesture is described in captions; every mouse-down/drop is not sampled.|
|8:00–12:00|Five genre zones and Script Pool, writing/progress, practice balloons.|Assign writers and choose genre, then move completed script to casting. Transfer gesture and exact completion instant need dense pin.|
|12:20|Director, Lead Role, Extras, Crew, Rehearse, Shoot It floor labels.|Fill script-specific roles. Narrated requirement is2crew+1extra+lead+director; do not make universal.|
|21:25–22:00|Production Office Release/Reviews/Archive/Post Production destinations; generated black-and-white playback.|Completed movie enters production-office workflow. Opening Post Production and editing are **not** established in this interval.|
|22:39–23:00|Release breakdown and production effects table.|Check separate movie breakdown and staff/cost/duration receipt. Example observed cost13493, duration8Months, visible director/lead/extra wages4389/3780/1109; those three wages are not total cost.|
|23:05–24:00|Narrated earning-until-finished/archive route; visible released-film money icon.|Revenue phase exists. Exact earned amount, decay curve and archive drag are not visually proved by these samples.|

Independent acceptance should reproduce the visible sequence using actual UI, preserving persistent film/person identities and a playable finished film. It must separately add readable revenue and archive witnesses, mandatory-versus-optional postproduction, and continuous shooting transitions. These gaps prevent calling this a fully demonstrated cold-start-to-archive acceptance pass. Episode 8 at15:16–15:17 adds a dense visual archive witness: film token over green Archive, followed by Archive Progress (10 inspected one-second frames, pins in FLABALIKI-coverage.json). This is after episode 7 explicitly declares expansion installation; it cannot silently close the base-game visual gap.

#### 3. Paid marketing admission, cancellation and debt

**Resolved UX distinction:** [Geekism episode 15,21:52–21:58](https://www.youtube.com/watch?v=0LkaktPW3qg&t=1312s), readable360p tooltip, explains that either the movie or one of its stars can be dropped into the Publicity Office for PR; marketing allocation instead occurs at the Production Office. It advises matching public awareness to movie quality. This corrects the earlier caption-only interpretation that the film must be dropped onto a star. Reported base-game series; episode 2 restarted normal play. This is an in-game tooltip observation, high confidence for the visible instruction, not a native eligibility predicate or measured effect formula.

Retained pin: `geekism/15.tooltip.1315.jpg`, SHA256 `b328234416cd2f803d32f4b513e556f803fc179fb0ccee672ab0a2b0cdeac64c`; adjacent1312/1318s pins corroborate. Production Office floor at21:41 changes the Release destination to Release Budget; exact costs/payment/cancellation are not observed in this narrow sample.

Small implementation/acceptance consequence: distinguish a Publicity Office publicity action from Production Office paid-release budgeting in player guidance and receiving-zone behavior. Prerequisite: coordinator's existing marketing selection/debit infrastructure and separately verified facility admission. Test two eligible input types (film and that film's star) against the publicity route once those predicates are qualified. Do not infer that any star, any building state or any stage of production is eligible from this tooltip alone.

**Resolved visible refusal:** [Geekism episode 23,13:39–13:45](https://www.youtube.com/watch?v=Fgjy7fivzCw&t=819s) shows the film held over the office's PR floor, a maximum-PR refusal, and the film still held as it returns toward Production Office. Pin `geekism/23.message.821.jpg`, SHA256 `f4dcf1524f838f4676eebb3d480c099252988fb8eedffa5589c9600f42938cd3`; four focused 360p pins inspected. **Edition caveat:** episode 20 attempted a staffing mod, effectiveness uncertain; this is a visible refusal in that installation, not proof of pristine retail constants. [GEEKISM.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM.md) and [manifest](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM-coverage.json) retain source details.

Small acceptance task once the existing PR cap is independently qualified: dropping an already-capped film on PR must refuse without consuming the held film or visibly starting a fresh PR task. These stills do not establish money changes, cancellation semantics or the numeric cap. Commentary that awareness stays low despite capped PR is separately qualified; do not merge the two quantities.

**Still unresolved:** insufficient funds/debt, cancellation/back navigation and precise PR commit timing. No successful purchase from a wealthy studio establishes affordability policy. All 24 Geekism episodes have now been reviewed; episodes 16–17 exact admission claims remain caption-based or insufficiently readable, despite completed sampled visual coverage. Existing native selection/debit rules remain separate from these unknowns.

#### 4. Editor and unsaved viewing

[KEVIN.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/KEVIN.md) and [coverage pins](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/KEVIN-coverage.json): edition unknown, edited recording; complete automatic captions plus116 visually inspected sampled frames, original audio unlistened.

-0:55/1:17: Advanced Movie-Making metadata and role slots;9:00/19:47/22:00 show disabled supporting slots.20:00 shows scene preview, timeline and a Disturbance slider. These support visible editing controls, not their save semantics.
-21:37–22:00: generated romance script is subsequently open in the editor; commentary says it was edited. This supports generated-script editing as a player route, but not mutation during shooting or undo behavior.
-24:17–25:49: completed film playback has sequential sets and credits. Creator-added dialogue is not native speech synthesis evidence.
-Kevin does not establish entry/exit persistence, reordering/deleting, draft preview versus saved playback, export or soundtrack/voice controls. No existing editor code should be declared passing from these videos.

[FLABALIKI-LATE.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI-LATE.md) adds expansion-qualified working-draft continuity: episode 12 returns from costume selection to the same title/scene strip at~25:15, and episode 13 releases that film at~22:15. This proves visible working-context continuity, not disk save/load. Duplicate/delete gestures at episode 12~32:08–32:35 remain caption-supported; no successful export is shown.

Focused [Flabaliki episode 4,23:10–23:45](https://www.youtube.com/watch?v=tOEsrY44--c&t=1390s), 35 inspected 360p one-second frames, adds an actual postproduction editor witness: preview/shot strip at23:12; Sound Effects, Ambience and Mumbling switches at23:21; Title Style, Online Thumbnail and Advanced Features controls; expanded tracks at23:35; Save and Export Movie hover labels at23:38–23:40; return to lot/Post Production floor at23:42. Pin `ep04/postdense/frame_0012.jpg`, SHA256 `b7313054c05b16f2042bdd795831107a3caa5f6c4c125cb6d8e5060eeb6f3588`; full pins referenced in [FLABALIKI.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI.md). Early edition remains unverified. No actual export/save result or audible switch effect is established.

Proposed UI acceptance: enter Post Production with a completed film; expose distinct preview, shot strip, audio switches and Save/Export controls; exit back to the lot. Persistence and actual rendering/export require separate witnesses and local implementation tests. Do not conflate this editor with Advanced Movie-Making script authoring.

#### 5. Audio and long-term progression

Radio/music behavior remains **unverified**: original audio has not been listened to. Captions cannot establish sound mixing, interruption, pause behavior or lot/playback transitions.

All 24 Geekism episodes now have caption review and sampled visual coverage. [GEEKISM.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM.md) indexes award modifiers, unlocks, aging, retirement, staff sales and later constrained production; [coverage](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM-coverage.md) distinguishes caption claims from pixels. Key qualified routes: episode 13~6:24 loses a no-addiction award; episode 17~15:29 discusses retirement warning; episode 19~34:01–35:25 shows the retirement/departure sequence in commentary plus sampled views. Episode 1 sandbox differs from episode 2's normal-game restart, and episode 20 attempts a staffing mod. Do not treat temporary award behavior or mod-era staffing quantities as universal constants. Proposed acceptance: advance several award/research/aging cycles with ongoing films; test loss of earned modifiers and replacement staffing only against independently qualified rules. No audio acceptance is supplied.

#### Source and publication limits

Only original notes, source links and hashes are published. No raw footage, screenshots, full transcripts or proprietary assets are included. Auto-captions establish narrated claims; source pixels establish visible states; both can omit hidden rules. No engine runs, gameplay edits, provider/native acquisition, or coordinator HANDOFF/Git changes were made. Remaining questions will be narrowed using assigned footage; not seeing an event is not evidence the game disallows it.


## Retained report B: Flabaliki episodes 1–8

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI.md).

### Flabaliki Plays: The Movies — reconstruction evidence

**Timestamp audit:** episode 4 skipped HLS fragment16 and episode 5 fragment56. Their full durations show no evident compression, but retain acquisition-gap and visual-timing uncertainty; use the independently validated progressive focused clips for exact gestures. Episode 6 fragments59–66 were compressed out; its mapping is now corrected and missing/tail intervals repaired. See [FLABALIKI-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI-coverage.json), which embeds the timestamp audit, corrected episode6 pins and all focused pin manifests. Captions always retain original-source times.

Playlist [source](https://www.youtube.com/playlist?list=PLBzkzuo1WJnp9MXe5ZgABk4NACWJemqg2): 17 episodes, 30,978 seconds (8h 36m 18s) according to flat playlist metadata. This report completes assigned episodes 1–8 only; episodes 9–17 belong to a separate researcher. Eight episodes span about4h12m. 308coarse +178dense/repair frames =486inspected screenshots; seven full auto-caption tracks read, episode 3 English captions unavailable. This is systematic chronological sampling, not every-frame watching.

Method: local watch skill, automatically generated English original-language captions from YouTube, chronological still-frame sampling. No external model, speech recognition, or audio listening. Samples establish visible states, not every action between them. Original source timestamps are preserved. Raw screenshots/captions remain local; publish these original notes and source links only. Screenshot SHA256 hashes and paths are in each episode's `pins.json`; frame-to-source-time mappings in `watch-report.txt`. Local watch reports say captions unavailable because local media has no embedded subtitles; separately downloaded YouTube `en-orig` captions are the actual transcript evidence.

#### Episode 1 — startup and first production cycle

[Source](https://www.youtube.com/watch?v=EALqGBsuoQ8). Read full automatic caption transcript; inspected all 38 selected frames from 0–1809 seconds, normally every 60 seconds, with extra cues at 90, 175, 740, 1285, 1359 and 1736 seconds. No unviewed selected frames.

- Version: narrator says he does not have the expansion at [00:30](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=30), identifies Premier Edition at 00:51, then expresses uncertainty whether stunts is included. Early footage is reported as base game, with installation unverified; no executable version or installed expansion list is shown. The later playlist must not be treated as base-only: episode 7 explicitly announces installation of Stunts & Effects at00:15; later episodes 12/16 also contain expansion evidence reported by the separate late-episode researcher. Do not represent the packaging recollection as definitive version detection.
- New-game flow at [01:30](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=90), `ep01/.../cue_0002.jpg`: Create Your Studio has logo arrows, Studio Name (Flashy Films), Name (James Turner), Skip Tutorial checkbox and confirmation. [02:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=120), cue_0003, shows Jan 1920 and paused empty lot. Narrator gives $150,000 initial capital at 01:56; avoid treating later balance changes as isolated purchase prices.
- Construction and roles [02:55–05:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=175), cues0004–0007: stage school construction scaffold, gate recruitment floor with Fire/Create Janitor/Create Builder, then Stage School floor with Create Actor/Create Extra/Create Director/Fire. Commentary explains assigning waiting job applicants by dragging; an aspiring actor can be assigned janitor instead. Acceptance: job creation is an assignment action with role-specific receiving zones, not a fixed applicant occupation.
- Paths [06:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=360), cue0008: landscape tool exposes Delete Path: $5. This is an explicit displayed operation price; not proof of construction/refund formulas. Commentary: pathways connect building entrances; road tiles are decoration. Builders must construct placed buildings. Scaffolds persist while work progresses. Decoration shifts local red/green attractiveness indicators, according to commentary at 03:29; no quantitative appeal-radius formula established.
- Script development [08:00–12:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=480), cues0010–0014: Script Office floor has genre destinations (Action, Comedy, Horror, Romance, Sci-Fi) and Script Pool. Commentary identifies right-click skill inspection, choosing Action to match actor/director experience, assigning writers, progress, then transferring the completed physical script to casting. Idle stars can practice together on sets (commentary 11:20; practice balloons visible at12:00). Acceptance: personnel, script work and film work may proceed concurrently.
- Casting [12:20](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=740), cue0015: floor destinations show Director, Lead Role, Extras, Crew, Rehearse, Shoot It. Narrator specifies first film needs two crew, one extra, lead and director. A later script can rehearse without the missing extra (18:08 commentary), but filming waits. Crew/extra shortage and occupied set delay subsequent production; this is resource contention, not a global single-film limit.
- Amenities [13:00–18:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=780), cues0016–0021: restroom/snack van construction, basketball fixtures and outdoor furniture. Commentary and notifications ask for more restrooms/catering even with one already placed. Acceptance: model distributed facility demand; footage does not establish capacity, distance thresholds, or need rates.
- Production Office [21:25](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=1285), cue0025: receiving zones include Release, Reviews, Archive and Post Production. The player builds this only after filming completes. [22:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=1320), cue0026, shows the generated black-and-white movie playback. Movie-making is an observable product of the simulation, not merely a progress bar.
- Release [22:39](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=1359), cue0027: Officer Down, one-star script-quality display, director Jack Balding, and component label Mood + Experience + Genre Fit + Performance. Commentary then discusses novelty, set repair condition and public interest; those factors are evidence for a breakdown UI, not known mathematical coefficients.
- Explicit production accounting [23:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=1380), cue0028: release effects table shows production cost **$13,493**, duration **8 Months**, director wages $4,389, lead wages $3,780, extra wages $1,109, crew names, writer experience gains, stress/experience/star rating indicators. Acceptance: separate per-film cost/duration from studio cash; do not infer total cost by adding the three visible wage entries alone.
- Revenue/archive: narrator at23:05 explains released films earn until they stop, then are dragged to Archive. At24:00 cue0029, film money icon appears. This is commentary plus a visible released-film state; no box-office decay function is established.
- Set contention [24:00–27:00](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=1440), cues0029–0032: western/desert set placement and construction while another film occupies the existing set; commentary at24:32/26:53 states ready film cannot shoot until set becomes available. Acceptance: reserve shared sets and resume queued shoots when released. Irregular large footprints affect layout; cosmetic roads consume usable lot area.
- Awards/progression [28:56](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=1736), cues0034–0035: awards target Wannabe Big Cheese. Commentary reads requirements release5 movies, earn$500,000, combined movie star rating5; current2 released movies, almost$100,000 earned, combined1.3stars. The panel is visible but tiny; numbers here derive from caption commentary. Do not confuse earnings target with cash balance or rank with the upper-right studio ranking badge.

Unknown after episode 1: exact formula weights, build durations/costs, salary accrual rules, skill growth rates, applicant spawn rules, path-routing rules, utility capacities, genre trend dynamics, unlock calendar, awards schedule, postproduction editor and custom film authoring.

Local evidence pins (images remain local; hashes may be published):

| Source time | Local screenshot | SHA256 |
|---|---|---|
| 90s | `ep01/watch-ioni_zm_/frames/cue_0002.jpg` | `0c96582a533602e62a0310f21fb1999118e18e4d969af21e4ccfce0e07547dee` |
| 120s | `ep01/watch-ioni_zm_/frames/cue_0003.jpg` | `1482ed302b10f9af256724d631ea26235b38a3a80cf63f5bab32c9f4d925e933` |
| 180s | `ep01/watch-ioni_zm_/frames/cue_0005.jpg` | `823eb9b282211c0a31fb92de87b54fb808a92d55d533d9091e4304fd6cecdfe2` |
| 300s | `ep01/watch-ioni_zm_/frames/cue_0007.jpg` | `39b1e2e277d5df11841de0f10535a042a1d6375f2f9b1a1fbe50cd7ff6fe382a` |
| 740s | `ep01/watch-ioni_zm_/frames/cue_0015.jpg` | `f7e70572fd260366554ade40e52b9f75730497b1d1cb6561e7cfcd14a0b6f077` |
| 1285s | `ep01/watch-ioni_zm_/frames/cue_0025.jpg` | `7059d234cc1d2c210fcc924a623b2a6ffdfc057f4c7cf4857be282bf2d2ab99c` |
| 1359s | `ep01/watch-ioni_zm_/frames/cue_0027.jpg` | `0ca0de776a6e9c799dd90f1ed54649c4be87555198fbfae25650402025fc938f` |
| 1380s | `ep01/watch-ioni_zm_/frames/cue_0028.jpg` | `f5754a712628f424808945c6af6642a5d00d729514be19d0aa24482399f09395` |
| 1736s | `ep01/watch-ioni_zm_/frames/cue_0034.jpg` | `c45943cd7e88f66c63e0f6ddb6ad4ae3ef4d2425d8b55177e610f88059818bff` |

#### Implementation acceptance consequences from episode 1

1. A new studio can pause before time advances, place a building footprint, recruit builders, complete its scaffold and connect its entrance with a path. Calendar and cash remain visible throughout.
2. Applicant origin does not permanently lock occupation. Assign a waiting applicant to the appropriate role zone; preserve individual traits and genre experience.
3. A film moves through writing → casting/rehearsal → shoot → production-office release → revenue run → archive. Simultaneous films need separate people and available sets; occupied sets can block an otherwise ready shoot.
4. Release displays an actual generated movie and a rating breakdown, followed by per-film production duration/cost and staff effects. Preserve these as separate records from studio cashflow.
5. Decorations, amenities, moods, genre experience, cast fit and set condition appear as inputs or feedback; reproduce visible states without claiming numerical formulas established by this footage.
6. Milestone progress tracks released film count, cumulative earnings and combined film stars. An awards ceremony is a separate scheduled event.

#### Episode 2 — maintenance, customization, milestone versus awards

[Source](https://www.youtube.com/watch?v=st675uzmbDU). Full auto-caption track read; all 41 sampled frames inspected (0–1986s, one per60s plus cues). Native video is256×144, adequate for broad UI identity and layout, inadequate for most small numbers. Numeric and behavioral claims below remain explicitly commentary unless separately readable.

The studio continues with two released films, one filming and a horror script. Visible states span construction, cast assignment, generated-film playback, makeover editor, practice balloons and the Achievement Awards interface. [14:00](https://www.youtube.com/watch?v=st675uzmbDU&t=840), cue0017, shows a separate Makeover Department screen with a full-body model, Clothing/Cosmetics lists, costume cards and confirmation control. Commentary from12:46–15:49: actor-to-director conversion upsets the star; a manual makeover worsens image/mood; automatic makeover later improves it. Acceptance: makeovers have a preference-dependent outcome, not an unconditional happiness bonus. Narrator says wide-screen was hacked at13:23; observed clipping may be display modification rather than authentic base UI layout.

[16:08](https://www.youtube.com/watch?v=st675uzmbDU&t=968) commentary describes assigning stars to chat to improve relationships. [17:31](https://www.youtube.com/watch?v=st675uzmbDU&t=1051) states this sci-fi script needs no extras, unlike episode 1. [18:00–18:35](https://www.youtube.com/watch?v=st675uzmbDU&t=1080) describes Finance individual/all salary nudges and mood/rating effects; exact salary formula is unknown. [18:40](https://www.youtube.com/watch?v=st675uzmbDU&t=1120) archives a film whose earnings have ended. [21:35](https://www.youtube.com/watch?v=st675uzmbDU&t=1295) distinguishes an actor's regular occupation from directing one film. Repeated casting should support role assignment with experience/fit feedback.

[24:24](https://www.youtube.com/watch?v=st675uzmbDU&t=1464) commentary identifies Studio Charts comparisons by movies, prestige and capital. [25:21](https://www.youtube.com/watch?v=st675uzmbDU&t=1521) places stars on a set to practice comedy before casting; colored practice balloons appear at26–28minute samples. [29:18](https://www.youtube.com/watch?v=st675uzmbDU&t=1758) reads a review criticizing the actor's overexposure. This suggests repetition feedback, not a measured penalty function.

[30:00](https://www.youtube.com/watch?v=st675uzmbDU&t=1800), cue0036, visibly shows **Achievement Awards / Wannabe Big Cheese**, including a Custom Script Office reward. Commentary at29:34–30:07 initially confuses this with the upcoming ceremony, then corrects it. Next title requirements are said to be a two-star star, two-star film and two-star studio, unlocking Forest Set. The separate Lionhead Motion Picture Awards take place around30:12–30:46; narrator wins nothing. At32:00, cue0038, the Custom Script Office footprint is visible; actual custom writing is deferred. Acceptance: milestone unlocks, scheduled competitive awards, and construction availability are distinct states.

Commentary at05:23 reads approximately$17,000 productioncost and9months; lowresolution sampling did not capture a readable accounting screen, so this is not an exact verified cost. Detailed caption-only cue notes remain in EP02-CAPTION-NOTES.md; the initial download gap recorded there has now been resolved by the41frame sweep.

| Source time | Local screenshot | SHA256 |
|---|---|---|
| 840s | `ep02/watch-u2v3psud/frames/cue_0017.jpg` | `3ab261e2810b849660e771c5b6ce3fb18b73ba79e3c6155a288d0536f01449eb` |
| 1800s | `ep02/watch-u2v3psud/frames/cue_0036.jpg` | `9178356fff4a75da420d2bb13daa024daf2c09c05451387abc8da5cc13ac7fda` |
| 1920s | `ep02/watch-u2v3psud/frames/cue_0038.jpg` | `b0059fb6deea51683bda2b1f673fda0e74d366275bbbfa5174117fdc23c8f9e5` |

#### Episode 3 — custom movie authoring

[Source](https://www.youtube.com/watch?v=apu4o5MEluI). All 39 selected frames inspected across0–1894s (60s cadence plus cues). Native144p; readable headings and broad editor structure only. **English captions unavailable**: both en-orig and en requested separately; extractor reported no requested-language subtitles. No speech-model fallback or audio listening. Accordingly the following is visual observation; no narrator claims are reconstructed.

- [01:30](https://www.youtube.com/watch?v=apu4o5MEluI&t=90), cue0002: Advanced Movie-Making dialog, screenplay **Charlotte The Starlet**, genre/structure choices and role assignment with red/green/blue mannequin silhouettes. The cast slots are Lead and Supporting positions. This is a separate authoring setup from recruiting actual studio personnel.
- [02:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=120), cue0003: large desert-set preview above a bottom storyboard/timeline of shot cards, staff portrait column at left and tool buttons at right. [02:55](https://www.youtube.com/watch?v=apu4o5MEluI&t=175), cue0004: shot-picker grid with named scene templates and filter/search controls, overlaid on a saloon set. Readable examples include Enter Carry, Exit Carry, Bar Chat Up, Walk Flowers and Flower React.
- [03:00–05:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=180), cues0005–0007: saloon preview and growing bottom shot sequence; scene chooser then previews colored mannequin figures. A progress indicator on the preview is visible at05:00, but its exact meaning is not established from a still.
- [06:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=360), cue0008: selected **Enter Carry** scene has lower controls including an emotion variant reading **Romantic Angry**. [07:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=420), cue0009: **Couple Argument** preview with colored role mannequins and many shot cards. [08:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=480), cue0010: **Death In Arms** preview, lower timing/playback slider and confirmation control. Acceptance: authoring should preserve ordered shot templates, set assignment, role mapping and per-shot variants, then generate a script that can enter the studio production loop. These samples do not establish drag gestures or all available parameters.
- [09:00–20:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=540), cues0011–0023: returns to studio, casting floor and shoot/rehearse zones; builds another office and another saloon-style set, staff speech/status balloons appear during assignment. Broad continuity shows the authored script sits within the same management simulation; screenshots do not alone prove which film is being assigned in every intervening action.
- [21:00–24:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=1260), cues0024–0028: studio work and a visible placement boundary/construction activity. [25:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=1500), cue0030: full film-review page with multiple review snippets. [26:00–31:00](https://www.youtube.com/watch?v=apu4o5MEluI&t=1560), cues0031–0037: production-office film actions, outdoor amenities/placement and studio overview; no exact prices or ratings are legible enough to report. End card at31:34.

Unresolved: precise authoring entry gesture, shot insertion/reordering, saving/validation, budget formula and how the chosen template's cast maps to studio actors. English caption absence limits explanation of the editor demonstration.

| Source time | Local screenshot | SHA256 |
|---|---|---|
| 90s | `ep03/watch-kfyuhw6a/frames/cue_0002.jpg` | `f8e094e9c1bd9a9af54fab5752ffde034d10af9194fbfd37e2af76f67913cb7d` |
| 175s | `ep03/watch-kfyuhw6a/frames/cue_0004.jpg` | `e89a828fe7a469957b3ac1cedea59b69528871709f9c650bf7d6c062b5be2378` |
| 360s | `ep03/watch-kfyuhw6a/frames/cue_0008.jpg` | `9720909bf1c85dfd7b332968228b3e67b36278f605a299a0c2e29134f7882e06` |
| 420s | `ep03/watch-kfyuhw6a/frames/cue_0009.jpg` | `48acca656ff2c01691d4210dff20c5619aa9ec9deb880c6c9d281498388c1624` |
| 480s | `ep03/watch-kfyuhw6a/frames/cue_0010.jpg` | `7181180e7070ca2c7b0f2af39b01770bbb41df5e1d6c16732c2c289aa7ba7be4` |

##### Focused episode 1 shoot witness and gesture route

Downloaded only original[13:40–15:40](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=820) at640×360; extracted1frame/second and inspected all 120frames. Nominal original-source offset820s, approximately1s sample uncertainty. `ep01/shootdense/pins.json` gives all source-time/file/SHA256 pins. This is dense sampled evidence, not continuous-motion watching.

At827s the Casting Office opens with Shoot It / Extras1/1 / Crew / Begin Casting / Lead Roles / Director. At828–829s a physical film/script token is held over **Shoot It**, then at830s the camera pans to the stage set and token disappears from the office. The staff portraits leave the left roster's active arrangement as time progresses. **The player then pans away and spends most of the next110s decorating, inspecting applicants and starting another script.** This clip consequently does not witness crew assembly, equipment deployment, a shot, next-set travel or teardown. Do not fill this gap with an invented animation sequence. A first-film ShootIt→film-in-progress transition is supported; all finer staging remains unresolved.

Useful visible prices are tooltips, not cash-difference estimates: at850s Basketball Hoop$1,000;851s Park Bench$100;852s Bath$150;856s Sleek Statue$300;917s Snack Van$3,000;918s Basic Script Office$6,000;919s Makeover Department$7,000;920s Small Restroom$3,000;926s Tiny Palm Tree$170. These are this early-era studio's catalog values, not proof of prices throughout all eras or game modes.

A compact reproducible acceptance route, supported by episode 1 with the marked sampling gaps:

| Step | User gesture / receiving zone | Visible result and source witness | Gap |
|---|---|---|---|
| New studio | Enter studio/name, choose logo, confirm SkipTutorial | CreateYourStudio90s→pausedJan1920lot120s | Exact confirm-click not in60s sample |
| Construction | PlaceStageSchool footprint; drag applicants toCreateBuilder/CreateJanitor | Scaffold175s; recruitment floor180s; completedStageSchool240s | Pathfinding/build-time formula unknown |
| Stars | Dragapplicant toStageSchool CreateActor/CreateDirector/CreateExtra | Rolezones300s; starportraits appear | Each individual drop not sampled |
| Write | PlaceBasicScriptOffice; dragwriter toAction and others tosamewriting work | Caption498–507s; ScriptOffice genre floor visible600s | No writer productivity formula |
| Cast | Dragcompletedscript toBeginCasting; assignDirector/LeadRole/Extras/Crew | Castrequirements and receivingzones740s | Some autoassignment not distinguishable |
| Rehearse | Filled cast progresses towardShootIt availability | Caption signal824–827s; film tokenready827s | No dense rehearsal-start witness |
| Shoot | Pick upfilm token and dropoverShootIt | Dense828–830s token/zone→officeexit | Camera pans away; crew/equipment staging unobserved |
| Release | BuildProductionOffice; dragfilm toReviews/Release | Office1285s; movieplayback1320s; Release1359s; accounting1380s | Intervening selection steps sampled |
| Earn/archive | Leave releasedfilm active; dragtoArchive afterearningsend | Commentary1385–1391s; releasedmoneyicon1440s; episode 2 archivecomment1120s | Boxoffice curve and exact expiryunknown |

Best next focused witness if crew-staging detail is still required: episode 2[18:50–20:00](https://www.youtube.com/watch?v=st675uzmbDU&t=1130), where commentary says the sci-fi film is sent to shoot and a star arrives at the sci-fi set (19:36). Existing60s samples show the set but do not establish the full staging sequence. This is a candidate interval, not newly inspected dense evidence.

#### Episode 4 — trailers, research, intermediate writing and postproduction

[Source](https://www.youtube.com/watch?v=tOEsrY44--c). Full en-orig automatic captions read; all 39selectedframes inspected across0–1917s at60s cadence plus cues. Native144p: broad UI/states visible; numbers below are commentary, not precise pixel measurements.

[00:36–03:06](https://www.youtube.com/watch?v=tOEsrY44--c&t=36): plays the previously authored Charlotte The Starlet. Samples60/90/120/175/180s show the generated black-and-white movie. Narrator notices actors changing between shots at01:25/02:03 and resolves to keep the two main roles consistent next time. This is evidence of an authoring consistency problem in this player's film, not proof of an unavoidable engine bug. Acceptance: scene-template role indices must map consistently to intended cast across all shots; changing outfits should remain distinguishable from changing identity.

[03:16–09:00](https://www.youtube.com/watch?v=tOEsrY44--c&t=196): builds additional rickety trailers, connects paths, then assigns individuals to trailers (08:40–08:55 commentary). At13–14min samples green outlined private trailer areas and hedges are visible. Captioned click-and-drag at13:12 moves a decoration; holdingShift at13:40 allows free placement. Acceptance: trailer ownership and area prestige are individual-star concerns; landscape objects support moving rather than mandatory delete/rebuild. Exact trailer-area bounds and prestige formula unverified.

[06:52–07:26](https://www.youtube.com/watch?v=tOEsrY44--c&t=412): Research Lab was built but unstaffed; hires scientists and puts one in each of MainstreamPacks/MovieMaking/Stars/Studio. Narrator says up to six scientists. Research assignment floor appears in07minute sample, cue0009. At19:12 commentary lists new Intermediate Script Office, Post-Production, two-color film and synchronized sound. These arrive together during play; evidence does not isolate which unlocks come from calendar versus research.

[09:25](https://www.youtube.com/watch?v=tOEsrY44--c&t=565): constructs Rehab; repeated drinking/stress later interrupts star work. End commentary at31:25 says only one person can be in rehab at a time. This is a capacity claim from commentary, not a measured recovery-duration rule. [10:36](https://www.youtube.com/watch?v=tOEsrY44--c&t=636) shoots an already cast film; [11:19–12:30](https://www.youtube.com/watch?v=tOEsrY44--c&t=679) chats/makeovers before casting another film. Stars can take leisure trips despite film assignments; narrator manually redirects them to set at24:35 and26:20. Do not implement casting as immediate teleport to shooting position.

[19:12–20:26](https://www.youtube.com/watch?v=tOEsrY44--c&t=1152): new building tier becomes available; player sells the Basic Script Office around20:14 and replaces it with an Intermediate Office on the same site, then places Post-Production elsewhere. Exact sell gesture was not isolated in60s samples. Samples20:00/21:00 show footprint/construction transitions. At21:42 commentary says new office allows better scripts; at24:26 writing exceeds one star; at27:04 calls the new film the first two-star script. No cap/productivity formula follows.

**Postproduction route:** [22:57](https://www.youtube.com/watch?v=tOEsrY44--c&t=1377) commentary explicitly drags a completed film into the finished Post-Production Office. Tutorial says it edits/enhances and exports files. Samples22:39/23:00 fall in loading/transition, rather than a readable full editor. At23:19–23:41 narrator inspects Audio Options, online thumbnail, Advanced Features and Export then backs out. At23:50 he sends the film to Release. He corrects his prior expectation that this building automatically improves the movie; footage must not be summarized as a passive rating boost. Acceptance: explicit editing/export workspace, return to management, then explicit Release action. Exact menu gesture chain is caption-supported; editor layout requires a higherresolution focused cue if implementation needs it.

**Revenue/archive:** [26:44](https://www.youtube.com/watch?v=tOEsrY44--c&t=1604) says ready forArchive and removes that film; [28:35](https://www.youtube.com/watch?v=tOEsrY44--c&t=1715) archives another then releases the newly completed film. [30:11](https://www.youtube.com/watch?v=tOEsrY44--c&t=1811) compares active films' earnings (one around$182,000). Small figures are not readable at144p, so no exact-revenue claim. Two-star studio occurs about30:03. Notifications at30:38 mention new props and Suburban Living Room set; causal unlock source remains uncertain.

| Source time | Local screenshot | SHA256 |
|---|---|---|
| 420s | `ep04/watch-coyszvkl/frames/cue_0009.jpg` | `6178c52b6f7372f30d8b93019a563d0decd30fa8a0cc6dbd3056617c821501db` |
| 840s | `ep04/watch-coyszvkl/frames/cue_0017.jpg` | `6076c5570285b65817624f3ed986f1cb3b5c70d86aae470357ffb58369f03e8e` |
| 1020s | `ep04/watch-coyszvkl/frames/cue_0020.jpg` | `f0d0e3904b8ff6486058687d0562363ead75faeb506f58c19fd96da52a05a135` |
| 1200s | `ep04/watch-coyszvkl/frames/cue_0023.jpg` | `a6af17235535c35a0847a79d54a93527f10e31d983304f407e37328084b1db7f` |
| 1359s | `ep04/watch-coyszvkl/frames/cue_0028.jpg` | `394dbb27e779f8a86d709b9604fd38fe302774d8ad03e4cf600f2a3650a1f540` |
| 1380s | `ep04/watch-coyszvkl/frames/cue_0029.jpg` | `3f682eed1254c4fbb131a4a1c106d0b19ded439cdc038c3cb58165a19a520c9d` |
| 1740s | `ep04/watch-coyszvkl/frames/cue_0035.jpg` | `b6bb1b3e4812bacb616739c65dab2116793bd7aad0af518db537b23653ead3b7` |

#### Episode 5 — demand, entourage, replacement buildings and cashflow

[Source](https://www.youtube.com/watch?v=ISF8wILUxDI). Full en-orig auto-caption track read, including separately retrieved1031–1167s text after output truncation; all 46selectedframes inspected across0–2316s. Native144p. Intro0–118s is explicitly an edited/sped-up trailer-layout rebuild, so it cannot establish normal action or construction duration.

- [02:08](https://www.youtube.com/watch?v=ISF8wILUxDI&t=128): narrator right-clicks Script Office to see **genre interest**; romance currently popular, later sci-fi/action rise. This is a demand/time-dependent view distinct from personal genre experience. At18:08 suggests keeping writers practicing even if scripts are sold rather than produced; no sales-price formula shown.
- [02:46–03:55](https://www.youtube.com/watch?v=ISF8wILUxDI&t=166): adds entourage. Tooltip commentary states assistants follow stars, improve rating/mood, bigger stars want larger entourage, and using applicants leaves fewer people for other jobs. At16:40–17:00 discovers all crew already committed to two films and cannot spare one. Acceptance: entourage consumes actual recruitable personnel, not a free cosmetic counter; assignments compete with production labor.
- [04:20–13:30](https://www.youtube.com/watch?v=ISF8wILUxDI&t=260): new Cheap Trailer tier appears just after rebuilt Rickety Trailers. Samples10–13min show green owner areas, furniture being moved, scaffold/replacement trailer and placement conflicts. Commentary notes footprint uses same overall area but doorway orientation differs; area outline must still cover decorations. Visible green area/placement boundaries support owner-area feedback; exact dimensions are not established.
- [06:19](https://www.youtube.com/watch?v=ISF8wILUxDI&t=379): romance casting has lead+supporting+director, showing scripts can require multiple principal roles. At09:10 tries to put a third practice participant on set and is refused; two already practicing. This demonstrates local practice occupancy in that situation; avoid assuming universal capacity for every set.
- [14:18–16:00](https://www.youtube.com/watch?v=ISF8wILUxDI&t=858): tries new bathroom/War Bomb Street sets. War Bomb Street has an unexpectedly huge irregular footprint and cannot fit near existing road/trailers. Does not build it here. This is a demonstrated failed placement, not evidence the set is absent from the base catalog.
- [19:09](https://www.youtube.com/watch?v=ISF8wILUxDI&t=1149): fires persistently stressed director after rehab/makeover attempts. At21:12 hires replacement with horror/sci-fi experience and positive traits; Finance pay adjustments follow. Production depends on individual persistent state, not an interchangeable director slot.
- [25:44](https://www.youtube.com/watch?v=ISF8wILUxDI&t=1544): Finances chart compares Income/Expenditure/Balance; narrator hides Balance for closer comparison. At26:00 screenshot cue0031 shows falling black income curve crossing above a nearly flat red expenditure line then dropping below it. **This is the chart's plotted history, not enough to derive economy rates.** Acceptance: distinguish account balance from period income/expenditure; production delays can create cashflow pressure even with many completed scripts.
- [27:24](https://www.youtube.com/watch?v=ISF8wILUxDI&t=1644): Restaurant unlock is described as reducing stress without getting stars drunk. At27:40–29:24, completed cast lacks enough crew; narrator finds some idle crew unassigned, assigns them, but a further movie remains short and he stops casting it. This supports explicit resource requirements/assignment feedback, not automatic global crew sharing.
- [31:00–33:20](https://www.youtube.com/watch?v=ISF8wILUxDI&t=1860): stars take drink/food breaks while expected on set; studio rating falls below two stars as capital declines (causation is narrator inference). [34:14–37:38](https://www.youtube.com/watch?v=ISF8wILUxDI&t=2054): releases two films described as above two stars and watches their generated playback, now with less washed-out/tinted imagery and sound/music. Do not attribute the improvement to one upgrade alone; script, cast, moods and technology all changed. At38:00 reports revenue/balance spike after releases. Screenshot cues0041/0043 show actual films, cue0042 shows milestone panel. No exact gross/profit figure is readable.

| Source time | Local screenshot | SHA256 |
|---|---|---|
| 660s | `ep05/watch-3rm8x4fr/frames/cue_0013.jpg` | `f3f81f6eef13e73cafb8ad3734f6f567ba89a7e6e735ca94e2ae0c1f8d1da225` |
| 780s | `ep05/watch-3rm8x4fr/frames/cue_0016.jpg` | `265e49eda42b49d220614d52f8567a4bdbd9db83651619537d853b704d7ec2f0` |
| 1560s | `ep05/watch-3rm8x4fr/frames/cue_0031.jpg` | `39560460a56f53c7ef6a2c0923a4b3c1b54c8c8b49b5d953ef056662b8ee43ae` |
| 1740s | `ep05/watch-3rm8x4fr/frames/cue_0035.jpg` | `74d2e6e5646f7931089cf94419100c10ddbea6f94c8c0591545ab613320874f8` |
| 2100s | `ep05/watch-3rm8x4fr/frames/cue_0041.jpg` | `f485f1f7992a83a755e8b46725881a0f77aae8cd9bff515c74b8ee05330fbd39` |
| 2160s | `ep05/watch-3rm8x4fr/frames/cue_0042.jpg` | `50475ca272e357753c5a581e76c505c48f7c962cd1127bb4048429daad17c71c` |

##### Focused episode 4 postproduction pixels

Revisited only[23:10–23:45](https://www.youtube.com/watch?v=tOEsrY44--c&t=1390) at640×360,1fps, all 35frames inspected. `ep04/postdense/pins.json` records nominal source timestamps and screenshot SHA256. At1392s the editor is open for **Alien Lives Forever!**, with preview at00:00:00, shot-card strip below and vertical toolbar at right. Most preview pixels are black at this playhead; this is observed and should not be described as a rendered image failure without more evidence.

1397s opens Tutorials (chapters1–5). 1401–1402s opens **Audio Options** with checked **Toggle Sound Effects On/Off**, **Toggle Ambience On/Off**, **Toggle Mumbling On/Off**. Hover labels identify **Change Title Style** at1405s, **Online Thumbnail** at1410s, **Advanced Features** at1414s. At1415s the lower panel expands to additional tracks with a text item reading **Centre Of The Earth**. **Save** hover appears1418s, **Export Movie**1419–1420s. At1422s returns to lot, where a single large **Post Production** receiving floor is visible. This closes the editor-layout uncertainty from the coarse sweep, while save/export dialogs and actual audio editing remain untested.

| Source time | Local screenshot | SHA256 |
|---|---|---|
| 1392s | `ep04/postdense/frame_0003.jpg` | `450dcb57c1bc4283806f23a4f729659c051ed14841cf8db0cb6222f06a4b3e71` |
| 1401s | `ep04/postdense/frame_0012.jpg` | `b7313054c05b16f2042bdd795831107a3caa5f6c4c125cb6d8e5060eeb6f3588` |
| 1410s | `ep04/postdense/frame_0021.jpg` | `636a397431ee6af87da648b75333827b63cdfac9dcc209c033518b1196377c67` |
| 1415s | `ep04/postdense/frame_0026.jpg` | `bf4cbb716b328d9a40fcbf519f57f28083719cc4ce0b6764136507e4bdfc9a19` |
| 1419s | `ep04/postdense/frame_0030.jpg` | `5cebd233573accad6775e85379738e45ae7ed03c5fea7fd3db956b6300899b91` |
| 1422s | `ep04/postdense/frame_0033.jpg` | `80647b82e84e22b62ddf3165f574ba052428a4d8eef182c3476f07c5ffad9d14` |

#### Episode 6 — script sales, milestones, repair and separate profit

[Source](https://www.youtube.com/watch?v=1A9G7KEIzsI). Full en-orig captions read; all 41selected144p frames inspected. Acquisition audit found eight omitted HLS fragments: original309.333314–351.999978s, duration42.666664s. Manifest total2112.066535 minus omitted42.666664 equals local2069.399871 exactly. **Use `ep06/pins-corrected.json`, not local times in watch-report.txt**: local times before309.333314 are unchanged; later times add42.666664s. The missing interval and final30s have now been inspected from independent bounded progressive clips: nineframes across309–352s and fourframes across2080–2112s. See ep06/repair-pins.json.

[00:29–02:55](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=29): builds Star & Script Selling Facility to sell unused scripts. At02:50 narrator says the sale yields$5,000; local175s cue0004 visibly shows a **Sell** receiving floor. Amount is commentary; no general selling-price formula established. Script selling is distinct from releasing a produced film and from archiving an exhausted release.

[03:45–09:10](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=225): repeatedly redirects stars to sets, then restaurant for food/relationships, then back to film work. Commentary at05:32 reads stars uncomfortable with an intense social setting. Training is repeatedly assigned on actual sets. A film is on scene3of6 around08:40; script/film scene count varies rather than fixed4scenes. Publicity is arranged by placing paparazzi near stars at04:05 and15:45.

[12:43](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=763): next milestone requirements are **$1million sitting in bank**, **two Lionhead Motion Picture Awards**, **five films above two stars**, reward **Proficient Script Office**. Corrected cue0014/0015 at original762.666664/782.666664s show Junior Studio Manager then Promising Studio Manager pages; do not confuse the bank-balance condition with prior cumulative-earnings goals. Forest Set unlock and new set construction follow. Maintenance warning at16:49 says a facility may shut if not repaired; player adds builders around21:58, and caption at21:35 asks someone to fix an old set. Acceptance: construction and repair share available labor; worn facilities can block service.

[23:59–24:13](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=1439): reassigns an assistant to crew to cover a shortage; the star is unhappy about losing the assistant. This directly couples entourage and crew labor. [25:16](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=1516) says **assembling on set**. [27:39](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=1659): whole cast absent from two simultaneous romance productions, then redirected. This supports explicit waiting-for-cast states; current sampled frames do not prove equipment setup or teardown sequence.

[29:36–31:46](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=1776): chooses direct release rather than editing; Tender Spirit rating breakdown is visible around corrected1782.666664s in cue0035, followed by generated bathroom film playback. Script Quality, Movie Quality, Final Movie Rating are separately displayed. Commentary at12:13 reads another film's productioncost about$77,000 and11months; no readable exact accounting screenshot captured, so preserve as approximate commentary only.

[33:24–33:38](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=2004): opens Revenue and explicitly distinguishes **profit** of released films, including one newly released film still in the red. Narrator cites roughly$200k/$240k; exact values unverified visually. At34:43 predicts next ceremony1Jan1940 from currentJune1939. Archive reminder closes episode. Acceptance: film-level profit can be negative immediately after release; do not equate money-icon gross, profit and cash balance.

#### Episode 7 — explicit Stunts & Effects boundary; keep base claims separate

[Source](https://www.youtube.com/watch?v=8fZbtnWZJtA). Complete progressive360p source (no skipped fragments), full en-orig captions read, all 38selectedframes inspected across0–1822s. **At00:15–00:30 narrator explicitly says the Stunts & Effects expansion arrived and now adds new sets; installation is inferred from those statements and the later stunt-personnel discussion.** At06:50–07:00 identifies stunt doubles/stuntmen. This is the earliest explicit expansion-enabled episode found in this assignment. Episodes 1–6 remain reported base-game play with installation unverified; episodes 7+ cannot supply unqualified base-game-only requirements.

- [01:25–01:32](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=85): sells two unused scripts. Cue0002 at90s clearly shows Star/ScriptSelling building's **Sell** receiving floor and held script token. Acceptance: drag a physical script to Sell; this is a liquidation action, separate from ProductionOfficeArchive. It is shown after expansion installation, so verify base availability using episode 6 before treating the workflow as base evidence.
- [03:00–06:18](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=180): rehearses/practices comedy and waits for ceremony. At05:42 commentary says one award received, Highest Climbing Studio; at06:10 bonus activates free eating/drinking without addiction until next awards. Cue0008 at360s visibly lists PromisingStudioManager requirements: bank$1m, receive2awards, release5moviesabove2stars, ProficientScriptOffice reward. This is a competitive awards bonus in expansion-enabled play, not an unconditional base simulation rule.
- [08:00](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=480), cue0010: Casting floor has **two Lead Roles**, Crew3/3, Extras1/1 and Director, plus BeginCasting/ShootIt; narrator at07:44 explicitly says two leads and no supporting role. Cast schema must support multiple principal roles; exact requirements vary with script.
- [13:00](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=780), cue0016: readable StarSalaries table separates ranking, SalarySatisfaction, CurrentInfluence, FutureInfluence and AnnualSalaries. Total$130,000 at this moment; later27:00 total$150,000 and29:00 total$180,000. These are annual totals on salary UI, not instant cash costs or film budgets. Per-star plus/minus and all-star total controls visible. Later narrator unintentionally cuts pay, causing anger despite current satisfaction; do not assume mood depends only on the current displayed slider.
- [17:59–19:00](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=1079): returns to PostProduction, finds only editing/export useful, backs out without save. Then considers **selling the completed film for$7,000** but rejects it and releases instead. This is narrated rejected action; not a completed sale. [20:52](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=1252) says two old releases now need Archive; [23:20](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=1400) archives one. Cue0027 at1359s shows the recruitment floor/held person, not an archive gesture; the caption is the action evidence.
- [24:27–26:06](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=1467): manual Makeover screen now checks Fashion/Image bars and costume categories. Cue0030/0031 at25/26min shows clothing/cosmetic controls and **40s Evening Dress**, AllCostumes/Premium categories; confirms manual changes have visible preference feedback rather than arbitrary automatic benefit.
- [26:27](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=1587): hires a star from rival studio, negotiates salary and notes trailer need. [29:36–29:45](https://www.youtube.com/watch?v=8fZbtnWZJtA&t=1776): releases another comedy then ends. He explicitly says no substantive stunt/effects gameplay has been explored yet. Do not infer stunt mechanics from this episode's installation announcement.

Episode 6 local evidence pins (images remain local):

| Original source time | Local screenshot | SHA256 |
|---|---|---|
| 175s | `ep06/watch-ols_kmrd/frames/cue_0004.jpg` | `914a5c3708cf4f58aa7bc0923754b4d81d9f30af1365b050775bc063de2e219a` |
| 762.666664s | `ep06/watch-ols_kmrd/frames/cue_0014.jpg` | `a208cd46bbc686dadbb11020aba5ba22b1992171e52d2daa244e7eba14a6bbc9` |
| 782.666664s | `ep06/watch-ols_kmrd/frames/cue_0015.jpg` | `006a72a866b1a6f43e82b843864a0f3a95c787bde38b222c4ae19e5962952a65` |
| 1302.666664s | `ep06/watch-ols_kmrd/frames/cue_0024.jpg` | `de6ea5714b7eeb39258dce64cedc74e333bc771e1db8ca7aa9055167884cafca` |
| 1782.666664s | `ep06/watch-ols_kmrd/frames/cue_0035.jpg` | `371b3ba30d3b111ba230c98eb4ba98f762bc1672cc8546a9418c53c6d9ca90c9` |

Episode 7 local evidence pins (images remain local):

| Original source time | Local screenshot | SHA256 |
|---|---|---|
| 90s | `ep07/watch-osdgzazx/frames/cue_0002.jpg` | `61c0c3e43800b08a2bce1162ecfc8a1b3a304349a08dc41aa00b6ace0a127cc3` |
| 360s | `ep07/watch-osdgzazx/frames/cue_0008.jpg` | `1ba9197bbe2d91b1f4043022e6ce66050e0320ea6a574c01eaab949e4e97f5f8` |
| 480s | `ep07/watch-osdgzazx/frames/cue_0010.jpg` | `0c3669658bef2f9eaa4d1cf5182ddb34eb0940f42ce8fdde898caa02f1002086` |
| 780s | `ep07/watch-osdgzazx/frames/cue_0016.jpg` | `2d5f0ede247f38693fdfc7f48cfc22f718fd61336b11701670550708c081450d` |
| 1500s | `ep07/watch-osdgzazx/frames/cue_0030.jpg` | `b8d1eb8c373220975160958b38c31840ec24b1f5e38d856a542c460d98d21901` |
| 1740s | `ep07/watch-osdgzazx/frames/cue_0035.jpg` | `b69b55d1f803bac32af658c28fbd533807dcf33747c2844e501844470b45543c` |

#### Episode 8 — explicit archive zone, role flexibility and prolonged production

[Source](https://www.youtube.com/watch?v=AqHp2NExbSo). Complete progressive360p source after a resumable network timeout; full en-orig automatic captions read, all 26selectedframes inspected across0–1226s,60s cadence plus cues. Expansion-enabled continuation of episode 7; do not assume new catalog items are base-game assets.

[01:00](https://www.youtube.com/watch?v=AqHp2NExbSo&t=60), cue0001: Sets catalog and RuralShackInterior tooltip show$29,000 and a NoveltyValue bar. SchoolCorridor footprint at90s, cue0002, demonstrates placement, rotation indicators and irregular clearance boundary. This tooltip price is directly visible, distinct from studio cash, but applies to this expansion-enabled era. At03:00 narrator rejects/sells a below-two-star script and writes again; at04:44 a two-star script is accepted. Quality filtering is player policy rather than a mandatory game threshold.

[05:00–07:14](https://www.youtube.com/watch?v=AqHp2NExbSo&t=300): makeover, then attempts to assign entourage while a star is practicing; he waits until practice finishes before assigning. At08:19–08:32 deliberately casts another actor as an **extra** in the film, leaving the regular extra idle. Acceptance: production roles and employment labels are distinct; assignment restrictions can depend on current activity.

[09:24](https://www.youtube.com/watch?v=AqHp2NExbSo&t=564): selects ShootIt then immediately returns to decorating trailers, so this is another camera-away gap for the equipment-assembly sequence. [11:12](https://www.youtube.com/watch?v=AqHp2NExbSo&t=672): releases ExtractingCaroline and watches part of the generated driving-set film. [12:20](https://www.youtube.com/watch?v=AqHp2NExbSo&t=740), cue0014, is a clear ProductionOffice floor view with **Finance**, **Reviews**, **Archive**, **Release**, **MoviePlayer** zones. This is the receiving-zone map missing from many coarse shots. The building is distinct from a standalone PostProduction editor.

[12:05–13:05](https://www.youtube.com/watch?v=AqHp2NExbSo&t=725): player realizes he built the wrong trailer tier, has builders remove it and replaces it with a better one, then assigns the owner. At13:12–13:20 cannot turn an actor into entourage; other applicants are unavailable. Do not generalize this as every occupation being convertible to every other role.

[15:14–15:19](https://www.youtube.com/watch?v=AqHp2NExbSo&t=914): explicitly says a film needs Archive and archives it. At16:33–16:36 inspects **finished shooting / assembling on set**, waiting for cast; at18:30 sends one movie to ShootIt then releases another without watching, noting its chart debut46 versus another film9. Same broad star rating can produce different chart positions; precise formula unknown. At19:26 examines another genre resurgence and trains comedy for the next film. Narrator describes the overall era as1943 at15:00; timeline samples advance into1944 by19:00.

| Original source time | Local screenshot | SHA256 |
|---|---|---|
| 60s | `ep08/watch-tcf179vz/frames/cue_0001.jpg` | `53e1f46f2f8a58c6904e0a165e2829b75d6a7f23e4ebde238f0363a6f149aa11` |
| 90s | `ep08/watch-tcf179vz/frames/cue_0002.jpg` | `02121e59f68bf304aa5a7a179ca513fd9208477e588ef882357e8a7924a6c281` |
| 360s | `ep08/watch-tcf179vz/frames/cue_0008.jpg` | `a4475fb4a03f64ecfb752cfc9f6df176b5e266997027e08aae66ef01335039f6` |
| 480s | `ep08/watch-tcf179vz/frames/cue_0010.jpg` | `f864a765bfae3e5f322e8f9259346e7a824928390e7148b8aec185b14450a667` |
| 720s | `ep08/watch-tcf179vz/frames/cue_0014.jpg` | `ee3bdad9446edfaa426e037164d96873728ebf11877a13510c1a6bb85def2f45` |
| 1080s | `ep08/watch-tcf179vz/frames/cue_0021.jpg` | `5c015217515c0c706eec57efe5e173c3fbc358911de69d88ddfe3e79add59a4c` |

##### Completed episode 6 gap repair

Original[05:09–05:52](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=309) now sampled with nine inspected360p frames at309.5,315,320,325,330,335,340,345,351s. These show practice on the desert set (PracticingAction progress balloons), then restaurant social/food assignment. At335–345s readable social speech bubbles say the setting feels too intense/self-conscious; therefore social activity can have negative preference feedback. Original[34:40–35:12](https://www.youtube.com/watch?v=1A9G7KEIzsI&t=2080) inspected at2080/2090/2100/2110s: final studio view and paused view, then end card. These close the omitted interval and coarse-tail coverage; no new production-stage sequence is present. All 13 frame hashes are in ep06/repair-pins.json.

##### Direct archive gesture witness (expansion-enabled episode 8)

Original[15:12–15:22](https://www.youtube.com/watch?v=AqHp2NExbSo&t=912),360p,1fps, all 10frames inspected. At915s the cursor selects a released film token near the ProductionOffice; at916s the office floor opens and **Archive** highlights green beneath the held film token. At917s token is over the Archive receiving zone with an **Archive Progress** tooltip/indicator; at918s camera moves away and the prior film is no longer being held. This supports the concrete gesture **pick up an existing released film's physical token → drag onto ProductionOffice Archive → release and remove it from the active release flow**. It does not establish the exact revenue-expiry threshold. This witness is after expansion installation, so combine its zone/gesture with episode 1/6 commentary rather than asserting the later installation proves base-only behavior.

| Original source time | Local screenshot | SHA256 |
|---|---|---|
| 915s | `ep08/archivedense/frame_0004.jpg` | `16d163c8a3637093c6a1efb73fd64f632f01cb3f747ebad9ecb4dc945d5b8a9f` |
| 916s | `ep08/archivedense/frame_0005.jpg` | `738f0e9fb1d64d1819ef50944feb9139904df1996fe30c986ea949b954e052db` |
| 917s | `ep08/archivedense/frame_0006.jpg` | `e121346867b01a3b81c9dc562422242c3f912f27899a92f97d2e8743ef95b25e` |
| 918s | `ep08/archivedense/frame_0007.jpg` | `a1ac4ec68641c2e0cc46f386522de8d09595cd71616222a772c2f116c325da97` |

Final limits: no audio listening, speech recognition, external-model video analysis, every-frame motion review, hidden economy formulas or native rig/bone inference. Episode 3 lacks English captions. Episode 4/5 retain single-fragment acquisition gaps; exact source timing of coarse pixels after those gaps is qualified. All critical dense gesture clips use independent progressive media and are unaffected. No screenshot pixels, source videos, full captions, signed media URLs or proprietary assets should be published; original notes, source links, coverage/timestamp audit and screenshot hashes are publishable. Raw source media was deleted after pins; local screenshots retained.


## Retained report C: Flabaliki episodes 9–17

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI-LATE.md).

### Flabaliki — episodes 9–17

All nine requested episodes received full-timeline sampled visual inspection: **531 grid frames + 31 focused episode 14 pins = 562 inspected images**. Full native English automatic captions read for10–17; episode 9 supplied no requested English track. Original audio was not listened to. Source links, timestamps, exact screenshot SHA-256, caption hashes, detailed observations and modality limits are in `FLABALIKI-LATE-coverage.json`. Proprietary frames remain local.

**Edition qualifier:** this is an expansion-contaminated reference, not a base-only witness. Episode 16 [~3:45](https://www.youtube.com/watch?v=rAnRWPL14ms&t=225s) visibly labels a casting zone **Stunt Doubles** (`ep16/frame_0008.jpg`); episode 17 [~17:45](https://www.youtube.com/watch?v=0pTI5jtv71I&t=1065s) release results include **Stunt Rating** (`ep17/frame_0036.jpg`). Episode 12 creator explicitly names “stunts and effects” at27:42; episode 16 builds Stunt School and follows native stunt tutorial. Exact package/build/mod inventory remains unknown. Camera and stunt mechanics below must not automatically become base-game requirements.

Coverage/provenance: all media explicitly used progressive format160 (144p video only), serially downloaded and deleted after extraction/hash. Download logs contain **no skipped/unavailable fragments**. Episode 14 initially failed with a TLS handshake timeout and succeeded on a later serial resume. No original-media ffprobe duration was retained before deletion: frame counts match expected duration, but this is not a duration-validation claim. Most pins are approximate30-second bucket midpoints; episode 14 grid uses source PTS and additional requested cues. None are asserted to be exact click-boundary times. Text unreadable at144p is left unknown.

| Episode | Source / duration | Inspected grid | Coverage highlights |
|---|---|---:|---|
|9|[yS03MnLxyv4](https://www.youtube.com/watch?v=yS03MnLxyv4),21:03|42|Awards5:15; film player7:15–7:45; released staff impact8:15; charts12:45/20:15; wardrobe14:45–15:15. English captions unavailable.|
|10|[GcdYLee-nhY](https://www.youtube.com/watch?v=GcdYLee-nhY),21:26|43|Training/staff needs; movie playback8:15–9:15; décor11–19m; studio rank1st12:45 then2nd17:15; live saloon shoot20:15, release20:45.|
|11|[Qyv9PNfxoNk](https://www.youtube.com/watch?v=Qyv9PNfxoNk),21:07|42|Set tour2:45; salaries3:45/15:45; playback6:45–7:15; live shoot11:15–11:45; awards12:15; upgraded script office13–14m; charts19:45–20:15.|
|12|[O7P2VjYc_q4](https://www.youtube.com/watch?v=O7P2VjYc_q4),38:15|77|Custom script metadata10:45–11:45; extensive scene/camera/set/wardrobe authoring12:15–37:15; back to studio37:45.|
|13|[a-WJQMs9LQs](https://www.youtube.com/watch?v=a-WJQMs9LQs),30:21|61|Cast previous custom script; stalled separate production canned~12:15; trailer/decor plots13–21m; custom movie release22:15/player22:45–23:15; achievement tiers27:15–27:45; Publicity Office28m.|
|14|[YUfNTKEubdw](https://www.youtube.com/watch?v=YUfNTKEubdw),30:36|62 +31cues|Awards6:15; PR8:15; release-budget11:05–11:15→results11:20; film11:30–13:20; script PR16:35; finances18:30; second release22:45–23:05; marketing/PR review24:25–24:35.|
|15|[_tJU8vafkfg](https://www.youtube.com/watch?v=_tJU8vafkfg),36:27|73|Custom script3:45–16:15; props/camera/clothing; stuck-film disposal16:45–20m; repeated PR22:45–25m; romance playback25:45–28m; awards31:45; stunt tutorial33:15; custom movie34–36m.|
|16|[rAnRWPL14ms](https://www.youtube.com/watch?v=rAnRWPL14ms),32:29|65|Stunt School build/hire0:45–2:45; stunt casting3:45; tutorial/PR4–9m; films10–13m; achievement14:45; trailer replacement22:45–30m; live stagecoach stunt30:45–31:15.|
|17|[0pTI5jtv71I](https://www.youtube.com/watch?v=0pTI5jtv71I),32:50|66|Live jail stunt1:15; sets demolished/replaced4–7m; landscaping8–13m; films13–19m; stunt casting20–23m; recruit25m; full-lot map29:15; new sets29–32m.|

#### Editor and persistence witnesses

- Episode 12 [10:45–11:45](https://www.youtube.com/watch?v=O7P2VjYc_q4&t=645s): Advanced Movie-Making metadata accepts title **The Best Movie Ever**, genre and structure; narrator chooses Freeform. Three role slots can receive specific actors.
- [12:15–16:45](https://www.youtube.com/watch?v=O7P2VjYc_q4&t=735s): set picker, scene-template library/filter grid, numbered actor-role controls, Field Of View, backdrop, lighting/weather and prop catalogs. Preview and bottom scene-thumbnail strip coexist. Captions13:13–13:48 describe camera start/end positions and preview acceptance. These are authoring controls in a stunt-feature installation.
- [22:15–25:15](https://www.youtube.com/watch?v=O7P2VjYc_q4&t=1335s): entering Makeover Department changes costume/hair; returning to same named working draft retains the scene strip. **This establishes subscreen return retaining a working draft; it does not establish saving to disk or reload persistence.** Costumes change across scenes and creator repeatedly fails to make them consistent.
- Captions [24:54–25:10](https://www.youtube.com/watch?v=O7P2VjYc_q4&t=1494s): creator is unsure whether this screen can save. This is uncertainty, not a game rule.
- Captions [32:08–32:35](https://www.youtube.com/watch?v=O7P2VjYc_q4&t=1928s): attempted right-click deletion instead duplicates scenes, then creator deletes via bin. Grid frames31:45/32:15/32:45 show changed strip, but do not capture each gesture; exact control mapping remains commentary-supported.
- Episode 13 [22:15–23:15](https://www.youtube.com/watch?v=a-WJQMs9LQs&t=1335s): same custom title reaches Released results, then player shows recognizable ruined-street/costume scenes. This supports authoring→production→release continuity across episodes, not independent save/load proof.
- Episode 15 [10:15](https://www.youtube.com/watch?v=_tJU8vafkfg&t=615s): save-custom-costume dialog visible; creator cannot find load/apply-to-all behavior. No successful global costume persistence established.
- No title/credits formatting, scene reordering, post-production sound editing, export, or saved-vs-preview distinction was established. Film idents/credits appear in playback; their existence does not prove user editing controls. Original sound/music remains unverified.

#### Marketing witnesses

Episode 14 is the strongest source. [8:15](https://www.youtube.com/watch?v=YUfNTKEubdw&t=495s) shows Publicity Office receiving a completed film; [16:35–16:40](https://www.youtube.com/watch?v=YUfNTKEubdw&t=995s) receives a script before casting. Caption21:48 says stars can also be placed in PR;28:07 says only one PR subject at a time. These last constraints are commentary-supported.

[11:05–11:15](https://www.youtube.com/watch?v=YUfNTKEubdw&t=665s) shows release interaction, then11:20 results include PR/Marketing. Creator says maximum release spend **$200,000** at11:17. [22:45–23:05](https://www.youtube.com/watch?v=YUfNTKEubdw&t=1365s) repeats release with caption-only **$150,000**, deliberately skipping separate PR. The critic page [24:25–24:35](https://www.youtube.com/watch?v=YUfNTKEubdw&t=1465s) visibly says marketing outweighed PR; creator realizes the two activities are distinct. This is evidence for separate PR preparation and release-budget inputs, **not** a numerical effectiveness formula.

Episode 15 captions25:08 say another PR cycle is rejected, then25:15 choose middle release budget; ensuing film and results are sampled. No reliable cash-before/after, exact debit instant, cancel/back, debt handling, or refund behavior was established.144p prevents independently verifying the $200k/$150k values. The salary screens and finances graph are unrelated to release debit and must not substitute for that proof.

#### Long-term progression and constraints

- Studios and movies have separate relative charts. Episode 10 rank shifts1st→2nd; episode 17 falls1st→4th then recovers while rebuilding/releasing. These relative changes do not imply a stable mapping from star rating to rank.
- Episode 11 awards~12:08–12:40 grant direction/prolific-star benefits and an upgraded script office;13–14m shows demolition of old office, clearing décor and building the larger office. Current/future salary influence and payroll totals are visible, but exact long-term star-growth formula is unknown.
- Episode 13 Achievement Awards pages [27:15/27:45](https://www.youtube.com/watch?v=a-WJQMs9LQs&t=1635s) show Respected/Celebrated Studio Head tiers. Captions describe milestones: release15films, actor3stars, then earnings$7m, combined film stars35, bank$4m, eight awards. Episode 16 [14:45](https://www.youtube.com/watch?v=rAnRWPL14ms&t=885s) shows tier page after bank target completion; next goals described as actor4stars and five movies over3stars. Requirement numbers are caption-supported; visual144p text is not a second exact verification.
- Episode 17 [22–23m](https://www.youtube.com/watch?v=0pTI5jtv71I&t=1320s): aged stars, appearance-vs-actual age and missing crew blocking Shoot It; creator supplies missing crew and production starts. Episode 16 captions8:50 announce retirement in10years. Episode 17 hires a24-year-old at25m but ultimately retains old cast—do not report an actual firing.
- Stunt-specific extension behavior is quarantined: condition/skill, doubles, graded difficulty, training, success/failure/injury and Stunt Rating. Episode 16/17 document these, but they are **not base reconstruction requirements**.
- Episode 17 [16:32–17:10](https://www.youtube.com/watch?v=0pTI5jtv71I&t=992s) proposes curved roads/vehicles/studio tours for an imaginary sequel. These are wishes, not observed features. Repeated stalls, lag, missing crew and creator uncertainty confound inferred causal rules.


## Retained report D: Geekism episodes 1–24

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM.md).

### Geekism — The Movies reconstruction evidence

Playlist: https://www.youtube.com/playlist?list=PLak7UKfYySPEemm7ZObqdIXRM0lT-JirV
Inventory: 24 videos; 44,828 seconds (12h27m08s). `playlist.json` preserves titles, IDs, durations and order. Evidence is local sampled still frames and English YouTube auto captions, not continuous motion/audio viewing. Raw screenshots remain local and are not publishable assets. Captions can misrecognize names and numbers. Commentary below is not visual verification.

**Mod caveat:** Episode 20 announces an installed applicant-queue mod; episode 21 says it apparently did not work and may need a new save. Its effect is unverified. Awards also change rules during this run.

#### Edition and restart boundary

- Episode 1 [00:29–00:35](https://youtu.be/DgUQHt1AgAY?t=29): commentator explicitly says base game, not expansion. Mentions modern OS fixes and resolution registry changes; those are not proof of gameplay mods.
- Episode 1 [03:34–04:38](https://youtu.be/DgUQHt1AgAY?t=214): sandbox starts with $1m in 1930s; instant filmmaking/buildings left off; decay disabled and Stars Don’t Misbehave enabled (moods/emotions constant; not proof every need subsystem is disabled). Exact checkbox names not yet visually read.
- **Episode 2 [00:00–01:02](https://youtu.be/u-Tq_b5KTI8?t=0): RESTART IN NORMAL GAME**, because sandbox has no award ceremonies and felt too easy. Similar lot rebuilt off camera, different actors and initially available buildings/sets. Do not apply episode 1's sandbox toggles to episodes 2 onward. Exact off-camera settings and subsequent changes remain unverified.

#### Chronological episode findings — caption commentary, with separate visual checks

##### 01 — Neville's Devils (36:21)

Full available auto-caption track read. Sampled visuals reviewed; detailed visual qualifications are below. [06:55](https://youtu.be/DgUQHt1AgAY?t=415): places production facilities centrally to reduce walking; [11:45](https://youtu.be/DgUQHt1AgAY?t=705): says soft grass slows walking while tarmac supports approximately path speed; paths needed for entrances/exits and connectivity contributes prestige. [10:49](https://youtu.be/DgUQHt1AgAY?t=649): drag applicants to builders/janitors; stage school hires actors/directors, separate crew building hires crew. [13:46](https://youtu.be/DgUQHt1AgAY?t=826): two genre teams alternate; relationships developed by chatting. [18:33](https://youtu.be/DgUQHt1AgAY?t=1113): photographer captures socializing for publicity, later cannot photograph on set. [23:10](https://youtu.be/DgUQHt1AgAY?t=1390): cast physical script into role slots; rehearse before shooting. [24:10](https://youtu.be/DgUQHt1AgAY?t=1450): basic script office caps scripts at one star; intermediate office larger footprint. [25:00](https://youtu.be/DgUQHt1AgAY?t=1500): missing crew prevents shooting; two crew required by this film. [25:20](https://youtu.be/DgUQHt1AgAY?t=1520): physical script/movie object moves between sets during filming. [31:43](https://youtu.be/DgUQHt1AgAY?t=1903): finished film dragged to production/release. Release assessment includes script quality, relationships, set repair, crew experience, novelty, genre interest, star power. [34:10](https://youtu.be/DgUQHt1AgAY?t=2050): stars dropped on idle set can practice genre experience. [34:23](https://youtu.be/DgUQHt1AgAY?t=2063): first film enters chart #17; cost ~$14k, reaches break-even shortly afterward. Numeric values are this run, not universal constants.

Inferred implementation/test consequences: physical drag targets and production-state transitions need to be functional; failed requirements should block filming without losing script; release should expose separate quality inputs and revenue/cost chart; routing distance and surfaces matter. Sandbox toggles must change mechanics, not merely be decorative.

##### 02 — Tidgy Gets A Biscuit (24:55)

Full available auto-caption track read. Sampled visuals reviewed; detailed visual qualifications are below. Restart boundary above. [02:06](https://youtu.be/u-Tq_b5KTI8?t=126): holding Shift permits finer/free object placement/rotation; narrator discovers it, some clipping remains. [04:12](https://youtu.be/u-Tq_b5KTI8?t=252): awards ceremony; future best prestigious lot award gives scientists faster research. [04:42–05:30](https://youtu.be/u-Tq_b5KTI8?t=282): achievements are separate from awards; release five movies, earn total $500k, aggregate five movie stars unlock custom scriptwriting office. [05:45](https://youtu.be/u-Tq_b5KTI8?t=345): sell unused scripts to competitors to earn small amounts and keep writers practicing. [07:52](https://youtu.be/u-Tq_b5KTI8?t=472): waits for finishing production's crew, then manually reassigns; can continue rehearsal before shoot. [11:38](https://youtu.be/u-Tq_b5KTI8?t=698): date-based basic facilities release unlocks bar/ornaments; bar supports relationships. [13:22](https://youtu.be/u-Tq_b5KTI8?t=802): historical/news event affects genre interest. [13:56](https://youtu.be/u-Tq_b5KTI8?t=836): drag builder onto existing set for repair before filming; repeated set use lowers novelty. [17:05](https://youtu.be/u-Tq_b5KTI8?t=1025): adjusts salaries to improve mood. [19:00](https://youtu.be/u-Tq_b5KTI8?t=1140): auto-written sci-fi script keeps choosing stage/western set despite starship set available; custom scriptwriting needed to control sets. [20:00](https://youtu.be/u-Tq_b5KTI8?t=1200): release one-star comedy, novelty awful; displayed review criticizes overused sets. [21:57](https://youtu.be/u-Tq_b5KTI8?t=1317): production cost commentary ~$25k and chart #19. [22:31–23:38](https://youtu.be/u-Tq_b5KTI8?t=1351): photographer does not take bar photos despite attempts; narrator uncertain why. Do not implement imagined bar-photo rule from this failure.

Inferred implementation/test consequences: achievements, timed facility availability, awards and research bonuses are distinct progression systems. Script selling and archiving use distinct drop targets. Set novelty and condition are distinct metrics. Shift placement should relax grid snapping. Photograph failure needs further verification.

##### 03 — Tinymen (18:51)

Full available auto-caption track read. Sampled visuals reviewed; detailed visual qualifications are below. [00:30](https://youtu.be/12jqKxiFPIQ?t=30): studio reviews and box office revenue determine whether to archive films. [01:35](https://youtu.be/12jqKxiFPIQ?t=95): date timeline forecasts war research pack and sci-fi interest boost. [02:40–05:50](https://youtu.be/12jqKxiFPIQ?t=160): holds a completed movie awaiting genre-interest news; [05:52](https://youtu.be/12jqKxiFPIQ?t=352): release shows superb genre interest, just over one star. [07:00–07:30](https://youtu.be/12jqKxiFPIQ?t=420): achievement unlocks custom script office and a sign; film enters chart #17. [07:25](https://youtu.be/12jqKxiFPIQ?t=445): archives previous film only after no longer earning money. [08:00–10:08](https://youtu.be/12jqKxiFPIQ?t=480): makeover edits clothing/hair/accessories to improve image/fashion. [10:09](https://youtu.be/12jqKxiFPIQ?t=609): film $21k cost, later ~$42k gross. [10:40–11:45](https://youtu.be/12jqKxiFPIQ?t=640): extras practice on unoccupied sets as well. [13:20](https://youtu.be/12jqKxiFPIQ?t=800): star UI includes stress, addiction, trailer satisfaction. [14:26](https://youtu.be/12jqKxiFPIQ?t=866): research laboratory placed; rehab available too. [15:28](https://youtu.be/12jqKxiFPIQ?t=928): second release's quality weakens from novelty and repeated star appearance. [16:36](https://youtu.be/12jqKxiFPIQ?t=996): review complains actor appears too soon after previous film; chart ~#30 commentary. [17:06](https://youtu.be/12jqKxiFPIQ?t=1026): researches 1930s costume pack before 1930 to improve fashion; trailers newly available by episode end.

Inferred implementation/test consequences: releasing timing affects genre-interest evaluation; box office revenue persists after release until exhaustion; actor overexposure must be independent of set novelty. Makeover and research are progression routes. Do not assume films with better review always rank highly.

##### 04 — Bang Bang We're Dead (25:44)

Full caption track read. Sampled visuals reviewed; detailed visual qualifications are below. [01:26–08:30](https://youtu.be/yqRncTT7CX0?t=86): four rickety trailers placed, each decorated with grass, lounger, beach ball, workout bar, car, trees. Decoration contributes trailer prestige; equal treatment is narrator strategy, not game requirement. [08:30](https://youtu.be/yqRncTT7CX0?t=510): assigning trailers by dragging stars off an active rehearsal disrupts it, requires recasting/rehearsal. [10:37](https://youtu.be/yqRncTT7CX0?t=637): claims archived movies cannot rerelease, qualified by 'as far as I know'. [11:18–12:43](https://youtu.be/yqRncTT7CX0?t=678): 1930 awards include highest-charting star/movie/studio and most prestigious studio lot, next ceremony in five years. Next achievement needs two-star star, two-star film, two-star studio and rewards forest set. [12:43](https://youtu.be/yqRncTT7CX0?t=763): 1930s researched costumes improve image. [17:39–19:46](https://youtu.be/yqRncTT7CX0?t=1059): film approaches two stars, costs ~$34k, charts #3; studio/star prestige increases after release. [23:16](https://youtu.be/yqRncTT7CX0?t=1396): salary rises follow success; research unlocks post production, two-color film, intermediate scriptwriting. Basic office demolished/replaced with larger intermediate. [24:38](https://youtu.be/yqRncTT7CX0?t=1478): tech researched roughly one year ahead of general 1931 availability.

Inferred implementation/test consequences: trailers need assignable ownership and local prestige effects; dragging a worker/star has state consequences. Distinguish periodic competitive awards, milestone achievements, and dated technical research. Archive/rerelease restriction is unconfirmed commentator belief.

##### 05 — The Brain Readers (29:32)

Full available caption track read. Sampled visuals reviewed; detailed visual qualifications are below. [03:24](https://youtu.be/dL2avF7d4h8?t=204): improved script needs extra, assigned from available workers with genre experience. [04:07](https://youtu.be/dL2avF7d4h8?t=247): custom script office built separately, retains regular office as backup. [05:30](https://youtu.be/dL2avF7d4h8?t=330): rehearsal improves estimated quality above two stars. [06:12](https://youtu.be/dL2avF7d4h8?t=372): narrator THINKS set theme need not match genre; not verified rule. [09:40](https://youtu.be/dL2avF7d4h8?t=580): entourage demand consumes staff; [24:00](https://youtu.be/dL2avF7d4h8?t=1440): crew workers reassigned as star assistants improves satisfaction. [10:22–22:26](https://youtu.be/dL2avF7d4h8?t=622): blank film/script at custom office opens advanced moviemaker. Select genre, randomized/editable title, actor and extra (director selected later in production), cast character names; scenes organized into introduction/development/resolution. Scene search by terms; per-scene set choice, role assignment, props, weather/lighting, backdrop. Director sliders change emotion intensity (angry/moody/sad; hysterical laughter) where supported. Scene replacement/deletion and manual camera viewpoint switching. Narrator struggles with costume continuity and finding slider control; not proof of missing feature. [25:21](https://youtu.be/dL2avF7d4h8?t=1521): archive exhausted hit, release new sci-fi with good novelty/tech/genre. [26:03](https://youtu.be/dL2avF7d4h8?t=1563): two-color improvement unlocked midshoot appears applied throughout finished film (commentator observation). [27:26–28:08](https://youtu.be/dL2avF7d4h8?t=1646): cost ~$35k, no negative review, charts #1, then salary increases. Entire film UI and editing specifics require larger stills for exact labels.

Inferred implementation/test consequences: custom moviemaking is a structured editor with searchable scene library, cast bindings, per-scene parameters and preview, not just title entry. Rehearsal estimate, tech, star/crew quality and novelty combine into film result. Do not hard-code review text or chart position from examples.

#### Visual evidence checkpoint

Viewed every listed still in episode 1's local watch report via `01.sheet.jpg`: 03:40, 03:57, 04:35, 10:55, 23:38, 25:00, 31:58, 34:25. The first three visibly show sandbox settings panel but 144p source cannot resolve exact option labels reliably; later frames show building drag targets and released-film panel with script-quality star row. Episode 2 `02.sheet.jpg` viewed all 12 uniform stills (timestamps and SHA256 in `02.pins.json`): visibly confirms awards ceremony and film release assessment panel, free-standing lot/buildings and side portrait lists. Small source cannot independently establish exact numerical scores. Caption status is retained above until enough pixels exist to read it. Metadata/chapter labels alone are not watched evidence.

##### 06 — This Is A Muck Up! (27:21)

Full captions read; sampled visuals are documented separately. [05:00–09:10](https://youtu.be/KKMXXE9nosY?t=300): experienced extra Emily Dredge promoted to actor by drag to hiring building, then makeover, salary, trailer, genre practice. Supporting leads should use actual actors rather than extras (community advice narrator follows). [09:13–16:40](https://youtu.be/KKMXXE9nosY?t=553): expands custom movie to six scenes and multiple sets to raise script above two stars; drags scene item to reorder; removes unused role mannequins, edits per-scene hair, costumes and props for continuity. Script reaches >2 stars. [16:36](https://youtu.be/KKMXXE9nosY?t=996): existing cast automatically populates casting slots, director added manually. [18:04](https://youtu.be/KKMXXE9nosY?t=1084): says shoots in movie scene order, repairs upcoming sets. [20:08](https://youtu.be/KKMXXE9nosY?t=1208): off-camera time skip while film shoots; 1935 award ceremony before release. [21:38–23:43](https://youtu.be/KKMXXE9nosY?t=1298): awards preview half salary for staff/stars for five years (must verify exact duration), most prestigious lot won; faster scientists. [23:43](https://youtu.be/KKMXXE9nosY?t=1423): redirects research to filmmaking technology, releases custom film >2 stars; [25:08](https://youtu.be/KKMXXE9nosY?t=1508): cost ~$76k and chart #1. Extra people unexpectedly in car because unused roles not removed. Inferred implementation checks: roles are scene-specific; deleting cast binding isn't necessarily disabling that role; scene count/set variety influence script estimate; cast/director distinction and role promotion important.

##### 07 — Killer Fembots From Mars (31:22)

Full captions read; sampled visuals are documented separately. [03:37–16:45](https://youtu.be/dun_VB5idoc?t=217): takes automatically written script into custom editor and replaces scenes/sets, adjusts costumes, per-scene participants, sliders, backdrops. Can hybridize generated/custom films. Clicking Save matters; narrator loses edits by wrong button. Unused extra slots from previous film were left active. [18:10–21:40](https://youtu.be/dun_VB5idoc?t=1090): replaces trailers with cheap tier; avoids demolishing active filmmakers' trailers until filming ends; equal/new trailer prestige affects dissatisfaction. [20:15](https://youtu.be/dun_VB5idoc?t=1215): salary increases drain treasury, finance warning about debt. [23:51](https://youtu.be/dun_VB5idoc?t=1431): basic makeup, dolly rig and hand-colored film unlock. [25:59](https://youtu.be/dun_VB5idoc?t=1559): off-camera production skip; losing money, cuts salaries, actors unhappy during production; retains ~2-star movie. [28:02](https://youtu.be/dun_VB5idoc?t=1682): film ~$90k cost, charts #2, earnings return studio to positive balance. Inferred implementation checks: operating costs run during production, salary changes affect morale, quality not a sufficient guarantee of profitability, release cash flow can rescue a studio. No precise salary formula established.

##### 08 — Stinky! (23:17)

Full captions read; sampled visuals are documented separately. [01:23–04:49](https://youtu.be/e5D8qT77W8o?t=83): runs two genre teams/films in parallel to sustain cash flow, regular auto scripts rather than custom; shortage of crew blocks second shoot. Reassigns builder and janitor into crew. [02:46](https://youtu.be/e5D8qT77W8o?t=166): extras practice genre on idle sets. [05:30–08:19](https://youtu.be/e5D8qT77W8o?t=330): finance salary tweak and bar visit reduces stress before return to set; trying to socialize people with inadequate relationship fails. [09:11–10:37](https://youtu.be/e5D8qT77W8o?t=551): fires researcher and janitor to cut operating cost; retains three writers, six crew, three builders, three janitors (this studio state). [12:40](https://youtu.be/e5D8qT77W8o?t=760): narrator says scriptwriter experience is general, not separate genre experience; trades unused scripts for cash. [13:24](https://youtu.be/e5D8qT77W8o?t=804): two large restrooms replace small toilets, post production available but unbuilt. [15:30](https://youtu.be/e5D8qT77W8o?t=930): Stinky charts #1; [18:24–20:31](https://youtu.be/e5D8qT77W8o?t=1104): Operation Invade released with new inexperienced crew/supporting actor, charts #35, still expected cash. [21:11–22:37](https://youtu.be/e5D8qT77W8o?t=1271): awards most prolific star, highest-charting film, prestigious lot (some events skipped quickly); bonuses include role suitability irrespective appearance, production quality improvement, faster research, easier star moods. Exact winners/bonus durations must be visually checked. Inferred implementation checks: shared finite worker pools, conversion versus dismissal, parallel productions compete for staff; separate actor/extra genre skill from writer general skill; awards can change simulation rules.

#### Higher resolution settings validation

Viewed `01.settings.220.jpg`, `01.settings.237.jpg`, `01.settings.275.jpg`, extracted from bounded source 218–278s, 640x360. At 275s: Sandbox year 1930, $1,000,000; unchecked Instant Movie-making, Buildings Instantly Constructed, Start With A Ready Built Studio Lot; checked Stars Don't Misbehave and Buildings Don't Decay. Tooltip explicitly describes stars' moods/emotions remaining constant (currently constant). At 220s initial money was $100,000 before change. This is stronger evidence than auto-caption wording. All three pins viewed. Episode 3 all 12 uniform stills viewed in `03.sheet.jpg`: lot overview, film playback, wardrobe screen with clothing/appearance lists and character preview, laboratory/production facilities. Exact fine text cannot be read from 144p source.

##### 09 — The Kid Rode Away (28:16)

Full captions read; sampled visuals are documented separately. [00:00](https://youtu.be/xQdWGCp8tNA?t=0): studio ranked #1 despite much less capital, scoring breakdown includes money/movies/stars/lot. [01:23](https://youtu.be/xQdWGCp8tNA?t=83): post production is editing (subtitles, soundtrack, voices), **not promotional advertising**; promotion building not yet unlocked, narrator unsure when. [01:30–03:30](https://youtu.be/xQdWGCp8tNA?t=90): restaurant built for socializing. [04:55–06:19](https://youtu.be/xQdWGCp8tNA?t=295): checks required sets before shooting, repairs them and idle office. [07:00](https://youtu.be/xQdWGCp8tNA?t=420): explicitly says no alcohol addiction due to earned award. This is a temporary/earned rule modifier, not default base-game behavior. [08:21](https://youtu.be/xQdWGCp8tNA?t=501): cannot fit three practicing stars on one set, splits practice. [11:11](https://youtu.be/xQdWGCp8tNA?t=671): commentator says comedy tolerates older stars, action and romance prefer young stars. [14:36–20:18](https://youtu.be/xQdWGCp8tNA?t=876): edits auto sci-fi script, selects sets by 100 novelty, changes scene when original animation unavailable on replacement set; adds scene to exceed2 stars. [23:16](https://youtu.be/xQdWGCp8tNA?t=1396): photographers spawn/hang near entrance and cannot be dragged off their location; arranging stars near entrance is workaround. [24:00–26:47](https://youtu.be/xQdWGCp8tNA?t=1440): releases comedy near3 stars, ~$67k cost, #1; actor2 star milestone unlocks forest set. Next milestone: receive2awards, release5 two-star films, have$1m cash; rewards proficient scriptwriting office. Inferred implementation checks: editing/supporting sets are constrained by scene availability; production/postproduction/promotion must be different routes; awards modify addictions; fame affects demands independently of treasury.

##### 10 — Alpha Male (28:43)

Full captions read; sampled visuals are documented separately. [00:00–04:11](https://youtu.be/3puqhVgbEgI?t=0): new sets (traveling vehicle, subway carriage, hotel room), buys1940s cars; no instant overwrite of old decor. [05:37–06:19](https://youtu.be/3puqhVgbEgI?t=337): stress relief at bar, still explicitly no addiction due to bonus. [06:19–12:24](https://youtu.be/3puqhVgbEgI?t=379): upgrades auto comedy script to2 stars by adding scenes and changes lead/supporting bindings, male drag costume; swapping cast role functions. [13:49–15:54](https://youtu.be/3puqhVgbEgI?t=829): releases Little Titan; low sci-fi interest and weak crew constrain quality >2 stars. [16:35–20:14](https://youtu.be/3puqhVgbEgI?t=995): wardrobe fashion update to1940s, assistants added from job applicants, salary changes, set repairs; trailer demand remains even with existing trailer. [21:00](https://youtu.be/3puqhVgbEgI?t=1260): archives previous comedy when revenue dries up and treasury begins shrinking before next film. [21:45–24:36](https://youtu.be/3puqhVgbEgI?t=1305): makeover and photographers before release; narrator uncertain whether image evaluated at filming/release. [24:36–27:25](https://youtu.be/3puqhVgbEgI?t=1476): Alpha Male just short3 stars; reviewers distinguish script, actor suitability, set condition/novelty, chemistry; chart#2 then#3; success shifts actor fame and salary expectations. Inferred implementation checks: appearance evaluation timing remains unknown, must not infer from this sequence; genre conditions, fame and salaries have ongoing feedback.

##### 11 — Blazing Stallions (1/2) (33:17)

Full captions read; sampled visuals are documented separately. [00:00–04:48](https://youtu.be/WenRGpJhoqA?t=0): replaces weak sci-fi team with action actors for popular genre. Accidentally fires newly hired actors, successfully rehired before departure by drag onto actor slot. Action suitability discussed as physique; romance young/attractive (commentator rule-of-thumb). Awards skipped rapidly; details not established. [07:35–11:45](https://youtu.be/WenRGpJhoqA?t=455): party-on bonus still active, avoids rehab; upgrades all 6 trailers from cheap to comfortable, larger footprint means existing decorations moved to fit; temporarily no trailers hurts satisfaction. [11:47](https://youtu.be/WenRGpJhoqA?t=707): cannot research more because next research tier gated by $1m/proficient milestone. [12:31](https://youtu.be/WenRGpJhoqA?t=751): 1950s costume update and training new action team. [15:21–30:35](https://youtu.be/WenRGpJhoqA?t=921): creates Western action custom script from blank with simple structure, character names, costume colors, horses as props, saloon confrontation/shootout, carrying and jail scenes, extras in ambient roles. Corrects role direction per shot; scene availability differs by set. [30:35–32:11](https://youtu.be/WenRGpJhoqA?t=1835): script2 stars, requires6 extras (surprise), director added at casting, film starts shooting. Regular comedy writers continue for cash support. No finished film this episode. Inferred implementation checks: extra requirements derive from active per-scene roles; cast membership shared across scenes; scene preview and selected roles need parity with actual produced movie; hiring/firing state may permit reversing before exit.

#### Visual checkpoint 04–05

All 12 stills each viewed in `04.sheet.jpg` and `05.sheet.jpg`, with exact source offsets and individual hashes in corresponding pins JSON. Ep4: trailer cluster construction, wardrobe editor with clothing/appearance columns, black-and-white desert movie playback, Studio Charts five-star metric rows. Ep5: custom-script office production targets, searchable scene-selection window, scene previews and emotional direction controls, released two-color film playback. These establish UI routes visually; fine menu labels generally require360p or higher follow-up.

##### 12 — Blazing Stallions (2/2) (29:15)

Full captions read; sampled visuals are documented separately. [00:00](https://youtu.be/XxIPKG6nv10?t=0): narrator reports color-coded mannequins for required/optional roles, but colorblindness means exact colors/rule not confidently established. [02:07–11:15](https://youtu.be/XxIPKG6nv10?t=127): starts quick comedy while big Western shoots, assigns one shared extra; Western stalls with extras unavailable, resumes when comedy finishes. Clear worker-contention behavior, not random pause. [11:15–13:57](https://youtu.be/XxIPKG6nv10?t=675): comedy Tipping The Scale released2 stars, chart#2. [16:53–19:37](https://youtu.be/XxIPKG6nv10?t=1013): improves1950s outfits; image happiness visibly/commentary improved, but cannot prove rank jump caused solely by clothes. [20:20–23:49](https://youtu.be/XxIPKG6nv10?t=1220): outdoor chin-up exercise bars raise physique and lower stress; photographers ignore workout. Sand visibly slows travel per narrator. [24:33](https://youtu.be/XxIPKG6nv10?t=1473): assistant assignment can fail while person is on set; repeatedly attempts to detach extras, not all attempts succeed. [26:01–28:10](https://youtu.be/XxIPKG6nv10?t=1561): Western released about2.5stars, poor star power despite high production effort, chart#9. New unknown actors gain fame. Inferred implementation checks: filming must wait for specific required personnel, reused workers schedule conflicts. Add required/optional role cues beyond color for accessibility. Film scope doesn't alone guarantee success.

##### 13 — Toby's Car (28:57)

Full captions read; sampled visuals are documented separately. [00:40–05:42](https://youtu.be/jr6TMizSHYA?t=40): socializing/bar reduces stress; repeatedly sells ~$5k romance scripts while trying to retain$1m bank milestone. [05:42–07:50](https://youtu.be/jr6TMizSHYA?t=342): awards won/lost; **loses Party On bonus**, so future alcohol can addict again; gains other modifiers (direction bonus for winning director, half price, faster research, genre-independent interest, freshness). Awards skipped, exact mapping needs stronger pixels. [11:20–21:42](https://youtu.be/jr6TMizSHYA?t=680): quick regular comedy all on bathroom set reduces travel; action team separately trains physique/relationships; snack truck/VIP toilets extend amenities. [21:42–23:55](https://youtu.be/jr6TMizSHYA?t=1302): Toby's Car is3 stars from2 star script and good stars/genre, ~$80k, chart#4. [24:36](https://youtu.be/jr6TMizSHYA?t=1476): explicitly addiction now possible because trait lost. [25:20–26:42](https://youtu.be/jr6TMizSHYA?t=1520): $1m bank milestone unlocks proficient scriptwriting; larger replacement doesn't fit original site, relocates building. Next milestone commentator reads earn$7m, release30films, cumulative35filmstars, bank$4m,8awards; rewards shown include war/tropical beach sets, exact numbers/rewards need UI follow-up. Inferred implementation checks: earned awards modify rules for finite period, do not persist forever; cash-in-bank and cumulative earnings are distinct conditions; larger facilities require footprint handling;3 star movie possible from2 star script.

##### 14 — The Mole (Part1) (29:41)

Full captions read; sampled visuals are documented separately. [00:00–01:24](https://youtu.be/UUpassJG-kw?t=0): cosmetic surgery built to improve looks, separate from wardrobe fashion and physique exercise. [01:24–25:13](https://youtu.be/UUpassJG-kw?t=84): custom action/buddy/cop film; chooses character identities, era clothes, props/car consistency, traveling-vehicle background, chase/fight/shoot scenes, alternative scenes when desired animation unavailable. Grayed-out set interpreted as unowned (narrator uncertain). Need consistent backdrop per scene, not globally inherited. [23:47–25:13](https://youtu.be/UUpassJG-kw?t=1427): attempts to disable all optional extras but casting still lists2extras, proceeds to learn where they show up; exact mismatch remains unresolved. [25:13–27:58](https://youtu.be/UUpassJG-kw?t=1513): nip/tuck takes time in facility, improves looks significantly, actor becomes bandaged transiently; implants/liposuction listed but later unlock. Performs procedure during shooting, may delay production; operation doesn't obviously alter in-world face to narrator. Script writing can switch genre without losing accumulated progress (commentator observation around26:35). Inferred implementation checks: surgery is time-consuming activity competing with production; preview/casting must faithfully show optional roles; different appearance metrics/facilities must be separate.

#### Visual checkpoint 06–09

Viewed all 12 stills per episode 6,7,8,9 via contact sheets; each individual's timestamp/hash in NN.pins.json. Ep6 custom editor shows scene cards and search plus director preview,1935 awards stage. Ep7 shows mannequins standing on set preview, wardrobe, physical cast summary and active low-cash/warning UI. Ep8 salaries table with per-star amounts and total, active cast/crew drag targets, film playback, release results. Ep9 studio chart and metric rows, release quality assessment, script/scene selection library, casting building targets and Western playback. Low resolution stills establish layout and routes, not exact numeric formulas.

##### 15 — The Mole (Part2) (22:39)

Full captions read; sampled visuals are documented separately. [00:00–04:14](https://youtu.be/0LkaktPW3qg?t=0): reopens movie currently filming, changes car-exit scene to two-person version to eliminate extras and restores prop/background. Changes force film to begin production again; prior shot footage lost/restarted. [07:42–10:32](https://youtu.be/0LkaktPW3qg?t=462): new costumes, surgery, cast/crew requirements; second comedy uses extras as leads to keep income; missing crew resolved by hiring applicant. [11:14–13:17](https://youtu.be/0LkaktPW3qg?t=674): buys four sets ~$150k to improve novelty, scarce lot space and connectivity. [14:38–16:02](https://youtu.be/0LkaktPW3qg?t=878):1955 awards; bonuses explicitly quality for winning director, genre-independent public interest, faster science. [16:42–19:32](https://youtu.be/0LkaktPW3qg?t=1002): second production had been stalled waiting extra; Mole costs extensive treasury, released3 stars, reviewer low PR; leftover extra and sound of war battlefield appear in completed film. [19:32–21:36](https://youtu.be/0LkaktPW3qg?t=1172): builds publicity office; production office Release target changes to Release Budget; tooltip explains publicity and marketing spend (readable visual pins detailed below). Inferred implementation checks: editing ongoing film has destructive restart consequence; clearly distinguish release from release budget once PR unlocked; background set audio/props persist into movie if not removed.

##### 16 — All Together Now (38:13)

Full captions read; sampled visuals are documented separately. [00:00](https://youtu.be/QvV61W2MfQ4?t=0): recording-driver issues caused posting gap; not gameplay engine issue. [04:04–06:49](https://youtu.be/QvV61W2MfQ4?t=244): completed movie goes through one PR cycle; public awareness still tiny, narrator chooses massive release budget. Photographs of socializing improve star publicity separately. [06:49–08:56](https://youtu.be/QvV61W2MfQ4?t=409): recent tech lifts completed film from3 to4 stars; first4 star release. Review says marketing hugely outweighed PR and may hurt takings, yet chart#1; mismatch isn't hard blocker. [09:38–37:19](https://youtu.be/QvV61W2MfQ4?t=578): rewrites generated action Western into sci-fi setting while genre remains action, not sci-fi. Wooden mannequin roles can be disabled; make all optional roles wooden/unassigned then disable them. Searches scene library by animation name, chooses shot angles, sets props, intensity and walking style. Extra's costume doesn't persist across scenes automatically; must restore each shot. No second release; rewritten13 scene film pending next episode. Inferred implementation checks: film genre is explicit metadata, independent of set theme; PR preparation is gradual; oversized marketing can lower return expectations; footage tech may reflect upgrade midproduction but exact evaluation instant unproved.

##### 17 — Space Fighty Guys (35:23)

Full captions read; sampled visuals are documented separately. [00:00–06:30](https://youtu.be/_FAtFmUPGwE?t=0): revises film continuity/colors and role swap; custom camera zoom/pan to show bodies, walking emotion changes ending. [07:50–09:15](https://youtu.be/_FAtFmUPGwE?t=470): **publicity office accepts idle actors but rejects extras**; can publicize during filming when actor not needed on set. Main actor/director mostly occupied. [09:57–12:44](https://youtu.be/_FAtFmUPGwE?t=597): props/cars lose contemporary appeal; replaces trailer cars with1960s models, affects trailer/star happiness. [15:29–16:49](https://youtu.be/_FAtFmUPGwE?t=929): union notice says must retire at70, warns10years in advance; actor ages and apparent ages differ. Older workers/extras age too, limiting replacement pool. [20:23–27:32](https://youtu.be/_FAtFmUPGwE?t=1223): promotes extra to young actor, new trailer/salary/makeover/assistant; converts low-skill builder to crew for staffing shortage. [29:40](https://youtu.be/_FAtFmUPGwE?t=1780): second actor cannot use PR office simultaneously. [30:22–34:33](https://youtu.be/_FAtFmUPGwE?t=1822): releases after some PR, middling release budget; PR superb and large quality boost,4 star film, ~$250k cost, chart#1 after studio cash falls to ~$250k. Optional horse prop survives despite disabling people. Inferred implementation check from commentary: per-office PR capacity of one and eligibility tied to actual actor availability, not whole movie completion; economy long-production runway matters; deactivating humanoid role doesn't remove separate prop.

##### 18 — The Biggest Day In The World (36:55)

Full captions read; sampled visuals are documented separately. [00:00–06:23](https://youtu.be/2I3o1HxAo_c?t=0): focuses quick film throughput and cash, lack of applicants despite rank; auto Western cast from existing pool. [06:23–09:15](https://youtu.be/2I3o1HxAo_c?t=383): releases comedy without deliberate PR, decent marketing yields 'good' PR/marketing score, chart#6 (can't infer explicit PR always required). [09:56–14:14](https://youtu.be/2I3o1HxAo_c?t=596): hires18 year-old new star for future romance, outfits/surgery/trailer preparation. Applicants start appearing after rank rises, causation not firmly established. [14:14–35:37](https://youtu.be/2I3o1HxAo_c?t=854): auto writer reuses same Western sets already occupied; rewrites comedy from scratch on graveyard. Character main/first supporting/second supporting bindings, costumes and colors, weather/backdrop consistency, emotional intensity, alternate camera angles; scene duration can be trimmed later in postproduction. **Wooden mannequins won't appear if unassigned**, narrator reads control tooltip~24:09. Custom film shows about3 star estimate and ~$13k at editor, explicitly only set/scene cost, not total production. Starts filming Gravedigger, no extra slots active. Inferred implementation checks: production can share sets but must schedule occupancy; optional person/prop controls separate; editor estimate and total final film cost must not be conflated.

##### 19 — The Grave Digger (46:07)

Full captions read; sampled visuals are documented separately. [04:12–05:37](https://youtu.be/gm56uYTSypo?t=252): awards modifiers include faster experience, winning-star quality, faster research, easier moods; no no-addiction modifier, drunk stars need sobering. [08:36–10:00](https://youtu.be/gm56uYTSypo?t=516): max filmmaking technology reached, CGI costumes/digital camera; scientists reassigned to facilities for plush trailers. [12:03–15:44](https://youtu.be/gm56uYTSypo?t=723): completed Western PR cycles; buys plush trailers, larger footprint causes decor collisions, treasury falls below$1m. [15:44–18:02](https://youtu.be/gm56uYTSypo?t=944): film3.5stars, marketing again outweighs PR, chart~#17. [23:39–31:14](https://youtu.be/gm56uYTSypo?t=1419): Gravedigger finished, repeated PR sequential actors,1970s fashion changes, implants for physique; cosmetic surgery single customer at time. [31:14–34:01](https://youtu.be/gm56uYTSypo?t=1874): Gravedigger near4 stars, ~$500k cost, chart#10 despite effort. [34:01–35:25](https://youtu.be/gm56uYTSypo?t=2041): watches veteran star retire with UI notice and departure,3.5star career; no grand event. [35:25–45:16](https://youtu.be/gm56uYTSypo?t=2125): shifts from aging comedy team to romance team, sells director/actors to competitors for cash (figures vary ~$11k–$27k), recruits19 yearold female director, young actors. Former star trailer can reassign to replacement. Inferred implementation checks: sale/retirement/dismissal distinct; retirement removes important cast capacity; fashion/bonuses/condition advance with time; expensive high-rated film can chart poorly, no success guarantee.

##### 20 — Love The Sinner (38:53)

Full captions read; sampled visuals are documented separately. **Attempted mod boundary:** [00:40–01:21](https://youtu.be/GK-HG5mMRKA?t=40) narrator says he installed a mod to increase job applicants, observes two new applicants. Do not treat subsequent staffing quantities as validated vanilla rules. Episode 21 later disputes whether mod took effect. [01:21–04:47](https://youtu.be/GK-HG5mMRKA?t=81): starts first romance with young actors/director; idle cast member goes to publicity while her first scene is much later. [06:54–12:32](https://youtu.be/GK-HG5mMRKA?t=414): extra shortage stalls new action film; hires rival star Simon Forester; converts worker to extra, salary/trailer requirements. [16:04–20:17](https://youtu.be/GK-HG5mMRKA?t=965): establishes expensive rival star's new trailer, wardrobe, salary and assistant; action team now three leads plus director. [23:48–24:29](https://youtu.be/GK-HG5mMRKA?t=1428): UI metric reading distinguishes nip/tuck for looks versus implants/liposuction for physique. [28:39](https://youtu.be/GK-HG5mMRKA?t=1719): urban office explicitly occupied by other film; waits to resume, not missing cast. [31:27–35:02](https://youtu.be/GK-HG5mMRKA?t=1887): first romance released after PR and middling budget, just below four stars, ~$250k, chart #17. [37:12](https://youtu.be/GK-HG5mMRKA?t=2232): retirement notice says director will finish current film before retirement; new director hired. Inferred implementation checks: occupied-set waits should resume when set frees; retirement must not be assumed to destroy current film. These are narrated observations until visually validated.

##### 21 — Detroit Crime City (32:03)

Full captions read; sampled visuals are documented separately. [00:00–02:45](https://youtu.be/pKg080DMt3k?t=0): builds second publicity office, demolishes underused bombed street set to fit newer sets. [02:45–21:26](https://youtu.be/pKg080DMt3k?t=165): custom romance written on modern street/corridor/bar, cast characters, establishing shot without people, scene order drag, deletion, exact scene search, per-scene costumes; trimming in postproduction discussed but not performed. [23:29–25:31](https://youtu.be/pKg080DMt3k?t=1409): final action scene waits extras; retires director only after film done. [24:50](https://youtu.be/pKg080DMt3k?t=1490): says applicant mod apparently did not work and thinks new save required; **effect uncertain**, not proof installation is absent. [25:31–27:41](https://youtu.be/pKg080DMt3k?t=1531): idle actors then finished film publicize; middle budget, PR superb; Detroit Crime City > four stars, ~$500k cost, chart #2. Inferred implementation checks: multiple office buildings may support parallel publicity; promoted role and established director distinction matter. Eligibility and capacity assertions are commentator observations, not universal predicates.

##### 22 — The Search For Cagney Malone (Part 1) (33:38)

Full captions read; sampled visuals are documented separately. [00:00–04:09](https://youtu.be/yUt4VGT-9AI?t=0): repairs sets before shooting; awards include winning-star quality, freshness regardless content, faster scientists. [04:09–05:31](https://youtu.be/yUt4VGT-9AI?t=249): selects zero-novelty office because freshness award expected to compensate; bonus modifies usual novelty constraint. [05:31–30:11](https://youtu.be/yUt4VGT-9AI?t=331): custom private-eye action film with characters, period wardrobe/props, explicit car/background consistency, scene order drag, camera composition and direction sliders; removes unwanted extras and later deliberately adds five extras for background life. Disabling actor can leave held object/prop floating or odd animation; changing scene often required to fit intended action. Editor estimate ~$14k described as sets, not final film cost. [30:11–32:57](https://youtu.be/yUt4VGT-9AI?t=1811): casts new action director, adds extras by reentering script editor before film starts; requires five available extras. No released movie in this episode. Inferred implementation checks: persistence across editor entry/exit and film cast preview must be tested; awards should not be modeled as permanent vanilla constants.

##### 23 — Double Feature! (29:35)

Full captions read; sampled visuals are documented separately. [01:21–02:43](https://youtu.be/Fgjy7fivzCw?t=81): sends unused actors to two separate publicity offices for two films concurrently. [04:47–05:27](https://youtu.be/Fgjy7fivzCw?t=287): repeats PR cycles while actor not needed on set; shared city street occupancy pauses other production. [10:21–11:44](https://youtu.be/Fgjy7fivzCw?t=621): scarce applicants, converts scientist to assistant assuming research nearly done; later discovers more research remains. [13:06–15:52](https://youtu.be/Fgjy7fivzCw?t=786): completed romance rejects further PR as already maximum; publicity and photos, large marketing budget, four-star movie. [18:39](https://youtu.be/Fgjy7fivzCw?t=1119): review says marketing outweighs PR despite PR maximum; chart #21. [20:08–23:38](https://youtu.be/Fgjy7fivzCw?t=1208): second action film final scenes; completed film also refuses more PR while public awareness still low, chooses lower budget. [26:30–27:50](https://youtu.be/Fgjy7fivzCw?t=1590): no obvious negative quality reviews but marketing/publicity overexposure warning; low chart result surprises narrator (exact chart numeral unclear in captions). Actor Daniel Purcell becomes #1 nonetheless. Inferred implementation checks: PR activity cap, awareness and release spending are separate quantities; maximum PR does not imply maximum budget appropriate. Low chart position is not evidence of broken production or bad ratings.

##### 24 — Love On Horseback (38:10)

Full captions read; sampled visuals are documented separately. [00:00–17:57](https://youtu.be/bp4-4lOKgA4?t=0): custom Western romance, reuses older sets now with recovered novelty; nine scenes, horses, love-interest bindings, role removal, character names and costumes, minimal extras. Narrator guesses roughly one-third star per scene; **not a validated formula**. [19:19–22:14](https://youtu.be/bp4-4lOKgA4?t=1159): starts shoot, one early PR actor cycle, plans restrained publicity after previous overexposure; surgery/physique for waiting action team. [22:14–25:42](https://youtu.be/bp4-4lOKgA4?t=1334): previous films gross under $1m, archives them; awards regained include freshness/genre/research/half-price bonuses. [27:42](https://youtu.be/bp4-4lOKgA4?t=1662): still below five-star studio target, $4m bank achievement blocks next unlock; explicitly declines to cheat money. [28:26–33:18](https://youtu.be/bp4-4lOKgA4?t=1706): buys modern sci-fi sets, auto scriptwriters keep choosing same Western sets; sells unwanted scripts then accepts Cougar Town Western for next action. [31:13](https://youtu.be/bp4-4lOKgA4?t=1873): tries sobering drunk star in water feature/tub, narrator uncertain exact availability. [33:59–37:30](https://youtu.be/bp4-4lOKgA4?t=2039): Love On Horseback released with some PR and modest budget, four stars, chart #16. Inferred implementation checks: chronology, awards and novelty interact; do not infer fixed scene-to-star math or guaranteed box-office return. Playlist ends with further film in progress; five-star goal and later milestone tiers not reached in available episode.

#### Prominent interpretation limits

- The entire series is described as base game at episode 1. Episode 1 uses nondefault sandbox settings; episode 2 restarts normal game. From episode 20 an applicant mod was attempted, whose effect episode 21 questions. No expansion gameplay is established; absence of other gameplay modifications is not proven.
- Every episode paragraph above is primarily a **caption commentary analysis**, except separately identified visual checkpoints/pins. Suggested implementation/test consequences are reasoned proposals, not a claim that every rule has been visually demonstrated or measured.
- Earned awards alter addiction, experience, research, genre/public interest, novelty, salary/quality behavior during portions of this run. They can be lost at later ceremonies. Always qualify the current award context before generalizing star/economy behavior.
- Captions and stills do not verify audio playback, arbitrary animation continuity, actual continuous equipment assembly/teardown, precise worker movement trajectories, PR formulas, save-game persistence or exported movie behavior.

#### Readable publicity office source pins

At [20:05](https://youtu.be/0LkaktPW3qg?t=1205), `15.publicity.1205.jpg` visibly shows production office floor targets: Release, Movie Player, Finance, Reviews, Archive. At [21:41](https://youtu.be/0LkaktPW3qg?t=1301), `15.publicity.1301.jpg` shows Release Budget replacing Release while a movie is selected/held. These frames do not establish the release transaction debit or cancellation semantics.

At [21:52–21:58](https://youtu.be/0LkaktPW3qg?t=1312), `15.tooltip.1312.jpg`, `.1315.jpg`, `.1318.jpg` visibly show the Publicity Office and readable help. Paraphrase: send the film itself or one of its stars into the publicity office for PR; marketing spending is separately allocated at production; recommended awareness should match film quality. This corrects the noisy caption's apparent suggestion of dropping a film onto an actor. Local SHA256 locators are in `15.publicity.pins.json` and `15.tooltip.pins.json`.

No cancellation, payment refusal, debt response, file export or voiced dialogue was established by this bounded clip. The figure on the publicity building's rooftop billboard changes across frames; that visual change does not alone prove which star or film is being publicized.

#### Visual checkpoint 10–23

Every generated uniform pin in episodes 10–23 has now been viewed in its contact sheet, in chronological order. Pins have exact timestamps and SHA256 in the manifest. Selected observations beyond captions: episode 11 achievement requirements/rewards occupy separate certificate UI; episode 12 release report lists cast and production financial detail; episode 13 achievement UI advances and building is demolished/replaced; episode 14 custom editor shows shot timeline, mannequins and direction sliders; episode 15 surgical facility has distinct drop areas; episode 16 has searchable shot library and timeline; episode 17 shows physical casting targets and costume preview; episode 18 shows emotional sliders below shot preview and multiple cast bindings; episode 19 salaries have distinct per-star rows and total; episode 20 surgery floor labels visibly separate Nip & Tuck, Implants, Liposuction; episode 21 shows two publicity-office buildings and custom scene ordering controls; episode 22 camera preview includes wooden extra mannequins in car; episode 23 has both in-lot status bubbles and completed film release assessment. Fine scores at 144p remain unreliable. These are screenshots at isolated instants, not proof of all transitions between them.

#### Final visual checkpoint and maximum PR rejection

Episode 24's 12 uniform stills all viewed: wardrobe, scene search/preview and timeline, Western scene preview, awards stage, lot construction and decoration. Across all 24 episodes, 312 still pins were inspected (287 baseline pins, 13 focused episode 15 pins, 12 focused episode 23 pins). Episode 1 baseline comprises eight 144p cues and three 360p settings cues; episodes 2–24 each have 12 uniform 144p cues. Focused pins use 360p. Baseline sampling intervals range roughly 1.7–4.2 minutes depending on duration and include some end cards; they cannot establish every transient visual event. Some episode extracts logged H.264 short-reference decoding warnings; representative frames were generated and inspected, but these stills are not a guarantee of frame-perfect coverage.

Readable source [13:39–13:41](https://youtu.be/Fgjy7fivzCw?t=819): `23.message.819.jpg` and `.821.jpg` show the held completed film over the publicity office's PR floor target. A visible message reports that PR for this film is already at maximum. At [13:43–13:45](https://youtu.be/Fgjy7fivzCw?t=823), `.823.jpg` and `.825.jpg` show it still held and returned toward production's Release Budget targets; this does not start another visible PR progress cycle. The movie's held-object bubble separately contains a public-awareness bar. These particular stills establish rejection and retained object, not precise PR/awareness values or a price transaction. `23.message.pins.json` provides hashes.

The earlier `23.prmax.*.jpg` pins at 787–815s show publicity/production buildings, set layout and the edited jump from September 1976 to May 1978; they did not catch the rejection itself. This is logged to avoid pretending that sparse pins independently show what the later, correctly placed cues establish.

Unresolved reconstruction questions: no complete crew/equipment assembly→shoot→next-set→teardown chain has been continuously inspected here; no new native eligibility formula, bone/animation rig data, sound provenance, title/export persistence or saved-game contract is established. The qualified findings above support route/UI design and test cases; exact simulation constants require independent evidence or direct testing.

#### Deliverables and publication boundary

Use `GEEKISM.md`, `GEEKISM-coverage.md` and `GEEKISM-coverage.json` as the text evidence packet. All 24 entries include title, runtime, exact frame timestamps/source URLs, caption provenance, frame hashes and coverage limits. Raw caption files, YouTube metadata, still screenshots, contact sheets, logs and helper scripts are local working evidence only. All downloaded owned media has been removed after frame extraction; no proprietary image is a distributable game asset.

#### Acquisition provenance audit

All final baseline pinsets use explicit format 160 over HTTPS progressive, verified in each full metadata file. All five focused 360p acquisitions use format 134 over HTTPS progressive; retained logs show HTTPS input and no HLS, fragment skipping or acquisition error. Episode 1’s initial HLS format 269 attempt was interrupted and supplied no pins. No compressed-timeline timestamp claims were identified by this audit.

Downloaded media was deleted after extraction, so decoded durations cannot be retrospectively checked for episodes 2–24. Episode 1’s watch report retained a probed duration of 2180.2 seconds. Flat playlist runtimes total 44,828 seconds while full per-video metadata runtimes total 44,816 seconds; these metadata sources differ by 0–1 second per affected video. The 12-second aggregate difference is not evidence of skipped fragments. Pin offsets are the requested source seek times; frame timestamps are not a frame-accurate motion oracle.


## Retained report E: Geekism episode coverage and acquisition audit

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM-coverage.md).

### Episode coverage manifest

All available English automatic caption text was read for all 24 videos. Frame sampling is sparse; it is not full motion or audio coverage. Exact source times, local frame locators and SHA256 hashes are in GEEKISM-coverage.json. Screenshots and raw captions remain local.

| Episode | Source | Runtime | Captions | Still pins | Visual status |
|---|---|---:|---|---:|---|
| 01 | [🎥 Neville's Devils \| Let's Play The Movies #01](https://www.youtube.com/watch?v=DgUQHt1AgAY) | 36:21 | Available track read | 11 | viewed all generated pins |
| 02 | [🎥 Tidgy Gets A Biscuit \| Let's Play The Movies #02](https://www.youtube.com/watch?v=u-Tq_b5KTI8) | 24:55 | Available track read | 12 | viewed all generated pins |
| 03 | [🎥 Tinymen \| Let's Play The Movies #03](https://www.youtube.com/watch?v=12jqKxiFPIQ) | 18:51 | Available track read | 12 | viewed all generated pins |
| 04 | [🎥 Bang Bang We're Dead \| Let's Play The Movies #04](https://www.youtube.com/watch?v=yqRncTT7CX0) | 25:44 | Available track read | 12 | viewed all generated pins |
| 05 | [🎥 The Brain Readers \| Let's Play The Movies #05](https://www.youtube.com/watch?v=dL2avF7d4h8) | 29:32 | Available track read | 12 | viewed all generated pins |
| 06 | [🎥 This Is A Muck Up! \| Let's Play The Movies #06](https://www.youtube.com/watch?v=KKMXXE9nosY) | 27:21 | Available track read | 12 | viewed all generated pins |
| 07 | [🎥 Killer Fembots From Mars \| Let's Play The Movies #07](https://www.youtube.com/watch?v=dun_VB5idoc) | 31:22 | Available track read | 12 | viewed all generated pins |
| 08 | [🎥 Stinky! \| Let's Play The Movies #08](https://www.youtube.com/watch?v=e5D8qT77W8o) | 23:17 | Available track read | 12 | viewed all generated pins |
| 09 | [🎥 The Kid Rode Away \| Let's Play The Movies #09](https://www.youtube.com/watch?v=xQdWGCp8tNA) | 28:16 | Available track read | 12 | viewed all generated pins |
| 10 | [🎥 Alpha Male \| Let's Play The Movies #10](https://www.youtube.com/watch?v=3puqhVgbEgI) | 28:43 | Available track read | 12 | viewed all generated pins |
| 11 | [🎥 Blazing Stallions (1/2) \| Let's Play The Movies #11](https://www.youtube.com/watch?v=WenRGpJhoqA) | 33:17 | Available track read | 12 | viewed all generated pins |
| 12 | [🎥 Blazing Stallions (2/2) \| Let's Play The Movies #12](https://www.youtube.com/watch?v=XxIPKG6nv10) | 29:15 | Available track read | 12 | viewed all generated pins |
| 13 | [🎥 Toby's Car \| Let's Play The Movies #13](https://www.youtube.com/watch?v=jr6TMizSHYA) | 28:57 | Available track read | 12 | viewed all generated pins |
| 14 | [🎥 The Mole (Part 1) \| Let's Play The Movies #14](https://www.youtube.com/watch?v=UUpassJG-kw) | 29:41 | Available track read | 12 | viewed all generated pins |
| 15 | [🎥 The Mole (Part 2) \| Let's Play The Movies #15](https://www.youtube.com/watch?v=0LkaktPW3qg) | 22:39 | Available track read | 25 | viewed all generated pins |
| 16 | [🎥 All Together Now \| Let's Play The Movies #16](https://www.youtube.com/watch?v=QvV61W2MfQ4) | 38:13 | Available track read | 12 | viewed all generated pins |
| 17 | [🎥 Space Fighty Guys \| Let's Play The Movies #17](https://www.youtube.com/watch?v=_FAtFmUPGwE) | 35:23 | Available track read | 12 | viewed all generated pins |
| 18 | [🎥 The Biggest Day In The World \| Let's Play The Movies #18](https://www.youtube.com/watch?v=2I3o1HxAo_c) | 36:55 | Available track read | 12 | viewed all generated pins |
| 19 | [🎥 The Grave Digger \| Let's Play The Movies #19](https://www.youtube.com/watch?v=gm56uYTSypo) | 46:07 | Available track read | 12 | viewed all generated pins |
| 20 | [🎥 Love The Sinner \| Let's Play The Movies #20](https://www.youtube.com/watch?v=GK-HG5mMRKA) | 38:53 | Available track read | 12 | viewed all generated pins |
| 21 | [🎥 Detroit Crime City \| Let's Play The Movies #21](https://www.youtube.com/watch?v=pKg080DMt3k) | 32:03 | Available track read | 12 | viewed all generated pins |
| 22 | [🎥 The Search For Cagney Malone (Part 1) \| Let's Play The Movies #22](https://www.youtube.com/watch?v=yUt4VGT-9AI) | 33:38 | Available track read | 12 | viewed all generated pins |
| 23 | [🎥 Double Feature! \| Let's Play The Movies #23](https://www.youtube.com/watch?v=Fgjy7fivzCw) | 29:35 | Available track read | 24 | viewed all generated pins |
| 24 | [🎥 Love On Horseback \| Let's Play The Movies #24](https://www.youtube.com/watch?v=bp4-4lOKgA4) | 38:10 | Available track read | 12 | viewed all generated pins |

Known changes: episode 1 nondefault sandbox; episode 2 restarts normal game; episode 20 attempted staffing mod, whose effectiveness episode 21 questions. Earned awards change rules for limited periods. Exact gameplay formulas, audio and continuous equipment lifecycle remain unverified.

Provenance audit: all baseline images derive from format 160 HTTPS progressive files; focused 360p pins derive from format 134 HTTPS progressive. No skipped-fragment evidence found in retained final download logs. Episode 1’s interrupted initial HLS attempt supplied no pins. Decoded durations were not retained for episodes 2–24, so retrospective duration confirmation remains unavailable. Flat playlist runtime totals 44,828 seconds; full per-video metadata totals 44,816 seconds (12 seconds aggregate rounding difference).


## Retained report F: Call Me Kevin: UI, prices, authoring and release

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/KEVIN.md).

### Call Me Kevin — The Movies observation notes

Source: [full video](https://www.youtube.com/watch?v=GNA4MAzei4s), Call Me Kevin, uploaded 2024-02-20, 25:51 listed duration. Local source probe: 1550.5 seconds, 854×480. Read full native English **automatic** caption track; inspected 116 timestamped frames chronologically using contact sheets, with selected UI frames also read at full size. This is sampled coverage, not every-frame viewing; no original audio was listened to. Screenshot paths, exact SHA-256, and timestamp URLs are in `KEVIN-coverage.json`. Images remain local.

Edition: metadata description names The Movies; observed studio and Advanced Movie-Making UI supports that identification. No installer/title screen/expansion declaration or mod list appears in inspected evidence. Base-only vs Stunts & Effects/modded installation is **unverified**. At 21:37 the visible “This Pack Unlocked” popup is a dated technology unlock (color, Reflex Camera, 35mm Film), not evidence of an installed expansion.

| Time / screenshot ID | Visible UI/action/outcome | Reconstruction / acceptance consequence |
|---|---|---|
| [0:12](https://www.youtube.com/watch?v=GNA4MAzei4s&t=12s), A001; 0:24 A002 | Isometric lot, building footprint with red perimeter; subsequently building scaffolding. Buildings lie immediately behind gate. | Placement preview, placement validation, construction phase, paths/gate/lot need observable states. Narrator says entrance blocked; this sample alone cannot prove pathfinding failure. |
| [0:33](https://www.youtube.com/watch?v=GNA4MAzei4s&t=33s), A004 | Scrollable Sets list shows price + owned count; hover card has image, description, “Novelty Value” meter. Stage card says suitable for basic movie scenes/practicing comedy roles. | Catalog must carry price, ownership, novelty and role/genre context. See exact-price table below. |
| [0:55](https://www.youtube.com/watch?v=GNA4MAzei4s&t=55s), A005; 1:17 A008 | Advanced Movie-Making dialog: editable title, Genre (Sci-Fi), Structure (Simple), Leading Roles: Lead + two Supporting slots, per-slot enable boxes, cast/name labels; yellow mannequins for empty slots. | Authoring starts with metadata and cast-role configuration. Can use one role (9:00/19:47/22:00 show supporting roles removed/disabled). |
| [1:00](https://www.youtube.com/watch?v=GNA4MAzei4s&t=60s), A006; 2:00 A011 | Ground drop zones: Create Actor / Create Director / Create Extra / Fire. Casting footprint includes Director, Lead Roles, Crew, Extras, Shoot It; Begin Casting on script workflow. At 20:20 A078 counters read Lead Roles 1/1, Crew 1/3, Extras 0/0. | Drag/drop people into jobs and production assignments; expose required/current counts, production readiness. Exact enforcement when crew is incomplete is unknown. Commentary says a janitor becomes actor, later star becomes builder; transition cannot establish universal job rules. |
| [1:30](https://www.youtube.com/watch?v=GNA4MAzei4s&t=90s), A009; 1:46 A010 | Makeover Department screen names selected actor; costume carousel (Classic Werewolf / Priest), skin options, cosmetics categories. | Per-role costume selection visible. Same actor plays machine and priest per commentary; do not infer simultaneous casting limits. |
| [2:46](https://www.youtube.com/watch?v=GNA4MAzei4s&t=166s), A017; 6:23 A031 | Selected person bubble exposes Work Stress and Status bars (Image/Trailer/Entourage); salary dissatisfaction later visible. Red exclamation icons and tantrum animation visible at 14:30 A055. | Staff needs/status and observable interruption states. Mood-to-output weights and tantrum thresholds unknown. |
| [3:18](https://www.youtube.com/watch?v=GNA4MAzei4s&t=198s), A019; 3:20 B006 | Camera/crew/actors physically on Stage; script bubble “Moonworm is ready for release!”. | Production proceeds on built sets then changes to ready-for-release state. Creator’s cuts prevent measuring production duration. |
| [4:54](https://www.youtube.com/watch?v=GNA4MAzei4s&t=294s), B007 | Released results: Script Quality; director + stars; “Mood + Experience + Genre Fit = Performance”; Star Relationships AVERAGE, Repair Of Sets SUPERB, Crew Experience POOR; Movie Quality; Star Power POOR, Genre Interest GOOD, Novelty Value SUPERB, Technology STANDARD. | Preserve separate script/performance/movie-quality/market factors; report reasoned breakdown, not a single opaque score. Visible labels establish factors, not numerical formula or weights. |
| [5:00](https://www.youtube.com/watch?v=GNA4MAzei4s&t=300s), A024 | “Your Movie On Your Staff And Studio” table: Stress, Wages Earned, Experience, Star Rating, plus Crew Experience gains. | Release feeds back into staff progression/pay/stress. |
| [5:27](https://www.youtube.com/watch?v=GNA4MAzei4s&t=327s), A026; 5:35 A028 | New saloon chosen, then scene thumbnail “Drunk Talk.” | Scene library is set-specific; repeated scenes are possible per narrated four-scene cash-in (not all individual insertions sampled). |
| [11:03](https://www.youtube.com/watch?v=GNA4MAzei4s&t=663s), A046 | Completed script ground UI includes Release and Movie Player. | Film can be released and watched. Commentary explicitly archives old films at ~11:02; archive action itself not legible in sample. |
| [13:00](https://www.youtube.com/watch?v=GNA4MAzei4s&t=780s), A050 | Ranked Films list interleaves own highlighted titles with competitors. | Film rankings and studio competition are visible; ranking formula unknown. |
| [15:00](https://www.youtube.com/watch?v=GNA4MAzei4s&t=900s), A057; 24:07 A095 | Movie Review page gives several critic blurbs covering actor, direction, script, novelty, condition and overall prospects. | Release review should explain multiple quality dimensions; no need to reproduce copyrighted blurb text. |
| [15:20](https://www.youtube.com/watch?v=GNA4MAzei4s&t=920s), A058–059 | Car decoration placement preview; multiple cars line lot paths/gate. | Lot décor is placeable independent of functional roads; narrator associates cars with green attractiveness dots, but causal magnitude not proven. |
| [16:10](https://www.youtube.com/watch?v=GNA4MAzei4s&t=970s), A062 | Star Salaries screen: individual annual salaries; plus/minus controls; Salary Satisfaction, Current Influence, Future Influence, Total Annual Salaries. David $6,500; five others $6,000; total $36,500. | Salary adjustment gives preview of future influence and changes total payroll. These are session values, not universal defaults. |
| [16:30](https://www.youtube.com/watch?v=GNA4MAzei4s&t=990s), A063; 17:30 A066 | Cosmetic look “Post-implant Bandages”; later man operates basketball object beside bath furniture. | Wardrobe/cosmetic customization and usable recreation furnishings. No surgical effect size established. |
| [18:02](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1082s), A069 | Stars ranking details: Value $18,573; rank 23rd; factors Movie Success, Salary ($8,000), Performances, Image, Entourage, Trailer, Press, Relationships, Awards with diamond indicators. | Multi-factor star progression, plus relative ranking. Commentary suggests relationships/trailers/entourage boost fame; visible chart supports factor inclusion, not exact deltas. |
| [20:00](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1200s), A077 | Scene preview title “Going Insane”, timeline, “Disturbance: Frenzied” slider, mannequin background actors, character preview, checkmark. | Scene templates have adjustable parameters and preview playback. This frame shows script running cost $953; not final production cost. |
| [20:45](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1245s), B013 | Movie Quality and Final Movie Rating show empty stars; still has market factors and eye/play icon. | Zero-rated films are representable and releasable. Creator says cost ~$7k and soon breaks even, but exact financial numbers not visible in this pin. |
| [21:30](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1290s), A083; 21:35 A084 | Script Office: Basic exposes Horror, Romance, Sci-Fi, Action, Comedy ground zones. Unemployed Richard Etches tooltip: Scriptwriting, Starting Salary $1,000. | Hire scriptwriter by assignment and request genre-based scripts. |
| [21:37](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1297s), B015; 22:00 A086 | April 1962 technology popup unlocks color/Reflex Camera/35mm Film. Generated “Where’s Baby?” is open in same Advanced Movie-Making UI, Romance, Freeform, one lead. | Date-based technology notifications; generated script can enter editor, per commentary explicitly edited. The amount/retroactivity of mid-shoot tech effects remains unknown. |
| [23:58](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1438s), A093 | Staff physically picked up near star/trailer; entitlement/relationship bubble afterward (24:00). | Commentary says extra assigned as entourage. Exact drop-zone label missed; entourage is independently visible as star-chart factor. |
| [24:17–25:49](https://www.youtube.com/watch?v=GNA4MAzei4s&t=1457s), A096–099 | Finished film playback moves from taxi exterior to house/kitchen/bath to starship set; actor costumes differ. | Script supports multi-set sequential scenes and credits. Creator provides joking spoken lines over playback; **no evidence here of native dialogue generation**. |

Exact visible catalog prices (session/era-specific, not timeless balance constants):

| Source pin | Item | Price |
|---|---|---:|
| A004 0:33 | Rural: Musty Cellar / Shack Exterior / Shack Interior | $5,000 / $67,000 / $29,000 |
| A004 0:33 | Sci-Fi: Corridor 1 / Starship Bridge 1 | $26,000 / $17,000 |
| A004 0:33 | Stage / Suburban: Bathroom / Living Room 1 / Traveling Vehicle: Automobile | $2,000 / $17,000 / $37,000 / $28,000 |
| A015 2:30 | Restaurant / Restroom Large / Small / VIP | $30,000 / $12,000 / $3,000 / $20,000 |
| A015 2:30 | Script Office Basic / Intermediate / Snack Van / Stage School / Star & Script Selling Facility | $6,000 / $20,000 / $3,000 / $5,000 / $3,000 |
| A026 5:27 | Wild West Saloon / Bank / Desert / Jail / Street | $8,000 / $16,000 / $7,000 / $23,000 / $80,000 |
| A052 13:45 | War Battlefield / Bombed Street / Urban Shabby Hotel Room / Subway Carriage | $5,000 / $74,000 / $26,000 / $47,000 |
| A014 2:25, A065 17:05 | Cosmetic Surgery | $60,000 |

Confounds/unknowns: jump cuts, fast-forward, facecam, extreme zooms, inserted gag movie poster at 1:25, black transition frames, and editor overlays obscure some controls. No awards ceremony, full scene insertion flow, loan/bankruptcy handling, path blockage enforcement, unlock prerequisites, financial formulas, saving/exporting, expansion proof, or mod status was established. Narrated amounts (~$20k production at 14:53, ~$7k at 20:46, revenue comments) are **commentary**, not verified exact UI prices.


## Retained report G: Foredoomer: expansion longplay and focused equipment observations

[Immutable original report](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/LONGPLAY.md).

### Foredoomer longplay — expansion-qualified evidence

Source: https://www.youtube.com/watch?v=_BRrABJXZCA ; “The Movies Part 1 Full Game - Sleepy Longplay Walkthrough No Commentary”, Foredoomer Longplays, duration13,930s, upload2025-04-07. Description does not identify edition; no captions/chapters returned. Opening pixels do identify it.

**Observed/high confidence:** at00:00, menu logo reads “The Movies Stunts & Effects Expansion Pack”. This is expansion footage. It may corroborate shared behavior, but exact base-game rules require independent retail-base/manual/native support. No build number or mods qualified.

Initial inspected coverage:0–20s four scene-selected frames;144–174s eight uniform frames;3600–3606,7200–7206,10800–10806 two frames each. All 18 selected images individually inspected. Whole-timeline sweep is now complete: 233 selected frames from 0 to 13,920 seconds at a 60-second cadence, all inspected in chronological contact sheets. These 144p frames establish broad UI/states; small text, exact gestures, quantities and transitions between samples remain unverified. No captions exist and original audio was not listened to. See [coverage and hashes](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/LONGPLAY-coverage.json). Local clip offsets are nominal until independently synchronized against original keyframe/preroll.

| Nominal source locator | Observed | Consequence and unknown |
|---|---|---|
|00:00|Expansion menu explicitly labeled.|Keep expansion evidence separate from base game.|
|02:28|“Script Office: Basic”, Build Progress, scaffolding and red$6000 label.|Construction has a pending state; do not infer duration from sparseframes. Cash changed$6016, so not an isolated$6000 ledger witness.|
|02:39|Landscape Tools tooltip “Path:$20”; explains staff travel and poor appearance from large slabs.|Player-facing guidance, not verified beauty/pathfinding formula.|
|02:43/02:50|Translucent path previews display$400/$280.|Preview cost and committed debit are distinct; tile counts not established.|
|01:00:00|Casting floor shows Director, Lead Roles, Crew3/3, Extras1/1, Begin Casting, Shoot It. Film “Tumblewood”, Action, Rehearsing Script.|Film-specific staffing UI; not universal three-crew rule or nativekind identity.|
|01:00:03|Another film “Stinky”, Comedy, On Release, revenue$25,978 while casting continues.|Concurrent film lifecycle/UI acceptance witness; not revenue formula.|
|02:00:00|“Hell Water”, Action, Assembling On Set; Shooting Schedule lists three Wild West: Traveling Vehicle entries. Cast&Crew shows one person Heading for set and others Waiting for shooting to begin; Extras2,Crew4.|Visible per-person travel/wait states and film-specific counts. Do not equate factory binding with arrived/ready shooting. Three schedule rows are not proved three distinct sets.|
|03:00:00|Casting floor Crew3/3 Extras1/1; “The Conscience of Money”, Action, Rehearsing Script; unlock bubble names Wild West: Saloon Bedroom and asks left-click to continue.|Research notification acknowledgment is player-visible; no exact unlock threshold inferred.|

Local retained artifact root: /Users/zacheryspector/watch-skill-test-20261024 . Reports: intro-report.md, watch-report.md, scout-3600-report.md, scout-7200-report.md, scout-10800-report.md. Opening locator output/watch-0ye5r40e/frames/frame_0001.jpg. Raw screenshots are not redistributed in GitHub. Source and screenshot hashes will accompany reconciled final coverage.

These are source observations, not implemented behavior or passing engine tests. The base-game edition distinction is resolved for this recording; affordability, cancellation, PR timing and hidden numerical rules are not.

#### Whole-timeline index

Every row below is a **sampled visual observation from the expansion**, not a continuous-motion or base-game rule. Times locate useful replay intervals; exact screenshot timestamps and SHA256 identities are in LONGPLAY-coverage.json. No source footage is distributed.

| Source interval | Visible route/state | Use and limits |
|---|---|---|
|[00:00–15:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=0s)|Expansion menu, lot construction scaffolds, facilities/sets catalogs, hiring and casting floor destinations.|Startup/layout reference; individual debit and path enforcement unproved.|
|[16:00–19:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=960s)|People assembled at Stage; later samples show people leaving its front.|Candidate dense follow-up for production teardown. Minute samples cannot locate equipment spawn or prove individual identities persist.|
|[21:00–30:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=1260s)|Released quality page, more casting and set work, then movie title playback.|Repeated production/release/playback loop; no box-office formula or isolated balance witness.|
|[38:00–57:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=2280s)|Casting counters, script genres, Production Office destinations, western interior/desert filming and construction.|Several active tasks coexist. Staffing counts are film-specific.|
|[58:00–59:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=3480s)|Film title/credit card then color scene playback.|Film presentation reference; no audio/color unlock timing established.|
|[1:00:00–1:32:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=3600s)|Further casting, set construction, staff at western sets, review pages.|Persistent studio growth and multiple movie cycles; dense action timing unknown.|
|[1:33:00–1:59:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=5580s)|Advanced Movie-Making for Hell Water, cast-role slots, set/scene thumbnail libraries and filters, accumulating scene timeline, scene previews, camera/lighting/weather controls; returns to lot.|Useful authoring workflow, but expansion camera/scene content must not be imported as confirmed base-game requirements. Edits versus confirmation/cancellation/save boundaries not resolved.|
|[2:00:00–2:29:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=7200s)|Traveling-vehicle set, desert and western room show actors/crew activity and status balloons.|Independent scene/set progression candidate. Readable 2:00:00 scout above shows travel/wait statuses; minute samples do not prove dispatch criteria.|
|[2:30:00–2:44:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=9000s)|Close lot-camera views of actors, crew, a boom microphone and camera equipment, then vehicle/horse set.|Best close-up equipment interval in this recording. This remains lot simulation with HUD, not finished-film playback; no native attachment inference.|
|[2:47:00–2:50:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=10020s)|Finished film playback across western room, desert, dialogue and rainy scene.|Authoring choices produce distinct finished views. Original audio unreviewed.|
|[2:51:00–3:28:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=10260s)|Research/casting notifications, more facilities/sets, construction and repeated casting/shooting.|Longer studio development, not just initial tutorial film. Exact research requirements unproved.|
|[3:29:00–3:52:00](https://www.youtube.com/watch?v=_BRrABJXZCA&t=12540s)|Crew at room set, departure, playback/reviews, casting again, several later set shoots, final Production Office screen.|Late repeated production cycles; no save/reload/export, bankruptcy or publicity cancellation witness established.|

The 132 MiB full source was hashed, decoded and deleted. Selected local stills remain for audit; original source links allow targeted higher-quality checks. The video title's “Full Game” wording does not establish coverage of every game system.

Focused equipment check at nominal [2:32:00–2:32:06](https://www.youtube.com/watch?v=_BRrABJXZCA&t=9120s): six 720p stills, all inspected, show a crew person in blue overalls holding a boom pole as posture/location changes. The hand visibly meets the pole; this does not establish a skeleton attachment, native matrix or equipment spawn/despawn trigger. It is expansion footage and does not answer camera assembly/teardown. Exact hashes and nominal-offset limitation are in the coverage manifest.


## Immutable source register and cold-resume record

Original publication: [research PR13](https://github.com/HSpector1/the-movies-rea-research-20261014/pull/13). Evidence commit: `4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0`. This is a research-source pin, not the implementation HEAD of `HSpector1/The-Movies`.

| File | SHA-256 of original published file | Purpose |
|---|---|---|
| [COORDINATOR-ANSWERS.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/COORDINATOR-ANSWERS.md) | `120c1079a1726ce2a781bd2d98554cdf2a7d748b95162032e988f42dd6d73c83` | Original research narrative / coverage summary |
| [CREW-FOCUS-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/CREW-FOCUS-coverage.json) | `09856ad7fa6af591a3acfd13701e80fb20eac00dacccf830099982f2c83c2281` | Frame/source identities, timestamps and coverage |
| [FLABALIKI-LATE-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI-LATE-coverage.json) | `fa50363d89a5edb35cb7a0c0e75a1065fb525aeae0703539faba8f8dfe7f9d84` | Frame/source identities, timestamps and coverage |
| [FLABALIKI-LATE.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI-LATE.md) | `8ea7283579382e71c68fc13db501f7246b1806a07903375792c9a40c106b492f` | Original research narrative / coverage summary |
| [FLABALIKI-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI-coverage.json) | `bd18b6b46cb6a1fafe66659efdb1f95d4cbcd98e6a99007ff3f635168f51c7cf` | Frame/source identities, timestamps and coverage |
| [FLABALIKI.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/FLABALIKI.md) | `a8e00fda3eaa1fe1c75a5d4f0c38c6329d474915bfb72140a3a4b30f7f187828` | Original research narrative / coverage summary |
| [GEEKISM-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM-coverage.json) | `5d3cc925cfde1a948f89b6213c346dca23898b8ddcacac1b14926f18e3181fc5` | Frame/source identities, timestamps and coverage |
| [GEEKISM-coverage.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM-coverage.md) | `6d75f1757fdd14baa6c0db3968b3a2a714d65e289c48c8b98cb34742bbc3f34b` | Original research narrative / coverage summary |
| [GEEKISM.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/GEEKISM.md) | `ea90260671d0b5c51704284f448cf3d5acba243de7a2b906046726dc86b782a8` | Original research narrative / coverage summary |
| [KEVIN-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/KEVIN-coverage.json) | `1f0dac13525d0edb3edc74e21bf88d37072a1287b89d60d99d9e5a6d48d49fd1` | Frame/source identities, timestamps and coverage |
| [KEVIN.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/KEVIN.md) | `8bbb26e0d3ca8fcf8203aa1b4f2f2757cc22cdacd15f682065b2e39bf4be0ba6` | Original research narrative / coverage summary |
| [LONGPLAY-coverage.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/LONGPLAY-coverage.json) | `733d37d11defe15fc1eb4ae67eeb99eadbd9f26cc4680feb35ef887b6fb57b23` | Frame/source identities, timestamps and coverage |
| [LONGPLAY.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/LONGPLAY.md) | `c53bb2b3a1456603d99a17c55a29ca4676cc9511af6b04efca0a0a6abb69c84c` | Original research narrative / coverage summary |
| [REA-SUMMARY.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/REA-SUMMARY.md) | `4e3e5ccf01652f40e23014f58f6706f98a6c894cac6125700aaabe693b5f5734` | Original research narrative / coverage summary |
| [README.md](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/README.md) | `4f354cf4b330f754067bf7b4d060c822c9f98b1796ce4dda5ff1aafd4df96001` | Original research narrative / coverage summary |
| [inventory.json](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/4b9cbebeb8307be6a3ae7b7bcbb3498d84d2c3b0/docs/research/video-evidence-20261024/inventory.json) | `73890f69efacce9b3d2934bd35d9060bc87f982485c2c0ab1f1b77b1a311130f` | Frame/source identities, timestamps and coverage |

### Exact next action for a returning REA agent

Read this synthesis, then the active coordinator's latest question and actual code/evidence baseline. Reuse the relevant retained report and manifest before acquiring anything. The most consequential open visual gate is the uninterrupted crew/equipment lifecycle; the most consequential marketing gates are affordability/debt, cancellation and full admission; audio still needs direct listening. Choose the one that blocks the active slice. Record edition/settings, source identity, exact locator, modality, observation versus inference, result and stopping condition. Leave closed investigations closed.

This recap preserves the full assigned video pass and its findings. It does not claim exhaustive knowledge of the original game's feature catalog, hidden rules or all 25 hours of continuous motion/audio. Its value is that another agent can see precisely what was established, where to find it, what was corrected, and what still needs evidence.
