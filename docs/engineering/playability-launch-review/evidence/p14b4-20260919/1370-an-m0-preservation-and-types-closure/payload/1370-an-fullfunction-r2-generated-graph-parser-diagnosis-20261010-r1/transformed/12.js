import { m0WiringProbe as __m0WiringProbe } from "./m0WiringProbe.js";
import { fnv1a64 } from "./math.js";
import { assignmentRefusal, retirementRecordFor } from "./careerLifecycle.js";
import { occupiedResourceSlots } from "./occupancy.js";
import { productionCompanyTalentIds } from "./productionPeople.js";
import { openMarketCaseFor } from "./talentMarket.js";
import { TUNING } from "./tuning.js";
import { shelvedScriptIds } from "./hollywoodTypes.js";
import { subjectForNewTake, takeSubjectOwner, validateFirstTakeSubjects } from "./firstTakeSubjects.js";
import {
  isOpportunityPredicate,
  opportunitySlots,
  opportunityPredicateRefusal,
  opportunitySubjectMatches,
  opportunityProductionMatches,
  opportunityReservations,
  opportunityFeasibilityInputs,
  opportunityAssessment,
  opportunityPhysicalImpossibility,
  OPPORTUNITY_PROMISE_RULES_VERSION
} from "./opportunityPromises.js";
const CAST_SLOTS = ["lead", "antagonist", "support"];
export const PROMISE_RULES_VERSION = 4;
export const DIRECTING_PROMISE_RULES_VERSION = 6;
const isDirectorPredicate = (predicate) => "kind" in predicate && predicate.kind === "directorCount";
const isDirectorPromise = (promise) => promise.family === "DIRECTING_COUNT" && isDirectorPredicate(promise.predicate);
export const WEEKS_TO_FIRST_TAKE = 5;
const SEAT_CYCLE_WEEKS = TUNING.PRODUCTION_TICKS;
export const PROMISE_SLACK_WEEKS = 8;
export function promiseBuffer(nMax) {
  return Math.max(1, Math.ceil(0.25 * nMax));
}
export const TRUST_HORIZON_WEEKS = 260;
const TRUST_DISTRUST_MIN_NEGATIVES = 2;
function requirePromiseRoots(state) {
  if (state.promises === void 0 || state.firstTakes === void 0) {
    throw new Error("promises: the Save V29 roots are missing — migrate this state to V29 before acting on it");
  }
}
export function firstTakeReceipts(state) {
  return state.firstTakes;
}
export function allPromises(state) {
  return state.promises;
}
export function promiseOutcomes(state) {
  return state.promises.filter((p) => p.outcome !== null);
}
export function appendFirstTakes(state, entries, week) {
  if (entries.length === 0) return state;
  requirePromiseRoots(state);
  if (state.hollywood === null) return state;
  const takes = [...state.firstTakes];
  if (state.firstTakeSubjects === void 0) throw new Error("promises: migrate to Save40 before recording a first take");
  const subjects = [...state.firstTakeSubjects.facts];
  const seen = new Set(takes.map((t) => t.productionId));
  for (const { studioId, production } of entries) {
    if (seen.has(production.id)) continue;
    seen.add(production.id);
    subjects.push(subjectForNewTake(state, studioId, production, `first-take-event-${String(takes.length)}`));
    takes.push({
      eventId: `first-take-event-${String(takes.length)}`,
      week,
      productionId: production.id,
      studioId,
      directorId: production.directorId,
      cast: { lead: production.cast.lead, antagonist: production.cast.antagonist, support: production.cast.support }
    });
  }
  return takes.length === state.firstTakes.length ? state : {
    ...state,
    firstTakes: takes,
    firstTakeSubjects: { ...state.firstTakeSubjects, facts: subjects }
  };
}
export function promiseDigest(promise) {
  const material = [promise.family, promise.predicate.count, promise.windowStartWeek, promise.dueWeekExclusive];
  if (isDirectorPredicate(promise.predicate)) return fnv1a64(JSON.stringify([...material, promise.predicate.kind]));
  if (isOpportunityPredicate(promise.predicate)) return fnv1a64(JSON.stringify([
    ...material,
    promise.predicate.kind,
    promise.predicate.seatClass,
    promise.predicate.kind === "genreOpportunity" ? promise.predicate.genre : promise.predicate.scriptProjectId
  ]));
  return fnv1a64(JSON.stringify("kind" in promise.predicate ? [...material, promise.predicate.kind, promise.predicate.seatClass] : material));
}
export function attachedPromiseDigest(state, promiseIds) {
  if (promiseIds.length === 0) return "";
  return fnv1a64(JSON.stringify(promiseIds.map((id) => {
    const promise = state.promises.find((p) => p.promiseId === id);
    return promise === void 0 ? `missing:${id}` : promiseDigest(promise);
  })));
}
export function proposalDigest(talentId, issuerStudioId, termWeeks, startWeek, premiumTier, promisePart) {
  const material = promisePart === "" ? [talentId, issuerStudioId, termWeeks, startWeek, premiumTier] : [talentId, issuerStudioId, termWeeks, startWeek, premiumTier, promisePart];
  return fnv1a64(JSON.stringify(material));
}
const NOT_OFFERED_IN_B1 = {
  PREFERRED_GENRE_OPPORTUNITY: "a genre promise is not offered in this slice",
  SPECIFIC_PROJECT: "a named-project promise is not offered in this slice"
};
function serializeFeasibilityInputs(inputs) {
  return JSON.stringify(inputs, (_key, value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
    const fields = value;
    return Object.fromEntries(Object.keys(fields).sort().map((key) => [key, fields[key]]));
  });
}
function receipt(classification, bottleneck, inputs, week, rulesVersion = PROMISE_RULES_VERSION, capture, locals) {
  __m0WiringProbe.call("receipt");
  const canonicalInputs = serializeFeasibilityInputs(inputs);
  const result = { classification, bottleneck, inputsDigest: fnv1a64(canonicalInputs), rulesVersion, week };
  __m0WiringProbe.evaluation(inputs, canonicalInputs, result, capture?.context ?? null);
  if (capture !== void 0) {
    capture.record("inputTuple", {
      canonicalInputs,
      inputBytes: new TextEncoder().encode(canonicalInputs).length,
      inputsDigest: result.inputsDigest
    });
    capture.record("assessment", { ...result, locals: locals ?? {} });
  }
  return result;
}
function studioProductions(state, studioId) {
  if (state.hollywood !== null && studioId !== state.hollywood.playerStudioId) {
    return state.hollywood.businesses.find((b) => b.studioId === studioId)?.productions ?? [];
  }
  return state.studio.activeProductions;
}
function unproducedScripts(state, studioId, directingScope = false) {
  const development = state.hollywood !== null && studioId !== state.hollywood.playerStudioId ? state.hollywood.businesses.find((b) => b.studioId === studioId)?.development : state.scriptDevelopment;
  if (development === void 0 || development.mode !== "managed") return 0;
  const shelved = shelvedScriptIds(state.hollywood, studioId);
  return development.projects.filter((p) => p.status !== "produced" && !shelved.has(p.id) && (!directingScope || p.productionId === null)).length;
}
function stockGreenlightAvailable(state, studioId, directingScope = false) {
  if (directingScope && state.scriptDevelopment.mode === "managed") return false;
  if (state.hollywood !== null && studioId !== state.hollywood.playerStudioId) return false;
  const used = /* @__PURE__ */ new Set();
  for (const p of state.studio.activeProductions) used.add(p.conceptId);
  for (const f of state.studio.releasedFilms) used.add(f.conceptId);
  if (state.scriptDevelopment.mode === "managed") for (const p of state.scriptDevelopment.projects) used.add(p.conceptId);
  if (!state.concepts.some((c) => !used.has(c.id))) return false;
  const stages = state.operations.facilities.filter((f) => f.capability === "soundstage").length;
  return state.studio.activeProductions.length < stages;
}
function seatedPreFirstTake(state, studioId, personId, slots, director = false) {
  const recorded = new Set(state.firstTakes.map((t) => t.productionId));
  return studioProductions(state, studioId).filter(
    (p) => !recorded.has(p.id) && (director ? p.remainingTicks >= 5 && p.directorId === personId : slots.some((slot) => p.cast[slot] === personId))
  );
}
function promiseProductionOccupancy(state, draft) {
  const qualifying = new Set(committedPromiseSeats(state, draft));
  const playerStudioId = state.hollywood?.playerStudioId ?? draft.issuerStudioId;
  const owners = [
    { studioId: playerStudioId, productions: state.studio.activeProductions },
    ...state.hollywood?.businesses.filter((business) => business.studioId !== playerStudioId).map((business) => ({ studioId: business.studioId, productions: business.productions })) ?? []
  ];
  return owners.flatMap((owner) => owner.productions.filter((production) => !qualifying.has(production) && productionCompanyTalentIds([production]).has(draft.beneficiaryPersonId)).map((production) => ({ studioId: owner.studioId, production })));
}
function activePromiseReservations(state, draft, from) {
  const attached = new Set(state.talentMarket.proposals.flatMap((proposal) => proposal.promises));
  return state.promises.filter((promise) => promise.outcome === null && (promise.contractId !== null || attached.has(promise.promiseId)) && promise.promiseId !== draft.promiseId && promise.beneficiaryPersonId === draft.beneficiaryPersonId && promise.dueWeekExclusive > from && promise.windowStartWeek < draft.dueWeekExclusive);
}
function directingScopeReservations(state, draft, from) {
  const attached = new Set(state.talentMarket.proposals.flatMap((proposal) => proposal.promises));
  const selected = /* @__PURE__ */ new Map();
  for (const promise of state.promises) {
    if (promise.outcome !== null || promise.contractId === null && !attached.has(promise.promiseId) || promise.promiseId === draft.promiseId || promise.dueWeekExclusive <= from || promise.windowStartWeek >= draft.dueWeekExclusive || promise.beneficiaryPersonId !== draft.beneficiaryPersonId && promise.issuerStudioId !== draft.issuerStudioId) continue;
    if (!selected.has(promise.promiseId)) selected.set(promise.promiseId, promise);
  }
  const rows = [...selected.values()];
  return isDirectorPredicate(draft.predicate) || rows.some(isDirectorPromise) ? rows : void 0;
}
function reservedByActivePromises(state, draft, from) {
  return activePromiseReservations(state, draft, from).reduce((reserved, promise) => reserved + Math.max(0, promise.predicate.count - promise.progress), 0);
}
function feasibilityInputs(state, draft, week, directingReservations, productionOccupancy = []) {
  __m0WiringProbe.call("feasibilityInputs");
  const directingScope = directingReservations !== void 0;
  const requestedRole = isDirectorPredicate(draft.predicate) ? "director" : "actor";
  const rival = state.hollywood !== null && draft.issuerStudioId !== state.hollywood.playerStudioId;
  const business = rival ? state.hollywood?.businesses.find((b) => b.studioId === draft.issuerStudioId) : void 0;
  const productions = studioProductions(state, draft.issuerStudioId);
  const productionIds = new Set(productions.map((p) => p.id));
  const operations = rival ? business?.operations : state.operations;
  const development = rival ? business?.development : state.scriptDevelopment;
  const occupancy = occupiedResourceSlots(rival ? business === void 0 ? {} : { operations: business.operations, scriptDevelopment: business.development } : state);
  const from = Math.max(draft.windowStartWeek, week);
  const person = state.talent.find((t) => t.id === draft.beneficiaryPersonId);
  const retirement = retirementRecordFor(state, draft.beneficiaryPersonId);
  const shelved = shelvedScriptIds(state.hollywood, draft.issuerStudioId);
  const actingRetirement = retirementRecordFor(state, draft.beneficiaryPersonId, requestedRole);
  return [
    draft.family,
    draft.issuerStudioId,
    draft.beneficiaryPersonId,
    draft.predicate.count,
    draft.windowStartWeek,
    draft.dueWeekExclusive,
    draft.startWeek,
    draft.termWeeks,
    week,
    person === void 0 ? null : person.skills[requestedRole === "director" ? "directing" : "acting"] !== void 0,
    productions.map((p) => [p.id, p.conceptId, p.startTick, p.remainingTicks, p.directorId, p.cast]),
    operations?.facilities.map((f) => [f.id, f.capability, f.capacity]) ?? [],
    operations?.workflows ?? [],
    development?.projects.filter((p) => p.status !== "produced" && !shelved.has(p.id) && (!directingScope || p.productionId === null)).map((p) => [p.id, p.conceptId, p.status, p.writerIds, p.dueWeek, p.reservation, p.productionId]) ?? [],
    [...occupancy].map(([key, claims]) => [key, claims.map((c) => [c.owner, c.ownerId, c.capability, c.slot])]),
    rival ? [] : state.productionQueue,
    rival ? [] : state.placement.facilities.filter((f) => f.status !== "cancelled").map((f) => [f.facilityId, f.blueprintId, f.status, f.completesWeek]),
    rival ? false : stockGreenlightAvailable(state, draft.issuerStudioId, directingScope),
    state.firstTakes.filter((t) => productionIds.has(t.productionId)).map((t) => [t.eventId, t.productionId, t.week]),
    state.hollywood?.employment.filter((e) => e.terms.talentId === draft.beneficiaryPersonId && e.terms.startWeek < draft.dueWeekExclusive && (e.endedWeek ?? e.terms.endWeekExclusive) > from).map((e) => [e.contractId, e.studioId, e.terms.startWeek, e.terms.endWeekExclusive, e.endedWeek]) ?? [],
    (directingReservations ?? activePromiseReservations(state, draft, from)).map((p) => directingScope ? [p.promiseId, p.family, p.issuerStudioId, p.beneficiaryPersonId, p.predicate, p.windowStartWeek, p.dueWeekExclusive, p.progress] : [p.promiseId, p.family, p.issuerStudioId, p.windowStartWeek, p.dueWeekExclusive, p.predicate.count, p.progress]),
    // Appended only for a tagged draft so every count-only tuple stays byte-identical.
    ..."kind" in draft.predicate ? [isDirectorPredicate(draft.predicate) ? [draft.predicate.kind] : [draft.predicate.kind, draft.predicate.seatClass]] : [],
    // C.2c: append only an actual boundary. An unannounced person's historical
    // input tuple remains byte-identical; an accepted extension changes this fact.
    ...retirement === void 0 ? [] : [["retirement", retirement.status, retirement.effectiveWeek]],
    // C.3 acting promises see the requested episode as well as today's global
    // boundary. Keep the existing tuple unchanged when both refer to one row.
    ...actingRetirement === void 0 || actingRetirement === retirement ? [] : [["requestedRetirement", requestedRole, actingRetirement.status, actingRetirement.effectiveWeek]],
    ...directingScope ? [[
      "directingScope",
      requestedRole,
      draft.issuerStudioId,
      person === void 0 ? null : person.skills.directing !== void 0
    ]] : [],
    ...directingScope && productionOccupancy.length > 0 ? [[
      "occupiedProductionSeats",
      productionOccupancy.map(({ studioId, production }) => [studioId, production.id, production.startTick, production.remainingTicks])
    ]] : [],
    // P14D.1: appended only when the issuer has shelved screenplays, so every other tuple stays byte-identical.
    ...shelved.size === 0 ? [] : [["shelvedScripts", [...shelved]]]
  ];
}
function expectedFirstTakeWeek(state, draft, from, k, freshFrom = from, committedSeatsOnly = false) {
  if (k === 0) {
    const running = committedSeatsOnly ? committedPromiseSeats(state, draft) : seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId, promiseCastSlots(draft), isDirectorPredicate(draft.predicate));
    let earliest = null;
    for (const production of running) {
      const weeks = Math.max(1, production.remainingTicks - 4) + (production.startTick >= from ? 1 : 0);
      if (earliest === null || from + weeks < earliest) earliest = from + weeks;
    }
    if (earliest !== null) return earliest;
  }
  return freshFrom + k * SEAT_CYCLE_WEEKS + WEEKS_TO_FIRST_TAKE;
}
function earliestTakeWeek(production, week) {
  return week + Math.max(1, production.remainingTicks - 4) + (production.startTick >= week ? 1 : 0);
}
function earliestReleaseWeek(production, week) {
  return week + Math.max(1, production.remainingTicks) + (production.startTick >= week ? 1 : 0);
}
function committedPromiseSeats(state, promise) {
  return seatedPreFirstTake(state, promise.issuerStudioId, promise.beneficiaryPersonId, promiseCastSlots(promise), isDirectorPredicate(promise.predicate)).filter((production) => production.remainingTicks >= 5 && (!isOpportunityPredicate(promise.predicate) || opportunityProductionMatches(state, promise.issuerStudioId, promise.predicate, production)));
}
function retirementQuoteTakeWeek(state, draft, week, k, capped = true, freshNotBefore = week) {
  const admitted = (greenlightWeek) => !capped || assignmentRefusal(state, draft.beneficiaryPersonId, greenlightWeek, isDirectorPredicate(draft.predicate) ? "director" : "actor") === null;
  const freshTake = Math.max(draft.windowStartWeek, freshNotBefore + WEEKS_TO_FIRST_TAKE);
  const freshGreenlight = k === 0 ? freshNotBefore : freshTake + k * SEAT_CYCLE_WEEKS - WEEKS_TO_FIRST_TAKE;
  let earliest = admitted(freshGreenlight) ? freshTake + k * SEAT_CYCLE_WEEKS : Infinity;
  for (const production of committedPromiseSeats(state, draft)) {
    const take = Math.max(draft.windowStartWeek, earliestTakeWeek(production, week));
    if (k === 0) {
      earliest = Math.min(earliest, take);
      continue;
    }
    const greenlight = Math.max(earliestReleaseWeek(production, week), take + 4, freshNotBefore) + (k - 1) * SEAT_CYCLE_WEEKS;
    if (admitted(greenlight)) earliest = Math.min(earliest, greenlight + WEEKS_TO_FIRST_TAKE);
  }
  return earliest;
}
export function promiseFeasibility(state, draft, week, capture) {
  __m0WiringProbe.call("promiseFeasibility");
  const X = draft.predicate.count;
  const from = Math.max(draft.windowStartWeek, week);
  const opportunityScope = opportunityReservations(state, draft, from);
  const reservations = opportunityScope ?? directingScopeReservations(state, draft, from);
  const directingScope = reservations !== void 0;
  const director = isDirectorPredicate(draft.predicate);
  const requestedRole = director ? "director" : "actor";
  const productionOccupancy = directingScope ? promiseProductionOccupancy(state, draft) : [];
  const inputs = [
    ...feasibilityInputs(state, draft, week, reservations, productionOccupancy),
    ...opportunityScope === void 0 ? [] : [opportunityFeasibilityInputs(state, draft)]
  ];
  const locals = {
    X,
    from,
    opportunityScope: opportunityScope !== void 0,
    directingScope,
    director,
    requestedRole,
    reservationCount: reservations?.length ?? 0,
    productionOccupancyCount: productionOccupancy.length,
    notOffered: "NOT_EVALUATED",
    opportunityPredicate: "NOT_EVALUATED",
    opportunityRefusal: "NOT_EVALUATED",
    personFound: "NOT_EVALUATED",
    disciplineAvailable: "NOT_EVALUATED",
    opportunityResult: "NOT_EVALUATED",
    reserved: "NOT_EVALUATED",
    hasRetirement: "NOT_EVALUATED",
    freshNotBefore: "NOT_EVALUATED",
    nMax: "NOT_EVALUATED",
    existingPath: "NOT_EVALUATED",
    lastEventWeek: "NOT_EVALUATED"
  };
  const answer = (classification, bottleneck) => receipt(classification, bottleneck, inputs, week, opportunityScope !== void 0 ? OPPORTUNITY_PROMISE_RULES_VERSION : directingScope ? DIRECTING_PROMISE_RULES_VERSION : PROMISE_RULES_VERSION, capture, locals);
  const refuse = (bottleneck) => answer("IMPOSSIBLE", bottleneck);
  const notOffered = NOT_OFFERED_IN_B1[draft.family];
  const opportunity = isOpportunityPredicate(draft.predicate);
  if (capture !== void 0) Object.assign(locals, {
    notOffered: notOffered ?? null,
    opportunityPredicate: opportunity
  });
  if (notOffered !== void 0 && !opportunity) return refuse(notOffered);
  const opportunityRefusal = opportunityPredicateRefusal(draft.family, draft.predicate);
  if (capture !== void 0) locals.opportunityRefusal = opportunityRefusal;
  if (opportunityRefusal !== null) return refuse(opportunityRefusal);
  if (draft.family === "DIRECTING_COUNT" && !director) return refuse("a directing promise needs its explicit directorCount predicate selected");
  if (director && (draft.family !== "DIRECTING_COUNT" || Object.keys(draft.predicate).some((key) => key !== "kind" && key !== "count"))) {
    return refuse("the directorCount predicate applies only to DIRECTING_COUNT and contains only kind and count");
  }
  if (draft.family === "LEAD_OR_SIGNIFICANT_ROLE_COUNT" && !("kind" in draft.predicate)) {
    return refuse("a seat-class promise needs its seat class selected (lead, or lead-or-antagonist); without one it is not offered");
  }
  if ("kind" in draft.predicate && !director && !opportunity && draft.family !== "LEAD_OR_SIGNIFICANT_ROLE_COUNT") {
    return refuse("a selected seat class applies only to a seat-class promise");
  }
  if (!Number.isInteger(X) || X < 1) return refuse("the promised count must be a whole picture");
  if (draft.dueWeekExclusive <= draft.windowStartWeek) return refuse("the window closes before it opens");
  if (draft.windowStartWeek < draft.startWeek) return refuse("the window starts before the proposed contract");
  if (draft.dueWeekExclusive > draft.startWeek + draft.termWeeks) {
    return refuse("the due week falls outside the proposed contract");
  }
  const person = state.talent.find((t) => t.id === draft.beneficiaryPersonId);
  if (capture !== void 0) locals.personFound = person !== void 0;
  if (person === void 0) return refuse("this person is not in the world");
  const disciplineAvailable = director ? person.skills.directing !== void 0 : person.skills.acting !== void 0;
  if (capture !== void 0) locals.disciplineAvailable = disciplineAvailable;
  if (!disciplineAvailable) {
    return refuse(director ? "this person lacks a directing skill profile" : "this person lacks an acting skill profile");
  }
  if (isOpportunityPredicate(draft.predicate)) {
    const result = opportunityAssessment(state, { ...draft, predicate: draft.predicate }, week, opportunityScope ?? [], capture);
    if (capture !== void 0) locals.opportunityResult = { classification: result.classification, bottleneck: result.bottleneck };
    return answer(result.classification, result.bottleneck);
  }
  const reserved = reservations === void 0 ? reservedByActivePromises(state, draft, from) : reservations.reduce((sum, promise) => sum + Math.max(0, promise.predicate.count - promise.progress), 0);
  if (capture !== void 0) locals.reserved = reserved;
  const hasRetirement = retirementRecordFor(state, draft.beneficiaryPersonId) !== void 0 || retirementRecordFor(state, draft.beneficiaryPersonId, requestedRole) !== void 0;
  if (capture !== void 0) locals.hasRetirement = hasRetirement;
  const freshNotBefore = productionOccupancy.reduce((earliest, { production }) => Math.max(earliest, earliestReleaseWeek(production, week)), week);
  if (capture !== void 0) locals.freshNotBefore = freshNotBefore;
  const expectedTake = (k) => !hasRetirement ? expectedFirstTakeWeek(state, draft, from, k, Math.max(from, freshNotBefore), directingScope) : retirementQuoteTakeWeek(state, draft, week, k, true, freshNotBefore);
  let nMax = 0;
  while (expectedTake(nMax) < draft.dueWeekExclusive) {
    nMax += 1;
    if (nMax > 1e3) break;
  }
  if (capture !== void 0) locals.nMax = nMax;
  if (X > nMax) {
    if (hasRetirement && retirementQuoteTakeWeek(state, draft, week, X - 1, false, freshNotBefore) < draft.dueWeekExclusive) {
      return refuse("retirement leaves too few qualifying production seats inside the window");
    }
    return refuse("no filming week inside the window can reach that many pictures");
  }
  if (reserved + X > nMax) return refuse("promises already made to this person exhaust the window");
  const existingPath = (directingScope ? committedPromiseSeats(state, draft) : seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId, promiseCastSlots(draft), director)).length + unproducedScripts(state, draft.issuerStudioId, directingScope) + (stockGreenlightAvailable(state, draft.issuerStudioId, directingScope) ? 1 : 0);
  const lastEventWeek = expectedTake(reserved + X - 1);
  if (capture !== void 0) Object.assign(locals, { existingPath, lastEventWeek });
  if (reserved + X > nMax - promiseBuffer(nMax)) {
    return answer("FRAGILE", "the schedule leaves no spare picture inside the window");
  }
  if (reserved + X > existingPath) {
    return answer("FRAGILE", "needs a picture not yet commissioned");
  }
  if (draft.dueWeekExclusive - lastEventWeek < PROMISE_SLACK_WEEKS) {
    return answer("FRAGILE", "the due week leaves too little room before filming would start");
  }
  return answer("REASONABLY_ACHIEVABLE", null);
}
export function reclassifyPromise(state, promise, week) {
  return promiseFeasibility(state, {
    family: promise.family,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: promise.predicate,
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    startWeek: promise.windowStartWeek,
    termWeeks: promise.dueWeekExclusive - promise.windowStartWeek,
    promiseId: promise.promiseId
  }, week);
}
function appendMarketReceipt(market, draft) {
  return {
    ...market,
    receipts: [...market.receipts, { ...draft, dropped: [], eventId: `talent-market-event-${String(market.receipts.length)}` }]
  };
}
export function attachPromise(state, talentId, issuerStudioId, draft) {
  __m0WiringProbe.call("attachPromise");
  const week = state.market.tick;
  if (openMarketCaseFor(state, talentId)?.variant === "retirementExtension") {
    throw new Error(`promises: "${talentId}"'s open case is a retirementExtension — no promise rides the one final extension (P14C.2b)`);
  }
  const proposal = state.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId === issuerStudioId);
  if (proposal === void 0) {
    throw new Error(`promises: studio "${issuerStudioId}" has no current proposal for "${talentId}" to attach a promise to`);
  }
  if (proposal.promises.length > 0) {
    throw new Error(
      `promises: studio "${issuerStudioId}"'s proposal for "${talentId}" already carries a promise — P14B.1 attaches at most one; re-submit the proposal to revise it`
    );
  }
  const director = isDirectorPredicate(draft.predicate);
  const opportunityRefusal = opportunityPredicateRefusal(draft.family, draft.predicate);
  if (opportunityRefusal !== null) throw new Error(`promises: ${opportunityRefusal}`);
  if (isOpportunityPredicate(draft.predicate) && draft.predicate.kind === "projectOpportunity") {
    const projectId = draft.predicate.scriptProjectId;
    if (!takeSubjectOwner(state, issuerStudioId)?.development.projects.some((row) => row.id === projectId)) {
      throw new Error("promises: a named opportunity requires an existing script project of the issuing studio");
    }
  }
  if (draft.family === "DIRECTING_COUNT" && !director) {
    throw new Error("promises: a fresh directing promise requires the explicit directorCount predicate");
  }
  if (director && (draft.family !== "DIRECTING_COUNT" || Object.keys(draft.predicate).some((key) => key !== "kind" && key !== "count"))) {
    throw new Error("promises: directorCount is an exact kind/count predicate for DIRECTING_COUNT only");
  }
  if ("kind" in draft.predicate && !director && !isOpportunityPredicate(draft.predicate) && draft.family !== "LEAD_OR_SIGNIFICANT_ROLE_COUNT") {
    throw new Error(
      `promises: a selected seat class is legal only on a LEAD_OR_SIGNIFICANT_ROLE_COUNT promise, not "${draft.family}"`
    );
  }
  const feasibilityReceipt = promiseFeasibility(state, {
    family: draft.family,
    issuerStudioId,
    beneficiaryPersonId: talentId,
    predicate: draft.predicate,
    windowStartWeek: draft.windowStartWeek,
    dueWeekExclusive: draft.dueWeekExclusive,
    startWeek: proposal.startWeek,
    termWeeks: proposal.termWeeks
  }, week);
  const base = {
    promiseId: `promise-${String(state.promises.length)}`,
    version: feasibilityReceipt.rulesVersion,
    issuerStudioId,
    beneficiaryPersonId: talentId,
    windowStartWeek: draft.windowStartWeek,
    dueWeekExclusive: draft.dueWeekExclusive,
    feasibilityReceipt,
    progress: 0,
    evidenceRefs: [],
    outcome: null,
    outcomeWeek: null,
    outcomeCause: null,
    outcomeEventId: null,
    contractId: null,
    // Save V32: a freshly attached promise supersedes nothing. Only `waivePromise`
    // ever writes a non-null link, and only onto the promise it waives.
    supersededByPromiseId: null
  };
  const promise = isDirectorPredicate(draft.predicate) ? { ...base, family: "DIRECTING_COUNT", predicate: { kind: "directorCount", count: draft.predicate.count } } : isOpportunityPredicate(draft.predicate) ? draft.predicate.kind === "genreOpportunity" ? { ...base, family: "PREFERRED_GENRE_OPPORTUNITY", predicate: { ...draft.predicate } } : { ...base, family: "SPECIFIC_PROJECT", predicate: { ...draft.predicate } } : "kind" in draft.predicate ? {
    ...base,
    family: "LEAD_OR_SIGNIFICANT_ROLE_COUNT",
    predicate: { kind: "castRoleCount", count: draft.predicate.count, seatClass: draft.predicate.seatClass }
  } : { ...base, family: draft.family, predicate: { count: draft.predicate.count } };
  const promises = [...state.promises, promise];
  const promised = { ...proposal, promises: [promise.promiseId] };
  const redigested = {
    ...promised,
    digest: proposalDigest(
      promised.talentId,
      promised.issuerStudioId,
      promised.termWeeks,
      promised.startWeek,
      promised.premiumTier,
      attachedPromiseDigest({ promises }, promised.promises)
    )
  };
  return {
    ...state,
    promises,
    talentMarket: {
      ...state.talentMarket,
      proposals: state.talentMarket.proposals.map((p) => p === proposal ? redigested : p)
    }
  };
}
function evaluable(promise) {
  return promise.outcome === null && promise.contractId !== null;
}
export function promiseCastSlots(promise) {
  if (!("kind" in promise.predicate)) return CAST_SLOTS;
  if (isDirectorPredicate(promise.predicate)) return [];
  if (isOpportunityPredicate(promise.predicate)) return opportunitySlots(promise.predicate);
  return promise.predicate.seatClass === "lead" ? ["lead"] : ["lead", "antagonist"];
}
export function promisedCastMasks(state, issuerStudioId, takeWeek, subject) {
  const masks = /* @__PURE__ */ new Map();
  for (const promise of state.promises) {
    if (isDirectorPromise(promise)) continue;
    if (isOpportunityPredicate(promise.predicate) && (subject === void 0 || (promise.predicate.kind === "genreOpportunity" ? promise.predicate.genre !== subject.genre : promise.predicate.scriptProjectId !== subject.scriptProjectId))) continue;
    if (!evaluable(promise) || promise.issuerStudioId !== issuerStudioId || promise.progress >= promise.predicate.count || takeWeek < promise.windowStartWeek || takeWeek >= promise.dueWeekExclusive) continue;
    const slots = promiseCastSlots(promise);
    masks.set(
      promise.beneficiaryPersonId,
      (masks.get(promise.beneficiaryPersonId) ?? CAST_SLOTS).filter((slot) => slots.includes(slot))
    );
  }
  return masks;
}
export function qualifyingTakes(state, promise) {
  const slots = promiseCastSlots(promise);
  const director = isDirectorPromise(promise);
  const productions = /* @__PURE__ */ new Set();
  return state.firstTakes.filter((take) => {
    if (productions.has(take.productionId) || take.studioId !== promise.issuerStudioId || take.week < promise.windowStartWeek || take.week >= promise.dueWeekExclusive || !(director ? take.directorId === promise.beneficiaryPersonId : slots.some((slot) => take.cast[slot] === promise.beneficiaryPersonId))) return false;
    if (isOpportunityPredicate(promise.predicate) && !opportunitySubjectMatches(
      promise.predicate,
      state.firstTakeSubjects?.facts.find((subject) => subject.eventId === take.eventId)
    )) return false;
    productions.add(take.productionId);
    return true;
  });
}
export function targetSpecificImpossibility(state, promise, week) {
  const remaining = Math.max(0, promise.predicate.count - qualifyingTakes(state, promise).length);
  if (remaining === 0) return null;
  if (isOpportunityPredicate(promise.predicate)) return opportunityPhysicalImpossibility(state, { ...promise, predicate: promise.predicate }, week);
  const t0 = Math.max(promise.windowStartWeek, expectedFirstTakeWeek(state, promise, week, 0));
  const nMax = t0 < promise.dueWeekExclusive ? Math.ceil((promise.dueWeekExclusive - t0) / WEEKS_TO_FIRST_TAKE) : 0;
  return remaining > nMax ? "no filming week inside the window can reach that many pictures" : null;
}
function rivalUncappedPromiseCapacity(state, promise, week) {
  const personId = promise.beneficiaryPersonId;
  const productions = [
    ...state.studio.activeProductions,
    ...state.hollywood?.businesses.flatMap((business) => business.productions) ?? []
  ];
  let released = week;
  for (const production of productions) {
    if (production.directorId === personId || production.craftIds.includes(personId) || CAST_SLOTS.some((slot) => production.cast[slot] === personId)) {
      released = Math.max(released, earliestReleaseWeek(production, week));
    }
  }
  const freshCapacity = (greenlight) => {
    const take = Math.max(promise.windowStartWeek, greenlight + WEEKS_TO_FIRST_TAKE);
    return take < promise.dueWeekExclusive ? Math.ceil((promise.dueWeekExclusive - take) / (TUNING.PRODUCTION_TICKS + 1)) : 0;
  };
  let capacity = freshCapacity(released);
  for (const production of committedPromiseSeats(state, promise)) {
    const take = Math.max(promise.windowStartWeek, earliestTakeWeek(production, week));
    if (take >= promise.dueWeekExclusive) continue;
    capacity = Math.max(capacity, 1 + freshCapacity(Math.max(released, take + 4)));
  }
  return capacity;
}
function retirementVoidsPromise(state, promise, week, remaining) {
  const requestedRole = isDirectorPromise(promise) ? "director" : "actor";
  if (remaining === 0 || assignmentRefusal(state, promise.beneficiaryPersonId, week, requestedRole) === null) return false;
  if (isOpportunityPredicate(promise.predicate)) {
    const target = { ...promise, predicate: promise.predicate };
    return opportunityPhysicalImpossibility(state, target, week, true) !== null && opportunityPhysicalImpossibility(state, target, week, false) === null;
  }
  const committed = committedPromiseSeats(state, promise).filter((production) => Math.max(promise.windowStartWeek, earliestTakeWeek(production, week)) < promise.dueWeekExclusive);
  if (committed.length >= remaining) return false;
  if (state.hollywood !== null && promise.issuerStudioId !== state.hollywood.playerStudioId) {
    return rivalUncappedPromiseCapacity(state, promise, week) >= remaining;
  }
  let first = Math.max(promise.windowStartWeek, week + WEEKS_TO_FIRST_TAKE);
  for (const production of committed) {
    first = Math.min(first, Math.max(promise.windowStartWeek, earliestTakeWeek(production, week)));
  }
  const capacity = first < promise.dueWeekExclusive ? Math.ceil((promise.dueWeekExclusive - first) / WEEKS_TO_FIRST_TAKE) : 0;
  return capacity >= remaining;
}
function settle(state, promise, next, week, reason) {
  const market = appendMarketReceipt(state.talentMarket, {
    kind: "promiseOutcome",
    week,
    talentId: promise.beneficiaryPersonId,
    studioId: promise.issuerStudioId,
    reasons: [reason]
  });
  const eventId = market.receipts[market.receipts.length - 1].eventId;
  return {
    ...state,
    promises: state.promises.map((p) => p.promiseId === promise.promiseId ? { ...p, ...next, outcomeWeek: week, outcomeEventId: next.outcomeEventId ?? eventId } : p),
    talentMarket: market
  };
}
export function advancePromisesWeek(state) {
  requirePromiseRoots(state);
  const week = state.market.tick;
  let next = state;
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue;
    const takes = qualifyingTakes(next, promise);
    const progress = Math.min(promise.predicate.count, takes.length);
    if (takes.length >= promise.predicate.count) {
      const evidenceRefs = takes.slice(0, promise.predicate.count).map((t) => t.eventId);
      next = settle(next, promise, {
        progress,
        evidenceRefs,
        outcome: "SATISFIED",
        outcomeCause: "the promised pictures began filming inside the window",
        // `outcomeEventId` names this promise's OWN outcome event — the
        // `promiseOutcome` receipt `settle` appends — in every branch, never the
        // causing first take, which `evidenceRefs` already names. ONE take seats
        // up to three promised people (measured: r01's `first-take-event-76`
        // satisfies three of its own promises at week 216), so pointing the field
        // at the take made several promises name one event and the V29 root
        // validator refused the save: "records a second outcome".
        outcomeEventId: null
      }, week, "a promise to this person was kept");
      continue;
    }
    if (retirementVoidsPromise(next, promise, week, promise.predicate.count - progress)) {
      next = settle(next, promise, {
        progress,
        evidenceRefs: takes.map((take) => take.eventId),
        outcome: "VOIDED",
        outcomeCause: "retirement closed new production assignments before the remaining promised pictures could begin filming",
        outcomeEventId: null
      }, week, "a promise to this person was voided by retirement");
      continue;
    }
    if (week >= promise.dueWeekExclusive) {
      next = settle(next, promise, {
        progress,
        outcome: "BROKEN",
        outcomeCause: "the window closed before the promised pictures began filming",
        outcomeEventId: null
      }, week, "a promise to this person went unmet to its due week");
      continue;
    }
    if (progress !== promise.progress) {
      next = { ...next, promises: next.promises.map((p) => p.promiseId === promise.promiseId ? { ...p, progress, ...isDirectorPromise(promise) ? { evidenceRefs: takes.map((take) => take.eventId) } : {} } : p) };
    }
  }
  return next;
}
export function breakPromisesOnTermination(state, issuerStudioId, personId) {
  requirePromiseRoots(state);
  const week = state.market.tick;
  let next = state;
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue;
    if (promise.issuerStudioId !== issuerStudioId || promise.beneficiaryPersonId !== personId) continue;
    next = settle(next, promise, {
      outcome: "BROKEN",
      outcomeCause: "the studio terminated this contract early, ending the window",
      outcomeEventId: null
    }, week, "a promise to this person was broken by an early termination");
  }
  return next;
}
export function breakPromisesOnCancel(state, issuerStudioId, cancelled) {
  requirePromiseRoots(state);
  const week = state.market.tick;
  if (state.firstTakes.some((t) => t.productionId === cancelled.id)) return state;
  let next = state;
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue;
    if (promise.issuerStudioId !== issuerStudioId) continue;
    if (isOpportunityPredicate(promise.predicate)) {
      const owner = state.hollywood?.playerStudioId === issuerStudioId ? state.scriptDevelopment : state.hollywood?.businesses.find((row) => row.studioId === issuerStudioId)?.development;
      const project = owner?.projects.find((row) => row.id === ("scriptProjectId" in promise.predicate ? promise.predicate.scriptProjectId : ""));
      if (promise.predicate.kind === "projectOpportunity" && project?.conceptId !== cancelled.conceptId) continue;
      if (promise.predicate.kind === "genreOpportunity" && !opportunityProductionMatches(state, issuerStudioId, promise.predicate, cancelled)) continue;
    }
    const directing = isDirectorPromise(promise);
    if (!(directing ? cancelled.directorId === promise.beneficiaryPersonId : promiseCastSlots(promise).some((slot) => cancelled.cast[slot] === promise.beneficiaryPersonId))) continue;
    if (targetSpecificImpossibility(state, promise, week) === null) continue;
    next = settle(next, promise, {
      outcome: "BROKEN",
      outcomeCause: directing ? "the studio cancelled the picture this person was directing, and no path was left" : "the studio cancelled the picture this person was cast in, and no path was left",
      outcomeEventId: null
    }, week, "a promise to this person was broken by a cancelled picture");
  }
  return next;
}
export function breakPromisesOnGreenlight(state, issuerStudioId, production, week = state.market.tick) {
  let next = state;
  for (const promise of state.promises) {
    if (!evaluable(promise) || promise.issuerStudioId !== issuerStudioId || !isOpportunityPredicate(promise.predicate) || promise.predicate.kind !== "projectOpportunity" || promise.progress >= promise.predicate.count || qualifyingTakes(state, promise).length >= promise.predicate.count || !opportunityProductionMatches(state, issuerStudioId, promise.predicate, production) || promiseCastSlots(promise).some((slot) => production.cast[slot] === promise.beneficiaryPersonId)) continue;
    next = settle(
      next,
      promise,
      {
        outcome: "BROKEN",
        outcomeEventId: null,
        outcomeCause: "the studio fixed the named project cast without this person in the promised seat"
      },
      week,
      "a promise to this person was broken by the named project casting"
    );
  }
  return next;
}
function contractInterval(state, promise) {
  const contract = state.hollywood?.employment.find((e) => e.contractId === promise.contractId);
  if (contract === void 0) return null;
  return { startWeek: contract.terms.startWeek, termWeeks: contract.terms.endWeekExclusive - contract.terms.startWeek };
}
function substituteDraft(promise, substitute, interval) {
  return {
    family: substitute.family,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: substitute.predicate,
    windowStartWeek: substitute.windowStartWeek,
    dueWeekExclusive: substitute.dueWeekExclusive,
    startWeek: interval.startWeek,
    termWeeks: interval.termWeeks,
    promiseId: promise.promiseId
  };
}
function seatClassOf(predicate) {
  return "kind" in predicate && predicate.kind === "castRoleCount" ? predicate.seatClass : null;
}
function identicalSubstitute(promise, substitute) {
  if (isOpportunityPredicate(promise.predicate) || isOpportunityPredicate(substitute.predicate)) {
    return promiseDigest(promise) === promiseDigest({ ...promise, ...substitute });
  }
  return substitute.family === promise.family && seatClassOf(substitute.predicate) === seatClassOf(promise.predicate) && substitute.predicate.count === promise.predicate.count && substitute.windowStartWeek === promise.windowStartWeek && substitute.dueWeekExclusive === promise.dueWeekExclusive;
}
function opportunitySubstitutionRefusal(state, promise, substitute) {
  if (!isOpportunityPredicate(promise.predicate)) return null;
  if (!isOpportunityPredicate(substitute.predicate)) return "a substitute cannot erase the promised genre or project restriction";
  if (promise.predicate.kind === "projectOpportunity") {
    return substitute.predicate.kind === "projectOpportunity" && substitute.predicate.scriptProjectId === promise.predicate.scriptProjectId ? null : "a substitute must retain the same named script project";
  }
  if (substitute.predicate.kind === "genreOpportunity") return substitute.predicate.genre === promise.predicate.genre ? null : "a substitute must retain the same promised genre";
  const owner = takeSubjectOwner(state, promise.issuerStudioId);
  const id = substitute.predicate.scriptProjectId;
  const project = owner?.development.projects.find((row) => row.id === id);
  return owner?.concepts.find((row) => row.id === project?.conceptId)?.genre === promise.predicate.genre ? null : "the substitute project must belong to the original promised genre";
}
export function waiverAccepted(state, promise, substitute, week) {
  const shapeRefusal = opportunityPredicateRefusal(substitute.family, substitute.predicate);
  if (shapeRefusal !== null) return shapeRefusal;
  const directing = isDirectorPredicate(promise.predicate);
  if (directing !== isDirectorPredicate(substitute.predicate)) {
    return "directing and cast work cannot substitute for one another";
  }
  if (promise.outcome !== null) {
    return `this promise already settled ${promise.outcome}, and a terminal outcome is never rewritten`;
  }
  if (promise.contractId === null) {
    return "nobody took up this promise, so there is no commitment to waive";
  }
  const interval = contractInterval(state, promise);
  if (interval === null) {
    return "the employment contract this promise rode in on is no longer on the record";
  }
  if (identicalSubstitute(promise, substitute)) {
    return "an identical substitute changes nothing this studio owes";
  }
  if (substitute.windowStartWeek <= week) {
    return "a substitute is a forward obligation, and this window opens no later than the week of the waiver";
  }
  const promised = promiseCastSlots(promise);
  if (!directing && !promiseCastSlots({ predicate: substitute.predicate }).every((slot) => promised.includes(slot))) {
    return "the part offered is weaker than the part promised";
  }
  const restrictionRefusal = opportunitySubstitutionRefusal(state, promise, substitute);
  if (restrictionRefusal !== null) return restrictionRefusal;
  const remaining = promise.predicate.count - promise.progress;
  if (substitute.predicate.count < remaining) {
    return `only ${String(substitute.predicate.count)} of the ${String(remaining)} pictures still owed would be covered`;
  }
  if (trustDescriptor(state, promise.beneficiaryPersonId, promise.issuerStudioId, week).label === "Distrusted") {
    return "this person no longer trusts this studio enough to accept a substitute for what was promised";
  }
  const feasibility = promiseFeasibility(state, substituteDraft(promise, substitute, interval), week);
  if (feasibility.classification !== "REASONABLY_ACHIEVABLE") {
    return `what remains of the contract cannot reasonably carry the substitute — ${feasibility.bottleneck ?? feasibility.classification}`;
  }
  return null;
}
export function waivePromise(state, draft) {
  requirePromiseRoots(state);
  const week = state.market.tick;
  const promise = state.promises.find((p) => p.promiseId === draft.promiseId);
  if (promise === void 0) {
    throw new Error(`promises: no promise "${draft.promiseId}" to waive`);
  }
  const refusal = waiverAccepted(state, promise, draft.substitute, week);
  if (refusal !== null) {
    throw new Error(`promises: this person did not accept the substitute — ${refusal}`);
  }
  const interval = contractInterval(state, promise);
  if (interval === null) {
    throw new Error(`promises: contract "${String(promise.contractId)}" is no longer on the record`);
  }
  const feasibilityReceipt = promiseFeasibility(state, substituteDraft(promise, draft.substitute, interval), week);
  const substituteId = `promise-${String(state.promises.length)}`;
  const settled = settle(state, promise, {
    outcome: "WAIVED",
    outcomeCause: `this person accepted the substitute promise "${substituteId}" in place of it`,
    outcomeEventId: null,
    // Save V32's typed link, on the WAIVED original and nowhere else. The prose
    // above stays because every terminal branch states a cause; it is not what
    // a reader resolves the successor by.
    supersededByPromiseId: substituteId
  }, week, "a promise to this person was waived for a substitute the person accepted");
  const base = {
    promiseId: substituteId,
    version: feasibilityReceipt.rulesVersion,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    windowStartWeek: draft.substitute.windowStartWeek,
    dueWeekExclusive: draft.substitute.dueWeekExclusive,
    feasibilityReceipt,
    progress: 0,
    evidenceRefs: [],
    outcome: null,
    outcomeWeek: null,
    outcomeCause: null,
    outcomeEventId: null,
    contractId: promise.contractId,
    // The link points backwards only: the substitute supersedes nothing.
    supersededByPromiseId: null
  };
  const substitute = isDirectorPredicate(draft.substitute.predicate) ? { ...base, family: "DIRECTING_COUNT", predicate: { kind: "directorCount", count: draft.substitute.predicate.count } } : isOpportunityPredicate(draft.substitute.predicate) ? draft.substitute.predicate.kind === "genreOpportunity" ? { ...base, family: "PREFERRED_GENRE_OPPORTUNITY", predicate: { ...draft.substitute.predicate } } : { ...base, family: "SPECIFIC_PROJECT", predicate: { ...draft.substitute.predicate } } : "kind" in draft.substitute.predicate && draft.substitute.predicate.kind === "castRoleCount" ? {
    ...base,
    family: "LEAD_OR_SIGNIFICANT_ROLE_COUNT",
    predicate: {
      kind: "castRoleCount",
      count: draft.substitute.predicate.count,
      seatClass: draft.substitute.predicate.seatClass
    }
  } : { ...base, family: draft.substitute.family, predicate: { count: draft.substitute.predicate.count } };
  return { ...settled, promises: [...settled.promises, substitute] };
}
export function trustDrivers(state, personId, studioId, week) {
  const boundary = state.studioHistory.recordingStartedWeek;
  const horizon = week - TRUST_HORIZON_WEEKS;
  const drivers = [];
  const keep = (at) => at >= boundary && at > horizon;
  for (const promise of state.promises) {
    if (promise.issuerStudioId !== studioId) continue;
    if (personId !== null && promise.beneficiaryPersonId !== personId) continue;
    if (promise.outcome === null || promise.outcomeWeek === null || !keep(promise.outcomeWeek)) continue;
    if (promise.outcome === "SATISFIED") {
      drivers.push({ kind: "promiseKept", week: promise.outcomeWeek, positive: true, reason: "kept a promise" });
    } else if (promise.outcome === "BROKEN") {
      drivers.push({ kind: "promiseBroken", week: promise.outcomeWeek, positive: false, reason: "broke a promise" });
    }
  }
  const hollywood = state.hollywood;
  if (hollywood !== null) {
    for (const row of hollywood.employment) {
      if (row.studioId !== studioId) continue;
      if (personId !== null && row.terms.talentId !== personId) continue;
      if (row.endedWeek === null || !keep(row.endedWeek)) continue;
      const terminated = hollywood.receipts.some((r) => r.kind === "employment" && r.contractId === row.contractId && r.toStudioId === null && r.reason === "termination");
      if (terminated) drivers.push({ kind: "terminatedEarly", week: row.endedWeek, positive: false, reason: "ended a contract early" });
      else if (row.endedWeek >= row.terms.endWeekExclusive) {
        drivers.push({ kind: "ranToEnd", week: row.endedWeek, positive: true, reason: "ran a contract to its end" });
      }
    }
  }
  const live = /* @__PURE__ */ new Set();
  for (const p of state.studio.activeProductions) live.add(p.id);
  for (const f of state.studio.releasedFilms) live.add(f.productionId);
  for (const business of hollywood?.businesses ?? []) for (const p of business.productions) live.add(p.id);
  for (const f of hollywood?.films ?? []) live.add(f.filmId);
  for (const take of state.firstTakes) {
    if (take.studioId !== studioId || live.has(take.productionId) || !keep(take.week)) continue;
    if (personId !== null && take.directorId !== personId && !CAST_SLOTS.some((slot) => take.cast[slot] === personId)) continue;
    drivers.push({ kind: "cancelledAfterFirstTake", week: take.week, positive: false, reason: "cancelled a picture after filming began" });
  }
  return drivers.sort((a, b) => a.week === b.week ? a.kind.localeCompare(b.kind) : b.week - a.week);
}
function label(drivers) {
  const positive = drivers.filter((d) => d.positive).length;
  const negative = drivers.length - positive;
  if (negative === 0) return positive > 0 ? "Reliable" : "Mixed record";
  return negative >= TRUST_DISTRUST_MIN_NEGATIVES && negative > positive ? "Distrusted" : "Mixed record";
}
export function trustDescriptor(state, personId, studioId, week) {
  const own = trustDrivers(state, personId, studioId, week);
  if (own.length > 0) return { label: label(own), drivers: own.slice(0, 3), scope: "person" };
  return studioTrustDescriptor(state, studioId, week);
}
export function studioTrustDescriptor(state, studioId, week) {
  const aggregate = trustDrivers(state, null, studioId, week);
  return { label: label(aggregate), drivers: aggregate.slice(0, 3), scope: "studio" };
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validatePromiseRoots(state) {
  validatePromiseRootsForVersion(state, 29);
}
export function validatePromiseRootsV30(state) {
  validatePromiseRootsForVersion(state, 30);
}
export function validatePromiseRootsV39(state) {
  validatePromiseRootsForVersion(state, 39);
}
export function validatePromiseRootsV40(state) {
  validatePromiseRootsForVersion(state, 40);
}
function validatePromiseRootsForVersion(state, saveVersion) {
  const fail = (message) => {
    throw new Error(`validateSaveV${String(saveVersion)}: ${message}`);
  };
  if (!isRecord(state)) return fail("state is not a plain object");
  const takes = state.firstTakes;
  const promises = state.promises;
  if (!Array.isArray(takes)) return fail("state.firstTakes is not an array");
  if (!Array.isArray(promises)) return fail("state.promises is not an array");
  const record = (value, at) => {
    if (!isRecord(value)) return fail(`${at} is not a plain object`);
    return value;
  };
  const exact = (row, keys, at) => {
    for (const key of keys) if (!Object.hasOwn(row, key)) fail(`${at}.${key} is missing`);
    for (const key of Object.keys(row)) if (!keys.includes(key)) fail(`${at}.${key} is not a field of this record`);
  };
  const text = (value, at) => {
    if (typeof value !== "string" || value.trim() === "") return fail(`${at} must be a non-empty string`);
    return value;
  };
  const nonnegative = (value, at) => {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) return fail(`${at} must be a non-negative integer`);
    return value;
  };
  const currentWeek = nonnegative(record(state.market, "state.market").tick, "state.market.tick");
  const boundary = nonnegative(
    record(state.studioHistory, "state.studioHistory").recordingStartedWeek,
    "state.studioHistory.recordingStartedWeek"
  );
  const recordedWeek = (value, at) => {
    const week = nonnegative(value, at);
    if (week < boundary || week > currentWeek) return fail(`${at} is outside this campaign's recording interval`);
    return week;
  };
  const hollywood = isRecord(state.hollywood) ? state.hollywood : null;
  const identities = hollywood !== null && Array.isArray(hollywood.identities) ? hollywood.identities : [];
  const entered = new Set(identities.filter((s) => isRecord(s) && s.enteredWeek !== null).map((s) => String(s.studioId)));
  const people = new Set((Array.isArray(state.talent) ? state.talent : []).filter(isRecord).map((person) => person.id));
  const personId = (value, at) => {
    const id = text(value, at);
    if (!people.has(id)) return fail(`${at} does not name a person of this world`);
    return id;
  };
  const studioId = (value, at) => {
    const id = text(value, at);
    if (!entered.has(id)) return fail(`${at} is not an entered studio of this world`);
    return id;
  };
  const employment = hollywood !== null && Array.isArray(hollywood.employment) ? hollywood.employment.filter(isRecord) : [];
  const market = record(state.talentMarket, "state.talentMarket");
  if (!Array.isArray(market.proposals)) return fail("state.talentMarket.proposals is not an array");
  if (!Array.isArray(market.receipts)) return fail("state.talentMarket.receipts is not an array");
  const receiptsById = new Map(market.receipts.filter(isRecord).map((r) => [r.eventId, r]));
  const seenProduction = /* @__PURE__ */ new Set();
  const takesById = /* @__PURE__ */ new Map();
  for (let i = 0; i < takes.length; i++) {
    const at = `state.firstTakes[${String(i)}]`;
    const row = record(takes[i], at);
    exact(row, ["eventId", "week", "productionId", "studioId", "directorId", "cast"], at);
    if (row.eventId !== `first-take-event-${String(i)}`) return fail(`${at}.eventId is not this root's ordinal id`);
    recordedWeek(row.week, `${at}.week`);
    const productionId = text(row.productionId, `${at}.productionId`);
    if (seenProduction.has(productionId)) return fail(`${at} records a second first take for production "${productionId}"`);
    seenProduction.add(productionId);
    studioId(row.studioId, `${at}.studioId`);
    personId(row.directorId, `${at}.directorId`);
    const cast = record(row.cast, `${at}.cast`);
    exact(cast, CAST_SLOTS, `${at}.cast`);
    for (const slot of CAST_SLOTS) personId(cast[slot], `${at}.cast.${slot}`);
    takesById.set(row.eventId, row);
  }
  if (saveVersion === 40) validateFirstTakeSubjects(state);
  const subjects = saveVersion === 40 ? state.firstTakeSubjects.facts : [];
  const promisesById = /* @__PURE__ */ new Map();
  const outcomeEvents = /* @__PURE__ */ new Set();
  for (let i = 0; i < promises.length; i++) {
    const at = `state.promises[${String(i)}]`;
    const row = record(promises[i], at);
    exact(row, [
      "promiseId",
      "family",
      "version",
      "issuerStudioId",
      "beneficiaryPersonId",
      "predicate",
      "windowStartWeek",
      "dueWeekExclusive",
      "feasibilityReceipt",
      "progress",
      "evidenceRefs",
      "outcome",
      "outcomeWeek",
      "outcomeCause",
      "outcomeEventId",
      "contractId"
    ], at);
    const promiseId = text(row.promiseId, `${at}.promiseId`);
    if (promisesById.has(promiseId)) return fail(`${at}.promiseId "${promiseId}" is recorded twice`);
    if (!["APPEARANCE_COUNT", "LEAD_OR_SIGNIFICANT_ROLE_COUNT", "DIRECTING_COUNT", "PREFERRED_GENRE_OPPORTUNITY", "SPECIFIC_PROJECT"].includes(String(row.family))) return fail(`${at}.family is not in the promise catalogue`);
    if (nonnegative(row.version, `${at}.version`) < 1) return fail(`${at}.version must be positive`);
    studioId(row.issuerStudioId, `${at}.issuerStudioId`);
    personId(row.beneficiaryPersonId, `${at}.beneficiaryPersonId`);
    const predicate = record(row.predicate, `${at}.predicate`);
    let qualifyingSlots = CAST_SLOTS;
    const director = saveVersion >= 39 && predicate.kind === "directorCount";
    const opportunity = saveVersion === 40 && (predicate.kind === "genreOpportunity" || predicate.kind === "projectOpportunity");
    if (saveVersion >= 39 && Object.hasOwn(predicate, "kind") && !opportunity && predicate.kind !== "directorCount" && predicate.kind !== "castRoleCount") {
      return fail(`${at}.predicate.kind is not a supported promise predicate`);
    }
    if (opportunity) {
      const refusal = opportunityPredicateRefusal(String(row.family), predicate);
      if (refusal !== null) return fail(`${at}.predicate ${refusal}`);
      if (row.version !== OPPORTUNITY_PROMISE_RULES_VERSION) return fail(`${at}.version must be opportunity revision7`);
      qualifyingSlots = opportunitySlots(predicate);
      if (predicate.kind === "projectOpportunity" && !takeSubjectOwner(state, String(row.issuerStudioId))?.development.projects.some((project) => project.id === predicate.scriptProjectId)) {
        return fail(`${at}.predicate.scriptProjectId does not name a retained project of its issuing studio`);
      }
    } else if (director) {
      exact(predicate, ["kind", "count"], `${at}.predicate`);
      if (row.family !== "DIRECTING_COUNT") return fail(`${at}.predicate.directorCount is only valid for DIRECTING_COUNT`);
      if (row.version !== DIRECTING_PROMISE_RULES_VERSION && !(saveVersion === 40 && row.version === OPPORTUNITY_PROMISE_RULES_VERSION)) return fail(`${at}.version must be a supported Director revision`);
      qualifyingSlots = [];
    } else if (saveVersion !== 29 && Object.hasOwn(predicate, "kind")) {
      exact(predicate, ["kind", "count", "seatClass"], `${at}.predicate`);
      if (predicate.kind !== "castRoleCount") return fail(`${at}.predicate.kind is not a supported promise predicate`);
      if (row.family !== "LEAD_OR_SIGNIFICANT_ROLE_COUNT") {
        return fail(`${at}.predicate.castRoleCount is only valid for LEAD_OR_SIGNIFICANT_ROLE_COUNT`);
      }
      if (predicate.seatClass !== "lead" && predicate.seatClass !== "leadOrAntagonist") {
        return fail(`${at}.predicate.seatClass is not a selected P2 seat class`);
      }
      qualifyingSlots = predicate.seatClass === "lead" ? ["lead"] : ["lead", "antagonist"];
    } else {
      exact(predicate, ["count"], `${at}.predicate`);
    }
    const count = nonnegative(predicate.count, `${at}.predicate.count`);
    if (count < 1) return fail(`${at}.predicate.count must be a whole picture`);
    const progress = nonnegative(row.progress, `${at}.progress`);
    if (progress > count) return fail(`${at}.progress is outside its own predicate`);
    const start = nonnegative(row.windowStartWeek, `${at}.windowStartWeek`);
    const due = nonnegative(row.dueWeekExclusive, `${at}.dueWeekExclusive`);
    if (due <= start) return fail(`${at} closes before it opens`);
    const feasibility = record(row.feasibilityReceipt, `${at}.feasibilityReceipt`);
    exact(feasibility, ["classification", "bottleneck", "inputsDigest", "rulesVersion", "week"], `${at}.feasibilityReceipt`);
    if (!["REASONABLY_ACHIEVABLE", "FRAGILE", "IMPOSSIBLE"].includes(String(feasibility.classification))) {
      return fail(`${at}.feasibilityReceipt.classification is not in the catalogue`);
    }
    if (feasibility.classification === "REASONABLY_ACHIEVABLE") {
      if (feasibility.bottleneck !== null) return fail(`${at}.feasibilityReceipt names a bottleneck for an achievable promise`);
    } else text(feasibility.bottleneck, `${at}.feasibilityReceipt.bottleneck`);
    if (!/^[0-9a-f]{16}$/.test(text(feasibility.inputsDigest, `${at}.feasibilityReceipt.inputsDigest`))) {
      return fail(`${at}.feasibilityReceipt.inputsDigest is not a feasibility digest`);
    }
    if (nonnegative(feasibility.rulesVersion, `${at}.feasibilityReceipt.rulesVersion`) < 1) {
      return fail(`${at}.feasibilityReceipt.rulesVersion must be positive`);
    }
    if (opportunity && feasibility.rulesVersion !== OPPORTUNITY_PROMISE_RULES_VERSION) {
      return fail(`${at}.feasibilityReceipt.rulesVersion must be opportunity revision7`);
    }
    if (director && feasibility.rulesVersion !== DIRECTING_PROMISE_RULES_VERSION && !(saveVersion === 40 && feasibility.rulesVersion === OPPORTUNITY_PROMISE_RULES_VERSION)) {
      return fail(`${at}.feasibilityReceipt.rulesVersion must be a supported Director revision`);
    }
    recordedWeek(feasibility.week, `${at}.feasibilityReceipt.week`);
    if (row.contractId !== null) {
      const contractId = text(row.contractId, `${at}.contractId`);
      const contract = employment.find((e) => e.contractId === contractId);
      if (contract === void 0 || !isRecord(contract.terms) || contract.studioId !== row.issuerStudioId || contract.terms.talentId !== row.beneficiaryPersonId) {
        return fail(`${at}.contractId does not name this person's employment at the issuing studio`);
      }
      if (due > Number(contract.terms.endWeekExclusive)) return fail(`${at}.contractId ends before the promised window`);
      const contractStart = nonnegative(contract.terms.startWeek, `${at}.contractId start week`);
      if ((director || opportunity) && start < contractStart) return fail(`${at}.windowStartWeek precedes its contractId`);
      if (contractStart > currentWeek) return fail(`${at}.contractId has not started in this campaign`);
      if (row.outcome !== null && Number(row.outcomeWeek) < contractStart) {
        return fail(`${at}.outcomeWeek precedes the contract that carried this promise`);
      }
    }
    if (!Array.isArray(row.evidenceRefs)) return fail(`${at}.evidenceRefs is not an array`);
    const evidence = /* @__PURE__ */ new Set();
    for (const ref of row.evidenceRefs) {
      const id = text(ref, `${at}.evidenceRefs`);
      if (evidence.has(id)) return fail(`${at}.evidenceRefs repeats a first take`);
      evidence.add(id);
      const take = takesById.get(id);
      if (take === void 0 || take.studioId !== row.issuerStudioId || !(director ? take.directorId === row.beneficiaryPersonId : qualifyingSlots.some((slot) => take.cast[slot] === row.beneficiaryPersonId)) || take.week < start || take.week >= due || row.outcomeWeek !== null && take.week > Number(row.outcomeWeek)) {
        return fail(`${at}.evidenceRefs does not name a qualifying first take inside this promise's window`);
      }
      if (opportunity && !opportunitySubjectMatches(
        predicate,
        subjects.find((subject) => subject.eventId === id)
      )) return fail(`${at}.evidenceRefs does not match its recorded take subject`);
    }
    if (evidence.size > progress) return fail(`${at}.evidenceRefs exceeds its recorded progress`);
    if ((director || opportunity) && evidence.size !== progress) return fail(`${at}.evidenceRefs does not match its recorded progress`);
    promisesById.set(promiseId, row);
    if (row.outcome === null) {
      if (row.outcomeWeek !== null) return fail(`${at} has no outcome but names an outcome week`);
      if (row.outcomeCause !== null || row.outcomeEventId !== null) return fail(`${at} has outcome evidence but no outcome`);
      continue;
    }
    if (!["SATISFIED", "BROKEN", "WAIVED", "VOIDED"].includes(String(row.outcome))) {
      return fail(`${at}.outcome "${String(row.outcome)}" is not an outcome of this catalogue`);
    }
    if (row.contractId === null) return fail(`${at} is terminal without a committed contract`);
    const outcomeWeek = recordedWeek(row.outcomeWeek, `${at}.outcomeWeek`);
    text(row.outcomeCause, `${at}.outcomeCause`);
    const eventId = text(row.outcomeEventId, `${at}.outcomeEventId`);
    if (outcomeEvents.has(eventId)) return fail(`${at}.outcomeEventId "${eventId}" records a second outcome`);
    outcomeEvents.add(eventId);
    const outcomeReceipt = receiptsById.get(eventId);
    if (outcomeReceipt === void 0 || outcomeReceipt.kind !== "promiseOutcome" || outcomeReceipt.talentId !== row.beneficiaryPersonId || outcomeReceipt.studioId !== row.issuerStudioId || outcomeReceipt.week !== outcomeWeek) return fail(`${at}.outcomeEventId does not name this promise's own outcome receipt`);
    if (row.outcome === "SATISFIED" && (progress !== count || evidence.size !== count)) {
      return fail(`${at} is satisfied without the promised number of qualifying first takes`);
    }
    if (row.outcome === "BROKEN" && progress >= count) return fail(`${at} is broken despite a satisfied predicate`);
  }
  for (let i = 0; i < market.proposals.length; i++) {
    const at = `state.talentMarket.proposals[${String(i)}]`;
    const row = record(market.proposals[i], at);
    if (!Array.isArray(row.promises) || row.promises.length > 1) return fail(`${at}.promises must be an array of at most one promise ID`);
    for (const ref of row.promises) {
      const promise = promisesById.get(text(ref, `${at}.promises`));
      if (promise === void 0 || promise.issuerStudioId !== row.issuerStudioId || promise.beneficiaryPersonId !== row.talentId) return fail(`${at}.promises does not name this proposal's own promise`);
      if (promise.contractId !== null || promise.outcome !== null) return fail(`${at}.promises names an already committed promise`);
    }
  }
}
export function projectPromisesPreV29(state) {
  if (!isRecord(state)) return;
  for (const key of ["firstTakes", "promises"]) {
    const rows = state[key];
    if (Array.isArray(rows) && rows.length > 0) {
      throw new Error(`frozen save projection cannot discard authoritative V29 ${key} (${String(rows.length)} held)`);
    }
  }
  const market = state.talentMarket;
  const proposals = isRecord(market) && Array.isArray(market.proposals) ? market.proposals : [];
  for (const row of proposals) {
    if (isRecord(row) && Array.isArray(row.promises) && row.promises.length > 0) {
      throw new Error("frozen save projection cannot discard an authoritative V29 promise attached to a proposal");
    }
  }
}
export function validateWaivedPromiseLinks(state) {
  const fail = (message) => {
    throw new Error(`validateSaveV32: ${message}`);
  };
  if (!isRecord(state)) return fail("state is not a plain object");
  const rows = state.promises;
  if (!Array.isArray(rows)) return fail("state.promises is not an array");
  const ids = new Set(rows.filter(isRecord).map((row) => row.promiseId));
  for (let i = 0; i < rows.length; i++) {
    const at = `state.promises[${String(i)}]`;
    const row = rows[i];
    if (!isRecord(row)) return fail(`${at} is not a plain object`);
    if (!Object.hasOwn(row, "supersededByPromiseId")) return fail(`${at}.supersededByPromiseId is missing`);
    const superseded = row.supersededByPromiseId;
    if (superseded === null) continue;
    if (typeof superseded !== "string" || superseded.trim() === "") {
      return fail(`${at}.supersededByPromiseId must be a promise id or null`);
    }
    if (superseded === row.promiseId) return fail(`${at}.supersededByPromiseId names itself`);
    if (!ids.has(superseded)) return fail(`${at}.supersededByPromiseId does not name a promise of this world`);
    if (row.outcome !== "WAIVED") {
      return fail(`${at}.supersededByPromiseId names a substitute for a promise that was not waived`);
    }
  }
}
export function validateDirectorWaiverLinks(promises) {
  if (!promises.some(isDirectorPromise)) return;
  const indices = new Map(promises.map((row, index) => [row.promiseId, index]));
  const incoming = /* @__PURE__ */ new Set();
  const fail = (index, reason) => {
    throw new Error(`validateSaveV39: state.promises[${String(index)}].supersededByPromiseId ${reason}`);
  };
  for (let i = 0; i < promises.length; i++) {
    const original = promises[i];
    const id = original.supersededByPromiseId;
    if (id === null) {
      if (isDirectorPromise(original) && original.outcome === "WAIVED") {
        fail(i, "must name the successor of a waived Director promise");
      }
      continue;
    }
    const successorIndex = indices.get(id) ?? -1;
    const successor = promises[successorIndex];
    if (successor === void 0) return fail(i, "does not name an existing successor");
    if (!isDirectorPromise(original) && !isDirectorPromise(successor)) continue;
    if (!isDirectorPromise(original) || !isDirectorPromise(successor)) {
      fail(i, "cannot exchange Director and cast predicate domains");
    }
    if (successorIndex <= i || incoming.has(id)) {
      fail(i, "must name a later successor belonging to exactly one waiver");
    }
    incoming.add(id);
    if (successor.contractId !== original.contractId || successor.beneficiaryPersonId !== original.beneficiaryPersonId || successor.issuerStudioId !== original.issuerStudioId) {
      fail(i, "successor must preserve the same contract, beneficiary and issuer");
    }
    if (original.outcomeWeek === null || successor.feasibilityReceipt.week !== original.outcomeWeek || successor.windowStartWeek <= original.outcomeWeek) {
      fail(i, "successor must be agreed at the waiver and carry a forward window");
    }
    if (successor.feasibilityReceipt.classification !== "REASONABLY_ACHIEVABLE") {
      fail(i, "successor must carry an accepted reasonably achievable receipt");
    }
    if (successor.predicate.count < original.predicate.count - original.progress) {
      fail(i, "successor does not cover the remaining pictures owed");
    }
  }
}
export function validateOpportunityWaiverLinks(state) {
  const indices = new Map(state.promises.map((row, i) => [row.promiseId, i]));
  const incoming = /* @__PURE__ */ new Set();
  const fail = (id, reason) => {
    throw new Error(`validateSaveV40: opportunity waiver ${id} ${reason}`);
  };
  for (let i = 0; i < state.promises.length; i++) {
    const original = state.promises[i], id = original.supersededByPromiseId;
    if (id === null) {
      if (isOpportunityPredicate(original.predicate) && original.outcome === "WAIVED") fail(original.promiseId, "must name its successor");
      continue;
    }
    const successorIndex = indices.get(id) ?? -1, successor = state.promises[successorIndex];
    if (successor === void 0) return fail(original.promiseId, "has no successor");
    if (!isOpportunityPredicate(original.predicate) && !isOpportunityPredicate(successor.predicate)) continue;
    if (successorIndex <= i || incoming.has(id)) fail(original.promiseId, "must have one later successor");
    incoming.add(id);
    if (successor.contractId !== original.contractId || successor.issuerStudioId !== original.issuerStudioId || successor.beneficiaryPersonId !== original.beneficiaryPersonId) fail(original.promiseId, "must preserve contract, issuer and beneficiary");
    if (original.outcomeWeek === null || successor.feasibilityReceipt.week !== original.outcomeWeek || successor.windowStartWeek <= original.outcomeWeek) fail(original.promiseId, "must carry a forward obligation agreed at the waiver");
    if (successor.feasibilityReceipt.classification !== "REASONABLY_ACHIEVABLE") fail(original.promiseId, "must have an accepted achievable receipt");
    if (isDirectorPredicate(original.predicate) !== isDirectorPredicate(successor.predicate) || !promiseCastSlots(successor).every((slot) => promiseCastSlots(original).includes(slot))) fail(original.promiseId, "cannot weaken the work domain or cast class");
    const restriction = opportunitySubstitutionRefusal(state, original, successor);
    if (restriction !== null) fail(original.promiseId, restriction);
    if (successor.predicate.count < original.predicate.count - original.progress) fail(original.promiseId, "does not cover the remaining work");
  }
}
export function projectPromisesPreV32(state) {
  if (!isRecord(state)) return;
  const rows = state.promises;
  if (!Array.isArray(rows)) return;
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const superseded = row.supersededByPromiseId;
    if (superseded !== void 0 && superseded !== null) {
      throw new Error(
        `frozen save projection cannot discard the substitute "${String(superseded)}" a waived promise was superseded by`
      );
    }
  }
}
