# 1142-C — Correction to the pending lifecycle-row note

1142-A's final pending-row paragraph incorrectly says the captured natural208
state needs a later209 profession change. A standard-library-only read of the
actual immutable capture shows that both changes are already recorded at208:
`authored-0000` Actor→Director, profession-change-0 / transition-evaluation-0;
`authored-0001` Actor→Writer, profession-change-1 / transition-evaluation-1.
The people’s current role fields agree. No project module, save validator,
migration, gameplay or tick was invoked for this check.

Input: `tests/fixtures/p14/genuine-v38-pre-p3/genuine-v38-p3-natural-week208.json.gz`.
The complete gzip SHA256 is
a7418eb0f90fa2d10ae65e78e3c3b9e75ec19346970c677c1cfdeefce42b2960;
complete decompressed SHA256 is
ebb00ca54328ef3340d959d830045d28c73dc493b8f069220256183e718fc4bb.
Both match the frozen helper and outgoing manifest. The stored market week is208.
This agrees with1117/1131's actual two-change capture and1121's lifecycle premise.

The current D08/D12 plan, actions, test selection and400-call cap are unaffected.
Preserve the already-published1142-A/B bytes and read this correction with their
pending-row discussion. The later D10/D11 plan must start from the actual208
Director/Writer authority and count every new advance within its existing156-call
208→364 allowance. No recreation207→208, extra209 prerequisite, new route or
claim of that later test's execution is introduced by this correction.
