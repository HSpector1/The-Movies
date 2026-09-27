# 1136-A — Initial Save39 root compiler attribution and narrow test adaptation

The first production-candidate root typecheck failed with **14 diagnostics in 12 test/helper files**: 12 TS2345 Save39→frozen38 argument diagnostics, one TS2322 frozen38 result assigned to the current live alias, and one TS2339 cast-seat access after the new Director predicate widened the union. There was no production diagnostic. This corrects the preliminary message’s imprecise category wording: 13 diagnostics concern the save boundary and one concerns the predicate discriminant.

The immutable `1136-p3-front-door-root-types` result records source `95a9abc2c5c5ffc53dc1639da19da510304ac2da` with production patch `c9c7af77c4dbead9f347ff6cccc258fe4479e5456b20b2f6ece9d4d6549d724e`, no untracked source, child exit 2, and `fixedSource: true`. It ran 2026-09-27 11:41:32.246–11:42:05.072 UTC, **32.826 seconds**, using `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Original raw diagnostics and recorder metadata remain unchanged; the accompanying JSON transcribes each diagnostic and pins every before/after file.

The 12-path candidate adds the real public `convertV39ToV38` crossing before each affected existing `convertV38ToV37` call. Current whole-save admission and explicit Director-authority refusal happen before the unchanged historical profession/Scientist/extension loss guards. No version is forged and no authority is deleted. Frozen bytes, readers, expected refusal expressions, assertions, declarations, timeouts, and existing version literals remain unchanged.

`tests/helpers/p14c4-fixtures.ts` needs an actual admission correction, not merely a frozen annotation. Its previous `validateSaveV38({ saveVersion: LIVE_SAVE_VERSION, ... })` would now pass envelope39 to strict38. Parent explicitly approved `makeSave(state)` → `convertV39ToV38` → existing38→37→36→35. The stale live-alias/version/reader imports were removed. This retains complete current admission before historical conversion and does not manufacture historical state.

`tests/p14b7-promise-waiver.test.ts` now requires `predicate.kind === 'castRoleCount'` before reading `seatClass`; the leaf’s genuine bound-open-P1 fixture, classless fallback, and identical-substitute assertions are unchanged. This is not a new Director-waiver implementation or test.

Other stale current-version literals/reader calls are outside this compiler-only release and remain untouched for later actual behavior attribution. No test, compiler, gameplay, import evaluation, fixture mutation, index operation, or commit was performed by this author. The exact candidate is frozen for independent source review and parent execution of the root typecheck, then the same eight-leaf P3 argv if admitted. A successful compile would not establish these historical suites’ runtime behavior.

## Frozen candidate

- Patch: `1136-test-boundary-adaptation.patch` — 17,928 bytes / SHA256 `19e048841390d413ac3f84770f6f85f6d0f4664c2e63f66ac0f73828becc5ac5`.
- Manifest: `1136-test-boundary-adaptation.json` — 8,294 bytes / SHA256 `b93f4cbe6390c9d2eea109cd2e9771b2e366c2759b65f36c9ec5b0d5bc25be0d`.

| Path | Before SHA256 | After SHA256 |
|---|---|---|
| `tests/contracts/v14-boundary-guards.contract.test.ts` | `20cbf0a602f9833742466eaaaaa9013f73fc305f4d8e1f2f1a4de8aaf29a8f23` | `39f99d2c15dad49996b7d2d3570ff3cd43052a62a65a766f87ed2a7ff6c6af0f` |
| `tests/helpers/p14c2b-fixtures.ts` | `e42f789ff749ef67edae5292995b010f3d857bb5991f1431ab679c01c8b49c6e` | `42595c028a8ae6eb7d851200e5f3ca3a31ed1079a5666163f37f5cefbe6ae029` |
| `tests/helpers/p14c4-fixtures.ts` | `850357bd40d7b86419323ca41e3c6cf70c0afba5de8b6fec0c3802cf36fb48e5` | `376cfce189eb9b5bb711a11ba447bc4ad20bc886e1ebcf4b2d15171afd134cb1` |
| `tests/p06a-w1-release-authority.test.ts` | `08c4605e081b2328e2189c50e7734ef8a7f773ad44ba4f1fa4b1cacbc8873362` | `6d8491c52e2470e500c527956975f1e55ba827e7310211c980624ad173a79b92` |
| `tests/p14b7-promise-waiver.test.ts` | `953b4b97efaa13a1d4a11968fb62ca412db312696ea7e5e2d73b35bcaa4df429` | `684bac7c2dc83d0633805d83d965fb6db3a567610914a770715b0d4b58c5e2dc` |
| `tests/p14c2rm-writer-continuation.test.ts` | `281e3e0cd8d78b7509c8677798f4443d79a8ccd9e5b94d6bc7b381d80d376888` | `ceb3a39baf6ccffddc87319d287356d360bda10a4fbfa0a36f96dfa3fcf7c510` |
| `tests/p14c3-cohort-transition.test.ts` | `6eb360074eeda2af33ee59a68ff724b421f493468c9e56dc8fbfbec2653c17f5` | `898075cdd5ad1e612f751fdabe76e1610b42b8b1547ba011baa42522680ad3d2` |
| `tests/p14c3-dual-extensions.test.ts` | `688760574920d82e35445a8682a5554f35e10b484583ad9931d8ac32b88257c7` | `6f7a1b963bbf0f7992c6720ea8dc9f6ba6ddf16863596ca4da5ae8c55cfba0cf` |
| `tests/p14c3-offmenu-extensions.test.ts` | `760c019cf59e559ef550a08a01550cdbd4ae40d4c3aac0205ea696b0c3288ffb` | `482a2f1cdc43e945c042d86461631a633c8a146ebfe910ed7c1609cc134ee7db` |
| `tests/p14c3-profession-history.test.ts` | `c57b827d31ca2fd93742e0eec1b386e9ecd6a49a36289de56b8fa74025430a42` | `19e563e40ec3f42f62969435b9fd1c0fbbbfd26c77c33ce59f5508d8ec82b476` |
| `tests/p14c3-promise-digest-continuity.test.ts` | `ec00c10a04f1807cff7ad648d65c5bebe46791b963b612652e8d9f778e12beec` | `e1218b2f8e45c4ab8190ea910c7426388db9ab7b88a2a8598d89c405c9c6a542` |
| `tests/save.test.ts` | `3dab1e65e9c3b6de8d8d3a5858fef7bb13287621b735c64de056414048ab05f4` | `69fff2f4a4eb20172d4a59e0f2b504393d378a7dc65bbb045f562ab4037dba00` |
