# Current Ops review — agent onboarding repair 01

Status: **REPAIR CANDIDATE PUBLISHED — LANDING PENDING**

This is a documentation and repository-agent-configuration candidate. It changes no product code and grants no P11 or P12 implementation authority.

> **Do not merge `docs/agent-onboarding-repair-01` wholesale into `main`.** The review branch descends from the accepted campaign and therefore contains product history absent from `main`. Select the exact target patch below and land it only through a Current Ops-owned integration worktree after independent review.

## Review identities

| Item | Immutable identity |
| --- | --- |
| Repository | `HSpector1/The-Movies` |
| Candidate branch | `docs/agent-onboarding-repair-01` |
| Candidate base | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` |
| Repair content | `e1be8f2d30e15bac91fd30235b53c998438ce796` — [source register](https://github.com/HSpector1/The-Movies/blob/e1be8f2d30e15bac91fd30235b53c998438ce796/docs/operations/PROJECT-STUDIO-SOURCE-REGISTER-2026-09-05.md), [package index](https://github.com/HSpector1/The-Movies/blob/e1be8f2d30e15bac91fd30235b53c998438ce796/docs/PACKAGES.md), [README](https://github.com/HSpector1/The-Movies/blob/e1be8f2d30e15bac91fd30235b53c998438ce796/README.md), [START-HERE](https://github.com/HSpector1/The-Movies/blob/e1be8f2d30e15bac91fd30235b53c998438ce796/START-HERE.md) |
| Patch-artifact commit | `b7797d61cfc51cbfb307015e548ca951756463fa` |
| Inspected `main` target | `c902a704eb948cc576083d0973c8c23e59937dc1` |
| Accepted-campaign target | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` |
| Active-stack snapshot | `2026-09-05T16:34:36Z`; unsealed forward evidence only |

## Defects corrected

- `README.md` now distinguishes accepted product, active implementation, future planning, and historical reference immediately, with real repository and discovery-branch names and one dated identity register.
- `START-HERE.md` now explains authority discovery, branch/worktree ownership, TypeScript versus Unity ownership, browser versus native evidence, private access, safe launch prerequisites, and real validation routes. It does not launch or use the Owner's durable profile as onboarding.
- `CLAUDE.md` now applies the current authority hierarchy, deterministic TypeScript law, stable IDs, save/consumer compatibility, source-first reuse, evidence honesty, protected refs, and the rule that planning alone does not authorize implementation.
- All four repository subagents now consume the parent task and shared authority guide instead of granting themselves an original-M0A charter. Their previous tool and model permissions are unchanged; their roles were not broadened.
- `docs/PACKAGES.md` maps P04–P18 without equating a foundation or technical KEEP with whole-package completion or Owner acceptance. It preserves the real-Builder obligation and the provisional P16–P18 boundary.
- The former root instructions and four role files are preserved byte-for-byte outside discovery locations, with source commit, Git blob, byte count, and SHA-256 in the [archive provenance](https://github.com/HSpector1/The-Movies/blob/e1be8f2d30e15bac91fd30235b53c998438ce796/docs/history/agent-configuration/accepted-2753e18/PROVENANCE.md). The old root bytes use the non-discoverable filename `CLAUDE.md.archived`.

## Landing artifacts

Choose exactly one artifact. Both expand to a 107,080-byte unified patch with SHA-256 `d4b9342b0dbaa81d4e4c0c43cf56f78921c592344fd26003d6695880b3e13d89`.

| Target | Required base | Patch archive |
| --- | --- | --- |
| Inspected `main` | `c902a704eb948cc576083d0973c8c23e59937dc1` | [PROJECT-STUDIO-ONBOARDING-REPAIR-01-MAIN.patch.gz](https://github.com/HSpector1/The-Movies/blob/b7797d61cfc51cbfb307015e548ca951756463fa/docs/operations/landing/PROJECT-STUDIO-ONBOARDING-REPAIR-01-MAIN.patch.gz) |
| Accepted campaign | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` | [PROJECT-STUDIO-ONBOARDING-REPAIR-01-CAMPAIGN.patch.gz](https://github.com/HSpector1/The-Movies/blob/b7797d61cfc51cbfb307015e548ca951756463fa/docs/operations/landing/PROJECT-STUDIO-ONBOARDING-REPAIR-01-CAMPAIGN.patch.gz) |

Each deterministic gzip archive is 33,909 bytes with SHA-256 `6024fad82141a9b9871e7a43f43a445770ad388742f15e4c94bcefea79ff708d`. The payloads are intentionally identical: the seven replaced files have identical blobs at both bases, and the nine added paths are absent at both bases. Separate names preserve the target decision and validation record.

Current Ops can retrieve either artifact through Git without switching an active checkout:

```bash
git -C /absolute/path/to/owned-clone fetch --no-tags origin b7797d61cfc51cbfb307015e548ca951756463fa
git -C /absolute/path/to/owned-clone show 'b7797d61cfc51cbfb307015e548ca951756463fa:docs/operations/landing/PROJECT-STUDIO-ONBOARDING-REPAIR-01-MAIN.patch.gz' > /tmp/project-studio-onboarding-main.patch.gz
gzip -dc /tmp/project-studio-onboarding-main.patch.gz > /tmp/project-studio-onboarding-main.patch
git -C /absolute/path/to/main-target apply --check /tmp/project-studio-onboarding-main.patch
```

Substitute the campaign artifact and exact accepted base for a campaign landing. Reconfirm the target base and inspect the patch before applying it. Landing and activation remain a Current Ops decision.

## Validation and cold-start review

- Changed-path allowlist: **PASS**. Repair payload is exactly 16 documentation/configuration paths; no code, tests, packages, CI, schema, generated consumer, save, or Unity asset path is present.
- Reference check: **PASS**. 88 Markdown targets scanned; 50 unique public commit/path links resolve to Git blobs; three private Unity links resolve in the authorized local clone but remain access-gated for other reviewers.
- Instruction consistency: **PASS**. Zero active stale authority banners; all four role tool/model declarations match the accepted base; the shared guide is the single common resolver.
- Legacy preservation: **PASS**. Five archived files match the source commit byte-for-byte and match the recorded blobs and SHA-256 values.
- Patch validation: **PASS**. Each artifact decoded to the recorded payload hash, passed `git apply --check`, produced exactly 16 allowlisted paths on its target base, matched every repair-content byte, and passed `git diff --check` in the resulting overlay.
- P11 publication: **PASS**. Remote branch/commit and all six fetched document hashes match the recovered source.
- Runtime suites: **not run**. The change is Markdown/repository agent configuration only; no gameplay, browser, Unity, bridge, supervisor, HID, or profile process was launched.

A fresh read-only reviewer with no prior project conversation started at `README.md` in each disposable overlay:

| Required discovery | `main` overlay | accepted-campaign overlay |
| --- | --- | --- |
| Accepted TypeScript/Unity identities and acceptance evidence | PASS | PASS |
| Active branches, dated snapshot, and authorization | PASS | PASS |
| Protected branches and task boundaries | PASS | PASS |
| Six P11A Revision 02 documents | PASS | PASS |
| Original P12 design and Builder Annex | PASS | PASS |
| Corrected P12 pre-readiness | PASS | PASS |
| Focused, package, full, and documentation validation routes | PASS | PASS |
| Exact private Unity access requirement or limitation | PASS | PASS |

The final row is a navigation pass, **not a private-source retrieval pass**. The cold reviewer did not inspect private Unity bytes and recorded `PRIVATE SOURCE ACCESS REQUIRED`. It launched no runtime and changed no files.

## P11A Revision 02 publication reviewed here

Publication branch `docs/p11a-launch-package-01`, commit `90b349a8272f17ad7ea541cdddc777d36c1d861d`:

1. [DRAFT-P11A-IMPLEMENTATION-PROMPT.md](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/engineering/DRAFT-P11A-IMPLEMENTATION-PROMPT.md)
2. [P08-P10-TO-P11-HANDOFF-CONTRACT.md](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/engineering/P08-P10-TO-P11-HANDOFF-CONTRACT.md)
3. [P11A-DECISION-AND-REQUIREMENT-REGISTER.md](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md)
4. [P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/engineering/P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md)
5. [P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/engineering/P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md)
6. [P11A-READINESS-AND-DEPENDENCY-GATE.md](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/engineering/P11A-READINESS-AND-DEPENDENCY-GATE.md)

[Publication provenance receipt](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/provenance/P11A-REVISION-02-PUBLICATION-RECEIPT.md). Publication preserves draft/provisional status and is not approval of P11 mechanics.

## Limitations and requested decision

- Private Unity repository `HSpector1/project-studio-unity-visual-spike` requires explicit GitHub access. This working session verified its configured locator and referenced commits read-only; the independent cold reviewer did not, so downstream private-source review remains access-dependent.
- The canonical Mechanics Bible is not committed in either product repository. Original-derived changes require an Owner- or Current Ops-authorized research-corpus location; without it, those claims are not verifiable.
- The active P08–P10 commits are one dated, unsealed snapshot. They are neither acceptance evidence nor edit permission.
- The candidate has not repaired `main` or the accepted campaign merely by existing on this review branch.

Current Ops should review the highlighted behavioral configuration changes, select and independently revalidate one target patch, and decide when to land and activate it. Do not start P11 or P12 implementation from this publication.

**REPAIR CANDIDATE PUBLISHED — LANDING PENDING**
