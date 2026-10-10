let active = false, enabled = true, overflow = false, fault = null;
let calls = [], evaluations = [], bytes = 0;
let boundary = null;
let faultReached = null;
const MAX_ENTRIES = 16384, MAX_ROW_BYTES = 64 * 1024, MAX_TOTAL_BYTES = 2 * 1024 * 1024;
function bounded(value) {
  if (overflow) return void 0;
  const raw = JSON.stringify(value);
  const n = new TextEncoder().encode(raw + "\n").length;
  if (calls.length + evaluations.length >= MAX_ENTRIES || n > MAX_ROW_BYTES || bytes + n > MAX_TOTAL_BYTES) {
    overflow = true;
    return void 0;
  }
  bytes += n;
  return JSON.parse(raw);
}
export const m0WiringProbe = Object.freeze({
  captureEnabled: () => enabled,
  call(name, detail = null) {
    if (!active) return;
    const row = bounded({ sequence: calls.length, name, detail });
    if (row !== void 0) calls.push(row);
  },
  evaluation(inputs, canonicalInputs, result, context) {
    if (!active) return;
    const row = bounded({ inputs, canonicalInputs, result, context });
    if (row !== void 0) evaluations.push(row);
  },
  beforeAdvance(state) {
    boundary?.(state);
  },
  setBoundaryConsumer(value) {
    boundary = value;
  },
  begin(capture, requestedFault = null) {
    active = true;
    enabled = capture;
    overflow = false;
    calls = [];
    evaluations = [];
    bytes = 0;
    fault = requestedFault;
    faultReached = null;
  },
  consumeFault(phase) {
    if (!active || fault === null || (fault === "ordinary-refusal" ? phase !== "submitProposal" : phase !== "draftPrice")) return null;
    const kind = fault;
    fault = null;
    faultReached = { kind, phase };
    return kind;
  },
  end() {
    active = false;
    enabled = true;
    fault = null;
    return { calls, evaluations, overflow, faultReached, bytes };
  }
});
