'use strict';
// Fixture data — identical to Codex R2 (living-studio.js @ e564d236) so that every
// comparison is at matching data. FACTUAL = taken from R2; ILLUSTRATIVE = added here
// only to demonstrate a visual device (marked with `illus`). No game data is read.
const FIXTURE = {
  studio: { name: 'Westhaven Pictures', date: 'Week 12 · 1926', year: 1926, week: 12, cash: '$2,480,000', cashDelta: '−$26,000 last week', campaign: 'Unnamed current campaign', rank: { illus: true, value: '#7 of 12' } },
  employees: [
    // id, name, role, group, work, place, status, lotX, lotY (R2 world %), features (illus portrait seed)
    { id: 'P-004', name: 'Mara Vale', role: 'Director', group: 'Talent', work: 'The Glass Harbor', place: 'Stage 07', status: 'Working', x: 40, y: 53, f: [0, 2, 1, 0, 0, 0] },
    { id: 'P-006', name: 'Nora Finch', role: 'Actor', group: 'Talent', work: 'The Glass Harbor', place: 'Stage 07', status: 'Working', x: 41, y: 54, f: [3, 5, 2, 1, 0, 1] },
    { id: 'P-022', name: 'Mara Vale', role: 'Craft lead', group: 'Crew', work: 'The Glass Harbor', place: 'Stage 07', status: 'Working', x: 40, y: 55, f: [1, 0, 3, 0, 1, 2] },
    { id: 'P-011', name: 'Evelyn Park', role: 'Writer', group: 'Writing', work: 'Letters from June', place: 'Script Office', status: 'Writing', x: 71, y: 15, f: [4, 3, 0, 1, 0, 0] },
    { id: 'P-012', name: 'Arthur Bell', role: 'Writer', group: 'Writing', work: 'The Night Porter', place: 'Script Office', status: 'Writing', x: 72, y: 15, f: [2, 1, 4, 0, 2, 1] },
    { id: 'P-018', name: 'June Sloane', role: 'Actor', group: 'Talent', work: 'No assignment', place: 'Casting', status: 'Available', x: 20, y: 41, f: [5, 6, 1, 1, 0, 2] },
    { id: 'P-019', name: 'Eli Rowan', role: 'Actor', group: 'Talent', work: 'No assignment', place: 'Casting', status: 'Available', x: 21, y: 42, f: [0, 4, 2, 0, 1, 0] },
    { id: 'P-023', name: 'Iris Grant', role: 'Craft lead', group: 'Crew', work: 'After the Rain', place: 'Production Post', status: 'Waiting', x: 73, y: 65, f: [3, 2, 0, 1, 0, 1] },
    { id: 'P-024', name: 'Otto Silva', role: 'Craft lead', group: 'Crew', work: 'Across the Bay', place: 'Stage 04', status: 'Working', x: 57, y: 32, f: [2, 0, 3, 0, 2, 2] },
    { id: 'P-025', name: 'Rose Kim', role: 'Director', group: 'Talent', work: 'Across the Bay', place: 'Stage 04', status: 'Working', x: 58, y: 33, f: [1, 6, 4, 0, 0, 0] },
    { id: 'P-026', name: 'Max Reed', role: 'Actor', group: 'Talent', work: 'Across the Bay', place: 'Stage 04', status: 'Working', x: 59, y: 34, f: [4, 1, 1, 0, 1, 1] },
    { id: 'P-027', name: 'Ada Moss', role: 'Writer', group: 'Writing', work: 'No assignment', place: 'Script Office', status: 'Available', x: 72, y: 17, f: [5, 2, 2, 1, 1, 2] },
  ],
  // candidates used only by the casting compare board (R2 fixture identities)
  candidates: [
    { id: 'P-008', name: 'Celia Ward', role: 'Actor', status: 'Available', fit: 84, ovr: 76, test: '77 · range 71–83', fee: '$18,000', note: 'Fits the role; this is not a guarantee of performance.', f: [3, 6, 0, 1, 0, 0] },
    { id: 'P-015', name: 'Leon Hart', role: 'Actor', status: 'Unavailable · other film', fit: 79, ovr: 83, test: 'No test evidence', fee: '$24,000', note: 'Currently engaged. Viewing this record cannot assign this person.', f: [0, 1, 3, 0, 2, 1] },
  ],
  projects: [
    { id: 'SCRIPT-019', title: 'Letters from June', phase: 'Writing', state: 'Draft in progress', place: 'Script Office', group: 'Scripts', genre: 'Romance', person: 'P-011', x: 71, y: 15 },
    { id: 'SCRIPT-020', title: 'The Night Porter', phase: 'Writing', state: 'Rewrite in progress', place: 'Script Office', group: 'Scripts', genre: 'Horror', person: 'P-012', x: 72, y: 15 },
    { id: 'SCRIPT-021', title: 'The Long Way Home', phase: 'Casting', state: 'Ready to review the lead', place: 'Casting', group: 'Scripts', genre: 'Drama', action: true, x: 21, y: 41 },
    { id: 'FILM-014', title: 'The Glass Harbor', phase: 'Shooting', state: 'Take ready to schedule', place: 'Stage 07', group: 'Making movies', genre: 'Drama', action: true, person: 'P-004', x: 40, y: 53 },
    { id: 'FILM-017', title: 'Across the Bay', phase: 'Shooting', state: 'Company at work', place: 'Stage 04', group: 'Making movies', genre: 'Action', person: 'P-025', x: 57, y: 32 },
    { id: 'FILM-018', title: 'After the Rain', phase: 'Post', state: 'Waiting for Post capacity', place: 'Production Post', group: 'Post & release', genre: 'Romance', waiting: true, person: 'P-023', x: 73, y: 65 },
    { id: 'FILM-023', title: 'A Small Kindness', phase: 'Release ready', state: 'Review release at Production', place: 'Production Office', group: 'Post & release', genre: 'Comedy', action: true, x: 73, y: 67 },
    { id: 'RELEASE-006', title: 'A Summer in Red', phase: 'Released', state: 'Completed run · in the library', place: 'Film Library', group: 'Film library', genre: 'Drama', released: true },
  ],
  // Buildings: R2 lot anchors (% of the lot box) reused for the identical-background board;
  // target-lot anchors are computed by lot.js from the world grid.
  buildings: [
    { id: 'script', name: 'Script Office', x: 71, y: 15, kind: 'office' },
    { id: 'casting', name: 'Casting', x: 21, y: 41, kind: 'office' },
    { id: 'stage07', name: 'Stage 07', x: 40, y: 53, kind: 'stage' },
    { id: 'stage04', name: 'Stage 04', x: 57, y: 32, kind: 'stage' },
    { id: 'post', name: 'Production Post', x: 73, y: 65, kind: 'post' },
    { id: 'lab', name: 'Laboratory', x: 93, y: 27, kind: 'lab' },
    { id: 'scene', name: 'Scene Shop', x: 58, y: 73, kind: 'shop' },
    { id: 'admin', name: 'Administration', x: 17, y: 71, kind: 'office' },
  ],
  phases: ['Script', 'Cast', 'Shoot', 'Post', 'Release'],
};
const PHASE_INDEX = { Writing: 0, Casting: 1, Shooting: 2, Post: 3, 'Release ready': 4, Released: 4 };
// Long-name / stress fixture (illustrative) used only by the constraint boards.
const LONG_FIXTURE = {
  employees: [{ id: 'P-101', name: 'Maximiliana Featherstonehaugh-Delacroix', role: 'Director of photography', group: 'Crew', work: 'The Extraordinary Misadventures of a Studio That Would Not Sleep', place: 'Stage 07', status: 'Working', x: 40, y: 53, f: [2, 6, 4, 1, 1, 2] }],
  projects: [{ id: 'FILM-101', title: 'The Extraordinary Misadventures of a Studio That Would Not Sleep', phase: 'Shooting', state: 'Take ready to schedule', place: 'Stage 07', group: 'Making movies', genre: 'Comedy', action: true, x: 40, y: 53 }],
};
