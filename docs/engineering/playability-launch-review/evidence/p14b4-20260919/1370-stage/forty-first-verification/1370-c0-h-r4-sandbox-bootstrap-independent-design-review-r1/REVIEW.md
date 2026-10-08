# Independent design review: bootstrap sandbox for profile generation

Decision: **ACCEPT_DESIGN_ONLY_UNRUN**. This adopts the proposed inline `sandbox-exec -p` bootstrap boundary as the correction route for sandbox r3 REFINE receipt `66b6d7999737a38da2125637fccc875d8946d4373555172bb67949cb67d3f6f3`. It does not approve any generator source, real policy, H process, or game acceptance.

The disposable fixture uses the intended process shape: `sandbox-exec -p` starts Python; Python opens a held output FD; the test parent moves that directory under a protected stand-in; the FD-relative create is denied with EPERM, leaving no protected file. The ordinary unmoved create succeeds. I inspected the fixture and its recorded evidence; the evidence is limited to this host and synthetic paths.

Before execution, freeze and independently review exact bootstrap policy construction, full protected receipt/source/evidence set, output location, inline argument cap, generator argv and source hashes, bounded parent/descendant supervision, no inherited writable output FD, same-policy moved-parent and ordinary REDs, and actual final-profile bytes/deny-canary. No unsandboxed fallback. The design retains r13 STOP and does not resolve H root drift. A non-adversarial race waiver is not adopted.
