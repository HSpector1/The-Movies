# 92 — independent joint-trace finite-domain discriminants

2026-09-20. PAPER MATRIX ONLY; no test implementation, execution, probe, typecheck,
source inspection of the kernel, Git operation or engine-history claim. Parent
reported published clock checkpoint `c04f4af500c37c726fc7b292db7fac2050ee04d9`.
Read complete frozen89/90, original49/56, actual installed57/70 tests, and—after
explicit parent release—the complete frozen91. Did not inspect mutable91.
91 is awaiting independent93 review; exact executable test authoring is gated
on its settled interface. Parent accepted93's effective-horizon correction for
forthcoming94; that specific paper discriminant is included below. This matrix
invents no further API or gameplay policy.

## Literal notation and common facts

All facts below are DETACHED MATHEMATICAL fixtures, not fabricated Production,
save, release, employment or outcome records. A trace is one exclusive whole
execution; its entire ledger applies even where no event receives credit.

Unless overridden: now `(0,0)`, horizon40, issuer `local`, target person T lead,
unbound count X1, window[0,40), hence B2; no priors/debits; all coverage complete;
full governed limits32/64/1024/200000/220; preparation work0. All displayed weeks
mean `(week,0)` except an explicitly written step. `E` means existing picture,
`F` means future picture, `N` means null-take picture, `BG` means non-picture
background. For an ordinary take at t, person holds are[t−1,t+1); complete cast
contains three distinct people, with globally distinct filler people unless
shown. Resource holds, where supplied, are exact slot intervals, not just names.
Every row has distinct occurrence identity/nonempty owner facts; variants keep
the same physical path, issuer and existing flag, and occur only once per trace.
Per-picture hold/replacement arrays are empty; all occupancy is trace-level.

Profile notation `(u; 10:a,18:b)` means existing prior/debit units u with cumulative
units a at10 and b at18. Cuts are the UNION of existing take boundaries across
all traces, including unchosen variants, with zero entries retained. Credits are
listed by demand/person/path/actual slot, not by implementation search order.
Statuses below use49/91's existing literal status/reason vocabulary; none is
target-specific BROKEN or beneficiary selection authority.

## Bounded matrix

| # | Literal finite domain / contrast | Paper expectation and discriminator |
|---|---|---|
| 1 | Trace A: E P/T-lead take10 plus BG Q. Trace B: BG P plus F Q/T-lead take24. Both keep P existing and Q future across row kinds; each trace has its own lawful complete ledger. | `PROVEN_FRAGILE/achievableProbeFailed`, optimum `(0;10:0)`. Each trace has X1, neither has B2. Count proof names ONE trace, both executed paths, only its one credited picture. Free-mixing P+Q would wrongly certify. Variant: X2 makes the complete joint count `PROVEN_IMPOSSIBLE/jointOfferOnly`; no trace has two T events. |
| 2 | Now10/window[15,40). Fixed F/T hold[8,40), replaceable from10; fixed F/stage0 same interval. Trace contains N F, certified person release14 and stage suffix release12; BG W has a disjoint real writing hold[10,16). E G takes18 (T lead/A antagonist/B support), people[15,22), stage0[15,20), Post0[20,22). F Q takes28 (T lead), people[25,32), stage0[25,30), Post0[30,32). F continuation Post0[12,14); immutable F1/F2 holds[8,14), and another owner's stage1 hold[10,40) survive. Priors A FLEX1, B ANY1, window[15,40). | `CERTIFIED_ACHIEVABLE`, X1/B2, optimum `(2;18:2)`. Exact credits: prior A/G/antagonist, prior B/G/support, target G/lead and Q/lead. Executed paths include F, W, G, Q; credited pictures are only G and Q. Full effective ledger includes both replaced F IDs, all immutable fixed IDs and EVERY trace-added ID. F and W earn zero event/profile/target credit. This transfers70's nonempty replacement proof into compulsory trace semantics, without making selection of F/W a credit decision. |
| 3 | Smaller writing-release domain: now10/window[15,30), fixed W/T[8,30), replaceable from10; BG W certifies newUntil14; F G/T lead take18, person hold[15,22), no spare. Contrast a separate lawful no-release domain: W retained to30 and no G event. | Release domain: `PROVEN_FRAGILE/achievableProbeFailed`, optimum `(0; no cuts)`, credits only G while proof retains BG W/H. No-release complete domain: `PROVEN_IMPOSSIBLE/jointOfferOnly`. Add an immutable OTHER-owner T hold[15,19) to the claimed G-executing trace: input Error because its WHOLE ledger conflicts; it must not disappear when W/other activity is uncredited. Wrong replacement owner, absent owner path, duplicate replacement, prefix shortened before10, or replacement of immutable hold: input Error. |
| 4 | Now10, E K has T lead, known take18, `personRelease:null`; compulsory T occupancy[10,40), no earlier release certified, no second T event. Other cast holds also remain truthfully represented. Domain is explicitly complete within40: no legal earlier-release choice is omitted; the actual release AFTER that interval is not asserted. Horizon contrast: raw horizon20 but target due40 (or a local prior due40) still computes H40; foreign source due60 alone does not extend H because tokens normalize to target. | Count credit K survives: `PROVEN_FRAGILE/achievableProbeFailed`, `(0;18:0)`. The witness retains K and H-clipped hold without claiming release at40. Raw20 must not clip occupancy at20 and invent freedom at30. A purported same trace adding T's G hold[25,30) is input Error, not a guessed reuse date. If completeness of possible earlier releases is UNKNOWN instead, failed B is `UNCERTIFIED`, not FRAGILE. This separates a known take from an unknown release and from missing future-choice coverage. |
| 5 | Prior A LEAD1. Early trace: E P takes10 with A lead, BG R, BG Q; T has no lead event. Later trace: E P takes10 with T lead, E R takes18 with A lead, F Q takes24 with T lead. Ledgers lawful; P/R/Q physical identities retain their existing flags across variants. | Global optimum `(1;10:1,18:1)`. Later's local optimum is only `(1;10:0,18:1)`. Protected X fails, but unoptimized later trace pays prior A/R and target T/P: `PROVEN_FRAGILE/priorPathProtection`. Neither a local ACHIEVABLE result from Later nor an IMPOSSIBLE result from Early is the global answer. Count proof must identify Later; it does not pretend to preserve the optimum. |
| 6 | Prior A FLEX1. Bad trace has E P10 with A lead/T support; Good has SAME E P10 with T lead/A antagonist plus F Q24/T lead. Add a third lawful trace with A paid on E R12 and no target lead. All variants are separate whole trajectories with complete ledger; opaque names intentionally sort Bad before Good. | Both Bad and Good attain `(1;10:1,12:1)` on the COMMON10/12 index; third trace attains `(1;10:0,12:1)`. `CERTIFIED_ACHIEVABLE` must remain possible through Good: prior A/P/antagonist, T/P/lead and T/Q/lead. Never discard an equivalent optimum because its ID sorts later. The12 zero/retained-cut position exists even though Good has no R take. No specific winning trace is asserted when multiple equally valid certificates exist. |
| 7 | Same-witness family: one trace has only E P10/T; another only F Q20/T and F R30/T, with the other physical paths represented as BG where relevant. Separate slack pair: one lawful trace E P22/T + F Q28/T, target due30, then replace22 by23 in a separately complete domain. Bound variant count4/actualQualified3 keeps X1/B2. Large-count variant one trace E takes8/16/24/32 and F takes40/48, target due64/count4. | First pair is FRAGILE/achievableProbeFailed with `(0;10:0)`—B in the future-only trace cannot borrow existing P from the other. Slack22 gives CERTIFIED, slack23 FRAGILE; profiles are zero at the actual existing cut. Bound remainder uses1, not4. Large count requires B6; all six events CERTIFY with zero profile at8/16/24/32, removing48 is FRAGILE. Every X/B/slack condition is checked against the SAME chosen trace and assignment. |
| 8 | Prior A LEAD1; foreign T remainder1, original source[39,60) overlaps target[0,40). One lawful trace: E P10 cast A lead/T antagonist/U support; E R20 T lead; F Q28 T lead. Local people holds are disjoint across these times. | `CERTIFIED_ACHIEVABLE`, optimum `(2;10:2,20:2)`: local prior A/P/lead and foreign token T/P/antagonist; target T/R/lead and T/Q/lead. Token normalizes to target window and withholds FULL1 despite only one-week overlap; no foreign fulfillment is asserted. Remove R while retaining lawful context: FRAGILE/achievableProbeFailed, `(2;10:2)`. Remaining2 instead needs two separate local T paths for token, yielding profile `(3;10:2,20:3)` and only Q for X, hence FRAGILE. No same-person/path token+target double count; the token does not consume A's seat. |
| 9 | Use case8 with allOwnerTraces incomplete but complete claims/holds and GLOBAL existingCalendars; known P10 saturates both prior units at earliest cut, and the R/Q B witness exists. Then mark existingCalendars incomplete because omitted future work might change an existing calendar. Zero-prior contrast: E P10/T + F Q24/T in one lawful trace, complete claims/holds but both calendar/trace flags incomplete. | First can CERTIFY via saturated FULL prior upper profile `(2;10:2,20:2)`; second is `UNCERTIFIED/domainIncomplete`, even with observed B. Zero-prior contrast CAN CERTIFY: every global prior score is identically zero, including unobserved cuts; don't invent their timestamps. For incomplete FAILED X or B without a sound independent bound, require UNCERTIFIED; only complete lawful count failure proves IMPOSSIBLE. Missing claims/holds forbids these positive certificates. |
| 10 | Two lawful traces, each with one picture, share a target and one prior: global rows=2 headers+2 paths=4, claim rows=2, units=B2+prior1=3. Separately:1025 empty trace headers;1024 headers plus one path; or1023 headers plus one BG path. Preparation work set to the whole allowed work budget. | Lower domain cap3 must return `UNCERTIFIED/sizeLimit`; row cap4 must not fail merely because demands were multiplied per trace. Default first two oversized cases exceed1024; third is exactly1024 and must not fail THAT row cap (it may still fail count/work). Null/BG rows cost exactly one, not zero. At full preparation budget require workLimit/workUsed==limit before new work. No fresh allowance/profile per trace and no hidden replay outside preparation accounting. |
| 11 | Reorder the nonempty case2 trace ledger and extend it with at least one second lawful exclusive variant: reverse traces, picture/BG rows, fixed holds, trace replacements, additional holds, prior/debit collections, masks, omissions and canonical fact-reference collections. Test normal governed work and binding caps1/64/2048; retain nonempty replacement/additional arrays and multiple immutable holds. | Entire result equality INCLUDING trace identity/proof arrays, profile, reason, omissions and workUsed; deep input equality/freeze. Only prescribe normalization exhaustion where a literal string/scalar lower bound proves it (e.g. one4096-character fact reference at cap2048), otherwise compare actual cap disposition without inventing a work threshold. Canonical ordering must not yield a lucky early certificate or erase the compulsory uncredited rows. |
| 12 | Structurally malformed mathematical probes: mixed top-level optional alternatives; wrong mode/tag; untagged or wrong-trace child; duplicate trace/occurrence identity; duplicate physical path within a trace including script/film alias; inconsistent issuer/existing flag across variants; picture row with per-event holds/replacements; BG with cast/event/release fields; cross-path replacement; duplicate added/fixed hold IDs. | Input Error, not gameplay IMPOSSIBLE or a save refusal. Legitimate same physical path across EXCLUSIVE traces is allowed and never sums into two credits in one witness. Reusing conditional additional-hold ID across DIFFERENT traces is allowed: ledgers are never merged. Original49 entry and57/70 optional-alternative semantics remain separately unchanged. |

## Independent-check and scope boundary

Future executable tests should join each returned trace identity back to exactly
one literal input trace, derive its mandatory ledger from fixed facts plus that
trace's replacements/additions, and check ALL executed paths/hold IDs independently
of credited pictures. Check actual cast slot/window, one person/path/credit,
exact per-demand units, selected-trace boundaries, and the paper profile above.
That is a witness checker, not a copied optimizer or an implementation-output
oracle. No exact preferred ID among equivalent certificates is legislated.

These cases discriminate the representation/global-proof obligations. They do
NOT construct the actual A/W/B managed-priority trace, queue lawful pictures,
prove branch-local sound locks/Set wear/setup replay, or certify the future owner
producer's completeness/preparation accounting. Those remain engine-backed adapter
tests under separate authority. Source scope was only requirements and existing
independent tests; no mutable solver or runtime inspected. Next: independent93
interface disposition, then parent-scoped test draft/install/actual RED.
