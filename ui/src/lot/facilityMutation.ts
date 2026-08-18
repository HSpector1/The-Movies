// ── Move & Demolish V1 (C1-M3b) — the WORDS for the two destructive verbs ─────
//
// The engine decides the FACT and the UI decides the words (C1-M3a's own law). This
// module is the whole of "the words": it is PURE, it owns no rule, and it never
// re-derives a legality. It reads the structured refusal the engine already published
// on the snapshot and re-states it as one sentence a player can act on.
//
// Two disciplines it never breaks:
//
//   • it NEVER invents a name. A holder whose title the engine boundary could not
//     prove degrades to the neutral form — "reserved by current studio work" — because
//     a wrong film title in a blocked-state line is worse than no title at all;
//   • it NEVER shows an engine word to a player. `preProduction` is a phase id, not
//     something a person says; an activity this module has not been taught is simply
//     omitted from the sentence rather than printed raw.

import type {
  LotFacilityEngagement,
  LotFacilityMutation,
  LotFacilityMutationBlock,
  LotPlacedFacilityState,
} from './snapshot/StudioLotSnapshot.ts'
import { moneyExact } from '../format.ts'

/**
 * The studio's own words for each activity an engagement can report.
 *
 * The keys are the ENGINE's vocabulary, verbatim: production workflow phases, the
 * shooting task's own word, the two screenplay states, auditions, and the retired V11
 * construction root. Anything absent from this table is deliberately not printed.
 */
export const LOT_FACILITY_ACTIVITY_LABEL: Readonly<Record<string, string>> = {
  development: 'in development',
  preProduction: 'in pre-production',
  rehearsal: 'in rehearsal',
  shooting: 'shooting',
  postProduction: 'in post-production',
  releaseReady: 'ready for release',
  'drafting a screenplay': 'drafting a screenplay',
  'rewriting a screenplay': 'rewriting a screenplay',
  auditioning: 'auditioning',
  construction: 'under construction',
}

/** The player word for one engine activity, or null when there is no honest one. */
export function facilityActivityLabel(activity: string): string | null {
  if (typeof activity !== 'string') return null
  return LOT_FACILITY_ACTIVITY_LABEL[activity] ?? null
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * ONE sentence naming what is standing in the player's way, or null when nothing is.
 *
 * The grammar is the standing blocked-state grammar this lot already uses everywhere:
 * a subject, what holds it, and what that work is doing.
 *
 *   "Development & Casting Annex 2 is reserved by Nights of the Watchtower — shooting."
 *
 * Degradations, in order, each of them honest:
 *   • an activity this module has not been taught drops the clause after the dash;
 *   • an unresolvable title drops to "current studio work" — never a guessed name;
 *   • more than one holder keeps the named sentence and adds the true count, because
 *     "one picture is using it" would be a lie when three are.
 *
 * `regimeNotReady` and `unknownPlacement` return null ON PURPOSE. They are caller
 * states, not situations a player can read or act on, and the verbs are withheld
 * entirely rather than shown disabled with a sentence about the studio's regime.
 */
export function facilityMutationBlockedReason(
  facilityName: string,
  block: LotFacilityMutationBlock | null | undefined,
): string | null {
  if (block === null || block === undefined) return null
  const name = isText(facilityName) ? facilityName : 'This facility'
  if (block.code === 'foundingPlacement') {
    return `${name} is part of the studio's founding property and cannot be moved or taken down.`
  }
  if (block.code !== 'facilityEngaged') return null
  const holders = Array.isArray(block.holders) ? block.holders : []
  if (holders.length === 0) {
    // The engine says engaged but published no holder. Say the true, useful half.
    return `${name} is reserved by current studio work.`
  }
  const first = holders[0]!
  const activity = facilityActivityLabel(first.activity)
  const title = isText(first.title) ? first.title : null
  const head =
    title === null
      ? `${name} is reserved by current studio work`
      : `${name} is reserved by ${title}`
  const sentence = activity === null ? `${head}.` : `${head} — ${activity}.`
  if (holders.length === 1) return sentence
  const others = holders.length - 1
  return `${sentence} ${String(others)} other ${others === 1 ? 'commitment holds' : 'commitments hold'} it too.`
}

/** Whether the world may offer the Move verb for this facility at all. */
export function canOfferFacilityVerbs(mutation: LotFacilityMutation | null | undefined): boolean {
  if (mutation === null || mutation === undefined) return false
  const code = mutation.blocked?.code ?? null
  // A caller-state refusal is not a player situation: no verb, no disabled button, no
  // sentence.
  //
  // `foundingPlacement` is the engine's word for "this stands on the legacy Annex's
  // ground", and it is withheld here as well. C1-M8 CORRECTION: this comment used to
  // claim such a code could never reach a `placed-*` id. It could — the move flow
  // carried ordinary buildings onto that parcel, where the composed world then refused
  // to show them. The engine now REFUSES that ground to anything but the Annex
  // contract's own building (`RESERVED_PARCEL_BLUEPRINTS`), so the enforced invariant
  // is: a placement the engine accepts composes a body, and the only placement on that
  // parcel is the Annex, which owns no `placed-*` identity. This clause is the second
  // line of defence for that invariant, not an assumption about it.
  return code === null || code === 'facilityEngaged'
}

/**
 * WHAT IS ACTUALLY STANDING THERE (C1-M8) — the fact the two demolition sentences
 * need, and the only thing about a placement that changes their words.
 *
 * A building and a construction site are not the same subject. Calling a
 * half-finished foundation "this building" and offering a refund with no mention
 * of what the studio loses tells a player they are cashing something in, when in
 * fact they are abandoning weeks they have already paid for. Both facts are on
 * the placement the world is already holding; nothing here re-derives them.
 */
export type LotDemolitionSubject = {
  status: 'underConstruction' | 'operational'
  /** Weekly advances already spent building it — the write-off. */
  weeksBuilt: number
}

/** The demolition subject one placed facility is, or null when it is not one. */
export function demolitionSubjectOf(
  placed: LotPlacedFacilityState | null | undefined,
): LotDemolitionSubject | null {
  if (placed === null || placed === undefined) return null
  if (placed.status !== 'underConstruction' && placed.status !== 'operational') return null
  const buildWeeks = placed.completesWeek - placed.placedWeek
  const remaining = typeof placed.weeksRemaining === 'number' ? placed.weeksRemaining : 0
  const built = buildWeeks - remaining
  return {
    status: placed.status,
    weeksBuilt: Number.isFinite(built) && built > 0 ? Math.floor(built) : 0,
  }
}

/** The write-off clause, in weeks the studio has already paid for. */
function writtenOffClause(weeksBuilt: number): string {
  if (weeksBuilt <= 0) return 'no weeks of building are lost yet'
  return weeksBuilt === 1
    ? '1 week of building is written off'
    : `${String(weeksBuilt)} weeks of building are written off`
}

/**
 * The label the Demolish verb wears, refund and all.
 *
 * The operational wording is unchanged, byte for byte. A site under construction
 * is named for what it is.
 */
export function demolishVerbLabel(
  refund: number,
  subject?: LotDemolitionSubject | null,
): string {
  const thing = subject?.status === 'underConstruction' ? 'this construction site' : 'this building'
  return Number.isFinite(refund) && refund > 0
    ? `Demolish ${thing} — refund ${moneyExact(refund)}`
    : `Demolish ${thing}`
}

/** The one confirm sentence, anchored in the world beside the building it names. */
export function demolishConfirmText(
  name: string,
  refund: number,
  subject?: LotDemolitionSubject | null,
): string {
  const facility = isText(name) ? name : 'this building'
  const credit = Number.isFinite(refund) && refund > 0 ? moneyExact(refund) : null
  if (subject?.status === 'underConstruction') {
    const site = isText(name) ? `the ${name} construction site` : 'this construction site'
    const written = writtenOffClause(subject.weeksBuilt)
    return credit === null
      ? `Demolish ${site}? ${written.charAt(0).toUpperCase()}${written.slice(1)}.`
      : `Demolish ${site}? The studio recovers ${credit}; ${written}.`
  }
  return credit === null
    ? `Demolish ${facility}?`
    : `Demolish ${facility}? The studio recovers ${credit}.`
}

/** The receipt a completed demolition earns. Names the facility and the credit. */
export function demolishReceiptText(name: string, refund: number): string {
  const facility = (isText(name) ? name : 'facility').toUpperCase()
  return `${facility} DEMOLISHED — ${moneyExact(Number.isFinite(refund) ? refund : 0)} recovered`
}

/** The receipt a completed move earns. Names the facility and where it now stands. */
export function moveReceiptText(name: string, parcelLabel: string | null): string {
  const facility = isText(name) ? name : 'The facility'
  return parcelLabel === null || !isText(parcelLabel)
    ? `${facility} moved to its new site.`
    : `${facility} moved to the ${parcelLabel}.`
}

/** The heading the bounded move flow wears, so the player knows what they are holding. */
export function moveFlowHeading(name: string): string {
  return `Moving ${isText(name) ? name : 'this building'}`
}

/** One placed facility by its engine placement id, or null. Never guesses. */
export function placedFacilityById(
  placements: readonly LotPlacedFacilityState[] | null | undefined,
  placementId: number,
): LotPlacedFacilityState | null {
  if (!Array.isArray(placements)) return null
  const matches = placements.filter((placed) => placed?.id === placementId)
  return matches.length === 1 ? matches[0]! : null
}

/** Every holder the engine published, as printable lines. Empty when nothing holds it. */
export function facilityHolderLines(
  block: LotFacilityMutationBlock | null | undefined,
): { key: string; term: string; detail: string }[] {
  if (block === null || block === undefined || block.code !== 'facilityEngaged') return []
  const holders = Array.isArray(block.holders) ? block.holders : []
  return holders.map((holder: LotFacilityEngagement, index) => ({
    key: `holder:${holder.holderId}:${String(index)}`,
    term: isText(holder.title) ? holder.title : 'Current studio work',
    detail: facilityActivityLabel(holder.activity) ?? 'holding this facility',
  }))
}
