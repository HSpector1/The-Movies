# P08–P10 — Owner acceptance receipt

**P08–P10 — OWNER ACCEPTED — KEEP.** Howard explicitly answered YES to the
delivered candidate. Authority: Current Ops `OPS-P08P10-OWNER-CLOSEOUT-01`.
Recorded **2026-09-09 07:52:05 UTC / 09:52:05 CEST**. This is the recording time;
the exact playtest/decision time was not supplied. Acceptance covers the delivered,
tested scope and does not claim that every future requirement is implemented.

This supersedes the pending Owner status in the prior technical closeout and
preserved candidate metadata. Those records, their qualified reviews and failed
attempts retain their original bytes and verdicts. P06/P07 historical acceptance
remains recorded. No campaign/main promotion, Golden designation or onboarding
activation is implied.

## Owner evidence

The Owner reported that catalogue scrolling works, employees are identifiable,
hiring comparisons improved, writer information helped before commissioning,
and the existing Save/Load is acceptable for now.

Earlier observations remain part of the history: recovery started at Week 105;
the clock advanced to 106 and 107; Gene could be hired; commissioning and writing
began; Save/Load retained person, screenplay and cash; Studio History worked and
was understandable; Stage entry and Back worked; office construction cost $1.5M,
leaving $18.5M, and survived Save/Load; two terminations were possible and cash
decreased. This is not an independent check of every termination amount, an
Owner-tested renewal/cancellation claim, complete viewport coverage, or an exact
timed playtest. Technical evidence remains separately classified in the
[technical closeout](P08-P10-OWNER-UX-01.md) and
[independent review](P08-P10-OWNER-UX-01-REVIEW.md).

## Exact accepted identities

Repository pair: `HSpector1/The-Movies` and
`HSpector1/project-studio-unity-visual-spike`.

| Identity | Exact value |
|---|---|
| Accepted candidate | `$HOME/Desktop/P08-P10-Owner-UX-Candidate-fc1cd0e-761347c/` |
| TS last runtime/contract change | `4aa3487eebd656958a880d492567fe4d5f379480` |
| Engine build/source checkpoint | `fc1cd0e400337f551ba77d908b614e9dbaab9c9f` |
| Player runtime/build source | `761347c77fa59cafaa6ede45f9eeebf3a9dfda98` |
| Final Unity proof tools | `28dd961e6a230a8d554bd7ab70fb3f766f9cedc9` |
| Player manifest TS checkout context | `1a6551e63ab5d96dab4772c1fd2d18274894616e` |
| Published technical closeout / Owner-UX TS tip | `764f27c60f0eb7fac6430a8f897dd80dfdcb178b` |
| Protocol / projection / inner gameplay save | `4 / 21 / V18` |
| Outer checkpoint format | `1`, with exact protocol/schema compatibility and governed predecessor migration |
| Schema ID | `sha256:625377a2804a681da3be209da02850e221ae33ac5f58b727f6395736ad607ad1` |
| Actual generated Unity DTO Git blob | `ad6f6c263dd4d6d43683d8a68940bb12ccf3d071` |
| Actual generated Unity DTO SHA-256 | `320408fd66328f224bade2ff98d254900a9b0f2bd46403a121b4e6ea5d1d67af` |
| Engine SHA-256 | `67e03bc67a7105917cec07dca707d4ed5028ce65ebb54dc1985623d1220cf697` |
| Player executable SHA-256 | `b39b8d531ea726be44374677129d3889eccdc0ad548f9c29a1a55521eb28280d` |
| Assembly-CSharp SHA-256 | `6c5e6c89e169ac91c9647dc50f503dbf904ff6a5dd5147c37c955894a76812fc` |
| Studio.Runtime.Data SHA-256 | `1d38e78a4e1801342f0399bcb00d9707463307ead741446424b33a0eacf953dc` |
| Build manifest SHA-256 | `728487da2c788f29ed66cc262a18944d8b74054e0439a5e1c4b87f74f4d8b8fa` |
| Candidate inventory SHA-256 | `96687a5e0bda3891cc6ec137e1cc24f3cbe94cd6a1b48383dbe9c60de03ea169` |
| Preserved launcher SHA-256 | `2f4f727b19f79fc0aee3b6975fbcf19837cac4fa68cc4d98d3ba6179f599bd56` |

The actual copied files match the manifest and all 259 inventory entries
(260 physical files). The 4aa3487→fc1cd0e delta is tests/docs only;
fc1cd0e→764f27c adds documentation and a proof fixture tool, with no runtime change.
761347c→28dd961 is tools only. These ancestry checks do not relabel later tools
or documentation as built product source. The manifest's original clean/dirty,
build-time and engine-carry disclosures remain unchanged.

This acceptance is recorded on `docs/p08-p10-owner-acceptance-closeout-01`, a
documentation-only descendant of 764f27c. Its publication commit is the introducing
commit of this receipt, resolved with `git log --diff-filter=A --format=%H --
docs/campaigns/P08-P10-OWNER-ACCEPTANCE-RECEIPT.md`; it is not an engine/player identity.

## Open requirements and handoff boundary

The [deferred register's acceptance addendum](../operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md#owner-acceptance-addendum--2026-09-09)
retains player-built roads/paths, employee comparison, dropdown selectors,
Star Power filtering/sorting separately from ability, named Save As checkpoints,
the separate named studio campaign library, progressing current year beside week,
and governed pre-campaign talent history. The existing audit, authoring and
`P09-REQ-039` Builder dispositions survive. These are not silently added to P11.
In particular, current one-slot Load is acceptable now but does not implement either
named checkpoints or isolated named campaigns. `START 1920 · WK N` identifies the
governed start; progressing current-year authority remains required.

AUD-008 remains in P11 W0. Its existing facility-Opex reporting defect does not
require implementing P11 as a circular condition for publishing its launch kit.
Current Ops approved publication of the reviewed outcome-first method only;
P11 gameplay execution, scope ceiling, budget and model settings are not chosen
by that approval. The separate P11 planning branch records the final source refresh
and the unavailable `project-studio-p11-outcome-first-launch-01` archive blocker.

## Preservation and ownership

The accepted candidate, including its pending-status historical metadata, app,
launcher and inventory, is unchanged. Closeout documents live outside it.
The earlier recovery control still verifies all 663 inventory entries / 664 files
with inventory SHA-256 `c5d3fcac93c64f43b10d1cc9f4913802c27ad209cd47801bce4d4820cbdca545`.
The real Owner profile is hash-verified unchanged; no private payload is published.
No runtime, gameplay tests, build or input queue was launched for this closeout.

Campaign controls remain TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` and Unity
`c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`. Main, campaign, recovery, verification
and Owner-UX refs are not moved. Only the owned closeout/planning documentation
branches are published. Implementation/runtime ownership is yielded at the final
closeout response; P11 requires its own execution order.
