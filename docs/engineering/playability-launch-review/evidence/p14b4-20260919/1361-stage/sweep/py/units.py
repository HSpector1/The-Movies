"""1361-N unit map: every file with an edit belongs to exactly one unit."""
H = [
 'tests/helpers/p14b2-fixtures.ts', 'tests/helpers/p14c2b-fixtures.ts', 'tests/helpers/p14c2c-fixtures.ts',
 'tests/helpers/p14c2rm-fixtures.ts', 'tests/helpers/p14c3-canonical-rival-fixtures.ts', 'tests/helpers/p14c3-fixtures.ts',
 'tests/helpers/p14c3-genuine-evidence-fixtures.ts', 'tests/helpers/p14c3-history-boundary-fixtures.ts',
 'tests/helpers/p14c3-second-episode-fixtures.ts', 'tests/helpers/p14c4-fixtures.ts', 'tests/helpers/p14p3-fixtures.ts',
 'tests/contracts/_v14Contract.ts',
 # the four callers of the renamed saveApi key (tests/helpers/p14c3-fixtures.ts:66)
 'tests/p14c3-save-v38.test.ts', 'tests/p14c3-transition-evidence.test.ts', 'tests/p14c3-admission-boundaries.test.ts',
 'tests/p14c3-profession-episodes.test.ts',
]
G1 = [  # lifts, shapes, controls and digests (S5 lifts and comparisons, S6, S7, S10)
 'tests/p14c1-materialized-aging.test.ts', 'tests/p14b9-save-v42.test.ts', 'tests/p14d1-rival-shelving.test.ts',
 'tests/p14b5-relationships.test.ts', 'tests/p14c2s-scientist-retirement.test.ts', 'tests/facility-move-demolish.test.ts',
 'tests/p13b-r07-save-v25.test.ts', 'tests/p14b4-save-v30-compatibility.test.ts', 'tests/p14b3-rule-revision.test.ts',
 'tests/p14bf2-acting-discipline.test.ts', 'tests/p14p4p5-casting-reservation.test.ts', 'tests/p14p4p5-delayed-retirement.test.ts',
 'tests/p14p4p5-queued-project-outcome.test.ts', 'tests/p14p4p5-scenery-capacity.test.ts', 'tests/p14p4p5-cross-owner.test.ts',
]
G4 = [  # chains and masking (S4, S9, bare-toThrow S8)
 'tests/p14c3-dual-extensions.test.ts', 'tests/p14c3-offmenu-extensions.test.ts', 'tests/p14c3-cohort-transition.test.ts',
 'tests/p14c3-profession-history.test.ts', 'tests/p14c3-transitions.test.ts', 'tests/p14c3-promise-digest-continuity.test.ts',
 'tests/p14c3-canonical-rival-history.test.ts', 'tests/p14c3-queued-writing-proof.test.ts',
 'tests/p14c2rm-writer-continuation.test.ts', 'tests/p12-starting-world.test.ts', 'tests/p06a-w1-release-authority.test.ts',
 'tests/p14p3-directing-promises.test.ts', 'tests/p14p4p5-opportunities.test.ts', 'tests/p14p4p5-screenplay-status.test.ts',
 'tests/p14r3-save-v41.test.ts', 'tests/save.test.ts', 'tests/contracts/v14-boundary-guards.contract.test.ts',
 'tests/p14c2b-save-v36.test.ts', 'tests/p13b-s8-save-v27.test.ts', 'tests/p14b1-t4-regressions.test.ts',
]
G3 = [  # versions, sentinels, titles and the UI
 'tests/d17a-adv-migration.test.ts', 'tests/d17b-save-v7.test.ts', 'tests/script-projects-save-v9.test.ts',
 'tests/construction-save-v11.test.ts', 'tests/placement-save-v12.test.ts', 'tests/property-state-v13.test.ts',
 'tests/p13b-s2-save-v22.test.ts', 'tests/p13b-s3-save-v23.test.ts', 'tests/p13b-s5-save-v24.test.ts',
 'tests/p13b-s6-save-v26.test.ts', 'tests/p13b-s7-announcements.test.ts', 'tests/p14a1-save-v28.test.ts',
 'tests/p14b1-save-v29.test.ts', 'tests/p14b5-save-v31.test.ts', 'tests/p14c2a-save-and-settlement.test.ts',
 'tests/p14c4-save-v35.test.ts', 'tests/p14d1-rival-shelving-save-v43.test.ts', 'tests/p14b10-save-v44.test.ts',
 'tests/film-chronicle.test.ts', 'tests/d11-employment.test.ts', 'tests/d17-engagement-persistence.test.ts',
 'tests/d17a-adv-reconciliation.test.ts', 'tests/p04a2-writer-credit-law.test.ts', 'tests/p09a-w0-founding-regime.test.ts',
 'tests/c2a-m3-rename-and-pooling.test.ts', 'tests/c2a-m3-screenplay-mint.test.ts', 'tests/p13a-causal-core.test.ts',
 'tests/p13b-s2-access-identity.test.ts', 'tests/p13b-s3-validation.test.ts', 'tests/p14b7-promise-waiver.test.ts',
 'tests/contracts/v14-byte-parity.contract.test.ts',
 'ui/src/engine/d17-save-migration.test.ts', 'ui/src/engine/film-chronicle-adapter.test.ts',
 'ui/src/lot/snapshot/v14SetHolderBoundary.test.ts', 'ui/src/saves.test.tsx', 'ui/src/session.test.tsx',
]
def unit_of(f):
    f = f.split(' [')[0]
    if f in H: return 'H'
    if f in G1: return 'G1'
    if f in G4: return 'G4'
    if f in G3: return 'G3'
    if f.startswith('tests/bridge-'): return 'G2'
    if f.startswith('ui/src/'): return 'G3'
    if f.startswith('tests/helpers/'): return 'H'
    return 'G5'
