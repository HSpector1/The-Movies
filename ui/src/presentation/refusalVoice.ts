// ── Refusal voice ────────────────────────────────────────────────────────────
// One translation seam between an engine refusal and the player (00F PROFESSIONAL
// TYCOON FLOOR: "expose the simulation; translate the implementation").
//
// The engine refuses in engine language — `applyActions: greenlight rejected —
// no Development & Casting slot is available`. Rendered verbatim, that is debug text at
// the most important button in the game. This module reads such a string and
// returns the studio's language in the blocked-state grammar the screenplay
// package blockers already use: the FACT (headline), the REASON (detail), and the
// WAY FORWARD (remedy).
//
// THREE READINGS, and the difference matters:
//   • `voiced`        — a known refusal family. Player copy only.
//   • `untranslated`  — the string is recognisably ENGINE language but matches no
//                       family. The player gets an honest generic line and the raw
//                       note behind a disclosure. NOTHING is invented.
//   • `plain`         — the string is not engine language (a caller already wrote
//                       player copy). Passed through untouched.
//
// EXTENSION LAW: a new refusal family is a new entry in REFUSAL_FAMILIES — data,
// not code. No call site changes when the vocabulary grows.
//
// TRUTH LAW (G12): every sentence here must be literally true at the state that
// produces it. Two consequences worth stating out loud, because both were checked
// against the engine rather than assumed:
//   • No remedy offers to cancel a picture. `cancel` exists in the action union
//     but has no player-facing control, so "cancel one" would be a lie.
//   • No sentence renders a talent id. Ids are engine identity. A family that
//     wants to name a person takes a resolver and falls back to a person-less
//     sentence that is still true when the name cannot be resolved.

import { money } from '../format.ts'

export type RefusalCopy = {
  /** The fact, in the studio's words. */
  headline: string
  /** Why the studio refused. */
  detail: string
  /** The way forward — an action the player can actually take. */
  remedy: string
}

export type RefusalReading =
  | { kind: 'voiced'; familyId: string; copy: RefusalCopy }
  | { kind: 'untranslated'; copy: RefusalCopy; raw: string }
  | { kind: 'plain'; message: string }

/** Everything a family may consult beyond the refusal text itself. */
export type RefusalContext = {
  /** Engine id → the person's name, when the caller holds the roster. */
  nameOf?: ((talentId: string) => string | undefined) | undefined
}

type RefusalFamily = {
  id: string
  match: RegExp
  copy: (match: RegExpMatchArray, context: RefusalContext) => RefusalCopy
}

function personName(
  match: RegExpMatchArray,
  group: number,
  context: RefusalContext,
): string | undefined {
  const id = match[group]
  if (id === undefined) return undefined
  const name = context.nameOf?.(id)
  return name === undefined || name.trim().length === 0 ? undefined : name
}

// ── The families ─────────────────────────────────────────────────────────────
// Order is first-match-wins, so narrower patterns precede broader ones.
export const REFUSAL_FAMILIES: readonly RefusalFamily[] = [
  // ── C2a-M4 (§11.8 retirement + named successor, owner law 1) ──────────────
  //
  // RETIRED: `production-slate-full`, which matched
  // `activeProductions at capacity (2/2)`. That string was minted by the
  // MAX_CONCURRENT_PRODUCTIONS throw, and owner law 1 DELETED the constant and
  // its throw — no engine in this repo can speak that sentence any more, so a
  // family that matched it was voicing a refusal that cannot happen.
  //
  // SUCCESSOR: `development-casting-slot-taken`, below. What actually stops work
  // starting now is a ROOM, and the three surviving capacity refusals all say so
  // in the same words. On the four front doors §3.3 names, this refusal never
  // reaches a player at all — it becomes a queued intent. It reaches one only on
  // the doors the charter did NOT open (the rewrite door, and a legacy studio's
  // own greenlight), which is why the sentence teaches the queue rather than a
  // cap: the studio is out of rooms, not out of permission.
  {
    id: 'development-casting-slot-taken',
    match:
      /no Development & Casting slot is available|no development-casting capacity for productionId/,
    copy: () => ({
      headline: 'Every Development & Casting room is taken',
      detail:
        'A picture, a screenplay, or a set of camera tests is using each of the studio’s Development & Casting rooms, and this work needs one of its own.',
      remedy:
        'Wait for one of them to finish — the Studio Calendar’s queue says which frees first — or build another Development & Casting room.',
    }),
  },
  // TWO founding-draft families, narrower first. The engine refuses SIX different
  // actions with the same founding-draft clause, so the picture-specific sentence may
  // only claim the picture-specific refusal; everything else gets the action-neutral
  // one. First-match-wins is what keeps the specific sentence true (G12).
  {
    id: 'greenlight-before-founding',
    match: /greenlight(?:ScriptProject)? rejected — the studio is still in its founding draft/,
    copy: () => ({
      headline: 'The studio is not founded yet',
      detail: 'No picture can be greenlit while the founding roster is still open.',
      remedy: 'Finish the founding roster and found the studio.',
    }),
  },
  {
    id: 'founding-draft-open',
    match: /the studio is still in its founding draft/,
    copy: () => ({
      headline: 'The studio is not founded yet',
      detail: 'The founding roster is still open, and the studio cannot do this until it closes.',
      remedy: 'Finish the founding roster and found the studio.',
    }),
  },
  {
    id: 'managed-requires-screenplay',
    match: /managed studios must greenlight an authoritative Ready script project/,
    copy: () => ({
      headline: 'This studio greenlights from accepted screenplays',
      detail: 'A managed studio can only greenlight a screenplay the Writers’ Room has accepted.',
      remedy: 'Commission a screenplay, then greenlight it once it reads Ready.',
    }),
  },
  {
    id: 'package-disagrees-with-screenplay',
    match: /package facts disagree with Ready script project/,
    copy: () => ({
      headline: 'The package no longer matches the screenplay',
      detail:
        'The accepted screenplay owns this picture’s concept, shape, and promise, and the package in front of you differs from it.',
      remedy: 'Reopen the package from the screenplay so it carries the accepted facts.',
    }),
  },
  {
    id: 'casting-review-open',
    match: /casting session "[^"]*" must be reviewed and acknowledged first/,
    copy: () => ({
      headline: 'Casting review is still open',
      detail: 'This picture’s camera tests have finished and are waiting on your review.',
      remedy: 'Finish the casting review, then return to the package.',
    }),
  },
  {
    id: 'screenplay-development-legacy',
    // The engine speaks this clause for every screenplay action, not only greenlight,
    // so the sentence names the missing department rather than one blocked action.
    match: /screenplay development is not managed/,
    copy: () => ({
      headline: 'This studio does not run managed screenplays',
      detail: 'This studio has not activated Script Development, which every screenplay goes through.',
      remedy: 'Activate Script Development, or package a concept directly without a screenplay.',
    }),
  },
  {
    id: 'cast-slot-duplicate',
    match: /assigns the same actor to more than one cast slot/,
    copy: () => ({
      headline: 'One performer is in two cast roles',
      detail: 'The same performer is currently set for more than one cast role on this picture.',
      remedy: 'Give the Lead, the Antagonist, and the Support three different performers.',
    }),
  },
  {
    id: 'one-role-per-person',
    match: /assigns talent "([^"]+)" to more than one role in the same production/,
    copy: (m, context) => {
      const name = personName(m, 1, context)
      return {
        headline: name === undefined
          ? 'One person holds two credits on this picture'
          : `${name} holds two credits on this picture`,
        detail:
          name === undefined
            ? 'A person fills exactly one role on one picture, and someone in this package is currently set for two.'
            : `A person fills exactly one role on one picture, and ${name} is currently set for two.`,
        remedy: 'Replace one of the two credits with someone else.',
      }
    },
  },
  {
    id: 'already-engaged-elsewhere',
    match: /talent "([^"]+)" is already engaged in an active production/,
    copy: (m, context) => {
      const name = personName(m, 1, context)
      return {
        headline: name === undefined
          ? 'Someone in this package is already working'
          : `${name} is already working`,
        detail:
          name === undefined
            ? 'One of the people in this package is committed to another picture or screenplay, and a person works on one at a time.'
            : `${name} is committed to another picture or screenplay, and a person works on one at a time.`,
        remedy: 'Choose someone who is currently free, or wait for that commitment to finish.',
      }
    },
  },
  {
    id: 'craft-lead-count',
    match: /a film requires exactly one Production\/Craft Lead \(got (\d+)\)/,
    copy: (m) => {
      const got = Number(m[1])
      if (got === 0) {
        return {
          headline: 'This picture has no Production/Craft Lead',
          detail: 'Every picture needs exactly one Production/Craft Lead, and none is chosen.',
          remedy: 'Choose one Production/Craft Lead.',
        }
      }
      return {
        headline: 'This picture has too many Production/Craft Leads',
        detail: `Every picture needs exactly one Production/Craft Lead, and ${String(got)} are chosen.`,
        remedy: 'Keep one Production/Craft Lead and drop the rest.',
      }
    },
  },
  {
    id: 'not-hireable',
    match: /talent "([^"]+)" is neither studio-contracted nor an available freelancer/,
    copy: (m, context) => {
      const name = personName(m, 1, context)
      return {
        headline: name === undefined
          ? 'Someone in this package cannot be hired'
          : `${name} cannot be hired for this picture`,
        detail:
          name === undefined
            ? 'One of the people in this package is neither under studio contract nor in the current freelancer market.'
            : `${name} is neither under studio contract nor in the current freelancer market.`,
        remedy: 'Sign that person to a studio contract, or replace them with contracted talent or an available freelancer.',
      }
    },
  },
  {
    id: 'insufficient-cash',
    // The affordability rule guards every commitment (a picture's budget, a contract,
    // a campaign), so the remedy names the lever generically and then the picture's
    // two budgets by way of example — true wherever this refusal is spoken.
    match: /Insufficient cash — this (-?\d+) commitment would leave cash at (-?\d+)/,
    copy: (m) => ({
      headline: 'The studio cannot cover this commitment',
      detail: `This ${money(Number(m[1]))} commitment would leave the studio at ${money(Number(m[2]))}, and a new commitment may not take cash below zero.`,
      remedy: 'Lower the commitment — for a picture, its negative or marketing budget — or wait for cash to come in.',
    }),
  },
  {
    id: 'casting-already-reviewed',
    match: /acknowledge rejected — session "[^"]*" does not need review/,
    copy: () => ({
      headline: 'These results have already been reviewed',
      detail: 'This casting session is no longer waiting on your review.',
      remedy: 'Open the picture’s package to cast it.',
    }),
  },
  {
    id: 'casting-session-unknown',
    match: /acknowledge references unknown session/,
    copy: () => ({
      headline: 'That casting session is no longer on the lot',
      detail: 'The session this review was opened for is not in the studio’s current records.',
      remedy: 'Return to the lot and open the casting work that is waiting now.',
    }),
  },
  {
    id: 'casting-sessions-inactive',
    match: /rejected — Casting Sessions are not managed/,
    copy: () => ({
      headline: 'Casting Sessions are not running',
      detail: 'This studio has not activated managed Casting Sessions.',
      remedy: 'Activate Casting Sessions, or cast the picture directly in its package.',
    }),
  },
]

// The honest generic. It states only what is certainly true — the studio refused,
// and this refusal has no studio-language translation yet — and hands the raw note
// to the player as a disclosure rather than inventing a cause or a cure.
export const UNTRANSLATED_REFUSAL: RefusalCopy = {
  headline: 'The studio would not do that',
  detail: 'The front office refused this, and there is no plain-language explanation for this refusal yet.',
  remedy: 'Change the package or the studio’s situation and try again. The studio’s own note is below.',
}

export const UNTRANSLATED_REFUSAL_DISCLOSURE = 'Show the studio’s note'

// Module prefixes the sim core stamps on its own throws. A message carrying one is
// engine language by construction, whether or not a family claims it.
const ENGINE_PREFIXES: readonly string[] = [
  'applyActions:',
  'casting sessions:',
  'castingReadModel:',
  'scriptReadModel:',
  'script development:',
  'operations:',
  'occupancy:',
  'placement:',
  'construction:',
  'worldgen:',
  'save:',
  'load:',
  'tick:',
]

/**
 * Engine language, not player language. A leading `moduleName: ` stamp is the sim
 * core's own convention; the explicit list above covers the modules that speak to
 * this seam today, and the camelCase fallback catches a module that is added later
 * without this file being told.
 */
export function looksLikeEngineLanguage(message: string): boolean {
  const trimmed = message.trim()
  if (ENGINE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return true
  return /^[a-z][A-Za-z0-9]*:\s/.test(trimmed)
}

/**
 * The reading's family, as a stable attribute value: a family id, `untranslated`,
 * or `plain`. Surfaces stamp it so a test (and a later lane) can assert WHICH
 * translation fired without reading copy.
 */
export function refusalFamilyId(message: string): string {
  const reading = readRefusal(message)
  return reading.kind === 'voiced' ? reading.familyId : reading.kind
}

/** Read one refusal string as the player should receive it. */
export function readRefusal(message: string, context: RefusalContext = {}): RefusalReading {
  for (const family of REFUSAL_FAMILIES) {
    const found = family.match.exec(message)
    if (found !== null) {
      return { kind: 'voiced', familyId: family.id, copy: family.copy(found, context) }
    }
  }
  if (looksLikeEngineLanguage(message)) {
    return { kind: 'untranslated', copy: UNTRANSLATED_REFUSAL, raw: message }
  }
  return { kind: 'plain', message }
}
