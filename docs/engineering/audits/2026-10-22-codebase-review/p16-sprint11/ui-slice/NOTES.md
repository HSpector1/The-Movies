# P17 Sprint 11 browser slice: continuation choice, featured appearances, cost and outcomes (UI workhorse)

Status: STATIC-UNRUN CANDIDATE. Nothing was type-checked, run, rendered or measured. Each post-image passed a
single-file `typescript.transpileModule` syntax check. `git apply --check` of both patches passed against T, alone and
together (read-only).

Target T: `/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt`. The brief named HEAD e35bbacc; during
this work the branch moved to bfce8c29 (cameo FIX-3 `29c7cf0d`, Bridge projection 66 `2d62bbf4`, `bfce8c29`). None of
those commits touches `ui/`, and every pre-image these patches edit is byte-identical at e35bbacc and bfce8c29
(MANIFEST.json records the HEAD blob sha256). FIX-3 changed `cameoQuote`'s lifecycle read (greenlight week instead of
work week); this slice only displays the quote, so it is unaffected.

| Deliverable | Contents |
|---|---|
| `SOURCE.patch` (44 KB) | 2 new files (`ui/src/engine/continuation.ts`, `ui/src/components/P17Continuation.tsx`), 5 edited (`adapter.ts`, `Assembly.tsx`, `Dashboard.tsx`, `ReleaseResult.tsx`, `App.tsx`). |
| `TESTS.patch` (21 KB) | 2 new files: `ui/src/screens/p17-continuation-ui.test.tsx` (6 jsdom cases), `ui/e2e/p17-continuation.spec.ts` (1 browser journey). No existing test edited. |
| `postimages/` | Every post-image at its repo path. |
| `MANIFEST.json` | Per-file pre (HEAD blob, null for new) and post sha256, patch sha256 and size. |
| `SHA256SUMS` | sha256 of every deliverable file. |
| `tools/make_patches.py` | Regenerates both patches and the manifest from `postimages/`; refuses if T's working tree differs from HEAD for a touched path. |

Apply order: SOURCE, then TESTS (disjoint files). No new dependency, no timeout or budget change to any existing test,
no src/core, bridge/ or tests/ file touched.

## What each surface reads

All reads go through `ui/src/engine/continuation.ts`, a module of the one engine boundary beside `sets.ts` and
`screenplay.ts`. It decides no legality.

### 1. Greenlight screen: continuation choice (Assembly Review step, `continuation-panel`)

- Properties listed: every `resolveTitles(state).properties` entry where `currentHolder(R1)` is the player, or
  `licencesHeldBy(player)` holds a licence on it, and at least one work link has a public result
  (`continuationWorldOf(state).releasedFilm`). This covers the first sequel, before the franchise root exists (the
  Bridge read model lists root properties only; see its `ponytail:` note).
- Choices: for each released or locked work, `directSequel`, `prequel`, `remake`; one `reboot` per property (the cited
  film is provenance only, so it is quoted once on the newest released work); one `spinOff` per unpromoted SubProperty.
  Each is `continuationQuote(world, { studioId, productionId: predictProductionId(state), request, proposed })`, where
  `proposed` is the package's writer, director and cast, so the continuity credit matches what the greenlight locks.
- Right relied on (lawful choices only): `permissionFor(…, 'R3', { use })` or `branchAuthority` for the quote's `use`;
  a licence answer shows its id and `endWeekExclusive`, a title answer says "Relies on the held title". A lawful quote
  that P16 then refuses throws (fail loud), never displays a guess.
- Meters: once the root records the property, `recognitionReported(meter)`, `fatigueAt(meter)`, and per continuity
  `momentumAt` and `branchBand` (spin-off continuities read their SubProperty meter). Before that, the panel says no
  continuation is recorded and each choice shows the quote's own Recognition, Momentum, Fatigue, inherited awareness and
  band. Reboot legality is the reboot quote itself: the quote line or the core's refusal (for example the open-continuity
  cap).
- Quality is kept distinct: the panel states that inherited awareness raises the opening reach only and never moves
  critic or audience scores, and that Recognition and Fatigue are property-wide (a reboot inherits the Fatigue) while
  Momentum belongs to one continuity.
- Selection: one radio per lawful choice plus "An original picture". The selected `request` rides
  `greenlight(state, pkg, { continuation })` (and `greenlightScriptProject`). Absent selection sends the predecessor
  action byte for byte.

### 2. Featured appearances (same Review step, `guest-panel`)

- Banner instead of rows when there is no living industry, or `featuredCapacity(week) === 0` (before week 1872).
- Work week: a select over `nominalShootingWeeks(week)` (the core's standard-schedule projection); default the first.
- Rows: people in fame order, minus the package's own principals, each quoted by `cameoQuote(state, { talentId, workWeek })`.
  Eligible rows show name, profession, fame, basis, fee, the core's readiness-risk sentence and disclosures. Refused rows
  sit under a disclosure with the core's reason (the guest's id replaced by their name).
- At most `capacity` (two) checkboxes; the rest disable once two are chosen. The request carried is exactly the quote's
  `{ talentId, workWeek, fee, basis }`; the core re-quotes and refuses a stale fee or basis.
- Cost: the panel totals the chosen fees, and Assembly adds them to `totalCommittedCost`, so the solvency gate and the
  commitment preview read the same total the core charges.
- Production screen (Dashboard, after the Production Board, `featured-bookings`): the player's bookings on pictures still
  in production, from `state.cameos`. A reserved booking shows "Cancelling now retains X of the Y fee and refunds Z"
  (the booking's own `retained` and `fee`) and the explicit cancel button. App dispatches
  `{ kind: 'cancelCameoBooking', bookingId }` through `cancelCameoBookingAction`; a refusal shows its exact sentence
  through the existing notice path.

### 3. Outcomes (Release result card, `release-continuation-<id>`)

- Lineage: `installmentEdgeFor(franchisesOf(postTick), id)`: type, parent title, property, continuity and kind,
  greenlit and released weeks, plus the Bridge-parity flags (property Recognition peak, `activeAgain` milestone).
- Meters before and after: the same readers over the pre-tick root (at the pre-tick week) and the post-tick root (at
  the post-tick week). The core records no per-release meter change (Bridge `franchises.ts` says so too); App already
  holds both states for the autopsy, so this reads two real states, not a stored delta.
- Guests: every booking on the production, with the career record's star power before and after when credited, or its
  status (cancelled with reason and refund, completed) otherwise.
- `ReleaseResult` takes a new optional `postTick`; App passes the post-advance state. Older mounts without it render
  as before.

## Refusal handling

- No choice or guest is invented: refused quotes render disabled, with the core's reason, and are never sent.
- Anything the core refuses at greenlight (same-concept non-remake, a P16 link refusal, a stale cameo fee) arrives
  through Assembly's existing `greenlight-refusal` seam. The quote cannot see the chosen concept, so the same-concept rule
  (`prepareContinuation`) is enforced only at the button; the Bridge notice states the same limit.
- Internal contradictions (a lawful quote P16 refuses, a missing licence row, a spin-off continuity with no SubProperty
  meter, an edge on an unknown continuity) throw with a named message.

## RED-first list (against T without the ui change)

`ui/src/screens/p17-continuation-ui.test.tsx` imports only modules that exist at T (core index, `cameoBooking.ts`,
`tests/helpers/p17-cameo-route.ts`, the existing screens and `careerImpact.ts`). The world is the cameo route
(seed `p17-cameo-booking-01`, GREEN in the core lane r14) plus an original released through the real tick and a
directSequel with one guest greenlit by the core action and released. Expected at T: every case fails on a missing
test id (Testing Library throw or assertion), none on import.

| Case | Fails at T on |
|---|---|
| offers the core's lawful continuations of the released original, names the right relied on, and carries the chosen one | `continuation-property-<P>` |
| quotes the locked sequel too: a remake of unreleased work is refused by name, reboot legality and the meters come from the core | `continuation-choice-remake-<sequel>` |
| lists eligible guests with the quoted fee, at most two; the fee joins the commitment and the booking rides the greenlight | `guest-work-week` |
| before the 1956 unlock the guest panel discloses why, and a studio with no released work is offered no continuation | `guest-unavailable` |
| the production screen shows the reserved booking with its retained-charge disclosure and an explicit cancel control | `booking-cancel-disclosure-<id>` |
| shows the lineage edge, the meters before and after the release, and the credited guest, from the core records | `release-lineage-<sequel>` (the `postTick` prop is ignored at T) |

Browser journey `ui/e2e/p17-continuation.spec.ts`: imports the 1956 cameo-route save through the Start screen's
import control (after an in-spec byte-identical export/import proof), continues it, greenlights an original (asserts no
continuation offered, guests available), advances with the release-commit affordance to its release, greenlights a
directSequel under the held title with one featured guest, sees the reserved booking and its cancel control on the
Dashboard, releases the sequel and reads lineage, meters and the credited guest. Four screenshots
(`ui/screenshots/p17-*.png`). Seeded and deterministic. `test.setTimeout(240_000)` is this new spec's own budget,
unmeasured; no existing budget changed.

## Not verifiable without running, precisely

1. Type check (`tsc -p ui/tsconfig.json`). Likeliest friction: `exactOptionalPropertyTypes` on `GreenlightExtras` and
   the greenlight action spread; narrowing `answer.reason` over `BranchAuthority | Permission` in `rightOf`; the
   `as Action` cast and `postTick` / `onCancelCameoBooking` props in the test.
2. Boundary convention: `engine/continuation.ts` and `adapter.ts` import `cameoQuote`, `nominalShootingWeeks`,
   `featuredCapacity` and the `CameoBookingRequest` / `CameoBooking` types straight from `src/core/cameo*.ts` and
   `types.ts`, because `src/core/index.ts` does not export the cameo slice. The adapter already imports `tuning.ts`
   directly. Integration item for the core owner: export them from index.ts, then switch those import lines.
3. Unit premises (each throws by name if unmet): the four legacy pickers find an eligible person on `booked` while
   the roster's only writer is seated (a freelance writer must exist at about week 1881); the guest scan finds at least
   one eligible person within the 200 most famous; the cap check runs only when three or more are eligible; the
   sequel's guest completes in week W2+4 and the release writes its career record (as the cameo lane proved for its own
   route).
4. Timing: the route costs about 7 s at collection (cameo lane: collect 6.94 s), plus about 20 ticks for the original
   and the sequel. Review-step renders run up to 200 cameo quotes and one quote per choice; App-mount style timings are
   unmeasured under the 30 s ui `testTimeout`.
5. E2E premises: the imported 1872 save renders the Dashboard with legacy assembly (`openAuthoritativePackage` returns
   `legacy`); save size through `fill` is unmeasured; Playwright builds the route at collection in the runner and again
   in the worker; cash covers the second greenlight with the default middle marketing rung and any freelancer fees the
   first-eligible picks bring; no interrupting screen beyond newspaper and release list appears in about 20 advances.
6. Existing suites: the Review step now always renders two more cards (on week-0 worlds, "this picture is an
   original" and the unlock banner). No existing Assembly test queries a role or text those cards add (checked by grep
   for status/alert/radio/checkbox/combobox queries), and `AssemblyFormationReceipt` counts greenlight calls, not their
   arguments. A full ui run is still the evidence.
7. Lot surfaces: the cancel control and outcome section live on the Dashboard and the release screen. The Studio Lot
   workspace reuses the same Assembly, so the choice and guest panels appear there too; the Lot's own production views do
   not show bookings yet.

## Skipped, and when to add it

- Search or paging over guests: the scan stops at six eligible within the 200 most famous (`ponytail:` in the module).
- A persistent property page: outcomes show on the release card; the Review panel shows current meters. Add a property
  view when players need lineage after the release screen closes.
- Hook minting (`mintSubProperty`) and spin-off authoring: out of this slice; spin-off choices appear only for hooks
  that already exist.
