# 1361-F6 closure preparation

Prepared 2026-10-04. Test-only proposal, not executed qualification. No repo, production evaluator/catalogue, frozen tree, original fixture or Owner save was edited or read. No node/test/build command ran.

## Inputs and patch

Authority: `1361-F6-parent-response-to-1361-D3.md`, ruling 2. Inspected source: clean reviewed Save45 candidate `ee289de67e453ce269c98d840a48799265c62993` in `/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree`. This patch is applicable to that candidate or its source-equal landed Save45 successor; it adds only two new files:

- `tests/p15c2-legacy-replay-inputs.test.ts`: exact `(id, commercialWeek)` sequence pin, plus genuine frozen-v2 Save45 load/validate/migrate/save preservation.
- `tests/helpers/p15c2-frozen-v2-mint.ts`: standalone producer, never imported by the test.

Patch: `/Users/zacheryspector/studio-scratch/1361-closure-prep/1361-f6-closure-tests.patch`.
Review-revised SHA-256: `26ba616198d2a76c35d99954402ba61531f9c824547564ae91af8810f142283c`.

Independent review by `/root/sweep_review`, 2026-10-04: **PROCEED** for parent-controlled producer installation and recorded mint under existing lane/source/disk gates. The reviewer checked the final source-root/tracked-helper guards and patch SHA. The consumer remains pending the genuine capture and independently recorded source/manifest hashes; G-L and ruling4 work remain separate. A proposed newline-escaping finding was checked directly and withdrawn: source contains the correct single-backslash newline escape. No reviewer execution was claimed.

The literal sequence is `[['lighting-control-01', 936], ['synchronized-sound', 416]]`. Its refusal cites 1361-F6 ruling 2 and forbids mechanical re-pinning without an adopted definition change. The fixture consumer reads only the new named capture and its committed manifest. It checks compressed/uncompressed bytes and hashes, Save45/week6240/seed/definition provenance, the frozen official manifest hash, validation of the stored envelope, current migration plus `makeSave`, unchanged official contents, and unchanged original input.

## Exact mint procedure for the parent

Complete the reviewed Save45 landing and its required recorded gates first. Mint before 1363 changes recovery or any catalogue/evaluator change. The original full replay source remains available if later refresh is needed, but a mint performed after recovery is a different baseline and must not be called the required pre-recovery capture.

1. Independently review this patch. Apply **only** the helper file initially (for example `git apply --include=tests/helpers/p15c2-frozen-v2-mint.ts <patch>`). Check/typecheck it on the landed source, commit with the required handoff checkpoint, and push. Do not add the consumer before the genuine fixture exists; do not fake one to make a pending test green. Capture the full resulting clean HEAD as `MINT_HEAD` in the parent's record. It is a landed Save45 commit; all production code remains identical to the reviewed candidate.
2. Have the recorder/lane run, from the clean repo on pinned Node20, this child command with literal substituted arguments:

   ```sh
   node node_modules/vite-node/vite-node.mjs --script tests/helpers/p15c2-frozen-v2-mint.ts FULL_MINT_HEAD /Users/zacheryspector/studio-scratch/1361-closure-prep/frozen-v2-capture-01
   ```

   Verify the installed vite-node entry path before dispatch; if the package's entry differs, invoke the existing `node_modules/.bin/vite-node --script` wrapper under the same pinned PATH. The final two process arguments must be the full source HEAD and a **new** absolute artifact directory. Its parent exists; the producer resolves its real path, refuses a directory inside the repo, and exclusively creates the output. Do not reuse an output directory on retry; use a fresh numbered name and retain the failed evidence.
3. Use the established source recorder with its exact five output names and a separate lane log. The producer artifact directory above is separate from that recorder output. Recorder guards must verify clean source, AC/disk, expected HEAD/index and postflight. Set an external command wall limit consistent with the existing route/fixture budgets; the producer also refuses after its synchronous body if total time exceeds 210,000 ms (90,000 route + 120,000 fixture). The outer recorder is needed because a synchronous body cannot be interrupted by an ordinary vitest timer. Do not stage or commit until recorder postflight completes.
4. The producer builds `routeAt(6240)` from `tests/helpers/p15c2-route-l.ts` through genuine game actions and ticks. It uses `makeSave`, `validateSaveV45` and `exportSave`; it never calls `freezeCampaignLegacyWeek` directly, changes recording boundaries or reads a fixture. It requires actual industry, a closed founding draft and `campaign-legacy/v2` official. The route deliberately uses the already-adopted historical founding analysis control and a migration-origin industry at6188. This is a genuine generated late-founding route, not a fresh-origin/seed-b campaign, and the manifest says so.
5. Inspect the emitted manifest and recorder results. It records source HEAD, source-file SHA values (including producer/route), seed, source save version, week, definition, compressed/raw bytes and SHA, official SHA, and measured times. Pin the manifest's own bytes/SHA and exact source identity in the closure evidence record. Preserve both files in a new **real** repo directory `tests/fixtures/p15/p15c2-frozen-v2-save45/`: `MANIFEST.json` and `route-l-week-6240.save45.json.gz`. Do not write through a scratch fixture symlink. Original fixture directories and captures remain unchanged.
6. Apply the consumer file from the same patch, check types, and run its two leaves in the heavy lane, then the affected existing P15C tests and appropriate generated checks. Commit/push this complete capture-plus-consumer checkpoint with the handoff update, then run the recorded acceptance as required by the parent's gate protocol. Record actual output, not this proposal's expectations. Tests do not regenerate or overwrite the capture.

## Limits and remaining measurements

- Both tests should pass only after the genuine capture exists. This has not been executed; no byte count, SHA or source HEAD for the future capture is invented here.
- Catalogue ordering is independently pinned as literals. The capture's immutable committed manifest is its byte/hash authority; the parent record must bind that manifest to the actual clean landed mint and recorder output. Do not re-mint it as routine fixture maintenance.
- This satisfies the **proposed implementation** of F6 ruling 2, not F6 ruling 3. G-L still needs paired `makeSave`/`validateSaveV45` timings on seed-b at6240 and8791 and after a post-2040 player release, against the actual declared harness/Bridge ceilings. Route L's capture time is not any of those measurements.
- It does not change the null-lens error or stale comments from F6 ruling4. Those remain separate bounded closure work.
- Every mint, TypeScript execution, test and generated check belongs in the one heavy lane. Patch review, checksums and handoff preparation are read-only lightweight work. No test execution or source qualification is claimed by this specialist.
