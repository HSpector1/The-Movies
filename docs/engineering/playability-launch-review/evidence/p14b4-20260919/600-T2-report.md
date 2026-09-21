# 600-T2 report — 29→30 live-version sweep, meaning pins, G9 class (test-author)

Status: DONE (2026-09-21). Worktree /Users/zacheryspector/The-Movies-headless-program, branch wip/headless-program-20260916-ts, HEAD 45d62b30 (read-only Git; no commit/stash/checkout/add).
Evidence start point: 608-candidate-full-core.txt (96 failing files / 312 failed / 3482 passed / 7 todo).

## 0. Inherited / designated / natural (NOT mine; listed for the parent)
- tests/bridge-p12-campaign-library.test.ts — 11 timeouts (inherited since p13b-s2; 609 confirms alone). Its migrateToV29 sites are swept (class A3) but the timeouts remain.
- tests/bridge-p13-campaign-isolation.test.ts — 1 (inherited; migrateToV29 site swept, the inherited failure may remain).
- tests/p13a-scientist-foundation.test.ts — 3 digest pins (inherited).
- tests/r3n1-stale-schedule-take-02*.test.ts ×3 — ENOENT fixtures (inherited).
- tests/world-first-scenery-load-in-provenance.test.ts — python tool (inherited).
- tests/p14b4-ready-replay-stale-target.test.ts:234 — 515 §6 (c) designated.
- tests/p14b4-cast-class-capacity-evaluator5.test.ts — by law (evaluator 5).
- tests/p14b4-cast-class-outcomes.test.ts rivalWorlds ×9 + :438; tests/p14b4-cast-class-policy.test.ts:529 — natural premises (task D, investigation only).
- tests/bridge-runtime-checkpoint-prepared-reuse.test.ts — load-only timeout (passes alone in 609).

## A. Sweep table (values only; precedent 6948e31; C9)

Method: worked from the 608 failing-file list, then confirmed by `git grep` over tests/ (excluding tests/fixtures/** and the excluded live-P2/replay files) that no live pin remains. Every hit below is a VALUE move; no expectation, cap, timeout or fixture changed. Titles/comments that spell the function name moved with it exactly as 6948e31 did (file-wide token replace in files whose every site means "live").

Classification rules applied (each hit):
- LIVE (moved): `validateSaveV29(makeSave(...))`, `validateSaveV29(<clone of makeSave>)`, `validateSaveV29(JSON.parse(exportSave(makeSave(...))))`, `validateSaveV29(JSON.parse(session.save().saveJson))`, `migrateToV29(...)` meaning "load to the live version" (helpers `_historicalCurrent.ts`, `p14b2-fixtures.ts`; older-fixture loads for live play; round-trips of `makeSave` output), `saveVersion).toBe(29)` / `!== 29` on `makeSave`/bridge-save/migrated-to-live output, `LIVE_SAVE_VERSION).toBe(29)`, `SaveFileV29`-typed helpers returning `makeSave`, the `cannot downgrade SaveFileV29` and `canonical V29 save bytes` refusal texts on live saves, `PROJECTION_VERSION`/`snapshotVersion`/`$id`/`x-project-studio.projectionVersion`/generated `ProjectionVersion` = 46, the prior-registry count pin (34 → 35 by appending the outgoing projection-46 identity), one-past sentinels at 30 → 31.
- HISTORICAL (stays, listed): `tests/bridge-p14b2-checkpoint.test.ts:18-19` (genuine45 slots ARE V29 bytes); `tests/p14b1-first-take.test.ts:104-105,:285-286` (hand-built V29 envelope validated AS V29 — the V29 first-take boundary test); `tests/p14b1-save-v29.test.ts` all sites except :109 (V28→V29 boundary reads; `:124 migrated.saveVersion 29` is the V29 lift's own version); `tests/p14b3-rule-revision.test.ts:61` (provenance authority of the frozen corpus), `:74-75` (`validateSaveV29(JSON.parse(raw))`, the V29 fixture read AS V29), `:107` (`migrateToV29(importSave(raw))` — the V29 half of the byte pin, see §B); `tests/p14bf2-acting-discipline.test.ts:271` (provenance), `:281` (V29 read), `:302` (V29 half of the byte pin); `tests/p14a1-save-v28.test.ts:123,:280` (V28 boundary file; its T2c shadow copy is lifted to V29 for the live action whose named message is about the V29 roots — 6948e31 left this boundary file's reads alone, mirrored); `tests/p14b4-material-evidence-core.test.ts:55` (provenance); comments `bridge-p13b-s3-plans:520`, `bridge-p13b-s8-rivals:52` (prose about the historical validator, not assertions); `tests/p14b4-d3-matching.test.ts:43` (`age === 29`, not a version).
- Class (6) hand-built GameState literals rejected by a V30 type: NONE found (V30 changes only the promise-predicate union); root and bridge typecheck exit 0 confirm.
- Class A6 (not in the brief's list; same nature as 6948e31's "hand-built literals gain the new roots"): projection-47 history rows carry the nullable `seatClass`; hand-built EXPECTED rows in `tests/bridge-p14b1-promises.test.ts` group 3 (:301,:319 + the two row types) gain `seatClass: null` (a count-only P1 reads null), and `tests/bridge-p14b2-trust.test.ts` `expectedHistory` (:50-56 + `PromiseRow`) derives `seatClass` from the stored predicate shape (`'kind' in p.predicate ? p.predicate.seatClass : null`), the same law `bridge/promises.ts:108` applies. No value invented.

Per-line table (generated from `git diff HEAD -U0 -- tests/`; class per line; rows tagged "B/comment" are the §B re-expressions and their comments):

| file:line | class | action (new line) |
|---|---|---|
| tests/_historicalCurrent.ts:1 | A3 migrateToV29→V30 (load to live) | `import {migrateToV18,migrateToV30,type SaveFile,type SaveFileV30,type GameStateV18,type GameState} from '../sr` |
| tests/_historicalCurrent.ts:8 | A4 SaveFileV29→V30 typed helper | `export function migrateToCurrentControl(save:SaveFile):SaveFileV30 {` |
| tests/_historicalCurrent.ts:9 | A3 migrateToV29→V30 (load to live) | `if(save.saveVersion>=19)return migrateToV30(save)` |
| tests/_historicalCurrent.ts:11 | A2 live pin 29→30 | `return {...old,saveVersion:30,state:liftHistoricalState(old.state)}` |
| tests/bridge-contract-generator.test.ts:554 | B/comment (see §B) | `// P14B.4 (record 600, projection 47): the family-discriminated P2 draft` |
| tests/bridge-contract-generator.test.ts:555 | A6 wire row gains nullable seatClass | `// (required seatClass), nullable seatClass on own snapshot/history rows and` |
| tests/bridge-contract-generator.test.ts:556 | B/comment (see §B) | `// preferredOpportunity on preferences moved the whole-schema identity. The` |
| tests/bridge-contract-generator.test.ts:557 | B/comment (see §B) | `// literal below is the schemaId of the checked-in` |
| tests/bridge-contract-generator.test.ts:558 | B/comment (see §B) | `// generated/unity/project-studio-bridge.contract-manifest.json at 027155e7,` |
| tests/bridge-contract-generator.test.ts:559 | B/comment (see §B) | `// read independently of this test (never schemaIdentity(schema) itself).` |
| tests/bridge-contract-generator.test.ts:560 | A2 projection pin 46→47 | `const generated = generateCsharpContract({ schema, protocolVersion: 4, projectionVersion: 47 })` |
| tests/bridge-contract-generator.test.ts:562 | B/comment (see §B) | `'// Schema identity: sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538',` |
| tests/bridge-contract-generator.test.ts:565 | B/comment (see §B) | `'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538',` |
| tests/bridge-contract-generator.test.ts:662 | B/comment (see §B) | `// P14B.4 (projection 47, record 600): StudioMarketProposalPromiseDraftPayload` |
| tests/bridge-contract-generator.test.ts:663 | B/comment (see §B) | `// becomes a family-discriminated union (APPEARANCE_COUNT count-only /` |
| tests/bridge-contract-generator.test.ts:664 | A6 wire row gains nullable seatClass | `// LEAD_OR_SIGNIFICANT_ROLE_COUNT with required seatClass), `seatClass`` |
| tests/bridge-contract-generator.test.ts:665 | B/comment (see §B) | `// (nullable) joins the own promise snapshot and history rows and` |
| tests/bridge-contract-generator.test.ts:666 | B/comment (see §B) | `// `preferredOpportunity` joins the preferences block. Both fixtures render` |
| tests/bridge-contract-generator.test.ts:667 | B/comment (see §B) | `// the WHOLE schema, so both declaration-body identities move together.` |
| tests/bridge-contract-generator.test.ts:668 | B/comment (see §B) | `// Value computed once by the generator on 027155e7 (600-T2 record), not by` |
| tests/bridge-contract-generator.test.ts:669 | B/comment (see §B) | `// this test against itself.` |
| tests/bridge-contract-generator.test.ts:670 | B/comment (see §B) | `F10_CURRENT_QUOTE_UNIONS: '53058c23075427647bf9e24052128cd4f7ad0340fa54763e3e75df25aeea482e',` |
| tests/bridge-contract-generator.test.ts:671 | B/comment (see §B) | `F11_CURRENT_COMMAND_UNION: '53058c23075427647bf9e24052128cd4f7ad0340fa54763e3e75df25aeea482e',` |
| tests/bridge-operations-events.test.ts:333 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-owner-ux-projection20-migration.test.ts:65 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-owner-ux-projection20-migration.test.ts:119 | A2 live pin 29→30 | `expect(after.saveVersion).toBe(30)` |
| tests/bridge-owner-ux-projection21-schema.test.ts:18 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-owner-ux-projection21-schema.test.ts:19 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-47')` |
| tests/bridge-p06-checkpoint-recovery.test.ts:17 | A4 SaveFileV29→V30 typed helper | `import { importSave, type SaveFileV30 } from '../src/core/save.js'` |
| tests/bridge-p06-checkpoint-recovery.test.ts:54 | A4 SaveFileV29→V30 typed helper | `function expectPreservedGameplay(beforeJson: string, after: SaveFileV30): void {` |
| tests/bridge-p06-checkpoint-recovery.test.ts:70 | A3 migrateToV29→V30 (load to live) | `// Comparing with migrateToV30's own output would not prove preservation.` |
| tests/bridge-p06-checkpoint-recovery.test.ts:90 | A2 live pin 29→30 | `saveVersion: 30,` |
| tests/bridge-p07a-w6-result-continuity.test.ts:33 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/bridge-p07a-w6-result-continuity.test.ts:219 | A3 migrateToV29→V30 (load to live) | `const reloaded = migrateToV30(importSave(exportSave(makeSave(midRun)))).state` |
| tests/bridge-p07a-w6-result-continuity.test.ts:276 | A3 migrateToV29→V30 (load to live) | `const reloaded = migrateToV30(importSave(exportSave(makeSave(state)))).state` |
| tests/bridge-p08a-w2-history-projection.test.ts:28 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/bridge-p08a-w2-history-projection.test.ts:177 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(makeSaveV16(played)).state` |
| tests/bridge-p09a-w5-bare-lot-first-film.test.ts:24 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/bridge-p09a-w5-bare-lot-first-film.test.ts:97 | A3 migrateToV29→V30 (load to live) | `get gameState(): GameState { return migrateToV30(importSave(this.store.checkpoint.currentSaveJson)).state }` |
| tests/bridge-p10a-w0-people-projection.test.ts:27 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/bridge-p10a-w0-people-projection.test.ts:321 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p10a-w0-people-projection.test.ts:322 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-47')` |
| tests/bridge-p10a-w0-people-projection.test.ts:340 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(makeSaveV16(state)).state` |
| tests/bridge-p11-capital-contributors.test.ts:24 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p11-finance.test.ts:13 | A3 migrateToV29→V30 (load to live) | `migrateToV30, queryPlacement, stableStringify, tick, weeklyBurn, weeklySalary,` |
| tests/bridge-p11-finance.test.ts:272 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(legacy).state` |
| tests/bridge-p11-finance.test.ts:290 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(legacy).state` |
| tests/bridge-p11-finance.test.ts:305 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(makeSaveV10(state)).state` |
| tests/bridge-p11-ready.test.ts:52 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p12-campaign-library.test.ts:14 | A3 migrateToV29→V30 (load to live) | `import {importSave,migrateToV30,exportSave,makeSaveV18,generateWorld} from '../src/core/index.js'` |
| tests/bridge-p12-campaign-library.test.ts:32 | A3 migrateToV29→V30 (load to live) | `function state(store:Store){return migrateToV30(importSave(working(store).currentSaveJson)).state}` |
| tests/bridge-p12-campaign-library.test.ts:204 | A3 migrateToV29→V30 (load to live) | `const cp=JSON.parse(record.checkpointJson),s=migrateToV30(importSave(cp.currentSaveJson)).state` |
| tests/bridge-p13-campaign-isolation.test.ts:12 | A3 migrateToV29→V30 (load to live) | `import { importSave, migrateToV30 } from '../src/core/save.js'` |
| tests/bridge-p13-campaign-isolation.test.ts:26 | A3 migrateToV29→V30 (load to live) | `return migrateToV30(importSave(JSON.parse(library(store).workingCheckpointJson).currentSaveJson)).state` |
| tests/bridge-p13b-r07-setup.test.ts:320 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-r07-setup.test.ts:321 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toContain('projection-47')` |
| tests/bridge-p13b-r07-setup.test.ts:322 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p13b-r07-setup.test.ts:587 | A2 live pin 29→30 | `expect(parsedSaveVersion).toBe(30) // the CURRENT live version — confirms this is not genuinely a migration` |
| tests/bridge-p13b-s1b-seats.test.ts:76 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s1b-seats.test.ts:102 | A2 projection pin 46→47 | `expect(page.snapshotVersion).toBe(47)` |
| tests/bridge-p13b-s2-labs.test.ts:115 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s2-labs.test.ts:126 | A2 projection pin 46→47 | `expect(response.snapshotVersion).toBe(47)` |
| tests/bridge-p13b-s3-plans.test.ts:202 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s3-plans.test.ts:214 | A2 projection pin 46→47 | `expect(plans.snapshotVersion).toBe(47)` |
| tests/bridge-p13b-s3-save-as.test.ts:11 | A3 migrateToV29→V30 (load to live) | `import { applyActions, importSave, migrateToV30 } from '../src/core/index.js'` |
| tests/bridge-p13b-s3-save-as.test.ts:62 | A3 migrateToV29→V30 (load to live) | `function state(store: Store): GameState { return migrateToV30(importSave(working(store).currentSaveJson)).stat` |
| tests/bridge-p13b-s4-office.test.ts:224 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s4-office.test.ts:235 | A2 projection pin 46→47 | `expect(response.snapshotVersion).toBe(47)` |
| tests/bridge-p13b-s5-adoption.test.ts:250 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s5-adoption.test.ts:251 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toContain('projection-47')` |
| tests/bridge-p13b-s5-adoption.test.ts:252 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p13b-s6-cancellation.test.ts:270 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s6-cancellation.test.ts:271 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toContain('projection-47')` |
| tests/bridge-p13b-s6-cancellation.test.ts:272 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p13b-s7-disclosure.test.ts:270 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p13b-s7-disclosure.test.ts:271 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toContain('projection-47')` |
| tests/bridge-p13b-s7-disclosure.test.ts:272 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p13b-s8-rivals.test.ts:223 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47) // RED: today PROJECTION_VERSION is 40` |
| tests/bridge-p13b-s8-rivals.test.ts:224 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toContain('projection-47')` |
| tests/bridge-p13b-s8-rivals.test.ts:225 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p13b-s8-rivals.test.ts:233 | A2 live pin 29→30 | `expect((JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion).toBe(30)` |
| tests/bridge-p13b-s8-rivals.test.ts:404 | A2 live pin 29→30 | `expect((JSON.parse(savedBefore.saveJson) as { saveVersion: number }).saveVersion).toBe(30)` |
| tests/bridge-p14a1-market.test.ts:152 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p14a1-market.test.ts:153 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-47`)` |
| tests/bridge-p14a1-market.test.ts:154 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p14a1-market.test.ts:408 | A2 live pin 29→30 | `expect(parsed.saveVersion).toBe(30)` |
| tests/bridge-p14a2-market.test.ts:217 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p14a2-market.test.ts:218 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-47`)` |
| tests/bridge-p14a2-market.test.ts:219 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p14a2-market.test.ts:232 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14a2-market.test.ts:739 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14a2-market.test.ts:772 | A2 live pin 29→30 | `if (reSavedOpen.accepted) expect((JSON.parse(reSavedOpen.saveJson) as { saveVersion: number }).saveVersion).to` |
| tests/bridge-p14a2-market.test.ts:784 | A2 live pin 29→30 | `if (reSavedSettled.accepted) expect((JSON.parse(reSavedSettled.saveJson) as { saveVersion: number }).saveVersi` |
| tests/bridge-p14a2-market.test.ts:794 | A2 live pin 29→30 | `if (reSavedLegacy.accepted) expect((JSON.parse(reSavedLegacy.saveJson) as { saveVersion: number }).saveVersion` |
| tests/bridge-p14a2-market.test.ts:809 | A2 live pin 29→30 | `expect(parsed.saveVersion).toBe(30)` |
| tests/bridge-p14a3-world.test.ts:229 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p14a3-world.test.ts:230 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-47`)` |
| tests/bridge-p14a3-world.test.ts:231 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p14a3-world.test.ts:245 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14a3-world.test.ts:575 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14a3-world.test.ts:600 | A2 live pin 29→30 | `expect((JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion).toBe(30)` |
| tests/bridge-p14a3-world.test.ts:622 | A2 live pin 29→30 | `expect(parsed.saveVersion).toBe(30)` |
| tests/bridge-p14b1-promises.test.ts:207 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14b1-promises.test.ts:208 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p14b1-promises.test.ts:209 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-47`)` |
| tests/bridge-p14b1-promises.test.ts:210 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p14b1-promises.test.ts:295 | A6 wire row gains nullable seatClass | `promiseHistory: Array<{ promiseId: string; family: string; count: number; seatClass: string \| null; windowStar` |
| tests/bridge-p14b1-promises.test.ts:299 | A6 wire row gains nullable seatClass | `// P14B.4 (projection 47): history rows carry the nullable `seatClass`; a` |
| tests/bridge-p14b1-promises.test.ts:300 | B/comment (see §B) | `// count-only P1 reads null (shape-derived, never an invented class).` |
| tests/bridge-p14b1-promises.test.ts:302 | A6 wire row gains nullable seatClass | `promiseId: openPromise.promiseId, family: openPromise.family, count: openPromise.predicate.count, seatClass: n` |
| tests/bridge-p14b1-promises.test.ts:316 | A6 wire row gains nullable seatClass | `promiseHistory: Array<{ promiseId: string; family: string; count: number; seatClass: string \| null; windowStar` |
| tests/bridge-p14b1-promises.test.ts:320 | A6 wire row gains nullable seatClass | `promiseId: brokenPromise.promiseId, family: brokenPromise.family, count: brokenPromise.predicate.count, seatCl` |
| tests/bridge-p14b1-promises.test.ts:495 | A2 live pin 29→30 | `if (reSaved.accepted) expect((JSON.parse(reSaved.saveJson) as { saveVersion: number }).saveVersion).toBe(30)` |
| tests/bridge-p14b1-promises.test.ts:511 | A2 live pin 29→30 | `expect(parsed.saveVersion).toBe(30)` |
| tests/bridge-p14b2-checkpoint.test.ts:8 | A3 migrateToV29→V30 (load to live) | `import { exportSave, importSave, migrateToV30 } from '../src/core/save.js'` |
| tests/bridge-p14b2-checkpoint.test.ts:35 | B/comment (see §B) | `// 600-T2 (record 600, C9/C10): the live writer stamps Save30, so "slot bytes` |
| tests/bridge-p14b2-checkpoint.test.ts:36 | B/comment (see §B) | `// unchanged" held only while live = 29 and is a moved premise. The invariant` |
| tests/bridge-p14b2-checkpoint.test.ts:37 | B/comment (see §B) | `// kept, per slot: the hydrated bytes ARE the governed V29->V30 migration of` |
| tests/bridge-p14b2-checkpoint.test.ts:38 | B/comment (see §B) | `// that slot's OWN genuine V29 bytes, which differ from the source by the` |
| tests/bridge-p14b2-checkpoint.test.ts:39 | B/comment (see §B) | `// version tag alone (no restamped root, receipt, digest or week), and each` |
| tests/bridge-p14b2-checkpoint.test.ts:40 | B/comment (see §B) | `// digest is the digest of exactly those bytes. Pattern: runtime47 :191-205.` |
| tests/bridge-p14b2-checkpoint.test.ts:41 | B/comment (see §B) | `const sha = (v: string) => createHash('sha256').update(v).digest('hex')` |
| tests/bridge-p14b2-checkpoint.test.ts:42 | B/comment (see §B) | `for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {` |
| tests/bridge-p14b2-checkpoint.test.ts:43 | B/comment (see §B) | `const governed = migrateToV30(importSave(before[slot]))` |
| tests/bridge-p14b2-checkpoint.test.ts:44 | A2 live pin 29→30 | `expect(governed.saveVersion).toBe(30)` |
| tests/bridge-p14b2-checkpoint.test.ts:45 | B/comment (see §B) | `expect(JSON.parse(exportSave(governed))).toEqual({ ...JSON.parse(before[slot]), saveVersion: 30 })` |
| tests/bridge-p14b2-checkpoint.test.ts:46 | B/comment (see §B) | `expect(after[slot]).toBe(exportSave(governed))` |
| tests/bridge-p14b2-checkpoint.test.ts:47 | B/comment (see §B) | `}` |
| tests/bridge-p14b2-checkpoint.test.ts:48 | B/comment (see §B) | `expect(after.currentStateDigest).toBe(sha(after.currentSaveJson))` |
| tests/bridge-p14b2-checkpoint.test.ts:49 | B/comment (see §B) | `expect(after.savedStateDigest).toBe(sha(after.savedSaveJson!))` |
| tests/bridge-p14b2-trust.test.ts:24 | A1 validateSaveV29→V30 (live envelope) | `import { LIVE_SAVE_VERSION, makeSave, validateSaveV30 } from '../src/core/save.js'` |
| tests/bridge-p14b2-trust.test.ts:32 | A6 wire row gains nullable seatClass | `type PromiseRow = { promiseId: string; family: PromiseFamily; count: number; seatClass: string \| null; windowS` |
| tests/bridge-p14b2-trust.test.ts:53 | B/comment (see §B) | `// P14B.4 (projection 47): the nullable class rides every history row; the` |
| tests/bridge-p14b2-trust.test.ts:54 | B/comment (see §B) | `// stored predicate shape alone selects it (a count-only root reads null).` |
| tests/bridge-p14b2-trust.test.ts:55 | A6 wire row gains nullable seatClass | `seatClass: 'kind' in p.predicate ? p.predicate.seatClass : null,` |
| tests/bridge-p14b2-trust.test.ts:134 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p14b2-trust.test.ts:135 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14b2-trust.test.ts:136 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${PROTOCOL_VERSION}:projection-47`)` |
| tests/bridge-p14b2-trust.test.ts:137 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(47)` |
| tests/bridge-p14b2-trust.test.ts:278 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(JSON.parse(JSON.stringify(makeSave(next))))).not.toThrow()` |
| tests/bridge-p14b2-trust.test.ts:415 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(JSON.parse(JSON.stringify(makeSave(variant))))).not.toThrow()` |
| tests/bridge-p14b2-trust.test.ts:459 | A1 validateSaveV29→V30 (live envelope) | `const validated = validateSaveV30(JSON.parse(saved.saveJson))` |
| tests/bridge-p14b2-trust.test.ts:460 | A2 live pin 29→30 | `expect(validated.saveVersion).toBe(30)` |
| tests/bridge-p14b3-promise-command.test.ts:19 | A1 validateSaveV29→V30 (live envelope) | `import { LIVE_SAVE_VERSION, makeSave, validateSaveV30 } from '../src/core/save.js'` |
| tests/bridge-p14b3-promise-command.test.ts:35 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(state))))` |
| tests/bridge-p14b3-promise-command.test.ts:83 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(result.saveJson))` |
| tests/bridge-p14b3-promise-command.test.ts:133 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(session.gameState))))` |
| tests/bridge-p14b3-promise-command.test.ts:154 | B/comment (see §B) | `// 600-T2 (record 600, projection 47): B3's refused variant was a CLASSLESS` |
| tests/bridge-p14b3-promise-command.test.ts:155 | B/comment (see §B) | `// LEAD_OR_SIGNIFICANT_ROLE_COUNT, engine-refused as "not offered in this slice".` |
| tests/bridge-p14b3-promise-command.test.ts:156 | B/comment (see §B) | `// Under the closed family-discriminated wire union a classless P2 is not a` |
| tests/bridge-p14b3-promise-command.test.ts:157 | B/comment (see §B) | `// wire shape at all — the grammar refuses it with INVALID_COMMAND before any` |
| tests/bridge-p14b3-promise-command.test.ts:158 | B/comment (see §B) | `// quote exists (bridge-p14b4-cast-class G2), so it can no longer be the` |
| tests/bridge-p14b3-promise-command.test.ts:159 | B/comment (see §B) | `// ENGINE-refused, quoted-yet-noncommittable variant this case needs. That` |
| tests/bridge-p14b3-promise-command.test.ts:160 | B/comment (see §B) | `// purpose is kept with the count-only P3 family, which the wire still` |
| tests/bridge-p14b3-promise-command.test.ts:161 | B/comment (see §B) | `// enumerates and promiseFeasibility still refuses ("not offered in this` |
| tests/bridge-p14b3-promise-command.test.ts:162 | B/comment (see §B) | `// slice"); the two lawful seat classes join as projection 47's new material` |
| tests/bridge-p14b3-promise-command.test.ts:163 | B/comment (see §B) | `// field. Every variant must still mint its own opaque identity and leave the` |
| tests/bridge-p14b3-promise-command.test.ts:164 | B/comment (see §B) | `// session truth untouched.` |
| tests/bridge-p14b3-promise-command.test.ts:165 | B/comment (see §B) | `const engineRefused: Payload = { ...base, promise: { ...base.promise!, family: 'DIRECTING_COUNT' } }` |
| tests/bridge-p14b3-promise-command.test.ts:167 | B/comment (see §B) | `engineRefused,` |
| tests/bridge-p14b3-promise-command.test.ts:168 | A6 wire row gains nullable seatClass | `{ ...base, promise: { ...base.promise!, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', seatClass: 'lead' } },` |
| tests/bridge-p14b3-promise-command.test.ts:169 | A6 wire row gains nullable seatClass | `{ ...base, promise: { ...base.promise!, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', seatClass: 'leadOrAntagonist` |
| tests/bridge-p14b3-promise-command.test.ts:174 | B/comment (see §B) | `const responses = variants.map((draft, index) => quote(session, draft, `quote-material-${index}`))` |
| tests/bridge-p14b3-promise-command.test.ts:175 | B/comment (see §B) | `const ids = responses.map((response) => response.quote.intentId)` |
| tests/bridge-p14b3-promise-command.test.ts:177 | B/comment (see §B) | `expect(responses[1]!.quote.ok).toBe(false)` |
| tests/bridge-p14b3-promise-command.test.ts:178 | B/comment (see §B) | `expect(responses[1]!.quote.promise).toMatchObject({ ok: false, classification: 'IMPOSSIBLE',` |
| tests/bridge-p14b3-promise-command.test.ts:179 | B/comment (see §B) | `message: 'not offerable: a directing promise is not offered in this slice' })` |
| tests/bridge-p14b3-promise-command.test.ts:355 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(JSON.parse(saved)).state.promises).toEqual(session.gameState.promises)` |
| tests/bridge-p14b3-promise-command.test.ts:500 | A1 validateSaveV29→V30 (live envelope) | `const validated = validateSaveV30(JSON.parse(saved))` |
| tests/bridge-p14b3-promise-command.test.ts:501 | A2 live pin 29→30 | `expect(LIVE_SAVE_VERSION).toBe(30)` |
| tests/bridge-p14b3-promise-command.test.ts:502 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-p14b3-promise-command.test.ts:503 | A2 live pin 29→30 | `expect(validated.saveVersion).toBe(30)` |
| tests/bridge-process-restart.test.ts:797 | A2 live pin 29→30 | `expect(hydrated.currentSave.saveVersion).toBe(30)` |
| tests/bridge-process-restart.test.ts:799 | A2 live pin 29→30 | `expect(hydrated.savedSave?.saveVersion).toBe(30)` |
| tests/bridge-r3n4-read-model-deltas.test.ts:144 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-r3n4-read-model-deltas.test.ts:145 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-47')` |
| tests/bridge-r3n4-read-model-deltas.test.ts:351 | A2 projection pin 46→47 | `expect(response.snapshotVersion).toBe(47)` |
| tests/bridge-runtime-checkpoint.test.ts:232 | A2 live pin 29→30 | `expect(loaded.hydrated.currentSave.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:233 | A2 live pin 29→30 | `expect(loaded.hydrated.savedSave?.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:269 | A2 live pin 29→30 | `expect(loaded.hydrated.currentSave.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:270 | A2 live pin 29→30 | `expect(loaded.hydrated.savedSave?.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:331 | A2 live pin 29→30 | `expect(hydrated.currentSave.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:332 | A2 live pin 29→30 | `expect(hydrated.savedSave?.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:431 | A2 live refusal text 29→30 | `})).toThrow(/canonical V30 save bytes exactly/)` |
| tests/bridge-runtime-checkpoint.test.ts:721 | A2 live pin 29→30 | `expect(loaded.hydrated.currentSave.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:749 | A2 live pin 29→30 | `expect(loaded.hydrated.savedSave?.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:777 | A2 live pin 29→30 | `expect(loaded.hydrated.currentSave.saveVersion).toBe(30)` |
| tests/bridge-runtime-checkpoint.test.ts:984 | B/comment (see §B) | `// P14B.4 (record 600): the outgoing projection-46 identity — the checked-in` |
| tests/bridge-runtime-checkpoint.test.ts:985 | A2 projection pin 46→47 | `// contract-manifest schemaId before the projection-47 bump (47b2bbf4^), also` |
| tests/bridge-runtime-checkpoint.test.ts:986 | B/comment (see §B) | `// pinned independently by bridge-p14b4-runtime47-compatibility.test.ts.` |
| tests/bridge-runtime-checkpoint.test.ts:987 | A2 prior-registry pin +projection-v46 id | `'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',` |
| tests/bridge-schema.test.ts:81 | A2 projection pin 46→47 | `projectionVersion: 47,` |
| tests/bridge-schema.test.ts:84 | A2 projection pin 46→47 | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-47')` |
| tests/bridge-schema.test.ts:340 | A2 projection pin 46→47 | `expect(PROJECTION_VERSION).toBe(47)` |
| tests/bridge-schema.test.ts:576 | A2 projection pin 46→47 | `expect(generatedCsharp).toContain('public const int ProjectionVersion = 47;')` |
| tests/bridge.test.ts:167 | A2 projection pin 46→47 | `expect(SNAPSHOT_VERSION).toBe(47)` |
| tests/c2a-m2-sets-save.test.ts:37 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/c2a-m2-sets-save.test.ts:172 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(envelope)).not.toThrow()` |
| tests/c2a-m2-sets-save.test.ts:182 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(` |
| tests/c2a-m2-sets-save.test.ts:191 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(` |
| tests/c2a-m2-sets-save.test.ts:200 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(` |
| tests/c2a-m2-sets-save.test.ts:292 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(JSON.parse(exportSave(makeSave(played))))).not.toThrow()` |
| tests/c2a-m3-rename-and-pooling.test.ts:214 | A2 live pin 29→30 | `expect(makeSave(state).saveVersion).toBe(30)` |
| tests/c2a-m3-rename-and-pooling.test.ts:363 | A2 live pin 29→30 | `expect(makeSave(state).saveVersion).toBe(30)` |
| tests/c2a-m3-screenplay-mint.test.ts:356 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/cash-ledger-checkpoint-v11.test.ts:52 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/cash-ledger-checkpoint-v11.test.ts:231 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(native)).toBe(native);` |
| tests/cash-ledger-checkpoint-v11.test.ts:241 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(reconciled)).toBe(reconciled);` |
| tests/cash-ledger-checkpoint-v11.test.ts:293 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(redundant)).toThrow(` |
| tests/cash-ledger-checkpoint-v11.test.ts:483 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(changedAnchor)).toThrow(` |
| tests/cash-ledger-checkpoint-v11.test.ts:489 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(changedCash)).toThrow(` |
| tests/cash-ledger-checkpoint-v11.test.ts:495 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(movedBoundary)).toThrow(` |
| tests/cash-ledger-checkpoint-v11.test.ts:501 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(changedSuffix)).toThrow(` |
| tests/construction-core.test.ts:19 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/construction-core.test.ts:497 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forgedSave)).toThrow(` |
| tests/construction-core.test.ts:505 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(makeSave(laundered))).toThrow(` |
| tests/construction-core.test.ts:566 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forgedSave)).toThrow(` |
| tests/construction-core.test.ts:664 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(makeSave(state))).not.toThrow()` |
| tests/construction-save-v11.test.ts:49 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/construction-save-v11.test.ts:189 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30);` |
| tests/construction-save-v11.test.ts:191 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(save)).toBe(save);` |
| tests/construction-save-v11.test.ts:514 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forgedV13)).toThrow(` |
| tests/contracts/cross-owner-refusal.contract.test.ts:24 | A1 validateSaveV29→V30 (live envelope) | `import { applyActions, exportSave, importSave, makeSave, stableStringify, tick, validateSaveV30 } from '../../` |
| tests/contracts/cross-owner-refusal.contract.test.ts:25 | A4 SaveFileV29→V30 typed helper | `import type { GameState, SaveFileV30 } from '../../src/core/index.js'` |
| tests/contracts/cross-owner-refusal.contract.test.ts:70 | A4 SaveFileV29→V30 typed helper | `function legalSave(state: GameState): SaveFileV30 {` |
| tests/contracts/cross-owner-refusal.contract.test.ts:72 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(save)).toBe(save)` |
| tests/contracts/cross-owner-refusal.contract.test.ts:83 | A4 SaveFileV29→V30 typed helper | `legal: SaveFileV30,` |
| tests/contracts/cross-owner-refusal.contract.test.ts:84 | A4 SaveFileV29→V30 typed helper | `forge: (save: SaveFileV30) => { restore: (save: SaveFileV30) => void; slotKey: string },` |
| tests/contracts/cross-owner-refusal.contract.test.ts:88 | A4 SaveFileV29→V30 typed helper | `expect(exportSave(importSave(legalJson) as SaveFileV30), `${label}: legal twin round-trips`).toBe(` |
| tests/contracts/cross-owner-refusal.contract.test.ts:100 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(forged)` |
| tests/contracts/cross-owner-refusal.contract.test.ts:118 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(forged as SaveFileV30)).toBe(forged)` |
| tests/contracts/determinism-floor.contract.test.ts:32 | A4 SaveFileV29→V30 typed helper | `import type { GameState, SaveFileV30 } from '../../src/core/index.js'` |
| tests/contracts/determinism-floor.contract.test.ts:84 | A4 SaveFileV29→V30 typed helper | `function scriptedRun(seed: string): { save: SaveFileV30; trace: WeekTrace[] } {` |
| tests/contracts/determinism-floor.contract.test.ts:141 | A4 SaveFileV29→V30 typed helper | `expect(exportSave(importSave(json) as SaveFileV30)).toBe(json)` |
| tests/contracts/determinism-floor.contract.test.ts:142 | A4 SaveFileV29→V30 typed helper | `expect(save.state.rngState).toBe((importSave(json) as SaveFileV30).state.rngState)` |
| tests/contracts/phase-table-agreement.contract.test.ts:28 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/contracts/phase-table-agreement.contract.test.ts:34 | A4 SaveFileV29→V30 typed helper | `SaveFileV30,` |
| tests/contracts/phase-table-agreement.contract.test.ts:102 | A4 SaveFileV29→V30 typed helper | `function saveOf(state: GameState): SaveFileV30 {` |
| tests/contracts/phase-table-agreement.contract.test.ts:104 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(save)).toBe(save)` |
| tests/contracts/phase-table-agreement.contract.test.ts:224 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forged), `${snapshot.phase} forged`).toThrow(` |
| tests/contracts/phase-table-agreement.contract.test.ts:230 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(legal)).toBe(legal)` |
| tests/contracts/phase-table-agreement.contract.test.ts:246 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forged), `${snapshot.phase} → ${wrongTarget}`).toThrow(` |
| tests/contracts/phase-table-agreement.contract.test.ts:266 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forged)).toThrow(` |
| tests/contracts/studio-events.contract.test.ts:129 | A1 validateSaveV29→V30 (live envelope) | `const validateLive = requireFunction(requireCore(), 'validateSaveV30', 'P09 live boundary') as unknown as (` |
| tests/contracts/v14-boundary-guards.contract.test.ts:324 | A5 one-past sentinel 30→31 | `expect(() => validateSave({ ...save, saveVersion: 31 })).toThrow(/unknown saveVersion 31/)` |
| tests/contracts/v14-byte-parity.contract.test.ts:201 | A1 validateSaveV29→V30 (live envelope) | `'validateSaveV30',` |
| tests/contracts/v14-byte-parity.contract.test.ts:205 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/d11-cycle2.test.ts:227 | A2 live pin 29→30 | `if (reloaded.saveVersion !== 30) throw new Error('expected V28')` |
| tests/d11-employment.test.ts:34 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/d11-employment.test.ts:550 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30) // P13B-S8: new games save as V27.` |
| tests/d11-employment.test.ts:562 | A2 live pin 29→30 | `if (reloaded.saveVersion !== 30) throw new Error('expected V28')` |
| tests/d11-employment.test.ts:563 | A3 migrateToV29→V30 (load to live) | `const split = advanceWeeks(migrateToV30(reloaded).state, 3)` |
| tests/d12-economy.test.ts:281 | A2 live pin 29→30 | `if (reloaded.saveVersion !== 30) throw new Error('expected V28')` |
| tests/d14-star-power.test.ts:16 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/d14-star-power.test.ts:221 | A2 live pin 29→30 | `if (reloaded.saveVersion !== 30) throw new Error('expected V28')` |
| tests/d14-star-power.test.ts:225 | A3 migrateToV29→V30 (load to live) | `let s2 = migrateToV30(reloaded).state` |
| tests/d17-engagement-persistence.test.ts:462 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/d17a-adv-migration.test.ts:274 | A5 one-past sentinel 30→31 | `expect(() => validateSave({ ...v6, saveVersion: 31 })).toThrow(/unknown saveVersion 31/)` |
| tests/d17a-adv-reconciliation.test.ts:337 | A2 live pin 29→30 | `expect(reloaded.saveVersion).toBe(30)` |
| tests/d17b-publicity.test.ts:386 | A2 live pin 29→30 | `if (back.saveVersion !== 30) throw new Error('expected V29')` |
| tests/d17b-publicity.test.ts:414 | A2 live pin 29→30 | `if (reloaded.saveVersion !== 30) throw new Error('expected V29')` |
| tests/d17b-publicity.test.ts:427 | A2 live pin 29→30 | `if (back.saveVersion !== 30) throw new Error('expected V29')` |
| tests/d17b-save-v7.test.ts:147 | A5 one-past sentinel 30→31 | `expect(() => validateSave({ ...save, saveVersion: 31 })).toThrow(/unknown saveVersion 31/)` |
| tests/facility-move-demolish.test.ts:51 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/facility-move-demolish.test.ts:778 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/facility-move-demolish.test.ts:780 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(save)).toBe(save)` |
| tests/film-chronicle.test.ts:911 | A2 live pin 29→30 | `expect(envelope.saveVersion).toBe(30);` |
| tests/film-chronicle.test.ts:922 | A2 live pin 29→30 | `expect(restored.saveVersion).toBe(30);` |
| tests/film-chronicle.test.ts:923 | A2 live pin 29→30 | `if (restored.saveVersion !== 30) return;` |
| tests/helpers/p14b2-fixtures.ts:7 | A1 validateSaveV29→V30 (live envelope) | `import { makeSave, validateSaveV30 } from '../../src/core/save.js'` |
| tests/helpers/p14b2-fixtures.ts:122 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(state))))` |
| tests/helpers/p14b2-fixtures.ts:210 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(outcome))))` |
| tests/helpers/p14b2-fixtures.ts:225 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(state))))` |
| tests/legacy-parcel-ground.test.ts:49 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/legacy-parcel-ground.test.ts:58 | A4 SaveFileV29→V30 typed helper | `import type { GameState, LotCell, SaveFileV30 } from '../src/core/index.js'` |
| tests/legacy-parcel-ground.test.ts:343 | A4 SaveFileV29→V30 typed helper | `function forgedSave(seed: string): SaveFileV30 {` |
| tests/legacy-parcel-ground.test.ts:365 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(save)).toThrow(named)` |
| tests/legacy-parcel-ground.test.ts:376 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(save)).toBe(save)` |
| tests/legacy-parcel-ground.test.ts:378 | A4 SaveFileV29→V30 typed helper | `expect(exportSave(importSave(json) as SaveFileV30)).toBe(json)` |
| tests/legacy-parcel-ground.test.ts:404 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(save), blueprint.id).toThrow(/reserved for the studio's Annex/)` |
| tests/p04a2-writer-credit-law.test.ts:773 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/p06a-w1-release-authority.test.ts:31 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/p06a-w1-release-authority.test.ts:35 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/p06a-w1-release-authority.test.ts:416 | A3 migrateToV29→V30 (load to live) | `const live = migrateToV30(v15)` |
| tests/p06a-w1-release-authority.test.ts:417 | A2 live pin 29→30 | `expect(live.saveVersion).toBe(30)` |
| tests/p06a-w1-release-authority.test.ts:430 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/p06a-w1-release-authority.test.ts:432 | A3 migrateToV29→V30 (load to live) | `const reimported = migrateToV30(importSave(exportSave(save)))` |
| tests/p06a-w1-release-authority.test.ts:436 | A4 SaveFileV29→V30 typed helper | `expect(() => migrateToV15(save)).toThrow(/cannot downgrade SaveFileV30/)` |
| tests/p06a-w1-release-authority.test.ts:439 | A1 validateSaveV29→V30 (live envelope) | `it('validateSaveV30 rejects forged authority at the save boundary', () => {` |
| tests/p06a-w1-release-authority.test.ts:448 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(orphan)).toThrow(/foreign identity\|orphan/)` |
| tests/p06a-w1-release-authority.test.ts:454 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(extraKey)).toThrow(/unknown field .surprise./)` |
| tests/p08a-w0-studio-history.test.ts:53 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/p08a-w0-studio-history.test.ts:441 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(clone(legal))).toBeTruthy()` |
| tests/p08a-w0-studio-history.test.ts:450 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(swapped)).toThrow(/ascending eventId/)` |
| tests/p08a-w0-studio-history.test.ts:459 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(early)).toThrow(/recording boundary/)` |
| tests/p08a-w0-studio-history.test.ts:465 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(lying)).toThrow(/after − before/)` |
| tests/p08a-w0-studio-history.test.ts:477 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(unknown)).toThrow(/not a known history kind/)` |
| tests/p09a-w0-founding-regime.test.ts:57 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/p09a-w0-founding-regime.test.ts:137 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/p09a-w0-founding-regime.test.ts:145 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30({ ...raw, state: { ...raw.state, foundingRegime: 'sandbox' } })).toThrow(/not a k` |
| tests/p09a-w0-founding-regime.test.ts:147 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30({ ...raw, state: missing })).toThrow(/foundingRegime is missing/)` |
| tests/p09a-w0-founding-regime.test.ts:149 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30({ ...raw, state: { ...raw.state, foundingRegime: 'bare-lot' } })).toThrow(/cannot` |
| tests/p09a-w0-founding-regime.test.ts:151 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30({ ...bare, state: { ...bare.state, foundingRegime: 'endowed' } })).toThrow(/must ` |
| tests/p09a-w0-founding-regime.test.ts:214 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(makeSave(state))).not.toThrow()` |
| tests/p12-lifecycle.test.ts:2 | A3 migrateToV29→V30 (load to live) | `import { generateWorld,tick,makeSave,exportSave,importSave,migrateToV30 } from '../src/core/index.js'` |
| tests/p12-lifecycle.test.ts:59 | A3 migrateToV29→V30 (load to live) | `const reloaded=migrateToV30(importSave(exportSave(makeSave(state)))).state` |
| tests/p12-starting-world.test.ts:2 | A3 migrateToV29→V30 (load to live) | `import { beginFounding, generateWorld, makeSave, exportSave, importSave, migrateToV25, migrateToV30, makeSaveV` |
| tests/p12-starting-world.test.ts:27 | A3 migrateToV29→V30 (load to live) | `expect(exportSave(migrateToV30(importSave(bytes)))).toBe(bytes)` |
| tests/p13a-causal-core.test.ts:4 | A1 validateSaveV29→V30 (live envelope) | `import { exportCurrentState, importSave, migrateToV30, validateSaveV30, makeSave } from '../src/core/save.js'` |
| tests/p13a-causal-core.test.ts:19 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(exportCurrentState(mid))).state` |
| tests/p13a-causal-core.test.ts:49 | A1 validateSaveV29→V30 (live envelope) | `expect(()=>validateSaveV30(makeSave(state))).not.toThrow()` |
| tests/p13a-causal-core.test.ts:50 | A3 migrateToV29→V30 (load to live) | `const restored=migrateToV30(importSave(exportCurrentState(state))).state` |
| tests/p13a-causal-core.test.ts:68 | A3 migrateToV29→V30 (load to live) | `const roundtrip=migrateToV30(importSave(exportCurrentState(state))).state` |
| tests/p13a-causal-core.test.ts:91 | A1 validateSaveV29→V30 (live envelope) | `expect(()=>validateSaveV30(makeSave(state))).not.toThrow()` |
| tests/p13a-research-employment.test.ts:6 | A3 migrateToV29→V30 (load to live) | `import { exportSave, importSave, makeSave, migrateToV30 } from '../src/core/save.js'` |
| tests/p13a-research-employment.test.ts:38 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(exportSave(makeSave(released)))).state` |
| tests/p13a-research-employment.test.ts:47 | A3 migrateToV29→V30 (load to live) | `expect(makeSave(migrateToV30(importSave(exportSave(makeSave(rehired)))).state)).toEqual(makeSave(rehired))` |
| tests/p13a-research-identity.test.ts:6 | A3 migrateToV29→V30 (load to live) | `import { exportSave, importSave, makeSave, migrateToV30 } from '../src/core/save.js'` |
| tests/p13a-research-identity.test.ts:31 | A3 migrateToV29→V30 (load to live) | `expect(exportSave(makeSave(migrateToV30(importSave(json)).state))).toBe(json)` |
| tests/p13a-research-identity.test.ts:37 | A3 migrateToV29→V30 (load to live) | `expect(exportSave(makeSave(migrateToV30(importSave(installedJson)).state))).toBe(installedJson)` |
| tests/p13a-rival-adoption.test.ts:3 | A3 migrateToV29→V30 (load to live) | `import { exportCurrentState, importSave, migrateToV30 } from '../src/core/save.js'` |
| tests/p13a-rival-adoption.test.ts:143 | A3 migrateToV29→V30 (load to live) | `// pinned V25 fact, so it tracks forward to `migrateToV30`.` |
| tests/p13a-rival-adoption.test.ts:144 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(exportCurrentState(released))).state` |
| tests/p13a-rival-adoption.test.ts:166 | A3 migrateToV29→V30 (load to live) | `expect(exportCurrentState(migrateToV30(importSave(exportCurrentState(operational))).state)).toBe(exportCurrent` |
| tests/p13a-save-v20.test.ts:6 | A3 migrateToV29→V30 (load to live) | `import { convertV19ToV20, exportSave, importSave, makeSave, makeSaveV18, migrateToV19, migrateToV20, migrateTo` |
| tests/p13a-save-v20.test.ts:54 | A3 migrateToV29→V30 (load to live) | `const lifted = migrateToV30(a)` |
| tests/p13a-save-v20.test.ts:89 | A3 migrateToV29→V30 (load to live) | `const save = migrateToV30(accepted())` |
| tests/p13a-technology-membership.test.ts:2 | A3 migrateToV29→V30 (load to live) | `import { exportCurrentState, importSave, makeSave, migrateToV30 } from '../src/core/save.js'` |
| tests/p13a-technology-membership.test.ts:74 | A3 migrateToV29→V30 (load to live) | `const original = migrateToV30(importSave(sourceJson)).state` |
| tests/p13a-technology-membership.test.ts:75 | A3 migrateToV29→V30 (load to live) | `const branch = migrateToV30(importSave(sourceJson)).state` |
| tests/p13a-technology-milestones.test.ts:6 | A1 validateSaveV29→V30 (live envelope) | `import { exportSave, importSave, makeSave, migrateToV25, migrateToV30, validateSaveV19, validateSaveV30 } from` |
| tests/p13a-technology-milestones.test.ts:47 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(json)).state` |
| tests/p13a-technology-milestones.test.ts:74 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forged)).toThrow(/technology milestone/)` |
| tests/p13a-technology-milestones.test.ts:79 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(duplicated)).toThrow(/duplicate technology milestone/)` |
| tests/p13a-technology-milestones.test.ts:82 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(preRecorded)).toThrow(/invented technology history/)` |
| tests/p13b-s1-save-v21.test.ts:13 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/p13b-s1-save-v21.test.ts:39 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(direct)).state` |
| tests/p13b-s1-save-v21.test.ts:91 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(importSave(load('./fixtures/p13b/legacy-v20-research-active-280.json.gz')))` |
| tests/p13b-s1-save-v21.test.ts:102 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(importSave(load('./fixtures/p13b/legacy-v20-research-paused-expired-468.json.gz'` |
| tests/p13b-s1-save-v21.test.ts:119 | A3 migrateToV29→V30 (load to live) | `const a = migrateToV30(importSave(json))` |
| tests/p13b-s1-save-v21.test.ts:120 | A3 migrateToV29→V30 (load to live) | `const b = migrateToV30(importSave(json))` |
| tests/p13b-s1-scheduler.test.ts:4 | A3 migrateToV29→V30 (load to live) | `import { exportSave, importSave, makeSave, migrateToV30 } from '../src/core/save.js'` |
| tests/p13b-s1-scheduler.test.ts:59 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(direct)).state` |
| tests/p13b-s2-access-identity.test.ts:4 | A1 validateSaveV29→V30 (live envelope) | `import { exportSave, importSave, makeSave, migrateToV30, validateSaveV30 } from '../src/core/save.js'` |
| tests/p13b-s2-access-identity.test.ts:181 | A1 validateSaveV29→V30 (live envelope) | `it('6. save/reload and later ticks: exactly two rows, no duplicates, no erasure; validateSaveV30 accepts', () ` |
| tests/p13b-s2-access-identity.test.ts:185 | A3 migrateToV29→V30 (load to live) | `const migrated = migrateToV30(imported)` |
| tests/p13b-s2-access-identity.test.ts:196 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(makeSave(state))).not.toThrow()` |
| tests/p13b-s2-access-identity.test.ts:256 | A1 validateSaveV29→V30 (live envelope) | `* `validateSaveV30`, exercising the full save-file boundary, not just the` |
| tests/p13b-s2-save-v22.test.ts:13 | A3 migrateToV29→V30 (load to live) | `migrateToV30,` |
| tests/p13b-s2-save-v22.test.ts:44 | A3 migrateToV29→V30 (load to live) | `return migrateToV30(save).state` |
| tests/p13b-s2-save-v22.test.ts:49 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(direct)).state` |
| tests/p13b-s2-save-v22.test.ts:206 | A2 live pin 29→30 | `expect(makeSave(live(migrated)).saveVersion).toBe(30)` |
| tests/p13b-s2-save-v22.test.ts:215 | A3 migrateToV29→V30 (load to live) | `it('round-trips a migrated two-Laboratory save through exportSave/importSave/migrateToV30 byte-identically', (` |
| tests/p13b-s2-save-v22.test.ts:218 | A3 migrateToV29→V30 (load to live) | `const restored = migrateToV30(importSave(direct)).state` |
| tests/p13b-s2-validation.test.ts:3 | A3 migrateToV29→V30 (load to live) | `import { exportSave, importSave, makeSave, migrateToV30 } from '../src/core/save.js'` |
| tests/p13b-s2-validation.test.ts:183 | A3 migrateToV29→V30 (load to live) | `const reloaded = migrateToV30(importSave(direct)).state` |
| tests/p13b-s3-save-v23.test.ts:103 | A4 SaveFileV29→V30 typed helper | `expect(() => migrateToV22(live)).toThrow(/cannot downgrade SaveFileV30/)` |
| tests/p13b-s3-save-v23.test.ts:104 | A4 SaveFileV29→V30 typed helper | `expect(() => migrateToV21(live)).toThrow(/cannot downgrade SaveFileV30/)` |
| tests/p13b-s3-save-v23.test.ts:105 | A4 SaveFileV29→V30 typed helper | `expect(() => migrateToV20(live)).toThrow(/cannot downgrade SaveFileV30/)` |
| tests/p13b-s3-save-v23.test.ts:109 | A2 live pin 29→30 | `expect(makeSave(p13aLaboratorySlice()).saveVersion).toBe(30)` |
| tests/p13b-s3-validation.test.ts:2 | A1 validateSaveV29→V30 (live envelope) | `import { exportSave, makeSave, validateSaveV30 } from '../src/core/save.js'` |
| tests/p13b-s3-validation.test.ts:156 | A1 validateSaveV29→V30 (live envelope) | `it('accepts the unmutated hand-authored baseline directly through validateSaveV30', () => {` |
| tests/p13b-s3-validation.test.ts:158 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(JSON.parse(json))).not.toThrow()` |
| tests/p13b-s5-save-v24.test.ts:210 | A2 live pin 29→30 | `expect(makeSave(p13aLaboratorySlice()).saveVersion).toBe(30)` |
| tests/p13b-s6-save-v26.test.ts:133 | A3 migrateToV29→V30 (load to live) | `const lifted = (save as unknown as { migrateToV30: (envelope: unknown) => { seed: string; state: GameState; br` |
| tests/p13b-s6-save-v26.test.ts:254 | A2 live pin 29→30 | `expect((reimported as { saveVersion: number }).saveVersion).toBe(30) // did NOT throw (at the live version thi` |
| tests/p13b-s7-announcements.test.ts:83 | A3 migrateToV29→V30 (load to live) | `const liveState = (json: string): GameState => save.migrateToV30(JSON.parse(json) as never).state as GameState` |
| tests/p13b-s7-announcements.test.ts:87 | A2 live pin 29→30 | `expect(save.LIVE_SAVE_VERSION).toBe(30)` |
| tests/p13b-s7-announcements.test.ts:135 | A2 live pin 29→30 | `expect(reimported.saveVersion).toBe(30) // S7 added no save root; the live version is S8's` |
| tests/p13b-s8-finance.test.ts:33 | A3 migrateToV29→V30 (load to live) | `//     through the real `migrateToV30` and compares it to its own V26` |
| tests/p13b-s8-finance.test.ts:63 | A3 migrateToV29→V30 (load to live) | `migrateToV30: (envelope: unknown) => { saveVersion: number; seed: string; state: GameState; broadcastCache: un` |
| tests/p13b-s8-finance.test.ts:159 | A3 migrateToV29→V30 (load to live) | `it('migration basis frozen: a GENUINE V26 period (ten keys), lifted through the real migrateToV30, carries the` |
| tests/p13b-s8-finance.test.ts:170 | A3 migrateToV29→V30 (load to live) | `const lifted = withV27.migrateToV30(v26Envelope)` |
| tests/p13b-s8-save-v27.test.ts:187 | A2 live pin 29→30 | `expect(envelope.saveVersion).toBe(30)` |
| tests/p14b1-promises.test.ts:503 | A1 validateSaveV29→V30 (live envelope) | `save.validateSaveV30(save.makeSave(withActivePromise))` |
| tests/p14b1-promises.test.ts:657 | A3 migrateToV29→V30 (load to live) | `type SaveModuleWithV29 = typeof save & { migrateToV30: (envelope: unknown) => Envelope }` |
| tests/p14b1-promises.test.ts:661 | A3 migrateToV29→V30 (load to live) | `return withV29.migrateToV30(JSON.parse(json)).state` |
| tests/p14b1-save-v29.test.ts:109 | A2 live pin 29→30 | `expect(save.LIVE_SAVE_VERSION as number).toBe(30)` |
| tests/p14b1-t4-regressions.test.ts:12 | A1 validateSaveV29→V30 (live envelope) | `import { migrateToV30, validateSaveV30 } from '../src/core/save.js'` |
| tests/p14b1-t4-regressions.test.ts:23 | A3 migrateToV29→V30 (load to live) | `const state = migrateToV30(JSON.parse(json)).state` |
| tests/p14b1-t4-regressions.test.ts:74 | A2 live pin 29→30 | `const envelope = (state: GameState) => ({ saveVersion: 30, seed: state.seed, state, broadcastCache: state.broa` |
| tests/p14b1-t4-regressions.test.ts:84 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(valid)).not.toThrow()` |
| tests/p14b1-t4-regressions.test.ts:86 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(valid)).toThrow()` |
| tests/p14b1-t4-regressions.test.ts:166 | A1 validateSaveV29→V30 (live envelope) | `const loaded = validateSaveV30(JSON.parse(json))` |
| tests/p14b1-t4-regressions.test.ts:306 | A1 validateSaveV29→V30 (live envelope) | `expect(JSON.stringify(validateSaveV30(JSON.parse(json)))).toBe(json)` |
| tests/p14b2-setup-wrap-regressions.test.ts:7 | A1 validateSaveV29→V30 (live envelope) | `import { makeSave, validateSaveV30 } from '../src/core/save.js'` |
| tests/p14b2-setup-wrap-regressions.test.ts:27 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(JSON.parse(JSON.stringify(saved)))).toEqual(saved)` |
| tests/p14b3-reservations.test.ts:12 | A1 validateSaveV29→V30 (live envelope) | `import { makeSave, validateSaveV30 } from '../src/core/save.js'` |
| tests/p14b3-reservations.test.ts:94 | A1 validateSaveV29→V30 (live envelope) | `const reloaded = validateSaveV30(JSON.parse(JSON.stringify(makeSave(next)))).state` |
| tests/p14b3-reservations.test.ts:134 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(settled))))` |
| tests/p14b3-reservations.test.ts:177 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(released))))` |
| tests/p14b3-reservations.test.ts:201 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(JSON.parse(JSON.stringify(makeSave(settled))))` |
| tests/p14b3-rule-revision.test.ts:13 | B/comment (see §B) | `import { exportSave, importSave, loadSave, makeSave, migrateToV29, migrateToV30, validateSaveV29, validateSave` |
| tests/p14b3-rule-revision.test.ts:109 | B/comment (see §B) | `// 600-T2 (record 600, C9/C10): the live writer stamps Save30, so "makeSave` |
| tests/p14b3-rule-revision.test.ts:110 | B/comment (see §B) | `// reproduces the raw V29 bytes" is a moved premise. The invariant kept: the` |
| tests/p14b3-rule-revision.test.ts:111 | B/comment (see §B) | `// live writer's output IS the governed V29->V30 migration of the raw fixture,` |
| tests/p14b3-rule-revision.test.ts:112 | B/comment (see §B) | `// which differs from raw by the version tag alone (no restamped root, receipt` |
| tests/p14b3-rule-revision.test.ts:113 | B/comment (see §B) | `// or digest); the V29 half above stays byte-identical.` |
| tests/p14b3-rule-revision.test.ts:114 | B/comment (see §B) | `const governed = migrateToV30(importSave(raw))` |
| tests/p14b3-rule-revision.test.ts:115 | A2 live pin 29→30 | `expect(governed.saveVersion).toBe(30)` |
| tests/p14b3-rule-revision.test.ts:116 | B/comment (see §B) | `expect(JSON.parse(exportSave(governed))).toEqual({ ...JSON.parse(raw), saveVersion: 30 })` |
| tests/p14b3-rule-revision.test.ts:117 | B/comment (see §B) | `expect(exportSave(makeSave(reloaded.state))).toBe(exportSave(governed))` |
| tests/p14b3-rule-revision.test.ts:139 | A3 migrateToV29→V30 (load to live) | `const state = migrateToV30(save).state` |
| tests/p14b3-rule-revision.test.ts:159 | A1 validateSaveV29→V30 (live envelope) | `const reloaded = validateSaveV30(importSave(exportSave(makeSave(attached)))).state` |
| tests/p14b3-rule-revision.test.ts:165 | A3 migrateToV29→V30 (load to live) | `const state = migrateToV30(save).state` |
| tests/p14b3-rule-revision.test.ts:201 | A1 validateSaveV29→V30 (live envelope) | `const reloaded = validateSaveV30(importSave(exportSave(makeSave(settled)))).state` |
| tests/p14b4-started-replay-scenery-commands.test.ts:12 | A3 migrateToV29→V30 (load to live) | `import { makeSave, migrateToV14, migrateToV30, validateSaveV13 } from '../src/core/save.js'` |
| tests/p14b4-started-replay-scenery-commands.test.ts:94 | A3 migrateToV29→V30 (load to live) | `const state = migrateToV30(v14).state` |
| tests/p14bf2-acting-discipline.test.ts:20 | B/comment (see §B) | `import { exportSave, importSave, loadSave, makeSave, migrateToV29, migrateToV30, validateSaveV29, validateSave` |
| tests/p14bf2-acting-discipline.test.ts:69 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(makeSave(state))` |
| tests/p14bf2-acting-discipline.test.ts:109 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30(makeSave(legal))` |
| tests/p14bf2-acting-discipline.test.ts:241 | A1 validateSaveV29→V30 (live envelope) | `const loaded = validateSaveV30(importSave(exportSave(makeSave(state)))).state` |
| tests/p14bf2-acting-discipline.test.ts:303 | B/comment (see §B) | `expect(exportSave(loaded)).toBe(raw)` |
| tests/p14bf2-acting-discipline.test.ts:304 | B/comment (see §B) | `// 600-T2 (record 600, C9/C10): the live writer stamps Save30, so "makeSave` |
| tests/p14bf2-acting-discipline.test.ts:305 | B/comment (see §B) | `// reproduces the raw V29 bytes" is a moved premise. The invariant kept: the` |
| tests/p14bf2-acting-discipline.test.ts:306 | B/comment (see §B) | `// live writer's output IS the governed V29->V30 migration of the raw corpus,` |
| tests/p14bf2-acting-discipline.test.ts:307 | B/comment (see §B) | `// which differs from raw by the version tag alone (no repaired receipt, root` |
| tests/p14bf2-acting-discipline.test.ts:308 | B/comment (see §B) | `// or digest); the V29 half above stays byte-identical.` |
| tests/p14bf2-acting-discipline.test.ts:309 | B/comment (see §B) | `const governed = migrateToV30(importSave(raw))` |
| tests/p14bf2-acting-discipline.test.ts:310 | A2 live pin 29→30 | `expect(governed.saveVersion).toBe(30)` |
| tests/p14bf2-acting-discipline.test.ts:311 | B/comment (see §B) | `expect(JSON.parse(exportSave(governed))).toEqual({ ...JSON.parse(raw), saveVersion: 30 })` |
| tests/p14bf2-acting-discipline.test.ts:312 | B/comment (see §B) | `expect(exportSave(makeSave(loaded.state))).toBe(exportSave(governed))` |
| tests/p14bf2-acting-discipline.test.ts:322 | A3 migrateToV29→V30 (load to live) | `const state = migrateToV30(save).state` |
| tests/p14bf2-acting-discipline.test.ts:345 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(importSave(exportSave(makeSave(attached)))).state.promises).toEqual(attached.promises)` |
| tests/placement-save-v12.test.ts:53 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/placement-save-v12.test.ts:411 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(valid)).toBe(valid)` |
| tests/placement-save-v12.test.ts:417 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(overlapped)).toThrow(/overlaps placed facility 1/)` |
| tests/placement-save-v12.test.ts:429 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(tooClose)).toThrow(/violates its clearance ring/)` |
| tests/placement-save-v12.test.ts:435 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(valid)).toBe(valid)` |
| tests/placement-save-v12.test.ts:442 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(doubled)).toThrow(` |
| tests/placement-save-v12.test.ts:449 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(early)).toThrow(` |
| tests/property-state-v13.test.ts:65 | A1 validateSaveV29→V30 (live envelope) | `validateSaveV30,` |
| tests/property-state-v13.test.ts:477 | A2 live pin 29→30 | `expect(reloaded.saveVersion).toBe(30)` |
| tests/property-state-v13.test.ts:644 | A2 live pin 29→30 | `expect(save.saveVersion).toBe(30)` |
| tests/property-state-v13.test.ts:646 | A1 validateSaveV29→V30 (live envelope) | `expect(validateSaveV30(save)).toBe(save)` |
| tests/property-state-v13.test.ts:743 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(bad)).toThrow(expected)` |
| tests/property-state-v13.test.ts:812 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(bad)).toThrow(expected)` |
| tests/property-state-v13.test.ts:824 | A1 validateSaveV29→V30 (live envelope) | `expect(() => validateSaveV30(forged)).toThrow(` |
| tests/ruling-a-development-in-play.test.ts:426 | A2 live pin 29→30 | `if (reloaded.saveVersion !== 30) throw new Error('expected V28 save')` |
| tests/save.test.ts:44 | A4 SaveFileV29→V30 typed helper | `import type { SaveFileV14, SaveFileV15, SaveFileV30 } from "../src/core/save.js";` |
| tests/save.test.ts:226 | A4 SaveFileV29→V30 typed helper | `// `makeSave` is the live boundary (P14B.1): SaveFileV30. Every V1–V13-style shape` |
| tests/save.test.ts:229 | A4 SaveFileV29→V30 typed helper | `function wellFormedSave(): SaveFileV30 {` |
| tests/save.test.ts:279 | A4 SaveFileV29→V30 typed helper | `const bad: SaveFileV30 = { ...save, seed: "a-different-seed" };` |
| tests/save.test.ts:293 | A4 SaveFileV29→V30 typed helper | `const bad: SaveFileV30 = { ...save, broadcastCache: [divergentItem] };` |
| tests/save.test.ts:300 | A4 SaveFileV29→V30 typed helper | `const bad: SaveFileV30 = { ...save, broadcastCache: [] };` |

Class counts: {'A3 migrateToV29→V30 (load to live)': 85, 'A4 SaveFileV29→V30 typed helper': 27, 'A2 live pin 29→30': 73, 'B/comment (see §B)': 72, 'A6 wire row gains nullable seatClass': 11, 'A2 projection pin 46→47': 57, 'A1 validateSaveV29→V30 (live envelope)': 115, 'A2 live refusal text 29→30': 1, 'A2 prior-registry pin +projection-v46 id': 1, 'A5 one-past sentinel 30→31': 3}
Files changed: 99


## B. Meaning pins re-expressed from evidence (C9 exclusion list → C10 style)

(i) Byte-identity pins that held only while live = 29.
- `tests/p14bf2-acting-discipline.test.ts:303` (HEAD numbering; now :302-312). Before: `migrateToV29(importSave(raw))` then `expect(exportSave(makeSave(loaded.state))).toBe(raw)`. After: keep the V29 half (`expect(exportSave(loaded)).toBe(raw)` — added explicitly, the raw V29 corpus is byte-identical after a V29 load), then `governed = migrateToV30(importSave(raw))`, `governed.saveVersion === 30`, `JSON.parse(exportSave(governed))` deep-equals `{ ...JSON.parse(raw), saveVersion: 30 }` (the governed migration moves the version tag and nothing else: no repaired receipt/root/digest), and `exportSave(makeSave(loaded.state)) === exportSave(governed)` (the live writer's output IS the governed migration). Evidence: `convertV29ToV30` = validate + `clonePlainJson` + `saveVersion: 30` (src/core/save.ts:8697-8701); runtime47 pattern :191-205. Purpose kept: "valid load preserves the old erroneous receipt/root/digest bytes exactly without repairing history".
- `tests/p14b3-rule-revision.test.ts:109` (now :107-117): identical re-expression (the V29 half `exportSave(reloaded) === raw` was already asserted and stays). Purpose kept: "preserves genuine evaluator1 root/receipt/digest bytes through valid load, not a restamped current fixture".
- `tests/bridge-p14b2-checkpoint.test.ts:34-37` (now :34-49): Before: `after.currentSaveJson === before.currentSaveJson`, same for savedSaveJson, and both digests equal the before digests. After, per slot: `governed = migrateToV30(importSave(before[slot]))`, version 30, `JSON.parse(exportSave(governed))` deep-equals `{ ...JSON.parse(before[slot]), saveVersion: 30 }`, `after[slot] === exportSave(governed)`; digests: `after.currentStateDigest === sha256(after.currentSaveJson)` and `after.savedStateDigest === sha256(after.savedSaveJson)` (the runtime recomputes digests over the migrated bytes: bridge/runtime-checkpoint.ts:844-855, :1013-1019). Kept: schemaId/session/revision/journal assertions, slots distinct, tick 12 / saved week 11, and the first test's pins that the SOURCE slots are V29 (:18-19 unchanged). Evidence: runtime47 :185-205 asserts exactly this per-slot law on the genuine V29 checkpoint.

(ii) Generator pins (`tests/bridge-contract-generator.test.ts`).
- :554-560 → the projection-47 identity. `generateCsharpContract({..., projectionVersion: 47})` header and `schemaIdentity(schema)` pinned to `sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538`, read INDEPENDENTLY from the checked-in `generated/unity/project-studio-bridge.contract-manifest.json` on HEAD (line 8) and `generated/unity/StudioBridgeDtos.Generated.cs:3` (`// Schema identity: sha256:6f6b…`); the outgoing 46 identity `584bdd…` is the same manifest's schemaId at `47b2bbf~1` (verified by `git show`).
- :656-657 → F10/F11 declaration hashes pinned to `53058c23075427647bf9e24052128cd4f7ad0340fa54763e3e75df25aeea482e`, computed once by a scratch vite-node script that calls `generateCsharpTypeDeclarations(FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema)` and sha256 exactly as the test does (log: scratchpad/600-T2-gen-hash.log; F10 and F11 render the same whole BRIDGE_SCHEMA so they agree, as before). The 608 failure text's truncated prefix `53058c23075427647bf9e24052128cd4f7ad0…` matches. NOT self-equality: the literal is fixed in the test. The frozen aggregate F01–F04/F09/F12 (:260-267 of the fixtures file, and their hashes in the test) untouched.

(iii) `tests/bridge-p14b3-promise-command.test.ts:155` (TS2322; now :152-180). Purpose kept: "each material promise field participates in the opaque intent identity, including refused variants" with no partial effect (session truth unchanged). The B3 refused variant was a CLASSLESS `LEAD_OR_SIGNIFICANT_ROLE_COUNT` (engine-refused "not offered in this slice", quoted with accepted:true / ok:false). Under the projection-47 closed union it is not a wire shape (grammar → INVALID_COMMAND before mutation, G2 law; asserted in bridge-p14b4-cast-class), so it cannot be the ENGINE-refused quoted variant. Which purpose I kept and why: the ENGINE-refused purpose — replaced by the count-only P3 family `DIRECTING_COUNT` (still enumerated by the wire's count-only member, bridge-schema.ts:1770-1772; still refused by `promiseFeasibility` "a directing promise is not offered in this slice", promises.ts:213-216,:388-389), and I ADDED the two lawful tagged variants (`seatClass: 'lead'` and `'leadOrAntagonist'`) because the seat class is projection 47's new material field — 7 variants, all identities distinct, plus an explicit assertion that the engine-refused variant reads `ok:false`, `classification:'IMPOSSIBLE'`, message `not offerable: a directing promise is not offered in this slice`. No `@ts-expect-error` anywhere in my diff.


## C. G9 class — "rival flexible-first authoring movements" (C10; distinct from residual-buffer movements)

Law observed (src/core/talentMarket.ts:1275-1298 `authorRivalPromise`; archetype `isProven` :685-688 = real credit or age ≥ 30, read publicly through `publicPreferredOpportunity` :727-729): for a proposal to an UNPROVEN person the rival reads FLEX (`LEAD_OR_SIGNIFICANT_ROLE_COUNT`, `{kind:'castRoleCount', count:1, seatClass:'leadOrAntagonist'}`, window = the full proposed term) first and P1 only if FLEX is not ACHIEVABLE; a PROVEN person gets the P1 read alone; the first ACHIEVABLE read is attached; both reads see the same state object.

Receipts (temporary spy probe over the natural chains, logs `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-probe-rival-authoring.log`, `-2.log`, `600-T2-probe-fixtures.log`; probe file deleted, not in the patch):
- Default chain (`p13aGeneratedStudio()` = seed p13a-core-causal-01), first and only authoring wave inside 220 weeks at week 196 (208-week rival terms, expiry 208): 75 authoring reads; unproven subjects r01-5 (craft, age 29.93), r03-2 (actor, 28), r03-4 (actor, 28.59); r01/r02 FLEX ACHIEVABLE → tagged roots promise-10/11, 28/29, 32/33; r03 FLEX FRAGILE "needs a picture not yet commissioned" then P1 FRAGILE (same) → no attachment ("neither"); every proven subject: one P1 read (r01/r02 ACHIEVABLE → P1 root; r03 FRAGILE → none). First rival submission: r01 → r01-0 (writer, 44, proven) → P1. First actor: r01 → r01-2 (actor, 30.71, proven) → P1. No unproven subject with FLEX non-achievable AND P1 achievable (the P1-fallback branch) in 220 weeks.
- Bindings at 208 (default chain): r02 wins all six r01-x persons incl. the tagged promise-11 (r02 → r01-5) — the ONE bound tagged rival root; r01 wins the six r02-x persons on P1 roots; r03/r04 keep their own people ("theirs was the only proposal on the table"). First rival SATISFIED promise: promise-16 (r01 → r02-2, P1) at week 213.
- Poaching seed (p13-public-commercial-adoption): subject r04-3 (actor, 29.84, unproven → prefers significantCastRole); r01/r02 author FLEX P2 (promise-42/43, ACHIEVABLE, unbound); r03/r04 neither.

Re-expressions (every seed, week, timeout and unrelated assertion kept):
1. `tests/p14b1-trust-chooser.test.ts` test 7 (HEAD :540-697): the observation now records the ORDERED reads per submission (`reads: [{draft, receipt}]`) and the public archetype `proven` at the read; the spy asserts the sequence law per read (proven → exactly [P1]; unproven → [FLEX, then P1 only after a non-achievable FLEX]), the same state object for a second read (`Object.is(input, inputRef)`), and the exact draft tuple for each read (`expectedAuthoringDraft`). `assertOriginalAuthoring` now attaches the FIRST achievable read (no read after it), pins the root's family/predicate/receipt to THAT read, and for the negative branch requires the full sequence to have been read ([P1] or [FLEX,P1]) with zero attachments. Test 7a purpose: "carries exactly one promise iff an original read is ACHIEVABLE — FLEX first if unproven, P1 alone if proven — with exact joins" (was "exactly one P1 iff …"). Test 7b purpose: first writer IFF (kept); first actor positive → "the FIRST read is achievable, so exactly that read's promise is authored: P1 if proven, FLEX P2 if unproven" (kept as an unconditional positive; observed proven → P1); ADDED the unproven flexible-P2 witness (authored FLEX root; `publicPreferredOpportunity` = significantCastRole; `promiseMatchesPreferredOpportunity` true for the tagged root and false for a P1 — the D3 reason the rival reads FLEX first) and the unproven "neither" witness ([FLEX, P1] both non-achievable, zero attachments) beside the proven negative. The P1-fallback branch is NOT required (no natural witness; fixture finding below), never synthesized. Result: 11 passed / 2 todo (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-run4-trust-chooser.log`). Trust-chooser test 6 (the 600-T-migrated tagged-P2 D3 proof, records 110/554) is GREEN on the candidate — the RED→GREEN witness the brief asked me to record: `✓ opportunity changes the winner of an otherwise compensation-versus-incumbency 1-1 tie` in that log.
2. `tests/helpers/p14b2-fixtures.ts` `rivalFixture` (:215-231): the family-agnostic search still finds open = week 196 (48 rival proposals with promises, 6 tagged) and terminal = week 213 with promise-16 (P1, proven r02-2) SATISFIED — the week did NOT move; only the class-A1 `validateSaveV30` sweep touched this helper.
3. `tests/p14b2-fixture-preconditions.test.ts` "wins a real rival-owned case" / `poachingFixture` (:145-204): settled receipt at 208 = PLAYER, reasons exactly ['their compensation band ranked above the others', 'their term matched what this person prefers'], eventId talent-market-event-145, contract `…:person-studio-5a47d054-r04-3:208:player-47` — identical to record 556/557; the rival FLEX roots for the unproven subject exist (promise-42/43) but r01/r02 are dropped at 208 exactly as before. The winner did NOT move; no edit beyond the sweep. 5/5 in 594.
4. `tests/bridge-p14b2-trust.test.ts` group 5 (and every group): 22/22 (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-595-bridge-p14b2-trust.log`); only the A1 sweep and the A6 `seatClass` leaf in `expectedHistory` touched this file.

Natural-chain WINNERS that moved: NONE among the pinned winners (poaching player-47/event 145; rivalFixture promise-16 @213; trust-chooser test 6 treatment winner). Launch-behaviour change visible in receipts (unpinned, for the Owner): rival roots to unproven persons are now tagged FLEX P2 (default chain promise-10/11/28/29/32/33; poaching seed promise-42/43); promise-11 (r02 → r01-5) is a BOUND tagged rival root at 208 — the reason `migrateToV29` now refuses natural-chain states (class A3) and the reason the live-P2 rivalWorlds prerequisite is reachable at all. Settlements for those unproven persons at 208 (after): r01-5 → r02 "their proposal ranked above the others overall"; r03-2/r03-4 → r03 "theirs was the only proposal on the table"; r04-3 (no player) → r04 "theirs was the only proposal on the table". The pre-cutover reasons for these UNPINNED cases are not in any record I can read and Git is read-only here (evidence limit).

Fixture findings (never synthesized):
- F-G9-1 (trust-chooser 7b; policy :529 task D): the unproven P1-FALLBACK witness (FLEX not achievable, P1 achievable) has no natural occurrence on the default seed within 220 weeks (every unproven read pair agrees). Lawful restoration: a seed whose incumbent rival has the unproven actor seated in SUPPORT on a pre-first-take picture and no unproduced script at week 196 — the seed scan found 'seed-b' (w196 r03 → person-…-r03-4, actor 28: FLEX FRAGILE "needs a picture not yet commissioned", P1 ACHIEVABLE) and 'seed-c' (w196 r03 → r03-3, actor 28) (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-probe-seed-scan.log`). A test wanting that branch would scan `p13aGeneratedStudio('seed-b')` in addition, not the default seed alone.


## D. Investigation only (no edits to the six live-P2 files)

D.1 `tests/p14b4-cast-class-outcomes.test.ts:233` rivalWorlds "prerequisites absent by 350" (default seed). Probe (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-probe-rivalworlds.log`): the SLOTS prerequisite (a rival film at remainingTicks 5 whose lead/antagonist/support each carry a bound OPEN root of that rival, window open) is satisfied at week 212 — r01 film `studio-aca408ec-r01:film:6`, lead r02-4/promise-20, antagonist r02-3/promise-18, support r02-2/promise-16, all P1 count-only. The MISSING prerequisite is `genuine`: a bound TAGGED root whose beneficiary sits in lead (or antagonist with leadOrAntagonist) at shooting entry. Within 350 ticks exactly one tagged root is ever bound, promise-11 (r02 → person-…-r01-5), and that person is a CRAFT worker who is never cast; the other five tagged roots (r01/r02 → r03-2, r03-4) are unbound because r03 retained both actors without a promise. Lawful next step: seed the rivalWorlds chain differently — the scan found the genuine witness at week 215 on 'seed-b' (r01 film 23, lead r01-4, promise-8) and 'seed-d' (r02 film 23, antagonist r02-2, promise-17, leadOrAntagonist); the slots prerequisite on those seeds must be re-verified by the same search (not checked by my scan). Not a defect: the partial-evidence boundary 26 §2 :86-87 names.

D.2 `tests/p14b4-cast-class-outcomes.test.ts:438` second bound OPEN beneficiary in antagonist. Verified from the fixture bytes and the test's own helper (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-probe-second-beneficiary.log`): `genuine-v29-bound-open-p1` at tick 52 carries two bound OPEN player roots, promise-0 → t-act-09 and promise-1 → t-act-08, both [52,92); `playerPayload` fills the two non-promised seats from `state.contracts` in order after excluding the focus beneficiary: t-act-12 (start 13) → antagonist, t-act-13 → support, t-act-08 (start 52) third and never seated. The writer's claim is correct. Lawful next step (test-author, in the excluded file, next pass): let `playerPayload` prefer the issuer's other bound OPEN beneficiaries when filling complementary seats (the player may lawfully cast any employed actor; no binding is invented), or cast t-act-08 explicitly as antagonist in that one case. Not an engine defect.

D.3 `tests/p14b4-cast-class-policy.test.ts:529` P1-fallback witness. State shape (paper, from src/core/promises.ts:239-290,:424-441): under evaluator 4 the two reads differ only through the class mask on `seatedPreFirstTake` (unproduced scripts and the player-only stock door are class-agnostic), so FLEX FRAGILE "needs a picture not yet commissioned" with P1 ACHIEVABLE needs, at the authoring week, an issuer with NO unproduced script whose pre-first-take picture seats the unproven person in SUPPORT — i.e. the incumbent (a challenger cannot have seated another studio's employee). On the default seed within 220 ticks the only authoring wave is week 196 and no rival is in that configuration (r01/r02 hold scripts → both reads ACHIEVABLE; r03/r04 hold nothing and run no picture with those actors → both FRAGILE), so none of the 220 ticks can reach it lawfully; the test's `seen.size === 4` requirement is therefore a natural premise with no witness on this seed. Seeds with a lawful witness: 'seed-b' (r03 → r03-4 at w196) and 'seed-c' (r03 → r03-3 at w196), 12-seed scan in `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-probe-seed-scan.log` (counts per seed: flexibleP2 / neither / P1fallback). Recommended: re-express the policy test to scan the default seed AND 'seed-b' (or run the four-witness search per seed and require all four across the scanned set), never a synthetic state.


## E. Checks run (one process at a time; every full output under /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/)

| # | Command (from the worktree root) | Result | Log |
|---|---|---|---|
| 1 | `npm run typecheck` (after A+B) | exit 0 | 600-T2-typecheck.log |
| 2 | `npm run typecheck:bridge` (after A+B) | exit 0 | 600-T2-typecheck-bridge.log |
| 3 | vitest --project core, 46 core files from 608 (c2a×3, cash-ledger, construction×2, contracts×5, d11×2, d12, d14, d17×4, facility-move, film-chronicle, legacy-parcel, p04a2, p06a, p08a, p09a, p12-starting-world, p13a×5, p13b×10, placement×2, property-state, ruling-a) | 46 files / 676 passed, exit 0 | 600-T2-run1-core-sweep.log |
| 4 | vitest --project core, 26 bridge files from 608 (generator, operations-events, owner-ux×2, p06, p10a, p11×2, p13b×9, p14a×3, p14b2-checkpoint, process-restart, r3n4, runtime-checkpoint, schema, p13-campaign-isolation) | 24 passed / 2 failed: bridge-schema :341 (a missed `/expected literal 46/` regex → fixed to 47, class A2) and bridge-p13-campaign-isolation (inherited 60 s timeout, same as the pre-B4 baseline 11-test-core-89b5ad2:2015) | 600-T2-run2-bridge-sweep.log |
| 5 | vitest --project core tests/bridge-schema.test.ts (after the fix) | 22/22, exit 0 | 600-T2-run2b-bridge-schema.log |
| 6 | vitest --project core, 15 load-to-live files that were GREEN in 608 plus the two untouched boundary files (bridge-p07a/p08a/p09a/p11-finance/p13b-s3-save-as, p12-lifecycle, p13a-research-identity, p13a-save-v20, p13b-s1-save-v21, p13b-s8-finance, p14b4-started-replay-scenery-commands, d17a-adv-reconciliation, contracts/determinism-floor, p14b1-first-take, p14a1-save-v28) | 15 files / 78 passed, exit 0 | 600-T2-run3-load-to-live-regression.log |
| 7 | vitest --project core tests/p14b1-trust-chooser.test.ts (after C) | 11 passed / 2 todo, exit 0 | 600-T2-run4-trust-chooser.log |
| 8 | 594 group (12 files, as recorded) — first pass | 11 files passed / 1 failed: bridge-p14b3-promise-command :511 (hand-built history row lacked the projection-47 `seatClass: null` → class A6, fixed) | 600-T2-594-b1-b3-controls.log |
| 9 | vitest --project core tests/bridge-p14b3-promise-command.test.ts | 19/19 | 600-T2-594b-bridge-p14b3.log |
| 10 | 595: vitest --project core tests/bridge-p14b2-trust.test.ts | 22/22, exit 0 | 600-T2-595-bridge-p14b2-trust.log |
| 11 | 596 (no --project flag): the 12 historical save files | 12 files / 137 passed, exit 0 | 600-T2-596-historical-saves.log |
| 12 | 590: the 17 adjacent files | 17 files / 203 passed, exit 0 | 600-T2-590-adjacent.log |
| 13 | `npm run typecheck` (final, after C and the A6 fix) | exit 0 | 600-T2-typecheck-final.log |
| 14 | `npm run typecheck:bridge` (final) | exit 0 | 600-T2-typecheck-bridge-final.log |
| 15 | 594 group (12 files) — final | 12 files / 134 passed / 2 todo, exit 0 | 600-T2-594-b1-b3-controls-final.log |
| 16 | vitest --project core tests/bridge.test.ts tests/bridge-p12-campaign-library.test.ts | bridge.test 18/18 (360 s alone); campaign-library 11 failed / 2 passed — the inherited timeouts (5000 ms / 20000 ms), identical to 608/609 and the pre-B4 baseline | 600-T2-run5-bridge-and-campaign-library.log |
| P1 | generator hash computation (vite-node scratch script, not a test) | schemaIdentity 6f6b4880…, F10/F11 53058c23… | 600-T2-gen-hash.log, 600-T2-gen-hash.ts |
| P2–P5 | temporary probe test files (deleted; NOT in the patch) | rival authoring reads, fixtures, rivalWorlds, second beneficiary, 12-seed scan | 600-T2-probe-rival-authoring.log, -2.log, 600-T2-probe-fixtures.log, 600-T2-probe-rivalworlds.log, 600-T2-probe-second-beneficiary.log, 600-T2-probe-seed-scan.log |

Every modified file was executed at least once (cross-check: `changed.txt` vs `ran.txt` in the scratchpad; the two helpers run through their consumers). NOT run by me: the full suite (parent's record-check), the r3n1/world-first/p13a-scientist inherited files, the six live-P2 files (investigation only), p14b4-ready-replay-stale-target, p14b4-cast-class-capacity-evaluator5, p14b4-replay-bill-reductions.

Classification of every failure still expected on the candidate after this patch: inherited (bridge-p12-campaign-library ×11 timeouts; bridge-p13-campaign-isolation ×1 timeout; p13a-scientist-foundation ×3 digests; r3n1-stale-schedule-take-02* ×6 ENOENT; world-first-scenery-load-in-provenance ×1 python) / designated (p14b4-ready-replay-stale-target:234; p14b4-cast-class-capacity-evaluator5 by law) / natural premise (outcomes rivalWorlds ×9, outcomes :438, policy :529 — §D) / G9 fixture finding (none left failing: the P1-fallback branch is not required by trust-chooser 7b; recorded as F-G9-1) / DEFECT: none.

## F. Candidate DEFECTs

None found. Two observations that are NOT defects, for the record: (a) natural chains now carry a bound tagged rival root (promise-11 on the default seed), so every "load to the live version" through `migrateToV29` refuses by design (lossless-only downgrade, save.ts:8704-8709) — swept to `migrateToV30`; (b) `tests/bridge-p13-campaign-isolation.test.ts` reverts from the class-A3 stop line to its inherited 60 s timeout once swept (present in the pre-B4 baseline).

## G. Evidence limits

- Headless vitest/tsc only; no native, no UI, no full-suite run (parent's record-check follows).
- Probe evidence came from temporary test files under tests/ (deleted before hand-back; logs retained under the scratchpad); they are not part of the patch and the patch was regenerated after deletion (`git status --short -- tests/` shows only ` M` entries, 100 files).
- The "before" values of the UNPINNED natural settlements for unproven persons are not reproducible here (Git read-only, no checkout of the pre-S2 source); the pinned winners are compared against records 556/557 and 110.
- HEAD moved from 45d62b30 to be0c3c0 during my work (the parent's docs-only 608/609 evidence commit); the source identity is unchanged; my diff is `git diff HEAD -- tests/` on be0c3c0.
- The 12-seed scan checked the genuine-witness and P1-fallback predicates only; the rivalWorlds SLOTS prerequisite on 'seed-b'/'seed-d' was not verified.
- bridge-p12-campaign-library timeouts are load-sensitive (inherited); bridge.test.ts took 360 s alone.

## Summary

DONE. Sweep: 100 files, +566/−414 (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2.patch`, sha256 in the return message; status `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T2-status.txt`), classes A1 115 lines, A2 131 lines (73 save pins + 57 projection pins + 1 refusal text), A3 85, A4 27, A5 3, A6 11, plus the §B re-expressions; historical reads listed and untouched. B: three byte-identity pins and the generator pins re-expressed from evidence; B3 :155 kept as the engine-refused P3 variant plus two seat-class variants. C: trust-chooser test 7 re-expressed to the flexible-first law with the proven/unproven fact observed; no pinned natural-chain winner moved; one fixture finding (P1-fallback, seeds 'seed-b'/'seed-c'). D: rivalWorlds misses the `genuine` tagged-lead prerequisite (only bound tagged root is a craft worker; 'seed-b'/'seed-d' carry it at 215), :438 verified (t-act-12 seated, t-act-08 third in contract order), policy :529 unreachable on the default seed (witness on 'seed-b'/'seed-c'). Controls: 594 134/2 todo, 595 22/22, 596 137/137, 590 203/203; typecheck and typecheck:bridge exit 0. No production, fixture or Git changes.
