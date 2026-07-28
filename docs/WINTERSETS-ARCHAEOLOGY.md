# wintersets Archaeology (contract §5)

A structural study of a legacy *The Movies* (Lionhead, 2005) set mod, to understand how the
original game packaged a "set" — useful design intelligence for Project: Studio — **without
using any of its bytes**. Provenance is **DO-NOT-USE** (see PROVENANCE-REGISTER): protected
Lionhead IP + author-restricted redistribution. Nothing here is loaded at runtime or
converted for reuse. No legacy executable was run (none shipped in the archive; the mod is
pure data).

## Package shape

`wintersets.zip` → 209 files. 5 sets: **winterfield, winterforest, wintershack, winterstreet,
wintersuburb**. Layout mirrors the game's `Data/` tree:

```
Data/
  meshes/            set_<name>_zap.msh          (5)  proprietary mesh
    extrainfo/       set_<name>_zap.inf          (5)  binary metadata
  cameras/           set_<name>_zap.cam          (5)  binary camera path
  set/               set_<name>_zap.ini          (5)  TEXT set definition
  Textures/          *.dds (+ lightmap/, thumbs/) 180  DXT1/DXT3 textures
zapinfo/             zappics/, zapreadme/         mod-installer metadata + German readme
```

## `.msh` — proprietary mesh (NOT converted, by decision)

First 80 bytes of `set_winterfield_zap.msh`:

```
0a00 0000 1400 0000 1400 0000 0200 0000
0000 0101 0086 df01 0900 0000 0000 0000
0100 0000 706c 616e 745f 7068 3033 655f   ....plant_ph03e_
776e 742e 6464 7300 0000 0000 0000 0000   wnt.dds.........
0000 0000 7374 755f 7665 7274 7472 7573   ....stu_verttrus
```

- Little-endian int32 count/chunk table at the head (`0x0a`, `0x14`, `0x14`, `0x02` …).
- Followed by a table of **null-terminated ASCII texture references** (`plant_ph03e_wnt.dds`,
  `stu_verttruss25.dds`, `grou_ph19_wnt.dds`, …) — i.e. the mesh names the DDS files it needs.
- `file(1)` → "data" (unrecognised). No public specification exists.

**Decision (per §5):** building a complete MSH importer is a reverse-engineering effort, not
"clearly simple," so **none was built.** The modern equivalent is trivial to state (glTF/GLB),
but recovering geometry from these bytes is out of scope and blocked by provenance anyway.

## `.dds` — standard textures (recoverable, but not used)

180 DDS files, verified standard DirectDraw Surface:

| fourCC | notable sizes | count (approx) |
|---|---|---|
| DXT1 | 128² · 256² · 512² · 1024² · assorted | ~113 |
| DXT3 | 128² · 256² · 512² · 512×128 | ~67 |

Includes a `lightmap/` subfolder (the readme brags about "bearbeitete Lightmaps," edited
lightmaps) and `thumbs/sets/` (the set-picker thumbnails). Standard DDS is loadable by
three.js `DDSLoader`, so these textures **are** technically recoverable to a modern runtime
(transcode → KTX2/WebP). We do not, on DO-NOT-USE grounds. **Finding: legacy textures are not
the blocker; legacy meshes are.**

## `.ini` — the set definition (the valuable part)

`set/set_winterfield_zap.ini` is plain text and reveals the entire schema the original game
used to describe a buildable/rentable set. Abridged:

```ini
mesh = set_winterfield_zap.msh
dated = date_1920
boredom = 0.4
quality = 0.1
backdrop = bd_winterbach
[finance]      purchasecost = 11000 · annualcost = 0 · dailyrate = 0
[description]  attractiveness = -0.3 · ownable = 0 · daystobuild = 30
[maintenance]  decaytime = 3 · repairwork = 30 · buildingwork = 60 · rebuildingwork = 0
[scene]        setid = 1
[weather]      rain = 0 · snow = 0 · fog = 0
[blueprint]    maxinstances = -1 · path = group_outdoors · trickiness = 1 · ETA = 1904
               [blueprint/requires] 0 = date_1904
[genre]        genre_action = 0.3 · genre_romance = 0.3 · priority1 = genre_sci-fi …
```

**This is the archaeology payoff.** A "set" in the original is not just a mesh — it carries
era gating (`dated`, `ETA`, `requires date_*`), economy (`purchasecost`, `annualcost`,
`dailyrate`), lifecycle (`daystobuild`, `decaytime`, `repairwork`, `buildingwork`,
`rebuildingwork`), a genre-affinity vector, environmental flags (`weather`), and a presentation
hook (`backdrop`, plus the `.cam` intro pan). It cleanly separates **presentation** (mesh,
backdrop, camera, thumbnail) from **simulation** (finance, maintenance, gating, genre) — the
same split Project: Studio's architecture insists on. This directly informs the proposed
`SetPackage` schema in `docs/SCHEMAS.md` (which is a recommendation only and imports none of
this data).

## `.cam` — presentation camera path

`cameras/set_winterfield_zap.cam` is a small binary of float32 values (header counts +
position/orientation keys) — the "Vorstellungs-Kameraschwenk" (introductory camera pan) the
readme describes, played when you double-click a set in the picker. Modern equivalent: a
keyframed camera path (a small JSON of position/target/time), exactly the kind of thing a
`SetPackage.presentation.introCamera` field would hold.

## Modern-equivalents map

| Legacy | Purpose | Modern equivalent |
|---|---|---|
| `.msh` | mesh geometry | glTF/GLB (`AssetDefinition`) |
| `.dds` (DXT1/3) | textures | KTX2 / WebP (transcoded) |
| `.cam` | intro camera pan | keyframed camera-path JSON |
| `.ini` `[finance]/[maintenance]/[blueprint]` | sim data for a set | `SetPackage` sim fields |
| `.ini` `mesh/backdrop` + thumbs | presentation refs | `SetPackage.presentation` |
| `.inf` | binary extra metadata | folded into `SetPackage` |
| `zapinfo/` | mod-installer packaging | npm package / content-pack manifest |

## Conclusion

The legacy mod is a **DO-NOT-USE reference specimen**: its meshes are an unreadable
proprietary dead end and its license forbids reuse, but its **`.ini` set schema is a genuinely
useful design reference** for how a "set" bundles presentation + simulation + era gating. We
took the *idea*, not the bytes.
