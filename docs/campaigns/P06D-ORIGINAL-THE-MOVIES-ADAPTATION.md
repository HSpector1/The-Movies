# P06D §24 — Original *The Movies* (2005) Adaptation Review

> Principles only. This document cites **no pixels, no trade dress, no proprietary art** of the original
> game. It compares the *design principles* of the original's movie-side cards against the final P06D
> grouped movie rail, and records which principles were adopted, which were modernized, and which were
> deliberately rejected. Every P06D claim below is grounded in the committed rail sources
> (`StudioProductionRailHud`, `StudioMovieRailContracts`, `StudioMovieSlateContracts`).

## What made the original movie cards useful

The original *The Movies* kept the player's slate legible with a small number of durable principles:

1. **Movies were always visible.** A picture in flight was never hidden behind a menu — the slate was a
   standing surface you could glance at.
2. **Each movie kept its own identity.** A card stood for one specific picture; it did not merge with its
   neighbours or lose its name.
3. **The phase was apparent.** You could tell at a glance whether a picture was being written, shot, or
   finished — the stage of the pipeline read from the card itself.
4. **One-click access.** The card was also a way *to* the picture — clicking took you to the thing.
5. **Active work was obvious.** A picture that needed you, or was busy, stood out from one that was idle.
6. **Completed / released pictures persisted.** Finished films did not evaporate; the slate remembered them.

## Principles adopted in P06D

The final P06D rail keeps the first five principles almost verbatim, mapped to the committed code:

- **Movies always visible.** The rail is a standing right-edge surface (`RailWanted`), shown whenever the
  studio has any screenplay or active production and no deeper surface is open. It yields to Development
  cards, camera inspection, and open workspaces — but is otherwise always present.
- **Each picture keeps its identity.** Every row is a **persistent per-picture row keyed by exact
  `productionId`** (productions) or `projectId` (screenplays) — never by array position or by its visible
  text. Duplicate titles and shared suffixes are safe because identity is the id, not the string
  (`StudioProductionRailHud` INVARIANT comment; `FitTitle` never binds identity to truncated text).
- **The phase is apparent — and grouped.** Rows are grouped into three pipeline stages by
  `StudioMovieSlateContracts`: **SCRIPTS → MAKING MOVIES → POST & RELEASE**, with a quiet group header band
  over each non-empty group. Within a row, a six-segment discrete lifecycle track shows the exact phase
  (DEV / CASTING / PROD / POST / RELEASE READY / COMMITTED) — never a fabricated percentage.
- **Title-first identity.** The title is the PRIMARY line: drawn first, largest type
  (`FontCardTitle` = 18 vs `FontBody` = 14 / `FontMeta` = 12), dominant weight. State and location are
  subordinate below it.
- **Plain-language state.** The SECONDARY line is the authority's own `stateLabel` in plain words
  (`PlainState`), not a raw internal token — e.g. "Waiting for Post", "Ready — your decision".
- **Physical location line.** The TERTIARY line names *where the work physically is* — the authority's own
  `facilityLabel` (`LocationLine`), joined with a numeric week count when authoritative.
- **One-click Locate.** Each row carries a LOCATE zone that focuses the camera on the picture's exact world
  body (`StudioMovieRailContracts.LocateBuildingId`), or the Casting building for a screenplay awaiting
  casting — the original's "click takes you there", made explicit.
- **The whole slate stays reachable.** The §10 scroll owner (one `BeginScrollView`) keeps every row
  reachable no matter how many pictures are in flight — the modern stand-in for "always visible", extended
  so nothing is ever silently dropped.

## Modernizations

Where the original was constrained by its era, P06D updates the principle:

- **Larger, readable typography** instead of tiny compact cards — a title-first hierarchy readable in ~2s.
- **Explicit pipeline grouping** (SCRIPTS / MAKING MOVIES / POST & RELEASE) rather than an undifferentiated
  pile of cards.
- **Exact authoritative state**, restated from the projected snapshot, never inferred from art or copy.
- **Multiple concurrent projects** handled first-class: productions and screenplays coexist in one slate.
- **A clear attention hierarchy** (`AttentionOf` → six treatments; strong states get a thicker accent and a
  leading `▸`), so the picture that needs the player stands out even in greyscale — color is never the only
  signal.
- **Accessibility focus** (§21 focus ring / keyboard traversal) layered onto the same rows.
- **Tooltips for long titles** — a truncated row exposes its full title on hover (`GUIContent.tooltip`),
  so identity is always recoverable.

## Rejected from the original

Deliberately *not* carried over — either because they aged badly or because they cross the P07 boundary:

- **Tiny historical icons** and dense pictographic cards — replaced by title-first text.
- **Dragging film cans / manual physical handling** of reels — the rail is a summary/navigation layer, not
  a manipulation surface; it commits nothing.
- **Manual archiving** of finished pictures — persistence is the authority's, not a player chore.
- **Unreadable compactness** — P06D grows the row (`RowHeight` = 96) rather than shrink type.
- **Any proprietary art or trade dress** of the original — none is reproduced.
- **(P07 boundary) No Released / In-Theaters / Reviews / Earnings rows** on the active rail. The rail
  deliberately stops at **COMMITTED** (the last lifecycle the current authority projects). The original's
  "completed pictures persisted" principle is *acknowledged but withheld* until P07 supplies that authority
  — the POST & RELEASE group header is the documented seam (see §25).

## Specific adaptations

| Original behavior | P06D equivalent | Why |
|---|---|---|
| Movie cards always on screen | Standing right-edge rail (`RailWanted`), yields to deeper surfaces | Keep the glance; never out-click a deeper surface |
| One card = one picture | Row keyed by exact `productionId` / `projectId` | Identity survives duplicate titles + truncation |
| Phase read from the card | Six-segment discrete lifecycle track + pipeline group header | Exact phase truth, no fabricated % |
| Click the card to reach the picture | LOCATE zone → `LocateBuildingId` (camera focus) | The "take me there" affordance, made explicit |
| Busy / needy pictures stand out | `AttentionOf` six states, thicker accent + `▸` for strong | Attention hierarchy that survives greyscale |
| Small dense cards | Title-first, larger type, grow the row not shrink the font | 2-second readability |
| Completed pictures persisted | Rail stops at COMMITTED; POST & RELEASE header reserved | Released/Earnings is P07 authority, not invented now |
| Tiny icons / drag film cans / manual archive | Removed | Aged affordances; rail manipulates nothing |
