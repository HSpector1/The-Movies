import assert from 'node:assert/strict';
import { TraceSequence, traceSequence } from './traceSequences.mjs';
const key = (r) => JSON.stringify(r);
function exactly(actual, expected, label) {
    if (actual instanceof TraceSequence || expected instanceof TraceSequence) {
        assert.ok(Array.isArray(actual) || actual instanceof TraceSequence, label);
        assert.ok(Array.isArray(expected) || expected instanceof TraceSequence, label);
        const a = actual[Symbol.iterator](), b = expected[Symbol.iterator]();
        for (;;) {
            const x = a.next(), y = b.next();
            assert.equal(x.done, y.done, label);
            if (x.done)
                return;
            assert.deepEqual(x.value, y.value, label);
        }
    }
    assert.deepEqual(actual, expected, label);
}
// Exact unchanged m0FreezeOrder from the complete talentMarket producer.
const FREEZE_ORDER = ['issuerNotEntered', 'retirementCap', 'issuerDistrusted', 'nemesisOnRoster',
    'subjectCommittedElsewhere', 'startWeekMoved', 'noSeatForRole', 'belowAsk',
    'belowRetirementReservation', 'materialTermsChanged', 'promiseNotFeasible', 'bonusUnaffordable'];
export function assertFreezePredicateOrdering(marketValues, freezeValues, refs) {
    const market = marketValues, freezes = freezeValues;
    assert.equal(freezes.length, refs.length, 'one freeze identity per submitted proposal');
    const predicates = market.filter(row => row.phase === 'freezePredicate');
    const project = (row) => ({ issuerStudioId: row.issuerStudioId, digest: row.detail.proposalDigest,
        proposalSourceIndex: row.detail.proposalSourceIndex, proposalOccurrence: row.detail.proposalOccurrence,
        predicateOrdinal: row.detail.predicateOrdinal, predicate: row.detail.predicate });
    exactly(predicates.map(project), refs.flatMap((ref, i) => FREEZE_ORDER.map((predicate, predicateOrdinal) => ({
        issuerStudioId: freezes[i].issuerStudioId, ...ref, predicateOrdinal, predicate
    }))), 'complete identity-bound freeze predicate order');
    for (const [i, freeze] of freezes.entries()) {
        const rows = predicates.slice(i * FREEZE_ORDER.length, (i + 1) * FREEZE_ORDER.length);
        const drop = freeze.detail.drop;
        const failedAt = drop === null ? -1 : FREEZE_ORDER.indexOf(drop);
        assert.ok(drop === null || failedAt >= 0, 'freeze drop names an existing predicate');
        exactly(rows.filter(row => row.detail.result === 'FAILED').map(row => row.detail.predicateOrdinal), failedAt < 0 ? [] : [failedAt], 'freeze predicate FAILED slot agrees with drop');
        for (const [ordinal, row] of rows.entries()) {
            assert.equal(row.week, freeze.week, 'freeze predicate week binds its proposal');
            if (failedAt >= 0 && ordinal > failedAt) {
                assert.equal(row.detail.result, 'NOT_REACHED', 'freeze predicate suffix is NOT_REACHED');
                assert.equal(row.detail.values, 'NOT_EVALUATED', 'unreached predicate has no evaluated values');
            }
            else if (ordinal === failedAt) {
                assert.equal(row.detail.result, 'FAILED', 'freeze predicate first failure matches drop');
            }
            else {
                // Only noSeatForRole is conditionally NOT_EVALUATED in the real source:
                // player issuer or absent primary role. Every other prefix slot is PASSED.
                assert.ok(row.detail.result === 'PASSED' || (FREEZE_ORDER[ordinal] === 'noSeatForRole' && row.detail.result === 'NOT_EVALUATED'), 'freeze predicate prefix status');
            }
        }
    }
}
export function assertFullProjectionOrdering(probe, marketValues, feasibilityValues) {
    const market = marketValues, sources = traceSequence(() => probe.calls()).filter((c) => c.name === 'm0SourceArrays').map((c) => c.detail);
    const tupleRows = feasibilityValues.filter(row => row.kind === 'inputTuple');
    const evaluated = traceSequence(() => probe.evaluations()).filter((e) => e.context !== null).map((e) => e.context);
    exactly(tupleRows.map(r => r.context), evaluated, 'every tuple follows the actual evaluation order');
    for (const context of evaluated)
        assert.ok(sources.some((s) => JSON.stringify(s.context) === JSON.stringify(context)), 'every actual evaluation binds an authenticated source-array projection');
    for (const source of sources) {
        const c = source.context;
        const kase = source.cases[c.caseSourceIndex], proposal = source.proposals[c.proposalSourceIndex];
        assert.ok(kase && proposal, 'actual source-array indices exist');
        assert.equal(c.caseKey, kase.key);
        assert.equal(c.proposalKey, proposal.key);
        assert.equal(c.caseOccurrence, source.cases.slice(0, c.caseSourceIndex).filter((x) => x.key === kase.key).length);
        assert.equal(c.proposalOccurrence, source.proposals.slice(0, c.proposalSourceIndex).filter((x) => x.key === proposal.key).length);
        const projected = source.proposals.filter((p) => p.talentId === c.subject);
        if (c.phase === 'freezeProposal')
            assert.equal(projected[c.submittedOrdinal]?.sourceIndex, c.proposalSourceIndex);
    }
    for (const order of market.filter(r => r.phase === 'candidateOrder')) {
        const candidates = order.detail.candidates, rows = market.filter(r => r.phase === 'candidateFeasibility' && r.issuerStudioId === order.issuerStudioId);
        exactly(candidates.map((c) => c.ordinal), candidates.map((_, i) => i), 'complete candidate ordinals');
        exactly(rows.map(r => r.detail.candidateOrdinal), candidates.map((_, i) => i), 'evaluated and skipped candidates preserve full order');
        exactly(rows.map(r => r.detail.attachment), candidates.map((c) => c.attachment), 'candidate attachments preserve full order');
        const reached = rows.filter(r => r.detail.feasibility !== 'NOT_EVALUATED');
        exactly(reached.map(r => r.detail.candidateOrdinal), reached.map((_, i) => i), 'only contiguous candidate prefix is evaluated');
        const refs = sources.filter((s) => s.context.phase === 'authorCandidate' && s.context.issuer === order.issuerStudioId);
        exactly(refs.map((s) => s.context.candidateOrdinal), reached.map(r => r.detail.candidateOrdinal), 'actual author tuple ordinals');
        if (rows.length > reached.length)
            assert.equal(reached.at(-1).detail.feasibility.classification, 'REASONABLY_ACHIEVABLE');
    }
    const start = market.filter(r => r.phase === 'freezeStart');
    if (start.length === 0)
        return;
    assert.equal(start.length, 1, 'one target freeze');
    const freezes = market.filter(r => r.phase === 'freezeProposal'), summary = market.filter(r => r.phase === 'freezeSurvivors');
    assert.equal(summary.length, 1);
    exactly(freezes.map(r => r.detail.proposal), start[0].detail.submitted.map((s) => s.proposal), 'all submitted proposals, source order');
    exactly(start[0].detail.submitted.map((s) => s.submittedOrdinal), freezes.map((_, i) => i), 'full submitted ordinals');
    const freezeSources = sources.filter((s) => s.context.phase === 'freezeProposal');
    assert.equal(freezeSources.length, freezes.length, 'one real attached-feasibility quote slot per submitted proposal');
    // A proposal with no attached promise has no input tuple. Its source slot is
    // still projected by m0Capture; actual evaluations below use only promise slots.
    const freezeRefs = freezeSources.map((s) => ({ digest: s.proposals[s.context.proposalSourceIndex].digest,
        proposalSourceIndex: s.context.proposalSourceIndex, proposalOccurrence: s.context.proposalOccurrence }));
    exactly(freezes.map(row => row.issuerStudioId), freezeSources.map((source) => source.context.issuer), 'freeze issuer binds actual source context');
    assertFreezePredicateOrdering(market, freezes, freezeRefs);
    const dropped = freezes.map((r, i) => ({ r, i })).filter(({ r }) => r.detail.drop !== null);
    const survivors = freezes.map((r, i) => ({ r, i })).filter(({ r }) => r.detail.drop === null);
    exactly(summary[0].detail.submittedOrder, freezes.map((r, i) => ({ submittedOrdinal: i, digest: r.detail.proposal.digest })), 'all submitted order');
    exactly(summary[0].detail.droppedOrder, dropped.map(({ r, i }) => ({ submittedOrdinal: i, digest: r.detail.proposal.digest, reason: r.detail.drop })), 'all dropped order');
    exactly(summary[0].detail.survivorOrder, survivors.map(({ r, i }, survivorOrdinal) => ({ submittedOrdinal: i, survivorOrdinal, digest: r.detail.proposal.digest })), 'all survivor ordinals');
    const survivorRefs = survivors.map(({ i }) => freezeRefs[i]);
    const notReached = market.filter(r => r.phase === 'chooserNotReached');
    if (notReached.length) {
        assert.equal(notReached.length, 1);
        exactly(notReached[0].detail.survivors, survivorRefs, 'not-reached survivor projection');
        return;
    }
    const bands = market.filter(r => r.phase === 'bands');
    exactly(bands.map(r => ({ digest: r.detail.digest, proposalSourceIndex: r.detail.proposalSourceIndex, proposalOccurrence: r.detail.proposalOccurrence })), survivorRefs, 'complete chooser source order');
    exactly(bands.map(r => r.detail.survivorOrdinal), survivors.map((_, i) => i), 'complete chooser ordinals');
    const dominance = market.filter(r => r.phase === 'dominance');
    assert.equal(dominance.length, 1);
    const d = dominance[0].detail, liveSet = new Set(d.live.map(key));
    exactly(d.submitted, survivorRefs, 'chooser input is the freeze survivor set');
    exactly(d.live, survivorRefs.filter(r => liveSet.has(key(r))), 'live subset preserves source order');
    exactly(d.removed, survivorRefs.filter(r => !liveSet.has(key(r))), 'removed complement preserves source order');
    exactly(d.pool, d.live.length ? d.live : survivorRefs, 'actual pool fallback');
    const scores = market.filter(r => r.phase === 'copelandScore'), pairs = market.filter(r => r.phase === 'pairwise');
    exactly(scores.map(r => r.detail.proposal), d.pool, 'all score slots in pool order');
    exactly(pairs.map(r => [r.detail.proposal, r.detail.against]), d.pool.flatMap((p) => d.pool.filter((q) => key(p) !== key(q)).map((q) => [p, q])), 'complete pairwise nested-loop order');
    const best = Math.max(...scores.map(r => r.detail.wins));
    let tied = scores.filter(r => r.detail.wins === best).map(r => r.detail.proposal);
    const priority = market.filter(r => r.phase === 'priorityOrder'), priorityRows = market.filter(r => r.phase === 'priorityTie');
    if (priority.length) {
        assert.equal(priority.length, 1);
        exactly(priority[0].detail.initialTie, tied, 'initial priority tie');
    }
    for (const [i, row] of priorityRows.entries()) {
        assert.equal(row.detail.priorityOrdinal, i);
        assert.equal(row.detail.key, priority[0].detail.order[i]);
        exactly(row.detail.before, tied, 'priority before order');
        exactly(row.detail.candidateBands.map((b) => b.proposal), tied, 'priority band order');
        tied = row.detail.candidateBands.filter((b) => b.band === row.detail.top).map((b) => b.proposal);
        exactly(row.detail.after, tied, 'priority subset order');
    }
    for (const row of market.filter(r => r.phase === 'submissionTie')) {
        exactly(row.detail.before, tied, 'submission before order');
        exactly(row.detail.submittedWeeks.map((s) => s.proposal), tied, 'submission week projection');
        tied = row.detail.submittedWeeks.filter((s) => s.submittedWeek === row.detail.earliest).map((s) => s.proposal);
        exactly(row.detail.after, tied, 'submission subset order');
    }
    for (const row of market.filter(r => r.phase === 'incumbentTie')) {
        exactly(row.detail.before, tied, 'incumbent before order');
        const incumbentSet = new Set(row.detail.incumbent.map(key));
        exactly(row.detail.incumbent, tied.filter((r) => incumbentSet.has(key(r))), 'incumbent subset order');
        if (row.detail.incumbent.length)
            tied = row.detail.incumbent;
        exactly(row.detail.after, tied, 'incumbent after order');
    }
    const stages = market.filter(r => r.phase === 'chooserStages'), terminal = market.filter(r => r.phase === 'chooserTerminal');
    assert.equal(stages.length, 1);
    assert.equal(terminal.length, 1);
    exactly(stages[0].detail.finalTie, tied, 'final chooser tie order');
    const t = terminal[0].detail;
    if (tied.length === 1) {
        exactly(t.winner, tied[0], 'winner is the sole final tie member');
        exactly(t.others, survivorRefs.filter(r => key(r) !== key(t.winner)), 'all other survivor order');
    }
    else {
        assert.equal(t.winner, null);
        exactly(t.finalTie, tied, 'declined tie order');
        assert.equal(t.tiedCount, tied.length);
    }
}
// Same actual fullbody witness/evaluation predicate, shared with pure controls.
export function assertNativeEvaluationBinding(codec, physicalRow, evaluations) {
    const detail = codec.legacyRow(physicalRow).detail;
    let matched = false;
    for (const e of evaluations) {
        if (JSON.stringify(e.context) === JSON.stringify(physicalRow.context)
            && e.canonicalInputs === detail.canonicalInputs
            && e.result.inputsDigest === detail.inputsDigest
            && new TextEncoder().encode(e.canonicalInputs).length === detail.inputBytes) {
            matched = true;
            break;
        }
    }
    assert.ok(matched, 'witness is the actual full-body evaluation tuple');
}
