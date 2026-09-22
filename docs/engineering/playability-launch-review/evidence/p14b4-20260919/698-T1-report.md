# 698-T1 — the P14B.6 read-model RED: handback

Authority: brief `698-T1-b6-red-brief.md` (record 697 NEXT), scope record 687, Owner ruling 4 of
record 683. Test-author only. Source: worktree `/Users/zacheryspector/The-Movies-headless-program`,
branch `wip/headless-program-20260916-ts`, HEAD `43817117`, tree clean at authoring time.

## Deliverable

| item | path | lines | sha256 |
|---|---|---|---|
| the RED suite | `tests/bridge-p14b6-relationship-read-models.test.ts` | 839 | `4c3f86c0769284d9ee60e6a304f0bdcfc181755fb8a936cd735557e6e7edcbf0` |

No production file, helper, fixture, generated artifact, timeout, validator or existing test was
touched. `git status --porcelain` shows one added path from this work:
`?? tests/bridge-p14b6-relationship-read-models.test.ts`. Nothing was committed.

Disposable verification artifacts (gitignored `out/` tree, NOT production, NOT the writer's
implementation, will not survive a clean):

| path | sha256 | purpose |
|---|---|---|
| `out/p14b6-stub.ts` | `a74680490ddc62526f4dace7b80faba394eb62337ed1d3437b608b47bb68e3b2` | a correct implementation of the pinned contract plus DTO shims |
| `out/p14b6-verify.probe.ts` | `29f95f53b853eb12e41f79e825e9df1e9540ba7a58daefcfe9686615a17b3cb1` | the RED suite with its imports repointed at the stub |
| `out/probe.vitest.config.ts` | `a7df802bac8250fba8a51fc837e35da6bddde238b5f1925cbcf710435f8a1d5b` | a config whose `include` reaches `out/**/*.probe.ts` |

## The exact commands

```
npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts --reporter=verbose
npx vitest run tests/bridge-p14b5-relationships.test.ts
npx tsc -p tsconfig.bridge.json --noEmit
npx vitest run --config out/probe.vitest.config.ts          # the disposable stub verification
```

## Actual result, family by family (run, not predicted)

`npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts` — **24 tests, 18 failed,
6 passed**, 5.4 s.

| family | cases | result | RED kind |
|---|---|---|---|
| 0 PREMISES (GREEN control) | 5 | 5 pass | n/a — proves the worlds build |
| 1 PROFILE BLOCK | 2 | 2 RED | resolution |
| 2 DISCLOSURE | 4 | 4 RED | resolution |
| 3 DRIVERS TEXT / forward constraint | 2 | 2 RED | resolution |
| 4 CASTING CHEMISTRY ROWS | 1 | 1 RED | resolution |
| 5 CASTING WARNING | 1 | 1 RED | resolution |
| 6 SHARED-CREDIT COUNTS | 3 | 3 RED | resolution |
| 7 LEAK LAW over the new DTOs | 1 | 1 RED | resolution |
| 8 WIRE | 3 | 3 RED | **value** |
| 9 COMPATIBILITY | 2 | 1 RED, 1 pass | **value** |

RED by resolution (14 cases): `AssertionError: RED BY RESOLUTION: bridge/relationships.ts does not
exist yet`, raised by `requireModule()` at `:162` before any block is read.

RED by value (4 cases), with the actual numbers observed:

- `expected 48 to be 49` — `PROJECTION_VERSION` (family 8, twice: the literal and the checked-in
  `x-project-studio.projectionVersion`).
- `expected undefined to be 'projection-v48'` — `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(sha256:00c0075b…)`.
- `expected null to be 4` — `loadBridgeRuntimeCheckpoint(genuine-projection48-runtime).migratedFromProtocolVersion`;
  the T0 fixture wears the RUNNING identity today, so it takes the current path, not the prior path.

Family 9's second case (`the 45 / 46 / 47 fixtures keep migrating exactly as they do today`) is
GREEN today and is a regression control, not a RED.

## Is the RED faulty or real? — verified, not asserted

Every case asserts module resolution first, which would hide a broken world builder behind the same
message. Two independent controls answer that:

1. **Family 0 (5 cases, all GREEN today)** re-measures every premise on unchanged source: W1 is week
   61 with 30 edges (24 rival-internal, 6 player), W2 puts both predicate boundaries on week 104
   with the week-61 edge standing, W6 offers a legal greenlight draft whose six seat pairs are all
   edgeless, the three staged roots are validator-admitted, and the landed leak probes pass.
2. **The disposable stub run.** With `out/p14b6-stub.ts` supplying a correct implementation of the
   pinned contract, `npx vitest run --config out/probe.vitest.config.ts` reports **24 tests,
   19 passed, 5 failed**. Every behavioural assertion in families 1–7 turns GREEN. The five that
   remain RED are exactly the five a stub cannot satisfy: the `$defs.StudioRelationshipBlock` parse
   (needs the schema), family 8's three version literals, and family 9's fixture-becomes-a-prior.
   No assertion in families 1–7 is faulty.

## Staged inputs, every one named

| id | what | why it could not be natural |
|---|---|---|
| **S1** | a `-4` `sharedFailure` row added to an edge the real write path minted | `RELATIONSHIP_FAILURE_DELTA` is 5 at this source and no artifact in the repo was minted at 4, so the real write path cannot produce a `-4`. This IS the resumed-campaign shape 694-C Q2 names. The `-5` beside it is the live constant. |
| **S2** | a Strained edge (closeness 42) between two seats of the casting draft | see "the natural route is untested" below |
| **S3** | a live world holding player credits with an EMPTY V31 root | exactly what `migrateToV31` produces; constructed rather than minted because no pre-V31 artifact in the repo holds a PLAYER shared take (measured: the projection-47 `savedSaveJson` migrates to 20 firstTakes, all rival) |

All three go through `makeSave` + `validateSaveV31` (the `p14b2-fixtures.ts:121` device) and are
asserted admitted in family 0. Everything else — the rival-internal edges, the player edges, both
predicate boundaries, the casting draft — is built by the engine.

## The natural route that is untested (family 5)

Reaching `pairChemistry(...).sign === -1` on a **player-castable** pair needs the pair below
closeness 45. Under the live constants a low-proximity pair (`+2`) needs three shared productions
each releasing below `RELATIONSHIP_FAILURE_CRITIC_SCORE`: 50 → 52 → 47 → 50 → 45 → 49 → 44. I could
not construct that inside this slice, and the blocker is measured, not assumed:

- `retentionFixture().outcomes` holds `prod-0052` ACTIVE at week 61 and **still active 60 ticks
  later at week 121**, with `state.studio.releasedFilms.length === 0` throughout. No fixture in this
  repo releases a player picture at all, so no player pair can reach even ONE `sharedFailure`.
- Rival pairs do reach `sharedFailure` naturally (e.g. `relationship-edge-0` holds two `-5` rows at
  week 61), but every such pair is rival-internal and therefore undisclosed by the very rule family
  2 pins — it can never be seated in a player casting draft.

So family 5's −1 is STAGED and the natural route is **untested**. The `-5` value itself is exercised
naturally (family 0 reads the engine-written rows); only its arrival on a *player* edge is staged.

## Findings the writer needs before starting

1. **BLOCKING NAME COLLISION — the block cannot be keyed `relationships`.** The landed leak law
   `tests/bridge-p14b5-relationships.test.ts:404-408` forbids the literal key form `"relationships":`
   on every serialized DTO, and `peopleProjection(...)` is inside the string it probes. A profile
   field named `relationships` would turn that landed test RED, which the brief forbids. The RED
   keys the block **`collaborators`** (schema `$def` keeps 687's `StudioRelationshipBlock`, which
   never appears as a DTO key). `BLOCK_KEY` at `tests/bridge-p14b6-relationship-read-models.test.ts:89`
   is the single constant to change if the parent prefers another lawful name. **`699-W-b6-writer-brief.md`
   does not state this and a writer following it literally will break the landed law.**
2. **The casting chemistry rows cannot hang on the board project snapshot.** `699-W` says "add the
   casting chemistry rows and the warning to the casting snapshot". A Ready screenplay's
   `StudioCastingProjectSnapshot` has `activeSlate: null` — there is no seating there, so the six
   `seatPairs` are undefined. The RED therefore hangs BOTH `chemistry` and `chemistryWarning` on
   `BridgeCastingQuoteSnapshot`, the only casting surface that receives the proposed seating (and the
   "casting confirmation" ruling 3 (iii) actually names). An in-flight production's `activeSlate` is
   a second lawful carrier; this RED deliberately does not pin it.
3. **`687` names a `scope` on the block; no authority defines its vocabulary.** `StudioTrustBlock`'s
   `scope` is `'person' | 'studio'`, which has no meaning for a tie. The RED does not pin `scope` and
   does not forbid it (the exact-key check is on ROWS only, which `699-W` enumerates identically).
   An Owner/parent call, not a writer call.
4. **A `hollywood === null` world has no `hollywood.employment` to apply the disclosure predicate
   to.** `managedStudio(...)` carries `relationships: []` and `hollywood: null` (measured). Casting
   rows are safe there — the seats are the player's own draft, so disclosure is not in question —
   but `relationshipBlockFor` must not throw or silently publish on such a state.
5. **`pairChemistry` calls `requireRelationshipsRoot`, which THROWS on a missing root.** Adding a
   `pairChemistry` call inside `castingProjection`/`peopleProjection` puts that throw on every
   existing consumer of those projections. Every state I reached carries the root, but the writer
   should confirm the legacy-v28 and founding-draft paths before landing.
6. **Nothing here requires new engine law.** Every value the RED pins is derivable at projection time
   from `pairChemistry`, `currentTier`, `state.relationships`, `state.hollywood.employment`,
   `state.firstTakes` and `state.studio.releasedFilms`. No driver kind, constant, policy, refusal,
   save state or RNG is needed, and no quality modifier is pinned anywhere.

## Existing assertions expected to move

None in any test file. Two non-test movements are expected and intended:

- `npx tsc -p tsconfig.bridge.json --noEmit` currently reports **exactly one** error, and it is the
  intended RED: `tests/bridge-p14b6-relationship-read-models.test.ts(160,29): error TS2307: Cannot
  find module '../bridge/relationships.js'`. It disappears when the writer lands the module.
  (`tsconfig.json` excludes `tests/bridge*.test.ts`, so `npm run typecheck` is unaffected.)
- `tests/bridge-p14b4-runtime47-compatibility.test.ts:40-80` and its exact-count pin at `:162` belong
  to the wire owner and must go 36 → 37 with `sha256:00c0075b…` in sorted position. The RED asserts
  the 37-member roster independently from its own literal list; it does not edit that file.

`npx vitest run tests/bridge-p14b5-relationships.test.ts` → **15 passed**, 37.5 s. The landed leak
law is GREEN and UNAMENDED.

## What this RED cannot establish

- It does not prove the natural casting-warning route exists (see above).
- It does not exercise an in-flight production's `activeSlate` as a chemistry carrier.
- It does not see a DRIFTED tier: record 679 measured that only one of four standard seeds exercises
  drift and none completes a return, and the worlds here run to week 121 at most.
- It does not pin a `RELATIONSHIP_RECENT_CAP` honesty line (687 risk 2): the brief did not name one,
  and inventing the copy would be unsupported.
- It does not run the full core, the full UI or the bridge contract generator; those belong to the
  parent on fixed source.
- Simulation only: the stub verification proves the assertions are satisfiable, not that the writer's
  implementation will be correct.
