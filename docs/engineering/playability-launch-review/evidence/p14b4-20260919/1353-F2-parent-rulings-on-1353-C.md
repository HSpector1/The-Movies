# 1353-F2: parent rulings on the P15C RED (1353-C) and adoption of LegacyFacts

[1353-C](1353-C-p15c-red-handback.md) staged 56 leaves:
- **Wave R:** 6 retention guards. They pass by design, and each one went red under an injected defect that was then
  reverted and hash-confirmed.
- **Wave 1:** 50 leaves, all failing at RED.

The author proposed `LegacyFacts` and flagged five open points. The parent adopts the proposed shape with the
amendments below. They govern the RED revision 1353-C2 and production.

## 1. Every row fact carries its source domain

A manifest ref is `{domainId, id}`. Its `domainId` must name one of the v1 domains of 1353-A §5.2, so that RED 10 can
check each ref against its own domain's high-watermark.

The pure law has no role flag, so it cannot tell a player film from a rival film. The adapter tags each row instead:

| Fact | `domainId` |
|---|---|
| `LegacyFilmFact` | `'playerFilms'` or `'industryFilms'` (a field) |
| `LegacyCareerEventFact` | `'playerCareerEvents'` or `'industryCareerEvents'` (a field) |
| adoption | `'technologyAdoptions'` (fixed) |
| technology | `'technologyCatalogue'` (fixed) |
| ranking snapshot | `'powerRanking'` (fixed) |
| condition event | `'corporateCondition'` (fixed) |
| market assessment | `'marketAssessments'` (fixed) |

The tag is data provenance, not a role. Relabelled facts carry their tags along, so the owner-swap leaf still holds.
RED 10 pins exact `domainId` values on the refs it reads. `'playerRuns'` supplies the run status of player films
through the adapter, and no v1 ref cites it.

## 2. Lens count keys (at most 4 per lens, 1353-A §5.2)

| Lens | `counts` keys |
|---|---|
| `catalog` | `releases`, `settled`, `inReleaseAtBoundary`, `authoredPre1920` |
| `people` | `credited`, `discoveries` |
| `technology` | `operationalAdoptions` |
| `ranking` | `rankedQuarters`, `quartersAtFirst`, `bestRank` |
| `financialBand` | `inTheRed`, `strained`, `stable`, `thriving` (quarters per band) |
| `market` | `assessed`, `underPressure` |
| `resilience` | `warnings`, `distressEntries`, `returnsToStable`, `closures` |
| `awards` | none; the status is always `notRecorded` |

For each lens, one leaf asserts the key set exactly and one value on a fixture.

## 3. Bounds on archetypes and lenses

The static invariant is accepted. `LEGACY_ARCHETYPE_IDS.length === 8` and `LEGACY_LENS_IDS.length ≤ 12` hold, and no
caller can supply an archetype or lens identity, so a ninth or a thirteenth is structurally impossible. A runtime
refusal of a malformed persisted manifest belongs to the Wave 2 validator, and Wave 2's RED adds it.

## 4. Domain status rules (RED 13)

| Domain's input | Status |
|---|---|
| absent, or `recordedFromWeek` null | `notRecorded` |
| `recordedFromWeek ≥ B` | `notRecorded`, since no row falls before B |
| `recordedFromWeek` after a studio's `enteredWeek` and below B | `limited` for that studio, carrying the week |
| otherwise | `complete` |

A row dated before its domain's `recordedFromWeek` refuses. Whether the Legacy root freezes when the root itself was
recorded from B or later is a Wave 2 question, which 1353-A §5.1 and Q3 of 1353-F already answer (no official
manifest). Wave 2's RED carries it.

## 5. A film with no career events (RED 15)

Both effects hold:
- The film has no audience score, so no decade counts it.
- The studio's `audience-institution` result lists that film's career-event domain in `limitedBy`, because its
  audience evidence is incomplete.

The leaf asserts both. The narrower reading alone would hide the gap from the dossier.

## Accepted as authored

- The rest of `LegacyFacts`: `boundaryWeek` on facts; genre and audience score taken from career events first;
  credits only on authored films; optional sibling roots, where absent means `notRecorded` and empty means none.
- The `120_000` ms budgets of Wave R, with the measured 85-90 s first-guard cost and the memoized campaign.
- Findings 1 and 2 are adopted: stateless injections under the roster-wall harness; the `scriptDevelopment.ts:811`
  invariant as a second line of defence for `releasedFilms`.

## Next

RED 1353-C2, then a parent dry run and an independent RED review (1353-D).
