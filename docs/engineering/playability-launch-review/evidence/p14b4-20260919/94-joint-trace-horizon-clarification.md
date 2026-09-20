# 94 — joint-trace horizon and occupancy clarification

2026-09-20. Coordinator adoption of the single refinement in independent93.
This supplement controls the ambiguity named below; frozen91 is preserved
unchanged. All other91 types, proof obligations, accounting and old49 semantics
remain in force. This is an implementation contract, not execution evidence.

## Effective analysis boundary

Use the inherited49 effective horizon:

`H = max(input.horizonEndWeek, target.window.dueWeekExclusive,
         ...relevantLocalPrior.window.dueWeekExclusive)`.

Relevant local priors are the admitted prior claims, not foreign source windows.
A foreign debit's original source due does not extend H after its planning
window is normalized to the target window. The same H governs the existing
220-week span limit and the new trace mode's unknown-release occupancy. In91's
nullable-release paragraph, read `(H,0)`, not the raw `(horizonEndWeek,0)`.

The producer supplies truthful explicit intervals. Clipping a producer's retained
occupancy at H is NOT an actual release, does not make `personRelease` nonnull,
and cannot authorize a fixed-hold suffix replacement. The lower trace API never
clips, stretches, repairs or synthesizes any supplied hold.

## Mechanically checked unknown-release occupancy

For each joint-trace picture whose `personRelease` is null, define
`start = maxBoundary(input.now, picture.greenlight)` and `end = (H,0)`.
If start < end, EACH of its three actual cast people must have continuous
coverage of `[start,end)` in that trace's effective compulsory ledger by person
holds with `ownerPathKey === picture.pathKey`.

Effective fixed holds, their lawful replacements, and additional holds all count.
Adjacent segments may compose. A gap, missing tail, different-path hold or
null-owner-path hold does not establish this picture's required occupancy.
A missing required interval is an input Error when validated, not an inferred
release, gameplay IMPOSSIBLE or a repaired certificate. Ordinary compulsory
ledger overlap checks remain independent requirements.

Validation remains governed by the existing shared work budget. Immediate
preparation exhaustion or inability to finish validation within that budget
returns work-limit uncertainty; this guard does not authorize unbounded work
after exhaustion. It applies only to the explicit unknown-release pictures in
the NEW trace mode. It does not change optional49 inputs, attach film fields to
background paths, or purport to verify owner execution from provenance strings.

## Independent discriminants

With raw horizon20 and target due40, H is40. An unknown-release picture's
path-owned cast holds ending20 fail coverage even with NO later reuse. Separate
holds covering through40 satisfy that guard, but a second execution occupying
the same person at30 conflicts with the compulsory ledger. These are separate
negative tests, so overlap must not conceal a missing-tail bug. Include an
internal gap and lawful adjacent segments. A local prior due40 also extends H;
a foreign source due60 alone does not.

Known first-take credit remains usable with unknown actual release, subject to
the complete compulsory ledger and91's global coverage/proof requirements.
Nothing in this clarification certifies omitted owner choices or permits a
negative completeness claim where those choices are unknown.

Reviewed input91 SHA256:
`7c0a75a8ce78fcd4f4e590540db875e542fa272d8a7949c5afab1f8ba424f7f7`.
Independent93 SHA256:
`1acb985cb8c19ccbb3476fdb1f634c72ff945291b72aa15b85d61904f8c62cdc`.
Next gate: bounded94 review, then independent executable trace tests, recorded
missing-entry RED, and one-writer shared-kernel extension. Actual owner replay
and live P2 integration remain separate subsequent implementation work.
