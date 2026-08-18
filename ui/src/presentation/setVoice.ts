// ── The set a picture stands on, said in the studio's own words ──────────────
//
// C2a-M2's LEGIBILITY gate (§12-M2) asks the package/greenlight surface to NAME the
// set and to show quality, novelty, condition and fit "with the projected uplift".
// The 00F professional tycoon floor and the RCT3-DIAGNOSTICS law together decide the
// shape of that showing: every number ships with the drivers that produced it and
// ONE thing the player could do about it. A figure with no cause and no response is
// a dashboard reading, not a decision.
//
// THIS MODULE INVENTS NO FACT. Every quantity it prints arrives from the engine
// read-model (`ui/src/engine/sets.ts`), which in turn only calls the engine. What is
// authored here is ENGLISH, plus two derivations that are arithmetic over published
// constants and are named, bounded and tested:
//
//   • `picturesBeforeRepair` — how many more pictures a set can carry before it
//     falls under the usability threshold. Purely `condition`, the threshold and
//     the per-wrap wear, all three of which the engine publishes.
//   • `upliftShare` — the uplift as a fraction of its own authored maximum, which
//     is what makes "+5.7 craft" mean something to somebody who has never seen a
//     craft score.
//
// G12 — EVERY SENTENCE MUST BE LITERALLY TRUE AT ITS STATE. Three consequences that
// shaped the copy and are asserted by test:
//
//   1. Binding happens at REHEARSAL ENTRY, not at greenlight. So the planned set is
//      always spoken of as a plan ("would"), never as a fact ("will"), and the
//      sentence that says another picture may take it first is not a hedge — it is
//      the mechanism.
//   2. A missing set NEVER blocks a greenlight. The picture is greenlit, develops,
//      and waits at rehearsal. Copy that implied otherwise would send a player to
//      the Scenery Shop to unblock something that was never blocked.
//   3. Fit is ADVISORY (§3.1). No sentence here may call a poorly matched set
//      illegal, unavailable, or a problem — only a smaller uplift than another set
//      would give.

import type {
  PackageSetPlanView,
  SetCandidateView,
  SetConditionBand,
  SetPlanBlock,
  StudioSetView,
} from '../engine/sets.ts'
import {
  SET_CONDITION_UNUSABLE_THRESHOLD,
  SET_CONDITION_WEAR_PER_PRODUCTION,
  SET_NOVELTY_DEPLETION_PER_RELEASE,
  SET_REPAIR_COST,
  SET_REPAIR_WEEKS,
} from '../engine/sets.ts'
import { money, score } from '../format.ts'

/** The heading every set-facing surface uses, so the player learns one place-name. */
export const SET_SURFACE_TITLE = 'Where this picture will shoot'

/** Genre words as a player writes them, capitalised for use inside a sentence. */
export function genreWord(genre: string): string {
  return genre.charAt(0).toUpperCase() + genre.slice(1)
}

/** A craft-point figure: one decimal, always signed, because it is always a gain. */
export function craftPoints(points: number): string {
  return `+${points.toFixed(1)}`
}

/** A 0..1 fraction as whole percent. Used for fit and freshness alike. */
export function percentOfOne(value: number): string {
  return `${String(Math.round(value * 100))}%`
}

/** A novelty multiplier, at the precision that makes 1.00 read as "no change". */
export function noveltyMultiplier(factor: number): string {
  return `×${factor.toFixed(2)}`
}

/**
 * How many MORE pictures this set can carry before it falls below the threshold at
 * which the engine refuses to bind it.
 *
 * A set is bindable while `condition >= SET_CONDITION_UNUSABLE_THRESHOLD`, and each
 * picture that WRAPS on it costs `SET_CONDITION_WEAR_PER_PRODUCTION`. So from a
 * condition of c the bindings still available are c, c−w, c−2w … down to the
 * threshold: `floor((c − threshold) / w) + 1`. Zero for a set already under the
 * threshold, which the engine has already stopped binding.
 *
 * Bounded by construction: never negative, and never larger than
 * `floor(100 / w) + 1`, which the range test pins.
 */
export function picturesBeforeRepair(condition: number): number {
  if (condition < SET_CONDITION_UNUSABLE_THRESHOLD) return 0
  return (
    Math.floor((condition - SET_CONDITION_UNUSABLE_THRESHOLD) / SET_CONDITION_WEAR_PER_PRODUCTION) +
    1
  )
}

/** The uplift as a fraction of the most a set could ever give. 0..1. */
export function upliftShare(points: number, max: number): number {
  return max <= 0 ? 0 : Math.max(0, Math.min(1, points / max))
}

/** The one-word state of a set's scenery, for a badge. */
export function conditionWord(band: SetConditionBand): string {
  switch (band) {
    case 'sound':
      return 'Sound'
    case 'wearing':
      return 'Showing wear'
    case 'unusable':
      return 'Worn through'
  }
}

/** What a set's status is called on the lot. */
export function setStatusWord(set: StudioSetView): string {
  switch (set.status) {
    case 'standing':
      return set.usable ? 'Standing' : 'Standing — worn through'
    case 'building':
      return 'Under construction'
    case 'repairing':
      return 'Under repair'
    case 'struck':
      return 'Struck'
  }
}

/**
 * The set's own identifying line: what it is, and where it stands.
 *
 * "Stage 7 House Set — a Standing Interior on Soundstage 7". The stage's name is the
 * ENGINE facility name, which §3.1 rules is the single spoken authority.
 */
export function setIdentityLine(set: StudioSetView): string {
  return `${set.name} — a ${set.locationLabel} on ${set.stageName}`
}

/**
 * The sentence that says what "planned" means.
 *
 * It is a plan and not a booking, and the reason is the mechanism: scenery and stage
 * are taken together when the picture reaches rehearsal, so a picture already in
 * flight can reach that moment first.
 */
export function plannedSetDisclosure(set: SetCandidateView): string {
  return (
    `On the lot as it stands today, ${set.name} is the set this picture would go to. ` +
    'The stage and its scenery are taken together when the picture reaches rehearsal, ' +
    'so a picture already shooting can reach them first.'
  )
}

/** One line of the stat block: a number, why it is that number, and what to do. */
export type SetDriverLine = {
  key: 'quality' | 'fit' | 'condition' | 'novelty'
  /** The name of the thing measured, in filmmaking words. */
  label: string
  /** The measurement itself. */
  reading: string
  /** What it is worth to this picture, or null when it buys nothing directly. */
  effect: string | null
  /** WHY the reading is what it is. */
  driver: string
  /** ONE thing the player can do about it. Never empty (RCT3-DIAGNOSTICS-001). */
  response: string
}

/**
 * The four drivers behind a bound-or-planned set's contribution.
 *
 * `best` is the best uplift the catalogue could reach for this picture, so the fit
 * response can name a real alternative instead of gesturing at one. When the studio
 * is already standing on the best it could build, the response says so rather than
 * inventing a better set.
 */
export function setDriverLines(
  set: SetCandidateView,
  plan: Pick<PackageSetPlanView, 'bestBuildable' | 'bestBuildableUplift'>,
): SetDriverLine[] {
  const genre = set.genre === null ? null : genreWord(set.genre)
  const remaining = picturesBeforeRepair(set.condition)
  const better =
    plan.bestBuildable !== null && plan.bestBuildableUplift > set.upliftPoints + 0.05
      ? plan.bestBuildable
      : null

  const fitLine: SetDriverLine = {
    key: 'fit',
    label: genre === null ? 'Suits the picture' : `Suits ${genre}`,
    reading: percentOfOne(set.fit),
    effect: `${craftPoints(set.fitPoints)} craft`,
    driver:
      genre === null
        ? 'This picture has no settled genre yet, so the scenery earns nothing for matching one.'
        : set.builtForThisGenre
          ? `${set.name} was built for ${genre}, and a picture shot where it belongs reads as it should.`
          : `${set.name} was built for ${genreWord(set.priorityGenre)}, so a ${genre} picture borrows it.`,
    response:
      better === null
        ? 'Nothing in the catalogue would suit this picture better than what the studio already has.'
        : `A ${better.name} would suit it better — ${craftPoints(better.upliftPoints)} craft in all, ` +
          `${money(better.cost)} and ${String(better.buildWeeks)} weeks at the Scenery Shop.`,
  }

  return [
    {
      key: 'quality',
      label: 'Built quality',
      reading: `${score(set.quality, 0)} of 100`,
      effect: `${craftPoints(set.qualityPoints)} craft`,
      driver: `Every set built from the ${set.locationLabel.toLowerCase()} plans is finished to this standard.`,
      response:
        better === null
          ? 'A dearer set is a better-built set; the catalogue holds nothing finer for this picture.'
          : `The Scenery Shop builds finer scenery for more money — a ${better.name} is quality ${score(better.quality, 0)}.`,
    },
    fitLine,
    {
      key: 'condition',
      label: 'Condition',
      reading: `${score(set.condition, 0)} of 100 · ${conditionWord(set.conditionBand)}`,
      effect: null,
      driver: `Each picture that wraps here costs ${String(SET_CONDITION_WEAR_PER_PRODUCTION)} condition, and below ${String(SET_CONDITION_UNUSABLE_THRESHOLD)} nothing may be filmed on it.`,
      response:
        remaining === 0
          ? `Order a repair at the Scenery Shop — ${money(SET_REPAIR_COST)} and ${String(SET_REPAIR_WEEKS)} weeks, and it comes back whole.`
          : `Good for ${String(remaining)} more ${remaining === 1 ? 'picture' : 'pictures'} before a repair — ${money(SET_REPAIR_COST)} and ${String(SET_REPAIR_WEEKS)} weeks.`,
    },
    {
      key: 'novelty',
      label: 'Freshness',
      reading: percentOfOne(set.novelty),
      effect: `${noveltyMultiplier(set.noveltyFactor)} opening`,
      driver: `Audiences tire of a place they have seen: every release shot here costs ${percentOfOne(SET_NOVELTY_DEPLETION_PER_RELEASE)} of its freshness.`,
      response:
        set.novelty >= 1
          ? 'Nobody has seen this set on a screen yet.'
          : 'A newly built set opens wholly fresh — a second set spreads the wear as well as the work.',
    },
  ]
}

/** The headline sentence over the stat block. */
export function setUpliftHeadline(set: SetCandidateView, maxUplift: number): string {
  return (
    `Standing here is worth ${craftPoints(set.upliftPoints)} craft to the finished picture, ` +
    `of the ${craftPoints(maxUplift)} the finest possible set could give, ` +
    `and ${noveltyMultiplier(set.noveltyFactor)} on its opening.`
  )
}

/** The advisory disclaimer. Fit is a quality lever, never a gate (§3.1). */
export const SET_ADVISORY_NOTE =
  'A set never refuses a picture. Any standing set can shoot any genre — a better-matched set simply gives the picture more.'

/** What the studio says when no set is planned, and what to do about it. */
export type SetBlockCopy = { headline: string; reason: string; response: string }

/**
 * The four things that can be true of the stage this picture would have reached,
 * each with the one action that answers it.
 *
 * NONE of these blocks the greenlight — `SET_WAIT_NOTE` says so, and it is shown
 * beside every one of them.
 */
export function setBlockCopy(block: SetPlanBlock): SetBlockCopy {
  switch (block.code) {
    case 'noStages':
      return {
        headline: 'The studio has no soundstage.',
        reason: 'Pictures are shot on sets, and sets are mounted inside soundstages.',
        response: 'Build a Soundstage from the studio catalogue.',
      }
    case 'stagesBusy':
      return {
        headline: 'Every stage is working.',
        reason: 'Each soundstage carries one picture at a time, and all of them are carrying one.',
        response: 'Build another Soundstage, or let a picture wrap and free the one it holds.',
      }
    case 'stageBare':
      return {
        headline: `${block.stageName} is standing empty.`,
        reason: 'The stage is free, but there is no scenery in it to photograph.',
        response: `Commission a set at the Scenery Shop and mount it on ${block.stageName}.`,
      }
    case 'setBuilding':
      return {
        headline: `${block.setName} is still going up on ${block.stageName}.`,
        reason:
          block.weeksRemaining === null
            ? 'The scenery crew is still at work on it.'
            : `The scenery crew has ${String(block.weeksRemaining)} ${block.weeksRemaining === 1 ? 'week' : 'weeks'} left on it.`,
        response: 'Let the crew finish, or commission a set on another free stage.',
      }
    case 'setWorn':
      return {
        headline: `${block.setName} is worn through.`,
        reason: `Its condition is ${score(block.condition, 0)} of 100, and nothing may be filmed on a set below ${String(SET_CONDITION_UNUSABLE_THRESHOLD)}.`,
        response: `Order a repair at the Scenery Shop — ${money(SET_REPAIR_COST)} and ${String(SET_REPAIR_WEEKS)} weeks.`,
      }
    case 'setInUse':
      return {
        headline: `${block.setName} is being filmed on.`,
        reason: `Another picture is standing on it at ${block.stageName}.`,
        response: 'Wait for that picture to wrap, or build a second set on a free stage.',
      }
  }
}

/**
 * The sentence that keeps a missing set from reading as a refusal.
 *
 * Literally true at every state it renders in: `requiresSetBinding` is minted AT
 * greenlight and the `set-unavailable` blocker is raised at REHEARSAL ENTRY, so a
 * picture with nowhere to shoot is greenlit, developed, and then held.
 */
export const SET_WAIT_NOTE =
  'This does not stop the greenlight. The picture will be written and prepared first, and it waits for a set only when it is ready to rehearse.'

/** The line a package shows when it will never be bound to a set at all. */
export const SET_NOT_REQUIRED_NOTE =
  'This studio does not yet build its pictures on its own sets.'
