# 1359-C2 handback: P15C Wave 2 RED r2 (Legacy integration)

**Status: staged, not run.** I ran no vitest, tsc, node or tsx. I checked types, premises and the reference by reading. r2 applies [1359-D](1359-D-p15c-wave2-red-review.md) under the binding [1359-F2](1359-F2-parent-response-to-1359-D.md). Scratch tree T = `studio-scratch/1359-red/tree`, base ad4aaa8 (1063ab4f):

| Branch | Head | Holds |
|---|---|---|
| `main` | 888170c | the RED r2 (r1 a06c0ae plus 13 r2 commits, one per change) |
| `sibling-1359` | c9a9425 | the five sibling leaves, on top of `main` |
| `ref-1359-r2` | 7a0e1dd | the reference, rebased on `main` (src only) |

Every patch passes `git apply --check` in a scratch index: the RED on the base, the sibling patch on the RED with and without the reference, the reference on the RED.

## Changes from 1359-D/F2

| F2 item (1359-D) | What r2 does | Where |
|---|---|---|
| 1. C11 literal pins (D1) | `legacy-definition-era-guard` pins v1 as literals: the fifteen 1353-A §5.5 values, 6240, the mode, the archetype, lens and domain id lists, the bounds and the count keys. The frozen entry must equal them; while `CAMPAIGN_LEGACY_DEFINITION` is v1, the live exports and TUNING must equal them too. An unknown definition still refuses by name. | main file, C11 |
| 2. Budgets that fire (D2) | `budgeted()` times each leaf's body and asserts it against a PROVISIONAL constant: route 600 s, extension 1,800 s, route plus extension 2,400 s, fixture 600 s. The route and extension timings the controls log are now asserted. The parent sets each number from the first single-file run. | `tests/helpers/p15c2-legacy.ts` |
| 2. Wave R guard (D2) | All seven guards self-time against `PROVISIONAL_GUARD_BUDGET_MS` (300 s, above the 90.4 s and 189.9 s of 1353-F3). The header no longer claims the timeout can fire, and a BUDGET note says why. Test-only. | `tests/p15c-wave-r-retention.test.ts` |
| 3. One P15 list (D3) | `tests/helpers/p15-roots.ts` matches 1356-C r2's file (e47db4f) except one line: `P15_ROOTS` adds `campaignLegacy`. The private list and the guessed sibling paths are gone. B1 and C4g count new rows over `P15_ROOTS`. C2, C2g and C5 compare only what a step adds or strips, so a shared or a separate step passes. The header states the assumed order (1359-A §10 item 3: P15C lands with or after its siblings) and the re-pin set: `P15_ROOTS`, B1, C4g, and the forged roots of A3, A5, A7, A8 and B4. If P15C lands first, those five forged-root leaves move to the sibling's landing patch. | main file header; helper |
| 4. Premises for C2 and B4b (D4) | C2 asserts at least one capture. B4b drops its outside half (B4 proves the cut on a forged root). It keeps the inside half, now premised on the 6240 record and on the official equal to the law over the tick's facts. Renamed `legacy-ranking-at-6240-inside-live-tick`; it sits in the sibling patch. | main file; sibling file |
| 5. Route L producer (D5) | `1359-P-p15c2-route-l-producer.ts` in the 1355-P form: a HEAD pin (`P15C2_PRODUCER_HEAD`), a refusal when the output exists, a probe that refuses a tree whose fresh world already has `campaignLegacy`, every check before any write, gzip 9 with a round trip, and sha256 and bytes in MANIFEST. It writes only `tests/fixtures/p15/p15c2-route-l-captures/` (weeks 6239 and 6240 plus MANIFEST). Route L moved to `tests/helpers/p15c2-route-l.ts`, which the leaves and the producer share. The leaves require MANIFEST `saveVersion` = STEP - 1, so the captures serve a shared or a separate step. | producer; route helper |
| 6. B3 declared (D6) | B3 states that its K1 input breaks the marker rule and why ticking it is lawful: `tick()` runs only its boundary asserts (tick.ts:203-228, :1028). The leaf asserts `refuses(forged, MARKER)` before ticking. The header lists B3 with A9 and B5. | main file, B3 and header |
| 7. F1 leaf (D7) | New leaf `legacy-law-settled-week-null-authored-only`. The law accepts an authored settled film with a null week, which counts as `authoredPre1920: 1` and never as a release. It refuses a campaign film with a null week by name (`films[0] (CAMPAIGN).settledWeek`). | main file, last describe |
| F1 ruling | The reference already relaxed authored films only. r2 changes only its comment, which now cites the F2 ruling. `CAMPAIGN_LEGACY_DEFINITION` stays v1. | `reference/1359-reference-r2.patch` |
| Split | B2, B4b, C3b, C8b and C10c moved to `tests/p15c2-campaign-legacy-sibling.test.ts` (`1359-p15c-wave2-sibling.patch`). B7 became `1359-B7-note-for-p15b.md`. C3b now also requires a sibling migrated at 6239, which only a shared step gives; its header says how to re-pin it for a separate step. | sibling file; note |
| Dropped | r1's claim that C5 needs the Legacy refusal first in a shared step is gone. C5 checks only `campaignLegacy` after the downgrade, and its frozen-save half holds in any order (1359-D checklist 4). | this handback; C5 |
| Also open (D) | The week-8,791 timing of 1359-F:24-26 has no leaf. I leave it with G-L, the parent's measurement. | none |

Two fixes beyond the list. Minted captures at the live version now fail RED by name ("the Legacy's save step has not landed above them") instead of on a bare version mismatch. The FIXTURE PENDING message names no save number, since the live version sits below the step only at RED.

## Leaves

- **Main RED** (`1359-p15c-wave2-red-r2.patch`): `tests/p15c2-campaign-legacy-integration.test.ts` has 37 leaves: 2 controls and 35 RED, of which C2, C3 and C4 are fixture-pending. `tests/p15c-wave-r-retention.test.ts` has 7 guards, all controls. 44 rows in `1359-p15c-wave2-red-r2-classification.json`, each with its PROVISIONAL budget name.
- **Today:** every RED leaf fails by name on a Wave 2 name, the root, or a pending capture. Once 1359-P mints the captures at base, C2-C4 fail with "the route L captures are Save43, the live version".
- **Expected at GREEN** (the reference, by reading, captures minted): all 37 leaves and 7 guards pass. No leaf stays red after GREEN.
- **Sibling patch:** five leaves. Each fails "SIBLING PENDING" until its sibling root is live.

## Reference run (in T, one heavy process at a time)

1. Mint the captures with 1359-P at a HEAD that carries the RED and not the Legacy production. In T, `tests/fixtures` is a link to the real repository, so mint in the real repo under the recorder, or give T a real `tests/fixtures/p15` first.
2. RED: `git checkout main && npx vitest run --project core tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts`. Record each leaf's elapsed time to set the PROVISIONAL budgets.
3. GREEN: `git checkout ref-1359-r2`, rerun step 2 plus `tests/p15c1-campaign-legacy.test.ts`, then `npx tsc --noEmit`.

## Files

| File | sha256 |
|---|---|
| `1359-p15c-wave2-red-r2.patch` | d5994844e1aa5e9e5ca5f47f7ae4d8c98072df5990efeaad0cd98a3b6b392f68 |
| `1359-p15c-wave2-sibling.patch` | 6014f0741b97490b7df3411037a8c323a89da749c1e0d946ee1562c25dc0ada3 |
| `reference/1359-reference-r2.patch` | 9d05d26a3261334081e56276d029d4c7f057752c278c5275469c407a43226289 |
| `1359-p15c-wave2-red-r2-classification.json` | a1012f7b5cd1926ebe9a6b6162590ff52dfdd58a9ffa2981b2c7fbd50547f1ad |
| `1359-P-p15c2-route-l-producer.ts` | c6b056dcd0924b5781309ec426733e7142bb73e3140ef5e5287cf58772e127ae |
| `1359-B7-note-for-p15b.md` | 85b15bfe29babb57d52afa9ff8c2fb87423c7a7e97a1b1d731cef997a21ab9ec |

The r1 files stay beside these, unchanged.

## Still open for the parent

- Mint the captures before the recorded RED (step 1 above).
- `P15_ROOTS`: whichever of 1356-C and 1359-C lands second merges the list.
- The landing order. If P15C lands first, A3, A5, A7, A8 and B4 move to each sibling's landing patch.
- The PROVISIONAL budgets, from the first single-file run.
- G-P, G-L and the week-8,791 timing.
