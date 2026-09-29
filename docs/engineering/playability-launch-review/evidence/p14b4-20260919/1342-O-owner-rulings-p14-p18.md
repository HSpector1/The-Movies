# 1342-O: Owner approval of the twelve P14-P18 rulings (2026-09-29)

On 2026-09-29, in the Claude session, the Owner approved a drafted instruction. The draft is
`PROPOSED-OWNER-RULINGS-P14-P18.txt`, and the parent kept it byte for byte as
[1342-O-owner-rulings-p14-p18-approved.txt](1342-O-owner-rulings-p14-p18-approved.txt): 11,122 bytes, sha256
e04b4287c763c3ee56f37984d5878afb286023ce0d87ddd45d816468f1baa10e. The draft's header says its items are
recommendations until the Owner approves them. The Owner's approval message, word for word:

```text
I approve the 12 decisions in PROPOSED-OWNER-RULINGS-P14-P18.txt,
including genuine player bankruptcy, the current-tier/conflict distinction,
and the bounded delegation for P18.

Record them as my explicit current rulings in the existing records.
Apply at the next safe checkpoint without interrupting active verification.

Continue U2, the scoped environment repair, rival shelving and the
authorized program. Do not reopen these choices for routine details.
```

These twelve are therefore explicit current Owner rulings. They follow the five of [1340-O](1340-O-owner-rulings-20260929.md)
and do not reopen them. The bankruptcy, 2040 and post-2040 selections come from this approval. They do not come from
RECONCILIATION-02 (c5b52b4d), which calls itself research and not Owner authority.

## The twelve rulings (summary; the approved text governs)

| # | Ruling | Closes |
|---|---|---|
| 1 | One scoped Pillow installation for the existing image tests. Use the tests' own `python3`, and a user-site install only if that interpreter supports one. If the interpreter is externally managed, use a project-local virtual environment and a scoped test-runner environment. No sudo, no `--break-system-packages`, nothing committed to Git. Record the setup | the 13 `PIL` environment rows (10 UI, 3 core) |
| 2 | Power Ranking is quarterly. The formula, weights and ties are provisional tuning, written and reviewed before implementation. The 1122-A presentation stays, and no covert second financial ranking is allowed | P15 §4.3 Power Ranking |
| 3 | The player's studio can fail, after warnings and real recovery chances, including contracted interest-bearing loans under the shared rules. This supersedes the older no-player-bankruptcy wording. The player gets notices and a recoverable end-of-run record. P15 owns distress and closure; P16 owns acquisition | P15 §4.3 closure asymmetry |
| 4 | Authored arrivals stay unchanged. No minimum studio count and no automatic replacement studios; consolidation is allowed. The late-entry pack is not authorized | P15 §4.3 later entry |
| 5 | A 2040 ceremony and an interactive Legacy dossier built from recorded history. The official Legacy boundary is frozen at 2040 | P15 §4.3 finale |
| 6 | Endless sandbox after 2040 under the ordinary simulation, failure risk included. The 2040 Legacy snapshot stays frozen | P15 §4.3 post-2040 mode |
| 7 | No near-deadline promise override in the first slice. The existing rules and the renegotiation route stay | P14 companion §7.3 Q1 |
| 8 | Each pair has one current friendship tier, set by closeness and its evidence. Three competitions are conflict evidence, not an automatic Enemies/Nemeses tier. Current hostility governs current consequences, and old conflict does not override current positive closeness forever. Implemented in the existing tier law; no negative driver counts twice | OPEN 11 (friend/enemy precedence) |
| 9 | P17 options #3 and #5 are declined for the first checkpoint | P17 §19.2 #3, #5 |
| 10 | P18: the limited-series first-season example and the eight bounded recommendations, with the remaining economic rules delegated to provisional authoring inside the listed bounds. One compact contract and one independent review come before implementation | P18 charter scope |
| 11 | The 2026-10-06 date no longer stops the work. The program continues until done, paused, or blocked by a genuine boundary. No automatic P19 | the autonomous window |
| 12 | Protected main stays protected; work publishes to the working branch. A qualified review-ready PR is allowed; merging needs separate Owner approval | main promotion |

## Where the rulings are recorded

- this record and the approved text beside it;
- [DECISIONS.md](../../../../../DECISIONS.md), section "Owner rulings, 2026-09-29";
- ruling 3's amendment pointers: an amendment note in
  [OWNER-RULINGS-HOLLYWOOD-HORIZON.md](../../../../OWNER-RULINGS-HOLLYWOOD-HORIZON.md) §3, in the
  [CLAUDE.md](../../../../../CLAUDE.md) "Not current scope" list, and in the DECISIONS.md economic ruling. Each keeps
  the older text as history and points its active instruction here;
- the handoff CURRENT blocks.

## Execution order

1. U2's recorded UI gate runs unchanged. Pillow stays uninstalled until that gate finishes, so the gate stays
   comparable to 1339.
2. The Pillow repair (ruling 1), then the affected image tests through the same subprocess environment.
3. Rival shelving (D-1329-1) and its verification before any live shared-market pressure.
4. Independent P15 pure-law and P14 relationship work meanwhile, each with its own contract, review, RED, production
   and closure. Delegated tuning and rule authoring are written down and reviewed before they are implemented.

## Later the same day: specialist concurrency

The Owner then wrote, word for word:

```text
Use as many sub agents as you need to get this work done. You are the orchestrator so I trust your judgment with sub agent usage if you feel like it drives us towards completion
```

This lifts the two-specialist cap. The parent keeps two limits as technical rules, because both protect evidence:
- one production writer, so that two writers never edit the same source;
- one heavy test process at a time, because a parallel run changes the load the timing-sensitive gates measure
  (1331-1341).
Independent review stays separate from authorship.
