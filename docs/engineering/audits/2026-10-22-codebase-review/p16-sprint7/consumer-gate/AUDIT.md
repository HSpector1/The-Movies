# Interrupted consumer gate audit

Independent read-only verification found all 1,640 source/input hashes and all preflight pins unchanged. HEAD remains selected `0e0cdfde48d5dca06437c711e03a4f9f1a37360f`. The exact recorded owned root PID 20839 and descendants 22527, 22529, 22624, 22838, 23139 are absent; no residual selected runner was found and the heavy-lane lock is absent. Lane metadata records exit 143 following the controlled interruption.

Actual outcomes: root typecheck exited 0; Bridge typecheck exited 0; UI typecheck exited 2 with TS2307 for the missing tracked sparse input `ui/public/lot/hollywood/role-atlas-v1.json`, imported by roleAtlas.test.ts. Bridge/core consumers started but were interrupted without a complete JSON report or terminal child result. Their partial console output must remain partial evidence, not a complete gate pass/fail total. Selected UI runtime tests were unreached and remain unrun.

Foreign Godot PID 23025 was observed, then exited before workload or CPU inspection. Its intensity and causal performance impact are unknown; exclusive execution cannot be established. No clean/exclusive or completed consumer-gate claim is justified.

The stopped checkpoint freeze is released to the sole coordinator. This does not authorize or qualify a restart; the pending exclusive-window response and input-readiness work remain separate. No runtime or repository modification was performed by this reviewer.
