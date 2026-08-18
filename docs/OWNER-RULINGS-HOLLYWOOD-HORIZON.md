# OWNER RULINGS — HOLLYWOOD HORIZON & ECOSYSTEM GOVERNANCE

> Recorded 2026-08-18 by Owner order, as a **documentation-only** governance reconciliation.
> Base: canonical `main` @ `1e6b422`. Save format verified live as **SaveFileV13**.
> No production code, test, schema, asset, tuning value or mechanic was changed by this record.
>
> These rulings are **current authority** and supersede historical milestone exclusions where they
> conflict. They authorize **no implementation**. Every system named as a long-term direction
> remains outside current scope until the Owner or the current campaign charter authorizes it.
>
> Evidence: `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` (the future-proofing scout, findings
> accepted by the Owner 2026-08-18).

---

## 1. TIME HORIZON

- Project: Studio **begins in 1920**.
- There is **no hard calendar game-over**.
- Authored progression must intentionally support play **through at least 2040**, with simulation
  continuation beyond that permitted.

**Status of the engine against this ruling (observed, not designed here).** The time model already
satisfies it: `market.tick` is an unbounded absolute week counter validated with a minimum of 0 and
no maximum, every persisted week is absolute rather than year-relative, and there is no `gameOver`,
`bankrupt`, `maxWeek` or terminal state anywhere in `src/`. Anchoring a display year later
(`year = 1920 + floor(tick / TICKS_PER_YEAR)`) is a pure projection that reinterprets no stored
value. The `SIM_CAP = 520` constant in `ui/src/engine/adapter.ts` is a **per-invocation advance-loop
bound** that preserves state — it is not a calendar ceiling and does not violate this ruling.

The two things that do **not** currently satisfy this ruling are recorded in the scout report and in
ruling 2 below: the film-concept supply, and long-horizon tick performance. Neither is an
architectural one-way door.

## 2. FILM CONCEPT SUPPLY

- The present **30-concept pool is NOT a lifetime product cap**.
- Long-term concept supply must become **renewable / effectively unbounded**.
- Existing `FilmConcept.id` values are **permanent historical identities**.
- Concepts may be **appended with fresh IDs**. An existing ID may **never** be removed, reassigned
  or re-minted.
- **No concept generation is implemented or designed by this record.**
- **C4 (Era / Genre / Research) is the current intended owning campaign**, unless later Owner
  authority changes sequencing.

**Why this ruling exists.** Under managed script development a campaign can commission at most 30
screenplays for its entire life — the pool is fixed at worldgen, a concept is claimed permanently by
any project in any status including `produced`, and exhaustion raises a terminal blocker whose only
stated remedy is "continue with an existing project". Against ruling 1 that is a de facto stop
roughly a decade into a 120-year design horizon.

**Why the ID clause is load-bearing.** A released film resolves its own title and genre through
`FilmResult.conceptId`. A regenerated pool that re-minted an existing ID would silently rewrite the
identity of films already in the player's history.

## 3. PLAYER BANKRUPTCY VS RIVAL FAILURE

- The existing **no-hard-bankruptcy / no-receivership ruling applies to the player's studio.**
- It does **NOT** permanently prohibit future **rival** studios from experiencing distress,
  bankruptcy, receivership, sale, merger or acquisition, when and if the Hollywood Ecosystem is
  authorized.
- **This ruling adds no rival mechanics now.**

The prior prohibition (no financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder
or arbitrary cash sink) remains in force **for the player's studio** and is unchanged.

## 4. HOLLYWOOD ECOSYSTEM

Rival studios, rival films, multi-studio awards, film-library / IP economics, creative dynasties,
acquisitions / subsidiaries and related competition are **legitimate long-term product directions**.

They are **NOT currently authorized implementation scope.**

The governing framing for all such items is now:

> **Not current scope unless explicitly authorized by the Owner or the current campaign.**

This **replaces** any framing that presented them as permanent, non-negotiable product exclusions.
**Newer Owner authority supersedes historical milestone exclusions.** Non-goals are not erased —
they are reframed, and any item's *permanence* remains an Owner call that this record does not make.

## 5. FOUNDING-FLIP MIGRATION LAW

> `INITIAL_PROPERTY` is **historical V12→V13 migration authority** and must **never** be edited as
> the fresh-game template. The Founding Flip must introduce a **separate bare-start property
> definition**.

**Why.** One constant currently serves three incompatible roles: it seeds every fresh world, it is
the value the V12→V13 migration synthesizes for **every migrated save**, and it is the frozen-builder
equality target. Editing it to produce a bare starting lot would retroactively change what every
existing V12 save reconstructs on load — silently deleting founding buildings from saves already on
disk. This is irreversible and would not surface as a test failure in new-game paths.

Recorded as **law 29** in `docs/SHIFT-OPERATIONAL-LAWS.md`.

## 6. SAVE-VERSION ROUTING

Live save format **re-verified at `1e6b422`: SaveFileV13.** `makeSave` returns `SaveFileV13` via
`makeSaveV13`; `GameState = GameStateV13`; the highest migration is `convertV12ToV13`.

Stale **current-version** claims were corrected in four routing documents (see the branch diff).
Historical references — milestone closure records, `V11` identity notes, and `V12→V13` migration
mechanics — were **deliberately left unchanged**, because in those places V11/V12 is correctly
describing history rather than claiming the present.

---

*No ruling in this record expands current implementation scope. Sequencing beyond the named C4
intent is not decided here.*
