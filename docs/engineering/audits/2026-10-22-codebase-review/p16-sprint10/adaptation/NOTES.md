# P17 continuation on the P16 checkpoint: adaptation notes (Sprint 10, Sol)

Target T: `/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt` at `a5a66c27` (live Save49).
Draft: `/Users/zacheryspector/studio-specialists/p17` (base `6510c971`).
Nothing here has been compiled or run. The hard rules forbid tsc, vitest and vite-node. Each post-image passed a single-file
`typescript.transpileModule` syntax check (no type check). `git apply --check` of all three patches at a5a66c27 passed
(read-only, together and one at a time).

| Deliverable | Contents |
|---|---|
| `SOURCE.patch` (172 KB) | 17 files under `src/core` (12 edited, 5 new). No bridge files: see "Not adapted". |
| `TESTS.patch` (97 KB) | New P17 tests and helpers, the seam pins, `live-era.ts`, `p16-era.ts`, and 9 hand re-pins. |
| `TESTS-SWEEP.patch` (141 KB) | The mechanical Save50 sweep, 76 files. Split from TESTS.patch to stay under 200 KB. Ledger: `specs/sweep-ledger.txt`; script: `tools/sweep.py`. |
| `postimages/` | Every post-image at its repo path. |
| `MANIFEST.json` | Pre-image sha256 in T (null for new files) and post-image sha256 for all 113 files, plus each patch's sha256. |

Apply order in the lane: SOURCE, TESTS, TESTS-SWEEP. The three touch disjoint files.

## Defect dispositions

### P17-01 link versus mint: FIXED
- T before: `actions.ts:383` runs `greenlightRightsRefusal`. The tail at `actions.ts:623-628` always calls
  `mintStoryPropertyAtGreenlight`, so a sequel under a licence founded `story-property:<own concept>` with a clean R1 genesis.
- Draft: it never reached P16. `draft continuation.ts:104-109` asks an injected `ContinuationRights` adapter, and nothing
  links the production into the parent property.
- Post-image:
  - `actions.ts:391` calls `prepareContinuation` (`continuationGreenlight.ts:70`) right after the rights refusal. It quotes, then
    dry-runs P16's own `linkContinuationAtGreenlight` (`rights.ts:866`) on the pre-state. Any throw becomes
    `applyActions: greenlight rejected — continuation refused: ...` before any write.
  - The tail at `actions.ts:636-647` links when `continuation.link` and otherwise mints as before.
  - The release is titled under the parent by P16's unchanged `mintFilmTitleAtRelease` (`rights.ts:885`), because the film is now a work link.
  - `resolveStoryProperty` reads P16 `resolveTitles(state).workLinks` and refuses an ambiguous or contradicted parent.
- Licence term: the quote reads the grant over the earliest release week. `continuation.ts:76-97` runs with `coverWeek = week + PRODUCTION_TICKS` (`:452`). Commit re-reads the grant at `actions.ts:3016` through `continuationReleaseAuthority`.
- A same-concept remake still goes through P16's remake hook: `prepareContinuation` sets `link: false` and the mint tail links it.

### P17-02 spin-off branch authority: FIXED
- Draft: `continuation.ts:93-101` maps by type only, so a directSequel on a spin-off continuity asked the `sequel` use.
- Post-image: `continuationUseOf(type, branchKind)` (`continuation.ts:65`) returns `spinoff` for a spinOff or any edge on a
  spin-off branch. `continuationRightsRefusal` then asks `branchAuthority` (`rights.ts:751`, at `continuation.ts:84`) for the
  parent's spin-off authority, and asks `permissionFor` (`rights.ts:730`) for the other uses. The rights read happens after the branch is
  determined. `mintSubPropertyHook` (`continuation.ts:615-633`) also requires the parent's spin-off authority.

### P17-03 save numbering: FIXED, P17 is Save50
- T: `save.ts:6760-6762` (P16 = 49 = live). Draft: `continuationSave.ts:14-15` claimed 46 over 45.
- Post-image `save.ts:6782-6784`: `P17_SAVE_VERSION = 50`, `P17_PREDECESSOR_SAVE_VERSION: typeof P16_SAVE_VERSION = 49`,
  `LIVE_SAVE_VERSION = P17_SAVE_VERSION`. The constants live in save.ts to avoid an import-cycle TDZ. `continuationSave.ts`
  keeps only the root keys, strip, refusal and validator join.
- Step functions are era-neutral: `validateSaveP17` (:12065), `convertPredecessorToP17` (:12081), `convertP17ToPredecessor`
  (:12087), `migrateToP17` (:12095). The V50 aliases at `save.ts:702-705` follow the P15B convention, because tests compose
  `validateSaveV${LIVE_SAVE_VERSION}`.
- Guards:
  - 45 predecessor migrators gained `if (save.saveVersion === P17_SAVE_VERSION) return migrateToX(convertP17ToPredecessor(save))` ahead of their P16 line.
  - `migrateToV49` has its own first-line guard (:12054).
  - The `validateSave` dispatcher has a 50 line (:5607) and now names "1 through 50".
  - The frozen-builder guard refuses any `franchises` key by builder name (:6349).
  - `validatedLiveProfessionContext` strips the P17 root.
- Root law:
  - The `franchises` root stays absent until the first property exists (`withFranchises` never writes an empty root).
  - Migration from Save49 changes the version only.
  - Downgrade is lossless while the root is absent and otherwise refuses with `migrateToV49: cannot downgrade or discard N recorded franchise root(s)`.
  - The validator refuses an empty root.
- `validateSaveP17` first runs the era-independent laws (non-finite numbers, studio-event sequence) under its own label over the whole state, as `validateSaveV49` does. It then proves the stripped state with `validateSaveV49`, then `validateP17Roots`.
- New P16 join in `continuationValidate.ts:174`: every edge child must be a P16 work of its property. Edge `studioId` must be the player (:190).
- `studioClosure.ts` and `campaignLegacy.ts` now publish through `validateSaveP17`.

### P17-04 reception seam: FIXED
- Draft `hollywoodTick.ts:407-413` computed the rival continuation input in its own loop.
- T has one rival publication path, `publishCreatorRelease` (`hollywoodTick.ts:467`).
- Post-image `hollywoodTick.ts:472-483`:
  - `publishCreatorRelease` computes `continuationReleaseInput` against the live state, passes it as `inheritedAwareness01`, and applies `applyContinuationRelease` once.
  - It returns the root. `prepareContinuedReleases` and `advanceHollywoodWeek` thread it, and `tick.ts` takes it back.
- Player releases go through `tick.ts:636` (input) and `:715` (one R/M/F update).
- `reception.ts:113/649/670/842` and `forecast.ts:492` carry the one optional field. Absent means bit-identical: the forecast passes the explicit defaults `0, 0, 1, 1` before it.

### P17-05 market factor: PRESERVED
- Draft `tick.ts:1011` passed `undefined` where T passes the market factor.
- Post-image `tick.ts:1013` keeps `advanceHollywoodWeek(withFranchises(...), marketBatch?.rivalFactorById)`, unchanged from T `tick.ts:990` except for the root wrapper.

## Dropped draft hunks and why

| Draft hunk | Why it was dropped |
|---|---|
| `cameo.ts` and every cameo hunk: employment, releaseCareers, starPower, standing, castingPackageReadModel, technology `assignmentBlockedTalentIds`, forecast cameo executions, tick 1.8 CAMEO WORK, hollywoodTick staff/decide | Sprint 11. They separate cleanly: no continuation path reads a cameo record. |
| `P17_SEGMENT_IDS` in continuationSignals | Cameo only. |
| Injected `ContinuationRights`, `ApplyActionsDeps` and `TickOptions` adapter | The brief bans mock rights adapters. The real P16 reads replace it. |
| `bridge/session.ts` variants and `bridge-p17-greenlight-variants.test.ts` | ui/ is sparse-excluded, so it cannot be adapted against T. The test also used a 240 s timeout. |
| worldgen and harness `initialP17Roots` | The root is lazy. |
| `applyCancel` commitment prune | T already refuses cancelling a committed picture (L-14). |
| `applySubPropertyPromotion` | P16 has no promotion producer (review P17-09). `promotionEligible` stays as a read model. |
| Rival continuation hold | No rival continuation route exists at this checkpoint. |
| `p17-r2-step-names.test.ts` | Superseded by T's P15B alias convention. |
| Draft `p17-save-step`, `p17-integration`, `p17-r2-*` and the old `p17-continuation-law` | Built on the mock rights adapter or on cameo. Replaced by the tests below. |

## Tests and the laws they cover

| Test file | Laws covered | RED at a5a66c27 |
|---|---|---|
| `tests/p17-p16-rights.test.ts` | P17-01 own sequel links (no `story-property:<B>`, no R1 genesis; B in the parent's workLinks), release titled under the parent, third installment resolves, Save50 round trip. Licensed sequel links to the rival's property; no licence gives `noAuthority:<r01>`; a short licence gives "only until week"; a lapse at commit gives `expired:`, and the tick waits. P17-02 spin-off sequel refused after the parent's spin-off use is licensed away; the main continuity stays lawful. Healthy reboot legal, fourth continuity refused, refusals leave state unchanged. | Yes, by assertion. Imports only predecessor modules; the helpers spell the request shape locally. |
| `tests/p17-continuation-law.test.ts` | Quote on the real P16 read; DirectSequel/Prequel equality; missing, stale and cross-branch refusals; a refused quote cannot commit; remake leaf; healthy reboot; cap derived, never stored; dormant return is a DirectSequel with one `activeAgain`; lock equals release read; property-wide Fatigue; per-continuity Momentum; no double credit. | Yes, missing module (new law). |
| `tests/p17-save-step.test.ts` | LIVE 50, aliases, dispatcher range; no `franchises` key on fresh or released worlds; version-only down and up; genuine week53 Save45 gives the same state as `migrateToV49`; franchise round trip; downgrade, `migrateToV45` and `makeSaveV1` refuse by name; validator refuses an empty root, an unknown key, a forged studio and a forged P16 work link. | Yes. |
| `tests/p17-continuation-signals.test.ts` | R/M/F formulas, ported verbatim (formulas not retuned; recognition floor 0.35). | Yes, missing module. |
| `tests/p17-continuation-seam.test.ts` + `fixtures/p17/seam-predecessor-pins.{json,producer.ts}` | Absent input is bit-identical; one field at lock and at release; no legs, critic or Standing effect. | Ported verbatim. |

Helpers: `tests/helpers/p17-route.ts` and `tests/helpers/p17-law-fixtures.ts`.
- p17-route uses real P16 producers only: `mintRoute`, `makeOffer`, and the counterparty's `acceptOffer` with STABLE readers at a nominal 1,000 price, as in `p16-r2-authority.test.ts` `licensed`.
- p17-law-fixtures builds hand-built later films over `continuationWorldOf(realState)`.
- All new tests use `beforeAll` for shared routes. None overrides a timeout.

Sweep (Save49 to Save50, static):
- Live `validateSaveV49` identifiers were renamed to `validateSaveV50`. Error-message prefixes stay, because the inner reader still throws them.
- Live `convertV49ToV48(X)` became `convertV49ToV48(convertV50ToV49(X))`. All 37 wrapped sites were traced to makeSave, migrateToLive or validateLiveSave.
- Era reads kept at 49:
  - `p16-r2-validator:129`;
  - `p16-estate-current49-rollback:15`;
  - `p16-estate-d-join-negative:70`;
  - all of `p16-estate-observed-migration`, `p16-r03-observed-migration` and `1368-recovery-witnesses`;
  - most of `p16a-save-v46`.
- Spies on the publication reader now target `validateSaveP17`. `validateLiveSave` is bound to `validateSaveP17`, so `validateLiveSave.name` spies and message prefixes follow the producers.

## What the coordinator must observe in the lane

1. **Type check first.** Nothing was type-checked. Most likely friction: `exactOptionalPropertyTypes` around `continuation?:` on the greenlight actions, the `as Action` cast in `p17-route.ts`, and the `Forged` cast in `p17-save-step.test.ts`.
2. **RED at a5a66c27.**
   - Run `p17-p16-rights` with only TESTS.patch's new files present: every case should fail by assertion, with no import error.
   - Then apply SOURCE and run it GREEN.
3. **Seam pins.** The pins were produced at `6510c971`. Since then, reception has not changed and the forecast changes preserve behavior on this fixture. If the absent-input leaves fail, regenerate the pins with the producer on unpatched a5a66c27 before judging the seam.
4. **Route assumptions, all unrun:**
   - An uncommitted Release Ready picture waits through an extra tick (P06A) in the lapse case.
   - The player can hold two concurrent legacy greenlights. If a capacity refusal fires before the reboot cap, that case needs a capacity-free route.
   - `permissionFor` reports a lapsed licence as `expired:<id>`, not `noAuthority`.
   - An exclusive spin-off licence held by r01 makes `branchAuthority` refuse the title holder with `noAuthority:<r01>`.
   - The mediocre film (45/45, 0.8x) raises stored Fatigue above 0.
5. **Budgets.** Each `p17-p16-rights` describe builds one `mintRoute` (8+ ticks) plus up to two greenlight-to-release cycles in `beforeAll`. Default 10 s hook timeout. Measure alone if one fails under lane load; do not raise budgets.
6. **Sweep.** Run the full core suite once. Watch for a Save49 pin the static sweep missed: a hand-built `saveVersion: 49` envelope read by a renamed reader. One was found and fixed (`p16-held-title-seller:95`).

## Not adapted, still open

- **ui/ and bridge consumers** of the greenlight variants and the save version. ui is sparse-excluded from T. `bridge/runtime-checkpoint.ts` reads `LIVE_SAVE_VERSION` generically and needs no edit. Bridge tests pinning 49 were swept (`bridge-runtime-checkpoint:787`). Bridge greenlight variants that would carry `continuation` are not wired: the core action accepts it, the bridge does not offer it yet.
- **Managed front door:** `greenlightScriptProject` carries `continuation`, refuses to queue a continuation-bearing request, and passes it through `applyGreenlightScriptProjectNow`. No managed-route test was written; the draft's `p17-r2-managed` was cameo- and adapter-bound.
- **Rights-hold path** (`p17RightsHolds`, `tick.ts:368/408`). It holds a committed picture whose grant lapsed after commit. It is reachable only when the grant lapses between commit and the release tick, and no test reaches it.
- **Review items P17-06..09:**
  - Rival continuation route: none.
  - Talent associations and continuity credit: read models only.
  - SubProperty promotion: read model only (P17-09).
  - These were not re-litigated beyond keeping them inert.

## Fix 1 after compiler lane

`FIX-1.patch` is a tests-only diff against 506d6c84. It passes `git apply --check` there.

1. `p14b4-material-evidence-core.test.ts:42`: `EnvelopeV33` now reads `ReturnType<typeof validateSaveV50>`.
   The sweep's rename lookahead missed a name followed by `>`. The live-carrier envelope (validated at :111 and :367) is Save50, and the frozen31 carrier keeps `validateSaveV31`.
2. `p15b-legacy-terminal-regression.test.ts:236`: the P17-entry lambda is typed `(s: typeof current)` instead of `never`.
   A call through the union of the four converters now takes `SaveFileP17`. The thrown-message assertion and the order are unchanged from a5a66c27.
3. `p16-estate-observed-migration.test.ts:77`: `saved` comes from makeSave, so it is a live envelope. It now enters the P16 downgrade through `convertV50ToV49` (version only, no franchise).
   The asserted refusal `/cannot discard changed estate observation or bid authority/` is unchanged. The era read at :48 (`convertV48ToV49` output) stays at 49.
4. `p16-r2-validator.test.ts:115-121`: `materialized()` returns its own Save49 envelope type (`typeof base`) instead of the live `Save`.
   The file feeds it to the Save49 reader `validateSaveV49` (:129, kept as an era read), so neither the validator nor its assertions change.

## Fix 2

`FIX-2.patch` holds source and test changes against 5a6fc0bb, 7 files. It passes `git apply --check` there (read-only).
Every other post-image in `postimages/` is byte-identical to 5a6fc0bb.

**G1, `tests/bridge-runtime-checkpoint.test.ts`, projection-v63.**
- :788 restores the fixture's own `saveVersion: 49`. The sha pin at :786 and the fixture bytes are unchanged.
- :797-806: after loading, the case now asserts that each slot is the canonical-chain lift `exportSaveJson(migrateToLive(importSave(slot)).state)`.
- It also asserts that the hydrated saves equal the fixture's with `saveVersion: LIVE_SAVE_VERSION`. P17 changes the version only.
- The digests are `sha256` of the new slot bytes and differ from the fixture's.

**G2 and G3, `tests/p17-p16-rights.test.ts:49-75`.**
- `propertyIds` and `homesOf` (:30-33) replace the single-property expectation.
- Across each continuation greenlight the property set is unchanged and never holds `story-property:<own concept>`. Each installment sits under exactly `[P]`.
- After the sequel's release, rival films may add their own properties, so only the sequel's absence and its home are pinned there.
- At the parent the set grows by the sequel's own mint, so the case stays RED by assertion.

**G4, `tests/helpers/p17-route.ts:29-33`.**
- `greenlightAs` adds every talent engaged on a live player production to `used`, so a second concurrent greenlight seats idle people (M16).
- `freshConcept` (:21-27) also skips concepts already produced. Otherwise a linked sequel's concept, which founds nothing, would be picked again.

**B1, blocking: same-tick release read.**
- `continuationGreenlight.ts:24-41` and `:107-114`: `publicFilmById`, `continuationWorldOf` and `continuationReleaseInput` take `sameWeek`, the films this tick already released.
- `tick.ts:637` passes the player loop's `releasedFilms`. `tick.ts:893` and `:1014` pass it on to `prepareContinuedReleases` and `advanceHollywoodWeek`, which forward it through `publishCreatorRelease` (`hollywoodTick.ts:472/478`, `:505-518`, `:531/631`). Rival films published earlier in the loop were already visible through `h.films`.
- The same world view repairs talent associations: `continuation.ts:670-672` reads `world.releasedFilm`.
- The state seen by other hollywood logic is untouched. `hollywoodTick.ts:708` counts `state.studio.releasedFilms` for the chart, which is why the films travel as a parameter and are not written into the state.
- RED-first case: `p17-p16-rights.test.ts:192-228`. A directSequel and a reboot of the same property are greenlit the same week (`prod-NNNN` < `prod-NNNN-1`, so the sequel releases first), committed together, and released in one tick.
- The case asserts both edges' `releasedWeek`, the two branches, a byte-identical replay of that tick, and a save round trip.
- Expected RED: at 5a6fc0bb the `beforeAll` tick throws "released installment ... has no public result" (`continuation.ts:290-292`). At a5a66c27 the root assertion fails, because no root exists.

**S2: a linked continuation's concept founded no title; a later plain greenlight of it minted a clean R1.**
- Choice: LINK to the parent under the parent's remake authority.
- Why: P16's own same-concept rule (`rights.ts` `SAME_CONCEPT_GREENLIGHT_USE`: "producing the same story again is a remake", and "never a second property for one founding concept"). Also P16 contract §3: "a licensed continuation links to the existing parent and does not mint an unencumbered R1".
- Refusing outright would also forbid the title holder's lawful remake.
- Source:
  - `rights.ts:835-845`: `linkedContinuationParent` reads the player's live works of the concept and the persisted property linking one of them.
  - `rights.ts:823-829`: `greenlightRightsRefusal` requires remake authority on that parent.
  - `rights.ts:868-870`: `mintStoryPropertyAtGreenlight` links the new production there.
  - Ceiling, marked `ponytail:`: a linked production that was later cancelled is not matched. That needs ledger ids if it matters.
- RED-first cases:
  - `p17-p16-rights.test.ts:77-84`, title holder: no new property, the work sits under `[P]`.
  - `:130-141`, licensee: refused with "has no continuation authority over P ... is a linked continuation work of it", state unchanged.

**S3: P17-04 through `publishCreatorRelease`. NO TEST, no cheap lawful route.**
- The shared path updates R/M/F only for a rival or buyer-continued release whose production is a lineage edge.
- Edges come only from player greenlights. A rival production becomes an edge only as the origin film a player DirectSequel cites while that production is locked.
- That cite needs the player's sequel authority over a property whose production is in flight. P16 refuses both the title sale and the R3 licence during production (`activeProductionEncumbrance`, `p16-r2-sale.test.ts:50`).
- The one lawful route is absorption: the player absorbs the rival, the title moves to the buyer, and the production is released by `prepareContinuedReleases` → `publishCreatorRelease`.
- Every end-to-end absorption-with-continued-release fixture in T needs the external capture `P16_ORIGINAL48_CAPTURE_ROOT` and is marked UNRUN (`p16-absorption-continued-production.test.ts:1-3,25`). The self-contained `p16c-acquisition.test.ts` never releases continued work.
- Composing that route blind would be guesswork. The pure once-only release law stays covered by `p17-continuation-law.test.ts` ("a second release ... no double credit").
- Recorded for the lane run that has the capture.

**Deferred, not implemented.**
- S1: a P16-build current-schema Bridge checkpoint carrying Save49 is refused by `validateCanonicalCurrentSave` ("must be a current V50 save", `bridge/runtime-checkpoint.ts:540-541`). This belongs to the Sprint 11 Bridge projection bump.
- The rights-hold path (`p17RightsHolds`, `tick.ts:368/408`) stays untested.

**New or changed test cases (run RED at a5a66c27; the first three are also RED at 5a6fc0bb):**

| Case | Location |
|---|---|
| P17 same-week release: "both release that week, the sequel first; each continuity records its own release once" | `p17-p16-rights.test.ts` |
| P17 same-week release: "the release week replays byte for byte, and its save validates and round-trips" | `p17-p16-rights.test.ts` |
| "a plain greenlight of the linked sequel's concept founds no clean title: the title holder's remake links to the parent" | `p17-p16-rights.test.ts` |
| "a plain greenlight of the licensed sequel's concept needs the parent's remake authority, and refuses without it" | `p17-p16-rights.test.ts` |
| "the player's own sequel is a work of the parent property; its own concept founds no property and no R1 genesis" (rewritten) | `p17-p16-rights.test.ts` |
| "the sequel's release is titled under the parent; the third installment resolves through it to the same property" (rewritten) | `p17-p16-rights.test.ts` |
| "the validator refuses an empty root, ..." (unchanged text; helper fix only) | `p17-save-step.test.ts` |
| "accepts and migrates the enumerated sha256:23a3092f… (projection-v63) identity" (changed; at the parent only the new-digest assertion `not.toBe(original.currentStateDigest)` fails, because nothing lifts there) | `bridge-runtime-checkpoint.test.ts` |
