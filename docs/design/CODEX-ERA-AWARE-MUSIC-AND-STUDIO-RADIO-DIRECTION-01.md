# Project: Studio — Era-Aware Music and Studio Radio Direction 01

**Status:** DECISION-READY RESEARCH CANDIDATE
**Scope:** DOCUMENTATION ONLY
**Authority:** NO IMPLEMENTATION AUTHORIZATION
**Research date:** 2026-08-31
**Accepted TypeScript evidence:** `7811377cea1c1b9ddca2c17c626879504b23ed4e`
**Accepted Unity evidence:** `29aea89a706a7f0961f5a460afc5bdb4d38d8395`
**P13 research evidence:** `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`

This report defines an audio direction, not an implementation. It consumes the global era and technology truth owned by P13. It does not alter P05, P06, a schema, a DTO, a save, production code, Unity, dependencies, or audio assets.

## 1. Decision in one page

The campaign should plan nine **commissioning families**, each containing at least four musically different palette families and overlapping its neighbors. They are not one-genre summaries of decades, executable flat pools, or a second calendar. A future authorized presentation contract may map sealed P13 era truth to a closed audio-eligibility token/set; Unity only chooses and presents content valid under that truth. The aliases in this report remain Audio Director creative taxonomy, not P13 IDs.

The identity that survives 120 years should be a short, orchestration-neutral studio motif, not a genre. Its contour and rhythm can inhabit a 1920s chamber cue, a 1970s groove, or a 2030s electro-acoustic texture without forcing those periods to sound alike. It should be absent more often than present.

The management score should favor long phrases, silence, low switching frequency, playlist memory, and phrase-synchronous changes. Production activity changes layers or mix at a musical boundary; routine UI actions do not restart tracks. Simulation at 1×, 2×, or 4× never changes music pitch or tempo.

Studio Radio should be a later, optional fictional layer. It narrates already-authoritative milestones, never creates them. Separate controls for score, radio music, radio voice, PA/help, ambience, UI, and effects are required for fatigue and accessibility. Voice volume is bounded by a small repeat-safe script plan, not an open-ended imitation of talk radio.

Native Unity remains the recommendation after comparison with FMOD and Wwise. This is not because native Unity is inherently superior: it is because the proposed system has slow state changes, a modest stem count, no present dialogue-localization pipeline, and no existing middleware foundation. The migration case must be reopened if the final radio or music graph becomes substantially more complex.

The starting proposal of three cues per epoch and 75–100 minutes is reclassified as **Lean**, not Standard. The conditional Standard target is 36 cues, four per epoch, totaling approximately 126–162 unique minutes, with three aligned layer groups per cue; its repetition risk remains unknown/high until residence/replay and endurance evidence pass. Full Studio Radio is a separately approved M6 cost.

The default procurement route is original human-authored, era-informed instrumental commissioning with documented composition, master, performance, synchronization, editing, stem, platform, territory, marketing, and archival rights. The generative model route in the companion provenance plan is a direction-finding pilot only until its legal and creative gates pass.

## 2. Evidence language and method

Every material statement uses one of these labels:

- **SOURCE-DERIVED FINDING** — supported by a cited external or repository source.
- **CURRENT-CODE FINDING** — observed at one of the exact accepted SHAs.
- **ARTISTIC INTERPRETATION** — a defensible creative reading, not history.
- **TECHNICAL INFERENCE** — a proposed behavior derived from requirements and available technology.
- **PROJECT: STUDIO RECOMMENDATION** — the final direction proposed for Owner approval.

The research order was official manuals and credits, a developer-reviewed guide, developer interviews, contemporary professional reporting, current repository evidence, institutional history, official engine documentation, and official developer comparators. Community claims were retained only as explicitly low-confidence contradictions. No original-game audio was copied, imported, or played from an unverified archive. No music was generated.

**LOCAL CORPUS CROSS-CHECK.** The local `/Users/bruce/Desktop/Big Swing Art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` and companion `THE-MOVIES-2005-SOURCE-REGISTER.md` were inspected for post-production, genre/timeline news, awards/KMVS, PA, alerts, and source-precedence evidence. They corroborate the manual/Prima separation used below, but are a reconciled derivative corpus rather than new independent proof. Crucially, the Bible itself labels the two-broadcast/KMVS-news linkage **PLAYER DOCUMENTED**, records the alert-SFX catalogue as unresolved, and records Post Production’s lack of ratings effect from Prima. This report therefore cites the underlying sources and does not upgrade those community claims merely because they appear in the Bible.

## 3. What the original *The Movies* audio actually establishes

### 3.1 A–F reconstruction

| Layer | Source-derived finding | Confidence and limit | Project disposition |
|---|---|---|---|
| **A. Lot/background radio** | Lionhead Associate Producer Brynley Gibson said the music was first created for filmmaking, then placed on the lot, then framed as a station with DJs. A contemporary preview describes era film music plus a period announcer and says the system had no gameplay effect. GameSpot independently heard the lot score move among brassy big-band, buzzy guitar, and funk/wah colors over time. [Developer interview](https://www.shacknews.com/article/39083/the-movies-interview); [contemporary preview](https://www.shacknews.com/article/39133/the-movies-preview); [GameSpot review](https://www.gamespot.com/reviews/the-movies-review/1900-6139475/). | **High** for era-aware lot music, reuse of at least part of the film library, and broad audible change. The GameSpot examples are illustrative, not a full genre chronology. Exact cue overlap, year boundaries, fades, stems, and abrupt-versus-gradual transitions are **not established**. | **ADOPT** era recognition. **ADAPT** with overlapping epochs and fatigue-safe arrangements. Do not claim transition parity. |
| **B. DJs/news** | The English base-game credits name exactly seven DJ personas: Whispering Kristen, English Hughie, Andy Wright, Randy Shaw, Wally Krunkleburger, William McDuff, and Mad Dog John. The actual role line is `DJ William McDuff & Future News`; Current News, Tutorial & Tech News, and PA Announcer are separate entries. Gibson says day-to-day news readers supplied potentially useful information but were mainly entertainment, and verifies 1920s fast-talking, 1950s anti-Communist, and later dry presenter archetypes. [Official manual, printed p.40/PDF p.21](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040); [developer interview](https://www.shacknews.com/article/39083/the-movies-interview). | **High** for names, credited roles, the three archetype examples, and the entertainment-first account in the English base game; not for persona order or a mapping from archetypes to credit names. | **ADOPT** authored world flavor. **REJECT** the original names, scripts, caricatures, and unsupported chronology. |
| **B. News mechanics** | Prima says future-news globe icons appear five years before an event and expose positive or negative genre effects. Its acknowledgements say Lionhead staff answered questions and reviewed the guide. [Developer-reviewed Prima guide, printed pp.2 and 58](https://archive.org/details/The_Movies_Prima_Official_eGuide). | **Medium-high** for the timeline UI. It does not establish that every icon was voiced twice or that a voice line caused the mechanical effect. The common two-broadcast/KMVS account remains community-documented. | P13 owns the event and effect. Radio may narrate the already-true event. |
| **C. PA/announcer** | The manual says studio PA announcements report problems/developments, gives `PA Assistance` a control separate from `Radio Options`, and credits Laurel Lefkow as PA Announcer. [Official manual, printed pp.8, 38, 40](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040). | **High** for a distinct logical/help layer. A shared diegetic speaker treatment is plausible, but not proof that PA and radio were one system. | **ADOPT** separate functional buses even if both receive a speaker filter in presentation. |
| **D. Player-film music** | The manual documents separate Music, Sounds, and Dialogue timelines, shipped selections, imports, and fades; Prima explicitly documents source selection/volume and says post-production changes do not affect in-game ratings. [Official manual, printed pp.26–27](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040); [Prima, printed p.117](https://archive.org/details/The_Movies_Prima_Official_eGuide). | **High** for creative editor separation and no rating effect. Gibson called the library “something like ninety” original pieces; that number is approximate and does not mean every cue played on the lot. | Keep lot score and future film-editor music as separate contexts, even if later sharing motifs or approved source cues. |
| **E. UI stings** | Prima specifically describes a “pop” when pulling a Star from a Star card. [Prima, printed p.6](https://archive.org/details/The_Movies_Prima_Official_eGuide). No reliable source in this review establishes a broader original-game sting catalogue. | **High** for one sound; otherwise **not established**, which is not evidence of absence. | Design Project: Studio stings from its own event grammar; do not invent historical parity. |
| **F. Ambience** | The manual exposes Sound Effects Volume and credits sound design, but the reviewed evidence does not enumerate a vanilla lot-ambience catalogue. [Official manual, printed pp.38 and 40](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040). No clean vanilla archive was locally available. | **Not established** at catalogue level. Film-scene SFX are not proof of lot ambience. | Research further only if parity becomes important; design the new ambience independently. |

The manual separates `Music Volume`, radio voiceover presets, PA assistance, and general effects. This supports separate logical layers even though contemporary reviewers described DJs/news as coming over the studio PA. [Official manual, printed p.38/PDF p.20](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040); [GameSpot review](https://www.gamespot.com/reviews/the-movies-review/1900-6139475/).

### 3.2 Composition, recordings, and the promotional soundtrack

**SOURCE-DERIVED FINDING.** Gibson described approximately ninety pieces as composed for the game. Official credits name Daniel Pemberton as original-score composer/producer, Andrew Skeet as orchestrator, Gareth Williams as mixer/mastering engineer, the City of Prague Philharmonic Orchestra, The Movies Big Band, The Movies Ensemble for jazz/rock, and Pemberton for electronics/piano. A contemporary Tadlow newsletter corroborates the Prague recording. [Developer interview](https://www.shacknews.com/article/39083/the-movies-interview); [official manual credits](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040); [Tadlow Music News, Summer 2005, p.1](https://www.tadlowmusic.com/newsletters/newsletter9.pdf).

The safe conclusion is strong evidence that the music catalogue Gibson described was original composition, not proof that every shipped voice, SFX, localized asset, trademark, or player import was free of third-party rights. No reviewed primary or contemporary professional source identified a licensed pre-existing commercial recording in the shipped music catalogue; that is absence of identification, not chain-of-title proof. Player imports were separate user-supplied material. Comparing the verified 20-track, 38:19 Premiere Edition CD with Gibson’s approximate ninety-piece library supports the **inference** that the CD was a sampler, not the complete library. [Activision retail announcement](https://investor.activision.com/news-releases/news-release-details/activision-and-lionheadr-studios-moviestm-premieres-retail); [contemporary album documentation and review](https://www.soundtrack.net/album/the-movies/).

Soundtrack.net’s contemporary review heard conspicuous homages to famous screen music. That is a critic’s assessment, not a developer admission; nevertheless it shows why “original” does not automatically mean creatively non-derivative. Project: Studio rejects recognizable theme imitation and named-artist prompting.

### 3.3 Contradictions preserved

- The official credits prove seven English DJ personas; the community decade order does not. The [Fandom chronology](https://the-movies-game.fandom.com/wiki/Category%3ADJs) is retained as **LOW confidence**, and its genre/era list is not promoted.
- `KMVS` appears on an awards-broadcast graphic in the manual at printed p.22/PDF p.12; applying that brand to every radio/news function is inference, not verified text. [Official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040).
- A widely repeated “prediction plus actual bulletin” mechanism is compatible with play recollection, but Prima proves only future-news icons and genre effects, not that every event receives two voiced items or that voice creates the effect.
- No searched primary or contemporary professional source establishes whether era transitions were hard, faded, crossfaded, or gradual.
- The official *Stunts & Effects* manual establishes no substantive new DJ, radio, or music feature or new music/DJ credit; generic EULA wording and repeated performer credits are not feature evidence. It does not support an expansion-specific DJ claim. [Official expansion manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041).

### 3.4 Adopt / adapt / reject / defer

**ADOPT:** rapidly legible era character; original instrumental production; radio/news as optional world flavor; the original’s distinct Music Volume, Radio voiceover presets, PA Assistance, and Sound Effects Volume as evidence for separable modern layers.

**ADAPT:** broad, overlapping music epochs rather than hard decade caricatures; one Project: Studio identity in many idioms; radio as a P13 milestone consumer; long-session-safe lot arrangements rather than exposing every film-score cue.

**REJECT:** original audio, names, station copy, scripts, or soundtrack; famous-theme sound-alikes; community chronology presented as fact; voice that changes gameplay truth; critical facts conveyed only by sound; caricature as historical shorthand.

**DEFER:** exact original cue mapping, transition mechanics, full sting/ambience catalogue, expansion parity, and any chain-of-title conclusion without archival contracts.

## 4. Historical direction: facts, interpretation, recommendation

### 4.1 Research lens and source-derived historical anchors

**PROJECT SCOPE DECISION.** The primary lens is Hollywood/Los Angeles studio culture and the U.S. listening environment that surrounded it. That is not a claim that U.S. popular music was culturally self-contained. Black, Latino, immigrant, regional, and transnational practices must be identified by their actual tradition, creators, place, and source before they enter a brief. “Global,” “Latin,” “urban,” and “vernacular” are not usable palette labels by themselves. Diversity is judged across a catalogue; a single cue must remain culturally specific rather than combine decorative tokens.

The following table is deliberately selective. It records anchors that can discipline a management score; it is not a canon or an exhaustive popular-music history.

| Commissioning family | SOURCE-DERIVED popular/emerging and social anchors | SOURCE-DERIVED rhythm/harmony/recognition anchors | SOURCE-DERIVED Hollywood scoring language | SOURCE-DERIVED recording/production anchors |
|---|---|---|---|---|
| 1920–32 | Jazz, blues, stride/ragtime continuities, dance orchestras, Tin Pan Alley song, and live silent-film accompaniment coexist; jazz developed from African American musical practice and grew through improvisation, syncopation, blues language, and ensemble interaction. [Smithsonian jazz overview](https://music.si.edu/story/jazz); [Library of Congress silent-film guide](https://guides.loc.gov/music-for-silent-film) | Syncopated dance pulse, blues forms/inflections, stride bass, ensemble breaks, and functional song harmony are recognizable anchors, not a compulsory “Charleston” formula. | Silent exhibition used cue sheets, compiled scores, improvisation, and original scores; synchronized sound then changed the function of music rather than erasing silent practice overnight. [LOC silent-film essay](https://www.loc.gov/collections/silent-film-scores-and-arrangements/articles-and-essays/a-warming-flame/); [Academy sound-in-cinema survey](https://www.oscars.org/events/sound-cinema-jazz-singer-conversation-walter-murch) | Acoustic recording remained important early in the band; electrical recording arrived commercially in 1925, Vitaphone synchronization in 1926, and electrical transcription in 1928. [LOC recorded-sound timeline](https://www.loc.gov/programs/national-recording-preservation-plan/tools-and-resources/historical-background/timeline/) |
| 1933–45 | Swing-era dance bands, blues, popular song, boogie-woogie, gospel/country traditions, and emerging bebop lived through Depression and wartime conditions; public dance, radio, film, and federally supported arts were material parts of the period. [LOC arts in the 1930s–40s](https://www.loc.gov/classroom-materials/united-states-history-primary-source-timeline/great-depression-and-world-war-ii-1929-1945/art-and-entertainment-in-1930s-1940s/); [Smithsonian jazz overview](https://music.si.edu/story/jazz) | Swing subdivision, riff/call-and-response design, walking bass, song forms, blues harmony, and increasingly chromatic jazz vocabulary offer several distinct recognition paths. | Max Steiner’s *King Kong* (1933) is a documented inflection toward sustained, leitmotivic Hollywood orchestral scoring; popular-song, jazz, chamber, and diegetic languages still coexisted. [LOC Max Steiner profile](https://blogs.loc.gov/nls-music-notes/2023/02/lets-go-to-the-movies-max-steiner/) | Electrical microphones/discs and network broadcast shaped perspective; magnetic tape is a postwar U.S. adoption and must not color the whole epoch. [LOC recorded-sound timeline](https://www.loc.gov/programs/national-recording-preservation-plan/tools-and-resources/historical-background/timeline/) |
| 1946–59 | Bebop/cool jazz, rhythm and blues, gospel, country, early rock and roll, and Latin-jazz exchange all matter; Billboard’s 1949 “rhythm and blues” terminology replaced an earlier industry label but did not create the Black musical continuum it named. [LOC R&B history](https://www.loc.gov/collections/songs-of-america/articles-and-essays/musical-styles/popular-songs-of-the-day/rhythm-and-blues/); [Smithsonian R&B history](https://folklife.si.edu/magazine/freedom-sounds-tell-it-like-it-is-a-history-of-rhythm-and-blues) | Backbeat, boogie ostinato, blues/shuffle forms, bebop harmonic motion, cool-jazz space, and roots-song forms prevent a single “sock hop” reading. | Orchestral scoring persisted while jazz and electronic experiment expanded the screen vocabulary; *Forbidden Planet* (1956) was an all-electronic landmark and *Anatomy of a Murder* (1959) a major jazz-score case. [Criterion synth-score history](https://www.criterion.com/current/posts/8515-the-evolution-of-synth-soundtracks); [MoMA jazz-score program](https://www.moma.org/calendar/film/595) | Tape, LP/45 formats, improving microphones, and late-1950s stereo/multitrack changed editing and space gradually; 1957–58 is a stronger technical break than 1946 or 1960 alone. [LOC recorded-sound timeline](https://www.loc.gov/programs/national-recording-preservation-plan/tools-and-resources/historical-background/timeline/); [AES historical overview](https://www.aes.org/aeshc/docs/historical/aes.history.html) |
| 1960–74 | Soul/Motown, R&B/funk, rock/pop/folk/country-rock, jazz, salsa and Brazilian-derived bossa exchange were distinct practices, often entangled with civil-rights, counterculture, migration, and new youth markets. A future brief must name a specific lane and creators rather than combine that list. [LOC African Americans on the Recording Registry](https://www.loc.gov/programs/national-recording-preservation-board/recording-registry/descriptions-and-essays/african-americans-on-the-recording-registry/); [Smithsonian jazz overview](https://music.si.edu/story/jazz) | Backbeat and syncopated bass, call-and-response, layered percussion, riff/modal writing, song harmony, and experimental timbre offer contrasting identities. | Jazz/pop idioms and electronic color increasingly joined orchestral scoring; Wendy Carlos’s 1971 film work helped move synthesis beyond novelty. [Criterion synth-score history](https://www.criterion.com/current/posts/8515-the-evolution-of-synth-soundtracks) | Stereo and multitrack tape enabled overdub, close-miking, edit, and spatial choices; consumer and studio adoption remained uneven, so extreme hard-panning is not an era requirement. [AES historical overview](https://www.aes.org/aeshc/docs/historical/aes.history.html) |
| 1975–86 | Disco, funk/soul, punk/post-punk/new wave, synth-pop/electro, and early hip-hop developed through different communities and venues. Hip-hop’s late-1970s Bronx origins precede this catalogue’s next boundary. [NMAAHC Hip-Hop (R)Evolutions](https://nmaahc.si.edu/explore/initiatives/hip-hop-revolutions); [Smithsonian disco archive guide](https://sirismm.si.edu/EADpdfs/NMAH.AC.1184.pdf) | Four-on-floor is one lane beside funk syncopation, break extension, punk drive, sequenced ostinato, and harmonically sparse or rich song forms. | A renewed symphonic-blockbuster language coexisted with increasingly mature electronic and low-budget synthesizer scores. [LOC on John Williams and *Star Wars*](https://blogs.loc.gov/now-see-hear/2022/05/happy-star-wars-day-john-williams-and-the-making-of-a-musical-masterpiece/); [Criterion synth-score history](https://www.criterion.com/current/posts/8515-the-evolution-of-synth-soundtracks) | Commercial digital recording began in the late 1970s; drum machines, samplers, and MIDI—publicly demonstrated in 1983—changed repeatability and arrangement without instantly replacing analog studios. [AES digital-recording history](https://www.aes.org/aeshc/pdf/fine_dawn-of-digital.pdf); [MIDI Association history](https://midi.org/midi-history-chapter-6-midi-begins-1981-1983) |
| 1987–99 | Hip-hop and R&B expanded, alternative/independent guitar cultures multiplied, and house/techno/dance and later trip-hop developed on different local histories. Treating all as generic “urban” or “electronic” erases those origins. [Smithsonian hip-hop collection](https://www.si.edu/spotlight/hip-hop-rap); [NMAAHC Hip-Hop (R)Evolutions](https://nmaahc.si.edu/explore/initiatives/hip-hop-revolutions) | Sample-shaped repetition, swing/quantization, breakbeats, band dynamics, extended texture, and club pulse are separate rhythmic systems; wholly new recordings are required here. | Orchestral, electronic, band, ambient, and hybrid scoring all remained viable; synthesizers had become a mature screen instrument rather than a single science-fiction sign. [Criterion synth-score history](https://www.criterion.com/current/posts/8515-the-evolution-of-synth-soundtracks) | DAT appeared in 1987 while digital editing, affordable sampling, MIDI sequencing, and workstation/DAW practices expanded; analog/digital hybridity remained normal. [LOC digital-media history](https://tile.loc.gov/storage-services/master/gdc/gdcebookspublic/20/19/66/67/16/2019666716/2019666716.pdf); [AES historical overview](https://www.aes.org/aeshc/docs/historical/aes.history.html) |
| 2000–14 | Hip-hop/R&B, indie and post-rock, electronic dance, pop, singer-songwriter, regional scenes, and orchestral/electro-acoustic work coexisted while online discovery and digital distribution weakened any single mass-format account. | Grid precision and deliberately unquantized performance, loop/sample construction, band form, bass-heavy club design, and long ambient arcs are all period-plausible; no festival “drop” is mandatory. | Film scoring increasingly normalized acoustic/electronic hybrid practice, but orchestra, small ensemble, found sound, band, and silence remained live options. [Criterion synth-score history](https://www.criterion.com/current/posts/8515-the-evolution-of-synth-soundtracks) | DAW editing, software instruments, broadband collaboration, and loudness competition shaped production; those tools describe capability, not one audible aesthetic. [AES historical overview](https://www.aes.org/aeshc/docs/historical/aes.history.html) |
| 2015–29 | **Facts stop at the research date.** Streaming is now the dominant recorded-music channel and reported growth spans all regions, but revenue data does not prove a universal musical style. Project research must select specific Los Angeles and transnational lanes with credited creators. [IFPI Global Music Report 2026 overview](https://www.ifpi.org/global-music-report-2026-global-recorded-music-revenues-grow-6-4-as-record-companies-drive-innovation/) | Contemporary practice supports rhythmic, harmonic, acoustic, electronic, sparse, dense, looped, and through-composed work. Immediate recognition should come from a documented cue-specific lane and production practice, not a “current music” preset. | Screen music is plural: acoustic/electronic hybrid, orchestral, chamber, song-led, modular, and silence can coexist. This breadth is a commissioning premise, not a prediction of one dominant style. | Networked DAWs, virtual instruments, spatial formats, and close/clean capture are available; Project: Studio should preserve management-safe dynamics rather than imitate platform loudness. |
| 2030–40 | **No historical fact exists.** No genre, audience, presenter, or consumer technology is forecast. | None can be source-derived. | None can be source-derived. | None can be source-derived. The only defensible basis is an explicit Project: Studio extrapolation from its own cleared archive and current practice. |

### 4.2 Boundary challenge and authority gate

| Candidate break | Stronger or competing evidence | Decision and contradiction retained |
|---|---|---|
| Campaign begins 1920 | Electrical recording (1925), synchronized film sound (1926), and transcription (1928) are stronger technical breaks. | Keep 1920 only because the campaign starts there. A flat 1920–32 pool is **rejected**; acoustic/pre-sound and later electrical/sound-film palettes require closed audio eligibility mapped by the authorized contract owner from sealed P13 global-era truth. |
| 1933 | Sound-film change began earlier; swing ascendancy and the 1933 *King Kong* scoring landmark are gradual/cultural rather than a clean New Year boundary. | Retain as a useful Depression/sound-Hollywood commissioning break, not a technology fact. |
| 1946 | Postwar industrial change is meaningful, but U.S. tape adoption, LP/45, and the R&B label cluster later in the 1940s. | Retain as a production bucket; tag later hi-fi/R&B-facing palettes internally. |
| 1960 | Commercial stereo and Sel-Sync arrived around 1957–58; soul/youth-market and screen-language changes continue through the early 1960s. | Retain for catalogue legibility, with 1957–62 overlap; never declare 1960 the invention of stereo. |
| 1975 | Funk/disco, punk, hip-hop, electronic scoring, and symphonic revival do not share one start date. | Retain because it usefully opens a plural production ecology; early hip-hop is included here, not postponed to 1987. |
| 1987 | MIDI and house precede 1987; trip-hop and broad DAW adoption follow it. | Retain only as a digital-production commissioning break. House must be gated late inside 1975–86; trip-hop late inside 1987–99. |
| 2000 | Web, DAW, digital editing, and hybrid scoring expanded during the 1990s; EDM’s festival scale comes later. | Retain as a convenient networked-production bucket, with late styles unavailable until upstream eligibility permits them. |
| 2015 | Streaming dominance is a gradual market change, not a universal sound. | Retain as a distribution/listening-ecology break, not a genre boundary. Facts end in 2026; 2027–29 is interpretation. |
| 2030 | There is no source-derived musical break. | Retain only as the campaign’s declared future/legacy planning band; all content is extrapolation. |

**ARTISTIC INTERPRETATION.** Nine broad families remain useful for commissioning and motif arrangement, but they are not safe runtime pools. The neutral aliases below describe recording/listening ecology rather than a supposed winning genre or demographic.

**PROJECT: STUDIO RECOMMENDATION.** Keep nine provisional commissioning families, but do not seal their strings as runtime `musicEpochId` values in M0. After separate authorization, P13 may publish closed global era/overlap truth and the contract owner may map that truth to a closed audio-eligibility token or eligible-epoch set; the audio catalogue retains its creative aliases. Unity never reads `calendarYear` to repair a gap and never infers technology. Until those owners seal a representation, a late-emerging palette is catalogue metadata for research only and is not universally playable.

### 4.3 Recommended epoch matrix

In the table, “normal / active / blocked” is a presentation arrangement, never a gameplay judgment made by audio. Standard assets mean four cues per epoch, 14–18 unique minutes total, three aligned layer groups per cue, and one 4–7 second transition ident.

| Provisional commissioning alias / nominal research band | Palette families (at least three, none exclusive) | Instruments and production character | Motif treatment | Normal / active / blocked | Clichés prohibited |
|---|---|---|---|---|---|
| `acoustic_electrical_1920_1932` — nominal 1920–32; overlap/handoff 1929–34 | Small dance-jazz; salon/photoplay chamber; a specifically researched Black-led stride/blues/songbook lane; a creator-defined Los Angeles regional/acoustic lane | Piano, cornet, clarinet/sax, trombone, banjo/guitar, tuba/upright bass, trap kit/woodblock; optional strings, flute, organ. Mostly centered, dry, modest-room perspective. Electrical production is eligible only after a closed P13 token authorizes it. Do not paste constant shellac damage over clean music. | As a two-bar instrumental turn, inner voice, or cadential rhythm; rarely a grand statement. | Normal: low-mid ensemble. Active: add brushes/ostinato at phrase. Blocked: remove pulse, open cadence; never “sad violin.” | Manic Charleston, honky-tonk chase, minstrel-show/racial coding, treating all vaudeville as minstrelsy, villain organ, compulsory crackle/wow, monoculture. |
| `network_sound_1933_1945` — nominal 1933–45; overlap 1943–48 | Swing/dance band; songbook small combo; Hollywood orchestral/chamber language; boogie, R&B, and bebop seeds | Reed/brass sections, rhythm guitar, piano, upright bass, drums/vibes; chamber/orchestral color. Broadcast-centered image and controlled room are artistic treatments; not every cue becomes a march or big band. | Can migrate between brass answer, reed line, piano comp rhythm, and string countermelody. | Normal: rhythm-section-led. Active: brass/reed response at next phrase. Blocked: thin to combo/chamber and unresolved extension. | Perpetual patriotic march, air-raid sirens, cartoon swing, “noir equals muted trumpet,” racial caricature. |
| `tape_hifi_1946_1959` — nominal 1946–59; overlap 1957–62 | Cool/bebop small jazz; Black-led R&B/boogie and early rock; country/rockabilly/roots; hi-fi and orchestral/jazz score hybrids | Horn combo, piano/vibes, guitar, upright/electric bass, drum kit, strings/woodwinds/percussion. Tape editing and widening fidelity emerge; stereo is a late gated color, not a 1946 default. | Short melodic cell can become vibraphone/piano dialogue, guitar hook, or orchestral inner line. | Normal: conversational combo. Active: backbeat/percussion or orchestral motion. Blocked: retain harmony, subtract forward bass/drums. | Sock-hop-only nostalgia, lounge kitsch, compulsory crooner, theremin sci-fi shorthand, “all 1950s are mono” or “all are stereo.” |
| `multitrack_fm_1960_1974` — nominal 1960–74; overlap 1972–77 | Soul/Motown/R&B into funk; guitar pop/folk/country-rock; jazz; separately researched bossa, salsa, or other Los Angeles/transnational lane; orchestral-pop and early electronic scoring | Electric guitar/bass, live kit, piano/organ, horns/strings, hand percussion, tape echo, early synth. Wider stereo and multitrack arrangement, but with disciplined center and no novelty panning. | Bass figure, horn answer, guitar/keyboard hook, or string countermelody; keep its interval identity flexible. | Normal: pocket and air. Active: percussion/horn counterline. Blocked: fewer layers and suspended turnaround, not psychedelic disorientation. | Generic “flower power,” sitar as universal shorthand, wah-wah everywhere, spy riff, tokenized borrowing, hard left/right gimmicks. |
| `format_plurality_1975_1986` — nominal 1975–86; overlap 1983–88 | Disco/funk/soul/fusion; punk/post-punk/new wave/power pop; synth-pop/electro and early hip-hop; house only after an upstream late-band eligibility token; symphonic-blockbuster/electronic scoring duality | Live rhythm section, clav/electric piano, horns/strings, analog polysynth/mono synth, sequencer/drum machine, processed guitar. Increasingly close, bright, layered production; dynamics remain management-safe. | Rhythm may carry the identity when melody would feel imposed; orchestral and synth versions share contour rather than timbre. | Normal: groove without peak-hour escalation. Active: pulse/arp/percussion joins at bar. Blocked: remove kick or top layer, preserve tempo grid. | Endless disco four-on-floor, gated-drum blanket, neon parody, punk reduced to noise, heroic blockbuster imitation, named synth presets as history. |
| `sampled_digital_1987_1999` — nominal 1987–99; overlap 1997–2002 | Wholly new sample-shaped hip-hop/new-jack/R&B; alternative/grunge/college/post-rock; house/techno, with trip-hop gated to a later upstream phase; polished pop and orchestral-electronic scoring | Sample-shaped but wholly newly recorded fragments, drum machines/live kit, electric guitar/bass, electric piano, digital/analog synth, strings. Punchier stereo and early DAW/edit signatures; mastering stays management-safe. | Chopped rhythm, bass cell, guitar harmonics, pad voicing, or restrained orchestral figure; never sample a protected recording. | Normal: mid-density loop or band texture. Active: aligned break/second guitar/sequence. Blocked: mute momentum layer, lengthen harmony. | Famous samples, producer imitation, “all 1990s = grunge,” vinyl damage as authenticity, brickwall loudness, rave siren, anachronistic trap drop. |
| `networked_hybrid_2000_2014` — nominal 2000–14; overlap 2012–17 | Neo-soul/hip-hop/pop-R&B; indie/post-rock/electroclash; house, with later festival-scale EDM/bass language gated by an upstream phase; minimal/ambient/orchestral-electronic scoring | Hybrid live/electronic rhythm, guitar, piano, synth, edited acoustic texture, chamber strings/brass. DAW precision and broad stereo without hyper-compression; no compulsory build/drop. | Micro-hook, harmonic cycle, processed acoustic gesture, or chamber cell; allow negative space. | Normal: sparse groove/ambient bed. Active: one aligned rhythmic or harmonic layer. Blocked: deconstruct into room/electro-acoustic residue. | Y2K modem noises, ringtone joke, pop-punk-only, giant EDM drop, “cinematic” ostinato/boom, auto-tune caricature. |
| `streaming_plural_2015_2029` — facts through 2026; 2027–29 is near-future interpretation; overlap 2027–31 | Creator-defined rhythm-forward collaboration; a specifically sourced Los Angeles bedroom/art-pop or Black-led alt-R&B/neo-soul lane; a separately sourced club/groove lane; modular ambient/chamber | Each commissioned practice names geography, tradition, and appropriate creators; close vocal-like instruments but no lyrics in core score; modular synth, granular/edit textures, acoustic ensemble. Contemporary clarity and spatial depth with preserved dynamics. | Distributed across groove, timbre, and harmony rather than one lead; arrangements may leave it absent entirely. | Normal: spacious and plural. Active: cue-specific pulse. Blocked: spectral thinning/room tone, never glitch punishment. | “Global” grab bag, generic lo-fi hiss, algorithm/notification gimmicks, festival drop, social-media meme sounds, cultural instruments as decorative tokens. |
| `legacy_future_2030_2040` — entirely extrapolated, conditions controlled by P13 | Living-archive chamber; motif-derived modular music; legacy-cinema chamber/orchestral/electronic; sparse spatial studio-night | Earlier acoustic families recombined with contemporary synthesis, spatial depth, resampling only of Project-owned material, and humane dynamics. No claim about future popular genres or invented consumer technology. | Fragments from earlier arrangements can converse, but the complete motif is reserved for P15-authorized legacy moments. | Normal: clear, patient synthesis of archive colors. Active: cross-era rhythmic layer. Blocked: exposed acoustic/electronic breath, no dystopian filter. | Cyberpunk default, AI-voice prophecy, “future = more bass,” sterile utopia/dystopia, invented named technology, fake future genre certainty. |

Per-family Standard allocation and optional-radio direction:

| Provisional commissioning alias | ARTISTIC INTERPRETATION for internal studio service | Standard asset allocation |
|---|---|---|
| `acoustic_electrical_1920_1932` | Wired/lot-service form and formal live announcer; no modern personality-DJ back-projection | 4 cues / 14–18 unique min / 12 aligned layer groups / 1 ident package; zero required voice until M6 |
| `network_sound_1933_1945` | Network-variety cadence, band-remote flavor, concise news; propaganda parody is not the default | Same 4 / 14–18 / 12 / 1 / zero-until-M6 allocation |
| `tape_hifi_1946_1959` | Local record-presenter form; formatted-radio energy appears gradually | Same allocation |
| `multitrack_fm_1960_1974` | AM personality and later FM-freeform influences coexist; each voice is specifically authored | Same allocation |
| `format_plurality_1975_1986` | Format FM, college, Black-led soul/funk, dance and independent-scene forms, with restrained ident energy | Same allocation |
| `sampled_digital_1987_1999` | Segmented drive-time, college/alternative, Black-led hip-hop/R&B, dance and early-network edges | Same allocation |
| `networked_hybrid_2000_2014` | Broadcast, satellite, internet-radio and podcast-adjacent forms coexist | Same allocation |
| `streaming_plural_2015_2029` | Broadcast/app/podcast plurality; 2027–29 copy cannot assert future facts | Same allocation |
| `legacy_future_2030_2040` | Living-archive institutional voice only; no forecast of artificial presenters or imaginary devices | Same allocation; complete motif reserved for a P15-authorized legacy moment |

The repeated count is intentional procurement parity, not proof that every family costs the same. Culturally specific performers, orchestral scale, live room, and review needs can move the budget. M6’s separately capped spoken/ident allocation is a service-wide pool, not nine equal DJ-script quotas.

### 4.4 Historical safeguards

For every commission, the brief separates three columns: sourced historical anchors; creative interpretation; approved Project treatment. A cultural/music-history consultant reviews idioms whose origins lie in communities not represented by the core audio team. Every lane names its tradition, geography, and intended creators; umbrella labels cannot survive M0. No palette asks a composer to imitate a named artist, recording, film theme, producer, or living performer. “Period” processing is optional perspective, not a layer of damage.

Transition composition follows the overlap bands above, but P13 may publish a different presentation-neutral phase or eligible-set truth. In a provisional `approaching` phase, the incoming epoch may occupy approximately 10–20% of eligible selections; in `overlap`, 35–65%; in `settled`, the new catalogue is primary while explicitly tagged archive cues may remain. These percentages are **PROJECT recommendations**, not historical facts or client-owned era logic. An audio crossfade is a later Unity presentation choice and is never an upstream era phase.

## 5. The Project: Studio motif

This task does not compose the melody.

**PROJECT: STUDIO RECOMMENDATION:** commission a 5–8-note identity, normally heard as a two-bar or 4–7-second gesture. Its abstract contour should suggest an upward reach and a stepwise return; its rhythmic signature should combine a short pickup with an identifiable long–short resolution. Exact pitches, intervals, meter, mode, harmony, and notation remain a composer decision.

Rules:

- It must survive reharmonization, mode change, augmentation/diminution, swing/straight feel, and placement in bass, inner voice, percussion, or countermelody.
- It must not depend on one instrument, studio-fanfare brass, a perfect-cadence logo, or a melodic interval strongly associated with a famous theme.
- Every cue, ident, and sting carries motif exposure metadata: `none`, `fragment`, or `full`. No more than roughly half the catalogue cues should carry `fragment` or `full`; most quoting cues should expose it once or twice.
- Recognizable exposures never overlap or occur in consecutive presentation units. After any `fragment` or `full`, enforce a 20-minute session cooldown before another recognizable exposure; a receipt-backed full milestone statement resets that cooldown to 40 minutes. When a valid milestone arrives during a motif-bearing cue, delay the sting to a safe motif-free boundary or present the receipt without a sting.
- Keep it absent from routine UI, continuous ambience, most radio beds, speech-dense passages, sustained blocked states, and intimate quiet.
- A full statement belongs only to a small number of earned milestones. Audio never decides that a milestone occurred.
- P15 may, after a P15-owned Legacy-finale signal, reassemble earlier fragments into the first complete campaign-scale statement. P15 owns the finale truth; audio owns only the approved arrangement.

The Phase 2 generative pilot uses only a **motif-behavior proxy**—space for a short adaptable identity—not pitches or a final tune. M3’s human composer pilot is the point at which identity and similarity review begin.

## 6. Adaptive music direction

### 6.1 Horizontal behavior

- Use a per-epoch shuffle bag, not a fixed loop. Each eligible cue appears once per bag. At refill, select with a rolling history of `min(2, eligibleCount - 2)` cues, so at least two choices remain whenever four or more cues are eligible; relax the oldest history item only when necessary. Prevent an immediate boundary repeat and reject an identical consecutive full-bag permutation. Seeded property/endurance tests must cover catalogue sizes 1–6 and prove termination, fairness, and no deterministic four-cue cycle.
- Avoid back-to-back palette-family repeats where at least two families remain, but never spin indefinitely to satisfy a soft constraint. Retain bounded presentation-profile history across workspace panels, ordinary Save/Load flow, and relaunch: last two cue IDs, prior bag digest, last motif exposure, and radio category timestamps. If that profile is absent/corrupt, cold start with a freshly randomized bag, no assumed milestone receipts, and no cue fixed at slot one; do not write any of this into authoritative gameplay outcomes.
- Minimum cue dwell: 90 seconds and at least two complete phrases, unless pause/focus or a severe technical failure requires silence.
- Let endings breathe. At each completed cue, `Low` inserts 35–60 seconds with 75% probability, `Standard` inserts 20–45 seconds with 45% probability, and `High` inserts 10–25 seconds with 20% probability. A setting change affects only the next decision and never restarts, truncates, or seeks the current cue. These are audition values to validate, not historical facts.
- An epoch change normally waits for a phrase or cue boundary. Do not restart because a panel opened, a button was pressed, a routine week advanced, or a Production changed a short-lived substate.

### 6.2 Vertical behavior

Standard cues use three sample-aligned, equal-length layer groups: `foundation`, `periodColor`, and `activityPulse`. Normal usually uses foundation plus selected period color. Only a sustained, separately sealed upstream active context from the future authorized `lotActivity` aggregator may add the activity layer at a bar/phrase boundary. A sustained blocked context from that same contract subtracts motion or changes approved voicing at a boundary; it must not turn a refusal into a punishment jingle. P13 does not own this aggregate.

The groups are not stems promised by an AI separator. They must be composed/exported as aligned layers from the session. All share sample rate, frame count, bar grid, pre-roll policy, loop points, and a verified summed headroom target.

### 6.3 Priority, hysteresis, and transitions

Presentation priority is:

1. transport safety: suspend, focus, pause, missing/corrupt asset;
2. voice ducking, which changes mix only;
3. a rare, receipt-backed milestone sting;
4. sustained blocked context;
5. sustained active context;
6. normal lot.

Initial qualification targets are 20 seconds continuously blocked and 30 seconds continuously active, with a 20-second release hold. These are **technical inferences for audition**, not facts. The scheduler applies the highest qualified context at the next safe boundary. A context that clears before qualification produces no musical change. One-shot milestone stings are deduplicated by receipt/event identity and never replay merely because a save loaded.

For same-tempo aligned layers, schedule at the next bar when at least 100–200 ms of DSP lead time remains. For cue/epoch changes, use an authored 1-, 2-, or 4-bar exit/entry or a 3–8-second equal-power crossfade at a phrase boundary. Never beat-match incompatible material by changing pitch or time scale.

### 6.4 Lifecycle and failure law

- **System menu without simulation pause:** apply independent menu attenuation only; the transport and DSP clock continue. Do not claim a held position and do not restart on close.
- **Hard pause:** set a transport pause such as `AudioListener.pause`; UI feedback that must remain audible uses explicitly reviewed sources that ignore listener pause. When Unity’s DSP clock and scheduled requests freeze, preserve their deadlines and resume without rebasing.
- **Application focus/platform suspension:** stop adding unsafe new deadlines. On resume, first observe whether the DSP clock froze. If it froze and sources remain valid, preserve scheduled deadlines; do not rebase. If an audio-configuration/device reset invalidated sources or the clock relationship, cancel pending starts and rebuild once at a future safe boundary.
- **Save/Load:** do not persist sample position, random seed, track outcome, or audio context as game truth. On load, consume the loaded authoritative epoch and start a valid intro/boundary after unlock; never replay an already-consumed gameplay receipt.
- **1×/2×/4×:** music tempo and pitch are unchanged. Activity may be informed by a sustained closed lot state, not speed itself.
- **Multiple Productions:** `lotActivity` has no sealed owner today. After P05/P06/P14 are sealed, an explicitly authorized upstream TypeScript presentation-contract owner may publish one pure closed aggregate. Until then the field is unavailable and adaptive context is disabled. Unity never inspects Productions, infers blockers, counts successes, or ranks outcomes.
- **Workspace continuity:** moving between lot and management panels retains the current cue and mix unless the whole audio presentation is intentionally suspended.
- **Unknown epoch or missing asset:** fail closed to a separately approved, motif-free neutral room/ambient bed or silence, log the reason for the Audio Oracle, and never silently play a false era. A missing optional stem reduces gracefully; a missing foundation invalidates that cue.

### 6.5 Mix direction

Provisional buses are `Master`, `ScoreMusic`, `RadioMusic`, `Ambience`, `SFX`, `UI`, `Voice/PA`, `Voice/Radio`, and `MilestoneStings`. `Normal`, `Active`, and `Blocked` are one mutually exclusive context-balance layer. One speech arbiter permits only one voice at a time in priority order: operational PA/help, receipt-backed bulletin, host, advertisement, ident. PA delays or preempts lower-priority speech at an edited sentence-safe boundary; stale items expire instead of piling up. Radio Voice ducks Radio Music, Score Music, and relevant ambience; PA ducks all lower voice/music beds. Speech duck is an independent side-chain or controlled gain envelope that composes with context. User preference gains are independent exposed parameters, transport pause is not a mixer snapshot, and `MilestoneStings` has a player control rather than hiding under Master alone. Menu attenuation, if approved, is another independent gain layer. Starting speech-duck auditions are approximately −6 dB score, −3 dB ambience, 80–150 ms attack, and 500–900 ms release; final numbers come from combination and listening tests.

## 7. Studio Radio direction

### 7.1 Identity and era behavior

**ARTISTIC INTERPRETATION.** The radio is a fictional internal **Los Angeles studio service**, not a simulation of public chart radio and not necessarily a broadcast transmitter in every period. Core beds are Project-owned instrumentals; this plan does not budget period hit songs or vocal chart repertoire. NBC’s 1926–27 network formation and the later decline of network radio establish broad U.S. broadcast context, but they do not prove the fictional studio-service forms below. [Library of Congress NBC guide](https://guides.loc.gov/nbc); [LOC NBC manuscript history](https://guides.loc.gov/nbc/radio-collections/manuscript-materials). Its final name is an Owner decision and must clear trademark review. It should sound like the institution itself slowly learning how to address its workers and audience:

| Period | Plausible service/presenter direction |
|---|---|
| 1920–32 | Fictional wired/lot service and formal live announcer; do not claim a public station or back-project a modern personality DJ. |
| 1933–45 | Network-variety cadence, band-remotes, concise news; avoid propaganda parody as default. |
| 1946–59 | Local record presenter and late-emerging formatted popular-radio energy. |
| 1960–74 | AM personality alongside later FM freeform; any cultural voice has a specific authored identity. |
| 1975–86 | Format FM, college, Black-led soul/funk, dance and independent scenes; bounded ident energy. |
| 1987–99 | Segmented drive-time, college/alternative, Black-led hip-hop/R&B, dance, and early internet edges. |
| 2000–14 | Broadcast, satellite, internet radio, and podcast-adjacent forms coexist. |
| 2015–29 | Broadcast/app/podcast plurality with concise, player-controlled insertion. |
| 2030–40 | A “living archive” institutional voice; no prediction of AI presenters or imaginary consumer technology. |

Use three broad host identities in a radio pilot, then commission era-group voices only after a repetition and localization budget is approved. Project: Studio does not need seven presenters merely because the original credits seven.

### 7.2 Content units and truth boundary

- **Ident:** 4–7 seconds; station/service name, era-appropriate production, no gameplay fact.
- **Industry bulletin:** 12–25 seconds; generated from a finite authored template bound to an allowed typed `{ownerDomain,eventId,receiptId}` reference from P13, P14, or P15. It paraphrases what is already true and has text parity.
- **Fictional advertisement:** 15–30 seconds; entirely fictional businesses/products, no real marks, endorsements, or unapproved technology truth.
- **Host link:** 8–20 seconds; human texture, calendar-safe and noncritical.
- **PA/help:** separate system and bus; concise operational assistance, never hidden inside host banter.

Representative, non-final samples:

> **1927 ident:** “From the studio service desk—music while the lot keeps moving.”

> **1958 industry bulletin:** “The trade papers are talking about a new production practice. Your studio record already has the details.”

> **1994 fictional advertisement:** “Tonight’s late shift is fueled by Marquee Cup Coffee—served hot, named by fiction, and not affiliated with any real brand.”

These demonstrate length and truth posture, not approved copy, final station naming, or era accent performance.

### 7.3 Frequency, repetition, accessibility, and streaming

- One global automatic-speech budget covers PA, bulletins, hosts, ads, and idents: no simultaneous voices, at least 60 seconds between starts, no more than three starts and 120 voiced seconds in any rolling ten minutes. Elective radio is further capped at two starts and 75 voiced seconds in that window. New PA/receipt truth evicts lower-priority queued radio; if the budget is full, the visual receipt carries truth and voice is omitted. Player-invoked transcript/replay may bypass the start quota but still uses the single arbiter.
- Queue at most one unstarted spoken item. Coalesce simultaneous receipts into one approved bulletin when possible; otherwise retain the highest priority. Expire an elective item after 30 seconds, on loss of factual eligibility, or at Save/Load. Never voice stale news.
- Do not repeat an identical host item inside 120 minutes, an advertisement inside 90 minutes, or an ident inside 60 minutes; cap idents at two per real-time hour. Categories are exactly `operational_pa`, `receipt_bulletin`, `host_lot`, `host_industry`, `advert_break`, and `service_ident`; apply a 15-minute same-category cooldown except to higher-priority operational PA. Never repeat a speaker back-to-back when another is valid. With three ident variants per eligible epoch, the 60-minute exact-ident cooldown plus two/hour cap leaves at least one unplayed variant in a worst-epoch hour. Idents count toward the global budget.
- Radio modes are executable cadence policies: `Off` schedules no elective radio voice or bed; `Reduced` doubles elective cooldowns and allows at most one elective start/45 voiced seconds per rolling ten minutes; `Full` uses the two-start/75-second elective cap. `Reduce Repetitive Voice` doubles exact-item/category cooldowns again. A setting change cancels newly ineligible queued speech, fades an already-playing item at an edited boundary within two seconds, and never restarts score.
- Every line has synchronized subtitles, speaker label, `[over radio]` context, and an accessible transcript. Captions are available and enabled before the first voiced line by default; honor platform preferences; provide at least 200% text scaling, configurable high-contrast background color/opacity, readable line length and authored line breaks, sufficient display timing, and a settings preview. No task, warning, blocker, or milestone exists only in audio.
- Require mono fold-down compatibility QA, a player-facing Force Mono control or evidenced platform-equivalent route as a release gate, and a night/limited-dynamic-range mix. When assistive-technology speech is active, automatically lower or mute game speech/music according to the player’s preference. These requirements are **informed by**, not a claim of conformance to, Xbox Accessibility Guidelines 101, 103, 104, and 105 until acceptance tests pass. [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101); [XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103); [XAG 104](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/104); [XAG 105](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105).
- `Streamer Safe` requires positive streaming/VOD authorization. Enabling it while uncleared audio plays performs a short safe fade/mute and substitutes an owned bed or silence immediately rather than waiting for cue end. It never changes gameplay truth.
- Voice production is capped before writing: a Standard radio season begins with 3 host voices, 90 host links, 54 milestone/bulletin lines, and 27 fictional ads = **171 spoken units**; 9 epoch ident families × 3 variants add 27, for **198 radio units** before localization. Up to 27 PA/help lines are separately gated, making 225 total. Alternates exist only when budgeted. A four-hour-per-epoch repetition test must pass before expansion.

## 8. Eight modern comparators — patterns, not formulas

Exactly eight comparators were selected. No proprietary implementation is copied.

| Comparator | Source-derived pattern | Adopt / caution |
|---|---|---|
| *Civilization VI* | Composer Geoff Knorr describes more than ten hours across 19 civilizations and arrangements whose complexity grows across eras. [Composer’s official FYC](https://www.geoffknorr.com/navgtr-fyc). | Adopt recognizable identity through re-orchestration. Caution: Studio’s era identity must not imply “simple past → superior modernity.” |
| *HUMANKIND* | Amplitude describes music for 60 cultures, ten specialist soloists, roughly eight hours of traditional music plus orchestral score. [Developer blog](https://community.amplitude-studios.com/amplitude-studios/humankind/blogs/729). | Cultural specificity and credited performers beat generic world-music tokens. Its scale proves the cost of plurality, not a target to copy. |
| *Victoria 3* | Paradox describes over two hours of music, adjustable Music Density, purposeful waits/silence, ducking, and output profiles. [Developer diary 63](https://www.paradoxinteractive.com/games/victoria-3/news/victoria-3-dev-diary-63-audio). | Strongest management-fatigue precedent: silence and density are features. |
| *The Sims 4* | Composer Ilan Eshkeri described five simultaneously recorded intensity versions and crossfades; another interview described more than 140 short motif-derived stings. [TechRadar interview](https://www.techradar.com/news/soundtracking-the-sims-to-space-talkradar-meets-composer-ilan-eshkeri); [Guardian interview](https://www.theguardian.com/technology/2014/may/07/sims-4-composer-ilan-eshkeri). | Aligned intensity recordings support the stem model. Reject a 140-sting scope unless repetition and cost evidence justify it. |
| *Anno 1800* | Ubisoft’s developer posts discuss orchestra, franchise musical identity, and returning/transforming themes. [Music devblog](https://www.anno-union.com/music-is-the-strongest-form-of-magic/); [Botanica devblog](https://www.anno-union.com/devblog-botanica/). | Preserve institutional identity through timbre and motif, not exact retro copying. |
| *Two Point Hospital* | Audient describes its fictional broadcast production; reporting identifies three fictional DJs as a major comic-world layer. [Audient case study](https://audient.com/tutorial/two-point-hospital/); [PC Gamer interview/report](https://www.pcgamer.com/two-point-hospital-wanted-fictional-dj-alan-partridge-to-host-its-in-game-radio-station/). | Radio can define a management world. Comedy density and repeat cost require strict caps. |
| *Red Dead Redemption* (2010) / *Undead Nightmare*, with *RDR2* as a separate sequel reference | Developer reporting scopes the common A-minor and 130/65-BPM stem library to the 2010 game and expansion; Rockstar’s separate *RDR2* note supports only a continuing emphasis on authored original score, not the same formula. [GameDeveloper audio article](https://www.gamedeveloper.com/audio/myths-mavericks-and-music-of-i-red-dead-redemption-i-); [Rockstar *RDR2* score note](https://www.rockstargames.com/newswire/article/89k8a55453475o/The-Music-of-Red-Dead-Redemption-2-Original-Score-Available-August-9). | Use compatibility metadata and restraint; Studio does not need either game’s continuous action-level granularity. |
| *Cyberpunk 2077* | CD Projekt documents original fictional artists/radio and a creator mode that disables selected copyrighted music. [Official booklet](https://cdn-s-cyberpunk.cdprojektred.com/CP2077-UE-Booklet-EN-1.pdf); [official creator-mode note](https://www.cyberpunk.net/en/news/36734/dedicated-cyberpunk-2077-feature-for-content-creators-disable-copyrighted-music). | Fictional radio can feel authored, while mixed rights make streamer-safe routing essential. “Made for the fiction” does not automatically mean wholly owned. |

The contradictions are useful: *Civilization VI* favors dense transformational identity while *Victoria 3* validates silence; *The Sims 4* supports many variations while *Two Point Hospital* exposes voice burden; *HUMANKIND* demonstrates cultural depth while proving it is expensive. Project: Studio chooses fewer, deeper, lower-frequency changes.

## 9. Content tiers

| Tier | Epochs / cues / music | Layers and transitions | Radio voice | Implementation and commissioning burden | Repetition risk |
|---|---|---|---|---|---|
| **LEAN** | 9 epochs × 3 cues = 27; 75–100 unique minutes | 1–2 separable layers where feasible; 9 idents; limited authored transition exits | None or a non-shipping three-host pilot | Moderate catalogue/scheduler work; lowest commission, but every cue carries too much identity load | **High** in multi-hour play; the Owner’s starting “Standard” hypothesis is therefore reclassified here |
| **STANDARD — conditional target** | 9 × 4 = 36; 126–162 minutes (14–18 per epoch) | 3 aligned layer groups per cue; 9 epoch idents; authored entry/exit coverage | M6 separately approved: 171 spoken + 27 ident = 198 radio units before localization | High but tractable: multi-composer briefs, cultural review, mix/master/loop/metadata passes | **Unknown/high before endurance proof:** a 14–18-minute pool plus gaps can cycle roughly 11–16 times in four hours; accept only against expected real-time epoch residence/replay data and the corrected rotation tests |
| **PREMIUM** | 9 × 6 = 54; approximately 200–243 minutes | 3–4 layers, alternate mixes, more neighbor transitions, extended archive variants | Full bounded radio plus localized alternates | Very high; substantially more sessions, performers, editing, localization, QA, storage | **Low-to-medium**, never zero; voice remains the likely fatigue bottleneck |

Standard is a planning recommendation, not approval to buy 162 minutes. Commission two or three diverse pilot epochs, conduct blinded long-session tests, then authorize the remaining library only if era recognition, identity, speech space, and fatigue targets pass.

## 10. Authority boundary and P13 integration

The following is a **provisional semantic boundary**, not a DTO or schema authorization.

| Upstream TypeScript may publish after its owner seals each field | Unity presentation may own |
|---|---|
| Core scheduler: `calendarYear`. P13: sealed global era/overlap truth. Contract owner: mapped audio-eligibility token/set. Event owners: typed `{ownerDomain,eventId,receiptId}` presentation references. Unresolved authorized aggregator after P05/P06/P14 seal: one closed `lotActivity`. | Track choice inside the valid catalogue; anti-repeat rotation; DSP scheduling/crossfades; aligned layer levels; AudioMixer snapshots; volume/density/radio preferences; presentation-only randomness; suspend/resume |

Unity may not decide year, era, technology availability, milestone truth, production success, blocker legality, saved outcomes, or which simultaneous Production “matters.” Audio data does not create a private timeline. P13’s accepted placeholder `EraConfig` remains inert and untouched. P05 and P06 bridge/generated-contract surfaces remain unsealed forward evidence and are not changed by this package.

P14 may later expose authorized industry/world bulletin subjects. P15 may later signal a Legacy-finale presentation. Neither relationship permits radio or music to invent a milestone.

## 11. Long-session and accessibility acceptance

Before library approval, test each epoch for four continuous hours and a twelve-hour route that deliberately exercises all eight adjacent commissioning-family transitions in both ordinary and overlap eligibility. Include Music Density high/low, Radio Off/Reduced/Full, captions, Force Mono/platform equivalent, mono fold-down, assistive-technology speech interaction, night mix, pause/focus cycles, 1×/2×/4×, and Save/Load.

Pre-register a five-second confusion test before commissioning: nine epoch choices plus `unsure`; randomized level-matched excerpts; no year, title, artwork, waveform, or prompt shown; at least 12 independent listeners blinded to metadata, plus a separate accessibility pass including blind/low-vision reviewers. The Owner may raise the panel size. Before M3, freeze a target of at least 70% exact-family identification overall, no family below 55%, and fewer than 10% nonadjacent false-era responses; report adjacent and `unsure` separately and never relabel them as correct.

Pre-register endurance thresholds before M3/M5: zero rule-breaking repeats or overlapping motif/voice events; no identical full-bag permutation twice; no more than one automatic interruption in any 60-second burst and all rolling budgets honored; at least 80% word accuracy for approved speech test sentences in every required output profile without raising Master; at least 80% of reviewers rate fatigue no worse than `acceptable` at 90 and 240 minutes; and every caption condition passes 200% scale, background, line-break, timing, preview, and assistive-technology checks. Any threshold miss rejects the tier rather than being explained away after listening.

Human reviewers answer:

1. Can the era be named within five seconds without seeing the year, and which audible evidence produced that answer?
2. Does the catalogue achieve diversity while each cue stays culturally specific, credits its creators, and avoids decorative mixing?
3. Does the studio identity survive without resembling a known theme?
4. After 30, 90, and 240 minutes, which cue, motif, host, ident, frequency, or frequency band feels repetitive?
5. Can speech, PA, UI, and ambience be understood without raising Master volume?
6. Does active feel like sustained work rather than panic, and blocked feel legible without shame or melodrama?
7. Do transitions sound intentional without advertising a calendar boundary?
8. Does 4× preserve pitch, tempo, continuity, and cognitive calm?
9. Is every spoken fact also available in text, and can radio be disabled without losing truth?
10. Are cultural signifiers specific, credited, and respectful rather than decorative shorthand?

Machine evidence supports but cannot replace that review. The Audio Oracle and implementation waves are specified in the Builder Annex and Engineering Reconnaissance.

## 12. Owner decisions required before implementation

1. Approve the nine neutral commissioning aliases as Audio Director taxonomy; separately ask P13 to seal presentation-neutral era/overlap truth and, only after authorization, ask the contract owner to choose its audio-eligibility mapping. Do not approve aliases as flat pools or P13 IDs.
2. Approve Standard only as the conditional planning target and Lean as the fallback; no full-library commission follows automatically, and expected real-time epoch residence/replay evidence plus endurance proof gates the fourth cue.
3. Approve the motif brief while leaving melody and similarity review to M3.
4. Choose whether Studio Radio is part of the initial product promise or an optional M6 expansion; select no final station name yet.
5. Approve separate Radio Voice, Radio Music, PA, Milestone Stings, Music Density, Force Mono/platform-equivalent, and Streamer Safe controls.
6. Confirm native Unity as the M1 default with explicit middleware re-evaluation triggers.
7. Approve the binding procurement policy and the prototype-only Phase 2 generation experiment in the companion plan, including its download/license stop gates.
8. Decide the target launch platforms, territories, soundtrack-album intent, and localization languages before contracts are issued.
9. Confirm the proposed lifecycle distinction—system-menu attenuation while simulation continues, explicit hard transport pause, and device-reset rebuild—and require M1 to prove a player-facing Force Mono or platform-equivalent route before release.
10. Confirm or raise the pre-registered recognition/endurance thresholds before M3; adjacent and `unsure` answers remain separately reported.

Until those decisions and upstream seals exist, implementation remains unauthorized.
