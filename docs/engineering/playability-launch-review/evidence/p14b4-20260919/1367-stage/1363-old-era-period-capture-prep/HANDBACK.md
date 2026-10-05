# Genuine V26 old-period capture producer preparation

Scratch-only authoring for the independently reviewed `S/1363-old-era-period-prep/old-era-period-red.patch` (`20a0893996b4d557bcd0538da39777e2985fae1bc7ea1fb450ce94e5035b3209`). No archive, payload or capture was generated/read; no Node, tests, typecheck, source/index/HEAD edit or nested agent. The existing test and all earlier drafts are unchanged. Parent review is required before installing or executing this producer.

The only gameplay route is the original **Save26** engine at `ce6945d58257f70c1b222a8c00e06038db73f6e4`: the already named week 309 input, followed by exactly three ordinary default `tick(state)` calls to 312. There is no current tick, migration, action injection, clock jump, affordability repair, cash edit or synthetic receipt. The output is a new reproduction from original source, not a claim that this capture existed in the old commit.

## Patch and explicit scripts

`producer.patch` adds only these four files at their matching repository paths:

- `scripts/captures/1363-old-era-period-capture.ts`
- `scripts/captures/1363-old-era-period-capture.config.ts`
- `scripts/captures/1363-old-era-period-watchdog.py`
- `scripts/captures/tsconfig.1363-old-era-period-capture.json`

The dedicated Vite config has no application plugins or gameplay aliases. The dedicated TypeScript project includes the producer/config explicitly because the root project includes `src` and `tests`, not `scripts`. It retains root strict compiler settings, with Node types and no emit. Future parent-controlled typecheck:

```sh
./node_modules/.bin/tsc --project scripts/captures/tsconfig.1363-old-era-period-capture.json --noEmit
```

The five-minute watchdog follows the previously reviewed owned-child-session pattern but is separately named, accepts only this exact capture command and fixes its ceiling at 300 seconds. It sends TERM only to its own child process group on timeout, waits at most five seconds for cleanup, then KILLs that owned group. Timeout exits 124; it is never an absent witness or successful capture. The outer bounded-source recorder must remain alive to record termination and finish its postflight. The existing general runner accepts only 240/330 seconds, so passing 300 to it would be invalid; this narrow new wrapper avoids that ambiguity.

## Required inputs and archive preparation

Only these payload/provenance inputs are consumed at future authorized execution:

- `tests/fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz`
- `tests/fixtures/p13b/PROVENANCE.md`

The existing approved raw input SHA is `11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72`. Parent must independently record the exact gzip and named provenance-file hashes before invoking the producer. No invented hashes or directory search substitutes for those pins. The script requires both and also verifies the known raw hash after decompression. These exact two input paths are excluded from automatic source traversal and hashed separately as authorized manual inputs.

Parent separately creates an immutable archive containing the original commit's `src` tree, for example in a new `/Users/zacheryspector/studio-scratch/1363-old-era-v26-archive-01`, after source/disk/lane checks. The producer does not create or modify the archive. No symlink component is permitted in the archive root or source tree. It compares the exact file inventory with `git ls-tree -r -z ce6945d58257f70c1b222a8c00e06038db73f6e4 -- src`; each original file must be an ordinary blob and its bytes must have the original Git blob identity. Extra, missing, replaced or symlinked source refuses. Only this source tree is recursively inspected, never a fixture tree.

Independently calculate the archive digest using the producer's declared recipe before execution: in original `git ls-tree` order, form rows `{path,gitBlob,sha256}`; SHA-256 the compact UTF-8 `JSON.stringify(rows)` without a trailing newline. Names and field order are significant. The producer compares that external pin and re-verifies the entire archived source before/after. It loads only that archive's `save.ts` and `tick.ts` through the established absolute `/@fs/` Vite mechanism; their relative imports resolve within the checked source tree. Original `LIVE_SAVE_VERSION` must be 26.

The current repository is used for loader/dependency infrastructure and **public V26 validation**, not gameplay. Its actual accepted full HEAD is independently recorded as `currentValidationHead`; it must remain a clean published **Save45** validation predecessor. The producer checks `current.LIVE_SAVE_VERSION === 45`; a later source era needs an explicit refresh. It must never label this current HEAD as the historical generating HEAD.

## Source and output guards

Install and commit all four exact reviewed scripts before the mint. Named scripts, type config, input/provenance and current validator/package files must be tracked ordinary files, with no symlink path components. The producer/config/watchdog/type-config hashes are independently supplied and checked. Use the established recorder scope: `src`, `bridge`, `tests`, `ui`, `generated`, `scripts`, package files and named root build configs, excluding automatic reads under `tests/fixtures/`, `ui/e2e/` and `ui/public/`. Clean bounded tracked source and no untracked consumed source are required. Only the bounded diff hash is recorded, never an unrestricted full binary diff. Current HEAD, source scope/diff, index and staged-entry identities must remain exact before/after; docs-only dirt is not treated as a gameplay change. Runtime package metadata is separately hash-bound.

The exclusive output is fixed to the previously named `/Users/zacheryspector/studio-scratch/1363-old-era-period-capture-01`. Any existing path, including a dangling symlink, refuses. Output and both source trees must be disjoint and the output parent must have no symlink component. No overwrite, deletion or cleanup is implemented.

Success writes exactly:

- `genuine-v26-sound-mid-deployment-week312.json.gz`
- `MANIFEST.json`
- `RESULT.json`

The manifest implements exactly the already reviewed consumer format `1363-old-era-period-capture/v1`, including historical generating HEAD, actual current validation HEAD, producer/archive hashes, Save26 / start 309 / three ticks / end 312, input raw hash and capture gzip/raw hashes. It adds actual input/provenance/dependency/script identities, validation-boundary hashes, last-period owner evidence and the route limitation. The result binds the manifest hash, current and archive pre/post provenance, actual command and timing. Each write is exclusive and output bytes are rehashed.

## Validation, absence and limits

The input is first accepted by archived public26 and unchanged current public26. At weeks 309, 310, 311 and 312, the actual archived writer and both public26 validators must accept. Writer/reader neutrality and each original tick's input immutability are checked. The original parsed save remains byte-identical throughout. The final archived export/import and current public26/export must reproduce the same canonical envelope bytes. No live writer is used.

At 312 the producer requires at least one actual rival whose last period still belongs to the prior year and ends before 312. This is the narrow calendar-boundary premise, not proof of affordable research. If that valid route produces no such rival, postflight must still pass and the producer records `ABSENT`, exit 2, with no payload/manifest. Every execution, validation, mutation, identity, output-write or bound failure is `EXECUTION_ERROR`, exit 1; partial bytes are retained but cannot be adopted. An external timeout is a separate recorded timeout even if process termination prevents a local result file. Only `MINTED`, zero child exit, exact outer postflight and independently checked outputs permit adoption.

The separate reviewed test remains responsible for public26→27 migration, actual affordable `admitRivalPlans(..., 'pre-recovery')`, every charged owner's previous-year premise and the exact old period/receipt/debit assertions. This producer neither invokes current admission nor predicts that it will succeed. If the paid-plan premise is absent, report it without new ticks, alternative fixtures, money changes or waived checks. Both inherited Save41 termination leakage and proposed Save46 refund leakage remain the target of that later test.

## Exact future invocation

Run from the accepted repository top level, after parent review, explicit script typecheck, immutable archive validation, source/disk gates and acquisition of the single heavy lane. The parent wraps this child command in the existing bounded-source recorder with pre/post guards. Do not execute it concurrently with F6 or any other heavy job.

```sh
P1363_OLD_PERIOD_CURRENT_HEAD=<accepted-current-full-head> \
P1363_OLD_PERIOD_ARCHIVE_ROOT=/Users/zacheryspector/studio-scratch/1363-old-era-v26-archive-01 \
P1363_OLD_PERIOD_ARCHIVE_SHA256=<independently-recorded-archive-rows-sha256> \
P1363_OLD_PERIOD_PRODUCER_SHA256=<reviewed-installed-producer-sha256> \
P1363_OLD_PERIOD_CONFIG_SHA256=<reviewed-installed-config-sha256> \
P1363_OLD_PERIOD_WATCHDOG_SHA256=<reviewed-installed-watchdog-sha256> \
P1363_OLD_PERIOD_TYPES_SHA256=<reviewed-installed-type-config-sha256> \
P1363_OLD_PERIOD_INPUT_GZIP_SHA256=<independently-recorded-input-gzip-sha256> \
P1363_OLD_PERIOD_INPUT_PROVENANCE_SHA256=<independently-recorded-PROVENANCE-md-sha256> \
P1363_OLD_PERIOD_OUTPUT=/Users/zacheryspector/studio-scratch/1363-old-era-period-capture-01 \
python3 scripts/captures/1363-old-era-period-watchdog.py \
  node node_modules/vite-node/vite-node.mjs \
  --config scripts/captures/1363-old-era-period-capture.config.ts \
  --script scripts/captures/1363-old-era-period-capture.ts
```

Placeholders represent genuinely missing future identities, not approved fabricated values. Use the session's pinned Node/Python environment and record their versions. The manifest hash and gzip hash must be independently recorded outside the manifest after mint and supplied to the existing test's environment alongside the independently accepted producer/archive hashes. Parent must independently review the generated artifacts before their use or any fixture publication. No mint, observed route result, typecheck or production fix is claimed by this handback.


## Independent-review correction: snapshot before every reader

The first static review found that the initial input snapshot followed the archived reader, and boundary envelope snapshots followed their first explicit archived reader. The revised producer snapshots parsed input before its first reader, checks exact object identity and bytes after each archived/current reader, and snapshots each produced boundary envelope before any explicit reader. Final writer, archived/current validation, export, imported-envelope validation and re-export have separate before/after neutrality assertions. This closes the evidence gap without changing the input, three-tick route, schema, authority, output names or execution scope. No producer execution accompanied the revision.
