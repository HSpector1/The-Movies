# 1171-A — Current45 capture source handback

Frozen source preparation at actual HEAD `b5de9f9e6fba9964565b8b5e1039259b1666a3a6`, under [1170-A](1170-A-p3-bridge-runtime-plan.md), capture-only [1170-B](1170-B-p3-current45-capture-plan-review.md) and overriding [1170-C](1170-C-p3-bridge-parent-adoption.md). No project modules were evaluated, no compiler/test/gameplay ran, no capture exists, and no index/commit or consumed-source changes were made by this author. Only these new docs sources/manifest and this handback were written.

| File | Bytes | SHA256 |
|---|---:|---|
| 1171-p3-current45-capture.config.ts | 509 | `c0b42578cfd6056514bc225e4eb58eaf08b1a6d2f7f030f9807634e85aa8fac9` |
| 1171-p3-current45-capture.test.ts | 18576 | `561f18ccaf6764ae0fafbe4f1f1357789dc6f690cf6a72835dc6251dcf2eb08d` |
| 1171-p3-current45-capture.tsconfig.json | 202 | `d5e0548368ada03baa5bf760ff2d5f505dd26639f840b6c98dfec7e8d2117cd2` |
| 1171-p3-current45-source-manifest.json | 303117 | `25cf7c6b98ca157916c81545d9057e9d427e93a932660eb00dbdfaaf0d4801be` |

The source manifest pins exactly 1672 consumed files (114,805,157 bytes), the three harness files and A/B/C authority docs, plus the exact created-week0 manifest/gzip/raw input. Its consumed scope is the recorder scope with explicit additional `tsconfig.src.json`. It retains actual preparation HEAD as provenance; a later docs-only published execution HEAD is allowed only with the exact same consumed list/bytes and manual input pins. Parent supplies that actual execution HEAD and this exact source-manifest hash. The manifest does not pretend its own hash can be circularly embedded; its external pin below closes that boundary.

The helper remains 78,674 B / `389112bde75ccaab9e2d155a1df6e6dc279b78c7d6d531a582b04f27be5fba83`; the entire existing16-leaf test remains 77,197 B / `3371570a015bcc3723ec7d6f4d85f8207bbb5cba9458e0036e538037736b455d`. No statement, timeout, route, predicate, action, pin or proposal changed in either. All production and prior fixtures are unchanged.

## Parent invocations after independent source review and publication

Repository-root compiler, reserved1172:

```sh
node_modules/.bin/tsc --noEmit --listFiles -p docs/engineering/playability-launch-review/evidence/p14b4-20260919/1171-p3-current45-capture.tsconfig.json
```

Require config/test and unchanged helper in the actual compiler graph. Parent records the four source artifact hashes above before and after compilation because ordinary recorder scope excludes docs. Root-only noEmit would not qualify this harness.

Sole capture, reserved1173 (replace the explicit HEAD placeholder with actual published identity):

```sh
P3_CAPTURE_EXPECTED_HEAD=<actual-published-execution-HEAD> P3_CAPTURE_SOURCE_MANIFEST_SHA256=25cf7c6b98ca157916c81545d9057e9d427e93a932660eb00dbdfaaf0d4801be node_modules/.bin/vitest run --config docs/engineering/playability-launch-review/evidence/p14b4-20260919/1171-p3-current45-capture.config.ts
```

Use the fixed-source recorder around that invocation; passing both environment variables to the recorder process preserves them in its child. The explicit E config selects one named Node test, fixed60,000ms timeout/retry0/fileParallelismfalse. Installed Vitest searches the explicit config directory for a workspace, so the root workspace/other16 test bodies are not selected. No alternative config, selector, repeated attempt or timeout adjustment is authorized by this handback.

## Actual bounded behavior and guards

Only `at45()` is called, exactly once, inside real Vitest context. It retains the fixed created0 → managedEmpty8 → ready10 → cases45 prefix. Empty initial caches and counters are mandatory. Completion requires exactly45 player calls and zero outcome/lifecycle/rival calls, only those four completed caches, week45, actual subjects0006/0007 and their absence of current retirement records, actual0→52 contracts, public cases40→52 joined to unique stored expiry rows, original entry-week0 provenance/entrant anchors, no own player proposal for those subjects, and two actual Ready/unlinked c-00/c-01 scripts. No global empty-retirement or empty-rival-promise premise is imposed.

The producer adds no explicit quote/proposal/attachment/binding outside the unchanged prefix. Ordinary automatic market effects are preserved, including any automatic rival P3 work; the inherited week8 P1/P2 read marker remains. Public full39 admission, canonical strict/public roundtrips, whole-state/RNG purity, bounded lossless gzip and exact source/index/input guards precede completion.

Guards compare actual execution HEAD, raw Git index bytes, staged entries, exact tracked consumed path/hash list, empty consumed diff and no untracked consumed paths; docs/config/test/local-tsconfig/source-manifest and immutable input identities also remain exact. Source-manifest hash is externally supplied and recorded. Source/input guards run before work, before output creation, after persisted gzip and before the final completion-manifest write. Parent recorder independently closes the entire process; both proofs are required.

Only two exclusive outputs are permitted in a never-reused new `E/1171-p3-current45-capture/` directory:

- `genuine-v39-p3-market-week45.json.gz` (raw ≤16MiB, gzip ≤16MiB);
- `MANIFEST.json` (≤1MiB), written last after all gameplay/proofs/persisted-gzip/source guards, with actual lineage, inputs, compact source before/after, counters, identities and facts.

The manifest is the final authoritative write; no later artifact check can silently leave a qualified PASS after failing. Complete qualification still requires matching output bytes and successful fixed-source parent closure. On any exception, emit bounded first cause/counters/guard failure/known writes and retained output names, throw the original failure, and preserve incomplete own outputs without cleanup or reuse. The producer never edits an input, funds a world, changes a capacity, searches another seed or retries. An interrupted or failed capture remains unqualified even if partial files exist.

The new45-call capture adds explicit preparation work:816 core +12 Bridge +2 outgoing preservation +45 capture =875 declared ceiling. Later Bridge tests will read this new artifact only after actual success/review/publication, using measured pins. Existing207 setup gap, fixed-rival failure, remaining P3 matrix obligations and Unity/native deferral are unchanged. This handback freezes executable source readiness only, not a captured positive.
