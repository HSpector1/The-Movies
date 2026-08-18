# OWNER NOTE — SCREENPLAY-GENERATION RESEARCH DIRECTION (2026-08-18, fourth ruling set)

Received during C2 advance planning, while the RSG archaeology lane was in flight.
Directs the design of Renewable Screenplay Generation V1 (`00C` §3): **do not invent
the screenplay model from scratch** — the historical reconstruction carries
unusually strong implementation-relevant evidence.

## Directed reading (specific, not the whole Bible)

Mechanics Bible **§5 Script/Screenplay System**, **§7 Film Production Pipeline**,
**§32 Advanced Movie-Maker**.

## Recovered mechanics the Owner names (to verify against the corpus)

- Standard Script Office writers automatically generated scripts.
- Scripts belong to one of five genres.
- Explicit Hollywood genre beat templates:
  - Horror: Intro → Shock → Pursuit → Encounter → Preparation → Big Fight → Resolution
  - Action: Intro → Skirmish → Investigate → Fight → Prepare → Battle → Resolution
  - Romance: Intro → Meeting → Problem → Time Apart → Reunion → Argument → Resolution
  - Sci-Fi: Intro → Encounter → Survey → Fight → Pursuit → Showdown → Resolution
  - Comedy: Intro → Problem → Pursuit → Challenge → Preparation → Conflict → Resolution
  - Simplified four-stage structures also existed.
- AI writers appear to generate only enough scenes to reach the currently
  achievable Script Office quality ceiling.
- Script Office **tier controls the achievable quality ceiling**; writer experience
  and multiple writers primarily improve completion **SPEED**, not the ceiling.
- Prima documents an eight-factor Script Quality model (scene count, running time,
  Set variety, lead/non-lead roles, costume changes, average Set quality, average
  Scene quality, …). **Treat its internally inconsistent percentage totals
  honestly; do not blindly clone them.**

## Successor direction (the design target)

Explore a deterministic generator producing a durable **Movie Blueprint**
containing at minimum: stable screenplay/concept ID; generated working title,
player-renamable without changing identity; genre; story-beat structure; generated
scene/beat requirements; required Set/location types; role requirements;
FilmShape/creative-direction values; Script Quality / office ceiling; writer
attribution.

**Design hypothesis:** *genre supplies the narrative skeleton; FilmShape bends the
creative expression of that skeleton; the generated screenplay then creates
physical Set/resource demand.* Screenplay generation should feed Set reservations,
stage demand, queues, and visible production — not exist as an isolated text
generator.

**Bounds:** the historical model is the design FLOOR, then modernize. Do not turn
C2 into Advanced Movie-Maker; do not implement every original script-quality
factor if that would blow scope.

## Architect notes recorded at receipt

- **Genre vocabulary:** the original's templates cover five genres; the engine
  ships six (`Genre` at `types.ts:9`: comedy/drama/crime/romance/horror/adventure).
  Master plan §10.5 explicitly flags the 6-vs-5 question for **C4 planning** so
  nobody "fixes" it casually in C1/C2. RSG V1 therefore authors beat templates for
  OUR six genres, using the original five as the shape floor — the vocabulary
  itself is untouched.
- The Movie Blueprint's "required Set/location types" is the concrete replacement
  for the charter's earlier abstract "set demand" derivation — the beat structure
  is what creates set demand, which is exactly the C2 coupling the Owner names.
- This note supersedes nothing in `00A`–`00C`; it directs the RSG lane's evidence
  base and V1 shape.
