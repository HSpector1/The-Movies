# Fixed original-Save42 week-77 capture and unminted consumer

Ready for independent static review; not executed or minted. Only this scratch directory was written. No Node, tests, TypeScript, archive creation, fixture payload access, source/index/HEAD mutation, or new agent occurred. Python parsed the two authored Python scripts without executing them.

## Reason and exact bound

Parent authorized the new repository destination `tests/fixtures/p14/genuine-v42-pre-shelving-week77-1363`. The completed control/Part A reports show zero shelving at produced week 77, with Part A's first receipt dated week 77 and first visible at produced week 78 (r04, script-0005). The control has no shelf through week 93. `BOUNDARY-EVIDENCE.json` pins both reports and those observed facts. Full states first differ in Hollywood at week 50; this package does **not** assume that difference is only a permissible projection. The consumer retains exact equality and can expose an earlier disagreement.

The original 1344-P2 producer uses `p13aGeneratedStudio('p13a-core-causal-01')` and default `tick(state)` calls. This adaptation uses the **same original Save42 source** at `e62c944fef2966ea2ba4b5d28594dd061bc33a94`, generates once, and calls the archived default tick exactly 77 times. It never imports current gameplay, searches seeds/weeks, alters cash, people, receipts or dates, injects actions, or repeats a failed attempt automatically. The original week-93 fixture and its loader remain intact.

## Artifacts and installation

`producer.patch` adds four named files:

- `scripts/captures/1367-week77-capture.ts`
- `scripts/captures/1367-week77-capture.config.ts`
- `scripts/captures/1367-week77-watchdog.py`
- `scripts/captures/tsconfig.1367-week77-capture.json`

Producer patch SHA: `e6cff4166b4c531023e742c6323148719ce6ca9bbadf44172c7cba1eaea4e992`.
Producer source SHA: `7f3acb1b161cbb67e409f59fe5ea28ed245df2362ed99626b1fb1d5470350a59`.
Scratch `run-capture.py` SHA: `ddec7540fd1c7f979cd0ee9b4c69a93a37a85dda4f27e1230dc1ff3088b3efdd`.

Install, commit and publish the four exact scripts before execution. The dedicated config has no gameplay aliases or application plugins. Its explicit type project extends the actual root settings and includes the two TypeScript scripts; parent must run:

```sh
./node_modules/.bin/tsc --project scripts/captures/tsconfig.1367-week77-capture.json --noEmit
```

The scratch runner is a narrow adaptation of the reviewed predecessor runner. Its one mode uses the reviewed owned-child-session watchdog pattern with exactly 300 seconds, TERM then at most five seconds cleanup before KILL of only its child process group. The recorder remains alive for postflight. No timeout amendment or concurrent heavy job is authorized by this preparation.

## Archive and identity

Parent independently creates one immutable external archive, proposed path `/Users/zacheryspector/studio-scratch/1367-week77-v42-archive-01`, from original HEAD e62c944f. Archive exactly these paths: `src`, `bridge/protocol.ts`, `bridge/schema`, `tsconfig.json`. Protocol imports schema modules, so archiving the protocol alone would be incomplete. The archive root must contain exactly src, bridge, tsconfig.json; bridge contains exactly protocol.ts and schema. No symlink path component or nonregular file is accepted.

The producer compares the recursive inventory of those exact roots against `git ls-tree -r -z e62c944fef2966ea2ba4b5d28594dd061bc33a94 -- src bridge/protocol.ts bridge/schema tsconfig.json`. Every file's Git blob identity must match. It separately pins original save.ts, tick.ts, the named p13a harness helper, bridge protocol and tsconfig with literal SHA/blob/byte identities obtained through read-only `git show`; see `ORIGINAL-SOURCE-PINS.json`. Only the named original source/config roots are traversed, never fixture directories.

Parent independently calculates the archive digest before the mint: in that `git ls-tree` output order, rows are `{path,gitBlob,sha256}` in that field order; SHA-256 the compact UTF-8 JSON array without a newline. Supply the actual result as the archive pin. The script checks the entire archive before and after the route and records every original-source hash. No archive pin is invented here.

The current repository supplies Vite/dependencies and **public historical validateSaveV42**, not genesis or ticking. Its accepted, published full HEAD and explicit current writer era (45 or 46) are separate required arguments. They are recorded as currentValidationHead/currentValidationVersion, never as the historical generating HEAD. An era beyond 46 refuses pending review. The runtime protocol identity is loaded from the archived bridge, not the current bridge.

The current source scope is the existing bounded recorder scope (`src`, `bridge`, `tests`, `ui`, `generated`, `scripts`, package/config files), excluding automatic reads under `tests/fixtures/`, `ui/e2e/`, and `ui/public/`. Bounded source must be clean, with no untracked consumed helpers. HEAD, bounded diff, index/staged entries, named installed scripts and dependency metadata stay exact. Docs-only dirt is not gameplay dirt. No fixture payload is an input to this generator.

## Validation and exclusive output

Exclusive external output: `/Users/zacheryspector/studio-scratch/1367-week77-capture-01`. Any existing path, including dangling symlink, refuses. The output, archive and current source must be disjoint. No cleanup, overwrite or implicit retry exists.

The archived ordinary writer, archived public42 reader and current public42 reader validate each boundary from 0 through 77. State and envelope snapshots precede readers/writers; every tick's original state and the initial generated state remain unchanged. Final original writer/export/import/public42/export and current public42/export must reproduce exact original envelope bytes; gzip round-trip must reproduce the same raw string. Each output write is exclusive and hash checked. Source/archive postflight occurs before and after payload publication.

Success writes exactly:

- `genuine-v42-rival-stall-week-77.json.gz`
- `MANIFEST.json`
- `RESULT.json`

The manifest includes original generating HEAD, actual current validation HEAD/era, installed script hashes, archive digest and original named pins, fixed seed/start/tick/end facts, all 78 validation boundary hashes, old protocol identity, final rival facts, gzip/raw hashes and byte counts. RESULT binds manifest SHA, actual timing/command/dependencies, and current/archive pre/post provenance. These are the provenance companions; no separate invented `.provenance.json` is needed.

There is no ABSENT search outcome for this fixed generator: a validation/identity/route/write error is EXECUTION_ERROR, exit 1; a watchdog timeout is 124. Partial files are retained for diagnosis and cannot be adopted. A successful original capture still does not prove the candidate equality premise. That is a separate consumer result.

## Recorded invocation

After review, script types, archive preparation, disk check and single-lane acquisition, run from the repository root. The runner pins Node v20.20.2, requires 5 GiB free and exact published branch HEAD, preflights all five fresh recorder outputs, and invokes the established `run-bounded-source-guards.py` and `run-bounded-source-c2.mjs`. It requires recorder/postprocessor zero, actual child zero/MINTED, fixedSource and allGuardsExact before referring the capture for independent review.

```sh
python3 /Users/zacheryspector/studio-scratch/1367-week77-capture-prep/run-capture.py \
  --head <actual-published-current-full-head> \
  --current-version <45-or-46-matching-that-source> \
  --stem 1367-week77-save42-mint \
  --archive-root /Users/zacheryspector/studio-scratch/1367-week77-v42-archive-01 \
  --archive-sha256 <independently-computed-original-archive-digest> \
  --output /Users/zacheryspector/studio-scratch/1367-week77-capture-01 \
  --runner-sha256 ddec7540fd1c7f979cd0ee9b4c69a93a37a85dda4f27e1230dc1ff3088b3efdd
```

No missing ambient producer environment is required: the runner supplies the actual HEAD/era/archive/output and literal reviewed script hashes, printing the exact binding inside the recorded child. Actual HEAD/archive values remain future inputs, not speculative pins. Parent retains source freeze until complete closed postflight.

## Consumer draft, deliberately not install-ready

`consumer-UNMINTED.patch` SHA `3b367cf2a4f7be9f256a7b564bb276a6a634afc958343008910468c4553cfbb3` adds `tests/p14d1-week77-fixture.ts` and changes only the existing historical viable-control leaf plus its imports. All other leaves remain unchanged. The base is copied from the live test during this preparation; its patch touches none of the earlier reviewed mixed-sequence/current-version adaptations and is intended to compose with them.

The loader has **null placeholders**, not hashes that appear real: independent manifest/gzip/raw byte+SHA pins, archive SHA and actual validation HEAD/era. Calling it before those are filled throws `UNMINTED WEEK77 PREREQUISITE` before payload use. After a successful independently reviewed mint, parent authorizes exact copies of MANIFEST.json and the gzip to the named repository folder. Independently calculate their hashes and decoded raw pin, record those outside the self-consistent manifest, then author/review the final literal-pin followup. Do not install the draft and count its missing pins as a behavioral RED.

The loader first pins/adopts genuine public42 bytes, preserving reader input and original codec bytes. The historical side still performs actual 42→43→44 conversions. The candidate runs its own unchanged harness/ticks to 77. The two explicit adapters are:

- Save45 Part A: ordinary makeSave and public45 admission before any existing comparison projection.
- Save46 B/C: ordinary makeSave and public46 admission, then exact costCutting `{version:1,since:null}` for each rival, zero refund in every period, no facilityDisposed receipt, and actual convertV46ToV45/public45 admission. A nonempty authority fails a named premise; it is never deleted to force equality.

Only after those checks does the original comparison remove screenplayShelving, guarded Slice B relationship fields and the four individually guarded P15 roots. Canonical JSON keeps the established save-format -0/0 and key-order treatment, with array order unchanged. Full remaining state and receipts must still match exactly. Both sides must have no shelf at the compared boundary; the candidate continues from that exact state, for the unchanged maximum 16 ticks, requiring a later first visible shelf. No assertion hard-codes which future receipt wins. Receipt week77 can lawfully first appear after the produced-week77 state.

If full B/C intervenes before 77, or the week50 Hollywood divergence remains after the already authorized projections, report a new precondition/equality finding. Do not strip recovery/payment/history facts, choose a new seed/week, weaken the assertion, or change the original capture route to manufacture a pass. Save45 and Save46 compilation/runtime, the capture itself, all final pins and full equality remain unmeasured in this handback.
