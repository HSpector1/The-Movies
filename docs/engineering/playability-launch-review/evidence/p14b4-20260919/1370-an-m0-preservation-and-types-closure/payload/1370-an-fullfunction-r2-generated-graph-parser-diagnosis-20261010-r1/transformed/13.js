import { m0WiringProbe as __m0WiringProbe } from "./m0WiringProbe.js";
import { productionCompanyTalentIds } from "./productionPeople.js";
import { initializeHollywood, industryBusyTalentIds, rivalEmployment } from "./hollywood.js";
import { clamp } from "./math.js";
import { stream } from "./rng.js";
import { activeScriptWriterAssignments } from "./scriptDevelopment.js";
import { SCIENTIST_ANNUAL_SALARY, TUNING } from "./tuning.js";
import { freelancerFeeMultiplier } from "./facilityEffects.js";
import { contractEndRefusal, lifecycleStatus, withdrawnPersonIds } from "./careerLifecycle.js";
import { salaryCurve } from "./worldgen.js";
const iround = (x) => Math.round(x);
const DRAFT_ROLES = [
  { role: "actor", count: "HIRING_DRAFT_ACTORS" },
  { role: "director", count: "HIRING_DRAFT_DIRECTORS" },
  { role: "writer", count: "HIRING_DRAFT_WRITERS" },
  { role: "craft", count: "HIRING_DRAFT_CRAFT" }
];
export const FOUNDING_MINIMUMS = {
  actor: TUNING.HIRING_MIN_ACTORS,
  director: TUNING.HIRING_MIN_DIRECTORS,
  writer: TUNING.HIRING_MIN_WRITERS,
  craft: TUNING.HIRING_MIN_CRAFT,
  scientist: 0
};
export function employmentEngaged(state) {
  return state.founding !== null || state.contracts.length > 0;
}
export function economyEngaged(state) {
  return state.economyEngagedEver;
}
export function canAfford(state, amount) {
  __m0WiringProbe.call("canAfford");
  const after = state.studio.cash - amount;
  if (after >= 0) return { ok: true };
  return {
    ok: false,
    reason: `Insufficient cash — this ${Math.round(amount)} commitment would leave cash at ${Math.round(after)}. New commitments require cash to stay at or above zero (unavoidable weekly payroll and overhead may still run it negative).`
  };
}
export function activeContract(state, talentId, week = state.market.tick) {
  return state.contracts.find(
    (c) => c.talentId === talentId && c.startWeek <= week && week < c.endWeekExclusive
  );
}
export function isContracted(state, talentId, week) {
  return activeContract(state, talentId, week) !== void 0;
}
export function activeProductionCompanyTalentIds(state) {
  return productionCompanyTalentIds(state.studio.activeProductions);
}
export function seatingProduction(state, talentId) {
  return state.studio.activeProductions.find((p) => productionCompanyTalentIds([p]).has(talentId));
}
export function activeWritingAssignmentIds(state) {
  const ids = /* @__PURE__ */ new Set();
  for (const assignment of activeScriptWriterAssignments(
    state.scriptDevelopment,
    state.concepts
  )) {
    ids.add(assignment.talentId);
  }
  return ids;
}
export function creditedWriterIds(state) {
  const ids = /* @__PURE__ */ new Set();
  for (const p of state.studio.activeProductions) ids.add(p.writerId);
  return ids;
}
export function busyTalentIds(state) {
  const busy = activeProductionCompanyTalentIds(state);
  for (const id of activeWritingAssignmentIds(state)) busy.add(id);
  for (const id of industryBusyTalentIds(state.hollywood)) busy.add(id);
  for (const project of state.technology?.projects ?? []) {
    if (project.status !== "active") continue;
    for (const seat of project.seats) {
      if (seat.releasedWeek === null && activeContract(state, seat.talentId) !== void 0) busy.add(seat.talentId);
    }
  }
  return busy;
}
export function weeklySalary(annualSalary) {
  return iround(annualSalary / TUNING.TICKS_PER_YEAR);
}
export function guaranteedComp(contract, week) {
  const remainingWeeks = Math.max(0, contract.endWeekExclusive - week);
  return weeklySalary(contract.annualSalary) * remainingWeeks;
}
export function terminationCost(contract, week) {
  const remainingWeeks = Math.max(0, contract.endWeekExclusive - week);
  return weeklySalary(contract.annualSalary) * Math.min(remainingWeeks, TUNING.HIRING_TERMINATION_CAP_WEEKS);
}
export function legacyTerminationCost(contract, week) {
  return Math.round(TUNING.HIRING_TERMINATION_FRACTION * guaranteedComp(contract, week));
}
export const PRE_V28_TERMINATION_LAW = (contract, endedWeek) => [legacyTerminationCost(contract, endedWeek), terminationCost(contract, endedWeek)];
export function weeklyPayroll(state, week = state.market.tick) {
  let total = 0;
  for (const c of state.contracts) {
    if (c.startWeek <= week && week < c.endWeekExclusive) total += weeklySalary(c.annualSalary);
  }
  return total;
}
export function annualPayroll(state, week = state.market.tick) {
  let total = 0;
  for (const c of state.contracts) {
    if (c.startWeek <= week && week < c.endWeekExclusive) total += c.annualSalary;
  }
  return total;
}
export function renewalWindowOpen(contract, week) {
  const remaining = contract.endWeekExclusive - week;
  return remaining > 0 && remaining <= TUNING.HIRING_RENEWAL_WINDOW_WEEKS;
}
function ageFactor(age) {
  const d = (age - TUNING.CONTRACT_AGE_PRIME) / TUNING.CONTRACT_AGE_SPREAD;
  const bell = Math.max(0, 1 - d * d);
  return TUNING.CONTRACT_AGE_FACTOR_MIN + (1 - TUNING.CONTRACT_AGE_FACTOR_MIN) * bell;
}
export function offerForTalent(seed, talent, termWeeks, week) {
  const term = clamp(termWeeks, TUNING.CONTRACT_MIN_WEEKS, TUNING.CONTRACT_MAX_WEEKS);
  const lengthFactor = TUNING.CONTRACT_LENGTH_FACTOR[Math.max(...TUNING.CONTRACT_TERM_OPTIONS.filter((t) => t <= term))] ?? 1;
  const jitterS = stream(seed, "hiring", `offer-${talent.id}`);
  const jitter = 1 + (jitterS.next() * 2 - 1) * TUNING.CONTRACT_SCARCITY_JITTER;
  const annual = talent.role === "scientist" ? SCIENTIST_ANNUAL_SALARY : iround(
    salaryCurve(talent) * TUNING.CONTRACT_ANNUAL_MULT * lengthFactor * ageFactor(talent.age) * jitter
  );
  const signingBonus = iround(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION);
  return {
    talentId: talent.id,
    annualSalary: annual,
    signingBonus,
    termWeeks: term,
    startWeek: week,
    endWeekExclusive: week + term
  };
}
export function contractOffer(state, talentId, termWeeks, week = state.market.tick) {
  __m0WiringProbe.call("contractOffer");
  const talent = state.talent.find((t) => t.id === talentId);
  if (talent === void 0) {
    throw new Error(`contractOffer: unknown talent id "${talentId}"`);
  }
  return offerForTalent(state.seed, talent, termWeeks, week);
}
export function contractOfferOptions(state, talentId, week = state.market.tick) {
  return TUNING.CONTRACT_TERM_OPTIONS.map((t) => contractOffer(state, talentId, t, week));
}
export function freelancerFee(state, talent) {
  return iround(
    salaryCurve(talent) * TUNING.FREELANCER_FEE_PREMIUM * freelancerFeeMultiplier(state)
  );
}
export function assignmentProjectCost(state, talentId) {
  if (!economyEngaged(state)) {
    const t2 = state.talent.find((candidate) => candidate.id === talentId);
    return t2 ? t2.salary : 0;
  }
  if (isContracted(state, talentId)) return 0;
  const t = state.talent.find((candidate) => candidate.id === talentId);
  return t ? freelancerFee(state, t) : 0;
}
function signableUniverse(state) {
  const busy = busyTalentIds(state);
  const withdrawn = withdrawnPersonIds(state);
  return state.talent.filter((t) => !busy.has(t.id) && !withdrawn.has(t.id) && !isContracted(state, t.id) && rivalEmployment(state, t.id, state.market.tick) === null);
}
function sampleIds(pool, n, s) {
  const work = pool.slice();
  const take = Math.min(n, work.length);
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(s.next() * (work.length - i));
    const tmp = work[i];
    work[i] = work[j];
    work[j] = tmp;
  }
  return work.slice(0, take).map((t) => t.id);
}
function marketEpoch(week) {
  return Math.floor(week / TUNING.HIRING_MARKET_ROTATION_WEEKS);
}
export function freelancerMarketIds(state, week = state.market.tick) {
  if (state.founding !== null) return [];
  const epoch = marketEpoch(week);
  const pool = signableUniverse(state).filter((t) => t.role !== "scientist");
  const s = stream(state.seed, "hiring", `freelancers-${epoch}`);
  return sampleIds(pool, TUNING.HIRING_FREELANCER_MARKET_SIZE, s);
}
export function hiringMarketIds(state, week = state.market.tick) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const withdrawn = withdrawnPersonIds(state);
  for (const id of state.freeAgents) {
    if (!seen.has(id) && !withdrawn.has(id) && !isContracted(state, id) && rivalEmployment(state, id, week) === null) {
      seen.add(id);
      out.push(id);
    }
  }
  const epoch = marketEpoch(week);
  const universe = signableUniverse(state);
  const pool = universe.filter((t) => t.role !== "scientist" && !seen.has(t.id));
  const s = stream(state.seed, "hiring", `market-${epoch}`);
  for (const id of sampleIds(pool, TUNING.HIRING_MARKET_SIZE, s)) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  for (const person of universe) {
    if (person.role === "scientist" && !seen.has(person.id)) out.push(person.id);
  }
  return out.filter((id) => contractEndRefusal(state, id, week + TUNING.CONTRACT_MIN_WEEKS) === null);
}
export function employmentStatus(state, talentId, week = state.market.tick) {
  if (rivalEmployment(state, talentId, week)) return "unavailable";
  if (isContracted(state, talentId, week)) return "contracted";
  if (busyTalentIds(state).has(talentId)) return "engagedFreelancer";
  if (freelancerMarketIds(state, week).includes(talentId)) return "availableFreelancer";
  if (hiringMarketIds(state, week).includes(talentId)) return "freeAgent";
  return "unavailable";
}
export function assignableForFilm(state, talentId, week = state.market.tick) {
  const status = lifecycleStatus(state, talentId);
  if (status === "finishing_commitments" || status === "retired") return false;
  return isContracted(state, talentId, week) || freelancerMarketIds(state, week).includes(talentId);
}
export function rosterTalent(state, week = state.market.tick) {
  return state.talent.filter((t) => isContracted(state, t.id, week));
}
export function rosterCoverage(state, week = state.market.tick) {
  const out = { actor: 0, director: 0, writer: 0, craft: 0, scientist: 0 };
  for (const t of rosterTalent(state, week)) out[t.role] += 1;
  return out;
}
export function foundingMinimumsMet(state) {
  const cov = rosterCoverage(state);
  return cov.actor >= FOUNDING_MINIMUMS.actor && cov.director >= FOUNDING_MINIMUMS.director && cov.writer >= FOUNDING_MINIMUMS.writer && cov.craft >= FOUNDING_MINIMUMS.craft;
}
export function foundingGaps(state) {
  const cov = rosterCoverage(state);
  return {
    actor: Math.max(0, FOUNDING_MINIMUMS.actor - cov.actor),
    director: Math.max(0, FOUNDING_MINIMUMS.director - cov.director),
    writer: Math.max(0, FOUNDING_MINIMUMS.writer - cov.writer),
    craft: Math.max(0, FOUNDING_MINIMUMS.craft - cov.craft),
    scientist: 0
  };
}
export function correlateConceptCost(concepts) {
  const n = concepts.length;
  if (n < 2) return concepts;
  const costsAsc = [...concepts.map((c) => c.baseNegativeCost)].sort((a, b) => a - b);
  const strengthRank = new Array(n);
  concepts.map((c, i) => ({ i, s: c.baselineStrength })).sort((a, b) => a.s - b.s || a.i - b.i).forEach((o, rank) => {
    strengthRank[o.i] = rank;
  });
  const w = TUNING.SCRIPT_COST_POTENTIAL_CORRELATION;
  return concepts.map((c, i) => ({
    ...c,
    baseNegativeCost: Math.round(c.baseNegativeCost * (1 - w) + costsAsc[strengthRank[i]] * w)
  }));
}
function beginFoundingDraft(state) {
  if (state.founding !== null) return state;
  const applicantIds = [];
  for (const { role, count } of DRAFT_ROLES) {
    const pool = state.talent.filter((t) => t.role === role);
    const s = stream(state.seed, "hiring", `draft-${role}`);
    for (const id of sampleIds(pool, TUNING[count], s)) applicantIds.push(id);
  }
  return {
    ...state,
    // Engaged boundary: correlate script price with potential. M0A never reaches here, so the
    // non-engaged concept values (and the SaveFileV1 byte-identity corpus) are unchanged.
    concepts: correlateConceptCost(state.concepts),
    founding: {
      applicantIds,
      budget: TUNING.HIRING_FOUNDING_BUDGET,
      spentBonus: 0
    },
    // D-17A/R2 — opening the founding draft is the moment this becomes a player studio.
    // Monotonic: nothing ever sets this back to false.
    economyEngagedEver: true
  };
}
export function beginFounding(state) {
  return initializeHollywood(beginFoundingDraft(state), state.market.tick === 0 ? "fresh" : "migration");
}
export function beginFoundingHistoricalControl(state) {
  if (state.hollywood !== null) throw new Error("Historical control cannot discard a living industry");
  return beginFoundingDraft(state);
}
