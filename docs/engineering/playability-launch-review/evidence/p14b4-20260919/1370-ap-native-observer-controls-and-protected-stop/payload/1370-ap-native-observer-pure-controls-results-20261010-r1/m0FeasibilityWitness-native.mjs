import { boundedCanonicalBytes, freezeOwnedPhysicalRow, NATIVE_ROW_SCHEMA } from './m0NativeObserverRows.mjs';
const MAX_ROWS = 512;
const MAX_ROW_BYTES = 16 * 1024;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
function validateContext(context) {
    if (!Number.isInteger(context.week) || context.week < 0
        || !Number.isInteger(context.caseOccurrence) || context.caseOccurrence < 0
        || !Number.isInteger(context.caseSourceIndex) || context.caseSourceIndex < 0
        || !Number.isInteger(context.proposalOccurrence) || context.proposalOccurrence < 0
        || !Number.isInteger(context.proposalSourceIndex) || context.proposalSourceIndex < 0
        || (context.phase === 'authorCandidate'
            ? !Number.isInteger(context.candidateOrdinal) || context.candidateOrdinal < 0
                || context.submittedOrdinal !== undefined || context.survivorOrdinal !== undefined
            : context.phase === 'freezeProposal'
                ? !Number.isInteger(context.submittedOrdinal) || context.submittedOrdinal < 0
                    || context.candidateOrdinal !== undefined || context.survivorOrdinal !== undefined
                : context.phase === 'chooserBand'
                    ? !Number.isInteger(context.survivorOrdinal) || context.survivorOrdinal < 0
                        || context.candidateOrdinal !== undefined || context.submittedOrdinal !== undefined
                    : true)
        || (context.era !== 'H' && context.era !== 'M0')
        || typeof context.subject !== 'string' || !context.subject
        || typeof context.issuer !== 'string' || !context.issuer
        || typeof context.caseKey !== 'string' || !context.caseKey
        || typeof context.proposalKey !== 'string' || !context.proposalKey) {
        throw new Error('M0 feasibility invalid context');
    }
}
export function createM0FeasibilitySink({ codec, latch }) {
    const rows = [];
    let totalBytes = 0;
    let recording = false;
    const occurrence = new Map();
    return Object.freeze({
        capture(context) {
            latch.throwIfFailed();
            try {
                validateContext(context);
                const frozenContext = Object.freeze(JSON.parse(JSON.stringify(context)));
                return Object.freeze({
                    context: frozenContext,
                    record(kind, detail) {
                        latch.throwIfFailed();
                        if (recording) {
                            const error = new Error('M0 feasibility reentrant capture');
                            latch.record(error);
                            throw error;
                        }
                        recording = true;
                        try {
                            if (rows.length >= MAX_ROWS)
                                throw new Error('M0 feasibility row bound exceeded');
                            if (kind === 'inputTuple' && detail && typeof detail === 'object') {
                                const canonical = Object.getOwnPropertyDescriptor(detail, 'canonicalInputs');
                                if (canonical && Object.hasOwn(canonical, 'value') && typeof canonical.value === 'string'
                                    && boundedCanonicalBytes(canonical.value) > MAX_ROW_BYTES)
                                    throw new Error('M0 feasibility row byte bound exceeded');
                            }
                            const physicalDetail = kind === 'inputTuple' ? codec.encodeInputDetail(detail) : detail;
                            const identity = JSON.stringify([frozenContext.week, frozenContext.caseKey,
                                frozenContext.caseOccurrence, frozenContext.proposalKey, frozenContext.proposalOccurrence,
                                frozenContext.phase, frozenContext.candidateOrdinal ?? null,
                                frozenContext.submittedOrdinal ?? null, frozenContext.survivorOrdinal ?? null, kind]);
                            const nth = occurrence.get(identity) ?? 0;
                            const row = { schema: NATIVE_ROW_SCHEMA, sequence: rows.length, occurrence: nth,
                                context: frozenContext, kind, detail: physicalDetail };
                            const encoded = JSON.stringify(row);
                            if (encoded === undefined)
                                throw new Error('M0 feasibility unserializable row');
                            const bytes = new TextEncoder().encode(encoded + '\n').length;
                            if (bytes > MAX_ROW_BYTES)
                                throw new Error('M0 feasibility row byte bound exceeded');
                            if (totalBytes + bytes > MAX_TOTAL_BYTES)
                                throw new Error('M0 feasibility total byte bound exceeded');
                            const copy = JSON.parse(encoded);
                            rows.push(freezeOwnedPhysicalRow(copy));
                            totalBytes += bytes;
                            occurrence.set(identity, nth + 1);
                        }
                        catch (error) {
                            latch.record(error);
                            throw error;
                        }
                        finally {
                            recording = false;
                        }
                    },
                });
            }
            catch (error) {
                latch.record(error);
                throw error;
            }
        },
        rows: () => {
            latch.throwIfFailed();
            try {
                return Object.freeze(rows.slice());
            }
            catch (error) {
                latch.record(error);
                throw error;
            }
        },
        throwIfFailed: () => latch.throwIfFailed(),
    });
}
