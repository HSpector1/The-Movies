import { m0WiringProbe as __m0WiringProbe } from "./m0WiringProbe.js";
import { rivalEmployment, rivalWeeklyOperatingCost, moveRivalMoney } from "./hollywood.js";
import { RIVAL_TEAM_ROLES } from "./hollywoodStartingData.js";
import { recordPlayerEmployment } from "./industryEmployment.js";
import {
  commitRetirementExtension,
  contractEndRefusal,
  extensionIssuer,
  lifecycleRefusal,
  readExtensionUsed,
  retirementRecordFor
} from "./careerLifecycle.js";
import { activeContract, canAfford, contractOffer, guaranteedComp, renewalWindowOpen, terminationCost } from "./employment.js";
import { attachPromise, attachedPromiseDigest, promiseFeasibility, proposalDigest, trustDescriptor } from "./promises.js";
import { createM0FeasibilitySink } from "./m0FeasibilityWitness.js";
import { isOpportunityPredicate } from "./opportunityPromises.js";
import { takeSubjectOwner } from "./firstTakeSubjects.js";
import { relationshipsReasonSentence, rosterTies, tiersOnRoster } from "./relationships.js";
import { careerIdentity } from "./talentSummary.js";
import { TUNING } from "./tuning.js";
import { shelvedScriptIds } from "./hollywoodTypes.js";
const iround = (x) => Math.round(x);
export function initialTalentMarket() {
  return { cases: [], proposals: [], receipts: [], legacyTerminations: [], representation: null };
}
export function talentMarketEngaged(state) {
  return state.hollywood !== null;
}
export function enteredStudioIds(hollywood) {
  return (hollywood?.identities ?? []).filter((s) => s.enteredWeek !== null).map((s) => s.studioId);
}
export function marketEligibility(state, talentId, week = state.market.tick) {
  const lifecycle = retirementRecordFor(state, talentId)?.status;
  if (lifecycle === "announced") {
    const issuer = extensionIssuer(state, talentId, week);
    return { status: "retirement_announced", proposers: issuer === null ? [] : [issuer] };
  }
  if (lifecycle === "finishing_commitments") return { status: "finishing_commitments", proposers: [] };
  if (lifecycle === "retired") return { status: "retired_or_ineligible", proposers: [] };
  const entered = enteredStudioIds(state.hollywood);
  const terms = subjectTerms(state, talentId, week);
  if (terms === void 0) return { status: "free_agent", proposers: entered };
  if (!renewalWindowOpen(terms, week)) return { status: "contracted_outside_window", proposers: [] };
  return { status: "renewal_window", proposers: entered };
}
function subjectTerms(state, talentId, week) {
  return activeContract(state, talentId, week) ?? rivalEmployment(state, talentId, week)?.terms;
}
function employmentRow(state, contractId) {
  return state.hollywood?.employment.find((e) => e.contractId === contractId);
}
function decisionWeekOf(state, kase) {
  const row = employmentRow(state, kase.contractId);
  if (row === void 0) {
    throw new Error(`talentMarket: case for "${kase.talentId}" names employment row "${kase.contractId}", which does not exist`);
  }
  return row.terms.endWeekExclusive;
}
function releasedEarly(state, kase) {
  const row = employmentRow(state, kase.contractId);
  return row !== void 0 && row.endedWeek !== null && row.endedWeek < row.terms.endWeekExclusive;
}
function caseStatusAt(state, kase, week) {
  if (kase.outcome !== null) return kase.outcome;
  if (releasedEarly(state, kase)) return "invalidated";
  if (week >= decisionWeekOf(state, kase)) return "decision_pending";
  return week <= kase.openedWeek ? "discovered" : "proposals_open";
}
function latestCase(state, talentId) {
  const rows = state.talentMarket.cases.filter((c) => c.talentId === talentId);
  return rows[rows.length - 1];
}
export function caseForTalent(state, talentId, week = state.market.tick) {
  const kase = latestCase(state, talentId);
  if (kase === void 0) return null;
  return {
    talentId: kase.talentId,
    subjectTalentId: kase.talentId,
    subjectStudioId: kase.subjectStudioId,
    contractId: kase.contractId,
    status: caseStatusAt(state, kase, week),
    decisionWeek: decisionWeekOf(state, kase),
    openedWeek: kase.openedWeek
  };
}
export function caseOpenForTalent(state, talentId, week = state.market.tick) {
  const view = caseForTalent(state, talentId, week);
  return view !== null && !TERMINAL.has(view.status);
}
const TERMINAL = /* @__PURE__ */ new Set(["settled", "declined", "expired", "invalidated"]);
export function isPremiumTier(tier) {
  return TUNING.MARKET_PREMIUM_TIERS.some((t) => t === tier);
}
export function releaseFloor(state, releasingStudioId, talentId, week = state.market.tick) {
  const hollywood = state.hollywood;
  if (hollywood === null) return null;
  let best = null;
  for (const receipt of hollywood.receipts) {
    if (receipt.kind !== "employment" || receipt.reason !== "termination") continue;
    if (receipt.studioId !== releasingStudioId || receipt.talentId !== talentId) continue;
    if (releasingStudioId === hollywood.playerStudioId && !state.ledger.some((row2) => row2.kind === "termination" && row2.talentId === talentId && row2.week === receipt.week)) continue;
    const row = hollywood.employment.find((e) => e.contractId === receipt.contractId);
    if (row === void 0) continue;
    const validUntilWeek = row.terms.endWeekExclusive;
    if (week >= validUntilWeek) continue;
    if (best === null || row.terms.annualSalary > best.floorAnnual) {
      best = { floorAnnual: row.terms.annualSalary, validUntilWeek };
    }
  }
  return best;
}
export function studioOffer(state, studioId, talentId, termWeeks, week = state.market.tick) {
  return floorOffer(state, studioId, contractOffer(state, talentId, termWeeks, week), week);
}
export function floorOffer(state, studioId, offer, week = state.market.tick) {
  const floor = releaseFloor(state, studioId, offer.talentId, week);
  if (floor === null || floor.floorAnnual <= offer.annualSalary) return offer;
  return {
    ...offer,
    annualSalary: floor.floorAnnual,
    signingBonus: iround(floor.floorAnnual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  };
}
export function playerOffer(state, talentId, termWeeks, week = state.market.tick) {
  return state.hollywood === null ? contractOffer(state, talentId, termWeeks, week) : studioOffer(state, state.hollywood.playerStudioId, talentId, termWeeks, week);
}
export function playerOfferOptions(state, talentId, week = state.market.tick) {
  return TUNING.CONTRACT_TERM_OPTIONS.map((t) => playerOffer(state, talentId, t, week));
}
function effectiveWeekFor(state, talentId, week) {
  const view = caseForTalent(state, talentId, week);
  return view === null ? week : view.decisionWeek;
}
export function proposalDraft(state, issuerStudioId, talentId, termWeeks, premiumTier, week = state.market.tick, promisePart = "") {
  __m0WiringProbe.call("proposalDraft");
  if (!isPremiumTier(premiumTier)) {
    throw new Error(
      `talentMarket: premium tier ${premiumTier} is not offered — P14A prices at ${TUNING.MARKET_PREMIUM_TIERS.join(", ")} and never below the ask (companion §2.1.4/§2.1.7)`
    );
  }
  const ask = studioOffer(state, issuerStudioId, talentId, termWeeks, week);
  const annualSalary = iround(ask.annualSalary * premiumTier);
  const signingBonus = iround(annualSalary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION);
  const startWeek = effectiveWeekFor(state, talentId, week);
  if (talentId === M0_SUBJECT && (week === 196 || week === 208)) m0Record(
    state,
    "draftPrice",
    issuerStudioId,
    {
      askAnnual: ask.annualSalary,
      askBonus: ask.signingBonus,
      termWeeks: ask.termWeeks,
      premiumTier,
      annualSalary,
      signingBonus,
      startWeek,
      promisePart
    }
  );
  return {
    talentId,
    issuerStudioId,
    termWeeks: ask.termWeeks,
    premiumTier,
    annualSalary,
    signingBonus,
    startWeek,
    endWeekExclusive: startWeek + ask.termWeeks,
    // MATERIAL terms only (companion §2.1.4), WIDENED by P14B.1 (3) with the
    // attached promise. Price is DERIVED, never material: ordinary drift between
    // submission and the decision week must not invalidate a version. A proposal
    // carrying NO promise digests byte-identically to its V28 self, so every
    // migrated proposal re-derives its stored digest unchanged.
    digest: proposalDigest(talentId, issuerStudioId, ask.termWeeks, startWeek, premiumTier, promisePart)
  };
}
function proposalPriceAt(state, proposal, week) {
  __m0WiringProbe.call("proposalPriceAt");
  const ask = studioOffer(state, proposal.issuerStudioId, proposal.talentId, proposal.termWeeks, week);
  const annualSalary = iround(ask.annualSalary * proposal.premiumTier);
  const signingBonus = iround(annualSalary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION);
  if (proposal.talentId === M0_SUBJECT && (week === 196 || week === 208)) m0Record(
    state,
    "priceAt",
    proposal.issuerStudioId,
    {
      askAnnual: ask.annualSalary,
      termWeeks: ask.termWeeks,
      premiumTier: proposal.premiumTier,
      annualSalary,
      signingBonus
    }
  );
  return { askAnnual: ask.annualSalary, annualSalary, signingBonus };
}
function rivalOperatingReserve(business, hollywood, week) {
  __m0WiringProbe.call("rivalOperatingReserve");
  return rivalWeeklyOperatingCost(business, hollywood, week) * business.policy.reserveWeeks;
}
function affordabilityRefusal(state, issuerStudioId, bonus, week, capture) {
  __m0WiringProbe.call("affordabilityRefusal");
  const hollywood = state.hollywood;
  if (issuerStudioId === hollywood.playerStudioId) {
    const affordable = canAfford(state, bonus);
    const refusal2 = affordable.ok ? null : `${affordable.reason} (D-12 solvency gate)`;
    capture?.({ path: "player", bonus, affordable: affordable.ok, refusal: refusal2 });
    return refusal2;
  }
  const business = hollywood.businesses.find((b) => b.studioId === issuerStudioId);
  if (business === void 0) {
    const refusal2 = `studio "${issuerStudioId}" has no business account`;
    capture?.({ path: "missingBusiness", bonus, refusal: refusal2 });
    return refusal2;
  }
  const reserve = rivalOperatingReserve(business, hollywood, week);
  const netCash = business.account.cash - bonus;
  const refusal = netCash >= reserve ? null : `the signing bonus would leave "${issuerStudioId}" under its operating reserve`;
  capture?.({
    path: "rival",
    cash: business.account.cash,
    bonus,
    netCash,
    reserve,
    reserveWeeks: business.policy.reserveWeeks,
    refusal
  });
  return refusal;
}
function requireOpenCase(state, talentId, week) {
  if (!talentMarketEngaged(state)) throw new Error("talentMarket: no industry — the market is not engaged");
  const view = caseForTalent(state, talentId, week);
  if (view === null || TERMINAL.has(view.status)) {
    throw new Error(`talentMarket: no open market case for "${talentId}" — free agents are signed directly, and nobody may approach a person in term`);
  }
  return view;
}
function appendReceipt(market, draft) {
  return {
    ...market,
    receipts: [...market.receipts, { ...draft, dropped: draft.dropped ?? [], eventId: `talent-market-event-${market.receipts.length}` }]
  };
}
export function submitProposal(state, intent) {
  __m0WiringProbe.call("submitProposal");
  if (__m0WiringProbe.consumeFault("submitProposal") === "ordinary-refusal") throw new Error("M0 wiring ordinary submission refusal fixture");
  const week = state.market.tick;
  const record = retirementRecordFor(state, intent.talentId);
  const extension = record?.status === "announced" && extensionIssuer(state, intent.talentId, week) === intent.issuerStudioId;
  if (record !== void 0 && !extension) {
    throw new Error(`talentMarket: proposal rejected — ${lifecycleRefusal(record, "no proposal is taken after an announcement")}`);
  }
  const view = requireOpenCase(state, intent.talentId, week);
  const eligible = marketEligibility(state, intent.talentId, week);
  if (!eligible.proposers.includes(intent.issuerStudioId)) {
    throw new Error(`talentMarket: studio "${intent.issuerStudioId}" may not propose for "${intent.talentId}" — it has not entered, or the person is not in an approved window`);
  }
  if (extension && view.decisionWeek + intent.termWeeks !== record.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS) {
    throw new Error(
      `talentMarket: proposal rejected — a retirementExtension for "${intent.talentId}" must end at exactly week ${record.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS} (one year past the effective week ${record.effectiveWeek}); a ${intent.termWeeks}-week term from the decision week ${view.decisionWeek} ends at week ${view.decisionWeek + intent.termWeeks}`
    );
  }
  const draft = proposalDraft(state, intent.issuerStudioId, intent.talentId, intent.termWeeks, intent.premiumTier, week);
  const refusal = affordabilityRefusal(state, intent.issuerStudioId, draft.signingBonus, week);
  if (refusal !== null) throw new Error(`talentMarket: proposal rejected — ${refusal}`);
  const proposal = {
    talentId: draft.talentId,
    issuerStudioId: draft.issuerStudioId,
    termWeeks: draft.termWeeks,
    premiumTier: draft.premiumTier,
    startWeek: draft.startWeek,
    annualSalary: draft.annualSalary,
    signingBonus: draft.signingBonus,
    submittedWeek: week,
    digest: draft.digest,
    // A re-submission is this codebase's own "revise in place": the fresh
    // proposal restores the material terms and carries NO promise, so removing a
    // promise is exactly a re-submit with nothing attached.
    promises: [],
    representation: null
  };
  const others = state.talentMarket.proposals.filter(
    (p) => !(p.talentId === intent.talentId && p.issuerStudioId === intent.issuerStudioId)
  );
  const market = appendReceipt(
    { ...state.talentMarket, proposals: [...others, proposal] },
    { kind: "proposalSubmitted", week, talentId: intent.talentId, studioId: intent.issuerStudioId, reasons: [] }
  );
  return { ...state, talentMarket: market };
}
export function withdrawProposal(state, talentId, issuerStudioId) {
  const others = state.talentMarket.proposals.filter((p) => !(p.talentId === talentId && p.issuerStudioId === issuerStudioId));
  if (others.length === state.talentMarket.proposals.length) {
    throw new Error(`talentMarket: studio "${issuerStudioId}" has no current proposal for "${talentId}" to withdraw`);
  }
  return { ...state, talentMarket: { ...state.talentMarket, proposals: others } };
}
export function currentProposals(state, talentId) {
  return state.talentMarket.proposals.filter((p) => p.talentId === talentId);
}
export const UNKNOWN = "UNKNOWN";
export function disclosedPromiseTerms(state, issuerStudioId, predicate) {
  const terms = {
    qualifyingRole: "kind" in predicate && predicate.kind === "directorCount" ? "director" : "cast",
    seatClass: "kind" in predicate && (predicate.kind === "castRoleCount" || isOpportunityPredicate(predicate)) ? predicate.seatClass : null
  };
  if (!isOpportunityPredicate(predicate)) return terms;
  if (predicate.kind === "genreOpportunity") return { ...terms, genre: predicate.genre };
  const owner = takeSubjectOwner(state, issuerStudioId);
  const project = owner?.development.projects.find((row) => row.id === predicate.scriptProjectId);
  const title = owner?.concepts.find((row) => row.id === project?.conceptId)?.title;
  return {
    ...terms,
    scriptProjectId: predicate.scriptProjectId,
    ...title === void 0 ? {} : { scriptProjectTitle: title }
  };
}
export function caseDisclosure(state, talentId, viewerStudioId, week = state.market.tick) {
  const view = caseForTalent(state, talentId, week);
  if (view === null) throw new Error(`talentMarket: no case for "${talentId}" to disclose`);
  const settlement = [...state.talentMarket.receipts].reverse().find((r) => r.talentId === talentId && r.kind === "settled");
  return {
    subjectTalentId: view.subjectTalentId,
    subjectStudioId: view.subjectStudioId,
    status: view.status,
    decisionWeek: view.decisionWeek,
    proposals: currentProposals(state, talentId).map((p) => {
      const mine = p.issuerStudioId === viewerStudioId;
      const priced = mine ? proposalPriceAt(state, p, week) : null;
      return {
        issuerStudioId: p.issuerStudioId,
        submittedWeek: p.submittedWeek,
        termWeeks: p.termWeeks,
        effectiveWeek: p.startWeek,
        premiumTier: mine ? p.premiumTier : UNKNOWN,
        annualSalary: priced === null ? UNKNOWN : priced.annualSalary,
        signingBonus: priced === null ? UNKNOWN : priced.signingBonus,
        promise: mine ? disclosedPromise(state, p) : UNKNOWN
      };
    }),
    settlementReasons: settlement?.reasons ?? []
  };
}
function disclosedPromise(state, proposal) {
  const id = proposal.promises[0];
  if (id === void 0) return null;
  const promise = state.promises.find((p) => p.promiseId === id);
  if (promise === void 0) return null;
  return {
    family: promise.family,
    count: promise.predicate.count,
    ...disclosedPromiseTerms(state, promise.issuerStudioId, promise.predicate),
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    classification: promise.feasibilityReceipt.classification
  };
}
export function releaseDisclosure(state, talentId, week = state.market.tick) {
  const contract = activeContract(state, talentId, week);
  if (contract === void 0) {
    throw new Error(`talentMarket: "${talentId}" has no active contract to release (D-11.9)`);
  }
  const remainingWeeks = Math.max(0, contract.endWeekExclusive - week);
  const capApplies = remainingWeeks > TUNING.HIRING_TERMINATION_CAP_WEEKS;
  const consequences = [
    capApplies ? "the cap applies: the charge is twenty-six weeks of pay, not the whole remaining guarantee" : "no cap applies: fewer than twenty-six weeks remain, so the charge is all remaining guaranteed pay",
    "the charge is paid now and may take cash negative — release is not solvency-gated",
    "they leave the roster this week as a free agent; any entered studio may sign them at once",
    "they ask no less than this contract’s salary from this studio until its original end week",
    "their open market case closes and every competing proposal is invalidated",
    "the release is published this week as a public employment transition",
    "recorded credits and career history stay on the record"
  ];
  return {
    remainingWeeks,
    remainingGuaranteedCompensation: guaranteedComp(contract, week),
    capApplies,
    charge: terminationCost(contract, week),
    effectiveEndWeek: week,
    consequences
  };
}
export function rivalProposalTrigger(state, hollywood, business, descriptor, week) {
  __m0WiringProbe.call("rivalProposalTrigger");
  const m0ObserveTrigger = descriptor.talentId === M0_SUBJECT && week === 196 && M0_ISSUERS.includes(business.studioId);
  if (descriptor.subjectStudioId === business.studioId) {
    if (m0ObserveTrigger) m0Record(
      state,
      "triggerInputs",
      business.studioId,
      {
        branch: "incumbent",
        subjectStudioId: descriptor.subjectStudioId,
        decisionWeek: descriptor.decisionWeek,
        result: true
      }
    );
    return true;
  }
  const role = state.talent.find((t) => t.id === descriptor.talentId)?.role;
  if (role === void 0) {
    if (m0ObserveTrigger) m0Record(
      state,
      "triggerInputs",
      business.studioId,
      {
        branch: "roleMissing",
        subjectStudioId: descriptor.subjectStudioId,
        decisionWeek: descriptor.decisionWeek,
        role: null,
        result: false
      }
    );
    return false;
  }
  const own = hollywood.activeEmploymentOrdinals.map((i) => hollywood.employment[i]).filter((e) => e.studioId === business.studioId && e.terms.talentId !== descriptor.talentId && e.terms.startWeek <= week && (e.endedWeek === null || week < e.endedWeek));
  const sameRole = own.filter((e) => state.talent.find((t) => t.id === e.terms.talentId)?.role === role);
  const expiringSameRole = sameRole.some((e) => e.terms.endWeekExclusive <= descriptor.decisionWeek);
  if (expiringSameRole) {
    if (m0ObserveTrigger) m0Record(
      state,
      "triggerInputs",
      business.studioId,
      {
        branch: "expiringSameRole",
        role,
        decisionWeek: descriptor.decisionWeek,
        sameRoleEndWeeks: sameRole.map((e) => e.terms.endWeekExclusive),
        result: true
      }
    );
    return true;
  }
  const required = RIVAL_TEAM_ROLES.filter((r) => r === role).length;
  const heldAtEffectiveWeek = sameRole.filter((e) => e.terms.endWeekExclusive > descriptor.decisionWeek).length;
  const result = heldAtEffectiveWeek < required;
  if (m0ObserveTrigger) m0Record(
    state,
    "triggerInputs",
    business.studioId,
    {
      branch: "seatDeficit",
      role,
      decisionWeek: descriptor.decisionWeek,
      sameRoleEndWeeks: sameRole.map((e) => e.terms.endWeekExclusive),
      required,
      heldAtEffectiveWeek,
      result
    }
  );
  return result;
}
const DESCRIPTOR_ORDER = ["compensation", "term", "opportunity", "trust", "relationships", "standing", "incumbency"];
const DESCRIPTOR_REASON = {
  compensation: "their compensation band ranked above the others",
  term: "their term matched what this person prefers",
  opportunity: "they offered an opportunity",
  trust: "their record with this person ranked above the others",
  standing: "their studio standing ranked higher",
  incumbency: "they are the current employer"
};
function isProven(state, talentId) {
  __m0WiringProbe.call("isProven");
  const talent = state.talent.find((t) => t.id === talentId);
  return talent !== void 0 && (careerIdentity(talent).identityDisciplines.length > 0 || talent.age >= 30);
}
function priorityOrder(state, talentId) {
  return isProven(state, talentId) ? ["compensation", "term", "trust", "relationships", "incumbency", "standing", "opportunity"] : ["opportunity", "compensation", "relationships", "term", "trust", "standing", "incumbency"];
}
function preferredTerm(state, talentId) {
  const options = TUNING.CONTRACT_TERM_OPTIONS;
  return isProven(state, talentId) ? options[options.length - 1] : options[0];
}
export function publicPriorityOrder(state, talentId) {
  return priorityOrder(state, talentId);
}
export function publicPreferredTerm(state, talentId) {
  return preferredTerm(state, talentId);
}
export function publicPreferredOpportunity(state, talentId) {
  if (state.talent.find((t) => t.id === talentId)?.role === "director") {
    if (talentId === M0_SUBJECT) m0Record(
      state,
      "publicPreferredOpportunity",
      null,
      { preferred: "directingOpportunity", evaluatedAt: "existing publicPreferredOpportunity call" }
    );
    return "directingOpportunity";
  }
  const preferred = isProven(state, talentId) ? "anyCastAppearance" : "significantCastRole";
  if (talentId === M0_SUBJECT) m0Record(
    state,
    "publicPreferredOpportunity",
    null,
    { preferred, evaluatedAt: "existing publicPreferredOpportunity call" }
  );
  return preferred;
}
export function promiseMatchesPreferredOpportunity(state, talentId, promise) {
  if (publicPreferredOpportunity(state, talentId) === "directingOpportunity") {
    return promise.family === "DIRECTING_COUNT" && "kind" in promise.predicate && promise.predicate.kind === "directorCount";
  }
  if (isOpportunityPredicate(promise.predicate)) return publicPreferredOpportunity(state, talentId) === "anyCastAppearance" || promise.predicate.seatClass === "lead" || promise.predicate.seatClass === "leadOrAntagonist";
  if (promise.family === "APPEARANCE_COUNT") {
    return publicPreferredOpportunity(state, talentId) === "anyCastAppearance";
  }
  return promise.family === "LEAD_OR_SIGNIFICANT_ROLE_COUNT" && "kind" in promise.predicate && promise.predicate.kind === "castRoleCount" && (promise.predicate.seatClass === "lead" || promise.predicate.seatClass === "leadOrAntagonist");
}
const STANDING_BAND_TOLERANCE = 5;
function standingMean(s) {
  return (s.audienceAwareness + s.industryPrestige + s.commercialConfidence) / 3;
}
function issuerStanding(state, issuerStudioId) {
  const hollywood = state.hollywood;
  if (issuerStudioId === hollywood.playerStudioId) return standingMean(state.studio.standing);
  const business = hollywood.businesses.find((b) => b.studioId === issuerStudioId);
  return business === void 0 ? 0 : standingMean(business.standing);
}
function attachedFeasibility(state, proposal, week, capture) {
  __m0WiringProbe.call("attachedFeasibility");
  const id = proposal.promises[0];
  if (id === void 0) {
    if (capture !== void 0) capture.record("NO_ATTACHED_PROMISE", { proposalDigest: proposal.digest });
    return null;
  }
  const promise = state.promises.find((p) => p.promiseId === id);
  if (promise === void 0) {
    if (capture !== void 0) throw new Error("M0 observer attached promise root missing");
    return null;
  }
  return promiseFeasibility(state, {
    family: promise.family,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: promise.predicate,
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    startWeek: proposal.startWeek,
    termWeeks: proposal.termWeeks,
    promiseId: promise.promiseId
  }, week, capture);
}
function rosterAt(hollywood, issuerStudioId, subjectId, week) {
  const roster = /* @__PURE__ */ new Set();
  for (const row of hollywood.employment) {
    if (row.studioId !== issuerStudioId || row.terms.talentId === subjectId) continue;
    if (row.terms.startWeek < week && (row.endedWeek === null || week < row.endedWeek)) roster.add(row.terms.talentId);
  }
  return roster;
}
function bandsFor(state, proposals, kase, week, m0Case) {
  __m0WiringProbe.call("bandsFor");
  const hollywood = state.hollywood;
  const standings = proposals.map((p) => issuerStanding(state, p.issuerStudioId));
  const highest = Math.max(...standings);
  const lowest = Math.min(...standings);
  const wanted = preferredTerm(state, kase.talentId);
  const options = TUNING.CONTRACT_TERM_OPTIONS;
  const out = /* @__PURE__ */ new Map();
  proposals.forEach((p, index) => {
    const compensation = p.premiumTier >= 1.15 ? 2 : p.premiumTier > 1 ? 1 : 0;
    const steps = Math.abs(options.indexOf(p.termWeeks) - options.indexOf(wanted));
    const term = options.indexOf(p.termWeeks) < 0 ? 0 : steps === 0 ? 2 : steps === 1 ? 1 : 0;
    const mine = standings[index];
    const standing = mine >= highest - STANDING_BAND_TOLERANCE ? 2 : mine <= lowest + STANDING_BAND_TOLERANCE ? 0 : 1;
    const incumbency = p.issuerStudioId === kase.subjectStudioId ? 1 : 0;
    const promise = state.promises.find((candidate) => candidate.promiseId === p.promises[0]);
    const capture = m0Case === void 0 ? void 0 : m0Capture(state, m0Case, p, "chooserBand", index);
    const feasibility = attachedFeasibility(state, p, week, capture);
    const opportunity = promise !== void 0 && promiseMatchesPreferredOpportunity(state, kase.talentId, promise) && feasibility?.classification === "REASONABLY_ACHIEVABLE" ? 1 : 0;
    const band = trustDescriptor(state, kase.talentId, p.issuerStudioId, week).label;
    const trust = band === "Reliable" ? 2 : band === "Mixed record" ? 1 : 0;
    const ties = rosterTies(state, kase.talentId, rosterAt(hollywood, p.issuerStudioId, kase.talentId, week), week).map((tie) => ({ ...tie, hostile: tie.tier === "Enemies" || tie.tier === "Nemeses" }));
    const relationships = ties.some((t) => t.tier === "CloseFriends" || t.tier === "Inseparable" || t.partners && !t.hostile) ? 2 : ties.some((t) => t.hostile) ? 0 : 1;
    if (kase.talentId === M0_SUBJECT) m0Record(state, "bands", p.issuerStudioId, { ...m0ChooserRef(state, p), survivorOrdinal: index, proposalId: p.digest, compensation, term, opportunity, trust, relationships, standing, incumbency });
    out.set(p, { compensation, term, opportunity, trust, relationships, standing, incumbency });
  });
  return out;
}
function pairwiseWins(a, b) {
  return DESCRIPTOR_ORDER.filter((key) => a[key] > b[key]).length;
}
function dominates(a, b) {
  return DESCRIPTOR_ORDER.every((key) => a[key] >= b[key]) && DESCRIPTOR_ORDER.some((key) => a[key] > b[key]);
}
function chooseProposal(state, kase, survivors, week, m0Case) {
  __m0WiringProbe.call("chooseProposal");
  if (survivors.length === 0) return { winner: null, tiedCount: 0 };
  const bands = bandsFor(state, survivors, kase, week, m0Case);
  const live = survivors.filter((p) => !survivors.some((q) => {
    if (q === p) return false;
    const result = dominates(bands.get(q), bands.get(p));
    if (kase.talentId === M0_SUBJECT) m0Record(
      state,
      "dominanceComparison",
      q.issuerStudioId,
      {
        challenger: m0ChooserRef(state, q),
        target: m0ChooserRef(state, p),
        challengerBands: bands.get(q),
        targetBands: bands.get(p),
        result
      }
    );
    return result;
  }));
  const pool = live.length > 0 ? live : survivors;
  if (kase.talentId === M0_SUBJECT) m0Record(state, "dominance", null, {
    submitted: m0ChooserRefs(state, survivors),
    live: m0ChooserRefs(state, live),
    pool: m0ChooserRefs(state, pool),
    removed: m0ChooserRefs(state, survivors.filter((p) => !live.includes(p)))
  });
  const score = /* @__PURE__ */ new Map();
  for (const p of pool) {
    let wins = 0;
    for (const q of pool) {
      if (q === p) continue;
      const pWins = pairwiseWins(bands.get(p), bands.get(q));
      const qWins = pairwiseWins(bands.get(q), bands.get(p));
      if (kase.talentId === M0_SUBJECT) m0Record(state, "pairwise", p.issuerStudioId, {
        proposal: m0ChooserRef(state, p),
        against: m0ChooserRef(state, q),
        proposalBands: bands.get(p),
        againstBands: bands.get(q),
        pWins,
        qWins
      });
      if (pWins > qWins) wins++;
    }
    score.set(p, wins);
    if (kase.talentId === M0_SUBJECT) m0Record(state, "copelandScore", p.issuerStudioId, { proposal: m0ChooserRef(state, p), wins });
  }
  const best = Math.max(...pool.map((p) => score.get(p)));
  let tied = pool.filter((p) => score.get(p) === best);
  const chooserStages = { priority: "NOT_REACHED", submission: "NOT_REACHED", incumbent: "NOT_REACHED" };
  if (tied.length > 1) {
    const order = priorityOrder(state, kase.talentId);
    chooserStages.priority = "REACHED";
    if (kase.talentId === M0_SUBJECT) m0Record(
      state,
      "priorityOrder",
      null,
      { order: [...order], initialTie: m0ChooserRefs(state, tied) }
    );
    let priorityOrdinal = 0;
    for (const key of order) {
      const top = Math.max(...tied.map((p) => bands.get(p)[key]));
      const narrowed = tied.filter((p) => bands.get(p)[key] === top);
      if (kase.talentId === M0_SUBJECT) m0Record(
        state,
        "priorityTie",
        null,
        {
          priorityOrdinal,
          key,
          top,
          before: m0ChooserRefs(state, tied),
          candidateBands: tied.map((p) => ({ proposal: m0ChooserRef(state, p), band: bands.get(p)[key] })),
          after: m0ChooserRefs(state, narrowed)
        }
      );
      priorityOrdinal++;
      if (narrowed.length < tied.length) tied = narrowed;
      if (tied.length === 1) break;
    }
  }
  if (tied.length > 1) {
    const earliest = Math.min(...tied.map((p) => p.submittedWeek));
    const before = tied;
    tied = tied.filter((p) => p.submittedWeek === earliest);
    chooserStages.submission = "REACHED";
    if (kase.talentId === M0_SUBJECT) m0Record(
      state,
      "submissionTie",
      null,
      {
        earliest,
        before: m0ChooserRefs(state, before),
        after: m0ChooserRefs(state, tied),
        submittedWeeks: before.map((p) => ({ proposal: m0ChooserRef(state, p), submittedWeek: p.submittedWeek }))
      }
    );
  }
  if (tied.length > 1) {
    const incumbent = tied.filter((p) => p.issuerStudioId === kase.subjectStudioId);
    const before = tied;
    if (incumbent.length > 0) tied = incumbent;
    chooserStages.incumbent = "REACHED";
    if (kase.talentId === M0_SUBJECT) m0Record(
      state,
      "incumbentTie",
      null,
      {
        subjectStudioId: kase.subjectStudioId,
        before: m0ChooserRefs(state, before),
        incumbent: m0ChooserRefs(state, incumbent),
        after: m0ChooserRefs(state, tied)
      }
    );
  }
  if (kase.talentId === M0_SUBJECT) m0Record(
    state,
    "chooserStages",
    null,
    { best, ...chooserStages, finalTie: m0ChooserRefs(state, tied) }
  );
  if (tied.length !== 1) {
    if (kase.talentId === M0_SUBJECT) m0Record(
      state,
      "chooserTerminal",
      null,
      { winner: null, tiedCount: tied.length, finalTie: m0ChooserRefs(state, tied), chooserStages }
    );
    return { winner: null, tiedCount: tied.length };
  }
  const winner = tied[0];
  const others = survivors.filter((p) => p !== winner);
  const reasons = others.length === 0 ? ["theirs was the only proposal on the table"] : DESCRIPTOR_ORDER.filter((key) => others.every((q) => bands.get(winner)[key] > bands.get(q)[key])).map((key) => key === "relationships" ? relationshipsReasonSentence(bands.get(winner).relationships) : DESCRIPTOR_REASON[key]);
  const finalReasons = reasons.length > 0 ? reasons : ["their proposal ranked above the others overall"];
  if (kase.talentId === M0_SUBJECT) m0Record(
    state,
    "chooserTerminal",
    winner.issuerStudioId,
    {
      winner: m0ChooserRef(state, winner),
      reasons: finalReasons,
      chooserStages,
      others: m0ChooserRefs(state, others)
    }
  );
  return { winner, reasons: finalReasons };
}
function closeCase(state, kase, outcome, week, reason, receiptStudioId, reasons, dropped = []) {
  const cases = state.talentMarket.cases.map((c) => c === kase ? { ...c, outcome, closedWeek: week, reason } : c);
  const market = appendReceipt(
    {
      ...state.talentMarket,
      cases,
      // A terminal case keeps no CURRENT proposal: the receipt is the record.
      proposals: state.talentMarket.proposals.filter((p) => p.talentId !== kase.talentId)
    },
    { kind: outcome, week, talentId: kase.talentId, studioId: receiptStudioId, reasons, dropped }
  );
  return { ...state, talentMarket: market };
}
function commitPlayerWinner(state, proposal, week) {
  const priced = proposalPriceAt(state, proposal, week);
  const contract = {
    talentId: proposal.talentId,
    annualSalary: priced.annualSalary,
    signingBonus: priced.signingBonus,
    startWeek: week,
    endWeekExclusive: week + proposal.termWeeks,
    termWeeks: proposal.termWeeks
  };
  const entry = {
    week,
    kind: "signingBonus",
    amount: -priced.signingBonus,
    talentId: proposal.talentId,
    note: "market settlement signing bonus"
  };
  return recordPlayerEmployment({
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - priced.signingBonus },
    contracts: [...state.contracts, contract],
    ledger: [...state.ledger, entry],
    freeAgents: state.freeAgents.filter((id) => id !== proposal.talentId),
    economyEngagedEver: true
  });
}
function commitRivalWinner(state, proposal, week) {
  const priced = proposalPriceAt(state, proposal, week);
  const source = state.hollywood;
  const businesses = source.businesses.map((b) => b.studioId !== proposal.issuerStudioId ? b : {
    ...b,
    account: {
      ...b.account,
      periods: b.account.periods.map((p, i) => i === b.account.periods.length - 1 ? { ...p, movements: { ...p.movements } } : p)
    }
  });
  const business = businesses.find((b) => b.studioId === proposal.issuerStudioId);
  const contractId = `${proposal.issuerStudioId}:contract:${proposal.talentId}:${week}`;
  const terms = {
    talentId: proposal.talentId,
    annualSalary: priced.annualSalary,
    signingBonus: priced.signingBonus,
    startWeek: week,
    endWeekExclusive: week + proposal.termWeeks,
    termWeeks: proposal.termWeeks
  };
  moveRivalMoney(business.account, "signing", -priced.signingBonus, week);
  const ordinal = source.employment.length;
  const receipt = {
    eventId: `industry-event-${source.nextReceipt}`,
    week,
    studioId: proposal.issuerStudioId,
    kind: "employment",
    talentId: proposal.talentId,
    fromStudioId: null,
    toStudioId: proposal.issuerStudioId,
    contractId,
    reason: "replacement"
  };
  return {
    ...state,
    hollywood: {
      ...source,
      businesses,
      employment: [...source.employment, { contractId, studioId: proposal.issuerStudioId, terms, endedWeek: null, reason: "replacement" }],
      activeEmploymentOrdinals: [...source.activeEmploymentOrdinals, ordinal],
      receipts: [...source.receipts, receipt],
      nextReceipt: source.nextReceipt + 1
    }
  };
}
function studioLabel(state, studioId) {
  return state.hollywood?.identities.find((s) => s.studioId === studioId)?.name ?? studioId;
}
const DROP_SENTENCE = {
  issuerNotEntered: (studio) => `${studio} had not entered the industry by the decision week.`,
  subjectCommittedElsewhere: (studio) => `${studio}'s offer lapsed — this person was already committed elsewhere by the decision week.`,
  startWeekMoved: (studio) => `${studio}'s offer named a start week that no longer matches this decision.`,
  belowAsk: (studio) => `${studio}'s offer fell below this person's reservation for that term.`,
  materialTermsChanged: (studio) => `${studio}'s terms changed since submission.`,
  bonusUnaffordable: (studio) => `${studio} could not fund the signing bonus.`,
  noSeatForRole: (studio) => `${studio} had no seat open for this person's role at the decision week.`,
  promiseNotFeasible: (studio) => `${studio}'s attached promise no longer had a feasible path by the decision week.`,
  issuerDistrusted: (studio) => `${studio} holds a record this person distrusts.`,
  nemesisOnRoster: (studio) => `${studio}'s roster holds someone this person will not work beside.`,
  retirementCap: (studio) => `${studio}'s offer would bind this person past their announced retirement.`,
  belowRetirementReservation: (studio) => `${studio}'s offer fell below this person's reservation for postponing their retirement.`
};
function seatsHeldAfter(state, hollywood, studioId, role, week) {
  let held = 0;
  for (const ordinal of hollywood.activeEmploymentOrdinals) {
    const row = hollywood.employment[ordinal];
    if (row.studioId !== studioId || row.endedWeek !== null || row.terms.endWeekExclusive <= week) continue;
    if (state.talent.find((t) => t.id === row.terms.talentId)?.role === role) held++;
  }
  return held;
}
function survivesFreeze(state, proposal, week, feasibility) {
  __m0WiringProbe.call("survivesFreeze");
  const hollywood = state.hollywood;
  const enteredIds = enteredStudioIds(hollywood);
  const issuerEntered = enteredIds.includes(proposal.issuerStudioId);
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "issuerNotEntered",
    !issuerEntered,
    true,
    { issuerEntered, enteredIds }
  )) return "issuerNotEntered";
  const extension = extensionAdmitted(state, proposal, week);
  const capRefusal = !extension ? contractEndRefusal(state, proposal.talentId, week + proposal.termWeeks) : null;
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "retirementCap",
    !extension && capRefusal !== null,
    true,
    { extension, proposedEndWeek: week + proposal.termWeeks, capRefusal: extension ? "NOT_EVALUATED" : capRefusal }
  )) return "retirementCap";
  const trust = trustDescriptor(state, proposal.talentId, proposal.issuerStudioId, week).label;
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "issuerDistrusted",
    trust === "Distrusted",
    true,
    { trust }
  )) return "issuerDistrusted";
  const roster = rosterAt(hollywood, proposal.issuerStudioId, proposal.talentId, week);
  const rosterTiers = tiersOnRoster(state, proposal.talentId, roster, week);
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "nemesisOnRoster",
    rosterTiers.includes("Nemeses"),
    true,
    { rosterIds: [...roster], rosterTiers }
  )) return "nemesisOnRoster";
  const currentTerms = subjectTerms(state, proposal.talentId, week);
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "subjectCommittedElsewhere",
    currentTerms !== void 0,
    true,
    {
      subjectTermsPresent: currentTerms !== void 0,
      currentTerms: currentTerms === void 0 ? null : {
        startWeek: currentTerms.startWeek,
        endWeekExclusive: currentTerms.endWeekExclusive,
        termWeeks: currentTerms.termWeeks
      }
    }
  )) return "subjectCommittedElsewhere";
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "startWeekMoved",
    proposal.startWeek !== week,
    true,
    { proposalStartWeek: proposal.startWeek, decisionWeek: week }
  )) return "startWeekMoved";
  if (proposal.issuerStudioId !== hollywood.playerStudioId) {
    const role = state.talent.find((t) => t.id === proposal.talentId)?.role;
    let held = 0;
    let required = 0;
    if (role !== void 0) {
      held = seatsHeldAfter(state, hollywood, proposal.issuerStudioId, role, week);
      required = RIVAL_TEAM_ROLES.filter((r) => r === role).length;
    }
    if (m0FreezeCheck(
      state,
      proposal,
      week,
      "noSeatForRole",
      role !== void 0 && held >= required,
      role !== void 0,
      {
        role: role ?? null,
        held: role === void 0 ? "NOT_EVALUATED" : held,
        required: role === void 0 ? "NOT_EVALUATED" : required
      }
    )) return "noSeatForRole";
  } else m0FreezeCheck(
    state,
    proposal,
    week,
    "noSeatForRole",
    false,
    false,
    { role: "NOT_EVALUATED", held: "NOT_EVALUATED", required: "NOT_EVALUATED" }
  );
  const priced = proposalPriceAt(state, proposal, week);
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "belowAsk",
    priced.annualSalary < priced.askAnnual,
    true,
    { askAnnual: priced.askAnnual, annualSalary: priced.annualSalary, signingBonus: priced.signingBonus }
  )) return "belowAsk";
  const retirementAsk = extension ? extensionReservation(priced.askAnnual) : null;
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "belowRetirementReservation",
    retirementAsk !== null && priced.annualSalary < retirementAsk,
    true,
    { extension, retirementAsk: retirementAsk ?? "NOT_EVALUATED", annualSalary: priced.annualSalary }
  )) return "belowRetirementReservation";
  const redrawn = proposalDraft(
    state,
    proposal.issuerStudioId,
    proposal.talentId,
    proposal.termWeeks,
    proposal.premiumTier,
    week,
    attachedPromiseDigest(state, proposal.promises)
  );
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "materialTermsChanged",
    redrawn.digest !== proposal.digest,
    true,
    { redrawnDigest: redrawn.digest, storedDigest: proposal.digest }
  )) return "materialTermsChanged";
  if (m0FreezeCheck(
    state,
    proposal,
    week,
    "promiseNotFeasible",
    proposal.promises.length > 0 && feasibility?.classification !== "REASONABLY_ACHIEVABLE",
    true,
    {
      promiseIds: [...proposal.promises],
      feasibilityClass: feasibility?.classification ?? null,
      feasibilityInputsDigest: feasibility?.inputsDigest ?? null
    }
  )) {
    return "promiseNotFeasible";
  }
  const affordability = affordabilityRefusal(
    state,
    proposal.issuerStudioId,
    priced.signingBonus,
    week,
    proposal.talentId === M0_SUBJECT && week === 208 ? (detail) => {
      const identity = m0ProposalIdentity(state, proposal);
      m0Record(
        state,
        "freezeAffordability",
        proposal.issuerStudioId,
        {
          proposalDigest: proposal.digest,
          proposalSourceIndex: identity.proposalSourceIndex,
          proposalOccurrence: identity.proposalOccurrence,
          ...detail
        }
      );
    } : void 0
  );
  return m0FreezeCheck(
    state,
    proposal,
    week,
    "bonusUnaffordable",
    affordability !== null,
    true,
    { signingBonus: priced.signingBonus, refusal: affordability }
  ) ? "bonusUnaffordable" : null;
}
function commitWinningPromise(state, winner, week, feasibilityReceipt) {
  const id = winner.promises[0];
  if (id === void 0) return state;
  const row = state.hollywood?.employment.find(
    (e) => e.terms.talentId === winner.talentId && e.studioId === winner.issuerStudioId && e.endedWeek === null && e.terms.startWeek === week
  );
  if (row === void 0 || feasibilityReceipt?.classification !== "REASONABLY_ACHIEVABLE") {
    throw new Error("talentMarket: winning promise requires its committed employment and frozen feasibility receipt");
  }
  return { ...state, promises: state.promises.map((p) => p.promiseId === id ? { ...p, contractId: row.contractId, feasibilityReceipt } : p) };
}
const EXTENSION_ACCEPTED = "they accepted the one final extension before retiring";
function settleCase(state, kase, week) {
  __m0WiringProbe.call("settleCase");
  const m0Case = kase.talentId === M0_SUBJECT && week === 208 ? m0CaseIdentity(state, kase) : void 0;
  const submitted = state.talentMarket.proposals.filter((p) => p.talentId === kase.talentId);
  if (m0Case !== void 0) m0Record(state, "freezeStart", null, {
    caseKey: m0Case.caseKey,
    caseOccurrence: m0Case.caseOccurrence,
    caseSourceIndex: m0Case.caseSourceIndex,
    contractId: kase.contractId,
    priorCases: state.talentMarket.cases.slice(0, m0Case.caseSourceIndex).map((c) => ({ talentId: c.talentId, subjectStudioId: c.subjectStudioId, contractId: c.contractId, openedWeek: c.openedWeek, outcome: c.outcome })),
    submitted: submitted.map((p, submittedOrdinal) => ({ submittedOrdinal, proposal: m0ProposalSummary(p) })),
    cash: state.hollywood.businesses.map((b) => ({ studioId: b.studioId, cash: b.account.cash, reserveWeeks: b.policy.reserveWeeks })),
    activeEmploymentOrdinals: [...state.hollywood.activeEmploymentOrdinals],
    employment: state.hollywood.employment.filter((e) => e.terms.talentId === kase.talentId).map((e) => ({ contractId: e.contractId, studioId: e.studioId, startWeek: e.terms.startWeek, endWeekExclusive: e.terms.endWeekExclusive, endedWeek: e.endedWeek }))
  });
  if (submitted.length === 0) {
    return closeCase(state, kase, "expired", week, "no proposal was submitted", null, ["no studio proposed before the decision week"]);
  }
  const frozen = submitted.map((proposal, submittedOrdinal) => {
    const capture = m0Case === void 0 ? void 0 : m0Capture(state, m0Case, proposal, "freezeProposal", submittedOrdinal);
    const feasibility2 = attachedFeasibility(state, proposal, week, capture);
    const drop = survivesFreeze(state, proposal, week, feasibility2);
    if (kase.talentId === M0_SUBJECT) m0Record(state, "freezeProposal", proposal.issuerStudioId, { proposal: m0ProposalSummary(proposal), feasibility: m0FeasibilitySummary(feasibility2), drop });
    return { proposal, feasibility: feasibility2, drop };
  });
  const survivors = frozen.filter((f) => f.drop === null).map((f) => f.proposal);
  if (kase.talentId === M0_SUBJECT) m0Record(state, "freezeSurvivors", null, {
    submittedOrder: frozen.map((f, submittedOrdinal) => ({ submittedOrdinal, digest: f.proposal.digest })),
    droppedOrder: frozen.map((f, submittedOrdinal) => ({ f, submittedOrdinal })).filter((row) => row.f.drop !== null).map((row) => ({ submittedOrdinal: row.submittedOrdinal, digest: row.f.proposal.digest, reason: row.f.drop })),
    survivorOrder: frozen.map((f, submittedOrdinal) => ({ f, submittedOrdinal })).filter((row) => row.f.drop === null).map((row, survivorOrdinal) => ({
      submittedOrdinal: row.submittedOrdinal,
      survivorOrdinal,
      digest: row.f.proposal.digest
    }))
  });
  const dropped = frozen.filter((f) => f.drop !== null).map((f) => DROP_SENTENCE[f.drop](studioLabel(state, f.proposal.issuerStudioId)));
  if (survivors.length === 0) {
    if (m0Case !== void 0) m0Record(
      state,
      "chooserNotReached",
      null,
      {
        reason: "ALL_PROPOSALS_DROPPED",
        caseSourceIndex: m0Case.caseSourceIndex,
        submitted: m0ChooserRefs(state, submitted),
        survivors: []
      }
    );
    return closeCase(state, kase, "declined", week, "all proposals dropped", null, dropped, dropped);
  }
  if (isExtensionCase(kase)) {
    if (m0Case !== void 0) m0Record(
      state,
      "chooserNotReached",
      null,
      {
        reason: "RETIREMENT_EXTENSION",
        caseSourceIndex: m0Case.caseSourceIndex,
        submitted: m0ChooserRefs(state, submitted),
        survivors: m0ChooserRefs(state, survivors)
      }
    );
    const winner = survivors[0];
    const extended = commitRetirementExtension(state, kase.talentId, week);
    const committed2 = winner.issuerStudioId === state.hollywood.playerStudioId ? commitPlayerWinner(extended, winner, week) : commitRivalWinner(extended, winner, week);
    return closeCase(committed2, kase, "settled", week, "settled at the decision week", winner.issuerStudioId, [EXTENSION_ACCEPTED], dropped);
  }
  const chosen = chooseProposal(state, kase, survivors, week, m0Case);
  if (kase.talentId === M0_SUBJECT) m0Record(state, "choice", chosen.winner?.issuerStudioId ?? null, { winnerProposalId: chosen.winner?.digest ?? null, reasons: "reasons" in chosen ? chosen.reasons : null, tiedCount: "tiedCount" in chosen ? chosen.tiedCount : null });
  if (chosen.winner === null) {
    return closeCase(
      state,
      kase,
      "declined",
      week,
      "tie exhausted",
      null,
      [`this person could not separate ${String(chosen.tiedCount)} equally ranked proposals.`],
      dropped
    );
  }
  const committed = chosen.winner.issuerStudioId === state.hollywood.playerStudioId ? commitPlayerWinner(state, chosen.winner, week) : commitRivalWinner(state, chosen.winner, week);
  const feasibility = frozen.find((f) => f.proposal === chosen.winner).feasibility;
  return closeCase(
    commitWinningPromise(committed, chosen.winner, week, feasibility),
    kase,
    "settled",
    week,
    "settled at the decision week",
    chosen.winner.issuerStudioId,
    chosen.reasons,
    dropped
  );
}
const M0_SUBJECT = "person-studio-aca408ec-r01-0";
function m0CaseKey(kase) {
  return JSON.stringify([kase.talentId, kase.subjectStudioId, kase.contractId, kase.openedWeek]);
}
function m0CaseIdentity(state, kase) {
  if (!kase.talentId || !kase.subjectStudioId || !kase.contractId || !Number.isInteger(kase.openedWeek)) {
    throw new Error("M0 observer invalid case identity");
  }
  const source = state.talentMarket.cases;
  const caseSourceIndex = source.findIndex((row) => row === kase);
  if (caseSourceIndex < 0) throw new Error("M0 observer case absent from source array");
  const caseKey = m0CaseKey(kase);
  const caseOccurrence = source.slice(0, caseSourceIndex).filter((row) => m0CaseKey(row) === caseKey).length;
  return { caseKey, caseOccurrence, caseSourceIndex };
}
function m0ProposalIdentity(state, proposal) {
  const source = state.talentMarket.proposals;
  const proposalSourceIndex = source.findIndex((row) => row === proposal);
  if (proposalSourceIndex < 0 || !proposal.talentId || !proposal.issuerStudioId || !proposal.digest || !Number.isInteger(proposal.submittedWeek)) throw new Error("M0 observer invalid proposal identity");
  const key = (p) => JSON.stringify([p.talentId, p.issuerStudioId, p.digest, p.submittedWeek]);
  const proposalKey = key(proposal);
  const proposalOccurrence = source.slice(0, proposalSourceIndex).filter((row) => key(row) === proposalKey).length;
  return { proposalKey, proposalOccurrence, proposalSourceIndex };
}
let m0FeasibilitySink = createM0FeasibilitySink();
export function drainM0FeasibilityRows() {
  const rows = m0FeasibilitySink.rows();
  m0FeasibilitySink = createM0FeasibilitySink();
  return rows;
}
function m0Capture(state, kaseIdentity, proposal, phase, ordinal) {
  const proposalIdentity = m0ProposalIdentity(state, proposal);
  const base = {
    era: "M0",
    week: state.market.tick,
    ...kaseIdentity,
    subject: proposal.talentId,
    issuer: proposal.issuerStudioId,
    ...proposalIdentity
  };
  const context = { ...base, phase, ...phase === "authorCandidate" ? { candidateOrdinal: ordinal } : phase === "freezeProposal" ? { submittedOrdinal: ordinal } : { survivorOrdinal: ordinal } };
  __m0WiringProbe.call("m0SourceArrays", {
    context,
    cases: state.talentMarket.cases.map((row, sourceIndex) => ({ sourceIndex, key: m0CaseKey(row) })),
    proposals: state.talentMarket.proposals.map((row, sourceIndex) => ({
      sourceIndex,
      talentId: row.talentId,
      issuer: row.issuerStudioId,
      digest: row.digest,
      key: JSON.stringify([row.talentId, row.issuerStudioId, row.digest, row.submittedWeek])
    }))
  });
  if (!__m0WiringProbe.captureEnabled()) return void 0;
  return phase === "authorCandidate" ? m0FeasibilitySink.capture({ ...base, phase, candidateOrdinal: ordinal }) : phase === "freezeProposal" ? m0FeasibilitySink.capture({ ...base, phase, submittedOrdinal: ordinal }) : m0FeasibilitySink.capture({ ...base, phase, survivorOrdinal: ordinal });
}
const M0_ISSUERS = ["studio-aca408ec-r01", "studio-aca408ec-r02", "studio-aca408ec-r03"];
const M0_MAX_ROWS = 512;
const M0_MAX_ROW_BYTES = 16 * 1024;
const M0_MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const m0Rows = [];
let m0TotalBytes = 0;
function m0ProposalSummary(p) {
  return p === null ? null : {
    talentId: p.talentId,
    issuerStudioId: p.issuerStudioId,
    termWeeks: p.termWeeks,
    premiumTier: p.premiumTier,
    startWeek: p.startWeek,
    annualSalary: p.annualSalary,
    signingBonus: p.signingBonus,
    submittedWeek: p.submittedWeek,
    digest: p.digest,
    promiseIds: [...p.promises]
  };
}
function m0ChooserRef(state, proposal) {
  const identity = m0ProposalIdentity(state, proposal);
  return {
    digest: proposal.digest,
    proposalSourceIndex: identity.proposalSourceIndex,
    proposalOccurrence: identity.proposalOccurrence
  };
}
function m0ChooserRefs(state, proposals) {
  return proposals.map((proposal) => m0ChooserRef(state, proposal));
}
function m0FeasibilitySummary(f) {
  return f === null ? null : {
    classification: f.classification,
    bottleneck: f.bottleneck,
    inputsDigest: f.inputsDigest,
    rulesVersion: f.rulesVersion,
    week: f.week
  };
}
class M0ObserverError extends Error {
  constructor(message) {
    super(message);
    this.name = "M0ObserverError";
  }
}
function m0Record(state, phase, issuerStudioId, detail, contractId = null, variant = null) {
  if (!__m0WiringProbe.captureEnabled()) return;
  const __fault = __m0WiringProbe.consumeFault(phase);
  const __rowsBefore = m0Rows.length, __totalBefore = m0TotalBytes;
  try {
    const week = state.market.tick;
    if (week !== 196 && week !== 208) return;
    if (__fault === "row-cap") m0Rows.length = M0_MAX_ROWS;
    if (__fault === "total-byte-cap") m0TotalBytes = M0_MAX_TOTAL_BYTES;
    if (__fault === "row-byte-cap") detail = { pad: "x".repeat(M0_MAX_ROW_BYTES) };
    if (__fault === "serialization") {
      const cycle = {};
      cycle.self = cycle;
      detail = cycle;
    }
    if (m0Rows.length >= M0_MAX_ROWS) throw new M0ObserverError("M0 observer row bound exceeded");
    const occurrence = m0Rows.filter((row2) => {
      const r = row2;
      return r.week === week && r.issuerStudioId === issuerStudioId && r.phase === phase && r.contractId === contractId;
    }).length;
    const row = {
      schema: "c0-m0-market-decision/v2-step12",
      sequence: m0Rows.length,
      occurrence,
      week,
      subject: M0_SUBJECT,
      issuerStudioId,
      contractId,
      variant,
      hookId: "talentMarket." + phase,
      phase,
      detail
    };
    const encoded = JSON.stringify(row);
    if (encoded === void 0) throw new M0ObserverError("M0 observer unserializable row");
    const bytes = new TextEncoder().encode(encoded + "\n").length;
    if (bytes > M0_MAX_ROW_BYTES) throw new M0ObserverError("M0 observer row byte bound exceeded");
    if (m0TotalBytes + bytes > M0_MAX_TOTAL_BYTES) throw new M0ObserverError("M0 observer total byte bound exceeded");
    m0Rows.push(JSON.parse(encoded));
    m0TotalBytes += bytes;
  } catch (error) {
    if (error instanceof M0ObserverError) throw error;
    throw new M0ObserverError("M0 observer recording failed: " + (error instanceof Error ? error.message : typeof error));
  } finally {
    if (__fault !== null) {
      m0Rows.length = __rowsBefore;
      m0TotalBytes = __totalBefore;
    }
  }
}
const m0FreezeOrder = ["issuerNotEntered", "retirementCap", "issuerDistrusted", "nemesisOnRoster", "subjectCommittedElsewhere", "startWeekMoved", "noSeatForRole", "belowAsk", "belowRetirementReservation", "materialTermsChanged", "promiseNotFeasible", "bonusUnaffordable"];
function m0FreezeCheck(state, proposal, week, predicate, failed, evaluated = true, values = {}) {
  if (proposal.talentId === M0_SUBJECT && week === 208) {
    const identity = m0ProposalIdentity(state, proposal);
    const predicateOrdinal = m0FreezeOrder.indexOf(predicate);
    if (predicateOrdinal < 0) throw new Error("M0 unknown freeze predicate");
    m0Record(state, "freezePredicate", proposal.issuerStudioId, {
      proposalDigest: proposal.digest,
      proposalSourceIndex: identity.proposalSourceIndex,
      proposalOccurrence: identity.proposalOccurrence,
      predicateOrdinal,
      predicate,
      result: evaluated ? failed ? "FAILED" : "PASSED" : "NOT_EVALUATED",
      values
    });
    if (failed) {
      const index = m0FreezeOrder.indexOf(predicate);
      if (index < 0) throw new Error("M0 unknown freeze predicate");
      for (const [offset, remaining] of m0FreezeOrder.slice(index + 1).entries()) m0Record(
        state,
        "freezePredicate",
        proposal.issuerStudioId,
        {
          proposalDigest: proposal.digest,
          proposalSourceIndex: identity.proposalSourceIndex,
          proposalOccurrence: identity.proposalOccurrence,
          predicateOrdinal: index + 1 + offset,
          predicate: remaining,
          result: "NOT_REACHED",
          values: "NOT_EVALUATED"
        }
      );
    }
  }
  return failed;
}
export function drainM0MarketDecisionRows() {
  const rows = m0Rows.splice(0);
  m0TotalBytes = 0;
  return rows;
}
export function advanceTalentMarketWeek(state) {
  __m0WiringProbe.call("advanceTalentMarketWeek");
  __m0WiringProbe.beforeAdvance(state);
  if (state.talentMarket === void 0) {
    throw new Error("talentMarket: the Save V28 market root is missing — migrate this state to V28 before ticking it");
  }
  if (!talentMarketEngaged(state)) return state;
  const week = state.market.tick;
  let next = state;
  for (const kase of next.talentMarket.cases) {
    if (kase.outcome !== null) continue;
    if (releasedEarly(next, kase)) {
      next = closeCase(
        next,
        kase,
        "invalidated",
        week,
        "the subject was released early",
        null,
        ["the person was released early and is a free agent now"]
      );
      continue;
    }
    const record = retirementRecordFor(next, kase.talentId);
    if (record !== void 0 && record.announcedWeek >= kase.openedWeek) {
      next = closeCase(
        next,
        kase,
        "invalidated",
        week,
        "the subject announced retirement",
        null,
        ["the person announced their retirement and takes no new contract"]
      );
    }
  }
  const hollywood = next.hollywood;
  for (const ordinal of hollywood.activeEmploymentOrdinals) {
    const row = hollywood.employment[ordinal];
    if (row.endedWeek !== null) continue;
    if (!renewalWindowOpen(row.terms, week)) continue;
    if (next.talentMarket.cases.some((c) => c.contractId === row.contractId && !isExtensionCase(c))) continue;
    if (retirementRecordFor(next, row.terms.talentId) !== void 0) continue;
    next = discover(next, row, "expiry", week);
  }
  for (const record of next.careerLifecycle.records) {
    if (record.status !== "announced" || readExtensionUsed(record)) continue;
    if (week !== record.effectiveWeek - TUNING.RETIREMENT_EXTENSION_WINDOW_WEEKS) continue;
    const row = next.hollywood.employment.find((e) => e.terms.talentId === record.personId && e.terms.startWeek <= week && week < (e.endedWeek ?? e.terms.endWeekExclusive));
    if (row === void 0) continue;
    if (next.talentMarket.cases.some((c) => c.contractId === row.contractId && isExtensionCase(c))) continue;
    next = discover(next, row, "retirementExtension", week);
  }
  for (const kase of openCasesAt(next, week)) {
    const descriptor = {
      talentId: kase.talentId,
      subjectStudioId: kase.subjectStudioId,
      decisionWeek: decisionWeekOf(next, kase)
    };
    const extension = isExtensionCase(kase);
    const m0AuthorCase = week === 196 && kase.talentId === M0_SUBJECT ? m0CaseIdentity(next, kase) : void 0;
    for (const business of next.hollywood.businesses) {
      const observing = week === 196 && kase.talentId === M0_SUBJECT && M0_ISSUERS.includes(business.studioId);
      const attemptBase = observing ? {
        sourceOrder: next.hollywood.businesses.indexOf(business),
        nextDecisionWeek: business.nextDecisionWeek,
        subjectStudioId: kase.subjectStudioId,
        decisionWeek: descriptor.decisionWeek,
        reserveWeeks: business.policy.reserveWeeks,
        premiumInputs: {
          incumbent: business.studioId === kase.subjectStudioId,
          reserveWeeks: business.policy.reserveWeeks
        },
        cash: business.account.cash,
        extension
      } : null;
      if (week < business.nextDecisionWeek) {
        if (observing) m0Record(
          next,
          "issuerAttempt",
          business.studioId,
          {
            ...attemptBase,
            outcome: "CADENCE_NOT_RUN",
            existingProposal: "NOT_EVALUATED",
            trigger: "NOT_EVALUATED",
            premiumTier: "NOT_EVALUATED"
          },
          kase.contractId,
          kase.variant
        );
        continue;
      }
      const existing = next.talentMarket.proposals.find((p) => p.talentId === kase.talentId && p.issuerStudioId === business.studioId);
      if (existing !== void 0) {
        if (observing) m0Record(
          next,
          "issuerAttempt",
          business.studioId,
          {
            ...attemptBase,
            outcome: "EXISTING_PROPOSAL",
            existingProposal: m0ProposalSummary(existing),
            trigger: "NOT_EVALUATED",
            premiumTier: "NOT_EVALUATED"
          },
          kase.contractId,
          kase.variant
        );
        continue;
      }
      const m0Trigger = extension ? business.studioId === kase.subjectStudioId : rivalProposalTrigger(next, next.hollywood, business, descriptor, week);
      if (!m0Trigger) {
        if (observing) m0Record(
          next,
          "issuerAttempt",
          business.studioId,
          {
            ...attemptBase,
            outcome: "TRIGGER_FALSE",
            existingProposal: null,
            trigger: false,
            premiumTier: "NOT_EVALUATED"
          },
          kase.contractId,
          kase.variant
        );
        continue;
      }
      const premiumTier = extension ? extensionTier() : rivalPremiumTier(business, descriptor);
      if (premiumTier === void 0) {
        if (observing) m0Record(
          next,
          "issuerAttempt",
          business.studioId,
          {
            ...attemptBase,
            outcome: "TIER_UNAVAILABLE",
            existingProposal: null,
            trigger: true,
            premiumTier: null
          },
          kase.contractId,
          kase.variant
        );
        continue;
      }
      let termWeeks = null;
      let refusal = null;
      try {
        termWeeks = extension ? retirementRecordFor(next, kase.talentId).effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS - descriptor.decisionWeek : TUNING.HOLLYWOOD_CONTRACT_WEEKS;
        next = submitProposal(next, {
          talentId: kase.talentId,
          issuerStudioId: business.studioId,
          termWeeks,
          premiumTier
        });
      } catch (error) {
        if (error instanceof M0ObserverError) throw error;
        if (observing) refusal = error instanceof Error ? error.message : "UNCLASSIFIED_THROWN_VALUE:" + typeof error;
      }
      const submitted = observing ? next.talentMarket.proposals.find((p) => p.talentId === kase.talentId && p.issuerStudioId === business.studioId) ?? null : null;
      if (observing) m0Record(
        next,
        "issuerAttempt",
        business.studioId,
        {
          ...attemptBase,
          outcome: refusal !== null ? "SUBMISSION_REFUSED" : submitted === null ? "SUBMISSION_NO_PROPOSAL" : "SUBMITTED",
          existingProposal: null,
          trigger: true,
          premiumTier,
          termWeeks,
          refusal,
          proposalAfterSubmission: m0ProposalSummary(submitted)
        },
        kase.contractId,
        kase.variant
      );
      if (observing) m0Record(
        next,
        "proposalSubmitted",
        business.studioId,
        { proposal: m0ProposalSummary(submitted) },
        kase.contractId,
        kase.variant
      );
      next = authorRivalPromise(next, kase.talentId, business.studioId, m0AuthorCase);
      if (observing) m0Record(
        next,
        "promiseAuthored",
        business.studioId,
        {
          proposal: m0ProposalSummary(next.talentMarket.proposals.find((p) => p.talentId === kase.talentId && p.issuerStudioId === business.studioId) ?? null),
          promises: next.promises.filter((p) => p.beneficiaryPersonId === kase.talentId && p.issuerStudioId === business.studioId).map((p) => ({
            promiseId: p.promiseId,
            family: p.family,
            inputsDigest: p.feasibilityReceipt.inputsDigest
          }))
        },
        kase.contractId,
        kase.variant
      );
    }
  }
  for (const kase of openCasesAt(next, week)) {
    if (decisionWeekOf(next, kase) > week) continue;
    next = settleCase(next, kase, week);
  }
  return next;
}
function openCasesAt(state, week) {
  return state.talentMarket.cases.filter((c) => c.outcome === null && !TERMINAL.has(caseStatusAt(state, c, week)));
}
export function rivalPromiseProjectCandidates(state, studioId) {
  const shelved = shelvedScriptIds(state.hollywood, studioId);
  return [...state.hollywood?.businesses.find((row) => row.studioId === studioId)?.development.projects ?? []].filter((row) => row.status !== "produced" && !shelved.has(row.id)).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).slice(0, 2);
}
function authorRivalPromise(state, talentId, issuerStudioId, m0Case) {
  __m0WiringProbe.call("authorRivalPromise");
  const proposal = state.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId === issuerStudioId);
  if (proposal === void 0 || proposal.promises.length > 0) return state;
  if (openMarketCaseFor(state, talentId)?.variant === "retirementExtension") return state;
  const window = { windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks };
  const p1 = { family: "APPEARANCE_COUNT", predicate: { count: 1 }, ...window };
  const flexible = {
    family: "LEAD_OR_SIGNIFICANT_ROLE_COUNT",
    predicate: { kind: "castRoleCount", count: 1, seatClass: "leadOrAntagonist" },
    ...window
  };
  const directing = {
    family: "DIRECTING_COUNT",
    predicate: { kind: "directorCount", count: 1 },
    ...window
  };
  const person = state.talent.find((t) => t.id === talentId);
  const directingFirst = person?.role === "director" || person?.role === "actor" && (state.studio.releasedFilms.some((film) => film.directorId === talentId) || state.hollywood?.films.some((film) => film.credits.some((credit) => credit.talentId === talentId && credit.role === "director")) === true);
  const castProven = isProven(state, talentId);
  const cast = castProven ? [p1] : [flexible, p1];
  const candidates = directingFirst ? [directing, ...cast] : [...cast, directing];
  const projects = rivalPromiseProjectCandidates(state, issuerStudioId);
  const seatClass = isProven(state, talentId) ? "allCast" : "leadOrAntagonist";
  const projectCandidates = projects.map((project) => ({
    family: "SPECIFIC_PROJECT",
    predicate: { kind: "projectOpportunity", count: 1, seatClass, scriptProjectId: project.id },
    ...window
  }));
  const genres = [...new Set(projects.flatMap((project) => {
    const genre = state.hollywood?.concepts.find((row) => row.id === project.conceptId)?.genre;
    return genre === void 0 ? [] : [genre];
  }))];
  const genreCandidates = genres.map((genre) => ({
    family: "PREFERRED_GENRE_OPPORTUNITY",
    predicate: { kind: "genreOpportunity", count: 1, seatClass, genre },
    ...window
  }));
  candidates.push(...isProven(state, talentId) ? [...genreCandidates, ...projectCandidates] : [...projectCandidates, ...genreCandidates]);
  const observing = state.market.tick === 196 && talentId === M0_SUBJECT && M0_ISSUERS.includes(issuerStudioId);
  if (observing && m0Case === void 0) throw new Error("M0 observer author case identity missing");
  if (observing) m0Record(state, "candidateOrder", issuerStudioId, {
    caseKey: m0Case.caseKey,
    caseOccurrence: m0Case.caseOccurrence,
    authorInputs: {
      role: person?.role ?? null,
      castProven,
      directingFirst,
      seatClass,
      projectIds: projects.map((project) => project.id),
      genres,
      window,
      proposal: m0ProposalSummary(proposal),
      publicPreferredOpportunity: "NOT_EVALUATED_AT_AUTHOR"
    },
    candidates: candidates.map((attachment, ordinal) => ({ ordinal, attachment }))
  });
  let m0CandidateOrdinal = 0;
  for (const attachment of candidates) {
    const candidateOrdinal = m0CandidateOrdinal++;
    const capture = observing ? m0Capture(state, m0Case, proposal, "authorCandidate", candidateOrdinal) : void 0;
    const m0Feasibility = promiseFeasibility(state, {
      ...attachment,
      issuerStudioId,
      beneficiaryPersonId: talentId,
      startWeek: proposal.startWeek,
      termWeeks: proposal.termWeeks
    }, state.market.tick, capture);
    const classification = m0Feasibility.classification;
    if (observing) m0Record(
      state,
      "candidateFeasibility",
      issuerStudioId,
      {
        candidateOrdinal,
        attachment,
        feasibility: m0FeasibilitySummary(m0Feasibility),
        proven: castProven,
        directingFirst
      }
    );
    if (classification === "REASONABLY_ACHIEVABLE" && observing) {
      for (let skipped = candidateOrdinal + 1; skipped < candidates.length; skipped++) {
        m0Record(
          state,
          "candidateFeasibility",
          issuerStudioId,
          {
            candidateOrdinal: skipped,
            attachment: candidates[skipped],
            feasibility: "NOT_EVALUATED",
            proven: castProven,
            directingFirst
          }
        );
      }
    }
    if (classification === "REASONABLY_ACHIEVABLE") return attachPromise(state, talentId, issuerStudioId, attachment);
  }
  return state;
}
function rivalPremiumTier(business, descriptor) {
  __m0WiringProbe.call("rivalPremiumTier");
  const tiers = TUNING.MARKET_PREMIUM_TIERS;
  const index = (descriptor.subjectStudioId === business.studioId ? 0 : 1) + (business.policy.reserveWeeks >= 16 ? 1 : 0);
  return tiers[Math.min(index, tiers.length - 1)];
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validateTalentMarketRoot(talentMarket, state) {
  const fail = (message) => {
    throw new Error(`validateSaveV28: ${message}`);
  };
  if (!isRecord(talentMarket)) return fail("state.talentMarket is not a plain object");
  for (const key of ["cases", "proposals", "receipts", "legacyTerminations"]) {
    if (!Array.isArray(talentMarket[key])) return fail(`state.talentMarket.${key} is not an array`);
  }
  const cases = talentMarket.cases;
  const proposals = talentMarket.proposals;
  const receipts = talentMarket.receipts;
  for (let i = 0; i < proposals.length; i++) {
    const row = proposals[i];
    const label = `state.talentMarket.proposals[${String(i)}]`;
    if (!isRecord(row)) return fail(`${label} is not a plain object`);
    if (!Object.hasOwn(row, "representation")) return fail(`${label}.representation is missing — the key is REQUIRED and pinned null (R10)`);
    if (row.representation !== null) return fail(`${label}.representation must be null under P14 root version 1 (R10)`);
  }
  const hollywood = isRecord(state) ? state.hollywood : null;
  const identities = isRecord(hollywood) && Array.isArray(hollywood.identities) ? hollywood.identities : [];
  const employment = isRecord(hollywood) && Array.isArray(hollywood.employment) ? hollywood.employment : [];
  const industryReceipts = isRecord(hollywood) && Array.isArray(hollywood.receipts) ? hollywood.receipts : [];
  const playerStudioId = isRecord(hollywood) ? hollywood.playerStudioId : void 0;
  const entered = new Set(identities.filter((s) => isRecord(s) && s.enteredWeek !== null).map((s) => String(s.studioId)));
  const discovered = new Set(receipts.filter((r) => isRecord(r) && r.kind === "discovered").map((r) => String(r.talentId)));
  for (let i = 0; i < cases.length; i++) {
    const row = cases[i];
    const label = `state.talentMarket.cases[${String(i)}]`;
    if (!isRecord(row)) return fail(`${label} is not a plain object`);
    if (!discovered.has(String(row.talentId))) {
      return fail(`${label} has no backing discovery receipt — no market authority without a receipt`);
    }
    if (!entered.has(String(row.subjectStudioId))) {
      return fail(`${label}.subjectStudioId "${String(row.subjectStudioId)}" is not an entered studio of this world`);
    }
  }
  for (let i = 0; i < proposals.length; i++) {
    const row = proposals[i];
    if (!entered.has(String(row.issuerStudioId))) {
      return fail(`state.talentMarket.proposals[${String(i)}].issuerStudioId "${String(row.issuerStudioId)}" is not an entered studio of this world`);
    }
  }
  for (let i = 0; i < receipts.length; i++) {
    const row = receipts[i];
    const label = `state.talentMarket.receipts[${String(i)}]`;
    if (!isRecord(row)) return fail(`${label} is not a plain object`);
    const drops = row.dropped;
    if (!Array.isArray(drops)) return fail(`${label}.dropped is not an array`);
    for (const sentence of drops) {
      if (typeof sentence !== "string" || sentence.trim() === "") return fail(`${label}.dropped carries an empty sentence`);
      if (sentence.includes("$") || /\d{3,}/.test(sentence)) return fail(`${label}.dropped carries an amount — drop reasons are ordering-only`);
    }
  }
  const terminatedPlayerRows = /* @__PURE__ */ new Map();
  for (const row of employment) {
    if (!isRecord(row) || row.studioId !== playerStudioId || row.endedWeek === null) continue;
    const ended = industryReceipts.some((r) => isRecord(r) && r.kind === "employment" && r.contractId === row.contractId && r.toStudioId === null && r.reason === "termination");
    if (ended) terminatedPlayerRows.set(String(row.contractId), Number(row.endedWeek));
  }
  const seenLegacy = /* @__PURE__ */ new Set();
  const legacyRows = talentMarket.legacyTerminations;
  for (let i = 0; i < legacyRows.length; i++) {
    const row = legacyRows[i];
    const label = `state.talentMarket.legacyTerminations[${String(i)}]`;
    if (!isRecord(row)) return fail(`${label} is not a plain object`);
    const contractId = String(row.contractId);
    if (!terminatedPlayerRows.has(contractId)) {
      return fail(`${label}.contractId "${contractId}" is not a terminated player employment row of this world`);
    }
    if (seenLegacy.has(contractId)) return fail(`${label}.contractId "${contractId}" is recorded twice`);
    seenLegacy.add(contractId);
    if (row.endedWeek !== terminatedPlayerRows.get(contractId)) {
      return fail(`${label}.endedWeek differs from the employment row it names`);
    }
    if (!Number.isInteger(row.amountPaid) || row.amountPaid < 0) {
      return fail(`${label}.amountPaid must be a non-negative integer`);
    }
  }
  if (!Object.hasOwn(talentMarket, "representation")) return fail("state.talentMarket.representation is missing (required, pinned null)");
  if (talentMarket.representation !== null) return fail("state.talentMarket.representation must be null under P14 root version 1");
}
export function projectLegacyTerminations(state) {
  const hollywood = state.hollywood;
  if (hollywood === null) return [];
  const recorded = [];
  for (const row of hollywood.employment) {
    if (row.studioId !== hollywood.playerStudioId || row.endedWeek === null) continue;
    const ends = hollywood.receipts.filter((r) => r.kind === "employment" && r.contractId === row.contractId && r.toStudioId === null);
    const end = ends[0];
    if (ends.length !== 1 || end === void 0 || end.kind !== "employment" || end.reason !== "termination") continue;
    const paid = state.ledger.find((entry) => entry.kind === "termination" && entry.talentId === row.terms.talentId && entry.week === row.endedWeek);
    if (paid === void 0) {
      throw new Error(`migrateToV28: player termination "${row.contractId}" has no termination ledger row — that state was already invalid`);
    }
    recorded.push({ contractId: row.contractId, endedWeek: row.endedWeek, amountPaid: -paid.amount });
  }
  return recorded;
}
export function talentMarketTerminationLaw(talentMarket) {
  const rows = isRecord(talentMarket) && Array.isArray(talentMarket.legacyTerminations) ? talentMarket.legacyTerminations : [];
  const paid = /* @__PURE__ */ new Map();
  for (const row of rows) if (isRecord(row)) paid.set(String(row.contractId), Number(row.amountPaid));
  return (contract, endedWeek, contractId) => {
    const legacy = paid.get(contractId);
    return legacy === void 0 ? [terminationCost(contract, endedWeek)] : [legacy];
  };
}
export function projectTalentMarketPreV28(talentMarket) {
  if (!isRecord(talentMarket)) return;
  for (const key of ["cases", "proposals", "receipts"]) {
    const rows = talentMarket[key];
    if (Array.isArray(rows) && rows.length > 0) {
      throw new Error(`frozen save projection cannot discard authoritative V28 talent-market ${key} (${String(rows.length)} held)`);
    }
  }
}
function isExtensionCase(kase) {
  return kase.variant === "retirementExtension";
}
function discover(state, row, variant, week) {
  const kase = {
    talentId: row.terms.talentId,
    subjectStudioId: row.studioId,
    contractId: row.contractId,
    openedWeek: week,
    outcome: null,
    closedWeek: null,
    reason: null,
    variant
  };
  return {
    ...state,
    talentMarket: appendReceipt(
      { ...state.talentMarket, cases: [...state.talentMarket.cases, kase] },
      { kind: "discovered", week, talentId: kase.talentId, studioId: kase.subjectStudioId, reasons: [] }
    )
  };
}
function extensionAdmitted(state, proposal, week) {
  const record = retirementRecordFor(state, proposal.talentId);
  return record?.status === "announced" && extensionIssuer(state, proposal.talentId, week) === proposal.issuerStudioId && week + proposal.termWeeks === record.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS;
}
function extensionReservation(askAnnual) {
  return iround(askAnnual * TUNING.RETIREMENT_EXTENSION_RESERVATION_FACTOR);
}
function extensionTier() {
  const tiers = TUNING.MARKET_PREMIUM_TIERS.filter((tier) => tier >= TUNING.RETIREMENT_EXTENSION_RESERVATION_FACTOR);
  return tiers.length === 0 ? void 0 : Math.min(...tiers);
}
export function latestCaseIsExtension(state, talentId) {
  const kase = latestCase(state, talentId);
  return kase !== void 0 && isExtensionCase(kase);
}
export function openMarketCaseFor(state, talentId, week = state.market.tick) {
  const kase = latestCase(state, talentId);
  return kase !== void 0 && !TERMINAL.has(caseStatusAt(state, kase, week)) ? kase : void 0;
}
export const m0WiringTestApi = Object.freeze({
  M0ObserverError,
  authorRivalPromise,
  settleCase,
  reset: () => {
    drainM0MarketDecisionRows();
    drainM0FeasibilityRows();
  }
});
