// ── §9 / rev. 4 N2 — bundled word-list data for worldgen (cosmetic flavor) ────
// Version-controlled, fixed-order `readonly string[]` arrays imported statically
// by src/core/worldgen.ts. NEVER read from the filesystem at runtime — these are
// TS modules, not data files, so replay (§15.7) is byte-stable and no I/O touches
// the sim boundary.
//
// Determinism note (N2): worldgen consumes these arrays in DECLARED ARRAY ORDER,
// indexing with a value drawn from the 'worldgen' RNG substream. Reordering or
// editing an entry changes generated names/titles for a given seed but never the
// numeric mechanics — the `id` is the key, not the name, so collisions are
// harmless. Content is flavor only (N2). Sizes are ~40–80 entries each.

// Person given names.
export const FIRST_NAMES: readonly string[] = [
  'Ava', 'Marlon', 'Greta', 'Sidney', 'Ingrid', 'Orson', 'Rita', 'Cary',
  'Vivien', 'Douglas', 'Barbara', 'Errol', 'Hedy', 'Spencer', 'Gene', 'Lauren',
  'Buster', 'Norma', 'Gary', 'Myrna', 'Clark', 'Joan', 'Tyrone', 'Bette',
  'Fredric', 'Carole', 'Basil', 'Loretta', 'Ramon', 'Gloria', 'Leslie', 'Anna',
  'Victor', 'Ruth', 'Claude', 'Irene', 'Edward', 'Jean', 'Boris', 'Kay',
  'Warner', 'Thelma', 'Franchot', 'Miriam', 'Herbert', 'Dolores', 'Conrad', 'Fay',
  'Lionel', 'Marion', 'Roland', 'Sylvia', 'Adolphe', 'Constance', 'Otto', 'Alma',
  'Reginald', 'Estelle', 'Wallace', 'Genevieve', 'Nils', 'Blanche', 'Rex', 'Vera',
] as const

// Person family names.
export const LAST_NAMES: readonly string[] = [
  'Hartwell', 'Vance', 'Sterling', 'Marsh', 'Delacroix', 'Kingsley', 'Ferro', 'Whitlock',
  'Brandt', 'Calloway', 'Rourke', 'Ashby', 'Vandermeer', 'Novak', 'Prescott', 'Lasky',
  'Merrick', 'Ostrow', 'Fairbanks', 'Cortland', 'Halloran', 'Beaumont', 'Zaleski', 'Winters',
  'Thorne', 'Devereaux', 'Mancuso', 'Ellery', 'Grimaldi', 'Pemberton', 'Sable', 'Voss',
  'Larkin', 'Underwood', 'Castellano', 'Marlowe', 'Radcliffe', 'Okonkwo', 'Vasquez', 'Blackwood',
  'Hollis', 'Ravel', 'Sunderland', 'Petrov', 'Marchetti', 'Everhart', 'Lindqvist', 'Cabral',
  'Ashcombe', 'Delgado', 'Wetherby', 'Nakamura', 'Fenwick', 'Salazar', 'Trask', 'Emerson',
  'Loewenthal', 'Barrow', 'Chandra', 'Vollmer', 'Attwater', 'Reyes', 'Halberstam', 'Winslow',
] as const

// Title lead words (article-like / adjectival openers). A title is built as
// TITLE_LEAD[i] + ' ' + TITLE_NOUN[j] via two draws — see worldgen.ts.
export const TITLE_LEAD: readonly string[] = [
  'The Last', 'A Season of', 'Nights of', 'The Silent', 'Return to', 'Beyond the',
  'The Crimson', 'Whispers of', 'The Hollow', 'Under the', 'The Broken', 'Echoes of',
  'The Distant', 'Shadow of the', 'The Golden', 'Ashes of', 'The Restless', 'Portrait of a',
  'The Quiet', 'Winter of the', 'The Vanished', 'Letters from', 'The Iron', 'Ghosts of',
  'The Wayward', 'A Study in', 'The Endless', 'Dust and', 'The Sudden', 'Fires of',
  'The Reluctant', 'City of', 'The Painted', 'Storm over', 'The Forgotten', 'Dawn of the',
  'The Wandering', 'Song of the', 'The Bitter', 'Kingdom of', 'The Fading', 'Rumors of',
  'The Wild', 'House of', 'The Northern', 'Legend of the', 'The Careless', 'Empire of',
] as const

// Title noun words (subject / object of the title).
export const TITLE_NOUN: readonly string[] = [
  'Harvest', 'Provocation', 'Reckoning', 'Meridian', 'Wilderness', 'Cathedral',
  'Serpent', 'Foundling', 'Gambit', 'Lighthouse', 'Cartographer', 'Revolt',
  'Inheritance', 'Verdict', 'Sanctuary', 'Confession', 'Migration', 'Stranger',
  'Machinist', 'Ballroom', 'Fever', 'Escapement', 'Boulevard', 'Cipher',
  'Diplomat', 'Undertow', 'Aviator', 'Vineyard', 'Masquerade', 'Frontier',
  'Widow', 'Locomotive', 'Ransom', 'Archipelago', 'Debutante', 'Prizefighter',
  'Cartel', 'Nightingale', 'Estuary', 'Governess', 'Smuggler', 'Reverie',
  'Tribunal', 'Menagerie', 'Insurgent', 'Cornerstone', 'Fugitive', 'Constellation',
  'Bootlegger', 'Threshold', 'Automaton', 'Pilgrimage', 'Impresario', 'Undertaker',
  'Cascade', 'Regiment', 'Alchemist', 'Watchtower', 'Debt', 'Homecoming',
] as const
