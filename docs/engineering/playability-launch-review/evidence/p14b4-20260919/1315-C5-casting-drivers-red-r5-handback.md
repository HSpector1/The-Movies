# 1315-C5: applying the independent review's REFINE findings

Mode STAGE RED (test source only), repo `/Users/zacheryspector/The-Movies-headless-program` at HEAD
`10ebc69ab3c34d1f1c42b1cc3074533e470962e7`, branch `wip/headless-program-20260916-ts` (unchanged from the
review's own HEAD except for the review file itself landing). Read `1315-D-casting-drivers-red-review.md`
in full before editing. Edited only the two files the parent had already copied unchanged into
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage5/tests/`; the other three
(`p14b9-casting-copy.test.ts`, `p14b9-casting-readers.test.ts`, `p14b9-save-v42.test.ts`) confirmed
byte-identical to `1315-stage4` via `diff -q`, untouched. No production code, fixture, or any earlier
staged directory was touched. No `vitest`/`tsc`/`vite-node`/`node` was run (hard limit).

## Edit 1 — `p14b9-casting-competition.test.ts`, P-dedup leaf

Added the reviewer's line verbatim, immediately after the existing `expect(thisProduction).toHaveLength(1)`:

```ts
expect(driversOf(w.afterDedup, a, b, 'repeatedCompetition').filter((dr) => dr.ref === w.pDedup)).toHaveLength(0)
```

Closes 1315-D Check 2 gap 1: a wrong implementation could dedupe the `castingCompetitionLost` driver to
one-per-pair correctly while computing the repeat accelerator's `n` from an internal per-slot count
(reaching 2 within the same write, since the pair occupies two slots), minting a spurious
`repeatedCompetition` the prior leaf would not have caught.

## Edit 2 — `p14b9-casting-expiry.test.ts`, two leaves

**New leaf** ("says nothing for a roster counterpart whose real edge is below Inseparable"), per the
coordinator's exact design rather than the reviewer's literal suggestion: `s =
withInseparableVariant(w.state, w.cast.director, w.cast.lead)` only (antagonist's edge left natural,
un-elevated). Route premises asserted first: the antagonist-lead edge exists, `currentTier(edge,
EXPIRY_WEEK)` is not `'Inseparable'`, and the antagonist's `endWeekExclusive` is greater than `EXPIRY_WEEK`.
Then: `detail` contains the director's name and does not contain the antagonist's name. The reviewer's own
suggested fix (add `not.toContain(supportName)` to the existing naming leaf) is CONFOUNDED — `support`'s
committed term (52) already ends before the lead's expiry (60), so the committed-term condition excludes
it regardless of tier, and a broken tier gate would still pass; `antagonist` (real edge, long term)
isolates tier as the only possible reason for exclusion, closing 1315-D Check 2 gap 2 for real.

**INTERPRETATION leaf made differential**: now also elevates the director
(`withInseparableVariant(w.state, w.cast.director, w.cast.lead)`) alongside the existing support
elevation, and asserts `detail` CONTAINS the director's name in addition to the existing
`not.toContain(supportName)`. The INTERPRETATION label is kept, citing 1315-D Check 4's ruling that the
committed-term reading is lawful and in fact necessary (not an invented rule) in the file's header and the
leaf's own name.

Both edits' route-premise reasoning (natural closeness, drift-safety, term lengths) reuses facts already
established and verified across 1315-C2/C3/C4's own handbacks and 1315-D's own Check 3/5 — no new
uncertainty introduced.

## Predicted result per leaf, unchanged engine

- P-dedup leaf: unaffected by the addition — still fails for its existing stated reason (the route itself
  throws/produces empty arrays under the missing `RELATIONSHIP_COMPETITION_DELTA`), same as before 1315-D.
- The two ALREADY-EXISTING expiry leaves (acceptance, naming): unaffected, same predicted results as C4.
- **New leaf** ("says nothing for... below Inseparable"): FAILS on the unchanged engine — the director-name
  assertion (`toContain`) fails, since `bridge/finance-upcoming.ts` puts no name in `detail` yet. This is a
  genuine RED (not vacuous): the route premises (edge exists, tier below Inseparable, term past expiry) all
  hold true on the UNCHANGED engine too, since they are facts about the route, not about the untested law.
- **INTERPRETATION leaf**: now FAILS on the unchanged engine, on the same director-name assertion — no
  longer vacuous, per the coordinator's own stated prediction.
- On a correct Save42 implementation: all four expiry leaves and the P-dedup leaf's new assertion pass.

## Summary

Applied both of the independent review's REFINE findings: the P-dedup leaf now also checks for a spurious
`repeatedCompetition` driver, and "says nothing for a lower tier" is now tested with a real, un-elevated,
long-term edge (antagonist) rather than only a no-edge stranger (bystander) or a confounded short-term
counterpart (support); the INTERPRETATION leaf is now a genuine differential RED instead of a vacuous pass.
Files: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage5/tests/
p14b9-casting-competition.test.ts` and `.../p14b9-casting-expiry.test.ts` edited; the other three files
byte-identical to `1315-stage4`. Handback at
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-C5-casting-drivers-red-r5-handback.md`.
