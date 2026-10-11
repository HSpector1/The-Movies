# AR fullfunction recovery route: exact build plan (r1)

Written 2026-10-11 by the planning subagent from the bytes on this machine. This directory holds this file only. Nothing in this plan ran. No package other than this directory was created.

The plan binds the owner-approved recovery (HANDOFF.md L23 and L25, OPERATIONAL-RECOVERY-PROPOSAL.md 51551f01, independent review b8df3ed1) to a fresh route generation "AR" derived from the held AQ r3 packages. Every edit below names the source file, its sha256, the exact old text and the exact new text. Values marked COMPUTED come from hashing a file after it is final; the finalization order in section 4 says when.

## 0. Gate 0 verdict: BLOCKED at 2026-10-11T06:30:37Z

The task premise says the current published HEAD is `6510c971bed8079f7ca02e528b224988de092c87` with src tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`. The live repository disagrees. Read-only Git at 2026-10-11T06:30:37Z:

| Fact | Observed |
|---|---|
| `git rev-parse HEAD` | `205323ac53b20156f21b450f3e9c26a8a3e7b756` ("docs(1370-ar): post-R8 core baseline on db3fc572 ...", 2026-10-11 01:22:06 -0500) |
| `git rev-parse HEAD:src` | `cf7d20cd585f72fd178e06c3cd2a8821bbc0c26f` |
| local `refs/heads/wip/headless-program-20260916-ts` | `205323ac53b20156f21b450f3e9c26a8a3e7b756` |
| `refs/remotes/origin/wip/headless-program-20260916-ts` | `205323ac53b20156f21b450f3e9c26a8a3e7b756` |
| `refs/remotes/origin/main` | `c902a704eb948cc576083d0973c8c23e59937dc1` |
| `git status --porcelain=v1 --untracked-files=all` | ` M HANDOFF.md` (hook AUTO block only; see diff in section 7.1) |
| `git merge-base --is-ancestor 6510c971 HEAD` | yes; chain 6510c971 -> f7d0dc0f -> 6a4d5ca1 -> 1bc39fab -> db3fc572 -> 205323ac |
| non-docs paths in `git diff --name-only -z 4812bb12 HEAD` | 189 (R8 landed `src/core/technologyRival.ts`, `src/core/types.ts` and 186 more at db3fc572) |
| `6510c971:src`, `1bc39fab:src`, `d20347b8:src` | all `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554` |
| `S/HEAVY-LANE-LOCK` | absent |
| vitest workers | two groups live (pgid 73677 and 77609, `npm exec vitest run --project core ...`) |
| free bytes on `S` | 2,078,400 KiB = 2,128,281,600 B (floor is 3,758,096,384 B) |
| power, boot session | AC Power; `452DE205-E1D6-462E-8673-553462BB0166` |

Why this blocks the route as specified. Every layer pins the src tree `13880d9b…` and requires the production HEAD to equal the live local and remote wip ref:

- `1370-aq-current-operational-fullguard-source-20261010-r1/snapshot.py` L61-65 (HEAD == productionHead, clean tree, `HEAD:src == productionSourceTree`, `ls-remote` wip == productionHead), L114-118 (every path in `git diff --name-only -z 4812bb12 productionHead` must be `HANDOFF.md` or start with `docs/`), L115 (`4812bb12:src == productionSourceTree`).
- `…diagnostic-source-20261010-r3/run-fullfunction.py` L49 (`CURRENT_AM_TYPES`: historical types adoption `productionSourceTree == c['productionSourceTree']`), L111/L113/L117 (protection, full-preflight adoption and transition all carry `productionSourceTree`).
- `…parent-source-20261010-r3/launch-fullfunction.py` L84 (`CURRENT_SOURCE_CONFIG` head and tree literals), L87 (`HISTORICAL_TYPES_WITH_UNCHANGED_SOURCE`), L101 (`AM_AN_AO_AP_CONTINUITY` with `sourceTree` equality across all transitions).
- `1370-aq-proof-git-optional-locks-sanitizer-source-20261010-r1/runner.py` L12 `TREE='13880d9b…'` (hardcoded, not injected), L541 (`HEAD:src == TREE`), L544-545 (local and remote wip == CURRENT_HEAD; local and remote main == `c902a704…`).
- `…diagnostic-source-20261010-r3/CORE-TEST-TEMPLATE.ts` L12 (`binding.productionSourceTree == '13880d9b…'`).

Refs never move backward (HANDOFF.md L335: "Preserve any newer commits, uncommitted specialist work and user edits"). A revert of the R8 source would itself be a non-docs commit and would discard landed work (Save46 live, HANDOFF.md L57). Therefore no reachable HEAD satisfies Gate 0 today, and this plan cannot name one. The predicate below decides at execution time; it does not choose a hash.

Gate 0 predicate (all must hold; the script in 7.1 evaluates it and writes `A/GATE0-OBSERVATION.json`):

1. `HEAD == refs/heads/wip/headless-program-20260916-ts == ls-remote origin refs/heads/wip/headless-program-20260916-ts` =: `${HEAD_AR}`.
2. `git rev-parse ${HEAD_AR}:src == 13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`.
3. `git merge-base --is-ancestor d20347b83ea7497ed17c48ec14d8f64a3ce69cc8 ${HEAD_AR}` exits 0.
4. Every path in `git diff --name-only -z 4812bb123781632dd39e44f918eb85a6a2c12623 ${HEAD_AR}` equals `HANDOFF.md` or starts with `docs/`.
5. `git status --porcelain=v1 --untracked-files=all` prints nothing.
6. `git rev-parse refs/remotes/origin/main == ls-remote origin refs/heads/main == c902a704eb948cc576083d0973c8c23e59937dc1`.

Today predicates 2 and 4 are false (src `cf7d20cd…`, 189 non-docs paths) and predicate 5 is false (`HANDOFF.md` modified). The plan treats `${HEAD_AR}` as a value read from `A/GATE0-OBSERVATION.json`, never typed. Where the task text wrote `6510c971bed8079f7ca02e528b224988de092c87`, this plan writes `${HEAD_AR}`; the two coincide only if Gate 0 observes that commit as the live tip, which it cannot (the tip is past it).

What unblocks Gate 0 is outside this plan and is recorded as open question Q1: the M0 lineage (types adoption be632d53, proof library TREE constant, fixture templates, A208 copy at 4812bb12) is bound to src tree `13880d9b…`; the landed R8 source moved the tree. Either a new lineage is qualified against the landed tree (a new route generation, not AR), or dependent gameplay stays held. The owner removed approval gates; the integrator records this decision in `A/GATE0-OBSERVATION.json` and HANDOFF.md.

Sections 1 through 9 remain exact and apply unchanged the moment Gate 0 passes.

## 1. Conventions

Paths:

```
S  = /Users/zacheryspector/studio-scratch
R  = /Users/zacheryspector/The-Movies-headless-program
PY = /usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14   # sha256 7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835, 50472 B
NODE = /Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node   # sha256 0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6, 115440320 B
GIT = GIT_OPTIONAL_LOCKS=0 /usr/bin/git --no-optional-locks -c gc.auto=0 -c maintenance.auto=0 -C $R
Q  = S/1370-aq-root-continuation-20261010-r1          # AQ root, read only
AN = S/1370-an-root-continuation-20261009-r1          # AN root, read only
AP = S/1370-ap-root-continuation-20261010-r1          # AP root, read only
A  = S/1370-ar-root-continuation-20261010-r1          # AR root, new
```

Every Python invocation uses `$PY -I -B` (scripts assert `sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize`). Every launch runs with `cwd=$R` and environment additions `PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0`.

`role(p)` is `{path, bytes, sha256}` of a physical regular file with `st_nlink == 1` whose `resolve(strict=True)` equals itself (`run_observer_fullfunction_once.py` L4-6). JSON artifacts are written with `json.dump(v, f, sort_keys=True, indent=2)` plus a trailing newline, `open('x')`, fsync, then `chmod 0o444` (`put()` in the same file L10-12).

EDIT notation. `EDIT <file> L<n>: "<old>" -> "<new>"` means: assert `text.count(old) == 1`, replace, and keep every other byte. This is the needle rule from `1370-aq-current-operational-fullguard-root-adapters-source-20261010-r1/HISTORICAL-prepare_current_fullguard.py.txt` (`assert old.count(needle)==1; new=old.replace(needle,replacement); assert new.replace(replacement,needle)==old`) and `change()` in `1370-aq-fullfunction-generated-authority-repair-preparation-20261010-r1/prepare_corrected.py` L16. Line numbers refer to the source file before any edit; apply edits to one file from the highest line number down, or by substring, so numbering never shifts under you. After the last edit of a `.py` file run `compile(text, path, 'exec')`.

MAP notation. `MAP` is the ordered string substitution table in 3.2 applied to a whole file before its EDITs. It renames package directories and output paths only.

`COMPUTED(x)` is `role(x)` (or its `sha256`) taken after `x` is final. `${HEAD_AR}` is the 40-hex head from `A/GATE0-OBSERVATION.json`. `${HEAD_AR8}` is its first eight characters.

Forward and inverse proofs. For every edited file keep `baseline = role(<source r3/r1 file>)`, `losslessNdiff = list(difflib.ndiff(old.splitlines(True), new.splitlines(True)))`, `forward`/`inverse` unified diffs, and assert `''.join(difflib.restore(delta,1)) == old` and `''.join(difflib.restore(delta,2)) == new` (prepare_corrected.py L17-20). These entries form each package's `WHOLE-FORWARD-INVERSE.json`.

## 2. Decisions that remove judgment calls

D1 Head. `${HEAD_AR}` is the live tip that passes Gate 0 (section 0). The src tree stays `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`. No file in this plan receives a typed hash; `A/GATE0-OBSERVATION.json` is the only source of `${HEAD_AR}`.

D2 Chain. The hardcoded three-link head chain AM(7087f116) -> AN(0cf8b1d0) -> AO(f2f97c62) -> AP(d20347b8) becomes four links ending at `${HEAD_AR}`. Route CONFIG gains `historicalAPHead` = `d20347b83ea7497ed17c48ec14d8f64a3ce69cc8` and `historicalAOToAPTransition` = the AQ transition role (Q/CURRENT-AP-OPERATIONAL-TRANSITION.json, 1029 B, `8a7d765bbc472ccf5717fd2b3e68a362eac5db63f76b5fb523bd6fe3de1ed753`). `actualCurrentOperationalTransition` becomes the new AR transition (schema `1370-ar-current-ar-operational-transition/v1`, predecessor `d20347b8…`). The AO -> AP link keeps schema `1370-aq-current-ap-operational-transition/v1`. New guard label: `HISTORICAL_AO_TO_AP_CONTINUITY`. Launcher chain label becomes `AM_AN_AO_AP_AR_CONTINUITY`.

D3 Fresh baseline has no prior postflight. The r3-only `recentProtectedPostflightReadback` / `recentProtectedPostflightSnapshot` requirements revert to the r2 form (both AQ postflights 54871 and 96592 remain failed; nothing can satisfy them). The replacement short-prelaunch check compares the prelaunch snapshot to the fresh before-fill baseline (`FRESH_CURRENT_PREFLIGHT_ON_FRESH_BASELINE`). The r3 generated-core guard (`launch-fullfunction.py` L88, `GENERATED_CORE_CURRENT_AUTHORITY`) stays.

D4 Proof methods. `CONFIG.proofMethods` becomes the corrected runner `S/1370-aq-proof-git-optional-locks-sanitizer-source-20261010-r1/runner.py` (44107 B, `6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa`). A new CONFIG key `proofMethodsDerivativeAuthority` names `D/PROOF-METHODS-DERIVATIVE-AUTHORITY.json`, and `proofMethodsDerivativeAuthorityReview` names its independent review. Both are authenticated inside `authenticate_current_protection` (Python) and `authenticateCurrentProtection` (Node) before `exec(compile(...))` at `run-fullfunction.py` L181 and before FIRST-PROOF acceptance at `run-fullfunction.mjs` L159, and once more in `launch-fullfunction.py` main and the root wrapper. The derivative file names only pre-existing reviewed roles (acyclic, LESSONS-r9 lesson 4). `proofConfig` (c40c0a34…), `historicalTypesAdoption` (be632d53…), `historicalTypesHead` and every historical arm stay byte-identical.

D5 Failures stay failed. `A/PRIOR-FAILURES-PRESERVED-ADOPTION.json` records 42397, 54871, 96592, the unexplained interval 2026-10-10T12:10:59Z to 12:11:44Z (lane meta `1370-aq-m0-fullfunction-native-refusal-diagnostic-lane-20261010-r1.meta`, 548 B, `91212859…`; recorder RESULT utc `2026-10-10T12:11:44.158671+00:00`; index mtime `12:11:03.024858Z` per HANDOFF.md L248 and source finding `89510545…`) and the AP stop adoption `b163345c…`. `CONFIG.reviewedPriorStopAdoption` and `protection.reviewedPriorStopAdoption` point at this file. The old baseline `bc21a3df…` is referenced as historical and never repinned; the fresh baseline lives in a new evidence directory `before-fill-current-ar-r1`.

D6 Strings. Role key names (`currentAPFullPreflightAdoption`, `currentAPFullPreflightSnapshot`), guard labels (`CURRENT_AN_*`), the protection schema `1370-root-fullfunction-current-protection/v4`, its status, the full-preflight adoption schema `1370-aq-root-current-ap-fullpreflight-adoption/v1` and status `ROOT_ADOPTED_CURRENT_AP_FULL_PREFLIGHT`, the prelaunch readback schema `1370-ap-current-ap-root-prelaunch-readback/v2`, and every review decision string that a script compares literally stay unchanged. AQ already reused AP strings this way. Head equality checks (`productionHead == c['operationalHead']`) make reuse of any AQ authority impossible. Only the AR transition schema is new (D2), following the per-letter pattern `1370-ao-current-an…`, `1370-ap-current-ao…`, `1370-aq-current-ap…`.

D7 Reviews are external inputs. Independent reviewers produce RECEIPT.json files; the plan fixes their directories, schemas, decision strings and the fields the scripts compare. Their hashes are COMPUTED after the reviewer writes them.

D8 Bounds. `bounds` stays byte-identical to r3 (`aggregateChild 300, activeRecorder 320, wholeRecorder 330, streamBytes 8388608, resultBytes 131072, vitestReportBytes 1048576, fixturePacketBytes 67108864, aggregateOutputTreeBytes 268435456, outputTreeEntryCap 10000`). One attempt. `automaticRetry` is false in every grant. Any STOP is recorded and holds the route.

## 3. Packages

### 3.1 Names (prefix `1370-ar-`, suffix `-20261010-r1`; none exist today, checked with `ls -d S/1370-ar-*`, which lists only the six specialist directories)

| Symbol | Directory under S | Derived from | Purpose |
|---|---|---|---|
| F | `1370-ar-m0-fullfunction-source-20261010-r1` | `1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r3` (F0) | route source |
| P | `1370-ar-m0-fullfunction-parent-source-20261010-r1` | `…-parent-source-20261010-r3` (P0) | launcher and reader |
| W | `1370-ar-m0-fullfunction-root-wrappers-source-20261010-r1` | `…-root-wrappers-source-20261010-r3` (W0) | root wrappers |
| D | `1370-ar-proof-methods-derivative-authority-20261010-r1` | new | sanitizer derivative authority |
| AM | `1370-ar-operational-recovery-amendment-20261010-r1` | new | recovery amendment text and adoption inputs |
| PREP | `1370-ar-m0-fullfunction-preparation-20261010-r1` | `1370-aq-fullfunction-generated-authority-repair-preparation-20261010-r1` | fill and audit scripts, audit outputs |
| A | `1370-ar-root-continuation-20261010-r1` | `1370-aq-root-continuation-20261010-r1` (Q) | root facts, adoptions, protection, bindings |
| G | `1370-ar-current-operational-fullguard-source-20261010-r1` | `1370-aq-current-operational-fullguard-source-20261010-r1` (G0) | fresh-baseline fullguard config and evidence |
| GA | `1370-ar-current-operational-fullguard-root-adapters-source-20261010-r1` | `1370-aq-current-operational-fullguard-root-adapters-source-20261010-r1` (GA0) | fullguard launcher and reader |
| GP | `1370-ar-current-ar-fullpreflight-parent-recorded-20261010-r1` | created at run | fullguard grant, streams, readback |
| N | `1370-ar-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1` | `1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1` (N0) | short prelaunch source |
| NP | `1370-ar-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1` | created at run | prelaunch config, grant, streams |
| NO | `1370-ar-native-refusal-fullfunction-current-prelaunch-output-20261010-r1` | created at run | PREFLIGHT.json, raw local roles |
| RP | `1370-ar-m0-fullfunction-parent-recorded-20261010-r1` | created at run | ROOT-LAUNCH-CLAIM, EXECUTION-GRANT, RECORDER-LAUNCH-CLAIM, ACTUAL-TOOL, READBACK |
| RR | `1370-ar-m0-fullfunction-results-20261010-r1` | created at run | FIRST-PROOF, CONTROLLER-BINDING, runtime outputs (`outputPath`) |
| RC | `1370-ar-m0-fullfunction-recorder-results-20261010-r1` | created at run | recorder RESULT (`recorderOutputPath`) |
| LL | `1370-ar-m0-fullfunction-lane-20261010-r1` (+ `.meta`) | created at run | lane log |
| PF | `1370-ar-native-refusal-fullfunction-shared-fullpostflight-source-20261010-r1` | `1370-aq-native-refusal-fullfunction-shared-fullpostflight-source-20261010-r1` (PF0) | mandatory postflight launcher and reader |
| PFD | `1370-ar-shared-postflight-diagnostic-source-20261010-r1` | `1370-aq-original-shared-postflight-diagnostic-source-20261010-r1` (PFD0) | diagnostic wrapper around the original scanner |
| PFP | `1370-ar-native-refusal-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1` | created at run | postflight grant, streams, readback |
| PUB | `1370-ar-checkpoint-root-finalization-20261010-r1` | `1370-ap-checkpoint-root-finalization-20261010-r1` | PUSH-READBACK.json for `${HEAD_AR}` |

Review directories (external reviewers write `RECEIPT.json`):

| Symbol | Directory under S | Schema | Decision the scripts compare |
|---|---|---|---|
| RV_D | `1370-ar-proof-methods-derivative-authority-independent-review-20261010-r1` | `1370-ar-proof-methods-derivative-authority-independent-review/v1` | `ACCEPT_STATIC_PROOF_METHODS_DERIVATIVE_AUTHORITY_ONLY` |
| RV_G | `1370-ar-current-operational-fullguard-independent-source-review-20261010-r1` | `1370-ar-current-ar-fullguard-independent-source-review/v1` | `ACCEPT_CURRENT_AP_FULLGUARD_BINDINGS_SOURCE_ONLY` (GA launcher L14 literal) |
| RV_GO | `1370-ar-current-ar-fullpreflight-independent-observed-review-20261010-r1` | `1370-current-ap-fullpreflight-independent-observed-review/v1` (adopt script L10 literal) | `ACCEPT_ACTUAL_CURRENT_AP_FULL_PREFLIGHT_ONLY` |
| RV_N | `1370-ar-native-refusal-fullfunction-current-prelaunch-independent-source-review-20261010-r1` | `1370-aq-current-ap-fullfunction-prelaunch-independent-source-review/v1` (N launcher L15 literal) | `ACCEPT_STATIC_CURRENT_AP_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY` |
| RV_NO | `1370-ar-native-refusal-fullfunction-current-prelaunch-independent-observed-review-20261010-r1` | `1370-aq-current-ap-fullfunction-prelaunch-independent-observed-review/v1` (adopt script L11 literal) | `ACCEPT_ACTUAL_CURRENT_AP_FULLFUNCTION_PRELAUNCH_ONLY` |
| RV_F | `1370-ar-m0-fullfunction-independent-source-review-20261010-r1` | `1370-fullfunction-qualification-independent-source-review/v1` | `ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY` |
| RV_PW | `1370-ar-m0-fullfunction-parent-readback-wrappers-independent-source-review-20261010-r1` | `1370-aq-fullfunction-parent-readback-wrappers-independent-source-review/v1` (wrapper L17 literal) | `ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY`, `rootReadbackDecision` `ACCEPT_STATIC_FULLFUNCTION_ROOT_READBACK_SOURCE_ONLY` |
| RV_PF | `1370-ar-shared-postflight-diagnostic-independent-source-review-20261010-r1` | `1370-original-shared-postflight-diagnostic-independent-source-review/v1` (PFD main L90 literal) | `ACCEPT_STATIC_ORIGINAL_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_SOURCE_ONLY` |
| RV_RO | `1370-ar-m0-fullfunction-independent-observed-review-20261010-r1` | `1370-ar-fullfunction-independent-observed-review/v1` | `ACCEPT_ACTUAL_REAL_FULL_FUNCTION_QUALIFICATION_WITH_FULL_POSTFLIGHT_ONLY` or `ACCEPT_ACTUAL_FULLFUNCTION_STOP_PRESERVED_ONLY` |

Run identifiers inside CONFIG: `runId` = `20261010-ar-m0-fullfunction-r1`; fullguard evidence labels `before-fill-current-ar-r1` and `postflight-fullfunction-ar-r1`.

### 3.2 MAP (ordered; apply to text before EDITs; every left string is unique in the r3/r1 sources)

```
1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r3                 -> 1370-ar-m0-fullfunction-source-20261010-r1
1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r3          -> 1370-ar-m0-fullfunction-parent-source-20261010-r1
1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r3   -> 1370-ar-m0-fullfunction-root-wrappers-source-20261010-r1
1370-aq-m0-fullfunction-native-refusal-diagnostic-results-20261010-r2                -> 1370-ar-m0-fullfunction-results-20261010-r1
1370-aq-m0-fullfunction-native-refusal-diagnostic-recorder-results-20261010-r2       -> 1370-ar-m0-fullfunction-recorder-results-20261010-r1
1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-recorded-20261010-r2        -> 1370-ar-m0-fullfunction-parent-recorded-20261010-r1
1370-aq-m0-fullfunction-native-refusal-diagnostic-lane-20261010-r2                   -> 1370-ar-m0-fullfunction-lane-20261010-r1
20261010-aq-m0-fullfunction-native-refusal-diagnostic-r2                             -> 20261010-ar-m0-fullfunction-r1
```

MAP never touches `1370-aq-root-continuation-20261010-r1` (AQ authorities stay where they are) or any `1370-an-*`, `1370-ao-*`, `1370-ap-*` path. Occurrence counts in F0 (verified): `CONFIG-TEMPLATE.mts` self 1; `record-fullfunction.py` recorder 1; `CONFIG.json` self 5, results 1, recorder 1, parent 1, lane 1, runId 1; `RECIPE.json` self 18, outputs 1 each. `canonical-typescript-transform.mjs`, `RESOLUTION-SOURCE-BINDING.json`, `CORE-TEST-TEMPLATE.ts`, `run-fullfunction.py`, `run-fullfunction.mjs` contain none of these strings and copy byte-identical before their EDITs.

## 4. Finalization order (global)

Each step needs the ones it names. Hashes flow downward only.

1. Gate 0 (7.1) writes `A/GATE0-OBSERVATION.json`. PASS required for 2 onward. BLOCKED today.
2. `PUB/PUSH-READBACK.json` from live Git (5.2.2).
3. `A/CURRENT-AR-OPERATIONAL-TRANSITION.json` (needs 2).
4. `A/CURRENT-AR-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json` (needs 2, 3).
5. D package (5.1), then RV_D. Independent of 1-4; may run first.
6. `A/PRIOR-FAILURES-PRESERVED-ADOPTION.json`, `AM/RECOVERY-AMENDMENT.md`, `A/OPERATIONAL-RECOVERY-AMENDMENT-ADOPTION.json` (needs 5).
7. G fill (5.3.1) in this order: `CONFIG.json` -> `snapshot.py` L14 -> diff files -> `PROOF.json` -> `READY-FOR-AUTHENTIC-FILL.json` -> `SOURCE-PINS.json` -> `SEAL.json`. Then GA fill (5.3.2): scripts -> diffs -> `RECIPE.json` -> `SOURCE-PROOF.json` -> `SOURCE-PINS.json` -> `SEAL.json`. Then `A/CURRENT-AR-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json` (needs G and GA SOURCE-PINS and RV_G).
8. RV_G.
9. Pre-run checks (7.2), fullguard before-fill run (7.3), `GP/ACTUAL-TOOL.json`, reader, `GP/READBACK.json`, RV_GO, `A/adopt_current_fullguard.py` -> `A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json`.
10. `A/FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json` (needs 3, 6).
11. N fill (5.4) (needs 9 and G roles) -> RV_N -> prelaunch run (7.4) -> reader -> `A/M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json` -> RV_NO -> `A/CURRENT-AR-NATIVE-REFUSAL-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json` -> `A/adopt_refusal_current_protection.py` -> `A/M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json`.
12. F fill (5.5): templates, transform, binding -> `CONFIG.json` (every role now known, including `currentProtection`) -> `run-fullfunction.py` L4, `run-fullfunction.mjs` L8, `record-fullfunction.py` L5 (`CONFIG_SHA`), then `record-fullfunction.py` L5 `WORKER_SHA` -> `RECIPE.json` -> `WHOLE-FORWARD-INVERSE.json` -> `SOURCE-PINS.json`. Then P fill (5.6): `launch-fullfunction.py`, `read-fullfunction.py` (need F `CONFIG.json` and `SOURCE-PINS.json` shas) -> `RECIPE.json` -> `WHOLE-FORWARD-INVERSE.json` -> `SOURCE-PINS.json`. Then W fill (5.7): both wrappers (need F `SOURCE-PINS.json` sha) -> `RECIPE.json` -> `WHOLE-FORWARD-INVERSE.json` -> `SOURCE-PINS.json`.
13. Static audits (section 6) -> `PREP/STATIC-AUDIT.json`, `PREP/GENERATED-AUTHORITY-AUDIT.json`.
14. RV_F and RV_PW.
15. PF and PFD fill (5.8) (need G roles and the role from 9) -> RV_PF.
16. Pre-run checks again (7.2), route launch (7.5), `RP/ACTUAL-TOOL.json`, reader (7.6), `RP/READBACK.json`.
17. Postflight (7.7), `PFP/ACTUAL-TOOL.json`, reader, `PFP/READBACK.json` or `PFP/FAILURE-READBACK.json`.
18. RV_RO, root adoption (section 8), HANDOFF.md update, lessons.

## 5. Per-package file plans

### 5.1 D: proof-methods derivative authority

`D/PROOF-METHODS-DERIVATIVE-AUTHORITY.json` (new; `put()` form). Content, every role verified by hashing at write time:

```
schema                           "1370-ar-proof-methods-derivative-authority/v1"
status                           "DERIVATIVE_AUTHORITY_BOUND_SOURCE_ONLY"
acyclic                          true
executionAuthorization           false
game                             false
historicalSource                 {S/1370-an-m0-post-r6-preservation-diagnostic-source-20261009-r2/runner.py, 44067, b9ff56da6524243c95045b0e09f25ca4ec5c8225bbdd3eb76820e75b928e350d}
correctedSource                  {S/1370-aq-proof-git-optional-locks-sanitizer-source-20261010-r1/runner.py, 44107, 6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa}
wholeInverse                     {S/1370-aq-proof-git-optional-locks-sanitizer-source-20261010-r1/WHOLE-INVERSE.json, 53321, 419cf7449c82416876ec311cd29bd038c8fa7337ce4fd3741e85468713662ea2}
forwardDiff                      {…sanitizer-source-20261010-r1/SOURCE.forward.diff, 501, 6745ad64ae00d48af69087c7e20f4e5bf6e60b7edd6270dc3cf10d0a97a6babd}
contract                         {…sanitizer-source-20261010-r1/CONTRACT.json, 2198, a02303920aad61d9d450711d36b5755820eb71c6266958ea3eee7f1ad8dc8cff}
sourcePins                       {…sanitizer-source-20261010-r1/SOURCE-PINS.json, 1226, 162098174210e249daafd838b7dbaf5814a492f06c977abdf0ae9dd4261b6fba}
seal                             {…sanitizer-source-20261010-r1/SEAL.json, 465, 0f350ff76fa87598a1107e98cbae81d6b41496859ca37a288d6070680023935c}
independentSourceReview          {S/1370-aq-proof-git-optional-locks-sanitizer-independent-source-review-20261010-r1/RECEIPT.json, 4057, 11e1d503a6644375b5bfd4b554f30879e768e33de5a99bda060f5a9a49c865ed}
regressionControlsAdoption       {Q/GIT-OPTIONAL-LOCKS-CONTROLS-OBSERVED-ADOPTION.json, 2932, 20dae623e4e36f3384d78494eddf753f4e7096b81ff6f6a8ee8ab81e685372f4}
regressionControlsResult         {S/1370-aq-git-optional-locks-regression-controls-results-20261010-r1/RESULT.json, 23665, e688b7321761327ebe9623f36e2950c58fdca47e2d853a1d7cd5901e644259b5}
regressionControlsObservedReview {S/1370-aq-git-optional-locks-regression-controls-independent-observed-review-20261010-r1/RECEIPT.json, 4056, 6401e029d70b0f71ba497db09f035fe68036be3352fc6341ac1ab4c511f0b7b2}
sourceFinding                    {S/1370-aq-git-optional-locks-source-finding-20261010-r1/RECEIPT.json, 6223, 89510545caa02e6f50a6d9fb526010eb5f63c529019649a5e551f23d1e22161c}
recoveryProposal                 {Q/OPERATIONAL-RECOVERY-PROPOSAL.md, 3103, 51551f0190830b08ea9c79e674e7b32754f99f13f46cbb78e240f54e92503807}
recoveryProposalReview           {S/1370-aq-operational-recovery-proposal-independent-review-20261010-r1/RECEIPT.json, 4929, b8df3ed14ca9860c309128fe8eb0e06265faf0b638620a56886e7c6b8db42809}
integrationPlan                  {Q/PROOF-SANITIZER-INTEGRATION-PLAN.md, 2204, 83d3a089898f3f74b1e01131e02bd935b278afb57dc6261dd78c3dd8168e021a}
soleChangedDefinition            "clean_git_env"
unchangedDefinitionCount         35
exactChange                      "Continue dropping every inherited GIT_ variable, then force GIT_OPTIONAL_LOCKS='0' even when absent or conflicting."   (CONTRACT.json exactChange, verbatim)
boundConfigKey                   "proofMethods"
entryGates                       ["run-fullfunction.py authenticate_current_protection", "run-fullfunction.mjs authenticateCurrentProtection", "launch-fullfunction.py main", "run_observer_fullfunction_once.py"]
limits                           ["Fix removes an index-write capability from status; it does not identify any leaf or cause for original54871 or diagnostic96592 commonGit aggregate mismatch.", "No protected preservation, baseline replacement, types/game admission or execution authorization."]   (review RECEIPT limits, verbatim)
utc                              ISO-8601 at write
```

The file never contains keys `currentProtection`, `freshSourceProof`, `freshDependencyProof`, and never names any F, P, W, A, RP, RR, RC or review-of-itself path.

`D/SOURCE-PINS.json`: `{schema "1370-ar-proof-methods-derivative-authority-source-pins/v1", executionAuthorization false, files {"PROOF-METHODS-DERIVATIVE-AUTHORITY.json": COMPUTED role}}`.

RV_D RECEIPT (reviewer writes; required fields): `schema`, `decision`, `subject` = role(D file), `sourceManifest` = role(D/SOURCE-PINS.json), `concreteFindings` `[]`, `executionAuthorization` false, `inverseReapplied` true (reviewer runs `''.join(difflib.restore(w['ndiff'],1))` on `WHOLE-INVERSE.json` and asserts equality with the 44067-byte original and `restore(...,2)` with the 44107-byte corrected file; `WHOLE-INVERSE.json` keys are `after, applications, before, candidateExecuted, changedDefinitions, forwardExact, inverseExact, ndiff (760 lines), unchangedDefinitionCount 35`), `forwardDiffTouchesOnly` `["clean_git_env"]`.

### 5.2 A and AM: root facts, amendment, prior failures, contracts

#### 5.2.1 `A/GATE0-OBSERVATION.json` (schema `1370-ar-gate0-observation/v1`)

Written by the 7.1 script from command output only: `utc, head, headSrcTree, localWip, remoteWip, localOriginMain, remoteMain, workingTreeStatus (raw bytes as string), nonDocsPathsFrom4812 (list, first 200), nonDocsCount, apIsAncestor, heavyLaneLockAbsent, freeBytes, acPower, bootSessionUuid, verdict ("PASS" or "BLOCKED"), failedPredicates (list of integers 1..6)`.

#### 5.2.2 `PUB/PUSH-READBACK.json` (schema `1370-ar-publication-readback/v1`)

Shape follows `S/1370-ap-checkpoint-root-finalization-20261010-r1/PUSH-READBACK.json` (2519 B, `6545dea2…`): `advertisedRemoteRefs {refs/heads/main: c902a704…, refs/heads/wip/headless-program-20260916-ts: ${HEAD_AR}}` from `ls-remote`, `branch`, `head ${HEAD_AR}`, `parent` = `git rev-parse ${HEAD_AR}^`, `sourceTree 13880d9b…`, `trackedMain c902a704…`, `workingTreeClean true`, `docsOnlyPathCount` = number of NUL-terminated paths in `git diff --name-only -z d20347b8… ${HEAD_AR}`, `status "PUBLISHED_REMOTE_ANCESTRY_SOURCE_VERIFIED"`, `mainMerged false`, `fullfunctionQualificationAccepted false`, `utc`. No push happens; the readback verifies that the advertised remote already equals the local tip.

#### 5.2.3 `A/CURRENT-AR-OPERATIONAL-TRANSITION.json` (schema `1370-ar-current-ar-operational-transition/v1`)

Recipe is `HISTORICAL-prepare_current_fullguard.py.txt` (6552 B, `2522d388…`), re-pointed. Verified against AP: `git diff --name-only -z f2f97c62… d20347b8…` gives 765 paths and raw-output sha256 `5cf3c0a34d837aff7118de64cf213e180c48c310c0877bb0c2c1b6ba5d76cab1`, equal to Q/CURRENT-AP-OPERATIONAL-TRANSITION.json.

```
actualHead              ${HEAD_AR}
predecessor             "d20347b83ea7497ed17c48ec14d8f64a3ce69cc8"
intermediateHeads       output of `git rev-list --reverse d20347b8…..${HEAD_AR}` minus the last entry (today: d3072005, 9b67d768, 6510c971, f7d0dc0f, 6a4d5ca1, 1bc39fab, db3fc572, ... as observed)
sourceTree              "13880d9b0ba72aff5d4c5bcf5d12fe682c5de554"
main                    "c902a704eb948cc576083d0973c8c23e59937dc1"
docsOnlyVerified        true   (Gate 0 predicate 4 holds, otherwise the file is not written)
docsOnlyPathCount       len([p for p in raw.split(b'\0') if p]) where raw = `git diff --name-only -z d20347b8… ${HEAD_AR}` stdout
docsOnlyPathsNulSha256  sha256(raw)
remoteRefsVerified      {"refs/heads/main": "c902a704…", "refs/heads/wip/headless-program-20260916-ts": ${HEAD_AR}}   (from ls-remote)
workingTreeClean        true
publishedReadback       role(PUB/PUSH-READBACK.json)
fullGuardsYetRun        false
executionAuthorization  false
utc                     ISO-8601
```

#### 5.2.4 `A/CURRENT-AR-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json`

Copy of Q/CURRENT-AP-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json (2942 B, `b0e268df…`) with these key edits; every other key byte-identical (`H8708Waived false`, `actualControlsAdoption 417adabc…`, `historicalM0Completion 4711b938…`, `sourceAmendmentAdoption fefd5bef…`, `schema 1370-a208-current-operational-guard-scope-adoption/v1`, `status PARENT_ADOPTED_A208_OPERATIONAL_GUARD_SCOPE_ONLY`, `combinedHFirstRouteUnchanged true`, `currentFullGuardsYetRun false`, `m0RematerializationAuthorized false`, `productionSourceChangesAuthorized false`, `productionSourceTree 13880d9b…`, `actualScanGrant null`, `gameGrant null`, `executionAuthorization false`):

```
productionGuardHead                        ${HEAD_AR}
operationalTransition.actualHead           ${HEAD_AR}
operationalTransition.predecessor          "d20347b83ea7497ed17c48ec14d8f64a3ce69cc8"
operationalTransition.docsTransitionFactsRole  role(A/CURRENT-AR-OPERATIONAL-TRANSITION.json)
operationalTransition.docsOnlyVerified     true
operationalTransition.wholeProductionCommonGuardMustRefresh  true
previousScopeAdoption                      {Q/CURRENT-AP-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json, 2942, b0e268df5d8e7cd749286c5b91c09a2b8d88926697413bd5313f46854e2cc126}
publishedReadback                          role(PUB/PUSH-READBACK.json)
remoteRefsVerified                         {"refs/heads/main": "c902a704…", "refs/heads/wip/headless-program-20260916-ts": ${HEAD_AR}}
scope                                      "Unchanged original A208 protection procedure rebound to actual published AR solely for the one-attempt fullfunction recovery route. Fresh complete production/common baseline replaces no historical evidence; bc21a3df… and every failed result remain historical. Private R9 original proof and historical M0 authority remain distinct and unchanged. No M0 root metadata adoption, scientific waiver or runtime grant."
```

`snapshot.py` L83 checks exactly: status, `productionGuardHead == config.productionHead`, `productionSourceTree`, `combinedHFirstRouteUnchanged is True`, `H8708Waived is False`, `executionAuthorization is False`, `operationalTransition.docsOnlyVerified is True`, `operationalTransition.actualHead == config.productionHead`, `remoteRefsVerified == config.operationalRemoteRefs`.

#### 5.2.5 `A/PRIOR-FAILURES-PRESERVED-ADOPTION.json` (schema `1370-ar-prior-failures-preserved-adoption/v1`, status `ROOT_RECORDED_PRIOR_FAILURES_REMAIN_FAILED`)

```
userConstraint            "Preserve failures and do not repin unexplained results."
ownerDecision             {"text": verbatim HANDOFF.md L23 sentence beginning "Owner answer received 2026-10-10" and L25 quote "Owner approval not needed for anything, just go make it happen.", "recordedAt": "HANDOFF.md at ${HEAD_AR}"}
failedRoute42397          {actualTool {S/1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-recorded-20261010-r1/ACTUAL-TOOL.json, 1333, 13f8fb04…}, readback {…/READBACK.json, 7986, 0c4deb56…}, recorderResult {S/…-recorder-results-20261010-r1/RESULT.json, 975, eb4ade56…}, workerResult {S/…-results-20261010-r1/RESULT.json, 2235, ad2d7189…}, rootBinding {Q/NATIVE-REFUSAL-FULLFUNCTION-ROOT-BINDING.json, 5492, 604bcfe8…}, generatedHeadCorrection {Q/FULLFUNCTION-R2-GENERATED-HEAD-REVIEW-CORRECTION.json, 2459, 36ac9673…}, laneMeta {S/1370-aq-m0-fullfunction-native-refusal-diagnostic-lane-20261010-r1.meta, 548, 91212859…}, finalExit 2, status "FAILED_PRESERVED"}
failedPostflight54871     {adoption {Q/SHARED-POSTFLIGHT-FAILURE-OBSERVED-ADOPTION.json, 4175, 1de73d51…}, failureReadback {S/1370-aq-native-refusal-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1/FAILURE-READBACK.json, 3879, 6a32717a…}, independentReview {S/…-independent-failure-review-20261010-r2/RECEIPT.json, 9498, 96dd01ab…}, status "FAILED_PRESERVED"}
diagnostic96592           {adoption {Q/SHARED-GUARD-DIAGNOSTIC-OBSERVED-ADOPTION.json, 3322, 14017425…}, readback {S/1370-aq-original-shared-postflight-diagnostic-parent-recorded-20261010-r1/READBACK.json, 4227, 1d643b28…}, comparison {S/1370-aq-retained-immutable-comparison-parent-recorded-20261010-r1/COMPARISON-LOCAL.json, 1533, 3625225e…}, changedPath ["protectedDigests","commonGit"], status "FAILED_PRESERVED_NOT_PROTECTION"}
unexplainedInterval       {"startUtc": "2026-10-10T12:10:59Z", "endUtc": "2026-10-10T12:11:44Z", "rootBindingUtc": "2026-10-10T12:10:58.902881+00:00", "recorderResultUtc": "2026-10-10T12:11:44.158671+00:00", "indexMtimeUtc": "2026-10-10T12:11:03.024858Z", "sources": [laneMeta role, source finding role 89510545…], "status": "UNQUALIFIED_UNEXPLAINED_PRESERVED"}
historicalBaseline        {S/1370-aq-current-operational-fullguard-source-20261010-r1/evidence/before-fill-current-ap-r1/SNAPSHOT.json, 9737682, bc21a3dfd61812205d4499d4d0ba7cc04c868a1aa69216d3353bb4b6e278e0ec}  with "disposition": "HISTORICAL_NEVER_REPINNED"
priorProtectedStopAdoption {AP/NATIVE-FULLFUNCTION-STOP-OBSERVED-ADOPTION.json, 13645, b163345cae6eddad877aca5cae37d588ef007240fb56ea68a34575c305f6fcbf}
recoveryProposal          role 51551f01…; recoveryProposalReview role b8df3ed1…; recoveryProposalAdoption {Q/OPERATIONAL-RECOVERY-PROPOSAL-ADOPTION.json, 918, 32f9fb56…}
executionAuthorization    false
```

#### 5.2.6 `AM/RECOVERY-AMENDMENT.md` and `A/OPERATIONAL-RECOVERY-AMENDMENT-ADOPTION.json`

`AM/RECOVERY-AMENDMENT.md` states, in this order: the owner decision text (HANDOFF.md L23, L25); the Gate 0 predicate; D1-D8; the list of roles in 5.2.5; the sentence "This amendment authorizes one attempt under the original 300/320/330 s bounds after fresh complete protection and independent review; it admits no prior failed attempt and repins no historical result." `A/OPERATIONAL-RECOVERY-AMENDMENT-ADOPTION.json` (schema `1370-ar-operational-recovery-amendment-adoption/v1`, status `ROOT_ADOPTED_OPERATIONAL_RECOVERY_AMENDMENT_SOURCE_ONLY`): `amendment` role(AM/RECOVERY-AMENDMENT.md), `priorFailures` role(5.2.5), `derivativeAuthority` role(D file), `derivativeAuthorityReview` role(RV_D RECEIPT), `gate0` role(A/GATE0-OBSERVATION.json), `baselineReplacementAuthorized false`, `freshBaselineAuthorized true`, `executionAuthorization false`.

#### 5.2.7 `A/FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json`

Copy of Q/FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json (2178 B, `6be89324…`) with: `schema` -> `1370-ar-fullfunction-protection-prospective-contract/v1`; `currentOperationalTransition` -> role(A/CURRENT-AR-OPERATIONAL-TRANSITION.json); `currentOperationalTransitionSchema` -> `1370-ar-current-ar-operational-transition/v1`; `productionHead` -> `${HEAD_AR}`; `protectionPath` -> `A/M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json`; `priorProtectedStopAdoption` -> role(A/PRIOR-FAILURES-PRESERVED-ADOPTION.json). Unchanged: `protectionSchema 1370-root-fullfunction-current-protection/v4`, `protectionStatus ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE`, key-name fields, `nativeRefusalControlsObservedAdoption 385249f0…`, `productionSourceTree`, boolean flags.

#### 5.2.8 `A/CURRENT-AR-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json`

Copy of Q/CURRENT-AP-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json (1365 B, `998f932c…`) with `adoptionPath` -> `A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json`, `adapterSourcePins` -> role(GA/SOURCE-PINS.json), `sourcePins` -> role(G/SOURCE-PINS.json), `sourceReview` -> role(RV_G RECEIPT). `adoptionSchema` and `adoptionStatus` unchanged (D6).

#### 5.2.9 `A/adopt_current_fullguard.py` (from Q/adopt_current_fullguard.py, 2715 B, `3d48405e…`)

```
EDIT L3:  "P=S/'1370-aq-current-ap-fullpreflight-parent-recorded-20261010-r1'" -> "P=S/'1370-ar-current-ar-fullpreflight-parent-recorded-20261010-r1'"
EDIT L15: "=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "=='${HEAD_AR}'"
EDIT L17: "actual['sessionId']==88384" -> "actual['sessionId']==<integer sessionId read from GP/ACTUAL-TOOL.json after the run>"   (COMPUTED; never guessed)
EDIT L20: "'998f932cb9ded3667f702bde23fd1c7d4baceb06349f4dbb99759ad1411d39bd'" -> COMPUTED sha256(A/CURRENT-AR-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json); and "Q/'CURRENT-AP-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json'" -> "Q/'CURRENT-AR-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json'"
EDIT L22: "Q/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'" -> "Q/'CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'"
```

(`Q` inside that script is `Path(__file__).parent`, i.e. A.) Unchanged definitions: `role`, `read`.

#### 5.2.10 `A/adopt_refusal_current_protection.py` (from Q/adopt_refusal_current_protection.py, 5180 B, `41326b18…`)

```
EDIT L3:  "P=S/'1370-aq-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1'" -> "P=S/'1370-ar-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1'"
EDIT L19: "get(Q/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','4bd6fe3766e73cd621f939b124d0da27e09fa4d097b64ae58041ee6955358cf1')" -> "get(Q/'CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','<COMPUTED sha256 of that file>')"
EDIT L20: "get(Q/'CURRENT-AP-OPERATIONAL-TRANSITION.json','8a7d765bbc472ccf5717fd2b3e68a362eac5db63f76b5fb523bd6fe3de1ed753')" -> "get(Q/'CURRENT-AR-OPERATIONAL-TRANSITION.json','<COMPUTED>')"
EDIT L22: "get(AP/'NATIVE-FULLFUNCTION-STOP-OBSERVED-ADOPTION.json','b163345cae6eddad877aca5cae37d588ef007240fb56ea68a34575c305f6fcbf')" -> "get(Q/'PRIOR-FAILURES-PRESERVED-ADOPTION.json','<COMPUTED>')"
EDIT L23: "Q/'CURRENT-AP-NATIVE-REFUSAL-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json'" -> "Q/'CURRENT-AR-NATIVE-REFUSAL-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json'"
EDIT L26: "'6be893244e2b268983325c78fa117645ca8ae7afa24983161ee789e330f6b9a3'" -> COMPUTED sha256(A/FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json)
```

L28 keeps every key; `'reviewedPriorStopAdoption':stop` now carries the prior-failures role; `'historicalTypesHead':'7087f116…'` stays. Unchanged definitions: `role`, `read`, `get`.

#### 5.2.11 `A/CURRENT-AR-NATIVE-REFUSAL-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json`

Copy of Q/CURRENT-AP-NATIVE-REFUSAL-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json (2029 B, `7c3fa529…`) with `currentFullPreflightAdoption` -> role(A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json), `independentSourceReview` -> role(RV_N RECEIPT), `operationalScopeAmendment` -> role(N/OPERATIONAL-SCOPE-AMENDMENT.json), `sourceManifest` -> role(N/SOURCE-PINS.json), `schema` -> `1370-ar-root-current-ar-native-refusal-prelaunch-source-and-amendment-adoption/v1`, `status` -> `ROOT_ADOPTED_CURRENT_AR_NATIVE_REFUSAL_PRELAUNCH_SOURCE_AND_BEFORE_FILL_REUSE_AMENDMENT`. (The adopt script L23 compares `independentSourceReview` and `sourceManifest` to the readback and checks `executionAuthorization is False`; it does not compare schema or status.)

### 5.3 Fresh-baseline fullguard

#### 5.3.1 G (from G0 `1370-aq-current-operational-fullguard-source-20261010-r1`)

| File | Derived from | Content |
|---|---|---|
| `BASELINE-CONFIG.json.txt` | G0/CONFIG.json (3928 B, `a058c0d63bd0f0432f26d4ebcae62a80977eaccfd7e2406cf7a7e6f221b23fec`) | byte copy |
| `BASELINE-snapshot.py.txt` | G0/snapshot.py (21984 B, `51f11d5f9bc55d77ed9e1b7d0bce4d36d1c9af865835617d585629fa8f694f85`) | byte copy |
| `CONFIG-DRAFT-UNFILLED.json` | G0/CONFIG-DRAFT-UNFILLED.json (3708 B, `516d9c51…`) | copy; `parentScopeAdoption` null; `status "UNFILLED_SOURCE_ONLY_AR_SCOPE_REQUIRES_GENUINE_ROOT_OPERATIONAL_ADOPTION"` |
| `CONFIG.json` | G0/CONFIG.json | key edits below |
| `snapshot.py` | G0/snapshot.py | one EDIT below |
| `CONFIG.json.forward.diff`, `.inverse.diff`, `.forward.json`, `.inverse.json`, `snapshot.py.forward.*`, `snapshot.py.inverse.*` | generated | unified diffs and lossless ndiff JSON between BASELINE and result |
| `PROOF.json` | G0/PROOF.json (4361 B, `99a8011e…`, schema `1370-aq-fullguard-ap-binding-source-proof/v1`) | regenerate with the same keys (`allFunctionsByteExact true`, `completeForwardInversePairs` two entries with `baseline/predecessor/forward/inverse/result` roles, `configChangedKeys`, `currentOperationalFacts` role(A transition), `currentOperationalScope` role(A scope adoption), `publishedReadback` role(PUB), `originalFunctionNames`, `privateSourceReadByAuthor false`, `runtimeOccurred false`, `sourceDelta`), schema `1370-ar-fullguard-ar-binding-source-proof/v1` |
| `READY-FOR-AUTHENTIC-FILL.json` | G0 (189 B) | `{actualGrant null, actualObservedReview null, actualSnapshot null, currentFullGuardsYetRun false, executionAuthorization false, genuineAuthorityFilled true}` |
| `SOURCE-PINS.json` | G0/SOURCE-PINS.json (5379 B, `1c00f8f4…`) | 15 `files` roles COMPUTED (two BASELINE txt, CONFIG-DRAFT, CONFIG, 4 CONFIG diffs, PROOF, READY, snapshot.py, 4 snapshot diffs); `schema "1370-ar-fullguard-ar-binding-source-pins/v1"`; `operationalFacts` role(A transition); `operationalScope` role(A scope adoption); `predecessor` {G0/SOURCE-PINS.json, 5379, 1c00f8f4e42402a972182ed643369c279149d74cb6a5cdb9208aa15269118c69}; `publishedReadback` role(PUB); `status "SOURCE_ONLY_UNRUN"`; `actualGrant null`; `independentReview null`; `executionAuthorization false` |
| `SEAL.json` | G0 | `{schema "1370-source-only-seal/v1", sourcePins role(G/SOURCE-PINS.json), actualGrant null, actualSnapshot null, executionAuthorization false}` (SEAL is not listed in SOURCE-PINS; acyclic) |
| `evidence/` | | empty directory, mode 0700 |

`G/CONFIG.json` key edits (JSON path -> old -> new); every other key byte-identical (`productionSourceTree 13880d9b…`, `originalCopyProductionHead 4812bb12…`, `docsOnlyAllowedFiles ["HANDOFF.md"]`, `docsOnlyAllowedPrefixes ["docs/"]`, `requiredFreeBytes 3758096384`, `requiredPythonPath/Sha256`, `privateBaseline 555867b2…`, `materializerSha256`, `bindingPath`, `bindingSemanticSha256`, `observedCopyReceipt 3a43f85e…`, `observedDecision`, `copiedRoot`, `retainedHParent`, `m0FdProtectedRoot`, lock paths, `declaredWitnessScratchChildren`, `sourcePinsSha256`, `sourceReviewSha256`, `scratchParentPolicy`, `schema 1370-a208-current-operational-full-guard-config-r2`):

```
productionHead                                                   "d20347b83ea7497ed17c48ec14d8f64a3ce69cc8" -> ${HEAD_AR}
operationalRemoteRefs["refs/heads/wip/headless-program-20260916-ts"] "d20347b83ea7497ed17c48ec14d8f64a3ce69cc8" -> ${HEAD_AR}
parentScopeAdoption                                              {path Q/CURRENT-AP-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json, sha256 b0e268df…} -> {path A/CURRENT-AR-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json, sha256 COMPUTED}   (two keys only; snapshot.py L82 requires set(role)=={'path','sha256'})
status                                                           "FILLED_SOURCE_ONLY_AP_PROTECTION_SCOPE_SEPARATE_SCAN_GRANT_REQUIRED" -> "FILLED_SOURCE_ONLY_AR_PROTECTION_SCOPE_SEPARATE_SCAN_GRANT_REQUIRED"
bootSessionUuid                                                  "452DE205-E1D6-462E-8673-553462BB0166" -> output of `/usr/sbin/sysctl -n kern.bootsessionuuid` at fill time (unchanged if no reboot; snapshot.py L46 compares live to config)
```

`configChangedKeys` in PROOF.json is therefore `["operationalRemoteRefs","parentScopeAdoption","productionHead","status"]`, plus `"bootSessionUuid"` only if a reboot happened.

```
EDIT G/snapshot.py L14: "CONFIG_SHA='a058c0d63bd0f0432f26d4ebcae62a80977eaccfd7e2406cf7a7e6f221b23fec'" -> "CONFIG_SHA='<COMPUTED sha256(G/CONFIG.json)>'"
```

No other byte of `snapshot.py` changes; `allFunctionsByteExact` must hold for `require, sha, canonical, read, write, dump, command, directory_identity, ancestry, current, main` (RV_G AQ receipt listed exactly these).

#### 5.3.2 GA (from GA0 `1370-aq-current-operational-fullguard-root-adapters-source-20261010-r1`)

`run_current_fullguard_once.py` (from GA0, 3864 B, `bb793bc87fbdefa5670ae0bb10ddc155a9bd2796fc2e2016f960038a1ee297da`):

```
EDIT L3:  "A=Path('/Users/zacheryspector/studio-scratch/1370-aq-root-continuation-20261010-r1')" -> "A=Path('/Users/zacheryspector/studio-scratch/1370-ar-root-continuation-20261010-r1')"
EDIT L3:  "G=S/'1370-aq-current-operational-fullguard-source-20261010-r1'" -> "G=S/'1370-ar-current-operational-fullguard-source-20261010-r1'"
EDIT L3:  "P=S/'1370-aq-current-ap-fullpreflight-parent-recorded-20261010-r1'" -> "P=S/'1370-ar-current-ar-fullpreflight-parent-recorded-20261010-r1'"
EDIT L13: "'1c00f8f4e42402a972182ed643369c279149d74cb6a5cdb9208aa15269118c69'" -> COMPUTED sha256(G/SOURCE-PINS.json)
EDIT L20: "=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "=='${HEAD_AR}'"
EDIT L21: "G/'evidence/before-fill-current-ap-r1'" -> "G/'evidence/before-fill-current-ar-r1'"
EDIT L22: "A/'CURRENT-AP-FULLGUARD-SOURCE-ADOPTION.json'" -> "A/'CURRENT-AR-FULLGUARD-SOURCE-ADOPTION.json'"
EDIT L26: "'before-fill','before-fill-current-ap-r1'" -> "'before-fill','before-fill-current-ar-r1'"
```

Unchanged: L4 `PY`, L14 decision literal `ACCEPT_CURRENT_AP_FULLGUARD_BINDINGS_SOURCE_ONLY`, L17 Python sha, L22 schema/status strings, L27 grant dict, L29-31 streams and execve. Unchanged definitions `role`, `put`.

`read_current_fullpreflight.py` (from GA0, 5421 B, `a890b9570777770a39115b47264015def49a7b35f4ca7ac18360823adeb0dc48`):

```
EDIT L3: AQ root -> A; "P=S/'1370-aq-current-ap-fullpreflight-parent-recorded-20261010-r1'" -> GP; "G=S/'1370-aq-current-operational-fullguard-source-20261010-r1'" -> G; "O=G/'evidence/before-fill-current-ap-r1'" -> "O=G/'evidence/before-fill-current-ar-r1'"
EDIT L25: "imm['operationalProductionHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "imm['operationalProductionHead']=='${HEAD_AR}'"
```

L29-30 literals (`12485` dependency entries per copy, `176` physical checkout entries) stay. If the fresh scan reports other counts the reader fails at L29 or L30; record the actual counts in `A/GATE0-OBSERVATION.json` under `fullguardReaderStop` and hold. Do not edit the literals to pass.

Other GA files: `HISTORICAL-prepare_current_fullguard.py.txt` byte copy (documentary); `BASELINE-RECIPE.json.txt`, `BASELINE-read_current_fullpreflight.py.txt`, `BASELINE-run_current_fullguard_once.py.txt` = byte copies of GA0 `RECIPE.json`, `read_current_fullpreflight.py`, `run_current_fullguard_once.py`; `RECIPE-DRAFT-UNFILLED.json` copy of GA0 (2161 B) with nulls; `RECIPE.json` regenerated from GA0/RECIPE.json (3564 B, `86af3061…`) with `currentPublishedAPHead` renamed `currentPublishedHead` = `${HEAD_AR}`, new `historicalAPHead` = `d20347b8…`, `genuineRootFacts` role(A transition), `genuineRootScope` role(A scope adoption), `guardConfig`/`guardSource`/`guardSourcePins` COMPUTED G roles, `launchArgv[3]` and `readerArgv[3]` GA paths, `parentPath` GP, `snapshotOutput` `G/evidence/before-fill-current-ar-r1`, `publishedReadback` role(PUB), `schema "1370-ar-current-ar-fullguard-root-adapters-source-recipe/v1"`, `status "FILLED_SOURCE_ONLY_UNRUN_ROOT_REVIEW_AND_SEPARATE_SCAN_GRANT_REQUIRED"`, `requiredIndependentDecision` unchanged; the four `*.forward.*`/`*.inverse.*` files per script and for RECIPE; `SOURCE-PROOF.json` regenerated; `SOURCE-PINS.json` (`schema "1370-ar-current-ar-root-guard-adapters-source-pins/v1"`, 21 `files` roles as in GA0, `guardSourcePins` role(G/SOURCE-PINS.json), `operationalFacts`, `operationalScope`, `predecessor` {GA0/SOURCE-PINS.json, 8034, 9ab3c274c71d997e08a49af2e1ef477d251b4abe8d6d765049d9add3b6510909}, `publishedReadback`, `status "SOURCE_ONLY_UNRUN"`); `SEAL.json`.

RV_G RECEIPT required fields (AQ receipt `084aa42a…` shape): `decision`, `sourcePins` == role(G/SOURCE-PINS.json) (launcher L14 compares `review['sourcePins']==sp`), `sourceManifest` same role, `adapterSourcePins` role(GA/SOURCE-PINS.json), `configChangedKeys`, `allFunctionBodiesByteExact` for snapshot.py (11 names) and both adapters, `concreteFindings []`, `executionAuthorization false`, `currentProductionHead ${HEAD_AR}`, `productionSourceTree 13880d9b…`, `historicalAPHead d20347b8…`, `operationalFacts`, `operationalScope`, `publishedReadback`, `wholeForwardInversePairsIndependentlyApplied 5`.

### 5.4 N: short prelaunch preparation (from N0)

Three scripts keep their file names (review alias list `current-ap-root-prelaunch.py`, `PRELAUNCH-CONFIG-UNFILLED.json`, `run_current_ap_prelaunch_once.py`, `read_current_ap_prelaunch.py` is compared literally at launcher L17).

`current-ap-root-prelaunch.py` (from N0, 15565 B, `50450176011732d5…`):

```
EDIT L4:  ACTUAL_CURRENT_AP_FULL_PREFLIGHT_ADOPTION={'path': 'Q/CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json', 'bytes': 5252, 'sha256': '4bd6fe37…'} -> role(A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json) COMPUTED (same literal dict form)
EDIT L5:  ACTUAL_CURRENT_AP_FULL_PREFLIGHT_SNAPSHOT={'bytes': 9737682, 'path': 'G0/evidence/before-fill-current-ap-r1/SNAPSHOT.json', 'sha256': 'bc21a3df…'} -> role(G/evidence/before-fill-current-ar-r1/SNAPSHOT.json) COMPUTED
EDIT L81: "SCRATCH/'1370-aq-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1'" -> "SCRATCH/'1370-ar-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1'"
EDIT L86: "gp=SCRATCH/'1370-aq-current-operational-fullguard-source-20261010-r1'" -> "gp=SCRATCH/'1370-ar-current-operational-fullguard-source-20261010-r1'"
EDIT L87: "'a058c0d63bd0f0432f26d4ebcae62a80977eaccfd7e2406cf7a7e6f221b23fec'" -> COMPUTED sha256(G/CONFIG.json)
EDIT L88: "'51f11d5f9bc55d77ed9e1b7d0bce4d36d1c9af865835617d585629fa8f694f85'" -> COMPUTED sha256(G/snapshot.py)
EDIT L103: "=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "=='${HEAD_AR}'"
```

Unchanged: L7-8 REPO/SCRATCH, L63/L65 git predicates, L83 config schema `1370-root-m0-current-ap-root-prelaunch-config/v2`, L94-99 copy admission `3a43f85e…`, materializer binding `5f6de741…`, original prelaunch `fd2f806d…`, reuse plan `acd0e3cb…`, L101 snapshot schema, L112 `c902a704…` (origin/main must still be that commit; section 7.2 verifies), L119-120 output schema `1370-root-m0-current-ap-root-prelaunch-observation/v2`. Byte-exact helper definitions: `require, sha, canonical, read, write, dump, command, directory_identity, ancestry, current, exact_role`.

`run_current_ap_prelaunch_once.py` (from N0, 10223 B, `e597bc24b7a641f2…`):

```
EDIT L2:  constant dict -> role(A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json) COMPUTED
EDIT L4:  "Q=Path('S/1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1')" -> N; "P=Path('S/…-prelaunch-parent-recorded-20261010-r1')" -> NP; "O=Path('S/…-prelaunch-output-20261010-r1')" -> NO
```

`A=S/'1370-an-root-continuation-20261009-r1'` on L4 stays (historical types adoption). L15 schema and decision literals, L20 controls role `{16532, Q/NATIVE-REFUSAL-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json, 385249f0…}`, L41 types role, L53 Python sha, L56-59 grant and exec stay. Helpers `role, check, put` byte-exact.

`read_current_ap_prelaunch.py` (from N0, 10308 B, `f5cf467cb9f39a4e…`):

```
EDIT L2:  constant dict -> role(A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json) COMPUTED
EDIT L4:  "A=Path('S/1370-aq-root-continuation-20261010-r1')" -> A; P -> NP; O -> NO
EDIT L40: "'/Users/zacheryspector/studio-scratch/1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1/current-ap-root-prelaunch.py'" -> N path
EDIT L44: "snap['immutable']['operationalProductionHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "…=='${HEAD_AR}'"
```

L55 output name `A/'M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json'` and schema/status strings stay. Helpers `role, put` byte-exact.

JSON files: `PRELAUNCH-CONFIG-UNFILLED.json` (`baseline` -> AR snapshot role, `currentFullPreflightAdoption` -> AR adoption role, `guardConfig`/`guardSource` -> G roles, `copyAdmission`, `materializerBinding`, `materializerSource`, `originalPrelaunchSource`, `originalReusePlan` unchanged, `outputPath`/`ownedPgids`/`protectedSnapshot` null, `protectedFreezeContinues true`, `executionAuthorization false`, `schema 1370-root-m0-current-ap-root-prelaunch-config/v2`); `EXACT-ARGV.json` (paths -> N/NP/NO, `actualFullGuardGrant` -> role(GP/GRANT.json), `knownPriorFullguardOwnedGroup` -> GP GRANT `ownedPgid`, `actualNativeRefusalControlsAdoption` unchanged); `CONTRACT.json` (`fullGuardAdoptionProspectiveContract` -> role(5.2.8), `fullfunctionProtectionProspectiveContract` -> role(5.2.7), `protectionContract.currentAPFullPreflightAdoption`/`Snapshot` -> AR roles, everything else unchanged); `OPERATIONAL-SCOPE-AMENDMENT.json` (`currentFullPreflightAdoption` and `snapshot` -> AR roles; `rationale` text: replace "AP publication ended older AO freeze" with "AR publication ended the AP freeze"; add key `historicalFailuresPreserved` role(5.2.5); `schema "1370-ar-current-ar-prelaunch-reuse-scope-amendment/v2"`); `PROSPECTIVE-BINDING-CONTRACT.json` (keys `actualCurrentAPFullPreflightAdoption, actualCurrentAPFullPreflightSnapshot, actualFullGuardGrant, actualGrant, actualObservedReview, actualObservedReviewDecision, actualObservedReviewSchema, actualReadbackPath, actualReadbackSchema, actualReadbackStatus, actualShortPrelaunch, executionAuthorization, fullPreflightAdoptionSchema, fullPreflightAdoptionStatus, nativeRefusalControlsObservedAdoption, outputPath, parentPath, protectionProtocol, requiredFullPreflightObservedDecision, runtime, schema, sourceReviewAliases, sourceReviewDecision, sourceReviewSchema`: replace each AQ role with its AR counterpart, paths with NP/NO/A, strings unchanged); `OPERATIVE-BINDING-AUDIT.json` (keys `actualGuardGrant, allOperativeFullPreflightRolesFilled, baseline, controlsObservedAdoption, currentAPAdoption, currentAPHead, executionAuthorization, fullGuardConfig, fullGuardSource, futureActualProtection, futureActualShortObservedReview, futureActualShortPrelaunch, oldHardcodedGroup18361Absent, outputPath, parentPath, readbackPath, sourcePackage`: AR roles, `currentAPHead` = `${HEAD_AR}`); `READY-FOR-GENUINE-FULLSCAN-FILL.json` (`actualPrelaunch null, actualProtection null, executionAuthorization false, missingActualFields [], status`); `BASELINE-*` byte copies of the N0 counterparts (seven files); the per-file `.diff`, `.forward.json`, `.inverse.json`; `SOURCE-PROOF.json` regenerated; `SEAL.json` (`actualGrant null, actualPrelaunch null, executionAuthorization false, schema, sourceManifest role(N/SOURCE-PINS.json)`); `SOURCE-PINS.json` (`schema "1370-ar-current-ar-native-refusal-prelaunch-source-pins/v2"`, `predecessor` {N0/SOURCE-PINS.json, 16628, 035ac9dcdbd73073c0c0cec5c1fc66e449840485ba13b77366c319d5593db18f}, `status "SOURCE_ONLY_UNRUN_PENDING_INDEPENDENT_REVIEW"`, `actualGrant null`, `actualIndependentReview null`, `executionAuthorization false`, `files` 49 roles as in N0).

### 5.5 F: route source (from F0 `1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r3`)

Apply MAP to every self file first.

`CORE-TEST-TEMPLATE.ts` (F0 1507350f14c0d69d71c32cd253202bfc5c0865b6eb62ebe0f8dfbeadeab4e9eb, 3955 B):

```
EDIT L11: " assert.equal(binding.operationalHead,'d20347b83ea7497ed17c48ec14d8f64a3ce69cc8')" -> " assert.equal(binding.operationalHead,'${HEAD_AR}')"
```

L12 `assert.equal(binding.productionSourceTree,'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554')` unchanged. Byte length stays 3955.

`CONFIG-TEMPLATE.mts` (28b1a544b14a27856d29ba8506da8d4577c38b969ca0c89f4c84f4fef70a86d7, 1154 B): MAP only (L5 import path becomes `F/canonical-typescript-transform.mjs`).

`canonical-typescript-transform.mjs` (71c3f791da660a280b04fcfb9038e037ff3c3ac2a080fec38f2164f85176751a, 1906 B) and `RESOLUTION-SOURCE-BINDING.json` (5f00139d2e30e94a5b5cea6db164f8786fd65ee4fc89c24d52b0f75f945ae373, 78208 B): byte copies (MAP matches nothing in them; assert sha equality after copy).

`CONFIG.json` (734378eccb25131f1a3bdaaa22df8504175ea019b95a9cfbc2b0572bc9d91db0, 31407 B). MAP first (L142 laneLog, L193 outputPath, L194 parentRecordedPath, L235 recorderOutputPath, L276 runId, L67/L77/L281/L286 self paths), then key edits:

```
operationalHead                                  "d20347b83ea7497ed17c48ec14d8f64a3ce69cc8" -> ${HEAD_AR}
historicalAPHead (new)                           "d20347b83ea7497ed17c48ec14d8f64a3ce69cc8"
historicalAOToAPTransition (new)                 {Q/CURRENT-AP-OPERATIONAL-TRANSITION.json, 1029, 8a7d765bbc472ccf5717fd2b3e68a362eac5db63f76b5fb523bd6fe3de1ed753}   (verbatim r3 actualCurrentOperationalTransition)
actualCurrentOperationalTransition               -> role(A/CURRENT-AR-OPERATIONAL-TRANSITION.json) COMPUTED
actualCurrentAPFullPreflightAdoption             {Q/CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json, 5252, 4bd6fe37…} -> role(A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json) COMPUTED
fullfunctionProtectionProspectiveContract        {Q/FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json, 2178, 6be89324…} -> role(A/FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json) COMPUTED
currentProtection                                null -> role(A/M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json) COMPUTED (filled at step 12 only)
reviewedPriorStopAdoption                        null -> role(A/PRIOR-FAILURES-PRESERVED-ADOPTION.json) COMPUTED
proofMethods                                     {S/1370-an-m0-post-r6-preservation-diagnostic-source-20261009-r2/runner.py, 44067, b9ff56da…} -> {S/1370-aq-proof-git-optional-locks-sanitizer-source-20261010-r1/runner.py, 44107, 6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa}
proofMethodsDerivativeAuthority (new)            role(D/PROOF-METHODS-DERIVATIVE-AUTHORITY.json) COMPUTED
proofMethodsDerivativeAuthorityReview (new)      role(RV_D/RECEIPT.json) COMPUTED
inputs["RESOLUTION-SOURCE-BINDING.json"]         role(F/RESOLUTION-SOURCE-BINDING.json) COMPUTED (sha unchanged, path new)
inputs["canonical-typescript-transform.mjs"]     role(F/canonical-typescript-transform.mjs) COMPUTED
templates["CONFIG-TEMPLATE.mts"]                 role(F/CONFIG-TEMPLATE.mts) COMPUTED
templates["CORE-TEST-TEMPLATE.ts"]               role(F/CORE-TEST-TEMPLATE.ts) COMPUTED
heldUnfilledActualRoles                          ["currentProtection","reviewedPriorStopAdoption","actualSourceReview","actualGrant"] -> ["actualSourceReview","actualGrant"] after step 12 fill
```

Unchanged keys (verbatim r3): `bounds`, `historicalTypesAdoption` (be632d53…), `historicalTypesHead` 7087f116…, `historicalANHead` 0cf8b1d0…, `historicalAOHead` f2f97c62…, `historicalAMToANTransition` {S/1370-ao-root-continuation-20261010-r1/CURRENT-AN-OPERATIONAL-TRANSITION.json, 1030, d92458f0d1af8249280ae2298c3d2eff4e62d53b271814dd8d745c3d9f073ccd}, `historicalANToAOTransition` {AP/CURRENT-AO-OPERATIONAL-TRANSITION.json, 1029, 8ed8eab0ba445edbd2b93f0f87e932e9c3f902d42fe56cf14e6c7d7166b8976c}, `proofConfig` {…diagnostic-source-20261009-r2/CONFIG.json, 32755, c40c0a34d07532d4690552318958029ec736d32283dcec59b0b33191bf82bc4c}, `typesAdoptionContract`, `currentProtectionSchema`, `currentFullPreflightContract`, `reviewAliases` (20), `productionSourceTree`, `schema 1370-fullfunction-qualification-config/v1`, `executionAuthorization false`, `actualNativeRefusalControlsObservedAdoption` 385249f0…, `actualNativeObserverControlsObservedAdoption` 401e54ce…, `actualLosslessControlsObservedAdoption` fa668549…, `nativeRefusalDiagnosticAuthorities`, `nativeObserverAuthorities`, `historicalAO48Authorities`, `historicalPure49Template`, `historicalRepresentationInputs`, `representationInputs`, `nativeObserverInputs`, `historicalNativeObserverInputs`, `parserInputs`, `probeDiagnosticAuthorities`, `transformTools`, `templates["FULL-BODY-CONTROLS-TEMPLATE.ts"]`, all other `inputs`, `acceptedR3*`, `artifactBoundProposal`, `*Contract` keys, `originalFailuresPreserved true`, `actual*` nulls (`actualFixtures`, `actualGrant`, `actualMeaningfulMutantRed`, `actualSourceReview`, `actualSuccessfulTypesAdoption`, `sourceReview`).

`run-fullfunction.py` (de776901d14168dba72ae95a6c8f4fc6e37aedd3926683c45ae61d8e5527b305, 36742 B). Edits inside `authenticate_current_protection` (L109-121) and L4 only:

```
EDIT L4:   "CONFIG_SHA='734378eccb25131f1a3bdaaa22df8504175ea019b95a9cfbc2b0572bc9d91db0'" -> "CONFIG_SHA='<COMPUTED sha256(F/CONFIG.json)>'"
EDIT L117: "transition['schema']=='1370-aq-current-ap-operational-transition/v1'" -> "transition['schema']=='1370-ar-current-ar-operational-transition/v1'"
EDIT L117: "transition['predecessor']==c['historicalAOHead']" -> "transition['predecessor']==c['historicalAPHead']"
INSERT before L117 (new line, two-space indent):
  ap=load(c['historicalAOToAPTransition']);need(ap['schema']=='1370-aq-current-ap-operational-transition/v1' and ap['actualHead']==c['historicalAPHead'] and ap['predecessor']==c['historicalAOHead'] and ap['sourceTree']==c['productionSourceTree'] and ap['docsOnlyVerified'] is True and ap['workingTreeClean'] is True and ap['executionAuthorization'] is False,'HISTORICAL_AO_TO_AP_CONTINUITY');read(ap['publishedReadback'])
REPLACE L118 with the r2 pre-image:
  for k in ['actualPreflight','actualPreflightReadback','independentPreflightReview','reviewedPriorStopAdoption']:read(p[k],16*1024**2)
DELETE L119 (the RECENT_SHARED_POSTFLIGHT_READBACK / RECENT_SHARED_POSTFLIGHT_BASELINE line)
REPLACE L120 with:
  pre=load(p['actualPreflightReadback']);need(pre['toolExit']==0 and pre['scannerAbsent'] is True and pre['preflight']==p['actualPreflight'] and pre['originalFullSnapshot']==p['currentAPFullPreflightSnapshot'] and pre['currentFullPreflightAdoption']==p['currentAPFullPreflightAdoption'],'FRESH_CURRENT_PREFLIGHT_ON_FRESH_BASELINE')
INSERT before L121 " return p" (two lines):
  d=load(c['proofMethodsDerivativeAuthority']);need(d['schema']=='1370-ar-proof-methods-derivative-authority/v1' and d['acyclic'] is True and d['executionAuthorization'] is False and d['correctedSource']==c['proofMethods'] and d['correctedSource']['sha256']=='6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa' and d['historicalSource']['sha256']=='b9ff56da6524243c95045b0e09f25ca4ec5c8225bbdd3eb76820e75b928e350d' and d['soleChangedDefinition']=='clean_git_env' and not any(k in d for k in ('currentProtection','freshSourceProof','freshDependencyProof')),'PROOF_METHODS_DERIVATIVE_AUTHORITY')
  for k in ['historicalSource','correctedSource','wholeInverse','forwardDiff','contract','sourcePins','seal','independentSourceReview','regressionControlsAdoption','regressionControlsResult','regressionControlsObservedReview','sourceFinding']:read(d[k],16*1024**2)
  r=load(c['proofMethodsDerivativeAuthorityReview']);need(r['schema']=='1370-ar-proof-methods-derivative-authority-independent-review/v1' and r['decision']=='ACCEPT_STATIC_PROOF_METHODS_DERIVATIVE_AUTHORITY_ONLY' and r['subject']==c['proofMethodsDerivativeAuthority'] and r['concreteFindings']==[] and r['executionAuthorization'] is False,'PROOF_METHODS_DERIVATIVE_REVIEW')
```

`load`, `need`, `read` are the module's existing helpers (`read(role, cap)` authenticates a role; `load(role)` parses JSON). L49, L110-116, L123-125 (`UNFILLED_CURRENT_AP_AUTHORITY`), L181-190 stay byte-identical: L181 still `exec(compile(source,c['proofMethods']['path'],'exec'),ns)` and L182 still injects `ns['CONFIG']=proof_config; ns['CURRENT_HEAD']=c['operationalHead']`; L188 writes `FIRST-PROOF.json` with `'proofMethods':c['proofMethods']` (now the corrected runner). `changedDefinitions` must be exactly `['authenticate_current_protection']`.

`run-fullfunction.mjs` (2ae6f6fbfd655bcfc0e2790f2a910414cd0a3b537c539746ad057ec474fb9f96, 39962 B). Edits inside `authenticateCurrentProtection` (L75-88) and L8:

```
EDIT L8:  "CONFIG_SHA='734378eccb25131f1a3bdaaa22df8504175ea019b95a9cfbc2b0572bc9d91db0'" -> COMPUTED sha256(F/CONFIG.json)
EDIT L83: "t.schema==='1370-aq-current-ap-operational-transition/v1'" -> "t.schema==='1370-ar-current-ar-operational-transition/v1'"
EDIT L83: "t.predecessor===c.historicalAOHead" -> "t.predecessor===c.historicalAPHead"
INSERT before L83 (one-space indent):
 const ap=json(c.historicalAOToAPTransition);need(ap.schema==='1370-aq-current-ap-operational-transition/v1'&&ap.actualHead===c.historicalAPHead&&ap.predecessor===c.historicalAOHead&&ap.sourceTree===c.productionSourceTree&&ap.docsOnlyVerified===true&&ap.workingTreeClean===true&&ap.executionAuthorization===false,'HISTORICAL_AO_TO_AP_CONTINUITY');readRole(ap.publishedReadback);
REPLACE L84 with the r2 pre-image:
 for(const k of ['actualPreflight','actualPreflightReadback','independentPreflightReview','reviewedPriorStopAdoption'])readRole(p[k],16*1024*1024);
DELETE L85
REPLACE L86 with:
 const pre=json(p.actualPreflightReadback);need(pre.toolExit===0&&pre.scannerAbsent===true&&equal(pre.preflight,p.actualPreflight)&&equal(pre.originalFullSnapshot,p.currentAPFullPreflightSnapshot)&&equal(pre.currentFullPreflightAdoption,p.currentAPFullPreflightAdoption),'FRESH_CURRENT_PREFLIGHT_ON_FRESH_BASELINE');
INSERT before L87 " return p;":
 const d=json(c.proofMethodsDerivativeAuthority);need(d.schema==='1370-ar-proof-methods-derivative-authority/v1'&&d.acyclic===true&&d.executionAuthorization===false&&equal(d.correctedSource,c.proofMethods)&&d.correctedSource.sha256==='6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa'&&d.historicalSource.sha256==='b9ff56da6524243c95045b0e09f25ca4ec5c8225bbdd3eb76820e75b928e350d'&&d.soleChangedDefinition==='clean_git_env'&&!('currentProtection' in d)&&!('freshSourceProof' in d)&&!('freshDependencyProof' in d),'PROOF_METHODS_DERIVATIVE_AUTHORITY');
 for(const k of ['historicalSource','correctedSource','wholeInverse','forwardDiff','contract','sourcePins','seal','independentSourceReview','regressionControlsAdoption','regressionControlsResult','regressionControlsObservedReview','sourceFinding'])readRole(d[k],16*1024*1024);
 const dr=json(c.proofMethodsDerivativeAuthorityReview);need(dr.schema==='1370-ar-proof-methods-derivative-authority-independent-review/v1'&&dr.decision==='ACCEPT_STATIC_PROOF_METHODS_DERIVATIVE_AUTHORITY_ONLY'&&equal(dr.subject,c.proofMethodsDerivativeAuthority)&&equal(dr.concreteFindings,[])&&dr.executionAuthorization===false,'PROOF_METHODS_DERIVATIVE_REVIEW');
```

`json`, `readRole`, `equal`, `need` are the module's existing helpers. L159 (`equal(first.proofMethods,c.proofMethods)`) stays and now compares against the corrected runner role.

`record-fullfunction.py` (2f8523d4032f4040f45c9b484d73abe04e0bef665ee5122534e2db715d6a3b66, 16762 B):

```
EDIT L5: "CONFIG_SHA='734378ec…'" -> COMPUTED sha256(F/CONFIG.json);  "WORKER_SHA='de776901d14168dba72ae95a6c8f4fc6e37aedd3926683c45ae61d8e5527b305'" -> COMPUTED sha256(F/run-fullfunction.py)
L6: MAP already changed the recorder results directory to RC.
```

No definition changes (`changedDefinitions` `[]`).

`RECIPE.json` (0e6dcffbf75a30d4…, 39462 B): MAP, then: `config` role(F/CONFIG.json); `currentProtection` = CONFIG value; `currentProtectionContract` = parsed contents of the protection file once filled (prepare_corrected.py L101 rule) else null; `reviewedPriorStopAdoption` = CONFIG value; `currentOperationalTransition` -> role(A transition); new `historicalAPHead`, `historicalAOToAPTransition`, `proofMethodsDerivativeAuthority`, `proofMethodsDerivativeAuthorityReview` copied from CONFIG; `operationalHead` `${HEAD_AR}`; `outputPaths {lane LL, recorder RC, runtime RR}`, `parentRecordedPath` RP, `directRecorderArgv[3]` `F/record-fullfunction.py` (MAP); `sourcePins` and `routeSourcePins` = the 20 alias roles from F/SOURCE-PINS.json (COMPUTED); `futureInputs.currentProtection` and `rootOnceGrantRequired.currentProtection` = CONFIG value; `heldUnfilledActualRoles` = CONFIG value; `sourceOnlyUnfilled` false after fill; `generatedAuthorityValidation {operationalHead ${HEAD_AR}, productionSourceTree 13880d9b…, sourceAudit "PREP/GENERATED-AUTHORITY-AUDIT.json", failedAttemptPreserved true, fixtureOrGameplayChanged false}`; `claimLimits` append `"AR rebinding: fresh operational baseline before-fill-current-ar-r1; failed 42397, 54871 and 96592 remain failed; interval 12:10:59Z to 12:11:44Z remains unqualified; proofMethods is the reviewed sanitizer derivative 6d834672 with original b9ff56da retained as historical."`. Everything else verbatim.

`WHOLE-FORWARD-INVERSE.json`: nine entries (`CONFIG-TEMPLATE.mts, CORE-TEST-TEMPLATE.ts, canonical-typescript-transform.mjs, record-fullfunction.py, run-fullfunction.py, run-fullfunction.mjs, RESOLUTION-SOURCE-BINDING.json, CONFIG.json, RECIPE.json`), each `{baseline: role(F0/<name>), losslessNdiff, forward, inverse, bothApplicationsVerified true}`.

`SOURCE-PINS.json`: `{schema "1370-fullfunction-qualification-source-pins/v1", executionAuthorization false, actualSourceReview null, actualGrant null, actualResult null, sourceOnlyUnfilled false, files: 22 entries}`: nine F self roles COMPUTED, `RECIPE.json` and `WHOLE-FORWARD-INVERSE.json` self roles, and these 13 external roles verbatim from F0: `exact-json.mjs` (2202, 90b49564…), `run-parser-controls.mjs` (7028, 612178f2…), `m0TraceCodec.mjs` (7882, 5276c5dc…), `m0WiringProbe.ts` (1800, c3da292f…), `traceSequences.mjs` (1286, 0880717f…), `m0NativeObserverRows.mjs` (10267, b280a92f…), `m0FeasibilityWitness-native.ts` (5868, 53fb7391…), `m0ObserverRowDiagnostic.mjs` (13288, db78301b…), `ordering.ts` (12555, 21cefca1…), `talentMarket.ts` (120462, 584c4609…), `typed-propagation-removed-talentMarket.ts` (120492, 2d558ac1…), `FULL-BODY-CONTROLS-TEMPLATE.ts` (9756, 87bd0ec6…).

### 5.6 P: parent source (from P0 `…-parent-source-20261010-r3`)

`launch-fullfunction.py` (9ac456741630343fa73e8dadf00486e85ecbe4c11cba131de682e21994ee7035, 21882 B). MAP first (L109 parent-recorded path; `source`/`P` directory literals), then:

```
EDIT L84:  "c['operationalHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "c['operationalHead']=='${HEAD_AR}'"
INSERT after L84 (two-space indent):
  require(c['proofMethods']['sha256']=='6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa' and load(authenticate(c['proofMethodsDerivativeAuthority']))['correctedSource']==c['proofMethods'] and load(authenticate(c['proofMethodsDerivativeAuthorityReview']))['decision']=='ACCEPT_STATIC_PROOF_METHODS_DERIVATIVE_AUTHORITY_ONLY','CURRENT_PROOF_METHODS_DERIVATIVE')
EDIT L90:  "'nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):authenticate(protection[name])" -> "'nativeRefusalControlsObservedAdoption'):authenticate(protection[name])"
EDIT L93:  "exact(preflight['originalFullSnapshot'],protection['recentProtectedPostflightSnapshot'])" -> "exact(preflight['originalFullSnapshot'],protection['currentAPFullPreflightSnapshot'])"
EDIT L101: "middle=load(authenticate(c['historicalANToAOTransition']));current=" -> "middle=load(authenticate(c['historicalANToAOTransition']));ap=load(authenticate(c['historicalAOToAPTransition']));current="
EDIT L101: "middle['actualHead']==current['predecessor']==c['historicalAOHead'] and current['actualHead']==c['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==current['sourceTree']==c['productionSourceTree'],'AM_AN_AO_AP_CONTINUITY'" -> "middle['actualHead']==ap['predecessor']==c['historicalAOHead'] and ap['actualHead']==current['predecessor']==c['historicalAPHead'] and current['actualHead']==c['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==ap['sourceTree']==current['sourceTree']==c['productionSourceTree'],'AM_AN_AO_AP_AR_CONTINUITY'"
EDIT L109: MAP produced "out==S/'1370-ar-m0-fullfunction-parent-recorded-20261010-r1'"; verify count==1.
```

Unchanged: L59 argv contract (`outer|inner`, binding path, binding sha), L85 clocks, L86-89, L88 generated-core guard, L91-92, L105-108 Python/Node/helper shas (`7673432d…`, `0b4f0599…`, `aff8e974…`), L110-127 (helper argv `['/bin/bash', helper, '0', c['laneLog'], PY, '-I', '-B', P/launch-fullfunction.py, 'inner', binding path, binding sha]`, grant dict, recorder argv `[PY,'-I','-B', F/record-fullfunction.py,'verification', grant path, grant sha]`). Unchanged definitions: `require, prep_timeout, remaining, metadata, role, authenticate, pairs, load, exact, write`; `changedDefinitions` `['main']`.

`read-fullfunction.py` (28f2ee0e271bace1b78820eda1f8c35c7cf9759e16893f0c0be997452410d07c, 15664 B). MAP first (L4 `P` -> RP, `F` -> F), then:

```
EDIT L38: "'734378eccb25131f1a3bdaaa22df8504175ea019b95a9cfbc2b0572bc9d91db0'" -> COMPUTED sha256(F/CONFIG.json)
EDIT L39: "'86d6cc43c35e182c25d42ed4cdf9042e0da700e916d35037490c3dd80d530973'" -> COMPUTED sha256(F/SOURCE-PINS.json)
EDIT L43: "'nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):need(role" -> "'nativeRefusalControlsObservedAdoption'):need(role"
```

Unchanged: L40 20-alias tuple, L50-51 argv checks, L52 lane meta regex, L86-92. Definitions `need, meta, role, pairs, load, put, identity, output_role` byte-exact; `changedDefinitions` `['main']`.

`RECIPE.json` (daed9b8010d4a19386ed88a534c8a029ff6512d320a8b282cb378d3953fff2e6, 2377 B): MAP; `sourceManifest` role(F/SOURCE-PINS.json); `config` role(F/CONFIG.json); `currentProtection` CONFIG value; `parentRecordedPath` RP; `heldUnfilledActualRoles` CONFIG value; `sourceOnlyUnfilled` false after fill; `aliases` (20), `rootBinding null`, `reviewDecision`, `rootReadbackDecision`, `preparationSeconds 60`, `runtimeBounds`, `nativeRefusalControlsObservedAdoption` verbatim.

`WHOLE-FORWARD-INVERSE.json`: two entries with baselines role(P0/launch-fullfunction.py) and role(P0/read-fullfunction.py). `SOURCE-PINS.json`: `{schema "1370-fullfunction-parent-source-pins/v1", executionAuthorization false, files {launch-fullfunction.py, read-fullfunction.py, RECIPE.json, WHOLE-FORWARD-INVERSE.json} COMPUTED, actualSourceReview null, actualGrant null, sourceOnlyUnfilled false}`.

### 5.7 W: root wrappers (from W0 `…-root-wrappers-source-20261010-r3`)

`run_observer_fullfunction_once.py` (e840568d66e3ae6c83132f89e75e3f687fe2a86a023ca6fd66fcc661bf19c49b, 12537 B). MAP first (L3 `Q` -> F, `P` -> P; L62 `parentPath` -> RP), then:

```
EDIT L3:  "A=Path('/Users/zacheryspector/studio-scratch/1370-aq-root-continuation-20261010-r1')" -> "A=Path('/Users/zacheryspector/studio-scratch/1370-ar-root-continuation-20261010-r1')"
EDIT L14: "'86d6cc43c35e182c25d42ed4cdf9042e0da700e916d35037490c3dd80d530973'" -> COMPUTED sha256(F/SOURCE-PINS.json)
EDIT L27: "p['productionHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'" -> "p['productionHead']=='${HEAD_AR}'"
EDIT L28: "'nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):assert role" -> "'nativeRefusalControlsObservedAdoption'):assert role"
INSERT after L39:
assert config['proofMethods']['sha256']=='6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa' and role(config['proofMethodsDerivativeAuthority']['path'])==config['proofMethodsDerivativeAuthority'] and read(config['proofMethodsDerivativeAuthority']['path'])['correctedSource']==config['proofMethods'] and role(config['proofMethodsDerivativeAuthorityReview']['path'])==config['proofMethodsDerivativeAuthorityReview'] and read(config['proofMethodsDerivativeAuthorityReview']['path'])['decision']=='ACCEPT_STATIC_PROOF_METHODS_DERIVATIVE_AUTHORITY_ONLY'
EDIT L46: "middle=read(config['historicalANToAOTransition']['path']);current=" -> "middle=read(config['historicalANToAOTransition']['path']);ap=read(config['historicalAOToAPTransition']['path']);current="
EDIT L47: "for key in ('historicalAMToANTransition','historicalANToAOTransition','actualCurrentOperationalTransition')" -> "for key in ('historicalAMToANTransition','historicalANToAOTransition','historicalAOToAPTransition','actualCurrentOperationalTransition')"
EDIT L48: "middle['actualHead']==current['predecessor']==config['historicalAOHead'] and current['actualHead']==config['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==current['sourceTree']==config['productionSourceTree']" -> "middle['actualHead']==ap['predecessor']==config['historicalAOHead'] and ap['actualHead']==current['predecessor']==config['historicalAPHead'] and current['actualHead']==config['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==ap['sourceTree']==current['sourceTree']==config['productionSourceTree']"
EDIT L61: "A/'NATIVE-REFUSAL-FULLFUNCTION-R3-SOURCE-ADOPTION.json'" -> "A/'FULLFUNCTION-AR-SOURCE-ADOPTION.json'"
EDIT L63: "A/'NATIVE-REFUSAL-FULLFUNCTION-R3-ROOT-BINDING.json'" -> "A/'FULLFUNCTION-AR-ROOT-BINDING.json'"
```

Unchanged: L17 combined review schema and decisions, L25 types `be632d53…` and bound `186c55ff…`, L29-45 controls authorities, L57 runtime tools `e7d0f540…`, L59 helper `aff8e974…`, L60 lock absence, L62 binding dict (cwd `R`, environment `{PYTHONDONTWRITEBYTECODE:'1', GIT_OPTIONAL_LOCKS:'0'}`), L63-64 argv `[PY,'-I','-B', P/launch-fullfunction.py,'outer', binding path, binding sha]` and `execve`. Definitions `role, read, checked, put` byte-exact; `changedDefinitions` `[]`.

`run_observer_reader_once.py` (ba87ccb5729be9f9aa1bac9a98a1dcd2d381a9099b94b13c81c41761282e88ff, 2608 B). MAP (L6 `Q` -> P, L18 `P` -> RP), then `EDIT L3: AQ root -> A`. L9 schema/decisions, L19 runtime tools sha, L22 Python sha, L23 argv `[PY,'-I','-B', P/read-fullfunction.py, sessionId, finalExit, sha256(RP/EXECUTION-GRANT.json), sha256(RP/ACTUAL-TOOL.json)]` unchanged.

`RECIPE.json` (803d7d4b…, 3009 B): MAP; `sourceManifest` role(F/SOURCE-PINS.json); `parentSourceManifest` role(P/SOURCE-PINS.json); `currentProtection` CONFIG value; `outputs {outputPath RR, recorderOutputPath RC, parentRecordedPath RP, laneLog LL}`; `launcherArgv[3]`, `readerWrapperArgv[3]` W paths; `sourceOnlyUnfilled` false after fill; placeholders and decisions verbatim. `WHOLE-FORWARD-INVERSE.json` two entries (baselines W0 scripts). `SOURCE-PINS.json` `{schema "1370-native-fullfunction-root-wrapper-source-pins/v1", executionAuthorization false, files {run_observer_fullfunction_once.py, run_observer_reader_once.py, RECIPE.json, WHOLE-FORWARD-INVERSE.json} COMPUTED, sourceOnlyUnfilled false, actualCombinedReview null}`.

### 5.8 PF and PFD: mandatory postflight through the diagnostic wrapper

`PF/launch-fullpostflight.py` (from PF0, 5301 B, `9878a994f41d5b5914dc43621da0fdb61b87a0625eed110aec5fecacb084f9e7`):

```
EDIT L3:  "A=S/'1370-aq-root-continuation-20261010-r1'" -> A; "G=S/'1370-aq-current-operational-fullguard-source-20261010-r1'" -> G; "P=S/'1370-aq-native-refusal-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1'" -> PFP   (D=S/'1370-an-m0-types-external-config-parent-recorded-20261009-r3' stays)
EDIT L18: "role(A/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json');assert preRole['sha256']=='4bd6fe3766e73cd621f939b124d0da27e09fa4d097b64ae58041ee6955358cf1'" -> "role(A/'CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json');assert preRole['sha256']=='<COMPUTED>'"
EDIT L20: "'1c00f8f4e42402a972182ed643369c279149d74cb6a5cdb9208aa15269118c69'" -> COMPUTED sha256(G/SOURCE-PINS.json)
EDIT L30: "label='postflight-fullfunction-native-refusal-diagnostic-r1'" -> "label='postflight-fullfunction-ar-r1'"
EDIT L37: "'scope':'Original shared nine-root/R9/dependency/full protected maps under current AP." -> "'scope':'Original shared nine-root/R9/dependency/full protected maps under current AR."
EDIT L39: "os.execve(argv[0],argv,dict(os.environ,**grant['environment']))" -> "os.execve(PY,[PY,'-I','-B',str(S/'1370-ar-shared-postflight-diagnostic-source-20261010-r1'/'diagnose_shared_post.py'),gr['path'],gr['sha256']],dict(os.environ,**grant['environment']))"
```

The grant keeps `argv` as the original scanner argv `[PY,'-I','-B', G/snapshot.py, receipt path, 3a43f85e…, 'ACCEPT_OBSERVED_MATERIALIZATION_COPY', S/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1, 'postflight', 'postflight-fullfunction-ar-r1', G/evidence/before-fill-current-ar-r1/SNAPSHOT.json, <baseline sha>, <csv of rb['recordedOwnedGroupIds']>]`. Stdout/stderr redirection (L36-39) stays, so `postflight.stdout` still carries exactly one scanner summary line.

`PF/read-fullpostflight.py` (from PF0, 5439 B, `549958b04cd815140da8e00dccb46c8c8061a169b0efd8763c47232674bff6ad`): `EDIT L3: P -> PFP, G -> G`; `EDIT L18: "G/'evidence/postflight-fullfunction-native-refusal-diagnostic-r1'" -> "G/'evidence/postflight-fullfunction-ar-r1'"`. Everything else unchanged (`v['immutable']==base['immutable']` at L23 is the equality proof).

`PFD/diagnose_shared_post.py` (from PFD0, 8803 B, `09c837aa56cb3b1482ca8acee030b643b5fdfdef825a3619c337f9f5c1971c0e`). `run_original`, `emit`, `differences`, `scalar`, `role`, `load` stay byte-exact. `main()` edits:

```
EDIT L90:  "g['schema']=='1370-root-original-shared-postflight-diagnostic-grant/v1'" -> "g['schema']=='1370-root-m0-direct-original-shared-full-postflight-grant/v1'"
EDIT L90:  "pins=load(g['sourcePins']);review=load(g['sourceReview'])" -> "pins=load(role(HERE/'SOURCE-PINS.json'));review=load(g['diagnosticSourceReview'])"
EDIT L94:  "scanner['sha256']=='51f11d5f9bc55d77ed9e1b7d0bce4d36d1c9af865835617d585629fa8f694f85'" -> "scanner['sha256']=='<COMPUTED sha256(G/snapshot.py)>'"
DELETE L96-98 (priorFailureAdoption / priorFailureReadback checks)
EDIT L99:  "argv=g['originalScannerArgv']" -> "argv=g['argv']"
DELETE L101 (expected argv derived from the old grant)
EDIT L102: "original_args=argv[3:];assert original_args[5]=='postflight' and original_args[7:9]==[g['baseline']['path'],g['baseline']['sha256']]" -> "original_args=argv[3:];assert original_args[5]=='postflight' and original_args[6]=='postflight-fullfunction-ar-r1' and original_args[7:9]==[g['baseline']['path'],g['baseline']['sha256']] and original_args[9]==','.join(map(str,g['actualPriorOwnedIds']))"
EDIT L103: "out=Path(g['parentPath'])" -> "out=Path(gr['path']).parent"
EDIT L104: "'priorFailureReadback':g['priorFailureReadback']," -> "'routeReadback':g['actualRouteReadback'],"
```

`PF/launch-fullpostflight.py` therefore adds one grant key: `'diagnosticSourceReview': role(RV_PF/RECEIPT.json)` (insert into the grant dict at L37). L71 `tb.tb_lineno==154` stays correct: `G/snapshot.py` differs from G0 only on L14, so the equality STOP remains L154. The wrapper writes `PFP/DIAGNOSTIC-SUMMARY-LOCAL.json` and, on a STOP with the exact predicate, `PFP/ACTUAL-IMMUTABLE-LOCAL.json`, then rethrows; on success it writes a summary with `availability 'comparison-passed-on-later-run'` and exits 0. PFD also carries `CONTRACT.json`, `RECIPE.json`, `SOURCE-PINS.json`, `SEAL.json`, `SOURCE-PROOF.json`, `PREPARATION-AUDIT.json` regenerated from PFD0 with AR roles (baseline role = fresh AR before-fill snapshot; `priorFailureAdoption` key removed; `target.frameLine 154`). RV_PF RECEIPT: `decision`, `sourceManifest` role(PFD/SOURCE-PINS.json), `sourcePins`/`routeSourcePins` for `diagnose_shared_post.py` only, `concreteFindings []`, `executionAuthorization false`.

### 5.9 Runtime-generated artifacts (shapes, for verification)

`A/FULLFUNCTION-AR-SOURCE-ADOPTION.json` and `A/FULLFUNCTION-AR-ROOT-BINDING.json` (wrapper L61-63; binding schema `1370-root-fullfunction-parent-binding/v1`, `parentPath` RP, `cwd R`, `environment`, `helper aff8e974…`, `runtimeTools`, `sourceAdoption`, `rootLauncher` role(W/run_observer_fullfunction_once.py), `utc`). `RP/ROOT-LAUNCH-CLAIM.json` (schema `1370-fullfunction-root-helper-launch-claim/v1`, argv as in 5.6). `RP/EXECUTION-GRANT.json` (schema `1370-root-fullfunction-qualification-once-grant/v1`; keys `scope, executionAuthorization true, oneAggregateRun true, automaticRetry false, clockEnforcedByOriginalRecordedRoute true, sourcePins, sourceReview, config, configSha256, bounds, typesAdoption, artifactBoundAdoption, currentProtection, parserControlsAdoption, losslessControlsObservedAdoption, nativeObserverControlsObservedAdoption, nativeRefusalControlsObservedAdoption, runtimeTools, laneLock {HEAVY-LANE-LOCK role}, rootBinding, rootLaunchClaim`). `RP/RECORDER-LAUNCH-CLAIM.json`. `RR/FIRST-PROOF.json` (`proofMethods` must equal the corrected runner role), `RR/CONTROLLER-BINDING.json` (`operationalHead ${HEAD_AR}`, `productionSourceTree 13880d9b…`). `RC/RESULT.json`. `RP/ACTUAL-TOOL.json` `{sessionId:int, finalExit:int, allToolChunks:[{exit_code:int,...}]}` written by the integrator session from the Bash tool result envelope (read-fullfunction.py L36). `RP/READBACK.json` (schema `1370-root-fullfunction-actual-readback/v1`, keys listed in read-fullfunction.py L87 including `preflightObservedAdoption`, `currentAPFullPreflightSnapshot`, `sourceBefore/After`, `dependencyBefore/After`, `actualGameplayPrefixExecuted`, `naturalBoundaryWeeks`) or `RP/INCOMPLETE-READBACK.json` with exit 1.

## 6. Static audits

### 6.1 Generated-authority check (unchanged script)

```
cd /Users/zacheryspector/studio-scratch
shasum -a 256 aq_check_generated_authority.py        # must print 80357abbc8c586cdfb691b8e41d539724a7e8d6ae3a4423ec8d4d024504e8dba (932 B)
$PY -I -B aq_check_generated_authority.py /Users/zacheryspector/studio-scratch/1370-ar-m0-fullfunction-source-20261010-r1
```

Pass: exit 0 and one JSON line with `"headAssertion": "${HEAD_AR}", "configuredHead": "${HEAD_AR}", "headMatches": true, "sourceTreeMatches": true, "candidateExecuted": false`; `evaluatedTemplateAssertions` lists exactly the three `assert.` lines of `CORE-TEST-TEMPLATE.ts` (L11 head, L12 tree, L13 `genuineTypesAdoptionAuthenticated`). Fail: `AssertionError: STALE_EVALUATED_TEMPLATE_HEAD` or any traceback.

### 6.2 `PREP/ar_audit.py` (derived from `…repair-preparation-20261010-r1/audit_corrected.py`, 4625 B, `8e6f0d92840995685210fe2d0eb73d338905648b250619233b4756e01e4f42da`)

Edits relative to audit_corrected.py:

```
L5-6:   dirs=[S/'1370-ar-m0-fullfunction-source-20261010-r1',S/'1370-ar-m0-fullfunction-parent-source-20261010-r1',S/'1370-ar-m0-fullfunction-root-wrappers-source-20261010-r1']
L29:    stale list = the three AQ r3 names, the three AQ r2 names, the four AQ r2 output names, '20261010-aq-m0-fullfunction-native-refusal-diagnostic-r2', 'recentProtectedPostflight'
L34:    prior = {F: F0, P: P0, W: W0} explicit map (no name arithmetic)
L41:    expected unchanged: {'run-fullfunction.py':['authenticate_current_protection'],'record-fullfunction.py':[],'launch-fullfunction.py':['main'],'read-fullfunction.py':['main'],'run_observer_fullfunction_once.py':[],'run_observer_reader_once.py':[]}
L55:    assert c['bounds']==load(F0/'CONFIG.json')['bounds']
L57:    for n in ['outputPath','recorderOutputPath','parentRecordedPath','laneLog']: assert c[n]==wr['outputs'][n] and c[n]==str(S/<RR|RC|RP|LL>) and c[n].endswith('-20261010-r1')
L58-59: oldcore=F0/'CORE-TEST-TEMPLATE.ts'; assert (F/'CORE-TEST-TEMPLATE.ts').read_text().replace(c['operationalHead'],'d20347b83ea7497ed17c48ec14d8f64a3ce69cc8')==oldcore.read_text()
ADD:    for every role in c['templates'] and c['inputs'] whose path is under F: text contains neither 'd20347b83ea7497ed17c48ec14d8f64a3ce69cc8' nor 'f2f97c622db7f5332164b790d1646355e89c00f4'
ADD:    assert c['operationalHead']==load(A/'GATE0-OBSERVATION.json')['head']==subprocess git rev-parse refs/heads/wip/headless-program-20260916-ts (read-only GIT prelude) and c['productionSourceTree']=='13880d9b…'
ADD:    assert c['historicalAPHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8' and c['historicalAOToAPTransition']==load(F0/'CONFIG.json')['actualCurrentOperationalTransition']
ADD:    chain: earlier/middle/ap/current loaded from the four transition roles; assert the wrapper L48 predicate (section 5.7) verbatim
ADD:    assert c['proofMethods']['sha256']=='6d8346…' and role(c['proofMethods']['path'])==c['proofMethods']; d=load(c['proofMethodsDerivativeAuthority']); assert d['correctedSource']==c['proofMethods'] and d['acyclic'] is True and not any(k in d for k in ('currentProtection','freshSourceProof','freshDependencyProof')); every role inside d re-hashed
ADD:    CONFIG_SHA literals: re.search(r"CONFIG_SHA='([0-9a-f]{64})'", text) for F/run-fullfunction.py, F/run-fullfunction.mjs, F/record-fullfunction.py all equal role(F/'CONFIG.json')['sha256']; WORKER_SHA in record equals role(F/'run-fullfunction.py')['sha256']; read-fullfunction.py contains role(F/'CONFIG.json')['sha256'] and role(F/'SOURCE-PINS.json')['sha256']; run_observer_fullfunction_once.py contains role(F/'SOURCE-PINS.json')['sha256']; launch-fullfunction.py contains "c['operationalHead']=='"+c['operationalHead']+"'"
ADD:    assert c['currentProtection'] is not None and c['reviewedPriorStopAdoption'] is not None and c['heldUnfilledActualRoles']==['actualSourceReview','actualGrant']
L60:    report schema '1370-ar-fullfunction-author-static-audit/v1'; write PREP/STATIC-AUDIT.json; also write PREP/GENERATED-AUTHORITY-AUDIT.json in the shape of …repair-preparation-20261010-r1/GENERATED-AUTHORITY-AUDIT.json (3953 B, 58785a4a…) with failedSourceManifest = role(F0/SOURCE-PINS.json) [6365, 86d6cc43…], correctedSourceManifest = role(F/SOURCE-PINS.json), operationalHead ${HEAD_AR}
```

Command: `cd $S && $PY -I -B /Users/zacheryspector/studio-scratch/1370-ar-m0-fullfunction-preparation-20261010-r1/ar_audit.py`. Pass: exit 0, one JSON line with the `STATIC-AUDIT.json` role, and `STATIC-AUDIT.json` showing `noStaleEvaluatedSourceSelector true` for all 10 scripts, the three `changedDefinitions` maps equal to the expected map, `wholeInverseApplications` 18/4/4, `pendingActualFields ["actualSourceReview","actualGrant"]`. Any `AssertionError` names the file and key; fix the source, regenerate hashes in section 4 order, rerun.

### 6.3 Compile and syntax

`for f in F/*.py P/*.py W/*.py GA/*.py N/*.py PF/*.py PFD/*.py A/*.py; do $PY -I -B -c "import sys;compile(open(sys.argv[1]).read(),sys.argv[1],'exec')" "$f"; done` must print nothing. `$NODE --check F/run-fullfunction.mjs` must exit 0.

### 6.4 Fullguard and prelaunch audits

Re-apply the forward/inverse pairs in G, GA and N (difflib.restore both directions) and assert `allFunctionsByteExact` by AST for `snapshot.py` (11 names), both GA adapters, and the three N scripts (11/3/2 helper names). Assert G `CONFIG.json` differs from `BASELINE-CONFIG.json.txt` only in `configChangedKeys` and `snapshot.py` differs only on L14.

## 7. Pre-run checks and exact commands

### 7.1 Gate 0 script (read-only; writes only `A/GATE0-OBSERVATION.json`)

```
set -u
S=/Users/zacheryspector/studio-scratch; R=/Users/zacheryspector/The-Movies-headless-program; A=$S/1370-ar-root-continuation-20261010-r1
export GIT_OPTIONAL_LOCKS=0; G="/usr/bin/git --no-optional-locks -c gc.auto=0 -c maintenance.auto=0 -C $R"
HEAD=$($G rev-parse HEAD); WIP=$($G rev-parse refs/heads/wip/headless-program-20260916-ts)
RWIP=$($G ls-remote origin refs/heads/wip/headless-program-20260916-ts | cut -f1); RMAIN=$($G ls-remote origin refs/heads/main | cut -f1)
LMAIN=$($G rev-parse refs/remotes/origin/main); SRC=$($G rev-parse "$HEAD:src"); STATUS=$($G status --porcelain=v1 --untracked-files=all)
NONDOCS=$($G diff --name-only -z 4812bb123781632dd39e44f918eb85a6a2c12623 "$HEAD" | tr '\0' '\n' | grep -v -E '^(docs/|HANDOFF\.md$)' | wc -l | tr -d ' ')
$G merge-base --is-ancestor d20347b83ea7497ed17c48ec14d8f64a3ce69cc8 "$HEAD" && ANC=true || ANC=false
test "$HEAD" = "$WIP" -a "$HEAD" = "$RWIP" -a "$SRC" = 13880d9b0ba72aff5d4c5bcf5d12fe682c5de554 -a "$ANC" = true -a "$NONDOCS" = 0 -a -z "$STATUS" -a "$LMAIN" = c902a704eb948cc576083d0973c8c23e59937dc1 -a "$RMAIN" = c902a704eb948cc576083d0973c8c23e59937dc1 && VERDICT=PASS || VERDICT=BLOCKED
mkdir -p "$A"   # first write into A; A must not exist before this step
# write A/GATE0-OBSERVATION.json from these variables only (section 5.2.1); ${HEAD_AR} := $HEAD when VERDICT=PASS
```

Before this script: commit the hook-stamped `HANDOFF.md` (docs-only) and push it, then run the script; otherwise predicate 5 fails. The HANDOFF.md diff today is the AUTO block only (lines 495-505: stamp time, branch at `205323ac`, uncommitted count 0, last commits list). Today's expected output: `VERDICT=BLOCKED` with `SRC=cf7d20cd…`, `NONDOCS=189`.

### 7.2 Pre-run checks (run before 7.3, 7.4, 7.5 and 7.7; all must pass)

```
test ! -e $S/HEAVY-LANE-LOCK                                                            # lane free (lane helper L5)
test ! -e $S/1370-c0-m0-recorded-materialization-20261009-r2.lock -a ! -e $S/1370-c0-m0-additive-recorded-20261009-r2.lock   # snapshot.py L58 lock roots
ps -axo pid,pgid,comm,args | awk '$3 ~ /(^|\/)node$/ && /vitest|\/bin\/tsc|\/lib\/tsc\.js/'    # must print nothing (lane helper L18 waits up to 60 min, then exit 3; snapshot.py relevantWorkersAbsent)
ps -axo pid,args | grep -E 'snapshot\.py|run-fullfunction|record-fullfunction|launch-fullfunction|current-ap-root-prelaunch' | grep -v grep    # must print nothing
df -k $S | awk 'NR==2{print $4*1024}'                                                   # must be >= 3758096384 (config requiredFreeBytes; runner FLOOR 3 GiB, PREFLIGHT 3.5 GiB); plan requires >= 4100000000 for outputs (two 9.7 MB snapshots, up to 256 MiB aggregate output tree)
pmset -g batt | head -1                                                                 # must contain "AC Power"
sysctl -n kern.bootsessionuuid                                                          # must equal G/CONFIG.json bootSessionUuid
$G rev-parse HEAD HEAD:src refs/heads/wip/headless-program-20260916-ts refs/remotes/origin/main   # ${HEAD_AR}, 13880d9b…, ${HEAD_AR}, c902a704…
$G ls-remote origin refs/heads/wip/headless-program-20260916-ts refs/heads/main          # ${HEAD_AR}, c902a704…
$G status --porcelain=v1 --untracked-files=all                                          # empty
shasum -a 256 $PY $NODE $R/node_modules/vitest/vitest.mjs $R/node_modules/vitest/package.json   # 7673432d…, 0b4f0599…, 39db22f5…, 6ea35e56… (FULLFUNCTION-RUNTIME-TOOLS.json e7d0f540…; all four matched on 2026-10-11T06:30Z)
test -d $S/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1 -a -d $S/1370-c0-aging-era-sparse-materialized-r6-20261008-r1 -a -d $S/1370-c0-m0-observer-mirrors-20261009-r2   # protected roots present
stat -f '%l' /usr/bin/git                                                               # 76 (snapshot.py L102 expects nlink 76 for /usr/bin/git)
```

Observed on 2026-10-11T06:30:37Z: lane free; two vitest groups live (pgid 73677 and 77609: specialist lanes P15B, P16, founding still running); free 2,128,281,600 B (fails the floor by 1,629,814,784 B); AC Power; boot session `452DE205-E1D6-462E-8673-553462BB0166`; runtime tools match; roots present. Disk headroom: inspect with `du -sk` before deleting anything; the owner authorized cache deletion only (HANDOFF.md L24): candidates `~/Library/Caches`, `~/.npm/_cacache`, `$R/node_modules/.vite`, `$R/node_modules/.cache`, `~/.cache`. Never delete source, saves, evidence or user files. Specialist lanes must finish or be stopped by their owner before the lane helper starts; the plan does not kill them.

### 7.3 Fresh-baseline fullguard (before-fill), about 460 s

```
cd $R && PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 $PY -I -B $S/1370-ar-current-operational-fullguard-root-adapters-source-20261010-r1/run_current_fullguard_once.py $S/1370-ar-current-operational-fullguard-independent-source-review-20261010-r1/RECEIPT.json <sha256 of that RECEIPT>
```

The launcher writes `A/CURRENT-AR-FULLGUARD-SOURCE-ADOPTION.json`, `setsid`s, creates `GP` (0700), writes `GP/GRANT.json` (schema `1370-ap-root-direct-current-ap-fullpreflight-grant/v1`, `perCommandTimeoutSeconds 180`, `wholeScanDeadline null`), prints `{"grant":…,"ownedPid":…,"ownedPgid":…}`, redirects to `GP/scan.stdout` and `GP/scan.stderr`, and `execve`s `[PY,'-I','-B', G/snapshot.py, S/1370-c0-aging-era-sparse-r6-observed-independent-review-20261008-r1/RECEIPT.json, 3a43f85ec4bd0557b6ea6ef0a46d59bfc14570324ba1297e555dee3ff4d0767d, ACCEPT_OBSERVED_MATERIALIZATION_COPY, S/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1, before-fill, before-fill-current-ar-r1]`. AQ measured 459.94 s (inventory 343.84 s); set the tool timeout to 900 s. Then write `GP/ACTUAL-TOOL.json` `{sessionId, finalExit, allToolChunks}` from the tool envelope; `finalExit` must be 0 and `GP/scan.stderr` empty. Reader: `cd $R && $PY -I -B $S/…fullguard-root-adapters-source-20261010-r1/read_current_fullpreflight.py` (no arguments) writes `GP/POST-OWNERSHIP.json`, `GP/RAW-LOCAL-ONLY-CLASSIFICATION.json`, `GP/READBACK.json` (status `ACTUAL_CURRENT_AP_FULL_PREFLIGHT_COMPLETE_UNADOPTED`); write `GP/READER-ACTUAL-TOOL.json` `{sessionId:null, finalExit, allToolChunks}`. Baseline proof: `G/evidence/before-fill-current-ar-r1/SNAPSHOT.json` with `status GUARDS_ACCEPTED_READONLY`, `phase before-fill`, `baseline null`, `immutable.operationalProductionHead == ${HEAD_AR}`, `immutable.operationalSourceTree == 13880d9b…`, `len(strictRoots)==9`, `freeBytes >= 3758096384` in `currentBefore` and `currentAfter`. After RV_GO: `$PY -I -B $A/adopt_current_fullguard.py $S/1370-ar-current-ar-fullpreflight-independent-observed-review-20261010-r1/RECEIPT.json <sha>` writes `A/CURRENT-AR-FULL-PREFLIGHT-OBSERVED-ADOPTION.json`.

### 7.4 Short prelaunch (seconds; 180 s per command)

```
cd $R && PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 $PY -I -B $S/1370-ar-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1/run_current_ap_prelaunch_once.py $S/1370-ar-native-refusal-fullfunction-current-prelaunch-independent-source-review-20261010-r1/RECEIPT.json <sha> $S/1370-aq-root-continuation-20261010-r1/NATIVE-REFUSAL-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json 385249f0239d6999318b62c6781c0f24c97e10600aa47dba6b51ddf6c4693ed4
```

Writes `NP/CONFIG.json` (fills `protectedSnapshot`, `ownedPgids` = sorted set of GP GRANT `ownedPgid` plus pure86 `actualOwnedIds`, `outputPath` NO), `NP/GRANT.json` (schema `1370-ap-current-ap-root-prelaunch-grant/v2`), `NP/prelaunch.stdout`/`.stderr`, and `execve`s `[PY,'-I','-B', N/current-ap-root-prelaunch.py, NP/CONFIG.json, <sha256>]`. Then `NP/ACTUAL-TOOL.json` `{toolSessionId, finalExit, chunks}` (CONTRACT `actualMetadataContract.prelaunchActualTool`). Reader: `$PY -I -B N/read_current_ap_prelaunch.py <toolSessionId> <GRANT ownedPid>` writes `A/M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json` (status `ACTUAL_CURRENT_AP_ROOT_PREFLIGHT_COMPLETED_PENDING_INDEPENDENT_REVIEW`, `originalFullSnapshot` = AR before-fill role); `NP/READER-ACTUAL-TOOL.json` `{sessionId:null, finalExit, allToolChunks}`. After RV_NO and 5.2.11: `$PY -I -B $A/adopt_refusal_current_protection.py $S/…prelaunch-independent-observed-review-20261010-r1/RECEIPT.json <sha>` writes `A/M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json`.

### 7.5 Fullfunction launch (one attempt; 300/320/330 s clocks)

```
cd $R && PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 $PY -I -B $S/1370-ar-m0-fullfunction-root-wrappers-source-20261010-r1/run_observer_fullfunction_once.py $S/1370-ar-m0-fullfunction-independent-source-review-20261010-r1/RECEIPT.json <sha> $S/1370-ar-m0-fullfunction-parent-readback-wrappers-independent-source-review-20261010-r1/RECEIPT.json <sha>
```

Chain: wrapper writes `A/FULLFUNCTION-AR-SOURCE-ADOPTION.json`, `A/FULLFUNCTION-AR-ROOT-BINDING.json`, prints `{"rootBinding":…,"sourceAdoption":…}`, `chdir R`, `execve [PY,-I,-B, P/launch-fullfunction.py, outer, <binding>, <sha>]` -> launcher (outer) creates `RP`, writes `RP/ROOT-LAUNCH-CLAIM.json`, `execvpe ['/bin/bash', S/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh, '0', LL, PY, '-I', '-B', P/launch-fullfunction.py, 'inner', <binding>, <sha>]` -> helper takes `HEAVY-LANE-LOCK`, waits for heavy node processes to end (STOP 3 after 60 min), logs `start` to `LL.meta`, runs the inner launcher with stdout+stderr into `LL` -> inner writes `RP/EXECUTION-GRANT.json`, `RP/RECORDER-LAUNCH-CLAIM.json`, `execvpe [PY,-I,-B, F/record-fullfunction.py, verification, RP/EXECUTION-GRANT.json, <sha>]` -> recorder forks `[PY,-I,-B, F/run-fullfunction.py, <grant>, <sha>]` (CHILD 300, ACTIVE 320, WHOLE 330, CAP 8 MiB) -> controller `exec`s the corrected runner, runs `guard`, `full_source_check`, `exact_package_roles`, `full_dependency_check`, writes `RR/FIRST-PROOF.json` and `RR/CONTROLLER-BINDING.json`, spawns `[NODE, F/run-fullfunction.mjs, RR/CONTROLLER-BINDING.json, <sha>]` for phases generate, baseline, typed-catch-mutant. Tool timeout 900 s. Then write `RP/ACTUAL-TOOL.json` `{sessionId, finalExit, allToolChunks}`.

### 7.6 Readback

```
cd $R && $PY -I -B $S/1370-ar-m0-fullfunction-root-wrappers-source-20261010-r1/run_observer_reader_once.py $S/1370-ar-m0-fullfunction-parent-readback-wrappers-independent-source-review-20261010-r1/RECEIPT.json <sha>
```

Execs `[PY,-I,-B, P/read-fullfunction.py, <sessionId>, <finalExit>, sha256(RP/EXECUTION-GRANT.json), sha256(RP/ACTUAL-TOOL.json)]`; writes `RP/READBACK.json` (or `RP/INCOMPLETE-READBACK.json`, exit 1). Write `RP/READER-ACTUAL-TOOL.json`.

### 7.7 Mandatory postflight through the diagnostic wrapper, about 460 s

```
cd $R && PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 $PY -I -B $S/1370-ar-native-refusal-fullfunction-shared-fullpostflight-source-20261010-r1/launch-fullpostflight.py $S/1370-ar-m0-fullfunction-parent-recorded-20261010-r1/READBACK.json <sha256 of READBACK.json>
```

Writes `PFP/GRANT.json` (schema `1370-root-m0-direct-original-shared-full-postflight-grant/v1`), `postflight.stdout`/`.stderr`, and execs `[PY,-I,-B, PFD/diagnose_shared_post.py, PFP/GRANT.json, <sha>]`, which runs the original `G/snapshot.py` in-process with argv `[... postflight, postflight-fullfunction-ar-r1, G/evidence/before-fill-current-ar-r1/SNAPSHOT.json, <baseline sha>, <csv owned group ids>]`. Tool timeout 900 s. Then `PFP/ACTUAL-TOOL.json`. Success reader: `$PY -I -B PF/read-fullpostflight.py <sessionId> <sha256(PFP/GRANT.json)>` writes `PFP/RAW-LOCAL-ONLY-CLASSIFICATION.json` and `PFP/READBACK.json` (status `ACTUAL_FULLFUNCTION_SHARED_FULL_POSTFLIGHT_COMPLETE_PENDING_INDEPENDENT_REVIEW`, `fullImmutableEqual true`). The postflight runs after the route whether the route passed or stopped (prospective contract `mandatoryOriginalFullPostflightAfterGame true`).

## 8. Success proofs and failure recording

Route PASS requires all of:

- `RP/ACTUAL-TOOL.json` `finalExit == 0`; `LL.meta` contains exactly one `end, exit 0` line (read L52); `RP/READBACK.json` `status == "ACTUAL_FULLFUNCTION_COMPLETE_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW"`, `toolExit == helperExit == recorderExit == runnerExit == 0`, `retainedInconsistencies == []`, `stderr.bytes == 0`, `laneReleased true`, `runtimeOutputAbsent false`.
- `RC/RESULT.json` `status == "REAL_FULLFUNCTION_QUALIFICATION_COMPLETE_UNADOPTED"`; controller result `status == "PASS_REAL_FULL_FUNCTION_QUALIFICATION_PENDING_FULL_POSTFLIGHT"` (read L86).
- BEFORE/AFTER proofs: `RR/FIRST-PROOF.json` `sourceProof == dependencyProof`'s counterparts in the types adoption (`freshSourceProof`, `freshDependencyProof`, run-fullfunction.py L186 `ACTUAL_CURRENT_FULL_PROOFS`), and `READBACK.sourceBefore == sourceAfter`, `dependencyBefore == dependencyAfter`, all non-null; `FIRST-PROOF.proofMethods == {sanitizer runner.py, 44107, 6d834672…}`.
- Baseline scenario: generate phase produced `RR/generate.report.json` and fixtures with natural boundaries at weeks 196, 197, 208 plus the four synthetic variants named in `CORE-TEST-TEMPLATE.ts` L19-22; baseline arm GREEN; `READBACK.naturalBoundaryWeeks` and `READBACK.actualGameplayPrefixExecuted` recorded (expected prefix 208 weeks per RECIPE `workOrder`).
- Typed-catch mutant: `typed-propagation-removed-talentMarket.ts` (120492 B, `2d558ac1…`) differs from `talentMarket.ts` (120462 B, `584c4609…`) by exactly 30 bytes; the mutant arm is RED by the exact row-cap assertion only (RECIPE `workOrder[4]`); any other failure mode is a STOP, not a RED.
- Postflight: `PFP/READBACK.json` `fullImmutableEqual true`, `nineStrictRootsEqual true`, `toolExit 0`, snapshot `phase postflight`, `baseline == {path, sha256}` of the AR before-fill snapshot, `immutable == baseline.immutable` (read-fullpostflight L23).
- RV_RO decision `ACCEPT_ACTUAL_REAL_FULL_FUNCTION_QUALIFICATION_WITH_FULL_POSTFLIGHT_ONLY`, then `A/FULLFUNCTION-AR-QUALIFICATION-OBSERVED-ADOPTION.json` (schema `1370-ar-root-fullfunction-qualification-observed-adoption/v1`, status `ROOT_ADOPTED_REAL_FULL_FUNCTION_QUALIFICATION_WITH_FULL_POSTFLIGHT`, roles: readback, recorder result, controller result, FIRST-PROOF, postflight readback and snapshot, observed review, grant, binding, source adoption, prior failures file; `neutralityAccepted false`, `ledgerAdmission false`, `game false`).

On any STOP (helper exit 2 or 3, recorder `STOP_*`, controller STOP, node non-zero, reader `INCOMPLETE-READBACK.json`, postflight equality STOP):

1. Keep every output. Delete nothing in RP, RR, RC, LL, PFP or G/evidence.
2. Write `RP/ACTUAL-TOOL.json` with the real `finalExit`; run 7.6 anyway; the reader records `ACTUAL_FULLFUNCTION_STOP_PRESERVED_PENDING_SHARED_FULL_POSTFLIGHT` or `INCOMPLETE-READBACK.json`.
3. Run 7.7 anyway. On a postflight STOP write `PFP/FAILURE-READBACK.json` in the shape of `…shared-fullpostflight-parent-recorded-20261010-r1/FAILURE-READBACK.json` (3879 B, `6a32717a…`: `status ACTUAL_SHARED_FULL_POSTFLIGHT_STOP_IMMUTABLE_MISMATCH_CAUSE_UNRESOLVED`, `exactError`, `toolSessionId`, `toolExit`, owned ids and ESRCH checks, `fullProtectedPostflightAccepted false`) plus `diagnosticSummary` role(PFP/DIAGNOSTIC-SUMMARY-LOCAL.json) and `actualImmutableLocal` role(PFP/ACTUAL-IMMUTABLE-LOCAL.json) if present, and `changedPaths` from the summary's `differences`.
4. RV_RO with decision `ACCEPT_ACTUAL_FULLFUNCTION_STOP_PRESERVED_ONLY`; write `A/FULLFUNCTION-AR-STOP-OBSERVED-ADOPTION.json`; write `A/PRIOR-FAILURES-PRESERVED-ADOPTION-r2.json` that includes the AR stop (never edit the r1 file).
5. No retry under this plan. A second attempt needs a new route generation with its own fresh baseline.
6. Update HANDOFF.md (recovery narrative, failure list, lessons) and commit docs-only.

## 9. Open questions (each names the file to inspect)

Q1 Gate 0 is BLOCKED because the landed R8 source moved `HEAD:src` to `cf7d20cd…` while the whole M0 lineage pins `13880d9b…`. Decision needed: qualify a new lineage against the landed tree (new types adoption replacing `AN/M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json` be632d53…, a proof-library derivative with `TREE` at `runner.py` L12 and `CURRENT_HEAD` L11, a new A208 copy and materializer binding since `snapshot.py` L94/L115 bind `4812bb12` and its src tree, new `CORE-TEST-TEMPLATE.ts` L12, new transitions with the new `sourceTree`) or hold dependent gameplay. Inspect: HANDOFF.md L57, L64, L335; `G0/snapshot.py` L61-65, L114-118; `F0/run-fullfunction.py` L49; `P0/launch-fullfunction.py` L84, L87, L101; `…sanitizer-source-20261010-r1/runner.py` L11-12, L541-545; `F0/CORE-TEST-TEMPLATE.ts` L12. The owner removed approval gates (HANDOFF.md L25); the integrator decides and records it in `A/GATE0-OBSERVATION.json` and HANDOFF.md.

Q2 Disk headroom: 2,128,281,600 B free against a 3,758,096,384 B floor. Which caches may go: run `du -sk` on `~/Library/Caches ~/.npm/_cacache $R/node_modules/.vite $R/node_modules/.cache ~/.cache` and compare; delete caches only after reading `HANDOFF.md` L24.

Q3 Specialist vitest lanes (pgid 73677: `tests/c2a-m2-sets-save…`, pgid 77609: `tests/p15a2-power-ranking-archive…`) are live; the lane helper (`lane-run-r8.sh` L74-77) refuses after 60 min of heavy processes. Who ends them: inspect `/private/tmp/claude-501/-Users-zacheryspector/21e515ff-0aed-48b0-9b7f-11c9d5239850/tasks/*.output` for the three background agents.

Q4 `read-fullfunction.py` L87 result dict: confirmed to contain `preflightObservedAdoption` (launch-fullpostflight L17 reads it); confirm after the P edit that the key still refers to `protection['currentAPFullPreflightAdoption']` by reading `P0/read-fullfunction.py` L60-86 (not extracted here).

Q5 `N0/PROSPECTIVE-BINDING-CONTRACT.json`, `N0/OPERATIVE-BINDING-AUDIT.json`, `N0/SOURCE-PROOF.json`: key lists are known (section 5.4); the values to carry forward verbatim versus replace must be taken from the files themselves at fill time.

Q6 `G0/PROOF.json` `originalFunctionNames` and `sourceDelta` exact shapes: read `G0/PROOF.json` (4361 B) before regenerating.

Q7 Production `node_modules` inventory: GA reader L29 expects `12485` entries per copy and `176` physical checkout entries. The fresh scan decides; a mismatch is a real drift finding and a STOP.

Q8 Boot session: `G/CONFIG.json` pins `bootSessionUuid`; a reboot between fill and run makes `snapshot.py` L46 STOP (`boot session drift`). Refill G (new CONFIG, new `CONFIG_SHA`, new review) in that case; do not run a stale config.

Q9 ACTUAL-TOOL envelopes: the integrator session writes them from the Bash tool result. Key names differ: prelaunch uses `toolSessionId`/`chunks` (N0/CONTRACT.json `actualMetadataContract`), fullguard, route and postflight use `sessionId`/`allToolChunks`. Inspect `…prelaunch-parent-recorded-20261010-r1/ACTUAL-TOOL.json` (738 B) and `…diagnostic-parent-recorded-20261010-r1/ACTUAL-TOOL.json` (1333 B) for the exact shapes.

Q10 `RESOLUTION-SOURCE-BINDING.json` (78208 B) is copied byte-identical; confirm no absolute output path inside it must follow RR (grep for `studio-scratch/1370-` in it before sealing).

Q11 The 30-byte mutant claim: `typed-propagation-removed-talentMarket.ts` 120492 B minus `talentMarket.ts` 120462 B equals 30; confirm the RED predicate text in `F0/run-fullfunction.mjs` typed-catch-mutant phase (search `typed-catch-mutant` in that file) before writing the RV_RO acceptance criteria.

Q12 `ARCHIVE-FINAL-CUTOFF.json` (Q, 8635 B) declares `ownerRecoveryDecision "PENDING_NO_APPROVAL_ASSUMED"` and `status ROOT_DECLARED_AQ_FINAL_CUTOFF`; AR must not append to AQ's archive. Confirm the AR packages are covered by a new AR cutoff/archive plan (derive from `S/1370-aq-checkpoint-archive-selection-plan-20261010-r1/PLAN.json`).
