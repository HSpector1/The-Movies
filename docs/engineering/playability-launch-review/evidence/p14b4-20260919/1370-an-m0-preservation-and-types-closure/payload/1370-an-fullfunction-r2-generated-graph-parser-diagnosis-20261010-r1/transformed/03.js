import assert from "node:assert/strict";
import { assertFullProjectionOrdering } from "../ordering.js";
import {
  advanceTalentMarketWeek,
  drainM0MarketDecisionRows,
  drainM0FeasibilityRows,
  rivalProposalTrigger,
  m0WiringTestApi
} from "m0:src/core/talentMarket.js";
import { m0WiringProbe } from "m0:src/core/m0WiringProbe.js";
const SUBJECT = "person-studio-aca408ec-r01-0";
const encode = (value) => JSON.stringify(value);
const clone = (value) => structuredClone(value);
function sortedInputs(inputs) {
  return JSON.stringify(inputs, (_key, value) => value === null || typeof value !== "object" || Array.isArray(value) ? value : Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)));
}
function arm(boundary, capture) {
  assert.ok(["tick.before.advanceTalentMarketWeek", "synthetic.valid-market-state"].includes(boundary.sourcePhase));
  const state = clone(boundary.state), before = encode(state);
  m0WiringTestApi.reset();
  m0WiringProbe.begin(capture);
  try {
    const after = advanceTalentMarketWeek(state);
    const probe = m0WiringProbe.end(), market = drainM0MarketDecisionRows(), feasibility = drainM0FeasibilityRows();
    assert.equal(probe.overflow, false, "complete bounded helper/RNG trace, never dropped evidence");
    assert.equal(encode(state), before, "full caller input is unchanged");
    for (const row of probe.evaluations) assert.equal(sortedInputs(row.inputs), row.canonicalInputs, "actual canonical tuple");
    for (const value of feasibility) {
      const row = value;
      if (row.kind !== "inputTuple") continue;
      const evaluations = probe.evaluations.filter((e) => encode(e.context) === encode(row.context));
      assert.ok(evaluations.some((e) => e.canonicalInputs === row.detail.canonicalInputs && e.result.inputsDigest === row.detail.inputsDigest), "witness is the actual full-body evaluation tuple");
    }
    if (capture) assertFullProjectionOrdering(probe, market, feasibility);
    return { after, probe, market, feasibility };
  } finally {
    m0WiringProbe.end();
    m0WiringTestApi.reset();
  }
}
function pair(boundary) {
  const off = arm(boundary, false), on = arm(boundary, true);
  assert.equal(encode(on.after), encode(off.after), "all policy output, including promises/receipts/employment and RNG");
  assert.equal(encode(on.probe.calls), encode(off.probe.calls), "helper and RNG call order/counts/stream keys");
  const semantic = (rows) => rows.map(({ inputs, canonicalInputs, result }) => ({ inputs, canonicalInputs, result }));
  assert.equal(encode(semantic(on.probe.evaluations)), encode(semantic(off.probe.evaluations)), "actual receipt bytes/inputs unaffected");
  assert.equal(off.market.length, 0);
  assert.equal(off.feasibility.length, 0);
  return on;
}
function callsInOrder(names, wanted) {
  let at = 0;
  for (const name of names) if (name === wanted[at]) at++;
  assert.equal(at, wanted.length, "complete real full-body caller chain was reached");
}
function assertOrdinals(rows) {
  for (const value of rows) {
    const row = value;
    const c = row.context;
    for (const n of [c.caseSourceIndex, c.caseOccurrence, c.proposalSourceIndex, c.proposalOccurrence]) assert.ok(Number.isInteger(n) && n >= 0);
    const ordinal = c.phase === "authorCandidate" ? c.candidateOrdinal : c.phase === "freezeProposal" ? c.submittedOrdinal : c.survivorOrdinal;
    assert.ok(Number.isInteger(ordinal) && ordinal >= 0);
  }
}
export function runFullBodyWiringControls(fixtures) {
  assert.equal(fixtures.author196.state.market.tick, 196);
  assert.equal(fixtures.freeze208.state.market.tick, 208);
  const author = pair(fixtures.author196), freeze = pair(fixtures.freeze208);
  callsInOrder(author.probe.calls.map((c) => c.name), ["advanceTalentMarketWeek", "submitProposal", "proposalDraft", "authorRivalPromise", "promiseFeasibility", "receipt"]);
  callsInOrder(freeze.probe.calls.map((c) => c.name), ["advanceTalentMarketWeek", "settleCase", "attachedFeasibility", "promiseFeasibility", "receipt"]);
  assert.ok(author.feasibility.length > 0);
  assert.ok(freeze.feasibility.length > 0);
  assertOrdinals(author.feasibility);
  assertOrdinals(freeze.feasibility);
  assert.ok(fixtures.offWeek.state.market.tick !== 196 && fixtures.offWeek.state.market.tick !== 208);
  const other = pair(fixtures.offWeek);
  assert.equal(other.market.length, 0);
  assert.equal(other.feasibility.length, 0);
  assert.equal(fixtures.opportunity196.state.market.tick, 196);
  assert.equal(fixtures.opportunity208.state.market.tick, 208);
  assert.equal(fixtures.opportunity196.sourcePhase, "synthetic.valid-market-state");
  assert.equal(fixtures.opportunity208.sourcePhase, "synthetic.valid-market-state");
  for (const fixture of [fixtures.opportunity196, fixtures.opportunity208]) {
    assert.ok(fixture.state.market.tick === 196 || fixture.state.market.tick === 208);
    const result = pair(fixture);
    const phase = fixture.state.market.tick === 196 ? "authorCandidate" : "freezeProposal";
    const targetEvaluations = result.probe.evaluations.filter((e) => {
      const c = e.context;
      const inputs = e.inputs;
      return c?.subject === SUBJECT && c.phase === phase && ["SPECIFIC_PROJECT", "PREFERRED_GENRE_OPPORTUNITY"].includes(inputs[0]);
    });
    assert.ok(targetEvaluations.length > 0, "target caller, phase and real opportunity tuple are reached");
    assert.ok(result.probe.calls.some((c) => {
      const d = c.detail;
      return c.name === "opportunityAssessment" && d?.week === fixture.state.market.tick && d.subject === SUBJECT && targetEvaluations.some((e) => e.inputs[0] === d.family);
    }), "actual target opportunity evaluator invocation");
    callsInOrder(result.probe.calls.map((c) => c.name), fixture.state.market.tick === 196 ? ["advanceTalentMarketWeek", "authorRivalPromise", "promiseFeasibility", "opportunityAssessment"] : ["advanceTalentMarketWeek", "settleCase", "attachedFeasibility", "promiseFeasibility", "opportunityAssessment"]);
  }
  for (const [kind, fixture] of [["subject", fixtures.offSubject], ["issuer", fixtures.offIssuer196]]) {
    assert.equal(fixture.state.market.tick, 196);
    if (kind === "subject") assert.notEqual(fixture.descriptor.talentId, SUBJECT);
    else assert.ok(!["studio-aca408ec-r01", "studio-aca408ec-r02", "studio-aca408ec-r03"].includes(fixture.business.studioId));
    assert.ok(fixture.state.hollywood);
    const outcomes = [];
    for (const capture of [false, true]) {
      const state = clone(fixture.state);
      m0WiringTestApi.reset();
      m0WiringProbe.begin(capture);
      try {
        const value = rivalProposalTrigger(state, state.hollywood, clone(fixture.business), clone(fixture.descriptor), 196);
        const trace = m0WiringProbe.end();
        assert.equal(trace.overflow, false);
        assert.equal(drainM0MarketDecisionRows().length, 0, "trigger-specific off-target filter");
        outcomes.push({ value, calls: trace.calls, rngState: state.rngState });
      } finally {
        m0WiringProbe.end();
        m0WiringTestApi.reset();
      }
    }
    assert.deepEqual(outcomes[0], outcomes[1]);
  }
  for (const [kind, message] of [
    ["row-cap", "row bound exceeded"],
    ["row-byte-cap", "row byte bound exceeded"],
    ["total-byte-cap", "total byte bound exceeded"],
    ["serialization", "recording failed"]
  ]) {
    m0WiringTestApi.reset();
    m0WiringProbe.begin(true, kind);
    try {
      try {
        assert.throws(() => advanceTalentMarketWeek(clone(fixtures.author196.state)), (error) => error instanceof m0WiringTestApi.M0ObserverError && error.message.includes(message), "actual recorder failure must cross actual submitProposal catch");
      } catch (error) {
        if (error instanceof assert.AssertionError) Object.defineProperty(error, "m0FullBodyFaultKind", { value: kind });
        throw error;
      }
      const trace = m0WiringProbe.end();
      assert.equal(trace.overflow, false);
      assert.deepEqual(trace.faultReached, { kind, phase: "draftPrice" });
      callsInOrder(trace.calls.map((c) => c.name), ["advanceTalentMarketWeek", "submitProposal", "proposalDraft"]);
    } finally {
      m0WiringProbe.end();
      m0WiringTestApi.reset();
    }
  }
  m0WiringTestApi.reset();
  m0WiringProbe.begin(true, "ordinary-refusal");
  try {
    advanceTalentMarketWeek(clone(fixtures.author196.state));
    const trace = m0WiringProbe.end();
    assert.equal(trace.overflow, false);
    assert.deepEqual(trace.faultReached, { kind: "ordinary-refusal", phase: "submitProposal" });
    const rows = drainM0MarketDecisionRows();
    assert.ok(rows.some((row) => row.phase === "issuerAttempt" && row.detail.outcome === "SUBMISSION_REFUSED" && row.detail.refusal === "M0 wiring ordinary submission refusal fixture"), "ordinary gameplay refusal stays a refusal");
  } finally {
    m0WiringProbe.end();
    m0WiringTestApi.reset();
  }
}
