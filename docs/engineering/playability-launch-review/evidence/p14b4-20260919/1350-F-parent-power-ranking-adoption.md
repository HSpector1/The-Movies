# 1350-F: parent adoption of the P15A.2 Power Ranking charter

[1350-B](1350-B-power-ranking-charter-review.md) returned ACCEPT with no blocking defect. The parent adopts
[1350-A](1350-A-p15a2-power-ranking-charter.md) with the review's notes:

- **Citations.**
  - Rival reserve weeks: `hollywoodStartingData.ts:12-36`; the 12-week floor is at `:36`.
  - `RivalAccount`: `hollywoodTypes.ts:68-73`.
  - "No Bridge path reads rival cash" rests on the absence of any `.cash` or `RivalAccount` read in
    `bridge/industry.ts`, not on `:125`.
  - `1323-A:106-107`.
- **Invariant.** `baseMarketValue` is drawn once at world generation (`worldgen.ts:671-679`), and no tick writes it.
  So the reach term's divisor is the same at a film's release and at a snapshot 52 weeks later.
- **RED additions.**
  - The band's thresholds at each boundary: cash ≤ 0 reads In the red; 12 weeks Strained; 13 and 25 Stable; 26
    Thriving; a zero fixed cost Thriving.
  - The Releases lane excludes authored pre-1920 films.
- **Noted incentive.** Releases counts every release, while Films averages only the best four. A studio can raise
  Releases with weak films without lowering Films. That is the intended split between quantity and quality, and the
  Wave 4 playtest judges it.
- **Founding edge.** While the player is still founding, overhead and facility cost are zero and the band reads
  Thriving. The first ranked snapshot is at week 52 or later, so this is not expected to show. A test pins what
  happens if it does.
- **1347-F's internal order.** 1350-B noted that 1347-F's addendum supersedes its earlier projection split. The
  addendum says so in its last sentence, and 1350-A follows the addendum.

Order: Wave 1 (pure `src/core/powerRanking.ts` plus the TUNING constants; no save, no projection) goes to RED staging
now. Production queues behind the single writer. Wave 2 (the archive root and the Bridge view) comes after the save
steps of shelving (43) and relationship slice B (44).
