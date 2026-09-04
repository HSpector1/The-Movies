# P06 implementation and Owner-playtest lessons learned

**P06 OWNER ACCEPTED — CLOSED. Owner verdict: ACCEPTED / KEEP / CLOSED.**
Acceptance date: 2026-09-04. Recorded 2026-09-04 19:51:49Z (21:51:49 CEST); the actual
playtest time was not supplied. The Owner accepted the actual combined P06/P07 journey on
`~/Desktop/P07A-Owner-Candidate-a6f4f82-c4c65db/`, executable
`c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813`.

The accepted inherited P06D.1 product/source checkpoint is TypeScript
`050b98ee15d83883b209b4e0700a06e064a4eb60`; its documentation/campaign seal is
`72217af1fb580d9d3ae7557e2cdb280a6f29eb11`. Unity product is
`23c000a7e0aa1d61d3ad4a620b5dfea7d7ac0bde`; clean build/campaign is
`b0c780bb7abd1c81e1c30b59391b7effb86f490f`. These identify the P06 lineage, not a
separate replay of the old P06D.1 candidate. Full provenance, candidate hashes, and retained
findings are in [the P06 closeout](../campaigns/P06-TECHNICAL-PROMOTION-P06D1.md#owner-acceptance-closeout--2026-09-04).

These are the P06-specific consequences beyond the
[P04](P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md) and
[P05](P05-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md) lessons. Their earlier
rules still apply; this document does not reproduce those entire registers.

1. **A movie must remain visible and addressable across department handoffs.** The grouped
   rail gives one exact picture a continuous route through Scripts, Making Movies, and Post &
   Release. A wrapped film waiting for capacity is still the player's film, not an absent row.
   Bind actions and selection to immutable IDs even when titles are long, duplicated, or clipped.

2. **Release Ready, Committed, Released, In Theaters, and Run Complete are distinct.** P06
   supplies the hold and commitment boundary; P07 supplies truthful release/result/theatrical
   presentation. The combined journey accepted these distinctions. Do not infer a release
   from a commitment, or continue an active-theatrical row after its run has ended.

3. **Explicit commitment must not advance time.** Committing the exact title records intent;
   the next authoritative week performs release. This makes the hold intelligible and allows
   Save/Load between decision and consequence. A confirmation must not secretly consume a week.

4. **The active rail is operational; completed films need durable history.** A single scroll
   owner made every active row reachable without an arbitrary cap. History then preserves
   released results after active-rail removal. Keeping every historical film in an operational
   rail would obscure the current slate; deleting its inspection route would lose the studio's past.

5. **Physical world owners must work independently.** P06 inherited the P05 no-rail-priming
   law and applied it to Production/Post. The Owner successfully entered from the building.
   Keep that path independently testable when rail, selection, and workspace code change.

6. **Rail, card, workspace, and guidance must agree for the same subject and revision.** A
   wrapped picture retained raw phase `shooting` while its operational truth was Waiting for Post.
   P06C repaired the guidance owner, and P06D added a same-subject agreement test. Comparing
   screenshots from different films or revisions cannot establish this consistency.

7. **A released film may truthfully have no physical lot location.** Department ownership is
   an operational fact, not a requirement that every result occupy a building. P07's accepted
   continuation preserves Details/history without inventing a Locate target for a departed film.

8. **Technical promotion may precede Owner acceptance, but cannot replace it.** P06D.1 was
   technically promoted while human acceptance remained pending. The later explicit combined
   Owner ruling is the acceptance event. Preserve both timestamps/statuses instead of rewriting
   a technical KEEP into an earlier human verdict.

9. **Comparison candidates are useful only when controls stay byte-preserved.** P06B, P06C,
   original P06D, and clean P06D.1 remain separate artifacts with different executable hashes.
   A provenance correction or new candidate must not overwrite the controls that explain the decision.

10. **Runtime, product checkpoints, build-bound commits, and documentation tips differ.**
    P06's accepted checkpoint ends with a contract test, while its last executable TypeScript
    runtime change is `2240df8e7705fd5ecf84802f352818158380b4a4`. The documentation seal
    is later still. Unity's clean build adds a required test `.meta` after its product commit.
    Name the category with each SHA; an abbreviated directory name cannot substitute for the manifest.

11. **Clean source provenance matters even when behavior is green.** P06D.1 corrected a
    dirty-build provenance problem without redesigning gameplay. A Unity executable can change
    between identical-source builds; Assembly bytes can vary with project path. Preserve the
    accepted bytes and record source/build provenance, rather than rebuilding just to obtain a label.

12. **Canonical oracle scenarios must stay distinct from supplemental UX fixtures.** P06
    has six canonical Post/Release scenarios. Mixed-slate hero and scale stress are two additional
    UX fixtures; eight harness runs do not redefine the canonical six. Counts, sidecars, and reviewer
    language must use the same categories.

13. **Logical and physical Retina dimensions must be reported honestly.** Requested window
    dimensions, actual framebuffer dimensions, desktop capture, and Metal surface dimensions can
    differ. P06D.1 separately records its 3456×2234 fullscreen capture and 3456×2168 Metal surface.
    Do not relabel a logical/windowed capture as native physical proof.

14. **The lot remains the game; rails remain peripheral command/status layers.** Title-first
    rows, restrained grouping, bounded People awareness, and one scroll owner helped the studio
    read coherently. They do not authorize a roster dashboard, invented money fields, or a rail
    whose scale forces the player out of the lot.

15. **Human comprehension remains the final player-facing gate.** The Owner accepted the
    actual journey: safe hold, deliberate commitment, next-week consequence, correct result,
    separate result channels, financial wording, and continuing access after Save/Load and run
    completion. Existing screenshot gaps and polish remain honestly classified; no replay is
    required merely to produce another document about that accepted experience.

P06/P07 acceptance authorizes this closeout, not P08 production work. The next package is
P08A planning/reconciliation using [the final factual handoff](P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md).
P08 production implementation is **NOT YET AUTHORIZED**. No build or gameplay proof matrix
was rerun for these lessons.
