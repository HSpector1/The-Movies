# Independent F6/A8 capture runner review

Reviewer: Codex /root/sweep_review, 2026-10-04.
Verdict: PROCEED to parent-controlled execution preparation; install, typecheck and publish the separately reviewed producers first. No mint/runtime result is claimed.

## Exact reviewed scripts

- run-capture.sh SHA-256: `608132e110736939051b9c259bf8e8d3415ecae3f50be2c6fe6c7f72b2ab1268`.
- bounded-child.py SHA-256: `717d02e676d08600ffd4c5b54cb9cb5b94d3d4ddb73555ad70981e8bae406b9c`.

Read scripts and checked the actual run-bounded-source-c2.mjs and run-bounded-source-guards.py exit/field semantics without executing them.

## Findings and disposition

**Timeout worker cleanup — resolved.** Initially, after group TERM the code waited only for its leader. A promptly exiting leader could leave a TERM-ignoring descendant without the intended KILL, allowing postflight with a leftover worker. Final code polls/reaps the leader while separately checking its owned process group, allows bounded five-second grace, then sends KILL to that group even if the leader has exited. ProcessLookupError races are handled and the leader is reaped. It never targets other jobs or a process-name match.

No remaining blocking static issue found. Node20, exact local/published HEAD, clean source, 5 GiB, unique recorder stem and external exclusive artifact path are checked. Artifact ancestors cannot be symlinks. Commands use arrays; F6/A8 select only their already-reviewed producer entrypoints. Parent must verify installed entry paths during type qualification, as the earlier handbacks require.

The source recorder retains its five allowed outputs. It reports child failure through record.exitCode while its own exit primarily signals source integrity; the wrapper correctly checks the recorder and postflight independently, validates fixedSource/allGuardsExact and matching child exits, then returns the actual child code. Postflight still runs after ordinary child failure or bounded timeout. Inspect raw output and producer artifacts before declaring MINTED or ABSENT; neither follows merely from guard success.

Outer child caps240s/330s leave30s beyond the producers'210s/300s internal budgets. Timeout returns124 after bounded owned-group cleanup. These limits do not authorize a larger route or changed producer. Power is recorded and caffeinate used; parent invokes the single heavy lane. Hashes of wrapper/helper are printed to the lane log; preserve that log with recorded source and artifact provenance.

## Limits

Author reports shell/Python syntax checks passed; reviewer ran no syntax execution, node, tests or processes. No actual capture, observer binding, source equality, dependency behavior or measured timing is established here. Runtime remains blocked until active Save45 gates/postflight are complete and producer installation/typecheck/push prerequisites hold. Never mutate source/index during recorded execution or postflight.

Only this review file was written under explicit parent authorization. No source, fixture, repository/index mutation or fixture payload access occurred.
