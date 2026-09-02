# P06A — fresh hostile review disposition (charter Appendix A, 25 criteria)

**Method:** a fresh adversarial multi-agent review (six reviewers, one per criteria cluster, each
instructed to REJECT if it could and to verify every pass against the actual code and evidence with
file:line citations; plus a lead synthesizer). Run against the sealed impl worktrees, the six-scene
oracle evidence, and the machine real-profile journey.

**Result: ACCEPT.** 25/25 criterion verdicts `pass`; 0 genuine blocking rejections.

## Blocking-class checks — all clear (with cited evidence)

- **Release law (1–5, 18):** Release Ready never auto-releases (both advance arms gate the 1→0 edge
  on the committed-id set); commit advances no time (`applyCommitPictureToRelease` touches only the
  authority + event, asserted byte-identical market/rng/cash/ledger/operations); an uncommitted movie
  cannot enter the batch (tick derives committed ids pre-advance + a witness-equality throw fails the
  week closed on divergence; batch is ID-sorted); no double/stale release (duplicate refusal + atomic
  prune + I3/I4 orphan invariants); polling never latches (pure projection; advance only on explicit
  intent; `automaticWeekRollEligible=false` while an uncommitted stop is live).
- **Identity / isolation (10, 12, 14):** exact never-reused productionId binding; exact-id join
  refuses wrong-id / duplicate / kind-only siblings; no cross-row/building leakage (multi-picture
  sidecar: three exact ids, stable on re-read).
- **Economy retune (8, 21):** TUNING byte-identical to pre-wave; no economy-core file changed;
  marketing debited exactly once at greenlight, never re-charged.
- **P07 leak (19):** no reception/box-office fields in the P06 decision snapshot; results projection
  untouched.
- **P05 regression (20):** 189/189 across the P05-domain suites; the hold gate is additive at the
  tick-1 edge.
- **Capability no-op (15–17):** the commit control is not ceded, renders, and dispatches through
  `SubmitPlayerWorkflowIntent`; the rail LOCATE is withheld in lockstep with authority; disabled
  reasons match their cause.
- **Screenshot binding (22):** exact-binary hash chain (PNG sha, exe sha == manifest, on-disk exe
  re-verified, stateDigest == fixture) with genuine per-run provenance.

## Non-blocking observations (all disclosed / dispositioned)

| Ref | Observation | Disposition |
|---|---|---|
| crit 13 → F2 | first-film-journey card says "working on set" for a wrapped picture | pre-existing, out-of-scope C1 onboarding copy; the Post building's own attendance law holds. Owner ruling. |
| crit 14 | oracle `visualReviewStatus: pending` | human visual sign-off unrecorded → folds into OWNER ACCEPTANCE PENDING. |
| crit 17 | `ReasonStaleRow` is a dead constant in `StudioReleaseContracts.cs` | cosmetic; staleness handled by a fresh decision row each frame, so no wrong reason ever shows. Tracked for cleanup; not re-sealing the oracle binary for a dead constant. |
| crit 23/24 | `p06-real-profile-journey.mts` needs repo-root invocation | invocation-portability wrinkle; the proof is real (25/25 via `vite-node` from repo root). Header now documents the exact command. |
| F4 | HID synthetic-input journey not executed | SAFE-terminal-state environmental blocker (session presents no OS-trackable window); four-level compensating proof. Owner/operator runs on an interactive/unlocked GUI session. |

## Overall

**ACCEPT — subject to the disclosed non-blocking findings. Status: KEEP CANDIDATE — OWNER
ACCEPTANCE PENDING.** Machine and code-level verification is complete and green; human visual
sign-off and any Owner ruling on the F2 scope question remain the Owner's to close.
