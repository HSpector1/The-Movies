// ── C2a-M3 — Renewable Screenplay Generation V1: the authored vocabulary ─────
//
// Two authored tables and nothing else: the SEVEN-BEAT STORY SKELETON each genre
// supplies, and the LEAD WORDS each genre draws its working title from. Both
// follow the discipline `wordlists.ts` set in §9 — version-controlled TS modules
// consumed in DECLARED ARRAY ORDER, never read from the filesystem, so replay
// (§15.7) stays byte-stable and no I/O touches the sim boundary.
//
// ── WHY BEATS ARE THE SET DEMAND (charter §3.5, lane 14 §8.7) ────────────────
//
// The corpus proves the coupling at its highest tier: *"If you design a scene on
// a set that your studio doesn't own, you won't be able to shoot the movie until
// the set is constructed"* [CORPUS Prima, verbatim] and the manual's info bubble
// "lists which sets the script requires" [CORPUS Bible §7.1, OFFICIAL manual
// p.13]. So a beat is not flavor text: it is one scene, in one KIND OF PLACE, and
// the places a screenplay asks for are what the studio must have standing. Every
// `requiredSetType` below is a member of the M2 `SET_TYPES` vocabulary, which is
// closed precisely so a beat can never ask for a location no blueprint can build
// (owner law 2 — no unrelievable reason).
//
// ── PROVENANCE IS DECLARED, NEVER GUESSED (`00E`.19 SOURCE-FIRST) ────────────
//
// Three of our six genres have a template recovered VERBATIM from the original;
// three do not, and those three are labelled `authored` in the table itself so no
// future reader mistakes our invention for recovered fact. The original's Action
// and Sci-Fi templates have no home in our six-genre vocabulary (6-vs-5 is C4's
// question, master plan §10.5) and are recorded at the foot of this file as
// unused reference shapes rather than imported.
//
// The simplified FOUR-stage variant the manual mentions is NOT built: its beats
// are unrecovered and an ACTIVE open question [CORPUS Q036]. Inventing them would
// be exactly the fabrication the evidence discipline forbids.

import type { Genre } from '../types.js'
import type { KnownSetTypeId } from '../tuning.js'
import { TITLE_LEAD } from './wordlists.js'

/**
 * A template beat, typed against the CLOSED `SET_TYPES` vocabulary rather than
 * the persisted `BlueprintBeat`'s open `SetTypeId`. A beat asking for a location
 * no blueprint can build is owner law 2's unrelievable reason, and this makes it
 * a COMPILE error rather than a runtime discovery. `TemplateBeat` is assignable
 * to `BlueprintBeat`, so the mint hands these straight to the persisted row.
 */
export type TemplateBeat = { name: string; requiredSetType: KnownSetTypeId }

/**
 * How a genre's skeleton got here. `recovered` means the beat NAMES are the
 * original's, transcribed; `authored` means we wrote them in the same grammar
 * because the corpus has no template for that genre. The set each beat asks for
 * is OURS in both cases — no original source recovered a scene→set mapping table
 * (`docs/c2-planning/03-original-sets-dataset.md` §48), and the beat structure is
 * the honest place to hang it.
 */
export type BeatTemplateProvenance = 'recovered' | 'authored'

export type BeatTemplate = {
  genre: Genre
  provenance: BeatTemplateProvenance
  /** The citation a reader can check. Carried as data so the claim travels with the table. */
  source: string
  beats: readonly TemplateBeat[]
}

/** Seven beats per genre — the recovered count, at the recovered tier. */
export const BEATS_PER_BLUEPRINT = 7

/**
 * The story skeleton, by genre. Beat NAMES for comedy, romance and horror are
 * transcribed verbatim from [CORPUS Bible §5.5 "The Hollywood Scriptwriting
 * Templates" — OFFICIAL manual pp.28-30]; drama, crime and adventure are AUTHORED
 * in the same grammar and say so.
 */
const BEAT_TEMPLATE_TABLE: Readonly<Record<Genre, BeatTemplate>> = {
  // ── RECOVERED ──────────────────────────────────────────────────────────────
  comedy: {
    genre: 'comedy',
    provenance: 'recovered',
    source: 'Bible §5.5 — OFFICIAL manual pp.28-30 (verbatim)',
    beats: [
      { name: 'Intro', requiredSetType: 'hotel-lobby' },
      { name: 'Problem', requiredSetType: 'apartment-interior' },
      { name: 'Pursuit', requiredSetType: 'city-street' },
      { name: 'Challenge', requiredSetType: 'grand-ballroom' },
      { name: 'Preparation', requiredSetType: 'apartment-interior' },
      { name: 'Conflict', requiredSetType: 'hotel-lobby' },
      { name: 'Resolution', requiredSetType: 'city-street' },
    ],
  },
  romance: {
    genre: 'romance',
    provenance: 'recovered',
    source: 'Bible §5.5 — OFFICIAL manual pp.28-30 (verbatim)',
    beats: [
      { name: 'Intro', requiredSetType: 'city-street' },
      { name: 'Meeting', requiredSetType: 'grand-ballroom' },
      { name: 'Problem', requiredSetType: 'apartment-interior' },
      { name: 'Time Apart', requiredSetType: 'country-field' },
      { name: 'Reunion', requiredSetType: 'hotel-lobby' },
      { name: 'Argument', requiredSetType: 'apartment-interior' },
      { name: 'Resolution', requiredSetType: 'grand-ballroom' },
    ],
  },
  horror: {
    genre: 'horror',
    provenance: 'recovered',
    source: 'Bible §5.5 — OFFICIAL manual pp.28-30 (verbatim)',
    beats: [
      { name: 'Intro', requiredSetType: 'old-house-interior' },
      { name: 'Shock', requiredSetType: 'graveyard' },
      { name: 'Pursuit', requiredSetType: 'back-alley' },
      { name: 'Encounter', requiredSetType: 'old-house-interior' },
      { name: 'Preparation', requiredSetType: 'apartment-interior' },
      { name: 'Big Fight', requiredSetType: 'old-house-interior' },
      { name: 'Resolution', requiredSetType: 'graveyard' },
    ],
  },
  // ── AUTHORED — NOT RECOVERED. The corpus has no template for these three. ───
  drama: {
    genre: 'drama',
    provenance: 'authored',
    source: 'AUTHORED at C2a-M3 — no original template exists (lane 14 §8.5)',
    beats: [
      { name: 'Intro', requiredSetType: 'apartment-interior' },
      { name: 'Fracture', requiredSetType: 'apartment-interior' },
      { name: 'Pressure', requiredSetType: 'hotel-lobby' },
      { name: 'Departure', requiredSetType: 'country-field' },
      { name: 'Reckoning', requiredSetType: 'courtroom' },
      { name: 'Confession', requiredSetType: 'apartment-interior' },
      { name: 'Resolution', requiredSetType: 'city-street' },
    ],
  },
  crime: {
    genre: 'crime',
    provenance: 'authored',
    source: 'AUTHORED at C2a-M3 — no original template exists (lane 14 §8.5)',
    beats: [
      { name: 'Intro', requiredSetType: 'back-alley' },
      { name: 'The Job', requiredSetType: 'city-street' },
      { name: 'Investigation', requiredSetType: 'police-station' },
      { name: 'Betrayal', requiredSetType: 'hotel-lobby' },
      { name: 'Pursuit', requiredSetType: 'back-alley' },
      { name: 'Standoff', requiredSetType: 'city-street' },
      { name: 'Resolution', requiredSetType: 'courtroom' },
    ],
  },
  adventure: {
    genre: 'adventure',
    provenance: 'authored',
    source: 'AUTHORED at C2a-M3 — no original template exists (lane 14 §8.5)',
    beats: [
      { name: 'Intro', requiredSetType: 'hotel-lobby' },
      { name: 'Departure', requiredSetType: 'city-street' },
      { name: 'Discovery', requiredSetType: 'jungle-clearing' },
      { name: 'Setback', requiredSetType: 'jungle-clearing' },
      { name: 'Trek', requiredSetType: 'country-field' },
      { name: 'Showdown', requiredSetType: 'jungle-clearing' },
      { name: 'Resolution', requiredSetType: 'grand-ballroom' },
    ],
  },
}

export const BEAT_TEMPLATES: Readonly<Record<Genre, BeatTemplate>> =
  Object.freeze(BEAT_TEMPLATE_TABLE)

/**
 * The original's two templates that our six-genre vocabulary has no home for,
 * recorded so the recovery is not lost and NEVER consumed by the engine. Do not
 * map them onto drama/crime/adventure: the corpus does not license the mapping,
 * and lane 14 §8.5 says so explicitly.
 *
 * [CORPUS Bible §5.5 — OFFICIAL manual pp.28-30, verbatim]
 */
export const UNUSED_RECOVERED_BEAT_SHAPES: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    action: ['Intro', 'Skirmish', 'Investigate', 'Fight', 'Prepare', 'Battle', 'Resolution'],
    sciFi: ['Intro', 'Encounter', 'Survey', 'Fight', 'Pursuit', 'Showdown', 'Resolution'],
  })

/**
 * The LEAD WORDS each genre draws a working title from — SUBSETS of the existing
 * 48 authored leads, never new vocabulary.
 *
 * WHY A SUBSET AND NOT A NEW WORD LIST. The corpus confirms genre-keyed random
 * titles at the highest tier for the Advanced Movie-Maker only: *"The title you
 * get is based partially on the genre you've chosen"* [CORPUS Prima, verbatim,
 * lane 14 C19]. Full per-genre vocabularies are authored content, which the
 * ruling fences to C4 (`00C` §3). A subset over the shipped leads gives the genre
 * flavor the corpus describes and adds not one new authored word — the cheap
 * honest version lane 14 §8.8 names.
 *
 * The NOUN half stays the whole 60-entry list for every genre: a noun is a
 * subject, and a Cathedral is as much a horror picture as a romance.
 *
 * ERA-CLEAN (G15): no lead names a year, a decade or a technology, and none is
 * chosen for one. These read the same in 1920 and in 2040.
 */
const TITLE_LEAD_TABLE: Readonly<Record<Genre, readonly string[]>> = {
  comedy: [
    'The Restless',
    'The Reluctant',
    'The Wayward',
    'A Season of',
    'The Careless',
    'Rumors of',
    'Nights of',
    'The Sudden',
    'Portrait of a',
    'The Painted',
  ],
  romance: [
    'A Season of',
    'Nights of',
    'Whispers of',
    'Letters from',
    'Portrait of a',
    'Song of the',
    'Winter of the',
    'The Golden',
    'Echoes of',
    'Return to',
  ],
  horror: [
    'The Crimson',
    'The Hollow',
    'Whispers of',
    'Ghosts of',
    'The Silent',
    'Shadow of the',
    'The Vanished',
    'Under the',
    'Ashes of',
    'The Bitter',
  ],
  drama: [
    'The Quiet',
    'Portrait of a',
    'The Broken',
    'Letters from',
    'The Distant',
    'Winter of the',
    'Echoes of',
    'The Fading',
    'A Study in',
    'Dust and',
  ],
  crime: [
    'The Iron',
    'A Study in',
    'City of',
    'The Broken',
    'Shadow of the',
    'The Last',
    'Ashes of',
    'The Crimson',
    'House of',
    'Rumors of',
  ],
  adventure: [
    'The Last',
    'Beyond the',
    'Return to',
    'Legend of the',
    'Kingdom of',
    'The Wild',
    'The Endless',
    'Storm over',
    'Dawn of the',
    'The Northern',
    'Empire of',
    'The Wandering',
  ],
}

export const TITLE_LEAD_BY_GENRE: Readonly<Record<Genre, readonly string[]>> =
  Object.freeze(TITLE_LEAD_TABLE)

/**
 * Every genre lead subset is a real subset of `TITLE_LEAD` — checked here at
 * module load, not only in a test, because "no new vocabulary" is a contract
 * promise and a typo would otherwise ship a word the world's own titles cannot
 * contain.
 */
const AUTHORED_LEADS = new Set(TITLE_LEAD)
for (const [genre, leads] of Object.entries(TITLE_LEAD_BY_GENRE)) {
  for (const lead of leads) {
    if (!AUTHORED_LEADS.has(lead)) {
      throw new Error(
        `screenplay vocabulary: ${genre} lead "${lead}" is not one of the authored TITLE_LEAD words`,
      )
    }
  }
}
