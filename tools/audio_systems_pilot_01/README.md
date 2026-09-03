# Project: Studio Audio Systems Pilot 01 tooling

This additive tooling builds and validates the isolated Audio Systems Pilot. It does not
modify production source, P05 worktrees, authoritative raw audio, or game truth.

All generated and derived audio remains `PROTOTYPE_ONLY` or
`PROTOTYPE_READY_FOR_OWNER_AUDITION`. Machine checks are evidence of identity,
format, scheduling, and deterministic behavior; they are not listening acceptance or
commercial clearance.

The default external output root is:

`/Users/bruce/Project Studio Audio Systems Pilot 01`

Override it with `PROJECT_STUDIO_AUDIO_PILOT_ROOT`. Source roots may be overridden
only with the explicit command-line arguments exposed by each tool.

