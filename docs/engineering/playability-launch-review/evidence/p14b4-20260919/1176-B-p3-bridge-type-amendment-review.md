# 1176-B — Independent Bridge typing amendment review

**KEEP the exact two-line test amendment.** It corrects the three test diagnostics observed in1175 without changing the intended assertions. The two production diagnostics remain independently observed and unresolved by this patch. No new compiler or runtime result is claimed.

Read the complete1175 raw log, closed recorder JSON and preflight. The actual command was `node_modules/.bin/tsc --noEmit -p tsconfig.bridge.json`, on published817d9e52a997a0d532f878602f4a8029e602ba80, 15:54:04.542–15:54:32.171 UTC (27.629s), child2. Recorder source/HEAD and empty consumed diff remained fixed, untracked source was empty, and signal/error were null. The preflight independently records matching remote and clean worktree. Exactly five printed diagnostics occur in four paths:

- Production `bridge/people.ts:1048`: TS2322, public `directingOpportunity` is absent from the transport enum.
- Production `bridge/promises.ts:111`: TS2339, generic tagged access reads `seatClass` from a union now including Director predicates.
- Old trust test55: TS2339, the same unsafe union access in its expected-history oracle.
- New P3 test516: TS2339 on the snapshot collection path, plus its consequent TS7006 callback inference error.

Raw1627B/`3c2c84de14056dae843a862d09660fbd7f6004e470070f3edddc22021de10ea5`; JSON641B/`b5d781a269171a4a2928125dfdc4fd6afb03694ae8da59e3fafee2bde9423343`; preflight510B/`14208863eb241dd4840114768fc7e0daee36cbed80fc6ee78356577aa7343aeb`; recorded patch is empty (`e3b0c442…b855`). These records preserve the original failed gate.

## Exact correction and preservation

The old oracle now reads `seatClass` only for explicit `kind === 'castRoleCount'`. Recorded cast classes and count-only null behavior are preserved; the new Director predicate correctly has no cast class. No role-disclosure field or production-derived expectation is added.

The new test corrects only the snapshot path to `snapshot.snapshot.talent.talent.profiles`. `StudioTalentProjection` wraps `StudioTalentSnapshot` in the actual schema/bundle projector. By contrast, direct `peopleProjection` returns `{ profiles, roster, attention }`; its original `.profiles` access stays exact. Reviewer caught the provisional amendment to that wrong line before freeze/execution; it is absent from this final patch. The same complete history equality remains required, without a cast or explicit `any`.

Independent standard-library/Git reads verified both complete published preimages, both live postimages, the exact single replacement per file and full inverse equality. The live two-file diff is literally the frozen patch. Consequently every other byte—including all declarations, fixture pins, counters, routes and three60s timeouts—is unchanged.1176-A was read and agrees with these findings.

| Frozen artifact | Bytes | SHA256 |
|---|---:|---|
| Old trust test postimage | 32,115 | `7c9535be07f532d1d424525e8e1dd14ea9be2a3bd148773bb8b394772da197e8` |
| P3 Bridge test postimage | 45,268 | `8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d` |
| `1176-p3-bridge-type-amendment.patch` | 2,081 | `1f32cecce693793dd945073dec7efe147d3cdecdd236b701367f8b353303de62` |
| `1176-p3-bridge-type-amendment-manifest.json` | 2,547 | `447dacb3d91b0489fe0e5b811d9b8d2b813254fa8397712df5dfbcec1c9e2100` |
| `1176-A-p3-bridge-type-amendment.md` | 4,293 | `22cc3924b84ac7a55e68ee83bbb2c146d12e77dd112a44222f5b37f65df6fa4d` |

The reviewer ran no project imports, tests, compiler or gameplay and changed no consumed source/index. The original1174/1175 evidence remains immutable. This source disposition neither qualifies the three Bridge leaves nor repairs the two production type mismatches; the parent owns subsequent matched work and execution.
