# Current natural recovery measurement: executable preparation

This is the bounded current-source 0 → 520 measurement portion of 1363-V. It implements the existing measurement map and 1363-A §6, 1363-F rulings 6, 9, 10 and 12, and 1363-A2 §7. It neither completes 1363-V nor grants a checkpoint, closure, tuning change or playable partial landing. No game, Node, typecheck or test ran during authoring.

## Fixed experiment

Four exact arms: C0 (original Save45 current control), A (the existing Part A/F6 candidate), AB (the independently reviewed partial natural-only Save46 arm), and ABC (the preserved full candidate). `KNOWN-ARM-SOURCES.json` records all 188 source files and original consumed configs for each arm. A carries its actual F6 validation source; it is not falsely described as identical to original C0. AB retains complete Save46 representation, validation and direct C APIs, but the approved delta removes automatic C integration. This driver calls no direct C API and asserts zero AB refund movements and disposal receipts at every state week. ABC versus AB isolates automatic C integration; AB versus A includes Save46 representation/validation overhead, which timing must retain.

The seeds are exactly `p13a-core-causal-01`, `seed-b`, `p13b-s8-bridge-probe-01`, `p13-public-commercial-adoption`, and `p15a1-w2-market-01`. Each route uses the established `p13aGeneratedStudio(seed)` and exactly 520 default `tick(state)` calls, with no actions and no develop override. There is no search, horizon escalation, fixture input, or new saved-world capture. This driver does not perform historical 1344's extra week-521 summary tick.

Each arm/seed has three independent processes: untouched-source `clean`, source-observed `observed`, and an independent `repeat` of observed. Sixty processes is the complete fixed matrix; the coordinator may run one at a time. Clean and observed copies are separate. The comparator requires every weekly whole-state and final RNG hash to agree across modes and the repeated non-timing branch/money/receipt output to match. Failed or absent runs remain execution/prerequisite failures.

## Exact supplied code

`measurement-driver.patch` adds the test, observer sink, dedicated Vitest config, and strict no-emit type config. `files/` contains the same exact new files. The test reads actual source APIs and never supplies altered policy inputs. Source observation patches for all four arms are in `observer-patches/`; their sidecars bind original and instrumented file hashes. `prepare-observer.py` generated these using exact pins and unique anchors, without changing any supplied tree. It adds copied observations inside actual executed branches; its disposal observation caches the exact predicate call once and returns its unchanged result. No policy, order, cash, people, dates, receipts, or history is authored by the observer.

Source observations record actual staffing reserve refusals, scheduled/non-due decisions, ready/retry outcomes, commissioning gates, termination charges and fixed-cost booking, and actual C candidate/refusal facts. Vitest spies call the original chooser, actual refusal re-search, B entry/release predicates, and standing update, returning their original results. The locked-package observer independently enumerates billings/scales/marketing, verifies original affordable/viable counts and chooser result, and forecasts skipped packages under the same seed/key. The commission-price observer uses the separate six-shape/six-billing menu, perceived inputs and authored promise ranges; it does not apply the locked viability rule to commissions. Input hashes and untouched-source replay are required neutrality controls.

## Parent installation and execution

1. Keep the known source trees immutable. Construct clean and observed copies for each arm outside the live repository using the exact source/config pins. Install `measurement-driver.patch` into both. Apply only the corresponding observer patch to the observed copy. Reuse the accepted Node 20.20.2 dependency installation. No fixtures or prior outputs are needed.
2. In each copy, run the explicit type gate under the sole heavy lane: `<node> node_modules/typescript/bin/tsc -p tsconfig.1368-measurement.json`. This preparation is not typecheck evidence. A source/observer-binding/type failure is a prerequisite failure, not intended behavioral RED.
3. Bind each pair with the concrete published coordinator HEAD and resolved Node binary. `bind-arm.py` refuses source/config/driver drift and writes an exclusive manifest; it makes no tree changes:

```bash
python3 bind-arm.py --arm ABC --clean /absolute/ABC-clean --observed /absolute/ABC-observed --published-head FULL_PUBLISHED_HEAD --publication-repo /Users/zacheryspector/The-Movies-headless-program --node /absolute/node20 --output /absolute/manifests/ABC.json
```

4. Run one explicit process at a time. `run-one.py` owns a 330-second process-group watchdog, requires 5 GiB free disk and Node v20.20.2, verifies the pinned full source/config/kit/runtime/manifest plus publication HEAD before and after, and preserves five recorder files: `source-pre.json`, `raw.txt`, `exit.json`, `source-post.json`, and `result.json`. No automatic retry or budget change is made. Its child test has a 300-second operational timeout; neither timer replaces the 1356 whole-harness acceptance ceiling. A timeout is not ABSENT.

```bash
python3 run-one.py --manifest /absolute/manifests/ABC.json --manifest-sha256 ACTUAL_MANIFEST_SHA256 --seed p13a-core-causal-01 --mode clean --output /Users/zacheryspector/studio-scratch/1368-recovery-measurement-runs/current520-01/ABC/p13a-core-causal-01/clean
```

The named run root is `S/1368-recovery-measurement-runs/current520-01`; each of the fixed arm/seed/mode leaves is exclusive. Parent creates their parent directories. Source archive construction, dependency installation, exact publication HEAD, concrete manifests, the recorder lane and all runtime belong to the parent. No placeholder hash is accepted as an actual pin.

5. After all complete, make a pinned JSON run index `{ "runs": [{ "arm": "ABC", "seed": "p13a-core-causal-01", "mode": "clean", "path": "/absolute/completed/run", "resultSha256": "actual" }, ...] }` with exactly the 60 prescribed rows. Run `python3 compare.py --runs /absolute/runs.json --runs-sha256 ACTUAL_SHA256 --output /absolute/new-comparison-directory`. It rejects any failed/missing process and reports findings without accepting the checkpoint.

## Produced facts and limits

Each process emits all 521 weekly boundary hashes, actual cash/reserve/headcount/payroll/opex, retained facilities, scripts and shelving, research/seats/work digests, actual adoptions/plans, annual periods with every actual money kind, new industry and first-take receipts, proposal-version removals (not invented withdrawal receipts), incremental research work, and weekly money reconciliation. Actual termination receipts reconcile to their original shared charge; disposal receipts reconcile to refund movements. Observer facts include scoped release payback and actual booking-phase plant and payroll, so end-of-tick expiry or operational completion is not mistaken for the earlier charge boundary.

The condition adapter follows the adopted 1357-P end-of-week law in shadow: no-loan arm a, maximum eligible rival-loan arm b, installments for the preceding interval, and absorbing closure-due. Its money is not game money and never clears cutting or proves a real loan restart. Results retain dormant survivors, first nonpositive cash, entry, later activity and each real money kind. The 520-week tail cannot establish the later official condition thresholds.

`compare.py` conserves observed evaluation outcomes, checks C0/A identity through the first changed-label input and A/AB whole-state/account identity through the first global entry input, and never strips nonempty cutting/refund/disposal authority. It flags later A greenlights after candidate entry as **possible false-positive cases requiring parent adjudication of lawful restart at that actual entry**; later greenlighting alone is not mislabeled a proved false-positive. It reports earlier nonpositive cash or shadow closure-due against A separately from the per-release scoped algebra. It reports all settled-film net/cost, actual fixed cost per nine-week pace, forecast margin shares and actual release awareness context. The gross-to-hold-awareness figure is a labelled fixed-star/market nine-step drift model using the unchanged source equation, not guaranteed future proceeds. Zero films is censored, not a profitability pass.

Original historical 154 movement attribution, 1560–6240 condition checkpoints, player-only identity, Row 6/promise 148 continuations, same-candidate G-P/G-L, genuine post-2040 release cost, later enabled pressure and real P15B loan restart remain distinct uncompleted tasks. `pressure: as-authored` deliberately does not infer enabled pressure merely from the tuning constant or root. No deferred source, economics, template, awareness, closure or salary law is changed by this package.

## Static author verification and remaining gates

Python syntax parsed. Exact C0/A/AB/ABC source inventories were read and pinned; A, AB and ABC matched their named authority maps. All observer anchors generated with expected multiplicity. New-file patch bytes match the supplied files. No runtime, fixture payload, live source, index or HEAD mutation occurred. Independent static review, parent typechecks, actual observer binding, the complete clean/observed/repeat matrix and all finding dispositions remain required.
