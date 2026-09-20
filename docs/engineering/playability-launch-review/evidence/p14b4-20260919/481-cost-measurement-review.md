# 481 — Actual temporary instrumentation review

2026-09-20. Qualified KEEP for removable diagnostics, not an optimization.
Parent read complete480 diff, including the initially truncated middle, and
full135-line handback; independently checked sole protected-file scope, whitespace,
17 immutable pins, original kernel and both failing-test pins.

Base `32d04de361ae41534bf7e69345a8e061f8cbad4c`.
Instrumented replay `10804e2fa42d84196dd5886ae3db509041e5ada6059de54237d8267309a6936e`.
Handback `88ae316c0ad5d5881d2a1db637b925ddb5272701b6b315edea9ac8cc2970517a`.
Protected patch `dc61ac2c3e7d4cbf914729cfb55da92a59a80e8c205a9b4abd8de97042b87f75`.
No protected untracked files. Reverse patch retained for exact466 restoration.

Native independent contract-auditor FULLdiff/handback KEEP:
- Original payment expressions, comparisons, increments, saturation, owner
  calls, scans and catches unchanged; added operations only observer storage/tags.
- Successful payments enter exactly one category/context; nested calculators
  keep their tags, mixed reserves are accurately named. Failed request is not
  successful work; actual initial + successful units + saturation gap reconciles
  to final used. Zero-unit calls remain counted.
- Exact cell/record identity references original shared entries. Each observed
  visit follows successful pay6. Actual modes/atomic publication remain; shadow
  hints publish only on completed hot/upgrade/cold returns. Partial calls stay
  pending. Successfully prepared cells are registered even with no fact calls.
No concrete correction found.

Static acceptance is NOT executed neutrality, a cheaper tariff or fit evidence.
Release482 firsttake then483 stale SERIAL at frozen source. Require baseline
producer196468/complete and original kernel failure325; stale cut beforePost3 at
usedBefore199998/request673, complete summaries, reconciles:true and zero observer
consistency failures. Preserve raw/json/patch and exact intervals. Only after both
close, parent removes observers and verifies exact466/kernel/tests/protected
cleanliness, then records484 analysis. No paid-hint or native-Map optimization
adopted; prospective model cannot certify an unobserved suffix.
