# Codex Repository Hygiene 01

Date: 2026-08-24

Repository: `HSpector1/The-Movies`

Evidence branch: `codex/repository-hygiene-01`

Canonical comparison point: `main` at `c902a704eb948cc576083d0973c8c23e59937dc1`

## Outcome

The live remote inventory contained 72 branches. Five refs were deleted across the original pass
and an Owner-authorized follow-up. The first two were merged redundant refs; the final three were
the exact branches previously held for Owner judgment. All five had no open PR or worktree and
remain fully recoverable from retained authoritative refs or, for the trivial write-test commit, a
retained descendant. This report branch adds one ref, so the final live count is 68: a net reduction
of four branches (5.6%).

The deliberately small deletion set is a fail-closed result. A much larger topology-only candidate
set was rejected because canonical documentation uses those branch names as evidence, authority, or
recovery coordinates. Reachability alone was not treated as permission to erase those pointers.
The three original REVIEW REQUIRED refs were deleted only after the Owner explicitly resolved their
documented ambiguity and live verification reconfirmed the expected facts.

No commit was rewritten, no tag was changed, no PR was merged/closed/commented on, and neither
`main` nor Living Lot was modified.

## Before

| Item | Live truth at inventory |
| --- | --- |
| Remote branches | 72 |
| Default branch | `main` at `c902a704eb948cc576083d0973c8c23e59937dc1` |
| Active campaign | `campaign/living-lot-ts` at `e689f5edb5f441e455f31c4a15f9398f1410cf0a` |
| Open PRs | 8, all Dependabot PRs #8–#15 against `main` |
| Classification | 20 ACTIVE, 47 HISTORICAL/EVIDENCE, 2 SAFE TO DELETE, 3 REVIEW REQUIRED |

### Open PR heads — ACTIVE / KEEP

| PR | Head branch | Tip before/after |
| ---: | --- | --- |
| #8 | `dependabot/github_actions/main/actions/setup-python-7.0.0` | `2bfe2c3f5795891e09b1ce37d2e1a88fea86f463` |
| #9 | `dependabot/github_actions/main/actions/setup-node-7.0.0` | `8ee07a599364821fc2f3736f1a0703a5c2dcefb7` |
| #10 | `dependabot/github_actions/main/actions/checkout-7.0.1` | `5310235ac061328513a6e0d6f7f9ba72481c8049` |
| #11 | `dependabot/npm_and_yarn/main/vite-node-6.0.0` | `56f76d9ba34cbc40e3aa5afe726b3f26a679d033` |
| #12 | `dependabot/npm_and_yarn/main/esbuild-0.28.2` | `390912292bb7b5402fde4222898a063f7da47636` |
| #13 | `dependabot/npm_and_yarn/main/vitejs/plugin-react-6.1.0` | `88750376d62557198806195645bd2ba8ed6296bc` |
| #14 | `dependabot/npm_and_yarn/main/types/react-19.2.18` | `ffa5bab41e4edf34d155374926fc8b5d998e2aa7` |
| #15 | `dependabot/npm_and_yarn/main/typescript-7.0.2` | `fe34be851263f523d0c14b4633c5ae33fa01c306` |

### Golden tags — immutable and unchanged

| Tag | Peeled commit |
| --- | --- |
| `golden/unity-convergence-m1` | `cd2b15872ac5849fa16beec1775543758cb3139e` |
| `golden/unity-convergence-m2` | `7d76951f6ad641e8940b97b03806b87638ed8ad8` |
| `golden/unity-convergence-m3` | `e9c6f06b717a6a106281b189a61072e35770155f` |
| `golden/unity-convergence-m4` | `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` |
| `golden/unity-convergence-m5` | `e5e95e54dc45252433bf96a75349f336df8dc875` |
| `golden/unity-convergence-m6` | `ce0eaee8772d7e1975b6cfdb62466cd7b60091d3` |

### Reachability inventory before deletion

The following 28 non-`main` refs had no commit ahead of canonical `main` (their tips were ancestors
of `main`):

- `adoption/current-game-unity-gate-ts`, `art-adopt-stage-a-h2`,
  `art-authored-stage-a-h2-offline-proof`, `art-d1a-concept-a-player-enablement`,
  `art-d1a-studio-identity-visual-proof`, `art-d1b-soundstage-composer-proof`,
  `audit-d16-economy-recovery-decision-lab`, `c2-sets-throughput-plan`, `c2a-implementation`,
  `campaign/unity-production-convergence-80h-ts`, `d17-economy-truth-equilibrium`,
  `docs/unity-production-client-decision`, `economy-capital-frontier-fix`,
  `economy-capital-risk-reward-audit`, `first-movie-journey-v1`, `gate-d-studio-lot-d1`,
  `lot-content-expansion-v1`, `merge-candidate/unity-convergence-80h-into-main-01`,
  `operation-hollywood-autonomous-marathon`, `phase-5.1-talent`, `phase-5.2-economy`,
  `phase-5.2-studio-roster`, `phase-5.2-talent-career-impact-v1`,
  `phase-5.3-studio-run-recap-v1`, `professional-floor-v1-fresh`,
  `support/readme-quickstart`, `tycoon-world-conversion-12h`, and
  `visual-tycoon-conversion-spike`.

The following 43 refs contained commits not reachable from `main`:

- `campaign/living-lot-ts`; `codex/dependency-integration-safe-02`;
  `codex/dependency-triage-01`; `codex/economy-diagnosis-02`;
  `codex/economy-intervention-frontier-03`; `codex/economy-truth-audit-01`;
  `codex-github-write-test`.
- `dependabot/github_actions/main/actions/setup-python-7.0.0`,
  `dependabot/github_actions/main/actions/setup-node-7.0.0`,
  `dependabot/github_actions/main/actions/checkout-7.0.1`,
  `dependabot/npm_and_yarn/main/vite-node-6.0.0`,
  `dependabot/npm_and_yarn/main/esbuild-0.28.2`,
  `dependabot/npm_and_yarn/main/vitejs/plugin-react-6.1.0`,
  `dependabot/npm_and_yarn/main/types/react-19.2.18`, and
  `dependabot/npm_and_yarn/main/typescript-7.0.2`.
- `docs/hollywood-horizon-governance`, `docs/project-studio-success-blueprint`,
  `support/3d-asset-guardrails`, and `support/3d-visual-regression`.
- `art-fable-authored-environment-spike`, `art-research-open-source-integration-blueprint`,
  `asset-lab-03-hero-soundstage`, `asset-lab-04-studio-lot`,
  `asset-lab-05-blender-pipeline`, `asset-lab-05b-character-rebuild-loop`,
  `asset-lab-05c-character-art-refinement-loop`,
  `asset-lab-05d-character-professionalization-loop`, `asset-lab-05e-character-art-cleanup-loop`,
  `asset-lab-05f-hero-electric-character-proof`,
  `asset-lab-05g-hero-electric-surgical-correction`,
  `asset-lab-05h-authored-base-character-proof`, `asset-lab-05h-final-owner-review-package`,
  `asset-lab-05i-corrective-character-pass`, and `asset-lab-character-human-artist-handoff`.
- `backup/project-studio-consolidated-2026-07-28`,
  `docs/character-handoff-d1a-status-correction`, `docs/character-handoff-owner-ruling`,
  `docs/character-handoff-packet-hardening`, `docs/character-handoff-packet-r2`,
  `professional-floor-v1`, `silverline-campus-experiment`, `studio-lot-spike`, and
  `support/branch-triage-report`.

## Method

Every remote branch was checked against the default branch, open PR heads, local worktree heads,
tag containment, merge-base/ahead-behind state, unique commits and files, branch/PR history, and
exact branch-name references in canonical documentation. Unique-SHA branches were compared for
ancestor containment and semantic supersession. Deletion required both content preservation and a
finding that the branch name itself was not an intentional archive coordinate.

## Deleted — SAFE TO DELETE

| Deleted branch | Prior tip | Preservation location | Why deletion was safe |
| --- | --- | --- | --- |
| `support/readme-quickstart` | `e67178671a51f361cc1d2b5fd76b99391937a656` | `main`; also contained by `golden/unity-convergence-m6` | PR #6 was merged. The branch had no open PR, worktree, unique commit, current documentation reference, or independent recovery role. |
| `merge-candidate/unity-convergence-80h-into-main-01` | `ce0eaee8772d7e1975b6cfdb62466cd7b60091d3` | Exact peeled commit of `golden/unity-convergence-m6`, and reachable from `main` | PR #7 was merged. This was a temporary merge-candidate ref; immutable Golden M6 is the explicit recovery authority at the exact same SHA. No open PR or worktree used it. |
| `codex-github-write-test` | `3d6c48710a2edf92dfe420363742cb7176decf50` | Retained descendant `silverline-campus-experiment` | One unique trivial commit added only the three-line `CODEX_GITHUB_WRITE_TEST.md`, whose contents say it is safe to delete. No production, research, recovery, PR, tag, or worktree depended on the ref. |
| `operation-hollywood-autonomous-marathon` | `2be66562aa9593fee79c370ea7ce6787ac88557f` | `main`; also contained by later immutable Golden tags | Zero commits unique versus live `main`; the tip was its merge-base with `main`. No open PR, worktree, or tag pointed at the tip. The Owner explicitly retired the branch-level recovery coordinate. |
| `professional-floor-v1-fresh` | `2b75e3d79ab6426ccc2e67cb66ab278f4abb3e48` | `main`; also contained by later immutable Golden tags | Zero commits unique versus live `main`; the tip was its merge-base with `main`. No open PR, worktree, or tag pointed at the tip. The Owner explicitly retired the charter's keep instruction. |

The original two deletions were executed one at a time. The three Owner-authorized refs were deleted
in one exact-name batch after a fresh audit. After each operation the repository was fetched/pruned,
recounted, and checked for unchanged `main`, Living Lot, Unity-related refs, Codex evidence refs, all
eight PR heads, Golden M1–M6, and remote `HEAD` health.

## Kept — ACTIVE

Final ACTIVE count: 21, including this evidence branch.

- `main` — default canonical branch; unchanged.
- `campaign/living-lot-ts` — Fable's active Living Lot campaign; untouched.
- `codex/dependency-integration-safe-02` — validated five-update integration candidate awaiting
  later integration review.
- `codex/repository-hygiene-01` — this report and cleanup evidence.
- The eight Dependabot head branches in the open-PR table above — protected while PRs #8–#15 are
  open.
- `adoption/current-game-unity-gate-ts`
- `c2-sets-throughput-plan`
- `c2a-implementation`
- `docs/hollywood-horizon-governance`
- `docs/project-studio-success-blueprint`
- `docs/unity-production-client-decision`
- `support/3d-asset-guardrails`
- `support/3d-visual-regression`
- `visual-tycoon-conversion-spike`

The final nine branches above are checked out in local worktrees. They remain ACTIVE/KEEP until the
relevant owner explicitly retires those worktrees, even where their commits are already reachable
from `main`.

## Kept — HISTORICAL / EVIDENCE

Final HISTORICAL/EVIDENCE count: 47.

### Art, provenance, and orphaned evidence

- `art-adopt-stage-a-h2` — adopted content is in `main`, but the production-adoption document names
  this source branch.
- `art-authored-stage-a-h2-offline-proof` — named unadopted/offline proof checkpoint.
- `art-d1a-concept-a-player-enablement` — closed and tag-covered, but canonical closure documents
  retain the published branch as provenance.
- `art-d1a-studio-identity-visual-proof` — named visual-evidence archive cited by D1-A records.
- `art-d1b-soundstage-composer-proof` — named proof/adoption provenance.
- `art-fable-authored-environment-spike` — three unique commits containing the authored-stage spike,
  tests, asset, verdict, and production outcome.
- `art-research-open-source-integration-blueprint` — unique licensing, provenance, reuse, and
  integration research absent from `main`.

The following 13 Asset Lab branches form a disconnected but intentional sequence of named art
checkpoints. Later tips contain earlier commits, but canonical provenance and the prior branch audit
use the branch names as historical coordinates, so the refs remain:

- `asset-lab-03-hero-soundstage`
- `asset-lab-04-studio-lot`
- `asset-lab-05-blender-pipeline`
- `asset-lab-05b-character-rebuild-loop`
- `asset-lab-05c-character-art-refinement-loop`
- `asset-lab-05d-character-professionalization-loop`
- `asset-lab-05e-character-art-cleanup-loop`
- `asset-lab-05f-hero-electric-character-proof`
- `asset-lab-05g-hero-electric-surgical-correction`
- `asset-lab-05h-authored-base-character-proof`
- `asset-lab-05h-final-owner-review-package`
- `asset-lab-05i-corrective-character-pass`
- `asset-lab-character-human-artist-handoff`

The following four character-handoff refs identify distinct handoff decisions/checkpoints. The R2
branch and final Asset Lab handoff share tip `66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8`, but both names
are canonical provenance coordinates:

- `docs/character-handoff-d1a-status-correction`
- `docs/character-handoff-owner-ruling`
- `docs/character-handoff-packet-hardening`
- `docs/character-handoff-packet-r2`

- `backup/project-studio-consolidated-2026-07-28` — exact tip is tagged by
  `project-studio-backup-2026-07-28-lab03`, but the orphan archive describes itself as the durable
  off-machine backup; keep the intentional recovery pointer.
- `studio-lot-spike` — five unique commits containing the failed-review spike, visual artifacts, and
  integration dossier.

### Economy and decision evidence

- `audit-d16-economy-recovery-decision-lab` — published read-only decision audit.
- `d17-economy-truth-equilibrium` — named D-17A decision/closure evidence.
- `economy-capital-frontier-fix` — merged and closure-tagged, but canonical D-13 evidence names the
  approved source branch.
- `economy-capital-risk-reward-audit` — named read-only risk/reward audit.
- `phase-5.2-economy` — D-12 contract and calibration evidence use this branch as their authority.
- `phase-5.2-talent-career-impact-v1` — D-14 contract and closure provenance.
- `codex/economy-truth-audit-01` — frozen Economy Audit 01 evidence at `e6c10c3880c8e843004bd2c57833b09b92efa899`.
- `codex/economy-diagnosis-02` — frozen Economy Diagnosis 02 evidence at `159fb7a31f0f125843b11607597dcbd6741e7505`.
- `codex/economy-intervention-frontier-03` — frozen Economy Frontier 03 evidence at `07e8ec8a2d929b40217eece16cfb8c66548081cb`.

### Maintenance and sealed product history

- `codex/dependency-triage-01` — completed independent Dependabot compatibility evidence.
- `campaign/unity-production-convergence-80h-ts` — completed Golden campaign authority/provenance;
  immutable tags preserve its commits, while the campaign records still name the branch.
- `first-movie-journey-v1` — sealed Owner-promoted milestone and named recovery coordinate.
- `gate-d-studio-lot-d1` — merged Gate D closure provenance.
- `lot-content-expansion-v1` — sealed Campaign 1 history.
- `phase-5.1-talent` — legacy phase checkpoint with historically inconsistent merge wording; retain.
- `phase-5.2-studio-roster` — Owner-playtest/non-merge history.
- `phase-5.3-studio-run-recap-v1` — published D-15 closure branch.
- `professional-floor-v1` — unmerged planning/charter evidence explicitly retained as historical.
- `silverline-campus-experiment` — unique 3D donor experiment, assets, screenshots, and transplant map.
- `support/branch-triage-report` — unique 2026-08-20 branch-inventory snapshot; retained as prior audit
  evidence rather than silently superseded.
- `tycoon-world-conversion-12h` — sealed predecessor milestone and named recovery coordinate.

## Owner disposition follow-up

Final REVIEW REQUIRED count: 0.

| Branch | Live re-verification | Owner disposition |
| --- | --- | --- |
| `codex-github-write-test` | Exactly one unique commit and one three-line connectivity artifact; no PR, tag, worktree, product, research, or recovery dependency. | Authorized and deleted. |
| `operation-hollywood-autonomous-marathon` | `451` commits behind and `0` ahead of live `main`; fully contained, with no PR/worktree or exact tag at its tip. | Authorized and deleted; the prior branch-recovery ambiguity is retired. |
| `professional-floor-v1-fresh` | `242` commits behind and `0` ahead of live `main`; fully contained, with no PR/worktree or exact tag at its tip. | Authorized and deleted; the prior charter keep instruction is retired. |

## After

| Item | Verified final state |
| --- | --- |
| Remote branches | 68, including `codex/repository-hygiene-01` |
| Net reduction | 4 branches from 72 (5.6%); 5 obsolete refs deleted and 1 evidence ref added |
| Retained classification | 21 ACTIVE, 47 HISTORICAL/EVIDENCE, 0 REVIEW REQUIRED |
| Default branch | `main` unchanged at `c902a704eb948cc576083d0973c8c23e59937dc1` |
| Active campaign | `campaign/living-lot-ts` advanced independently before the follow-up and remained unchanged by it at `c93b8578ec4373185f5f3ce0c9a120440413eb6a` |
| Open PRs | PRs #8–#15 remain open; all eight head refs and tips unchanged |
| Golden recovery | M1–M6 tag objects and peeled commits unchanged; M6 remains `ce0eaee8772d7e1975b6cfdb62466cd7b60091d3` |
| History/ref safety | No force-push, history rewrite, tag mutation, PR mutation, or `main` push occurred |

## Repository organization audit

- **Top level:** reasonably understandable. Product code is separated into `src/`, `ui/`,
  `bridge/`, `tests/`, `scripts/`, `art/`, and `docs/`. There is no present-day equivalent of a
  single massive unorganized source tree.
- **Contributor entry points:** `README.md` has a useful quickstart, engineering boundaries, and
  major-document links. `START-HERE.md` opens with a current launch note but is mostly retained M0A
  and Operation Hollywood history. It is adequate for provenance, not a crisp current contributor
  index.
- **Tracked generated/evidence paths:** no obviously abandoned current `proof/` or backup directory
  is tracked. `generated/unity/StudioBridgeDtos.Generated.cs` is an intentional bridge contract
  artifact; current `art/` and documentation evidence are governed inputs/records, not disposable
  build output.
- **Root documents:** 28 root Markdown files are tracked. No exact duplicate root Markdown blobs
  were found. The several status/routing documents have distinct historical roles, but their
  overlapping authority language increases navigation cost.
- **Branch naming:** current work generally uses understandable `campaign/`, `codex/`, `docs/`,
  `support/`, and `dependabot/` namespaces. Remaining unprefixed phase/art branches are deliberate
  historical coordinates or are called out for review.

## Deferred

- **DEFERRED — HISTORY REWRITE INCOMPATIBLE WITH CURRENT GOLDEN RECOVERY POLICY.** Issue #2 remains
  open and still accurately describes the general problem: a roughly 1.7 GB full clone, dominated
  by roughly 1.9 GB of historical `proof/` blobs plus deleted backup/binary content. Do not use
  `git filter-repo`, BFG, force-push, or tag replacement while immutable Golden SHAs govern recovery.
- The three prior REVIEW REQUIRED branches have received Owner disposition; no branch decision from
  this audit remains outstanding.
- A future documentation-only task should establish one concise current-status/index page and mark
  stale branch-only claims in `START-HERE.md`, Operation Hollywood records, and overlapping root
  routing documents. This audit does not authorize rewriting those historical records.
- Owners may later retire stale local worktrees. Until explicitly confirmed, their branch heads stay
  ACTIVE/KEEP.
- A future governance task may codify branch lifecycle rules (working, evidence, sealed/tagged,
  superseded) so completed branches have an explicit archival or deletion decision at closure time.
