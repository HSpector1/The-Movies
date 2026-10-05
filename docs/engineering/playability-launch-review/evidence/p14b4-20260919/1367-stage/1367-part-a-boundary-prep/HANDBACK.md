# Part A first-boundary probe and completed focused attribution

Prepared only; not typechecked or executed. Parent owns installation, source guards and execution. No source/index mutation, fixture payload read or nested agent was used.

## Probe contract

`boundary.probe.ts` SHA-256 `f939d90ef4074e9ce9f4c51b6eafc86a07ca760220de386e7983fa91de725845` is installed unchanged at `tests/probes/1367-boundary.probe.ts` in two isolated trees. `boundary.workspace.ts` SHA `d1772ae771e2b8867e21ed6f588a7cd968bcf28bee887695a635882fdf109177` is installed as a root explicit workspace. `compare.py` SHA `0c53827021c7f7e0804eac2665e302586f1f9761892b4dc2c39acf87f25c6541` reads only the two completed reports and prints the first state-digest divergence boundary and changed top-level roots.

Control must be exact published source `858cd9d24903da6fea1b59662bc154d6b9184480`; candidate must be that source plus reviewed Part A patch `2b11a5c13259b69ddcea3476b826c6eba690b7ea82facfa11e2aff03352bd5d9`. The parent can use its existing exact source archive or assemble the control from those immutable blobs; do not substitute the historical H1 arm or an older source with unrelated differences. Verify all source hashes and both changed candidate files against the reviewed manifest. Preserve the original candidate run tree/results; install probe in a separately named child/archive or explicitly bind the additive probe/config in a new manifest. No old fixture is needed.

Each arm invokes genuine `p13aGeneratedStudio('p13a-core-causal-01')`, then exactly 93 ordinary ticks. No spy, source override, account edit or save reload intervenes. Each boundary is admitted by `makeSave`; its result is discarded. Canonical input bytes before/after both observer and tick must match. Every produced boundary0..93 records complete-state SHA and top-level root SHAs, plus newly visible full `screenplayShelved` receipts in canonical receipt order. Receipt week and first-visible produced boundary are separate fields, preventing the input-week/produced-week off-by-one error. No game input is modified. Output is exclusive (`wx`), under canonical scratch-only ancestry with symlink ancestors refused; parent must create the new real output parent in advance. The code does not produce or read a historical save.

Set `BOUNDARY_ARM=control` or `part-a` and `BOUNDARY_OUTPUT` to distinct absolute new `.json` paths. Use exact reviewed Node20.20.2 and existing owned-child330-second wrapper, with:

`node node_modules/vitest/vitest.mjs run --workspace boundary.workspace.ts --project boundary --maxWorkers=1 --minWorkers=1 --no-file-parallelism --reporter=verbose`

The leaf's 300-second timeout does not bound synchronous work; the outer process-group watchdog is required. Run arms sequentially in the parent's heavy lane with before/after source, probe, config and dependency identities. No full historical fixture corpus or live source tree is required. Both actual child0 and complete exclusive reports are necessary. The subsequent lightweight comparison takes `control.json candidate.json` positional arguments. It never decides by failed equality alone.

Interpretation: a full-state divergence can occur before shelving due merely to changed rejection counts. It is not itself F11's trigger. Inspect the actual first receipt, specifically r04/script-0005 and any earlier other-studio receipt. Under1363-F11, an earlier candidate first shelving requires a genuine original-engine pre-shelving control at the parent-named earlier path, keeping week93 intact. A receipt first visible at produced boundary W+1 was booked at input week W; the state at W precedes that receipt. The absence of any receipt through produced93 proves only that bounded fact, not a later boundary. The probe does not imply equality with the old Save42 fixture or mint its replacement.

## Independently attributed completed runs

`ATTRIBUTION.json` SHA `53998aadb431db6485611082eb0fed1a3795798fd34f6dd1629c5eb970278800` preserves all46 identities/statuses in each completed output, extracted without emitting the giant expected-state diff.

F6 recorded raw E/1367-f6-quality-regressions.txt SHA `67bbba8a197d9e1038e0a38655063216f476faf785ed68e8eb9e52a9d5d122e0`: 37 PASS /9 FAIL,46 unique leaves. The named lens-shape leaf passes all five variants. The failures are precisely the same two authorized shelving re-pins and A1/A2/A3/A4/hopeless-A6/A9/A8 first failures expected for original Part A law. Child1, no timeout, watchdog elapsed49.191 seconds. These are successful F6 scope evidence and intended remaining Part A REDs, not an overall GREEN.

Part A focused-r1 raw SHA `45efe977934f577ec1d2f3a4c0cc21a4340cea0351afcebb51f969e860bd0e4c`:45 PASS /1 FAIL,46 unique leaves. All nine preceding Part A failed identities now pass, including A9 neutrality/work and the entire genuine A8 post-shelving/account/history checks. The one newly failing leaf is `shelving-viable-control` genesis-to-week93 canonical equality with the migrated old fixture, before its later no-shelving premise assertions. Thus it does not alone prove an earlier receipt. Child1, no timeout, watchdog41.037 seconds (outer elapsed about41.3). Candidate result records unchanged before/after guards and liveHEAD858cd9d2; the previously documented custom-config guard limitation remains explicit. All six own-era leaves and F6 pass on the candidate.

These observations justify the narrow boundary probe, not an automatic re-pin or a claim of complete Part A acceptance. The broader landing/fallout/G-L limits in the existing review remain.
