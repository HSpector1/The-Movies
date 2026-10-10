# AO major lessons — update 2

This is a new immutable lesson record; LESSONS-r1.md and all AN lessons keep their original cutoffs. AN remains published at 0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4. No AO runtime, measured offending row, fullfunction acceptance or downstream completion is claimed here.

## Preserve the first meaningful failure through the whole call

Independent API review found two ways to lose the original observer Error: gameplay may swallow it and throw another Error before returning, and probe.end/reset in finally may throw while the original failure is already pending. A check only after normal return is insufficient. The shared runObserverArm helper must snapshot the first sticky observer Error before emitting or cleaning up, always attempt end then reset, and preserve that exact Error object through later failures. Without an observer failure, the original ordinary-error/cleanup precedence stays intact. Independent controls exercise this actual helper, not an imitation of its try/finally structure. API R1 STOP fe12c55a is preserved; R2 source-only review 3e976ae7 and root adoption d6f892fb establish the corrected contract, not execution success.

## A bounded output does not imply bounded diagnostic work

Implementation R1 review 0feeda79 found that checking a 4096-byte output cap after JSON.stringify and UTF-8 encoding could already have processed unbounded failed inputs. Check inputs before reconstructing the native row. The approved diagnostic-only ceilings select scalar unavailable evidence: canonical input 65536 UTF-8 bytes before parse; known scalar context 65536 encoded JSON bytes; reconstruction 524288 encoded bytes, 16384 visited nodes/properties and depth 64. Bound strings and keys before encoding; do not invoke getters or toJSON. These ceilings do not change observer admission, gameplay or the original same-Error STOP. They still require reviewed implementation and actual controls.

## A validated context can still contain extra payload

The witness validates required context fields but retains JSON-cloned extra properties. Emitting that entire object could leak raw tuple or payload data even in a short diagnostic. Require the exact allowed scalar context fields; unknown or nested extras yield unavailable. Silently dropping fields and claiming an exact reconstructed row size would also be wrong. Keep original evidence intact and decline measurements that cannot be established exactly.

## Match the producer's actual byte accounting

The witness counts the sum of each JSON row plus newline. JSON.stringify(rows) adds array brackets and separators, producing one extra byte for a nonempty array compared with that stream. R1's array-size guard could conservatively reject legitimate evidence at the exact 2 MiB boundary. Fresh R2 must sum the original per-row framing with an early bound. The exact-boundary control exists to distinguish this from a permissive cap change.

## Derivative direction and integration scope need actual proof

The typed-catch mutant is 30 bytes longer than its baseline, not shorter. An author preparation assertion assumed the wrong direction and stopped before derivative writes; preserve that failure and use byte equality/full inverses instead of intuition. A replacement targeting every finally block would also reach unrelated controls. Scope integration to the actual arm, and verify each complete forward/inverse transformation. Neither author preparation success nor static review is a runtime result.

## Publication starts a new operational protection scope

Fresh Git fetch and advertised refs still match AN, with a clean worktree, unchanged production source tree and main unmerged. The AM-to-AN transition contains exactly 2654 documentation paths. The AO guard source adapts only four config keys and the authenticated CONFIG_SHA literal from the proven original procedure; it retains the historical private baseline and all actual scan predicates. AN's older prelaunch cannot serve as current authority after publication. Source preparation is separate from review, one-time grant and an observed full guard.

The remaining source work at this cutoff is fresh diagnostic R2, independent controls and operational guard review. The concrete R1 failures remain preserved; no original limits or prior failures have been repinned away.
