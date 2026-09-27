# 1136-D — Compiler-attributed test boundary maintenance review

**KEEP the exact twelve-path source adaptation for the next recorded compiler and initial P3 observation.** This review reads source/Git objects and parses/hashes data only. No compiler, test, gameplay, project import, source mutation or index action was performed. Production review 1136-B remains frozen and separate.

The original closed1136 gate is preserved: HEAD `95a9abc2c5c5ffc53dc1639da19da510304ac2da`, production patch `c9c7af77c4dbead9f347ff6cccc258fe4479e5456b20b2f6ece9d4d6549d724e`, child2, fixed source, fourteen diagnostics in twelve older test/helper paths. The exact categories are twelve TS2345 guarded-boundary arguments, one TS2322 p14c4 live/frozen result and one TS2339 cast-seat discriminant. None is a production diagnostic; the original compiler did not pass.

## Independent identity checks

| Frozen item | Bytes | SHA256 |
| --- | ---: | --- |
| `1136-test-boundary-adaptation.patch` | 17,928 | `19e048841390d413ac3f84770f6f85f6d0f4664c2e63f66ac0f73828becc5ac5` |
| `1136-test-boundary-adaptation.json` | 8,294 | `b93f4cbe6390c9d2eea109cd2e9771b2e366c2759b65f36c9ec5b0d5bc25be0d` |
| `1136-A-p3-front-door-type-attribution.md` | 5,398 | `a817e70250b9dad7e7bf39bf62e5e02b9de4004d117e7126a706fb82e852f850` |

All twelve manifest preimage byte counts/hashes independently match `git show 95a9abc2:<path>`. All twelve postimage byte counts/hashes independently match the current files. The complete `git diff --no-ext-diff --binary --full-index HEAD -- tests` is literally the frozen patch above, not merely the same changed-path list. Full-index formatting is required for that patch-byte comparison; Git's abbreviated default index lines are a different textual serialization. Declaration and timeout lines also match before/after in all twelve paths.

The paths are `tests/contracts/v14-boundary-guards.contract.test.ts`, `tests/helpers/p14c2b-fixtures.ts`, `tests/helpers/p14c4-fixtures.ts`, `tests/p06a-w1-release-authority.test.ts`, `tests/p14b7-promise-waiver.test.ts`, `tests/p14c2rm-writer-continuation.test.ts`, `tests/p14c3-cohort-transition.test.ts`, `tests/p14c3-dual-extensions.test.ts`, `tests/p14c3-offmenu-extensions.test.ts`, `tests/p14c3-profession-history.test.ts`, `tests/p14c3-promise-digest-continuity.test.ts` and `tests/save.test.ts`. Their complete independently checked before/after identities remain in the pinned manifest; no fixture payload changed.

## Semantic disposition

The affected old target calls now perform the real public `convertV39ToV38` before their existing V38→37 and earlier conversions. This proves whole current authority and representability before historical projection; it neither stamps39 as38 nor removes a predicate, lifecycle field or other authoritative fact. Existing refusal regexes and historical output equality expectations are unchanged.

The p14c4 helper correctly replaces its contradictory `validateSaveV38({ saveVersion: LIVE_SAVE_VERSION, ... })` expression with actual `makeSave(state)` → `convertV39ToV38` → the unchanged38→37→36→35 chain. A mere annotation correction would still give strict38 an envelope39. The reviewed change removes only the now-unused imports/local typing and uses complete current admission. It does not fabricate a historical input.

The waiver leaf now proves `predicate.kind === 'castRoleCount'` before reading `seatClass`. Its genuine `bound-open-p1` fixture and classless fallback are unchanged. This does not introduce a Director waiver, alter its refusal expectation or exercise the deferred D12 domain.

A full diff read found no changed expected literal, pin, threshold, refusal expression, case declaration, timeout or fixture byte. The assertion expressions that previously called old converters merely gain the guarded crossing. Old workflow omissions still follow admitted historical conversion; C3 entrant/profession loss refusals retain their precise causes.

This release repairs the fourteen compiler-attributed sites only. Other existing calls such as `validateSaveV38(makeSave(current))` or current-envelope version literals were intentionally not swept into it. Accordingly, KEEP is not a claim that those historical suites now pass at runtime or that P3 outcomes, waiver or wire behavior are implemented. The next actual compiler/behavioral result must retain its own source identity and any newly reached first cause.
