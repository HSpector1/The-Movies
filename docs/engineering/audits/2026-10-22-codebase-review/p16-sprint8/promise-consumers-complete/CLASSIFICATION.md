# Trust consumer failure classification

Scope: completed `focused.json`, only `tests/bridge-p14b2-trust.test.ts`: 22 tests, 14 passed and 8 failed. The enclosing command ended exit 1 at 2026-10-26T19:11:38-05:00. Entry source is d7d4bacf1b3ac82663a6ea72ee5b48d4a514985b. This is assertion/failure-reachability classification, not timing or whole-gate qualification. No source/test changes or runtime were performed for this analysis.

| Exact failed identity | Duration ms | First cause and reached boundary |
|---|---:|---|
| P14B.2 group3 — one bound-only newest-first history DTO on both carriers does not publish another studio’s real bound history as the player’s own terms | 5427.038 | rivalFixture:265 throws no natural rival-only promise outcome by 240; rival privacy/outcome assertions after that fixture call are unreached. |
| P14B.2 group5 — independent promise attention after cases close raises due at minus8 but not minus9 for an actual player poaching winner with no proposals | 5298.193 | poachingFixture:199 asserts publicPreferredTerm 52, receives 208; actual winning/bound player-promise and caller due/outcome assertions are unreached. |
| P14B.2 group5 — independent promise attention after cases close raises the poaching winner’s actual outcome only in its recorded week, once per cause/person | 5381.909 | poachingFixture:199 asserts publicPreferredTerm 52, receives 208; actual winning/bound player-promise and caller due/outcome assertions are unreached. |
| P14B.2 group5 — independent promise attention after cases close does not require any case entry to retain a real promise reminder (explicit read-only case-carrier probe) | 6127.603 | poachingFixture:199 asserts publicPreferredTerm 52, receives 208; actual winning/bound player-promise and caller due/outcome assertions are unreached. |
| P14B.2 group5 — independent promise attention after cases close ignores real withdrawn unbound drafts near due and never interrupts for rival-issued promises | 7972.899 | rivalFixture:265 throws no natural rival-only promise outcome by 240; rival privacy/outcome assertions after that fixture call are unreached. |
| P14B.2 group7 — rival terms stay private and rival outcomes stay public keeps open rival proposal terms literal UNKNOWN across Profile and Market | 5807.364 | rivalFixture:265 throws no natural rival-only promise outcome by 240; rival privacy/outcome assertions after that fixture call are unreached. |
| P14B.2 group7 — rival terms stay private and rival outcomes stay public publishes the real rival kept outcome and aggregate label while withholding bound history terms | 5407.893 | rivalFixture:265 throws no natural rival-only promise outcome by 240; rival privacy/outcome assertions after that fixture call are unreached. |
| P14B.2 group7 — rival terms stay private and rival outcomes stay public is semantically unchanged when only hidden terminal terms vary, retaining real outcome/event identities | 5959.026 | rivalFixture:265 throws no natural rival-only promise outcome by 240; rival privacy/outcome assertions after that fixture call are unreached. |

## Source cause versus actual predecessor evidence

`tests/helpers/p14b2-fixtures.ts:250–265` rivalFixture ticks the existing generated native world and requires both a previously observed rival promise proposal and a SATISFIED rival promise before returning an authenticated fixture. The guard does not identify which condition stayed absent. It supplies all five by 240 failures; the public read-model/privacy/outcome assertions requiring its returned world are not reached. Group5’s withdrawn-draft prefix does run before its later rivalFixture call. This is a fixture-admission failure; it does not prove which underlying producer changed or that the intended read model regressed.

`poachingFixture:199` is the exact 208→52 assertion in all three failures. The unchanged helper comments at160–191 already document materialized aging causing this person to become publicly proven and prefer 208 rather than 52; they also document that merely changing 52→208 moves failure deeper to the old player-winning premise. Current runtime reaches the same preferred-term mismatch, before the claimed bound player winner exists. No fixture/pin repair is made or proposed as a substitute for comparison.

Actual retained predecessor evidence is narrower than the eight full identities: S7 `consumer-gate/run.log:78–79` and `consumer-resume/run.log:64–65` show the SAME poachingFixture first 208→52 cause in the different family12 LEDGER consumer. Both manifests pin helper d13b6b6a634523a5197e6264a735aeb2eb97690b9c342310fa6e5c31eb9a21f1, identical to current. Those logs contain no completed trust-file result or rivalFixture by 240 failure. Verified older Wave3l core report 48d737049e4d8f473872acb6b9314420f83e2e9fc0dbaefabfe7d0b1efed5888 (baseline 332a742a) contains no trust file. Therefore no exact prior runtime result is established for these eight trust identities, especially the five by 240 cases. The three share a previously observed helper cause; that is not an exact full-test predecessor pass/fail comparison. No broad archive hydration/search occurred.

Read-only Git diff9c91232d→d7d4bacf: fixture helper unchanged; trust test changes only three schema projection literals63→64. No failing test body or fixture recipe changed. Current trust hash95fa362c91d1c3e12f3e92a635954023aeaed38406ab4be76f1fcf86f746656c; prior S7 trust hash86669f338f0001eab915ceb878e1e81db297ca812ebb4c548b04d3707bb7a02a. These facts do not themselves establish that native fixture outcomes are inherited or exonerate current source. Known D5 failures are not a substitute for the missing exact comparison.

## Minimum comparable predecessor selection and inputs

After coordinator audit, compare immutable pre-S8 source 9c91232dd980cbe05399b6fd77ed55454e671f86 using its ORIGINAL trust test and the SAME eight identities listed above, original individual budgets, core project only. Retain its projection 63 literals, original helpers and actual failure messages; do not copy current 64 pins, edit fixtures or run unrelated main. No fullgame/generator is required for that question. This comparison has not been executed by this agent.

Reuse the existing contract64 immutable-source materialization approach, without new framework. Required archive roots/paths:

```text
src
bridge
ui/src
ui/public/lot/hollywood/role-atlas-v1.json
generated
package.json
package-lock.json
tsconfig.json
tsconfig.src.json
tsconfig.bridge.json
vitest.config.ts
vitest.workspace.ts
tests/bridge-p14b2-trust.test.ts
tests/helpers/p14b2-fixtures.ts
tests/helpers/live-era.ts
tests/helpers/p15-roots.ts
tests/helpers/p16-era.ts
```

The exact test helper chain is trust→p14b2/live-era→p15-roots→p16-era; harness p13a is already inside src. These fixture helpers load no external captures/checkpoint JSON, private saves or r3n1 inputs. Existing contract snapshot roots cover BridgeSession’s UI adapter imports and known role-atlas material. The workspace imports plugin-react even for core selection, so preserve original configs/package lock and verify the approved shared node_modules/Node 20 dependency lane rather than install or rewrite config. No snapshot was written and no predecessor runtime was launched in this task.

The eight failures remain real failures of the current complete consumer file, with intended downstream assertions partly/wholly unreached as stated. No inherited-failure waiver, deterministic regression claim, budget change or environmental explanation is asserted.
