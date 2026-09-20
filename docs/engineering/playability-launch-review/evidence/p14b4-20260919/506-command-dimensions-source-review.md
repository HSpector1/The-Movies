# 506 — Command-only dimensions: independent source review (recovered) and runtime transfer

2026-09-20. Parent: Claude Code (Fable coordinator role) after the Codex coordinator
exhausted its usage at 12:58:41Z. Owner packet `CLAUDE-RESUME-P14B4` (SHA256SUMS verified)
authorizes the runtime change only; gameplay rulings, verification law, ownership, budgets,
work caps and Unity deferral are unchanged. This is NOT a restart of P14B.1.

## Recovered Codex 506 verdict (verbatim)

Source: local Codex rollout log of subagent `/root/t4_contract_auditor`
(thread `01a0b947-b716-7571-bc89-7f499bb06899`), final assistant message
2026-09-20T12:58:35.417Z, delivered to the parent as FINAL_ANSWER at 12:58:39.743Z.
The parent turn ended on the usage limit at 12:58:41.870Z and never persisted it; the
uploaded transcript shows only "Completed". The verdict below was read from the log,
not inferred from that notification. Recovered text SHA256
`32b9443428076f0e2b448fdf82026924740a712c71da9c62d2043f721e75c73e`.

> ## 506 — Qualified KEEP
>
> Read the complete frozen diff and505 handback against503 and immutable `80aec8b`. No concrete correction required.
>
> - **Prepayments MET.** The fresh ten-field literal costs82. Call/setup blocks precede execution. Production/workflow/reservation/task visits, current string spans, maxima and keyed writes are separately covered. The10-unit width update covers eight finite scalar operations plus `write(d)=2`; paired workflow/task maxima fit32/28 respectively.
> - **Inventory reconciles.** New wrapper work is `186 + 44P + 96W + 34R + 46T`, excluding separately charged strings/fact helpers and the explicitly retained old caller2. Empty-list/termination allowances remain.
> - **Fact semantics MET.** Operations remain copy-only; workflows/bindings/tasks request both modes; reservations remain string-only. Every current member contributes afresh. The unchanged exact-reference table retains complete intrinsic facts and atomic upgrades, not combined projections or historical maxima.
> - **Omission boundary MET.** Actual commands do not copy P/Set/setup/technology records. Required ID/director, workflow/task, binding/reservation and static geometry facts remain. Release's concept/title/commitment/mint/sort paths are unchanged.
> - **Scope MET.** Only replay changed. Shared billing-helper executable bodies, full-frame/admission dimensions, owners, Work primitives, caps and command/refusal/provenance/drain order are unchanged. Missing-production refusal still precedes discovery. No casts, new closures or fabricated Dimensions were introduced.
>
> Verified SHA256:
>
> - Source: `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`
> - 505 handback: `3d2e75f833c69430ce8bba0ed531900b3feba57aadf7e8be858d3058c83e6dc3`
>
> **Limits:** Bounded actual-source acceptance, not whole-billing certification. Deferred cold observations must still be charged by subsequent full discovery; changed table history prevents inferring net savings. Candidate typechecks/runtime, stale-route completion and preservation of first-take/kernel GREEN remain parent verification obligations. No runtime or edits performed.

## Takeover verification by the incoming parent (read-only, before any edit)

- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch
  `wip/headless-program-20260916-ts`, HEAD `80aec8b348f7322da552ef3cd35ae9ba671ba488` = exact
  `git ls-remote` tip at takeover. Linked worktree of the main checkout; no stash entries.
- Dirty tracked (8): five shared-header records, `UNITY-INTEGRATION-BACKLOG.md`,
  `src/core/promiseCapacityOwnerReplay.ts` (+62/−4),
  `tests/p14b4-started-replay-background-command.test.ts` (+57/−0). Untracked (7): 502–505
  records and the 504 baseline txt/json/patch. No 506–512 file existed anywhere in the repo.
- Source SHA256 `5d4851…2941a` = recorded frozen 505; test `dcefec…76ee` = frozen 504;
  505 handback `3d2e75…6dc3`; 503 record `d728ce…9680`; 504 brief `ae6064…51d0`; 504
  baseline patch `865daf…89e1`; HEAD source `5267ff…f1bcb` = 492. All match.
- Protected-patch method recovered: the `record-check.mjs` capture,
  `git diff HEAD --binary -- src bridge tests generated ui scripts package.json
  package-lock.json tsconfig.json tsconfig.bridge.json vitest.config.ts vitest.workspace.ts`
  with no untracked source. The local tree reproduces
  `b6bcfff304a93651577fa662b12e42e6a6e5ecb2007f65a4fa125371a540aa07` exactly. A src-only diff
  hashes `4def41…2ad3` and is NOT the recorded identity.
- Worker liveness: the Codex CLI (VS Code terminal, pids 66792/66793/67529) is alive but idle
  at its usage limit; no open write handles in the worktree; no vitest or other test process.
  The sim-core thread's last writes (source 12:55:30Z; 505 handback 12:57:33Z and 12:57:57Z)
  are all reflected by the matching hashes; its own turn died at 12:59:34Z with no message.
  The test-author thread completed 504 at 12:51:54Z. Nothing was still writing.
- 507–512 plan recovered from the coordinator log (stored 12:53:29Z): 507 ready = 495 args,
  508 started = 496 args, 509 typecheck = 494 args, 510 adjacent = 497 args, 511 bridge types
  = 498 args, 512 independent = 499 args. None had been run before exhaustion; no results exist.
- Non-destructive snapshot (byte copies of every dirty/untracked file, both patches, the
  recovered verdict, SHA256SUMS) at
  `~/The-Movies-recovery-snapshots/20260920T141038Z-p14b4-505-506-claude-takeover`.
  The private transcript stays outside Git.

## Independent Claude contract-auditor re-review

PENDING at the time of the IN-PROGRESS recovery commit; appended below when returned.
The Claude reviewer receives the frozen candidate, patch, 503/505 records and contracts, not
the recovered Codex verdict, so that its verdict is independent.

## Status

The Codex 506 verdict is Qualified KEEP, read from the log. 507–512 remain to be run
serially on fixed source, one heavy process at a time. This record, the IN-PROGRESS
recovery commit and the header update are preservation, not a pass. The original stale-
after-release workLimit failure is NOT claimed fixed by 505.
