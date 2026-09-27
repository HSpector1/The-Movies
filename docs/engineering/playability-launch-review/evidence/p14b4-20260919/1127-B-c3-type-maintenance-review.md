# 1127-B — Independent two-diagnostic correction review

**KEEP.** Closed 1104 is preserved as child2 on fixed published `ab9f4923c40c6b9d93da5831b03b128aa83b4efe`, empty consumed diff, 33.780 seconds. Its raw log contains exactly TS6133 for the unused M2 local at287 and TS2552 for the obsolete `GameState` name on the historical V10 collision fixture at325. Neither is a production diagnostic or a behavioral result.

Independent live/staged byte checks confirm the correction contains only:

1. Deletion of the unused `const migrated = migratedSave.state` in M2's second historical branch. The actual `migratedSave` conversion, historical live migration and all assertions remain.
2. `const colliding: GameState` → `const colliding: GameStateV10`, matching `base` and its actual admitted historical substrate. No cast, object member or assertion changes.

The postimages were independently reconstructed by those exact two textual operations; all other bytes match their 1123 live preimages. No value, tick, command, declaration, refusal, timeout, compiler option or production file changes.

| Frozen artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1127-c3-type-maintenance.patch` | 1,105 | `92779d40a431b9d7afd76a067f7fee002e315c79bd0575c1fb4286f53a6550f8` |
| `1127-c3-type-maintenance-stage/manifest.json` | 1,385 | `de1c103caa349b75774e2a3368c137a17dd1fec4685e6722dacab916af82b8e5` |
| `1127-A-c3-type-maintenance-handback.md` | 1,999 | `18962ad72929f2cfa13612353ea4e639564817c4287511fab92732359bbc1b5d` |

The M2 postimage is 12,962 bytes / `d4f64a69f5445afee21c9901d468400d582db4a8aa073652a9e6efb6960b3841`; the V10 postimage is 11,875 bytes / `3382a3c74b4a16b6d3e705a39323cb2871c6b79e926f469d36ae8d1bc442acb3`.

The proposed repeat boundary is appropriate: root `tsconfig.json` includes both non-Bridge test leaves. Neither matches the UI or Bridge include patterns, and read-only searches across `src`, `bridge`, `ui` and `tests` find no import/reference to either leaf module. The two files therefore do not affect those other compilation graphs. Once the original UI/Bridge gates have closed and their source/dependency guards hold, only root types need repeat for this exact correction. The planned whole-file behavioral selections remain unchanged and still require execution; source KEEP does not infer their results.

Original 1123 staging, 1104 failure and other gate identities remain immutable. Parent may apply the two checked postimages only after the active type series closes. This reviewer did not apply, compile, evaluate project modules or run gameplay/tests.
