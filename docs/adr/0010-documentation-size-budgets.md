# ADR-0010: Documentation size budgets

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

Documentation here has the same accretion failure as the code, at larger scale:
`LESSONS-LEARNED.md` is 3,733 lines, `DECISIONS.md` needed a correction because nobody
could hold the docs it indexed in view, and ~110 narrative files bury the four or five
documents a session must actually obey. A doc nobody can re-read is a doc that silently
goes stale — this repo has already proven that once.

Budgets assume prose wrapped near 100 chars/line; where wrapping is inconsistent,
treat the numbers as approximate word-count-equivalent, not an excuse.

## Decision

Adopt per-type budgets (target → hard stop), enforced by the same CI line-count gate
as ADR-0009 on new-or-touched docs:

| Document type | Target | Hard stop |
|---|---:|---:|
| Root README | 150–350 | 500 |
| ADR | 40–120 | 200 |
| Contract / technical reference | 50–400 | 600 |
| Mission charter / RFC-shaped proposal | 150–500 | 800 |
| How-to (e.g. PLAYTEST.md) | 50–200 | 300 |
| Explanation / lessons-learned *per topic file* | 100–400 | 600 |
| Session closure record | 50–250 | 400 |
| Code comment block | 1–8 | 15 |
| TODO/FIXME | 1–3 | 5 |

Structural rules that make the budgets achievable:

1. **One question per document.** `LESSONS-LEARNED.md` splits into per-topic files
   under `docs/records/lessons/`, each within the explanation budget; the original is
   archived verbatim, not edited.
2. **Records are immutable, policy is small.** Session records (ADR-0008) are exempt
   from retroactive trimming — the budget applies at creation time. Standing docs
   (ADRs, contract, README) must stay within budget forever, which forces supersession
   instead of accretion.
3. A doc crossing a hard stop needs the same exception block as code (ADR-0009).

## Options considered

1. **No budgets** — produced the current state: the true answer to "what is policy"
   already drifted from the docs once.
2. **Cull existing docs to fit** — rewriting history-shaped records destroys the
   evidence chain the owner-ruling system depends on. Rejected; budgets bind at
   creation and on standing docs only.
3. **Creation-time budgets + immutable records (chosen).**

## Consequences

- Closure docs get shorter and denser; long narratives move to per-topic lesson files
  that future sessions can actually be pointed at individually.
- The README required by issue #4 has a defined size envelope from day one.
- Some friction when a session "just wants to write it all down" — the valve is
  splitting by topic, which is exactly the behavior the budget exists to force.

## Revisit when

A doc type consistently needs exceptions (3+ in a quarter) — re-tune that row rather
than letting exceptions become the norm.
