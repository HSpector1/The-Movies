# Correction to filled adoption builder launch r1

Decision: REFINE_BINDING_ONLY. The exact LAUNCH.command is a correct Bash-prefixed command, but the supplemental BINDING.json says the lane log is under `heavy-queue/`; the frozen command actually writes it at the scratch root. The independent r1 exact review overlooked this mismatch. No real builder was launched. Preserve r1, issue a versioned r2 filled binding with the correct log path and obtain new exact-command review before execution.
