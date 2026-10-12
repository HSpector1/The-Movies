# HANDOFF AUTO freeze incident review

GPT-6.1 Sol, Codex-native reviewer `founding_review_sol`, 2026-10-12. Read-only inspection of production HANDOFF diff, handoff skill/hook, existing landing/restoration scripts and the original freeze snapshot. Parent supplies independently preserved incident snapshots. No tests/compiler/build/heavy scan, lock action, process signal, hook/settings change, production/package edit or freeze modification. Only this assigned scratch review written.

## Verified observation and authority

- Original run identity: founding r7q2 full gate, production HEAD `77e1247c76befe478b37c2e3eab7c365c7fe06eb`; parent-owned lane53125, land-slice53139, core53944, exec78281. These live-process identities are supplied by parent, not fresh reviewer process ownership measurements.
- Original `landing-r7q2-astra/freeze.json` records that HEAD, no unstaged diff (SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`), no untracked paths and no HANDOFF dirty path. HANDOFF contents are not part of scoped `files`, but whole worktree diff/status ARE frozen.
- Reviewer `git diff -- HANDOFF.md` shows only the AUTO block changed: PreCompact stamp10:32, current HEAD, staged-candidate dirty inventory and recent commits. Reviewer `git diff --name-only` reports only HANDOFF.md. No model-owned text outside AUTO was changed in the observed diff.
- Parent preserved `A/handoff-freeze-incident-1032/`: original/current HANDOFF, patch/status, start/last-good/current snapshots. Parent's observation at15:38:53Z finds only freeze keys `diff,status` changed; `HEAD,index,cached,untrackedPaths,files,inputs` match exactly; outside-AUTO bytes identical. This comparison is supplied evidence, not a reviewer-executed full snapshot scan. Original current-gate freeze files remain untouched.
- User handoff instruction assigns mechanical AUTO ownership to the hook. Skill `/Users/zacheryspector/.codex/skills/handoff/SKILL.md`, write step3, says leave AUTO alone; checkpoint/write step4 explicitly respects recorded-run prohibitions. Hook `/Users/zacheryspector/.claude/hooks/handoff_guard.py:84-109` stamps AUTO whenever HANDOFF exists. At `:104-109` it replaces just the block and writes the file; it has no active-gate/freeze exclusion. Its metadata stamp explains this incident, but does not authorize a freeze exception.
- Takeover order explicitly requires HEAD/index/source/required inputs frozen through postflight and no HANDOFF edits during those freezes. The same order expressly allows reuse of valid evidence where source, relevant inputs, environment and conditions match, without rerunning solely because a report changed. Both requirements apply: preserve the freeze failure AND qualify reuse with evidence; do not pretend either instruction erases the other.

## Immediate lawful handling

1. Let the owned current core child finish naturally. Do not kill/relaunch, change staged candidate, restore HANDOFF, edit gate inputs or touch lock/hooks while it runs.
2. Preserve the original wrapper's actual result. In `land-slice.sh:84-86`, the child exit is logged before postflight freeze check. HANDOFF diff/status drift makes that check return98; the wrapper will stop there before core attribution/fullUI. This is **INCOMPLETE: postflight metadata drift**, not a core assertion failure, not a completed whole gate, and not a passed postflight. A core exit0/nonzero and wrapper exit98 are distinct evidence.
3. Preserve raw core JSON/log, child/recorder/lane outcomes and all prehook completed stages. Check actual artifact completeness and test/suite/worker outcomes after child completion. Do not infer a core pass merely from the expected wrapper path or a successful JSON file write.
4. Keep the current AUTO stamp and incident bytes. Do not silently revert or regenerate it, edit original freeze snapshots, skip checks in a live wrapper, replay patch application or commit HEAD during recovery.

## Minimal continuation and repeat requirements

**Recommend a separately reviewed bounded continuation, not another whole apply/build/core run solely for this metadata event.** This recommendation follows the Owner's explicit evidence-reuse amendment; it does not retroactively change the existing wrapper's failed freeze contract.

- Determine completed stages from the original run's results/outputs. Stages that completed with valid child results and matching applicable pre/post conditions before the hook can be reused directly.
- Core completed across the incident can be reused as **incident-qualified measured assertions**, provided the parent's exact identity/input comparison remains valid through core completion, artifacts are complete, and failure analysis identifies no relevant metadata dependency. A bounded reviewer search found no direct `HANDOFF.md`/`handoff_guard` references in core/UI test files or their test/config globs; this is supporting evidence, not a universal assertion that no runtime can inspect Git status. Preserve any relevant Git-status/runner failure separately instead of dismissing it as metadata.
- Run core attribution from its saved result and baseline without rerunning tests, preserving full messages, duplicate identities, suite diagnostics, timeouts and skipped/todo counts. SAME remains identity overlap only; changed messages require comparison.
- FullUI was not executed by the original wrapper. It must run, with its complete postflight and actual child result, in a fresh one-shot output location under the same original owned lane mechanism after the prior job tree is finished. A new narrowly reviewed continuation should validate the already-staged exact candidate and package/baseline/fixture identities, capture a fresh freeze including the preserved current metadata, and execute only missing work. No patch reapplication, clean-tree fiction or mid-run baseline rewrite.
- The continuation can aggregate original type/generator/d16/core artifacts plus newUI under an explicit evidence manifest identifying original run, incident, reused inputs/stages and new epoch. Its outcome must say "qualified combined evidence after recorded metadata incident", never "original full gate passed unchanged". Declared/inherited test failures still require ordinary qualification; the metadata disposition does not approve them.
- Repeat only a stage whose artifacts/child completion/input identity/relevant conditions cannot be proved or which fails a required semantic check. If a required acceptance condition cannot be met by the combined recorded evidence, repeat the affected prescribed gate after lawful restoration; do not waive it. No full-suite repeat merely to obtain a cleaner report title.

Prospective guard handling must be explicit: a fresh snapshot may treat the current preserved HANDOFF bytes as the new expected metadata; another drift remains a stop. No broad ongoing HANDOFF exemption is proposed. Any future protocol amendment separating model-owned bytes from mechanical metadata needs its own reviewed scope and incident recording, not a silent retrospective allowlist. This reviewer does not authorize global hook/settings changes.

## Safe owned-path restoration, preserving AUTO

Existing `restore-production.sh:74-88` intentionally refuses the original drift: its whole snapshot comparison runs before candidate unstage/restore/removal. Calling it as-is cannot restore this candidate, and weakening that check broadly would violate its foreign-change boundary.

If the candidate must be removed after checks stop, use a **separately reviewed incident-aware restoration** with these exact preconditions, under the owned lane after all project children have finished:

1. Preserve current AUTO/incident bytes, original freeze and gate-owned path lists. Require HEAD, index, cached candidate, scoped file contents, package/baseline/fixture inputs and untracked inventory to match the original candidate expectation. Permit only this incident's documented HANDOFF unstaged change, verified against the pinned after-file/hash and outside-AUTO equality. A new metadata/manual change is a new mismatch, not silently absorbed.
2. Require staged added/modified lists to be exactly the recorded candidate paths. Restore/unstage ONLY those paths and remove ONLY recorded candidate-added files with unchanged expected candidate bytes. No blanket restore/reset/clean/stash, no deletion of foreign files, no operation on HANDOFF. Preserve any unexpected changed path and stop before mutation.
3. Verify afterward: HEAD unchanged; index back to HEAD; all candidate modifications/additions removed; production status differs from clean solely by the exact preserved HANDOFF incident; its bytes identical to the pre-restoration pinned after-file. "Clean" is not the truthful description until that metadata is separately handled at a safe checkpoint.
4. Record the incident-aware restoration's result and limitations. At a later safe checkpoint, normal handoff work can acknowledge the incident/current state under the usual user protocol. Do not rewrite AUTO solely to make an old freeze comparison pass.

The same approach applies if retaining the candidate for qualification: keep its exact staged identity, preserve the mechanical AUTO change separately, and require the new continuation to enforce its own documented expected state. Neither restoration nor retention may erase the recorded original98 failure.

## Verdict

KEEP existing strict stop behavior and preserved incident; permit an explicitly reviewed minimal continuation/restoration procedure under current Owner authorization. No assumed freeze exemption, false whole-gate pass, silent AUTO restoration or repeat solely for a metadata/report change. Test failures and integrated acceptance remain independently qualified by their actual results.

## One-use continuation independent review

Reviewed `A/continue-founding-r7q2-ui.sh` after its initial revision was preserved as `.r1`. **KEEP the refined script for parent-controlled execution after actual original terminal98 and owned-child completion.** No script execution, syntax check, tests or production modification performed by this reviewer; author reports `bash -n` separately.

Initial REFINE findings were both corrected:

- The initial numeric-PID tree SIGTERM/disk watchdog lacked explicit root start/parent identity and could not establish descendant reaping. It was removed entirely. Final `:209-214` uses the exact original foreground UI command and records its child exit; parent owns manual disk/process monitoring. No new signal/lock controller remains.
- Final `validate_result` at `:116-154`, repeated for UI, checks recognized terminal file/assertion statuses, nonempty identities/diagnostics, actual passed/failed/skipped/todo counts against headers, internal suite-summary accounting, failed assertion/file consistency, child0/1 versus success/genuine failure, and unfinished worker/report diagnostics. It refuses pending unfinished assertions or malformed/inconsistent evidence rather than calling it inherited. It correctly does NOT equate the header's nested suite count to result-file count: independently read original d16 contains176 assertions (164passed/12failed), header50suites but10 result files, successfalse. Failed assertions/counts match in that artifact; this read is not a d16 rerun.

Other source checks retained:

- `:91-127` pins exact incident bytes/metadata and source/index/input snapshot, checks the original lane's exact terminal98, seven ordered completed child records and no original UI/attribution advancement. The incident exemption is one pinned precondition, not an ongoing AUTO ignore rule.
- `:164-165` takes a new strict expected freeze matching the preserved metadata observation; `:206-217,280` checks it around UI and at final completion. Any later drift still returns98.
- `:167-181` hashes original run/incident evidence and checks immutability; original files are never overwritten. Only the fresh output receives a copy of raw core JSON and attribution.
- Core attribution `:185-203` retains complete messages, duplicate identities and suite diagnostics; SAME is identity overlap only, never message equivalence. UI failures remain unclassified without a controlled baseline.
- Original d16 child1 is explicitly required/preserved, UI exit recorded separately, malformed evidence refuses, and final `:281-282` states original98/d161 and always returns1. Neither a UI child0 nor the final wrapper output grants whole-gate passage.

The parent still verifies actual terminal/process ownership and postrun child/JSON/recorder outcomes. A STOP/malformed continuation is incomplete evidence despite final nonzero being expected on a successful continuation. No restoration amendment was reviewed or executed here; original restoration remains guarded and deferred until needed.
