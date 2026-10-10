import { m0WiringProbe as __m0WiringProbe } from "./m0WiringProbe.js";
import { assignmentRefusal } from "./careerLifecycle.js";
import { activeContract } from "./employment.js";
import { occupiedResourceSlots, resourceClaimsOf } from "./occupancy.js";
import { productionCompanyTalentIds } from "./productionPeople.js";
import { scriptProjectWriterIds } from "./scriptDevelopment.js";
import { takeSubjectOwner } from "./firstTakeSubjects.js";
import { GENRE_ORDER } from "./tuning.js";
import { shelvedScriptIds } from "./hollywoodTypes.js";
export const OPPORTUNITY_PROMISE_RULES_VERSION = 7;
export const isOpportunityPredicate = (predicate) => "kind" in predicate && (predicate.kind === "genreOpportunity" || predicate.kind === "projectOpportunity");
export const opportunitySlots = (predicate) => predicate.seatClass === "allCast" ? ["lead", "antagonist", "support"] : predicate.seatClass === "lead" ? ["lead"] : ["lead", "antagonist"];
export function opportunityPredicateRefusal(family, predicate) {
  const genre = family === "PREFERRED_GENRE_OPPORTUNITY", project = family === "SPECIFIC_PROJECT";
  if (!genre && !project && !isOpportunityPredicate(predicate)) return null;
  if (!isOpportunityPredicate(predicate) || (genre ? predicate.kind !== "genreOpportunity" : !project || predicate.kind !== "projectOpportunity")) return "an opportunity requires its exact family-specific predicate and selected cast class";
  const keys = ["kind", "count", "seatClass", predicate.kind === "genreOpportunity" ? "genre" : "scriptProjectId"];
  if (Object.keys(predicate).length !== keys.length || keys.some((key) => !Object.hasOwn(predicate, key))) {
    return "an opportunity predicate must contain exactly its selected material fields";
  }
  if (predicate.count !== 1) return "an opportunity promises exactly one picture";
  if (!["allCast", "lead", "leadOrAntagonist"].includes(predicate.seatClass)) return "an opportunity needs a selected cast class";
  if (predicate.kind === "genreOpportunity" && !GENRE_ORDER.includes(predicate.genre)) return "an opportunity needs a catalogue genre";
  if (predicate.kind === "projectOpportunity" && (typeof predicate.scriptProjectId !== "string" || predicate.scriptProjectId.trim() === "")) return "an opportunity needs an exact script project ID";
  return null;
}
export function opportunitySubjectMatches(predicate, subject) {
  return subject !== void 0 && (predicate.kind === "genreOpportunity" ? subject.genre === predicate.genre : subject.scriptProjectId === predicate.scriptProjectId);
}
export function opportunityProductionMatches(state, issuer, predicate, production) {
  const owner = takeSubjectOwner(state, issuer);
  return predicate.kind === "genreOpportunity" ? owner?.concepts.find((row) => row.id === production.conceptId)?.genre === predicate.genre : owner?.development.projects.some((row) => row.id === predicate.scriptProjectId && row.productionId === production.id && row.conceptId === production.conceptId) === true;
}
export function opportunityReservations(state, draft, from) {
  const attached = new Set(state.talentMarket.proposals.flatMap((row) => row.promises));
  const rows = state.promises.filter((row) => row.outcome === null && row.progress < row.predicate.count && (row.contractId !== null || attached.has(row.promiseId)) && row.promiseId !== draft.promiseId && row.dueWeekExclusive > from && row.windowStartWeek < draft.dueWeekExclusive && (row.beneficiaryPersonId === draft.beneficiaryPersonId || row.issuerStudioId === draft.issuerStudioId));
  return isOpportunityPredicate(draft.predicate) || rows.some((row) => isOpportunityPredicate(row.predicate)) ? rows : void 0;
}
function owners(state) {
  return [
    { studioId: state.hollywood?.playerStudioId ?? "", productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood?.businesses.map((row) => ({ studioId: row.studioId, productions: row.productions, development: row.development })) ?? []
  ];
}
const earliestTake = (p, week) => week + Math.max(1, p.remainingTicks - 4) + (p.startTick >= week ? 1 : 0);
const earliestRelease = (p, week) => week + Math.max(1, p.remainingTicks) + (p.startTick >= week ? 1 : 0);
const compareId = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export function opportunityFeasibilityInputs(state, draft) {
  const player = draft.issuerStudioId === state.hollywood?.playerStudioId;
  const business = state.hollywood?.businesses.find((row) => row.studioId === draft.issuerStudioId);
  return [
    "opportunityScope",
    draft.predicate,
    owners(state).map((owner) => [
      owner.studioId,
      owner.development.mode,
      owner.development.projects.map((row) => [
        row.id,
        row.conceptId,
        row.status,
        row.writerId,
        row.writerIds,
        row.dueWeek,
        row.assessment !== null,
        row.reservation,
        row.productionId
      ]),
      owner.productions.map((row) => [row.id, row.conceptId, row.startTick, row.remainingTicks, row.directorId, row.cast, row.craftIds])
    ]),
    state.concepts.map((row) => [row.id, row.genre]),
    state.hollywood?.concepts.map((row) => [row.id, row.genre]) ?? [],
    player ? state.castingSessions : null,
    player ? state.operations : business?.operations ?? null,
    resourceClaimsOf(occupiedResourceSlots(player ? state : business === void 0 ? {} : { operations: business.operations, scriptDevelopment: business.development })).map((row) => [row.kind, row.facilityId, row.slot, row.capability, row.owner, row.ownerId]),
    // Rival staffing's actual busyTalentIds owner has no supported research release clock.
    player ? [] : state.technology.projects.filter((row) => row.status === "active").map((row) => [row.id, row.seats.filter((seat) => seat.releasedWeek === null && activeContract(state, seat.talentId) !== void 0).map((seat) => seat.talentId)])
  ];
}
const impossiblePath = (id, reason) => ({ id, production: null, takeWeek: Infinity, freshWeek: Infinity, physical: reason, uncertainty: null });
function releaseFloor(state, personId, week, exempt) {
  let floor = week, uncertainty = null;
  for (const owner of owners(state)) {
    for (const production of owner.productions) {
      if (production !== exempt && productionCompanyTalentIds([production]).has(personId)) floor = Math.max(floor, earliestRelease(production, week));
    }
    for (const project of owner.development.projects) {
      if ((project.status === "drafting" || project.status === "rewriting") && scriptProjectWriterIds(project).includes(personId)) {
        if (project.dueWeek === null) uncertainty = "an active writing assignment has no committed completion boundary";
        else floor = Math.max(floor, project.dueWeek);
      }
    }
  }
  return { week: floor, uncertainty };
}
function resourceUncertainty(state, issuer, project, freshWeek) {
  const player = issuer === state.hollywood?.playerStudioId;
  const business = state.hollywood?.businesses.find((row) => row.studioId === issuer);
  const operations = player ? state.operations : business?.operations;
  const claims = resourceClaimsOf(occupiedResourceSlots(player ? state : business === void 0 ? {} : { operations: business.operations, scriptDevelopment: business.development }));
  const session = player && project !== null ? state.castingSessions.sessions.find((row) => row.projectId === project.id) : void 0;
  for (const capability of ["development-casting", "soundstage", "set-scenery", "post"]) {
    const available = operations?.facilities.filter((row) => row.capability === capability).some((facility) => Array.from({ length: facility.capacity }, (_, slot) => slot).some((slot) => !claims.some((claim) => {
      if (claim.kind !== "facility" || claim.facilityId !== facility.id || claim.slot !== null && claim.slot !== slot) return false;
      if (claim.owner === "screenplay" && project !== null && claim.ownerId === project.id && project.dueWeek !== null && project.dueWeek <= freshWeek) return false;
      if (claim.owner === "castingSession" && session !== void 0 && claim.ownerId === session.id && session.dueWeek !== null && session.dueWeek <= freshWeek) return false;
      return true;
    }))) === true;
    if (!available) return `existing ${capability} capacity is not available for this opportunity`;
  }
  return null;
}
function paths(state, draft, week, capped, notBefore = week) {
  const owner = takeSubjectOwner(state, draft.issuerStudioId), predicate = draft.predicate;
  if (owner === void 0) return [impossiblePath("", "the issuing studio has no project authority")];
  const matching = predicate.kind === "projectOpportunity" ? owner.development.projects.filter((row) => row.id === predicate.scriptProjectId) : owner.development.projects.filter((row) => owner.concepts.find((concept) => concept.id === row.conceptId)?.genre === predicate.genre);
  if (predicate.kind === "projectOpportunity" && matching.length === 0) return [impossiblePath(predicate.scriptProjectId, "the named script project does not belong to this studio")];
  const rows = [];
  const person = draft.beneficiaryPersonId, slots = opportunitySlots(predicate);
  const shelved = shelvedScriptIds(state.hollywood, draft.issuerStudioId);
  for (const project of matching) {
    if (project.status === "produced") {
      rows.push(impossiblePath(project.id, "the named script project has already been produced"));
      continue;
    }
    if (shelved.has(project.id)) {
      rows.push(impossiblePath(project.id, "the named script project is shelved"));
      continue;
    }
    if (project.productionId !== null || project.status === "inProduction") {
      const production = owner.productions.find((row) => row.id === project.productionId);
      if (production === void 0 || production.remainingTicks < 5 || state.firstTakes.some((row) => row.productionId === production.id) || !slots.some((slot) => production.cast[slot] === person)) {
        rows.push(impossiblePath(project.id, "the fixed project has no qualifying pre-take cast seat"));
        continue;
      }
      const operations = draft.issuerStudioId === state.hollywood?.playerStudioId ? state.operations : state.hollywood?.businesses.find((row) => row.studioId === draft.issuerStudioId)?.operations;
      const workflow = operations?.workflows.find((row) => row.productionId === production.id);
      rows.push({
        id: project.id,
        production,
        takeWeek: Math.max(draft.windowStartWeek, earliestTake(production, week)),
        freshWeek: week,
        physical: null,
        uncertainty: workflow?.blocker === null || workflow === void 0 ? null : "the held project has an unresolved production blocker"
      });
      continue;
    }
    if (project.writerId === person) {
      rows.push(impossiblePath(project.id, "the credited writer cannot hold a cast seat in the same picture"));
      continue;
    }
    const release = releaseFloor(state, person, week, null);
    let freshWeek = Math.max(week, draft.startWeek, release.week, notBefore), uncertainty = release.uncertainty;
    if (project.status === "drafting" || project.status === "rewriting") {
      if (project.dueWeek === null || project.reservation === null) uncertainty = "the screenplay has no committed completion reservation";
      else freshWeek = Math.max(freshWeek, project.dueWeek);
    } else if (project.assessment === null) uncertainty = "the screenplay has no completed assessment";
    const session = draft.issuerStudioId === state.hollywood?.playerStudioId ? state.castingSessions.sessions.find((row) => row.projectId === project.id) : void 0;
    if (session?.status === "auditioning") {
      if (session.dueWeek === null || session.reservation === null) uncertainty = "the casting session has no committed completion reservation";
      else freshWeek = Math.max(freshWeek, session.dueWeek);
    }
    if (capped && assignmentRefusal(state, person, freshWeek, "actor") !== null) {
      rows.push(impossiblePath(project.id, "retirement closes fresh cast admission before this project is available"));
      continue;
    }
    if (draft.issuerStudioId !== state.hollywood?.playerStudioId && state.technology.projects.some((row) => row.status === "active" && row.seats.some((seat) => seat.talentId === person && seat.releasedWeek === null && activeContract(state, person) !== void 0))) {
      uncertainty = "the rival staffing owner has an active research assignment with no supported release boundary";
    }
    rows.push({
      id: project.id,
      production: null,
      freshWeek,
      takeWeek: Math.max(draft.windowStartWeek, freshWeek + 5),
      physical: null,
      uncertainty: uncertainty ?? resourceUncertainty(state, draft.issuerStudioId, project, freshWeek)
    });
  }
  if (predicate.kind === "genreOpportunity") {
    for (const production of owner.productions) {
      if (owner.development.projects.some((row) => row.productionId === production.id) || production.remainingTicks < 5 || state.firstTakes.some((row) => row.productionId === production.id) || !slots.some((slot) => production.cast[slot] === person) || owner.concepts.find((row) => row.id === production.conceptId)?.genre !== predicate.genre) continue;
      const operations = draft.issuerStudioId === state.hollywood?.playerStudioId ? state.operations : state.hollywood?.businesses.find((row) => row.studioId === draft.issuerStudioId)?.operations;
      rows.push({
        id: production.id,
        production,
        freshWeek: week,
        takeWeek: Math.max(draft.windowStartWeek, earliestTake(production, week)),
        physical: null,
        uncertainty: operations?.workflows.find((row) => row.productionId === production.id)?.blocker == null ? null : "the held project has an unresolved production blocker"
      });
    }
    if (draft.issuerStudioId === state.hollywood?.playerStudioId && owner.development.mode === "legacy") {
      const used = /* @__PURE__ */ new Set([...state.studio.activeProductions.map((row) => row.conceptId), ...state.studio.releasedFilms.map((row) => row.conceptId)]);
      for (const concept of owner.concepts.filter((row) => row.genre === predicate.genre && !used.has(row.id))) {
        const release2 = releaseFloor(state, person, week, null), freshWeek2 = Math.max(week, draft.startWeek, notBefore, release2.week);
        rows.push(capped && assignmentRefusal(state, person, freshWeek2, "actor") !== null ? impossiblePath(concept.id, "retirement closes fresh cast admission") : {
          id: concept.id,
          production: null,
          freshWeek: freshWeek2,
          takeWeek: Math.max(draft.windowStartWeek, freshWeek2 + 5),
          physical: null,
          uncertainty: release2.uncertainty ?? resourceUncertainty(state, draft.issuerStudioId, null, freshWeek2)
        });
      }
    }
    const release = releaseFloor(state, person, week, null), freshWeek = Math.max(week, draft.startWeek, notBefore, release.week);
    rows.push(capped && assignmentRefusal(state, person, freshWeek, "actor") !== null ? impossiblePath("future", "retirement closes fresh cast admission") : {
      id: "future",
      production: null,
      freshWeek,
      takeWeek: Math.max(draft.windowStartWeek, freshWeek + 5),
      physical: null,
      uncertainty: "needs a matching picture not yet commissioned"
    });
  }
  return rows.sort((a, b) => a.takeWeek - b.takeWeek || Number(a.id === "future") - Number(b.id === "future") || compareId(a.id, b.id));
}
function qualifyingCommitted(state, promise, week) {
  const predicate = promise.predicate, owner = takeSubjectOwner(state, promise.issuerStudioId);
  const operations = promise.issuerStudioId === state.hollywood?.playerStudioId ? state.operations : state.hollywood?.businesses.find((row) => row.studioId === promise.issuerStudioId)?.operations;
  const slots = isOpportunityPredicate(predicate) ? opportunitySlots(predicate) : "kind" in predicate && predicate.kind === "castRoleCount" ? predicate.seatClass === "lead" ? ["lead"] : ["lead", "antagonist"] : ["lead", "antagonist", "support"];
  return [...owner?.productions ?? []].filter((production) => production.remainingTicks >= 5 && operations?.workflows.find((row) => row.productionId === production.id)?.blocker == null && !state.firstTakes.some((take) => take.productionId === production.id) && ("kind" in predicate && predicate.kind === "directorCount" ? production.directorId === promise.beneficiaryPersonId : slots.some((slot) => production.cast[slot] === promise.beneficiaryPersonId)) && (!isOpportunityPredicate(predicate) || opportunityProductionMatches(state, promise.issuerStudioId, predicate, production)) && Math.max(earliestTake(production, week), promise.windowStartWeek) < promise.dueWeekExclusive).sort((a, b) => earliestTake(a, week) - earliestTake(b, week) || compareId(a.id, b.id));
}
function reservationWitness(state, draft, rows, candidate, week) {
  const groups = /* @__PURE__ */ new Map();
  for (const promise of rows) {
    const remaining = promise.predicate.count - promise.progress;
    const held = qualifyingCommitted(state, promise, week).filter((row) => row !== candidate.production);
    if (held.length < remaining) return null;
    for (const production of held.slice(0, remaining)) groups.set(production, [...groups.get(production) ?? [], promise]);
  }
  let floor = week;
  for (const [production, promises] of groups) {
    const take = Math.max(earliestTake(production, week), ...promises.map((row) => row.windowStartWeek));
    if (promises.some((row) => take >= row.dueWeekExclusive)) return null;
    if (productionCompanyTalentIds([production]).has(draft.beneficiaryPersonId)) floor = Math.max(floor, earliestRelease(production, week), take + 4);
  }
  return floor;
}
function physicalReason(candidates) {
  if (candidates.some((row) => row.physical === null)) return "no filming week inside the window can reach this opportunity";
  return candidates.find((row) => row.id === "future")?.physical ?? candidates.find((row) => row.physical !== null)?.physical ?? "no filming week inside the window can reach this opportunity";
}
const m0Finite = (n) => Number.isFinite(n) ? n : n === Infinity ? "POSITIVE_INFINITY" : n === -Infinity ? "NEGATIVE_INFINITY" : "NAN";
const m0PathSummary = (path) => ({
  id: path.id,
  productionId: path.production?.id ?? null,
  takeWeek: m0Finite(path.takeWeek),
  freshWeek: m0Finite(path.freshWeek),
  physical: path.physical,
  uncertainty: path.uncertainty
});
export function opportunityAssessment(state, draft, week, reservations, capture) {
  __m0WiringProbe.call("opportunityAssessment", { week, issuer: draft.issuerStudioId, subject: draft.beneficiaryPersonId, family: draft.family, predicate: draft.predicate });
  const candidates = paths(state, draft, week, true);
  if (capture !== void 0) capture.record(
    "opportunityCandidates",
    { candidates: candidates.map(m0PathSummary), reservationCount: reservations.length }
  );
  const done = (classification, bottleneck) => {
    const result = { classification, bottleneck };
    if (capture !== void 0) capture.record("opportunityResult", result);
    return result;
  };
  const notEvaluatedSuffix = (start) => {
    if (capture === void 0) return;
    for (let i = start; i < candidates.length; i++) {
      capture.record("opportunityCandidate", {
        ordinal: i,
        status: "NOT_EVALUATED",
        path: m0PathSummary(candidates[i])
      });
    }
  };
  let fragile = null;
  for (let ordinal = 0; ordinal < candidates.length; ordinal++) {
    const candidate = candidates[ordinal];
    if (candidate.physical !== null || candidate.takeWeek >= draft.dueWeekExclusive) {
      if (capture !== void 0) capture.record(
        "opportunityCandidate",
        {
          ordinal,
          status: "PHYSICAL_OR_WINDOW_SKIP",
          path: m0PathSummary(candidate),
          witness: "NOT_EVALUATED",
          delayed: "NOT_EVALUATED"
        }
      );
      continue;
    }
    const witness = reservationWitness(state, draft, reservations, candidate, week);
    if (witness === null) {
      fragile ??= "other promises lack compatible committed-seat reservation witnesses";
      if (capture !== void 0) capture.record(
        "opportunityCandidate",
        {
          ordinal,
          status: "NO_RESERVATION_WITNESS",
          path: m0PathSummary(candidate),
          witness: null,
          delayed: "NOT_EVALUATED"
        }
      );
      continue;
    }
    const delayed = candidate.production === null && witness > candidate.freshWeek ? paths(state, draft, week, true, witness).find((row) => row.id === candidate.id) ?? candidate : candidate;
    if (delayed.physical !== null || delayed.takeWeek >= draft.dueWeekExclusive) {
      fragile ??= "committed reservation timing leaves this opportunity uncertain";
      if (capture !== void 0) capture.record(
        "opportunityCandidate",
        {
          ordinal,
          status: "DELAYED_OUTSIDE_WINDOW",
          path: m0PathSummary(candidate),
          witness: m0Finite(witness),
          delayed: m0PathSummary(delayed)
        }
      );
      continue;
    }
    if (delayed.uncertainty !== null) {
      fragile ??= delayed.uncertainty;
      if (capture !== void 0) capture.record(
        "opportunityCandidate",
        {
          ordinal,
          status: "DELAYED_UNCERTAIN",
          path: m0PathSummary(candidate),
          witness: m0Finite(witness),
          delayed: m0PathSummary(delayed)
        }
      );
      continue;
    }
    if (draft.dueWeekExclusive - delayed.takeWeek < 8) {
      fragile ??= "the due week leaves too little slack before filming would start";
      if (capture !== void 0) capture.record(
        "opportunityCandidate",
        {
          ordinal,
          status: "INSUFFICIENT_SLACK",
          path: m0PathSummary(candidate),
          witness: m0Finite(witness),
          delayed: m0PathSummary(delayed)
        }
      );
      continue;
    }
    if (capture !== void 0) capture.record(
      "opportunityCandidate",
      {
        ordinal,
        status: "REASONABLY_ACHIEVABLE",
        path: m0PathSummary(candidate),
        witness: m0Finite(witness),
        delayed: m0PathSummary(delayed)
      }
    );
    notEvaluatedSuffix(ordinal + 1);
    return done("REASONABLY_ACHIEVABLE", null);
  }
  return fragile !== null ? done("FRAGILE", fragile) : done("IMPOSSIBLE", physicalReason(candidates));
}
export function opportunityPhysicalImpossibility(state, promise, week, capped = false) {
  const draft = { ...promise, startWeek: week, termWeeks: Math.max(0, promise.dueWeekExclusive - week) };
  const candidates = paths(state, draft, week, capped);
  return candidates.some((row) => row.physical === null && row.takeWeek < promise.dueWeekExclusive) ? null : physicalReason(candidates);
}
