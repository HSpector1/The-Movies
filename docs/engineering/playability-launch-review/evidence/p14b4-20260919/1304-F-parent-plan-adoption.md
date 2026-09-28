# 1304-F: parent adoption of R2, with the release-copy defect and one combined version bump

The parent read frozen [1304-A](1304-A-release-busy-set-proposal.md) and independent
[1304-B](1304-B-release-busy-set-plan-review.md) (KEEP with three amendments) in full. Adopt A's law (production-seat
set, founding-draft refusal, research seats excluded, credited-only writers not seated, engine and Bridge through one
refusal) with the amendments below. A stays byte-frozen.

## Amendments

1. **Projection bump (B Q5, DEVIATES).** A's item 7 is wrong for the Bridge: `foundingDraft` and
   `seatedOnActiveProduction` join `CONTRACT_REFUSAL_KINDS` (`bridge/schema/bridge-schema.ts:1753-1764`), which the
   generated schema enumerates for `StudioContractQuoteSnapshot.refusal` (`:2139`). By the `underMarketCase` precedent
   (projection 42) that requires regenerating `project-studio-bridge.schema.json`, bumping `PROJECTION_VERSION` and the
   schema id, and registering the outgoing projection55 schema id as a supported prior. The engine and save stay
   unchanged by R2 itself.
2. **Disposition record (B Q1).** The P14A.1 T2 ruling at `plans/P14-HEADLESS-PLAN.md:1077` reads "R2 DEFERRED
   (release refused for the busy set / founding; companion recommendation not in A.1's plan text) — recorded for a
   follow-up." This increment is that follow-up.
3. **Schema test (B Q6).** RED adds one Bridge leaf asserting both new codes in the generated schema enum and the
   projection literal moving to its new value, mirroring the `underMarketCase` coverage.
4. **Release confirmation copy (B Q4 note; parent-confirmed defect).** `bridge/contract.ts:303` tells the player
   "Pays $X in termination now (half of the $Y still guaranteed through Week Z)". The charge has been
   `weekly × min(remaining, 26)` since P14A.1 (`src/core/employment.ts:197`), so "half" is false at every remaining
   term except exactly 52 weeks: all of it at 26 weeks or fewer, 25% at 104. Companion §3.4 direction 2 selects two
   exact branches (cap applies / no cap). The copy is rewritten from `releaseDisclosure`
   (`src/core/talentMarket.ts:628`), which already computes `capApplies`, the charge, remaining weeks and guaranteed
   compensation. The dollar amount was already correct; only the explanation changes. It is string content inside an
   existing field, so it adds no schema change beyond amendment 1. Tests that pin the old sentence are attributed as
   intended copy changes by cause.

## One production increment for R2 and R3

R3 (rival release of its own employees under the same law, companion §3.5 E4, §3.6, R3) needs a `termination` rival
money kind, which changes the exact-key finance period and therefore the save version. R2 needs a projection bump now.
Every live-version bump makes the literal pins that 1301 just corrected stale again; 1301's classification files
already identify each live row. To pay for one sweep instead of two, the parent lands R2 and R3 as one production
increment with a single save bump (41) and a single projection bump (56), followed by one reviewed pin sweep that
reuses the 1301 CHANGE rows and adds any row the new version surfaces. R3's plan is 1305-A. R2's RED tests can be
staged now; its implementation waits for 1305 adoption so both land together.

If R3's review exposes a genuine product decision that blocks it, R2 proceeds alone with its own projection bump
rather than waiting on an open question. The parent records that choice if it happens.

## Order and ownership

1302/1303 broad baseline closes first (its failures are attributed against unchanged production). Then: 1304-C RED
staging (test-author: new core and Bridge tests plus the neighbor list of existing `releaseTalent` callers that
release a seated person, release during founding or pin the old copy), 1304-D review, parent RED run. Parent is the
production writer. Unity/native and Owner access stay deferred.
