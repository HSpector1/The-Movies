# 1176-A — Bridge test typing amendment

Frozen author handback against published `817d9e52a997a0d532f878602f4a8029e602ba80`. Only the two authorized test lines changed. No project code was evaluated, and no compiler, test, gameplay, probe, index mutation or commit was run by the author.

## Actual 1175 observation

Parent ran `node_modules/.bin/tsc --noEmit -p tsconfig.bridge.json` from 2026-09-27 15:54:04.542Z to 15:54:32.171Z (27.629 seconds). Child exit 2; fixedSource true; consumed diff empty at both ends; no untracked consumed source, signal or recorder error. There are exactly five diagnostics in four paths. No runtime result exists for the new Bridge leaves.

| Path / original location | Diagnostic | Attribution and disposition |
| --- | --- | --- |
| `bridge/people.ts:1048` | TS2322: `directingOpportunity` absent from response preference enum | Production schema/transport mismatch; unchanged by this test amendment. |
| `bridge/promises.ts:111` | TS2339: `seatClass` absent from `DirectorCountPredicate` | Production tagged-predicate narrowing; unchanged by this amendment. |
| `tests/bridge-p14b2-trust.test.ts:55` | TS2339: same unsafe `seatClass` read | Old expected-history oracle now reads the field only when `kind === 'castRoleCount'`. |
| `tests/bridge-p14p3-directing-promises.test.ts:516` | TS2339: `profiles` absent on the Talent projection wrapper | Snapshot access now uses `snapshot.snapshot.talent.talent.profiles`. |
| Same new-test line 516 | TS7006: callback `profile` implicitly any | Derivative of the wrong snapshot collection path; no explicit cast or `any` added. |

The direct `peopleProjection(bound.state)` result correctly exposes `.profiles` (`bridge/people.ts` returns `{ profiles, roster, attention }`) and remains unchanged. The snapshot bundle instead contains `StudioTalentProjection`, whose own `talent` holds `StudioTalentSnapshot`; the schema at 2885–2887 and 3272 supplies the extra nesting. The initial moving draft mistakenly changed the direct projection line; reviewer caught it before freeze or execution. That provisional change is fully reversed in this final patch.

The old trust oracle preserves existing cast-class and classless behavior: explicit cast predicates still return their recorded class; count-only predicates still return null. A Director predicate has no class, so the discriminant prevents accessing a nonexistent field. No future role disclosure field or new semantic expectation was added.

## Exact frozen changes

The manifest records both complete preimages/postimages and exact one-occurrence substitutions. Reversing each sole substitution reproduces its complete published test byte-for-byte. All other test bytes—including declarations, assertions, fixture pins, counters, routes and 60,000 ms P3 timeouts—remain exact. The three-leaf runtime argv remains:

```text
node_modules/.bin/vitest run --project core tests/bridge-p14p3-directing-promises.test.ts
```

The next compiler, production corrections, publication and eventual runtime execution belong to the parent. This amendment does not claim a compiler PASS or repair either outstanding production diagnostic. Frozen 1174 source/patch/manifest/A and the original 1175 raw/JSON records are retained unchanged.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `tests/bridge-p14b2-trust.test.ts` before | 32075 | `4f4d5f5b98678ed1fd936b12302edc321109ab9a7ff316e261be591410c438ad` |
| `tests/bridge-p14b2-trust.test.ts` after | 32115 | `7c9535be07f532d1d424525e8e1dd14ea9be2a3bd148773bb8b394772da197e8` |
| `tests/bridge-p14p3-directing-promises.test.ts` before | 45261 | `24ea206728b22f2916b68959ea3060448d65c3ab919ea24c05330aa12d4bb12d` |
| `tests/bridge-p14p3-directing-promises.test.ts` after | 45268 | `8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d` |
| `1176-p3-bridge-type-amendment.patch` | 2081 | `1f32cecce693793dd945073dec7efe147d3cdecdd236b701367f8b353303de62` |
| `1176-p3-bridge-type-amendment-manifest.json` | 2547 | `447dacb3d91b0489fe0e5b811d9b8d2b813254fa8397712df5dfbcec1c9e2100` |
| `1175-p3-bridge-types.txt` | 1627 | `3c2c84de14056dae843a862d09660fbd7f6004e470070f3edddc22021de10ea5` |
| `1175-p3-bridge-types.json` | 641 | `b5d781a269171a4a2928125dfdc4fd6afb03694ae8da59e3fafee2bde9423343` |
