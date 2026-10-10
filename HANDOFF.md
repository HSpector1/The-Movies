# HANDOFF

Last writer: Claude (Fable 5.1), 2026-10-10 (America/Chicago), resuming cold from the Codex/GPT-6.1 Sol handoff below. The detailed account that follows is preserved; Claude's takeover reconciliation and the Owner's recorded answer are inserted where they apply.

## Claude takeover reconciliation, 2026-10-10

- Verified at takeover: local and remote `wip/headless-program-20260916-ts` both at `9b67d768cb38245ac2dcc72ae17bba261005ce59` (the handoff's own containing commit, docs-only successor to d3072005); `HEAD:src` still `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`; remote main `c902a704…` unmerged; working tree clean; `S/HEAVY-LANE-LOCK` absent; no project Python/Node/test workers; 4,398,744 KiB free.
- **Owner answer received 2026-10-10 (Claude session, AskUserQuestion): "Approve fresh baseline."** The Owner approved starting fullfunction verification from a fresh, separately identified operational commonGit baseline on current HEAD, preserving the unexplained historical Git-metadata interval (12:10:59–12:11:44Z) and every failed result (42397, 54871, 96592) as failed. This is the narrow recovery in `Q/OPERATIONAL-RECOVERY-PROPOSAL.md`. It is not permission to claim any old attempt passed. Do not ask again.
- Owner standing orders in the same session: "see how far you can get in game development using as many sub agents and resources you need"; "You may use as many subagents as you need." GPT-6.1 Sol is not available to Claude, so Claude subagents are used under this later explicit authorization. Cache clearing was authorized if storage runs short (caches only; never source, saves, evidence, or user files).
- Further Owner orders, same session, verbatim: "Use any Skills you need to make as much progress as you possibly can, update the handoff file when you make progress. Ensure lessons learned are captured as well as you get hard fought wins" and "Owner approval not needed for anything, just go make it happen." Claude therefore proceeds without further Owner gates, records each decision it would previously have escalated in this document, updates this handoff at every checkpoint, and appends lessons to the "Major lessons" list.
- A `HANDOFF TRIGGER` (Claude weekly usage 97%) fired at session start; this checkpoint records the approval before any runtime work so Codex can resume cold.
- No lean-ctx MCP tools exist in this Claude session; native Read/Bash were used.

## Read this first

The game is **not finished through P18**. P16 is incomplete; P17 and P18 runtime implementation remains downstream. The recent work repaired and tested verification infrastructure needed to resolve the older 1363 evidence ledger. It did not advance the production gameplay source. Do not mistake the large number of archived reviews, controls, or documentation commits for completion of game systems.

The concrete win is a reproduced Git verification defect and a tested narrow fix: an inherited Python helper removed `GIT_OPTIONAL_LOCKS=0` from child environments, allowing an intended read-only `git status` to rewrite its index. Eight focused controls demonstrate the original defect and corrected behavior. However, the old full Git-metadata checksum cannot be reconstructed from the evidence originally retained. That historical interval remains unqualified, and the Owner has not yet answered the explicit request to start a new verification baseline with that gap preserved.

**The Owner's recovery decision has been received (approved; see the Claude takeover reconciliation above). The next blocking actions are current-HEAD source binding, independent review, fresh full protection, and one properly recorded qualification attempt.** Do not rerun a stale launcher, replay closed diagnostics, reset the old checksum, or merge this branch to main.

## Where the work is

### Repository, Git, and publication

| Item | Verified location or identity |
| --- | --- |
| Live repository | `/Users/zacheryspector/The-Movies-headless-program` |
| Branch | `wip/headless-program-20260916-ts` |
| Remote | `https://github.com/HSpector1/The-Movies` |
| Codex detailed-handoff commit (docs-only; Claude took over here) | `9b67d768cb38245ac2dcc72ae17bba261005ce59` |
| Published AQ implementation/evidence checkpoint | `d30720052633dbdf092c27f2f12415c5cb1a06cc` |
| Its AP parent | `d20347b83ea7497ed17c48ec14d8f64a3ce69cc8` |
| Earlier AO checkpoint | `f2f97c622db7f5332164b790d1646355e89c00f4` |
| Production `src/` tree, unchanged across these checkpoints | `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554` |
| Remote main, still unmerged | `c902a704eb948cc576083d0973c8c23e59937dc1` |
| AQ complete commit tree | `0dd3fd5b9995b31a5ae38389d5bee8b5df25468f` |

This detailed handoff and the late AQ evidence carry are a **documentation-only successor to d3072005**. Resolve the containing commit with Git; its own SHA cannot be embedded in its committed contents. Do not treat d3072005 as the new route's current operational HEAD after this handoff is published. The source tree above must remain unchanged.

At the start of handoff preparation, an explicit fetch confirmed local HEAD and the remote branch both at d3072005, remote main at c902a704, and a clean working tree. AQ's actual normal commit, push, explicit tracking-ref fetch, ancestry, complete tree, and clean readback are retained in `D_AQ/PUSH-READBACK.json`. It records publication at `2026-10-10T13:51:16.146253Z` (08:51 CDT). The final publication of this handoff is a separate observation; see `H/HANDOFF-PUBLICATION-READBACK.json` when present and confirm against Git.

Always pass the live repository as the tool's working directory. The former launch directory under `~/Downloads` was deleted or inaccessible. **Do not recover, recreate, or run from it.** Some session launch metadata still names it; that does not make it the working repository.

### Path map used throughout this document

These are abbreviations for reading, not shell environment variables. Expand them before issuing commands.

| Name | Absolute path |
| --- | --- |
| `R` | `/Users/zacheryspector/The-Movies-headless-program` |
| `S` | `/Users/zacheryspector/studio-scratch` |
| `E` | `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919` |
| `A` — published AQ archive | `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-aq-git-guard-repair-and-preservation-diagnostic` |
| `Q` — frozen AQ root decisions | `/Users/zacheryspector/studio-scratch/1370-aq-root-continuation-20261010-r1` |
| `D_AQ` — now frozen late AQ finalization | `/Users/zacheryspector/studio-scratch/1370-aq-checkpoint-root-finalization-20261010-r1` |
| `L` — whole late AQ directory carried with this handoff | `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-aq-late-finalization-handoff-20261010` |
| `H` — this handoff's local preparation/publication records | `/Users/zacheryspector/studio-scratch/1370-aq-claude-handoff-preparation-20261010-r1` |

`A/ARCHIVE-MANIFEST.json` is the lookup authority for original scratch files. Copied sources generally live under `A/payload/<original-package-basename>/<filename>`. Other records reuse authenticated already-published Git blobs; consult their manifest mapping rather than assuming every role has a new payload copy. LOCAL entries intentionally retain only path, size and hash in GitHub. The corresponding raw bodies remain at their original scratch locations.

`L/MANIFEST.json` maps every one of the 47 files in D_AQ to `L/payload/<filename>`: 1,644,624 payload bytes, plus README and manifest. This closes the previous handoff's instruction to carry the whole late AQ directory. D_AQ and Q are now frozen; do not append to them. Use fresh, clearly named packages for subsequent work. H contains this handoff's later process/publication metadata and is separate from both archives; carry relevant H records at the next checkpoint, without exporting its LOCAL process evidence.

### Required reading, in order

1. This `HANDOFF.md`, then the actual latest Owner messages, especially the unanswered recovery question.
2. `E/1370-AQ-git-guard-repair-and-preservation-diagnostic.md` and `A/ARCHIVE-MANIFEST.json`.
3. `A/payload/1370-aq-root-continuation-20261010-r1/OPERATIONAL-RECOVERY-PROPOSAL.md`, `OPERATIONAL-RECOVERY-PROPOSAL-ADOPTION.json`, and `PROOF-SANITIZER-INTEGRATION-PLAN.md`.
4. `A/payload/1370-aq-root-continuation-20261010-r1/LESSONS-r9.md` and `L/payload/LESSONS-LATE.md` (17 lessons total, not 17 revisions).
5. `L/payload/PUSH-READBACK.json`, `INDEPENDENT-FINAL-PUBLICATION-REVIEW.json`, and `INDEX-VERIFICATION-COMPLETE.json` for the actual AQ publication.
6. `E/1370-AP-native-observer-controls-and-protected-stop.md` and `E/1370-AO-observer-row-diagnostic-closure.md` for the inherited failure and source-role chain.
7. `R/docs/engineering/playability-launch-review/plans/HEADLESS-REMAINDER-IMPLEMENTATION-PLAN.md`, then the exact phase authorities listed below when their gates become reachable.

The recovery proposal retains its original early status line saying it awaits independent review. A later independent design review and root adoption exist. **Design review is complete; Owner approval and runtime recovery admission are not.** Read the adoption rather than silently editing historical proposal text.

## Active order and Owner authority

The Owner explicitly authorized continued work through bounded P18, GitHub backups, fixing blockers, independent specialist assistance, and recording major lessons. The earlier 9:05 PM stopping time was a one-off and was expressly revoked as a standing deadline. The Owner later restricted spawned subagents to **GPT-6.1 Sol**. If that model is unavailable to Claude, do the work in the parent rather than substituting a different subagent model without authorization.

The approved dependency order is:

`1363 ledger and closure → 1367-O2 conditional main promotion → 1364 → 1365 → P15B/P15C completion → P16 → canonical P17 → bounded P18`.

Use one production writer and one recorded heavy lane. Specialists may prepare bounded sources, RED cases, contracts, and independent reviews in assigned scratch packages. The parent reconciles actual results, adopts reviewed work, and owns production edits/publication. No production source change before genuine ledger admission. Existing authorization covers ordinary implementation and backups; do not invent new Owner approval gates for routine work. The specific unexplained-baseline exception described here is an actual outstanding decision because the approved plan explicitly says **“Preserve failures and do not repin unexplained results.”**

P19, optional expanded P17 shapes/crossovers, and native/Unity acceptance are outside this endpoint. The main merge was conditionally authorized after genuine 1363 closure and all 1367-O2 conditions, not before. Use a normal history-preserving merge when those conditions truly pass. No force push, reset, squash of published history, or early promotion.

`CLAUDE.md` contains historical M0A/Fable restrictions and handoff rules. Later explicit Owner orders and the current headless remainder plan supersede historical scope exclusions; do not restart the project under an old charter. Preserve deterministic behavior, strict contracts, generated ownership, and the one-writer rule. The handoff skill used by Codex is `/Users/zacheryspector/.codex/skills/handoff/SKILL.md`; Claude's corresponding skill exists at `/Users/zacheryspector/.claude/skills/handoff/SKILL.md`.

## State: what was tried, what worked, and what did not

### How to interpret the evidence

“Actual” numbers below are tool/recording session identifiers, not necessarily operating-system PIDs. They identify retained observations; a new Claude session should read their JSON/log artifacts, not try to resume expired tool sessions. “Specific RED” means an intentionally invalid control was refused for the expected reason; it is not an unexplained failing test. “Source-only” means reviewed/prepared code, without the corresponding runtime qualification.

The current focus is a market-decision verification arm called M0 and a route called **fullfunction**. Fullfunction qualification exercises the original functions, fixtures, a baseline and a deliberately changed negative control. Passing it would still not equal completing the 416-week ledger, the game phases, or native acceptance. These names do not mean restarting the project at its original M0A phase.

### A. Native observer diagnostics: 86 controls passed

The inherited observer work needed trustworthy refusal diagnostics. Early source review missed a path where an unknown codec exception could reach a spoofable error field/getter. An independent test author caught that before runtime. The initial source/review were preserved, the acceptance was withdrawn, and a narrow corrected source was independently reviewed.

Another control bug put assertions inside a callback designed to catch writer errors, which could swallow the assertion. The corrected tests captured observations and checked them outside the contained callback, while verifying original error identity. This was a test-quality repair, not a relaxed production behavior.

Actual **58815** passed **86 controls: 13 positive and 73 specific RED**, retaining the original 72 cases and adding 14. Recorder time was **3.432947114983108 seconds**. Independent review `8df85592…` and root adoption `385249f0…` admit the finite result and cleanup. The inherited recorder warning remains evidence, not an erased failure.

Source package: `S/1370-aq-native-observer-refusal-diagnostic-source-20261010-r2`.
Root decision: `Q/NATIVE-REFUSAL-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json`.

This proves bounded diagnostics and error preservation. It does **not** establish that the complete game scenario fits the observer caps.

### B. Protection succeeded before the failed fullfunction attempt

The current-AP full protection scan, actual **88384**, completed in **459.9390340069949 seconds**, including **343.83853859000374 seconds** in inventory. It covered nine protected roots and complete source/dependency maps. Root adoption `4bd6fe37…` accepted this actual before-state. The separately reviewed short refresh, actual **33751**, reused that recorded baseline under then-continuous protection and refreshed live checks.

Full guard source: `S/1370-aq-current-operational-fullguard-source-20261010-r1`.
Original scanner: `snapshot.py`, SHA256 `51f11d5f9bc55d77ed9e1b7d0bce4d36d1c9af865835617d585629fa8f694f85`.
Original configuration: `CONFIG.json`, SHA256 `a058c0d63bd0f0432f26d4ebcae62a80977eaccfd7e2406cf7a7e6f221b23fec`.
Original before snapshot: `evidence/before-fill-current-ap-r1/SNAPSHOT.json`, SHA256 `bc21a3dfd61812205d4499d4d0ba7cc04c868a1aa69216d3353bb4b6e278e0ec`.

These accepted before observations are historical. The subsequent postflight failed, and publication changed Git/documentation metadata. They cannot serve as a current uninterrupted protection claim for Claude's next run.

### C. Fullfunction actual 42397 stopped during generation

The AP-bound launcher and outer source mappings were correct, but generated `runtime/core.test.ts` still contained the **AO** HEAD `f2f97c62…` as its expected current commit. The real current commit was **AP** `d20347b8…`. The evaluated assertion failed at generated core line 11. Review had checked wrapper/inverse mappings without finding this embedded generated literal.

Actual **42397** exited **2**, after **43.809350859 seconds** of recorder time; this was not a timeout. **No fixture packet, baseline scenario, typed-catch mutant, or observer diagnostic ran.** The BEFORE proof existed; AFTER, final Node proof, prefix and weeks remained null. Do not describe this as a new observer-cap failure or a fullfunction pass.

Exact parent records: `S/1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-recorded-20261010-r1/{EXECUTION-GRANT.json,ACTUAL-TOOL.json,READBACK.json,READER-ACTUAL-TOOL.json}`.
Preserved review correction: `Q/FULLFUNCTION-R2-GENERATED-HEAD-REVIEW-CORRECTION.json`.
Held R3 preparation: `S/1370-aq-fullfunction-generated-authority-repair-preparation-20261010-r1`, particularly `GENERATED-AUTHORITY-AUDIT.json`, `STATIC-AUDIT.json`, `prepare_corrected.py`, and `audit_corrected.py`.

R3 statically corrects the AP literal but was **not run**. It is now stale as a current-HEAD binding because AQ and this handoff follow AP. Preserve R3 and create a fresh derivative binding the actual new commit; do not execute its old launcher unchanged.

### D. Mandatory shared postflight actual 54871 failed

Despite the generation STOP, the mandatory complete shared postflight was run. Actual **54871** exited **1** with the original error:

`STOP: full baseline byte/metadata/inode/root equality failed`

The original scanner asserted final equality before writing the actual compared maps. Its output directory remained empty. Therefore the exact differing field for **this original observation** is unavailable. Guessing a changed file from the message, repinning the baseline, or claiming a later scan retroactively explains it would be invalid.

Parent records: `S/1370-aq-native-refusal-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1/{GRANT.json,ACTUAL-TOOL.json,FAILURE-READBACK.json,postflight.stderr,postflight.stdout}`.
Root failure admission: `Q/SHARED-POSTFLIGHT-FAILURE-OBSERVED-ADOPTION.json`.
The readback recorded nine owned process/group absences and an absent lane lock. It admits the failed observation and cleanup, not protection success.

### E. A truthful diagnostic wrapper passed 32 controls

A separately reviewed wrapper was built to preserve bounded comparison evidence at the original assertion while rethrowing the original exception. It did not replace the original scanner or weaken equality. A preliminary attribution design relied on filename/line coordinates; independent review showed those can be imitated. The corrected wrapper compiles the authenticated original source without executing it and matches its actual `main` code object and exact predicate frame.

Actual **93221** passed **32 controls: 9 positive and 23 specific RED**, in **1.1601861900126096 recorder seconds**. Controls include impostor and duplicate frames, exact output bounds, integer/string-key identity, and original-error precedence when diagnostic writing itself fails. The original recorder's warning remains recorded; the worker stderr was empty.

Controls parent: `S/1370-aq-original-guard-diagnostic-pure-controls-parent-recorded-20261010-r1`.
Diagnostic source: `S/1370-aq-original-shared-postflight-diagnostic-source-20261010-r1`.
Root controls admission: `Q/SHARED-GUARD-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json`.

This is a diagnostic-mechanism pass. It does not make the original protection predicate pass.

### F. Diagnostic actual 96592 retained the failed comparison

Fresh actual **96592** again exited **1** on the unchanged original predicate. This time the wrapper retained the complete LOCAL immutable map and still propagated the original failure. Its bounded summary exhausted **65,536 visits**, reported incomplete coverage, and listed no differences. Do not interpret that empty list as equality.

A separate comparator, followed by independent complete traversal of **226,011 parsed nodes**, found exactly one changed scalar:

`protectedDigests/commonGit`

- Before: `33ae2bafe9a021341cf75ede325cfdb91263b956073ed822bfe41132f4b72b57`
- After: `0972dde0009904ea17a5db98b2b4e56dffec805b04bf4110d30e4dcacfb115f1`

All other immutable fields matched, including the other 18 top-level keys and four protected digests. This is a complete comparison of **96592's retained map against the original before snapshot**, not reconstruction of the map discarded by 54871.

Diagnostic parent: `S/1370-aq-original-shared-postflight-diagnostic-parent-recorded-20261010-r1`.
Important records there: `ACTUAL-TOOL.json`, `READBACK.json`, `READER-ACTUAL-TOOL.json`, `ACTUAL-IMMUTABLE-LOCAL.json`, `DIAGNOSTIC-SUMMARY-LOCAL.json`.
Comparator: `S/1370-aq-retained-immutable-comparison-source-20261010-r1`.
Comparator actual/result: `S/1370-aq-retained-immutable-comparison-parent-recorded-20261010-r1/{ACTUAL-TOOL.json,COMPARISON-LOCAL.json}`.
Independent observed review: `S/1370-aq-original-shared-postflight-diagnostic-independent-observed-review-20261010-r1/RECEIPT.json` (`65315920…`).
Root diagnostic admission: `Q/SHARED-GUARD-DIAGNOSTIC-OBSERVED-ADOPTION.json` (`14017425…`).

Raw map, summary and comparison bodies are LOCAL. Their archive records are metadata, not exported bodies. The reader confirmed eleven owned process/group absences and an absent lane lock. Neither original nor diagnostic protection was admitted.

### G. The Git-helper defect was found, fixed, and reproduced

The repository is a Git worktree. Its common Git directory is:

`/Users/zacheryspector/The Movies - Unity Production Convergence 80H/.git`

Its index is:

`/Users/zacheryspector/The Movies - Unity Production Convergence 80H/.git/worktrees/The-Movies-headless-program/index`

Focused metadata inspection found the index mtime at **12:11:03.024858Z**, inside the failed fullfunction's **12:10:59–12:11:44Z** interval. These are UTC timestamps, not Chicago local time.

The historical proof helper's `clean_git_env()` removed every environment key beginning with `GIT_`. That unintentionally removed the root's `GIT_OPTIONAL_LOCKS=0` before nested `git status --porcelain=v1`. The full scanner's separate Git helper already restored this setting, so do not attribute the same defect to every guard.

Original proof helper: `S/1370-an-m0-post-r6-preservation-diagnostic-source-20261009-r2/runner.py`, 44,067 bytes, SHA256 `b9ff56da6524243c95045b0e09f25ca4ec5c8225bbdd3eb76820e75b928e350d`.

Authenticate the actual source and its manifest rather than relying on a copied abbreviation. Corrected helper: `S/1370-aq-proof-git-optional-locks-sanitizer-source-20261010-r1/runner.py`, 44,107 bytes, SHA256 `6d83467284f7ecdf34c2d20c0aeab648819539406768beda0c3370d2651000fa`.

The correction removes inherited Git settings, then explicitly sets `env['GIT_OPTIONAL_LOCKS']='0'`. The other **35 definitions remain unchanged**, with whole-source inverse evidence. Historical source was not edited. The independent source review is `S/1370-aq-proof-git-optional-locks-sanitizer-independent-source-review-20261010-r1/RECEIPT.json` (`11e1d503…`). The initial finding is `S/1370-aq-git-optional-locks-source-finding-20261010-r1/RECEIPT.json` (`89510545…`).

Actual **13417** passed **8 controls: 7 positive and 1 specific original-defect regression**, in **0.4843068230256904 seconds**. The authenticated original and corrected sanitizer functions were extracted without importing the historical runner's main program. Two disposable repositories had unchanged tracked bytes but stale stat-cache information: the original changed its index SHA, while the corrected helper preserved complete index bytes and metadata. Other inherited Git variables were still removed; absent/conflicting optional-lock settings became zero; ordinary variables and caller inputs stayed intact.

Controls source: `S/1370-aq-git-optional-locks-regression-controls-source-20261010-r2` (R1 was preserved source-only after review required auto-GC/maintenance suppression).
Parent: `S/1370-aq-git-optional-locks-regression-controls-parent-recorded-20261010-r1`.
Actual result: `S/1370-aq-git-optional-locks-regression-controls-results-20261010-r1/RESULT.json` (`e688b732…`).
Independent result review: `S/1370-aq-git-optional-locks-regression-controls-independent-observed-review-20261010-r1/RECEIPT.json` (`6401e029…`).
Root result admission: `Q/GIT-OPTIONAL-LOCKS-CONTROLS-OBSERVED-ADOPTION.json` (`20dae623…`).

Ten Git children were reaped; the reader recorded thirteen owned process/group absences and an absent lane lock. No real project index was used as a mutating test fixture.

**What this proves:** the original helper can cause an index write, and this precise correction prevents it in the measured controls. **What it does not prove:** that this index was the sole changed leaf, or explains the entire old commonGit aggregate difference. The original per-file commonGit inventory and historical raw index were not retained.

### H. Current index semantics were separately verified

Actual **5264** compared all **20,920 stage-zero byte-path/mode/blob tuples** to published AP d203 and found exact equality, retaining the current raw index without changing its bytes/metadata during this check. An independent parser compared the retained NUL streams. This was a finite read-only check, not a new complete protected-tree scan.

Source: `S/1370-aq-current-index-semantic-proof-source-20261010-r2`.
Parent: `S/1370-aq-current-index-semantic-proof-parent-recorded-20261010-r1`.
Result: `S/1370-aq-current-index-semantic-proof-results-20261010-r1/RESULT.json` (`a11edeb2…`).
Independent review: `S/1370-aq-current-index-semantic-proof-independent-observed-review-20261010-r1/RECEIPT.json` (`fe263829…`).
Root admission: `Q/CURRENT-INDEX-SEMANTIC-OBSERVED-ADOPTION.json` (`5fa1ab74…`).

R1's source-only preparation incorrectly required a single hard link for `/usr/bin/git`; the actual pinned binary has **76 links**. R2 corrected that exact tool identity and enforced stream read caps. No R1 runtime result is claimed. The raw index and pathname streams remain LOCAL. The retained index was 4,478,980 bytes with SHA256 `cdcc57cf0379003dcce3f6c6e99f8f56f5905cec037b6e9dac8afdc48a62df8c`.

Semantic equality proves current indexed source/document content at AP. It cannot recover historical stat-cache bytes, flags, or whole-commonGit continuity. Subsequent authorized staging and commits naturally changed the current index; do not treat the retained AP index as today's index or restore it over the live one.

### I. AQ archive and publication succeeded, with failures preserved

The AQ archive has **732 roles**: **624 copied payloads / 19,263,510 bytes**, **81 authenticated prior-HEAD roles**, and **27 LOCAL hash-and-size-only roles**. It carries all 15 cumulative lessons, source/review history, failures, and the whole late AP finalization package (54 files). Five loose utility sources were selected as current-byte backups only, without claiming they were the historically executed versions.

During archive preparation, independent review found that a draft excluded three fixture packet names but missed the actual producer's `fixtures.json`. R2 refused all four before reading/hashing/parsing them. R3 made a narrow predicate change so explicitly LOCAL JSON was not interpreted as an ordinary producer packet. These were caught before archive execution; no raw fixture packet was published.

One root inventory invocation mistakenly used a literal `PLACEHOLDER` cutoff hash and refused before creating inventory/output. The actual failure is preserved in `L/payload/INITIAL-INVENTORY-INVOCATION-STOP.json`. Corrected inventory actual **76820** and archive actual **38561** completed. The final archive was independently checked, including every copied byte and every prior-HEAD mapping.

Publication then found two separate issues:

1. Initial staged verifier **10745** failed on old DIFF-CHECK output quoting meaningful whitespace. All **187 warnings across 19 payload files** were in authenticated historical evidence; the current HANDOFF and report had none. The failure, scripts and first output remain preserved. R2 authenticated an exact roster: 104 nested quotes, 38 single quotes, 9 unified blank contexts, 11 ndiff blank contexts, 1 ndiff added blank, and 24 unnamed unified headers. Unknown/new/current-document warnings still refuse. No evidence was trimmed. The whole `git diff --check` exit remained **2** by design; current document check was **0**.
2. Independent review found publisher R1 would accept any receipt with empty findings and `executionAuthorization=false`, even one limited to archive review. Before publication, R2 required the exact combined-review schema/decision and exact index, archive-manifest and changed-document identities. This bound approval to what would actually be committed.

Actual verifier **86730** then passed exact **629 staged paths**, every indexed byte, the full manifest-derived set, current documentation whitespace, unchanged src and the complete indexed tree. Independent review checked all 629 staged blobs and the unchanged AUTO block. Actual publisher **31556** committed, pushed normally, explicitly fetched the branch tracking ref, and verified remote ancestry/tree/source/cleanliness. No main merge occurred.

Find all of this in `L/payload/`: `INDEX-FIRST-ACTUAL-TOOL.json`, both verifier/publisher source revisions, `PRESERVED-WHITESPACE-AUTHORITY.json`, `PUBLICATION-R2-INDEPENDENT-SOURCE-REVIEW.json`, `INDEX-R2-ACTUAL-TOOL.json`, `INDEX-VERIFICATION-COMPLETE.json`, `INDEPENDENT-FINAL-PUBLICATION-REVIEW.json`, `PUBLISH-ACTUAL-TOOL.json`, `COMMIT-RESULT.json`, `PUSH-RESULT.json`, `FETCH-RESULT.json`, and `PUSH-READBACK.json`.

The old publisher scripts are **historical**, bound to AP and one-shot outputs that already exist. Do not rerun them for Claude's next checkpoint. Preserve useful checks, but bind a new publication to its actual predecessor and exact changed files.

## Current blockers and the Owner decision (answered 2026-10-10)

**Answered: approved.** The Owner (Claude session, 2026-10-10) chose "Approve fresh baseline": begin fresh verification now that the Git-helper bug is fixed and tested, despite being unable to reconstruct the old Git-metadata checksum; all earlier failed checks remain failed and preserved; game checks/limits remain unchanged. The paragraphs below describe the question as it was asked and the recovery design that now governs execution.

The question asked the Owner whether to begin fresh verification now that the Git-helper bug is fixed and tested, despite being unable to reconstruct the old Git-metadata checksum. It explicitly said all earlier failed checks would remain failed and preserved, and game checks/limits would remain unchanged.

The recommendation is the narrow recovery described in `Q/OPERATIONAL-RECOVERY-PROPOSAL.md`: preserve the old baseline, failures and unqualified interval; establish a separately identified new operational commonGit baseline on the actual published candidate; preserve all unaffected private/source/dependency identities; integrate the tested sanitizer; run the corrected qualification route under its original rules.

Independent design review: `S/1370-aq-operational-recovery-proposal-independent-review-20261010-r1/RECEIPT.json`, SHA256 `b8df3ed14ca9860c309128fe8eb0e06265faf0b638620a56886e7c6b8db42809`.
Root design adoption: `Q/OPERATIONAL-RECOVERY-PROPOSAL-ADOPTION.json`, SHA256 `32f9fb569b9cf9ff0968e3d77ca40e9ead9109a2d90d590db4bf61414e7697f2`.

The adoption records `ownerQuestionAsked=true`, `ownerApprovalReceived=false`, `baselineReplacementAuthorized=false`, and `executionAuthorization=false`. This is permission needed for a **new attempt with a documented gap**, never permission to claim the old attempt passed. Do not restore timestamps/index bytes, omit the index from protection, weaken the historical equality predicate, or repeat scans until one happens to match.

If the Owner declines, retain the repair and its focused results, hold dependent gameplay, and investigate only authentic old evidence. If the Owner has answered by Claude's resume, record that actual answer and proceed within it; do not ask again. Read-only review and the requested documentation/backup work do not need that exception.

## Exact next steps for Claude

### 1. Reconcile the takeover without restarting work

Use an absolute working directory for every tool call. The following Git operations are appropriate before establishing a new protected freeze; do not run a fetch or publication inside a frozen runtime interval.

```bash
cd /Users/zacheryspector/The-Movies-headless-program
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks fetch origin \
  refs/heads/wip/headless-program-20260916-ts:refs/remotes/origin/wip/headless-program-20260916-ts \
  refs/heads/main:refs/remotes/origin/main
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks status --short
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks branch --show-current
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD HEAD:src \
  refs/remotes/origin/wip/headless-program-20260916-ts refs/remotes/origin/main
```

Preserve any newer commits or user edits. Confirm this handoff's containing commit and publication readback. The src tree must still be `13880d9b…`; investigate any difference before making claims. Read the latest Owner reply; ask only the still-unanswered recovery question if needed, explaining the explicit no-unexplained-repin instruction.

### 2. If recovery is approved, prepare a fresh exact route

Use `Q/PROOF-SANITIZER-INTEGRATION-PLAN.md` as the immediate source map, not as a filled execution grant. The existing `CONFIG.proofMethods` already names the current execution library. The Python entry authenticates/imports it and records its actual role in FIRST-PROOF; the Node gate compares that role to CONFIG.

- Name corrected `runner.py` (`6d834672…`) as the new **current** proofMethods role.
- Add one derivative authority binding the original helper, corrected helper, whole-source inverse evidence, independent implementation review and actual eight-control/root adoption.
- Authenticate that authority before the Python import **and** before Node FIRST-PROOF acceptance. Avoid a circular “adoption contains its own future role” dependency.
- Keep historical proofConfig (`c40c…`), historical types (`be632…`), original plain source/dependency checks and the AM→AN→AO→AP history unchanged. Do not repin historical results to make them look current.
- Rebind every current generated assertion, evaluated basename, CONFIG field, recipe field, manifest, parent mapping and reader mapping to the actual new published HEAD and fresh output paths. Preserve historical scientific source arms.
- Re-run the existing generated-authority static audit on the final actual files. A wrapper hash or inverse alone is insufficient; actual generated literals already caused a real STOP.
- Adopt the explicit recovery amendment and complete source/RED/implementation review. Establish a fresh complete operational baseline with the old lost interval separately recorded. Unaffected private/source/dependency identities must remain exact.

The original current-prelaunch package is `S/1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1`. It contains the AP-bound contract, source proof, exact argv, operational-scope amendment, prelaunch config, parent and reader adapters. The held `…-source-20261010-r2` successor anticipated a passing recent fullpost that never materialized. **Do not fill it using the failed diagnostic map or issue its prospective protected-postflight adoption.** Both are references, not ready current launchers. Use actual `SOURCE-PINS.json`, `OPERATIVE-BINDING-AUDIT.json` and dependent source manifests; never invent a future hash.

The actual failed fullfunction source/parent/wrappers were the following r2 packages; corresponding **r3** packages contain the held generated-HEAD correction:

- `S/1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2` and `…-r3`: `run-fullfunction.py`, `run-fullfunction.mjs`, `record-fullfunction.py`, `CONFIG.json` and source pins.
- `S/1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2` and `…-r3`: `launch-fullfunction.py`, `read-fullfunction.py` and their contracts/pins.
- `S/1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r2` and `…-r3`: `run_observer_fullfunction_once.py`, `run_observer_reader_once.py` and exact caller bindings.
- `S/aq_check_generated_authority.py`: retained static checker of generated CORE/CONFIG assertions. It was archived as a current-byte utility backup, not retroactively asserted to be an old executed source role. Authenticate the version used for a new audit.

R3's proposed output names used AQ suffix `r2`; they are held historical identities. Choose fresh AR packages and output identities for the actual next attempt. A lane path is a file directly under S with an adjacent `.meta`, not a directory. Inspect actual evaluated output paths, not merely recipe declarations. Parent/reader PID, PGID and SID assumptions must match the launcher; do not invent a Node process group from a recorded PID.

### 3. Run and judge the qualification once its prerequisites actually hold

Run one explicitly granted fullfunction attempt, with original **300-second aggregate child / 320-second active recorder / 330-second whole recorder** bounds (`CONFIG.bounds`, as recorded by the actual source). Do not confuse these with the later 720/750 observed-acceptance route. Preserve canonical functions, original fixtures, complete snapshots/admissions, observer/helper caps, 64 MiB fixture bound, source/dependency guards and cleanup. Complete postflight even on an early STOP. Keep actual stdout, stderr, final exit and tool envelope.

Require the real baseline and a meaningful **exact 30-byte typed-catch mutant** qualification, plus genuine AFTER proofs. Do not manufacture missing proof from a before scan, source review or cleanup success. Full-scenario observer fit remains unmeasured after AQ. On an unexplained change, new failure, timeout or unresolved recovery trigger, preserve the actual result and stop admission; diagnose its specific cause rather than automatically retrying.

### 4. Only then resume the 416-week ledger work

The held plan is `S/1370-an-neutral416-next-slice-planning-20261010-r1/PLAN.md` and its receipt. Its intended neutral witness has **417 boundaries, 10 artifacts, 40 contexts and 43 external rows**, under the original caps. The streamed-artifact consumer, replay proof and source-RED authorities remain missing. This slice is not already implemented or accepted.

After meaningful fullfunction qualification, implement and independently review that bounded missing consumer work. Complete the required **full-state** AG→E0G neutrality and remaining internal-decision/residual E0G/EBG→ABG attribution, occurrence-aware A→M0 comparison, and four C0 protected digests. Preserve the already completed exploratory controls rather than replaying them; the missing work is their qualified causal/full-state admission. Keep H8708 and historical promise attribution separate. Do not substitute a new golden snapshot for a causal explanation.

Important correction to the old plan: **1368-U's original clean-pair instruction is spent.** `E/1370-AA-c0-ledger-state-reconciliation.md` records the original C0 timeout at 331.19 seconds (child -15 / recorder 124), with ABC correctly not launched. Later separately reviewed **exploratory 720/750** C0/ABC runs did complete 416 weeks, finding 42 paired adoption rows, six C0-only week-416 declines and no ABC-only rows. Four-arm adoption counts were 48/48/48/42. A narrow 417-boundary representation projection and later same-representation E0G/EBG diagnostics also completed: adoption first differed at week 280 (48→42), p13a at week 92 (40→18). Those observations do not by themselves establish every internal decision predicate or residual cause. The broader full-state consumer work remains missing. Read `S/1370-c0-ledger-state-readonly-audit-20261008-r2/MEMO.md` for the corrected chronology; do not follow its superseded r1 or revive AA's later-resolved process/disk conditions as current facts.

## Remaining program after the immediate blocker

The remainder plan is authoritative for detailed dependency ownership. Its earlier “Finish Save45” and older current-checkpoint subsections are historical context; reconcile them with the published checkpoints and do not replay already integrated Save45/source work.

### Implemented versus prepared versus missing

| Area | Already landed or adopted | Still missing |
| --- | --- | --- |
| P15A / Save45 | Pure shared-market/ranking work and Save45 roots/integration | P15A.1(c) activation under 1365, with 45 declared focused failures retained |
| P15B | Wave 1 pure condition/loan laws; recorded focused result 52/52 | Live waves 2–5: actual principal/installments, condition integration, closure/claims/notices and parity |
| P15C | Pure Legacy law and Save45 root/adapter/frozen-2040 integration; focused Save45 selection 121 passes | Actual closure/end-run hook, prospective closure catalogue/adapter and final same-candidate/post-2040 evidence |
| 1363 recovery | Scratch candidates and reviewed R8 kit: ten test files plus four genuine fixtures | R8 landing, causal ledger, protected-digest admission, broad checks and measured recovery closure |
| P16 | Qualified Owner rules and joint contract; P16A r3 charter/RED **design** adopted in 1370-AD | Admitted property/title/licence/transaction/estate implementation and integrated route |
| P17 | Canonical spec, settled product choices, adopted cameo contract and continuation r2 **design** in 1370-AE | Production continuation/cameo implementation on actual accepted P16/P15/P13/P14 producers |
| P18 | First-season charter and independently reviewed, parent-adopted compact contract | Actual grants, people/capacity, work/cost/payment/cancellation/settlement, save/replay and concurrent film/TV route |

Landing sources: `E/1352-L-p15b1-wave1-landing.md`, `E/1353-L-p15c1-wave1-landing.md`, `E/1361-L-save45-landing.md`, `E/1361-M3-save45-recorded-broad-gates.md`. Save45's historical broad checkpoint was **not all green**: core **133 FAIL / 5,118 PASS / 3 SKIP / 11 TODO**; UI **2,692 PASS / 5 SKIP**; d16 **12 FAIL / 164 PASS**. Preserve the exact declared-failure attribution; later source-only work does not erase it.

1. **1363 ledger/acceptance:** read `E/1368-U-adoption-clean-diagnostic-plan.md` and its review as historical authority, with 1370-AA's spent-route correction above. Preserve all 416 weeks, row identity plus occurrence, intermediate source arms and four separately explained protected C0 digests. Original 300/330 timeouts remain failures; 600/630 and later exploratory 720/750 results retain their own labels. The Owner-approved **720-second test / 750-second recorder** acceptance amendment changes wall-clock bounds only. Review it prospectively, then run fresh same-candidate types, clean, observed and the unchanged comparator when causal gates permit. A prior exploratory result cannot be relabeled acceptance. Snapshot optimization is no longer a prerequisite; performance must still be measured.
2. **1363 source landing/closure:** after ledger admission, apply the guarded 14-file R8 test/fixture kit and reviewed recovery source to the pinned predecessor. Run focused and affected broad core/UI/d16, types, generators, contracts, genuine migration/save/replay and exact regression attribution. Review and adopt the proposed 1363-V source-role matrix before its 105 matched processes; complete separate long routes, historical promise comparison and same-candidate G-P/G-L/K3. No unexplained new/changed failure or unresolved recovery trigger can be waved through.
3. **Conditional promotion:** satisfy `E/1367-O2-owner-conditional-main-promotion.md`, create a reviewable PR, perform a normal history-preserving merge, and verify advertised remote main, ancestry and source-tree identity. The current diagnostic branch has not earned that merge.
4. **1364 / 1365:** fix both late-founding invariants using genuine predecessor facts without inventing payments. Activate the held market retune and remove its temporary guard in the same change. Prove declared REDs, affected regressions, replay and observed market/recovery behavior. Preserve original natural fixtures; add qualified replacements and isolate masked downgrade guards.
5. **P15B/P15C:** finish real loan principal, installments and rival policy, shared obligations/allocation, remedies, atomic actual closure and claims; wire ranking, Legacy/catalogue and end-run consumers. `closureDue` alone is not playable closure. Preserve the frozen 2040 snapshot while simulation continues. Verify conservation, refusal purity, genuine migration, integrated recovery and post-2040 release. Follow the phase's wave ordering so loans/notices accompany the playable systems that need them.
6. **P16:** complete property identity and permanent creator history, four separate rights, lawful licences, deterministic valuation, bilateral sales and exact receipts, costed due diligence, healthy acquisitions and estate authority. Qualified `E/1362-O-owner-response-20261002.md` governs: outstanding distress loan bars bidding; rescue principal cannot fund purchases; no new acquisition financing/early-repayment product; estate sales do not buy people; healthy retention requires explicit choice and lawful affordable capacity; retain proper exit claims; preserve verified research progress without moving inventor advantages; buildings do not teleport; branch rights stay with parent property until explicit promotion. Prove an integrated rights/transaction/estate route before P17 consumes it.
7. **Canonical P17:** use revision 02 at `f2eff635`, five continuation types and real P16 grants/live owner lookup. Keep Recognition/Momentum/Fatigue separate, property-wide Fatigue and the quality-qualified **0.35 Recognition floor**. Healthy reboot is lawful; dormant Direct Sequel is not a sixth type. No invented hard cooldown or inflated hype; one continuation input must reach locked forecasts and live Reception without future data or double bonuses. Implement bounded subproperties/promotion, talent associations and rival symmetry. Shape A has three required principals and zero to two featured/cameo roles using real P13 capacity/P14 profiles. The independently reviewed capability/era/fee contract **was already parent-adopted in 1367-G as provisional implementation law**. Refresh producer/source bindings before coding; obtain an explicit amendment for changed policy rather than silently replacing or re-asking settled rules. Expanded shapes and crossovers remain deferred.
8. **Bounded P18:** the compact first-season workload/fee, milestone/advance, lateness/cancellation and single-distribution contract **was already independently reviewed and adopted in 1367-G** under `E/1342-O-owner-rulings-p14-p18.md` ruling 10. Implement its six-episode/twelve-unit first season through an actual P16 TV grant, real people/capacity, weekly costs, delivery and reconciled settlement. Its provisional fee/advance and 52-week distribution defaults are prepared rules, not measured balance or unanswered Owner questions. Later seasons require fresh commitments; no perpetual renewal. Separate rights consideration from earned production fees, keep expiry/cancellation/failure obligations honest, and preserve lineage without numeric film/TV R/M/F transfer or film-only promise/awards/Standing pollution.

At each reachable slice: pin its actual predecessor, use independent RED and implementation review, focused behavior plus affected broad regressions, deterministic replay, refusal purity, money/work/capacity conservation, genuine predecessor migration, generated consumers and exact source identity. Final P18 verification also measures cross-system 1920–2040+ behavior, performance and save growth. Generated C# does not establish native Unity acceptance.

### Exact downstream authority locations

- Owner rulings: `E/1342-O-owner-rulings-p14-p18.md` and governing verbatim `1342-O-owner-rulings-p14-p18-approved.txt`; later qualified `1362-O-owner-response-20261002.md`, `1366-O-owner-response-20261003.md`, `1367-O-owner-execution-decisions-20261004.md`.
- Joint adopted contracts: `E/1367-G-downstream-contract-adoption.md`. In `E/1367-stage/`, read `p15b-prep/P15B-WAVE4-CLOSURE-CONTRACT.md`, `p16-prep/P16-RIGHTS-ESTATE-CONTRACT.md`, `p17-prep/P17-CAMEO-CONTRACT.md`, and `p18-prep/P18-FIRST-SEASON-CONTRACT.md`, each with its directory's `INDEPENDENT-REVIEW.md`. These are adopted provisional laws, not runtime landings. The P15 closed-claims union must integrate licence/cameo/TV obligations before those producers become live; no separate payment loop may bypass estate priorities.
- P16A latest design: `E/1370-ad-copy-only-unblock-and-p16a-preparation/p16a-r3/P16A-CONTRACT-AND-RED.md`, review `p16a-r3-review/REVIEW.md` in the same preparation root, adoption `E/1370-AD-copy-only-operational-amendment-and-p16a-preparation.md`.
- P17 settled choices: `R/docs/engineering/playability-launch-review/P17-RECOVERED-SPECIFICATION-STATE.md`. Canonical historical revision: commit `f2eff6356fca3e6d5287e690bf2404867d638906`, file `docs/research/p17-independent-verification-01/P17-INDEPENDENT-VERIFICATION-REPORT.md`.
- P17 continuation design: `E/1370-ae-restart-checkpoint/p17-continuation-prep-r2-5020e56e-20261008/P17-CONTINUATION-CONSUMER-CHARTER-AND-RED.md` and adjacent `P17-CONTINUATION-INDEPENDENT-DESIGN-REVIEW.md`; adoption `E/1370-AE-restart-checkpoint-and-p17-design-adoption.md`. Preserve the superseded r1 design separately.
- P18 charter: `R/docs/engineering/playability-launch-review/plans/P18-HEADLESS-CHARTER.md`; compact contract/review as above. The cameo 1956/week-1872 unlock and P18 workload/economics were delegated provisional choices already adopted, not newly discovered missing product decisions.
- 1363-V governing measurement: `E/1363-A-rival-recovery-amendment-charter.md` §§6, 8–9, qualifications `1363-F-parent-adoption-of-the-recovery-charter.md` and `1363-A2-recovery-amendment.md`; concrete source/output map `E/1367-stage/1363-measurement-prep/IMPLEMENTATION-MAP.md`.
- R8 preserved kit locations: `E/1368-N-r8-corrected-whole-file-verification.md` identifies frozen `S/1368-save46-swept-proposal-r8/tree` (scratch HEAD `a59301c631531d9189aef5ee1827d6886db78f45`), runner kit `S/1368-r8-integration-prep-r1`, and `E/1368-stage/fourteenth-verification/evidence.tar.gz` with the ten test postimages and four genuine fixture files. Use the archive manifest and subsequent scoped receipts before landing; this historical report's open-check list is not a fresh rerun instruction. Do not traverse or extract fixture bodies merely to resume the handoff.
- 1363-V versus causal diagnostics: `E/1369-C-c0-preimage-and-next-routes.md` and `E/1369-stage/next-route-plans/CAUSAL-ARMS-PREFLIGHT.md` distinguish the **105-process / 520-week measurement matrix** from **416-week causal diagnostics** and separate long routes. The exact final reviewed matrix artifact filename was **not located during this handoff audit**. Resolve its genuine source/review manifest when that gate is reached; do not invent a path or claim it has already been adopted/run.

Apart from the immediate recovery exception, Owner escalation is conditional on measured 1363 findings: O2–O5 changes to rival income, greenlight/awareness law, market/templates/arrivals or retry/pruning policy are not preapproved remedies. Follow the charter's Proceed/Flag rules. Qualified P16 choices, reboot/floor/dormant-sequel choices, and the delegated cameo/P18 contract defaults are settled; do not repeatedly ask the Owner to approve them.

## Closed work: do not reopen or replay without a concrete affected-code reason

Historical AN types/collection/preservation, parser 32, helper lossless 49, AO diagnostic 48, AP native 72, AQ native refusal 86, AQ wrapper 32, AQ sanitizer 8, prior natural208/renewal16 and their original backups are recorded. Their actual scope stays limited; nevertheless do not spend another session repeating them just to collect fresh pass counts.

Current AQ index semantic equality and publication are also complete at their recorded candidate. They are not substitutes for future qualification, and the archived one-shot scripts are not reusable launch commands. Save45/source work already integrated into the published tree must be preserved. Read predecessor receipts before assuming an older checklist is unfinished implementation.

## Operational details that will otherwise waste a session

- **No active game worker at takeover preparation:** at 10:22 CDT on 2026-10-10, a bounded process read found zero matching project Python/Node/test/lane workers and `S/HEAVY-LANE-LOCK` absent. Raw process evidence is `H/PROCESS-CHECK-LOCAL.json`, not for export. Earlier requests to restart the Mac concerned historical stuck workers; this handoff does not require a restart. Recheck current state before any new launch rather than acting on old PIDs.
- **Disk:** handoff preparation measured 4,288,056 KiB available (about 4.09 GiB). This is a dated observation, not a promise for the next run. Preserve shared 3.5 GiB reserve/live 3 GiB runtime floors and the actual selected route's stricter requirements. No cleanup was performed during this handoff. Prior cache approvals do not authorize deleting source, saves, evidence or arbitrary user files.
- **Python:** use the exact reviewed interpreter `/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14` with `-I -B`, never `-O` (many gates use assertions). Its measured 50,472-byte SHA256 is `7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835`. Revalidate current executable identity when required by a new contract.
- **Git:** use `--no-optional-locks`, `-c gc.auto=0`, `-c maintenance.auto=0`; a sanitizer that removes all inherited `GIT_*` must then restore `GIT_OPTIONAL_LOCKS=0`. `/usr/bin/git` was SHA256 `fe38fea56d944c3b7e9df10617b1fa5432d7b75cc346d7eacb607d083ea11711`, with 76 hard links. Do not copy a regular evidence-file single-link rule onto that system binary.
- **Heavy lane:** original launcher is `S/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh`, SHA256 `aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e`. Its first operand is the PID to wait for, or `0`; `0` does not impose a watchdog. The launcher itself has no overall runtime deadline. Never remove a foreign lock or signal a reused PID without ownership checks. Parent readers require actual owned PID/group cleanup, not an assumed end time.
- **Full guard:** original command timeout is 180 seconds per command, not one overall guard cap. The observed complete scan took over seven minutes. Keep protection time separate from measured game/test/recorder time. Avoid putting detector literals in shell argv during guards; named reviewed scripts prevent a detector from matching its own launch text.
- **Snapshot semantics:** commonGit aggregate includes per-path mode/size/type, regular-file hashes and link targets, including directory sizes. It does not retain a complete historical per-file identity map and does not hash every file's inode/mtime/ctime. Strict root identities are a separate check. Do not explain the aggregate solely by a parent-directory timestamp theory.
- **Observer/helper limits:** preserve original native 512-row / 16,384-byte-per-row including newline / 2,097,152-byte-total including framing caps and count→row→total precedence; canonical native comparison remains `JSON.stringify(JSON.parse(original))` exact. The separate helper retains 16,384 logical entries, a 64 KiB expanded-row bound and 2 MiB encoded trace per snapshot with bounded streaming reconstruction. Do not substitute one layer's authority for another. No trimming, normalization, digest-only substitution or selective omission of admissions/snapshots.
- **Original fixtures/protected data:** keep canonical 196/197/208 fixture roles and historical accepted proofs distinct. Do not rematerialize protected mirrors or repair timestamps to manufacture equality. Do not traverse Owner/private saves, fixture packets, dependency trees or broad protected inventories outside the explicitly scoped route.
- **Recording tools:** persist actual launch, polls and terminal result. A yielded script cell and an exec process session have different wait APIs. A missing tool response is not exit zero. When a completed agent needs more work, use a follow-up task; merely sending a message does not restart it. New Claude cannot assume Codex's agent/tool session IDs are live.
- **Publication:** check the exact manifest-derived path set, indexed bytes, source identity, advertised refs, local tracking refs and ancestry. A plain fetch previously failed to update this branch's tracking ref; use an explicit source:destination refspec. Preserve meaningful historical diff/ndiff/log whitespace while requiring clean new prose. A review must bind the exact artifacts and scope being published.

### Protected historical anchors

These anchors locate the historical roles that must not be silently reassigned. Use actual source manifests and recorded authorities, not this table alone, for runtime grants.

| Historical role | Identity |
| --- | --- |
| M0 mirror | `S/1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2` |
| M0 source content | `fbbfed3ec13da5618a0194204e2f6c8a87eebb5ee22102707d466340fbe6e1e0` |
| M0 physical | `12c3dd50b99860c1c4e56ee98488d5f04613b37c93496d0257cc560a4fb83038` |
| M0 non-root identity | `0c9cfd7e1647b08f6ffb7835500044efeecfb2c13e58d4d8e8998e4837e75417` |
| M0 dependencies | `a06e929a60a5ede6ce0d72467d4d587e50d1c4fa3788bee3d07f1ea3388cd21d` |
| Historical AN types root adoption | `be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83` |
| Private R9 full baseline | `555867b2be0abf76728fc8b905c52a73512b5da31d24162d804e7e1b9d8c9347` |

The M0 source census was 1,740 files / 119,393,120 bytes / 1,853 entries. Dependency census was 348,223,802 bytes / 12,484 entries; some full-guard listings include the root entry and therefore count 12,485. Keep count semantics from each producer rather than relabeling them. Historical types actual 56426 and its preservation/readbacks remain separate from the corrected current operational helper.

## Major lessons to carry forward

The full accounts are in `A/payload/1370-aq-root-continuation-20261010-r1/LESSONS-r9.md` and `L/payload/LESSONS-LATE.md`. All earlier lesson revisions remain preserved.

1. Independent test authors can overturn an accepted source review; preserve and explicitly correct the mistaken review.
2. Assertions inside a callback that catches errors can be swallowed; verify captured observations outside containment.
3. Audit the actual evaluated paths, field accesses, schemas and producers, not just familiar names.
4. Keep authority references acyclic; do not invent a future artifact hash.
5. A focused control pass has a measured, limited scope; 86 controls are not a full scenario pass.
6. Protection has measurable cost and cannot substitute for missing game AFTER proof.
7. Remote advertisement, tracking refs and complete archived/indexed bytes are separate publication checks.
8. A message does not restart a completed agent; use a follow-up and check actual status.
9. Validate generated current-HEAD literals as well as wrappers and inverse mappings.
10. Retain comparison evidence on failure; otherwise an equality assertion can discard the only diagnostic map.
11. Attribute a diagnostic to authenticated code identity, not spoofable filename/line coordinates.
12. Derive archive exclusions from actual producer semantics, including the real fixture packet filename.
13. Environment sanitization can remove a safety setting; inspect nested subprocess environments.
14. An incomplete bounded summary and a complete retained-map comparison are distinct evidence products.
15. Reproduce a write defect in disposable fixtures; a good fix and current semantic equality do not reconstruct lost historical bytes.
16. Bind publication approval to the exact staged index, documents and archive it reviews.
17. Preserve meaningful evidence whitespace and old verification failures; use exact authenticated exceptions, never broad waivers or normalization.

## Handoff completion and claim limits

This document, the late AQ carry, and its Git publication are documentation/backup work. No new game test, new operational baseline, source adoption, ledger closure or main merge was performed while preparing it. The requested extremely detailed handoff replaces the earlier compact HANDOFF; the AUTO block below is preserved byte-for-byte and is explicitly stale historical hook output.

On resume, first reconcile actual Git and the Owner's response. Once a specifically authorized next slice is truly ready, keep building within the approved dependency order and record major lessons as they are learned. Update this handoff at each checkpoint and preserve all original failures. Do not report P16, P17 or P18 complete until their actual implementation and required gates are complete.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-04 15:31 CDT by **claude** on SessionEnd (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `266c172c0e54f0277fd05392ccd2bc19b4ce65fb`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 0
- Last commits:
  - 266c172c docs(p15): confirm final Save45 sweep and independent approval; preserve landing handoff
  - d645e700 docs(handoff): preserve x3 attribution and completed scratch cleanup
  - 7692b1e1 docs(p15): preserve guard observations and final sweep candidate; x3 running
  - 8719cde1 docs(p15): record x2 sweep results and stage reviewed S9 follow-ups
  - 7cc28747 docs(handoff): Codex resumes Save45 sweep; preserve review and guard probes
<!-- AUTO:END -->
