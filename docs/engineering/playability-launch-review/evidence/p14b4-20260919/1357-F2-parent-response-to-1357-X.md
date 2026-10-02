# 1357-F2: parent response to 1357-X (the probe reads Re-tune, and §4.5 cannot pass the gate)

[1357-X](1357-X-p15b-wave2-probe-results.md) ran the §8 probe at HEAD b0809602. On the two p13a seeds, arm B puts 7
of 8 entered rivals at closure due by 1960 and 9 of 9 by 1980, so the gate reads Re-tune.
[1357-F](1357-F-parent-p15b-wave2-charter-adoption.md) sends a Re-tune back through
[1352-A](1352-A-p15b-corporate-condition-charter.md) §4.5 before any RED. The parent finds that no §4.5 value brings
the gate to Flag, and rules below.

## 1. Why re-tuning §4.5 cannot pass the gate

- **No rival recovers.**
  - On all three seeds, no rival whose cash reaches zero ever holds positive cash again (1357-X, the cash path). By
    2040 those rivals hold between -144.5M and -286.3M and employ nobody.
  - No arm A rival records a recovery.
  - In arm B the loan's principal buys one recovery, and the rival falls back to warning within 5-15 weeks.
- **The durations only move the date.** Every closure due falls a fixed time after the last distress entry: 25 weeks
  under today's `CORPORATE_CLOSURE_DISTRESS_WEEKS` of 26. A longer duration moves each closure later by the same amount
  and closes the same studios.
- **The values the gate would need.** Holding the other keys, the worst seed (p13a-core-causal-01, arm B) needs at
  least these values of `CORPORATE_CLOSURE_DISTRESS_WEEKS`:

| Read-out | Flag | Proceed |
|---|---:|---:|
| Closure due by 1960 | 1,358 weeks | 1,762 weeks |
| Closure due by 2000 | 2,950 weeks | 3,813 weeks |
| Closure due by 2040 | 4,433 weeks | 5,518 weeks |

  p13a-wait-control-01 needs 1,416 to 4,408 weeks for Flag. Passing all three read-outs at Flag needs about 85 years
  in distress. §4.5's reason for 26 is half a year.
- **The other keys move weeks, not decades.**
  - The warning keys and `CORPORATE_DISTRESS_SUSTAIN_WEEKS` change when distress starts, by weeks.
  - A larger loan only delays the same fall while the burn continues: arm B minus arm A is 0 at every checkpoint.
  - A loan large enough to carry a rival for decades is the automatic bailout that ruling 3 forbids.

Source: 1357-P-output.json `studios`. Each rival entered by a checkpoint closes by it when its last distress entry
plus the duration, less one week, falls at or before the checkpoint week.

## 2. What the probe measures instead

- **Cash falls with no income.** Each rival's cash drops by about one fixed cost a week from its last income to below
  zero. Most rivals spend exactly 13 weeks Strained and 13 Stable on the way (1357-X, the paths).
- **§7 saw the same stall.** [1344-V](1344-V-s7-shelving-verification.md) flags 3 and 4 measured p13a-core-causal-01
  to week 520 at 469a9547:
  - every rival evaluation was cash-blocked from week 262 at the latest;
  - no rival employed anyone by 520;
  - every rival's cash was below zero.
- **1352-A §2 already names the mechanism** (W0 §2): a rival with no staff still burns at least 38,500 a week and
  cannot shed facilities.
- **No distress entry on any seed holds two remedy routes** (1357-X). No release is ever in progress, and the loan is
  the only route.

The condition law reads this economy correctly. Any finite rule closes a rival that has stopped filming, cannot cut its
costs and has no income. The collapse comes from the rival economy, not from P15B's law.

## 3. Rulings

1. **No §4.5 re-tune is authored.** Section 1 shows that no value consistent with §4.5's reasons reaches Flag.
2. **P15B Wave 2 stays at the probe gate.**
   - No RED is staged (1357-F).
   - Wave 2 enables no transition in the live economy (1352-A §6) until a re-probe reads Proceed or Flag.
3. **Ruling 3's text does not hold on these routes.**
   - Ruling 3 requires "warnings and meaningful recovery opportunities" before failure
     ([1352-A](1352-A-p15b-corporate-condition-charter.md) §1).
   - Here the only opportunity is a loan worth 26 weeks of fixed cost. It buys about 20 weeks against a burn that never
     ends.
   - 1352-A §4.3's two-route rule fails at every distress entry.
4. **The parent's recommended route: rival recovery before Wave 2's closure.** Under the remedy families that 1352-A §1
   delegates, the parent proposes a P15B recovery charter before Wave 2 integrates. It would hold:
   - a rival cost-cutting route for when income stops. That means shedding facilities, which no verb allows today
     (W0 §2), and REDUCE_OBLIGATIONS for rivals, pulled forward from Wave 3;
   - a diagnosis of why rivals stop filming. §7's stall (evaluations cash-blocked, staff gone by 520) points at rival
     hiring and production policy, which P14 owns;
   - a re-probe under the same §8 thresholds.

   This changes the P15B wave plan and the rival economy, so the Owner rules (section 4) before anyone writes the
   charter.

## 4. Owner question 1357-Q1

On two of three seeds' natural routes, the closure law as chartered closes each rival 162-374 weeks (3-7 years) after
it enters. By 1960, 7 of 8 entered rivals are due for closure. The cause is the rival economy: a rival that stops filming has no
income and cannot cut its costs. Choose one:

- **(a) Fix rival recovery first. Recommended.** Charter rival cost-cutting and the cause of the filming stall, then
  re-probe. Wave 2 waits. This keeps ruling 3's "meaningful recovery opportunities" true and lets the industry persist,
  which the launch review needs.
- **(b) Accept the collapse.** Wave 2 integrates as chartered, and most rivals close by 1960 on these seeds. Ruling 4
  sets no minimum studio count, but ruling 3's recovery text would not hold for rivals.
- **(c) Notices without closure.** Integrate warning, distress and loans now, and hold the closure transition until
  (a) lands.

Until the Owner answers, the parent keeps P15B Wave 2 at the probe gate and works the rest of the queue:
- slice B;
- P15A.2 slice 2a;
- the P15A.1, P15A.2 and P15C Wave 2 recorded REDs.
