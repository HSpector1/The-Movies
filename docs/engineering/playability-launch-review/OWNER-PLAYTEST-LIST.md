# Owner playtest list (grows with each phase; nothing here is labelled accepted)

Howard: when you are back, play these on the newest paired candidate named in `CONTINUATION-STATE.md`. Each item names what to try and
what "good" looks like; the coordinator's native evidence is linked from the handoff but is not your verdict.

1. **Lot main screen (R3-N1, Build50+)** — people rail left, pictures rail right, lot centre usable. Click a person and a picture: the
   compact inspector opens over the lane with both rails still alive; Back returns you to the same scroll position; Escape closes ONE layer
   at a time (never also the menu). Try text size 100/150/200 % from the menu: headers never overlap, titles wrap, LOCATE/DETAILS stay
   reachable, the inspector body is opaque. Find in the pictures rail takes typing; Tab out then arrows move the row cursor.
2. **Locate then rail** — locate a worksite from a picture's inspector, then click a person in the rail while the lot selection is still
   active: it must open immediately (no need to clear the selection).
3. **Schedule-take route (managed campaign fixture)** — open the ready-to-schedule picture, act elsewhere, come back: the offered action
   is re-derived from the fresh state; acting twice never dispatches twice.

4. **N2 close-out (Build53+)** — at 200 % on the 1280×720 window: the pictures list still shows a card zone and pages; the compact inspector
   shows "More actions ▸" when its footer would not fit, Tab reaches the folded items and Escape closes the list first. Keyboard only: Tab into
   the employees search, type, Tab out, then Down/Enter should move down the list and open a row — this is the one item still failing in the
   coordinator's native runs (F21); tell us what you see.
5. **Schedule-take (managed fixture)** — open the ready-to-schedule picture from the rail, then its Production workspace: the "Schedule the
   shooting take" action fires once and disappears with a Confirmed notice; nothing fires twice.

6. **Visual standard (N3, Build56+)** — at 100/150/200 %: every stage on the lot shows a distinct picture for planned, building, shooting,
   wrapped, committed, in theaters and released; rail portraits are 4:5 monograms (real captures arrive with N5); text never shows □ boxes
   (tell us any glyph that renders as a box). Menu → the "Text metrics" line should read `scale=1` and `meta d12→12/18/24` at 100/150/200 %.
7. **Screenplay review route (F26, fix due in N4)** — on a 1280×720 window at 100 %: open a picture's Production workspace, Escape twice back
   to the lot, then click a script card in the pictures rail and press "Review screenplay". Before the fix the button sits above the window;
   after it, the review opens and "Accept" advances the script. Tell us whether the Schedule-take offer on the still-open Production workspace
   re-derives (a "Confirmed" notice, one dispatch) after that acceptance.

