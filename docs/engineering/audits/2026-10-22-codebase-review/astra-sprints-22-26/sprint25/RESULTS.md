# Sprint 25 — the minimum native client (2026-10-30, 09:33 CDT to 09:36 CDT, BLOCKED/PARTIAL)

Entry: ENTRY.md. Engine p18-season-20261028 at 6ddeeb00 (unchanged by this sprint); Unity sprint15-consumer-20261028 at e7dcfc3 (unchanged, STATIC-UNRUN). No tag of its own: the Sprint 24 checkpoint tag covers the engine state; the Sprint 26 candidate names the pair.

## Status

BLOCKED on this host for everything §7 calls native progress (compile, EditMode, PlayMode, build, attestation, route verification on real input, focus and Back/Keep paths), for the reason recorded once in astra-sprints-22-26/ENTRY.md. PARTIAL for the disjoint static preparation below. No native evidence is claimed; STATIC-UNRUN is not executed evidence.

## Executed here (not native evidence; the pair's standing on the final engine)

| Check | Result |
|---|---|
| Bridge typecheck on engine 6ddeeb00 | 0 (local/s25-typecheck-bridge.log) |
| Bridge contract check (the generator's schema, DTOs and manifest match the engine's committed generated/unity copies) | 0, three files verified (local/s25-check-bridge-contract.log) |
| Bridge contract fixtures check (generated union fixtures) | 0, verified (local/s25-check-bridge-contract-fixtures.log) |
| The engine's generated Unity files compared byte for byte with the Unity worktree's copies at e7dcfc3 | StudioBridgeDtos.Generated.cs: identical project-studio-bridge.contract-manifest.json: DIFFER () StudioBridgeUnionFixtures.Generated.cs: identical (local/s25-pair-cmp.log) |
| CF09 pair seal | not rerun: no contract change since 901b9b55 × e7dcfc3 PASS (Sprint 22); the two checks above are the executed statement that 6ddeeb00 still fits e7dcfc3 |

## The minimum-route matrix at e7dcfc3 (read from bridge/session.ts and Assets/Studio/Runtime; a work list, not progress)

| Adopted minimum route (§7) | Engine action | Bridge | Unity consumer | Tested where |
|---|---|---|---|---|
| Confirmation (two-gesture binding, option identity) | `intentConfirmation` kinds and actions (Sprint 20, 22) | projection 70, `confirmation` none/required on every option | `StudioBridgeClient.ConfirmedIntent` + `.DisplayedIntent`; release memo arming (Sprint 22) | engine: bridge-astra20 and p15b5-loan-choice; Unity: EditMode `StudioConfirmedIntentTests` STATIC-UNRUN |
| Rights inspection (disclosure) | `requestDueDiligence` | quote family `diligence` | generic option rendering only (DTO kind present; no bespoke surface) | engine: bridge-p16 suites; browser: astra18, astra24-acquisition |
| Acquisition (quote at the ask, close) | `absorbStudio` | quote family `absorption` (quote age policy) | generic option rendering only | engine: p16c-acquisition, p16-absorption-continued-production (+ Sprint 24 calendar pin); browser: astra24-acquisition |
| Estate bid and the closed estate's disposition | `submitEstateBid`; desk view `closedEstates` (Sprint 24) | **no intent, no projection** | **none** | engine: p16-r2-estate, p16-estate-join; browser: astra24-estate |
| Title sale and offers (make, accept, reject, withdraw), licences | `makeRightsOffer`, `acceptRightsOffer`, `rejectRightsOffer`, `withdrawRightsOffer`, licence grants | **no intent, no projection** | **none** | engine: astra18-rights-desk, p16 suites; browser: astra18 |
| P17 continuation and featured inputs | continuation and featured-booking actions; `cancelFeaturedBooking` | `cancelFeaturedBooking` confirmation kind only | continuation authority helpers (`IsExactFoundingContinuationAuthority`, saved-copy continuation); no featured-booking surface | engine: p17 suites; browser: p17-continuation journey |
| Bounded TV commission, cancellation, settlement | `commissionTvSeason`, `cancelTvSeason`, `settleTvObligations` (+ Sprint 23 estate claims) | quote family `tvCommission`; `cancelTvSeason` and `settleTvObligations` confirmation kinds | generic option rendering only (DTO kinds present) | engine: p18 suites; browser: p18-season, astra18 |
| Loan (quoted commit; the shortcut confirmed) | `takeLoan` | quote family `loan`; shortcut confirmation=required (Sprint 22) | loan quote snapshot and request (`StudioLoanQuoteSnapshot`, `StudioQuoteLoanRequest`) | engine: p15b5-loan-choice; Unity EditMode STATIC-UNRUN |
| Release commit (confirmed) | `commitPictureToRelease` | confirmation=required (Sprint 22) | release memo arming and confirm (Sprint 22) | engine: bridge-astra20; browser: dashboard-release-commit, smoke; Unity EditMode STATIC-UNRUN |
| Research cancellation (one gesture, decision A) | `cancelResearch` | no confirmation (by decision) | research memo | engine: bridge-astra20 |

Reading: two of the §7 minimum routes have no Bridge intent at all (estate bids; title sale and offers), so the native counterpart cannot reach them whatever host runs it; the acquisition, disclosure and TV routes exist on the wire but have no bespoke native surface beyond the generic displayed-intent list. These are the first items for a capable host, in that order, and they are design work the Owner has not yet assigned (the Bridge's rights projection does not exist); they are recorded here, not started.

## Not claimed

Any native compile, test, build, run, attestation or acceptance; that the generic option rendering is usable for acquisition or TV without a bespoke surface; that the STATIC-UNRUN pairing substitutes for the executed run (§3 E).
