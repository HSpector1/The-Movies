// P14A.2 — the Talent Market WORKSPACE read model (projection 43).
//
// READ MODELS over the landed A.1 law (`e575fc1`/`562cdf2`) and nothing else: no engine
// law, no new intent kind, Save V28 unchanged, nothing persisted. Every fact below is
// DERIVED at the read week from the engine's own public entries — `caseForTalent`,
// `caseDisclosure` (through `marketCaseProjection`), `marketEligibility`, `playerOffer`
// and the P12 employment rows — and every private figure stays behind A.1's disclosure:
// a competing proposal's tier, salary and bonus read the engine's literal `UNKNOWN`
// marker because the comparison reuses A.1's own proposal rows rather than minting a
// second shape, and a rival-owned employment interval carries no salary member at all.
//
// The workspace adds no fact the Profile could not already state; it gathers them.
import { campaignDate } from '../src/core/calendar.js'
import {
  caseForTalent, latestCaseIsExtension, marketEligibility, playerOffer, type MarketCaseView,
} from '../src/core/talentMarket.js'
import { PERSON_DISCIPLINE_ORDER, ROLE_TO_DISCIPLINE, TUNING } from '../src/core/tuning.js'
import type { GameState, TalentMarketCase } from '../src/core/types.js'
import { castingDraftToEngine } from './casting.ts'
import { marketAttentionRows, marketCaseProjection, peopleProjection } from './people.ts'
import { promiseAttentionRows, promiseRowsForPerson } from './trust.ts'
import { extensionTerminalReceipt, retirementExtensionFields } from './retirement-extension.ts'
import { retirementAttentionRows } from './lifecycle.ts'
import type {
  BridgeMarketAttentionRowSnapshot, BridgeMarketCaseDetail, BridgeMarketCaseRow,
  BridgeMarketEmployerRow, BridgeMarketFreeAgentRow, BridgeMarketPage,
} from './schema/bridge-schema.ts'

/**
 * OPEN value (hypothesis): the bound's EXISTENCE is pinned by the plan; the number is
 * not. 20 is the largest page the industry request itself may ask for (`pageSize`
 * maximum 50) halved to a list a workspace column can show at once — it is a display
 * bound, and the century-scale rule only requires that closed cases never accumulate
 * into one unbounded array.
 */
export const MARKET_CLOSED_PAGE_SIZE = 20

/**
 * OPEN value (hypothesis): one person's recorded employer intervals. Ten covers a
 * forty-year career of four-year terms with room to spare, so the common read is one
 * page, and the bound still holds at century scale.
 */
export const MARKET_HISTORY_PAGE_SIZE = 10

/** The request the industry `view: 'market'` dispatch answers. */
export type MarketPageRequest = {
  view: 'market'
  /** The selected person's talentId, or null for the buckets alone. */
  targetId: string | null
  /** Pages the CLOSED case bucket. */
  page?: number
  /** Pages the selected person's employer history. */
  historyPage?: number
}

const TERMINAL = new Set(['settled', 'declined', 'expired', 'invalidated'])
/** The ask is quoted at the SHORTEST published term — the entry price, and the one term
 * every published option set starts from. Longer terms stay available through the
 * existing hiring path's own option list. */
const ASK_TERM_WEEKS = TUNING.CONTRACT_TERM_OPTIONS[0]!

const EMPTY_PAGE: BridgeMarketPage = {
  attention: [],
  cases: { renewalWindow: [], freeAgents: [], settling: [], closed: { rows: [], page: 0, pageSize: MARKET_CLOSED_PAGE_SIZE, total: 0 } },
  selected: null,
}

type CaseEntry = { kase: TalentMarketCase; view: MarketCaseView; ordinal: number }

/**
 * The cases as the engine itself reads them, in DISCOVERY order — the position in the
 * receipt-ordered `talentMarket.cases`. `caseForTalent` answers with a person's LATEST
 * case, so a person who has been through two cases contributes exactly one entry, at the
 * later one's ordinal; an earlier closed case of the same person is not separately
 * listed (recorded limit: the engine publishes no reader for a superseded case).
 * C.2-RM875 includes the final-extension variant with its own public terms and
 * one-issuer wording; the underlying latest-case history limit is unchanged.
 */
function caseEntries(state: GameState, week: number): CaseEntry[] {
  const byTalent = new Map<string, CaseEntry>()
  state.talentMarket.cases.forEach((kase, ordinal) => {
    const view = caseForTalent(state, kase.talentId, week)
    if (view !== null) byTalent.set(kase.talentId, { kase, view, ordinal })
  })
  return [...byTalent.values()]
}

const studioNames = (state: GameState): Map<string, string> =>
  new Map((state.hollywood?.identities ?? []).map((s) => [s.studioId, s.name]))

const roleLabel = (role: string): string => (role === 'craft' ? 'Crew' : role[0]!.toUpperCase() + role.slice(1))

function caseRow(state: GameState, entry: CaseEntry, viewerStudioId: string, names: Map<string, string>): BridgeMarketCaseRow {
  const talent = state.talent.find((t) => t.id === entry.view.talentId)
  const proposals = state.talentMarket.proposals.filter((p) => p.talentId === entry.view.talentId)
  return {
    talentId: entry.view.talentId,
    ...retirementExtensionFields(state, entry.view.talentId, viewerStudioId),
    name: talent?.name ?? entry.view.talentId,
    roleLabel: roleLabel(talent?.role ?? 'craft'),
    subjectStudioId: entry.view.subjectStudioId,
    subjectStudioName: names.get(entry.view.subjectStudioId) ?? entry.view.subjectStudioId,
    status: entry.view.status,
    decisionWeek: entry.view.decisionWeek,
    decisionWeekLabel: campaignDate(entry.view.decisionWeek).label,
    closedWeek: entry.kase.closedWeek,
    outcome: entry.kase.outcome,
    proposalCount: proposals.length,
    ownProposal: proposals.some((p) => p.issuerStudioId === viewerStudioId),
  }
}

/** The most recent P12 employment ordinal for this person; −1 for the never-employed. */
function lastEmploymentOrdinal(state: GameState, talentId: string): number {
  const rows = state.hollywood?.employment ?? []
  for (let i = rows.length - 1; i >= 0; i--) if (rows[i]!.terms.talentId === talentId) return i
  return -1
}

function freeAgentRows(state: GameState, week: number): BridgeMarketFreeAgentRow[] {
  // §2.1.2/R26: the signable free pool the engine itself keeps — people a previous
  // employment released or let expire — narrowed to those the eligibility table still
  // reads as free agents at the READ week (a person re-signed since is no longer one).
  const rows = state.freeAgents
    .map((talentId) => ({ talentId, talent: state.talent.find((t) => t.id === talentId) }))
    .filter((row) => row.talent !== undefined && marketEligibility(state, row.talentId, week).status === 'free_agent')
    .map(({ talentId, talent }) => {
      const ask = playerOffer(state, talentId, ASK_TERM_WEEKS, week)
      // The EXISTING hiring path, not a new action: the same conversion the casting
      // seam already mints for any free agent. A refusal is published, never hidden.
      const conversion = castingDraftToEngine(state, { kind: 'signActor', signTalentId: talentId, signTermWeeks: ASK_TERM_WEEKS } as never)
      return {
        row: {
          talentId,
          name: talent!.name,
          roleLabel: roleLabel(talent!.role),
          termWeeks: ask.termWeeks,
          annualSalary: ask.annualSalary,
          signingBonus: ask.signingBonus,
          intentKind: 'signContract' as const,
          signable: conversion.ok,
          refusal: conversion.ok ? null : conversion.error,
        },
        discipline: PERSON_DISCIPLINE_ORDER.indexOf(ROLE_TO_DISCIPLINE[talent!.role]),
        employment: lastEmploymentOrdinal(state, talentId),
        roster: state.talent.findIndex((t) => t.id === talentId),
      }
    })
  // Role in the fixed discipline order, then the ask at the read week descending, then
  // the most recent P12 employment ordinal (most recently employed first, −1 last), then
  // the person's ordinal in the append-only `state.talent` roster — an immutable in-state
  // fact, and the documented final key.
  rows.sort((a, b) =>
    a.discipline - b.discipline ||
    b.row.annualSalary - a.row.annualSalary ||
    b.employment - a.employment ||
    a.roster - b.roster)
  return rows.map((entry) => entry.row)
}

/** One person's recorded employer intervals, from the P12 rows alone. */
function employerRows(state: GameState, talentId: string, viewerStudioId: string, names: Map<string, string>): BridgeMarketEmployerRow[] {
  return (state.hollywood?.employment ?? [])
    .filter((row) => row.terms.talentId === talentId)
    .map((row) => {
      const own = row.studioId === viewerStudioId
      const toWeek = row.endedWeek ?? row.terms.endWeekExclusive
      return {
        studioId: row.studioId,
        studioName: names.get(row.studioId) ?? row.studioId,
        fromWeek: row.terms.startWeek,
        fromLabel: campaignDate(row.terms.startWeek).label,
        toWeek,
        toLabel: campaignDate(toWeek).label,
        termWeeks: row.terms.termWeeks,
        transition: row.reason,
        own,
        ended: row.endedWeek !== null,
        // A rival's compensation is not this studio's to publish: the member is ABSENT,
        // never null and never a marker, exactly as Industry keeps rival terms private.
        ...(own ? { annualSalary: row.terms.annualSalary } : {}),
      }
    })
}

/**
 * THIS studio's own dropped-proposal sentence, after a terminal receipt carried one.
 * The engine writes one ordering-only sentence per dropped proposal, each opening with
 * the issuing studio's own name (`talentMarket.ts` DROP_SENTENCE), so a viewer's own
 * sentence is the one its own name opens — and only when this studio genuinely had a
 * proposal on that case, proved by its own `proposalSubmitted` receipt. Limit recorded:
 * two studios whose names share a prefix are separated by nothing but that name.
 */
function ownDroppedReasons(state: GameState, view: MarketCaseView, viewerStudioId: string, names: Map<string, string>): string[] {
  const extension = latestCaseIsExtension(state, view.talentId)
  const receipt = extension ? extensionTerminalReceipt(state, view.talentId) : [...state.talentMarket.receipts].reverse().find((r) =>
    r.talentId === view.talentId && TERMINAL.has(r.kind) && r.dropped.length > 0)
  if (receipt === undefined) return []
  const proposed = state.talentMarket.receipts.some((r) =>
    r.kind === 'proposalSubmitted' && r.talentId === view.talentId &&
    r.studioId === viewerStudioId && r.week >= view.openedWeek && (!extension || r.week <= receipt.week))
  if (!proposed) return []
  const name = names.get(viewerStudioId) ?? viewerStudioId
  return receipt.dropped.filter((sentence) => sentence.startsWith(name))
}

function selectedDetail(
  state: GameState, talentId: string, viewerStudioId: string, week: number, historyPage: number, names: Map<string, string>,
): BridgeMarketCaseDetail | null {
  const block = marketCaseProjection(state, talentId, viewerStudioId, week)
  const view = caseForTalent(state, talentId, week)
  const talent = state.talent.find((t) => t.id === talentId)
  if (block === null || view === null || talent === undefined) return null
  // BY REFERENCE to the projection-42 profile: the rail composes the People projection's
  // own published labels and copies no profile field of its own.
  const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)
  const employers = employerRows(state, talentId, viewerStudioId, names)
  const page = Math.max(0, historyPage)
  return {
    // `marketCase`, not `case`: the C# generator refuses a reserved-word wire member
    // (CF08), and this is the name the Profile already publishes for this same block.
    marketCase: block,
    rail: {
      talentId,
      role: talent.role,
      standingLine: profile === undefined
        ? `${roleLabel(talent.role)} · no published profile in this campaign`
        : `${profile.careerIdentityLabel} · ${profile.employment.statusLabel}`,
      preferences: block.preferences,
      profileRef: profile === undefined ? null : profile.talentId,
    },
    comparison: block.proposals,
    history: {
      employers: employers.slice(page * MARKET_HISTORY_PAGE_SIZE, (page + 1) * MARKET_HISTORY_PAGE_SIZE),
      credits: profile?.career.rows ?? [],
      promises: promiseRowsForPerson(state, talentId, viewerStudioId, week),
      page,
      pageSize: MARKET_HISTORY_PAGE_SIZE,
      total: employers.length,
    },
    droppedReasons: ownDroppedReasons(state, view, viewerStudioId, names),
  }
}

/**
 * The Talent Market workspace at the CURRENT authoritative week. A case lands in exactly
 * one bucket by derived facts: terminal cases are `closed`; a case whose decision week is
 * the next authoritative week is `settling` (derived by the workspace — settlement runs
 * inside the same tick that reaches the decision week, so the engine's own
 * `decision_pending` status is never observable after a normal `tick()`); everything else
 * open is in the `renewalWindow`.
 */
export function marketPage(state: GameState, request: MarketPageRequest): BridgeMarketPage {
  if (state.hollywood === null) return structuredClone(EMPTY_PAGE)
  const week = state.market.tick
  const viewerStudioId = state.hollywood.playerStudioId
  const names = studioNames(state)
  const entries = caseEntries(state, week)

  const renewalWindow: CaseEntry[] = []
  const settling: CaseEntry[] = []
  const closed: CaseEntry[] = []
  for (const entry of entries) {
    if (TERMINAL.has(entry.view.status)) closed.push(entry)
    // `decisionWeek === week + 1` is the settling rule; a case already AT or past its
    // decision week (the transient `decision_pending`) settles sooner still, so it reads
    // here too rather than falling out of every bucket.
    else if (entry.view.decisionWeek <= week + 1) settling.push(entry)
    else renewalWindow.push(entry)
  }
  const byDecisionWeek = (a: CaseEntry, b: CaseEntry) => a.view.decisionWeek - b.view.decisionWeek || a.ordinal - b.ordinal
  renewalWindow.sort(byDecisionWeek)
  settling.sort(byDecisionWeek)
  // Closed: most recently closed first, then discovery order. A DERIVED invalidation
  // carries no stored closed week; it reads at its own decision week.
  closed.sort((a, b) => (b.kase.closedWeek ?? b.view.decisionWeek) - (a.kase.closedWeek ?? a.view.decisionWeek) || a.ordinal - b.ordinal)

  // Attention: the five A.1 causes across every case this studio may lawfully be
  // interrupted about (`marketAttentionRows` returns nothing for a case that is neither
  // this studio's own subject nor one it has bid on), deduplicated per (cause, talentId),
  // in decision-week-then-discovery order. Terminal cases are visited too — that is the
  // only way the `settlementCompleted` cause can ever appear.
  const attention: BridgeMarketAttentionRowSnapshot[] = []
  const seen = new Set<string>()
  for (const entry of [...entries].sort(byDecisionWeek)) {
    for (const row of marketAttentionRows(state, entry.view, viewerStudioId, week)) {
      const key = `${row.cause}:${row.talentId}`
      if (seen.has(key)) continue
      seen.add(key)
      attention.push(row)
    }
  }
  // Bound promises survive settlement, the former employer's case and even the
  // absence of a case carrier. Their scan must never depend on caseEntries.
  for (const row of promiseAttentionRows(state, viewerStudioId, week)) {
    const key = `${row.cause}:${row.talentId}`
    if (seen.has(key)) continue
    seen.add(key)
    attention.push(row)
  }

  for (const row of retirementAttentionRows(state, week)) {
    const key = `${row.cause}:${row.talentId}`
    if (seen.has(key)) continue
    seen.add(key)
    attention.push(row)
  }
  const page = Math.max(0, request.page ?? 0)
  return structuredClone({
    attention,
    cases: {
      renewalWindow: renewalWindow.map((entry) => caseRow(state, entry, viewerStudioId, names)),
      freeAgents: freeAgentRows(state, week),
      settling: settling.map((entry) => caseRow(state, entry, viewerStudioId, names)),
      closed: {
        rows: closed.slice(page * MARKET_CLOSED_PAGE_SIZE, (page + 1) * MARKET_CLOSED_PAGE_SIZE)
          .map((entry) => caseRow(state, entry, viewerStudioId, names)),
        page,
        pageSize: MARKET_CLOSED_PAGE_SIZE,
        total: closed.length,
      },
    },
    selected: request.targetId === null
      ? null
      : selectedDetail(state, request.targetId, viewerStudioId, week, request.historyPage ?? 0, names),
  })
}
