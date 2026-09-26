# 929 — independent C.2-RM declaration-body measurement producer

2026-09-26. Prepared by the independent test owner at published source
`12485a3c491f52c817cf50e86ca86f6786fa396b`. **Not executed.** Full core record 927 is
still active; every consumed source file and HEAD remain frozen. Only this report
and `929-c2rm-declaration-probe.ts` were authored. Parent owns execution after 927
closes, result attribution and any later release of test maintenance.

Frozen producer SHA256 (read-only file hash, not a producer execution):
`659c211f15390961c33bf58376e1a414b335528e4d930666ebea606e569b91b8`.

## Purpose and procedure

The exact positive-output test in `tests/bridge-contract-generator.test.ts:627`
pins declaration bodies, not generated file headers or schema JSON. F10 and F11
each pass the entire current `BRIDGE_SCHEMA` to `generateCsharpTypeDeclarations`.
Their existing `2f2fefaa…` literal was measured for projection50 and remained valid
through 51. Contract 875 requires new projection 52 DTOs and fields, so a changed
whole-schema declaration body has a specific source explanation. This report
does not supply or infer a replacement hash from a failing assertion.

The producer covers the same eight positive fixtures as the existing pin test:
F01, F02, F03, F04, F09_ARRAY_ITEM_UNION, F10, F11 and F12. F05–F08 and the two
negative F09 variants exercise refused schemas; they have no successful body to
hash and are not positive fixtures. No negative declaration behavior is changed.

For each positive fixture, the producer renders twice and refuses unequal bytes,
then prints the SHA256, UTF-8 byte count, original expected literal and exact
equality result. It refuses any movement in F01–F04, positive F09 or frozen F12.
F10/F11 must have identical hashes and counts and must differ from the previous
whole-schema body. No replacement hash is hard-coded into the producer.

The output also names source HEAD, projection, Node/platform/architecture, the
producer's own SHA256 and hashes of the generator, canonical/DSL/schema inputs,
fixture definitions and original pin-test source. It checks those input hashes,
HEAD and its own bytes again before reporting results. The parent recorder still
owns the complete consumed-source stability check; this local input list is not
represented as an exhaustive transitive import graph. HEAD is explicitly required
to remain the published 12485a3c source.

Run from the existing repository root, after the parent closes 927:

```sh
node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/929-c2rm-declaration-probe.ts
```

The producer performs reads and writes only to stdout. It does not invoke Vitest,
regenerate checked-in outputs, edit test expectations or create fixture files.
Any later pin update must copy measured literals from the recorded producer output
under explicit parent release; the actual test must retain independent literals.

## Source explanation required by 875

The following projection 52 declarations/fields implement 875's published contract:

| Source declaration | Added members or new type |
| --- | --- |
| `StudioRetirementExtension` | New issuer, viewer eligibility, exact term and start/end DTO. |
| `StudioMarketCaseSnapshot`, `StudioMarketCaseRow` | `variant`, `soleIssuerStudioId`, `retirementExtension`. |
| `StudioPersonLifecycle` | New status/profession, age planning, actual dates/labels and extension-history DTO. |
| `StudioAlumniEmployer`, `StudioAlumniFilmographyRef`, `StudioAlumniEmploymentRef`, `StudioPersonAlumni` | New recorded employer, routes, role-credit accounting and retirement disclosure DTOs. |
| `StudioPersonProfileSnapshot` | Required `lifecycle` and nullable `alumni`. |
| `StudioRosterRowSnapshot` | `lifecycleStatus`, `lifecycleLine`. |
| `StudioRelationshipBlock` | `asOfWeek`, `asOfLabel`, `historicalTierNotice`. |
| `StudioIndustryPerson` | `lifecycleStatus`, `lifecycleLine`, nullable `retiredWeek`. |

Definitions are in `bridge/schema/bridge-schema.ts` around 2499–2580 and 2733–2811;
the Industry person fields are in `bridge/schema/industry-schema.ts:135`. They
are registered in the shared definitions map. These new classes and members are
the concrete declaration-body change, independently of projection header text.
Market attention cause additions, the Alumni view and the Finance retirement kind
also widen the schema vocabulary; their string enum changes do not by themselves
explain additional C# members. Core Calendar presentation and the live writer
validation correction are not claimed as new bridge DTOs.

Read-only diff inspection of 697a6039 through 12485a3c found schema edits but no
changes to `scripts/bridge-contract-csharp.ts` or
`tests/fixtures/bridge-contract-union-fixtures.ts`. F01–F04/F09 use their local
fixture schemas; F12 uses its frozen P05 subset. Their unchanged hashes must be
measured, not assumed. F10 and F11 share the current schema object, so their names
do not restrict either fixture to one quote/command union.

## Evidence limit and handback

Authoring and static source inspection only. No producer, generator, test,
typecheck or gameplay probe was run by this specialist. No declaration pin or
production source changed. New hashes and byte counts remain unmeasured until
the parent records this producer after 927 closes.
