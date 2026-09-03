# P06D §25 — Hollywood Wire / P07 Future Seam (CONCEPTUAL architecture only)

> **This document adds no code, no schema fields, no DTO changes, no save-format changes, and no runtime
> dependency.** It describes *conceptually* how a future authoritative P07 / Hollywood Wire layer could
> extend the movie rail, so the seam is understood before it is ever built. P06D **invents none** of the
> types or fields named below. The rail today deliberately **stops at COMMITTED** — the last lifecycle the
> current authority projects — and renders nothing beyond it (no Released / In-Theaters / Reviews /
> Earnings). Hollywood Wire is a **separately designed** layer; do **not** import its prototype and do
> **not** take a runtime dependency on it from the rail.

## Why a seam, not a build

The §29 rule stands: presentation changes never force a wire change. Releases, reception, and
industry-news are *authority*, not presentation — they belong to a future P07 layer that owns that data.
P06D's job is only to make sure the rail **already has a natural place** for that authority to land, so
that when P07 exists it is an additive extension rather than a rewrite. Nothing here is scheduled or
committed; it is architecture documentation.

## The conceptual extension: `MovieRailFutureExtension`

Purely as a thinking model (no such type exists in the repo), a future P07 layer could supply, per
picture, a small read-only extension that the rail would compose *on top of* today's projected row:

- **`authoritativeLifecycle`** — P07 supplies **new lifecycle values beyond COMMITTED**, e.g. `RELEASED`
  and `IN THEATERS`. These are *authority the current wire does not carry*; the rail must never infer them.
  Today the lifecycle vocabulary ends at `Committed` (`StudioMovieRailContracts.Lifecycle`).
- **`optionalStoryAttentionId`** — an optional pointer to a related **Story Packet / industry-news**
  attention item (a Hollywood Wire concept). If present, the rail could surface a restrained marker linking
  the picture to a wire story. Optional by construction: absent today, absent by default forever unless P07
  supplies it.
- **`optionalResultAvailability`** — an optional signal that **reception / box-office result** is now
  available for the picture. The rail carries *no money and no reception today* (the DTO has neither —
  §26); this field would let P07, and only P07, turn that on.

All three are **optional and P07-owned**. The rail's contract if they are absent is exactly today's
behavior: stop at COMMITTED, show no result, show no wire story.

## The single seam: the lifecycle → group mapping

There is exactly **one** place the rail decides a picture's stage, and it is pure and centralized:

- `StudioMovieRailContracts.ProductionLifecycle(string operationalState)` — maps an authoritative
  `operationalState` token to a `Lifecycle` enum value (or `null` to withhold).
- `StudioMovieSlateContracts.ProductionGroup(string operationalState)` — maps that lifecycle to a
  `RailGroup` (SCRIPTS / MAKING MOVIES / **POST & RELEASE**).

Both functions already fold `Post`, `ReleaseReady`, and `Committed` into the **POST & RELEASE** group. That
group's header **already exists** and is the **natural insertion point** for any future post-COMMITTED
lifecycle: a `RELEASED` or `IN THEATERS` value would slot into the same group with no new section and no
new layout law. The lifecycle→group mapping is therefore the *single seam* a P07 layer would extend.

## Existing extension points that need no wire change

The seam can be widened *conceptually* through points that already exist, without touching the wire:

- The authoritative **`operationalState`** vocabulary could gain new values (P07's job). The rail's mapping
  functions would gain matching arms; everything downstream (grouping, header emission, draw, hit-test)
  already generalizes over "whatever lifecycle came back".
- The `Lifecycle` enum could gain values *after* `Committed`; because grouping is centralized, they route
  to POST & RELEASE by adding one `case` — a localized change, not a structural one.
- The row draw is already lifecycle-agnostic: it reads `PlainState`, `LocationLine`, `AttentionOf`, and the
  discrete track from the projected row. A new lifecycle needs no new draw path.

## Hard boundaries (do NOT cross now)

- **No wire change.** No protocol/schema/save/DTO field is added for any of the above. `MovieRailFutureExtension`
  is a *concept in this document*, not a type in the code.
- **No speculative fields.** Do not pre-add `authoritativeLifecycle`, `optionalStoryAttentionId`, or
  `optionalResultAvailability` to any DTO "for later". A silently added field is a gap nobody can find.
- **No P07 render.** The rail stops at COMMITTED. Do not render Released / In-Theaters / Reviews / Earnings.
- **No runtime dependency on Hollywood Wire.** It is designed separately. Do **not** import its prototype;
  the rail must not take a compile-time or runtime dependency on it. When P07 is authorized, it lands as an
  additive authority behind the same projected-row contract the rail already consumes.
