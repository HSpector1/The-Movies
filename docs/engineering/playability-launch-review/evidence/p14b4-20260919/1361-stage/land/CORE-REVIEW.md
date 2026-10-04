# Independent Save45 recorded core review

Reviewer: `/root/recovery_charter`, 2026-10-04. **Recorded core evidence is complete and attributable; final core acceptance remains conditional.** The new Save As timeout is open, and the changed supervisor restart failure requires explicit disposition. This review does not waive either, accept the active UI run, or declare the suites all green.

## Identity and guards

Run: `E/1361-save45-broad-core`, at `2eaa697effc38538c37da28b486786ce267a2284`, Node v20.20.2, 2026-10-04 21:19:43.453–23:06:50.802 UTC (16:19:43–18:06:50 CDT). Postflight completed at 23:06:51.627 UTC. Actual test-child exit **1**, no signal/error; fixed source true. `E` is the repository's `docs/engineering/playability-launch-review/evidence/p14b4-20260919`; `L` is `/Users/zacheryspector/studio-scratch/1361-land`.

Independently verified the command contains the exact 448 entries from the governed core list, with `vitest run --project core`. Both source SHAs equal the expected HEAD; preflight remote equals HEAD. All recorded pre/post guard scopes, 1,190-file source inventory, **298 manual-pin entries**, index and stage-entry facts agree. Postflight reports exact guards and child exit 1. The recorded patch is empty; raw, record and patch bytes match postflight sizes/hashes. This compares recorded manual-pin facts without opening their fixture payloads. The reviewed attribution script retains its approved hash `1b596e4dd32c42526fa90c50976004101b38bee2fb1de094d23ab9c4f2b526ab`.

| Artifact | SHA256 |
|---|---|
| Core raw `.txt` | `b74868f37cfe85e177af97c204516757ae07bef40ffb9d1a49eb6c082e850ae8` |
| Core recorder `.json` | `fc6cc3944e9d48d3e421fab8d0cd33f75a951b401f24bb1dc72760cf97d6200a` |
| Core `.patch` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Core preflight | `b66852cc0008ee0f9bbaca733db2a76f8e6051d91059c180b60dbc06b4d0b488` |
| Core postflight | `aecd67f22d3cff7592e0ea746d929e9c1c53be181e81215f28a6d14f74579bc2` |
| `L/attr-core-live/core-failures.json` | `4cf7485d2842a966325cf57c917d708691fbce9485b5161d7a10affa7de96c38` |
| `core-vs1358I.json` | `f0f775c397f8ca7333057093c6f5b8e38f41b5ee09dbe4727d111529d6c57239` |
| `core-vsx3.json` | `e14a5e3ac20b1c913674dd70541552f1d0341ca26e5c81fe020e3fea90b7738f` |
| `declared45.json` | `f0c1cf7b7d669ac583c6a4fe013fc6435400519d26f855c162422c7137ea1195` |
| `guards.json` | `03631801752daa2c233c9db2c56a6fd98a1bbe83ed7a731d86b5cb53527fd7e7` |

## Independent reconciliation

Reparsed the completed raw using only the parser's definitions, without invoking its output-writing main. All **133** parsed identity/primary/frame records match the preserved attribution rows. The 448 unique per-file result lines sum independently to **5,265 cases**. Final summary is **28 failed / 420 passed files; 133 failed / 5,118 passed / 3 skipped / 11 todo cases**. No failed-suite, unhandled-error, unhandled-rejection or uncaught-exception section was found. No failure is hidden solely in a collection failure.

Recomputed all maps independently, rather than accepting summary totals:

- Against 1358-I: **84 SAME, 1 CHANGED, 48 NEW, 0 GONE**. All 85 historical identities remain. The sole changed primary is C20's actual live save-version digit **44 → 45**; its expected value remains 38. This is the already disclosed retained C20 outcome, not a sweep repair. The six r3n1 ENOENT messages now match their live baseline exactly; they are not new failures.
- Exactly **45 held-(c) identities and complete primary messages** match `1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv`, with no normalization: 40 integration, 4 atomicity, 1 phases. The 48 NEW rows are those 45, two supervisor rows and the new disclosure timeout.
- Against x3: **131 SAME, 5 GONE, 1 CHANGED, 1 NEW**. Recomputed all identities and messages using only the exact live/x3 checkout-prefix normalization, preserving shared live `node_modules` paths. Every delta appears below; no additional sweep regression is hidden in the totals.

Named production-stop surfaces pass: `p13a-causal-core` **8/8**, `contracts/v14-byte-parity.contract` **6/6**. The sibling file passes **5/5**. No previously cleared sweep identity reappears. These are bounded observed outcomes, not universal live-state claims.

## Manual disposition of every x3 delta

All supervisor leaves below belong to `tests/bridge-supervisor.test.ts > one-command studio supervisor`. Their complete identities remain in `core-vsx3.json`.

| Leaf | Live evidence | Review disposition |
|---|---|---|
| emits, audits, and supervises the packaged production graph without the development loader | Explicit pass, 12,236 ms | Measured GONE from the previously classified scratch supervisor residuals; retain the old failure record. |
| launches only after authenticated readiness and preserves one private profile across distinct logs | Explicit pass, 25,913 ms | Measured GONE; no assertion change or new product claim. |
| cancels replacement work when Unity exits during an engine outage | Explicit pass, 20,546 ms | Measured GONE. |
| kills a Unity helper that survives TERM before releasing the active lease | Explicit pass, 19,342 ms | Measured GONE. |
| rejects a concurrent owner, shuts down on signal, and reclaims only a stale incarnation | Explicit pass, 40,451 ms | Measured GONE. |
| restarts a SIGKILLed engine on its fixed port without changing durable authority | 42,807 ms; primary changes from `Fake Unity did not report started.` to `Fake Unity did not report replacement.` | **Changed failure, explicit parent disposition still required.** |
| Disclosure Save As leaf below | 45,105 ms; `Test timed out in 30000ms.` | **New failure, targeted recorded follow-up required; not waived.** |

The five GONE rows are actual passing assertions, not missing collection. Their removal is compatible with the existing classification of those x3 rows as scratch environment failures and the landed-source parity record. This review does not infer a specific environmental cause from timing alone.

The unchanged second supervisor residual is `bounds engine crash loops and never touches an unrelated process`: **21,924 ms**, same `Fake Unity did not report health.` primary as x3. Retain its existing residual classification; its later crash-loop assertions remain unproved by this run.

The changed restart failure is precisely located. `FixtureObserver.waitFor` at `tests/bridge-supervisor.test.ts:186` uses the real event observer. The test at line 843 awaits `started`, `health`, initial bridge lock and readiness, performs SIGKILL, then awaits `replacement` with its existing **30,000 ms** limit at line 858. Therefore this live run got past the earlier startup failure and stopped before the replacement authority assertions. That is a later observed stop, not proof of a regression or of environmental causation. Do not silently classify it as an identical accepted residual; retain it for parent attribution and a bounded follow-up if needed.

## New disclosure timeout: open

Exact identity:

`tests/bridge-p13b-s7-disclosure.test.ts > P13B-S7-T3 item 5: Industry announcement row — derived, nullable studioId, excluded from per-studio History, absent for sound, Save As identical > identical in a Save As world: two independently-saved-as campaign slots of the same week-884 state publish byte-identical announcement rows`

The file completed **21 passes and this one failure** in 186,193 ms. Source at lines 518–566 creates an in-memory checkpoint store and actual durable campaign runtime from S884, performs Save As Original, Save As Active copy, reads announcement rows, loads the original slot, compares announcement rows and closes the runtime in `finally`. The leaf explicitly retains **30,000 ms**. Its raw failure supplies no narrower operation/stack attribution; a 45,105 ms reported duration does not identify which awaited operation consumed the limit or prove a functional inequality. No successful final equality assertion is claimed for this attempt.

Parent has scheduled a targeted recorded follow-up after UI/D16, on the same HEAD and with no timeout increase. Review its fixed-source guards, exact selector/corpus, actual child exit and reached assertions separately. Preserve this broad-run timeout regardless of the follow-up outcome. A passing rerun can support a bounded timing-sensitive disposition; it does not erase this measurement or automatically establish root cause. A recurring failure remains a finding requiring diagnosis. No rerun was executed by this reviewer.

## Retained limits and acceptance boundary

The x3 limits remain: 15 P14B.1 terminal-premise failures do not reach mutants; 26 frozen workflow observations hit V14 history first; four S8 exact pins isolate earlier guards rather than the masked later predicates. Historical used-extension, movement-only termination and differing writer-control coverage gaps remain. Passing retained regexes do not establish complete messages. The 45 held market failures remain awaiting (c), and C20 is unchanged in intent. No assertion, fixture, source or residual was edited to obtain this review.

**Status:** accept the integrity/completeness of this core recording and the exact declared/baseline reconciliation. Keep final core acceptance conditional on the new timeout follow-up and explicit changed-supervisor disposition. UI and D16 need their own completed recordings/reviews; Save45 G-L, frozen-Legacy/catalogue guards and later retune/recovery obligations remain separate. Wrapper exit zero is not an all-green claim.

Only completed core evidence, preserved baselines and narrowly relevant source were read. Lightweight Python parsing/hashing/comparison only; no Node/test/typecheck/heavy process, active UI output, fixture payload, source/index edit or new agent. This review file is the only write.
