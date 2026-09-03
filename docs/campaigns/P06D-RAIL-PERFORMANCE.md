# P06D §27 — Movie Rail Performance Characteristics

> **This is a CODE-INSPECTION analysis, not a profiler capture.** Every figure below is read from the
> committed rail sources (`StudioProductionRailHud`, `StudioMovieRailContracts`, `StudioMovieSlateContracts`,
> `StudioUiTokens`). No profiler run backs these numbers; they are the *shape* of the cost derived from the
> code, plus honest caveats. §27 guardrails are confirmed at the end: **no per-frame scene-wide searches;
> no guesswork optimization applied.**

## Data source — O(rows), no per-frame scene search

`RailWanted()` builds the frame's data from **already-projected snapshot lists**, not from the scene:

- Screenplays: `client.Current.snapshot.development.development.board.projects` → copied into the reused
  `Rows` list (a `foreach` filtered by `RowWanted`) — **O(screenplays)**.
- Productions: `snapshot.productions.productionOperations` → copied into the reused `ProdRows` list
  (filtered by `ProductionRowWanted`) — **O(productions)**.

No `FindObjectsOfType` runs in `OnGUI`. Scene references (`client`, `selection`, `cameraDirector`,
`developmentCard`) are resolved **once** in `EnsureSceneReferences` via `FindFirstObjectByType` *only while
a reference is still null*; after first resolution the call is four null-checks. So the per-frame data cost
is a linear copy of the projected rows, nothing more.

`StudioMovieSlateContracts.Assemble` then orders + groups the rows in **O(rows)** into the reused `Slate`
list. (Note: `Assemble` does allocate small per-call temporaries — a `List<Candidate>`, a `bool[]`, and a
3-entry `Dictionary` — see Allocations.)

## Layout & draw — one pass, one scroll owner

- **One cumulative layout pass.** `LayoutSlate` computes per-item rects in **O(rows)** and is the *single*
  layout shared by both the draw pass (`OnGUI`) and the hit-test (`TryConsumeClick`), so the eye and the
  click model can never disagree.
- **One `BeginScrollView`.** The whole grouped slate scrolls as a single view — **no nested scroll**
  anywhere. Wheel/trackpad is handled by the scroll view; PageUp/PageDown/End are handled explicitly.
- The draw loop iterates **every** slate entry (`for i in Slate.Count`), issuing a handful of GUI calls per
  row: one plate `GUI.Box`, one accent `GUI.DrawTexture`, `FitTitle` + a title `GUI.Label`, a plain-state
  `GUI.Label`, a six-segment track (6 `GUI.DrawTexture`), an optional tertiary `GUI.Label`, and a LOCATE
  `GUI.Label` — roughly **10–15 GUI calls per row** with a small constant.

**Honest IMGUI note:** Unity's `BeginScrollView` *clips* off-viewport pixels but does **not** virtualize
the managed draw loop — the per-row C# work (rect math, `GUIContent` allocation, `FitTitle.CalcSize`) runs
for **every** row each pass, not just the visible ones. So the drawn work is **O(total rows)**, bounded by
the finite slate; it is the pixel output, not the loop, that the fixed viewport bounds. Per-frame cost
therefore scales **linearly with total row count** with a small constant.

## Expected row counts (at scale 1; 1440×900 reference)

Row stride ≈ `RowHeight` (96) + `RowGap` (7) = **103 px**; header stride ≈ `HeaderHeight` (22) + 7 = **29 px**.
Up to **3** group headers (SCRIPTS / MAKING MOVIES / POST & RELEASE) appear, one per non-empty group.
Viewport is bounded by `MaxRailHeight` ≈ `Screen.height − (TopBandReserve 94 + ScrollBottomReserve 96)` ≈
**710 px** at 900-tall — so **~6 rows** fit before the scroll owner engages.

| Movies (screenplays + productions) | Slate items (rows + ≤3 headers) | Approx content height | Scrolls? (≤710px viewport) | Per-frame managed draw |
|---|---|---|---|---|
| 1 | 1 + 1 = 2 | ~125 px | No | trivial |
| 5 | 5 + ≤3 = ~8 | ~595 px | No (borderline) | ~5 rows drawn |
| 10 | 10 + 3 = 13 | ~1,110 px | Yes (~6 visible) | **10 rows drawn** (all) |
| 15 | 15 + 3 = 18 | ~1,625 px | Yes | **15 rows drawn** (all) |
| 25 | 25 + 3 = 28 | ~2,655 px | Yes | **25 rows drawn** (all) |

The viewport bounds what the player *sees*; the draw loop still processes every row. At 25 movies the loop
runs ~28 entries per pass — still small in absolute terms, but linear.

## Allocations

- **`GUIContent` per title per frame** — each row builds a title `GUIContent` (and `FitTitle` builds one
  internally for measurement). Minor per-row GC pressure; scales with row count.
- **`FitTitle` measurement** — one `CalcSize` when the title fits; for a title that overflows the column it
  trims one character at a time, each iteration a `CalcSize` — worst case **O(title length)** `CalcSize`
  calls, and only for truncated rows. Bounded, but the largest per-row cost.
- **Small strings per row** — the tertiary line and week line build short strings (e.g. `"3 weeks left"`)
  each pass. Minor.
- **`Assemble` temporaries** — a `List<Candidate>`, a `bool[]`, and a 3-entry `Dictionary` allocated per
  `RailWanted` call (which runs on each `OnGUI` event pass). Minor; a pooling candidate if ever hot.
- **Styles cached** — `EnsureStyles` early-returns unless `CurrentScale` changed, so `GUIStyle`s are built
  only on scale change, not per frame.
- **Solid-colour textures cached** — `StudioUiTokens.Solid` returns 1×1 textures from a
  `Dictionary<Color, Texture2D>` (session-lived), so accents/tracks/plates reuse cached fills.
- **Reused list buffers** — `Rows`, `ProdRows`, `Slate`, `ItemRects` are static and cleared/refilled each
  frame; no per-frame `List` reallocation for the row buffers themselves.

## Honest caveats & recommendation

- These are inspection-derived shapes, **not measured frame times**. A profiler capture at 25 movies would
  confirm the constants.
- The draw loop is **O(total rows)**, not O(visible rows), because IMGUI does not virtualize the scroll
  view (see the IMGUI note above). At typical slates (≤~6–10 movies) this is negligible.
- **Recommendation (future option, NOT done now):** if 25+ concurrent movies ever become common, virtualize
  the draw loop to only the rows intersecting the viewport. This is a **localized** change — `LayoutSlate`
  already maps every item into content space, so the draw pass could skip items whose rect falls outside
  `[scrollY, scrollY + viewport.height]`, exactly as `PublishLocateCasting` already does its off-screen
  check. The hit-test already works in content space and would be unaffected. This is documented as a
  backlog option only.

## §27 guardrails — confirmed

- **No per-frame scene-wide searches.** Confirmed: `EnsureSceneReferences` uses `FindFirstObjectByType`
  only while a ref is null; no `FindObjectsOfType` in `OnGUI`. Data comes from projected snapshot lists.
- **No guesswork optimization applied.** The rail ships the straightforward O(rows) draw; the only
  optimization suggested (row virtualization) is explicitly deferred, not implemented on a guess.
