# P05A Implementation — Entry Record

**Wave:** ENTRY — verify and isolate
**Date:** 2026-08-30
**Authorization:** Explicit Owner ruling "P05A IMPLEMENTATION IS NOW AUTHORIZED" (Owner launch order, 2026-08-30), against charter `docs/engineering/CODEX-P05A-IMPLEMENTATION-CHARTER.md@b1d506df9ff9c5981f5acc6990daf8a056739901`.

## Exact starting pair — verified

| Fact | Value | Verification |
| --- | --- | --- |
| TypeScript campaign `campaign/living-lot-ts` | `7811377cea1c1b9ddca2c17c626879504b23ed4e` | local ref == `hspector-github/campaign/living-lot-ts` after fetch |
| Unity campaign `campaign/living-lot-client` | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` | local ref == `origin/campaign/living-lot-client` after fetch |
| TS main checkout state | clean (`git status --porcelain` empty); parked on `wip/p04a3-real-campaign-greenlight-ts-20260829` = `4ddb58a`, ancestor of campaign tip | verified |
| Unity main checkout state | clean; parked on `wip/p04a3-real-campaign-greenlight-client-20260829` = `5076af4`, ancestor of campaign tip | verified |
| Unity project version | `6000.3.22f1 (1c726e1fb402)` — unchanged | `ProjectSettings/ProjectVersion.txt` |
| Unity / Project: Studio processes | none running at Entry | `pgrep -fl Unity` empty |
| Contract attestation | `docs/engineering/attestations/P05A-STATIC-CONTRACT-GATE-01.json` resolvable at campaign tip | `git cat-file -e` OK |
| Charter commit | `b1d506d` resolvable in TS repo (branch `codex/p05a-final-refresh-01`) | `git cat-file -t` = commit |
| Visual Direction commit | `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` resolvable in TS repo (branch `docs/visual-direction-package-01`) | `git cat-file -t` = commit |
| Schema / protocol / projection / save | `sha256:01f15efc…907e1e` / 4 / 11 / 15 | charter §1, readiness gate §3 |

## WIP branches — created and pushed before any edit

| Branch | From | Worktree | Remote |
| --- | --- | --- | --- |
| `wip/p05a-production-shooting-01-ts` | `7811377cea1c1b9ddca2c17c626879504b23ed4e` | `/private/tmp/studio-p05a-impl-01/ts` | pushed to `hspector-github`, tracking |
| `wip/p05a-production-shooting-01-client` | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` | `/private/tmp/studio-p05a-impl-01/unity` | pushed to `origin`, tracking |

Campaign branches are never edited directly. Both worktrees isolated from all other checkouts; no other editor owns them.

## Owner map

One lead engineer/integrator (this session's lead agent) holds every charter lane **sequentially** — never two editing lanes in the same checkout at once. Lane transitions follow the charter §6.1 handoff law: commit, push, record range + tests, clean tree, then the next lane begins. Delegated subagents receive only:

- read-only audit/review lanes (hostile review, visual review, evidence verification) — no edits;
- bounded non-collision editing lanes, if used, in separate isolated worktrees with explicit path assignment.

Collision-prone files (charter §6.1 list) are edited only under the lane that owns them, one lane at a time. Workers never merge or move campaign branches. The hostile reviewer (W7) is a fresh high-capability agent that has performed no P05A implementation work.

## Authorities read in full before first edit

Charter (`b1d506d`), final reconnaissance r2 (`b1d506d`), readiness gate r2 (`b1d506d`), Package 05 main design (`d5653327`), Package 05 Builder Annex (`d5653327`), P04 lessons learned (`4ddb58a`), CF-07/CF-08 sections of the static audit (`ee52283`). Visual Direction package + Builder Annex (`728781d`) and Unity architecture audit + annex (`8110820`) exported for wave-time reading before W3/W4.

## Entry exit

Exact clean starting pair verified; owner map recorded; no product file changed. → W0 begins.
