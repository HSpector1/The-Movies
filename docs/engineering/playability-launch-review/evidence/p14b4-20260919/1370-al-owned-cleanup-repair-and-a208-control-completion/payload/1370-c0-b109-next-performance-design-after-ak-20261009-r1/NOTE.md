One testable next slice is an unescaped ASCII fast path in selected encoder 2529, stringToken at lines 14–16. Keep its original raw UTF8 cap check verbatim, then insert:

```js
if (!/[\u0000-\u001f"\\\u0080-\uffff]/.test(value))
  return ['"' + value + '"', value.length + 2]
// Original JSON.stringify(value) and Buffer.byteLength(text) fallback follows.
```

The classifier rejects quote, backslash, U+0000–U+001F and all nonASCII; empty text, forward slash and U+007F are eligible. Eligible native JSON text is exactly two quotes around unchanged ASCII. Other strings retain the native fallback, including lone surrogates. Standard native RegExp/String/JSON behavior must be explicit; internal primitive builtin call counts change, while source getter/trap behavior stays exact.

This could avoid native string rendering and the rendered-token byte scan. The extra classifier scan/branch could lose, especially on misses. ASCII frequency, speed and memory effects are unmeasured. Earlier accepted profile intervals describe the predecessor fastpass, not the selected chunk encoder; they justify investigating emission work without attributing a measured selected bottleneck or GC cause.

Change only stringToken. Preserve add/flush/final concat, the original key Map/key budget, every cap/coercion checkpoint, first/second source reads, Object.keys ordering, dynamic arrays, numeric formatting, cycles/toJSON/refusals and fresh per-call state. Add no primitive cache, clone, object-result reuse, source mutation or limit/domain restriction. The fast token has the same raw+2 admitted size; existing 4096-token/64KiB chunk targets and default 16MiB budget remain. This is a source storage argument under original admitted limits, not a heap measurement.

Preserve the original 28 control groups and their admitted 321 byte pairs. Append six bounded groups:

- All 128 ASCII characters and mixtures, keys, empty strings, slash and DEL.
- Quote/backslash/control/BMP/nonBMP/U+2028/U+2029/lone-surrogate fallback.
- Exact raw/token/cumulative/key caps and NaN/Symbol/stateful-limit coercion traces.
- 65534/65535/65536/65537-byte and 4095/4096/4097-token seams, oversized admitted tokens and late refusals.
- Getter/Proxy/two-read/dynamic-array parity across ASCII/fallback and defined/undefined transitions.
- Shared references, fresh mutation/repeated calls and unchanged zero-container/no-new-Proxy assertions.

Pin three deliberately wrong RED mutants: missing escape exclusions; accepting nonASCII with code-unit byte counting; moving/bypassing the raw precheck. Require their specific byte/refusal/trace mismatches and corrected GREEN. New exact counts must be authored and reviewed before grant; they are pending here. Source review and actual focused correctness admission precede a separate benchmark grant, using qualified ownership/failure capture and 60/75/90 clocks.

Adapt selected benchmark lines 19 and 27–40 to time exact 2529 against only the new ASCII candidate in one genuine indexed308 run. Keep streaming 12c37 as retained reader/parser/byte/purity certifier, pinned Node20.20.2, one warmup plus three alternating pairs for state and wholeRow, complete bytes/purity/FD identity and closure each pair. The recorded member has raw4228063B/state2103442B; exact SHA roles are in DESIGN.json. Preserve qualified 60/75/90 bounds and current-AK source/runtime binding. No whole-capture read/decode or full109 route belongs in this comparison.

Report both-arm weighting as (3526*stateMedianMs+1984*wholeRowMedianMs)/1000, solely a constant-early-fixture illustration. Compare paired arms within that new run, preserve all raw trials and regressions, and never compare sessions as controlled A/B. Accepted tool7232 establishes 28/321 correctness and 31.709% early improvement against994d. The old 212.33977248s proxy describes approximately one arm; exact425.467498548s two-like-arm illustration is neither measured runtime nor a lower bound.

Any feasibility account still needs both complete110-boundary arms, later growth through416, intervention contents and all small encodes/tick/save/clone/deepEqual/gzip/inflate/CRC/SHA/readback/output/guards/startup costs under shared300/active375/whole390. No cap/horizon/bounds change, omitted admission or blind retry follows a narrow win. An unfavorable or neutral weighted result keeps selected2529; no automatic repeat.

Preserve declined cache254925: 33 groups/353 pairs passed, but paired weighted timing worsened10.642868%. This fast path has no new value Map. Native sanitized-clone serialization already adds owned representation/order work and would change selected zero-container/no-Proxy controls; its separate-session result is not an A/B comparison with2529. Add neither architecture here.

Lessons: prove bytes/refusal/source-read/coercion parity before speed; count both arms and later/residual work; correct optimizations can lose timing; profiles do not establish GC causes; retain negative evidence and grant no blind retry. Exact source/evidence hashes and pending authorities are in DESIGN.json. This preparation implemented nothing and ran no tests, benchmarks, Node, game, Git, inventories or capture decode.
