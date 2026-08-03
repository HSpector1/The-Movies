# D1-A — Identity Manifest Architecture

The identity manifest is the spine of this slice. It exists so that "how the studio looks"
is **data**, separate from both the simulation and the renderer, and so that it is
**structurally impossible** for a look change to become a simulation change.

## Where it lives

```
ui/src/lot/identity/
  manifest.ts    the presentation-only type + Concept A data + review registry
  emblem.ts      procedural original emblem (crest / PS monogram)
  signage.ts     procedural plaques, gate wordmark, theater marquee, attention badges
```

Consumed by `ui/src/lot/scene/LotScene.ts` (the Phaser scene) through a small, guarded
identity layer. Nothing outside `ui/src/lot` imports it.

## The contract: presentation-only

`StudioIdentityManifest` has exactly these fields:

| Field | Meaning |
|---|---|
| `id` | stable concept id (`concept-a-golden-age-deco`) |
| `displayName` | gate wordmark text (`PROJECT STUDIO`) |
| `shortName` | compact label |
| `monogram` | emblem letters (`PS`) |
| `palette` | eight named canvas colors (0xRRGGBB) |
| `signage` | the nine building sign labels |
| `emblem` | how the emblem is drawn (geometry, line weight, accent mode) |
| `marquee` | marquee border style, bulb density, reduced-motion mode |

It has **no** field for cash, week, tick, productions, standing, talent, seed, actions,
forces, forecast, revenue, or score. This is enforced by a unit test
(`identity/manifest.test.ts`) that walks the object at every depth and fails if any key from
the simulation vocabulary appears. Change a manifest field and the lot repaints; it cannot
change what the simulation does.

## Why this cannot leak simulation truth

Two independent walls:

1. **The manifest carries no dynamic state.** It is a static description of a look. The only
   dynamic inputs the identity layer reads — which stages are lit, whether a film is showing,
   the marquee title, whether Administration is under financial pressure — come from
   `StudioLotSnapshot`, the same authoritative, presentation-ready selector output the lot
   already consumed. The renderer never touches `GameState`.

2. **`StudioLotSnapshot.ts` is unchanged.** No field was added to the snapshot for identity;
   the identity layer reasons only over fields the D1 selector already emits
   (`activeProductions`, `releasePresence`, `latestReleaseTitle`, `buildings[].attention`).

## Concept A values (Golden Age Deco)

- **Palette:** muted gold `#c9a24a`, charcoal `#2b2822`, deep burgundy `#7c2e35`, cream
  `#f1e6cc`, near-black `#171310`, warm stone `#bdb08e`, plus a green `positive` and amber
  `warning` used **only** paired with a shape + word (never color alone).
- **Emblem:** a `crest` — a stepped Deco octagon frame, restrained spotlight rays, a
  horizontal accent bar, and the `PS` monogram in the shared serif face.
- **Signage:** brass double-rule enamel plaques; stages emphasized with burgundy corners.
- **Marquee:** a Deco burgundy marquee with `2 × 7` perimeter bulbs; a static all-lit state is
  the reduced-motion equivalent.

## Review registry

`IDENTITY_CONCEPTS` currently holds **only** `concept-a` (B/C reserved). `manifestFor(mode)`
resolves every review mode to Concept A in this slice; when B/C are authorized, that function
is the single branch point.

## The three review modes at the scene

- **baseline** — no identity object is shown (or, with the flag off, ever built). Byte-for-byte
  D1.
- **concept-a** — the identity layer is built (once) and shown.
- **fallback** — the identity layer is built, then the real degradation path is exercised
  (`identityFailed = true` → `hideIdentity()`), proving the base lot survives an identity fault
  with navigation and selection intact.

Every identity draw call is wrapped so that any failure degrades to the base presentation
rather than breaking the lot.
