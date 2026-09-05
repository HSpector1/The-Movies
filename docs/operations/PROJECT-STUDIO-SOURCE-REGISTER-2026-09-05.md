# Project: Studio source register — 2026-09-05

This is the onboarding identity register. It separates accepted product, active implementation, future planning, and historical reference. It records one remote snapshot at `2026-09-05T16:34:36Z`; active WIP is deliberately not chased after that time.

Branches below are discovery pointers. Only the full commits identify immutable evidence, and no pointer grants permission to edit its checkout.

## Accepted product

P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The accepted campaign refs had not advanced beyond their recorded acceptance at the snapshot.

| Identity | Repository / discovery branch | Immutable commit | Evidence and meaning |
| --- | --- | --- | --- |
| TypeScript runtime/product | `HSpector1/The-Movies` / lineage on `campaign/living-lot-ts` | `da848225516fe3ced9a421548d0f5e7cbc8b5b88` | Last accepted runtime/contract product change; distinct from later proof and documentation commits. |
| TypeScript player-build binding | `HSpector1/The-Movies` / accepted lineage | `d0953e52d6b446137d3141a0310fd98b170e8cc1` | Commit recorded by the accepted player manifest. |
| TypeScript technical seal | `HSpector1/The-Movies` / accepted lineage | `4bbf26353c9b168f551e4a18ca190eceea201cb9` | Technical seal before Owner closeout; not itself the acceptance event. |
| TypeScript accepted documentation campaign | `HSpector1/The-Movies` / `campaign/living-lot-ts` and `docs/p06-p07-owner-acceptance-closeout-01` | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` | [Owner acceptance receipt](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/docs/campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md), [closeout review](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/docs/campaigns/P06-P07-OWNER-CLOSEOUT-DOCUMENTATION-REVIEW.md), [Current Best](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/CURRENT-BEST.md), and [P07 → P08 handoff](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md). This is the accepted campaign base for documentation work, not the runtime-product SHA. |
| Unity product and accepted campaign | `HSpector1/project-studio-unity-visual-spike` / `campaign/living-lot-client` | `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` | Private repository; [commit-pinned tree](https://github.com/HSpector1/project-studio-unity-visual-spike/tree/c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6) requires authorized access. Product and campaign identities are the same at acceptance. |

Accepted wire identity: protocol `4`, projection `15`, save `V16`, schema `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`. The accepted Unity editor version is `6000.3.22f1 (1c726e1fb402)` as recorded in the private commit's `ProjectSettings/ProjectVersion.txt`.

## Active implementation — unsealed forward evidence

Current authorization: `OPS-P08P10-20260905-01`.

- Planning publication: `HSpector1/The-Movies`, `docs/p08-p10-autonomous-stack-launch-01`, commit `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` — [Current Ops planning handoff](https://github.com/HSpector1/The-Movies/blob/72ca8e797e5185a5dec13ac4c4311e391b8e96e3/docs/engineering/CURRENT-OPS-HANDOFF-P08-P10-AUTONOMOUS-STACK.md).
- Issued authority: [execution order](https://github.com/HSpector1/The-Movies/blob/9bc01ea3682e597ec65acfc624afc41e4f48004a/docs/operations/OPS-P08P10-20260905-01-EXECUTION-ORDER.md) and [Current Ops delta](https://github.com/HSpector1/The-Movies/blob/9bc01ea3682e597ec65acfc624afc41e4f48004a/docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md), introduced in commit `5e01714866134552eb28ad6fb7753b598f5df123`.
- TypeScript WIP snapshot: `HSpector1/The-Movies`, `wip/p08-p10-autonomous-stack-01-ts`, `9bc01ea3682e597ec65acfc624afc41e4f48004a` — [append-only handoff](https://github.com/HSpector1/The-Movies/blob/9bc01ea3682e597ec65acfc624afc41e4f48004a/docs/campaigns/P08-P10-AUTONOMOUS-STACK-HANDOFF.md).
- Unity WIP snapshot: private `HSpector1/project-studio-unity-visual-spike`, `wip/p08-p10-autonomous-stack-01-client`, `26a543a1604eb519df11a81c0b6f894179b2349a` — [commit-pinned tree](https://github.com/HSpector1/project-studio-unity-visual-spike/tree/26a543a1604eb519df11a81c0b6f894179b2349a), access required.

At this snapshot, P08 core and P09 core have technical KEEP records, P09 extensions remain incomplete including the real-Builder obligation, and P10 has only its TypeScript W0 projection complete with Unity work next. None of P08, P09, or P10 has Owner acceptance. The public TypeScript `main` and both accepted campaign refs remain frozen under the order. The private Unity repository has no `main` branch; its accepted campaign ref is the protected baseline there.

## Future planning and cross-branch packages

Use [docs/PACKAGES.md](../PACKAGES.md) for P04–P18 names, subpackages, product-direction status, implementation status, acceptance status, exact source commits, paths, access, and superseding authority.

The recovered P11A Revision 02 archive identity maps to remote publication as follows:

| Local artifact identity | Published source |
| --- | --- |
| ZIP SHA-256 `216e5501cd3a40779fc0ca4d5fe7bd663c1d5f9a55de501930304cdbf00d226f` | `HSpector1/The-Movies`, `docs/p11a-launch-package-01`, commit `90b349a8272f17ad7ea541cdddc777d36c1d861d`; [publication receipt](https://github.com/HSpector1/The-Movies/blob/90b349a8272f17ad7ea541cdddc777d36c1d861d/docs/provenance/P11A-REVISION-02-PUBLICATION-RECEIPT.md). |

The six repository documents are now retrievable from that immutable public commit. The original local ZIP is provenance, not an onboarding dependency.

## Historical reference

Public `main` was `c902a704eb948cc576083d0973c8c23e59937dc1` at the snapshot. It is an ancestor of the accepted documentation campaign and does not contain the accepted P06/P07 campaign product or later planning publications. Treat it as a landing and historical reference, not as evidence that the accepted campaign or active WIP has been integrated there.

`CURRENT-BEST.md` at the accepted campaign records accepted product. Its older forward-looking sentences are not the live WIP ledger; use the dated active snapshot above for active status.

## External research-source limitation

The canonical `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` is not committed in either product repository. Historical project documents cite an Owner-local research-corpus location, which is not a portable onboarding dependency and grants no access by itself. Before changing original-derived behavior, obtain an expressly authorized corpus location from the Owner or Current Ops and record the source inspected. Without that access, the relevant original-game claim is `NOT VERIFIABLE — AUTHORIZED RESEARCH CORPUS REQUIRED`; do not reconstruct it from memory or a summary.

## Retrieval without disturbing an active checkout

From a separate owned clone or disposable worktree:

```bash
git ls-remote REPOSITORY_URL refs/heads/BRANCH
git -C /absolute/path/to/owned-clone fetch --no-tags origin COMMIT
git -C /absolute/path/to/owned-clone cat-file -e 'COMMIT^{commit}'
git -C /absolute/path/to/owned-clone show 'COMMIT:PATH'
```

Do not switch an active checkout to read another branch. Verify repository identity before fetching. For the private Unity repository, lack of authorization is a source-access limitation and must be reported as such; a public 404 is not proof that the repository or commit is absent.

## Protected references

This register grants no mutation authority. Unless the current task explicitly says otherwise, do not move or write:

- either repository's `main` or accepted `campaign/*` refs;
- the active P08–P10 WIP branches or their worktrees;
- accepted candidates, build artifacts, generated consumers, schemas, or saves; or
- the Owner's durable gameplay profile or any process using it.
