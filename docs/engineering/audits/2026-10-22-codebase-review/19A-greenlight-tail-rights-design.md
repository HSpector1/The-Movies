# 19A: greenlight tail, film-to-property reader, commissioner party

Decision 19A settles audit findings C-09 and C-07 before Save49 freezes. Line numbers name the P16 candidate (K/p16, byte-identical to current200 `PATCH.diff`); the branch at `87c23188` has no `rights.ts`. Nothing was run.

## 1. The greenlight tail

The candidate's `applyGreenlight` calls `mintStoryPropertyAtGreenlight` for every player greenlight (`actions.ts:606-609`). The P16 rebase moves the tail into one `rights.ts` writer, `recordGreenlightRights(state, { studioId, production, week, continuation })`, where `continuation` is `{ parentPropertyId, use }` or null.

- **Link.** When `continuation` is set and the production's concept did not found the parent, it calls `linkContinuationAtGreenlight`. The parent's holder keeps R1 and the parent gains a work link; the licensee gains no R1, so `story-property:<c2>` never exists. At release `mintFilmTitleAtRelease` titles the film under the parent, and the releasing studio holds its R2.
- **Mint.** Otherwise it calls `mintStoryPropertyAtGreenlight` unchanged. An original concept founds its property, with the greenlighting studio as creator and R1 holder; a concept that already founded one links to it under that property's remake authority. A continuation request on the parent's own concept takes this branch.

After a link the sequel's concept belongs to the parent. A later plain greenlight of that concept is a remake of the parent: `greenlightRightsRefusal` and the mint hook find the parent through any released film or live production of the concept, ask for remake authority and link. Today the hook mints a fresh, unencumbered property.

The refusal precedes any write (P16 r2 F23/F62). Extract `linkContinuationRefusal(state, input): string | null` from `linkContinuationAtGreenlight`, keeping its sentences, and give `greenlightRightsRefusal` the same `continuation` input. P16 passes null; P17 passes its quote's property and use. `advanceRightsWeek` already skips rival work a parent links.

C-09 adds no Save49 key: `workLinks` and `filmTitles[].propertyId` carry the link, and the validator already admits a film titled under its parent (`rights.ts:1006-1008`).

## 2. Film-to-property reader

`storyPropertyOfWork(state: GameState, workId: string): string | null`, in `src/core/rights.ts` beside `resolveTitles`, exported from `src/core/index.ts`. It returns the one resolved property whose `workLinks` contain the production or film id, null when none does, and throws naming both when two do; the validator gains that rule. P17 binds `ContinuationRights.storyPropertyOf` to it in `continuationRightsFor`, so the third installment finds the parent through the second.

## 3. The commissioner party

No commission creates a property. P18 contract §3 names "one already-existing P16 property", and the draft's `admitTvCommission` mints nothing. If a later commission founds a television original, the producing studio mints it through the P16 hook and holds R1. The commissioner `p18-limited-season-commissioner-v1` never holds R1 or R2.

The commissioner holds one instrument: an exclusive R4 licence for use `televisionDistribution`, granted by the R1 holder over `[C, C+72)`. The producer exercises `televisionProduction` through its title or an R4 licence from the holder. Two uses keep the commissioner's exclusive term off the producer's query and out of `overlapsExclusive` (`licence.ts:71-74`).

Save49 needs no new key: `Licence.granteeId` is already a string party reference, and no Save49 file holds an R4 row while `R4_CONSUMER_LIVE` is false. The rebase fixes the meaning now, sparing P18 a rights-root converter. `R4_USES` becomes `televisionProduction`, `televisionDistribution`, `merchandise`. `rights.ts` owns `RIGHTS_COUNTERPARTY_IDS`, and the validator (`rights.ts:1145`) admits that id only as grantee of an exclusive `televisionDistribution` licence. `validateRightsRoot` takes the licence law as a parameter, so the frozen Save49 validator keeps refusing R4 rows after P18 turns its law on. Offers stay studio-only (`assetSale.ts:87`).

## 4. RED witness, written first

`tests/p16-continuation-link.test.ts` drives the rights seam in the P16 rebase; P17 reruns it through `greenlightScriptProject`. R is a rival, P the player.

1. **R1 title.** R greenlights and releases F1 (concept c1); `advanceRightsWeek` mints `story-property:c1` (P1), holder R. P buys an exclusive R3 `sequel` licence on P1 for `[s, e)`, covering F3's greenlight plus `PRODUCTION_TICKS`, through the real offer route. Admitted: `permissionFor` permits P's `sequel` via the licence and refuses P's `remake` with `noAuthority:R`.
2. **Licence sequel.** P greenlights F2 (concept c2) with `continuation: { parentPropertyId: P1, use: 'sequel' }`. Admitted: P1 links F2; no `story-property:c2` resolves; `storyPropertyOfWork(F2)` is P1; R still holds P1; after release F2's title names P1 with R2 holder P; `makeSave` passes. Without the licence it refuses: `applyActions: greenlight rejected — rights: P has no sequel authority over story-property:c1 (noAuthority:R)`, writing nothing. Today's tail mints `story-property:c2` to P, failing the first assertion.
3. **Third installment.** Inside the term, P greenlights F3 (concept c3) citing `storyPropertyOfWork(F2)`: admitted, linked to P1. At week `e` it refuses with `(expired:<licenceId>)`. A plain greenlight of c2 refuses: `rights: P has no continuation authority over story-property:c1 (noAuthority:R)`. With P17 bound to the reader over today's tail, F3 refuses: `continuation refused: rights authority names story-property:c2 for F2, but the lineage records story-property:c1`.

## 5. The P16 rebase

Preserve `linkContinuationAtGreenlight`, the linked-work skips in `advanceRightsWeek` and `authenticTitles`, the validator's continuation title rule and refusal-before-write.

Change:

- the tail into `recordGreenlightRights`, with `linkContinuationRefusal` and the concept rule;
- add `storyPropertyOfWork` and its validator rule;
- split R4 uses, add `RIGHTS_COUNTERPARTY_IDS` and the validator's law parameter, and update the R4 cases in `tests/p16-r2-authority.test.ts`;
- re-apply the tail by hand; the branch's `actions.ts` moved 126 lines since `2c3024e2`.

## Assumptions

- The licensee is the player; only the player's greenlight carries a P17 request.
- A P17 continuation brings its own concept, as `linkContinuationAtGreenlight`'s comment states.
- P18's commission mints the commissioner's licence through `mintLicence` at acceptance with a zero `licenceGrant` transaction; the P18 agreement carries the money. The Owner may set another consideration.
