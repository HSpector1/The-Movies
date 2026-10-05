# Independent A8 configuration correction review

Disposition: PROCEED with the narrow configuration correction and revised runner. No blocker found. This does not establish a capture witness or runtime success.

Exact hashes:

- Unchanged installed/reviewed probe: `54b184a3c44f7652870f090706cc5240caed02023ae4bfb4f982f3a2d8c711b3`
- Previous workspace: `a66c6eb6e5e8147d702cdd890fa0c6e8e47e71ba1137c4587691386a98712e7f`
- Corrected installed workspace: `ba8be6d9169e9d6ecd82a1604ed50bee4da079b735020e3388e87cc1f3787c35`
- Retained original runner: `608132e110736939051b9c259bf8e8d3415ecae3f50be2c6fe6c7f72b2ab1268`
- New run-capture-a8-r2.sh: `62fd331cc57b41fcca0b9f678220856e94f8fb7d22738071d7a14a2521983998`

The installed probe is byte-identical to the reviewed scratch probe. The workspace delta removes exactly fileParallelism:false, minWorkers:1 and maxWorkers:1. Name, node environment, sole explicit probe include, and 300000 ms test timeout remain unchanged.

Installed Vitest declarations at node_modules/vitest/dist/chunks/reporters.nr4dxCkA.d.ts:2438 explicitly list all three properties in NonProjectOptions; ProjectConfig omits those global options. Moving them to the invocation is appropriate for this installed version.

The new runner differs from its retained predecessor only in the A8 COMMAND array: it adds --maxWorkers=1 --minWorkers=1 --no-file-parallelism. This restores the intended single-worker execution through global CLI options. No F6 command, watchdog bound, source/publication/disk/output guard, preflight/postflight behavior or assertion is changed. The 330-second outer A8 bound and 300-second inner test deadline are unchanged.

`bash -n` passed for the revised runner. No Node, test, type-check or capture execution was performed; no moving typecheck log was read. The parent-reported typecheck and its pending root result remain separate evidence. No source/index/HEAD or fixture writes occurred; only this authorized review report was written.
