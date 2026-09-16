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
