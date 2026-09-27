# 1197-A — measured P3 neighbor maintenance

Frozen against published `96d84212edf5580edcdbe5f900b70253ec7ff53f`. This changes exactly five test files after reading the complete independent 1195/1196 results. No project import was evaluated, compiler/test/gameplay run, index changed, or commit made by this author. Production, generated files, immutable fixtures, existing evidence and all P3 target tests remain unchanged.

## Actual measurement authority

1195 passed from 16:48:54.174 to 16:48:58.615 UTC on 2026-09-27 (4.441 s). The dedicated compiler graph includes the producer among 193 files, with no diagnostics. 1196 passed from 16:49:28.743 to 16:49:30.403 UTC (1.660 s). Both recorder records have child 0, fixed source, empty consumed diff/untracked list, and no signal/error. Manual producer/config/manifest and raw-index guards match before/after; complete postflight pins are in the source manifest.

1196 actually rendered all eight positive fixtures twice (16 renders, zero ticks). All six fixed bodies stayed exact. F10 and F11 each measured **406,091 bytes**, SHA256 `a9708ee36cb26c7a5fd48662c0bf705c364a42feeb796ade78a36432add3c092`, with identical first/second bytes. Their prior independently measured 401,842-byte `4ab41413…` body remains preserved in 1047/1075. The new pins come from this separate measurement, not 1190 failure output or the test recomputing its expected value.

The measured current schema is protocol 4 / projection 54, `sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302`. The **whole generated C#** is separately 867,401 bytes / `891b8f971dfcc474d6c083f2f0db54ff972e50ad0664b0a4e15d65e949de422a`; it is not the declaration-body hash. Original 1190–1194 failures and complete large diagnostic artifacts are unchanged.

| Closed record | Bytes | SHA256 |
| --- | ---: | --- |
| `1195-p3-measurement-types.txt` | 18706 | `57f6df32a25c49e61e6b63b324aece889f47f4f7c920cd5177aed2cd9c4360ab` |
| `1195-p3-measurement-types.json` | 752 | `81649b58d800f22848200126dbe64bdeb27a300b05d4588969a86aaabec99e22` |
| `1196-p3-declaration-measurement.txt` | 6018 | `ba0038670d6f69d0787c1ec093c54214e4aef0e5d090c089ebd673fdf13203d1` |
| `1196-p3-declaration-measurement.json` | 702 | `8a538a7e4d50ec4f99635a51e3250f543b1e1d4f5339ec0e32b6bfd311ae40fb` |

## Exact repair scope

- Schema tests now expect current projection 54 in metadata, current envelope refusal and generated header. The deliberately old snapshotVersion 24 negative remains unchanged.
- Generator F10 uses the measured current schema identity/projection; F10/F11 body pins use 1196. All six fixed declaration hashes and all structural/union checks remain exact.
- Runtime47 metadata now expects Save39/projection54 and the exact 42-entry prior set, adding only genuine outgoing53 `sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d` → `projection-v53`. Historical outgoing46 data/guards remain unchanged.
- Waiver wire-shape controls admit DIRECTING_COUNT alongside P1/P2 while continuing to refuse the two unoffered families. This does not claim a P1-to-P3 engine waiver succeeds. The explicit P2 class requirement remains exact. Observed 1194 metadata/registry guards advance to 54/42 with the same exact old53 entry. Actual prior49 migration must yield live39 in both slots; original49 bytes and factory/week assertions remain unchanged.
- The classless base feeds actual `migrateToLive` output to strict39; the shared old P1/P2 history oracle now explicitly expects `qualifyingRole: 'cast'`. Both were observed failures. Its two additional frozen38 calls also consume current data: the synthetic-age control starts from `migrateToLive`, and the saved-session control reads actual `BridgeSession.save` bytes. Those are **source-attributed masked current-carrier corrections**, not separately observed failures. They now use strict39, with frozen29/31 admission, historical shape controls, age construction, all other assertions and routes unchanged.

## Explicit title mapping

Parent requested accurate current numeric titles before freeze. These are the only declaration changes; the describe rename changes the common prefix of its six existing runtime cases. Future attribution must retain this mapping rather than silently normalize identities.

- `P14B4 genuine outgoing46 runtime compatibility — future Save30/projection47` → `P14B4 genuine outgoing46 runtime compatibility — current Save39/projection54` (describe).
- `requires literal projection52/Save37 (875) and exact 40 prior IDs, excluding the running identity` → `requires literal projection54/Save39 and exact 42 prior IDs, excluding the running identity` (it).
- `the two OFFERED families validate and the three unoffered ones are refused at the wire` → `the three OFFERED families validate and the two unoffered ones are refused at the wire` (it).
- `PROJECTION_VERSION is 52 and the schema document agrees` → `PROJECTION_VERSION is 54 and the schema document agrees` (it).

All remaining declaration lines and timeout lines compare byte-exact after reversing only those four title replacements. No case is added, removed or skipped.

## Frozen source and verification selection

| Path | Bytes | SHA256 |
| --- | ---: | --- |
| `tests/bridge-contract-generator.test.ts` | 53596 | `6efb4de714e6b6f1944a54ab07ea3a8cf0633aa71e9f8d49ee3d1a30c4f70691` |
| `tests/bridge-p14b4-cast-class.test.ts` | 34153 | `cc15f2bd95b9f8ae114ec0b02f18a8258f41d1d98e0bbc56f0b599fdcc5a4b4e` |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 17641 | `7c645b9c96c9592352b9ca3cfe0cb05c53e22a029b64b6de26588da5c625034d` |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 62598 | `478b0f07da3209a3f483c893fbab84fef64ccbbe79f51e9675337b6291cbc2de` |
| `tests/bridge-schema.test.ts` | 40989 | `6db6a763808d3f1e8401c63e8579a41ccea83daf78d2f09ddf082869e8b59369` |

Ordered patch: `1197-p3-neighbor-maintenance.patch`, 19,383 bytes / `c14ffa4477d02b08e441a868e3a630f7528f0baf4bc43f0ced3faeb84ea9f49f`.

Manifest: `1197-p3-neighbor-maintenance-manifest.json`, 17,656 bytes / `f12abfddefc1c92721b316a6b4c942f3ac243b4b56783b612405cd59f944774d`. It contains exact pre/post file identities, complete argv arrays, title mappings, protected pins and measurement references. A stdlib unified-hunk reconstruction reproduced all five complete postimages from their exact HEAD preimages; the changed consumed path set is exactly these five.

Parent execution proposal, with no predicted outcome:

1. **1198**: `node_modules/.bin/tsc --noEmit -p tsconfig.bridge.json`.
2. **1199**: the manifest's exact three-file command with `--no-file-parallelism` and six-title selector: three changed schema leaves, two generator leaves, one runtime metadata leaf. Six selected of 59; 53 filtered. No advances.
3. **1200**: the exact waiver command selects four changed leaves plus the retained explicit P2 class-law neighbor. Five selected of 32; 27 filtered. No advances.
4. **1201**: the whole classless file, 28 cases, because its repaired base/history helpers serve wire, session, privacy, cap, binding and termination controls. Its two unchanged seat-class binding leaves each call existing `advanceTo(45→52)`: up to **14 existing advances** if their prerequisites are reached. This is not a zero-tick run. No added counter, setup, route or timeout.

The proposed total is 39 selected cases and 80 filtered cases across three serial commands. The classless whole-file result may expose unrelated previously masked premises; those must be attributed from actual diagnostics before any further repair. D17, other passed P3 Bridge leaves, pure UI, root types and generated checks are not repeated here. Existing timeout limits are unchanged; earlier D15/D17 synchronous elapsed-time caveats remain unresolved and are not cleared by this maintenance.
