# 1355-C: P15A.1 Wave 2 RED handback (market root, step 2.5 batch, chronology controls)

**Status: DONE, unexecuted.** I authored by reading; no vitest, tsc, node or tsx ran. Scratch tree `tree/` (base `4d09e80` = 1063ab4f; `main` e514505 holds tests only; branch `ref` 680fb9a holds the reference). Real HEAD is now cd25076b with no `src` or `tests` drift; both patches pass `git apply --check` there. Authority: 1355-A §3, §4, §7; 1355-F Amendments 1-4; 1355-F2; 1355-B2 and 1355-F3; 1356-F2 R3 (sibling roots).

## Files and leaves (58: 50 RED, 8 control; 6 fixture-pending)
| File | Leaves |
|---|---|
| `tests/p15a1-market-integration.test.ts` | 54 (46 RED, 8 control) |
| `tests/p15a1-market-integration-atomicity.test.ts` | 4 RED (`vi.mock` wraps the real `assessBatch`; own file) |
| `tests/helpers/p15a1-market-route.ts` | routes and fixtures shared with the producer; no leaves |

Today: 4 controls pass (seam bit-equal, both forecast controls, era guard); 54 fail, 6 of them as FIXTURE PENDING.

## §7 coverage
| Item | Leaves | Item | Leaves |
|---|---|---|---|
| 1 | seam-default-exact x2 (both control) | 10, 11 | K1, K2: premise leaf + pinned control each |
| 2 | scales-opening-only x2; atomicity seam-both-call-sites | 12 | root-append-canonical x2 (F2 allocation, v1 triple) |
| 3 | forecast-paths-unchanged x2 (control) | 13 | inflight-save-replay |
| 4 | due-set-equals-releases | 14 | validator premise + 22 refusals (15 from §7, 7 from F3) |
| 5 | mismatch x2 direct; atomicity tick-level | 15 | era guard (control) |
| 6, 7, 8 | one leaf each | 16 | old-save x4 (2 fixture-pending) |
| 9 | no-player-flag x2 (exact keys, mirror swap) | 17, 18 | disengaged x2; persisted-linear x2 |
| F3 B1 | second-subject x2 (player, rival) | F3 B2 | phase-version-immutable |

## Save-version approach
`MARKET_STEP = saveModule.LIVE_SAVE_VERSION`. Leaves resolve `validateSaveV${N}`, `convertV${N-1}ToV${N}`, `convertV${N}ToV${N-1}`, `migrateToV${N-1}` and every older `migrateToVxx` by name. No future version literal appears. The reference uses 44 in scratch only.

## Fixture-pending leaves and the captures they need (producer `1355-P-p15a1-market-producer.ts`)
- RED 1 pin, K1, K2, RED 17 pin: `tests/fixtures/p15/p15a1-market-pins/MANIFEST.json` (3 reception digests; K2 week, keys, digest; M0A 40-week digest) plus `k1-post-tick-week-<W>.json.gz`, the old code's canonical post-tick state at the first pressured week of seed `p15a1-w2-market-01`. Minted on unchanged production.
- RED 16 x2: `tests/fixtures/p15/genuine-below-p15-save-step/`, one genuine Save(N-1) from `initializeHollywood(generateWorld('p15a1-w2-market-02'), 'fresh')`, natural ticks to the first week M >= 30 with a rival release in [M-25, M-1] and an in-flight rival picture of that genre releasing inside that release's 26 weeks. 1356-C's capture leaf reads the same directory (1355-F Amendment 3).
- Run once in E at the last writer below the step, RED patch landed: `P15A1_PRODUCER_HEAD=$(git rev-parse HEAD) P15A1_CAPTURE_MODE=mint npx tsx $E/1355-P-p15a1-market-producer.ts` (`skip` verifies a capture another record minted).

## Reference run (parent)
```
T=/Users/zacheryspector/studio-scratch/1355-red/tree; cd $T && git checkout -q main
npx vitest run --project core tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-atomicity.test.ts   # 4 pass, 54 fail
git apply /Users/zacheryspector/studio-scratch/1355-red/reference/1355-reference.patch
npx vitest run --project core tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-atomicity.test.ts   # expect 52 pass, 6 FIXTURE PENDING
git checkout -- src && git clean -fdq src
```

## Names shared with 1356-C
`p15Sequence {version: 1, next}`, `P15_PHASE_TABLES`, `P15_PHASE_ORDER_VERSION` as given; the reference copies 1356-C's `p15Phases.ts` byte for byte. New here: the shared capture directory and its producer mode; `sharedMarket` joins `P15_ROOTS` (1356-F2 R3) at landing, since the helper is absent at base. Both references define `stripV44Roots` and `convertV44ToV43` in `save.ts`; the merge strips every P15 root and runs every root's downgrade refusal. 1356-C checks `next` against the archive only; 1355-F2 item 4 needs every P15 root, as this reference does. The phase leaf installs a v2 table at runtime, so `P15_PHASE_TABLES` must stay unfrozen.

## Not decided
1. Reference names (`marketIntegration.ts`, `runMarketBatch`, `validateSharedMarketRoot`); no leaf imports them.
2. `advanceHollywoodWeek(state, factorById?)` with a rival-only `ReadonlyMap`; RED 5's direct leaves cast to that shape.
3. Refusal wording: each regex needs the root or allocator name plus the field; the downgrade needs "cannot downgrade or discard" and "shared-market" or "market assessment".
4. F3's RED 16 allocator-creation clause stays with 1356-C, per the brief.
5. RED 18 reads "equal per-assessment bytes" as one ceiling plus means within 1.5x: dense batches add a STUDIO_CLAMPED reason.
6. K3-K5 are measurements, not RED. Route premises on the three seeds are unmeasured and throw by name if they fail.
7. Fixtures that build a GameState literal lack the new roots; the writer's sweep owns them. I wrote one temp copy of the reference `save.ts` to `/tmp/claude-501/` and deleted it at once.
