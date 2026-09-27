# 1107-G — Fixed-order arithmetic correction verified

The bounded correction passes all eight new regression cases and all 129 agreed
neighbors. Root, UI and Bridge type checks also pass. This closes the arithmetic
correction, not C.3 endurance or full-suite qualification.

All candidate runs used HEAD 36896cb8cb6875077f3ad55ff8eec2d015830910 plus exact
combined source patch 5ebcac14751d1f22a02882db72fe4e0f00ec952da4fe1a3cc0f1815d5c54237a,
with fixedSource:true and no untracked consumed source. The only five consumed
paths changed are the four production files and the independently authored test.

The original shared force sequence now lives in tuning. Worldgen imports and
re-exports that same constant, and reception/forecast use it for both weighted
sums. Moving the constant adds no runtime cycle: tuning has only type imports.
All arithmetic operations, inputs and RNG draws remain unchanged; historical
saves/results are not rewritten. Independent 1107-F reviews the exact source.

Production patch: 4,609 bytes, SHA
`d35bd1fe8004943d73e8f285266afcfdf65ce77eab2ddfee65b4eff949c70fd2`.
All four original files were independently matched to original A's aa9 source.

| File | Current bytes | SHA256 |
| --- | ---: | --- |
|src/core/forecast.ts|20511|13add49ffbcf0811b56de03c3978e0122c0f901226b405a76359b8b8fda6ae04|
|src/core/reception.ts|36818|bd8418a714819a1b9e4401f0cadd843ce0698615610d663b611c833c1bb9713b|
|src/core/tuning.ts|136827|bd6da50cf43ad7ec56ca1891ead4d6850ed2b03ecbdd853a06be5e3fbb70a541|
|src/core/worldgen.ts|35782|ddee41b2181a94c5085aa3255ead4af627f443353cc63a064062d47780520417|
|tests/p14c3-force-order.test.ts|17550|baff4328fec99d7ed5c59072ea01172e733b6a46bb56be30d1952999e11b63c6|

| Record | Actual result | Recorder seconds |
| --- | --- | ---: |
|1076, unchanged production plus new test|6 FAIL / 2 PASS; intended exact permutation and imported-route failures|15.628|
|1077, identical command after correction|8 PASS|14.809|
|1078, seven whole neighboring suites|129 PASS|15.289|
|1079, root types|PASS, zero diagnostics|32.073|
|1080, UI types|PASS, zero diagnostics|48.760|
|1081, Bridge types|PASS, zero diagnostics; consumed original1052 dependency guarded|29.192|

The RED's original capture contains all five full canonical reception/forecast
outputs and RNG values. GREEN reproduces its exact 15,830 bytes and SHA
`d0ad3a57c18f9a3aa188ffee52a483d9e727b2dfb888a7af10858ad5d6770cba`.
Both parent and independent review compared the complete lines literally. Equal
permutation results alone were not used to infer preservation of prior outputs.

Both actual short routes complete twelve ticks and five actions each, using the
same genuine accepted1300 save and original five commands. All 18 admitted
boundaries now match. Both final saves have 1,678,925 bytes, SHA
`379bf8195acf61c8abb61dcb41efe35dadf01262cb19f4b7eedb0afe0d45f91b`, and the original
canonical RNG. The full original A film, six career rows and history row match,
including downstream genre experience. Original RED first diverged only on the
1311→1312 tick; that failed evidence and original long C failure remain intact.
The short routes are explicitly reconstructed from1300, not historical raw
in-memory A1300 captures or new full-century runs.

1081's unchanged actual Bridge configuration also guards its imported original
1052 docs producer: 66,372 bytes / f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d.
The new1108 lineage source still needs its separate compiler and data-only gates;
ordinary type checks do not qualify it by implication.

Next: publish the exact corrected source and records, verify the GitHub ref,
then finish the separate1108 source-compatibility amendment. Corrected C must
perform its real reload/derivation route and corrected D continuous replay with
extra reads, both against every original A command, complete checkpoint, root
and retained authority. Original A/B remain qualified historical-source runs;
this does not claim four same-source variants. No completed A/B rerun is needed
for that explicitly reviewed scope.

1093/1096 maintenance and the separately authorized B5 pin amendment remain
unapplied until endurance parity closes. All1103 final gates, inherited failures,
canonical098 Writer-work gap, R8 timeouts, funded-workload/storage limitations,
Unity/native deferral and Owner acceptance limits remain. No full C.3 or program
completion is claimed by this bounded correction.
