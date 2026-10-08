# H r4 sandbox r3 swapped-parent correction — design only, unrun for H

Input: independent r3 `REFINE_STATIC_UNRUN` receipt SHA-256 `66b6d7999737a38da2125637fccc875d8946d4373555172bb67949cb67d3f6f3`. This plan does not adopt or alter r3 source. No real H, dependencies, Vitest, heavy lane, or Git operation was run.

## Decision

Recommend **A: run the final-profile generator itself inside a narrow bootstrap macOS sandbox**, using `sandbox-exec -p <policy-string>` so there is no unsandboxed bootstrap-profile file write. The local `/usr/bin/sandbox-exec -h` interface advertises `-p profile-string`; the disposable fixture in this directory exercised that exact form. The policy should default-deny writes, explicitly deny production, protected H, evidence checkout if one exists, and the canonical parents of every accepted immutable receipt. It should allow writes only to the one-shot final-profile parent, with read/process/mach permissions needed for the generator. The generator must open its output directory with nofollow held FDs, write `O_EXCL|O_NOFOLLOW`, fsync, and recheck/read back as r3 already proposes. The kernel policy is the independent boundary if the held directory is moved after pathname validation.

The fixture starts a sandboxed child with a held read-only FD for a disposable allowed directory. Without relocation, `openat(O_CREAT|O_EXCL)` succeeds. When an unsandboxed test parent moves that directory under a disposable protected root before the same `openat`, the child's write fails with `EPERM`, and no protected file appears. This is evidence for the tested host/policy/path shape only. It is not approval to run the real generator.

## A: bounded implementation and admission

1. Bind exact canonical nofollow paths for production, protected H, optional evidence checkout, every accepted immutable receipt parent, final-profile parent, and experiment roots. Refuse missing real receipt bindings, symlinks, ancestor overlap, path controls, and any output parent whose held inode ancestry intersects a protected input. Keep the r3 static checks.
2. Build a complete bootstrap policy **in memory** and include its SHA-256 and exact `sandbox-exec -p` argv in a frozen run binding. Check argument size against a conservative explicit cap before process launch; no `-f` fallback or truncated protected set. The profile allow is the one exact output parent, not the experiment parent, temp root, or protected trees. Verify deny/allow precedence on this host with scratch fixtures after final policy syntax is frozen.
3. Start the generator inside that bootstrap sandbox with a bounded stdout/stderr stream supervisor, short deadline, and process-group TERM/KILL/reap/clear proof. Use `python -B` and `PYTHONDONTWRITEBYTECODE=1`. Pass no already writable output FD from outside the sandbox. A nonzero exit, timeout, unclear group, output cap, or receipt/profile drift is STOP. No unsandboxed retry.
4. Before a real launch, use the **same bootstrap policy template and generator argv structure** on disposable protected stand-ins. Require positive ordinary output and negative held-FD moved-parent tests. Pin result bytes and the actual local `sandbox-exec` executable identity. Then independently review the filled exact protected set and generated final profile before either H arm.
5. After generation, read the final profile through a held FD, verify exact bytes/SHA and all protected path denies, require the original canary's per-arm same-final-profile descendant deny/allow probes, and preserve all subsequent H materializer/recorder guards. The historical r13 STOP is not reclassified.

## B: non-adversarial pathname-race assumption

One could declare that no concurrent same-user process can rename the final-profile parent or protected inputs during generation, rely on r3's pre/post pathname rechecks, and treat a post-write mismatch as STOP. This is narrower operational authority: it does **not** prevent a protected write before STOP, as the r3 independent RED proves. A lane lock coordinates the participating workers but does not establish exclusivity against every local process with rename permission. B would need explicit Owner acceptance of this narrower threat model and evidence of exclusive control over relevant directory parents; neither is currently present. It is less safe than A and is **not recommended**.

## Remaining proof obligations

The disposable `-p` test cannot establish behavior for actual protected roots, ACLs, mount points, inherited descriptors, or the full bound policy. Independently inspect macOS sandbox deny/allow ordering and rerun a moved-parent fixture with the **exact proposed generator policy and process shape** before any real profile output. A successful synthetic does not authorize a real H arm. If `sandbox-exec` is unavailable or the exact policy cannot be verified, STOP rather than choosing B implicitly.
