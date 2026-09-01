# CODEX — PERIOD-GAME AUDIO COMPARATOR ATLAS 01

**Project:** Project: Studio  
**Status:** DECISION-READY RESEARCH CANDIDATE  
**Scope:** documentation and reference calibration only  
**Research date:** 2026-08-31  
**Implementation authority:** none  
**Audio-generation authority:** none

This atlas asks what historically set games can teach Project: Studio about era recognition, background-music endurance, radio, and the boundary between documentary plausibility and cinematic interpretation. It does **not** authorize reuse of any comparator's recordings, compositions, arrangements, dialogue, code, data, or proprietary implementation.

## 1. Evidence language and method

Every material statement uses one of these labels:

- **SOURCE-DERIVED FINDING** — directly supported by an official source or named developer testimony.
- **TECHNICAL INFERENCE** — a bounded design inference from the cited evidence; not a disclosed fact about the comparator's implementation.
- **ARTISTIC INTERPRETATION** — an aesthetic reading that must be tested by listening.
- **PROJECT: STUDIO RECOMMENDATION** — a proposed direction for this project, not a claim about another game.
- **OPEN EVIDENCE** — the retained corpus does not establish the answer. Silence is not treated as proof.

The research retained ten comparators. Selection required at least one of the following: a useful primary/developer source; a deliberate distinction between score and diegetic music; documented interactive-music behavior; documented long-session selection practice; or direct relevance to a management game. The atlas does not rank the games. It extracts different lessons from different production problems.

### 1.1 The ten questions

Each comparator answers the same questions:

1. What year or period does it represent?
2. Does it use licensed period recordings, newly composed period-inspired score, diegetic radio, non-diegetic score, or a mixture?
3. How does it separate ambient gameplay score from radio?
4. How dense is music during long gameplay?
5. How are transitions handled?
6. How much is historical authenticity versus modern cinematic interpretation?
7. How does it avoid listener fatigue?
8. Does radio advance worldbuilding?
9. How are announcers or advertisements presented?
10. What should Project: Studio adopt or reject?

Where a source does not disclose an exact duty cycle, playlist rule, transition law, or broadcast structure, this document says so. It does not reverse-engineer a proprietary system from casual play or community recollection.

## 2. Cross-atlas findings

| Comparator | Represented period | Verified content grammar | Most useful lesson | Primary caution |
|---|---:|---|---|---|
| *L.A. Noire* | 1947 | Original noir score + licensed jazz + new period-style vocals + KTI radio | Music can be atmosphere, diegetic culture, and subtle gameplay information without collapsing those jobs together | A crime-drama intensity model is too foregrounded for a normal studio-management lot |
| *Mafia II* | 1940s to early 1950s, with deliberately loosened recording dates | Original orchestral score + more than 120 licensed tracks distributed through radios | A changing radio catalogue can make an era shift immediately audible | Licensed masters bring rights burden and can turn the lot into a jukebox |
| *Mafia: Definitive Edition* | 1930s | 35 licensed jazz recordings + newly recorded orchestral score | Pools, intensity tiers, isolated instrument families, and a constrained transition language can preserve continuity | Do not copy its D-minor design, themes, cue maps, or gangster-film rhetoric |
| *Red Dead Redemption* | 1911 | Original interactive score + ambient music + diegetic player/NPC performance | Understatement, common transition affordances, regional color, and large variation reduce loop exposure | Its single-key/tempo solution is evidence for its game, not a universal formula |
| *Red Dead Redemption 2* | late nineteenth-century America | Narrative + environmental/diegetic + interactive original score | Separate authored story music, world performance, and reactive roaming layers | More stems and more hours are not automatically better for a smaller production |
| *BioShock Infinite* | alternate 1912 | Newly composed score + licensed/world-heard music + diegetic performance and story-bearing anachronism | Period can be communicated through scale, timbre, and staging while emotional scoring remains contemporary | Its deliberate anachronism is story-specific; Project: Studio cannot use chronology loosely where P13 owns era truth |
| *Fallout 4* | fictional retro-future, not a historical reconstruction | Licensed radio + classical station + original score + new in-world songs + contextual DJ | Multi-day listening tests and station choice are practical fatigue controls | It is a contrast case, not evidence for historical chronology or 1950s authenticity |
| *Empire of Sin* | 1920s Chicago | Period-instrument composition + modern hybrid elements + diegetic speakeasy bands + street ambience | Management space may breathe with ambience while venue music remains diegetic | “Grit” added by modern genre markers can become costume or parody |
| *Pentiment* | sixteenth-century Bavaria across 25 years | Period-associated instruments + new composition + adaptations of historical material, used at pivotal moments | Sparse placement can make music meaningful and protect long-session focus | Its extreme restraint and archival palette do not map directly to a 120-year Hollywood lot |
| *Anno 1800* | fictional nineteenth-century Industrial Revolution | Cinematic orchestral score + region palettes + diegetic machinery/settlement sound | Management music may be historically anchored yet openly storybook-cinematic; separate volume controls matter | Regional shorthand can flatten cultures, and continuous orchestral uplift can fatigue |

### 2.1 Independent conclusions

1. **SOURCE-DERIVED FINDING:** The strongest comparators do not equate “period audio” with one technique. They combine different layers: licensed masters, original score, diegetic performance, environmental sound, radio, and presentation cues.
2. **TECHNICAL INFERENCE:** The recurring useful boundary is not “authentic versus inauthentic.” It is **which layer is making which claim**. A period recording can locate time; a score can carry emotion; radio can carry social context; ambience can give musical space.
3. **SOURCE-DERIVED FINDING:** The documented designs include understatement and loop invisibility (*Red Dead Redemption*), large catalogues and station choice (*Mafia II*, *Fallout 4*), deliberate multi-day listening (*Fallout 4*), and sparse placement (*Pentiment*). **TECHNICAL INFERENCE:** All can help fatigue, but only *Fallout 4* explicitly documents a multi-day annoyance/flow test; *Mafia II*'s catalogue breadth is not itself a disclosed fatigue-control intent.
4. **PROJECT: STUDIO RECOMMENDATION:** Preserve the lot bed as an original, low-fatigue identity. Reserve fictional radio for optional, clearly diegetic worldbuilding. Reserve milestone music for infrequent authored emphasis. Never make routine UI actions restart the track.
5. **PROJECT: STUDIO RECOMMENDATION:** Treat historical plausibility as a palette and production constraint, not a demand for museum reconstruction. Let cinematic homage shape gesture and dramatic function, but prohibit distinctive-theme imitation, cue recreation, named-artist prompting, and copied arrangements.

## 3. Comparator profiles

## 3.1 *L.A. Noire*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The game is set in Los Angeles in 1947. The official manual credits a dedicated KTI Radio layer, while Rockstar describes the original score as inspired by major 1940s film scores.
2. **Content — SOURCE-DERIVED FINDING:** It uses a mixture: a fully original score by Andrew Hale and collaborators; licensed period jazz recordings; three newly created vocal recordings written and produced for the game; and KTI radio material. The manual separates score, licensed songs, the new vocal songs, KTI Radio, and radio voices in its credits.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** KTI is explicitly credited as radio, separate from the score and song catalogues. The design also uses non-diegetic piano/chime cues during evidence search. **OPEN EVIDENCE:** The retained official sources do not publish the station scheduler, crossfade law, or exact rules for choosing score instead of radio.
4. **Long-play density — TECHNICAL INFERENCE:** The score, radio, licensed masters, quiet investigation, dialogue, and city ambience alternate by activity. This creates contrast, but the sources do not disclose a percentage music duty cycle.
5. **Transitions — SOURCE-DERIVED FINDING:** Team Bondi developers described an investigation cue that ends once the final clue is found and chimes that mark inspectable evidence. That is state-readable musical punctuation rather than a track change for every interaction. **OPEN EVIDENCE:** General score/radio transition timing is not documented in this corpus.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** Licensed 1940s recordings are direct period anchors, while the original score consciously invokes 1940s screen scoring. The newly written vocals occupy a third space: period-styled fiction made for the game. This is deliberate mixture, not documentary purity.
7. **Fatigue — TECHNICAL INFERENCE:** Alternating radio, score, investigation silence, dialogue, and ambience can reduce saturation. No retained developer source claims a formal endurance-test threshold.
8. **Radio worldbuilding — SOURCE-DERIVED FINDING:** A named fictional station, historic programme material, credited radio voices, and licensed music make broadcast part of place. **ARTISTIC INTERPRETATION:** Its strongest lesson is that the station feels institutional rather than like a free-floating playlist.
9. **Announcers/advertisements — SOURCE-DERIVED FINDING:** The official manual credits KTI Radio and four radio voices. It also identifies a historical programme broadcast. **OPEN EVIDENCE:** The retained sources do not establish a complete announcer taxonomy, advertisement cadence, or whether every interstitial is fictional versus archival.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the separation of score, radio, gameplay cue, voice, and ambience; adopt subtle completion punctuation; adopt new period-style material as a bridge between authenticity and ownership. Reject copying its noir harmony, themes, clue cues, KTI identity, broadcast scripts, recordings, or mix. A normal lot should be calmer and less plot-leading than a detective case.

### Why it remains in the atlas

*L.A. Noire* is the clearest comparator for “different audio layers make different historical claims.” It is less useful as a long-form management model because its score and gameplay cues serve authored investigation tension.

## 3.2 *Mafia II*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The campaign moves through the 1940s into the early 1950s. Creative-production director Jack Scalici described using music, along with cars, fashion, and advertising, to make the period change legible.
2. **Content — SOURCE-DERIVED FINDING:** It combines an original orchestral score with more than 120 licensed recordings heard through radios. Developer testimony describes searching recordings broadly, categorizing candidates by tempo, mood, and lyrical subject, and matching songs to gameplay situations.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** Radios are present throughout the world and in vehicles; the manual offers radio control. Scalici described scripting a suitable song to be playing when a player enters a car in at least some authored moments. The orchestral score is a separate credited body of music.
4. **Long-play density — SOURCE-DERIVED FINDING:** Catalogue breadth exceeds 120 tracks. **TECHNICAL INFERENCE:** That quantity delays literal repeats, but content count alone does not guarantee low fatigue, especially when vocal records compete with dialogue.
5. **Transitions — SOURCE-DERIVED FINDING:** Some entries into vehicles were authored so a particular track would already be on the radio. **OPEN EVIDENCE:** The corpus does not establish sample-accurate station continuity, exact fades, or the general transition algorithm.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** The team intentionally loosened chronology: Scalici set a nominal 1960 cutoff so early rock-and-roll could appear and allowed some later recordings if they sounded suitable. The orchestral score supplies crime-drama cinema while the radios provide popular-music anchors.
7. **Fatigue — SOURCE-DERIVED FINDING:** The supervisor reduced roughly 500 considered songs to a little over 120 and classified them by function. **TECHNICAL INFERENCE:** A large, curated pool supports variety; the sources do not prove a formal anti-repeat algorithm or endurance protocol.
8. **Radio worldbuilding — SOURCE-DERIVED FINDING:** Music is explicitly described as a core way the city communicates the move from the 1940s to the 1950s. Radio therefore carries campaign chronology as well as atmosphere.
9. **Announcers/advertisements — OPEN EVIDENCE:** The official manual verifies radio controls and stations, but the retained sources do not support a complete account of DJ personalities, advertisements, or interstitial frequency. Do not fill that gap from community playlists.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the immediate legibility of a catalogue changing with authoritative campaign time, and curate by tempo, mood, density, and gameplay use rather than genre label alone. Reject its deliberately loose chronology for the lot music: P13 must remain authoritative. Reject a 120-master licensing strategy unless a later rights-and-budget decision explicitly authorizes it.

### Preserved contradiction

*Mafia II* shows both the power and risk of direct period recordings. They communicate time almost instantly, yet the developer accepted recordings beyond the depicted dates when they served the fiction. That choice was valid for that game; it is not evidence that Project: Studio should override P13 truth.

## 3.3 *Mafia: Definitive Edition*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The game depicts a fictional Prohibition-era Midwestern city in the 1930s.
2. **Content — SOURCE-DERIVED FINDING:** 2K announced 35 licensed jazz recordings and a newly recorded orchestral score. Composer Jesse Harlin described influences drawn from character background—Italian folk and church music, opera, and Chicago jazz—rather than treating “1930s” as one genre.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** Licensed tracks and orchestral score are distinct catalogues. **OPEN EVIDENCE:** The retained sources do not fully describe radio scheduling or location logic.
4. **Long-play density — SOURCE-DERIVED FINDING:** Harlin contrasted the original game's roughly 30-minute score with contemporary open-world expectations. He and the audio team created thematic and combat pools. **TECHNICAL INFERENCE:** Pools and context variation provide breadth without requiring continuous maximum intensity; no exact music duty cycle is published.
5. **Transitions — SOURCE-DERIVED FINDING:** The score uses thematic mood variants, four combat tiers, a mostly common key, and recordings split by instrument family so implementation can remove, combine, and shift material. This supports transitions between tension states.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** The licensed jazz anchors the 1930s, while the score is framed as tragic “bullet opera,” combining Romantic-era dramatic language, folk/church associations, and jazz color. It is openly cinematic rather than a reconstruction of 1930s popular listening.
7. **Fatigue — TECHNICAL INFERENCE:** Multiple themes, moods, intensities, and removable instrument families can reduce exact repetition and prevent every scene from carrying full arrangement density. The source does not disclose minimum dwell or anti-repeat timing.
8. **Radio worldbuilding — TECHNICAL INFERENCE:** The licensed catalogue locates place and period, but the retained evidence emphasizes score production more than radio narration.
9. **Announcers/advertisements — OPEN EVIDENCE:** No retained primary source supports a specific presenter or advertising grammar.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the principle of arranging one identity across moods and eras, and the distinction between low-, high-, and chase-like intensity. Reject direct reuse of its key plan, intensity labels, motif transformation, orchestration, themes, or proprietary music system. Project: Studio should use fewer reactive states and longer dwell because management context changes more often and less dramatically than combat.

### Imitation boundary

Harlin's reuse of an earlier *Mafia* theme was authorized franchise continuity. Project: Studio has no such right. Its lesson is **motif governance**, not permission to borrow any existing eight bars, harmonic sequence, or arrangement.

## 3.4 *Red Dead Redemption*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The game takes place in 1911 across fictional regions of the American and Mexican borderlands.
2. **Content — SOURCE-DERIVED FINDING:** It uses original cutscene music, interactive in-game score, ambient music, and diegetic pieces performed by non-player characters. Composer testimony describes approximately 200 pieces and, including the expansion, about 24 hours of music.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** There is no conventional broadcast-radio layer. Ambient score and diegetic saloon/camp performance are separate functions; regional ambience also carries place without requiring music.
4. **Long-play density — SOURCE-DERIVED FINDING:** Composer Bill Elm emphasized understatement because a player might ride in one territory for half an hour; conspicuous melody and audible looping would become oppressive. **TECHNICAL INFERENCE:** This is the most directly relevant long-session principle in the atlas.
5. **Transitions — SOURCE-DERIVED FINDING:** The composers described a common tonal/tempo framework that allowed pieces and stems to cross more readily. The audio team reported almost 1,000 hand-tuned transitions in main-story missions and a system that could evolve and randomize music.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** The team researched period music but acknowledged that the culturally recognized “Western sound” largely comes from later cinema. The score therefore mixes period and regional instruments with twentieth-century Western-film idiom.
7. **Fatigue — SOURCE-DERIVED FINDING:** Understated melody, regional palettes, large content volume, evolving/randomized playback, dynamic mix movement, and careful transitions all address freshness. The sound team also monitored on consumer systems and balanced music against speech and effects.
8. **Radio worldbuilding — NOT APPLICABLE:** There is no broadcast station. Diegetic musicians, wildlife, weather, and settlement ambience do the place-making work that radio might do in a later period.
9. **Announcers/advertisements — NOT APPLICABLE:** No radio-DJ or advertisement system is part of the cited design.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt understatement, long-horizon loop review, consumer-device review, regional/contextual color, dynamic mix priorities, and transitions that feel like continuity rather than events. Reject the assumption that every cue must share one literal key and tempo; that was one production's solution. Do not copy its Western instrumentation combinations or cinematic signatures.

## 3.5 *Red Dead Redemption 2*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The game presents a broad fictional cross-section of late nineteenth-century America as the outlaw era closes.
2. **Content — SOURCE-DERIVED FINDING:** Music director Ivan Pavlovich and composer Woody Jackson distinguish narrative score, environmental music performed in the world, and interactive roaming music. The original-score release credits more than 110 contributing musicians.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** No broadcast station is the organizing layer. Narrative music serves missions, environmental music belongs to campfires/porches and characters, and interactive music responds to free play.
4. **Long-play density — SOURCE-DERIVED FINDING:** The interactive score changes subtly with play. Jackson built short musical responses and layered emotional fragments rather than treating every passage as a complete foreground song. **TECHNICAL INFERENCE:** This supports breathable density, though the retained sources do not publish a duty cycle.
5. **Transitions — SOURCE-DERIVED FINDING:** The score was delivered in up to 15 stems, with short cues and stackable emotional material supporting gradual intensity changes. The developers characterize the result as subtle and smooth.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** The production used acoustic and historical instruments alongside recording choices and instruments associated with later Western cinema. Jackson explicitly resisted obvious genre defaults. It aims at a new Western fiction, not literal sonic archaeology.
7. **Fatigue — TECHNICAL INFERENCE:** Short gestures, restrained performance, stem variation, world performance, and large variation reduce exposure to a fixed loop. Exact anti-repeat rules remain undisclosed.
8. **Radio worldbuilding — NOT APPLICABLE:** Campfire song and local performance carry community identity instead of broadcast.
9. **Announcers/advertisements — NOT APPLICABLE:** The cited music system has no radio announcer or advertisement layer.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the functional separation of narrative, environmental/diegetic, and interactive layers. For Project: Studio this becomes milestone music, lot ambience/radio, and adaptive management bed. Reject its scale as a default budget: 15 stems and dozens of hours are not necessary to prove the model.

## 3.6 *BioShock Infinite*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The fictional floating city is presented as an alternate 1912 America.
2. **Content — SOURCE-DERIVED FINDING:** The game combines a newly composed non-diegetic score, licensed/world-heard music, diegetic performances, and music that participates in the fiction's time-displacement story. Composer Gary Schyman describes small live string ensembles and percussion rather than a conventional full orchestra.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** The score serves character emotion and scripted events. Music and audio recordings in the world can instead deliver story clues. **OPEN EVIDENCE:** The retained sources do not establish a continuous conventional radio-station scheduler.
4. **Long-play density — OPEN EVIDENCE:** The retained interviews do not disclose a music duty cycle or long-session anti-repeat policy.
5. **Transitions — SOURCE-DERIVED FINDING:** Some scripted events are scored like cutscenes; other music is encountered in the world. **OPEN EVIDENCE:** No detailed transition algorithm is disclosed here.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** Schyman and the music team explicitly rejected strict 1912 musical language as insufficient for the intended contemporary emotional communication. Period simplicity and small ensembles informed the score, but character and dramatic need led.
7. **Fatigue — TECHNICAL INFERENCE:** Small ensembles and selective scripted placement can preserve intimacy and leave room for dialogue, but this is not presented by the source as a measured fatigue system.
8. **Radio worldbuilding — SOURCE-DERIVED FINDING:** Music itself can carry a story puzzle about how material reached the fictional city. That is stronger narrative use than period wallpaper, though it is not a reusable chronology model.
9. **Announcers/advertisements — OPEN EVIDENCE:** The retained music sources do not document a station DJ/ad structure. Environmental propaganda and audio recordings belong to world narrative, but should not be conflated with a normal radio format without further evidence.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the freedom to translate period character through ensemble size, timbre, and performance rather than reproducing every historic convention. Reject chronology-breaking anachronism unless P13 explicitly authors it as fiction. Do not treat famous old songs rendered in new styles as a safe or necessary shortcut.

### Preserved contradiction

*BioShock Infinite* demonstrates that emotional clarity can justify moving away from period language. *Pentiment* demonstrates that close collaboration with historical performers can make period-associated language dramatically effective. Neither is a universal rule; Project: Studio needs a middle path calibrated to long management sessions.

## 3.7 *Fallout 4* — contrast comparator only

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** It is a fictional retro-future after an alternate-history divergence, not a simulation of the 1940s or 1950s. It is retained only for radio identity and fatigue practice.
2. **Content — SOURCE-DERIVED FINDING:** Bethesda describes licensed songs, a classical station, original score, five newly written in-world songs, and Diamond City Radio with contextual DJ commentary.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** The player can choose Diamond City Radio, switch to classical, or leave radio off and hear the original score.
4. **Long-play density — SOURCE-DERIVED FINDING:** The game offers roughly three times the music of *Fallout 3*, divided between familiar, less familiar, and obscure catalogue choices. **TECHNICAL INFERENCE:** Choice between stations and score gives the listener agency over density.
5. **Transitions — OPEN EVIDENCE:** The retained Bethesda feature describes station choice and contextual commentary but not exact crossfades, clock continuity, or transition scheduling.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** The team deliberately allowed a blurry recording timeline where lyric and “vibe” served the fictional setting. The radio is an authored retro-future identity, not a historical archive.
7. **Fatigue — SOURCE-DERIVED FINDING:** Todd Howard listened to a working playlist all day for several days. Songs that became annoying, were too melancholy, were too long, or disrupted flow were removed. This is the strongest explicit long-session editorial practice in the atlas.
8. **Radio worldbuilding — SOURCE-DERIVED FINDING:** The contextual DJ, unusual catalogue, and five original in-world songs make the station part of place and character rather than a neutral period playlist.
9. **Announcers/advertisements — SOURCE-DERIVED FINDING:** Bethesda verifies a “quirky” DJ with situation-specific commentary. **OPEN EVIDENCE:** This source does not establish advertisement frequency or a complete presenter script model.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt multi-day fatigue auditions, selectable radio/off states, contextual but bounded presenter remarks, and original in-world songs if later commissioned. Reject its blurred chronology and nostalgic master-recording strategy as evidence for P13 eras. Do not import its comedic voice, catalogue logic, or station persona.

## 3.8 *Empire of Sin*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The game is set in Prohibition-era 1920s Chicago and supports empire management as well as tactical combat.
2. **Content — SOURCE-DERIVED FINDING:** Developer testimony describes two composers using instruments associated with the period, while some cues add modern metal guitar for grit. Music is heard inside venues with visible bands; street-level management can emphasize city environment instead.
3. **Score/radio separation — SOURCE-DERIVED FINDING:** This is not chiefly a radio system. Street/empire space may use environment; speakeasy interiors present diegetic performance. Score and venue music therefore have different spatial claims.
4. **Long-play density — SOURCE-DERIVED FINDING:** The developer specifically describes street management views as environmental rather than continuously musical, then music becoming present inside venues. **TECHNICAL INFERENCE:** Spatial silence and ambience are credible fatigue controls.
5. **Transitions — TECHNICAL INFERENCE:** Entering a venue creates a natural diegetic boundary between city ambience and music. The source does not disclose fade time, beat alignment, or an adaptive score algorithm.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** Period instruments coexist with intentionally modern guitar. The design is a hybrid meant to feel forceful rather than historically literal.
7. **Fatigue — TECHNICAL INFERENCE:** Ambience-only management space and localized venue bands keep music from becoming a permanent wallpaper. No endurance-test evidence is published in the retained source.
8. **Radio worldbuilding — NOT APPLICABLE:** Venue performance, not a station, carries social atmosphere.
9. **Announcers/advertisements — OPEN EVIDENCE:** No relevant radio presenter or advertisement system is documented.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the idea that the lot may sometimes sound alive through ambience alone and that music may belong to a location. Reject “modern heavy instrument equals gritty history” as a default. A period-modern hybrid must be justified by Project: Studio identity and tested for parody.

## 3.9 *Pentiment*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The narrative spans 25 years in sixteenth-century Upper Bavaria.
2. **Content — SOURCE-DERIVED FINDING:** Obsidian worked with early-music ensemble Alkemie, using shawms, hurdy-gurdies, and other period-associated instruments. The ensemble composed original music and adapted works from the fourteenth through sixteenth centuries for pivotal story moments.
3. **Score/radio separation — NOT APPLICABLE:** There is no radio. The relevant separation is between sparse authored music and the rest of the narrative soundscape.
4. **Long-play density — SOURCE-DERIVED FINDING:** Music is described as serving pivotal moments rather than playing continuously.
5. **Transitions — TECHNICAL INFERENCE:** Event placement supplies the transition: music arrives because the narrative moment warrants it. The source does not disclose bar-level implementation.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** Historical instruments and adapted historical pieces make the period connection unusually direct, while original composition still serves fiction. One epilogue song deliberately draws on a later nineteenth-century tradition, an authored exception rather than a general period rule.
7. **Fatigue — TECHNICAL INFERENCE:** Sparse use protects attention and makes entries significant. The sources do not report quantitative endurance testing.
8. **Radio worldbuilding — NOT APPLICABLE:** Historical and local performance practice, not broadcast, carries world identity.
9. **Announcers/advertisements — NOT APPLICABLE:** No broadcast system.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt musician/historian collaboration, instrument provenance, and permission for silence. Reject the idea that period instrumentation alone guarantees useful management music. Project: Studio needs more continuity than *Pentiment*, but less saturation than a constant score.

## 3.10 *Anno 1800*

### Evidence-backed profile

1. **Period — SOURCE-DERIVED FINDING:** The game builds a fictional nineteenth-century world around the Industrial Revolution.
2. **Content — SOURCE-DERIVED FINDING:** The developers describe live orchestral music mixing film-music feeling with historical structures, plus distinct regional colors. Machinery and settlement sounds provide diegetic rhythmic character.
3. **Score/radio separation — NOT APPLICABLE:** There is no central radio layer. Non-diegetic orchestral score is distinguished from diegetic settlement and machinery sound.
4. **Long-play density — OPEN EVIDENCE:** The retained development diary does not publish a duty cycle. The console edition does provide separate menu, music, voice, and sound-effects level controls.
5. **Transitions — SOURCE-DERIVED FINDING:** Music changes character by continent/region; machinery rhythm supports the industrial setting. **OPEN EVIDENCE:** The source does not disclose exact transition synchronization or dwell rules.
6. **Authenticity/cinematic interpretation — SOURCE-DERIVED FINDING:** Lead composer Tilman Sillescu describes an intentional balance between historical structures and a “once upon a time” film-score feeling. This is a declared storybook interpretation.
7. **Fatigue — TECHNICAL INFERENCE:** Region changes, settlement ambience, orchestral variation, and separate music volume can help. No formal long-session music test is disclosed.
8. **Radio worldbuilding — NOT APPLICABLE:** Worldbuilding comes from region palettes and settlement/machinery sound rather than broadcast.
9. **Announcers/advertisements — OPEN EVIDENCE:** No relevant radio presenter/ad system is documented.
10. **Project: Studio — PROJECT: STUDIO RECOMMENDATION:** Adopt the explicit “history plus cinematic story” contract, the use of non-musical production rhythm, regional/context contrast, and separate user controls. Reject generic orchestral uplift as the default lot state and reject flattening a culture into one emblematic instrument.

## 4. Contradictions that must remain visible

### 4.1 Period masters versus newly composed ownership

- **SOURCE-DERIVED FINDING:** *L.A. Noire*, *Mafia II*, and *Mafia: Definitive Edition* use licensed historical recordings for immediate time/place recognition.
- **SOURCE-DERIVED FINDING:** *Pentiment*, both *Red Dead* games, *Empire of Sin*, and *Anno 1800* show different forms of newly made period-associated music.
- **TECHNICAL INFERENCE:** Licensed masters can be fast semantic anchors, but carry composition/master clearance, territory, platform, trailer, soundtrack, renewal, and streamer-safety burdens. Original composition offers stronger ownership control but requires disciplined historical and imitation review.
- **PROJECT: STUDIO RECOMMENDATION:** Preserve the accepted default: commission original, era-informed instrumental music with clear composition and recording rights. Consider licensed reference recordings for private study only unless a later procurement decision separately authorizes use.

### 4.2 Sparse music versus broad continuous identity

- **SOURCE-DERIVED FINDING:** *Pentiment* emphasizes pivotal placement; *Red Dead Redemption* emphasizes understated material that can coexist with long travel; *Fallout 4* offers an optional song-rich radio.
- **TECHNICAL INFERENCE:** There is no single historically correct density. Density follows game function and player agency.
- **PROJECT: STUDIO RECOMMENDATION:** Use a restrained non-diegetic lot bed as the continuity layer; permit extended ambience-only gaps; make later Studio Radio optional; use milestone stings sparingly.

### 4.3 Documentary reconstruction versus cinematic homage

- **SOURCE-DERIVED FINDING:** *BioShock Infinite* deliberately prioritized contemporary emotional communication; *Anno 1800* deliberately mixes history with storybook film language; the *Red Dead* scores acknowledge that the familiar Western sound is substantially cinematic; *Pentiment* works closer to historical performance sources.
- **ARTISTIC INTERPRETATION:** The most transferable approach is neither pure reconstruction nor generic film score. It is a controlled tension: a few period-legible anchors plus a flexible Project: Studio identity.
- **PROJECT: STUDIO RECOMMENDATION:** The Owner audition should ask both “what era does this suggest?” and “would this function for management?” A track may succeed at one and fail at the other.

### 4.4 Large catalogues versus strong systems

- **SOURCE-DERIVED FINDING:** *Mafia II* uses more than 120 records; *Red Dead Redemption* reported around 200 pieces and about 24 hours including its expansion; *Fallout 4* expanded its catalogue threefold.
- **TECHNICAL INFERENCE:** Content scale hides some repetition but does not solve poor density, foreground vocals, abrupt changes, or annoying material.
- **PROJECT: STUDIO RECOMMENDATION:** Prove dwell, rotation, silence, and mix behavior with a small pilot before commissioning scale. Do not use comparator content counts as a production target.

### 4.5 Era truth versus authored looseness

- **SOURCE-DERIVED FINDING:** *Mafia II* and *Fallout 4* openly loosen recording chronology for a desired sound or fiction.
- **PROJECT: STUDIO RECOMMENDATION:** Do not transfer that authority to Unity audio selection. P13/TypeScript publishes era truth. Unity selects only from the valid catalogue and may use an explicit transition phase supplied by authority.

## 5. Adopt, adapt, reject, defer

### Adopt as design principles

- Functional separation between background score, diegetic radio/performance, voice, gameplay punctuation, and ambience.
- Understated melodic behavior and arrangement density for long uncontrolled dwell.
- Multi-day fatigue listening, including songs in context without DJ speech.
- Optional station/off states and independent music/voice/effects controls.
- Context pools with stable dwell and musically prepared transitions rather than per-click switching.
- Historically informed ensemble, performance, and recording choices without forcing literal reconstruction.
- Silence and ambience as intentional parts of the musical form.

### Adapt for Project: Studio

- *Mafia II*'s era-change legibility becomes P13-gated catalogue overlap, not a licensed-master jukebox.
- *Mafia: Definitive Edition*'s intensity pools become normal/active/blocked variants with fewer tiers and long hysteresis.
- *Red Dead*'s regional/diegetic separation becomes lot bed versus workplace ambience versus optional Studio Radio.
- *Fallout 4*'s contextual DJ becomes bounded industry bulletins with repetition budgets, transcripts, localization, and an off switch.
- *Pentiment*'s sparse significance becomes milestone restraint, not near-total campaign silence.
- *Anno 1800*'s cinematic-history balance becomes a reusable studio motif orchestrated through each era.

### Reject

- Copying any melody, chord sequence, orchestration, cue title, arrangement, station identity, DJ voice, script, recording, or proprietary transition design from a comparator.
- Using one famous genre or instrument as a decade label.
- Treating every period recording as historically or legally interchangeable.
- Letting a client-side music system invent chronology.
- Switching or restarting music for routine UI actions.
- Increasing pitch or tempo with 2×/4× simulation speed.
- Assuming more stems, tracks, or licensed stars automatically reduce fatigue.
- Treating a “radio filter” as broadcaster characterization.

### Defer

- Any licensed-master strategy.
- Any presenter casting, union status, localization count, or advertisement volume.
- Exact DSP transition implementation.
- Any middleware decision.
- Any Unity import, generation, integration, or six-finalist selection.

## 6. Demoted candidates

The following candidates were considered and not retained as full profiles:

| Candidate | Disposition | Reason |
|---|---|---|
| *BioShock* (2007) | Demoted | Valuable licensed-era ambience and diegetic-media contrast, but *BioShock Infinite* provides stronger direct developer testimony about period versus contemporary score language. |
| *Fallout 3* | Demoted | *Fallout 4* supplies more explicit developer evidence about catalogue construction, contextual DJ content, station choice, and multi-day fatigue testing. |
| *Mafia III* | Demoted | Its 1968 setting and radio are relevant, but the two earlier *Mafia* entries more directly address epoch change and score/radio separation within the currently auditioned ranges. |
| *The Saboteur* | Demoted | Relevant occupied-Paris atmosphere, but this pass did not find comparably strong primary/developer audio documentation. Fame or thematic fit alone was insufficient. |
| *Assassin's Creed* series | Demoted | Broadly valuable historical-scoring practice, but no one title added a sharper lesson than the ten retained cases within this bounded pass. |

Demotion is not a claim of poor audio design. It is an evidence-and-scope decision.

## 7. Project: Studio calibration rules derived from the atlas

### 7.1 For the 22-track Owner audition

Use the comparators as functional references, never imitation targets:

- **Era signal:** Does the track provide enough temporal information within seconds without becoming a costume?
- **Management endurance:** Does it leave perceptual room for planning, voice, ambience, and repeated work?
- **Cinematic flexibility:** Can it make a studio feel playful, aspirational, pressured, or blocked without sounding like a trailer?
- **Background/foreground balance:** Is the melody memorable enough to give identity but restrained enough not to demand attention?
- **Authenticity/homage balance:** Are period anchors plausible while harmony, form, and recording remain flexible?
- **Stereotype risk:** Does the track reduce an era to honky-tonk piano, generic “noir,” gated drums, shiny presets, or another single shorthand?
- **Imitation risk:** Does anything feel recognizably close to a protected theme, recording, or famous arrangement? If uncertain, flag for later rights review; do not reward resemblance.

### 7.2 For eventual Studio Radio

- Radio is a diegetic institution, not the background score with speech pasted over it.
- A station needs an identity, scheduling logic, voices, idents, bulletins, and silence/repetition budgets.
- Presenter speech must duck music without erasing the mix and must be independently controllable and captioned.
- Broadcast content may reflect authoritative milestones but must not create gameplay truth.
- Historically grounded performance direction is more important than a blanket bandwidth/noise effect.
- A streamer-safe mode needs an all-original catalogue and a way to disable DJ/advertisement voice independently.

## 8. Source register

All web sources were accessed 2026-08-31. “Primary testimony” means a named developer/composer/audio lead speaking in an interview; the hosting publication remains secondary as publisher. Confidence assesses support for the specific claims used here, not the source as a whole.

| ID | Source and URL | Publisher/archive | Publication date | Type | Confidence | Claims supported |
|---|---|---|---:|---|---|---|
| PG-01 | [L.A. Noire Official Soundtrack announcement](https://www.rockstargames.com/es/newswire/article/1748koo9ok58ok/anuncio-del-lanzamiento-de-la-banda-sonora-de-la-noire-official-.html) | Rockstar Games | 2011-07-18 (displayed localized page date) | Official publisher statement; primary | High | Original score inspired by 1940s cinema; Abbey Road recording; three new period-style vocals; soundtrack categories. |
| PG-02 | [L.A. Noire PS4 digital manual](https://media.rockstargames.com/rockstargames-newsite/img/manuals/en_us/LAN_PS4_DIGITAL_MANUAL_ENG.pdf) | Rockstar Games | 2017 release; document undated | Official manual; primary | Separate score/song/KTI credits; KTI radio voices; licensed-song and historic-program credits. |
| PG-03 | [L.A. Noire: Final Thoughts](https://www.gamespot.com/articles/la-noire-final-thoughts/1100-6320047/) | GameSpot | 2011-06-23 | Primary developer testimony in professional interview | High | Piano/chime clue feedback; music ends after final clue; developers' intent for subtle progress information. |
| PG-04 | [Mafia II on PS3: Your Questions Answered](https://blog.playstation.com/2010/07/20/mafia-ii-on-ps3-your-questions-answered/) | PlayStation.Blog / Sony | 2010-07-20 | Primary developer testimony in official platform interview | High | 1940s-to-1950s transition; music as era signal; more than 120 tracks; radio prevalence; authored car-entry song example. |
| PG-05 | [Sound Byte: Mafia II Exclusive Soundtrack Download](https://www.gamespot.com/articles/sound-byte-mafia-ii-exclusive-soundtrack-download/1100-6283964/) | GameSpot | 2010-11-16 | Primary developer/music-supervisor testimony | High | Original-plus-licensed mixture; approximate 500-to-120 curation; mood/tempo/lyric tagging; deliberately loosened date cutoff; licensing constraints. |
| PG-05M | [Mafia II PC manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/50130/manuals/MAFIA_II_PC_DOWNLOAD_MANUAL_ENG%5B1%5D.pdf?t=1730176761) | 2K Games / Steam-hosted official manual | 2010 release; document undated | Official manual; primary | Radio tuning/station-selection controls and the distinction between radio use and other controls. |
| PG-06 | [Mafia: Definitive Edition's Full Licensed Soundtrack Revealed](https://newsroom.2k.com/news/mafia-definitive-editions-full-licensed-soundtrack-revealed) | 2K Newsroom | 2020-09-16 | Official publisher statement; primary | 35 licensed jazz tracks; Prohibition-era setting; new/re-recorded orchestral score. |
| PG-07 | [Interview with composer Jesse Harlin](https://www.pushsquare.com/news/2020/09/interview_talking_about_the_operatic_soundtrack_of_mafia_definitive_edition_with_composer_jesse_harlin) | Push Square | 2020-09-25 | Primary composer testimony in professional interview | High | Character/background research; thematic and combat pools; four intensity levels; common-key transition design; isolated instrument families; cinematic “bullet opera” framing. |
| PG-08 | [Myths, Mavericks, and Music of Red Dead Redemption](https://www.gamedeveloper.com/audio/myths-mavericks-and-music-of-i-red-dead-redemption-i-) | Game Developer (then Gamasutra) | 2011-11-04 | Primary composer testimony in professional interview | High | Understatement for long travel; roughly 200 pieces/24 hours including expansion; common tonal/tempo affordance; regional/diegetic instruments; researched yet cinematic Western language. |
| PG-09 | [Red Dead Redemption interview with audio director Jeffrey Whitcher](https://designingsound.org/2010/08/20/red-dead-redemption-exclusive-interview-with-audio-director-jeffrey-whitcher/) | Designing Sound | 2010-08-20 | Primary audio-director testimony | High | Regional ambience; dynamic mix; speech/music priority; consumer-system review; evolving/randomized score; almost 1,000 hand-tuned mission transitions. |
| PG-10 | [Woody Jackson and Vox Studios](https://www.mixonline.com/recording/woody-jackson-and-vox-studios-red-dead-redemption-2) | Mix | 2019-01-11 | Primary composer/music-director testimony in professional trade interview | High | Narrative/environmental/interactive layers; subtle gameplay reaction; up to 15 stems; short cues; acoustic/historical and later-cinema-associated instruments; non-derivative intent. |
| PG-11 | [The Music of Red Dead Redemption 2: Original Score](https://www.rockstargames.com/newswire/article/89k8a55453475o/The-Music-of-Red-Dead-Redemption-2-Original-Score-Available-August-9) | Rockstar Games | 2019-07-19 | Official publisher/composer statement; primary | Original interactive score identity; over 110 contributing musicians; late-outlaw-era framing. |
| PG-12 | [BioShock Infinite composer Gary Schyman](https://www.gameinformer.com/b/features/archive/2013/03/19/game-music-spotlight-bioshock-infinite-composer-gary-schyman.aspx) | Game Informer | 2013-03-19 | Primary composer testimony in professional interview | High | 1912 setting; rejection of a strictly period score; small live string ensembles and percussion; character/emotion priority; scripted-event scoring. |
| PG-13 | [Q&A with Ken Levine](https://www.wired.com/2012/04/ken-levine-interview/) | WIRED | 2012-04-26 | Primary creative-director testimony in professional interview | Medium-high | Music as an environmental/story layer whose origin participates in the fiction. It does not document implementation details. |
| PG-14 | [Facing the Music in Fallout 4](https://bethesda.net/en-US/news/facing-the-music-in-fallout-4) | Bethesda Game Studios / Bethesda Softworks | 2015-11-02 | Official feature with developer testimony; primary | Catalogue thirds; threefold expansion; station/score choice; multi-day playlist listening and removals; original in-world songs; contextual DJ; deliberately blurred retro timeline. |
| PG-15 | [Un-prohibited: John Romero talks Empire of Sin](https://www.gamereactor.eu/unprohibited-john-romero-talks-everything-empire-of-sin/) | Gamereactor | 2019-07-14 | Primary producer/developer testimony in professional interview | High | 1920s Chicago management; two composers; period instruments plus metal-guitar hybrid; environment on streets; diegetic bands in speakeasies. |
| PG-16 | [Pentiment Soundtrack Available Now](https://news.xbox.com/en-us/2022/12/27/pentiment-soundtrack-vinyl/) | Xbox Wire / Obsidian Entertainment | 2022-12-27 | Official developer/publisher statement; primary | Sixteenth-century instrument approach; Alkemie collaboration; original and adapted historical pieces for pivotal moments; epilogue exception. |
| PG-17 | [Anno 1800 soundtrack development diary report](https://gamingaudionews.com/2019/04/23/video-a-soundtrack-development-diary-for-anno-1800/) | Gaming Audio News, reporting Ubisoft's development diary | 2019-04-23 | Secondary report with direct developer/composer quotations | Medium-high | “Once upon a time” film/history balance; live orchestra; region colors; machinery as diegetic rhythmic identity. |
| PG-18 | [Anno 1800 Console Edition Accessibility Spotlight](https://news.ubisoft.com/en-gb/article/6xDLQxuay1FASfTGQyquJl/anno-1800-console-edition-accessibility-spotlight) | Ubisoft News | 2023-03-07 | Official developer interview; primary | Separate menu/music/voice/effects volume controls; broader user-control context. |

## 9. Confidence boundaries

- The atlas does not claim exact music duty cycles because none of the retained sources supplies comparable telemetry.
- It does not claim exact radio clock continuity, DJ chronology, advertisement rate, or anti-repeat windows where those rules are not documented.
- “Diegetic” describes a source understood to exist in the game world; “non-diegetic” describes score presented to the player. A licensed recording can be either depending on presentation.
- Instrument and genre descriptions are not decade ownership claims. Multiple styles, communities, technologies, and listening contexts coexist in every period.
- Comparator lessons describe functional design grammar only. Melodic, harmonic, rhythmic, arrangement, recording, script, and voice similarity must not be used as a quality target.

## 10. Decision

**PROJECT: STUDIO RECOMMENDATION:** Use the original *The Movies* research—not any single comparator—as the identity anchor. Use this atlas as a set of checks:

1. *L.A. Noire* — separate audio jobs and let small cues carry readable state.
2. *Mafia II* — make era transition audible, while preserving P13 chronology.
3. *Mafia: Definitive Edition* — arrange one identity across restrained context variants.
4. *Red Dead Redemption* — understate melody, hide repetition, and review on long sessions.
5. *Red Dead Redemption 2* — distinguish narrative, environmental, and interactive layers.
6. *BioShock Infinite* — permit cinematic emotional translation without pretending it is literal history.
7. *Fallout 4* — endurance-test radio and give the player control.
8. *Empire of Sin* — let ambience carry management space and keep venue music spatially credible.
9. *Pentiment* — use silence and specialist historical collaboration.
10. *Anno 1800* — state the history/cinema balance openly and maintain accessible mix controls.

This atlas authorizes no implementation, generation, licensing, procurement, audio import, or finalist selection.
