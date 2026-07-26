# Navigation & Interaction Event Inventory

Every event the lot emits or expects, at commit `8c5a18b`. Sources:
`lot-spike/src/lot/LotScene.ts` (`LotEvent` union), `lot-spike/src/StudioLotView.ts`
(public callbacks), `lot-spike/src/main.ts` (prototype host wiring + `window.__lot`).

## Two layers

1. **Internal scene events** — `LotEvent` union emitted by `LotScene` via a single
   `onEvent` callback (`LotScene.ts:62`). This is an implementation detail.
2. **Public view callbacks** — `StudioLotView` translates `LotEvent`s into the
   host-facing callbacks in `StudioLotViewOptions` (`StudioLotView.ts:30`). **This
   is the production contract.**

## Public view callbacks (production contract)

| Callback | Payload | Trigger | Host responsibility | Production relevance | Integration concern |
|----------|---------|---------|---------------------|---------------------|---------------------|
| `onSelect(sel: SelectionInfo \| null)` | `{ buildingId, label, blurb, available, action, production }` or `null` | User clicks a building; `null` on deselect / when a character is inspected | Show/hide a building info panel; `action` is the intent to wire to a screen | **Keep** — core navigation | `label`/`blurb` are lot-authored copy; host may prefer its own strings |
| `onAction(e: LotActionEvent)` | `{ buildingId, action: LotActionKind }` | User invokes a building's action (info-panel button, or `view.triggerAction`) | Open the matching screen/route | **Keep** — the navigation contract | `LotActionKind` is a semantic enum (below); lot owns **no** routes/URLs |
| `onReady()` | — | Lot finished first paint | Optional: hide a loading state | **Keep** | — |
| `onCharacter(info: CharacterInfo \| null)` | `{ role, activity, production?, building?, description }` or `null` | User clicks an ambient/vignette character; `null` on dismiss / when a building is selected | Show a light character card | **Optional** — atmosphere; safe to ignore | Presentation-only copy; no game data |
| `onActivity(text: string \| null)` | toast string, or `null` to clear | A vignette raises/clears a cosmetic activity cue | Optionally surface a small non-blocking toast | **Optional** — atmosphere; safe to ignore | Auto-dismisses; host may drop it entirely |

`SelectionInfo` / `LotActionEvent` / `CharacterInfo` are exported from
`StudioLotView.ts` (the latter re-exported from `LotScene.ts`).

## `LotActionKind` — semantic action vocabulary

`open-studio-overview`, `assemble-film`, `browse-talent`, `review-productions`,
`view-released-films`, `view-expansion` (`StudioLotSnapshot.ts:35`). Mapping
building→action is `BUILDING_ACTION` (`StudioLotSnapshot.ts:125`):

| Building | Action |
|----------|--------|
| admin, gate | `open-studio-overview` |
| writers | `assemble-film` |
| casting | `browse-talent` |
| stage-a, stage-b, post | `review-productions` |
| theater | `view-released-films` |
| expansion | `view-expansion` |

**The lot owns no routes or URL strings.** It emits a semantic name; the host maps
name → screen. The only place these are "coupled" to a host today is the prototype
action log in `main.ts` (`ACTION_LABEL` in `host.ts` maps them to display strings),
which is spike-only.

## Internal `LotEvent` union (not the public contract)

`LotScene` emits these to `StudioLotView` only:

| `LotEvent.type` | Payload | Becomes public callback |
|-----------------|---------|--------------------------|
| `selected` | buildingId, label, blurb, available, action, production | `onSelect(info)` |
| `deselected` | — | `onSelect(null)` |
| `action` | buildingId, action | `onAction(e)` |
| `character` | `CharacterInfo \| null` | `onCharacter(info)` |
| `activity` | `string \| null` | `onActivity(text)` |
| `ready` | — | `onReady()` |

Building **hover** is handled entirely inside the scene (outline + label + cursor)
and is **not** emitted publicly. Character **hover** likewise stays internal
(sprite scale + `help` cursor). No hover event crosses the boundary — good.

## Prototype-only / test-only hooks (NOT contract)

`window.__lot` in `main.ts` exposes debug controls for the standalone spike and the
headless harness. **None of these should ship.**

| Hook | Purpose | Disposition |
|------|---------|-------------|
| `__lot.setMode(fixtureKey)` | switch fixture | spike-only |
| `__lot.select/clearSelection/triggerAction(id)` | drive selection | test-only (mirrors public API) |
| `__lot.camera(preset)` | move camera framing | test/dev-only |
| `__lot.forceVignette(kind, phase)` | force a vignette to a phase | test-only |
| `__lot.pauseVignettes(bool)` | pause scheduler | test-only |
| `__lot.seekVignette(t)` | seek active vignette | test-only |
| `__lot.firstInspectableScreen()` | first character screen pos | test-only |
| `__lot.debugState()` | selected/activeTags/displayObjects/characterActive/poolInUse/vignette | test-only |
| `__lot.recreate()` | destroy + rebuild game | test-only (leak check) |
| `__lot.events` / `__lot.character` | recorded events for assertions | test-only |

These are reached via matching public methods on `StudioLotView`
(`forceVignette`, `pauseVignettes`, `seekVignette`, `firstInspectableScreen`,
`getDebugState`, `recreate`). Recommendation: keep the **methods** on the view
(useful for tests) but **do not expose `window.__lot`** in production; the host
should never install a global.

## Recommendation — what survives extraction

- **Ship:** `onSelect`, `onAction`, `onReady` (core); `onCharacter`, `onActivity`
  (optional atmosphere — host may no-op them).
- **Ship as test surface, not player UI:** `forceVignette`, `pauseVignettes`,
  `seekVignette`, `firstInspectableScreen`, `getDebugState`, `recreate`.
- **Drop:** `window.__lot` global, the action log, `setMode` fixture switching.
