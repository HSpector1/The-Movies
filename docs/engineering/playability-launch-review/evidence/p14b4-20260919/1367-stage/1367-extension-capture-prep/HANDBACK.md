# 1367 used-extension capture producer preparation

This is an unexecuted, separately named producer proposal for 1362-O item 9. It supplies the missing genuine used-extension witness without changing the older masked tests or pretending that the adjacent V27 receipt test covers finance-only refusal. No archive was generated, no fixture payload was read, and no Node, test, typecheck or gameplay process ran during preparation. Source was inspected through narrow current-file reads and immutable `git show` reads.

## Files and source identities

Install the reviewed files at these exact current-repository paths:

- `scripts/captures/1367-extension-capture.ts`
- `scripts/captures/1367-extension-capture.config.ts`

The engine that generates gameplay is immutable Git source **`c000479d6e888d3a02f5c2ff534f5dfcbb32af3f`**, live Save37. The current accepted repository supplies the runner, frozen public validation and consumer types; it is a different, explicitly recorded HEAD. The draft currently requires current live Save45, inspected at `2eaa697effc38538c37da28b486786ce267a2284`. If that predecessor changes, refresh the producer and its review; do not simply remove its era check.

The producer repeats the reviewed 975-A / 978 archived-source pattern: `/@fs/` SSR imports load the old source; every archived file under `src` must match the old Git blob; additional source files and symlinks refuse. The old code is never copied over current production. Before and after execution, identity checks require the same generating tree, current HEAD with clean bounded gameplay source, tracked named producer/config/input paths and exact input/dependency hashes. The producer's current HEAD is never described as the historical generating HEAD.

Current automatic source identity follows `run-bounded-source-c2.mjs` exactly: `src`, `bridge`, `tests`, `ui`, `generated`, `scripts`, `package.json`, `package-lock.json`, `vitest.config.ts`, `vitest.workspace.ts`, `tsconfig.json`, `tsconfig.bridge.json`, and `tsconfig.src.json`, excluding `tests/fixtures/`, `ui/e2e/`, and `ui/public/` before content reads. Git pathspec exclusions also prevent untracked discovery from entering those payload trees. Named producer/config/input/manifest hashes remain separate manual pins. Index bytes and stage-entry metadata are hash-bound without opening excluded payloads; Git optional locks are disabled. Only the bounded diff hash is retained in RESULT, never its source/binary content. Unrelated documentation dirt is not a gameplay change, while the known index identity must remain unchanged across the run.

## Exact route and named outputs

Only the known V35 input is consumed: `tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-contract-gap-freeagent-expiry.json.gz`, with compressed SHA-256 `f35bd6868904b9b6308e27400ce862d503951c904e4e8007ee25003f187ffee4`. The existing input manifest is separately hash-bound in the command, and decoded input hash is recorded. Both archived and current public V35 readers admit it before use.

The real archived migration produces Save37 at week 52. Exactly 40 ordinary archived ticks reach week 92. The open extension case must still have `outcome: null` and `extensionUsed: false`. The real archived proposal at week 92 is `{ talentId: 'authored-0000', issuerStudioId: 'studio-d7df6c8e-player', termWeeks: 58, premiumTier: 1.1 }`. Exactly six further ticks reach week 98; the actual used record, settled case and its validated employment facts must then exist. There is no second seed, altered offer, extra tick, synthetic funding, authored person, stripped root or fabricated settlement.

Each snapshot is admitted by both public V37 validators, then lawfully projected by the archived `convertV37ToV36` and admitted by both public V36 validators **before** either refusal check. Both the archived and current V36-to-V35 converters must produce the exact intended message with one case and zero/one used record respectively. Both codecs must round-trip the actual V36 bytes unchanged. Presence of a used record without its required settled case is never manufactured to isolate the OR branch.

Before mint, name the final fixture directory as `tests/fixtures/p14/genuine-v36-downgrade-extension-controls/`, containing exactly:

- `MANIFEST.json`
- `reproduced-v36-extension-open-week92.json.gz`
- `reproduced-v36-extension-used-week98.json.gz`

The producer first writes this corpus beneath a **new scratch output directory**, alongside `RESULT.json`. Parent may copy only the three verified corpus files into the named repository fixture directory after recorded mint review. Existing entries, including dangling symlinks, are explicitly rejected with `lstat` before output creation; nothing is overwritten. `RESULT.json` records current/generating identities, original input, command, producer/config hashes, archive file list and digest, dependency metadata, actual facts, timing, and final file hashes including the manifest hash. The parent evidence must independently bind the RESULT, manifest and fixture hashes; a self-consistent manifest alone does not establish provenance.

## Recorded execution, for the parent heavy lane only

First independently review this draft and typecheck its installed form. Then commit the producer/config and required handoff state at the accepted current predecessor; run from the actual repository root with clean tracked bounded gameplay source and no undeclared untracked consumed helpers. Documentation-only worktree dirt is outside that automatic scope. Prepare the original read-only archive separately, checking its files against `git ls-tree -r c000479d… -- src`; this handback does not execute or silently generate that archive.

The archive digest uses the exact JSON list `{ path, gitBlob, sha256 }` in Git tree order, as 975-A / 978 did. Record that digest outside the mint before invoking it. The earlier 978 archive reported `1583d5c7d6311cc8de99429a4ead13d8d82a4abdc73602eb436cf5dac6280816`; independently verify the prepared archive instead of assuming that an arbitrary directory matches. Read and record only the named input manifest hash in that preparation. Producer/config hashes must be the independently reviewed hashes of the installed files.

Exact command shape:

```sh
env P1367_CURRENT_HEAD=FULL_ACCEPTED_PRODUCER_HEAD \
  P1367_PRODUCER_SHA256=REVIEWED_INSTALLED_PRODUCER_HASH \
  P1367_CONFIG_SHA256=REVIEWED_INSTALLED_CONFIG_HASH \
  P1367_ARCHIVE_ROOT=/absolute/read-only-c000479d-archive \
  P1367_ARCHIVE_FILES_SHA256=INDEPENDENTLY_VERIFIED_ARCHIVE_DIGEST \
  P1367_INPUT_MANIFEST_SHA256=INDEPENDENTLY_RECORDED_INPUT_MANIFEST_HASH \
  P1367_OUTPUT=/Users/zacheryspector/studio-scratch/1367-extension-capture-prep/run-01 \
  node_modules/.bin/vite-node --config scripts/captures/1367-extension-capture.config.ts \
  --script scripts/captures/1367-extension-capture.ts
```

Use the existing parent recorder to preserve command, stdout/stderr, exit code and before/after source checks with a five-minute outer process deadline. The internal deadline checks between bounded operations cannot interrupt a hung synchronous transform or tick. Only one heavy process may run. Do not run this concurrently with the current broad gates. The scratch output parent must already exist; the run directory itself must not exist and must be disjoint from current and archived source.

## Outcomes and adoption limits

- **MINTED / exit 0:** exactly 46 ticks, two admitted original-engine witnesses, successful intended refusals and round trips, postflight identity checks, and all three verified corpus files. This enables a separately authored pinned consumer test; it is not already coverage in the tests-only patch.
- **ABSENT / exit 2:** the valid original route failed a named witness premise or holds unsupported Scientist authority preventing lawful projection. Source/input postflight checks still must pass. Only RESULT is written, with no partial corpus adopted. Report absence; do not broaden the search.
- **EXECUTION_ERROR / exit 1:** import, validation, invariant, hash, timing, codec, filesystem or any unexpected action failure. This is never relabeled absence. Preserve logs and any partial outputs as rejected evidence. A preflight failure before output creation is reported on stderr only; the parent recorder remains authoritative for it. Diagnose the concrete failure before any new, separately named attempt.

Current reader rejection of genuinely valid old gameplay is an execution/integration finding, not permission to mutate the capture. No witness, fixture hash, successful run or consumed heavy-lane time is asserted by this preparation.

The V27 finance tolerance observation remains separate: 1362-O allows controlled guard mutants, but a manually inserted tiny numerical residue would not be a genuine producer witness. Keep that gap documented pending scoped runtime evidence; this producer creates no finance mutation or history.
