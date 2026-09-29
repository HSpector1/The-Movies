# 1334-I: attribution of the recorded broad UI gate after repair R3

## Run identity

`vitest run --project ui`, recorded as [1334-r3-broad-ui](1334-r3-broad-ui.json) at source and HEAD 26c91719 (equal
to the remote at preflight), 14:56:24Z to 15:11:59Z, exit 1, empty tested diff, bounded guards exact. Raw
[1334-r3-broad-ui.txt](1334-r3-broad-ui.txt), 393,759 bytes, sha256
8b04090292c5d21da735e697d25a94b0807cd856b1029cce24b10a984c051bf6. Tally: **8 failed files, 26 failed tests, 2666 passed,
5 skipped** (2697); no unhandled error.

## What changed under the UI project since 1331

Nothing it runs. `git diff` between 58c89932 (the 1331 source) and 26c91719 over `src`, `bridge`, `ui`,
`generated`, `scripts`, the package files, the configs and `AUDIO-PROVENANCE.md` is empty. The only non-docs change
is the three R3 core test files under `tests/`, which the UI project does not include (`ui/**` only). 1322, 1326,
1331 and 1334 ran byte-identical UI-project source.

## Result ([1334-I-failures.json](1334-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py) unchanged)

- Against 1303 (the script's reference): 25 RETAINED-SAME, 1 NEW. Clusters: C1 timeout 6, C2 duplicate test id 7,
  C3 `PIL` 6, C4 `PIL` 4, C5 Gate Hiring 2, new 1.
- Against 1331: 25 of its 34 identities fail again; 9 do not, 1 is new.
  - The nine are timing rows. The Casting Review first leaf (cold mount); `StudioLotScreen:930` (focus,
    intermittent); `livingTurn.scheduler`'s five cascade leaves; `WorldFirstWorldInspectorDefault` "reaches the
    canonical deep screen ONLY through the explicit details action", which passes here in 4997 ms against its 5000 ms
    budget; and "routes canvas intent and semantic companion activation to the same owner" (C6), which passes with it.
  - The new identity is `WorldFirstWorldInspectorDefault` "still refuses — and still never dead-ends — when the verb
    cannot prove ITSELF either", failing with "Found multiple elements by: [data-testid="lot-nav-casting-state"]"
    (`:821`).

## Attribution

Every row belongs to a cause 1335-A measured, or to C3/C4 (`PIL` absent, environment).

- The World Inspector sweep "never lets any place print its blocks out of the canonical order" times out (5471 ms).
  The next eight leaves then fail on duplicate elements: the seven C2 rows and the new identity. 1335-A cause 2
  measured this cascade alone: the sweep's body keeps rendering after its timeout, and with a 30,000 ms budget on the
  sweep the whole file passes. Here the cascade reached one leaf further than in 1331.
- C6's reading in 1335-A cause 4 gains one observation. "Routes canvas intent …" passes here in the run where the leaf
  before it did not time out. It failed in 1331 where that leaf did.
- The remaining C1 rows (Casting Review "greenlights …", Authority "never lets stale …", NextEvent "orients a cash stop
  …" and "clears every next-event transient …", `livingTurn.scheduler` "auto-pauses …") are 1335-A's M2 leaves.
- C5 is 1335-A cause 1 (an unmigrated Save16 fixture read by a live reader).

## Disposition

Repair R3 does not change the UI gate: the UI project ran byte-identical source, and every failing identity belongs to
a recorded retained cluster or to its measured cascade. Run to run, the count moves between 26 and 34 with the C1
timing family. U1 (1335-A, reviewed ACCEPT in 1335-B) addresses C1, C2, C5 and, if its reading holds, C6.
