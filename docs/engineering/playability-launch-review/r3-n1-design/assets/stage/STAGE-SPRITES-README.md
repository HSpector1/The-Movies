# Stage sprites — the two missing art keys (`committed`, `intheaters`)

**Task R3-N3-DESIGN-08.** These two SVGs close the `[GAP]` named in
`R3-N3-VISUAL-STANDARD-SHEET.md` §4.2: today `release-committed` borrows the `release`
sprite and an active theatrical run borrows the `library` sprite, so two pairs of
genuinely different player situations are drawn with one picture. This file is named `STAGE-SPRITES-README.md`, not `README.md`, because
`.gitignore:40` bans any tracked `README.md` outside `docs/adr/`. Authoring an SVG is
**not** shipping art — nothing in either worktree loads these files yet. This README is the
hand-off: it tells the N3 writer exactly what to raster, where to put it, and what to change.

Design worktree (writable by design): TS `docs/.../r3-n1-design/assets/stage/`.
Game worktree (writable by the N3 writer only): Unity `Assets/Studio/UI/Resources/StageObjects/`.

## 1 · What the two pictures say

| Key | The player situation it must distinguish | Motif |
|---|---|---|
| `committed` | The release is **locked**: you can no longer change it. Distinct from `release-ready`, where you still can. | One-sheets rolled, strapped and **sealed** — a brass seal over a strap, one dark tie. The decision is stamped; nothing on this picture can be reopened. |
| `intheaters` | Money is **arriving now**: a run is live. Distinct from `library`, a finished record. | A **lit marquee** — bulb rail, box office, a queue of four. People are at the door tonight. |

Both are in the Backlot language of the existing six: `viewBox="0 0 100 100"`, the same
`metal`/`paper`/`ink`/`brass` gradient `defs` block byte-for-byte, the same ground ellipse
(`cx=51 cy=87 rx=36 ry=6`, `#463621` at `.15`), the same `shadow` drop-shadow filter, flat
2-D, no text inside the artwork, no progress meter, no date, no rating (§4.3).

**Recorded deviation.** §4.2 specified `committed` as "the release sheet stamped and pinned".
A pinned sheet is a large cream portrait rectangle, which is the dominant silhouette of
**both** `writing` and `casting`; at the 72–78 px slot they would be confusable. The seal
survived, the sheet became rolled stock, and the silhouette (a diagonal bundle) is now unlike
any of the six. The seal deliberately carries **no check mark**: `release` already shows a
green check, and the card's own selection notch is a gold check.

## 2 · Raster spec

The rail draws the texture with `ScaleMode.ScaleToFit` into a square-ish frame, so **one**
texture serves every size. Sizes come from `StudioProductionRailContracts`:
`StageImage = 78` (wide viewport), `StageImageNarrow = 72` (narrow), `StageFrameInset = 8`;
`StageSlotHeight = slotWidth · (78 / baseImage)`. The lane inspector draws the same key into
`slot × min(slot·1.2, header−20·scale)` (`StudioLaneInspectorHud.DrawLaneHeader`).

* **1× = 78 × 78 px** — the wide-viewport slot. Render it for eyeball review; **do not commit it.**
* **2× = 156 × 156 px** — *the file that ships*, exactly as all six existing sprites do
  (they are 156 px and there is no `@2x` variant mechanism here). 156 px stays crisp at
  `StudioLegacyUiMetrics.CurrentScale` 2 and at the 200 % text preference.

Exact commands (rasteriser already used for the six: `rsvg-convert 2.62.3`, cairo 1.18.4):

```
rsvg-convert -w 156 -h 156 committed.svg  -o committed.png
rsvg-convert -w 156 -h 156 intheaters.svg -o intheaters.png
```

Copy the two PNGs to `Assets/Studio/UI/Resources/StageObjects/`. Record the rasteriser
version, the exact command and the source-SVG sha256 in **that folder's** `PROVENANCE.md`,
in the same shape as the existing six entries.

## 3 · Import settings (hand-written `.meta`, no Editor GUI)

Copy `release.png.meta`, change **only** the `guid` to a fresh unique 32-hex value. That
gives the settings the six already use and that this art needs:
`serializedVersion: 13`, `textureType: 0` (Default — `GUI.DrawTexture` draws the texture
directly; no Sprite import), `sRGBTexture: 1`, `enableMipMap: 0`, `alphaIsTransparency: 1`,
`filterMode: 1` (bilinear), `maxTextureSize: 256`, `textureCompression: 0` (uncompressed, so
the line work keeps its edges), `wrapU/V: 1` (clamp). Two platform blocks
(`DefaultTexturePlatform`, `Standalone`), both `overridden: 0`.

## 4 · Art-key mapping the writer must implement

Today (`StudioPictureCardContracts`, Unity `Runtime/Infrastructure/StudioRailReturnContracts.cs`):

```
Lifecycle.Committed  => ReleaseArt   // "release"  ← shared, the defect
Lifecycle.InTheaters => LibraryArt   // "library"  ← shared, the defect
```

After import:

| New key | Lifecycle | Reached from | In `KnownProductionStates`? |
|---|---|---|---|
| `committed` | `Lifecycle.Committed` | operationalState **`release-committed`**, via `ProductionLifecycle` → `StageArtKeyForProductionState` | **yes** — it is one of the 14 |
| `intheaters` | `Lifecycle.InTheaters` | a **released record whose run is still active**, via `ReleasedArtKey(runActive: true)` | **no** — released records are not operationalStates; `KnownProductionStates` stays 14 |

`library` keeps the **finished** run (`ReleasedArtKey(runActive: false)`) and is unchanged.
`release` keeps `release-ready` only. Add `public const string CommittedArt = "committed";`
and `InTheatersArt = "intheaters";` beside the existing six consts and return them from
`StageArtKey`. Do not touch `StageWord`/`LifecycleLabel`: the words COMMITTED and
IN THEATERS are already correct and already tested.

### 4.1 One behaviour change the writer must decide deliberately, not by accident

`StudioPictureCardContracts.RowWanted` matches a stage filter by comparing the card's **art
key** to `FilterStageArtKey(filter)`, and `FilterStageArtKey(Filter.ReleaseReady)` returns
`ReleaseArt`. So today a `release-committed` card *does* appear under the RELEASE READY stage
filter, purely because it borrows that sprite. Giving `committed` its own key removes it from
that filter. **Design recommendation: let it go** — the filter names one stage, the COMMITTED
card is not release-ready, and the card is still reachable under Active, and under Decisions /
Waiting when the authority marks it so. If the writer instead wants the old behaviour, that
needs an explicit filter change (a Committed filter or a widened predicate), not a silent
re-share of the sprite. Either way, say which in the commit body.

## 5 · Acceptance the writer/test owner must add (none of it is done here)

1. **EditMode atlas/mapping** — `StageArtKeyForProductionState("release-committed") == "committed"`;
   `ReleasedArtKey(true) == "intheaters"`, `ReleasedArtKey(false) == "library"`;
   `StageArtKeyForProductionState("release-ready") == "release"` still passes. Update
   `StudioPictureCardContractsTests.KnownState_ReleaseCommitted_IsCommittedRelease` and
   `ReleasedArtKey_ActiveRunUsesInTheatersArt_CompleteRunUsesLibraryArt`; keep the
   `EveryKnownProductionStates_EntryIsCoveredByTheFourteenTestsAbove` count at 14.
2. **EditMode load** — `Resources.Load<Texture2D>("StageObjects/committed")` and `…/intheaters`
   are non-null and 156 × 156, and every one of the eight keys resolves (the current fallback
   silently draws an empty frame, which is exactly how a missing import would hide).
3. **Rendered capture** — sheet §5.6: one capture per art key at 72 and 78 px, plus the
   `UNKNOWN STAGE` empty frame. Until that exists, nobody has seen these two on a display.
4. **Filter regression** — the §4.1 decision asserted as a test, whichever way it goes.
5. **PROVENANCE integrity** — `shasum -a 256` over both SVGs reproduces the hashes in
   `assets/PROVENANCE.md`, and `StageObjects/PROVENANCE.md` matches its new PNGs.

## 6 · What this folder does **not** establish

No raster is committed here; no Unity file was touched by the task that authored these (the
Unity worktree was read-only); no Editor ran; no capture exists; nothing has been seen at any
size on a real display except a local `rsvg-convert` render at 78 and 156 px by the author.
Stage-art coverage is still **6 / 8 imported**. It becomes 8 / 8 only after §2, §4 and §5.
