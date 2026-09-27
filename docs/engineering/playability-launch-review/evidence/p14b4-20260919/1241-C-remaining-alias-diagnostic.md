# 1241-C — Corrected compatibility compiler: one remaining annotation error

The fresh1241b Bridge compiler consumed published99b80bc50ecb45fa3804406416425434769d7c7f and failed child2/fixedSource in27.966s (19:52:49.160–19:53:17.126 UTC). All pre/post source, manual, raw index and NUL stage-entry guards agree. Full raw485bytes/SHA2567de54c4532cecd7191731fe68a821967cb377026c4f6d83f9bd68b3bdbd14997 is retained unchanged. Original1241 seven diagnostics remain separately retained.

The only diagnostic is TS2322 at promise-command222: the pending-quote caller-mutation control changes its actual P1 family to DIRECTING_COUNT after quoting, while1242 narrowed its inferred local type to P1. The direct mutation and retained pending quote assertions remain valuable.1242-D separately stages an explicit public Payload local annotation, with no runtime or expected-value changes. This supersedes the parent's provisional spread attribution; the full context shows a direct property assignment. Parent will integrate the independently reviewed annotation and1236 new test source, publish, then compile that concrete source before runtime execution.

These failed compilers neither negate the separate1243–46 PASS results on39d95462 nor qualify the changed Bridge test graph. No new Bridge runtime, component, full-suite, native or endurance result is claimed.
