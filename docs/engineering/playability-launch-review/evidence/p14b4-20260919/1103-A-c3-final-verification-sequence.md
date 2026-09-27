# 1103-A — C3 final maintenance and verification sequence

Docs-only execution plan; nothing below was applied or run here.1093 and1096
remain frozen staging, not qualified live changes. The parent owns application,
index/commits and the sole heavy lane; independent test and review ownership
remain separate. Prioritize any actual1100 source correction before this later
work. No new test selection, timeout, retry, fixture, native or Owner-campaign
work is introduced.

## 1. Close the source-sensitive work before applying maintenance

Keep current consumed source/HEAD/index, original A and1098 inputs frozen while
any endurance or1100 snapshot/type/forensic command is active. Remaining B/C/D
must retain their original source/reference identities and sequence. Stage
application cannot be interleaved with them: even test-only edits change the
strict recorded source identity. Preserve every closed success/failure at its
actual source. Do not rerun completed A to rewrite its recording format.

After the required commands close and independent dispositions are recorded,
preserve/mirror exact1100 manifest/intervention/result artifacts as the parent
already specified, retaining the temporary copy. No result is presumed here.
The forensic source may collect an explicitly invalid trajectory; it never
authorizes replacing current production or validating that trajectory as gameplay.

## 2. Guarded1093 →1096 application, without resetting source

The current checkout stays at its newest real HEAD. `8599ee2a` in1093 is a
historical baseline identity, not a checkout/reset target. Fresh per-file hashes
govern application; newer work must be preserved if any hash differs.

| Frozen stage artifact | Bytes | SHA256 |
| --- | ---: | --- |
|1093 manifest|18,545|`68a42bbae2a04d92f8778621e5e37efc7e891cf1ea62f5a738108c22497a57ea`|
|1093 patch|73,024|`c1ee31f0059ca11b6c94b7bb72469683ee4193782e1f3f78bc9e840cd061f00b`|
|1096 manifest|142,004|`b8bb99baaa1a904059850f4778bce112affdfff9e0b6f2c8c54021013116f78a`|
|1096 patch|99,034|`91307a13f624a797c1bfff4909bc73fd74f5928edc5b9fc668a754b5099cb17e`|

Application order for the parent after ownership/source freeze release:

1. Verify all four artifact identities and every stage baseline/staged copied
   file against its manifest. Before changing live bytes,1093's37 live files
   must equal its `baselineBytes`/`baselineSha256`;1096's62 live inputs must
   still equal their captured `liveSha256`. Check the9 overlapping paths against
   the exact named1093 staged candidate, and the53 other baselines against their
   named unchanged live source. Do not use a cast, root deletion or automatic
   conflict resolution to bypass a mismatch.
2. Check and apply only the1093 patch. Then require all37 live files to equal
   their exact1093 staged identities. Capture this intermediate source diff and
   application boundary; do not treat the prepared proposal as execution proof.
3. Now require all62 live1096 inputs to equal **1096's baseline** identities.
   Nine are intentionally the1093 result, so their old `liveSha256` is no longer
   the applicable post-step2 comparison. Check and apply only1096's patch.
4. Require all62 paths to equal1096 staged identities and the28 first-stage-only
   paths to retain1093 staged identities. The union is90 paths.1096 has60 new
   diffs; its two unchanged copies remain1093 changes. Verify the final changed
   path set, declarations/timeout lines and protected B5 body/pins; retain an
   exact ordered final patch and independently reviewed checkpoint before broad
   execution. No production/generated/fixture delta belongs to these patches.

The precise patch operations, once the above byte guards pass, are:

```sh
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1093-c3-maintenance-stage/maintenance.patch
git apply docs/engineering/playability-launch-review/evidence/p14b4-20260919/1093-c3-maintenance-stage/maintenance.patch
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1096-c3-remaining-stage/maintenance.patch
git apply docs/engineering/playability-launch-review/evidence/p14b4-20260919/1096-c3-remaining-stage/maintenance.patch
```

These are sequential guarded steps, not an unguarded four-command batch. Do not
use `--3way`, force, reset or replacement copies when a preimage differs. Resolve
the actual cause while preserving the new work and frozen evidence.

The entire B5 seed-pin table, ledger function and family12 body remain held.
1096 records body SHA
`7a754f00a9d6a50d40e20f89c24ef01cd90ef30805313070ae69ea5a28592d4f`.
Receipt `b729a1f3…186c4`, employment `d4f19ea4…fe8b1` and first-take
`e9a1b08f…b9e2` expectations are not amended by either patch. Actual1062 exposed
all comparisons, but only independently reviewed1100 causal evidence could
justify a separately owned, explicitly recorded later pin amendment. No automatic
addition to these frozen stages is authorized by this plan.

## 3. Exact paired commands from the frozen manifests

Run the five groups below sequentially on the frozen final staged candidate,
recording each child exit and full first causes. They reuse the original command
arrays; actual case counts come from the new runs. Applying both already-reviewed
stages before these groups avoids an unnecessary intermediate broad run. Capture
the combined source delta honestly when comparing to original observations.

| Order | Exact manifest member | Original observed scope/result |
| --- | --- | --- |
|1|1093 `verificationGroups`, record `1086/1052`|The single failed cash leaf from1052; that original whole scaffold was101 PASS/1 FAIL. Other101 cases are not scheduled again solely for this cash fix.|
|2|1093 `verificationGroups`, record `1048`|Exact30-file metadata selector:43 selected,2 PASS/41 FAIL. Includes F11/F12/positive bodies/generated header omissions previously missed by914.|
|3|1093 `verificationGroups`, record `1049`|Exact seven whole runtime files:111 cases,49 PASS/62 FAIL.|
|4|1093 `verificationGroups`, record `1051`|Whole process-restart file:10 cases,9 PASS/1 current-version FAIL.|
|5|1096 `verificationCommandForParent`|Exact1084/1053 remaining61 whole files:969 cases,701 PASS/266 FAIL/2 existing TODO.|

The direct commands for groups1,3,4 are:

```sh
node_modules/.bin/vitest run --project core tests/cash-ledger-checkpoint-v11.test.ts --testNamePattern 'prevents every frozen builder from laundering an invalid checkpoint'

node_modules/.bin/vitest run --project core tests/bridge-p14c3-promise-digest-continuity.test.ts tests/bridge-p14c2rm-runtime.test.ts tests/bridge-p14c2s-scientist-runtime.test.ts tests/bridge-p06-checkpoint-recovery.test.ts tests/bridge-owner-ux-projection20-migration.test.ts tests/bridge-p14b2-checkpoint.test.ts tests/bridge-runtime-checkpoint.test.ts

node_modules/.bin/vitest run --project core tests/bridge-process-restart.test.ts
```

For groups2/5, consume their complete immutable argv arrays rather than
reconstructing regexes or a61-file list from prose. This prepared launcher shows
the exact extraction for **one** parent-recorded group; set `choice` to one of the
five fixed keys, once per record. The parent recorder may pass that same array
directly instead. No launcher has been executed or added as source.

```js
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
const choice = '1048' // one of:1086/1052,1048,1049,1051,1053
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const aPath = `${E}/1093-c3-maintenance-stage/manifest.json`
const bPath = `${E}/1096-c3-remaining-stage/manifest.json`
const aRaw = readFileSync(aPath), bRaw = readFileSync(bPath)
assert.equal(sha(aRaw), '68a42bbae2a04d92f8778621e5e37efc7e891cf1ea62f5a738108c22497a57ea')
assert.equal(sha(bRaw), 'b8bb99baaa1a904059850f4778bce112affdfff9e0b6f2c8c54021013116f78a')
const a = JSON.parse(aRaw), b = JSON.parse(bRaw)
const groups = new Map(a.verificationGroups.map(row => [row.record, row.command]))
groups.set('1053', b.verificationCommandForParent)
const command = groups.get(choice)
assert.ok(command)
console.log(JSON.stringify({ choice, command }))
const child = spawnSync(command[0], command.slice(1), { stdio: 'inherit' })
assert.equal(sha(readFileSync(aPath)), sha(aRaw))
assert.equal(sha(readFileSync(bPath)), sha(bRaw))
if (child.error) throw child.error
if (child.signal) throw new Error(`child terminated:${child.signal}`)
process.exitCode = child.status ?? 1
```

Group1048's frozen nested command itself pins914 to
`aa0a45521227f87ae0251fa0c859504956a46a3bdaa0a5088cbd79e80bfc6bd5`;
it excludes only already-covered C2b W10 and whole-file B8 and adds the four
specified omitted leaves. Do not change its stable pattern or leaf names.
Group1053 equals1084's command exactly;1084 JSON is6,047 bytes/SHA
`5605f05ab20740da83d72dc7e63e22da0ed7d4f51bfca1205b574681e16c135e`.
Its23 inherited failures and held B5 gameplay pin are deliberately still selected.

No assertion reached only after a repaired version/scaffold gate is presumed
passing. Attribute each newly exposed domain or premise failure before another
edit. Keep original1046/1048/1049/1051/1052/1053 records untouched.

## 4. Required final types, generated contract and fixtures

After candidate corrections stabilize, run these exact separate commands in the
single heavy lane, with per-command source/HEAD/diff/untracked and input guards:

```sh
node_modules/.bin/tsc --noEmit
node_modules/.bin/tsc -p ui/tsconfig.json --noEmit
node_modules/.bin/tsc -p tsconfig.bridge.json
node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check
node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check
```

The Bridge config already sets `noEmit:true`; no compiler/configuration change is
needed. Track the original imported1052 docs producer (`f7d19d39`) explicitly
alongside recorder SOURCE because the observer type import includes it. The
1098/1100 diagnostics have their own separate recorded compiler/byte guards;
these ordinary project commands do not silently qualify their execution.

1036/1037 already passed the two unchanged projection53 generator checks;
their prior results remain valid for their source. The commands above are the
final candidate gates, not regeneration instructions. A check failure requires
attribution; do not run a writing generator or replace genuine fixtures merely
to obtain a pass. Independent1047 declaration-body measurement remains the
F10/F11 authority (401,842 bytes,
`4ab4141390d2d17c35da0d1bf64cce841f1608103146b2cbca6212ab114a8cec`).
All six fixed declaration fixtures and genuine outgoing52/Scientist51 artifacts
remain frozen. No additional native/C# consumer execution is added here.

## 5. Matched complete core and UI gates

Once source is stable, retain the required complete gates as separate records:

```sh
node_modules/.bin/vitest run --project core
npm run test:ui
```

Core is the exact927 command, also used by861. UI uses the exact673/713 command;
the current package script remains `vitest run --project ui`, which is the same
underlying selection described in1029-A. Run it once as the matched full UI
gate, not once through npm and again through the equivalent direct executable.
No worker, timeout, environment or exclusion override is introduced.

Core baseline927 was on12485a3c with empty source patch:376 files,4,446 cases,
4,377 PASS/58 FAIL/11 TODO.932 attributed55 inherited failures (54 baseline
first causes plus intermittent FU-2) and3 stale boundary expectations.934 then
passed those3 specific repairs on the exact933 patch;935 passed Bridge types.
936 is a **composite** qualification, not a later full all-green run. Preserve
that distinction rather than rewriting927's58 as a measured55-case rerun.

Record713's matched full UI onfc37bd27 had201 files,2,690 cases,2,655 PASS/
30 FAIL/5 skipped and one unhandled `hollywoodPerformance is not a function`
exception.673 had26 failures; the unchanged673 source rerun in713-X had32.
Records713/719 established14 intermittent cases across those samples. Therefore
the aggregate count is not a stable C3 regression oracle. Preserve the full
individual failures and unhandled-error identity, diagnose new/changed causes,
and keep FU-1 open. This plan does not schedule speculative repetitions. Its
standing return condition—three full runs at one unchanged source with identical
failure count **and identities**—must be satisfied separately before claiming
the project reliable. Source reachability cannot be inferred from unchanged UI
files alone.

## 6. Attribution and retained limits

Join exact project/file/suite/leaf identities, preserving every failure and the
complete primary diagnostic through its first relevant source/stack frame.
Use1088's normalization: outer and line-trailing whitespace only. Preserve
assertion values, inner text and real causes. Any necessary title alias or
temporary-path normalization must be explicit and independently justified;
do not invent aliases to hide changed failures.

For each matched scope, report NEW, VANISHED, RETAINED-identical and CHANGED
diagnostic sets. A newly reached downstream assertion is a changed first cause,
not evidence that the original test was fully qualified. A vanished timeout is
an observation, not proof of a timing fix. Track unhandled errors separately.
Recorder exit0 is not child PASS. Count source drift, signals, incomplete runs
and unreached assertions honestly. No forecast of final aggregate failures is
made from adding overlapping partial-run counts.

Retain these specific facts:

- 1088's61-file subset has23 inherited byte-identical diagnostics: one B5
  poaching fixture, nine natural rival cast-outcome cases and13 rival seating
  cases. Its243 new failures partition into242 staged current-boundary causes
  and the held actual B5 receipt cause. Keep991's three inherited B2 poaching
  first causes and masked downstream assertions visible as well.
- Canonical098 **K1–K4 passed**. L1/L2 failed one cached positive premise after
 451+156=607 real ticks: no passive Writer hire, actual finality at607.1064
  leaves sign/payment, later screenplay/production/release and reload assertions
  unexecuted. Other successful routes or endurance cannot fill that witness.
  Do not extend the world, change seed/funding, skip the leaves or reinterpret
  their absence as qualified rival Writer work.
- Stage D1043's R8 remains a real5-second Vitest timeout, as does its original
 1033 timeout. Standalone1050 completed the original coordinator Save As, two
  actual advances, duplicate/no-write, clean Load and restart assertions with
  one fresh factory and real close. It used an in-memory store; it is semantic
  evidence, not a Vitest pass, real-disk/native proof or latency qualification.
  The process-restart whole file is a distinct gate. A future full-run R8 outcome
  must be recorded without erasing either earlier timeout.
- FU-2's original20-second threshold and927 timeout remain.931's separate
 17,392ms success does not erase it. A recurrence needs named-operation and
  comparable-source/load attribution under719, never an automatic timeout
  increase, retry, quarantine or speculative optimization campaign.
- The current1062 trajectory is admitted gameplay authority.1100 may supply
  counterfactual causal evidence only; invalid continuation is not a passing
  gameplay test or permission to revert the qualified occupancy fix. Any later
  pin amendment gets its own concrete diff, independent review and focused
  result before being included in the final full-candidate account.

After observed failures, release only cause-supported fixes to their owner,
preserve raw evidence and new source identity, then run appropriate focused
checks. A materially changed final candidate needs the applicable matched full
gate again; unchanged completed work is reused rather than repeated by default.
Final publication requires independent stable-diff/record review, recoverable
GitHub checkpoint and actual remote/local equality, with accurate remaining
limits. Unity/native, protected-main promotion and Owner acceptance remain
deferred; a composite qualification must not be labelled all-green.
