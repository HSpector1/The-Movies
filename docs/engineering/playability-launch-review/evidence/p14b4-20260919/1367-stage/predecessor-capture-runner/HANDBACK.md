# One recorded runner for the three remaining predecessor captures

Prepared only in `S/1367-predecessor-capture-runner`. No producer, capture, archive, Node/test/type process or guard was run. No fixture payload was read, and no live source/index/HEAD was changed. Only static Python syntax and named scratch-source hash checks accompany this proposal. Parent installs, qualifies and publishes the exact producers, prepares source-only archives and independently records the named hashes before execution. Parent owns the single heavy lane and final generated-artifact review.

`run-capture.py` selects **one** mode per invocation. It does not run the three concurrently, prepare their archives, typecheck, copy fixtures, adopt results, overwrite attempts or retry. It leaves the existing F6/A8 runner and all accepted producers unchanged.

## Reuse versus new wrapper

The existing `S/1361-capture-runner/run-capture.sh` correctly supplies the five recorder outputs and guard/exit handling, but selects only F6/A8. Its watchdog accepts only 240/330 seconds and does not map these three producers' required inputs. Changing it would invalidate its existing identity. The new single Python file reuses the same existing `run-bounded-source-c2.mjs` and `run-bounded-source-guards.py`, with the same five outputs and exit interpretation.

For `period26`, the child delegates to the already reviewed installed `1363-old-era-period-watchdog.py`, unchanged. For `save45` and `extension37`, the new runner's own child mode implements the same owned-process-session cleanup at 300 seconds: TERM its own group, allow up to five seconds cleanup, then KILL that group even if its leader exited. It never targets another job by name. The outer recorder remains alive and postflight still runs after ordinary failure or timeout. Internal producer deadlines are unchanged; a 300-second external deadline may preempt a producer's last internal deadline check and must be reported as timeout, never as absence.

## Modes and exclusive output ownership

| Mode | Installed producer/config | Historical generator | Required external output |
|---|---|---|---|
| `save45` | `scripts/captures/1363-save45-predecessor.ts` and matching `.config.ts` | Actual accepted published Save45 HEAD; its `src` tree must equal `2eaa697effc38538c37da28b486786ce267a2284:src` | `S/1363-save45-predecessor-capture-01` |
| `extension37` | `scripts/captures/1367-extension-capture.ts` and matching `.config.ts` | `c000479d6e888d3a02f5c2ff534f5dfcbb32af3f`, Save37, actual 46 ticks/real proposal; output is lawfully projected V36 | `S/1367-extension-capture-prep/run-01` |
| `period26` | `scripts/captures/1363-old-era-period-capture.ts`, matching `.config.ts`, reviewed watchdog and `tsconfig.1363-old-era-period-capture.json` | `ce6945d58257f70c1b222a8c00e06038db73f6e4`, Save26, exactly 3 original ticks | `S/1363-old-era-period-capture-01` |

`S` means `/Users/zacheryspector/studio-scratch`. These exact output names are enforced, not generated from a timestamp. Parent directories must already exist. Any existing output or recorder file, including a dangling symlink, refuses. Nothing is cleaned up. A failed attempt needs separately reviewed new naming in producer/runner where applicable; rerunning into the old path is not supported.

Each invocation takes a concrete full accepted `--head`, new `--stem`, exact `--output` and independently accepted `--runner-sha256`. The runner hard-pins the already reviewed installed producer/config/watchdog/type-config bytes, so those values need not be retyped or inherited from ambient environment. It clears capture-specific ambient variables and constructs every producer variable explicitly. Unknown modes, missing/invalid hashes, irrelevant mode-specific arguments, untracked/different scripts and an unexpected output path refuse.

### Exact named manual inputs

- `save45` reads no fixture input. Its required `--src-tree` is the independently recorded 40-character Git tree ID, not a SHA-256. Both current HEAD's source tree and the preserved published predecessor tree must match it.
- `extension37` uses only `tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-contract-gap-freeagent-expiry.json.gz`, whose approved compressed SHA is `f35bd6868904b9b6308e27400ce862d503951c904e4e8007ee25003f187ffee4`, and that exact corpus `MANIFEST.json`. `--input-manifest-sha256` is the parent's independent hash of that manifest. The gzip pin is already enforced inside the accepted producer; no new hash is invented here.
- `period26` uses only `tests/fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz` and `tests/fixtures/p13b/PROVENANCE.md`. `--input-gzip-sha256` and `--input-provenance-sha256` must be independently recorded for those exact files. The approved raw input SHA `11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72` remains enforced by its producer.

Each archive mode additionally requires an existing canonical absolute `--archive-root` and independently computed `--archive-sha256`, using its accepted producer's exact `{path,gitBlob,sha256}` compact-JSON recipe in original Git tree order. The producer checks every archived source file and original Git blob; the orchestration does not weaken or duplicate that authority. No archive is created or discovered by the runner. Repo/archive/output must be disjoint and paths cannot contain symlinks. A later current live era is refused by the producers' existing Save45 checks, even though current validation HEAD and archived generating HEAD are separately recorded.

## Recorder and provenance behavior

Run from `/Users/zacheryspector/The-Movies-headless-program`. The wrapper requires the exact local HEAD already published to `origin`'s `wip/headless-program-20260916-ts`, using read-only `ls-remote` rather than fetching/moving a ref. It checks bounded source cleanliness with fixture/public/e2e automatic-read exclusions, no untracked consumed source, five GiB free, exact scripts, paths and new outputs. It pins Node to the established `v20.20.2` directory, records battery status and uses `caffeinate` for its own process lifetime. It does not acquire a second lane: parent must invoke it under the existing lane owner.

Preflight calls the unchanged accepted guard with cap 0, then the unchanged recorder invokes this runner's `--child` mode. The recorded command contains the exact JSON binding of mode, current HEAD, output, wrapper hash and all supplied external pins. The raw child log additionally prints all producer environment pins and exact script hashes, binding the external scratch wrapper independently of repository source inventory. Its own hash is rechecked in parent and child and after postflight. Do not invoke `--child` directly; it is an internal recorder target, not a replacement for guards.

The five evidence outputs under `E` are exactly:

```text
<stem>.json
<stem>.patch
<stem>.txt
<stem>-preflight.json
<stem>-postflight.json
```

The guard's existing named manual-pin policy remains unchanged. This preparation adds no fixture-tree scan or extra automatic payload read. The producers separately own their explicitly named manual input reads at execution. No extra orchestration result file is written into `E`; parent preserves the lane output and independent reviews as usual.

The runner always attempts postflight after the recorder call. It checks recorder/postflight success independently and requires exact source flags and matching child exit codes. It returns the actual child code; the recorder's own zero exit alone is never interpreted as a passing producer. Child 0 additionally requires the named producer `RESULT.json` to say `MINTED`; child 2 requires `ABSENT`. Other errors/timeouts retain their nonzero status and partial artifacts are not adopted. Final stdout includes the exact result-file hash when present. Even `MINTED` still needs independent generated-artifact review before a consumer checkpoint or fixture publication.

## Parent-only installation and qualification

The hard-coded identities come from the stable reviewed packages:

- Save45 producer patch `63897a2c27393f860f2773cd9fbf03fe31229014e92431fa3dc668bedf0a5221` in `S/1363-save46-red-prep`.
- Archived37 producer patch `dcd18acd106a9c5c4cb4a27fe559fbf30ad7840096d6b608481c6377c90db805` in `S/1367-extension-capture-prep`.
- Revised archived26 producer patch `2e28d9245e761b945d5bdad80e7cf430078cc6f834d98d07eff57671c5f22b17` in `S/1363-old-era-period-capture-prep`.

Install and typecheck those exact files, then commit/publish before any mint. The root TypeScript project omits `scripts`, so it does not alone qualify these producers. For the first two, parent can explicitly typecheck the four installed entry/config files with the root project's corresponding strict flags:

```sh
./node_modules/.bin/tsc --noEmit --target ES2022 --module ES2022 \
  --moduleResolution bundler --lib ES2022 --types node --strict \
  --noUnusedLocals --noUnusedParameters --noImplicitReturns --noFallthroughCasesInSwitch \
  --exactOptionalPropertyTypes --forceConsistentCasingInFileNames --esModuleInterop --skipLibCheck \
  scripts/captures/1363-save45-predecessor.ts \
  scripts/captures/1363-save45-predecessor.config.ts \
  scripts/captures/1367-extension-capture.ts \
  scripts/captures/1367-extension-capture.config.ts
./node_modules/.bin/tsc --project scripts/captures/tsconfig.1363-old-era-period-capture.json --noEmit
```

These are future commands, not measured passes. If qualification changes any pinned file, obtain reviewed fixed hashes and refresh this wrapper before execution; do not bypass a pin. Preserve the original gameplay source until all required predecessor captures close. During each capture, freeze every tracked file, including HANDOFF.md and evidence documentation: individual producer clean-tree checks may be stricter than the outer bounded-source recorder. A documentation edit can invalidate the producer even when outer guards stay exact. The parent prepares archives and acquires named input hashes separately; this script does neither.

## Complete invocation shapes

Replace every angle-bracket placeholder with an independently recorded concrete value. They are missing future identities, not example hashes to copy. `--runner-sha256` is the exact reviewed hash in this package's `SHA256.json`, independently confirmed after review. Use a new reviewed stem per attempted mode, and run only one command at a time under the existing heavy lane after all active postflights finish.

```sh
python3 /Users/zacheryspector/studio-scratch/1367-predecessor-capture-runner/run-capture.py save45 \
  --head <actual-published-current-head> \
  --stem 1367-save45-predecessor-mint \
  --output /Users/zacheryspector/studio-scratch/1363-save45-predecessor-capture-01 \
  --runner-sha256 <accepted-runner-sha256> \
  --src-tree <independently-recorded-original-src-tree-id>

python3 /Users/zacheryspector/studio-scratch/1367-predecessor-capture-runner/run-capture.py extension37 \
  --head <actual-published-current-head> \
  --stem 1367-extension-mint \
  --output /Users/zacheryspector/studio-scratch/1367-extension-capture-prep/run-01 \
  --runner-sha256 <accepted-runner-sha256> \
  --archive-root <prepared-c000479d-source-only-archive> \
  --archive-sha256 <independently-recorded-c000479d-archive-digest> \
  --input-manifest-sha256 <named-v35-c2b-MANIFEST-sha256>

python3 /Users/zacheryspector/studio-scratch/1367-predecessor-capture-runner/run-capture.py period26 \
  --head <actual-published-current-head> \
  --stem 1367-old-era-period-mint \
  --output /Users/zacheryspector/studio-scratch/1363-old-era-period-capture-01 \
  --runner-sha256 <accepted-runner-sha256> \
  --archive-root /Users/zacheryspector/studio-scratch/1363-old-era-v26-archive-01 \
  --archive-sha256 <independently-recorded-ce6945d-archive-digest> \
  --input-gzip-sha256 <named-week309-gzip-sha256> \
  --input-provenance-sha256 <named-p13b-PROVENANCE-md-sha256>
```

The original tick counts, admission/refusal predicates, fixture names, archive generation identities and hash formats remain those of the reviewed producers. A route absence is reported, not searched around. This runner supplies orchestration and attribution only; it creates no new gameplay, witness or acceptance authority.
