import { createTraceStore } from './m0TraceCodec.mjs';
let active = false, enabled = true, fault = null;
let store = createTraceStore(), acceptedCalls = 0;
let boundary = null;
let faultReached = null;
export const m0WiringProbe = Object.freeze({
    captureEnabled: () => enabled,
    call(name, detail = null) {
        if (!active)
            return;
        if (store.appendCall({ sequence: acceptedCalls, name, detail }))
            acceptedCalls++;
    },
    evaluation(inputs, canonicalInputs, result, context) {
        if (!active)
            return;
        store.appendEvaluation({ inputs, canonicalInputs, result, context });
    },
    beforeAdvance(state) { boundary?.(state); },
    setBoundaryConsumer(value) { boundary = value; },
    begin(capture, requestedFault = null) {
        store = createTraceStore();
        acceptedCalls = 0;
        active = true;
        enabled = capture;
        fault = requestedFault;
        faultReached = null;
    },
    consumeFault(phase) {
        if (!active || fault === null || (fault === 'ordinary-refusal' ? phase !== 'submitProposal' : phase !== 'draftPrice'))
            return null;
        const kind = fault;
        fault = null;
        faultReached = { kind, phase };
        return kind;
    },
    end() {
        active = false;
        enabled = true;
        fault = null;
        const trace = store.snapshot();
        return Object.freeze({ ...trace, faultReached, bytes: trace.encodedBytes });
    },
});
