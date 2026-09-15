# R3-N3-VISUAL-STANDARD-SHEET — fonts, icons, portraits, stage art (REV01)

**Task** R3-N3-DESIGN-04 under the Owner directive of 2026-09-15, `plans/R3-OVERHAUL-PLAN.md` (TS `f9b1d28c`) phase **N3** and PM dispositions **C1** (portraits = rendered head-and-shoulders captures from the in-game rig; labelled monogram fallback; honest coverage) and **C2** (system-font stack, measured fallback/atlas tests vs XAG 101; no font files, no licences bought); Owner clarification `f2921730:…OWNER-CLARIFICATION.md` §3 puts interface art in scope. **Mode** DESIGN_PROTOTYPE — this file, six SVGs under `assets/icons/`, and `assets/PROVENANCE.md` are the whole change; no Unity source, test, build, capture or native input was produced.
**Labels** `[NAT]` = read by hand from committed Unity source (read-only worktree) — *paper*, never a runtime observation. `[REC]` recommendation. `[GAP]` named missing dependency. **Constants** `m` = `StudioTextSizePreference.Multiplier` (1/1.5/2); `s` = `StudioLegacyUiMetrics.CurrentScale` = 1 at both target viewports; `ScaledFont(base,s) = round(base·s·m)` `[NAT]`. Token colours as 8-bit sRGB for SVG authoring: Ink `#29211A`, InkMuted `#615442`, Action `#75291A`, Blocked `#8C590F`, Committed `#296638`, Brass `#997029`, Waiting `#576675`, Focus `#2680E6`, SurfacePlate `#F0E6CF`, SurfaceHeader `#DECFB0`, Keyline `#B8A88C`, portrait field `#D6C29E`.

## 1 · Fonts

### 1.1 What ships today `[NAT]` — the answer to "TextMeshPro or IMGUI?"
Unity **6000.3.22f1**. **No font file exists anywhere in either worktree** — no `.ttf`/`.otf`/`.fontsettings`, no TMP `FontAsset`, no serialised `PanelSettings`, no `themeStyleSheet`; no USS declares `-unity-font` or `-unity-font-definition` (only `-unity-font-style`). Both stacks resolve to Unity's **bundled** face:
* **UI Toolkit** — `StudioWorkspaceHost.cs:2031-2032` sets `root.style.unityFontDefinition = FontDefinition.FromFont(Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"))` once on the panel root, deliberately: a bare `PanelSettings` has no font and yields zero-height buttons (PlayMode fixtures restate the line, e.g. `StudioCastingCompareNavigationTests.cs:37`).
* **IMGUI** — every HUD style is `new GUIStyle(GUI.skin.label|box|button|textField)` overriding only `fontSize`/`fontStyle`, so it inherits the same built-in face; three world nameplates load it explicitly (`StudioDevelopmentPresentation.cs:218,293,441`, `StudioBridgePresentation.cs:465`).

So: **neither TMP nor a project font — one legacy `UnityEngine.Font` shared by IMGUI and by UI Toolkit via `FontDefinition.FromFont`.** Lawful and free (ships with the editor; we redistribute nothing) — and the single point of failure for glyph coverage, because a legacy `Font` used this way has **no** TMP-style fallback chain.

### 1.2 The C2 stack, expressed against that reality `[REC]`
Tier 0 is not optional and never changes: **`LegacyRuntime.ttf`** (Liberation Sans metrics) is the floor every acceptance test measures. Tiers 1–2 are a runtime *preference*, never a shipped file.

| Platform | Tier 1 | Tier 2 | Tier 0 (always) |
|---|---|---|---|
| macOS | `SF Pro Text`, `Helvetica Neue` | `Helvetica`, `Arial` | `LegacyRuntime.ttf` |
| Windows | `Segoe UI Variable Text`, `Segoe UI` | `Tahoma`, `Arial` | `LegacyRuntime.ttf` |
| Linux | `Inter`, `DejaVu Sans` | `Liberation Sans`, `Noto Sans` | `LegacyRuntime.ttf` |

Resolution: read `Font.GetOSInstalledFontNames()` once at boot → first tier-1/2 name present → `Font.CreateDynamicFontFromOSFont(name, FontBody)` → **verify against §1.5 before adopting**; any failure falls silently to tier 0, and the chosen family is named on the settings/help surface so a support question has an answer. A face that fails §1.5 is not adopted even when installed: coverage outranks taste. No font bytes enter the repo — not from the assistant's container, not from anywhere.

### 1.3 Faces per element class (N2 addendum §3 classes)
A legacy dynamic font gives exactly Normal / Bold / Italic (bold and italic may be synthesised). There is no weight ladder, so hierarchy is **size + colour token + position**, never a weight we do not have.

| Element class | Style | Authored `[NAT]` | Colour |
|---|---|---|---|
| Workspace title | Bold | 32 px (USS) | Ink |
| Card / picture title; monogram mark | Bold | `FontCardTitle` 18 | InkStrong / InkMuted |
| Numeric (cash, counts) | Bold | `FontNumeric` 17 | Ink |
| Body; time-or-waiting line | Normal | `FontBody` 14 | Ink |
| Section header (rail header) | Bold | `FontSection` 13 | InkMuted |
| Meta: chips, LOCATE, tabs, footer, search | Bold (chips) / Normal | `FontMeta` 12 | Ink / InkMuted |
| Refusal, cost, waiting cause | Normal — never italic, never below body | ≥ `FontBody` | Action / Blocked **+ a word** |

**Finding F-N3-1 `[NAT]` (to the N2 / C3 owner).** `FontMeta` 12 and `FontSection` 13 render at **12 / 13 screen px** at 1280×720 · 100 % (`s`=1, `m`=1) — 6 and 5 px under the XAG 101 floor of 18; `FontBody` 14 is 4 under. The rails' meta text, not the card title C3 already raises, is the *first* thing that fails §1.4. The single named constant N2 W1 asks for (`minimumRenderedPixels = 18`) must reach the IMGUI `ScaledFont` path too, not only `StudioPeopleWorkspaceLayout.ScaleText`. Raising it grows rows (lawful) and must be re-measured at 1280×720 · 100 % before adoption.

### 1.4 The measured-height test the writer must implement
**Target (XAG 101 restated):** the ink bounding box of `XAG` is **≥ 18 screen px at 1920×1080 · 100 %**, and ≥ `18·m` at 150 / 200 %. Both measurements are required because they fail differently.
1. **Code-side (EditMode)** — per element style `style.CalcSize(new GUIContent("XAG")).y − style.padding.vertical ≥ 18·m`, and per glyph `font.GetCharacterInfo(c, out info, ScaledFont(base,s), style.fontStyle)` with `info.glyphHeight ≥ 18·m` for `X`,`A`,`G`; asserted at `m` ∈ {1, 1.5, 2} for both viewports. Deterministic, headless.
2. **Capture-side (rendered PlayMode)** — the ink bbox of a known `XAG` probe in each surface clears the same floor. This is the one that catches panel scaling: UI Toolkit runs `ScaleWithScreenSize`, reference `1920×1080`, `match` 0.5 `[NAT]`, so a 1280×720 panel scales by ≈ 0.667 and an 18 px authored Toolkit label lands at ≈ 12 rendered px. **Divide Toolkit sizes by the panel scale before comparing — exactly what `ScaleText`'s `minimumPixels / scale` term already does `[NAT]`.**

### 1.5 Atlas / fallback rules `[REC]` and the tofu check
A legacy dynamic font rasterises into an atlas keyed by **(character, size, style)**: never assume a glyph is resident at a size nobody asked for — call `font.RequestCharactersInTexture(set, size, style)` before a first measurement at a new size. **A text-size (`m`) change invalidates every cached metric**: subscribe to `Font.textureRebuilt` and re-measure, since any `CharacterInfo` or `GUIStyle` measurement taken before a rebuild is stale (the likeliest cause of a 150/200 % layout that is right on frame 2 and wrong on frame 1). **There is no fallback chain** — with `FontDefinition.FromFont`, a codepoint the face lacks draws as a missing-glyph box or nothing, so the character set is a contract, not a taste. **Tofu check (EditMode, gates any tier-1 adoption):** `font.HasCharacter(c)` is true for every character in §1.6 in every `FontStyle` used. A `false` is not licence to change fonts; it instructs the copy owner to use the named ASCII substitution.

### 1.6 The character set the game actually draws `[NAT]`
Scanned from string literals in `Assets/Studio/Runtime/**/*.cs`, comments stripped. **Latin-1 letters, digits, ASCII punctuation**, plus:

| Glyphs | U+ | n | Meaning | Risk | ASCII substitution if absent |
|---|---|---|---|---|---|
| `·` `—` `…` `–` `’` `“ ”` | 00B7 2014 2026 2013 2019 201C/D | 749 | separator, dash, truncation, quotes | low | ` - `  ` -- `  `...`  `-`  `'`  `"` |
| `×` `−` `≤` `≥` | 00D7 2212 2264 2265 | 18 | dimension, true minus, bounds | low | `x`  `-`  `<=`  `>=` |
| `→` `‹ ›` `▼ ▲ ▾` `★` `▶` | 2192 2039/203A 25BC/B2/BE 2605 25B6 | 47 | becomes, step, sort/expand, beacon, advance | medium | `->`  `<` `>`  `v` `^`  `*`  `>` |
| **`▸`** `◄ ◀ ◂` | 25B8 25C4/C0/C2 | 30 | More actions; Back / previous | **high** | `>`  `<` |
| **`✓` `✕`** `◆` | 2713 2715 25C6 | 11 | confirmed, close, attention | **high** | `[ok]` + word · `X` · `!` |
| **`● ❚`** `↗ ↘` | 25CF 275A 2197/98 | 6 | clock running/paused, trend | **high** | `*` · `||` · `up`/`down` + word |

Diagnostic and proof-runner literals add `§ ÷ ± ≈ ↔ ⇒ ≠ •` — same face if a runner draws. **Excluded deliberately:** `─` U+2500 (10 497×) and `═` U+2550 (280×) occur **only in code comments**, are never drawn, and must not enter the atlas request set.

## 2 · Icons

### 2.1 Inventory of every icon the shipped UI draws `[NAT]`
The honest finding: **there is no icon set.** Exhaustively, three kinds of non-text mark exist. (a) **Loaded textures** — the six stage sprites via `Resources.Load<Texture2D>("StageObjects/" + key)` (`StudioProductionRailHud.cs:1839`, `StudioLaneInspectorHud.cs:981`), the *only* texture load in the whole UI. (b) **Procedural marks** — 1×1 solids (`StudioUiTokens.Solid`), keyline rings (`DrawRing`), chart strokes, focus/selection borders. (c) **Text glyphs** — the codepoints in §1.6, i.e. *every* remaining "icon" in the game. `grep background-image` over all of `Assets/Studio/UI/Resources/*.uss` returns **nothing**: UI Toolkit draws no image at all. The icon programme is therefore not "restyle the icons" — it is "high-risk glyphs in §1.6 are load-bearing UI resting on one font's coverage".

### 2.2 The Backlot icon spec
**Grid** 24 at `s`=1, with 16 (inline beside meta text) and 32 (header / empty state) the only other sizes; sizes follow `m` (`16·m`/`24·m`/`32·m`) because an icon is a control affordance, not chrome (N2 **W2**). **Stroke** 2 units at 24 → 1.5 at 16, 2.5 at 32; round cap and join; pixel-snap the outer stroke at `m`=1. **Safe area** 1.5 units inset on all sides so an icon never collides with a keyline. **Colour** `stroke="currentColor"` only — the consumer passes a `StudioUiTokens` colour; never bake a colour in; solid fill is reserved for the single state dot inside `attention` and `locate`. **The law that outranks the style:** an icon never replaces its word — attention, waiting, refused and confirmed are a mark **plus** a word at every text size (`[R3]`, N2 §4); an icon-only control is a defect, not a compact variant. **Do not author** a progress meter, star rating, percentage ring, or a second "empty frame" graphic (§4.3).

### 2.3 Authored this task — sources and mapping
Six SVGs under `assets/icons/` (hashes in `assets/PROVENANCE.md`). They are **specifications with drawable geometry**: nothing in Unity loads them yet and no raster is committed.

| Icon | Replaces | Unity owner file(s) to adopt it |
|---|---|---|
| `attention.svg` | `◆` / the drawn amber mark | `StudioPeopleRailHud`, `StudioProductionRailHud`, `StudioHud` |
| `waiting.svg` | `❚` (a pause bar doing a clock's job) | `StudioProductionRailHud`, `StudioLaneInspectorHud` |
| `locate.svg` | nothing — LOCATE is word-only today | `StudioPeopleRailHud`, `StudioProductionRailHud` |
| `more-actions.svg` | `▸` | `StudioLaneInspectorHud` ("More actions ▸"), `StudioCastingWorkspace`, `StudioHud` |
| `close.svg` | `✕` | `StudioPeopleRailHud`, `StudioProductionRailHud` |
| `confirmed.svg` | `✓` | `StudioIndustryWorkspace`, `StudioFoundingCardHud`, both rails |

Prioritised remainder, spec only, in this order: `back` (`◄`, on every return route), `sort` (`▼▲`), `step-prev`/`step-next` (`‹ ›`), `trend-up`/`trend-down` (`↗ ↘`, Finance), `clock-running`/`clock-paused` (`● ❚`), `star-beacon` (`★`).

## 3 · Portraits (C1)

### 3.1 The rig, exactly as committed `[NAT]`
`StudioApplicantPortraitCamera` renders a **live** head-and-shoulders view of the real body: 256 × 320 (**4:5**), FOV **26°**, stand-off **1.15 m** along the subject's forward, eye **1.55 m**, look-at **1.48 m**, background `#D6C29E` (1948 sepia, not a UI grey), private culling layer **30**, applicant furniture (`__Applicant…`, `__SelectionRing…`) excluded so the portrait shows a face and not a nameplate. These framing constants are right for C1 and are **retained with evidence** — nothing below asks to re-frame the camera.
**Finding F-N3-2 `[NAT]` — aspect mismatch.** The rig renders 256:320 = **0.800**; the rail slot is `PortraitWidth` 44 : `PortraitHeight` 53 = **0.830** (`StudioPeopleRailContracts.cs:78-79,174`). `[REC]` set `PortraitHeight` 53 → **55** so the slot is exactly 4:5 and a capture needs no letterbox. At 1280 · 200 % the slot becomes 70.8 × 88.5 instead of 70.8 × 85.3, growing a row ≈ 3 px — lawful (rows may differ in height, nothing is clipped) and cheaper than cropping a face.

### 3.2 Sizes each slot needs at 100 / 150 / 200 %
`PortraitSlotWidth(rowWidth, m) = min(44·m, max(16, rowWidth·0.30))`; `rowWidth` ≤ rail width (**236** at 1280, **258** at 1440) `[NAT]`.

| Slot | 100 % | 150 % | 200 % | Capture to request |
|---|---|---|---|---|
| Rail row, 1280 | ≤ 44 × 55 | ≤ 66 × 82 | ≤ **70.8 × 88.5** | 2× of the 200 % cap → 144 × 180 |
| Rail row, 1440 | ≤ 44 × 55 | ≤ 66 × 82 | ≤ **77.4 × 96.8** | 2× → 160 × 200 |
| Lane-inspector overlay header | 72 (1280) / 78 (1440) wide × `min(slot·1.2, header.height − 20·s)` `[NAT]` | same width | same width | 160 × 200 |
| Dossier / Profile header | 128 × 160 | 192 × 240 | **256 × 320** | the rig's native 256 × 320 |

One capture size serves everything: request the rig's native **256 × 320** and downscale. Never upscale a rail capture into the dossier.

### 3.3 Caching and the identity law `[GAP]`
Today `CurrentPortrait` is **one shared `RenderTexture`**, cleared between subjects (`ClearPortraitTexture`) and driven by a single `ShowPortrait(body)` `[NAT]`. Correct for the founding card, which shows one applicant at a time; it **cannot** serve six rail rows plus an overlay header at once. Named dependency for the N5 writer:
1. A `Dictionary<string talentId, Texture2D>` of **stills read back** from the rig (one `ReadPixels` per capture), not N live cameras.
2. **A slot draws a capture only if `capture.talentId` equals the row's exact `talentId`.** Any mismatch, absence or stale entry → the monogram. Never a neighbour, never array position, never "the last portrait we had" — the identity law the rails already keep.
3. Invalidate on: body leaving the lot, employment ending, scene/`Resources` reload, save load. A capture outlives a frame, never a session boundary.
4. Rig availability is *readable*, so coverage is a fact, not a guess: employed bodies are keyed by talentId in `StudioBridgePresentation.personSlots` (`SeatedPersonTalentIds()`); gate applicants in `StudioFoundingGatePresentation.TryGetApplicantBody(talentId, out body)` `[NAT]`. Anyone in neither set has **no rig** → monogram, by law.

### 3.4 The six-person proof set
From admitted fixture **`r3n1-dense-01`** (`evidence/Playability-Interaction-01/fixtures/r3n1-dense-01/`; 85 talent, 11 contracts) — six employed people, one per profession family:

| # | talentId | Name | Role | Contract wk | Monogram | Expected rig |
|---|---|---|---|---|---|---|
| 1 | `t-dir-00` | Irene Calloway | director | 260→364 | `IC` | seated (`personSlots`) |
| 2 | `t-wri-11` | Anna Lasky | writer | 260→364 | `AL` | seated |
| 3 | `t-act-12` | Joan Fenwick | actor | 260→364 | `JF` | seated |
| 4 | `t-act-03` | Ramon Reyes | actor | 260→364 | `RR` | seated |
| 5 | `t-cra-01` | Orson Ellery | craft | 260→364 | `OE` | seated |
| 6 | `t-sci-00` | Ingrid Blackwood | scientist | 260→468 | `IB` | seated **or monogram** — a scientist in the laboratory may have no lot body; this row exists to prove the fallback |

Two adversarial pairs inside the same fixture: `t-sci-00` **Ingrid** Blackwood vs `t-act-07` **Ingrid** Underwood (`IB` vs `IU` — a first-initial cache key is wrong), and `t-wri-05` Alma Brandt vs `t-act-20` Alma Vollmer. **`r3n1-dense-02`** has only two contracts (`t-dir-00` Blanche Fairbanks, `t-cra-02` Vera Blackwood): use it as the **sparse control**, where four of six slots must legitimately show monograms and the coverage line must say so.

### 3.5 The monogram fallback law — and the F20 fix
`Monogram(name)` = first initial + last initial, upper-invariant, `?` when blank `[NAT]`; drawn `TextAnchor.MiddleCenter` at `ScaledFont(18,s)` = **18 / 27 / 36 px** bold InkMuted in the rail (`StudioPeopleRailHud.cs:750,1221`) and the overlay header (`StudioLaneInspectorHud.cs:742,1142`). **F20** (minor, Build50, 200 %, row + overlay header): glyphs draw above their slot. Two candidate causes, both paper — (a) IMGUI centres the *line box*, so cap-only ink sits above optical centre by ≈ (ascent − capHeight)/2 ≈ 5 px at 36 px; (b) the overlay slot height is clamped to `header.height − 20·s` and a 36 px line box (≈ 41 px with leading) simply exceeds a short header rect and overflows upward. The fix removes both without deciding which is true:
1. **Measure, then fit** — `size` = the largest value ≤ `18·m` whose `monogramStyle.CalcSize(monogram)` fits the slot inset by `2·s` on every side.
2. **Centre on ink, not the line box** — offset the draw rect by `(CalcSize.y − inkHeight)/2` from `GetCharacterInfo` metrics.
3. **Clip** — draw inside `GUI.BeginClip(slotRect)` so an overflow cannot paint outside the slot even if (1) mis-measures.
4. **Recorded tradeoff:** this *shrinks a glyph*, which N2 §4 rule 2 forbids for text. Lawful here only because the monogram is a **redundant graphic mark** — the full name is drawn beside it at full size — and because growing the slot would take the 30 % share protecting the name column. Never extend this reasoning to a cost, a refusal or a cause.

### 3.6 The honest coverage statement (exact format)
Recomputed for the N9 record and Help → About art, never hand-written:
> **Portraits.** `<captured>` of `<shown>` people shown this session were drawn from a live rig capture; `<shown − captured>` showed a labelled monogram because no body for that person exists on the lot (`<reason tally>`). A monogram is a placeholder, not a likeness. Rendered art coverage: stage images **6 / 8** stages (`<missing keys>` share another stage's image — §4.2); icons **6 / 14** authored, the remainder drawn as text glyphs. Nothing here claims portrait art is finished.

## 4 · Stage art

### 4.1 What exists `[NAT]`
Six PNGs in `Assets/Studio/UI/Resources/StageObjects/`, each **156 × 156** (2× the 78 px card slot), Default texture type, no mipmaps, `alphaIsTransparency`, bilinear, uncompressed, `maxTextureSize` 256, hand-written `.meta`. Rasterised by `rsvg-convert 2.62.3` from six originally authored SVGs whose sha256 values sit in `StageObjects/PROVENANCE.md` — no Lionhead pixels, no Lionhead fonts. Keys `writing`, `casting`, `shooting`, `post`, `release`, `library`. The card slot is 78 (1440) / 72 (1280) base px `[NAT]`, so 156 covers the 200 % case (≈ 127 px) with no upscale. **Retain with evidence — this is the one part of the interface art that is finished.**

### 4.2 State → art key, and the two real gaps
All 14 `StudioMovieRailContracts.KnownProductionStates` map through `ProductionLifecycle` → `StudioPictureCardContracts.StageArtKey` `[NAT]`:

| Lifecycle | Operational states | Word | Art key |
|---|---|---|---|
| Development | `development-working` | DEVELOPMENT | `writing` |
| Casting (screenplay path) | — via `ScreenplayArtKey(awaitsCasting)` | CASTING | `casting` |
| Production | `pre-production-working`, `rehearsal-working`, `director-required`, `scenery-in-transit`, `scenery-arrival-pending`, `legacy-load-in-acknowledgment`, `ready-to-schedule`, `shooting-working`, `resource-wait` | PRODUCTION | `shooting` |
| Post | `wrapped-waiting-for-post`, `post-handoff` | POST | `post` |
| ReleaseReady | `release-ready` | RELEASE READY | `release` |
| Committed | `release-committed` | COMMITTED | **`release`** ← shared |
| InTheaters | released, run active | IN THEATERS | **`library`** ← shared |
| unmapped | anything else | UNKNOWN STAGE | `null` → empty frame |

**Missing sprites `[GAP]`: two — and they are the two that matter, because each is a pair of genuinely different player situations drawn with one picture.** `committed` (locked; you can no longer change it) reads identically to `release-ready` (you still can); `intheaters` (money arriving now) reads identically to `library` (a finished record). Spec for both: Backlot language matching the six — flat 2D, `viewBox="0 0 100 100"`, SurfacePlate ground, Ink/InkMuted line work, one Brass accent, no text inside the artwork, legible at 72 px. `committed` = the release sheet **stamped and pinned** (the `release` motif plus a fixed seal; visually "decided"). `intheaters` = a **lit marquee with a queue** (`library` stays a shelved can). Deliverable per sprite: an authored SVG under `assets/stage/` with a PROVENANCE entry (source, author, tool, licence project-owned, sha256), then 1× (78) and 2× (156) rasters into `StageObjects/` recording the `rsvg-convert` version and exact command, exactly as the existing six do.

### 4.3 What must not be drawn
The unmapped case draws **no** sprite — an empty frame plus the words `UNKNOWN STAGE` `[NAT]`. Retain. An honest empty frame is the correct picture for "this client cannot name this stage"; a "mystery" sprite would turn a known unknown into decoration. The stage image likewise stays a **discrete identity cue** — never a progress meter, percentage, date or rating.

## 5 · Acceptance checks the N3 writer / test owner must implement
1. **EditMode font resolution** — the panel root's `unityFontDefinition` is non-null and is the built-in face; every IMGUI style's font is non-null (catches the zero-height-button failure the PlayMode fixtures work around by hand).
2. **EditMode tofu** — `font.HasCharacter(c)` true for every §1.6 character, Normal and Bold, at 12/14/17/18/32 px × `m`; a failure names the glyph, its owner file and the §1.6 substitution.
3. **EditMode atlas** — after `RequestCharactersInTexture(set,size,style)` every character returns valid `GetCharacterInfo`; after a simulated `m` change and `Font.textureRebuilt`, re-measurement returns the new metrics (no stale `CharacterInfo`).
4. **EditMode measured height** — §1.4 test 1 for every element class, both viewports × three sizes; expected failures on `FontMeta`/`FontSection`/`FontBody` are recorded as F-N3-1, not suppressed.
5. **Rendered captures** — the six §3.4 people at rail and dossier sizes, 100/150/200 %, on `r3n1-dense-01`, plus the sparse `r3n1-dense-02` control. Per capture assert: the monogram's ink bbox lies **inside** the slot rect (F20), and the drawn portrait's talentId equals the row's talentId (§3.3 law 2).
6. **Rendered stage art** — one capture per art key at 72 and 78 px, plus one `UNKNOWN STAGE` empty-frame capture.
7. **PROVENANCE integrity** — the `shasum -a 256` block in `assets/PROVENANCE.md` reproduces every recorded hash, and `StageObjects/PROVENANCE.md` still matches its PNGs' source SVGs.
8. **Licence gate** — a repo-wide check that no `.ttf`/`.otf`/font binary has entered either worktree.

## 6 · What N3 cannot claim
This sheet is **paper**. Nothing in it was rendered, captured, measured on a device or played. Every pixel figure is arithmetic over committed constants read by hand from a read-only worktree; every glyph-coverage statement is a *risk ranking*, not an observation — only the §5.2 `HasCharacter` run can say whether `▸ ✓ ✕ ◄ ❚ ◆ ↗` actually resolve in `LegacyRuntime.ttf`, and this task did not run it. F-N3-1 (meta text below the 18 px floor) and F-N3-2 (portrait aspect mismatch) are readings of source, not reproduced failures. The six SVGs are drawable geometry that nothing loads: no icon has been seen at 16 px on a real display and no portrait has been captured from the rig at any size. The six-person proof set names people who exist in an admitted fixture; whether each has a seated body at that week is something the §5.5 captures must settle, not a fact established here. Nothing in this file changes the hybrid selection, the rails, the band, the memo sheet, the lane inspector, route preservation or any G-number — and none of it makes portrait, icon or stage art *finished*.

## 7 · Tradeoffs recorded
* **Tier 0 forever.** Preferring an OS face (§1.2) buys a more native look and risks a coverage regression on a machine nobody tested; the §1.5 gate keeps tier 0 whenever the preferred face is worse. A licensed face stays a later Owner choice, not a gap.
* **Shrinking the monogram** (§3.5) breaks the letter of "never shrink" to fix a real clipping defect, justified only by the mark's redundancy with the adjacent full name. Recorded so a later reviewer sees the exception was deliberate and bounded.
* **Growing rows ≈ 3 px** to make the portrait slot 4:5 (§3.1) costs a little list density and avoids cropping faces. Density loses.
* **Six icons authored, eight specified.** Authoring all fourteen inside the allowance would have meant a thinner font and portrait spec; the glyphs those eight replace still render today, so the deferral is visible rather than silent.

## 8 · Addendum — R3-N3-DESIGN-08: the two §4.2 gap sprites are authored (2026-09-16)
**Files.** `assets/stage/committed.svg` (`c32a4ee5174a5200e480203fbd93b93374f457d994b8fbfb199b6655f7d58417`) and `assets/stage/intheaters.svg` (`23a9fc6810a5f837c2ccfe56d66ab233a9a19d14a08e6476506eb9a6d67a1447`), with `assets/stage/STAGE-SPRITES-README.md` (raster spec, import settings, mapping, acceptance) and entries in `assets/PROVENANCE.md`. Same `defs`, ground ellipse, palette and 100-unit box as the six; no text, no meter, no date inside the art (§4.3 holds).
**What they say.** `committed` = one-sheets rolled, strapped and **sealed** — the decision is stamped and cannot be reopened, unlike `release-ready`. `intheaters` = a **lit marquee, box office and a queue** — a run is live now, unlike `library`'s finished record.
**Deviation recorded.** §4.2 asked for "the release sheet stamped and pinned"; a pinned sheet is the dominant silhouette of *both* `writing` and `casting` and would be confusable at 72–78 px, so the seal survived and the sheet became rolled stock. The seal carries no check mark, because `release` already shows a green check and the card's selection notch is a gold check.
**Mapping to implement.** `committed` ← `Lifecycle.Committed` (operationalState `release-committed`, one of the 14); `intheaters` ← `Lifecycle.InTheaters` via `ReleasedArtKey(runActive: true)` — **not** an operationalState, so `KnownProductionStates` stays 14. `library` keeps the finished run, `release` keeps `release-ready` alone.
**Writer step 1 — rasterise.** `rsvg-convert -w 156 -h 156 <name>.svg -o <name>.png` (2.62.3, as the six). 156 px is the file that ships; the 78 px render is review-only and is not committed.
**Writer step 2 — import.** Copy `release.png.meta`, change only the guid; then record version, command and source sha256 in `StageObjects/PROVENANCE.md`.
**Writer step 3 — map and test.** Add `CommittedArt`/`InTheatersArt` consts, return them from `StageArtKey`, update `KnownState_ReleaseCommitted_*` and `ReleasedArtKey_ActiveRun*`, keep the 14-count structural guard, and add an EditMode load test that all **eight** keys resolve non-null at 156 px (the current fallback hides a missing import behind an empty frame).
**Writer step 4 — one deliberate behaviour change.** `RowWanted` matches a stage filter on the art key, so today a COMMITTED card appears under the RELEASE READY filter only because it borrows that sprite; its own key removes it. Recommended: let it go and assert it (stage sprites README §4.1). Do not re-share the sprite to preserve the side effect.
**What N3 still cannot claim.** Nothing loads these two files; no PNG is committed; no `.meta` exists; imported stage-art coverage is still **6 / 8**. The only rendering that has ever happened is a local `rsvg-convert` pass at 78 and 156 px into a session scratchpad by the author — that is a design check, not the §5.6 rendered capture, and no Unity Editor, PlayMode run or native session has seen either picture.
