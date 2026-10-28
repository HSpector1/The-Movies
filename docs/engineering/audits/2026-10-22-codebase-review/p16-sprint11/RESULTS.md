# Sprint 11 — P17 featured appearances and player-facing integration

## Bridge slice A (review S1) landed as CANDIDATE; cameo core slice in preparation — 2026-10-27, 21:10 CDT

Branch p17-continuation-20261027 from the Sprint 10 tag (2c50c9df). Two disjoint workhorses: Bridge (bridge/**, tests/bridge-*) and cameo core (src/core, tests/p17-*).

Bridge slice A (bridge-slice-a/): PROJECTION_VERSION 64 → 65; the P16 build's current id sha256:57f12ee2… registered as prior projection-v64 so a P16-build checkpoint (Save49 slots) imports through the prior path and lifts each slot to Save50 with fresh digests (precedent: the 48→49 bump registered outgoing58, bridge/runtime-checkpoint.ts:72); a current-65 checkpoint carrying a Save49 slot stays refused by name. Read-only Industry view 'franchises' (bridge/franchises.ts) exposes lineages, Recognition/Momentum/Fatigue, reboot legality and lawful continuation choices through the core readers. No write verb: the greenlight intent has no continuation member on the wire (later slice).

Genuine capture (lane/capture-r1 refused: ui/ absent in the snapshot; capture-r2 exit 0): a sparse snapshot worktree of a5a66c27 (local branch p16-capture64-snapshot ef9f20a6 = a5a66c27 + the copied capture64.ts; ui/ materialized) produced outgoing64.checkpoint.json.gz (164,348 bytes) through BridgeSession.dispatchWithRuntimeCheckpoint('save') at Save49/projection 64; receipt OUTGOING64-RECEIPT.json (compressed 495174bd…, decoded 927b4d01…, slot 1965758c…); frozen at tests/fixtures/p16/genuine-projection64-runtime/ and pinned.

Commits: b5c7351f (slice + fixture + capture pins), f8aa097a (regenerated generated/unity C# and manifest, projectionVersion 65, schemaId sha256:d57642ad… matching the statically computed literal; F10 pinned), then F11 pinned (same whole-schema body as F10, as at projection 64). Lane gen-r3: generate, generate:fixtures, both checks, Bridge types, root types all exit 0; bridge-schema 22/22; generator test red only on the placeholder pins (filled from the run, gen-r4). Touched-file GREEN run (bridge-green-r5) and the RED premise at the parent (bridge-red-r6) in flight; independent review in flight.
