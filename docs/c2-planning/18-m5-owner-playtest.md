# M5 OWNER PLAYTEST — THE LIVING STUDIO (ten minutes)

> The bar you set: *"The lot feels alive because the studio keeps working while I
> watch it."* This sheet is the shortest honest road to a yes or a no. Two saves,
> one press each, and about ten minutes. Everything below is measured at the
> milestone HEAD; the numbers are the engine's, not an author's.

## Launch

From the repository root, in two shells:

```
npx vite-node tests/_m5PlaytestSave.ts        # mints the two saves, prints what they owe
npm run dev -- --port 5179 --strictPort       # the SHIPPED grid world, the origin the proof runs on
```

Open **http://localhost:5179**. No environment variables: the grid world is the
shipped default, and 5179 is only so you are standing exactly where the browser
proof stands. The minting step writes `m5-playtest-pressure.json` and
`m5-playtest-wrap.json` to the repository root and prints the week each studio
owes each event — keep that output beside you and hold the game to it.

To load either one: **Saves → Import → choose file**, then open the Lot. The
transport lives in the top bar: **Hold / Roll**, and **1× · 2× · 4×**.

---

## 1 · A picture wraps, and nobody stops you (about 2 minutes)

Load **`m5-playtest-wrap.json`**. Two companies are shooting. Week 7.

Press **Roll** once. Do not touch anything else.

- Week 8 arrives on its own, and **principal photography wraps**. The studio
  says so — a line appears naming the picture and the stage it is clearing —
  **and it keeps working.** That is the whole point of the split: a wrap is news,
  not a decision, so the weeks carry on.
- Watch the stage it clears, and the freight on the roads.
- Press **Hold** when you have seen it.

**Looking for:** did the studio tell you, without making you deal with it?

## 2 · Sixteen weeks, hands off (about 6 minutes)

Load **`m5-playtest-pressure.json`**. Week 2. This studio is in trouble and does
not know it yet: three pictures greenlit against two Development & Casting rooms,
every set struck so nobody can reach a stage, a scenery shop rising to fix it,
and a bank balance that will not last.

Press **Roll** once. **Then put your hands in your lap.** At 1× a week takes
about ten and a half seconds; the whole stretch is under three minutes at 1× and
about forty seconds at 4×. Start at 1× and change pace when you feel like it —
the pace changes what you see and nothing else.

Watch for these, in this order, with no input from you:

| week | what happens |
|---|---|
| 5 | **the queue drains.** The picture that has been waiting at the door takes the room that frees, and starts Development. Three pictures in flight where there were two. |
| 5 → 18 | **companies stand by, and say why.** The Call Board reads *"waiting for a standing set to start Rehearsal"* — the studio's words, the studio's reasons. |
| 13 | **the scenery shop opens.** The studio announces it and **does not stop.** |
| 19 | **the studio stops itself.** The money crosses zero, and it holds, and it tells you which stop did it. |

Change pace mid-stretch — 1× → 4× → 2× — and satisfy yourself that the studio
lands on **week 19** regardless. Hold and roll again a few times. The week the
studio stops on is the engine's, and pace and pausing cannot move it.

**Looking for:** did you want to reach for Advance Week? If you did, say where.

## 3 · The verdict (about 2 minutes)

Sit with the paused studio a moment and answer three things:

1. **Did it feel alive** — or did it feel like a spreadsheet with a timer on it?
2. **Could you always tell why nothing was moving?** A company standing still
   with a stated reason is the studio working. A company standing still with
   nothing said is the failure this milestone has to avoid.
3. **Did anything teleport?** Freight should travel, stages should carry marks,
   and a week should look like a week — not a jump cut.

**PASS** = "I stopped touching the controls and the studio kept working, and I
always knew what it was doing." **FAIL** = a silent stall, motion you could not
attribute, or a moment where you had to press something to keep it alive.

---

## Two things to know before you judge

- **Nothing here is on a renderer clock.** The engine's week is still the only
  clock there is. The transport spends wall time and then commits the identical
  advance your own press commits — proven four ways over: the same seeded studio
  advanced by hand, by the loop at 1×, paused and resumed at random, and
  batch-skipped, all four exporting byte-identical saves.
- **The lot's own appearance has never been reviewed by a person.** The theater's
  marks, the crates on the road, the backed-up apron, the Call Board placards and
  the grounded patrols are all measured and all tested, and no human eye has
  passed over them. That is what this session is for, and it is the one gate no
  test can close.
