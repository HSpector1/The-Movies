# 1293 — Initial compiler failure preserved

1294-post-capacity-types executed the reviewed source at published
`e33b4b5367903ad534feec8ea8c1d0d931041b5a`. Root TypeScript returned2 from
03:15:26.432Z to03:16:06.136Z on2026-09-28 (39.704s), signal/error null.
The recorder wrapper returned0 because source was fixed; that is not compiler
success. No1295 runtime has executed and no advances occurred.

The complete compiler diagnostics are TS18048 at196:32 and198:83 and TS2345
at203:55 in `tests/p14p4p5-post-capacity.test.ts`. `initial` is asserted before
an Array.map callback, but TypeScript does not retain narrowing of the mutable
outer binding inside that callback. The pending correction captures the checked
value in a local const before the callback. It must preserve every runtime
expectation, timeout, bound and earlier test; independent source review precedes
parent application. Original C/D/stage/manifest remain frozen.

The actual bounded postflight exited0 with allGuardsExact:true within its stated
scope:1,139 automatic files,555 excluded paths and288 authorized manual pins.
This does not claim excluded payload verification or retract1296-B's earlier
access correction. No prior broad inventory helper was run.

Raw:44,452 bytes / `7f5aba3709d4e7d67f2383d566bc4b0048738460193254f492d811aaa10c0385`.
After the reviewed correction is published, use new1294b types(cap0); only a
passing result releases the first1295 runtime(cap2). No silent replacement or
retry of the failed1294 artifacts.
