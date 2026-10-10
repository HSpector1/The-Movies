// Finite synthetic witness-consumer inputs only. No game or fixture producer imports.
import assert from 'node:assert/strict';
import { createTraceStore } from './m0TraceCodec.mjs';
import { assertFullProjectionOrdering, assertFreezePredicateOrdering } from './ordering.mjs';
function apply(args, edits) {
    const out = structuredClone(args);
    for (const edit of edits) {
        assert.ok(edit.path.length > 0);
        let owner = out;
        for (const segment of edit.path.slice(0, -1))
            owner = owner[segment];
        const at = edit.path.at(-1);
        if (edit.op === 'set')
            owner[at] = structuredClone(edit.value);
        else if (edit.op === 'remove') {
            if (Array.isArray(owner))
                owner.splice(Number(at), 1);
            else
                delete owner[at];
        }
        else {
            assert.ok(Array.isArray(owner) && Number.isInteger(edit.other));
            const index = Number(at), before = owner[index];
            owner[index] = owner[edit.other];
            owner[edit.other] = before;
        }
    }
    return out;
}
export function runOrderingSourceControls(packet) {
    assert.equal(packet.schema, '1370-m0-ordering-synthetic-source-inputs/v1');
    assert.equal(packet.claim, 'SYNTHETIC_WITNESS_CONSUMER_INPUTS_NOT_GAME_STATES_OR_OBSERVED_RESULTS');
    return packet.cases.map(test => {
        const base = packet.bases[test.base];
        assert.ok(base);
        const args = apply(base.args, test.edits);
        // Synthetic envelope only, AFTER original edits; no gameplay fixture claim.
        // These operations are outside assert.throws: codec failure is never RED.
        if (base.method === 'author') {
            const probe = args.probe, store = createTraceStore();
            for (const [sequence, row] of probe.calls.entries())
                assert.equal(store.appendCall({ sequence, name: row.name, detail: row.detail === undefined ? null : row.detail }), true);
            for (const row of probe.evaluations)
                assert.equal(store.appendEvaluation({ inputs: [], canonicalInputs: '[]', result: null, context: row.context }), true);
            args.probe = store.snapshot();
        }
        const run = () => base.method === 'author'
            ? assertFullProjectionOrdering(args.probe, args.marketValues, args.feasibilityValues)
            : assertFreezePredicateOrdering(args.marketValues, args.freezeValues, args.refs);
        if (test.expected === 'GREEN')
            run();
        else {
            assert.ok(test.assertion);
            assert.throws(run, error => error instanceof assert.AssertionError && error.message.includes(test.assertion), `${test.id}: intended consumer assertion, no loader/operational error substitution`);
        }
        return { id: test.id, expected: test.expected };
    });
}
