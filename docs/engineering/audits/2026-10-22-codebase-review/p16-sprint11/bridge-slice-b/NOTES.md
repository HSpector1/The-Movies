# Sprint 11 Bridge slice B: continuation and featured appearances on the wire (projection 66)

Base: written against 2b1a5b4b. Every pre-image this slice touches is byte-identical at 2b1a5b4b and at the current tip 29c7cf0d, which adds cameo FIX-1 to FIX-3; the files differ only in `src/core` and the `p17` tests and helper. `git apply --check` passes for SOURCE.patch, TESTS.patch and both together on the worktree at 29c7cf0d. Run the lane at 29c7cf0d: its core compares the cameo `basis`, and one case expects that refusal.

Status: STATIC-UNRUN. Every post-image `.ts` passed a single-file `typescript.transpileModule` syntax check (51 files, no diagnostics). Nothing was type-checked, compiled or run.

## Shape decisions

1. **Greenlight with a continuation.** The existing casting greenlight package (`StudioCastingDraftPayload`, quote family `quoteCasting`, commit `greenlightPicture`) gains two OPTIONAL members:
   - `continuation`: `StudioContinuationRequest`, the core `ContinuationRequest` field for field.
   - `cameos`: an array of `StudioCameoBookingRequest`, the core `CameoBookingRequest` with `basis`, as cameo FIX-1 defines it.

   Both are closed objects, so an unknown key refuses at the parser. They are optional rather than present-and-null because the casting-draft precedent ("every field present") would break every existing draft builder, including the browser client under `ui/`, which this slice may not touch. The precedent for an optional draft member is P14A.2's `historyPage` and the market proposal's optional `promise`.

   The adapter's greenlight door (`ui/src/engine/adapter.ts`) sends neither field and cannot be widened from here. So `bridge/casting.ts greenlightCarrying` sends the same `greenlightScriptProject` action itself when either field is present. When both are absent it calls the adapter, byte for byte. The core then decides everything: the continuation quote, P16 link versus mint, the guest law, stale fee and basis, and the never-queue rule. A refusal is the core's own sentence, published as the existing `ENGINE_REJECTED` quote rejection. Example: `continuation refused: a remake cites exactly one RELEASED film; … is not released`.
2. **What the quote shows before commit.** `StudioCastingQuoteSnapshot` gains two required nullable members.
   - `continuation`: `StudioContinuationQuoteTerms`. It carries the core `prepareContinuation` quote for the production id the discarded successor assigned: property, type, use, branch, Recognition, Momentum, Fatigue, comparison, continuity credit, inherited awareness and band. It also carries `link` (true means the picture joins the parent's works and mints no title) and `rights`, which is the P16 answer it relies on: via title, licence, or the parent for a spin-off; holder; licence id; grantor; licence end; and the cover week the term must reach.
   - `featuredGuests`: `StudioFeaturedGuestTerms[]`, the core `cameoQuote` for each requested guest: fee, retained, refundable, basis, standard shooting week, readiness risk and disclosures.

   Both are null for a screen test, a contract signing, or a package without the request. A continuation or guest on a non-greenlight draft refuses by name. A Bridge-side basis comparison was drafted and then removed: cameo FIX-1 (465d49a9) makes the core compare `basis` like the fee, so the core's sentence is the refusal.
3. **Featured appearances.** The guest list is the Industry view `featuredAppearances`, following the paid-report and franchise read models, not a new quote family. A quote family would mint an intent that commits nothing; the booking commits on the greenlight package, which is where the core books.
   - The page carries `capacity` (`featuredCapacity`: 0 before 1872, 2 from it), `greenlightWeek`, `nominalShootingWeeks`, and one row per person, paged over the world's talent in world order.
   - Each row carries the core quote for every lawful work week (week+1 to week+8): ok, basis, refusal by name, readiness risk and disclosures. The row-level fee, retained and refundable come from a lawful quote, or are null.
   - `bookings` lists every booking of the player's own: production, status, weeks, fee, retained, basis, cancel reason, refund, release week, the credited star-power change, and `cancelIntent`.
   - The new intent kind `cancelFeaturedBooking` maps to the core `cancelCameoBooking`. `resolveAvailableIntents` offers one per reserved booking, so it is also in the snapshot's `availableIntents`.

   Bookings are not added to the production operation rows. Those rows come from the `ui/` lot selector, and a legacy-operations studio may publish none.
4. **Credited appearances.** The core keeps a cameo credit on its booking (`careerEvent`). It never enters the V8 `careerEvents` list that the people and career projections read (`releaseCareers.ts` returns it separately). So no existing career or history projection changes. The credit appears on the bookings page and as franchise outcome guests.
5. **Outcomes.** Each franchise installment gains:
   - `outcome`, null until release: the public film result (critic score, opening, total, expected total), whether it holds the property's Recognition peak, and its `activeAgain` milestone.
   - `guests`: each completed booking that carries the core's career record, with star power before, after and the change.

   The core records no per-release Recognition, Momentum or Fatigue change. `applyContinuationRelease` overwrites the meters, and the audience input it used (`weightedAudienceScore`) is not on `FilmResult`, so a replay would re-derive law on a different input. That change is not published. Recording it needs a core receipt on the lineage edge (ACCEPTANCE OPEN, core slice).
6. **Projection.** Projection goes from 65 to 66. Outgoing65 (`sha256:d57642ad…`) is registered prior; its slots are already live Save50, so the prior path keeps their bytes.

## Exact registry literals

- `bridge/runtime-checkpoint.ts`: `['sha256:d57642ad971a0682ae587c8d9c73fdf8b251f28749dd156e53a5c8487b4e6df8', 'projection-v65']` at the head of `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (total 54).
- Older-roster digests, computed with `tools/roster-digest.cjs`. The method reproduces the parent pins 52/`a6666891…` and 52/`fa11f1c3…` first.
  - `bridge-p14p4p5-opportunities`: 53/`c768ef9805615dcabc16f10acac1eb98ca641b9fca6068ec0b554d5659b5b866`
  - `bridge-p14r2r3-prior55`: 53/`9d2a641fc1db028e713ac490ebd8646b5f02135e1d7ccd4c70cbb48f345b983e`
- Roster sizes go from 53 to 54 (`bridge-p14b6`, `bridge-p14b8`).
- `OUTGOING_65` is added to the exact lists in `bridge-p14b4`, `bridge-p14b5` (two lists), `bridge-p14b6`, and the sorted list in `bridge-runtime-checkpoint`.
- `HIGHEST_REGISTERED` moves to projection-v65 (`bridge-stabilization-l22`).
- `AVAILABLE_INTENT_KINDS` gains `cancelFeaturedBooking` (`bridge-p14b2-trust` exact list).
- 65 to 66 literal sweep: 75 replacements in 37 bridge test files (PROJECTION_VERSION, snapshotVersion, `$id`, `x-project-studio`, `expected literal`, `ProjectionVersion =`, `INCOMING_PROJECTION`).
- `bridge-schema.test.ts`: the two hand-built casting quote literals gain `continuation: null` and `featuredGuests: null`.

## Placeholders and statically computed values

- **Current66 schema id (static):** `sha256:589380869e1329a8027b8339b88646761ce6d791376df5fd793e77ae9dd3b96a`. `tools/schema66.cjs` builds the post-image schema JSON by mirroring `dsl.ts`; the same script reproduces `d57642ad…` from the parent's file. It appears in `bridge-p14b5-relationships` and twice in `bridge-contract-generator`. The lane generator must confirm the JSON byte for byte; replace the three literals if it differs.
- **F10/F11 declaration hashes:** `PLACEHOLDER-P66-F10-…` and `PLACEHOLDER-P66-F11-…` in `bridge-contract-generator.test.ts`. Generator only.
- **Generated C# and contract manifest:** regenerated by the lane (`npm run generate:bridge-contract`, then the contract and fixture checks).
- **Outgoing65 genuine capture:** `tools/capture65.ts`, run in an immutable 2b1a5b4b snapshot. Freeze its output at `tests/fixtures/bridge/genuine-projection65-runtime/` and fill `PLACEHOLDER-OUTGOING65-COMPRESSED-SHA256`, `-DECODED-SHA256` and `-SLOT-SHA256` in `bridge-runtime-checkpoint.test.ts`. The tool asserts projection 65, Save50, the 65 identity and the generated DTO sha `1be6dfd8…` read from the 2b1a5b4b manifest.

## RED-first cases (fail by assertion at 2b1a5b4b and at 29c7cf0d)

`tests/bridge-p17-continuation-greenlight.test.ts` (new). At the parent, the closed quote parser refuses the `continuation` member, so the first `{ ok: true }` assertion fails:
1. quotes the lawful continuation choice, the parent right it relies on and the core read before committing anything
2. refuses an unlawful continuation by the core's own name, rejects an unknown request key and a continuation off a greenlight package
3. commits through the greenlight action: the picture links to the parent property and mints no title of its own

`tests/bridge-p17-featured-appearances.test.ts` (new):
4. lists every person with the core quote for each lawful work week: the real fee, basis, cap and refusals by name. RED: the Industry parser refuses the view.
5. quotes the guest's booking terms on the greenlight package and commits the booking through the greenlight action. RED: the parser refuses `cameos`.
6. refuses a stale basis and a stale fee by the core's own name at the quote and leaves the state untouched. RED: the parser refuses `cameos`.
7. cancels an unperformed booking through the cancelFeaturedBooking intent: one refund of fee less the retained charge. RED: the parser refuses `cameos`.
8. reads a released continuation's lineage edge, recorded release outcome and credited guest from the core records. RED: `outcome` is absent.

`tests/bridge-runtime-checkpoint.test.ts`:
9. accepts the genuine projection-65 capture (2b1a5b4b public save route) and keeps both live Save50 slots byte for byte. Placeholder pins. RED once captured: at the parent the 65 id is current, so the registry assertion fails.
10. The existing per-registry loop gains a projection-v65 case.

The moved pins fail by value at the parent.

## Not verifiable without running

- **Type check.** Most likely friction:
  - `exactOptionalPropertyTypes` on the optional wire members flowing into `ContinuationRequest` (copied key by key).
  - The narrowing in `franchises.ts creditedGuests` and `continuationTerms`.
  - The generated C# accepting `optional(reference(...))` on the draft.
- **Route premises.** Each throws by name or fails at the first assertion.
  - The industry-managed seed leaves two screenplays in review after one week (the same steps as `industryContendedStudio`).
  - (Corrected in Fix 2: legacy operations refuse `activateScriptDevelopment`.) In the 1872 cameo world (historical control), `activateStudioOperations`, `activateScriptDevelopment` and `activateCastingSessions` are accepted, the commissioned screenplay reaches review within 12 weeks, the casting board offers an available package outside the guest, and the cheapest published budget is affordable.
  - A rival employee exists at 1872.
  - In the outcome route, the sequel's guest completes in a standard shooting week.
  - A lineage edge's `releasedWeek` equals the film's `releaseTick`.
- **Untested paths, reasoned only:**
  - The licence and spin-off rights bases in the continuation terms; the routes use the title path, since a locked parent's title cannot be sold.
  - Refusal by a rival holder (`noAuthority:<holder>`).
  - A spin-off continuation greenlight through the Bridge.
- **Timing.** The featured-appearance file builds the cameo world at collection: about 1,871 headless ticks plus about 20 living-industry ticks, as the core cameo suites do. No timeout is set.
- **ACCEPTANCE OPEN:**
  - The per-release R/M/F change needs a core receipt.
  - Bookings on production operation rows need the `ui/` selector or a decision that the page suffices.
  - Rival guest selection is still deferred by the core (cameo review S6).

## Fix 1 (review of slice B, against bfce8c29)

`FIX-1.patch` sha256 `b09a92b5261601ef155a9f7c8a00d16446d0ab0dd6b4b565df9a235c860f361d` (21736 bytes, 8 files, `bridge/` and `tests/bridge-*` only). It applies to bfce8c29 (`git apply --check` clean). Post-images are under `fix1/postimages/`. Status: STATIC-UNRUN. The only check run was a `typescript.transpileModule` syntax pass on every post-image.

- **B1 (blocking).** `releaseOutcome` now reads the Industry film row: `franchisesPage` takes a `PublicFilmRow` lookup, and `industry.ts` passes `index.filmById`.
  - `totalGross` uses the row's measure: cumulative paid gross while the run is active, the final total after. `openingGross` and `criticScore` also come from the row.
  - `expectedTotal` publishes only when the row's studio is the player's (the `release.ts` rule). Every other studio's film gets null.
  - A released installment with no Industry row throws by name, never a fallback.
  - The wire shape is unchanged, so the static identity `sha256:58938086…` stands and F10/F11 do not move. The `industry-schema.ts` and `bridge-schema.ts` edits are comments only.
  - Case 8 pins the measure:
    - premises: the child's run is active and `cumulativeGrossPaid < boxOffice.total`;
    - `totalGross` equals `cumulativeGrossPaid`;
    - both installments match the Industry `film` view row on opening, total and critic score.
  - RED at bfce8c29 by assertion: there `totalGross` is `boxOffice.total`.
  - The rival-film branch (forecast suppressed for a licensed rival origin) has no case. The route cannot release a rival film under licence without new fixture work. It rests on the studio check reading the same row the Industry view shows.
- **S1.** Case 4 now picks its rival the way `freeGuest` picks: employed by another studio at the greenlight week, not in `busyTalentIds`, no retirement record (any profession or actor). No reservation exists before the case books. `cameoQuote` checks the greenlight-week employer before the work-week employer, so the employer refusal fires for every one of the eight weeks.
- **S2.** `releasedContinuation(route)` (two `releaseNewest` runs) moved to collection as `released`. Case 8 now does only the reads. No budget changed.
- **Comments.**
  - The stale PLACEHOLDER comments in `bridge-runtime-checkpoint.test.ts` and `bridge-contract-generator.test.ts` now cite the measured capture and the bfce8c29 generator run.
  - `runtime-checkpoint.ts` names the producer at `docs/engineering/audits/2026-10-22-codebase-review/p16-sprint11/bridge-slice-b/tools/capture65.ts`.
  - The bridge-schema "never `optional()`" comment names the projection-66 `continuation`/`cameos` exception.
- **Recorded risks (no code change):**
  - `greenlightCarrying` in `bridge/casting.ts` hand-builds the `greenlightScriptProject` action when a continuation or guest rides the package. The adapter builds it on the `adapter.ts:2021-2043` path. If the adapter's payload gains a field, the hand-built payload drifts from it. No case compares the two.
  - The `featuredAppearances` view skips the closed-studio guard, as Laboratory, plans and office do, so a closed studio still reads the guest quotes. Fix 1 does not check how the core treats a booking from a closed studio.
  - The quote's `freelancerFees` now includes guest fees. The total is consistent with the core's charge, but nothing on the wire labels the guest share. The separate `featuredGuests` terms carry each fee.

## Fix 2 (lane bridge-b-green-r20 on bfce8c29: featured-appearances file failed at collection)

`FIX-2.patch` sha256 `d526c05c56ecdf83cfa315a1b549df1e12fe1d72fe9f6ccb7aa70210f40b22fa` (3,301 bytes, 1 file: `tests/bridge-p17-featured-appearances.test.ts`). It applies on top of the FIX-1 post-image: a `git apply` in a scratch copy of that file yields `fix2/postimages/` byte for byte. Base it on T HEAD once FIX-1 lands. Status: STATIC-UNRUN, with a `transpileModule` syntax pass only.

- **Cause.** My premise was false. `applyActivateScriptDevelopment` (`actions.ts:2052`) refuses unless `state.operations.mode` is `managed`. The cameo world is founded in legacy operations, so `bridgeReady` threw at collection.
- **Fix.** `bridgeReady` now applies `activateStudioOperations`, `activateScriptDevelopment` and `activateCastingSessions` in one `applyActions`. The adapter's `foundManagedStudioAction` uses this order (mirrored at `tests/p1364-late-founding.test.ts:60`), and `industryManagedStudio` in `tests/helpers/p16-fixtures.ts` uses it too.
  - The casting greenlight draft is the managed path, so the legacy greenlight route is no substitute.
  - A refusal now throws `premise: the founded 1872 cameo world takes the managed activation (operations, screenplays, casting): <core message>`.
  - The activations add no tick, so the collection build stays bounded.
- **Guards checked by reading `applyActivateStudioOperations`.** The cameo world meets each guard on paper:
  - founded (`founding === null`) and engaged;
  - empty active production slate (the Bridge branch forks before any greenlight);
  - legacy-empty operations, construction, placement and sets (the route never builds or commissions a set).
  - The world uses the default `endowed` regime (`worldgen.ts:693`), so activation mints the five founding facilities.
- **Commission concept.** The commission now uses `freshConcept(state)` (the first concept no picture used and no title founded) instead of index 0. The 1,871 headless weeks may have founded concept 0's title.
- **Premises nobody has run yet:**
  - The placement invariant check passes on the ticked world.
  - Managed weekly operating charges over the screenplay weeks leave the cheapest published budget affordable. The continuation file passes with `withCash(200M)`; this route adds no cash.
  - Each failure throws by name at collection.
- The outcome branch (`releasedContinuation`) still forks the legacy `route.world` and uses the core's legacy greenlight. It does not change.
