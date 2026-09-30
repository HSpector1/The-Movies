# 1353-F3: parent response to the P15C RED review 1353-D

[1353-D](1353-D-p15c-red-review.md) returned REFINE with one blocking gap and two notes. The parent takes all three
in revision 1353-C3. It also pins the one ordering rule the gap depends on.

1. **One ref per audience decade (blocking).** 1353-A §5.3 gives `audience-institution` "each audience decade's best
   film" as its qualifying refs, and "each other eligible decade's worst film" as its contrary refs. The rule:
   - "best" means the highest at-release audience score in that decade;
   - "worst" means the lowest;
   - ties go by release week, then film id (the §5.3 common rule).
   The existing ALLSTAR fixture already holds three liked films in one decade. The revision asserts the exact
   `qualifying` list: one ref per audience decade, with the three-film decade contributing only its best film by the
   rule above. It also asserts the matching contrary refs.
2. **N−1 against N for every minimum threshold (note).** Four more boundary leaves go in, each with N−1 and N:
   - `audience-institution`'s `LEGACY_AUDIENCE_MIN_DECADES` (4);
   - `genre-specialist`'s `LEGACY_GENRE_MIN_FILMS` (8);
   - `commercial-engine`'s `LEGACY_MIN_FILMS` (5);
   - `talent-foundry`'s `LEGACY_FOUNDRY_MIN_PEOPLE` (3).
   They close RED item 4 for every archetype, where before only `artistic-voice` had one.
3. **The Wave R budget (note).** `GUARD_TIMEOUT_MS` rises to 180,000. The full-suite first guard measured 90.4 s, and
   isolated reruns reached 189.9 s under load. The header states both numbers. The budget stays a limit that can fire:
   the first guard awaits a memoized Promise, so it yields.
