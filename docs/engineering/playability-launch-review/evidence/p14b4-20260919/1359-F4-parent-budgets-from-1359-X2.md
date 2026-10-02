# 1359-F4: parent ruling on the P15C Wave 2 budgets, from 1359-X2

[1359-X2](1359-X2-p15c-wave2-reference-rerun.md) measured RED r4 and reference r3 on a quiet lane. Every leaf
behaved as declared. Route L is lawful, and 1359-X's two findings are fixed. 1359-F3 sets the route and extension
budgets from this run. The helper (`tests/helpers/p15c2-legacy.ts:24-33`) asks the parent to set every PROVISIONAL
number from the first single-file run, so this ruling sets all of them.

## The rule

Each budget is about six times the slowest single-file time of its class, rounded up to a round number. Two
measured factors give the six:
- **Full-suite load,** about four times. 1353-F3 measured up to 3.7 times for the Wave R guard: 90.4 s full-suite,
  189.9 s isolated under load.
- **The pinned Node,** about 1.4 times. 1359-X2 ran Node v22.23.2. Recorded runs pin v20.20.2, and 1344-J3 item 9
  measured v22.23.2 at a median 0.67-0.75 of v20.20.2 durations.

A budget at this level still fires on a gross slowdown. It does not fail a lawful run under load.

## The numbers

| Constant (r4) | r4 value | Slowest measured (1359-X2) | Final value |
|---|---:|---|---:|
| Route | 600,000 | control 9,095 ms; a route leaf run alone pays the route and its body, about 13.4 s (`legacy-determinism`) | 90,000 |
| Extension | 1,800,000 | `extension520Ms` 13,707.6 ms | 90,000 |
| Post-freeze (route plus extension) | 2,400,000 | `legacy-adapter-only-at-boundary` 13,879 ms with the route memoized, about 23 s alone | 180,000 |
| Fixture | 600,000 | `legacy-migration-empty-root-genuine-save38` 17,259 ms | 120,000 |
| Wave R guard | 300,000 | first guard 51,550 ms | 300,000 (1359-F3: unchanged) |

## What r5 changes

The test author makes RED r5, test-only, with no other change:
- **The numbers** above.
- **Names and messages lose "PROVISIONAL",** since these numbers are measured. The author keeps the renaming
  mechanical and lists every changed line.
- **The budget comments record the measurement** and this rule, citing 1359-X2 and 1359-F4, as the helper's comment
  asks.
- **The classification's `provisionalBudget` field** follows the new names.

## The in-loop ceiling (1359-C4 "Not decided" 3)

No in-loop ceiling is required. 1359-F2 item 2 asks for budgets that can fire, and the post-body assertion fires: it
fails the leaf by name once the elapsed time passes the budget.

1356-F5 put a check inside 1356's harness for a different reason. That ceiling was a declared limit on a
6,240-week campaign, and the `it` timeout that held it could never fire. Route L's loops are short, about 9 s and
14 s.

## Next

1. r5 from the author.
2. The confirmation review 1359-D4 covers r4 against 1359-F3 and r5 against this ruling, with 1359-X2 as the
   measurement. It confirms that r5 changes only what this ruling names.
3. Recorded RED after the P14 closure, in the queue order of HANDOFF.md.
